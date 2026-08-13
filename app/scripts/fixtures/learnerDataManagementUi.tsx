/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LearnerDataManagementDialog } from '../../src/components/LearnerDataManagementDialog'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import '../../src/index.css'

interface LearnerDataManagementMetrics {
  closes: number
  deletes: number
  exports: number
  imports: number
}

declare global {
  interface Window {
    __learnerDataManagementMetrics: LearnerDataManagementMetrics
  }
}

window.__learnerDataManagementMetrics = {
  closes: 0,
  deletes: 0,
  exports: 0,
  imports: 0,
}

const Fixture = () => {
  const [open, setOpen] = useState(true)
  const [deleteBusy, setDeleteBusy] = useState(false)

  return (
    <LanguageProvider>
      <ThemeProvider>
        <LearnerDataManagementDialog
          isOpen={open}
          skillpilotId="11111111-1111-4111-8111-111111111111"
          retention={{
            lastActivityAt: '2026-08-13T08:00:00Z',
            scheduledDeletionAt: '2027-08-13T08:00:00Z',
          }}
          retentionLoading={false}
          retentionError={null}
          deleteBusy={deleteBusy}
          deleteError={null}
          onClose={() => {
            window.__learnerDataManagementMetrics.closes += 1
            setOpen(false)
          }}
          onExport={() => {
            window.__learnerDataManagementMetrics.exports += 1
          }}
          onImportFileChange={() => {
            window.__learnerDataManagementMetrics.imports += 1
          }}
          onDelete={() => {
            window.__learnerDataManagementMetrics.deletes += 1
            setDeleteBusy(true)
          }}
        />
      </ThemeProvider>
    </LanguageProvider>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
