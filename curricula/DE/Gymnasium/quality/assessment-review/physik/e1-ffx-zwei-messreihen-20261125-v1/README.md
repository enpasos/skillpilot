# Zwei eigene Fallmessreihen

Die Freigabe der vorgeschlagenen Grenze von 20 aus 24 Punkten ist geparkt. Für Lernende gilt weiterhin die veröffentlichte Bewertung mit 23 aus 24 Punkten.

Die beiden Untersuchungen sollen je zwölf Punkte tragen. Ab der zweiten Fassung entfallen je drei Punkte auf eigene Daten und die eigene Bestimmung von g, vier auf Bewegungsgesetz und Anfangsbedingungen sowie zwei auf die Grenzen der Aussage. Von den vier Gesetzespunkten trägt die Übereinstimmung mit dem eigenen Reihenschätzwert 2,5. Bei B umfasst die letzte Zeile auch den Vergleich der Versuche. Die Aufgabe verlangt weiterhin zwei getrennte reale Messreihen.

Die zwölf anfänglichen Lösungen und drei Diagrammblätter sind synthetische Prüfbeispiele. Nach dem Befund beider Gutachten zur Verknüpfung von Reihenschätzwert und Gesetz kam ab Fassung 2 als dreizehnte Abgabe ein Fall mit zwei abweichenden Koeffizienten hinzu und als vierzehnte die Gegenprobe mit genau einer Abweichung. Zwischen den ersten beiden Fassungen blieben die ursprünglichen zwölf Arbeiten wortgleich. Die letzte Runde verwendet dieselben 14 Fälle mit den unabhängig nachgerechneten Zeitangaben zum ersten freien Bild. Die Relativpositionen, Rohdaten und beabsichtigten Fehler sind im Vergleich der Abgaben überprüfbar. Zwei unabhängige Gutachter bewerteten dieselben Abgaben mit getrennt ausgelosten Kennungen. Sie erhielten die Originalaufgabe, den Bewertungsvorschlag, die Fach- und Quellenbezüge sowie die zur jeweiligen Lösung gehörenden Diagramme. Die Zuordnung zum Prüffall und das andere Urteil blieben während der Bewertung verdeckt.

## Entscheidung nach der letzten Fassung

Alle 112 Einzelpunktwerte und alle 14 Bestehensentscheidungen stimmen zwischen beiden Gutachtern überein. Die Vergleichsregel für den Koeffizienten funktioniert in beiden Gegenproben. Verwendet keine Reihe den eigenen Schätzwert, bleiben 19 Punkte. Verwendet nur eine Reihe ihn, bleiben 21,5. Die vier Formfehler kosten zusammen zwei Punkte.

Beide Gutachter geben das Raster zur Überarbeitung zurück. Für ausdrücklich angegebene Anfangsbedingungen und eine nachvollziehbare Loslassprüfung sind insgesamt nur drei Punkte vorgesehen. Selbst bei vollständigem Ausfall dieser Belege in beiden Reihen bleiben 21 Punkte. Ob Bestehen diesen Teil des Lernziels mindestens einmal belegen muss, ist vor jeder weiteren Fassung zu entscheiden. Bei einer Toleranz von vier Punkten und gleichgewichteten Reihen braucht jede unabhängig geschützte Leistung je Reihe mehr als zwei Punkte. Sollen sowohl die Koeffizientenübereinstimmung als auch die Prüfung der Anfangsbedingungen allein durch ihr Gewicht geschützt sein, benötigen sie zusammen mindestens fünf Gesetzespunkte je Reihe auf dem Halbpunkt-Raster.

Außerdem nennen die Gutachter die Grenzen einer gemeinsamen Anpassung ohne getrennte Reihenschätzung, eine Gleichheitskonvention, die sinnvolle Rundungen ausschließen kann, und die ausdrückliche Absperrung im englischen Arbeitsauftrag. Die Einträge zur semantischen Art und zur erwarteten Obergrenze im automatischen Prüfprotokoll sind separat zu lesen. Beide ordnen die Aufgabe als Prüfung ein. Ohne Untersuchung A bleiben wegen des zusätzlich fehlenden A/B-Vergleichs elf Punkte, also höchstens die verlangten zwölf.

