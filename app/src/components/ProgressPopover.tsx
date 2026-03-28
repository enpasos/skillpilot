import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check, Activity, X } from 'lucide-react'
import type { UiGoal } from '../goalTypes'
import { useTranslation } from '../hooks/useTranslation'
import { InlineMathText } from './InlineMathText'
import {
    LEARNER_UI_REFRESH_EVENT,
    type LearnerUiRefreshDetail,
} from '../utils/learnerUiEvents'

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
    // Explicitly casting to any to bypass potential TS issues with the hook signature during build if not updated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tAny = useTranslation() as any
    const t = tAny

    const [isOpen, setIsOpen] = useState(false)
    const [history, setHistory] = useState<MasteryHistoryEntry[]>([])
    const [loading, setLoading] = useState(false)

    // Refs
    const triggerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    // Position
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node
            // Close if click is outside BOTH content and trigger
            const clickInContent = contentRef.current && contentRef.current.contains(target)
            const clickInTrigger = triggerRef.current && triggerRef.current.contains(target)

            if (isOpen && !clickInContent && !clickInTrigger) {
                setIsOpen(false)
            }
        }

        // Handle window resize/scroll to close (simple) or update position
        function handleScrollResize() {
            if (isOpen) setIsOpen(false)
        }

        document.addEventListener("mousedown", handleClickOutside)
        window.addEventListener("resize", handleScrollResize)
        window.addEventListener("scroll", handleScrollResize, true) // capture

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("resize", handleScrollResize)
            window.removeEventListener("scroll", handleScrollResize, true)
        }
    }, [isOpen])

    const fetchHistory = useCallback(async () => {
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
    }, [skillpilotId])

    useEffect(() => {
        if (!isOpen) return
        void fetchHistory()
    }, [isOpen, fetchHistory])

    useEffect(() => {
        const handleLearnerRefresh = (event: Event) => {
            if (!isOpen) return
            const detail = (event as CustomEvent<LearnerUiRefreshDetail>).detail
            if (!detail || detail.skillpilotId !== skillpilotId) return
            if (detail.targets && !detail.targets.includes('all') && !detail.targets.includes('history')) return
            void fetchHistory()
        }

        window.addEventListener(LEARNER_UI_REFRESH_EVENT, handleLearnerRefresh)
        return () => {
            window.removeEventListener(LEARNER_UI_REFRESH_EVENT, handleLearnerRefresh)
        }
    }, [fetchHistory, isOpen, skillpilotId])

    const toggleOpen = () => {
        if (!isOpen) {
            // Calculate position before opening
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect()
                setPosition({
                    top: rect.bottom + window.scrollY + 8, // 8px gap
                    left: rect.left + window.scrollX
                })
            }
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }

    // --- Statistics Logic ---

    const getStartOfWeekKey = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
        d.setDate(diff);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${dayOfMonth}`;
    }

    const getWeeklyVelocity = () => {
        const weeks: Record<string, number> = {}
        const now = new Date()

        // Initialize last 8 weeks with 0
        for (let i = 7; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - (i * 7))
            const weekKey = getStartOfWeekKey(d)
            weeks[weekKey] = 0
        }

        history.forEach(entry => {
            const d = new Date(entry.timestamp)
            const weekKey = getStartOfWeekKey(d)

            if (weeks[weekKey] !== undefined) {
                weeks[weekKey]++
            } else {
                console.warn('[Velocity] Key not in window:', weekKey)
            }
        })

        return Object.entries(weeks).map(([key, count]) => ({ key, count }))
    }

    const weeklyData = getWeeklyVelocity().sort((a, b) => a.key.localeCompare(b.key))
    const maxVelocity = Math.max(...weeklyData.map(w => w.count), 1)

    const recentAchievements = history.slice(0, 5).map(h => {
        const goal = goalIndexAll.get(h.goalId)
        return {
            title: goal?.title || "Unknown Goal",
            date: new Date(h.timestamp).toLocaleDateString()
        }
    })

    const velocityT = t.learner?.velocity || {}

    return (
        <>
            <div ref={triggerRef} onClick={toggleOpen} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors p-1 inline-block">
                {children}
            </div>

            {isOpen && createPortal(
                <div
                    ref={contentRef}
                    className="absolute z-[9999] w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: position.top,
                        left: position.left,
                        // Prevent going off-screen right
                        transform: (position.left + 384 > window.innerWidth) ? 'translateX(-100%)' : 'none',
                        marginLeft: (position.left + 384 > window.innerWidth) ? '2rem' : '0'
                    }}
                >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Activity size={18} className="text-sky-600 dark:text-sky-400" />
                            {velocityT.title || "Learning Velocity"}
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
                                    <div key={w.key} className="flex-1 flex flex-col justify-end items-center group h-full">
                                        <div
                                            className="w-full bg-sky-500/20 dark:bg-sky-400/30 rounded-t-sm group-hover:bg-sky-500/40 transition-all relative"
                                            style={{ height: `${(w.count / maxVelocity) * 100}%`, minHeight: w.count > 0 ? '4px' : '0' }}
                                        >
                                            {w.count > 0 && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {w.count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-xs text-slate-400">{velocityT.chartLabel || "Goals / Week"}</p>
                        </div>

                        {/* Recent List */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{velocityT.recent || "Recent"}</h4>
                            {loading ? (
                                <div className="text-center py-4 text-sm text-slate-400 italic">{velocityT.loading || "Loading..."}</div>
                            ) : recentAchievements.length > 0 ? (
                                <div className="space-y-3">
                                    {recentAchievements.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 text-green-500 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <InlineMathText
                                                    text={item.title}
                                                    title={item.title}
                                                    className="font-medium text-slate-700 dark:text-slate-200 truncate"
                                                />
                                                <div className="text-xs text-slate-400">{item.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-slate-400 italic">{velocityT.none || "No goals yet"}</div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
