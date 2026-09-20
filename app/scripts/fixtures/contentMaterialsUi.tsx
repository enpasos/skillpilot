/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import { MaterialSelectionPanel } from '../../src/components/MaterialSelectionPanel'
import { GoalAdditionalMaterials } from '../../src/components/GoalAdditionalMaterials'

const Fixture = () => {
  const [learner, setLearner] = useState('learner-a')
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [refresh, setRefresh] = useState(0)
  const [visible, setVisible] = useState(true)
  return (
    <main className="mx-auto max-w-3xl p-4">
      <button onClick={() => setLearner((value) => value === 'learner-a' ? 'learner-b' : 'learner-a')}>Switch learner</button>
      <button onClick={() => setLanguage((value) => value === 'de' ? 'en' : 'de')}>Switch language</button>
      <button onClick={() => setVisible((value) => !value)}>Toggle cockpit</button>
      <h1>Normal learning stays available</h1>
      {visible && <>
        <MaterialSelectionPanel skillpilotId={learner} language={language} onSaved={() => setRefresh((value) => value + 1)} />
        <GoalAdditionalMaterials skillpilotId={learner} goalId="motion-goal" language={language} refreshKey={refresh} />
      </>}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Fixture />)
