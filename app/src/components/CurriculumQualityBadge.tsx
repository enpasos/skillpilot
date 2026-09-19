import React from 'react'
import { BadgeCheck, CircleDashed, FlaskConical } from 'lucide-react'
import {
  getCurriculumQualityCopy, isMaturityLevel, maturityClass, maturityCopy, maturityOrder,
  qualityStatusBadgeClass, type CurriculumQualityStatus,
} from '../utils/curriculumQualityPresentation'

export const MaturityBadge = ({ level, language = 'de', scope = 'curriculum' }: {
  level: unknown; language?: 'de' | 'en'; scope?: 'curriculum' | 'route'
}) => {
  const copy = maturityCopy[language]
  if (!isMaturityLevel(level)) return <span className="text-xs text-text-secondary">{copy.unknown}</span>
  const description = scope === 'route' ? `${copy.routeLabel}: ${level}`
    : `${copy.label} ${level}: ${copy.legend[level]}`
  return <span data-maturity={level}
    className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${maturityClass[level]}`}
    aria-label={description} title={description}>{level}</span>
}

export const QualityStatusBadge = ({ status, language = 'de' }: {
  status: CurriculumQualityStatus | null; language?: 'de' | 'en'
}) => {
  const copy = getCurriculumQualityCopy(language)
  if (status == null) return <span className="text-xs text-text-secondary">{copy.unknownLabel}</span>
  const Icon = status === 'human_trial_completed' ? BadgeCheck
    : status === 'experimental' ? FlaskConical : CircleDashed
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${qualityStatusBadgeClass[status]}`}>
    <Icon size={14} aria-hidden="true" /><span>{copy.statusLabels[status]}</span>
  </span>
}

export const QualityLegend = ({ language = 'de' }: { language?: 'de' | 'en' }) => (
  <div>
    <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{maturityCopy[language].legendTitle}</div>
    <dl className="mt-2 grid gap-x-4 gap-y-2 text-xs text-text-secondary sm:grid-cols-2">
      {maturityOrder.map((level) => <div key={level} className="flex items-start gap-2">
        <dt><MaturityBadge level={level} language={language} /></dt><dd>{maturityCopy[language].legend[level]}</dd>
      </div>)}
    </dl>
    <p className="mt-3 text-xs text-text-secondary">{getCurriculumQualityCopy(language).trialExplanation}</p>
  </div>
)
