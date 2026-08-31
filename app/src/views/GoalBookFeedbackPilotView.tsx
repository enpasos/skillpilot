import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  GOAL_BOOK_FEEDBACK_CATEGORIES,
  GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION,
  GOAL_BOOK_FEEDBACK_REVIEWER_ROLES,
  goalBookFeedbackContextUrl,
  parseGoalBookFeedbackLinkBinding,
  parseGoalBookFeedbackResolvedContext,
  parseGoalBookFeedbackSubmissionReceipt,
  type GoalBookFeedbackCategory,
  type GoalBookFeedbackResolvedContext,
  type GoalBookFeedbackReviewerRole,
} from '../utils/goalBookFeedback'
import {
  isLearnerCockpitGoalFeedbackNavigationState,
  learnerCockpitGoalFeedbackReturnPath,
} from '../utils/goalFeedbackReturnNavigation'
import { goalBookRoute } from '../utils/goalBookPublicationRegistry'

type LoadState =
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
    eyebrow: 'Lernziel-Feedback',
    title: 'Kritik strukturiert einreichen',
    introduction: 'Hier kannst du Hinweise zum Text, zur Einordnung oder zum Bild dieses Lernziels geben. Deine Rückmeldung bleibt genau mit diesem Lernziel und dieser Buchfassung verbunden.',
    loading: 'Die geprüfte Lernzielbindung wird geladen …',
    invalidTitle: 'Feedbacklink nicht gültig',
    invalidText: 'Die Lernziel-ID, Seite oder Buchfassung konnte nicht eindeutig geprüft werden. Bitte öffne den Feedbacklink erneut direkt beim gewünschten Lernziel.',
    unavailableTitle: 'Feedbackkanal nicht verfügbar',
    unavailableText: 'Die Lernzielbindung konnte derzeit nicht vom Server bestätigt werden. Es wurden keine Feedbackdaten übermittelt.',
    goalId: 'Lernziel-ID',
    edition: 'Buchausgabe',
    page: 'Seite',
    imageUnavailable: 'Das Lernzielbild konnte nicht geladen werden. Du kannst trotzdem Feedback dazu geben.',
    category: 'Art der Rückmeldung',
    categoryPlaceholder: 'Bitte auswählen',
    observation: 'Was ist dir konkret aufgefallen?',
    observationHint: 'Beschreibe möglichst genau, was am Inhalt, Text, Bild oder an der Einordnung nicht passt.',
    evidence: 'Woran machst du das fest? (optional)',
    evidenceHint: 'Zum Beispiel ein Gegenbeispiel, eine missverständliche Stelle oder eine beobachtete Folge.',
    improvement: 'Wie könnte es besser sein? (optional)',
    source: 'Quelle oder Fundstelle (optional)',
    sourceHint: 'Dokumenttitel, Link, Seite oder Abschnitt. Links werden nicht automatisch geöffnet.',
    role: 'Perspektive (optional)',
    rolePlaceholder: 'Keine Angabe',
    automated: 'Ich verstehe, dass die Prüfung technisch unterstützt werden kann. Über Änderungen entscheidet immer eine fachlich verantwortliche Person.',
    send: 'Feedback verbindlich absenden',
    sending: 'Feedback wird gespeichert …',
    submitError: 'Das Feedback konnte nicht gespeichert werden. Es bleibt im Formular erhalten; bitte versuche es später erneut.',
    successTitle: 'Feedback wurde gespeichert',
    successText: 'Vielen Dank. Deine Rückmeldung ist eingegangen und wird vor einer möglichen Änderung fachlich geprüft.',
    receipt: 'Feedback-ID',
    noPersonalData: 'Bitte beschreibe nur das Lernziel. Gib keine Namen, Lernenden-IDs, Chattexte oder andere personenbezogene oder vertrauliche Angaben ein.',
    privacyDetailsSummary: 'Datenschutzdetails anzeigen',
    privacyNoticeTitle: 'Datenschutz für Lernziel-Feedback',
    privacyNoticeDate: 'Stand: 31. August 2026',
    privacyNoticeVersion: 'Hinweisversion',
    privacyNoticeIntro: 'Verantwortlich ist die enpasos - Enterprise Patterns & Solutions GmbH. Wir verarbeiten deine freiwilligen Angaben ausschließlich, um das angezeigte Lernziel zu prüfen und gegebenenfalls zu verbessern.',
    privacyNoticeItems: [
      'Gespeichert werden die Formularangaben, die gewählte Perspektive, eine zufällige Feedback-ID sowie die Zuordnung zu Lernziel, Buchausgabe und Seite. Anhänge, SkillPilot-IDs und Chatverläufe werden nicht angefordert.',
      'Unbearbeitetes Feedback wird im laufenden Betrieb spätestens nach 31 Tagen gelöscht. Nach Beginn einer Prüfung wird es nur so lange aufbewahrt, wie es für die Prüfung und eine ausdrücklich beauftragte Verbesserung erforderlich ist.',
      'Bei der Prüfung können beauftragte technische Dienste und automatisierte Assistenz eingesetzt werden. Änderungen am Curriculum benötigen immer eine fachliche Freigabe.',
      'Du kannst deine Einwilligung jederzeit für die Zukunft widerrufen sowie Auskunft oder Löschung anfragen. Nenne möglichst die angezeigte Feedback-ID. Gesetzliche Pflichten bleiben unberührt. Bestehende technische Sicherungskopien werden durch eine Löschung aus aktiven Systemen nicht einzeln verändert.',
    ],
    privacyNoticePolicy: 'Allgemeine Datenschutzerklärung',
    privacyNoticeContact: 'Datenschutzkontakt',
    privacyConsent: 'Ich willige in die Verarbeitung meiner Angaben zur Prüfung und Verbesserung dieses Lernziels ein. Die Einwilligung ist freiwillig und kann für die Zukunft widerrufen werden.',
  },
  en: {
    backToGoalBook: 'Back to the learning goal book',
    backToCockpit: 'Back to the cockpit',
    eyebrow: 'Learning-goal feedback',
    title: 'Submit structured criticism',
    introduction: 'Use this form to comment on the text, placement, or image for this learning goal. Your feedback remains bound to this exact learning goal and book edition.',
    loading: 'Loading the verified learning-goal binding …',
    invalidTitle: 'Invalid feedback link',
    invalidText: 'The learning-goal ID, page, or book edition could not be verified unambiguously. Please reopen the feedback link directly from the intended learning goal.',
    unavailableTitle: 'Feedback channel unavailable',
    unavailableText: 'The server could not confirm the learning-goal binding. No feedback data was transmitted.',
    goalId: 'Learning-goal ID',
    edition: 'Book edition',
    page: 'Page',
    imageUnavailable: 'The learning-goal image could not be loaded. You can still provide feedback about it.',
    category: 'Type of feedback',
    categoryPlaceholder: 'Please select',
    observation: 'What exactly did you notice?',
    observationHint: 'Describe as precisely as possible what is incorrect in the content, wording, image, or placement.',
    evidence: 'What supports your concern? (optional)',
    evidenceHint: 'For example, a counterexample, an ambiguous passage, or an observed consequence.',
    improvement: 'How could it be improved? (optional)',
    source: 'Source or reference (optional)',
    sourceHint: 'Document title, link, page, or section. Links are not opened automatically.',
    role: 'Perspective (optional)',
    rolePlaceholder: 'No answer',
    automated: 'I understand that the review may be technically assisted. A qualified person always decides whether the curriculum is changed.',
    send: 'Submit feedback',
    sending: 'Saving feedback …',
    submitError: 'The feedback could not be saved. It remains in the form; please try again later.',
    successTitle: 'Feedback saved',
    successText: 'Thank you. Your feedback has been received and will be reviewed before any possible change.',
    receipt: 'Feedback ID',
    noPersonalData: 'Please describe only the learning goal. Do not enter names, learner IDs, chat content, or other personal or confidential information.',
    privacyDetailsSummary: 'Show privacy details',
    privacyNoticeTitle: 'Privacy for learning-goal feedback',
    privacyNoticeDate: 'Effective: August 31, 2026',
    privacyNoticeVersion: 'Notice version',
    privacyNoticeIntro: 'The controller is enpasos - Enterprise Patterns & Solutions GmbH. We process your voluntary information solely to review and, where appropriate, improve the displayed learning goal.',
    privacyNoticeItems: [
      'We store the form entries, the selected perspective, a random feedback ID, and the binding to the learning goal, book edition, and page. We do not request attachments, SkillPilot IDs, or chat transcripts.',
      'Unprocessed feedback is deleted during normal operation no later than 31 days after receipt. Once a review begins, it is retained only as long as needed for that review and any expressly commissioned improvement.',
      'Commissioned technical services and automated assistance may support the review. Changes to the curriculum always require qualified approval.',
      'You may withdraw consent for the future at any time and request access or deletion. Please include the displayed feedback ID where possible. Statutory obligations remain unaffected. Existing technical backups are not individually changed when data is deleted from active systems.',
    ],
    privacyNoticePolicy: 'General Privacy Policy',
    privacyNoticeContact: 'Privacy contact',
    privacyConsent: 'I consent to the processing of my information to review and improve this learning goal. Consent is voluntary and may be withdrawn for the future.',
  },
} as const

