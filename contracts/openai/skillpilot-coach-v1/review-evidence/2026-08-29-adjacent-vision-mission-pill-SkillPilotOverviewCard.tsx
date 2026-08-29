import { BookOpenText, ChevronDown, Compass, Headphones, PlayCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LabelLanguage } from '../utils/filterLabels'
import { getSkillPilotOverviewCopy } from '../utils/skillPilotOverviewCopy'

interface SkillPilotOverviewCardProps {
  language: LabelLanguage
}

export const SkillPilotOverviewCard = ({ language }: SkillPilotOverviewCardProps) => {
  const copy = getSkillPilotOverviewCopy(language)
  const headingId = useId()
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
      className="group relative overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 transition-all duration-300 hover:border-emerald-400/70 hover:shadow-md focus-within:border-emerald-500 dark:bg-slate-800/50 dark:hover:border-emerald-500/60 dark:focus-within:border-emerald-400"
    >
      <h3
        id={headingId}
        className="text-lg font-semibold text-text-primary transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400"
      >
        {copy.title}
      </h3>
      <p
        data-testid="skillpilot-overview-card-description"
        className="mt-1 text-sm leading-relaxed text-text-secondary"
      >
        {copy.cardDescription}
      </p>
      <div
        data-testid="skillpilot-overview-actions"
        className="mt-3"
      >
        <ul
          aria-labelledby={headingId}
          data-testid="skillpilot-overview-media-actions"
          className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary"
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
          <li>
            <button
              type="button"
              data-testid="skillpilot-overview-disclosure-toggle"
              aria-expanded={isDisclosureOpen}
              aria-controls={disclosurePanelId}
              onClick={() => setIsDisclosureOpen((current) => !current)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-offset-slate-900 ${isDisclosureOpen ? 'border-emerald-300/80 bg-emerald-50/80 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-600/70 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-100' : 'border-violet-200/80 bg-violet-50/70 text-text-secondary hover:border-violet-400 hover:bg-violet-100 hover:text-violet-800 dark:border-violet-700/50 dark:bg-violet-950/30 dark:hover:border-violet-500 dark:hover:bg-violet-950/60 dark:hover:text-violet-200'}`}
            >
              <Compass
                size={14}
                aria-hidden="true"
                data-testid="skillpilot-overview-disclosure-icon"
              />
              <span>{copy.disclosure.label}</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                data-testid="skillpilot-overview-disclosure-chevron"
                className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isDisclosureOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </li>
        </ul>
      </div>
      <div
        id={disclosurePanelId}
        data-testid="skillpilot-overview-disclosure-panel"
        hidden={!isDisclosureOpen}
        className="mt-4 border-t border-border-color pt-4 text-sm leading-relaxed text-text-secondary"
      >
        <p data-testid="skillpilot-overview-disclosure-introduction">
          {copy.disclosure.introduction}
        </p>
        <div
          data-testid="skillpilot-overview-disclosure-grid"
          className="mt-4 grid grid-cols-1 gap-6 min-[850px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[850px]:gap-8"
        >
          <section data-testid="skillpilot-overview-vision">
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
          <section data-testid="skillpilot-overview-mission">
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
      </div>
    </article>
  )
}
