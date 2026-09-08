# Physik: pausierter Zwischenstand vom 8. September 2026

Status: lokal geprüft und commitfähig; Arbeiten abgeschlossen und angehalten.
Das Goal bleibt auf ausdrücklichen Nutzerwunsch pausiert. Es wurden nur die bereits
begonnenen Änderungen konsolidiert, keine neuen QS-Pakete gestartet. Ausgangspunkt
ist `4aaaab6c154dc634948c6c32996b5e4c1379c272`. Kein Commit, Push oder Deployment
wird durch diesen Zwischenabschluss ausgeführt.

## Fortschritt und verbleibende Arbeit

Der native Fünf-Gate-Check ergibt:

| Fach | Streng abgeschlossen | Anteil | Offen |
| --- | ---: | ---: | ---: |
| Mathematik | 424 / 797 | 53,2 % | 373 |
| Physik | 422 / 478 | 88,3 % | 56 |

Physik hat 422 aktuelle Beschreibungsabschlüsse (D), 477 Verständnisprofile (P)
und jeweils 478 aktuelle Atomicity-, Memory- und Bildentscheidungen (A/M/V).
Der strenge Schnitt beträgt 422; einzelne Gate-Zahlen werden nicht addiert.
Eine aktuelle Bildentscheidung kann auch eine belegte, explizite Zurückstellung
sein und bedeutet nicht, dass jedes Ziel bereits ein freigegebenes Bild besitzt.
KI-geprüfte Evidence-Kandidaten werden nicht als menschlich freigegeben ausgegeben.

Gegenüber dem [vorigen pausierten Checkpoint](physics-paused-checkpoint-2026-09-07.md)
mit 410/465 sind netto 12 streng abgeschlossene und 13 atomare Ziele hinzugekommen.
Die zwischenzeitlich genannten 414/465 (89,0 %) gehörten zum Stand vor dessen
Wiederöffnung veralteter Prüfbindungen. Prozentwerte müssen mit ihren jeweiligen
Zählern und Nennern verglichen werden. Mathematik bleibt fachlich unverändert.

Die zunächst gemeldeten 431/478 (90,2 %) waren noch nicht der endgültige
Abschlussstand: Die notwendige Aktualisierung veralteter Geltungs-Caches erhält
zwar die tatsächlich kompilierten Zielmengen, verändert aber bei neun früheren
Abschlüssen den exakt gebundenen V3-Prüfkontext. Diese neun bleiben deshalb offen.
Texte, Bilder und ursprüngliche Prüfungen sind nicht verloren; die ursprünglichen
Review-Eingaben oder Hashes werden nicht nachträglich umgeschrieben. Der Beleg
`stale-context-retention.receipt.json` in der unten genannten Checkpoint-Akte
nennt die einzelnen Ziele, alten Claims und Metadatendifferenzen.

## Konsolidiertes Paket

- Bereits begonnene Physik-Korrekturen und Aufteilungen bleiben mit konkreten
  Aufgaben, Quellenzuordnungen, Lernwegen, Karten- und Bildprüfungen erhalten.
  Bestehende IDs aufgeteilter Ziele dienen weiter als Cluster; keine stillen
  Umnummerierungen oder pauschalen Bundeslandfreigaben.
- Dioden: pn-Modell, tatsächlich auszuführende Kennlinienmessung und Gleichrichtung
  sind getrennte Kompetenzen mit eigenen Abschlussaufgaben. Die drei Bilder nutzen
  unveränderte, einzeln gegengeprüfte Panels des bestehenden SVG, keine neu
  erfundenen Kurven oder Messwerte. Die vorhandenen drei Aufgaben sind auch im
  Sek-I-Prüfungsordner angebunden. Acht Länderansichten erhalten die tatsächlich
  benötigte Halbleiter-Voraussetzungskette ausschließlich als `prerequisiteOnly`.
  Der native Vergleich bestätigt unveränderte Inhaltszielmengen in allen 70
  Ansichten. 26 zusätzliche Verweise auf zwei vorhandene, konkret geprüfte
  Aufgaben vervollständigen die lokalen Prüfungswege; nur diese Assessment-IDs
  kommen zu den vollständigen Zielmengen hinzu. Die Generatoren erhalten die
  expliziten Verknüpfungen bei erneuter Erzeugung.
- Astronomie: Radius, Entfernung und Lebensdauer aus begrenzten HRD-Modellen sowie
  Transit- und Radialgeschwindigkeitsverfahren sind getrennt. Quellen und
  Kursprofile begrenzen die Geltung; die neuen Ziele gelten nicht automatisch
  in allen 16 Ländern. Zwei neue HRD-Bilder wurden einzeln gegengeprüft.
- Drei weitere Astro-Bilder bleiben wegen dokumentierter Fehlversuche zurückgestellt:
  Radiusdarstellung, Transit und Radialgeschwindigkeit. Fehlerhafte Bilder wurden
  nicht zur Kostenersparnis freigegeben; Versuche und Entwürfe sind erhalten.
