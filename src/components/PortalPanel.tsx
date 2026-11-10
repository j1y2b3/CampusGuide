import { useMemo, useState } from 'react'
import { kb, PROVIDER_LABEL, toActionCard } from '../data/knowledge'
import { groupByAccess, portalStats } from '../lib/portals'
import { CardView } from './CardView'
import type { ActionCard } from '../types'

interface Props {
  onAddTodo: (card: ActionCard) => void
}

export function PortalPanel({ onAddTodo }: Props) {
  const groups = useMemo(() => groupByAccess(kb), [])
  const stats = useMemo(() => portalStats(kb), [])
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-800">办事入口分布</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
          收录 {stats.total} 件事，真正能在浏览器打开就走完的只有 {stats.direct} 件。
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { n: stats.direct, label: '直接可用', tone: 'text-teal-700' },
            { n: stats.needsLogin, label: '需登录', tone: 'text-slate-700' },
            { n: stats.needsApp, label: '只能在 App 内', tone: 'text-amber-700' }
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 py-2">
              <p className={`text-lg font-semibold ${s.tone}`}>{s.n}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.access} className="space-y-2">
          <div className="px-1">
            <h3 className="text-[13px] font-semibold text-slate-700">
              {group.label}
              <span className="ml-1.5 font-normal text-slate-400">{group.entries.length} 件</span>
            </h3>
            <p className="text-[11px] text-slate-400">{group.hint}</p>
          </div>

          <ul className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {group.entries.map((entry, i) => {
              const card = toActionCard(entry)
              const open = openId === entry.id
              return (
                <li key={entry.id} className={i > 0 ? 'border-t border-slate-100' : ''}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : entry.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-slate-800">{entry.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {entry.category}
                        {entry.entry.provider && ` · ${PROVIDER_LABEL[entry.entry.provider]}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>

                  {open && (
                    <div className="px-2 pb-2">
                      <CardView card={card} onAddTodo={onAddTodo} defaultOpen />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <p className="px-1 pb-2 text-[11px] leading-relaxed text-slate-400">
        结论：入口本身并不缺，缺的是「这件事到底该在哪儿打开」。带「需登录」「App 内」标记的条目，
        点开链接也进不去，所以这里只说明路径，不承诺一键直达。
      </p>
    </div>
  )
}
