import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Gauge,
  Home,
  ListChecks,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react'
import { LanguageToggle } from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4'

interface RuleResult {
  id: string
  status: RuleStatus
  summary: string
  metrics?: Record<string, number>
  details?: string[]
}

interface ScopeStatus {
  scopeId: string
  label: string
  maturity: MaturityLevel
  selectedAtomicGoals: number
  rules: RuleResult[]
}

interface CurriculumStatus {
  landscapeId: string
  title: string
  subject?: string
  frameworkId?: string
  path: string
  maturity: MaturityLevel
  goals: number
  atomicGoals: number
  clusterGoals: number
  scopes: ScopeStatus[]
  rules: RuleResult[]
}

interface QualityStatusDocument {
  schemaVersion: 1
  rulesVersion: string
  generatedAt: string
  generatedBy: string
  summary: {
    curricula: number
    maturity: Record<MaturityLevel, number>
    ruleStatus: Record<RuleStatus, number>
  }
  curricula: CurriculumStatus[]
}

interface QualityStatusResponse {
  path: string
  status: QualityStatusDocument
}

const COPY = {
  de: {
    title: 'Curriculum Quality',
    subtitle: 'Statussicht auf generierte Qualitäts-Snapshots für kanonische Curricula.',
    badge: 'QA Dashboard',
    workbench: 'Workbench',
    home: 'Startseite',
    refresh: 'Aktualisieren',
    search: 'Curriculum suchen',
    maturity: 'Reifegrad',
    all: 'Alle',
    generated: 'Generiert',
    source: 'Statusdatei',
    curricula: 'Curricula',
    warnings: 'Warnungen',
    failures: 'Fehler',
    notConfigured: 'Nicht konfiguriert',
    goals: 'Ziele',
    atomic: 'Atomar',
    routeScopes: 'QA-Scopes',
    rules: 'Regeln',
    details: 'Details',
    noData: 'Kein Status geladen.',
    generateHint: 'Status mit npm run quality:curriculum-status erzeugen.',
    labels: {
      pass: 'Bestanden',
      warn: 'Warnung',
      fail: 'Fehler',
      not_configured: 'Nicht konfiguriert',
    },
  },
  en: {
    title: 'Curriculum Quality',
    subtitle: 'Status view over generated quality snapshots for canonical curricula.',
    badge: 'QA Dashboard',
    workbench: 'Workbench',
    home: 'Home',
    refresh: 'Refresh',
    search: 'Search curriculum',
    maturity: 'Maturity',
    all: 'All',
    generated: 'Generated',
    source: 'Status file',
    curricula: 'Curricula',
    warnings: 'Warnings',
    failures: 'Failures',
    notConfigured: 'Not configured',
    goals: 'Goals',
    atomic: 'Atomic',
    routeScopes: 'QA scopes',
    rules: 'Rules',
    details: 'Details',
    noData: 'No status loaded.',
    generateHint: 'Generate status with npm run quality:curriculum-status.',
    labels: {
      pass: 'Passed',
      warn: 'Warning',
      fail: 'Failed',
      not_configured: 'Not configured',
    },
  },
} as const

const statusIcon: Record<RuleStatus, React.ComponentType<{ size?: number; className?: string }>> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  not_configured: CircleDashed,
}

const statusClass: Record<RuleStatus, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300',
  fail: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
  not_configured: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const maturityClass: Record<MaturityLevel, string> = {
  M0: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  M1: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300',
  M2: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-300',
  M3: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
  M4: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300',
}

const maturityLevels: Array<'all' | MaturityLevel> = ['all', 'M0', 'M1', 'M2', 'M3', 'M4']

function collectRules(curriculum: CurriculumStatus): RuleResult[] {
  return [
    ...curriculum.rules,
    ...curriculum.scopes.flatMap((scope) => scope.rules),
  ]
}

function countStatus(curriculum: CurriculumStatus, status: RuleStatus): number {
  return collectRules(curriculum).filter((rule) => rule.status === status).length
}

function formatDate(value: string, language: 'de' | 'en'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const StatusBadge: React.FC<{ status: RuleStatus; label: string }> = ({ status, label }) => {
  const Icon = statusIcon[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[status]}`}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  )
}

const MaturityBadge: React.FC<{ level: MaturityLevel }> = ({ level }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${maturityClass[level]}`}>
    {level}
  </span>
)

