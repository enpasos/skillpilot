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
    filters?: any[]
    title?: string
}

interface CurriculumDropdownProps {
    currentLandscapeId?: string
    onSelect: (landscapeId: string) => void
    className?: string
    filterOptions?: (options: LandscapeSummary[]) => LandscapeSummary[]
    landscapes?: LandscapeSummary[]
}

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

    if (loading && (!landscapes || landscapes.length === 0)) {
        return <div className="text-text-secondary text-sm">{t.startPage.login.checking}</div>
    }

    let filteredLandscapes = landscapes;
    if (filterOptions) {
        filteredLandscapes = filterOptions(landscapes);
    }

    return (
        <select
            value={currentLandscapeId || ''}
            onChange={(e) => onSelect(e.target.value)}
            className={`bg-input-bg border border-border-color text-text-primary text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors ${className}`}
        >
            <option value="" disabled>
                {t.startPage.login.curriculumLabel.select}
            </option>
            {filteredLandscapes.map((l) => (
                <option key={l.curriculumId} value={l.curriculumId} className="bg-input-bg text-text-primary">
                    {l.title || l.description || l.subject}
                </option>
            ))}
        </select>
    )
}
