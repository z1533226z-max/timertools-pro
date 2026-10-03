// ===== BASIC TIMER - CLEAN IMPLEMENTATION ===== //

// Screen-reader announcements, errors and notifications per page language
const BASIC_TIMER_STRINGS = {
  ko: {
    titleRunning: '타이머 실행 중',
    startLabel: '시작', continueLabel: '계속',
    started: '타이머가 시작되었습니다',
    paused: '타이머가 일시정지되었습니다',
    resumed: '타이머가 재시작되었습니다',
    reset: '타이머가 초기화되었습니다',
    completed: '타이머가 완료되었습니다!',
    noTime: '시간을 설정해주세요',
    timeSet: (m, s) => `${m}분 ${s}초로 설정되었습니다`,
    leaveWarning: '타이머가 실행 중입니다. 정말 나가시겠습니까?',
    notifyTitle: '타이머 완료!',
    notifyBody: (time) => `${time} 타이머가 완료되었습니다.`,
    pageError: '오류가 발생했습니다. 페이지를 새로고침해주세요.'
  },
  en: {
    titleRunning: 'Timer running',
    startLabel: 'Start', continueLabel: 'Continue',
    started: 'Timer started',
    paused: 'Timer paused',
    resumed: 'Timer resumed',
    reset: 'Timer reset',
    completed: 'Timer finished!',
    noTime: 'Please set a time',
    timeSet: (m, s) => `Set to ${m} min ${s} sec`,
    leaveWarning: 'The timer is still running. Leave this page?',
    notifyTitle: 'Time is up!',
    notifyBody: (time) => `Your ${time} timer has finished.`,
    pageError: 'Something went wrong. Please reload the page.'
  }
};

class BasicTimer {
  constructor() {
    // Timer state
    this.isRunning = false;
    this.isPaused = false;
    this.totalSeconds = 0;
    this.remainingSeconds = 0;
    this.intervalId = null;
    
    // Settings
    this.settings = {
      soundEnabled: true,
      volume: 70
    };
    
    // Audio context for sound
    this.audioContext = null;
    
    // Static page title, restored after the countdown title is shown
    this.originalTitle = document.title;

    // Language support (default to the page's declared language)
    this.currentLanguage = (document.documentElement.lang || 'ko').split('-')[0];
    this.setupLanguageSupport();
    
    // DOM elements (cached for performance)
    this.elements = {};
    
    this.init();
  }
  
  // ===== LANGUAGE SUPPORT ===== //
  // Strings follow currentLanguage, which the language selector can change at runtime
  get t() {
    return BASIC_TIMER_STRINGS[this.currentLanguage] || BASIC_TIMER_STRINGS.ko;
  }

  setupLanguageSupport() {
    // Wait for i18n to be ready
    document.addEventListener('i18n-ready', (event) => {
      this.currentLanguage = event.detail.language;
      this.updateTimerLanguage();
    });
    
    // Listen for language changes
    if (window.i18n) {
      window.i18n.addLanguageChangeObserver((language) => {
        this.currentLanguage = language;
        this.updateTimerLanguage();
      });
    }
  }
  
  updateTimerLanguage() {
    // Update dynamic text content that's not handled by data-i18n
    this.updateButtonText();
    this.updateStatusText();
    this.updatePresetButtons();
  }
  
  updateButtonText() {
    if (!window.i18n) return;
    
    const startBtn = document.querySelector('[data-i18n="timer.start"] .btn-text');
    
    if (startBtn) {
      startBtn.textContent = this.isPaused ? 
        window.i18n.get('timer.continue') : 
        window.i18n.get('timer.start');
    }
  }
  
