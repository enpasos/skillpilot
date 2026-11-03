import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Info,
} from 'lucide-react'

import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { getFaqViewCopy } from '../utils/faqViewCopy'

export const FaqView: React.FC = () => {
  const { language } = useLanguage()
  const copy = getFaqViewCopy(language === 'en' ? 'en' : 'de')

  return (
    <div className="min-h-screen bg-chat-bg px-4 py-6 text-text-primary transition-colors sm:px-6 lg:px-10">
      <main className="mx-auto w-full max-w-5xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4" aria-label={copy.backToApp}>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-chat-bg"
          >
            <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
            {copy.backToApp}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </nav>

        <PublicPageHeader
          align="left"
          className="mb-3"
          title={copy.title}
          subtitle={copy.subtitle}
        />
        <p className="mb-8 text-sm text-text-secondary">{copy.reviewedLabel}</p>

        <section
          aria-labelledby="faq-recommendation-title"
          className="mt-12 rounded-3xl border border-emerald-300 bg-emerald-50/90 p-6 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-8"
        >
          <div className="flex gap-4">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              size={30}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {copy.recommendation.eyebrow}
              </p>
              <h2 id="faq-recommendation-title" className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {copy.recommendation.title}
              </h2>
              <div className="mt-4 space-y-3 leading-relaxed text-slate-700 dark:text-slate-200">
                {copy.recommendation.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <Link
                to="/"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-offset-emerald-950"
              >
                {copy.recommendation.actionLabel}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {copy.sections.map((section) => (
          <section key={section.id} aria-labelledby={`faq-${section.id}-title`} className="mt-12">
            <h2 id={`faq-${section.id}-title`} className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {section.title}
            </h2>
            <p className="mt-2 text-text-secondary">{section.intro}</p>

            <div className="mt-5 space-y-3">
              {section.questions.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-2xl border border-border-color bg-white/60 shadow-sm open:bg-white/90 dark:bg-slate-900/40 dark:open:bg-slate-900/70"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      size={20}
                      className="shrink-0 text-text-secondary transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="space-y-3 border-t border-border-color px-5 py-5 leading-relaxed text-text-secondary">
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {item.bullets && (
                      <ul className="list-disc space-y-2 pl-5">
                        {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                      </ul>
                    )}
                    {item.link && (
                      <Link
                        to={item.link.href}
                        className="inline-flex items-center gap-2 rounded-lg font-semibold text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-chat-bg dark:text-sky-400"
                      >
                        {item.link.label}
                        <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section
          aria-labelledby="faq-more-information-title"
          className="my-12 rounded-2xl border border-border-color bg-slate-100/70 p-6 dark:bg-slate-900/50"
        >
          <div className="flex gap-3">
            <Info className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" size={24} aria-hidden="true" />
            <div>
              <h2 id="faq-more-information-title" className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {copy.moreInformation.title}
              </h2>
              <p className="mt-2 leading-relaxed text-text-secondary">{copy.moreInformation.text}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <Link to="/privacy" className="font-medium text-sky-700 hover:underline dark:text-sky-400">
                  {copy.moreInformation.privacy}
                </Link>
                <Link to="/legal" className="font-medium text-sky-700 hover:underline dark:text-sky-400">
                  {copy.moreInformation.legal}
                </Link>
                <a href={`mailto:${copy.moreInformation.contact}`} className="font-medium text-sky-700 hover:underline dark:text-sky-400">
                  {copy.moreInformation.contact}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
