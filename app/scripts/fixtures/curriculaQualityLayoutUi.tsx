import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import '../../src/index.css'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import { CurriculaView } from '../../src/views/CurriculaView'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('missing root element')
}

createRoot(rootElement).render(
  <MemoryRouter>
    <LanguageProvider>
      <ThemeProvider>
        <StrictMode>
          <CurriculaView />
        </StrictMode>
      </ThemeProvider>
    </LanguageProvider>
  </MemoryRouter>,
)
