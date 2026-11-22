import React from 'react'
import { ArrowDownRight, Check, Layers3, Link2, Minus, Send, Target } from 'lucide-react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { LearningEntryProgress, LearningMapEntry } from './types'
import type { LayoutPort } from './layoutLearningScope'
import { getEntryKindLabel } from './presentation'

const sides = { WEST: Position.Left, EAST: Position.Right, NORTH: Position.Top, SOUTH: Position.Bottom }

export type LearningMapPracticeAction = { label: string; open: () => void }

export type LearningMapGoalAction = { title: string; context?: string; label: string; open: () => void }
export type MapNodeData = {
  entry: LearningMapEntry
  childCount: number
  outsideCount: number
  ports: LayoutPort[]
  active: boolean
  related: boolean
  muted: boolean
  progress?: LearningEntryProgress
  activeLearningGoal?: boolean
  unitEntry?: boolean
  language?: 'de' | 'en'
  goalAction?: LearningMapGoalAction
  practiceAction?: LearningMapPracticeAction
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}
export type LearningFlowNode = Node<MapNodeData, 'learningUnit'>

/** Evidence markers and accessible progress for graphic map nodes. */
function entryPresentation(entry: LearningMapEntry, childCount: number, progress: LearningEntryProgress | undefined,
  activeLearningGoal: boolean | undefined, language: 'de' | 'en' | undefined) {
  const english = language === 'en'
  const kindLabel = getEntryKindLabel(entry, language ?? 'de')
  const expandable = childCount > 0
  const total = progress?.total ?? 0
  const explicit = Math.min(total, Math.max(0, progress?.explicit ?? 0))
  const implicit = Math.min(total - explicit, Math.max(0, progress?.implicit ?? 0))
  const notRequired = Math.min(total - explicit - implicit, Math.max(0, progress?.notRequired ?? 0))
  const withEvidence = explicit + implicit
  const open = total - withEvidence - notRequired
  const counts = english
    ? `${explicit} directly demonstrated, ${implicit} credited through assessment, ${notRequired} no longer required for this section, ${open} open.`
    : `${explicit} direkt nachgewiesen, ${implicit} fachlich angerechnet, ${notRequired} für diesen Abschnitt nicht mehr erforderlich, ${open} offen.`
  const progressLabel = progress?.sectionTitle && (implicit || notRequired)
    ? `${counts} ${english ? 'Scope' : 'Geltungsbereich'}: ${progress.sectionTitle}` : counts
  const Icon = expandable ? Layers3 : withEvidence ? Check : notRequired ? Minus : activeLearningGoal ? Send : Target
  const status = explicit ? 'is-explicit' : implicit ? 'is-implicit' : notRequired ? 'is-not-required' : activeLearningGoal ? 'is-active' : progress ? 'is-open' : 'is-context'
  const marker = expandable ? undefined : explicit ? 'learning-map-direct-evidence' : implicit ? 'learning-map-credited-evidence'
    : notRequired ? 'learning-map-not-required' : undefined
  const statusLabel = explicit ? english ? 'Directly demonstrated' : 'Direkt nachgewiesen'
    : implicit ? (progress?.waiverLabel ?? (english ? 'Credited through assessment' : 'Fachlich angerechnet'))
    : notRequired ? (english ? 'No longer required for this section' : 'Für diesen Abschnitt nicht mehr erforderlich')
    : activeLearningGoal ? english ? 'Active learning goal' : 'Aktives Lernziel' : progress ? english ? 'Still open' : 'Noch offen' : kindLabel
  const meta = `${progress ? kindLabel : entry.eyebrow ?? kindLabel}${expandable ? (total ? ` · ${withEvidence}/${total} ${english ? 'with evidence' : 'mit Nachweis'}` : ` · ${childCount} ${english ? 'sections' : 'Bereiche'}`) : ''}`
  const preparationLabel = english ? 'Preparation' : 'Vorbereitung'
  const preparationTitle = english ? 'Added from outside the plan because a goal here needs it.'
    : 'Kommt von außerhalb des Plans hinzu, weil ein Ziel hier es braucht.'
  return { english, kindLabel, expandable, total, explicit, implicit, progressLabel, Icon, status, marker, statusLabel, meta, preparationLabel, preparationTitle }
}

function MapPracticeButton({ action, english }: { action: LearningMapPracticeAction; english: boolean }) {
  return <button type="button" className="lum-node-practice nodrag nopan" data-testid="learning-map-practice-action"
    aria-label={action.label} title={action.label} onClick={event => {
      event.stopPropagation()
      if (event.detail <= 1) action.open()
    }} onDoubleClick={event => event.stopPropagation()}>
    {english ? 'Practice' : 'Üben'}
  </button>
}

