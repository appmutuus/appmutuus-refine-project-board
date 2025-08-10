import React from 'react';
import { FolderOpen, CheckSquare, Gift, MapPin, Users, WalletIcon, Menu, Trophy, Briefcase, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FolderOpen },
    { name: 'Karte', href: '/map', icon: MapPin },
    { name: 'Jobs', href: '/jobs', icon: CheckSquare },
    { name: 'Meine Jobs', href: '/my-jobs', icon: Briefcase },
    { name: 'Campus', href: '/tutorial', icon: BookOpen },
    { name: 'Ranking', href: '/ranking', icon: Trophy },
    { name: 'Profil', href: '/profile', icon: Users },
    { name: 'Einladen', href: '/invite', icon: Gift },
    { name: 'Wallet', href: '/wallet', icon: WalletIcon },
  ];

  // Prüfe ob der aktuelle Pfad aktiv ist (bei /tutorial auch StartsWith)
  const isActive = (href: string) => {
    if (href === '/tutorial') {
      return location.pathname.startsWith(href);
    }
    return location.pathname === href;
  };

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="mr-3 cursor-pointer hover-lift floating glow-blue" onClick={() => navigate('/dashboard')}>
              <img
                src="http://mutuus-app.de/assets/logopng.png"
                alt="Mutuus"
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`flex items-center px-3 py-2 btn-futuristic hover-lift scroll-slide-right delay-${index * 50} ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white hover:bg-blue-700 glow-blue text-glow"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-gray-800 text-gray-300 border-gray-700 btn-futuristic hover-lift">
                    <Menu className="w-4 h-4 mr-2" />
                    Menü
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-56 bg-gray-800 border-gray-700 glow-blue">
                    <div className="p-2">
                      {navigationItems.map((item, index) => (
                        <NavigationMenuLink
                          key={item.name}
                          className={`flex items-center px-3 py-3 rounded-md text-sm font-medium cursor-pointer btn-futuristic hover-lift scroll-fade-in delay-${index * 50} ${
                            isActive(item.href)
                              ? "bg-blue-600 text-white glow-blue"
                              : "text-gray-300 hover:text-white hover:bg-gray-700"
                          }`}
                          onClick={() => handleNavigation(item.href)}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Balance */}
          <div className="hidden sm:flex items-center space-x-3">
            <div
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover-lift glow-green pulse-glow cursor-pointer"
              onClick={() => navigate('/wallet')}
            >
              5.00€
            </div>
            <div
              className="bg-orange-600 text-white px-2 py-1 rounded text-sm hover-lift glow-orange floating cursor-pointer"
              onClick={() => navigate('/ranking')}
            >
              🔥 120
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
