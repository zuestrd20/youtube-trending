// Configuration
const CONFIG = {
    // 使用者需要在這裡填入自己的 YouTube Data API Key
    API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE',
    API_BASE_URL: 'https://www.googleapis.com/youtube/v3/videos',
    MAX_RESULTS: 5,
    REGIONS: {
        TW: { code: 'TW', name: '台灣' },
        US: { code: 'US', name: '美國' }
    }
};

// State Management
let currentRegion = 'TW';
let currentDate = new Date();
let videosCache = {};
let supportsWebP = false;

// DOM Elements
const elements = {
    dateInput: document.getElementById('date-input'),
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
    setupDateInput();
    setupTabListeners();
    loadVideos();
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

// Setup Date Input
function setupDateInput() {
    // Set max date to today
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.max = today;
    elements.dateInput.value = today;
    
    // Add change listener
    elements.dateInput.addEventListener('change', (e) => {
        currentDate = new Date(e.target.value);
        loadVideos();
    });
}

// Setup Tab Listeners
function setupTabListeners() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const region = button.dataset.region;
            if (region !== currentRegion) {
                currentRegion = region;
                updateActiveTab();
                loadVideos();
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

// Load Videos
async function loadVideos() {
    showLoading();
    hideError();
    
    const cacheKey = `${currentRegion}_${elements.dateInput.value}`;
    
    // Check cache
    if (videosCache[cacheKey]) {
        renderVideos(videosCache[cacheKey]);
        hideLoading();
        return;
    }
    
    try {
        const videos = await fetchYouTubeVideos(currentRegion);
        videosCache[cacheKey] = videos;
        renderVideos(videos);
        updateTimestamp();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Fetch YouTube Videos
async function fetchYouTubeVideos(regionCode) {
    if (CONFIG.API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        throw new Error('請在 script.js 中設定您的 YouTube Data API Key');
    }
    
    const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: regionCode,
        maxResults: CONFIG.MAX_RESULTS,
        key: CONFIG.API_KEY
    });
    
    const response = await fetch(`${CONFIG.API_BASE_URL}?${params}`);
    
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('API Key 無效或已超過配額限制');
        }
        throw new Error(`API 請求失敗: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
}

// Render Videos
function renderVideos(videos) {
    elements.cardsContainer.innerHTML = '';
    
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
    
    const thumbnail = getThumbnailUrl(video.snippet.thumbnails);
    const duration = formatDuration(video.contentDetails.duration);
    const views = formatNumber(video.statistics.viewCount);
    const likes = formatNumber(video.statistics.likeCount);
    const title = escapeHtml(video.snippet.title);
    const channelTitle = escapeHtml(video.snippet.channelTitle);
    const description = escapeHtml(video.snippet.description);
    
    card.innerHTML = `
        <div class="thumbnail-container">
            <img class="thumbnail" 
                 src="${thumbnail}" 
                 alt="${title}"
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/480x360?text=No+Image'">
            <div class="rank-badge">${rank}</div>
            <div class="duration-badge">${duration}</div>
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
                    <span>${views}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">👍</span>
                    <span>${likes}</span>
                </div>
            </div>
            <p class="video-description">${description}</p>
        </div>
    `;
    
    return card;
}

// Get Best Thumbnail URL (prefer WebP if available, else highest quality)
function getThumbnailUrl(thumbnails) {
    let url;
    
    // Get highest quality available
    if (thumbnails.maxres) {
        url = thumbnails.maxres.url;
    } else if (thumbnails.high) {
        url = thumbnails.high.url;
    } else if (thumbnails.medium) {
        url = thumbnails.medium.url;
    } else {
        url = thumbnails.default.url;
    }
    
    // YouTube CDN supports WebP via URL modification
    // Convert to WebP format if browser supports it
    if (supportsWebP && url.includes('ytimg.com')) {
        // Replace jpg/jpeg with webp in the URL
        url = url.replace(/\.(jpg|jpeg)$/i, '.webp');
    }
    
    return url;
}

// Format Duration (PT1H2M10S -> 1:02:10)
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    const parts = [];
    if (hours) parts.push(hours);
    parts.push(minutes.padStart(hours ? 2 : 1, '0') || '0');
    parts.push(seconds.padStart(2, '0') || '00');
    
    return parts.join(':');
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
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-TW', {
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
