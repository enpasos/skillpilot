import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Store,
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
  CLAUDE_PLUGINS_DISCOVER_URL,
  loadClaudePluginPublicationIndex,
  type ClaudePluginPublicationIndex,
} from '../utils/claudePluginPublication'

const copy = (version?: string) => ({
  de: {
    back: 'Zurück zur Startseite',
    title: 'SkillPilot-Plugins',
    subtitle: 'SkillPilot in Claude einrichten und aktuell halten – per Marketplace oder Plugin-Datei.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: version ? 'Claude-Beta ' + version : 'Claude-Beta',
    betaDescription: 'Empfohlen: Installation über unseren Marketplace. Falls das nicht klappt, lade die Plugin-Datei herunter und in Claude hoch.',
    loading: 'Aktuelle Plugin-Version wird geladen …',
    loadErrorTitle: 'Die aktuelle Versionsangabe konnte nicht geladen werden.',
    loadErrorText: 'Der Marketplace-Weg bleibt verfügbar. Der Datei-Download und der Versionsvergleich sind bis zum erneuten Laden nicht verfügbar; eine ältere Datei wird nicht als Ersatz angeboten.',
    retry: 'Erneut versuchen',
    emptyTitle: 'Derzeit steht keine aktuelle Plugin-Datei bereit.',
    emptyText: 'Eine ältere Claude-Variante wird nicht als Ersatz angeboten.',
    modeLabel: 'Was möchtest du tun?',
    modeInstall: 'Neu installieren',
    modeUpdate: 'Aktualisieren',
    marketplaceTitle: 'Über Marketplace – empfohlen',
    marketplaceInstallIntro: 'Füge unsere Quelle einmalig hinzu und installiere daraus das Plugin.',
    marketplaceInstallActions: [
      'Öffne in Claude „Hinzufügen“ oben rechts → „Marketplace hinzufügen“ → „Aus einem Repository hinzufügen“.',
      'Füge die unten stehende Repository-Adresse ein. Lass „Automatisch synchronisieren“ für diesen Weg ausgeschaltet und wähle „Synchronisieren“.',
      version
        ? 'Öffne „Entdecken“ und suche „SkillPilot Coach v1“ aus der Quelle „skillpilot-claude-marketplace“. Prüfe vor „Hinzufügen“, dass Version ' + version + ' angeboten wird. Ist die angebotene Version älter, nutze die Datei-Alternative unten.'
        : 'Öffne „Entdecken“ und suche „SkillPilot Coach v1“ aus der Quelle „skillpilot-claude-marketplace“. Warte vor „Hinzufügen“ auf die aktuelle Versionsangabe dieser Seite und vergleiche sie mit der angebotenen Version.',
    ],
    marketplaceAlreadyAdded: '„Dieser Marketplace wurde bereits hinzugefügt“? Nicht erneut hinzufügen, sondern oben zu „Aktualisieren“ wechseln.',
    marketplaceMigration: 'Wechsel vom Datei-Upload? Prüfe zuerst, ob der Marketplace die hier genannte Version anbietet. Entferne dann nur die ältere SkillPilot-Dateiinstallation unter „Deine Plugins“, bevor du das Marketplace-Plugin hinzufügst. Ist deine Version bereits aktuell, ist kein Wechsel nötig.',
    marketplaceUpdateIntro: 'Für eine bestehende Marketplace-Installation: aktualisiere die vorhandene Quelle, ohne sie zu löschen.',
    marketplaceUpdateActions: [
      'Öffne „Hinzufügen“ oben rechts → „Marketplaces verwalten“.',
      'Wähle bei „skillpilot-claude-marketplace“ das Menü „⋮“ → „Nach Updates suchen“.',
      'Prüfe danach die angebotene Version und zusätzlich unter „Deine Plugins“ die installierte Version. Bleibt diese älter, nutze die Plugin-Datei unten.',
    ],
    uploadUpdateHint: 'Bisher per Datei installiert? Verwende die Datei-Alternative unten. Eine Marketplace-Synchronisierung bestätigt kein Update deiner Dateiinstallation.',
    repositoryLabel: 'Marketplace-Adresse',
    copyRepository: 'Adresse kopieren',
    copiedRepository: 'Adresse kopiert.',
    copyFailed: 'Kopieren nicht möglich. Markiere und kopiere die oben stehende Adresse selbst.',
    autosync: 'Auto-Sync ist optional und wird hier nicht vorausgesetzt. Fordert Claude dafür GitHub-Zugriff, überspringe die Freigabe und nutze die manuelle Updatesuche oder den Datei-Upload. Gib dafür nicht pauschal alle Repositorys frei.',
    troubleTitle: 'Hinweise zu Updates und Marketplace-Verwaltung',
    troubleBody: 'Der Versionswähler unter „Inhalte“ zeigt synchronisierte Dateien, nicht zuverlässig die installierte oder im laufenden Chat verwendete Version. Automatische Updates auf unabhängigen Konten sind noch nicht vollständig geprüft.',
    removalWarning: '„Entfernen“ am Marketplace deinstalliert laut Claude auch dessen Plugins. Das ist kein normaler Updateschritt. Prüfe separat erteilte GitHub-Rechte gesondert; das Entfernen ist kein bestätigter Widerruf.',
    guideTitle: CLAUDE_MARKETPLACE_INSTALLATION_ENABLED ? 'Alternative: Plugin-Datei herunterladen und hochladen' : 'Plugin-Datei herunterladen und hochladen',
    guideIntro: CLAUDE_MARKETPLACE_INSTALLATION_ENABLED
      ? 'Für eine neue Installation oder ein manuelles Update, wenn du den Marketplace nicht nutzen kannst oder möchtest. Nutze nur einen Installationsweg.'
      : 'Lade die aktuelle Plugin-Datei für eine neue Installation oder ein manuelles Update herunter und installiere sie in Claude.',
    stepOpenTitle: 'Bestehende Installation prüfen',
    stepOpenBody: 'Erst nach dem Download:',
    stepOpenActions: [
      'Öffne in Claude „Deine Plugins“. Ist die hier angezeigte Version bereits installiert, musst du nichts entfernen oder neu hochladen.',
      'Für den Wechsel auf die aktuelle Datei entferne nur eine ältere SkillPilot-Coach-Installation über deren „⋮“-Menü → „Entfernen“. Andere Plugins und Konnektoren bleiben unverändert.',
    ],
    stepOpenCheck: 'Nicht den gesamten Marketplace entfernen. Bei einer Neuinstallation entfällt dieser Schritt.',
    stepInstallTitle: 'Plugin-Datei hochladen',
    stepInstallBody: 'In der Plugin-Übersicht von Claude:',
    stepInstallActions: [
      'Wähle „Hinzufügen“ oben rechts → „Plugin hochladen“ und lade die heruntergeladene .plugin-Datei unverändert hoch.',
      'Prüfe anschließend wie unten beschrieben Version, Aktivierung und Konnektor. Spätere Datei-Updates führst du auf demselben Weg durch.',
    ],
    finishTitle: CLAUDE_MARKETPLACE_INSTALLATION_ENABLED ? 'Für beide Wege: prüfen und starten' : 'Prüfen und starten',
    versionTitle: 'Installierte Version prüfen',
    versionBody: version
      ? 'Unter „Deine Plugins“ muss „SkillPilot Coach v1“ genau einmal installiert, aktiviert und in Version ' + version + ' angezeigt sein.'
      : 'Warte auf die aktuelle Versionsangabe dieser Seite, bevor du die installierte Version vergleichst.',
    stepConnectorTitle: 'SkillPilot-Konnektor verbinden',
    stepConnectorBody: 'Öffne im installierten Plugin „Konnektoren“ → „skillpilot“.',
    stepConnectorActions: [
      'Steht dort „Verbunden“, ist nichts weiter nötig.',
      'Andernfalls wähle „Verbinden“ und schließe Anmeldung und Freigabe ab.',
    ],
    stepConnectorCheck: 'Gemeint ist der enthaltene SkillPilot-Konnektor, nicht GitHub. Keinen zweiten manuellen Konnektor hinzufügen und keine MCP-URL eintragen.',
    openClaudeWeb: 'Plugins in Claude öffnen',
    navigationHint: 'Der Link öffnet „Plugins → Entdecken“ in Claude Web, installiert oder aktualisiert aber nichts. Falls er nicht zur Plugin-Ansicht führt: in Claude „Anpassen“ → „Plugins“ öffnen. Gemeint ist immer das „Hinzufügen“-Menü oben rechts, nicht der Knopf einer beworbenen Plugin-Karte.',
    keepTab: 'Lass diesen SkillPilot-Tab geöffnet.',
    stepReturnTitle: 'Neue Lernsession bei SkillPilot starten',
    stepReturnBody: 'Sind Version und Konnektor geprüft, kehre zu deinem ursprünglichen SkillPilot-Tab zurück. Prüfe Lernprofil und Curriculum und wähle „Mit Claude starten“. Starte auch nach einem Update eine neue Lernsession von SkillPilot.com aus.',
    returnToSkillPilot: 'Zurück zu SkillPilot',
    updateTitle: 'Deine Installation vergleichen',
    updateBody: version
      ? 'Aktuell bereitgestellt: ' + version + '. Zeigt „Deine Plugins“ in Claude dieselbe Version, ist keine Neuinstallation nötig.'
      : 'Sobald die aktuelle Versionsangabe geladen ist, kannst du sie mit „Deine Plugins“ in Claude vergleichen. Entferne keine bestehende Installation, solange diese Angabe fehlt.',
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
    age: (minimumAge: number) => 'Nur für Personen ab ' + minimumAge + ' Jahren.',
    plan: 'Für den Betatest ist Claude Pro vorgesehen und technisch unterstützt.',
    planDetail: 'Die vollständige Abnahme der aktuellen SkillPilot-Version mit unabhängigen Claude-Pro-Konten steht noch aus.',
    install: 'Diese Schritte beziehen sich auf Claude Web. Marketplace und Datei-Upload führen zum selben SkillPilot-Plugin.',
    independentTitle: 'Unabhängiger Beta-Kandidat',
    independentText: 'Dieses Plugin wird von SkillPilot bereitgestellt. Es ist nicht offiziell von Anthropic verifiziert, gesponsert oder garantiert.',
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
    stepDownloadBody: version
      ? 'Lade Version ' + version + ' herunter, bevor du eine alte Installation entfernst. Der Download allein installiert das Plugin nicht.'
      : 'Die aktuelle Datei steht nach erfolgreichem Laden der Versionsangabe bereit.',
    versionCheckLimit: 'SkillPilot kann die in deinem Claude-Konto installierte Version nicht automatisch auslesen.',
  },
  en: {
    back: 'Back to the home page',
    title: 'SkillPilot plugins',
    subtitle: 'Set up SkillPilot in Claude and keep it current – through the marketplace or a plugin file.',
    cardTitle: 'SkillPilot Coach v1',
    betaNotice: version ? 'Claude beta ' + version : 'Claude beta',
    betaDescription: 'Recommended: install through our marketplace. If that does not work, download the plugin file and upload it to Claude.',
    loading: 'Loading the current plugin version …',
    loadErrorTitle: 'The current version information could not be loaded.',
    loadErrorText: 'The marketplace instructions remain available. File download and version comparison are unavailable until you retry successfully; an older file is not offered as a substitute.',
    retry: 'Try again',
    emptyTitle: 'There is currently no current plugin file available.',
    emptyText: 'An older Claude variant is not offered as a substitute.',
    modeLabel: 'What would you like to do?',
    modeInstall: 'Install',
    modeUpdate: 'Update',
    marketplaceTitle: 'Through the marketplace – recommended',
    marketplaceInstallIntro: 'Add our source once, then install the plugin from it.',
    marketplaceInstallActions: [
      'In Claude, open the Add dropdown at the top right → Add marketplace → Add from a repository.',
      'Paste the repository address below. Leave Automatically sync off for this route and select Sync.',
      version
        ? 'Open Discover and find SkillPilot Coach v1 from skillpilot-claude-marketplace. Before selecting Add, check that it offers version ' + version + '. If the offered version is older, use the file alternative below.'
        : 'Open Discover and find SkillPilot Coach v1 from skillpilot-claude-marketplace. Before selecting Add, wait for this page’s current version information and compare it with the offered version.',
    ],
    marketplaceAlreadyAdded: 'Marketplace already added? Do not add it again; switch to Update above.',
    marketplaceMigration: 'Switching from file upload? First check that the marketplace offers the version shown here. Then remove only the older SkillPilot file installation under Your plugins before adding the marketplace plugin. If your installed version is already current, there is no need to switch.',
    marketplaceUpdateIntro: 'For an existing marketplace installation, refresh the existing source without removing it.',
    marketplaceUpdateActions: [
      'Open Add at the top right → Manage marketplaces.',
      'Next to skillpilot-claude-marketplace, open ⋮ → Check for updates.',
      'Then check the offered version and, separately, the installed version under Your plugins. If it is still older, use the plugin file below.',
    ],
    uploadUpdateHint: 'Previously installed by file upload? Use the file alternative below. A marketplace sync does not confirm an update to your uploaded installation.',
    repositoryLabel: 'Marketplace address',
    copyRepository: 'Copy address',
    copiedRepository: 'Address copied.',
    copyFailed: 'Could not copy. Select and copy the address shown above manually.',
    autosync: 'Auto-sync is optional and not required here. If Claude requests GitHub access for it, skip authorization and use the manual update check or file upload. Do not grant access to all repositories for this.',
    troubleTitle: 'About updates and marketplace management',
    troubleBody: 'The version selector under Contents shows synchronized files, not reliable proof of the installed version or the version used by a running chat. Automatic updates across independent accounts have not been fully verified.',
    removalWarning: 'Removing a marketplace also uninstalls its plugins, according to Claude. This is not a normal update step. Check separately granted GitHub access independently; removal is not confirmed to revoke it.',
    guideTitle: CLAUDE_MARKETPLACE_INSTALLATION_ENABLED ? 'Alternative: Download and upload the plugin file' : 'Download and upload the plugin file',
    guideIntro: CLAUDE_MARKETPLACE_INSTALLATION_ENABLED
      ? 'For a new installation or manual update when you cannot or prefer not to use the marketplace. Use only one installation route.'
      : 'Download the current plugin file for a new installation or manual update, then install it in Claude.',
    stepOpenTitle: 'Check the existing installation',
    stepOpenBody: 'Only after downloading the file:',
    stepOpenActions: [
      'Open Your plugins in Claude. If the version shown here is already installed, there is no need to remove it or upload again.',
      'To switch to the current file, remove only an older SkillPilot Coach installation using its ⋮ menu → Remove. Leave other plugins and connectors unchanged.',
    ],
    stepOpenCheck: 'Do not remove the entire marketplace. Skip this step for a new installation.',
    stepInstallTitle: 'Upload the plugin file',
    stepInstallBody: 'In Claude’s plugin overview:',
    stepInstallActions: [
      'Select Add at the top right → Upload plugin, then upload the downloaded .plugin file without modifying it.',
      'Check the version, activation and connector as described below. Use the same file workflow for later file updates.',
    ],
    finishTitle: CLAUDE_MARKETPLACE_INSTALLATION_ENABLED ? 'For both routes: check and start' : 'Check and start',
    versionTitle: 'Check the installed version',
    versionBody: version
      ? 'Under Your plugins, SkillPilot Coach v1 must appear exactly once, installed, enabled and showing version ' + version + '.'
      : 'Wait for this page’s current version information before comparing the installed version.',
    stepConnectorTitle: 'Connect the SkillPilot connector',
    stepConnectorBody: 'In the installed plugin, open Connectors → skillpilot.',
    stepConnectorActions: [
      'If it already says Connected, no further action is needed.',
      'Otherwise select Connect and complete sign-in and approval.',
    ],
    stepConnectorCheck: 'This means the bundled SkillPilot connector, not GitHub. Do not add a second manual connector or enter an MCP URL.',
    openClaudeWeb: 'Open plugins in Claude',
    navigationHint: 'The link opens Plugins → Discover in Claude Web; it does not install or update anything. If it does not reach that view, open Customize → Plugins in Claude. Always use the Add dropdown at the top right, not the button inside a featured plugin card.',
    keepTab: 'Keep this SkillPilot tab open.',
    stepReturnTitle: 'Start a new learning session at SkillPilot',
    stepReturnBody: 'After checking the version and connector, return to your original SkillPilot tab. Check your learning profile and curriculum, then select “Start with Claude.” After an update, also start a new learning session from SkillPilot.com.',
    returnToSkillPilot: 'Return to SkillPilot',
    updateTitle: 'Compare your installation',
    updateBody: version
      ? 'Currently provided: ' + version + '. If Your plugins in Claude shows the same version, no reinstall is needed.'
      : 'Once the current version information is loaded, you can compare it with Your plugins in Claude. Do not remove an existing installation while this information is unavailable.',
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
    age: (minimumAge: number) => 'Only for people aged ' + minimumAge + ' or older.',
    plan: 'Claude Pro is the intended and technically supported beta route.',
    planDetail: 'Full acceptance of the current SkillPilot version with independent Claude Pro accounts is still pending.',
    install: 'These steps apply to Claude Web. The marketplace and file upload lead to the same SkillPilot plugin.',
    independentTitle: 'Independent beta candidate',
    independentText: 'This plugin is provided by SkillPilot. It is not officially verified, sponsored, or guaranteed by Anthropic.',
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
    stepDownloadBody: version
      ? 'Download version ' + version + ' before removing an older installation. Downloading alone does not install the plugin.'
      : 'The current file becomes available once the version information has loaded successfully.',
    versionCheckLimit: 'SkillPilot cannot automatically read the version installed in your Claude account.',
  },
} as const)

