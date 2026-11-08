import type { Learner } from '../src/learnerTypes'
import type { PersonalizationOption, PersonalizationPlan } from '../src/utils/personalCurriculumEditorApi'
import type { LevelCompletion } from '../src/utils/levelCompletionApi'
import type { LearnerLearningPlansResponse, LearnerLearningPlanSummary, LearnerPlanSubjectStatus } from '../src/learnerLearningPlanTypes'
import type { ReviewItem } from '../src/components/srs/srsLogic'
import { learnerPlanStatus } from '../scripts/fixtures/learnerPlanStatus'
import { fullCockpitData, type FullCockpitData } from './fullCockpitData'

export type FullCockpitScenario = 'ordinary' | 'exam' | 'memory' | 'completed'
export interface FullCockpitSnapshot {
  version: number
  scenario: FullCockpitScenario
  mastery: Record<string, number>
  /** Derived display result of the explicitly fictional completed scenario. */
  implicitGoalIds: string[]
  activeGoalId: string
  plannedGoalIds: string[]
  profile: Learner
  deleted: boolean
}
export interface FullCockpitRequest { method: string; path: string; status: number }
export interface FullCockpitApi {
  install: () => () => void
  uninstall: () => void
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => FullCockpitSnapshot
  reset: () => void
  selectScenario: (scenario: FullCockpitScenario) => void
  requests: FullCockpitRequest[]
  unexpectedRequests: FullCockpitRequest[]
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const title = (de: string) => ({ de, en: de })
const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const stringIds = (value: unknown): string[] => Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

/** An in-memory transport for the real LearnerView; never a production proxy. */
export function createFullCockpitApi(data: FullCockpitData = fullCockpitData): FullCockpitApi {
  const listeners = new Set<() => void>()
  const sources = new Set<LocalEventSource>()
  const requests: FullCockpitRequest[] = []
  const unexpectedRequests: FullCockpitRequest[] = []
  let installed = false
  let nativeFetch: typeof fetch | undefined
  let nativeEventSource: typeof EventSource | undefined
  let interceptedFetch: typeof fetch | undefined
  let version = 1
  let completionSelected = false
  let completionPaused = false
  let materialRevision = 0
  let selectedPackageIds = ['fixture-local-math-context']
  let srsUpdatedAt: string | null = null
  let srsState: Record<string, ReviewItem> = {}
  let editorOpen = false
  let editorSelected = [data.mathLandscapeId, data.physicsLandscapeId]
  const now = () => new Date().toISOString()
  const day = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const initialProfile = (): Learner => ({
    skillpilotId: data.learnerId, selectedCurriculum: data.rootLandscapeId, createdAt: now(),
    personalCurriculum: JSON.stringify({
      [data.rootLandscapeId]: { selected: true, filterId: 'DE-HE', durationModel: 'G9', stage: 'CrossStage' },
      [data.mathLandscapeId]: { selected: true }, [data.physicsLandscapeId]: { selected: true },
      __skillpilot_stage_scope_sek1__: { selected: true }, __skillpilot_stage_scope_sek2__: { selected: true },
    }),
    learningStrategy: 'SEQUENTIAL', autoPilot: false, followLearningPlans: true, learningPlanPeriodBasis: 'DAY',
    learningPlanCountOnlyExplicitGoals: true, strictMode: false, useAssessmentShortcuts: true,
    showGoalVisualizationsInChat: true, activeGoalId: data.ordinaryId,
    copySources: [{ sourceId: 'fixture-local-source', copiedAt: now() }],
  })
  let snapshot: FullCockpitSnapshot = { version, scenario: 'ordinary', mastery: {}, implicitGoalIds: [], activeGoalId: data.ordinaryId,
    plannedGoalIds: [data.mathScopeId], profile: initialProfile(), deleted: false }
  const selectedLandscapes = () => {
    const config = asRecord(JSON.parse(snapshot.profile.personalCurriculum))
    return data.availableLandscapes.filter(item => asRecord(config[item.landscapeId]).selected !== false).map(item => item.landscapeId)
  }
  const revalidateLocalScope = () => {
    const selected = selectedLandscapes()
    const activeLandscape = data.goalIndexAll.get(snapshot.activeGoalId)?.landscapeId
    if (activeLandscape && selected.includes(activeLandscape)) return
    const physics = !selected.includes(data.mathLandscapeId) && selected.includes(data.physicsLandscapeId)
    snapshot = { ...snapshot, activeGoalId: physics ? data.physicsGoalId : data.ordinaryId,
      plannedGoalIds: [physics ? data.physicsLandscapeId : data.mathScopeId] }
  }
  const sanitizePractice = (value: unknown): Record<string, ReviewItem> => {
    const known = new Set(data.deck.cards.map(card => card.id))
    const result: Record<string, ReviewItem> = {}
    for (const [id, entry] of Object.entries(asRecord(value))) {
      if (!known.has(id)) continue
      const item = asRecord(entry)
      if (![item.interval, item.repetition, item.ef, item.nextReview].every(value => typeof value === 'number' && Number.isFinite(value))) continue
      result[id] = { id, interval: Number(item.interval), repetition: Number(item.repetition), ef: Number(item.ef), nextReview: Number(item.nextReview) }
    }
    return result
  }

  class LocalEventSource extends EventTarget {
    static readonly CONNECTING = 0
    static readonly OPEN = 1
    static readonly CLOSED = 2
    readonly CONNECTING = 0
    readonly OPEN = 1
    readonly CLOSED = 2
    readyState = 1
    readonly withCredentials = false
    readonly url: string
    onopen: ((event: Event) => void) | null = null
    onmessage: ((event: MessageEvent) => void) | null = null
    onerror: ((event: Event) => void) | null = null
    constructor(url: string | URL) {
      super()
      this.url = String(url)
      sources.add(this)
      queueMicrotask(() => { if (this.readyState === 1) this.onopen?.(new Event('open')) })
    }
    close() { this.readyState = 2; sources.delete(this) }
    send(type: string, nodeId?: string) {
      if (this.readyState !== 1 || !this.url.endsWith(`/api/ui/updates/${data.learnerId}`)) return
      this.onmessage?.(new MessageEvent('message', { data: JSON.stringify({ type, nodeId, timestamp: Date.now() }) }))
    }
  }
  const emit = (type = 'FULL_REFRESH', nodeId?: string) => {
    snapshot = { ...snapshot, version: ++version, profile: { ...snapshot.profile, activeGoalId: snapshot.activeGoalId },
      mastery: { ...snapshot.mastery }, plannedGoalIds: [...snapshot.plannedGoalIds],
      implicitGoalIds: snapshot.scenario === 'completed' && snapshot.mastery[data.assessmentId] === 1 && snapshot.mastery[data.ordinaryId] !== 1
        ? [data.ordinaryId] : [] }
    listeners.forEach(listener => listener())
    sources.forEach(source => source.send(type, nodeId))
  }
  const atomsBelow = (ids: readonly string[]): string[] => {
    const found = new Set<string>()
    const visited = new Set<string>()
    const visit = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      const goal = data.goalIndexAll.get(id)
      if (!goal) return
      if (goal.contains.length) goal.contains.forEach(visit)
      else found.add(id)
    }
    ids.forEach(visit)
    return [...found]
  }
  const completed = (ids: readonly string[]) => ids.filter(id => snapshot.mastery[id] === 1 || snapshot.implicitGoalIds.includes(id)).length
  const explicitlyCompleted = (ids: readonly string[]) => ids.filter(id => snapshot.mastery[id] === 1).length
  const completion = (): LevelCompletion | null => {
    const automatic = !completionSelected || snapshot.scenario === 'completed'
    const implicit = snapshot.implicitGoalIds.includes(data.ordinaryId)
    const shortcuts = snapshot.profile.useAssessmentShortcuts !== false
    if (!shortcuts && !implicit) return null
    const assessments = [{ goalId: data.assessmentId, title: title(data.goalIndexAll.get(data.assessmentId)!.title),
      mastered: snapshot.mastery[data.assessmentId] === 1,
      startAvailable: shortcuts && snapshot.mastery[data.assessmentId] !== 1,
      ...(!shortcuts ? { unavailableReason: 'assessment_shortcuts_disabled' } : {}) }]
    return {
      calculationStatus: 'valid', learnerRevision: version,
      title: title('Lokaler Prüfungsweg · Skalarprodukt'),
      contextRef: 'fixture-local-completion', profileId: automatic ? 'automatic:fixture-full-overview' : 'fixture-dot-product',
      profileRevision: '1', curriculumGeneration: 'fixture-local', complete: completed(data.targetGoalIds) === 2,
      masteredTargetCount: explicitlyCompleted(data.targetGoalIds), waivedTargetCount: implicit ? 1 : 0,
      pendingTargetCount: 2 - completed(data.targetGoalIds), targetCount: 2,
      masteredAssessmentCount: assessments[0].mastered ? 1 : 0, requiredAssessmentCount: 1,
      waivedTargetGoalIds: implicit ? [data.ordinaryId] : [],
      waiverDetails: implicit ? [{ goalId: data.ordinaryId, title: title(data.goalIndexAll.get(data.ordinaryId)!.title),
        ruleId: 'no_remaining_demand', assessments: [{ goalId: data.assessmentId, title: assessments[0].title }], assessmentCount: 1 }] : [],
      assessments,
      profileOptions: shortcuts && snapshot.scenario !== 'completed' ? [{ profileId: 'fixture-dot-product', title: title('Skalarprodukt und Projektion · lokale Vorschau'), targetCount: 2,
        requiredAssessmentCount: 1, assessments }] : [],
      directAssessmentRunning: false,
      ...(!automatic && completionPaused ? { navigationIntent: 'paused' as const } : {}),
      actions: !automatic ? [
        { action: 'learnGoal', goalId: data.ordinaryId, title: title('Fachziel weiterlernen'), intent: 'required' },
        { action: 'pauseProfile', title: title('Prüfungsweg pausieren') },
        { action: 'leaveProfile', title: title('Zur regulären Lernansicht') },
      ] : [],
    }
  }
  const state = () => {
    const scope = atomsBelow(snapshot.plannedGoalIds)
    const all = atomsBelow(selectedLandscapes())
    const frontier = data.inspectableGoalIds.filter(id => snapshot.mastery[id] !== 1 && !snapshot.implicitGoalIds.includes(id)).map(id => {
      const goal = data.goalIndexAll.get(id)!
      return { id, title: goal.title, description: goal.description, type: 'atomic', nodeKind: goal.nodeKind, reason: 'local-fixture' }
    })
    return { activeGoal: { id: snapshot.activeGoalId }, frontier,
      goals: { planned: snapshot.plannedGoalIds.map(id => ({ id })), mastered_count: completed(scope), total_count: scope.length,
        personalized: { mastered_atomic: completed(all), total_atomic: all.length } },
      stateMachine: { activeGoal: { id: snapshot.activeGoalId }, goalOptions: frontier, requiredAction: null }, levelCompletion: completion() }
  }

