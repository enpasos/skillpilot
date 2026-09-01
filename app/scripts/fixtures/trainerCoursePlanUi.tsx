import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '../../src/App'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import '../../src/index.css'

const fixtureGoalId = localStorage.getItem('skillpilot_test_trainer_course_plan_goal')
const fixtureTrainerPath = fixtureGoalId
  ? `/trainer/${encodeURIComponent(fixtureGoalId)}`
  : '/trainer'
window.history.replaceState(
  {},
  '',
  `${fixtureTrainerPath}?l=trainer-course-plan-landscape&f=LK&view=plan`,
)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <BrowserRouter>
    <LanguageProvider>
      <ThemeProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </ThemeProvider>
    </LanguageProvider>
  </BrowserRouter>,
)
