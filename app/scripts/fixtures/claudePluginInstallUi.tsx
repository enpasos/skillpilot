import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '../../src/App'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import '../../src/index.css'

window.history.replaceState({}, '', '/plugins')
createRoot(document.getElementById('root')!).render(
  <BrowserRouter><LanguageProvider><ThemeProvider><App /></ThemeProvider></LanguageProvider></BrowserRouter>,
)
