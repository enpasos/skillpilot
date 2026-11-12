# Kanonisches Gymnasium Chemie: Bundesländer-Status

Snapshot: `2026-05-12T01:05:00Z`

Diese Datei wird generiert aus:

- `curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
- `docs/qa-ci/status/curriculum-quality-status.json`
- Chemie-Dateien `*.source-extraction.json` unter `curricula/DE/Gymnasium/input`
- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- `scripts/render_canonical_chemistry_bundesland_status.py`

## Kennzahlen im Überblick

- Erfasste Bundesländer: `16`
- Quellinventare lesbar und registriert: `16/16`
- Quellgestützte Projektionen bereinigt (`clean`): `16/16`
- Atomare Quellziele: `5865`
- In Views zugeordnete atomare Quellziele: `5865`
- Extrahierte Chemie-Quellziele in lokalen Quellextraktionsdateien: `6015`
- Lokale Chemie-Quellextraktionsdateien: `32`
- Nicht belegte zugewiesene atomare Ziele: `0`
- Länder mit aktiver Quellextraktion (`P2+`): `16/16`
- Länder mit bereinigter quellgestützter Projektion (`P4+`): `16/16`
- Länder mit breiter Abdeckung (`P5+`): `16/16`
- Länder operativ umstellungsbereit (`P6`): `16/16`
- Aktive kanonische Korridore: `1/6`
- Priorität `backlog`: `16`

## Evidenzüberwachung (Evidence Watch)

- Manifest: `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- Statusansicht: `docs/dev/canonical-gymnasium-chemistry-evidence-watch-status.md`
- Delta-Ansicht: `docs/dev/canonical-gymnasium-chemistry-evidence-watch-delta.md`
- Lokaler Lauf: `./scripts/run_canonical_chemistry_evidence_watch.sh`
- Geplanter Workflow: `.github/workflows/canonical_chemistry_evidence_watch.yml`
- Interpretation: Deltas auf Dateiebene sind Pflegesignale; der aktive Rollout wird nur dann wieder geöffnet, wenn die im Watch-Manifest dokumentierten Wiederöffnungsregeln erfüllt sind.

## Steuerungsmodell

- Primäre Arbeitseinheit: `source_onboarding_tranche`
- Regel für die kanonische Sicht: Die kanonische DE-Chemie-Skill-Landschaft wird als kuratierte didaktische Single Source of Truth geführt, nicht als ungefilterte Vereinigung länderspezifischer Paketformulierungen.
- Regel für Ländersichten: Bundesland-Sichten werden als quellgestützte Projektionen über das kanonische Chemie-Rückgrat geführt; einem Land dürfen keine Atome ohne registrierte Quellevidenz oder eine explizit geprüfte Applicability-Entscheidung zugewiesen werden.
- Ablaufreihenfolge:
  - Zuerst die amtlichen Chemie-Quellmaterialien für jede noch fehlende Bundesland-Spur lokal unter der bundesweiten DE-Input-Struktur archivieren, für Sek I und Sek II, soweit einschlägig.
  - Quellextraktionen und Registry-Einträge anlegen, bevor Mappings, Applicability oder Composition-Views ausgeweitet werden.
  - Jedes neue Land über geprüfte Quell-zu-Kanonisch-Kanten abbilden und dabei konservative Teilbrücken gegenüber vorzeitigem Wachstum kanonischer Atome bevorzugen.
  - Kanonische Chemie-Atome nur dann ergänzen, wenn der gemeinsame DE-Skill-Graph didaktisch unvollständig ist, nicht bloß weil ein Bundesland ein Paket anders formuliert.
  - Applicability, bei Bedarf Composition-Views, das Quellenabdeckungs-Audit, den Curriculum-Qualitätsstatus und die Backend-Runtime-Prüfschranken neu generieren bzw. ausführen, bevor ein Rollout-Delta gemergt wird.
