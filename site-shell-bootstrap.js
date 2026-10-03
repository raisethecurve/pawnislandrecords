(function () {
  // Public pages use the browser document as the only scroll container.
  // The iframe shell remains available at shell.html for explicit previews.

  // Google Analytics 4 — loaded first so every page on the label site is tracked.
  // Measurement ID for the Pawn Island Records GA4 property.
  var ANALYTICS_ID = 'G-GMYLXKEWC2';
  var hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_ID, { transport_type: 'beacon' });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
  document.head.appendChild(script);
})();
