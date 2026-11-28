# Unabhängige Fachprüfung V1 · erste Runde

Ich habe die Aufgabenstellungsfassungen gelesen und zuerst eine [eigene Lösung](independent-assessment-own-solutions.md) gerechnet. Danach habe ich Musterlösungen und Raster gelesen und die sechs Autorenabgaben bewertet. Die Autorenschaft hatte ihre künstlichen Abgaben als A und B beschriftet. Der Prüfauftrag nennt die gewünschte Richtung des Ergebnisses. Die Prüfung war deshalb gegenüber Musterlösung und hinterlegten Punktwerten zunächst getrennt, aber keine verblindete Auswahl der Fälle. Ich habe an keiner dieser Aufgaben mitgeschrieben. Leser- oder Coach-Erprobung fand in dieser Prüfung nicht statt.

## Geprüfte Eingaben

| Datei | SHA-256 |
|---|---|
| `author-assessments.json` | `5c58bae353b6bd92e72a4d3e0876bc03706614d376467f56ef75e8ea575a68ad` |
| `probeabgaben.de.md` | `0ea43e0ee994c41d65da3b0994b81cb0b9eb6cb14b4b9de7017099a6cfd51690` |
| `zeichenprobe-a.svg` | `5d1e30e8868800d090485b9601bcd8a3ef07e184f45feb99620ae28130a6a280` |
| `zeichenprobe-b.svg` | `991f1afc238bb6d9200e29298656e8bf983e8761aa2d9d52f0068d2f1cbd98ff` |
| `review-auftrag.md` | `66c70bdfd3b37ce08476f8b642d300ce2eea9f9b462343716118cb537eb17035` |

Die Quellenkennung bindet jeweils die vollständige zweisprachige Aufgabe, Musterlösung und Bewertung. Der [Wissenskontext](knowledge-context/) sichert für die Zeichenaufgabe nur den Zielknoten, für Betrag 33 Ziele und für Richtungswinkel 36. Die signierten Schritte, Raster und die Einheit 1 m werden in der Zeichenaufgabe eingeführt. Die räumliche Rasteradressierung erfordert nur Lesen und Zählen von Gitterpositionen, keine formale Koordinatenrechnung und keine Trigonometrie. Beim Betrag werden vorzeichenbehaftete komponentenweise Addition, gleiche Winkelschenkelrichtungen, senkrechte Katheten, Pythagoras, Quadrate, Wurzel und Größenvergleich benötigt. Beim Winkel kommen Achsen- und Vorzeichenbezug, rechtwinklige Trigonometrie samt Umkehrung des Tangens und Dezimalrundung hinzu. Winkelkonvention und Taschenrechnermodus stehen in der Aufgabe. In dieser Runde lagen keine mitgelieferten Karten zur Prüfung vor.

## Wertung der sechs Abgaben

| Aufgabe und Abgabe | A | B | C | Gesamt | Bestehensgrenze und Ergebnis |
|---|---:|---:|---:|---:|---|
| Zeichnen A | 4 | 4 | 3,5 | 11,5 | 10/12, bestanden |
| Zeichnen B | 4 | 4 | 1 | 9 | 10/12, verfehlt |
| Betrag A | 4 | 4 | 3,5 | 11,5 | 10/12, bestanden |
| Betrag B | 4 | 4 | 1 | 9 | 10/12, verfehlt |
| Richtungswinkel A | 3,5 | 4 | 3 | 10,5 | 9/11, bestanden |
| Richtungswinkel B | 4 | 4 | 0 | 8 | 9/11, verfehlt |

- **Zeichnen A und B.** Ich habe beide SVG-Dateien als eigenständige Zeichnungen in Chromium gerendert und die tatsächlichen Linienenden geprüft. Beide Raster zeigen D→E mit +3,+1 und E→F mit −2,+2. A zeichnet den rot gestrichelten Pfeil tatsächlich von D nach F und beschriftet den gemeinsamen Ortsmaßstab. Die rekonstruierbare korrekte Endpunktlage und der vorherige Rechenweg machen die abschließenden 4 statt 3 m zum einmaligen Übertragungsfehler in C. B markiert seinen roten Ergebnispfeil tatsächlich von E nach F. Er liegt auf dem zweiten Teilpfeil und verfehlt den Start D. Maßstab und richtige Endpunktabstände tragen den einen verbleibenden Punkt, der falsche Kern wird nicht zusätzlich geahndet. Die Pfeilspitzen sind im Originalrendering erkennbar. [A](independent-browser-zeichenprobe-a.png) · [B](independent-browser-zeichenprobe-b.png)
- **Betrag A und B.** A zeigt in C korrekt √225=15 und erklärt den Richtungs- und Nullfall. Die angehängte 16 kostet einmal 0,5. B zeigt die Beispielsumme und erklärt den nichtverschwindenden Gleichheitsfall, lässt den geforderten Nullfall ausdrücklich offen. Der Deckel begrenzt C auf den Punkt für Summe und Vergleich.
- **Richtungswinkel A und B.** A leitet beide Komponenten exakt her. In der abschließenden Tabelle rundet sie −2√3 als −3,4 statt −3,5. Das kostet einmal 0,5 in A. B hat A und B richtig und schreibt beim Nullvektor 0° zu. Die richtige Nullnorm schützt bei falscher Richtungsbehauptung keinen Punkt, weil C auf null gedeckelt ist.

