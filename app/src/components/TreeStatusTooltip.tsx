import React, { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Shared compact tree status trigger: hover, focus and tap, without selecting the goal. */
export function TreeStatusTooltip({ label, testId, triggerClassName, children, content }: {
  label: string
  testId: string
  triggerClassName: string
  children: ReactNode
  content: ReactNode
}): React.ReactElement {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const tooltip = useRef<HTMLDivElement>(null)
  const pointerInTooltip = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [position, setPosition] = useState<{
    left: number; top: number; width: number; maxHeight: number; above: boolean
  } | null>(null)
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
      data-testid={testId}
      aria-label={label}
      aria-describedby={isOpen ? id : undefined}
      className={triggerClassName}
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
      {children}
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
        {content}
      </div>, document.body,
    )}
  </>
}
