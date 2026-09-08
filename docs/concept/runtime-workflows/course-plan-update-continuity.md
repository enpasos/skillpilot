# Verlässliche Kurspläne bei Curriculum-Updates

Stand: 8. September 2026. Vom Product Owner angefordertes UX- und
Umsetzungskonzept; die weitergehenden Produktänderungen sind noch nicht
implementiert. Mit Planersteller ist hier die Lehrkraft beziehungsweise die
betreuende Person gemeint, die Lernabschnitte und Termine festlegt.

## Ziel

Wer „Sek II Physik bis Ende September“ plant, soll diesen Plan nach einer
redaktionellen oder fachlich gleichwertigen Überarbeitung einzelner Lernziele
weiter verwenden können. Dass SkillPilot seine interne Zielstruktur verändert,
ist zunächst eine Aufgabe der Plattform. Die Lehrkraft muss nur entscheiden,
wenn sich ihr gewählter Kompetenzumfang, ein Termin oder eine didaktisch
relevante Voraussetzung tatsächlich ändert.

Ein Warnhinweis beim nächsten Öffnen reicht dafür nicht aus. Der wichtigste
Schutz liegt vor dem Curriculum-Update: Ein reguläres Update darf einen
weiterhin inhaltlich gültigen, laufenden Plan nicht unangekündigt unbrauchbar
machen. Weder Schüler noch Lehrkraft sollen einen unveränderten Plan durch
erneutes Speichern oder Übernehmen technisch reparieren müssen.

## Aktueller Befund und Grenze der heutigen Korrektur

- Der lokale Lehrkraftplan enthält Abschnittsbezüge und Termine sowie eine
  historische fachweite Liste der damals offenen und gemeisterten Atomziele.
  Bisher invalidierte ein daraus inzwischen entfallenes Atom sämtliche
  Abschnitte. Die aktuelle lokale Korrektur beseitigt diese pauschale Sperre;
  gültige Abschnitte werden wieder berechnet und gespeichert.
- Der übernommene Schülerplan ist eine unabhängige Kopie mit konkreten
  Atom-IDs. Seine Prüfung ignoriert bereits bloße Änderungen des fachweiten
  Fingerprints. Entfallene übernommene Atome oder eine nicht mehr passende
  Voraussetzungssortierung können aber weiterhin den gesamten Fachplan
  sperren. Der heutige Fix löst diese weitergehenden Übergänge noch nicht.
- Neue Atom-IDs werden im heutigen Modell nicht automatisch Teil der
  übernommenen Planung. Ein in zwei neue IDs aufgeteiltes Ziel benötigt daher
  noch eine fachlich geprüfte Übergangsregel. Textähnlichkeit genügt nicht.
- Die Fachübersicht vermischt teilweise den Zustand des lokalen Entwurfs mit
  dem tatsächlich wirksamen Schülerplan. Allgemeine Meldungen nennen weder
  den Abschnitt noch den Grund oder eine passende Handlung.
- Das Backend verdichtet verschiedene Konflikte zu `stale`; der ausgegebene
  Grund `personal-curriculum-changed` und der Schülertext behaupten dabei eine
  Personalisierungsänderung, die nicht für jeden Konflikt nachgewiesen ist.
- Klassen, Lehrkraftentwürfe und Zuordnungen liegen lokal. Es gibt keinen
  zentralen Lehrkraftkontakt, über den automatisch eine verlässliche Nachricht
  vor dem nächsten Schülerzugriff zugestellt werden könnte.

## Der einfache Ablauf für den Planersteller

1. **Beim Planen:** Kompetenzbereich und Zeitraum festlegen. „Für Schüler
   aktivieren“ zeigt wie bisher die konkrete Vorschau und übernimmt erst nach
   Bestätigung. Daneben steht verständlich: „Inhaltlich gleichwertige
   Lernzielkorrekturen hält SkillPilot kompatibel. Änderungen an Umfang oder
   Terminen übernimmst du selbst.“ Diese Zusage wird erst mit den dazugehörigen
   technischen Garantien eingeführt.
2. **Nach einem kompatiblen Update:** Der Plan läuft weiter. Kein roter Status,
   kein Dialog und kein erneutes Übernehmen. In einem aufklappbaren Verlauf
   kann stehen: „Lernzielbeschreibungen aktualisiert. Dein Plan gilt weiter.“
3. **Bei einer vorgeschlagenen fachlichen Änderung:** Der bisherige gültige
   Plan bleibt wirksam. Die Kursübersicht zeigt zum Beispiel „Physik läuft ·
   Änderungsvorschlag für 1 Abschnitt“. Der Vorschlag beschreibt die tatsächliche
   Kompetenzänderung und ihre Auswirkung auf die Aufgabenverteilung.
