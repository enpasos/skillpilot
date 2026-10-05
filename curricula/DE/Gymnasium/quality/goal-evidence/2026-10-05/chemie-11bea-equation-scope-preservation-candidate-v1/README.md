# 11bea: inaktiver Aufteilungs- und Erhaltungskandidat

**Status: HOLD, kein aktiver Import und keine D/P/V/A/M- oder menschliche Freigabe.**

Die vorher eingefrorene unabhängige D-Runde B bleibt unverändert. Dieser Ordner ist eine separate Kandidatenarbeit desselben Autors. Die Artefakte können als konkrete Review- und Integrationsvorlage dienen; offene Fach- und Projektionsgrenzen verhindern eine vollständige aktive Übernahme.

## Konkrete Units

`candidate-goal-units.json` enthält 13 vollständige Before/After-Units. `candidate-canonical.preview.json` ist ausschließlich eine lokale Vorschau.

Der aktuelle Integrationssnapshot und die Unit-Before-Objekte sind an Canonical-SHA `62a44c106637e7bd81509b7e8530b9e55065dd5f01c5ccfdf63fc067063d62e6` gebunden. Das frühere Startinventar bleibt mit SHA `c48364...` erhalten. Zwischen beiden änderte parallele Root-Arbeit den Beschreibungsstand von `ddb76915...`; die Candidate-Units enthalten bereits die aktuellen Beschreibungen. `integration-drift-receipt.json` dokumentiert den Vergleich, `current-integration-before-objects.json` die aktuellen Objekte. Die Vorschau darf nicht als Ganzdatei über spätere Änderungen kopiert werden; ausschließlich Unit-Deltas mit passenden Before-Objekten verwenden.

| Rolle | Stabile ID | Vorgeschlagene Änderung |
|---|---|---|
| Überlebender Parent | `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` | Cluster mit drei prüfbaren Teilkompetenzen; ursprüngliche 16-Länder-Applicability und kompletter vorhandener JPG-ResourceLink bleiben erhalten. |
| Grundgleichung | `83a9eb76-2da5-5057-b063-1ca6964e6df6` | Neues Atom: Formeln und Koeffizienten aus einfachem Schema ableiten, Atomzahlbilanz begründen; ursprüngliche Voraussetzungen und 16-Länder-Applicability erhalten. |
| Redoxgleichung | `22133f29-ef02-4408-8f8d-2bbea3275d91` | Vorhandenes Ziel wiederverwenden; Grundgleichungsatom ersetzt Parent-Prerequisite, vorhandenes Ionenverständnis kommt hinzu; englischer Text erhält dieselbe wässrige Reichweite. |
| Protonen-Teilgleichung | `74c021aa-b290-5c21-8c70-944b54c3ceed` | Neues Atom: Protonenabgabe und -aufnahme bei gegebenen Säure/Base-Teilchen aufstellen, zur Gesamtgleichung zusammenführen, Atom-/Ladungsbilanz prüfen. Direkte Primärquellenstütze BY/SN; weitere Länder bleiben offen. |

Die neuen IDs sind UUIDv5 aus dokumentierten stabilen semantischen URL-Seeds. Sie kommen im aktuellen kanonischen Snapshot nicht vor. Vorhandenes `1c142...` wird nicht dupliziert oder still umgedeutet: Es beschreibt Protolysegleichungen, aber nicht ausdrücklich die getrennten Protonenteilgleichungen, und seine pH-Voraussetzung eignet sich nicht als allgemeiner früher Einstieg in diese Teilkompetenz.

Der Parent wird in `fb3bdf...` erhalten; der bislang daneben enthaltene Redoxknoten wird unter dem Parent wiederverwendet. Dadurch bleibt jeder Goal-Knoten unter genau einem kanonischen Parent. Die vier Cluster, die bislang den ganzen Symbolsprache-Cluster verlangen, erhalten die vorhandene Formelsprache `e7c363...` als spezifischere Voraussetzung. Die universelle Kante Symbolsprache → gesamter Reaktionscluster entfällt im Kandidaten. Alle vorhandenen atomaren Fachvoraussetzungen bleiben erhalten, mit vier expliziten Parent→Grundgleichungs-Ersetzungen bei direkten Abnehmern.

Diese Sequenzierungsunit ist erforderlich, damit einfache Molekülstöchiometrie nicht auf die spätere vollständige Redox-/Protonenkompetenz warten muss. Sie ist eine Kandidatenentscheidung und muss fachlich geprüft werden.

## Erhaltung und lokale Prüfungen

