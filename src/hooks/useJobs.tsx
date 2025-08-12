
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/lib/notifications';

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
  view_count?: number;
}

interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  message: string;
  status: string;
  created_at: string;
}

// Type for database job data
type DatabaseJob = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string;
  job_type: string;
  budget?: number | null;
  karma_reward?: number | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string | null;
  assigned_to?: string | null;
  estimated_duration?: number | null;
  due_date?: string | null;
  images?: string[] | null;
  requirements?: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  view_count?: number | null;
};

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

  // Helper function to transform database job to our Job interface
  const transformDatabaseJob = (dbJob: DatabaseJob): Job => ({
    id: dbJob.id,
    creator_id: dbJob.creator_id,
    title: dbJob.title,
    description: dbJob.description || '',
    category: dbJob.category,
    job_type: (dbJob.job_type === 'good_deeds' || dbJob.job_type === 'kein_bock') ? dbJob.job_type : 'good_deeds',
    budget: dbJob.budget || undefined,
    karma_reward: dbJob.karma_reward || undefined,
    location: dbJob.location,
    latitude: dbJob.latitude || undefined,
    longitude: dbJob.longitude || undefined,
    status: dbJob.status || 'open',
    assigned_to: dbJob.assigned_to || undefined,
    estimated_duration: dbJob.estimated_duration || undefined,
    due_date: dbJob.due_date || undefined,
    images: dbJob.images || undefined,
    requirements: dbJob.requirements || undefined,
    created_at: dbJob.created_at || new Date().toISOString(),
    updated_at: dbJob.updated_at || new Date().toISOString(),
    view_count: dbJob.view_count || 0,
  });

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedJobs = (data || []).map(transformDatabaseJob);
      setJobs(transformedJobs);
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
      
      const transformedJobs = (data || []).map(transformDatabaseJob);
      setMyJobs(transformedJobs);
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

  const recordJobView = async (jobId: string) => {
    try {
      await supabase.rpc('increment_job_view', { job_id: jobId });
      await fetchJobs();
    } catch (error: any) {
      console.error('Error recording job view:', error);
    }
  };

  const createJob = async (jobData: Partial<Job>) => {
    try {
      if (!user) throw new Error('Not authenticated');

      // Ensure required fields are present
      if (!jobData.title || !jobData.category || !jobData.location || !jobData.job_type) {
        throw new Error('Missing required job data');
      }

      const insertData = {
        creator_id: user.id,
        title: jobData.title,
        description: jobData.description || null,
        category: jobData.category,
        job_type: jobData.job_type,
        budget: jobData.budget || null,
        karma_reward: jobData.karma_reward || null,
        location: jobData.location,
        latitude: jobData.latitude || null,
        longitude: jobData.longitude || null,
        estimated_duration: jobData.estimated_duration || null,
        due_date: jobData.due_date || null,
        images: jobData.images || null,
        requirements: jobData.requirements || null,
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(insertData)
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

      return transformDatabaseJob(data);
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

      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        await sendNotification({
          event_type: 'job_applied',
          recipient_id: job.creator_id,
          data: { job_id: jobId, applicant_id: user.id },
        });
      }

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

      if (status === 'completed') {
        try {
          await fetch('/api/payment/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // The capture endpoint now expects a `job_id` field
            body: JSON.stringify({ job_id: jobId }),
          });
        } catch (err) {
          console.error('Payment capture failed', err);
        }
      }

      const job = jobs.find((j) => j.id === jobId);
      const recipientId = assignedTo ?? job?.assigned_to;
      if (recipientId) {
        await sendNotification({
          event_type: `job_${status}`,
          recipient_id: recipientId,
          data: { job_id: jobId },
        });
      }

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
    recordJobView,
  };
}
