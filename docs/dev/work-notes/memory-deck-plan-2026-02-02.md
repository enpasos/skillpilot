# Memory Plan: Single Math Deck with Prerequisite Gating

> Historical work-notes record, 2 February 2026. It documents how this work was done at that time.
> It is not current process and not a source of truth.
> Current reference: [node types](../../concept/skill-graph/node-types.md)

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
- **Zwischensync**: nach je 20 Karten (oder manuell per Button) wird der lokale SRS-State ans Backend gesendet (`PUT /api/ui/learners/{id}/client-state`).
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

## Review: Memory Plan
### Strengths
- Clear Goal Definition: The "Zielbild" section concisely states the objective (one deck, one node, dynamic unlocking).
- Well-Defined Unlock Logic: The prerequisite gating using `effectiveRequires` + mastery threshold is sound and aligns with graph semantics.
- Options Documented: Both tag-based and field-based mapping are presented with pros, making the trade-off explicit.
- Decisions Captured: "Offene Entscheidungen" lists the key choices (reset migration, 0.9 threshold, tag-based mapping) for traceability.
- Actionable Next Steps: The 5-step plan provides a clear implementation path.

### Suggestions / Questions
| Area | Feedback |
| --- | --- |
| Migration | "Reset (keine Zusammenführung)" is noted, but the plan doesn't address how to communicate this to users. Consider a UI notice or changelog entry. |
| SRS Key Naming | "ein SRS-Key für den einzigen Mem-Knoten" – document the proposed key format explicitly (e.g., `srs_state_${skillPilotId}_MATH_MASTER`). |
| Sync Granularity | "Zwischensync nach je 20 Karten" – count-based vs time-based? Consider a `beforeunload` sync fallback for browser closes. |
| nodeKind Integration | If available, explicitly set `nodeKind: \"memory\"` in the single mem-node to align with schema. |
| Deep-Link Behavior | If `nodeKind: \"memory\"`, clarify whether GPT treats it like `srs-deck:` (deep-link, no chat teaching). |
| Deck File Location | `/data/hes_math_master_deck.json` – confirm this is `app/public/data/` and curriculum-specific. |

### Minor Edits
- Line 13: "0.9 (optional 0.8)" – if the decision is 0.9, remove "optional 0.8" to avoid ambiguity.
- Term consistency: "Mem-Knoten" vs "Memorisierungs-Knoten" – pick one term.

### Summary
The plan is solid and ready for implementation. Recommended next refinements:
- Add explicit `nodeKind: \"memory\"` to the planned node definition.
- Document the SRS key naming convention.
- Add a `beforeunload` sync fallback for robustness.