4. **Beim Öffnen des Hinweises:** Direkt beim betroffenen Abschnitt landen;
   Fach, Arbeitsbereich und Tastaturfokus stimmen. Die Lehrkraft sieht
   „Was hat sich geändert?“, „Was bedeutet das für meine Schüler?“ und eine
   konkrete Empfehlung. Sie muss den Abschnitt nicht selbst rekonstruieren.
5. **Bei einer notwendigen Entscheidung:** Beispielsweise „Bisherigen Umfang
   beibehalten“ oder „Zusätzliches Thema aufnehmen“. Eine Vorschau zeigt
   betroffene Termine, offene Aufgaben und Voraussetzungen. Nur diese gewählte
   Änderung benötigt eine bestätigte Übernahme. Abbrechen lässt die bisherige
   gültige Planung bestehen.

Die Fachkarte beantwortet zuerst **„Was gilt beim Schüler?“**. Ein eigener,
nachgeordneter Hinweis **„Dein Entwurf“** zeigt ungespeicherte oder noch nicht
übernommene Änderungen. Ein kaputter lokaler Entwurf darf einen weiterhin
gültigen Schülerplan nicht als kaputt bezeichnen.

## Wenige Zustände mit konkreter Bedeutung

| Situation | Anzeige für den Ersteller | Verhalten |
| --- | --- | --- |
| Aktiver Plan weiterhin gültig | „Läuft beim Schüler“ | Lernen läuft; keine Handlung nötig. |
| Eigene lokale Änderung | „Läuft beim Schüler · Entwurf geändert“ | Bisheriger Plan gilt bis zur bestätigten Übernahme. |
| Fachlich relevante, noch freiwillige Erweiterung | „Läuft weiter · Änderungsvorschlag“ | Vorschlag und Auswirkungen ansehen; kein Pflichtdialog. |
| Tatsächlicher Konflikt | „Entscheidung nötig: Abschnitt …“ | Exakten Grund, betroffene Aufgaben und mögliche Lösung anzeigen. |
| Prüfung technisch nicht möglich | „Status derzeit nicht abrufbar · zuletzt geprüft …“ | Erneut laden; kein Auftrag, Ziele oder Termine zu bearbeiten. |
| Planmodus bewusst ausgeschaltet | „Planlernen pausiert“ | Als bewussten Zustand erklären, nicht als Fehler. |

Rot ist einem nachgewiesenen Ausführungsproblem vorbehalten. Ein bloßer
Versionswechsel, eine Änderung der Atomanzahl oder eine fehlgeschlagene Anfrage
beweisen keinen fachlichen Konflikt. Ein früherer gültiger Status darf mit Datum
sichtbar bleiben, aber ohne frische Prüfung nicht als aktuell bestätigt gelten.

Beispiel einer brauchbaren Konflikterklärung:

> Abschnitt „Elektrische Felder“, 14.–25. September: Im persönlichen Curriculum
> wurde Physik von LK auf GK geändert. Zwei eingeplante Vertiefungsziele gehören
> nicht mehr zur Auswahl. Die übrigen Fächer bleiben nutzbar.

„Abschnitt prüfen“ öffnet genau diesen Abschnitt mit den zwei betroffenen
Zielen. Dieser Text darf nur erscheinen, wenn der konkrete Profilwechsel
belegt ist. Bei einer Curriculumänderung oder fehlenden Diagnose muss die
Erklärung entsprechend anders lauten.

## Was die Plattform bei Updates leisten muss

**Planungsentscheidung und abgeleitete Ausführung trennen.** Dauerhaft sind
der ausgewählte Kompetenzbereich, seine Geltung und die gesetzten Termine.
Die für Aufgaben und Tagesfortschritt daraus erzeugten Atomlisten sind eine
versionierte Ableitung. Die historische Unterrichts- und Offen-Baseline bleibt
separat erhalten. Eine Neuberechnung darf weder alte Unterrichtsnachweise
umschreiben noch neue Mastery behaupten.

Für fachliche Updates gelten folgende Regeln:

| Änderung | Vorgesehener Umgang |
| --- | --- |
| Beschreibung, Schreibweise oder Darstellung bei gleichem Ziel | Ohne Planaktion kompatibel halten. |
| Änderung außerhalb des tatsächlich geplanten Umfangs | Keine Auswirkung auf diesen Plan. |
| Umbenennung oder interne Neuordnung eines weiterhin gleichen Bereichs | Stabile Referenz beziehungsweise explizit geprüfte Referenznachfolge verwenden; keine Zuordnung über Titelähnlichkeit. |
| Fachlich gleichwertige Aufteilung eines Atoms | Geprüfte Zuordnung von Altziel zu Nachfolgezielen und ein funktionsfähiger Ausführungsübergang sind Voraussetzung für das Update. Keine erneute Lehrkraftentscheidung allein wegen neuer IDs. |
| Neues Kompetenzziel oder fachliche Erweiterung im gleichen Cluster | Nicht automatisch verbindlich machen. Als Änderungsvorschlag behandeln; der bislang zugesagte Umfang bleibt nutzbar. |
| Neue Voraussetzung | Zuerst prüfen, ob eine zulässige Reihenfolge innerhalb des bestehenden Plans möglich ist. Nur eine tatsächliche Änderung von Umfang oder Terminen der Lehrkraft vorlegen. |
| Änderung des persönlichen Fach-/Kursumfangs | Separat als Änderung der Lernendenauswahl erklären und gezielt abgleichen. |

