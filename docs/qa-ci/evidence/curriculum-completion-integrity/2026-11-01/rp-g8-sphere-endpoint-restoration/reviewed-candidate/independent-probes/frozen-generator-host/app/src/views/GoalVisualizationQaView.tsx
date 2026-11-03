import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BadgeCheck, CheckCircle2, Clipboard, Copy, FileText, Home, Image, RefreshCw, Save, Search, XCircle } from 'lucide-react'
import { LanguageToggle } from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { requestJson } from '../utils/authoring/authoringClient'
import { aiApprovalStatus, isAiApprovedForCurrentAsset } from '../utils/goalVisualizationQaStatus'

type YesNo = 'yes' | 'no'
type HumanDecision = 'open' | 'ok' | 'nok'
type VisualizationState = 'available' | 'missing'
type FilterKey = 'all' | 'missing_regular' | 'deferred' | 'queue' | 'ai_approved' | 'ai_rejected' | 'ai_open' | 'ai_stale' | 'human_approved' | 'human_issue' | 'chatgpt_open'

interface QaRecord {
  goalId: string
  title: string
  description: string
  subject: string
  landscapeId: string
  landscapePath: string
  visualizationState?: VisualizationState
  missingReason?: '' | 'no_primary_link' | 'deferred_provider_limitation' | string
  missingNotes?: string
  imageUrl: string
  publicAssetPath: string
  canonicalAssetPath: string
  assetSha256: string
  umlautsCorrectChatGpt: YesNo
  contentApprovedChatGpt: YesNo
  aiApproved?: YesNo
  aiApprovedAssetSha256?: string
  aiReviewedAt?: string | null
  aiReviewer?: string
  aiNotes?: string
  humanApproved: YesNo
  humanIssueIdentified: YesNo
  humanIssueDescription: string
  chatGptReviewedAt: string | null
  chatGptReviewer: string
  chatGptNotes: string
  humanReviewedAt: string | null
  humanReviewer: string
}

interface QaLedger {
  schemaVersion: 1
  subject: string
  source: {
    canonicalRoot: string
    publicAssetRoot: string
  }
  records: QaRecord[]
}

interface ListRow {
  path: string
  subject: string
  counts: Record<string, number>
}

interface ListResponse {
  ledgers: ListRow[]
}

interface LoadResponse {
  path: string
  ledger: QaLedger
}

interface SaveResponse {
  path: string
  savedRecords: number
  changedRecords: number
}

interface ReconstructionPromptResponse {
  available: boolean
  path: string
  prompt: string
  markdown: string
}

type ReconstructionPromptState =
  | { status: 'loading' }
  | { status: 'generating' }
  | { status: 'loaded'; path: string; prompt: string }
  | { status: 'missing'; path: string }
  | { status: 'error'; error: string }

