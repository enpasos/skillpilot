import { useEffect, useRef, useState } from 'react'
import { Bot, ExternalLink, KeyRound } from 'lucide-react'
import type { OpenAiMcpStartResponse } from '../coachVariants/openAiMcp/request'
import { useTranslation } from '../hooks/useTranslation'
import { buildChatGptDesktopLocalChatUrl, CHATGPT_DESKTOP_SETUP_GUIDE_PATH } from '../utils/chatGptDesktopBeta'

interface Props {
  onPrepare: () => Promise<OpenAiMcpStartResponse | null>
}

interface Handoff {
  learningSessionId: string
  prompt: string
  chatUrl: string
}

/**
 * Desktop beta start through the OpenAI adapter, independent of Claude. One
 * click creates the learning session and opens the local chat in ChatGPT
 * Desktop with the start message already in its draft.
 */
export function ChatGptDesktopStart({ onPrepare }: Props) {
  const copy = useTranslation().startPage.login.chatGptDesktop
  const [handoff, setHandoff] = useState<Handoff | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const inFlight = useRef(false)
  const promptField = useRef<HTMLTextAreaElement>(null)
  const chatLink = useRef<HTMLAnchorElement>(null)
  const openedSessionId = useRef('')

  async function start() {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setHandoff(null)
    setCopied(false)
    setFailed(false)
    try {
      const session = await onPrepare()
      setHandoff(session && {
        learningSessionId: session.learningSessionId,
        prompt: session.prompt,
        chatUrl: buildChatGptDesktopLocalChatUrl(session.prompt),
      })
    } catch {
      // Never put a session capability or backend response in logs or error copy.
      setFailed(true)
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  useEffect(() => {
    // The click that requested the session also opens the chat: follow the
    // app link once per session. The same link stays visible for a retry.
    if (!handoff || !chatLink.current || openedSessionId.current === handoff.learningSessionId) return
    openedSessionId.current = handoff.learningSessionId
    chatLink.current.click()
  }, [handoff])

  async function copyPrompt() {
    if (!handoff) return
    setCopied(false)
    try {
      await navigator.clipboard.writeText(handoff.prompt)
      setCopied(true)
    } catch {
      promptField.current?.focus()
      promptField.current?.select()
    }
  }

  // Same shape as the Claude start: one-time setup first, then the one primary action.
  return (
    <section data-testid="chatgpt-desktop-start" aria-label={copy.title}
      className="space-y-2.5 rounded-xl border border-sky-300 bg-sky-50/70 p-3 dark:border-sky-700 dark:bg-sky-950/20">
      <div>
        <ol aria-label={copy.setupTitle} className="space-y-2.5">
          <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <p className="min-w-0 flex-1 basis-56 text-xs leading-relaxed text-text-secondary">
              <span className="font-semibold text-text-primary">{copy.setupStepTitle}</span>
              {' '}
              {copy.setupStep}
            </p>
            <a href={CHATGPT_DESKTOP_SETUP_GUIDE_PATH} target="_blank" rel="noopener noreferrer"
              data-testid="chatgpt-desktop-setup-open"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-sky-400 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/40">
              <KeyRound size={14} />
              {copy.setupOpen}
            </a>
          </li>
          <li>
            <button type="button" data-testid="chatgpt-desktop-start-button" onClick={() => void start()} disabled={busy}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
              <Bot size={16} />
              {busy ? copy.starting : copy.start}
              <ExternalLink size={13} />
            </button>
          </li>
        </ol>

        <div aria-live="polite" className="space-y-2 [&:not(:empty)]:mt-2.5">
          {failed && <p role="alert" className="text-xs font-semibold text-amber-700 dark:text-amber-300">{copy.failed}</p>}
          {handoff && <div data-testid="chatgpt-desktop-handoff" className="space-y-2">
            <p role="status" className="text-xs font-semibold leading-relaxed text-sky-800 dark:text-sky-200">{copy.launched}</p>
            <a ref={chatLink} href={handoff.chatUrl} rel="noreferrer" data-testid="chatgpt-desktop-open-codex"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 underline hover:text-sky-600 dark:text-sky-300">
              {copy.openCodex}
              <ExternalLink size={12} />
            </a>
            {/* The app link can fail without any signal to this page, so the manual way stays one step away. */}
            <details data-testid="chatgpt-desktop-fallback" className="text-xs text-text-secondary">
              <summary className="cursor-pointer font-semibold text-text-primary">{copy.fallbackTitle}</summary>
              <p className="mt-2 leading-relaxed">{copy.fallbackHint}</p>
              <label className="mt-2 block text-text-primary">
                {copy.promptLabel}
                <textarea ref={promptField} readOnly value={handoff.prompt} rows={3}
                  className="mt-1 w-full rounded border border-border-color bg-white p-2 dark:bg-slate-950" />
              </label>
              <button type="button" onClick={() => void copyPrompt()}
                className="mt-2 min-h-10 rounded-full border border-border-color bg-white px-4 py-2 font-semibold text-text-primary dark:bg-slate-900">
                {copied ? copy.promptCopied : copy.copyPrompt}
              </button>
            </details>
          </div>}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-text-secondary">{copy.hint}</p>
    </section>
  )
}
