import React, { useState } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useRuntimeCurriculumCatalog } from '../hooks/useRuntimeCurriculumCatalog'
import { CANONICAL_GYMNASIUM_ROOT_ID, isCompatibilityOnlyCurriculum } from '../utils/curriculumDisplay'
import {
    getGlobalStageScopeSelection,
    GLOBAL_STAGE_SCOPE_CONFIG_IDS,
    getGlobalStageScopeOptions,
    setGlobalStageScopeSelection,
    synchronizePersonalCurriculumStageScope,
} from '../utils/personalCurriculumStageScope'
import {
    getDurationModelOptions,
    getOfferedGymnasiumDurationModels,
    isGymnasiumSubjectOfferedForStageSelection,
    normalizeOfferedDurationModel,
    resolveCurriculumOfferingSource,
} from '../utils/durationModel'
import {
    formatJurisdictionScopedTitle,
    getDisplayCourseProfileFilters,
    getDisplayFiltersForSelection,
} from '../utils/filterLabels'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import { getPersonalCurriculumSetupCopy } from '../utils/curriculumSetupCopy'
import {
    PersonalCurriculumEditor,
} from './PersonalCurriculumEditor'
import type {
    PersonalCurriculumEditorProps,
} from './PersonalCurriculumEditor'

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
        durationModel?: string
        stage?: string
    }
}

interface PersonalCurriculumPreferences {
    strategy: 'RANDOM' | 'SEQUENTIAL'
    autoPilot: boolean
    followLearningPlans: boolean
    strictMode: boolean
    showGoalVisualizationsInChat: boolean
}

const isCompatibilityOnlyLandscape = (landscape: LandscapeSummary) =>
    isCompatibilityOnlyCurriculum(landscape.landscapeId, landscape.compatibilityOnly)

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
    onApply?: (config: PersonalCurriculumConfig, preferences: PersonalCurriculumPreferences) => Promise<void> | void
    onPreferencesApply?: (preferences: PersonalCurriculumPreferences) => Promise<void> | void
    initialConfig?: PersonalCurriculumConfig
    rootLandscapeId?: string
    initialStrategy?: 'RANDOM' | 'SEQUENTIAL'
    initialAutoPilot?: boolean
    initialFollowLearningPlans?: boolean
    initialStrictMode?: boolean
    initialShowGoalVisualizationsInChat?: boolean
    personalizationEditor?: PersonalCurriculumEditorProps
}