  updateStatusText() {
    if (!window.i18n) return;
    
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
      let statusKey = 'timer.ready';
      if (this.isRunning) statusKey = 'timer.running';
      else if (this.isPaused) statusKey = 'timer.paused';
      
      statusIndicator.textContent = window.i18n.get(statusKey);
    }
  }
  
  updatePresetButtons() {
    if (!window.i18n) return;
    
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
  
  // ===== INITIALIZATION ===== //
  init() {
    this.cacheElements();
    this.loadSettings();
    this.bindEvents();
    // Show the time from the inputs (e.g. 05:00) instead of 00:00 on load
    this.updateFromInputs();
    
    console.log('✅ Basic Timer initialized');
  }
  
  cacheElements() {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);
    
    this.elements = {
      // Time display
      timeDisplay: $('#time-display'),
      statusIndicator: $('#status-indicator'),
      progressRing: $('.progress-ring-progress'),
      timerSection: $('.timer-display-section'),
      
      // Inputs
      minutesInput: $('#minutes'),
      secondsInput: $('#seconds'),
      
      // Buttons
      startBtn: $('#start-btn'),
      pauseBtn: $('#pause-btn'),
      resetBtn: $('#reset-btn'),
      presetBtns: $$('.preset-btn'),
      
      // Settings
      settingsToggle: $('.settings-toggle'),
      settingsPanel: $('#settings-panel'),
      settingsClose: $('.settings-close'),
      toggleArrow: $('.toggle-arrow'),
      soundEnabledCheckbox: $('#sound-enabled'),
      volumeSlider: $('#volume'),
      volumeValue: $('.volume-value'),
      fullscreenBtn: $('#fullscreen-btn'),
      
      // Accessibility
      announcements: $('#announcements')
    };
  }
  
  // ===== EVENT BINDING ===== //
  bindEvents() {
    // Timer controls
    this.elements.startBtn.addEventListener('click', () => this.start());
    this.elements.pauseBtn.addEventListener('click', () => this.pause());
    this.elements.resetBtn.addEventListener('click', () => this.reset());
    
    // Input changes
    this.elements.minutesInput.addEventListener('input', () => this.updateFromInputs());
    this.elements.secondsInput.addEventListener('input', () => this.updateFromInputs());
    
    // Preset buttons
    this.elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        const seconds = parseInt(btn.dataset.seconds);
        this.setTime(minutes, seconds);
      });
    });
    
    // Settings
    this.elements.settingsToggle.addEventListener('click', () => this.toggleSettings());
    this.elements.settingsClose?.addEventListener('click', () => this.closeSettings());
    this.elements.soundEnabledCheckbox.addEventListener('change', () => this.updateSettings());
    this.elements.volumeSlider.addEventListener('input', () => this.updateVolume());
    this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Page visibility for tab title updates
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    // Prevent page unload during timer
    window.addEventListener('beforeunload', (e) => {
      if (this.isRunning) {
        e.preventDefault();
        e.returnValue = this.t.leaveWarning;
      }
    });
  }
  
  // ===== TIMER LOGIC ===== //
  start() {
    if (this.isPaused) {
      this.resume();
      return;
    }
    
    this.updateFromInputs();
    
    if (this.totalSeconds <= 0) {
      this.showError(this.t.noTime);
      this.elements.minutesInput.focus();
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.remainingSeconds = this.totalSeconds;
    
    // Record timer start
    if (window.recordTimerStart) {
      window.recordTimerStart('basic');
    }
    
    // Initialize audio context on user interaction
    this.initAudio();
    
    this.updateButtons();
    this.disableInputs();
    this.updateStatus('running');
    this.updateTimerClass('running');
    
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();
      this.updateProgress();
      this.updatePageTitle();
      
      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);
    
    this.announce(this.t.started);
  }
  
  pause() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPaused = true;
    
    clearInterval(this.intervalId);
    this.updateButtons();
    this.updateStatus('paused');
    this.updateTimerClass('paused');
    
    this.announce(this.t.paused);
  }
  
  resume() {
    if (!this.isPaused) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    this.updateButtons();
    this.updateStatus('running');
    this.updateTimerClass('running');
    
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();
      this.updateProgress();
      this.updatePageTitle();
      
      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);
    
    this.announce(this.t.resumed);
  }
  
  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.remainingSeconds = 0;
    
    clearInterval(this.intervalId);
    
    this.enableInputs();
    this.updateButtons();
    this.updateStatus('ready');
    this.updateTimerClass('ready');
    this.resetPageTitle();
    
    // Reset to input values
    this.updateFromInputs();
    this.updateDisplay();
    this.updateProgress();
    
    this.announce(this.t.reset);
  }
  
  complete() {
    this.isRunning = false;
    this.isPaused = false;
    this.remainingSeconds = 0;
    
    clearInterval(this.intervalId);
    
    // Record statistics
    if (window.recordTimerComplete && this.totalSeconds > 0) {
      const minutes = Math.ceil(this.totalSeconds / 60);
      window.recordTimerComplete('basic', minutes);
    }
    
    // Save settings and stats if available
    if (window.timerSettings && this.totalSeconds > 0) {
      window.timerSettings.recordSession(Math.ceil(this.totalSeconds / 60), 'basic');
    }
    
    this.updateDisplay();
    this.updateProgress();
    this.updateButtons();
    this.enableInputs();
    this.updateStatus('finished');
    this.updateTimerClass('completed');
    this.resetPageTitle();
    
    this.playCompletionSound();
    this.showNotification();
    this.announce(this.t.completed);
  }
  
  // ===== DISPLAY UPDATES ===== //
  updateDisplay() {
    const seconds = this.isRunning || this.isPaused ? this.remainingSeconds : this.totalSeconds;
    const formatted = this.formatTime(seconds);
    this.elements.timeDisplay.textContent = formatted;
  }
  
  updateProgress() {
    const circumference = 754; // 2 * π * 120 (radius)
    const seconds = this.isRunning || this.isPaused ? this.remainingSeconds : this.totalSeconds;
    
    if (this.totalSeconds > 0) {
      const progress = seconds / this.totalSeconds;
      const offset = circumference * (1 - progress);
      this.elements.progressRing.style.strokeDashoffset = offset;
    } else {
      this.elements.progressRing.style.strokeDashoffset = circumference;
    }
  }
  
  updateButtons() {
    if (this.isRunning) {
      this.elements.startBtn.style.display = 'none';
      this.elements.pauseBtn.style.display = 'inline-flex';
    } else {
      this.elements.startBtn.style.display = 'inline-flex';
      this.elements.pauseBtn.style.display = 'none';
      
      // Update start button text
      const btnText = this.elements.startBtn.querySelector('.btn-text');
      const textKey = this.isPaused ? 'timer.continue' : 'timer.start';
      const translatedText = window.i18n ? window.i18n.get(textKey) : (this.isPaused ? this.t.continueLabel : this.t.startLabel);
      btnText.textContent = translatedText;
      btnText.setAttribute('data-i18n', textKey);
    }
  }
  
  updateStatus(status) {
    // Use i18n if available, otherwise use the status directly
    const translatedStatus = window.i18n ? window.i18n.get(`timer.${status}`) : status;
    this.elements.statusIndicator.textContent = translatedStatus;
    
    // Update data-i18n attribute for future language changes
    this.elements.statusIndicator.setAttribute('data-i18n', `timer.${status}`);
  }
  
  updateTimerClass(state) {
    this.elements.timerSection.className = `timer-display-section timer-${state}`;
  }
  
  updatePageTitle() {
    if (this.isRunning && this.remainingSeconds > 0) {
      const timeStr = this.formatTime(this.remainingSeconds);
      document.title = `${timeStr} - ${this.t.titleRunning}`;
    }
  }
  
  resetPageTitle() {
    document.title = this.originalTitle;
  }
  
  // ===== TIME MANAGEMENT ===== //
  updateFromInputs() {
    // Each page sets its own limit on the minutes input (e.g. max="99" on the 60/90-minute pages)
    const maxMinutes = parseInt(this.elements.minutesInput.max) || 59;
    const minutes = Math.max(0, Math.min(maxMinutes, parseInt(this.elements.minutesInput.value) || 0));
    const seconds = Math.max(0, Math.min(59, parseInt(this.elements.secondsInput.value) || 0));
    
    // Update inputs with validated values
    this.elements.minutesInput.value = minutes;
    this.elements.secondsInput.value = seconds;
    
    this.totalSeconds = (minutes * 60) + seconds;
    
    if (!this.isRunning && !this.isPaused) {
      this.updateDisplay();
      this.updateProgress();
    }
  }
  
  setTime(minutes, seconds) {
    if (this.isRunning) return; // Don't change time while running
    
    this.elements.minutesInput.value = minutes;
    this.elements.secondsInput.value = seconds;
    this.updateFromInputs();
    
    this.announce(this.t.timeSet(minutes, seconds));
  }
  
  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // ===== INPUT CONTROL ===== //
  disableInputs() {
    this.elements.minutesInput.disabled = true;
    this.elements.secondsInput.disabled = true;
    this.elements.presetBtns.forEach(btn => btn.disabled = true);
  }
  
  enableInputs() {
    this.elements.minutesInput.disabled = false;
    this.elements.secondsInput.disabled = false;
    this.elements.presetBtns.forEach(btn => btn.disabled = false);
  }
  
  // ===== SETTINGS ===== //
  toggleSettings() {
    const isExpanded = this.elements.settingsToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    this.elements.settingsToggle.setAttribute('aria-expanded', newState);
    this.elements.settingsPanel.hidden = !newState;
    
    // Update arrow direction
    if (this.elements.toggleArrow) {
      this.elements.toggleArrow.textContent = newState ? '▲' : '▼';
    }
  }
  
  closeSettings() {
    this.elements.settingsToggle.setAttribute('aria-expanded', 'false');
    this.elements.settingsPanel.hidden = true;
    
    // Update arrow direction
    if (this.elements.toggleArrow) {
      this.elements.toggleArrow.textContent = '▼';
    }
  }
  
  updateSettings() {
    this.settings.soundEnabled = this.elements.soundEnabledCheckbox.checked;
    this.saveSettings();
  }
  
  updateVolume() {
    this.settings.volume = parseInt(this.elements.volumeSlider.value);
    this.elements.volumeValue.textContent = `${this.settings.volume}%`;
    this.saveSettings();
  }
  
  loadSettings() {
    const saved = localStorage.getItem('basic-timer-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
    
    // Apply settings to UI
    if (this.elements.soundEnabledCheckbox) {
      this.elements.soundEnabledCheckbox.checked = this.settings.soundEnabled;
    }
    if (this.elements.volumeSlider) {
      this.elements.volumeSlider.value = this.settings.volume;
      this.elements.volumeValue.textContent = `${this.settings.volume}%`;
    }
  }
  
  saveSettings() {
    localStorage.setItem('basic-timer-settings', JSON.stringify(this.settings));
  }
  
  // ===== AUDIO ===== //
  initAudio() {
    if (!this.audioContext && this.settings.soundEnabled) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Audio not available:', e);
      }
    }
  }
  
  playCompletionSound() {
    if (!this.settings.soundEnabled || this.settings.volume === 0) return;
    
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Create a pleasant completion sound
      const duration = 0.8;
      const frequency1 = 523.25; // C5
      const frequency2 = 659.25; // E5
      const frequency3 = 783.99; // G5
      
      [frequency1, frequency2, frequency3].forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, duration * 0.6, this.settings.volume / 100);
        }, index * 200);
      });
      
    } catch (e) {
      console.warn('Could not play completion sound:', e);
    }
  }
  
  playTone(frequency, duration, volume) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  // ===== NOTIFICATIONS ===== //
  showNotification() {
    // Request permission first if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
      return;
    }
    
    // Show notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const timeStr = this.formatTime(this.totalSeconds);
      const notification = new Notification(this.t.notifyTitle, {
        body: this.t.notifyBody(timeStr),
        icon: '/assets/images/favicon.svg', // absolute: also used from /en/timer/ pages
        tag: 'timer-complete'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setTimeout(() => notification.close(), 5000);
    }
    
    // Visual notification (screen flash)
    document.body.style.animation = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.animation = 'flash 0.5s ease-in-out 3';
    
    setTimeout(() => {
      document.body.style.animation = '';
    }, 1500);
  }
  
  // ===== KEYBOARD SHORTCUTS ===== //
  handleKeyboard(e) {
    // Don't interfere with typing in inputs
    if (e.target.tagName === 'INPUT') return;
    
    switch (e.key) {
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        if (this.isRunning) {
          this.pause();
        } else {
          this.start();
        }
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        this.reset();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  }
  
  // ===== FULLSCREEN ===== //
  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.elements.timerSection.requestFullscreen().catch(err => {
        console.warn('Could not enter fullscreen:', err);
      });
    }
  }
  
  // ===== ACCESSIBILITY ===== //
  announce(message) {
    if (this.elements.announcements) {
      this.elements.announcements.textContent = message;
    }
  }
  
  showError(message) {
    this.announce(message);
    // Add visual error indication
    this.elements.timerSection.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      this.elements.timerSection.style.animation = '';
    }, 500);
  }
  
  // ===== UTILITY ===== //
  handleVisibilityChange() {
    // Adjust for time spent in background (basic implementation)
    if (!document.hidden && this.isRunning && this.hiddenTime) {
      const elapsed = Math.floor((Date.now() - this.hiddenTime) / 1000);
      this.remainingSeconds = Math.max(0, this.remainingSeconds - elapsed);
      
      if (this.remainingSeconds <= 0) {
        this.complete();
      } else {
        this.updateDisplay();
        this.updateProgress();
      }
      
      this.hiddenTime = null;
    } else if (document.hidden && this.isRunning) {
      this.hiddenTime = Date.now();
    }
  }
}

// Add flash animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes flash {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(102, 126, 234, 0.1); }
  }
`;
document.head.appendChild(style);

// Initialize timer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.basicTimer = new BasicTimer();
});

// Error handling
window.addEventListener('error', (e) => {
  console.error('기본 타이머 오류:', e.error);
  if (window.basicTimer && window.basicTimer.elements.announcements) {
    window.basicTimer.announce(window.basicTimer.t.pageError);
  }
});