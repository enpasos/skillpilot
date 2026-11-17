# Physik: Länder-, Stufen- und Themenansichten

Stand: 17. November 2026. Diese Lieferung ist bis zur Integration und einem
frischen erfolgreichen `main`-CI-Lauf offen. Lokale Prüfungen und unabhängige
Quellenprüfung sind keine Lernwirksamkeitsstudie und keine Integration.

Die Ansichten unterscheiden die amtliche Quellenzuordnung eines Ziels von
seinem didaktischen Erwerbsplatz. Eine Voraussetzung darf wegen eines konkreten
kanonischen Bedarfs früher gelernt werden; dadurch wird weder der amtliche
Lehrplan umgeschrieben noch globale Beherrschung erzeugt. Die bestehenden
Kompetenztexte und `requires` sowie die zurückbehaltenen Länderquellen bleiben
unverändert. Eigene Aufgabenangebote und ihre Metadaten werden getrennt geprüft.

## Umfang und Ordnungsentscheidung

Aus den 75 vorhandenen Physikansichten entstehen 90 Ansichten: hinzu kommen
15 echte Landesauszüge für die Sekundarstufe I. Die ursprünglichen atomaren
Kompetenz-Zielmengen bleiben je vorhandener Ansicht erhalten; ausdrücklich
geprüfte Aufgabenreferenzen ergänzen den jeweiligen Aufgabenumfang. Die neuen
Sek-I-Auszüge wählen ihre Seeds aus dem vor der Umgruppierung dokumentierten
unteren Quellumfang und ergänzend überprüften direkten Quellzuordnungen.
Ein früher benötigtes oberes Ziel wird dadurch kein unterer Quellseed.
Der bisherige Rückfall auf einen bundesweiten Auszug ist bei diesen
Länderauszügen ausdrücklich eine zu korrigierende Umfangsabweichung.

`childOrder.after` im eigenständigen Sourceformat 1.2 beschreibt eine partielle
Einheitenordnung. Nur die direkte erforderliche Verbindung zwischen zwei
Kind-Einheiten verlangt eine erklärte Ordnungshülle. Ein Bedarf über ein
eigenes Atom des gemeinsamen Parents wird weiterhin durch `requires` geordnet.
Die beabsichtigte Einheitenfolge ist bei kohärenten Themen-/Übungseinheiten
fachlich geprüft; ihre minimale Hülle stammt weder aus der Dateireihenfolge
noch aus bloßer Nummerierung. Widersprüchliche Gruppenschnitte werden durch
feinere Gruppen oder belegte Erwerbsplätze repariert. Amtliche Zeitfolgen
bleiben zusätzlich erhalten. Dies aktiviert keinen neuen StagePlan.

Gemeinsam benötigte Grundlagen erhalten einen expliziten Erwerbsplatz im
ersten passenden Jahr bzw. in der ersten passenden Phase. Ein gemeinsamer
Mathematikbedarf macht beispielsweise E.5 nicht zum Vorgänger von E.6.
`goalEntry.acquisitionPlacement: true` ist ausschließlich eine Vorlage für
bereits zur autoritativen Lernbasis gehörende `prerequisiteOnly`-Atome.
Unmarkierte Scope-Ausschlüsse werden dadurch nicht zu Erwerbsplätzen.
Die Erwerbsplatzprüfung verwendet die tatsächlich kursgültigen Seeds und deren
ungefilterte kanonische Voraussetzungshülle. Ein nur im LK gültiger Inhaltsref
begründet keinen früheren GK-Erwerbsplatz. Beispielsweise benötigt der hessische
GK die Kettenregel für Q2, während im LK bereits ein E-Ziel einen echten Bedarf
belegt. Die unveränderte rohe Quellen-/Rollenmenge wird separat geprüft.

GK und LK verwenden eine gemeinsame geprüfte Platzierungsautorität über der
Vereinigung ihrer Seeds und anschließend die jeweils unveränderte Kursmenge.
Beim Entfernen leerer Einheiten bleibt bereits erklärte transitive Ordnung
erhalten. Der native Merger darf einen lokalen Erwerbsmarker weder auf einen
früheren unmarkierten Verweis übertragen noch dadurch den ursprünglichen
Erwerbsort beseitigen. Ziel-Dominanz und Konfliktprüfungen bleiben erhalten.

