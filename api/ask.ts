import { handleAsk } from '../server/ask.js'

/**
 * Vercel Function 入口。
 * API Key 只存在服务端环境变量里，前端永远拿不到，也不会被打包进产物。
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body
    res.status(200).json(await handleAsk(body))
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    res.status(status).json({ error: (err as Error).message })
  }
}
