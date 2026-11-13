import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  MessageSquareText,
  Send,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'
import {
  createGoalBookFeedbackSubmission,
  createGeneralFeedbackSubmission,
  GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION,
  GOAL_BOOK_FEEDBACK_SUBMISSION_ENDPOINT,
  goalBookFeedbackContextUrl,
  parseGoalBookFeedbackLinkBinding,
  parseGoalBookFeedbackResolvedContext,
  parseGoalBookFeedbackSubmissionReceipt,
  type GoalBookFeedbackResolvedContext,
} from '../utils/goalBookFeedback'
import {
  isLearnerCockpitGoalFeedbackNavigationState,
  learnerCockpitGoalFeedbackReturnPath,
} from '../utils/goalFeedbackReturnNavigation'
import { goalBookRoute } from '../utils/goalBookPublicationRegistry'

type LoadState =
  | { status: 'general' }
  | { status: 'loading' }
  | { status: 'invalid-link' }
  | { status: 'unavailable' }
  | { status: 'ready'; value: GoalBookFeedbackResolvedContext }

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error' }
  | { status: 'submitted'; feedbackId: string }

const copy = {
  de: {
    backToGoalBook: 'Zurück zum Lernzielbuch',
    backToCockpit: 'Zurück zum Cockpit',
    eyebrow: 'Deine Rückmeldung',
    title: 'Feedback geben',
    introduction: 'Was können wir verbessern? Ob Lerninhalt, Coach oder Bedienung: Beschreibe einfach, was dir aufgefallen ist.',
    scope: 'Worum geht es?',
    goalScope: 'Zu diesem Lernziel',
    generalScope: 'Allgemein zu SkillPilot',
    goalDetails: 'Lernziel und Bild ansehen',
    backToStart: 'Zurück zur Startseite',
    loading: 'Lernziel wird geladen …',
    generalFallback: 'Allgemeines Feedback geben',
    invalidTitle: 'Feedbacklink nicht gültig',
    invalidText: 'Die Lernziel-ID, Seite oder Buchfassung konnte nicht eindeutig geprüft werden. Bitte öffne den Feedbacklink erneut direkt beim gewünschten Lernziel.',
    unavailableTitle: 'Feedbackkanal nicht verfügbar',
    unavailableText: 'Die Lernzielbindung konnte derzeit nicht vom Server bestätigt werden. Es wurden keine Feedbackdaten übermittelt.',
    goalId: 'Lernziel-ID',
    edition: 'Buchausgabe',
    page: 'Seite',
    imageUnavailable: 'Das Lernzielbild konnte nicht geladen werden. Du kannst trotzdem Feedback dazu geben.',
    observation: 'Was ist dir konkret aufgefallen?',
    observationHint: 'Hilfreich sind: Wo ist es passiert? Was hast du erwartet, und was ist stattdessen passiert? Wenn du eine Verbesserungsidee oder Fundstelle hast, schreibe sie einfach dazu.',
    automated: 'Ich verstehe, dass die Prüfung technisch unterstützt werden kann. Über Änderungen entscheidet immer eine fachlich verantwortliche Person.',
    send: 'Feedback absenden',
    sending: 'Feedback wird gespeichert …',
    submitError: 'Das Feedback konnte nicht gespeichert werden. Es bleibt im Formular erhalten; bitte versuche es später erneut.',
    successTitle: 'Feedback wurde gespeichert',
    successText: 'Vielen Dank. Deine Rückmeldung ist eingegangen und wird vor einer möglichen Änderung fachlich geprüft.',
    receipt: 'Feedback-ID',
    noPersonalData: 'Bitte keine Namen, Lernenden-IDs, vollständigen Chats oder anderen personenbezogenen oder vertraulichen Angaben eintragen.',
    privacyDetailsSummary: 'Datenschutzdetails anzeigen',
    privacyNoticeTitle: 'Datenschutz für Feedback',
    privacyNoticeDate: 'Stand: 13. November 2026',
    privacyNoticeVersion: 'Hinweisversion',
    privacyNoticeIntro: 'Verantwortlich ist die enpasos - Enterprise Patterns & Solutions GmbH. Wir verarbeiten deine freiwilligen Angaben ausschließlich, um deine Rückmeldung zu prüfen und SkillPilot, seine Lerninhalte oder die Bedienung gegebenenfalls zu verbessern.',
    privacyNoticeItems: [
      'Gespeichert werden dein Feedbacktext, eine zufällige Feedback-ID, der Eingangszeitpunkt und die bestätigten Datenschutzhinweise. Bei Feedback zu einem Lernziel werden auch Lernziel, Buchausgabe und Seite zugeordnet; allgemeines Feedback hat diese Zuordnung nicht. Anhänge, SkillPilot-IDs und Chatverläufe werden nicht angefordert oder automatisch übermittelt.',
      'Unbearbeitetes Feedback wird im laufenden Betrieb spätestens nach 31 Tagen gelöscht. Nach Beginn einer Prüfung wird es nur so lange aufbewahrt, wie es für die Prüfung und eine ausdrücklich beauftragte Verbesserung erforderlich ist.',
      'Bei der Prüfung können beauftragte technische Dienste und automatisierte Assistenz eingesetzt werden. Änderungen am Curriculum benötigen immer eine fachliche Freigabe.',
      'Du kannst deine Einwilligung jederzeit für die Zukunft widerrufen sowie Auskunft oder Löschung anfragen. Nenne möglichst die angezeigte Feedback-ID. Gesetzliche Pflichten bleiben unberührt. Bestehende technische Sicherungskopien werden durch eine Löschung aus aktiven Systemen nicht einzeln verändert.',
    ],
    privacyNoticePolicy: 'Allgemeine Datenschutzerklärung',
    privacyNoticeContact: 'Datenschutzkontakt',
    privacyConsent: 'Ich willige in die Verarbeitung meiner Angaben zur Prüfung meiner Rückmeldung und zur Verbesserung von SkillPilot ein. Die Einwilligung ist freiwillig und kann für die Zukunft widerrufen werden.',
  },
  en: {
    backToGoalBook: 'Back to the learning goal book',
    backToCockpit: 'Back to the cockpit',
    eyebrow: 'Your feedback',
    title: 'Give feedback',
    introduction: 'What could we improve? Learning content, the coach, or using SkillPilot: simply describe what you noticed.',
    scope: 'What is your feedback about?',
    goalScope: 'This learning goal',
    generalScope: 'SkillPilot in general',
    goalDetails: 'View the learning goal and image',
    backToStart: 'Back to the start page',
    loading: 'Loading the learning goal …',
    generalFallback: 'Give general feedback',
    invalidTitle: 'Invalid feedback link',
    invalidText: 'The learning-goal ID, page, or book edition could not be verified unambiguously. Please reopen the feedback link directly from the intended learning goal.',
    unavailableTitle: 'Feedback channel unavailable',
    unavailableText: 'The server could not confirm the learning-goal binding. No feedback data was transmitted.',
    goalId: 'Learning-goal ID',
    edition: 'Book edition',
    page: 'Page',
    imageUnavailable: 'The learning-goal image could not be loaded. You can still provide feedback about it.',
    observation: 'What exactly did you notice?',
    observationHint: 'Helpful details: Where did it happen? What did you expect, and what happened instead? Include any improvement idea or reference in the same text.',
    automated: 'I understand that the review may be technically assisted. A qualified person always decides whether the curriculum is changed.',
    send: 'Submit feedback',
    sending: 'Saving feedback …',
    submitError: 'The feedback could not be saved. It remains in the form; please try again later.',
    successTitle: 'Feedback saved',
    successText: 'Thank you. Your feedback has been received and will be reviewed before any possible change.',
    receipt: 'Feedback ID',
    noPersonalData: 'Please do not include names, learner IDs, complete chats, or other personal or confidential information.',
    privacyDetailsSummary: 'Show privacy details',
    privacyNoticeTitle: 'Privacy for feedback',
    privacyNoticeDate: 'Effective: November 13, 2026',
    privacyNoticeVersion: 'Notice version',
    privacyNoticeIntro: 'The controller is enpasos - Enterprise Patterns & Solutions GmbH. We process your voluntary information solely to review your feedback and, where appropriate, improve SkillPilot, its learning content, or its usability.',
    privacyNoticeItems: [
      'We store your feedback text, a random feedback ID, the receipt time, and your acknowledged privacy notice. Learning-goal feedback also includes the learning goal, book edition, and page; general feedback has no such binding. Attachments, SkillPilot IDs, and chat transcripts are neither requested nor automatically transmitted.',
      'Unprocessed feedback is deleted during normal operation no later than 31 days after receipt. Once a review begins, it is retained only as long as needed for that review and any expressly commissioned improvement.',
      'Commissioned technical services and automated assistance may support the review. Changes to the curriculum always require qualified approval.',
      'You may withdraw consent for the future at any time and request access or deletion. Please include the displayed feedback ID where possible. Statutory obligations remain unaffected. Existing technical backups are not individually changed when data is deleted from active systems.',
    ],
    privacyNoticePolicy: 'General Privacy Policy',
    privacyNoticeContact: 'Privacy contact',
    privacyConsent: 'I consent to the processing of my information to review my feedback and improve SkillPilot. Consent is voluntary and may be withdrawn for the future.',
  },
} as const

