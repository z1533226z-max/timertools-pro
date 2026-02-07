// ===== SEO-OPTIMIZED INTERNATIONALIZATION ===== //

class SEOInternationalization {
  constructor() {
    this.currentLang = document.documentElement.lang || 'ko';
    this.supportedLangs = ['ko', 'en'];
    this.translations = {
      ko: {
        siteName: 'TimerTools Pro',
        tagline: '완벽한 시간 관리 도구',
        metaDescription: '온라인 타이머, 뽀모도로, 멀티 타이머로 생산성을 높이고 집중력을 향상시키세요',
        keywords: '타이머, 뽀모도로, 시간관리, 생산성, 집중, 온라인 타이머'
      },
      en: {
        siteName: 'TimerTools Pro',
        tagline: 'Perfect Time Management Tool',
        metaDescription: 'Boost productivity and improve focus with online timer, pomodoro technique, and multi-timer tools',
        keywords: 'timer, pomodoro, time management, productivity, focus, online timer'
      }
    };
    
    this.init();
  }
  
  init() {
    this.setupLanguageSelector();
    this.updateCanonicalLinks();
    this.setupSEOMetadata();
    this.trackLanguagePreference();
  }
  
  setupLanguageSelector() {
    const languageSelectors = document.querySelectorAll('.language-select');
    
    languageSelectors.forEach(selector => {
      // Set current language
      selector.value = this.currentLang;
      
      selector.addEventListener('change', (e) => {
        this.switchLanguage(e.target.value);
      });
    });
  }
  
  switchLanguage(targetLang) {
    if (!this.supportedLangs.includes(targetLang)) {
      console.warn(`Unsupported language: ${targetLang}`);
      return;
    }
    
    const currentPath = window.location.pathname;
    const newURL = this.getTranslatedURL(currentPath, targetLang);
    
    // Store language preference
    localStorage.setItem('preferredLanguage', targetLang);
    
    // Update meta tags before navigation for better SEO
    this.updateMetaTags(targetLang);
    
    // Navigate to translated page
    window.location.href = newURL;
  }
  
  getTranslatedURL(currentPath, targetLang) {
    const baseURL = window.location.origin;
    
    // Remove current language prefix if exists
    let cleanPath = currentPath;
    if (currentPath.startsWith('/en/')) {
      cleanPath = currentPath.substring(3); // Remove '/en'
    }
    
    // Add new language prefix if not Korean (default)
    if (targetLang === 'en') {
      return `${baseURL}/en${cleanPath}`;
    } else {
      return `${baseURL}${cleanPath}`;
    }
  }
  
  updateCanonicalLinks() {
    const currentPath = window.location.pathname;
    const currentURL = window.location.href;
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentURL;
    
    // Ensure hreflang links exist and are correct
    this.updateHreflangLinks(currentPath);
  }
  
  updateHreflangLinks(currentPath) {
    // Remove existing hreflang links
    const existingHreflangs = document.querySelectorAll('link[hreflang]');
    existingHreflangs.forEach(link => link.remove());
    
    const baseURL = window.location.origin;
    let cleanPath = currentPath;
    
    // Remove language prefix to get clean path
    if (currentPath.startsWith('/en/')) {
      cleanPath = currentPath.substring(3);
    }
    
    // Add hreflang links
    const hreflangs = [
      { lang: 'ko', url: `${baseURL}${cleanPath}` },
      { lang: 'en', url: `${baseURL}/en${cleanPath}` },
      { lang: 'x-default', url: `${baseURL}${cleanPath}` }
    ];
    
    hreflangs.forEach(({ lang, url }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    });
  }
  
