# Work Notes: Flashcard Editor GUI (lokal, DE/EN)

Stable reference documentation now lives in `docs/dev/flashcard-editor.md`.
This work-notes file keeps implementation notes and local planning context.

## Ziel
- Eine **zweite GUI** unter eigener Route, lokal startbar.
- Es wird immer nur **ein ausgewähltes Deck** bearbeitet (optional als DE/EN-Paar).
- **Front-/Back-Rendering identisch** zur normalen SRS-GUI (`FlashcardDrill`).
- Karten können direkt in der GUI editiert und in die JSON-Datei zurückgeschrieben werden.

## Rahmenbedingungen aus dem Repo
- Source of Truth für Decks: `curricula/**/json/*_deck*.json`.
- Für die App werden Decks zusätzlich nach `app/public/data/` gespiegelt.
- Aktuelles Karten-Rendering in `app/src/components/srs/FlashcardDrill.tsx` mit:
  - `ReactMarkdown`
  - `remark-math`
  - `rehype-katex`
  - gleichen Tailwind-Klassen für Front/Back

## Architektur-Entscheidung (MVP)
- **Kein drittes Projekt**, sondern zweite GUI als neue Route in der bestehenden React-App.
- Route: `/flashcard-editor` (ohne Login/Skillpilot-ID).
- Lokales Datei-I/O über **Vite-Dev-Middleware** (nur im Dev-Server), nicht über produktive API:
  - `GET /__deck-editor/list`
  - `GET /__deck-editor/load?path=...`
  - `PUT /__deck-editor/save`
- Sicherheitsregel: nur Dateien unter `curricula/**/json/` mit `_deck*.json`; Path-Traversal blockieren.

## Rendering-Parität (wichtigster Punkt)
- Gemeinsame Renderer-Komponente extrahieren, z. B.:
  - `app/src/components/srs/FlashcardMarkdown.tsx`
  - `app/src/components/srs/FlashcardFlipCard.tsx`
- `FlashcardDrill` auf diese Shared-Komponenten umstellen.
- Editor-Preview nutzt exakt dieselben Shared-Komponenten.
- Ergebnis: kein Drift zwischen Lern-GUI und Editor-GUI.

## DE/EN-Handling
- Editor arbeitet mit einem **Deck-Set**:
  - `dePath` (Pflicht)
  - `enPath` (optional)
- UI:
  - Deck-Auswahl oben (DE-Datei + optionale EN-Datei)
  - Sprach-Tabs `DE | EN` pro Karte
- Datenmodell:
  - Karten primär über `id` gematcht
  - Warnungen bei ID-Mismatch zwischen DE/EN
  - Speichern schreibt jeweils nur die geladenen Dateien

## UX-Plan (MVP)
- Linke Spalte: Kartenliste (Suche, Kategorie-Filter, Dirty-Markierung).
- Mitte: Live-Preview als Flip-Card (wie normale GUI).
- Rechte Spalte: Edit-Form für:
  - `id`
  - `category`
  - `tags[]`
  - `front` (Markdown/LaTeX)
  - `back` (Markdown/LaTeX)
- Aktionen:
  - Karte anlegen
  - Karte duplizieren
  - Karte löschen (mit Confirm)
  - Speichern
  - Änderungen verwerfen (Reload)

## Validierung vor Save
- `deckId`, `title`, `cards` vorhanden.
- Pro Karte: `id`, `front`, `back`, `category` Pflicht.
- `id` eindeutig innerhalb des Decks.
- `tags` ist Array aus Strings (falls gesetzt).
- Bei DE/EN-Paar: ID-Diff als Warnung, optional Quick-Fix „fehlende Karte erzeugen“.

## Dateifluss beim Speichern
1. Editor speichert nach `curricula/.../json/<deck>.json` (Source of Truth).
2. Danach automatische Spiegelung nach `app/public/data/<basename>`.
3. JSON-Format einheitlich (`2` spaces, newline at EOF), damit Diffs sauber bleiben.

## Umsetzungspakete

### Paket 1: Shared Rendering extrahieren
- Neue Komponenten unter `app/src/components/srs/`.
- `FlashcardDrill` auf Shared-Renderer umbauen.
- Kurzer visueller Check mit existierendem Deck.

### Paket 2: Lokale Deck-API im Dev-Server
- `app/vite.config.ts`: Middleware für `__deck-editor`.
- Endpunkte `list/load/save` inkl. Pfadvalidierung.
- Nur in `vite dev` aktiv.

### Paket 3: Neue Editor-View
- `app/src/views/FlashcardEditorView.tsx`.
- Route in `app/src/App.tsx` + Public-Route-Freigabe.
- Lade-/Speicherstatus, Fehlerbanner, Dirty-State.

### Paket 4: DE/EN-Paarmodus
- Optionale zweite Datei laden.
- Sprach-Tabs und ID-Abgleich.
- Save in eine oder zwei Dateien.

### Paket 5: QA + Dokumentation
- Kurz-Doku in `docs/dev/flashcard-editor.md`:
  - Start
  - unterstützte Dateiformate
  - bekannte Limits
- Optional npm-Script: `npm run dev:deck-editor` (Alias auf `vite`).

## Start/Benutzung (Zielbild)
1. `cd app`
2. `npm run dev`
3. Browser: `http://localhost:5173/flashcard-editor`
4. Deck (DE, optional EN) auswählen, Karten editieren, speichern.

## Akzeptanzkriterien
- Ich kann lokal genau **ein Deck** auswählen und bearbeiten.
- Front/Back sehen im Editor visuell gleich aus wie in `FlashcardDrill`.
- Markdown + LaTeX werden auf beiden Seiten korrekt gerendert.
- Save schreibt in `curricula/.../json/` und spiegelt nach `app/public/data/`.
- DE/EN-Paar kann gemeinsam gepflegt werden; Mismatches werden sichtbar.

## Risiken / offene Punkte
- Vite-Dev-Middleware ist bewusst lokal; kein Production-Feature.
- Physik-Decks haben aktuell nur `.de.json`; EN bleibt optional.
- Bei sehr großen Decks ggf. Virtualisierung für Kartenliste nachziehen (später).
