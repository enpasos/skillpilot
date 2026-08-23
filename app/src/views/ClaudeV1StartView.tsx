import React, { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  claudeV1StartCopy,
  getClaudeV1ReadyMessage,
} from '../coachVariants/claudeV1/copy'
import {
  copyClaudeStartPrompt,
  navigatePreparedClaudeWindow,
  prepareClaudeWindow,
} from '../coachVariants/claudeV1/handoff'
import {
  requestClaudeV1Start,
  type ClaudeV1StartResponse,
} from '../coachVariants/claudeV1/request'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { sanitizeSkillpilotId } from '../utils/skillpilotId'

const getBrowserSkillpilotId = () => (
  typeof window === 'undefined'
    ? ''
    : sanitizeSkillpilotId(window.localStorage.getItem('skillpilot_id'))
)

export const ClaudeV1StartView: React.FC = () => {
  const { language } = useLanguage()
  const selectedLanguage = language === 'en' ? 'en' : 'de'
  const copy = claudeV1StartCopy[selectedLanguage]
  const [skillpilotId] = useState(getBrowserSkillpilotId)
  const [launch, setLaunch] = useState<ClaudeV1StartResponse | null>(null)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [opened, setOpened] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleStart = async () => {
    if (!skillpilotId || starting) return

    const preparedWindow = prepareClaudeWindow()
    setStarting(true)
    setLaunch(null)
    setCopied(false)
    setOpened(false)
    setFailed(false)

    try {
      const nextLaunch = await requestClaudeV1Start({
        skillpilotId,
        language: selectedLanguage,
        client: 'web-start',
      })
      const promptCopied = await copyClaudeStartPrompt(nextLaunch.prompt)
      const claudeOpened = navigatePreparedClaudeWindow(preparedWindow, nextLaunch.webUrl)
      setLaunch(nextLaunch)
      setCopied(promptCopied)
      setOpened(claudeOpened)
    } catch {
      try {
        preparedWindow?.close?.()
      } catch {
        // The retry stays on this first-party page.
      }
      setFailed(true)
    } finally {
      setStarting(false)
    }
  }

  const handleCopy = async () => {
    if (!launch) return
    setCopied(await copyClaudeStartPrompt(launch.prompt))
  }

  const readyMessage = getClaudeV1ReadyMessage(selectedLanguage, copied, opened)

  const expiresAt = launch
    ? new Intl.DateTimeFormat(selectedLanguage === 'en' ? 'en' : 'de', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(launch.expiresAt))
    : ''

  return (
    <div className="min-h-screen bg-chat-bg px-4 py-6 text-text-primary transition-colors sm:px-6 lg:px-10">
      <main className="mx-auto w-full max-w-4xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4" aria-label={copy.back}>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
            {copy.back}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </nav>

        <PublicPageHeader
          align="left"
          icon={<MessageCircle size={38} className="text-sky-500" aria-hidden="true" />}
          title={copy.title}
          subtitle={copy.subtitle}
        />

        <section className="mt-8 grid gap-5 sm:grid-cols-2" aria-label={copy.privacyTitle}>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
            <ShieldCheck size={28} className="mb-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.privacyTitle}</h2>
            <p className="mt-2 leading-relaxed">{copy.privacyBody}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card-bg p-5">
            <Clock3 size={28} className="mb-3 text-sky-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.setupTitle}</h2>
            <p className="mt-2 leading-relaxed text-text-secondary">{copy.setupBody}</p>
            <Link
              to="/faq/coach-setup"
              className="mt-3 inline-flex items-center font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
            >
              {copy.setupLink}
              <ExternalLink size={16} className="ml-2" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-border bg-card-bg p-5 sm:p-7" aria-labelledby="claude-start-title">
          <h2 id="claude-start-title" className="text-xl font-semibold">{copy.startTitle}</h2>
          <p className="mt-2 leading-relaxed text-text-secondary">{copy.startBody}</p>

          {!skillpilotId ? (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              <h3 className="font-semibold">{copy.missingTitle}</h3>
              <p className="mt-1 leading-relaxed">{copy.missingBody}</p>
              <Link
                to="/"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {copy.missingAction}
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={starting}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {starting ? (
                <Loader2 size={20} className="mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <MessageCircle size={20} className="mr-2" aria-hidden="true" />
              )}
              {starting ? copy.starting : copy.start}
            </button>
          )}

          {failed && (
            <div role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-red-950 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100">
              <h3 className="font-semibold">{copy.errorTitle}</h3>
              <p className="mt-1">{copy.errorBody}</p>
            </div>
          )}

          {launch && (
            <div role="status" className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{copy.readyTitle}</h3>
                  <p className="mt-1 leading-relaxed">{readyMessage}</p>
                  <p className="mt-2 text-sm">{copy.expires} {expiresAt}.</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed">{copy.fallback}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-700 px-4 py-2 font-semibold transition-colors hover:bg-emerald-100 dark:border-emerald-300 dark:hover:bg-emerald-900/40"
                >
                  <Copy size={18} className="mr-2" aria-hidden="true" />
                  {copied ? copy.copied : copy.copyPrompt}
                </button>
                <a
                  href={launch.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
                >
                  <ExternalLink size={18} className="mr-2" aria-hidden="true" />
                  {copy.openClaude}
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
