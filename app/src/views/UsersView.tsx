import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { Users, ArrowLeft } from 'lucide-react'
import { getUsersOperatorCopy, getUsersPageCopy } from '../utils/usersViewCopy'

interface UserCountPoint {
  date: string
  count: number
}

interface UserStatsResponse {
  totalUsers: number
  totalSeries: UserCountPoint[]
  generatedAt: string
}

interface BulkCanonicalGymnasiumCutoverResult {
  skillpilotId: string
  status: string
  previousCurriculumId?: string | null
  resultingCurriculumId?: string | null
  normalizedPlannedGoalCount: number
  message?: string | null
}

interface BulkCanonicalGymnasiumCutoverResponse {
  dryRun: boolean
  requestedCount: number
  migratedCount: number
  eligibleCount: number
  alreadyCanonicalCount: number
  unsupportedCount: number
  noCurriculumCount: number
  notFoundCount: number
  errorCount: number
  results: BulkCanonicalGymnasiumCutoverResult[]
}

const escapeCsvCell = (value: string | number | null | undefined) => {
  const normalized = value == null ? '' : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

export const UsersView: React.FC = () => {
  const t = useTranslation()
  const { language } = useLanguage()
  const [data, setData] = useState<UserStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'WITH_ACHIEVEMENTS' | 'ACTIVE_LAST_WEEK'>('ALL')
  const [bulkInput, setBulkInput] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkResponse, setBulkResponse] = useState<BulkCanonicalGymnasiumCutoverResponse | null>(null)

  const usersT = t.usersPage || {}
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const pageDefaults = getUsersPageCopy(localizedLanguage)
  const pageT = {
    title: usersT.title || pageDefaults.title,
    subtitle: usersT.subtitle || pageDefaults.subtitle,
    loading: usersT.loading || pageDefaults.loading,
    error: usersT.error || pageDefaults.error,
    unknownError: pageDefaults.unknownError,
    backToStats: (usersT as { backToStats?: string }).backToStats || pageDefaults.backToStats,
    backToSkillPilot: usersT.back || pageDefaults.backToSkillPilot,
  }
  const rawStatsT = (usersT.stats || {}) as Partial<typeof pageDefaults.stats>
  const rawFiltersT = (usersT.filters || {}) as Partial<typeof pageDefaults.filters>
  const rawChartT = (usersT.chart || {}) as Partial<typeof pageDefaults.chart>
  const statsT = { ...pageDefaults.stats, ...rawStatsT }
  const filtersT = { ...pageDefaults.filters, ...rawFiltersT }
  const chartT = { ...pageDefaults.chart, ...rawChartT }
  const operatorDefaults = getUsersOperatorCopy(localizedLanguage)
  const rawOperatorT = (usersT.operator || {}) as Partial<typeof operatorDefaults> & { statusLabels?: Record<string, string> }
  const operatorT = {
    ...operatorDefaults,
    ...rawOperatorT,
    statusLabels: {
      ...operatorDefaults.statusLabels,
      ...(rawOperatorT.statusLabels || {}),
    },
  }

  useEffect(() => {
    // Note: setLoading(true) is handled by the filter change handlers or initial state
    // to avoid "setState in effect" warnings.
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
        setError(err?.message || pageT.unknownError)
        setLoading(false)
      })
  }, [filter, pageT.unknownError])

  const handleFilterChange = (newFilter: 'ALL' | 'WITH_ACHIEVEMENTS' | 'ACTIVE_LAST_WEEK') => {
    if (filter !== newFilter) {
      setFilter(newFilter)
      setLoading(true)
    }
  }

  const parsedSkillpilotIds = useMemo(() => {
    return Array.from(
      new Set(
        bulkInput
          .split(/[\s,;]+/)
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    )
  }, [bulkInput])

  const statusLabel = (status: string) => {
    return operatorT.statusLabels[status] || status
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'migrated':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'eligible':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
      case 'already_canonical':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
      case 'unsupported_curriculum':
      case 'no_curriculum':
      case 'not_found':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
  }

  const eligibleSkillpilotIds = useMemo(() => {
    if (!bulkResponse) {
      return []
    }
    return bulkResponse.results
      .filter((result) => result.status === 'eligible')
      .map((result) => result.skillpilotId)
  }, [bulkResponse])

  const runBulkCutover = async (dryRun: boolean) => {
    if (parsedSkillpilotIds.length === 0) {
      setBulkError(operatorT.validationRequired)
      return
    }

    if (!dryRun) {
      const defaultConfirmation = typeof operatorDefaults.confirmation === 'function'
        ? operatorDefaults.confirmation(parsedSkillpilotIds.length)
        : operatorDefaults.confirmation
      const confirmationMessage = typeof operatorT.confirmation === 'function'
        ? operatorT.confirmation(parsedSkillpilotIds.length)
        : operatorT.confirmation || defaultConfirmation
      if (!window.confirm(confirmationMessage)) {
        return
      }
    }

    setBulkLoading(true)
    setBulkError(null)
    try {
      const response = await fetch('/api/ui/learners/cutover/canonical-gymnasium/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillpilotIds: parsedSkillpilotIds,
          dryRun,
        }),
      })
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`)
      }
      const payload: BulkCanonicalGymnasiumCutoverResponse = await response.json()
      setBulkResponse(payload)
    } catch (err) {
      console.error('Failed to run canonical gymnasium bulk cutover', err)
      setBulkError(
        (err as Error)?.message || operatorT.runFailed,
      )
    } finally {
      setBulkLoading(false)
    }
  }

  const adoptEligibleIdsFromResults = () => {
    if (eligibleSkillpilotIds.length === 0) {
      return
    }
    setBulkInput(eligibleSkillpilotIds.join('\n'))
    setBulkError(null)
  }

  const downloadBulkResultsCsv = () => {
    if (!bulkResponse) {
      return
    }

    const header = [
      'skillpilotId',
      'status',
      'previousCurriculumId',
      'resultingCurriculumId',
      'normalizedPlannedGoalCount',
      'message',
    ]
    const rows = bulkResponse.results.map((result) => [
      escapeCsvCell(result.skillpilotId),
      escapeCsvCell(result.status),
      escapeCsvCell(result.previousCurriculumId),
      escapeCsvCell(result.resultingCurriculumId),
      escapeCsvCell(result.normalizedPlannedGoalCount),
      escapeCsvCell(result.message),
    ])
    const csvContent = ['\uFEFF' + header.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    const mode = bulkResponse.dryRun ? 'dry-run' : 'migration'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    link.href = URL.createObjectURL(blob)
    link.download = `canonical-gymnasium-cutover-${mode}-${timestamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
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

  const getTotalLabel = () => {
    switch (filter) {
      case 'WITH_ACHIEVEMENTS': return statsT.achievements
      case 'ACTIVE_LAST_WEEK': return filtersT.activeLastWeek
      default: return statsT.total
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">
        {pageT.loading}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-lg font-semibold">{pageT.error}</p>
        <p className="text-sm text-text-secondary">{error}</p>
        <Link
          to="/stats"
          className="text-sky-500 hover:underline"
        >
          {pageT.backToStats}
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
        <PublicPageHeader
          className="pt-10 md:pt-0"
          title={pageT.title}
          subtitle={pageT.subtitle}
          icon={(
            <span className="inline-flex items-center justify-center rounded-full bg-sky-100/50 p-4 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
              <Users size={40} strokeWidth={1.5} />
            </span>
          )}
        />

        {/* Filter Controls */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {filtersT.all}
            </button>
            <button
              onClick={() => handleFilterChange('WITH_ACHIEVEMENTS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'WITH_ACHIEVEMENTS' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {filtersT.withAchievements}
            </button>
            <button
              onClick={() => handleFilterChange('ACTIVE_LAST_WEEK')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ACTIVE_LAST_WEEK' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {filtersT.activeLastWeek}
            </button>
          </div>
        </div>

        <section className="text-center py-6">
          <div className="text-6xl font-black tracking-tighter">
            {data ? numberFormatter.format(data.totalUsers) : '-'}
          </div>
          <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mt-2">
            {getTotalLabel()}
          </div>
        </section>

        <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {chartT.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>{chartT.subtitle}</span>
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              {chartT.lastUpdated}: {formatDateTime(data.generatedAt)}
            </div>
          </div>

          {series.length === 0 ? (
            <div className="mt-8 text-center text-sm text-text-secondary">
              {chartT.empty}
            </div>
          ) : (
            <div className="mt-6">
              <div className="relative h-64 w-full">
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
                <div className="absolute top-2 right-2 text-xs font-mono bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded text-text-secondary">
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

        <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {operatorT.title}
              </h2>
              <p className="mt-2 text-text-secondary">
                {operatorT.description}
              </p>
            </div>

            <div className="rounded-2xl border border-border-color bg-white/60 dark:bg-slate-900/30 p-4 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">
                  {operatorT.inputLabel}
                </label>
                <textarea
                  value={bulkInput}
                  onChange={(event) => setBulkInput(event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/40 px-4 py-3 text-sm text-text-primary"
                  placeholder={operatorT.inputPlaceholder}
                />
                <div className="text-xs text-text-secondary">
                  {operatorT.idCountLabel}: {parsedSkillpilotIds.length}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => runBulkCutover(true)}
                  disabled={bulkLoading || parsedSkillpilotIds.length === 0}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bulkLoading
                    ? operatorT.previewPending
                    : operatorT.previewAction}
                </button>
                <button
                  type="button"
                  onClick={() => runBulkCutover(false)}
                  disabled={bulkLoading || parsedSkillpilotIds.length === 0}
                  className="inline-flex items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/15 px-5 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-300"
                >
                  {bulkLoading
                    ? operatorT.executePending
                    : operatorT.executeAction}
                </button>
              </div>

              {bulkError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {bulkError}
                </div>
              )}
            </div>

            {bulkResponse && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                  {[
                    ['requestedCount', operatorT.requested],
                    ['eligibleCount', operatorT.eligible],
                    ['migratedCount', operatorT.migrated],
                    ['alreadyCanonicalCount', operatorT.alreadyCanonical],
                    ['unsupportedCount', operatorT.unsupported],
                    ['noCurriculumCount', operatorT.noCurriculum],
                    ['notFoundCount', operatorT.notFound],
                    ['errorCount', operatorT.errors],
                  ].map(([key, label]) => (
                    <div key={key} className="rounded-2xl border border-border-color bg-white/60 dark:bg-slate-900/30 p-3">
                      <div className="text-xs uppercase tracking-wider text-text-secondary">{label}</div>
                      <div className="mt-2 text-2xl font-bold text-text-primary">
                        {numberFormatter.format(bulkResponse[key as keyof BulkCanonicalGymnasiumCutoverResponse] as number || 0)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border-color bg-white/60 dark:bg-slate-900/30 overflow-hidden">
                  <div className="border-b border-border-color px-4 py-3 text-sm font-medium text-text-primary">
                    {bulkResponse.dryRun
                      ? operatorT.resultsPreview
                      : operatorT.resultsExecution}
                  </div>
                  <div className="flex flex-wrap gap-3 border-b border-border-color px-4 py-3">
                    <button
                      type="button"
                      onClick={adoptEligibleIdsFromResults}
                      disabled={eligibleSkillpilotIds.length === 0}
                      className="inline-flex items-center justify-center rounded-full border border-sky-300/60 bg-sky-500/10 px-4 py-2 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sky-300"
                    >
                      {operatorT.useEligibleIds}
                    </button>
                    <button
                      type="button"
                      onClick={downloadBulkResultsCsv}
                      className="inline-flex items-center justify-center rounded-full border border-border-color bg-white/70 px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-white dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                    >
                      {operatorT.exportCsv}
                    </button>
                  </div>
                  <div className="max-h-[28rem] overflow-auto">
                    <table className="min-w-full divide-y divide-border-color text-sm">
                      <thead className="bg-black/5 dark:bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-text-secondary">
                            {operatorT.tableSkillpilotId}
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-text-secondary">
                            {operatorT.tableStatus}
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-text-secondary">
                            {operatorT.tablePlannedGoals}
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-text-secondary">
                            {operatorT.tableMessage}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {bulkResponse.results.map((result) => (
                          <tr key={`${result.skillpilotId}-${result.status}`}>
                            <td className="px-4 py-3 font-mono text-xs text-text-primary">{result.skillpilotId}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(result.status)}`}>
                                {statusLabel(result.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-text-primary">{result.normalizedPlannedGoalCount}</td>
                            <td className="px-4 py-3 text-text-secondary">{result.message || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="text-center pt-6 pb-4">
          <Link
            to="/"
            className="text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 hover:decoration-sky-500"
          >
            {pageT.backToSkillPilot}
          </Link>
        </div>
      </div>
    </div>
  )
}
