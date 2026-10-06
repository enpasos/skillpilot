import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  GEMINI_CUSTOM_APP_HELP_URL,
  GEMINI_SKILL_DOWNLOAD_URL,
  GEMINI_SKILL_HELP_URL,
  getGeminiV1Copy,
} from '../coachVariants/geminiV1/copy'
import type { LabelLanguage } from '../utils/filterLabels'

const guideCopy = {
  de: {
    title: 'SkillPilot in Gemini · kontrollierter Betatest',
    status: 'Stand: 6. Oktober 2026. Im kontrollierten Gemini-Webtest mit einem persönlichen Google-Konto sind Skill-Import, Verbindung und Erneuerung, echte Lernwerkzeuge, gespeicherter Fortschritt und Fortsetzung in einem neuen Chat bestätigt. Der Test verwendete die englische Google-Oberfläche und einen US-Testzugang in einer separaten Testumgebung. Eine öffentliche Einrichtung für weitere Konten und der vollständige Produktionsbetrieb sind noch nicht bestätigt.',
    appTitle: 'Eigene Testverbindung einrichten',
    app: 'Es gibt noch kein öffentliches Beta-Onboarding. Für deinen eigenen Test müssen ein laufender SkillPilot-Gateway mit erreichbarer HTTPS-Serveradresse und eigene private OAuth-Clientdaten eingerichtet sein; ein Backend-Rollout allein genügt nicht. Erst mit dieser Testkonfiguration: Öffne in Gemini Web Settings → Connected Apps → Custom apps → Add a custom app. Trage die bereitgestellte Serveradresse ein und öffne Advanced features → Show more (im getesteten Dialog: Additional settings). Trage dort die eigene Client-ID und das eigene Client-Secret ein. Wähle Next und schließe Anmeldung und Freigabe ab. Unter „Save your custom app“ benenne die App „SkillPilot“ und bestätige abschließend Connect. Prüfe, dass die App in Custom apps erscheint. Teile die privaten Zugangsdaten nicht.',
    deploymentGuide: 'SkillPilot-Dokumentation: eigene Testumgebung einrichten',
    skillTitle: 'Coach-Skill importieren',
    skill: 'Lade die aktuelle ZIP herunter. Öffne in Gemini Web Settings → Skills → Upload skill → files, wähle die unveränderte ZIP und anschließend Save skill. Prüfe, dass „skillpilot-coach-v1“ in der Skill-Bibliothek steht. Der Download allein installiert nichts. Für einen aktualisierten Skill ist ein erneuter vollständiger Import nötig; automatische Updates sind nicht bestätigt.',
    startTitle: 'Persönliche Lernsession in SkillPilot vorbereiten',
    start: 'Kehre zu SkillPilot zurück, richte Lernprofil und persönlichen Lernplan ein und wähle „Lernen starten“ → „Gemini (Beta)“ → „Lernen mit Gemini vorbereiten“. Kopiere die dort erzeugte Startnachricht. Verwende die Gemini-Startoption; eine für Claude oder ChatGPT vorbereitete Nachricht wählt keine Gemini-Lernsession.',
    chatTitle: 'Skill und App im neuen Gemini-Chat auswählen',
    chat: 'Wähle mit „/“ den Skill „skillpilot-coach-v1“ und mit „@“ die verbundene App „SkillPilot“. Beide müssen ausgewählt sein. Falls die Werkzeuge im normalen Chat fehlen und dein Konto „Gemini Spark BETA“ beziehungsweise „Switch to Spark“ anbietet, wähle diesen Modus und Skill und App dort erneut aus. Füge danach die vollständige persönliche Startnachricht ein und sende sie. Die englische Gemini-Oberfläche legt nicht die Unterrichtssprache fest: SkillPilot bereitet deine Lernsession auf Deutsch oder Englisch vor.',
    saveTitle: 'Bestätigten Lernfortschritt prüfen',
    save: 'Wenn Gemini bei einer angebotenen Speicherung „Allow“ anzeigt, prüfe die Aktion und bestätige sie, wenn du sie ausführen möchtest. Nur eine erfolgreiche Werkzeugantwort bestätigt das Speichern. Dein dauerhafter Lernstand und deine dauerhafte Lern-ID bleiben bei SkillPilot; der Gemini-Link enthält keinen Sitzungsschlüssel.',
    connectionTitle: 'Verbindung erneuern und Lernen fortsetzen',
    connection: 'Die aktuelle Testverbindung muss nach spätestens einer Stunde oder einem Neustart der Testumgebung erneut verbunden werden. Das ist unabhängig von der Lernsession: Sie läuft nach 24 Stunden absolut ab; bereite spätestens nach 23 Stunden in SkillPilot eine neue vor. Für einen neuen Gemini-Chat wähle Skill und App erneut und sende die noch gültige Startnachricht. Gespeicherter Fortschritt bleibt erhalten.',
    retry: 'Gemini behauptet trotz Verbindung, dass die Lernwerkzeuge fehlen? Wähle „@SkillPilot“ ausdrücklich erneut aus und wiederhole den Start. Im berichteten Nutzertest funktionierte der Zugriff über „Gemini Spark BETA“; ein kontrollierter normaler Chat funktionierte ebenfalls. Welche Chat-Auswahl nötig ist, kann vom Freischaltungsstand deines Kontos abhängen. Kopiere keine Backend-Daten als Ersatz in den Chat.',
    limitsTitle: 'Was im Gemini-Test noch offen ist',
    limits: 'Die Anzeige von Lernzielbildern direkt im Gemini-Chat ist noch ungelöst. Im berichteten Spark-Test fehlte das Bild trotz erfolgreicher Werkzeugantwort. Mobile Gemini-App, Voice, weitere Google-Konten sowie vollständige Kartenübungen, Verified Recall und Prüfungen sind im tatsächlichen Gemini-Host noch nicht bestätigt. Ergebnisse mit Claude oder ChatGPT ersetzen diese Prüfung nicht.',
    privacy: 'Die Startnachricht enthält einen privaten Sitzungsschlüssel. Teile sie, den Lernchat und die privaten Verbindungsdaten nicht mit anderen.',
    returnToStart: 'Gemini in SkillPilot wählen',
  },
  en: {
    title: 'SkillPilot in Gemini · controlled beta',
    status: 'Status: October 6, 2026. A controlled Gemini web test with one personal Google account confirmed Skill import, connection and renewal, real learning tools, saved progress and continuation in a new chat. The test used the English Google interface and a US test connection in a separate test environment. Public setup for additional accounts and full production operation are not yet confirmed.',
    appTitle: 'Set up your own test connection',
    app: 'There is no public beta onboarding yet. Your own test requires a running SkillPilot gateway with a reachable HTTPS server address and your own private OAuth client details; deploying the backend alone is insufficient. Only with this test configuration: open Settings → Connected Apps → Custom apps → Add a custom app in Gemini Web. Enter the supplied server address and open Advanced features → Show more (Additional settings in the tested dialog). Enter your own client ID and client secret there. Select Next and complete sign-in and approval. Under “Save your custom app”, name the app “SkillPilot” and select Connect to finish. Check that the app appears in Custom apps. Keep the credentials private.',
    deploymentGuide: 'SkillPilot documentation: set up your own test environment',
    skillTitle: 'Import the coaching Skill',
    skill: 'Download the current ZIP. In Gemini Web, open Settings → Skills → Upload skill → files, select the unchanged ZIP and then Save skill. Check that “skillpilot-coach-v1” appears in the Skill library. Downloading does not install it. An updated Skill requires a complete re-import; automatic updates are not confirmed.',
    startTitle: 'Prepare your personal learning session in SkillPilot',
    start: 'Return to SkillPilot, set up your learning profile and personal curriculum, then select “Start Learning” → “Gemini (Beta)” → “Prepare learning with Gemini”. Copy the generated start message. Use the Gemini start option; a message prepared for Claude or ChatGPT does not select a Gemini learning session.',
    chatTitle: 'Select both the Skill and app in a new Gemini chat',
    chat: 'Use “/” to select “skillpilot-coach-v1” and “@” to select the connected “SkillPilot” app. Both must be selected. If the tools are unavailable in normal chat and your account offers “Gemini Spark BETA” or “Switch to Spark”, select that mode and select the Skill and app there again. Then paste and send the complete personal start message. The English Gemini interface does not determine the coaching language: SkillPilot prepares your learning session in German or English.',
    saveTitle: 'Check confirmed learning progress',
    save: 'If Gemini shows “Allow” for an offered save, review the action and approve it if you want it performed. Only a successful tool response confirms saving. Your permanent progress and permanent learner ID stay with SkillPilot; the Gemini link contains no session key.',
    connectionTitle: 'Reconnect and continue learning',
    connection: 'The current test connection requires reconnecting after at most one hour or a restart of the test environment. This is separate from your learning session: it expires absolutely after 24 hours; prepare a new one in SkillPilot after at most 23 hours. In a new Gemini chat, select the Skill and app again and send the still-valid start message. Saved progress is retained.',
    retry: 'Gemini says it cannot access the learning tools despite being connected? Explicitly select “@SkillPilot” again and repeat the start. The reported user test accessed the tools through “Gemini Spark BETA”; a controlled normal chat also worked. The required chat selection may depend on the rollout to your account. Do not paste backend data into chat as a substitute.',
    limitsTitle: 'What remains unconfirmed in the Gemini test',
    limits: 'Displaying goal images directly in the Gemini chat remains unresolved. The reported Spark test lacked the image despite a successful tool response. The mobile Gemini app, voice, additional Google accounts, and full card practice, Verified Recall and exams are not yet confirmed in the actual Gemini host. Claude or ChatGPT results do not replace these checks.',
    privacy: 'The start message contains a private session key. Do not share it, your learning chat or private connection details with other people.',
    returnToStart: 'Select Gemini in SkillPilot',
  },
} as const

