# Mathematik M7: Wiederaufnahme am 20. September 2026

## Auftrag und Maßstab

Mathematik wird nach dem erreichten Physik-M7-Stand bis zur vollständigen
maschinellen Curriculum-QS fortgeführt. Der Nenner stammt immer aus den
aktuellen `curricularAtomic`-Zielen. Ein Abschluss erfordert die aktuelle
Schnittmenge D/P/A/M/V und die bestandenen abhängigen Prüfungen. Menschliche
QS ist ein getrenntes Verfahren; `ai_candidate` wird nicht als menschliche
Freigabe ausgegeben. Physik M7 und die geschützten Reifegraduntergrenzen
bleiben erhalten.

Neue oder korrigierte Lernzielbilder bleiben PNGs im freundlichen, abstrakten,
klaren Comic-Stil. Fachlich und visuell gute vorhandene Bilder bleiben
unabhängig vom Generator unverändert. Bildgenerierung allein ist keine
Freigabe; tatsächlich betrachtete Ausgabe, Herkunft und Prüfentscheidung
werden getrennt dokumentiert.

## Effizienter Mehrpass-Durchgang

1. Größere zusammenhängende Kandidatenpakete bearbeiten: konkrete Text-,
   Kontext-, Evidenz- und Bildlücken gemeinsam schließen. Kein kosmetischer
   Umbau guter Ziele und kein Neustart historischer gültiger Reviews.
2. Den stabilen Paketstand gezielt kontrollieren: zwei unabhängige
   Beschreibungsreviews, fachlich überprüfte positive Evidenz und tatsächliche
   Bildsichtprüfung. Bei Änderungen ausschließlich betroffene Bindungen
   aktualisieren; eine Hashänderung ist keine fachliche Prüfung.
3. Verifizierte Teilmengen integrieren; einzelne Splits, Dissenzen oder
   Bildkorrekturen getrennt offen halten. Neue fachliche Abschlüsse und
   wiederhergestellte gültige Bindungen getrennt berichten.
4. Zentrale QS, Reifegradstatus und aufwendige Builds an stabilen
   Integrationsständen bündeln, nicht nach jedem einzelnen Ziel wiederholen.
   Der abschließende vollständige Lauf bleibt Pflicht.

Zuständigkeiten stehen ausschließlich im
`curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json`;
akzeptierte Nachweise in der bestehenden zentralen
`quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`.
Dieses Dokument ist kein zweiter maschinenlesbarer Fortschrittszähler.

## Verifizierte Ausgangslage vor diesem Durchgang

- Mathematik: M6, **331/797 streng abgeschlossen**;
  D436/P436/A797/M797/V607, 73 Bild-Holds.
- Physik: M7, **478/478 streng abgeschlossen**.
- Sechs zentrale Validatoren bestanden; null Blocker.

Historische höhere Mathematik-Zähler gelten nicht automatisch für den
heutigen Bindungsstand. Neue Fortschrittszahlen werden erst nach der
gebündelten Integration aus dem zentralen Bericht übernommen.

## Erster verifizierter Integrationsstand

Der gebündelte zentrale Lauf nach dem Funktionenpaket bestätigt
**348/797 streng abgeschlossen** (43,7 %), netto **+17** gegenüber dem
Startstand. D453/P453/A797/M797/V602; sechs zentrale Validatoren bestanden,
null Blocker. Physik bleibt unverändert bei **478/478**.
Die gesonderte Reifegradprüfung deckte vier APV-203-Warnungen der neuen
Hessen-Abschlussaufgaben auf. Dieser Zwischenstand ist deshalb noch keine
Freigabe des gesamten Change-Sets; die gezielte Geltungskorrektur wird mit
den nächsten Integrationsprüfungen nachgewiesen.

Der nächste gebündelte Lauf nach dem 62er-Bilddurchgang bestätigt
**397/797 streng abgeschlossen** (49,8 %), netto **+49** zu 348 und
**+66** zum Startstand. D453/P453/A797/M797/V659; sechs zentrale Prüfungen
bestanden, null Blocker. Die gezielte APV-Korrektur ist nachgewiesen:
Curriculum-Qualitätsstatus regeneriert und alle neun geschützten
Reifegraduntergrenzen bestanden. Physik bleibt **478/478 und M7**.

### Funktionen und Analysis

