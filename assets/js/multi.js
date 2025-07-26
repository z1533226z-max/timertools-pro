// ===== MULTI TIMER JAVASCRIPT - 설계문서 기반 재구현 ===== //

class MultiTimerManager {
  constructor() {
    this.timers = new Map();
    this.nextTimerId = 1;
    this.settings = {
      notificationSound: 'classic',
      volume: 70,
      autoRemove: true,
      sequentialMode: false
    };
    this.init();
  }

  init() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadFromStorage();
    this.updateSummary();
    this.updateEmptyState();
    this.requestNotificationPermission();
    this.loadSettings();
    console.log('멀티 타이머 매니저 초기화 완료');
  }

  // ===== INITIALIZATION ===== //
  initializeElements() {
    // Main control buttons
    this.addTimerBtn = document.getElementById('add-timer-btn');
    
    // Grid and empty state
    this.timersGrid = document.getElementById('timers-grid');
    this.emptyState = document.getElementById('empty-state');
    
    // Templates
    this.timerTemplate = document.getElementById('timer-card-template');
    
    // Summary elements - updated IDs based on new HTML
    this.totalCountEl = document.getElementById('total-count');
    this.runningCountEl = document.getElementById('running-count');
    this.completedCountEl = document.getElementById('completed-count');
    
    // Settings elements
    this.startAllBtn = document.getElementById('start-all-btn');
    this.stopAllBtn = document.getElementById('stop-all-btn');
    this.resetAllBtn = document.getElementById('reset-all-btn');
    
    // Notification container
    this.notificationContainer = document.getElementById('notification-container');
  }

  setupEventListeners() {
    // Main control buttons
    this.addTimerBtn?.addEventListener('click', () => this.addNewTimer());
    
    // Management settings buttons
    this.startAllBtn?.addEventListener('click', () => this.startAllTimers());
    this.stopAllBtn?.addEventListener('click', () => this.stopAllTimers());
    this.resetAllBtn?.addEventListener('click', () => this.resetAllTimers());
    

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleGlobalKeyboard(e));

    // Page visibility change
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

    // Beforeunload to save state
    window.addEventListener('beforeunload', () => this.saveToStorage());
  }


  // ===== TIMER MANAGEMENT ===== //
  addNewTimer(config = {}) {
    const timerId = this.nextTimerId++;
    const timer = new TimerInstance(timerId, config, this);
    this.timers.set(timerId, timer);
    
    const element = this.createTimerElement(timer);
    this.timersGrid.appendChild(element);
    
    this.updateSummary();
    this.updateEmptyState();
    this.saveToStorage();
    
    // Focus on timer name input
    const nameInput = element.querySelector('.timer-name');
    nameInput?.select();
    
    this.showNotification('success', '타이머 추가됨', `"${timer.name}" 타이머가 추가되었습니다.`);
    
    return timer;
  }

  removeTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    timer.destroy();
    this.timers.delete(timerId);
    
    const element = document.querySelector(`[data-timer-id="${timerId}"]`);
    element?.remove();
    
    this.updateSummary();
    this.updateEmptyState();
    this.saveToStorage();
    
    this.showNotification('success', '타이머 삭제됨', '타이머가 삭제되었습니다.');
  }

  duplicateTimer(timerId) {
    const sourceTimer = this.timers.get(timerId);
    if (!sourceTimer) return;

    const config = {
      name: `${sourceTimer.name} (복사본)`,
      category: sourceTimer.category,
      minutes: sourceTimer.originalMinutes,
      seconds: sourceTimer.originalSeconds
    };

    this.addNewTimer(config);
  }

  startAllTimers() {
    let startedCount = 0;
    this.timers.forEach(timer => {
      if (!timer.isRunning && !timer.isCompleted) {
        timer.start();
        startedCount++;
      }
    });
    
    if (startedCount > 0) {
      this.showNotification('success', '전체 시작', `${startedCount}개의 타이머가 시작되었습니다.`);
    } else {
      this.showNotification('warning', '시작할 수 없음', '시작할 수 있는 타이머가 없습니다.');
    }
  }

  pauseAllTimers() {
    let pausedCount = 0;
    this.timers.forEach(timer => {
      if (timer.isRunning) {
        timer.pause();
        pausedCount++;
      }
    });
    
    if (pausedCount > 0) {
      this.showNotification('success', '전체 일시정지', `${pausedCount}개의 타이머가 일시정지되었습니다.`);
    } else {
      this.showNotification('warning', '일시정지할 수 없음', '실행 중인 타이머가 없습니다.');
    }
  }

  stopAllTimers() {
    this.pauseAllTimers(); // 기능적으로 같음
  }

  resetAllTimers() {
    const confirmed = confirm('모든 타이머를 리셋하시겠습니까?');
    if (!confirmed) return;

    let resetCount = 0;
    this.timers.forEach(timer => {
      timer.reset();
      resetCount++;
    });
    
    this.showNotification('success', '전체 리셋', `${resetCount}개의 타이머가 리셋되었습니다.`);
  }


  // ===== TIMER ELEMENT CREATION ===== //
  createTimerElement(timer) {
    const template = this.timerTemplate.content.cloneNode(true);
    const card = template.querySelector('.timer-card');
    
    card.setAttribute('data-timer-id', timer.id);
    card.className = `timer-card timer-${timer.category}`;
    
    // Set initial values
    const nameInput = card.querySelector('.timer-name');
    const categorySelect = card.querySelector('.timer-category');
    const minutesInput = card.querySelector('.minutes');
    const secondsInput = card.querySelector('.seconds');
    const timerTime = card.querySelector('.timer-time');
    const timerStatus = card.querySelector('.timer-status');
    
    nameInput.value = timer.name;
    categorySelect.value = timer.category;
    minutesInput.value = timer.originalMinutes;
    secondsInput.value = timer.originalSeconds;
    timerTime.textContent = timer.formatTime(timer.remainingSeconds);
    timerStatus.textContent = '준비';
    
    // Set advanced settings values
    const autoRestartCheck = card.querySelector('.auto-restart');
    const soundEnabledCheck = card.querySelector('.sound-enabled');
    const notificationEnabledCheck = card.querySelector('.notification-enabled');
    const repeatCountInput = card.querySelector('.repeat-count');
    
    if (autoRestartCheck) autoRestartCheck.checked = timer.autoRestart;
    if (soundEnabledCheck) soundEnabledCheck.checked = timer.soundEnabled;
    if (notificationEnabledCheck) notificationEnabledCheck.checked = timer.notificationEnabled;
    if (repeatCountInput) repeatCountInput.value = timer.repeatCount;
    
    // Setup event listeners for this timer
    this.setupTimerEventListeners(card, timer);
    
    return card;
  }

  setupTimerEventListeners(card, timer) {
    const timerId = timer.id;
    
    // Name input
    const nameInput = card.querySelector('.timer-name');
    nameInput.addEventListener('input', (e) => {
      timer.setName(e.target.value);
      this.saveToStorage();
    });
    
    // Category select
    const categorySelect = card.querySelector('.timer-category');
    categorySelect.addEventListener('change', (e) => {
      timer.setCategory(e.target.value);
      card.className = `timer-card timer-${timer.category}`;
      this.saveToStorage();
    });
    
    // Time inputs
    const minutesInput = card.querySelector('.minutes');
    const secondsInput = card.querySelector('.seconds');
    
    minutesInput.addEventListener('change', (e) => {
      timer.setTime(parseInt(e.target.value) || 0, timer.originalSeconds);
      this.saveToStorage();
    });
    
    secondsInput.addEventListener('change', (e) => {
      timer.setTime(timer.originalMinutes, parseInt(e.target.value) || 0);
      this.saveToStorage();
    });
    
    // Preset buttons
    const presetBtns = card.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes) || 0;
        timer.setTime(minutes, 0);
        minutesInput.value = minutes;
        secondsInput.value = 0;
        this.saveToStorage();
      });
    });
    
    // Control buttons
    const startBtn = card.querySelector('.start-btn');
    const stopBtn = card.querySelector('.stop-btn');
    const resetBtn = card.querySelector('.reset-btn');
    
    startBtn.addEventListener('click', () => timer.start());
    stopBtn.addEventListener('click', () => timer.pause());
    resetBtn.addEventListener('click', () => timer.reset());
    
    // Action buttons
    const copyBtn = card.querySelector('.copy-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    
    copyBtn.addEventListener('click', () => this.duplicateTimer(timerId));
    deleteBtn.addEventListener('click', () => {
      if (confirm('이 타이머를 삭제하시겠습니까?')) {
        this.removeTimer(timerId);
      }
    });
    
    // Advanced settings
    const autoRestartCheck = card.querySelector('.auto-restart');
    const soundEnabledCheck = card.querySelector('.sound-enabled');
    const notificationEnabledCheck = card.querySelector('.notification-enabled');
    const repeatCountInput = card.querySelector('.repeat-count');
    
    autoRestartCheck.addEventListener('change', (e) => {
      timer.autoRestart = e.target.checked;
      this.saveToStorage();
    });
    
    soundEnabledCheck.addEventListener('change', (e) => {
      timer.soundEnabled = e.target.checked;
      this.saveToStorage();
    });
    
    notificationEnabledCheck.addEventListener('change', (e) => {
      timer.notificationEnabled = e.target.checked;
      this.saveToStorage();
    });
    
    repeatCountInput.addEventListener('change', (e) => {
      timer.repeatCount = parseInt(e.target.value) || 0;
      timer.updateStats();
      this.saveToStorage();
    });
  }

  // ===== UI UPDATES ===== //
  updateSummary() {
    const total = this.timers.size;
    let running = 0;
    let completed = 0;
    
    this.timers.forEach(timer => {
      if (timer.isRunning) running++;
      if (timer.isCompleted) completed++;
    });
    
    if (this.totalCountEl) this.totalCountEl.textContent = total;
    if (this.runningCountEl) this.runningCountEl.textContent = running;
    if (this.completedCountEl) this.completedCountEl.textContent = completed;
  }

  updateEmptyState() {
    if (this.emptyState) {
      this.emptyState.style.display = this.timers.size === 0 ? 'block' : 'none';
    }
  }

  // ===== NOTIFICATIONS & SOUND ===== //
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  showNotification(type, title, message, timerName = null) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: timerName ? `${timerName}: ${message}` : message,
        icon: '../assets/icons/icon-192.png'
      });
      
      setTimeout(() => notification.close(), 5000);
    }
    
    // In-app notification
    this.showInAppNotification(type, title, message);
  }

  showInAppNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    
    notification.innerHTML = `
      <div class="notification-content">
        <strong>${title}</strong>
        <div>${message}</div>
      </div>
    `;
    
    this.notificationContainer.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 4000);
  }

  playNotificationSound() {
    this.createNotificationSound();
  }

  createNotificationSound() {
    if (!this.settings || this.settings.volume === 0) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds based on setting
      const soundConfig = this.getSoundConfig();
      oscillator.frequency.value = soundConfig.frequency;
      oscillator.type = soundConfig.type;
      
      const volume = this.settings.volume / 100 * 0.3;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + soundConfig.duration);
    } catch (error) {
      console.error('오디오 재생 실패:', error);
    }
  }

  getSoundConfig() {
    switch (this.settings.notificationSound) {
      case 'gentle':
        return { frequency: 523.25, type: 'sine', duration: 0.8 };
      case 'sharp':
        return { frequency: 1000, type: 'square', duration: 0.3 };
      case 'chime':
        return { frequency: 659.25, type: 'triangle', duration: 1.0 };
      default: // classic
        return { frequency: 800, type: 'sine', duration: 0.5 };
    }
  }

  testNotificationSound() {
    this.playNotificationSound();
  }

  // ===== KEYBOARD HANDLING ===== //
  handleGlobalKeyboard(e) {
    // Ctrl + Enter = 타이머 추가
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      this.addNewTimer();
    }
    
    // Ctrl + A = 모두 시작
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      this.startAllTimers();
    }
    
    // Ctrl + P = 모두 일시정지
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      this.pauseAllTimers();
    }
  }

  // ===== VISIBILITY HANDLING ===== //
  handleVisibilityChange() {
    if (document.hidden) {
      this.saveToStorage();
    } else {
      this.timers.forEach(timer => timer.updateDisplay());
    }
  }

  // ===== SETTINGS PERSISTENCE ===== //
  saveSettings() {
    localStorage.setItem('multiTimerSettings', JSON.stringify(this.settings));
  }

  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('multiTimerSettings') || '{}');
      this.settings = { ...this.settings, ...settings };
      
      // Update UI elements
      if (this.notificationSoundSelect) {
        this.notificationSoundSelect.value = this.settings.notificationSound;
      }
      if (this.volumeSlider) {
        this.volumeSlider.value = this.settings.volume;
      }
      if (this.autoRemoveCheckbox) {
        this.autoRemoveCheckbox.checked = this.settings.autoRemove;
      }
      if (this.sequentialModeCheckbox) {
        this.sequentialModeCheckbox.checked = this.settings.sequentialMode;
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
    }
  }

  // ===== DATA PERSISTENCE ===== //
  saveToStorage() {
    const data = {
      nextTimerId: this.nextTimerId,
      timers: Array.from(this.timers.values()).map(timer => timer.serialize())
    };
    
    localStorage.setItem('multiTimerData', JSON.stringify(data));
  }

  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('multiTimerData') || '{}');
      
      if (data.nextTimerId) {
        this.nextTimerId = data.nextTimerId;
      }
      
      if (data.timers && Array.isArray(data.timers)) {
        data.timers.forEach(timerData => {
          const timer = new TimerInstance(timerData.id, timerData, this);
          this.timers.set(timer.id, timer);
          
          const element = this.createTimerElement(timer);
          this.timersGrid.appendChild(element);
          
          timer.deserialize(timerData);
        });
      }
    } catch (error) {
      console.error('타이머 데이터 로드 오류:', error);
    }
  }
}

