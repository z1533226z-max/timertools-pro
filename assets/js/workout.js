/**
 * Workout Timer JavaScript - TimerTools Pro
 * Advanced workout timer with set/rest management, exercise programs,
 * progress tracking, and workout recording
 */

class WorkoutTimer {
    constructor() {
        this.currentProgram = null;
        this.currentExercise = 0;
        this.currentSet = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isResting = false;
        this.remainingTime = 0;
        this.restTime = 0;
        this.timerInterval = null;
        this.restInterval = null;
        this.audioContext = null;
        this.workoutStartTime = null;
        this.workoutData = {
            exercises: [],
            totalTime: 0,
            totalSets: 0,
            caloriesBurned: 0
        };
        
        // Workout program database
        this.programs = {
            'upper-body': {
                id: 'upper-body',
                name: '상체 운동',
                icon: '💪',
                category: '근력',
                difficulties: {
                    beginner: {
                        name: '초급',
                        exercises: [
                            {
                                name: '푸시업',
                                icon: '💪',
                                type: 'strength',
                                sets: 2,
                                reps: 8,
                                duration: 45,
                                rest: 60,
                                tips: '푸시업 시 몸을 일직선으로 유지하고 가슴이 바닥에 닿을 정도로 깊게 내려가세요.'
                            },
                            {
                                name: '덤벨 프레스',
                                icon: '🏋️',
                                type: 'strength',
                                sets: 2,
                                reps: 10,
                                duration: 60,
                                rest: 90,
                                tips: '어깨 너비로 다리를 벌리고 코어를 단단히 유지하세요.'
                            },
                            {
                                name: '플랭크',
                                icon: '🤲',
                                type: 'strength',
                                sets: 2,
                                reps: 1,
                                duration: 30,
                                rest: 60,
                                tips: '팔꿈치는 어깨 바로 아래에 위치하고 몸을 일직선으로 유지하세요.'
                            }
                        ]
                    },
                    intermediate: {
                        name: '중급',
                        exercises: [
                            {
                                name: '푸시업',
                                icon: '💪',
                                type: 'strength',
                                sets: 3,
                                reps: 12,
                                duration: 45,
                                rest: 60,
                                tips: '푸시업 시 몸을 일직선으로 유지하고 가슴이 바닥에 닿을 정도로 깊게 내려가세요.'
                            },
                            {
                                name: '덤벨 프레스',
                                icon: '🏋️',
                                type: 'strength',
                                sets: 3,
                                reps: 12,
                                duration: 60,
                                rest: 75,
                                tips: '어깨 너비로 다리를 벌리고 코어를 단단히 유지하세요.'
                            },
                            {
                                name: '풀업',
                                icon: '🤸',
                                type: 'strength',
                                sets: 3,
                                reps: 8,
                                duration: 45,
                                rest: 90,
                                tips: '어깨날개를 뒤로 당기고 가슴을 펴서 올라가세요.'
                            }
                        ]
                    },
                    advanced: {
                        name: '고급',
                        exercises: [
                            {
                                name: '푸시업',
                                icon: '💪',
                                type: 'strength',
                                sets: 4,
                                reps: 15,
                                duration: 45,
                                rest: 45,
                                tips: '푸시업 시 몸을 일직선으로 유지하고 가슴이 바닥에 닿을 정도로 깊게 내려가세요.'
                            },
                            {
                                name: '덤벨 프레스',
                                icon: '🏋️',
                                type: 'strength',
                                sets: 4,
                                reps: 15,
                                duration: 60,
                                rest: 60,
                                tips: '어깨 너비로 다리를 벌리고 코어를 단단히 유지하세요.'
                            },
                            {
                                name: '풀업',
                                icon: '🤸',
                                type: 'strength',
                                sets: 4,
                                reps: 12,
                                duration: 45,
                                rest: 75,
                                tips: '어깨날개를 뒤로 당기고 가슴을 펴서 올라가세요.'
                            }
                        ]
                    }
                }
            },
            'lower-body': {
                id: 'lower-body',
                name: '하체 운동',
                icon: '🦵',
                category: '근력',
                difficulties: {
                    beginner: {
                        name: '초급',
                        exercises: [
                            {
                                name: '스쿼트',
                                icon: '🏃',
                                type: 'strength',
                                sets: 3,  
                                reps: 15,
                                duration: 45,
                                rest: 60,
                                tips: '발끝이 무릎과 같은 방향을 향하게 하고 무릎이 발끝을 넘지 않게 하세요.'
                            },
                            {
                                name: '런지',
                                icon: '🚶',
                                type: 'strength',
                                sets: 2,
                                reps: 10,
                                duration: 60,
                                rest: 90,
                                tips: '앞다리 무릎이 90도가 되도록 하고 뒷다리 무릎은 바닥에 거의 닿을 정도로 내려가세요.'
                            },
                            {
                                name: '카프 레이즈',
                                icon: '🦵',
                                type: 'strength',
                                sets: 2,
                                reps: 15,
                                duration: 30,
                                rest: 60,
                                tips: '발끝으로 최대한 높이 올라가서 1-2초 정지했다가 천천히 내려오세요.'
                            }
                        ]
                    },
                    intermediate: {
                        name: '중급',
                        exercises: [
                            {
                                name: '스쿼트',
                                icon: '🏃',
                                type: 'strength',
                                sets: 4,
                                reps: 20,
                                duration: 45,
                                rest: 60,
                                tips: '발끝이 무릎과 같은 방향을 향하게 하고 무릎이 발끝을 넘지 않게 하세요.'
                            },
                            {
                                name: '런지',
                                icon: '🚶',
                                type: 'strength',
                                sets: 3,
                                reps: 15,
                                duration: 60,
                                rest: 75,
                                tips: '앞다리 무릎이 90도가 되도록 하고 뒷다리 무릎은 바닥에 거의 닿을 정도로 내려가세요.'
                            },
                            {
                                name: '카프 레이즈',
                                icon: '🦵',
                                type: 'strength',
                                sets: 3,
                                reps: 20,
                                duration: 30,
                                rest: 45,
                                tips: '발끝으로 최대한 높이 올라가서 1-2초 정지했다가 천천히 내려오세요.'
                            }
                        ]
                    },
                    advanced: {
                        name: '고급',
                        exercises: [
                            {
                                name: '스쿼트',
                                icon: '🏃',
                                type: 'strength',
                                sets: 5,
                                reps: 25,
                                duration: 45,
                                rest: 45,
                                tips: '발끝이 무릎과 같은 방향을 향하게 하고 무릎이 발끝을 넘지 않게 하세요.'
                            },
                            {
                                name: '런지',
                                icon: '🚶',
                                type: 'strength',
                                sets: 4,
                                reps: 20,
                                duration: 60,
                                rest: 60,
                                tips: '앞다리 무릎이 90도가 되도록 하고 뒷다리 무릎은 바닥에 거의 닿을 정도로 내려가세요.'
                            },
                            {
                                name: '카프 레이즈',
                                icon: '🦵',
                                type: 'strength',
                                sets: 4,
                                reps: 25,
                                duration: 30,
                                rest: 30,
                                tips: '발끝으로 최대한 높이 올라가서 1-2초 정지했다가 천천히 내려오세요.'
                            }
                        ]
                    }
                }
            },
            'cardio': {
                id: 'cardio',
                name: '유산소 운동',
                icon: '❤️',
                category: '유산소',
                difficulties: {
                    'low-intensity': {
                        name: '저강도',
                        exercises: [
                            {
                                name: '제자리 걷기',
                                icon: '🚶',
                                type: 'cardio',
                                sets: 3,
                                reps: 1,
                                duration: 120,
                                rest: 60,
                                tips: '무릎을 높이 올리며 팔을 자연스럽게 흔들어주세요.'
                            },
                            {
                                name: '팔 돌리기',
                                icon: '🔄',
                                type: 'cardio',
                                sets: 2,
                                reps: 20,
                                duration: 60,
                                rest: 30,
                                tips: '어깨를 중심으로 큰 원을 그리며 천천히 돌려주세요.'
                            }
                        ]
                    },
                    'moderate-intensity': {
                        name: '중강도',
                        exercises: [
                            {
                                name: '점핑잭',
                                icon: '🤸',
                                type: 'cardio',
                                sets: 4,
                                reps: 1,
                                duration: 60,
                                rest: 60,
                                tips: '점프할 때 무릎에 무리가 가지 않도록 부드럽게 착지하세요.'
                            },
                            {
                                name: '마운틴 클라이머',
                                icon: '🏔️',
                                type: 'cardio',
                                sets: 3,
                                reps: 1,
                                duration: 45,
                                rest: 75,
                                tips: '코어를 단단히 유지하고 빠르게 무릎을 가슴 쪽으로 당겨주세요.'
                            }
                        ]
                    },
                    'high-intensity': {
                        name: '고강도',
                        exercises: [
                            {
                                name: 'HIIT 버피',
                                icon: '🔥',
                                type: 'cardio',
                                sets: 8,
                                reps: 1,
                                duration: 30,
                                rest: 30,
                                tips: '최대한 빠르게 동작하되 올바른 폼을 유지하세요.'
                            },
                            {
                                name: '타바타 스쿼트',
                                icon: '⚡',
                                type: 'cardio',
                                sets: 8,
                                reps: 1,
                                duration: 20,
                                rest: 10,
                                tips: '20초 동안 최대한 많은 횟수를 목표로 하세요.'
                            }
                        ]
                    }
                }
            }
        };
        
        // Quick start programs
        this.quickPrograms = {
            hiit: {
                name: 'HIIT 운동',
                icon: '🔥',
                exercises: [
                    {
                        name: '버피',
                        icon: '🔥',
                        type: 'cardio',
                        sets: 4,
                        reps: 1,
                        duration: 30,
                        rest: 30,
                        tips: '최대한 빠르게 동작하되 올바른 폼을 유지하세요.'
                    },
                    {
                        name: '점핑잭',
                        icon: '🤸',
                        type: 'cardio',
                        sets: 4,
                        reps: 1,
                        duration: 30,
                        rest: 30,
                        tips: '점프할 때 무릎에 무리가 가지 않도록 부드럽게 착지하세요.'
                    },
                    {
                        name: '마운틴 클라이머',
                        icon: '🏔️',
                        type: 'cardio',
                        sets: 4,
                        reps: 1,
                        duration: 30,
                        rest: 30,
                        tips: '코어를 단단히 유지하고 빠르게 무릎을 가슴 쪽으로 당겨주세요.'
                    }
                ]
            },
            tabata: {
                name: '타바타 운동',
                icon: '⚡',
                exercises: [
                    {
                        name: '타바타 스쿼트',
                        icon: '⚡',
                        type: 'cardio',
                        sets: 8,
                        reps: 1,
                        duration: 20,
                        rest: 10,
                        tips: '20초 동안 최대한 많은 횟수를 목표로 하세요.'
                    }
                ]
            }
        };
        
        // Initialize audio context
        this.initAudioContext();
        
        // Initialize the workout timer
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
     * Initialize the workout timer application
     */
    init() {
        this.bindEvents();
        this.loadUserSettings();
        this.showProgramSelection();
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Program selection events
        document.querySelectorAll('.program-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const programId = e.currentTarget.dataset.program;
                this.selectProgram(programId);
            });
        });
        
        // Quick start events
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quickId = e.currentTarget.dataset.quick;
                this.startQuickProgram(quickId);
            });
        });
        
        // Custom program form
        const customForm = document.getElementById('custom-program-form');
        if (customForm) {
            customForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createCustomProgram();
            });
        }
        
        // Program configuration events
        const backToSelectionBtn = document.getElementById('back-to-program-selection');
        if (backToSelectionBtn) {
            backToSelectionBtn.addEventListener('click', () => this.showProgramSelection());
        }
        
        const startWorkoutBtn = document.getElementById('start-workout');
        if (startWorkoutBtn) {
            startWorkoutBtn.addEventListener('click', () => this.startWorkout());
        }
        
        // Difficulty selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('difficulty-btn')) {
                const difficulty = e.target.dataset.difficulty;
                this.selectDifficulty(difficulty);
            }
        });
        
        // Timer controls
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        const restBtn = document.getElementById('rest-btn');
        if (restBtn) {
            restBtn.addEventListener('click', () => this.startRest());
        }
        
        const completeSetBtn = document.getElementById('complete-set-btn');
        if (completeSetBtn) {
            completeSetBtn.addEventListener('click', () => this.completeSet());
        }
        
        const logSetBtn = document.getElementById('log-set');
        if (logSetBtn) {
            logSetBtn.addEventListener('click', () => this.logSet());
        }
        
        // Rest controls
        const skipRestBtn = document.getElementById('skip-rest-btn');
        if (skipRestBtn) {
            skipRestBtn.addEventListener('click', () => this.skipRest());
        }
        
        const extendRestBtn = document.getElementById('extend-rest-btn');
        if (extendRestBtn) {
            extendRestBtn.addEventListener('click', () => this.extendRest(30));
        }
        
        // Program controls
        const nextExerciseBtn = document.getElementById('next-exercise-btn');
        if (nextExerciseBtn) {
            nextExerciseBtn.addEventListener('click', () => this.nextExercise());
        }
        
        const completeProgramBtn = document.getElementById('complete-program-btn');
        if (completeProgramBtn) {
            completeProgramBtn.addEventListener('click', () => this.completeProgram());
        }
        
        // Workout complete events
        const saveWorkoutBtn = document.getElementById('save-workout-btn');
        if (saveWorkoutBtn) {
            saveWorkoutBtn.addEventListener('click', () => this.saveWorkout());
        }
        
        const newWorkoutBtn = document.getElementById('new-workout-btn');
        if (newWorkoutBtn) {
            newWorkoutBtn.addEventListener('click', () => this.startNewWorkout());
        }
        
        // Rating buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-btn')) {
                this.selectRating(e.target);
            }
        });
        
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
        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showExerciseSettings());
        }
        
        const closeSettingsBtn = document.getElementById('close-exercise-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                document.getElementById('exercise-settings-modal').style.display = 'none';
            });
        }
        
        const saveSettingsBtn = document.getElementById('save-exercise-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveExerciseSettings());
        }
        
        // Add exercise modal
        const addCustomProgramBtn = document.getElementById('add-custom-program');
        if (addCustomProgramBtn) {
            addCustomProgramBtn.addEventListener('click', () => this.showAddExerciseModal());
        }
        
        const closeAddExerciseBtn = document.getElementById('close-add-exercise');
        if (closeAddExerciseBtn) {
            closeAddExerciseBtn.addEventListener('click', () => {
                document.getElementById('add-exercise-modal').style.display = 'none';
            });
        }
        
        const addExerciseForm = document.getElementById('add-exercise-form');
        if (addExerciseForm) {
            addExerciseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCustomExercise();
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
                    if (this.isResting) {
                        this.skipRest();
                    } else {
                        this.togglePause();
                    }
                    break;
                case 'Enter':
                    if (this.isRunning && !this.isResting) {
                        this.completeSet();
                    }
                    break;
                case 'KeyR':
                    if (this.isRunning && !this.isResting) {
                        this.startRest();
                    }
                    break;
                case 'KeyN':
                    if (!this.isRunning) {
                        this.nextExercise();
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
     * Show program selection screen
     */
    showProgramSelection() {
        document.getElementById('program-selection').style.display = 'block';
        document.getElementById('program-configuration').style.display = 'none';
        document.getElementById('workout-timer-main').style.display = 'none';
        document.getElementById('rest-screen').style.display = 'none';
        document.getElementById('workout-complete').style.display = 'none';
    }
    
    /**
     * Select a program and show configuration
     */
    selectProgram(programId) {
        if (this.programs[programId]) {
            this.currentProgram = this.programs[programId];
            this.showProgramConfiguration();
        }
    }
    
    /**
     * Start quick program without configuration
     */
    startQuickProgram(quickId) {
        if (this.quickPrograms[quickId]) {
            this.currentProgram = {
                ...this.quickPrograms[quickId],
                id: quickId,
                selectedDifficulty: 'standard',
                exercises: this.quickPrograms[quickId].exercises
            };
            this.startWorkout();
        }
    }
    
    /**
     * Create custom program from form data
     */
    createCustomProgram() {
        const name = document.getElementById('program-name').value;
        const exerciseCount = parseInt(document.getElementById('exercise-count').value);
        const setCount = parseInt(document.getElementById('set-count').value);
        
        if (!name || !exerciseCount || !setCount) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        // Create custom program object
        const customProgram = {
            id: 'custom_' + Date.now(),
            name: name,
            icon: '🏋️',
            category: '커스텀',
            selectedDifficulty: 'custom',
            exercises: []
        };
        
        // Generate default exercises
        for (let i = 1; i <= exerciseCount; i++) {
            customProgram.exercises.push({
                name: `운동 ${i}`,
                icon: '💪',
                type: 'strength',
                sets: setCount,
                reps: 12,
                duration: 45,
                rest: 60,
                tips: `${i}번째 운동을 올바른 폼으로 수행하세요.`
            });
        }
        
        this.currentProgram = customProgram;
        this.showProgramConfiguration();
    }
    
    /**
     * Show program configuration screen
     */
    showProgramConfiguration() {
        document.getElementById('program-selection').style.display = 'none';
        document.getElementById('program-configuration').style.display = 'block';
        document.getElementById('workout-timer-main').style.display = 'none';
        
        this.renderProgramConfiguration();
    }
    
    /**
     * Render program configuration interface
     */
    renderProgramConfiguration() {
        const programNameEl = document.getElementById('config-program-name');
        const difficultySection = document.getElementById('difficulty-selection');
        
        if (programNameEl) programNameEl.textContent = this.currentProgram.name;
        
        // Show or hide difficulty selection
        if (this.currentProgram.selectedDifficulty === 'custom') {
            difficultySection.style.display = 'none';
            this.renderExercisesConfiguration();
        } else {
            difficultySection.style.display = 'block';
        }
    }
    
    /**
     * Select difficulty level
     */
    selectDifficulty(difficulty) {
        // Update active difficulty button
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // Set selected difficulty and exercises
        this.currentProgram.selectedDifficulty = difficulty;
        this.currentProgram.exercises = this.currentProgram.difficulties[difficulty].exercises;
        
        this.renderExercisesConfiguration();
    }
    
    /**
     * Render exercises configuration
     */
    renderExercisesConfiguration() {
        const container = document.getElementById('exercises-config-container');
        const totalTimeEl = document.getElementById('config-total-time');
        const exerciseCountEl = document.getElementById('config-exercise-count');
        
        if (!container || !this.currentProgram.exercises) return;
        
        container.innerHTML = '';
        
        let totalTime = 0;
        
        this.currentProgram.exercises.forEach((exercise, index) => {
            const exerciseEl = document.createElement('div');
            exerciseEl.className = 'exercise-config-item';
            
            // Calculate exercise time
            const exerciseTime = (exercise.duration + exercise.rest) * exercise.sets;
            totalTime += exerciseTime;
            
            exerciseEl.innerHTML = `
                <div class="exercise-info">
                    <span class="exercise-icon">${exercise.icon}</span>
                    <span class="exercise-name">${exercise.name}</span>
                </div>
                <div class="exercise-sets">
                    <input type="number" value="${exercise.sets}" min="1" max="10" 
                           class="config-input" data-exercise="${index}" data-field="sets">
                    <label>세트</label>
                </div>
                <div class="exercise-reps">
                    <input type="number" value="${exercise.reps}" min="1" max="100" 
                           class="config-input" data-exercise="${index}" data-field="reps">
                    <label>회</label>
                </div>
                <div class="exercise-duration">
                    <input type="number" value="${exercise.duration}" min="10" max="300" 
                           class="config-input" data-exercise="${index}" data-field="duration">
                    <label>초</label>
                </div>
                <div class="exercise-rest">
                    <input type="number" value="${exercise.rest}" min="10" max="300" 
                           class="config-input" data-exercise="${index}" data-field="rest">
                    <label>휴식(초)</label>
                </div>
            `;
            container.appendChild(exerciseEl);
        });
        
        // Update summary
        if (totalTimeEl) totalTimeEl.textContent = `${Math.ceil(totalTime / 60)}분`;
        if (exerciseCountEl) exerciseCountEl.textContent = `${this.currentProgram.exercises.length}개`;
        
        // Bind change events for exercise configuration
        container.addEventListener('change', (e) => {
            const exerciseIndex = parseInt(e.target.dataset.exercise);
            const field = e.target.dataset.field;
            const value = parseInt(e.target.value);
            
            if (this.currentProgram.exercises[exerciseIndex]) {
                this.currentProgram.exercises[exerciseIndex][field] = value;
                
                // Recalculate total time
                let newTotalTime = 0;
                this.currentProgram.exercises.forEach(exercise => {
                    newTotalTime += (exercise.duration + exercise.rest) * exercise.sets;
                });
                
                if (totalTimeEl) totalTimeEl.textContent = `${Math.ceil(newTotalTime / 60)}분`;
            }
        });
    }
    
    /**
     * Start workout with current program
     */
    startWorkout() {
        if (!this.currentProgram || !this.currentProgram.exercises || !this.currentProgram.exercises.length) {
            alert('운동 프로그램을 선택해주세요.');
            return;
        }
        
        document.getElementById('program-selection').style.display = 'none';
        document.getElementById('program-configuration').style.display = 'none';
        document.getElementById('workout-timer-main').style.display = 'block';
        document.getElementById('rest-screen').style.display = 'none';
        document.getElementById('workout-complete').style.display = 'none';
        
        // Initialize workout data
        this.currentExercise = 0;
        this.currentSet = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.isResting = false;
        this.workoutStartTime = Date.now();
        this.workoutData = {
            exercises: [],
            totalTime: 0,
            totalSets: 0,
            caloriesBurned: 0
        };
        
        this.renderWorkoutInterface();
        this.startCurrentExercise();
        
        // Request notification permission
        this.requestNotificationPermission();
    }
    
    /**
     * Render the main workout interface
     */
    renderWorkoutInterface() {
        this.updateMainTimer();
        this.renderProgramProgress();
        this.updateExerciseTips();
        this.updateSetProgress();
    }
    
    /**
     * Start current exercise timer
     */
    startCurrentExercise() {
        if (!this.currentProgram || this.currentExercise >= this.currentProgram.exercises.length) {
            this.completeProgram();
            return;
        }
        
        const exercise = this.currentProgram.exercises[this.currentExercise];
        this.remainingTime = exercise.duration;
        
        this.updateMainTimer();
        this.updateSetProgress();
        this.updateExerciseTips();
        
        // Send exercise start notification
        this.sendNotification('set_start', `${exercise.name} 시작!`, `세트 ${this.currentSet + 1}/${exercise.sets}`);
        
        // Start the timer interval
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isResting) {
                this.remainingTime--;
                
                this.updateMainTimer();
                
                // Send notifications at specific intervals
                if (this.remainingTime === Math.floor(exercise.duration / 2)) {
                    this.sendNotification('halfway', '중간 지점입니다', '계속 화이팅하세요!');
                } else if (this.remainingTime === 10) {
                    this.sendNotification('final_warning', '10초 남았습니다', '마지막 스퍼트!');
                }
                
                if (this.remainingTime <= 0) {
                    this.autoCompleteSet();
                }
            }
        }, 1000);
    }
    
    /**
     * Auto complete set when timer ends
     */
    autoCompleteSet() {
        const exercise = this.currentProgram.exercises[this.currentExercise];
        this.sendNotification('set_end', '세트 완료!', '잘했어요!');
        
        // Log the set automatically
        this.logSetData(exercise.reps);
        
        this.currentSet++;
        
        if (this.currentSet >= exercise.sets) {
            // Exercise complete, move to next
            this.nextExercise();
        } else {
            // Start rest period
            this.startRest();
        }
    }
    
    /**
     * Manually complete current set
     */
    completeSet() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.autoCompleteSet();
    }
    
    /**
     * Log set with actual reps performed
     */
    logSet() {
        const actualReps = parseInt(document.getElementById('actual-reps').value) || 0;
        this.logSetData(actualReps);
        this.completeSet();
    }
    
    /**
     * Log set data to workout record
     */
    logSetData(actualReps) {
        const exercise = this.currentProgram.exercises[this.currentExercise];
        
        // Initialize exercise record if first set
        if (this.currentSet === 0) {
            this.workoutData.exercises.push({
                name: exercise.name,
                sets: [],
                targetSets: exercise.sets,
                targetReps: exercise.reps
            });
        }
        
        // Log current set
        const exerciseIndex = this.workoutData.exercises.length - 1;
        this.workoutData.exercises[exerciseIndex].sets.push({
            setNumber: this.currentSet + 1,
            targetReps: exercise.reps,
            actualReps: actualReps,
            duration: exercise.duration - this.remainingTime,
            restTime: exercise.rest
        });
        
        this.workoutData.totalSets++;
    }
    
    /**
     * Start rest period
     */
    startRest() {
        const exercise = this.currentProgram.exercises[this.currentExercise];
        this.isResting = true;
        this.restTime = exercise.rest;
        
        document.getElementById('rest-screen').style.display = 'flex';
        document.getElementById('workout-timer-main').style.display = 'none';
        
        // Update rest screen info
        this.updateRestScreen();
        
        this.sendNotification('rest_start', '휴식 시간', `${exercise.rest}초간 휴식하세요`);
        
        // Start rest timer
        this.restInterval = setInterval(() => {
            this.restTime--;
            this.updateRestScreen();
            
            if (this.restTime <= 0) {
                this.endRest();
            } else if (this.restTime === 10) {
                this.sendNotification('rest_end', '곧 휴식이 끝납니다', '다음 세트 준비하세요!');
            }
        }, 1000);
    }
    
    /**
     * Update rest screen display
     */
    updateRestScreen() {
        const restTimeEl = document.getElementById('rest-time');
        const restProgressEl = document.getElementById('rest-progress');
        const restInfoEl = document.getElementById('rest-info');
        
        if (restTimeEl) {
            const minutes = Math.floor(this.restTime / 60);
            const seconds = this.restTime % 60;
            restTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (restProgressEl) {
            const exercise = this.currentProgram.exercises[this.currentExercise];
            const progress = ((exercise.rest - this.restTime) / exercise.rest) * 100;
            restProgressEl.style.width = `${progress}%`;
        }
        
        if (restInfoEl) {
            const exercise = this.currentProgram.exercises[this.currentExercise];
            const nextSetText = this.currentSet < exercise.sets ? 
                `다음: ${exercise.name} 세트 ${this.currentSet + 1}/${exercise.sets}` :
                `다음: ${this.currentProgram.exercises[this.currentExercise + 1]?.name || '운동 완료'}`;
            
            restInfoEl.innerHTML = `
                <p>${nextSetText}</p>
                <p>물 한 모금 마시고 심호흡하세요</p>
            `;
        }
    }
    
    /**
     * Skip rest period
     */
    skipRest() {
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
        this.endRest();
    }
    
    /**
     * Extend rest period
     */
    extendRest(seconds) {
        this.restTime += seconds;
        this.sendNotification('rest_start', '휴식 연장', `${seconds}초 추가되었습니다`);
    }
    
    /**
     * End rest period and continue workout
     */
    endRest() {
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
        
        this.isResting = false;
        document.getElementById('rest-screen').style.display = 'none';
        document.getElementById('workout-timer-main').style.display = 'block';
        
        this.startCurrentExercise();
    }
    
    /**
     * Move to next exercise
     */
    nextExercise() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.currentExercise++;
        this.currentSet = 0;
        
        if (this.currentExercise >= this.currentProgram.exercises.length) {
            this.completeProgram();
        } else {
            this.sendNotification('exercise_complete', '운동 완료!', '다음 운동으로 이동합니다');
            this.renderProgramProgress();
            this.startCurrentExercise();
        }
    }
    
    /**
     * Toggle pause/resume
     */
    togglePause() {
        if (!this.isRunning || this.isResting) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️ 재개' : '⏸️ 일시정지';
            pauseBtn.className = this.isPaused ? 'btn btn-success' : 'btn btn-warning';
        }
    }
    
    /**
     * Update main timer display
     */
    updateMainTimer() {
        const mainTime = document.getElementById('main-time');
        const exerciseStatus = document.getElementById('exercise-status');
        const exerciseIndicator = document.getElementById('exercise-indicator');
        const progressFill = document.getElementById('main-progress');
        
        if (!this.currentProgram || this.currentExercise >= this.currentProgram.exercises.length) return;
        
        const exercise = this.currentProgram.exercises[this.currentExercise];
        const progress = ((exercise.duration - this.remainingTime) / exercise.duration) * 100;
        
        if (mainTime) {
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            mainTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (exerciseStatus) {
            const statusIcon = this.getExerciseStatusIcon(exercise.type);
            exerciseStatus.textContent = this.isPaused ? '⏸️ 일시정지' : `${statusIcon} 운동중`;
        }
        
        if (exerciseIndicator) {
            exerciseIndicator.textContent = `현재: ${exercise.name} 세트 ${this.currentSet + 1}/${exercise.sets}`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        // Update progress text with exercise type indicator
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            const typeIcon = this.getExerciseTypeIcon(exercise.type);
            progressText.textContent = `${typeIcon} ${Math.round(progress)}%`;
        }
    }
    
    /**
     * Get exercise status icon
     */
    getExerciseStatusIcon(type) {
        const icons = {
            'strength': '💪',
            'cardio': '❤️',
            'flexibility': '🧘',
            'balance': '⚖️',
            'endurance': '🏃'
        };
        return icons[type] || '💪';
    }
    
    /**
     * Get exercise type icon
     */
    getExerciseTypeIcon(type) {
        const icons = {
            'strength': '💪',
            'cardio': '❤️',
            'flexibility': '🧘',
            'balance': '⚖️',
            'endurance': '🏃'
        };
        return icons[type] || '💪';
    }
    
    /**
     * Update set progress indicators
     */
    updateSetProgress() {
        const setIndicators = document.getElementById('set-indicators');
        const targetRepsEl = document.getElementById('target-reps'); 
        const restTimeEl = document.getElementById('rest-time');
        const actualRepsInput = document.getElementById('actual-reps');
        
        if (!this.currentProgram || this.currentExercise >= this.currentProgram.exercises.length) return;
        
        const exercise = this.currentProgram.exercises[this.currentExercise];
        
        // Update set indicators
        if (setIndicators) {
            setIndicators.innerHTML = '';
            
            for (let i = 0; i < exercise.sets; i++) {
                const dot = document.createElement('div');
                dot.className = 'set-dot';
                
                if (i < this.currentSet) {
                    dot.classList.add('completed');
                } else if (i === this.currentSet) {
                    dot.classList.add('active');
                }
                
                setIndicators.appendChild(dot);
            }
        }
        
        // Update set details
        if (targetRepsEl) targetRepsEl.textContent = `${exercise.reps}회`;
        if (restTimeEl) restTimeEl.textContent = `${exercise.rest}초`;
        if (actualRepsInput) actualRepsInput.value = exercise.reps;
    }
    
    /**
     * Render program progress
     */
    renderProgramProgress() {
        const exercisesList = document.getElementById('exercises-list');
        const totalTimeEl = document.getElementById('total-program-time');
        const remainingTimeEl = document.getElementById('remaining-program-time');
        const progressPercentEl = document.getElementById('program-progress-percent');
        
        if (!exercisesList || !this.currentProgram) return;
        
        exercisesList.innerHTML = '';
        
        let totalTime = 0;
        let completedTime = 0;
        
        this.currentProgram.exercises.forEach((exercise, index) => {
            const exerciseTime = (exercise.duration + exercise.rest) * exercise.sets;
            totalTime += exerciseTime;
            
            if (index < this.currentExercise) {
                completedTime += exerciseTime;
            } else if (index === this.currentExercise) {
                const currentSetTime = (exercise.duration + exercise.rest) * this.currentSet;
                const currentSetProgress = (exercise.duration - this.remainingTime);
                completedTime += currentSetTime + currentSetProgress;
            }
            
            const exerciseEl = document.createElement('div');
            exerciseEl.className = 'exercise-item';
            
            let statusClass = 'pending';
            let statusIcon = '⏳';
            
            if (index < this.currentExercise) {
                statusClass = 'completed';
                statusIcon = '✅';
            } else if (index === this.currentExercise) {
                statusClass = 'active';
                statusIcon = '🔥';
            }
            
            exerciseEl.classList.add(statusClass);
            
            exerciseEl.innerHTML = `
                <div class="exercise-status-icon">${statusIcon}</div>
                <div class="exercise-info">
                    <div class="exercise-name">${index + 1}. ${exercise.icon} ${exercise.name}</div>
                    <div class="exercise-details">${exercise.sets}세트 × ${exercise.reps}회 × ${exercise.rest}초휴식</div>
                </div>
            `;
            
            exercisesList.appendChild(exerciseEl);
        });
        
        // Update time displays
        if (totalTimeEl) {
            const totalMinutes = Math.ceil(totalTime / 60);
            totalTimeEl.textContent = `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
        }
        
        if (remainingTimeEl) {
            const remainingMinutes = Math.ceil((totalTime - completedTime) / 60);
            remainingTimeEl.textContent = `${Math.floor(remainingMinutes / 60)}:${(remainingMinutes % 60).toString().padStart(2, '0')}`;
        }
        
        if (progressPercentEl) {
            const progressPercent = Math.round((completedTime / totalTime) * 100);
            progressPercentEl.textContent = `${progressPercent}%`;
        }
    }
    
    /**
     * Update exercise tips based on current exercise
     */
    updateExerciseTips() {
        const exerciseTip = document.getElementById('exercise-tip');
        const targetHeartrate = document.getElementById('target-heartrate');
        const exerciseDuration = document.getElementById('exercise-duration');
        const restDuration = document.getElementById('rest-duration');
        
        if (!this.currentProgram || this.currentExercise >= this.currentProgram.exercises.length) return;
        
        const exercise = this.currentProgram.exercises[this.currentExercise];
        
        if (exerciseTip) {
            exerciseTip.textContent = exercise.tips || `${exercise.name}을(를) 올바른 폼으로 수행하세요.`;
        }
        
        if (targetHeartrate) {
            const heartrates = {
                'strength': '110-130 BPM',
                'cardio': '140-170 BPM',
                'flexibility': '90-110 BPM',
                'balance': '100-120 BPM'
            };
            targetHeartrate.textContent = heartrates[exercise.type] || '120-140 BPM';
        }
        
        if (exerciseDuration) exerciseDuration.textContent = `${exercise.duration}초`;
        if (restDuration) restDuration.textContent = `${exercise.rest}초`;
    }
    
    /**
     * Complete entire program
     */
    completeProgram() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
        
        this.isRunning = false;
        this.workoutData.totalTime = Math.round((Date.now() - this.workoutStartTime) / 1000 / 60);
        this.workoutData.caloriesBurned = this.calculateCaloriesBurned();
        
        this.sendNotification('exercise_complete', '운동 완료!', '수고하셨습니다!');
        
        // Show completion screen
        this.showWorkoutComplete();
        
        // Celebrate with visual effects
        this.celebrateCompletion();
    }
    
    /**
     * Calculate estimated calories burned
     */
    calculateCaloriesBurned() {
        // Simple estimation based on exercise type and duration
        const baseCaloriesPerMinute = {
            'strength': 6,
            'cardio': 10,
            'flexibility': 3,
            'balance': 4
        };
        
        let totalCalories = 0;
        
        this.workoutData.exercises.forEach(exerciseData => {
            const exercise = this.currentProgram.exercises.find(e => e.name === exerciseData.name);
            if (exercise) {
                const exerciseMinutes = (exercise.duration * exercise.sets) / 60;
                totalCalories += exerciseMinutes * (baseCaloriesPerMinute[exercise.type] || 6);
            }
        });
        
        return Math.round(totalCalories);
    }
    
    /**
     * Show workout complete screen
     */
    showWorkoutComplete() {
        document.getElementById('workout-timer-main').style.display = 'none';
        document.getElementById('rest-screen').style.display = 'none';
        document.getElementById('workout-complete').style.display = 'block';
        
        // Update completion stats
        const totalWorkoutTimeEl = document.getElementById('total-workout-time');
        const totalSetsEl = document.getElementById('total-sets');
        const caloriesBurnedEl = document.getElementById('calories-burned');
        
        if (totalWorkoutTimeEl) totalWorkoutTimeEl.textContent = `${this.workoutData.totalTime}분`;
        if (totalSetsEl) totalSetsEl.textContent = `${this.workoutData.totalSets}세트`;
        if (caloriesBurnedEl) caloriesBurnedEl.textContent = `${this.workoutData.caloriesBurned}kcal`;
    }
    
    /**
     * Select workout rating
     */
    selectRating(button) {
        // Remove previous selection
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked button
        button.classList.add('selected');
        
        const rating = parseInt(button.dataset.rating);
        this.workoutData.rating = rating;
    }
    
    /**
     * Save workout data
     */
    saveWorkout() {
        const workoutRecord = {
            id: 'workout_' + Date.now(),
            program: this.currentProgram.name,
            date: new Date().toISOString().split('T')[0],
            startTime: new Date(this.workoutStartTime).toTimeString().split(' ')[0],
            endTime: new Date().toTimeString().split(' ')[0],
            totalTime: this.workoutData.totalTime,
            totalSets: this.workoutData.totalSets,
            caloriesBurned: this.workoutData.caloriesBurned,
            rating: this.workoutData.rating || 3,
            exercises: this.workoutData.exercises
        };
        
        // Save to localStorage
        const savedWorkouts = JSON.parse(localStorage.getItem('workout-records') || '[]');
        savedWorkouts.push(workoutRecord);
        localStorage.setItem('workout-records', JSON.stringify(savedWorkouts));
        
        this.showVisualNotification('저장 완료', '운동 기록이 저장되었습니다!', '#16a34a');
    }
    
    /**
     * Start new workout
     */
    startNewWorkout() {
        this.currentProgram = null;
        this.currentExercise = 0;
        this.currentSet = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isResting = false;
        this.workoutData = {
            exercises: [],
            totalTime: 0,
            totalSets: 0,
            caloriesBurned: 0
        };
        
        this.showProgramSelection();
    }
    
    /**
     * Show exercise settings modal
     */
    showExerciseSettings() {
        if (!this.currentProgram || this.currentExercise >= this.currentProgram.exercises.length) return;
        
        const exercise = this.currentProgram.exercises[this.currentExercise];
        const modal = document.getElementById('exercise-settings-modal');
        
        if (modal) {
            // Load current settings
            document.getElementById('setting-sets').value = exercise.sets;
            document.getElementById('setting-reps').value = exercise.reps;
            document.getElementById('setting-rest').value = exercise.rest;
            document.getElementById('setting-duration').value = exercise.duration;
            
            modal.style.display = 'flex';
        }
    }
    
    /**
     * Save exercise settings
     */
    saveExerciseSettings() {
        if (!this.currentProgram || this.currentExercise >= this.currentProgram.exercises.length) return;
        
        const exercise = this.currentProgram.exercises[this.currentExercise];
        
        exercise.sets = parseInt(document.getElementById('setting-sets').value);
        exercise.reps = parseInt(document.getElementById('setting-reps').value);
        exercise.rest = parseInt(document.getElementById('setting-rest').value);
        exercise.duration = parseInt(document.getElementById('setting-duration').value);
        
        // Update UI
        this.updateSetProgress();
        this.renderProgramProgress();
        
        document.getElementById('exercise-settings-modal').style.display = 'none';
        this.showVisualNotification('설정 저장', '운동 설정이 업데이트되었습니다!', '#3b82f6');
    }
    
    /**
     * Show add exercise modal
     */
    showAddExerciseModal() {
        document.getElementById('add-exercise-modal').style.display = 'flex';
    }
    
    /**
     * Add custom exercise
     */
    addCustomExercise() {
        const name = document.getElementById('new-exercise-name').value;
        const type = document.getElementById('new-exercise-type').value;
        const icon = document.getElementById('new-exercise-icon').value;
        const sets = parseInt(document.getElementById('new-exercise-sets').value);
        const reps = parseInt(document.getElementById('new-exercise-reps').value);
        
        if (!name || !sets || !reps) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        const newExercise = {
            name: name,
            icon: icon,
            type: type,
            sets: sets,
            reps: reps,
            duration: 45,
            rest: 60,
            tips: `${name}을(를) 올바른 폼으로 수행하세요.`
        };
        
        if (!this.currentProgram) {
            this.currentProgram = {
                id: 'custom_' + Date.now(),
                name: '커스텀 운동',
                icon: '🏋️',
                exercises: []
            };
        }
        
        this.currentProgram.exercises.push(newExercise);
        this.renderProgramProgress();
        
        // Clear form and close modal
        document.getElementById('add-exercise-form').reset();
        document.getElementById('add-exercise-modal').style.display = 'none';
        
        this.showVisualNotification('운동 추가', `${name}이(가) 추가되었습니다!`, '#16a34a');
    }
    
    /**
     * Send notification based on type
     */
    sendNotification(type, title, message) {
        const alertTypes = {
            set_start: {
                sound: 'whistle',
                vibration: [100, 50, 100],
                color: '#dc2626'
            },
            set_end: {
                sound: 'bell',
                vibration: [200, 100, 200],
                color: '#16a34a'
            },
            halfway: {
                sound: 'tick',
                vibration: [100],
                color: '#f59e0b'
            },
            final_warning: {
                sound: 'warning',
                vibration: [150, 50, 150],
                color: '#e11d48'
            },
            rest_start: {
                sound: 'soft_ding',
                vibration: [150],
                color: '#6366f1'
            },
            rest_end: {
                sound: 'ready',
                vibration: [100, 50, 100, 50, 100],
                color: '#dc2626'
            },
            exercise_complete: {
                sound: 'victory',
                vibration: [300, 100, 300, 100, 300],
                color: '#16a34a'
            }
        };
        
        const alert = alertTypes[type] || alertTypes.set_start;
        
        // Sound notification
        this.playNotificationSound(alert.sound);
        
        // Vibration (mobile)
        if ('vibrate' in navigator) {
            navigator.vibrate(alert.vibration);
        }
        
        // Visual notification
        this.showVisualNotification(title, message, alert.color);
        
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
        
        // Generate different tones for different notification types
        const frequencies = {
            whistle: 1000,
            bell: 800,
            tick: 600,
            warning: 400,
            soft_ding: 523.25,
            ready: 659.25,
            victory: 783.99
        };
        
        const freq = frequencies[soundType] || frequencies.whistle;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = soundType === 'victory' ? 'triangle' : 'sine';
            
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
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
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
        // Load any saved user preferences
        const savedSettings = localStorage.getItem('workout-timer-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                // Apply settings if needed
            } catch (e) {
                console.warn('설정 로드 실패:', e);
            }
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
        if (this.lastHiddenTime && this.isRunning && !this.isPaused && !this.isResting) {
            const elapsed = Math.floor((Date.now() - this.lastHiddenTime) / 1000);
            this.remainingTime = Math.max(0, this.remainingTime - elapsed);
            this.updateMainTimer();
            
            if (this.remainingTime <= 0) {
                this.autoCompleteSet();
            }
        }
    }
    
    /**
     * Celebrate workout completion with visual effects
     */
    celebrateCompletion() {
        // Add celebration animation to completion screen
        const completeContainer = document.querySelector('.complete-container');
        if (completeContainer) {
            completeContainer.style.animation = 'bounce 1s ease-in-out';
        }
        
        // Create confetti effect
        this.createConfettiEffect();
    }
    
    /**
     * Create simple confetti effect
     */
    createConfettiEffect() {
        const colors = ['#dc2626', '#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
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

// Initialize workout timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workoutTimer = new WorkoutTimer();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkoutTimer;
}