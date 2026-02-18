// public/sw-register.js
(function() {
    if (typeof window === 'undefined') return;
    
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }
  
    let registrationAttempts = 0;
    const maxAttempts = 5;
  
    async function unregisterOldWorkers() {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.active && registration.active.scriptURL.includes('sw.js')) {
            await registration.unregister();
          }
        }
      } catch (error) {
        console.log('Error unregistering:', error);
      }
    }
  
    function registerWithRetry() {
      registrationAttempts++;
      
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          if (registration.installing) {
            registration.installing.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                window.location.reload();
              }
            });
          }
          
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch(error => {
          if (registrationAttempts < maxAttempts) {
            const delay = Math.min(1000 * Math.pow(2, registrationAttempts), 30000);
            setTimeout(registerWithRetry, delay);
          }
        });
    }
  
    unregisterOldWorkers().then(() => {
      if (document.readyState === 'complete') {
        setTimeout(registerWithRetry, 2000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(registerWithRetry, 2000);
        });
      }
    });
  })();