/**
 * PWA Utilities - Service Worker and Offline Features
 */

class PWAManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.installPrompt = null;
        this.registration = null;
        
        this.init();
    }

    async init() {
        this.setupOnlineOfflineHandlers();
        this.setupInstallPrompt();
        await this.registerServiceWorker();
        this.setupBackgroundSync();
        this.setupPushNotifications();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', this.registration);
                
                // Handle updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    this.handleServiceWorkerUpdate(newWorker);
                });

                // Listen for messages from SW
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event);
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    handleServiceWorkerUpdate(newWorker) {
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
            }
        });
    }

    handleServiceWorkerMessage(event) {
        const { type, payload } = event.data;
        
        switch (type) {
            case 'CACHE_UPDATED':
                console.log('Cache updated:', payload);
                break;
            case 'OFFLINE_READY':
                this.showOfflineReadyNotification();
                break;
            case 'NEW_CONTENT':
                this.showUpdateNotification();
                break;
        }
    }

    // Online/Offline Handling
    setupOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOffline();
        });

        // Periodic connectivity check
        setInterval(() => this.checkConnectivity(), 30000);
    }

    handleOnline() {
        console.log('App is online');
        this.hideOfflineIndicator();
        this.syncPendingData();
        this.showToast('✅ 인터넷에 연결되었습니다', 'success');
    }

    handleOffline() {
        console.log('App is offline');
        this.showOfflineIndicator();
        this.showToast('📵 오프라인 모드입니다', 'warning');
    }

    async checkConnectivity() {
        try {
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (!this.isOnline && response.ok) {
                // We're back online
                window.dispatchEvent(new Event('online'));
            }
        } catch (error) {
            if (this.isOnline) {
                // We went offline
                window.dispatchEvent(new Event('offline'));
            }
        }
    }

    // Install Prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            
            // Show install prompt after user interaction
            setTimeout(() => this.maybeShowInstallPrompt(), 10000);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.showToast('🎉 앱이 설치되었습니다!', 'success');
            this.installPrompt = null;
        });
    }

    maybeShowInstallPrompt() {
        const dismissed = localStorage.getItem('installPromptDismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        
        if (this.installPrompt && Date.now() - dismissedTime > weekInMs) {
            this.showInstallPrompt();
        }
    }

    showInstallPrompt() {
        const installBanner = document.createElement('div');
        installBanner.className = 'install-prompt';
        installBanner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h3>앱으로 설치하기</h3>
                    <p>홈 화면에 추가하여 더 빠르게 사용하세요</p>
                </div>
                <div class="install-actions">
                    <button class="install-btn primary" onclick="pwaManager.installApp()">설치</button>
                    <button class="install-btn secondary" onclick="pwaManager.dismissInstallPrompt()">나중에</button>
                </div>
            </div>
        `;
        
        installBanner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            max-width: 400px;
            margin: 0 auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideUp 0.3s ease-out;
        `;

        document.body.appendChild(installBanner);
    }

    async installApp() {
        if (this.installPrompt) {
            this.installPrompt.prompt();
            const { outcome } = await this.installPrompt.userChoice;
            console.log('Install prompt result:', outcome);
            
            if (outcome === 'accepted') {
                this.showToast('🎉 설치가 시작되었습니다!', 'success');
            }
            
            this.installPrompt = null;
        }
        this.dismissInstallPrompt();
    }

    dismissInstallPrompt() {
        const prompt = document.querySelector('.install-prompt');
        if (prompt) {
            prompt.style.animation = 'slideDown 0.3s ease-in';
            setTimeout(() => prompt.remove(), 300);
        }
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    }

    // Background Sync
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then((registration) => {
                // Register sync on page unload
                window.addEventListener('beforeunload', () => {
                    this.requestBackgroundSync('timer-data-sync');
                });
            });
        }
    }

    async requestBackgroundSync(tag) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log('Background sync registered:', tag);
        } catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }

    async syncPendingData() {
        try {
            // Get pending sync data from IndexedDB
            const pendingData = await this.getPendingSyncData();
            
            if (pendingData.length > 0) {
                console.log('Syncing pending data:', pendingData.length, 'items');
                
                for (const item of pendingData) {
                    await this.syncDataItem(item);
                }
                
                await this.clearPendingSyncData();
                this.showToast('📊 데이터가 동기화되었습니다', 'success');
            }
        } catch (error) {
            console.error('Data sync failed:', error);
        }
    }

    // Push Notifications
    async setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            const permission = await this.requestNotificationPermission();
            
            if (permission === 'granted') {
                await this.subscribeToPushNotifications();
            }
        }
    }

    async requestNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission;
        }
        return Notification.permission;
    }

    async subscribeToPushNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if subscription exists
            let subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                // Create new subscription
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.getVapidPublicKey()
                });
            }
            
            console.log('Push subscription:', subscription);
            await this.sendSubscriptionToServer(subscription);
            
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    }

    getVapidPublicKey() {
        // In a real app, this would be your VAPID public key
        return 'BExample-Key-Replace-With-Your-VAPID-Public-Key';
    }

    async sendSubscriptionToServer(subscription) {
        // In a real app, send this to your server
        console.log('Subscription to send to server:', subscription);
    }

    // Notification helpers
    showNotification(title, options = {}) {
        const defaultOptions = {
            icon: '/assets/icons/icon-192.png',
            badge: '/assets/icons/icon-72.png',
            requireInteraction: false,
            ...options
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                options: defaultOptions
            });
        } else if (Notification.permission === 'granted') {
            new Notification(title, defaultOptions);
        }
    }

    // UI Helpers
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">새로운 버전이 있습니다!</span>
                <button class="update-btn" onclick="pwaManager.updateApp()">업데이트</button>
                <button class="update-dismiss" onclick="pwaManager.dismissUpdate()">&times;</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: inherit;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => this.dismissUpdate(), 10000);
    }

    showOfflineReadyNotification() {
        this.showToast('📱 오프라인에서도 사용 가능합니다', 'info', 5000);
    }

    async updateApp() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    dismissUpdate() {
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }

    showOfflineIndicator() {
        let indicator = document.querySelector('.offline-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <span class="offline-icon">📵</span>
                <span>오프라인</span>
            `;
            
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff9800;
                color: white;
                text-align: center;
                padding: 0.5rem;
                font-size: 0.9rem;
                font-weight: 500;
                z-index: 10000;
                animation: slideDown 0.3s ease-out;
            `;
            
            document.body.appendChild(indicator);
        }
    }

    hideOfflineIndicator() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => indicator.remove(), 300);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 10000;
            animation: toastSlideUp 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideDown 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // IndexedDB helpers
    async getPendingSyncData() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TimerToolsDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['syncQueue'], 'readonly');
                const store = transaction.objectStore('syncQueue');
                const getAllRequest = store.getAll();
                
                getAllRequest.onsuccess = () => resolve(getAllRequest.result);
                getAllRequest.onerror = () => reject(getAllRequest.error);
            };
        });
    }

    async syncDataItem(item) {
        // Implement actual sync logic here
        console.log('Syncing item:', item);
        return Promise.resolve();
    }

    async clearPendingSyncData() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TimerToolsDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['syncQueue'], 'readwrite');
                const store = transaction.objectStore('syncQueue');
                const clearRequest = store.clear();
                
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            };
        });
    }
}

