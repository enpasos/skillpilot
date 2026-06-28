import React from 'react'
import { Check, FileSearch, Send, Target, X } from 'lucide-react'
import type { UiGoal as Goal } from '../goalTypes'
import sourceRationaleMathPublicUrl from '../data/goal-source-rationales-math-public.json?url'

import { MasteryBar } from './MasteryBar'
import { isCompleteMastery, isMastered } from '../goalUiUtils'
import { InlineMathText } from './InlineMathText'
import { useLanguage } from '../contexts/LanguageContext'
import { formatApplicabilityDimensionLabel, formatFilterValueLabel } from '../utils/filterLabels'
import { getGoalCardCopy } from '../utils/goalCardCopy'
import { getAudienceGoalTitle } from '../utils/treeProjectionRuntime'
import { splitFilterIds } from '../utils/goalFilters'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'

interface GoalCardProps {
  goal: Goal
  masteryValue: number
  onMasteryChange?: (id: string, value: number) => void
  showLearnerTools: boolean
  useRawGoalTitles?: boolean
  hideTechnicalStructureUi?: boolean
  readOnly?: boolean
  showDetails?: boolean
  isPlanned?: boolean
  isActive?: boolean
  activeFilter?: string

  onSetActive?: (id: string) => void
  onRevealActive?: () => void
  nextCandidates?: Goal[]
  isFrontier?: boolean
}

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

type GoalSourceLink = {
  type?: string
  title?: string
  url: string
  resourceType?: string
  provider?: string
  sections?: string[]
  description?: string
  lang?: string
  license?: string
  skillpilotId?: string
  role?: string
  altText?: string
  reviewStatus?: string
}

type GoalProvenance = {
  sourceTitle?: string
  sourceUrl?: string
  sourceLicense?: string
  sourceLicenseUrl?: string
}

type GoalSourceDocument = {
  title?: string
  url?: string
  path?: string
}

type GoalClassicSourceRoute = {
  jurisdiction?: string
  sourceRef?: string
  sourceText?: string
  parentBulletText?: string
  sourceExtractionPath?: string
  sourceDocument?: GoalSourceDocument
  matchType?: string
  rationale?: string
}

type GoalMemSparqlRoute = {
  status?: string
  jurisdiction?: string
  endpoint?: string
  graphIri?: string
  planIri?: string
  planLabel?: string
  yearLabel?: string
  goalIri?: string
  goalLabel?: string
  notes?: string
}

type GoalSourceRationaleItem = {
  goal?: {
    id?: string
    title?: string
    description?: string
    pathTitles?: string[]
  }
  classicSourceRoute?: GoalClassicSourceRoute
  alternateClassicSourceRoutes?: GoalClassicSourceRoute[]
  memSparqlRoute?: GoalMemSparqlRoute
}

type ApplicabilityGroup = {
  dimension: string
  values: string[]
}

const SOURCE_RATIONALE_ASSET_URL = sourceRationaleMathPublicUrl
const SOURCE_RATIONALE_PUBLIC_PATH = '/data/goal-source-rationales-math-public.json'
const SOURCE_RATIONALE_STATUS_PATH = 'docs/qa-ci/status/goal-source-rationales-mem-examples-plain.json'
const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'
const PROGRAM_UNIT_KIND_TAG_PREFIX = 'program-unit:'
const PROGRAM_UNIT_ANCHOR_TAG = 'program-unit:anchor'

const LEGACY_ATTRIBUTION_LINE_PATTERNS = [
  /^\s*\[(course url|kurs-url)\]\(.*\)\s*$/i,
  /^\s*(license|lizenz)\s*:\s*\[.*\]\(.*\)\s*$/i,
]

const asRecord = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const readStringArray = (value: unknown): string[] => (
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []
)

const isRenderableExamData = (examData: Goal['examData']): boolean => {
  const status = String(examData?.reviewStatus ?? '').trim().toLowerCase()
  return status.length === 0 || status === 'released'
}