- Aufnahme kanonischer Atome:
  - Ein kanonisches Chemie-Atom nur dann ergänzen, wenn es den gemeinsamen DE-Chemie-Skill-Graphen verbessert.
  - Keine kanonischen Atome nur deshalb ergänzen, um Tabellenstruktur, Wortlaut oder Paketgrenzen eines einzelnen Bundeslandes abzubilden.
  - Die Arbeit an fehlenden Ländern quellgeführt halten, bis das amtliche lokale Inventar vorliegt.

## Register der kanonischen Korridore

| Korridor | Status | Fokusländer | Nächster Schritt |
| --- | --- | --- | --- |
| `CHEM.HE_BY_BASE` Kanonische Chemie-Basis Hessen und Bayern | `completed` | `DE-HE`, `DE-BY` | Hessen und Bayern ausschließlich im Pflegebetrieb halten: vorgehaltene Quell-Snapshots, Mappings, Provenienz, Applicability und lernendenseitige Chemie-Views gemeinsam aktualisieren, sobald eine Lehrplanrevision den sichtbaren Scope verändert. |
| `CHEM.SOURCE_BACKED_TEN_STATE_PASS` Quellgestützter Chemie-Projektionsdurchlauf über zehn Länder | `completed` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HE`, `DE-HH`, `DE-NI`, `DE-NW`, `DE-SH` | Die aktuelle quellgestützte Projektionsoberfläche über zehn Länder als stabil behandeln. Ein abgedecktes Land nur dann wieder öffnen, wenn eine Quellrevision den sichtbaren Scope ändert oder wenn eine spätere länderübergreifende Chemie-Zeile eine echte gemeinsame kanonische Lücke offenlegt. |
| `CHEM.REMAINING_SOURCE_ONBOARDING` Onboarding-Tranche der verbleibenden Chemie-Quellen | `completed` | `DE-MV`, `DE-RP`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Alle erfassten Chemie-Bundesland-Quellspuren sind auf P4 quellgestützt und bereinigt (`clean`); die Quell-Onboarding-Tranche geschlossen halten, sofern keine amtliche Quellrevision die Evidenz verändert. |
| `CHEM.HORIZONTAL_TOPIC_GAP_REVIEW` Horizontales Themenlücken-Review für Chemie über alle Länder | `completed` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HE`, `DE-HH`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | F4 ist abgeschlossen: 710 breite Cluster-Ziel-Mappings wurden geprüft oder als Paketevidenz akzeptiert, ohne dass eine gemeinsame Lücke bei kanonischen Atomen nachgewiesen wurde. |
| `CHEM.P5_BROADENING_AND_CUTOVER_MAINTENANCE` P5-Breitenausbau und Cutover-Pflege | `completed` | - | Alle erfassten Chemie-Bundesland-Spuren sind auf P6 umstellungsbereit; diesen Korridor nur dann wieder öffnen, wenn eine Quellrevision oder eine Runtime-Regression eine nicht umstellungsbereite Pflegespur erzeugt. |
| `CHEM.P6_CUTOVER_READY_MAINTENANCE` P6-Pflege für umstellungsbereite Chemie-Länder | `active` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HE`, `DE-HH`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Chemie befindet sich nun im P6-Pflege- / Evidence-Watch-Modus ohne offene kanonische Restbestandsspur. Das maschinenlesbare Watch-Manifest `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`, den generierten Watch-Status `docs/dev/canonical-gymnasium-chemistry-evidence-watch-status.md`, die baselinegestützte Delta-Ansicht `docs/dev/canonical-gymnasium-chemistry-evidence-watch-delta.md`, den festen Ausführungspfad `./scripts/run_canonical_chemistry_evidence_watch.sh` und den geplanten Workflow `.github/workflows/canonical_chemistry_evidence_watch.yml` als operative Überwachungsoberfläche nutzen. Umstellungsbereite Chemie-Länder ausschließlich im Pflegebetrieb halten: vorgehaltene Quellevidenz, Runtime-Mappings, Archive-only-Schranken, Composition-Views und Lernenden-Migrationsprüfungen nur dann gemeinsam aktualisieren, wenn eine Quellrevision oder ein überwachtes Datei-Delta den sichtbaren Scope verändert. |

## Programmphasen

| Programmphase | Status |
| --- | --- |
| `F0` Tracking-Grundgerüst | `completed` |
| `F1` Basis Hessen und Bayern | `completed` |
| `F2` Quellgestützter Projektionsdurchlauf über zehn Länder | `completed` |
| `F3` Quell-Onboarding der verbleibenden Länder | `completed` |
| `F4` Horizontaler Chemie-Themendurchlauf über alle Länder | `completed` |
| `F5` Umstellung (Cutover), Pflege und Evidenzüberwachung (Evidence Watch) | `active` |

## Phasenskala der Bundesländer

| Phase | Score | Bedeutung |
| --- | ---: | --- |
| `P0` Keine Quellspur | `0%` | Für dieses Land ist kein lokales Chemie-Quellinventar registriert oder extrahiert. |
| `P1` Quelle archiviert | `15%` | Chemie-Quellmaterial ist in der bundesweiten DE-Input-Spur archiviert. |
| `P2` Quellextraktion aktiv | `30%` | Chemie-Quellextraktion und Einträge in der Quell-Landschafts-Registry sind aktiv. |
| `P3` Mapping-Review aktiv | `50%` | Quell-zu-Kanonisch-Mappings für Chemie befinden sich im aktiven Review. |
| `P4` Quellgestützte Projektion bereinigt | `65%` | Das deklarierte Chemie-Inventar verfügt über eine bereinigte quellgestützte Projektionsabdeckung auf Atomebene. |
| `P5` Breite Landesabdeckung | `85%` | Das Land verfügt über eine breite geprüfte Chemie-Abdeckung entlang des aktiven kanonischen Rückgrats. |
| `P6` Land umstellungsbereit | `100%` | Das Land ist auf der kanonischen Chemie-Skill-Landschaft operativ einsatzbereit. |

## Länderübersicht

| Bundesland | Operative Phase | Score | Sichtbare Atome | Quellatome | Extrahierte Quellziele | Extraktionsdateien | Quelle zugeordnet | Nicht belegt | Mappings | Quellstatus | Quellstufe | Priorität |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| `DE-BB` Brandenburg | `P6` Land umstellungsbereit | `100%` | `143` | `271` | `271` | `2` | `271` | `0` | `508` | `clean` | `cutover_ready` | `backlog` |
| `DE-BE` Berlin | `P6` Land umstellungsbereit | `100%` | `143` | `271` | `271` | `2` | `271` | `0` | `508` | `clean` | `cutover_ready` | `backlog` |
| `DE-BW` Baden-Württemberg | `P6` Land umstellungsbereit | `100%` | `142` | `191` | `191` | `2` | `191` | `0` | `344` | `clean` | `cutover_ready` | `backlog` |
| `DE-BY` Bayern | `P6` Land umstellungsbereit | `100%` | `334` | `384` | `332` | `1` | `384` | `0` | `535` | `clean` | `cutover_ready` | `backlog` |
| `DE-HB` Bremen | `P6` Land umstellungsbereit | `100%` | `162` | `130` | `130` | `2` | `130` | `0` | `376` | `clean` | `cutover_ready` | `backlog` |
| `DE-HE` Hessen | `P6` Land umstellungsbereit | `100%` | `339` | `324` | `526` | `3` | `324` | `0` | `473` | `clean` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P6` Land umstellungsbereit | `100%` | `117` | `162` | `162` | `2` | `162` | `0` | `526` | `clean` | `cutover_ready` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P6` Land umstellungsbereit | `100%` | `127` | `236` | `236` | `2` | `236` | `0` | `999` | `clean` | `cutover_ready` | `backlog` |
| `DE-NI` Niedersachsen | `P6` Land umstellungsbereit | `100%` | `189` | `529` | `529` | `2` | `529` | `0` | `1437` | `clean` | `cutover_ready` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P6` Land umstellungsbereit | `100%` | `98` | `233` | `233` | `2` | `233` | `0` | `2016` | `clean` | `cutover_ready` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P6` Land umstellungsbereit | `100%` | `139` | `390` | `390` | `2` | `390` | `0` | `1541` | `clean` | `cutover_ready` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P6` Land umstellungsbereit | `100%` | `142` | `321` | `321` | `2` | `321` | `0` | `1017` | `clean` | `cutover_ready` | `backlog` |
| `DE-SL` Saarland | `P6` Land umstellungsbereit | `100%` | `140` | `902` | `902` | `2` | `902` | `0` | `3756` | `clean` | `cutover_ready` | `backlog` |
| `DE-SN` Sachsen | `P6` Land umstellungsbereit | `100%` | `143` | `478` | `478` | `2` | `478` | `0` | `2592` | `clean` | `cutover_ready` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P6` Land umstellungsbereit | `100%` | `123` | `594` | `594` | `2` | `594` | `0` | `2478` | `clean` | `cutover_ready` | `backlog` |
| `DE-TH` Thüringen | `P6` Land umstellungsbereit | `100%` | `133` | `449` | `449` | `2` | `449` | `0` | `2007` | `clean` | `cutover_ready` | `backlog` |

## Unmittelbare Arbeitsliste

- keine

## Nächste Schritte

- `DE-BB`: Brandenburg in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-BB-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das Berlin-Brandenburger Chemie-Quellmaterial ändert.
- `DE-BE`: Berlin in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-BE-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das Berlin-Brandenburger Chemie-Quellmaterial ändert.
- `DE-BW`: Baden-Württemberg in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-BW-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das BW-Chemie-Quellmaterial ändert.
- `DE-BY`: Bayern ausschließlich im Pflegebetrieb halten; Mappings, Applicability und lernendenseitigen Scope gemeinsam aktualisieren, falls sich das LehrplanPLUS-Quellmaterial ändert.
- `DE-HB`: Bremen in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-HB-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das Bremer Quellmaterial ändert.
- `DE-HE`: Hessen ausschließlich im Pflegebetrieb halten: vorgehaltene Quell-Snapshots, Mappings, Provenienz, Applicability und landesspezifische Chemie-Composition-Views gemeinsam aktualisieren, sobald eine Lehrplanrevision den sichtbaren Scope verändert.
- `DE-HH`: Hamburg in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-HH-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das Hamburger Chemie-Quellmaterial ändert.
- `DE-MV`: Mecklenburg-Vorpommern in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-MV-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das MV-Chemie-Quellmaterial ändert.
- `DE-NI`: Niedersachsen in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-NI-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das niedersächsische Chemie-Quellmaterial ändert.
- `DE-NW`: Nordrhein-Westfalen in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-NW-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das NRW-Chemie-Quellmaterial ändert.
- `DE-RP`: Rheinland-Pfalz in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-RP-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das rheinland-pfälzische Chemie-Quellmaterial ändert.
- `DE-SH`: Schleswig-Holstein in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-SH-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das schleswig-holsteinische Chemie-Quellmaterial ändert.
- `DE-SL`: Saarland in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-SL-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das saarländische Chemie-Quellmaterial ändert.
- `DE-SN`: Sachsen in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-SN-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das sächsische Chemie-Quellmaterial ändert.
- `DE-ST`: Sachsen-Anhalt in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-ST-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das sachsen-anhaltische Chemie-Quellmaterial ändert.
- `DE-TH`: Thüringen in der P6-Pflege halten: Quellextraktionen, Runtime-Mappings, Source-only-Archivschranken und DE-TH-Chemie-Composition-Views gemeinsam aktualisieren, falls sich das thüringische Chemie-Quellmaterial ändert.

## Neugenerierung

```bash
python3 scripts/render_canonical_chemistry_bundesland_status.py
```
