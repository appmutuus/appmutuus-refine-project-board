
import React, { useState } from 'react';
import { MapPin, Filter, List, Map as MapIcon, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CreateJobModal } from '@/components/CreateJobModal';
import { useJobs } from '@/hooks/useJobs';

// Jobs are loaded from Supabase via useJobs hook

const Map = () => {
  const { jobs, applyForJob } = useJobs();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesJobType = selectedJobType === 'all' || job.job_type === selectedJobType;
    return matchesSearch && matchesCategory && matchesJobType;
  });

  const handleCreateJob = (jobData: any) => {
    console.log('Creating job:', jobData);
    setIsCreateModalOpen(false);
  };

  const handleApplyForJob = (jobId: string) => {
    applyForJob(jobId);
  };

  const getJobTypeColor = (jobType: string) => {
    return jobType === 'good_deeds' ? 'bg-green-500' : 'bg-blue-500';
  };

  const getJobTypeLabel = (jobType: string) => {
    return jobType === 'good_deeds' ? 'Good Deed' : 'KeinBock';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Jobs in deiner Nähe</h1>
            <p className="text-gray-400">Finde spannende Aufgaben oder biete deine Hilfe an</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Job erstellen
              </Button>
            </DialogTrigger>
            <CreateJobModal onSubmit={handleCreateJob} />
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nach Jobs suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="Haushalt">Haushalt</SelectItem>
                <SelectItem value="Garten">Garten</SelectItem>
                <SelectItem value="Einkaufen">Einkaufen</SelectItem>
                <SelectItem value="Tiere">Tiere</SelectItem>
                <SelectItem value="Technik">Technik</SelectItem>
              </SelectContent>
            </Select>

            {/* Job Type Filter */}
            <Select value={selectedJobType} onValueChange={setSelectedJobType}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="good_deeds">Good Deeds</SelectItem>
                <SelectItem value="kein_bock">KeinBock</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              className={`px-4 py-2 ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Karte
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              Liste
            </Button>
          </div>
          <div className="text-gray-400">
            {filteredJobs.length} Jobs gefunden
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="bg-gray-700 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Interaktive Karte</p>
                <p className="text-sm">Google Maps Integration wird hier implementiert</p>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-white leading-tight">
                    {job.title}
                  </CardTitle>
                  <Badge className={`${getJobTypeColor(job.job_type)} text-white`}>
                    {getJobTypeLabel(job.job_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {job.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-400">
                    {job.estimated_duration} Min
                  </div>
                  <div className="text-lg font-bold text-white">
                    {job.job_type === 'good_deeds' 
                      ? `${job.karma_reward} Karma` 
                      : `${job.budget}€`
                    }
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-gray-700">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApplyForJob(job.id)}
                  >
                    Bewerben
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Keine Jobs gefunden</h3>
            <p className="text-gray-400 mb-6">Versuche andere Filter oder erstelle einen neuen Job</p>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ersten Job erstellen
                </Button>
              </DialogTrigger>
              <CreateJobModal onSubmit={handleCreateJob} />
            </Dialog>
          </div>
        )}
      </main>
    </div>
  );
};

export default Map;
