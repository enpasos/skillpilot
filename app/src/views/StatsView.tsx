import React from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { Users, Trophy, ArrowRight, ArrowLeft } from 'lucide-react'

export const StatsView: React.FC = () => {

    const cardBase =
        'group relative overflow-hidden rounded-2xl border border-border-color bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-400/50'

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary overflow-y-auto transition-colors duration-300 relative">
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
                <header className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary">
                        Statistics
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Explore the growth of our learning community.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <Link to="/users" className={cardBase}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-full bg-sky-100/50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                                <Users size={32} />
                            </div>
                            <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">SkillPilot-IDs</h3>
                        <p className="text-sm text-text-secondary">
                            Overview of generated SkillPilot IDs and community growth.
                        </p>
                    </Link>

                    <Link to="/successes" className={cardBase}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                <Trophy size={32} />
                            </div>
                            <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-2">Successes</h3>
                        <p className="text-sm text-text-secondary">
                            Total number of mastered learning goals across the platform.
                        </p>
                    </Link>
                </div>

                <div className="mt-16">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