Für die veröffentlichte Fassung gelten ihre bisherigen Landesangebote, APV-201- und Abdeckungsnachweise. Den bytegebundenen Nachweis des Parkens vom 24. November ergänzt die aktuelle Entscheidung. Alle nativen Eingaben und Ausgaben lassen sich mit `python3 verify.py` in diesem Verzeichnis nachprüfen. [Parkentscheidung](parked.actual.json) · [Unabhängige Prüfung des Zeitbezugs](v3/panel-audit/audit.md)

## Fassung 1

Autor war claude-opus-5-5. gpt-6.1-sol entschied revise und gpt-6.2-astra entschied revise.

| Abgabe | Geschriebener Fall | Runde A | Runde B |
| --- | --- | ---: | ---: |
| L7Q4 | Vollständig, eigener Wert 9,81 | 23 · bestanden | 24 · bestanden |
| C2V9 | Vier örtliche Formfehler | 21 · bestanden | 22 · bestanden |
| N8D3 | Eine Grenzvariation fehlt | 22 · bestanden | 23 · bestanden |
| F5W1 | Untersuchung B fehlt | 11,5 · nicht bestanden | 12 · nicht bestanden |
| R3J6 | Untersuchung A fehlt | 11 · nicht bestanden | 11,5 · nicht bestanden |
| U9H2 | Literaturwert als eigenes Ergebnis nach Hinweis beibehalten | 11 · nicht bestanden | 12 · nicht bestanden |
| K4P8 | A schwach begründet, B mit abweichendem Koeffizienten | 21 · bestanden | 21 · bestanden |
| E6S5 | A ohne eigenen Reihenschätzwert | 20 · bestanden | 21 · bestanden |
| V1M7 | Gemeinsamer Fit zum Vergleich | 23 · bestanden | 24 · bestanden |
| J8B4 | Gemeinsamer Fit ersetzt beide Schätzwerte | 17,5 · nicht bestanden | 18,5 · nicht bestanden |
| Q2X6 | Grenzvariation fehlt, vier Formfehler | 20 · bestanden | 21 · bestanden |
| H6T9 | Grenzvariation fehlt, fünf Formfehler | 19,5 · nicht bestanden | 20,5 · bestanden |

Befunde der Gegenprüfung

