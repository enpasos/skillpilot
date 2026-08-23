import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react'

import { LanguageToggle } from '../components/LanguageToggle'
import { CoachProviderMatrix } from '../components/CoachProviderMatrix'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getFaqViewCopy,
  type FaqCompatibilityStatus,
} from '../utils/faqViewCopy'

const statusStyles: Record<FaqCompatibilityStatus, string> = {
  recommended: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200',
  supported: 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-950/70 dark:text-sky-200',
  limited: 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-200',
  unsupported: 'border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-950/70 dark:text-red-200',
}

const StatusIcon: React.FC<{ status: FaqCompatibilityStatus }> = ({ status }) => {
  if (status === 'unsupported') return <X size={16} aria-hidden="true" />
  if (status === 'limited') return <TriangleAlert size={16} aria-hidden="true" />
  return <Check size={16} aria-hidden="true" />
}

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

        <CoachProviderMatrix language={language === 'en' ? 'en' : 'de'} />

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
            </div>
          </div>
        </section>

        <aside
          aria-labelledby="faq-voice-warning-title"
          className="mt-6 rounded-3xl border-2 border-amber-400 bg-amber-50 p-6 shadow-sm dark:border-amber-600 dark:bg-amber-950/30 sm:p-8"
        >
          <div className="flex gap-4">
            <TriangleAlert
              className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"
              size={30}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                {copy.warning.eyebrow}
              </p>
              <h2 id="faq-voice-warning-title" className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {copy.warning.title}
              </h2>
              <div className="mt-4 space-y-3 leading-relaxed text-slate-800 dark:text-slate-100">
                {copy.warning.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="font-semibold">{copy.warning.evidenceWarning}</p>
                <p>{copy.warning.alternative}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-red-300 bg-white/80 p-5 dark:border-red-800 dark:bg-slate-950/40">
            <h3 className="font-semibold text-red-800 dark:text-red-300">{copy.warning.recoveryTitle}</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-800 marker:font-semibold dark:text-slate-100">
              {copy.warning.recoverySteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 font-semibold text-red-800 dark:text-red-300">{copy.warning.recoveryClosing}</p>
          </div>
        </aside>

        <section aria-labelledby="faq-compatibility-title" className="mt-12">
          <h2 id="faq-compatibility-title" className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {copy.compatibility.title}
          </h2>
          <p className="mt-2 text-text-secondary">{copy.compatibility.intro}</p>

          <div className="mt-5 space-y-3 sm:hidden">
            {copy.compatibility.rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-border-color bg-white/70 p-4 shadow-sm dark:bg-slate-900/50"
              >
                <h3 className="font-medium text-slate-800 dark:text-slate-100">{row.feature}</h3>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${statusStyles[row.status]}`}>
                    <StatusIcon status={row.status} />
                    {copy.compatibility.statusLabels[row.status]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{row.recommendation}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-border-color bg-white/60 shadow-sm dark:bg-slate-900/40 sm:block">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-100/90 text-sm text-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">{copy.compatibility.featureHeading}</th>
                  <th scope="col" className="px-5 py-4 font-semibold">{copy.compatibility.statusHeading}</th>
                  <th scope="col" className="px-5 py-4 font-semibold">{copy.compatibility.recommendationHeading}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {copy.compatibility.rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <th scope="row" className="px-5 py-4 font-medium text-slate-800 dark:text-slate-100">
                      {row.feature}
                    </th>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${statusStyles[row.status]}`}>
                        <StatusIcon status={row.status} />
                        {copy.compatibility.statusLabels[row.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="faq-questions-title" className="mt-12">
          <h2 id="faq-questions-title" className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {copy.faqTitle}
          </h2>
          <p className="mt-2 text-text-secondary">{copy.faqIntro}</p>

          <div className="mt-5 space-y-3">
            {copy.questions.map((item) => (
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
                </div>
              </details>
            ))}
          </div>
        </section>

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
