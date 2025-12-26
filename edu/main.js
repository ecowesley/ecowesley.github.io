// 全域變數，用來儲存當前類別的所有課程
let currentLessons = [];

// 1. 初始化：載入上方導覽列
async function init() {
    try {
        const navResp = await fetch('nav.html');
        document.getElementById('nav-placeholder').innerHTML = await navResp.text();
    } catch (err) {
        console.error("初始化失敗:", err);
    }
}

// 2. 切換大類別 (點選 職前訓練/在職教育)
async function showSection(sectionId) {
    // UI 高亮切換
    document.querySelectorAll('.top-nav a').forEach(l => l.classList.remove('active-nav'));
    document.getElementById('nav-' + sectionId)?.classList.add('active-nav');

    // 關鍵：抓取對應的 JSON 資料檔案
    try {
        const dataResp = await fetch(`data_${sectionId}.json`);
        currentLessons = await dataResp.json();

        // 自動生成側邊欄 HTML
        renderSidebar(sectionId);
        
        // 預設載入該類別的第一筆 (通常是 intro)
        loadLesson('intro');
    } catch (err) {
        document.getElementById('dynamic-area').innerHTML = `<h1>檔案讀取中</h1><p>尚未找到 data_${sectionId}.json，請確認檔案已上傳。</p>`;
    }
}

// 3. 自動生成側邊欄 (不需要再手動寫 sidebar.html 了！)
function renderSidebar(sectionId) {
    const sidePlaceholder = document.getElementById('sidebar-placeholder');
    sidePlaceholder.classList.add('active-sidebar');

    const titles = { 'training': '職前訓練課程', 'clinical': '在職教育課程', 'record': '能力進階' };
    
    let sidebarHtml = `<h3>${titles[sectionId] || '課程選單'}</h3>`;
    currentLessons.forEach(lesson => {
        // 如果是課程首頁後的第一個，加一條分隔線
        if (lesson.id === '01') sidebarHtml += `<hr style="margin: 10px 0; border:0; border-top:1px solid #ddd;">`;
        
        sidebarHtml += `<a onclick="loadLesson('${lesson.id}')" id="side-${lesson.id}">${lesson.title}</a>`;
    });
    
    sidePlaceholder.innerHTML = sidebarHtml;
}

// 4. 載入具體課程內容
function loadLesson(lessonId) {
    const index = currentLessons.findIndex(l => l.id === lessonId);
    if (index === -1) return;
    
    const lesson = currentLessons[index];

    // 更新左側高亮
    document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active-page'));
    document.getElementById('side-' + lessonId)?.classList.add('active-page');

    // 生成上下課導航按鈕 (W3Schools 綠色按鈕)
    const prev = currentLessons[index - 1];
    const next = currentLessons[index + 1];
    const navButtons = `
        <div class="nav-btn-container">
            ${prev ? `<button class="w3-btn" onclick="loadLesson('${prev.id}')">❮ 上一課</button>` : '<div></div>'}
            ${next ? `<button class="w3-btn" onclick="loadLesson('${next.id}')">下一課 ❯</button>` : '<div></div>'}
        </div>
    `;

    // 組合內容區塊
    let contentHtml = navButtons + `<h1>${lesson.title}</h1>`;
    
    if (lesson.type === 'home') {
        contentHtml += `<p>${lesson.desc}</p><div class="video-box"><h3>開始學習</h3><p>請點擊左側選單或下方「下一課」按鈕依序觀看教材。</p></div>`;
    } else {
        contentHtml += `
            <p>${lesson.desc}</p>
            <div class="video-box">
                <h3>課程影片 / 講義</h3>
                <p>點擊下方按鈕將於新分頁開啟（支援全螢幕觀看）。</p>
                <a href="${lesson.link}" target="_blank" class="play-btn">▶ 點擊觀看課程內容</a>
            </div>
        `;
    }
    contentHtml += navButtons;

    document.getElementById('dynamic-area').innerHTML = contentHtml;
    document.getElementById('main-content').scrollTop = 0;
}

function goHome() { location.reload(); }
init();