- b-actual-data: 2090 UTF-16 code units exceeds coach limit 2000
- b-initial-law: 2007 UTF-16 code units exceeds coach limit 2000
- b-boundaries-comparison: 2145 UTF-16 code units exceeds coach limit 2000
- a: reviewer decision revise
- a: Den Bestehensnachweis für die unmittelbaren Zielbestandteile absichern: Gegenwärtig können beide Gesetze oder sämtliche grafischen Bestimmungen fehlen und dennoch mindestens 20 BE entstehen. Eine nachvollziehbare experimentelle Kette muss verbindlich erhalten bleiben; ergänzende Facetten und kleine Versehen dürfen weiterhin offenbleiben. | Die mehrfachen Folgen eines fehlenden ausdrücklich bezeichneten Reihenschätzwerts überarbeiten. L06 verliert dafür insgesamt 3 BE, L12 für zwei solche Lücken 5.5 BE. Die Behauptung nahezu vollständiger Kriterienentkopplung muss entweder umgesetzt oder entsprechend eingeschränkt werden. | Die Umfangs-Facette eindeutig auf die Beteiligung gültiger Läufe am Reihenschätzwert beziehen, falls deren unbegründetes Weglassen abgewertet werden soll. L09 erfüllt gegenwärtig die wörtliche Einzelwertalternative vollständig. | Die pauschale Zweipunktewirkung einer Koeffizientenabweichung auf ihre Vereinbarkeit mit der Toleranz kleiner Versehen prüfen. Dabei unbekannte Herkunft weiterhin offenlassen; weder einen Abschreibfehler noch einen Literaturwert aus der Zahl erschließen. | Die verlangte Skalenteilung im Arbeitsauftrag ausdrücklich benennen oder die Bewertungsanforderung an die tatsächlich verlangte Skalendokumentation anpassen. Bei diesen Abgaben fehlt die Teilung; die Ablesegrenze darf nicht als Teilungsangabe ergänzt werden. | Rechenzwischenwerte und behauptete Messpräzision ausdrücklich unterscheiden und die Präzisionsregel operationalisieren. DE „Stellenzahl“ und EN „decimal places“ einschließlich der Halbierung und Rundung eindeutig angleichen. | Den gemischten Fall eines zugleich als Buchwert und eigenes Ergebnis bezeichneten Werts konsistent definieren, insbesondere für den B-Vergleich nach der A-Sanktion in L07. Die globale Sanktion transparent von der Anerkennung tatsächlich gezeigter Einzelleistungen unterscheiden. | Beim A/B-Vergleich ausdrücklich auch eine fachlich begründete Unvereinbarkeit innerhalb der gewählten Unsicherheiten als möglichen richtigen Schluss zulassen.
- a: not practice assessment
- a: omission capacity
- a L7Q4 control: fully achieved estimate 9.81 accepted
- a C2V9 four_slips: 4 slips charged once
- a K4P8 A_weak_estimate_B_law_mismatch: weak derivation isolated; mismatched coefficient gets 1/3
- b: reviewer decision revise
- b: Die Bestehensregel muss den Nachweis des gesamten beanspruchten Lernziels sichern. Mindestens ein aus eigenen grafisch ausgewerteten Daten gewonnenes g muss in einem tatsächlich formulierten Gesetz mit passenden Anfangsbedingungen verwendet werden. Die Toleranz für eine einzelne offene Facette in der anderen Reihe kann dabei erhalten bleiben. | Die Mehrfachwirkung eines fehlenden Reihenschätzwerts ausdrücklich regeln. Bei L06 betrifft sie g-Bestimmung, Gesetz und Abschlussvergleich. Die Aussage über die einzige Verbindung zwischen Kriterien ist zu korrigieren. Die Kappung auf 1 BE sollte so überarbeitet werden, dass erbrachte Loslassprüfung und Gesetzeselemente einzeln erkennbar gewertet werden. | Für den Umfang der g-Bestimmung festlegen, ob die Zahl der grafisch ausgewerteten Läufe oder die Zahl der in den abschließenden Schätzwert eingehenden Läufe zählt. L12 erfüllt die erste Bedingung für alle drei Läufe und die zweite nur für A1. Die Regel sollte zugleich festlegen, auf welchen Schätzer sich die Grenzvariation beziehen soll. | Für den B-Vergleich nach einer A-Sonderwertung festlegen, ob eine zugleich als Buchwert und eigenes Ergebnis bezeichnete Zahl als Vergleichszahl zählt. Die Formulierungen »nur als Literaturwert« und »als Literaturwert« führen bei L05 zu unterschiedlichen B-Punkten. Das Verbot, eine unbekannte Herkunft zu erschließen, sollte bestehen bleiben. | In beiden Sprachen die geforderte Skalenangabe, die Sicherung des Fallbereichs und die Zahl der Nachkommastellen gleich präzise formulieren. Beim Zeitnullpunkt zwischen erstem freien Bild und Mitte des Freigabeintervalls unterscheiden. Für den Höhenvergleich sollte auch ein anhand beider Unsicherheiten begründeter Befund klar unvereinbarer Schätzwerte ausdrücklich volle Vergleichspunkte erhalten können.
- b: not practice assessment
- b: omission capacity
- H6T9: pass/fail disagreement

[Beide Originalurteile, Einzelpunkte und Nachweise](v1/review-disposition.actual.json)

