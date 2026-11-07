# Unabhängiger Gegenblick auf den V-Kontextkern

Der eingefrorene erste Kern bleibt **vor der Consumerverdrahtung gehalten**.
Die 18 tatsächlichen historischen Positivfälle und die 26 vorhandenen
Negativkontrollen liefen unabhängig erneut erfolgreich. Zusätzliche kleine
private Git-Fixtures reproduzieren jedoch zwei echte Vertrauenslücken.

1. **Die ursprüngliche Ownerzuordnung ist nicht ausreichend gebunden.** Eine
   andere archivierte Quelldatei oder ein späterer Stand der kanonischen Quelle
   kann dieselbe Goal-ID unter einem anderen Owner enthalten. Der Kern erzeugt
   dafür eine gültige Capability, obwohl Zieltext, Originalreview und Bild vom
   bisherigen Kontext stammen. Auch die Verlagerung sämtlicher unveränderter
   Originalrefs auf denselben späteren Commit wird akzeptiert. Gleiche Commits
   und ein kanonischer Pfad allein schließen diese dritte Variante deshalb
   nicht. Die zwei geschlossenen Profile benötigen ihre tatsächlich
   autoritative Owneridentität oder einen extern akzeptierten konkreten
   Originalzuordnungsbeleg.
2. **Lokale Git-Ersetzungen umgehen den extern festgelegten Commitinhalt.**
   Eine hinzugefügte, nie begutachtete Leistung im Originalreview wird ohne
   `git replace` korrekt abgewiesen. Nach einer privaten Ersetzung des
   festgelegten Basecommits akzeptiert der Kern denselben manipulierten Text.
   Sämtliche Git-Lese-, Baum-, Commit- und Ancestryaufrufe müssen solche
   Ersetzungen ausschalten.

Die [Originalkontrollen und gesicherten Before-Dateien](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-core-independent-review)
enthalten den ursprünglichen Fünferlauf mit drei unerwarteten Akzeptanzen und
den getrennten Sechserlauf mit der zusätzlichen Ownerkontrolle. Beide endeten
mit Exitcode 1. Der Sechserlauf wiederholt die ersten fünf Fälle; seine vier
unerwarteten Akzeptanzen sind keine vier zusätzlichen unabhängigen Defekte.
Alle Mutationstests arbeiteten ausschließlich in kleinen privaten RAM-Repos.
Der echte Repository-Gitbestand, historische Reviewbytes, aktive Quellen und
QA-Dateien wurden dabei nicht geändert.

Der [maschinenlesbare Gegenbeleg](visualization-context-core-independent-review-2026-11-06.json)
bindet die ursprünglichen drei Code-/Schemadateien, beide unveränderten
Harnesses, tatsächliche Ergebnisse und den unabhängig wiederholten nativen
Testaufruf. Er hält außerdem die bereits funktionierenden Grenzen fest:
geschlossene Receiptform, echte Original-/Bildhashprüfung, ursprüngliche
Attribution, Vergleich mit dem heutigen Darstellungskontext und eine nicht
durch kopierte Daten herstellbare Capability. Historische deutsche
Wirtschaftsmetadaten werden korrekt nicht zu einem englischen Review erweitert.

Nach der engen Korrektur werden dieselben Gegenproben erneut ausgeführt und
separat gebunden. Dieser Befund qualifiziert keine weiteren Altbilder, ersetzt
keinen neuen Bildreview und behauptet keinen vollständigen QA-, M7- oder
CI-Erfolg.