const decodeCommonHtmlEntities = (value?: string): string => (
  (value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
)

const normalizeSourceRationaleItem = (rawItem: unknown): GoalSourceRationaleItem | null => {
  const item = asRecord(rawItem)
  const rawGoal = asRecord(item?.goal)
  const goalId = readString(rawGoal?.id)
  if (!item || !rawGoal || !goalId) return null

  const rawClassicRoute = asRecord(item.classicSourceRoute)
  const rawAlternateClassicRoutes = Array.isArray(item.alternateClassicSourceRoutes)
    ? item.alternateClassicSourceRoutes
    : []
  const rawMemRoute = asRecord(item.memSparqlRoute)

  const normalizeClassicRoute = (rawRoute: Record<string, unknown> | null): GoalClassicSourceRoute | undefined => {
    if (!rawRoute) return undefined
    const rawRouteSourceDocument = asRecord(rawRoute.sourceDocument)
    return {
      jurisdiction: normalizeJurisdictionCode(readString(rawRoute.jurisdiction)) ?? undefined,
      sourceRef: readString(rawRoute.sourceRef),
      sourceText: readString(rawRoute.sourceText),
      parentBulletText: readString(rawRoute.parentBulletText),
      sourceExtractionPath: readString(rawRoute.sourceExtractionPath),
      sourceDocument: rawRouteSourceDocument
        ? {
            title: readString(rawRouteSourceDocument.title),
            url: readString(rawRouteSourceDocument.url),
            path: readString(rawRouteSourceDocument.path),
          }
        : undefined,
      matchType: readString(rawRoute.matchType),
      rationale: readString(rawRoute.rationale),
    }
  }

  return {
    goal: {
      id: goalId,
      title: readString(rawGoal.title),
      description: readString(rawGoal.description),
      pathTitles: readStringArray(rawGoal.pathTitles),
    },
    classicSourceRoute: normalizeClassicRoute(rawClassicRoute),
    alternateClassicSourceRoutes: rawAlternateClassicRoutes
      .map((rawRoute) => normalizeClassicRoute(asRecord(rawRoute)))
      .filter((route): route is GoalClassicSourceRoute => Boolean(route)),
    memSparqlRoute: rawMemRoute
      ? {
          status: readString(rawMemRoute.status),
          jurisdiction: normalizeJurisdictionCode(readString(rawMemRoute.jurisdiction)) ?? undefined,
          endpoint: readString(rawMemRoute.endpoint),
          graphIri: readString(rawMemRoute.graphIri),
          planIri: readString(rawMemRoute.planIri),
          planLabel: readString(rawMemRoute.planLabel),
          yearLabel: readString(rawMemRoute.yearLabel),
          goalIri: readString(rawMemRoute.goalIri),
          goalLabel: decodeCommonHtmlEntities(readString(rawMemRoute.goalLabel)),
          notes: readString(rawMemRoute.notes),
        }
      : undefined,
  }
}

const selectSourceRationaleForFilter = (
  item: GoalSourceRationaleItem | undefined,
  activeFilter?: string,
): GoalSourceRationaleItem | null => {
  if (!item?.goal?.id) return null

  const activeJurisdiction = splitFilterIds(activeFilter)
    .map((filterId) => normalizeJurisdictionCode(filterId))
    .find((jurisdiction) => !!jurisdiction)
  const usableMemRoute = item.memSparqlRoute?.status === 'mem_sparql_consistent'
    ? item.memSparqlRoute
    : undefined
  if (!activeJurisdiction) {
    return {
      ...item,
      memSparqlRoute: usableMemRoute,
    }
  }

  const routes = [
    item.classicSourceRoute,
    ...(item.alternateClassicSourceRoutes ?? []),
  ].filter((route): route is GoalClassicSourceRoute => Boolean(route))
  const selectedClassicRoute = routes.find((route) => normalizeJurisdictionCode(route.jurisdiction) === activeJurisdiction)

  if (!selectedClassicRoute) {
    return null
  }

  const memRouteJurisdiction = normalizeJurisdictionCode(usableMemRoute?.jurisdiction)
  const memRouteMatchesFilter = Boolean(usableMemRoute)
    && (
      memRouteJurisdiction === activeJurisdiction
      || (!memRouteJurisdiction && normalizeJurisdictionCode(selectedClassicRoute.jurisdiction) === activeJurisdiction)
    )

  return {
    ...item,
    classicSourceRoute: selectedClassicRoute,
    memSparqlRoute: memRouteMatchesFilter ? usableMemRoute : undefined,
  }
}

let sourceRationaleIndexPromise: Promise<Map<string, GoalSourceRationaleItem>> | null = null

const loadSourceRationalePayload = async (): Promise<Record<string, unknown> | null> => {
  for (const sourceUrl of [SOURCE_RATIONALE_ASSET_URL, SOURCE_RATIONALE_PUBLIC_PATH]) {
    try {
      const publicResponse = await fetch(sourceUrl)
      if (publicResponse.ok) return asRecord(await publicResponse.json())
    } catch {
      // Try the next source; source rationales are optional UI metadata.
    }
  }

  const params = new URLSearchParams({ path: SOURCE_RATIONALE_STATUS_PATH })
  const localResponse = await fetch(`/__quality-dashboard/file?${params.toString()}`)
  if (!localResponse.ok) return null
  return asRecord(await localResponse.json())
}

const loadSourceRationaleIndex = (): Promise<Map<string, GoalSourceRationaleItem>> => {
  if (!sourceRationaleIndexPromise) {
    sourceRationaleIndexPromise = loadSourceRationalePayload()
      .then((payload) => {
        const rawItems = Array.isArray(payload?.items) ? payload.items : []
        const index = new Map<string, GoalSourceRationaleItem>()
        rawItems.forEach((rawItem) => {
          const item = normalizeSourceRationaleItem(rawItem)
          if (item?.goal?.id) index.set(item.goal.id, item)
        })
        return index
      })
      .catch(() => new Map())
  }

  return sourceRationaleIndexPromise
}

const buildMemSparqlQuery = (route?: GoalMemSparqlRoute): string => {
  if (!route?.graphIri || !route.planIri || !route.goalIri) return ''

  return [
    'PREFIX lp: <https://w3id.org/lehrplan/ontology/>',
    'PREFIX bfo: <http://purl.obolibrary.org/obo/>',
    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
    '',
    'SELECT DISTINCT ?planLabel ?yearLabel ?goalLabel',
    `FROM <${route.graphIri}>`,
    'WHERE {',
    `  VALUES ?plan { <${route.planIri}> }`,
    `  VALUES ?goal { <${route.goalIri}> }`,
    '',
    '  ?plan rdfs:label ?planLabel ;',
    '    lp:LP_0000026 ?year ;',
    '    bfo:BFO_0000051+ ?goal .',
    '',
    '  ?year rdfs:label ?yearLabel .',
    '  ?goal rdfs:label ?goalLabel .',
    '',
    '  FILTER(langMatches(lang(?yearLabel), "de"))',
    '}',
  ].join('\n')
}

const sourceMatchLabel = (matchType?: string): string => {
  if (matchType === 'exact') return 'genauer Treffer'
  if (matchType === 'partial') return 'fachliche Teilzuordnung'
  return matchType ?? 'fachlich geprüft'
}

const extractLicenseFromTags = (tags?: string[]): string | undefined => {
  if (!tags) return undefined
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.startsWith('license:')) {
      const value = tag.slice('license:'.length).trim()
      if (value) return value
    }
  }
  return undefined
}

