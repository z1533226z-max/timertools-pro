// ===== POMODORO.JS - Pomodoro Timer Functionality ===== //

class PomodoroTimer {
  constructor() {
    // Timer state
    this.timeLeft = 0;
    this.initialTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.intervalId = null;
    
    // Session management
    this.currentSession = 'work'; // 'work', 'short-break', 'long-break'
    this.sessionCount = 0;
    this.completedPomodoros = 0;
    this.totalWorkTime = 0;
    this.totalBreakTime = 0;
    
    // Settings
    this.settings = this.loadSettings();
    this.stats = this.loadStats();
    
    // Task management
    this.currentTask = '';
    this.currentTags = ['업무'];
    this.currentNotes = '';
    this.taskHistory = this.loadTaskHistory();
    
    // Notifications
    this.notificationPermission = 'default';
    
    this.init();
  }
  
  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.setupNotifications();
    this.setupAudio();
    this.loadInitialState();
    this.updateDisplay();
    this.updateStats();
    this.updateTomatoProgress();
    console.log('뽀모도로 타이머 초기화 완료');
  }
  
  // ===== DOM CACHING ===== //
  cacheDOMElements() {
    // Timer display
    this.display = document.getElementById('pomodoro-display');
    this.statusDisplay = document.getElementById('pomodoro-status');
    this.progressCircle = document.querySelector('.pomodoro-progress');
    this.pomodoroSection = document.querySelector('.pomodoro-section');
    
    // Session info
    this.sessionTypeDisplay = document.getElementById('session-type');
    this.sessionCountDisplay = document.getElementById('session-count');
    
    // Control buttons
    this.startBtn = document.getElementById('pomodoro-start');
    this.pauseBtn = document.getElementById('pomodoro-pause');
    this.skipBtn = document.getElementById('pomodoro-skip');
    this.resetBtn = document.getElementById('pomodoro-reset');
    
    // Tomato progress
    this.tomatoIcons = document.getElementById('tomato-icons');
    this.dailyGoalDisplay = document.getElementById('daily-goal');
    this.completedCountDisplay = document.getElementById('completed-count');
    
    // Statistics
    this.dailyPomodorosDisplay = document.getElementById('daily-pomodoros');
    this.dailyTargetDisplay = document.getElementById('daily-target');
    this.focusTimeDisplay = document.getElementById('focus-time');
    this.breakTimeDisplay = document.getElementById('break-time');
    
    // Settings
    this.workDurationSelect = document.getElementById('work-duration');
    this.shortBreakSelect = document.getElementById('short-break');
    this.longBreakSelect = document.getElementById('long-break');
    this.dailyGoalInput = document.getElementById('daily-goal-input');
    this.autoStartBreaksCheckbox = document.getElementById('auto-start-breaks');
    this.autoStartWorkCheckbox = document.getElementById('auto-start-work');
    
    // Advanced settings
    this.settingsToggle = document.querySelector('.pomodoro-settings-panel .settings-toggle');
    this.settingsContent = document.getElementById('pomodoro-settings-content');
    this.workEndSoundSelect = document.getElementById('work-end-sound');
    this.breakEndSoundSelect = document.getElementById('break-end-sound');
    this.sessionRemindersCheckbox = document.getElementById('session-reminders');
    this.encourageNotificationsCheckbox = document.getElementById('encourage-notifications');
    this.pomodoroThemeSelect = document.getElementById('pomodoro-theme');
    this.minimalModeCheckbox = document.getElementById('minimal-mode');
    this.progressAnimationsCheckbox = document.getElementById('progress-animations');
    this.pomodoroFullscreenBtn = document.getElementById('pomodoro-fullscreen');
    this.trackProductivityCheckbox = document.getElementById('track-productivity');
    this.exportDataCheckbox = document.getElementById('export-data');
    this.resetStatsBtn = document.getElementById('reset-stats');
    
    // Task management
    this.currentTaskInput = document.getElementById('current-task-input');
    this.saveTaskBtn = document.getElementById('save-task-btn');
    this.tagList = document.getElementById('tag-list');
    this.tagButtons = document.querySelectorAll('.tag-btn');
    this.customTagInput = document.getElementById('custom-tag-input');
    this.addTagBtn = document.getElementById('add-tag-btn');
    this.taskNotesInput = document.getElementById('task-notes-input');
    this.notesCount = document.getElementById('notes-count');
    
    // Audio
    this.workCompleteAudio = document.getElementById('work-complete-audio');
    this.breakCompleteAudio = document.getElementById('break-complete-audio');
    
    // Live region for screen reader announcements
    this.liveRegion = document.querySelector('[aria-live]');
  }
  
  // ===== EVENT BINDING ===== //
  bindEvents() {
    // Control buttons
    this.startBtn.addEventListener('click', () => this.start());
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.skipBtn.addEventListener('click', () => this.skip());
    this.resetBtn.addEventListener('click', () => this.reset());
    
    // Settings
    this.workDurationSelect.addEventListener('change', () => this.updateWorkDuration());
    this.shortBreakSelect.addEventListener('change', () => this.updateShortBreakDuration());
    this.longBreakSelect.addEventListener('change', () => this.updateLongBreakDuration());
    this.dailyGoalInput.addEventListener('change', () => this.updateDailyGoal());
    this.autoStartBreaksCheckbox.addEventListener('change', () => this.updateAutoStartBreaks());
    this.autoStartWorkCheckbox.addEventListener('change', () => this.updateAutoStartWork());
    
    // Advanced settings
    this.settingsToggle.addEventListener('click', () => this.toggleAdvancedSettings());
    this.workEndSoundSelect.addEventListener('change', () => this.updateWorkEndSound());
    this.breakEndSoundSelect.addEventListener('change', () => this.updateBreakEndSound());
    this.sessionRemindersCheckbox.addEventListener('change', () => this.updateSessionReminders());
    this.encourageNotificationsCheckbox.addEventListener('change', () => this.updateEncourageNotifications());
    this.pomodoroThemeSelect.addEventListener('change', () => this.updateTheme());
    this.minimalModeCheckbox.addEventListener('change', () => this.updateMinimalMode());
    this.progressAnimationsCheckbox.addEventListener('change', () => this.updateProgressAnimations());
    this.pomodoroFullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.trackProductivityCheckbox.addEventListener('change', () => this.updateTrackProductivity());
    this.exportDataCheckbox.addEventListener('change', () => this.updateExportData());
    this.resetStatsBtn.addEventListener('click', () => this.resetStats());
    
    // Task management
    this.currentTaskInput.addEventListener('input', () => this.validateTaskInput());
    this.saveTaskBtn.addEventListener('click', () => this.saveCurrentTask());
    this.currentTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveCurrentTask();
    });
    
    this.tagButtons.forEach(btn => {
      btn.addEventListener('click', () => this.toggleTag(btn));
    });
    
    this.addTagBtn.addEventListener('click', () => this.addCustomTag());
    this.customTagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addCustomTag();
    });
    
    this.taskNotesInput.addEventListener('input', () => this.updateNotesCounter());
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Visibility change handling
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    // Beforeunload warning
    window.addEventListener('beforeunload', (e) => {
      if (this.isRunning) {
        e.preventDefault();
        e.returnValue = '뽀모도로 타이머가 실행 중입니다. 정말 페이지를 나가시겠습니까?';
      }
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only respond if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'spacebar':
          e.preventDefault();
          this.isRunning ? this.pause() : this.start();
          break;
        case 's':
          e.preventDefault();
          this.skip();
          break;
        case 'r':
          e.preventDefault();
          this.reset();
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.toggleFullscreen();
          }
          break;
        case 'escape':
          if (document.fullscreenElement) {
            this.exitFullscreen();
          }
          break;
      }
    });
  }
  
  // ===== TIMER LOGIC ===== //
  start() {
    if (this.isPaused) {
      this.resume();
      return;
    }
    
    if (!this.timeLeft) {
      this.setSessionTime();
    }
    
    if (this.timeLeft <= 0) {
      this.announceToScreenReader('타이머를 시작할 수 없습니다');
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.initialTime = this.timeLeft;
    
    this.updateButtonStates();
    this.updateTimerState();
    this.updateSessionInfo();
    
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      this.updateProgress();
      
      // 5분 전 알림
      if (this.settings.sessionReminders && this.timeLeft === 300) {
        this.showReminderNotification();
      }
      
      if (this.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);
    
    this.announceToScreenReader(`${this.getSessionTypeText()} 세션이 시작되었습니다`);
    this.trackEvent('pomodoro', 'session_start', this.currentSession);
  }
  
  pause() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPaused = true;
    
    clearInterval(this.intervalId);
    this.updateButtonStates();
    this.updateTimerState();
    
    this.announceToScreenReader('타이머가 일시정지되었습니다');
    this.trackEvent('pomodoro', 'session_pause', this.currentSession);
  }
  
  resume() {
    if (!this.isPaused || this.timeLeft <= 0) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    this.updateButtonStates();
    this.updateTimerState();
    
    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      this.updateProgress();
      
      if (this.settings.sessionReminders && this.timeLeft === 300) {
        this.showReminderNotification();
      }
      
      if (this.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);
    
    this.announceToScreenReader('타이머가 재시작되었습니다');
    this.trackEvent('pomodoro', 'session_resume', this.currentSession);
  }
  
  skip() {
    if (!this.isRunning && !this.isPaused) return;
    
    this.completeSession(true);
    this.trackEvent('pomodoro', 'session_skip', this.currentSession);
  }
  
  reset() {
    this.isRunning = false;
    this.isPaused = false;
    
    clearInterval(this.intervalId);
    
    this.currentSession = 'work';
    this.sessionCount = 0;
    this.setSessionTime();
    this.updateDisplay();
    this.updateProgress();
    this.updateButtonStates();
    this.updateTimerState();
    this.updateSessionInfo();
    
    this.announceToScreenReader('뽀모도로 타이머가 초기화되었습니다');
    this.trackEvent('pomodoro', 'timer_reset');
  }
  
  completeSession(skipped = false) {
    this.isRunning = false;
    this.isPaused = false;
    this.timeLeft = 0;
    
    clearInterval(this.intervalId);
    
    // Record session data
    this.recordSessionData(skipped);
    
    // Update statistics
    if (this.currentSession === 'work' && !skipped) {
      this.completedPomodoros++;
      this.stats.daily.completed++;
      this.stats.total.completed++;
      this.updateTomatoProgress();
    }
    
    // Play completion sound and show notification
    if (!skipped) {
      this.playCompletionSound();
      this.showCompletionNotification();
    }
    
    this.updateDisplay();
    this.updateProgress();
    this.updateButtonStates();
    this.updateTimerState('finished');
    this.updateStats();
    
    // Move to next session
    this.moveToNextSession();
    
    this.announceToScreenReader(`${this.getSessionTypeText()} 세션이 완료되었습니다!`);
    this.trackEvent('pomodoro', 'session_complete', this.currentSession);
  }
  
  moveToNextSession() {
    if (this.currentSession === 'work') {
      this.sessionCount++;
      
      // Every 4th pomodoro gets a long break
      if (this.sessionCount % 4 === 0) {
        this.currentSession = 'long-break';
      } else {
        this.currentSession = 'short-break';
      }
    } else {
      this.currentSession = 'work';
    }
    
    this.setSessionTime();
    this.updateSessionInfo();
    this.updateTimerState();
    
    // Auto-start next session if enabled
    if (this.shouldAutoStartNextSession()) {
      setTimeout(() => {
        this.start();
      }, 3000);
    }
  }
  
  shouldAutoStartNextSession() {
    if (this.currentSession === 'work') {
      return this.settings.autoStartWork;
    } else {
      return this.settings.autoStartBreaks;
    }
  }
  
  // ===== SESSION MANAGEMENT ===== //
  setSessionTime() {
    switch (this.currentSession) {
      case 'work':
        this.timeLeft = this.settings.workDuration;
        break;
      case 'short-break':
        this.timeLeft = this.settings.shortBreakDuration;
        break;
      case 'long-break':
        this.timeLeft = this.settings.longBreakDuration;
        break;
    }
    this.initialTime = this.timeLeft;
  }
  
  getSessionTypeText() {
    switch (this.currentSession) {
      case 'work':
        return '작업 중';
      case 'short-break':
        return '짧은 휴식';
      case 'long-break':
        return '긴 휴식';
      default:
        return '준비';
    }
  }
  
  recordSessionData(skipped = false) {
    if (!this.settings.trackProductivity) return;
    
    const sessionData = {
      type: this.currentSession,
      startTime: new Date(Date.now() - (this.initialTime - this.timeLeft) * 1000),
      endTime: new Date(),
      duration: this.initialTime - this.timeLeft,
      completed: !skipped,
      task: this.currentTask,
      tags: [...this.currentTags],
      notes: this.currentNotes
    };
    
    // Add to task history
    this.taskHistory.push(sessionData);
    
    // Keep only last 100 sessions
    if (this.taskHistory.length > 100) {
      this.taskHistory = this.taskHistory.slice(-100);
    }
    
    this.saveTaskHistory();
    
    // Update time tracking
    if (!skipped) {
      if (this.currentSession === 'work') {
        this.totalWorkTime += this.initialTime;
        this.stats.daily.focusTime += this.initialTime;
        this.stats.total.focusTime += this.initialTime;
      } else {
        this.totalBreakTime += this.initialTime;
        this.stats.daily.breakTime += this.initialTime;
        this.stats.total.breakTime += this.initialTime;
      }
    }
    
    this.saveStats();
  }
  
  // ===== DISPLAY UPDATES ===== //
  updateDisplay() {
    const formatted = this.formatTime(this.timeLeft);
    this.display.textContent = formatted;
    
    // Update status
    if (this.isRunning) {
      this.statusDisplay.textContent = '실행 중';
    } else if (this.isPaused) {
      this.statusDisplay.textContent = '일시정지';
    } else if (this.timeLeft === 0) {
      this.statusDisplay.textContent = '완료';
    } else {
      this.statusDisplay.textContent = '준비';
    }
    
    // Update page title
    if (this.isRunning) {
      document.title = `${formatted} - ${this.getSessionTypeText()}`;
    } else {
      document.title = 'TimerTools Pro - 뽀모도로 타이머';
    }
  }
  
  updateProgress() {
    if (this.initialTime > 0) {
      const progress = (this.initialTime - this.timeLeft) / this.initialTime;
      const circumference = 2 * Math.PI * 90;
      const offset = circumference * (1 - progress);
      this.progressCircle.style.strokeDashoffset = offset;
    }
  }
  
  updateButtonStates() {
    if (this.isRunning) {
      this.startBtn.style.display = 'none';
      this.pauseBtn.style.display = 'inline-flex';
    } else {
      this.startBtn.style.display = 'inline-flex';
      this.pauseBtn.style.display = 'none';
      
      if (this.isPaused) {
        this.startBtn.querySelector('.btn-text').textContent = '계속';
      } else {
        this.startBtn.querySelector('.btn-text').textContent = '시작';
      }
    }
  }
  
  updateTimerState(state = null) {
    const actualState = state || (this.isRunning ? 'running' : (this.isPaused ? 'paused' : 'ready'));
    this.pomodoroSection.className = `pomodoro-section ${this.currentSession} ${actualState}`;
    this.progressCircle.setAttribute('class', `pomodoro-progress ${this.currentSession}`);
  }
  
  updateSessionInfo() {
    this.sessionTypeDisplay.textContent = this.getSessionTypeText();
    this.sessionTypeDisplay.className = `session-type ${this.currentSession}`;
    
    const sessionInCycle = ((this.sessionCount - 1) % 4) + 1;
    const totalSessions = this.sessionCount || 1;
    this.sessionCountDisplay.textContent = `(${sessionInCycle}/4)`;
  }
  
  updateTomatoProgress() {
    const tomatoElements = this.tomatoIcons.children;
    const goal = this.settings.dailyGoal;
    
    // Update tomato icons
    for (let i = 0; i < tomatoElements.length; i++) {
      const tomato = tomatoElements[i];
      if (i < this.completedPomodoros) {
        tomato.className = 'tomato completed';
        tomato.textContent = '🍅';
        tomato.setAttribute('aria-label', '완료된 뽀모도로');
      } else if (i < goal) {
        tomato.className = 'tomato pending';
        tomato.textContent = '⚪';
        tomato.setAttribute('aria-label', '미완료 뽀모도로');
      } else {
        tomato.style.display = 'none';
      }
    }
    
    // Show/hide tomatoes based on daily goal
    for (let i = 0; i < tomatoElements.length; i++) {
      tomatoElements[i].style.display = i < goal ? 'inline' : 'none';
    }
    
    // Update progress text
    this.dailyGoalDisplay.textContent = `목표: ${goal} 뽀모도로`;
    this.completedCountDisplay.textContent = `완료: ${this.completedPomodoros}`;
  }
  
  updateStats() {
    this.dailyPomodorosDisplay.textContent = this.completedPomodoros;
    this.dailyTargetDisplay.textContent = this.settings.dailyGoal;
    this.focusTimeDisplay.textContent = this.formatDuration(this.totalWorkTime);
    this.breakTimeDisplay.textContent = this.formatDuration(this.totalBreakTime);
  }
  
  // ===== SETTINGS ===== //
  updateWorkDuration() {
    this.settings.workDuration = parseInt(this.workDurationSelect.value);
    if (this.currentSession === 'work' && !this.isRunning) {
      this.setSessionTime();
      this.updateDisplay();
    }
    this.saveSettings();
  }
  
  updateShortBreakDuration() {
    this.settings.shortBreakDuration = parseInt(this.shortBreakSelect.value);
    if (this.currentSession === 'short-break' && !this.isRunning) {
      this.setSessionTime();
      this.updateDisplay();
    }
    this.saveSettings();
  }
  
  updateLongBreakDuration() {
    this.settings.longBreakDuration = parseInt(this.longBreakSelect.value);
    if (this.currentSession === 'long-break' && !this.isRunning) {
      this.setSessionTime();
      this.updateDisplay();
    }
    this.saveSettings();
  }
  
  updateDailyGoal() {
    this.settings.dailyGoal = parseInt(this.dailyGoalInput.value);
    this.updateTomatoProgress();
    this.saveSettings();
  }
  
  updateAutoStartBreaks() {
    this.settings.autoStartBreaks = this.autoStartBreaksCheckbox.checked;
    this.saveSettings();
  }
  
  updateAutoStartWork() {
    this.settings.autoStartWork = this.autoStartWorkCheckbox.checked;
    this.saveSettings();
  }
  
  toggleAdvancedSettings() {
    const isExpanded = this.settingsToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;
    
    this.settingsToggle.setAttribute('aria-expanded', newState);
    this.settingsContent.hidden = !newState;
    
    if (newState) {
      this.loadAdvancedSettingsValues();
    }
  }
  
  loadAdvancedSettingsValues() {
    this.workEndSoundSelect.value = this.settings.workEndSound;
    this.breakEndSoundSelect.value = this.settings.breakEndSound;
    this.sessionRemindersCheckbox.checked = this.settings.sessionReminders;
    this.encourageNotificationsCheckbox.checked = this.settings.encourageNotifications;
    this.pomodoroThemeSelect.value = this.settings.theme;
    this.minimalModeCheckbox.checked = this.settings.minimalMode;
    this.progressAnimationsCheckbox.checked = this.settings.progressAnimations;
    this.trackProductivityCheckbox.checked = this.settings.trackProductivity;
    this.exportDataCheckbox.checked = this.settings.exportData;
  }
  
  updateWorkEndSound() {
    this.settings.workEndSound = this.workEndSoundSelect.value;
    this.saveSettings();
  }
  
  updateBreakEndSound() {
    this.settings.breakEndSound = this.breakEndSoundSelect.value;
    this.saveSettings();
  }
  
  updateSessionReminders() {
    this.settings.sessionReminders = this.sessionRemindersCheckbox.checked;
    this.saveSettings();
  }
  
  updateEncourageNotifications() {
    this.settings.encourageNotifications = this.encourageNotificationsCheckbox.checked;
    this.saveSettings();
  }
  
  updateTheme() {
    this.settings.theme = this.pomodoroThemeSelect.value;
    this.pomodoroSection.setAttribute('data-theme', this.settings.theme);
    this.saveSettings();
  }
  
  updateMinimalMode() {
    this.settings.minimalMode = this.minimalModeCheckbox.checked;
    if (this.settings.minimalMode) {
      this.pomodoroSection.classList.add('minimal');
    } else {
      this.pomodoroSection.classList.remove('minimal');
    }
    this.saveSettings();
  }
  
  updateProgressAnimations() {
    this.settings.progressAnimations = this.progressAnimationsCheckbox.checked;
    if (!this.settings.progressAnimations) {
      this.progressCircle.style.transition = 'none';
    } else {
      this.progressCircle.style.transition = 'stroke-dashoffset 1s linear';
    }
    this.saveSettings();
  }
  
  updateTrackProductivity() {
    this.settings.trackProductivity = this.trackProductivityCheckbox.checked;
    this.saveSettings();
  }
  
  updateExportData() {
    this.settings.exportData = this.exportDataCheckbox.checked;
    this.saveSettings();
  }
  
  resetStats() {
    if (confirm('정말로 모든 통계를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      this.stats = this.getDefaultStats();
      this.completedPomodoros = 0;
      this.totalWorkTime = 0;
      this.totalBreakTime = 0;
      this.taskHistory = [];
      
      this.saveStats();
      this.saveTaskHistory();
      this.updateStats();
      this.updateTomatoProgress();
      
      this.announceToScreenReader('통계가 초기화되었습니다');
    }
  }
  
  // ===== TASK MANAGEMENT ===== //
  validateTaskInput() {
    const value = this.currentTaskInput.value.trim();
    this.saveTaskBtn.disabled = value.length === 0;
  }
  
  saveCurrentTask() {
    const task = this.currentTaskInput.value.trim();
    if (task) {
      this.currentTask = task;
      this.announceToScreenReader('작업이 저장되었습니다');
      this.trackEvent('pomodoro', 'task_saved');
    }
  }
  
  toggleTag(button) {
    const tag = button.dataset.tag;
    const isActive = button.classList.contains('active');
    
    if (isActive) {
      button.classList.remove('active');
      const index = this.currentTags.indexOf(tag);
      if (index > -1) {
        this.currentTags.splice(index, 1);
      }
    } else {
      button.classList.add('active');
      if (!this.currentTags.includes(tag)) {
        this.currentTags.push(tag);
      }
    }
  }
  
  addCustomTag() {
    const tagName = this.customTagInput.value.trim();
    if (tagName && tagName.length <= 20) {
      // Create new tag button
      const tagButton = document.createElement('button');
      tagButton.className = 'tag-btn';
      tagButton.dataset.tag = tagName;
      tagButton.textContent = `#${tagName}`;
      tagButton.addEventListener('click', () => this.toggleTag(tagButton));
      
      this.tagList.appendChild(tagButton);
      this.customTagInput.value = '';
      
      this.announceToScreenReader(`새 태그 "${tagName}"이 추가되었습니다`);
    }
  }
  
  updateNotesCounter() {
    const length = this.taskNotesInput.value.length;
    this.notesCount.textContent = length;
    this.currentNotes = this.taskNotesInput.value;
    
    if (length > 450) {
      this.notesCount.style.color = 'var(--warning)';
    } else {
      this.notesCount.style.color = 'var(--text-secondary)';
    }
  }
  
  // ===== NOTIFICATIONS & AUDIO ===== //
  setupNotifications() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      if (this.notificationPermission === 'default') {
        this.requestNotificationPermission();
      }
    }
  }
  
  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        this.notificationPermission = permission;
      });
    }
  }
  
  showCompletionNotification() {
    const sessionText = this.getSessionTypeText();
    
    // Visual notification
    this.pomodoroSection.style.animation = 'celebration 2s ease-in-out';
    setTimeout(() => {
      this.pomodoroSection.style.animation = '';
    }, 2000);
    
    // Desktop notification
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(`${sessionText} 완료!`, {
        body: this.getEncouragementMessage(),
        icon: '../assets/images/tomato-icon.png',
        tag: 'pomodoro-complete'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setTimeout(() => notification.close(), 8000);
    }
  }
  
  showReminderNotification() {
    if (this.settings.sessionReminders) {
      this.announceToScreenReader('5분 남았습니다');
      
      if (this.notificationPermission === 'granted') {
        const notification = new Notification('5분 남았습니다', {
          body: '현재 세션이 곧 종료됩니다.',
          icon: '../assets/images/timer-icon.png',
          tag: 'pomodoro-reminder'
        });
        
        setTimeout(() => notification.close(), 3000);
      }
    }
  }
  
  getEncouragementMessage() {
    if (!this.settings.encourageNotifications) {
      return `${this.formatTime(this.initialTime)} 세션이 완료되었습니다.`;
    }
    
    const messages = {
      work: [
        '훌륭합니다! 25분간 집중하셨네요.',
        '잘하셨어요! 이제 잠시 휴식을 취하세요.',
        '멋져요! 뽀모도로 하나를 완성했습니다.',
        '대단해요! 집중력이 뛰어나시네요.'
      ],
      'short-break': [
        '휴식 시간이 끝났습니다. 다시 집중해볼까요?',
        '재충전 완료! 이제 다음 작업으로 돌아가세요.',
        '좋은 휴식이었습니다. 계속 화이팅!'
      ],
      'long-break': [
        '긴 휴식이 끝났습니다. 새로운 사이클을 시작해보세요!',
        '충분한 휴식을 취하셨네요. 다시 집중 모드로!',
        '훌륭한 진행입니다. 계속 이 페이스로 가세요!'
      ]
    };
    
    const sessionMessages = messages[this.currentSession] || messages.work;
    return sessionMessages[Math.floor(Math.random() * sessionMessages.length)];
  }
  
  setupAudio() {
    this.workCompleteAudio.volume = 0.7;
    this.breakCompleteAudio.volume = 0.7;
  }
  
  playCompletionSound() {
    try {
      if (this.currentSession === 'work') {
        this.workCompleteAudio.currentTime = 0;
        this.workCompleteAudio.play();
      } else {
        this.breakCompleteAudio.currentTime = 0;
        this.breakCompleteAudio.play();
      }
    } catch (e) {
      console.warn('완료 알림음을 재생할 수 없습니다:', e);
    }
  }
  
  // ===== FULLSCREEN ===== //
  toggleFullscreen() {
    if (document.fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }
  
  enterFullscreen() {
    const section = this.pomodoroSection;
    
    if (section.requestFullscreen) {
      section.requestFullscreen();
    } else if (section.webkitRequestFullscreen) {
      section.webkitRequestFullscreen();
    } else if (section.msRequestFullscreen) {
      section.msRequestFullscreen();
    }
    
    section.classList.add('pomodoro-fullscreen');
    this.trackEvent('pomodoro', 'fullscreen_enter');
  }
  
  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    this.pomodoroSection.classList.remove('pomodoro-fullscreen');
    this.trackEvent('pomodoro', 'fullscreen_exit');
  }
  
  // ===== UTILITY FUNCTIONS ===== //
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}.${Math.floor(minutes / 6)}h`;
    } else {
      return `${minutes}m`;
    }
  }
  
  handleVisibilityChange() {
    if (document.hidden && this.isRunning) {
      this.hiddenTime = Date.now();
    } else if (!document.hidden && this.hiddenTime && this.isRunning) {
      const elapsedSeconds = Math.floor((Date.now() - this.hiddenTime) / 1000);
      this.timeLeft = Math.max(0, this.timeLeft - elapsedSeconds);
      
      if (this.timeLeft <= 0) {
        this.completeSession();
      } else {
        this.updateDisplay();
        this.updateProgress();
      }
      
      this.hiddenTime = null;
    }
  }
  
  loadInitialState() {
    // Load settings values
    this.workDurationSelect.value = this.settings.workDuration;
    this.shortBreakSelect.value = this.settings.shortBreakDuration;
    this.longBreakSelect.value = this.settings.longBreakDuration;
    this.dailyGoalInput.value = this.settings.dailyGoal;
    this.autoStartBreaksCheckbox.checked = this.settings.autoStartBreaks;
    this.autoStartWorkCheckbox.checked = this.settings.autoStartWork;
    
    // Set initial session time
    this.setSessionTime();
    
    // Load today's progress
    this.loadTodayProgress();
    
    // Apply theme
    if (this.settings.theme) {
      this.pomodoroSection.setAttribute('data-theme', this.settings.theme);
    }
    
    // Apply minimal mode
    if (this.settings.minimalMode) {
      this.pomodoroSection.classList.add('minimal');
    }
    
    // Apply animation setting
    if (!this.settings.progressAnimations) {
      this.progressCircle.style.transition = 'none';
    }
  }
  
  loadTodayProgress() {
    const today = new Date().toDateString();
    const todayStats = this.stats.daily;
    
    // If it's a new day, reset daily stats
    if (this.stats.lastDate !== today) {
      this.stats.daily = {
        completed: 0,
        focusTime: 0,
        breakTime: 0
      };
      this.stats.lastDate = today;
      this.completedPomodoros = 0;
      this.totalWorkTime = 0;
      this.totalBreakTime = 0;
      this.saveStats();
    } else {
      this.completedPomodoros = todayStats.completed;
      this.totalWorkTime = todayStats.focusTime;
      this.totalBreakTime = todayStats.breakTime;
    }
  }
  
  announceToScreenReader(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }
  }
  
  trackEvent(category, action, value) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        value: value
      });
    }
    console.log(`이벤트: ${category} - ${action} - ${value}`);
  }
  
  // ===== DATA PERSISTENCE ===== //
  loadSettings() {
    const defaultSettings = {
      workDuration: 1500, // 25 minutes
      shortBreakDuration: 300, // 5 minutes
      longBreakDuration: 900, // 15 minutes
      dailyGoal: 8,
      autoStartBreaks: true,
      autoStartWork: true,
      workEndSound: 'bell',
      breakEndSound: 'gentle',
      sessionReminders: true,
      encourageNotifications: true,
      theme: 'classic',
      minimalMode: false,
      progressAnimations: true,
      trackProductivity: true,
      exportData: false
    };
    
    const saved = localStorage.getItem('pomodoro_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  }
  
  saveSettings() {
    localStorage.setItem('pomodoro_settings', JSON.stringify(this.settings));
  }
  
  loadStats() {
    const defaultStats = this.getDefaultStats();
    const saved = localStorage.getItem('pomodoro_stats');
    return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
  }
  
  getDefaultStats() {
    return {
      daily: {
        completed: 0,
        focusTime: 0,
        breakTime: 0
      },
      total: {
        completed: 0,
        focusTime: 0,
        breakTime: 0
      },
      lastDate: new Date().toDateString()
    };
  }
  
  saveStats() {
    localStorage.setItem('pomodoro_stats', JSON.stringify(this.stats));
  }
  
  loadTaskHistory() {
    const saved = localStorage.getItem('pomodoro_task_history');
    return saved ? JSON.parse(saved) : [];
  }
  
  saveTaskHistory() {
    localStorage.setItem('pomodoro_task_history', JSON.stringify(this.taskHistory));
  }
}

// ===== INITIALIZATION ===== //
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroTimer = new PomodoroTimer();
});

// ===== ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
  console.error('뽀모도로 오류:', e.error);
  if (window.pomodoroTimer && window.pomodoroTimer.liveRegion) {
    window.pomodoroTimer.announceToScreenReader('오류가 발생했습니다. 페이지를 새로고침해주세요.');
  }
});