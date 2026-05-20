import React from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { useTranslation } from '../hooks/useTranslation'
import { Users, Trophy, ArrowRight, ArrowLeft } from 'lucide-react'

export const StatsView: React.FC = () => {
    const t = useTranslation()
    const statsHub = t.statsHub || {}
    const cards = statsHub.cards || {}
    const cardBase =
        'group relative overflow-hidden rounded-2xl border border-border-color bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-400/50'

    return (
        <div className="min-h-screen bg-chat-bg text-text-primary overflow-y-auto transition-colors duration-300 relative">
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <LanguageToggle />
                <ThemeToggle />
            </div>

            <div className="max-w-4xl mx-auto p-6 pt-20 flex flex-col items-center justify-center min-h-[80vh]">
                <PublicPageHeader
                    className="mb-12"
                    title={statsHub.title || 'Statistics'}
                    subtitle={statsHub.subtitle || 'Explore the growth of our learning community.'}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <Link to="/users" className={cardBase}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-full bg-sky-100/50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                                <Users size={32} />
                            </div>
                            <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">{cards.users?.title || 'SkillPilot-IDs'}</h3>
                        <p className="text-base leading-relaxed text-text-secondary">
                            {cards.users?.description || 'Overview of generated SkillPilot IDs and community growth.'}
                        </p>
                    </Link>

                    <Link to="/successes" className={cardBase}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                <Trophy size={32} />
                            </div>
                            <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">{cards.successes?.title || 'Successes'}</h3>
                        <p className="text-base leading-relaxed text-text-secondary">
                            {cards.successes?.description || 'Total number of mastered learning goals across the platform.'}
                        </p>
                    </Link>
                </div>

                <div className="mt-16">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {statsHub.back || 'Back to Home'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
