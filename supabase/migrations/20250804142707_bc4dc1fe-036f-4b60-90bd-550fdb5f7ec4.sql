-- Create enum for ranks
CREATE TYPE public.user_rank AS ENUM ('starter', 'community', 'erfahren', 'vertrauensperson', 'vorbild');

-- Create enum for mission types
CREATE TYPE public.mission_type AS ENUM ('good_deed', 'social_challenge', 'tutorial', 'referral');

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mission_type public.mission_type NOT NULL DEFAULT 'good_deed',
  karma_reward INTEGER NOT NULL DEFAULT 0,
  max_completions_per_week INTEGER DEFAULT 1,
  photo_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_missions table to track completed missions
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  photo_url TEXT,
  verification_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  karma_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, mission_id, completed_at::DATE) -- Allow same mission once per day
);

-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank public.user_rank DEFAULT 'starter';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cash_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS good_deeds_completed INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

-- Add job level restrictions to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS required_karma INTEGER DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS required_rank public.user_rank DEFAULT 'starter';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_level INTEGER DEFAULT 1;

-- Update karma_transactions table to include more context
ALTER TABLE public.karma_transactions ADD COLUMN IF NOT EXISTS mission_id UUID REFERENCES public.missions(id);
ALTER TABLE public.karma_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'manual'; -- manual, job_completion, mission, referral, etc.

-- Enable RLS on new tables
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Create policies for missions (public read)
CREATE POLICY "Anyone can view active missions" ON public.missions
FOR SELECT USING (is_active = true);

-- Create policies for user_missions (users can only see their own)
CREATE POLICY "Users can view own missions" ON public.user_missions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON public.user_missions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON public.user_missions
FOR UPDATE USING (auth.uid() = user_id);

-- Function to calculate user rank based on karma and good deeds
CREATE OR REPLACE FUNCTION public.calculate_user_rank(user_id UUID)
RETURNS public.user_rank
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_karma INTEGER;
  good_deeds INTEGER;
  user_rank public.user_rank;
BEGIN
  SELECT 
    COALESCE(karma_points, 0),
    COALESCE(good_deeds_completed, 0)
  INTO total_karma, good_deeds
  FROM public.profiles
  WHERE id = user_id;
  
  -- Calculate rank based on karma and good deeds requirements
  IF total_karma >= 1000 AND good_deeds >= 5 THEN
    user_rank := 'vorbild';
  ELSIF total_karma >= 500 AND good_deeds >= 3 THEN
    user_rank := 'vertrauensperson';
  ELSIF total_karma >= 250 AND good_deeds >= 1 THEN
    user_rank := 'erfahren';
  ELSIF total_karma >= 100 THEN
    user_rank := 'community';
  ELSE
    user_rank := 'starter';
  END IF;
  
  -- Update user's rank in profiles
  UPDATE public.profiles 
  SET rank = user_rank, updated_at = now()
  WHERE id = user_id;
  
  RETURN user_rank;
END;
$$;

-- Function to award karma points
CREATE OR REPLACE FUNCTION public.award_karma(
  user_id UUID,
  points INTEGER,
  reason TEXT,
  job_id UUID DEFAULT NULL,
  mission_id UUID DEFAULT NULL,
  transaction_type TEXT DEFAULT 'manual'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert karma transaction
  INSERT INTO public.karma_transactions (
    user_id, 
    points, 
    reason, 
    job_id, 
    mission_id,
    transaction_type
  ) VALUES (
    user_id, 
    points, 
    reason, 
    job_id, 
    mission_id,
    transaction_type
  );
  
  -- Update user's karma points
  UPDATE public.profiles 
  SET 
    karma_points = karma_points + points,
    updated_at = now()
  WHERE id = user_id;
  
  -- Recalculate and update user rank
  PERFORM public.calculate_user_rank(user_id);
  
  RETURN TRUE;
END;
$$;

-- Function to complete a mission
CREATE OR REPLACE FUNCTION public.complete_mission(
  user_id UUID,
  mission_id UUID,
  photo_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  mission_record RECORD;
  weekly_completions INTEGER;
  karma_awarded INTEGER;
BEGIN
  -- Get mission details
  SELECT * INTO mission_record
  FROM public.missions
  WHERE id = mission_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not found or inactive');
  END IF;
  
  -- Check weekly completion limit
  SELECT COUNT(*) INTO weekly_completions
  FROM public.user_missions
  WHERE user_id = user_id 
    AND mission_id = mission_id
    AND completed_at >= (now() - interval '7 days');
    
  IF weekly_completions >= mission_record.max_completions_per_week THEN
    RETURN jsonb_build_object('success', false, 'error', 'Weekly completion limit reached');
  END IF;
  
  -- Check if photo is required
  IF mission_record.photo_required AND (photo_url IS NULL OR photo_url = '') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Photo required for this mission');
  END IF;
  
  -- Insert mission completion
  INSERT INTO public.user_missions (
    user_id,
    mission_id,
    photo_url,
    karma_awarded
  ) VALUES (
    user_id,
    mission_id,
    photo_url,
    mission_record.karma_reward
  );
  
  -- Award karma if it's a good deed
  IF mission_record.mission_type = 'good_deed' THEN
    UPDATE public.profiles 
    SET good_deeds_completed = good_deeds_completed + 1
    WHERE id = user_id;
  END IF;
  
  -- Award karma points
  PERFORM public.award_karma(
    user_id,
    mission_record.karma_reward,
    'Mission completed: ' || mission_record.title,
    NULL,
    mission_id,
    'mission'
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'karma_awarded', mission_record.karma_reward,
    'message', 'Mission completed successfully!'
  );
END;
$$;

-- Function to check if user can access a job level
CREATE OR REPLACE FUNCTION public.can_access_job(
  user_id UUID,
  job_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_karma INTEGER;
  user_rank public.user_rank;
  job_required_karma INTEGER;
  job_required_rank public.user_rank;
BEGIN
  -- Get user stats
  SELECT karma_points, rank INTO user_karma, user_rank
  FROM public.profiles
  WHERE id = user_id;
  
  -- Get job requirements
  SELECT required_karma, required_rank INTO job_required_karma, job_required_rank
  FROM public.jobs
  WHERE id = job_id;
  
  -- Check if user meets requirements
  RETURN user_karma >= job_required_karma AND user_rank >= job_required_rank;
END;
$$;


-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();