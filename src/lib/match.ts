import { kb, toActionCard } from '../data/knowledge'
import type { ActionCard, AskResponse, KnowledgeEntry } from '../types'

/** 汉字按二元组切分，用于粗粒度语义重叠计算 */
function bigrams(text: string): string[] {
  const s = text.replace(/[\s，。！？,.!?、：:；;""''（）()]/g, '')
  const out: string[] = []
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2))
  return out
}

export interface LocalHit {
  entry: KnowledgeEntry
  score: number
  /** 命中的触发词，用于向用户解释推荐理由 */
  hitTrigger?: string
}

export function searchLocal(query: string, entries: KnowledgeEntry[] = kb): LocalHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const qGrams = new Set(bigrams(q))

  const hits = entries.map((entry) => {
    let score = 0
    let hitTrigger: string | undefined

    for (const trigger of entry.triggers) {
      const t = trigger.toLowerCase()
      if (!t) continue
      if (q.includes(t)) {
        score += 6 + t.length
        if (!hitTrigger || t.length > hitTrigger.length) hitTrigger = t
      } else if (t.length >= 2 && t.includes(q)) {
        score += 2
        hitTrigger ??= t
      }
    }

    const haystack = `${entry.title}${entry.summary}${entry.category}${entry.triggers.join('')}`.toLowerCase()
    for (const gram of qGrams) {
      if (haystack.includes(gram)) score += 1
    }

    return { entry, score, hitTrigger }
  })

  return hits
    .filter((h) => h.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export function localAnswer(query: string): AskResponse {
  const hits = searchLocal(query)

  if (hits.length === 0) {
    return {
      mode: 'local',
      cards: [],
      reply:
        '这个需求暂时没有收录。知识库里只有校方公开可查的办事路径，没有把握的信息不会编造。你可以换个说法，或者先看下面几条常办事项。'
    }
  }

  const cards: ActionCard[] = hits.map((h) =>
    toActionCard(
      h.entry,
      query,
      h.hitTrigger ? `你提到了"${h.hitTrigger}"` : '与你描述的事项相关'
    )
  )

  return {
    mode: 'local',
    cards,
    reply:
      cards.length === 1
        ? `这应该是「${cards[0].title}」，下面这张卡可以直接照着走。`
        : `找到 ${cards.length} 条相关事项，按相关度排序：`
  }
}

/** 供"更多常办事项"使用的兜底列表 */
export const fallbackIds = [
  'life.dorm.electricity',
  'sport.sunrun',
  'library.opac',
  'social.second-class'
]

export function fallbackCards(): ActionCard[] {
  return fallbackIds
    .map((id) => kb.find((e) => e.id === id))
    .filter((e): e is KnowledgeEntry => Boolean(e))
    .map((e) => toActionCard(e))
}
