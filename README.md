# 🌸 旅行協調 PWA

給多人旅行團使用的即時協調工具。免下載、免帳號，分享連結即可使用。

**目前行程：東北賞櫻之旅 2026**　仙台・平泉・青森・弘前・松島　2026/4/15–22

---

## 功能

| 功能 | 說明 |
|---|---|
| 🌡 天氣預報 | 每天對應地點的 8 日天氣（Open-Meteo，自動更新） |
| 📅 行程總覽 | 每日活動、住宿、餐廳、停車資訊，可展開瀏覽 |
| 🔔 集合倒數 | 任一成員設定集合時間，所有人手機同步顯示倒數計時 |
| 💬 群組留言 | 依日期留言，可編輯刪除 |
| 💰 費用分帳 | 多幣別記帳，自動計算最優還款路徑 |
| 🎒 打包清單 | 個人本地勾選，支援自訂項目 |
| 🛍️ 購物清單 | 預設伴手禮清單，支援照片與購買地點，各裝置獨立 |

---

## 技術架構

- **單一 HTML 檔**（CSS + HTML + JS 全在 `index.html`）
- **PWA**：可加入主畫面，離線瀏覽基本行程資訊
- **Firebase Realtime Database**：集合通知、群組留言、費用分帳即時同步
- **localStorage**：打包清單、購物清單（各裝置獨立）
- **Open-Meteo API**：免費天氣預報，無需 API key

```
trip-app/
├── index.html          # 主程式（唯一需要修改的檔案）
├── manifest.json       # PWA 設定
├── sw.js               # Service Worker（離線快取 + 集合鬧鐘）
├── PLAN.md             # 專案結構與開發紀錄
└── product-positioning.md
```

---

## 套用到新行程

> 重構進行中。未來計畫將行程資料獨立為 `trip-data.js`，新行程只需替換資料檔。

目前做法：複製此 repo，修改 `index.html` 內的以下常數（集中在約 1011–1305 行）：

```
DAYS              每天活動、飯店、停車場
HOTELS            住宿清單
RESTAURANTS       建議餐廳
MEMBERS           成員名稱與 emoji
CHECKLIST         打包清單
PRESET_SHOPPING   購物預設清單
WEATHER_LOCS      各日天氣查詢地點
FIREBASE_CONFIG   Firebase 專案設定
```

---

## Firebase 設定（集合 / 留言 / 費用功能需要）

1. 前往 [console.firebase.google.com](https://console.firebase.google.com) 建立新專案（免費）
2. 建立 Realtime Database（選 Asia-Southeast1）
3. 規則改為：
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
4. 將專案設定填入 `index.html` 的 `FIREBASE_CONFIG`

不設定 Firebase 仍可使用行程、天氣、打包清單、購物清單功能。

---

## 部署

純靜態檔案，上傳 `index.html` + `manifest.json` + `sw.js` 即可。

推薦平台：GitHub Pages、Netlify、Cloudflare Pages（皆免費）
