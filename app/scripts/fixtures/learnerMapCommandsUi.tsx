/* eslint-disable react-refresh/only-export-components */
import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import { LearningUnitMap } from '../../src/components/learningUnitMap/LearningUnitMap'
import type { LearningMapFixture } from '../../src/components/learningUnitMap/types'

const fixture: LearningMapFixture = { rootId: 'command-root', title: 'Command contract', entries: {
  'command-root': { id: 'command-root', title: 'Root', description: '', kind: 'cluster', children: ['command-group'], requires: [], position: { x: 0, y: 0 } },
  'command-group': { id: 'command-group', title: 'Group', description: '', kind: 'cluster', children: ['command-section', 'command-other-section', 'command-c-section'], requires: [], position: { x: 0, y: 0 } },
  'command-section': { id: 'command-section', title: 'Section', description: '', kind: 'cluster', children: ['command-a', 'command-b'], requires: [], position: { x: 0, y: 0 } },
  'command-a': { id: 'command-a', title: 'Goal A', description: '', kind: 'goal', requires: [], position: { x: 0, y: 0 } },
  'command-b': { id: 'command-b', title: 'Goal B', description: '', kind: 'goal', requires: [], position: { x: 0, y: 0 } },
  'command-other-section': { id: 'command-other-section', title: 'Other section', description: '', kind: 'cluster', children: ['command-other-b'], requires: [], position: { x: 0, y: 0 } },
  'command-other-b': { id: 'command-other-b', title: 'Other goal B', description: '', kind: 'goal', requires: [], position: { x: 0, y: 0 } },
  'command-c-section': { id: 'command-c-section', title: 'Third section', description: '', kind: 'cluster', children: ['command-c'], requires: [], position: { x: 0, y: 0 } },
  'command-c': { id: 'command-c', title: 'External goal C', description: '', kind: 'goal', requires: [], position: { x: 0, y: 0 } },
} }

// Control only the presentation command. This deliberately models a slower
// concurrent route update; no fetch, learner state or backend adapters are used.
function Fixture() {
  const [selected, setSelected] = useState('command-a')
  // Mount after an older reveal of B and a later ordinary selection of A.
  // Retained reveal metadata is history; only future sequence changes reveal.
  const [nonce, setNonce] = useState(5)
  const [revealEntryId, setRevealEntryId] = useState<string | undefined>('command-other-b')
  const latestSelection = useRef(selected)
  const pendingEcho = useRef<string | null>(null)
  const pendingRevealRoute = useRef<string | null>(null)
  const select = (id: string) => {
    latestSelection.current = id
    pendingEcho.current = id
  }
  const reveal = (id = latestSelection.current) => {
    setSelected(id)
    setRevealEntryId(id)
    setNonce(value => value + 1)
  }
  const revealBeforeRoute = (id: string) => {
    pendingRevealRoute.current = id
    setRevealEntryId(id)
    setNonce(value => value + 1)
  }
  return <div style={{ display: 'grid', gridTemplateColumns: '850px 1fr', height: '100vh' }}>
    <LearningUnitMap fixture={fixture} embedded active headingMode="context" showInspector={false}
      command={{ entryId: selected, nonce, revealEntryId }} onEntrySelect={select} />
    <main style={{ padding: 20 }}>
      <output data-testid="command-parent-selection">{selected}</output>
      <button type="button" data-testid="command-release-echo" onClick={() => {
        if (pendingEcho.current) setSelected(pendingEcho.current)
        pendingEcho.current = null
      }}>Release pending selection echo</button>
      <button type="button" data-testid="command-reveal-selected" onClick={() => reveal()}>Fresh reveal of selection</button>
      <button type="button" data-testid="command-reveal-a" onClick={() => reveal('command-a')}>Fresh reveal of A</button>
      <button type="button" data-testid="command-route-a" onClick={() => setSelected('command-a')}>Route to A</button>
      <button type="button" data-testid="command-reveal-b-before-route" onClick={() => revealBeforeRoute('command-other-b')}>Reveal B before its route</button>
      <button type="button" data-testid="command-reveal-section-before-route" onClick={() => revealBeforeRoute('command-section')}>Reveal Section before its route</button>
      <button type="button" data-testid="command-reveal-unavailable" onClick={() => revealBeforeRoute('command-unavailable')}>Reveal unavailable target</button>
      <button type="button" data-testid="command-release-reveal-route" onClick={() => {
        if (pendingRevealRoute.current) setSelected(pendingRevealRoute.current)
        pendingRevealRoute.current = null
      }}>Release reveal route</button>
      <button type="button" data-testid="command-external-c" onClick={() => {
        pendingRevealRoute.current = null
        setSelected('command-c')
      }}>External route to C</button>
      <label>Current answer<input data-testid="command-current-answer" defaultValue="An unfinished answer" /></label>
    </main>
  </div>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
