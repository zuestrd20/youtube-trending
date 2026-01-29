// ============================================================================
// YouTube Trending - Enhanced Version
// 包含：快取、懶加載、搜尋、篩選、收藏、深色模式
// ============================================================================

// Configuration
const CONFIG = {
    DATA_URL: 'data/trending.json',
    CACHE_KEY: 'youtube_trending_cache',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    FAVORITES_KEY: 'youtube_trending_favorites',
    THEME_KEY: 'youtube_trending_theme',
    INITIAL_LOAD: 20,
    LOAD_MORE: 10,
    REGIONS: {
        TW: { code: 'TW', name: '台灣', flag: '🇹🇼' },
        US: { code: 'US', name: '美國', flag: '🇺🇸' }
    }
};

// State Management
const state = {
    currentRegion: 'TW',
    allVideos: {},
    displayedVideos: [],
    filteredVideos: [],
    favorites: new Set(),
    searchQuery: '',
    sortBy: 'rank',
    filterViews: 'all',
    darkMode: false,
    observerInitialized: false
};

// DOM Elements Cache
const elements = {
    loading: null,
    error: null,
    errorMessage: null,
    cardsContainer: null,
    updateTime: null,
    tabButtons: null,
    searchInput: null,
    sortSelect: null,
    viewsFilter: null,
    themeToggle: null,
    favoritesToggle: null,
    loadMoreBtn: null,
    statsBar: null
};

// ============================================================================
// Initialization
// ============================================================================

function init() {
    cacheElements();
    loadTheme();
    loadFavorites();
    setupEventListeners();
    loadData();
}

function cacheElements() {
    elements.loading = document.getElementById('loading');
    elements.error = document.getElementById('error');
    elements.errorMessage = document.getElementById('error-message');
    elements.cardsContainer = document.getElementById('cards-container');
    elements.updateTime = document.getElementById('update-time');
    elements.tabButtons = document.querySelectorAll('.tab-button');
    elements.searchInput = document.getElementById('search-input');
    elements.sortSelect = document.getElementById('sort-select');
    elements.viewsFilter = document.getElementById('views-filter');
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.favoritesToggle = document.getElementById('favorites-toggle');
    elements.loadMoreBtn = document.getElementById('load-more');
    elements.statsBar = document.getElementById('stats-bar');
}

// ============================================================================
// Data Loading with Cache
// ============================================================================

async function loadData() {
    showLoading();
    hideError();
    
    try {
        // Try cache first
        const cached = getCachedData();
        if (cached) {
            console.log('✅ Loading from cache');
            state.allVideos = cached.data;
            updateUI();
            return;
        }
        
        // Fetch fresh data
        console.log('🔍 Fetching fresh data...');
        const response = await fetch(CONFIG.DATA_URL);
        
        if (!response.ok) {
            throw new Error('無法載入影片資料');
        }
        
        const data = await response.json();
        state.allVideos = data;
        
        // Cache the data
        cacheData(data);
        
        updateUI();
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function getCachedData() {
    try {
        const cached = localStorage.getItem(CONFIG.CACHE_KEY);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CONFIG.CACHE_DURATION) {
            console.log(`📦 Cache hit (age: ${(age / 1000 / 60).toFixed(1)} minutes)`);
            return { data };
        }
        
        console.log('⏰ Cache expired');
        return null;
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
}

function cacheData(data) {
    try {
        const cacheObject = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cacheObject));
        console.log('💾 Data cached successfully');
    } catch (error) {
        console.error('Cache write error:', error);
    }
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
    // Region tabs
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => handleRegionChange(button.dataset.region));
    });
    
    // Search with debounce
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Sort
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', handleSort);
    }
    
    // Filter
    if (elements.viewsFilter) {
        elements.viewsFilter.addEventListener('change', handleFilter);
    }
    
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Favorites toggle
    if (elements.favoritesToggle) {
        elements.favoritesToggle.addEventListener('click', toggleFavoritesView);
    }
    
    // Load more
    if (elements.loadMoreBtn) {
        elements.loadMoreBtn.addEventListener('click', loadMoreVideos);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// ============================================================================
// Theme Management
// ============================================================================

function loadTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    state.darkMode = savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    applyTheme();
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    applyTheme();
    localStorage.setItem(CONFIG.THEME_KEY, state.darkMode ? 'dark' : 'light');
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
    if (elements.themeToggle) {
        elements.themeToggle.textContent = state.darkMode ? '☀️' : '🌙';
        elements.themeToggle.setAttribute('aria-label', state.darkMode ? '切換到亮色模式' : '切換到深色模式');
    }
}

