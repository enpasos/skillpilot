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

interface PersonalCurriculumSetupProps {
    isOpen: boolean
    onClose: () => void
    availableLandscapes: LandscapeSummary[]
    onConfigChange: (config: PersonalCurriculumConfig) => void
    initialConfig?: PersonalCurriculumConfig
    rootLandscapeId?: string
}

export const PersonalCurriculumSetup: React.FC<PersonalCurriculumSetupProps> = ({
    isOpen,
    onClose,
    availableLandscapes,
    onConfigChange,
    initialConfig = {},
    rootLandscapeId,
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
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    // Update config when initialConfig changes (e.g. loaded from backend)
    useEffect(() => {
        setConfig(computedInitial)
    }, [computedInitial])

    const toggleSelection = (landscapeId: string, isRoot: boolean) => {
        setConfig(prev => {
            const currentSelected = prev[landscapeId]?.selected ?? false
            const nextSelected = !currentSelected

            let next = {
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
    const rootLandscape = availableLandscapes.find(l => l.landscapeId === rootLandscapeId)
    const childrenLandscapes = availableLandscapes
        .filter(l => l.landscapeId !== rootLandscapeId)
        .sort((a, b) => (a.subject || a.title).localeCompare(b.subject || b.title))

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
                <div className="p-6 border-b border-border-color flex items-center justify-between">
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

                <div className="flex-1 overflow-y-auto p-4">
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
        </div>
    )
}
