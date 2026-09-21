import React, { useEffect, useRef, useState } from 'react'
import {
  ContentMaterialsApiError,
  getContentSelection,
  saveContentSelection,
  type ContentSelection,
  type MaterialLanguage,
} from '../utils/contentMaterialsApi'

interface Props {
  skillpilotId: string
  language: MaterialLanguage
  onSaved: () => void
}

// Remount on identity/language changes so pending responses and unsaved choices
// can never migrate to the next learner. The selection is stored by the backend.
export const MaterialSelectionPanel = (props: Props) => (
  <ScopedMaterialSelectionPanel key={`${props.skillpilotId}:${props.language}`} {...props} />
)

const ScopedMaterialSelectionPanel = ({ skillpilotId, language, onSaved }: Props) => {
  const de = language === 'de'
  const [selection, setSelection] = useState<ContentSelection | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const alive = useRef(false)
  const saving = useRef(false)
  const saveController = useRef<AbortController | null>(null)

  useEffect(() => {
    alive.current = true
    const controller = new AbortController()
    void getContentSelection(skillpilotId, language, { signal: controller.signal })
      .then((value) => {
        if (controller.signal.aborted) return
        setSelection(value)
        setSelected(value.selectedPackageIds)
      })
      .catch(() => {
        // Optional materials never block the learning view, including when disabled.
      })
    return () => {
      alive.current = false
      controller.abort()
      saveController.current?.abort()
    }
  }, [skillpilotId, language])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selection || saving.current) return
    saving.current = true
    setBusy(true)
    setMessage('')
    const controller = new AbortController()
    saveController.current = controller
    try {
      const next = await saveContentSelection(skillpilotId, language, selection.revision, selected, {
        signal: controller.signal,
      })
      if (!alive.current || controller.signal.aborted) return
      setSelection(next)
      setSelected(next.selectedPackageIds)
      setMessage(de ? 'Materialauswahl gespeichert.' : 'Material selection saved.')
      onSaved()
    } catch (error) {
      if (!alive.current || controller.signal.aborted) return
      if (error instanceof ContentMaterialsApiError && error.status === 404) {
        setUnavailable(true)
      } else if (error instanceof ContentMaterialsApiError && error.status === 409) {
        // A conflict reloads current server data; it never retries the write automatically.
        try {
          const current = await getContentSelection(skillpilotId, language, { signal: controller.signal })
          if (!alive.current || controller.signal.aborted) return
          setSelection(current)
          setSelected(current.selectedPackageIds)
        } catch {
          if (alive.current && !controller.signal.aborted) setUnavailable(true)
        }
        setMessage(de ? 'Die Auswahl wurde inzwischen geändert. Prüfe den aktuellen Stand und speichere bei Bedarf erneut.' : 'The selection changed elsewhere. Review the current selection and save again if needed.')
      } else {
        setMessage(de ? 'Materialauswahl gerade nicht speicherbar. Du kannst weiterlernen.' : 'Material selection could not be saved. You can continue learning.')
      }
    } finally {
      saving.current = false
      if (alive.current) {
        setBusy(false)
      }
    }
  }

  if (!selection || unavailable || (!selection.packages.length && !selection.selectedPackageIds.length)) return null
  const availablePackageIds = new Set(selection.packages.map((item) => item.packageId))
  const retiredPackageIds = selection.selectedPackageIds.filter((id) => !availablePackageIds.has(id))

  return (
    <details className="mb-6 w-full max-w-3xl rounded-xl border border-border-color bg-sidebar-bg p-4 text-sm">
      <summary className="min-h-11 cursor-pointer py-3 font-semibold text-text-primary">
        {de ? 'Zusätzliche Lernmaterialien' : 'Additional learning materials'}
        <span className="ml-2 font-normal text-text-secondary">({selection.selectedPackageIds.filter((id) => availablePackageIds.has(id)).length} {de ? 'aktiv' : 'active'})</span>
      </summary>
      <form onSubmit={(event) => { void save(event) }} className="space-y-4 pt-3">
        <p className="text-text-secondary">
          {de
            ? 'Wähle optionale Materialpakete für dein Cockpit und deinen Coach. Deine Lernziele und dein Lernfortschritt bleiben unverändert.'
            : 'Choose optional material packages for your cockpit and coach. Your learning goals and progress stay unchanged.'}
        </p>
        <fieldset disabled={busy} className="space-y-3">
          <legend className="sr-only">{de ? 'Materialpakete auswählen' : 'Select material packages'}</legend>
          {selection.packages.map((item) => (
            <label key={item.packageId} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border-color p-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-sky-600"
                checked={selected.includes(item.packageId)}
                onChange={(event) => {
                  setSelected((current) => event.target.checked
                    ? [...current.filter((id) => id !== item.packageId), item.packageId]
                    : current.filter((id) => id !== item.packageId))
                  setMessage('')
                }}
              />
              <span className="min-w-0 break-words">
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-text-secondary">{item.description}</span>
                <span className="mt-2 block text-xs text-text-secondary">
                  {item.providerName} · {item.materialCount} {de ? 'Materialien' : 'materials'} · Version {item.version}
                </span>
                <span className="mt-1 block text-xs text-text-secondary">
                  {item.access === 'public-link'
                    ? (de ? 'Öffentliche Verweise beim Anbieter' : 'Public links on the provider’s website')
                    : (de ? 'Zugangsbedingungen beim Anbieter beachten' : 'Check the provider’s access requirements')}
                  {' · '}{de ? 'Coach erhält Materialverweise' : 'Coach receives material references'}
                </span>
              </span>
            </label>
          ))}
          {retiredPackageIds.map((packageId) => (
            <label key={packageId} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-amber-300 p-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-sky-600"
                checked={selected.includes(packageId)}
                onChange={(event) => {
                  setSelected((current) => event.target.checked
                    ? [...current.filter((id) => id !== packageId), packageId]
                    : current.filter((id) => id !== packageId))
                  setMessage('')
                }}
              />
              <span className="min-w-0 break-words">
                <span className="block font-semibold">{de ? 'Nicht mehr verfügbares Paket' : 'Unavailable package'}: {packageId}</span>
                <span className="mt-1 block text-text-secondary">
                  {de ? 'Entferne dieses Paket aus deiner Auswahl und speichere die Änderung.' : 'Remove this package from your selection and save the change.'}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="text-xs text-text-secondary">
          {de
            ? 'Externe Seiten öffnen sich erst, wenn du einen Materiallink anklickst. Dann gelten die Datenschutz- und Zugangsbedingungen des Anbieters.'
            : 'External pages open only when you click a material link. The provider’s privacy and access terms then apply.'}
        </p>
        <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? (de ? 'Speichern …' : 'Saving …') : (de ? 'Materialauswahl speichern' : 'Save material selection')}
        </button>
        {message && <p role="status" className="text-text-secondary">{message}</p>}
      </form>
    </details>
  )
}
