// ===== TIMER SETTINGS MANAGER ===== //

class TimerSettings {
  constructor(timerType = 'basic') {
    this.timerType = timerType;
    this.storageKey = `timertools_${timerType}_settings`;
    this.statsKey = `timertools_${timerType}_stats`;
    
    // Default settings based on timer type
    this.defaultSettings = this.getDefaultSettings();
    this.settings = this.load();
    this.stats = this.loadStats();
  }
  
  getDefaultSettings() {
    const common = {
      soundEnabled: true,
      volume: 70,
      notificationsEnabled: true,
      theme: 'auto',
      language: 'ko'
    };
    
    switch(this.timerType) {
      case 'pomodoro':
        return {
          ...common,
          workTime: 25,
          breakTime: 5,
          longBreakTime: 15,
          longBreakInterval: 4,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          dailyGoal: 8
        };
        
      case 'basic':
        return {
          ...common,
          presets: [
            { name: '1분', minutes: 1, seconds: 0 },
            { name: '3분', minutes: 3, seconds: 0 },
            { name: '5분', minutes: 5, seconds: 0 },
            { name: '10분', minutes: 10, seconds: 0 },
            { name: '15분', minutes: 15, seconds: 0 },
            { name: '30분', minutes: 30, seconds: 0 }
          ],
          lastUsedTime: { hours: 0, minutes: 5, seconds: 0 }
        };
        
      case 'multi':
        return {
          ...common,
          maxTimers: 6,
          defaultTimerMinutes: 5,
          timerColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
        };
        
      case 'cooking':
        return {
          ...common,
          recipes: [],
          favoriteRecipes: [],
          stepAlerts: true,
          temperatureUnit: 'C'
        };
        
      case 'workout':
        return {
          ...common,
          workTime: 30,
          restTime: 10,
          sets: 3,
          rounds: 4,
          warmupTime: 60,
          cooldownTime: 60,
          savedRoutines: []
        };
        
      default:
        return common;
    }
  }
  