  const plans = (language: string): LearnerLearningPlansResponse => {
    const asOf = day()
    const week = snapshot.profile.learningPlanPeriodBasis === 'WEEK'
    const subject = (physics: boolean): LearnerPlanSubjectStatus => {
      const ids = physics ? [data.physicsGoalId] : data.targetGoalIds
      const subjectIds = atomsBelow([physics ? data.physicsLandscapeId : data.mathLandscapeId])
      const achieved = completed(ids)
      const subjectAchieved = completed(subjectIds)
      const periodCompleted = explicitlyCompleted(subjectIds)
      const subjectLabel = physics ? 'Physik · UI-Testdaten' : 'Mathematik'
      const periodTarget = week ? 8 : 2
      return { subjectKey: physics ? 'physik' : 'mathematik', landscapeIds: [physics ? data.physicsLandscapeId : data.mathLandscapeId],
        subjectLabel, evaluable: true, periodText: `${week ? 'Wochenziel' : 'Tagesziel'} ${periodCompleted} von ${periodTarget}`,
        planStatusText: physics ? 'im Plan' : '1 Lernziel im Rückstand',
        subjectLine: `${subjectLabel}: ${periodCompleted} von ${periodTarget} · fiktiver Testplan`,
        statusDirection: physics ? 'on_track' : 'behind', current: data.goalIndexAll.get(snapshot.activeGoalId)?.landscapeId === (physics ? data.physicsLandscapeId : data.mathLandscapeId), canContinue: true,
        periodGauge: { completed: periodCompleted, target: periodTarget, needlePosition: Math.min(1, periodCompleted / periodTarget) },
        balanceGauge: { net: physics ? 0 : -1, typicalAmount: 2, scaleLimit: 4, needlePosition: physics ? 0 : -0.25,
          severeBehind: false, strongAhead: false }, achievedGoalCount: subjectAchieved, targetGoalCount: subjectIds.length,
        planCreditText: 'Alle Planwerte sind vorgegebene lokale UI-Testdaten.',
        learningScope: { kind: 'plan', sourceBlockId: null, title: physics ? 'Fiktiver Physik-Testumfang' : 'Skalarprodukt und Projektion · 2 Ziele',
          goalIds: ids, achievedGoalCount: achieved, targetGoalCount: ids.length, needlePosition: achieved / ids.length,
          schedulingState: 'scheduled', progressText: `${achieved} von ${ids.length} Zielen im Testumfang geschafft.` } }
    }
    const makePlan = (physics: boolean): LearnerLearningPlanSummary => ({
      planId: physics ? 'fixture-physics-plan' : 'fixture-math-plan', revision: version,
      landscapeId: physics ? data.physicsLandscapeId : data.mathLandscapeId, planLabel: physics ? 'Physik · fiktiver Zeitplan' : 'Mathematik · fiktiver Zeitplan', stale: false,
      period: { startDate: asOf, endDate: '2027-06-30' },
      currentBlock: { blockId: physics ? 'fixture-physics-block' : 'fixture-math-block', kind: 'learning', title: 'Aktueller Lernabschnitt',
        goalIds: physics ? [data.physicsGoalId] : data.targetGoalIds, startDate: asOf, endDate: '2026-12-15' },
      nextMilestone: { blockId: physics ? 'fixture-physics-milestone' : 'fixture-math-milestone', title: 'Nächster geplanter Abschluss', date: '2026-12-15',
        goalIds: physics ? [data.physicsGoalId] : data.targetGoalIds },
      buffer: { totalWorkdays: 5, remainingWorkdays: 3 }, nextEligibleGoal: { goalId: physics ? data.physicsGoalId : snapshot.mastery[data.ordinaryId] ? data.assessmentId : data.ordinaryId },
      continueReason: null, canContinue: true,
    })
    const selected = selectedLandscapes()
    const subjects = [subject(false), subject(true)].filter(item => item.landscapeIds.some(id => selected.includes(id)))
    return { asOf, followLearningPlans: snapshot.profile.followLearningPlans ?? true,
      status: learnerPlanStatus(asOf, [], { language: language === 'en' ? 'en' : 'de', periodBasis: week ? 'WEEK' : 'DAY',
        periodStart: asOf, periodEnd: asOf, subjects, statusText: 'Fiktiver lokaler Lernplan. Keine Produktionsdaten.', noticeText: null,
        followLearningPlans: snapshot.profile.followLearningPlans ?? true,
        activeGoal: { title: data.goalIndexAll.get(snapshot.activeGoalId)!.title, announcement: `Dein aktives Lernziel: ${data.goalIndexAll.get(snapshot.activeGoalId)!.title}` } }),
      plans: [makePlan(false), makePlan(true)].filter(item => selected.includes(item.landscapeId)) }
  }