Das Paket `m7-functions-calculus-current-20-v1` prüfte 20 aktuelle Ziele mit
zwei unabhängigen Runden und individuellen positiven Evidenzprofilen.
14 unveränderte Beschreibungen sind nativ aufgelöst und mit passenden
P-Profilen registriert. Fünf fachlich präzisierte Beschreibungen sind im
separaten aktuellen Paket `m7-functions-post-revision-5-v1` erneut durch
beide unabhängigen Runden geprüft, nativ aufgelöst und mit aktuellen
P-Profilen registriert. Der Atomizitätsfall `972cc7e8-be9c-444c-ba45-98e817b3cf14` bleibt
gesondert offen; er wurde aus den bisherigen D/P-Abschlussmengen entfernt.

16 konkret beanstandete Bilder wurden als PNG-Kandidaten korrigiert und nach
Sichtprüfung importiert. Beim Umkehrgraphen zählt ausschließlich die zuletzt
geprüfte Fassung V6, nicht die verworfenen Zwischenfassungen. Bild- und
Vorher-Nachher-Belege liegen unter
`quality/goal-visualization-review/math-m7-functions-20260920-v1/` und
`quality/goal-visualization-review/math-m7-open-calculus-20260920-v1/`.

### Hessen Q2.1: Geltung und lokale Abschlussaufgaben

Der belegte gemeinsame GK/LK-Bereich wurde in vier HE-GK-Sichten auf die zehn
gemeinsamen Ziele eingegrenzt; andere 84 Mathematik-Sichten bleiben
unverändert. Sechs unzulässige Voraussetzungskanten wurden entfernt und drei
inhaltlich passende lokale Abschlussaufgaben ergänzt. Der native
Regressionsfall ist `app/scripts/testHessenMathQ21Scope.ts`.

Neun bereits geprüfte Beschreibungen besitzen dadurch einen geänderten
Geltungs- oder Rückwärtsverweiskontext. Ihre alten D-Bindungen sind aus der
aktuellen Abschlussmenge genommen; das Paket `m7-he-context-refresh-9-v1`
hat ausschließlich diese betroffenen Kontexte in zwei unabhängigen Runden
bestätigt und nativ wieder registriert. Dies sind neun wiederhergestellte
D-Bindungen, keine neun neuen fachlichen Abschlüsse. Ihre unveränderten
gültigen P-Profile bleiben erhalten. Der technische und fachliche Delta-Nachweis
steht im Paketverzeichnis `he-q21-scope-repair` vom 20. September.

### Größerer Bild-KEEP-Durchgang

62 Ziele mit bereits registrierten D/P-Nachweisen wurden ausschließlich
gegen ihre tatsächlichen aktuellen Raster geprüft. Zwei getrennte
31er-Zuständigkeiten lieferten **49 KEEP-Annahmen und 13 konkrete
Bildkorrekturen**. Alle Einzelbefunde, Input-/Asset-Hashes und vorherigen
QA-Zeilen sind unter `math-m7-v-only-current-62-20260920-v1` gebunden.
Die 49 unveränderten Bilder sind mit aktueller maschineller Bildentscheidung
integriert. Im anschließenden Korrekturpass wurden zehn der 13 Defekte mit
geprüften PNGs behoben; drei Bildfälle bleiben offen. Alte positive Kompatibilitätsfelder
wurden nicht automatisch als neue Freigabe übernommen. D/P und menschliche
Freigaben bleiben unberührt. Der gebündelte zentrale Lauf bestätigt daraus
49 zusätzliche strenge Abschlüsse; die Bilder selbst wurden nicht ersetzt.

### Stochastik: nächster Kandidatenpass

Das Paket `m7-stochastics-foundations-current-20-v1` enthält 20 weitere Ziele.
40 konkrete zweisprachige Evidenzfälle sind vorbereitet. Die erste
Bildsichtprüfung ergab zwölf KEEP-Entscheidungen und acht konkrete
Korrekturbefunde; diese Befunde werden nicht durch alte positive QA-Felder
überstimmt. Die acht Korrekturen sind inzwischen als unabhängig betrachtete
PNGs importiert. Die zwölf zunächst als KEEP eingeordneten Bilder wurden
in den unabhängigen Kontrollrunden erneut betrachtet; vier konkret belegte
Restfehler werden gezielt korrigiert (bedingte Wahrscheinlichkeiten,
Kennzeichnung einer schematischen Streuungskurve, Lagepfeile und
Intervallflächenbegrenzung). Die übrigen acht bleiben unverändert. Beim weiteren
stetigen Verteilungsmodell ist die engere englische Fassung dem unveränderten
deutschen Geltungsumfang angeglichen.

