# Vorlage: unabhängige Root-Prüfung der fünf Duration-Kandidaten

Die Vorlage ist kein erfolgter Review. Root dokumentiert seine eigenen
Beobachtungen und bindet die konkrete Kandidat-/Freeze-Version.

## Gemeinsame Prüfung

- Baseline-SHA der aktiven Dauerpolicy stimmt noch zum isolierten Kandidaten.
- Genau fünf neue eindeutige `sourceExtractionPath`-Entscheidungen; 148 alte
  ganze Objekte und sämtliche übrigen Policy-Felder bleiben exakt gleich.
- Bestehender nativer Checker unverändert; Baseline-Exit1 wird trotz aktuellem
  Bericht ausdrücklich als fehlgeschlagen erhalten.
- Komplettes offizielles `sourceDocument` und PDF-SHA stimmen jeweils zum
  Elternsatz; die erhaltenen Originalsummary-Objekte liegen exakt dort.
- Komponenten behaupten keine ganze Originalzeilen-/nationale Quellenfreigabe.
- Scope ist weiterhin SekI, keine erfundene einzelne Klassen-/Kursplatzierung,
  kein Wechsel zwischen `target` und `prerequisiteOnly`.

## Einzelentscheidungen

| Scope | Tatsächliche zu prüfende Bindung | Eigene Entscheidung/Befunde |
| --- | --- | --- |
| BB | RLP-PDF, Gymnasium Jahrgänge 7–10, p16/p36; unverändert G8+G9 duration-neutral | offen |
| BE | RLP-PDF, Gymnasium Jahrgänge 7–10, p11/p36; unverändert G8+G9 duration-neutral | offen |
| MV | Rahmenplan 2022, Klasse10 p28/p30, Abschnitt3.2 p17; unverändert G8 single-duration | offen |
| SN | Lehrplan 2025, Klassenstufe10/LB1 p42/p43; unverändert G8 single-duration | offen |
| TH | Lehrplan 2024, Klassenstufen9/10 p26, Genetik2.2.1.3 p28/p29; unverändert G8 single-duration | offen |

## Abschluss nach eigener Prüfung

Nach geprüfter Integration den aktuellen Bericht durch den vorhandenen Generator
erneuern und `--check --require-reviewed-subject=Biologie` mit echtem terminalem
Exitcode prüfen. Einen Source-/Policy-Bindungsabschluss getrennt von neuen
fachlichen M7-Abschlüssen ausweisen; menschliche Release-Gates bleiben separat.
