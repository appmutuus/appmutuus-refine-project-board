/**
 * PWA utilities for service worker registration and management
 */

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Check if app is already installed
    this.checkInstallStatus();
    
    // Listen for install prompt
    this.setupInstallPrompt();
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup update checking
    this.setupUpdateChecking();
  }

  private checkInstallStatus() {
    // Check if running as PWA
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone ||
                     document.referrer.includes('android-app://');
    
    console.log('PWA installed:', this.isInstalled);
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as any;
      
      // Dispatch custom event to notify app
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered:', this.swRegistration);
        
        // Listen for updates
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('Service Worker: Update found');
          const newWorker = this.swRegistration!.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Service Worker: New version available');
                window.dispatchEvent(new CustomEvent('pwa-update-available'));
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupUpdateChecking() {
    // Check for updates every 30 minutes when app is active
    setInterval(() => {
      if (this.swRegistration) {
        this.swRegistration.update();
      }
    }, 30 * 60 * 1000);

    // Check for updates when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.swRegistration) {
        this.swRegistration.update();
      }
    });
  }

  // Public methods
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt result:', choiceResult.outcome);
      
      this.deferredPrompt = null;
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
      return false;
    }
  }

  public async updateServiceWorker(): Promise<void> {
    if (this.swRegistration && this.swRegistration.waiting) {
      // Send message to waiting service worker to skip waiting
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page to activate new service worker
      window.location.reload();
    }
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    }
    return 'denied';
  }

  public async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('No service worker registration');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // In production, replace with your VAPID public key
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnRG-3PjHyYNjIgROjb-oVrAhbEjBKG_QMJQVK_CXZVibgkOc'
        )
      });

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Offline storage helpers
  public async storeOfflineAction(action: any): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['offline_actions'], 'readwrite');
      const store = transaction.objectStore('offline_actions');
      await store.add({
        ...action,
        timestamp: Date.now(),
        id: crypto.randomUUID()
      });
    } catch (error) {
      console.error('Failed to store offline action:', error);
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('mutuus-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offline_actions')) {
          const store = db.createObjectStore('offline_actions', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
}

// Helper functions to check request types
function isStaticAsset(url: string): boolean {
  return url.includes('/assets/') || 
         url.includes('.css') || 
         url.includes('.js') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.svg') ||
         url.includes('logopng.png') ||
         url.includes('/fonts/');
}

function isAPIRequest(url: string): boolean {
  return url.includes('/api/') ||
         url.includes('supabase.co') ||
         url.includes('/functions/');
}

function isNavigationRequest(request: Request): boolean {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept')?.includes('text/html'));
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Export utility functions
export const PWA = {
  install: () => pwaManager.showInstallPrompt(),
  update: () => pwaManager.updateServiceWorker(),
  isInstalled: () => pwaManager.isAppInstalled(),
  canInstall: () => pwaManager.canInstall(),
  requestNotifications: () => pwaManager.requestNotificationPermission(),
  subscribeToNotifications: () => pwaManager.subscribeToNotifications(),
  storeOfflineAction: (action: any) => pwaManager.storeOfflineAction(action)
};