const COPY = {
  de: {
    title: 'Lernzielvisualisierungen – QS',
    subtitle: 'Fachbezogene Prüfliste für erzeugte Lernzielbilder.',
    workbench: 'Arbeitsbereich',
    backHome: 'Startseite',
    subject: 'Fachliste',
    refresh: 'Neu laden',
    save: 'Speichern',
    saving: 'Speichern ...',
    search: 'Suchen',
    image: 'Bild',
    prompt: 'Codex-Korrekturauftrag',
    alternativePrompt: 'Alternative Korrekturbasis',
    loadAlternativePrompt: 'Alternativprompt laden',
    generateAlternativePrompt: 'Alternativprompt erzeugen',
    alternativePromptMissing: 'Kein Alternativprompt für dieses Bild gespeichert.',
    alternativePromptLoading: 'Alternativprompt wird geladen ...',
    alternativePromptGenerating: 'Alternativprompt wird per Gemini erzeugt ...',
    copyPrompt: 'Prompt kopieren',
    copied: 'Prompt kopiert.',
    copyFailed: 'Prompt konnte nicht kopiert werden.',
    saved: (count: number) => `${count} Änderung(en) gespeichert.`,
    filters: {
      all: 'Alle',
      missing_regular: 'Bild fehlt',
      deferred: 'Provider-zurückgestellt',
      queue: 'Human-Arbeitsliste',
      ai_approved: 'Approved AI',
      ai_rejected: 'KI-geprüft: NOK',
      ai_open: 'KI-Prüfung offen',
      ai_stale: 'KI-Freigabe veraltet',
      human_approved: 'Human-freigegeben',
      human_issue: 'Fehler markiert',
      chatgpt_open: 'Alte ChatGPT-Prüfung offen',
    },
    labels: {
      umlaute: 'Umlaute korrekt (alte ChatGPT-Prüfung)',
      content: 'Inhalt korrekt (alte ChatGPT-Prüfung)',
      aiApproved: 'Approved AI',
      aiRejected: 'KI-Prüfung: NOK',
      aiCorrectionOpen: 'Korrektur offen',
      aiOpen: 'KI-Prüfung offen',
      aiStale: 'KI-Freigabe veraltet',
      aiCurrentAsset: 'für das aktuelle Bild',
      humanApproved: 'Human-Prüfung',
      humanDescription: 'Fehlerbeschreibung',
      open: 'Offen',
      ok: 'OK',
      nok: 'NOK',
      yes: 'Ja',
      no: 'Nein',
      path: 'Landschaftspfad',
      goalId: 'Lernziel-ID',
      targetScope: 'Soll-Scope',
      activeImages: 'Aktive Bilder',
      missingRegular: 'Regulär fehlend',
      deferred: 'Zurückgestellt',
      coverage: 'Abdeckung',
      noImage: 'Kein aktives Bild',
      noPrimaryLink: 'Für dieses Lernziel ist noch kein primäres Visualisierungsbild verknüpft.',
      deferredProvider: 'Nach mehreren fachlich fehlerhaften Versuchen wurde die Erzeugung vorläufig zurückgestellt.',
      notReviewable: 'Ohne aktives Bild ist keine Bildprüfung möglich.',
    },
    placeholders: {
      humanDescription: 'Fehler konkret beschreiben: Was ist falsch, wo im Bild, wie soll es fachlich richtig aussehen?',
    },
    empty: 'Keine Einträge für diesen Filter.',
    loading: 'Laden ...',
  },
  en: {
    title: 'Goal Visualization QA',
    subtitle: 'Subject-level review list for generated learning-goal images.',
    workbench: 'Workbench',
    backHome: 'Home',
    subject: 'Subject list',
    refresh: 'Reload',
    save: 'Save',
    saving: 'Saving ...',
    search: 'Search',
    image: 'Image',
    prompt: 'Codex correction task',
    alternativePrompt: 'Alternative correction basis',
    loadAlternativePrompt: 'Load alternative prompt',
    generateAlternativePrompt: 'Generate alternative prompt',
    alternativePromptMissing: 'No alternative prompt is stored for this image.',
    alternativePromptLoading: 'Loading alternative prompt ...',
    alternativePromptGenerating: 'Generating alternative prompt with Gemini ...',
    copyPrompt: 'Copy prompt',
    copied: 'Prompt copied.',
    copyFailed: 'Could not copy prompt.',
    saved: (count: number) => `${count} change(s) saved.`,
    filters: {
      all: 'All',
      missing_regular: 'Image missing',
      deferred: 'Provider deferred',
      queue: 'Human open',
      ai_approved: 'Approved AI',
      ai_rejected: 'AI reviewed: NOK',
      ai_open: 'AI open',
      ai_stale: 'AI stale',
      human_approved: 'Human approved',
      human_issue: 'Issue marked',
      chatgpt_open: 'ChatGPT open',
    },
    labels: {
      umlaute: 'Umlauts correct (ChatGPT)',
      content: 'Content approved (ChatGPT)',
      aiApproved: 'Approved AI',
      aiRejected: 'AI review: NOK',
      aiCorrectionOpen: 'correction open',
      aiOpen: 'AI review open',
      aiStale: 'AI approval stale',
      aiCurrentAsset: 'for current image',
      humanApproved: 'Approved (Human)',
      humanDescription: 'Issue description (Human)',
      open: 'open',
      ok: 'OK',
      nok: 'NOK',
      yes: 'yes',
      no: 'no',
      path: 'Path',
      goalId: 'Goal ID',
      targetScope: 'Target scope',
      activeImages: 'Active images',
      missingRegular: 'Regular missing',
      deferred: 'Deferred',
      coverage: 'Coverage',
      noImage: 'No active image',
      noPrimaryLink: 'No primary visualization image is linked to this learning goal yet.',
      deferredProvider: 'Generation was deferred after several technically incorrect provider attempts.',
      notReviewable: 'An image review is not possible without an active image.',
    },
    placeholders: {
      humanDescription: 'Describe the issue concretely: what is wrong, where in the image, and what should be correct?',
    },
    empty: 'No entries for this filter.',
    loading: 'Loading ...',
  },
} as const

const filterKeys: FilterKey[] = [
  'missing_regular',
  'deferred',
  'queue',
  'ai_open',
  'ai_approved',
  'ai_rejected',
  'ai_stale',
  'human_issue',
  'human_approved',
  'chatgpt_open',
  'all',
]

