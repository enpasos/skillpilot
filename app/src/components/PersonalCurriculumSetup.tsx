import React, { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { isCompatibilityOnlyCurriculum } from '../utils/curriculumDisplay'

interface LandscapeSummary {
    landscapeId: string
    title: string
    subject?: string
    filters?: { id: string; label: string }[]
    compatibilityOnly?: boolean
}

interface PersonalCurriculumConfig {
    [landscapeId: string]: {
        selected: boolean
        filterId?: string
    }
}

const isCompatibilityOnlyLandscape = (landscape: LandscapeSummary) =>
    isCompatibilityOnlyCurriculum(landscape.landscapeId, landscape.compatibilityOnly)

interface MigrationPreviewItem {
    label: string
    value: string
}

const DEFAULT_GYMNASIUM_DE_ROOT_FILTERS = [
    { id: 'ALL', label: 'Alle Bundeslaender' },
    { id: 'DE-HE', label: 'Hessen' },
    { id: 'DE-BY', label: 'Bayern' },
]

const COMBINED_COURSE_FILTER = { id: 'ALL', label: 'Grund- und Leistungskurs' }

const withCombinedCourseFilter = (filters?: { id: string; label: string }[]) => {
    const effectiveFilters = filters ?? []
    const hasGk = effectiveFilters.some(filter => filter.id === 'GK')
    const hasLk = effectiveFilters.some(filter => filter.id === 'LK')
    const hasAll = effectiveFilters.some(filter => filter.id === 'ALL')

    if (hasGk && hasLk && !hasAll) {
        return [...effectiveFilters, COMBINED_COURSE_FILTER]
    }

    return effectiveFilters
}

const cleanLandscapeDisplayTitle = (title: string) => {
    return title
        .replace(/^Kanonische\s+/i, '')
        .replace(/^Canonical\s+/i, '')
        .replace(/\s+Pilot\b/gi, '')
        .replace(/\s*\(Gymnasium,\s*DE\)\s*$/i, '')
        .trim()
}



interface PersonalCurriculumSetupProps {
    isOpen: boolean
    onClose: () => void
    availableLandscapes: LandscapeSummary[]
    currentLandscapeId?: string
    retirementOnly?: boolean
    onConfigChange: (config: PersonalCurriculumConfig) => void
    initialConfig?: PersonalCurriculumConfig
    rootLandscapeId?: string
    initialStrategy?: 'RANDOM' | 'SEQUENTIAL'
    initialAutoPilot?: boolean
    initialStrictMode?: boolean
    onPreferencesChange?: (strategy: 'RANDOM' | 'SEQUENTIAL', autoPilot: boolean, strictMode: boolean) => void
    migrationTitle?: string
    migrationDescription?: string
    migrationActionLabel?: string
    migrationActionPending?: boolean
    onMigrationAction?: () => void
    migrationPreviewItems?: MigrationPreviewItem[]
}

export const PersonalCurriculumSetup: React.FC<PersonalCurriculumSetupProps> = ({
    isOpen,
    onClose,
    availableLandscapes,
    currentLandscapeId,
    retirementOnly = false,
    onConfigChange,
    initialConfig = {},
    rootLandscapeId,
    initialStrategy = 'RANDOM',
    initialAutoPilot = false,
    initialStrictMode = false,
    onPreferencesChange,
    migrationTitle,
    migrationDescription,
    migrationActionLabel,
    migrationActionPending = false,
    onMigrationAction,
    migrationPreviewItems = [],
}) => {
    const computedInitial = React.useMemo(() => {
        const initial: PersonalCurriculumConfig = {}
        availableLandscapes.forEach((l) => {
            const existing = initialConfig[l.landscapeId]
            const defaultFilterId = l.filters && l.filters.length > 0 ? l.filters[0].id : undefined
            initial[l.landscapeId] = {
                selected: existing?.selected ?? true,
                ...(existing?.filterId ? { filterId: existing.filterId } : defaultFilterId ? { filterId: defaultFilterId } : {})
            }
        })
        Object.entries(initialConfig).forEach(([landscapeId, value]) => {
            if (!initial[landscapeId]) {
                initial[landscapeId] = value
            }
        })
        return initial
    }, [availableLandscapes, initialConfig])

    const initialExpanded = React.useMemo(() => {
        const next = new Set<string>()
        if (rootLandscapeId) {
            next.add(rootLandscapeId)
        }
        availableLandscapes.forEach((landscape) => {
            const filterId = computedInitial[landscape.landscapeId]?.filterId
            if (filterId) {
                next.add(landscape.landscapeId)
            }
        })
        return next
    }, [availableLandscapes, computedInitial, rootLandscapeId])

    const [config, setConfig] = useState<PersonalCurriculumConfig>(computedInitial)
    const [strategy, setStrategy] = useState<'RANDOM' | 'SEQUENTIAL'>(initialStrategy)
    const [autoPilot, setAutoPilot] = useState<boolean>(initialAutoPilot)
    const [strictMode, setStrictMode] = useState<boolean>(initialStrictMode)
    const [expanded, setExpanded] = useState<Set<string>>(new Set(initialExpanded))
    const currentLandscape = availableLandscapes.find((landscape) => landscape.landscapeId === currentLandscapeId)
    const currentLandscapeIsCompatibilityOnly = isCompatibilityOnlyLandscape(
        currentLandscape ?? { landscapeId: currentLandscapeId ?? '', title: '' },
    )
    const shouldAutoRevealCompatibility = currentLandscapeIsCompatibilityOnly
    const [showCompatibilityChildren, setShowCompatibilityChildren] = useState(shouldAutoRevealCompatibility)

    // Update config when initialConfig changes (e.g. loaded from backend)
    useEffect(() => {
        setConfig(computedInitial)
    }, [computedInitial])

    useEffect(() => {
        if (!isOpen) return
        setExpanded(new Set(initialExpanded))
    }, [isOpen, initialExpanded])

    useEffect(() => {
        setShowCompatibilityChildren(shouldAutoRevealCompatibility)
    }, [shouldAutoRevealCompatibility, isOpen])

    useEffect(() => {
        setStrategy(initialStrategy)
        setAutoPilot(initialAutoPilot)
        setStrictMode(initialStrictMode)
    }, [initialStrategy, initialAutoPilot, initialStrictMode])

    const handleStrategyChange = (newStrategy: 'RANDOM' | 'SEQUENTIAL') => {
        setStrategy(newStrategy)
        onPreferencesChange?.(newStrategy, autoPilot, strictMode)
    }

    const handleAutoPilotChange = (newAutoPilot: boolean) => {
        setAutoPilot(newAutoPilot)
        onPreferencesChange?.(strategy, newAutoPilot, strictMode)
    }

    const handleStrictModeChange = (newStrictMode: boolean) => {
        setStrictMode(newStrictMode)
        onPreferencesChange?.(strategy, autoPilot, newStrictMode)
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
        const next = {
            ...config,
            [landscapeId]: {
                ...config[landscapeId],
                selected: true,
                filterId
            }
        }
        setConfig(next)
        onConfigChange(next)
    }

    const toggleExpand = (landscapeId: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(landscapeId)) {
                next.delete(landscapeId)
            } else {
                next.add(landscapeId)
            }
            return next
        })
    }

    if (!isOpen) return null

    // Separate Root and Children
    const rootLandscape = availableLandscapes.find(l => l.landscapeId === rootLandscapeId)
    // Preserve backend order to reflect the authored curriculum/module sequence.
    const childrenLandscapes = availableLandscapes
        .filter(l => l.landscapeId !== rootLandscapeId)
    const primaryChildrenLandscapes = childrenLandscapes.filter((landscape) => !isCompatibilityOnlyLandscape(landscape))
    const compatibilityChildrenLandscapes = childrenLandscapes.filter((landscape) => isCompatibilityOnlyLandscape(landscape))

    const renderNode = (landscape: LandscapeSummary, isRoot: boolean) => {
        const isSelected = config[landscape.landscapeId]?.selected ?? false
        const currentFilter = config[landscape.landscapeId]?.filterId ?? ''
        const effectiveFilters =
            isRoot && landscape.title === 'Gymnasium (DE)' && (!landscape.filters || landscape.filters.length === 0)
                ? DEFAULT_GYMNASIUM_DE_ROOT_FILTERS
                : withCombinedCourseFilter(landscape.filters)
        const hasFilters = effectiveFilters.length > 0
        const showFilterControls = Boolean(hasFilters)
        const isExpandable = isRoot || showFilterControls
        const isExpanded = expanded.has(landscape.landscapeId)
        const rawDisplayLabel = isRoot ? landscape.title : (landscape.subject?.trim() || landscape.title)
        const displayLabel = isRoot ? rawDisplayLabel : cleanLandscapeDisplayTitle(rawDisplayLabel)
        const modeLabel = !isRoot && isCompatibilityOnlyLandscape(landscape)
            ? `${displayLabel} (Kompatibilitaetsansicht)`
            : displayLabel

        return (
            <div key={landscape.landscapeId} className="flex flex-col">
                <div
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isSelected ? 'bg-input-bg shadow-sm' : 'hover:bg-input-bg/50'
                        }`}
                >
                    <button
                        onClick={() => toggleExpand(landscape.landscapeId)}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-text-secondary ${!isExpandable ? 'invisible' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                        {modeLabel}
                    </span>
                </div>

                {showFilterControls && isExpanded && (
                    <div className={`${isRoot ? 'ml-11 mt-2 mb-3 flex flex-col gap-1 rounded-lg border border-border-color bg-input-bg/40 p-3' : 'ml-11 flex flex-col gap-1 mt-1 mb-2 border-l-2 border-border-color pl-2'}`}>
                        {isRoot && (
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                Bundesland
                            </div>
                        )}
                        {effectiveFilters.map(f => (
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
                                    // Removed disabled={!isSelected} so selecting a filter auto-selects the subject
                                    className="w-3.5 h-3.5 border-border-color bg-input-bg text-sky-500 focus:ring-sky-500 focus:ring-offset-sidebar-bg"
                                />
                                <span className="text-sm">{f.label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Render Children if this is Root */}
                {isRoot && (
                    <div className="mt-3 space-y-4">
                        {primaryChildrenLandscapes.length > 0 && (
                            <div className="grid gap-3 md:grid-cols-2">
                                {primaryChildrenLandscapes.map(child => renderNode(child, false))}
                            </div>
                        )}
                        {compatibilityChildrenLandscapes.length > 0 && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-primary">Kompatibilitaetsansichten</h3>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            Diese eingefrorenen Hessen-Oberstufenansichten bleiben nur fuer Migration, Vergleich und Audit verfuegbar.
                                        </p>
                                        {!showCompatibilityChildren && (
                                            <p className="mt-2 text-xs text-text-secondary">
                                                {compatibilityChildrenLandscapes.length} Ansicht{compatibilityChildrenLandscapes.length === 1 ? '' : 'en'} ausgeblendet.
                                            </p>
                                        )}
                                    </div>
                                    {!shouldAutoRevealCompatibility && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCompatibilityChildren((current) => !current)}
                                            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
                                        >
                                            {showCompatibilityChildren ? 'Ausblenden' : 'Einblenden'}
                                        </button>
                                    )}
                                </div>
                                {showCompatibilityChildren && (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {compatibilityChildrenLandscapes.map(child => renderNode(child, false))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" >
            <div className="bg-sidebar-bg border border-border-color rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl transition-colors">
                <div className="p-6 border-b border-border-color flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">
                            {retirementOnly ? 'Kompatibilitaetsansicht' : 'Mein Lehrplan'}
                        </h2>
                        <p className="text-text-secondary text-sm mt-1">
                            {retirementOnly
                                ? 'Diese Hessen-Ansicht bleibt nur noch fuer Migration, Vergleich und Audit verfuegbar.'
                                : 'Wähle deine Fächer und Kursniveaus.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-input-bg rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {onMigrationAction && migrationTitle && migrationDescription && migrationActionLabel && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">{migrationTitle}</h3>
                                    <p className="mt-1 text-sm text-text-secondary">{migrationDescription}</p>
                                    {migrationPreviewItems.length > 0 && (
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            {migrationPreviewItems.map((item) => (
                                                <div
                                                    key={`${item.label}:${item.value}`}
                                                    className="rounded-lg border border-amber-200/70 bg-white/70 px-3 py-2 dark:border-amber-900/30 dark:bg-slate-950/30"
                                                >
                                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                                                        {item.label}
                                                    </div>
                                                    <div className="mt-1 text-sm font-medium text-text-primary">
                                                        {item.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={onMigrationAction}
                                    disabled={migrationActionPending}
                                    className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {migrationActionPending ? '...' : migrationActionLabel}
                                </button>
                            </div>
                        </div>
                    )}

                    {retirementOnly && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                            <h3 className="text-sm font-semibold text-text-primary">Nur noch fuer Umstellung und Audit</h3>
                            <p className="mt-2 text-sm text-text-secondary">
                                Fach- und Filteraenderungen werden in dieser eingefrorenen Hessen-Ansicht nicht mehr gepflegt.
                                Fuer die weitere Arbeit soll der Lernstand auf Gymnasium (DE) umgestellt werden.
                            </p>
                            <p className="mt-2 text-sm text-text-secondary">
                                Die aktuelle Legacy-Ansicht bleibt vorerst als Vergleichspfad sichtbar, ist aber kein normaler Konfigurationspfad mehr.
                            </p>
                        </div>
                    )}

                    {/* Preferences Section */}
                    {!retirementOnly && onPreferencesChange && (
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

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={strictMode}
                                        onChange={(e) => handleStrictModeChange(e.target.checked)}
                                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-text-primary">Strict Mode aktivieren</span>
                                        <p className="text-xs text-text-secondary">Prüft alle Voraussetzungen global, auch außerhalb deines aktuellen Fokus.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {!retirementOnly && (
                        <div className="flex flex-col gap-1">
                            {rootLandscape ? renderNode(rootLandscape, true) : childrenLandscapes.map(l => renderNode(l, false))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border-color bg-sidebar-bg/50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-900/20"
                    >
                        {retirementOnly ? 'Schliessen' : 'Fertig'}
                    </button>
                </div>
            </div>
            )</div>
    )
}
