import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { useTranslation } from '../hooks/useTranslation'

interface TopLearner {
  learnerLabel: string
  score: number
}

interface CurriculumLeaderboard {
  curriculumId: string
  title: string
  totalAtomicGoals: number
  totalMastered: number
  topLearners: TopLearner[]
}

interface HallOfFameData {
  curricula: CurriculumLeaderboard[]
  defaultCurriculumId: string
  lastUpdatedAt: string
}

export const HallOfFameView: React.FC = () => {
  const [data, setData] = useState<HallOfFameData | null>(null)
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const t = useTranslation()

  useEffect(() => {
    fetch('/api/ui/hall-of-fame')
      .then((res) => res.json())
      .then((data: HallOfFameData) => {
        setData(data)
        if (data.defaultCurriculumId) {
          setSelectedCurriculumId(data.defaultCurriculumId)
        } else if (data.curricula.length > 0) {
          setSelectedCurriculumId(data.curricula[0].curriculumId)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load Hall of Fame', err)
        setLoading(false)
      })
  }, [])

  const selectedBoard = data?.curricula.find((c) => c.curriculumId === selectedCurriculumId)

  if (loading) {
    return (
      <div className="min-h-screen bg-chat-bg text-text-primary p-6 flex items-center justify-center">
        {t.hallOfFamePage.loading}
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
        <h1 className="text-3xl font-bold text-text-primary">
          {t.startPage.cards.hallOfFame?.title || "Hall of Fame"}
        </h1>
        <p className="text-text-secondary">{t.hallOfFamePage.noData.title}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 rounded-full border border-border-color transition-colors text-text-primary"
        >
          {t.hallOfFamePage.noData.button}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary overflow-y-auto transition-colors duration-300 relative">

      {/* Top Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 pt-10 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            {t.startPage.cards.hallOfFame?.title || "Hall of Fame"}
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            {t.hallOfFamePage.subtitle}
          </p>
        </header>

        {/* Filter */}
        <div className="flex justify-center">
          <div className="relative inline-block w-full max-w-md">
            <select
              value={selectedCurriculumId}
              onChange={(e) => setSelectedCurriculumId(e.target.value)}
              className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-800/80 border border-border-color rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-text-primary shadow-xl backdrop-blur-sm transition-all"
            >
              {data.curricula.map((c) => (
                <option key={c.curriculumId} value={c.curriculumId}>
                  {c.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        {selectedBoard && (
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-border-color p-6 md:p-10 shadow-2xl relative overflow-hidden transition-colors duration-300">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 mb-8 border-b border-border-color pb-8">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-1">{selectedBoard.title}</h2>
                <div className="text-sm text-text-secondary">
                  {t.hallOfFamePage.stats.mastered} <span className="text-orange-600 dark:text-orange-400 font-mono">{selectedBoard.totalMastered}</span>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{t.hallOfFamePage.stats.goals}</div>
                <div className="text-3xl font-bold text-text-primary">{selectedBoard.totalAtomicGoals}</div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedBoard.topLearners.map((learner, index) => {
                let rankColor = 'text-slate-500 dark:text-slate-400'
                let medal = null
                let bgClass = 'bg-slate-100/50 dark:bg-slate-700/30'

                if (index === 0) {
                  rankColor = 'text-yellow-600 dark:text-yellow-400'
                  bgClass = 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 dark:border-yellow-500/30'
                  medal = '🥇'
                } else if (index === 1) {
                  rankColor = 'text-slate-500 dark:text-slate-300'
                  bgClass = 'bg-slate-200/40 dark:bg-slate-700/40 border border-slate-300/30 dark:border-slate-500/30'
                  medal = '🥈'
                } else if (index === 2) {
                  rankColor = 'text-amber-700 dark:text-amber-600'
                  bgClass = 'bg-amber-100/20 dark:bg-amber-900/20 border border-amber-600/20 dark:border-amber-700/30'
                  medal = '🥉'
                }

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl ${bgClass} transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl w-10 text-center font-bold ${rankColor}`}>
                        {medal || `#${index + 1}`}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-medium text-text-primary font-mono tracking-wide">
                          {learner.learnerLabel}...
                        </span>
                        <span className="text-xs text-text-secondary">{t.hallOfFamePage.table.learnerId}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-text-primary">{learner.score}</span>
                      <span className="text-xs text-text-secondary uppercase">{t.hallOfFamePage.table.goals}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 hover:decoration-sky-500">
            {t.hallOfFamePage.back}
          </Link>
        </div>
      </div>
    </div>
  )
}
