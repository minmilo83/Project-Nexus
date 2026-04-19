const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

async function fetchMyProjects() {
    try {
        // 抓取所有公開專案，並按更新時間排序
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        // 清空容器
        featuredGrid.innerHTML = '';
        otherGrid.innerHTML = '';

        repos.forEach(repo => {
            // 排除掉控制台專案本身
            if (repo.name.toLowerCase() === 'project-nexus') return;

            // 1. 判斷是否有展示網頁 (homepage)
            // GitHub API 的 homepage 欄位通常存放在 Repository 設定中的 Website 連結
            const demoUrl = repo.homepage;
            const repoUrl = repo.html_url;

            // 2. 建立卡片元素
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // 3. 組合內部 HTML 結構 (加入按鈕模塊)
            card.innerHTML = `
                <div class="card-header">
                    <span class="repo-lang">${repo.language || 'Markdown'}</span>
                </div>
                <h3>${repo.name}</h3>
                <p>${repo.description || '系統未偵測到專案描述。'}</p>
                
                <div class="card-footer">
                    <div class="tags">
                        ${repo.topics.map(t => `<span class="tag">#${t}</span>`).join('')}
                    </div>
                    
                    <div class="button-group">
                        ${demoUrl ? `<a href="${demoUrl}" target="_blank" class="btn btn-primary">VIEW DEMO</a>` : ''}
                        <a href="${repoUrl}" target="_blank" class="btn btn-outline">SOURCE CODE</a>
                    </div>
                </div>
            `;

            // 4. 分類邏輯：有 'works' 標籤的進入精選區
            if (repo.topics.includes('works')) {
                featuredGrid.appendChild(card);
            } else {
                otherGrid.appendChild(card);
            }
        });

    } catch (error) {
        console.error('API Fetch Error:', error);
        featuredGrid.innerHTML = '<div class="status-msg">DATABASE CONNECTION FAILED.</div>';
    }
}

// 啟動掃描
fetchMyProjects();
