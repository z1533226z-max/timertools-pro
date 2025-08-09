// ===== POMODORO TIMER IMPLEMENTATION ===== //

class PomodoroTimer {
  constructor() {
    // Timer state
    this.isRunning = false;
    this.isPaused = false;
    this.currentSeconds = 0;
    this.totalSeconds = 0;
    this.intervalId = null;
    
    // Session management
    this.sessionType = 'work'; // 'work', 'short-break', 'long-break'
    this.sessionNumber = 1;
    this.completedPomodoros = 0;
    this.dailyGoal = 8;
    
    // Default durations (in seconds)
    this.durations = {
      work: 25 * 60,        // 25 minutes
      shortBreak: 5 * 60,   // 5 minutes
      longBreak: 15 * 60    // 15 minutes
    };
    
    // Settings
    this.settings = {
      autoStartBreaks: true,
      autoStartWork: false,
      soundEnabled: true,
      notificationsEnabled: true,
      volume: 70
    };
    
    // Statistics
    this.stats = {
      todayPomodoros: 0,
      todayFocusTime: 0,
      todayBreakTime: 0
    };
    
    // Initialize
    this.init();
  }
  
  init() {
    // Cache DOM elements
    this.elements = {
      // Display elements
      timeDisplay: document.getElementById('pomodoro-display'),
      statusDisplay: document.getElementById('pomodoro-status'),
      sessionType: document.getElementById('session-type'),
      sessionCount: document.getElementById('session-count'),
      
      // Control buttons
      startBtn: document.getElementById('pomodoro-start'),
      pauseBtn: document.getElementById('pomodoro-pause'),
      skipBtn: document.getElementById('pomodoro-skip'),
      resetBtn: document.getElementById('pomodoro-reset'),
      
      // Progress elements
      progressCircle: document.querySelector('.pomodoro-progress'),
      tomatoIcons: document.getElementById('tomato-icons'),
      completedCount: document.getElementById('completed-count'),
      
      // Settings
      workDuration: document.getElementById('work-duration'),
      shortBreak: document.getElementById('short-break'),
      longBreak: document.getElementById('long-break'),
      dailyGoalInput: document.getElementById('daily-goal-input'),
      autoStartBreaks: document.getElementById('auto-start-breaks'),
      autoStartWork: document.getElementById('auto-start-work'),
      
      // Statistics
      dailyPomodoros: document.getElementById('daily-pomodoros'),
      dailyTarget: document.getElementById('daily-target'),
      focusTime: document.getElementById('focus-time'),
      breakTime: document.getElementById('break-time')
    };
    
    // Load saved settings
    this.loadSettings();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize display
    this.reset();
    
    // Request notification permission
    this.requestNotificationPermission();
  }
  
