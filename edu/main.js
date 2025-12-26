async function loadCommonElements() {
    // 1. 載入導覽列
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        try {
            const response = await fetch('nav.html');
            const navHtml = await response.text();
            navPlaceholder.innerHTML = navHtml;
            
            // 2. 載入完畢後，根據目前網址自動標示「綠色狀態」
            highlightActiveNav();
        } catch (err) {
            console.error("無法載入導覽列:", err);
        }
    }
}

function highlightActiveNav() {
    const path = window.location.pathname;
    
    // 判斷網址關鍵字來對應 ID
    if (path.includes('training')) {
        document.getElementById('nav-training')?.classList.add('active-nav');
    } else if (path.includes('clinical')) {
        document.getElementById('nav-clinical')?.classList.add('active-nav');
    } else if (path.includes('advance')) {
        document.getElementById('nav-record')?.classList.add('active-nav');
    }
}

// 執行載入程序
loadCommonElements();