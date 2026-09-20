import React from 'react'
import {
  curriculumQualityStatuses, getCurriculumQualityCopy, qualityFilterActiveClass,
  type CurriculumQualityFilter as Filter,
} from '../utils/curriculumQualityPresentation'

export const CurriculumQualityFilter = ({ value, onChange, language = 'de', disabled = false }: {
  value: Filter; onChange: (value: Filter) => void; language?: 'de' | 'en'; disabled?: boolean
}): React.ReactElement => {
  const copy = getCurriculumQualityCopy(language)
  return <div role="group" aria-label={copy.label} className="flex flex-wrap gap-1.5">
    {(['all', ...curriculumQualityStatuses] as const).map((filter) => <button
      key={filter} type="button" disabled={disabled} aria-pressed={value === filter}
      onClick={() => onChange(filter)}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${value === filter
        ? qualityFilterActiveClass[filter]
        : 'bg-white text-text-secondary hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
    >{copy.filterOptions[filter]}</button>)}
  </div>
}
