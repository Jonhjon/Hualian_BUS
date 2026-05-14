const HCAPTCHA_VERIFY_URL = 'https://api.hcaptcha.com/siteverify'

export function isCaptchaConfigured(): boolean {
  return Boolean(process.env.HCAPTCHA_SECRET)
}

export async function verifyCaptcha(token: string | undefined | null): Promise<boolean> {
  if (!isCaptchaConfigured()) return true
  if (!token) return false

  try {
    const params = new URLSearchParams()
    params.set('secret', process.env.HCAPTCHA_SECRET!)
    params.set('response', token)

    const res = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    if (!res.ok) return false
    const json = (await res.json().catch(() => null)) as { success?: boolean } | null
    return json?.success === true
  } catch {
    return false
  }
}
