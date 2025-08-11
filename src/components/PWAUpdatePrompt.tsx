import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PWA } from '@/lib/pwa';

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    await PWA.update();
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-blue-900 border-blue-700 shadow-2xl animate-slide-down">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-blue-400" />
              Update verfügbar
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            Eine neue Version der App ist verfügbar. Aktualisieren Sie jetzt für die neuesten Features und Verbesserungen.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Jetzt aktualisieren
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Später
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PWAUpdatePrompt;