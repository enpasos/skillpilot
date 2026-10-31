import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ShieldCheck } from 'lucide-react'
import { completionLabel, type CompletionTreeWaiver } from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'

/** A scope-specific waiver occupies the ordinary status slot, without changing mastery. */
export function CompletionWaiverIcon({ waiver, language }: {
  waiver: CompletionTreeWaiver
  language: 'de' | 'en'
}) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const tooltip = useRef<HTMLDivElement>(null)
  const pointerInTooltip = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [position, setPosition] = useState<{
    left: number; top: number; width: number; maxHeight: number; above: boolean
  } | null>(null)
  const label = language === 'en'
    ? 'Covered by assessment for this section'
    : 'Für diesen Abschnitt durch Prüfung abgedeckt'
  const cancelClose = () => clearTimeout(closeTimer.current)
  const open = () => {
    cancelClose()
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(320, window.innerWidth - 24)
    const below = window.innerHeight - rect.bottom - 12
    const aboveSpace = rect.top - 12
    const above = below < 180 && aboveSpace > below
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      top: above ? rect.top - 6 : rect.bottom + 6,
      width,
      maxHeight: Math.max(48, (above ? aboveSpace : below) - 6),
      above,
    })
  }
  const leave = () => {
    cancelClose()
    // Give the pointer time to cross the small gap into the tooltip.
    if (document.activeElement !== trigger.current) {
      closeTimer.current = setTimeout(() => setPosition(null), 150)
    }
  }
  const isOpen = position !== null
  useEffect(() => () => clearTimeout(closeTimer.current), [])
  useEffect(() => {
    if (!isOpen) return
    const close = () => setPosition(null)
    const outside = (event: MouseEvent) => {
      pointerInTooltip.current = event.target instanceof Node && !!tooltip.current?.contains(event.target)
      if (event.target instanceof Node
        && !trigger.current?.contains(event.target)
        && !pointerInTooltip.current) close()
    }
    const releasePointer = () => { pointerInTooltip.current = false }
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    const scroll = (event: Event) => {
      if (!(event.target instanceof Node && tooltip.current?.contains(event.target))) close()
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('pointerup', releasePointer, true)
    document.addEventListener('pointercancel', releasePointer, true)
    // A touch tap can synthesize mousedown (and blur) after pointerup.
    document.addEventListener('mousedown', outside, true)
    document.addEventListener('mouseup', releasePointer, true)
    document.addEventListener('keydown', key)
    window.addEventListener('scroll', scroll, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('pointerup', releasePointer, true)
      document.removeEventListener('pointercancel', releasePointer, true)
      document.removeEventListener('mousedown', outside, true)
      document.removeEventListener('mouseup', releasePointer, true)
      pointerInTooltip.current = false
      document.removeEventListener('keydown', key)
      window.removeEventListener('scroll', scroll, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  return <>
    <button
      ref={trigger}
      type="button"
      data-testid="completion-tree-waiver"
      aria-label={label}
      aria-describedby={isOpen ? id : undefined}
      className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-sky-600 dark:text-sky-400 before:absolute before:-inset-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') open() }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse') leave() }}
      onFocus={open}
      onBlur={() => {
        cancelClose()
        if (!pointerInTooltip.current) setPosition(null)
      }}
      onKeyDown={(event) => {
        const content = tooltip.current
        if (!content || content.scrollHeight <= content.clientHeight) return
        const scrollTo = {
          ArrowDown: content.scrollTop + 40,
          ArrowUp: content.scrollTop - 40,
          PageDown: content.scrollTop + content.clientHeight,
          PageUp: content.scrollTop - content.clientHeight,
          Home: 0,
          End: content.scrollHeight,
        }[event.key]
        if (scrollTo === undefined) return
        event.preventDefault()
        event.stopPropagation()
        content.scrollTop = scrollTo
      }}
      onClick={(event) => { event.stopPropagation(); open() }}
    >
      <ShieldCheck size={16} strokeWidth={2.5} aria-hidden="true" />
    </button>
    {position && createPortal(
      <div
        ref={tooltip}
        id={id}
        role="tooltip"
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => { if (event.pointerType === 'mouse') leave() }}
        onClick={(event) => event.stopPropagation()}
        className="fixed z-[9999] overflow-auto break-words rounded-lg border border-sky-200 bg-white p-3 text-xs leading-relaxed text-slate-700 shadow-lg dark:border-sky-800 dark:bg-slate-900 dark:text-slate-200"
        style={{ left: position.left, top: position.top, width: position.width,
          maxHeight: position.maxHeight, transform: position.above ? 'translateY(-100%)' : undefined }}
      >
        <p className="font-semibold text-sky-700 dark:text-sky-300">{label}</p>
        <p className="mt-2">{language === 'en' ? 'Section: ' : 'Lernabschnitt: '}
          <InlineMathText text={completionLabel(waiver.sectionTitle, language)} />
        </p>
        {waiver.assessments.length > 0 && <p className="mt-2">
          {language === 'en' ? 'Passed assessments: ' : 'Bestandene Prüfungen: '}
          <InlineMathText text={waiver.assessments.map(a => completionLabel(a.title, language)).join('; ')} />
          {(waiver.assessmentCount ?? 0) > waiver.assessments.length
            ? (language === 'en'
              ? ` (+${waiver.assessmentCount! - waiver.assessments.length} more)`
              : ` (+${waiver.assessmentCount! - waiver.assessments.length} weitere)`)
            : null}
        </p>}
        <p className="mt-2">{language === 'en'
          ? 'Separate preparation is no longer required for this section. This goal keeps its existing learning result and remains available to learn voluntarily.'
          : 'Die separate Vorbereitung entfällt für diesen Abschnitt. Der Lernstand dieses Ziels bleibt unverändert; du kannst es weiterhin freiwillig bearbeiten.'}</p>
      </div>, document.body,
    )}
  </>
}