## Fassung 2

Autor war claude-opus-5-5. gpt-6.1-sol entschied revise und gpt-6.2-astra entschied revise.

| Abgabe | Geschriebener Fall | Runde A | Runde B |
| --- | --- | ---: | ---: |
| L7Q4 | Vollständig, eigener Wert 9,81 | 23,5 · bestanden | 23 · bestanden |
| C2V9 | Vier örtliche Formfehler | 21,5 · bestanden | 21,5 · bestanden |
| N8D3 | Eine Grenzvariation fehlt | 23 · bestanden | 23 · bestanden |
| F5W1 | Untersuchung B fehlt | 11,5 · nicht bestanden | 11,5 · nicht bestanden |
| R3J6 | Untersuchung A fehlt | 10,5 · nicht bestanden | 10,5 · nicht bestanden |
| U9H2 | Literaturwert als eigenes Ergebnis nach Hinweis beibehalten | 12 · nicht bestanden | 11,5 · nicht bestanden |
| K4P8 | A schwach begründet, B mit abweichendem Koeffizienten | 20 · bestanden | 20 · bestanden |
| E6S5 | A ohne eigenen Reihenschätzwert | 20 · bestanden | 20,5 · bestanden |
| V1M7 | Gemeinsamer Fit zum Vergleich | 23,5 · bestanden | 23,5 · bestanden |
| J8B4 | Gemeinsamer Fit ersetzt beide Schätzwerte | 16,5 · nicht bestanden | 17,5 · nicht bestanden |
| Q2X6 | Grenzvariation fehlt, vier Formfehler | 21 · bestanden | 21 · bestanden |
| H6T9 | Grenzvariation fehlt, fünf Formfehler | 20,5 · bestanden | 20,5 · bestanden |
| D3Z7 | Beide Gesetzeskoeffizienten weichen von den eigenen Schätzwerten ab | 18,5 · nicht bestanden | 18,5 · nicht bestanden |
| T9G2 | Nur B weicht im Gesetz vom eigenen Schätzwert ab | 21 · bestanden | 21 · bestanden |

Befunde der Gegenprüfung