export const PersonalCurriculumSetup: React.FC<PersonalCurriculumSetupProps> = ({
    isOpen,
    onClose,
    availableLandscapes,
    currentLandscapeId,
    onApply,
    onPreferencesApply,
    initialConfig = {},
    rootLandscapeId,
    initialStrategy = 'SEQUENTIAL',
    initialAutoPilot = true,
    initialFollowLearningPlans = false,
    initialStrictMode = false,
    initialShowGoalVisualizationsInChat = true,
    personalizationEditor,
}) => {
    const { language } = useLanguage()
    const localizedLanguage = language === 'en' ? 'en' : 'de'
    const setupCopy = getPersonalCurriculumSetupCopy(localizedLanguage)
    const compatibilityCopy = setupCopy.compatibility
    const runtimeCatalogState = useRuntimeCurriculumCatalog()
    const offeringSource = React.useMemo(
        () => resolveCurriculumOfferingSource(runtimeCatalogState),
        [runtimeCatalogState],
    )
    const isScopedSetupRoot = rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID
        || (
            offeringSource.mode === 'catalog'
            && !!rootLandscapeId
            && offeringSource.catalog.rootLandscapeIds.includes(rootLandscapeId)
        )
    const catalogRootHasOfferings = offeringSource.mode === 'catalog'
        && !!rootLandscapeId
        && offeringSource.catalog.offerings.some((offering) => offering.landscapeId === rootLandscapeId)
    const computedInitial = React.useMemo(() => {
        const initial: PersonalCurriculumConfig = {}
        const hasExplicitInitialConfig = Object.keys(initialConfig).length > 0
        const hasSelectedInitialChild = availableLandscapes.some((landscape) =>
            landscape.landscapeId !== rootLandscapeId && initialConfig[landscape.landscapeId]?.selected === true
        )
        availableLandscapes.forEach((l) => {
            const existing = initialConfig[l.landscapeId]
            const defaultSelected = !hasExplicitInitialConfig
                || (l.landscapeId === rootLandscapeId && hasSelectedInitialChild)
            const defaultFilterId = l.filters && l.filters.length > 0 ? l.filters[0].id : undefined
            initial[l.landscapeId] = {
                selected: existing?.selected ?? defaultSelected,
                ...(existing?.filterId ? { filterId: existing.filterId } : defaultFilterId ? { filterId: defaultFilterId } : {}),
                ...(existing?.durationModel ? { durationModel: existing.durationModel } : {}),
                ...(existing?.stage ? { stage: existing.stage } : {}),
            }
        })
        Object.entries(initialConfig).forEach(([landscapeId, value]) => {
            if (!initial[landscapeId]) {
                initial[landscapeId] = value
            }
        })
        if (isScopedSetupRoot) {
            const stageScoped = synchronizePersonalCurriculumStageScope(initial, {
                rootLandscapeId,
            }).config
            if (rootLandscapeId) {
                const rootConfig = { ...stageScoped[rootLandscapeId] }
                stageScoped[rootLandscapeId] = {
                    ...rootConfig,
                    selected: rootConfig.selected ?? true,
                }
            }
            return stageScoped
        }
        return initial
    }, [availableLandscapes, initialConfig, isScopedSetupRoot, rootLandscapeId])

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
    const [followLearningPlans, setFollowLearningPlans] = useState<boolean>(initialFollowLearningPlans)
    const [strictMode, setStrictMode] = useState<boolean>(initialStrictMode)
    const [showGoalVisualizationsInChat, setShowGoalVisualizationsInChat] = useState<boolean>(
        initialShowGoalVisualizationsInChat,
    )
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

    React.useEffect(() => {
        setStrategy(initialStrategy)
        setAutoPilot(initialAutoPilot)
        setFollowLearningPlans(initialFollowLearningPlans)
        setStrictMode(initialStrictMode)
        setShowGoalVisualizationsInChat(initialShowGoalVisualizationsInChat)
    }, [
        initialAutoPilot,
        initialFollowLearningPlans,
        initialShowGoalVisualizationsInChat,
        initialStrategy,
        initialStrictMode,
        isOpen,
    ])

    const handleStrategyChange = (newStrategy: 'RANDOM' | 'SEQUENTIAL') => {
        setStrategy(newStrategy)
    }

    const handleAutoPilotChange = (newAutoPilot: boolean) => {
        setAutoPilot(newAutoPilot)
    }

    const handleFollowLearningPlansChange = (follow: boolean) => {
        setFollowLearningPlans(follow)
    }

    const handleStrictModeChange = (newStrictMode: boolean) => {
        setStrictMode(newStrictMode)
    }

    const handleShowGoalVisualizationsInChatChange = (show: boolean) => {
        setShowGoalVisualizationsInChat(show)
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

    const setDurationModel = (landscapeId: string, durationModel: string) => {
        const rootJurisdiction = rootLandscapeId ? config[rootLandscapeId]?.filterId : undefined
        const offeredDurationModels = getOfferedGymnasiumDurationModels(
            landscapeId,
            rootJurisdiction,
            offeringSource,
        )
        const normalizedDurationModel = normalizeOfferedDurationModel(durationModel, offeredDurationModels)
        if (!normalizedDurationModel) return
        setConfig(prev => ({
            ...prev,
            [landscapeId]: {
                ...prev[landscapeId],
                selected: prev[landscapeId]?.selected ?? true,
                durationModel: normalizedDurationModel,
            },
        }))
    }

    const normalizeDurationScopes = (draft: PersonalCurriculumConfig): PersonalCurriculumConfig => {
        if (!isScopedSetupRoot || !rootLandscapeId) {
            return draft
        }

        const stageSelection = getGlobalStageScopeSelection(draft, {
            rootLandscapeId,
        })
        const rootJurisdiction = draft[rootLandscapeId]?.filterId
        const hasJurisdictionScope = offeringSource.mode === 'catalog'
            ? Boolean(rootJurisdiction?.trim()) && offeringSource.catalog.offerings.some(
                (offering) => offering.scope.jurisdiction === rootJurisdiction?.trim(),
            )
            : normalizeJurisdictionCode(rootJurisdiction) !== null
        const shouldApplyDurationScope = stageSelection.sek1Selected
        const hasStageScope = stageSelection.sek1Selected || stageSelection.sek2Selected
        const shouldRestrictToOfferedContent = hasJurisdictionScope && hasStageScope
        const next: PersonalCurriculumConfig = { ...draft }
        const rootConfig = { ...next[rootLandscapeId] }
        next[rootLandscapeId] = {
            ...rootConfig,
            selected: rootConfig.selected ?? true,
        }

        Object.entries(next).forEach(([landscapeId, value]) => {
            if (
                (landscapeId === rootLandscapeId && !catalogRootHasOfferings)
                || landscapeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
                || landscapeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2
            ) {
                return
            }

            const offeredDurationModels = value.selected && shouldApplyDurationScope
                ? getOfferedGymnasiumDurationModels(landscapeId, rootJurisdiction, offeringSource)
                : []
            if (
                shouldRestrictToOfferedContent
                && value.selected
                && !isGymnasiumSubjectOfferedForStageSelection(
                    landscapeId,
                    rootJurisdiction,
                    stageSelection,
                    offeringSource,
                )
            ) {
                const withoutDurationModel = { ...value, selected: false }
                delete withoutDurationModel.durationModel
                next[landscapeId] = withoutDurationModel
                return
            }
            if (!shouldApplyDurationScope) {
                next[landscapeId] = value
                return
            }
            const normalizedDurationModel = normalizeOfferedDurationModel(
                value.durationModel ?? rootConfig.durationModel,
                offeredDurationModels,
            )
            if (normalizedDurationModel) {
                next[landscapeId] = {
                    ...value,
                    durationModel: normalizedDurationModel,
                }
                return
            }

            const withoutDurationModel = { ...value }
            delete withoutDurationModel.durationModel
            next[landscapeId] = withoutDurationModel
        })

        return next
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
            const currentSelection = getGlobalStageScopeSelection(prev, {
                rootLandscapeId,
            })
            const isCurrentlySelected = stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
                ? currentSelection.sek1Selected
                : currentSelection.sek2Selected
            const nextSelected = !isCurrentlySelected

            if (!nextSelected) {
                const wouldDisableLastStage =
                    (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1 && !currentSelection.sek2Selected)
                    || (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2 && !currentSelection.sek1Selected)
                if (wouldDisableLastStage) {
                    return prev
                }
            }

            return setGlobalStageScopeSelection(
                prev,
                {
                    sek1Selected: stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
                        ? nextSelected
                        : currentSelection.sek1Selected,
                    sek2Selected: stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2
                        ? nextSelected
                        : currentSelection.sek2Selected,
                },
                { rootLandscapeId },
            )
        })
    }

    const guidedSelectionOpen = Boolean(
        personalizationEditor?.plan
        && (
            personalizationEditor.plan.stage === 'SELECTION'
            || personalizationEditor.plan.stage === 'ROOT_FILTER'
            || personalizationEditor.plan.stage === 'DESCENDANT_FILTER'
        ),
    )
    const guidedCloseBlocked = Boolean(
        personalizationEditor
        && !personalizationEditor.error
        && (
            personalizationEditor.loading
            || personalizationEditor.busy
            || guidedSelectionOpen
        ),
    )

    const handleApply = async () => {
        if (personalizationEditor) {
            if (guidedCloseBlocked) return
            if (!onPreferencesApply) {
                onClose()
                return
            }
            setIsApplying(true)
            try {
                await onPreferencesApply({ strategy, autoPilot, followLearningPlans, strictMode, showGoalVisualizationsInChat })
                onClose()
            } finally {
                setIsApplying(false)
            }
            return
        }

        if (!onApply) {
            onClose()
            return
        }

        setIsApplying(true)
        try {
            await onApply(normalizeDurationScopes(config), {
                strategy,
                autoPilot,
                followLearningPlans,
                strictMode,
                showGoalVisualizationsInChat,
            })
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
    const globalStageSelection = getGlobalStageScopeSelection(config, {
        rootLandscapeId,
    })
    const rootJurisdiction = rootLandscapeId ? config[rootLandscapeId]?.filterId : undefined
    const shouldRestrictChildrenToOfferedContent =
        isScopedSetupRoot
        && (globalStageSelection.sek1Selected || globalStageSelection.sek2Selected)
        && (
            offeringSource.mode === 'catalog'
                ? Boolean(rootJurisdiction?.trim()) && offeringSource.catalog.offerings.some(
                    (offering) => offering.scope.jurisdiction === rootJurisdiction?.trim(),
                )
                : normalizeJurisdictionCode(rootJurisdiction) !== null
        )
    const displayedPrimaryChildrenLandscapes = shouldRestrictChildrenToOfferedContent
        ? primaryChildrenLandscapes.filter((landscape) =>
            isGymnasiumSubjectOfferedForStageSelection(
                landscape.landscapeId,
                rootJurisdiction,
                globalStageSelection,
                offeringSource,
            ),
        )
        : primaryChildrenLandscapes

    const renderNode = (landscape: LandscapeSummary, isRoot: boolean) => {
        const isSelected = config[landscape.landscapeId]?.selected ?? false
        const currentFilter = config[landscape.landscapeId]?.filterId ?? ''
        const globalStageSelection = getGlobalStageScopeSelection(config, {
            rootLandscapeId,
        })
        const shouldShowGlobalStageScope = isRoot && isScopedSetupRoot
        const rootJurisdiction = rootLandscapeId ? config[rootLandscapeId]?.filterId : undefined
        const durationScopeTarget = (!isRoot || catalogRootHasOfferings) && isScopedSetupRoot
        const offeredDurationModels = durationScopeTarget && globalStageSelection.sek1Selected && isSelected
            ? getOfferedGymnasiumDurationModels(landscape.landscapeId, rootJurisdiction, offeringSource)
            : []
        const durationModelOptions = getDurationModelOptions(localizedLanguage, offeredDurationModels)
        const shouldShowDurationModelControls = durationModelOptions.length > 0
        const currentDurationModel = normalizeOfferedDurationModel(
            config[landscape.landscapeId]?.durationModel
                ?? (isRoot || !rootLandscapeId ? undefined : config[rootLandscapeId]?.durationModel),
            offeredDurationModels,
        )
        const effectiveFilters = getDisplayCourseProfileFilters(landscape.filters, localizedLanguage)
        const displaysCanonicalCombinedProfile = effectiveFilters.some(filter => filter.id === 'GK+LK')
        const displayedCurrentFilter = displaysCanonicalCombinedProfile && currentFilter.trim().toUpperCase() === 'ALL'
            ? 'GK+LK'
            : currentFilter
        const displayFilters = isRoot
            ? getDisplayFiltersForSelection(effectiveFilters, localizedLanguage)
            : effectiveFilters
        const hasFilters = effectiveFilters.length > 0
        const showCourseProfileControls = isRoot
            ? true
            : !globalStageSelection.sek1Selected || globalStageSelection.sek2Selected
        const showFilterControls = Boolean(hasFilters) && showCourseProfileControls && (isRoot || isSelected)
        const showDetailControls = showFilterControls || shouldShowDurationModelControls
        const isExpandable = isRoot || showDetailControls
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

                {showDetailControls && isExpanded && (
                    <div className={`${isRoot ? 'ml-11 mt-2 mb-3 flex flex-col gap-1 rounded-lg border border-border-color bg-input-bg/40 p-3' : 'ml-11 flex flex-col gap-1 mt-1 mb-2 border-l-2 border-border-color pl-2'}`}>
                        {showFilterControls && isRoot && (
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                {setupCopy.rootFilterLabel}
                            </div>
                        )}
                        {showFilterControls && displayFilters.map(f => (
                            <label
                                key={f.id}
                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-input-bg/50 transition-colors ${displayedCurrentFilter === f.id ? 'text-sky-600 dark:text-sky-300' : 'text-text-secondary'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`filter-${landscape.landscapeId}`}
                                    checked={displayedCurrentFilter === f.id}
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
                                    const checked = option.id === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
                                        ? globalStageSelection.sek1Selected
                                        : globalStageSelection.sek2Selected
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
                        {shouldShowDurationModelControls && (
                            <>
                                <div className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    {setupCopy.durationModelLabel}
                                </div>
                                <p className="mb-2 text-xs text-text-secondary">
                                    {setupCopy.durationModelHint}
                                </p>
                                {durationModelOptions.map(option => (
                                    <label
                                        key={option.id}
                                        className={`flex items-start gap-2 p-1.5 rounded cursor-pointer hover:bg-input-bg/50 transition-colors ${currentDurationModel === option.id ? 'text-sky-600 dark:text-sky-300' : 'text-text-secondary'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`duration-${landscape.landscapeId}`}
                                            checked={currentDurationModel === option.id}
                                            onChange={() => setDurationModel(landscape.landscapeId, option.id)}
                                            className="mt-0.5 w-3.5 h-3.5 border-border-color bg-input-bg text-sky-500 focus:ring-sky-500 focus:ring-offset-sidebar-bg"
                                        />
                                        <span className="flex flex-col">
                                            <span className="text-sm font-medium">{option.label}</span>
                                            <span className="text-xs text-text-secondary">{option.description}</span>
                                        </span>
                                    </label>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Render Children if this is Root */}
                {isRoot && (
                    <div className="mt-3 space-y-4">
                        {displayedPrimaryChildrenLandscapes.length > 0 && (
                            <div className="grid gap-3 md:grid-cols-2">
                                {displayedPrimaryChildrenLandscapes.map(child => renderNode(child, false))}
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
                            {setupCopy.title}
                        </h2>
                        <p className="text-text-secondary text-sm mt-1">
                            {setupCopy.subtitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isApplying || guidedCloseBlocked}
                        className="p-2 hover:bg-input-bg rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {personalizationEditor && (
                        <div className="mb-6">
                            <PersonalCurriculumEditor {...personalizationEditor} />
                        </div>
                    )}

                    {/* Preferences Section */}
                    {(
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
                                        checked={followLearningPlans}
                                        onChange={(e) => handleFollowLearningPlansChange(e.target.checked)}
                                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-text-primary">{setupCopy.followLearningPlansTitle}</span>
                                        <p className="text-xs text-text-secondary">{setupCopy.followLearningPlansDescription}</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={autoPilot}
                                            disabled={followLearningPlans}
                                            onChange={(e) => handleAutoPilotChange(e.target.checked)}
                                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    />
                                    <div>
                                            <span className="text-sm font-medium text-text-primary">{setupCopy.autoPilotTitle}</span>
                                            <p className="text-xs text-text-secondary">{setupCopy.autoPilotDescription}</p>
                                            {followLearningPlans && (
                                                <p className="mt-1 text-xs font-medium text-sky-700 dark:text-sky-300" role="status">
                                                    {setupCopy.autoPilotPausedByPlan}
                                                </p>
                                            )}
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

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showGoalVisualizationsInChat}
                                        onChange={(e) => handleShowGoalVisualizationsInChatChange(e.target.checked)}
                                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-text-primary">
                                            {setupCopy.showGoalVisualizationsInChatTitle}
                                        </span>
                                        <p className="text-xs text-text-secondary">
                                            {setupCopy.showGoalVisualizationsInChatDescription}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {!personalizationEditor && (
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
                        disabled={isApplying || guidedCloseBlocked}
                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-900/20"
                    >
                        {isApplying ? setupCopy.savePending : setupCopy.doneAction}
                    </button>
                </div>
            </div>
            )</div>
    )
}
