# Unabhängige Prüfung des hessischen E.2-Zuschnitts

**Korrektur vor Freigabe empfohlen.** Die sechs fachlichen Kinder und ihre Reihenfolge sind für den geprüften ersten Schritt tragfähig. Ein alter Plan setzt ein verschobenes Gravitationsziel erfolgreich fort. Wer dasselbe Ziel im gewöhnlichen Lernfokus bearbeitet hat, verliert beim Zustandsabgleich den Zeiger auf seine laufende Arbeit. Außerdem verschiebt der Generator neun verschiedene Erwerbsplätze für Voraussetzungen. Der Nachweis muss diese Verschiebungen ausweisen.

Geprüft wurde der einzelne Commit `a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d` gegen seinen unmittelbaren Elterncommit `948f2a419d18c08c7edd6b5d7f9a5367fe81bcf6`. Alle Quellzeilen beziehen sich auf den geprüften Commit. [Änderung](https://github.com/enpasos/skillpilot/compare/948f2a419d18c08c7edd6b5d7f9a5367fe81bcf6...a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d)

## 1. Rollen und Lernmengen · bestätigt

Alle 90 Physikansichten wurden anhand ihrer Git-Blobs verglichen. Acht haben sich geändert, 82 sind bytegleich. Pro Ansicht wurden die atomaren Rollen mit `role_atoms(view)` aufgelöst und die kanonischen Voraussetzungen beider Mengen über sämtliche Fächer verfolgt. Die ID-Mengen und ihre Prüfsummen stimmen vorher und nachher in allen acht Fällen überein. [Rollenauflösung, Zeile 175](https://github.com/enpasos/skillpilot/blob/a88f17523b/scripts/generate_hessen_physics_stage_views.py#L175) · [Eigene Messung mit ID-Differenzen je Datei](structure.actual.json)

| Ansicht in Hessen | Anzahl Ansichten | Ziele | Nur Voraussetzung | Lernmenge |
| --- | ---: | ---: | ---: | ---: |
| GK, stufenübergreifend, jeweils Standard, G8 und G9 | 3 | 591 | 1.076 | 1.667 |
| LK, stufenübergreifend, jeweils Standard, G8 und G9 | 3 | 614 | 1.053 | 1.667 |
| GK, nur Sek II | 1 | 475 | 1.097 | 1.572 |
| LK, nur Sek II | 1 | 493 | 1.079 | 1.572 |

## 2. Reihenfolge · bestätigt

Die sechs unmittelbaren `after`-Paare entsprechen genau der transitiven Reduktion des fachlichen Bedarfs zwischen den Geschwistern. Es gibt keine fehlende, redundante oder rückwärts gerichtete Verbindung. Unter den Zielatomen gibt es sieben direkte Gruppenpaare. Mit den expliziten Vorbereitungen kommt in den reinen Sek-II-Ansichten ein achtes Paar von Trägheit zu Energie hinzu. In beiden Zählungen bleiben elf erreichbare und sechs minimale Paare. Der direkte Bedarf von Impuls an der Grundgleichung ist bereits über andere Kinder abgedeckt. Die Tabelle zeigt für jedes deklarierte Paar einen direkten kanonischen Nachweis, der in allen acht Ansichten gilt. [Deklaration in der LK-Ansicht, Zeile 1856](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/composition-views/physik/de-he-lk-g9.view.json#L1856)

| Voraussetzung → folgendes Kind | Nachweis als „Ziel benötigt Voraussetzung“ |
| --- | --- |
| Trägheit → Kraft, Masse und Beschleunigung | `a94cfe1c` benötigt `31a2ef52` |
| Kraft, Masse und Beschleunigung → Kraft und Gegenkraft | `ad984bb6` benötigt `a94cfe1c` |
| Kraft, Masse und Beschleunigung → Mehrere Kräfte zugleich | `5fd45dbc` benötigt `5f289cdc` |
| Kraft, Masse und Beschleunigung → Energie | `c1c71daa` benötigt `5f289cdc` |
| Kraft und Gegenkraft → Impuls und Stöße | `839ecc8f` benötigt `a0aaedcb` |
| Energie → Impuls und Stöße | `0da13365` benötigt `91c49019` |

`validate:composition-views` endet erfolgreich mit 387 Ansichten, 21 Katalogen, 0 Fehlern und 2.576 Warnungen. Sein Ordnungscheck erkennt das Hinzufügen einer transitiv redundanten Verbindung. In einer Speicherkopie akzeptierte derselbe Check auch das Entfernen der notwendigen Verbindung zur Energie. Die Prüfung des tatsächlichen Bedarfs nach E3 kommt deshalb aus der getrennten Auswertung der Zielgraphen. [Validator, Zeile 447](https://github.com/enpasos/skillpilot/blob/a88f17523b/app/src/utils/authoring/compositionViewAuthoring.ts#L447) · [Gegenprobe am Ordnungscheck](order-validator.actual.json)

## 3. Mitglieder · bestätigt, eine Prämisse berichtigt

Die 22 GK- bzw. 23 LK-Ziele passen für diesen Gruppierungsschritt. Die sechs Kinder sind Ansichtsstrukturen. Eröffnungen und fachliche Abschlüsse folgen in späteren Schritten. [Mitgliederliste, Zeile 75](https://github.com/enpasos/skillpilot/blob/a88f17523b/scripts/generate_hessen_physics_stage_views.py#L75) · [Geprüfte Texte und Voraussetzungen je Ziel](structure.actual.json)

| Kind | Fachliche Begründung |
| --- | --- |
| Trägheit | Das erste Axiom und seine Anwendung führen zum Unterscheiden von Inertial- und Nichtinertialsystemen. Das Bezugssystemziel benötigt unmittelbar das erste Axiom. |
| Kraft, Masse und Beschleunigung | Das zweite Axiom und die eindimensionale Anwendung der Grundgleichung gehören zusammen. Die vorgesehene Eingrenzung des derzeit weiter reichenden Axiomtexts ist im Folgeschritt vermerkt. |
| Kraft und Gegenkraft | Die beiden Ziele verlangen, ein Wechselwirkungspaar zu formulieren und die Kräfte den zwei verschiedenen Körpern zuzuordnen. |
| Mehrere Kräfte zugleich | Reibung steht vor der Anwendung auf Reaktionsweg, Bremsweg und Sicherheitsabstand. Das Verkehrslernziel benötigt kanonisch beschleunigte Bewegung, Prozentrechnung und Termeinsetzung. Auch ohne bestandene Reibung erschien es in der nativen Frontier. Die hessische Reihenfolge ist fachlich begründet. Eine kanonische Reibungskante würde auch die kinematische Behandlung in Bayern ändern. |
| Energie | Arbeit, kinetische und potenzielle Energie sowie die mechanische Gesamtenergie stützen die Bilanz. Bei Reibungsenergie wird die Umwandlung in innere Energie bilanziert. Dieses Ziel verlangt Energieerhaltung. |
| Impuls und Stöße | Auf Impuls, Kraftstoß und elementare Stoßmodelle folgen die Anwendungen. Das Schwerpunktsystem benötigt elastische Stöße, die LK-Herleitung benötigt das zweite und dritte Axiom. Zwei gemischte E.2-Prüfungen benötigen das Schwerpunktsystem direkt, die E.5-LK-Prüfung benötigt die Impulsherleitung. |

Die vier gemischten Prüfungen `68061652`, `22561c66`, `72649cf5` und `be6d4895` stehen in allen acht Ansichten nach den sechs Kindern auf der E.2-Elternebene. Der Karten- und der Cockpit-Pfad bestätigen das auch für die tatsächlichen Lernansichten. [Kanonisches Verkehrsziel, Zeile 8179](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json#L8179) · [Vereinbarte hessische Reihenfolge, Zeile 680](https://github.com/enpasos/skillpilot/blob/a88f17523b/AGENTS.md#L680) · [UI-Messung](ui.actual.json)

## 4. E.5 und erreichbare Prüfungsziele · bestätigt

Die kanonische Kette führt vom Gravitationsgesetz über Gravitationskraft und Potential zu potentieller Energie und Potential. Auf dieser Grundlage leitet das vertiefte Energieziel die Erhaltung für konservative Kräfte her. Die vier fachlichen Ziel-IDs wechseln in allen acht Rollenprojektionen von E.2 zu E.5. Keines der verbleibenden E.2-Ziele oder seiner vier Prüfungen benötigt eines dieser vier Ziele, auch transitiv. `e359f8bb` ist trotz des LK-Titels in der GK-*Rollenprojektion* Ziel. Der Backend-Plan berücksichtigt zusätzlich Kurs- und Personalisierungsregeln, siehe Frage 5. [Vertieftes Energieziel, Zeile 10551](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json#L10551)

Für die drei E.5-Prüfungen `1b432223`, `7e0308d8` und `8a1d4093` bleiben sämtliche transitiv erreichbaren Ziel-IDs gleich. Einschließlich der jeweiligen Prüfung zählen die Lernmengen 90, 114 und 146. Die letzte Prüfung benötigt weiterhin beide LK-Vertiefungen unmittelbar. [E.5-LK-Prüfung, Zeile 34484](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json#L34484) · [Prüfsummen je Prüfung, Rolle und Ansicht](structure.actual.json)

## 5. Bestehende Lerndaten und Oberflächen · Altpläne bestätigt, aktives Ziel korrigieren

Die nativen Proben haben echte E.2-Blöcke auf dem Elterncommit gespeichert. Sie enthielten in Hessen G9/Sek II jeweils 32 atomare IDs. Nach dem Wechsel blieben die alten Blöcke aktuell und ließen sich einschließlich der alten Bindung aus dem Backup wiederherstellen. Als nur das Gravitationsgesetz offen war, bot der Plan genau dieses Ziel an und startete die Bearbeitung. Auf dem Elterncommit blieb dabei E.2 der Fokus. Auf dem Kandidaten wurde wie vorgesehen der atomare Fokus gewählt. Dies gilt für GK und LK mit aus- und eingeschaltetem Einheitenpilot. [Regel für bestehende Pläne, Zeile 715](https://github.com/enpasos/skillpilot/blob/a88f17523b/AGENTS.md#L715) · [Native Vorher-Nachher-Ergebnisse](reviewer-b/coach.actual.json)

| Beobachtung | Elterncommit | Geprüfter Commit |
| --- | --- | --- |
| Neu gewählte Sek-II-E.2-Planmenge in GK / LK | 32 / 32 | 28 / 27 |
| E.2-Karte und direkte Cockpit-Zeilen in GK / LK | 30 / 31 | Je 10, sechs Kinder und vier Prüfungen |
| Über die E.2-Aktion wählbare Karten in GK / LK | 24 / 25 | 20 / 21. Die vier Karten sind bei E.5 wählbar. Die Verkehrskarte ist sowohl im E.2-Elternbereich als auch im Kind „Mehrere Kräfte zugleich“ wählbar. |
| Leerer E.2-Fokus oder aktives Verkehrsziel | Frontier bzw. Bearbeitung | Gleiches Verhalten. Für den leeren Fokus liefert der Coach weiterhin keine E.2-Eröffnung. Der Kartenkontext steht separat bereit. |
| Gewöhnlicher E.2-Fokus mit bereits aktivem, freigeschaltetem Gravitationsgesetz | Coach meldet `TEACHING / teachActiveGoal` | Coach meldet `FRONTIER / setActiveGoal`. Beim reinen Lesen bleibt die alte ID zunächst gespeichert. |
| Regulärer Zustandsabruf bei diesem aktiven Ziel | ID bleibt gespeichert, erneute Auswahl gelingt | Die DB-ID wird gelöscht. Die Auswahl im alten Fokus antwortet mit HTTP 409. Unter E.5 ist das Ziel weiterhin freigeschaltet. |

Die Kartenanzahlen bezeichnen die Auswahl über die tatsächlich ausgelieferten Decks vor der persönlichen Fälligkeitsprüfung. Beide Sprachen und alle acht Ansichten wurden gemessen. In den sechs Kindern lauten die GK-Kartenanzahlen 4, 2, 3, 2, 6, 5. Im LK sind es im sechsten Kind 6. Eine Karte kann zu mehreren Kindern gehören. [Cockpit-Sortierung, Zeile 600](https://github.com/enpasos/skillpilot/blob/a88f17523b/app/src/components/CompetenceTree.tsx#L600) · [Test der Verkehrskarte, Zeile 243](https://github.com/enpasos/skillpilot/blob/a88f17523b/app/scripts/testHessePhysicsFlashcardActions.ts#L243) · [Gemessene Karten-IDs und Ansichten](ui.actual.json)

Die Engstelle liegt im Zusammenspiel aus neuer Platzierung und bestehendem Zustandsabgleich. Das Backend prüft den gespeicherten Fokus gegen die heutigen Nachfahren, blendet dadurch das aktive Ziel beim Coach-Lesen aus und kann es beim regulären Abruf aus dem Datensatz entfernen. Beide Kursarten und beide Pilotstellungen zeigen den Unterschied, obwohl der persönliche Lernumfang und die Voraussetzungen des Ziels weiter passen. Die fachlichen Ergebnisse blieben im Versuch erhalten. In allen vier Konstellationen gelang die Wiederaufnahme vollständig im Chat. Das Navigationswerkzeug bot die Einführungsphase an. Nach dem Fokuswechsel dorthin stand das Gravitationsgesetz in der Frontier, und seine Auswahl führte wieder zu `TEACHING` mit dem Zielpfad unter E.5. Der Lernende muss diese zusätzlichen Schritte derzeit selbst anstoßen. Empfohlene Korrektur ist eine eng begrenzte Fortsetzung oder Wiederaufnahme des zuvor zulässigen aktiven Ziels nach einer Umgruppierung. Ein absichtlich geänderter persönlicher Lernumfang muss seine Wirkung behalten. Der Branchtest rekonstruiert den Altblock aus der **aktuellen** Auswahl und den benannten Gravitationszielen. Der echte alte Sek-II-Block enthielt zusätzlich „Masse und Gewichtskraft unterscheiden“ (`9c328f68`). Die datierte Vorgängermenge eignet sich als Regressionstest für diesen Fall. [Zustandsabgleich, Zeile 10133](https://github.com/enpasos/skillpilot/blob/a88f17523b/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#L10133) · [Rekonstruktion des Altplans, Zeile 1974](https://github.com/enpasos/skillpilot/blob/a88f17523b/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java#L1974)

## 6. Mathematik-Timing · Bedarfsregel und Pins bestätigt

Alle 1.036 Bedarfszeilen, sämtliche Zeugen und die Konfiguration außerhalb von `currentPhysicsSourcePins` sind identisch. Von 63 Pins ändern sich die sechs hessischen G8-, G9- und Sek-II-Pins. Für **beide** Commits stimmen alle 63 Pins jeweils mit den Rohbytes der zugehörigen Physikansicht überein. Die 33 Tests in `scripts/test_mathematics_stage_views.py` bestehen. Der Erwerbsort von sechs mathematischen Vorbereitungen innerhalb der Physik-LK-Ansichten ändert sich tatsächlich, siehe Frage 7. Für jede dieser sechs Vorbereitungen liegen die ihr zugeordneten Nachfrager innerhalb der hessischen E-Phase jetzt in E.5. [Pins, Zeile 29](https://github.com/enpasos/skillpilot/blob/a88f17523b/app/scripts/config/math-foreign-acquisition-demand.json#L29) · [Prüfung der Zeugen, Zeile 383](https://github.com/enpasos/skillpilot/blob/a88f17523b/scripts/test_mathematics_stage_views.py#L383) · [Eigener Policy- und Pfadvergleich](structure.actual.json)

## 7. Nachweis und Regeltext · Ortsaussage korrigieren

Der vom Autor genannte Basiscommit `ae04d42ef9` hat denselben vollständigen `curricula`-Baum wie der tatsächliche Elterncommit, Git-Objekt `f15d397b9b8d89fb0f1ee386761c350d9b363a06`. Die Prüfsummen und Zahlen der acht Autorzeilen stimmen für die *Zielrollen*. Die Regel in AGENTS.md beschreibt den fachlichen Zuschnitt, die späteren Prüfungen und die noch ausstehenden LK-Entscheidungen zutreffend. README und JSON behaupten weitergehend, alle Ziele hätten ihren Ort ausschließlich wie dort aufgezählt geändert. Die lokalisierten Vorbereitungen belegen zusätzliche Verschiebungen. [Nachweistext, Zeile 34](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/README.md#L34) · [Maschinenlesbare Aussage, Zeile 236](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/quality/learning-units/physics-he-e2-child-structures-2026-11-25/regrouping.actual.json#L236)

| Betroffene Ansichten | Explizite Erwerbsplätze und Ortswechsel |
| --- | --- |
| Alle vier LK-Ansichten | Sechs Mathematikvorbereitungen `075f1ef2`, `2ac2e902`, `ae5010cc`, `be0e8715`, `f242a3e8`, `fb7a4fa0` vom gemeinsamen Vorbereitungsbereich der E-Phase nach E.5 |
| Beide reinen Sek-II-Ansichten | „Kräfte und Trägheit qualitativ erklären“ (`5ea765ac`) von E.2 in Kind 1, „Mechanische Energieformen qualitativ unterscheiden“ (`722857cf`) von E.2 in Kind 5, „Masse und Gewichtskraft unterscheiden“ (`9c328f68`) von E.2 nach E.5 |
| Drei stufenübergreifende GK-Ansichten | Kein zusätzlicher Wechsel eines expliziten Erwerbsplatzes |

Das ergibt neun verschiedene Vorbereitungsziele und 30 Verschiebungen über die acht Dateien. Die Empfehlung lautet, den bisherigen Befund auf **fachliche E.2-Ziele** zu präzisieren und die erzeugte Platzierung der Voraussetzungen daneben zu dokumentieren. Für die sechs LK-Mathematikvorbereitungen gibt es im verbleibenden E.2 keinen fachlichen Bedarf. [Sek-II-LK-Ansicht, Zeile 1200](https://github.com/enpasos/skillpilot/blob/a88f17523b/curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-lk.view.json#L1200) · [ID-genaue Pfade und aktuelle Nachfrager](structure.actual.json)

## Gutachten und Prüfnachweise

Beide Gutachter erhielten unabhängig denselben Commitvergleich und dieselben sieben Fragen. A akzeptiert Schritt 1 mit Hinweisen zu Fokus und Karten. A macht die Grenze seiner Laufzeitbeurteilung ausdrücklich kenntlich. B fordert eine Korrektur. Ausschlaggebend für das Gesamturteil sind die gespeicherte Ziel-ID vor und nach dem Zustandsabruf und der Vergleich sämtlicher expliziter Erwerbspfade. Beide Ergebnisse sind reproduzierbar. [Unverändertes Gutachten A](reviewer-a.md) · [Unverändertes Gutachten B](reviewer-b.md) · [Native Laufzeitdaten](reviewer-b/coach.actual.json)

Die Generatorprüfungen für die Grundansichten und die Dauervarianten, 19 Hessen- und 33 Mathematiktests sowie die vollständige Kompositionsvalidierung bestanden. Die nativen JVM-Läufe umfassten 22 erfolgreiche Testinstanzen ohne übersprungene Fälle. Dabei sind auch die Vorher-Nachher-Proben enthalten, die den Verlust der aktiven Auswahl gemessen haben. [Generator](raw/generate.log) · [Dauervarianten](raw/duration.log) · [Hessen-Tests](raw/hessen.log) · [Mathematiktests](raw/math.log) · [Kompositionsvalidierung](raw/composition.log)

Der vollständige lokale Lauf des Jobs **Application frontend CI** bestand auf `a88f17523b` alle 54 Workflow-Positionen, darunter die Browserprüfungen für Lernkarte und Cockpit, den Produktionsbuild und 171/171 Demo-Tests ohne übersprungene Fälle. Alle fünf Bücher bestanden die Modell- und PDF-Prüfung. Vier Veröffentlichungen konnten nach Abgleich wiederverwendet werden. Das neue Physik-PDF umfasst 489 Seiten und hat SHA-256 `5fbdec646dd33fddbdcf2235a5a4edacc4710467b699af6f43649ef15d2d9152`. Ein erster lokaler Versuch war beim Chromium-Start zur PDF-Erzeugung an der Länge des temporären Pfads gescheitert. Der erfolgreiche Durchgang begann wieder bei Schritt 1. [Terminaler Frontendnachweis](raw/frontend-ci/summary.actual.json) · [Diagnose des ersten Versuchs](raw/frontend-ci-first-attempt/summary.actual.json)

Claude hat beide Korrekturempfehlungen am 25. November um 09:36 CET angenommen. Die Prüfung einer nachfolgenden Backendänderung steht in einer eigenen Runde. Dieser Bericht bezieht sich ausschließlich auf `a88f17523b`.
