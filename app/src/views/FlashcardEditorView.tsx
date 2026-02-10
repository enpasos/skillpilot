import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlashcardFlipCard } from '../components/srs/FlashcardFlipCard'
import { LanguageToggle } from '../components/LanguageToggle'

type DeckLanguage = 'de' | 'en'

interface DeckCard {
  id: string
  front: string
  back: string
  category: string
  tags?: string[]
  [key: string]: unknown
}

interface DeckData {
  deckId: string
  title: string
  cards: DeckCard[]
  [key: string]: unknown
}

interface DeckListResponse {
  files: string[]
}

interface DeckLoadResponse {
  path: string
  deck: unknown
}

interface DeckSaveResponse {
  path: string
  mirroredPath: string
}

const DECK_FILE_PATTERN = /_deck([._][a-z]{2})?\.json$/i
const DONE_STATE_PREFIX = 'flashcard_editor_done'
const HIDE_DONE_PREFIX = 'flashcard_editor_hide_done'

const deckScopedStorageKey = (prefix: string, deckPath: string): string => {
  return `${prefix}:${encodeURIComponent(deckPath)}`
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback
}

const normalizeDeckCard = (value: unknown, index: number): DeckCard => {
  const record = asRecord(value)
  const tagsRaw = Array.isArray(record.tags)
    ? record.tags.filter((entry): entry is string => typeof entry === 'string')
    : undefined

  const card: DeckCard = {
    ...record,
    id: asString(record.id, `card_${index + 1}`),
    front: asString(record.front),
    back: asString(record.back),
    category: asString(record.category),
  }

  if (tagsRaw && tagsRaw.length > 0) {
    card.tags = tagsRaw
  } else {
    delete card.tags
  }

  return card
}

const normalizeDeck = (value: unknown): DeckData => {
  const record = asRecord(value)
  const rawCards = Array.isArray(record.cards) ? record.cards : []

  return {
    ...record,
    deckId: asString(record.deckId),
    title: asString(record.title),
    cards: rawCards.map((entry, index) => normalizeDeckCard(entry, index)),
  }
}

