import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LearningUnitMap } from '../src/components/learningUnitMap/LearningUnitMap'
import { learningMapFixture } from './learning-map.fixture'
import { complexLearningMapFixture } from './learning-map.complex.fixture'

const examples = [
  { id: 'small', label: 'Kleine Karte · 4 Bereiche' },
  { id: 'complex', label: 'Vernetzte Karte · 56 Bereiche' },
]

export function Prototype() {
  const [example, setExample] = useState(() => new URLSearchParams(location.search).get('example') === 'small' ? 'small' : 'complex')
  const chooseExample = (id: string) => {
    setExample(id)
    const url = new URL(location.href)
    url.searchParams.set('example', id)
    history.replaceState(null, '', url)
  }
  return <LearningUnitMap key={example} fixture={example === 'small' ? learningMapFixture : complexLearningMapFixture}
    examples={examples} exampleId={example} onExampleChange={chooseExample} />
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing learning map prototype root')
createRoot(root).render(<Prototype />)
