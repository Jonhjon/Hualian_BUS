import nodemailer from 'nodemailer'

function createTransport() {
  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env
  if (!EMAIL_HOST) return null
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: 587,
    secure: false,
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
    // Dev mode: print to console instead of sending
    console.log(`\n[EMAIL] To: ${to}`)
    console.log(`[EMAIL] Subject: ${subject}`)
    console.log(`[EMAIL] ---\n${html}\n---`)
    return
  }
  await transport.sendMail({
    from: `"花蓮縣復康巴士" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
