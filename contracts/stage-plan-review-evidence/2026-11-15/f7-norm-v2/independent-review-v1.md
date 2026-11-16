# Unabhängiges F7-Normreview, 15. November 2026

Stand: 15. November 2026, 10:08 CET (Europe/Berlin).

**Entscheidung: REVISE.** Die zentrale neue Graph-Definition trifft das beschlossene Modell weitgehend und trennt Norm, bisherigen 1.2-Vertrag und Laufzeit ehrlich. Der konkret gepinnte Kandidat enthält jedoch eine zu starke E3-Kurzregel, verbliebene widersprechende Einheitszugangsregeln und einen falschen Altwert im Reviewnachweis. Diese Punkte vor Übernahme korrigieren; es ist keine Freigabe des derzeitigen Patches.

Geprüfter Patch: `7b8fa662c0ed828ba8f3446ea5cdb5b355abddcca9751181aec7647052ed7802`.

## Umfang und Unabhängigkeit

Gelesen wurden die 26 vorgeschlagenen Quellen, ihre Baselines, die vollständige U01–U15/P01–P11-Entscheidungsmatrix, die handover-Entscheidungen 2.4/M1–M8 und Z1–Z10, das Einheitenkonzept B1–B16/E1–E4 und die Vertragsgrundlagen 1.2/1.3. Diese Prüfung verfasst keine aktive Quelle und kein Fachziel, führt keine Git-Mutation aus und schreibt ausschließlich unter diesem Reviewverzeichnis. Sie ist ein unabhängiges maschinelles Norm- und Konsistenzreview, keine menschliche Erprobung und kein fachliches Review konkreter Lernendenaufgaben.

Alle 26 Baseline-/Vorschlagspins und alle sieben Entscheidungseingangspins stimmen mit den gelesenen Bytes überein. Der unveränderliche V9-Pin ist unverändert. In `curricula/DE/Gymnasium/canonical/` liegen tatsächlich 21 JSON-Wurzeln. Ein Verzeichnis mit aktivierten echten Landesplänen liegt gegenwärtig nicht vor. Daraus wird weder ein vollständiger F2-Erfolg noch ein Rückgriffabbau abgeleitet.

## Vor Übernahme zu korrigieren

### R1: GD-U14 muss die Ausnahme eigener atomarer Kinder ausdrücken

`proposed/docs/concept/skill-graph/source/rules-and-gates.json:951`, DE und EN, verlangt pauschal, dass grenzüberschreitender Bedarf in der erklärten Geschwister-after-Hülle enthalten sei. Der Haupttext ist präziser und korrekt (`03-learning-units.{de,en}.md:76`): Nur wenn am kleinsten gemeinsamen Einheitenknoten beide beteiligten Kinder Einheiten sind, ist ein erklärtes `after` nötig. Ein eigenes Atom wird vom Bedarf selbst geordnet.

**Gegenbeispiel:** U enthält das eigene Atom a und die Untereinheit V mit b; a requires b. Der gültige Lernweg ist b, a. Es gibt kein erklärtes `after`, und eines zwischen dem Atom a und der Einheit V wäre nach B7 unzulässig. Die pauschale Kurzregel würde einen gültigen Fall ablehnen beziehungsweise eine unzulässige Deklaration verlangen. Dasselbe Problem entsteht bei einem eigenen Wurzelatom neben einer obersten Einheit.

**Korrektur:** E3 an der kleinsten gemeinsamen Einheit beziehungsweise gedachten Wurzel formulieren: Liegen die Ziele dort in zwei verschiedenen Kind-Einheiten, muss ihre Reihenfolge aus der dort erklärten `after`-Hülle folgen; ist mindestens ein Kind ein eigenes Atom, ordnet der Bedarf selbst. E4 bleibt ausschließlich Redundanz unter erklärten Geschwister-after derselben Schicht. Dieselbe Präzisierung in der lesbaren Entscheidungsmatrix vornehmen.

### R2: Die aufgehobene Zugangspolitik ist noch an mehreren Stellen aktiv formuliert

