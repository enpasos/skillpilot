import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Copy as CopyIcon, Home, ListChecks, RefreshCw, Save, XCircle } from 'lucide-react'
import { LanguageToggle } from '../components/LanguageToggle'
import { InlineMathText } from '../components/InlineMathText'
import { useLanguage } from '../contexts/LanguageContext'
import { requestJson } from '../utils/authoring/authoringClient'

type ReviewDecision = 'atomic' | 'needs_developer_review' | 'non_atomic'
type ItemFreshness = 'current' | 'missing' | 'stale'
type FilterKey = 'queue' | 'all' | ReviewDecision | 'missing' | 'stale'

interface ConfigSummary {
  path: string
  reviewId: string
  ruleVersion: string
  label: string
}

interface SemanticAtomicityConfig {
  reviewId: string
  ruleVersion: string
  landscapeId: string
  scope?: {
    label?: string
    rootGoalIds?: string[]
  }
}

interface ReviewRecord {
  schemaVersion?: number
  reviewId?: string
  ruleVersion?: string
  landscapeId?: string
  goalId: string
  fingerprint?: string
  status: ReviewDecision
  semanticAtomic?: boolean | null
  reviewedAt?: string
  reviewer?: string
  reason?: string
  suggestedAction?: string
  suggestedSplit?: string[]
}

interface ReviewGoal {
  id: string
  shortKey?: string
  title?: string
  titleEn?: string
  description?: string
  descriptionEn?: string
  dimensionTags?: Record<string, unknown>
}

interface ReviewItem {
  goal: ReviewGoal
  fingerprint: string
  status: ItemFreshness
  record: ReviewRecord | null
}

interface ListResponse {
  configs: ConfigSummary[]
}

interface LoadResponse {
  configPath: string
  reviewPath: string
  config: SemanticAtomicityConfig
  items: ReviewItem[]
  obsoleteRecords: ReviewRecord[]
}

interface SaveResponse {
  reviewPath: string
  savedRecords: number
}

