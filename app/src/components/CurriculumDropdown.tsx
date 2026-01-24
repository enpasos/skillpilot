import React, { useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'

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
}

interface CurriculumDropdownProps {
    currentLandscapeId?: string
    onSelect: (landscapeId: string) => void
    className?: string
    filterOptions?: (options: LandscapeSummary[]) => LandscapeSummary[]
    landscapes?: LandscapeSummary[]
}

type Category = 'SCHOOL' | 'UNI' | 'OTHER'

export const CurriculumDropdown: React.FC<CurriculumDropdownProps> = ({
    currentLandscapeId,
    onSelect,
    className = '',
    filterOptions,
    landscapes: providedLandscapes,
}) => {
    const t = useTranslation()
    const { language } = useLanguage()
    const [landscapes, setLandscapes] = useState<LandscapeSummary[]>([])
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState<Category>('SCHOOL')

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

                // Pass current language to backend
                const query = `?lang=${language}`
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
    }, [providedLandscapes, language]) // Re-fetch when language changes

    const getCategory = (l: LandscapeSummary): Category => {
        const sType = (l.schoolType || '').toUpperCase()
        const title = (l.title || '').toUpperCase()

        // Explicit School Types
        const schoolTypes = ['GRUNDSCHULE', 'MITTELSCHULE', 'REALSCHULE', 'GYMNASIUM', 'FOS', 'BOS', 'WIRTSCHAFTSSCHULE', 'BERUFSOBERSCHULE', 'FACHOBERSCHULE', 'GYM', 'GESAMT', 'PROGRAMM']
        if (schoolTypes.some(t => sType.includes(t)) || title.includes('SCHULE') || title.includes('GYMNASIUM') || title.includes('GYMNASIAL')) return 'SCHOOL'

        // Explicit Uni keywords
        if (title.includes('BACHELOR') || title.includes('MASTER')) return 'UNI'
        if (['TUM', 'HEIDELBERG', 'MANNHEIM', 'DARMSTADT', 'UNI', 'HOCHSCHULE'].some(t => sType.includes(t) || title.includes(t))) return 'UNI'

        // CEFR / Languages
        if (sType === 'CEFR' || title.includes('CEFR') || title.includes('LANGUAGE') || title.includes('SPRACHE')) return 'OTHER'

        // Fallback
        return 'OTHER'
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

    // Sort alphabetically by the displayed text
    const sortedLandscapes = [...categoryFilteredLandscapes].sort((a, b) => {
        const textA = a.title || a.description || a.subject || '';
        const textB = b.title || b.description || b.subject || '';
        return textA.localeCompare(textB, language);
    });

    const categoryLabels: Record<Category, string> = {
        'SCHOOL': language === 'de' ? 'Schule' : 'School',
        'UNI': language === 'de' ? 'Universität & Hochschule' : 'University & Higher Ed',
        'OTHER': language === 'de' ? 'Sprachen & Weiterbildung' : 'Languages & Other'
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Category Selector */}
            <div className="flex gap-2 p-1 bg-input-bg rounded-lg border border-border-color">
                {(['SCHOOL', 'UNI', 'OTHER'] as Category[]).map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${category === cat
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                    >
                        {categoryLabels[cat]}
                    </button>
                ))}
            </div>

            <select
                value={currentLandscapeId || ''}
                onChange={(e) => onSelect(e.target.value)}
                className={`bg-input-bg border border-border-color text-text-primary text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors ${className}`}
            >
                <option value="" disabled>
                    {t.startPage.login.curriculumLabel.select}
                </option>
                {sortedLandscapes.map((l) => (
                    <option key={l.curriculumId} value={l.curriculumId} className="bg-input-bg text-text-primary">
                        {l.title || l.description || l.subject}
                    </option>
                ))}
            </select>
        </div>
    )
}
