
import React, { useState, useEffect } from 'react';
import { MapPin, Filter, List, Map as MapIcon, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CreateJobModal } from '@/components/CreateJobModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mock data for jobs
const mockJobs = [
  {
    id: '1',
    title: 'Einkaufen für Nachbarin',
    description: 'Wöchentlicher Einkauf für ältere Dame',
    category: 'Einkaufen',
    job_type: 'good_deeds',
    karma_reward: 50,
    location: 'Düsseldorf Altstadt',
    latitude: 51.2277,
    longitude: 6.7735,
    status: 'open',
    creator: { first_name: 'Maria', last_name: 'Schmidt' },
    distance: '0.8 km',
    estimated_duration: 60
  },
  {
    id: '2',
    title: 'Möbel aufbauen',
    description: 'IKEA Schrank aufbauen',
    category: 'Haushalt',
    job_type: 'kein_bock',
    budget: 45,
    location: 'Düsseldorf Pempelfort',
    latitude: 51.2500,
    longitude: 6.7900,
    status: 'open',
    creator: { first_name: 'Thomas', last_name: 'Weber' },
    distance: '1.2 km',
    estimated_duration: 120
  },
  {
    id: '3',
    title: 'Gartenarbeit',
    description: 'Hecke schneiden und Laub harken',
    category: 'Garten',
    job_type: 'kein_bock',
    budget: 60,
    location: 'Düsseldorf Oberkassel',
    latitude: 51.2400,
    longitude: 6.7600,
    status: 'open',
    creator: { first_name: 'Andrea', last_name: 'Müller' },
    distance: '2.1 km',
    estimated_duration: 180
  },
  {
    id: '4',
    title: 'Hund Gassi führen',
    description: 'Täglicher Spaziergang mit Golden Retriever',
    category: 'Tiere',
    job_type: 'good_deeds',
    karma_reward: 30,
    location: 'Düsseldorf Bilk',
    latitude: 51.2100,
    longitude: 6.7800,
    status: 'open',
    creator: { first_name: 'Klaus', last_name: 'Fischer' },
    distance: '1.5 km',
    estimated_duration: 45
  }
];

const Map = ({ showHeader = true }: { showHeader?: boolean }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<string>('10');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Filter jobs based on search and filters
  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesJobType = selectedJobType === 'all' || job.job_type === selectedJobType;
    const matchesDistance = parseFloat(job.distance) <= parseFloat(maxDistance);
    
    return matchesSearch && matchesCategory && matchesJobType && matchesDistance;
  });

  const handleCreateJob = (jobData: any) => {
    console.log('Creating job:', jobData);
    setIsCreateModalOpen(false);
  };

  const handleApplyForJob = (jobId: string) => {
    console.log('Applying for job:', jobId);
    // Here you would implement the application logic
  };

  const getJobTypeColor = (jobType: string) => {
    return jobType === 'good_deeds' ? 'bg-green-500' : 'bg-blue-500';
  };

  const getJobTypeLabel = (jobType: string) => {
    return jobType === 'good_deeds' ? 'Good Deed' : 'KeinBock';
  };

  return (
    <div className={showHeader ? "min-h-screen bg-gray-900" : ""}>
      {showHeader && <DashboardHeader />}

      <div className={showHeader ? "container mx-auto px-4 py-6" : ""}>
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

            {/* Distance Filter */}
            <Select value={maxDistance} onValueChange={setMaxDistance}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Entfernung" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
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
                  {job.location} • {job.distance}
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

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    von {job.creator.first_name} {job.creator.last_name}
                  </div>
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
      </div>
    </div>
  );
};

export default Map;