const COPY = {
  de: {
    title: 'Semantic Atomicity Review',
    subtitle: 'Lokale Arbeit an Findings-Dateien für semantisch atomare Blattlernziele.',
    boundary: 'Semantische Bulkprüfung: Codex/CLI. Diese Seite: Ledger laden, Queue bearbeiten, Fingerprints speichern.',
    backHome: 'Startseite',
    workbench: 'Workbench',
    config: 'Review-Datei',
    refresh: 'Neu laden',
    save: 'Speichern',
    saving: 'Speichern ...',
    search: 'Suchen',
    noConfig: 'Keine Review-Konfiguration gefunden.',
    loading: 'Laden ...',
    empty: 'Keine Ziele für diesen Filter.',
    paths: 'Dateien',
    reviewPath: 'Ledger',
    configPath: 'Config',
    codexPromptTitle: 'Prompt für Codex',
    codexPromptCopy: 'Prompt kopieren',
    codexPromptCopied: 'Prompt kopiert.',
    codexPromptCopyFailed: 'Prompt konnte nicht kopiert werden.',
    goalCodexPromptCopy: 'Codex-Auftrag kopieren',
    goalCodexPromptCopied: 'Codex-Auftrag kopiert.',
    counts: {
      all: 'Alle',
      queue: 'Queue',
      atomic: 'Atomar',
      needs_developer_review: 'Entwicklerprüfung',
      non_atomic: 'Nicht atomar',
      missing: 'Fehlend',
      stale: 'Veraltet',
      obsolete: 'Obsolet',
    },
    freshness: {
      current: 'aktuell',
      missing: 'fehlend',
      stale: 'veraltet',
    },
    decisions: {
      atomic: 'semantisch atomar',
      needs_developer_review: 'Entwicklerprüfung',
      non_atomic: 'nicht atomar',
    },
    fields: {
      decision: 'Bewertung',
      reason: 'Begründung',
      action: 'Empfohlene Aktion',
      split: 'Split-Vorschlag',
      fingerprint: 'Fingerprint',
      reviewer: 'Reviewer',
      reviewedAt: 'Review-Datum',
    },
    placeholders: {
      reason: 'Kurz begründen, warum das Ziel atomar ist oder geprüft werden muss.',
      action: 'Optional: nächster konkreter Schritt.',
      split: 'Optional: ein Ziel pro Zeile.',
    },
    saved: (count: number) => `${count} Review-Records gespeichert.`,
  },
  en: {
    title: 'Semantic Atomicity Review',
    subtitle: 'Local work on findings files for semantically atomic leaf learning goals.',
    boundary: 'Semantic bulk review: Codex/CLI. This page: load ledgers, edit queue, save fingerprints.',
    backHome: 'Home',
    workbench: 'Workbench',
    config: 'Review file',
    refresh: 'Reload',
    save: 'Save',
    saving: 'Saving ...',
    search: 'Search',
    noConfig: 'No review configuration found.',
    loading: 'Loading ...',
    empty: 'No goals for this filter.',
    paths: 'Files',
    reviewPath: 'Ledger',
    configPath: 'Config',
    codexPromptTitle: 'Prompt for Codex',
    codexPromptCopy: 'Copy prompt',
    codexPromptCopied: 'Prompt copied.',
    codexPromptCopyFailed: 'Could not copy prompt.',
    goalCodexPromptCopy: 'Copy Codex task',
    goalCodexPromptCopied: 'Codex task copied.',
    counts: {
      all: 'All',
      queue: 'Queue',
      atomic: 'Atomic',
      needs_developer_review: 'Developer review',
      non_atomic: 'Non-atomic',
      missing: 'Missing',
      stale: 'Stale',
      obsolete: 'Obsolete',
    },
    freshness: {
      current: 'current',
      missing: 'missing',
      stale: 'stale',
    },
    decisions: {
      atomic: 'semantically atomic',
      needs_developer_review: 'developer review',
      non_atomic: 'non-atomic',
    },
    fields: {
      decision: 'Decision',
      reason: 'Reason',
      action: 'Suggested action',
      split: 'Suggested split',
      fingerprint: 'Fingerprint',
      reviewer: 'Reviewer',
      reviewedAt: 'Review date',
    },
    placeholders: {
      reason: 'Briefly justify why this goal is atomic or needs review.',
      action: 'Optional: next concrete step.',
      split: 'Optional: one goal per line.',
    },
    saved: (count: number) => `${count} review records saved.`,
  },
} as const

const isReviewDecision = (value: unknown): value is ReviewDecision =>
  value === 'atomic' || value === 'needs_developer_review' || value === 'non_atomic'

const decisionToSemanticAtomic = (decision: ReviewDecision): boolean | null => {
  if (decision === 'atomic') return true
  if (decision === 'non_atomic') return false
  return null
}

const textValue = (value: unknown): string => (typeof value === 'string' ? value : '')

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10)

const createDraftRecord = (item: ReviewItem, payload: LoadResponse): ReviewRecord => {
  const record = item.record ?? { goalId: item.goal.id, status: 'needs_developer_review' as const }
  const decision = isReviewDecision(record.status) ? record.status : 'needs_developer_review'
  return {
    schemaVersion: 1,
    reviewId: payload.config.reviewId,
    ruleVersion: payload.config.ruleVersion,
    landscapeId: payload.config.landscapeId,
    goalId: item.goal.id,
    fingerprint: item.fingerprint,
    status: decision,
    semanticAtomic: decisionToSemanticAtomic(decision),
    reviewedAt: textValue(record.reviewedAt) || todayIsoDate(),
    reviewer: textValue(record.reviewer) || 'developer',
    reason: textValue(record.reason),
    suggestedAction: textValue(record.suggestedAction),
    suggestedSplit: Array.isArray(record.suggestedSplit)
      ? record.suggestedSplit.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      : [],
  }
}

const freshnessClasses = (freshness: ItemFreshness): string => {
  if (freshness === 'current') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
  }
  if (freshness === 'stale') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
}

const decisionClasses = (decision: ReviewDecision): string => {
  if (decision === 'atomic') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
  }
  if (decision === 'non_atomic') {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
  }
  return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
}

const filterKeys: FilterKey[] = ['queue', 'all', 'atomic', 'needs_developer_review', 'non_atomic', 'missing', 'stale']

