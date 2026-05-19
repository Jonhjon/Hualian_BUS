export const TAIPEI_TZ = 'Asia/Taipei'

export function buildTaipeiPickupDateTime(dateStr: string, hour: number): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null
  const iso = `${dateStr}T${String(hour).padStart(2, '0')}:00:00+08:00`
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

export interface TaipeiNowParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  dateStr: string
}

export function taipeiNowParts(now: Date = new Date()): TaipeiNowParts {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map(p => [p.type, p.value]),
  ) as Record<string, string>
  const hourStr = parts.hour === '24' ? '00' : parts.hour
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(hourStr),
    minute: Number(parts.minute),
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
  }
}

export function taipeiDateStr(now: Date = new Date()): string {
  return taipeiNowParts(now).dateStr
}