// ============================================================================
// Favorites Management
// ============================================================================

function loadFavorites() {
    try {
        const saved = localStorage.getItem(CONFIG.FAVORITES_KEY);
        if (saved) {
            state.favorites = new Set(JSON.parse(saved));
            console.log(`⭐ Loaded ${state.favorites.size} favorites`);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

function saveFavorites() {
    try {
        localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify([...state.favorites]));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

function toggleFavorite(videoId, event) {
    event.stopPropagation();
    
    if (state.favorites.has(videoId)) {
        state.favorites.delete(videoId);
    } else {
        state.favorites.add(videoId);
    }
    
    saveFavorites();
    updateFavoriteButton(videoId);
    updateStatsBar();
}

function updateFavoriteButton(videoId) {
    const button = document.querySelector(`[data-video-id="${videoId}"] .favorite-btn`);
    if (button) {
        const isFavorite = state.favorites.has(videoId);
        button.textContent = isFavorite ? '⭐' : '☆';
        button.classList.toggle('active', isFavorite);
    }
}

function toggleFavoritesView() {
    const showingFavorites = elements.favoritesToggle.classList.contains('active');
    
    if (!showingFavorites && state.favorites.size === 0) {
        showNotification('還沒有收藏任何影片');
        return;
    }
    
    elements.favoritesToggle.classList.toggle('active');
    updateUI();
}

// ============================================================================
// Search, Sort, Filter
// ============================================================================

function handleSearch(event) {
    state.searchQuery = event.target.value.toLowerCase().trim();
    resetDisplay();
    applyFiltersAndRender();
}

function handleSort(event) {
    state.sortBy = event.target.value;
    applyFiltersAndRender();
}

function handleFilter(event) {
    state.filterViews = event.target.value;
    resetDisplay();
    applyFiltersAndRender();
}

function handleRegionChange(region) {
    if (region === state.currentRegion) return;
    
    state.currentRegion = region;
    updateActiveTab();
    resetDisplay();
    applyFiltersAndRender();
}

function resetDisplay() {
    state.displayedVideos = [];
    elements.cardsContainer.innerHTML = '';
}

// ============================================================================
// Filtering and Sorting Logic
// ============================================================================

function applyFiltersAndRender() {
    let videos = getVideosForCurrentView();
    
    // Apply search
    if (state.searchQuery) {
        videos = videos.filter(v => 
            v.title.toLowerCase().includes(state.searchQuery) ||
            v.channel.toLowerCase().includes(state.searchQuery)
        );
    }
    
    // Apply views filter
    if (state.filterViews !== 'all') {
        const min = parseInt(state.filterViews);
        videos = videos.filter(v => parseInt(v.views) >= min);
    }
    
    // Apply sort
    videos = sortVideos(videos);
    
    state.filteredVideos = videos;
    renderInitialVideos();
    updateStatsBar();
}

function getVideosForCurrentView() {
    const showingFavorites = elements.favoritesToggle?.classList.contains('active');
    
    if (showingFavorites) {
        // Get all favorite videos from all regions
        const allRegionVideos = [];
        Object.values(state.allVideos).forEach((regionVideos, index) => {
            if (Array.isArray(regionVideos)) {
                regionVideos.forEach(v => {
                    if (state.favorites.has(v.videoId)) {
                        allRegionVideos.push({...v, region: Object.keys(state.allVideos)[index]});
                    }
                });
            }
        });
        return allRegionVideos;
    }
    
    return state.allVideos[state.currentRegion] || [];
}

function sortVideos(videos) {
    const sorted = [...videos];
    
    switch (state.sortBy) {
        case 'views':
            return sorted.sort((a, b) => parseInt(b.views) - parseInt(a.views));
        case 'likes':
            return sorted.sort((a, b) => parseInt(b.likeCount || 0) - parseInt(a.likeCount || 0));
        case 'comments':
            return sorted.sort((a, b) => parseInt(b.commentCount || 0) - parseInt(a.commentCount || 0));
        case 'recent':
            return sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        case 'rank':
        default:
            return sorted; // Keep original order
    }
}

// ============================================================================
// Rendering with Lazy Loading
// ============================================================================

function renderInitialVideos() {
    const videosToLoad = state.filteredVideos.slice(0, CONFIG.INITIAL_LOAD);
    videosToLoad.forEach((video, index) => {
        const card = createVideoCard(video, index + 1);
        elements.cardsContainer.appendChild(card);
    });
    
    state.displayedVideos = videosToLoad;
    updateLoadMoreButton();
    setupIntersectionObserver();
}

function loadMoreVideos() {
    const currentCount = state.displayedVideos.length;
    const nextVideos = state.filteredVideos.slice(
        currentCount, 
        currentCount + CONFIG.LOAD_MORE
    );
    
    nextVideos.forEach((video, index) => {
        const card = createVideoCard(video, currentCount + index + 1);
        elements.cardsContainer.appendChild(card);
    });
    
    state.displayedVideos.push(...nextVideos);
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    if (!elements.loadMoreBtn) return;
    
    const hasMore = state.displayedVideos.length < state.filteredVideos.length;
    elements.loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    
    if (hasMore) {
        const remaining = state.filteredVideos.length - state.displayedVideos.length;
        elements.loadMoreBtn.textContent = `載入更多 (${remaining} 支影片)`;
    }
}

// ============================================================================
// Intersection Observer for Images
// ============================================================================

function setupIntersectionObserver() {
    if (state.observerInitialized) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    state.observerInitialized = true;
}

// ============================================================================
// Video Card Creation
// ============================================================================

function createVideoCard(video, rank) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-video-id', video.videoId);
    
    const isFavorite = state.favorites.has(video.videoId);
    const thumbnail = video.thumbnail;
    const views = formatNumber(video.views);
    const likes = formatNumber(video.likeCount || 0);
    const comments = formatNumber(video.commentCount || 0);
    
    card.innerHTML = `
        <div class="thumbnail-container">
            <img class="thumbnail" 
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3C/svg%3E"
                 data-src="${thumbnail}" 
                 alt="${escapeHtml(video.title)}"
                 loading="lazy">
            <div class="rank-badge">#${rank}</div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                    onclick="toggleFavorite('${video.videoId}', event)"
                    aria-label="${isFavorite ? '取消收藏' : '加入收藏'}">
                ${isFavorite ? '⭐' : '☆'}
            </button>
        </div>
        <div class="card-content">
            <h3 class="video-title">${escapeHtml(video.title)}</h3>
            <div class="channel-name">
                <span class="channel-icon">📺</span>
                <span>${escapeHtml(video.channel)}</span>
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
                <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span>${comments}</span>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.favorite-btn')) {
            openVideo(video.videoId);
        }
    });
    
    return card;
}

// ============================================================================
// UI Updates
// ============================================================================

function updateUI() {
    updateActiveTab();
    applyFiltersAndRender();
    
    if (state.allVideos.lastUpdated) {
        updateTimestamp(state.allVideos.lastUpdated);
    }
}

function updateActiveTab() {
    elements.tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.region === state.currentRegion);
    });
}

function updateStatsBar() {
    if (!elements.statsBar) return;
    
    const total = state.filteredVideos.length;
    const displayed = state.displayedVideos.length;
    const favorites = state.favorites.size;
    
    elements.statsBar.textContent = `顯示 ${displayed} / ${total} 支影片 | 收藏 ${favorites} 支`;
}

function updateTimestamp(isoString) {
    if (!elements.updateTime) return;
    
    const date = new Date(isoString);
    const timeString = date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    elements.updateTime.textContent = timeString;
}

// ============================================================================
// Utility Functions
// ============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatNumber(num) {
    num = parseInt(num) || 0;
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

function showLoading() {
    if (elements.loading) elements.loading.style.display = 'flex';
    if (elements.cardsContainer) elements.cardsContainer.style.opacity = '0.5';
}

function hideLoading() {
    if (elements.loading) elements.loading.style.display = 'none';
    if (elements.cardsContainer) elements.cardsContainer.style.opacity = '1';
}

function showError(message) {
    if (elements.error) elements.error.style.display = 'block';
    if (elements.errorMessage) elements.errorMessage.textContent = message;
}

function hideError() {
    if (elements.error) elements.error.style.display = 'none';
}

function showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

function handleKeyboard(event) {
    // Ctrl/Cmd + K: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        elements.searchInput?.focus();
    }
    
    // Ctrl/Cmd + D: Toggle theme
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
    }
    
    // Ctrl/Cmd + F: Toggle favorites
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        toggleFavoritesView();
    }
}

// ============================================================================
// Initialize
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.YT_STATE = state;
window.YT_CONFIG = CONFIG;