  updateMetaTags(lang) {
    const translations = this.translations[lang];
    if (!translations) return;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = translations.metaDescription;
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.content = translations.keywords;
    }
    
    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.content = `${translations.siteName} - ${translations.tagline}`;
    }
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.content = translations.metaDescription;
    }
    
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.content = lang === 'ko' ? 'ko_KR' : 'en_US';
    }
    
    // Update Twitter Card
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.content = `${translations.siteName} - ${translations.tagline}`;
    }
    
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.content = translations.metaDescription;
    }
  }
  
  setupSEOMetadata() {
    // Add structured data for search engines
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": this.translations[this.currentLang].siteName,
      "description": this.translations[this.currentLang].metaDescription,
      "url": window.location.origin,
      "applicationCategory": "Productivity",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "inLanguage": this.supportedLangs,
      "availableLanguage": [
        {
          "@type": "Language",
          "name": "Korean",
          "alternateName": "ko"
        },
        {
          "@type": "Language", 
          "name": "English",
          "alternateName": "en"
        }
      ]
    };
    
    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
  
  trackLanguagePreference() {
    // Check for stored language preference
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang && storedLang !== this.currentLang) {
      // Suggest language switch if different from current
      this.showLanguageSuggestion(storedLang);
    }
    
    // Detect browser language preference
    const browserLang = navigator.language.substring(0, 2);
    if (this.supportedLangs.includes(browserLang) && 
        browserLang !== this.currentLang && 
        !storedLang) {
      this.showLanguageSuggestion(browserLang);
    }
  }
  
  showLanguageSuggestion(suggestedLang) {
    const langNames = { ko: '한국어', en: 'English' };
    
    // Create language suggestion banner
    const banner = document.createElement('div');
    banner.className = 'language-suggestion-banner';
    banner.innerHTML = `
      <div class="language-suggestion-content">
        <span class="suggestion-text">
          ${this.currentLang === 'ko' 
            ? `${langNames[suggestedLang]}로 보기` 
            : `View in ${langNames[suggestedLang]}`}
        </span>
        <button class="btn-switch-lang" data-lang="${suggestedLang}">
          ${this.currentLang === 'ko' ? '전환' : 'Switch'}
        </button>
        <button class="btn-dismiss-suggestion">
          ${this.currentLang === 'ko' ? '닫기' : 'Dismiss'}
        </button>
      </div>
    `;
    
    // Style the banner
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.75rem;
      text-align: center;
      z-index: 1000;
      font-family: inherit;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    // Add event listeners
    banner.querySelector('.btn-switch-lang').addEventListener('click', () => {
      this.switchLanguage(suggestedLang);
    });
    
    banner.querySelector('.btn-dismiss-suggestion').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('languageSuggestionDismissed', Date.now());
    });
    
    // Check if suggestion was recently dismissed
    const dismissed = localStorage.getItem('languageSuggestionDismissed');
    if (!dismissed || Date.now() - dismissed > 7 * 24 * 60 * 60 * 1000) {
      document.body.appendChild(banner);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (banner.parentNode) {
          banner.remove();
        }
      }, 10000);
    }
  }
  
  // SEO-friendly URL generation for different pages
  generateSEOFriendlyURLs() {
    return {
      ko: {
        home: '/',
        basicTimer: '/timer/basic.html',
        pomodoroTimer: '/timer/pomodoro.html',
        multiTimer: '/timer/multi.html',
        cookingTimer: '/timer/cooking.html',
        workoutTimer: '/timer/workout.html',
        guide: '/guide/',
        blog: '/blog/'
      },
      en: {
        home: '/en/',
        basicTimer: '/en/timer/basic.html',
        pomodoroTimer: '/en/timer/pomodoro.html',
        multiTimer: '/en/timer/multi.html',
        cookingTimer: '/en/timer/cooking.html',
        workoutTimer: '/en/timer/workout.html',
        guide: '/en/guide/',
        blog: '/en/blog/'
      }
    };
  }
  
  // Analytics tracking for language switching
  trackLanguageSwitch(fromLang, toLang) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'language_switch', {
        'event_category': 'internationalization',
        'from_language': fromLang,
        'to_language': toLang,
        'page_path': window.location.pathname
      });
    }
    
    console.log(`Language switched: ${fromLang} → ${toLang}`);
  }
}

// Initialize SEO I18n when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.seoI18n = new SEOInternationalization();
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOInternationalization;
}