- `proposed/docs/concept/skill-graph/source/rules-and-gates.json:1182` (`GD-D03.rule`, DE/EN) sagt weiterhin, Ganzheitssperren und direkter Prüfungszugang darunter seien offen. Bereits die eigene enforcement-Zelle 1184 sagt das Gegenteil: aufgehoben durch B9. Der Widerspruch wird unverändert in Markdown und TeX gerendert.
- `proposed/docs/concept/skill-graph/architecture-source/chapters/12-learning-unit-design-and-examples.{de,en}.md:193` verlangt für fremden Vollabschluss weiterhin eine fachlich begründete Ganz-Einheits-Voraussetzung. Nach B9 ist die zusätzliche Aussage ausschließlich `after` als Ordnung ohne Bedarf und ohne Startsperre. Ein zweiter Whole-Unit-Bedarf ist nicht mehr das Zielmodell.
- `proposed/AGENTS.md:534–538` und `:588` führen Ganzheitssperren weiterhin als unentschieden. Die neue spätere Präzedenznotiz erkennt die Ablösung zwar an, aber diese früheren unmarkierten Handlungsregeln bleiben widersprüchlich und sind leicht isoliert zitierbar.

**Gegenbeispiel:** U after V, V enthält v1 und v2, u requires v1; v1 ist beherrscht, v2 offen. Die frühere Sperrlesart würde u zurückhalten, der bindende B9-Vertrag verlangt ausschließlich die normale atomare Frontierprüfung. Das Beispiel ist zugleich keine Vollabschlussbehauptung über V.

**Korrektur:** Die überholten Sätze ersetzen oder ausdrücklich als durch B9 abgelöste historische Aussagen markieren. Direkter Prüfungszugang, Authentifizierung, Scope und Sitzungsbindung bleiben ihre eigenen Verträge; eine Entfernung historischer Codepfade nicht behaupten. Im Architekturabsatz die zusätzliche Ganzheitsreihenfolge `after` zuordnen, ausdrücklich ohne neuen Voraussetzungstyp.

### R3: Der dokumentierte Altwert GD-U13 wurde bei der Kandidatenerzeugung verändert

`rule-decision-matrix.json:710–711` ist für `GD-U13.old.enforcement` nicht identisch mit der Baseline. Deutsch enthält schon die neue E3/E4-Abgrenzung; beide Sprachen enthalten schon den neu hinzugefügten Schlusssatz. Der exakt gepinnte Baselinewert enthält diese Ergänzungen nicht. Die übrigen 25 Altwerte und sämtliche 26 Neuwerte stimmen.

Ursache ist die flache Kopie in `author_candidate.py:158` (`dict(r)`) zusammen mit der verschachtelten In-place-Mutation `:169–170`. Die Nachweismatrix teilt dieses Objekt mit dem zu ändernden Vorschlag.

**Korrektur:** Altwerte tief kopieren oder aus frisch eingelesenen Baselinebytes bilden. Den vollständigen Matrixvergleich für alle Felder und beide Sprachen ausführen. Pins der Baselines unverändert lassen; die Beweisgeschichte nicht durch Neupinnen an den bereits veränderten Altwert angleichen.

### R4: F8–F13 nicht auf die autorisierten K-Reparaturen ausweiten

`proposed/docs/concept/skill-graph/source/implementation-status.json:60–61` verlangt F8–F13 pauschal für „Deckungsänderungen / coverage changes“. Das ist weiter als die geordnete Cluster-/Einheiten-/Laufzeitmigration. Die Handover 2.4/M6 und 3.4 verlangen notwendige Aufgaben- und Deckungsreparaturen bereits innerhalb K1–K13/F1–F7; ein falsch gedecktes Diagrammziel darf nicht bis zur späteren Einheiteneinführung falsch belegt bleiben.

**Gegenbeispiel:** K2 entfernt eine falsche Distributivgesetz-Abdeckung für ein Diagrammziel und ergänzt eine tatsächlich passende Diagrammaufgabe mit aktuellem Review. Das ist autorisierte curriculare Reparatur vor F8, keine Einführung einer globalen Unit-Anerkennung.

