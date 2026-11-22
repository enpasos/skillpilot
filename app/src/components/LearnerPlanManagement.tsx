import { useState, type ReactNode } from 'react'

export function LearnerPlanManagement({ language, children }: { language: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <details data-testid="learner-plan-management" className="rounded-xl border border-border-color p-4 text-sm"
    onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer font-semibold">{language.startsWith('en') ? 'Learning plan' : 'Lernplan'}</summary>
    {open && <div className="mt-3">{children}</div>}
  </details>
}
