const username = 'minmilo83';
const featuredGrid = document.getElementById('featured-grid');
const otherGrid = document.getElementById('other-grid');

async function fetchMyProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        featuredGrid.innerHTML = '';
        otherGrid.innerHTML = '';

        repos.forEach(repo => {
            if (repo.name.toLowerCase() === 'project-nexus') return;

            const card = document.createElement('a');
            card.href = repo.html_url;
            card.className = 'project-card';
            card.target = '_blank';
            card.innerHTML = `
                <div class="card-header">
                    <span class="repo-lang">${repo.language || 'Code'}</span>
                </div>
                <h3>${repo.name}</h3>
                <p>${repo.description || '暫無簡介，點擊進入專案查看細節。'}</p>
                <div class="card-footer">
                    ${repo.topics.map(t => `<span class="tag">#${t}</span>`).join('')}
                </div>
            `;

            if (repo.topics.includes('works')) {
                featuredGrid.appendChild(card);
            } else {
                otherGrid.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Data loading error:', error);
        featuredGrid.innerHTML = '<p>系統連線失敗，請檢查網路連線。</p>';
    }
}

fetchMyProjects();
