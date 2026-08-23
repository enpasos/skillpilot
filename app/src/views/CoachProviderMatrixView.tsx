import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CoachProviderMatrix } from '../components/CoachProviderMatrix'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'

const viewCopy = {
  de: {
    backToFaq: 'Zurück zu den häufigen Fragen',
    title: 'SkillPilot einrichten',
    subtitle: 'Diese Detailübersicht ist nur für die erste Einrichtung oder einen Kontowechsel gedacht. Für dein tägliches Lernen brauchst du sie nicht.',
  },
  en: {
    backToFaq: 'Back to frequently asked questions',
    title: 'Set up SkillPilot',
    subtitle: 'This detailed overview is only for your first setup or when you change accounts. You do not need it for everyday learning.',
  },
} as const

export const CoachProviderMatrixView: React.FC = () => {
  const { language } = useLanguage()
  const selectedLanguage = language === 'en' ? 'en' : 'de'
  const copy = viewCopy[selectedLanguage]

  return (
    <div className="min-h-screen bg-chat-bg px-4 py-6 text-text-primary transition-colors sm:px-6 lg:px-10">
      <main className="mx-auto w-full max-w-[1800px]">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4" aria-label={copy.backToFaq}>
          <Link
            to="/faq"
            className="inline-flex items-center rounded-lg text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-chat-bg"
          >
            <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
            {copy.backToFaq}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </nav>

        <PublicPageHeader
          align="left"
          className="max-w-5xl"
          title={copy.title}
          subtitle={copy.subtitle}
        />

        <CoachProviderMatrix language={selectedLanguage} />
      </main>
    </div>
  )
}
