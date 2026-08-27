# Mathematik/Physik Deep-Understanding-Rollout – Review-Pause 2026-08-27

## Zweck und Commit-Grenze

Dieser Nachtrag sichert die nach dem deployfähigen Checkpoint vom 26. August
begonnenen unabhängigen Reviewrunden als fortsetzbare QA-Evidenz. Er erweitert
den fachlichen Rollout noch nicht: Es wurden weder kanonische Lernziele noch
Graphen, Visualisierungen, öffentliche Artefakte, App-/Backend-Code oder der
eingefrorene OpenAI-Coach-V1-Vertrag verändert.

Die neuen Reviewkandidaten haben ausdrücklich keine Freigabeautorität. Solange
Synthese, Resolution und positive Understanding-Evidence fehlen, zählen sie
nicht zum strengen End-to-End-Fortschritt. Dieser bleibt deshalb bei:

| Fach | Vollständig durch die Rollout-Gates | Fortschritt |
| --- | ---: | ---: |
| Mathematik | 82 / 786 | 10,4 % |
| Physik | 61 / 438 | 13,9 % |

## Mathematik: Batch 004

Das Paket
[`batch-004`](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-004)
enthält 20 aktuelle Ziele und zwei voneinander unabhängige, blind ausgeführte
Reviewrunden:

- Runde A: 17 `keep`, 2 `revise`, 1 `split_review`;
- Runde B: 18 `keep`, 2 `revise`, 0 `split_review`.

Sechzehn gegenwärtige Fassungen wurden von diesen beiden Runden inhaltlich als
tragfähig beurteilt. Sie wurden deshalb in
[`batch-004a-uncontested-16-current-v1`](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/batch-004a-uncontested-16-current-v1)
noch einmal gegen die aktuell gebundenen Buchbytes unabhängig geprüft. Diese
strengere Nachprüfung ergab:

- Runde A: 15 `keep`, 1 `revise`, 0 `split_review`;
- Runde B: 14 `keep`, 1 `revise`, 1 `split_review`.

Damit bleiben 14 aktuelle Fassungen auch in der Nachprüfung beidseitig
unstrittig. Zwei zusätzliche Fragen wurden sichtbar:

- `7dea79d2-67f2-4d92-b6cc-ad1b953dca3d`: beide Runden verlangen, die
  Funktionseigenschaft als genau einen Ausgabewert je zulässigem Eingabewert
  auszudrücken, damit „eindeutige Zuordnung“ nicht mit Injektivität verwechselt
  werden kann;
- `0afe00fe-8cbc-4ed4-8b50-84494067e362`: Runde B empfiehlt zu prüfen, ob das
  Deuten von Termen und ihr äquivalentes Umformen getrennte Kompetenzen bilden
  sollten.

Zusammen mit den vier Fällen aus dem Ausgangsbatch bleiben damit sechs Fragen
isoliert und werden nicht automatisch in das Curriculum übernommen:

- `3d49cd27-3a84-50eb-ac35-f0b0bee80df2`: beide Runden sehen bei den
  dynamischen Zusammenhängen zwischen Längen, Umfang, Fläche und Volumen eine
  Präzisierung als nötig an;
- `f3167cab-bb23-4bb9-8a27-22e3c5015d44`: nur Runde A verlangt bei
  proportionalen Funktionen die eindeutigere Formulierung „Ursprungsgerade“;
- `bd8fd6d5-7155-45a5-96f0-008a4e9acb3a`: nur Runde B beanstandet die
  tautologische Zinsrechnungsformulierung;
- `058bf6de-6c0e-4298-b054-9e8dff6e6a66`: Runde A empfiehlt eine fachliche
  Split-Prüfung für lineare Gleichungen, Verhältnisgleichungen und
  Lösbarkeitsaussagen, während Runde B die bestehende Kompetenzkette als
  zusammenhängend bewertet.

Der letzte Fall ist ein echter fachlicher Grenzfall. Vor einer späteren
Strukturänderung müssen insbesondere IDs, `requires`-/`contains`-Kanten,
Quellenmappings, Composition Views und Prüfungsabdeckung gemeinsam adjudiziert
werden.

## Physik: Batch 007

Das Paket
[`batch-007-seki-acoustics-optics-7-current-v1`](https://github.com/enpasos/skillpilot/tree/main/curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-27/batch-007-seki-acoustics-optics-7-current-v1)
enthält sieben aktuelle Sek-I-Ziele aus Akustik und Optik:

- Runde A: 5 `keep`, 2 `revise`, 0 `split_review`;
- Runde B: 5 `keep`, 1 `revise`, 1 `split_review`.

Vier gegenwärtige Fassungen sind in beiden Runden fachlich unstrittig. Drei
Fälle bleiben bewusst offen:

- `c1006f55-0406-48cc-92d4-0d8345897cf4`: beide Runden verlangen eine
  fachlich sauberere Beziehung zwischen schwingender Quelle und erzeugtem
  Schall;
- `078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5`: nur Runde A fordert, dass die im
  Titel angekündigte qualitative Bildinterpretation auch Bildlage,
  Orientierung und Größe sichtbar abdeckt;
- `3e33813d-db75-4571-8345-3845b02b956d`: Runde B empfiehlt zu prüfen, ob
  Ohr-/Hörmodell und die Bewertung von Lärmfolgen zwei getrennte Kompetenzen
  bilden sollten.

Auch hier wurde keine Kandidatenformulierung in die kanonische Landschaft
geschrieben.

## Abschlussprüfung

Der pausierte Stand wurde mit folgenden Grenzen geprüft:

- alle drei Standalone-Batches sowie beide Runden und ihre Dual-Summaries sind
  formal gültig;
- der strenge Deep-Understanding-Check meldet weiterhin 82/786 für Mathematik,
  61/438 für Physik und 0 Blocking Issues;
- der Selbsttest der strengen Fünf-Gate-Schnittmenge besteht;
- alle neun geschützten Curriculum-Reifegraduntergrenzen bestehen;
- Dokumentationslinks, Dokumentationsindizes, Generated-Status-Registry und
  Generated-Notices bestehen;
- der OpenAI-Review-Freeze-Check bleibt grün.

Die generierten Curriculum-Statussnapshots wurden nicht mit lokal vorhandenen,
Git-ignorierten PDF-Arbeitskopien neu gebunden. Eine lokale Regeneration hätte
ausschließlich 356 maschinenabhängige `available`-Flags und den Zeitstempel
geändert, nicht Reifegrad, Regeln oder Curriculumdaten; ein sauberer
CI-Checkout enthält diese Arbeitskopien absichtlich nicht.

## Saubere Fortsetzung

Bei einer späteren Fortsetzung gilt weiterhin **KEEP by default**. Sinnvolle
nächste Schritte sind:

1. die drei Split-Fragen fachlich und mit ihren abhängigen Kanten/Mappings
   adjudizieren;
2. nur bestätigte Formulierungsschwächen minimal und bilingual korrigieren;
3. jede geänderte aktuelle Fassung erneut in zwei unabhängigen Runden prüfen;
4. erst anschließend Synthese, Resolution und konkrete
   `positive-understanding-evidence-v2`-Profile erstellen;
5. die Resolution-/Evidence-Indizes in den zentralen Rollout aufnehmen und
   Atomicity, Memory, Visualisierung, Applicability, Quellenabdeckung,
   Lernzielbücher und geschützte M6-Untergrenzen erneut validieren.

Diese Pause bewahrt damit sowohl die bereits gewonnene Reviewevidenz als auch
die klare Trennung zwischen KI-Kandidaten und freigegebenem Curriculumstand.
