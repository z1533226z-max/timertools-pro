// ===== TIMER I18N INTEGRATION ===== //
// Universal language support for all timer pages

class TimerI18nIntegration {
  constructor() {
    this.currentLanguage = 'ko';
    this.timerType = this.detectTimerType();
    this.init();
  }
  
  init() {
    // Wait for i18n system to be ready
    if (window.i18n) {
      this.setupLanguageSupport();
    } else {
      document.addEventListener('i18n-ready', () => {
        this.setupLanguageSupport();
      });
    }
  }
  
  detectTimerType() {
    const path = window.location.pathname;
    if (path.includes('basic.html')) return 'basic';
    if (path.includes('pomodoro.html')) return 'pomodoro';
    if (path.includes('multi.html')) return 'multi';
    if (path.includes('cooking.html')) return 'cooking';
    if (path.includes('workout.html')) return 'workout';
    return 'basic';
  }
  
  setupLanguageSupport() {
    this.currentLanguage = window.i18n.getCurrentLanguage();
    
    // Listen for language changes
    window.i18n.addLanguageChangeObserver((language) => {
      this.currentLanguage = language;
      this.updateTimerSpecificContent();
    });
    
    // Initial update
    this.updateTimerSpecificContent();
  }
  
  updateTimerSpecificContent() {
    // <title> and meta description are intentionally NOT touched here: every page
    // ships its own static, language-specific title/description, and KO/EN live on
    // separate URLs. Overwriting them collapsed dozens of pages to one generic title.
    this.updatePresetButtons();
    this.updateDynamicContent();
  }
  
  updatePresetButtons() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      // Only relabel duration presets; link-style .preset-btn (e.g. "Tabata") have no data-minutes
      if (btn.dataset.minutes === undefined) return;
      const minutes = btn.dataset.minutes || '0';
      const seconds = btn.dataset.seconds || '0';
      
      if (this.currentLanguage === 'en') {
        if (minutes === '1' && seconds === '0') {
          btn.textContent = '1 min';
        } else if (seconds === '0') {
          btn.textContent = `${minutes} min`;
        } else {
          btn.textContent = `${minutes}:${seconds.padStart(2, '0')}`;
        }
      } else {
        btn.textContent = seconds === '0' ? `${minutes}분` : `${minutes}:${seconds.padStart(2, '0')}`;
      }
    });
  }
  
  updateDynamicContent() {
    // Update any dynamic content specific to each timer type
    switch (this.timerType) {
      case 'pomodoro':
        this.updatePomodoroContent();
        break;
      case 'multi':
        this.updateMultiTimerContent();
        break;
      case 'cooking':
        this.updateCookingContent();
        break;
      case 'workout':
        this.updateWorkoutContent();
        break;
    }
  }
  
  updatePomodoroContent() {
    // Update pomodoro-specific dynamic content
    const sessionLabels = document.querySelectorAll('.session-label');
    sessionLabels.forEach(label => {
      if (label.textContent.includes('작업') || label.textContent.includes('Work')) {
        label.textContent = this.currentLanguage === 'en' ? 'Work Session' : '작업 세션';
      } else if (label.textContent.includes('휴식') || label.textContent.includes('Break')) {
        label.textContent = this.currentLanguage === 'en' ? 'Break Time' : '휴식 시간';
      }
    });
  }
  
  updateMultiTimerContent() {
    // Update multi-timer specific content
    const timerLabels = document.querySelectorAll('.timer-label');
    timerLabels.forEach((label, index) => {
      const baseText = this.currentLanguage === 'en' ? 'Timer' : '타이머';
      label.textContent = `${baseText} ${index + 1}`;
    });
  }
  
  updateCookingContent() {
    // Update cooking timer specific content
    const recipeSteps = document.querySelectorAll('.recipe-step');
    recipeSteps.forEach(step => {
      const stepText = step.dataset.step;
      if (stepText) {
        step.textContent = this.currentLanguage === 'en' ? 
          `Step ${stepText}` : `${stepText}단계`;
      }
    });
  }
  
  updateWorkoutContent() {
    // Update workout timer specific content
    const workoutLabels = document.querySelectorAll('.workout-label');
    workoutLabels.forEach(label => {
      const type = label.dataset.type;
      if (type === 'work') {
        label.textContent = this.currentLanguage === 'en' ? 'Work' : '운동';
      } else if (type === 'rest') {
        label.textContent = this.currentLanguage === 'en' ? 'Rest' : '휴식';
      }
    });
  }
  
  // Utility method for other timer scripts to use
  static get(key, params = {}) {
    return window.i18n ? window.i18n.get(key, params) : key;
  }
  
  // Announce changes for screen readers
  announceLanguageChange() {
    const message = this.currentLanguage === 'en' ? 
      'Language changed to English' : 
      '언어가 한국어로 변경되었습니다';
    
    // Use existing live region or create one
    let liveRegion = document.querySelector('[aria-live="polite"]');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.timerI18n = new TimerI18nIntegration();
  });
} else {
  window.timerI18n = new TimerI18nIntegration();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimerI18nIntegration;
}