  const editorOption = (landscapeId: string, label: string): PersonalizationOption => ({
    optionId: `fixture-select:${landscapeId}`, stageId: 'fixture-subjects', groupId: 'subject', groupInstanceId: 'fixture-subjects',
    landscapeId, landscapeLabel: label, filterId: null, filterLabel: null, scopeKey: null, scopeValue: null, scopeLabel: null, kind: 'VALUE',
  })
  const editor = (): PersonalizationPlan => {
    const options = data.availableLandscapes.map(item => editorOption(item.landscapeId, item.title))
    const selectedOptions = options.filter(option => editorSelected.includes(option.landscapeId!))
    return { stage: editorOpen ? 'SELECTION' : 'COMPLETE', stageId: editorOpen ? 'fixture-subjects' : null,
      stageLabel: editorOpen ? 'Lokale Fächerauswahl' : null, groupId: editorOpen ? 'subject' : null,
      groupLabel: editorOpen ? 'Fächer im UI-Test' : null, groupInstanceId: editorOpen ? 'fixture-subjects' : null,
      minSelections: editorOpen ? 1 : 0, maxSelections: editorOpen ? 2 : 0, selectedCount: editorOpen ? selectedOptions.length : 0,
      options: editorOpen ? [...options, { ...editorOption('', 'Auswahl übernehmen'), optionId: 'fixture-finish', kind: 'COMPLETE_GROUP' }] : [],
      displayOptions: editorOpen ? options : [], navigationOptions: [], currentSelectedOptions: editorOpen ? selectedOptions : [],
      currentRewindId: editorOpen ? null : 'fixture-subjects',
      completedDecisions: editorOpen ? [] : [{ rewindId: 'fixture-subjects', stageId: 'fixture-subjects', stageLabel: 'Lokaler Testkatalog',
        groupId: 'subject', groupLabel: 'Fächer', groupInstanceId: 'fixture-subjects', selectedOptions }],
      preservedDecisions: [], pendingDecisions: [], canReopenMigratedPersonalization: false, problemCode: null }
  }
  const retain = () => ({ lastActivityAt: now(), scheduledDeletionAt: new Date(Date.now() + 365 * 86400000).toISOString() })
  const selectScenario = (scenario: FullCockpitScenario) => {
    snapshot = { ...snapshot, scenario, deleted: false, mastery: scenario === 'completed' ? { [data.assessmentId]: 1 } : {},
      activeGoalId: scenario === 'exam' ? data.assessmentId : scenario === 'memory' ? data.memoryId : data.ordinaryId,
      plannedGoalIds: [scenario === 'memory' ? data.memoryId : data.mathScopeId] }
    srsState = {}
    srsUpdatedAt = null
    // Replacing the local learner context must refresh preferences, state and
    // plans even when an earlier scenario's generic refresh is still running.
    emit('PREFERENCES_CHANGED')
  }
  const reset = () => {
    snapshot = { ...snapshot, profile: initialProfile() }
    completionSelected = false; completionPaused = false; materialRevision = 0; selectedPackageIds = ['fixture-local-math-context']
    editorOpen = false; editorSelected = [data.mathLandscapeId, data.physicsLandscapeId]
    selectScenario('ordinary')
  }

