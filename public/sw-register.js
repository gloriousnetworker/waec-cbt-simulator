(function() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
  
    // Don't even try in development mode with Fast Refresh
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Skipping SW registration in development');
      return;
    }
  
    // Wait for the page to be completely stable
    let registrationAttempts = 0;
    const maxAttempts = 3;
  
    function attemptRegistration() {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('✅ SW registered:', reg.scope);
        })
        .catch(err => {
          registrationAttempts++;
          console.log(`❌ SW registration failed (attempt ${registrationAttempts}/${maxAttempts}):`, err.message);
          
          if (registrationAttempts < maxAttempts) {
            setTimeout(attemptRegistration, 3000 * registrationAttempts);
          }
        });
    }
  
    // Try when page is fully loaded
    if (document.readyState === 'complete') {
      setTimeout(attemptRegistration, 3000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(attemptRegistration, 3000);
      });
    }
  })();