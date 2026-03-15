import React from 'react'
import { Check, Target, Send } from 'lucide-react'
import type { UiGoal as Goal } from '../goalTypes'

import { MasteryBar } from './MasteryBar'
import { isMastered } from '../goalUiUtils'
import { InlineMathText } from './InlineMathText'
import { useLanguage } from '../contexts/LanguageContext'

interface GoalCardProps {
  goal: Goal
  masteryValue: number
  onMasteryChange?: (id: string, value: number) => void
  showLearnerTools: boolean
  readOnly?: boolean
  showDetails?: boolean
  isPlanned?: boolean
  isActive?: boolean

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
}

type GoalProvenance = {
  sourceTitle?: string
  sourceUrl?: string
  sourceLicense?: string
  sourceLicenseUrl?: string
}

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
    resourceType === 'oer'
  )
}

const extractSourceMetadata = (goal: Goal): { provenance: GoalProvenance; helpfulLinks: GoalSourceLink[] } => {
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
    .filter((link, index, all) => all.findIndex((other) => other.url === link.url) === index)

  return { provenance, helpfulLinks }
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  masteryValue,
  onMasteryChange,
  showLearnerTools,
  readOnly = false,
  showDetails = false,
  isPlanned = false,
  isActive = false,

  onSetActive,
  onRevealActive,
  nextCandidates = [],
  isFrontier = false
}) => {
  const { language } = useLanguage()
  const examTaskLabel = language === 'en' ? 'Exam Task' : 'Prüfungsaufgabe'
  const solutionLabel = language === 'en' ? 'Sample Solution' : 'Musterlösung'
  const handleChange = onMasteryChange ?? (() => { })

  // Detect if Atomic Goal (no children)
  const isAtomic = !goal.contains || goal.contains.length === 0
  const mastered = isMastered(masteryValue)
  const canSetActive = Boolean(!readOnly && onSetActive && isAtomic && !mastered && (isFrontier || isActive))
  const activeActionLabel = isActive
    ? 'Zum aktiven Lernziel springen'
    : 'Als aktuelles Lernziel auswählen'
  const { provenance, helpfulLinks } = extractSourceMetadata(goal)
  const learningMaterialLinks = helpfulLinks.filter(isLearningMaterialLink).slice(0, 3)
  const sourceLinkLabel = provenance.sourceTitle || (language === 'en' ? 'Course page' : 'Kursseite')
  const displayDescription = stripLegacyAttributionLines(goal.description, Boolean(provenance.sourceUrl))

  // Determine Status Icon
  let StatusIcon = Target
  let iconColor = "text-red-500"
  let strokeWidth = 2

  if (mastered) {
    StatusIcon = Check
    iconColor = "text-emerald-500"
    strokeWidth = 3
  } else if (isActive) {
    StatusIcon = Send
    iconColor = "text-amber-500"
  } else if (isPlanned) {
    // Planned logic placeholder
  }

  return (
    <div className="bg-sidebar-bg border border-border-color rounded-3xl p-5 shadow-none dark:shadow-card-2xl transition-colors relative group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-2xl font-semibold text-text-primary leading-tight pr-8">
          <InlineMathText text={goal.title} />
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          {isAtomic && (
            canSetActive ? (
              <button
                type="button"
                onClick={() => (isActive ? onRevealActive?.() : onSetActive?.(goal.id))}
                className={`shrink-0 transition-colors cursor-pointer ${isActive ? 'text-amber-500 hover:text-amber-400' : 'text-red-500 hover:text-red-400'}`}
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


      {/* SSE auto-refresh now active - manual refresh button removed */}


      <div className="mt-2 text-sm text-text-primary leading-relaxed prose dark:prose-invert max-w-none">
        {goal.examData ? (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Target size={16} />
                {examTaskLabel}
              </h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
            {goal.examData.taskContent}
          </ReactMarkdown>
        </div>

        {/* If Mastered, show Solution? Maybe later. For now, just Task. */}
        {mastered && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Check size={16} />
              {solutionLabel}
                </h3>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {goal.examData.solutionContent}
                </ReactMarkdown>
              </div>
            )}

          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {displayDescription ?? ''}
          </ReactMarkdown>
        )}
      </div>

      {(provenance.sourceUrl || learningMaterialLinks.length > 0) && (
        <div className="mt-3 text-xs text-text-secondary">
          {provenance.sourceUrl && (
            <div>
              <span className="font-medium text-text-primary">{language === 'en' ? 'Curriculum source: ' : 'Curriculum-Quelle: '}</span>
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
              <span className="font-medium text-text-primary">{language === 'en' ? 'Learning material: ' : 'Lernmaterial: '}</span>
              {learningMaterialLinks.map((link, index) => (
                <React.Fragment key={`${link.type ?? 'resource'}:${link.url}`}>
                  {index > 0 && <span className="mx-1">·</span>}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:decoration-solid"
                  >
                    {link.title ?? link.resourceType ?? (language === 'en' ? 'Resource' : 'Quelle')}
                  </a>
                </React.Fragment>
              ))}
            </div>
          )}
          {provenance.sourceUrl && provenance.sourceLicense && (
            <span className={provenance.sourceUrl || learningMaterialLinks.length > 0 ? 'ml-3' : ''}>
              <span className="font-medium text-text-primary">{language === 'en' ? 'License: ' : 'Lizenz: '}</span>
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
          {/* Tags */}
          {goal.tags && goal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="font-semibold text-text-primary">Tags:</span>
              {goal.tags.map((tag) => (
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
              <span className="font-semibold text-text-primary">{language === 'en' ? 'Curriculum source: ' : 'Curriculum-Quelle: '}</span>
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
                  <span className="font-semibold text-text-primary">{language === 'en' ? 'License: ' : 'Lizenz: '}</span>
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
              <span className="font-semibold text-text-primary">{language === 'en' ? 'Helpful resources:' : 'Hilfreiche Quellen:'}</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {helpfulLinks.slice(0, 6).map((link) => (
                  <a
                    key={`${link.type ?? 'resource'}:${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:underline"
                  >
                    {link.title ?? link.resourceType ?? link.type ?? (language === 'en' ? 'Resource' : 'Quelle')}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Leitideen */}
          {goal.leitideen && goal.leitideen.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="font-semibold text-text-primary">Leitideen:</span>
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
              <span className="font-semibold text-text-primary">Kompetenzen:</span>
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
              <span className="font-semibold text-text-primary">Beispiele:</span>
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
              Diese Legacy-Ansicht ist schreibgeschuetzt. Fuer aktives Lernen und Statusaenderungen bitte auf Gymnasium (DE) umstellen.
            </div>
          )}

          {/* Frontier Recommendations (When Mastered) */}
          {!readOnly && mastered && nextCandidates.length > 0 && onSetActive && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide mb-3">
                Nächste Schritte
              </h3>
              <div className="flex flex-col gap-2">
                {nextCandidates.slice(0, 3).map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => onSetActive(candidate.id)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-left group/item"
                  >
                    <InlineMathText
                      text={candidate.title}
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
                <span>Als aktuelles Ziel auswählen</span>
              </button>
            </div>
          )}

          {!isAtomic && (
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-medium">Kompetenzstand für dieses Lernziel</span>
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
    </div>
  )
}
