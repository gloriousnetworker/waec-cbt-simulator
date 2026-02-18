(function() {
    if (typeof window === 'undefined') return;
    
    console.log('SW Register: Starting...');
    
    if (!('serviceWorker' in navigator)) {
      console.log('SW Register: Not supported');
      return;
    }
  
    // Function to register with retry
    function registerWithRetry(attempt = 1) {
      console.log(`SW Register: Attempt ${attempt}...`);
      
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ SW Register: Success!', registration.scope);
          
          // Log the state
          if (registration.installing) {
            console.log('SW: Installing');
          } else if (registration.waiting) {
            console.log('SW: Waiting');
          } else if (registration.active) {
            console.log('✅ SW: Active');
          }
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('SW: Update found');
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              console.log('SW: State ->', newWorker.state);
            });
          });
        })
        .catch(error => {
          console.error('❌ SW Register: Failed', error);
          
          // Retry up to 3 times
          if (attempt < 3) {
            const delay = attempt * 2000;
            console.log(`SW Register: Retrying in ${delay}ms...`);
            setTimeout(() => registerWithRetry(attempt + 1), delay);
          }
        });
    }
  
    // Try to register immediately
    if (document.readyState === 'complete') {
      registerWithRetry();
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerWithRetry, 1000);
      });
    }
  })();