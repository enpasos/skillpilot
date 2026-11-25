import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { CurriculumDropdown } from './CurriculumDropdown'
import { LearnerSetupStepCard } from './LearnerSetupStepCard'
import { ChatGptDesktopStart } from './ChatGptDesktopStart'
import { GeminiStart } from './GeminiStart'
import { PersonalCurriculumEditor } from './PersonalCurriculumEditor'
import { SkillpilotIdFilePasswordDialog } from './SkillpilotIdFilePasswordDialog'
import { LearnerDataManagementDialog } from './LearnerDataManagementDialog'
import { ThemeToggle } from './ThemeToggle'
import { ArrowRight, Check, Github, ShieldCheck, Send, Compass, ExternalLink, KeyRound, UserPlus, Bot, FileDown, FileUp, Database } from 'lucide-react'


type Role = 'learner' | 'trainer' | 'explorer'
type ClaudeActionState = 'idle' | 'opening-setup' | 'setup-opened' | 'launching' | 'launched' | 'fallback' | 'failed'
type CoachProvider = 'claude' | 'chatgpt-desktop' | 'gemini'
type SkillpilotIdFileStatus = 'idle' | 'loading' | 'loaded' | 'saved' | 'load-failed' | 'save-failed'

interface SessionSetupProps {
  role: Role | null
  setRole: (r: Role | null) => void
  skillpilotId: string
  setSkillpilotId: (id: string) => void
  onStart: (id: string, landscapeId?: string, role?: Role, goalId?: string) => void
}

import { useTranslation } from '../hooks/useTranslation'
import { LanguageToggle } from './LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { PublicLandingPanels } from './PublicLandingPanels'
import { PublicLandingFooter } from './PublicLandingFooter'
import { getLegalTermsCopy } from '../utils/legalTermsCopy'
import {
  acceptCurrentTerms,
  hasAcceptedCurrentTerms,
} from '../utils/legalTermsAcceptance'
import { confirmOpenAiMcpEligibility } from '../coachVariants/openAiMcp/providerEligibility'
import { requestOpenAiMcpStart } from '../coachVariants/openAiMcp/request'
import { requestGeminiV1Start } from '../coachVariants/geminiV1/request'
import { getGeminiV1Copy } from '../coachVariants/geminiV1/copy'
import {
  getSafeClaudePluginSetupUrl,
  getSafeClaudeWebUrl,
  requestClaudeLaunch,
  requestClaudePluginSetupStart,
} from '../utils/claudeCoach'
import { createSynchronousInFlightGuard } from '../utils/synchronousInFlightGuard'
import {
  decryptSkillpilotIdFileContent,
  encryptSkillpilotIdFileContent,
  MAX_SKILLPILOT_ID_FILE_SIZE,
  parseSkillpilotIdFileEnvelope,
  SKILLPILOT_ID_FILE_NAME,
} from '../utils/skillpilotIdFile'
import { sanitizeSkillpilotId } from '../utils/skillpilotId'
import {
  forgetRememberedSkillpilotId,
  isSkillpilotIdRemembered,
  readRememberedSkillpilotId,
  storeActiveSkillpilotId,
} from '../utils/skillpilotIdBrowserStorage'
import { readCompletionAssessmentStart } from '../utils/levelCompletionApi'
import {
  clearDeletedLearnerBrowserState,
  LearnerDataApiError,
  requestLearnerDeletion,
  requestLearnerResume,
  requestLearnerRetention,
  type LearnerRetentionStatus,
} from '../utils/learnerDataManagement'
import { getLearnerDataManagementCopy } from '../utils/learnerDataManagementCopy'
import { usePersonalCurriculumEditor } from '../hooks/usePersonalCurriculumEditor'
import {
  getLearnerPathToken,
  getLearnerSelectedLandscapeId,
  getStoredLandscapeIdForRole,
  normalizeLearnerLandscapeId,
} from '../utils/learnerProfile'
import { getLearnerSetupStepVisibility } from '../utils/sessionSetupStepVisibility'
import {
  formatSkillpilotIdSummary,
  getPersonalCurriculumSummaryItems,
  shouldCompactLoadedLearnerSetup,
  type SkillpilotIdSource,
} from '../utils/sessionSetupCompletionPresentation'
import type { CurriculumQualityFilter } from '../utils/curriculumQualityTrafficLight'

