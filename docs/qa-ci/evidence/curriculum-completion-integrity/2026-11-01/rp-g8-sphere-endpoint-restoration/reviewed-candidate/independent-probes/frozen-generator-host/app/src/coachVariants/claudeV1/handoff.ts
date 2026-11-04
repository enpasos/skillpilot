export interface ClipboardDependencies {
  clipboard?: Pick<Clipboard, 'writeText'> | null
  document?: Pick<Document, 'body' | 'createElement' | 'execCommand'> | null
}

export interface PreparedClaudeWindow {
  location: Pick<Location, 'replace'>
  opener: unknown
  close?: () => void
}

type OpenWindow = (url?: string | URL, target?: string, features?: string) => Window | null

const copyWithHiddenTextarea = (
  text: string,
  documentLike: ClipboardDependencies['document'],
) => {
  if (!documentLike) return false
  const textarea = documentLike.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  documentLike.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    return documentLike.execCommand('copy')
  } finally {
    textarea.remove()
  }
}

export const copyClaudeStartPrompt = async (
  prompt: string,
  dependencies: ClipboardDependencies = {},
): Promise<boolean> => {
  const clipboard = dependencies.clipboard
    ?? (typeof navigator === 'undefined' ? null : navigator.clipboard)
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(prompt)
      return true
    } catch {
      // A fresh click can still use the document fallback below.
    }
  }

  const documentLike = dependencies.document
    ?? (typeof document === 'undefined' ? null : document)
  try {
    return copyWithHiddenTextarea(prompt, documentLike)
  } catch {
    return false
  }
}

export const prepareClaudeWindow = (
  openWindow: OpenWindow = (...args) => window.open(...args),
): PreparedClaudeWindow | null => {
  const opened = openWindow('', '_blank') as PreparedClaudeWindow | null
  if (!opened) return null
  try {
    opened.opener = null
  } catch {
    // Cross-browser hardening only; navigation still works without this assignment.
  }
  return opened
}

export const navigatePreparedClaudeWindow = (
  preparedWindow: PreparedClaudeWindow | null,
  webUrl: string,
) => {
  if (!preparedWindow) return false
  try {
    preparedWindow.location.replace(webUrl)
    return true
  } catch {
    try {
      preparedWindow.close?.()
    } catch {
      // The visible fallback remains available in the first-party page.
    }
    return false
  }
}
