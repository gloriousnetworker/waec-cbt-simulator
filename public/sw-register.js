(function() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('SW: Not supported');
      return;
    }
  
    // Don't register in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (process.env.NODE_ENV === 'development') {
        console.log('SW: Skipping registration in development');
        return;
      }
    }
  
    console.log('SW: Attempting to register...');
  
    function registerSW(retryCount = 0) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW: Registered successfully', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('SW: Update found');
            
            newWorker.addEventListener('statechange', () => {
              console.log('SW: State changed to', newWorker.state);
            });
          });
        })
        .catch(error => {
          console.log('SW: Registration failed', error.message);
          
          // Retry up to 3 times with exponential backoff
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`SW: Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
            setTimeout(() => registerSW(retryCount + 1), delay);
          }
        });
    }
  
    // Wait for page load
    if (document.readyState === 'complete') {
      setTimeout(registerSW, 2000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerSW, 2000);
      });
    }
  })();