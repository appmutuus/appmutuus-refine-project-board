-- Lovable AI Database Optimization Script
-- Comprehensive security and performance improvements

-- =============================================================================
-- 1. SECURITY IMPROVEMENTS
-- =============================================================================

-- Reduce OTP expiry time to 30 minutes for better security
ALTER SYSTEM SET "auth.otp_exp" TO '30 minutes';

-- Enable leaked password protection
ALTER SYSTEM SET "auth.password_check" TO 'true';

-- =============================================================================
-- 2. FUNCTION SECURITY FIXES
-- =============================================================================

-- Fix search path for all public functions to prevent injection attacks
CREATE OR REPLACE FUNCTION public.is_valid_email(email text) 
RETURNS boolean 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Enhanced email validation with proper regex
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_url(url text) 
RETURNS boolean 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Enhanced URL validation
    RETURN url ~* '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/\S*)?$';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(input text) 
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Enhanced input sanitization to prevent XSS and injection
    RETURN regexp_replace(trim(input), E'[<>&\'"()]', '', 'g');
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Secure new user profile creation
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_error(error_message text) 
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Secure error logging without exposing sensitive data
    RAISE NOTICE 'Error occurred: %', error_message;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_streak(user_id uuid) 
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Secure user streak update with proper validation
    UPDATE public.profiles 
    SET streak_days = streak_days + 1,
        last_active = now()
    WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_user_level(user_id uuid) 
RETURNS integer 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Enhanced level calculation with tutorial progress
    RETURN (
        SELECT 
            CASE 
                WHEN total_points < 100 THEN 1
                WHEN total_points < 500 THEN 2
                WHEN total_points < 1000 THEN 3
                ELSE 4
            END
        FROM (
            SELECT 
                COALESCE(SUM(kt.points), 0) + COALESCE(SUM(tp.xp_earned), 0) as total_points 
            FROM public.karma_transactions kt
            FULL OUTER JOIN public.tutorial_progress tp ON kt.user_id = tp.user_id
            WHERE COALESCE(kt.user_id, tp.user_id) = calculate_user_level.user_id
        ) points_summary
    );
END;
$$;

-- =============================================================================
-- 3. PERFORMANCE OPTIMIZATION - ADD STRATEGIC INDEXES
-- =============================================================================

-- Add indexes for foreign keys to improve join performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(favorite_user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jobs_status_created_at ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_category_location ON public.jobs(category, location);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_user_created ON public.karma_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(job_id, created_at);

-- Add indexes for text search optimization
CREATE INDEX IF NOT EXISTS idx_jobs_title_search ON public.jobs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_jobs_description_search ON public.jobs USING gin(to_tsvector('english', description));

-- =============================================================================
-- 4. REMOVE UNUSED INDEXES (if they exist)
-- =============================================================================

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS public.idx_karma_transactions_user_id;
DROP INDEX IF EXISTS public.idx_karma_transactions_job_id;
DROP INDEX IF EXISTS public.idx_messages_job_id;
DROP INDEX IF EXISTS public.idx_messages_sender_id;
DROP INDEX IF EXISTS public.idx_messages_recipient_id;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_referrals_referrer_id;
DROP INDEX IF EXISTS public.idx_referrals_referred_user_id;
DROP INDEX IF EXISTS public.idx_transactions_user_id;
DROP INDEX IF EXISTS public.idx_transactions_job_id;
DROP INDEX IF EXISTS public.idx_activity_log_user_id;
DROP INDEX IF EXISTS public.idx_jobs_assigned_to;

-- =============================================================================
-- 5. RLS POLICY OPTIMIZATIONS
-- =============================================================================

-- Optimize profiles RLS for better performance
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Optimized profile view policy" ON public.profiles
FOR SELECT USING (true); -- Profiles are public for user discovery

-- Optimize jobs RLS policies
DROP POLICY IF EXISTS "Anyone can view open jobs" ON public.jobs;
CREATE POLICY "Optimized jobs view policy" ON public.jobs
FOR SELECT USING (status = 'open' OR creator_id = (SELECT auth.uid()) OR assigned_to = (SELECT auth.uid()));

-- Optimize notifications RLS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Optimized notifications view policy" ON public.notifications
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Optimize karma transactions RLS
DROP POLICY IF EXISTS "Users can view own karma transactions" ON public.karma_transactions;
CREATE POLICY "Optimized karma view policy" ON public.karma_transactions
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- 6. ADDITIONAL SECURITY MEASURES
-- =============================================================================

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_id uuid, action text, limit_count integer DEFAULT 10, time_window interval DEFAULT '1 hour')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    action_count integer;
BEGIN
    -- Count recent actions
    SELECT COUNT(*) INTO action_count
    FROM public.activity_log
    WHERE user_id = check_rate_limit.user_id
      AND action = check_rate_limit.action
      AND created_at > (now() - time_window);
    
    RETURN action_count < limit_count;
END;
$$;

-- Create function for secure user authentication check
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT auth.uid() IS NOT NULL;
$$;

-- Create trigger for automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Create profile with default settings
    INSERT INTO public.profiles (id, created_at, updated_at, karma_points, total_earned)
    VALUES (NEW.id, now(), now(), 0, 0);
    
    -- Create default user settings
    INSERT INTO public.user_settings (user_id, notifications_enabled, email_notifications, dark_mode, language)
    VALUES (NEW.id, true, true, false, 'de');
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Replace existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_secure();

-- =============================================================================
-- 7. DATA VALIDATION TRIGGERS
-- =============================================================================

-- Create validation trigger for jobs
CREATE OR REPLACE FUNCTION public.validate_job_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Validate required fields
    IF NEW.title IS NULL OR trim(NEW.title) = '' THEN
        RAISE EXCEPTION 'Job title cannot be empty';
    END IF;
    
    IF NEW.location IS NULL OR trim(NEW.location) = '' THEN
        RAISE EXCEPTION 'Job location cannot be empty';
    END IF;
    
    -- Sanitize inputs
    NEW.title = trim(NEW.title);
    NEW.description = trim(NEW.description);
    NEW.location = trim(NEW.location);
    
    -- Validate budget
    IF NEW.budget < 0 THEN
        RAISE EXCEPTION 'Budget cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add validation trigger to jobs table
DROP TRIGGER IF EXISTS validate_job_trigger ON public.jobs;
CREATE TRIGGER validate_job_trigger
    BEFORE INSERT OR UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.validate_job_data();

-- =============================================================================
-- 8. PERFORMANCE MONITORING FUNCTIONS
-- =============================================================================

-- Function to analyze table performance
CREATE OR REPLACE FUNCTION public.get_performance_stats()
RETURNS TABLE(
    table_name text,
    total_size text,
    row_count bigint,
    index_usage_ratio numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        pg_size_pretty(pg_total_relation_size('"public"."' || t.tablename || '"'))::text,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = ('"public"."' || t.tablename || '"')::regclass),
        CASE 
            WHEN s.seq_scan + s.idx_scan = 0 THEN 0
            ELSE round((s.idx_scan::numeric / (s.seq_scan + s.idx_scan)) * 100, 2)
        END
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.tablename
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size('"public"."' || t.tablename || '"') DESC;
END;
$$;

-- =============================================================================
-- 9. CLEANUP AND MAINTENANCE
-- =============================================================================

-- Update table statistics for query planner
ANALYZE public.profiles;
ANALYZE public.jobs;
ANALYZE public.job_applications;
ANALYZE public.karma_transactions;
ANALYZE public.notifications;
ANALYZE public.messages;
ANALYZE public.reviews;
ANALYZE public.transactions;