const normalize = (value?: string): string => (value ?? '').trim().toLowerCase()

const mapRawLink = (entry: Record<string, unknown>): GoalSourceLink | null => {
  const url = readString(entry.url)
  if (!url) return null
  const rawSections = Array.isArray(entry.sections) ? entry.sections : []
  const sections = rawSections
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
  return {
    type: readString(entry.type),
    title: readString(entry.title),
    url,
    resourceType: readString(entry.resourceType),
    provider: readString(entry.provider),
    sections: sections.length > 0 ? sections : undefined,
    description: readString(entry.description),
    lang: readString(entry.lang),
    license: readString(entry.license),
    skillpilotId: readString(entry.skillpilotId),
    role: readString(entry.role),
    altText: readString(entry.altText),
    reviewStatus: readString(entry.reviewStatus),
  }
}

const stripLegacyAttributionLines = (description: string | undefined, hasProvenance: boolean): string | undefined => {
  if (!description || !hasProvenance) return description
  const cleaned = description
    .split('\n')
    .filter((line) => !LEGACY_ATTRIBUTION_LINE_PATTERNS.some((pattern) => pattern.test(line)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return cleaned
}

const isLearningMaterialLink = (link: GoalSourceLink): boolean => {
  const type = normalize(link.type)
  const resourceType = normalize(link.resourceType)
  return (
    type === 'concept' ||
    type === 'learning-material' ||
    type === 'learning_material' ||
    type === 'learningmaterial' ||
    type === 'material' ||
    type === 'oer' ||
    type === 'tool' ||
    resourceType === 'oer' ||
    resourceType === 'tool' ||
    resourceType === 'calculator' ||
    resourceType === 'graphing-calculator'
  )
}

const isGoalVisualizationLink = (link: GoalSourceLink): boolean => {
  const type = normalize(link.type)
  const resourceType = normalize(link.resourceType)
  return type === 'goal-visualization' || resourceType === 'goal-visualization'
}

const extractSourceMetadata = (
  goal: Goal,
): { provenance: GoalProvenance; helpfulLinks: GoalSourceLink[]; visualizationLinks: GoalSourceLink[] } => {
  const extended = asRecord(goal.extendedData)
  const provenanceRaw = asRecord(extended?.provenance)
  const canonicalLinksRaw = Array.isArray(goal.resourceLinks) ? goal.resourceLinks : []

  const rawLinksMapped: Array<GoalSourceLink | null> = canonicalLinksRaw
    .map((entry) => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map(mapRawLink)

  const rawLinks: GoalSourceLink[] = [...rawLinksMapped]
    .filter((entry): entry is GoalSourceLink => entry !== null)

  const licenseLink = rawLinks.find((link) => link.type?.toLowerCase() === 'license')

  const provenance: GoalProvenance = {
    sourceTitle: readString(provenanceRaw?.sourceTitle),
    sourceUrl: readString(provenanceRaw?.sourceUrl),
    sourceLicense: readString(provenanceRaw?.license) ?? extractLicenseFromTags(goal.tags) ?? licenseLink?.license,
    sourceLicenseUrl: readString(provenanceRaw?.licenseUrl) ?? licenseLink?.url,
  }

  const helpfulLinks = rawLinks
    .filter((link) => link.type?.toLowerCase() !== 'license')
    .filter((link) => !isGoalVisualizationLink(link))
    .filter((link, index, all) => all.findIndex((other) => other.url === link.url) === index)

  const visualizationLinks = rawLinks
    .filter(isGoalVisualizationLink)
    .filter((link, index, all) => all.findIndex((other) => other.url === link.url) === index)

  return { provenance, helpfulLinks, visualizationLinks }
}

const SourceRationaleModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  item: GoalSourceRationaleItem | null
  copy: ReturnType<typeof getGoalCardCopy>
}> = ({ isOpen, onClose, item, copy }) => {
  if (!isOpen || !item) return null

  const goal = item.goal
  const classicRoute = item.classicSourceRoute
  const memRoute = item.memSparqlRoute
  const pathLabel = goal?.pathTitles?.length ? goal.pathTitles.join(' > ') : goal?.title
  const sparqlQuery = buildMemSparqlQuery(memRoute)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.sourceRationaleTitle}
      onClick={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-color bg-sidebar-bg shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-color px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{copy.sourceRationaleTitle}</h2>
            {goal?.title && (
              <p className="mt-1 text-sm text-text-secondary">
                <InlineMathText text={goal.title} />
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-slate-200 hover:text-text-primary dark:hover:bg-slate-800"
            title={copy.sourceRationaleClose}
            aria-label={copy.sourceRationaleClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4 text-sm text-text-secondary">
          {pathLabel && (
            <section>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                {copy.sourceRationalePathLabel}
              </div>
              <p className="mt-1 text-text-primary">{pathLabel}</p>
              {goal?.description && (
                <p className="mt-2 leading-relaxed">{goal.description}</p>
              )}
            </section>
          )}

          {classicRoute && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">{copy.sourceRationaleSourceHeading}</h3>
              <ol className="ml-5 list-decimal space-y-2">
                {classicRoute.sourceDocument?.url && (
                  <li>
                    {copy.sourceRationaleOpenSource}:{' '}
                    <a
                      href={classicRoute.sourceDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words underline decoration-dotted hover:decoration-solid"
                    >
                      {classicRoute.sourceDocument.title ?? classicRoute.sourceDocument.url}
                    </a>
                  </li>
                )}
                {classicRoute.sourceRef && (
                  <li>
                    {copy.sourceRationaleNavigateTo}: <span className="text-text-primary">{classicRoute.sourceRef}</span>
                  </li>
                )}
                {classicRoute.sourceText && (
                  <li>
                    {copy.sourceRationaleCompareEvidence}: <span className="text-text-primary">{classicRoute.sourceText}</span>
                  </li>
                )}
                {classicRoute.sourceExtractionPath && (
                  <li>
                    {copy.sourceRationaleTechnicalExtraction}:{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-text-primary dark:bg-slate-800">
                      {classicRoute.sourceExtractionPath}
                    </code>
                  </li>
                )}
              </ol>
            </section>
          )}

          {classicRoute && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">{copy.sourceRationaleDerivationHeading}</h3>
              {classicRoute.sourceText && (
                <p>
                  <span className="font-medium text-text-primary">{copy.sourceRationaleSourceCore}:</span>{' '}
                  {classicRoute.sourceText}
                </p>
              )}
              {classicRoute.parentBulletText && classicRoute.parentBulletText !== classicRoute.sourceText && (
                <p>
                  <span className="font-medium text-text-primary">{copy.sourceRationaleParentContext}:</span>{' '}
                  {classicRoute.parentBulletText}
                </p>
              )}
              {goal?.description && (
                <p>
                  <span className="font-medium text-text-primary">{copy.sourceRationaleSkillpilotGoal}:</span>{' '}
                  {goal.description}
                </p>
              )}
              {(classicRoute.matchType || classicRoute.rationale) && (
                <p>
                  <span className="font-medium text-text-primary">{copy.sourceRationaleMatch}:</span>{' '}
                  {sourceMatchLabel(classicRoute.matchType)}
                  {classicRoute.rationale ? `; ${classicRoute.rationale}` : ''}
                </p>
              )}
            </section>
          )}

          {memRoute && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary">{copy.sourceRationaleMemHeading}</h3>
              {memRoute.endpoint && (
                <p>
                  {copy.sourceRationaleMemOpenEndpoint}:{' '}
                  <a
                    href={memRoute.endpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words underline decoration-dotted hover:decoration-solid"
                  >
                    {memRoute.endpoint}
                  </a>
                </p>
              )}
              {sparqlQuery && (
                <div>
                  <div className="mb-1 font-medium text-text-primary">{copy.sourceRationaleMemRunQuery}</div>
                  <pre className="max-h-72 overflow-auto rounded-xl border border-border-color bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-100">
                    <code>{sparqlQuery}</code>
                  </pre>
                </div>
              )}
              <div className="rounded-xl border border-border-color bg-slate-50/70 p-3 dark:bg-slate-900/30">
                <div className="font-medium text-text-primary">{copy.sourceRationaleMemExpected}</div>
                <dl className="mt-2 space-y-1">
                  {memRoute.planLabel && (
                    <div>
                      <dt className="inline font-medium text-text-primary">planLabel: </dt>
                      <dd className="inline">{memRoute.planLabel}</dd>
                    </div>
                  )}
                  {memRoute.yearLabel && (
                    <div>
                      <dt className="inline font-medium text-text-primary">yearLabel: </dt>
                      <dd className="inline">{memRoute.yearLabel}</dd>
                    </div>
                  )}
                  {memRoute.goalLabel && (
                    <div>
                      <dt className="inline font-medium text-text-primary">goalLabel: </dt>
                      <dd className="inline">{memRoute.goalLabel}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <p>
                <span className="font-medium text-text-primary">{copy.sourceRationaleMemEvaluation}:</span>{' '}
                {memRoute.notes ?? 'Wenn diese Zeile erscheint und der Erwartungstext fachlich passt, ist der MEM/FWU-Weg als konsistenter Alternativweg nutzbar.'}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  masteryValue,
  onMasteryChange,
  showLearnerTools,
  useRawGoalTitles = false,
  hideTechnicalStructureUi = false,
  readOnly = false,
  showDetails = false,
  isPlanned = false,
  isActive = false,
  activeFilter,

  onSetActive,
  onRevealActive,
  nextCandidates = [],
  isFrontier = false
}) => {
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const copy = getGoalCardCopy(localizedLanguage)
  const handleChange = onMasteryChange ?? (() => { })
  const isProjectedStructureNode = (goal.tags ?? []).includes(SYNTHETIC_PROGRAM_UNIT_TAG)
  const isLearnerAudience = showLearnerTools
  const projectedProgramUnitKind = (goal.tags ?? [])
    .find((tag) => tag.startsWith(PROGRAM_UNIT_KIND_TAG_PREFIX) && tag !== PROGRAM_UNIT_ANCHOR_TAG)
    ?.slice(PROGRAM_UNIT_KIND_TAG_PREFIX.length)
  const projectedStructureKindLabel = (() => {
    if (!projectedProgramUnitKind) return undefined
    return copy.projectedProgramUnitKinds[projectedProgramUnitKind] ?? projectedProgramUnitKind
  })()

  // Detect if Atomic Goal (no children)
  const isAtomic = !goal.contains || goal.contains.length === 0
  const mastered = isMastered(masteryValue)
  const complete = isCompleteMastery(masteryValue)
  const hasProgress = masteryValue > 0
  const canSetActive = Boolean(!readOnly && onSetActive && isAtomic && !mastered && (isFrontier || isActive))
  const activeActionLabel = isActive
    ? copy.activeActionReveal
    : copy.activeActionSelect
  const { provenance, helpfulLinks, visualizationLinks } = extractSourceMetadata(goal)
  const [sourceRationale, setSourceRationale] = React.useState<GoalSourceRationaleItem | null>(null)
  const [isSourceRationaleOpen, setIsSourceRationaleOpen] = React.useState(false)
  const displayTitle = useRawGoalTitles ? goal.title : getAudienceGoalTitle(goal)
  const learningMaterialLinks = helpfulLinks.filter(isLearningMaterialLink).slice(0, 3)
  const primaryVisualization = visualizationLinks.find((link) => normalize(link.role) === 'primary') ?? visualizationLinks[0]
  const sourceLinkLabel = provenance.sourceTitle || copy.coursePageFallback
  const displayDescription = stripLegacyAttributionLines(goal.description, Boolean(provenance.sourceUrl))
  const examDataForDisplay = isRenderableExamData(goal.examData) ? goal.examData : undefined
  const visibleTags = React.useMemo(
    () => (goal.tags ?? []).filter((tag) => !tag.startsWith('synthetic:') && !tag.startsWith(PROGRAM_UNIT_KIND_TAG_PREFIX)),
    [goal.tags],
  )
  const applicabilityGroups = React.useMemo<ApplicabilityGroup[]>(() => {
    const entries = Object.entries(goal.applicability ?? {})
      .flatMap(([dimension, values]) =>
        (Array.isArray(values) ? values : [])
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          .map((value) => ({ dimension, value })),
      )
      .sort((a, b) => {
      const byDimension = a.dimension.localeCompare(b.dimension)
      if (byDimension !== 0) return byDimension
      return a.value.localeCompare(b.value)
    })

    const grouped = new Map<string, string[]>()
    entries.forEach(({ dimension, value }) => {
      const existing = grouped.get(dimension) ?? []
      existing.push(value)
      grouped.set(dimension, existing)
    })

    return Array.from(grouped.entries()).map(([dimension, values]) => ({
      dimension,
      values,
    }))
  }, [goal.applicability])

  React.useEffect(() => {
    let cancelled = false
    setSourceRationale(null)
    setIsSourceRationaleOpen(false)

    void loadSourceRationaleIndex().then((index) => {
      if (!cancelled) {
        setSourceRationale(selectSourceRationaleForFilter(index.get(goal.id), activeFilter))
      }
    })

    return () => {
      cancelled = true
    }
  }, [activeFilter, goal.id])

  // Determine Status Icon
  let StatusIcon = Target
  let iconColor = "text-slate-400 dark:text-slate-500"
  let strokeWidth = 2

  if (mastered) {
    StatusIcon = Check
    iconColor = complete ? "text-emerald-500" : "text-amber-500"
    strokeWidth = 3
  } else if (isActive) {
    StatusIcon = Send
    iconColor = "text-amber-500"
  } else if (isPlanned) {
    iconColor = "text-amber-400"
  } else if (hasProgress) {
    iconColor = "text-amber-500"
  }

  return (
    <div className="bg-sidebar-bg border border-border-color rounded-3xl p-5 shadow-none dark:shadow-card-2xl transition-colors relative group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="pr-8">
          <h2 className="text-2xl font-semibold text-text-primary leading-tight">
            <InlineMathText text={displayTitle} />
          </h2>
          {!isLearnerAudience && isProjectedStructureNode && !hideTechnicalStructureUi && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {copy.projectedStructureBadge}
              </span>
              {projectedStructureKindLabel && (
                <span className="inline-flex items-center rounded-full border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                  {projectedStructureKindLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {sourceRationale && (
            <button
              type="button"
              onClick={() => setIsSourceRationaleOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-sky-300"
              title={copy.sourceRationaleTooltip}
              aria-label={copy.sourceRationaleTooltip}
            >
              <FileSearch size={18} strokeWidth={2} />
            </button>
          )}
          {isAtomic && (
            canSetActive ? (
              <button
                type="button"
                onClick={() => (isActive ? onRevealActive?.() : onSetActive?.(goal.id))}
                className={`shrink-0 transition-colors cursor-pointer ${isActive ? 'text-amber-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400'}`}
                title={activeActionLabel}
                aria-label={activeActionLabel}
              >
                {isActive ? <Send size={28} strokeWidth={2} /> : <Target size={28} strokeWidth={2} />}
              </button>
            ) : (
              <div className={`shrink-0 ${iconColor}`}>
                <StatusIcon size={28} strokeWidth={strokeWidth} />
              </div>
            )
          )}
        </div>
      </div>

      {!isLearnerAudience && isProjectedStructureNode && !hideTechnicalStructureUi && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-text-secondary dark:border-slate-700 dark:bg-slate-800/40">
          <div className="font-semibold text-text-primary">{copy.projectedStructureTitle}</div>
          <p className="mt-1">{copy.projectedStructureDescription}</p>
          <p className="mt-2 text-xs">{copy.projectedStructureHint}</p>
        </div>
      )}


      {/* SSE auto-refresh now active - manual refresh button removed */}

      {primaryVisualization && !examDataForDisplay && !isProjectedStructureNode && (
        <figure className="mt-4 mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
          <img
            src={primaryVisualization.url}
            alt={primaryVisualization.altText ?? primaryVisualization.description ?? primaryVisualization.title ?? displayTitle}
            loading="lazy"
            className="block h-auto max-h-[28rem] w-full object-contain"
          />
        </figure>
      )}

      <div className="mt-2 text-sm text-text-primary leading-relaxed prose dark:prose-invert max-w-none">
        {examDataForDisplay ? (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Target size={16} />
                {copy.examTaskLabel}
              </h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
            {examDataForDisplay.taskContent}
          </ReactMarkdown>
        </div>

        {/* If Mastered, show Solution? Maybe later. For now, just Task. */}
        {mastered && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Check size={16} />
	              {copy.solutionLabel}
                </h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {examDataForDisplay.solutionContent}
                </ReactMarkdown>
              </div>
            )}

          </div>
        ) : (
          !isProjectedStructureNode && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {displayDescription ?? ''}
            </ReactMarkdown>
          )
        )}
      </div>

      {(provenance.sourceUrl || learningMaterialLinks.length > 0) && (
        <div className="mt-3 text-xs text-text-secondary">
          {provenance.sourceUrl && (
            <div>
              <span className="font-medium text-text-primary">{copy.curriculumSourceLabel}</span>
              <a
                href={provenance.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted hover:decoration-solid"
              >
                {sourceLinkLabel}
              </a>
            </div>
          )}
          {learningMaterialLinks.length > 0 && (
            <div className={provenance.sourceUrl ? 'mt-1' : ''}>
              <span className="font-medium text-text-primary">{copy.learningMaterialLabel}</span>
              {learningMaterialLinks.map((link, index) => (
                <React.Fragment key={`${link.type ?? 'resource'}:${link.url}`}>
                  {index > 0 && <span className="mx-1">·</span>}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:decoration-solid"
                  >
                    {link.title ?? link.resourceType ?? copy.resourceFallback}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
          {provenance.sourceUrl && provenance.sourceLicense && (
            <span className={provenance.sourceUrl || learningMaterialLinks.length > 0 ? 'ml-3' : ''}>
              <span className="font-medium text-text-primary">{copy.licenseLabel}</span>
              {provenance.sourceLicenseUrl ? (
                <a
                  href={provenance.sourceLicenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted hover:decoration-solid"
                >
                  {provenance.sourceLicense}
                </a>
              ) : (
                <span>{provenance.sourceLicense}</span>
              )}
            </span>
          )}
        </div>
      )}

      {/* Detail Information Section - only shown in Explorer view */}
      {showDetails && (
        <div className="mt-4 space-y-3 text-[11px] text-text-secondary border-t border-border-color pt-4">
          {/* Applicability */}
          {applicabilityGroups.length > 0 && (
            <div>
              <span className="font-semibold text-text-primary">{copy.appliesToLabel}</span>
              {applicabilityGroups.length === 1 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {applicabilityGroups[0].values.map((value) => (
                    <span
                      key={`${applicabilityGroups[0].dimension}:${value}`}
                      className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    >
                      {formatFilterValueLabel(value, localizedLanguage)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-1 space-y-1.5">
                  {applicabilityGroups.map(({ dimension, values }) => (
                    <div key={dimension} className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-text-primary">
                        {formatApplicabilityDimensionLabel(dimension, localizedLanguage)}:
                      </span>
                      {values.map((value) => (
                        <span
                          key={`${dimension}:${value}`}
                          className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        >
                          {formatFilterValueLabel(value, localizedLanguage)}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="font-semibold text-text-primary">{copy.tagsLabel}</span>
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Provenance */}
          {provenance.sourceUrl && (
            <div>
              <span className="font-semibold text-text-primary">{copy.curriculumSourceLabel}</span>
              {provenance.sourceUrl ? (
                <a
                  href={provenance.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted hover:decoration-solid"
                >
                  {sourceLinkLabel}
                </a>
              ) : (
                <span>—</span>
              )}
              {provenance.sourceLicense && (
                <div className="mt-1">
                  <span className="font-semibold text-text-primary">{copy.licenseLabel}</span>
                  {provenance.sourceLicenseUrl ? (
                    <a
                      href={provenance.sourceLicenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline decoration-dotted hover:decoration-solid break-all"
                    >
                      {provenance.sourceLicense}
                    </a>
                  ) : (
                    <span className="ml-1">{provenance.sourceLicense}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Helpful resource links */}
          {helpfulLinks.length > 0 && (
            <div>
              <span className="font-semibold text-text-primary">{copy.helpfulResourcesLabel}</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {helpfulLinks.slice(0, 6).map((link) => (
                  <a
                    key={`${link.type ?? 'resource'}:${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:underline"
                  >
                    {link.title ?? link.resourceType ?? link.type ?? copy.resourceFallback}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Leitideen */}
          {goal.leitideen && goal.leitideen.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="font-semibold text-text-primary">{copy.leitideenLabel}</span>
              {goal.leitideen.map((li) => (
                <span
                  key={li}
                  className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {li}
                </span>
              ))}
            </div>
          )}

          {/* Kompetenzen */}
          {goal.kompetenzen && goal.kompetenzen.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="font-semibold text-text-primary">{copy.kompetenzenLabel}</span>
              {goal.kompetenzen.map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                >
                  {k}
                </span>
              ))}
            </div>
          )}

          {/* Examples */}
          {goal.examples && goal.examples.length > 0 && (
            <div>
              <span className="font-semibold text-text-primary">{copy.examplesLabel}</span>
              <ul className="mt-1 ml-4 list-disc space-y-0.5">
                {goal.examples.map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showLearnerTools && (
        <div className="mt-4 space-y-4">
          {readOnly && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-text-secondary dark:border-amber-900/40 dark:bg-amber-900/10">
              {copy.legacyReadOnlyNotice}
            </div>
          )}

          {!isLearnerAudience && isProjectedStructureNode && !hideTechnicalStructureUi && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-sm text-text-secondary dark:border-slate-700 dark:bg-slate-800/30">
              {copy.projectedStructureHint}
            </div>
          )}

          {/* Frontier Recommendations (When Mastered) */}
          {!readOnly && mastered && nextCandidates.length > 0 && onSetActive && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide mb-3">
                {copy.nextStepsLabel}
              </h3>
              <div className="flex flex-col gap-2">
                {nextCandidates.slice(0, 3).map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => onSetActive(candidate.id)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-left group/item"
                  >
                    <InlineMathText
                      text={useRawGoalTitles ? candidate.title : getAudienceGoalTitle(candidate)}
                      className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400"
                    />
                    <Send size={14} className="text-amber-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Action Buttons Row (Only if NOT Mastered) */}
          {!readOnly && isAtomic && !isActive && onSetActive && !mastered && isFrontier && (
            <div className="flex justify-end">
              <button
                onClick={() => onSetActive(goal.id)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 rounded-lg text-sm font-medium transition-colors border border-amber-500/20"
              >
                <Send size={16} />
                <span>{copy.selectAsActiveGoalLabel}</span>
              </button>
            </div>
          )}

          {!isAtomic && (
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-medium">
                {isProjectedStructureNode
                  ? (
                    isLearnerAudience || hideTechnicalStructureUi
                      ? copy.progressInSectionLabel
                      : copy.progressInStructureSectionLabel
                  )
                  : copy.progressForGoalLabel}
              </span>
              <span className="tabular-nums">{Math.round(masteryValue * 100)}%</span>
            </div>
          )}

          {!isAtomic && <MasteryBar value={masteryValue} />}

          {!readOnly && onMasteryChange && (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={Math.round(masteryValue * 100)}
                onChange={(event) => handleChange(goal.id, Number(event.target.value) / 100)}
                className="w-full accent-sky-400"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleChange(goal.id, 0)}
                  className="rounded-full border border-border-color px-2 py-1 text-[11px] hover:border-text-secondary text-text-secondary"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => handleChange(goal.id, 0.5)}
                  className="rounded-full border border-border-color px-2 py-1 text-[11px] hover:border-text-secondary text-text-secondary"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleChange(goal.id, 1)}
                  className="rounded-full border border-border-color px-2 py-1 text-[11px] hover:border-text-secondary text-text-secondary"
                >
                  100%
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <SourceRationaleModal
        isOpen={isSourceRationaleOpen}
        onClose={() => setIsSourceRationaleOpen(false)}
        item={sourceRationale}
        copy={copy}
      />
    </div>
  )
}
