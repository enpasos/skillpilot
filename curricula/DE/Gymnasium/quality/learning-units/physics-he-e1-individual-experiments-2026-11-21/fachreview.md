# Unabhängiges KI-Fachreview: zwei freiwillige praktische E.1-Einzelaufgaben

**Prüfzeit:** 21.11.2026, 11:24:44 MEZ (Europe/Berlin, UTC+01:00).
**Reviewer:** unabhängiger KI-Fachreviewer, separater Agent `/root/praktikafachentscheid`.
**Unabhängigkeit:** Ich habe keine der geprüften Aufgaben verfasst, nachgebessert oder im Repository verändert. Die Testabgaben unten sind von mir unabhängig konstruierte Gegenproben; sie sind keine Behauptung über tatsächlich durchgeführte Schülermessungen.

## Entscheidung und genaue Bindung

**Beide Aufgaben werden fachlich freigegeben**, jeweils als freiwillige praktische Aufgabe zur individuellen Leistungsfeststellung am ausdrücklich zugeordneten Lernziel. Zwingende Textkorrekturen: **keine**. Die Entscheidung gilt ausschließlich für folgende Aufgabenobjekte einschließlich beider Sprachfassungen und sämtlicher `evidenceCriteria`:

| Lernziel | SHA-256 des vollständigen Aufgabenobjekts |
| --- | --- |
| `971beafa-6ba5-4c82-ac8b-7ebf66eec3dd` – Gleichförmige Bewegung und Geschwindigkeit | `21df8a4027457a1ba03da6f7120dbfa7be3540aef286eb1c4cfefbe8558a501b` |
| `09029573-864f-40ca-bf8a-cee7bf6dcb73` – Freier Fall experimentell untersuchen | `1eb92e47e437406c9388eae01b2806eebcc345af994de1ac792073e9d2f4c099` |

Eingabedatei: `curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json`. Die zwei gebundenen Aufgaben sind die letzten zwei Elemente von `exercises`. Hashverfahren: Python `json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode('utf-8')`, dann SHA-256. Die Archivfassung verweist auf die Aufgaben in der Eingabedatei. Für die Reproduktion das jeweilige Objekt anhand seiner `goalId` wählen. Der [maschinenlesbare Nachweis](review.json) enthält zusätzlich die Bindungen der beiden kanonischen Zielobjekte.

Die drei bereits vorhandenen Rechenübungen sind nicht Prüfgegenstand. A–D bleiben der gemeinsame Einheitenauftrag; dieses Review ersetzt dessen Prüfung nicht. Die Freigabe behauptet weder eine zusätzliche Alters-/Kursfreigabe noch eine vollständige Abdeckung von E.1 durch diese zwei Einzelaufgaben. Sie nimmt keine Laufzeitentscheidung über Mastery vor.

## Geprüfte Quelle und Ziele

Gelesen wurden die beiden eigenständigen Zieltexte aus `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`, die Original-PDF `curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf` direkt auf PDF-Seite 30 (gedruckt ebenfalls S. 30) sowie die Passage `he-physics-sekii:E.1` und die betreffenden Source-Ziele in `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json`. Die Extraktion stimmt hinsichtlich dieser Anforderungen mit dem Original überein. Der Originaltext verlangt beim gleichförmigen Fall neben der Geschwindigkeitsdefinition eine handlungsorientierte Messung ihres Betrages. Beim freien Fall umfasst er Datenerhebung, grafische Darstellung, Bestimmung von g, Diskussion der Literaturabweichung und mathematisches Zeit-Ort-Modell. Dies sind Anforderungen der Quelle; die beiden konkreten Aufgabenformulierungen sind SkillPilot-Aufgaben und werden hier nicht als amtlich verfasste Aufgaben ausgegeben.

Original-PDF SHA-256: `46f3e728b5d9fc6b5901f191247951a4a9d9c3df641afa60ca8b17a2e049813f`.
Source-Extraction SHA-256: `9552cccda78f64503c338ee4f2c6adba2909f9cbdd8a8f3d111b97627ea7c27b`.

## Wagen oder geradliniges Gehen

