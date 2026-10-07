# Chemie: geprüfte Integration von 15 aktuellen Zielen

Dieses Root-Dossier dokumentiert die tatsächlich ausgeführte Integration des
unabhängig geprüften Kandidatenpakets und den gebündelten maschinellen Abschluss.
Es ist keine zusätzliche unabhängige Fachprüfung. Fachentscheidungen und
aufgelöste Befunde stammen aus den unverändert erhaltenen D/P/A/M/V-Paketen.

## Strenger Fortschritt

| Fach | Aktuelle curricularAtomic-Ziele | Streng D/P/A/M/V abgeschlossen | Offen |
|---|---:|---:|---:|
| Chemie | 378 | 127 | 251 |
| Biologie | 390 | 74 | 316 |
| Mathematik | 807 | 807 | 0 |
| Physik | 478 | 478 | 0 |

Chemie: **15 neue fachliche maschinelle Abschlüsse, 0 wiederhergestellte frühere
strenge Abschlüsse, Nettozuwachs +15** gegenüber dem vor der Anwendung tatsächlich
gemessenen Stand 112/378. Die aktuelle UUID-Menge, alle Gate-Zahlen und die sechs
erfolgreichen erforderlichen Prüfungen je Fach stehen im tatsächlichen zentralen
Bericht. Chemie und Biologie bleiben M6; CQR-303 bleibt für beide offen. Mathematik
und Physik behalten M7. Kandidaten in anderen Paketen zählen nicht hinzu.

## Anwendung und Grenzen

`actual-active-before-and-checked-plan.receipt.json` dokumentiert die Prüfung der
versiegelten Autoren- und Reviewpakete vor der Anwendung. Die tatsächlich
ausgeführten 19 Kopien und die neun zuvor bytegenau historisch gesicherten
JPG-Kopien stehen in `actual-active-application.receipt.json`. Nur fünf ganze
Chemieziele wurden geändert; die 112 zuvor abgeschlossenen Ganzziele bleiben
unverändert. Graphkanten, IDs, Zielmengen und andere Fachrouten bleiben erhalten.
Die drei neuen fachlich und bei 360/680 Pixeln unabhängig geprüften PNGs ersetzen
belegte Fehler; Erzeugung allein gilt nicht als Freigabe.

Nach der Anwendung wurde ausschließlich unnötige Formatänderung in der zentralen
Registry entfernt. Die gesamte JSON-Struktur ist zur tatsächlich geprüften
Autorenfassung identisch; außerhalb der vier Chemieroutingwerte bleiben die
ursprünglichen Bytes erhalten. Der ursprüngliche Kopierhash und der spätere
aktuelle Registryhash sind getrennt und wahrheitsgemäß dokumentiert.

Die normale Atlasregeneration und die tatsächlich gemessenen
Transparenzinventar-Änderungen sind eigene technische Quittungen. Sie ersetzen
keine Fachprüfung. Chemie behält 496 ungelöste Source-Scope-Entscheidungen und
19 ausgelassene Atlasziele; der veröffentlichte Atlas hat 359 Seiten. Der native
volle Chemiekatalog und der strenge Nenner haben jeweils 378 aktuelle Ziele.

## Tatsächlicher gebündelter Abschluss

Die CLI-Quittungen und vollständigen Logs dokumentieren tatsächliche terminale
Ergebnisse: zentraler Fünf-Gate-Bericht, normale Atlasregeneration, alle
Curriculum-Schemas, Assets, Transparenzinventar, Status und alle neun geschützten
Reifegrad-Untergrenzen bestanden. Alle vier Lernzielbücher wurden neu gerendert
und anschließend mit dem normalen Veröffentlichungschecker intern verifiziert.
Das ist eine lokale Artefaktprüfung, keine Veröffentlichung.

Die native Memoryprüfung für alle 378 aktuellen Chemieziele bestand; ihr Bericht
ist bytegleich mit dem bereits geprüften versiegelten Bericht. Der getrennte
technische READ-ONLY-Nachlauf in
`../chemie-current-fifteen-active-layer-a-readonly-v1/` führt acht tatsächliche
Layer-A-Aufrufe aus: Graph, Viewfilter, Composition, Wording, vorhandene
Spellingchecks und den explizit aufgerufenen nativen Atlasfunktionstest. Bestehende
akzeptierte Warnungen und die nachgewiesenen Prüfgrenzen bleiben sichtbar.

Die ersten Docs-Link- und Indexprüfungen schlugen wegen Verweisen außerhalb des
publizierten Docs-Wurzelbaums bzw. zweier fehlender Indexeinträge fehl. Die acht
Verweise in aktuellen unversiegelten Fortsetzungsdokumenten wurden auf
Repositorylinks umgestellt, die beiden Indexeinträge ergänzt. Die normalen
Prüfungen bestehen anschließend. Erstfehler und Korrekturquittung bleiben
erhalten. `git diff --check` bestand ebenfalls.

## Getrennte Gates und Weiterarbeit

Menschliche Bildfreigaben, Befunde und Erprobung werden erhalten und nicht durch
KI-Prüfungen erteilt oder aufgehoben. Historische Reviews bleiben unverändert.
Der erfolgreiche GitHub-CI-Lauf 37519612538 betrifft ausschließlich die separat
committeten CI-Fixes an `09ac7070b7aeba7c7ea06034f45c73a9eab8ef05`; die hier
integrierten lokalen Curriculumänderungen sind darin noch nicht enthalten.

Nächster Schritt: unabhängige Prüfung der konkreten BW-Locator-/Versionskorrektur
und das klar abgegrenzte nächste Chemiepaket. Quellen- und Bildgrenzfälle bleiben
inaktiv, bis ihre tatsächlichen Befunde gelöst und die betroffenen Bindungen
geprüft sind. Biologie-Quellenkandidaten mit 382/390 Atlasunion oder verlorener
Anwendbarkeit werden nicht integriert.