const statusBadgeClass = (value: YesNo) =>
  value === 'yes'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'

const visualizationState = (record: QaRecord): VisualizationState => {
  if (record.visualizationState === 'available' || record.visualizationState === 'missing') {
    return record.visualizationState
  }
  return record.imageUrl.trim() ? 'available' : 'missing'
}

const hasActiveVisualization = (record: QaRecord): boolean => visualizationState(record) === 'available'

const isDeferredVisualization = (record: QaRecord): boolean =>
  visualizationState(record) === 'missing' && record.missingReason === 'deferred_provider_limitation'

const isRegularMissingVisualization = (record: QaRecord): boolean =>
  visualizationState(record) === 'missing' && !isDeferredVisualization(record)

const isHumanApprovedFinal = (record: QaRecord): boolean =>
  hasActiveVisualization(record)
  && record.humanApproved === 'yes'
  && record.humanIssueIdentified !== 'yes'

const humanDecisionStatus = (record: QaRecord): HumanDecision => {
  if (record.humanIssueIdentified === 'yes') return 'nok'
  if (record.humanApproved === 'yes') return 'ok'
  return 'open'
}

const isChatGptOpen = (record: QaRecord): boolean =>
  hasActiveVisualization(record)
  && !isHumanApprovedFinal(record)
  && (record.umlautsCorrectChatGpt !== 'yes' || record.contentApprovedChatGpt !== 'yes')

const isQaOpen = (record: QaRecord): boolean =>
  hasActiveVisualization(record)
  && (record.humanIssueIdentified === 'yes' || record.humanApproved !== 'yes')

const isAiReviewOpen = (record: QaRecord): boolean =>
  hasActiveVisualization(record)
  && !isHumanApprovedFinal(record)
  && aiApprovalStatus(record) === 'open'

const isAiReviewApproved = (record: QaRecord): boolean =>
  hasActiveVisualization(record)
  && !isHumanApprovedFinal(record)
  && isAiApprovedForCurrentAsset(record)

const isAiReviewRejected = (record: QaRecord): boolean =>
  hasActiveVisualization(record)
  && !isHumanApprovedFinal(record)
  && aiApprovalStatus(record) === 'rejected'

const imageSrcForRecord = (record: QaRecord, reloadToken: number): string => {
  const separator = record.imageUrl.includes('?') ? '&' : '?'
  return `${record.imageUrl}${separator}v=${encodeURIComponent(record.assetSha256 || 'unknown')}&reload=${reloadToken}`
}

const reconstructionPromptKey = (record: QaRecord): string =>
  `${record.goalId}:${record.imageUrl}:${record.assetSha256}`

const subjectLabel = (subject: string) => {
  const labels: Record<string, string> = {
    chemie: 'Chemie',
    mathematik: 'Mathematik',
    physik: 'Physik',
  }
  return labels[subject] ?? subject
}

