/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CurriculumDropdown, type LandscapeSummary } from '../components/CurriculumDropdown'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { useTranslation } from '../hooks/useTranslation'

interface ChampionEntry {
  githubId: string
  skillpilotIdMasked: string
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

export const CurriculaView: React.FC = () => {
  const [data, setData] = useState<CurriculaData | null>(null)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    skillpilotId: '',
    githubId: '',
  })
  const t = useTranslation()

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

  const selectedCurriculum = useMemo(() => {
    return data?.curricula.find((c) => c.curriculumId === selectedCurriculumId)
  }, [data, selectedCurriculumId])

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const trimmedSkillpilotId = formState.skillpilotId.trim()
    const trimmedGithubId = formState.githubId.trim().replace(/^@/, '')

    if (!selectedCurriculumId || !trimmedSkillpilotId || !trimmedGithubId) {
      setSubmitError(t.curriculaPage.registration.errors.required)
      return
    }

    setSubmitting(true)
    fetch('/api/ui/curricula/champions', {
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
      .then(async (res) => {
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
        return res.json()
      })
      .then(() => {
        setSubmitSuccess(t.curriculaPage.registration.success)
        setFormState((prev) => ({
          ...prev,
          skillpilotId: '',
          githubId: '',
        }))
        loadData()
      })
      .catch((err) => {
        setSubmitError(err.message || t.curriculaPage.registration.errors.failed)
      })
      .finally(() => {
        setSubmitting(false)
      })
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
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">
                {t.curriculaPage.registration.title}
              </h2>
              <p className="text-text-secondary mt-2">
                {t.curriculaPage.registration.description}
              </p>
            </div>
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
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          skillpilotId: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 text-text-primary"
                      placeholder={t.curriculaPage.registration.skillpilotPlaceholder}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary">
                      {t.curriculaPage.registration.githubLabel}
                    </label>
                    <input
                      value={formState.githubId}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          githubId: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border-color bg-white/70 dark:bg-slate-900/40 text-text-primary"
                      placeholder={t.curriculaPage.registration.githubPlaceholder}
                    />
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
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">
              {t.curriculaPage.directory.title}
            </h2>
            <p className="text-text-secondary mt-2">
              {t.curriculaPage.directory.description}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.curricula.map((curriculum) => (
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
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">
              {t.curriculaPage.leaderboard.title}
            </h2>
            <p className="text-text-secondary mt-2">
              {t.curriculaPage.leaderboard.description}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <CurriculumDropdown
                currentLandscapeId={selectedCurriculumId}
                onSelect={setSelectedCurriculumId}
                landscapes={curriculumOptions}
              />
            </div>
          </div>

          {selectedCurriculum && (
            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 mb-8 border-b border-border-color pb-8">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-1">{selectedCurriculum.title}</h3>
                  <div className="text-sm text-text-secondary">
                    {t.curriculaPage.stats.mastered} <span className="text-orange-600 dark:text-orange-400 font-mono">{selectedCurriculum.totalMastered}</span>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{t.curriculaPage.stats.goals}</div>
                  <div className="text-3xl font-bold text-text-primary">{selectedCurriculum.totalAtomicGoals}</div>
                </div>
              </div>

              {selectedCurriculum.champions.length === 0 ? (
                <div className="text-text-secondary text-sm">
                  {t.curriculaPage.leaderboard.empty}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCurriculum.champions.map((champion, index) => (
                    <div
                      key={`${champion.githubId}-${index}`}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/30 border border-border-color"
                    >
                      <div>
                        <div className="text-lg font-semibold text-text-primary">
                          <a
                            href={`https://github.com/${champion.githubId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            @{champion.githubId}
                          </a>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {t.curriculaPage.table.skillpilotId}: {champion.skillpilotIdMasked}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <div className="flex flex-col items-end">
                          <span className="text-xs uppercase">{t.curriculaPage.table.issues}</span>
                          <span className="text-lg font-bold text-text-primary">{champion.issuesCount}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs uppercase">{t.curriculaPage.table.prs}</span>
                          <span className="text-lg font-bold text-text-primary">{champion.pullRequestsCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
