import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '../../src/index.css'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import { GoalBookFeedbackPilotView } from '../../src/views/GoalBookFeedbackPilotView'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <BrowserRouter>
    <LanguageProvider>
      <ThemeProvider>
        <GoalBookFeedbackPilotView />
      </ThemeProvider>
    </LanguageProvider>
  </BrowserRouter>,
)
