import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { CurriculumDropdown } from './CurriculumDropdown'
import { LearnerSetupStepCard } from './LearnerSetupStepCard'
import { PersonalCurriculumEditor } from './PersonalCurriculumEditor'
import { SkillpilotIdFilePasswordDialog } from './SkillpilotIdFilePasswordDialog'
import { LearnerDataManagementDialog } from './LearnerDataManagementDialog'
import { ThemeToggle } from './ThemeToggle'
import type { LandscapeSummary } from './CurriculumDropdown'
import { Save, ArrowRight, Github, ShieldCheck, Send, MessageCircle, Compass, ExternalLink, KeyRound, UserPlus, Bot, FileDown, FileUp, Database } from 'lucide-react'


type Role = 'learner' | 'trainer' | 'explorer'
type ClaudeActionState = 'idle' | 'opening-setup' | 'setup-opened' | 'launching' | 'launched' | 'fallback' | 'failed'
type ChatLaunchIssue = 'none' | 'preparation-failed' | 'popup-blocked'
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
import {
  deliverCoachChatStart,
  getActiveVisibleSessionLaunchCopy,
  isOpenAiMcpCoachActive,
  requestCoachChatStart,
} from '../coachVariants/coachLaunch'
import {
  confirmOpenAiMcpEligibility,
  isOpenAiMcpEligibilityDeclinedError,
  OpenAiMcpEligibilityDeclinedError,
} from '../coachVariants/openAiMcp/providerEligibility'
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
  formatPersonalCurriculumSummary,
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
  const visibleSessionLaunchCopy = getActiveVisibleSessionLaunchCopy(language)
  const openAiMcpCoachActive = isOpenAiMcpCoachActive(language)
  const [selectedLandscapeId, setSelectedLandscapeId] = useState<string>(() => {
    return role === 'trainer' ? '' : getStoredLandscapeIdForRole(role)
  })
  const [persistedLearnerLandscapeId, setPersistedLearnerLandscapeId] = useState('')
  const [curriculumSaving, setCurriculumSaving] = useState(false)
  const [curriculumQualityFilter, setCurriculumQualityFilter] =
    useState<CurriculumQualityFilter>('green')
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
  const evaluatedCompletedSetupScopeRef = React.useRef('')
  // Use location (ensure import is added)
  const location = useLocation()

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
  const [availableCurricula, setAvailableCurricula] = useState<LandscapeSummary[]>([])
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
  const [showLogin, setShowLogin] = useState(false);
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
  const [termsAccepted, setTermsAccepted] = useState(() => (
    hasAcceptedCurrentTerms(window.localStorage)
  ))
  const [termsChecked, setTermsChecked] = useState(false)
  const [termsStorageFailed, setTermsStorageFailed] = useState(false)
  const [chatLaunchIssue, setChatLaunchIssue] = useState<ChatLaunchIssue>('none')
  const [chatStartLoading, setChatStartLoading] = useState(false)
  const chatStartInFlightRef = React.useRef(createSynchronousInFlightGuard())
  const [claudeActionState, setClaudeActionState] = useState<ClaudeActionState>('idle')
  const [claudeInstallFallbackUrl, setClaudeInstallFallbackUrl] = useState<string | null>(null)
  const claudeActionLoading = claudeActionState === 'opening-setup'
    || claudeActionState === 'launching'
  const sanitizedLearnerId = sanitizeSkillpilotId(skillpilotId)
  const normalizedSelectedLearnerLandscapeId = normalizeLearnerLandscapeId(selectedLandscapeId)
  const personalCurriculumEditorEnabled =
    role === 'learner'
    && hasCheckedId
    && !!sanitizedLearnerId
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
  const completedSetupScope = `${sanitizedLearnerId}\u0000${persistedLearnerLandscapeId}`
  const personalCurriculumSummaryItems = React.useMemo(
    () => getPersonalCurriculumSummaryItems(
      personalCurriculumEditor.plan,
      language === 'en' ? 'en' : 'de',
    ),
    [language, personalCurriculumEditor.plan],
  )
  const personalCurriculumSummary = personalCurriculumSummaryItems.length > 0
    ? formatPersonalCurriculumSummary(
        personalCurriculumSummaryItems,
        (remaining) => remaining === 1
          ? t.startPage.login.completedSetup.moreOne
          : t.startPage.login.completedSetup.moreMany,
      )
    : t.startPage.login.completedSetup.noAdditionalChoices
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
    setAvailableCurricula([])
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
    setChatLaunchIssue('none')
    setChatStartLoading(false)
    setClaudeActionState('idle')
    setClaudeInstallFallbackUrl(null)
    setSkillpilotIdFileStatus('idle')
    setSkillpilotIdFileDialogMode(null)
    setSkillpilotIdFileDialogBusy(false)
    setSkillpilotIdFileDialogError('')
    setPendingSkillpilotIdFile(null)
    advanceToCurriculumRef.current = false
    if (clearSkillpilotId) {
      setSkillpilotId('')
      setSkillpilotIdSource(null)
    }
  }
  resetTransientSetupStateRef.current = resetTransientSetupState

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
      setValidatedLearnerId(sanitizedId)
      setChatLaunchIssue('none')

      if (data.availableCurricula) {
        setAvailableCurricula(data.availableCurricula)
      }

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

  const checkLearner = async (id: string, markActivity = false): Promise<boolean> => {
    const sanitizedId = sanitizeSkillpilotId(id)
    if (!sanitizedId) {
      curriculumSelectionRequestRef.current += 1
      learnerCheckRequestRef.current += 1
      setSelectedLandscapeId('')
      setPersistedLearnerLandscapeId('')
      setCurriculumSaving(false)
      setAvailableCurricula([])
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
  }

  const persistLearnerStart = (effectiveId: string) => {
    const sanitizedId = sanitizeSkillpilotId(effectiveId)
    if (!sanitizedId) return ''

    localStorage.setItem('skillpilot_id', sanitizedId)
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

  const handleAcceptTerms = () => {
    try {
      acceptCurrentTerms(window.localStorage)
      setTermsStorageFailed(false)
      setTermsAccepted(true)
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
    const checked = await checkLearner(sanitizedId, true)
    if (!checked) {
      advanceToCurriculumRef.current = false
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

  const createCoachChatStart = async (
    effectiveId: string,
    providerEligibilityConfirmed?: boolean,
  ) => {
    const sanitizedId = sanitizeSkillpilotId(effectiveId)
    if (!sanitizedId) return null
    // Level 1 is persisted before the Level-2 editor is enabled. Launches only
    // mirror that confirmed selection into browser-local state.
    const normalizedLandscapeId = persistLearnerStart(sanitizedId)
    if (!normalizedLandscapeId) return null

    setChatStartLoading(true)
    setChatLaunchIssue('none')
    try {
      return await requestCoachChatStart({
        skillpilotId: sanitizedId,
        language,
        selectedCurriculum: normalizedLandscapeId,
        client: 'web-start',
        providerEligibilityConfirmed,
      })
    } finally {
      setChatStartLoading(false)
    }
  }

  const handleOpenChatGpt = async () => {
    if (!personalCurriculumReady) return
    const effectiveId = sanitizeSkillpilotId(skillpilotId)
    if (!effectiveId) return
    if (!chatStartInFlightRef.current.tryStart()) return
    let chatWindow: Window | null = null
    let popupBlocked = false
    try {
      let providerEligibilityConfirmed: boolean | undefined
      if (openAiMcpCoachActive) {
        const eligibilityLanguage = language.trim().toLowerCase().startsWith('en') ? 'en' : 'de'
        providerEligibilityConfirmed = confirmOpenAiMcpEligibility(
          eligibilityLanguage,
          effectiveId,
        )
        if (!providerEligibilityConfirmed) {
          throw new OpenAiMcpEligibilityDeclinedError(eligibilityLanguage)
        }
      }

      // The provider confirmation above is synchronous. Opening the placeholder
      // afterwards keeps this call inside the original user gesture and avoids
      // leaving a blank tab idle while the confirmation dialog is visible.
      chatWindow = window.open('', '_blank')
      if (!chatWindow) {
        popupBlocked = true
        throw new Error('ChatGPT popup was blocked')
      }
      try {
        chatWindow.document.title = 'SkillPilot'
        chatWindow.document.body.textContent = language.trim().toLowerCase().startsWith('en')
          ? 'SkillPilot is preparing your learning session …'
          : 'SkillPilot bereitet deine Lernsession vor …'
      } catch {
        // The placeholder copy is only a convenience; navigation still works.
      }

      const chatStart = await createCoachChatStart(effectiveId, providerEligibilityConfirmed)
      if (!chatStart) throw new Error('Missing coach chat start')
      await deliverCoachChatStart(
        chatStart,
        (url) => {
          if (chatWindow && !chatWindow.closed) {
            chatWindow.location.replace(url)
            try {
              chatWindow.opener = null
            } catch {
              // Navigation already succeeded; opener cleanup is best effort.
            }
            return
          }
          popupBlocked = true
          throw new Error('ChatGPT popup was blocked')
        },
      )
      setChatLaunchIssue('none')
    } catch (caught) {
      if (chatWindow) {
        chatWindow.close()
      }
      if (isOpenAiMcpEligibilityDeclinedError(caught)) {
        setError(caught.message)
        return
      }
      setChatLaunchIssue(popupBlocked ? 'popup-blocked' : 'preparation-failed')
    } finally {
      chatStartInFlightRef.current.finish()
    }
  }

  const getClaudeStartContext = () => {
    if (!personalCurriculumReady) return null
    const effectiveId = sanitizeSkillpilotId(skillpilotId)
    if (!effectiveId) return null
    const normalizedLandscapeId = persistLearnerStart(effectiveId)
    if (!normalizedLandscapeId) return null
    return { effectiveId, normalizedLandscapeId }
  }

  const handleOpenClaudePluginSetup = async () => {
    const context = getClaudeStartContext()
    if (!context) return

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
      setClaudeActionState('failed')
    }
  }

  const handleLaunchClaude = async () => {
    const context = getClaudeStartContext()
    if (!context) return

    setClaudeActionState('launching')
    setClaudeInstallFallbackUrl(null)
    const claudeWindow = window.open('', '_blank')
    if (!claudeWindow) {
      setClaudeActionState('failed')
      return
    }
    try {
      const result = await requestClaudeLaunch({
        skillpilotId: context.effectiveId,
        language,
        selectedCurriculum: context.normalizedLandscapeId,
        client: 'web-start',
      })
      const webUrl = getSafeClaudeWebUrl(result.webUrl)
      if (!webUrl) throw new Error('Invalid Claude Web launch URL')

      claudeWindow.opener = null
      claudeWindow.location.href = webUrl
      setClaudeActionState('launched')
    } catch {
      claudeWindow?.close()
      setClaudeActionState('failed')
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
      try {
        localStorage.removeItem('skillpilot_trainer_landscape')
      } catch {
        // The obsolete global trainer context must never block the local
        // course organization from opening.
      }
      setSelectedLandscapeId('')
      onStart(effectiveId, '', role)
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
    resetTransientSetupState(true)
    setShowLogin(true)
  }

  const openRoleStart = (nextRole: Extract<Role, 'trainer' | 'explorer'>) => {
    setRole(nextRole)
    resetTransientSetupState(true)
    setShowLogin(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-chat-bg text-text-primary px-6 py-10 transition-colors relative">
      <div className="w-full flex justify-between items-center mb-6">
        <div /> {/* Spacer to keep right alignment clean or put branding here later */}
        <div className="flex items-center gap-4">
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

      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
        {/* 0. Logo & Title */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-amber-500">
              <Send size={48} strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
              SkillPilot
            </h1>
          </div>
        </div>

        <div className="w-full space-y-5">
          {!showLogin ? (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <PublicLandingPanels
                language={language === 'en' ? 'en' : 'de'}
                accessBanner={t.startPage.banner}
                onStartLearning={openLearnerStart}
                onOpenCoursePlanning={() => openRoleStart('trainer')}
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
                  <div className="rounded-xl border border-border-color bg-white/70 p-4 shadow-sm dark:bg-slate-900/50">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                        1
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-primary">{t.startPage.login.loginTitle}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{t.startPage.login.loginText}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border-2 border-sky-300 bg-sky-50/70 p-4 shadow-sm dark:border-sky-700 dark:bg-sky-950/20">
                        <label htmlFor="skillpilotIdInput" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                          <KeyRound size={16} className="text-sky-600 dark:text-sky-300" />
                          {t.startPage.login.directIdTitle}
                        </label>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                          {t.startPage.login.idFieldHint}
                        </p>
                        <input
                          id="skillpilotIdInput"
                          type="text"
                          value={skillpilotId}
                          onChange={(event) => {
                            const nextId = sanitizeSkillpilotId(event.target.value)
                            resetTransientSetupState()
                            setSkillpilotId(nextId)
                            setSkillpilotIdSource(nextId ? 'existing' : null)
                          }}
                          disabled={idAcquisitionBusy}
                          className="mt-3 min-h-12 w-full rounded-lg border-2 border-sky-400 bg-white px-3 py-2 text-base font-mono text-text-primary shadow-sm transition-colors focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-wait disabled:opacity-70 dark:border-sky-500 dark:bg-slate-950"
                          placeholder={t.startPage.login.idLabel}
                          required
                        />
                        {skillpilotIdSourceLabel && sanitizedLearnerId && (
                          <span className="mt-2 inline-flex rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-800 dark:bg-sky-900/50 dark:text-sky-100">
                            {skillpilotIdSourceLabel}
                          </span>
                        )}
                        {hasCheckedId && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                              {t.startPage.login.idConfirmed}
                            </span>
                          </div>
                        )}
                        {validatedLearnerId === sanitizedLearnerId && (
                          <button
                            type="button"
                            onClick={() => {
                              setLearnerDeleteError(null)
                              setIsDataManagementOpen(true)
                            }}
                            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-400 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500 hover:bg-sky-50 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-sky-950/40"
                          >
                            <Database size={15} />
                            {learnerDataManagementCopy.openAction}
                          </button>
                        )}
                        {skillpilotIdSource === 'generated' && sanitizedLearnerId && (
                          <span className="mt-2 block rounded border border-amber-200 bg-amber-100 px-2 py-1 text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                            {t.startPage.login.idWarning}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleOpenSaveSkillpilotIdFileDialog}
                          disabled={!sanitizedLearnerId || idAcquisitionBusy}
                          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/50"
                        >
                          <FileDown size={15} />
                          {t.startPage.login.saveIdToFile}
                        </button>
                        <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
                          {t.startPage.login.idFileHint}
                        </p>
                      </div>

                      <input
                        ref={skillpilotIdFileInputRef}
                        type="file"
                        accept=".skillpilot,application/json"
                        onChange={handleSkillpilotIdFileChange}
                        className="hidden"
                        aria-label={t.startPage.login.loadIdFromFile}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col rounded-lg border border-border-color bg-white p-3 dark:bg-slate-950/40">
                          <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                            <FileUp size={16} className="text-sky-600 dark:text-sky-300" />
                            {t.startPage.login.fileLoginTitle}
                          </p>
                          <button
                            type="button"
                            onClick={() => skillpilotIdFileInputRef.current?.click()}
                            disabled={idAcquisitionBusy}
                            className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/40"
                          >
                            <FileUp size={15} />
                            {skillpilotIdFileStatus === 'loading'
                              ? t.startPage.login.loadingIdFromFile
                              : t.startPage.login.loadIdFromFile}
                          </button>
                        </div>

                        <div className="flex flex-col rounded-lg border border-border-color bg-white p-3 dark:bg-slate-950/40">
                          <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                            <UserPlus size={16} className="text-sky-600 dark:text-sky-300" />
                            {t.startPage.login.newLoginTitle}
                          </p>
                          <button
                            type="button"
                            onClick={requestNewId}
                            disabled={!termsAccepted || idAcquisitionBusy}
                            className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/40"
                          >
                            {creatingNewId ? t.startPage.login.creatingNewId : t.startPage.login.requestNewId}
                          </button>
                        </div>
                      </div>

                      <div aria-live="polite">
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
                )}

                {termsAccepted && role === 'trainer' && (
                  <div className="space-y-4">
                    <div className="bg-sky-100 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-500/20 rounded p-3 text-xs text-sky-800 dark:text-sky-200/80 leading-relaxed">
                      <p className="mb-1 font-bold flex items-center gap-2">
                        <Save size={16} /> {t.startPage.login.trainerInfo.title}
                      </p>
                      <p className="mb-2">
                        {t.startPage.login.trainerInfo.text}
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500"
                    >
                      {t.startPage.login.trainerDashboardButton}
                    </button>
                  </div>
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
                    summary={selectedCurriculumTitle}
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
                      landscapes={availableCurricula}
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
                    summary={personalCurriculumSummary}
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
                  <div className="rounded-xl border border-border-color bg-white/70 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-slate-900/50">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                        4
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-primary">{t.startPage.login.startStepTitle}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                          {t.startPage.login.startStepTextWithClaude}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p
                        role="note"
                        className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                      >
                        <Bot size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{t.startPage.login.aiCoachNotice}</span>
                      </p>
                      <div className="rounded-lg border border-border-color bg-slate-50 p-3 text-xs leading-relaxed text-text-secondary dark:bg-slate-950/40">
                        <p className="font-semibold text-text-primary">
                          {openAiMcpCoachActive
                            ? t.startPage.login.openAiMcpTitle
                            : visibleSessionLaunchCopy?.startPromptLabel ?? t.startPage.login.startPromptLabel}
                        </p>
                        <p className="mt-1">
                          {openAiMcpCoachActive
                            ? t.startPage.login.openAiMcpHint
                            : visibleSessionLaunchCopy?.startPromptHint ?? t.startPage.login.startPromptHint}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenChatGpt}
                        disabled={!personalCurriculumReady || chatStartLoading}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <MessageCircle size={16} />
                        {t.startPage.login.openChatGptProvider}
                        <ExternalLink size={14} />
                      </button>
                      <div
                        data-testid="claude-v1-start-options"
                        className="space-y-3 rounded-xl border border-violet-300/80 bg-violet-50/70 p-3 dark:border-violet-700/70 dark:bg-violet-950/20"
                      >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Bot size={17} className="text-violet-600 dark:text-violet-300" />
                                <p className="text-sm font-semibold text-text-primary">
                                  {t.startPage.login.claudeBetaTitle}
                                </p>
                                <span className="rounded-full bg-violet-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800 dark:bg-violet-900 dark:text-violet-200">
                                  {t.startPage.login.claudeBetaBadge}
                                </span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                                {t.startPage.login.claudeBetaHint}
                              </p>
                              <p className="mt-1 text-[11px] leading-relaxed text-violet-800 dark:text-violet-200">
                                {t.startPage.login.claudeAdultsOnly}
                              </p>
                            </div>
                          </div>

                          <section
                            data-testid="claude-plugin-setup-guide"
                            aria-labelledby="claude-plugin-setup-title"
                            className="rounded-lg border border-violet-200 bg-white/80 p-3 dark:border-violet-800 dark:bg-slate-950/35"
                          >
                            <p id="claude-plugin-setup-title" className="text-xs font-bold text-text-primary">
                              {t.startPage.login.claudeSetupTitle}
                            </p>
                            <ol className="mt-2 space-y-2">
                              <li
                                data-testid="claude-plugin-setup-step-1"
                                className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                                  1
                                </span>
                                <span>{t.startPage.login.claudeSetupStepOne}</span>
                              </li>
                              <li
                                data-testid="claude-plugin-setup-step-2"
                                className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                                  2
                                </span>
                                <span>{t.startPage.login.claudeSetupStepTwo}</span>
                              </li>
                            </ol>
                          </section>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <button
                              data-testid="claude-plugin-setup-open"
                              type="button"
                              onClick={handleOpenClaudePluginSetup}
                              disabled={!personalCurriculumReady || claudeActionLoading}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-violet-400 bg-white px-3 py-2 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-violet-200 dark:hover:bg-violet-950"
                            >
                              <KeyRound size={14} />
                              {claudeActionState === 'opening-setup'
                                ? t.startPage.login.claudeConnecting
                                : t.startPage.login.claudeConnect}
                            </button>
                            <button
                              data-testid="claude-plugin-start"
                              type="button"
                              onClick={handleLaunchClaude}
                              disabled={!personalCurriculumReady || claudeActionLoading}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-violet-600 bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-violet-500 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Bot size={14} />
                              {claudeActionState === 'launching'
                                ? t.startPage.login.claudeStarting
                                : t.startPage.login.claudeStart}
                              <ExternalLink size={12} />
                            </button>
                          </div>

                          <div aria-live="polite" className="space-y-2">
                            {claudeActionState === 'setup-opened' && (
                              <p className="text-xs font-semibold text-violet-800 dark:text-violet-200">
                                {t.startPage.login.claudeInstallOpened}
                              </p>
                            )}
                            {claudeActionState === 'launched' && (
                              <p className="text-xs font-semibold text-violet-800 dark:text-violet-200">
                                {t.startPage.login.claudeLaunched}
                              </p>
                            )}
                            {claudeInstallFallbackUrl && (
                              <a
                                href={claudeInstallFallbackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 underline hover:text-violet-600 dark:text-violet-300"
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
                      <div>
                        <a
                          href={personalCurriculumReady ? learnerCockpitHref : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!personalCurriculumReady}
                          tabIndex={personalCurriculumReady ? undefined : -1}
                          onClick={handleOpenLearnerCockpit}
                          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border-color bg-white px-4 py-2 text-sm font-semibold text-text-primary transition-colors dark:bg-slate-800 ${personalCurriculumReady ? 'hover:border-sky-400' : 'cursor-not-allowed opacity-50'}`}
                        >
                          <Compass size={16} />
                          {t.startPage.login.cockpitButton}
                        </a>
                      </div>
                      {chatLaunchIssue !== 'none' && (
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {chatLaunchIssue === 'popup-blocked'
                            ? t.startPage.login.openAiMcpPopupBlocked
                            : visibleSessionLaunchCopy?.preparationFailed
                                ?? (openAiMcpCoachActive
                                  ? t.startPage.login.openAiMcpPreparationFailed
                                  : t.startPage.login.startPromptCopyFailed)}
                        </p>
                      )}
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
