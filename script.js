const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

/**
 * --- 子路徑手動配置區 ---
 * key: 必須與 GitHub 上的 Repository 名稱完全一致
 * name: 顯示在選單上的文字
 * path: 接在主網址後面的路徑 (例如 'OmniSearch_V6.html' 或 'subfolder/')
 */
const extraLinks = {
    'My-HTML-Vibe': [
        { name: 'OmniSearch V6', path: 'OmniSearch_V6.html' },
        { name: 'OmniSearch V5', path: 'OmniSearch_V5.html' },
        { name: 'OmniSearch V1', path: 'OmniSearch_V1.html' }
    ],
    'Notebook': [
        { name: 'Maker Section', path: 'Maker/' },
        { name: 'Natural Science', path: 'Natural-Science/' }
    ],
    'Script': [
        { name: 'Demo Book', path: 'library/demo-book/' },
        { name: 'Shelf System', path: 'shelf.html' }
    ],
    'Horse-Year-Card': [
        { name: 'Luck Message', path: 'horse-luck/' },
        { name: 'Running Animation', path: 'horse-running/' }
    ]
};

async function fetchMyProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        featuredGrid.innerHTML = '';
        otherGrid.innerHTML = '';

        repos.forEach(repo => {
            // 排除控制台專案本身
            if (repo.name.toLowerCase() === 'project-nexus') return;

            // 1. 偵測主展示網址 (優先用 Website 欄位，沒有則拼接 Pages 網址)
            let demoUrl = repo.homepage;
            if (!demoUrl && repo.has_pages) {
                demoUrl = `https://${username}.github.io/${repo.name}/`;
            }

            const repoUrl = repo.html_url;
            // 取得該專案對應的子路徑清單
            const subPages = extraLinks[repo.name] || [];

            const card = document.createElement('div');
            card.className = 'project-card';
            
            // 2. 組合卡片內容
            card.innerHTML = `
                <div class="card-header">
                    <span class="repo-lang">${repo.language || 'Code'}</span>
                </div>
                <h3>${repo.name}</h3>
                <p>${repo.description || '系統未偵測到專案描述。'}</p>
                
                <div class="card-footer">
                    <div class="tags">
                        ${repo.topics.map(t => `<span class="tag">#${t}</span>`).join('')}
                    </div>
                    
                    <div class="button-group-wrapper">
                        <div class="main-buttons">
                            ${demoUrl ? `
                                <div class="dropdown">
                                    <a href="${demoUrl}" target="_blank" class="btn btn-primary">VIEW MAIN</a>
                                    ${subPages.length > 0 ? `<button class="dropdown-toggle" title="更多頁面">▼</button>` : ''}
                                    <div class="dropdown-menu">
                                        ${subPages.map(link => `
                                            <a href="${demoUrl}${link.path}" target="_blank">${link.name}</a>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            <a href="${repoUrl}" target="_blank" class="btn btn-outline">SOURCE</a>
                        </div>
                    </div>
                </div>
            `;

            // 3. 根據標籤分類
            if (repo.topics.includes('works')) {
                featuredGrid.appendChild(card);
            } else {
                otherGrid.appendChild(card);
            }
        });

    } catch (error) {
        console.error('Fetch Error:', error);
        featuredGrid.innerHTML = '<div class="status-msg">DATABASE ERROR.</div>';
    }
}

// 啟動資料抓取
fetchMyProjects();
