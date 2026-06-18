// IPv4: standard dotted-decimal; IPv6: simplified pattern accepting hex groups + colons.
// Reject anything else (e.g. log-injection payloads with newlines).
const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/
const IPV6 = /^[0-9a-fA-F:]{2,45}$/

function isValidIp(value: string): boolean {
  return IPV4.test(value) || IPV6.test(value)
}

// Trust x-real-ip first (set by Vercel / reverse proxy, not spoofable from the client).
// Fall back to the first hop in x-forwarded-for, after validating shape.
export function getClientIp(headers: Headers): string {
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp && isValidIp(realIp)) return realIp

  const xff = headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim() ?? ''
    if (isValidIp(first)) return first
  }
  return ''
}
