import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LearnerLearningPlanDetail, StoredUnitAssignment, UnitAssignmentOption } from '../learnerLearningPlanTypes'
import { getLearnerLearningPlan, getUnitAssignmentOptions, LearnerLearningPlanApiError, saveLearnerLearningPlan, setUnitAssignmentActivity } from '../utils/learnerLearningPlanApi'
import { berlinDateKey, storedUnitAssignmentAnchor } from '../utils/learnerLearningPlanReadModel'
import { buildCompletionAssessmentStartHref, completionLabel, type LevelCompletion, type UnitAssessment } from '../utils/levelCompletionApi'

interface Props {
  learnerId: string
  landscapeId: string
  assessment: UnitAssessment
  completion: LevelCompletion
  language: string
  storedAssignments?: StoredUnitAssignment[]
  disabled: boolean
  goalTitle: (id: string) => string | undefined
  onSaved: () => Promise<void>
}

export function LearnerUnitAssignment({ learnerId, landscapeId, assessment, completion, language, disabled, storedAssignments, goalTitle, onSaved }: Props) {
  const en = language.startsWith('en')
  const label = (de: string, english: string) => en ? english : de
  const [data, setData] = useState<{ option?: UnitAssignmentOption; plan: LearnerLearningPlanDetail | null }>()
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const day = berlinDateKey()
  const { sectionGoalId, revision } = assessment
  const storedRevision = storedAssignments?.find(row => row.landscapeId === landscapeId)?.revision
  useEffect(() => {
    const controller = new AbortController()
    const options = { signal: controller.signal }
    setData(undefined)
    setError(false)
    const readPlan = getLearnerLearningPlan(learnerId, landscapeId, day, options).catch(reason => {
      if (reason instanceof LearnerLearningPlanApiError && reason.status === 404) return null
      throw reason
    })
    const readOptions = getUnitAssignmentOptions(learnerId, landscapeId, options).catch(reason => {
      if (reason instanceof LearnerLearningPlanApiError && reason.status === 404) return []
      throw reason
    })
    void Promise.all([readOptions, readPlan]).then(([offered, plan]) => {
      if (!controller.signal.aborted) setData({ option: offered.find(item => item.sectionGoalId === sectionGoalId && item.revision === revision), plan })
    }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [learnerId, landscapeId, sectionGoalId, revision, completion.learnerRevision, storedRevision, day, attempt])

  const option = data?.option
  const plan = data?.plan
  const stored = plan?.blocks.filter(block => block.kind === 'learning' && block.unitAssignment?.sectionGoalId === sectionGoalId) ?? []
  const block = stored.find(candidate => candidate.kind === 'learning' && candidate.unitAssignment?.fingerprint === option?.fingerprint
    && candidate.unitAssignment?.revision === option?.revision) ?? (stored.length === 1 ? stored[0] : undefined)
  const management = plan && block && storedAssignments?.find(item => item.planId === plan.planId && item.blockId === block.id)
  const manageLink = management && <a className="mt-2 inline-block min-h-9 underline"
    href={'#' + encodeURIComponent(storedUnitAssignmentAnchor(management.planId, management.blockId))}>{label('Einheitenauftrag verwalten', 'Manage unit assignment')}</a>
  const sameVersion = block?.kind === 'learning' && block.unitAssignment?.revision === option?.revision && block.unitAssignment?.fingerprint === option?.fingerprint
  const needsRebind = Boolean(block && option && !sameVersion)
  const paused = sameVersion && block?.active === false
  const assigned = sameVersion && !paused
  const save = async () => {
    if (!option || !data || assigned || disabled || submitting.current) return
    submitting.current = true
    setSaving(true)
    setError(false)
    try {
      if (paused && management) {
        await setUnitAssignmentActivity(learnerId, management, true)
        await onSaved()
        setAttempt(value => value + 1)
        return
      }
      const title = completionLabel(option.title, language)
      const assignment = { sectionGoalId, revision, fingerprint: option.fingerprint }
      const ids = option.parts.map(item => item.goalId)
      const blocks = (plan?.blocks ?? []).map(item => {
        if (item.kind !== 'learning') return item
        if (item.id === block?.id) return { ...item, active: true, goalIds: [sectionGoalId], atomicGoalIds: ids, unitAssignment: assignment }
        return { ...item, atomicGoalIds: item.atomicGoalIds ?? [] }
      })
      if (!block) blocks.push({ id: crypto.randomUUID(), kind: 'learning', title, goalIds: [sectionGoalId],
        atomicGoalIds: ids, startDate: day, endDate: day, unitAssignment: assignment })
      const saved = await saveLearnerLearningPlan(learnerId, landscapeId, {
        expectedRevision: plan?.revision ?? 0, planLabel: plan ? plan.planLabel ?? undefined : title,
        blocks,
      })
      setData({ option, plan: saved })
      await onSaved()
    } catch {
      setError(true)
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }
  if (error) return <p role="alert" className="mt-2 text-sm">
    {label('Der Einheitenauftrag konnte nicht geladen oder gespeichert werden.', 'The unit assignment could not be loaded or saved.')} {' '}
    <button type="button" className="underline" onClick={() => setAttempt(n => n + 1)}>{label('Neu laden', 'Reload')}</button>
  </p>
  if (!option) return manageLink ?? null
  const next = plan?.nextEligibleGoal?.goalId
  const profileId = 'automatic:' + sectionGoalId
  const startProfile = completion.profileId === profileId ? completion : completion.profileOptions.find(item => item.profileId === profileId)
  const nextPart = option.parts.find(item => item.goalId === next && !item.passed && item.materialCurrent)
  const canTry = nextPart && !disabled && !completion.directAssessmentRunning && startProfile?.assessments?.some(item => item.goalId === next && item.startAvailable)
  return <section data-testid="learner-unit-assignment" className="my-3 rounded-xl border border-border-color p-3 text-sm">
    <h3 className="font-semibold">{label('Einheitenauftrag im Lernplan', 'Unit assignment in your learning plan')}</h3>
    {assigned ? <p data-testid="unit-assignment-status">{option.passed
      ? label('Einheitenauftrag abgeschlossen. Für diesen Auftrag ist keine weitere Pflichtarbeit offen.', 'Unit assignment complete. All required work for this assignment is done.')
      : label('Einheitenauftrag aktiv.', 'Unit assignment active.')} {option.parts.filter(item => item.passed).length} / {option.parts.length}</p>
      : <><p>{needsRebind ? label('Dieser Auftrag gehört zu einer anderen Fassung oder Fachauswahl. Du kannst die aktuelle Fassung ausdrücklich wählen.', 'This assignment belongs to another version or subject selection. You can explicitly choose the current version.') : paused ? label('Dieser Einheitenauftrag ist pausiert.', 'This unit assignment is paused.') : label('Für diesen Auftrag zählen die aufgeführten Prüfungsteile. Einzelziele kannst du getrennt wählen.', 'This assignment requires the listed assessment parts. You can choose individual goals separately.')}</p>
        <button data-testid="unit-assignment-add" type="button" disabled={disabled || saving || (plan?.stale && !needsRebind)}
          className="mt-2 min-h-10 rounded-lg border border-sky-500 px-3 font-semibold disabled:opacity-50" onClick={() => void save()}>
          {needsRebind ? label('Aktuelle Fassung für diesen Auftrag wählen', 'Choose the current version for this assignment')
            : paused ? label('Einheitenauftrag wieder aktivieren', 'Reactivate unit assignment') : label('Einheitenauftrag in den Lernplan aufnehmen', 'Add unit assignment to learning plan')}</button></>}
    {manageLink}
    {plan && <p data-testid="unit-assignment-next" className="mt-2">{label('Nächster Planvorschlag', 'Next learning plan suggestion')}{' · '}
      {next ? goalTitle(next) ?? completionLabel(nextPart?.title ?? {}, language) : label('Kein weiterer Vorschlag', 'No further suggestion')}</p>}
    {assigned && canTry && <Link data-testid="unit-assignment-try" className="mt-2 inline-block min-h-9 underline"
      to={buildCompletionAssessmentStartHref({ profileId, goalId: nextPart.goalId, expectedRevision: completion.learnerRevision })}>
      {label('Vorgeschlagenen Prüfungsteil versuchen', 'Try the suggested assessment part')}</Link>}
    {assigned && next && !option.parts.some(part => part.goalId === next) &&
      <Link data-testid="unit-assignment-next-individual" className="mt-2 inline-block min-h-9 underline"
        to={'/learner/' + encodeURIComponent(next)}>{label('Zum nächsten Einzelauftrag', 'Open the next individual assignment')}</Link>}
  </section>
}
