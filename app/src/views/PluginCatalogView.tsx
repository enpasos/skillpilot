import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarClock,
  Download,
  ExternalLink,
  FileArchive,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Volume2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'
import {
  CLAUDE_PLUGIN_PUBLICATION_INDEX_URL,
  loadClaudePluginPublicationIndex,
  type ClaudePluginPublication,
  type ClaudePluginPublicationIndex,
} from '../utils/claudePluginPublication'

const copy = {
  de: {
    back: 'Zurück zur Startseite',
    title: 'SkillPilot-Plugins',
    subtitle: 'Geführte Beta-Einrichtung des SkillPilot Claude Coach mit Claude Pro.',
    betaNotice: 'Beta-Download',
    betaDescription: 'Dieser Direkt-Download ist der aktuell von SkillPilot unterstützte Beta-Weg. Das Plugin ist nicht im offiziellen Anthropic-Marktplatz veröffentlicht.',
    loading: 'Aktuelle Plugin-Version wird geladen …',
    loadErrorTitle: 'Die Plugin-Version konnte nicht geladen werden.',
    loadErrorText: 'Bitte versuche es später erneut. Aus Sicherheitsgründen bieten wir ohne einen gültigen Veröffentlichungsindex keinen Download an.',
    retry: 'Erneut versuchen',
    emptyTitle: 'Derzeit steht kein Beta-Plugin zum Download bereit.',
    emptyText: 'Sobald eine geprüfte Version veröffentlicht ist, erscheint sie hier.',
    guideTitle: 'Plugin in drei Schritten einrichten',
    guideIntro: 'Lass deinen ursprünglichen SkillPilot-Tab geöffnet und führe die Einrichtung hier einmalig in Claude Web durch.',
    stepDownloadTitle: 'Plugin-Datei herunterladen',
    stepDownloadBody: 'Lade die unten angebotene, von SkillPilot geprüfte Version herunter.',
    stepInstallTitle: 'In Claude Web hochladen',
    stepInstallBody: 'Öffne Claude Web und wähle Customize („Anpassen“) → Plugins. Lade dort die heruntergeladene .plugin-Datei hoch.',
    openClaudeWeb: 'Claude Web öffnen',
    stepReturnTitle: 'Zu SkillPilot zurückkehren',
    stepReturnBody: 'Wechsle zurück zum ursprünglichen SkillPilot-Tab und wähle „Schritt 2: Mit Claude starten“. Beim ersten Zugriff führt Claude dich bei Bedarf durch die einmalige SkillPilot-Anmeldung.',
    returnToSkillPilot: 'Zurück zu SkillPilot',
    technicalDetails: 'Version und technische Prüfdaten',
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
    planDetail: 'Andere bezahlte Claude-Tarife können Plugins technisch ebenfalls unterstützen, gehören aber nicht zu diesem SkillPilot-Beta-Supportpfad.',
    install: 'Öffne in Claude Web Customize → Plugins und lade dort die benutzerdefinierte .plugin-Datei hoch.',
    connectAndStart: 'Nach dem Upload ist SkillPilot im Plugin verfügbar. Beim ersten Lernstart führt Claude dich bei Bedarf durch die einmalige SkillPilot-Anmeldung. Jede weitere Lernsession startest du wieder auf SkillPilot.com.',
    android: 'Die anschließende Nutzung in Claude für Android wurde mit demselben Claude-Konto getestet. Interaktive UI-Komponenten können dabei je nach Client oder Turn fehlen; Aufgaben bleiben über Text oder Sprache vollständig lösbar.',
    voiceTested: 'Der Voice Mode wurde von SkillPilot im Beta-Test erprobt. Interaktive UI-Komponenten werden darin nicht durchgängig garantiert. Das ist keine Funktionsgarantie von Anthropic.',
    voiceUntested: 'Der Voice Mode gehört nicht zum getesteten Umfang dieser Version.',
    update: 'Updates erfolgen manuell: neue Version hier herunterladen und erneut installieren.',
    independentTitle: 'Unabhängiger Beta-Test',
    independentText: 'Dieses Plugin wird von SkillPilot bereitgestellt. Es ist nicht offiziell von Anthropic verifiziert, gesponsert oder garantiert.',
    testedSurfaces: 'Getestete Oberflächen',
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
    subtitle: 'Guided beta setup for the SkillPilot Claude Coach with Claude Pro.',
    betaNotice: 'Beta download',
    betaDescription: 'This direct download is the beta route currently supported by SkillPilot. The plugin is not published in the official Anthropic marketplace.',
    loading: 'Loading the current plugin version …',
    loadErrorTitle: 'The plugin version could not be loaded.',
    loadErrorText: 'Please try again later. For security reasons, no download is offered without a valid publication index.',
    retry: 'Try again',
    emptyTitle: 'There is currently no beta plugin available for download.',
    emptyText: 'A reviewed version will appear here as soon as it is published.',
    guideTitle: 'Set up the plugin in three steps',
    guideIntro: 'Keep your original SkillPilot tab open and complete this one-time setup in Claude Web.',
    stepDownloadTitle: 'Download the plugin file',
    stepDownloadBody: 'Download the SkillPilot-verified version offered below.',
    stepInstallTitle: 'Upload it in Claude Web',
    stepInstallBody: 'Open Claude Web and choose Customize → Plugins. Upload the downloaded .plugin file there.',
    openClaudeWeb: 'Open Claude Web',
    stepReturnTitle: 'Return to SkillPilot',
    stepReturnBody: 'Return to your original SkillPilot tab and select “Step 2: Start with Claude.” On first access, Claude will guide you through the one-time SkillPilot sign-in if needed.',
    returnToSkillPilot: 'Return to SkillPilot',
    technicalDetails: 'Version and technical verification details',
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
    planDetail: 'Other paid Claude plans may technically support plugins as well, but they are outside this SkillPilot beta support route.',
    install: 'In Claude Web, open Customize → Plugins and upload the custom .plugin file there.',
    connectAndStart: 'After the upload, SkillPilot is available in the plugin. On your first learning start, Claude will guide you through the one-time SkillPilot sign-in if needed. Start every later learning session on SkillPilot.com again.',
    android: 'Subsequent use in Claude for Android was tested with the same Claude account. Interactive UI components may be absent depending on the client or turn; tasks remain fully solvable through text or speech.',
    voiceTested: 'Voice mode was exercised in SkillPilot beta testing. Interactive UI components are not guaranteed consistently there. This is not a functionality guarantee from Anthropic.',
    voiceUntested: 'Voice mode is outside the tested scope of this version.',
    update: 'Updates are manual: download the new version here and install it again.',
    independentTitle: 'Independent beta test',
    independentText: 'This plugin is provided by SkillPilot. It is not officially verified, sponsored, or guaranteed by Anthropic.',
    testedSurfaces: 'Tested surfaces',
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
  plugin: ClaudePluginPublication
  preparedAt: string
  language: SupportedLanguage
}

const PublicationCard: React.FC<PublicationCardProps> = ({ plugin, preparedAt, language }) => {
  const text = copy[language]
  const supportHref = `mailto:${plugin.supportEmail}`
  const externalLinks = [
    {
      label: text.officialGuide,
      href: 'https://support.claude.com/en/articles/13837440-use-plugins-in-claude',
    },
    { label: text.source, href: plugin.sourceUrl },
    { label: text.privacy, href: plugin.privacyUrl },
    { label: text.terms, href: plugin.termsUrl },
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
              {plugin.name}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {text.betaDescription}
            </p>
          </div>
          <FileArchive size={44} className="shrink-0 text-sky-700 dark:text-sky-300" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <section
          data-testid="claude-plugin-install-guide"
          aria-labelledby={`${plugin.id}-install-guide`}
          className="rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25 sm:p-6"
        >
          <h3 id={`${plugin.id}-install-guide`} className="text-xl font-semibold text-slate-900 dark:text-white">
            {text.guideTitle}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text.guideIntro}</p>
          <ol className="mt-5 grid gap-4 lg:grid-cols-3">
            <li data-testid="claude-plugin-install-step-download" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">1</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepDownloadTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepDownloadBody}</p>
                </div>
              </div>
              <a
                href={plugin.downloadUrl}
                download={plugin.filename}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-offset-slate-900"
              >
                <Download size={18} aria-hidden="true" />
                {text.download}
              </a>
            </li>
            <li data-testid="claude-plugin-install-step-upload" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">2</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{text.stepInstallTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{text.stepInstallBody}</p>
                </div>
              </div>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-950/50"
              >
                {text.openClaudeWeb}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </li>
            <li data-testid="claude-plugin-install-step-return" className="flex flex-col rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900/70">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">3</span>
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

        <details className="rounded-2xl border border-border-color bg-slate-50 p-4 dark:bg-slate-950/35">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            {text.technicalDetails}
          </summary>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-slate-800/70">
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.status}</dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                {plugin.status === 'beta' ? text.betaStatus : plugin.status}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-slate-800/70">
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.version}</dt>
              <dd className="mt-1 font-mono font-semibold text-slate-900 dark:text-white">{plugin.version}</dd>
            </div>
            <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-slate-800/70">
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.preparedAt}</dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{formatPreparedAt(preparedAt, language)}</dd>
            </div>
            <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-slate-800/70">
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.fileSize}</dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{formatBytes(plugin.bytes, language)}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.checksum}</p>
            <code className="mt-2 block break-all rounded-xl border border-border-color bg-slate-950 px-4 py-3 text-xs leading-relaxed text-emerald-300 sm:text-sm">
              {plugin.sha256}
            </code>
          </div>
        </details>

        <section aria-labelledby={`${plugin.id}-requirements`}>
          <h3 id={`${plugin.id}-requirements`} className="text-xl font-semibold text-slate-900 dark:text-white">
            {text.requirementsTitle}
          </h3>
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            <li className="flex gap-3 rounded-2xl border border-border-color p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" size={22} aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{text.age(plugin.requirements.minimumAge)}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{text.supportedPlan}</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatPlan(plugin.requirements.plan)}</p>
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
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatSurface(plugin.requirements.installSurface, language)}</p>
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
                  {plugin.requirements.testedSurfaces.map((surface) => formatSurface(surface, language)).join(' · ')}
                </p>
              </div>
            </li>
            <li className="flex gap-3 rounded-2xl border border-border-color p-4">
              <Volume2 className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" size={22} aria-hidden="true" />
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {plugin.requirements.voiceMode ? text.voiceTested : text.voiceUntested}
              </p>
            </li>
            <li className="flex gap-3 rounded-2xl border border-border-color p-4 lg:col-span-2">
              <RefreshCw className="mt-0.5 shrink-0 text-slate-700 dark:text-slate-300" size={22} aria-hidden="true" />
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">{text.update}</p>
            </li>
          </ul>
        </section>

        <aside className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <h3 className="font-semibold text-amber-950 dark:text-amber-100">{text.independentTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-950 dark:text-amber-100">{text.independentText}</p>
        </aside>

        <section aria-labelledby={`${plugin.id}-links`}>
          <h3 id={`${plugin.id}-links`} className="text-lg font-semibold text-slate-900 dark:text-white">{text.links}</h3>
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

  const cards = useMemo(() => (
    publication?.plugins.map((plugin) => (
      <PublicationCard
        key={plugin.id}
        plugin={plugin}
        preparedAt={publication.preparedAt}
        language={selectedLanguage}
      />
    )) ?? []
  ), [publication, selectedLanguage])

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
          {!publication && !loadError && (
            <div className="flex items-center gap-3 rounded-2xl border border-border-color bg-white/70 p-5 text-text-secondary dark:bg-slate-900/50" role="status">
              <CalendarClock className="animate-pulse" size={22} aria-hidden="true" />
              {text.loading}
            </div>
          )}

          {loadError && (
            <section className="rounded-3xl border border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30" role="alert">
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">{text.loadErrorTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-900 dark:text-red-100">{text.loadErrorText}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50 dark:focus-visible:ring-offset-red-950"
              >
                <RefreshCw size={18} aria-hidden="true" />
                {text.retry}
              </button>
            </section>
          )}

          {publication && publication.plugins.length === 0 && (
            <section className="rounded-3xl border border-border-color bg-white/70 p-6 dark:bg-slate-900/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{text.emptyTitle}</h2>
              <p className="mt-2 text-text-secondary">{text.emptyText}</p>
            </section>
          )}

          {cards.length > 0 && <div className="space-y-8">{cards}</div>}
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
