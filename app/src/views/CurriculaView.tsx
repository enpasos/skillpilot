import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CurriculumDropdown, type LandscapeSummary } from '../components/CurriculumDropdown'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'

interface ChampionEntry {
  githubId: string
  skillpilotIdMasked: string
  masteredCount: number
  issuesCount: number
  pullRequestsCount: number
  registeredAt?: string
}

interface CurriculumEntry {
  curriculumId: string
  title: string
  description?: string
  subject?: string
  country?: string
  region?: string
  totalAtomicGoals: number
  totalMastered: number
  champions: ChampionEntry[]
}

interface CurriculaData {
  curricula: CurriculumEntry[]
  defaultCurriculumId: string
  lastUpdatedAt: string
}

const GITHUB_ID_PATTERN = /^[A-Za-z0-9-]{1,39}$/
type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid'
type ChampionFilter = 'with' | 'without' | 'all'
type CategoryFilter = 'all' | 'school' | 'uni' | 'other'

export const CurriculaView: React.FC = () => {
  const [data, setData] = useState<CurriculaData | null>(null)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [skillpilotStatus, setSkillpilotStatus] = useState<ValidationStatus>('idle')
  const [githubStatus, setGithubStatus] = useState<ValidationStatus>('idle')
  const [skillpilotMessage, setSkillpilotMessage] = useState('')
  const [githubMessage, setGithubMessage] = useState('')
  const [championFilter, setChampionFilter] = useState<ChampionFilter>('with')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showRegistration, setShowRegistration] = useState(false)
  const [formState, setFormState] = useState({
    skillpilotId: '',
    githubId: '',
  })
  const t = useTranslation()
  const { language } = useLanguage()

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
      description: curriculum.description,
      title: curriculum.title,
      schoolType: '',
    }))
  }, [data])

  const championComicSrc = language === 'de' ? '/comic3/champion.de.png' : '/comic3/champion.en.png'

  const getCategory = useCallback((curriculum: CurriculumEntry): CategoryFilter => {
    const title = (curriculum.title ?? '').toUpperCase()
    const subject = (curriculum.subject ?? '').toUpperCase()
    const combined = `${title} ${subject}`

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

      return championMatch && categoryMatch
    })
  }, [data, championFilter, categoryFilter, getCategory])

  const validateGithubId = useCallback((value?: string) => {
    const normalized = (value ?? formState.githubId).trim().replace(/^@/, '')
    if (!normalized) {
      setGithubStatus('invalid')
      setGithubMessage(t.curriculaPage.registration.errors.required)
      return false
    }
    if (!GITHUB_ID_PATTERN.test(normalized)) {
      setGithubStatus('invalid')
      setGithubMessage(t.curriculaPage.registration.errors.invalidGithub)
      return false
    }
    setGithubStatus('valid')
    setGithubMessage('')
    return true
  }, [formState.githubId, t])

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
    const trimmedGithubId = formState.githubId.trim().replace(/^@/, '')

    if (!selectedCurriculumId || !trimmedSkillpilotId || !trimmedGithubId) {
      setSubmitError(t.curriculaPage.registration.errors.required)
      return
    }

    const githubOk = githubStatus === 'valid' ? true : validateGithubId(trimmedGithubId)
    const skillpilotOk = await validateSkillpilotId(trimmedSkillpilotId)
    if (!githubOk || !skillpilotOk) {
      setSubmitError(t.curriculaPage.registration.errors.validationRequired)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/ui/curricula/champions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curriculumId: selectedCurriculumId,
          skillpilotId: trimmedSkillpilotId,
          githubId: trimmedGithubId,
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
      setGithubStatus('idle')
      setSkillpilotMessage('')
      setGithubMessage('')
      loadData()
    } catch (err) {
      setSubmitError((err as Error).message || t.curriculaPage.registration.errors.failed)
    } finally {
      setSubmitting(false)
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
        <header className="text-center space-y-4 pt-10 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
            {t.startPage.cards.curricula?.title || 'Curricula'}
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.curriculaPage.subtitle}
          </p>
        </header>

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
            {showRegistration && (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">
                    {t.curriculaPage.registration.curriculumLabel}
                  </label>
                  <CurriculumDropdown
                    currentLandscapeId={selectedCurriculumId}
                    onSelect={setSelectedCurriculumId}
                    landscapes={curriculumOptions}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">
                      {t.curriculaPage.registration.skillpilotLabel}
                    </label>
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
                    {skillpilotStatus !== 'idle' && (
                      <div
                        className={`text-xs ${skillpilotStatus === 'invalid'
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
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">
                      {t.curriculaPage.registration.githubLabel}
                    </label>
                    <input
                      value={formState.githubId}
                      onChange={(event) => {
                        setFormState((prev) => ({
                          ...prev,
                          githubId: event.target.value,
                        }))
                        setGithubStatus('idle')
                        setGithubMessage('')
                      }}
                      onBlur={() => {
                        if (formState.githubId.trim()) {
                          validateGithubId()
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 text-text-primary"
                      placeholder={t.curriculaPage.registration.githubPlaceholder}
                    />
                    {githubStatus !== 'idle' && (
                      <div
                        className={`text-xs ${githubStatus === 'invalid' ? 'text-red-500' : 'text-emerald-500'}`}
                      >
                        {githubStatus === 'valid'
                          ? t.curriculaPage.registration.validation.githubValid
                          : githubMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                {t.curriculaPage.registration.publicNote}
              </p>
              {submitError && (
                <div className="text-sm text-red-500">{submitError}</div>
              )}
              {submitSuccess && (
                <div className="text-sm text-emerald-500">{submitSuccess}</div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
              >
                {submitting ? t.curriculaPage.registration.submitting : t.curriculaPage.registration.submit}
              </button>
              </form>
            )}
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
                  <div className="text-lg font-semibold text-text-primary">
                    {curriculum.title}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {curriculum.description || t.curriculaPage.directory.noDescription}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-secondary">
                    {curriculum.subject && (
                      <span className="px-2 py-1 rounded-full border border-border-color bg-white/70 dark:bg-slate-900/40">
                        {curriculum.subject}
                      </span>
                    )}
                    {curriculum.region && (
                      <span className="px-2 py-1 rounded-full border border-border-color bg-white/70 dark:bg-slate-900/40">
                        {curriculum.region}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full border border-border-color bg-white/70 dark:bg-slate-900/40">
                      {t.curriculaPage.stats.goals}: {curriculum.totalAtomicGoals}
                    </span>
                    <span className="px-2 py-1 rounded-full border border-border-color bg-white/70 dark:bg-slate-900/40">
                      {t.curriculaPage.stats.masteredShort}: {curriculum.totalMastered}
                    </span>
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
                        {curriculum.champions.map((champion, index) => (
                          <div
                            key={`${curriculum.curriculumId}-${champion.githubId}-${index}`}
                            className="flex flex-col gap-3 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 p-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <a
                                href={`https://github.com/${champion.githubId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-sky-700 dark:text-sky-300 hover:underline"
                              >
                                @{champion.githubId}
                              </a>
                              <div className="text-xs text-text-secondary">
                                {t.curriculaPage.table.skillpilotId}: {champion.skillpilotIdMasked}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                              <div className="flex flex-col">
                                <span className="uppercase tracking-wider">
                                  {t.curriculaPage.table.achievements}
                                </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {champion.masteredCount}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="uppercase tracking-wider">
                                  {t.curriculaPage.table.issues}
                                </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {champion.issuesCount}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="uppercase tracking-wider">
                                  {t.curriculaPage.table.prs}
                                </span>
                                <span className="text-sm font-semibold text-text-primary">
                                  {champion.pullRequestsCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
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
      </div>
    </div>
  )
}
