# B038: gezielte Source-/Scope-Diagnose zu 49f9059a

Stand: 2026-09-06, 11:46 UTC. Autorität: eigene AI-Diagnose / Kandidat, keine menschliche Freigabe und keine kanonische Änderungsentscheidung. Rein öffentliches Layer A. B038-Runde B20 bleibt unverändert; keine fremden D-/P-Records oder Synthesen gelesen.

## Ergebnis und Arbeitsgrenze

Ziel `49f9059a-876c-5051-8146-d008b5cc691c` bleibt separat auf **Hold**, bis die hessische Quellzuordnung samt enger Nachbarschaft bewusst geklärt ist. Es zählt nicht als abgeschlossen. Die übrigen 19 B038-Ziele können unabhängig davon bearbeitet werden; diese Diagnose bestätigt keinen tatsächlichen Abschluss oder Registry-Status dieser 19.

Der sachliche Zielumfang, die stabile ID und die akzeptierte Beschreibung bleiben erhalten. Weder eine bundesweite LK-Beschränkung noch eine bundesweite GK-Freigabe folgt automatisch aus Titel, Tag oder dieser Diagnose. Keine isolierte Änderung einer generierten Sicht empfohlen.

## Drei getrennte Befunde

1. **Direkte Herkunft ist Bayern, nicht Hessen Sek I.** Das kanonische Ziel nennt LehrplanPLUS M12-EA.1.2. Die direkte exakte Mapping-Kante verbindet das BY-Quellziel `5d5f98a2-9cfb-559f-adaf-3701e1a84339` mit genau diesem Ziel. Die Quell-Extraktion trägt SekII, Jahrgang 12, courseLevel LK und JGST12_EA. Sie hat allerdings die beiden mathematischen Formeln aus dem Quelltext verloren. Amtlich nachgeprüft verlangt M12 1.2 das plausible Begründen der Grenzwerte von x^n/e^x bei x gegen +Unendlich und x^n*e^x bei x gegen -Unendlich durch Wachstumsvergleich. Das stützt die bestehende Kompetenz; kein neuer formaler Beweiszwang wird daraus abgeleitet. [Amtlicher Fachlehrplan](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer)

