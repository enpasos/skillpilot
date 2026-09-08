import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  Download,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Store,
  Volume2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'
import {
  CLAUDE_CONNECTOR_PRIVACY_URL,
  CLAUDE_PLUGIN_BETA_REQUIREMENTS,
  CLAUDE_PLUGIN_PUBLICATION_INDEX_URL,
  loadClaudePluginPublicationIndex,
  type ClaudePluginPublicationIndex,
} from '../utils/claudePluginPublication'

const copy = {
  de: {
    back: 'Zurück zur Startseite',
    title: 'SkillPilot-Plugins',
    subtitle: 'Plugin herunterladen und in Claude hochladen: Einrichtung der SkillPilot-Claude-1.1.1-Beta mit Claude Pro.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: 'Claude-Beta 1.1.1',
    betaDescription: 'Die planorientierte Version 1.1.1 ersetzt die bisherige Claude-Variante vollständig. Nutze derzeit die Plugin-Datei zum Herunterladen und Hochladen in Claude. Die Marketplace-Einrichtung und ihre Updates funktionieren noch nicht zuverlässig.',
    loading: 'Aktuelle Plugin-Version wird geladen …',
    loadErrorTitle: 'Die aktuelle Plugin-Datei konnte nicht geladen werden.',
    loadErrorText: 'Bitte versuche es später erneut. Ohne gültigen Veröffentlichungsindex bieten wir aus Sicherheitsgründen weder eine ältere Datei noch einen anderen Installationsweg an.',
    retry: 'Erneut versuchen',
    emptyTitle: 'Derzeit steht keine aktuelle 1.1.1-Plugin-Datei bereit.',
    emptyText: 'Eine ältere Claude-Variante wird nicht als Ersatz angeboten.',
    guideTitle: 'Einrichtung mit Plugin-Datei',
    guideIntro: 'Diese fünf Schritte führen dich durch die Installation. Lass deinen ursprünglichen SkillPilot-Tab geöffnet. Lade zuerst die aktuelle Datei herunter, bevor du eine alte Installation entfernst.',
    stepOpenTitle: 'Plugin-Liste öffnen',
    stepOpenBody: 'Öffne Claude Web, nachdem die aktuelle Plugin-Datei heruntergeladen ist:',
    stepOpenActions: [
      'Öffne „Anpassen“ (Customize) → „Plugins“ und deine installierten Plugins.',
      'Wenn bereits „SkillPilot Coach v1“ in Version 1.1.1 installiert und aktiviert ist, prüfe direkt seinen Konnektor in Schritt 4.',
      'Wenn eine ältere SkillPilot-Version installiert ist, entferne nur diese SkillPilot-Coach-Installation – auch wenn sie aus dem Marketplace stammt. Andere Plugins und Konnektoren bleiben unverändert.',
    ],
    stepOpenCheck: 'Installiere SkillPilot nur einmal. Für eine neue Einrichtung muss nichts entfernt werden.',
    stepInstallTitle: 'Plugin-Datei hochladen und Version prüfen',
    stepInstallBody: 'Wähle in der Plugin-Verwaltung die Option zum Hochladen einer Plugin-Datei:',
    stepInstallActions: [
      'Klicke auf „Hinzufügen“ und wähle den Datei-Upload. Lade die zuvor heruntergeladene .plugin-Datei unverändert hoch.',
      'Aktiviere „SkillPilot Coach v1“, falls Claude einen Schalter dafür anzeigt.',
    ],
    stepInstallCheck: 'Fahre erst fort, wenn „SkillPilot Coach v1“ genau einmal unter „Deine Plugins“ erscheint und dort Version 1.1.1 angezeigt wird. Solange eine ältere Version angezeigt wird, ist die Aktualisierung nicht bestätigt.',
    stepConnectorTitle: 'Enthaltenen SkillPilot-Konnektor verbinden',
    stepConnectorBody: 'Prüfe anschließend den im Plugin enthaltenen Konnektor:',
    stepConnectorActions: [
      'Öffne „SkillPilot Coach v1“ und darin den Tab „Konnektoren“ (Connectors).',
      'Wähle den enthaltenen Konnektor „skillpilot“. Steht dort bereits „Verbunden“, ist nichts weiter nötig.',
      'Andernfalls klicke auf „Verbinden“ (Connect) und schließe Anmeldung und Freigabe ab.',
    ],
    stepConnectorCheck: 'Verwende ausschließlich den im Plugin enthaltenen SkillPilot-Konnektor. Füge keinen zweiten manuellen SkillPilot-Konnektor hinzu und trage keine MCP-URL ein.',
    openClaudeWeb: 'Claude Web öffnen',
    stepReturnTitle: 'Zu SkillPilot zurückkehren',
    stepReturnBody: 'Erst wenn beim installierten Plugin Version 1.1.1 angezeigt wird und sein enthaltener SkillPilot-Konnektor verbunden ist, wechsle zurück zum ursprünglichen SkillPilot-Tab. Prüfe dort dein Lernprofil und Curriculum und wähle anschließend „Mit Claude starten“. Beginne auch spätere neue Lernsessions immer auf SkillPilot.com.',
    returnToSkillPilot: 'Zurück zu SkillPilot',
    updateTitle: 'Bereits installiert? Version vergleichen',
    updateBody: 'Prüfe in Claude die Version von „SkillPilot Coach v1“. Wird 1.1.1 angezeigt, ist kein erneuter Upload nötig. Bei einer älteren Version verwende die folgenden Download- und Upload-Schritte. Das erneute Hinzufügen des Marketplace bestätigt kein Update.',
    technicalDetails: 'Version und Integritätsdaten',
    status: 'Status',
    betaStatus: 'Beta',
    version: 'Version',
    preparedAt: 'Stand',
    fileSize: 'Dateigröße',
    checksum: 'SHA-256',
    download: 'Plugin-Datei herunterladen',
    requirementsTitle: 'Voraussetzungen und Teststatus',
    supportedPlan: 'Unterstützter Beta-Tarif',
    installationSurface: 'Installation',
    age: (minimumAge: number) => `Nur für Personen ab ${minimumAge} Jahren.`,
    plan: 'Claude Pro ist der für den 1.1.1-Betatest vorgesehene und technisch unterstützte Pfad.',
    planDetail: 'Anthropic bietet Plugins auch in weiteren bezahlten Tarifen an. Die kandidatengenaue Abnahme von SkillPilot 1.1.1 mit Claude Pro steht noch aus.',
    install: 'Einrichtung und derzeitige Updates in Claude Web: aktuelle Plugin-Datei herunterladen → bei Bedarf nur die alte SkillPilot-Installation entfernen → Datei hochladen → Version 1.1.1 prüfen → enthaltenen Konnektor verbinden.',
    connectAndStart: 'Erst wenn „SkillPilot Coach v1“ in Version 1.1.1 angezeigt wird und sein enthaltener SkillPilot-Konnektor verbunden ist, ist die Einrichtung abgeschlossen. Jede Lernsession startest du anschließend wieder auf SkillPilot.com.',
    android: 'Claude für Android ist als anschließender Nutzungspfad mit demselben Claude-Konto vorgesehen. Die kandidatengenaue Abnahme von Version 1.1.1 auf Android steht noch aus.',
    voiceTested: 'Der Voice Mode ist für Version 1.1.1 kandidatengenau bestätigt. Interaktive UI-Komponenten werden darin nicht durchgängig garantiert. Das ist keine Funktionsgarantie von Anthropic.',
    voiceUntested: 'Die kandidatengenaue Abnahme des Voice Mode für Version 1.1.1 steht noch aus.',
    independentTitle: 'Unabhängiger Beta-Kandidat',
    independentText: 'Dieses Plugin wird von SkillPilot bereitgestellt. Es ist nicht offiziell von Anthropic verifiziert, gesponsert oder garantiert.',
    testedSurfaces: 'Kandidatengenau bestätigte Oberflächen',
    noTestedSurfaces: 'Für Version 1.1.1 noch ausstehend.',
    links: 'Dokumentation und Kontakt',
    source: 'Quellcode',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    support: 'Support',
    officialGuide: 'Offizielle Claude-Installationshilfe',
    adFree: 'Anthropic beschreibt Claude als werbefreien Raum. Anbieterbedingungen können sich ändern.',
    adFreeSource: 'Anthropic-Hinweis zu Werbung',
    publicationIndex: 'Maschinenlesbarer Veröffentlichungsindex',
    stepDownloadTitle: 'Aktuelle Plugin-Datei herunterladen',
    stepDownloadBody: 'Lade die hier bereitgestellte Version 1.1.1 herunter und behalte die Datei für den Upload in Claude. Der Download allein installiert das Plugin noch nicht.',
    versionCheckLimit: 'SkillPilot kann die in deinem Claude-Konto installierte Plugin-Version derzeit nicht automatisch auslesen. Maßgeblich ist die Versionsanzeige in Claude.',
  },
  en: {
    back: 'Back to the home page',
    title: 'SkillPilot plugins',
    subtitle: 'Download the plugin and upload it to Claude: setup for the SkillPilot Claude 1.1.1 beta with Claude Pro.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: 'Claude beta 1.1.1',
    betaDescription: 'The plan-first version 1.1.1 fully replaces the previous Claude variant. For now, download the plugin file and upload it to Claude. Marketplace setup and updates are not yet reliable.',
    loading: 'Loading the current plugin version …',
    loadErrorTitle: 'The current plugin file could not be loaded.',
    loadErrorText: 'Please try again later. Without a valid publication index, no older file or alternative installation route is offered for security reasons.',
    retry: 'Try again',
    emptyTitle: 'There is currently no current 1.1.1 plugin file available.',
    emptyText: 'An older Claude variant is not offered as a substitute.',
    guideTitle: 'Set up with the plugin file',
    guideIntro: 'These five steps guide you through installation. Keep your original SkillPilot tab open. Download the current file before removing an older installation.',
    stepOpenTitle: 'Open the plugin list',
    stepOpenBody: 'After downloading the current plugin file, open Claude Web:',
    stepOpenActions: [
      'Open Customize → Plugins and your installed plugins.',
      'If SkillPilot Coach v1 version 1.1.1 is already installed and enabled, go directly to its connector in step 4.',
      'If an older SkillPilot version is installed, remove only that SkillPilot Coach installation, including a marketplace installation. Leave other plugins and connectors unchanged.',
    ],
    stepOpenCheck: 'Install SkillPilot only once. There is nothing to remove for a new setup.',
    stepInstallTitle: 'Upload the plugin file and check the version',
    stepInstallBody: 'In plugin management, choose the option for uploading a plugin file:',
    stepInstallActions: [
      'Select Add, then choose the file upload. Upload the previously downloaded .plugin file without modifying it.',
      'Enable SkillPilot Coach v1 if Claude displays an enable switch.',
    ],
    stepInstallCheck: 'Continue only when SkillPilot Coach v1 appears exactly once under Your plugins and displays version 1.1.1. If an older version is still displayed, the update is not confirmed.',
    stepConnectorTitle: 'Connect the bundled SkillPilot connector',
    stepConnectorBody: 'Next, check the connector included in the plugin:',
    stepConnectorActions: [
      'Open SkillPilot Coach v1, then open its Connectors tab.',
      'Select the included skillpilot connector. If it already says Connected, no further action is needed.',
      'Otherwise select Connect and complete sign-in and approval.',
    ],
    stepConnectorCheck: 'Use only the SkillPilot connector bundled with the plugin. Do not add a second manual SkillPilot connector or enter an MCP URL.',
    openClaudeWeb: 'Open Claude Web',
    stepReturnTitle: 'Return to SkillPilot',
    stepReturnBody: 'Return to your original SkillPilot tab only after the installed plugin displays version 1.1.1 and its bundled SkillPilot connector is connected. Check your learning profile and curriculum, then select “Start with Claude.” Start every later new learning session at SkillPilot.com as well.',
    returnToSkillPilot: 'Return to SkillPilot',
    updateTitle: 'Already installed? Compare versions',
    updateBody: 'Check the SkillPilot Coach v1 version in Claude. If it shows 1.1.1, no new upload is needed. For an older version, follow the download and upload steps below. Adding the marketplace again does not confirm an update.',

    technicalDetails: 'Version and integrity details',
    status: 'Status',
    betaStatus: 'Beta',
    version: 'Version',
    preparedAt: 'Prepared',
    fileSize: 'File size',
    checksum: 'SHA-256',
    download: 'Download plugin file',
    requirementsTitle: 'Requirements and test status',
    supportedPlan: 'Supported beta plan',
    installationSurface: 'Installation',
    age: (minimumAge: number) => `Only for people aged ${minimumAge} or older.`,
    plan: 'Claude Pro is the intended and technically supported route for the 1.1.1 beta test.',
    planDetail: 'Anthropic also offers plugins on other paid plans. Exact-candidate acceptance of SkillPilot 1.1.1 with Claude Pro is still pending.',
    install: 'Setup and current updates in Claude Web: download the current plugin file → remove only the old SkillPilot installation if needed → upload the file → check version 1.1.1 → connect the bundled connector.',
    connectAndStart: 'Setup is complete only after SkillPilot Coach v1 displays version 1.1.1 and its bundled SkillPilot connector is connected. Start every learning session on SkillPilot.com afterwards.',
    android: 'Claude for Android is the intended subsequent-use route with the same Claude account. Exact-candidate acceptance of version 1.1.1 on Android is still pending.',
    voiceTested: 'Voice mode is confirmed for the exact 1.1.1 candidate. Interactive UI components are not guaranteed consistently there. This is not a functionality guarantee from Anthropic.',
    voiceUntested: 'Exact-candidate acceptance of voice mode for version 1.1.1 is still pending.',
    independentTitle: 'Independent beta candidate',
    independentText: 'This plugin is provided by SkillPilot. It is not officially verified, sponsored, or guaranteed by Anthropic.',
    testedSurfaces: 'Exact-candidate confirmed surfaces',
    noTestedSurfaces: 'Still pending for version 1.1.1.',
    links: 'Documentation and contact',
    source: 'Source code',
    privacy: 'Privacy',
    terms: 'Terms of use',
    support: 'Support',
    officialGuide: 'Official Claude installation guide',
    adFree: 'Anthropic describes Claude as an ad-free space. Provider terms may change.',
    adFreeSource: 'Anthropic statement on ads',
    publicationIndex: 'Machine-readable publication index',
    stepDownloadTitle: 'Download the current plugin file',
    stepDownloadBody: 'Download version 1.1.1 provided here and keep the file for uploading to Claude. Downloading alone does not install the plugin.',
    versionCheckLimit: 'SkillPilot cannot currently read the plugin version installed in your Claude account automatically. Check the version displayed in Claude.',
  },
} as const

