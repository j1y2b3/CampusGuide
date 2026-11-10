import { kb, kbIndexForPrompt, toActionCard } from '../src/data/knowledge'
import { fallbackCards, searchLocal } from '../src/lib/match'
import type { ActionCard, AskResponse, KnowledgeEntry } from '../src/types'

const MAX_QUERY_LENGTH = 200
const MAX_CARDS = 3

const SYSTEM_PROMPT = `你是校园事务路由助手。用户会描述一件想在学校里办的事，你的任务是从给定知识库里挑选对应的条目。

规则：
1. 只能从知识库返回的 id 列表里选择，绝对不能编造 id 或不存在的条目。
2. 如果知识库没有覆盖用户的需求，ids 返回空数组，并在 reply 里说明没有收录，建议用户换个说法或联系哪个部门。
3. 不要编造任何网址、电话、办公时间。卡片内容由系统按 id 填充，你不需要复述。
4. reply 用一句口语化的中文，说清"这是什么事"，不要超过 40 字。
5. reason 说明为什么把这条推荐给该用户，不超过 20 字。
6. draft 可选：仅当用户需求适合提交一段文字时（如报修描述、请假事由），帮他写一段可直接粘贴的中文草稿，不超过 80 字；否则省略该字段。

只返回 JSON，格式：
{"ids":[{"id":"...","reason":"..."}],"reply":"...","draft":"..."}`

interface AskBody {
  query?: unknown
}

interface LlmPick {
  id: string
  reason?: string
}

function getConfig() {
  return {
    apiKey: process.env.LLM_API_KEY?.trim(),
    baseUrl: (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    model: process.env.LLM_MODEL || 'gpt-4o-mini'
  }
}

function fallbackReply(query: string, entries: KnowledgeEntry[]): AskResponse {
  const hits = searchLocal(query, entries)
  if (hits.length > 0) {
    const cards = hits.map((h) =>
      toActionCard(h.entry, query, h.hitTrigger ? `你提到了"${h.hitTrigger}"` : '相关事项')
    )
    return { mode: 'local', cards, reply: `找到 ${cards.length} 条相关事项，按相关度排序：` }
  }
  return {
    mode: 'local',
    cards: fallbackCards(),
    reply: '这个需求暂时没有收录。下面是几条常办事项，或者你也可以换个说法再问一次。'
  }
}

/** 从模型回复里抠出 JSON，容忍 ```json 包裹与前后废话 */
function parseModelJson(text: string): { picks: LlmPick[]; reply?: string; draft?: string } | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as {
      ids?: unknown
      reply?: unknown
      draft?: unknown
    }
    const picks = Array.isArray(raw.ids)
      ? raw.ids
          .map((item): LlmPick | null => {
            if (typeof item === 'string') return { id: item }
            if (item && typeof item === 'object' && typeof (item as LlmPick).id === 'string') {
              return { id: (item as LlmPick).id, reason: (item as LlmPick).reason }
            }
            return null
          })
          .filter((p): p is LlmPick => p !== null)
      : []
    return {
      picks,
      reply: typeof raw.reply === 'string' ? raw.reply : undefined,
      draft: typeof raw.draft === 'string' ? raw.draft : undefined
    }
  } catch {
    return null
  }
}

async function callLlm(query: string, entries: KnowledgeEntry[]): Promise<AskResponse> {
  const { apiKey, baseUrl, model } = getConfig()
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `知识库：\n${JSON.stringify(kbIndexForPrompt(entries))}\n\n用户需求：${query}`
        }
      ]
    }),
    signal: AbortSignal.timeout(15_000)
  })

  if (!res.ok) throw new Error(`LLM 返回 ${res.status}`)

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''
  const parsed = parseModelJson(content)
  if (!parsed) throw new Error('模型返回内容无法解析为 JSON')

  const byId = new Map(entries.map((e) => [e.id, e]))
  const cards: ActionCard[] = []
  for (const pick of parsed.picks) {
    const entry = byId.get(pick.id)
    if (entry && !cards.some((c) => c.id === entry.id)) {
      cards.push(toActionCard(entry, query, pick.reason))
    }
    if (cards.length >= MAX_CARDS) break
  }

  if (cards.length === 0) {
    return {
      mode: 'llm',
      cards: fallbackCards(),
      reply: parsed.reply?.trim() || '这个需求暂时没有收录，下面是几条常办事项。'
    }
  }

  return {
    mode: 'llm',
    cards,
    reply: parsed.reply?.trim() || `这应该是「${cards[0].title}」，下面这张卡可以直接照着走。`,
    draft: parsed.draft?.trim() || undefined
  }
}

export async function handleAsk(body: AskBody): Promise<AskResponse> {
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  if (!query) throw Object.assign(new Error('缺少 query 参数'), { status: 400 })
  if (query.length > MAX_QUERY_LENGTH) {
    throw Object.assign(new Error(`query 过长，最多 ${MAX_QUERY_LENGTH} 字`), { status: 400 })
  }

  const { apiKey } = getConfig()
  // 未配置密钥时不报错，直接走本地检索，保证离线 / 未配置环境也能演示
  if (!apiKey) return fallbackReply(query, kb)

  try {
    return await callLlm(query, kb)
  } catch (err) {
    console.warn('[ask] LLM 调用失败，回退本地检索：', (err as Error).message)
    return fallbackReply(query, kb)
  }
}
