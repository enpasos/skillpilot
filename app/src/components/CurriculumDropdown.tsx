import React, { useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import {
    CANONICAL_GYMNASIUM_ROOT_ID,
    getCurriculumDisplayTitle,
    isCompatibilityOnlyCurriculum,
    isLegacyHiddenByDefaultCurriculum,
} from '../utils/curriculumDisplay'
import {
    getCurriculumDropdownCopy,
    type CurriculumDropdownCategory as Category,
} from '../utils/curriculumDropdownCopy'
import {
    CURRICULUM_QUALITY_FILTER_AVAILABLE,
    filterCurriculaByQuality,
    type CurriculumQualityFilter,
    type CurriculumQualityStatus,
} from '../utils/curriculumQualityTrafficLight'

export interface LandscapeSummary {
    curriculumId: string
    filename: string
    country: string
    region: string
    type: string
    level: string
    subject: string
    locale: string
    description?: string
    filters?: { id: string; label: string }[]
    title?: string
    schoolType?: string
    compatibilityOnly?: boolean
    legacyHiddenByDefault?: boolean
    qualityMaturity?: string | null
}

interface CurriculumDropdownProps {
    currentLandscapeId?: string
    onSelect: (landscapeId: string) => void
    disabled?: boolean
    className?: string
    filterOptions?: (options: LandscapeSummary[]) => LandscapeSummary[]
    landscapes?: LandscapeSummary[]
    showCompatibilityViews?: boolean
    showQualityFilter?: boolean
}

const qualityStatusDotClass: Record<CurriculumQualityStatus, string> = {
    green: 'bg-emerald-700',
    orange: 'bg-orange-700',
    red: 'bg-red-700',
}

const qualityFilterActiveClass: Record<CurriculumQualityFilter, string> = {
    green: 'bg-emerald-700 text-white shadow-sm',
    orange: 'bg-orange-700 text-white shadow-sm',
    red: 'bg-red-700 text-white shadow-sm',
    all: 'bg-sky-700 text-white shadow-sm',
}

export const CurriculumDropdown: React.FC<CurriculumDropdownProps> = ({
    currentLandscapeId,
    onSelect,
    disabled = false,
    className = '',
    filterOptions,
    landscapes: providedLandscapes,
    showCompatibilityViews = true,
    showQualityFilter = false,
}) => {
    const t = useTranslation()
    const { language } = useLanguage()
    const dropdownCopy = getCurriculumDropdownCopy(language)
    const qualityFilterEnabled = showQualityFilter && CURRICULUM_QUALITY_FILTER_AVAILABLE
    const [landscapes, setLandscapes] = useState<LandscapeSummary[]>(
        () => providedLandscapes?.length ? providedLandscapes : [],
    )
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState<Category>('SCHOOL')
    const [qualityFilter, setQualityFilter] = useState<CurriculumQualityFilter>('green')

    useEffect(() => {
        if (providedLandscapes && providedLandscapes.length > 0) {
            setLandscapes(providedLandscapes)
            return
        }

        const fetchLandscapes = async () => {
            setLoading(true)
            try {
                const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
                const url = apiBase ? `${apiBase}/api/ui/landscapes` : '/api/ui/landscapes'
                const includeCompatibility = showCompatibilityViews
                    || isCompatibilityOnlyCurriculum(currentLandscapeId, null)
                    || isLegacyHiddenByDefaultCurriculum(currentLandscapeId, null)

                // Pass current language to backend
                const query = `?lang=${language}&includeCompatibility=${includeCompatibility ? 'true' : 'false'}`
                const res = await fetch(url + query)
                const data = await res.json()
                const summaries = (data.summaries || []) as LandscapeSummary[]

                // Deduplicate by curriculumId
                const uniqueSummaries = Array.from(
                    new Map(summaries.map(s => [s.curriculumId, s])).values()
                )

                setLandscapes(uniqueSummaries)
            } catch (err) {
                console.error('Failed to load landscapes', err)
            } finally {
                setLoading(false)
            }
        }
        fetchLandscapes()
    }, [providedLandscapes, language, showCompatibilityViews, currentLandscapeId]) // Re-fetch when language changes

    const getCategory = (l: LandscapeSummary): Category => {
        const sType = (l.schoolType || l.type || '').toUpperCase()
        const title = (l.title || '').toUpperCase()

        // Explicit School Types
        const schoolTypes = ['GRUNDSCHULE', 'MITTELSCHULE', 'REALSCHULE', 'GYMNASIUM', 'FOS', 'BOS', 'WIRTSCHAFTSSCHULE', 'BERUFSOBERSCHULE', 'FACHOBERSCHULE', 'GYM', 'GESAMT', 'PROGRAMM']
        if (schoolTypes.some(t => sType.includes(t)) || title.includes('SCHULE') || title.includes('GYMNASIUM') || title.includes('GYMNASIAL')) return 'SCHOOL'

        // Explicit Uni keywords
        if (sType === 'U') return 'UNI'
        if (title.includes('OPENCOURSEWARE') || title.includes('OCW')) return 'UNI'
        if (title.includes('BACHELOR') || title.includes('MASTER')) return 'UNI'
        if (['TUM', 'HEIDELBERG', 'MANNHEIM', 'DARMSTADT', 'UNI', 'HOCHSCHULE'].some(t => sType.includes(t) || title.includes(t))) return 'UNI'

        // CEFR / Languages
        if (sType === 'CEFR' || title.includes('CEFR') || title.includes('LANGUAGE') || title.includes('SPRACHE')) return 'OTHER'

        // Fallback
        return 'OTHER'
    }

    const getDisplayTitle = (l: LandscapeSummary) => getCurriculumDisplayTitle({
        curriculumId: l.curriculumId,
        title: l.title,
        description: l.description,
        subject: l.subject,
        language,
        compatibilityOnly: l.compatibilityOnly,
        legacyHiddenByDefault: l.legacyHiddenByDefault,
    })

    const getSortPriority = (l: LandscapeSummary) => {
        if (l.curriculumId === CANONICAL_GYMNASIUM_ROOT_ID) return 0
        if (isCompatibilityOnlyCurriculum(l.curriculumId, l.compatibilityOnly)) return 2
        if (isLegacyHiddenByDefaultCurriculum(l.curriculumId, l.legacyHiddenByDefault)) return 2
        return 1
    }

    useEffect(() => {
        if (!currentLandscapeId || landscapes.length === 0) return
        const selected = landscapes.find((l) => l.curriculumId === currentLandscapeId)
        if (!selected) return
        const targetCategory = getCategory(selected)
        setCategory((prev) => (prev === targetCategory ? prev : targetCategory))
    }, [currentLandscapeId, landscapes])

    if (loading && (!landscapes || landscapes.length === 0)) {
        return <div className="text-text-secondary text-sm">{t.startPage.login.checking}</div>
    }

    let filteredLandscapes = landscapes;
    if (filterOptions) {
        filteredLandscapes = filterOptions(landscapes);
    }

    // Filter by Category
    const categoryFilteredLandscapes = filteredLandscapes.filter(l => getCategory(l) === category)
    const qualityFilteredLandscapes = qualityFilterEnabled
        ? filterCurriculaByQuality(
            categoryFilteredLandscapes,
            qualityFilter,
            currentLandscapeId,
        )
        : categoryFilteredLandscapes

    // Sort alphabetically by the displayed text
    const sortedLandscapes = [...qualityFilteredLandscapes].sort((a, b) => {
        const priorityDiff = getSortPriority(a) - getSortPriority(b)
        if (priorityDiff !== 0) return priorityDiff
        const textA = getDisplayTitle(a);
        const textB = getDisplayTitle(b);
        return textA.localeCompare(textB, language);
    });

    const primaryLandscapes = sortedLandscapes.filter(
        (landscape) =>
            !isCompatibilityOnlyCurriculum(landscape.curriculumId, landscape.compatibilityOnly)
            && !isLegacyHiddenByDefaultCurriculum(landscape.curriculumId, landscape.legacyHiddenByDefault),
    )
    const compatibilityLandscapes = sortedLandscapes.filter((landscape) =>
        isCompatibilityOnlyCurriculum(landscape.curriculumId, landscape.compatibilityOnly),
    )
    const legacyLandscapes = sortedLandscapes.filter((landscape) =>
        !isCompatibilityOnlyCurriculum(landscape.curriculumId, landscape.compatibilityOnly)
        && isLegacyHiddenByDefaultCurriculum(landscape.curriculumId, landscape.legacyHiddenByDefault),
    )
    const visibleCompatibilityLandscapes = showCompatibilityViews
        ? compatibilityLandscapes
        : compatibilityLandscapes.filter((landscape) => landscape.curriculumId === currentLandscapeId)
    const visibleLegacyLandscapes = showCompatibilityViews
        ? legacyLandscapes
        : legacyLandscapes.filter((landscape) => landscape.curriculumId === currentLandscapeId)

    return (
        <div className="flex flex-col gap-3">
            {/* Category Selector */}
            <div className="flex gap-2 p-1 bg-input-bg rounded-lg border border-border-color">
                {(['SCHOOL', 'UNI', 'OTHER'] as Category[]).map(cat => (
                    <button
                        key={cat}
                        type="button"
                        disabled={disabled}
                        onClick={() => setCategory(cat)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${category === cat
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                    >
                        {dropdownCopy.categoryLabels[cat]}
                    </button>
                ))}
            </div>

            {qualityFilterEnabled && (
                <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wider text-text-secondary">
                        {dropdownCopy.qualityFilterLabel}
                    </div>
                    <div className="flex flex-wrap gap-1 rounded-lg border border-border-color bg-input-bg p-1">
                        {(['green', 'orange', 'red', 'all'] as CurriculumQualityFilter[]).map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                disabled={disabled}
                                onClick={() => setQualityFilter(filter)}
                                aria-pressed={qualityFilter === filter}
                                className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                    qualityFilter === filter
                                        ? qualityFilterActiveClass[filter]
                                        : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            >
                                {filter !== 'all' && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-2 w-2 rounded-full ${
                                            qualityFilter === filter
                                                ? 'bg-white'
                                                : qualityStatusDotClass[filter]
                                        }`}
                                    />
                                )}
                                {dropdownCopy.qualityFilterOptions[filter]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <select
                value={currentLandscapeId || ''}
                disabled={disabled}
                onChange={(e) => onSelect(e.target.value)}
                className={`bg-input-bg border border-border-color text-text-primary text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
                <option value="" disabled>
                    {t.startPage.login.curriculumLabel.select}
                </option>
                {primaryLandscapes.length > 0 && (
                    <optgroup label={dropdownCopy.recommendedGroupLabel}>
                        {primaryLandscapes.map((l) => (
                            <option key={l.curriculumId} value={l.curriculumId} className="bg-input-bg text-text-primary">
                                {getDisplayTitle(l)}
                            </option>
                        ))}
                    </optgroup>
                )}
                {visibleCompatibilityLandscapes.length > 0 && (
                    <optgroup label={dropdownCopy.compatibilityGroupLabel}>
                        {visibleCompatibilityLandscapes.map((l) => (
                            <option key={l.curriculumId} value={l.curriculumId} className="bg-input-bg text-text-primary">
                                {getDisplayTitle(l)}
                            </option>
                        ))}
                    </optgroup>
                )}
                {visibleLegacyLandscapes.length > 0 && (
                    <optgroup label={dropdownCopy.legacyGroupLabel}>
                        {visibleLegacyLandscapes.map((l) => (
                            <option key={l.curriculumId} value={l.curriculumId} className="bg-input-bg text-text-primary">
                                {getDisplayTitle(l)}
                            </option>
                        ))}
                    </optgroup>
                )}
            </select>
        </div>
    )
}