- a: reviewer decision revise
- a: Den Konflikt bei L10 und L12 ausdrücklich auflösen: Welche nachgerechneten und angegebenen Varianten genügen ohne Reihenschätzwert? Die Festlegung, hierfür außer 0,5+2,5 BE nichts weiter abzuziehen, muss mit der Forderung nach Bezug auf Einzelbestimmungen vereinbar sein. Keine fehlenden Einzelergebnisse beim Benoten ergänzen. | Die einmalige Zuordnung eines gemeinsamen Versehens festlegen, wenn sein Ursprungskriterium bereits durch eine vorrangige Regel null Punkte erhält. L02 darf nicht je nach stillschweigender Zuordnung 12 oder 11,5 BE erhalten. | Den Aussageumfang des Bestehens mit dem einzigen Lernziel abstimmen. Die gegenwärtigen Übereinstimmungspunkte schützen die numerische Übernahme stark, lassen aber vollständig fehlende explizite Anfangsbedingungen und Loslassprüfungen in beiden Reihen rechnerisch mit Bestehen vereinbar. Dafür ist eine transparente fachliche Überarbeitung erforderlich; die vorliegenden Abgaben wurden noch nach dem bestehenden Raster bewertet. | Die erklärte Doppelbetroffenheit eines fehlenden Schätzwerts mit zusammen 3 BE transparent als Verknüpfung zweier Kriterien ausweisen und fachlich begründen. Ebenso die zusätzliche Wirkung fehlenden A-Materials auf das B-Vergleichskriterium kenntlich machen; nominell gleiche 12-BE-Pakete sind dadurch nicht unabhängig. | Die Unsicherheitskombination fachlich absichern: Eine quadratische Kombination darf bei gemeinsamen systematischen Beiträgen nicht allein deshalb als ausreichend gelten, weil der Schluss zum gewählten U passt. | Die englische Sicherheitsanforderung an die ausdrücklich verlangte Absperrung der deutschen Fassung angleichen. | Freigabestatus und Review-Verweise erst nach Auflösung dieser Befunde aktualisieren. Frühere Annahmevermerke ersetzen weder die Prüfung des geänderten Rasters noch einen Lernendenversuch.
- a: not practice assessment
- a: omission capacity
- a K4P8 A_weak_estimate_B_law_mismatch: weak derivation isolated; mismatched coefficient receives only independently earned law points
- a C2V9 four_slips: 4 slips charged once
- a T9G2 one_explicit_law_mismatch: one explicit mismatch gives 21.5/24
- a L7Q4 control: fully achieved estimate 9.81 accepted
- a E6S5 A_no_series_estimate: no independent estimate
- a J8B4 pooled_substitution: pooled fit cannot replace own estimates
- a D3Z7 both_explicit_law_mismatches: two explicit mismatches give 19/24
- b: reviewer decision revise
- b: Die Ergebnisangabe und die Anwendung des Messwerts im Gesetz als unterscheidbare Leistungen bewerten. Für den Fall L10 ausdrücklich regeln, wie ein mit den eigenen Läufen verträglicher Koeffizient bei fehlender Ergebnisbezeichnung zählt. Die unbekannte Herkunft muss offenbleiben. Für die ausdrücklich gemeinsame Ersetzung beider Werte in L09 ist der Sachverhalt dagegen belegt. | Für L05 verbindlich entscheiden, ob ein ausdrücklich aus dem Buch eingesetzter A-Wert im B-Vergleich als eigener Reihenwert zählen kann. Vergleichsmaß und Sanktionsregel müssen dieselbe Antwort geben. Die pauschale Nullsetzung auch nachgewiesener Rohdaten und Fits sollte durch eine Bewertung der tatsächlich betroffenen A-Leistungen ersetzt oder als eigenständige Bewertungsentscheidung begründet werden. | Den Buchungsort eines gemeinsamen Versehens festlegen, wenn das zuerst behandelte Kriterium bereits null Punkte hat. Für Grenzvariationen ohne bezeichneten Reihenschätzwert klarstellen, ob ein zusammengefasster Variantenwert bei identischen Zeitrastern genügt oder ob geänderte Einzelwerte ausgewiesen werden müssen. | Die Aussage zum Bestehen auf die tatsächlich gesicherten Leistungen begrenzen. Soll ein vollständiger Satz von Anfangsbedingungen zwingend nachgewiesen sein, müssen die entsprechenden fachlichen Belege stärker gewichtet werden. Die Toleranz für eine einzelne fehlende Grenzvariation und für einmalig gezählte Formfehler sollte erhalten bleiben. | Die Rundungsregel mit der Zusage zur Stellenzahl abstimmen. Gegenüber ĝ=9,73 gilt c=9,7 als gleich, c=9,70 bei identischem Zahlenwert als ungleich. Damit können allein durch eine angehängte Null 2,5 BE wechseln. Außerdem die Sicherheits- und Skalenformulierungen in DE und EN präzisieren und die Voraussetzungen der gewählten Unsicherheitskombination benennen.
- b: not practice assessment
- b: omission capacity
- b C2V9 four_slips: 4 slips charged once
- b T9G2 one_explicit_law_mismatch: one explicit mismatch gives 21.5/24
- b K4P8 A_weak_estimate_B_law_mismatch: weak derivation isolated; mismatched coefficient receives only independently earned law points
- b J8B4 pooled_substitution: pooled fit cannot replace own estimates
- b E6S5 A_no_series_estimate: no independent estimate
- b D3Z7 both_explicit_law_mismatches: two explicit mismatches give 19/24
- b L7Q4 control: fully achieved estimate 9.81 accepted

[Beide Originalurteile, Einzelpunkte und Nachweise](v2/review-disposition.actual.json)

