# Chemie: inaktiver 450er-Arbeitsstand für einen stabilen CI-Zwischenstand

Der Product Owner hat das M7-Ziel bis zum erfolgreichen GitHub-CI-Lauf dieses
Zwischenstands pausiert. Dieser Checkpoint sichert die begonnenen Arbeiten
vollständig, ohne offene Kandidaten zu aktivieren oder Qualitätsgrenzen zu senken.

## Aktiver Stand und gesicherte Arbeit

Die normalen aktiven Chemiedateien verwenden die bytegenaue geprüfte Basis
`7f605a0a94d9a65ac093550586e7a124996ba8ec`: Chemie **M6**, 402 gewöhnliche
curricularAtomic-Ziele, zuletzt 231 streng abgeschlossen. Mathematik, Physik,
Biologie und Wirtschaftswissenschaften behalten ihre geschützten M7-Stände.
Die Reifegrad-Untergrenzen, Validatoren und fachlichen Anforderungen bleiben erhalten.

Das inaktive Overlay enthält den gesamten späteren Arbeitsstand mit **662 Knoten
und 450 curricularAtomic-Zielen**, Quellen, Ansichten, Karten, Registern, Bildern,
abhängigen Teständerungen und abgeleiteten Berichten. Die neuen Autoren- und
Reviewpakete bleiben zusätzlich unter ihren ursprünglichen Repositorypfaden.
Vorhandene gute Bilder sind bytegleich erhalten. Die regulär materialisierten
Evidenz-Aliase behalten die exakten Bytes ihrer bereits versionierten Ziele;
ihre ursprünglichen Linkziele stehen im Manifest.

Die letzte vollständige Messung des 450er-Kandidaten ergab CQR-303 mit
450/450 abgeschlossenen Fünf-Gate-Zielen. Der Gesamtstand war trotzdem **M2**:
offene Lernwege verhindern die geschützte M6-Untergrenze. Nach dieser Messung
wurden bestehende Prüfungen begrenzt korrigiert; der tatsächliche Routencheck
misst noch **77 fehlende Motivationspfade und 103 fehlende Terminalpfade**.
Diese Mengen überschneiden sich. Die 32 vorhandenen Prüfungsendpunkte sind
maschinengeprüft freigegeben; die abschließenden betroffenen Kontextbindungen
und der neue Gesamtbericht stehen noch aus.

**Dieser technische Checkpoint bringt null neue fachliche Abschlüsse.**
Die ältere aktive Basis wird nicht als aktueller 450er-M7-Nachweis gezählt.
Keine offenen Ziele werden aus dem M7-Auftrag entfernt. Das Overlay ist kein
M7-Abschluss und keine menschliche Prüfung, Freigabe oder Erprobung.

## Offene Arbeit bleibt offen

- 27 Orientierungseinstiege sind ein noch unabhängig zu prüfender Autorenkandidat.
- Die Aufgabenpakete T1 bis T4 bleiben inaktiv. Abgeschlossene Prüfungen,
  konkrete Befunde und noch offene Prüfungen sind in den jeweiligen Paketen getrennt.
- Der unabhängige T2-Lesecheckpoint und das T5-Autorenpaket sind ausdrücklich
  unvollständig. T5 enthält keine neuen freigegebenen Prüfungsaufgaben.
- Offene operative Materialkörper und Quellen-/Ansichtsgrenzen bleiben HOLDs;
  örtliche menschliche Freigaben werden nicht als maschinelle M7-Voraussetzung erfunden.
- Die letzten D-Seiten-/Kontextbindungen, gemeinsamen M7-Gates und abhängigen
  Abschlussprüfungen werden nach Wiederaufnahme am tatsächlichen finalen Kandidaten geprüft.

## Prüfen und später wiederaufnehmen

Das Manifest bindet jeden ursprünglichen Pfad, die gespeicherten Bytes und
die aktive Ausgangsversion. JSON-Kopien im Overlay haben die zusätzliche
Endung `.snapshot`, damit Scanner sie nicht als aktive Quellen einlesen.
Die Wiederaufnahme benötigt die versionierten Repositorydateien; Scratch-
Ausführungskapseln, Abhängigkeiten und erzeugte Veröffentlichungen sind keine
verbindliche Quelle des Overlays.

```bash
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-inactive-ci-checkpoint-20261018-v1/verify_checkpoint.py
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-inactive-ci-checkpoint-20261018-v1/restore_working_overlay.py
```

Der zweite Aufruf prüft nur und schreibt nichts. Eine spätere bewusste
Wiederaufnahme kann mit `--apply` die zusammengehörenden Arbeitsdateien lokal
wiederherstellen. Das Skript verweigert abweichende Ausgangsdateien und führt
weder Commit noch Push oder Freigabe durch. Das Ziel bleibt während der
Checkpoint- und CI-Arbeit pausiert.

GitHub-CI ist erst nach dem vollständig abgeschlossenen Lauf des tatsächlichen
neuen Commits bestanden; weder diese Sicherung noch lokale Prüfungen ersetzen das.
