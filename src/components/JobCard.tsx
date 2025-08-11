
import React from 'react';
import { Calendar, MapPin, Euro, Flame, User, Clock } from 'lucide-react';
import { JobTimer } from './JobTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  job_type: 'good_deeds' | 'kein_bock';
  budget?: number;
  karma_reward?: number;
  location: string;
  estimated_duration?: number;
  due_date?: string;
  status: string;
  created_at: string;
}

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onView?: (jobId: string) => void;
}

export function JobCard({ job, onApply, onView }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getJobTypeStyle = (type: string) => {
    return type === 'good_deeds' 
      ? 'bg-orange-600 hover:bg-orange-700 text-white glow-orange'
      : 'bg-green-600 hover:bg-green-700 text-white glow-green';
  };

  const getJobTypeIcon = (type: string) => {
    return type === 'good_deeds' ? <Flame className="w-4 h-4" /> : <Euro className="w-4 h-4" />;
  };

  return (
    <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-blue">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-white leading-tight hover-glow">
            {job.title}
          </CardTitle>
          <Badge className={getJobTypeStyle(job.job_type)}>
            {getJobTypeIcon(job.job_type)}
            <span className="ml-1">
              {job.job_type === 'good_deeds' ? 'Good Deed' : 'KeinBock'}
            </span>
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit border-gray-600 text-gray-300">
          {job.category}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-400 text-sm line-clamp-2">
          {job.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {job.location}
          </div>

          {job.estimated_duration && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              ca. {formatDuration(job.estimated_duration)}
            </div>
          )}

          {job.due_date && (
            <>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Bis {formatDate(job.due_date)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <JobTimer
                  startTime={new Date()}
                  duration={(new Date(job.due_date).getTime() - Date.now()) / 60000}
                  mode="countdown"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            {job.job_type === 'good_deeds' && job.karma_reward && (
              <div className="flex items-center text-orange-400 floating">
                <Flame className="w-4 h-4 mr-1" />
                <span className="font-medium">{job.karma_reward} Karma</span>
              </div>
            )}
            
            {job.job_type === 'kein_bock' && job.budget && (
              <div className="flex items-center text-green-400 pulse-glow">
                <Euro className="w-4 h-4 mr-1" />
                <span className="font-medium">{job.budget.toFixed(2)}€</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView(job.id)}
                className="btn-futuristic hover-lift"
              >
                Details
              </Button>
            )}
            {onApply && (
              <Button 
                size="sm"
                onClick={() => onApply(job.id)}
                className="btn-futuristic glow-blue hover-lift"
              >
                Bewerben
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
