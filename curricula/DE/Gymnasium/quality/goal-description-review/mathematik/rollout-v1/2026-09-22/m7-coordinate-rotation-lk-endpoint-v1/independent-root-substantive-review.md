# Unabhängige maschinelle Fachprüfung: Koordinatenachsendrehung

Prüfdatum: 22.09.2026. Reviewer: Codex Root, unabhängig vom Autor-Agenten. Exaktes Serving-Modell nicht offengelegt. Dies ist eine maschinelle Inhaltsentscheidung, keine menschliche Freigabe oder Erprobung.

## Tatsächlich geprüft

Die vollständigen deutschen und englischen Aufgaben, Lösungen und alle 13 Bewertungspositionen in `candidate.json` wurden gelesen. Das aktuelle Ziel `7bd8f022-5002-5610-994c-a9cec1890558`, seine Voraussetzungen und die hessische Q2.5-LK-Quellenabgrenzung wurden gegengeprüft. Der Selbstcheck des Autors ersetzt diese unabhängige Prüfung nicht.

- Die Konvention ist eindeutig: aktive Abbildung im festen rechtshändigen Koordinatensystem, Spaltenvektoren, Linksmultiplikation. Der Blick von der positiven Achsenseite zum Ursprung und die Rechte-Hand-Regel stimmen überein.
- Für die positive Vierteldrehung um z sind die drei Basisbilder e₂, −e₁, e₃. Damit sind die Matrixspalten und A·(2,−1,3)=(1,2,3) korrekt.
- A·(x,y,z)=(−y,x,z) lässt die z-Achse punktweise fest. Die Gleichheit der Quadrate der Normen gilt allgemein; der Schluss auf die nichtnegativen Normen ist korrekt. Die Aufgabe behauptet keine Drehung des Koordinatensystems.
- Für die negative Vierteldrehung um x sind die Basisbilder e₁, −e₃, e₂; B·(2,−1,3)=(2,3,1). Der zweite Versuch startet ausdrücklich vom ursprünglichen Punkt, nicht vom ersten Bildpunkt.
- C·e₁=−e₂ widerlegt die geforderte positive Drehrichtung. C beschreibt die negative z-Vierteldrehung. Feste Achse und Normerhalt allein bestimmen den signierten Winkel nicht. Die Lösung verwechselt notwendige Prüfmerkmale nicht mit einem hinreichenden Richtungsnachweis.
- Die vier Teile verlangen Herleitung, Rechnung, allgemeinen Invariantennachweis, Achsen-/Vorzeichentransfer und Kritik an einem plausiblen Fehlschluss. Die Musterlösung ist nicht exklusiv, gleichwertige Begründungen und Folgefehler sind berücksichtigt.
- 6+5+5+4=20 BE; die 13 Rasterpositionen ergeben ebenfalls 20. Die Bestehensgrenze 10 liegt im zulässigen Intervall. DE und EN stimmen in Daten, Fragestellungen, Lösungen und Bewertung überein.
- Die echte fachliche Coverage ist genau das genannte Rotationsziel. Keine Behauptung, zusätzlich sämtliche Matrix-, Basis- oder Geometriekompetenzen vollständig zu prüfen. Ein Prüfungsendpunkt ist keine neue `curricularAtomic`-Kompetenz.

## Entscheidung und Grenzen

**Fachlicher Aufgabeninhalt: KEEP.** Die Aufgabe kann nach erfolgreicher Scope-/Routenintegration den bestehenden technischen Assessmentstatus `released` erhalten. Diese Inhaltsprüfung genehmigt weder eine Veröffentlichung noch eine menschliche Release-Freigabe und verändert keine Rechte-/Lerndatenverträge.

Die vorgeschlagene rein HE-LK-begrenzte Platzierung ist ausdrücklich noch **nicht** als Gesamtintegration freigegeben: Das Entfernen der falschen 7bd8-Bindung aus der bisherigen 2D-Aufgabe betrifft auch andere bereits bestehende Sichten. Deren bestehende Zielauswahl muss erhalten und ihre Rotationsroute durch einen tatsächlich sichtbaren passenden Endpunkt geschlossen werden. Keine neuen Inhaltsziele in andere Kursprofile einschleusen; kein LK-Inhalt zurück in die korrigierten HE-GK-Sichten. Native Scope-, DAG-, Routen-, SemanticKind- und Maturity-Prüfungen folgen nach dem gezielten Delta.

Die bestehende 81823-Aufgabe wird hier nicht pauschal neu freigegeben. Nur ihre nachweislich falsche 3D-Rotationscoverage wird entfernt; Aufgabentext, Lösung und Punkte bleiben erhalten.
