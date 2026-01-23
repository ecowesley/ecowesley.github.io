// ==========================================
// 全域變數設定
// ==========================================
let currentLessons = [];    // 儲存目前從 JSON 載入的課程清單
let currentSectionId = ''; // 紀錄目前所在的大類別 ID (如 training, progression 等)

// 1. 初始化：導覽列改從 shared 目錄抓取
async function init() {
    try {
        const navResp = await fetch('shared/nav.html'); // 路徑更新
        document.getElementById('nav-placeholder').innerHTML = await navResp.text();
    } catch (err) { console.error("初始化失敗:", err); }
}

// 2. 切換大類別：JSON 改從 data 目錄抓取
async function showSection(sectionId) {
    currentSectionId = sectionId;
    // UI 高亮導覽列
    document.querySelectorAll('.top-nav a').forEach(l => l.classList.remove('active-nav'));
    document.getElementById('nav-' + sectionId)?.classList.add('active-nav');

    try {
        const dataResp = await fetch(`data/data_${sectionId}.json`);
        currentLessons = await dataResp.json();
        
        // 無論是哪個 section，通通顯示側邊欄
        renderSidebar(sectionId);
        
        loadLesson('intro');
    } catch (err) {
        console.error("讀取失敗:", err);
        document.getElementById('dynamic-area').innerHTML = `<h1>檔案讀取中</h1><p>尚未找到 data_${sectionId}.json。</p>`;
    }
}

// 3. 自動生成左側側邊欄清單
function renderSidebar(sectionId) {
    const sidePlaceholder = document.getElementById('sidebar-placeholder');
    sidePlaceholder.classList.add('active-sidebar');

    // 設定側邊欄的標題文字，需與 nav.html 的 ID 對應
    const titles = { 
        'training': '職前訓練課程', 
        'nursing_education': '在職教育課程', 
        'progression': '能力進階課程',
        'pgy': 'PGY 訓練資源' // 確保這行存在
    };
    
    let sidebarHtml = `<h3>${titles[sectionId] || '課程選單'}</h3>`;
    currentLessons.forEach(lesson => {
        // 在第一課上方增加水平線，區隔首頁與課程列表
        if (lesson.id === '01') sidebarHtml += `<hr style="margin: 10px 0; border:0; border-top:1px solid #ddd;">`;
        
        sidebarHtml += `<a onclick="loadLesson('${lesson.id}')" id="side-${lesson.id}">${lesson.title}</a>`;
    });
    sidePlaceholder.innerHTML = sidebarHtml;
}

// 4. 載入具體頁面內容
// ... (前方的 init, showSection, renderSidebar 保持不變)

function loadLesson(lessonId) {
    const index = currentLessons.findIndex(l => l.id === lessonId);
    if (index === -1) return;
    const lesson = currentLessons[index];

    document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active-page'));
    document.getElementById('side-' + lessonId)?.classList.add('active-page');

    let contentHtml = `<h1>${lesson.title}</h1><p>${lesson.desc}</p>`;

    // --- 新增：多檔案列表模式 (file_list) ---
    if (lesson.type === 'file_list' && lesson.files) {
        contentHtml += `<div style="margin-top: 20px;">`;
        lesson.files.forEach(file => {
            contentHtml += `
                <div class="video-box" style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                    <span style="font-weight: bold; font-size: 18px;">📄 ${file.name}</span>
                    <a href="${file.link}" target="_blank" class="w3-btn" style="background-color: #212529;">下載 / 查看</a>
                </div>`;
        });
        contentHtml += `</div>`;
    } 
    // A. 卡片格線模式 (用於 PGY)
    else if (lesson.type === 'grid' && lesson.cards) {
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
    // B. 大類別首頁模式
    else if (lesson.type === 'home') {
        contentHtml += `<div class="video-box"><h3>開始學習</h3><p>請點擊左側選單開始查看文件。</p></div>`;
    } 
    // C. 影片/講義模式 (帶有播放大按鈕)
    else {
        contentHtml += `
            <div class="video-box">
                <h3>課程內容</h3>
                <a href="${lesson.link}" target="_blank" class="play-btn">▶ 點擊觀看內容</a>
            </div>`;
    }

    // --- 上一課/下一課 按鈕顯示邏輯 ---
    // 1. 確保側邊欄是開啟狀態
const sideActive = document.getElementById('sidebar-placeholder').classList.contains('active-sidebar');

// 2. 判斷邏輯：側邊欄開啟，且「不是」能力進階，也「不是」PGY 訓練時，才顯示按鈕
if (sideActive && currentSectionId !== 'progression' && currentSectionId !== 'pgy') {
    const prev = currentLessons[index - 1];
    const next = currentLessons[index + 1];
    const navButtons = `
        <div class="nav-btn-container">
            ${prev ? `<button class="w3-btn" onclick="loadLesson('${prev.id}')">❮ 上一課</button>` : '<div></div>'}
            ${next ? `<button class="w3-btn" onclick="loadLesson('${next.id}')">下一課 ❯</button>` : '<div></div>'}
        </div>`;
    contentHtml = navButtons + contentHtml + navButtons;
}

// 最後渲染到畫面
document.getElementById('dynamic-area').innerHTML = contentHtml;
document.getElementById('main-content').scrollTop = 0;
}

// 回首頁功能：重新載入頁面
function goHome() { location.reload(); }

// 1. 引入 Supabase (如果還沒引入)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

const supabaseUrl = '你的_SUPABASE_URL';
const supabaseKey = '你的_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function handleVisitorCounter() {
    try {
        // 第一步：呼叫後端函式，把數字 +1
        await supabase.rpc('increment_visit_count');

        // 第二步：抓取最新的數字
        const { data, error } = await supabase
            .from('site_stats')
            .select('count')
            .eq('counter_name', 'total_visits')
            .single();

        if (error) throw error;

        // 第三步：更新到網頁畫面上
        document.getElementById('visitor-count').innerText = data.count;
        
    } catch (err) {
        console.error('計數器故障:', err);
        document.getElementById('visitor-count').innerText = '---';
    }
}

// 網頁載入後執行
document.addEventListener('DOMContentLoaded', handleVisitorCounter);

// 啟動初始化
init();