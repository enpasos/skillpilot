# Englisch Exam Pipeline

Das Curriculum `DE_HES_S_GYM_2_ENGLISCH.de.json` ist das kanonische Release-Artefakt.
Unter `abi/Englisch/` liegen nur abgeleitete Build- und QA-Artefakte.

## Offizielle Struktur 2026

- zwei Pruefungsteile
- Pflichtaufgabe `A`: Sprachmittlung
- Wahl zwischen `B1` und `B2` im zweiten Pruefungsteil
- Hilfsmittel: eingefuehrte ein- und zweisprachige Woerterbuecher, Textausgaben der Pflichtlektueren ohne Kommentar, Operatorenliste

## Aktueller Stand

Der aktuelle Batch umfasst:

- `sourceRef` am Curriculum
- phasenlokale Uebungsanker `E-Q4`
- materialgestuetzte Practice-Aufgaben
- freigegebene Offer-Anker `abi_gk_offer_2026` / `abi_lk_offer_2026`
- Erlassauszug und Blueprint unter `abi/Englisch/`
- `slot_matrix.json`
- `coverage_requirements.json`
- `build_english_exam_task_bank.py`
- `validate_english_exam_pipeline.py`

## Ableitungslogik

- `offer` wird ausschliesslich ueber die beiden freigegebenen Curriculum-Anker aufgeloest.
- `master` ist kein eigener Baum im Curriculum; die Pipeline leitet `gk_master_2026`
  und `lk_master_2026` aus Offer-Aufgaben plus phasenlokalen Practice-Aufgaben ab.
- `Q3.5 Globalization` ist im Erlass in Q2 verbindlich, wird im aktuellen Curriculum
  aber thematisch ueber `Global chances and challenges` abgedeckt.

## QA-Fokus

- Pflichtteil `A` muss echte Sprachmittlung bleiben und darf nicht in normales Schreiben kippen.
- `B1` und `B2` muessen materialgebundenes Schreiben mit integriertem Leseverstehen klar unterscheiden.
- LK-Aufgaben muessen dieselben Themen bearbeiten, aber sichtbar mehr begruendete Deutungs- und Bewertungsleistung verlangen.
