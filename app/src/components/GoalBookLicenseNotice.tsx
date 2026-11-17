import { Link } from 'react-router-dom'

const CC_BY_URL = 'https://creativecommons.org/licenses/by/4.0/'
const PUBLIC_ORIGIN = 'https://skillpilot.com'

const copy = {
  de: {
    title: 'Offene Bildungsressource (OER)',
    licenseHref: `${CC_BY_URL}deed.de`,
    grant: 'Du darfst dieses Lernzielbuch kostenlos nutzen, weitergeben und bearbeiten, auch kommerziell, wenn du die Quelle nennst und Änderungen kennzeichnest.',
    scope: 'Das gilt für die Inhalte von SkillPilot. Amtliche Originalquellen, Zitate und verlinkte Materialien behalten ihre eigenen Bedingungen.',
    attributionSummary: 'So nennst du die Quelle',
    licensing: 'Lizenzhinweise',
    logoCredit: 'OER-Logo: Quelle & Lizenz',
    logoAlt: 'Globales Logo für Open Educational Resources (OER)',
  },
  en: {
    title: 'Open Educational Resource (OER)',
    licenseHref: CC_BY_URL,
    grant: 'You may use, share and adapt this learning goal book free of charge, also commercially, if you give credit and indicate changes.',
    scope: 'This applies to SkillPilot\'s own content. Official source documents, quotations and linked materials keep their own conditions.',
    attributionSummary: 'How to give credit',
    licensing: 'Licensing notes',
    logoCredit: 'OER logo: source & license',
    logoAlt: 'Global Open Educational Resources (OER) logo',
  },
}

interface GoalBookLicenseNoticeProps {
  language: 'de' | 'en'
  /** Title, edition and route of the loaded book; without them the notice omits the credit line. */
  book?: { title: string; edition: string; route: string }
}

/**
 * States the license at the resource itself, as LICENSING.md allocates it: own educational
 * content is CC BY 4.0. The OER logo is a third-party asset under CC BY 3.0 with its credit
 * at /legal#oer-logo.
 */
export const GoalBookLicenseNotice = ({ language, book }: GoalBookLicenseNoticeProps) => {
  const c = copy[language]
  return (
    <section
      data-testid="goal-book-license"
      aria-labelledby="goal-book-license-title"
      className="mt-6 flex flex-col gap-4 rounded-xl border border-border-color bg-white/80 p-4 dark:bg-slate-900/60 sm:flex-row sm:items-start"
    >
      <Link
        to="/legal#oer-logo"
        title={c.logoCredit}
        data-testid="goal-book-license-oer-logo"
        className="block w-28 shrink-0 overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      >
        <img
          src="/assets/third-party/oer/global-oer-logo.png"
          alt={c.logoAlt}
          width={330}
          height={221}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </Link>
      <div className="min-w-0 text-sm leading-6 text-text-secondary">
        <h2 id="goal-book-license-title" className="text-base font-semibold text-text-primary">
          {c.title}
          {' · '}
          <a
            rel="license"
            href={c.licenseHref}
            data-testid="goal-book-license-link"
            className="whitespace-nowrap text-sky-700 underline underline-offset-2 hover:text-sky-600 dark:text-sky-300"
          >
            CC BY 4.0
          </a>
        </h2>
        <p className="mt-1">{c.grant} {c.scope}</p>
        {book && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium text-text-primary">{c.attributionSummary}</summary>
            <p
              data-testid="goal-book-license-attribution"
              className="mt-2 select-all break-words rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs leading-5 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
            >
              SkillPilot — {book.title}, {book.edition}, {PUBLIC_ORIGIN}{book.route}, CC BY 4.0 ({CC_BY_URL})
            </p>
          </details>
        )}
        <p className="mt-2 text-xs">
          <Link to="/legal" className="underline underline-offset-2 hover:text-text-primary">{c.licensing}</Link>
          {' · '}
          <Link to="/legal#oer-logo" className="underline underline-offset-2 hover:text-text-primary">{c.logoCredit}</Link>
        </p>
      </div>
    </section>
  )
}
