import { useRef, useState } from 'react'
import type { OpenAiMcpStartResponse } from '../coachVariants/openAiMcp/request'

interface Props {
  language: string
  onPrepare: () => Promise<OpenAiMcpStartResponse | null>
}

/** Explicit integration-test handoff; the public provider availability is separate. */
export function ChatGptTestStart({ language, onPrepare }: Props) {
  const english = language.startsWith('en')
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

  async function copy() {
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
    <section data-testid="chatgpt-test-start" className="rounded-lg border border-sky-400 p-3 text-sm">
      <h3 className="font-semibold">{english ? 'ChatGPT integration test' : 'ChatGPT ausprobieren'}</h3>
      <p className="mt-1 text-text-secondary">
        {english
          ? 'Connect the installed SkillPilot plugin in the ChatGPT desktop app. Then prepare a fresh learning session here and paste its start message into a new chat with the plugin selected.'
          : 'Verbinde das installierte SkillPilot-Plugin in der ChatGPT-Desktop-App. Erzeuge dann hier eine frische Lernsession und füge ihre Startnachricht in einen neuen Chat mit ausgewähltem Plugin ein.'}
      </p>
      <button type="button" onClick={() => void prepare()} disabled={busy}
        className="mt-3 min-h-11 rounded-full bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? (english ? 'Preparing …' : 'Wird vorbereitet …')
          : (english ? 'Prepare start message' : 'Startnachricht erzeugen')}
      </button>
      {failed && <p role="alert" className="mt-2 text-amber-700 dark:text-amber-300">
        {english ? 'The learning session could not be prepared. Please try again.'
          : 'Die Lernsession konnte nicht vorbereitet werden. Bitte versuche es erneut.'}
      </p>}
      {session && <div className="mt-3">
        <label className="block">
          {english ? 'Prepared start message' : 'Vorbereitete Startnachricht'}
          <textarea ref={promptField} readOnly value={session.prompt} rows={5}
            className="mt-1 w-full rounded border border-border-color bg-transparent p-2" />
        </label>
        <button type="button" onClick={() => void copy()} className="mt-2 min-h-11 rounded-full border border-sky-500 px-4 py-2">
          {copied ? (english ? 'Copied' : 'Kopiert') : (english ? 'Copy start message' : 'Startnachricht kopieren')}
        </button>
      </div>}
    </section>
  )
}