const buildCodexPrompt = (
  record: QaRecord,
  alternativePrompt?: { path: string; prompt: string },
): string => [
  'Bitte korrigiere diese SkillPilot-Lernzielvisualisierung mit der bestehenden Nano-Banana-Pro-Pipeline.',
  '',
  'Arbeitsregeln:',
  '- Kein SVG-Fallback und keine manuelle Ersatzgrafik als finales Asset.',
  '- Provider-Prompts dürfen keine technischen IDs, Dateinamen, Plattform-/Produktnamen, Schulformlabels oder internen Pfade enthalten.',
  '- IDs und Pfade dürfen nur lokal in Dateinamen, JSON, Metadaten und diesem Codex-Auftrag stehen.',
  '- Generiere zuerst Kandidaten mit `--no-import`, prüfe sie mit `view_image`, importiere nur fachlich korrekte Kandidaten.',
  '- Wenn Nano Banana Pro nach mehreren gezielten Versuchen fachlich falsch bleibt, entferne den aktiven Link und dokumentiere `deferred_provider_limitation` im Review-Ledger.',
  '',
  'Ziel:',
  `- Fach: ${subjectLabel(record.subject)}`,
  `- Goal ID: ${record.goalId}`,
  `- Titel: ${record.title}`,
  `- Beschreibung: ${record.description}`,
  `- Landscape: ${record.landscapePath}`,
  `- Aktuelles Public Asset: ${record.publicAssetPath}`,
  `- Canonical Asset: ${record.canonicalAssetPath}`,
  ...(alternativePrompt?.prompt.trim()
    ? [
      '',
      'Alternative Korrekturbasis:',
      `- Bild-Rekonstruktionsprompt: ${alternativePrompt.path}`,
      '- Nutze diesen Prompt als mögliche Ausgangsbasis, wenn eine Neugenerierung ohne Referenzbild oder mit stärkerer struktureller Kontrolle sinnvoller ist.',
      '- Human Review und fachliche Korrektheit haben Vorrang, falls der Alternativprompt etwas falsch beschreibt.',
      '',
      '```text',
      alternativePrompt.prompt.trim(),
      '```',
    ]
    : []),
  '',
  'Human Review:',
  `- Human-Prüfung: ${humanDecisionStatus(record) === 'ok' ? 'OK' : humanDecisionStatus(record) === 'nok' ? 'NOK' : 'Offen'}`,
  `- Fehlerbeschreibung: ${record.humanIssueDescription || '(leer; falls kein konkreter Fehler beschrieben ist, zuerst visuell prüfen und nur bei klarem Befund korrigieren)'}`,
  '',
  'Erwarteter Ablauf:',
  '1. Aktuelles Bild mit `view_image` prüfen.',
  '2. Einen provider-sicheren Prompt-Append unter `tmp/goal-visualization-prompt-appends/...` schreiben.',
  `3. Nano Banana Pro mit Referenzbild verwenden, z.B. \`npm --prefix app run visualization:generate:nano-banana -- ${record.goalId} --landscape=${record.landscapePath} --subject=${record.subject} --reference-image=${record.publicAssetPath} --prompt-append-file=<append-file> --no-import\`.`,
  '4. Kandidaten fachlich und orthografisch prüfen.',
  '5. Akzeptierten Kandidaten importieren, deployen, Review-Ledger aktualisieren.',
  '6. Danach mindestens ausführen: `npm --prefix app run check:goal-visualization-assets`, `npm --prefix app run validate:graph`, und die fachbezogenen Rollout-/QA-Checks.',
].join('\n')

