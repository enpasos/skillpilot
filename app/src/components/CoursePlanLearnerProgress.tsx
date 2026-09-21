import * as React from 'react'
import { RefreshCw } from 'lucide-react'

import { fetchLearnerPlanningScope } from '../utils/learnerPlanningScope'
import { LEARNER_UI_REFRESH_EVENT, type LearnerUiRefreshDetail } from '../utils/learnerUiEvents'

export interface CoursePlanLearnerProgressProps {
  learners: readonly { id: string; name: string }[]
  landscapeId: string
  language: 'de' | 'en'
}

type ProgressResult = { status: 'ready'; completed: number; total: number } | { status: 'error' }

/** Reads current saved learning results; never writes or replaces a plan baseline. */
export const CoursePlanLearnerProgress = ({ learners, landscapeId, language }: CoursePlanLearnerProgressProps) => {
  const de = language === 'de'
  const learnerIdsKey = JSON.stringify([...new Set(learners.map(({ id }) => id).filter(Boolean))])
  const [refreshToken, setRefreshToken] = React.useState(0)
  const scope = React.useMemo(() => ({ learnerIdsKey, landscapeId, refreshToken }), [learnerIdsKey, landscapeId, refreshToken])
  const [results, setResults] = React.useState<{ scope: typeof scope; values: Record<string, ProgressResult> } | null>(null)
  const currentResults: Record<string, ProgressResult> = results?.scope === scope ? results.values : Object.create(null)
  const visibleLearners = learners.filter(({ id }, index) => id && learners.findIndex((learner) => learner.id === id) === index)
  const loading = visibleLearners.some(({ id }) => !currentResults[id])

  React.useEffect(() => {
    const lifecycle = new AbortController()
    const ids = JSON.parse(scope.learnerIdsKey) as string[]
    let next = 0
    const loadNext = async () => {
      while (!lifecycle.signal.aborted && next < ids.length) {
        const learnerId = ids[next++]
        const request = new AbortController()
        const abortRequest = () => request.abort()
        lifecycle.signal.addEventListener('abort', abortRequest)
        const timeout = window.setTimeout(abortRequest, 15_000)
        let result: ProgressResult
        try {
          const saved = await fetchLearnerPlanningScope({ learnerId, landscapeId: scope.landscapeId, signal: request.signal })
          result = { status: 'ready', completed: saved.masteredAtomicGoalCount, total: saved.totalAtomicGoalCount }
        } catch {
          result = { status: 'error' }
        } finally {
          window.clearTimeout(timeout)
          lifecycle.signal.removeEventListener('abort', abortRequest)
        }
        if (lifecycle.signal.aborted) return
        setResults((previous) => ({
          scope,
          values: Object.assign(Object.create(null), previous?.scope === scope ? previous.values : {}, { [learnerId]: result }),
        }))
      }
    }
    // A class may contain many learners. Bound concurrent backend reads.
    for (let worker = 0; worker < Math.min(4, ids.length); worker += 1) void loadNext()
    return () => lifecycle.abort()
  }, [scope])

  React.useEffect(() => {
    const ids = new Set(JSON.parse(learnerIdsKey) as string[])
    let timer: number | undefined
    const refresh = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setRefreshToken((value) => value + 1), 100)
    }
    const learnerRefresh = (event: Event) => {
      const detail = (event as CustomEvent<LearnerUiRefreshDetail>).detail
      if (detail && ids.has(detail.skillpilotId)) refresh()
    }
    const visibilityRefresh = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener(LEARNER_UI_REFRESH_EVENT, learnerRefresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', visibilityRefresh)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(LEARNER_UI_REFRESH_EVENT, learnerRefresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', visibilityRefresh)
    }
  }, [learnerIdsKey])

  return (
    <section className="rounded-2xl border border-border-color bg-sidebar-bg/40 p-4 sm:p-5" data-testid="course-plan-learner-progress">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{de ? 'Persönlicher Fachumfang' : 'Personal subject scope'}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {de ? 'Aktueller Lernfortschritt aus den gespeicherten Lernzielergebnissen.' : 'Current progress from saved learning-goal results.'}
          </p>
        </div>
        {visibleLearners.length > 0 && (
          <button type="button" onClick={() => setRefreshToken((value) => value + 1)} disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm disabled:opacity-50">
            <RefreshCw size={15} aria-hidden="true" />{de ? 'Aktualisieren' : 'Refresh'}
          </button>
        )}
      </div>
      {visibleLearners.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">{de ? 'Noch keine Lernenden zugeordnet.' : 'No learners assigned yet.'}</p>
      ) : (
        <ul className="mt-4 space-y-3" aria-live="polite">
          {visibleLearners.map(({ id, name }) => {
            const result = currentResults[id]
            return (
              <li key={id} className="rounded-xl border border-border-color bg-white/40 p-3 dark:bg-slate-900/20" data-testid={`learner-progress-${id}`}>
                <h4 className="break-words font-medium">{name}</h4>
                {!result ? <p className="mt-1 text-sm text-text-secondary" role="status">{de ? 'Lernfortschritt wird geladen …' : 'Loading learning progress …'}</p>
                  : result.status === 'error' ? <p className="mt-1 text-sm text-text-secondary" role="status">{de ? 'Lernfortschritt derzeit nicht verfügbar. Bitte erneut aktualisieren.' : 'Learning progress is currently unavailable. Please refresh again.'}</p>
                    : <>
                      <p className="mt-1 text-lg font-semibold">
                        {de ? `${result.completed} von ${result.total} Lernzielen abgeschlossen` : `${result.completed} of ${result.total} learning goals completed`}
                      </p>
                      {result.total > 0 && <progress className="mt-2 h-2 w-full accent-sky-600" value={result.completed} max={result.total}
                        aria-label={de ? `Lernfortschritt von ${name}` : `Learning progress for ${name}`} />}
                    </>}
              </li>
            )
          })}
        </ul>
      )}
      {visibleLearners.length > 0 && <p className="mt-3 text-xs leading-5 text-text-secondary">
        {de
          ? 'Gezählt werden die Lernziele im aktuellen persönlichen Fachumfang, einschließlich abgeschlossener Orientierungsziele. Ein Plan kann nur einen Teil dieses Umfangs abdecken.'
          : 'Counts cover the current personal subject scope, including completed orientation goals. A plan may cover only part of this scope.'}
      </p>}
    </section>
  )
}
