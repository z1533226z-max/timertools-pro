// ===== REAL-TIME STATS MANAGER ===== //

class StatsManager {
  constructor() {
    this.storageKey = 'timertools_global_stats';
    this.sessionStorageKey = 'timertools_session_stats';
    this.stats = this.loadStats();
    this.sessionStats = this.loadSessionStats();
    this.updateInterval = null;
    
    this.init();
  }
  
  init() {
    // Start update interval
    this.startRealTimeUpdates();
    
    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.stats = this.loadStats();
        this.updateDisplay();
      }
    });
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopRealTimeUpdates();
      } else {
        this.startRealTimeUpdates();
        this.updateDisplay();
      }
    });
    
    // Update display initially
    this.updateDisplay();
  }
  
  loadStats() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      // Silent fail
    }
    
    return {
      totalUsers: 12547,
      activeToday: 0,
      completedSessions: 8923,
      totalMinutes: 445230,
      dailyStats: {},
      popularTimers: {
        pomodoro: 45,
        basic: 30,
        multi: 15,
        cooking: 7,
        workout: 3
      }
    };
  }
  
  loadSessionStats() {
    try {
      const saved = sessionStorage.getItem(this.sessionStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      // Silent fail
    }
    
    return {
      startTime: Date.now(),
      pageViews: 1,
      timersStarted: 0,
      timersCompleted: 0
    };
  }
  
  saveStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
    } catch (error) {
      // Silent fail
    }
  }
  
  saveSessionStats() {
    try {
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(this.sessionStats));
    } catch (error) {
      // Silent fail
    }
  }
  
  // Record timer events
  recordTimerStart(timerType = 'basic') {
    this.sessionStats.timersStarted++;
    this.saveSessionStats();
    
    // Update global stats
    const today = new Date().toISOString().split('T')[0];
    if (!this.stats.dailyStats[today]) {
      this.stats.dailyStats[today] = {
        users: new Set(),
        sessions: 0,
        minutes: 0
      };
    }
    
    // Add current session ID as a user
    const sessionId = this.getSessionId();
    this.stats.dailyStats[today].users.add(sessionId);
    
    // Update active today count
    this.stats.activeToday = this.stats.dailyStats[today].users.size;
    
    this.saveStats();
    this.updateDisplay();
  }
  
  recordTimerComplete(timerType = 'basic', minutes = 0) {
    this.sessionStats.timersCompleted++;
    this.saveSessionStats();
    
    // Update global stats
    this.stats.completedSessions++;
    this.stats.totalMinutes += minutes;
    
    const today = new Date().toISOString().split('T')[0];
    if (!this.stats.dailyStats[today]) {
      this.stats.dailyStats[today] = {
        users: new Set(),
        sessions: 0,
        minutes: 0
      };
    }
    
    this.stats.dailyStats[today].sessions++;
    this.stats.dailyStats[today].minutes += minutes;
    
    // Update timer popularity
    if (this.stats.popularTimers[timerType] !== undefined) {
      this.stats.popularTimers[timerType]++;
    }
    
    this.saveStats();
    this.updateDisplay();
  }
  
  // Get or create session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('timertools_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('timertools_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Start real-time updates
  startRealTimeUpdates() {
    if (this.updateInterval) return;
    
    // Update every 5 seconds
    this.updateInterval = setInterval(() => {
      this.simulateRealTimeData();
      this.updateDisplay();
    }, 5000);
  }
  
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  // Simulate real-time data changes
  simulateRealTimeData() {
    // Only simulate if we're on the main page
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
      return;
    }
    
    // Randomly adjust active users (small variations)
    const variation = Math.floor(Math.random() * 21) - 10; // -10 to +10
    this.stats.activeToday = Math.max(1, this.stats.activeToday + variation);
    
    // Occasionally increment completed sessions
    if (Math.random() > 0.7) {
      this.stats.completedSessions += Math.floor(Math.random() * 3) + 1;
    }
    
    // Don't save simulated data to storage
  }
  
  // Update display elements
  updateDisplay() {
    // Update active users
    const activeUsersEl = document.querySelector('[data-stat="active-users"]');
    if (activeUsersEl) {
      const formattedCount = this.formatNumber(this.stats.activeToday || 12547);
      activeUsersEl.textContent = formattedCount;
      
      // Add animation class
      activeUsersEl.classList.remove('stat-update');
      void activeUsersEl.offsetWidth; // Trigger reflow
      activeUsersEl.classList.add('stat-update');
    }
    
    // Update completed sessions
    const completedSessionsEl = document.querySelector('[data-stat="completed-sessions"]');
    if (completedSessionsEl) {
      const formattedCount = this.formatNumber(this.stats.completedSessions);
      completedSessionsEl.textContent = formattedCount;
      
      // Add animation class
      completedSessionsEl.classList.remove('stat-update');
      void completedSessionsEl.offsetWidth; // Trigger reflow
      completedSessionsEl.classList.add('stat-update');
    }
    
    // Update timer-specific stats if on a timer page
    this.updateTimerPageStats();
  }
  
  updateTimerPageStats() {
    // Check if we're on a timer page
    const path = window.location.pathname;
    let timerType = null;
    
    if (path.includes('pomodoro')) timerType = 'pomodoro';
    else if (path.includes('basic')) timerType = 'basic';
    else if (path.includes('multi')) timerType = 'multi';
    else if (path.includes('cooking')) timerType = 'cooking';
    else if (path.includes('workout')) timerType = 'workout';
    
    if (timerType && window.timerSettings) {
      const stats = window.timerSettings.getStats();
      
      // Update today's sessions
      const todaySessionsEl = document.querySelector('[data-stat="today-sessions"]');
      if (todaySessionsEl) {
        todaySessionsEl.textContent = stats.today.sessions;
      }
      
      // Update streak
      const streakEl = document.querySelector('[data-stat="streak-days"]');
      if (streakEl) {
        streakEl.textContent = stats.streak + '일';
      }
      
      // Update total hours
      const totalHoursEl = document.querySelector('[data-stat="total-hours"]');
      if (totalHoursEl) {
        totalHoursEl.textContent = stats.total.hours + '시간';
      }
    }
  }
  
  // Format large numbers with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Get statistics summary
  getStatsSummary() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.stats.dailyStats[today] || { users: new Set(), sessions: 0, minutes: 0 };
    
    return {
      activeToday: this.stats.activeToday || 12547,
      completedToday: todayStats.sessions,
      totalSessions: this.stats.completedSessions,
      totalHours: Math.floor(this.stats.totalMinutes / 60),
      popularTimer: Object.entries(this.stats.popularTimers)
        .sort((a, b) => b[1] - a[1])[0][0]
    };
  }
}

// Add CSS animation for stat updates
const style = document.createElement('style');
style.textContent = `
  @keyframes statPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); color: #3B82F6; }
    100% { transform: scale(1); }
  }
  
  .stat-update {
    animation: statPulse 0.5s ease-out;
  }
  
  .stat-indicator {
    display: inline-block;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Initialize global stats manager
if (typeof window !== 'undefined') {
  window.statsManager = new StatsManager();
  
  // Expose methods for timer integration
  window.recordTimerStart = (timerType) => {
    window.statsManager.recordTimerStart(timerType);
  };
  
  window.recordTimerComplete = (timerType, minutes) => {
    window.statsManager.recordTimerComplete(timerType, minutes);
  };
}