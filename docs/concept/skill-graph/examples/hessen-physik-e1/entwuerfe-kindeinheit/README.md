# Entwürfe für die zwei Kindprüfungen in Hessen E.1

Stand 20. November 2026. Beide Fassungen sind fachlich unabhängig geprüft und für jeweils das bezeichnete Ziel freigabefähig. Der native Hessen-Kandidat bindet sie in der E.1-Planung an ihre genaue Materialrevision. Beide Aufgaben verwenden bereitgestellte Daten und sind auf Deutsch und Englisch vollständig.

| Aufgabe | Vorgesehene Zieldeckung | SHA-256 der DE/EN-Datei | SHA-256 der geprüften Aufgaben-, Lösungs- und Rasterabschnitte |
| --- | --- | --- | --- |
| [C · Senkrechten Wurf modellieren](c-senkrechter-wurf.md) | Modellierung und Idealisierung von Bewegungen | `da89343ca1da2a41fdabaaec9f2fd5ecce50aef0485f63cb6113a42e935af0e9` | `d953c7b3b60118f97b8825c9f101810736b79159f09502e3bfe7d6428460f760` |
| [D · Beschleunigungsprotokoll auswerten](d-beschleunigungsprotokoll.md) | Gleichmäßig beschleunigte Bewegung und Beschleunigung | `ebf5e6e09f67b93aa090d959a0fabab74df163d64def33fd909dd1bf74dfe788` | `b6a28705e45a076b0369d68b61fe71ff186ca743f703d99108cd9c3e9eff5ae9` |

Die Dateiköpfe nennen die Bezugsprüfung und das Deckungsziel. Die zweite Prüfsumme bindet für den Übergang aus dem Fachreview den Inhalt nach der ersten Markdown-Abschnittsmarke `## `, einschließlich des englischen Abschnitts. Dieser Inhalt ist in den Fachprüf- und Übergabefassungen bytegleich. Der [unabhängige Fachentscheid](unabhaengiges-fachreview.md) bindet die Übergabedateien mit ihren vollständigen Prüfsummen.

## Fachliche Gegenproben

Beide Raster haben vier Stufenblöcke zu je 5 BE. Zum Bestehen sind 17 von 20 BE nötig. In den 35 rechnerisch bestandenen Profilen erreicht jeder Block mindestens 2 BE. Die übrigen 1.261 Profile bleiben unter der Schwelle. Die Aufgabentexte machen die bewerteten Leistungen sichtbar.

| Synthetische Abgabe | Punkte | Ergebnis |
| --- | --- | --- |
| C zeigt beide Koordinatengesetze, drei Diagramme, beide Idealisierungen und den Transfer auf den leichteren Ball. Der Zeitraum des Modells ist mit dem Aufprall begründet. Die mathematische Nebenlösung und Fortsetzung sowie die Begründung der Startgrenze fehlen. | 5 + 5 + 5 + 2 | 17, bestanden |
| C begründet die beiden Idealisierungen für die Stahlkugel vollständig. Für den leichten Hohlball fehlt die begründete Änderung des Luftwiderstandsmodells. Die anderen drei Kriterien sind vollständig. | 5 + 5 + 1 + 5 | 16, unter der Schwelle |
| D löst beide Darstellungsaufgaben und die Bremsfortsetzung. Die Abgabe macht aus den konkreten, beschrifteten Teilflächen die Summen für Ortsänderung und Strecke bestimmbar. Numerische Endwerte und Kontrollablesung fehlen. | 5 + 2 + 5 + 5 | 17, bestanden |
| D nennt die allgemeinen Bedeutungen von Beschleunigungs- und Geschwindigkeitsflächen. Die Anwendung auf die zwei konkreten Teilflächen am Richtungswechsel fehlt. Die anderen drei Kriterien sind vollständig. | 5 + 1 + 5 + 5 | 16, unter der Schwelle |
| D gibt die negative Geschwindigkeit der verlängerten Bremsformel an. Eine physikalische Erklärung, warum die rückwärts gerichtete Beschleunigung einen neuen Grund braucht, fehlt. Die anderen drei Kriterien sind vollständig. | 5 + 5 + 5 + 1 | 16, unter der Schwelle |

Die unabhängige Fachsicht der ersten Entwürfe fand in C die ungeschützte Modelländerung beim Hohlball und in D die ungeschützte konkrete Flächenanwendung. Die vorliegenden Fassungen setzen beide Korrekturen um. Für C verlangt Stufe 2 der Idealisierungen den begründeten Einbezug des Luftwiderstands beim leichteren Ball und die kleinere erreichbare Höhe. Für D verlangt Stufe 2 der Flächenwertung zwei aus der konkreten Darstellung bestimmbare Flächen und deren richtige Verknüpfung mit Vorzeichen und Beträgen. Das unabhängige Review bestätigte diese beiden Gegenproben für die überarbeiteten Materialien.

Die unabhängige Nachrechnung und die Autorprüfung stimmen bei den Modellwerten überein. C erreicht den Scheitel nach 1 s bei 20 m und den Boden nach 3 s mit −20 m/s. D ergibt beim ersten Richtungswechsel −0,25 und +2,25 m Teilflächen, insgesamt +2 m Ortsänderung und 2,50 m Strecke. Der Bremsstopp ist nach 3 s bei 9 m. Die unzulässige Fortsetzung sagt bei 5 s −4 m/s und 5 m vorher.

## Einbindung und historische Belege

Die historischen Prüfungen zum [senkrechten Wurf](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/assessments/physik/e/constant-acceleration-unit-20261113-v1/tasks.md) und zum [Beschleunigungsprotokoll](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/assessments/physik/k6-measurement-rate-20261115-v3/acceleration-log.md) verwenden 24 von 24 beziehungsweise 20 von 20 BE. Die [gebundene Prüfung der Kindeinheit](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/learning-units/physics-constant-acceleration-2026-11-15-v2.md) dokumentiert den jeweiligen Deckungsanspruch. Alte Ergebnisse beziehen sich auf die tatsächlich bearbeitete Fassung und ihr Raster.

Die historischen Aufgaben haben bundesweite Referenzen, auch in einzelnen Sek-I-Ansichten. Der Hessen-Kandidat ersetzt deshalb genau die zwei sichtbaren Referenzen innerhalb des E.1-Astes der hessischen Oberstufe. Das betrifft die beiden ausdrücklichen GK- und LK-Oberstufenansichten und den Oberstufenast der sechs durchgängigen GK-/LK-Ansichten. Die reinen hessischen Sek-I-Ansichten enthalten keine der Varianten. Der [lokale Abschlussumfang](../umfang.json) bindet die beiden Hessen-Varianten an ihre Prüfungs- und Bewertungsrevisionen. Der bundesweite Kindeinheitsnachweis und die kanonische Eigentümerschaft der gewöhnlichen Ziele folgen dem vorhandenen Vertrag. Wagen und waagerechter Wurf sind eigenständige Leistungen des hessischen E.1-Abschlusses.
