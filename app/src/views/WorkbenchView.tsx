import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Blocks, BookOpenText, Gauge, Home, Layers3, ListChecks, Network, Split, Wrench } from 'lucide-react'
import { LanguageToggle } from '../components/LanguageToggle'
import { PublicPageHeader } from '../components/PublicPageHeader'
import { useLanguage } from '../contexts/LanguageContext'

interface WorkbenchTool {
  title: string
  path: string
  description: string
  scope: string
  group: 'authoring' | 'maintenance'
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const WORKBENCH_COPY = {
  de: {
    badge: 'Lokale Tools',
    title: 'Workbench',
    subtitle: 'Zentrale Einstiegsseite für lokale Editor- und Wartungstools in SkillPilot.',
    introTitle: 'Was ist hier gebündelt?',
    introText: 'Alle lokalen Browser-Tools, die direkt mit Repo-Dateien arbeiten, sind hier an einer Stelle gesammelt. So bleibt sichtbar, welches Tool für welchen Eingriff gedacht ist.',
    localNoteTitle: 'Lokaler Modus',
    localNoteText: 'Diese Oberflächen sind für die lokale Entwicklungs- und Authoring-Umgebung gedacht. Sie arbeiten über die internen lokalen Endpunkte der App auf Dateien im Repository.',
    groups: {
      authoring: 'Curriculum Authoring',
      maintenance: 'Wartung und Inhalte',
    },
    labels: {
      scope: 'Zuständig für',
      route: 'Route',
      open: 'Öffnen',
      backHome: 'Startseite',
      toolCount: 'Tools',
    },
  },
  en: {
    badge: 'Local Tools',
    title: 'Workbench',
    subtitle: 'Central entry page for local editor and maintenance tools in SkillPilot.',
    introTitle: 'What is bundled here?',
    introText: 'All local browser tools that work directly on repository files are collected here. This keeps the available tooling visible and makes the intended scope of each tool explicit.',
    localNoteTitle: 'Local mode',
    localNoteText: 'These interfaces are intended for the local development and authoring environment. They operate on repository files through the app\'s internal local endpoints.',
    groups: {
      authoring: 'Curriculum Authoring',
      maintenance: 'Maintenance and Content',
    },
    labels: {
      scope: 'Responsible for',
      route: 'Route',
      open: 'Open',
      backHome: 'Home',
      toolCount: 'Tools',
    },
  },
} as const

const TOOL_DEFINITIONS: Record<'de' | 'en', WorkbenchTool[]> = {
  de: [
    {
      title: 'Canonical Cluster Editor',
      path: '/canonical-cluster-editor',
      description: 'Pflegt kanonische Cluster, contains-Struktur und direkte Kindreihenfolge in kanonischen Graphen.',
      scope: 'fachliche Clusterstruktur und Baumordnung im kanonischen Graphen',
      group: 'authoring',
      icon: Blocks,
    },
    {
      title: 'Composition View Editor',
      path: '/composition-view-editor',
      description: 'Erstellt scope-spezifische Learner-Trees, ohne den kanonischen Graphen selbst umzubauen.',
      scope: 'learner-facing Composition Views und sichtbare Default-Trees',
      group: 'authoring',
      icon: Layers3,
    },
    {
      title: 'Graph Editor (requires)',
      path: '/graph-editor',
      description: 'Bereinigt und verfeinert requires-Relationen, vor allem beim Umbau von Cluster- auf atomare Voraussetzungen.',
      scope: 'didaktische Sequenzierung über requires',
      group: 'maintenance',
      icon: Network,
    },
    {
      title: 'Flashcard Deck Editor',
      path: '/flashcard-editor',
      description: 'Bearbeitet Flashcard-Decks mit Live-Vorschau für Vorder- und Rückseite.',
      scope: 'Deck-Dateien, Karteninhalte und Preview für SRS-Material',
      group: 'maintenance',
      icon: BookOpenText,
    },
    {
      title: 'Semantic Atomicity Review',
      path: '/semantic-atomicity-review',
      description: 'Pflegt Findings-Dateien zur semantischen Atomarität; die Bulkprüfung selbst läuft über Codex/CLI.',
      scope: 'Review-Ledger, Entwickler-Queue und Fingerprint-Status technischer Blattziele',
      group: 'maintenance',
      icon: ListChecks,
    },
    {
      title: 'Curriculum Quality Dashboard',
      path: '/quality-dashboard',
      description: 'Zeigt generierte Qualitätsstände, Reifegrade und offene Regelverletzungen pro Curriculum.',
      scope: 'persistierte QA-Status-Snapshots unter docs/qa-ci/status',
      group: 'maintenance',
      icon: Gauge,
    },
    {
      title: 'Curriculum Mapping Workbench',
      path: '/curriculum-mapping-workbench',
      description: 'Zeigt Source-Snapshot und SkillPilot-Tree nebeneinander und macht Mapping-Belege bidirektional anklickbar.',
      scope: 'Source-Snapshots, Mapping-Dateien, Source-Closure und learner-facing Composition Views',
      group: 'maintenance',
      icon: Split,
    },
  ],
  en: [
    {
      title: 'Canonical Cluster Editor',
      path: '/canonical-cluster-editor',
      description: 'Maintains canonical clusters, contains structure, and direct child order in canonical graphs.',
      scope: 'content cluster structure and tree ordering in the canonical graph',
      group: 'authoring',
      icon: Blocks,
    },
    {
      title: 'Composition View Editor',
      path: '/composition-view-editor',
      description: 'Authors scope-specific learner trees without reshaping the canonical graph itself.',
      scope: 'learner-facing composition views and default visible trees',
      group: 'authoring',
      icon: Layers3,
    },
    {
      title: 'Graph Editor (requires)',
      path: '/graph-editor',
      description: 'Cleans up and refines requires relations, especially when moving from cluster to atomic prerequisites.',
      scope: 'didactic sequencing through requires',
      group: 'maintenance',
      icon: Network,
    },
    {
      title: 'Flashcard Deck Editor',
      path: '/flashcard-editor',
      description: 'Edits flashcard decks with live front and back preview.',
      scope: 'deck files, card content, and preview for SRS material',
      group: 'maintenance',
      icon: BookOpenText,
    },
    {
      title: 'Semantic Atomicity Review',
      path: '/semantic-atomicity-review',
      description: 'Maintains semantic atomicity findings files; the semantic bulk review itself runs through Codex/CLI.',
      scope: 'review ledgers, developer queue, and fingerprint status for technical leaf goals',
      group: 'maintenance',
      icon: ListChecks,
    },
    {
      title: 'Curriculum Quality Dashboard',
      path: '/quality-dashboard',
      description: 'Shows generated quality status, maturity levels, and open rule findings per curriculum.',
      scope: 'persisted QA status snapshots under docs/qa-ci/status',
      group: 'maintenance',
      icon: Gauge,
    },
    {
      title: 'Curriculum Mapping Workbench',
      path: '/curriculum-mapping-workbench',
      description: 'Shows source snapshot and SkillPilot tree side by side with bidirectional evidence navigation.',
      scope: 'source snapshots, mapping files, source closure, and learner-facing composition views',
      group: 'maintenance',
      icon: Split,
    },
  ],
}

export const WorkbenchView: React.FC = () => {
  const { language } = useLanguage()
  const copy = WORKBENCH_COPY[language]
  const tools = TOOL_DEFINITIONS[language]
  const authoringTools = tools.filter((tool) => tool.group === 'authoring')
  const maintenanceTools = tools.filter((tool) => tool.group === 'maintenance')

  const renderToolCard = (tool: WorkbenchTool) => {
    const Icon = tool.icon
    return (
      <Link
        key={tool.path}
        to={tool.path}
        className="group rounded-2xl border border-border-color bg-white/70 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-lg dark:bg-slate-900/70"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-text-primary">{tool.title}</h2>
              <p className="mt-1 text-sm text-text-secondary">{tool.description}</p>
            </div>
          </div>
          <ArrowRight className="mt-1 shrink-0 text-text-secondary transition-transform duration-200 group-hover:translate-x-1 group-hover:text-sky-500" size={18} />
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.labels.scope}</dt>
            <dd className="mt-1 text-text-primary">{tool.scope}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.labels.route}</dt>
            <dd className="mt-1 font-mono text-xs text-sky-700 dark:text-sky-300">{tool.path}</dd>
          </div>
        </dl>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition-colors group-hover:text-sky-500 dark:text-sky-300">
          <span>{copy.labels.open}</span>
          <ArrowRight size={16} />
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-chat-bg p-4 text-text-primary md:p-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                <Wrench size={14} />
                <span>{copy.badge}</span>
              </div>
              <PublicPageHeader
                align="left"
                title={copy.title}
                subtitle={copy.subtitle}
              />
            </div>

            <div className="flex items-center gap-2 self-start">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Home size={16} />
                <span>{copy.labels.backHome}</span>
              </Link>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-border-color bg-white/70 p-5 backdrop-blur-sm dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold">{copy.introTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy.introText}</p>
          </div>

          <div className="rounded-2xl border border-border-color bg-white/70 p-5 backdrop-blur-sm dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold">{copy.localNoteTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{copy.localNoteText}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border-color px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <span>{copy.labels.toolCount}</span>
              <span className="text-text-primary">{tools.length}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              <Blocks size={18} />
            </div>
            <h2 className="text-xl font-semibold">{copy.groups.authoring}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {authoringTools.map(renderToolCard)}
          </div>
        </section>

        <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              <BookOpenText size={18} />
            </div>
            <h2 className="text-xl font-semibold">{copy.groups.maintenance}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {maintenanceTools.map(renderToolCard)}
          </div>
        </section>
      </div>
    </div>
  )
}
