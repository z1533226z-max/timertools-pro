// ===== MAIN.JS - TimerTools Pro ===== //

class TimerToolsApp {
  constructor() {
    this.init();
  }
  
  init() {
    // Critical setup first (affects visual rendering)
    this.setupThemeSystem();
    this.setupNavigation();
    
    // Initialize usage statistics
    this.initializeStats();
    
    // Initialize i18n if available
    if (window.i18n) {
      console.log('i18n system ready');
    } else {
      document.addEventListener('i18n-ready', () => {
        console.log('i18n system initialized');
      });
    }
    
    // Defer non-critical setup to avoid blocking main thread
    this.deferNonCriticalSetup();
    
    console.log('TimerTools Pro initialized');
  }
  
  deferNonCriticalSetup() {
    // Use scheduler API if available, otherwise use setTimeout
    const scheduler = window.scheduler || {
      postTask: (callback, options) => {
        setTimeout(callback, options?.delay || 0);
        return { abort: () => {} };
      }
    };
    
    // Schedule non-critical tasks
    scheduler.postTask(() => this.setupAccessibility(), { priority: 'user-blocking' });
    scheduler.postTask(() => this.setupAnimations(), { priority: 'background' });
    scheduler.postTask(() => this.setupServiceWorker(), { priority: 'background' });
  }
  