  // Load settings from localStorage
  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all keys exist
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (error) {
      // Silent fail, return defaults
    }
    return this.defaultSettings;
  }
  
  // Save settings to localStorage
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Get a specific setting
  get(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }
  
  // Set a specific setting
  set(key, value) {
    this.settings[key] = value;
    return this.save();
  }
  
  // Update multiple settings at once
  update(updates) {
    this.settings = { ...this.settings, ...updates };
    return this.save();
  }
  
  // Reset to default settings
  reset() {
    this.settings = this.defaultSettings;
    return this.save();
  }
  
  // === STATISTICS MANAGEMENT === //
  
  loadStats() {
    try {
      const saved = localStorage.getItem(this.statsKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      // Silent fail
    }
    
    return {
      totalSessions: 0,
      totalMinutes: 0,
      dailyStats: {},
      weeklyStats: {},
      monthlyStats: {},
      streakDays: 0,
      lastActiveDate: null,
      achievements: []
    };
  }
  
  saveStats() {
    try {
      localStorage.setItem(this.statsKey, JSON.stringify(this.stats));
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Record a completed session
  recordSession(minutes, type = 'default') {
    const today = new Date().toISOString().split('T')[0];
    const week = this.getWeekNumber(new Date());
    const month = new Date().toISOString().slice(0, 7);
    
    // Update totals
    this.stats.totalSessions++;
    this.stats.totalMinutes += minutes;
    
    // Update daily stats
    if (!this.stats.dailyStats[today]) {
      this.stats.dailyStats[today] = { sessions: 0, minutes: 0, types: {} };
    }
    this.stats.dailyStats[today].sessions++;
    this.stats.dailyStats[today].minutes += minutes;
    
    if (!this.stats.dailyStats[today].types[type]) {
      this.stats.dailyStats[today].types[type] = 0;
    }
    this.stats.dailyStats[today].types[type]++;
    
    // Update weekly stats
    if (!this.stats.weeklyStats[week]) {
      this.stats.weeklyStats[week] = { sessions: 0, minutes: 0 };
    }
    this.stats.weeklyStats[week].sessions++;
    this.stats.weeklyStats[week].minutes += minutes;
    
    // Update monthly stats
    if (!this.stats.monthlyStats[month]) {
      this.stats.monthlyStats[month] = { sessions: 0, minutes: 0 };
    }
    this.stats.monthlyStats[month].sessions++;
    this.stats.monthlyStats[month].minutes += minutes;
    
    // Update streak
    this.updateStreak(today);
    
    // Check for achievements
    this.checkAchievements();
    
    return this.saveStats();
  }
  
  updateStreak(today) {
    if (this.stats.lastActiveDate) {
      const lastDate = new Date(this.stats.lastActiveDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        this.stats.streakDays++;
      } else if (diffDays > 1) {
        this.stats.streakDays = 1;
      }
    } else {
      this.stats.streakDays = 1;
    }
    
    this.stats.lastActiveDate = today;
  }
  
  checkAchievements() {
    const achievements = [];
    
    // First timer
    if (this.stats.totalSessions === 1 && !this.hasAchievement('first_timer')) {
      achievements.push({
        id: 'first_timer',
        name: '첫 타이머',
        description: '첫 번째 타이머 완료',
        date: new Date().toISOString()
      });
    }
    
    // Productivity milestones
    const productivityMilestones = [
      { sessions: 10, id: 'rookie', name: '초보자', description: '10개 세션 완료' },
      { sessions: 50, id: 'regular', name: '단골', description: '50개 세션 완료' },
      { sessions: 100, id: 'dedicated', name: '헌신자', description: '100개 세션 완료' },
      { sessions: 500, id: 'expert', name: '전문가', description: '500개 세션 완료' },
      { sessions: 1000, id: 'master', name: '마스터', description: '1000개 세션 완료' }
    ];
    
    productivityMilestones.forEach(milestone => {
      if (this.stats.totalSessions >= milestone.sessions && !this.hasAchievement(milestone.id)) {
        achievements.push({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          date: new Date().toISOString()
        });
      }
    });
    
    // Streak achievements
    const streakMilestones = [
      { days: 3, id: 'streak_3', name: '3일 연속', description: '3일 연속 사용' },
      { days: 7, id: 'streak_7', name: '일주일 연속', description: '7일 연속 사용' },
      { days: 30, id: 'streak_30', name: '한 달 연속', description: '30일 연속 사용' },
      { days: 100, id: 'streak_100', name: '100일 연속', description: '100일 연속 사용' }
    ];
    
    streakMilestones.forEach(milestone => {
      if (this.stats.streakDays >= milestone.days && !this.hasAchievement(milestone.id)) {
        achievements.push({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          date: new Date().toISOString()
        });
      }
    });
    
    // Add new achievements
    if (achievements.length > 0) {
      this.stats.achievements = [...this.stats.achievements, ...achievements];
      this.saveStats();
      
      // Trigger achievement notification
      achievements.forEach(achievement => {
        this.notifyAchievement(achievement);
      });
    }
  }
  
  hasAchievement(id) {
    return this.stats.achievements.some(a => a.id === id);
  }
  
  notifyAchievement(achievement) {
    // Show notification if enabled
    if (this.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🏆 업적 달성!', {
        body: `${achievement.name}: ${achievement.description}`,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200]
      });
    }
  }
  
  // Get statistics for display
  getStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.stats.dailyStats[today] || { sessions: 0, minutes: 0 };
    
    return {
      today: todayStats,
      total: {
        sessions: this.stats.totalSessions,
        minutes: this.stats.totalMinutes,
        hours: Math.floor(this.stats.totalMinutes / 60)
      },
      streak: this.stats.streakDays,
      achievements: this.stats.achievements.length,
      recentAchievements: this.stats.achievements.slice(-3)
    };
  }
  
  // Helper function to get week number
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  }
  
  // Export/Import functionality
  exportSettings() {
    return {
      settings: this.settings,
      stats: this.stats,
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };
  }
  
  importSettings(data) {
    try {
      if (data.settings) {
        this.settings = { ...this.defaultSettings, ...data.settings };
        this.save();
      }
      if (data.stats) {
        this.stats = data.stats;
        this.saveStats();
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Auto-initialize for current page
if (typeof window !== 'undefined') {
  // Detect timer type from URL
  const path = window.location.pathname;
  let timerType = 'basic';
  
  if (path.includes('pomodoro')) timerType = 'pomodoro';
  else if (path.includes('multi')) timerType = 'multi';
  else if (path.includes('cooking')) timerType = 'cooking';
  else if (path.includes('workout')) timerType = 'workout';
  else if (path.includes('basic')) timerType = 'basic';
  
  // Create global instance
  window.timerSettings = new TimerSettings(timerType);
}