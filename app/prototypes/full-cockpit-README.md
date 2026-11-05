# Vollständiges Cockpit mit zusätzlicher Lernkarte

Aktuelle Richtung vom 4. November 2026: Das vorhandene Cockpit bleibt die Basis. Ausschließlich die Navigation erhält neben dem Baum eine zoombare Lernkarte. Die frühere Aufteilung in drei neue Gesamtansichten wird nicht übernommen.

Aus `app/` starten:

```bash
./node_modules/.bin/vite --config prototypes/vite.config.ts
```

Öffnen: <http://localhost:5173/prototypes/full-cockpit.html>. Links unter „Meine Lernziele“ zwischen **Baum** und **Lernkarte** wechseln. Alle bisherigen Inhalte bleiben rechts im Original-Cockpit. Die Karte nutzt am Desktop eine breitere Seitenleiste; beim Zurückwechseln kehrt die bisherige Baumbreite zurück. Doppelklick öffnet eine Gruppe, Shift + Doppelklick führt wieder heraus.

Ein Kartenklick verwendet dieselbe Zielauswahl wie der Baum. Er verändert weder das aktive Lernziel noch Mastery oder Lernfokus. Die gewohnte Zielkarte rechts enthält weiterhin Bild, Mathematik, Aufgabe und Details. Ein zusätzlicher Karten-Detailkasten würde dieselbe Information verdoppeln und bleibt deshalb ausgeblendet.

## Vorhandene Funktionen

Es gibt genau eine `LearnerView`. Hauptinhalt, Controller und Dialoge entsprechen dem vorhandenen Produkt. Keine zweite Implementierung von Planung, Prüfungen, Einstellungen oder SRS.

| Element | Zugang im vollständigen Cockpit |
| --- | --- |
| Umfang, aktives Ziel zeigen, Lernhistorie | Unveränderte Icons oben links. |
| Navigation und Fokus setzen | Originalbaum; alternative Lernkarte zur Navigation. Fokusaktionen bleiben im Baum erreichbar. |
| Zielbeschreibung, Mathematik, Lernzielbild und Quelle | Original-Zielkarte rechts. |
| Prüfung, Lösung nach Bestehen, Direktprüfung | Original-Zielkarte und Prüfungsübersicht; Testprofil „Prüfung“ bzw. „Abgeschlossen“. |
| Laufender Prüfungsweg, Auswahl und Wechsel | Original-Prüfungsübersicht. |
| Kartenübung, Kartenstatus und verifizierter Recall | Originalablauf; Testprofil „Lernkarten“. Übung erzeugt keinen verifizierten Prüfungserfolg. |
| Fachpläne, Tachos, Gesamtumfang, Termine und Reserve | Unveränderter Lernstand-/Planbereich rechts. |
| Fachwechsel | „Wechseln“ im Original-Fachplan. |
| Persönlicher Lehrplan und Lernpräferenzen | Gewohntes Zahnrad oben links. |
| Optionale Materialien | Materialauswahl im Einstellungsdialog; zusätzliche Links an der Zielkarte. |
| Fehler melden | Originaler zielgebundener Feedbackzugang; eine externe Veröffentlichungsbindung gehört nicht zu den lokalen Testdaten. |
| Datensicherung, Import, Aufbewahrung, Löschung | „Daten & SkillPilot-ID“ unten links. |
| Coachauswahl und Einrichtung | „Lernen starten“, danach Original-`SessionSetup`; Rückkehr über „Zum Cockpit“. |
| Abmelden | Gewohntes Exit-Icon unten links. |

Die Karte ersetzt vorerst weder sämtliche Fokusbedienelemente des Baums noch einen freigegebenen neuen Lerneinheitsgraphen. Beide Navigationsformen bleiben direkt erreichbar. Diese Vorschau injiziert ihren lokalen Adapter über die optionalen Kartenprops. Die native Produktanbindung in PR #81 verwendet einen eigenen Adapter mit den tatsächlichen Cockpitdaten; der normale Produktstart bleibt beim Baum. Die Test-API dieser Vorschau wird dort nicht verwendet.

## Lokale Testgrenze

`fullCockpitApi.ts` stellt eine ausschließlich im Arbeitsspeicher laufende Test-API bereit. Unbekannte API-Aufrufe werden abgewiesen; sie werden nicht an einen echten Server weitergereicht. Auch Browser-Storage bleibt in dieser Vorschau im Arbeitsspeicher. Die fiktive ID `fixture-full-cockpit-local` ist kein Produktionskonto. Ein Neuladen setzt die Testdaten zurück.

Die vier Testprofile zeigen ein gewöhnliches Ziel, eine Prüfung, Lernkarten und einen abgeschlossenen Beispielausschnitt. Das letzte Profil enthält ausschließlich gespeichertes M={Q} und abgeleitetes I={A}. Der Zweiziel-Planumfang A/Q ist getrennt vom breiteren fiktiven Mathematik-Fachumfang mit 55 sichtbaren Quellatomen; dessen Nenner bleibt in Baum, Karte und Fachgesamtstand konsistent. Periodenarbeit zählt im Abschlussbeispiel nur ein explizites Ereignis. Diese UI-Testkonfiguration ist keine neue fachliche Freigabe oder echte Personalisierung der 55 Ziele. Physik enthält ein ausdrücklich fiktives zweites Fachbeispiel.

Originalaufgabe, Bild und Kartentexte stammen unverändert aus dem gebundenen lokalen Snapshot. Materialauswahl verwendet zusätzlich gekennzeichnete fiktive UI-Verweise. Externe Navigation und Coachstarts verlassen die Vorschau nicht. Lokaler Import/Export dient der Bedienprüfung, nicht der Erzeugung eines produktionsgültigen signierten Backups. Ein lokal testbarer Knopf ist kein Nachweis für Produktionsspeicherung, echte Bewertung, verifizierten Recall oder eine Coachverbindung.

## Prüfung

```bash
./node_modules/.bin/tsx scripts/testFullCockpitPrototype.ts
./node_modules/.bin/tsx scripts/testLearnerViewMobilePlanChromeUi.ts
./node_modules/.bin/tsx scripts/testLearningUnitMapPrototype.ts
./node_modules/.bin/tsc --project prototypes/tsconfig.json
```

Die neue Browserprüfung kontrolliert insbesondere dieselbe Auswahl in Baum und Karte bei unverändert aktivem Ziel, den erhaltenen Originalhauptinhalt und SRS-Zustand, wiederhergestellte Baumbreite, Originaldialoge sowie abgeschottete lokale Requests und mobile Bedienung.