2. **BY-GK ist nicht schon wegen des LK-Labels falsch.** In Bayern wird Mathematik in Q12/Q13 generell auf erhöhtem Anforderungsniveau unterrichtet; eA ist dort nicht gleichbedeutend mit einem frei gewählten Mathematik-Leistungsfach. Deshalb darf das Ziel nicht allein aus den plattformseitigen BY-GK-Ansichten entfernt werden. Das pauschale LK-Suffix ist kein tragfähiger länderübergreifender Scope-Schalter. [Amtliche Belegungsverpflichtung](https://www.gymnasiale-oberstufe.bayern.de/faecherwahl-und-belegung/belegungsverpflichtung), [ISB-Kontaktbrief 2023, S. 5](https://www.isb.bayern.de/fileadmin/user_upload/Gymnasium/Kontaktbriefe/Mathematik/kontaktbrief_mathematik_2023.pdf)

3. **HE SekI G9 ist eine belegte Cluster-Überdehnung.** Das hessische Quellziel `he-math-seki-g9-10-2-07-5e841891` behandelt Logarithmusfunktionen als Umkehrung der Exponentialfunktion und deren Eigenschaften/Graphen. Es ist zusätzlich auf den gesamten Cluster `48e7615d-3e6e-4b5c-9df3-310e510f91f0` gemappt. Der Duration-Generator expandiert alle sieben atomaren Kinder dieser Mapping-Kante in Jahrgang 10. So entsteht der explizite target-Eintrag von 49f9059a in HE SekI G9. Das ist kein Nachweis der bayerischen asymptotischen Kompetenz durch die hessische Quelle.

Die geltende KC-Quelle nennt für HE Sek I einfache Potenz- und Exponentialfunktionen sowie Darstellungen. Die ergänzend verwendete G9-Jahrgangsreferenz nennt in 10.2 Graphen für konkrete Basen 2, 3, 1/2, 1/3 und ihren Vergleich mit linearen, quadratischen und kubischen Funktionen. Sie liefert hier keinen gleichwertigen ausdrücklichen Auftrag zu den beiden BY-Grenzwerten der natürlichen Exponentialfunktion. Der engere Graphvergleich darf nicht mit 49f9059a gleichgesetzt werden. In der Extraktion ist das KC als binding-core, der G9-Lehrplan als legacy-grade-sequencing-reference deklariert. [KC, gedruckte S. 29](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf), [G9-Lehrplan, S. 38, Abschnitt 10.2](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf)

## Exakte aktuelle Dateipointer

Alle folgenden Pfade sind relativ zum Repository:

- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:78490`: Ziel, LK-Titel/Tag, core false, sourceRef, unveränderter Inhalt. `:40791`: siebenkindiger Elterncluster; `:40729`: übergeordneter Exponentialfunktionen-Cluster.
- `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json:1738`: direkte Mapping-Kante; `:7343`: zugehöriger Quellentscheid.
- `curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json:12361`: genaues BY-Quellziel; `:75`: Dokument JGST12_EA mit amtlicher URL.
- `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json:5791`: problematische einzelne HE-Kante; `:14627`: zugehöriger Quellentscheid. Seine drei anderen Zielverweise sind 3c1d6ce7-099e-4267-9ff2-3d1526209a89, c15fe32d-1c83-4127-b1a4-9125af3d8f5d und dbc13bb0-963b-49a8-a441-2183f4b64c8e.
- `curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json:15154`: Logarithmus-Quellziel; `:15106`: gesonderter Graphvergleich; `:12`: KC-/G9-Quellenrollen.
- `app/scripts/generateMathDurationCompositionViews.ts:597`: Mapping-Schleife; `:605`: unbedingte atomare Nachfahrenexpansion; `:419`: rekursive contains-Auflösung; `:935`: Erzeugung der hessischen Sek-I-Sicht aus den Mapping-Buckets.
- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-seki-g9.view.json:1126`: explizites target-goalEntry unter Jahrgangsstufe 10 / Weitere Kompetenzen.
- `curricula/DE/Gymnasium/composition-views/mathematik/de-by-sekii-gk.view.json:796`, `de-by-gk.view.json:1719`, `de-by-sekii-lk.view.json:1415`, `de-by-lk.view.json:2349` im selben Verzeichnis: vier explizite BY-Zielplatzierungen, derzeit unter Q4 / Weitere Kompetenzen. Die amtliche Quelle selbst ist Jahrgang 12; der generische Q4-Name ist kein Quellenbeleg.
- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-gk.view.json:42`: Einbindung des ganzen Clusters 4047af71 als E.4. Andere Oberstufensichten erreichen das Ziel überwiegend über den gemeinsamen Vorfahren 528cab0b-399d-4d4b-97ea-c32733eb821c.
- `app/src/utils/authoring/compositionViewAuthoring.ts:77`, `:113`, `:341`: explizite Projektionsrollen bzw. target-Expansion; kein automatischer LK-Titelfilter. `app/scripts/goalBookModel.ts:1130`, `:1193`, `:1219`: Seiten-Applicability wird aus den Zielmengen der eingebundenen Sichten gewonnen.
- `app/scripts/applicabilityCompiler.ts:888`, `:939`: von Buch-Scope zu unterscheidende Vererbung von Cluster-Mapping-Belegen an atomare Nachfahren; die kanonische applicability enthält hier nur jurisdiction, keine belastbare GK-/LK-/Stufenentscheidung.

## Enge Nachbarschaft und mögliche Reichweite

| B038-Seite | Kind-ID | Kompetenz | Weitere direkte HE-G9-Mappingstütze außerhalb der problematischen Clusterkante |
| --- | --- | --- | --- |
| 7 | 781f133a-08bb-54b9-8fda-efa2f8f9b12c | Wachstum und Zerfall deuten | Keine; jedoch Voraussetzung des folgenden Parameterziels |
| 8 | 346efb31-c400-5bd3-a698-dd9a7e1bc3f7 | Parameter, Verdopplungs-/Halbwertszeiten | Ja: he-math-seki-g9-10-2-04-d7759617 |
| 9 | 628928a6-4f48-54dc-952d-dec0e69dc856 | Eigenschaften von e^x, einschließlich Ableitung | Keine |
| 10 | f05acdc5-4949-54c7-b8cd-56ddd1fbdbad | Kontinuierliche Prozesse mit e^x | Keine |
| 11 | d900e0a4-0c45-50dd-a37b-01f9f91a134c | Exponentialgleichungen logarithmisch lösen | Keine |
| 12 | ab720928-9dbc-53c2-a1f8-865dda92122d | Exponentielle Modelle aus Daten | Keine |
| 13 | 49f9059a-876c-5051-8146-d008b5cc691c | Asymptotischer Vergleich | Keine |

Dies ist eine gezielte Mapping-Abfrage, keine negative fachliche Vollbewertung der sechs Nachbarn. Weitere didaktische requires-Stützen sind gesondert zu berücksichtigen. Die Kette lautet 781f133a → 346efb31 → 628928a6; danach hängen f05acdc5, d900e0a4 und 49f9059a an 628928a6, ab720928 an d900e0a4. Eine bloße Löschung der Clusterkante kann somit mehrere Seiten und ihre Lernrouten betreffen.

Die gebundene B038-Seite 13 weist derzeit 32 SekII-Scopes (16 Länder × GK/LK) plus HE SekI G9 aus. Die bundesweite Scope-Liste wird durch die Komposition erklärt, aber in dieser begrenzten Diagnose nicht für jedes Land fachlich bestätigt.

Ein ausschließlich im Speicher durchgeführter Test mit dem nativen Composition-Compiler ergab: Entfernen nur des HE-G9-goalEntry würde genau 49f9059a aus dieser Zielmenge nehmen, keine anderen IDs hinzufügen/entfernen, keine Compiler-Findings erzeugen und keine direkten Voraussetzungen verbleibender HE-G9-Ziele verletzen. **Das ist nur ein Reichweitennachweis, keine empfohlene oder ausgeführte Änderung**: der unveränderte Mapping-Generator würde den Eintrag wieder erzeugen.

Der einzige kanonische direkte Nachfolger von 49f9059a ist das Assessment `1969d4dc-2ba6-5c26-ad7c-6e0114ab1fdf` (`canonical/...MATHEMATIK.de.json:72662`, requires und coveredGoalIds). Es gehört nicht zur B038-Siebenernachbarschaft und nicht zur hier geprüften HE-SekI-Zielmenge. Seine Abhängigkeit darf bei späterer Scope-Arbeit nicht versehentlich verändert werden.

## Kleinster nächster Schritt zur Wiederaufnahme

Eine **quellenbewusste Ein-Kanten-/Sieben-Kinder-Prüfung** für HE G9 10.2 durchführen: Für jedes Kind ausdrücklich entscheiden, ob es vom tatsächlichen Quellpunkt gedeckt ist, durch einen anderen passenden Quellpunkt zugeordnet werden soll, als echte didaktische Voraussetzung verbleiben muss oder aus dieser Sek-I-Zielmenge entfällt. Dabei die drei schon vorhandenen Logarithmus-/Umkehrverweise des Quellziels fachlich bestätigen und die pauschale Zuordnung auf 48e7615d ersetzen beziehungsweise entfernen; nicht sechs ungeprüfte Kinder pauschal zurückmappen.

Erst danach Mapping-Darstellungen und zugehörigen Quellentscheid konsistent aktualisieren, betroffene Dauer-/Kompositionsartefakte über den bestehenden Prozess ableiten, den exakten Zielmengen-/Voraussetzungsdelta prüfen und die betroffenen Buchseiten neu binden. Die 32 bestehenden SekII-Scope-Zuweisungen nicht global umstellen. BY-Zielabdeckung und kanonische ID/Beschreibung/contains-/requires-Identität des Inhalts bleiben erhalten, sofern keine gesonderte fachliche Entscheidung etwas anderes autorisiert.

Für den frischen Recheck benötigt Runde B anschließend ausschließlich die tatsächlich geänderten Seiten mit neuen aktuellen Bindungen und gegebenenfalls neuem Bild. Keine neue vollständige B20-Runde und keine breit angelegte Länderrecherche erforderlich. Ein lokal bestandener Compiler-Check ersetzt weder diese fachliche Entscheidung noch die anschließend zuständigen bestehenden Qualitäts-/Maturity-Gates.

## Ausgeführte Aktionen

Nur gezielte Quell-, Mapping-, Kompositions- und Generatorlesungen, amtliche Quellenprüfung und ein nicht persistierter native-Compiler-What-if. Keine Kanonik-, Mapping-, Kompositions-, Bild-, QA- oder Registryänderungen. Einzige geschriebene Datei ist diese Diagnose; vorhandene B20-Records/Run unverändert.
