import React, { useEffect, useState } from 'react'

interface LandscapeSummary {
    landscapeId: string
    filename: string
    country: string
    region: string
    type: string
    level: string
    subject: string
    locale: string
}

interface ContextSelectorProps {
    onSelect: (landscapeId: string) => void
}

type Hierarchy = Record<string, Record<string, Record<string, Record<string, string[]>>>>

export const ContextSelector: React.FC<ContextSelectorProps> = ({ onSelect }) => {
    const [summaries, setSummaries] = useState<LandscapeSummary[]>([])
    const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [selectedCountry, setSelectedCountry] = useState<string>('')
    const [selectedRegion, setSelectedRegion] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedLevel, setSelectedLevel] = useState<string>('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')

    useEffect(() => {
        fetch('/api/ui/landscapes')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load landscapes')
                return res.json()
            })
            .then((data) => {
                // Handle both old (array) and new ({ summaries, hierarchy }) formats
                const summaries = Array.isArray(data) ? data : data.summaries
                const hierarchy = Array.isArray(data) ? null : (data.hierarchy as Hierarchy | null)

                console.log('[ContextSelector] Fetched data. Hierarchy available:', !!hierarchy)
                setSummaries(summaries)
                setHierarchy(hierarchy)
                setLoading(false)
            })
            .catch((err) => {
                console.error('[ContextSelector] Error fetching landscapes:', err)
                setError(err.message)
                setLoading(false)
            })
    }, [])

    const getOptions = (field: keyof LandscapeSummary, filters: Partial<LandscapeSummary>) => {
        if (!summaries.length) return []
        const filtered = summaries.filter((s) => {
            return Object.entries(filters).every(([key, value]) => s[key as keyof LandscapeSummary] === value)
        })
        const values = filtered.map((s) => s[field]).filter(Boolean)
        return Array.from(new Set(values)).sort()
    }

    const getOptionsFromHierarchy = (level: string) => {
        if (!hierarchy) return []
        if (level === 'country') return Object.keys(hierarchy).sort()
        if (level === 'region' && selectedCountry) return Object.keys(hierarchy[selectedCountry] || {}).sort()
        if (level === 'type' && selectedCountry && selectedRegion) return Object.keys(hierarchy[selectedCountry]?.[selectedRegion] || {}).sort()
        if (level === 'level' && selectedCountry && selectedRegion && selectedType) return Object.keys(hierarchy[selectedCountry]?.[selectedRegion]?.[selectedType] || {}).sort()
        if (level === 'subject' && selectedCountry && selectedRegion && selectedType && selectedLevel) return (hierarchy[selectedCountry]?.[selectedRegion]?.[selectedType]?.[selectedLevel] || []).slice().sort()
        return []
    }

    // Use hierarchy if available, otherwise fallback to client-side filtering
    const countries = hierarchy ? getOptionsFromHierarchy('country') : getOptions('country', {})
    const regions = hierarchy ? getOptionsFromHierarchy('region') : (selectedCountry ? getOptions('region', { country: selectedCountry }) : [])
    const types = hierarchy ? getOptionsFromHierarchy('type') : (selectedRegion ? getOptions('type', { country: selectedCountry, region: selectedRegion }) : [])
    const levels = hierarchy ? getOptionsFromHierarchy('level') : (selectedType ? getOptions('level', { country: selectedCountry, region: selectedRegion, type: selectedType }) : [])
    const subjects = hierarchy ? getOptionsFromHierarchy('subject') : (selectedLevel ? getOptions('subject', {
        country: selectedCountry,
        region: selectedRegion,
        type: selectedType,
        level: selectedLevel,
    }) : [])

    const handleConfirm = () => {
        const selected = summaries.find(
            (s) =>
                s.country === selectedCountry &&
                s.region === selectedRegion &&
                s.type === selectedType &&
                s.level === selectedLevel &&
                s.subject === selectedSubject,
        )
        if (selected) {
            onSelect(selected.landscapeId)
        }
    }

    if (loading) return <div className="text-slate-400 p-8 text-center">Lade Auswahl...</div>
    if (error) return <div className="text-rose-400 p-8 text-center">Fehler: {error}</div>

    return (
        <div className="max-w-md mx-auto p-6 bg-slate-900/80 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">Lernkontext wählen</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Land</label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => {
                            setSelectedCountry(e.target.value)
                            setSelectedRegion('')
                            setSelectedType('')
                            setSelectedLevel('')
                            setSelectedSubject('')
                        }}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                    >
                        <option value="">Bitte wählen...</option>
                        {countries.map((c: string) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCountry && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Region / Bundesland</label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => {
                                setSelectedRegion(e.target.value)
                                setSelectedType('')
                                setSelectedLevel('')
                                setSelectedSubject('')
                            }}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                        >
                            <option value="">Bitte wählen...</option>
                            {regions.map((r: string) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedRegion && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Schulform</label>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value)
                                setSelectedLevel('')
                                setSelectedSubject('')
                            }}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                        >
                            <option value="">Bitte wählen...</option>
                            {types.map((t: string) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedType && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Stufe</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => {
                                setSelectedLevel(e.target.value)
                                setSelectedSubject('')
                            }}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                        >
                            <option value="">Bitte wählen...</option>
                            {levels.map((l: string) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedLevel && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Fach</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                        >
                            <option value="">Bitte wählen...</option>
                            {subjects.map((s: string) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedSubject}
                        className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${selectedSubject
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Starten
                    </button>
                </div>
            </div>
        </div>
    )
}
