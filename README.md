# 花蓮縣復康巴士預約系統

> Hualien County Rehabilitation Bus Booking System
> 軟體工程課程作業（110 年度）— 花蓮縣政府委託無障礙交通預約管理系統

民眾前台 + 後端 API 實作。乘客可線上預約復康巴士、即時追蹤車輛位置、提交意見回饋；家屬可代為申辦帳號。

---

## 目錄 / Table of Contents

- [專案簡介](#專案簡介--overview)
- [技術堆疊](#技術堆疊--tech-stack)
- [快速開始](#快速開始--quick-start)
- [環境變數](#環境變數--environment-variables)
- [常用指令](#常用指令--scripts)
- [專案結構](#專案結構--project-structure)
- [API 路由](#api-路由--api-routes)
- [業務規則](#業務規則--business-rules)
- [資料庫模型](#資料庫模型--database-models)
- [測試](#測試--testing)
- [無障礙](#無障礙--accessibility)

---

## 專案簡介 / Overview

本專案為花蓮縣政府委託開發的**無障礙交通預約管理系統**，目標為服務行動不便者預約復康巴士。

**實作範圍：**
- 民眾使用者前台（登入、註冊、預約、追蹤、回饋、公告）
- 後端 API（認證、預約、派遣查詢、個人資料、文件管理）

**不在實作範圍：** 後台調度員介面、司機端 App、稽核管理系統。

---

## 技術堆疊 / Tech Stack

| 層面 | 技術 |
|------|------|
| 前端框架 | **Next.js 14** (App Router) + **React 18** + **TypeScript 5** |
| 樣式 | **Tailwind CSS 3** |
| 表單 | **React Hook Form** + **Zod** |
| 伺服器狀態 | **TanStack Query 5** |
| 用戶端狀態 | **Zustand** |
| ORM | **Prisma 5** (Microsoft SQL Server) |
| 認證 | **JWT** (jose) + **bcryptjs** + httpOnly cookie |
| Email | **Nodemailer** (SMTP) |
| 地圖 | **Leaflet** + **OpenStreetMap** |
| 防機器人 | **內建數學驗證碼**（JWT-簽署） |
| 單元測試 | **Jest** + **Testing Library** + **MSW** |
| E2E 測試 | **Playwright** + **@axe-core/playwright** |

---

## 快速開始 / Quick Start

### 環境要求

- **Node.js** ≥ 18.17 (Next.js 14 最低要求)
- **npm** ≥ 9
- **Microsoft SQL Server** (連線資訊請洽專案管理員)
- **PowerShell** 7+（Windows 開發環境，使用 `start.ps1` / `stop.ps1`）

### 步驟

```powershell
# 1. 安裝依賴
npm install

# 2. 從範本建立 .env 並填入實際值（詳見下方「環境變數」章節）
Copy-Item .env.example .env
#    至少需要填入 DATABASE_URL 與 JWT_SECRET 才能啟動

# 3. 產生 Prisma Client
npm run db:generate

# 4. （可選）建立測試帳號
npm run db:seed
#    預設帳號：testuser / Password123

# 5. 啟動開發伺服器（含自動 port 清理與瀏覽器開啟）
./start.ps1

# 或手動啟動
npm run dev
```

開啟瀏覽器至 [http://localhost:3000](http://localhost:3000)。

停止伺服器：
```powershell
./stop.ps1
```

---

## 環境變數 / Environment Variables

在專案根目錄建立 `.env`，**請勿提交至版控**（已列在 `.gitignore`）。

```env
# SQL Server 連線字串
DATABASE_URL="sqlserver://<host>:<port>;database=<db>;user=<user>;password=<password>;encrypt=false;trustServerCertificate=true"

# JWT 簽署密鑰（同時用於使用者 cookie、密碼重設 token、驗證碼 challenge token）
# 產生方式：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="<random-32-bytes-hex>"

# SMTP 設定（開發期間可留空，系統會 console 模擬寄信）
EMAIL_HOST=""
EMAIL_PORT="587"
EMAIL_USER=""
EMAIL_PASS=""
```

### 機器人防護

採自製數學驗證碼（例 `3 + 5 = ?`），透過 `GET /api/captcha` 取得題目與 JWT challenge token，使用者答題後以 `userAnswer:challengeToken` 格式回傳給 `POST /api/bookings` 驗證。共用 `JWT_SECRET`，無需額外設定金鑰。

---

## 專案結構 / Project Structure

```
.
├── prisma/
│   ├── schema.prisma         # Prisma data model (17 個 models)
│   └── seed.ts               # 種子資料（測試帳號 testuser）
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # 未登入區塊：login / register / forgot-password / reset-password / verify-email
│   │   ├── (main)/           # 已登入區塊：bookings / profile / announcements / feedback
│   │   ├── api/              # Server Route Handlers
│   │   │   ├── auth/         # 認證 API
│   │   │   ├── bookings/     # 預約 CRUD + captcha + GPS 追蹤
│   │   │   ├── announcements/
│   │   │   ├── feedback/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx          # 首頁
│   │
│   ├── components/
│   │   ├── ui/               # Button / Input / Card / FormField 等基礎元件
│   │   ├── forms/            # LoginForm / RegisterForm（3 步驟）
│   │   ├── booking/          # BookingForm / BookingList / BookingCard
│   │   ├── announcement/
│   │   ├── feedback/
│   │   ├── layout/           # Header / Footer / Container
│   │   └── providers/        # QueryClientProvider 等
│   │
│   ├── hooks/                # useAuth / useBookings / useVehicleTracking
│   │
│   ├── lib/
│   │   ├── api/              # 共用 apiFetch client + ApiError
│   │   ├── auth/             # jwt / password / captcha / middleware
│   │   ├── email/            # mailer + templates
│   │   ├── store/            # Zustand stores (auth.store)
│   │   ├── validators/       # Zod schemas（register / booking / feedback）
│   │   ├── utils/            # mask / cn 等小工具
│   │   └── db.ts             # Prisma Client singleton
│   │
│   └── middleware.ts         # Next.js middleware：JWT 路由保護
│
├── e2e/                      # Playwright 測試
├── start.ps1                 # 啟動腳本（檢查環境、清 port、開瀏覽器）
├── stop.ps1                  # 停止腳本（終止 port 3000–3010）
├── jest.config.ts
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## API 路由 / API Routes

所有 `/api/*` 路由皆以 JWT (httpOnly cookie) 認證，公開路徑除外。

### 認證 Auth

| Method | Route | 說明 |
|--------|-------|------|
| `POST` | `/api/auth/register` | 註冊（3 步驟整合提交） |
| `POST` | `/api/auth/login` | 登入，回傳 httpOnly cookie |
| `POST` | `/api/auth/logout` | 登出，清除 cookie |
| `POST` | `/api/auth/forgot-password` | 寄送密碼重設連結（JWT stateless） |
| `POST` | `/api/auth/reset-password` | 用 JWT token 重設密碼 |
| `POST` | `/api/auth/verify-email` | 用 JWT token 驗證 email |

### 預約 Bookings

| Method | Route | 說明 |
|--------|-------|------|
| `GET` | `/api/bookings` | 個人預約列表（支援 status filter） |
| `POST` | `/api/bookings` | 建立預約（含 captcha 驗證） |
| `GET` | `/api/bookings/[id]` | 預約詳情 |
| `DELETE` | `/api/bookings/[id]` | 取消預約 |
| `GET` | `/api/bookings/[id]/track` | 取得派車車輛 GPS 位置（30 秒輪詢） |

### 驗證碼 Captcha

| Method | Route | 說明 |
|--------|-------|------|
| `GET` | `/api/captcha` | 取得數學題與 JWT challenge token（5 分鐘效期），供 `POST /api/bookings` 防機器人驗證 |

### 公告 Announcements

| Method | Route | 說明 |
|--------|-------|------|
| `GET` | `/api/announcements` | 公開公告列表（不需登入） |
| `GET` | `/api/announcements/[id]` | 公告詳情 |

### 個人資料與意見回饋

| Method | Route | 說明 |
|--------|-------|------|
| `GET` | `/api/profile` | 取得個人資料 + 月度統計 |
| `POST` | `/api/feedback` | 提交預約後的意見回饋（500 字內） |

---

## 業務規則 / Business Rules

| 規則 | 細節 |
|------|------|
| 預約時間範圍 | 最早**今天**，最晚**7 天**後 |
| 預約時段 | 08:00–17:00 **整點制**（日期 + 整點下拉） |
| 上車時段須晚於現在 | 即使日期是今天，所選時段也必須晚於目前時間（回 **422**） |
| 回程時段限制 | 勾選去回程時，回程時段須**晚於去程時段**且須晚於現在 |
| 同時有效預約上限 | **3 筆**（`BookingStatus IN (0,1,3,5)` 視為有效） |
| 取消預約 | 取消 24 小時內預約 → 標記**逾期**（無罰款） |
| 同時段衝突 | 同一乘客同 `PickupTime` 完全相同即擋（回 **409**） |
| 去回程 | 視為**兩筆獨立 Bookings**（前端迴圈 POST 兩次），`IsRoundTrip=true` 僅作標記 |
| 證明到期日 | 預約時若乘客 `ExpiryDate` 已過期，禁止預約（回 **403**） |
| 意見回饋字數 | ≤ 500 字 |
| 密碼重設 Token | 效期 **1 小時**（JWT stateless，不存 DB） |
| 家屬關係 | 本人 / 配偶 / 子女 / 父母 / 兄弟姐妹 / 祖父母 |
| 登入帳號 | 使用者自訂 `Username`，身分證字號僅於申請時驗 checksum + 唯一性 |

### 預約狀態碼

| Code | 狀態 | 含義 |
|------|------|------|
| `0` | 預約成功 | 預約已建立 |
| `1` | 排班完成 | 已派車與排班 |
| `2` | 取消 | 已取消 |
| `3` | 搭乘中 | 司機接送中 |
| `4` | 已完趟 | 行程完成 |
| `5` | 後補 | 候補狀態 |

> 有效預約：`BookingStatus IN (0, 1, 3, 5)`；歷史預約：`(2, 4)`。

---

## 資料庫模型 / Database Models

Prisma schema 共 **17 個 models**，主要分為：

### 帳號與權限

| Model | 說明 |
|-------|------|
| `Account` | 登入帳號（Username + PasswordHash + RoleID） |
| `Roles` | 1=系統管理員 / 2=調度員 / 3=司機 / **4=乘客** |
| `PassengerProfile` | 乘客資料（姓名、身分證、性別、Email、電話、輔具、審核狀態） |
| `Relationship` | 家屬代申請關係 |

### 預約與派遣

| Model | 說明 |
|-------|------|
| `Bookings` | 預約主表（時間、上下車地址、隨行人數、狀態） |
| `DispatchTasks` | 派遣任務（連結預約 ↔ 車輛 ↔ 司機 + ETA / 實際到達） |
| `Vehicle` | 車輛資訊 |
| `Driver` | 司機資訊 |
| `DispatchCenter` | 派遣中心 |

### 車輛運行

| Model | 說明 |
|-------|------|
| `GPSLogs` | GPS 軌跡（30 秒輪詢來源） |
| `DriverCheckLog` | 司機每日車況檢查 |
| `DrivingBehavior` | 駕駛行為（急煞、超速等） |
| `FuelLog` | 加油記錄 |

### 其他

| Model | 說明 |
|-------|------|
| `Announcement` | 公告 |
| `Feedback` | 意見回饋（1–5 星 + 評論） |
| `Messages` | 訊息系統 |


---

## 測試 / Testing

### 單元 + 整合測試 (Jest)

```powershell
npm run test
npm run test:coverage   # 產出覆蓋率報告於 coverage/
```

**目前狀態：** 20 個 test suites / 127 個 tests，全數通過。
**覆蓋率門檻：** 80%（於 `jest.config.ts` 設定）。

### E2E 測試 (Playwright)

```powershell
npm run test:e2e
```

涵蓋登入、註冊、預約建立與取消、即時追蹤、無障礙稽核（jest-axe）等關鍵流程。

### 重要 Mock 約定

- 測試環境會透過 `nextJest()` 自動載入 `.env`
- 預約 API 測試需 mock `@/lib/auth/captcha` 的 `verifyCaptcha`，避免在測試中真實簽署 / 驗證 JWT challenge token（見 `src/app/api/bookings/route.test.ts:17`）

---

## 無障礙 / Accessibility

通過 **WCAG 2.0 AA** 自動化稽核（jest-axe + axe-core/playwright）：

- 表單欄位皆有 `<label>` 與 `aria-required` / `aria-invalid` / `aria-describedby`
- 鍵盤可完整操作，焦點順序符合視覺順序
- 色彩對比 ≥ 4.5:1（內文）/ 3:1（大字）
- 錯誤訊息以 `role="alert"` 公告
- 螢幕閱讀器測試友善（中文 lang 屬性）

---

## 規格書文件

| 文件 | 說明 |
|------|------|
| `Case1_花蓮縣政府復康巴士預約系統服務需求說明書.pdf` | 主需求規格 |
| `軟體工程 _ 復康巴士系統資料庫.pdf` | 資料庫設計 |
| `軟體工程_系統測試.pdf` | 系統測試規格 |
| `CLAUDE.md` | 開發助理上下文（含技術決策紀錄） |

---

## License

軟體工程課程作業，僅供教學評量使用。