const parseTags = (raw: string): string[] => {
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

const formatTags = (tags?: string[]): string => {
  if (!tags || tags.length === 0) return ''
  return tags.join(', ')
}

const buildUniqueCardId = (existingIds: string[], base: string): string => {
  const normalizedBase = base.trim() || 'new_card'
  const reserved = new Set(existingIds)
  if (!reserved.has(normalizedBase)) return normalizedBase

  let counter = 2
  while (reserved.has(`${normalizedBase}_${counter}`)) {
    counter += 1
  }
  return `${normalizedBase}_${counter}`
}

const suggestEnglishDeckPath = (dePath: string, files: string[]): string => {
  const candidates = new Set<string>()
  if (dePath.endsWith('.de.json')) {
    candidates.add(dePath.replace(/\.de\.json$/i, '.en.json'))
  }
  if (dePath.endsWith('_deck.json')) {
    candidates.add(dePath.replace(/_deck\.json$/i, '_deck_en.json'))
    candidates.add(dePath.replace(/_deck\.json$/i, '_deck.en.json'))
  }
  if (dePath.endsWith('_deck.de.json')) {
    candidates.add(dePath.replace(/_deck\.de\.json$/i, '_deck.en.json'))
  }

  for (const candidate of candidates) {
    if (files.includes(candidate)) return candidate
  }
  return ''
}

const requestJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

const collectDeckErrors = (deck: DeckData, label: string): string[] => {
  const errors: string[] = []

  if (!deck.deckId.trim()) errors.push(`${label}: deckId fehlt.`)
  if (!deck.title.trim()) errors.push(`${label}: title fehlt.`)
  if (!Array.isArray(deck.cards)) {
    errors.push(`${label}: cards fehlt.`)
    return errors
  }

  const seenIds = new Set<string>()
  deck.cards.forEach((card, index) => {
    const prefix = `${label} Karte #${index + 1}`
    const cardId = card.id.trim()
    if (!cardId) errors.push(`${prefix}: id fehlt.`)
    if (!card.front.trim()) errors.push(`${prefix}: front fehlt.`)
    if (!card.back.trim()) errors.push(`${prefix}: back fehlt.`)
    if (!card.category.trim()) errors.push(`${prefix}: category fehlt.`)

    if (cardId) {
      if (seenIds.has(cardId)) {
        errors.push(`${label}: doppelte Karten-ID "${cardId}".`)
      }
      seenIds.add(cardId)
    }

    if (card.tags && !Array.isArray(card.tags)) {
      errors.push(`${prefix}: tags muss ein String-Array sein.`)
    }
  })

  return errors
}

export const FlashcardEditorView: React.FC = () => {
  const [deckFiles, setDeckFiles] = useState<string[]>([])
  const [selectedDePath, setSelectedDePath] = useState('')
  const [selectedEnPath, setSelectedEnPath] = useState('')
  const [deDeck, setDeDeck] = useState<DeckData | null>(null)
  const [enDeck, setEnDeck] = useState<DeckData | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<DeckLanguage>('de')
  const [selectedCardId, setSelectedCardId] = useState('')
  const [search, setSearch] = useState('')
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirtyDe, setDirtyDe] = useState(false)
  const [dirtyEn, setDirtyEn] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [doneCardIds, setDoneCardIds] = useState<Set<string>>(new Set())
  const [hideDoneCards, setHideDoneCards] = useState(false)
  const frontTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const backTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const hasDirtyChanges = dirtyDe || dirtyEn

  const deCardById = useMemo(() => {
    const map = new Map<string, DeckCard>()
    for (const card of deDeck?.cards ?? []) {
      map.set(card.id, card)
    }
    return map
  }, [deDeck])

  const enCardById = useMemo(() => {
    const map = new Map<string, DeckCard>()
    for (const card of enDeck?.cards ?? []) {
      map.set(card.id, card)
    }
    return map
  }, [enDeck])

  const cardIds = useMemo(() => {
    const result: string[] = []
    const seen = new Set<string>()

    for (const card of deDeck?.cards ?? []) {
      if (!seen.has(card.id)) {
        seen.add(card.id)
        result.push(card.id)
      }
    }

    for (const card of enDeck?.cards ?? []) {
      if (!seen.has(card.id)) {
        seen.add(card.id)
        result.push(card.id)
      }
    }

    return result
  }, [deDeck, enDeck])

  const visibleCardIds = useMemo(() => {
    const term = search.trim().toLowerCase()
    return cardIds.filter((cardId) => {
      if (hideDoneCards && doneCardIds.has(cardId)) return false
      if (!term) return true

      const deCard = deCardById.get(cardId)
      const enCard = enCardById.get(cardId)
      const targetCard = activeLanguage === 'de' ? (deCard ?? enCard) : (enCard ?? deCard)
      if (!targetCard) return false

      const haystack = [
        cardId,
        targetCard.category,
        targetCard.front,
        targetCard.back,
        (targetCard.tags ?? []).join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [activeLanguage, cardIds, deCardById, doneCardIds, enCardById, hideDoneCards, search])

  const doneVisibleCount = useMemo(() => {
    let count = 0
    cardIds.forEach((cardId) => {
      if (doneCardIds.has(cardId)) count += 1
    })
    return count
  }, [cardIds, doneCardIds])

  const pairDiagnostics = useMemo(() => {
    const missingInEn: string[] = []
    const missingInDe: string[] = []
    if (!deDeck || !enDeck) {
      return { missingInEn, missingInDe }
    }

    for (const card of deDeck.cards) {
      if (!enCardById.has(card.id)) missingInEn.push(card.id)
    }
    for (const card of enDeck.cards) {
      if (!deCardById.has(card.id)) missingInDe.push(card.id)
    }
    return { missingInEn, missingInDe }
  }, [deDeck, enDeck, deCardById, enCardById])

  const activeDeck = activeLanguage === 'de' ? deDeck : enDeck
  const activePath = activeLanguage === 'de' ? selectedDePath : selectedEnPath
  const activeCardById = activeLanguage === 'de' ? deCardById : enCardById
  const pairedCardById = activeLanguage === 'de' ? enCardById : deCardById
  const activeCard = selectedCardId ? (activeCardById.get(selectedCardId) ?? null) : null
  const pairedCard = selectedCardId ? (pairedCardById.get(selectedCardId) ?? null) : null
  const previewCard = activeCard ?? pairedCard
  const isSelectedCardDone = selectedCardId ? doneCardIds.has(selectedCardId) : false

  const confirmDiscardChanges = useCallback(() => {
    if (!hasDirtyChanges) return true
    return window.confirm('Ungespeicherte Änderungen verwerfen?')
  }, [hasDirtyChanges])

  const loadDeckFile = useCallback(async (path: string) => {
    const response = await requestJson<DeckLoadResponse>(`/__deck-editor/load?path=${encodeURIComponent(path)}`)
    return normalizeDeck(response.deck)
  }, [])

  const loadSelectedDecks = useCallback(async () => {
    if (!selectedDePath) return

    setLoading(true)
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      const loadedDeDeck = await loadDeckFile(selectedDePath)
      setDeDeck(loadedDeDeck)
      setDirtyDe(false)

      if (selectedEnPath) {
        const loadedEnDeck = await loadDeckFile(selectedEnPath)
        setEnDeck(loadedEnDeck)
        setDirtyEn(false)
      } else {
        setEnDeck(null)
        setDirtyEn(false)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deck konnte nicht geladen werden.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }, [loadDeckFile, selectedDePath, selectedEnPath])

  useEffect(() => {
    let isCancelled = false

    const loadDeckList = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const response = await requestJson<DeckListResponse>('/__deck-editor/list')
        if (isCancelled) return
        const sorted = response.files
          .filter((filePath) => DECK_FILE_PATTERN.test(filePath))
          .sort((left, right) => left.localeCompare(right))
        setDeckFiles(sorted)

        if (sorted.length > 0) {
          setSelectedDePath((previousDePath) => {
            if (previousDePath) return previousDePath
            const initialDePath = sorted[0]
            setSelectedEnPath((previousEnPath) => previousEnPath || suggestEnglishDeckPath(initialDePath, sorted))
            return initialDePath
          })
        }
      } catch (error) {
        if (isCancelled) return
        const message = error instanceof Error ? error.message : 'Deckliste konnte nicht geladen werden.'
        setErrorMessage(message)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    void loadDeckList()
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedDePath) return
    void loadSelectedDecks()
  }, [loadSelectedDecks, selectedDePath, selectedEnPath])

  useEffect(() => {
    if (!selectedDePath) {
      setDoneCardIds(new Set())
      setHideDoneCards(false)
      return
    }

    const doneKey = deckScopedStorageKey(DONE_STATE_PREFIX, selectedDePath)
    const hideKey = deckScopedStorageKey(HIDE_DONE_PREFIX, selectedDePath)

    try {
      const rawDone = localStorage.getItem(doneKey)
      const parsedDone = rawDone ? JSON.parse(rawDone) : []
      if (Array.isArray(parsedDone)) {
        const normalized = parsedDone.filter((entry): entry is string => typeof entry === 'string')
        setDoneCardIds(new Set(normalized))
      } else {
        setDoneCardIds(new Set())
      }
    } catch {
      setDoneCardIds(new Set())
    }

    try {
      const rawHide = localStorage.getItem(hideKey)
      setHideDoneCards(rawHide === '1')
    } catch {
      setHideDoneCards(false)
    }
  }, [selectedDePath])

  useEffect(() => {
    if (!selectedDePath) return
    const doneKey = deckScopedStorageKey(DONE_STATE_PREFIX, selectedDePath)
    const serialized = JSON.stringify(Array.from(doneCardIds))
    localStorage.setItem(doneKey, serialized)
  }, [doneCardIds, selectedDePath])

  useEffect(() => {
    if (!selectedDePath) return
    const hideKey = deckScopedStorageKey(HIDE_DONE_PREFIX, selectedDePath)
    localStorage.setItem(hideKey, hideDoneCards ? '1' : '0')
  }, [hideDoneCards, selectedDePath])

  useEffect(() => {
    if (doneCardIds.size === 0) return
    const validIds = new Set(cardIds)
    setDoneCardIds((previous) => {
      const filtered = new Set<string>()
      previous.forEach((cardId) => {
        if (validIds.has(cardId)) filtered.add(cardId)
      })
      return filtered.size === previous.size ? previous : filtered
    })
  }, [cardIds, doneCardIds.size])

  useEffect(() => {
    if (cardIds.length === 0) {
      setSelectedCardId('')
      return
    }
    if (visibleCardIds.length === 0) {
      setSelectedCardId('')
      return
    }
    if (!selectedCardId || !visibleCardIds.includes(selectedCardId)) {
      setSelectedCardId(visibleCardIds[0])
    }
  }, [cardIds.length, selectedCardId, visibleCardIds])

  useEffect(() => {
    if (activeLanguage === 'en' && !selectedEnPath) {
      setActiveLanguage('de')
    }
  }, [activeLanguage, selectedEnPath])

  const updateActiveDeck = useCallback(
    (updater: (deck: DeckData) => DeckData) => {
      if (activeLanguage === 'de') {
        if (!deDeck) return
        setDeDeck((previous) => (previous ? updater(previous) : previous))
        setDirtyDe(true)
        return
      }

      if (!enDeck) return
      setEnDeck((previous) => (previous ? updater(previous) : previous))
      setDirtyEn(true)
    },
    [activeLanguage, deDeck, enDeck],
  )

  const updateSelectedCard = useCallback(
    (updater: (card: DeckCard) => DeckCard) => {
      if (!selectedCardId) return
      updateActiveDeck((deck) => {
        const index = deck.cards.findIndex((card) => card.id === selectedCardId)
        if (index < 0) return deck
        const cards = deck.cards.slice()
        cards[index] = updater(cards[index])
        return { ...deck, cards }
      })
    },
    [selectedCardId, updateActiveDeck],
  )

  const handleDeckPathChange = useCallback(
    (language: DeckLanguage, path: string) => {
      if (language === 'de') {
        if (path === selectedDePath) return
        if (!confirmDiscardChanges()) return
        setSelectedDePath(path)
        setSelectedEnPath(suggestEnglishDeckPath(path, deckFiles))
        setSearch('')
        setStatusMessage(null)
        setErrorMessage(null)
        return
      }

      if (path === selectedEnPath) return
      if (!confirmDiscardChanges()) return
      setSelectedEnPath(path)
      setStatusMessage(null)
      setErrorMessage(null)
    },
    [confirmDiscardChanges, deckFiles, selectedDePath, selectedEnPath],
  )

  const handleReload = useCallback(() => {
    if (!confirmDiscardChanges()) return
    void loadSelectedDecks()
  }, [confirmDiscardChanges, loadSelectedDecks])

  const handleSave = useCallback(async () => {
    if (!selectedDePath || !deDeck) return

    const errors: string[] = []
    errors.push(...collectDeckErrors(deDeck, `DE (${selectedDePath})`))
    if (selectedEnPath && enDeck) {
      errors.push(...collectDeckErrors(enDeck, `EN (${selectedEnPath})`))
    }
    if (selectedEnPath && !enDeck) {
      errors.push('EN-Datei ist gesetzt, konnte aber nicht geladen werden.')
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join('\n'))
      return
    }

    setSaving(true)
    setStatusMessage(null)
    setErrorMessage(null)
    try {
      await requestJson<DeckSaveResponse>('/__deck-editor/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedDePath, deck: deDeck }),
      })

      if (selectedEnPath && enDeck) {
        await requestJson<DeckSaveResponse>('/__deck-editor/save', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: selectedEnPath, deck: enDeck }),
        })
      }

      setDirtyDe(false)
      setDirtyEn(false)
      setStatusMessage('Deck erfolgreich gespeichert.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speichern fehlgeschlagen.'
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }, [deDeck, enDeck, selectedDePath, selectedEnPath])

  const handleDeckFieldChange = useCallback(
    (field: 'deckId' | 'title', value: string) => {
      updateActiveDeck((deck) => ({ ...deck, [field]: value }))
    },
    [updateActiveDeck],
  )

  const toggleCardDone = useCallback((cardId: string) => {
    setDoneCardIds((previous) => {
      const next = new Set(previous)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }, [])

  const insertSnippet = useCallback(
    (field: 'front' | 'back', snippet: string) => {
      if (!activeCard) return

      const textarea = field === 'front' ? frontTextareaRef.current : backTextareaRef.current
      const currentValue = activeCard[field]

      if (!textarea) {
        updateSelectedCard((card) => ({ ...card, [field]: `${currentValue}${snippet}` }))
        return
      }

      const start = textarea.selectionStart ?? currentValue.length
      const end = textarea.selectionEnd ?? currentValue.length
      const nextValue = `${currentValue.slice(0, start)}${snippet}${currentValue.slice(end)}`
      const cursor = start + snippet.length

      updateSelectedCard((card) => ({ ...card, [field]: nextValue }))

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(cursor, cursor)
      })
    },
    [activeCard, updateSelectedCard],
  )

  const handleEditorShortcut = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>, field: 'front' | 'back') => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        insertSnippet(field, '\n\n')
      }
    },
    [insertSnippet],
  )

  const handleCardIdChange = useCallback(
    (value: string) => {
      const currentId = selectedCardId
      if (!currentId) return
      updateSelectedCard((card) => ({ ...card, id: value }))
      setDoneCardIds((previous) => {
        if (!previous.has(currentId)) return previous
        const next = new Set(previous)
        next.delete(currentId)
        if (value.trim()) next.add(value.trim())
        return next
      })
      setSelectedCardId(value)
    },
    [selectedCardId, updateSelectedCard],
  )

  const handleAddCard = useCallback(() => {
    if (!activeDeck) return
    const existingIds = activeDeck.cards.map((card) => card.id)
    const newId = buildUniqueCardId(existingIds, 'new_card')
    const newCard: DeckCard = {
      id: newId,
      category: '',
      front: '',
      back: '',
      tags: [],
    }
    updateActiveDeck((deck) => ({ ...deck, cards: [...deck.cards, newCard] }))
    setSelectedCardId(newId)
    setIsFlipped(false)
  }, [activeDeck, updateActiveDeck])

  const handleDuplicateCard = useCallback(() => {
    if (!activeDeck || !activeCard) return
    const newId = buildUniqueCardId(
      activeDeck.cards.map((card) => card.id),
      `${activeCard.id}_copy`,
    )
    const duplicate: DeckCard = { ...activeCard, id: newId }
    updateActiveDeck((deck) => ({ ...deck, cards: [...deck.cards, duplicate] }))
    setSelectedCardId(newId)
    setIsFlipped(false)
  }, [activeCard, activeDeck, updateActiveDeck])

  const handleDeleteCard = useCallback(() => {
    if (!activeDeck || !activeCard) return
    if (!window.confirm(`Karte "${activeCard.id}" löschen?`)) return

    const remainingCards = activeDeck.cards.filter((card) => card.id !== activeCard.id)
    updateActiveDeck((deck) => ({ ...deck, cards: remainingCards }))
    setDoneCardIds((previous) => {
      if (!previous.has(activeCard.id)) return previous
      const next = new Set(previous)
      next.delete(activeCard.id)
      return next
    })
    if (remainingCards.length > 0) {
      setSelectedCardId(remainingCards[0].id)
    } else {
      setSelectedCardId('')
    }
    setIsFlipped(false)
  }, [activeCard, activeDeck, updateActiveDeck])

  const handleCreateMissingCard = useCallback(() => {
    if (!selectedCardId) return
    const source = pairedCard ?? {
      id: selectedCardId,
      category: '',
      front: '',
      back: '',
      tags: [],
    }
    updateActiveDeck((deck) => {
      if (deck.cards.some((card) => card.id === selectedCardId)) return deck
      const createdCard: DeckCard = { ...source, id: selectedCardId }
      return { ...deck, cards: [...deck.cards, createdCard] }
    })
  }, [pairedCard, selectedCardId, updateActiveDeck])

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary p-4 md:p-6">
      <div className="mx-auto max-w-[1800px] flex flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">Flashcard Deck Editor</h1>
              <p className="text-sm text-text-secondary">
                Lokale Editor-GUI für ein ausgewähltes Deck mit identischem Front-/Back-Rendering wie im Lernmodus.
              </p>
            </div>
            <LanguageToggle />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">DE-Deck (Pflicht)</span>
              <select
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                value={selectedDePath}
                onChange={(event) => handleDeckPathChange('de', event.target.value)}
              >
                {deckFiles.map((filePath) => (
                  <option key={filePath} value={filePath}>
                    {filePath}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">EN-Deck (optional)</span>
              <select
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                value={selectedEnPath}
                onChange={(event) => handleDeckPathChange('en', event.target.value)}
              >
                <option value="">Kein EN-Deck</option>
                {deckFiles.map((filePath) => (
                  <option key={filePath} value={filePath}>
                    {filePath}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReload}
              disabled={loading}
              className="rounded-lg border border-border-color px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Lade ...' : 'Neu laden'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || !selectedDePath}
              className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? 'Speichere ...' : 'Speichern'}
            </button>
            <span className="text-xs text-text-secondary">
              {hasDirtyChanges ? 'Ungespeicherte Änderungen vorhanden.' : 'Keine ausstehenden Änderungen.'}
            </span>
          </div>

          {statusMessage ? (
            <div className="mt-3 rounded-lg border border-green-300 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200 px-3 py-2 text-sm">
              {statusMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200 px-3 py-2 text-sm font-sans">
              {errorMessage}
            </pre>
          ) : null}
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[320px_1fr_430px] gap-4 items-start">
          <aside className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-2">Karten</h2>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Suche nach ID, Kategorie, Text ..."
              className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
            />
            <div className="mt-2 text-xs text-text-secondary">
              {visibleCardIds.length} von {cardIds.length} Karten
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideDoneCards}
                onChange={(event) => setHideDoneCards(event.target.checked)}
                className="h-4 w-4 accent-sky-600"
              />
              Erledigte ausblenden ({doneVisibleCount})
            </label>

            <div className="mt-3 space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {visibleCardIds.map((cardId) => {
                const existsInDe = deCardById.has(cardId)
                const existsInEn = enCardById.has(cardId)
                const isDone = doneCardIds.has(cardId)
                const card = activeLanguage === 'de'
                  ? (deCardById.get(cardId) ?? enCardById.get(cardId))
                  : (enCardById.get(cardId) ?? deCardById.get(cardId))

                return (
                  <div
                    key={cardId}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${selectedCardId === cardId
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30'
                      : 'border-border-color hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleCardDone(cardId)}
                        aria-label={`Karte ${cardId} als erledigt markieren`}
                        className="mt-0.5 h-4 w-4 accent-sky-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCardId(cardId)
                          setIsFlipped(false)
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className={`text-xs font-mono break-all ${isDone ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-sky-700 dark:text-sky-300'}`}>
                          {cardId}
                        </div>
                        <div className={`text-xs truncate ${isDone ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-text-secondary'}`}>
                          {card?.category || 'Ohne Kategorie'}
                        </div>
                      </button>
                    </div>
                    {selectedEnPath ? (
                      <div className="mt-1 flex gap-1 text-[10px]">
                        {!existsInDe ? <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5">fehlt DE</span> : null}
                        {!existsInEn ? <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5">fehlt EN</span> : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </aside>

          <div className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-lg border border-border-color overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveLanguage('de')}
                  className={`px-3 py-1 text-sm font-semibold ${activeLanguage === 'de'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-text-secondary'
                    }`}
                >
                  DE
                </button>
                <button
                  type="button"
                  disabled={!selectedEnPath}
                  onClick={() => setActiveLanguage('en')}
                  className={`px-3 py-1 text-sm font-semibold ${activeLanguage === 'en'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-text-secondary'
                    } disabled:opacity-40`}
                >
                  EN
                </button>
              </div>

              <div className="text-xs text-text-secondary">
                Preview aus: <span className="font-mono">{activePath || 'n/a'}</span>
              </div>
            </div>

            {selectedEnPath ? (
              <div className="text-xs text-text-secondary">
                Pair-Status: fehlt in EN {pairDiagnostics.missingInEn.length}, fehlt in DE {pairDiagnostics.missingInDe.length}
              </div>
            ) : null}

            <div className="w-full max-w-md mx-auto">
              {previewCard ? (
                <FlashcardFlipCard
                  category={previewCard.category || 'Kategorie'}
                  front={previewCard.front || ' '}
                  back={previewCard.back || ' '}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped((previous) => !previous)}
                  tapToFlipText={activeLanguage === 'de' ? 'Zum Umdrehen tippen' : 'Tap to flip'}
                />
              ) : (
                <div className="h-[336px] rounded-2xl border border-dashed border-border-color flex items-center justify-center text-text-secondary text-sm">
                  Keine Karte ausgewählt.
                </div>
              )}
            </div>

            {!activeCard && selectedCardId ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                Karte existiert nicht in der aktiven Sprache.
                <button
                  type="button"
                  onClick={handleCreateMissingCard}
                  className="ml-2 underline font-semibold"
                >
                  Karte aus Gegenstück erzeugen
                </button>
              </div>
            ) : null}
          </div>

          <aside className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">Editor</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={handleAddCard}
                disabled={!activeDeck}
                className="rounded-lg border border-border-color px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Neue Karte
              </button>
              <button
                type="button"
                onClick={handleDuplicateCard}
                disabled={!activeCard}
                className="rounded-lg border border-border-color px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Duplizieren
              </button>
              <button
                type="button"
                onClick={handleDeleteCard}
                disabled={!activeCard}
                className="rounded-lg border border-red-300 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
              >
                Löschen
              </button>
            </div>

            {!activeDeck ? (
              <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-text-secondary">
                Kein Deck für die aktive Sprache geladen.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    deckId
                  </label>
                  <input
                    value={activeDeck.deckId}
                    onChange={(event) => handleDeckFieldChange('deckId', event.target.value)}
                    className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    title
                  </label>
                  <input
                    value={activeDeck.title}
                    onChange={(event) => handleDeckFieldChange('title', event.target.value)}
                    className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                  />
                </div>

                {activeCard ? (
                  <>
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelectedCardDone}
                        onChange={() => {
                          if (selectedCardId) toggleCardDone(selectedCardId)
                        }}
                        className="h-4 w-4 accent-sky-600"
                      />
                      Karte als erledigt markieren (Haken erneut klicken zum Entfernen)
                    </label>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        id
                      </label>
                      <input
                        value={activeCard.id}
                        onChange={(event) => handleCardIdChange(event.target.value)}
                        className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        category
                      </label>
                      <input
                        value={activeCard.category}
                        onChange={(event) => updateSelectedCard((card) => ({ ...card, category: event.target.value }))}
                        className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        tags (kommagetrennt)
                      </label>
                      <input
                        value={formatTags(activeCard.tags)}
                        onChange={(event) => {
                          const tags = parseTags(event.target.value)
                          updateSelectedCard((card) => {
                            const updated = { ...card }
                            if (tags.length > 0) {
                              updated.tags = tags
                            } else {
                              delete updated.tags
                            }
                            return updated
                          })
                        }}
                        className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          front (Markdown/LaTeX)
                        </label>
                        <button
                          type="button"
                          onClick={() => insertSnippet('front', '\n\n')}
                          className="rounded border border-border-color px-2 py-1 text-[11px] font-semibold text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Absatz
                        </button>
                      </div>
                      <textarea
                        ref={frontTextareaRef}
                        value={activeCard.front}
                        onChange={(event) => updateSelectedCard((card) => ({ ...card, front: event.target.value }))}
                        onKeyDown={(event) => handleEditorShortcut(event, 'front')}
                        className="w-full min-h-[130px] rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm font-mono"
                      />
                      <div className="text-[11px] text-text-secondary">
                        Enter = neue Zeile, Ctrl/Cmd+Enter = Absatz
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          back (Markdown/LaTeX)
                        </label>
                        <button
                          type="button"
                          onClick={() => insertSnippet('back', '\n\n')}
                          className="rounded border border-border-color px-2 py-1 text-[11px] font-semibold text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Absatz
                        </button>
                      </div>
                      <textarea
                        ref={backTextareaRef}
                        value={activeCard.back}
                        onChange={(event) => updateSelectedCard((card) => ({ ...card, back: event.target.value }))}
                        onKeyDown={(event) => handleEditorShortcut(event, 'back')}
                        className="w-full min-h-[160px] rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm font-mono"
                      />
                      <div className="text-[11px] text-text-secondary">
                        Enter = neue Zeile, Ctrl/Cmd+Enter = Absatz
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-text-secondary">
                    In dieser Sprache existiert für die gewählte ID noch keine Karte.
                  </div>
                )}
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  )
}