Eine Atomaufteilung darf den scheinbaren Arbeitsrückstand nicht allein durch
höhere Knotenzahl vervielfachen. Der Übergang muss Aufgabenverteilung,
Nachweisbedeutung und Fortschrittsdarstellung zusammen behandeln. Eine alte
Mastery von 100 Prozent ist insbesondere kein automatischer Beweis für jedes
neue Nachfolgeziel. Solange diese Semantik für einen Übergang nicht geprüft ist,
bleibt der bisher ausführbare Inhalt verfügbar oder das brechende Update wird
zurückgehalten. Es reicht nicht, alte IDs als leere Aliasnamen vorzuhalten.

**Vor der Veröffentlichung prüfen.** Ein eigenes Gate vergleicht alte und neue
Curriculumdaten, erkennt entfernte Plananker, Atomaufteilungen und relevante
Voraussetzungsänderungen und verlangt vollständige Übergangsregeln. Gespeicherte
repräsentative Pläne einschließlich älterer lokaler Dateiformate werden gegen
die neue Version geöffnet, berechnet und im Browser durchgespielt. Für bereits
serverseitig vorhandene persönliche Pläne ist ergänzend eine interne lesende
Auswirkungsprüfung vorzusehen. Sie benötigt keine neue zentrale Klassenablage
und gibt keine Lernendenkennungen oder Planinhalte in öffentliche Berichte aus.

Ein ungeklärter Bruch stoppt das Update vor seiner Wirksamkeit. Reine lokale
Entwürfe können dabei nicht vollständig aufgezählt werden; deshalb muss der
Updatevertrag für erhaltene Plananker und geprüfte Nachfolger allgemein gelten.
Die Prüfung darf sich nicht auf die zufällig bekannten Testpläne beschränken.

**Auch nach dem Update prüfen.** Ein Smoke-Test kontrolliert tatsächliche
Ausführung und konsistente Curriculum-/Frontend-Versionen. Erfasst werden
Fehlerkategorie und betroffene Version, keine neue Lehrkraft-Schüler-Beziehung.
Bei einem Plattformfehler liegt die Behebung bei SkillPilot. Eine unvermeidbare
Sperre fachlich falscher Inhalte muss als Ausnahme mit Grund und Handlungspfad
behandelt werden; es wird kein pauschales Weiterlernen mit ungeprüft alten
Inhalten versprochen.

## Was Schüler sehen und wie Ersteller davon erfahren

Im Normalfall bemerkt der Schüler nichts vom Update und kann wie gewohnt
„Heute lernen“ verwenden. Bei einem echten Teilkonflikt sollen unabhängige,
geprüft ausführbare Fächer weiterlaufen. Abhängige Aufgaben dürfen nicht allein
zum Verbergen des Problems freigegeben werden. Der Status darf dann auch nicht
behaupten, sämtliche Tagesanforderungen seien erledigt.

Die Ausnahme erklärt konkret beispielsweise: „Physik wird gerade geprüft.
Mit Mathematik kannst du heute weiterlernen.“ Ein technischer Abruffehler
bekommt einen Wiederholungsweg. Der Schüler wird nicht pauschal zum Boten für
einen angeblichen Planungsfehler der Lehrkraft gemacht.

In der Kursübersicht werden bei vorhandenem Zugriff die Zustände der wirksamen
Schülerpläne geprüft, bevor die Lehrkraft jeden Fachplan einzeln öffnet.
Aktualisierungen erfolgen beim Einstieg, bei Rückkehr in die App und nach
erkannter Curriculumänderung. Ein Hinweis führt direkt zum betroffenen
Abschnitt; kompatible Aktualisierungen bleiben im unaufdringlichen Verlauf.

Bei geschlossenem Browser kann das heutige lokale Klassenmodell keine
garantierte Vorabnachricht an die Lehrkraft liefern. Deshalb hängt die
Verlässlichkeit von Updateverträglichkeit und Veröffentlichungsgates ab, nicht
von einer ungelesenen Warnung. E-Mail, Push oder eine zentrale Zuordnung wären
ein separates, ausdrücklich gewähltes Produktvorhaben mit eigener
Kontakt-/Datenschutzentscheidung; sie sind für diese erste Ausbaustufe nicht
vorgesehen.

