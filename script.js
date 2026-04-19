const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

/**
 * --- 子路徑精確配置區 ---
 * 這裡我們手動修正你提到的網址結構問題
 */
const extraLinks = {
    'My-HTML-Vibe': [
        { name: 'OmniSearch V6', path: 'OmniSearch_V6.html' },
        { name: 'OmniSearch V5', path: 'OmniSearch_V5.html' },
        { name: 'OmniSearch V4', path: 'OmniSearch_V4.html' }, // 補上 V4
        { name: 'OmniSearch V3', path: 'OmniSearch_V3.html' }, // 補上 V3
        { name: 'OmniSearch V2', path: 'OmniSearch_V2.html' }, // 補上 V2
        { name: 'OmniSearch V1', path: 'OmniSearch_V1.html' }
    ],
    'Notebook': [
        { name: 'Maker Section', path: 'Maker/index.html' },
        // 修正 Nature Science：如果是資料夾裡的特定檔案，路徑要寫到底
        { name: 'Nature Science - Physics', path: 'Natural-Science/physics.html' }, 
        { name: 'Nature Science - Chemistry', path: 'Natural-Science/chemistry.html' }
    ],
    'Script': [
        // 這裡只保留你要的，過濾掉其他小說文字檔
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

            let demoUrl = repo.homepage;
            if (!demoUrl && repo.has_pages) {
                demoUrl = `https://${username}.github.io/${repo.name}/`;
            }

            const repoUrl = repo.html_url;
            const subPages = extraLinks[repo.name] || [];

            // 網址拼接邏輯優化
            let subPagesHtml = '';
            if (demoUrl) {
                const base = demoUrl.endsWith('/') ? demoUrl : `${demoUrl}/`;
                subPagesHtml = subPages.map(link => {
                    const cleanPath = link.path.startsWith('/') ? link.path.substring(1) : link.path;
                    return `<a href="${base}${cleanPath}" target="_blank">${link.name}</a>`;
                }).join('');
            }

            const card = document.createElement('div');
            card.className = 'project-card';
            
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
