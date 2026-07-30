import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CurriculumDropdown, type LandscapeSummary } from '../components/CurriculumDropdown'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { ConfirmModal } from '../components/ConfirmModal'
import { BadgeCheck, Trophy } from 'lucide-react'
import { CANONICAL_GYMNASIUM_ROOT_ID, getCurriculumDisplayTitle } from '../utils/curriculumDisplay'
import { getCurriculaChampionCopy } from '../utils/curriculaChampionCopy'
import { getCurriculaViewCopy } from '../utils/curriculaViewCopy'
import {
  buildGymnasiumSubjectQualityRows,
  CURRICULUM_QUALITY_FILTER_AVAILABLE,
  getCurriculumQualityStatus,
  getGymnasiumSubjectQualityStatus,
  matchesCurriculumQualityFilter,
  type CurriculumQualityFilter,
  type CurriculumQualityStatus,
} from '../utils/curriculumQualityTrafficLight'

interface ChampionEntry {
  curriculumId: string
  topicId?: string
  topicTitle?: string
  topicTitleEn?: string
  githubId: string
  skillpilotIdMasked: string
  masteredCount: number
  totalTopicGoals?: number
  issuesCount: number
  pullRequestsCount: number
  registeredAt?: string
}

type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7'

interface CurriculumSubjectQuality {
  subject: string
  maturity: MaturityLevel
  goals: number
  atomicGoals: number
  warnings: number
  failures: number
}

interface TopicSummary {
  id: string
  title: string
  titleEn?: string
}

interface CurriculumEntry {
  curriculumId: string
  title: string
  titleEn?: string
  description?: string
  descriptionEn?: string
  subject?: string
  country?: string
  region?: string
  totalAtomicGoals: number
  totalMastered: number
  qualityMaturity?: MaturityLevel | null
  qualityGoals?: number
  qualityAtomicGoals?: number
  qualityWarnings?: number
  qualityFailures?: number
  subjectQuality?: CurriculumSubjectQuality[]
  topLevelTopics?: string[]
  topLevelTopicsEn?: string[]
  champions: ChampionEntry[]
}

interface CurriculaData {
  curricula: CurriculumEntry[]
  defaultCurriculumId: string
  lastUpdatedAt: string
}

interface DeregisterCurriculumGroup {
  curriculumId: string
  displayTitle: string
  subject: string
  entryCount: number
  masteredCount: number
  topicLabels: string[]
}


type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid'
type ChampionFilter = 'with' | 'without' | 'all'
type CategoryFilter = 'all' | 'school' | 'uni' | 'other'

const maturityOrder: MaturityLevel[] = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']

const maturityClass: Record<MaturityLevel, string> = {
  M0: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  M1: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
  M2: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
  M3: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
  M4: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300',
  M5: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300',
  M6: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
  M7: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300',
}

const qualityStatusBadgeClass: Record<CurriculumQualityStatus, string> = {
  green: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  orange: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  red: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
}

const qualityStatusDotClass: Record<CurriculumQualityStatus, string> = {
  green: 'bg-emerald-700',
  orange: 'bg-orange-700',
  red: 'bg-red-700',
}

const qualityFilterActiveClass: Record<CurriculumQualityFilter, string> = {
  green: 'bg-emerald-700 text-white shadow-sm',
  orange: 'bg-orange-700 text-white shadow-sm',
  red: 'bg-red-700 text-white shadow-sm',
  all: 'bg-sky-700 text-white shadow-sm',
}

const maturityCopy = {
  de: {
    label: 'Reifegrad',
    subjectStatusTitle: 'Qualitätsreife pro Fach',
    goals: 'Ziele',
    atomicGoals: 'atomar',
    warnings: 'Warnungen',
    failures: 'Fehler',
    legendTitle: 'Was bedeuten M0-M7?',
    legend: {
      M0: 'Noch kein belastbarer QA-Stand.',
      M1: 'Quellen und Bearbeitungspipeline sind sichtbar.',
      M2: 'Source-Ziele sind extrahiert und rückverfolgbar.',
      M3: 'Source-Ziele sind fachlich durch SkillPilot-Ziele abgedeckt.',
      M4: 'Bundesland-Sichten und QA-Scopes sind geprüft.',
      M5: 'Schulgeeigneter Kern-QS-Stand: CI-fähig, ohne offene Fehler; Voraussetzung für Champions-QS in der Schule.',
      M6: 'M5 plus geprüfte Memory-Layer: Kartenentscheidungen, Herkunftsspuren und Sichtbarkeit sind aktuell.',
      M7: 'M6 plus vollständig erstellte und menschlich freigegebene Lernzielbilder.',
    },
  },
  en: {
    label: 'Maturity',
    subjectStatusTitle: 'Quality maturity by subject',
    goals: 'goals',
    atomicGoals: 'atomic',
    warnings: 'warnings',
    failures: 'failures',
    legendTitle: 'What do M0-M7 mean?',
    legend: {
      M0: 'No reliable QA baseline yet.',
      M1: 'Sources and processing pipeline are visible.',
      M2: 'Source goals are extracted and traceable.',
      M3: 'Source goals are covered by SkillPilot goals.',
      M4: 'Jurisdiction views and QA scopes are validated.',
      M5: 'School-ready core QA level: CI-ready, no open failures; prerequisite for school-facing Champion QA.',
      M6: 'M5 plus reviewed memory layer: card decisions, origin traces, and visibility are current.',
      M7: 'M6 plus fully created and human-approved goal visualizations.',
    },
  },
} as const

