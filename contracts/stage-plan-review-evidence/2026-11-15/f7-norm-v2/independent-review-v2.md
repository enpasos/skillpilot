# Unabhängiges F7-Normreview v2

Stand: 15. November 2026, 10:18 CET (Europe/Berlin).

**Entscheidung: ACCEPT als F7-Normkandidat.** Die vier blockierenden Befunde R1–R4 und die drei Konsistenzpunkte C1–C3 des unabhängigen v1-Reviews sind in der exakt gepinnten v2-Fassung behoben. Es bleibt kein blockierender Normbefund aus dieser Prüfung offen. Diese Annahme ist weder Integration noch Gesamtabschluss von F7 oder K1–K13/F1–F7.

Geprüfter Patch: `bb38b836b9b7dd10c36d00cac2803f79ef435093af69a356c8d1c9e99926a3e8`.
Geprüftes Bündelsiegel: `69b21b810c1792ddba8d1011902c8ce4912eaede5e29bcde5fbdf3846af12fb3`.

## Unabhängiger Umfang

Der Reviewer hat das frühere REVISE-Review verfasst und prüft hier die tatsächliche Autorenrevision erneut. Gegenüber v1 wurden acht der 26 vorgeschlagenen Quellen geändert; ihre vollständigen geänderten Zusammenhänge und beide Sprachfassungen wurden gelesen. Die übrigen 18 vorgeschlagenen Quellen stimmen bytegleich mit der bereits unabhängig geprüften v1-Fassung überein. Die 26 unveränderten Baselines sind bytegleich mit v1. Die sieben Entscheidungsquellen stimmen weiterhin mit ihren Pins überein. Es wurde keine aktive Quelle, keine Gitdatei und kein v1-Nachweis verändert; alle neuen Ausgaben liegen ausschließlich in diesem Reviewverzeichnis.

Diese Prüfung ist ein unabhängiges maschinelles Norm- und Konsistenzreview. Sie ist kein fachliches Aufgabenreview, kein Test mit Lernenden und kein Wirksamkeitsnachweis.

## Auflösung der sieben Befunde

| Befund | Eigenständig geprüfte Auflösung | Ergebnis |
| --- | --- | --- |
| R1, E3 bei eigenen atomaren Kindern | GD-U14 nennt die kleinste gemeinsame Einheit oder gedachte Wurzel. Nur zwei verschiedene Kind-Einheiten benötigen die dort erklärte after-Hülle; bei einem eigenen atomaren Kind ordnet der Bedarf selbst. Der Registertext und der Haupttext stimmen nun in DE/EN überein. E4 bleibt auf erklärte Geschwister-after derselben Schicht begrenzt. | behoben |
| R2, überholte Ganzheitssperren | GD-D03, beide Architekturabsätze und die früheren AGENTS-Handlungsregeln erklären B9 ausdrücklich. Die beabsichtigte Ganzheitsreihenfolge stammt aus after, ohne zusätzlichen Voraussetzungstyp, Frontier-Sperre, Mastery oder behauptete Entfernung alter Codepfade. | behoben |
| R3, verfälschter Altwert | Alle Felder und beide Sprachen jeder der 26 Matrixzeilen wurden als vollständige Objekte gegen die tatsächlichen Baselines beziehungsweise Vorschläge verglichen. Beide Seiten sind nun exakt gleich; insbesondere GD-U13.old.enforcement enthält wieder ausschließlich den wirklichen alten Wert. | behoben |
| R4, zu breite F8-Grenze | Haupttext und Implementierungsstatus begrenzen F8–F13 auf die zukünftige Einheiteneinführung und ihre Migration. Notwendige aktuelle K1–K13-Ziel-, Voraussetzungs-, Aufgaben-, Rubrik- und Deckungsreparaturen bleiben ausdrücklich schon jetzt zulässig und benötigen aktuelle unabhängige Nachweise. | behoben |
| C1, alte Glossaroberbegriffe | Die Oberdefinitionen schließen erklärte Cluster, Lernversprechen, Blockordnung, fachliche Einheiten und Planeinheiten ein. own/parentUnitId sind ausdrücklich 1.2-Kompatibilität. Auch verfasst/abgeleitet umfasst jetzt die Einheitenschicht. | behoben |
| C2, pauschal optionale P-Regeln | Der Statusanhang trennt das optionale Zeit-/Budgetprofil P01–P04/P06–P11 von der verbindlichen E2-Pflicht P05 für erklärte Planeinheiten. Ein produktives hartes Gate wird nicht behauptet. | behoben |
| C3, U05-Verortung | U05 nennt nun E1/R4; R1 bleibt in U06. | behoben |

## Konkrete Gegenproben

Die sechs ursprünglichen Gegenproben wurden im eigenen Prüfer erneut ausgeführt; ein siebter expliziter Fall prüft die vormals strittige Frontier-Sperre. Ergebnis und Eingabedaten stehen in `review-evidence.json`.