- Vier lokale Modellkorrekturen und die Verkehrsphysik-Korrektur haben aktuelle,
  einzeln geprüfte Verständnisprofile. Historische Profile und versiegelte Reviews
  bleiben unverändert; nur belegbar aktuelle Teilmengen sind aktiv registriert.

Die Fortsetzungsakten liegen unter
`curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/`.
Insbesondere die Unterordner `physics100-final-diode-consolidation-v1`,
`physics100-final-astro-consolidation-v1`, `physics100-final-local-corrections-v1`
und `physics100-traffic-flow-audit-v1` enthalten die konkreten Belege.
Das Namenspräfix `physics100` ist ein Arbeitsziel, keine behauptete Abnahme.

## Technischer Zwischenabschluss

Alle 41 Curriculum-Gates sind bestanden. Zwei zunächst veraltete abgeleitete
Dateien wurden regulär nachgeführt und erneut geprüft: die Duration-Angebotsdatei
und der öffentliche Physik-Quellenindex. M6 bleibt für Physik erhalten; alle neun
geschützten Reifegraduntergrenzen bestehen. CQR-104 hat keine fehlenden lokalen
Motivations-, Aufgaben-, Voraussetzungspfade oder Stufenanbindungen. CQR-501 hat
keine aktive Warnung; eine vorherige akzeptierte Warnung bleibt unverändert.

Der vollständige Backend-Check (`./gradlew check --console=plain`, Corretto
25.0.2.10.1) besteht nach knapp 15 Minuten: 178 frische Testsuiten, 1.566 Fälle,
davon 1.565 bestanden und einer regulär übersprungen, keine Fehler. Die angepassten
Zahlen in zwei generischen Physik-Integrationstests sind durch konkrete
HEAD-/Current-ID-Vergleiche derselben Backend-API belegt. Mappingtests prüfen
weiterhin die exakten Zuordnungen. Runtime-Code und eingefrorene
Vertragsassertionen wurden nicht verändert.

Die vollständige `test:goal-book-pipeline`, `prepare:runtime-assets` und
`build:application` bestehen mit Node 20.20.2. Alle vier Buchpublikationen und
die öffentlichen Quellenindizes einschließlich ihrer gebauten Kopien sind
verifiziert. Lint und TypeScript bestehen; nach einer rein typseitigen Korrektur
in zwei Generator-Hilfsdateien wurde der komplette Physik-Buchinputtest erneut
bestanden. Der Renderer-/Generatorablauf und die operativen Curriculum-Dateien
wurden dabei nicht verändert. Die früheren Paket-Receipts bleiben als
Ausgangsnachweise erhalten; der zentrale Abschlussbeleg bindet die neuen Typdateien.

Zusätzlich bestehen fünf Python-Vertrags-/Datenprüfungen (unter anderem Schema-
und UUID-Prüfung), der OpenAI-Review-Freeze, die Plugin-Versionsprüfung und das
AI-Transparenzinventar. Im Inventar wurden ausschließlich acht gemessene
Layer-A-Bestandsfelder aktualisiert; Aussagen über Datenschutz, menschliche
Freigaben, andere Medien und deren Hashes bleiben unverändert. Die Bilddateien
und Laufzeitkopien stimmen überein. Kein generiertes Lernzielbuch-PDF ist getrackt
oder als neue Git-Datei vorgesehen. Die Asset-Aufbereitung hat lediglich 48
veraltete abgeleitete Story-Kopien entfernt; ihre Quellen bleiben erhalten und
die Dateien sind wieder erzeugbar.

Prüfgrenzen, M6-Floors und Runtime-/Plugin-Verträge wurden nicht abgesenkt.
Es wurde kein Commit, Push, Deployment oder neuer GitHub-CI-Lauf ausgeführt.
Vite-Chunkgrößen-/Browserslist-Hinweise und Java-Deprecation-Hinweise blockieren
die bestandenen lokalen Prüfungen nicht.

Ein temporärer Bildkandidat hatte denselben Landscape-Identifier wie das operative
Physik-Curriculum und wurde durch den rekursiven JSON-Loader als zweite Landschaft
eingelesen. Dadurch überschrieb ein Sieben-Ziele-Entwurf die vollständige Landschaft
im Backend. Die Datei ist bytegleich als `image-candidate-landscape.json.snapshot`
erhalten und wird nicht mehr als Runtime-Curriculum geladen. Der Loader und seine
Verträge wurden nicht verändert. Alle weiteren neuen Curriculum-JSON-Dateien
wurden auf dieselbe unbeabsichtigte Landscape-Form geprüft.

Lokale Abschlusslogs: `tmp/physics-paused-final-gates-20260908.4kryX0/`.
Der dauerhafte Gesamtbeleg heißt `final-checks.receipt.json` in der unten
genannten Checkpoint-Akte. Frühere fehlgeschlagene Zwischenläufe werden dort
von den erfolgreichen Nachprüfungen unterschieden. Alle Hilfsagenten sind
gestoppt; das Goal wurde abschließend erneut als `paused` bestätigt.

## Wiedereinstieg nach neuer Freigabe

