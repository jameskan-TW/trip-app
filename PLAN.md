# 東北賞櫻之旅 2026 — 專案說明

## 專案概述

給 6 人旅行團使用的 **PWA 旅行協調 App**，部署為單一靜態 HTML 檔。免下載、免帳號，分享連結即可使用。

- **行程**：2026 年 4 月 15–22 日（8 天 7 夜）
- **路線**：仙台 → 平泉 / 北上 → 青森 → 弘前 → 松島 → 仙台泉 → 仙台
- **成員**：鄭婷宇、蔡東霖、鄭婷任、黃雪華、蔡東庭、陳燕芬

---

## 檔案結構

```
trip-app/
├── index.html          ← 整個 App（CSS + HTML + JS 全在一個檔案）
├── manifest.json       ← PWA manifest（圖示、名稱、顏色）
├── sw.js               ← Service Worker（離線快取 + 集合鬧鐘通知）
├── product-positioning.md  ← 產品定位、商業模式、費米推估文件
└── PLAN.md             ← 本文件
```

> **重要**：`index.html` 是唯一需要修改的主要檔案（目前 ~111 KB）。CSS、HTML 結構、所有 JS 邏輯全部在同一個檔案內，依照 `/* ─── 區塊名稱 ─── */` 分段。

---

## index.html 內部結構（依區塊順序）

| 行數區間 | 區塊 | 說明 |
|---|---|---|
| 1–14 | `<head>` | PWA meta、Firebase SDK CDN 引入 |
| 15–960 | `<style>` | 全部 CSS（CSS 變數、RWD、元件樣式） |
| 961–969 | 集合橫幅 HTML | `#meeting-banner`，Firebase 有資料時顯示 |
| 970–985 | 主畫面 HTML | `#app-content`，5 個 tab panel |
| 986–1010 | 底部 nav HTML | 5 個 tab 按鈕 |
| 1011–1226 | 靜態資料常數 | `DAYS`、`HOTELS`、`RESTAURANTS`、`MEMBERS`、`CHECKLIST`、`PRESET_SHOPPING` |
| 1227–1243 | Firebase 設定 | `FIREBASE_CONFIG`、DB 路徑常數 |
| 1244–1305 | App State | 全部 `let` 狀態變數 |
| 1306–1360 | Firebase 初始化 | `initFirebase()`，監聽 meeting / messages / expenses |
| 1361–1620 | 工具函式 | `switchTab()`、`toggleDay()`、`scrollToTodayCard()`、地圖 URL、日期工具 |
| 1620–1737 | 天氣 | `WEATHER_LOCS`、`loadWeatherStrip()`（Open-Meteo API） |
| 1738–1878 | Render: 行程 | `renderItinerary()`，含天氣 strip HTML |
| 1879–1964 | Render: 打包清單 | `renderChecklist()`、`renderPacking()` |
| 1965–2068 | 購物清單邏輯 | `addShopping()`、`toggleShopping()`、`deleteShopping()`、`saveEditShopping()` |
| 2069–2170 | 購物：相片工具 | `openPendingPhotoPicker()`、`openPhotoPicker()`、`compressImage()`、`viewPhoto()` |
| 2171–2265 | Render: 購物清單 | `renderShopping()` |
| 2266–2460 | Render: 集合通知 | `renderMeeting()`、`renderMessages()` |
| 2461–2830 | Render: 費用分帳 | `renderExpenses()`、`renderExpenseForm()`、結算邏輯 |
| 2830–2837 | 初始化 | `renderItinerary()`、`renderChecklist()`、`initFirebase()`、`initFontSize()` |

---

## 資料儲存架構

### localStorage（各裝置獨立）

| Key | 內容 |
|---|---|
| `tohoku2026-checked` | 打包清單已勾選項目（Set → JSON array） |
| `tohoku2026-custom-check-v1` | 自訂打包項目 |
| `tohoku2026-shopping-v1` | 個人購物清單（每裝置獨立，不跨用戶同步） |
| `tohoku2026-shopping-init-v1` | 是否已初始化購物預設項目的旗標 |
| `tohoku2026-font-size` | 字體大小偏好（`sm` / `md` / `lg`） |
| `messageName` | 留言時記住的名字 |
| `meetingName` | 設定集合時記住的名字 |