1. Der atomare DAG a→b→c hat den Lernweg c,b,a, aber mit U={a,c} und V={b} keinen zusammenhängenden Einheitenweg. E2 lehnt die Blockstruktur ab; atomare Azyklizität allein genügt nicht.
2. Eigenes Atom a neben der Kind-Einheit V={b}, mit a requires b: b,a ist zulässig, ohne Atom↔Einheit-after. Genau diesen vormals zu stark formulierten Fall lässt GD-U14 nun ausdrücklich zu, auch an der gedachten Wurzel.
3. Bei u requires v1 und V={v1,v2} ergänzt die persönliche Hülle nur v1. after erweitert weder Umfang noch Prüfungen und erzeugt keinen Vollabschluss von V.
4. Steht a in I und ein bereits geführtes benötigtes b in II, bleibt der Rückgriff ein E2-Befund. Keine automatische Verschiebung eines geführten Ziels durch die Vorbereitungsableitung; Quellenzuordnung und begründete frühere Lernplatzierung bleiben getrennt.
5. Eine hypothetische Eintrittsbasis erzeugt keine Mastery und entfernt kein notwendiges b aus dem tatsächlichen L. Die vollständigen transitiven Pfade bleiben unabhängig von Mastery erhalten.
6. Bei zwei eigenen Prüfungen Q1 und Q2, die A benötigen, erkennt Q1 allein A nicht implizit an. Nach beiden kann der gültige lokale Vertrag A anerkennen; der Elternabschluss besteht keine Kindprüfung.
7. Bei U after V, u requires v1, beherrschtem v1 und offenem v2 ist der atomare Bedarf von u erfüllt, während V unvollständig bleibt. Die v2-Norm erzeugt daraus keine neue Startsperre.

Die E4-Schichtgrenze wurde zusätzlich an der konkreten Ordnung C after B after A beurteilt: Ein zusätzlicher kanonischer Pfeil C after A wäre durch die beiden anderen kanonischen Pfeile redundant. Eine Landesjahrgangsordnung entfernt dagegen keinen kanonischen after-Pfeil, weil sie eine andere Deklarationsschicht bildet. v2 formuliert genau diese getrennte Prüfung; requires-Minimalität bleibt eine eigene Pflicht.

## Reproduzierbare Prüfungen und Siegel

`check_review.py` prüfte unabhängig und mit Exit 0:

- alle 26 Before-/Proposed-Quellpins;
- alle 17 im Bündelsiegel aufgeführten Dateien und die angegebene Bündelsiegeldatei selbst;
- alle 64 versiegelten ursprünglichen v1-Dateien sowie sämtliche 26 bytegleich geerbten Baselines;
- alle 26 vollständigen Alt-/Neuobjekte der Entscheidungsmatrix ohne Abweichung;
- die exakte Rekonstruktion von candidate.patch aus allen und ausschließlich den 26 angegebenen Quelländerungen;
- die sechs ursprünglichen Gegenproben und den zusätzlichen B9-Frontierfall.

Unabhängig nachgezählt bleiben **145 eindeutige Regeln, 12 HART / 50 TEIL / 57 OFFEN / 26 OPT/DOK**. Ausschließlich GD-U14 und GD-P05 wechseln gegenüber der ursprünglichen Baseline von opt zu offen. GD-U13 bleibt auf die bestehende atomare G17-Pflicht im vollständigen 21-Wurzel-Katalog begrenzt. E3/E4 werden ihm nicht als bestandener harter Nachweis angehängt.

Der native Kompendienlauf wurde im eigenen isolierten render-root erneut ausgeführt. `native-verification.log` endet mit Exit 0: Quellschemata, Referenzen und DE/EN-AST-Parität aller drei Kompendien; **44 Markdownseiten (16+26+2)** sowie je deutsche und englische LaTeXquellen; danach erfolgreiche Frischeprüfung. Die korrigierten Regeln erscheinen sowohl in Markdown als auch in TeX aus denselben Quellen.

## Annahmegrenzen und Übernahme

Die v2-Fassung ist als zusammenhängende zweisprachige F7-Normlieferung annehmbar. Die Abgrenzungen sind richtig: null aktivierte echte Landespläne; 1.3 als Entwicklungsgrundlage, keine veröffentlichte Paketversion; drei bestehende fachliche Einheiten weiter unter dem 1.2-Vertrag; produktive Leser, Einheiteneinführung, Pakete, neue Anwendungsanerkennung und Lernweise als spätere Implementierung. Geschützte Qualitätsuntergrenzen, V9-Evidenz, Quellen, atomare Voraussetzungen, Fokus und Lernergebnisse bleiben unverändert. Eine Dokumentänderung schreibt keine Mastery.

Kein PDF, XML-/Ontologiepaket, Remote-CI-Lauf, Merge, frischer Main-CI-Erfolg, fachlicher Lernenden-Assessmentnachweis oder gemessener Rückgriffabbau ist durch dieses Review belegt. Die vollständige Lieferung darf erst nach Integration und frischer erfolgreicher Main-CI als abgeschlossen geführt werden. Bei der Übernahme die AGENTS-Änderungen hunkweise gegen den aktuellen Stand abgleichen und gleichzeitig ergänzte Zeit-/Managementregeln erhalten. Anschließend die nativen Generierungen und einschlägigen Dokumentprüfungen am integrierten Quellstand ausführen.
