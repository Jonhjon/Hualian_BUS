# DBA 待辦清單 — Schema 修正建議

本檔案彙整 2026-06-17 code review 過程中發現、但因「資料庫不可由應用端自行修改」原則
需由 DBA 處理的 schema 議題。應用端已就每一項目以 application-level 防護先行繞過。

> **背景**：由 `~/.claude/projects/.../memory/feedback_db_no_destructive.md` 記錄，
> BusBookingDB 為唯讀環境，前後端開發者不得執行 DDL/DELETE/UPDATE。

---

## 1. Feedback：BookingID 缺少 UNIQUE 約束

| 項目 | 內容 |
|------|------|
| 嚴重度 | HIGH |
| 影響表 | `Feedback` |
| 現況 | `BookingID` 為一般 FK，可重複插入；同一筆預約理論上可被同一乘客多次評分。 |
| 應用端臨時防護 | `src/app/api/feedback/route.ts` 已加入 `findFirst → 409` 應用層去重，但兩個 request 同時抵達時仍會出現 race condition。 |
| 建議 SQL | `ALTER TABLE Feedback ADD CONSTRAINT UQ_Feedback_BookingID UNIQUE (BookingID);` |
| 風險 | 若既有資料已存在重複 `BookingID`，需先 dedupe 才能加 UNIQUE。 |

## 2. PassengerProfile.Email：應改為 NOT NULL

| 項目 | 內容 |
|------|------|
| 嚴重度 | MEDIUM |
| 影響表 | `PassengerProfile` |
| 現況 | `Email String? @db.VarChar(255)`（可為 NULL）。 |
| 應用端臨時防護 | `forgot-password` 流程在 Email 為 NULL 或不符時都回傳同一個 generic response，避免 enumeration。 |
| 建議 SQL | `ALTER TABLE PassengerProfile ALTER COLUMN Email VARCHAR(255) NOT NULL;` |
| 連帶調整 | 註冊 API 已強制必填，但 DB 仍允許 NULL；建議同步在 DB 層阻擋。 |

## 3. 缺少 EmailVerified 旗標

| 項目 | 內容 |
|------|------|
| 嚴重度 | MEDIUM |
| 影響表 | `Account` 或 `PassengerProfile` |
| 現況 | 目前 Email 驗證僅靠 stateless JWT，使用者點連結後沒有任何欄位被持久化，無法區分「已驗證」與「未驗證」帳號。 |
| 建議 schema | 於 `Account` 新增 `EmailVerified BIT NOT NULL DEFAULT 0` 與 `EmailVerifiedAt DATETIME NULL`。 |
| 應用端待辦 | 一旦 schema 上線，`/api/auth/verify-email` 需改為 `UPDATE Account SET EmailVerified=1, EmailVerifiedAt=GETDATE() WHERE AccountID=@id`。 |

## 4. Driver.AccountID：缺少 UNIQUE 約束

| 項目 | 內容 |
|------|------|
| 嚴重度 | LOW（非民眾前台直接影響） |
| 影響表 | `Driver` |
| 現況 | schema 註解 `// DB 無 unique 約束，一個帳號可掛多個司機紀錄`。 |
| 建議 SQL | `ALTER TABLE Driver ADD CONSTRAINT UQ_Driver_AccountID UNIQUE (AccountID);`（依業務邏輯確認後） |
| 備註 | 若業務允許一帳號多司機紀錄，本項可忽略，請 DBA 與業務確認後關閉。 |

---

## 應用端不再追加之項目（已就現有 schema 完成）

- IDOR：以 `findPassengerId(accountId)` + `where PassengerID=` 雙條件查詢全面覆蓋。
- 帳號接管：`forgot-password` 強制比對 `PassengerProfile.Email`，不再以 request body 之 email 作信件收件人。
- Open redirect：`getSafeNextPath()` 已在 client 端阻擋 CRLF / 雙斜線 / 反斜線 / 控制字元。
- Log injection：`getClientIp()` 對 `x-forwarded-for` / `x-real-ip` 做 IPv4/IPv6 格式驗證。
- HTML injection：`escapeHtml()` 已用於 email template 內的 reset/verify URL。
- BigInt parse：`parseBookingId()` 統一處理 `/^\d+$/` 正則，避免 `BigInt('')` 例外。

以上請 DBA 安排 maintenance window 處理，application 端會在 schema 變更後跟進對應的程式碼修改。
