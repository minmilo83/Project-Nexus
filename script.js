const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

/**
 * 1. [手動焊死區]：針對不會再變動的專案直接寫死連結
 * 這裡解決了你的 Horse-Year-Card 消失的問題
 */
const fixedLinks = {
    'Horse-Year-Card': [
        { name: 'Luck Message', path: 'horse-luck/' },
        { name: 'Running Animation', path: 'horse-running/' }
    ]
};

/**
 * 2. [自動掃描區]：針對還會持續更新、資料夾很深的專案進行深挖
 */
const autoScanRepos = ['Notebook', 'My-HTML-Vibe', 'Script'];

async function fetchMyProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        featuredGrid.innerHTML = '';
        otherGrid.innerHTML = '';

        for (const repo of repos) {
            // 排除掉控制台本身
            if (repo.name.toLowerCase() === 'project-nexus') continue;

            // 判斷主網址
            let demoUrl = repo.homepage || (repo.has_pages ? `https://${username}.github.io/${repo.name}/` : null);
            const repoUrl = repo.html_url;
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="card-header"><span class="repo-lang">${repo.language || 'Code'}</span></div>
                <h3>${repo.name}</h3>
                <p id="desc-${repo.name}">${repo.description || 'System module synchronized.'}</p>
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

            // 分類放入畫面
            if (repo.topics.includes('works')) featuredGrid.appendChild(card);
            else otherGrid.appendChild(card);

            // --- 處理分頁注入 ---
            if (demoUrl) {
                // 如果是手動寫死的專案 (例如 Horse-Year-Card)
                if (fixedLinks[repo.name]) {
                    injectManualLinks(repo.name, demoUrl, fixedLinks[repo.name]);
                } 
                // 如果是需要自動掃描的專案 (例如 Notebook, My-HTML-Vibe)
                else if (autoScanRepos.includes(repo.name)) {
                    fillSubPages(repo.name, demoUrl);
                }
            }
        }
    } catch (e) { console.error("Critical failure in Nexus core:", e); }
}

/**
 * 注入手動寫死的連結邏輯
 */
function injectManualLinks(repoName, baseUrl, links) {
    const dropdown = document.getElementById(`drop-${repoName}`);
    if (!dropdown) return;

    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    dropdown.innerHTML += `<button class="dropdown-toggle" title="手動配置分頁">▼</button>`;
    
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';
    menu.innerHTML = links.map(link => {
        const cleanPath = link.path.startsWith('/') ? link.path.substring(1) : link.path;
        return `<a href="${base}${cleanPath}" target="_blank">${link.name}</a>`;
    }).join('');
    
    dropdown.appendChild(menu);
}

/**
 * 自動深挖 GitHub API 目錄邏輯
 */
async function fillSubPages(repoName, baseUrl) {
    const dropdown = document.getElementById(`drop-${repoName}`);
    if (!dropdown) return;

    try {
        const treeRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/trees/main?recursive=1`);
        const data = await treeRes.json();
        const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

        const htmlFiles = data.tree.filter(file => {
            const path = file.path.toLowerCase();
            // 基本過濾：只要 HTML，排除 404 與 根目錄 index
            if (!path.endsWith('.html') || path === 'index.html' || path.includes('404')) return false;
            // 針對 Script 的過濾：只准 shelf.html 通過，排除文字檔
            if (repoName === 'Script' && !path.includes('shelf.html')) return false;
            return true;
        });

        if (htmlFiles.length > 0) {
            htmlFiles.sort((a, b) => b.path.localeCompare(a.path));
            dropdown.innerHTML += `<button class="dropdown-toggle">▼</button>`;
            const menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            
            menu.innerHTML = htmlFiles.map(file => {
                let pathParts = file.path.split('/');
                let fileName = pathParts.pop().replace('.html', '');
                let displayName = '';

                // 處理 Notebook 這種多層資料夾 index.html 的命名
                if (fileName.toLowerCase() === 'index') {
                    displayName = pathParts[pathParts.length - 1] || fileName;
                } else {
                    displayName = fileName.replace(/_/g, ' ').replace(/-/g, ' ');
                }

                // 加上分類前綴，方便識別來源資料夾
                if (repoName === 'Notebook' && pathParts.length > 1) {
                    let category = pathParts[0];
                    displayName = `<span style="opacity:0.5; font-size:0.6rem;">${category} /</span> ${displayName}`;
                }
                return `<a href="${base}${file.path}" target="_blank">${displayName}</a>`;
            }).join('');
            
            dropdown.appendChild(menu);
        }
    } catch (e) { console.warn(`Automated scan skipped for ${repoName}`); }
}

fetchMyProjects();
