import { normalizeVisibleSessionLanguage } from './config'

export interface VisibleSessionLaunchCopy {
  startPromptLabel: string
  startPromptHint: string
  copyPrompt: string
  promptCopied: string
  preparationFailed: string
  sharedStateSummary: string
  sessionDetail: string
}

const COPY: Record<'de' | 'en', VisibleSessionLaunchCopy> = {
  de: {
    startPromptLabel: 'Sichtbare 24-Stunden-Chat-Sitzung',
    startPromptHint: 'SkillPilot bereitet eine Nachricht mit einem temporären, 24 Stunden gültigen Sitzungstoken vor. Der Token ist in der Chat-Nachricht sichtbar; du musst sie dort nur abschicken.',
    copyPrompt: 'Sitzungsnachricht kopieren',
    promptCopied: 'Sitzungsnachricht kopiert.',
    preparationFailed: 'Die 24-Stunden-Chat-Sitzung konnte gerade nicht vorbereitet werden. Bitte versuche es erneut.',
    sharedStateSummary: 'Cockpit und Chat nutzen denselben anonymen Lernstand. ChatGPT erhält dafür einen in der Startnachricht sichtbaren, temporären Sitzungstoken, der nach 24 Stunden abläuft.',
    sessionDetail: 'Deine SkillPilot-ID bleibt im Browser. SkillPilot erzeugt eine sichtbare Chat-Sitzung mit einem temporären Sitzungstoken; der Token wird in der vorbereiteten Nachricht angezeigt und läuft nach 24 Stunden ab.',
  },
  en: {
    startPromptLabel: 'Visible 24-hour chat session',
    startPromptHint: 'SkillPilot prepares a message containing a temporary session token that is valid for 24 hours. The token is visible in the chat message; you only need to send it there.',
    copyPrompt: 'Copy session message',
    promptCopied: 'Session message copied.',
    preparationFailed: 'The 24-hour chat session could not be prepared. Please try again.',
    sharedStateSummary: 'The cockpit and chat use the same anonymous learning state. ChatGPT receives a temporary session token that is visible in the start message and expires after 24 hours.',
    sessionDetail: 'Your SkillPilot ID stays in the browser. SkillPilot creates a visible chat session with a temporary session token; the token appears in the prepared message and expires after 24 hours.',
  },
}

export const getVisibleSessionLaunchCopy = (language?: string): VisibleSessionLaunchCopy =>
  COPY[normalizeVisibleSessionLanguage(language)]