## Aufgaben und Schutz der Kernleistungen

**Zeichnen — überarbeiten.** Beide Sprachen geben gleiche Rasterdaten, Anfangspunkte, Pfeile, Ortsmaßstab, sichtbare Abgabe und Erläuterungsanspruch. Die Sollwerte des Ergebnisses sind korrekt. A und B haben bei fehlendem sichtbaren Kern jeweils höchstens 1 Punkt, also insgesamt maximal 9. In C gilt das gleichermaßen für fehlenden gerichteten Pfeil und fehlende tragfähige Endpunktbegründung. Die volle Stufe verlangt jedoch denselben Ortsmaßstab. Eine Abgabe kann D→F korrekt erklären, das Raster absichtlich mit 2 m pro Kästchen beschriften und 2/6 m angeben. Sie erhält im aktuellen Raster A=4, B=4, C=3 und besteht mit 11. Der gleiche Deckel muss fehlende oder falsche Maßstabinterpretation erfassen, mit einer Ausnahme für den isolierten Beschriftungs- oder Übertragungsfehler bei anderweitig sichtbarem richtigen Verständnis. So bleiben Ansatz und Maßstab am tatsächlich gezeigten Pfeil prüfbar. Beliebige zulässige D-Lagen und schlüssige Folgepfeile ab dem eigenen E/F sind gleichwertig.

**Betrag — überarbeiten.** Beide Sprachen liefern dieselben senkrechten Komponenten und denselben Maßstab. Pythagoras, Vektorsummen und Normen in der Musterlösung sind richtig. Der Nullvektorfall ist mathematisch korrekt erläutert. Bei fehlender Pythagoras-Anwendung oder rechtem Winkel in A, fehlender Richtungsbegründung in B und vollständig fehlender Bedingung oder Nullfall in C liegt das Maximum jeweils bei 9. Der C-Deckel greift hingegen dem Wortlaut nach nicht, wenn ein Lernender beide Bedingungen lediglich nennt und den Nullfall nicht begründet. Konkret vollständige Beispielrechnung und korrekte Bedingungen mit unbegründeter Behauptung „bei u=0 auch“ können 4+4+3=11 ergeben. Eine bloße allgemeine Eigenschaftsbehauptung ist ebenfalls kein Nachweis dafür, dass Nichtkollinearität und Gegenrichtung die Gleichheit ausschließen. C sollte explizit eine allgemeine geometrische oder algebraische Begründung und die Erklärung des Nullfalls vor dem Deckel verlangen. Anerkennbar sind der geometrische Vergleich des direkten mit dem geknickten Weg und eine algebraische Begründung, sofern die tatsächlich verwendeten Kenntnisse zugelassen sind. Ein Fachwort oder Skalarproduktbeweis ist nicht erforderlich.

**Richtungswinkel — freigabefähig in dieser Fachprüfung.** Gradmaß, positives x, Gegenuhrzeigersinn, Winkelbereich, Rechner und eine Dezimalstelle stimmen zwischen den Fassungen. Der Bezugswinkel, beide Vorzeichen, 233,1° und die undefinierte Richtung des Nullvektors stimmen. Ohne beide trigonometrischen Beziehungen oder Vorzeichenbegründung in A, ohne tragfähige Norm- oder Winkelherleitung in B oder ohne begründeten Nullfall in C sind höchstens 8 von 11 erreichbar. Ein vom negativen y-Strahl gemessener Winkel von arctan(3/4) mit anschließender Umrechnung in 270°−arctan(3/4) ist gleichwertig. Eine bloße Rechnerausgabe ohne begründeten Quadranten und Bezugswinkel genügt nicht. Der Fehlerabzug bei nachvollziehbarem konsistenten Folgefehler betrifft einmal den Ursprung. Eine Folge aus fehlender Kernleistung darf die jeweilige Deckelung nicht umgehen.

Nach dem schriftlichen Urteil habe ich die Herstellerdatei `author-bindings.json` eingesehen. Die erwarteten Punktwerte für die isolierten Fehler entsprechen meiner getrennten Wertung. Der dortige pauschale Höchstwert 9 in C für Stufen 1 und 3 ist wegen der oben konkret gezeigten Lücken für diese Fassung nicht bestätigt.