**Korrektur:** Die F8-Grenze auf die Einführung/Umstellung bestehender fachlicher Einheiten, ihre Cluster-/Prüfungsumzüge, Paketträger, produktive Leser und Anerkennung beziehen. Notwendige aktuelle fachliche Ziel-, Aufgaben- und Abdeckungskorrekturen bleiben innerhalb des delegierten K1–K13-Auftrags zulässig und benötigen ihre eigenen Nachweise.

## Weitere kleine Konsistenzkorrekturen

- `source/glossary-and-symbols.json:42–43` und `:365–366` definieren Lerneinheiten noch als autorisierte fachliche Einheiten, ohne Clusterdeklaration/Blockordnung und ohne Planeinheiten. Die neuen Einzelbegriffe sind korrekt; die ältere Oberdefinition sollte sie jetzt einschließen und den 1.2-Feldvertrag als Kompatibilität kennzeichnen.
- `source/implementation-status.json:299–300` nennt noch P01–P11 insgesamt optional. P05 hat jetzt eine verbindliche E2-Pflicht für erklärte Planeinheiten; entsprechend eingrenzen, damit der Statusanhang nicht dem Register widerspricht.
- `GD-U05.milestone` nennt „E1 beziehungsweise R1“ statt der dort gemeinten Zuordnung E1/R4. U06 hat dagegen die richtige R1-Verortung. Das ist eine lokale Textkorrektur.

## Bestätigte Modellteile und Gegenproben

Die sechs vollständig ausgeführten kleinen Gegenproben stehen mit Daten und Ergebnissen in `review-evidence.json` und `check_review.py`:

1. Atomarer DAG a→b→c, U={a,c}, V={b}: atomar lernbar als c,b,a, aber kein zusammenhängender Einheitenweg. E2 muss den Kindgraph prüfen. Haupttext DE/EN richtig.
2. Eigenes Atom neben Kind-Einheit: braucht keinen erklärten after zwischen Atom und Einheit. Haupttext richtig, R1 oben betrifft den Registerkurztext.
3. after ordnet, vergrößert L jedoch nicht: u requires v1 mit V={v1,v2} ergänzt nur v1. Kein ganzes fremdes Fach, keine Zusatzprüfung, kein Vollabschluss von V.
4. a steht in I und braucht bereits geführtes b in II: Rückgriff bleibt sichtbar, bis eine begründete Fachkorrektur oder ausdrücklich erklärte Vorbereitung ihn auflöst. Die bloße Hüllenbildung darf b nicht still nach I verschieben. Quellenzuordnung bleibt separat.
5. Eine hypothetische Eintrittsbasis ist kein Masteryergebnis und entfernt keine notwendigen Atome aus dem tatsächlichen L. Normal-/Strict-Fokus und der feste Gesamtfortschrittsnenner bleiben getrennt. Der Kandidat trifft dies in beiden Sprachen.
6. Q1 und Q2 derselben gültigen Einheit benötigen A: Q1 allein erkennt A nicht an; nach beiden Prüfungen kann der lokale Vertrag A anerkennen. Elternprüfung und offene unabhängige Karte bestehen keine Kindprüfung. Mengenformeln unverändert, neue produktive Anerkennung wird nicht behauptet.

E1, verschachtelte/atomar disjunkte Umfänge, eigene Atome, übersprungene Nicht-Einheitencluster, gedachte Wurzel, getrennte kanonische/Landes-Deklarationsschichten, Teilumfang gegenüber Vollabschluss und E4 innerhalb der eigenen Schicht sind im Haupttext DE/EN konsistent. Geführt in/steht in, kanonischer vorläufiger Standard, frühester tatsächlicher Bedarf, unveränderte Quellen und keine Mastery durch Strukturänderung sind ausdrücklich erhalten. Die vollständige Landeswurzel hat exakt I/II mit II after I; abgeleitete Einstufensichten brauchen keine leere Gegenstufe, und die bundesweite Sicht bleibt außerhalb der Landesautorität. Eine Prüfungslücke wird durch passende Aufgabe/Rubrik/Review repariert, ohne erfundenen Bedarf oder abgesenktes Gate.