### Firebase Realtime Database（跨裝置即時同步）

| 路徑 | 內容 |
|---|---|
| `tohoku2026/meeting` | 目前集合時間（單一物件） |
| `tohoku2026/messages` | 群組留言（push 鍵值） |
| `tohoku2026/expenses` | 費用記帳（push 鍵值） |

> **注意**：購物清單已從 Firebase 改為純 localStorage，各用戶資料不互通。

---

## 外部服務

| 服務 | 用途 | 費用 |
|---|---|---|
| Firebase Realtime DB | 集合、留言、費用即時同步 | 免費（Spark plan） |
| Open-Meteo API | 8 天天氣預報 | 免費，無需 API key |
| Google Maps（連結跳轉） | 地圖按鈕 | 免費（只是 URL scheme） |

**Firebase 專案**：`aomori-travel-988ca`（Asia-Southeast1）

---

## 已完成的修改（本次開發紀錄）

### 天氣預報
- **Day 7 改顯示仙台泉天氣**：`WEATHER_LOCS["4/21"]` 改為仙台泉座標（38.32°N 140.88°E），加入 `fallbackKey: "sendai"` 機制，若 API 無資料則 fallback 到仙台

### 行程展開
- **展開行程不再跳回頂部**：`toggleDay()` 改為直接操作 `card.classList.toggle("open")`，完全不呼叫 `renderItinerary()`，避免觸發 `scrollToTodayCard()` 與天氣重新 loading
- 每個 day card 加入 `data-day="${d.day}"` 屬性供 DOM 選取

### 清單 Tab
- **移除 sticky**：`.checklist-tabs` 的 `position: sticky; top: 0; z-index: 10` 已移除

### 購物清單
- **改為各裝置獨立**：移除 Firebase `SHOP_PATH` listener，所有購物操作改為純 localStorage
- **新增項目支援上傳相片**：新增 `pendingShoppingPhotos` 狀態、`openPendingPhotoPicker()`、`deletePendingPhoto()`，新增表單加入 📷 按鈕與縮圖預覽
- **刪除按鈕移至編輯模式**：一般檢視只顯示 ✏️，進入編輯後才出現「🗑 刪除此項目」（全寬紅色按鈕，需 confirm 確認）
- **編輯模式支援修改購買地點**：`saveEditShopping()` 同時儲存 `text` 和 `location`
- **移除 4 個預設項目**：牛舌、刺繡工藝小物、玻璃紀念品、木娃娃；加入一次性 localStorage 清理邏輯，舊裝置開啟時自動移除

---

## Deploy 方式

單一靜態檔案，直接上傳 `index.html` + `manifest.json` + `sw.js` 即可。

**部署前 checklist**：
- [ ] Firebase 設定（`FIREBASE_CONFIG`）已填入正確值
- [ ] `sw.js` cache key（目前 `tohoku2026-v6`）升版（見下方說明）
- [ ] 確認 `DAYS` 資料、`HOTELS`、`RESTAURANTS` 內容正確

### ⚠️ 部署後手機沒更新？Service Worker 快取問題

PWA 會把 `index.html` 快取在手機上，即使重新部署，手機仍會讀舊版。

**每次部署前，必須把 `sw.js` 第一行的版號加一：**

```js
// 部署前改這裡，例如 v6 → v7
const CACHE = "tohoku2026-v7";
```

瀏覽器偵測到 `sw.js` 有變動，就會自動清掉舊快取、下載新版。

用戶端若還是看到舊版：關掉所有分頁 → 重新開啟連結。

---

## 待處理 / 未來可改善

- [ ] 購物清單相片目前存在 localStorage（base64），項目多時可能超出儲存限制（約 5 MB），未來可考慮改用 Firebase Storage
- [ ] Service Worker 快取問題已知解法：每次部署前升版 `sw.js` 的 `CACHE` 版號（已記錄在部署 checklist）
- [ ] 打包清單的自訂項目目前只能編輯文字，可考慮支援刪除確認（避免誤刪）
