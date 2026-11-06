# Begrenzter Git-Transport für originale V-Revieweingaben

Die [separate Quittung](visualization-original-git-capsule-probe-2026-11-06.json)
bindet einen tatsächlich ausgeführten Transport für genau die 18 qualifizierten
Fälle des eingefrorenen Zwei-Familien-Census. Der unveränderte Reader wurde in
einem privaten, tatsächlich flachen Repository ohne Remote oder Alternates
ausgeführt: 18/18 originale Ketten bestehen. Neun manipulierte Transportfälle
werden mit den jeweils richtigen Fehlerursachen abgewiesen.

| Tatsächlich gemessener Umfang | Wert |
| --- | ---: |
| gespeicherte Kapsel | 1.030.716 Bytes |
| ausgewählte Git-Objekte | 578 |
| Commitobjekte | 457 |
| Treeobjekte | 67 |
| Originalblobs | 54 |
| eingebettete unkomprimierte Objektbytes | 4.640.125 Bytes |
| private Working-Dateipfade | 109 |
| private Working-Bytes, intern dedupliziert | 44.024.845 Bytes |
| tatsächlich privat allozierte Bytes, Inodes nur einmal gezählt | 80.166.912 Bytes |

Der Caller muss unabhängig den akzeptierten Commit `6fe35a6…`, den vollständigen
Census-SHA `3b8c7c3…` und den Kapselmanifest-SHA `bfd2435…` vorgeben. Die Kapsel
erteilt sich keine Autorität. Commiteltern und Pfad-Treeobjekte werden aus ihren
Rohbytes gehasht; jeder Blob erhält zusätzlich seinen gebundenen SHA-256-Abgleich.
Shallow-Grenzen schneiden nur ältere Geschichte ab. Unbekannte Objekte oder
Original-/Working-Inputmengen werden nicht still übernommen.

Vorhandene originale Review-/Bildbytes werden aus bereits getrackten, exakt
geprüften Dateien importiert. Nur zwei abweichende historische kanonische Quellen
müssen zusätzlich eingebettet werden. Es gibt keinen History-Fetch und keine
vollständige Repositorykopie. Alle privaten Dateien haben eigene Inodes;
identische Working-Dateien sind ausschließlich innerhalb des privaten Baums
verknüpft. Der vollständige Hardlinkcheck besteht.

Der kleine Caller liegt unter
`qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-git-capsule-probe/replay_transport.py`.
Die Quittung enthält seine vollständigen Pins und reproduzierbaren Aufrufe. Er
verwendet ausdrücklich die erhaltene `f83`-Readerfassung mit passendem Schema.
Der später gefundene direkte Reader-/ODB-Gegenfall bleibt ein eigener Befund;
dieser historische Transportpass wird dadurch nicht umetikettiert.

Normale V-/Deep-/M7-/Workflow-Verbraucher sind nicht verdrahtet. Diese Kapsel
authentisiert den festen ursprünglichen Historienkontext, keinen beliebigen
späteren `HEAD`. Eine künftige normale CI-Anbindung benötigt einen ausdrücklich
akzeptierten Kontext oder eine authentisierte Verbindung zu diesem späteren
Commit. B auf `d99…` ist getrennt geprüft; seine zusätzliche gebundene
Reviewerzeile ist nicht Teil der 18er-Kapsel. Vollständiger Source-A-Leseumfang,
Werkzeugtransport, aktive QA-Freigaben, B-/Runtimeaktivierung und M7 bleiben
außerhalb dieses begrenzten Nachweises.
