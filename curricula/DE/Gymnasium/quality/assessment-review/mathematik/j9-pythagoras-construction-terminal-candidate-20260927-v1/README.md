# J9 Pythagoras: eigener Konstruktions-Prüfungsweg (Kandidat)

Stand: 27. September 2026. Nichtkanonischer Entwurf ohne Prüfungs- oder D/P/A/M/V-/M7-Freigabe. Die freigegebenen J9-v1/v2-Artefakte und das kanonische Prüfungsziel `fbd97592-d8cc-5de9-a92d-ed2ca4278ce3` bleiben unverändert.

## Befund und vorgeschlagene Route

Die freigegebene J9-Aufgabe 4 berechnet Katheten und Höhe und prüft Pythagoras, verlangt aber keine Konstruktion. Ihre `requires`- und `coveredGoalIds`-Listen nennen dennoch `80956a2c-5811-4021-863e-95675bec31f5` (Konstruktion). `4d78bbcc-89b8-47f0-aa45-516199e4da5d` passt zur dortigen Rechnung. **Ein bloßes `80956a2c… → 4d78bbcc…` entfernt aber den einzigen direkten Prüfungsnachfolger und einzigen Prüfungsbeleg für `80956a2c…`**; die Konstruktionsleistung hätte keinen lokalen Terminalweg mehr.

Die folgende Aufgabe ist ein **separater** Terminalkandidat. Die bisherige Aufgabe 4 bleibt bei 6 BE, die freigegebene J9-v2-Klausur bei 51 BE.

## Lernendenaufgabe: Schablonenstrecke für den Dachbinder (4 BE)

Bei einem rechtwinkligen Dachbinder sind der Höhenabschnitt `p = 9 cm` und die Höhe `h = 6 cm` bekannt. Für eine Schablone wird die exakte Strecke `a = 3√13 cm` benötigt.

Konstruiere mit Lineal und Geodreieck auf Papier eine Strecke **genau dieser Länge**, ohne einen gerundeten Dezimalwert abzumessen. Nutze `p` und `h` als Katheten eines rechtwinkligen Hilfsdreiecks. Markiere den rechten Winkel, beschrifte Katheten und Strecke `a` und begründe die Länge rechnerisch. Reiche Zeichnung und Rechnung ein.

Die eigenständige Aufgabe gibt beide Werte vor, damit sie nicht vom Erfolg in der alten Rechenaufgabe abhängt. Eine Bauanleitung ohne Zeichnung genügt nicht.

## Musterlösung und 4-BE-Rubrik

Zeichne `AB = 9 cm`, errichte in `A` eine Senkrechte mit `AC = 6 cm`, verbinde `B` mit `C` und bezeichne die Hypotenuse `BC` als `a`. Dann gilt

`a² = (9 cm)² + (6 cm)² = 117 cm²`, also `a = √117 cm = 3√13 cm`.

| BE | Beobachtbare Leistung |
| ---: | --- |
| 1 | 9-cm- und 6-cm-Katheten sind maßstäblich gezeichnet und beschriftet. |
| 1 | Die Katheten stehen senkrecht; der rechte Winkel ist richtig markiert. |
| 1 | Die freien Enden sind verbunden und die Hypotenuse als `a` bezeichnet. |
| 1 | Die Rechnung zeigt `9² + 6² = 117` und `√117 = 3√13` mit Einheit. |

Vertauschte Katheten sind zulässig. Vorgeschlagen sind `maxPoints: 4`, `passingPoints: 4`, damit nur die vollständige Zeichnung **mit** exakter Begründung als bestanden gilt; Teilpunkte dienen dem Feedback. Die Schwelle und die Zeichnungsabgabe benötigen Fach- und Hostprüfung.

## Folgen bei einer späteren Integration

1. Erst die Identität von `80956a2c…` entscheiden (`split_review / split_review`). Bei engem KEEP kann die neue Aufgabe nach Review diese ID prüfen; bei Split das neue Konstruktions-Kind. Alte Mastery-Werte nicht automatisch übertragen.
2. Aufgabe, Lösung, Rubrik und echte Zeichnungsabgabe prüfen. Danach eine neue stabile Prüfungs-ID unter `Prüfungen Jahrgangsstufe 9` planen und `requires`, `coveredGoalIds`, GK/LK- und Bundesland-Geltung getrennt festlegen. Eine reine Textoberfläche trägt den Konstruktionsnachweis nicht.
3. Erst mit tragfähigem neuem Terminal die alte Aufgabe 4 auf `4d78bbcc…` umstellen. Dafür `requires`, `coveredGoalIds`, Blueprint und gespeicherte Prüfungsversuche prüfen; v1/v2 durch neue versionierte Dokumentation **nicht überschreiben**. Für die separate Aufgabe bleibt die 51-BE-Klausur unverändert.
4. Vor Rollout Terminalwege, Schema, Scoring, GoalBook-Fingerprints und betroffene D/P/A/M/V-Bindungen gezielt validieren. Dieser Entwurf vergibt keine D-/M7-Gutschrift.

Der neue Aufgabentext ist kein aktueller Konstruktionsnachweis und erhöht weder den strengen D-Zähler noch die M7-Schnittmenge.
