# Begrenzter Plan zur technischen Anerkennung des Chemie-M6-Snapshots

Dieser Plan bindet den gepushten Stand
`06a03ecbc193550b73d7d7b3af53a5a7e61b17fb`. Er installiert keine Baseline.
Die unabhängige technische Prüfung durch A ist vor der Installation erforderlich.
Root hat die unten begrenzte Installation nach einem ausdrücklichen PASS für
den fertigen Plan vorab autorisiert. Es erfolgt kein Build oder Commit.

## Tatsächlicher CI-Fehler und bewahrte Originale

Der unveränderte Chemistry Evidence Watch besteht im fehlgeschlagenen Lauf
39124585152 seinen Selbsttest und meldet anschließend `changed=138 added=4
removed=0`. Der Job117666923952 endet deshalb mit Exit1. Der vorherige grüne
Lauf39101859002 meldete0/0/0. Workflow, Skripte, Manifest, Tracker und bisherige
Baseline sind zwischen beiden Commits unverändert; der technische Vergleich
und die Originaljoblogs liegen unter `history/`.

Die komplette alte Baseline ist bytegenau erhalten. Die beiden bisherigen
normalen Markdown-Ansichten sind separat archiviert. Das ZIP12135642700
enthält die **echten** beiden erzeugten Ansichten des fehlgeschlagenen CI-Laufs;
die enthaltenen Dateien wurden zusätzlich ohne Änderung unter `history/`
abgelegt. Eine lokale Rekonstruktion wird nicht als CI-Artefakt ausgegeben.

## Exakter Kandidat

Der Kandidat hat SHA256
`5519cc6671e45ba9d962a4cfc4f921b599f04d38d3e642e7ecd1461e983a24a2`
und49320Bytes. Er übernimmt genau138 geänderte und vier neue Watch-Records.
Alle18 übrigen vollständigen alten Recordobjekte einschließlich Zeitfeldern und
fehlender expliziter Hashmodefelder bleiben erhalten. Nur `updatedAt` und
`watchedFileCount` ändern sich zusätzlich auf oberster Ebene. Der unveränderte
Stock-Vergleich gegen diesen Kandidaten ergibt0/0/0.

Der kanonische Datensatz behält `canonical-evidence-json-v1`, die159 übrigen
aktuellen Datensätze behalten `raw-bytes-v1`. Der normalisierte kanonische
Watchhash und der rohe HEAD-Bytehash werden in den Bindungen getrennt geführt.
Der gesamte Baselineinhalt wird nicht mit `capture-baseline` neu erfasst.

## Bestehende Nachweiskette pro Pfad

`BINDINGS.142-paths-current-HEAD-and-existing-evidence.json` enthält für jeden
Pfad seinen rohen HEAD-SHA256, Byteumfang, Git-Blob, alten und vorgesehenen
Watch-Record sowie gepinnte bestehende Nachweise mit tatsächlichem JSON-Pointer.
Alle142 normalen Rohdateien stimmen bei der Planprüfung mit06a überein.

* **22 Source-Dateien und78 Mapping-Dateien:** bestehender begrenzter
  current737-Stock-Source-/Course-Check, CQR-000/003/004/005 des Zentralberichts,
  konkrete Integrationsreceipts und tatsächliche Compiler-Eingangspins.
  Die20 anschließend technisch angepassten Runtime-Dateien sind zusätzlich
  über die konkreten Alias-/Headerfixreceipts und den finalen Bytecheck gebunden.
  Die wissenschaftlichen Beiträge und ihre Reviewledgers bleiben erhalten.
* **41 Views:** jeder einzelne tatsächliche Scope, seine Rollen, Ziel-/Eltern-
  Vektoren und vollständige effektive Voraussetzungsschließung sind im echten
  All41-Follow-up nach den sechs Headerfixes nachgewiesen. Vorhandene BY-/HB-
  und Taskintegrationen werden dort, wo sie den Pfad tatsächlich nennen,
  zusätzlich gebunden. Die vier neuen Views zählen zu diesem geprüften Satz.
* **Ein kanonischer Datensatz:** vorhandener M6-Zentralbericht und QA-Seal,
  aktuelle rohe Kanonikbindung sowie tatsächliche geprüfte Task-, Orientierungs-
  und pH-Integrationen. Frühere Integrationspins sind historische Übergänge;
  sie werden nicht als rohe Identität zum heutigen Gesamtfile ausgegeben.

Zeitgrenze: Der begrenzte Source-Evaluator lief bis10:19UTC, der vollständige
Zentralbericht wurde um11:36:54UTC erzeugt. Beide liegen vor den sechs reinen
Headertransportfixes um11:37:16UTC. Deren nachgewiesene Byteerhaltung und der
tatsächliche unabhängige All41-Check um11:41UTC führen die technische Kette
weiter. Dieses Paket behauptet keine neue vollständige Source-Neuauswertung.

Spezifische Grenze RP SekII: Der Source-Evaluator dokumentiert den vollständigen
normalen Sourcecarrier im Pipeline-Inventar als unvollständig und liest separat
einen selektierten Unit23-Carrier. Beide Bindungen sind ausdrücklich getrennt;
der aktuelle normale Rohcarrier ist zusätzlich über den tatsächlichen späteren
Compiler-Eingangspin und bestehende Integrationen gebunden. Diese Anerkennung
schließt weder die RP-Pipeline noch eine ganze amtliche Quelle neu ab.

Spezifische Grenze SH: Die entfernte Runtime-Decision ist nicht als vollständiges
Objekt identisch mit der kumulierten Ledger-Decision. Das Klarstellungsreceipt
ist gebunden; entfernte Originalblöcke, sämtliche Mapping-Entrybytes und die
aktuellen wissenschaftlichen Reviewledgers bleiben erhalten.

## Umfang einer Installation nach unabhängigem PASS

Nur die normale Baseline und die beiden im unveränderten Manifest benannten
Ansichten unter `docs/dev/` dürfen sich ändern. Nach erneuter Identitätsprüfung
werden exakt die Kandidatenbytes installiert, die zwei Originalrenderer
ausgeführt und anschließend der originale Watch vollständig aufgerufen:

```bash
python3 scripts/canonical_chemistry_evidence_watch.py render-status
python3 scripts/canonical_chemistry_evidence_watch.py render-delta
bash scripts/run_canonical_chemistry_evidence_watch.sh
```

Das tatsächliche Ergebnis und die drei erlaubten Normaldateien werden additiv
gepinnnt. Bei Eingangsdrift wird die Installation gestoppt. Der Plan selbst
führt diese Schritte nicht aus.

## Offene Grenzen

Die Anerkennung betrifft ausschließlich den beabsichtigten technischen
M6-Eingangssnapshot. Chemie bleibt M6 mit260/450 strengen Abschlüssen;
CQR-303 und190 verbleibende Abschlüsse bleiben offen. D-/P-/A-Befunde,
inaktive native Stimmen, bestehende Source-Pipelinegrenzen und Holds werden
dadurch nicht erledigt. Es gibt keine neue Science-, D-, M7- oder Humanstimme.
Workflow, Skripte, Manifest, Tracker, Registry und Reifegraduntergrenzen bleiben
unverändert. Keine Veröffentlichung, kein Build, kein Commit.

Technische Dokumentation und Prüfwerkzeug: Apache-2.0. Bestehende Inhalte und
historische Evidenz behalten ihre jeweiligen Lizenzen und ihren Status.
