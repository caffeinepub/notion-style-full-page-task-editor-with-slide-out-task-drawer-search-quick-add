import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if user has dismissed or installed the app before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const installed = localStorage.getItem('pwa-installed');
    
    // Don't show if already dismissed, installed, or in standalone mode
    if (dismissed || installed || standalone) {
      return;
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      localStorage.setItem('pwa-installed', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, show prompt if not in standalone and not dismissed
    if (ios && !standalone && !dismissed && !installed) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the native install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem('pwa-installed', 'true');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      localStorage.setItem('pwa-install-dismissed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleMaybeLater = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <button
          onClick={handleMaybeLater}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Blue Flame Icon */}
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600/10">
            <img
              src="/assets/generated/favicon-blue-flame-transparent.dim_32x32.png"
              alt="Impact Forge"
              className="h-12 w-12"
            />
          </div>

          {/* Title */}
          <h2 className="mb-2 text-2xl font-bold text-white">
            Install Impact Forge
          </h2>

          {/* Message */}
          <p className="mb-6 text-sm text-gray-300">
            {isIOS ? (
              <>
                Install this app on your device for quick access and a better experience.
                <br />
                <br />
                Tap the <span className="font-semibold">Share</span> button{' '}
                <span className="inline-block">
                  <svg
                    className="inline h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                  </svg>
                </span>{' '}
                and select <span className="font-semibold">"Add to Home Screen"</span>.
              </>
            ) : (
              'Install this app on your device for quick access, offline functionality, and a better experience.'
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex w-full gap-3">
            {!isIOS && deferredPrompt ? (
              <>
                <Button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  size="lg"
                >
                  Install
                </Button>
                <Button
                  onClick={handleMaybeLater}
                  variant="outline"
                  className="flex-1 border-gray-700 bg-transparent text-white hover:bg-gray-800"
                  size="lg"
                >
                  Maybe later
                </Button>
              </>
            ) : (
              <Button
                onClick={handleMaybeLater}
                variant="outline"
                className="w-full border-gray-700 bg-transparent text-white hover:bg-gray-800"
                size="lg"
              >
                Maybe later
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