## Ampel und tatsächliche Implementierungsgrenze

Unabhängig nachgezählt: **145 eindeutige Regeln, 12 HART / 50 TEIL / 57 OFFEN / 26 OPT/DOK**. Gegenüber den gepinnten Baselines wechseln ausschließlich GD-U14 und GD-P05 von opt zu offen. Die neue Compilerkonstante entspricht diesen tatsächlichen Zeilen und den deklarierten Zustandszählungen; es wird keine HART-Zeile neu geschaffen.

GD-U13 bleibt sinnvoll HART nur für die unveränderte atomare Pflicht: der explizite vollständige Katalogaufruf `check:transitive-minimality` steht in `.github/workflows/ci.yml:677`; sein CLI lädt standardmäßig rekursiv den gesamten kanonischen Katalog. `testTransitiveMinimalityCli.ts` enthält wirkliche Exit-1-Fälle für Redundanz, atomare Normalform und explizite Typfehler, außerdem Fehlerfälle für Referenzen und Inventar. Das sind vorhandene Gatepfade und Tests, keine Behauptung eines frischen Passes dieser CI im Review. E3/E4 sind davon getrennte offene Pflichten. Bestehende 1.2-LU-Prüfungen werden nicht als E1–E4-Vollabnahme umetikettiert.

Die 1.3-README, tatsächliche Stufenplan-Tests und der Bericht bestätigen die begrenzte Grundlage: Testpläne, geteilte Land-/Dauerautorität, explizite Rollen/Platzierungsgründe, materialisierte Kompatibilität und optionale `--require-no-backflow`-CLI-Prüfung. Echte Landesaktivierung und gemeinsam umgestellte produktive Leser fehlen. Die behaupteten null Landespläne und ausstehenden Laufzeitmigrationen sind damit angemessen abgegrenzt. Keine Aussage über neue harte Landesgates, B3/B13-Abnahme oder runtime F13 wird freigegeben.

## Automatisierte Dokumentprüfung

Der native Prüfer wurde in einem gesonderten Review-Root erneut ausgeführt, mit den gepinnten Vorschlägen als Overlay. `native-verification.log` endet mit Exit 0: kanonische Quellschemata, Referenzen und DE/EN-AST-Parität aller drei Kompendien; 16+26+2=44 erzeugte Markdownseiten; je deutsche/englische LaTeXquelle für Graph-Definition, Architektur und Glossar; danach Frischeprüfung der Markdownausgaben. Die obigen Widersprüche werden korrekt in Markdown und TeX übertragen; der grüne Compiler beseitigt sie nicht.

Kein PDF wurde kompiliert. Der Kandidat ändert oder erzeugt keine XML-/Ontologiepakete; Gleichheit einer späteren XML-Paketprojektion mit dem neuen Modell ist daher nicht nachgewiesen und wird nicht behauptet. Remote-CI, Merge, frische Main-CI, produktive Leser, neue Lernendenaufgaben und gemessene Rückgriffe sind durch diesen Dokumentlauf nicht belegt.

## Grenze einer späteren Annahme

Nach R1–R4 und den kleinen Konsistenzkorrekturen erneut exakt pinnen, Matrix alt/neu gegen die unveränderten Baselinebytes vergleichen, die hier gefundenen Gegenbeispiele im Kurztext lösen und native Web-/TeX-Prüfung wiederholen. Dann ist eine Annahme als F7-Normlieferung möglich. Sie wäre weiterhin keine Implementierung von F8–F13, keine Aktivierung eines Landes und keine fertige K1–K13-Gesamtlieferung. Bei der aktiven Übernahme nur die konkreten AGENTS-Hunks anwenden und parallel ergänzte Zeit-/Managementregeln erhalten. Abschluss erst nach Integration und frischer erfolgreicher Main-CI gemäß aktuellem Mandat führen; ein eventueller späterer Dokumentabschluss darf nicht die CI eines früheren Implementierungscommits beanspruchen.
