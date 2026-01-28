# GitHub Pages 部署指南

## 📋 部署前檢查清單

- [ ] 已取得 YouTube Data API Key
- [ ] 已在 `script.js` 中設定 API Key
- [ ] 已測試本地運行無誤
- [ ] 已建立 GitHub 帳號

## 🚀 部署步驟

### 步驟 1：建立 GitHub 倉庫

1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 `+` > `New repository`
3. 填寫倉庫資訊：
   - Repository name: `youtube-trending`（或任何你喜歡的名稱）
   - Description: `YouTube 熱門影片展示網站 - Arc Browser 風格`
   - 選擇 `Public`（GitHub Pages 免費版需要公開倉庫）
   - **不要** 勾選 "Initialize this repository with a README"
4. 點擊 `Create repository`

### 步驟 2：上傳專案檔案

有兩種方式可以上傳檔案：

#### 方式 A：使用 Git 指令（推薦）

```bash
# 1. 初始化 Git 倉庫
git init

# 2. 建立 .gitignore 檔案
cat > .gitignore << 'EOF'
.DS_Store
.vscode/
.idea/
node_modules/
*.log
EOF

# 3. 加入所有檔案
git add .

# 4. 提交變更
git commit -m "Initial commit: YouTube trending website with Arc Browser style"

# 5. 設定遠端倉庫（替換 YOUR_USERNAME 為你的 GitHub 使用者名稱）
git remote add origin https://github.com/YOUR_USERNAME/youtube-trending.git

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

#### 方式 B：使用 GitHub 網頁上傳

1. 在新建立的倉庫頁面，點擊 `uploading an existing file`
2. 將所有專案檔案拖曳到上傳區域：
   - index.html
   - styles.css
   - script.js
   - sw.js
   - manifest.json
   - README.md
3. 填寫 Commit message: `Initial commit`
4. 點擊 `Commit changes`

### 步驟 3：啟用 GitHub Pages

1. 在你的倉庫頁面，點擊 `Settings`
2. 在左側選單找到 `Pages`
3. 在 "Source" 區域：
   - Branch: 選擇 `main`
   - Folder: 選擇 `/ (root)`
4. 點擊 `Save`
5. 等待 1-2 分鐘，頁面會顯示你的網站網址：
   ```
   Your site is live at https://YOUR_USERNAME.github.io/youtube-trending/
   ```

### 步驟 4：設定自訂網域（選用）

如果你有自己的網域：

1. 在 GitHub Pages 設定頁面的 "Custom domain" 欄位輸入你的網域
2. 在你的網域 DNS 設定中加入 CNAME 記錄：
   ```
   CNAME: YOUR_USERNAME.github.io
   ```
3. 等待 DNS 生效（可能需要幾分鐘到幾小時）

## 🔧 設定 API Key

**重要：** 請確保在部署前已設定 API Key！

1. 開啟 `script.js`
2. 找到以下程式碼：
   ```javascript
   const CONFIG = {
       API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE',
       // ...
   };
   ```
3. 將 `YOUR_YOUTUBE_API_KEY_HERE` 替換為你的實際 API Key
4. 儲存檔案並重新推送到 GitHub

## ⚠️ 安全性注意事項

### API Key 保護建議

由於這是純前端專案，API Key 會暴露在客戶端。建議採取以下措施：

1. **在 Google Cloud Console 限制 API Key 使用範圍：**
   - 設定 HTTP referrer 限制（只允許你的網域）
   - 只啟用 YouTube Data API v3
   - 設定每日配額限制

2. **監控 API 使用量：**
   - 定期檢查 Google Cloud Console 的 API 使用統計
   - 設定配額警告通知

3. **進階方案（推薦用於生產環境）：**
   - 建立後端 API proxy 隱藏 API Key
   - 使用無伺服器函數（如 Netlify Functions、Vercel Serverless）
   - 實作 rate limiting 防止濫用

## 🔄 更新部署

當你修改程式碼後，重新部署很簡單：

```bash
# 1. 加入修改的檔案
git add .

# 2. 提交變更
git commit -m "Update: 描述你的更改"

# 3. 推送到 GitHub
git push
```

GitHub Pages 會自動偵測更新並重新部署（通常 1-2 分鐘內完成）。

## 🐛 常見問題排解

### 問題 1：網站顯示 404 錯誤

**解決方案：**
- 確認 GitHub Pages 設定中選擇了正確的 branch 和資料夾
- 確認倉庫是公開的（Public）
- 等待幾分鐘讓 GitHub Pages 完成部署

### 問題 2：API 請求失敗（403 錯誤）

**解決方案：**
- 檢查 API Key 是否正確設定
- 確認 API Key 沒有 HTTP referrer 限制，或已正確設定網域白名單
- 檢查 YouTube Data API v3 是否已啟用
- 確認未超過 API 配額限制

### 問題 3：影片無法載入

**解決方案：**
- 開啟瀏覽器開發者工具（F12）查看 Console 錯誤訊息
- 確認 API Key 設定正確
- 檢查網路連線

### 問題 4：Service Worker 無法運作

**解決方案：**
- Service Worker 只在 HTTPS 或 localhost 上運作
- GitHub Pages 自動提供 HTTPS，確認使用 https:// 開頭的網址
- 清除瀏覽器快取並重新載入

## 📊 監控與分析（選用）

### 加入 Google Analytics

在 `index.html` 的 `<head>` 標籤中加入：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎉 完成！

你的 YouTube 熱門影片網站現在已經上線了！

訪問網址：`https://YOUR_USERNAME.github.io/youtube-trending/`

---

需要協助？歡迎開 Issue 或查看專案的 README.md 文件。
