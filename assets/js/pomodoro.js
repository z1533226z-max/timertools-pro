class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.currentTime = 0;
        this.timeLeft = 0;
        this.intervalId = null;
        this.currentMode = 'work'; // 'work', 'break', 'longBreak'
        this.session = 1;
        this.totalSessions = 0;
        
        // Default times (in minutes)
        this.workTime = 25;
        this.breakTime = 5;
        this.longBreakTime = 15;
        this.longBreakInterval = 4; // Long break after every 4 sessions
        
        // Settings
        this.volume = 0.5;
        this.soundEnabled = true;
        this.fullscreenEnabled = false;
        
        // Audio
        this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBSWK1vLNeSsFKYPM8tyIPQoVZLjq4ptSGAgfUtPZ5K9sJAgwgdvywZsxCAYY');
        
        this.initializeElements();
        this.loadSettings();
        this.setupEventListeners();
        this.updateDisplay();
        this.setupProgressCircle();
    }
    
    initializeElements() {
        // Timer display elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.modeDisplay = document.getElementById('modeDisplay');
        this.sessionDisplay = document.getElementById('sessionDisplay');
        this.totalSessionsDisplay = document.getElementById('totalSessionsDisplay');
        
        // Progress circle
        this.progressCircle = document.querySelector('.progress-circle circle:last-child');
        
        // Control buttons
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Settings elements
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.longBreakTimeInput = document.getElementById('longBreakTime');
        this.volumeSlider = document.getElementById('volume');
        this.soundToggle = document.getElementById('soundEnabled');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Apply settings button
        this.applySettingsBtn = document.getElementById('applySettings');
    }
    
    setupEventListeners() {
        // Control buttons
        this.startBtn?.addEventListener('click', () => this.start());
        this.pauseBtn?.addEventListener('click', () => this.pause());
        this.skipBtn?.addEventListener('click', () => this.skip());
        this.resetBtn?.addEventListener('click', () => this.reset());
        
        // Settings
        this.applySettingsBtn?.addEventListener('click', () => this.applySettings());
        this.volumeSlider?.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            this.saveSettings();
        });
        this.soundToggle?.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.code === 'Escape') {
                this.reset();
            } else if (e.code === 'ArrowRight') {
                this.skip();
            }
        });
        
        // Page visibility API for background tab handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                // Update page title with remaining time
                this.updatePageTitle();
            } else if (!document.hidden) {
                // Restore original title
                this.restorePageTitle();
            }
        });
    }
    
    setupProgressCircle() {
        if (this.progressCircle) {
            const radius = 90;
            const circumference = 2 * Math.PI * radius;
            this.progressCircle.style.strokeDasharray = circumference;
            this.progressCircle.style.strokeDashoffset = circumference;
        }
    }
    
    start() {
        if (!this.isRunning) {
            if (this.timeLeft === 0) {
                this.timeLeft = this.getCurrentModeTime() * 60;
            }
            
            this.isRunning = true;
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
            
            this.updateButtons();
            this.updatePageTitle();
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId);
            this.updateButtons();
            this.restorePageTitle();
        }
    }
    
    skip() {
        this.pause();
        this.timeLeft = 0;
        this.handleTimerComplete();
    }
    
    reset() {
        this.pause();
        this.currentMode = 'work';
        this.session = 1;
        this.timeLeft = this.workTime * 60;
        this.updateDisplay();
        this.updateProgress();
        this.updateButtons();
        this.restorePageTitle();
    }
    
    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
            this.updatePageTitle();
        } else {
            this.handleTimerComplete();
        }
    }
    
    handleTimerComplete() {
        this.pause();
        this.playNotification();
        
        // Switch mode and update session
        if (this.currentMode === 'work') {
            this.totalSessions++;
            
            // Check if it's time for long break
            if (this.totalSessions % this.longBreakInterval === 0) {
                this.currentMode = 'longBreak';
                this.timeLeft = this.longBreakTime * 60;
            } else {
                this.currentMode = 'break';
                this.timeLeft = this.breakTime * 60;
            }
        } else {
            // Break finished, start new work session
            this.currentMode = 'work';
            this.session++;
            this.timeLeft = this.workTime * 60;
        }
        
        this.updateDisplay();
        this.updateProgress();
        
        // Auto-start next session (optional)
        setTimeout(() => {
            this.start();
        }, 1000);
    }
    
    getCurrentModeTime() {
        switch (this.currentMode) {
            case 'work': return this.workTime;
            case 'break': return this.breakTime;
            case 'longBreak': return this.longBreakTime;
            default: return this.workTime;
        }
    }
    
    updateDisplay() {
        // Update time display
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.timeDisplay) {
            this.timeDisplay.textContent = timeString;
        }
        
        // Update mode display
        if (this.modeDisplay) {
            let modeText = '';
            switch (this.currentMode) {
                case 'work':
                    modeText = document.documentElement.lang === 'ko' ? '작업 시간' : 'Work Time';
                    break;
                case 'break':
                    modeText = document.documentElement.lang === 'ko' ? '휴식 시간' : 'Break Time';
                    break;
                case 'longBreak':
                    modeText = document.documentElement.lang === 'ko' ? '긴 휴식' : 'Long Break';
                    break;
            }
            this.modeDisplay.textContent = modeText;
        }
        
        // Update session display
        if (this.sessionDisplay) {
            this.sessionDisplay.textContent = this.session;
        }
        
        if (this.totalSessionsDisplay) {
            this.totalSessionsDisplay.textContent = this.totalSessions;
        }
    }
    
    updateProgress() {
        if (this.progressCircle) {
            const totalTime = this.getCurrentModeTime() * 60;
            const progress = totalTime > 0 ? (totalTime - this.timeLeft) / totalTime : 0;
            const radius = 90;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference * (1 - progress);
            
            this.progressCircle.style.strokeDashoffset = offset;
            
            // Change color based on mode
            if (this.currentMode === 'work') {
                this.progressCircle.style.stroke = '#e74c3c';
            } else if (this.currentMode === 'longBreak') {
                this.progressCircle.style.stroke = '#3498db';
            } else {
                this.progressCircle.style.stroke = '#2ecc71';
            }
        }
    }
    
    updateButtons() {
        if (this.startBtn && this.pauseBtn) {
            if (this.isRunning) {
                this.startBtn.style.display = 'none';
                this.pauseBtn.style.display = 'inline-block';
            } else {
                this.startBtn.style.display = 'inline-block';
                this.pauseBtn.style.display = 'none';
            }
        }
    }
    
    updatePageTitle() {
        if (this.isRunning && document.hidden) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            const modeText = this.currentMode === 'work' ? 
                (document.documentElement.lang === 'ko' ? '작업' : 'Work') : 
                (document.documentElement.lang === 'ko' ? '휴식' : 'Break');
            document.title = `(${timeString}) ${modeText} - ${this.originalTitle}`;
        }
    }
    
    restorePageTitle() {
        if (this.originalTitle) {
            document.title = this.originalTitle;
        }
    }
    
    applySettings() {
        // Get values from settings inputs
        if (this.workTimeInput) {
            const workTime = parseInt(this.workTimeInput.value);
            if (workTime >= 1 && workTime <= 120) {
                this.workTime = workTime;
            }
        }
        
        if (this.breakTimeInput) {
            const breakTime = parseInt(this.breakTimeInput.value);
            if (breakTime >= 1 && breakTime <= 60) {
                this.breakTime = breakTime;
            }
        }
        
        if (this.longBreakTimeInput) {
            const longBreakTime = parseInt(this.longBreakTimeInput.value);
            if (longBreakTime >= 1 && longBreakTime <= 120) {
                this.longBreakTime = longBreakTime;
            }
        }
        
        // Update current timer if not running
        if (!this.isRunning) {
            this.timeLeft = this.getCurrentModeTime() * 60;
            this.updateDisplay();
            this.updateProgress();
        }
        
        this.saveSettings();
        
        // Show confirmation
        const confirmMsg = document.documentElement.lang === 'ko' ? '설정이 적용되었습니다!' : 'Settings applied!';
        alert(confirmMsg);
    }
    
    playNotification() {
        if (this.soundEnabled && this.audio) {
            this.audio.volume = this.volume;
            this.audio.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Browser notification (if permission granted)
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.currentMode === 'work' ? 
                (document.documentElement.lang === 'ko' ? '작업 시간이 끝났습니다!' : 'Work time is over!') :
                (document.documentElement.lang === 'ko' ? '휴식 시간이 끝났습니다!' : 'Break time is over!');
            
            new Notification('Pomodoro Timer', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log('Fullscreen failed:', e);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    loadSettings() {
        const settings = localStorage.getItem('pomodoroSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.workTime = parsed.workTime || 25;
            this.breakTime = parsed.breakTime || 5;
            this.longBreakTime = parsed.longBreakTime || 15;
            this.volume = parsed.volume || 0.5;
            this.soundEnabled = parsed.soundEnabled !== false;
        }
        
        // Update input values
        if (this.workTimeInput) this.workTimeInput.value = this.workTime;
        if (this.breakTimeInput) this.breakTimeInput.value = this.breakTime;
        if (this.longBreakTimeInput) this.longBreakTimeInput.value = this.longBreakTime;
        if (this.volumeSlider) this.volumeSlider.value = this.volume * 100;
        if (this.soundToggle) this.soundToggle.checked = this.soundEnabled;
        
        // Set initial time
        this.timeLeft = this.workTime * 60;
        
        // Store original page title
        this.originalTitle = document.title;
    }
    
    saveSettings() {
        const settings = {
            workTime: this.workTime,
            breakTime: this.breakTime,
            longBreakTime: this.longBreakTime,
            volume: this.volume,
            soundEnabled: this.soundEnabled
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    // Request notification permission on first interaction
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pomodoroTimer = new PomodoroTimer();
    
    // Request notification permission after user interaction
    document.addEventListener('click', function() {
        window.pomodoroTimer.requestNotificationPermission();
    }, { once: true });
});