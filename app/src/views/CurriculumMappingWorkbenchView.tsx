import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  GitBranch,
  Home,
  Link2,
  RefreshCw,
  Split,
} from 'lucide-react'
import { LanguageToggle } from '../components/LanguageToggle'
import { InlineMathText } from '../components/InlineMathText'
import { FlashcardMarkdown } from '../components/srs/FlashcardMarkdown'
import { useLanguage } from '../contexts/LanguageContext'

interface MappingDocumentSummary {
  sourceLandscapeId: string
  sourceTitle: string
  subject: string
  jurisdiction: string
  stage: string
  sourcePath: string
  sourceGoalCount: number
  targetLandscapeId: string
  targetTitle: string
  targetPath: string
  mappingPath: string
  mappingCount: number
  referenceLinks?: ReferenceLink[]
}

interface ReferenceLink {
  label: string
  url: string
  path: string
}

interface MappingListResponse {
  documents: MappingDocumentSummary[]
}

const shouldPreferMappingDocument = (
  candidate: MappingDocumentSummary,
  current: MappingDocumentSummary,
): boolean => {
  const candidateIsReview = candidate.mappingPath.endsWith('.review.json')
  const currentIsReview = current.mappingPath.endsWith('.review.json')
  if (candidateIsReview !== currentIsReview) return candidateIsReview
  if (candidate.mappingCount !== current.mappingCount) return candidate.mappingCount > current.mappingCount
  return candidate.mappingPath.localeCompare(current.mappingPath) < 0
}

const deduplicateMappingDocuments = (
  documents: MappingDocumentSummary[],
): MappingDocumentSummary[] => {
  const documentsBySourceLandscapeId = new Map<string, MappingDocumentSummary>()
  documents.forEach((document) => {
    const current = documentsBySourceLandscapeId.get(document.sourceLandscapeId)
    if (!current || shouldPreferMappingDocument(document, current)) {
      documentsBySourceLandscapeId.set(document.sourceLandscapeId, document)
    }
  })
  return [...documentsBySourceLandscapeId.values()]
}

const SOURCE_LANDSCAPE_QUERY_PARAM = 'sourceLandscapeId'
const SELECTED_SOURCE_LANDSCAPE_STORAGE_KEY = 'skillpilot.curriculumMappingWorkbench.sourceLandscapeId'

const readRequestedSourceLandscapeId = (): string => {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(SOURCE_LANDSCAPE_QUERY_PARAM)?.trim() ?? ''
}

const readStoredSourceLandscapeId = (): string => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(SELECTED_SOURCE_LANDSCAPE_STORAGE_KEY)?.trim() ?? ''
}

const persistSelectedSourceLandscapeId = (sourceLandscapeId: string) => {
  if (typeof window === 'undefined' || !sourceLandscapeId) return
  window.localStorage.setItem(SELECTED_SOURCE_LANDSCAPE_STORAGE_KEY, sourceLandscapeId)
  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.set(SOURCE_LANDSCAPE_QUERY_PARAM, sourceLandscapeId)
  window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
}

const pickInitialSourceLandscapeId = (
  documents: MappingDocumentSummary[],
  current: string,
): string => {
  if (current && documents.some((entry) => entry.sourceLandscapeId === current)) return current

  const requested = readRequestedSourceLandscapeId()
  if (requested && documents.some((entry) => entry.sourceLandscapeId === requested)) return requested

  const stored = readStoredSourceLandscapeId()
  if (stored && documents.some((entry) => entry.sourceLandscapeId === stored)) return stored

  return documents.find((entry) =>
    entry.subject === 'Mathematik'
    && entry.jurisdiction === 'DE-HE'
    && entry.stage === 'SekII')?.sourceLandscapeId
    ?? documents[0]?.sourceLandscapeId
    ?? ''
}

interface SourceMapping {
  canonicalGoalId: string
  matchType: string
  mappingPath: string
}

interface SourceGoalRow {
  id: string
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  topicCode: string
  passageId: string
  granularity: string
  tags: string[]
  requires: string[]
  childrenIds: string[]
  type: string
  registered: boolean
  closureAtomicGoalIds: string[]
  directMappings: SourceMapping[]
  closureCanonicalGoalIds: string[]
  canonicalGoalIds: string[]
  matchTypes: string[]
  officialPassageIds: string[]
}

interface OfficialSourcePassage {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds: string[]
}

interface MappingPipelineCheck {
  id: string
  label: string
  passed: boolean
  details: string
}

interface MappingPipelineStep {
  id: string
  label: string
  status: 'complete' | 'incomplete' | 'blocked'
  dependsOn: string[]
  checks: MappingPipelineCheck[]
}

interface MappingPipelineStatus {
  version: number
  currentStep: string
  steps: MappingPipelineStep[]
}

interface CanonicalTreeNode {
  id: string
  kind: 'goal' | 'structure'
  goalId?: string
  title: string
  originalTitle?: string
  description?: string
  sourceRef?: string
  type?: string
  tags?: string[]
  mappedSourceGoalIds?: string[]
  coveredSourceGoalIds?: string[]
  children: CanonicalTreeNode[]
}

