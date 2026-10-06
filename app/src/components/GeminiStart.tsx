import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
  getGeminiV1Copy,
  GEMINI_CUSTOM_APP_HELP_URL,
  GEMINI_SKILL_DOWNLOAD_URL,
  GEMINI_SKILL_HELP_URL,
} from '../coachVariants/geminiV1/copy'
import type { GeminiV1StartResponse } from '../coachVariants/geminiV1/request'

interface Props {
  onPrepare: () => Promise<GeminiV1StartResponse | null>
}

export function GeminiStart({ onPrepare }: Props) {
  const { language } = useLanguage()
  const copy = getGeminiV1Copy(language)
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<GeminiV1StartResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const inFlight = useRef(false)
  const mounted = useRef(false)
  const promptField = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  async function prepare() {
    if (!ready || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setSession(null)
    setCopied(false)
    setFailed(false)
    try {
      const result = await onPrepare()
      if (mounted.current) setSession(result)
    } catch {
      if (mounted.current) setFailed(true)
    } finally {
      inFlight.current = false
      if (mounted.current) setBusy(false)
    }
  }

  async function copyPrompt() {
    if (!session) return
    setCopied(false)
    try {
      await navigator.clipboard.writeText(session.prompt)
      if (mounted.current) setCopied(true)
    } catch {
      promptField.current?.focus()
      promptField.current?.select()
    }
  }

  return (
    <section data-testid="gemini-start" aria-labelledby="gemini-start-title"
      className="space-y-3 rounded-xl border border-sky-300 bg-sky-50/70 p-3 text-sm dark:border-sky-700 dark:bg-sky-950/20">
      <h3 id="gemini-start-title" className="font-semibold text-text-primary">{copy.title}</h3>
      <p className="text-xs leading-relaxed text-text-secondary">{copy.hint}</p>
      <details data-testid="gemini-setup-guide" className="rounded-lg border border-border-color bg-white/70 p-3 dark:bg-slate-950/35">
        <summary className="cursor-pointer text-xs font-semibold text-text-primary">{copy.setupTitle}</summary>
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">{copy.access}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-text-secondary">
          <li>{copy.appSetup}</li>
          <li><a href={GEMINI_SKILL_DOWNLOAD_URL} download className="font-semibold underline">{copy.download}</a></li>
          <li>{copy.skillSetup}</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <a href="/plugins#gemini" className="underline">{copy.setupGuide}</a>
          <a href={GEMINI_CUSTOM_APP_HELP_URL} target="_blank" rel="noopener noreferrer" className="underline">{copy.appHelp}</a>
          <a href={GEMINI_SKILL_HELP_URL} target="_blank" rel="noopener noreferrer" className="underline">{copy.skillHelp}</a>
        </div>
      </details>
      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
        <input type="checkbox" checked={ready} disabled={busy} onChange={event => {
          setReady(event.currentTarget.checked)
          setSession(null)
          setCopied(false)
        }} className="mt-0.5" />
        {copy.ready}
      </label>
      <button type="button" onClick={() => void prepare()} disabled={!ready || busy}
        className="min-h-11 rounded-full bg-sky-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? copy.preparing : copy.prepare}
      </button>
      {failed && <p role="alert" className="text-xs text-amber-700 dark:text-amber-300">{copy.failed}</p>}
      {session && <div data-testid="gemini-handoff" className="space-y-2">
        <label className="block text-xs text-text-primary">{copy.promptLabel}
          <textarea ref={promptField} readOnly value={session.prompt} rows={5}
            className="mt-1 w-full rounded border border-border-color bg-transparent p-2" />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void copyPrompt()}
            className="min-h-11 rounded-full border border-sky-500 px-4 py-2 font-semibold text-text-primary">
            {copied ? copy.copied : copy.copy}
          </button>
          <a href={session.webUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-sky-500 px-4 py-2 font-semibold text-text-primary">{copy.open}</a>
        </div>
        <p role="status" className="text-xs leading-relaxed text-text-secondary">{copy.paste}</p>
        <p className="text-xs leading-relaxed text-text-secondary">{copy.continuation}</p>
      </div>}
    </section>
  )
}
