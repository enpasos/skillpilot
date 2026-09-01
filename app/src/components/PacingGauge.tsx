import * as React from 'react'

// Direct TSX regression scripts use the classic JSX runtime for this shared
// component, while the application build uses the automatic runtime.
void React

export type PacingGaugeStatus = 'unavailable' | 'provisional' | 'behind' | 'watch' | 'on-track' | 'ahead'

export interface PacingGaugeProps {
  actual?: number
  target?: number
  max?: number
  status: PacingGaugeStatus
  label: string
  valueLabel: string
  targetLabel?: string
  unavailableReason?: string
  statusLabel?: string
}

type Point = {
  x: number
  y: number
}

const CENTER_X = 120
const CENTER_Y = 116
const ARC_RADIUS = 88

const STATUS_PRESENTATION: Record<
  PacingGaugeStatus,
  { label: string; className: string }
> = {
  unavailable: {
    label: 'Nicht verfügbar',
    className:
      'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  provisional: {
    label: 'Vorläufig',
    className:
      'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  behind: {
    label: 'Hinter dem Soll',
    className:
      'border-red-300 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200',
  },
  watch: {
    label: 'Im Blick behalten',
    className:
      'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100',
  },
  'on-track': {
    label: 'Im Plan',
    className:
      'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  ahead: {
    label: 'Vor dem Soll',
    className:
      'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200',
  },
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const isFiniteNonNegative = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

const pointOnGauge = (ratio: number, radius: number): Point => {
  const angle = Math.PI * (1 - clamp(ratio, 0, 1))
  return {
    x: CENTER_X + radius * Math.cos(angle),
    y: CENTER_Y - radius * Math.sin(angle),
  }
}

const arcPath = (startRatio: number, endRatio: number) => {
  const start = pointOnGauge(startRatio, ARC_RADIUS)
  const end = pointOnGauge(endRatio, ARC_RADIUS)
  return `M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${end.x} ${end.y}`
}

const formatFallbackNumber = (value: number) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value)