interface CompositionViewOption {
  path: string
  viewId: string
  label: string
  courseProfile: string
}

interface MappingPayload {
  source: {
    landscapeId: string
    title: string
    subject: string
    jurisdiction: string
    stage: string
    path: string
    referenceLinks?: ReferenceLink[]
    pipelineStatus?: MappingPipelineStatus | null
    officialPassages: OfficialSourcePassage[]
    rootGoalIds: string[]
    goals: SourceGoalRow[]
    stats: {
      totalGoals: number
      registeredGoals: number
      unregisteredGoals: number
      directlyMappedGoals: number
      closureMappedGoals: number
    }
  }
  target: {
    landscapeId: string
    title: string
    path: string
    rootNodes: CanonicalTreeNode[]
    viewOptions: CompositionViewOption[]
    selectedViewPath: string
    selectedViewLabel: string
  }
  mappings: {
    count: number
    exact: number
    partial: number
    mappingPaths: string[]
  }
}

type MappingStage = 'official-source' | 'source-canonical'

const COPY = {
  de: {
    title: 'Curriculum Mapping Workbench',
    subtitle: 'Nachvollziehbare Sicht von offiziellen PDF-Passagen über extrahierte Ziele bis zum SkillPilot-Tree.',
    badge: 'Mapping Audit',
    workbench: 'Workbench',
    home: 'Startseite',
    refresh: 'Aktualisieren',
    sourceDocument: 'Lehrplan-Snapshot',
    treeView: 'SkillPilot-Tree',
    sourceWindow: 'Offizieller Lehrplan + Snapshot',
    treeWindow: 'Treeansicht',
    mappingStage: 'Mapping-Stufe',
    officialToSource: '1 Original -> Source-Ziele',
    sourceToSkillPilot: '2 Source-Ziele -> SkillPilot',
    sourceToOfficial: 'Source -> Original',
    sourceGoalsWindow: 'Source-Ziele',
    officialPassages: 'Offizielle Lehrplanpassagen',
    extractedGoals: 'Extrahierte Source-Ziele',
    pdfPage: 'PDF-Seite',
    sourceStats: 'Snapshot',
    officialSources: 'Offizielle Quellen',
    registered: 'registriert',
    unregistered: 'nicht registriert',
    mapped: 'gemappt',
    closureMapped: 'über Closure',
    direct: 'direkt',
    exact: 'exact',
    partial: 'partial',
    sourceRef: 'Quelle',
    selectedSource: 'Ausgewähltes Source-Ziel',
    selectedTree: 'Ausgewählter Tree-Knoten',
    noSelection: 'Wähle links eine Lehrplanpassage, ein Source-Ziel oder rechts einen Tree-Knoten.',
    sourceToTree: 'Source -> Tree',
    treeToSource: 'Tree -> Source',
    closureAtoms: 'atomare Source-Closure',
    supportingSources: 'belegende Source-Ziele',
    derivedSourceGoals: 'abgeleitete Source-Ziele',
    selectOfficialPassage: 'Wähle links eine offizielle Lehrplanpassage.',
    noSourceGoalsForPassage: 'Für diese Passage sind aktuell keine Source-Ziele zugeordnet.',
    mappingFiles: 'Mapping-Dateien',
    compositionView: 'Composition View',
    noView: 'Automatisch passende View',
    loading: 'Laden ...',
    missingLocalEndpoint: 'Mapping-Daten konnten nicht geladen werden. Diese Sicht funktioniert in der lokalen Workbench über den Vite-Dev-Endpunkt.',
    pipeline: 'Bearbeitungspipeline',
    currentStep: 'Nächster offener Schritt',
    complete: 'abgeschlossen',
    incomplete: 'offen',
    blocked: 'blockiert',
  },
  en: {
    title: 'Curriculum Mapping Workbench',
    subtitle: 'Traceable view from official PDF passages through extracted goals into the SkillPilot tree.',
    badge: 'Mapping Audit',
    workbench: 'Workbench',
    home: 'Home',
    refresh: 'Refresh',
    sourceDocument: 'Curriculum snapshot',
    treeView: 'SkillPilot tree',
    sourceWindow: 'Official curriculum + snapshot',
    treeWindow: 'Tree view',
    mappingStage: 'Mapping stage',
    officialToSource: '1 Original -> source goals',
    sourceToSkillPilot: '2 Source goals -> SkillPilot',
    sourceToOfficial: 'Source -> original',
    sourceGoalsWindow: 'Source goals',
    officialPassages: 'Official curriculum passages',
    extractedGoals: 'Extracted source goals',
    pdfPage: 'PDF page',
    sourceStats: 'Snapshot',
    officialSources: 'Official sources',
    registered: 'registered',
    unregistered: 'not registered',
    mapped: 'mapped',
    closureMapped: 'via closure',
    direct: 'direct',
    exact: 'exact',
    partial: 'partial',
    sourceRef: 'Source',
    selectedSource: 'Selected source goal',
    selectedTree: 'Selected tree node',
    noSelection: 'Select a curriculum passage, source goal, or tree node.',
    sourceToTree: 'Source -> tree',
    treeToSource: 'Tree -> source',
    closureAtoms: 'atomic source closure',
    supportingSources: 'supporting source goals',
    derivedSourceGoals: 'derived source goals',
    selectOfficialPassage: 'Select an official curriculum passage on the left.',
    noSourceGoalsForPassage: 'No source goals are currently assigned to this passage.',
    mappingFiles: 'Mapping files',
    compositionView: 'Composition view',
    noView: 'Automatic matching view',
    loading: 'Loading ...',
    missingLocalEndpoint: 'Mapping data could not be loaded. This view works in the local Workbench through the Vite dev endpoint.',
    pipeline: 'Processing pipeline',
    currentStep: 'Next open step',
    complete: 'complete',
    incomplete: 'open',
    blocked: 'blocked',
  },
} as const