Die Aufgabe verlangt einen realen eigenen Versuch, eine räumliche Skala, mehrere Zeit-Ort-Messpaare und ein beschriftetes Diagramm. Damit deckt sie auch den experimentellen Bestandteil ab, den eine vorgegebene Datentabelle allein nicht belegen könnte. Ein fachlich begründeter annähernd gleichförmiger Abschnitt, die gerichtete Definition von Geschwindigkeit und der Betrag aus der Steigung sind explizit beobachtbar. Der Unterschied zwischen vorzeichenbehafteter Geschwindigkeit und positivem Betrag ist korrekt.

Der letzte Zeitpunkt wird zunächst zurückgehalten. Zusammen mit dem vierten Kriterium ist dies eine echte Prüfung an einem nicht zur Vorhersage verwendeten Messwert. Die Messung darf nach der Vorhersage im vollständigen Protokoll und Diagramm erscheinen. Ein aus demselben Kontrollzeitpunkt gewonnenes Tempo und dessen anschließendes Rückeinsetzen erfüllt das vierte Kriterium ausdrücklich nicht. Für einen belegten gleichförmigen Abschnitt müssen mehrere Intervalle innerhalb der angegebenen Genauigkeit vergleichbar sein; zwei Punkte allein beweisen die Modellwahl nicht. Die Aufgabe und ihr Hinweis geben mit mehreren Messwerten und einem zweiten Punktepaar dafür einen tragfähigen Rahmen.

Ein Anfahrabschnitt oder eine Tempoänderung ist kein Grund, Daten zu verwerfen oder Gleichförmigkeit zu erfinden. Ein geeigneter Abschnitt kann begründet ausgewählt werden. Fehlt ein solcher und wird trotzdem ein konstantes Tempo behauptet, ist das zweite Kriterium nicht erbracht. Reine Beobachtung des Misslingens ohne experimentelle Bestimmung eines tragfähigen gleichförmigen Abschnitts belegt noch nicht das ganze Ziel; der Versuch kann verbessert werden. Ein von Null verschiedener Zeit-/Ortsanfang und eine umgekehrte Achse sind zulässig, wenn mit Differenzen und konsistenten Vorzeichen gerechnet wird.

### Eigene Testabgabe W1: Bestehen mit umgekehrter Ortsachse

Konstruierte Protokollwerte vor dem Kontrollpunkt, jeweils `(t/s; x/m)`: `(2,00; 1,20)`, `(2,50; 0,95)`, `(3,00; 0,70)`, `(3,50; 0,45)`. Die positive x-Richtung zeigt entgegen der Bewegung. Die Zeiten seien auf etwa 0,02 s ablesbar; die Positionsskala und das Video sind erläutert. Der Kontrollort ist x = 0,20 m, sein zunächst nicht verwendeter Messzeitpunkt t = 4,02 s.

Zwei verschiedene Intervalle ergeben `(0,95−1,20)/(2,50−2,00) = −0,50 m/s` und `(0,45−0,70)/(3,50−3,00) = −0,50 m/s`. Der Betrag ist `0,50 m/s`. Die Gerade und damit die gleichförmige Beschreibung sind innerhalb dieser Daten tragfähig. Aus dem letzten Modellpunkt folgt `Δt = (0,20−0,45)/(−0,50) = 0,50 s`, also `t_vorhergesagt = 4,00 s`. Die Abweichung zur zurückgehaltenen Messung beträgt `0,02 s` und ist mit der angegebenen Zeitauflösung verträglich; sie ist kein Beweis für exakt konstante Geschwindigkeit. Mit Diagramm und nachvollziehbarer Versuchsdokumentation sind alle vier Kriterien erfüllt.

### Eigene Testabgabe W2: Nichtbestehen trotz richtigem Rückeinsetzen

Konstruierte Daten vor dem Kontrollpunkt: `(0 s; 0 m)`, `(1 s; 0,20 m)`, `(2 s; 0,80 m)`, `(3 s; 1,80 m)`, Kontrollpunkt `(4 s; 3,20 m)`, Zeitauflösung 0,01 s. Die Intervallgeschwindigkeiten vor der Kontrolle sind `0,20`, `0,60` und `1,00 m/s`; sie belegen gerade keine gleichförmige Bewegung. Eine Abgabe, die `v = 3,20 m / 4 s = 0,80 m/s` aus dem Kontrollpunkt berechnet und damit eine Ankunft nach `3,20 m / 0,80 m/s = 4 s` als erfolgreiche Vorhersage ausgibt, besteht nicht: Sie verwendet den zurückgehaltenen Wert und verwechselt die mittlere Geschwindigkeit mit einem belegten gleichförmigen Abschnitt. Das zweite und vierte Kriterium fehlen. Auch die bloße Erklärung „Messfehler“ würde die beobachteten systematisch zunehmenden Intervallgeschwindigkeiten nicht einordnen.

