// Belt-and-suspenders HTML entity encoder for URLs going into href + visible text.
// The URL is internally constructed but defence-in-depth in case BASE_URL is misconfigured.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const baseTemplate = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,'Microsoft JhengHei',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1d4ed8;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;color:#bfdbfe;font-size:13px;letter-spacing:1px;text-transform:uppercase;">花蓮縣政府</p>
              <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;">復康巴士預約系統</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                此信件由系統自動發送，請勿直接回覆。<br />
                花蓮縣政府復康巴士預約服務
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export function resetPasswordTemplate(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl)
  const body = `
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:700;">密碼重設申請</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">您好，我們收到了您的密碼重設申請。</p>

    <p style="margin:0 0 8px;color:#334155;font-size:14px;line-height:1.6;">
      請點擊下方按鈕完成密碼重設，連結將於 <strong>1 小時</strong>後失效。
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${safeUrl}"
         style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">
        重設密碼
      </a>
    </div>

    <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;line-height:1.6;">
      若按鈕無法點擊，請複製以下連結貼入瀏覽器：
    </p>
    <p style="margin:0 0 24px;word-break:break-all;">
      <a href="${safeUrl}" style="color:#3b82f6;font-size:12px;">${safeUrl}</a>
    </p>

    <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:8px;">
      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
        若您未申請密碼重設，請忽略此信件，您的密碼不會有任何變更。
      </p>
    </div>
  `
  return baseTemplate('密碼重設 — 花蓮縣復康巴士預約系統', body)
}

export function verifyEmailTemplate(verifyUrl: string): string {
  const safeUrl = escapeHtml(verifyUrl)
  const body = `
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:700;">電子郵件驗證</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">感謝您註冊花蓮縣復康巴士預約系統。</p>

    <p style="margin:0 0 8px;color:#334155;font-size:14px;line-height:1.6;">
      請點擊下方按鈕驗證您的電子郵件，連結將於 <strong>24 小時</strong>後失效。
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${safeUrl}"
         style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:8px;">
        驗證電子郵件
      </a>
    </div>

    <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;line-height:1.6;">
      若按鈕無法點擊，請複製以下連結貼入瀏覽器：
    </p>
    <p style="margin:0;word-break:break-all;">
      <a href="${safeUrl}" style="color:#3b82f6;font-size:12px;">${safeUrl}</a>
    </p>
  `
  return baseTemplate('電子郵件驗證 — 花蓮縣復康巴士預約系統', body)
}
