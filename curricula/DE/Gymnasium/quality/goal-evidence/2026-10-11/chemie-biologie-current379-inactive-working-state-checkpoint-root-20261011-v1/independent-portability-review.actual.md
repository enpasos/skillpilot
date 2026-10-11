# Inaktive WIP-Bestandsaufnahme vom 11. Oktober 2026

Technische Sichtung unter HEAD `a9a78120a62e5957bc5065d9780f4d42b02dc8bd`. 46 ursprüngliche Git-Status-Einträge (37 Bio, 9 Chem) entsprechen 25 Paket-/Konfigurationsbäumen. Das separat laufende CI-Duration-Paket ist aus den Allowlists ausgeschlossen. Keine fachliche Integration oder neue Freigabe.

## Sicherungsliste

- Normale NUL-Allowlist: `tmp/inactive-wip-20261011.pathspec.nul`, 1880 neue Dateien.
- Paketlokale Pflichtdateien: `tmp/inactive-wip-20261011.force-pathspec.nul`, vier PDFs.
- Externe Original-Abhängigkeiten: `tmp/inactive-wip-20261011.closure-force-pathspec.nul`, vier PDF-/HTML-Dateien.
- Alle acht Pflichtdateien zusammen: `tmp/inactive-wip-20261011.all-force-pathspec.nul`.
- Gesamt: 1888 neue reguläre Dateien, 705488039 Bytes. Acht Root8v2-Original-PNGs sind schon versioniert und bleiben unverändert.
- Alle neuen Dateien tragen im JSON-Inventar ihren tatsächlichen SHA256; vorhandene FINAL/FIRST-Dateien und alte Hashwerte wurden nicht verändert.

## Logische Arbeitsblöcke

| Block | Paket-/Konfigurationsbäume | Reguläre Dateien im Baum | MiB |
| --- | ---: | ---: | ---: |
| Root8-open-inactive | 9 | 458 | 220.39 |
| Bio8-historical-source-preparation | 1 | 26 | 2.43 |
| Medical10-open | 5 | 916 | 350.19 |
| PND-v4-limited-image-only | 1 | 7 | 1.81 |
| ChemQ3-paused | 9 | 485 | 112.00 |

Die Baumzahlen enthalten die acht bereits versionierten PNGs und vier paketlokalen Pflicht-PDFs. Die vier externen Pflichtdateien stehen zusätzlich in der Abhängigkeitsliste. PNDv4 enthält nur den Bildkandidaten und seine begrenzte tatsächliche Sichtprüfung; Kontext-/D/P-/Quellenbindungen und operative Freigaben bleiben offen. ChemQ3 wird als pausierter Arbeitsstand gesichert.

## Bindungen und konkrete Grenzen

- 57 gezielt gelesene FINAL/FIRST/freeze-Manifeste: 2690 eigene Hashbindungen exakt; 4062 externe Hashbindungen exakt.
- 0 fehlende referenzierte Dateien und 0 eigene Paketdrifts in diesen Manifesten.
- 42 externe Bindungen auf elf fortgeschriebene aktive Pfade sind ausdrücklich historische Eingabebindungen. Betroffen sind unter anderem Canonical, QA, Atlas, Semantic-Kinds und Duration-Policy. Keine alte Eingabe wird als aktuelle Prüfung dargestellt.
- Zehn weitere externe Hashbindungen sind exakt und benötigen die vier gezielten zusätzlichen force-add-Dateien. Die zwei Root8v3-PDFs sind anhand der bestehenden normalen Autoren-Eingaberecords exakt gebunden; Root8v3 ist weiterhin unfinalisierte Autorenarbeit.
- Keine Symlinks, verschachtelten Git-Repositories oder node_modules/venv-Bäume in den aufgenommenen Paketen.
- Größte neue Datei: 25.213.898 Bytes (Root8v2 native Buch-PDF); keine Datei erreicht 100 MiB.
- Begrenzte JSON-Prüfung: 838 JSON und 51 JSONL syntaktisch gültig (einschließlich separater CI-Metadaten). Es wurde kein Credential- oder nichtplatzhalterhaltiger Learner-Session-/Token-Marker getroffen. Dies ist ein technischer Markercheck.
- 1.269 aktive Runtime-/Konfigurationstextdateien wurden auf Referenzen zu diesen Paketnamen durchsucht: keine Treffer. Inaktive Root8-Konfigurationen sind ausdrücklich aus diesem aktiven Scan ausgeschlossen.
- Runtime-/Graph-/Revision-Discovery überspringt die quality-Verzeichnisse. Der Schema-Validator parst dort weiterhin JSON; ein Review-/Receipt-Objekt mit goals wird nicht zum Runtime-Landscape umgedeutet.

## Acht gezielt zu sichernde Pflichtdateien

- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-nature-eight-current397-five-source-and-Z-material-author-successor-root-20261011-v3/primary/HE-G9/whole-original.pdf` — 329365 Bytes; `sha256:93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1`.
- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-nature-eight-current397-five-source-and-Z-material-author-successor-root-20261011-v3/primary/HE-KC2024/whole-original.pdf` — 505276 Bytes; `sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`.
- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-q3-equilibrium-operator-stationarity-targeted-author-20261011-v6/sources/primary/NI-KC-CH-SII.exact.pdf` — 549716 Bytes; `sha256:bd082d15919b9a6cd60d1f92188b1c219043a1941cad915100cc0ad427022e0c`.
- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-q3-equilibrium-operator-stationarity-targeted-author-20261011-v6/sources/primary/HE-kcgo-chemie-21.04.2026.exact.pdf` — 527976 Bytes; `sha256:628c84dbaadebccf93c6854c58e00a337fd855985aaadc8b998de3dcb1243c3e`.
- `curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf` — 527976 Bytes; `sha256:628c84dbaadebccf93c6854c58e00a337fd855985aaadc8b998de3dcb1243c3e`.
- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-eight-missing-primary-scope-remediation-author-v1/primary/HE.current-official.pdf` — 505276 Bytes; `sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558`.
- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-source-maturity-boundaries-independent-a-candidate-20261007-v1/primary/BY13-EA.official.current.html` — 120673 Bytes; `sha256:d9ac82246e0f4d304cd45ef943306a921ab87b5b45638367b468ee16137b79dd`.
- `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-three-BW-practical-source-role-remediation-author-root-20261008-v1/official-BW-chemistry-20220325.observed-original.pdf` — 2155781 Bytes; `sha256:3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62`.

Vollständige Dateiliste, SHA256-Werte, einzelne historischen Drifts und Paketgrößen: `tmp/inactive-wip-20261011.inventory.json`. Die Inventarisierung schreibt ausschließlich diese tmp-Auditdateien. WIP-Pakete, aktive Canonical-/QA-Dateien, Index und Git wurden durch diese Prüfung nicht verändert.
