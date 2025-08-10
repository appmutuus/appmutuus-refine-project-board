import React from 'react';
import Map from './Map';
import JobSearch from './JobSearch';
import MyJobs from './MyJobs';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Jobs = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="map" className="data-[state=active]:bg-blue-600">Karte</TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-blue-600">Jobs</TabsTrigger>
            <TabsTrigger value="my-jobs" className="data-[state=active]:bg-blue-600">Meine Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <Map showHeader={false} />
          </TabsContent>
          <TabsContent value="search">
            <JobSearch showHeader={false} />
          </TabsContent>
          <TabsContent value="my-jobs">
            <MyJobs showHeader={false} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Jobs;
