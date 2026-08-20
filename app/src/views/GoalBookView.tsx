import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FlaskConical,
  Search,
} from 'lucide-react'
import { LanguageToggle } from '../components/LanguageToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import { InlineMathText } from '../components/InlineMathText'
import { useLanguage } from '../contexts/LanguageContext'
import {
  assertGoalBookPublicationBinding,
  filterGoalBookPages,
  GOAL_BOOK_INDEX_URL,
  goalBookApplicabilityOptions,
  goalBookChapterDepths,
  goalBookExternalReferenceFromHash,
  goalBookPageFromHash,
  parseGoalBookPublicationIndex,
  parseVerifiedGoalBookRuntimeModel,
  selectGoalBookPublication,
  type GoalBookRuntimeExternalReference,
  type GoalBookApplicabilityFilter,
  type GoalBookApplicabilityGroup,
  type GoalBookRuntimeModel,
  type GoalBookRuntimePage,
  type GoalBookRuntimePublication,
  type GoalBookRuntimePublicationIndex,
  type GoalBookRuntimeReference,
} from '../utils/goalBookRuntime'
import {
  goalBookDefinitionById,
  goalBookDefinitionByLandscapeId,
  goalBookRoute,
  type GoalBookSubject,
} from '../utils/goalBookPublicationRegistry'