## Freier Fall

Die Aufgabe deckt sämtliche in ihrem Zieltext und im einschlägigen KC-Aspekt genannten Handlungen ab: eigener Fallversuch, räumliche und zeitliche Kalibrierung, grafische Auswertung, empirischer g-Wert mit Einheit, Zeit-Ort-Gesetz mit Anfangsbedingungen, zahlenbezogener Vergleich und konkrete Modell-/Messgrenze. Der kleine kompakte Ball und die Messskala in der Bewegungsebene unterstützen die Modellannahmen und begrenzen typische Perspektivfehler. Rechenformeln allein oder fremde Werte sind kein Ersatz für den ersten Nachweis.

Die Musterlösung ist unter ihren ausdrücklich genannten Voraussetzungen korrekt: bei positiver Richtung nach unten und Zeitnull beim Loslassen aus Ruhe gilt `s(t)=s₀+½gt²`; beim **Fallweg** gegen t² beträgt die Steigung g/2. Nach oben positive Ortskoordinaten haben den negativen quadratischen Term. Ein beliebig verschobener Zeitnullpunkt benötigt passende Anfangsbedingungen und im allgemeinen Fall einen linearen Term. Eine freie quadratische Anpassung kann diesen Fall korrekt erfassen. Das dritte Kriterium verhindert, dass eine inkonsistente Nullpunktwahl trotz ungefähr plausiblem g als vollständig bestanden gilt.

Ein großer Abstand zu 9,81 m/s² ist allein kein automatisches Nichtbestehen: Die Kompetenz wird an der eigenen Auswertung und einer konkreten, datenbezogenen Diagnose gemessen. Umgekehrt reicht ein zufällig naher g-Wert ohne Zeitkalibrierung, eigenes Diagramm oder konsistentes Modell nicht. Eine vollständige formale Unsicherheitsfortpflanzung oder ein aufgestelltes Prozentband wird nicht zusätzlich verlangt; eine begründete Auflösungs- oder Perspektivbetrachtung genügt dem hier formulierten Anspruch. Rotations-/Ausdehnungseffekte werden durch das Verfolgen desselben Ballpunkts sachgerecht begrenzt.

### Eigene Testabgabe F1: Bestehen und überprüfbare Nullpunkt-Sensitivität

Konstruierte eigene Messwerte im Reviewtest bei 100 Bildern/s und nach unten positiver Achse: Zeiten `0; 0,10; 0,20; 0,30; 0,40 s`, Positionen `0,300; 0,349; 0,496; 0,741; 1,084 m`. Zeitnull ist das Loslassen, v₀ = 0; der räumliche Ursprung liegt 0,300 m oberhalb der Loslassposition. Die Fallwege sind somit `0; 0,049; 0,196; 0,441; 0,784 m`, die t²-Werte `0; 0,01; 0,04; 0,09; 0,16 s²`.

Die Steigung zwischen den Punkten bei 0,20 s und 0,40 s ist `(0,784−0,196)/(0,16−0,04) = 4,900 m/s²`, folglich `g = 2·4,900 = 9,800 m/s²`. Das Gesetz lautet `s(t) = 0,300 m + (4,900 m/s²)t²`. Der Unterschied zu 9,81 beträgt `−0,010 m/s²`, relativ etwa `−0,102 %`.

Die Genauigkeit ist nicht mit diesen angezeigten Stellen bewiesen: Verschiebt man den angenommenen Loslasszeitpunkt um ein Bild nach hinten und verwendet fälschlich weiterhin einen Ansatz ohne linearen Term, liegen dieselben beiden ausgewählten Punkte bei 0,19 und 0,39 s. Dann ergibt diese Auswertung `g = 2·0,588/(0,39²−0,19²) = 10,1379 m/s²`. Der Vergleich zeigt konkret, dass eine Bildunsicherheit viel größer als die kleine Differenz zum Richtwert wirken kann. Eine Abgabe, die dies nachvollziehbar erklärt, erfüllt den vierten Nachweis ohne übertriebene Genauigkeitsbehauptung. Mit dokumentierter Kamera-/Skalengeometrie und eigenem Diagramm sind die vier Kriterien erfüllt.