  // ===== THEME SYSTEM ===== //
  setupThemeSystem() {
    // Apply saved theme immediately to prevent flash
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('🎨 Theme applied:', savedTheme);
    
    // Wait for DOM to be ready for theme toggle functionality
    const initThemeToggle = () => {
      const themeToggle = document.querySelector('.theme-toggle');
      const themeIcon = document.querySelector('.theme-icon');
      
      console.log('🎨 Theme elements found:', { toggle: !!themeToggle, icon: !!themeIcon });
      
      // Update icon to match current theme
      this.updateThemeIcon(savedTheme);
      
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          
          console.log('🎨 Theme toggling:', currentTheme, '→', newTheme);
          
          // Apply theme with force refresh
          document.documentElement.setAttribute('data-theme', newTheme);
          document.documentElement.style.setProperty('--force-refresh', Math.random());
          localStorage.setItem('theme', newTheme);
          this.updateThemeIcon(newTheme);
          
          // Force style recalculation for immediate visual feedback
          document.body.style.display = 'none';
          document.body.offsetHeight; // Trigger reflow
          document.body.style.display = '';
          
          // Verify theme application
          setTimeout(() => {
            const appliedTheme = document.documentElement.getAttribute('data-theme');
            const computedStyle = getComputedStyle(document.documentElement);
            const bgColor = computedStyle.getPropertyValue('--bg-primary');
            console.log('🎨 Theme verification:', { theme: appliedTheme, bgColor });
          }, 50);
          
          // Announce theme change to screen readers
          this.announceToScreenReader(`${newTheme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다`);
        });
      } else {
        console.warn('⚠️ Theme toggle button not found - retrying in 100ms');
        setTimeout(initThemeToggle, 100);
      }
    };
    
    // Initialize toggle functionality
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
      initThemeToggle();
    }
    
    // System theme preference detection
    this.setupSystemThemeDetection();
  }
  
  setupSystemThemeDetection() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Only apply system theme if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
      this.updateThemeIcon(systemTheme);
      console.log('🎨 System theme detected:', systemTheme);
    }
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        this.updateThemeIcon(systemTheme);
        console.log('🎨 System theme changed:', systemTheme);
      }
    });
  }
  
  updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      const newIcon = theme === 'dark' ? '☀️' : '🌙';
      themeIcon.textContent = newIcon;
      console.log('🎨 Icon updated:', theme, '→', newIcon);
    } else {
      console.warn('⚠️ Theme icon element not found');
    }
  }
  
  // ===== NAVIGATION ===== //
  setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const dropdownBtns = document.querySelectorAll('.nav-dropdown-btn');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        
        // Lock body scroll when menu is open
        document.body.style.overflow = isExpanded ? '' : 'hidden';
        
        // Update hamburger animation
        this.updateHamburger(!isExpanded);
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
          this.updateHamburger(false);
        }
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
          this.updateHamburger(false);
          navToggle.focus();
        }
      });
    }
    
    // Dropdown menus
    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = btn.closest('.nav-dropdown');
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        
        // Close all other dropdowns
        dropdownBtns.forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherBtn.closest('.nav-dropdown').setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle current dropdown
        btn.setAttribute('aria-expanded', !isExpanded);
        dropdown.setAttribute('aria-expanded', !isExpanded);
      });
      
      // Close dropdown on escape
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          btn.setAttribute('aria-expanded', 'false');
          btn.closest('.nav-dropdown').setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      dropdownBtns.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        btn.closest('.nav-dropdown').setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  updateHamburger(isOpen) {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      if (isOpen) {
        hamburger.style.background = 'transparent';
        hamburger.style.transform = 'rotate(45deg)';
      } else {
        hamburger.style.background = '';
        hamburger.style.transform = '';
      }
    }
  }
  
  // ===== ACCESSIBILITY ===== //
  setupAccessibility() {
    // Focus management
    this.setupFocusManagement();
    
    // Keyboard navigation
    this.setupKeyboardNavigation();
    
    // Screen reader announcements
    this.createAriaLiveRegion();
    
    // Reduced motion handling
    this.handleReducedMotion();
  }
  
  setupFocusManagement() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    
    // Focus visible for keyboard users only
    let hadKeyboardEvent = true;
    const keyboardThrottleTimeout = 100;
    
    const handlePointerDown = () => {
      hadKeyboardEvent = false;
    };
    
    const handleKeyDown = (e) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      hadKeyboardEvent = true;
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    
    document.addEventListener('focus', (e) => {
      if (hadKeyboardEvent) {
        e.target.setAttribute('data-focus-visible', '');
      }
    }, true);
    
    document.addEventListener('blur', (e) => {
      e.target.removeAttribute('data-focus-visible');
    }, true);
  }
  
  setupKeyboardNavigation() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + M = Main navigation
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const firstNavLink = document.querySelector('.nav-menu a');
        if (firstNavLink) firstNavLink.focus();
      }
      
      // Alt + S = Search (future implementation)
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        // Focus search when implemented
      }
      
      // Alt + T = Timer tools
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        const timerLink = document.querySelector('a[href="timer/basic.html"]');
        if (timerLink) timerLink.focus();
      }
    });
    
    // Arrow key navigation for tool cards - Use event delegation for better performance
    this.setupToolCardNavigation();
  }
  
  setupToolCardNavigation() {
    // Use event delegation for better performance
    const toolsContainer = document.querySelector('.tools-cards');
    if (!toolsContainer) return;
    
    // Cache tool cards once
    let toolCards = null;
    
    const getToolCards = () => {
      if (!toolCards) {
        toolCards = Array.from(toolsContainer.querySelectorAll('.tool-card .tool-link'));
      }
      return toolCards;
    };
    
    toolsContainer.addEventListener('keydown', (e) => {
      const target = e.target;
      if (!target.classList.contains('tool-link')) return;
      
      const cards = getToolCards();
      const currentIndex = cards.indexOf(target);
      if (currentIndex === -1) return;
      
      let targetIndex;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = (currentIndex + 1) % cards.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          targetIndex = (currentIndex - 1 + cards.length) % cards.length;
          break;
        case 'Home':
          e.preventDefault();
          targetIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          targetIndex = cards.length - 1;
          break;
      }
      
      if (targetIndex !== undefined && cards[targetIndex]) {
        cards[targetIndex].focus();
      }
    });
  }
  
  createAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
    
    this.liveRegion = liveRegion;
  }
  
  announceToScreenReader(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }
  }
  
  handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const setReducedMotion = (reduce) => {
      document.documentElement.style.setProperty(
        '--transition-fast',
        reduce ? '0ms' : '150ms ease-out'
      );
      document.documentElement.style.setProperty(
        '--transition-normal',
        reduce ? '0ms' : '250ms ease-in-out'
      );
      document.documentElement.style.setProperty(
        '--transition-slow',
        reduce ? '0ms' : '300ms ease-out'
      );
    };
    
    setReducedMotion(prefersReducedMotion.matches);
    prefersReducedMotion.addEventListener('change', (e) => {
      setReducedMotion(e.matches);
    });
  }
  
  // ===== ANIMATIONS ===== //
  setupAnimations() {
    // Skip animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    // Use requestIdleCallback for non-critical animations
    this.scheduleAnimationSetup();
  }
  
  scheduleAnimationSetup() {
    const setupAnimationObserver = () => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        // Batch DOM updates using requestAnimationFrame
        requestAnimationFrame(() => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = 'running';
              observer.unobserve(entry.target);
            }
          });
        });
      }, observerOptions);
      
      // Cache DOM queries and batch operations
      const animatedElements = document.querySelectorAll('.tool-card, .testimonial, .guide-step');
      
      // Batch DOM style updates
      requestAnimationFrame(() => {
        animatedElements.forEach(el => {
          el.style.animationPlayState = 'paused';
          observer.observe(el);
        });
      });
    };
    
    // Use requestIdleCallback if available, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(setupAnimationObserver, { timeout: 2000 });
    } else {
      setTimeout(setupAnimationObserver, 16); // ~1 frame
    }
  }
  
  // ===== SERVICE WORKER (PWA) ===== //
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registered: ', registration);
          })
          .catch(registrationError => {
            console.log('ServiceWorker registration failed: ', registrationError);
          });
      });
    }
  }
  
  // ===== UTILITY FUNCTIONS ===== //
  
  
  // Error handling
  handleError(error, context) {
    console.error(`${context}에서 오류:`, error);
    this.announceToScreenReader('오류가 발생했습니다. 페이지를 새로고침해주세요.');
  }
  
  // Performance monitoring
  measurePerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const loadTime = perfData.loadEventEnd - perfData.fetchStart;
          console.log(`Page load time: ${loadTime}ms`);
          
          // Send to analytics (future implementation)
          this.trackEvent('performance', 'page_load_time', Math.round(loadTime));
        }, 0);
      });
    }
  }
  
  // Analytics tracking and usage stats
  trackEvent(category, action, value) {
    // Track to console for debugging
    console.log(`Track: ${category} - ${action} - ${value}`);
    
    // Update usage statistics
    this.updateUsageStats(category, action, value);
  }
  
  updateUsageStats(category, action, value) {
    // Get current stats from localStorage
    const stats = this.getUsageStats();
    
    // Update stats based on action
    switch (action) {
      case 'timer_start':
      case 'start':
        stats.dailyActiveSessions++;
        stats.totalActiveSessions++;
        break;
      case 'timer_complete':
      case 'complete':
        stats.completedSessions++;
        stats.totalCompletedSessions++;
        break;
      case 'page_view':
        stats.dailyActiveUsers++;
        break;
    }
    
    // Save updated stats
    this.saveUsageStats(stats);
    
    // Update display if we're on the home page
    this.updateStatsDisplay(stats);
  }
  
  getUsageStats() {
    const today = new Date().toDateString();
    const savedStats = localStorage.getItem('timertools_stats');
    let stats = {
      date: today,
      dailyActiveUsers: 0,
      dailyActiveSessions: 0,
      completedSessions: 0,
      totalActiveSessions: parseInt(localStorage.getItem('total_sessions') || '12547'),
      totalCompletedSessions: parseInt(localStorage.getItem('total_completed') || '8923')
    };
    
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      // Reset daily stats if it's a new day
      if (parsed.date === today) {
        stats = { ...stats, ...parsed };
      }
    }
    
    return stats;
  }
  
  saveUsageStats(stats) {
    localStorage.setItem('timertools_stats', JSON.stringify(stats));
    localStorage.setItem('total_sessions', stats.totalActiveSessions.toString());
    localStorage.setItem('total_completed', stats.totalCompletedSessions.toString());
  }
  
  updateStatsDisplay(stats) {
    // Update stats on homepage if elements exist
    const activeUsersEl = document.querySelector('[data-stat="active-users"]');
    const completedSessionsEl = document.querySelector('[data-stat="completed-sessions"]');
    
    if (activeUsersEl) {
      // Add some realistic variation to the display
      const displayUsers = stats.totalActiveSessions + Math.floor(Math.random() * 100);
      activeUsersEl.textContent = displayUsers.toLocaleString();
    }
    
    if (completedSessionsEl) {
      const displayCompleted = stats.totalCompletedSessions + Math.floor(Math.random() * 50);
      completedSessionsEl.textContent = displayCompleted.toLocaleString();
    }
  }
  
  initializeStats() {
    // Track page view
    this.trackEvent('site', 'page_view', window.location.pathname);
    
    // Initialize real-time stats updates
    const stats = this.getUsageStats();
    this.updateStatsDisplay(stats);
    
    // Update stats every 30 seconds for dynamic feel
    setInterval(() => {
      const currentStats = this.getUsageStats();
      // Simulate some activity
      if (Math.random() > 0.7) {
        currentStats.totalActiveSessions += Math.floor(Math.random() * 3) + 1;
      }
      if (Math.random() > 0.8) {
        currentStats.totalCompletedSessions += Math.floor(Math.random() * 2) + 1;
      }
      this.saveUsageStats(currentStats);
      this.updateStatsDisplay(currentStats);
    }, 30000);
  }
}

