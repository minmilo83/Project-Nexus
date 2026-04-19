const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

// 設定需要「自動深挖」所有 HTML 檔案的專案
const autoScanRepos = ['Notebook', 'My-HTML-Vibe', 'Script'];

async function fetchMyProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        featuredGrid.innerHTML = '';
        otherGrid.innerHTML = '';

        // 使用 for...of 以便處理非同步掃描
        for (const repo of repos) {
            if (repo.name.toLowerCase() === 'project-nexus') continue;

            // 優先找 homepage，沒有就拼湊 GitHub Pages 預設網址
            let demoUrl = repo.homepage;
            if (!demoUrl && repo.has_pages) {
                demoUrl = `https://${username}.github.io/${repo.name}/`;
            }

            const repoUrl = repo.html_url;
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="card-header"><span class="repo-lang">${repo.language || 'Code'}</span></div>
                <h3>${repo.name}</h3>
                <p id="desc-${repo.name}">${repo.description || '系統載入中...'}</p>
                <div class="card-footer">
                    <div class="tags">${repo.topics.map(t => `<span class="tag">#${t}</span>`).join('')}</div>
                    <div class="main-buttons" id="btns-${repo.name}">
                        ${demoUrl ? `
                            <div class="dropdown" id="drop-${repo.name}">
                                <a href="${demoUrl}" target="_blank" class="btn btn-primary">VIEW MAIN</a>
                                </div>
                        ` : ''}
                        <a href="${repoUrl}" target="_blank" class="btn btn-outline">SOURCE</a>
                    </div>
                </div>
            `;

            // 依標籤分類放入網格
            if (repo.topics.includes('works')) {
                featuredGrid.appendChild(card);
            } else {
                otherGrid.appendChild(card);
            }

            // 啟動自動掃描
            if (autoScanRepos.includes(repo.name) && demoUrl) {
                fillSubPages(repo.name, demoUrl);
            }
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

/**
 * 核心功能：自動抓取儲存庫內所有 HTML 分頁
 */
async function fillSubPages(repoName, baseUrl) {
    const dropdown = document.getElementById(`drop-${repoName}`);
    if (!dropdown) return;

    try {
        // recursive=1 會抓取所有層級的檔案樹
        const treeRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/trees/main?recursive=1`);
        const data = await treeRes.json();
        
        // 確保 base 結尾有斜線
        const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

        // 過濾邏輯：1.必須是 HTML  2.不是 index.html (主頁) 3.不是 404 頁面
        const htmlFiles = data.tree.filter(file => 
            file.path.endsWith('.html') && 
            !file.path.toLowerCase().endsWith('index.html') &&
            !file.path.toLowerCase().includes('404')
        );

        if (htmlFiles.length > 0) {
            // 插入切換箭頭
            dropdown.innerHTML += `<button class="dropdown-toggle" title="更多頁面">▼</button>`;
            
            // 建立選單
            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            
            menu.innerHTML = htmlFiles.map(file => {
                // 優化顯示名稱：取出路徑最後一段，去掉 .html，並將底線轉為空格
                let fileName = file.path.split('/').pop().replace('.html', '').replace(/_/g, ' ');
                
                // 如果在深層資料夾，顯示部分路徑讓使用者知道在哪 (例如: Biology > 草本)
                let pathParts = file.path.split('/');
                let displayName = pathParts.length > 1 
                    ? `${pathParts[pathParts.length - 2]} / ${fileName}` 
                    : fileName;

                return `<a href="${base}${file.path}" target="_blank">${displayName}</a>`;
            }).join('');
            
            dropdown.appendChild(menu);
        }
    } catch (e) {
        console.warn(`${repoName} 子頁面載入失敗，可能超出 API 限制或無 main 分支`);
    }
}

fetchMyProjects();