export const SemanticAtomicityReviewView: React.FC = () => {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [configs, setConfigs] = useState<ConfigSummary[]>([])
  const [selectedConfigPath, setSelectedConfigPath] = useState('')
  const [payload, setPayload] = useState<LoadResponse | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ReviewRecord>>({})
  const [filter, setFilter] = useState<FilterKey>('queue')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadReview = useCallback(async (configPath: string) => {
    if (!configPath) return
    setLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const nextPayload = await requestJson<LoadResponse>(
        `/__semantic-atomicity-review/load?config=${encodeURIComponent(configPath)}`,
      )
      const nextDrafts: Record<string, ReviewRecord> = {}
      nextPayload.items.forEach((item) => {
        nextDrafts[item.goal.id] = createDraftRecord(item, nextPayload)
      })
      setPayload(nextPayload)
      setDrafts(nextDrafts)
      setDirty(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Review load failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadConfigs = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await requestJson<ListResponse>('/__semantic-atomicity-review/list')
      setConfigs(response.configs)
      setSelectedConfigPath((current) => current || response.configs[0]?.path || '')
      if (response.configs.length === 0) {
        setPayload(null)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Config load failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadConfigs()
  }, [loadConfigs])

  useEffect(() => {
    if (!selectedConfigPath) return
    void loadReview(selectedConfigPath)
  }, [loadReview, selectedConfigPath])

  const counts = useMemo(() => {
    const nextCounts = {
      all: payload?.items.length ?? 0,
      queue: 0,
      atomic: 0,
      needs_developer_review: 0,
      non_atomic: 0,
      missing: 0,
      stale: 0,
      obsolete: payload?.obsoleteRecords.length ?? 0,
    }

    for (const item of payload?.items ?? []) {
      const decision = drafts[item.goal.id]?.status ?? 'needs_developer_review'
      nextCounts[decision] += 1
      if (item.status === 'missing') nextCounts.missing += 1
      if (item.status === 'stale') nextCounts.stale += 1
      if (decision !== 'atomic' || item.status !== 'current') nextCounts.queue += 1
    }

    return nextCounts
  }, [drafts, payload])

  const codexPrompt = useMemo(() => {
    if (!payload) return ''
    const queueItems = payload.items
      .filter((item) => {
        const decision = drafts[item.goal.id]?.status ?? 'needs_developer_review'
        return decision !== 'atomic' || item.status !== 'current'
      })
      .map((item) => {
        const draft = drafts[item.goal.id]
        const title = item.goal.title || item.goal.id
        const decision = draft?.status ?? 'needs_developer_review'
        return `- ${title} [${item.goal.id}] freshness=${item.status}, status=${decision}`
      })
      .join('\n')

    if (language === 'en') {
      return [
        'Please run the semantic atomicity bulk review for SkillPilot from the Codex command line.',
        '',
        'Working boundary:',
        '- The semantic decision is made here in Codex/CLI, not in the Workbench.',
        '- Review every technical leaf goal in the configured scope individually.',
        '- Update only the semantic atomicity review ledger unless I explicitly ask for graph edits.',
        '- Use status values: atomic, needs_developer_review, non_atomic.',
        '- For needs_developer_review/non_atomic, maintain reason and, where useful, suggestedAction/suggestedSplit.',
        '',
        'Rule:',
        '- A technical leaf goal is semantically atomic only if it contains exactly one content learning goal.',
        '',
        'Files:',
        `- Config: ${payload.configPath}`,
        `- Ledger: ${payload.reviewPath}`,
        `- Review ID: ${payload.config.reviewId}`,
        `- Rule version: ${payload.config.ruleVersion}`,
        `- Scope: ${payload.config.scope?.label ?? payload.config.reviewId}`,
        '',
        'Current state:',
        `- Leaf goals: ${counts.all}`,
        `- Queue: ${counts.queue}`,
        `- Missing: ${counts.missing}`,
        `- Stale: ${counts.stale}`,
        `- Obsolete: ${counts.obsolete}`,
        '',
        'Queue:',
        queueItems || '- none',
        '',
        'After editing, run:',
        `cd app && npm run quality:semantic-atomicity:check -- --config=${payload.configPath}`,
        'cd app && npm run validate:graph',
      ].join('\n')
    }

    return [
      'Bitte führe die semantische Atomicity-Bulkprüfung für SkillPilot von der Codex-Kommandozeile aus.',
      '',
      'Arbeitsgrenze:',
      '- Die semantische Entscheidung passiert hier in Codex/CLI, nicht in der Workbench.',
      '- Prüfe jedes technische Blattziel im konfigurierten Scope einzeln.',
      '- Aktualisiere nur das Semantic-Atomicity-Review-Ledger, außer ich fordere Graph-Änderungen ausdrücklich an.',
      '- Verwende die Statuswerte: atomic, needs_developer_review, non_atomic.',
      '- Bei needs_developer_review/non_atomic pflege reason und, wenn sinnvoll, suggestedAction/suggestedSplit.',
      '',
      'Regel:',
      '- Ein technisches Blattziel ist semantisch atomar, wenn es genau ein inhaltliches Lernziel enthält.',
      '',
      'Dateien:',
      `- Config: ${payload.configPath}`,
      `- Ledger: ${payload.reviewPath}`,
      `- Review ID: ${payload.config.reviewId}`,
      `- Rule-Version: ${payload.config.ruleVersion}`,
      `- Scope: ${payload.config.scope?.label ?? payload.config.reviewId}`,
      '',
      'Aktueller Stand:',
      `- Blattziele: ${counts.all}`,
      `- Queue: ${counts.queue}`,
      `- Fehlend: ${counts.missing}`,
      `- Veraltet: ${counts.stale}`,
      `- Obsolet: ${counts.obsolete}`,
      '',
      'Queue:',
      queueItems || '- keine',
      '',
      'Nach Änderungen ausführen:',
      `cd app && npm run quality:semantic-atomicity:check -- --config=${payload.configPath}`,
      'cd app && npm run validate:graph',
    ].join('\n')
  }, [counts, drafts, language, payload])

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return (payload?.items ?? []).filter((item) => {
      const draft = drafts[item.goal.id]
      const decision = draft?.status ?? 'needs_developer_review'
      const matchesFilter = filter === 'all'
        || (filter === 'queue' && (decision !== 'atomic' || item.status !== 'current'))
        || filter === decision
        || filter === item.status
      if (!matchesFilter) return false
      if (!normalizedSearch) return true

      const haystack = [
        item.goal.id,
        item.goal.shortKey,
        item.goal.title,
        item.goal.titleEn,
        item.goal.description,
        item.goal.descriptionEn,
        draft?.reason,
        draft?.suggestedAction,
        ...(draft?.suggestedSplit ?? []),
      ].join(' ').toLowerCase()
      return haystack.includes(normalizedSearch)
    })
  }, [drafts, filter, payload, search])

  const updateDraft = (goalId: string, updater: (record: ReviewRecord) => ReviewRecord) => {
    setDrafts((current) => {
      const existing = current[goalId]
      if (!existing) return current
      return { ...current, [goalId]: updater(existing) }
    })
    setDirty(true)
  }

  const handleDecisionChange = (goalId: string, decision: ReviewDecision) => {
    updateDraft(goalId, (record) => ({
      ...record,
      status: decision,
      semanticAtomic: decisionToSemanticAtomic(decision),
      reviewedAt: todayIsoDate(),
    }))
  }

  const handleSave = async () => {
    if (!payload) return
    setSaving(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const records = payload.items
        .map((item) => drafts[item.goal.id])
        .filter((record): record is ReviewRecord => Boolean(record))
      const response = await requestJson<SaveResponse>('/__semantic-atomicity-review/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configPath: payload.configPath, records }),
      })
      setDirty(false)
      setStatusMessage(`${copy.saved(response.savedRecords)} ${response.reviewPath}`)
      await loadReview(payload.configPath)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Review save failed.')
    } finally {
      setSaving(false)
    }
  }

  const copyPromptText = async (promptText: string, successMessage: string) => {
    if (!promptText) return
    try {
      await navigator.clipboard.writeText(promptText)
      setStatusMessage(successMessage)
      setErrorMessage(null)
    } catch {
      setErrorMessage(copy.codexPromptCopyFailed)
    }
  }

  const handleCopyPrompt = async () => {
    await copyPromptText(codexPrompt, copy.codexPromptCopied)
  }

  const buildGoalCodexPrompt = (item: ReviewItem, draft: ReviewRecord | undefined): string => {
    if (!payload) return ''
    const decision = draft?.status ?? 'needs_developer_review'
    const suggestedSplit = (draft?.suggestedSplit ?? [])
      .map((entry) => `- ${entry}`)
      .join('\n') || '- (leer)'

    if (language === 'en') {
      return [
        'Please handle this SkillPilot semantic atomicity finding from the Codex command line.',
        '',
        'Task:',
        '- Verify whether the listed technical leaf goal is really semantically non-atomic.',
        '- If the finding is correct, design a suitable split or a tighter replacement.',
        '- If the graph edit is clear from the local curriculum context, implement it directly.',
        '- If the split is not clear enough, update the ledger with suggestedSplit/suggestedAction and stop for developer review.',
        '',
        'Working boundaries:',
        '- Work in the repository, not in the Workbench.',
        '- Do not make unrelated graph, UI, or formatting changes.',
        '- Preserve DAG validity and existing curriculum intent.',
        '- If you split the goal, prefer converting the broad leaf into a cluster with new atomic children so existing parent references stay stable, unless the surrounding graph clearly requires a different local pattern.',
        '- Update the semantic atomicity ledger for the resulting leaf goals.',
        '',
        'Finding:',
        `- Config: ${payload.configPath}`,
        `- Ledger: ${payload.reviewPath}`,
        `- Review ID: ${payload.config.reviewId}`,
        `- Rule version: ${payload.config.ruleVersion}`,
        `- Current Workbench status: ${decision}`,
        `- Freshness: ${item.status}`,
        `- Goal ID: ${item.goal.id}`,
        `- Short key: ${item.goal.shortKey ?? '(none)'}`,
        `- Title: ${item.goal.title ?? '(none)'}`,
        `- Description: ${item.goal.description ?? '(none)'}`,
        `- Reason: ${draft?.reason || '(empty)'}`,
        `- Suggested action: ${draft?.suggestedAction || '(empty)'}`,
        '',
        'Suggested split from Workbench:',
        suggestedSplit,
        '',
        'After editing, run:',
        `cd app && npm run quality:semantic-atomicity:check -- --config=${payload.configPath}`,
        'cd app && npm run validate:graph',
        'cd app && npm run lint',
      ].join('\n')
    }

    return [
      'Bitte bearbeite dieses SkillPilot-Finding zur semantischen Atomarität von der Codex-Kommandozeile aus.',
      '',
      'Auftrag:',
      '- Prüfe, ob das genannte technische Blattziel wirklich semantisch nicht atomar ist.',
      '- Wenn das Finding stimmt, entwirf einen geeigneten Split oder eine präzisere Überarbeitung.',
      '- Wenn die Graph-Änderung aus dem lokalen Curriculum-Kontext eindeutig ist, setze sie direkt um.',
      '- Wenn der Split fachlich noch nicht eindeutig genug ist, aktualisiere nur suggestedSplit/suggestedAction im Ledger und stoppe für Entwicklerprüfung.',
      '',
      'Arbeitsgrenzen:',
      '- Arbeite im Repository, nicht in der Workbench.',
      '- Keine unrelated Graph-, UI- oder Formatierungsänderungen.',
      '- DAG-Gültigkeit und bestehende Curriculum-Intention erhalten.',
      '- Wenn Du splittest, bevorzuge den breiten Blattknoten zu einem Cluster mit neuen atomaren Kindern umzubauen, damit bestehende Parent-Referenzen stabil bleiben; außer die Umgebung zeigt klar ein anderes lokales Muster.',
      '- Aktualisiere das Semantic-Atomicity-Ledger für die resultierenden Blattziele.',
      '',
      'Finding:',
      `- Config: ${payload.configPath}`,
      `- Ledger: ${payload.reviewPath}`,
      `- Review ID: ${payload.config.reviewId}`,
      `- Rule-Version: ${payload.config.ruleVersion}`,
      `- Aktueller Workbench-Status: ${decision}`,
      `- Freshness: ${item.status}`,
      `- Goal ID: ${item.goal.id}`,
      `- Short key: ${item.goal.shortKey ?? '(keiner)'}`,
      `- Titel: ${item.goal.title ?? '(leer)'}`,
      `- Beschreibung: ${item.goal.description ?? '(leer)'}`,
      `- Begründung: ${draft?.reason || '(leer)'}`,
      `- Empfohlene Aktion: ${draft?.suggestedAction || '(leer)'}`,
      '',
      'Split-Vorschlag aus der Workbench:',
      suggestedSplit,
      '',
      'Nach Änderungen ausführen:',
      `cd app && npm run quality:semantic-atomicity:check -- --config=${payload.configPath}`,
      'cd app && npm run validate:graph',
      'cd app && npm run lint',
    ].join('\n')
  }

  const handleCopyGoalPrompt = async (item: ReviewItem, draft: ReviewRecord | undefined) => {
    await copyPromptText(buildGoalCodexPrompt(item, draft), copy.goalCodexPromptCopied)
  }

  const selectedConfig = configs.find((config) => config.path === selectedConfigPath)

  return (
    <div className="min-h-screen bg-chat-bg p-4 text-text-primary md:p-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                <ListChecks size={14} />
                <span>{copy.title}</span>
              </div>
              <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">{copy.title}</h1>
              <p className="mt-2 text-sm text-text-secondary md:text-base">{copy.subtitle}</p>
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                {copy.boundary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <Link
                to="/workbench"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ListChecks size={16} />
                <span>{copy.workbench}</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Home size={16} />
                <span>{copy.backHome}</span>
              </Link>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-end">
            <label className="block min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.config}</span>
              <select
                value={selectedConfigPath}
                onChange={(event) => setSelectedConfigPath(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950"
              >
                {configs.map((config) => (
                  <option key={config.path} value={config.path}>
                    {config.label || config.reviewId}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectedConfigPath && void loadReview(selectedConfigPath)}
                disabled={!selectedConfigPath || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800"
              >
                <RefreshCw size={16} />
                <span>{copy.refresh}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!payload || saving || !dirty}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                <span>{saving ? copy.saving : copy.save}</span>
              </button>
            </div>
          </div>

          {payload ? (
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-text-secondary xl:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-border-color bg-white/60 p-3 dark:bg-slate-950/50">
                <div className="text-xs font-semibold uppercase tracking-wide">{copy.paths}</div>
                <div className="mt-2 truncate font-mono text-xs">{copy.configPath}: {payload.configPath}</div>
                <div className="mt-1 truncate font-mono text-xs">{copy.reviewPath}: {payload.reviewPath}</div>
              </div>
              <div className="min-w-0 rounded-lg border border-border-color bg-white/60 p-3 dark:bg-slate-950/50">
                <div className="text-xs font-semibold uppercase tracking-wide">{selectedConfig?.reviewId ?? payload.config.reviewId}</div>
                <div className="mt-2 text-text-primary">{selectedConfig?.label ?? payload.config.scope?.label ?? payload.config.reviewId}</div>
                <div className="mt-1 font-mono text-xs">{payload.config.ruleVersion}</div>
              </div>
            </div>
          ) : null}

          {payload ? (
            <div className="mt-4 rounded-lg border border-border-color bg-white/60 p-3 dark:bg-slate-950/50">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {copy.codexPromptTitle}
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyPrompt()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CopyIcon size={16} />
                  <span>{copy.codexPromptCopy}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={codexPrompt}
                rows={8}
                className="mt-3 w-full resize-y rounded-lg border border-border-color bg-white px-3 py-2 font-mono text-xs leading-relaxed text-text-primary shadow-sm dark:bg-slate-950"
              />
            </div>
          ) : null}

          {configs.length === 0 && !loading ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              {copy.noConfig}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${filter === key
                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                    : 'border-border-color text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {copy.counts[key]} <span className="ml-1 text-text-primary">{counts[key]}</span>
                </button>
              ))}
              {counts.obsolete > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle size={14} />
                  {copy.counts.obsolete} {counts.obsolete}
                </span>
              ) : null}
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.search}
              className="w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950 xl:w-80"
            />
          </div>
        </section>

        {statusMessage ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 size={18} />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            <XCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {loading && !payload ? (
          <div className="rounded-2xl border border-border-color bg-white/70 p-6 text-sm text-text-secondary dark:bg-slate-900/70">
            {copy.loading}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4">
          {visibleItems.map((item) => {
            const draft = drafts[item.goal.id]
            const decision = draft?.status ?? 'needs_developer_review'
            return (
              <article
                key={item.goal.id}
                className="rounded-2xl border border-border-color bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:bg-slate-900/80"
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${freshnessClasses(item.status)}`}>
                        {copy.freshness[item.status]}
                      </span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${decisionClasses(decision)}`}>
                        {copy.decisions[decision]}
                      </span>
                      {item.goal.shortKey ? (
                        <span className="rounded-full border border-border-color px-2.5 py-1 font-mono text-xs text-text-secondary">
                          {item.goal.shortKey}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-text-primary">
                      <InlineMathText text={item.goal.title || item.goal.id} />
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      <InlineMathText text={item.goal.description || ''} />
                    </p>
                    <div className="mt-3 break-all font-mono text-xs text-text-secondary">{item.goal.id}</div>
                  </div>

                  <div className="grid min-w-[220px] gap-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.fields.decision}</span>
                      <select
                        value={decision}
                        onChange={(event) => handleDecisionChange(item.goal.id, event.target.value as ReviewDecision)}
                        className="mt-1 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950"
                      >
                        <option value="atomic">{copy.decisions.atomic}</option>
                        <option value="needs_developer_review">{copy.decisions.needs_developer_review}</option>
                        <option value="non_atomic">{copy.decisions.non_atomic}</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleCopyGoalPrompt(item, draft)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <CopyIcon size={16} />
                      <span>{copy.goalCodexPromptCopy}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.fields.reason}</span>
                    <textarea
                      value={draft?.reason ?? ''}
                      onChange={(event) => updateDraft(item.goal.id, (record) => ({ ...record, reason: event.target.value }))}
                      placeholder={copy.placeholders.reason}
                      rows={4}
                      className="mt-1 w-full resize-y rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.fields.action}</span>
                      <textarea
                        value={draft?.suggestedAction ?? ''}
                        onChange={(event) => updateDraft(item.goal.id, (record) => ({ ...record, suggestedAction: event.target.value }))}
                        placeholder={copy.placeholders.action}
                        rows={2}
                        className="mt-1 w-full resize-y rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.fields.split}</span>
                      <textarea
                        value={(draft?.suggestedSplit ?? []).join('\n')}
                        onChange={(event) => updateDraft(item.goal.id, (record) => ({
                          ...record,
                          suggestedSplit: event.target.value
                            .split(/\r?\n/)
                            .map((entry) => entry.trim())
                            .filter(Boolean),
                        }))}
                        placeholder={copy.placeholders.split}
                        rows={2}
                        className="mt-1 w-full resize-y rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-text-secondary xl:grid-cols-[1fr_180px_180px]">
                  <div className="min-w-0 truncate font-mono">{copy.fields.fingerprint}: {item.fingerprint}</div>
                  <label className="block">
                    <span className="sr-only">{copy.fields.reviewer}</span>
                    <input
                      value={draft?.reviewer ?? ''}
                      onChange={(event) => updateDraft(item.goal.id, (record) => ({ ...record, reviewer: event.target.value }))}
                      className="w-full rounded-lg border border-border-color bg-white px-3 py-2 font-mono text-xs text-text-primary shadow-sm dark:bg-slate-950"
                      aria-label={copy.fields.reviewer}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">{copy.fields.reviewedAt}</span>
                    <input
                      type="date"
                      value={draft?.reviewedAt ?? ''}
                      onChange={(event) => updateDraft(item.goal.id, (record) => ({ ...record, reviewedAt: event.target.value }))}
                      className="w-full rounded-lg border border-border-color bg-white px-3 py-2 font-mono text-xs text-text-primary shadow-sm dark:bg-slate-950"
                      aria-label={copy.fields.reviewedAt}
                    />
                  </label>
                </div>
              </article>
            )
          })}
        </section>

        {!loading && payload && visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-border-color bg-white/70 p-6 text-sm text-text-secondary dark:bg-slate-900/70">
            {copy.empty}
          </div>
        ) : null}
      </div>
    </div>
  )
}
