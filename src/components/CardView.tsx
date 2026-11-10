import { useState } from 'react'
import { ACCESS_LABEL, PROVIDER_LABEL } from '../data/knowledge'
import type { ActionCard } from '../types'

interface Props {
  card: ActionCard
  onAddTodo: (card: ActionCard, due?: string) => void
  defaultOpen?: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // 非 HTTPS 环境缺少 clipboard API，退化为选中提示
      window.prompt('复制下面的内容：', text)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="text-xs text-teal-700 underline decoration-dotted underline-offset-2"
    >
      {copied ? '已复制' : '复制'}
    </button>
  )
}

/** 把行动卡转成可以发给宿管 / 老师的纯文本 */
function toPlainText(card: ActionCard): string {
  return [
    `【${card.title}】`,
    card.summary,
    '',
    '步骤：',
    ...card.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `需要准备：${card.materials.join('、')}`,
    card.entry.channel ? `入口：${card.entry.channel}` : '',
    card.sla ? `时限：${card.sla}` : ''
  ]
    .filter(Boolean)
    .join('\n')
}

export function CardView({ card, onAddTodo, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-700">
              {card.category}
            </span>
            {!card.verified && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700">
                待核验
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{card.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{card.reason || card.summary}</p>
        </div>
        <span
          className={`mt-1 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          <p className="text-[13px] leading-relaxed text-slate-600">{card.summary}</p>

          <section>
            <h4 className="mb-2 text-xs font-semibold text-slate-500">照着做</h4>
            <ol className="space-y-2">
              {card.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-medium text-white">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h4 className="mb-1.5 text-xs font-semibold text-slate-500">要带的东西</h4>
            <div className="flex flex-wrap gap-1.5">
              {card.materials.map((m) => (
                <span key={m} className="rounded-lg bg-slate-100 px-2 py-1 text-[12px] text-slate-600">
                  {m}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-1.5 text-[13px]">
            {card.entry.channel && (
              <div className="text-slate-700">
                <span className="text-slate-400">入口：</span>
                <span>{card.entry.channel}</span>
                {card.entry.url && card.entry.access === 'none' && (
                  <a
                    href={card.entry.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ml-1 text-teal-700 underline decoration-dotted underline-offset-2"
                  >
                    直接打开
                  </a>
                )}
              </div>
            )}

            {/* 打开方式是本产品的核心信息：学生真正卡住的地方在这 */}
            {card.entry.access && card.entry.access !== 'none' && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                    card.entry.access === 'dingtalk' || card.entry.access === 'wechat'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ACCESS_LABEL[card.entry.access]}
                </span>
                {card.entry.provider && (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                    {PROVIDER_LABEL[card.entry.provider]}
                  </span>
                )}
              </div>
            )}

            {card.entry.note && (
              <p className="text-[12px] leading-relaxed text-slate-500">{card.entry.note}</p>
            )}

            {card.entry.url &&
              card.entry.access !== 'none' &&
              card.entry.access !== 'dingtalk' &&
              card.entry.access !== 'wechat' && (
                <a
                  href={card.entry.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-block text-[12px] text-teal-700 underline decoration-dotted underline-offset-2"
                >
                  复制到对应 App 打开
                </a>
              )}

            {card.sla && (
              <p className="text-slate-700">
                <span className="text-slate-400">时限：</span>
                {card.sla}
              </p>
            )}
          </section>

          <section className="rounded-xl bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-500">
            <div className="flex items-start justify-between gap-2">
              <p>
                <span className="font-medium text-slate-600">依据：</span>
                {card.source.title}
                {card.source.note && `（${card.source.note}）`}
              </p>
              <CopyButton text={toPlainText(card)} />
            </div>
            {card.source.url && (
              <a
                href={card.source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-block text-teal-700 underline decoration-dotted underline-offset-2"
              >
                查看原文
              </a>
            )}
          </section>

          <button
            type="button"
            onClick={() => onAddTodo(card)}
            className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white transition active:scale-[0.99]"
          >
            加入我的待办
          </button>
        </div>
      )}
    </article>
  )
}
