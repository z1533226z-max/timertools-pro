// ===== SIMPLIFIED COOKING TIMER IMPLEMENTATION ===== //

class SimpleCookingTimer {
  constructor() {
    // Timer state
    this.currentRecipe = null;
    this.currentStep = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.currentSeconds = 0;
    this.intervalId = null;
    
    // Predefined recipes
    this.recipes = {
      pasta: {
        name: '파스타',
        icon: '🍝',
        totalTime: 20,
        steps: [
          { name: '물 끓이기', duration: 480, description: '큰 냄비에 물을 끓입니다' },
          { name: '면 삶기', duration: 540, description: '파스타 면을 넣고 삶습니다' },
          { name: '소스 조리', duration: 300, description: '팬에 소스를 조리합니다' },
          { name: '마무리', duration: 120, description: '면과 소스를 섞고 마무리합니다' }
        ]
      },
      steak: {
        name: '스테이크',
        icon: '🍖',
        totalTime: 15,
        steps: [
          { name: '실온 보관', duration: 600, description: '고기를 실온에 둡니다' },
          { name: '팬 예열', duration: 180, description: '팬을 충분히 예열합니다' },
          { name: '앞면 굽기', duration: 180, description: '앞면을 굽습니다' },
          { name: '뒷면 굽기', duration: 180, description: '뒤집어서 굽습니다' },
          { name: '레스팅', duration: 300, description: '고기를 쉬게 합니다' }
        ]
      },
      'kimchi-stew': {
        name: '김치찌개',
        icon: '🍲',
        totalTime: 30,
        steps: [
          { name: '재료 준비', duration: 300, description: '김치와 재료를 썰어 준비합니다' },
          { name: '김치 볶기', duration: 300, description: '김치를 볶아 향을 냅니다' },
          { name: '물 붓기', duration: 60, description: '물을 붓고 끓입니다' },
          { name: '끓이기', duration: 900, description: '중불에서 끓입니다' },
          { name: '간 맞추기', duration: 180, description: '간을 맞추고 마무리합니다' }
        ]
      },
      cake: {
        name: '케이크',
        icon: '🍰',
        totalTime: 60,
        steps: [
          { name: '재료 준비', duration: 600, description: '재료를 계량하고 준비합니다' },
          { name: '반죽 만들기', duration: 900, description: '반죽을 만듭니다' },
          { name: '오븐 예열', duration: 300, description: '오븐을 180도로 예열합니다' },
          { name: '굽기', duration: 1800, description: '30분간 굽습니다' },
          { name: '식히기', duration: 600, description: '완전히 식힙니다' }
        ]
      },
      salad: {
        name: '샐러드',
        icon: '🥗',
        totalTime: 10,
        steps: [
          { name: '야채 씻기', duration: 180, description: '야채를 깨끗이 씻습니다' },
          { name: '자르기', duration: 300, description: '먹기 좋은 크기로 자릅니다' },
          { name: '드레싱', duration: 120, description: '드레싱을 만들고 버무립니다' }
        ]
      }
    };
    
    // Custom recipe storage
    this.customRecipes = [];
    
    // Current screen
    this.currentScreen = 'selection';
    
    this.init();
  }
  
