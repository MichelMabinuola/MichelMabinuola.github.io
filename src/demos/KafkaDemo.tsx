import { useEffect, useState } from 'react'
import { Demo, demoBtn } from './Demo'
import { useUi } from '../i18n'

const PARTITIONS = 3
const PRODUCE_PER_TICK = 1 // per partition
const CONSUMER_CAPACITY = 2.4 // messages per tick, split across its partitions
const TICK_MS = 400
const MAX_LAG = 60 // per partition, keeps the demo bounded
const DOTS = 14

// Range assignment: partitions are split into contiguous blocks per consumer.
function assignment(consumers: number): number[] {
  return Array.from({ length: PARTITIONS }, (_, p) => Math.floor((p * consumers) / PARTITIONS))
}

export function KafkaDemo() {
  const [consumers, setConsumers] = useState(1)
  const ui = useUi()
  const [lag, setLag] = useState<number[]>([4, 4, 4])
  const owner = assignment(consumers)

  useEffect(() => {
    const t = window.setInterval(() => {
      setLag((prev) => {
        const owners = assignment(consumers)
        return prev.map((l, p) => {
          const share = CONSUMER_CAPACITY / owners.filter((o) => o === owners[p]).length
          return Math.min(MAX_LAG, Math.max(0, l + PRODUCE_PER_TICK - share))
        })
      })
    }, TICK_MS)
    return () => window.clearInterval(t)
  }, [consumers])

  const total = Math.round(lag.reduce((a, b) => a + b, 0))
  const sentence = ui.kSentences[consumers - 1]

  return (
    <Demo
      badge={ui.illustrative}
      metricLabel={ui.kWaiting}
      metric={total}
      control={
        consumers < PARTITIONS ? (
          <button type="button" className={demoBtn} onClick={() => setConsumers((c) => c + 1)}>
            {ui.kAdd}
          </button>
        ) : (
          <button
            type="button"
            className={demoBtn}
            onClick={() => {
              setConsumers(1)
              setLag([4, 4, 4])
            }}
          >
            {ui.kReset}
          </button>
        )
      }
      sentence={sentence}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1.5 font-mono text-[11px] text-ink-3">
        {lag.map((l, p) => {
          const shown = Math.min(DOTS, Math.ceil(l))
          return (
            <div key={p} className="contents">
              <span className={p === 1 ? '' : 'invisible'}>{ui.kIncoming}</span>
              <div
                className="flex h-6 items-center gap-1 overflow-hidden rounded-md border border-line bg-surface px-2"
                aria-label={`Lane ${p + 1}: ${Math.round(l)} messages waiting, handled by worker ${owner[p] + 1}`}
              >
                <span className="mr-1 shrink-0">{ui.kLane} {p + 1}</span>
                {Array.from({ length: shown }, (_, i) => (
                  <span key={i} className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                ))}
                {l > DOTS && <span className="shrink-0">+{Math.round(l - DOTS)}</span>}
              </div>
              <span className="text-ink-2">→ {ui.kWorker} {owner[p] + 1}</span>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
