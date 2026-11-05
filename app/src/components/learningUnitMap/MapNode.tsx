import { memo } from 'react'
import { ArrowDownRight, Check, Layers3, Link2, Send, ShieldCheck, Target } from 'lucide-react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { LearningEntryProgress, LearningMapEntry } from './types'
import type { LayoutPort } from './layoutLearningScope'
import { getKindLabels } from './presentation'

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
  language?: 'de' | 'en'
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}
export type LearningFlowNode = Node<MapNodeData, 'learningUnit'>

export const MapNode = memo(function MapNode({ data }: NodeProps<LearningFlowNode>) {
  const { entry, childCount, outsideCount, ports, active, related, muted, progress, activeLearningGoal, onSelect, onOpen } = data
  const english = data.language === 'en'
  const kindLabels = getKindLabels(data.language ?? 'de')
  const expandable = childCount > 0
  const total = progress?.total ?? 0
  const explicit = Math.min(total, Math.max(0, progress?.explicit ?? 0))
  const implicit = Math.min(total - explicit, Math.max(0, progress?.implicit ?? 0))
  const achieved = explicit + implicit
  const recognized = progress?.recognizedCount ?? 0
  const legacy = implicit - recognized
  const scopeLabel = progress?.implicitScopeLabel
  const progressLabel = (progress?.globalRecognition
    ? (english ? `${achieved} of ${total} learning goals completed: ${explicit} explicit, ${recognized} mastered through independent application${legacy ? `, ${legacy} covered in this section` : ''}.`
      : `${achieved} von ${total} Lernzielen erledigt: ${explicit} explizit, ${recognized} durch selbständige Anwendung gemeistert${legacy ? `, ${legacy} im Abschnitt abgedeckt` : ''}.`)
    : english ? `${achieved} of ${total} learning goals completed: ${explicit} explicit, ${implicit} completed in this section.`
      : `${achieved} von ${total} Lernzielen erledigt: ${explicit} explizit, ${implicit} in diesem Lernabschnitt erledigt.`)
    + (implicit && scopeLabel ? ` ${scopeLabel}. ${english ? 'Saved learning results stay unchanged.' : 'Gespeicherte Lernstände bleiben unverändert.'}` : '')
  const Icon = expandable ? Layers3 : explicit ? Check : implicit ? ShieldCheck : activeLearningGoal ? Send : Target
  const status = explicit ? 'is-explicit' : implicit ? 'is-implicit' : activeLearningGoal ? 'is-active' : progress ? 'is-open' : 'is-context'
  const statusLabel = explicit ? english ? 'Explicitly completed' : 'Direkt geschafft' : implicit ? progress?.waiverLabel
    ?? (english ? 'Completed in this section' : 'In diesem Lernabschnitt erledigt')
    : activeLearningGoal ? english ? 'Active learning goal' : 'Aktives Lernziel' : progress ? english ? 'Still open' : 'Noch offen' : kindLabels[entry.kind]
  return <article className={`lum-node lum-node--${entry.kind}${active ? ' is-focused' : ''}${related ? ' is-related' : ''}${muted ? ' is-muted' : ''}`}
    data-entry-id={entry.id} data-entry-kind={entry.kind} data-active-goal={activeLearningGoal || undefined}>
    {ports.map(port => <Handle key={port.id} id={port.id}
      type={port.side === 'WEST' || port.side === 'NORTH' ? 'target' : 'source'}
      position={sides[port.side]} isConnectable={false} style={{ left: port.x, top: port.y }} />)}
    <button type="button" className="lum-node-main nodrag" title={entry.title}
      onClick={event => { event.stopPropagation(); onSelect(entry.id) }}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); event.stopPropagation()
          onSelect(entry.id)
        }
      }} aria-pressed={active} aria-label={`${entry.title}, ${english ? 'Show details' : 'Details anzeigen'}${activeLearningGoal ? english ? ', active learning goal' : ', aktives Lernziel' : ''}`}>
      <span className={`lum-node-icon${expandable ? '' : ` lum-node-state ${status}`}`} role="img" aria-label={expandable ? kindLabels[entry.kind] : statusLabel}
        title={expandable ? undefined : statusLabel}><Icon size={16} strokeWidth={!expandable && explicit ? 3 : !expandable && implicit ? 2.5 : 2} /></span>
      <span className="lum-node-copy"><strong>{entry.title}</strong>
        <span className="lum-node-meta" title={entry.eyebrow}>{progress ? kindLabels[entry.kind] : entry.eyebrow ?? kindLabels[entry.kind]}{expandable && (total ? ` · ${achieved}/${total} ${english ? 'completed' : 'erledigt'}` : ` · ${childCount} ${english ? 'sections' : 'Bereiche'}`)}</span>
      </span>
    </button>
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
  </article>
})