  init() {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
        this.showRecipeSelection();
      });
    } else {
      this.setupEventListeners();
      this.showRecipeSelection();
    }
  }
  
  setupEventListeners() {
    // Recipe selection cards
    const recipeCards = document.querySelectorAll('.recipe-card[data-recipe]');
    recipeCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const recipeId = e.currentTarget.dataset.recipe;
        this.selectRecipe(recipeId);
      });
    });
    
    // Custom recipe form
    const customForm = document.getElementById('custom-recipe-form');
    if (customForm) {
      customForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createCustomRecipe();
      });
    }
    
    // Main timer controls (when on timer screen)
    this.setupTimerControls();
    
    // Back buttons
    const backToSelection = document.getElementById('back-to-selection');
    if (backToSelection) {
      backToSelection.addEventListener('click', () => {
        this.showRecipeSelection();
      });
    }
    
    // Start cooking button
    const startCooking = document.getElementById('start-cooking');
    if (startCooking) {
      startCooking.addEventListener('click', () => {
        this.startCooking();
      });
    }
  }
  
  setupTimerControls() {
    // These controls are on the main timer screen
    const pauseBtn = document.getElementById('pause-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const notificationBtn = document.getElementById('notification-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (this.isRunning) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }
    
    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', () => {
        this.nextStep();
      });
    }
    
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        this.toggleNotifications();
      });
    }
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showSettings();
      });
    }
  }
  
  showRecipeSelection() {
    this.currentScreen = 'selection';
    
    // Hide all screens
    document.querySelectorAll('.recipe-selection, .step-configuration, .cooking-timer-main').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show selection screen
    const selectionScreen = document.getElementById('recipe-selection');
    if (selectionScreen) {
      selectionScreen.style.display = 'block';
    }
    
    // Stop any running timer
    if (this.isRunning) {
      this.stop();
    }
  }
  
  selectRecipe(recipeId) {
    this.currentRecipe = this.recipes[recipeId];
    if (!this.currentRecipe) {
      console.error('Recipe not found:', recipeId);
      return;
    }
    
    this.currentStep = 0;
    this.currentSeconds = 0;
    
    // Show step configuration screen
    this.showStepConfiguration();
  }
  
  showStepConfiguration() {
    this.currentScreen = 'configuration';
    
    // Hide all screens
    document.querySelectorAll('.recipe-selection, .step-configuration, .cooking-timer-main').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show configuration screen
    const configScreen = document.getElementById('step-configuration');
    if (configScreen) {
      configScreen.style.display = 'block';
      
      // Update recipe name
      const recipeName = document.getElementById('config-recipe-name');
      if (recipeName) {
        recipeName.textContent = this.currentRecipe.name;
      }
      
      // Update total time
      const totalTime = document.getElementById('config-total-time');
      if (totalTime) {
        totalTime.textContent = `${this.currentRecipe.totalTime}분`;
      }
      
      // Display steps
      this.displaySteps();
    }
  }
  
  displaySteps() {
    const container = document.getElementById('steps-config-container');
    if (!container || !this.currentRecipe) return;
    
    container.innerHTML = '';
    
    this.currentRecipe.steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'step-config-item';
      stepEl.innerHTML = `
        <div class="step-header">
          <h4>단계 ${index + 1}: ${step.name}</h4>
          <span class="step-time">${this.formatTime(step.duration)}</span>
        </div>
        <p class="step-description">${step.description}</p>
      `;
      container.appendChild(stepEl);
    });
  }
  
  startCooking() {
    this.currentScreen = 'timer';
    this.currentStep = 0;
    this.currentSeconds = 0;
    
    // Hide all screens
    document.querySelectorAll('.recipe-selection, .step-configuration, .cooking-timer-main').forEach(el => {
      el.style.display = 'none';
    });
    
    // Show main timer screen
    const timerScreen = document.getElementById('cooking-timer-main');
    if (timerScreen) {
      timerScreen.style.display = 'block';
      
      // Update display
      this.updateTimerDisplay();
      this.updateStepsList();
      
      // Start timer
      this.start();
    }
  }
  
  start() {
    if (!this.currentRecipe || this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Update button text
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = '⏸️ 일시정지';
    }
    
    // Start interval
    this.intervalId = setInterval(() => this.tick(), 1000);
    
    // Play start sound
    this.playSound('start');
  }
  
  pause() {
    this.isRunning = false;
    this.isPaused = true;
    clearInterval(this.intervalId);
    
    // Update button text
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = '▶️ 재개';
    }
  }
  
  resume() {
    this.start();
  }
  
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.intervalId);
    this.currentStep = 0;
    this.currentSeconds = 0;
  }
  
  tick() {
    if (!this.currentRecipe) return;
    
    this.currentSeconds++;
    
    const currentStepData = this.currentRecipe.steps[this.currentStep];
    if (!currentStepData) {
      this.completeRecipe();
      return;
    }
    
    // Check if current step is complete
    if (this.currentSeconds >= currentStepData.duration) {
      this.completeStep();
    } else {
      // Update display
      this.updateTimerDisplay();
      
      // Warning at 10 seconds remaining
      const remaining = currentStepData.duration - this.currentSeconds;
      if (remaining === 10) {
        this.playSound('warning');
        this.showNotification('10초 남았습니다!');
      }
    }
  }
  
  completeStep() {
    const currentStepData = this.currentRecipe.steps[this.currentStep];
    
    // Play completion sound
    this.playSound('complete');
    
    // Show notification
    this.showNotification(`${currentStepData.name} 완료!`);
    
    // Move to next step
    if (this.currentStep < this.currentRecipe.steps.length - 1) {
      this.currentStep++;
      this.currentSeconds = 0;
      this.updateTimerDisplay();
      this.updateStepsList();
      
      // Announce next step
      const nextStep = this.currentRecipe.steps[this.currentStep];
      setTimeout(() => {
        this.showNotification(`다음: ${nextStep.name}`);
      }, 1000);
    } else {
      this.completeRecipe();
    }
  }
  
  nextStep() {
    if (!this.currentRecipe || !this.isRunning) return;
    
    if (this.currentStep < this.currentRecipe.steps.length - 1) {
      this.currentStep++;
      this.currentSeconds = 0;
      this.updateTimerDisplay();
      this.updateStepsList();
    } else {
      this.completeRecipe();
    }
  }
  
  completeRecipe() {
    this.stop();
    
    // Play special completion sound
    this.playSound('recipe-complete');
    
    // Show completion notification
    this.showNotification(`🎉 ${this.currentRecipe.name} 요리 완료!`);
    
    // Show completion modal
    setTimeout(() => {
      if (confirm(`${this.currentRecipe.name} 요리가 완료되었습니다!\n\n새로운 요리를 시작하시겠습니까?`)) {
        this.showRecipeSelection();
      }
    }, 500);
  }
  
  updateTimerDisplay() {
    if (!this.currentRecipe) return;
    
    const currentStepData = this.currentRecipe.steps[this.currentStep];
    if (!currentStepData) return;
    
    const remaining = currentStepData.duration - this.currentSeconds;
    const progress = (this.currentSeconds / currentStepData.duration) * 100;
    
    // Update main time display
    const mainTime = document.getElementById('main-time');
    if (mainTime) {
      mainTime.textContent = this.formatTime(remaining);
    }
    
    // Update step indicator
    const stepIndicator = document.getElementById('step-indicator');
    if (stepIndicator) {
      stepIndicator.textContent = `현재 단계: ${currentStepData.name} (${this.currentStep + 1}/${this.currentRecipe.steps.length})`;
    }
    
    // Update step status
    const stepStatus = document.getElementById('step-status');
    if (stepStatus) {
      stepStatus.textContent = currentStepData.name;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('main-progress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    // Update step tip
    const stepTip = document.getElementById('step-tip');
    if (stepTip) {
      stepTip.textContent = currentStepData.description;
    }
    
    // Update remaining total time
    this.updateTotalTime();
    
    // Update page title
    if (this.isRunning) {
      document.title = `${this.formatTime(remaining)} - ${currentStepData.name} - 요리 타이머`;
    }
  }
  
  updateStepsList() {
    const stepsList = document.getElementById('steps-list');
    if (!stepsList || !this.currentRecipe) return;
    
    stepsList.innerHTML = '';
    
    this.currentRecipe.steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = `step-item ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}`;
      stepEl.innerHTML = `
        <div class="step-number">${index + 1}</div>
        <div class="step-info">
          <div class="step-name">${step.name}</div>
          <div class="step-time">${this.formatTime(step.duration)}</div>
        </div>
        <div class="step-status">
          ${index < this.currentStep ? '✅' : index === this.currentStep ? '⏱️' : '⏳'}
        </div>
      `;
      stepsList.appendChild(stepEl);
    });
  }
  
  updateTotalTime() {
    if (!this.currentRecipe) return;
    
    // Calculate total remaining time
    let totalRemaining = 0;
    for (let i = this.currentStep; i < this.currentRecipe.steps.length; i++) {
      if (i === this.currentStep) {
        totalRemaining += this.currentRecipe.steps[i].duration - this.currentSeconds;
      } else {
        totalRemaining += this.currentRecipe.steps[i].duration;
      }
    }
    
    // Update displays
    const totalTimeDisplay = document.getElementById('total-time-display');
    if (totalTimeDisplay) {
      const totalSeconds = this.currentRecipe.steps.reduce((sum, step) => sum + step.duration, 0);
      totalTimeDisplay.textContent = this.formatTime(totalSeconds);
    }
    
    const remainingTimeDisplay = document.getElementById('remaining-time-display');
    if (remainingTimeDisplay) {
      remainingTimeDisplay.textContent = this.formatTime(totalRemaining);
    }
  }
  
  createCustomRecipe() {
    const nameInput = document.getElementById('recipe-name');
    const totalTimeInput = document.getElementById('total-time');
    const stepCountInput = document.getElementById('step-count');
    
    if (!nameInput || !totalTimeInput || !stepCountInput) return;
    
    const name = nameInput.value;
    const totalMinutes = parseInt(totalTimeInput.value);
    const stepCount = parseInt(stepCountInput.value);
    
    if (!name || !totalMinutes || !stepCount) return;
    
    // Create simple custom recipe with equal time steps
    const stepDuration = Math.floor((totalMinutes * 60) / stepCount);
    const steps = [];
    
    for (let i = 0; i < stepCount; i++) {
      steps.push({
        name: `단계 ${i + 1}`,
        duration: stepDuration,
        description: `${name}의 ${i + 1}번째 단계입니다`
      });
    }
    
    // Create custom recipe object
    const customRecipe = {
      name: name,
      icon: '👨‍🍳',
      totalTime: totalMinutes,
      steps: steps
    };
    
    // Set as current recipe
    this.currentRecipe = customRecipe;
    this.currentStep = 0;
    this.currentSeconds = 0;
    
    // Show configuration screen
    this.showStepConfiguration();
  }
  
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  playSound(type) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch(type) {
        case 'start':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          break;
        case 'warning':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
          break;
        case 'complete':
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
          break;
        case 'recipe-complete':
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
          break;
        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      }
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Sound playback error:', error);
    }
  }
  
  showNotification(message) {
    // Try browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🍳 요리 타이머', {
        body: message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200]
      });
    }
    
    // Also show toast message
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: fadeInOut 3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  
  toggleNotifications() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showNotification('알림이 활성화되었습니다!');
        }
      });
    } else if (Notification.permission === 'granted') {
      this.showNotification('알림이 이미 활성화되어 있습니다');
    } else {
      alert('브라우저 설정에서 알림을 허용해주세요');
    }
  }
  
  showSettings() {
    alert('설정 기능은 준비 중입니다');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.simpleCookingTimer = new SimpleCookingTimer();
  });
} else {
  // DOM is already loaded
  window.simpleCookingTimer = new SimpleCookingTimer();
}

// Add CSS animation for toast messages
if (!document.getElementById('cooking-toast-styles')) {
  const style = document.createElement('style');
  style.id = 'cooking-toast-styles';
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      20% { opacity: 1; transform: translateX(-50%) translateY(0); }
      80% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    
    .step-config-item {
      background: #f5f5f5;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
    }
    
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .step-header h4 {
      margin: 0;
      font-size: 1.1rem;
    }
    
    .step-time {
      background: #3B82F6;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
    }
    
    .step-description {
      margin: 0;
      color: #666;
    }
    
    .step-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: #f5f5f5;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .step-item.active {
      background: #FEF3C7;
      border: 2px solid #F59E0B;
    }
    
    .step-item.completed {
      background: #D1FAE5;
      opacity: 0.8;
    }
    
    .step-number {
      width: 30px;
      height: 30px;
      background: #3B82F6;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-weight: bold;
    }
    
    .step-info {
      flex: 1;
    }
    
    .step-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .step-time {
      font-size: 0.9rem;
      color: #666;
    }
    
    .step-status {
      font-size: 1.5rem;
    }
  `;
  document.head.appendChild(style);
}