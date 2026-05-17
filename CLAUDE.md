# 花蓮縣復康巴士預約系統 — 專案說明

## 專案背景

花蓮縣政府委託開發無障礙交通預約管理系統（110年度，軟體工程課程作業）。
本專案實作範圍：**民眾使用者前台 + 後端 API**。

---

## 技術堆疊

| 層面 | 選擇 |
|------|------|
| 框架 | Next.js 14 (App Router) + TypeScript |
| ORM | Prisma 5.x (SQL Server) |
| 認證 | JWT（httpOnly cookie）+ bcrypt |
| Email | Nodemailer（密碼重設、Email 驗證） |
| 樣式 | Tailwind CSS 3.x |
| 表單 | React Hook Form + Zod |
| 伺服器狀態 | TanStack Query 5.x |
| 用戶端狀態 | Zustand 4.x |
| 地圖 | Leaflet + OpenStreetMap（免費） |
| Anti-bot | 內建數學驗證碼（JWT 簽署，共用 JWT_SECRET） |
| 測試 | Jest + Testing Library + MSW + Playwright |

---

## 資料庫連線

```
Server:   203.64.84.56:1433
Database: BusBookingDB
User:     tcumi
Password: tcumi
```

`.env` 格式：
```env
DATABASE_URL="sqlserver://203.64.84.56:1433;database=BusBookingDB;user=tcumi;password=tcumi;encrypt=false"
JWT_SECRET="<random 32 bytes>"
EMAIL_HOST=""
EMAIL_USER=""
EMAIL_PASS=""
```

---

## 業務規則（已確認）

- 預約最早今天，最晚 7 天後
- 預約時間：日曆選日期 + 下拉選時段（08:00–17:00 整點制）
- 同時有效預約上限 3 筆
- 取消 24 小時內預約：標記逾期（無罰款）
- 文件上傳：PDF/JPG/PNG，最大 5MB
- 意見回饋：最多 500 字
- 密碼重設 token 效期：1 小時
- Email 驗證 token 效期：24 小時
- 家屬關係：配偶、子女、父母、兄弟姐妹、祖父母
- 登入帳號：使用者自訂 Username（`Account.Username`）；身分證字號記於 `PassengerProfile.IdentityNo`，僅申請時驗 checksum + 唯一性
- Email 驗證 / 密碼重設：Account/PassengerProfile 不存 Email 欄位，使用者申請時才臨時輸入 Email，以 **JWT stateless token**（含 AccountID + email + purpose + exp）寄送連結，驗證後解 JWT 比對，**不存 DB**
- 去回程：視為**兩筆獨立 Bookings**，前端迴圈 call 兩次 `POST /api/bookings`；`IsRoundTrip=true` 僅作標記，DB 無關聯欄位
- 同時段衝突：同一乘客 `PickupTime` 完全相同即擋（回 409），有效狀態 `BookingStatus IN (0,1,3,5)`
- 文件上傳：檔案儲存於專案根目錄 `./uploads/`（非 public，透過 `/api/documents/:id` 驗證後下載），中介資料存於 `Documents` 表（掛在 PassengerID 下）
- Email SMTP：暫無，開發期間以 console 模擬，日後填入 .env 即可啟用

---

## 實作階段

| 階段 | 內容 | 狀態 |
|------|------|------|
| Phase 0 | 環境建置（Next.js、Prisma、Jest、Playwright） | ✅ 完成 |
| Phase 1 | 身分證驗算器（純函式） | ✅ 完成 |
| Phase 2 | Zod Schemas（前後端共用） | ✅ 完成 |
| Phase 3 | Prisma Schema + seed 資料 | ✅ 完成 |
| Phase 4 | 認證後端 API（register/login/email/reset） | ✅ 完成 |
| Phase 5 | 認證前端（LoginForm、RegisterForm 3 步驟） | ✅ 完成 |
| Phase 6 | 預約後端 API | ✅ 完成 |
| Phase 7 | 預約前端（BookingForm、清單、取消） | ✅ 完成 |
| Phase 8 | 即時追蹤後端 | ✅ 完成 |
| Phase 9 | 即時追蹤前端（Leaflet、30 秒輪詢） | ✅ 完成 |
| Phase 10 | 公告 + 意見回饋 | ✅ 完成 |
| Phase 11 | 補充功能（密碼重設頁、Email 驗證頁、個人資料頁） | ✅ 完成 |
| Phase 12 | WCAG 2.0 AA 無障礙稽核 | ✅ 完成 |

---

## 詳細計畫

完整計畫（含專案結構、Prisma schema、API 合約、測試策略）：
`C:\Users\joonh\.claude\plans\1-2-snazzy-galaxy.md`

---

## 規格書文件

| 文件 | 說明 |
|------|------|
| `Case1_花蓮縣政府復康巴士預約系統服務需求說明書.pdf` | 主需求規格 |
| `軟體工程 _ 復康巴士系統資料庫.pdf` | 資料庫設計 |
| `軟體工程_系統測試.pdf` | 系統測試規格 |
| `資料庫設定.png` | DB 連線資訊截圖 |
