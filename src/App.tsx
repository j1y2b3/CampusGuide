import { useState } from 'react'
import { ask } from './lib/api'
import { useTodos } from './hooks/useTodos'
import { SearchBar } from './components/SearchBar'
import { CardView } from './components/CardView'
import { DraftNote } from './components/DraftNote'
import { TodoPanel } from './components/TodoPanel'
import { PortalPanel } from './components/PortalPanel'
import type { ActionCard, AskResponse } from './types'

type Tab = 'ask' | 'portal' | 'todo'

export default function App() {
  const [tab, setTab] = useState<Tab>('ask')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResponse | null>(null)
  const [query, setQuery] = useState('')
  const [added, setAdded] = useState<string | null>(null)
  const { todos, add, toggle, remove, setDue } = useTodos()

  const pendingCount = todos.filter((t) => !t.done).length

  async function handleAsk(q: string) {
    setLoading(true)
    setQuery(q)
    try {
      const res = await ask(q)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  function handleAddTodo(card: ActionCard) {
    add({ cardId: card.id, title: card.title, note: card.summary })
    setAdded(card.id)
    setTimeout(() => setAdded(null), 2000)
  }

  const cards = result?.cards ?? []

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">校园事务助手</h1>
      </header>

      <nav className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
        {(
          [
            ['ask', '问事'],
            ['portal', '入口'],
            ['todo', `我的待办${pendingCount ? ` ${pendingCount}` : ''}`]
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'ask' ? (
        <main className="flex-1 space-y-4">
          <SearchBar onSubmit={handleAsk} loading={loading} />

          {loading && (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
              ))}
            </div>
          )}

          {!loading && result && (
            <section className="space-y-3">
              <p className="px-1 text-[13px] leading-relaxed text-slate-600">{result.reply}</p>

              {result.draft && <DraftNote draft={result.draft} />}

              {cards.map((card, i) => (
                <div key={card.id} className="relative">
                  <CardView card={card} onAddTodo={handleAddTodo} defaultOpen={i === 0} />
                  {added === card.id && (
                    <span className="absolute right-3 top-3 rounded-md bg-teal-600 px-2 py-0.5 text-[11px] text-white">
                      已加入待办
                    </span>
                  )}
                </div>
              ))}

              <p className="px-1 pt-1 text-[11px] leading-relaxed text-slate-400">
                结果来源：{result.mode === 'llm' ? '模型检索知识库' : '本地知识库检索'}
                {query && ` · 你的问题：${query}`}
              </p>
            </section>
          )}

        </main>
      ) : tab === 'portal' ? (
        <main className="flex-1">
          <PortalPanel onAddTodo={handleAddTodo} />
        </main>
      ) : (
        <main className="flex-1">
          <TodoPanel todos={todos} onToggle={toggle} onRemove={remove} onSetDue={setDue} />
        </main>
      )}

      <footer className="mt-8 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-400">
        <p>
          条目来自校方公开信息，未与官方核对的内容标注「待核验」。本工具只提供路径与提醒，不代替你登录或提交。
        </p>
        <p className="mt-1">参赛原型 · 数据为演示用，请以学校官方通知为准</p>
      </footer>
    </div>
  )
}