- 333 tatsächliche Mapping-Rows aus 25 aktuellen Mappingdateien sind vollständig mit Before-Objekten und Quellenbindungen inventarisiert. Alle 15 direkt belegten Quelljurisdiktionen sowie die ursprüngliche 16-Länder-Applicability bleiben im Inventar. Keine Quelle wird auf HE/BY reduziert.
- Zusätzlich sind die drei aktuellen Gymnasium-Overview-Views mit vollständigen Before-Objekten und Chemie-LandscapeEntry geprüft: Vorher/Nachher **0 Compilerfehler**, kein View-Delta. Finale Subject-/Stage-Delegation bleibt ein expliziter Runtime-Hold. Insgesamt sind damit 40 betroffene View-Dateien erfasst.
- Alle 37 aktuellen Chemie-Views wurden mit dem tatsächlichen Produktionscompiler gelesen und als Kandidat kompiliert: **0 Compilerfehler**. In 27 aktuellen Views ist 11bea ein Target; 22 brauchen konkrete Before/After-View-Units, fünf expandieren bereits kanonische Subtrees.
- Alle bisherigen Grundgleichungs-Targetabsichten und alle bisherigen Redox-Targetrollen bleiben in der mechanischen Vorschau erreichbar. 16 Views würden Redox erstmals explizit als Target zeigen; das sind **Quellen-/Projektions-Holds**, keine bereits freigegebenen Ergänzungen. Das Protonenatom wird mechanisch in 27 Views expandiert; außerhalb geprüfter BY/SN-Quellen ist seine Reichweite ebenfalls gehalten.
- `contains` und direkte `requires` bleiben zyklusfrei. In der konservativen Prüfung geerbter Cluster-Voraussetzungen schrumpft ein schon vorhandener Zyklus von 43 auf 27 atomare Ziele; es entsteht keine neue zyklische Zielmenge. Der bestehende Rest verhindert eine globale Erreichbarkeits-/Frontier-Freigabe.
- Der berechnete effektive Voraussetzungsschluss des neuen Grundgleichungsatoms und der einfachen Molekülstöchiometrie enthält weder das Redox- noch das Protonenatom. Das beweist die vermiedene spätere Fachabhängigkeit; es beseitigt nicht den verbleibenden geerbten Bestandszyklus.
- 22 aktuelle `examData`-Nodes sind einzeln geprüft und mit vollständigen Before-Objekten inventarisiert. **0** direkte `coveredGoalIds` verweisen auf 11bea/22133. Bei **20** Prüfungen ändern sich konservativ berechnete transitive Voraussetzungen durch die konkreten Cluster-/Atomkanten. Ihre Aufgabenabdeckung wird deshalb einzeln gehalten; keine pauschalen neuen `coveredGoalIds`.
- Das vorhandene Gesamtübersichts-JPG bleibt **KEEP auf dem überlebenden Parent**, mit exakt gleichem Asset und ResourceLink. Es wird keinem neuen Atom als vermeintlich neu freigegebenes V zugewiesen.

## Fachliche Grenzen, die vor Übernahme zu schließen sind

`candidate-holds.json` und `source-row-preservation-and-hold.inventory.json` führen die Grenzen konkret auf. Keine der 333 Mapping-Rows zählt hier als aktuell neu freigegeben.

1. **BY C10.1:** Allgemeine Teil-/Gesamtgleichungen sind keine ausschließlich redoxchemische Klausel. BY C10.4 behandelt Protonenübergänge, C10.5 wässrige Redoxteilgleichungen. Ob die vorgeschlagenen Familien sämtliche allgemeinen Zerlegungs-/Reaktionskontexte abdecken, bleibt exakt offen; weitere Teilreaktionen dürfen nicht still wegfallen.
2. **SN Klasse 8, LB4/LB5:** Die persönlich betrachtete Primärquelle fordert explizit getrennte Oxidations-/Reduktionsgleichungen sowie Protonenabgabe-/aufnahmegleichungen. LB4 enthält Metall/Nichtmetall-Reaktionen in Ionen-/Bruttoschreibweise und ist nicht automatisch vollständig durch ein ausschließlich wässrig formuliertes Redoxziel abgedeckt. LB5 stützt das echte neue Protonenteilgleichungsatom.
3. **TH Qualifikationsphase 4.1.5:** Fe/Mn-Reaktionen in wässriger Lösung mit Teil- und Ionengleichungen bleiben ein konkreter Oberstufen-Kontext-Hold. Das Wort „einfach“ in einem Sek-I-Ziel belegt diese gesamte Reichweite nicht. Bestehende Oberstufenziele sind bevorzugte Wiederverwendungskandidaten, deren genaue Teilgleichungsabdeckung noch nachzuweisen ist.
4. **Alle weiteren Länder-/Kontext-Rows:** Reaktionsgleichungen in Salz-, Säure/Base-, Autoprotolyse-, organischen oder quantitativen Kontexten brauchen ihre jeweiligen Komponenten, Voraussetzungen und aktuelle Projektion. Texttriage ist nur Routing, keine Freigabe.
5. **BY-View/NTG:** Es gibt keine aktuelle explizite BY-Chemie-View. Die tatsächliche Auswahl einer nationalen Fallback-View wurde hier nicht bestätigt. NTG-Aliase stammen aus der operativen Extraktion; der aktuelle separate NTG-Primärtext wurde nicht persönlich geprüft. Die beiden BY-Protonen-Quellziele haben keine direkte Mapping-Row im aktuellen BY-Mapping.
6. **Sequenzierung/Prüfungen/Runtime:** Der geerbte 27-Ziel-Zyklus, 20 veränderte Prüfungsrouten, konkrete Kalk/Gips/Nachweis-Kontexte, Gewichtung sowie die atomar→Cluster-Kompatibilität des bisherigen 11bea-Masterywertes bleiben offen. Alter Masterywert darf nicht still die beiden neuen Atome zertifizieren.

## Einstieg für die Integration

1. `candidate-goal-units.json`: vollständige lokale Goal-Deltas samt Preconditions.
2. `candidate-view-units.json`: 22 vollständige View-Deltas; `candidate-compiled-views.inventory.json`: alle 37 Rollen/Pfade und Holds.
3. `source-row-preservation-and-hold.inventory.json`: jeder aktuelle Quellenrow mit konkreter Disposition und gehaltenen Komponenten.
4. `candidate-graph-check.json`: direkte DAGs, geerbte Restzyklen, konkrete Voraussetzungsschlüsse, Assethash, Gewichte und alle Prüfungen.
5. `primary-source-clause-audit.json`: aktuelle BY-HTML-Klauseln, persönlich betrachtete SN/TH-PDF-Seiten und genaue Quellenreichweiten.
6. `completion-receipt.json`: echte Authoring-Zeit, Eingabeschutz und Artefaktdigests. Keine Provider-Samplingdaten werden behauptet.