Kanonische Ergänzungen erhalten ihren bestehenden kanonischen Phasenplatz,
wenn kein akzeptierter früherer Seed sie benötigt. Insbesondere gehören obere
Abiturvorschläge nicht durch einen ersten-Stufen-Fallback in die Sek I.
Zurückgeführte Q2-Inhalte stehen im Thema „Induktion und elektromagnetische
Schwingungen“, entsprechende Q4-Inhalte in Kernphysik und Astrophysik.
Breite kanonische Bretter werden nach ihren vorhandenen fachlichen Familien
gebündelt. Jede Bündelung muss einen azyklischen fachlichen Quotienten haben;
verflochtene Erwerbsschritte bleiben getrennt und werden im Autorenbericht
als abgelehnte Vergröberung ausgewiesen. Eine kürzere Kartenliste rechtfertigt
keine falsche Ganzthemen-Voraussetzung.

## Quellen und zeitliche Granularität

Die maschinenlesbare [Quellenkonfiguration](https://github.com/enpasos/skillpilot/blob/main/scripts/generate_laender_physics_stage_views.sources.json)
bindet zurückbehaltene Extraktionen und Mappingreviews mit SHA-256. Sie enthält
außerdem die amtlichen URLs, Dokumenthashes und überprüften Seiten der sieben
zusätzlich herangezogenen Primärdokumente. Die
[Mitgliedschaftskonfiguration](https://github.com/enpasos/skillpilot/blob/main/scripts/generate_laender_physics_stage_views.memberships.json)
bindet den ursprünglichen unteren Quellumfang und die Zielmengen der 75
Ausgangsansichten. PDFs und Volltexte werden nicht dupliziert oder ersetzt.
Die [konkreten Zeitcontainer und Quellenabschnitte](physics-stage-view-source-units-2026-11-17.md)
machen die Zuordnung je Land dauerhaft nachprüfbar.

| Land | Verwendbare Zeitgliederung und Quellenabgrenzung |
| --- | --- |
| Baden-Württemberg | Bänder 7/8 und 9/10; Kursstufe 11/12. Keine Semester aus Lernbereichsnummern ableiten. |
| Bayern | Physik 8, 9, 10; Einführung 11; Qualifikation 12 und 13. NTG-Profil sowie Biophysik-/Astrophysikvarianten bleiben kenntlich. |
| Berlin | Doppeljahrgänge 7/8 und 9/10; Qualifikationsphase. Die obere E-Phase für andere Schulformen wird keinem gewöhnlichen Gymnasium pauschal als E11 zugeschrieben. |
| Brandenburg | Wie Berlin; gemeinsamer amtlicher Teil C Physik 2015. |
| Bremen | Unterer Plan unter Berücksichtigung der Einschränkungen 2022: bis Ende 8 und Jahrgang 9; oben E und Q. |
| Hamburg | Unteres Quellband 7–10; Studienstufe. Keine vom oberen Plan nicht vorgegebene Jahres-/Semesteraufteilung behaupten. |
| Hessen | G9: 7, 8, 10; eigener G8-Auszug: 6G–9G. Oben Einführung und Q1–Q4 mit eigenständigen Übungen und vorhandener Abiturprüfung. |
| Mecklenburg-Vorpommern | Gymnasium: 7, 8, 9; Einführung 10 und Qualifikation 11/12. E11/Q12/13 betrifft im oberen PDF andere Schulformen. |
| Niedersachsen | Untere Doppeljahrgänge 5/6, 7/8, 9/10; oben E und Q. Kompetenz-Endstände sind keine Einzeljahreszuweisungen. |
| Nordrhein-Westfalen | G9: Erprobungsstufe 5/6 und weitere Sek I; oben EF und Q. Der ältere G8-KLP ist kein Nachweis einer aktuell gültigen G9-Jahreszuordnung. |
| Rheinland-Pfalz | G9: drei Lernjahre mit TF1–4, TF5–8, TF9–12; keine erfundenen Kalenderklassen. Die G8-Richtlinie bindet TF1–10 an 7–9 und verzahnt TF11/12 mit der Oberstufe. Oben E und Qualifikation der MSS. |
| Saarland | Quellbelegte Klassenstufen mit erhaltenem Zweigbezug; oben Einführung und Hauptphase. Auswahl-/Profilstatus bleibt bestehen. |
| Sachsen | Klassenstufen 6–10 und Qualifikation 11/12. Klasse 10 beendet Sek I und hat zugleich Einführungsfunktion. |
| Sachsen-Anhalt | Klasse 6, Band 7/8, Klasse 9, Einführung 10 und Qualifikation 11/12. |
| Schleswig-Holstein | Blöcke I und II ohne feste Jahrgangsbindung; oben E und Q. Die Sek-I-Fassung 2026 gilt ab 2026/27 aufwachsend, 2022 läuft dort aus; die obere Fassung bleibt 2022. |
| Thüringen | Bänder 7/8 und 9/10, normale gymnasiale Einführung 10, Qualifikation 11/12. E11 im Fachlehrplan ist ausdrücklich ein anderer Zugang (11S u.a.). |
| Kanonisch | Eigener bundesweiter didaktischer Standard mit bestehenden Phasen. Er behauptet keine zusätzliche amtliche Länder-/Jahreszuordnung. |

Für die sechs zuvor fehlenden unteren Primärquellen gelten insbesondere:

- BE/BB: [Teil C Physik 2015](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Physik_2015_11_16.pdf), PDF-Seiten 27/29: TF3.1–3.4 in 7/8, TF3.7–3.13 in 9/10; TF3.5/3.6 zwischen beiden Bändern verschiebbar.
- NI: [Kerncurriculum 2015](https://cuvo.nibis.de/cuvo.php?p=download&upload=18), PDF-Seiten 26–29: Optik 5/6, Mechanik 7/8, Thermodynamik/Atom-Kern 9/10; elektrische und energetische Kompetenzen gestuft.
- NW: [G9-Kernlehrplan 2019](https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_ph_klp_3411_2019_06_23.pdf), PDF-Seiten 10/20/30: Ende Erprobungsstufe und Ende Sek I.
- RP: [allgemeiner Lehrplan](https://bildung.rlp.de/fileadmin/user_upload/rfb.bildung.rlp.de/Physik/Material/Lehrplaene_Endversion_online.pdf), gedruckte Seiten 192–194 und 207: Lernjahre und didaktische Reihenfolge. Die gesonderte [G8-Richtlinie](https://bildung.rlp.de/fileadmin/user_upload/naturwissenschaften.bildung.rlp.de/2024/G8GTS_Richtlinien_Bio_Chemie_Physik_final.pdf), Seite 19, darf nicht mit fiktiven Einzeljahren aufgefüllt werden.
- SH: [Fachanforderungen 2026](https://fachportal.lernnetz.de/files/Fachanforderungen%20und%20Leitf%C3%A4den/Sekundarstufe/Fachanforderungen/Fachanforderungen%20Physik%20Sekundarstufe%20%282026%29.pdf), Seite 38; auslaufende [Fassung 2022](https://fachportal.lernnetz.de/files/Fachanforderungen%20und%20Leitf%C3%A4den/Sekundarstufe/Fachanforderungen/Fachanforderungen%20Physik%20Sekundarstufe%20%282022%2C%20barrierearm%29.pdf), Seite 36: Block I vor II, ausdrücklich keine festen Kalenderjahrgänge.

Breite partielle Subtree-Mappings ordnen nicht jedes enthaltene obere Atom
automatisch der Sek I zu. Beispielsweise beweist eine untere Brücke zum
Induktionsbundle keine quantitative RL-Einschaltrechnung in MV-Jahrgang 8.
Nicht zum geprüften unteren Seedumfang gehörende Atome nutzen eine obere
Quelle; nur ein tatsächlich benötigter kanonischer Pfad begründet ein Vorziehen.

Hessens E.3 heißt amtlich weiterhin „Waagerechter Wurf und Kreisbewegung“.
Der erhaltene Wurf-/Superpositionsunterbaum wird didaktisch bei E.1 gelernt;
die sichtbaren Labels erklären dies ausdrücklich. E.4–E.7 bleiben nicht
verbindlich und untereinander ohne erzwungene Gesamtkette. Spezielle
Relativitätstheorie wird in Q4 keinem pauschalen Kern-/Standardmodellabschluss
untergeordnet. In Bayern werden ohne vorhandene Abiturziele weder Ziele
hinzuerfunden noch Übungen als Abiturprüfung umbenannt; die beiden überprüften
Ph10.1-Erwerbsaufgaben bleiben in diesem Themenfeld.

Neun eigene, unabhängig geprüfte Aufgaben schließen belegte Materiallücken:
Linsenauge in MV/SL, freier Fall in SN, Versuchsdokumentation in SN/ST/TH,
Motorbau in MV, astronomische Beobachtungen in SN, elektromagnetisches Spektrum
und ideales Transformatormodell in SL/SN sowie Zerfallsreihen und Ruheenergie
in HH; die beiden HH-Angebote sind ausschließlich LK zugeordnet. Diese engen
Angebote sind keine amtlichen Aufgabenpflichten. Ergänzend werden passende
Bestandsaufgaben bei vollständiger vorhandener Lernbasis exponiert. Im
kanonischen CrossStage-Paar werden acht neue Aufgaben entsprechend dem
Kursfilter aktiv; die Augenaufgabe bleibt dort ein unmarkierter, ruhender
`prerequisiteOnly`-Inventarverweis, weil ihre Kompetenz nicht zur kanonischen
Default-Lernbasis gehört. Ihre aktive Länderplatzierung importiert dort keine
gewöhnliche Kompetenz. Die genaue Aufgabenbindung steht in
[`reviewedLowerAssessmentBindings`](https://github.com/enpasos/skillpilot/blob/main/scripts/generate_laender_physics_stage_views.sources.json).
Eine gesondert freigegebene QA-Metadatenkorrektur ergänzt ausschließlich den
leeren Bewegungs-Strang bei der bestehenden Beschleunigungsaufgabe sowie den
neuen Dokumentations- und Fallaufgaben; Texte, `requires` und `coveredGoalIds`
werden dadurch nicht verändert. Inhalts-, Angebots- und Folgebelege bleiben
getrennt erhalten.

Auch der Aufgabenplatz folgt der tatsächlich geprüften Kompetenz:
Die Wurfaufgabe `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` liegt in MV, SL und SN
erst bei der vorhandenen Modellierungskompetenz
`d6dc0e02-831d-4894-a61a-852bcc74f147`. Ihre unveränderte unmittelbare
Vorbereitung Beschleunigung allein hätte zuvor einen zu frühen Platz erzeugt.
Diese didaktische Platzkorrektur verändert weder `requires` noch Coverage.

## Reproduktion und Qualitätsgrenze

Die Authorer schreiben nach erfolgreicher vollständiger Kandidatenprüfung;
`--check` prüft den reproduzierbaren Stand. Die Berichte enthalten pro Land
`source_temporal_granularity`, `missing_exam_unit`, frühere Erwerbsplätze mit
erhaltener Quellenzuordnung und kanonische Pfadzeugen für Vorlagen.

```sh
python3 scripts/generate_hessen_physics_stage_views.py --check
python3 scripts/generate_hessen_physics_stage_views.py --check --duration-views
python3 scripts/test_generate_hessen_physics_stage_views.py
python3 scripts/generate_laender_physics_stage_views.py --check
python3 scripts/test_generate_laender_physics_stage_views.py
cd app
npx tsx scripts/testPhysicsStageViewProjection.ts
```

Die Source-/Runtime-Formatgrenzen und der native GK/LK-Merge werden zusätzlich
durch Backendtests geprüft. Die tatsächliche Abnahme muss die autoritativen
nativen Seeds und ihre vollständige Lernbasis sowie sämtliche verschachtelten
Kartenbretter in Einzel- und kombinierter Fächer-/Kursauswahl messen. Ein
roher Baumvergleich ersetzt diese Produktmessung nicht. Die lokalen
Zwischenstände und ihre unveränderten Vorherdaten liegen unter
`tmp/pipeline/laender-stufen/gesamt/` und `he/ephase/`; sie dürfen nicht als
bereits abgeschlossene Integration oder erfolgreiche Gesamtprüfung gelesen werden.
