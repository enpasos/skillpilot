import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'

interface UserCountPoint {
  date: string
  count: number
}

interface UserStatsResponse {
  totalUsers: number
  usersWithAchievements: number
  totalSeries: UserCountPoint[]
  achievementSeries: UserCountPoint[]
  generatedAt: string
}

type UserSeriesFilter = 'all' | 'achievements'

export const UsersView: React.FC = () => {
  const t = useTranslation()
  const { language } = useLanguage()
  const [data, setData] = useState<UserStatsResponse | null>(null)
  const [filter, setFilter] = useState<UserSeriesFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ui/users/stats')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`)
        }
        return res.json()
      })
      .then((payload: UserStatsResponse) => {
        setData(payload)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load user stats', err)
        setError(err?.message || 'Unknown error')
        setLoading(false)
      })
  }, [])

  const series = useMemo(() => {
    if (!data) return []
    return filter === 'achievements' ? data.achievementSeries : data.totalSeries
  }, [data, filter])

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'de-DE')
  }, [language])

  const percentFormatter = useMemo(() => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'de-DE', {
      style: 'percent',
      maximumFractionDigits: 1,
    })
  }, [language])

  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(language === 'en' ? 'en-US' : 'de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const chart = useMemo(() => {
    if (series.length === 0) {
      return {
        linePoints: '',
        areaPath: '',
        maxCount: 1,
        startDate: null,
        endDate: null,
      }
    }

    const maxCount = Math.max(...series.map((point) => point.count), 1)
    const points = series.map((point, index) => {
      const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100
      const y = 100 - (point.count / maxCount) * 100
      return { x, y, date: point.date }
    })

    const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
    const areaPath = points.length
      ? `M ${points[0].x},100 L ${linePoints} L ${points[points.length - 1].x},100 Z`
      : ''

    return {
      linePoints,
      areaPath,
      maxCount,
      startDate: series[0]?.date || null,
      endDate: series[series.length - 1]?.date || null,
    }
  }, [series])

  const achievementRate =
    data && data.totalUsers > 0 ? data.usersWithAchievements / data.totalUsers : 0

  const usersT = t.usersPage || {}
  const statsT = usersT.stats || {}
  const chartT = usersT.chart || {}

  if (loading) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">
        {usersT.loading || 'Loading user stats...'}
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg font-semibold">{usersT.error || 'Failed to load user stats.'}</p>
        <p className="text-sm text-text-secondary">{error}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 rounded-full border border-border-color transition-colors text-text-primary"
        >
          {usersT.back || 'Back to SkillPilot'}
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">
        {usersT.empty || 'No user data yet.'}
      </div>
    )
  }

  const allActive = filter === 'all'
  const achievementsActive = filter === 'achievements'

  const cardBase =
    'rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5'
  const cardActive =
    'bg-white/70 dark:bg-slate-800/70 border-sky-400/60 shadow-xl'
  const cardInactive =
    'bg-white/40 dark:bg-slate-800/40 border-border-color hover:border-slate-300/60'

  const activeSeriesLabel = achievementsActive
    ? chartT.achievementsLabel || 'With achievements'
    : chartT.totalLabel || 'All users'

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary overflow-y-auto transition-colors duration-300 relative">
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <header className="text-center space-y-3 pt-10 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 dark:from-sky-300 dark:via-cyan-300 dark:to-emerald-300">
              {usersT.title || 'Users'}
            </span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {usersT.subtitle || 'Overview of registered SkillPilot users.'}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            aria-pressed={allActive}
            className={`${cardBase} ${allActive ? cardActive : cardInactive}`}
            onClick={() => setFilter('all')}
          >
            <div className="text-xs uppercase tracking-widest text-text-secondary">
              {statsT.total || 'Total users'}
            </div>
            <div className="mt-3 text-3xl font-bold text-text-primary">
              {numberFormatter.format(data.totalUsers)}
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              {statsT.totalHint || chartT.totalLabel || 'All users'}
            </div>
          </button>

          <button
            type="button"
            aria-pressed={achievementsActive}
            className={`${cardBase} ${achievementsActive ? cardActive : cardInactive}`}
            onClick={() => setFilter('achievements')}
          >
            <div className="text-xs uppercase tracking-widest text-text-secondary">
              {statsT.achievements || 'Users with achievements'}
            </div>
            <div className="mt-3 text-3xl font-bold text-text-primary">
              {numberFormatter.format(data.usersWithAchievements)}
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              {statsT.achievementsHint || 'At least one mastered goal (>= 0.9)'}
            </div>
            <div className="mt-2 text-xs text-sky-500 dark:text-sky-300 font-semibold">
              {statsT.rate || 'Achievement rate'}: {percentFormatter.format(achievementRate)}
            </div>
          </button>
        </section>

        <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {chartT.title || 'User count over time'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>{chartT.subtitle || 'Cumulative total'}</span>
                <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                  {activeSeriesLabel}
                </span>
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              {chartT.lastUpdated || 'Updated'}: {formatDateTime(data.generatedAt)}
            </div>
          </div>

          {series.length === 0 ? (
            <div className="mt-8 text-center text-sm text-text-secondary">
              {chartT.empty || 'No time series data yet.'}
            </div>
          ) : (
            <div className="mt-6">
              <div className="relative h-48 w-full">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <linearGradient id="usersTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {chart.areaPath && (
                    <path d={chart.areaPath} fill="url(#usersTrendFill)" />
                  )}
                  {chart.linePoints && (
                    <polyline
                      points={chart.linePoints}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  )}
                </svg>
                <div className="absolute top-3 right-4 text-xs text-text-secondary">
                  {numberFormatter.format(chart.maxCount)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                <span>{chart.startDate ? formatDate(chart.startDate) : ''}</span>
                <span>{chart.endDate ? formatDate(chart.endDate) : ''}</span>
              </div>
            </div>
          )}
        </section>

        <div className="text-center pt-6 pb-4">
          <Link
            to="/"
            className="text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 hover:decoration-sky-500"
          >
            {usersT.back || 'Back to SkillPilot'}
          </Link>
        </div>
      </div>
    </div>
  )
}
