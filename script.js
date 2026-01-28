// Configuration
const CONFIG = {
    DATA_URL: 'data/trending.json',
    REGIONS: {
        TW: { code: 'TW', name: '台灣' },
        US: { code: 'US', name: '美國' }
    }
};

// State Management
let currentRegion = 'TW';
let trendingData = null;
let supportsWebP = false;

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('error-message'),
    cardsContainer: document.getElementById('cards-container'),
    updateTime: document.getElementById('update-time'),
    tabButtons: document.querySelectorAll('.tab-button')
};

// Initialize Application
function init() {
    checkWebPSupport();
    setupTabListeners();
    loadData();
}

// Check WebP Support
function checkWebPSupport() {
    const webpTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA=="
    };
    
    const img = new Image();
    img.onload = function() {
        supportsWebP = (img.width > 0) && (img.height > 0);
        console.log('WebP Support:', supportsWebP);
    };
    img.onerror = function() {
        supportsWebP = false;
        console.log('WebP Support:', supportsWebP);
    };
    img.src = "data:image/webp;base64," + webpTestImages.lossy;
}

// Setup Tab Listeners
function setupTabListeners() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const region = button.dataset.region;
            if (region !== currentRegion) {
                currentRegion = region;
                updateActiveTab();
                renderVideos();
            }
        });
    });
}

// Update Active Tab
function updateActiveTab() {
    elements.tabButtons.forEach(button => {
        if (button.dataset.region === currentRegion) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Load Data from JSON
async function loadData() {
    showLoading();
    hideError();
    
    try {
        const response = await fetch(CONFIG.DATA_URL);
        
        if (!response.ok) {
            throw new Error('無法載入影片資料');
        }
        
        trendingData = await response.json();
        renderVideos();
        updateTimestamp(trendingData.lastUpdated);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Render Videos
function renderVideos() {
    if (!trendingData) return;
    
    elements.cardsContainer.innerHTML = '';
    
    const videos = trendingData.regions[currentRegion] || [];
    
    if (videos.length === 0) {
        elements.cardsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p style="font-size: 1.2rem;">目前沒有可顯示的影片</p>
            </div>
        `;
        return;
    }
    
    videos.forEach((video, index) => {
        const card = createVideoCard(video, index + 1);
        elements.cardsContainer.appendChild(card);
    });
}

// Create Video Card
function createVideoCard(video, rank) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => openVideo(video.id);
    
    const thumbnail = getThumbnailUrl(video.thumbnail);
    const views = formatNumber(video.viewCount);
    const likes = formatNumber(video.likeCount);
    const comments = formatNumber(video.commentCount);
    const title = escapeHtml(video.title);
    const channelTitle = escapeHtml(video.channelTitle);
    
    card.innerHTML = `
        <div class="thumbnail-container">
            <img class="thumbnail" 
                 src="${thumbnail}" 
                 alt="${title}"
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/480x360?text=No+Image'">
            <div class="rank-badge">#${rank}</div>
        </div>
        <div class="card-content">
            <h3 class="video-title">${title}</h3>
            <div class="channel-name">
                <span class="channel-icon">📺</span>
                <span>${channelTitle}</span>
            </div>
            <div class="video-stats">
                <div class="stat-item">
                    <span class="stat-icon">👁️</span>
                    <span>${views} 次觀看</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">👍</span>
                    <span>${likes}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span>${comments}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Get Thumbnail URL (with WebP support)
function getThumbnailUrl(url) {
    // YouTube CDN supports WebP via URL modification
    if (supportsWebP && url.includes('ytimg.com')) {
        url = url.replace(/\.(jpg|jpeg)$/i, '.webp');
    }
    return url;
}

// Format Number (1234567 -> 1.2M)
function formatNumber(num) {
    num = parseInt(num);
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open Video
function openVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

// Update Timestamp
function updateTimestamp(isoString) {
    const date = new Date(isoString);
    const timeString = date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    elements.updateTime.textContent = timeString;
}

// Show Loading
function showLoading() {
    elements.loading.style.display = 'flex';
    elements.cardsContainer.style.display = 'none';
}

// Hide Loading
function hideLoading() {
    elements.loading.style.display = 'none';
    elements.cardsContainer.style.display = 'grid';
}

// Show Error
function showError(message) {
    elements.error.style.display = 'block';
    elements.errorMessage.textContent = message;
}

// Hide Error
function hideError() {
    elements.error.style.display = 'none';
}

// Initialize on DOM Load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Service Worker Registration for PWA (Optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}