const normalizeSubjectLabel = (value?: string | null): string =>
  (value ?? '').trim().toLocaleLowerCase('de-DE')

const isMaturityLevel = (value: unknown): value is MaturityLevel =>
  maturityOrder.includes(value as MaturityLevel)

const getQualityTooltip = (
  quality: CurriculumSubjectQuality,
  copy: typeof maturityCopy.de | typeof maturityCopy.en,
): string => {
  const details = [
    `${copy.label}: ${quality.maturity}`,
    `${copy.goals}: ${quality.goals}`,
    `${copy.atomicGoals}: ${quality.atomicGoals}`,
    `${copy.warnings}: ${quality.warnings}`,
    `${copy.failures}: ${quality.failures}`,
  ]
  return `${details.join(' · ')} · ${copy.legend[quality.maturity]}`
}

export const CurriculaView: React.FC = () => {
  const [data, setData] = useState<CurriculaData | null>(null)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [skillpilotStatus, setSkillpilotStatus] = useState<ValidationStatus>('idle')
  const [skillpilotMessage, setSkillpilotMessage] = useState('')

  const [championFilter, setChampionFilter] = useState<ChampionFilter>('with')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [qualityFilter, setQualityFilter] = useState<CurriculumQualityFilter>('green')
  const [showRegistration, setShowRegistration] = useState(false)
  const [user, setUser] = useState<{ githubId: string; champions: ChampionEntry[] } | null>(null)
  const [showDeregisterModal, setShowDeregisterModal] = useState(false)
  const [selectedDeregisterIds, setSelectedDeregisterIds] = useState<string[]>([])
  const [formState, setFormState] = useState({
    skillpilotId: '',
    githubId: '',
    topicId: '',
  })
  const [topics, setTopics] = useState<TopicSummary[]>([])
  const t = useTranslation()
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const championCopy = getCurriculaChampionCopy(localizedLanguage)
  const curriculaViewCopy = getCurriculaViewCopy(localizedLanguage)
  const qualityCopy = maturityCopy[localizedLanguage]
  const getCurriculumTitle = useCallback((curriculum: CurriculumEntry) => {
    return language === 'en'
      ? (curriculum.titleEn || curriculum.title)
      : curriculum.title
  }, [language])
  const getCurriculumDescription = useCallback((curriculum: CurriculumEntry) => {
    const fallback = curriculum.description ?? ''
    return language === 'en'
      ? (curriculum.descriptionEn || fallback)
      : fallback
  }, [language])
  const getTopicLabel = useCallback((topic: TopicSummary) => {
    return language === 'en'
      ? (topic.titleEn || topic.title)
      : topic.title
  }, [language])
  const getChampionTopicTitle = useCallback((champion: ChampionEntry) => {
    return language === 'en'
      ? (champion.topicTitleEn || champion.topicTitle)
      : champion.topicTitle
  }, [language])
  const curriculumById = useMemo(() => {
    return new Map((data?.curricula ?? []).map((curriculum) => [curriculum.curriculumId, curriculum]))
  }, [data])
  const isChampionCertified = useCallback((champion: ChampionEntry) => {
    if (!champion.totalTopicGoals || champion.totalTopicGoals <= 0) return false
    return champion.masteredCount >= champion.totalTopicGoals
  }, [])
  const getSubjectQuality = useCallback((curriculum: CurriculumEntry, subject?: string | null) => {
    const normalizedSubject = normalizeSubjectLabel(subject)
    if (!normalizedSubject) return null
    return (curriculum.subjectQuality ?? []).find(
      (quality) => normalizeSubjectLabel(quality.subject) === normalizedSubject,
    ) ?? null
  }, [])
  const getCurriculumQuality = useCallback((curriculum: CurriculumEntry): CurriculumSubjectQuality | null => {
    if (!isMaturityLevel(curriculum.qualityMaturity)) {
      return null
    }
    return {
      subject: curriculum.subject || getCurriculumTitle(curriculum),
      maturity: curriculum.qualityMaturity,
      goals: curriculum.qualityGoals ?? 0,
      atomicGoals: curriculum.qualityAtomicGoals ?? 0,
      warnings: curriculum.qualityWarnings ?? 0,
      failures: curriculum.qualityFailures ?? 0,
    }
  }, [getCurriculumTitle])
  const isCanonicalGymnasiumOverview = useCallback((curriculum: CurriculumEntry) => (
    curriculum.curriculumId === CANONICAL_GYMNASIUM_ROOT_ID
  ), [])
  const deregisterGroups = useMemo<DeregisterCurriculumGroup[]>(() => {
    const groups = new Map<string, DeregisterCurriculumGroup>()

    for (const champion of user?.champions ?? []) {
      const curriculum = curriculumById.get(champion.curriculumId)
      const displayTitle = getCurriculumDisplayTitle({
        curriculumId: champion.curriculumId,
        title: curriculum ? getCurriculumTitle(curriculum) : undefined,
        description: curriculum ? getCurriculumDescription(curriculum) : undefined,
        subject: curriculum?.subject,
        language,
      })
      const group = groups.get(champion.curriculumId) ?? {
        curriculumId: champion.curriculumId,
        displayTitle,
        subject: curriculum?.subject ?? '',
        entryCount: 0,
        masteredCount: 0,
        topicLabels: [],
      }

      group.entryCount += 1
      group.masteredCount = Math.max(group.masteredCount, champion.masteredCount)

      const topicLabel = getChampionTopicTitle(champion)
      if (topicLabel && !group.topicLabels.includes(topicLabel)) {
        group.topicLabels.push(topicLabel)
      }

      groups.set(champion.curriculumId, group)
    }

    return Array.from(groups.values()).sort((a, b) => a.displayTitle.localeCompare(b.displayTitle, language))
  }, [
    curriculumById,
    getChampionTopicTitle,
    getCurriculumDescription,
    getCurriculumTitle,
    language,
    user?.champions,
  ])
  const getDeregisterGroupDetail = useCallback((group: DeregisterCurriculumGroup) => {
    const details: string[] = []

    if (group.subject) {
      const normalizedTitle = group.displayTitle.toLocaleLowerCase(language)
      const normalizedSubject = group.subject.toLocaleLowerCase(language)
      if (!normalizedTitle.includes(normalizedSubject)) {
        details.push(group.subject)
      }
    }

    if (group.topicLabels.length > 0) {
      const preview = group.topicLabels.slice(0, 2).join(', ')
      const remaining = group.topicLabels.length - 2
      details.push(remaining > 0 ? `${preview} +${remaining}` : preview)
    }

    return details.join(' • ')
  }, [language])
  const getDeregisterGroupBadge = useCallback((group: DeregisterCurriculumGroup) => {
    if (group.entryCount > 1) {
      return curriculaViewCopy.deregisterEntriesBadge(group.entryCount)
    }
    return curriculaViewCopy.deregisterGoalsBadge(group.masteredCount)
  }, [curriculaViewCopy])

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/ui/curricula/champions/me')
      if (res.ok) {
        const champions: ChampionEntry[] = await res.json()
        if (champions.length > 0) {
          setUser({ githubId: champions[0].githubId, champions })
        } else {
          // Even if no champions, if call succeeds we are auth'd, but we don't know the ID easily unless we parse it or backend returns it wrapped
          // For MVP, if list empty, we rely on user adding themselves to see state? 
          // Actually backend returns list. To get ID we might need a separate /me endpoint or just parse from the list?
          // If list is empty, we don't know the github ID. 
          // Let's assume for now valid user might have 0 champions.
          setUser({ githubId: 'GitHub User', champions: [] })
        }
      }
    } catch (e) {
      console.debug('Not authenticated', e)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    const url = new URL(window.location.href)
    if (url.searchParams.get('auth_success')) {
      // Clear param
      window.history.replaceState({}, '', '/curricula')
      fetchUser()
    }
  }, [fetchUser])

  const loadData = useCallback(() => {
    setLoading(true)
    fetch('/api/ui/curricula')
      .then((res) => res.json())
      .then((payload: CurriculaData) => {
        setData(payload)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load curricula', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!data || data.curricula.length === 0) {
      return
    }
    const defaultId = data.defaultCurriculumId || data.curricula[0].curriculumId
    setSelectedCurriculumId((prev) => (prev ? prev : defaultId))
  }, [data])

  const curriculumOptions = useMemo<LandscapeSummary[]>(() => {
    if (!data) {
      return []
    }
    return data.curricula.map((curriculum) => ({
      curriculumId: curriculum.curriculumId,
      filename: curriculum.curriculumId,
      country: curriculum.country ?? '',
      region: curriculum.region ?? '',
      type: '',
      level: '',
      subject: curriculum.subject ?? '',
      locale: '',
      description: getCurriculumDescription(curriculum),
      title: getCurriculumTitle(curriculum),
      schoolType: '',
    }))
  }, [data, getCurriculumDescription, getCurriculumTitle])

  const championComicSrc = language === 'de' ? '/comic3/champion.de.png' : '/comic3/champion.en.png'

  const getCategory = useCallback((curriculum: CurriculumEntry): CategoryFilter => {
    const title = (curriculum.title ?? '').toUpperCase()
    const titleEn = (curriculum.titleEn ?? '').toUpperCase()
    const subject = (curriculum.subject ?? '').toUpperCase()
    const combined = `${title} ${titleEn} ${subject}`

    const schoolKeywords = [
      'GRUNDSCHULE',
      'MITTELSCHULE',
      'REALSCHULE',
      'GYMNASIUM',
      'FOS',
      'BOS',
      'WIRTSCHAFTSSCHULE',
      'BERUFSOBERSCHULE',
      'FACHOBERSCHULE',
      'GYM',
      'GESAMT',
      'SEKUNDARSTUFE',
      'SCHULE',
    ]
    if (schoolKeywords.some((keyword) => combined.includes(keyword))) {
      return 'school'
    }

    const uniKeywords = [
      'BACHELOR',
      'MASTER',
      'UNIVERSITÄT',
      'UNIVERSITAET',
      'UNIVERSITY',
      'HOCHSCHULE',
      'UNI',
      'TUM',
      'HEIDELBERG',
      'MANNHEIM',
      'DARMSTADT',
    ]
    if (uniKeywords.some((keyword) => combined.includes(keyword))) {
      return 'uni'
    }

    const otherKeywords = ['CEFR', 'SPRACHE', 'LANGUAGE', 'WEITERBILDUNG']
    if (otherKeywords.some((keyword) => combined.includes(keyword))) {
      return 'other'
    }

    return 'other'
  }, [])

  const filteredCurricula = useMemo(() => {
    if (!data) {
      return []
    }
    return data.curricula.filter((curriculum) => {
      const hasChampions = curriculum.champions.length > 0
      const championMatch =
        championFilter === 'all' ||
        (championFilter === 'with' ? hasChampions : !hasChampions)

      const categoryMatch =
        categoryFilter === 'all' || getCategory(curriculum) === categoryFilter

      const qualityStatus = getCurriculumQualityStatus(
        curriculum.curriculumId,
        curriculum.qualityMaturity,
      )
      const qualityMatch = !CURRICULUM_QUALITY_FILTER_AVAILABLE
        || matchesCurriculumQualityFilter(qualityStatus, qualityFilter)

      return championMatch && categoryMatch && qualityMatch
    })
  }, [data, championFilter, categoryFilter, qualityFilter, getCategory])

  useEffect(() => {
    if (!selectedCurriculumId) {
      setTopics([])
      return
    }
    fetch(`/api/ui/curricula/${selectedCurriculumId}/topics`)
      .then(res => res.json())
      .then(setTopics)
      .catch(err => console.error("Failed to load topics", err))
  }, [selectedCurriculumId])

  useEffect(() => {
    if (!formState.topicId) return
    if (topics.some((topic) => topic.id === formState.topicId)) return
    setFormState((prev) => ({ ...prev, topicId: '' }))
  }, [formState.topicId, topics])



  const validateSkillpilotId = useCallback(async (value?: string) => {
    const trimmed = (value ?? formState.skillpilotId).trim()
    if (!trimmed) {
      setSkillpilotStatus('invalid')
      setSkillpilotMessage(t.curriculaPage.registration.errors.required)
      return false
    }

    setSkillpilotStatus('checking')
    setSkillpilotMessage(t.curriculaPage.registration.validation.skillpilotChecking)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${trimmed}` : `/api/ui/learners/${trimmed}`
      const res = await fetch(url)
      if (res.ok) {
        setSkillpilotStatus('valid')
        setSkillpilotMessage('')
        return true
      }
      setSkillpilotStatus('invalid')
      setSkillpilotMessage(t.curriculaPage.registration.errors.unknownSkillpilot)
      return false
    } catch (err) {
      console.error('Failed to validate SkillPilot ID', err)
      setSkillpilotStatus('invalid')
      setSkillpilotMessage(t.curriculaPage.registration.errors.unknownSkillpilot)
      return false
    }
  }, [formState.skillpilotId, t])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const trimmedSkillpilotId = formState.skillpilotId.trim()

    if (!selectedCurriculumId || !trimmedSkillpilotId) {
      setSubmitError(t.curriculaPage.registration.errors.required)
      return
    }

    const skillpilotOk = await validateSkillpilotId(trimmedSkillpilotId)
    if (!skillpilotOk) {
      setSubmitError(t.curriculaPage.registration.errors.validationRequired)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/ui/curricula/champions/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curriculumId: selectedCurriculumId,
          skillpilotId: trimmedSkillpilotId,
          githubId: 'oauth', // Backend ignores this
          topicId: formState.topicId || null,
        }),
      })
      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null)
          const message = data?.message || data?.error
          throw new Error(message || t.curriculaPage.registration.errors.failed)
        }
        const text = await res.text()
        throw new Error(text || t.curriculaPage.registration.errors.failed)
      }
      await res.json()
      setSubmitSuccess(t.curriculaPage.registration.success)
      setFormState((prev) => ({
        ...prev,
        skillpilotId: '',
        githubId: '',
      }))
      setSkillpilotStatus('idle')
      setSkillpilotMessage('')
      loadData()
      fetchUser()
    } catch (err) {
      setSubmitError((err as Error).message || t.curriculaPage.registration.errors.failed)
    } finally {
      setSubmitting(false)
    }
  }

  const generateNewId = async () => {
    setSkillpilotStatus('checking')
    setSkillpilotMessage(t.curriculaPage.registration.validation.skillpilotChecking)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners` : '/api/ui/learners'
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      const id = data.state?.skillpilotId || data.skillpilotId || data.learnerId || data.id
      if (!id) throw new Error('No ID in response')

      const newId = String(id)
      setFormState(prev => ({ ...prev, skillpilotId: newId }))
      setSkillpilotStatus('valid')
      setSkillpilotMessage(t.curriculaPage.registration.generated)
    } catch (err) {
      console.error('Failed to generate ID', err)
      setSkillpilotStatus('invalid')
      setSkillpilotMessage(t.curriculaPage.registration.errors.failed)
    }
  }

  const handleConnect = () => {
    window.location.href = '/oauth2/authorization/github'
  }

  const openDeregisterModal = () => {
    setSelectedDeregisterIds([])
    setShowDeregisterModal(true)
  }

  const closeDeregisterModal = () => {
    setShowDeregisterModal(false)
    setSelectedDeregisterIds([])
  }

  const handleDeregister = async () => {
    if (selectedDeregisterIds.length === 0) return

    try {
      const res = await fetch('/api/ui/curricula/champions/deregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedDeregisterIds)
      })
      if (res.ok) {
        closeDeregisterModal()
        fetchUser()
        loadData()
      }
    } catch (e) {
      console.error("Deregister failed", e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">
        {t.curriculaPage.loading}
      </div>
    )
  }

  if (!data || data.curricula.length === 0) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex flex-col items-center justify-center space-y-4 relative">
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-200">
          {t.startPage.cards.curricula?.title || 'Curricula'}
        </h1>
        <p className="text-text-secondary">{t.curriculaPage.noData.title}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 rounded-full border border-border-color transition-colors text-text-primary"
        >
          {t.curriculaPage.noData.button}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary overflow-y-auto transition-colors duration-300 relative">
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-10">
        <PublicPageHeader
          className="pt-10 md:pt-0"
          title={t.startPage.cards.curricula?.title || 'Curricula'}
          subtitle={t.curriculaPage.subtitle}
        />

        <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">
                {t.curriculaPage.intro.title}
              </h2>
              <p className="text-text-secondary mt-2">
                {t.curriculaPage.intro.description}
              </p>
            </div>
            <div className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/40 p-4">
              <img
                src={championComicSrc}
                alt={t.curriculaPage.intro.comicAlt}
                className="w-full h-auto rounded-xl"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.curriculaPage.intro.panels.map((panel, index) => (
                <div
                  key={`${panel.title}-${index}`}
                  className="rounded-2xl border border-border-color bg-white/60 dark:bg-slate-900/30 p-4"
                >
                  <div className="text-xs uppercase tracking-wider text-text-secondary">{panel.title}</div>
                  <div className="text-sm text-text-primary mt-2">{panel.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary">
                  {t.curriculaPage.registration.title}
                </h2>
                <p className="text-text-secondary mt-2">
                  {t.curriculaPage.registration.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistration((prev) => !prev)}
                className="text-sm text-sky-700 dark:text-sky-300 underline underline-offset-4 decoration-sky-300 hover:decoration-sky-500"
              >
                {showRegistration
                  ? t.curriculaPage.registration.toggleHide
                  : t.curriculaPage.registration.toggleShow}
              </button>
            </div>

            {!showRegistration && user && user.champions.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-100 dark:bg-sky-800 rounded-full">
                    <svg className="w-5 h-5 text-sky-600 dark:text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sky-900 dark:text-sky-200">
                      {championCopy.championSummary(user.champions.length)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openDeregisterModal}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:underline"
                >
                  {championCopy.stopChampionship}
                </button>
              </div>
            )}

            {showRegistration && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">
                      {t.curriculaPage.registration.curriculumLabel}
                    </label>
                    <CurriculumDropdown
                      currentLandscapeId={selectedCurriculumId}
                      onSelect={(nextCurriculumId) => {
                        setSelectedCurriculumId(nextCurriculumId)
                        setFormState((prev) => ({ ...prev, topicId: '' }))
                      }}
                      landscapes={curriculumOptions}
                      showCompatibilityViews={false}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">
                      {t.curriculaPage.registration.scopeLabel}
                    </label>
                    <select
                      value={formState.topicId}
                      onChange={(e) => setFormState(prev => ({ ...prev, topicId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 text-text-primary appearance-none invalid:text-text-secondary"
                    >
                      <option value="">{t.curriculaPage.registration.entireCurriculum}</option>
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id}>
                          {getTopicLabel(topic)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {user ? (
                    <>
                      {user.champions.length > 0 && (
                        <div className="mb-6 p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sky-900 dark:text-sky-300">{championCopy.activeChampionshipsTitle}</h3>
                              <p className="text-sm text-sky-700 dark:text-sky-400">
                                {championCopy.championSummary(user.champions.length)}.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={openDeregisterModal}
                              className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 text-sm font-medium shadow-sm hover:shadow transition-all border border-transparent hover:border-red-200"
                            >
                              {championCopy.stopChampionship}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-text-primary">
                            {t.curriculaPage.registration.skillpilotLabel}
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={formState.skillpilotId}
                              onChange={(event) => {
                                setFormState((prev) => ({
                                  ...prev,
                                  skillpilotId: event.target.value,
                                }))
                                setSkillpilotStatus('idle')
                                setSkillpilotMessage('')
                              }}
                              onBlur={() => {
                                if (formState.skillpilotId.trim()) {
                                  validateSkillpilotId()
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 text-text-primary"
                              placeholder={t.curriculaPage.registration.skillpilotPlaceholder}
                            />
                            <button
                              type="button"
                              onClick={generateNewId}
                              className="px-3 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-medium hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors whitespace-nowrap"
                            >
                              {t.curriculaPage.registration.generateId}
                            </button>
                          </div>
                          <div className="flex justify-between items-start">
                            <div />
                            {skillpilotStatus !== 'idle' && (
                              <div
                                className={`text-xs mt-1 ${skillpilotStatus === 'invalid'
                                  ? 'text-red-500'
                                  : skillpilotStatus === 'checking'
                                    ? 'text-text-secondary'
                                    : 'text-emerald-500'
                                  }`}
                              >
                                {skillpilotStatus === 'valid'
                                  ? t.curriculaPage.registration.validation.skillpilotValid
                                  : skillpilotMessage}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                          <span className="text-sm text-text-secondary">{curriculaViewCopy.loggedInAsGithubUser}</span>
                        </div>
                      </div>
                      {submitError && (
                        <div className="text-sm text-red-500">{submitError}</div>
                      )}
                      {submitSuccess && (
                        <div className="text-sm text-emerald-500">{submitSuccess}</div>
                      )}
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                        >
                          {submitting ? t.curriculaPage.registration.submitting : t.curriculaPage.registration.submit}
                        </button>

                        <button
                          type="button"
                          onClick={openDeregisterModal}
                          className="px-5 py-2.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
                        >
                          {championCopy.stopChampionship}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 gap-4">
                      <p className="text-text-secondary text-sm">
                        {t.curriculaPage.registration.connectPrompt}
                      </p>
                      <button
                        type="button"
                        onClick={handleConnect}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#24292F] text-white hover:bg-[#24292F]/90 transition-colors font-medium"
                      >
                        {championCopy.connectWithGithub}
                      </button>
                      <a
                        href="https://github.com/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        {t.curriculaPage.registration.createGithub}
                      </a>
                    </div>
                  )}

                </div>
              </form>
            )}

            <ConfirmModal
              isOpen={showDeregisterModal}
              onClose={closeDeregisterModal}
              onConfirm={handleDeregister}
              title={championCopy.deregisterModalTitle}
              confirmText={championCopy.deregisterModalConfirm}
              confirmClassName="bg-red-600 hover:bg-red-700"
              confirmDisabled={selectedDeregisterIds.length === 0}
            >
              <div className="space-y-4">
                <p>{championCopy.deregisterPrompt}</p>
                {deregisterGroups.length === 0 ? (
                  <p className="text-gray-500 italic">{championCopy.noActiveChampionships}</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {deregisterGroups.map(group => {
                      const detail = getDeregisterGroupDetail(group)
                      return (
                        <label key={group.curriculumId} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 dark:hover:bg-slate-800 p-2 rounded transition-colors">
                          <input type="checkbox"
                            checked={selectedDeregisterIds.includes(group.curriculumId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDeregisterIds([...selectedDeregisterIds, group.curriculumId])
                              } else {
                                setSelectedDeregisterIds(selectedDeregisterIds.filter(id => id !== group.curriculumId))
                              }
                            }}
                            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span className="flex-1 min-w-0">
                            <span className="block text-text-primary text-sm">{group.displayTitle}</span>
                            {detail && (
                              <span className="block text-xs text-text-secondary truncate">{detail}</span>
                            )}
                          </span>
                          <span className="text-xs text-text-secondary bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {getDeregisterGroupBadge(group)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </ConfirmModal>

          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">
                {t.curriculaPage.directory.title}
              </h2>
              <p className="text-text-secondary mt-2">
                {t.curriculaPage.directory.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-text-secondary">
                  {t.curriculaPage.directory.filters.championsLabel}
                </span>
                <div className="flex gap-1 rounded-lg border border-border-color bg-input-bg p-1">
                  {(['with', 'without', 'all'] as ChampionFilter[]).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setChampionFilter(filter)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${championFilter === filter
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                      {t.curriculaPage.directory.filters.champions[filter]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-text-secondary">
                  {t.curriculaPage.directory.filters.categoryLabel}
                </span>
                <div className="flex gap-1 rounded-lg border border-border-color bg-input-bg p-1">
                  {(['all', 'school', 'uni', 'other'] as CategoryFilter[]).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setCategoryFilter(filter)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${categoryFilter === filter
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                      {t.curriculaPage.directory.filters.categories[filter]}
                    </button>
                  ))}
                </div>
              </div>
              {CURRICULUM_QUALITY_FILTER_AVAILABLE && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-text-secondary">
                    {curriculaViewCopy.qualityFilterLabel}
                  </span>
                  <div className="flex gap-1 rounded-lg border border-border-color bg-input-bg p-1">
                    {(['green', 'orange', 'red', 'all'] as CurriculumQualityFilter[]).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setQualityFilter(filter)}
                        aria-pressed={qualityFilter === filter}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          qualityFilter === filter
                            ? qualityFilterActiveClass[filter]
                            : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {filter !== 'all' && (
                          <span
                            aria-hidden="true"
                            className={`h-2 w-2 rounded-full ${
                              qualityFilter === filter
                                ? 'bg-white'
                                : qualityStatusDotClass[filter]
                            }`}
                          />
                        )}
                        {curriculaViewCopy.qualityFilterOptions[filter]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {filteredCurricula.length === 0 ? (
            <div className="text-sm text-text-secondary">
              {t.curriculaPage.directory.filters.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCurricula.map((curriculum) => (
                <div
                  key={curriculum.curriculumId}
                  className="rounded-2xl border border-border-color bg-white/40 dark:bg-slate-800/40 p-5"
                >
                  {(() => {
                    const hasCurriculumCertificate = curriculum.champions.some(
                      (champion) =>
                        !champion.topicTitle && isChampionCertified(champion)
                    )
                    const curriculumTitle = getCurriculumTitle(curriculum)
                    const curriculumQuality = getCurriculumQuality(curriculum)
                    const showCurriculumQuality = curriculumQuality && !isCanonicalGymnasiumOverview(curriculum)
                    const qualityStatus = getCurriculumQualityStatus(
                      curriculum.curriculumId,
                      curriculum.qualityMaturity,
                    )
                    return (
                      <div className="text-lg font-semibold text-text-primary flex flex-wrap items-center gap-2">
                        <span>{curriculumTitle}</span>
                        {hasCurriculumCertificate && (
                          <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {showCurriculumQuality && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${maturityClass[curriculumQuality.maturity]}`}
                            title={getQualityTooltip(curriculumQuality, qualityCopy)}
                          >
                            {curriculumQuality.maturity}
                          </span>
                        )}
                        {CURRICULUM_QUALITY_FILTER_AVAILABLE && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${qualityStatusBadgeClass[qualityStatus]}`}
                            title={curriculaViewCopy.qualityStatusTitle(qualityStatus)}
                          >
                            <span
                              aria-hidden="true"
                              className={`h-2 w-2 rounded-full ${qualityStatusDotClass[qualityStatus]}`}
                            />
                            {curriculaViewCopy.qualityStatusLabels[qualityStatus]}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  <div className="text-sm text-text-secondary mt-1">
                    {getCurriculumDescription(curriculum) || t.curriculaPage.directory.noDescription}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-secondary">
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                        {t.curriculaPage.stats.goals}: {curriculum.totalAtomicGoals}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center">
                      {/* Hiding Mastered badge
                    <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/30">
                      {t.curriculaPage.stats.masteredShort}: {curriculum.totalMastered}
                    </span>
                    */}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <div className="text-xs text-text-secondary">
                      {/* Spacer or additional info */}
                    </div>
                  </div>

                  {CURRICULUM_QUALITY_FILTER_AVAILABLE && isCanonicalGymnasiumOverview(curriculum) && (() => {
                    const qualityRows = buildGymnasiumSubjectQualityRows(
                      curriculum.topLevelTopics,
                      curriculum.topLevelTopicsEn,
                      curriculum.subjectQuality,
                      localizedLanguage,
                    )
                    if (qualityRows.length === 0) return null
                    const hasMaturityDetails = qualityRows.some((row) => row.quality != null)
                    return (
                      <div className="mt-4 rounded-xl border border-border-color bg-white/60 p-3 dark:bg-slate-900/30">
                        <div className="text-xs uppercase tracking-wider text-text-secondary">
                          {qualityCopy.subjectStatusTitle}
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {qualityRows.map(({ subject, quality }) => {
                            const qualityStatus = getGymnasiumSubjectQualityStatus(
                              subject,
                              quality?.maturity,
                            )
                            const statusTitle = curriculaViewCopy.qualityStatusTitle(qualityStatus)
                            return (
                              <div
                                key={quality?.subject ?? subject}
                                className="flex items-center justify-between gap-2 rounded-lg border border-border-color bg-white/70 px-3 py-2 text-xs dark:bg-slate-900/40"
                                title={quality
                                  ? `${statusTitle} · ${getQualityTooltip(quality, qualityCopy)}`
                                  : statusTitle}
                              >
                                <span className="min-w-0 truncate font-medium text-text-primary">
                                  {subject}
                                </span>
                                <span className="flex shrink-0 items-center gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${qualityStatusBadgeClass[qualityStatus]}`}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className={`h-2 w-2 rounded-full ${qualityStatusDotClass[qualityStatus]}`}
                                    />
                                    {curriculaViewCopy.qualityStatusLabels[qualityStatus]}
                                  </span>
                                  {quality && (
                                    <span className={`rounded-full border px-2 py-0.5 font-semibold ${maturityClass[quality.maturity]}`}>
                                      {quality.maturity}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {hasMaturityDetails && (
                          <div className="mt-3 border-t border-border-color pt-3">
                            <div className="text-xs uppercase tracking-wider text-text-secondary">
                              {qualityCopy.legendTitle}
                            </div>
                            <div className="mt-2 grid gap-2 text-xs text-text-secondary sm:grid-cols-2">
                              {maturityOrder.map((level) => (
                                <div key={level} className="flex items-start gap-2">
                                  <span className={`shrink-0 rounded-full border px-2 py-0.5 font-semibold ${maturityClass[level]}`}>
                                    {level}
                                  </span>
                                  <span>{qualityCopy.legend[level]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Topics Preview */}
                  <div className="mt-4 border-t border-border-color pt-3">
                    <div className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                      {t.curriculaPage.directory.filters.scopeLabel || curriculaViewCopy.topicsLabel}
                    </div>
                    {(() => {
                      const topics = language === 'en'
                        ? (curriculum.topLevelTopicsEn && curriculum.topLevelTopicsEn.length > 0
                          ? curriculum.topLevelTopicsEn
                          : curriculum.topLevelTopics)
                        : curriculum.topLevelTopics
                      return topics && topics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic, idx) => {
                          const certified = curriculum.champions.some(
                            (champion) =>
                              getChampionTopicTitle(champion) === topic && isChampionCertified(champion),
                          )
                          const quality = getSubjectQuality(curriculum, topic)
                            ?? (isCanonicalGymnasiumOverview(curriculum)
                              ? curriculum.subjectQuality?.[idx] ?? null
                              : null)
                          const pillClass = certified
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-700/10 dark:ring-emerald-300/20 font-semibold'
                            : 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 ring-sky-700/10 dark:ring-sky-300/20'
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${pillClass} ring-1 ring-inset`}
                              title={quality ? getQualityTooltip(quality, qualityCopy) : undefined}
                            >
                              {topic}
                              {quality && (
                                <span className={`rounded-full border px-1.5 py-0 text-[10px] font-semibold ${maturityClass[quality.maturity]}`}>
                                  {quality.maturity}
                                </span>
                              )}
                              {certified && (
                                <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              )}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-text-secondary italic">
                        {curriculaViewCopy.noTopicsAvailable}
                      </div>
                    )
                    })()}
                  </div>

                  <div className="mt-4 border-t border-border-color pt-4">
                    <div className="text-xs uppercase tracking-wider text-text-secondary">
                      {t.curriculaPage.directory.championsLabel}
                    </div>
                    {curriculum.champions.length === 0 ? (
                      <div className="text-xs text-text-secondary mt-2">
                        {t.curriculaPage.directory.noChampions}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {curriculum.champions.map((champion, index) => {
                          const championTopicTitle = getChampionTopicTitle(champion)
                          const championQuality = championTopicTitle
                            ? getSubjectQuality(curriculum, championTopicTitle) ?? getSubjectQuality(curriculum, champion.topicTitle)
                            : getCurriculumQuality(curriculum)
                          return (
                          <div
                            key={`${curriculum.curriculumId}-${champion.githubId}-${index}`}
                            className="flex flex-col gap-3 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 p-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://github.com/${champion.githubId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-sky-700 dark:text-sky-300 hover:underline"
                                >
                                  @{champion.githubId}
                                </a>
                                {isChampionCertified(champion) && (
                                  <Trophy className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                              {championTopicTitle && (
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${isChampionCertified(champion)
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-700/10 dark:ring-emerald-300/20'
                                    : 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 ring-sky-700/10 dark:ring-sky-300/20'
                                    }`}
                                  title={championQuality ? getQualityTooltip(championQuality, qualityCopy) : undefined}
                                >
                                  {championTopicTitle}
                                  {championQuality && (
                                    <span className={`rounded-full border px-1.5 py-0 text-[10px] font-semibold ${maturityClass[championQuality.maturity]}`}>
                                      {championQuality.maturity}
                                    </span>
                                  )}
                                  {isChampionCertified(champion) && (
                                    <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                </span>
                              )}
                              <div className="text-xs text-text-secondary">
                                {t.curriculaPage.table.skillpilotId}: {champion.skillpilotIdMasked}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                              <div className="flex flex-col">
                                <span className="uppercase tracking-wider" title={championCopy.achievementsTooltip}>
                                  {t.curriculaPage.table.achievements}
                                </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {champion.masteredCount ?? 0}
                                  {champion.totalTopicGoals ? ` / ${champion.totalTopicGoals}` : ''}
                                </span>
                              </div>
                              {championQuality && (
                                <div className="flex flex-col">
                                  <span
                                    className="uppercase tracking-wider"
                                    title={getQualityTooltip(championQuality, qualityCopy)}
                                  >
                                    {qualityCopy.label}
                                  </span>
                                  <span className={`mt-0.5 inline-flex w-fit rounded-full border px-2 py-0.5 text-xs font-semibold ${maturityClass[championQuality.maturity]}`}>
                                    {championQuality.maturity}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="uppercase tracking-wider" title={championCopy.issuesTooltip}>
                                  {t.curriculaPage.table.issues}
                                </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {champion.issuesCount}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="uppercase tracking-wider" title={championCopy.pullRequestsTooltip}>
                                  {t.curriculaPage.table.prs}
                                </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {champion.pullRequestsCount}
                                </span>
                              </div>
                            </div>
                          </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center pt-8 pb-4">
          <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 hover:decoration-sky-500">
            {t.curriculaPage.back}
          </Link>
        </div>
      </div >
    </div >
  )
}
