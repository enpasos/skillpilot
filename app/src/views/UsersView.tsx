import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowLeft } from 'lucide-react'

interface UserCountPoint {
  date: string
  count: number
}

interface UserStatsResponse {
  totalUsers: number
  totalSeries: UserCountPoint[]
  generatedAt: string
}

export const UsersView: React.FC = () => {
  const t = useTranslation()
  const { language } = useLanguage()
  const [data, setData] = useState<UserStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'WITH_ACHIEVEMENTS' | 'ACTIVE_LAST_WEEK'>('ALL')

  useEffect(() => {
    // Note: setLoading(true) is handled by the filter change handlers or initial state
    // to avoid "setState in effect" warnings, except for initial mount which we rely on initial state.
    // However, to ensure it shows loading on re-fetches triggered by other things (if any), 
    // we strictly should handle it. 
    // For now, we'll assume setters handle explicit loading states or we accept a brief "stale" display 
    // if we don't set it here. 
    // BUT, for simplicity in this specific fix, let's keep it simple:
    // The fetch automatically handles the 'fulfillment' (loading=false). 
    // If we want to show loading *during* the fetch when filter changes, we should set it in the handler.

    fetch(`/api/ui/users/stats?filter=${filter}`)
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
  }, [filter])

  const handleFilterChange = (newFilter: 'ALL' | 'WITH_ACHIEVEMENTS' | 'ACTIVE_LAST_WEEK') => {
    if (filter !== newFilter) {
      setFilter(newFilter)
      setLoading(true)
    }
  }

  const series = useMemo(() => data?.totalSeries || [], [data])

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'de-DE')
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

  const usersT = t.usersPage || {}
  const chartT = usersT.chart || {}

  if (loading) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">
        {usersT.loading || 'Loading stats...'}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg font-semibold">{usersT.error || 'Failed to load user stats.'}</p>
        <p className="text-sm text-text-secondary">{error}</p>
        <Link
          to="/stats"
          className="text-sky-500 hover:underline"
        >
          Back to Statistics
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

      <div className="absolute top-6 left-6">
        <Link to="/stats" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-secondary">
          <ArrowLeft size={24} />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8 pt-20">
        <header className="text-center space-y-3 pt-10 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
            SkillPilot IDs
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Overview of generated SkillPilot IDs.
          </p>
        </header>

        {/* Filter Controls */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('WITH_ACHIEVEMENTS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'WITH_ACHIEVEMENTS' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              With Successes
            </button>
            <button
              onClick={() => handleFilterChange('ACTIVE_LAST_WEEK')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ACTIVE_LAST_WEEK' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Active Last Week
            </button>
          </div>
        </div>

        <section className="text-center py-6">
          <div className="mt-3 text-3xl font-bold">
            {data ? numberFormatter.format(data.totalUsers) : '-'}
          </div>
          <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mt-2">
            SkillPilot-IDs
          </div>
        </section>

        <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {chartT.title || 'User count over time'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>{chartT.subtitle || 'Cumulative total'}</span>
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
