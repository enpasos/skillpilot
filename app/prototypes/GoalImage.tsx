import { useEffect, useRef, useState } from 'react'
import { Expand, X } from 'lucide-react'
import './GoalImage.css'

export interface CockpitGoalImage {
  url: string
  title: string
  altText: string
  width: number
  height: number
}
export interface CockpitImagePreview {
  goalId: string
  goalTitle: string
  image: CockpitGoalImage
}

export function GoalImageButton({ image, goalTitle, onOpen }: {
  image: CockpitGoalImage; goalTitle: string; onOpen: () => void
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  if (failedUrl === image.url) return null
  return <button type="button" className="cp-goal-image" data-testid="cockpit-goal-image-button"
    onClick={onOpen} aria-label={`Lernzielbild zu „${goalTitle}“ vergrößern`} title="Lernzielbild vergrößern">
    <img src={image.url} alt={image.altText} width={image.width} height={image.height}
      loading="lazy" decoding="async" onError={() => setFailedUrl(image.url)} />
    <span aria-hidden="true"><Expand size={13} /></span>
  </button>
}

export function GoalImageDialog({ preview, onClose }: {
  preview: CockpitImagePreview | null; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (preview && !element.open) element.showModal()
    else if (!preview && element.open) element.close()
  }, [preview])
  return <dialog ref={dialog} className="cp-image-dialog" data-testid="cockpit-image-dialog"
    data-image-goal-id={preview?.goalId} aria-labelledby="cockpit-image-title"
    onKeyDownCapture={event => { if (event.key === 'Escape' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f')) event.stopPropagation() }}
    onCancel={event => { event.preventDefault(); onClose() }} onClose={onClose}>
    {preview && <>
      <header><h2 id="cockpit-image-title">{preview.goalTitle}</h2>
        <button type="button" aria-label="Lernzielbild schließen" onClick={onClose}><X size={19} /></button></header>
      {failedUrl === preview.image.url ? <p>Bild nicht verfügbar.</p> : <img
        src={preview.image.url} alt={preview.image.altText} width={preview.image.width} height={preview.image.height}
        decoding="async" onError={() => setFailedUrl(preview.image.url)} />}
    </>}
  </dialog>
}
