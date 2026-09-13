import {
  BookOpenText,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  Network,
  ShieldCheck,
  Timer,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LabelLanguage } from '../utils/filterLabels'
import { getPublicLandingCopy } from '../utils/publicLandingCopy'
import { SkillPilotOverviewCard } from './SkillPilotOverviewCard'
import { PublicLandingLearningScenes } from './PublicLandingLearningScenes'

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

const actionGeometryClassName =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900'

const neutralActionClassName =
  `${actionGeometryClassName} border-border-color bg-input-bg text-text-secondary`

const learningActionClassName =
  `${neutralActionClassName} hover:border-emerald-300/80 hover:bg-emerald-50/70 hover:text-emerald-800 focus-visible:ring-emerald-600 dark:hover:border-emerald-600/70 dark:hover:bg-emerald-950/25 dark:hover:text-emerald-200 dark:focus-visible:ring-emerald-400`

const teachingActionClassName =
  `${neutralActionClassName} hover:border-violet-300/80 hover:bg-violet-50/70 hover:text-violet-800 focus-visible:ring-violet-600 dark:hover:border-violet-600/70 dark:hover:bg-violet-950/25 dark:hover:text-violet-200 dark:focus-visible:ring-violet-400`

const curriculaActionClassName =
  `${neutralActionClassName} hover:border-amber-300/80 hover:bg-amber-50/70 hover:text-amber-900 focus-visible:ring-amber-600 dark:hover:border-amber-600/70 dark:hover:bg-amber-950/25 dark:hover:text-amber-200 dark:focus-visible:ring-amber-400`

const primaryActionClassName =
  `${actionGeometryClassName} shadow-sm focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-400`

const learningPanelClassName =
  'hover:border-emerald-400/70 focus-within:border-emerald-500 dark:hover:border-emerald-500/60 dark:focus-within:border-emerald-400'

const learningHeadingClassName =
  'transition-colors group-hover:text-emerald-600 group-focus-within:text-emerald-600 dark:group-hover:text-emerald-400 dark:group-focus-within:text-emerald-400'

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
      className="public-landing-panels grid w-full gap-4 lg:grid-cols-3"
    >
      <article
        data-testid="public-landing-panel-learning"
        className={`public-landing-hero ${panelClassName} ${learningPanelClassName}`}
      >
        <PublicLandingLearningScenes copy={copy.learning.scenes} imageCaption={copy.learning.imageCaption} />
        <div className="public-landing-hero-veil" aria-hidden="true" />
        <p className="public-landing-eyebrow">{copy.learning.eyebrow}</p>
        <h2 className={`public-landing-hero-title text-text-primary ${learningHeadingClassName}`}>
          <span>{copy.learning.title}</span>
        </h2>
        <p className="public-landing-hero-description mt-1 text-sm leading-relaxed text-text-secondary">
          {copy.learning.description}
        </p>
        <ul className="public-landing-hero-actions mt-3 flex flex-wrap items-center gap-2" aria-label={copy.learning.title}>
          <li>
            <button
              type="button"
              onClick={onStartLearning}
              data-testid="public-landing-action-learning"
              className={`public-landing-hero-primary ${primaryActionClassName}`}
            >
              <GraduationCap size={14} aria-hidden="true" />
              <span>{copy.learning.primaryAction}</span>
            </button>
          </li>
          <li>
            <Link
              to={`/quickstart/${language}`}
              data-testid="public-landing-action-quickstart"
              className={learningActionClassName}
            >
              <Timer size={14} className="text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              <span>{copy.learning.quickstartAction}</span>
            </Link>
          </li>
          <li>
            <Link
              to="/faq"
              data-testid="public-landing-action-faq"
              className={learningActionClassName}
            >
              <CircleHelp size={14} className="text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              <span>{copy.learning.faqAction}</span>
            </Link>
          </li>
        </ul>

        <details
          data-testid="public-landing-access-notice"
          className="public-landing-hero-access group/access mt-4 border-t border-border-color pt-3 text-xs leading-relaxed text-text-secondary"
        >
          <summary className="flex cursor-pointer list-none items-start gap-2 font-semibold text-text-secondary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 [&::-webkit-details-marker]:hidden">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300"
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
              className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
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
            className={teachingActionClassName}
          >
            <ClipboardList size={14} className="text-violet-600 dark:text-violet-300" aria-hidden="true" />
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
              className={curriculaActionClassName}
            >
              <Network size={14} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />
              <span>{copy.curricula.explorerAction}</span>
            </button>
          </li>
          {showGoalBook && (
            <li>
              <Link
                to="/lernzielbuch"
                data-testid="public-landing-action-goal-book"
                className={curriculaActionClassName}
              >
                <BookOpenText size={14} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />
                <span>{copy.curricula.goalBookAction}</span>
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/curricula"
              data-testid="public-landing-action-curriculum-champions"
              className={curriculaActionClassName}
            >
              <Trophy size={14} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />
              <span>{copy.curricula.championsAction}</span>
            </Link>
          </li>
        </ul>
      </article>
    </section>
  )
}