const copy = {
  de: {
    back: 'Zurück zur Startseite',
    eyebrow: 'LERNZIELBUCH · REVIEW-PILOT',
    titleFallback: 'Lernzielbuch',
    subtitleFallback: 'Gymnasium · Sekundarstufe I und II · Deutschland',
    subtitle: 'Mathematik · Gymnasium · Sekundarstufe I',
    subtitleNationwide: 'Mathematik · Gymnasium · Sekundarstufe I und II · Deutschland',
    pilotNotice: 'Diese Fassung dient der fachlichen und didaktischen Prüfung. Inhalte und Bilder können sich noch ändern.',
    download: 'PDF herunterladen',
    downloadHint: 'Lernziele · ein Lernziel pro Seite',
    books: 'Fach auswählen',
    mathematics: 'Mathematik',
    physics: 'Physik',
    filters: 'Curriculum filtern',
    filterHint: 'G8 und G9 werden nur innerhalb des gewählten Bundeslands angeboten.',
    jurisdiction: 'Bundesland',
    allJurisdictions: 'Alle Bundesländer',
    selectJurisdictionFirst: 'Zuerst Bundesland wählen',
    stage: 'Stufe',
    allStages: 'Alle Stufen',
    durationModel: 'Bildungsgang',
    allDurationModels: 'Alle verfügbaren',
    courseProfile: 'Kursprofil',
    allCourseProfiles: 'Alle Kursprofile',
    applicability: 'Curriculare Geltung',
    applicabilityDetails: 'Vollständige Geltungsmatrix anzeigen',
    applicabilityJurisdiction: 'Bundesland',
    applicabilityStage: 'Stufe',
    applicabilityDuration: 'G8/G9',
    applicabilityCourse: 'Kursprofil',
    notApplicable: 'nicht relevant',
    states: 'Bundesländer',
    additionalStates: 'weitere',
    searchLabel: 'Lernziele durchsuchen',
    searchPlaceholder: 'Titel, Beschreibung oder vollständige Lernziel-ID',
    chapters: 'Kapitel',
    allGoals: 'Alle Lernziele',
    goals: 'Lernziele',
    result: 'Treffer',
    results: 'Treffer',
    noResults: 'Keine Lernziele entsprechen dieser Suche und Kapitelauswahl.',
    clearFilters: 'Suche und Kapitel zurücksetzen',
    loading: 'Lernzielbuch wird geladen …',
    loadErrorTitle: 'Lernzielbuch nicht verfügbar',
    loadError: 'Das geprüfte Lernzielbuch konnte nicht geladen werden. Bitte versuche es später erneut.',
    retry: 'Erneut versuchen',
    invalidLink: 'Das verlinkte Lernziel gehört nicht zu dieser Ausgabe. Die Suche zeigt alle verfügbaren Lernziele.',
    goalId: 'Lernziel-ID',
    description: 'Lernzielbeschreibung',
    prerequisites: 'Direkte Voraussetzungen',
    requiredBy: 'Wird direkt vorausgesetzt von',
    outsideBook: 'Außerhalb dieser Ausgabe',
    outsideBookHint: 'Diese Relation ist fachlich erfasst, das Ziel besitzt in diesem Band jedoch keine eigene Seite.',
    sourceSubject: 'Fachliche Herkunft',
    externalPageTitle: 'Lernziel außerhalb dieser Ausgabe',
    externalPageText: 'Das Lernziel ist als fachliche Relation erfasst, gehört aber nicht zu den curricular-atomaren Zielseiten dieses Bands.',
    page: 'Seite',
    previous: 'Vorheriges Lernziel',
    next: 'Nächstes Lernziel',
    evidenceApproved: 'Didaktisches Evidenzprofil geprüft',
    evidencePending: 'Didaktisches Evidenzprofil in Prüfung',
    feedbackTitle: 'Feedback-Pilot',
    feedbackText: 'Die strukturierte Rückmeldung zu einer exakten Lernziel-ID und Buchversion wird vorbereitet. In diesem ersten Slice werden noch keine Daten übermittelt.',
    feedbackInfo: 'Mehr zum Feedback-Pilot',
    versionBinding: 'Version und Prüfbinding',
    edition: 'Buchausgabe',
    goalFingerprint: 'Zielfingerprint',
    pageFingerprint: 'Seitenfingerprint',
    bookDigest: 'Buchfingerprint',
    germanContent: 'Die Buchinhalte liegen derzeit auf Deutsch vor.',
  },
  en: {
    back: 'Back to home',
    eyebrow: 'LEARNING GOAL BOOK · REVIEW PILOT',
    titleFallback: 'Learning goal book',
    subtitleFallback: 'Gymnasium · lower and upper secondary · Germany',
    subtitle: 'Mathematics · Gymnasium · lower secondary',
    subtitleNationwide: 'Mathematics · Gymnasium · lower and upper secondary · Germany',
    pilotNotice: 'This edition is intended for subject and didactic review. Content and images may still change.',
    download: 'Download PDF',
    downloadHint: 'learning goals · one goal per page',
    books: 'Select subject',
    mathematics: 'Mathematics',
    physics: 'Physics',
    filters: 'Filter curriculum',
    filterHint: 'G8 and G9 are offered only within the selected German state.',
    jurisdiction: 'German state',
    allJurisdictions: 'All German states',
    selectJurisdictionFirst: 'Select a German state first',
    stage: 'Stage',
    allStages: 'All stages',
    durationModel: 'School duration',
    allDurationModels: 'All available',
    courseProfile: 'Course profile',
    allCourseProfiles: 'All course profiles',
    applicability: 'Curricular applicability',
    applicabilityDetails: 'Show complete applicability matrix',
    applicabilityJurisdiction: 'German state',
    applicabilityStage: 'Stage',
    applicabilityDuration: 'G8/G9',
    applicabilityCourse: 'Course profile',
    notApplicable: 'not applicable',
    states: 'German states',
    additionalStates: 'more',
    searchLabel: 'Search learning goals',
    searchPlaceholder: 'Title, description, or full learning-goal ID',
    chapters: 'Chapters',
    allGoals: 'All learning goals',
    goals: 'Learning goals',
    result: 'result',
    results: 'results',
    noResults: 'No learning goals match this search and chapter selection.',
    clearFilters: 'Clear search and chapter',
    loading: 'Loading learning goal book …',
    loadErrorTitle: 'Learning goal book unavailable',
    loadError: 'The validated learning goal book could not be loaded. Please try again later.',
    retry: 'Try again',
    invalidLink: 'The linked learning goal is not part of this edition. Search shows all available goals.',
    goalId: 'Learning-goal ID',
    description: 'Learning-goal description',
    prerequisites: 'Direct prerequisites',
    requiredBy: 'Directly required by',
    outsideBook: 'Outside this edition',
    outsideBookHint: 'This relation is recorded, but the goal has no page in this volume.',
    sourceSubject: 'Subject source',
    externalPageTitle: 'Learning goal outside this edition',
    externalPageText: 'This learning goal is recorded as a subject relation but is not one of the curricular-atomic pages in this volume.',
    page: 'Page',
    previous: 'Previous learning goal',
    next: 'Next learning goal',
    evidenceApproved: 'Didactic evidence profile reviewed',
    evidencePending: 'Didactic evidence profile under review',
    feedbackTitle: 'Feedback pilot',
    feedbackText: 'Structured feedback bound to an exact learning-goal ID and book version is being prepared. This first slice does not transmit any data.',
    feedbackInfo: 'About the feedback pilot',
    versionBinding: 'Version and review binding',
    edition: 'Book edition',
    goalFingerprint: 'Goal fingerprint',
    pageFingerprint: 'Page fingerprint',
    bookDigest: 'Book fingerprint',
    germanContent: 'The book content is currently available in German.',
  },
} as const

const goalBookSubject = (bookId: string): GoalBookSubject | null => (
  goalBookDefinitionById(bookId)?.subject ?? null
)

const subjectLabel = (
  bookId: string,
  c: typeof copy.de | typeof copy.en,
): string => {
  const subject = goalBookSubject(bookId)
  return subject ? c[subject] : bookId
}

const subjectSubtitle = (
  bookId: string,
  language: 'de' | 'en',
  c: typeof copy.de | typeof copy.en,
): string => {
  const subject = subjectLabel(bookId, c)
  return language === 'de'
    ? `${subject} · Gymnasium · Sekundarstufe I und II · Deutschland`
    : `${subject} · Gymnasium · lower and upper secondary · Germany`
}

const sourceSubjectLabel = (
  landscapeId: string,
  c: typeof copy.de | typeof copy.en,
): string | null => {
  const definition = goalBookDefinitionByLandscapeId(landscapeId)
  return definition ? subjectLabel(definition.bookId, c) : null
}

