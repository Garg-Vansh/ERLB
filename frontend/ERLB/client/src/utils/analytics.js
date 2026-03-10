export const initAnalytics = () => {
  const gaId = import.meta.env.VITE_GA4_ID;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;

  if (gaId) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }

  if (pixelId) {
    if (!window.fbq) {
      window.fbq = function fbq() {
        window.fbq.callMethod
          ? window.fbq.callMethod.apply(window.fbq, arguments)
          : window.fbq.queue.push(arguments);
      };
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
    }

    const pixelScript = document.createElement('script');
    pixelScript.async = true;
    pixelScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(pixelScript);

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
};

export const trackEvent = (name, payload = {}) => {
  if (window.gtag) {
    window.gtag('event', name, payload);
  }

  if (window.fbq) {
    window.fbq('trackCustom', name, payload);
  }
};
