// ===== SEO-OPTIMIZED INTERNATIONALIZATION ===== //

class SEOInternationalization {
  constructor() {
    this.currentLang = document.documentElement.lang || 'ko';
    this.supportedLangs = ['ko', 'en'];
    this.init();
  }
  
  init() {
    // canonical, hreflang, meta tags and JSON-LD are authored statically in each
    // page's HTML. Rewriting them at runtime pointed canonical at the raw request
    // URL (incl. query strings) and added hreflang pairs for pages that have none.
    this.setupLanguageSelector();
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