  setupEventListeners() {
    // Control buttons
    this.elements.startBtn?.addEventListener('click', () => this.start());
    this.elements.pauseBtn?.addEventListener('click', () => this.pause());
    this.elements.skipBtn?.addEventListener('click', () => this.skip());
    this.elements.resetBtn?.addEventListener('click', () => this.reset());
    
    // Settings changes
    this.elements.workDuration?.addEventListener('change', (e) => {
      this.durations.work = parseInt(e.target.value);
      this.saveSettings();
      if (!this.isRunning && this.sessionType === 'work') {
        this.totalSeconds = this.durations.work;
        this.currentSeconds = 0;
        this.updateDisplay();
      }
    });
    
    this.elements.shortBreak?.addEventListener('change', (e) => {
      this.durations.shortBreak = parseInt(e.target.value);
      this.saveSettings();
    });
    
    this.elements.longBreak?.addEventListener('change', (e) => {
      this.durations.longBreak = parseInt(e.target.value);
      this.saveSettings();
    });
    
    this.elements.dailyGoalInput?.addEventListener('change', (e) => {
      this.dailyGoal = parseInt(e.target.value);
      this.updateStatistics();
      this.saveSettings();
    });
    
    this.elements.autoStartBreaks?.addEventListener('change', (e) => {
      this.settings.autoStartBreaks = e.target.checked;
      this.saveSettings();
    });
    
    this.elements.autoStartWork?.addEventListener('change', (e) => {
      this.settings.autoStartWork = e.target.checked;
      this.saveSettings();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (this.isRunning) {
          this.pause();
        } else {
          this.start();
        }
      } else if (e.code === 'Escape') {
        this.reset();
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        this.skip();
      }
    });
    
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isRunning) {
        this.updateDisplay();
      }
    });
  }
  
  start() {
    if (this.isPaused) {
      // Resume from pause
      this.isPaused = false;
      this.isRunning = true;
    } else {
      // Start new session
      this.isRunning = true;
      this.isPaused = false;
      this.currentSeconds = 0;
      this.totalSeconds = this.getDurationForSession();
    }
    
    // Update UI
    this.elements.startBtn.style.display = 'none';
    this.elements.pauseBtn.style.display = 'inline-flex';
    this.updateStatus('실행 중');
    
    // Start timer
    this.intervalId = setInterval(() => this.tick(), 1000);
    
    // Record start
    if (window.recordTimerStart) {
      window.recordTimerStart('pomodoro');
    }
  }
  
  pause() {
    this.isPaused = true;
    this.isRunning = false;
    clearInterval(this.intervalId);
    
    // Update UI
    this.elements.pauseBtn.style.display = 'none';
    this.elements.startBtn.style.display = 'inline-flex';
    this.updateStatus('일시정지');
  }
  
  skip() {
    this.pause();
    this.completeSession(false);
  }
  
  reset() {
    // Stop timer
    this.pause();
    
    // Reset state
    this.sessionType = 'work';
    this.sessionNumber = 1;
    this.currentSeconds = 0;
    this.totalSeconds = this.durations.work;
    
    // Update display
    this.updateDisplay();
    this.updateSessionInfo();
    this.updateStatus('준비');
    
    // Reset UI
    this.elements.pauseBtn.style.display = 'none';
    this.elements.startBtn.style.display = 'inline-flex';
  }
  
  tick() {
    this.currentSeconds++;
    
    if (this.currentSeconds >= this.totalSeconds) {
      this.completeSession(true);
    } else {
      this.updateDisplay();
      this.updateProgress();
    }
  }
  
  completeSession(playSound = true) {
    // Stop timer
    clearInterval(this.intervalId);
    this.isRunning = false;
    
    // Update statistics
    if (this.sessionType === 'work') {
      this.completedPomodoros++;
      this.stats.todayPomodoros++;
      this.stats.todayFocusTime += Math.floor(this.totalSeconds / 60);
      
      // Save to global stats
      if (window.timerSettings) {
        window.timerSettings.recordSession(Math.floor(this.totalSeconds / 60), 'pomodoro');
      }
      if (window.recordTimerComplete) {
        window.recordTimerComplete('pomodoro', Math.floor(this.totalSeconds / 60));
      }
    } else {
      this.stats.todayBreakTime += Math.floor(this.totalSeconds / 60);
    }
    
    // Play notification
    if (playSound) {
      this.playCompletionSound();
      this.showNotification();
    }
    
    // Determine next session
    const nextSession = this.getNextSessionType();
    this.sessionType = nextSession.type;
    if (nextSession.type === 'work') {
      this.sessionNumber = nextSession.number;
    }
    
    // Update display
    this.currentSeconds = 0;
    this.totalSeconds = this.getDurationForSession();
    this.updateDisplay();
    this.updateSessionInfo();
    this.updateTomatoIcons();
    this.updateStatistics();
    this.saveProgress();
    
    // Auto-start next session if enabled
    const shouldAutoStart = (this.sessionType === 'work' && this.settings.autoStartWork) ||
                          (this.sessionType !== 'work' && this.settings.autoStartBreaks);
    
    if (shouldAutoStart) {
      setTimeout(() => this.start(), 1000);
    } else {
      this.elements.pauseBtn.style.display = 'none';
      this.elements.startBtn.style.display = 'inline-flex';
      this.updateStatus('준비');
    }
  }
  
  getNextSessionType() {
    if (this.sessionType === 'work') {
      // After work, take a break
      if (this.completedPomodoros % 4 === 0) {
        return { type: 'long-break', number: this.sessionNumber };
      } else {
        return { type: 'short-break', number: this.sessionNumber };
      }
    } else {
      // After break, start work
      return { type: 'work', number: this.sessionNumber + 1 };
    }
  }
  
  getDurationForSession() {
    switch (this.sessionType) {
      case 'work':
        return this.durations.work;
      case 'short-break':
        return this.durations.shortBreak;
      case 'long-break':
        return this.durations.longBreak;
      default:
        return this.durations.work;
    }
  }
  
  updateDisplay() {
    const remainingSeconds = this.totalSeconds - this.currentSeconds;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    if (this.elements.timeDisplay) {
      this.elements.timeDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update page title when running
    if (this.isRunning) {
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - 뽀모도로 타이머`;
    }
  }
  
  updateProgress() {
    if (this.elements.progressCircle) {
      const progress = this.currentSeconds / this.totalSeconds;
      const circumference = 2 * Math.PI * 90; // radius = 90
      const offset = circumference * (1 - progress);
      
      this.elements.progressCircle.style.strokeDasharray = circumference;
      this.elements.progressCircle.style.strokeDashoffset = offset;
    }
  }
  
  updateSessionInfo() {
    if (this.elements.sessionType) {
      const typeText = {
        'work': '작업 중',
        'short-break': '짧은 휴식',
        'long-break': '긴 휴식'
      };
      this.elements.sessionType.textContent = typeText[this.sessionType];
    }
    
    if (this.elements.sessionCount) {
      this.elements.sessionCount.textContent = `(${this.sessionNumber}/4)`;
    }
  }
  
  updateStatus(status) {
    if (this.elements.statusDisplay) {
      this.elements.statusDisplay.textContent = status;
    }
  }
  
  updateTomatoIcons() {
    if (!this.elements.tomatoIcons) return;
    
    const tomatoes = this.elements.tomatoIcons.querySelectorAll('.tomato');
    tomatoes.forEach((tomato, index) => {
      if (index < this.completedPomodoros) {
        tomato.textContent = '🍅';
        tomato.classList.add('completed');
        tomato.classList.remove('pending');
      } else {
        tomato.textContent = '⚪';
        tomato.classList.remove('completed');
        tomato.classList.add('pending');
      }
    });
    
    if (this.elements.completedCount) {
      this.elements.completedCount.textContent = `완료: ${this.completedPomodoros}`;
    }
  }
  
  updateStatistics() {
    if (this.elements.dailyPomodoros) {
      this.elements.dailyPomodoros.textContent = this.stats.todayPomodoros;
    }
    
    if (this.elements.dailyTarget) {
      this.elements.dailyTarget.textContent = this.dailyGoal;
    }
    
    if (this.elements.focusTime) {
      const hours = Math.floor(this.stats.todayFocusTime / 60);
      const minutes = this.stats.todayFocusTime % 60;
      this.elements.focusTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    
    if (this.elements.breakTime) {
      this.elements.breakTime.textContent = `${this.stats.todayBreakTime}m`;
    }
  }
  
  playCompletionSound() {
    if (!this.settings.soundEnabled) return;
    
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for work vs break
      if (this.sessionType === 'work') {
        // Work complete - cheerful sound
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      } else {
        // Break complete - gentle chime
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C#5
      }
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(this.settings.volume / 100, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silent fail
    }
  }
  
  showNotification() {
    if (!this.settings.notificationsEnabled) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = this.sessionType === 'work' 
        ? '🍅 작업 완료!' 
        : '☕ 휴식 완료!';
      
      const body = this.sessionType === 'work'
        ? `${this.completedPomodoros}개의 뽀모도로를 완료했습니다!`
        : '다시 작업할 시간입니다!';
      
      new Notification(title, {
        body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200]
      });
    }
  }
  
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  
  loadSettings() {
    // Load from localStorage
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // Apply saved settings
        if (data.durations) {
          this.durations = { ...this.durations, ...data.durations };
        }
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
        }
        if (data.dailyGoal) {
          this.dailyGoal = data.dailyGoal;
        }
        
        // Update UI
        if (this.elements.workDuration) {
          this.elements.workDuration.value = this.durations.work;
        }
        if (this.elements.shortBreak) {
          this.elements.shortBreak.value = this.durations.shortBreak;
        }
        if (this.elements.longBreak) {
          this.elements.longBreak.value = this.durations.longBreak;
        }
        if (this.elements.dailyGoalInput) {
          this.elements.dailyGoalInput.value = this.dailyGoal;
        }
        if (this.elements.autoStartBreaks) {
          this.elements.autoStartBreaks.checked = this.settings.autoStartBreaks;
        }
        if (this.elements.autoStartWork) {
          this.elements.autoStartWork.checked = this.settings.autoStartWork;
        }
      } catch (error) {
        // Silent fail
      }
    }
    
    // Load today's progress
    const today = new Date().toDateString();
    const progress = localStorage.getItem('pomodoro_progress');
    if (progress) {
      try {
        const data = JSON.parse(progress);
        if (data.date === today) {
          this.completedPomodoros = data.completedPomodoros || 0;
          this.stats = data.stats || this.stats;
          this.updateTomatoIcons();
          this.updateStatistics();
        }
      } catch (error) {
        // Silent fail
      }
    }
  }
  
  saveSettings() {
    const data = {
      durations: this.durations,
      settings: this.settings,
      dailyGoal: this.dailyGoal
    };
    localStorage.setItem('pomodoro_settings', JSON.stringify(data));
  }
  
  saveProgress() {
    const data = {
      date: new Date().toDateString(),
      completedPomodoros: this.completedPomodoros,
      stats: this.stats
    };
    localStorage.setItem('pomodoro_progress', JSON.stringify(data));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
  });
} else {
  window.pomodoroTimer = new PomodoroTimer();
}