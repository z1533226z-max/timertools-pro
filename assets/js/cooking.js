/**
 * Cooking Timer JavaScript - TimerTools Pro
 * Advanced cooking timer with step-by-step guidance, multi-cooking management,
 * temperature monitoring, and recipe integration
 */

class CookingTimer {
    constructor() {
        this.currentRecipe = null;
        this.currentStep = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.remainingTime = 0;
        this.stepInterval = null;
        this.multipleCooking = [];
        this.audioContext = null;
        this.notificationSettings = {
            sound: true,
            vibration: true,
            visual: true
        };
        
        // Recipe database
        this.recipes = {
            pasta: {
                id: 'pasta',
                name: '파스타',
                icon: '🍝',
                category: '주요리',
                difficulty: '쉬움',
                totalTime: 20,
                servings: 2,
                ingredients: [
                    { name: '파스타면', amount: '200g' },
                    { name: '올리브오일', amount: '3큰술' },
                    { name: '마늘', amount: '3쪽' },
                    { name: '소금', amount: '적당량' }
                ],
                steps: [
                    {
                        id: 1,
                        name: '물 끓이기',
                        duration: 5,
                        temperature: '강불',
                        instructions: '큰 냄비에 물을 넉넉히 붓고 소금을 넣어 끓입니다',
                        tips: '파스타 100g당 물 1L, 소금 10g이 적당합니다',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 2,
                        name: '면 삶기',
                        duration: 8,
                        temperature: '중강불',
                        instructions: '끓는 물에 파스타면을 넣고 포장지 표시시간보다 1분 적게 삶습니다',
                        tips: '알덴테 상태로 삶아야 소스와 함께 볶을 때 완벽해집니다',
                        alerts: ['step_start', 'halfway', 'final_warning', 'step_end']
                    },
                    {
                        id: 3,
                        name: '소스 만들기',
                        duration: 4,
                        temperature: '중불',
                        instructions: '팬에 올리브오일을 두르고 슬라이스한 마늘을 볶습니다',
                        tips: '마늘이 황금색이 될 때까지만 볶아주세요',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 4,
                        name: '면과 소스 섞기',
                        duration: 2,
                        temperature: '중불',
                        instructions: '삶은 면을 소스에 넣고 파스타 삶은 물을 조금씩 넣어가며 섞습니다',
                        tips: '면이 소스를 잘 흡수하도록 빠르게 섞어주세요',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 5,
                        name: '마무리',
                        duration: 1,
                        temperature: '불끄기',
                        instructions: '불을 끄고 그릇에 담아 바로 서빙합니다',
                        tips: '파스타는 뜨거울 때 드셔야 가장 맛있습니다',
                        alerts: ['completed']
                    }
                ]
            },
            steak: {
                id: 'steak',
                name: '스테이크',
                icon: '🍖',
                category: '주요리',
                difficulty: '중급',
                totalTime: 15,
                servings: 2,
                ingredients: [
                    { name: '스테이크', amount: '200g x 2' },
                    { name: '소금', amount: '적당량' },
                    { name: '후추', amount: '적당량' },
                    { name: '올리브오일', amount: '2큰술' }
                ],
                steps: [
                    {
                        id: 1,
                        name: '재료 준비',
                        duration: 3,
                        temperature: '상온',
                        instructions: '스테이크를 상온에 30분 꺼내두고 소금후추로 간합니다',
                        tips: '상온에서 시작해야 골고루 익습니다',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 2,
                        name: '팬 예열',
                        duration: 2,
                        temperature: '강불',
                        instructions: '팬에 올리브오일을 두르고 충분히 달굽니다',
                        tips: '연기가 날 정도로 뜨겁게 달궈야 합니다',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 3,
                        name: '스테이크 굽기 (앞면)',
                        duration: 4,
                        temperature: '강불',
                        instructions: '스테이크를 올려 앞면을 굽습니다',
                        tips: '고기를 누르지 마세요. 겉면이 황금색이 될 때까지',
                        alerts: ['step_start', 'halfway', 'step_end']
                    },
                    {
                        id: 4,
                        name: '뒤집어서 굽기',
                        duration: 4,
                        temperature: '강불',
                        instructions: '뒤집어서 뒷면을 굽습니다',
                        tips: '미디움 레어는 총 8분, 미디움은 10분이 적당합니다',
                        alerts: ['step_start', 'halfway', 'step_end']
                    },
                    {
                        id: 5,
                        name: '마무리',
                        duration: 2,
                        temperature: '불끄기',
                        instructions: '불을 끄고 버터를 올려 5분간 휴지시킵니다',
                        tips: '휴지시키는 시간이 육즙을 가둡니다',
                        alerts: ['completed']
                    }
                ]
            },
            'kimchi-stew': {
                id: 'kimchi-stew',
                name: '김치찌개',
                icon: '🍲',
                category: '국물요리',
                difficulty: '쉬움',
                totalTime: 30,
                servings: 3,
                ingredients: [
                    { name: '신김치', amount: '200g' },
                    { name: '돼지고기', amount: '150g' },
                    { name: '두부', amount: '1/2모' },
                    { name: '파', amount: '1대' }
                ],
                steps: [
                    {
                        id: 1,
                        name: '재료 준비',
                        duration: 5,
                        temperature: '상온',
                        instructions: '김치와 고기를 먹기 좋은 크기로 썰어줍니다',
                        tips: '김치는 너무 잘게 썰지 마세요',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 2,
                        name: '김치 볶기',
                        duration: 5,
                        temperature: '중불',
                        instructions: '팬에 기름을 두르고 김치를 볶아줍니다',
                        tips: '김치에서 신맛이 날아갈 때까지 볶아주세요',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 3,
                        name: '고기 볶기',
                        duration: 3,
                        temperature: '중불',
                        instructions: '돼지고기를 넣고 함께 볶아줍니다',
                        tips: '고기가 반 정도 익을 때까지만 볶아주세요',
                        alerts: ['step_start', 'step_end']
                    },
                    {
                        id: 4,
                        name: '물 넣고 끓이기',
                        duration: 12,
                        temperature: '강불→중불',
                        instructions: '물을 넣고 강불에서 끓인 후 중불로 줄여 계속 끓입니다',
                        tips: '김치국물이 우러나도록 충분히 끓여주세요',
                        alerts: ['step_start', 'halfway', 'step_end']
                    },
                    {
                        id: 5,
                        name: '마무리',
                        duration: 5,
                        temperature: '약불',
                        instructions: '두부와 파를 넣고 5분간 더 끓입니다',
                        tips: '두부는 너무 오래 끓이면 부서집니다',
                        alerts: ['step_start', 'completed']
                    }
                ]
            }
        };
        
        // Audio context for better sound control
        this.initAudioContext();
        
        // Initialize the cooking timer
        this.init();
    }
    
