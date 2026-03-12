# Economics Exam Pipeline

Der kanonische fachliche Release-Pfad fuer Wirtschaftswissenschaften bleibt das Curriculum:

- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_WIRTSCHAFT.de.json`

Die Wirtschaft-Pipeline umfasst jetzt:

- 2026-Erlassauszug fuer das Fach
- offiziellen 2026-Blueprint
- lokale Uebungsanker und phase-practice-Aufgaben im Curriculum
- zwei kanonische Offer-Anker im Curriculum
- `slot_matrix.json`
- `coverage_requirements.json`
- `build_economics_exam_task_bank.py`
- `validate_economics_exam_pipeline.py`

Modellbesonderheit:

- Anders als Bio/Chemie/Physik gibt es 2026 in Wirtschaft nur drei Vorschlaege.
- Der Pruefling waehlt aus `A`, `B`, `C` genau einen Vorschlag.
- Fuer SkillPilot werden die Vorschlaege so modelliert:
  - `A`: Q1 Demokratie / Rechtsstaat / Marktordnung / Steuerpolitik
  - `B`: Q2 Wirtschaftspolitik / Wettbewerb / Preisniveaustabilitaet / Sozialstaat
  - `C`: Q3 Globalisierung / Wechselkurs / Aussenwirtschaftspolitik

Zielzustand analog zu Mathe und Physik:

- nur die Offer-Anker leben als Release-Struktur im Curriculum
- Master-Sets werden aus Offer-Tasks plus Phase-Practice-Tasks abgeleitet
- `abi/Wirtschaft/*` bleibt Build- und QA-Infrastruktur