const categoryLabels: Record<GoalBookFeedbackCategory, { de: string; en: string }> = {
  factual_error: { de: 'Fachlicher oder sachlicher Fehler', en: 'Factual or subject-matter error' },
  wording_or_language: { de: 'Formulierung oder Sprache', en: 'Wording or language' },
  missing_or_overbroad_goal: { de: 'Lernziel fehlt oder ist zu breit', en: 'Missing or overly broad goal' },
  prerequisite_or_sequence: { de: 'Voraussetzung oder Reihenfolge', en: 'Prerequisite or sequence' },
  chapter_structure: { de: 'Kapitelzuordnung oder Gliederung', en: 'Chapter placement or structure' },
  scope_or_applicability: { de: 'Geltung, Stufe oder Kursprofil', en: 'Scope, stage, or course profile' },
  source_assignment: { de: 'Quellenzuordnung', en: 'Source assignment' },
  visualization_or_accessibility: { de: 'Darstellung oder Barrierefreiheit', en: 'Visualization or accessibility' },
  other: { de: 'Sonstiges', en: 'Other' },
}

const roleLabels: Record<GoalBookFeedbackReviewerRole, { de: string; en: string }> = {
  teacher: { de: 'Lehrkraft', en: 'Teacher' },
  learner: { de: 'Lernende Person', en: 'Learner' },
  parent: { de: 'Elternteil', en: 'Parent' },
  researcher: { de: 'Forschung', en: 'Researcher' },
  subject_expert: { de: 'Fachexpertise', en: 'Subject expert' },
  other: { de: 'Andere Perspektive', en: 'Other perspective' },
}

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
  const [loadState, setLoadState] = useState<LoadState>(() => (
    binding ? { status: 'loading' } : { status: 'invalid-link' }
  ))
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [failedVisualizationUrl, setFailedVisualizationUrl] = useState<string | null>(null)
  const [acknowledgements, setAcknowledgements] = useState({
    bindingSearch: location.search,
    locale,
    privacy: false,
    automated: false,
  })
  const formRef = useRef<HTMLFormElement>(null)
  const clientSubmissionRef = useRef<{ payloadIdentity: string; id: string } | null>(null)

  useEffect(() => {
    setAcknowledgements({
      bindingSearch: location.search,
      locale,
      privacy: false,
      automated: false,
    })
  }, [locale, location.search])

  useEffect(() => {
    clientSubmissionRef.current = null
    setSubmitState({ status: 'idle' })
    setFailedVisualizationUrl(null)
    if (!binding) {
      setLoadState({ status: 'invalid-link' })
      return
    }
    const controller = new AbortController()
    setLoadState({ status: 'loading' })
    void fetch(goalBookFeedbackContextUrl(binding), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
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
  }, [binding])

  const bookTarget = binding ? goalBookRoute(binding.bookId) : '/lernzielbuch'
  const cockpitTarget = binding && isLearnerCockpitGoalFeedbackNavigationState(location.state)
    ? learnerCockpitGoalFeedbackReturnPath(binding)
    : null
  const backTarget = cockpitTarget
    ? cockpitTarget
    : binding ? `${bookTarget}#goal-${binding.goalId}` : bookTarget
  const backLabel = cockpitTarget ? c.backToCockpit : c.backToGoalBook
  const acknowledgementsAreCurrent = acknowledgements.bindingSearch === location.search
    && acknowledgements.locale === locale

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loadState.status !== 'ready' || submitState.status === 'submitting') return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const category = data.get('category')
    const observation = optionalText(data.get('observation'))
    if (typeof category !== 'string'
      || !GOAL_BOOK_FEEDBACK_CATEGORIES.includes(category as GoalBookFeedbackCategory)
      || !observation) return
    const reviewerRoleCandidate = data.get('reviewerRole')
    const reviewerRole = typeof reviewerRoleCandidate === 'string'
      && GOAL_BOOK_FEEDBACK_REVIEWER_ROLES.includes(reviewerRoleCandidate as GoalBookFeedbackReviewerRole)
      ? reviewerRoleCandidate as GoalBookFeedbackReviewerRole
      : undefined
    const evidence = optionalText(data.get('evidence'))
    const proposedImprovement = optionalText(data.get('proposedImprovement'))
    const sourceReference = optionalText(data.get('sourceReference'))
    const website = optionalText(data.get('website')) ?? ''
    const content = {
      category: category as GoalBookFeedbackCategory,
      observation,
      ...(evidence ? { evidence } : {}),
      ...(proposedImprovement ? { proposedImprovement } : {}),
      ...(sourceReference ? { sourceReference } : {}),
      ...(reviewerRole ? { reviewerRole } : {}),
    }
    const payloadIdentity = JSON.stringify({
      context: loadState.value.context,
      website,
      content,
      privacyNoticeLocale: locale,
      privacyNoticeVersion: GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION,
    })
    if (clientSubmissionRef.current?.payloadIdentity !== payloadIdentity) {
      clientSubmissionRef.current = { payloadIdentity, id: crypto.randomUUID() }
    }
    const payload = createGoalBookFeedbackSubmission({
      context: loadState.value.context,
      clientSubmissionId: clientSubmissionRef.current.id,
      website,
      content,
      privacyNoticeLocale: locale,
    })
    setSubmitState({ status: 'submitting' })
    try {
      const response = await fetch(loadState.value.submissionEndpoint, {
        method: 'POST',
        credentials: 'omit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (response.status !== 202) throw new Error(`submit:${response.status}`)
      const receipt = parseGoalBookFeedbackSubmissionReceipt(await response.json())
      if (!receipt) throw new Error('submit:invalid-receipt')
      setSubmitState({ status: 'submitted', feedbackId: receipt.feedbackId })
    } catch (reason) {
      console.warn('[GoalBookFeedback] Submission failed', reason)
      setSubmitState({ status: 'error' })
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[name="category"]')?.focus())
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
        <h1 className="mt-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">{c.title}</h1>
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
          </section>
        )}

        {loadState.status === 'ready' && (
          <>
            <section className="mt-7 rounded-xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/30" aria-labelledby="feedback-goal-title">
              <p className="text-xs text-text-secondary">{loadState.value.goal.breadcrumbs.join(' › ')}</p>
              <h2 id="feedback-goal-title" className="mt-1 text-xl font-semibold text-violet-950 dark:text-violet-100">
                {loadState.value.goal.title}
              </h2>
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
            </section>

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
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-100">
                  {c.noPersonalData}
                </p>
                <label className="block text-sm font-semibold text-text-primary">
                  {c.category}
                  <select name="category" required defaultValue="" className="mt-1 min-h-11 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-text-primary dark:bg-slate-900">
                    <option value="" disabled>{c.categoryPlaceholder}</option>
                    {GOAL_BOOK_FEEDBACK_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{categoryLabels[category][locale]}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-text-primary">
                  {c.observation}
                  <span className="mt-1 block text-xs font-normal leading-5 text-text-secondary">{c.observationHint}</span>
                  <textarea name="observation" required minLength={1} maxLength={4000} rows={5} className="mt-2 w-full rounded-lg border border-border-color bg-white px-3 py-2 font-normal text-text-primary dark:bg-slate-900" />
                </label>

                <label className="block text-sm font-semibold text-text-primary">
                  {c.evidence}
                  <span className="mt-1 block text-xs font-normal leading-5 text-text-secondary">{c.evidenceHint}</span>
                  <textarea name="evidence" maxLength={4000} rows={3} className="mt-2 w-full rounded-lg border border-border-color bg-white px-3 py-2 font-normal text-text-primary dark:bg-slate-900" />
                </label>

                <label className="block text-sm font-semibold text-text-primary">
                  {c.improvement}
                  <textarea name="proposedImprovement" maxLength={4000} rows={3} className="mt-2 w-full rounded-lg border border-border-color bg-white px-3 py-2 font-normal text-text-primary dark:bg-slate-900" />
                </label>

                <label className="block text-sm font-semibold text-text-primary">
                  {c.source}
                  <span className="mt-1 block text-xs font-normal leading-5 text-text-secondary">{c.sourceHint}</span>
                  <textarea name="sourceReference" maxLength={4000} rows={2} className="mt-2 w-full rounded-lg border border-border-color bg-white px-3 py-2 font-normal text-text-primary dark:bg-slate-900" />
                </label>

                <label className="block text-sm font-semibold text-text-primary">
                  {c.role}
                  <select name="reviewerRole" defaultValue="" className="mt-1 min-h-11 w-full rounded-lg border border-border-color bg-white px-3 py-2 text-text-primary dark:bg-slate-900">
                    <option value="">{c.rolePlaceholder}</option>
                    {GOAL_BOOK_FEEDBACK_REVIEWER_ROLES.map((role) => (
                      <option key={role} value={role}>{roleLabels[role][locale]}</option>
                    ))}
                  </select>
                </label>

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
                      const sameNotice = current.bindingSearch === location.search && current.locale === locale
                      return {
                        bindingSearch: location.search,
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
                      const sameNotice = current.bindingSearch === location.search && current.locale === locale
                      return {
                        bindingSearch: location.search,
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
