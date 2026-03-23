import { useState, useCallback, useRef, useEffect } from 'react'

export function useResizableSidebar(initialWidth = 320) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isResizing = useRef(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      setSidebarWidth(Math.max(240, Math.min(800, e.clientX)))
    }
  }, [])

  const stopResizing = useCallback(function stopResizing() {
    isResizing.current = false
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('mouseup', stopResizing as EventListener)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [resize])

  const startResizing = useCallback(() => {
    isResizing.current = true
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [resize, stopResizing])

  return {
    isMobile,
    sidebarWidth,
    isSidebarOpen,
    setIsSidebarOpen,
    startResizing,
  }
}
