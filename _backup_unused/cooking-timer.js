// ===== COOKING TIMER IMPLEMENTATION ===== //

class CookingTimer {
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
        steps: [
          { name: '물 끓이기', duration: 480, description: '큰 냄비에 물을 끓입니다' },
          { name: '면 삶기', duration: 540, description: '파스타 면을 넣고 삶습니다' },
          { name: '소스 조리', duration: 300, description: '팬에 소스를 조리합니다' },
          { name: '마무리', duration: 120, description: '면과 소스를 섞고 마무리합니다' }
        ]
      },
      rice: {
        name: '밥',
        icon: '🍚',
        steps: [
          { name: '쌀 씻기', duration: 180, description: '쌀을 깨끗이 씻습니다' },
          { name: '불리기', duration: 1800, description: '쌀을 물에 불립니다' },
          { name: '취사', duration: 900, description: '밥을 짓습니다' },
          { name: '뜸 들이기', duration: 600, description: '뜸을 들입니다' }
        ]
      },
      steak: {
        name: '스테이크',
        icon: '🥩',
        steps: [
          { name: '실온 보관', duration: 1200, description: '고기를 실온에 둡니다' },
          { name: '팬 예열', duration: 180, description: '팬을 충분히 예열합니다' },
          { name: '앞면 굽기', duration: 180, description: '앞면을 굽습니다' },
          { name: '뒷면 굽기', duration: 180, description: '뒤집어서 굽습니다' },
          { name: '레스팅', duration: 300, description: '고기를 쉬게 합니다' }
        ]
      },
      eggs: {
        name: '계란',
        icon: '🥚',
        steps: [
          { name: '반숙', duration: 360, description: '반숙 계란 (6분)' },
          { name: '완숙', duration: 540, description: '완숙 계란 (9분)' }
        ]
      },
      ramen: {
        name: '라면',
        icon: '🍜',
        steps: [
          { name: '물 끓이기', duration: 180, description: '물 550ml를 끓입니다' },
          { name: '스프 넣기', duration: 30, description: '스프와 건더기를 넣습니다' },
          { name: '면 넣기', duration: 240, description: '면을 넣고 4분간 끓입니다' },
          { name: '계란 넣기', duration: 60, description: '계란을 넣고 1분 더 끓입니다' }
        ]
      },
      coffee: {
        name: '커피',
        icon: '☕',
        steps: [
          { name: '물 끓이기', duration: 120, description: '물을 90-96도로 끓입니다' },
          { name: '뜸 들이기', duration: 30, description: '분쇄 커피를 30초간 불립니다' },
          { name: '추출', duration: 150, description: '천천히 물을 부어 추출합니다' }
        ]
      }
    };
    
    // Custom recipe storage
    this.customRecipes = this.loadCustomRecipes();
    
    // DOM elements
    this.elements = {
      recipeSelect: document.getElementById('recipe-select'),
      customRecipeBtn: document.getElementById('custom-recipe-btn'),
      stepsList: document.getElementById('steps-list'),
      currentStepDisplay: document.getElementById('current-step'),
      stepDescription: document.getElementById('step-description'),
      timeDisplay: document.getElementById('cooking-time-display'),
      progressBar: document.getElementById('cooking-progress'),
      startBtn: document.getElementById('cooking-start'),
      pauseBtn: document.getElementById('cooking-pause'),
      skipBtn: document.getElementById('cooking-skip'),
      resetBtn: document.getElementById('cooking-reset'),
      totalTimeDisplay: document.getElementById('total-time'),
      remainingTimeDisplay: document.getElementById('remaining-time')
    };
    
    this.init();
  }
  
  init() {
    this.setupRecipeSelect();
    this.setupEventListeners();
    this.loadLastRecipe();
  }
  
  setupRecipeSelect() {
    if (!this.elements.recipeSelect) return;
    
    // Clear existing options
    this.elements.recipeSelect.innerHTML = '<option value="">레시피 선택...</option>';
    
    // Add predefined recipes
    Object.keys(this.recipes).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${this.recipes[key].icon} ${this.recipes[key].name}`;
      this.elements.recipeSelect.appendChild(option);
    });
    
    // Add custom recipes
    if (this.customRecipes.length > 0) {
      const divider = document.createElement('option');
      divider.disabled = true;
      divider.textContent = '── 내 레시피 ──';
      this.elements.recipeSelect.appendChild(divider);
      
      this.customRecipes.forEach((recipe, index) => {
        const option = document.createElement('option');
        option.value = `custom_${index}`;
        option.textContent = `👨‍🍳 ${recipe.name}`;
        this.elements.recipeSelect.appendChild(option);
      });
    }
  }
  
  setupEventListeners() {
    // Recipe selection
    this.elements.recipeSelect?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadRecipe(e.target.value);
      }
    });
    
    // Control buttons
    this.elements.startBtn?.addEventListener('click', () => this.start());
    this.elements.pauseBtn?.addEventListener('click', () => this.pause());
    this.elements.skipBtn?.addEventListener('click', () => this.skipStep());
    this.elements.resetBtn?.addEventListener('click', () => this.reset());
    
    // Custom recipe button
    this.elements.customRecipeBtn?.addEventListener('click', () => this.createCustomRecipe());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (this.isRunning) {
          this.pause();
        } else {
          this.start();
        }
      }
    });
  }
  
  loadRecipe(recipeId) {
    // Stop current timer if running
    if (this.isRunning) {
      this.pause();
    }
    
    // Load recipe
    if (recipeId.startsWith('custom_')) {
      const index = parseInt(recipeId.replace('custom_', ''));
      this.currentRecipe = this.customRecipes[index];
    } else {
      this.currentRecipe = this.recipes[recipeId];
    }
    
    if (!this.currentRecipe) return;
    
    // Reset state
    this.currentStep = 0;
    this.currentSeconds = 0;
    
    // Display recipe steps
    this.displayRecipeSteps();
    this.updateStepDisplay();
    this.updateTimeDisplay();
    
    // Save last used recipe
    localStorage.setItem('last_cooking_recipe', recipeId);
  }
  
  displayRecipeSteps() {
    if (!this.elements.stepsList || !this.currentRecipe) return;
    
    this.elements.stepsList.innerHTML = '';
    
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
      
      stepEl.addEventListener('click', () => {
        if (!this.isRunning) {
          this.currentStep = index;
          this.currentSeconds = 0;
          this.updateStepDisplay();
          this.updateTimeDisplay();
        }
      });
      
      this.elements.stepsList.appendChild(stepEl);
    });
    
    // Update total time
    if (this.elements.totalTimeDisplay) {
      const totalSeconds = this.currentRecipe.steps.reduce((sum, step) => sum + step.duration, 0);
      this.elements.totalTimeDisplay.textContent = this.formatTime(totalSeconds);
    }
  }
  
  updateStepDisplay() {
    if (!this.currentRecipe) return;
    
    const step = this.currentRecipe.steps[this.currentStep];
    if (!step) return;
    
    // Update current step display
    if (this.elements.currentStepDisplay) {
      this.elements.currentStepDisplay.textContent = `Step ${this.currentStep + 1}: ${step.name}`;
    }
    
    if (this.elements.stepDescription) {
      this.elements.stepDescription.textContent = step.description;
    }
    
    // Update steps list
    const stepItems = this.elements.stepsList?.querySelectorAll('.step-item');
    stepItems?.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentStep);
      item.classList.toggle('completed', index < this.currentStep);
    });
  }
  
  updateTimeDisplay() {
    if (!this.currentRecipe) return;
    
    const step = this.currentRecipe.steps[this.currentStep];
    if (!step) return;
    
    const remainingSeconds = step.duration - this.currentSeconds;
    
    // Update time display
    if (this.elements.timeDisplay) {
      this.elements.timeDisplay.textContent = this.formatTime(remainingSeconds);
    }
    
    // Update progress bar
    if (this.elements.progressBar) {
      const progress = (this.currentSeconds / step.duration) * 100;
      this.elements.progressBar.style.width = `${progress}%`;
    }
    
    // Update remaining total time
    if (this.elements.remainingTimeDisplay) {
      let totalRemaining = remainingSeconds;
      for (let i = this.currentStep + 1; i < this.currentRecipe.steps.length; i++) {
        totalRemaining += this.currentRecipe.steps[i].duration;
      }
      this.elements.remainingTimeDisplay.textContent = this.formatTime(totalRemaining);
    }
    
    // Update page title
    if (this.isRunning) {
      document.title = `${this.formatTime(remainingSeconds)} - ${step.name} - 요리 타이머`;
    }
  }
  
  start() {
    if (!this.currentRecipe) {
      this.showMessage('먼저 레시피를 선택해주세요');
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    
    // Update UI
    this.elements.startBtn.style.display = 'none';
    this.elements.pauseBtn.style.display = 'inline-flex';
    
    // Start timer
    this.intervalId = setInterval(() => this.tick(), 1000);
    
    // Record start
    if (window.recordTimerStart) {
      window.recordTimerStart('cooking');
    }
    
    // Announce
    this.announce(`${this.currentRecipe.steps[this.currentStep].name} 시작`);
  }
  
  pause() {
    this.isRunning = false;
    this.isPaused = true;
    clearInterval(this.intervalId);
    
    // Update UI
    this.elements.pauseBtn.style.display = 'none';
    this.elements.startBtn.style.display = 'inline-flex';
  }
  
  tick() {
    this.currentSeconds++;
    
    const step = this.currentRecipe.steps[this.currentStep];
    if (this.currentSeconds >= step.duration) {
      this.completeStep();
    } else {
      this.updateTimeDisplay();
      
      // Warning at 10 seconds remaining
      if (step.duration - this.currentSeconds === 10) {
        this.playWarningSound();
        this.announce('10초 남았습니다');
      }
    }
  }
  
  completeStep() {
    // Play completion sound
    this.playCompletionSound();
    
    // Show notification
    const step = this.currentRecipe.steps[this.currentStep];
    this.showNotification(`${step.name} 완료!`);
    this.announce(`${step.name} 완료`);
    
    // Move to next step
    if (this.currentStep < this.currentRecipe.steps.length - 1) {
      this.currentStep++;
      this.currentSeconds = 0;
      this.updateStepDisplay();
      this.updateTimeDisplay();
      
      // Auto-announce next step
      const nextStep = this.currentRecipe.steps[this.currentStep];
      setTimeout(() => {
        this.announce(`다음 단계: ${nextStep.name}`);
      }, 1000);
    } else {
      // Recipe complete
      this.completeRecipe();
    }
  }
  
  completeRecipe() {
    this.pause();
    
    // Play special completion sound
    this.playRecipeCompleteSound();
    
    // Show completion notification
    this.showNotification(`🎉 ${this.currentRecipe.name} 요리 완료!`);
    this.announce(`${this.currentRecipe.name} 요리가 완료되었습니다`);
    
    // Record completion
    if (window.recordTimerComplete) {
      const totalMinutes = this.currentRecipe.steps.reduce((sum, step) => sum + Math.ceil(step.duration / 60), 0);
      window.recordTimerComplete('cooking', totalMinutes);
    }
    
    // Save to statistics
    if (window.timerSettings) {
      const totalMinutes = this.currentRecipe.steps.reduce((sum, step) => sum + Math.ceil(step.duration / 60), 0);
      window.timerSettings.recordSession(totalMinutes, 'cooking');
    }
    
    // Show completion message
    this.showCompletionModal();
  }
  
  skipStep() {
    if (!this.currentRecipe || !this.isRunning) return;
    
    if (this.currentStep < this.currentRecipe.steps.length - 1) {
      this.currentStep++;
      this.currentSeconds = 0;
      this.updateStepDisplay();
      this.updateTimeDisplay();
    } else {
      this.completeRecipe();
    }
  }
  
  reset() {
    this.pause();
    this.currentStep = 0;
    this.currentSeconds = 0;
    this.updateStepDisplay();
    this.updateTimeDisplay();
    
    // Reset UI
    this.elements.pauseBtn.style.display = 'none';
    this.elements.startBtn.style.display = 'inline-flex';
  }
  
  createCustomRecipe() {
    // This would open a modal to create custom recipe
    // For now, we'll use a simple prompt
    const name = prompt('레시피 이름:');
    if (!name) return;
    
    const steps = [];
    let addMore = true;
    
    while (addMore) {
      const stepName = prompt(`단계 ${steps.length + 1} 이름:`);
      if (!stepName) break;
      
      const duration = prompt(`${stepName}의 시간 (분):`);
      if (!duration) break;
      
      const description = prompt(`${stepName}의 설명 (선택사항):`) || '';
      
      steps.push({
        name: stepName,
        duration: parseInt(duration) * 60,
        description: description
      });
      
      addMore = confirm('단계를 더 추가하시겠습니까?');
    }
    
    if (steps.length > 0) {
      const customRecipe = { name, steps };
      this.customRecipes.push(customRecipe);
      this.saveCustomRecipes();
      this.setupRecipeSelect();
      
      // Select the new recipe
      this.elements.recipeSelect.value = `custom_${this.customRecipes.length - 1}`;
      this.loadRecipe(`custom_${this.customRecipes.length - 1}`);
    }
  }
  
  loadCustomRecipes() {
    const saved = localStorage.getItem('custom_cooking_recipes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        return [];
      }
    }
    return [];
  }
  
  saveCustomRecipes() {
    localStorage.setItem('custom_cooking_recipes', JSON.stringify(this.customRecipes));
  }
  
  loadLastRecipe() {
    const lastRecipe = localStorage.getItem('last_cooking_recipe');
    if (lastRecipe && this.elements.recipeSelect) {
      this.elements.recipeSelect.value = lastRecipe;
      this.loadRecipe(lastRecipe);
    }
  }
  
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  
  playCompletionSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Bell sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silent fail
    }
  }
  
  playWarningSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Warning beep
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silent fail
    }
  }
  
  playRecipeCompleteSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play a celebratory chord
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + index * 0.1 + 0.5);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.5);
      });
    } catch (error) {
      // Silent fail
    }
  }
  
  showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🍳 요리 타이머', {
        body: message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200]
      });
    }
  }
  
  showMessage(text) {
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
  
  showCompletionModal() {
    // Simple completion message
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
      <div class="modal-content" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        text-align: center;
        z-index: 1001;
      ">
        <h2 style="margin: 0 0 1rem 0;">🎉 요리 완료!</h2>
        <p>${this.currentRecipe.name} 요리가 완료되었습니다.</p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 1rem;
          padding: 0.5rem 1.5rem;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">확인</button>
      </div>
      <div class="modal-backdrop" onclick="this.parentElement.remove()" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
      "></div>
    `;
    
    document.body.appendChild(modal);
  }
  
  announce(message) {
    // For screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookingTimer = new CookingTimer();
  });
} else {
  window.cookingTimer = new CookingTimer();
}