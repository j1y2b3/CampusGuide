import { handleAsk } from '../../server/ask.js'

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
}

interface NetlifyEvent {
  httpMethod: string
  body: string | null
}

/**
 * Netlify Functions 入口。
 * 业务逻辑完全复用 server/ask.ts，这里只做协议适配（event → handleAsk → response）。
 * 前端仍请求 /api/ask，由 netlify.toml 的 rewrite 转到本函数。
 */
export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const data = await handleAsk(body)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) }
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    return { statusCode: status, headers: HEADERS, body: JSON.stringify({ error: (err as Error).message }) }
  }
}
