
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Play, Pause, Book, Clock, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { useTutorial } from '@/hooks/useTutorial';

interface LessonStep {
  title: string;
  content: string;
  tips: string[];
  image?: string;
}

interface LessonData {
  title: string;
  description: string;
  duration: string;
  xp: number;
  steps: LessonStep[];
}

const TutorialLesson = () => {
  const navigate = useNavigate();
  const { categoryId, lessonId } = useParams();
  const { completeLesson, isLessonCompleted } = useTutorial();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Mock lesson data - in a real app this would come from an API
  const lessonData: Record<string, LessonData> = {
    'dashboard-basics': {
      title: 'Dashboard Overview',
      description: 'Lernen Sie die Grundfunktionen des Dashboards kennen',
      duration: '5 Min',
      xp: 50,
      steps: [
        {
          title: 'Willkommen im Dashboard',
          content: 'Das Dashboard ist Ihr Kontrollzentrum. Hier sehen Sie alle wichtigen Informationen auf einen Blick.',
          image: 'http://mutuus-app.de/assets/logopng.png',
          tips: [
            'Das Dashboard zeigt Ihre aktuellen Stats',
            'Neue Jobs werden hier prominent angezeigt',
            'Ihr Karma und Guthaben sind immer sichtbar'
          ]
        },
        {
          title: 'Navigation verstehen',
          content: 'Die Hauptnavigation ermöglicht es Ihnen, schnell zwischen verschiedenen Bereichen der App zu wechseln.',
          tips: [
            'Klicken Sie auf "Jobs" um verfügbare Aufträge zu sehen',
            'Unter "Karte" finden Sie Jobs in Ihrer Nähe',
            'Ihr Profil können Sie unter "Profil" bearbeiten'
          ]
        },
        {
          title: 'Wichtige Metriken',
          content: 'Verstehen Sie, was die verschiedenen Zahlen und Statistiken bedeuten.',
          tips: [
            'Karma Punkte zeigen Ihre Hilfsbereitschaft',
            'Guthaben ist Ihr verdienter Betrag',
            'Streak zeigt Ihre Aktivitätskette'
          ]
        },
        {
          title: 'Erste Aktionen',
          content: 'Jetzt können Sie Ihre ersten Schritte in der App machen.',
          tips: [
            'Schauen Sie sich verfügbare Jobs an',
            'Vervollständigen Sie Ihr Profil',
            'Erkunden Sie die Karte in Ihrer Umgebung'
          ]
        }
      ]
    },
    'profile-setup': {
      title: 'Profil einrichten',
      description: 'Vervollständigen Sie Ihr Profil für bessere Jobs',
      duration: '10 Min',
      xp: 100,
      steps: [
        {
          title: 'Profil-Grundlagen',
          content: 'Ein vollständiges Profil erhöht Ihre Chancen auf interessante Jobs erheblich.',
          tips: [
            'Laden Sie ein professionelles Profilbild hoch',
            'Schreiben Sie eine aussagekräftige Bio',
            'Geben Sie Ihre Fähigkeiten und Interessen an'
          ]
        },
        {
          title: 'Vertrauen aufbauen',
          content: 'Vertrauen ist das Fundament unserer Community. Zeigen Sie, dass Sie zuverlässig sind.',
          tips: [
            'Verifizieren Sie Ihre E-Mail-Adresse',
            'Fügen Sie Kontaktinformationen hinzu',
            'Sammeln Sie erste positive Bewertungen'
          ]
        }
      ]
    },
    'finding-jobs': {
      title: 'Jobs finden',
      description: 'Strategien zum Finden der besten Jobs für Sie',
      duration: '12 Min',
      xp: 150,
      steps: [
        {
          title: 'Job-Kategorien verstehen',
          content: 'Es gibt zwei Haupttypen von Jobs: Good Deeds (Karma) und KeinBock Jobs (Geld).',
          tips: [
            'Good Deeds bringen Karma und soziale Anerkennung',
            'KeinBock Jobs zahlen echtes Geld',
            'Beide Typen helfen beim Levelaufstieg'
          ]
        },
        {
          title: 'Filter effektiv nutzen',
          content: 'Nutzen Sie die Suchfilter, um Jobs zu finden, die zu Ihnen passen.',
          tips: [
            'Filtern Sie nach Entfernung zu Ihnen',
            'Wählen Sie Kategorien, die Sie interessieren',
            'Sortieren Sie nach Belohnung oder Zeit'
          ]
        },
        {
          title: 'Job-Details bewerten',
          content: 'Lesen Sie Job-Beschreibungen sorgfältig durch, bevor Sie sich bewerben.',
          tips: [
            'Prüfen Sie die geschätzte Dauer',
            'Schauen Sie sich die Bewertung des Auftraggebers an',
            'Verstehen Sie, was genau erwartet wird'
          ]
        }
      ]
    }
  };

  const currentLesson = lessonData[lessonId as string];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lessonId && isLessonCompleted(lessonId)) {
      // Lesson already completed, but allow reviewing
    }
  }, [lessonId, isLessonCompleted]);

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-900">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center scroll-fade-in">
            <h1 className="text-2xl font-bold text-white mb-4 text-glow">Lektion nicht gefunden</h1>
            <Button onClick={() => navigate('/tutorial')} className="btn-futuristic glow-blue hover-lift">
              Zurück zum Campus
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentStep + 1) / currentLesson.steps.length) * 100;
  const currentStepData = currentLesson.steps[currentStep];

  const handleNext = () => {
    if (currentStep < currentLesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (lessonId && categoryId) {
      const success = await completeLesson(lessonId, categoryId, currentLesson.xp, timeSpent);
      if (success) {
        navigate('/tutorial');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 scroll-slide-left">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tutorial')}
            className="text-gray-400 hover:text-white btn-futuristic hover-lift"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Campus
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            <Badge className="bg-blue-600 glow-blue">
              {currentLesson.duration}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card className="bg-gray-800 border-gray-700 mb-6 card-futuristic hover-lift glow-blue scroll-fade-in delay-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white text-glow">{currentLesson.title}</h1>
              <div className="flex items-center text-yellow-400 floating">
                <Star className="w-5 h-5 mr-1" />
                <span className="font-medium">{currentLesson.xp} XP</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fortschritt</span>
                <span className="text-white">{currentStep + 1}/{currentLesson.steps.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2 glow-blue" />
            </div>
          </CardContent>
        </Card>

        {/* Lesson Content */}
        {!isCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-blue scroll-scale-in delay-200">
                <CardHeader>
                  <CardTitle className="text-white flex items-center hover-glow">
                    <Book className="w-5 h-5 mr-2 text-blue-400" />
                    {currentStepData.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStepData.image && (
                    <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center hover-lift glow-blue">
                      <img 
                        src={currentStepData.image} 
                        alt={currentStepData.title}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {currentStepData.content}
                  </p>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="btn-futuristic hover-lift"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Zurück
                    </Button>
                    
                    <Button 
                      onClick={handleNext}
                      className="btn-futuristic glow-blue hover-lift"
                    >
                      {currentStep === currentLesson.steps.length - 1 ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Abschließen
                        </>
                      ) : (
                        <>
                          Weiter
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Key Points */}
              <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-green scroll-slide-right delay-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center hover-glow">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Wichtige Punkte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className={`flex items-start scroll-fade-in delay-${(index + 1) * 100}`}>
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Lesson Navigation */}
              <Card className="bg-gray-800 border-gray-700 card-futuristic hover-lift glow-purple scroll-slide-right delay-400">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Lektionsübersicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentLesson.steps.map((step, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md cursor-pointer transition-all hover-lift ${
                          index === currentStep
                            ? 'bg-blue-600 text-white glow-blue'
                            : index < currentStep
                            ? 'bg-green-600 text-white glow-green'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setCurrentStep(index)}
                      >
                        <div className="flex items-center">
                          {index < currentStep && (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          {index === currentStep && (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          <span className="text-sm font-medium">{step.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <Card className="bg-gray-800 border-gray-700 card-futuristic glow-green scroll-scale-in">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto floating glow-green">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 text-glow-green">Glückwunsch!</h2>
                  <p className="text-gray-400">Sie haben die Lektion "{currentLesson.title}" erfolgreich abgeschlossen</p>
                </div>
                
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 floating">{currentLesson.xp}</div>
                    <div className="text-sm text-gray-400">XP Erhalten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 floating">{formatTime(timeSpent)}</div>
                    <div className="text-sm text-gray-400">Zeit investiert</div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/tutorial')}
                    className="btn-futuristic hover-lift"
                  >
                    Zum Campus
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    className="btn-futuristic glow-blue hover-lift"
                  >
                    Fertig
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TutorialLesson;
