export function resetPasswordTemplate(resetUrl: string): string {
  return `
    <p>您好，</p>
    <p>請點擊以下連結重設密碼（1 小時內有效）：</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>若您未申請重設密碼，請忽略此信件。</p>
  `
}

export function verifyEmailTemplate(verifyUrl: string): string {
  return `
    <p>您好，</p>
    <p>請點擊以下連結驗證您的電子郵件（24 小時內有效）：</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
  `
}
