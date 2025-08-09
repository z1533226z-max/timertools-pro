// ===== MULTI TIMER IMPLEMENTATION ===== //

class MultiTimer {
  constructor() {
    this.timers = [];
    this.maxTimers = 6;
    this.nextId = 1;
    
    // Default timer colors
    this.colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    // DOM elements
    this.elements = {
      grid: document.getElementById('timers-grid'),
      emptyState: document.getElementById('empty-state'),
      addBtn: document.getElementById('add-timer-btn'),
      startAllBtn: document.getElementById('start-all-btn'),
      stopAllBtn: document.getElementById('stop-all-btn'),
      resetAllBtn: document.getElementById('reset-all-btn'),
      totalCount: document.getElementById('total-count'),
      runningCount: document.getElementById('running-count'),
      completedCount: document.getElementById('completed-count')
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadSavedTimers();
    this.updateStats();
  }
  
  setupEventListeners() {
    // Control buttons
    this.elements.addBtn?.addEventListener('click', () => this.addTimer());
    this.elements.startAllBtn?.addEventListener('click', () => this.startAll());
    this.elements.stopAllBtn?.addEventListener('click', () => this.stopAll());
    this.elements.resetAllBtn?.addEventListener('click', () => this.resetAll());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        this.addTimer();
      }
    });
  }
  
  addTimer(config = {}) {
    if (this.timers.length >= this.maxTimers) {
      this.showMessage('최대 6개까지만 추가할 수 있습니다');
      return;
    }
    
    const timer = {
      id: this.nextId++,
      name: config.name || `타이머 ${this.nextId}`,
      totalSeconds: config.totalSeconds || 300, // Default 5 minutes
      currentSeconds: 0,
      isRunning: false,
      isCompleted: false,
      color: config.color || this.colors[this.timers.length % this.colors.length],
      intervalId: null
    };
    
    this.timers.push(timer);
    this.renderTimer(timer);
    this.updateStats();
    this.saveTimers();
    
    // Hide empty state
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = 'none';
    }
  }
  
  renderTimer(timer) {
    const timerEl = document.createElement('div');
    timerEl.className = 'timer-card';
    timerEl.id = `timer-${timer.id}`;
    timerEl.style.borderTopColor = timer.color;
    
    timerEl.innerHTML = `
      <div class="timer-header">
        <input type="text" class="timer-name" value="${timer.name}" placeholder="타이머 이름">
        <button class="timer-remove" aria-label="타이머 제거">✕</button>
      </div>
      
      <div class="timer-display">
        <div class="timer-circle" style="border-color: ${timer.color}">
          <svg class="timer-svg" viewBox="0 0 120 120">
            <circle class="timer-bg" cx="60" cy="60" r="54" />
            <circle class="timer-progress" cx="60" cy="60" r="54" 
                    style="stroke: ${timer.color}" />
          </svg>
          <div class="timer-time">${this.formatTime(timer.totalSeconds - timer.currentSeconds)}</div>
        </div>
      </div>
      
      <div class="timer-inputs">
        <div class="time-input-group">
          <label>분</label>
          <input type="number" class="minutes-input" min="0" max="99" value="${Math.floor(timer.totalSeconds / 60)}">
        </div>
        <div class="time-input-group">
          <label>초</label>
          <input type="number" class="seconds-input" min="0" max="59" value="${timer.totalSeconds % 60}">
        </div>
      </div>
      
      <div class="timer-controls">
        <button class="timer-btn start-btn" data-timer-id="${timer.id}">
          <span class="btn-icon">▶️</span>
          <span class="btn-text">시작</span>
        </button>
        <button class="timer-btn stop-btn" data-timer-id="${timer.id}" style="display: none;">
          <span class="btn-icon">⏸️</span>
          <span class="btn-text">정지</span>
        </button>
        <button class="timer-btn reset-btn" data-timer-id="${timer.id}">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">리셋</span>
        </button>
      </div>
      
      <div class="timer-status ${timer.isCompleted ? 'completed' : ''}">
        ${timer.isCompleted ? '✅ 완료' : '⏱️ 대기중'}
      </div>
    `;
    
    // Add event listeners
    const nameInput = timerEl.querySelector('.timer-name');
    const removeBtn = timerEl.querySelector('.timer-remove');
    const minutesInput = timerEl.querySelector('.minutes-input');
    const secondsInput = timerEl.querySelector('.seconds-input');
    const startBtn = timerEl.querySelector('.start-btn');
    const stopBtn = timerEl.querySelector('.stop-btn');
    const resetBtn = timerEl.querySelector('.reset-btn');
    
    nameInput.addEventListener('change', (e) => {
      timer.name = e.target.value;
      this.saveTimers();
    });
    
    removeBtn.addEventListener('click', () => this.removeTimer(timer.id));
    
    const updateTime = () => {
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;
      timer.totalSeconds = minutes * 60 + seconds;
      timer.currentSeconds = 0;
      this.updateTimerDisplay(timer);
      this.saveTimers();
    };
    
    minutesInput.addEventListener('change', updateTime);
    secondsInput.addEventListener('change', updateTime);
    
    startBtn.addEventListener('click', () => this.startTimer(timer.id));
    stopBtn.addEventListener('click', () => this.stopTimer(timer.id));
    resetBtn.addEventListener('click', () => this.resetTimer(timer.id));
    
    // Append to grid
    this.elements.grid.appendChild(timerEl);
  }
  
  startTimer(id) {
    const timer = this.timers.find(t => t.id === id);
    if (!timer || timer.isRunning) return;
    
    timer.isRunning = true;
    timer.isCompleted = false;
    
    // Update UI
    const timerEl = document.getElementById(`timer-${id}`);
    timerEl.querySelector('.start-btn').style.display = 'none';
    timerEl.querySelector('.stop-btn').style.display = 'inline-flex';
    timerEl.querySelector('.timer-status').textContent = '⏱️ 실행 중';
    timerEl.querySelector('.timer-status').classList.remove('completed');
    timerEl.classList.add('running');
    
    // Disable inputs
    timerEl.querySelector('.minutes-input').disabled = true;
    timerEl.querySelector('.seconds-input').disabled = true;
    
    // Start interval
    timer.intervalId = setInterval(() => {
      timer.currentSeconds++;
      
      if (timer.currentSeconds >= timer.totalSeconds) {
        this.completeTimer(id);
      } else {
        this.updateTimerDisplay(timer);
      }
    }, 1000);
    
    // Record start
    if (window.recordTimerStart) {
      window.recordTimerStart('multi');
    }
    
    this.updateStats();
    this.saveTimers();
  }
  
  stopTimer(id) {
    const timer = this.timers.find(t => t.id === id);
    if (!timer || !timer.isRunning) return;
    
    timer.isRunning = false;
    clearInterval(timer.intervalId);
    
    // Update UI
    const timerEl = document.getElementById(`timer-${id}`);
    timerEl.querySelector('.stop-btn').style.display = 'none';
    timerEl.querySelector('.start-btn').style.display = 'inline-flex';
    timerEl.querySelector('.timer-status').textContent = '⏸️ 일시정지';
    timerEl.classList.remove('running');
    
    // Enable inputs
    timerEl.querySelector('.minutes-input').disabled = false;
    timerEl.querySelector('.seconds-input').disabled = false;
    
    this.updateStats();
    this.saveTimers();
  }
  
  resetTimer(id) {
    const timer = this.timers.find(t => t.id === id);
    if (!timer) return;
    
    // Stop if running
    if (timer.isRunning) {
      this.stopTimer(id);
    }
    
    timer.currentSeconds = 0;
    timer.isCompleted = false;
    
    // Update UI
    const timerEl = document.getElementById(`timer-${id}`);
    timerEl.querySelector('.timer-status').textContent = '⏱️ 대기중';
    timerEl.querySelector('.timer-status').classList.remove('completed');
    
    this.updateTimerDisplay(timer);
    this.updateStats();
    this.saveTimers();
  }
  
  completeTimer(id) {
    const timer = this.timers.find(t => t.id === id);
    if (!timer) return;
    
    timer.isRunning = false;
    timer.isCompleted = true;
    clearInterval(timer.intervalId);
    
    // Update UI
    const timerEl = document.getElementById(`timer-${id}`);
    timerEl.querySelector('.stop-btn').style.display = 'none';
    timerEl.querySelector('.start-btn').style.display = 'inline-flex';
    timerEl.querySelector('.timer-status').textContent = '✅ 완료';
    timerEl.querySelector('.timer-status').classList.add('completed');
    timerEl.classList.remove('running');
    timerEl.classList.add('completed');
    
    // Enable inputs
    timerEl.querySelector('.minutes-input').disabled = false;
    timerEl.querySelector('.seconds-input').disabled = false;
    
    // Play sound and notification
    this.playCompletionSound();
    this.showNotification(timer.name);
    
    // Record completion
    if (window.recordTimerComplete) {
      const minutes = Math.ceil(timer.totalSeconds / 60);
      window.recordTimerComplete('multi', minutes);
    }
    
    // Flash animation
    timerEl.classList.add('flash');
    setTimeout(() => timerEl.classList.remove('flash'), 1000);
    
    this.updateStats();
    this.saveTimers();
  }
  
  removeTimer(id) {
    const timer = this.timers.find(t => t.id === id);
    if (!timer) return;
    
    // Stop if running
    if (timer.isRunning) {
      clearInterval(timer.intervalId);
    }
    
    // Remove from array
    this.timers = this.timers.filter(t => t.id !== id);
    
    // Remove from DOM
    const timerEl = document.getElementById(`timer-${id}`);
    timerEl?.remove();
    
    // Show empty state if no timers
    if (this.timers.length === 0 && this.elements.emptyState) {
      this.elements.emptyState.style.display = 'flex';
    }
    
    this.updateStats();
    this.saveTimers();
  }
  
  startAll() {
    this.timers.forEach(timer => {
      if (!timer.isRunning && !timer.isCompleted) {
        this.startTimer(timer.id);
      }
    });
  }
  
  stopAll() {
    this.timers.forEach(timer => {
      if (timer.isRunning) {
        this.stopTimer(timer.id);
      }
    });
  }
  
  resetAll() {
    this.timers.forEach(timer => {
      this.resetTimer(timer.id);
    });
  }
  
  updateTimerDisplay(timer) {
    const timerEl = document.getElementById(`timer-${timer.id}`);
    if (!timerEl) return;
    
    const remainingSeconds = timer.totalSeconds - timer.currentSeconds;
    const timeDisplay = timerEl.querySelector('.timer-time');
    timeDisplay.textContent = this.formatTime(remainingSeconds);
    
    // Update progress circle
    const progress = timer.currentSeconds / timer.totalSeconds;
    const circle = timerEl.querySelector('.timer-progress');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference * (1 - progress);
    
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
  }
  
  updateStats() {
    const total = this.timers.length;
    const running = this.timers.filter(t => t.isRunning).length;
    const completed = this.timers.filter(t => t.isCompleted).length;
    
    if (this.elements.totalCount) this.elements.totalCount.textContent = total;
    if (this.elements.runningCount) this.elements.runningCount.textContent = running;
    if (this.elements.completedCount) this.elements.completedCount.textContent = completed;
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  playCompletionSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Chord progression for completion
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silent fail
    }
  }
  
  showNotification(timerName) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ 타이머 완료!', {
        body: `${timerName}이(가) 완료되었습니다.`,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200]
      });
    }
  }
  
  showMessage(text) {
    // Create toast message
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = text;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 1000;
      animation: fadeInOut 2s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  
  saveTimers() {
    const data = this.timers.map(timer => ({
      name: timer.name,
      totalSeconds: timer.totalSeconds,
      currentSeconds: timer.currentSeconds,
      color: timer.color,
      isCompleted: timer.isCompleted
    }));
    
    localStorage.setItem('multi_timers', JSON.stringify(data));
  }
  
  loadSavedTimers() {
    const saved = localStorage.getItem('multi_timers');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        data.forEach(config => {
          this.addTimer(config);
        });
      } catch (error) {
        // Silent fail
      }
    }
    
    // Add a default timer if none exist
    if (this.timers.length === 0) {
      this.addTimer({ name: '타이머 1', totalSeconds: 300 });
    }
  }
}

// Add required styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    20% { opacity: 1; transform: translateX(-50%) translateY(0); }
    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
  
  @keyframes flash {
    0%, 100% { background: white; }
    50% { background: #10B981; }
  }
  
  .timer-card.running {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  
  .timer-card.completed {
    animation: flash 1s ease;
  }
  
  .timer-card.flash {
    animation: flash 1s ease;
  }
`;
document.head.appendChild(style);

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.multiTimer = new MultiTimer();
  });
} else {
  window.multiTimer = new MultiTimer();
}