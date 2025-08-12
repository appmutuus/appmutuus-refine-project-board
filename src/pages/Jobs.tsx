
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardHeader } from '@/components/DashboardHeader';
import { JobCard } from '@/components/JobCard';
import { useJobs } from '@/hooks/useJobs';

const Jobs = () => {
  const { jobs, loading, applyForJob, recordJobView } = useJobs();
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (selectedJobType !== 'all') {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedCategory, selectedJobType]);

  const handleApply = async (jobId: string) => {
    await applyForJob(jobId, 'Ich interessiere mich für diesen Job!');
  };

  const handleViewJob = async (jobId: string) => {
    await recordJobView(jobId);
    console.log('View job:', jobId);
    // In a real app, this would navigate to job details page
  };

  const categories = [
    'Haushalt',
    'Garten',
    'Umzug',
    'Reparatur',
    'Einkaufen',
    'Tierpflege',
    'Sonstiges'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 scroll-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Jobs finden</h1>
            <p className="text-gray-400">Entdecken Sie interessante Aufgaben in Ihrer Nähe</p>
          </div>
          
          <Button
            onClick={() => window.location.href = '/jobs/new'}
            className="mt-4 sm:mt-0 btn-futuristic glow-blue hover-lift"
          >
            <Plus className="w-4 h-4 mr-2" />
            Job erstellen
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6 card-futuristic hover-lift glow-blue scroll-slide-left">
          <CardHeader>
            <CardTitle className="text-white flex items-center hover-glow">
              <Filter className="w-5 h-5 mr-2 text-blue-400" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nach Jobs suchen..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Job-Typ" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="good_deeds">Good Deeds</SelectItem>
                  <SelectItem value="kein_bock">KeinBock Jobs</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="btn-futuristic hover-lift"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedJobType('all');
                }}
              >
                Filter zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-blue scroll-slide-left delay-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 floating">{filteredJobs.length}</div>
              <div className="text-sm text-gray-400">Gefundene Jobs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-orange scroll-slide-left delay-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 floating">
                {filteredJobs.filter(j => j.job_type === 'good_deeds').length}
              </div>
              <div className="text-sm text-gray-400">Good Deeds</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-green scroll-slide-left delay-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 floating">
                {filteredJobs.filter(j => j.job_type === 'kein_bock').length}
              </div>
              <div className="text-sm text-gray-400">KeinBock Jobs</div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-blue scroll-fade-in">
            <CardContent className="p-8 text-center">
              <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4 floating" />
              <h3 className="text-lg font-medium text-white mb-2">Keine Jobs gefunden</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedCategory !== 'all' || selectedJobType !== 'all'
                  ? 'Versuchen Sie andere Suchkriterien'
                  : 'Aktuell sind keine Jobs in Ihrer Nähe verfügbar'
                }
              </p>
              <Button 
                onClick={() => window.location.href = '/map'} 
                className="btn-futuristic glow-blue hover-lift"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Karte erkunden
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <div key={job.id} className={`scroll-scale-in delay-${(index % 9 + 1) * 100}`}>
                <JobCard
                  job={job}
                  onApply={handleApply}
                  onView={handleViewJob}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-8 scroll-fade-in delay-500">
            <Button variant="outline" className="btn-futuristic hover-lift">
              <Clock className="w-4 h-4 mr-2" />
              Mehr Jobs laden
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Jobs;
