# Unabhängige maschinelle Fachprüfung: Raumgeometrie und Kegelformel

Datum: 1. November 2026. **Alle drei exakt gebundenen Inhaltskandidaten erhalten PASS.** Geprüft wurden die mathematischen Aussagen, Modellannahmen, Zielaspekte, Bewertung und Herkunftshinweise sowie die Übereinstimmung der Markdown- und JSON-Texte. Die Autoren haben die anschauliche Flächenannäherung präzisiert, die Kegel-Einzelrubrik auf exaktes und gerundetes Ergebnis abgestimmt und die Herkunft je Variante benannt; diese endgültigen Fassungen wurden erneut geprüft.

| Variante | Ziel-ID | Urteil | Bestehensgrenze |
| --- | --- | --- | --- |
| Raumgeometrische Anwendungen | `2189ca60-bce7-5cb7-9720-ffea24cc7f9d` | PASS | 11/11 |
| Kegel als Pyramiden-Grenzfall | `bc04599b-e498-53c8-96f5-850549bdde4f` | PASS | 6/6 |
| Kombination | `74ece0b9-7ef3-55da-b803-c62df477a69d` | PASS | 16/16 |

Die genaue Dateibindung und der Umfang jedes Urteils stehen in `review.receipt.json`. **Platzierung: bei allen Varianten NOT_REVIEWED.** Länder-, Kurs-, Stufen- und Quellenzuordnungen werden durch diese mathematische Inhaltsprüfung nicht freigegeben.

## 1. Modell und Rechenwerte

Das Modell besteht eindeutig aus einem geraden Zylinder und einem geraden Kreiskegel mit gemeinsamer Achse. Im Achsenschnitt stehen die Zylinderbreite 4 m, seine Höhe 3 m und die Dachhöhe 1,5 m fest. Der Radius ist 2 m; Radius und Durchmesser werden nicht verwechselt. Bei vernachlässigter Wandstärke können dieselben Maße für die modellierte Außenbeschichtung und den Innenraum verwendet werden.

Die Mantellinie ist die Hypotenuse des halben Dachdreiecks: s²=2²+1,5²=6,25, somit s=2,5 m. Der Winkel zur horizontalen Ebene ist der Winkel zur horizontalen Projektion der Mantellinie, hier zur Radiusstrecke. tan(α)=1,5/2 liefert α≈36,8699°. Der Komplementwinkel zur senkrechten Achse wäre eine andere Größe und wird zu Recht ausgeschlossen.

Die Beschichtung umfasst nach der ausdrücklichen Aufgabenfestlegung genau den Zylindermantel und den Kegelmantel. Ihre Flächen betragen 12π und 5π m², zusammen 17π m²≈53,4071 m². Der Boden liegt auf dem Fundament; die gemeinsame Kreisfläche ist eine innere Verbindung und keine Außenfläche. Diese Auswahl ist eindeutig und verhindert Doppelzählung.

Das theoretische Fassungsvermögen ist 12π+2π=14π m³≈43,982297 m³, also etwa 43 982 Liter. 45 000 Liter passen bereits in das ideale Modell nicht; die Differenz beträgt ungefähr 1017,703 Liter. Die Modellannahme, dass bis zur Kegelspitze gefüllt wird, steht ausdrücklich im Text. Ein praktisch nötiger Luftraum und Einbauten können das nutzbare Volumen verringern. Die Lösung behandelt auch den wichtigen Unterschied zwischen festen Innenmaßen und Außenmaßen korrekt: Eine dickere Außenwand kann bei weiterhin fest vorgegebenen Innenmaßen nicht ohne Weiteres vom Innenvolumen abgezogen werden.

Diese Leistungen prüfen repräsentativ das Raumgeometrieziel `6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9`: Körperzerlegung, kombinierte geometrische Beziehungen sowie Längen-, Winkel-, Flächen- und Volumenberechnung in einem zusammenhängenden Sachkontext. Es wird nicht behauptet, jede denkbare Körperkombination oder sämtliche Voraussetzungen einzeln zu zertifizieren.

## 2. Kegelvolumen aus Pyramiden

Die Näherungskörper sind geeignet: Ein regelmäßiges einbeschriebenes Grundvieleck liegt in der Kreisscheibe; ein umbeschriebenes enthält sie. Bei gemeinsamer Spitze und Grundebene liegen deshalb auch die zugehörigen Pyramiden innerhalb beziehungsweise außerhalb des geraden Kreiskegels. Alle Körper besitzen dieselbe feste senkrechte Höhe. Die Pyramidenformel wird als bereits bekannt angegeben und für beide Familien benutzt.

Die ergänzte Kreisring-Erklärung begründet die Annäherung der Grundflächen geometrisch. Bei kleiner werdenden Zentriwinkeln nähert sich der Innenkreisradius des einbeschriebenen Vielecks dem Kreisradius r; ebenso nähert sich der Außenkreisradius des umbeschriebenen Vielecks r. Präziser lassen sich diese Radien unabhängig als r·cos(π/n) und r/cos(π/n) beschreiben. Die verbleibenden Flächenunterschiede liegen in immer dünneren Kreisringen und werden beliebig klein. Diese zusätzliche Formel ist eine Kontrolle des Reviewers, keine nachträgliche Anforderung an Lernende.

Die beiden Pyramidenvolumina sind jeweils ein Drittel ihrer Grundfläche mal dieselbe Höhe. Daher nähern sie sich demselben Wert (1/3)πr²h. Das Kegelvolumen liegt zwischen ihnen. So wird die Formel ohne Zirkelbezug auf eine bereits bekannte Kegelvolumenformel plausibilisiert. Der Faktor ein Drittel kommt aus der ausdrücklich vorausgesetzten Pyramidenformel, nicht allein aus der Flächenannäherung.

