# Memory-Card Review Rollout

Generated from `docs/qa-ci/status/curriculum-quality-status.json`; status snapshot generated at 2026-05-17T10:27:04.501Z.

This report is a reproducible triage view, not a semantic decision ledger. It helps decide which curricula need real CQR-302 work next.

Only configured memory-card reviews are enforced by CI and the subject export release gate. A heuristic candidate count is just a work queue signal; it is never a pass or fail decision by itself.

## Current Gate

| Metric | Value |
| --- | --- |
| CQR-302 pass in this rollout table | 3 |
| CQR-302 open in this rollout table | 7 |
| Configured CQR-302 reviews | 3 |
| Missing CQR-302 configuration | 7 |

## Principles

- Do not restore `M5` by bulk-generating `no_memory_needed` ledgers.
- `memory_required` is allowed only for compact facts, formulas, vocabulary, notation, definitions, or similar hard recall items.
- A `memory_required` goal needs an active memory node, a deck, and kept cards that trace back to that exact goal.
- Subjects without active memory decks still need an explicit semantic no-memory review before they can pass CQR-302.

## Curriculum Triage

| Curriculum | Maturity | CQR-302 | Review goals | Heuristic candidates | Memory nodes | Primary cards | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Politik und Wirtschaft (Gymnasium, DE) | M4 | not_configured | 413 | 49 | 0 | 0 | Fachreview vor M5; Begriffslernen möglich, aber nicht automatisch deckpflichtig. |
| Biologie (Gymnasium, DE) | M4 | not_configured | 355 | 37 | 0 | 0 | Fachreview vor M5; harte Begriffe/Formeln/Symbole wahrscheinlich punktuell relevant. |
| Geschichte (Gymnasium, DE) | M4 | not_configured | 156 | 36 | 0 | 0 | Fachreview vor M5; Begriffslernen möglich, aber nicht automatisch deckpflichtig. |
| Wirtschaftswissenschaften (Gymnasium, DE) | M4 | not_configured | 303 | 30 | 0 | 0 | Fachreview vor M5; Begriffslernen möglich, aber nicht automatisch deckpflichtig. |
| Deutsch (Gymnasium, DE) | M4 | not_configured | 268 | 20 | 0 | 0 | Fachreview vor M5; Begriffslernen möglich, aber nicht automatisch deckpflichtig. |
| Informatik (Gymnasium, DE) | M4 | not_configured | 207 | 17 | 0 | 0 | Fachreview vor M5; harte Begriffe/Formeln/Symbole wahrscheinlich punktuell relevant. |
| Latein (Gymnasium, DE) | M4 | not_configured | 115 | 5 | 0 | 0 | Nicht pauschal freigeben; Vokabel- und Grammatik-Memory braucht eigene Source- und Deck-Entscheidung. |
| Mathematik (Gymnasium, DE) | M5 | pass | 750 | 180 | 5 | 50 | Aktive Memory-Knoten vorhanden; Ledger und Karten strikt aktuell halten. |
| Physik (Gymnasium, DE) | M5 | pass | 425 | 78 | 5 | 148 | Aktive Memory-Knoten vorhanden; Ledger und Karten strikt aktuell halten. |
| Chemie (Gymnasium, DE) | M5 | pass | 376 | 62 | 6 | 55 | Aktive Memory-Knoten vorhanden; Ledger und Karten strikt aktuell halten. |

## Candidate Examples

### Politik und Wirtschaft (Gymnasium, DE)

EU-Institutionen; Transparenzregeln; Wirtschaftsordnung; Nachhaltiges Wachstum; Völkerrecht

### Biologie (Gymnasium, DE)

Kennzeichen von Lebewesen ordnen; Bau der Pflanzenzelle beschreiben; Kennzeichen des Lebens erläutern; Enzymhemmung bewerten; Regulatorische Rahmen einordnen

### Geschichte (Gymnasium, DE)

Begriffe anwenden; Begriffe anwenden; Begriffe anwenden; Begriffe anwenden; Begriffe anwenden

### Wirtschaftswissenschaften (Gymnasium, DE)

Wettbewerbsordnung beurteilen; Ordnungsvorstellungen abwägen; Ordnungspolitische Konzepte vergleichen; Wirkungen wirtschaftspolitischer Ideen; Nachhaltiges Wachstum operationalisieren

### Deutsch (Gymnasium, DE)

Grammatik wiederholen; Grammatikalisches und orthografisches Wissen vertiefen; Lyrik-Grundbegriffe; Erzähltheorie Grundbegriffe; Drama-Grundbegriffe

### Informatik (Gymnasium, DE)

Aufbau von Rechnernetzen erklären; Graphbegriffe kennen; Recht auf informationelle Selbstbestimmung; Grundoperatoren anwenden; Weitere Operatoren nutzen

### Latein (Gymnasium, DE)

Lektürespezifische Grammatikphänomene analysieren; Lateinische Wörter aussprechen und sicher lernen; Unregelmäßige und lektürerelevante Formen mit Grammatikmitteln sichern; Kasusfunktionen, Tempus/Modus und pronominale Bezüge deuten; Wortschatz- und Grammatiklernen selbstständig organisieren

### Mathematik (Gymnasium, DE)

Natürliche Zahlen ordnen und vergleichen; Lagebeziehungen geometrischer Objekte beschreiben; Winkel messen, zeichnen und fachsprachlich beschreiben; Natürliche und ganze Zahlen multiplizieren und dividieren; Natürliche Zahlen als unbegrenzt fortsetzbar verstehen und große Zahlbezeichnungen verwenden

### Physik (Gymnasium, DE)

Temperatur und Wärme unterscheiden; Entstehung und Zerlegung von Farben erklären; Schallquellen und Schallempfänger beschreiben; Kern und Hülle des Atoms qualitativ beschreiben; Radioaktive Strahlung nachweisen und Wirkungen einordnen

### Chemie (Gymnasium, DE)

Allgemeine Sicherheitsregeln im Chemielabor anwenden; Stoffe und Eigenschaften beschreiben; Gefahrstoffsymbole und Kennzeichnungen deuten; Umgang und Entsorgung von Chemikalien begründen; Stoffe nach Struktur und Eigenschaften ordnen