export const PacingGauge = ({
  actual,
  target,
  max,
  status,
  label,
  valueLabel,
  targetLabel,
  unavailableReason,
  statusLabel,
}: PacingGaugeProps) => {
  const hasUsableValues =
    status !== 'unavailable' &&
    isFiniteNonNegative(actual) &&
    isFiniteNonNegative(target) &&
    target > 0 &&
    (max === undefined || (Number.isFinite(max) && max > 0))
  const effectiveStatus: PacingGaugeStatus = hasUsableValues ? status : 'unavailable'
  const presentation = STATUS_PRESENTATION[effectiveStatus]
  const visibleStatusLabel = statusLabel ?? presentation.label

  const scaleMax = hasUsableValues
    ? Math.max(max ?? 0, actual * 1.08, target * 1.25, 1)
    : 1
  const actualRatio = hasUsableValues ? clamp(actual / scaleMax, 0, 1) : 0
  const targetRatio = hasUsableValues ? clamp(target / scaleMax, 0, 1) : 0

  const redEnd = targetRatio * 0.75
  const amberEnd = targetRatio * 0.9
  const greenEnd = Math.min(targetRatio * 1.1, 1)
  const actualPoint = pointOnGauge(actualRatio, 68)
  const targetMarkInner = pointOnGauge(targetRatio, 75)
  const targetMarkOuter = pointOnGauge(targetRatio, 101)

  const visibleTargetLabel = hasUsableValues
    ? targetLabel ?? `Soll: ${formatFallbackNumber(target)}`
    : undefined
  const visibleUnavailableReason =
    effectiveStatus === 'unavailable'
      ? unavailableReason ?? 'Für diese Anzeige fehlen verlässliche Daten.'
      : undefined
  const accessibleDescription = [
    label,
    `Status: ${visibleStatusLabel}.`,
    effectiveStatus === 'unavailable' ? visibleUnavailableReason : valueLabel,
    visibleTargetLabel,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <figure
      className="w-full rounded-xl border border-border-color bg-white/70 p-4 shadow-sm dark:bg-slate-900/50"
      data-status={effectiveStatus}
    >
      <figcaption className="flex flex-wrap items-start justify-between gap-2">
        <span className="min-w-0 text-sm font-semibold text-text-primary">{label}</span>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${presentation.className}`}
        >
          {visibleStatusLabel}
        </span>
      </figcaption>

      <svg
        viewBox="0 0 240 132"
        className="mx-auto mt-2 block h-auto w-full max-w-sm overflow-visible"
        role="img"
        aria-label={accessibleDescription}
      >
        <title>{label}</title>
        <desc>{accessibleDescription}</desc>

        <path
          d={arcPath(0, 1)}
          fill="none"
          strokeWidth="17"
          strokeLinecap="butt"
          className="stroke-slate-200 dark:stroke-slate-700"
        />

        {hasUsableValues ? (
          <>
            {effectiveStatus === 'provisional' ? (
              <path
                d={arcPath(0, 1)}
                fill="none"
                strokeWidth="14"
                strokeLinecap="butt"
                className="stroke-slate-400 dark:stroke-slate-500"
              />
            ) : (
              <>
                <path
                  d={arcPath(0, redEnd)}
                  fill="none"
                  strokeWidth="14"
                  strokeLinecap="butt"
                  className="stroke-red-500 dark:stroke-red-400"
                />
                <path
                  d={arcPath(redEnd, amberEnd)}
                  fill="none"
                  strokeWidth="14"
                  strokeLinecap="butt"
                  className="stroke-amber-400 dark:stroke-amber-300"
                />
                <path
                  d={arcPath(amberEnd, greenEnd)}
                  fill="none"
                  strokeWidth="14"
                  strokeLinecap="butt"
                  className="stroke-emerald-500 dark:stroke-emerald-400"
                />
                <path
                  d={arcPath(greenEnd, 1)}
                  fill="none"
                  strokeWidth="14"
                  strokeLinecap="butt"
                  className="stroke-sky-500 dark:stroke-sky-400"
                />
              </>
            )}

            <line
              x1={targetMarkInner.x}
              y1={targetMarkInner.y}
              x2={targetMarkOuter.x}
              y2={targetMarkOuter.y}
              strokeWidth="7"
              strokeLinecap="round"
              className="stroke-white dark:stroke-slate-950"
              aria-hidden="true"
            />
            <line
              x1={targetMarkInner.x}
              y1={targetMarkInner.y}
              x2={targetMarkOuter.x}
              y2={targetMarkOuter.y}
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-slate-800 dark:stroke-slate-100"
              aria-hidden="true"
            />

            <line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={actualPoint.x}
              y2={actualPoint.y}
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-slate-800 dark:stroke-slate-100"
              aria-hidden="true"
            />
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r="8"
              className="fill-slate-800 stroke-white dark:fill-slate-100 dark:stroke-slate-950"
              strokeWidth="3"
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <line
              x1={CENTER_X - 17}
              y1={CENTER_Y - 33}
              x2={CENTER_X + 17}
              y2={CENTER_Y - 33}
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-slate-400 dark:stroke-slate-500"
              aria-hidden="true"
            />
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r="7"
              className="fill-slate-400 dark:fill-slate-500"
              aria-hidden="true"
            />
          </>
        )}
      </svg>

      <div className="-mt-1 text-center">
        {effectiveStatus === 'unavailable' ? (
          <p className="text-sm text-text-secondary">{visibleUnavailableReason}</p>
        ) : (
          <>
            <p className="text-lg font-semibold tabular-nums text-text-primary">{valueLabel}</p>
            <p className="mt-1 inline-flex items-center justify-center gap-2 text-sm text-text-secondary">
              <span
                className="inline-block h-4 w-0.5 rounded-full bg-slate-800 dark:bg-slate-100"
                aria-hidden="true"
              />
              {visibleTargetLabel}
            </p>
          </>
        )}
      </div>
    </figure>
  )
}