const shortId = (id: string) => id.length > 10 ? `${id.slice(0, 8)}...` : id

const nodeDomId = (prefix: 'source' | 'canonical', id: string) => `${prefix}-mapping-node-${id}`
const officialPassageDomId = (id: string) => `official-curriculum-passage-${id}`

const Badge: React.FC<{ children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' | 'slate' }> = ({
  children,
  tone = 'slate',
}) => {
  const className = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
    blue: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300',
    slate: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }[tone]
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  )
}

const collectCanonicalNodes = (nodes: CanonicalTreeNode[], result: Map<string, CanonicalTreeNode>) => {
  nodes.forEach((node) => {
    if (node.goalId) {
      result.set(node.goalId, node)
    }
    collectCanonicalNodes(node.children ?? [], result)
  })
}

const pipelineStatusTone = (status: MappingPipelineStep['status']): 'green' | 'amber' | 'red' =>
  status === 'complete' ? 'green' : status === 'blocked' ? 'red' : 'amber'

export const CurriculumMappingWorkbenchView: React.FC = () => {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [documents, setDocuments] = useState<MappingDocumentSummary[]>([])
  const [selectedSourceLandscapeId, setSelectedSourceLandscapeId] = useState('')
  const [selectedViewPath, setSelectedViewPath] = useState('')
  const [mappingStage, setMappingStage] = useState<MappingStage>('official-source')
  const [payload, setPayload] = useState<MappingPayload | null>(null)
  const [selectedOfficialPassageId, setSelectedOfficialPassageId] = useState('')
  const [selectedSourceGoalId, setSelectedSourceGoalId] = useState('')
  const [selectedCanonicalGoalId, setSelectedCanonicalGoalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    setError(null)
    try {
      const response = await fetch('/__curriculum-mapping-workbench/list')
      if (!response.ok) throw new Error(response.statusText)
      const data = await response.json() as MappingListResponse
      const deduplicatedDocuments = deduplicateMappingDocuments(data.documents)
      setDocuments(deduplicatedDocuments)
      setSelectedSourceLandscapeId((current) => pickInitialSourceLandscapeId(deduplicatedDocuments, current))
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.missingLocalEndpoint)
    }
  }, [copy.missingLocalEndpoint])

  const loadPayload = useCallback(async () => {
    if (!selectedSourceLandscapeId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ sourceLandscapeId: selectedSourceLandscapeId })
      if (selectedViewPath) params.set('viewPath', selectedViewPath)
      const response = await fetch(`/__curriculum-mapping-workbench/load?${params.toString()}`)
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? response.statusText)
      }
      const data = await response.json() as MappingPayload
      setPayload(data)
      setMappingStage((current) => current === 'official-source' && data.source.officialPassages.length === 0
        ? 'source-canonical'
        : current)
      setSelectedOfficialPassageId('')
      setSelectedSourceGoalId('')
      setSelectedCanonicalGoalId('')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.missingLocalEndpoint)
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [copy.missingLocalEndpoint, selectedSourceLandscapeId, selectedViewPath])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  useEffect(() => {
    void loadPayload()
  }, [loadPayload])

  const sourceGoalById = useMemo(
    () => new Map((payload?.source.goals ?? []).map((goal) => [goal.id, goal])),
    [payload],
  )

  const officialPassageById = useMemo(
    () => new Map((payload?.source.officialPassages ?? []).map((passage) => [passage.id, passage])),
    [payload],
  )

  const canonicalNodeByGoalId = useMemo(() => {
    const result = new Map<string, CanonicalTreeNode>()
    collectCanonicalNodes(payload?.target.rootNodes ?? [], result)
    return result
  }, [payload])

  const selectedSourceGoal = selectedSourceGoalId ? sourceGoalById.get(selectedSourceGoalId) ?? null : null
  const selectedCanonicalNode = selectedCanonicalGoalId ? canonicalNodeByGoalId.get(selectedCanonicalGoalId) ?? null : null
  const selectedOfficialPassage = selectedOfficialPassageId ? officialPassageById.get(selectedOfficialPassageId) ?? null : null

  useEffect(() => {
    if (mappingStage !== 'official-source' || !payload) return
    setSelectedOfficialPassageId((current) => {
      if (current && payload.source.officialPassages.some((passage) => passage.id === current)) return current
      return payload.source.officialPassages[0]?.id ?? ''
    })
  }, [mappingStage, payload])

  const highlightedCanonicalGoalIds = useMemo(() => {
    if (!selectedSourceGoal) return new Set<string>()
    return new Set(selectedSourceGoal.canonicalGoalIds)
  }, [selectedSourceGoal])

  const highlightedOfficialPassageIds = useMemo(() => {
    const result = new Set<string>()
    if (selectedOfficialPassage) result.add(selectedOfficialPassage.id)
    if (selectedSourceGoal) {
      selectedSourceGoal.officialPassageIds.forEach((passageId) => result.add(passageId))
    }
    return result
  }, [selectedOfficialPassage, selectedSourceGoal])

  const highlightedSourceGoalIds = useMemo(() => {
    const result = new Set<string>()
    if (mappingStage === 'official-source' && selectedOfficialPassage) {
      selectedOfficialPassage.sourceGoalIds.forEach((sourceGoalId) => result.add(sourceGoalId))
    }
    if (selectedCanonicalNode) {
      ;(selectedCanonicalNode.coveredSourceGoalIds ?? []).forEach((sourceGoalId) => result.add(sourceGoalId))
      ;(selectedCanonicalNode.mappedSourceGoalIds ?? []).forEach((sourceGoalId) => result.add(sourceGoalId))
    }
    if (selectedSourceGoal) {
      result.add(selectedSourceGoal.id)
      selectedSourceGoal.closureAtomicGoalIds.forEach((sourceGoalId) => result.add(sourceGoalId))
    }
    return result
  }, [mappingStage, selectedCanonicalNode, selectedOfficialPassage, selectedSourceGoal])

  useEffect(() => {
    const targetId = selectedSourceGoal?.canonicalGoalIds[0]
    if (!targetId) return
    window.setTimeout(() => {
      document.getElementById(nodeDomId('canonical', targetId))?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 0)
  }, [selectedSourceGoal])

  useEffect(() => {
    const targetId = selectedSourceGoal?.officialPassageIds[0]
    if (!targetId) return
    window.setTimeout(() => {
      document.getElementById(officialPassageDomId(targetId))?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 0)
  }, [selectedSourceGoal])

  useEffect(() => {
    const targetId = selectedOfficialPassage?.sourceGoalIds[0]
    if (!targetId) return
    window.setTimeout(() => {
      document.getElementById(nodeDomId('source', targetId))?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 0)
  }, [selectedOfficialPassage])

  useEffect(() => {
    const targetId = selectedCanonicalNode?.coveredSourceGoalIds?.[0]
      ?? selectedCanonicalNode?.mappedSourceGoalIds?.[0]
    if (!targetId) return
    window.setTimeout(() => {
      document.getElementById(nodeDomId('source', targetId))?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 0)
  }, [selectedCanonicalNode])

  const selectedDocument = documents.find((entry) => entry.sourceLandscapeId === selectedSourceLandscapeId)
  const pipelineStatusLabel = (status: MappingPipelineStep['status']) => ({
    complete: copy.complete,
    incomplete: copy.incomplete,
    blocked: copy.blocked,
  }[status])

  const renderOfficialPassage = (passage: OfficialSourcePassage): React.ReactNode => {
    const selected = selectedOfficialPassageId === passage.id
    const highlighted = highlightedOfficialPassageIds.has(passage.id)

    return (
      <article
        key={passage.id}
        id={officialPassageDomId(passage.id)}
        className={`rounded-xl border p-3 transition-colors ${
          selected
            ? 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40'
            : highlighted
              ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
              : 'border-border-color bg-white/80 dark:bg-slate-950/40'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedOfficialPassageId(passage.id)
            setSelectedSourceGoalId('')
            setSelectedCanonicalGoalId('')
          }}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-text-primary">{passage.title}</span>
              <Badge tone="blue">{passage.topicCode}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">
              {copy.pdfPage} {passage.page} · {passage.sourcePath}
            </p>
          </div>
          <Badge tone={passage.sourceGoalIds.length > 0 ? 'green' : 'amber'}>
            {passage.sourceGoalIds.length} {copy.derivedSourceGoals}
          </Badge>
        </button>
        <FlashcardMarkdown
          content={passage.text}
          className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
      </article>
    )
  }

  const renderSourceGoal = (
    goalId: string,
    depth = 0,
    visiting = new Set<string>(),
    options: { showCanonicalMapping?: boolean; preserveOfficialPassageSelection?: boolean; renderChildren?: boolean } = {},
  ): React.ReactNode => {
    if (visiting.has(goalId)) return null
    const goal = sourceGoalById.get(goalId)
    if (!goal) return null
    const nextVisiting = new Set(visiting)
    nextVisiting.add(goalId)
    const selected = selectedSourceGoalId === goal.id
    const highlighted = highlightedSourceGoalIds.has(goal.id)
    const directMapped = goal.directMappings.length > 0
    const closureMapped = goal.canonicalGoalIds.length > 0

    return (
      <div key={goal.id} className="space-y-1">
        <button
          id={nodeDomId('source', goal.id)}
          type="button"
          onClick={() => {
            if (!options.preserveOfficialPassageSelection) setSelectedOfficialPassageId('')
            setSelectedSourceGoalId(goal.id)
            setSelectedCanonicalGoalId('')
          }}
          className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
            selected
              ? 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40'
              : highlighted
                ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-transparent hover:border-border-color hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          style={{ marginLeft: `${Math.min(depth, 6) * 18}px`, width: `calc(100% - ${Math.min(depth, 6) * 18}px)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <InlineMathText text={goal.title} className="font-semibold text-text-primary" />
                <span className="font-mono text-[11px] text-text-secondary">{shortId(goal.id)}</span>
              </div>
              <InlineMathText
                text={goal.description}
                className="mt-1 block line-clamp-2 text-xs leading-relaxed text-text-secondary"
              />
              {goal.sourceRef ? (
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">{goal.sourceRef}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge tone={goal.registered ? 'green' : 'red'}>
                {goal.registered ? copy.registered : copy.unregistered}
              </Badge>
              {options.showCanonicalMapping && directMapped ? <Badge tone="blue">{copy.direct}</Badge> : null}
              {options.showCanonicalMapping && !directMapped && closureMapped ? <Badge tone="amber">{copy.closureMapped}</Badge> : null}
            </div>
          </div>
        </button>

        {options.renderChildren === false
          ? null
          : goal.childrenIds.map((childId) => renderSourceGoal(childId, depth + 1, nextVisiting, options))}
      </div>
    )
  }

  const renderCanonicalNode = (node: CanonicalTreeNode, depth = 0): React.ReactNode => {
    if (node.kind === 'structure') {
      return (
        <div key={node.id} className="space-y-1">
          <div
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            style={{ marginLeft: `${Math.min(depth, 6) * 18}px`, width: `calc(100% - ${Math.min(depth, 6) * 18}px)` }}
          >
            {node.title}
          </div>
          {node.children.map((child) => renderCanonicalNode(child, depth + 1))}
        </div>
      )
    }

    const goalId = node.goalId ?? ''
    const selected = selectedCanonicalGoalId === goalId
    const highlighted = highlightedCanonicalGoalIds.has(goalId)
    const directSourceCount = node.mappedSourceGoalIds?.length ?? 0
    const coveredSourceCount = node.coveredSourceGoalIds?.length ?? 0

    return (
      <div key={node.id} className="space-y-1">
        <button
          id={goalId ? nodeDomId('canonical', goalId) : undefined}
          type="button"
          onClick={() => {
            if (!goalId) return
            setSelectedOfficialPassageId('')
            setSelectedCanonicalGoalId(goalId)
            setSelectedSourceGoalId('')
          }}
          className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
            selected
              ? 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40'
              : highlighted
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                : 'border-transparent hover:border-border-color hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          style={{ marginLeft: `${Math.min(depth, 6) * 18}px`, width: `calc(100% - ${Math.min(depth, 6) * 18}px)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <InlineMathText text={node.title} className="font-semibold text-text-primary" />
                {goalId ? <span className="font-mono text-[11px] text-text-secondary">{shortId(goalId)}</span> : null}
              </div>
              {node.description ? (
                <InlineMathText
                  text={node.description}
                  className="mt-1 block line-clamp-2 text-xs leading-relaxed text-text-secondary"
                />
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge tone={directSourceCount > 0 ? 'blue' : coveredSourceCount > 0 ? 'amber' : 'slate'}>
                {directSourceCount > 0 ? `${directSourceCount} ${copy.direct}` : `${coveredSourceCount} ${copy.sourceToTree}`}
              </Badge>
              {node.type === 'atomic' ? <Badge tone="green">atomic</Badge> : null}
            </div>
          </div>
        </button>
        {node.children.map((child) => renderCanonicalNode(child, depth + 1))}
      </div>
    )
  }

  const renderOfficialPassagePane = () => (
    <div className="flex min-h-[680px] flex-col rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70">
      <div className="border-b border-border-color p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText size={18} />
          <span>{copy.officialPassages}</span>
        </h2>
        <p className="mt-1 text-xs text-text-secondary">{payload?.source.referenceLinks?.[0]?.label ?? payload?.source.title ?? copy.loading}</p>
      </div>
      <div className="max-h-[620px] flex-1 overflow-auto p-3">
        {payload ? (
          <div className="space-y-2">
            {payload.source.officialPassages.length > 0
              ? payload.source.officialPassages.map(renderOfficialPassage)
              : <p className="p-3 text-sm text-text-secondary">{copy.loading}</p>}
          </div>
        ) : <p className="p-3 text-sm text-text-secondary">{copy.loading}</p>}
      </div>
    </div>
  )

  const renderSourceGoalPane = (showCanonicalMapping: boolean) => (
    <div className="flex min-h-[680px] flex-col rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70">
      <div className="border-b border-border-color p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText size={18} />
          <span>{copy.sourceGoalsWindow}</span>
        </h2>
        <p className="mt-1 text-xs text-text-secondary">{payload?.source.title ?? copy.loading}</p>
      </div>
      <div className="max-h-[620px] flex-1 overflow-auto p-3">
        {payload
          ? payload.source.rootGoalIds.map((goalId) => renderSourceGoal(goalId, 0, new Set<string>(), { showCanonicalMapping }))
          : <p className="p-3 text-sm text-text-secondary">{copy.loading}</p>}
      </div>
    </div>
  )

  const renderPassageSourceGoalPane = () => (
    <div className="flex min-h-[680px] flex-col rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70">
      <div className="border-b border-border-color p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText size={18} />
          <span>{copy.sourceGoalsWindow}</span>
        </h2>
        <p className="mt-1 text-xs text-text-secondary">{selectedOfficialPassage?.title ?? copy.selectOfficialPassage}</p>
      </div>
      <div className="max-h-[620px] flex-1 overflow-auto p-3">
        {!payload ? (
          <p className="p-3 text-sm text-text-secondary">{copy.loading}</p>
        ) : !selectedOfficialPassage ? (
          <p className="rounded-xl border border-dashed border-border-color p-4 text-sm text-text-secondary">
            {copy.selectOfficialPassage}
          </p>
        ) : selectedOfficialPassage.sourceGoalIds.length > 0 ? (
          selectedOfficialPassage.sourceGoalIds.map((goalId) =>
            renderSourceGoal(goalId, 0, new Set<string>(), {
              showCanonicalMapping: false,
              preserveOfficialPassageSelection: true,
              renderChildren: false,
            }))
        ) : (
          <p className="rounded-xl border border-dashed border-border-color p-4 text-sm text-text-secondary">
            {copy.noSourceGoalsForPassage}
          </p>
        )}
      </div>
    </div>
  )

  const renderCanonicalTreePane = () => (
    <div className="flex min-h-[680px] flex-col rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70">
      <div className="border-b border-border-color p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpenCheck size={18} />
          <span>{copy.treeWindow}</span>
        </h2>
        <p className="mt-1 text-xs text-text-secondary">{payload?.target.selectedViewLabel || payload?.target.title || copy.loading}</p>
      </div>
      <div className="max-h-[620px] flex-1 overflow-auto p-3">
        {payload
          ? payload.target.rootNodes.map((node) => renderCanonicalNode(node))
          : <p className="p-3 text-sm text-text-secondary">{copy.loading}</p>}
      </div>
    </div>
  )

  const renderPipelineStatus = () => {
    const pipeline = payload?.source.pipelineStatus
    if (!pipeline?.steps?.length) return null

    const currentStep = pipeline.steps.find((step) => step.id === pipeline.currentStep)

    return (
      <div className="mt-4 rounded-xl border border-border-color bg-slate-50 p-3 dark:bg-slate-950/50">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.pipeline}</span>
          {currentStep ? (
            <Badge tone={pipelineStatusTone(currentStep.status)}>
              {copy.currentStep}: {currentStep.id}
            </Badge>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {pipeline.steps.map((step) => (
            <div key={step.id} className="rounded-lg border border-border-color bg-white p-3 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-semibold text-text-secondary">{step.id}</div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">{step.label}</div>
                </div>
                <Badge tone={pipelineStatusTone(step.status)}>{pipelineStatusLabel(step.status)}</Badge>
              </div>
              <div className="mt-3 space-y-1">
                {step.checks.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                    <CheckCircle2
                      size={14}
                      className={entry.passed ? 'mt-0.5 shrink-0 text-emerald-600' : 'mt-0.5 shrink-0 text-amber-600'}
                    />
                    <span>
                      <span className="font-semibold text-text-primary">{entry.label}</span>
                      <span className="text-text-secondary"> · {entry.details}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDetails = () => {
    if (mappingStage === 'official-source' && selectedOfficialPassage && !selectedSourceGoal) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <FileText size={15} />
            <span>{copy.officialPassages}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{selectedOfficialPassage.title}</h3>
            <p className="mt-1 text-xs text-text-secondary">
              {copy.pdfPage} {selectedOfficialPassage.page} · {selectedOfficialPassage.sourcePath}
            </p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.derivedSourceGoals}</div>
            <div className="flex flex-wrap gap-2">
              {selectedOfficialPassage.sourceGoalIds.length > 0 ? selectedOfficialPassage.sourceGoalIds.map((sourceGoalId) => {
                const goal = sourceGoalById.get(sourceGoalId)
                return (
                  <button
                    key={sourceGoalId}
                    type="button"
                    onClick={() => {
                      setSelectedSourceGoalId(sourceGoalId)
                      setSelectedCanonicalGoalId('')
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <FileText size={13} />
                    <InlineMathText text={goal?.title ?? shortId(sourceGoalId)} />
                  </button>
                )
              }) : <span className="text-sm text-text-secondary">-</span>}
            </div>
          </div>
        </div>
      )
    }

    if (selectedSourceGoal) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <FileText size={15} />
            <span>{copy.selectedSource}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              <InlineMathText text={selectedSourceGoal.title} />
            </h3>
            <InlineMathText
              text={selectedSourceGoal.description}
              className="mt-1 block text-sm leading-relaxed text-text-secondary"
            />
            {selectedSourceGoal.sourceSpan ? (
              <FlashcardMarkdown
                content={selectedSourceGoal.sourceSpan}
                className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            ) : null}
            {selectedSourceGoal.sourceRef ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{copy.sourceRef}: {selectedSourceGoal.sourceRef}</p>
            ) : null}
          </div>
          {selectedSourceGoal.officialPassageIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedSourceGoal.officialPassageIds.map((passageId) => {
                const passage = officialPassageById.get(passageId)
                return (
                  <button
                    key={passageId}
                    type="button"
                    onClick={() => {
                      setSelectedOfficialPassageId(passageId)
                      setSelectedSourceGoalId('')
                      setSelectedCanonicalGoalId('')
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    <FileText size={13} />
                    <span>{passage?.title ?? passageId}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border-color p-3">
              <div className="text-xs text-text-secondary">{copy.closureAtoms}</div>
              <div className="mt-1 text-lg font-semibold">{selectedSourceGoal.closureAtomicGoalIds.length}</div>
            </div>
            <div className="rounded-xl border border-border-color p-3">
              <div className="text-xs text-text-secondary">{copy.direct}</div>
              <div className="mt-1 text-lg font-semibold">{selectedSourceGoal.directMappings.length}</div>
            </div>
            <div className="rounded-xl border border-border-color p-3">
              <div className="text-xs text-text-secondary">{copy.sourceToTree}</div>
              <div className="mt-1 text-lg font-semibold">{selectedSourceGoal.canonicalGoalIds.length}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSourceGoal.canonicalGoalIds.map((canonicalGoalId) => {
              const node = canonicalNodeByGoalId.get(canonicalGoalId)
              return (
                <button
                  key={canonicalGoalId}
                  type="button"
                  onClick={() => {
                    setSelectedOfficialPassageId('')
                    setSelectedCanonicalGoalId(canonicalGoalId)
                    setSelectedSourceGoalId('')
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300"
                >
                  <Link2 size={13} />
                  <InlineMathText text={node?.title ?? shortId(canonicalGoalId)} />
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (selectedCanonicalNode) {
      const supportingSourceIds = [
        ...new Set([
          ...(selectedCanonicalNode.mappedSourceGoalIds ?? []),
          ...(selectedCanonicalNode.coveredSourceGoalIds ?? []),
        ]),
      ]
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            <GitBranch size={15} />
            <span>{copy.selectedTree}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              <InlineMathText text={selectedCanonicalNode.title} />
            </h3>
            {selectedCanonicalNode.description ? (
              <InlineMathText
                text={selectedCanonicalNode.description}
                className="mt-1 block text-sm leading-relaxed text-text-secondary"
              />
            ) : null}
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.supportingSources}</div>
            <div className="flex flex-wrap gap-2">
              {supportingSourceIds.length > 0 ? supportingSourceIds.map((sourceGoalId) => {
                const goal = sourceGoalById.get(sourceGoalId)
                return (
                  <button
                    key={sourceGoalId}
                    type="button"
                    onClick={() => {
                      setSelectedOfficialPassageId('')
                      setSelectedSourceGoalId(sourceGoalId)
                      setSelectedCanonicalGoalId('')
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <FileText size={13} />
                    <InlineMathText text={goal?.title ?? shortId(sourceGoalId)} />
                  </button>
                )
              }) : <span className="text-sm text-text-secondary">-</span>}
            </div>
          </div>
        </div>
      )
    }

    return <p className="text-sm text-text-secondary">{copy.noSelection}</p>
  }

  return (
    <div className="min-h-screen bg-chat-bg p-4 text-text-primary md:p-6">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                <Split size={14} />
                <span>{copy.badge}</span>
              </div>
              <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">{copy.title}</h1>
              <p className="mt-2 text-sm text-text-secondary md:text-base">{copy.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => {
                  void loadDocuments()
                  void loadPayload()
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>{copy.refresh}</span>
              </button>
              <Link
                to="/workbench"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={16} />
                <span>{copy.workbench}</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Home size={16} />
                <span>{copy.home}</span>
              </Link>
              <LanguageToggle />
            </div>
          </div>
        </header>

        {error ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {error}
          </section>
        ) : null}

        <section className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr_1fr]">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.sourceDocument}</span>
              <select
                value={selectedSourceLandscapeId}
                onChange={(event) => {
                  const nextSourceLandscapeId = event.target.value
                  setSelectedSourceLandscapeId(nextSourceLandscapeId)
                  persistSelectedSourceLandscapeId(nextSourceLandscapeId)
                  setSelectedViewPath('')
                }}
                className="w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm dark:bg-slate-950"
              >
                {documents.map((entry) => (
                  <option key={`${entry.sourceLandscapeId}:${entry.mappingPath}`} value={entry.sourceLandscapeId}>
                    {[entry.subject, entry.jurisdiction, entry.stage, entry.sourceTitle]
                      .filter(Boolean)
                      .join(' · ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.compositionView}</span>
              <select
                value={selectedViewPath || payload?.target.selectedViewPath || ''}
                onChange={(event) => setSelectedViewPath(event.target.value)}
                className="w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm dark:bg-slate-950"
                disabled={!payload}
              >
                <option value="">{copy.noView}</option>
                {(payload?.target.viewOptions ?? []).map((entry) => (
                  <option key={entry.path} value={entry.path}>{entry.label}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl border border-border-color p-3">
                <div className="text-xs text-text-secondary">{copy.sourceStats}</div>
                <div className="mt-1 text-lg font-semibold">{payload?.source.stats.totalGoals ?? selectedDocument?.sourceGoalCount ?? 0}</div>
              </div>
              <div className="rounded-xl border border-border-color p-3">
                <div className="text-xs text-text-secondary">{copy.registered}</div>
                <div className="mt-1 text-lg font-semibold">{payload?.source.stats.registeredGoals ?? 0}</div>
              </div>
              <div className="rounded-xl border border-border-color p-3">
                <div className="text-xs text-text-secondary">{copy.mapped}</div>
                <div className="mt-1 text-lg font-semibold">{payload?.source.stats.closureMappedGoals ?? selectedDocument?.mappingCount ?? 0}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.mappingStage}</span>
            {([
              ['official-source', copy.officialToSource],
              ['source-canonical', copy.sourceToSkillPilot],
            ] as const).map(([stage, label]) => (
              <button
                key={stage}
                type="button"
                onClick={() => {
                  setMappingStage(stage)
                  setSelectedOfficialPassageId('')
                  setSelectedSourceGoalId('')
                  setSelectedCanonicalGoalId('')
                }}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  mappingStage === stage
                    ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                    : 'border-border-color hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {stage === 'official-source' ? <FileText size={16} /> : <BookOpenCheck size={16} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
          {payload ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <span className="font-mono">{payload.source.path}</span>
              <span>-</span>
              <span className="font-mono">{payload.target.path}</span>
              <span>-</span>
              <span>{copy.mappingFiles}: {payload.mappings.mappingPaths.join(', ')}</span>
            </div>
          ) : null}
          {payload?.source.referenceLinks?.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wide text-text-secondary">{copy.officialSources}</span>
              {payload.source.referenceLinks.map((entry) => (
                <a
                  key={entry.url}
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300"
                  title={entry.path}
                >
                  <Link2 size={13} />
                  <span>{entry.label}</span>
                </a>
              ))}
            </div>
          ) : selectedDocument?.referenceLinks?.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wide text-text-secondary">{copy.officialSources}</span>
              {selectedDocument.referenceLinks.map((entry) => (
                <a
                  key={entry.url}
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300"
                  title={entry.path}
                >
                  <Link2 size={13} />
                  <span>{entry.label}</span>
                </a>
              ))}
            </div>
          ) : null}
          {renderPipelineStatus()}
        </section>

        <section className="grid min-h-[720px] grid-cols-1 gap-4 xl:grid-cols-2">
          {mappingStage === 'official-source' ? (
            <>
              {renderOfficialPassagePane()}
              {renderPassageSourceGoalPane()}
            </>
          ) : (
            <>
              {renderSourceGoalPane(true)}
              {renderCanonicalTreePane()}
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70 md:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {mappingStage === 'official-source' ? (
              <>
                <Badge tone={selectedOfficialPassage ? 'green' : 'slate'}>
                  <CheckCircle2 size={13} className="mr-1" />
                  {copy.officialToSource}
                </Badge>
                <Badge tone={selectedSourceGoal ? 'green' : 'slate'}>
                  <Link2 size={13} className="mr-1" />
                  {copy.sourceToOfficial}
                </Badge>
              </>
            ) : (
              <>
                <Badge tone={selectedSourceGoal ? 'green' : 'slate'}>
                  <CheckCircle2 size={13} className="mr-1" />
                  {copy.sourceToTree}
                </Badge>
                <Badge tone={selectedCanonicalNode ? 'green' : 'slate'}>
                  <Link2 size={13} className="mr-1" />
                  {copy.treeToSource}
                </Badge>
                {payload ? <Badge tone="blue">{payload.mappings.exact} {copy.exact}</Badge> : null}
                {payload ? <Badge tone="amber">{payload.mappings.partial} {copy.partial}</Badge> : null}
              </>
            )}
          </div>
          {renderDetails()}
        </section>
      </div>
    </div>
  )
}
