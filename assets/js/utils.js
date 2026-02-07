// ===== UTILITY FUNCTIONS ===== //

/**
 * Production mode detection
 * Returns true if running in production (not localhost)
 */
function isProduction() {
  const hostname = window.location.hostname;
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('192.168');
}

/**
 * Safe console wrapper
 * Disables console methods in production
 */
const safeConsole = {
  log: (...args) => {
    if (!isProduction()) {
      console.log(...args);
    }
  },
  error: (...args) => {
    // Always show errors, even in production
    console.error(...args);
  },
  warn: (...args) => {
    if (!isProduction()) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (!isProduction()) {
      console.info(...args);
    }
  },
  debug: (...args) => {
    if (!isProduction()) {
      console.debug(...args);
    }
  }
};

/**
 * Local Storage helper with fallback
 */
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      safeConsole.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      safeConsole.error('Storage set error:', error);
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      safeConsole.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      safeConsole.error('Storage clear error:', error);
      return false;
    }
  }
};

/**
 * Format time display
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Play notification sound
 */
function playNotificationSound(frequency = 440, duration = 200, volume = 0.5) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    safeConsole.error('Sound playback error:', error);
  }
}

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Show browser notification
 */
function showNotification(title, body, icon = '/assets/icons/icon-192x192.png') {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon,
      badge: '/assets/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    setTimeout(() => notification.close(), 5000);
  }
}

/**
 * Debounce function
 */
function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit = 250) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isProduction,
    safeConsole,
    storage,
    formatTime,
    playNotificationSound,
    requestNotificationPermission,
    showNotification,
    debounce,
    throttle
  };
}