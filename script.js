const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

// 需要自動掃描的分頁儲存庫
const autoScanRepos = ['Notebook', 'My-HTML-Vibe', 'Script'];

async function fetchMyProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        featuredGrid.innerHTML = '';
        otherGrid.innerHTML = '';

        for (const repo of repos) {
            if (repo.name.toLowerCase() === 'project-nexus') continue;

            let demoUrl = repo.homepage || (repo.has_pages ? `https://${username}.github.io/${repo.name}/` : null);
            const repoUrl = repo.html_url;
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="card-header"><span class="repo-lang">${repo.language || 'Code'}</span></div>
                <h3>${repo.name}</h3>
                <p id="desc-${repo.name}">${repo.description || 'System scanning for modules...'}</p>
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

            if (repo.topics.includes('works')) featuredGrid.appendChild(card);
            else otherGrid.appendChild(card);

            if (autoScanRepos.includes(repo.name) && demoUrl) {
                fillSubPages(repo.name, demoUrl);
            }
        }
    } catch (e) { console.error("Initialization failed:", e); }
}

async function fillSubPages(repoName, baseUrl) {
    const dropdown = document.getElementById(`drop-${repoName}`);
    if (!dropdown) return;

    try {
        const treeRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/trees/main?recursive=1`);
        const data = await treeRes.json();
        const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

        // --- 核心邏輯：精準過濾器 ---
        const htmlFiles = data.tree.filter(file => {
            const path = file.path.toLowerCase();
            // 1. 基本過濾：必須是 HTML，且排除 404 與 根目錄的 index (因為那是 VIEW MAIN)
            if (!path.endsWith('.html') || path === 'index.html' || path.includes('404')) return false;

            // 2. 針對 Script 專案：只抓 shelf.html，排除所有文字檔與其他雜項
            if (repoName === 'Script' && !path.includes('shelf.html')) return false;

            return true;
        });

        if (htmlFiles.length > 0) {
            // 按檔名排序 (讓 V6 排在 V1 前面，或按字母順序)
            htmlFiles.sort((a, b) => b.path.localeCompare(a.path));

            dropdown.innerHTML += `<button class="dropdown-toggle">▼</button>`;
            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            
            menu.innerHTML = htmlFiles.map(file => {
                let pathParts = file.path.split('/');
                let fileName = pathParts.pop().replace('.html', '');
                let displayName = '';

                // --- 智能命名系統 ---
                if (fileName.toLowerCase() === 'index') {
                    // 如果是資料夾裡的 index.html，顯示資料夾名稱 (例如: Biology)
                    displayName = pathParts[pathParts.length - 1] || fileName;
                } else {
                    // 如果是特定檔案，格式化名稱 (例如: OmniSearch_V6 -> OmniSearch V6)
                    displayName = fileName.replace(/_/g, ' ').replace(/-/g, ' ');
                }

                // 如果路徑很深 (像 Notebook)，加上父層標籤
                if (repoName === 'Notebook' && pathParts.length > 1) {
                    let category = pathParts[0]; // 例如: Natural-Science
                    displayName = `<span style="opacity:0.5; font-size:0.6rem;">${category} /</span> ${displayName}`;
                }

                return `<a href="${base}${file.path}" target="_blank">${displayName}</a>`;
            }).join('');
            
            dropdown.appendChild(menu);
        }
    } catch (e) { console.warn(`Scan skip for ${repoName}:`, e); }
}

fetchMyProjects();
