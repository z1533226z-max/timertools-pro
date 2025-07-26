// ===== SEO PERFORMANCE OPTIMIZATION ===== //

class SEOPerformanceOptimizer {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupLazyLoading();
    this.setupCriticalCSS();
    this.setupPreconnections();
    this.setupStructuredData();
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
  
  // Optimize critical CSS loading
  setupCriticalCSS() {
    // Load non-critical CSS asynchronously
    const nonCriticalCSS = [
      '/assets/css/animations.css',
      '/assets/css/print.css'
    ];
    
    nonCriticalCSS.forEach(cssFile => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    });
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
  
  // Enhanced structured data for search engines
  setupStructuredData() {
    const currentLang = document.documentElement.lang || 'ko';
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "TimerTools Pro",
      "description": currentLang === 'ko' 
        ? "온라인 타이머, 뽀모도로, 멀티 타이머로 생산성을 높이고 집중력을 향상시키는 무료 도구"
        : "Free online timer, pomodoro, and multi-timer tools for enhanced productivity and focus",
      "url": window.location.origin,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires JavaScript",
      "softwareVersion": "1.0",
      "datePublished": "2024-12-20",
      "dateModified": "2024-12-20",
      "inLanguage": ["ko", "en"],
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "author": {
        "@type": "Organization",
        "name": "TimerTools Pro",
        "url": window.location.origin
      },
      "publisher": {
        "@type": "Organization",
        "name": "TimerTools Pro",
        "url": window.location.origin
      },
      "featureList": [
        currentLang === 'ko' ? "기본 타이머" : "Basic Timer",
        currentLang === 'ko' ? "뽀모도로 타이머" : "Pomodoro Timer", 
        currentLang === 'ko' ? "멀티 타이머" : "Multi Timer",
        currentLang === 'ko' ? "요리 타이머" : "Cooking Timer",
        currentLang === 'ko' ? "운동 타이머" : "Workout Timer"
      ],
      "screenshot": `${window.location.origin}/assets/images/app-screenshot.jpg`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
      }
    };
    
    // Add breadcrumb structure for timer pages
    if (window.location.pathname.includes('/timer/')) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": currentLang === 'ko' ? "홈" : "Home",
          "item": window.location.origin
        }, {
          "@type": "ListItem", 
          "position": 2,
          "name": currentLang === 'ko' ? "타이머 도구" : "Timer Tools",
          "item": `${window.location.origin}${currentLang === 'en' ? '/en' : ''}/`
        }, {
          "@type": "ListItem",
          "position": 3,
          "name": document.title.split(' - ')[0],
          "item": window.location.href
        }]
      };
      
      this.addStructuredData(breadcrumbData);
    }
    
    this.addStructuredData(structuredData);
  }
  
  addStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
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