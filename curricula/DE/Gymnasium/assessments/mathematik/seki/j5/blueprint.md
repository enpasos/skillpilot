# J5 Exam Blueprint - Mathematics Sek I

Status: release candidate v3 blueprint

Target:

- Subject: Mathematik
- School form: Gymnasium
- Stage: Sekundarstufe I
- Year: Jahrgangsstufe 5
- Intended duration: 45 minutes
- Total points: 30 BE
- Aids: ruler, pencil, colored pencil; no calculator required

Pipeline:

- Reference pool: `tmp/seki-math-exam-reference-pool/`
- Checklist: `../quality-checklist.md`
- Draft: `draft_v3.md`
- Solution: `solution_v3.md`
- External review: `external_review.md`
- Release decision: `release_candidate.md`

---

## Curriculum Coverage Targets

Primary J5 goals targeted by this package:

| Goal ID | Title |
| --- | --- |
| `fe07241a-b779-5f35-a82d-7aa51ae74f42` | Natürliche Zahlen runden |
| `1a25ef44-f310-4c23-9ba8-44baec60d3b0` | Natürliche Zahlen als unbegrenzt fortsetzbar verstehen und große Zahlbezeichnungen verwenden |
| `9ef6c4fa-b97a-5d7a-86c1-96690f02d916` | Natürliche Zahlen ordnen und vergleichen |
| `d825f7ce-e19b-594a-8181-eff199c21d93` | Mit natürlichen Zahlen in Grundsituationen rechnen |
| `191c67db-44a8-4f63-994a-d85e8e301194` | Rechenvorteile mit Kommutativ- und Assoziativgesetz nutzen |
| `e82d8d3a-9012-5482-afe6-ab0d727a49bb` | Rechnungen mit Umkehroperationen überprüfen |
| `d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe` | Ganze Zahlen ordnen und an der Zahlengeraden darstellen |
| `3fde4db5-9e92-5f3a-98e1-d386a42b9e01` | Ganze Zahlen subtrahieren |
| `8d1bb6ce-2433-4637-94ba-3bdc35fa5b10` | Aussagen über ganze Zahlen prüfen und mit Gegenbeispielen widerlegen |
| `25593605-5e13-55cc-9a05-8f3d737e15e9` | Punkte, Strecken, Geraden und Kreise im Koordinatensystem darstellen |
| `31a89d59-7d45-5e60-a8e8-561001b05f2d` | Punktmengen mit Abstandsbedingungen kennzeichnen |
| `d98849c7-bd0b-50d4-90aa-6293a3adb211` | Vierecke erkennen, darstellen und Eigenschaften nutzen |
| `03a87896-088d-4b21-a37b-d0604d784540` | Größen in Sachsituationen mithilfe von Bezugsgrößen schätzen |
| `d6c3fb37-ece6-5b56-9221-1eeb21845877` | Umfang und Flächeninhalt unterscheiden und anwenden |
| `0bd7dc9b-c7f9-52e6-b374-a019edfd821c` | Rechteckflächenformel aus dem Messprinzip erklären |
| `11e3cf89-9224-5894-8e4a-ae8ff5af0119` | Einfache additive Gleichungen durch Umkehraufgaben lösen |
| `54148506-c23f-41b8-959b-068dd194cf15` | Einfache multiplikative Gleichungen durch Umkehroperationen lösen |

Explicit non-coverage:

- Formal fraction arithmetic is not assessed.
- Later algebraic term transformations are not assessed.
- Formal function concepts are not assessed.
- Angle construction is not central in this draft.

---

## Task Matrix

| Task | Context | Main focus | Covered goal IDs | Design pattern | Points |
| --- | --- | --- | --- | --- | ---: |
| 1 | Material fuer das Schulfest | natural numbers, operations, rounding, order, finite-list vs natural-number continuation | `d825f7ce-e19b-594a-8181-eff199c21d93`, `191c67db-44a8-4f63-994a-d85e8e301194`, `fe07241a-b779-5f35-a82d-7aa51ae74f42`, `9ef6c4fa-b97a-5d7a-86c1-96690f02d916`, `1a25ef44-f310-4c23-9ba8-44baec60d3b0` | low floor/high ceiling, representation table, natural-number reasoning | 6 |
| 2 | Wetterstation auf dem Schulhof | integer order and differences | `d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe`, `3fde4db5-9e92-5f3a-98e1-d386a42b9e01`, `8d1bb6ce-2433-4637-94ba-3bdc35fa5b10` | misconception design, number-line reasoning | 6 |
| 3 | Arbeitsfläche im Klassenraum | coordinates, rectangle area, estimate | `25593605-5e13-55cc-9a05-8f3d737e15e9`, `d6c3fb37-ece6-5b56-9221-1eeb21845877`, `0bd7dc9b-c7f9-52e6-b374-a019edfd821c`, `03a87896-088d-4b21-a37b-d0604d784540` | representation change, model critique | 6 |
| 4 | Sitzecke im Koordinatensystem | coordinates, distance point set, rectangle vs square | `25593605-5e13-55cc-9a05-8f3d737e15e9`, `31a89d59-7d45-5e60-a8e8-561001b05f2d`, `d98849c7-bd0b-50d4-90aa-6293a3adb211` | representation change, misconception design, property reasoning | 6 |
| 5 | AG-Anmeldung und Gruppen | equations, inverse checks, remainders | `11e3cf89-9224-5894-8e4a-ae8ff5af0119`, `54148506-c23f-41b8-959b-068dd194cf15`, `e82d8d3a-9012-5482-afe6-ab0d727a49bb`, `d825f7ce-e19b-594a-8181-eff199c21d93` | symbolic-to-verbal interpretation, practical decision | 6 |

Total: 30 BE

---

## Release Decision

- External review completed on 2026-06-28.
- Decision: approved for release candidate.
- Findings `J5-REV-01` and `J5-REV-02` are resolved in `findings.md` and `finding_resolution_v2.md`.
- `draft_v3.md` and `solution_v3.md` are the promoted source artifacts.
- Post-release user finding `J5-REV-03` was resolved on 2026-06-30 without changing point totals or covered goals.
