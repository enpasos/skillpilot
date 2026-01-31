# Work Notes: Exam / Pruefungsaufgaben Flow

## 1) Aktueller Stand (Anweisungen & Doku)

**Dateien / Quellen, die aktuell die Regeln definieren:**
- `ai/openai custom gpt/knowledge_docs/exam_proctor.md`
- `ai/openai custom gpt/system_instructions.md` (Trigger: `examData` -> Proctor-Modus)
- `docs/concept/curriculum-graph/node-types.md` (Abschnitt "Exam mode (AI proctor)")

**Kerngedanken im aktuellen Regelwerk:**
- Proctor-Modus wird **nur** aktiviert, wenn das aktuelle Ziel `examData` enthaelt.
- Workflow: kurzer Proctor-Header -> Task **verbatim** -> Einreichungs-Hinweis -> Nutzer loest -> bewerten mit `examData.solutionContent` und `examData.scoring` -> Ergebnis + Loesung -> ggf. Trainer-Mode fuer Nacharbeit.
- In `node-types.md` steht: Task **verbatim**; zusaetzlich kurzer Proctor‑Header + fixer Einreichungs‑Hinweis ausserhalb des Aufgabenblocks.
- In `exam_proctor.md` steht: Task **verbatim**, **Header + Einreichungs‑Hinweis erlaubt** (keine Hinweise, kein Chunking).
- Hinweis: **AI API liefert aktuell kein `examData`** (Proctor-Modus nur, wenn Host die vollen Goal-Daten injiziert).

## 2) Beobachtetes Problem (Screenshot)

- Das GPT zerlegt die Pruefungsaufgabe in Teilaufgaben und gibt Hinweise/Leitfragen.
- Das deutet auf **Trainer-Modus** hin (Proctor wurde nicht aktiviert) oder auf zu schwache Regeln (kein hartes "verbatim task only").
- Wahrscheinlichste Ursache: **`examData` wird dem GPT nicht uebergeben**, daher bleibt es im Trainer-Modus.

## 3) Gaps / Inkonsistenzen

1) **Verbatim-Pass-Through als harte Regel**
   - Task exakt wie hinterlegt, ohne Umformulierung, ohne Chunking.
   - Zusatztext nur als fixer Proctor‑Header + Einreichungs‑Hinweis.

2) **Doku-Drift**
   - `node-types.md`: "Task + Punkte" vs. `exam_proctor.md`: "nur TaskContent".
   - Fuer "genau so wie hinterlegt" ist nur TaskContent korrekt (Punkte nur, wenn sie im TaskContent stehen).

3) **Proctor-Trigger unsicher**
   - Wenn `examData` nicht in den AI-Context kommt, bleibt GPT im Trainer-Modus.
   - Dann greifen die Proctor-Regeln nie.

## 4) Vorschlag (Regeln / Doku)

### A) Verhalten im Proctor-Modus (neue harte Regeln)
**Zielbild:**
- Kurzer Proctor‑Header (Lernstand geladen, Proctor‑Modus, Aktives Ziel).
- Aufgabe **genau wie hinterlegt** anzeigen.
- **Keine** Hilfen, **keine** Re-Formulierungen, **kein** Chunking, **keine** Zwischenfragen.
- Pruefling gibt **eine** zusammenhaengende Loesung ab.
- Danach Bewertung anhand `examData.scoring` + `examData.solutionContent`.
- Ergebnis mitteilen und **danach** gemeinsam die Findings durchgehen.

**Konkret fuer `exam_proctor.md`:**
- "Display `examData.taskContent` verbatim." (keine Umformulierung, kein Chunking).
- Proctor‑Header erlaubt (kurz, neutral, Aktives Ziel).
- Einreichungs‑Hinweis nach dem Task erlaubt (fixe Zeile).
- "Wait for a single full submission; if user asks for help, only say: 'Bitte gib deine Loesung vollstaendig ab oder gib auf.'"
- Nach Bewertung: Findings strukturiert zurueckgeben, dann gemeinsame Durchsprache.

### B) Konsistenz in `node-types.md`
- Ersetzen von "Show taskContent and points" durch "Show taskContent verbatim; if points are part of the taskContent, they appear there".

### C) Technische Voraussetzung (Proctor-Trigger)
- **Sicherstellen, dass `examData` dem GPT vorliegt.**
  Optionen:
  1) AI-State liefert `examData` fuer das aktive Ziel (nur dort).
  2) Eigener AI-Endpoint: `getExamData(goalId)` (nur AI, nicht UI).
  3) Host injiziert `examData` direkt in den GPT-Context.

Ohne diese Aenderung bleibt das System im Trainer-Modus, selbst wenn die Regeln sauber sind.

## 5) Empfehlung (priorisiert)

1) **Regeln schaerfen** (exam_proctor.md + node-types.md) fuer "verbatim task only" + "single submission".
2) **Technisch sicherstellen**, dass `examData` beim GPT ankommt (sonst bleibt der Proctor-Modus aus).
3) Optional: A/B-Test mit einer Beispiel-Aufgabe und Checkliste (kein Hint, keine Zerlegung, nur Originaltext).


## 6) Umsetzung (durchgeführt)

- **Proctor-Regeln angepasst**: `ai/openai custom gpt/knowledge_docs/exam_proctor.md`
  - Proctor‑Header + Einreichungs‑Hinweis erlaubt (ausserhalb des Aufgabenblocks)
  - Task wird **verbatim** ausgegeben (ohne Umformulierung / Chunking)
  - Einmalige Gesamtabgabe gefordert
  - Nach Bewertung: Findings-Review im Trainer-Modus

- **Konzept-Doku konsistent gemacht**: `docs/concept/curriculum-graph/node-types.md`
  - Verbatim-Task + kurzer Proctor‑Header + fixer Einreichungs‑Hinweis
  - Single-Submission-Flow
  - Findings-Review nach Bewertung

- **System-Instruction ergänzt**: `ai/openai custom gpt/system_instructions.md`
  - Explizite Pflicht: taskContent wortgetreu, ohne Zusatztext

- **AI-State erweitert**: `backend/src/main/java/com/skillpilot/backend/api/FrontierGoal.java`
  - `examData` Feld hinzugefügt
  - `activeGoal` liefert `examData` (damit Proctor-Modus sicher triggert)

- **AI-OpenAPI angepasst**: `ai/skillpilot-api-4ai.json`
  - `examData` Schema ergänzt
  - `FrontierGoal.examData` ergänzt