export const SessionSetup: React.FC<SessionSetupProps> = ({ role, setRole, skillpilotId, setSkillpilotId, onStart }) => {
  const t = useTranslation()
  const { language } = useLanguage()
  const legalCopy = getLegalTermsCopy(language === 'en' ? 'en' : 'de')
  const learnerDataManagementCopy = getLearnerDataManagementCopy(language === 'en' ? 'en' : 'de')
  const [selectedLandscapeId, setSelectedLandscapeId] = useState<string>(() => {
    return role === 'trainer' ? '' : getStoredLandscapeIdForRole(role)
  })
  const [persistedLearnerLandscapeId, setPersistedLearnerLandscapeId] = useState('')
  const [curriculumSaving, setCurriculumSaving] = useState(false)
  // The learning start offers at least machine-checked curricula; weaker ones need a deliberate choice.
  const [curriculumQualityFilter, setCurriculumQualityFilter] =
    useState<CurriculumQualityFilter>('machine_qa')
  const curriculumSelectionRequestRef = React.useRef(0)
  const learnerCheckRequestRef = React.useRef(0)
  const idAcquisitionRequestRef = React.useRef(0)
  const idAcquisitionInFlightRef = React.useRef(createSynchronousInFlightGuard())
  const learnerDeletionInFlightRef = React.useRef(createSynchronousInFlightGuard())
  const resetTransientSetupStateRef = React.useRef<(clearSkillpilotId?: boolean) => void>(() => undefined)
  const skillpilotIdFileInputRef = React.useRef<HTMLInputElement>(null)
  const curriculumStepRef = React.useRef<HTMLElement>(null)
  const curriculumSelectRef = React.useRef<HTMLSelectElement>(null)
  const restoreCurriculumSelectFocusRef = React.useRef(false)
  const advanceToCurriculumRef = React.useRef(false)
  const advanceToStartRef = React.useRef(false)
  const evaluatedCompletedSetupScopeRef = React.useRef('')
  // Use location (ensure import is added)
  const location = useLocation()
  const isCoachEntry = new URLSearchParams(location.search).get('start') === 'coach'
  const completionChoice = React.useMemo(() => {
    try { return { intent: readCompletionAssessmentStart(location.search), invalid: false } }
    catch { return { intent: null, invalid: true } }
  }, [location.search])
  const completionChoiceRequested = completionChoice.intent !== null || completionChoice.invalid
  const completionRouteRequested = completionChoiceRequested || new URLSearchParams(location.search).has('completionRoute')
  const coachEntryLearnerIdRef = React.useRef(
    isCoachEntry && role === 'learner' ? sanitizeSkillpilotId(skillpilotId) : '',
  )
  const coachStartStepRef = React.useRef<HTMLDivElement>(null)
  const [coachProvider, setCoachProvider] = useState<CoachProvider>(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('completionProfile') || params.has('completionGoal') || params.has('completionRevision') || params.has('completionRoute')) return 'claude'
    if (params.get('coach') === 'gemini') return 'gemini'
    return params.get('coach') === 'chatgpt-desktop' || params.get('chatgptTest') === '1'
      ? 'chatgpt-desktop' : 'claude'
  })
  React.useEffect(() => {
    if (completionRouteRequested && coachProvider !== 'claude') setCoachProvider('claude')
  }, [coachProvider, completionRouteRequested])

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const deepLinkCurriculum = params.get('curriculum') || params.get('landscape') || params.get('l')
    const pathToken = getLearnerPathToken(location.pathname)
    const deepLinkGoal = params.get('goal') || params.get('g') || pathToken

    if (
      role !== 'trainer'
      && deepLinkCurriculum
      && deepLinkCurriculum !== selectedLandscapeId
    ) {
      setSelectedLandscapeId(normalizeLearnerLandscapeId(deepLinkCurriculum))
    }
    if (deepLinkGoal && role !== 'learner') {
      setRole('learner')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])
  const [loading, setLoading] = useState(false)
  const [creatingNewId, setCreatingNewId] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCheckedId, setHasCheckedId] = useState(false)
  const [idStepComplete, setIdStepComplete] = useState(false)
  const [selectedCurriculumTitle, setSelectedCurriculumTitle] = useState('')
  const [setupChangedInVisit, setSetupChangedInVisit] = useState(false)
  const [compactCompletedSetupScope, setCompactCompletedSetupScope] = useState('')
  const [validatedLearnerId, setValidatedLearnerId] = useState('')
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false)
  const [learnerRetention, setLearnerRetention] = useState<LearnerRetentionStatus | null>(null)
  const [learnerRetentionLoading, setLearnerRetentionLoading] = useState(false)
  const [learnerRetentionError, setLearnerRetentionError] = useState<'missing' | 'failed' | null>(null)
  const [learnerDeleteBusy, setLearnerDeleteBusy] = useState(false)
  const [learnerDeleteError, setLearnerDeleteError] = useState<'missing' | 'failed' | null>(null)

  // Collapsible logic for Login form
  const [showLogin, setShowLogin] = useState(isCoachEntry);
  const [skillpilotIdFileStatus, setSkillpilotIdFileStatus] = useState<SkillpilotIdFileStatus>('idle')
  const [skillpilotIdFileDialogMode, setSkillpilotIdFileDialogMode] = useState<'save' | 'load' | null>(null)
  const [skillpilotIdFileDialogBusy, setSkillpilotIdFileDialogBusy] = useState(false)
  const [skillpilotIdFileDialogError, setSkillpilotIdFileDialogError] = useState('')
  const [pendingSkillpilotIdFile, setPendingSkillpilotIdFile] = useState<{
    name: string
    content: string
  } | null>(null)
  const [skillpilotIdSource, setSkillpilotIdSource] = useState<SkillpilotIdSource>(() => (
    sanitizeSkillpilotId(skillpilotId) ? 'existing' : null
  ))
  // The learner's own choice between "secure" (ID stays with this tab) and
  // "convenient" (this browser remembers it). An ID the browser already holds
  // starts as remembered; any other ID starts secure.
  const [rememberId, setRememberId] = useState(() => {
    try {
      return isSkillpilotIdRemembered(window.localStorage, skillpilotId)
    } catch {
      return false
    }
  })
  // The remembered ID that the learner start resumes without a further click.
  const [autoResumeLearnerId, setAutoResumeLearnerId] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(() => (
    hasAcceptedCurrentTerms(window.localStorage)
  ))
  const [termsChecked, setTermsChecked] = useState(false)
  const [termsStorageFailed, setTermsStorageFailed] = useState(false)
  const [claudeActionState, setClaudeActionState] = useState<ClaudeActionState>('idle')
  const [claudeInstallFallbackUrl, setClaudeInstallFallbackUrl] = useState<string | null>(null)
  const [completionLaunchFailed, setCompletionLaunchFailed] = useState(false)
  const claudeActionRequestRef = React.useRef(0)
  const claudeLaunchInFlightRef = React.useRef(createSynchronousInFlightGuard())
  const claudeActionLoading = claudeActionState === 'opening-setup'
    || claudeActionState === 'launching'
  const sanitizedLearnerId = sanitizeSkillpilotId(skillpilotId)
  const normalizedSelectedLearnerLandscapeId = normalizeLearnerLandscapeId(selectedLandscapeId)
  const personalCurriculumEditorEnabled =
    role === 'learner'
    && hasCheckedId
    && !!sanitizedLearnerId
    && validatedLearnerId === sanitizedLearnerId
    && !!normalizedSelectedLearnerLandscapeId
    && normalizedSelectedLearnerLandscapeId === persistedLearnerLandscapeId
    && !curriculumSaving
  const personalCurriculumEditor = usePersonalCurriculumEditor({
    skillpilotId: sanitizedLearnerId,
    enabled: personalCurriculumEditorEnabled,
  })
  const personalCurriculumReady =
    personalCurriculumEditorEnabled
    && personalCurriculumEditor.plan?.stage === 'COMPLETE'
    && !personalCurriculumEditor.error
    && !personalCurriculumEditor.loading
    && !personalCurriculumEditor.busy
  const coachLaunchScope = JSON.stringify([
    coachProvider, sanitizedLearnerId, normalizedSelectedLearnerLandscapeId,
    language, personalCurriculumReady, personalCurriculumEditor.plan?.completedDecisions,
    completionChoice,
    completionRouteRequested,
  ])
  const coachLaunchRevisionRef = React.useRef(0)
  React.useLayoutEffect(() => {
    coachLaunchRevisionRef.current += 1
    return () => { coachLaunchRevisionRef.current += 1 }
  }, [coachLaunchScope])

  const chooseCoachProvider = (provider: CoachProvider) => {
    if (completionRouteRequested && provider !== 'claude') return
    claudeActionRequestRef.current += 1
    setClaudeActionState('idle')
    setClaudeInstallFallbackUrl(null)
    setCoachProvider(provider)
  }
  const completedSetupScope = `${sanitizedLearnerId}\u0000${persistedLearnerLandscapeId}`
  const personalCurriculumSummaryItems = React.useMemo(
    () => getPersonalCurriculumSummaryItems(
      personalCurriculumEditor.plan,
      language === 'en' ? 'en' : 'de',
    ),
    [language, personalCurriculumEditor.plan],
  )
  // The collapsed step names every selected parameter instead of a count of hidden ones.
  const personalCurriculumSummary = personalCurriculumSummaryItems.length > 0
    ? personalCurriculumSummaryItems
    : [t.startPage.login.completedSetup.noAdditionalChoices]
  const compactCompletedSetup =
    personalCurriculumReady
    && compactCompletedSetupScope === completedSetupScope
    && !!selectedCurriculumTitle
  const learnerCockpitHref = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    const pathToken = getLearnerPathToken(location.pathname)
    const routeGoalId = pathToken && pathToken !== sanitizedLearnerId ? pathToken : ''
    const deepLinkGoal = params.get('goal') || params.get('g') || routeGoalId
    const path = deepLinkGoal ? `/learner/${encodeURIComponent(deepLinkGoal)}` : '/learner'
    const cockpitParams = new URLSearchParams()
    if (normalizedSelectedLearnerLandscapeId) {
      cockpitParams.set('l', normalizedSelectedLearnerLandscapeId)
    }
    const search = cockpitParams.toString()
    return `${path}${search ? `?${search}` : ''}`
  }, [
    location.pathname,
    location.search,
    normalizedSelectedLearnerLandscapeId,
    sanitizedLearnerId,
  ])
  const learnerSetupStepVisibility = getLearnerSetupStepVisibility({
    hasSkillpilotId: !!sanitizedLearnerId,
    idStepComplete,
    personalCurriculumEditorEnabled,
    personalCurriculumReady,
  })
  const idAcquisitionBusy =
    loading
    || skillpilotIdFileStatus === 'loading'
    || skillpilotIdFileDialogBusy
  const skillpilotIdSourceLabel = sanitizedLearnerId
    ? skillpilotIdSource === 'generated'
      ? t.startPage.login.idSourceGenerated
      : skillpilotIdSource === 'file'
        ? t.startPage.login.idSourceFile
        : t.startPage.login.idSourceExisting
    : ''

  React.useEffect(() => {
    if (
      !personalCurriculumEditorEnabled
      || personalCurriculumEditor.loading
      || personalCurriculumEditor.busy
      || !!personalCurriculumEditor.error
      || !personalCurriculumEditor.plan
      || evaluatedCompletedSetupScopeRef.current === completedSetupScope
    ) {
      return
    }
    evaluatedCompletedSetupScopeRef.current = completedSetupScope
    setCompactCompletedSetupScope(
      shouldCompactLoadedLearnerSetup({
        idSource: skillpilotIdSource,
        setupChangedInVisit,
        curriculumConfirmed: personalCurriculumEditorEnabled,
        plan: personalCurriculumEditor.plan,
        loading: personalCurriculumEditor.loading,
        busy: personalCurriculumEditor.busy,
        hasError: !!personalCurriculumEditor.error,
      })
        ? completedSetupScope
        : '',
    )
  }, [
    completedSetupScope,
    personalCurriculumEditor.busy,
    personalCurriculumEditor.error,
    personalCurriculumEditor.loading,
    personalCurriculumEditor.plan,
    personalCurriculumEditorEnabled,
    setupChangedInVisit,
    skillpilotIdSource,
  ])

  React.useEffect(() => {
    if (curriculumSaving || !restoreCurriculumSelectFocusRef.current) return
    restoreCurriculumSelectFocusRef.current = false
    curriculumSelectRef.current?.focus({ preventScroll: true })
  }, [curriculumSaving])

  const curriculumPanelCopy = React.useMemo(() => {
    if (role === 'trainer') {
      return {
        title: t.startPage.login.trainerCurriculumStepTitle,
        text: t.startPage.login.trainerCurriculumStepText,
        button: t.startPage.login.trainerDashboardButton,
        showStepNumber: false,
      }
    }
    if (role === 'explorer') {
      return {
        title: t.startPage.login.explorerCurriculumStepTitle,
        text: t.startPage.login.explorerCurriculumStepText,
        button: t.startPage.login.explorerDashboardButton,
        showStepNumber: false,
      }
    }
    return {
      title: t.startPage.login.curriculumStepTitle,
      text: t.startPage.login.curriculumStepText,
      button: t.startPage.login.dashboardButton,
      showStepNumber: true,
    }
  }, [role, t])

  const resetTransientSetupState = (clearSkillpilotId = false) => {
    curriculumSelectionRequestRef.current += 1
    learnerCheckRequestRef.current += 1
    idAcquisitionRequestRef.current += 1
    setError(null)
    setLoading(false)
    setCreatingNewId(false)
    setSelectedLandscapeId('')
    setPersistedLearnerLandscapeId('')
    setCurriculumSaving(false)
    setSelectedCurriculumTitle('')
    setSetupChangedInVisit(false)
    setCompactCompletedSetupScope('')
    evaluatedCompletedSetupScopeRef.current = ''
    setHasCheckedId(false)
    setIdStepComplete(false)
    setValidatedLearnerId('')
    setIsDataManagementOpen(false)
    setLearnerRetention(null)
    setLearnerRetentionLoading(false)
    setLearnerRetentionError(null)
    setLearnerDeleteBusy(false)
    setLearnerDeleteError(null)
    setClaudeActionState('idle')
    setClaudeInstallFallbackUrl(null)
    setSkillpilotIdFileStatus('idle')
    setSkillpilotIdFileDialogMode(null)
    setSkillpilotIdFileDialogBusy(false)
    setSkillpilotIdFileDialogError('')
    setPendingSkillpilotIdFile(null)
    advanceToCurriculumRef.current = false
    advanceToStartRef.current = false
    if (clearSkillpilotId) {
      setSkillpilotId('')
      setSkillpilotIdSource(null)
      setRememberId(false)
      setAutoResumeLearnerId('')
    }
  }
  resetTransientSetupStateRef.current = resetTransientSetupState

  // A newly entered ID starts secure unless this browser already remembers it.
  const applyRetentionDefaultFor = (nextId: string) => {
    try {
      setRememberId(isSkillpilotIdRemembered(window.localStorage, nextId))
    } catch {
      setRememberId(false)
    }
  }

  const chooseIdRetention = (remember: boolean) => {
    setRememberId(remember)
    if (remember || !sanitizedLearnerId) return
    try {
      // Choosing "secure" takes effect at once: the browser drops its copy.
      forgetRememberedSkillpilotId(window.localStorage, sanitizedLearnerId)
    } catch {
      // Blocked storage holds no remembered copy.
    }
  }

  const handleSkillpilotIdFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file || !idAcquisitionInFlightRef.current.tryStart()) return

    const acquisitionRequestId = idAcquisitionRequestRef.current + 1
    idAcquisitionRequestRef.current = acquisitionRequestId
    setSkillpilotIdFileStatus('loading')
    setError(null)
    try {
      if (file.size > MAX_SKILLPILOT_ID_FILE_SIZE) {
        throw new Error('invalid-skillpilot-id-file')
      }
      const content = await file.text()
      parseSkillpilotIdFileEnvelope(content)
      if (idAcquisitionRequestRef.current !== acquisitionRequestId) return

      setPendingSkillpilotIdFile({ name: file.name, content })
      setSkillpilotIdFileDialogError('')
      setSkillpilotIdFileDialogMode('load')
      setSkillpilotIdFileStatus('idle')
    } catch {
      if (idAcquisitionRequestRef.current === acquisitionRequestId) {
        setSkillpilotIdFileStatus('load-failed')
      }
    } finally {
      idAcquisitionInFlightRef.current.finish()
    }
  }

  const handleOpenSaveSkillpilotIdFileDialog = () => {
    const sanitizedId = sanitizeSkillpilotId(skillpilotId)
    if (!sanitizedId) return
    setSkillpilotIdFileDialogError('')
    setSkillpilotIdFileStatus('idle')
    setSkillpilotIdFileDialogMode('save')
  }

  const handleCloseSkillpilotIdFileDialog = () => {
    if (skillpilotIdFileDialogBusy) return
    setSkillpilotIdFileDialogMode(null)
    setSkillpilotIdFileDialogError('')
    setPendingSkillpilotIdFile(null)
  }

  const handleSkillpilotIdFilePasswordSubmit = async (password: string) => {
    if (!skillpilotIdFileDialogMode || !idAcquisitionInFlightRef.current.tryStart()) return
    const dialogMode = skillpilotIdFileDialogMode
    const acquisitionRequestId = idAcquisitionRequestRef.current + 1
    idAcquisitionRequestRef.current = acquisitionRequestId
    setSkillpilotIdFileDialogBusy(true)
    setSkillpilotIdFileDialogError('')
    try {
      if (dialogMode === 'save') {
        const sanitizedId = sanitizeSkillpilotId(skillpilotId)
        if (!sanitizedId) throw new Error('missing-skillpilot-id')
        const encryptedContent = await encryptSkillpilotIdFileContent(sanitizedId, password)
        if (idAcquisitionRequestRef.current !== acquisitionRequestId) return
        const blob = new Blob(
          [encryptedContent],
          { type: 'application/json;charset=utf-8' },
        )
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = SKILLPILOT_ID_FILE_NAME
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(downloadUrl)
        setSkillpilotIdFileStatus('saved')
        setSkillpilotIdFileDialogMode(null)
        return
      }

      if (!pendingSkillpilotIdFile) throw new Error('missing-skillpilot-id-file')
      const loadedId = await decryptSkillpilotIdFileContent(
        pendingSkillpilotIdFile.content,
        password,
      )
      if (idAcquisitionRequestRef.current !== acquisitionRequestId) return
      resetTransientSetupState()
      setSkillpilotId(loadedId)
      setSkillpilotIdSource('file')
      applyRetentionDefaultFor(sanitizeSkillpilotId(loadedId))
      setSkillpilotIdFileStatus('loaded')
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : ''
      if (message === 'browser-encryption-unavailable') {
        setSkillpilotIdFileDialogError(t.startPage.login.idFileEncryptionUnavailable)
      } else {
        setSkillpilotIdFileDialogError(
          dialogMode === 'load'
            ? t.startPage.login.idFileDecryptFailed
            : t.startPage.login.idFileSaveFailed,
        )
      }
    } finally {
      setSkillpilotIdFileDialogBusy(false)
      idAcquisitionInFlightRef.current.finish()
    }
  }


  const requestNewId = async () => {
    if (!idAcquisitionInFlightRef.current.tryStart()) return
    resetTransientSetupState()
    const acquisitionRequestId = idAcquisitionRequestRef.current + 1
    idAcquisitionRequestRef.current = acquisitionRequestId
    setLoading(true)
    setCreatingNewId(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners` : '/api/ui/learners'
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      if (idAcquisitionRequestRef.current !== acquisitionRequestId) return
      const id = data.state?.skillpilotId || data.skillpilotId || data.learnerId || data.id
      if (!id) throw new Error('Keine SkillPilot-ID im Response')
      const sanitizedId = sanitizeSkillpilotId(String(id))
      setSkillpilotId(sanitizedId)
      setSkillpilotIdSource('generated')
      setRememberId(false)
      setValidatedLearnerId(sanitizedId)

      // Every source fills the same field. The learner advances explicitly
      // through the shared button below, so step 2 never opens implicitly.
      setHasCheckedId(false)
    } catch (err) {
      if (idAcquisitionRequestRef.current === acquisitionRequestId) {
        setError((err as Error).message)
      }
    } finally {
      if (idAcquisitionRequestRef.current === acquisitionRequestId) {
        setLoading(false)
        setCreatingNewId(false)
      }
      idAcquisitionInFlightRef.current.finish()
    }
  }

  const checkLearner = React.useCallback(async (id: string, markActivity = false): Promise<boolean> => {
    const sanitizedId = sanitizeSkillpilotId(id)
    if (!sanitizedId) {
      curriculumSelectionRequestRef.current += 1
      learnerCheckRequestRef.current += 1
      setSelectedLandscapeId('')
      setPersistedLearnerLandscapeId('')
      setCurriculumSaving(false)
      setHasCheckedId(false)
      return false
    }
    setHasCheckedId(false)
    setLoading(true)
    setError(null)
    const requestId = learnerCheckRequestRef.current + 1
    learnerCheckRequestRef.current = requestId
    let checked = false
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      if (markActivity) {
        await requestLearnerResume(fetch, apiBase, sanitizedId)
        if (learnerCheckRequestRef.current !== requestId) return false
      }
      const url = apiBase ? `${apiBase}/api/ui/learners/${sanitizedId}` : `/api/ui/learners/${sanitizedId}`
      const res = await fetch(url)
      if (!res.ok) {
        throw new LearnerDataApiError(res.status, `learner-check-failed:${res.status}`)
      }
      const data = await res.json() as Record<string, unknown>
      if (learnerCheckRequestRef.current !== requestId) return false
      const learnerLandscapeId = getLearnerSelectedLandscapeId(data)
      if (learnerLandscapeId) {
        setSelectedLandscapeId(learnerLandscapeId)
        setPersistedLearnerLandscapeId(learnerLandscapeId)
        localStorage.setItem('skillpilot_learner_landscape', learnerLandscapeId)
      } else {
        setSelectedLandscapeId('')
        setPersistedLearnerLandscapeId('')
        localStorage.removeItem('skillpilot_learner_landscape')
      }
      checked = true
      setValidatedLearnerId(sanitizedId)
    } catch (caught) {
      if (learnerCheckRequestRef.current !== requestId) return false
      setPersistedLearnerLandscapeId('')
      setValidatedLearnerId('')
      if (caught instanceof LearnerDataApiError && caught.status === 404) {
        setError(t.startPage.login.idNotFound)
      } else if (
        caught instanceof LearnerDataApiError
        && caught.message.startsWith('learner-resume-failed:')
      ) {
        setError(t.startPage.login.resumeFailed)
      } else {
        setError(t.startPage.login.learnerCheckFailed)
      }
    } finally {
      if (learnerCheckRequestRef.current === requestId) {
        setHasCheckedId(checked)
        setLoading(false)
      }
    }
    return checked && learnerCheckRequestRef.current === requestId
  }, [t.startPage.login.idNotFound, t.startPage.login.learnerCheckFailed, t.startPage.login.resumeFailed])

  React.useEffect(() => {
    if (!isCoachEntry) return
    setRole('learner')
    setShowLogin(true)
  }, [isCoachEntry, setRole])

  React.useEffect(() => {
    // The Cockpit entry resumes only the profile that was already present.
    // Editing the ID returns to the ordinary explicit setup flow.
    // The same holds for the learner start with an ID this browser remembers.
    const resumesOnItsOwn = isCoachEntry
      ? sanitizedLearnerId === coachEntryLearnerIdRef.current
      : showLogin && sanitizedLearnerId === autoResumeLearnerId
    if (!resumesOnItsOwn || !termsAccepted || role !== 'learner' || !sanitizedLearnerId) return
    let cancelled = false
    setIdStepComplete(false)
    void checkLearner(sanitizedLearnerId, true).then((checked) => {
      if (!cancelled && checked) setIdStepComplete(true)
    })
    return () => {
      cancelled = true
      learnerCheckRequestRef.current += 1
    }
  }, [autoResumeLearnerId, checkLearner, isCoachEntry, role, sanitizedLearnerId, showLogin, termsAccepted])

  React.useEffect(() => {
    // "Convenient" applies as soon as the ID is confirmed, not only at the next start.
    if (role !== 'learner' || !rememberId || !sanitizedLearnerId
      || validatedLearnerId !== sanitizedLearnerId) return
    try {
      storeActiveSkillpilotId(window.localStorage, window.sessionStorage, sanitizedLearnerId, true)
    } catch {
      // Remembering is a convenience; the confirmed setup continues without it.
    }
  }, [rememberId, role, sanitizedLearnerId, validatedLearnerId])

  React.useEffect(() => {
    if (!isCoachEntry || !personalCurriculumReady || !compactCompletedSetup) return
    const frame = window.requestAnimationFrame(() => {
      coachStartStepRef.current?.scrollIntoView({ block: 'start' })
      coachStartStepRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [compactCompletedSetup, isCoachEntry, personalCurriculumReady])

  const persistLearnerStart = (effectiveId: string) => {
    const sanitizedId = sanitizeSkillpilotId(effectiveId)
    if (!sanitizedId) return ''

    try {
      storeActiveSkillpilotId(window.localStorage, window.sessionStorage, sanitizedId, rememberId)
    } catch {
      // Without browser storage no access can be handed to the Cockpit or a coach.
      return ''
    }
    localStorage.setItem('skillpilot_role', 'learner')
    try {
      sessionStorage.setItem('skillpilot_ui_session_id', globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
    } catch {
      // Session marker is only a browser-local convenience.
    }

    if (!selectedLandscapeId) return ''

    const normalizedLandscapeId = normalizeLearnerLandscapeId(selectedLandscapeId)
    if (!normalizedLandscapeId) return ''

    localStorage.setItem('skillpilot_learner_landscape', normalizedLandscapeId)
    return normalizedLandscapeId
  }

  const handleOpenLearnerCockpit = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!personalCurriculumReady || !persistLearnerStart(sanitizedLearnerId)) {
      event.preventDefault()
    }
  }

  const handleLearnerCurriculumSelect = async (landscapeId: string) => {
    const normalizedLandscapeId = normalizeLearnerLandscapeId(landscapeId)
    const sanitizedId = sanitizeSkillpilotId(skillpilotId)
    if (!normalizedLandscapeId || !sanitizedId) return

    setSelectedLandscapeId(normalizedLandscapeId)
    setError(null)
    if (normalizedLandscapeId === persistedLearnerLandscapeId) return

    setSetupChangedInVisit(true)
    setCompactCompletedSetupScope('')
    restoreCurriculumSelectFocusRef.current =
      document.activeElement === curriculumSelectRef.current

    const requestId = curriculumSelectionRequestRef.current + 1
    curriculumSelectionRequestRef.current = requestId
    setCurriculumSaving(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase
        ? `${apiBase}/api/ui/learners/${sanitizedId}/curriculum`
        : `/api/ui/learners/${sanitizedId}/curriculum`
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumId: normalizedLandscapeId }),
      })
      if (!response.ok) {
        throw new Error(`curriculum-save-failed:${response.status}`)
      }
      if (curriculumSelectionRequestRef.current !== requestId) return

      await checkLearner(sanitizedId)
    } catch {
      if (curriculumSelectionRequestRef.current !== requestId) return
      await checkLearner(sanitizedId)
      if (curriculumSelectionRequestRef.current !== requestId) return
      setError(t.startPage.login.curriculumSaveFailed)
    } finally {
      if (curriculumSelectionRequestRef.current === requestId) {
        setCurriculumSaving(false)
      }
    }
  }

  function startTrainerSession() {
    try {
      localStorage.removeItem('skillpilot_trainer_landscape')
    } catch {
      // The obsolete global trainer context must never block the local
      // course organization from opening.
    }
    setSelectedLandscapeId('')
    onStart('', '', 'trainer')
  }

  const handleAcceptTerms = () => {
    try {
      acceptCurrentTerms(window.localStorage)
      setTermsStorageFailed(false)
      setTermsAccepted(true)
      if (role === 'trainer') {
        startTrainerSession()
      }
    } catch {
      setTermsStorageFailed(true)
    }
  }

  const handlePersonalCurriculumPlanChanged = () => {
    setSetupChangedInVisit(true)
    setCompactCompletedSetupScope('')
  }

  const moveToCurriculumStep = React.useCallback(() => {
    const curriculumStep = curriculumStepRef.current
    if (!curriculumStep) return
    curriculumStep.scrollIntoView({ behavior: 'smooth', block: 'start' })
    curriculumStep.focus({ preventScroll: true })
  }, [])

  const handleContinueToCurriculum = async () => {
    const sanitizedId = sanitizeSkillpilotId(skillpilotId)
    if (!sanitizedId || idAcquisitionBusy) return
    if (idStepComplete && hasCheckedId) {
      moveToCurriculumStep()
      return
    }
    advanceToCurriculumRef.current = true
    advanceToStartRef.current = true
    const checked = await checkLearner(sanitizedId, true)
    if (!checked) {
      advanceToCurriculumRef.current = false
      advanceToStartRef.current = false
      return
    }
    setIdStepComplete(true)
  }

  const loadLearnerRetention = React.useCallback(async () => {
    if (!validatedLearnerId) return
    setLearnerRetentionLoading(true)
    setLearnerRetention(null)
    setLearnerRetentionError(null)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const retention = await requestLearnerRetention(fetch, apiBase, validatedLearnerId)
      setLearnerRetention(retention)
    } catch (caught) {
      setLearnerRetentionError(
        caught instanceof LearnerDataApiError && caught.status === 404
          ? 'missing'
          : 'failed',
      )
    } finally {
      setLearnerRetentionLoading(false)
    }
  }, [validatedLearnerId])

  React.useEffect(() => {
    if (!isDataManagementOpen) return
    void loadLearnerRetention()
  }, [isDataManagementOpen, loadLearnerRetention])

  const finishDeletedLearnerSetup = React.useCallback((learnerId: string) => {
    try {
      clearDeletedLearnerBrowserState(
        window.localStorage,
        window.sessionStorage,
        learnerId,
      )
    } catch (caught) {
      console.warn('Deleted learner browser cleanup was incomplete', caught)
    }
    resetTransientSetupStateRef.current(true)
    setRole(null)
    setShowLogin(false)
  }, [setRole])

  const handleLearnerDeletion = React.useCallback(async () => {
    const learnerId = validatedLearnerId
    if (!learnerId || !learnerDeletionInFlightRef.current.tryStart()) return
    setLearnerDeleteBusy(true)
    setLearnerDeleteError(null)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      await requestLearnerDeletion(fetch, apiBase, learnerId)
      finishDeletedLearnerSetup(learnerId)
    } catch (caught) {
      if (caught instanceof LearnerDataApiError && caught.status === 404) {
        finishDeletedLearnerSetup(learnerId)
        return
      }
      setLearnerDeleteError('failed')
    } finally {
      setLearnerDeleteBusy(false)
      learnerDeletionInFlightRef.current.finish()
    }
  }, [finishDeletedLearnerSetup, validatedLearnerId])

  React.useEffect(() => {
    if (!idStepComplete || !hasCheckedId || !advanceToCurriculumRef.current) return
    advanceToCurriculumRef.current = false
    const frame = window.requestAnimationFrame(moveToCurriculumStep)
    return () => window.cancelAnimationFrame(frame)
  }, [hasCheckedId, idStepComplete, moveToCurriculumStep])

  React.useEffect(() => {
    // A returning learner whose setup is already complete continues at the
    // start step. Scroll only as far as needed so the confirmed steps stay
    // visible above it.
    if (isCoachEntry || !compactCompletedSetup || !advanceToStartRef.current) return
    advanceToStartRef.current = false
    const frame = window.requestAnimationFrame(() => {
      coachStartStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      coachStartStepRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [compactCompletedSetup, isCoachEntry])

  const prepareChatGptDesktopStart = async () => {
    if (coachProvider !== 'chatgpt-desktop' || !personalCurriculumReady) return null
    if (completionRouteRequested) return null
    const effectiveId = sanitizeSkillpilotId(skillpilotId)
    const eligibilityLanguage = language.startsWith('en') ? 'en' : 'de'
    if (!effectiveId || !confirmOpenAiMcpEligibility(eligibilityLanguage, effectiveId)) return null
    const curriculum = persistLearnerStart(effectiveId)
    if (!curriculum) return null
    return requestOpenAiMcpStart({
      skillpilotId: effectiveId,
      language,
      selectedCurriculum: curriculum,
      client: 'chatgpt-desktop-beta',
      providerEligibilityConfirmed: true,
    })
  }

  const prepareGeminiStart = async () => {
    if (coachProvider !== 'gemini' || !personalCurriculumReady) return null
    if (completionRouteRequested) return null
    const effectiveId = sanitizeSkillpilotId(skillpilotId)
    if (!effectiveId || !persistLearnerStart(effectiveId)) return null
    const launchRevision = coachLaunchRevisionRef.current
    const result = await requestGeminiV1Start({ skillpilotId: effectiveId, language })
    return coachLaunchRevisionRef.current === launchRevision ? result : null
  }

  const getClaudeStartContext = () => {
    if (coachProvider !== 'claude' || !personalCurriculumReady) return null
    if (completionChoice.invalid) return null
    const effectiveId = sanitizeSkillpilotId(skillpilotId)
    if (!effectiveId) return null
    const normalizedLandscapeId = persistLearnerStart(effectiveId)
    if (!normalizedLandscapeId) return null
    return { effectiveId, normalizedLandscapeId, launchRevision: coachLaunchRevisionRef.current }
  }

  const handleOpenClaudePluginSetup = async () => {
    const context = getClaudeStartContext()
    if (!context) return
    const requestVersion = ++claudeActionRequestRef.current

    const setupWindow = window.open('', '_blank')
    setClaudeActionState('opening-setup')
    setClaudeInstallFallbackUrl(null)
    try {
      const result = await requestClaudePluginSetupStart({
        skillpilotId: context.effectiveId,
        language,
        selectedCurriculum: context.normalizedLandscapeId,
        client: 'web-start',
      })
      if (coachLaunchRevisionRef.current !== context.launchRevision
        || claudeActionRequestRef.current !== requestVersion) {
        setupWindow?.close()
        if (claudeActionRequestRef.current === requestVersion) setClaudeActionState('idle')
        return
      }

      const setupUrl = getSafeClaudePluginSetupUrl(result.setupUrl)
      if (!setupUrl) {
        throw new Error('Invalid Claude plugin setup URL')
      }

      if (setupWindow) {
        setupWindow.opener = null
        setupWindow.location.href = setupUrl
        setClaudeActionState('setup-opened')
        return
      }

      const openedWindow = window.open(setupUrl, '_blank', 'noopener,noreferrer')
      if (openedWindow) {
        setClaudeActionState('setup-opened')
      } else {
        setClaudeInstallFallbackUrl(setupUrl)
        setClaudeActionState('fallback')
      }
    } catch {
      setupWindow?.close()
      if (claudeActionRequestRef.current === requestVersion) {
        setClaudeActionState(coachLaunchRevisionRef.current === context.launchRevision ? 'failed' : 'idle')
      }
    }
  }

  const handleLaunchClaude = async () => {
    const context = getClaudeStartContext()
    if (!context) return
    const launchGuard = claudeLaunchInFlightRef.current
    if (!launchGuard.tryStart()) return
    const requestVersion = ++claudeActionRequestRef.current

    setClaudeActionState('launching')
    setCompletionLaunchFailed(false)
    setClaudeInstallFallbackUrl(null)
    const claudeWindow = window.open('', '_blank')
    if (!claudeWindow) {
      setClaudeActionState('failed')
      launchGuard.finish()
      return
    }
    try {
      const result = await requestClaudeLaunch({
        skillpilotId: context.effectiveId,
        language,
        selectedCurriculum: context.normalizedLandscapeId,
        client: 'web-start',
        completionAssessment: completionChoice.intent ?? undefined,
      })
      if (coachLaunchRevisionRef.current !== context.launchRevision
        || claudeActionRequestRef.current !== requestVersion) {
        claudeWindow.close()
        if (claudeActionRequestRef.current === requestVersion) setClaudeActionState('idle')
        return
      }
      const webUrl = getSafeClaudeWebUrl(result.webUrl)
      if (!webUrl) throw new Error('Invalid Claude Web launch URL')

      claudeWindow.opener = null
      claudeWindow.location.href = webUrl
      setClaudeActionState('launched')
    } catch {
      claudeWindow?.close()
      if (completionChoiceRequested) setCompletionLaunchFailed(true)
      if (claudeActionRequestRef.current === requestVersion) {
        setClaudeActionState(coachLaunchRevisionRef.current === context.launchRevision ? 'failed' : 'idle')
      }
    } finally {
      launchGuard.finish()
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!termsAccepted) return
    if (role === 'learner' && !sanitizeSkillpilotId(skillpilotId)) return
    if (role === 'learner' && !personalCurriculumReady) return

    const effectiveId = role === 'learner' ? sanitizeSkillpilotId(skillpilotId) : ''

    if (role === 'learner') {
      persistLearnerStart(effectiveId)
    }

    if (role === 'trainer') {
      startTrainerSession()
      return
    }

    onStart(effectiveId, selectedLandscapeId, role || undefined)
  }

  // Restore persisted selection when the role changes.
  React.useEffect(() => {
    if (role === 'trainer') {
      try {
        localStorage.removeItem('skillpilot_trainer_landscape')
      } catch {
        // Browser storage is only a convenience for the local trainer view.
      }
      setSelectedLandscapeId('')
    } else if (role === 'learner') {
      setSelectedLandscapeId(getStoredLandscapeIdForRole(role))
    } else if (role === 'explorer') {
      setSelectedLandscapeId('')
    }
  }, [role])

  const openLearnerStart = () => {
    setRole('learner')
    let rememberedId = ''
    try {
      rememberedId = readRememberedSkillpilotId(window.localStorage)
    } catch {
      // Blocked storage holds no remembered ID.
    }
    if (rememberedId) {
      // Only an ID the learner let this browser remember returns on its own
      // and continues without a further click.
      resetTransientSetupState()
      setSkillpilotId(rememberedId)
      setSkillpilotIdSource('existing')
      setRememberId(true)
      setAutoResumeLearnerId(rememberedId)
      advanceToStartRef.current = true
    } else {
      resetTransientSetupState(role !== 'learner' || !sanitizedLearnerId)
      setRememberId(false)
      setAutoResumeLearnerId('')
    }
    setShowLogin(true)
  }

  const openTrainerStart = () => {
    setRole('trainer')
    resetTransientSetupState(true)
    if (termsAccepted) {
      startTrainerSession()
      return
    }
    setShowLogin(true)
  }

  const openRoleStart = (nextRole: Extract<Role, 'explorer'>) => {
    setRole(nextRole)
    resetTransientSetupState(true)
    setShowLogin(true)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center text-text-primary transition-colors relative ${showLogin ? 'bg-chat-bg px-6 py-10' : 'public-landing-page px-4 py-5 sm:px-8 lg:px-10'}`}>
      <div className={`w-full flex justify-between items-center mb-6 ${showLogin ? '' : 'gap-2 max-w-[1440px]'}`}>
        {showLogin ? <div /> : (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <Send size={30} strokeWidth={2} className="h-6 w-6 sm:h-[30px] sm:w-[30px] text-amber-500" aria-hidden="true" />
            <h1 className="text-lg min-[360px]:text-xl sm:text-2xl font-bold tracking-tight text-text-primary">SkillPilot</h1>
          </div>
        )}
        <div className={`flex items-center ${showLogin ? 'gap-4' : 'gap-2 sm:gap-4'}`}>
          <a
            href="https://github.com/enpasos/skillpilot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
            title="SkillPilot on GitHub"
          >
            <Github size={20} />
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className={`flex-grow flex flex-col items-center w-full ${showLogin ? 'justify-center max-w-2xl' : 'max-w-[1440px]'}`}>
        {/* 0. Logo & Title */}
        {showLogin && <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-amber-500">
              <Send size={48} strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
              SkillPilot
            </h1>
          </div>
        </div>}

        <div className="w-full space-y-5">
          {!showLogin ? (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <PublicLandingPanels
                language={language === 'en' ? 'en' : 'de'}
                accessBanner={t.startPage.banner}
                onStartLearning={openLearnerStart}
                onOpenCoursePlanning={openTrainerStart}
                onExploreSkillGraph={() => openRoleStart('explorer')}
              />
            </div>
          ) : ( // ACTUAL MATCH TARGET BELOW
            <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetTransientSetupState(true)
                      setShowLogin(false)
                      setRole(null)
                    }}
                    className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors hover:-translate-x-1 duration-200"
                  >
                    <ArrowRight className="rotate-180 mr-1" size={16} /> {t.startPage.login.back}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* For Learner: No Role Selection Cards needed here anymore, we are already in Learner mode */}

                  {/* Secondary Roles Access (Only visible if we explicitly want to switch) */}
                  {/* Secondary Roles Access removed as per user request */}
                </div>

                {!termsAccepted && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="mt-1 shrink-0 text-amber-600 dark:text-amber-300" />
                      <div className="min-w-0">
                        <div className="prose prose-sm max-w-none text-amber-950 dark:prose-invert dark:text-amber-100">
                          <ReactMarkdown>{legalCopy.summary}</ReactMarkdown>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed">
                          {legalCopy.detailsPrefix}
                          <Link to="/legal" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline dark:text-sky-300">
                            {legalCopy.detailsLinkLabel}
                          </Link>
                          {legalCopy.detailsSuffix}
                        </p>
                        <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs font-semibold">
                          <input
                            type="checkbox"
                            checked={termsChecked}
                            onChange={event => setTermsChecked(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-amber-300 accent-sky-600"
                          />
                          <span>{legalCopy.acceptanceLabel}</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAcceptTerms}
                          disabled={!termsChecked}
                          className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
                        >
                          {legalCopy.confirmButton}
                        </button>
                        {termsStorageFailed && (
                          <p role="alert" className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                            {legalCopy.storageError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {termsAccepted && role === 'learner' && (
                  <LearnerSetupStepCard
                    stepNumber={1}
                    stepLabel={t.startPage.login.completedSetup.step}
                    title={t.startPage.login.loginTitle}
                    description={t.startPage.login.loginText}
                    compact={compactCompletedSetup}
                    summaryLabel={t.startPage.login.completedSetup.confirmed}
                    summaryItems={[
                      formatSkillpilotIdSummary(sanitizedLearnerId),
                      rememberId
                        ? t.startPage.login.idRetention.convenientSummary
                        : t.startPage.login.idRetention.secureSummary,
                    ]}
                    changeLabel={t.startPage.login.completedSetup.change}
                    closeLabel={t.startPage.login.completedSetup.close}
                  >
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="skillpilotIdInput" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                          <KeyRound size={16} className="text-sky-600 dark:text-sky-300" />
                          {t.startPage.login.directIdTitle}
                        </label>
                        <input
                          id="skillpilotIdInput"
                          type="text"
                          value={skillpilotId}
                          onChange={(event) => {
                            const nextId = sanitizeSkillpilotId(event.target.value)
                            resetTransientSetupState()
                            setSkillpilotId(nextId)
                            setSkillpilotIdSource(nextId ? 'existing' : null)
                            applyRetentionDefaultFor(nextId)
                          }}
                          disabled={idAcquisitionBusy}
                          className="mt-2 min-h-12 w-full rounded-lg border-2 border-sky-400 bg-white px-3 py-2 text-base font-mono text-text-primary shadow-sm transition-colors focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-wait disabled:opacity-70 dark:border-sky-500 dark:bg-slate-950"
                          placeholder={t.startPage.login.idLabel}
                          required
                        />
                        {/* One line below the field: guidance while it is empty, its status once filled. */}
                        {sanitizedLearnerId ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            {skillpilotIdSourceLabel && (
                              <span className="inline-flex rounded-full bg-sky-100 px-2 py-1 font-semibold text-sky-800 dark:bg-sky-900/50 dark:text-sky-100">
                                {skillpilotIdSourceLabel}
                              </span>
                            )}
                            {hasCheckedId && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                <Check size={12} strokeWidth={3} aria-hidden="true" />
                                {t.startPage.login.idConfirmed}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                            {t.startPage.login.idFieldHint}
                          </p>
                        )}
                        {skillpilotIdSource === 'generated' && sanitizedLearnerId && (
                          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                              {t.startPage.login.idWarning}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                              {t.startPage.login.idFileHint}
                            </p>
                            <button
                              type="button"
                              onClick={handleOpenSaveSkillpilotIdFileDialog}
                              disabled={idAcquisitionBusy}
                              className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-amber-400 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-amber-100 dark:hover:bg-amber-950/50"
                            >
                              <FileDown size={15} />
                              {t.startPage.login.saveIdToFile}
                            </button>
                          </div>
                        )}
                        {sanitizedLearnerId && (
                          <fieldset data-testid="skillpilot-id-retention" className="mt-3">
                            <legend className="text-xs font-semibold text-text-primary">
                              {t.startPage.login.idRetention.question}
                            </legend>
                            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                              {([
                                [false, t.startPage.login.idRetention.secureTitle, t.startPage.login.idRetention.secureText],
                                [true, t.startPage.login.idRetention.convenientTitle, t.startPage.login.idRetention.convenientText],
                              ] as const).map(([remember, title, text]) => (
                                <label key={title} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${rememberId === remember ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500 dark:bg-sky-950/30' : 'border-border-color hover:border-sky-300'}`}>
                                  <input type="radio" name="skillpilot-id-retention"
                                    checked={rememberId === remember}
                                    disabled={idAcquisitionBusy}
                                    onChange={() => chooseIdRetention(remember)}
                                    className="mt-1 shrink-0 accent-sky-600" />
                                  <span className="min-w-0">
                                    <span className="block font-semibold text-text-primary">{title}</span>
                                    <span className="block text-[11px] leading-snug text-text-secondary">{text}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </fieldset>
                        )}
                        {sanitizedLearnerId && (
                          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
                            {skillpilotIdSource !== 'generated' && (
                              <button
                                type="button"
                                onClick={handleOpenSaveSkillpilotIdFileDialog}
                                disabled={idAcquisitionBusy}
                                title={t.startPage.login.idFileHint}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-sky-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sky-300"
                              >
                                <FileDown size={14} />
                                {t.startPage.login.saveIdToFile}
                              </button>
                            )}
                            {validatedLearnerId === sanitizedLearnerId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLearnerDeleteError(null)
                                  setIsDataManagementOpen(true)
                                }}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded text-xs font-semibold text-sky-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300"
                              >
                                <Database size={14} />
                                {learnerDataManagementCopy.openAction}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <input
                        ref={skillpilotIdFileInputRef}
                        type="file"
                        accept=".skillpilot,application/json"
                        onChange={handleSkillpilotIdFileChange}
                        className="hidden"
                        aria-label={t.startPage.login.loadIdFromFile}
                      />

                      <div className="grid gap-3 border-t border-border-color pt-4 sm:grid-cols-2">
                        <div className="flex flex-col">
                          <p className="text-xs font-semibold text-text-secondary">
                            {t.startPage.login.fileLoginTitle}
                          </p>
                          <button
                            type="button"
                            onClick={() => skillpilotIdFileInputRef.current?.click()}
                            disabled={idAcquisitionBusy}
                            className="mt-1.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/40"
                          >
                            <FileUp size={15} />
                            {skillpilotIdFileStatus === 'loading'
                              ? t.startPage.login.loadingIdFromFile
                              : t.startPage.login.loadIdFromFile}
                          </button>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs font-semibold text-text-secondary">
                            {t.startPage.login.newLoginTitle}
                          </p>
                          <button
                            type="button"
                            onClick={requestNewId}
                            disabled={!termsAccepted || idAcquisitionBusy}
                            className="mt-1.5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/40"
                          >
                            <UserPlus size={15} />
                            {creatingNewId ? t.startPage.login.creatingNewId : t.startPage.login.requestNewId}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div aria-live="polite" className="[&:not(:empty)]:mb-3">
                          {skillpilotIdFileStatus === 'loaded' && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {t.startPage.login.idFileLoaded}
                            </p>
                          )}
                          {skillpilotIdFileStatus === 'saved' && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {t.startPage.login.idFileSaved}
                            </p>
                          )}
                          {skillpilotIdFileStatus === 'load-failed' && (
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                              {t.startPage.login.idFileLoadFailed}
                            </p>
                          )}
                          {skillpilotIdFileStatus === 'save-failed' && (
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                              {t.startPage.login.idFileSaveFailed}
                            </p>
                          )}
                          {error && (
                            <span className="block text-xs font-semibold text-rose-600 dark:text-rose-300">
                              {error}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleContinueToCurriculum}
                          disabled={!termsAccepted || !sanitizedLearnerId || idAcquisitionBusy}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
                        >
                          {loading && !creatingNewId ? t.startPage.login.checking : t.startPage.login.checkButton}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </LearnerSetupStepCard>
                )}

                {termsAccepted && role && role !== 'trainer' && (role !== 'learner' || learnerSetupStepVisibility.curriculum) && (
                  <LearnerSetupStepCard
                    ref={curriculumStepRef}
                    stepNumber={curriculumPanelCopy.showStepNumber ? 2 : undefined}
                    stepLabel={t.startPage.login.completedSetup.step}
                    title={curriculumPanelCopy.title}
                    description={curriculumPanelCopy.text}
                    compact={role === 'learner' && compactCompletedSetup}
                    summaryLabel={t.startPage.login.completedSetup.selected}
                    summaryItems={[selectedCurriculumTitle]}
                    changeLabel={t.startPage.login.completedSetup.change}
                    closeLabel={t.startPage.login.completedSetup.close}
                  >
                    <label
                      htmlFor="sessionCurriculumSelect"
                      className="text-[11px] text-text-secondary block mb-1"
                    >
                      {role === 'learner' && selectedLandscapeId ? t.startPage.login.curriculumLabel.yours : t.startPage.login.curriculumLabel.select}
                    </label>
                    <CurriculumDropdown
                      selectId="sessionCurriculumSelect"
                      selectRef={curriculumSelectRef}
                      currentLandscapeId={selectedLandscapeId}
                      onSelect={role === 'learner' ? handleLearnerCurriculumSelect : setSelectedLandscapeId}
                      onSelectedTitleChange={setSelectedCurriculumTitle}
                      qualityFilter={curriculumQualityFilter}
                      onQualityFilterChange={setCurriculumQualityFilter}
                      disabled={role === 'learner' && curriculumSaving}
                      showCompatibilityViews={false}
                      showQualityFilter
                    />
                    {role === 'learner' && curriculumSaving && (
                      <p className="mt-2 text-xs text-text-secondary" role="status">
                        {t.startPage.login.curriculumSaving}
                      </p>
                    )}

                    {role !== 'learner' && (
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={!selectedLandscapeId}
                          className="w-full rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 hover:border-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {curriculumPanelCopy.button}
                        </button>
                      </div>
                    )}
                  </LearnerSetupStepCard>
                )}

                {termsAccepted && role === 'learner' && learnerSetupStepVisibility.personalCurriculum && (
                  <LearnerSetupStepCard
                    stepNumber={3}
                    stepLabel={t.startPage.login.completedSetup.step}
                    title={t.startPage.login.personalCurriculumStepTitle}
                    description={t.startPage.login.personalCurriculumStepText}
                    compact={compactCompletedSetup}
                    summaryLabel={t.startPage.login.completedSetup.configured}
                    summaryItems={personalCurriculumSummary}
                    changeLabel={t.startPage.login.completedSetup.change}
                    closeLabel={t.startPage.login.completedSetup.close}
                  >
                    <PersonalCurriculumEditor
                      {...personalCurriculumEditor}
                      qualityFilter={curriculumQualityFilter}
                      onPlanChanged={handlePersonalCurriculumPlanChanged}
                    />
                  </LearnerSetupStepCard>
                )}

                {termsAccepted && role === 'learner' && learnerSetupStepVisibility.start && (
                  <div ref={coachStartStepRef} tabIndex={-1} className="scroll-mt-4 rounded-xl border border-border-color bg-white/70 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-slate-900/50">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                        4
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-primary">{t.startPage.login.startStepTitle}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                          {t.startPage.login.startStepText}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <fieldset data-testid="coach-provider-choice" className="space-y-2">
                        <legend className="text-sm font-semibold text-text-primary">
                          <span className="inline-flex items-center gap-2">
                            {t.startPage.login.coachProviderLabel}
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              {t.startPage.login.claudeBetaBadge}
                            </span>
                          </span>
                        </legend>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {([
                            ['claude', t.startPage.login.claudeBetaTitle, t.startPage.login.coachProviderCaptions.claude],
                            ['chatgpt-desktop', t.startPage.login.chatGptDesktop.title, t.startPage.login.coachProviderCaptions.chatGptDesktop],
                            ['gemini', getGeminiV1Copy(language).title, t.startPage.login.coachProviderCaptions.gemini],
                          ] as const).map(([provider, title, caption]) => {
                            const providerDisabled = completionRouteRequested && provider !== 'claude'
                            return (
                              <label key={provider} className={`flex min-h-11 items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${coachProvider === provider ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500 dark:bg-sky-950/30' : 'border-border-color hover:border-sky-300'} ${providerDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input type="radio" name="coach-provider" value={provider}
                                  checked={coachProvider === provider}
                                  disabled={providerDisabled}
                                  onChange={() => chooseCoachProvider(provider)}
                                  className="mt-1 shrink-0 accent-sky-600" />
                                <span className="min-w-0">
                                  <span className="block font-semibold text-text-primary">{title}</span>
                                  <span className="block text-[11px] leading-snug text-text-secondary">{caption}</span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                      {completionRouteRequested ? (
                        <p data-testid="completion-assessment-launch-notice" role={completionChoice.invalid || completionLaunchFailed ? 'alert' : 'status'} className="rounded-xl border border-sky-300 p-3 text-sm text-text-secondary dark:border-sky-900/60">
                          {completionChoice.invalid || completionLaunchFailed
                            ? (language === 'en'
                              ? 'This assessment choice could not be confirmed. Return to the Cockpit, reload your current state and select the assessment again.'
                              : 'Diese Prüfungsauswahl konnte nicht bestätigt werden. Kehre ins Cockpit zurück, lade den aktuellen Stand und wähle die Prüfung erneut.')
                            : completionChoiceRequested
                              ? (language === 'en'
                                ? 'You are starting the selected assessment directly. This learning route currently supports Claude. Your assessment starts only after you choose to start learning.'
                                : 'Du startest die gewählte Prüfung direkt. Dieser Lernweg unterstützt derzeit Claude. Deine Prüfung beginnt erst, wenn du Lernen starten wählst.')
                              : (language === 'en'
                                ? 'You are working on completing your selected learning section. This learning route currently supports Claude.'
                                : 'Du arbeitest am Abschluss deines gewählten Lernabschnitts. Dieser Lernweg unterstützt derzeit Claude.')}
                        </p>
                      ) : null}
                      {coachProvider === 'claude' && (
                      <div
                        data-testid="claude-v1-start-options"
                        className="space-y-2.5 rounded-xl border border-sky-300 bg-sky-50/70 p-3 dark:border-sky-700 dark:bg-sky-950/20"
                      >
                          <div>
                            {/* The one-time setup stays first; the everyday start is the one primary action. */}
                            <ol
                              data-testid="claude-plugin-setup-guide"
                              aria-label={t.startPage.login.claudeSetupTitle}
                              className="space-y-2.5"
                            >
                              <li
                                data-testid="claude-plugin-setup-step-1"
                                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5"
                              >
                                <p className="min-w-0 flex-1 basis-56 text-xs leading-relaxed text-text-secondary">
                                  <span className="font-semibold text-text-primary">
                                    {t.startPage.login.claudeSetupStepOneTitle}
                                  </span>
                                  {' '}
                                  {t.startPage.login.claudeSetupStepOne}
                                </p>
                                <button
                                  data-testid="claude-plugin-setup-open"
                                  type="button"
                                  onClick={handleOpenClaudePluginSetup}
                                  disabled={!personalCurriculumReady || claudeActionLoading}
                                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/40"
                                >
                                  <KeyRound size={14} />
                                  {claudeActionState === 'opening-setup'
                                    ? t.startPage.login.claudeConnecting
                                    : t.startPage.login.claudeConnect}
                                </button>
                              </li>
                              <li data-testid="claude-plugin-setup-step-2">
                                <button
                                  data-testid="claude-plugin-start"
                                  type="button"
                                  onClick={handleLaunchClaude}
                                  disabled={!personalCurriculumReady || claudeActionLoading || completionChoice.invalid}
                                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Bot size={16} />
                                  {claudeActionState === 'launching'
                                    ? t.startPage.login.claudeStarting
                                    : t.startPage.login.claudeStart}
                                  <ExternalLink size={13} />
                                </button>
                              </li>
                            </ol>

                            <div aria-live="polite" className="space-y-2 [&:not(:empty)]:mt-2.5">
                              {claudeActionState === 'setup-opened' && (
                                <p className="text-xs font-semibold text-sky-800 dark:text-sky-200">
                                  {t.startPage.login.claudeInstallOpened}
                                </p>
                              )}
                              {claudeActionState === 'launched' && (
                                <p className="text-xs font-semibold text-sky-800 dark:text-sky-200">
                                  {t.startPage.login.claudeLaunched}
                                </p>
                              )}
                              {claudeInstallFallbackUrl && (
                                <a
                                  href={claudeInstallFallbackUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 underline hover:text-sky-600 dark:text-sky-300"
                                >
                                  {t.startPage.login.claudeInstallFallback}
                                  <ExternalLink size={12} />
                                </a>
                              )}
                              {claudeActionState === 'failed' && (
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                  {t.startPage.login.claudeFailed}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] leading-relaxed text-text-secondary">
                            {t.startPage.login.claudeAdultsOnly}
                          </p>
                        </div>
                      )}
                      {coachProvider === 'chatgpt-desktop' && (
                        <ChatGptDesktopStart
                          key={`${sanitizedLearnerId}:${selectedLandscapeId}:${language}`}
                          onPrepare={prepareChatGptDesktopStart}
                        />
                      )}
                      {coachProvider === 'gemini' && (
                        <GeminiStart
                          key={coachLaunchScope}
                          onPrepare={prepareGeminiStart}
                        />
                      )}
                      <p
                        role="note"
                        className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                      >
                        <Bot size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{t.startPage.login.aiCoachNotice}</span>
                      </p>

                      {/* The Cockpit supports the learning with overview and settings; it is not a second way to learn. */}
                      <div data-testid="learner-cockpit-start" className="flex flex-col gap-3 border-t border-border-color pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-text-primary">
                            {t.startPage.login.cockpitSectionTitle}
                          </h3>
                          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                            {t.startPage.login.cockpitSectionText}
                          </p>
                        </div>
                        {/* A tab-only access exists in this tab alone; only a tab opened with its
                            opener receives a copy. A remembered access needs no such link. */}
                        <a
                          href={personalCurriculumReady ? learnerCockpitHref : undefined}
                          target="_blank"
                          rel={rememberId ? 'noopener noreferrer' : 'opener'}
                          aria-disabled={!personalCurriculumReady}
                          tabIndex={personalCurriculumReady ? undefined : -1}
                          onClick={handleOpenLearnerCockpit}
                          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-border-color bg-white px-4 py-2 text-xs font-semibold text-text-primary transition-colors dark:bg-slate-800 ${personalCurriculumReady ? 'hover:border-sky-400' : 'cursor-not-allowed opacity-50'}`}
                        >
                          <Compass size={16} />
                          {t.startPage.login.cockpitButton}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      <SkillpilotIdFilePasswordDialog
        isOpen={skillpilotIdFileDialogMode !== null}
        mode={skillpilotIdFileDialogMode ?? 'save'}
        fileName={pendingSkillpilotIdFile?.name}
        busy={skillpilotIdFileDialogBusy}
        error={skillpilotIdFileDialogError}
        copy={t.startPage.login.idFileDialog}
        onClose={handleCloseSkillpilotIdFileDialog}
        onSubmit={handleSkillpilotIdFilePasswordSubmit}
      />

      <LearnerDataManagementDialog
        isOpen={isDataManagementOpen}
        skillpilotId={validatedLearnerId}
        retention={learnerRetention}
        retentionLoading={learnerRetentionLoading}
        retentionError={learnerRetentionError}
        deleteBusy={learnerDeleteBusy}
        deleteError={learnerDeleteError}
        onClose={() => setIsDataManagementOpen(false)}
        onExport={() => undefined}
        onImportFileChange={() => undefined}
        onDelete={() => { void handleLearnerDeletion() }}
        showTransferActions={false}
      />

      <PublicLandingFooter language={language === 'en' ? 'en' : 'de'} />
    </div>
  )
}
