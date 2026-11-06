# Backendfixture: geprüfte G8/G9-Mengen nach der Informatikreparatur

Die bestehende Controllerfixture enthält tatsächlich 56 Scopezeilen und prüft
jede in G8 und G9. Der native Adapter hat alle 112 Fälle in drei getrennten
Kontexten ausgewertet: vor dem geprüften 39+166-Satz (`5921…`), auf dem
Remote-Stand (`93a…`) und nach dem getrennten 26er-Satz (`f95…`). Er ruft die
echten Methoden `LearnerService.getGoalProjection` und `computeAtomicStats`
auf. Sichtbare gezählte IDs und der echte Statistikwert werden pro Anfrage
verglichen; strukturelle Atommengen werden separat ausgewiesen.

Alle 112 alten Fixturewerte passen zum ersten Kontext. Der 39+166-Satz ändert
zwölf Informatik-Anfragen; die übrigen 100 bleiben gleich. Betroffen sind
exakt zwei Memory-Knoten, keine gewöhnliche Kompetenz. Die entfernte
Zuschreibung stammte ausschließlich aus dem fachlich verworfenen
Ganzprüfungsvorbedarf. Die fünf expliziten Zahlenkorrekturen gelten jeweils
für beide Dauerformen:

| Land | Alter Fixturewert | Geprüfter Wert |
| --- | ---: | ---: |
| Niedersachsen | 22 | 21 |
| Nordrhein-Westfalen | 20 | 19 |
| Rheinland-Pfalz | 18 | 17 |
| Schleswig-Holstein | 27 | 26 |
| Sachsen | 29 | 28 |

Hamburg bleibt bei 22 und tauscht nur den Datenbank-Memory-Knoten `ca2469f3…`
gegen den Sprach-Memory-Knoten `dbad1333…`. Zwischen `93a…` und `f95…` bleiben
alle 112 Target-, Support- und Statistikmengen exakt gleich. Die Auswertung
isoliert jeweils nur die gebundene Informatikquelle im ansonsten gleichen
aktuellen Runtimebaum; sie behauptet keine drei vollständigen historischen
Repositoryläufe. Der
[unabhängige Herkunfts- und Mengenreview](informatics-seki-backend-scope-independent-review-2026-11-06.md)
bindet beide vollständigen Decks und die bisherigen Origin-/Mappingbelege.

Geändert sind ausschließlich fünf feste Zeilen und der Herkunftskommentar
im bestehenden Test, keine aus dem Ist generierten Erwartungen. Die
bestehende HTTP-Antwort liefert nur Statistikwerte und keine vollständige
Liste gezählter IDs; deshalb wird kein neuer Produktendpunkt ergänzt.
Die [Anwendungs- und Testquittung](backend-m6-duration-scope-fixture-repair-2026-11-06.json)
und die [vollständigen nativen Daten](backend-m6-scope-native-2026-11-06/storage-inventory.json)
sichern alle 336 Auswertungen, exakte Eingaben und den unveränderten
Produktionspfad.

Genau die bestehende JUnit-Methode
`learnerStateUsesReviewedAdditionalM6SekIDurationProjectionForAtomicTotals`
ist anschließend mit normaler Ressourcenverarbeitung und gepinntem JDK lokal
bestanden: ein Test, null Fehler, Fehlschläge oder Skips. Die
[schmale XML-Auswahl](backend-m6-scope-native-2026-11-06/junit-selected-attributes.derived.xml)
ist ausdrücklich **abgeleitet** und enthält nur echte Suite-/Testcaseattribute.
Das vollständige Original-XML und die Prozesslogs bleiben lokal und sind
lediglich mit ihrem Rohhash gebunden; keine Spring-Konfiguration oder
`system-out`-/`system-err`-Inhalte werden veröffentlicht.

Dieser lokale Methodennachweis ersetzt keinen neuen Remote-Backendlauf.
Produktionsfilter, Curriculuminhalte, QA-Bindungen, Meilensteinregeln und die
sieben offenen geschützten Floors werden durch die Fixturereparatur nicht
verändert.