export function GeminiSetupGuide({ language }: { language: LabelLanguage }) {
  const copy = guideCopy[language]
  const sharedCopy = getGeminiV1Copy(language)
  const steps = [
    { title: copy.appTitle, body: copy.app },
    { title: copy.skillTitle, body: copy.skill },
    { title: copy.startTitle, body: copy.start },
    { title: copy.chatTitle, body: copy.chat },
    { title: copy.saveTitle, body: copy.save },
  ]

  return (
    <article id="gemini" data-testid="gemini-plugin-guide" aria-labelledby="gemini-plugin-title"
      className="mt-8 scroll-mt-6 space-y-5 rounded-3xl border border-teal-300 bg-teal-50/70 p-5 dark:border-teal-800 dark:bg-teal-950/25 sm:p-6">
      <h2 id="gemini-plugin-title" className="text-xl font-semibold">{copy.title}</h2>
      <p className="text-sm leading-relaxed text-text-secondary">{copy.status}</p>
      <p className="text-sm leading-relaxed text-text-secondary">{sharedCopy.access}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {[
          { label: sharedCopy.appHelp, href: GEMINI_CUSTOM_APP_HELP_URL },
          { label: sharedCopy.skillHelp, href: GEMINI_SKILL_HELP_URL },
        ].map(link => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-teal-800 underline dark:text-teal-300">
            {link.label}<ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-teal-200 bg-white p-4 dark:border-teal-900 dark:bg-slate-900/70">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.body}</p>
                {index === 0 && (
                  <a href="https://github.com/enpasos/skillpilot/blob/main/docs/deploy/gemini-integration.md" target="_blank" rel="noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-teal-800 underline dark:text-teal-300">
                    {copy.deploymentGuide}<ExternalLink size={14} className="shrink-0" aria-hidden="true" />
                  </a>
                )}
                {index === 1 && (
                  <a href={GEMINI_SKILL_DOWNLOAD_URL} download
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">
                    <Download size={18} className="shrink-0" aria-hidden="true" />{sharedCopy.download}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <section aria-labelledby="gemini-connection-title">
        <h3 id="gemini-connection-title" className="font-semibold">{copy.connectionTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy.connection}</p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy.retry}</p>
      </section>
      <aside className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <h3 className="font-semibold">{copy.limitsTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy.limits}</p>
        <p className="mt-2 text-sm font-medium leading-relaxed">{copy.privacy}</p>
      </aside>
      <Link to="/?coach=gemini" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
        <ArrowLeft size={16} aria-hidden="true" />{copy.returnToStart}
      </Link>
    </article>
  )
}
