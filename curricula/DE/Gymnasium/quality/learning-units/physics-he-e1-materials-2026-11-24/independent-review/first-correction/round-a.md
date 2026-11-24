**Für beide Fälle empfehle ich den Kandidaten zur Aktivierung für das reguläre Lernen.** Die engen Änderungen sind fachlich korrekt und überwiegend didaktisch begründet. Keine erfordert geänderte Messwerte, Ergebnisse, Zielzuständigkeiten oder Prüfungsregeln.

Das Original ist in beiden Fällen physikalisch weitgehend brauchbar. Beim Material „Beschleunigung und freier Fall“ sind jedoch die unmittelbaren Schrittverweise falsch; beim übergeordneten E.1-Material bleiben Messumfang und verlangte Erklärungen unnötig offen.

Geprüft wurden ausschließlich [original.json](/tmp/e1-t5/materials/a2/original.json), [candidate.json](/tmp/e1-t5/materials/a2/candidate.json) und [part-b.json](/tmp/e1-t5/materials/a2/part-b.json). Es wurde nichts geändert. Der Abruf der [angegebenen Messquelle](https://aldebaran.feld.cvut.cz/vyuka/fyzika_1_oi/Labs/02-Free_Fall_sample.pdf) scheiterte; Quellenidentität, Tabellenübereinstimmung und Apparateauflösung liegen deshalb entsprechend deiner bestätigten Vorgabe zugrunde.

Der vollständige Vergleich ergibt **elf geänderte Textfelder**. Folgende Tabelle erfasst sämtliche darin enthaltenen Einzeländerungen; wiederholte Änderungen der identischen Fallaufgabe sind zusammengefasst.

| Stelle | Exakte Änderung | Urteil zu Original und Kandidat |
|---|---|---|
| Fallmaterial, deutsche Einstiegsszene | „Landestelle des Balls am Tisch“ → „Landestelle des vom Tisch rollenden Balls“ | Kandidat klarer und sachlich passend. Das Original ist missverständlich, aber kein eindeutiger Physikfehler. Aktivierung gerechtfertigt, keine zwingende Sachkorrektur. |
| Fallauswertung, beide Materialkopien, DE | „Überlege“ → „Erkläre“ bei Höhenbezug und Zeitmessung | Kandidat aktivieren. Die Kriterien verlangen bereits eine Erklärung; EN fordert schon „Explain“. Das Original formuliert den abzugebenden Nachweis schwächer. |
| Fallauswertung, beide Kopien, DE/EN | Kontrollpunkt ausdrücklich „nach der Freigabe“ / „after release“ | Kandidat aktivieren. Der Freigabepunkt bei \(t=0\) prüft weder die bestimmte Beschleunigung noch den weiteren Fallverlauf. Für die Prager Tabelle ändert sich nichts; beim eigenen Video wird eine echte Kontrollmessung sichergestellt. |
| Beschleunigungsaufgabe, DE/EN | „voriger Schritt“ / „previous step“ → „früheres Fallprotokoll“ / „earlier fall record“ | Kandidat erforderlich für einen korrekten Ablaufverweis. Unmittelbar vorher steht laut Lernfolge das t-v-Ziel. |
| Dieselbe Aufgabe, DE/EN | „im nächsten Schritt“ / „your next task“ → spätere Prager Auswertung | Kandidat aktivieren. Dazwischen liegen weitere Lernstufen. Das Original beschreibt die Reihenfolge falsch. |
| Dieselbe Aufgabe, EN | „consider“ → „test“ | Beide grundsätzlich akzeptabel; Kandidat gleicht EN an DE „Prüfe“ an. Zwei Messpaare erlauben einen begrenzten Modellvergleich, keinen Nachweis konstanter Beschleunigung während des gesamten Falls. Die Lösung erklärt diese Grenze richtig. |
| Hinweis zur Beschleunigungsaufgabe, DE/EN | Prager Beispiel ausdrücklich benannt; „annähernd“ doppelte Zeit; Auswahl eigener passender Messpaare ergänzt | Kandidat aktivieren. \(403/201\approx2{,}005\), während sich der Weg vervierfacht. Die Präzisierung respektiert Messabweichungen und macht den Hinweis für eigene Daten verwendbar. |
| Wagenaufgabe, DE/EN | „mehrere Marken“ → „mindestens vier Marken“ | Kandidat didaktisch begründet. Nach Zurückhalten der letzten Messung bleiben mindestens drei Punkte, sodass zwei Intervallsteigungen verglichen werden können. Vier Marken sind eine sinnvolle Vorgabe, keine allgemeine physikalische Mindestzahl. |
| Wagenaufgabe, DE/EN | Erklärung des Geschwindigkeitsvorzeichens ergänzt | Kandidat aktivieren. Das passt zum gerichteten Geschwindigkeitsbegriff und zu den bestehenden Nachweiskriterien. Im Original fehlt diese ausdrückliche Aufforderung. |
| Wagenaufgabe, DE/EN | „dort“ / „there“ → „auf dem gleichförmigen Abschnitt“ / „on the uniform section“ | Beide akzeptabel. Kandidat sprachlich eindeutiger; keine notwendige fachliche Änderung. |

Die maßgebliche [Lernfolge des Fallmaterials](/tmp/e1-t5/materials/a2/candidate.json:21) lautet: Messprotokoll → t-v-Diagramm und Fläche → Beschleunigungsmodell → Bewegungsgesetze → Fehlerarten → Unsicherheit → Fallauswertung → Prüfung. Die anders sortierte Übungenliste begründet keine Umordnung. Das übergeordnete E.1-Material enthält keine eigene `guidedStudyOrder`; aus seiner Übungenliste lässt sich keine verbindliche Stufenfolge ableiten.

Die aktuellen Zielbeschreibungen bleiben unverändert. Protokollaufgabe, Beschleunigungsaufgabe und Fallauswertung passen grundsätzlich zu ihren jeweiligen Zielen. Die beiden Orientierungsziele verlangen keinen fachlichen Leistungsnachweis; die Einstiegstexte führen auch keinen solchen ein. Die bereitgestellten authentischen Fremddaten sind als ausdrücklich angebotener Auswertungsweg gerechtfertigt.

Die Rechnungen sind korrekt:

- Aus den ersten vier Prager Punkten ergibt sich die Ursprungssteigung \(4{,}92655\,\mathrm{m/s^2}\), somit \(g\approx9{,}85\,\mathrm{m/s^2}\). Für 90 cm folgen \(0{,}427415\,\mathrm s\); die Differenz zu \(0{,}428\,\mathrm s\) beträgt etwa \(0{,}585\,\mathrm{ms}\). Die Aussage zur Größenordnung der Zeitauflösung stimmt. Auflösung allein ist dabei keine vollständige Messunsicherheit.
- In Teil B passen \(v_x=1{,}60\,\mathrm{m/s}\) sowie \(g=10\) oder \(9{,}81\,\mathrm{m/s^2}\) innerhalb sämtlicher angegebenen Ortsgrenzen. Flugzeit etwa \(0{,}45\,\mathrm s\), ursprüngliche Reichweite etwa \(0{,}72\,\mathrm m\) und verdoppelte Reichweite etwa \(1{,}43\)–\(1{,}44\,\mathrm m\) bleiben richtig.
- Auch die unveränderten Ergebnisse der Zugaufgabe und der Bodenmarkenaufgabe, \(112\,\mathrm{cm}\) beziehungsweise \(0{,}40\,\mathrm s\) und \(0{,}52\,\mathrm m\), stimmen.

**Verbleibende konkrete Nachschärfungen betreffen beide Fassungen:**

1. **Angekündigten Kontrollpunkt abstimmen.** Die Beschleunigungsaufgabe verspricht weiterhin ausdrücklich die spätere Vorhersage für 90 cm. Die Fallauswertung erlaubt dagegen jeden zurückgehaltenen Punkt. Eng entweder beim Prager Weg die 90-cm-Zeile reservieren oder die Ankündigung verallgemeinern. Gegenwärtig ist beispielsweise auch ein korrekt verwendeter 40-cm-Kontrollpunkt zulässig.

2. **Modellannahmen ausdrücklich anfordern.** Die [Fallkriterien](/tmp/e1-t5/materials/a2/candidate.json:94) verlangen versuchsbezogene Annahmen zu \(g\) und Luftwiderstand. Der Arbeitsauftrag sollte diese Erklärung kurz nennen. Die vorgeschlagene zusätzliche Kontrollmessung ist als begründeter Prüfplan zu verstehen; EN fordert ausdrücklich eine Möglichkeit zur experimentellen Überprüfung.

3. **Wagenauftrag vollständig an seine Kriterien anschließen.** Die Vorzeichenerklärung ersetzt noch nicht ausdrücklich die verlangte Definition \(v=\Delta x/\Delta t\). Diese Definition sollte im Auftrag stehen. Außerdem sollte die Kontrollzeit erst nach der Vorhersage in die Auswertung aufgenommen werden; „alle Messpunkte zeichnen“ und gleichzeitig die letzte Zeit zurückhalten lässt die Arbeitsreihenfolge sonst offen. Die [Kriterien](/tmp/e1-t5/materials/a2/candidate.json:291) beschreiben die gewünschte unabhängige Prüfung bereits richtig.

4. **Einzelübungen nicht als vollständigen Zielnachweis behandeln.** Die Bodenmarkenaufgabe ist eine korrekte Modellübung, verlangt aber weder die experimentelle Untersuchung noch das x-y-Diagramm des [aktuellen Wurfziels](/tmp/e1-t5/materials/a2/candidate.json:465). Ebenso fragt die Zugaufgabe nach einer Abweichungsursache, jedoch nicht ausdrücklich nach der Begründung ihrer Modellidealisierungen. Für vollständige Zielnachweise wären entsprechende kurze Arbeitsaufträge nötig.

Teil B ist fachlich tragfähig. **15 von 18 Punkten und ausdrücklich keine Teilmindestpunkte** sind beizubehalten. Grafische Verfahren, nachvollziehbare Fehlerfortführung und begründetes Verdoppeln einer bereits bezifferten Reichweite sind zulässig. Dass die Bodenmarkenübung den Verdopplungsfall nicht vorwegnimmt, ist allein kein Defekt: Dieser Schritt eignet sich als AB2-Transfer.

Allenfalls redaktionell sollte die B1-Stufenrubrik deutlicher sagen, ob höhere Stufen die vorherigen Belege einschließen. Bei B3 wäre eine ausdrückliche Gleichstellung eines vollständig eingesetzten Ausdrucks mit Einheit hilfreich, da der Auftrag einen solchen Ansatz zulässt. Daraus folgt keine begründete Sperre für die vorliegenden Kandidatenänderungen.