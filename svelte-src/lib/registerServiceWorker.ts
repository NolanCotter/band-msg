import { browser } from '$app/environment';

export async function registerServiceWorker() {
  if (!browser || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    // Register the Firebase messaging service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    
    console.log('Service Worker registered successfully:', registration);
    
    // Wait for the service worker to be ready with timeout
    const readyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) => 
      setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
    );
    
    await Promise.race([readyPromise, timeoutPromise]).catch(err => {
      console.warn('Service Worker ready timeout, continuing anyway:', err);
    });
    
    console.log('Service Worker is ready');
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}
