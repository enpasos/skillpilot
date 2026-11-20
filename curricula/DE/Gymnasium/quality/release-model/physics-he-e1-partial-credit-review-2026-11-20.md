# Fachreview der Teilpunkteraster für Hessen Physik E.1

20. November 2026. Unabhängige fachliche Prüfung durch den Zweitgutachter, der die überarbeiteten Aufgaben und Raster geprüft hat. Das Urteil stützt sich auf die vollständigen deutschen und englischen Materialien, eigene Nachrechnungen und synthetische Bestehensfälle.

| Prüfung | Kanonische ID | Geprüfte DE/EN-Quelle | SHA-256 der vollständigen Quelle | Bestehen |
| --- | --- | --- | --- | ---: |
| Wann überquert der Wagen die rote Linie? | `ee7d5f3d-858f-59d6-89b0-e5a7f437f458` | [Wagen](../../../../../docs/concept/skill-graph/examples/hessen-physik-e1/wagen.json) | `3d083cd914464a31a29e35a1b7e1fd6ad7b203720164a3427a6ab66f1f296134` | 14 von 17 |
| Wo trifft die waagerecht gestartete Kugel auf? | `39f52dcb-ff1d-5cad-9ccb-30da803cfa85` | [Waagerechter Wurf](../../../../../docs/concept/skill-graph/examples/hessen-physik-e1/wurf.json) | `4cbb7324b119a9d5f8503b178e3bede674f525e0bf7ee55f85d6aa77b6b742d3` | 15 von 18 |

## Wagen

Die fünf Ablesungen auf der Ebene sind mit 0,80 m/s vereinbar. Eine dazu passende Gerade liefert 0,40, 0,60, 0,80, 1,00 und 1,12 m. Ihre größte Abweichung beträgt 0,01 m. Aus 1,12 m bei 1,90 s ergibt sich die zentrale Schätzung von 2,00 s. Der letzte Ortsbereich von 1,11 bis 1,13 m und der konservative Tempobereich von 0,75 bis 0,85 m/s liefern 1,9824 bis 2,0200 s. Die nach außen gerundete Lösung von 1,98 bis 2,02 s ist damit begründet. Für konstante schwache Verzögerung und alle fünf Messintervalle liegen die Extremwerte bei rund 1,98585 und 2,02911 s. Das in der Lösung genannte alternative Intervall von 1,98 bis 2,03 s deckt beide Extremwerte ab.

Eine Abgabe braucht mindestens 2 Punkte für die Modellwahl und mindestens 3 für die Vorhersage. Ein Tempo aus nur einem späten Messpaar reicht höchstens für 1 Modellpunkt. Selbst bei voller übriger Punktzahl sind damit nur 13 von 17 Punkten erreichbar. Eine fachlich begründete, einzelne untere Zeitschranke kann bis zu 2 Vorhersagepunkte tragen. Auch sie reicht bei sonst voller Leistung nur für 13 Punkte. Die erforderliche Vorhersagestufe verbindet einen plausiblen Schätzwert oder ein fachlich begründetes beidseitiges Zeitfenster mit mindestens einer quantitativen Auswirkung der Ortsgrenzen.

Ein Vergleich der Quellen hat die Kürzung der zweisprachigen Vorhersagezeile von 2.477 auf 1.694 UTF-16-Einheiten am semantisch identischen Einsatz der Stufen geprüft. Die Fassungen bewerten die einzelne Schranke gleich, erlauben beide Seiten als ersten belegten Rand und akzeptieren eine gemeinsame Rechnung, grafische Ablesung und Rundung nach außen.

Eine vollständige Modell- und Vorhersageleistung mit erkennbarer Annahme für das Reststück sowie richtig eingeordneter Kamerareihe bei den Kontrollmessungen kann mit 5 + 6 + 1 + 2 = 14 Punkten bestehen. Einzelne Fehler oder Auslassungen bei der Störung und der zweiten Skala dürfen hier offen bleiben. Beide Sprachfassungen erlauben gleichwertige rechnerische und grafische Belege. Die Aufgabe ist als eigenständige Prüfung der datenbasierten Modellwahl und Ankunftsvorhersage fachlich freigabefähig.

## Waagerechter Wurf

Ein waagerechtes Modell mit 1,60 m/s und senkrechte Fallmodelle mit 9,81 m/s² oder 10 m/s² halten alle jeweiligen Ablesegrenzen ein. Sie ergeben rund 0,45 s Flugzeit, 0,72 m ursprüngliche Reichweite und 1,43 bis 1,44 m bei doppeltem waagerechtem Starttempo. Dieselbe Flugzeit darf in einer Rechnung oder einer maßstäblichen Konstruktion nachvollziehbar sein. Beide Sprachfassungen lassen dieselben Lösungsformen und die gleiche Genauigkeit zu.

Für jede Bewegungsrichtung sind mindestens 2 Punkte nötig. Eine Abgabe, die senkrecht lediglich den bekannten freien Fall ansetzt oder anwachsende Wegzuwächse feststellt, erreicht dort höchstens 1 Punkt und insgesamt höchstens 14 von 18 Punkten. Das senkrechte Modell kann beispielsweise mit dem näherungsweise vierfachen Fallweg bei doppelter Zeit begründet werden. Wenn weder die ursprüngliche Vorhersage noch der Transfer die gemeinsame Flugzeit mit einer daraus bestimmbaren Reichweite verbinden, bleiben in beiden Teilen höchstens 2 Punkte. Selbst mit voller Modellbewertung ergibt das nur 14 Punkte.

Eine Abgabe mit vollständig geprüften Bewegungsmodellen und tragfähiger ursprünglicher Vorhersage kann mit 5 + 5 + 4 + 1 = 15 Punkten bestehen, wenn sie im Transfer begründet, dass die Flugzeit gleich bleibt, und die neue Reichweite offenlässt. Ein kleiner Fehler in der Reichweitenrechnung kann bei sonst richtigem Ansatz ebenfalls durch Teilpunkte aufgefangen werden. Die Aufgabe ist als eigenständige Prüfung der Modellwahl in zwei Richtungen und der quantitativen Landestelle fachlich freigabefähig.

## Reichweite des Nachweises

Alle benötigten Ablesungen stehen in den Aufgaben. Der Erfolg weist die fachliche Kernleistung im jeweiligen Material gemäß dem veröffentlichten Punkteraster nach. Für Aussagen über die genaue Form der Ablesegrenze, beide zeitlichen Grenzen, beide Fehlerarten bei der Kontrolle oder die vollständige Transferleistung sind die jeweils gezeigten Teilnachweise entscheidend. Beide Prüfungen führen leere `coveredGoalIds`. Die gebundenen Nachweise für die beiden gewöhnlichen Ziele der Kindeinheit `physics-constant-acceleration` bleiben eigenständig. Die technische Prüfung des direkten Zugangs und der korrekten Speicherung für die neue Materialrevision erfolgt im nativen Ablauf.