  const handleFetch: typeof fetch = async (input, init) => {
    const rawUrl = input instanceof Request ? input.url : String(input)
    const url = new URL(rawUrl, window.location.origin)
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const path = url.pathname
    const json = (body: unknown, status = 200) => {
      requests.push({ method, path, status })
      return new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    }
    const reject = (reason: string, status = 501) => {
      const entry = { method, path, status }
      unexpectedRequests.push(entry)
      console.warn(`[FullCockpit local adapter] ${reason}: ${method} ${path}`)
      return json({ error: reason, message: 'Dieser Vorgang ist im lokalen Cockpit-Test nicht mit dem Produkt verbunden.' }, status)
    }
    if (init?.signal?.aborted || (input instanceof Request && input.signal.aborted)) throw new DOMException('Aborted', 'AbortError')
    if (url.origin !== window.location.origin) return reject('External request blocked', 403)
    if (path === data.deckUrl) return json(data.deck)
    if (!path.startsWith('/api/')) return nativeFetch!(input, init)
    if (path === '/api/ui/curriculum-catalog') return json({ error: 'Local repository resource mode' }, 404)
    if (path === '/api/ui/landscapes') return json({ summaries: [{ curriculumId: data.rootLandscapeId, filename: 'fixture-local.json',
      country: 'DE', region: 'DE', type: 'GYMNASIUM', level: 'Sekundarstufe', subject: 'Lokaler Testkatalog', locale: 'de-DE',
      title: 'Lokaler Cockpit-Test', schoolType: 'Gymnasium', qualityMaturity: 'M6' }] })
    // Original dialogs remain reachable, but this boundary cannot issue a real
    // coach session, install binding, feedback publication or authentication.
    if (/\/(?:claude|openai|gemini)\/(?:v1\/)?/u.test(path) || /\/(?:sessions?|chat-start)(?:\/|$)/u.test(path)
      || path.startsWith('/api/public/goal-feedback/')) return json({
      error: 'local-preview-only', message: 'Lokale Vorschau: keine echte Coach-Verbindung oder Veröffentlichung.',
    }, 501)
    const prefix = `/api/ui/learners/${encodeURIComponent(data.learnerId)}`
    if (!(path === prefix || path.startsWith(`${prefix}/`))) return reject('Unknown local API endpoint')
    const suffix = path.slice(prefix.length)
    if (snapshot.deleted) return json({ error: 'Local fixture learner deleted' }, 404)
    const rawBody = init?.body ?? (input instanceof Request && !['GET', 'HEAD'].includes(method) ? await input.clone().text() : '')
    let body: Record<string, unknown> = {}
    try { if (typeof rawBody === 'string' && rawBody) body = asRecord(JSON.parse(rawBody)) }
    catch { return json({ error: 'Malformed local JSON body' }, 400) }
    if (!suffix && method === 'GET') return json(snapshot.profile)
    if (suffix === '/resume' && method === 'POST' || suffix === '/retention' && method === 'GET') return json(retain())
    if (suffix === '/state' && method === 'GET') return json(state())
    if (suffix === '/planned' && method === 'GET') return json({ goals: snapshot.plannedGoalIds })
    if (suffix === '/planned' && method === 'PUT') {
      const ids = stringIds(body.goals)
      if (!ids.length || ids.some(id => !data.goalIndexAll.has(id))) return json({ error: 'Invalid local focus' }, 400)
      snapshot = { ...snapshot, plannedGoalIds: ids }; emit(); return json(state())
    }
    if (suffix === '/active-goal' && method === 'POST') {
      if (typeof body.goalId !== 'string' || !data.goalIndexAll.has(body.goalId)) return json({ error: 'Unknown local goal' }, 400)
      snapshot = { ...snapshot, activeGoalId: body.goalId }; emit(); return json(state())
    }
    if (suffix === '/learning-plans' && method === 'GET') return json(plans(url.searchParams.get('language') ?? 'de'))
    if (/^\/learning-plans\/(?:reconcile|[^/]+\/(?:switch|continue))$/u.test(suffix) && method === 'POST') {
      if (typeof body.expectedRevision === 'number' && body.expectedRevision !== version) return json({ error: 'Local revision conflict' }, 409)
      const physics = suffix.includes('fixture-physics-plan')
      snapshot = { ...snapshot, activeGoalId: physics ? data.physicsGoalId : data.ordinaryId,
        plannedGoalIds: [physics ? data.physicsLandscapeId : data.mathScopeId] }
      emit()
      return json({ planId: physics ? 'fixture-physics-plan' : 'fixture-math-plan', revision: version,
        landscapeId: physics ? data.physicsLandscapeId : data.mathLandscapeId, focusGoalId: snapshot.plannedGoalIds[0],
        activeGoalId: snapshot.activeGoalId, changed: true, state: state() })
    }
    if (suffix === '/preferences' && method === 'PUT') {
      const { strategy, ...prefs } = body
      snapshot = { ...snapshot, profile: { ...snapshot.profile, ...prefs,
        ...(strategy === 'RANDOM' || strategy === 'SEQUENTIAL' ? { learningStrategy: strategy } : {}) } }
      emit('PREFERENCES_CHANGED'); return json({})
    }
    if (suffix === '/personal-curriculum' && method === 'PUT') {
      snapshot = { ...snapshot, profile: { ...snapshot.profile, personalCurriculum: JSON.stringify(body) } }
      revalidateLocalScope()
      emit(); return json({})
    }
    if (suffix === '/personalization-plan' && method === 'GET') return json(editor())
    if (['/personalization-restart', '/personalization-reopen', '/personalization-rewind'].includes(suffix) && method === 'POST') {
      editorSelected = selectedLandscapes()
      editorOpen = true; return json(editor())
    }
    if (suffix === '/personalization-options' && method === 'POST') {
      if (body.optionId === 'fixture-finish') {
        if (!editorSelected.length) return json({ error: 'Choose at least one local subject' }, 400)
        editorOpen = false
      }
      else if (typeof body.optionId === 'string' && body.optionId.startsWith('fixture-select:')) {
        const id = body.optionId.slice('fixture-select:'.length)
        if (!data.availableLandscapes.some(item => item.landscapeId === id)) return json({ error: 'Unknown local option' }, 400)
        editorSelected = editorSelected.includes(id) ? editorSelected.filter(value => value !== id) : [...editorSelected, id]
      } else return json({ error: 'Unknown local option' }, 400)
      if (!editorOpen) {
        const config = asRecord(JSON.parse(snapshot.profile.personalCurriculum))
        for (const item of data.availableLandscapes) config[item.landscapeId] = { selected: editorSelected.includes(item.landscapeId) }
        snapshot = { ...snapshot, profile: { ...snapshot.profile, personalCurriculum: JSON.stringify(config) } }
        revalidateLocalScope(); emit()
      }
      return json(editor())
    }
    if (suffix === '/content-selection' && ['GET', 'PUT'].includes(method)) {
      if (method === 'PUT') {
        if (body.expectedRevision !== materialRevision) return json({ error: 'Local material revision conflict' }, 409)
        selectedPackageIds = stringIds(body.selectedPackageIds); materialRevision += 1
      }
      return json({ revision: materialRevision, selectedPackageIds, packages: [{ packageId: 'fixture-local-math-context', version: '1.0.0',
        title: 'Materialpaket · UI-Testdaten', description: 'Fiktives Beispielpaket für die vorhandene Materialauswahl. Öffnen bleibt eine lokale Vorschau.',
        providerName: 'Lokaler Testanbieter', providerUrl: 'https://materials.example.invalid/', access: 'public-link', aiUsage: 'link-only', materialCount: 1 }] })
    }
    if (suffix === '/content-materials' && method === 'GET') return json(selectedPackageIds.length ? [{
      title: 'Ergänzendes Material · UI-Testverweis', url: 'https://materials.example.invalid/cockpit-math', provider: 'Lokaler Testanbieter',
      resourceType: 'article', language: 'de', sections: [], access: 'public-link', aiUsage: 'link-only',
    }] : [])
    if (suffix === `/client-state/${data.memoryId}` && ['GET', 'PUT'].includes(method)) {
      if (method === 'PUT') {
        if ((body.expectedUpdatedAt ?? null) !== srsUpdatedAt) return json({ error: 'Local SRS revision conflict' }, 409)
        const next = sanitizePractice(body.srsState)
        for (const [id, item] of Object.entries(next)) if (srsState[id]?.verifiedRecall) item.verifiedRecall = srsState[id].verifiedRecall
        srsState = next; srsUpdatedAt = now(); emit('CLIENT_STATE_UPDATED', data.memoryId); return json({ savedAt: srsUpdatedAt })
      }
      return json({ updatedAt: srsUpdatedAt, srsState })
    }
    if (suffix === '/history' && method === 'GET') return json(Object.keys(snapshot.mastery).filter(id => snapshot.mastery[id] === 1)
      .map(goalId => ({ goalId, timestamp: now(), value: 1, source: 'completion_event' })))
    if (suffix === '/level-completion/actions' && method === 'POST') {
      if (body.expectedRevision !== version) return json({ error: 'Local completion revision conflict' }, 409)
      if (body.action === 'selectProfile') completionSelected = true
      else if (body.action === 'leaveProfile') { completionSelected = false; completionPaused = false }
      else if (body.action === 'pauseProfile') completionPaused = true
      else if (body.action === 'learnGoal' && typeof body.goalId === 'string' && data.goalIndexAll.has(body.goalId)) {
        completionPaused = false; snapshot = { ...snapshot, activeGoalId: body.goalId }
      } else return json({ error: 'Unsupported local completion action' }, 400)
      emit(); return json(state())
    }
    if (suffix === '/export' && method === 'GET') return json({ schema: 'skillpilot-local-cockpit-demo/v1', notice: data.notice,
      snapshot: clone(snapshot), srsState, srsUpdatedAt, selectedPackageIds })
    if (suffix === '/import' && method === 'POST') {
      if (body.schema !== 'skillpilot-local-cockpit-demo/v1') return json({ error: 'Only this local demo format can be imported; no server signature is claimed.' }, 400)
      const incoming = asRecord(body.snapshot)
      if (typeof incoming.activeGoalId !== 'string' || !data.goalIndexAll.has(incoming.activeGoalId)) return json({ error: 'Invalid local snapshot' }, 400)
      const mastery = Object.fromEntries(Object.entries(asRecord(incoming.mastery)).filter(([id, value]) => data.goalIndexAll.has(id) && (value === 0 || value === 1))) as Record<string, number>
      const importedProfile = asRecord(incoming.profile)
      const profile: Learner = { ...snapshot.profile }
      for (const key of ['autoPilot', 'followLearningPlans', 'learningPlanCountOnlyExplicitGoals', 'strictMode', 'useAssessmentShortcuts', 'showGoalVisualizationsInChat'] as const) {
        if (typeof importedProfile[key] === 'boolean') profile[key] = importedProfile[key]
      }
      if (importedProfile.learningStrategy === 'RANDOM' || importedProfile.learningStrategy === 'SEQUENTIAL') profile.learningStrategy = importedProfile.learningStrategy
      if (importedProfile.learningPlanPeriodBasis === 'DAY' || importedProfile.learningPlanPeriodBasis === 'WEEK') profile.learningPlanPeriodBasis = importedProfile.learningPlanPeriodBasis
      if (typeof importedProfile.personalCurriculum === 'string') {
        try { profile.personalCurriculum = JSON.stringify(asRecord(JSON.parse(importedProfile.personalCurriculum))) }
        catch { return json({ error: 'Invalid local curriculum configuration' }, 400) }
      }
      const focus = stringIds(incoming.plannedGoalIds).filter(id => data.goalIndexAll.has(id))
      const scenario = ['ordinary', 'exam', 'memory', 'completed'].includes(String(incoming.scenario)) ? incoming.scenario as FullCockpitScenario : 'ordinary'
      snapshot = { ...snapshot, mastery, profile, scenario, activeGoalId: incoming.activeGoalId,
        plannedGoalIds: focus.length ? focus : [data.mathScopeId] }
      // The local archive restores practice, never a claimed signed recall result.
      srsState = sanitizePractice(body.srsState); srsUpdatedAt = now()
      selectedPackageIds = stringIds(body.selectedPackageIds).filter(id => id === 'fixture-local-math-context'); materialRevision += 1
      delete snapshot.mastery[data.memoryId]
      revalidateLocalScope()
      emit(); return json({})
    }
    if (!suffix && method === 'DELETE') {
      if (body.confirmationSkillpilotId !== data.learnerId) return json({ error: 'Local confirmation mismatch' }, 400)
      snapshot = { ...snapshot, deleted: true }; emit(); return json(null, 204)
    }
    return reject('Unsupported local API operation')
  }
  const uninstall = () => {
    if (!installed) return
    if (window.fetch === interceptedFetch && nativeFetch) window.fetch = nativeFetch
    if (window.EventSource === LocalEventSource as unknown as typeof EventSource && nativeEventSource) window.EventSource = nativeEventSource
    sources.forEach(source => source.close())
    installed = false
  }
  const install = () => {
    if (!installed) {
      nativeFetch = window.fetch
      nativeEventSource = window.EventSource
      interceptedFetch = handleFetch
      window.fetch = handleFetch
      window.EventSource = LocalEventSource as unknown as typeof EventSource
      installed = true
    }
    return uninstall
  }
  return { install, uninstall, subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
    getSnapshot: () => snapshot, reset, selectScenario, requests, unexpectedRequests }
}
