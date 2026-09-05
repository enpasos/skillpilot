# Lernzielbuch und lokale Zeitplanung für Lehrkräfte

Status: am 5. September 2026 vom Product Owner zur Planung und Umsetzung
freigegeben; erste Ausbaustufe lokal implementiert. Einstieg:
**Lehrkräfte → Klasse → Planung → Plan bearbeiten**. Der getrennte
Produktions-Hotfix zur Gültigkeit bestehender Lernpläne hat Vorrang. Dieses
Vorhaben startet keinen neuen fachlichen Curriculum-QS-Lauf und ist nicht
automatisch ein Deployment.

Die fachlichen Grundbegriffe und die Trennung von Planung, Unterricht und
Mastery folgen dem bestehenden
[Zeitachsenkonzept](../didactic/curriculum-time-axis-and-pacing.md). Dessen
weitergehende mögliche Backend-Architektur wird hier nicht umgesetzt; für
Klassen gilt weiterhin die ausdrücklich gewählte lokale Ablage.

## Produktziel

Die Lehrkraft kann aus dem für ihren Kurs geltenden Lernzielbuch eine
überschaubare Unterrichtseinheit planen: passende Ziele verstehen und auswählen,
zeitlich einordnen und anschließend erkennen, welche Ziele noch ungeplant sind
und welche Voraussetzungen außerhalb oder nach der Einheit liegen.

Die erste Ausbaustufe verbindet die vorhandene Kursplanung mit dem Buch. Sie
führt weder ein zweites Planmodell noch eine neue zentrale Klassenverwaltung
ein. Bestehende Planabschnitte, lokale Revisionen, Datumsprüfungen und die
ausdrückliche Übernahme in persönliche Lernpläne werden wiederverwendet.

## Erste Ausbaustufe

1. Im bestehenden Kurskontext ein Lernziel anhand seiner Beschreibung und der
   Buchdarstellung auswählen. Die aktuelle autoritative Kursprojektion begrenzt
   die Auswahl; ein öffentlich sichtbares Buchziel ist nicht automatisch ein
   Ziel dieses Kurses. Fach, Bundesland, Stufe, Bildungsgang und Kursprofil
   werden nicht erneut geraten.
2. Die Auswahl in den vorhandenen Abschnittsentwurf übernehmen. Beginn, Ende
   und ein optionaler eigener Titel bleiben Entscheidungen der Lehrkraft.
   Erst Speichern verändert den lokalen Plan, erst die bestehende bestätigte
   Übernahme verändert den persönlichen Lernplan.
3. Eine kompakte Zeitachse zeigt die vorhandenen Lernabschnitte, Puffer und
   Meilensteine. Text-/Datumsbearbeitung bleibt zusätzlich verfügbar, sodass
   die Bedienung weder eine Maus noch Drag-and-drop voraussetzt.
4. Geplante und noch ungeplante Ziele aus der aktuellen Planungsbasis sowie
   konkrete Voraussetzungshinweise sichtbar machen. Hinweise unterscheiden
   ein Ziel außerhalb der Planung von einer unpassenden zeitlichen Reihenfolge.
   Daraus wird keine Behauptung über den individuellen Lernstand abgeleitet.
5. Von einem geplanten Ziel zur Buchbeschreibung und zu vorhandenen
   Originalquellen gelangen, ohne den lokalen Entwurf zu verlieren.

## Sicherheits- und Bedeutungsgrenzen

- Klassenbezeichnungen, Mitgliedschaften und Unterrichtsdokumentation bleiben
  ausschließlich in der bestehenden lokalen Ablage. Öffentliche Buchabrufe
  erhalten keine Klassen- oder Lernendenkennung.
- Ein Buch-/Curriculum-Update schreibt weder einen Plan noch dessen Termine
  um. Nicht mehr passende Ziele werden als Konflikt kenntlich gemacht.
- Geplant, im Unterricht behandelt und individuell beherrscht sind drei
  unterschiedliche Aussagen. Planung und Unterrichtsabdeckung setzen keine
  Mastery.
- Zielzahlen sind keine belastbare Unterrichtsdauer. Es werden keine scheinbar
  präzisen automatischen Stundenbudgets aus der Anzahl atomarer Ziele erzeugt.
- Eine noch fehlende Planauswertung wird als unbekannt angezeigt, nicht als
  Beleg dafür, dass alle Ziele ungeplant seien.
- Die erste Stufe enthält keine neue KI-Verbindung, keinen Kalenderdienst und
  keine externe Veröffentlichung. Ein späterer KI-Planvorschlag müsste seine
  Annahmen zu Zeit, Vorwissen, Übung und Puffer offenlegen und editierbar sein.
- Der OpenAI-Review-Freeze bleibt wirksam. Eine konkrete Implementierung erhält
  in Abschnitt 6.55 des Review-Freeze-Dokuments eine eigene eng begrenzte,
  geprüfte Hashfortschreibung;
  die Freigabe des Plan-Kompatibilitäts-Hotfixes ist dafür kein Ersatz.

Die Darstellung liegt in `CoursePlanLearningBook.tsx` und
`CoursePlanTimeline.tsx`; `CoursePlanPilotView.tsx` verbindet sie mit dem
bestehenden Entwurfsformular. `testTrainerCoursePlanUi.ts` prüft Auswahl,
Datenschutzgrenze, Entwurfsschutz, Tastaturfokus, Zeitproportionen und schmale
Displays. Das veröffentlichte BookModel und die PDF-Artefakte bleiben getrennt
und unverändert.

## Abnahme

- Eine kleine reale Mathematik- oder Physik-Einheit lässt sich im bestehenden
  Kurs anlegen, aus dem Buch ergänzen, zeitlich bearbeiten und wieder öffnen.
- Außerhalb der Kursprojektion liegende Ziele können nicht übernommen werden.
- Wechsel, Abbruch und Rücknavigation verlieren keinen gespeicherten Plan und
  keine unbestätigten Eingaben ohne Warnung.
- Zeitachse, Datumsformular und Zielauswahl funktionieren auf schmalen Displays
  und mit Tastatur; die laufende Planübernahme bleibt getrennt und explizit.
- Fokussierte Modell-/UI-Regressionen, TypeScript, Build und Freeze-Prüfungen
  sind grün. Lokale Prüfung wird nicht als Deployment ausgegeben.

Nach dieser ersten Stufe sollten zwei bis drei Lehrkräfte eine anstehende
Einheit damit planen. Maßstab sind weniger Such- und Planungsaufwand sowie
früher erkannte Lücken, nicht die Zahl ausgefüllter Planfelder.
