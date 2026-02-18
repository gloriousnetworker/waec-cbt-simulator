(function() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
    // Better Chrome detection
    const isChrome = (() => {
      const ua = navigator.userAgent;
      return ua.indexOf('Chrome') > -1 && 
             ua.indexOf('Edg') === -1 && 
             ua.indexOf('OPR') === -1;
    })();
    
    const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    let swPath = '/sw.js';
    let browserName = 'Other';
    
    if (isChrome) {
      swPath = '/chrome-sw.js';
      browserName = 'Chrome';
    } else if (isFirefox) {
      swPath = '/sw.js';
      browserName = 'Firefox';
    } else if (isSafari) {
      swPath = '/sw.js';
      browserName = 'Safari';
    }
  
    console.log(`SW Register: ${browserName} browser detected, using ${swPath}`);
  
    function registerWithRetry(attempt = 1) {
      navigator.serviceWorker.register(swPath, { scope: '/' })
        .then(registration => {
          console.log(`✅ SW Register: Success on attempt ${attempt}`);
          
          if (registration.installing) {
            registration.installing.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                console.log('✅ SW: Activated');
                window.location.reload();
              }
            });
          }
          
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          
          if (registration.active) {
            console.log('✅ SW: Already active');
          }
        })
        .catch(error => {
          console.log(`❌ SW Register: Attempt ${attempt} failed - ${error.message}`);
          
          if (attempt < 5) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            console.log(`SW Register: Retrying in ${delay}ms...`);
            setTimeout(() => registerWithRetry(attempt + 1), delay);
          } else {
            console.log('❌ SW Register: Max attempts reached');
          }
        });
    }
  
    function clearOldRegistrations() {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.active && 
              (registration.active.scriptURL.includes('chrome-sw.js') || 
               registration.active.scriptURL.includes('sw.js'))) {
            registration.unregister();
          }
        });
      });
    }
  
    clearOldRegistrations();
  
    if (document.readyState === 'complete') {
      setTimeout(registerWithRetry, 2000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerWithRetry, 2000);
      });
    }
  })();