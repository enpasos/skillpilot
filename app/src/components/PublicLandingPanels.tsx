import {
  BookOpenText,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  MessageCircle,
  Network,
  ShieldCheck,
  Timer,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LabelLanguage } from '../utils/filterLabels'
import { getPublicLandingCopy } from '../utils/publicLandingCopy'
import { SkillPilotOverviewCard } from './SkillPilotOverviewCard'

interface AccessBannerCopy {
  text: string
  linkLabel: string
}

interface PublicLandingPanelsProps {
  language: LabelLanguage
  accessBanner: AccessBannerCopy
  onStartLearning: () => void
  onOpenCoursePlanning: () => void
  onExploreSkillGraph: () => void
}

const PUBLIC_GOAL_BOOK_PROMOTION_ENABLED = true

const panelClassName =
  'group relative overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 transition-all duration-300 hover:shadow-md focus-within:shadow-md dark:bg-slate-800/50'

const secondaryActionClassName =
  'inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50/70 px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-violet-400 hover:bg-violet-100 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-violet-700/50 dark:bg-violet-950/30 dark:hover:border-violet-500 dark:hover:bg-violet-950/60 dark:hover:text-violet-200 dark:focus-visible:ring-offset-slate-900'

const primaryActionClassName =
  'inline-flex items-center gap-1.5 rounded-full border border-sky-700 bg-sky-700 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:border-sky-800 hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-sky-700 dark:bg-sky-700 dark:hover:border-sky-800 dark:hover:bg-sky-800 dark:focus-visible:ring-offset-slate-900'

const violetPanelClassName =
  'hover:border-violet-400/70 focus-within:border-violet-500 dark:hover:border-violet-500/60 dark:focus-within:border-violet-400'

const violetHeadingClassName =
  'transition-colors group-hover:text-violet-700 group-focus-within:text-violet-700 dark:group-hover:text-violet-300 dark:group-focus-within:text-violet-300'

const amberPanelClassName =
  'hover:border-amber-400/70 focus-within:border-amber-500 dark:hover:border-amber-500/60 dark:focus-within:border-amber-400'

const amberHeadingClassName =
  'transition-colors group-hover:text-amber-700 group-focus-within:text-amber-700 dark:group-hover:text-amber-300 dark:group-focus-within:text-amber-300'

export const PublicLandingPanels = ({
  language,
  accessBanner,
  onStartLearning,
  onOpenCoursePlanning,
  onExploreSkillGraph,
}: PublicLandingPanelsProps) => {
  const copy = getPublicLandingCopy(language)
  const showGoalBook =
    PUBLIC_GOAL_BOOK_PROMOTION_ENABLED && import.meta.env.MODE !== 'package-consumer'

  return (
    <section
      aria-label={copy.sectionLabel}
      data-testid="public-landing-panels"
      className="w-full space-y-4"
    >
      <article
        data-testid="public-landing-panel-learning"
        className={`${panelClassName} border-sky-200/90 bg-white/70 shadow-sm hover:border-sky-400/70 focus-within:border-sky-500 dark:border-sky-800/80 dark:bg-slate-800/60 dark:hover:border-sky-500/60 dark:focus-within:border-sky-400`}
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary transition-colors group-hover:text-sky-700 group-focus-within:text-sky-700 dark:group-hover:text-sky-300 dark:group-focus-within:text-sky-300">
          <span>{copy.learning.title}</span>
          <MessageCircle size={18} className="text-sky-500" aria-hidden="true" />
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {copy.learning.description}
        </p>
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label={copy.learning.title}>
          <li>
            <button
              type="button"
              onClick={onStartLearning}
              data-testid="public-landing-action-learning"
              className={primaryActionClassName}
            >
              <GraduationCap size={14} aria-hidden="true" />
              <span>{copy.learning.primaryAction}</span>
            </button>
          </li>
          <li>
            <Link
              to={`/quickstart/${language}`}
              data-testid="public-landing-action-quickstart"
              className={secondaryActionClassName}
            >
              <Timer size={14} aria-hidden="true" />
              <span>{copy.learning.quickstartAction}</span>
            </Link>
          </li>
          <li>
            <Link
              to="/faq"
              data-testid="public-landing-action-faq"
              className={secondaryActionClassName}
            >
              <CircleHelp size={14} aria-hidden="true" />
              <span>{copy.learning.faqAction}</span>
            </Link>
          </li>
        </ul>

        <details
          data-testid="public-landing-access-notice"
          className="group/access mt-4 border-t border-border-color pt-3 text-xs leading-relaxed text-text-secondary"
        >
          <summary className="flex cursor-pointer list-none items-start gap-2 font-semibold text-text-secondary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 [&::-webkit-details-marker]:hidden">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-300"
              size={16}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">{copy.learning.accessSummary}</span>
            <ChevronDown
              aria-hidden="true"
              className="shrink-0 transition-transform group-open/access:rotate-180"
              size={16}
            />
          </summary>
          <div className="mt-3 min-w-0 whitespace-pre-line pl-6">
            {accessBanner.text.split('**').map((part, index) =>
              index % 2 === 1
                ? <strong key={index} className="font-bold text-text-primary">{part}</strong>
                : part
            )}{' '}
            <Link
              to="/faq/coach-setup"
              data-testid="public-landing-access-link"
              className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
            >
              {accessBanner.linkLabel}
            </Link>
          </div>
        </details>
      </article>

      <SkillPilotOverviewCard language={language} />

      <article
        data-testid="public-landing-panel-teaching"
        className={`${panelClassName} ${violetPanelClassName}`}
      >
        <h2 className={`flex items-center gap-2 text-lg font-semibold text-text-primary ${violetHeadingClassName}`}>
          <span>{copy.teaching.title}</span>
          <ClipboardList size={18} className="text-violet-500" aria-hidden="true" />
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {copy.teaching.description}
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={onOpenCoursePlanning}
            data-testid="public-landing-action-course-planning"
            className={secondaryActionClassName}
          >
            <ClipboardList size={14} aria-hidden="true" />
            <span>{copy.teaching.primaryAction}</span>
          </button>
        </div>
      </article>

      <article
        data-testid="public-landing-panel-curricula"
        className={`${panelClassName} ${amberPanelClassName}`}
      >
        <h2 className={`flex items-center gap-2 text-lg font-semibold text-text-primary ${amberHeadingClassName}`}>
          <span>{copy.curricula.title}</span>
          <Network size={18} className="text-amber-500" aria-hidden="true" />
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {copy.curricula.description}
        </p>
        <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label={copy.curricula.title}>
          <li>
            <button
              type="button"
              onClick={onExploreSkillGraph}
              data-testid="public-landing-action-explorer"
              className={secondaryActionClassName}
            >
              <Network size={14} aria-hidden="true" />
              <span>{copy.curricula.explorerAction}</span>
            </button>
          </li>
          {showGoalBook && (
            <li>
              <Link
                to="/lernzielbuch"
                data-testid="public-landing-action-goal-book"
                className={secondaryActionClassName}
              >
                <BookOpenText size={14} aria-hidden="true" />
                <span>{copy.curricula.goalBookAction}</span>
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/curricula"
              data-testid="public-landing-action-curriculum-champions"
              className={secondaryActionClassName}
            >
              <Trophy size={14} aria-hidden="true" />
              <span>{copy.curricula.championsAction}</span>
            </Link>
          </li>
        </ul>
      </article>
    </section>
  )
}
