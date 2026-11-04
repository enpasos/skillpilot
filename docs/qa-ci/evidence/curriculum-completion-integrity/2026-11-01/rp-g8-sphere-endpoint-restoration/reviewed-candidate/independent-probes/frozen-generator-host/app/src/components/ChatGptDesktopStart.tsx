import { useRef, useState } from 'react'
import type { OpenAiMcpStartResponse } from '../coachVariants/openAiMcp/request'
import { useTranslation } from '../hooks/useTranslation'
import { ChatGptDesktopSetupGuide } from './ChatGptDesktopSetupGuide'

interface Props {
  onPrepare: () => Promise<OpenAiMcpStartResponse | null>
}

/** Desktop beta handoff uses the OpenAI adapter independently of Claude. */
export function ChatGptDesktopStart({ onPrepare }: Props) {
  const copy = useTranslation().startPage.login.chatGptDesktop
  const [session, setSession] = useState<OpenAiMcpStartResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const inFlight = useRef(false)
  const promptField = useRef<HTMLTextAreaElement>(null)

  async function prepare() {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setSession(null)
    setCopied(false)
    setFailed(false)
    try {
      setSession(await onPrepare())
    } catch {
      // Never put a session capability or backend response in logs or error copy.
      setFailed(true)
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  async function copyPrompt() {
    if (!session) return
    setCopied(false)
    try {
      await navigator.clipboard.writeText(session.prompt)
      setCopied(true)
    } catch {
      promptField.current?.focus()
      promptField.current?.select()
    }
  }

  return (
    <section data-testid="chatgpt-desktop-start" aria-labelledby="chatgpt-desktop-start-title"
      className="space-y-3 rounded-xl border border-sky-300 bg-sky-50/70 p-3 text-sm dark:border-sky-700 dark:bg-sky-950/20">
      <div>
        <h3 id="chatgpt-desktop-start-title" className="font-semibold text-text-primary">{copy.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{copy.hint}</p>
      </div>
      <ChatGptDesktopSetupGuide />
      <p className="text-xs leading-relaxed text-text-secondary">{copy.installedHint}</p>
      <button type="button" onClick={() => void prepare()} disabled={busy}
        className="min-h-11 rounded-full bg-sky-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? copy.preparing : copy.prepare}
      </button>
      {failed && <p role="alert" className="text-xs text-amber-700 dark:text-amber-300">{copy.failed}</p>}
      {session && <div data-testid="chatgpt-desktop-handoff" className="space-y-2">
        <label className="block text-xs text-text-primary">
          {copy.promptLabel}
          <textarea ref={promptField} readOnly value={session.prompt} rows={5}
            className="mt-1 w-full rounded border border-border-color bg-transparent p-2" />
        </label>
        <button type="button" onClick={() => void copyPrompt()}
          className="min-h-11 rounded-full border border-sky-500 px-4 py-2 font-semibold text-text-primary">
          {copied ? copy.promptCopied : copy.copyPrompt}
        </button>
        <p role="status" className="text-xs leading-relaxed text-text-secondary">{copy.pasteHint}</p>
      </div>}
    </section>
  )
}