type SupportedLanguage = keyof ReturnType<typeof copy>

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
  children?: React.ReactNode
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
  const [guideMode, setGuideMode] = useState<'install' | 'update'>('install')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const plugin = publication?.plugins[0]
  const text = copy(plugin?.version)[language]
  const requirements = plugin?.requirements ?? CLAUDE_PLUGIN_BETA_REQUIREMENTS
  const cardId = plugin?.id ?? 'skillpilot-coach-v1'
  const supportHref = `mailto:${plugin?.supportEmail ?? 'support@skillpilot.com'}`
  const copyRepository = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_MARKETPLACE_REPOSITORY_URL)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }
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
            <span data-testid="claude-plugin-version-badge" className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-200">
              {text.betaNotice}
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              {text.cardTitle}
            </h2>
            <p data-testid="claude-plugin-description" className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
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

        {!publication && !loadError && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-color bg-white/70 p-4 text-sm text-text-secondary dark:bg-slate-900/50" data-testid="claude-plugin-publication-status" role="status">
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

        <div data-testid="claude-plugin-open-navigation">
          <a data-testid="claude-plugin-open-claude" href={CLAUDE_PLUGINS_DISCOVER_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">
            {text.openClaudeWeb}<ExternalLink size={16} aria-hidden="true" />
          </a>
          <p className="mt-2 text-sm text-text-secondary">{text.keepTab}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.navigationHint}</p>
        </div>

        {CLAUDE_MARKETPLACE_INSTALLATION_ENABLED && (
          <section data-testid="claude-plugin-marketplace-guide" aria-labelledby={`${cardId}-marketplace-guide`} className="rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25 sm:p-6">
            <h3 id={`${cardId}-marketplace-guide`} className="text-xl font-semibold text-slate-900 dark:text-white">{text.marketplaceTitle}</h3>
            <div role="group" aria-label={text.modeLabel} className="mt-4 flex flex-wrap gap-2">
              {(['install', 'update'] as const).map((mode) => (
                <button key={mode} type="button" data-testid={`claude-plugin-mode-${mode}`} aria-pressed={guideMode === mode} aria-controls={`${cardId}-marketplace-instructions`} onClick={() => setGuideMode(mode)} className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${guideMode === mode ? 'border-sky-700 bg-sky-700 text-white' : 'border-sky-300 bg-white text-sky-800 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-200'}`}>
                  {mode === 'install' ? text.modeInstall : text.modeUpdate}
                </button>
              ))}
            </div>
            <div id={`${cardId}-marketplace-instructions`}>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{guideMode === 'install' ? text.marketplaceInstallIntro : text.marketplaceUpdateIntro}</p>
              {guideMode === 'install' && <p data-testid="claude-plugin-marketplace-migration" className="mt-3 text-sm leading-relaxed text-text-secondary">{text.marketplaceMigration}</p>}
              <InstructionActions actions={guideMode === 'install' ? text.marketplaceInstallActions : text.marketplaceUpdateActions} testId="claude-plugin-marketplace-navigation" />
              {guideMode === 'install' ? (
                <div className="mt-4 rounded-xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900">
                  <p className="text-sm font-semibold">{text.repositoryLabel}</p>
                  <code data-testid="claude-plugin-marketplace-url" className="mt-2 block select-all break-all text-sm">{CLAUDE_MARKETPLACE_REPOSITORY_URL}</code>
                  <button type="button" data-testid="claude-plugin-copy-marketplace" onClick={() => { void copyRepository() }} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 dark:text-sky-200">
                    <Copy size={16} aria-hidden="true" />{text.copyRepository}
                  </button>
                  <p data-testid="claude-plugin-copy-status" role="status" className="mt-2 text-sm text-text-secondary">{copyStatus === 'copied' ? text.copiedRepository : copyStatus === 'error' ? text.copyFailed : ''}</p>
                  <p className="mt-2 text-sm text-text-secondary">{text.marketplaceAlreadyAdded}</p>
                </div>
              ) : <p className="mt-3 text-sm font-medium text-text-secondary">{text.uploadUpdateHint}</p>}
              <p data-testid="claude-plugin-autosync-notice" className="mt-4 text-sm leading-relaxed text-text-secondary">{text.autosync}</p>
            </div>
          </section>
        )}

        <details data-testid="claude-plugin-direct-upload-guide" open={!CLAUDE_MARKETPLACE_INSTALLATION_ENABLED} className="rounded-2xl border border-border-color p-5 sm:p-6">
          <summary className="cursor-pointer text-lg font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:text-white">{text.guideTitle}</summary>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.guideIntro}</p>
          <ol className="mt-5 space-y-4">
            <InstallStep number={1} name="download" title={text.stepDownloadTitle} body={text.stepDownloadBody}>

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
              <InstructionActions actions={text.stepOpenActions} testId="claude-plugin-replace-navigation" />
              <p className="mt-3 text-sm text-text-secondary">{text.stepOpenCheck}</p>
            </InstallStep>
            <InstallStep number={3} name="upload" title={text.stepInstallTitle} body={text.stepInstallBody}>
              <InstructionActions actions={text.stepInstallActions} testId="claude-plugin-upload-navigation" />
            </InstallStep>
          </ol>
        </details>

        <section data-testid="claude-plugin-finish-guide" aria-labelledby={`${cardId}-finish-guide`}>
          <h3 id={`${cardId}-finish-guide`} className="text-xl font-semibold text-slate-900 dark:text-white">{text.finishTitle}</h3>
          <ol className="mt-4 space-y-4">
            <InstallStep number={1} name="version" title={text.versionTitle} body={text.versionBody} />
            <InstallStep number={2} name="connector" title={text.stepConnectorTitle} body={text.stepConnectorBody}>
              <InstructionActions actions={text.stepConnectorActions} testId="claude-plugin-connector-navigation" />
              <p className="mt-3 text-sm font-medium text-text-secondary">{text.stepConnectorCheck}</p>
            </InstallStep>
            <InstallStep number={3} name="return" title={text.stepReturnTitle} body={text.stepReturnBody}>
              <Link to="/" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-800 dark:text-sky-200">
                <ArrowLeft size={16} aria-hidden="true" />{text.returnToSkillPilot}
              </Link>
            </InstallStep>
          </ol>
        </section>

        <details className="rounded-2xl border border-border-color p-5">
          <summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">{text.troubleTitle}</summary>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{text.troubleBody}</p>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{text.removalWarning}</p>
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
              </div>
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
  const [publication, setPublication] = useState<ClaudePluginPublicationIndex | null>(null)
  const text = copy(publication?.plugins[0]?.version)[selectedLanguage]
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
