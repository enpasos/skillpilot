import type { TeacherCoursePlanBlock } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import { parseCoursePlanDate } from '../utils/localTeacherCoursePlan'

const copy = {
  de: {
    title: 'Zeitplanung', hint: 'Abschnitt anklicken, um ihn zu bearbeiten. Die Achse zeigt Kalendertage; auf kleinen Bildschirmen seitlich scrollen.',
    empty: 'Noch keine Abschnitte geplant.', unavailable: 'Zeitplanung derzeit nicht darstellbar.',
    edit: 'Bearbeiten', learning: 'Lernabschnitt', buffer: 'Puffer', milestone: 'Meilenstein',
  },
  en: {
    title: 'Timeline', hint: 'Select a section to edit it. The axis shows calendar days; scroll sideways on smaller screens.',
    empty: 'No sections planned yet.', unavailable: 'The timeline is currently unavailable.',
    edit: 'Edit', learning: 'Learning section', buffer: 'Buffer', milestone: 'Milestone',
  },
} as const

const DAY_MS = 86_400_000

/** Presentation only: every edit goes through the parent's existing draft guard. */
export const CoursePlanTimeline = ({ blocks, goals, language, onEditBlock }: {
  blocks: readonly TeacherCoursePlanBlock[]
  goals: ReadonlyMap<string, UiGoal>
  language: 'de' | 'en'
  onEditBlock: (block: TeacherCoursePlanBlock) => void
}) => {
  const c = copy[language]
  const entries = blocks.map((block) => {
    const start = parseCoursePlanDate(block.kind === 'milestone' ? block.date : block.startDate)
    const end = parseCoursePlanDate(block.kind === 'milestone' ? block.date : block.endDate)
    return { block, start, end }
  })
  const valid = entries.every(({ start, end }) => start && end && start.epochDay <= end.epochDay)
  if (!blocks.length || !valid) {
    return <p data-testid="course-plan-timeline" className="text-sm text-text-secondary">
      {blocks.length ? c.unavailable : c.empty}
    </p>
  }
  const first = Math.min(...entries.map(({ start }) => start!.epochDay))
  const last = Math.max(...entries.map(({ end }) => end!.epochDay))
  const days = last - first + 1
  const percent = (epochDay: number) => (epochDay - first) / days * 100
  const formatter = new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  })
  const date = (epochDay: number) => formatter.format(new Date(epochDay * DAY_MS))
  // At most five ticks, even for the full supported calendar range.
  const ticks = [...new Set(Array.from({ length: 5 }, (_, index) => (
    first + Math.round((days - 1) * index / 4)
  )))]
  return (
    <section data-testid="course-plan-timeline" aria-label={c.title} className="min-w-0 max-w-full space-y-2">
      <h4 className="text-sm font-semibold text-text-primary">{c.title}</h4>
      <p className="text-xs text-text-secondary">{c.hint}</p>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border-color bg-white/60 p-3 dark:bg-slate-950/30">
        <div className="min-w-[36rem] space-y-3">
          <div className="relative h-9 border-b border-border-color" aria-hidden="true">
            {ticks.map((tick, index) => (
              <span key={tick} className="absolute bottom-0 h-3 border-l border-border-color"
                style={{ left: `${percent(tick)}%` }}>
                <span className="absolute bottom-4 whitespace-nowrap text-xs text-text-secondary"
                  style={{ transform: index === 0 ? undefined : index === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
                  {date(tick)}
                </span>
              </span>
            ))}
          </div>
          {entries.map(({ block, start, end }) => {
            const title = block.title?.trim()
              || (block.kind === 'learning' ? goals.get(block.goalId)?.title?.trim() : '')
              || c[block.kind]
            const range = start!.epochDay === end!.epochDay
              ? date(start!.epochDay) : `${date(start!.epochDay)} – ${date(end!.epochDay)}`
            return (
              <div key={block.id} className="space-y-1">
                <p className="break-words text-sm text-text-primary">
                  <span className="font-medium">{title}</span>
                  <span className="text-xs text-text-secondary"> · {c[block.kind]} · {range}</span>
                </p>
                <button type="button" data-testid="course-plan-timeline-block"
                  data-start={start!.value} data-end={end!.value}
                  aria-label={`${c.edit}: ${title} (${range})`}
                  onClick={() => onEditBlock(block)}
                  className="relative block min-h-11 w-full rounded-md bg-slate-100/70 text-left hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-800/40 dark:hover:bg-slate-800/80">
                  {block.kind === 'milestone' ? (
                    <span aria-hidden="true" className="absolute inset-y-2 w-px bg-violet-600 dark:bg-violet-400"
                      style={{ left: `clamp(8px, ${percent(start!.epochDay)}%, calc(100% - 8px))` }}>
                      <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-violet-600 dark:bg-violet-400" />
                    </span>
                  ) : (
                    <span aria-hidden="true"
                      className={`absolute inset-y-2 min-w-px rounded-sm ${block.kind === 'learning' ? 'bg-sky-600 dark:bg-sky-400' : 'bg-amber-500 dark:bg-amber-400'}`}
                      style={{ left: `${percent(start!.epochDay)}%`, width: `${(end!.epochDay - start!.epochDay + 1) / days * 100}%` }} />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
