import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { useLanguage } from '../contexts/LanguageContext'
import { Trophy, ArrowLeft } from 'lucide-react'

interface UserCountPoint {
    date: string
    count: number
}

interface UserStatsResponse {
    totalSuccesses: number
    successSeries: UserCountPoint[]
    generatedAt: string
}

export const SuccessView: React.FC = () => {
    const { language } = useLanguage()
    const [data, setData] = useState<UserStatsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/ui/users/stats')
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed with ${res.status}`)
                return res.json()
            })
            .then((payload: UserStatsResponse) => {
                setData(payload)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Failed to load stats', err)
                setError(err?.message || 'Unknown error')
                setLoading(false)
            })
    }, [])

    const series = useMemo(() => data?.successSeries || [], [data])

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
        if (series.length === 0) return { linePoints: '', areaPath: '', maxCount: 1, startDate: null, endDate: null }

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

    if (loading) {
        return <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">Loading...</div>
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex flex-col items-center justify-center space-y-4">
                <p className="text-lg font-semibold">Failed to load data.</p>
                <Link to="/stats" className="text-sky-500 hover:underline">Back to Statistics</Link>
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
                    title="Learning Successes"
                    subtitle="Cumulative number of mastered learning goals."
                    icon={(
                        <span className="inline-flex items-center justify-center rounded-full bg-amber-100/50 p-4 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <Trophy size={40} strokeWidth={1.5} />
                        </span>
                    )}
                />

                <section className="text-center py-6">
                    <div className="text-6xl font-black tracking-tighter">
                        {numberFormatter.format(data.totalSuccesses)}
                    </div>
                    <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mt-2">
                        Total Mastered Goals
                    </div>
                </section>

                <section className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">Success Trend</h2>
                            <div className="text-sm text-text-secondary">Cumulative growth over time</div>
                        </div>
                        <div className="text-xs text-text-secondary">
                            Updated: {formatDateTime(data.generatedAt)}
                        </div>
                    </div>

                    {series.length === 0 ? (
                        <div className="mt-8 text-center text-sm text-text-secondary">No data yet.</div>
                    ) : (
                        <div className="mt-6">
                            <div className="relative h-64 w-full">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                                    <defs>
                                        <linearGradient id="successTrendFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
                                        </linearGradient>
                                    </defs>
                                    {chart.areaPath && <path d={chart.areaPath} fill="url(#successTrendFill)" />}
                                    {chart.linePoints && <polyline points={chart.linePoints} fill="none" stroke="#fbbf24" strokeWidth="2" />}
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
            </div>
        </div>
    )
}