// ===== TIMER INSTANCE CLASS ===== //
class TimerInstance {
  constructor(id, config = {}, manager) {
    this.id = id;
    this.manager = manager;
    this.interval = null;
    
    // Timer state
    this.name = config.name || `타이머 ${id}`;
    this.category = config.category || 'other';
    this.originalMinutes = config.minutes || 5;
    this.originalSeconds = config.seconds || 0;
    this.totalSeconds = this.originalMinutes * 60 + this.originalSeconds;
    this.remainingSeconds = this.totalSeconds;
    
    // Timer status
    this.isRunning = false;
    this.isPaused = false;
    this.isCompleted = false;
    
    // Auto-remove timeout
    this.autoRemoveTimeout = null;
    
    // Advanced settings
    this.autoRestart = false;
    this.soundEnabled = true;
    this.notificationEnabled = true;
    this.repeatCount = 0;
    this.currentRepeats = 0;
  }

  // ===== TIMER CONTROLS ===== //
  start() {
    if (this.isRunning || this.isCompleted) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
    
    this.updateDisplay();
    this.updateButtonStates();
    this.manager.updateSummary();
    this.manager.saveToStorage();
  }

  pause() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPaused = true;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.updateDisplay();
    this.updateButtonStates();
    this.manager.updateSummary();
    this.manager.saveToStorage();
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.isCompleted = false;
    this.remainingSeconds = this.totalSeconds;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (this.autoRemoveTimeout) {
      clearTimeout(this.autoRemoveTimeout);
      this.autoRemoveTimeout = null;
    }
    