## Fassung 3

Autor war claude-opus-5-5. gpt-6.1-sol entschied revise und gpt-6.2-astra entschied revise.

| Abgabe | Geschriebener Fall | Runde A | Runde B |
| --- | --- | ---: | ---: |
| L7Q4 | Vollständig, eigener Wert 9,81 | 24 · bestanden | 24 · bestanden |
| C2V9 | Vier örtliche Formfehler | 22 · bestanden | 22 · bestanden |
| N8D3 | Eine Grenzvariation fehlt | 23,5 · bestanden | 23,5 · bestanden |
| F5W1 | Untersuchung B fehlt | 12 · nicht bestanden | 12 · nicht bestanden |
| R3J6 | Untersuchung A fehlt | 11 · nicht bestanden | 11 · nicht bestanden |
| U9H2 | Literaturwert als eigenes Ergebnis nach Hinweis beibehalten | 12 · nicht bestanden | 12 · nicht bestanden |
| K4P8 | A schwach begründet, B mit abweichendem Koeffizienten | 20,5 · bestanden | 20,5 · bestanden |
| E6S5 | A ohne eigenen Reihenschätzwert | 21 · bestanden | 21 · bestanden |
| V1M7 | Gemeinsamer Fit zum Vergleich | 24 · bestanden | 24 · bestanden |
| J8B4 | Gemeinsamer Fit ersetzt beide Schätzwerte | 18 · nicht bestanden | 18 · nicht bestanden |
| Q2X6 | Grenzvariation fehlt, vier Formfehler | 21,5 · bestanden | 21,5 · bestanden |
| H6T9 | Grenzvariation fehlt, fünf Formfehler | 21 · bestanden | 21 · bestanden |
| D3Z7 | Beide Gesetzeskoeffizienten weichen von den eigenen Schätzwerten ab | 19 · nicht bestanden | 19 · nicht bestanden |
| T9G2 | Nur B weicht im Gesetz vom eigenen Schätzwert ab | 21,5 · bestanden | 21,5 · bestanden |

Befunde der Gegenprüfung

