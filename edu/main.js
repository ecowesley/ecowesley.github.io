let currentLessons = [];

async function init() {
    try {
        const navResp = await fetch('nav.html');
        document.getElementById('nav-placeholder').innerHTML = await navResp.text();
    } catch (err) { console.error("初始化失敗:", err); }
}

async function showSection(sectionId) {
    document.querySelectorAll('.top-nav a').forEach(l => l.classList.remove('active-nav'));
    document.getElementById('nav-' + sectionId)?.classList.add('active-nav');

    try {
        const dataResp = await fetch(`data_${sectionId}.json`);
        currentLessons = await dataResp.json();

        const sidePlaceholder = document.getElementById('sidebar-placeholder');
        
        // 判斷是否隱藏側邊欄
        if (sectionId === 'pgy') {
            sidePlaceholder.classList.remove('active-sidebar');
        } else {
            renderSidebar(sectionId);
        }
        
        loadLesson('intro');
    } catch (err) {
        document.getElementById('dynamic-area').innerHTML = `<h1>檔案讀取中</h1><p>尚未找到 data_${sectionId}.json。</p>`;
    }
}

function renderSidebar(sectionId) {
    const sidePlaceholder = document.getElementById('sidebar-placeholder');
    sidePlaceholder.classList.add('active-sidebar');

    // 這裡對齊 nav.html 的 ID
    const titles = { 
        'training': '職前訓練課程', 
        'nursing_education': '在職教育課程', 
        'progression': '能力進階課程' 
    };
    
    let sidebarHtml = `<h3>${titles[sectionId] || '課程選單'}</h3>`;
    currentLessons.forEach(lesson => {
        if (lesson.id === '01') sidebarHtml += `<hr style="margin: 10px 0; border:0; border-top:1px solid #ddd;">`;
        sidebarHtml += `<a onclick="loadLesson('${lesson.id}')" id="side-${lesson.id}">${lesson.title}</a>`;
    });
    sidePlaceholder.innerHTML = sidebarHtml;
}

function loadLesson(lessonId) {
    const index = currentLessons.findIndex(l => l.id === lessonId);
    if (index === -1) return;
    const lesson = currentLessons[index];

    document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active-page'));
    document.getElementById('side-' + lessonId)?.classList.add('active-page');

    let contentHtml = `<h1>${lesson.title}</h1><p>${lesson.desc}</p>`;

    // 卡片格線模式
    if (lesson.type === 'grid' && lesson.cards) {
        contentHtml += `<div class="resource-grid">`;
        lesson.cards.forEach(card => {
            contentHtml += `
                <a href="${card.link}" target="_blank" class="card">
                    <h4>${card.name}</h4>
                    <p>${card.detail}</p>
                </a>`;
        });
        contentHtml += `</div>`;
    } 
    // 首頁模式
    else if (lesson.type === 'home') {
        contentHtml += `<div class="video-box"><h3>開始學習</h3><p>請點擊左側選單或下方「下一課」按鈕依序觀看教材。</p></div>`;
    } 
    // 影片/講義模式
    else {
        contentHtml += `
            <div class="video-box">
                <h3>課程影片 / 講義</h3>
                <a href="${lesson.link}" target="_blank" class="play-btn">▶ 點擊觀看課程內容</a>
            </div>`;
    }

    // 判斷是否顯示導航按鈕 (只有顯示側邊欄的類別才顯示)
    const sideActive = document.getElementById('sidebar-placeholder').classList.contains('active-sidebar');
    if (sideActive) {
        const prev = currentLessons[index - 1];
        const next = currentLessons[index + 1];
        const navButtons = `
            <div class="nav-btn-container">
                ${prev ? `<button class="w3-btn" onclick="loadLesson('${prev.id}')">❮ 上一課</button>` : '<div></div>'}
                ${next ? `<button class="w3-btn" onclick="loadLesson('${next.id}')">下一課 ❯</button>` : '<div></div>'}
            </div>`;
        contentHtml = navButtons + contentHtml + navButtons;
    }

    document.getElementById('dynamic-area').innerHTML = contentHtml;
    document.getElementById('main-content').scrollTop = 0;
}

function goHome() { location.reload(); }
init();