type SupportedLanguage = keyof typeof copy

const formatBytes = (bytes: number, language: SupportedLanguage) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`
}

const formatPreparedAt = (preparedAt: string, language: SupportedLanguage) => (
  new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(preparedAt))
)

const surfaceLabels: Record<SupportedLanguage, Record<string, string>> = {
  de: {
    'claude-web': 'Claude Web',
    'claude-android': 'Claude für Android',
    'claude-desktop': 'Claude Desktop',
  },
  en: {
    'claude-web': 'Claude Web',
    'claude-android': 'Claude for Android',
    'claude-desktop': 'Claude Desktop',
  },
}

const formatSurface = (surface: string, language: SupportedLanguage) => (
  surfaceLabels[language][surface]
  ?? surface.replace(/[-_]+/gu, ' ').replace(/^\w/u, (letter) => letter.toUpperCase())
)

const formatPlan = (plan: string) => (
  plan === 'claude-pro'
    ? 'Claude Pro'
    : plan.replace(/[-_]+/gu, ' ').replace(/^\w/u, (letter) => letter.toUpperCase())
)

interface PublicationCardProps {
  publication: ClaudePluginPublicationIndex | null
  loadError: boolean
  onRetry: () => void
  language: SupportedLanguage
}

interface InstructionActionsProps {
  actions: readonly string[]
  testId: string
}

const InstructionActions: React.FC<InstructionActionsProps> = ({ actions, testId }) => (
  <ol
    data-testid={testId}
    className="mt-3 space-y-2 text-sm leading-relaxed text-text-secondary"
  >
    {actions.map((action, actionIndex) => (
      <li key={action} className="flex gap-2">
        <span className="font-semibold text-sky-800 dark:text-sky-300" aria-hidden="true">
          {actionIndex + 1}.
        </span>
        <span>{action}</span>
      </li>
    ))}
  </ol>
)

const InstallStep = ({ number, name, title, body, children }: {
  number: number
  name: string
  title: string
  body: string
  children: React.ReactNode
}) => (
  <li data-testid={`claude-plugin-install-step-${name}`} className="rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">{number}</span>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">{body}</p>
        {children}
      </div>
    </div>
  </li>
)

const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  loadError,
  onRetry,
  language,
}) => {
  const text = copy[language]
  const plugin = publication?.plugins[0]
  const requirements = plugin?.requirements ?? CLAUDE_PLUGIN_BETA_REQUIREMENTS
  const cardId = plugin?.id ?? 'skillpilot-coach-v1'
  const supportHref = `mailto:${plugin?.supportEmail ?? 'support@skillpilot.com'}`
  const externalLinks = [
    {
      label: text.officialGuide,
      href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude',
    },
    {
      label: text.source,
      href: plugin?.sourceUrl
        ?? 'https://github.com/enpasos/skillpilot/tree/main/ai/claude/plugin/skillpilot-coach-v1',
    },
    { label: text.privacy, href: plugin?.privacyUrl ?? CLAUDE_CONNECTOR_PRIVACY_URL },
    { label: text.terms, href: plugin?.termsUrl ?? 'https://skillpilot.com/legal' },
    { label: text.support, href: supportHref },
  ]

  return (
    <article className="overflow-hidden rounded-3xl border border-border-color bg-white/85 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
      <div className="border-b border-border-color bg-gradient-to-r from-sky-50 to-emerald-50 px-6 py-6 dark:from-sky-950/45 dark:to-emerald-950/35 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-200">
              {text.betaNotice}
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              {text.cardTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {text.betaDescription}
            </p>
          </div>
          <Store size={44} className="shrink-0 text-sky-700 dark:text-sky-300" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <aside data-testid="claude-plugin-update-guide" className="rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-950/30">
          <h3 className="font-semibold text-slate-900 dark:text-white">{text.updateTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.updateBody}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.versionCheckLimit}</p>
        </aside>

        <section data-testid="claude-plugin-direct-upload-guide" aria-labelledby={`${cardId}-install-guide`} className="rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25 sm:p-6">
          <h3 id={`${cardId}-install-guide`} className="text-xl font-semibold text-slate-900 dark:text-white">{text.guideTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.guideIntro}</p>
          <ol className="mt-5 space-y-4">
            <InstallStep number={1} name="download" title={text.stepDownloadTitle} body={text.stepDownloadBody}>
              {!publication && !loadError && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-color bg-white/70 p-4 text-sm text-text-secondary dark:bg-slate-900/50" role="status">
                  <CalendarClock className="animate-pulse" size={20} aria-hidden="true" />
                  {text.loading}
                </div>
              )}

              {loadError && (
                <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30" role="alert">
                  <p className="font-semibold text-red-900 dark:text-red-100">{text.loadErrorTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-red-900 dark:text-red-100">{text.loadErrorText}</p>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50 dark:focus-visible:ring-offset-red-950"
                  >
                    <RefreshCw size={18} aria-hidden="true" />
                    {text.retry}
                  </button>
                </div>
              )}

              {publication && !plugin && (
                <div className="mt-4 rounded-xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/50">
                  <p className="font-semibold text-slate-900 dark:text-white">{text.emptyTitle}</p>
                  <p className="mt-2 text-sm text-text-secondary">{text.emptyText}</p>
                </div>
              )}

              {plugin && publication && (
                <div className="mt-4 space-y-4">
                  <a
                    href={plugin.downloadUrl}
                    download={plugin.filename}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:bg-sky-600 dark:hover:bg-sky-500"
                  >
                    <Download size={18} aria-hidden="true" />
                    {text.download}
                  </a>
                  <details>
                    <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">{text.technicalDetails}</summary>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/70">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.status}</dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{plugin.status === 'beta' ? text.betaStatus : plugin.status}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/70">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.version}</dt>
                        <dd className="mt-1 font-mono font-semibold text-slate-900 dark:text-white">{plugin.version}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/70">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.preparedAt}</dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{formatPreparedAt(publication.preparedAt, language)}</dd>
                      </div>
                      <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/70">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.fileSize}</dt>
                        <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{formatBytes(plugin.bytes, language)}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.checksum}</p>
                    <code className="mt-2 block break-all rounded-xl border border-border-color bg-slate-950 px-4 py-3 text-xs leading-relaxed text-emerald-300 sm:text-sm">
                      {plugin.sha256}
                    </code>
                  </details>
                </div>
              )}
            </InstallStep>
            <InstallStep number={2} name="open" title={text.stepOpenTitle} body={text.stepOpenBody}>
              <InstructionActions actions={text.stepOpenActions} testId="claude-plugin-open-navigation" />
              <p className="mt-3 text-sm text-text-secondary">{text.stepOpenCheck}</p>
              <a href="https://claude.ai" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-800 dark:text-sky-200">
                {text.openClaudeWeb}<ExternalLink size={16} aria-hidden="true" />
              </a>
            </InstallStep>
            <InstallStep number={3} name="upload" title={text.stepInstallTitle} body={text.stepInstallBody}>
              <InstructionActions actions={text.stepInstallActions} testId="claude-plugin-upload-navigation" />
              <p className="mt-3 text-sm font-medium text-text-secondary">{text.stepInstallCheck}</p>
            </InstallStep>
            <InstallStep number={4} name="connector" title={text.stepConnectorTitle} body={text.stepConnectorBody}>
              <InstructionActions actions={text.stepConnectorActions} testId="claude-plugin-connector-navigation" />
              <p className="mt-3 text-sm font-medium text-text-secondary">{text.stepConnectorCheck}</p>
            </InstallStep>
            <InstallStep number={5} name="return" title={text.stepReturnTitle} body={text.stepReturnBody}>
              <Link to="/" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-800 dark:text-sky-200">
                <ArrowLeft size={16} aria-hidden="true" />{text.returnToSkillPilot}
              </Link>
            </InstallStep>
          </ol>
        </section>

        <section aria-labelledby={`${cardId}-requirements`}>
            <h3 id={`${cardId}-requirements`} className="text-xl font-semibold text-slate-900 dark:text-white">
              {text.requirementsTitle}
            </h3>
            <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            <li className="flex gap-3 rounded-2xl border border-border-color p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" size={22} aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{text.age(requirements.minimumAge)}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.supportedPlan}</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatPlan(requirements.plan)}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.plan}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">{text.planDetail}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {text.adFree}{' '}
                  <a
                    className="font-medium text-sky-800 underline dark:text-sky-300"
                    href="https://www.anthropic.com/news/claude-is-a-space-to-think"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {text.adFreeSource}
                  </a>
                </p>
              </div>
            </li>
            <li className="flex gap-3 rounded-2xl border border-border-color p-4">
              <Download className="mt-0.5 shrink-0 text-sky-700 dark:text-sky-400" size={22} aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.installationSurface}</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatSurface(requirements.installSurface, language)}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">{text.install}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">{text.connectAndStart}</p>
              </div>
            </li>
            <li className="flex gap-3 rounded-2xl border border-border-color p-4">
              <Smartphone className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-400" size={22} aria-hidden="true" />
              <div>
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">{text.android}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.testedSurfaces}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {requirements.testedSurfaces.length > 0
                    ? requirements.testedSurfaces.map((surface) => formatSurface(surface, language)).join(' · ')
                    : text.noTestedSurfaces}
                </p>
              </div>
            </li>
            <li className="flex gap-3 rounded-2xl border border-border-color p-4">
              <Volume2 className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" size={22} aria-hidden="true" />
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {requirements.voiceMode ? text.voiceTested : text.voiceUntested}
              </p>
            </li>
            </ul>
        </section>

        <aside className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <h3 className="font-semibold text-amber-950 dark:text-amber-100">{text.independentTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-950 dark:text-amber-100">{text.independentText}</p>
        </aside>

        <section aria-labelledby={`${cardId}-links`}>
          <h3 id={`${cardId}-links`} className="text-lg font-semibold text-slate-900 dark:text-white">{text.links}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-color px-3 py-2 text-sm font-medium text-sky-800 transition-colors hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/40"
              >
                {link.label}
                {!link.href.startsWith('mailto:') && <ExternalLink size={14} aria-hidden="true" />}
              </a>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}

export const PluginCatalogView: React.FC = () => {
  const { language } = useLanguage()
  const selectedLanguage: SupportedLanguage = language === 'en' ? 'en' : 'de'
  const text = copy[selectedLanguage]
  const [publication, setPublication] = useState<ClaudePluginPublicationIndex | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    loadClaudePluginPublicationIndex(controller.signal)
      .then(setPublication)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.error('Could not load Claude plugin publication index', error)
        setLoadError(true)
      })
    return () => controller.abort()
  }, [requestVersion])

  const retry = () => {
    setPublication(null)
    setLoadError(false)
    setRequestVersion((current) => current + 1)
  }

  return (
    <div className="min-h-screen bg-chat-bg px-4 py-6 text-text-primary transition-colors sm:px-6 lg:px-10">
      <main className="mx-auto w-full max-w-6xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4" aria-label={text.back}>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-chat-bg"
          >
            <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
            {text.back}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </nav>

        <PublicPageHeader align="left" title={text.title} subtitle={text.subtitle} />

        <div className="mt-8">
          <PublicationCard
            publication={publication}
            loadError={loadError}
            onRetry={retry}
            language={selectedLanguage}
          />
        </div>

        <p className="mt-8 text-center text-xs text-text-secondary">
          <a className="underline hover:text-text-primary" href={CLAUDE_PLUGIN_PUBLICATION_INDEX_URL}>
            {text.publicationIndex}
          </a>
        </p>
      </main>
    </div>
  )
}
