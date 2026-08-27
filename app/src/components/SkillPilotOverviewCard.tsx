import { BookOpenText, Headphones, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LabelLanguage } from '../utils/filterLabels'
import { getSkillPilotOverviewCopy } from '../utils/skillPilotOverviewCopy'

interface SkillPilotOverviewCardProps {
  language: LabelLanguage
}

export const SkillPilotOverviewCard = ({ language }: SkillPilotOverviewCardProps) => {
  const copy = getSkillPilotOverviewCopy(language)
  const formats = [
    {
      icon: Headphones,
      label: copy.formats.audio.title,
      action: copy.formats.audio.action,
      target: 'audio',
      to: `/whitepaper/${language}?play=audio#audio`,
    },
    {
      icon: PlayCircle,
      label: copy.formats.video.title,
      action: copy.formats.video.action,
      target: 'video',
      to: `/whitepaper/${language}?play=video#video`,
    },
    {
      icon: BookOpenText,
      label: copy.formats.whitepaper.title,
      action: copy.formats.whitepaper.action,
      target: 'whitepaper',
      to: `/whitepaper/${language}#whitepaper`,
    },
  ]

  return (
    <article
      data-testid="skillpilot-overview-entry"
      className="group relative overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 transition-all duration-300 hover:border-violet-300/70 hover:shadow-md focus-within:border-violet-300/70 focus-within:ring-2 focus-within:ring-violet-500 focus-within:ring-offset-2 dark:bg-slate-800/50 dark:hover:border-violet-500/40 dark:focus-within:border-violet-500/40 dark:focus-within:ring-offset-slate-950"
    >
      <h3 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
        {copy.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
        {copy.cardDescription}
      </p>
      <ul
        aria-label={copy.formatsLabel}
        className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-text-secondary"
      >
        {formats.map(({ icon: Icon, label, action, target, to }) => (
          <li key={target}>
            <Link
              to={to}
              data-testid={`skillpilot-overview-format-${target}`}
              aria-label={`${label}: ${action}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50/70 px-2.5 py-1 transition-colors hover:border-violet-400 hover:bg-violet-100 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-violet-700/50 dark:bg-violet-950/30 dark:hover:border-violet-500 dark:hover:bg-violet-950/60 dark:hover:text-violet-200 dark:focus-visible:ring-offset-slate-900"
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