export const MapNode = React.memo(function MapNode({ data }: NodeProps<LearningFlowNode>) {
  const { entry, childCount, outsideCount, ports, active, related, muted, progress, activeLearningGoal,
    goalAction, practiceAction, onSelect, onOpen } = data
  const { english, kindLabel, expandable, total, explicit, implicit, progressLabel, Icon, status, marker, statusLabel, meta,
    preparationLabel, preparationTitle } = entryPresentation(entry, childCount, progress, activeLearningGoal, data.language)
  const source = entry.sourceSections?.map(section => section.title).join(' › ')
  const role = data.unitEntry ? (english ? 'Introduction' : 'Einstieg') : meta
  const detail = goalAction?.context ?? [role, source].filter(Boolean).join(' · ')
  return <article className={`lum-node lum-node--${entry.kind}${practiceAction ? ' lum-node--has-practice' : ''}${active ? ' is-focused' : ''}${related ? ' is-related' : ''}${muted ? ' is-muted' : ''}`}
    data-entry-id={entry.id} data-entry-kind={entry.kind} data-active-goal={activeLearningGoal || undefined}
    data-preparation={entry.preparation || undefined} data-unit-entry={data.unitEntry || undefined}>
    {ports.map(port => <Handle key={port.id} id={port.id}
      type={port.side === 'WEST' || port.side === 'NORTH' ? 'target' : 'source'}
      position={sides[port.side]} isConnectable={false} style={{ left: port.x, top: port.y }} />)}
    <button type="button" className="lum-node-main nodrag" title={goalAction?.title ?? entry.title}
      onClick={event => { event.stopPropagation(); if (goalAction) goalAction.open(); else onSelect(entry.id) }}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); event.stopPropagation()
          if (goalAction) goalAction.open(); else onSelect(entry.id)
        }
      }} aria-pressed={goalAction ? undefined : active} aria-description={[data.unitEntry && role, goalAction?.context ?? source, expandable ? (progress ? progressLabel : undefined) : statusLabel].filter(Boolean).join('. ')} aria-label={goalAction?.label ?? `${entry.title}, ${english ? 'Show details' : 'Details anzeigen'}${activeLearningGoal ? english ? ', active learning goal' : ', aktives Lernziel' : ''}${entry.preparation ? `, ${preparationLabel}` : ''}`}>
      <span className={`lum-node-icon${expandable ? '' : ` lum-node-state ${status}`}`} data-testid={marker} role="img" aria-label={expandable ? kindLabel : statusLabel}
        title={expandable ? undefined : statusLabel}><Icon size={16} strokeWidth={!expandable && (explicit || implicit) ? 3 : 2} /></span>
      <span className="lum-node-copy"><strong>{goalAction?.title ?? entry.title}</strong>
        <span className="lum-node-meta" title={detail}>{detail}</span>
      </span>
    </button>
    {entry.preparation && <span className="lum-node-tag" title={preparationTitle}>{preparationLabel}</span>}
    {expandable && total > 0 && <div className="lum-node-progress" role="img" aria-label={progressLabel} title={progressLabel}>
      <span className="is-explicit" style={{ width: `${(progress?.explicitRatio ?? explicit / total) * 100}%` }} />
      <span className="is-implicit" style={{ width: `${(progress?.implicitRatio ?? implicit / total) * 100}%` }} />
    </div>}
    {outsideCount > 0 && <span className="lum-context-count" title={`${outsideCount} ${english ? 'prerequisites outside this level' : 'Voraussetzungen außerhalb dieser Ebene'}`}>
      <Link2 size={11} /><span className="lum-sr-only">{outsideCount} {english ? 'prerequisites outside this level' : 'Voraussetzungen außerhalb dieser Ebene'}</span>
    </span>}
    {expandable && <button type="button" className="lum-node-open nodrag" onClick={event => {
      event.stopPropagation()
      if (!event.shiftKey) onOpen(entry.id)
    }} title={english ? 'Open section' : entry.kind === 'unit' ? 'Einheit öffnen' : 'Bereich öffnen'} aria-label={english ? `Zoom into ${entry.title}` : `In ${entry.title} hineinzoomen`}>
      <ArrowDownRight size={15} strokeWidth={1.7} />
    </button>}
    {practiceAction && <MapPracticeButton action={practiceAction} english={english} />}
  </article>
})
