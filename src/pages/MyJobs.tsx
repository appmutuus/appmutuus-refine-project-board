
import React, { useState } from 'react';
import { CheckCircle, Clock, Star, MapPin, Calendar, Filter, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DashboardHeader } from '@/components/DashboardHeader';

const MyJobs = ({ showHeader = true }: { showHeader?: boolean }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for user's jobs
  const myJobs = [
    {
      id: 1,
      title: 'Wohnung putzen',
      description: 'Komplette Wohnungsreinigung für 3-Zimmer Wohnung',
      status: 'active',
      type: 'created',
      applicants: 3,
      budget: 60,
      location: 'Düsseldorf Zentrum',
      created_at: '2024-01-15',
      due_date: '2024-01-20'
    },
    {
      id: 2,
      title: 'Hund ausführen',
      description: 'Tägliches Gassi gehen mit freundlichem Labrador',
      status: 'completed',
      type: 'applied',
      karma_reward: 30,
      location: 'Neuss Furth',
      created_at: '2024-01-10',
      completed_at: '2024-01-14',
      rating: 5
    },
    {
      id: 3,
      title: 'Gartenarbeit',
      description: 'Unkraut entfernen und Beete pflegen',
      status: 'in_progress',
      type: 'applied',
      budget: 45,
      location: 'Köln Ehrenfeld',
      created_at: '2024-01-12',
      assignee: 'Maria Schmidt'
    },
    {
      id: 4,
      title: 'Computer reparieren',
      description: 'Laptop reinigen und Software aktualisieren',
      status: 'pending',
      type: 'created',
      applicants: 1,
      budget: 35,
      location: 'Düsseldorf Bilk',
      created_at: '2024-01-16'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Aktiv', color: 'bg-blue-600' },
      completed: { label: 'Abgeschlossen', color: 'bg-green-600' },
      in_progress: { label: 'In Bearbeitung', color: 'bg-yellow-600' },
      pending: { label: 'Ausstehend', color: 'bg-gray-600' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getJobTypeLabel = (type: string) => {
    return type === 'created' ? 'Erstellt' : 'Beworben';
  };

  const filteredJobs = myJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'created' && job.type === 'created') ||
                      (activeTab === 'applied' && job.type === 'applied') ||
                      (activeTab === 'active' && ['active', 'in_progress', 'pending'].includes(job.status)) ||
                      (activeTab === 'completed' && job.status === 'completed');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  return (
    <div className={showHeader ? "min-h-screen bg-gray-900" : ""}>
      {showHeader && <DashboardHeader />}

      <div className={showHeader ? "container mx-auto px-4 py-6" : ""}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meine Jobs</h1>
          <p className="text-gray-400">Übersicht über alle Ihre Jobs und Bewerbungen</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Aktive Jobs</p>
                  <p className="text-2xl font-bold text-white">
                    {myJobs.filter(j => ['active', 'in_progress', 'pending'].includes(j.status)).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Abgeschlossen</p>
                  <p className="text-2xl font-bold text-white">
                    {myJobs.filter(j => j.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Durchschnittliche Bewertung</p>
                  <p className="text-2xl font-bold text-white">4.8</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Verdient diesen Monat</p>
                  <p className="text-2xl font-bold text-white">125€</p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Jobs suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">Alle</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-blue-600">Aktiv</TabsTrigger>
            <TabsTrigger value="created" className="data-[state=active]:bg-blue-600">Erstellt</TabsTrigger>
            <TabsTrigger value="applied" className="data-[state=active]:bg-blue-600">Beworben</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <Card 
                  key={job.id} 
                  className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-white leading-tight">
                        {job.title}
                      </CardTitle>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(job.status)}
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {getJobTypeLabel(job.type)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Erstellt: {job.created_at}
                      </div>
                      {job.due_date && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          Fällig: {job.due_date}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">
                        {job.type === 'created' && job.applicants !== undefined && (
                          <span>{job.applicants} Bewerbungen</span>
                        )}
                        {job.assignee && (
                          <span>Zugewiesen an: {job.assignee}</span>
                        )}
                        {job.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>{job.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {job.budget ? (
                          <div className="text-lg font-bold text-blue-400">{job.budget}€</div>
                        ) : job.karma_reward ? (
                          <div className="text-lg font-bold text-green-400">{job.karma_reward} Karma</div>
                        ) : null}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Eye className="w-4 h-4 mr-2" />
                          Details anzeigen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-white">{job.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-white font-medium mb-2">Beschreibung</h4>
                            <p className="text-gray-400">{job.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-white font-medium mb-2">Status</h4>
                              {getStatusBadge(job.status)}
                            </div>
                            <div>
                              <h4 className="text-white font-medium mb-2">Typ</h4>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {getJobTypeLabel(job.type)}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-white font-medium mb-2">Standort</h4>
                            <p className="text-gray-400">{job.location}</p>
                          </div>
                          {job.type === 'created' && job.applicants !== undefined && (
                            <div>
                              <h4 className="text-white font-medium mb-2">Bewerbungen</h4>
                              <p className="text-gray-400">{job.applicants} Personen haben sich beworben</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Keine Jobs gefunden</h3>
                <p className="text-gray-400">Versuchen Sie andere Filter oder erstellen Sie einen neuen Job</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyJobs;