- a: reviewer decision revise
- a: Die Bestehensabsicherung so überarbeiten, dass mindestens eine vollständige zusammenhängende Zielkette einschließlich ausdrücklich angegebener Anfangsbedingungen und nachvollziehbarer Loslassprüfung nachgewiesen sein muss. Das kann durch offen geänderte Gewichte, Obergrenzen oder Bestehensregeln geschehen; eine neue Hürde darf nicht rückwirkend in die vorliegenden Bewertungen hineingelesen werden. | Die pauschale Vier-Kriterien-Nullsetzung bei beharrlicher Fehlbehauptung fachlich begrenzen. L14 widerlegt die Begründung, vorhandene eigene Daten und grafische Laufbestimmungen könnten dadurch überhaupt nicht mehr als experimentelle Leistungen gelesen werden. Die unzulässige Ergebnisbehauptung und tatsächlich gezeigte Teilkompetenzen müssen getrennt ausgewiesen werden. | Die Aussage zur einmaligen Nachweiszuordnung an die ausdrücklich vorhandene Verknüpfung anpassen: Ein fehlender Reihenschätzwert betrifft 0.5 BE Ergebnis und 2.5 BE Übereinstimmung. Diese Doppelbetroffenheit muss transparent bleiben und darf keine weiteren Abzüge bei Grenzen, Vergleich oder konsequenter Folgearbeit auslösen. | Das Herkunftsverbot unverändert erhalten und konsequent anwenden: Insbesondere L08 erlaubt keine Entscheidung zwischen Literaturübernahme und eigener, aber nicht ausdrücklich ausgewiesener Zusammenfassung. Gesetzesabweichungen in L02, L07 und L13 belegen ebenfalls keine Quelle und keine beharrliche Fehlvorstellung. | Die englische Aufbauvorgabe bereits im Aufgabentext ausdrücklich um die Absperrung ergänzen, damit dieselbe Sicherheitsanforderung ohne nachträgliche Lösungsauslegung erkennbar ist. | Nach der Rasterkorrektur die Freigabe und die Aussage zum durch Bestehen belegten Lernziel neu prüfen. Die bisherigen Review-Verweise ersetzen weder diese Prüfung noch einen Nachweis von Lernwirksamkeit.
- a: not practice assessment
- a: omission capacity
- b: reviewer decision revise
- b: Die Grenzvariation in beiden Sprachfassungen eindeutig regeln. Für einen ausdrücklich gewählten Einzellauf wie bei L04 muss dessen verändertes Ergebnis angegeben sein. Für Fälle ohne nominalen Reihenschätzwert ausdrücklich festlegen, ob das berichtete variierte Reihenmittel allein genügt. Damit wird L05 und L14 dieselbe Regel nachvollziehbar zugänglich. | Für den A/B-Vergleich ausdrücklich festlegen, dass ein Vergleich aller zugeordneten Laufdifferenzen oder ihrer nachgewiesenen Extremwerte mit beiden Unsicherheiten anerkannt wird. L05 ersetzt die getrennten Schätzwerte durch einen gemeinsamen Fit, führt aber zusätzlich einen eigenen quantitativen Vergleich der Läufe durch. L14 prüft sogar jede einzelne Differenz. Die heutige Definition eines im Schluss vorgelegten Reihenwerts lässt eine abweichende Benotung bis hin zu einer anderen Bestehensentscheidung zu. | Die Aussage zur einmaligen Bewertung und die Angabe „genau 3 BE“ präzisieren. Ein fehlender ĝ_R betrifft zwei ausgewiesene Teilentscheidungen. 3 BE sind der Verlust bei sonst erreichbarer Ergebnis- und Übereinstimmungspunktzahl. Bereits verlorene oder gedeckelte Punkte können kein zweites Mal entfallen. Die beleggebundene Quellenregel beibehalten. | Die Gewichtung der Gesetzespunkte oder die ausgewiesene Zielaussage so fassen, dass klar ist, wann mindestens ein Gesetz mit angegebenen und geprüften Anfangsbedingungen belegt ist. Bei unveränderter Gewichtung muss das Kriterienprofil diesen Teil des direkten Lernziels bestätigen. Die Toleranz für einen einzelnen ausgelassenen Wiederholungsschritt und für örtliche Formfehler soll erhalten bleiben. | Die Gleichheitskonvention als Bewertungskonvention kennzeichnen und mit der Zulassung sinnvoller Rundungen abstimmen. Beispielsweise kann der Koeffizient zu 9,73 m/s² von 4,865 auf 4,9 m/s² gerundet werden. Die veröffentlichte Regel prüft nach dem Verdoppeln 9,8 gegen 9,73 und verwirft diese Darstellung. Ein ausdrücklich übertragener oder gerundeter Koeffizient und ein Koeffizient unbekannter Herkunft brauchen eine nachvollziehbare Behandlung. | Im englischen Lernendentext die Absperrung ausdrücklich nennen und in beiden Lernendentexten die bekannte Kalibrierlänge der Skala eindeutig bezeichnen. So stehen die bewerteten Aufbauanforderungen bereits in der Aufgabe.
- b: not practice assessment
- b: omission capacity

[Beide Originalurteile, Einzelpunkte und Nachweise](v3/review-disposition.actual.json)

## Geltungsbereich

Die einzige fachliche Zielzuordnung ist der eigene Fallversuch. Die Aufgabe ist in Hessen in der E-Phase und in Sachsen in Jahrgang 9 jeweils für beide Kursprofile als freiwilliges Angebot geführt. Der eigene Versuch erhält keine hessische E.1-Plananrechnung. Eine persönliche Prüfungsleistung oder Übertragung erworbener Ergebnisse ist mit diesem Nachweis nicht verbunden.

[Entscheidungsnachweis](parked.actual.json)