// ===== GLOBAL FUNCTIONS ===== //

// ===== INITIALIZATION ===== //

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.timerApp = new TimerToolsApp();
  });
} else {
  window.timerApp = new TimerToolsApp();
}

// ===== ERROR HANDLING ===== //

// Global error handler
window.addEventListener('error', (e) => {
  console.error('전역 오류:', e.error);
  if (window.timerApp) {
    window.timerApp.handleError(e.error, '전역');
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
  console.error('처리되지 않은 프로미스 거부:', e.reason);
  if (window.timerApp) {
    window.timerApp.handleError(e.reason, '프로미스');
  }
});

// ===== PERFORMANCE MONITORING ===== //

// Core Web Vitals
if ('web-vital' in window) {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}

// Enhanced performance monitoring
if ('PerformanceObserver' in window) {
  // Long task monitoring with detailed logging
  const longTaskObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) {
        console.warn('🚨 Long task detected:', {
          duration: `${entry.duration.toFixed(2)}ms`,
          startTime: `${entry.startTime.toFixed(2)}ms`,
          name: entry.name,
          attribution: entry.attribution || 'unknown'
        });
        
        // Track severe performance issues
        if (entry.duration > 200) {
          console.error('🔥 SEVERE: Task blocked main thread for', `${entry.duration.toFixed(2)}ms`);
        }
      }
    });
  });
  
  longTaskObserver.observe({ entryTypes: ['longtask'] });
  
  // Monitor layout shifts for visual stability
  const layoutShiftObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.value > 0.1) {
        console.warn('Layout shift detected:', entry.value);
      }
    });
  });
  
  try {
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Layout shift API not supported in all browsers
  }
}