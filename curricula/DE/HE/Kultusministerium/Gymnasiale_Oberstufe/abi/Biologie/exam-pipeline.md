# Biology Exam Pipeline

Der kanonische fachliche Release-Pfad fuer Biologie bleibt das Curriculum:

- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_BIOLOGIE.de.json`

Die aktuelle Biologie-Pipeline umfasst jetzt:

- Quellenpaket fuer das Landesabitur 2026
- ersten offiziellen Blueprint
- lokale Uebungsanker und reale phase-practice-Aufgaben im Curriculum
- zwei kanonische Offer-Anker im Curriculum
- `slot_matrix.json`
- `coverage_requirements.json`
- `build_biology_exam_task_bank.py`
- `validate_biology_exam_pipeline.py`

Zielzustand analog zu Mathe und Physik:

- nur die Offer-Anker leben als Release-Struktur im Curriculum
- Master-Sets werden spaeter aus Offer-Tasks plus Phase-Practice-Tasks abgeleitet
- `abi/Biologie/*` bleibt Build- und QA-Infrastruktur

Abgeleitete Artefakte:

- `task_bank.json`
- Validator-Reports unter `tmp/`

Wichtige Modellregel:

- Die normalen Lernrouten enden in phasenlokalen Uebungszielen wie `Uebungen E-Phase`, `Uebungen Q1`, `Uebungen Q2`, `Uebungen Q3`, `Uebungen Q4`.
- Der globale Abi-Zweig bleibt davon getrennt.
- Es wird kein Master-Baum in die Curriculum-`contains`-Struktur geschrieben.

Aktueller Status:

- Bio hat einen 2026-Erlassauszug fuer das Fach.
- Bio hat einen offiziellen Quellen-Blueprint mit Mapping auf die vorhandene Landscape.
- Bio hat phase-practice-Aufgaben fuer `E` bis `Q4`.
- Bio hat eine lauffaehige erste Offer-/Master-Pipeline.
- Die eigentlichen 2026-GK/LK-Offer-Aufgaben fehlen noch; genau diese Luecken werden durch Builder und Validator jetzt explizit sichtbar.
