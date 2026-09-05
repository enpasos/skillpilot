import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Copy,
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
  CLAUDE_MARKETPLACE_INSTALLATION_ENABLED,
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  CLAUDE_PLUGIN_BETA_REQUIREMENTS,
  CLAUDE_PLUGIN_PUBLICATION_INDEX_URL,
  loadClaudePluginPublicationIndex,
  type ClaudePluginPublicationIndex,
} from '../utils/claudePluginPublication'

const copy = {
  de: {
    back: 'Zurück zur Startseite',
    title: 'SkillPilot-Plugins',
    subtitle: 'Marketplace-Einrichtung und Versionsprüfung der SkillPilot-Claude-1.1.1-Beta mit Claude Pro.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: 'Claude-Beta 1.1.1',
    betaDescription: 'Die planorientierte Version 1.1.1 ersetzt die bisherige Claude-Variante vollständig. Version 1.1.1 wird über den persönlichen SkillPilot Marketplace bereitgestellt. Die kandidatengenaue Abnahme von Installation, Migration und Updates in Claude steht noch aus.',
    loading: 'Aktuelle Plugin-Version wird geladen …',
    loadErrorTitle: 'Die aktuelle Plugin-Datei konnte nicht geladen werden.',
    loadErrorText: 'Bitte versuche es später erneut. Ohne gültigen Veröffentlichungsindex bieten wir aus Sicherheitsgründen weder eine ältere Datei noch einen anderen Installationsweg an.',
    retry: 'Erneut versuchen',
    emptyTitle: 'Derzeit steht keine aktuelle 1.1.1-Plugin-Datei bereit.',
    emptyText: 'Eine ältere Claude-Variante wird nicht als Ersatz angeboten.',
    guideTitle: 'Neue Marketplace-Einrichtung',
    guideIntro: 'Diese fünf Schritte gelten für eine neue Marketplace-Einrichtung in Claude Web. Lass deinen ursprünglichen SkillPilot-Tab geöffnet. Ist der Marketplace bereits hinzugefügt, beachte den Hinweis zur bestehenden Installation oben.',
    stepOpenTitle: 'Plugin-Liste öffnen',
    stepOpenBody: 'Öffne Claude Web und gehe zur persönlichen Plugin-Verwaltung:',
    stepOpenActions: [
      'Öffne „Anpassen“ (Customize) → „Plugins“ → „Deine Plugins“ (Your plugins).',
      'Falls dort bereits ein per Datei installiertes „SkillPilot Coach v1“ steht, entferne nur dieses alte SkillPilot-Plugin. Andere Plugins und Konnektoren bleiben unverändert.',
      'Klicke oben rechts auf „Hinzufügen“ und wähle „Marketplace hinzufügen“.',
    ],
    stepOpenCheck: 'Marketplace- und Datei-Version dürfen nicht gleichzeitig installiert sein. Wenn du SkillPilot neu installierst, ist kein Entfernen nötig.',
    stepMarketplaceTitle: 'SkillPilot Marketplace hinzufügen',
    stepMarketplaceBody: 'Wähle „Aus einem Repository hinzufügen“ und füge die folgende vollständige Adresse ein:',
    repositoryLabel: 'GitHub-Repository des SkillPilot Marketplace',
    copyRepository: 'Adresse kopieren',
    repositoryCopied: 'Adresse kopiert',
    repositoryCopyFailed: 'Kopieren nicht möglich. Markiere die Adresse und kopiere sie manuell.',
    stepMarketplaceCheck: 'Lass „Automatisch synchronisieren“ eingeschaltet. Laut Dialog hält diese Option die Plugins aktuell, wenn sich das Repository auf GitHub ändert. Klicke anschließend auf „Synchronisieren“.',
    stepInstallTitle: 'SkillPilot Coach installieren',
    stepInstallBody: 'Prüfe nach der Synchronisierung den SkillPilot-Coach-Eintrag:',
    stepInstallActions: [
      'Falls Claude „Installieren“ anbietet, installiere „SkillPilot Coach v1“ in Version 1.1.1.',
      'Falls Claude beim neuen Eintrag einen Schalter zum Aktivieren zeigt, aktiviere das Plugin.',
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
    updateTitle: 'Bestehende Installation: Version prüfen',
    updateBody: 'Das erneute Hinzufügen meldet „Dieser Marketplace wurde bereits hinzugefügt“ und bestätigt kein Update. Ein manueller Aktualisierungsweg für bestehende Quellen in Claude Web ist noch nicht bestätigt. Prüfe die installierte Version: Erst mit 1.1.1 und verbundenem SkillPilot-Konnektor kehrst du zu SkillPilot zurück und startest eine neue Session. Wird weiterhin 1.0.4 angezeigt, verwende diese Installation nicht als aktuelle Version. Löschen, Neuinstallieren oder Datei-Upload sind keine bestätigten Updatewege.',
    directInstallTitle: 'Aktuelle Plugin-Datei installieren',
    directInstallIntro: 'Installiere ausschließlich die hier ausgewiesene aktuelle Version. Sie ersetzt jede ältere SkillPilot-Coach-Installation.',
    directInstallActions: [
      'Entferne vor dem Datei-Upload nur eine bereits vorhandene SkillPilot-Coach-Installation. Andere Plugins und Konnektoren bleiben unverändert.',
      'Lade die lokal struktur- und hashgeprüfte 1.1.1-.plugin-Datei herunter und wähle in Claude Web unter „Hinzufügen“ den Upload einer Plugin-Datei.',
      'Aktiviere das Plugin und verbinde bei Bedarf den enthaltenen SkillPilot-Konnektor.',
    ],
    directInstallCheck: 'Füge keinen zweiten manuellen SkillPilot-Konnektor hinzu und trage keine MCP-URL ein.',
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
    install: 'Neue Einrichtung in Claude Web: Hinzufügen → Marketplace hinzufügen → Aus einem Repository hinzufügen → vollständige Repository-Adresse einfügen → Automatisch synchronisieren eingeschaltet lassen → Synchronisieren → installierte Version 1.1.1 und enthaltenen SkillPilot-Konnektor prüfen.',
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
  },
  en: {
    back: 'Back to the home page',
    title: 'SkillPilot plugins',
    subtitle: 'Marketplace setup and version check for the SkillPilot Claude 1.1.1 beta with Claude Pro.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: 'Claude beta 1.1.1',
    betaDescription: 'The plan-first version 1.1.1 fully replaces the previous Claude variant. Version 1.1.1 is provided through the personal SkillPilot Marketplace. Exact-candidate acceptance of installation, migration, and updates in Claude is still pending.',
    loading: 'Loading the current plugin version …',
    loadErrorTitle: 'The current plugin file could not be loaded.',
    loadErrorText: 'Please try again later. Without a valid publication index, no older file or alternative installation route is offered for security reasons.',
    retry: 'Try again',
    emptyTitle: 'There is currently no current 1.1.1 plugin file available.',
    emptyText: 'An older Claude variant is not offered as a substitute.',
    guideTitle: 'New marketplace setup',
    guideIntro: 'These five steps apply to a new marketplace setup in Claude Web. Keep your original SkillPilot tab open. If the marketplace is already added, follow the existing-installation notice above. English control names below translate the observed German dialog.',
    stepOpenTitle: 'Open the plugin list',
    stepOpenBody: 'Open Claude Web and go to your personal plugin management:',
    stepOpenActions: [
      'Open Customize → Plugins → Your plugins.',
      'If a file-uploaded “SkillPilot Coach v1” is already listed, remove only that old SkillPilot plugin. Leave other plugins and connectors unchanged.',
      'Select Add in the upper-right corner, then Add marketplace.',
    ],
    stepOpenCheck: 'Do not install the marketplace and file-uploaded versions at the same time. There is nothing to remove for a new SkillPilot installation.',
    stepMarketplaceTitle: 'Add the SkillPilot Marketplace',
    stepMarketplaceBody: 'Select the option to add from a repository and enter the following complete address:',
    repositoryLabel: 'GitHub repository for the SkillPilot Marketplace',
    copyRepository: 'Copy address',
    repositoryCopied: 'Address copied',
    repositoryCopyFailed: 'Could not copy the address. Select it and copy it manually.',
    stepMarketplaceCheck: 'Keep automatic synchronization enabled (“Automatisch synchronisieren” in the observed German dialog). The dialog says this keeps plugins current when the GitHub repository changes. Then choose Synchronize (“Synchronisieren”).',
    stepInstallTitle: 'Install SkillPilot Coach',
    stepInstallBody: 'After synchronization, check the SkillPilot Coach entry:',
    stepInstallActions: [
      'If Claude offers installation, install SkillPilot Coach v1 version 1.1.1.',
      'If Claude shows an enable switch on the new entry, enable the plugin.',
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
    updateTitle: 'Existing installation: check the version',
    updateBody: 'Adding the marketplace again shows “Dieser Marketplace wurde bereits hinzugefügt” (this marketplace has already been added); this does not confirm an update. A manual update route for existing sources in Claude Web is not yet confirmed. Check the installed version: return to SkillPilot and start a new session only with version 1.1.1 and the bundled SkillPilot connector connected. If version 1.0.4 is still displayed, do not use that installation as the current version. Removal, reinstallation, or file upload are not confirmed update routes.',
    directInstallTitle: 'Install the current plugin file',
    directInstallIntro: 'Install only the current version shown here. It replaces every older SkillPilot Coach installation.',
    directInstallActions: [
      'Before uploading the file, remove only an existing SkillPilot Coach installation. Leave other plugins and connectors unchanged.',
      'Download the locally structure- and hash-verified 1.1.1 .plugin file and, in Claude Web, choose the plugin-file upload under Add.',
      'Enable the plugin and connect the bundled SkillPilot connector if necessary.',
    ],
    directInstallCheck: 'Do not add a second manual SkillPilot connector or enter an MCP URL.',
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
    install: 'New setup in Claude Web: Add → Add marketplace → Add from a repository → enter the complete repository address → keep automatic synchronization enabled → synchronize → verify installed version 1.1.1 and the bundled SkillPilot connector. Control names translate the observed German dialog.',
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
  const [repositoryCopyState, setRepositoryCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
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

  const copyRepositoryUrl = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_MARKETPLACE_REPOSITORY_URL)
      setRepositoryCopyState('copied')
    } catch {
      setRepositoryCopyState('failed')
    }
  }

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
        {CLAUDE_MARKETPLACE_INSTALLATION_ENABLED && (
          <>
            <aside data-testid="claude-plugin-marketplace-update-guide" className="flex gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
              <RefreshCw className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" size={22} aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">{text.updateTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">{text.updateBody}</p>
              </div>
            </aside>

            <section
              data-testid="claude-plugin-install-guide"
              aria-labelledby={`${cardId}-install-guide`}
              className="rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25 sm:p-6"
            >
          <h3 id={`${cardId}-install-guide`} className="text-xl font-semibold text-slate-900 dark:text-white">
            {text.guideTitle}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.guideIntro}</p>
          <ol className="mt-5 space-y-4">
            <li data-testid="claude-plugin-install-step-open" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">1</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepOpenTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepOpenBody}</p>
                  <InstructionActions
                    actions={text.stepOpenActions}
                    testId="claude-plugin-marketplace-open-navigation"
                  />
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium leading-relaxed text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
                    {text.stepOpenCheck}
                  </p>
                </div>
              </div>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-950/50 sm:w-auto"
              >
                {text.openClaudeWeb}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </li>
            <li data-testid="claude-plugin-install-step-marketplace" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">2</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepMarketplaceTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepMarketplaceBody}</p>
                  <div className="mt-3 rounded-xl border border-sky-300 bg-sky-100 p-3 text-sky-950 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100">
                    <label className="block text-xs font-semibold" htmlFor={`${cardId}-marketplace-url`}>
                      {text.repositoryLabel}
                    </label>
                    <input
                      id={`${cardId}-marketplace-url`}
                      className="mt-2 w-full rounded-lg border border-sky-300 bg-white px-3 py-2 font-mono text-xs text-slate-950 dark:border-sky-700 dark:bg-slate-950 dark:text-sky-100 sm:text-sm"
                      readOnly
                      value={CLAUDE_MARKETPLACE_REPOSITORY_URL}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <button
                      type="button"
                      onClick={copyRepositoryUrl}
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-100 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-offset-sky-950"
                    >
                      {repositoryCopyState === 'copied'
                        ? <Check size={17} aria-hidden="true" />
                        : <Copy size={17} aria-hidden="true" />}
                      {repositoryCopyState === 'copied' ? text.repositoryCopied : text.copyRepository}
                    </button>
                    {repositoryCopyState === 'failed' && (
                      <p className="mt-2 text-sm font-medium text-red-800 dark:text-red-200" role="alert">
                        {text.repositoryCopyFailed}
                      </p>
                    )}
                  </div>
                  <p className="mt-3 rounded-xl bg-sky-100 px-3 py-2 text-sm font-medium leading-relaxed text-sky-950 dark:bg-sky-950/70 dark:text-sky-100">
                    {text.stepMarketplaceCheck}
                  </p>
                </div>
              </div>
            </li>
            <li data-testid="claude-plugin-install-step-install" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">3</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepInstallTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepInstallBody}</p>
                  <InstructionActions
                    actions={text.stepInstallActions}
                    testId="claude-plugin-marketplace-install-navigation"
                  />
                  <p className="mt-3 rounded-xl bg-sky-100 px-3 py-2 text-sm font-medium leading-relaxed text-sky-950 dark:bg-sky-950/70 dark:text-sky-100">
                    {text.stepInstallCheck}
                  </p>
                </div>
              </div>
            </li>
            <li data-testid="claude-plugin-install-step-connector" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">4</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepConnectorTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepConnectorBody}</p>
                  <InstructionActions
                    actions={text.stepConnectorActions}
                    testId="claude-plugin-connector-navigation"
                  />
                  <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium leading-relaxed text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100">
                    {text.stepConnectorCheck}
                  </p>
                </div>
              </div>
            </li>
            <li data-testid="claude-plugin-install-step-return" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">5</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepReturnTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepReturnBody}</p>
                </div>
              </div>
              <Link
                to="/"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-950/50"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {text.returnToSkillPilot}
              </Link>
            </li>
          </ol>
            </section>

          </>
        )}

        {!CLAUDE_MARKETPLACE_INSTALLATION_ENABLED && (
        <section
          data-testid="claude-plugin-direct-upload-guide"
          aria-labelledby={`${cardId}-direct-upload-guide`}
          className="rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25 sm:p-6"
        >
          <h3 id={`${cardId}-direct-upload-guide`} className="text-xl font-semibold text-slate-900 dark:text-white">
            {text.directInstallTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{text.directInstallIntro}</p>

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
              <InstructionActions actions={text.directInstallActions} testId="claude-plugin-direct-upload-navigation" />
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium leading-relaxed text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
                {text.directInstallCheck}
              </p>
              <a
                href={plugin.downloadUrl}
                download={plugin.filename}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-400 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                <Download size={18} aria-hidden="true" />
                {text.download}
              </a>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{text.technicalDetails}</h4>
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
              </div>
            </div>
          )}
        </section>
        )}

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
