export const DEFAULT_API_ERROR_MESSAGE = '操作失敗，請稍後再試'
export const NETWORK_API_ERROR_MESSAGE = '無法連線，請稍後再試'

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
  return fallback
}

function shouldParseJson(text: string, contentType: string | null): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (contentType?.toLowerCase().includes('json')) return true
  return trimmed.startsWith('{') || trimmed.startsWith('[')
}

export async function parseApiResponse<T = unknown>(
  response: Response,
  fallbackErrorMessage = DEFAULT_API_ERROR_MESSAGE,
): Promise<T> {
  let payload: unknown = null

  if (typeof response.text === 'function') {
    const text = await response.text().catch(() => '')
    if (shouldParseJson(text, response.headers.get('content-type'))) {
      try {
        payload = JSON.parse(text)
      } catch {
        if (response.ok) {
          throw new ApiError(fallbackErrorMessage, response.status)
        }
      }
    }
  } else if (typeof (response as { json?: unknown }).json === 'function') {
    payload = await (response as { json: () => Promise<unknown> }).json().catch(() => null)
  }

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(payload, fallbackErrorMessage),
      response.status,
      payload,
    )
  }

  return payload as T
}

export async function apiFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { fallbackErrorMessage?: string },
): Promise<T> {
  try {
    const response = await fetch(input, init)
    return await parseApiResponse<T>(response, options?.fallbackErrorMessage)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(NETWORK_API_ERROR_MESSAGE, 0)
  }
}
