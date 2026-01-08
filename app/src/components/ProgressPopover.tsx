import React, { useState, useEffect, useRef } from 'react'
import { Check, Activity, X } from 'lucide-react'
import type { UiGoal } from '../goalTypes'

interface MasteryHistoryEntry {
    goalId: string
    timestamp: string // ISO string
    value: number
}

interface ProgressPopoverProps {
    skillpilotId: string
    children: React.ReactNode
    goalIndexAll: Map<string, UiGoal> // To look up titles
}

export const ProgressPopover: React.FC<ProgressPopoverProps> = ({
    skillpilotId,
    children,
    goalIndexAll
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [history, setHistory] = useState<MasteryHistoryEntry[]>([])
    const [loading, setLoading] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/ui/learners/${skillpilotId}/history`)
            if (res.ok) {
                const data = await res.json()
                setHistory(data)
            }
        } catch (e) {
            console.error("Failed to fetch history", e)
        } finally {
            setLoading(false)
        }
    }

    const toggleOpen = () => {
        if (!isOpen) {
            fetchHistory()
        }
        setIsOpen(!isOpen)
    }

    // --- Statistics Logic ---

    // 1. Weekly Velocity (Last 8 weeks)
    const getWeeklyVelocity = () => {
        const weeks: Record<string, number> = {}
        const now = new Date()
        // Initialize last 8 weeks with 0
        for (let i = 7; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - (i * 7))
            const weekKey = `${d.getFullYear()}-W${getWeekNumber(d)}`
            weeks[weekKey] = 0
        }

        history.forEach(entry => {
            const d = new Date(entry.timestamp)
            const weekKey = `${d.getFullYear()}-W${getWeekNumber(d)}`
            if (weeks[weekKey] !== undefined) {
                weeks[weekKey]++
            }
        })

        return Object.entries(weeks).map(([key, count]) => ({ key, count }))
    }

    const getWeekNumber = (d: Date) => {
        const onejan = new Date(d.getFullYear(), 0, 1)
        const millisecsInDay = 86400000
        return Math.ceil((((d.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7)
    }

    const weeklyData = getWeeklyVelocity()
    const maxVelocity = Math.max(...weeklyData.map(w => w.count), 1) // Avoid div by zero

    // 2. Recent Achievements (Last 5)
    const recentAchievements = history.slice(0, 5).map(h => {
        const goal = goalIndexAll.get(h.goalId)
        return {
            title: goal?.title || "Unknown Goal",
            date: new Date(h.timestamp).toLocaleDateString()
        }
    })

    return (
        <div className="relative inline-block" ref={popoverRef}>
            <div onClick={toggleOpen} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors p-1">
                {children}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Activity size={18} className="text-skillpilot-primary" />
                            Learning Velocity
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Chart */}
                        <div>
                            <div className="flex items-end justify-between h-24 gap-1 mb-2">
                                {weeklyData.map((w) => (
                                    <div key={w.key} className="flex-1 flex flex-col justify-end items-center group">
                                        <div
                                            className="w-full bg-skillpilot-primary/20 dark:bg-skillpilot-primary/30 rounded-t-sm group-hover:bg-skillpilot-primary/40 transition-all relative"
                                            style={{ height: `${(w.count / maxVelocity) * 100}%`, minHeight: w.count > 0 ? '4px' : '0' }}
                                        >
                                            {w.count > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-skillpilot-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {w.count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-xs text-slate-400">Goals Mastered / Week (Last 8 Weeks)</p>
                        </div>

                        {/* Recent List */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Achievements</h4>
                            {loading ? (
                                <div className="text-center py-4 text-sm text-slate-400 italic">Loading history...</div>
                            ) : recentAchievements.length > 0 ? (
                                <div className="space-y-3">
                                    {recentAchievements.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 text-green-500 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-700 dark:text-slate-200 truncate" title={item.title}>
                                                    {item.title}
                                                </div>
                                                <div className="text-xs text-slate-400">{item.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-slate-400 italic">No mastered goals yet. Keep going!</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
