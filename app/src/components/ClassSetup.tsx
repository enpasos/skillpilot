import React, { useMemo, useState } from 'react'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { ClassSession, StudentMapping } from '../trainerTypes'

interface ClassSetupProps {
  landscapes: LandscapeEntry[]
  onSave: (session: ClassSession) => void
  onCancel: () => void
}

export const ClassSetup: React.FC<ClassSetupProps> = ({ landscapes, onSave, onCancel }) => {
  const [className, setClassName] = useState('')
  const [selectedLandscapeId, setSelectedLandscapeId] = useState(() => {
    const saved = localStorage.getItem('skillpilot_last_landscape')
    return saved && landscapes.some(l => l.meta.landscapeId === saved)
      ? saved
      : (landscapes[0]?.meta.landscapeId ?? '')
  })
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [studentNames, setStudentNames] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedLandscape = useMemo(
    () => landscapes.find((l) => l.meta.landscapeId === selectedLandscapeId),
    [landscapes, selectedLandscapeId],
  )
  const filters = selectedLandscape?.meta.filters ?? []
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsGenerating(true)
    setError(null)
    try {
      const names = studentNames
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      const students: StudentMapping[] = []
      for (const name of names) {
        try {
          const res = await fetch(toApi('/api/ui/learners'), { method: 'POST' })
          if (!res.ok) throw new Error(`Status ${res.status}`)
          const data = await res.json()
          const id = data.state?.skillpilotId || data.skillpilotId || data.id
          if (!id) throw new Error('Keine SkillPilot-ID erhalten')
          students.push({ name, id: String(id) })
        } catch (err) {
          console.error('Fehler beim Anlegen für', name, err)
        }
      }

      const newClass: ClassSession = {
        id: crypto.randomUUID(),
        name: className,
        landscapeId: selectedLandscapeId,
        activeFilter: selectedFilter,
        students,
      }
      onSave(newClass)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl w-full mx-auto bg-sidebar-bg p-8 rounded-xl border border-border-color shadow-xl transition-colors">
      <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-6">Neue Klasse / Kurs anlegen</h2>
      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Bezeichnung</label>
          <input
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="z.B. Physik LK"
            className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary focus:border-sky-500 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Fach / Landscape</label>
            <select
              value={selectedLandscapeId}
              onChange={(e) => {
                setSelectedLandscapeId(e.target.value)
                localStorage.setItem('skillpilot_last_landscape', e.target.value)
              }}
              className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
            >
              {landscapes.map((l) => (
                <option key={l.meta.landscapeId} value={l.meta.landscapeId}>
                  {l.meta.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Filter / Niveau</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
            >
              <option value="all">Alle anzeigen</option>
              {filters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Schülerliste (Namen)</label>
          <p className="text-[11px] text-text-secondary mb-2">
            Ein Name pro Zeile oder durch Komma getrennt. Die Zuordnung Name ↔ SkillPilot-ID wird nur lokal gespeichert.
          </p>
          <textarea
            value={studentNames}
            onChange={(e) => setStudentNames(e.target.value)}
            placeholder="Peter&#10;Franz&#10;Simone"
            rows={6}
            className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary font-mono text-sm transition-colors"
          />
        </div>

        {error && <div className="text-sm text-amber-300">Fehler: {error}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating && <span className="animate-spin">⟳</span>}
            Klasse anlegen &amp; IDs generieren
          </button>
        </div>
      </form>
    </div>
  )
}
