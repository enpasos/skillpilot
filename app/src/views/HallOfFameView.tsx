import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6 flex items-center justify-center">
        Loading Hall of Fame...
      </div>
    )
  }

  if (!data || data.curricula.length === 0) {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6 flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200">
          Hall of Fame
        </h1>
        <p className="text-slate-300">No champions have risen yet. Be the first!</p>
        <Link
          to="/"
          className="px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-full border border-slate-600 transition-colors"
        >
          Start Learning
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-gradient text-slate-100 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500">
              Hall of Fame
            </span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Celebrating the most dedicated learners on SkillPilot.
          </p>
        </header>

        {/* Filter */}
        <div className="flex justify-center">
          <div className="relative inline-block w-full max-w-md">
            <select
              value={selectedCurriculumId}
              onChange={(e) => setSelectedCurriculumId(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-100 shadow-xl backdrop-blur-sm transition-all"
            >
              {data.curricula.map((c) => (
                <option key={c.curriculumId} value={c.curriculumId}>
                  {c.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        {selectedBoard && (
          <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 mb-8 border-b border-white/5 pb-8">
               <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedBoard.title}</h2>
                  <div className="text-sm text-slate-400">
                    Total Mastered Goals across all learners: <span className="text-orange-400 font-mono">{selectedBoard.totalMastered}</span>
                  </div>
               </div>
               <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Goals</div>
                  <div className="text-3xl font-bold text-slate-200">{selectedBoard.totalAtomicGoals}</div>
               </div>
            </div>

            <div className="space-y-4">
              {selectedBoard.topLearners.map((learner, index) => {
                let rankColor = 'text-slate-400'
                let medal = null
                let bgClass = 'bg-slate-700/30'
                
                if (index === 0) {
                  rankColor = 'text-yellow-400'
                  bgClass = 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30'
                  medal = '🥇'
                } else if (index === 1) {
                  rankColor = 'text-slate-300'
                  bgClass = 'bg-slate-700/40 border border-slate-500/30'
                  medal = '🥈'
                } else if (index === 2) {
                  rankColor = 'text-amber-600'
                  bgClass = 'bg-amber-900/20 border border-amber-700/30'
                  medal = '🥉'
                }

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl ${bgClass} transition-transform hover:scale-[1.01]`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl w-10 text-center font-bold ${rankColor}`}>
                        {medal || `#${index + 1}`}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-medium text-slate-100 font-mono tracking-wide">
                            {learner.learnerLabel}...
                        </span>
                        <span className="text-xs text-slate-500">Learner ID</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                       <span className="text-2xl font-bold text-white">{learner.score}</span>
                       <span className="text-xs text-slate-400 uppercase">Goals</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
           <Link to="/" className="text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-slate-600 hover:decoration-white">
             Back to SkillPilot
           </Link>
        </div>
      </div>
    </div>
  )
}