Die Aufgabe verlangt ihrem Zielvertrag entsprechend eine nachvollziehbare anschauliche Erklärung, keinen formalen Grenzwertsatz. Die Lösung erfüllt diese Reichweite und ersetzt sie nicht durch die unbegründete Formel „unendlich viele Ecken“. Mit r=2 m und h=1,5 m folgt für das Dach exakt 2π m³ und gerundet 6,28 m³. Die Einzelrubrik verlangt jetzt beide Ergebnisformen.

Damit wird Ziel `50612a57-7b9d-45fd-bc08-e95556444760` sachgerecht geprüft. Die bloße Anwendung der Kegelformel in der Raumgeometrie-Einzelvariante wird zutreffend nicht als eigenständige Herleitung oder als Prüfung dieses zweiten Zieles ausgewiesen.

## 3. Bewertung und Kombination

Die Raumgeometrie-Einzelvariante enthält elf getrennte Ein-Punkt-Nachweise: Modell, rechtwinkliges Dreieck, Mantellinie, Winkelbezug und Winkelwert, Flächenauswahl und Flächenwert, Volumenmodell, Volumen/Einheiten, Entscheidung über 45 000 Liter sowie begründete Modellgrenze. Bei 11/11 kann kein Nachweis fehlen.

Die Kegel-Einzelvariante verlangt fünf Erklärungsschritte und die numerische Anwendung, insgesamt sechs Punkte. Ohne den geometrischen Begründungsblock sind höchstens ein Punkt und ohne die numerische Anwendung höchstens fünf Punkte erreichbar. Die Bestehensgrenze 6/6 erzwingt beide Teile.

Die kombinierte Variante enthält die elf Raumgeometriepunkte und die fünf neuen Herleitungspunkte. Das bereits im Volumenmodell ermittelte Dachvolumen wird nicht als sechster zusätzlicher Punkt doppelt gezählt. 11+5=16 ist korrekt; ohne Raumgeometrieblock sind höchstens fünf und ohne Herleitung höchstens elf Punkte erreichbar. Unter 16/16 können die beiden ausgewiesenen Kompetenzbereiche nicht gegeneinander kompensiert werden.

Fachlich gleichwertige Begründungen und angemessene Rundungen sind ausdrücklich zulässig. Die Vollpunkterubrik belegt, welche Nachweise bei kriterientreuer Bewertung nötig sind. Sie beweist nicht, dass ein realer Coach diese Kriterien bereits zuverlässig angewandt hat.

## 4. Herkunft, Metadaten und technische Kontrollen

Die alte Aufgabe 5, Teilaufgabe 4, enthält einen kegelförmigen Tank mit anderen Maßen in einem gemischten Drohnen-/Tankkontext. Die neue Familie bezeichnet sie ausschließlich als Kontextanregung. Neue Maße, Modellierung, einzelne Aufgabenanteile und Rubriken werden als eigene Ausarbeitung ausgewiesen, nicht als exakter Auszug oder offizielle Prüfung. Die Herkunftsabsätze und Reviewnotizen sind jetzt je Variante präzise. Der Prüfer hat die Ursprungsaufgabe nicht verändert; ihre normalisierte Zielbindung und der Quellhash wurden mit der Autorenevidenz verglichen.

Die jeweiligen `requires`- und `coveredGoalIds`-Listen entsprechen den tatsächlich behandelten Zielverträgen. Vorbereitung und geprüfte Aspekte werden damit nicht allgemein gleichgesetzt. Bestehen erzeugt keine Mastery der Voraussetzungen. AB2 ist für die angeleitete Kombination bekannter Beziehungen und die anschauliche Pyramidenargumentation vertretbar. J10 bleibt Kompatibilitätsmetadatum; die passende lokale Unterrichts- und Prüfungsplatzierung muss gesondert nachgewiesen werden.

Die exakten Flächen- und Volumenkoeffizienten und die Mantellinie wurden mit rationaler Rechnung kontrolliert; Winkel, gerundete Werte und Literdifferenz wurden unabhängig berechnet. Aufgaben- und Lösungstexte in Markdown und JSON sind identisch. Punktesummen und Bestehensgrenzen stimmen. Die endgültigen Formeln wurden unabhängig mit lokalem KaTeX unter `throwOnError: true` und `strict: error` geparst: Raumgeometrie 6+18, Kegelherleitung 6+10, Kombination 8+27 Formeln. Dies ist keine reale Host-Darstellungsprüfung.

## 5. Getrennte Integrationsgrenzen

Die berichteten 22/6/52 Angebotssignaturen, ihre Quellenzuordnungen und die konkrete Variantenauswahl wurden in dieser Inhaltsprüfung nicht erneut validiert. Die Schleswig-Holstein-Holds bleiben ausdrücklich bestehen. Ebenso bleiben die generischen, von mehreren Landesfiltern verwendeten Ansichten, passende Stufen-/Jahrgangsordner und die ausschließliche Auswahl von Original oder passender Variante Gegenstand gesonderter Prüfung.

Keine Variante darf durch diese Faktorisierung ungeprüft zusätzlich zur passenden Ursprungsaufgabe oder zu einer anderen Variante derselben Familie verpflichtend werden. Tatsächliche Targetmitgliedschaft ist keine offizielle Quellenzuordnung. Die drei PASS-Urteile begründen keine menschliche Freigabe, Erprobung, Host-Abnahme, M7-Reife, Bereitstellung oder Veröffentlichung.
