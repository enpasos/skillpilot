import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MaturityBadge } from './CurriculumQualityBadge'
import { getCurriculumQualityCopy, isMaturityLevel } from '../utils/curriculumQualityPresentation'

interface PublicCurriculumQuality {
  curriculumId?: string
  qualityMaturity?: unknown
  subjectQuality?: Array<{ landscapeId?: string; maturity?: unknown }>
}

/** The book uses its canonical curriculum's published machine-QA baseline. */
export const GoalBookQualityStatus = ({ landscapeId, language }: {
  landscapeId: string
  language: 'de' | 'en'
}) => {
  const [quality, setQuality] = useState<{ landscapeId: string; maturity: unknown } | null>(null)
  const copy = getCurriculumQualityCopy(language)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/ui/curricula', { credentials: 'omit', cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Quality status unavailable')
        const payload = await response.json() as { curricula?: PublicCurriculumQuality[] }
        let maturity: unknown = null
        for (const curriculum of Array.isArray(payload.curricula) ? payload.curricula : []) {
          if (curriculum?.curriculumId === landscapeId) {
            maturity = curriculum.qualityMaturity
            break
          }
          const subject = Array.isArray(curriculum?.subjectQuality)
            ? curriculum.subjectQuality.find((entry) => entry?.landscapeId === landscapeId)
            : undefined
          if (subject) {
            maturity = subject.maturity
            break
          }
        }
        if (!controller.signal.aborted) setQuality({ landscapeId, maturity })
      })
      .catch(() => {
        if (!controller.signal.aborted) setQuality(null)
      })
    return () => controller.abort()
  }, [landscapeId])

  const maturity = quality?.landscapeId === landscapeId ? quality.maturity : null
  return <div data-testid="goal-book-quality-status" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
    {isMaturityLevel(maturity) ? <>
      <span>{copy.statusLabels.machine_qa}</span>
      <MaturityBadge level={maturity} language={language} />
    </> : <span>{copy.label}: {copy.unknownLabel}</span>}
    <span aria-hidden="true">·</span>
    <Link to="/curricula" aria-label={language === 'de' ? 'Details zur Curriculum-QS' : 'Curriculum QA details'}
      className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
      Details
    </Link>
  </div>
}
