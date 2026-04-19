const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

/**
 * --- 子路徑手動配置區 ---
 * 這裡定義每個 Repository 除了主頁以外的其他分頁
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
            if (repo.name.toLowerCase() === 'project-nexus') return;

            // 1. 偵測主展示網址
            let demoUrl = repo.homepage;
            if (!demoUrl && repo.has_pages) {
                demoUrl = `https://${username}.github.io/${repo.name}/`;
            }

            const repoUrl = repo.html_url;
            const subPages = extraLinks[repo.name] || [];

            // --- 核心修復：網址完整性處理 ---
            let subPagesHtml = '';
            if (demoUrl) {
                // 確保 base 結尾一定有 /
                const base = demoUrl.endsWith('/') ? demoUrl : `${demoUrl}/`;
                
                subPagesHtml = subPages.map(link => {
                    // 確保 path 開頭沒有 /
                    const cleanPath = link.path.startsWith('/') ? link.path.substring(1) : link.path;
                    return `<a href="${base}${cleanPath}" target="_blank">${link.name}</a>`;
                }).join('');
            }

            const card = document.createElement('div');
            card.className = 'project-card';
            
            // 2. 組合卡片 HTML (配合 CSS .dropdown 結構)
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
                    
                    <div class="main-buttons">
                        ${demoUrl ? `
                            <div class="dropdown">
                                <a href="${demoUrl}" target="_blank" class="btn btn-primary">VIEW MAIN</a>
                                ${subPages.length > 0 ? `
                                    <button class="dropdown-toggle">▼</button>
                                    <div class="dropdown-menu">
                                        ${subPagesHtml}
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                        <a href="${repoUrl}" target="_blank" class="btn btn-outline">SOURCE</a>
                    </div>
                </div>
            `;

            // 3. 分類
            if (repo.topics.includes('works')) {
                featuredGrid.appendChild(card);
            } else {
                otherGrid.appendChild(card);
            }
        });

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

fetchMyProjects();
