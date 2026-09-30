# Issue #54: Ausbau optionaler Content-Pakete

Stand: 30. September 2026. [Issue #54](https://github.com/enpasos/skillpilot/issues/54) verlangt konkrete, kostenlos für den vorgesehenen Lernzweck erreichbare Materialien, präzise Zielzuordnung und getrennte Nachweise für lokale Prüfung, CI und Produktion. Der priorisierte LEIFI-Gleichstromlink wurde nach einem geschlossenen Touch-Stromkreis lokal aktiviert; CI- und Produktionsnachweise fehlen weiterhin.

## Umgesetzter Umfang

Der Katalog enthält die `1.1.0`-Nachfolger für Mathematik, PhET-Physik, LabXchange und oPhysics sowie Physik Libre. Die `1.0.0`-Piloten dieser Pakete bleiben unverändert. Die Nachfolger enthalten direkte Einzelaktivitäten: Mathe mit GeoGebra, Desmos und PhET; Physik mit regulären PhET-Simulationen; LabXchange mit fünf englischen OpenStax-Artikeln (Anbieterzielgruppe 13+); oPhysics mit acht englischen Aktivitäten von Tom Walsh. Fachlicher Nutzen, Modellgrenzen, Sprachen, Anbieter und begründet ausgeschiedene Kandidaten stehen in den jeweiligen Paket-READMEs. Für eigenes SkillPilot-Mapping ist enpasos Kurator; die verlinkten Dienste und Urheber bleiben getrennt ausgewiesen. Alle aktiven Materialien verwenden `public-link` und `link-only`.

Das zuvor unveröffentlichte [LEIFIphysik-Paket](https://github.com/enpasos/skillpilot/blob/main/content/enpasos-leifiphysik/1.0.0/README.md) ist jetzt mit **zwei** aktiven Materialien katalogisiert: der Zentripetalkraft-Simulation und der priorisierten Gleichstromseite mit LEIFI-Arbeitsaufträgen. Deren PhET-Einbettung wird nicht als zusätzliche Simulation gezählt. Diese Auswahl ist optional; fehlende Auswahl oder ein Ausfall ändert weder Mastery noch Voraussetzungen oder Lernplan.

## LEIFI-Browserbeleg und Grenze

Beide konkreten Direkt-URLs wurden am 30. September in frischen anonymen Playwright-Chromium-Kontexten geprüft. `390 × 844` war ein emulierter Touch-Viewport, kein physisches Smartphone:

| Test | Gleichstrom mit PhET | Zentripetalkraft |
| --- | --- | --- |
| Regulärer Desktop-UA, 1365 × 900, wiederholt | HTTP 403, Cloudflare-Sicherheitsprüfung | HTTP 403, Cloudflare-Sicherheitsprüfung |
| Mobiler UA, 390 × 844, Touch | HTTP 200; Aufgaben und PhET-Iframe mit Intro/Labor und Komponenten geladen | HTTP 200; Aufgaben, Canvas, Startknopf und drei Regler geladen |
| Touch-Ereignisse im emulierten Viewport | Direkter Touch startete PhET-Intro; Touch-Drags verbanden Batterie und Lampe über zwei Drähte. PhET-Accessibility meldete `Current is flowing in 1 of 1 groups` und `Light Bulb 1 of 1,brightness 21%`. | Start änderte Canvas-Bild; Masse-Regler änderte sichtbaren Wert von 1,1 auf 1,8 kg und Canvas-Bild erneut |
| Mobiler UA bei Desktop-Breite | HTTP 200, Seite geladen | HTTP 200, Seite geladen |

Der mobile Test belegt einen geschlossenen Stromkreis mit Stromfluss und sichtbarer Lampenreaktion. Die LEIFI-Aufträge waren ohne Konto lesbar, wurden jedoch nicht vollständig bearbeitet. Der normale Desktop-Zugang ist aus dieser Prüfungsumgebung weiterhin nicht bestätigt. Die wiederholten 403-Antworten sind eine umgebungsabhängige Zugangsgrenze, kein Beleg für allgemeine Unverfügbarkeit. Physische Smartphone-Bedienung und umfassende Barrierefreiheit wurden nicht geprüft.

## Lokale Prüfungen

- `node scripts/validate_content_packages.mjs`: erfolgreich; nach LEIFI-Katalogisierung **6 Pakete** mit insgesamt 252 deklarierten Materialien, beide LEIFI-Materialien aktiv.
- `node --test scripts/validate_content_packages.test.mjs`: 17/17 erfolgreich. Der Test prüft aktuelle Ziel-IDs, Kurator/Anbieter, Status beider LEIFI-Materialien und die kombinierte Grenze von vier aktiven Links je Ziel.
- `npm --prefix app run test:content-materials`: erfolgreich; API- und UI-Prüfungen für die optionale Materialanzeige.
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.content.ContentCatalogTest' --tests 'com.skillpilot.backend.content.ContentMaterialResolverTest' --tests 'com.skillpilot.backend.content.ContentSelectionIntegrationTest' --tests 'com.skillpilot.backend.content.ContentSelectionControllerHttpTest'`: erfolgreich. Der Resolver-Test prüft den LEIFI-Katalogeintrag mit `materialCount=2` und die fünf aktiven Zuordnungen.

Alle fünf LEIFI-Ziel-IDs sind im aktuellen kanonischen Inventar vorhanden und als `curricularAtomic` eingestuft. Die kombinierte Zahl aktiver Materiallinks überschreitet an keinem Ziel vier; bei `01bebdfc-5819-4610-a03e-ea5e794fc954` sind es mit LEIFI genau vier. Die Testläufe belegen den lokalen Arbeitsbaum; sie ersetzen weder CI noch Produktzugang.

## CI und Produktion

Der bisherige Ausbau-Commit `8ef49014fc627a3ef55995c9408cf3318f0b89e2` liegt auf `origin/main`. Eine read-only GitHub-Abfrage zeigte für diesen Commit keine Check-Runs, Actions-Runs oder Commit-Statusmeldungen; ein CI-Erfolg für diesen Stand wurde daher nicht verifiziert. Die hier dokumentierte LEIFI-Änderung ist lokal und hat ebenfalls keinen CI-Nachweis.

`https://skillpilot.com/` antwortete mit HTTP 200. Das belegt nur die Erreichbarkeit der Startseite. Der Materialkatalog ist lernendenbezogen; der versuchte Pfad `/api/ui/content/catalog` antwortete 404 und ist kein gültiger Produktionsnachweis. Ob die neuen Pakete in Produktion angeboten werden, ist nicht bestätigt. Es erfolgten weder Deployment noch GitHub-Schreibaktionen. Issue #54 war bei der read-only Prüfung offen.

## Offene Abnahme

1. Den regulären Desktop-Zugang aus einer anderen Umgebung prüfen; den 390 × 844-Touch-Test bei Bedarf auf einem physischen Smartphone ergänzen.
2. Für den geänderten Arbeitsbaum CI mit terminalen Ergebnissen prüfen und danach die tatsächliche Produktionsauswahl in einer autorisierten Lernendensitzung bestätigen.
3. Issue #54 erst nach diesen getrennten Belegen als vollständig abgeschlossen bewerten.
