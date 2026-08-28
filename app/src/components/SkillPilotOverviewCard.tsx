import { BookOpenText, ChevronDown, Headphones, PlayCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LabelLanguage } from '../utils/filterLabels'
import { getSkillPilotOverviewCopy } from '../utils/skillPilotOverviewCopy'

interface SkillPilotOverviewCardProps {
  language: LabelLanguage
}

export const SkillPilotOverviewCard = ({ language }: SkillPilotOverviewCardProps) => {
  const copy = getSkillPilotOverviewCopy(language)
  const disclosurePanelId = useId()
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false)
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
      <p
        data-testid="skillpilot-overview-card-tagline"
        className="mt-1 text-sm font-semibold leading-relaxed text-text-primary"
      >
        {copy.cardTagline}
      </p>
      <p
        data-testid="skillpilot-overview-card-description"
        className="mt-1 text-sm leading-relaxed text-text-secondary"
      >
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
      <button
        type="button"
        data-testid="skillpilot-overview-disclosure-toggle"
        aria-expanded={isDisclosureOpen}
        aria-controls={disclosurePanelId}
        onClick={() => setIsDisclosureOpen((current) => !current)}
        className="mt-3 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-violet-700 underline-offset-4 transition-colors duration-200 hover:text-violet-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:text-violet-300 dark:hover:text-violet-100 dark:focus-visible:ring-offset-slate-900"
      >
        <span>
          {isDisclosureOpen ? copy.disclosure.closeLabel : copy.disclosure.openLabel}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          data-testid="skillpilot-overview-disclosure-chevron"
          className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isDisclosureOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={disclosurePanelId}
        data-testid="skillpilot-overview-disclosure-panel"
        hidden={!isDisclosureOpen}
        className="mt-4 border-t border-border-color pt-4 text-sm leading-relaxed text-text-secondary"
      >
        <section>
          <h4 className="font-semibold text-text-primary">
            {copy.disclosure.vision.heading}
          </h4>
          <p className="mt-2 font-semibold text-text-primary">
            {copy.disclosure.vision.tagline}
          </p>
          <p className="mt-1">
            {copy.disclosure.vision.description}
          </p>
        </section>
        <section className="mt-4">
          <h4 className="font-semibold text-text-primary">
            {copy.disclosure.mission.heading}
          </h4>
          <p className="mt-2 font-semibold text-text-primary">
            {copy.disclosure.mission.tagline}
          </p>
          <p className="mt-1">
            {copy.disclosure.mission.description}
          </p>
        </section>
      </div>
    </article>
  )
}
