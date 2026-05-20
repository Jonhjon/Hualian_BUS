// ⚠️ STRESS TEST ONLY — branch `stress-test/disable-captcha`
// 此 branch 為壓力測試專用，verifyCaptcha 直接放行（不解 token、不檢查答案）。
// main branch 上仍保留完整 JWT 驗證邏輯（jose / JWTPayload / verifyToken）。
// 切勿 merge 回 main；壓測結束請刪除整個 branch。

export function isCaptchaConfigured(): boolean {
  return true
}

export async function verifyCaptcha(_token: string | undefined | null): Promise<boolean> {
  return true
}