Das neue unveränderliche Paket
`m7-stochastics-foundations-post-images-20-v1` bindet die Kontrollrunden an
diesen korrigierten Stand; der ursprüngliche Kandidatenstand bleibt erhalten.
Die 40 Evidenzfälle sind nachgerechnet und als aktuelle maschinelle
Kandidaten materialisiert, noch nicht zentral als Abschluss registriert.
Ersetzte aktive JPG-Kopien sind bytegleich im jeweiligen Reviewarchiv
erhalten, nicht unwiederbringlich gelöscht.

Diese Vorbereitung ist noch kein strikter D/P/A/M/V-Gesamtabschluss.
Die übrigen begonnenen Pakete bleiben im In-flight-Ledger sichtbar und werden
nicht durch pauschale Neustarts ersetzt.

## Konsolidierung der begonnenen Pakete

Auf Nutzerwunsch werden die begonnenen Arbeiten zu einem speicherbaren und
auslieferbaren Zwischenstand konsolidiert; es werden keine neuen Pakete
begonnen. Die automatische Zielverfolgung ist derzeit pausiert. Das
Mathematik-M7-Gesamtziel ist damit ausdrücklich nicht abgeschlossen.

Der aktuelle zentrale Bericht bestätigt **434/797 streng abgeschlossene
Mathematikziele (54,5 %)**: **+37** gegenüber 397 und **+103** gegenüber dem
Ausgangsstand 331. D476/P477/A797/M797/V676; alle sechs zentralen Prüfungen
bestanden, null Blocker. Physik bleibt bei **478/478**. Maßgeblich ist
`quality/goal-description-review/mathematik/rollout-v1/2026-09-20/m7-verified-package-close-v1/five-gate-report.commit-ready.json`.
Der regenerierte Curriculum-Status bestätigt Mathematik **M6**, Physik **M7**
und alle neun geschützten Reifegraduntergrenzen.

### Abgeschlossen und integriert

- `m7-held-seven-current-v1`: sechs neu aufgelöste Beschreibungsreviews.
  Die historische Siebener-Auflösung bleibt erhalten; nach der unten
  beschriebenen Routenreparatur zählt nur die aktuell gültige Sechser-Teilmenge.
- `m7-stochastics-final-current-18-v1`: 18 neu aufgelöste Reviews aus dem
  begonnenen Stochastikpaket. Die zwei übrigen Bildfälle bleiben gesondert offen.
- `m7-image-context-refresh-14-v1`: 13 gültige aktuelle Beschreibungsbindungen
  wiederhergestellt, kein erneuter fachlicher Erstabschluss. Der verbleibende
  Voraussetzungskonflikt `efc3506a-5f35-4d77-9498-d70a091a470b` bleibt offen.
- 38 aktuelle positive Evidenzprofile aus dem begonnenen 39er-Bündel registriert.
  Das geometrische Ziel mit geänderter Route bleibt gesondert offen. Ein gültiges P-Profil
  allein schließt den verbleibenden D-Konflikt nicht.
- Elf Statistikbilder nach tatsächlicher unabhängiger Sichtprüfung als PNG
  importiert; die zwei korrigierten V2-Kandidaten ersetzen ihre abgelehnten
  V1-Fassungen. Dies erledigt die Bildarbeit, nicht die noch fehlenden
  vollständigen Beschreibungsreviews des Statistikpakets.
- Das Konfidenzdiagramm und die zwei übrigen Stochastikbilder sind als PNGs
  korrigiert und nach tatsächlicher Bildsichtprüfung integriert. Für diese
  drei Bilder wird keine zweite unabhängige Bildfreigabe behauptet. Die noch
  fehlenden vollständigen D/P-Kontextprüfungen bleiben offen.

Die 24 neuen D-Abschlüsse, 13 wiederhergestellten D-Bindungen und 14
Bildkorrekturen sind verschiedene Arbeitsergebnisse und dürfen nicht zu einem
vermeintlichen Gesamtzuwachs addiert werden. Der Nettozuwachs der strengen
Fünf-Gate-Schnittmenge beträgt die oben genannten 37 Ziele.