## Umsetzung in vier überprüfbaren Schritten

1. **Diagnose als gemeinsamen Vertrag einführen.** Statt nur `stale` ein
   strukturiertes Prüfergebnis mit Ursache, betroffenem Fach/Abschnitt,
   tatsächlicher Auswirkung, letztem Prüfzeitpunkt und möglicher Aktion
   definieren. Aktiver Schülerplan, lokaler Entwurf, bewusste Pause und
   technischer Lesezustand bleiben unterscheidbar. Lehreransicht, Vorschau und
   Schüleranzeige müssen dieselbe fachliche Diagnose verwenden.
2. **Den sichtbaren Ablauf umsetzen.** Fachkarten und Kursübersicht erhalten
   die obigen Zustände. Ein Hinweis öffnet den richtigen Abschnitt mit Fokus
   und einer konkreten Gegenüberstellung. Vorab an drei Szenarien mit dem
   Product Owner durchgehen: reines Textupdate, gleichwertige Atomaufteilung,
   wirklicher Kursprofilwechsel. Erst danach die weitergehende UX implementieren.
3. **Geprüfte Übergänge und Updategate aufbauen.** Alte Planreferenzen,
   Kompetenzgleichwertigkeit und Nachfolger nachvollziehbar binden;
   Ausführungsprojektion und Fortschritt für Umbenennung, Aufteilung und
   Voraussetzungskorrektur prüfen. Bestehende Planrevisionen und Nachweise
   bleiben auditierbar. Alte und neue Planformate werden gemeinsam unterstützt.
4. **Im vollständigen Ablauf abnehmen und kontrolliert ausrollen.** Einen
   bestehenden Mathematik-/Physikplan aktivieren, Curriculum aktualisieren und
   zuerst aus Schülersicht weiterlernen. Danach den Ersteller öffnen lassen.
   Der kompatible Fall darf keinen Reparaturschritt erfordern. Ein echter
   Konflikt muss zuvor erkannt und gezielt lösbar sein. Frontend-/Backend-
   Regressionen, Updategate und Smoke-Test werden zusammen verbindlich.

Die Schritte 1 und 2 verbessern Erklärung und Bedienung; erst Schritt 3
schließt die verbleibende Ursache der überraschenden Updatebrüche. Deshalb
darf eine reine Text-/Badge-Korrektur nicht als Abschluss dieses Vorhabens gelten.

Abnahmekriterien sind: kein unnötiges Neuübernehmen bei Textupdates oder
geprüft gleichwertigen Übergängen; keine stillschweigende fachliche Erweiterung;
kein erfundener Mastery-Transfer; kein generischer Änderungsgrund ohne Beleg;
kein Bruch erst im Schülerbetrieb bei einem regulären Update; unveränderte
Entwürfe und Termine beim Lesen; erfolgreiche Bearbeitung und Fachwechsel auch
bei langsamen Antworten, Fehlern und älteren gespeicherten Plänen.

## Anschluss an die aktuelle Implementierung

- [Lokale Planung](../../../app/src/utils/localTeacherCoursePlan.ts),
  [Planeditor](../../../app/src/components/CoursePlanPilotView.tsx) und
  [Fachnavigation](../../../app/src/views/TrainerView.tsx).
- [Fachstatus und Entwurfsvergleich](../../../app/src/utils/teacherLearningPlanActivation.ts)
  sowie [gemeinsame Fachübersicht](../../../app/src/components/TrainerLearningPlanActivation.tsx).
- [Backend-Kompatibilität](../../../backend/src/main/java/com/skillpilot/backend/service/LearnerService.java),
  [Planberechnung](../../../backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java)
  und [Schülertexte](../../../app/src/utils/learnerLearningPlanCopy.ts).
- [Bestehende lokale Ablage und Übernahmegrenzen](existing-learner-teacher-view.md),
  [Lernzielbuch und Zeitplanung](../skill-graph/teacher-goal-book-time-planning.md)
  und [Review-Freeze, Abschnitte 6.54 und 6.65](../../deploy/openai-plugin-v1-review-freeze.md).

Dieses Konzept ändert diese Laufzeitverträge noch nicht. Insbesondere sind
automatische fachlich geprüfte Ausführungsübergänge und neue Diagnosedaten
künftige Arbeit. Ihre konkrete Umsetzung muss im bestehenden Reviewverfahren
einen benannten Wirkungsumfang erhalten; aus der Konzeptplanung folgt kein
Deployment und keine Änderung des eingereichten OpenAI-Coach-Vertrags.
