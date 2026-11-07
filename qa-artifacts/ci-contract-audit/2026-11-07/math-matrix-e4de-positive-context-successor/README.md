# Ein Matrix-P-Nachfolger für den privaten e4de-Kontext

Dieser **unapplizierte AI-Kandidat** ist eine tatsächliche erneute
Kontexteinordnung des vollständigen vorhandenen P-Profils für
`ce198bc9-b014-52ba-814f-25cc3e020668`. Zieltexte DE/EN, Alttext,
`reviewStatus=candidate` und die tatsächlichen V2-PNG-Bytes wurden gelesen
beziehungsweise angesehen. Das Profil bleibt fachlich passend und unverändert:

- Bei `A=[[3,1],[1,1]]` ist die Inverse `(1/2)[[1,-1],[-1,3]]`;
  alle vier Einträge des Prüfprodukts ergeben `I₂`. Die unskalierte Adjunkte
  ergibt dagegen `2I₂`, die aus dem Bild kopierte Inverse kein Einheitsprodukt.
- Der frische Transfer `D=diag(2,-4,1/2)` verlangt
  `D⁻¹=diag(1/2,-1/4,2)` und das vollständige Produkt `I₃` einschließlich
  der sechs Nulleinträge. Struktur, Dimension und Zahlenart ändern sich.
- Jedes mathematisch gültige Verfahren bleibt zulässig. Ein zweites
  Prüfprodukt in umgekehrter Reihenfolge oder eine allgemeine
  Nichtinvertierbarkeitsaufgabe wird nicht zusätzlich verlangt.

Das neue Bild zeigt ausdrücklich nur ein ausgearbeitetes Beispiel mit
`A=[[2,1],[1,1]]`. Die alte Begründung über eine sichtbare det-1-Kurzregel
wird nicht fortgeschrieben. Die eigenen exakten Bruchrechnungen und sinnvolle
falsche Antworten stehen in den Reference-Ergebnissen.

Die Kontexte werden strikt getrennt:

| Kontext | roher SHA-256 |
|---|---|
| WholeSource vor dem Import | `967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318` |
| tatsächlicher privater Nachimport | `e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06` |
| unveränderte aktive Quelle | `da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6` |

Die produktiven P-Funktionen wurden unverändert verwendet. Auf 967a bestehen
die ursprünglichen 31 Records; auf e4de wird exakt der alte Matrix-Input-FP
veraltet. Der native Materializer erzeugt den neuen einzelnen Record, prüft
ihn und reproduziert dieselben Bytes. Die vorgeschlagenen sechs Konfigurationen
decken dieselben 31 Ziele in derselben Reihenfolge ab. Die anderen 30 Records
bleiben bytegleich, sämtliche Goal-/Profil-FPs bleiben gleich. Nur der
Matrix-Input-FP wechselt von `dcb678ec…` zu `67078d95…`.

Acht native Negative prüfen geänderte Beschreibung, Alttext, Ressourcenstatus,
tatsächliche Assetbytes, fremde Eigentümerschreibung, unzulässige AI-Approval,
geforderte Human-Freigabe und den falschen Vorimportkontext. Eine erste
Harness-Erwartung an einen späteren Semantikfehler traf nicht zu: Die verbotene
AI/approved-Kombination wird korrekt schon vom geschlossenen Schema abgewiesen.
Das ursprüngliche Ergebnis ist erhalten, die Erwartung wurde auf die echte
Ursache korrigiert. Kein Validator wurde geändert.

`context-review.json` bindet den aktuellen eigenen Reviewer und Zeitpunkt,
Originalbezug, neue Recordbytes und Grenzen. `scope-and-retention.json` und
`proposed-config-routing.json` sind der konkrete, unveränderte 31er-Umfang und
der noch inaktive Routingvorschlag. Originalrecords bleiben erhalten.

Der eingefrorene kleine Reproducer lässt sich bei unveränderten Manifestinputs
mit einem **neuen** RAM-Ausgabepfad ausführen:

```bash
TMPDIR=/dev/shm SKILLPILOT_MATRIX_P_REPLAY_OUTPUT=/dev/shm/my-new-matrix-p-replay \
  python -B qa-artifacts/ci-contract-audit/2026-11-07/math-matrix-e4de-positive-context-successor/replay-native.py
```

Er bindet Source und Assets ausschließlich in privaten RO-Overlays und
materialisiert nur in seinem RAM-Paket. Derselbe Reproducer wurde tatsächlich
mit Exit 0 ausgeführt. Die vollständigen Originallogs liegen als verlustfreie
Gzip-Carrier mit Rohhashes vor.

Das ist P-only: `ai_candidate`, `needs_human_review`, E1/G1. Es gibt keine
neue Human-Freigabe, keine V-Qualifikation, keine aktuelle D-Buchseite, keinen
Duration-Pass und keinen beobachteten Lernerfolg. Der native P-Validator nutzt
die bestehende autoritative Kind-Klassifikation; deren aktuelle Fingerprint-
Frische und die separaten Kind/A/M-Gates werden hier nicht bewiesen. Aktive
Quelle, QA, Registry, Policy und Apps-Code sind unverändert. Kein großer
Deep-/CQR-Lauf wurde gestartet.
