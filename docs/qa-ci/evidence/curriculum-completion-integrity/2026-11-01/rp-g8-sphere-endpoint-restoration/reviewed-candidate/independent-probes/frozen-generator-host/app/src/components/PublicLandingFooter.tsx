import { Link } from 'react-router-dom'
import type { LabelLanguage } from '../utils/filterLabels'
import { getPublicLandingCopy } from '../utils/publicLandingCopy'

interface PublicLandingFooterProps {
  language: LabelLanguage
}

export const PublicLandingFooter = ({ language }: PublicLandingFooterProps) => {
  const copy = getPublicLandingCopy(language).footer
  const links = [
    { label: copy.statistics, to: '/stats' },
    { label: copy.terms, to: '/legal' },
    { label: copy.privacy, to: '/privacy' },
    { label: copy.imprint, to: '/imprint' },
  ]

  return (
    <nav
      aria-label={language === 'de' ? 'Rechtliches und Statistiken' : 'Legal and statistics'}
      data-testid="public-landing-footer"
      className="mt-10 w-full min-w-0 max-w-2xl py-6 text-xs text-slate-500 dark:text-slate-400"
    >
      <ul className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-center sm:flex sm:flex-wrap sm:justify-center sm:gap-x-4">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="rounded-sm transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:hover:text-sky-300 dark:focus-visible:ring-offset-slate-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
