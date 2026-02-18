// ===== MAIN.JS - TimerTools Pro ===== //

class TimerToolsApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupThemeSystem();
    this.setupNavigation();

    if (window.i18n) {
      // i18n system ready
    } else {
      document.addEventListener('i18n-ready', () => {
        // i18n system initialized
      });
    }

    this.deferNonCriticalSetup();
  }

  deferNonCriticalSetup() {
    const scheduler = window.scheduler || {
      postTask: (callback, options) => {
        setTimeout(callback, options?.delay || 0);
        return { abort: () => {} };
      }
    };

    scheduler.postTask(() => this.setupAccessibility(), { priority: 'user-blocking' });
    scheduler.postTask(() => this.setupAnimations(), { priority: 'background' });
  }

  // ===== THEME SYSTEM ===== //
  setupThemeSystem() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const initThemeToggle = () => {
      const themeToggle = document.querySelector('.theme-toggle');

      this.updateThemeIcon(savedTheme);

      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          this.updateThemeIcon(newTheme);

          this.announceToScreenReader(`${newTheme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다`);
        });
      } else {
        setTimeout(initThemeToggle, 100);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
      initThemeToggle();
    }

    this.setupSystemThemeDetection();
  }

  setupSystemThemeDetection() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (!localStorage.getItem('theme')) {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
      this.updateThemeIcon(systemTheme);
    }

    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        this.updateThemeIcon(systemTheme);
      }
    });
  }

  updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ===== NAVIGATION ===== //
  setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const dropdownBtns = document.querySelectorAll('.nav-dropdown-btn');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
        this.updateHamburger(!isExpanded);
      });

      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
          this.updateHamburger(false);
        }
      });

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

    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = btn.closest('.nav-dropdown');
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        dropdownBtns.forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherBtn.closest('.nav-dropdown').setAttribute('aria-expanded', 'false');
          }
        });

        btn.setAttribute('aria-expanded', !isExpanded);
        dropdown.setAttribute('aria-expanded', !isExpanded);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          btn.setAttribute('aria-expanded', 'false');
          btn.closest('.nav-dropdown').setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });

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
    this.setupFocusManagement();
    this.setupKeyboardNavigation();
    this.createAriaLiveRegion();
    this.handleReducedMotion();
  }

  setupFocusManagement() {
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

    let hadKeyboardEvent = true;

    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      hadKeyboardEvent = true;
    }, true);

    document.addEventListener('pointerdown', () => {
      hadKeyboardEvent = false;
    }, true);

    document.addEventListener('focus', (e) => {
      if (hadKeyboardEvent) e.target.setAttribute('data-focus-visible', '');
    }, true);

    document.addEventListener('blur', (e) => {
      e.target.removeAttribute('data-focus-visible');
    }, true);
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const firstNavLink = document.querySelector('.nav-menu a');
        if (firstNavLink) firstNavLink.focus();
      }
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        const timerLink = document.querySelector('a[href="timer/basic.html"], a[href="../timer/basic.html"]');
        if (timerLink) timerLink.focus();
      }
    });

    this.setupToolCardNavigation();
  }

  setupToolCardNavigation() {
    const toolsContainer = document.querySelector('.tools-cards');
    if (!toolsContainer) return;

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
    liveRegion.className = 'sr-only';
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
      document.documentElement.style.setProperty('--duration-fast', reduce ? '0ms' : '150ms');
      document.documentElement.style.setProperty('--duration-normal', reduce ? '0ms' : '300ms');
      document.documentElement.style.setProperty('--duration-slow', reduce ? '0ms' : '500ms');
    };

    setReducedMotion(prefersReducedMotion.matches);
    prefersReducedMotion.addEventListener('change', (e) => setReducedMotion(e.matches));
  }

  // ===== ANIMATIONS ===== //
  setupAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const setupAnimationObserver = () => {
      const observer = new IntersectionObserver((entries) => {
        requestAnimationFrame(() => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = 'running';
              observer.unobserve(entry.target);
            }
          });
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      const animatedElements = document.querySelectorAll('.tool-card, .testimonial, .guide-step');

      requestAnimationFrame(() => {
        animatedElements.forEach(el => {
          el.style.animationPlayState = 'paused';
          observer.observe(el);
        });
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(setupAnimationObserver, { timeout: 2000 });
    } else {
      setTimeout(setupAnimationObserver, 16);
    }
  }

  // ===== UTILITY ===== //
  handleError(error, context) {
    console.error(`${context}에서 오류:`, error);
    this.announceToScreenReader('오류가 발생했습니다. 페이지를 새로고침해주세요.');
  }
}

// ===== INITIALIZATION ===== //
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.timerApp = new TimerToolsApp();
  });
} else {
  window.timerApp = new TimerToolsApp();
}

// ===== ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
  if (window.timerApp) window.timerApp.handleError(e.error, '전역');
});

window.addEventListener('unhandledrejection', (e) => {
  if (window.timerApp) window.timerApp.handleError(e.reason, '프로미스');
});