Die abschließende Graphprüfung fand eine fehlende Motivationsanbindung bei
`4af3dfb9-7e15-5da5-8b86-0aac6c80e266` und vier davon abhängigen Zielen.
Die fachlich unpassenden Raumgeometrie-Voraussetzungen bleiben entfernt;
stattdessen ist das Ziel direkt an den bestehenden Sek-II-Orientierungsanker
angebunden. Graphprüfung und Reifegraduntergrenzen bestehen. Wegen dieses
geänderten Kontexts wird das Ziel bis zur erneuten unabhängigen Prüfung
ausdrücklich nicht mehr als D/P-abgeschlossen gezählt. Das erklärt die
Korrektur des vorläufigen Zwischenzählers 435 auf den gültigen Stand 434.

### Geordnet offen, ohne Abschlussbehauptung

Die unabhängigen Reviewer wurden durch das Nutzungslimit unterbrochen.
Unfertige Reviews werden nicht durch erneuerte Hashes oder fingierte
Prüfentscheidungen ersetzt. Das In-flight-Ledger hält die Zuständigkeiten und
genauen Ziel-IDs weiterhin fest:

- Statistikpaket mit 20 Zielen: acht Bild-KEEPs und zwölf Bildkorrekturen sind
  integriert, einschließlich des quellengebundenen Konfidenzdiagramms.
  Die vollständigen unabhängigen Beschreibungsreviews stehen noch aus.
- Beweis-/Problemlösepaket mit 20 Zielen: gebundene Review-Unterlagen sind
  vorbereitet; unabhängige Reviews und positive Evidenz fehlen noch.
- Fünf bekannte Bild-Holds: zwei korrigierte Stochastik-PNGs sind aktiv;
  ihre vollständige D/P-Kontextprüfung steht aus. Für drei andere Fälle sind
  Korrekturprompts vorbereitet, aber noch keine Ersatzbilder freigegeben.
- Das oben genannte geometrische Ziel ist nach der Routenreparatur im
  Einzelfallpaket `m7-held-seven-geometry-route-hold-1-v1` reserviert.
- Die übrigen historischen Quellen-, Atomizitäts-, Voraussetzungskanten- und
  Migrationsfälle bleiben mit ihren konkreten Befunden reserviert.

Ersetzte aktive JPG-Dateien und frühere PNGs sind in den jeweiligen
Reviewarchiven wiederherstellbar erhalten. Menschliche Freigaben wurden
nicht verändert. Prüfprotokolle, genaue Paketabgrenzung und die lokale
Übergabeprüfung liegen unter `m7-verified-package-close-v1/`.

### Auslieferungsprüfung

Die größere Zahl hochwertiger PNGs deckte einen PDF-Buildfehler auf:
Chromium bettet WebP-Druckableitungen verlustfrei ins PDF ein; deren kleine
WebP-Dateigröße begrenzt deshalb nicht die PDF-Größe. Für das bestehende
begrenzte PDF-Atlasprofil werden nun JPEG-Druckableitungen vor weißem
Seitenhintergrund verwendet. Original-PNGs, Webdarstellung, Bildprüfnachweise,
Auflösungs-/Qualitätsgrenzen und das 90-MiB-PDF-Limit bleiben unverändert.
Ein Chromium-Regressionstest prüft die tatsächliche DCT-Einbettung und die
bytegleichen Original-PNGs. **Die lokale Übergabeprüfung ist abgeschlossen:**
29 maßgebliche lokale Prüfbefehle bestanden, einschließlich vollständigem
App-Build, vier Lernzielbüchern, Publikationsregressionen, Lint und
Artefaktprüfungen. Das Mathematik-PDF bleibt mit 79,5 MiB unter dem
unveränderten 90-MiB-Limit; zwei fertige Diagrammseiten wurden zusätzlich
auf Lesbarkeit und vollständige Darstellung angesehen.
Die `*-commit-ready.receipt.json`-Belege und `commit-ready.receipt.json`
dokumentieren die Ergebnisse; frühere fehlgeschlagene Diagnoseprotokolle
bleiben als Verlauf erhalten. Nächster Schritt: Commit, dessen CI abwarten,
anschließend regulär ausrollen. Die Zielverfolgung bleibt pausiert.

## Grenzen

Keine Runtime-, Datenschutz-, Sicherheits- oder Plugin-Verträge geändert.
Keine privaten Klassen-, Lernenden-, Session- oder Chatdaten verwendet.
Kein Commit, Push, Deployment oder Remote-CI-Nachweis durch diesen lokalen
QS-Durchgang behauptet. Historische Reviewartefakte bleiben unverändert.
