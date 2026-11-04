import { memo } from 'react'
import { ArrowDownRight, Check, Layers3, Link2, Send, ShieldCheck, Target } from 'lucide-react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { LearningEntryProgress, LearningMapEntry } from './types'
import type { LayoutPort } from './layoutLearningScope'
import { kindLabels } from './presentation'

const sides = { WEST: Position.Left, EAST: Position.Right, NORTH: Position.Top, SOUTH: Position.Bottom }

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
  onFocus: (id: string) => void
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}
export type LearningFlowNode = Node<MapNodeData, 'learningUnit'>

export const MapNode = memo(function MapNode({ data }: NodeProps<LearningFlowNode>) {
  const { entry, childCount, outsideCount, ports, active, related, muted, progress, activeLearningGoal, onFocus, onSelect, onOpen } = data
  const expandable = entry.kind === 'unit' && childCount > 0
  const total = progress?.total ?? 0
  const explicit = Math.min(total, Math.max(0, progress?.explicit ?? 0))
  const implicit = Math.min(total - explicit, Math.max(0, progress?.implicit ?? 0))
  const achieved = explicit + implicit
  const progressLabel = `${achieved} von ${total} Lernzielen erreicht: ${explicit} direkt, ${implicit} implizit.`
  const Icon = expandable ? Layers3 : explicit ? Check : implicit ? ShieldCheck : activeLearningGoal ? Send : Target
  const status = explicit ? 'is-explicit' : implicit ? 'is-implicit' : activeLearningGoal ? 'is-active' : progress ? 'is-open' : 'is-context'
  const statusLabel = explicit ? 'Direkt geschafft' : implicit ? 'Implizit geschafft' : activeLearningGoal ? 'Aktives Lernziel' : progress ? 'Noch offen' : kindLabels[entry.kind]
  return <article className={`lum-node lum-node--${entry.kind}${active ? ' is-focused' : ''}${related ? ' is-related' : ''}${muted ? ' is-muted' : ''}`}
    data-entry-id={entry.id} data-entry-kind={entry.kind} data-active-goal={activeLearningGoal || undefined}>
    {ports.map(port => <Handle key={port.id} id={port.id}
      type={port.side === 'WEST' || port.side === 'NORTH' ? 'target' : 'source'}
      position={sides[port.side]} isConnectable={false} style={{ left: port.x, top: port.y }} />)}
    <button type="button" className="lum-node-main nodrag" title={entry.title}
      onClick={event => { event.stopPropagation(); onSelect(entry.id) }} onFocus={() => onFocus(entry.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); event.stopPropagation(); onOpen(entry.id)
        }
      }} aria-pressed={active} aria-label={`${entry.title}, ${expandable ? 'Lerneinheit öffnen' : 'Details anzeigen'}${activeLearningGoal ? ', aktives Lernziel' : ''}`}>
      <span className={`lum-node-icon${expandable ? '' : ` lum-node-state ${status}`}`} role="img" aria-label={expandable ? kindLabels[entry.kind] : statusLabel}
        title={expandable ? undefined : statusLabel}><Icon size={16} strokeWidth={!expandable && explicit ? 3 : !expandable && implicit ? 2.5 : 2} /></span>
      <span className="lum-node-copy"><strong>{entry.title}</strong>
        <span className="lum-node-meta" title={entry.eyebrow}>{progress ? kindLabels[entry.kind] : entry.eyebrow ?? kindLabels[entry.kind]}{expandable && (total ? ` · ${achieved}/${total} erreicht` : ` · ${childCount} Bereiche`)}</span>
      </span>
    </button>
    {expandable && total > 0 && <div className="lum-node-progress" role="img" aria-label={progressLabel} title={progressLabel}>
      <span className="is-explicit" style={{ width: `${explicit / total * 100}%` }} />
      <span className="is-implicit" style={{ width: `${implicit / total * 100}%` }} />
    </div>}
    {outsideCount > 0 && <span className="lum-context-count" title={`${outsideCount} Voraussetzungen außerhalb dieser Ebene`}>
      <Link2 size={11} /><span className="lum-sr-only">{outsideCount} Voraussetzungen außerhalb dieser Ebene</span>
    </span>}
    <button type="button" className="lum-node-open nodrag" onClick={event => {
      event.stopPropagation()
      if (!event.shiftKey) onOpen(entry.id)
    }} title={expandable ? 'Einheit öffnen' : 'Details anzeigen'}
      aria-label={expandable ? `In ${entry.title} hineinzoomen` : `Information zu ${entry.title}`}>
      <ArrowDownRight size={15} strokeWidth={1.7} />
    </button>
  </article>
})
