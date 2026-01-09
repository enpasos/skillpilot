import React, { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronDown } from 'lucide-react'

interface LandscapeSummary {
    landscapeId: string
    title: string
    subject?: string
    filters?: { id: string; label: string }[]
}

interface PersonalCurriculumConfig {
    [landscapeId: string]: {
        selected: boolean
        filterId?: string
    }
}

// Reuse category logic (ideally this should be shared)
type Category = 'SCHOOL' | 'UNI' | 'OTHER'

// Helper to determine category
const getCategory = (l: LandscapeSummary): Category => {
    // Note: LandscapeSummary as defined here does not currently include schoolType?
    // Let's check the interface definition at the top.
    // It is just { landscapeId, title, subject?, filters? }
    // We might need to extend it or infer from title.
    const title = (l.title || '').toUpperCase()
    // We don't have schoolType here yet. Assuming 'subject' might help or just title.

    if (title.includes('SCHULE') || title.includes('GYMNASIUM') || title.includes('GYMNASIAL') || title.includes('GRUNDSCHULE')) return 'SCHOOL';
    if (title.includes('BACHELOR') || title.includes('MASTER') || title.includes('UNI') || title.includes('HOCHSCHULE')) return 'UNI';
    return 'OTHER';
}

interface PersonalCurriculumSetupProps {
    isOpen: boolean
    onClose: () => void
    availableLandscapes: LandscapeSummary[]
    onConfigChange: (config: PersonalCurriculumConfig) => void
    initialConfig?: PersonalCurriculumConfig
    rootLandscapeId?: string
    initialStrategy?: 'RANDOM' | 'SEQUENTIAL'
    initialAutoPilot?: boolean
    onPreferencesChange?: (strategy: 'RANDOM' | 'SEQUENTIAL', autoPilot: boolean) => void
}