export const GoalVisualizationQaView: React.FC = () => {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [ledgers, setLedgers] = useState<ListRow[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [payload, setPayload] = useState<LoadResponse | null>(null)
  const [filter, setFilter] = useState<FilterKey>('queue')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [imageReloadToken, setImageReloadToken] = useState(0)
  const [reconstructionPrompts, setReconstructionPrompts] = useState<Record<string, ReconstructionPromptState>>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await requestJson<ListResponse>('/__goal-visualization-qa/list')
      setLedgers(response.ledgers)
      setSelectedPath((current) => current || response.ledgers[0]?.path || '')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'QA list load failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLedger = useCallback(async (path: string) => {
    if (!path) return
    setLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const response = await requestJson<LoadResponse>(`/__goal-visualization-qa/load?path=${encodeURIComponent(path)}`)
      setPayload(response)
      setReconstructionPrompts({})
      setDirty(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'QA ledger load failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedPath) return
    void loadLedger(selectedPath)
  }, [loadLedger, selectedPath])

  const records = useMemo(() => payload?.ledger.records ?? [], [payload?.ledger.records])
  const counts = useMemo(() => {
    const activeRecords = records.filter(hasActiveVisualization)
    const chatgptOpen = activeRecords.filter(isChatGptOpen).length
    const humanIssue = activeRecords.filter((record) => record.humanIssueIdentified === 'yes').length
    const humanApproved = records.filter(isHumanApprovedFinal).length
    const aiApproved = records.filter(isAiReviewApproved).length
    const aiRejected = records.filter(isAiReviewRejected).length
    return {
      all: records.length,
      missing_regular: records.filter(isRegularMissingVisualization).length,
      deferred: records.filter(isDeferredVisualization).length,
      queue: records.filter(isQaOpen).length,
      ai_approved: aiApproved,
      ai_rejected: aiRejected,
      ai_open: records.filter(isAiReviewOpen).length,
      ai_stale: records.filter((record) =>
        hasActiveVisualization(record)
        && !isHumanApprovedFinal(record)
        && aiApprovalStatus(record) === 'stale').length,
      human_approved: humanApproved,
      human_issue: humanIssue,
      chatgpt_open: chatgptOpen,
    } satisfies Record<FilterKey, number>
  }, [records])

  const coverage = useMemo(() => {
    const scope = records.length
    const active = records.filter(hasActiveVisualization).length
    const deferred = records.filter(isDeferredVisualization).length
    const missingRegular = records.filter(isRegularMissingVisualization).length
    return {
      scope,
      active,
      deferred,
      missingRegular,
      percent: scope > 0 ? Math.round((active / scope) * 1_000) / 10 : 0,
    }
  }, [records])

  const visibleRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return records.filter((record) => {
      const matchesFilter = filter === 'all'
        || (filter === 'missing_regular' && isRegularMissingVisualization(record))
        || (filter === 'deferred' && isDeferredVisualization(record))
        || (filter === 'queue' && isQaOpen(record))
        || (filter === 'ai_approved' && isAiReviewApproved(record))
        || (filter === 'ai_rejected' && isAiReviewRejected(record))
        || (filter === 'ai_open' && isAiReviewOpen(record))
        || (filter === 'ai_stale'
          && hasActiveVisualization(record)
          && !isHumanApprovedFinal(record)
          && aiApprovalStatus(record) === 'stale')
        || (filter === 'human_approved' && isHumanApprovedFinal(record))
        || (filter === 'human_issue' && record.humanIssueIdentified === 'yes')
        || (filter === 'chatgpt_open' && isChatGptOpen(record))
      if (!matchesFilter) return false
      if (!normalizedSearch) return true
      return [
        record.goalId,
        record.title,
        record.description,
        record.humanIssueDescription,
        record.publicAssetPath,
      ].join(' ').toLowerCase().includes(normalizedSearch)
    })
  }, [filter, records, search])

  const updateRecord = (goalId: string, imageUrl: string, updater: (record: QaRecord) => QaRecord) => {
    setPayload((current) => {
      if (!current) return current
      return {
        ...current,
        ledger: {
          ...current.ledger,
          records: current.ledger.records.map((record) =>
            record.goalId === goalId && record.imageUrl === imageUrl ? updater(record) : record),
        },
      }
    })
    setDirty(true)
  }

  const handleSave = async () => {
    if (!payload) return
    setSaving(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const response = await requestJson<SaveResponse>('/__goal-visualization-qa/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: payload.path, ledger: payload.ledger }),
      })
      setDirty(false)
      setImageReloadToken((current) => current + 1)
      setStatusMessage(`${copy.saved(response.changedRecords)} ${response.path}`)
      await loadLedger(payload.path)
      await loadList()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'QA ledger save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleReload = async () => {
    if (!selectedPath) return
    setImageReloadToken((current) => current + 1)
    await Promise.all([
      loadList(),
      loadLedger(selectedPath),
    ])
  }

  const loadReconstructionPrompt = async (record: QaRecord): Promise<{ path: string; prompt: string } | null> => {
    const key = reconstructionPromptKey(record)
    const current = reconstructionPrompts[key]
    if (current?.status === 'loaded') return { path: current.path, prompt: current.prompt }
    if (current?.status === 'missing' || current?.status === 'loading' || current?.status === 'generating') return null

    setReconstructionPrompts((state) => ({
      ...state,
      [key]: { status: 'loading' },
    }))

    try {
      const response = await requestJson<ReconstructionPromptResponse>(
        `/__goal-visualization-qa/reconstruction-prompt?canonicalAssetPath=${encodeURIComponent(record.canonicalAssetPath)}`,
      )
      if (!response.available || !response.prompt.trim()) {
        setReconstructionPrompts((state) => ({
          ...state,
          [key]: { status: 'missing', path: response.path },
        }))
        return null
      }
      const loaded = { path: response.path, prompt: response.prompt }
      setReconstructionPrompts((state) => ({
        ...state,
        [key]: { status: 'loaded', ...loaded },
      }))
      return loaded
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Alternative prompt load failed.'
      setReconstructionPrompts((state) => ({
        ...state,
        [key]: { status: 'error', error: message },
      }))
      return null
    }
  }

  const generateReconstructionPrompt = async (record: QaRecord): Promise<{ path: string; prompt: string } | null> => {
    const key = reconstructionPromptKey(record)
    setReconstructionPrompts((state) => ({
      ...state,
      [key]: { status: 'generating' },
    }))

    try {
      const response = await requestJson<ReconstructionPromptResponse>(
        '/__goal-visualization-qa/reconstruction-prompt',
        {
          method: 'POST',
          body: JSON.stringify({ canonicalAssetPath: record.canonicalAssetPath }),
        },
      )
      if (!response.available || !response.prompt.trim()) {
        setReconstructionPrompts((state) => ({
          ...state,
          [key]: { status: 'missing', path: response.path },
        }))
        return null
      }
      const loaded = { path: response.path, prompt: response.prompt }
      setReconstructionPrompts((state) => ({
        ...state,
        [key]: { status: 'loaded', ...loaded },
      }))
      return loaded
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Alternative prompt generation failed.'
      setReconstructionPrompts((state) => ({
        ...state,
        [key]: { status: 'error', error: message },
      }))
      return null
    }
  }

  const copyPrompt = async (record: QaRecord) => {
    try {
      const alternativePrompt = await loadReconstructionPrompt(record)
      await navigator.clipboard.writeText(buildCodexPrompt(record, alternativePrompt ?? undefined))
      setStatusMessage(copy.copied)
      setErrorMessage(null)
    } catch {
      setErrorMessage(copy.copyFailed)
    }
  }

  return (
    <div className="min-h-screen bg-chat-bg p-4 text-text-primary md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                <Clipboard size={14} />
                <span>{copy.title}</span>
              </div>
              <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">{copy.title}</h1>
              <p className="mt-2 text-sm text-text-secondary md:text-base">{copy.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <Link to="/workbench" className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <Clipboard size={16} />
                <span>{copy.workbench}</span>
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
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
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.subject}</span>
              <select
                value={selectedPath}
                onChange={(event) => setSelectedPath(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary shadow-sm dark:bg-slate-950"
              >
                {ledgers.map((ledger) => (
                  <option key={ledger.path} value={ledger.path}>
                    {subjectLabel(ledger.subject)} · {ledger.counts.active ?? ledger.counts.all}/{ledger.counts.scope ?? ledger.counts.all} {copy.labels.activeImages} · {ledger.counts.coveragePercent ?? 100}% {copy.labels.coverage} · {copy.labels.missingRegular} {ledger.counts.regularMissing ?? 0} · {copy.labels.deferred} {ledger.counts.deferred ?? 0}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleReload()}
                disabled={!selectedPath || loading}
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

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: copy.labels.targetScope, value: coverage.scope, tone: 'text-slate-700 dark:text-slate-200' },
              { label: copy.labels.activeImages, value: coverage.active, tone: 'text-emerald-700 dark:text-emerald-300' },
              { label: copy.labels.missingRegular, value: coverage.missingRegular, tone: 'text-rose-700 dark:text-rose-300' },
              { label: copy.labels.deferred, value: coverage.deferred, tone: 'text-amber-700 dark:text-amber-300' },
              { label: copy.labels.coverage, value: `${coverage.percent}%`, tone: 'text-sky-700 dark:text-sky-300' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl border border-border-color bg-white/80 px-3 py-3 dark:bg-slate-950/50">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{metric.label}</div>
                <div className={`mt-1 text-2xl font-bold ${metric.tone}`}>{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                  {copy.filters[key]} <span className="ml-1 text-text-primary">{counts[key]}</span>
                </button>
              ))}
            </div>

            <label className="relative block min-w-0 xl:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.search}
                className="w-full rounded-lg border border-border-color bg-white py-2 pl-9 pr-3 text-sm text-text-primary shadow-sm dark:bg-slate-950"
              />
            </label>
          </div>

          {statusMessage ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">{statusMessage}</p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage}</p>
          ) : null}
        </section>

        <section className="grid grid-cols-1 gap-4">
          {loading && !payload ? (
            <div className="rounded-2xl border border-border-color bg-white/70 p-6 text-sm text-text-secondary dark:bg-slate-900/70">{copy.loading}</div>
          ) : null}

          {visibleRecords.map((record) => {
            if (!hasActiveVisualization(record)) {
              const deferred = isDeferredVisualization(record)
              return (
                <article
                  key={`${record.goalId}:missing`}
                  className={`rounded-2xl border p-4 shadow-sm ${deferred
                    ? 'border-amber-300 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/20'
                    : 'border-rose-200 bg-white/80 dark:border-rose-950/70 dark:bg-slate-900/80'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${deferred
                        ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'
                      }`}>
                        {deferred ? <AlertTriangle size={15} /> : <Image size={15} />}
                        <span>{deferred ? copy.labels.deferred : copy.labels.noImage}</span>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold text-text-primary">{record.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{record.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border-color px-3 py-1 text-xs font-mono text-text-secondary">
                      {subjectLabel(record.subject)}
                    </span>
                  </div>

                  <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${deferred
                    ? 'border-amber-200 bg-white/70 text-amber-900 dark:border-amber-900 dark:bg-slate-950/40 dark:text-amber-100'
                    : 'border-rose-100 bg-rose-50/60 text-rose-900 dark:border-rose-950 dark:bg-slate-950/40 dark:text-rose-100'
                  }`}>
                    <p className="font-semibold">{deferred ? copy.labels.deferredProvider : copy.labels.noPrimaryLink}</p>
                    {record.missingNotes ? <p className="mt-2 leading-relaxed opacity-90">{record.missingNotes}</p> : null}
                    <p className="mt-2 text-xs opacity-75">{copy.labels.notReviewable}</p>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-2 text-xs text-text-secondary md:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="font-semibold uppercase tracking-wide">{copy.labels.goalId}</dt>
                      <dd className="truncate font-mono">{record.goalId}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="font-semibold uppercase tracking-wide">{copy.labels.path}</dt>
                      <dd className="truncate font-mono">{record.landscapePath}</dd>
                    </div>
                  </dl>
                </article>
              )
            }

            const aiStatus = aiApprovalStatus(record)
            const reconstructionState = reconstructionPrompts[reconstructionPromptKey(record)]
            const alternativePrompt = reconstructionState?.status === 'loaded'
              ? { path: reconstructionState.path, prompt: reconstructionState.prompt }
              : undefined
            const prompt = buildCodexPrompt(record, alternativePrompt)
            return (
              <article key={`${record.goalId}:${record.imageUrl}`} className="grid grid-cols-1 gap-4 rounded-2xl border border-border-color bg-white/80 p-4 shadow-sm dark:bg-slate-900/80 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
                <div className="min-w-0">
                  <div className="overflow-hidden rounded-xl border border-border-color bg-slate-100 dark:bg-slate-950">
                    <img
                      src={imageSrcForRecord(record, imageReloadToken)}
                      alt={record.title}
                      loading="lazy"
                      className="aspect-video w-full object-contain"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
                    <Image size={14} />
                    <span className="truncate font-mono">{record.publicAssetPath}</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold text-text-primary">{record.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{record.description}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                      <span className="rounded-full border border-border-color px-3 py-1 text-xs font-mono text-text-secondary">
                        {subjectLabel(record.subject)}
                      </span>
                      {aiStatus !== 'open' || !isHumanApprovedFinal(record) ? (
                        <span
                          className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-sm ${aiStatus === 'approved'
                            ? 'rotate-[-1deg] border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                            : aiStatus === 'rejected'
                              ? 'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                            : aiStatus === 'stale'
                              ? 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                              : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300'
                          }`}
                          title={aiStatus === 'approved' || aiStatus === 'rejected'
                            ? [
                              `${copy.labels.aiApproved}: ${record.aiApprovedAssetSha256}`,
                              record.aiReviewer,
                              record.aiReviewedAt,
                              record.aiNotes,
                            ].filter(Boolean).join(' · ')
                            : undefined}
                        >
                          {aiStatus === 'approved' ? <BadgeCheck size={18} /> : aiStatus === 'stale' ? <AlertTriangle size={18} /> : <XCircle size={18} />}
                          <span>
                            {aiStatus === 'approved'
                              ? `${copy.labels.aiApproved} · ${copy.labels.aiCurrentAsset}`
                              : aiStatus === 'rejected'
                                ? `${copy.labels.aiRejected} · ${copy.labels.aiCorrectionOpen}`
                              : aiStatus === 'stale'
                                ? copy.labels.aiStale
                                : copy.labels.aiOpen}
                          </span>
                        </span>
                      ) : null}
                      {(aiStatus === 'approved' || aiStatus === 'rejected') && (record.aiReviewer || record.aiReviewedAt) ? (
                        <span className="max-w-64 truncate text-[11px] text-text-secondary">
                          {[record.aiReviewer, record.aiReviewedAt].filter(Boolean).join(' · ')}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-xs text-text-secondary md:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="font-semibold uppercase tracking-wide">{copy.labels.goalId}</dt>
                      <dd className="truncate font-mono">{record.goalId}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="font-semibold uppercase tracking-wide">{copy.labels.path}</dt>
                      <dd className="truncate font-mono">{record.landscapePath}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${statusBadgeClass(record.umlautsCorrectChatGpt)}`}>
                      {record.umlautsCorrectChatGpt === 'yes' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {copy.labels.umlaute}: {record.umlautsCorrectChatGpt === 'yes' ? copy.labels.yes : copy.labels.no}
                    </span>
                    <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${statusBadgeClass(record.contentApprovedChatGpt)}`}>
                      {record.contentApprovedChatGpt === 'yes' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {copy.labels.content}: {record.contentApprovedChatGpt === 'yes' ? copy.labels.yes : copy.labels.no}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.labels.humanApproved}</span>
                      <select
                        value={humanDecisionStatus(record)}
                        onChange={(event) => {
                          const value: HumanDecision = event.target.value === 'ok'
                            ? 'ok'
                            : event.target.value === 'nok'
                              ? 'nok'
                              : 'open'
                          updateRecord(record.goalId, record.imageUrl, (current) => ({
                            ...current,
                            humanApproved: value === 'ok' ? 'yes' : 'no',
                            humanIssueIdentified: value === 'nok' ? 'yes' : 'no',
                            humanIssueDescription: value === 'ok' || value === 'open'
                              ? ''
                              : current.humanIssueDescription,
                          }))
                        }}
                        className="mt-1 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary dark:bg-slate-950"
                      >
                        <option value="open">{copy.labels.open}</option>
                        <option value="ok">{copy.labels.ok}</option>
                        <option value="nok">{copy.labels.nok}</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.labels.humanDescription}</span>
                    <textarea
                      key={`${record.goalId}:${record.imageUrl}:${record.humanIssueDescription}`}
                      defaultValue={record.humanIssueDescription}
                      onBlur={(event) => {
                        const nextDescription = event.currentTarget.value
                        if (nextDescription === record.humanIssueDescription) return
                        updateRecord(record.goalId, record.imageUrl, (current) => ({
                          ...current,
                          humanIssueDescription: nextDescription,
                          humanApproved: nextDescription.trim() ? 'no' : current.humanApproved,
                          humanIssueIdentified: nextDescription.trim() ? 'yes' : current.humanIssueIdentified,
                        }))
                      }}
                      placeholder={copy.placeholders.humanDescription}
                      rows={3}
                      className="mt-1 w-full resize-y rounded-lg border border-border-color bg-white px-3 py-2 text-sm leading-relaxed text-text-primary dark:bg-slate-950"
                    />
                  </label>

                  <details className="mt-4 rounded-xl border border-border-color bg-slate-50/80 p-3 dark:bg-slate-950/50">
                    <summary className="cursor-pointer text-sm font-semibold text-text-primary">
                      {record.humanIssueIdentified === 'yes' ? (
                        <span className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertTriangle size={16} />{copy.prompt}</span>
                      ) : copy.prompt}
                    </summary>
                    <div className="mt-3 flex flex-col gap-3">
                      <div className="rounded-lg border border-sky-100 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <span className="inline-flex items-center gap-2 font-semibold text-text-primary">
                            <FileText size={16} />
                            {copy.alternativePrompt}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void loadReconstructionPrompt(record)}
                              disabled={reconstructionState?.status === 'loading' || reconstructionState?.status === 'generating'}
                              className="inline-flex w-fit items-center gap-2 rounded-lg border border-border-color px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-900"
                            >
                              <RefreshCw size={14} />
                              <span>{copy.loadAlternativePrompt}</span>
                            </button>
                            {reconstructionState?.status !== 'loaded' ? (
                              <button
                                type="button"
                                onClick={() => void generateReconstructionPrompt(record)}
                                disabled={reconstructionState?.status === 'loading' || reconstructionState?.status === 'generating'}
                                className="inline-flex w-fit items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900"
                              >
                                <FileText size={14} />
                                <span>{copy.generateAlternativePrompt}</span>
                              </button>
                            ) : null}
                          </div>
                        </div>
                        {reconstructionState?.status === 'loading' ? (
                          <p className="mt-2 text-xs text-text-secondary">{copy.alternativePromptLoading}</p>
                        ) : null}
                        {reconstructionState?.status === 'generating' ? (
                          <p className="mt-2 text-xs text-text-secondary">{copy.alternativePromptGenerating}</p>
                        ) : null}
                        {reconstructionState?.status === 'missing' ? (
                          <p className="mt-2 text-xs text-text-secondary">{copy.alternativePromptMissing}</p>
                        ) : null}
                        {reconstructionState?.status === 'error' ? (
                          <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">{reconstructionState.error}</p>
                        ) : null}
                        {reconstructionState?.status === 'loaded' ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <span className="truncate font-mono text-xs text-text-secondary">{reconstructionState.path}</span>
                            <textarea
                              readOnly
                              value={reconstructionState.prompt}
                              rows={6}
                              className="w-full resize-y rounded-lg border border-border-color bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed text-text-primary dark:bg-slate-900"
                            />
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyPrompt(record)}
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-white dark:hover:bg-slate-900"
                      >
                        <Copy size={16} />
                        <span>{copy.copyPrompt}</span>
                      </button>
                      <textarea
                        readOnly
                        value={prompt}
                        rows={10}
                        className="w-full resize-y rounded-lg border border-border-color bg-white px-3 py-2 font-mono text-xs leading-relaxed text-text-primary dark:bg-slate-950"
                      />
                    </div>
                  </details>
                </div>
              </article>
            )
          })}

          {!loading && visibleRecords.length === 0 ? (
            <div className="rounded-2xl border border-border-color bg-white/70 p-6 text-sm text-text-secondary dark:bg-slate-900/70">{copy.empty}</div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
