import React from 'react'
import {
  Check,
  Clock3,
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react'

import type { LabelLanguage } from '../utils/filterLabels'
import {
  getCoachProviderMatrixCopy,
  type CoachMatrixCell,
  type CoachMatrixProvider,
  type CoachMatrixStatus,
} from '../utils/coachProviderMatrixCopy'

const statusStyles: Record<CoachMatrixStatus, string> = {
  available: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200',
  tested: 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-950/70 dark:text-sky-200',
  conditional: 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-200',
  planned: 'border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-950/70 dark:text-violet-200',
  unavailable: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  admin: 'border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-700 dark:bg-orange-950/70 dark:text-orange-200',
}

const StatusIcon: React.FC<{ status: CoachMatrixStatus }> = ({ status }) => {
  if (status === 'unavailable') return <X size={15} aria-hidden="true" />
  if (status === 'conditional') return <TriangleAlert size={15} aria-hidden="true" />
  if (status === 'planned') return <Clock3 size={15} aria-hidden="true" />
  if (status === 'admin') return <ShieldCheck size={15} aria-hidden="true" />
  return <Check size={15} aria-hidden="true" />
}

const MatrixCell: React.FC<{
  cell: CoachMatrixCell
  statusLabel: string
}> = ({ cell, statusLabel }) => (
  <div className="space-y-2">
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[cell.status]}`}
    >
      <StatusIcon status={cell.status} />
      {statusLabel}
    </span>
    <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">{cell.value}</p>
    {cell.note && (
      <p className="text-xs leading-relaxed text-text-secondary">{cell.note}</p>
    )}
  </div>
)

export const CoachProviderMatrix: React.FC<{ language: LabelLanguage }> = ({ language }) => {
  const copy = getCoachProviderMatrixCopy(language)
  const [selectedProvider, setSelectedProvider] = React.useState<CoachMatrixProvider>('ChatGPT')
  const visibleVariants = copy.variants.filter(variant => variant.provider === selectedProvider)

  return (
    <section
      aria-labelledby="coach-provider-matrix-title"
      className="mt-8 w-full"
    >
      <div className="rounded-3xl border border-border-color bg-white/60 p-5 shadow-sm dark:bg-slate-900/40 sm:p-7">
        <div className="max-w-4xl">
          <h2 id="coach-provider-matrix-title" className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            {copy.title}
          </h2>
          <p className="mt-3 leading-relaxed text-text-secondary">{copy.intro}</p>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{copy.asOf}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2" aria-label={copy.legendLabel}>
          <span className="mr-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.legendLabel}:</span>
          {(Object.keys(copy.statusLabels) as CoachMatrixStatus[]).map((status) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
            >
              <StatusIcon status={status} />
              {copy.statusLabels[status]}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <aside className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 dark:border-sky-800 dark:bg-sky-950/30">
            <h3 className="font-semibold text-sky-900 dark:text-sky-200">{copy.startTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{copy.startText}</p>
          </aside>
          <aside className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 dark:border-amber-700 dark:bg-amber-950/30">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">{copy.privacyTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{copy.privacyText}</p>
          </aside>
        </div>

        <fieldset className="mt-6" aria-describedby="coach-provider-filter-hint">
          <legend className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {copy.providerFilterLabel}
          </legend>
          <p id="coach-provider-filter-hint" className="mt-1 text-sm text-text-secondary">
            {copy.providerFilterHint}
          </p>
          <div className="mt-3 inline-flex rounded-xl border border-border-color bg-slate-100 p-1 dark:bg-slate-950/70">
            {(['ChatGPT', 'Claude'] as CoachMatrixProvider[]).map(provider => {
              const isSelected = selectedProvider === provider
              return (
                <label key={provider} className="cursor-pointer">
                  <input
                    type="radio"
                    name="coach-provider-filter"
                    value={provider}
                    checked={isSelected}
                    onChange={() => setSelectedProvider(provider)}
                    aria-controls="coach-provider-results"
                    className="peer sr-only"
                  />
                  <span
                    className={`block rounded-lg px-4 py-2 text-sm font-semibold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-slate-950 ${isSelected
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                  >
                    {provider}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div id="coach-provider-results">
          <div className="mt-6 space-y-3 sm:hidden">
            {visibleVariants.map((variant) => (
            <details
              key={variant.id}
              className={`group rounded-2xl border bg-white/80 shadow-sm dark:bg-slate-950/40 ${variant.badge ? 'border-emerald-400 dark:border-emerald-700' : 'border-border-color'}`}
            >
              <summary className="cursor-pointer list-none rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{variant.provider}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{variant.plan}</h3>
                    {variant.badge && (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        {variant.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-xl leading-none text-text-secondary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{variant.summary}</p>
              </summary>

              <div className="border-t border-border-color px-4 pb-5 pt-4">
                <h4 className="sr-only">{copy.mobileFeatureHeading}</h4>
                {copy.groups.map((group) => (
                  <div key={group.id} className="mt-5 first:mt-0">
                    <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {group.title}
                    </h5>
                    <dl className="mt-3 divide-y divide-border-color">
                      {group.rows.map((row) => {
                        const matrixCell = row.cells[variant.id]
                        return (
                          <div key={row.id} className="py-4 first:pt-0">
                            <dt className="text-sm font-semibold text-slate-800 dark:text-slate-100">{row.feature}</dt>
                            <dd className="mt-2">
                              <MatrixCell cell={matrixCell} statusLabel={copy.statusLabels[matrixCell.status]} />
                            </dd>
                          </div>
                        )
                      })}
                    </dl>
                  </div>
                ))}
              </div>
            </details>
            ))}
          </div>

          <div
            className="mt-6 hidden overflow-x-auto rounded-2xl border border-border-color bg-white dark:bg-slate-950/50 sm:block"
            role="region"
            aria-label={`${copy.title}: ${selectedProvider}`}
            tabIndex={0}
          >
            <table
              className={`${selectedProvider === 'ChatGPT' ? 'min-w-[1260px]' : 'min-w-[1020px]'} w-full border-collapse text-left`}
            >
            <caption className="sr-only">{copy.title}</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-30 w-[260px] min-w-[260px] border-b border-r border-border-color bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  {copy.featureHeading}
                </th>
                {visibleVariants.map((variant) => (
                  <th
                    key={variant.id}
                    scope="col"
                    className={`w-[250px] min-w-[250px] border-b border-border-color px-4 py-4 align-top ${variant.badge ? 'bg-emerald-50 dark:bg-emerald-950/70' : 'bg-slate-100 dark:bg-slate-900'}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{variant.provider}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{variant.plan}</p>
                    {variant.badge && (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-200/80 px-2.5 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                        {variant.badge}
                      </span>
                    )}
                    <p className="mt-2 text-xs font-normal leading-relaxed text-text-secondary">{variant.summary}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.groups.map((group) => (
                <React.Fragment key={group.id}>
                  <tr>
                    <th
                      colSpan={visibleVariants.length + 1}
                      className="border-b border-border-color bg-slate-800 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white dark:bg-slate-700"
                    >
                      {group.title}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-b border-r border-border-color bg-white px-4 py-4 text-sm font-semibold text-slate-800 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {row.feature}
                      </th>
                      {visibleVariants.map((variant) => {
                        const matrixCell = row.cells[variant.id]
                        return (
                          <td key={variant.id} className="border-b border-border-color px-4 py-4">
                            <MatrixCell cell={matrixCell} statusLabel={copy.statusLabels[matrixCell.status]} />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            </table>
          </div>
        </div>

        <p className="mt-5 max-w-5xl text-sm leading-relaxed text-text-secondary">{copy.caveat}</p>

        <div className="mt-5 max-w-5xl border-t border-border-color pt-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{copy.sourcesTitle}</h3>
          <p className="mt-1 text-sm text-text-secondary">{copy.sourcesNote}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {copy.sources.map((source) => (
              <a
                key={source.id}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                {source.label}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
