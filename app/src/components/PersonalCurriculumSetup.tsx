import React, { useState } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { CANONICAL_GYMNASIUM_ROOT_ID, isCompatibilityOnlyCurriculum } from '../utils/curriculumDisplay'
import type { LegacyCutoverPreviewItem } from '../utils/legacyCutover'
import {
    applyDefaultGlobalStageScope,
    getGlobalStageScopeSelection,
    GLOBAL_STAGE_SCOPE_CONFIG_IDS,
    getGlobalStageScopeOptions,
} from '../utils/personalCurriculumStageScope'
import {
    formatJurisdictionScopedTitle,
    getDisplayCourseProfileFilters,
    getDisplayFiltersForSelection,
} from '../utils/filterLabels'
import { getPersonalCurriculumSetupCopy } from '../utils/curriculumSetupCopy'

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

interface PersonalCurriculumPreferences {
    strategy: 'RANDOM' | 'SEQUENTIAL'
    autoPilot: boolean
    strictMode: boolean
}

const isCompatibilityOnlyLandscape = (landscape: LandscapeSummary) =>
    isCompatibilityOnlyCurriculum(landscape.landscapeId, landscape.compatibilityOnly)

interface SetupMigrationConfig {
    title: string
    description: string
    actionLabel: string
    actionPending?: boolean
    onAction: () => void
    previewItems?: LegacyCutoverPreviewItem[]
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
    onApply?: (config: PersonalCurriculumConfig, preferences: PersonalCurriculumPreferences) => Promise<void> | void
    initialConfig?: PersonalCurriculumConfig
    rootLandscapeId?: string
    initialStrategy?: 'RANDOM' | 'SEQUENTIAL'
    initialAutoPilot?: boolean
    initialStrictMode?: boolean
    migration?: SetupMigrationConfig
}

