# Memory Plan: Single Math Deck with Prerequisite Gating

## Zielbild
- Genau **ein** Memorisierungs-Deck für Mathematik.
- **Ein** Memorisierungs-Knoten im Graphen.
- Karten werden **dynamisch freigeschaltet**, wenn
  - keine `effectiveRequires` vorhanden sind **oder**
  - alle `effectiveRequires` als gemeistert gelten.

## Kernidee (Freischaltlogik)
Eine Karte ist „verfügbar“, wenn das zugeordnete Lernziel freigeschaltet ist:
- `effectiveRequires` für das Ziel sind leer, **oder**
- alle `effectiveRequires` erfüllen `mastery >= MASTERED_THRESHOLD` (aktuell 0.9, optional 0.8).

## Zuordnung Karte → Lernziel
**Option A (Tag-basiert):**
- Karte bekommt `tags: ["goal:<GOAL_ID>"]`.
- Vorteil: kompatibel mit bestehendem Tag-Filter.

**Option B (Feld-basiert):**
- Karte bekommt neues Feld `goalId: "<GOAL_ID>"`.
- Vorteil: klarer, weniger Tag-Hacks.

## UI/Runtime Änderungen (Konzept)
1. **Ein Deck laden** (z. B. `/data/hes_math_master_deck.json`).
2. **Mapping** von Karte → Goal herstellen (Tag oder Feld).
3. **Freischalten** anhand `effectiveRequires` + `mastery`.
4. **Queue** nur aus freigeschalteten Karten bilden.

## SRS-State / Persistenz
- Aktuell: pro Mem-Knoten `srs_state_${skillPilotId}_${goalId}`.
- Neu: **ein** SRS-Key für den einzigen Mem-Knoten.
- Offene Frage: **Migration** der alten SRS-States
  - Option 1: einmalig zusammenführen.
  - Option 2: neu starten (Reset).

## Struktur im Graphen
- Bisher: mehrere Mem-Knoten (Analysis/LinAlg/Stochastik/Basics/Q4).
- Neu: **ein** Mem-Knoten (z. B. „Mathe-Memorization“).
- Alte Mem-Knoten entfernen oder deaktivieren.

## Offene Entscheidungen
1. **Migration**: Reset (keine Zusammenführung).
2. **Mastery-Schwelle**: 0.9 (Status quo, `MASTERED_THRESHOLD`).
3. **Mapping-Variante**: Tag-basiert (`goal:<id>`).

## Nächste Schritte (wenn entschieden)
1. **Master-Deck** bauen (alle Karten zusammenführen).
2. **Mapping** zu Goals in Karten ergänzen.
3. **Single Mem-Knoten** in `DE_HES_S_GYM_2_MATHEMATIK.de.json` anlegen.
4. **UI-Filter** in `FlashcardDrill` erweitern (Freischaltung prüfen).
5. **Optional**: Migrationsskript für lokale SRS-States.
