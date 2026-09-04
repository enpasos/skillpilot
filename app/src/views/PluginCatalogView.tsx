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
    subtitle: 'Geführte Marketplace-Einrichtung des SkillPilot Claude Coach mit Claude Pro.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: 'Marketplace-Beta',
    betaDescription: 'Der SkillPilot Marketplace ist der empfohlene Installations- und Updateweg in der SkillPilot-Beta. Er wird von SkillPilot unabhängig von Anthropic bereitgestellt und ist nicht von Anthropic kuratiert oder verifiziert.',
    loading: 'Aktuelle Fallback-Version wird geladen …',
    loadErrorTitle: 'Der Direkt-Upload-Fallback konnte nicht geladen werden.',
    loadErrorText: 'Die Marketplace-Anleitung bleibt nutzbar. Bitte versuche den Fallback später erneut; ohne gültigen Veröffentlichungsindex bieten wir aus Sicherheitsgründen keinen Datei-Download an.',
    retry: 'Erneut versuchen',
    emptyTitle: 'Derzeit steht keine geprüfte Plugin-Datei als Fallback bereit.',
    emptyText: 'Die Marketplace-Installation ist davon nicht betroffen.',
    guideTitle: 'Über den SkillPilot Marketplace installieren',
    guideIntro: 'Lass deinen ursprünglichen SkillPilot-Tab geöffnet und führe diese fünf Schritte in Claude Web durch.',
    stepOpenTitle: 'Plugin-Liste öffnen',
    stepOpenBody: 'Öffne Claude Web und gehe zur persönlichen Plugin-Verwaltung:',
    stepOpenActions: [
      'Öffne „Anpassen“ (Customize) → „Plugins“ → „Deine Plugins“ (Your plugins).',
      'Falls dort bereits ein per Datei installiertes „SkillPilot Coach v1“ steht, entferne nur dieses alte SkillPilot-Plugin. Entferne keine anderen Plugins und trenne vorhandene Konnektoren nicht manuell.',
      'Klicke oben rechts auf „Hinzufügen“ und wähle „Marketplace hinzufügen“.',
    ],
    stepOpenCheck: 'Marketplace- und Datei-Version dürfen nicht gleichzeitig installiert sein. Wenn du SkillPilot neu installierst, ist kein Entfernen nötig.',
    stepMarketplaceTitle: 'SkillPilot Marketplace hinzufügen',
    stepMarketplaceBody: 'Wähle „Aus einem Repository hinzufügen“, füge die folgende vollständige Adresse ein und bestätige:',
    repositoryLabel: 'GitHub-Repository des SkillPilot Marketplace',
    copyRepository: 'Adresse kopieren',
    repositoryCopied: 'Adresse kopiert',
    repositoryCopyFailed: 'Kopieren nicht möglich. Markiere die Adresse und kopiere sie manuell.',
    stepMarketplaceCheck: 'Verwende die vollständige HTTPS-Adresse.',
    stepInstallTitle: 'SkillPilot Coach installieren',
    stepInstallBody: 'Öffne den neu hinzugefügten „SkillPilot Marketplace“ und installiere das Plugin:',
    stepInstallActions: [
      'Wähle „SkillPilot Coach v1“ und klicke auf „Installieren“.',
      'Falls Claude beim neuen Eintrag einen Schalter zum Aktivieren zeigt, aktiviere das Plugin.',
    ],
    stepInstallCheck: 'Nach der Installation erscheint „SkillPilot Coach v1“ genau einmal unter „Deine Plugins“.',
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
    stepReturnBody: 'Wechsle zurück zum ursprünglichen SkillPilot-Tab. Prüfe dort dein Lernprofil und Curriculum und wähle anschließend „Mit Claude starten“. Beginne auch spätere neue Lernsessions immer auf SkillPilot.com.',
    returnToSkillPilot: 'Zurück zu SkillPilot',
    updateTitle: 'Updates über den Marketplace',
    updateBody: 'Öffne in Claude den „SkillPilot Marketplace“ und wähle „Aktualisieren“. Starte danach über SkillPilot eine neue Claude-Session. Ein erneuter Datei-Upload ist nicht erforderlich.',
    fallbackTitle: 'Direkt-Upload nur als Fallback',
    fallbackIntro: 'Nutze diesen Weg nur, wenn „Aus einem Repository hinzufügen“ in deinem Claude-Konto nicht verfügbar ist oder die Marketplace-Installation scheitert.',
    fallbackActions: [
      'Entferne vor dem Datei-Upload eine bereits vorhandene SkillPilot-Coach-Installation.',
      'Lade die aktuelle geprüfte .plugin-Datei herunter und installiere sie in Claude über „Hinzufügen“.',
      'Aktiviere das Plugin und verbinde bei Bedarf den enthaltenen SkillPilot-Konnektor.',
    ],
    fallbackCheck: 'Installiere Marketplace- und Datei-Version nicht gleichzeitig. Updates über den Fallback erfolgen manuell durch erneuten Download und Upload.',
    technicalDetails: 'Version und Integritätsdaten des Fallbacks',
    status: 'Status',
    betaStatus: 'Beta',
    version: 'Version',
    preparedAt: 'Stand',
    fileSize: 'Dateigröße',
    checksum: 'SHA-256',
    download: 'Plugin-Datei herunterladen',
    requirementsTitle: 'Voraussetzungen und getesteter Weg',
    supportedPlan: 'Unterstützter Beta-Tarif',
    installationSurface: 'Installation',
    age: (minimumAge: number) => `Nur für Personen ab ${minimumAge} Jahren.`,
    plan: 'Claude Pro ist der von SkillPilot unterstützte und getestete Beta-Pfad.',
    planDetail: 'Anthropic bietet Plugins auch in weiteren bezahlten Tarifen an. SkillPilot hat diesen Beta-Weg bisher nur mit Claude Pro getestet und unterstützt ihn dafür.',
    install: 'Claude Web: SkillPilot Marketplace aus dem öffentlichen GitHub-Repository hinzufügen → „SkillPilot Coach v1“ installieren → enthaltenen SkillPilot-Konnektor prüfen.',
    connectAndStart: 'Erst wenn „SkillPilot Coach v1“ installiert und sein enthaltener SkillPilot-Konnektor verbunden ist, ist die Einrichtung abgeschlossen. Jede Lernsession startest du anschließend wieder auf SkillPilot.com.',
    android: 'Die anschließende Nutzung in Claude für Android wurde mit demselben Claude-Konto getestet. Interaktive UI-Komponenten können dabei je nach Client oder Turn fehlen; Aufgaben bleiben über Text oder Sprache vollständig lösbar.',
    voiceTested: 'Der Voice Mode wurde von SkillPilot im Beta-Test erprobt. Interaktive UI-Komponenten werden darin nicht durchgängig garantiert. Das ist keine Funktionsgarantie von Anthropic.',
    voiceUntested: 'Der Voice Mode gehört nicht zum getesteten Umfang dieser Version.',
    independentTitle: 'Unabhängiger Beta-Test',
    independentText: 'Dieses Plugin wird von SkillPilot bereitgestellt. Es ist nicht offiziell von Anthropic verifiziert, gesponsert oder garantiert.',
    testedSurfaces: 'Getestete Oberflächen',
    links: 'Dokumentation und Kontakt',
    source: 'Marketplace-Repository',
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
    subtitle: 'Guided marketplace setup for the SkillPilot Claude Coach with Claude Pro.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: 'Marketplace beta',
    betaDescription: 'The SkillPilot Marketplace is the recommended installation and update route in the SkillPilot beta. It is independently provided by SkillPilot and is not curated or verified by Anthropic.',
    loading: 'Loading the current fallback version …',
    loadErrorTitle: 'The direct-upload fallback could not be loaded.',
    loadErrorText: 'The marketplace guide remains available. Please try the fallback again later; for security reasons, no file download is offered without a valid publication index.',
    retry: 'Try again',
    emptyTitle: 'There is currently no verified plugin file available as a fallback.',
    emptyText: 'Marketplace installation is not affected.',
    guideTitle: 'Install from the SkillPilot Marketplace',
    guideIntro: 'Keep your original SkillPilot tab open and complete these five steps in Claude Web.',
    stepOpenTitle: 'Open the plugin list',
    stepOpenBody: 'Open Claude Web and go to your personal plugin management:',
    stepOpenActions: [
      'Open Customize → Plugins → Your plugins.',
      'If a file-uploaded “SkillPilot Coach v1” is already listed, remove only that old SkillPilot plugin. Do not remove other plugins or manually disconnect existing connectors.',
      'Select Add in the upper-right corner, then Add marketplace.',
    ],
    stepOpenCheck: 'Do not install the marketplace and file-uploaded versions at the same time. There is nothing to remove for a new SkillPilot installation.',
    stepMarketplaceTitle: 'Add the SkillPilot Marketplace',
    stepMarketplaceBody: 'Select Add from a repository, enter the following complete address, and confirm:',
    repositoryLabel: 'GitHub repository for the SkillPilot Marketplace',
    copyRepository: 'Copy address',
    repositoryCopied: 'Address copied',
    repositoryCopyFailed: 'Could not copy the address. Select it and copy it manually.',
    stepMarketplaceCheck: 'Use the complete HTTPS address.',
    stepInstallTitle: 'Install SkillPilot Coach',
    stepInstallBody: 'Open the newly added SkillPilot Marketplace and install the plugin:',
    stepInstallActions: [
      'Select SkillPilot Coach v1 and choose Install.',
      'If Claude shows an enable switch on the new entry, enable the plugin.',
    ],
    stepInstallCheck: 'After installation, “SkillPilot Coach v1” appears exactly once under Your plugins.',
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
    stepReturnBody: 'Return to your original SkillPilot tab. Check your learning profile and curriculum, then select “Start with Claude.” Start every later new learning session at SkillPilot.com as well.',
    returnToSkillPilot: 'Return to SkillPilot',
    updateTitle: 'Updates through the marketplace',
    updateBody: 'Open the SkillPilot Marketplace in Claude and select Update. Then start a new Claude session through SkillPilot. No new file upload is required.',
    fallbackTitle: 'Direct upload only as a fallback',
    fallbackIntro: 'Use this route only if Add from a repository is unavailable for your Claude account or marketplace installation fails.',
    fallbackActions: [
      'Before uploading the file, remove any existing SkillPilot Coach installation.',
      'Download the current verified .plugin file and install it in Claude through Add.',
      'Enable the plugin and connect the bundled SkillPilot connector if necessary.',
    ],
    fallbackCheck: 'Do not install the marketplace and file-uploaded versions at the same time. Fallback updates require downloading and uploading the new file manually.',
    technicalDetails: 'Fallback version and integrity details',
    status: 'Status',
    betaStatus: 'Beta',
    version: 'Version',
    preparedAt: 'Prepared',
    fileSize: 'File size',
    checksum: 'SHA-256',
    download: 'Download plugin file',
    requirementsTitle: 'Requirements and tested route',
    supportedPlan: 'Supported beta plan',
    installationSurface: 'Installation',
    age: (minimumAge: number) => `Only for people aged ${minimumAge} or older.`,
    plan: 'Claude Pro is the beta route supported and tested by SkillPilot.',
    planDetail: 'Anthropic also offers plugins on other paid plans. SkillPilot has so far tested and supports this beta route only with Claude Pro.',
    install: 'Claude Web: add the SkillPilot Marketplace from its public GitHub repository → install SkillPilot Coach v1 → check the bundled SkillPilot connector.',
    connectAndStart: 'Setup is complete only after “SkillPilot Coach v1” is installed and its bundled SkillPilot connector is connected. Start every learning session on SkillPilot.com afterwards.',
    android: 'Subsequent use in Claude for Android was tested with the same Claude account. Interactive UI components may be absent depending on the client or turn; tasks remain fully solvable through text or speech.',
    voiceTested: 'Voice mode was exercised in SkillPilot beta testing. Interactive UI components are not guaranteed consistently there. This is not a functionality guarantee from Anthropic.',
    voiceUntested: 'Voice mode is outside the tested scope of this version.',
    independentTitle: 'Independent beta test',
    independentText: 'This plugin is provided by SkillPilot. It is not officially verified, sponsored, or guaranteed by Anthropic.',
    testedSurfaces: 'Tested surfaces',
    links: 'Documentation and contact',
    source: 'Marketplace repository',
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
    { label: text.source, href: CLAUDE_MARKETPLACE_REPOSITORY_URL },
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

        <aside className="flex gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
          <RefreshCw className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300" size={22} aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">{text.updateTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">{text.updateBody}</p>
          </div>
        </aside>

        <details data-testid="claude-plugin-direct-upload-fallback" className="rounded-2xl border border-border-color bg-slate-50 p-4 dark:bg-slate-950/35">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            {text.fallbackTitle}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{text.fallbackIntro}</p>

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
              <InstructionActions actions={text.fallbackActions} testId="claude-plugin-direct-upload-navigation" />
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium leading-relaxed text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
                {text.fallbackCheck}
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
        </details>

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
                  {requirements.testedSurfaces.map((surface) => formatSurface(surface, language)).join(' · ')}
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
