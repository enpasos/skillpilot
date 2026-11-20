import { useEffect, useState } from 'react'
import type { UiGoal } from '../goalTypes'
import { LEARNER_UI_REFRESH_EVENT, type LearnerUiRefreshDetail } from '../utils/learnerUiEvents'

interface ExamPass {
  passedAt: string
  earnedPoints: number
  maxPoints: number
  passingPoints: number
  fingerprint: string
}

function isExamPass(value: unknown): value is ExamPass {
  if (typeof value !== 'object' || value === null) return false
  const pass = value as Partial<ExamPass>
  return typeof pass.passedAt === 'string' && Number.isFinite(Date.parse(pass.passedAt))
    && Number.isFinite(pass.earnedPoints) && Number.isFinite(pass.maxPoints) && Number.isFinite(pass.passingPoints)
    && typeof pass.fingerprint === 'string' && pass.fingerprint.length > 0
}

interface Props {
  goal: UiGoal
  skillpilotId: string
  language: 'de' | 'en'
}

export function GoalExamPassHistory({ goal, skillpilotId, language }: Props) {
  if (goal.type === 'cluster' || goal.contains.length || !(goal.examData || goal.nodeKind === 'exam')) return null
  return <ExamPassHistory key={JSON.stringify([skillpilotId, goal.id])}
    skillpilotId={skillpilotId} goalId={goal.id} language={language} />
}

function ExamPassHistory({ skillpilotId, goalId, language }: Omit<Props, 'goal'> & { goalId: string }) {
  const [records, setRecords] = useState<ExamPass[] | 'error'>([])
  const [revision, setRevision] = useState(0)
  const de = language === 'de'

  useEffect(() => {
    const refresh = (event: Event) => {
      const { detail } = event as CustomEvent<LearnerUiRefreshDetail>
      if (detail?.skillpilotId === skillpilotId) setRevision(value => value + 1)
    }
    window.addEventListener(LEARNER_UI_REFRESH_EVENT, refresh)
    return () => window.removeEventListener(LEARNER_UI_REFRESH_EVENT, refresh)
  }, [skillpilotId])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      const base = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = `${base}/api/ui/learners/${encodeURIComponent(skillpilotId)}/exam-passes/${encodeURIComponent(goalId)}`
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
      if (!response.ok) throw new Error('Could not load exam passes')
      const data: unknown = await response.json()
      if (!Array.isArray(data) || !data.every(isExamPass)) throw new Error('Invalid exam passes')
      if (!controller.signal.aborted) setRecords(data)
    }
    void load().catch(() => { if (!controller.signal.aborted) setRecords('error') })
    return () => controller.abort()
  }, [skillpilotId, goalId, revision])

  if (records === 'error') {
    return <p role="status" className="mt-3 text-sm text-text-secondary">
      {de ? 'Deine Prüfungsnachweise konnten nicht geladen werden.' : 'Your assessment records could not be loaded.'}{' '}
      <button type="button" className="font-semibold underline" onClick={() => setRevision(value => value + 1)}>
        {de ? 'Erneut laden' : 'Try again'}
      </button>
    </p>
  }
  if (records.length === 0) return null

  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' })
  const number = new Intl.NumberFormat(language)
  return <section aria-label={de ? 'Deine Prüfungsnachweise' : 'Your assessment records'}
    className="mt-3 rounded-xl border border-border-color p-4 text-sm">
    <h3 className="font-semibold text-text-primary">{de ? 'Deine Prüfungsnachweise' : 'Your assessment records'}</h3>
    <p className="mt-1 text-text-secondary">
      {de ? 'Jeder Nachweis gilt für die damals bewertete Prüfungsfassung.'
        : 'Each record applies to the version you passed on that date.'}
    </p>
    <ul className="mt-2 space-y-1">
      {records.map(pass => <li key={pass.fingerprint}>
        <time dateTime={pass.passedAt}>{date.format(new Date(pass.passedAt))}</time>{' · '}
        {de
          ? `Bestanden mit ${number.format(pass.earnedPoints)} von ${number.format(pass.maxPoints)} Punkten (Bestehensgrenze ${number.format(pass.passingPoints)})`
          : `Passed with ${number.format(pass.earnedPoints)} of ${number.format(pass.maxPoints)} points (pass mark ${number.format(pass.passingPoints)})`}
      </li>)}
    </ul>
  </section>
}
