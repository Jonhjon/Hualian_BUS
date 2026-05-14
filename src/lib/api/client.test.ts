import { apiFetch, ApiError, parseApiResponse } from './client'

function makeResponse(body: string, status: number, contentType?: string): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => name.toLowerCase() === 'content-type' ? contentType ?? null : null,
    },
    text: async () => body,
  } as Response
}

describe('parseApiResponse', () => {
  it('returns parsed JSON for successful responses', async () => {
    const res = makeResponse(JSON.stringify({ success: true, data: { ok: true } }), 200, 'application/json')

    await expect(parseApiResponse(res)).resolves.toEqual({ success: true, data: { ok: true } })
  })

  it('throws backend JSON error messages for failed responses', async () => {
    const res = makeResponse(JSON.stringify({ success: false, error: '帳號已存在' }), 409, 'application/json')

    await expect(parseApiResponse(res)).rejects.toMatchObject({
      message: '帳號已存在',
      status: 409,
    })
  })

  it('does not expose Unexpected end of JSON input for empty failed responses', async () => {
    const res = makeResponse('', 500)

    await expect(parseApiResponse(res, '申請失敗，請稍後再試')).rejects.toMatchObject({
      message: '申請失敗，請稍後再試',
      status: 500,
    })
  })

  it('uses a friendly fallback for non-JSON failed responses', async () => {
    const res = makeResponse('<html>Server error</html>', 500, 'text/html')

    await expect(parseApiResponse(res)).rejects.toMatchObject({
      message: '操作失敗，請稍後再試',
      status: 500,
    })
  })
})

describe('apiFetch', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('wraps network failures in an ApiError', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('socket closed'))

    await expect(apiFetch('/api/test')).rejects.toMatchObject({
      message: '無法連線，請稍後再試',
      status: 0,
    })
    await expect(apiFetch('/api/test')).rejects.toBeInstanceOf(ApiError)
  })
})