Auch der zulässige Randfall lässt sich prüfen: Mit nach oben positivem Ort `y = 1,500 m − Fallweg` und neuer Uhr `τ = t−0,010 s` lautet das passende Gesetz `y(τ) = 1,49951 m − (0,098 m/s)τ − (4,900 m/s²)τ²`. Beim Loslassen liegt `τ = −0,010 s`, dort ist die Geschwindigkeit Null. Der Betrag der Beschleunigung bleibt 9,800 m/s². Eine freie quadratische Anpassung ändert durch die reine Zeitverschiebung den quadratischen Koeffizienten nicht; nur ein fälschlich erzwungener Ruheansatz am neuen Zeitnullpunkt erzeugt hier einen Bias. Genau diese konsistente Behandlung ist mit dem dritten Kriterium vereinbar.

### Eigene Testabgabe F2: Nichtbestehen bei falschem Zeitnullpunkt und inkonsistentem Gesetz

Gleiche konstruierte Fallwege wie oben, aber die Uhr startet 0,050 s vor dem Loslassen: Messzeiten `0,05; 0,15; 0,25; 0,35; 0,45 s`. Das korrekte Modell für den Fallweg ist `d(t)=4,900·(t−0,050)²` mit Einheiten. Eine Gegenabgabe behauptet dagegen Ruhe schon bei t=0, setzt nur den letzten Wert in `d=½gt²` ein und erhält `g = 2·0,784/0,45² = 7,74321 m/s²`, also `d(t)=3,87160t²`.

Dieses Gesetz sagt schon bei der protokollierten Loslasszeit 0,05 s einen Fallweg von etwa `0,009679 m` statt 0 voraus. Bei 0,25 s sagt es etwa `0,241975 m` statt `0,196 m` voraus: Abweichung rund `0,045975 m`. Bei einer dokumentierten räumlichen Ablesegenauigkeit von 0,002 m sind diese Abweichungen nicht mit einer pauschalen Bemerkung „Luftwiderstand/Messfehler“ erklärt. Ohne Korrektur des Zeitnullpunkts oder passenden linearen Term und Anfangsbedingungen sowie ohne datenbezogene Diagnose erfüllt die Abgabe das zweite bis vierte Kriterium nicht vollständig. **Nichtbestehen folgt aus fehlender Modell-/Datenauswertung und inkonsistenten Anfangsbedingungen, nicht aus der bloßen Größe der Abweichung zu 9,81.**

## Sprachäquivalenz und Grenzen der Entscheidung

Deutsch und Englisch verlangen jeweils dieselben Versuche, eigene Daten, Diagramme und Auswertungen. `Geschwindigkeitsbetrag` ist im Englischen sachgerecht `speed`; die gerichtete Größe wird davon getrennt als `signed velocity` beschrieben. Der zurückgehaltene Zeitpunkt ist in beiden Fassungen vom Modell auszuschließen. Beim freien Fall stimmen Ruhebedingung, Zeitskala, Achsenwahl, g-Betrag, Referenzwert sowie die konkrete Fehler-/Modellbetrachtung überein. Das englische `position–time graph` bezeichnet dasselbe Diagramm wie das deutsche Zeit-Ort-Diagramm, mit der Zeit als unabhängiger Achse. Kein fachlicher Informationsverlust oder zusätzlicher englischer Leistungsanspruch wurde gefunden.

Die Kriterien sind als beobachtbare Nachweise brauchbar, wenn sie auf die tatsächliche individuelle Abgabe angewandt werden. Ohne eigene Versuchsdaten oder mit abgeschriebenem Richtwert ist das jeweilige Ziel nicht erbracht. Eine freiwillige Bearbeitung, ein formal ausgefülltes Protokoll oder eine bloße Näherung an den Referenzwert erzeugt keine fachliche Freigabe der Lernendenleistung und keine automatische Änderung von Lernendenresultaten. Dieses Dokument ist ein unabhängiges Inhaltsreview, kein automatisierter Testlauf und keine reale Lernendenprüfung.
