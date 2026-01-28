# YouTube 熱門影片展示網站

一個具有 Arc Browser 風格設計的 YouTube 熱門影片展示網站，支援台灣和美國地區的每日熱門影片瀏覽。

![YouTube Trending](https://img.shields.io/badge/YouTube-Trending-red?style=for-the-badge&logo=youtube)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-ff69b4?style=for-the-badge)

## ✨ 特色功能

- 🎨 **Arc Browser 風格設計** - 圓角、毛玻璃效果、柔和配色
- 🌍 **雙地區支援** - 台灣 🇹🇼 與美國 🇺🇸 熱門影片
- 📅 **日期選擇器** - 可選擇特定日期查看熱門影片
- 🖼️ **WebP 圖片優化** - 自動轉換為 WebP 格式，提升載入速度
- 📱 **響應式設計** - 完美支援手機、平板和桌面設備
- ⚡ **Service Worker** - 離線支援與快取優化
- 🎯 **卡片式佈局** - 清晰展示影片資訊

## 🚀 快速開始

### 前置需求

1. 取得 YouTube Data API Key：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 建立新專案或選擇現有專案
   - 啟用 YouTube Data API v3
   - 建立 API 憑證（API Key）

### 設定步驟

1. **Clone 此專案**
   ```bash
   git clone https://github.com/YOUR_USERNAME/youtube-trending.git
   cd youtube-trending
   ```

2. **設定 API Key**
   
   開啟 `script.js` 檔案，找到以下行並替換為你的 API Key：
   ```javascript
   API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE',
   ```

3. **本地測試**
   
   使用任何本地伺服器運行（因為 Service Worker 需要 HTTPS 或 localhost）：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js 的 http-server
   npx http-server
   ```
   
   然後開啟瀏覽器訪問 `http://localhost:8000`

4. **部署到 GitHub Pages**
   
   - 推送代碼到 GitHub
   - 到 Repository Settings > Pages
   - 選擇 Source: `main` branch 和 `/` (root)
   - 點擊 Save
   - 網站將在幾分鐘後部署完成

## 📁 專案結構

```
youtube-trending/
├── index.html          # 主要 HTML 結構
├── styles.css          # Arc Browser 風格樣式
├── script.js           # JavaScript 功能邏輯
├── sw.js              # Service Worker（快取與 WebP 優化）
├── manifest.json      # PWA 設定檔
├── README.md          # 專案說明文件
└── .gitignore         # Git 忽略檔案
```

## 🎨 設計特色

### Arc Browser 風格元素

- **毛玻璃效果（Backdrop Blur）** - 半透明背景與模糊效果
- **柔和配色** - 深色主題搭配紫色強調色 (#7c5cff)
- **圓角設計** - 所有元素使用圓角（8px - 24px）
- **懸停動畫** - 卡片懸停時的平滑上升效果
- **漸層背景** - 深色漸層背景營造現代感

## 🔧 技術棧

- **HTML5** - 語義化結構
- **CSS3** - Flexbox、Grid、Backdrop Filter
- **Vanilla JavaScript** - 無框架依賴
- **YouTube Data API v3** - 熱門影片資料
- **Service Worker** - PWA 功能與快取
- **WebP** - 圖片格式優化

## 📊 功能說明

### 影片卡片資訊
- 排名徽章（1-5）
- 影片縮圖（自動優化為 WebP）
- 影片標題
- 頻道名稱
- 觀看次數與按讚數
- 影片時長
- 影片描述預覽

### 互動功能
- 點擊卡片開啟 YouTube 影片（新分頁）
- 切換地區（台灣/美國）
- 選擇日期查看歷史熱門影片
- 載入狀態顯示
- 錯誤訊息提示

## 🌐 瀏覽器支援

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 授權

MIT License

## 🙏 致謝

- YouTube Data API
- Arc Browser 設計靈感
- Google Fonts

## 📮 聯絡方式

如有問題或建議，歡迎開 Issue 或 Pull Request！

---

Made with ❤️ by [Your Name]