export const PersonalCurriculumSetup: React.FC<PersonalCurriculumSetupProps> = ({
    isOpen,
    onClose,
    availableLandscapes,
    onConfigChange,
    initialConfig = {},
    rootLandscapeId,
    initialStrategy = 'RANDOM',
    initialAutoPilot = false,
    onPreferencesChange,
}) => {
    const computedInitial = React.useMemo(() => {
        if (Object.keys(initialConfig).length > 0) return initialConfig
        const initial: PersonalCurriculumConfig = {}
        availableLandscapes.forEach((l) => {
            initial[l.landscapeId] = { selected: true }
        })
        return initial
    }, [availableLandscapes, initialConfig])

    const [config, setConfig] = useState<PersonalCurriculumConfig>(computedInitial)
    const [strategy, setStrategy] = useState<'RANDOM' | 'SEQUENTIAL'>(initialStrategy)
    const [autoPilot, setAutoPilot] = useState<boolean>(initialAutoPilot)
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    const [category, setCategory] = useState<Category>('SCHOOL') // Default category

    // Update config when initialConfig changes (e.g. loaded from backend)
    useEffect(() => {
        setConfig(computedInitial)
    }, [computedInitial])

    useEffect(() => {
        setStrategy(initialStrategy)
        setAutoPilot(initialAutoPilot)
    }, [initialStrategy, initialAutoPilot])

    const handleStrategyChange = (newStrategy: 'RANDOM' | 'SEQUENTIAL') => {
        setStrategy(newStrategy)
        onPreferencesChange?.(newStrategy, autoPilot)
    }

    const handleAutoPilotChange = (newAutoPilot: boolean) => {
        setAutoPilot(newAutoPilot)
        onPreferencesChange?.(strategy, newAutoPilot)
    }

    const toggleSelection = (landscapeId: string, isRoot: boolean) => {
        setConfig(prev => {
            const currentSelected = prev[landscapeId]?.selected ?? false
            const nextSelected = !currentSelected

            const next = {
                ...prev,
                [landscapeId]: {
                    ...prev[landscapeId],
                    selected: nextSelected
                }
            }

            // Cascade logic: If root is toggled, toggle all children
            if (isRoot) {
                availableLandscapes.forEach(l => {
                    if (l.landscapeId !== landscapeId) {
                        next[l.landscapeId] = {
                            ...prev[l.landscapeId],
                            selected: nextSelected
                        }
                    }
                })
            } else {
                // Child logic: If child is checked, ensure root is checked
                if (nextSelected && rootLandscapeId) {
                    next[rootLandscapeId] = {
                        ...prev[rootLandscapeId],
                        selected: true
                    }
                }
            }

            onConfigChange(next)
            return next
        })
    }

    const setFilter = (landscapeId: string, filterId: string) => {
        setConfig(prev => {
            const next = {
                ...prev,
                [landscapeId]: {
                    ...prev[landscapeId],
                    filterId
                }
            }
            onConfigChange(next)
            return next
        })
    }

    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    if (!isOpen) return null

    // Separate Root and Children
    // Separate Root and Children
    const rootLandscape = availableLandscapes.find(l => l.landscapeId === rootLandscapeId)

    // Filter landscapes by category
    const filteredAvailable = availableLandscapes.filter(l => {
        // Always show the root if it matches, but usually we filter the LIST of choices.
        // If rootLandscapeId is set, that's the "active" one, but here we are selecting SUB-modules?
        // The logic says: "Wähle deine Fächer".
        // Usually availableLandscapes contains ALL available. 
        // Let's filter childrenLandscapes.
        return getCategory(l) === category
    })

    const childrenLandscapes = filteredAvailable
        .filter(l => l.landscapeId !== rootLandscapeId)
        .sort((a, b) => (a.subject || a.title).localeCompare(b.subject || b.title))

    const categoryLabels: Record<Category, string> = {
        'SCHOOL': 'Schule',
        'UNI': 'Universität & Hochschule',
        'OTHER': 'Sprachen & Weiterbildung'
    }

    const renderNode = (landscape: LandscapeSummary, isRoot: boolean) => {
        const isSelected = config[landscape.landscapeId]?.selected ?? false
        const currentFilter = config[landscape.landscapeId]?.filterId ?? ''
        const hasFilters = landscape.filters && landscape.filters.length > 0

        return (
            <div key={landscape.landscapeId} className="flex flex-col">
                <div
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isSelected ? 'bg-input-bg shadow-sm' : 'hover:bg-input-bg/50'
                        }`}
                >
                    <button
                        onClick={() => toggleExpand(landscape.landscapeId)}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-text-secondary ${!hasFilters && !isRoot ? 'invisible' : ''}`}
                    >
                        {(expanded.has(landscape.landscapeId) || isRoot) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(landscape.landscapeId, isRoot)}
                        className="w-4 h-4 rounded border-border-color bg-input-bg text-sky-500 focus:ring-sky-500 focus:ring-offset-sidebar-bg"
                    />

                    <span
                        className={`flex-1 font-medium cursor-pointer select-none ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}
                        onClick={() => toggleSelection(landscape.landscapeId, isRoot)}
                    >
                        {landscape.title}
                    </span>
                </div>

                {/* Render Filters if expanded */}
                {hasFilters && (expanded.has(landscape.landscapeId) || isRoot) && (
                    <div className="ml-11 flex flex-col gap-1 mt-1 mb-2 border-l-2 border-border-color pl-2">
                        {landscape.filters!.map(f => (
                            <label
                                key={f.id}
                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-input-bg/50 transition-colors ${currentFilter === f.id ? 'text-sky-600 dark:text-sky-300' : 'text-text-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`filter-${landscape.landscapeId}`}
                                    checked={currentFilter === f.id}
                                    onChange={() => setFilter(landscape.landscapeId, f.id)}
                                    disabled={!isSelected}
                                    className="w-3.5 h-3.5 border-border-color bg-input-bg text-sky-500 focus:ring-sky-500 focus:ring-offset-sidebar-bg"
                                />
                                <span className="text-sm">{f.label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Render Children if this is Root */}
                {isRoot && (expanded.has(landscape.landscapeId) || true) && (
                    <div className="ml-6 border-l border-border-color pl-2 mt-1">
                        {childrenLandscapes.map(child => renderNode(child, false))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-sidebar-bg border border-border-color rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl transition-colors">
                <div className="p-6 border-b border-border-color flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Mein Lehrplan</h2>
                            <p className="text-text-secondary text-sm mt-1">Wähle deine Fächer und Kursniveaus.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-input-bg rounded-full transition-colors text-text-secondary hover:text-text-primary"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Category Selector */}
                    <div className="flex gap-2 p-1 bg-input-bg rounded-lg border border-border-color">
                        {(['SCHOOL', 'UNI', 'OTHER'] as Category[]).map(cat => (
                            <button
                                key={cat}
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
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {/* Preferences Section */}
                    {onPreferencesChange && (
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Auswahlpriorisierung</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="strategy"
                                            checked={strategy === 'RANDOM'}
                                            onChange={() => handleStrategyChange('RANDOM')}
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                        />
                                        <span className="text-sm text-text-primary">Zufällig (Abwechslung)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="strategy"
                                            checked={strategy === 'SEQUENTIAL'}
                                            onChange={() => handleStrategyChange('SEQUENTIAL')}
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                        />
                                        <span className="text-sm text-text-primary">Schritt für Schritt</span>
                                    </label>
                                </div>

                                <div className="h-px bg-border-color my-1"></div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoPilot}
                                        onChange={(e) => handleAutoPilotChange(e.target.checked)}
                                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-text-primary">Autopilot aktivieren</span>
                                        <p className="text-xs text-text-secondary">Startet automatisch das nächste Ziel nach Abschluss.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        {rootLandscape ? renderNode(rootLandscape, true) : childrenLandscapes.map(l => renderNode(l, false))}
                    </div>
                </div>

                <div className="p-6 border-t border-border-color bg-sidebar-bg/50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-900/20"
                    >
                        Fertig
                    </button>
                </div>
            </div>
            )</div>
    )
}