    this.updateDisplay();
    this.updateButtonStates();
    this.updateProgress();
    this.manager.updateSummary();
    this.manager.saveToStorage();
  }

  tick() {
    if (this.remainingSeconds <= 0) {
      this.complete();
      return;
    }
    
    this.remainingSeconds--;
    this.updateDisplay();
    this.updateProgress();
  }

  complete() {
    this.isRunning = false;
    this.isCompleted = true;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    // Update repeat count
    this.currentRepeats++;
    
    // Play completion sound if enabled
    if (this.soundEnabled) {
      this.manager.playNotificationSound();
    }
    
    // Show notification if enabled
    if (this.notificationEnabled) {
      this.manager.showNotification(
        'success',
        '타이머 완료!',
        `${this.name}: 시간이 완료되었습니다. (완료: ${this.currentRepeats}회)`,
        this.name
      );
    }
    
    // Check for auto-restart and repeat functionality
    if (this.autoRestart && (this.repeatCount === 0 || this.currentRepeats < this.repeatCount)) {
      setTimeout(() => {
        this.reset();
        this.start();
      }, 2000); // 2 second delay before restart
      return;
    }
    
    // Auto-remove if enabled and no more repeats
    if (this.manager.settings.autoRemove && this.repeatCount > 0 && this.currentRepeats >= this.repeatCount) {
      this.autoRemoveTimeout = setTimeout(() => {
        this.manager.removeTimer(this.id);
      }, 30000); // 30 seconds
    }
    
    this.updateDisplay();
    this.updateButtonStates();
    this.updateProgress();
    this.updateStats();
    this.manager.updateSummary();
    this.manager.saveToStorage();
  }

  // ===== CONFIGURATION ===== //
  setName(name) {
    this.name = name || `타이머 ${this.id}`;
  }
  
  setCategory(category) {
    this.category = category || 'other';
  }
  
  setAdvancedSettings(settings) {
    this.autoRestart = settings.autoRestart || false;
    this.soundEnabled = settings.soundEnabled !== false;
    this.notificationEnabled = settings.notificationEnabled !== false;
    this.repeatCount = settings.repeatCount || 0;
    this.currentRepeats = 0;
  }

  setTime(minutes, seconds) {
    this.originalMinutes = Math.max(0, Math.min(59, minutes));
    this.originalSeconds = Math.max(0, Math.min(59, seconds));
    this.totalSeconds = this.originalMinutes * 60 + this.originalSeconds;
    
    if (!this.isRunning) {
      this.remainingSeconds = this.totalSeconds;
      this.updateDisplay();
      this.updateProgress();
    }
  }

  // ===== UI UPDATES ===== //
  updateDisplay() {
    const card = document.querySelector(`[data-timer-id="${this.id}"]`);
    if (!card) return;
    
    const timerTime = card.querySelector('.timer-time');
    const timerStatus = card.querySelector('.timer-status');
    const progressText = card.querySelector('.progress-text');
    
    if (timerTime) {
      timerTime.textContent = this.formatTime(this.remainingSeconds);
    }
    
    if (timerStatus) {
      timerStatus.textContent = this.getStatusText();
    }
    
    if (progressText) {
      const progress = this.totalSeconds > 0 ? ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds * 100) : 0;
      progressText.textContent = `${Math.round(progress)}%`;
    }
    
    // Update card class
    card.className = `timer-card timer-${this.category} ${this.getStateClass()}`;
    
    // Update stats display
    this.updateStats();
  }

  updateButtonStates() {
    const card = document.querySelector(`[data-timer-id="${this.id}"]`);
    if (!card) return;
    
    const startBtn = card.querySelector('.start-btn');
    const stopBtn = card.querySelector('.stop-btn');
    
    if (this.isRunning) {
      if (startBtn) startBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'flex';
    } else {
      if (startBtn) startBtn.style.display = 'flex';
      if (stopBtn) stopBtn.style.display = 'none';
    }
    
    // Disable inputs when running
    const inputs = card.querySelectorAll('input');
    inputs.forEach(input => {
      input.disabled = this.isRunning;
    });
  }

  updateProgress() {
    const card = document.querySelector(`[data-timer-id="${this.id}"]`);
    if (!card) return;
    
    // Update SVG circle progress
    const progressRingCircle = card.querySelector('.progress-ring-circle');
    if (progressRingCircle) {
      const circumference = 2 * Math.PI * 40; // radius = 40
      const progress = this.totalSeconds > 0 ? (this.totalSeconds - this.remainingSeconds) / this.totalSeconds : 0;
      const offset = circumference - (progress * circumference);
      
      progressRingCircle.style.strokeDasharray = circumference;
      progressRingCircle.style.strokeDashoffset = offset;
    }
    
    // Update progress bar
    const progressFill = card.querySelector('.progress-fill');
    if (progressFill) {
      const progress = this.totalSeconds > 0 ? (this.totalSeconds - this.remainingSeconds) / this.totalSeconds : 0;
      progressFill.style.width = `${progress * 100}%`;
    }
  }

  getStateClass() {
    if (this.isCompleted) return 'completed';
    if (this.isRunning) return 'running';
    if (this.isPaused) return 'paused';
    return '';
  }
  
  getStatusText() {
    if (this.isCompleted) return '완료';
    if (this.isRunning) return '실행중';
    if (this.isPaused) return '일시정지';
    return '준비';
  }
  
  updateStats() {
    const card = document.querySelector(`[data-timer-id="${this.id}"]`);
    if (!card) return;
    
    const completedCountEl = card.querySelector('.completed-count');
    const remainingRepeatsEl = card.querySelector('.remaining-repeats');
    
    if (completedCountEl) {
      completedCountEl.textContent = this.currentRepeats;
    }
    
    if (remainingRepeatsEl) {
      if (this.repeatCount === 0) {
        remainingRepeatsEl.textContent = '∞';
      } else {
        const remaining = Math.max(0, this.repeatCount - this.currentRepeats);
        remainingRepeatsEl.textContent = remaining;
      }
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ===== SERIALIZATION ===== //
  serialize() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      minutes: this.originalMinutes,
      seconds: this.originalSeconds,
      remainingSeconds: this.remainingSeconds,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isCompleted: this.isCompleted,
      autoRestart: this.autoRestart,
      soundEnabled: this.soundEnabled,
      notificationEnabled: this.notificationEnabled,
      repeatCount: this.repeatCount,
      currentRepeats: this.currentRepeats
    };
  }

  deserialize(data) {
    this.name = data.name || this.name;
    this.category = data.category || this.category;
    
    // Restore advanced settings
    this.autoRestart = data.autoRestart || false;
    this.soundEnabled = data.soundEnabled !== false;
    this.notificationEnabled = data.notificationEnabled !== false;
    this.repeatCount = data.repeatCount || 0;
    this.currentRepeats = data.currentRepeats || 0;
    
    // Don't restore running state, reset to paused if was running
    if (data.isRunning) {
      this.isPaused = true;
      this.remainingSeconds = data.remainingSeconds || this.totalSeconds;
    } else {
      this.isPaused = data.isPaused || false;
      this.isCompleted = data.isCompleted || false;
      this.remainingSeconds = data.remainingSeconds || this.totalSeconds;
    }
    
    this.updateDisplay();
    this.updateButtonStates();
    this.updateProgress();
    this.updateStats();
  }

  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (this.autoRemoveTimeout) {
      clearTimeout(this.autoRemoveTimeout);
      this.autoRemoveTimeout = null;
    }
  }
}

// ===== GLOBAL FUNCTIONS ===== //
window.addTimer = function() {
  if (window.multiTimerManager) {
    window.multiTimerManager.addNewTimer();
  }
};

// For empty state button compatibility
window.addNewTimer = window.addTimer;

// ===== INITIALIZATION ===== //
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.multiTimerManager = new MultiTimerManager();
  });
} else {
  window.multiTimerManager = new MultiTimerManager();
}

// ===== ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
  console.error('멀티 타이머 오류:', e.error);
  if (window.multiTimerManager) {
    window.multiTimerManager.showNotification('error', '오류 발생', '예상치 못한 오류가 발생했습니다.');
  }
});