const optionalText = (value: FormDataEntryValue | null): string | undefined => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized || undefined
}

export const GoalBookFeedbackPilotView: React.FC = () => {
  const { language } = useLanguage()
  const location = useLocation()
  const english = language === 'en'
  const locale = english ? 'en' : 'de'
  const c = english ? copy.en : copy.de
  const binding = useMemo(
    () => parseGoalBookFeedbackLinkBinding(location.search),
    [location.search],
  )
  const [scopeSelection, setScopeSelection] = useState<{ search: string; scope: 'goal' | 'general' }>({
    search: location.search,
    scope: binding ? 'goal' : 'general',
  })
  const feedbackScope = scopeSelection.search === location.search
    ? scopeSelection.scope
    : binding ? 'goal' : 'general'
  const acknowledgementKey = `${location.search}:${feedbackScope}`
  const [loadState, setLoadState] = useState<LoadState>(() => (
    binding ? { status: 'loading' } : location.search ? { status: 'invalid-link' } : { status: 'general' }
  ))
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [failedVisualizationUrl, setFailedVisualizationUrl] = useState<string | null>(null)
  const [acknowledgements, setAcknowledgements] = useState({
    bindingSearch: acknowledgementKey,
    locale,
    privacy: false,
    automated: false,
  })
  const formRef = useRef<HTMLFormElement>(null)
  const clientSubmissionRef = useRef<{ payloadIdentity: string; id: string } | null>(null)
  const submissionGenerationRef = useRef(0)

  // Invalidate pending answers when the form context changes, before a new
  // form can receive an earlier form's receipt, error, or focus request.
  useLayoutEffect(() => {
    submissionGenerationRef.current += 1
    return () => { submissionGenerationRef.current += 1 }
  }, [location.pathname, location.search])

  useEffect(() => {
    setAcknowledgements({
      bindingSearch: acknowledgementKey,
      locale,
      privacy: false,
      automated: false,
    })
  }, [acknowledgementKey, locale])

  useEffect(() => {
    clientSubmissionRef.current = null
    setSubmitState({ status: 'idle' })
    setFailedVisualizationUrl(null)
    if (!binding) {
      setLoadState(location.search ? { status: 'invalid-link' } : { status: 'general' })
      return
    }
    const controller = new AbortController()
    setLoadState({ status: 'loading' })
    void fetch(goalBookFeedbackContextUrl(binding), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`context:${response.status}`)
      const resolved = parseGoalBookFeedbackResolvedContext(await response.json())
      if (!resolved
        || resolved.context.bookId !== binding.bookId
        || resolved.context.goalId !== binding.goalId
        || resolved.context.bookEdition !== binding.edition
        || resolved.context.goalFingerprint !== binding.goalFingerprint
        || resolved.context.pageFingerprint !== binding.pageFingerprint
        || resolved.context.bookDigest !== binding.bookDigest
        || String(resolved.context.pageNumber) !== binding.page) {
        setLoadState({ status: 'invalid-link' })
        return
      }
      setLoadState({ status: 'ready', value: resolved })
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return
      console.warn('[GoalBookFeedback] Context resolution failed', reason)
      setLoadState({ status: 'unavailable' })
    })
    return () => controller.abort()
  }, [binding, location.pathname, location.search])

  const bookTarget = binding ? goalBookRoute(binding.bookId) : '/lernzielbuch'
  const cockpitTarget = isLearnerCockpitGoalFeedbackNavigationState(location.state)
    ? binding ? learnerCockpitGoalFeedbackReturnPath(binding) : '/learner'
    : null
  const backTarget = cockpitTarget
    ? cockpitTarget
    : binding ? `${bookTarget}#goal-${binding.goalId}` : '/'
  const backLabel = cockpitTarget ? c.backToCockpit : binding ? c.backToGoalBook : c.backToStart
  const acknowledgementsAreCurrent = acknowledgements.bindingSearch === acknowledgementKey
    && acknowledgements.locale === locale

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if ((loadState.status !== 'ready' && loadState.status !== 'general') || submitState.status === 'submitting') return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const observation = optionalText(data.get('observation'))
    if (!observation) return
    const website = optionalText(data.get('website')) ?? ''
    const goalContext = feedbackScope === 'goal' && loadState.status === 'ready' ? loadState.value.context : null
    const content = { category: 'other' as const, observation }
    const payloadIdentity = JSON.stringify({
      context: goalContext,
      website,
      content,
      privacyNoticeLocale: locale,
      privacyNoticeVersion: GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION,
    })
    if (clientSubmissionRef.current?.payloadIdentity !== payloadIdentity) {
      clientSubmissionRef.current = { payloadIdentity, id: crypto.randomUUID() }
    }
    const shared = { clientSubmissionId: clientSubmissionRef.current.id, website, privacyNoticeLocale: locale } as const
    const payload = goalContext
      ? createGoalBookFeedbackSubmission({ ...shared, context: goalContext, content })
      : createGeneralFeedbackSubmission({ ...shared, observation })
    const submissionGeneration = submissionGenerationRef.current
    setSubmitState({ status: 'submitting' })
    try {
      const response = await fetch(GOAL_BOOK_FEEDBACK_SUBMISSION_ENDPOINT, {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (response.status !== 202) throw new Error(`submit:${response.status}`)
      const receipt = parseGoalBookFeedbackSubmissionReceipt(await response.json())
      if (!receipt) throw new Error('submit:invalid-receipt')
      if (submissionGeneration !== submissionGenerationRef.current) return
      setSubmitState({ status: 'submitted', feedbackId: receipt.feedbackId })
    } catch (reason) {
      if (submissionGeneration !== submissionGenerationRef.current) return
      console.warn('[GoalBookFeedback] Submission failed', reason)
      setSubmitState({ status: 'error' })
      requestAnimationFrame(() => {
        if (submissionGeneration === submissionGenerationRef.current) {
          formRef.current?.querySelector<HTMLElement>('[name="observation"]')?.focus()
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-text-primary transition-colors dark:bg-app-gradient sm:px-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link to={backTarget} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary hover:text-sky-600">
          <ArrowLeft size={18} aria-hidden="true" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-3xl rounded-2xl border border-violet-300 bg-white/90 p-6 shadow-sm dark:border-violet-900 dark:bg-slate-900/80 sm:mt-12 sm:p-9">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
          <MessageSquareText size={18} aria-hidden="true" />
          {c.eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-800 dark:text-slate-100 sm:text-3xl">{c.title}</h1>
        <p className="mt-4 text-base leading-7 text-text-primary">{c.introduction}</p>

        {loadState.status === 'loading' && <p className="mt-8" role="status">{c.loading}</p>}

        {(loadState.status === 'invalid-link' || loadState.status === 'unavailable') && (
          <section className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
            <h2 className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={20} aria-hidden="true" />
              {loadState.status === 'invalid-link' ? c.invalidTitle : c.unavailableTitle}
            </h2>
            <p className="mt-2 text-sm leading-6">
              {loadState.status === 'invalid-link' ? c.invalidText : c.unavailableText}
            </p>
            <Link to="/lernziel-feedback"
              state={isLearnerCockpitGoalFeedbackNavigationState(location.state) ? location.state : null}
              className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-amber-400 px-3 py-2 text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
              {c.generalFallback}
            </Link>
          </section>
        )}

        {(loadState.status === 'ready' || loadState.status === 'general') && (
          <>
            {binding && submitState.status !== 'submitted' && <fieldset className="mt-6">
              <legend className="text-sm font-semibold">{c.scope}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['goal', 'general'] as const).map((scope) => <button key={scope} type="button"
                  disabled={submitState.status === 'submitting'} aria-pressed={feedbackScope === scope}
                  onClick={() => { setScopeSelection({ search: location.search, scope }); setSubmitState({ status: 'idle' }) }}
                  className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${feedbackScope === scope ? 'border-violet-600 bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100' : 'border-border-color'}`}>
                  {scope === 'goal' ? c.goalScope : c.generalScope}
                </button>)}
              </div>
            </fieldset>}
            {loadState.status === 'ready' && feedbackScope === 'goal' && <section className="mt-7 rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/30" aria-labelledby="feedback-goal-title">
              <p className="text-xs text-text-secondary">{loadState.value.goal.breadcrumbs.join(' › ')}</p>
              <h2 id="feedback-goal-title" className="mt-1 text-xl font-semibold text-violet-950 dark:text-violet-100">
                {loadState.value.goal.title}
              </h2>
              <details className="mt-3">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">{c.goalDetails}</summary>
              {loadState.value.goal.visualization
                && failedVisualizationUrl !== loadState.value.goal.visualization.url && (
                <figure className="mt-4 overflow-hidden rounded-xl border border-violet-200 bg-white p-3 dark:border-violet-800 dark:bg-slate-950/60">
                  <img
                    src={loadState.value.goal.visualization.url}
                    alt={loadState.value.goal.visualization.altText}
                    loading="eager"
                    decoding="async"
                    onError={() => setFailedVisualizationUrl(loadState.value.goal.visualization?.url ?? null)}
                    className="mx-auto max-h-[32rem] w-full object-contain"
                  />
                  <figcaption className="mt-2 text-center text-xs text-text-secondary">
                    {loadState.value.goal.visualization.title}
                  </figcaption>
                </figure>
              )}
              {loadState.value.goal.visualization
                && failedVisualizationUrl === loadState.value.goal.visualization.url && (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-100" role="status">
                  {c.imageUnavailable}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-text-primary">{loadState.value.goal.description}</p>
              <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-[9rem_minmax(0,1fr)]">
                <dt className="font-semibold">{c.goalId}</dt>
                <dd><code className="break-all">{loadState.value.context.goalId}</code></dd>
                <dt className="font-semibold">{c.edition}</dt>
                <dd><code className="break-all">{loadState.value.context.bookEdition}</code></dd>
                <dt className="font-semibold">{c.page}</dt>
                <dd>{loadState.value.context.pageNumber}</dd>
              </dl>
              </details>
            </section>}

            {submitState.status === 'submitted' ? (
              <section className="mt-7 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-100" role="status">
                <h2 className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  {c.successTitle}
                </h2>
                <p className="mt-2 text-sm leading-6">{c.successText}</p>
                <p className="mt-3 text-xs"><span className="font-semibold">{c.receipt}:</span>{' '}
                  <code className="break-all">{submitState.feedbackId}</code>
                </p>
              </section>
            ) : (
              <form ref={formRef} onSubmit={(event) => { void submit(event) }} className="mt-7 space-y-5">
                <label className="block text-sm font-semibold text-text-primary">
                  {c.observation}
                  <span className="mt-1 block text-xs font-normal leading-5 text-text-secondary">{c.observationHint}</span>
                  <textarea name="observation" required minLength={1} maxLength={4000} rows={9}
                    className="mt-2 min-h-56 w-full resize-y rounded-lg border border-border-color bg-white px-3 py-3 text-base font-normal leading-7 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-slate-900" />
                </label>
                <p className="text-xs leading-5 text-text-secondary">{c.noPersonalData}</p>

                <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
                  <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>

                <details
                  id="feedback-datenschutz"
                  className="scroll-mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
                >
                  <summary className="min-h-6 cursor-pointer text-sm font-semibold">
                    {c.privacyDetailsSummary}
                  </summary>
                  <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700" aria-labelledby="feedback-privacy-title">
                    <h2 id="feedback-privacy-title" className="text-sm font-semibold">{c.privacyNoticeTitle}</h2>
                    <p className="mt-1 text-xs text-text-secondary">
                      {c.privacyNoticeDate} · {c.privacyNoticeVersion}: {GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION}
                    </p>
                    <p className="mt-3 text-sm leading-6">{c.privacyNoticeIntro}</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                      {c.privacyNoticeItems.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      <Link to="/privacy" className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300">
                        {c.privacyNoticePolicy}
                      </Link>
                      <a href="mailto:support@skillpilot.com" className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300">
                        {c.privacyNoticeContact}: support@skillpilot.com
                      </a>
                    </p>
                  </div>
                </details>

                <label className="flex items-start gap-3 text-sm leading-6 text-text-primary">
                  <input
                    type="checkbox"
                    name="privacyAcknowledged"
                    required
                    checked={acknowledgementsAreCurrent && acknowledgements.privacy}
                    onChange={(event) => setAcknowledgements((current) => {
                      const sameNotice = current.bindingSearch === acknowledgementKey && current.locale === locale
                      return {
                        bindingSearch: acknowledgementKey,
                        locale,
                        privacy: event.target.checked,
                        automated: sameNotice ? current.automated : false,
                      }
                    })}
                    className="mt-1 size-5 shrink-0"
                  />
                  <span>{c.privacyConsent}</span>
                </label>
                <label className="flex items-start gap-3 text-sm leading-6 text-text-primary">
                  <input
                    type="checkbox"
                    name="automatedProcessingAcknowledged"
                    required
                    checked={acknowledgementsAreCurrent && acknowledgements.automated}
                    onChange={(event) => setAcknowledgements((current) => {
                      const sameNotice = current.bindingSearch === acknowledgementKey && current.locale === locale
                      return {
                        bindingSearch: acknowledgementKey,
                        locale,
                        privacy: sameNotice ? current.privacy : false,
                        automated: event.target.checked,
                      }
                    })}
                    className="mt-1 size-5 shrink-0"
                  />
                  <span>{c.automated}</span>
                </label>

                {submitState.status === 'error' && (
                  <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/35 dark:text-red-100" role="alert">{c.submitError}</p>
                )}

                <button type="submit" disabled={submitState.status === 'submitting'} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-65">
                  <Send size={18} aria-hidden="true" />
                  {submitState.status === 'submitting' ? c.sending : c.send}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  )
}
