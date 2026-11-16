# Vorhandene Astronomieaufgaben bei tatsächlichem Vorbereitungsbedarf

Stand: 16. November 2026. Lokaler Nachtrag zu PR #159; Merge und frische erfolgreiche Main-CI stehen aus.

Der CI-Biologietest prüfte eine Länderdiagnose in einer global auf 20 Einträge begrenzten Meldungsliste. Der echte Sachsen-Anhalt-Endpunkt fehlte weiterhin; frühere Meldungen verdrängten nur seine Textzeile. Der Test prüft jetzt dieselbe unveränderte Länderansicht einzeln, einschließlich unabhängiger GK-/Länderbindung und einer positiven temporären Gegenprobe. Die ganze Graph-Vertragsschrittfolge ist lokal erfolgreich (16 Graph-, vier Normalisierungs-, zwei historische Receipt-Prüfungen und Biologie).

Der anschließende Physiktest verlangte eine inzwischen ausdrücklich ausgeschlossene gemischte Altaufgabe als aktiven Endpunkt. Er prüft jetzt die bereits aktive vertikale Aufgabe `c5807a37-129e-5df6-8989-482bc7f5683e` mit ihrem tatsächlichen 24-Punkte-Raster sowie die horizontale 36-Punkte-Aufgabe. Der alte Prüfungskörper bleibt erhalten und ausdrücklich außerhalb der aktiven Zielbäume. Die komponierten Q1-/Q4-Phasen dürfen ihre Einzelaufgaben unmittelbar neben den Grundlagen tragen. Der Routencheck erhält denselben vollständigen kanonischen Katalog wie der Statusproduzent; fremde Mathematikvorbereitung bleibt prüfbar.

Die weitergehende Gegenprobe fand eine echte Lücke: In 30 Physiksichten fehlten zusammen 58 Referenzen auf die vorhandenen, freigegebenen Einzelzielaufgaben zum Sonnensystem und zu kosmischen Strukturen. Ihre Grundlagen wurden durch gewöhnliche Ziele bereits tatsächlich benötigt. Beispielsweise benötigt Brandenburg über `da3169ae → 206fe51d → af5dfdbc` das Sonnensystemziel und über `826af579 → 1b060e79` die kosmische Einordnung. Der Vorherbeleg nennt für alle 69 Sichten die Ziel-/Vorbereitungsrollen und konkrete Voraussetzungspfade; die Verpflichtung ist unabhängig von der Sichtbarkeit der Aufgabe abgeleitet.

Die 58 Aufgabenreferenzen stehen jetzt unmittelbar neben den bereits vorhandenen Grundlagenreferenzen in Sek II. 52 Grundlagenreferenzen bleiben `prerequisiteOnly`, sechs bleiben bestehende Ziele. Die gültigen Astronomieplätze in Sek I im Saarland und in Sachsen bleiben erhalten. Es werden keine neuen offiziellen Länder- oder Phasenansprüche behauptet. Der Nachtrag ändert weder kanonische Ziele noch Aufgaben, Raster, Medien, Reviews oder Lernergebnisse. Die kanonischen Rohdigests sind vor und nach dem Eingriff identisch. Eine zusätzliche vollständige Lernbasisberechnung über den 21er-Katalog bestätigt: genau 58 neue Prüfungsziele, null weitere gewöhnliche Atome, null entfallene Ziele und null geänderte Vorbereitungsrollen.

Der vollständige Physiktest besteht lokal: 136 benötigte Astronomie-Aufgabenpaare über 69 Sichten, 60 gemeinsame GK/LK-Übungsansichten mit 4266 aus den aktuellen Quellcontainern bestimmten Aufgabenpflichten, 480 Abiturpaare und 30 erhaltene Sek-I-Platzierungen. Ein temporäres Entfernen der Brandenburg-Aufgabe muss weiterhin fehlschlagen, obwohl der Vorbereitungsbedarf unverändert bleibt. Die nativen fehlender-Endpunkt-, fehlende-Vorbereitung- und Quellenprüfungs-Negativfälle bleiben erfolgreich.

Dies sind automatisierte Prüfungen. Die vorhandenen Aufgaben werden wiederverwendet; keine neue inhaltliche Reviewfreigabe oder menschliche Erprobung wird behauptet. Der vollständige CPV-Lauf über 354 Ansichten und 21 Kataloge endete mit 16 Mathematik-CPV-211-Befunden, keinem Physikfehler und 2388 Warnungen; sein Rohlog bleibt unter `tmp/biology-endpoint-ci-repair-20261116/14-cpv-final-views.log`. Die gesonderte Mathematikreparatur und erneute Gesamtprüfung gehören zum gemeinsamen Integrationsabschluss.

## Belege

- `10-astronomy-independent-demand.json`: vollständige gewöhnliche Zielpflichten und Vorherrollen.
- `13-applied-view-repair.json`: 30 exakte Dateipaare mit Vorher-/Nachherdigests und 58 neuen Referenzen.
- `16-view-learning-delta.json`: vollständiger Lernbasisvergleich aller 69 Ansichten.
- `source-pins.json`: aktuelle Prüfquellen und unveränderte kanonische Rohdigests; die alten 69 Viewdateien entsprechen dem benannten Implementierungs-HEAD.
- Drei tatsächliche lokale Prüflogs belegen Biologie, den gesamten Graph-Vertragsschritt und den abschließenden Physiktest. Eine erfolgreiche Main-CI wird hier noch nicht behauptet.

## Korrektur des tatsächlichen GK/LK-Mergefehlers

Die erste native 72-Kontext-Messung wies 17 fehlgeschlagene GK+LK-Kontexte nach. Ursache war die vom Implementierer ergänzte, kontextspezifisch unterschiedliche `requiredByGoalId`-Notiz innerhalb des gemeinsamen Aufgabenknotens. Dies war ein echter Abnahmefehler trotz erfolgreichem Einzelansichts-Test. Die 58 neuen Knoten enthalten nach der Korrektur ausschließlich die identischen Felder `kind` und `goalId`. Alle kontextspezifischen Angaben stehen jetzt im externen Receipt (`contextEvidence`); kein Merge-Gate wurde verändert. Aufgabenreferenzen, Elternplätze und kanonische Bytes bleiben gleich. `18-metadata-conflict-before-correction.json` erhält den fehlerhaften Zwischenstand; `13-applied-view-repair.json` und `19-final-view-digests.json` binden die korrigierten Endbytes. Die erneute tatsächliche Kontextmessung gehört weiterhin zum Integrationsabschluss.

Die Vorher-Viewbytes werden nach einer lokalen Speichererschöpfung aus dem in `source-pins.json` benannten Git-Commit rekonstruiert. Vor dem Entfernen der ausschließlich temporären Duplikate waren alle 69 Dateien als bytegleich zu diesem Commit bestätigt; die unveränderlichen Originalbytes sind weiterhin in Git vorhanden. Die finalen Receipt-/Demand-/Lernbasisbelege bleiben erhalten.
