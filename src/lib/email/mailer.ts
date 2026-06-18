import nodemailer from 'nodemailer'

function createTransport() {
  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT } = process.env
  if (!EMAIL_HOST) return null
  const port = EMAIL_PORT ? parseInt(EMAIL_PORT, 10) : 587
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  })
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const transport = createTransport()
  if (!transport) {
    // Dev mode only: skip body to avoid leaking reset tokens into log drains.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL][dev] To: ${to} | Subject: ${subject} (body suppressed)`)
    }
    return
  }
  await transport.sendMail({
    from: `"花蓮縣復康巴士" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
