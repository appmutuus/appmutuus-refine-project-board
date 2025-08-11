import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export type MissionType = 'good_deed' | 'social_challenge' | 'tutorial' | 'referral';

interface Mission {
  id: string;
  title: string;
  description: string;
  mission_type: MissionType;
  karma_reward: number;
  max_completions_per_week: number;
  photo_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserMission {
  id: string;
  mission_id: string;
  completed_at: string;
  photo_url?: string;
  verification_status: string;
  karma_awarded: number;
  mission?: Mission;
}

interface MissionWithProgress extends Mission {
  completions_this_week: number;
  can_complete: boolean;
  completed_today: boolean;
}

export function useMissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMissions();
      fetchUserMissions();
    }
  }, [user]);

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .order('karma_reward', { ascending: false });

      if (error) throw error;

      // Calculate completion status for each mission
      const missionsWithProgress = await Promise.all(
        (data || []).map(async (mission) => {
          if (!user) return { ...mission, completions_this_week: 0, can_complete: true, completed_today: false };

          // Get completions this week
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          const { data: completions, error: completionsError } = await supabase
            .from('user_missions')
            .select('completed_at')
            .eq('user_id', user.id)
            .eq('mission_id', mission.id)
            .gte('completed_at', weekAgo.toISOString());

          if (completionsError) throw completionsError;

          const completionsThisWeek = completions?.length || 0;
          const canComplete = completionsThisWeek < mission.max_completions_per_week;

          // Check if completed today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const completedToday = (completions || []).some(c => {
            const completionDate = new Date(c.completed_at);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.getTime() === today.getTime();
          });

          return {
            ...mission,
            completions_this_week: completionsThisWeek,
            can_complete: canComplete,
            completed_today: completedToday
          };
        })
      );

      setMissions(missionsWithProgress);
    } catch (error: any) {
      console.error('Error fetching missions:', error);
    }
  };

  const fetchUserMissions = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          *,
          mission:missions(*)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUserMissions(data || []);
    } catch (error: any) {
      console.error('Error fetching user missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId: string, photoUrl?: string) => {
    try {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('complete_mission', {
        user_id: user.id,
        mission_id: missionId,
        photo_url: photoUrl
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; karma_awarded?: number; message?: string };

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abschließen der Mission');
      }

      await fetchMissions();
      await fetchUserMissions();

      toast({
        title: "Mission abgeschlossen!",
        description: result.message || `Du hast ${result.karma_awarded} Karma erhalten!`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadMissionPhoto = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Note: This would require setting up Supabase Storage
      // For now, we'll return a placeholder URL
      // In a real implementation, you would upload to storage here
      
      toast({
        title: "Foto wird hochgeladen...",
        description: "Bitte warten Sie einen Moment.",
      });

      // Placeholder for actual storage upload
      // const { data, error } = await supabase.storage
      //   .from('mission-photos')
      //   .upload(fileName, file);

      // For demo purposes, no actual upload is performed
      return '';
    } catch (error: any) {
      toast({
        title: "Upload-Fehler",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getMissionTypeIcon = (type: MissionType) => {
    switch (type) {
      case 'good_deed':
        return '❤️';
      case 'social_challenge':
        return '📱';
      case 'tutorial':
        return '📚';
      case 'referral':
        return '👥';
      default:
        return '⭐';
    }
  };

  const getMissionTypeColor = (type: MissionType) => {
    switch (type) {
      case 'good_deed':
        return 'text-red-500';
      case 'social_challenge':
        return 'text-blue-500';
      case 'tutorial':
        return 'text-green-500';
      case 'referral':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return {
    missions,
    userMissions,
    loading,
    completeMission,
    uploadMissionPhoto,
    getMissionTypeIcon,
    getMissionTypeColor,
    fetchMissions,
    fetchUserMissions
  };
}