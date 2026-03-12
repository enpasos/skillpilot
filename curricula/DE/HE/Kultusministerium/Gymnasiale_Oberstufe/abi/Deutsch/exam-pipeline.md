# Deutsch Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_DEUTSCH.de.json` ist das kanonische Release-Artefakt.
Unter `abi/Deutsch/` liegen nur abgeleitete Build- und QA-Artefakte.

## Offizielle Struktur 2026

- vier Vorschlaege `A-D`
- genau ein Vorschlag wird bearbeitet
- Aufgabenarten nach KMK-Standards:
  - textbezogenes Schreiben
  - materialgestuetztes Verfassen informierender und argumentierender Texte

## Aktueller Stand

Der aktuelle Batch umfasst:

- `sourceRef` am Curriculum
- phasenlokale Uebungsanker `E-Q4`
- erste materialgestuetzte Practice-Aufgaben
- freigegebene Offer-Anker `abi_gk_offer_2026` / `abi_lk_offer_2026`
- Erlassauszug und Blueprint unter `abi/Deutsch/`
- `slot_matrix.json`
- `coverage_requirements.json`
- `build_german_exam_task_bank.py`
- `validate_german_exam_pipeline.py`

## Ableitungslogik

- `offer` wird spaeter nur ueber die beiden freigegebenen Curriculum-Anker aufgeloest.
- `master` ist kein eigener Baum im Curriculum; die Pipeline leitet `gk_master_2026`
  und `lk_master_2026` aus Offer-Aufgaben plus phasenlokalen Practice-Aufgaben ab.

## Naechster Batch

Der naechste Batch baut die eigentlichen GK-/LK-Offer-Aufgaben `A-D`.

Erst danach koennen die Deutsch-Offer-Sets `draftReady` werden.
