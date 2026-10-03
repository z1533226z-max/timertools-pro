// ===== SEO PERFORMANCE OPTIMIZATION ===== //

class SEOPerformanceOptimizer {
  constructor() {
    this.init();
  }
  
  init() {
    // No runtime JSON-LD injection (pages carry their own static structured data;
    // the injected block also contained a made-up aggregateRating) and no loading of
    // animations.css / print.css, which do not exist (404 on every load).
    this.setupLazyLoading();
    this.setupPreconnections();
    this.trackCoreWebVitals();
  }
  
  // Lazy load non-critical images and resources
  setupLazyLoading() {
    // Intersection Observer for images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
  
  // Setup DNS preconnections for better performance
  setupPreconnections() {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com'
    ];
    
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
  
  // Track Core Web Vitals for SEO
  trackCoreWebVitals() {
    // Track Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // Track First Input Delay (FID)
    this.trackFID();
    
    // Track Cumulative Layout Shift (CLS)
    this.trackCLS();
    
    // Track First Contentful Paint (FCP)
    this.trackFCP();
  }
  
  trackLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics
        this.sendToAnalytics('core_web_vitals', 'LCP', Math.round(lastEntry.startTime));
        
        observer.disconnect();
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
  
  trackFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          // Send to analytics
          this.sendToAnalytics('core_web_vitals', 'FID', 
            Math.round(entry.processingStart - entry.startTime));
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }
  
  trackCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let clsEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsEntries.push(entry);
            clsValue += entry.value;
          }
        });
        
        console.log('CLS:', clsValue);
        
        // Send to analytics
        this.sendToAnalytics('core_web_vitals', 'CLS', Math.round(clsValue * 1000) / 1000);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  trackFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FCP:', entry.startTime);
          
          // Send to analytics
          this.sendToAnalytics('core_web_vitals', 'FCP', Math.round(entry.startTime));
        });
        
        observer.disconnect();
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }
  
  sendToAnalytics(category, metric, value) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metric, {
        'event_category': category,
        'value': value,
        'custom_parameter_1': navigator.connection?.effectiveType || 'unknown',
        'custom_parameter_2': window.location.pathname
      });
    }
    
    // Console logging for development
    console.log(`SEO Metric - ${category}:${metric} = ${value}`);
  }
  
  // Optimize images for better SEO
  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for non-critical images
      if (!img.hasAttribute('loading') && !this.isCriticalImage(img)) {
        img.loading = 'lazy';
      }
      
      // Add proper alt text if missing
      if (!img.alt && img.dataset.alt) {
        img.alt = img.dataset.alt;
      }
      
      // Add width/height if missing to prevent CLS
      if (!img.width && img.dataset.width) {
        img.width = img.dataset.width;
      }
      if (!img.height && img.dataset.height) {
        img.height = img.dataset.height;
      }
    });
  }
  
  isCriticalImage(img) {
    // Consider images above the fold as critical
    const rect = img.getBoundingClientRect();
    return rect.top < window.innerHeight;
  }
  
  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      { href: '/assets/css/styles.css', as: 'style' },
      { href: '/assets/js/main.js', as: 'script' },
      { href: '/assets/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      document.head.appendChild(link);
    });
  }
}

// Initialize SEO Performance Optimizer
document.addEventListener('DOMContentLoaded', () => {
  window.seoPerformance = new SEOPerformanceOptimizer();
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOPerformanceOptimizer;
}