const JURISDICTION_LABELS: Record<string, { de: string; en: string }> = {
  'DE-BB': { de: 'Brandenburg', en: 'Brandenburg' },
  'DE-BE': { de: 'Berlin', en: 'Berlin' },
  'DE-BW': { de: 'Baden-Württemberg', en: 'Baden-Württemberg' },
  'DE-BY': { de: 'Bayern', en: 'Bavaria' },
  'DE-HB': { de: 'Bremen', en: 'Bremen' },
  'DE-HE': { de: 'Hessen', en: 'Hesse' },
  'DE-HH': { de: 'Hamburg', en: 'Hamburg' },
  'DE-MV': { de: 'Mecklenburg-Vorpommern', en: 'Mecklenburg-Western Pomerania' },
  'DE-NI': { de: 'Niedersachsen', en: 'Lower Saxony' },
  'DE-NW': { de: 'Nordrhein-Westfalen', en: 'North Rhine-Westphalia' },
  'DE-RP': { de: 'Rheinland-Pfalz', en: 'Rhineland-Palatinate' },
  'DE-SH': { de: 'Schleswig-Holstein', en: 'Schleswig-Holstein' },
  'DE-SL': { de: 'Saarland', en: 'Saarland' },
  'DE-SN': { de: 'Sachsen', en: 'Saxony' },
  'DE-ST': { de: 'Sachsen-Anhalt', en: 'Saxony-Anhalt' },
  'DE-TH': { de: 'Thüringen', en: 'Thuringia' },
}

const jurisdictionLabel = (jurisdiction: string, language: 'de' | 'en'): string => (
  JURISDICTION_LABELS[jurisdiction]?.[language] ?? jurisdiction
)

const stageLabel = (stage: string, language: 'de' | 'en'): string => {
  if (stage === 'SekI') return language === 'de' ? 'Sekundarstufe I' : 'Lower secondary'
  if (stage === 'SekII') return language === 'de' ? 'Sekundarstufe II' : 'Upper secondary'
  return stage
}