export const CurriculumQualityDashboardView: React.FC = () => {
  const { language } = useLanguage()
  const copy = COPY[language]
  const [payload, setPayload] = useState<QualityStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [maturityFilter, setMaturityFilter] = useState<'all' | MaturityLevel>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/__quality-dashboard/status')
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string; command?: string }
        throw new Error(body.command ? `${body.error ?? response.statusText} ${body.command}` : body.error ?? response.statusText)
      }
      const nextPayload = await response.json() as QualityStatusResponse
      setPayload(nextPayload)
      setSelectedId((current) => current ?? nextPayload.status.curricula[0]?.landscapeId ?? null)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  const filteredCurricula = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language === 'de' ? 'de-DE' : 'en-US')
    return (payload?.status.curricula ?? []).filter((curriculum) => {
      const matchesQuery = !normalizedQuery
        || curriculum.title.toLocaleLowerCase(language === 'de' ? 'de-DE' : 'en-US').includes(normalizedQuery)
        || curriculum.path.toLocaleLowerCase('en-US').includes(normalizedQuery)
      const matchesMaturity = maturityFilter === 'all' || curriculum.maturity === maturityFilter
      return matchesQuery && matchesMaturity
    })
  }, [language, maturityFilter, payload, query])

  const selectedCurriculum = useMemo(() => {
    if (!payload) return null
    return payload.status.curricula.find((curriculum) => curriculum.landscapeId === selectedId)
      ?? filteredCurricula[0]
      ?? payload.status.curricula[0]
      ?? null
  }, [filteredCurricula, payload, selectedId])

  const summary = payload?.status.summary

  return (
    <div className="min-h-screen bg-chat-bg p-4 text-text-primary md:p-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                <Gauge size={14} />
                <span>{copy.badge}</span>
              </div>
              <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">{copy.title}</h1>
              <p className="mt-2 text-sm text-text-secondary md:text-base">{copy.subtitle}</p>
              {payload ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-secondary">
                  <span>{copy.generated}: {formatDate(payload.status.generatedAt, language)}</span>
                  <span>{copy.source}: {payload.path}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => void loadStatus()}
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>{copy.refresh}</span>
              </button>
              <Link
                to="/workbench"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft size={16} />
                <span>{copy.workbench}</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Home size={16} />
                <span>{copy.home}</span>
              </Link>
              <LanguageToggle />
            </div>
          </div>
        </header>

        {error ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <p>{error}</p>
            <p className="mt-1 font-mono text-xs">{copy.generateHint}</p>
          </section>
        ) : null}

        {summary ? (
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <div className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.curricula}</div>
              <div className="mt-2 text-2xl font-bold">{summary.curricula}</div>
            </div>
            <div className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.warnings}</div>
              <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-300">{summary.ruleStatus.warn}</div>
            </div>
            <div className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.failures}</div>
              <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-300">{summary.ruleStatus.fail}</div>
            </div>
            <div className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.notConfigured}</div>
              <div className="mt-2 text-2xl font-bold text-slate-600 dark:text-slate-300">{summary.ruleStatus.not_configured}</div>
            </div>
            {(['M0', 'M1', 'M2', 'M3'] as MaturityLevel[]).map((level) => (
              <div key={level} className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{level}</div>
                <div className="mt-2 text-2xl font-bold">{summary.maturity[level]}</div>
              </div>
            ))}
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
          <div className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70 md:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border-color px-3 py-2">
                <Search size={16} className="shrink-0 text-text-secondary" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.search}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {maturityLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setMaturityFilter(level)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      maturityFilter === level
                        ? 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                        : 'border-border-color text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {level === 'all' ? copy.all : level}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border-color text-xs uppercase tracking-wide text-text-secondary">
                  <tr>
                    <th className="py-2 pr-3">{copy.curricula}</th>
                    <th className="py-2 pr-3">{copy.maturity}</th>
                    <th className="py-2 pr-3 text-right">{copy.goals}</th>
                    <th className="py-2 pr-3 text-right">{copy.atomic}</th>
                    <th className="py-2 pr-3 text-right">{copy.routeScopes}</th>
                    <th className="py-2 pr-3 text-right">{copy.warnings}</th>
                    <th className="py-2 text-right">{copy.failures}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCurricula.map((curriculum) => (
                    <tr
                      key={curriculum.landscapeId}
                      className={`cursor-pointer border-b border-border-color/70 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/60 ${
                        selectedCurriculum?.landscapeId === curriculum.landscapeId ? 'bg-sky-50/70 dark:bg-sky-950/20' : ''
                      }`}
                      onClick={() => setSelectedId(curriculum.landscapeId)}
                    >
                      <td className="max-w-[280px] py-3 pr-3">
                        <div className="truncate font-semibold">{curriculum.title}</div>
                        <div className="truncate text-xs text-text-secondary">{curriculum.path}</div>
                      </td>
                      <td className="py-3 pr-3"><MaturityBadge level={curriculum.maturity} /></td>
                      <td className="py-3 pr-3 text-right tabular-nums">{curriculum.goals}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{curriculum.atomicGoals}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{curriculum.scopes.length}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-amber-600 dark:text-amber-300">{countStatus(curriculum, 'warn')}</td>
                      <td className="py-3 text-right tabular-nums text-red-600 dark:text-red-300">{countStatus(curriculum, 'fail')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-border-color bg-white/70 p-4 dark:bg-slate-900/70 md:p-5">
            {selectedCurriculum ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{selectedCurriculum.title}</h2>
                    <MaturityBadge level={selectedCurriculum.maturity} />
                  </div>
                  <div className="font-mono text-xs text-text-secondary">{selectedCurriculum.path}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl border border-border-color p-3">
                    <div className="text-xs text-text-secondary">{copy.goals}</div>
                    <div className="mt-1 text-lg font-semibold">{selectedCurriculum.goals}</div>
                  </div>
                  <div className="rounded-xl border border-border-color p-3">
                    <div className="text-xs text-text-secondary">{copy.atomic}</div>
                    <div className="mt-1 text-lg font-semibold">{selectedCurriculum.atomicGoals}</div>
                  </div>
                  <div className="rounded-xl border border-border-color p-3">
                    <div className="text-xs text-text-secondary">{copy.routeScopes}</div>
                    <div className="mt-1 text-lg font-semibold">{selectedCurriculum.scopes.length}</div>
                  </div>
                </div>

                {selectedCurriculum.scopes.length > 0 ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">{copy.routeScopes}</h3>
                    <div className="space-y-3">
                      {selectedCurriculum.scopes.map((scope) => (
                        <div key={scope.scopeId} className="rounded-xl border border-border-color p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="font-semibold">{scope.label}</div>
                            <MaturityBadge level={scope.maturity} />
                          </div>
                          <div className="space-y-2">
                            {scope.rules.map((rule) => (
                              <RuleRow key={`${scope.scopeId}-${rule.id}`} rule={rule} labels={copy.labels} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                    <ListChecks size={15} />
                    <span>{copy.rules}</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedCurriculum.rules.map((rule) => (
                      <RuleRow key={rule.id} rule={rule} labels={copy.labels} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-text-secondary">{copy.noData}</div>
            )}
          </aside>
        </section>
      </div>
    </div>
  )
}

const RuleRow: React.FC<{ rule: RuleResult; labels: Record<RuleStatus, string> }> = ({ rule, labels }) => {
  const [expanded, setExpanded] = useState(false)
  const metricEntries = Object.entries(rule.metrics ?? {})

  return (
    <div className="rounded-xl border border-border-color p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-xs font-semibold text-text-secondary">{rule.id}</div>
          <div className="mt-1 text-sm">{rule.summary}</div>
        </div>
        <StatusBadge status={rule.status} label={labels[rule.status]} />
      </div>
      {metricEntries.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {metricEntries.map(([key, value]) => (
            <span key={key} className="rounded-full border border-border-color px-2 py-1 text-xs text-text-secondary">
              {key}: <span className="font-semibold text-text-primary">{value}</span>
            </span>
          ))}
        </div>
      ) : null}
      {rule.details && rule.details.length > 0 ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="text-xs font-semibold text-sky-700 hover:text-sky-500 dark:text-sky-300"
          >
            Details
          </button>
          {expanded ? (
            <ul className="mt-2 space-y-1 text-xs text-text-secondary">
              {rule.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
