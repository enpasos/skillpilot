import React from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

const UNIFIED_WEB_START_URL = '/?coach=claude'

/**
 * Backward-compatible public alias for the provider-neutral SkillPilot start.
 *
 * A full navigation is intentional: the shared root start owns selection and
 * confirmation of the SkillPilot ID, curriculum and Personal Curriculum. The
 * Claude route must never create a learner session from browser storage on its
 * own.
 */
export const ClaudeV1StartView: React.FC = () => {
  React.useEffect(() => {
    window.location.replace(UNIFIED_WEB_START_URL)
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-chat-bg px-4 text-text-primary">
      <div className="max-w-lg rounded-2xl border border-border bg-card-bg p-6 text-center shadow-sm">
        <Loader2 size={28} className="mx-auto animate-spin text-sky-500" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold">SkillPilot-Start wird geöffnet</h1>
        <p className="mt-2 leading-relaxed text-text-secondary">
          Wähle dort deine SkillPilot-ID, deine Personalisierung und den gewünschten Lerncoach.
        </p>
        <a
          href={UNIFIED_WEB_START_URL}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-sky-500"
        >
          Weiter zum Lernen starten
          <ArrowRight size={18} className="ml-2" aria-hidden="true" />
        </a>
      </div>
    </main>
  )
}