// CSS Animations
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes toastSlideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes toastSlideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 100%); opacity: 0; }
    }
    
    .install-content {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 1rem;
    }
    
    .install-icon {
        font-size: 2rem;
    }
    
    .install-text h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
    }
    
    .install-text p {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.9;
    }
    
    .install-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .install-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 60px;
    }
    
    .install-btn.primary {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
    }
    
    .install-btn.secondary {
        background: transparent;
        color: rgba(255,255,255,0.8);
        border: 1px solid rgba(255,255,255,0.2);
    }
    
    .install-btn:hover {
        transform: translateY(-1px);
    }
    
    .update-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .update-btn, .update-dismiss {
        padding: 0.4rem 0.8rem;
        border: none;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .update-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        font-weight: 500;
    }
    
    .update-dismiss {
        background: transparent;
        color: rgba(255,255,255,0.7);
        font-size: 1.2rem;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .update-btn:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .update-dismiss:hover {
        background: rgba(255,255,255,0.1);
    }
    
    @media (max-width: 600px) {
        .install-content {
            flex-direction: column;
            text-align: center;
        }
        
        .install-actions {
            flex-direction: row;
            justify-content: center;
        }
        
        .update-notification {
            left: 10px !important;
            right: 10px !important;
        }
    }
`;
document.head.appendChild(styles);

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Export for global access
window.pwaManager = pwaManager;