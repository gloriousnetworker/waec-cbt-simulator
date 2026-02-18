(function() {
    if (typeof window === 'undefined') return;
    
    console.log('SW Register: Starting...');
    
    if (!('serviceWorker' in navigator)) {
      console.log('SW Register: Not supported');
      return;
    }
  
    function registerWithRetry(attempt = 1) {
      console.log(`SW Register: Attempt ${attempt}...`);
      
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ SW Register: Initial success', registration.scope);
          
          function checkState() {
            if (registration.active) {
              console.log('✅ SW: Active and ready');
            } else if (registration.installing) {
              console.log('SW: Installing...');
              registration.installing.addEventListener('statechange', (e) => {
                console.log('SW: State ->', e.target.state);
                if (e.target.state === 'redundant') {
                  console.log('❌ SW: Became redundant - retrying...');
                  registration.unregister().then(() => {
                    setTimeout(() => registerWithRetry(attempt + 1), 2000);
                  });
                }
              });
            } else if (registration.waiting) {
              console.log('SW: Waiting for activation');
            }
          }
          
          checkState();
          
          registration.addEventListener('updatefound', () => {
            console.log('SW: Update found');
            checkState();
          });
        })
        .catch(error => {
          console.error('❌ SW Register: Failed', error);
          
          if (attempt < 5) {
            const delay = attempt * 3000;
            console.log(`SW Register: Retrying in ${delay}ms...`);
            setTimeout(() => registerWithRetry(attempt + 1), delay);
          }
        });
    }
  
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      setTimeout(registerWithRetry, 2000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerWithRetry, 2000);
      });
    }
  })();