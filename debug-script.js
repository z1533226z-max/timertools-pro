// 브라우저 개발자도구 Console에서 실행할 디버깅 스크립트
(function() {
    console.log('=== TimerTools 디버깅 리포트 ===');
    
    // 1. 페이지 기본 정보
    console.log('\n1. 페이지 정보:');
    console.log('URL:', window.location.href);
    console.log('Title:', document.title);
    console.log('User Agent:', navigator.userAgent);
    
    // 2. JavaScript 에러 수집
    console.log('\n2. JavaScript 에러:');
    window.addEventListener('error', function(e) {
        console.error('스크립트 에러:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
    });
    
    // 3. 리소스 로딩 상태 확인
    console.log('\n3. 리소스 로딩 상태:');
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
        if (resource.transferSize === 0 && resource.decodedBodySize === 0) {
            console.warn('로딩 실패 가능성:', resource.name);
        }
    });
    
    // 4. DOM 요소 검사
    console.log('\n4. 주요 DOM 요소 상태:');
    const importantSelectors = [
        'script[src]',
        'link[rel="stylesheet"]',
        'img',
        '[id]',
        '[class*="timer"]',
        '[class*="button"]'
    ];
    
    importantSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`${selector}: ${elements.length}개 요소 발견`);
        
        if (selector === 'script[src]' || selector === 'link[rel="stylesheet"]') {
            elements.forEach(el => {
                const src = el.src || el.href;
                if (src) {
                    fetch(src).catch(err => {
                        console.error(`리소스 로딩 실패: ${src}`, err);
                    });
                }
            });
        }
    });
    
    // 5. Console 에러/경고 개수 체크
    const originalConsole = {
        error: console.error,
        warn: console.warn
    };
    
    let errorCount = 0;
    let warnCount = 0;
    
    console.error = function(...args) {
        errorCount++;
        originalConsole.error.apply(console, args);
    };
    
    console.warn = function(...args) {
        warnCount++;
        originalConsole.warn.apply(console, args);
    };
    
    // 6. 타이머 기능별 테스트 (TimerTools 특화)
    setTimeout(() => {
        console.log('\n5. TimerTools 기능 테스트:');
        
        // 타이머 관련 전역 변수 확인
        const timerVars = ['timer', 'interval', 'timeLeft', 'isRunning', 'startTime'];
        timerVars.forEach(varName => {
            if (window[varName] !== undefined) {
                console.log(`전역변수 ${varName}:`, window[varName]);
            }
        });
        
        // 타이머 관련 함수 확인
        const timerFunctions = ['startTimer', 'stopTimer', 'resetTimer', 'updateDisplay'];
        timerFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                console.log(`함수 ${funcName}: 정의됨`);
            } else {
                console.warn(`함수 ${funcName}: 정의되지 않음`);
            }
        });
        
        console.log(`\n총 에러: ${errorCount}개, 경고: ${warnCount}개`);
        console.log('=== 디버깅 리포트 완료 ===');
    }, 1000);
})();