    /**
     * Initialize audio context for notifications
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 지원되지 않음');
        }
    }
    
    /**
     * Initialize the cooking timer application
     */
    init() {
        this.bindEvents();
        this.loadUserSettings();
        this.showRecipeSelection();
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Recipe selection events
        document.querySelectorAll('.recipe-card').forEach(card => {
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
        
        // Step configuration
        const startCookingBtn = document.getElementById('start-cooking');
        if (startCookingBtn) {
            startCookingBtn.addEventListener('click', () => this.startCooking());
        }
        
        const backToSelectionBtn = document.getElementById('back-to-selection');
        if (backToSelectionBtn) {
            backToSelectionBtn.addEventListener('click', () => this.showRecipeSelection());
        }
        
        // Timer controls
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        const nextStepBtn = document.getElementById('next-step-btn');
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => this.nextStep());
        }
        
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.showNotificationSettings());
        }
        
        // Multi-cooking management
        const addCookingBtn = document.getElementById('add-cooking');
        if (addCookingBtn) {
            addCookingBtn.addEventListener('click', () => this.showAddCookingModal());
        }
        
        const startAllBtn = document.getElementById('start-all');
        if (startAllBtn) {
            startAllBtn.addEventListener('click', () => this.startAllCooking());
        }
        
        const stopAllBtn = document.getElementById('stop-all');
        if (stopAllBtn) {
            stopAllBtn.addEventListener('click', () => this.stopAllCooking());
        }
        
        // Modal events
        this.bindModalEvents();
        
        // Keyboard shortcuts
        this.bindKeyboardShortcuts();
        
        // Visibility API for background timer accuracy
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
    }
    
    /**
     * Bind modal-related events
     */
    bindModalEvents() {
        // Notification modal
        const closeNotificationsBtn = document.getElementById('close-notifications');
        if (closeNotificationsBtn) {
            closeNotificationsBtn.addEventListener('click', () => {
                document.getElementById('notification-modal').style.display = 'none';
            });
        }
        
        const saveNotificationsBtn = document.getElementById('save-notifications');
        if (saveNotificationsBtn) {
            saveNotificationsBtn.addEventListener('click', () => this.saveNotificationSettings());
        }
        
        // Add cooking modal
        const closeAddCookingBtn = document.getElementById('close-add-cooking');
        if (closeAddCookingBtn) {
            closeAddCookingBtn.addEventListener('click', () => {
                document.getElementById('add-cooking-modal').style.display = 'none';
            });
        }
        
        const addCookingForm = document.getElementById('add-cooking-form');
        if (addCookingForm) {
            addCookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addMultipleCooking();
            });
        }
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    /**
     * Bind keyboard shortcuts
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'Enter':
                    if (this.isRunning) {
                        this.nextStep();
                    }
                    break;
                case 'KeyR':
                    if (this.isRunning) {
                        this.resetCurrentStep();
                    }
                    break;
                case 'KeyN':
                    if (!this.isRunning) {
                        this.showAddCookingModal();
                    }
                    break;
                case 'Escape':
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.style.display = 'none';
                    });
                    break;
            }
        });
    }
    
    /**
     * Show recipe selection screen
     */
    showRecipeSelection() {
        document.getElementById('recipe-selection').style.display = 'block';
        document.getElementById('step-configuration').style.display = 'none';
        document.getElementById('cooking-timer-main').style.display = 'none';
    }
    
    /**
     * Select a recipe and show step configuration
     */
    selectRecipe(recipeId) {
        if (this.recipes[recipeId]) {
            this.currentRecipe = this.recipes[recipeId];
            this.showStepConfiguration();
        }
    }
    
    /**
     * Create custom recipe from form data
     */
    createCustomRecipe() {
        const name = document.getElementById('recipe-name').value;
        const totalTime = parseInt(document.getElementById('total-time').value);
        const stepCount = parseInt(document.getElementById('step-count').value);
        
        if (!name || !totalTime || !stepCount) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        // Create custom recipe object
        const customRecipe = {
            id: 'custom_' + Date.now(),
            name: name,
            icon: '🍽️',
            category: '커스텀',
            difficulty: '사용자정의',
            totalTime: totalTime,
            servings: 1,
            ingredients: [],
            steps: []
        };
        
        // Generate default steps
        const stepTime = Math.floor(totalTime / stepCount);
        const remainingTime = totalTime % stepCount;
        
        for (let i = 1; i <= stepCount; i++) {
            const duration = i === stepCount ? stepTime + remainingTime : stepTime;
            customRecipe.steps.push({
                id: i,
                name: `${i}단계`,
                duration: duration,
                temperature: '중불',
                instructions: `${i}번째 요리 단계를 진행하세요`,
                tips: '설정된 시간에 맞춰 요리해주세요',
                alerts: ['step_start', 'step_end']
            });
        }
        
        this.currentRecipe = customRecipe;
        this.showStepConfiguration();
    }
    
    /**
     * Show step configuration screen
     */
    showStepConfiguration() {
        document.getElementById('recipe-selection').style.display = 'none';
        document.getElementById('step-configuration').style.display = 'block';
        document.getElementById('cooking-timer-main').style.display = 'none';
        
        this.renderStepConfiguration();
    }
    
    /**
     * Render step configuration interface
     */
    renderStepConfiguration() {
        const container = document.getElementById('steps-config-container');
        const recipeNameEl = document.getElementById('config-recipe-name');
        const totalTimeEl = document.getElementById('config-total-time');
        
        if (recipeNameEl) recipeNameEl.textContent = this.currentRecipe.name;
        if (totalTimeEl) totalTimeEl.textContent = `${this.currentRecipe.totalTime}분`;
        
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentRecipe.steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step-config-item';
            stepEl.innerHTML = `
                <div class="step-number">${step.id}단계</div>
                <div class="step-details">
                    <div class="input-label">단계명</div>
                    <input type="text" value="${step.name}" placeholder="예: 물 끓이기" 
                           data-step="${index}" data-field="name">
                    <div class="input-label">상세 설명</div>
                    <textarea placeholder="단계별 상세한 요리 방법을 입력하세요..." 
                              data-step="${index}" data-field="instructions">${step.instructions}</textarea>
                </div>
                <div class="step-time">
                    <div class="input-label">시간</div>
                    <input type="number" value="${step.duration}" min="1" max="60" 
                           class="step-time-input" data-step="${index}" data-field="duration">
                    <span class="unit-label">분</span>
                </div>
                <div class="step-temp">
                    <div class="input-label">온도</div>
                    <select class="step-temp-select" data-step="${index}" data-field="temperature">
                        <option value="상온" ${step.temperature === '상온' ? 'selected' : ''}>🌡️ 상온</option>
                        <option value="약불" ${step.temperature === '약불' ? 'selected' : ''}>🔥 약불</option>
                        <option value="중불" ${step.temperature === '중불' ? 'selected' : ''}>🔥🔥 중불</option>
                        <option value="강불" ${step.temperature === '강불' ? 'selected' : ''}>🔥🔥🔥 강불</option>
                        <option value="오븐" ${step.temperature === '오븐' ? 'selected' : ''}>🔥🔥🔥🔥 오븐</option>
                    </select>
                </div>
            `;
            container.appendChild(stepEl);
        });
        
        // Bind change events for step configuration
        container.addEventListener('change', (e) => {
            const stepIndex = parseInt(e.target.dataset.step);
            const field = e.target.dataset.field;
            const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
            
            if (this.currentRecipe.steps[stepIndex]) {
                this.currentRecipe.steps[stepIndex][field] = value;
                
                // Recalculate total time if duration changed
                if (field === 'duration') {
                    const totalTime = this.currentRecipe.steps.reduce((sum, step) => sum + step.duration, 0);
                    this.currentRecipe.totalTime = totalTime;
                    if (totalTimeEl) totalTimeEl.textContent = `${totalTime}분`;
                }
            }
        });
    }
    
    /**
     * Start cooking with current recipe
     */
    startCooking() {
        if (!this.currentRecipe || !this.currentRecipe.steps.length) {
            alert('레시피를 선택해주세요.');
            return;
        }
        
        document.getElementById('recipe-selection').style.display = 'none';
        document.getElementById('step-configuration').style.display = 'none';
        document.getElementById('cooking-timer-main').style.display = 'block';
        
        this.currentStep = 0;
        this.isRunning = true;
        this.isPaused = false;
        
        this.renderCookingInterface();
        this.startCurrentStep();
        
        // Add some default side dishes to multi-cooking
        this.addDefaultMultipleCooking();
        
        // Request notification permission
        this.requestNotificationPermission();
    }
    
    /**
     * Render the main cooking interface
     */
    renderCookingInterface() {
        this.updateMainTimer();
        this.renderStepsProgress();
        this.updateCookingTips();
    }
    
    /**
     * Start the current step timer
     */
    startCurrentStep() {
        if (!this.currentRecipe || this.currentStep >= this.currentRecipe.steps.length) {
            this.completeCooking();
            return;
        }
        
        const step = this.currentRecipe.steps[this.currentStep];
        this.remainingTime = step.duration * 60; // Convert to seconds
        
        this.updateMainTimer();
        this.updateStepsProgress();
        this.updateCookingTips();
        
        // Send step start notification
        this.sendNotification('step_start', `${step.name}이(가) 시작되었습니다`, step.instructions);
        
        // Start the timer interval
        this.stepInterval = setInterval(() => {
            if (!this.isPaused) {
                this.remainingTime--;
                
                this.updateMainTimer();
                
                // Send notifications at specific intervals
                if (this.remainingTime === Math.floor(step.duration * 60 / 2)) {
                    this.sendNotification('halfway', `${step.name} 중간 지점입니다`, '요리 상태를 확인해주세요');
                } else if (this.remainingTime === 30) {
                    this.sendNotification('final_warning', '곧 완료됩니다', '30초 남았습니다');
                }
                
                if (this.remainingTime <= 0) {
                    this.completeCurrentStep();
                }
            }
        }, 1000);
    }
    
    /**
     * Complete current step and move to next
     */
    completeCurrentStep() {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
        
        const step = this.currentRecipe.steps[this.currentStep];
        this.sendNotification('step_end', `${step.name}이(가) 완료되었습니다`, '다음 단계로 진행하세요');
        
        this.currentStep++;
        
        if (this.currentStep >= this.currentRecipe.steps.length) {
            this.completeCooking();
        } else {
            // Auto-advance to next step after 3 seconds
            setTimeout(() => {
                if (this.isRunning) {
                    this.startCurrentStep();
                }
            }, 3000);
        }
    }
    
    /**
     * Complete the entire cooking process
     */
    completeCooking() {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
        
        this.isRunning = false;
        this.sendNotification('completed', '요리가 완성되었습니다!', '맛있게 드세요!');
        
        // Update UI to show completion
        const mainTime = document.getElementById('main-time');
        const stepStatus = document.getElementById('step-status');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (mainTime) mainTime.textContent = '완료!';
        if (stepStatus) stepStatus.textContent = '요리 완성';
        if (pauseBtn) pauseBtn.textContent = '🎉 완료';
        
        // Celebrate with visual effects
        this.celebrateCompletion();
    }
    
    /**
     * Toggle pause/resume timer
     */
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️ 재개' : '⏸️ 일시정지';
            pauseBtn.className = this.isPaused ? 'btn btn-success' : 'btn btn-warning';
        }
    }
    
    /**
     * Manually advance to next step
     */
    nextStep() {
        if (!this.isRunning) return;
        
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
        
        this.completeCurrentStep();
    }
    
    /**
     * Reset current step timer
     */
    resetCurrentStep() {
        if (!this.isRunning || this.currentStep >= this.currentRecipe.steps.length) return;
        
        const step = this.currentRecipe.steps[this.currentStep];
        this.remainingTime = step.duration * 60;
        this.updateMainTimer();
    }
    
    /**
     * Update main timer display
     */
    updateMainTimer() {
        const mainTime = document.getElementById('main-time');
        const stepStatus = document.getElementById('step-status');
        const stepIndicator = document.getElementById('step-indicator');
        const progressFill = document.getElementById('main-progress');
        
        if (!this.currentRecipe || this.currentStep >= this.currentRecipe.steps.length) return;
        
        const step = this.currentRecipe.steps[this.currentStep];
        const totalSeconds = step.duration * 60;
        const progress = ((totalSeconds - this.remainingTime) / totalSeconds) * 100;
        
        if (mainTime) {
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            mainTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (stepStatus) {
            stepStatus.textContent = step.name;
        }
        
        if (stepIndicator) {
            stepIndicator.textContent = `현재 단계: ${step.name} (${this.currentStep + 1}/${this.currentRecipe.steps.length})`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        // Update progress text with temperature indicator
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            const tempIcon = this.getTemperatureIcon(step.temperature);
            progressText.textContent = `${tempIcon} ${Math.round(progress)}%`;
        }
    }
    
    /**
     * Get temperature icon based on heat level
     */
    getTemperatureIcon(temperature) {
        const icons = {
            '약불': '🔥',
            '중불': '🔥🔥',
            '강불': '🔥🔥🔥',
            '상온': '❄️'
        };
        return icons[temperature] || '🔥';
    }
    
    /**
     * Render steps progress list
     */
    renderStepsProgress() {
        const stepsList = document.getElementById('steps-list');
        const totalTimeDisplay = document.getElementById('total-time-display');
        const remainingTimeDisplay = document.getElementById('remaining-time-display');
        
        if (!stepsList || !this.currentRecipe) return;
        
        stepsList.innerHTML = '';
        
        this.currentRecipe.steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step-item';
            
            let statusClass = 'pending';
            let statusIcon = '⏳';
            
            if (index < this.currentStep) {
                statusClass = 'completed';
                statusIcon = '✅';
            } else if (index === this.currentStep) {
                statusClass = 'active';
                statusIcon = '🔥';
            }
            
            stepEl.classList.add(statusClass);
            
            const timeText = index === this.currentStep && this.isRunning ? 
                `${Math.floor(this.remainingTime / 60)}:${(this.remainingTime % 60).toString().padStart(2, '0')} 남음` :
                `${step.duration}:00 예정`;
            
            stepEl.innerHTML = `
                <div class="step-status-icon">${statusIcon}</div>
                <div class="step-info">
                    <div class="step-name">${step.id}. ${step.name}</div>
                    <div class="step-time">${timeText}</div>
                </div>
            `;
            
            stepsList.appendChild(stepEl);
        });
        
        // Update time summary
        if (totalTimeDisplay) {
            const totalMinutes = this.currentRecipe.totalTime;
            totalTimeDisplay.textContent = `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
        }
        
        if (remainingTimeDisplay) {
            const completedTime = this.currentRecipe.steps
                .slice(0, this.currentStep)
                .reduce((sum, step) => sum + step.duration, 0);
            const currentStepRemaining = Math.floor(this.remainingTime / 60);
            const futureTime = this.currentRecipe.steps
                .slice(this.currentStep + 1)
                .reduce((sum, step) => sum + step.duration, 0);
            
            const totalRemaining = currentStepRemaining + futureTime;
            remainingTimeDisplay.textContent = `${Math.floor(totalRemaining / 60)}:${(totalRemaining % 60).toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Update steps progress (called during timer)
     */
    updateStepsProgress() {
        this.renderStepsProgress();
    }
    
    /**
     * Update cooking tips based on current step
     */
    updateCookingTips() {
        const stepTip = document.getElementById('step-tip');
        const tempGuide = document.getElementById('temp-guide');
        const timeGuide = document.getElementById('time-guide');
        
        if (!this.currentRecipe || this.currentStep >= this.currentRecipe.steps.length) return;
        
        const step = this.currentRecipe.steps[this.currentStep];
        
        if (stepTip) {
            stepTip.textContent = step.tips || step.instructions;
        }
        
        if (tempGuide) {
            tempGuide.textContent = step.temperature;
            
            // Apply temperature color class
            tempGuide.className = this.getTemperatureClass(step.temperature);
        }
        
        if (timeGuide) {
            timeGuide.textContent = `${step.duration}분`;
        }
    }
    
    /**
     * Get CSS class for temperature styling
     */
    getTemperatureClass(temperature) {
        const classes = {
            '상온': 'temp-cold',
            '약불': 'temp-warm', 
            '중불': 'temp-hot',
            '강불': 'temp-critical'
        };
        return classes[temperature] || 'temp-warm';
    }
    
    /**
     * Add default multiple cooking items
     */
    addDefaultMultipleCooking() {
        this.multipleCooking = [
            {
                id: 1,
                name: '밥솥',
                icon: '🍚',
                duration: 15,
                remainingTime: 15 * 60,
                status: '진행중',
                isRunning: true
            },
            {
                id: 2,
                name: '반찬 1',
                icon: '🥬',
                duration: 2.5,
                remainingTime: 0,
                status: '완료',
                isRunning: false
            },
            {
                id: 3,
                name: '반찬 2',
                icon: '🥕',
                duration: 5,
                remainingTime: 5 * 60,
                status: '대기중',
                isRunning: false
            }
        ];
        
        this.renderMultipleCooking();
        this.startMultipleCookingTimers();
    }
    
    /**
     * Render multiple cooking list
     */
    renderMultipleCooking() {
        const cookingList = document.getElementById('cooking-list');
        if (!cookingList) return;
        
        cookingList.innerHTML = '';
        
        this.multipleCooking.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cooking-item';
            
            const progress = this.generateProgressDots(item);
            const timeDisplay = item.status === '완료' ? '[완료]' : 
                                item.status === '대기중' ? `[${Math.floor(item.duration)}:00]` :
                                `[${Math.floor(item.remainingTime / 60)}:${(item.remainingTime % 60).toString().padStart(2, '0')}]`;
            
            itemEl.innerHTML = `
                <div class="cooking-icon">${item.icon}</div>
                <div class="cooking-info">
                    <div class="cooking-name">${item.name}</div>
                    <div class="cooking-timer">${timeDisplay}</div>
                </div>
                <div class="cooking-progress">
                    <div class="cooking-dots">${progress}</div>
                    <div class="cooking-status ${item.status}">${item.status}</div>
                </div>
            `;
            
            cookingList.appendChild(itemEl);
        });
    }
    
    /**
     * Generate progress dots for cooking item
     */
    generateProgressDots(item) {
        const totalDots = 6;
        const completedDots = item.status === '완료' ? totalDots :
                             item.status === '대기중' ? 0 :
                             Math.floor(((item.duration * 60 - item.remainingTime) / (item.duration * 60)) * totalDots);
        
        let dots = '';
        for (let i = 0; i < totalDots; i++) {
            if (i < completedDots) {
                dots += '<div class="dot completed"></div>';
            } else if (i === completedDots && item.status === '진행중') {
                dots += '<div class="dot active"></div>';
            } else {
                dots += '<div class="dot"></div>';
            }
        }
        
        return dots;
    }
    
    /**
     * Start timers for multiple cooking items
     */
    startMultipleCookingTimers() {
        this.multipleCookingInterval = setInterval(() => {
            let hasRunning = false;
            
            this.multipleCooking.forEach(item => {
                if (item.isRunning && item.remainingTime > 0) {
                    item.remainingTime--;
                    hasRunning = true;
                    
                    if (item.remainingTime <= 0) {
                        item.status = '완료';
                        item.isRunning = false;
                        this.sendNotification('step_end', `${item.name}이(가) 완료되었습니다`, '');
                    }
                }
            });
            
            this.renderMultipleCooking();
            
            if (!hasRunning) {
                clearInterval(this.multipleCookingInterval);
            }
        }, 1000);
    }
    
    /**
     * Show add cooking modal
     */
    showAddCookingModal() {
        document.getElementById('add-cooking-modal').style.display = 'flex';
    }
    
    /**
     * Add new multiple cooking item
     */
    addMultipleCooking() {
        const name = document.getElementById('new-cooking-name').value;
        const time = parseInt(document.getElementById('new-cooking-time').value);
        const icon = document.getElementById('new-cooking-icon').value;
        
        if (!name || !time) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        const newItem = {
            id: Date.now(),
            name: name,
            icon: icon,
            duration: time,
            remainingTime: time * 60,
            status: '대기중',
            isRunning: false
        };
        
        this.multipleCooking.push(newItem);
        this.renderMultipleCooking();
        
        // Clear form and close modal
        document.getElementById('add-cooking-form').reset();
        document.getElementById('add-cooking-modal').style.display = 'none';
    }
    
    /**
     * Start all multiple cooking timers
     */
    startAllCooking() {
        this.multipleCooking.forEach(item => {
            if (item.status === '대기중') {
                item.status = '진행중';
                item.isRunning = true;
            }
        });
        
        this.renderMultipleCooking();
        
        if (!this.multipleCookingInterval) {
            this.startMultipleCookingTimers();
        }
    }
    
    /**
     * Stop all multiple cooking timers
     */
    stopAllCooking() {
        this.multipleCooking.forEach(item => {
            if (item.status === '진행중') {
                item.status = '대기중';
                item.isRunning = false;
            }
        });
        
        this.renderMultipleCooking();
        
        if (this.multipleCookingInterval) {
            clearInterval(this.multipleCookingInterval);
            this.multipleCookingInterval = null;
        }
    }
    
    /**
     * Show notification settings modal
     */
    showNotificationSettings() {
        const modal = document.getElementById('notification-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Load current settings
            document.getElementById('sound-notification').checked = this.notificationSettings.sound;
            document.getElementById('vibration-notification').checked = this.notificationSettings.vibration;
            document.getElementById('visual-notification').checked = this.notificationSettings.visual;
        }
    }
    
    /**
     * Save notification settings
     */
    saveNotificationSettings() {
        this.notificationSettings = {
            sound: document.getElementById('sound-notification').checked,
            vibration: document.getElementById('vibration-notification').checked,
            visual: document.getElementById('visual-notification').checked
        };
        
        localStorage.setItem('cooking-timer-notifications', JSON.stringify(this.notificationSettings));
        document.getElementById('notification-modal').style.display = 'none';
    }
    
    /**
     * Send notification based on type and settings
     */
    sendNotification(type, title, message) {
        const alertTypes = {
            step_start: {
                sound: 'ding',
                vibration: [200],
                color: '#3498db'
            },
            step_end: {
                sound: 'bell',
                vibration: [200, 100, 200],
                color: '#27ae60'
            },
            halfway: {
                sound: 'tick',
                vibration: [100],
                color: '#f39c12'
            },
            final_warning: {
                sound: 'warning',
                vibration: [300, 100, 300],
                color: '#e74c3c'
            },
            completed: {
                sound: 'complete',
                vibration: [500, 200, 500],
                color: '#9b59b6'
            }
        };
        
        const alert = alertTypes[type] || alertTypes.step_start;
        
        // Sound notification
        if (this.notificationSettings.sound) {
            this.playNotificationSound(alert.sound);
        }
        
        // Vibration (mobile)
        if (this.notificationSettings.vibration && 'vibrate' in navigator) {
            navigator.vibrate(alert.vibration);
        }
        
        // Visual notification
        if (this.notificationSettings.visual) {
            this.showVisualNotification(title, message, alert.color);
        }
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '../assets/images/favicon.svg',
                badge: '../assets/images/favicon.svg'
            });
        }
    }
    
    /**
     * Play notification sound
     */
    playNotificationSound(soundType) {
        if (!this.audioContext) return;
        
        // Generate simple tones for different notification types
        const frequencies = {
            ding: 800,
            bell: 1000,
            tick: 600,
            warning: 400,
            complete: 523.25 // C5
        };
        
        const freq = frequencies[soundType] || frequencies.ding;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('소리 재생 실패:', e);
        }
    }
    
    /**
     * Show visual notification
     */
    showVisualNotification(title, message, color) {
        // Create notification toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 300px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        toast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 0.9em; opacity: 0.9;">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    /**
     * Load user settings from localStorage
     */
    loadUserSettings() {
        const savedNotifications = localStorage.getItem('cooking-timer-notifications');
        if (savedNotifications) {
            this.notificationSettings = JSON.parse(savedNotifications);
        }
    }
    
    /**
     * Handle page visibility change (for background timer accuracy)
     */
    onPageHidden() {
        this.lastHiddenTime = Date.now();
    }
    
    /**
     * Handle page becoming visible (sync timer)
     */
    onPageVisible() {
        if (this.lastHiddenTime && this.isRunning && !this.isPaused) {
            const elapsed = Math.floor((Date.now() - this.lastHiddenTime) / 1000);
            this.remainingTime = Math.max(0, this.remainingTime - elapsed);
            this.updateMainTimer();
            
            if (this.remainingTime <= 0) {
                this.completeCurrentStep();
            }
        }
    }
    
    /**
     * Celebrate cooking completion with visual effects
     */
    celebrateCompletion() {
        // Add celebration animation to the main timer
        const timerCircle = document.querySelector('.time-circle');
        if (timerCircle) {
            timerCircle.style.animation = 'scaleIn 0.5s ease-out';
            timerCircle.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        }
        
        // Show celebration message
        this.showVisualNotification('🎉 완료!', '요리가 완성되었습니다! 맛있게 드세요!', '#27ae60');
        
        // Confetti effect (simple version)
        this.createConfettiEffect();
    }
    
    /**
     * Create simple confetti effect
     */
    createConfettiEffect() {
        const colors = ['#ff6b35', '#f7931e', '#ffb347', '#27ae60', '#e74c3c'];
        const container = document.querySelector('.cooking-container');
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                animation: fall ${Math.random() * 2 + 2}s linear forwards;
                z-index: 1000;
                pointer-events: none;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }
        
        // Add fall animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes fall {
                    from {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 1;
                    }
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize cooking timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cookingTimer = new CookingTimer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookingTimer;
}