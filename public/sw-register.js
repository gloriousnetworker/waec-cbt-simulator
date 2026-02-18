(function() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
    function registerSW() {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch(() => {
          setTimeout(registerSW, 3000);
        });
    }
  
    if (document.readyState === 'complete') {
      setTimeout(registerSW, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerSW, 1000);
      });
    }
  })();