const ApplicabilityPanel: React.FC<{
  applicability: GoalBookApplicabilityGroup[]
  language: 'de' | 'en'
  c: typeof copy.de | typeof copy.en
}> = ({ applicability, language, c }) => {
  const jurisdictions = applicability.map(({ jurisdiction }) => jurisdiction)
  const jurisdictionNames = jurisdictions.map((jurisdiction) => jurisdictionLabel(jurisdiction, language))
  const jurisdictionSummary = jurisdictionNames.length === 16
    ? `${jurisdictionNames.length} ${c.states}`
    : jurisdictionNames.length <= 3
      ? jurisdictionNames.join(' · ')
      : `${jurisdictionNames.slice(0, 3).join(' · ')} · +${jurisdictionNames.length - 3} ${c.additionalStates}`
  const scopes = applicability.flatMap(({ scopes: groupScopes }) => groupScopes)
  const stages = [...new Set(scopes.map(({ stage }) => stage))]
  const profiles = [...new Set(scopes.flatMap(({ courseProfile }) => courseProfile ? [courseProfile] : []))]
  const durationGroups = applicability.flatMap(({ jurisdiction, scopes: groupScopes }) => {
    const durationModels = [...new Set(groupScopes.flatMap(({ durationModel }) => durationModel ? [durationModel] : []))]
    return durationModels.length > 0
      ? [`${jurisdictionLabel(jurisdiction, language)}: ${durationModels.join('/')}`]
      : []
  })

  return (
    <section className="mt-5 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/25">
      <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100">{c.applicability}</h3>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-sky-900 dark:text-sky-100">
        <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 dark:border-sky-800 dark:bg-sky-950/50">{jurisdictionSummary}</span>
        {stages.map((stage) => (
          <span key={stage} className="rounded-full border border-sky-200 bg-white px-2.5 py-1 dark:border-sky-800 dark:bg-sky-950/50">
            {stageLabel(stage, language)}
          </span>
        ))}
        {profiles.map((profile) => (
          <span key={profile} className="rounded-full border border-sky-200 bg-white px-2.5 py-1 dark:border-sky-800 dark:bg-sky-950/50">{profile}</span>
        ))}
      </div>
      {durationGroups.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-sky-900/80 dark:text-sky-100/80">
          {durationGroups.slice(0, 3).join(' · ')}
          {durationGroups.length > 3 ? ` · +${durationGroups.length - 3} ${c.additionalStates}` : ''}
        </p>
      )}
      <details className="mt-2">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-sky-800 dark:text-sky-200">
          {c.applicabilityDetails}
        </summary>
        <div className="overflow-x-auto pb-1">
          <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-sky-200 dark:border-sky-800">
                <th className="px-2 py-2 font-semibold">{c.applicabilityJurisdiction}</th>
                <th className="px-2 py-2 font-semibold">{c.applicabilityStage}</th>
                <th className="px-2 py-2 font-semibold">{c.applicabilityDuration}</th>
                <th className="px-2 py-2 font-semibold">{c.applicabilityCourse}</th>
              </tr>
            </thead>
            <tbody>
              {applicability.flatMap(({ jurisdiction, scopes: groupScopes }) => (
                groupScopes.map((scope, scopeIndex) => (
                  <tr key={`${jurisdiction}-${scope.stage}-${scope.durationModel ?? '-'}-${scope.courseProfile ?? '-'}`} className="border-b border-sky-100 last:border-0 dark:border-sky-900">
                    {scopeIndex === 0 && (
                      <th rowSpan={groupScopes.length} scope="rowgroup" className="px-2 py-2 align-top font-medium">
                        {jurisdictionLabel(jurisdiction, language)}
                      </th>
                    )}
                    <td className="px-2 py-2">{stageLabel(scope.stage, language)}</td>
                    <td className="px-2 py-2">{scope.durationModel ?? c.notApplicable}</td>
                    <td className="px-2 py-2">{scope.courseProfile ?? c.notApplicable}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

const RelationList: React.FC<{
  title: string
  internal: GoalBookRuntimeReference[]
  external: GoalBookRuntimeExternalReference[]
  c: typeof copy.de | typeof copy.en
}> = ({ title, internal, external, c }) => {
  if (internal.length === 0 && external.length === 0) return null
  return (
    <section className="rounded-xl border border-border-color bg-white/60 p-4 dark:bg-slate-900/45">
      <h3 className="font-semibold text-text-primary">{title}</h3>
      {internal.length > 0 && (
        <ul className="mt-3 space-y-2">
          {internal.map((relation) => (
            <li key={relation.goalId}>
              <a
                href={`#${relation.anchor}`}
                className="block rounded-lg border border-sky-200/80 bg-sky-50/70 px-3 py-2 text-sm transition hover:border-sky-400 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-sky-900 dark:bg-sky-950/30 dark:hover:border-sky-700"
              >
                <InlineMathText className="block font-medium text-sky-800 dark:text-sky-200" text={relation.title} />
                <span className="mt-1 block break-all font-mono text-[11px] text-text-secondary">
                  {relation.goalId} · S. {relation.pageNumber}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {external.length > 0 && (
        <div className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-2 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{c.outsideBook}</p>
          <p className="mt-1 text-xs text-text-secondary">{c.outsideBookHint}</p>
          <ul className="mt-2 space-y-2">
            {external.map((relation) => {
              const source = relation.landscapeId
                ? sourceSubjectLabel(relation.landscapeId, c)
                : null
              const content = (
                <>
                  <InlineMathText className="font-medium" text={relation.title} />
                  <span className="mt-0.5 block break-all font-mono text-[11px] text-text-secondary">
                    {relation.goalId}
                  </span>
                  {source && (
                    <span className="mt-0.5 block text-xs text-text-secondary">
                      {c.sourceSubject}: {source}
                    </span>
                  )}
                </>
              )
              return (
                <li key={relation.goalId} className="text-sm text-text-primary">
                  {relation.canonicalUrl ? (
                    <a
                      href={relation.canonicalUrl}
                      className="block rounded-lg px-2 py-1 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:bg-slate-800"
                    >
                      {content}
                    </a>
                  ) : content}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

const GoalPage: React.FC<{
  page: GoalBookRuntimePage
  model: GoalBookRuntimeModel
  navigationPages: GoalBookRuntimePage[]
  language: 'de' | 'en'
  c: typeof copy.de | typeof copy.en
}> = ({ page, model, navigationPages, language, c }) => {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const navigationIndex = navigationPages.findIndex(({ goalId }) => goalId === page.goalId)
  const previous = navigationIndex > 0 ? navigationPages[navigationIndex - 1] : null
  const next = navigationIndex >= 0 && navigationIndex < navigationPages.length - 1
    ? navigationPages[navigationIndex + 1]
    : null
  const showImage = page.visualization && failedImage !== page.visualization.url

  return (
    <article
      id={page.anchor}
      data-testid="goal-book-page"
      tabIndex={-1}
      aria-labelledby={`${page.anchor}-title`}
      className="min-w-0 rounded-2xl border border-border-color bg-white/85 p-5 shadow-sm outline-none dark:bg-slate-900/70 sm:p-7"
    >
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        {page.breadcrumbs.join(' › ')}
      </nav>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
            {c.page} {page.pageNumber} / {model.book.pageCount}
          </p>
          <h2
            id={`${page.anchor}-title`}
            className="mt-1 text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-100 sm:text-3xl"
          >
            <InlineMathText text={page.title} />
          </h2>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-100/80 px-3 py-2 dark:bg-slate-800/80">
        <span className="text-xs font-semibold text-text-secondary">{c.goalId}</span>
        <code className="mt-1 block break-all text-xs text-text-primary">{page.goalId}</code>
      </div>

      {page.applicability && (
        <ApplicabilityPanel applicability={page.applicability} language={language} c={c} />
      )}

      {showImage && page.visualization && (
        <figure className="mt-5 overflow-hidden rounded-xl border border-border-color bg-slate-50 p-3 dark:bg-slate-950/40">
          <img
            src={page.visualization.url}
            alt={page.visualization.altText}
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(page.visualization?.url ?? null)}
            className="mx-auto max-h-[26rem] w-full object-contain"
          />
        </figure>
      )}

      <section className="mt-6">
        <h3 className="text-lg font-semibold text-text-primary">{c.description}</h3>
        <p className="mt-2 text-base leading-7 text-text-primary"><InlineMathText text={page.description} /></p>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <RelationList
          title={c.prerequisites}
          internal={page.requires}
          external={page.externalPrerequisites}
          c={c}
        />
        <RelationList
          title={c.requiredBy}
          internal={page.reverseRequires}
          external={page.externalReverseRequires}
          c={c}
        />
      </div>

      {page.evidenceReview && (
        <p className="mt-5 inline-flex rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
          {page.evidenceReview.status === 'approved' ? c.evidenceApproved : c.evidencePending}
          {' · '}{page.evidenceReview.evidenceLevel}/{page.evidenceReview.maximumClaimScope}
        </p>
      )}

      <details className="mt-5 rounded-lg border border-border-color bg-slate-50/70 px-3 py-2 text-xs dark:bg-slate-950/30">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-text-secondary">
          {c.versionBinding}
        </summary>
        <dl className="grid gap-3 pb-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
          <dt className="font-semibold text-text-secondary">{c.edition}</dt>
          <dd><code className="break-all">{model.book.edition}</code></dd>
          <dt className="font-semibold text-text-secondary">{c.goalFingerprint}</dt>
          <dd><code className="break-all">{page.goalFingerprint}</code></dd>
          <dt className="font-semibold text-text-secondary">{c.pageFingerprint}</dt>
          <dd><code className="break-all">{page.pageFingerprint}</code></dd>
          <dt className="font-semibold text-text-secondary">{c.bookDigest}</dt>
          <dd><code className="break-all">{model.digest}</code></dd>
        </dl>
      </details>

      <nav aria-label="Lernzielreihenfolge" className="mt-7 flex items-stretch justify-between gap-3 border-t border-border-color pt-5">
        {previous ? (
          <a
            href={`#${previous.anchor}`}
            className="inline-flex min-h-11 max-w-[48%] items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-medium text-text-primary transition hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          >
            <ChevronLeft className="shrink-0" size={18} aria-hidden="true" />
            <span className="truncate">{c.previous}</span>
          </a>
        ) : <span />}
        {next && (
          <a
            href={`#${next.anchor}`}
            className="inline-flex min-h-11 max-w-[48%] items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-medium text-text-primary transition hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          >
            <span className="truncate">{c.next}</span>
            <ChevronRight className="shrink-0" size={18} aria-hidden="true" />
          </a>
        )}
      </nav>
    </article>
  )
}

const ApplicabilityFilters: React.FC<{
  model: GoalBookRuntimeModel
  filter: GoalBookApplicabilityFilter
  onChange: (filter: GoalBookApplicabilityFilter) => void
  language: 'de' | 'en'
  c: typeof copy.de | typeof copy.en
}> = ({ model, filter, onChange, language, c }) => {
  const options = goalBookApplicabilityOptions(model, filter)
  if (options.jurisdictions.length === 0) return null
  const secondaryDisabled = filter.jurisdiction === null
  const durationDisabled = secondaryDisabled || options.durationModels.length === 0
  const courseDisabled = secondaryDisabled || options.courseProfiles.length === 0
  const selectClassName = 'min-h-11 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:bg-slate-900 dark:focus:ring-sky-900 dark:disabled:bg-slate-800'
  return (
    <fieldset className="mt-4 rounded-xl border border-border-color bg-white/95 p-4 shadow-sm dark:bg-slate-950/95">
      <legend className="px-1 text-sm font-semibold text-text-primary">{c.filters}</legend>
      <p className="mb-3 text-xs leading-5 text-text-secondary">{c.filterHint}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-semibold text-text-secondary">
          {c.jurisdiction}
          <select
            aria-label={c.jurisdiction}
            value={filter.jurisdiction ?? ''}
            onChange={(event) => onChange({
              jurisdiction: event.target.value || null,
              stage: null,
              durationModel: null,
              courseProfile: null,
            })}
            className={`${selectClassName} mt-1`}
          >
            <option value="">{c.allJurisdictions}</option>
            {options.jurisdictions.map((jurisdiction) => (
              <option key={jurisdiction} value={jurisdiction}>{jurisdictionLabel(jurisdiction, language)}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          {c.stage}
          <select
            aria-label={c.stage}
            value={filter.stage ?? ''}
            disabled={secondaryDisabled}
            onChange={(event) => onChange({
              ...filter,
              stage: event.target.value || null,
              durationModel: null,
              courseProfile: null,
            })}
            className={`${selectClassName} mt-1`}
          >
            <option value="">{secondaryDisabled ? c.selectJurisdictionFirst : c.allStages}</option>
            {options.stages.map((stage) => (
              <option key={stage} value={stage}>{stageLabel(stage, language)}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          {c.durationModel}
          <select
            aria-label={c.durationModel}
            value={filter.durationModel ?? ''}
            disabled={durationDisabled}
            onChange={(event) => onChange({ ...filter, durationModel: event.target.value || null })}
            className={`${selectClassName} mt-1`}
          >
            <option value="">{secondaryDisabled ? c.selectJurisdictionFirst : c.allDurationModels}</option>
            {options.durationModels.map((durationModel) => (
              <option key={durationModel} value={durationModel}>{durationModel}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          {c.courseProfile}
          <select
            aria-label={c.courseProfile}
            value={filter.courseProfile ?? ''}
            disabled={courseDisabled}
            onChange={(event) => onChange({ ...filter, courseProfile: event.target.value || null })}
            className={`${selectClassName} mt-1`}
          >
            <option value="">{secondaryDisabled ? c.selectJurisdictionFirst : c.allCourseProfiles}</option>
            {options.courseProfiles.map((courseProfile) => (
              <option key={courseProfile} value={courseProfile}>{courseProfile}</option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  )
}

const ChapterControls: React.FC<{
  model: GoalBookRuntimeModel
  selectedChapterId: string | null
  chapterDepths: Map<string, number>
  onSelect: (chapterId: string | null) => void
  c: typeof copy.de | typeof copy.en
}> = ({ model, selectedChapterId, chapterDepths, onSelect, c }) => (
  <>
    <button
      type="button"
      onClick={() => onSelect(null)}
      aria-current={selectedChapterId === null ? 'true' : undefined}
      className={`mt-2 min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${selectedChapterId === null ? 'bg-sky-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      {c.allGoals} <span className="opacity-75">({model.book.pageCount})</span>
    </button>
    <ul className="mt-1 space-y-0.5">
      {model.chapters.slice(1).map((chapter) => {
        const depth = Math.max(0, (chapterDepths.get(chapter.chapterId) ?? 1) - 1)
        const active = selectedChapterId === chapter.chapterId
        return (
          <li key={chapter.chapterId}>
            <button
              type="button"
              onClick={() => onSelect(chapter.chapterId)}
              aria-current={active ? 'true' : undefined}
              style={{ paddingLeft: `${0.75 + Math.min(depth, 3) * 0.75}rem` }}
              className={`min-h-11 w-full rounded-lg py-2 pr-2 text-left text-sm leading-tight transition ${active ? 'bg-sky-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className="block">{chapter.label}</span>
              <span className="mt-0.5 block text-xs opacity-70">{chapter.goalIds.length} {c.goals}</span>
            </button>
          </li>
        )
      })}
    </ul>
  </>
)

export const GoalBookView: React.FC = () => {
  const { language } = useLanguage()
  const location = useLocation()
  const c = copy[language === 'en' ? 'en' : 'de']
  const [model, setModel] = useState<GoalBookRuntimeModel | null>(null)
  const [publication, setPublication] = useState<GoalBookRuntimePublication | null>(null)
  const [publicationIndex, setPublicationIndex] = useState<GoalBookRuntimePublicationIndex | null>(null)
  const [loadingAttempt, setLoadingAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [applicabilityFilter, setApplicabilityFilter] = useState<GoalBookApplicabilityFilter>({
    jurisdiction: null,
    stage: null,
    durationModel: null,
    courseProfile: null,
  })
  const [hash, setHash] = useState(() => window.location.hash)
  const detailRef = useRef<HTMLDivElement>(null)
  const mobileChapterRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const abortController = new AbortController()
    fetch(GOAL_BOOK_INDEX_URL, {
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return parseGoalBookPublicationIndex(await response.json())
      })
      .then(async (nextPublicationIndex) => {
        const nextPublication = selectGoalBookPublication(nextPublicationIndex, location.search)
        setPublicationIndex(nextPublicationIndex)
        const response = await fetch(nextPublication.modelUrl, {
          credentials: 'omit',
          redirect: 'error',
          cache: 'no-store',
          signal: abortController.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const nextModel = await parseVerifiedGoalBookRuntimeModel(
          await response.arrayBuffer(),
          nextPublication.modelSha256,
        )
        assertGoalBookPublicationBinding(nextPublication, nextModel)
        return { nextModel, nextPublication }
      })
      .then(({ nextModel, nextPublication }) => {
        setModel(nextModel)
        setPublication(nextPublication)
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setModel(null)
        setPublication(null)
        setLoading(false)
        setError(true)
      })
    return () => abortController.abort()
  }, [loadingAttempt, location.search])

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const chapterDepths = useMemo(
    () => model ? goalBookChapterDepths(model.chapters) : new Map<string, number>(),
    [model],
  )
  const filteredPages = useMemo(
    () => model ? filterGoalBookPages({
      model,
      query,
      chapterId,
      applicability: applicabilityFilter,
    }) : [],
    [applicabilityFilter, chapterId, model, query],
  )
  const linkedPage = useMemo(
    () => model && hash ? goalBookPageFromHash(model, hash) : null,
    [hash, model],
  )
  const linkedExternalReference = useMemo(
    () => model && hash ? goalBookExternalReferenceFromHash(model, hash) : null,
    [hash, model],
  )
  const linkedExternalSource = linkedExternalReference?.landscapeId
    ? sourceSubjectLabel(linkedExternalReference.landscapeId, c)
    : null
  const invalidHash = Boolean(model && hash && !linkedPage && !linkedExternalReference)
  const linkedPageInFilter = linkedPage
    ? filteredPages.some(({ goalId }) => goalId === linkedPage.goalId)
    : false
  const selectedPage = (linkedPageInFilter ? linkedPage : null)
    ?? (linkedExternalReference ? null : filteredPages[0])
    ?? null

  useEffect(() => {
    if (!selectedPage) return
    const frame = window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ block: 'start' })
      document.getElementById(selectedPage.anchor)?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedPage])

  return (
    <div
      data-testid="goal-book-shell"
      className="min-h-screen bg-slate-50 text-text-primary transition-colors dark:bg-app-gradient"
    >
      <a
        href="#lernzielbuch-inhalt"
        className="sr-only z-50 rounded bg-white px-3 py-2 text-slate-900 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Zum Lernzielbuch
      </a>
      <header className="border-b border-border-color bg-white/75 backdrop-blur dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-sky-600">
            <ArrowLeft size={18} aria-hidden="true" />
            {c.back}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="lernzielbuch-inhalt" className="mx-auto max-w-[110rem] px-4 py-7 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-sky-700 dark:text-sky-300">
              <BookOpen size={18} aria-hidden="true" />
              {c.eyebrow}
            </p>
            {publicationIndex && publicationIndex.books.length > 1 && (
              <nav aria-label={c.books} className="mt-4 flex w-fit flex-wrap gap-1 rounded-xl border border-border-color bg-white/80 p-1 dark:bg-slate-900/70">
                {publicationIndex.books.map((book) => {
                  const active = publication?.bookId === book.bookId
                  return (
                    <Link
                      key={book.bookId}
                      to={goalBookRoute(book.bookId)}
                      onClick={() => {
                        if (active) return
                        setLoading(true)
                        setError(false)
                        setModel(null)
                        setPublication(null)
                        setQuery('')
                        setChapterId(null)
                        setApplicabilityFilter({
                          jurisdiction: null,
                          stage: null,
                          durationModel: null,
                          courseProfile: null,
                        })
                      }}
                      aria-current={active ? 'page' : undefined}
                      data-testid={`goal-book-select-${book.bookId}`}
                      className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${active ? 'bg-sky-700 text-white' : 'text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {subjectLabel(book.bookId, c)}
                    </Link>
                  )
                })}
              </nav>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
              {model?.book.title ?? c.titleFallback}
            </h1>
            <p className="mt-2 text-lg text-text-secondary">
              {model ? subjectSubtitle(model.book.id, language === 'en' ? 'en' : 'de', c) : c.subtitleFallback}
            </p>
            {language === 'en' && <p className="mt-1 text-sm text-text-secondary">{c.germanContent}</p>}
          </div>
          <a
            href={publication?.pdfUrl ?? '#'}
            download
            data-testid="goal-book-pdf"
            aria-disabled={!publication || undefined}
            className={`inline-flex min-h-12 w-fit items-center gap-3 rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${publication ? 'bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500' : 'pointer-events-none bg-slate-400'}`}
          >
            <Download size={20} aria-hidden="true" />
            <span>
              <span className="block">{c.download}</span>
              <span className="block text-xs font-normal text-sky-100">
                {publication?.pageCount ?? model?.book.pageCount ?? '–'} {c.downloadHint}
              </span>
            </span>
          </a>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
          <FlaskConical className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
          <p>{c.pilotNotice}</p>
        </div>

        {loading && (
          <div role="status" className="mt-10 rounded-xl border border-border-color bg-white/70 p-8 text-center text-text-secondary dark:bg-slate-900/60">
            {c.loading}
          </div>
        )}
        {error && (
          <div role="alert" className="mt-10 rounded-xl border border-red-300 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">{c.loadErrorTitle}</h2>
                <p className="mt-1 text-sm">{c.loadError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true)
                    setError(false)
                    setLoadingAttempt((attempt) => attempt + 1)
                  }}
                  className="mt-4 min-h-11 rounded-lg border border-current px-4 py-2 text-sm font-semibold"
                >
                  {c.retry}
                </button>
              </div>
            </div>
          </div>
        )}

        {model && (
          <>
            <div className="sticky top-0 z-20 mt-6 rounded-xl border border-border-color bg-white/95 p-3 shadow-sm backdrop-blur dark:bg-slate-950/95">
              <label htmlFor="goal-book-search" className="mb-2 block text-sm font-semibold text-text-primary">
                {c.searchLabel}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={19} aria-hidden="true" />
                <input
                  id="goal-book-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={c.searchPlaceholder}
                  className="min-h-11 w-full rounded-lg border border-border-color bg-white py-2 pl-10 pr-3 text-text-primary outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:bg-slate-900 dark:focus:ring-sky-900"
                />
              </div>
            </div>

            <ApplicabilityFilters
              model={model}
              filter={applicabilityFilter}
              onChange={setApplicabilityFilter}
              language={language === 'en' ? 'en' : 'de'}
              c={c}
            />

            {invalidHash && (
              <p role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {c.invalidLink}
              </p>
            )}

            <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[15rem_minmax(15rem,21rem)_minmax(0,1fr)]">
              <details ref={mobileChapterRef} className="min-w-0 rounded-xl border border-border-color bg-white/70 p-3 dark:bg-slate-900/55 lg:hidden">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  {c.chapters}
                  <span className="normal-case tracking-normal">
                    {model.chapters.find((chapter) => chapter.chapterId === chapterId)?.label ?? c.allGoals}
                  </span>
                </summary>
                <nav aria-label={c.chapters} className="mt-2 max-h-[60vh] overflow-y-auto border-t border-border-color pt-2">
                  <ChapterControls
                    model={model}
                    selectedChapterId={chapterId}
                    chapterDepths={chapterDepths}
                    onSelect={(nextChapterId) => {
                      setChapterId(nextChapterId)
                      mobileChapterRef.current?.removeAttribute('open')
                    }}
                    c={c}
                  />
                </nav>
              </details>

              <nav aria-label={c.chapters} className="hidden min-w-0 rounded-xl border border-border-color bg-white/70 p-3 dark:bg-slate-900/55 lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:self-start">
                <h2 className="px-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">{c.chapters}</h2>
                <ChapterControls
                  model={model}
                  selectedChapterId={chapterId}
                  chapterDepths={chapterDepths}
                  onSelect={setChapterId}
                  c={c}
                />
              </nav>

              <section aria-labelledby="goal-book-results-title" className="min-w-0 rounded-xl border border-border-color bg-white/70 p-3 dark:bg-slate-900/55 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:self-start">
                <div className="flex items-baseline justify-between gap-2 px-2">
                  <h2 id="goal-book-results-title" className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                    {c.goals}
                  </h2>
                  <p aria-live="polite" className="text-xs text-text-secondary">
                    {filteredPages.length} {filteredPages.length === 1 ? c.result : c.results}
                  </p>
                </div>
                {filteredPages.length === 0 ? (
                  <div className="px-2 py-5 text-sm text-text-secondary">
                    <p>{c.noResults}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        setChapterId(null)
                        setApplicabilityFilter({
                          jurisdiction: null,
                          stage: null,
                          durationModel: null,
                          courseProfile: null,
                        })
                      }}
                      className="mt-3 min-h-11 rounded-lg border border-border-color px-3 py-2 font-medium text-text-primary"
                    >
                      {c.clearFilters}
                    </button>
                  </div>
                ) : (
                  <ol className="mt-2 space-y-1">
                    {filteredPages.map((page) => {
                      const active = selectedPage?.goalId === page.goalId
                      return (
                        <li key={page.goalId}>
                          <a
                            href={`#${page.anchor}`}
                            aria-current={active ? 'page' : undefined}
                            className={`block rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${active ? 'border-sky-400 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100' : 'border-transparent hover:border-border-color hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}
                          >
                            <InlineMathText className="block font-medium leading-snug" text={page.title} />
                            <span className="mt-1 block break-all font-mono text-[10px] text-text-secondary">{page.goalId}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>

              <div ref={detailRef} className="min-w-0 scroll-mt-28">
                {selectedPage && (
                  <GoalPage
                    key={selectedPage.goalId}
                    page={selectedPage}
                    model={model}
                    navigationPages={filteredPages}
                    language={language === 'en' ? 'en' : 'de'}
                    c={c}
                  />
                )}
                {!selectedPage && linkedExternalReference && (
                  <article className="rounded-2xl border border-border-color bg-white/85 p-6 shadow-sm dark:bg-slate-900/70">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">{c.outsideBook}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{c.externalPageTitle}</h2>
                    <p className="mt-4 text-base leading-7 text-text-primary">{c.externalPageText}</p>
                    <InlineMathText className="mt-5 block text-lg font-medium" text={linkedExternalReference.title} />
                    <code className="mt-2 block break-all rounded-lg bg-slate-100 px-3 py-2 text-xs dark:bg-slate-800">
                      {linkedExternalReference.goalId}
                    </code>
                    {linkedExternalSource && (
                      <p className="mt-3 text-sm text-text-secondary">
                        {c.sourceSubject}: {linkedExternalSource}
                      </p>
                    )}
                  </article>
                )}
              </div>
            </div>

            <section className="mt-7 rounded-xl border border-dashed border-violet-300 bg-violet-50/70 p-5 dark:border-violet-900 dark:bg-violet-950/25">
              <h2 className="flex items-center gap-2 font-semibold text-violet-900 dark:text-violet-200">
                <FlaskConical size={18} aria-hidden="true" />
                {c.feedbackTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-violet-900/80 dark:text-violet-200/80">
                {c.feedbackText}
              </p>
              <Link
                to={selectedPage
                  ? `/lernziel-feedback?${new URLSearchParams({
                      bookId: model.book.id,
                      goalId: selectedPage.goalId,
                      edition: model.book.edition,
                      page: String(selectedPage.pageNumber),
                      goalFingerprint: selectedPage.goalFingerprint,
                      pageFingerprint: selectedPage.pageFingerprint,
                      bookDigest: model.digest,
                    }).toString()}`
                  : '/lernziel-feedback'}
                className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-violet-400 px-3 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-100 dark:border-violet-700 dark:text-violet-100 dark:hover:bg-violet-950/60"
              >
                {c.feedbackInfo}
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
