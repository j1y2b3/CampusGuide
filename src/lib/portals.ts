import { ACCESS_LABEL, kb } from '../data/knowledge'
import type { EntryAccess, KnowledgeEntry } from '../types'

export interface PortalGroup {
  access: EntryAccess
  label: string
  hint: string
  entries: KnowledgeEntry[]
}

const ORDER: { access: EntryAccess; hint: string }[] = [
  { access: 'none', hint: '打开就能用，不需要登录' },
  { access: 'login', hint: '需要统一身份认证，但浏览器能进' },
  { access: 'wechat', hint: '必须从微信公众号进入' },
  { access: 'dingtalk', hint: '必须在杭电钉里打开' },
  { access: 'mobile', hint: '建议手机端打开' },
  { access: 'alipay', hint: '为支付宝容器设计' }
]

/** 按"在哪能打开"分组——这正是学生卡住的地方 */
export function groupByAccess(entries: KnowledgeEntry[] = kb): PortalGroup[] {
  return ORDER.map(({ access, hint }) => ({
    access,
    label: ACCESS_LABEL[access],
    hint,
    entries: entries.filter((e) => (e.entry.access ?? 'none') === access)
  })).filter((g) => g.entries.length > 0)
}

export interface PortalStats {
  total: number
  direct: number
  needsApp: number
  needsLogin: number
}

export function portalStats(entries: KnowledgeEntry[] = kb): PortalStats {
  const access = (e: KnowledgeEntry) => e.entry.access ?? 'none'
  return {
    total: entries.length,
    direct: entries.filter((e) => access(e) === 'none').length,
    needsApp: entries.filter((e) => access(e) === 'wechat' || access(e) === 'dingtalk').length,
    needsLogin: entries.filter((e) => access(e) === 'login').length
  }
}