Maßgeblich bleiben die zentrale Registry
`curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`
und das `goal-description-review/in-flight-work-ledger.json`. Die 56 offenen
Physik-Ziele sind in drei disjunkten Haltepaketen mit 20, 20 und 16 Zielen reserviert.
Dies startet keine Jobs oder neuen Reviews. Die Mathematik-Reservierungen bleiben
unverändert. Der native Ledger-Loader bestätigt die Gültigkeit und Disjunktheit.

1. Bestehende D048/D050-Prüfunterlagen und die gültige D049-Teilmenge nutzen;
   nur tatsächlich veränderte Ziel-/Kontextbindungen erneut prüfen. Kein Neustart
   unveränderter gültiger Nachweise und keine automatische Anerkennung alter Entwürfe.
2. Die neuen beziehungsweise korrigierten offenen Ziele mit den fehlenden
   unabhängigen Beschreibungsreviews abschließen. Beim Halbleiterschalter
   `7d4d6a39…` fehlt zusätzlich das aktuelle Verständnisprofil.
3. Strömungsmodelle (`333…`) und Milchstraßen-/Teleskopkompetenzen (`826af579…`)
   bleiben gezielte offene Fachentscheidungen. Vorhandene Entwürfe sind keine
   operative Änderung oder Freigabe.
4. Die drei belegten Astro-Bildrückstellungen gezielt wieder aufnehmen. Gute
   vorhandene Bilder und geprüfte Panels erhalten; jedes neue Bild vollständig
   fachlich und gegen die aktuelle Zielbeschreibung prüfen.

Registry-Teilübernahmen und ausgeschlossene veraltete Bindungen sind in
`curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-checkpoint-20260908-v1/`
dokumentiert. Historische Apply-Skripte nicht blind erneut ausführen: Ihre
Hash-Vorbedingungen beziehen sich auf frühere Zwischenstände.

## Nachtrag: Hessen-Sek-II-Baumkorrektur

Separater Fehlerfix nach dem pausierten QS-Meilenstein, keine Wiederaufnahme des
100-Prozent-Goals und keine neue fachliche oder menschliche QS-Freigabe.

Die produktive Ansicht für Hessen, Sek II, GK+LK zeigte `Physik → Physik`
sowie fünf Ergänzungszweige neben dem eigentlichen Hauptzweig. Die B034- und
Dioden-Ergänzungen waren auf Wurzelebene platziert; dadurch griff die bestehende
Zusammenfassung der gleichnamigen Einzelwurzel nicht mehr. Zwei unterschiedliche
GK-/LK-Abiturreferenzen überschrieben außerdem ihre aussagekräftigen Titel mit
demselben Anzeigetext.

Die beiden bestehenden Hessen-Sek-II-Views behalten ihre View-, Struktur- und
Lernziel-IDs. Der Hauptzweig heißt nun `Sekundarstufe II (GK)` beziehungsweise
`Sekundarstufe II (LK)`; der unveränderte Backend-Merger verbindet beide zu
`Sekundarstufe II (GK + LK)`. Das englische `labelEn` bleibt profilneutral,
weil der bestehende Merger außerhalb des deutschen Labels identische Metadaten
verlangt.

Die Ergänzungen sind innerhalb der bestehenden Q4-Gliederung eingeordnet:
Transistoren und Dioden unter Festkörperphysik, Sternentwicklung unter
Astrophysik und Kernreaktionen unter Kernphysik. Die konkreten neuen und zuvor
einzeln platzierten Q4-Aufgaben stehen gemeinsam unter `Übungen Q4`. Die beiden
Abitureinträge unterscheiden GK und LK; die interne Dioden-Quellenbezeichnung ist
durch `Dioden` ersetzt. Ziel- und Voraussetzungsmengen sowie kanonische
`requires`/`contains`, Mastery und gespeicherte Lernzustände werden nicht geändert.

Die Quellenzuordnung des bestehenden Kernphysikziels
`7e719cc2-0866-5267-a252-e7e7ac0d03f1` zu Hessen Sek II ist damit ausdrücklich
nicht neu bestätigt. Das Ziel bleibt im bisherigen Zielumfang; seine genaue
Geltung ist separat fachlich zu prüfen. Auch Wahlthemen werden durch die neue
Platzierung nicht zu allgemeinem Pflichtstoff erklärt.

Die Platzierungskorrektur ist in
`app/scripts/lib/hessePhysicsTreePlacements.ts` zentralisiert und in die
B034-Neuerfassung und Dioden-Aufbereitung eingebunden. Alte feldgebundene
Apply-Pläne und Receipts bleiben unverändert und dürfen nicht auf neue
Zwischenstände umgebunden werden. Der BB/BE-Quellengenerator prüft vorhandene
begutachtete Views, statt sie erneut aus der Hessen-Vorlage zu überschreiben;
fehlende Views erfordern separate Erstellung und Prüfung.

Regressionen prüfen die native Lernendenprojektion, exakte Referenz-/Rollen-
und Voraussetzungserhaltung, idempotente Aufbereitung, Q4-Platzierungen und
den echten Backend-Merge für GK, LK und GK+LK jeweils mit G8 und G9. Es werden
keine Laufzeit-Heuristiken oder Plugin-Verträge geändert.