export const PersonalCurriculumSetup: React.FC<PersonalCurriculumSetupProps> = ({
    isOpen,
    onClose,
    availableLandscapes,
    currentLandscapeId,
    retirementOnly = false,
    onApply,
    initialConfig = {},
    rootLandscapeId,
    initialStrategy = 'RANDOM',
    initialAutoPilot = false,
    initialStrictMode = false,
    migration,
}) => {
    const { language } = useLanguage()
    const localizedLanguage = language === 'en' ? 'en' : 'de'
    const setupCopy = getPersonalCurriculumSetupCopy(localizedLanguage)
    const retirementCopy = setupCopy.retirement
    const compatibilityCopy = setupCopy.compatibility
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
        if (rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID) {
            return applyDefaultGlobalStageScope(initial).config
        }
        return initial
    }, [availableLandscapes, initialConfig, rootLandscapeId])

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
    const [isApplying, setIsApplying] = useState(false)
    const stageScopeOptions = React.useMemo(
        () => getGlobalStageScopeOptions(localizedLanguage),
        [localizedLanguage],
    )
    const currentLandscape = availableLandscapes.find((landscape) => landscape.landscapeId === currentLandscapeId)
    const currentLandscapeIsCompatibilityOnly = isCompatibilityOnlyLandscape(
        currentLandscape ?? { landscapeId: currentLandscapeId ?? '', title: '' },
    )
    const shouldAutoRevealCompatibility = currentLandscapeIsCompatibilityOnly
    const [showCompatibilityChildren, setShowCompatibilityChildren] = useState(shouldAutoRevealCompatibility)

    const handleStrategyChange = (newStrategy: 'RANDOM' | 'SEQUENTIAL') => {
        setStrategy(newStrategy)
    }

    const handleAutoPilotChange = (newAutoPilot: boolean) => {
        setAutoPilot(newAutoPilot)
    }

    const handleStrictModeChange = (newStrictMode: boolean) => {
        setStrictMode(newStrictMode)
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

    const toggleGlobalStageScope = (stageScopeId: string) => {
        setConfig(prev => {
            const currentSelection = getGlobalStageScopeSelection(prev)
            const isCurrentlySelected = prev[stageScopeId]?.selected ?? true
            const nextSelected = !isCurrentlySelected

            if (!nextSelected) {
                const wouldDisableLastStage =
                    (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1 && !currentSelection.sek2Selected)
                    || (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2 && !currentSelection.sek1Selected)
                if (wouldDisableLastStage) {
                    return prev
                }
            }

            const next = {
                ...prev,
                [stageScopeId]: {
                    selected: nextSelected,
                },
            }
            return next
        })
    }

    const handleApply = async () => {
        if (retirementOnly) {
            onClose()
            return
        }

        if (!onApply) {
            onClose()
            return
        }

        setIsApplying(true)
        try {
            await onApply(config, { strategy, autoPilot, strictMode })
            onClose()
        } finally {
            setIsApplying(false)
        }
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
        const globalStageSelection = getGlobalStageScopeSelection(config)
        const shouldShowGlobalStageScope = isRoot && rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID
        const effectiveFilters = getDisplayCourseProfileFilters(landscape.filters, localizedLanguage)
        const displayFilters = isRoot
            ? getDisplayFiltersForSelection(effectiveFilters, localizedLanguage)
            : effectiveFilters
        const hasFilters = effectiveFilters.length > 0
        const showCourseProfileControls = isRoot ? true : globalStageSelection.sek2Selected
        const showFilterControls = Boolean(hasFilters) && showCourseProfileControls && (isRoot || isSelected)
        const isExpandable = isRoot || showFilterControls
        const isExpanded = expanded.has(landscape.landscapeId)
        const rawDisplayLabel = isRoot
            ? formatJurisdictionScopedTitle(landscape.title, currentFilter, localizedLanguage)
            : (landscape.subject?.trim() || landscape.title)
        const displayLabel = isRoot ? rawDisplayLabel : cleanLandscapeDisplayTitle(rawDisplayLabel)
        const modeLabel = !isRoot && isCompatibilityOnlyLandscape(landscape)
            ? `${displayLabel} (${compatibilityCopy.suffix})`
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
                                {setupCopy.rootFilterLabel}
                            </div>
                        )}
                        {displayFilters.map(f => (
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
                        {shouldShowGlobalStageScope && (
                            <>
                                <div className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    {setupCopy.stageLabel}
                                </div>
                                {stageScopeOptions.map(option => {
                                    const checked = config[option.id]?.selected ?? true
                                    return (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-input-bg/50 transition-colors ${checked ? 'text-sky-600 dark:text-sky-300' : 'text-text-secondary'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleGlobalStageScope(option.id)}
                                                className="w-3.5 h-3.5 rounded border-border-color bg-input-bg text-sky-500 focus:ring-sky-500 focus:ring-offset-sidebar-bg"
                                            />
                                            <span className="text-sm">{option.label}</span>
                                        </label>
                                    )
                                })}
                            </>
                        )}
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
                                        <h3 className="text-sm font-semibold text-text-primary">{compatibilityCopy.title}</h3>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            {compatibilityCopy.subtitle}
                                        </p>
                                        {!showCompatibilityChildren && (
                                            <p className="mt-2 text-xs text-text-secondary">
                                                {compatibilityCopy.hiddenSummary(compatibilityChildrenLandscapes.length)}
                                            </p>
                                        )}
                                    </div>
                                    {!shouldAutoRevealCompatibility && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCompatibilityChildren((current) => !current)}
                                            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
                                        >
                                            {showCompatibilityChildren ? compatibilityCopy.hideAction : compatibilityCopy.showAction}
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
                            {retirementOnly ? retirementCopy.title : setupCopy.title}
                        </h2>
                        <p className="text-text-secondary text-sm mt-1">
                            {retirementOnly
                                ? retirementCopy.subtitle
                                : setupCopy.subtitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isApplying}
                        className="p-2 hover:bg-input-bg rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {migration && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">{migration.title}</h3>
                                    <p className="mt-1 text-sm text-text-secondary">{migration.description}</p>
                                    {(migration.previewItems ?? []).length > 0 && (
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            {(migration.previewItems ?? []).map((item) => (
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
                                    onClick={migration.onAction}
                                    disabled={migration.actionPending}
                                    className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {migration.actionPending ? '...' : migration.actionLabel}
                                </button>
                            </div>
                        </div>
                    )}

                    {retirementOnly && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                            <h3 className="text-sm font-semibold text-text-primary">{retirementCopy.noticeTitle}</h3>
                            <p className="mt-2 text-sm text-text-secondary">
                                {retirementCopy.noticeBodyPrimary}
                            </p>
                            <p className="mt-2 text-sm text-text-secondary">
                                {retirementCopy.noticeBodySecondary}
                            </p>
                        </div>
                    )}

                    {/* Preferences Section */}
                    {!retirementOnly && (
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">{setupCopy.preferencesTitle}</h3>
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
                                        <span className="text-sm text-text-primary">{setupCopy.randomStrategy}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="strategy"
                                            checked={strategy === 'SEQUENTIAL'}
                                            onChange={() => handleStrategyChange('SEQUENTIAL')}
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                        />
                                        <span className="text-sm text-text-primary">{setupCopy.sequentialStrategy}</span>
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
                                        <span className="text-sm font-medium text-text-primary">{setupCopy.autoPilotTitle}</span>
                                        <p className="text-xs text-text-secondary">{setupCopy.autoPilotDescription}</p>
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
                                        <span className="text-sm font-medium text-text-primary">{setupCopy.strictModeTitle}</span>
                                        <p className="text-xs text-text-secondary">{setupCopy.strictModeDescription}</p>
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
                        onClick={() => {
                            void handleApply()
                        }}
                        disabled={isApplying}
                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-900/20"
                    >
                        {retirementOnly ? setupCopy.closeAction : isApplying ? setupCopy.savePending : setupCopy.doneAction}
                    </button>
                </div>
            </div>
            )</div>
    )
}
