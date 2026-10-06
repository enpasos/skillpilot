import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { GeminiStart } from '../../src/components/GeminiStart'
import { SessionSetup } from '../../src/components/SessionSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import { requestGeminiV1Start } from '../../src/coachVariants/geminiV1/request'

const Fixture = () => {
  const [visible, setVisible] = useState(true)
  const [role, setRole] = useState<'learner' | 'trainer' | 'explorer' | null>(null)
  const [skillpilotId, setSkillpilotId] = useState('')
  if (new URLSearchParams(location.search).get('full') === '1') return <MemoryRouter>
    <LanguageProvider><ThemeProvider><SessionSetup role={role} setRole={setRole}
      skillpilotId={skillpilotId} setSkillpilotId={setSkillpilotId} onStart={() => undefined} />
    </ThemeProvider></LanguageProvider>
  </MemoryRouter>
  return <LanguageProvider>
    <button type="button" onClick={() => setVisible(!visible)}>Switch provider</button>
    {visible && <GeminiStart onPrepare={() => requestGeminiV1Start({
      skillpilotId: 'c709883e-bf21-4482-9f68-eb6fe921a619', language: 'de',
    })} />}
  </LanguageProvider>
}
createRoot(document.getElementById('root')!).render(<StrictMode><Fixture /></StrictMode>)
