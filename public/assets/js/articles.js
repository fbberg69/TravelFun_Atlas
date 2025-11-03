// Medium RSS Feed Integration
// Fetches and displays articles from Medium profile

const MEDIUM_USERNAME = 'jcbergxuxu';
const MEDIUM_RSS_URL = `https://medium.com/feed/@${MEDIUM_USERNAME}`;

// Fallback articles if RSS feed fails
const FALLBACK_ARTICLES = [
    {
        title: 'Fast Monetization in Emerging Travel Niches: Your 2025 Roadmap to Profit from Affiliate Programs',
        link: 'https://medium.com/@jcbergxuxu/fast-monetization-in-emerging-travel-niches-your-2025-roadmap-to-profit-from-affiliate-programs-e8a3abf247d9',
        pubDate: 'Thu, 30 Oct 2025 13:00:32 GMT',
        description: 'The Golden Era Nobody\'s Talking About. While everyone\'s scrambling to jump on the "travel blogger" bandwagon, most people are doing it completely wrong. Learn how to identify profitable emerging niches and monetize them quickly with AI-powered tools.',
        thumbnail: 'https://cdn-images-1.medium.com/max/1024/1*ult_vJ-mPiptM0slqdyUtw.png'
    },
    {
        title: 'Prompt Engineering for Nomad Productivity 2025: Master AI to 2x Your Output',
        link: 'https://medium.com/@jcbergxuxu/prompt-engineering-for-nomad-productivity-2025-master-ai-to-2x-your-output-b868fd498303',
        pubDate: 'Mon, 27 Oct 2025 19:58:03 GMT',
        description: 'Discover the Prompt Nomad Mastery Framework — seven layers of prompt engineering designed for remote workers who need to 2x their output without adding burnout to an already insane lifestyle.',
        thumbnail: 'https://cdn-images-1.medium.com/max/1024/1*PKiynoUbVaigw15S1Yg2Ug.png'
    },
    {
        title: 'Project Atlas: The Silence Was Deafening, The Upgrade Was Necessary',
        link: 'https://medium.com/@jcbergxuxu/project-atlas-the-silence-was-deafening-the-upgrade-was-necessary-6febf7fee784',
        pubDate: 'Sun, 20 Oct 2025 09:00:00 GMT',
        description: 'The evolution of Atlas v42 — from silence to strategic intelligence. A deep dive into the philosophy and architecture behind the sentient engine for creators.',
        thumbnail: 'https://cdn-images-1.medium.com/max/1024/1*h93F0mGg9Cnce7BJYJQf8A.png'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('articles.html')) {
        loadMediumArticles();
    }
});

async function loadMediumArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    const articlesLoader = document.getElementById('articlesLoader');
    const articlesError = document.getElementById('articlesError');
    
    try {
        // Try multiple CORS proxies
        const proxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        let articles = null;
        let lastError = null;
        
        for (const proxy of proxies) {
            try {
                const response = await fetch(`${proxy}${encodeURIComponent(MEDIUM_RSS_URL)}`, {
                    headers: {
                        'Accept': 'application/json, text/plain, */*'
                    },
                    timeout: 5000
                });
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const xmlContent = data.contents || data;
                
                // Parse XML from RSS feed
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlContent, 'text/xml');
                
                // Check for parsing errors
                const parserError = xml.querySelector('parsererror');
                if (parserError) continue;
                
                // Extract articles from RSS
                const items = xml.querySelectorAll('item');
                
                if (items.length > 0) {
                    articles = Array.from(items).slice(0, 10).map(item => ({
                        title: item.querySelector('title')?.textContent || 'Untitled',
                        link: item.querySelector('link')?.textContent || '#',
                        pubDate: item.querySelector('pubDate')?.textContent || '',
                        description: item.querySelector('description')?.textContent || '',
                        content: item.querySelector('content\\:encoded, encoded')?.textContent || item.querySelector('description')?.textContent || '',
                        thumbnail: extractThumbnail(item)
                    }));
                    break; // Success, exit loop
                }
            } catch (err) {
                lastError = err;
                continue; // Try next proxy
            }
        }
        
        // If all proxies failed, use fallback articles
        if (!articles || articles.length === 0) {
            console.log('Using fallback articles - RSS feed unavailable');
            articles = FALLBACK_ARTICLES;
        }
        
        // Hide loader
        articlesLoader.style.display = 'none';
        
        // Display articles
        displayArticles(articles);
        
    } catch (error) {
        console.error('Error loading Medium articles:', error);
        articlesLoader.style.display = 'none';
        
        // Use fallback articles instead of showing error
        console.log('Using fallback articles due to error');
        displayArticles(FALLBACK_ARTICLES);
    }
}

// Extract thumbnail from RSS item
function extractThumbnail(item) {
    // Try media:thumbnail
    const mediaThumbnail = item.querySelector('thumbnail');
    if (mediaThumbnail) {
        return mediaThumbnail.getAttribute('url');
    }
    
    // Try to extract from content
    const content = item.querySelector('content\\:encoded, encoded')?.textContent || 
                    item.querySelector('description')?.textContent || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
    return imgMatch ? imgMatch[1] : null;
}

function displayArticles(articles) {
    const articlesGrid = document.getElementById('articlesGrid');
    
    articles.forEach(article => {
        const articleCard = createArticleCard(article);
        articlesGrid.appendChild(articleCard);
    });
    
    // Add animation
    const cards = articlesGrid.querySelectorAll('.article-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    
    // Extract image from content or use placeholder
    let imageUrl = extractImageFromContent(article.description || article.content);
    if (!imageUrl && article.thumbnail) {
        imageUrl = article.thumbnail;
    }
    
    // Clean description
    const cleanDescription = stripHtml(article.description || article.content || '').substring(0, 150) + '...';
    
    // Format date
    const pubDate = new Date(article.pubDate);
    const formattedDate = pubDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    card.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(article.title)}" class="article-image" onerror="this.style.display='none'">` : '<div class="article-image"></div>'}
        <div class="article-content">
            <h3 class="article-title">${escapeHtml(article.title)}</h3>
            <p class="article-snippet">${cleanDescription}</p>
            <div class="article-meta">
                <span>${formattedDate}</span>
                <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-link">Read More</a>
            </div>
            <div class="article-share">
                ${createShareButtons(article.title, article.link)}
            </div>
        </div>
    `;
    
    // Make card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
            window.open(article.link, '_blank', 'noopener,noreferrer');
        }
    });
    
    return card;
}

function createShareButtons(title, url) {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    
    return `
        <div class="share-buttons" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
            <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="share-button"
               style="padding: 0.5rem 1rem; background: rgba(0, 255, 255, 0.2); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 0.5rem; color: var(--neon-cyan); text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;"
               title="Share on X/Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="share-button"
               style="padding: 0.5rem 1rem; background: rgba(0, 255, 255, 0.2); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 0.5rem; color: var(--neon-cyan); text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;"
               title="Share on LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                </svg>
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="share-button"
               style="padding: 0.5rem 1rem; background: rgba(0, 255, 255, 0.2); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 0.5rem; color: var(--neon-cyan); text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;"
               title="Share on Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle;">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
            </a>
        </div>
    `;
}

// Helper function to extract image from HTML content
function extractImageFromContent(html) {
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = html.match(imgRegex);
    return match ? match[1] : null;
}

// Helper function to strip HTML tags
function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
