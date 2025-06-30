
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  job_type: 'good_deeds' | 'kein_bock';
  budget?: number;
  karma_reward?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  status: string;
  assigned_to?: string;
  estimated_duration?: number;
  due_date?: string;
  images?: string[];
  requirements?: string[];
  created_at: string;
  updated_at: string;
}

interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  message: string;
  status: string;
  created_at: string;
}

export function useJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchMyJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching my jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
    }
  };

  const createJob = async (jobData: Partial<Job>) => {
    try {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          creator_id: user.id,
          ...jobData,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action: 'job_created',
          description: `Job "${jobData.title}" erstellt`,
          metadata: { job_id: data.id },
        });

      await fetchJobs();
      await fetchMyJobs();

      toast({
        title: "Job erstellt",
        description: "Ihr Job wurde erfolgreich veröffentlicht!",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const applyForJob = async (jobId: string, message: string = '') => {
    try {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          message,
        });

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          action: 'job_applied',
          description: `Auf Job beworben`,
          metadata: { job_id: jobId },
        });

      await fetchApplications();

      toast({
        title: "Bewerbung gesendet",
        description: "Ihre Bewerbung wurde erfolgreich eingereicht!",
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

  const updateJobStatus = async (jobId: string, status: string, assignedTo?: string) => {
    try {
      if (!user) throw new Error('Not authenticated');

      const updateData: any = { status };
      if (assignedTo) updateData.assigned_to = assignedTo;

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
        .eq('creator_id', user.id);

      if (error) throw error;

      await fetchJobs();
      await fetchMyJobs();

      toast({
        title: "Job aktualisiert",
        description: "Der Job-Status wurde erfolgreich geändert.",
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

  return {
    jobs,
    myJobs,
    applications,
    loading,
    createJob,
    applyForJob,
    updateJobStatus,
    fetchJobs,
    fetchMyJobs,
    fetchApplications,
  };
}
