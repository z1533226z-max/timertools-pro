// ===== I18N.JS - Internationalization System ===== //

class I18nManager {
  constructor() {
    this.currentLanguage = 'ko';
    this.translations = {};
    this.observers = [];
    
    this.init();
  }
  
  init() {
    this.loadTranslations();
    this.detectLanguage();
    this.setupLanguageSelector();
    this.applyTranslations();
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('i18n-ready', { 
      detail: { language: this.currentLanguage } 
    }));
  }
  
  // ===== TRANSLATIONS DATA ===== //
  loadTranslations() {
    this.translations = {
      ko: {
        // Navigation
        'nav.home': '홈',
        'nav.tools': '도구',
        'nav.guide': '가이드',
        'nav.blog': '블로그',
        'nav.basic-timer': '기본 타이머',
        'nav.pomodoro-timer': '뽀모도로 타이머',
        'nav.multi-timer': '멀티 타이머',
        'nav.cooking-timer': '요리 타이머',
        'nav.workout-timer': '운동 타이머',
        
        // Hero Section
        'hero.title': '완벽한 시간 관리를 위한<br>올인원 타이머 도구',
        'hero.subtitle': '생산성을 높이고 목표를 달성하세요. 간단하고 강력한 타이머로 집중력을 향상시키세요.',
        'hero.start-button': '지금 시작하기',
        'hero.demo-button': '데모 보기',
        
        // Timer Tools
        'tools.title': '주요 타이머 도구',
        'tools.basic.title': '기본 타이머',
        'tools.basic.description': '간단한 카운트다운 타이머로 시간을 정확히 측정하세요.',
        'tools.basic.features.1': '시/분/초 설정',
        'tools.basic.features.2': '프리셋 시간 저장',
        'tools.basic.features.3': '알림음 설정',
        'tools.pomodoro.title': '뽀모도로 타이머',
        'tools.pomodoro.description': '25분 집중 + 5분 휴식으로 생산성을 극대화하세요.',
        'tools.pomodoro.features.1': '자동 세션 전환',
        'tools.pomodoro.features.2': '일일 통계 추적',
        'tools.pomodoro.features.3': '작업 태그 관리',
        'tools.multi.title': '멀티 타이머',
        'tools.multi.description': '최대 6개의 타이머를 동시에 실행하여 효율성을 높이세요.',
        'tools.multi.features.1': '동시 6개 실행',
        'tools.multi.features.2': '개별 알림 설정',
        'tools.multi.features.3': '색상별 구분',
        'tools.cooking.title': '요리 타이머',
        'tools.cooking.description': '레시피별 최적화된 타이머로 완벽한 요리를 만드세요.',
        'tools.cooking.features.1': '레시피 추천 시간',
        'tools.cooking.features.2': '단계별 알림',
        'tools.cooking.features.3': '요리법 가이드',
        'tools.workout.title': '운동 타이머',
        'tools.workout.description': 'HIIT와 인터벌 트레이닝을 위한 전문 타이머입니다.',
        'tools.workout.features.1': 'HIIT 프로그램',
        'tools.workout.features.2': '인터벌 설정',
        'tools.workout.features.3': '운동 루틴 저장',
        'tools.start-link': '시작하기 →',
        
        // Guide Section
        'guide.title': '3단계로 시작하는 완벽한 시간 관리',
        'guide.step1.title': '타이머 선택',
        'guide.step1.description': '목적에 맞는 타이머를 선택하세요',
        'guide.step2.title': '시간 설정',
        'guide.step2.description': '원하는 시간을 설정하거나 프리셋을 사용하세요',
        'guide.step3.title': '집중 시작',
        'guide.step3.description': '타이머가 완료될 때까지 집중하세요',
        'guide.detailed-button': '상세 가이드 보기',
        'guide.video-button': '동영상 튜토리얼',
        
        // Testimonials
        'testimonials.title': '사용자 후기',
        'testimonials.1': '"이 타이머로 생산성이 200% 향상됐어요!"',
        'testimonials.2': '"요리할 때 꼭 필요한 도구예요"',
        'testimonials.3': '"운동 루틴 관리가 이렇게 쉬울 줄 몰랐어요"',
        
        // Footer
        'footer.privacy': '개인정보보호',
        'footer.terms': '이용약관',
        'footer.contact': '문의하기',
        'footer.copyright': '© 2024 TimerTools Pro. All rights reserved.',
        
        // Timer Page - Common
        'timer.hours': '시',
        'timer.minutes': '분',
        'timer.seconds': '초',
        'timer.start': '시작',
        'timer.pause': '일시정지',
        'timer.reset': '리셋',
        'timer.continue': '계속',
        'timer.presets': '빠른 설정',
        'timer.custom-save': '커스텀 저장',
        'timer.settings': '설정',
        'timer.alarm-sound': '알림음',
        'timer.volume': '볼륨',
        'timer.browser-notification': '브라우저 알림 활성화',
        'timer.desktop-notification': '데스크톱 알림 활성화',
        'timer.theme': '테마',
        'timer.brightness': '밝기',
        'timer.fullscreen': '풀스크린 모드',
        'timer.auto-repeat': '자동 반복',
        'timer.test-sound': '테스트',
        'timer.ready': '준비',
        'timer.running': '실행 중',
        'timer.paused': '일시정지됨',
        'timer.finished': '완료',
        
        // Basic Timer Specific
        'timer.basic.title': '기본 타이머',
        'timer.basic.description': '간단한 카운트다운 타이머로 시간을 정확히 측정하세요.',
        'timer.basic.guide.title': '📖 기본 타이머 사용법',
        'timer.basic.guide.step1': '시간 설정: 원하는 시간을 시/분/초로 설정하거나 프리셋 버튼을 사용하세요',
        'timer.basic.guide.step2': '타이머 시작: 시작 버튼을 클릭하여 카운트다운을 시작하세요',
        'timer.basic.guide.step3': '완료 알림: 타이머 완료 시 알림음과 브라우저 알림으로 안내받으세요',
        'timer.basic.tips.title': '💡 유용한 팁',
        'timer.basic.tips.1': '자주 사용하는 시간은 프리셋으로 저장하세요',
        'timer.basic.tips.2': '키보드 단축키: 스페이스바(시작/정지), R(리셋)',
        'timer.basic.tips.3': '풀스크린 모드로 더 집중된 환경을 만드세요',
        'timer.basic.tips.4': '브라우저 알림을 허용하면 다른 탭에서도 알림을 받을 수 있어요',
        
        // Settings Panel
        'timer.settings.notification': '알림 설정',
        'timer.settings.visual': '시각 효과',
        'timer.settings.theme.default': '기본',
        'timer.settings.theme.minimal': '미니멀',
        'timer.settings.theme.colorful': '컬러풀',
        'timer.settings.alarm.classic': '클래식',
        'timer.settings.alarm.digital': '디지털',
        'timer.settings.alarm.bell': '벨',
        'timer.settings.alarm.chime': '차임',
        
        // Related Tools
        'timer.related.title': '관련 도구 추천',
        'timer.related.goto': '바로가기',
        
        // Pomodoro Timer
        'timer.pomodoro.title': '뽀모도로 타이머',
        'timer.pomodoro.work': '작업 시간',
        'timer.pomodoro.break': '휴식 시간',
        'timer.pomodoro.long-break': '긴 휴식',
        'timer.pomodoro.session': '세션',
        'timer.pomodoro.completed': '완료',
        'timer.pomodoro.focus': '집중하세요!',
        'timer.pomodoro.break-time': '휴식하세요!',
        
        // Multi Timer
        'timer.multi.title': '멀티 타이머',
        'timer.multi.add': '타이머 추가',
        'timer.multi.remove': '제거',
        'timer.multi.start-all': '모두 시작',
        'timer.multi.stop-all': '모두 정지',
        'timer.multi.timer': '타이머',
        
        // Cooking Timer
        'timer.cooking.title': '요리 타이머',
        'timer.cooking.recipe': '레시피',
        'timer.cooking.step': '단계',
        'timer.cooking.ingredient': '재료',
        'timer.cooking.temperature': '온도',
        'timer.cooking.done': '완료!',
        
        // Workout Timer
        'timer.workout.title': '운동 타이머',
        'timer.workout.work': '운동',
        'timer.workout.rest': '휴식',
        'timer.workout.round': '라운드',
        'timer.workout.set': '세트',
        'timer.workout.prepare': '준비',
        'timer.workout.finish': '끝!'
      },
      
      en: {
        // Navigation
        'nav.home': 'Home',
        'nav.tools': 'Tools',
        'nav.guide': 'Guide',
        'nav.blog': 'Blog',
        'nav.basic-timer': 'Basic Timer',
        'nav.pomodoro-timer': 'Pomodoro Timer',
        'nav.multi-timer': 'Multi Timer',
        'nav.cooking-timer': 'Cooking Timer',
        'nav.workout-timer': 'Workout Timer',
        
        // Hero Section
        'hero.title': 'All-in-One Timer Tools<br>for Perfect Time Management',
        'hero.subtitle': 'Boost your productivity and achieve your goals. Improve focus with simple yet powerful timers.',
        'hero.start-button': 'Get Started',
        'hero.demo-button': 'View Demo',
        
        // Timer Tools
        'tools.title': 'Essential Timer Tools',
        'tools.basic.title': 'Basic Timer',
        'tools.basic.description': 'Measure time accurately with a simple countdown timer.',
        'tools.basic.features.1': 'Hours/Minutes/Seconds',
        'tools.basic.features.2': 'Save Preset Times',
        'tools.basic.features.3': 'Custom Alarm Sounds',
        'tools.pomodoro.title': 'Pomodoro Timer',
        'tools.pomodoro.description': 'Maximize productivity with 25-minute focus + 5-minute break cycles.',
        'tools.pomodoro.features.1': 'Auto Session Switch',
        'tools.pomodoro.features.2': 'Daily Statistics',
        'tools.pomodoro.features.3': 'Task Tag Management',
        'tools.multi.title': 'Multi Timer',
        'tools.multi.description': 'Run up to 6 timers simultaneously to boost efficiency.',
        'tools.multi.features.1': '6 Concurrent Timers',
        'tools.multi.features.2': 'Individual Alarms',
        'tools.multi.features.3': 'Color Coding',
        'tools.cooking.title': 'Cooking Timer',
        'tools.cooking.description': 'Create perfect dishes with recipe-optimized timers.',
        'tools.cooking.features.1': 'Recipe Time Suggestions',
        'tools.cooking.features.2': 'Step-by-Step Alerts',
        'tools.cooking.features.3': 'Recipe Guides',
        'tools.workout.title': 'Workout Timer',
        'tools.workout.description': 'Professional timer designed for HIIT and interval training.',
        'tools.workout.features.1': 'HIIT Programs',
        'tools.workout.features.2': 'Interval Settings',
        'tools.workout.features.3': 'Workout Routines',
        'tools.start-link': 'Start →',
        
        // Guide Section
        'guide.title': 'Perfect Time Management in 3 Simple Steps',
        'guide.step1.title': 'Choose Timer',
        'guide.step1.description': 'Select the timer that fits your purpose',
        'guide.step2.title': 'Set Time',
        'guide.step2.description': 'Set your desired time or use presets',
        'guide.step3.title': 'Start Focusing',
        'guide.step3.description': 'Focus until the timer completes',
        'guide.detailed-button': 'View Detailed Guide',
        'guide.video-button': 'Video Tutorial',
        
        // Testimonials
        'testimonials.title': 'User Reviews',
        'testimonials.1': '"This timer boosted my productivity by 200%!"',
        'testimonials.2': '"Essential tool for cooking"',
        'testimonials.3': '"Never knew workout routine management could be this easy"',
        
        // Footer
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.contact': 'Contact Us',
        'footer.copyright': '© 2024 TimerTools Pro. All rights reserved.',
        
        // Timer Page - Common
        'timer.hours': 'Hours',
        'timer.minutes': 'Minutes',
        'timer.seconds': 'Seconds',
        'timer.start': 'Start',
        'timer.pause': 'Pause',
        'timer.reset': 'Reset',
        'timer.continue': 'Continue',
        'timer.presets': 'Quick Settings',
        'timer.custom-save': 'Save Custom',
        'timer.settings': 'Settings',
        'timer.alarm-sound': 'Alarm Sound',
        'timer.volume': 'Volume',
        'timer.browser-notification': 'Enable Browser Notifications',
        'timer.desktop-notification': 'Enable Desktop Notifications',
        'timer.theme': 'Theme',
        'timer.brightness': 'Brightness',
        'timer.fullscreen': 'Fullscreen Mode',
        'timer.auto-repeat': 'Auto Repeat',
        'timer.test-sound': 'Test',
        'timer.ready': 'Ready',
        'timer.running': 'Running',
        'timer.paused': 'Paused',
        'timer.finished': 'Finished',
        
        // Basic Timer Specific
        'timer.basic.title': 'Basic Timer',
        'timer.basic.description': 'Measure time accurately with a simple countdown timer.',
        'timer.basic.guide.title': '📖 How to Use Basic Timer',
        'timer.basic.guide.step1': 'Set Time: Set your desired time in hours/minutes/seconds or use preset buttons',
        'timer.basic.guide.step2': 'Start Timer: Click the start button to begin countdown',
        'timer.basic.guide.step3': 'Completion Alert: Get notified with alarm sound and browser notifications when timer completes',
        'timer.basic.tips.title': '💡 Useful Tips',
        'timer.basic.tips.1': 'Save frequently used times as presets',
        'timer.basic.tips.2': 'Keyboard shortcuts: Spacebar (start/stop), R (reset)',
        'timer.basic.tips.3': 'Use fullscreen mode for a more focused environment',
        'timer.basic.tips.4': 'Allow browser notifications to get alerts from other tabs',
        
        // Settings Panel
        'timer.settings.notification': 'Notification Settings',
        'timer.settings.visual': 'Visual Effects',
        'timer.settings.theme.default': 'Default',
        'timer.settings.theme.minimal': 'Minimal',
        'timer.settings.theme.colorful': 'Colorful',
        'timer.settings.alarm.classic': 'Classic',
        'timer.settings.alarm.digital': 'Digital',
        'timer.settings.alarm.bell': 'Bell',
        'timer.settings.alarm.chime': 'Chime',
        
        // Related Tools
        'timer.related.title': 'Recommended Tools',
        'timer.related.goto': 'Go to',
        
        // Pomodoro Timer
        'timer.pomodoro.title': 'Pomodoro Timer',
        'timer.pomodoro.work': 'Work Time',
        'timer.pomodoro.break': 'Break Time',
        'timer.pomodoro.long-break': 'Long Break',
        'timer.pomodoro.session': 'Session',
        'timer.pomodoro.completed': 'Completed',
        'timer.pomodoro.focus': 'Focus Time!',
        'timer.pomodoro.break-time': 'Break Time!',
        
        // Multi Timer
        'timer.multi.title': 'Multi Timer',
        'timer.multi.add': 'Add Timer',
        'timer.multi.remove': 'Remove',
        'timer.multi.start-all': 'Start All',
        'timer.multi.stop-all': 'Stop All',
        'timer.multi.timer': 'Timer',
        
        // Cooking Timer
        'timer.cooking.title': 'Cooking Timer',
        'timer.cooking.recipe': 'Recipe',
        'timer.cooking.step': 'Step',
        'timer.cooking.ingredient': 'Ingredient',
        'timer.cooking.temperature': 'Temperature',
        'timer.cooking.done': 'Done!',
        
        // Workout Timer
        'timer.workout.title': 'Workout Timer',
        'timer.workout.work': 'Work',
        'timer.workout.rest': 'Rest',
        'timer.workout.round': 'Round',
        'timer.workout.set': 'Set',
        'timer.workout.prepare': 'Prepare',
        'timer.workout.finish': 'Finish!'
      }
    };
  }
  
  // ===== LANGUAGE DETECTION ===== //
  detectLanguage() {
    // Check saved preference
    const savedLang = localStorage.getItem('timer-language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
      return;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.translations[browserLang]) {
      this.currentLanguage = browserLang;
    } else {
      this.currentLanguage = 'ko'; // Default to Korean
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
  }
  
  // ===== LANGUAGE SELECTOR SETUP ===== //
  setupLanguageSelector() {
    const languageSelect = document.querySelector('.language-select');
    if (!languageSelect) return;
    
    // Set current value
    languageSelect.value = this.currentLanguage;
    
    // Add event listener
    languageSelect.addEventListener('change', (e) => {
      this.changeLanguage(e.target.value);
    });
  }
  
  // ===== LANGUAGE CHANGE ===== //
  changeLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn(`Language '${lang}' not supported`);
      return;
    }
    
    this.currentLanguage = lang;
    
    // Save preference
    localStorage.setItem('timer-language', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Apply translations
    this.applyTranslations();
    
    // Notify observers
    this.notifyLanguageChange(lang);
    
    // Announce to screen readers
    this.announceLanguageChange(lang);
  }
  
  // ===== APPLY TRANSLATIONS ===== //
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.get(key);
      
      if (translation) {
        // Check if element should use innerHTML (for HTML content like <br>)
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Update placeholders and aria-labels
    this.updateAttributes();
  }
  
  updateAttributes() {
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.get(key);
      if (translation) {
        element.placeholder = translation;
      }
    });
    
    // Update aria-labels
    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    ariaElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      const translation = this.get(key);
      if (translation) {
        element.setAttribute('aria-label', translation);
      }
    });
    
    // Update titles
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.get(key);
      if (translation) {
        element.title = translation;
      }
    });
  }
  
  // ===== TRANSLATION GETTER ===== //
  get(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || 
                      this.translations['ko']?.[key] || 
                      key;
    
    // Replace parameters in translation
    return Object.keys(params).reduce((str, param) => {
      return str.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    }, translation);
  }
  
  // ===== OBSERVER PATTERN ===== //
  addLanguageChangeObserver(callback) {
    this.observers.push(callback);
  }
  
  removeLanguageChangeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }
  
  notifyLanguageChange(language) {
    this.observers.forEach(callback => callback(language));
  }
  
  // ===== UTILITY METHODS ===== //
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  getSupportedLanguages() {
    return Object.keys(this.translations);
  }
  
  announceLanguageChange(language) {
    const announcement = language === 'ko' ? 
      '언어가 한국어로 변경되었습니다' : 
      'Language changed to English';
      
    // Find or create live region
    let liveRegion = document.querySelector('#language-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'language-announcer';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = announcement;
  }
}

// ===== INITIALIZATION ===== //
let i18n = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    i18n = new I18nManager();
    window.i18n = i18n; // Make globally accessible
  });
} else {
  i18n = new I18nManager();
  window.i18n = i18n;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nManager;
}