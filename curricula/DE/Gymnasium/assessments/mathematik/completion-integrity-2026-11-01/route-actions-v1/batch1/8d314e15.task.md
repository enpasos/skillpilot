# Zwei Ebenen: Schnittgerade, echte Parallelität oder Identität

Nicht aktivierter Kandidat; unabhängiges Inhaltsreview steht aus.

Bestehende Prüfungs-ID: `8d314e15-69e9-5af1-a10a-be820b2f821d`. Neue bepunktete Coverage: `6481fc23-d923-5ffc-ba49-f499328f43b8`.

## Aufgabe DE

Untersuche die drei Ebenenpaare im Raum. Stelle jeweils das lineare Gleichungssystem auf, bestimme seine gesamte Lösungsmenge und begründe daraus, ob sich die Ebenen in einer Geraden schneiden, echt parallel oder identisch sind. Eine bloße Skizze oder Vermutung aus den Normalenvektoren genügt nicht.

A (11 BE, davon 3 BE für die begründete Methodenwahl): E₁: x + y + z = 3 und E₂: x − y + z = 1. Wähle vor der Rechnung anhand der Koeffizienten eine geeignete Lösungsstrategie. Vergleiche sie begründet mit einer anderen hier tatsächlich anwendbaren Strategie: Zeige an den konkreten Gleichungen, welche Umformungen die beiden Wege erfordern und warum dein gewählter Weg hier günstiger ist. Eine bloße Methodenbezeichnung genügt nicht. Bestimme anschließend alle gemeinsamen Punkte in Parameterform und prüfe durch Einsetzen, dass deine Gerade auf beiden Ebenen liegt.

B (6 BE): E₃: x + 2y − z = 1 und E₄: 2x + 4y − 2z = 3. Untersuche das LGS und gib die genaue Lagebeziehung an.

C (6 BE): Vergleiche E₃ aus B mit E₅: 2x + 4y − 2z = 2. Untersuche das LGS, beschreibe die gesamte gemeinsame Punktmenge mit zwei freien Parametern und erkläre, warum sie nicht nur eine Schnittgerade ist.

Für das Bestehen sind sowohl die bisherigen drei Lageuntersuchungen als auch eine an der Struktur begründete Methodenwahl mit tragfähigem Alternativvergleich erforderlich. Ohne diesen Vergleich ist die Gesamtbewertung auf 20 von 23 BE begrenzt; bestanden ab 21 BE.

## Task EN

Investigate the three pairs of planes. Set up each linear system, determine its entire solution set, and use that set to justify whether the planes meet in a line, are distinct and parallel, or coincide. A sketch or a guess from the normal vectors alone is insufficient.

A (11 points, including 3 for justified method selection): E₁: x + y + z = 3 and E₂: x − y + z = 1. Before calculating, use the coefficients to select a suitable solution strategy. Compare it with another strategy that actually applies here: show the transformations each route requires for these equations and explain why your choice is more advantageous. Naming a method alone is insufficient. Then give all common points in parametric form and check by substitution that your line lies on both planes.

B (6 points): E₃: x + 2y − z = 1 and E₄: 2x + 4y − 2z = 3. Investigate the system and state the precise relationship.

C (6 points): Compare E₃ from B with E₅: 2x + 4y − 2z = 2. Investigate the system, give the entire common point set with two free parameters, and explain why it is not merely an intersection line.

Passing requires the original three relationship investigations and a structurally justified method choice with a valid comparison. Without that comparison the total is capped at 20 out of 23 points; the passing score is 21.

## Musterlösung DE

Methodenvergleich zu A: Beim Subtrahieren der zweiten Gleichung von der ersten fallen wegen der gleichen Koeffizienten von x und z beide Unbekannten sofort weg: 2y = 2. Das Additions-/Eliminationsverfahren liefert daher mit einer einzigen Zeilenkombination y = 1. Eine anwendbare Alternative ist das Einsetzungsverfahren: Aus E₁ folgt x = 3 − y − z; in E₂ eingesetzt ergibt dies (3 − y − z) − y + z = 1, also 3 − 2y = 1. Auch dieser Weg ist richtig, erfordert hier aber erst das Freistellen und Einsetzen eines Terms. Die direkte Subtraktion nutzt die Koeffizientenstruktur kürzer. Andere tragfähige Methodenpaare mit konkretem, sachlich richtigem Vergleich sind gleichwertig; Gauß ist selbst ein Eliminationsverfahren und darf nicht ohne konkreten Mehrschritt als grundsätzlich schlechter dargestellt werden. Cramers Regel für eine reguläre quadratische Matrix ist bei zwei Gleichungen mit drei Unbekannten keine passende Alternative.

A: Subtraktion der zweiten von der ersten Gleichung ergibt 2y = 2, also y = 1 und x + z = 2. Mit z = t ∈ ℝ ist die gesamte Lösungsmenge X = (2|1|0) + t(−1|0|1). Die Probe liefert (2 − t) + 1 + t = 3 und (2 − t) − 1 + t = 1 für jedes t: Die Ebenen schneiden sich in dieser Geraden.

B: Die linke Seite von E₄ ist das Doppelte der linken Seite von E₃, die rechte Seite müsste dann aber 2 statt 3 sein. Das LGS liefert den Widerspruch 0 = 1 und hat keine Lösung. Die proportionalen Normalen bei unterschiedlichen Ebenengleichungen bedeuten echte Parallelität.

C: E₅ ist einschließlich der rechten Seite genau 2E₃; die zweite LGS-Zeile ist redundant (0 = 0). Setze y = s und z = t, dann x = 1 − 2s + t. Die gesamte Lösungsmenge ist X = (1|0|0) + s(−2|1|0) + t(1|0|1), s,t ∈ ℝ. Die unabhängigen Richtungen spannen eine Ebene auf. Beide Ebenen sind identisch, nicht nur entlang einer Geraden gleich.

## Solution EN

Method comparison for A: Subtracting the second equation from the first immediately eliminates both x and z because their coefficients agree, leaving 2y = 2. Thus elimination gives y = 1 in one row combination. A valid alternative is substitution: solve E₁ for x = 3 − y − z and substitute into E₂ to get (3 − y − z) − y + z = 1, hence 3 − 2y = 1. This is correct but first requires isolating and substituting an expression. Direct subtraction exploits the structure with less written work. Accept other valid method pairs with a concrete correct comparison. Gaussian elimination is itself elimination; it is not inherently inferior. Cramer’s rule for a nonsingular square matrix does not apply to this system of two equations in three unknowns.

A: Subtracting the second equation from the first gives 2y = 2, so y = 1 and x + z = 2. Letting z = t ∈ ℝ gives the entire solution set X = (2,1,0) + t(−1,0,1). Substitution gives (2 − t) + 1 + t = 3 and (2 − t) − 1 + t = 1 for every t: the planes intersect in this line.

B: The left side of E₄ is twice that of E₃, but the right side would need to be 2 rather than 3. The system yields 0 = 1 and has no solution. Proportional normals with different plane equations mean the planes are distinct and parallel.

C: E₅ is exactly 2E₃ including its right side, so the second system row is redundant (0 = 0). Let y = s and z = t; then x = 1 − 2s + t. The entire solution set is X = (1,0,0) + s(−2,1,0) + t(1,0,1), s,t ∈ ℝ. The independent directions span a plane. The two planes coincide, rather than meeting only in a line.

## Normale Bewertungsrubrik

- `plane_plane_a_method_comparison`: 3 BE — A: 1 BE für anwendbare Methodenwahl, 1 BE für konkreten Strukturvorteil (bei direkter Subtraktion gleichzeitiger Wegfall von x und z), 1 BE für einen durch konkrete Umformungen belegten Vergleich mit einer plausiblen Alternative. Ohne strukturell begründete Wahl UND tragfähigen Alternativvergleich höchstens 20/23 BE insgesamt, also unter der Bestehensgrenze 21. Die bisherigen A-Kernleistungen behalten ihre 8 BE und ihre 5/8-Kappung; einschließlich Methode dann höchstens 8/11 für A.
- `plane_plane_a_system`: 2 BE — A: LGS richtig kombiniert und y = 1, x + z = 2 hergeleitet
- `plane_plane_a_line`: 3 BE — A: Vollständige Parametergerade mit freiem t ∈ ℝ angegeben; ohne Parametergerade samt begründeter Schnittgeraden-Einordnung für die bisherige A-Lageuntersuchung höchstens 5/8 BE, einschließlich Methodenwahl somit höchstens 8/11 BE für A
- `plane_plane_a_meaning`: 3 BE — A: Beide Gleichungen geprüft und geometrisch als Schnittgerade gedeutet
- `plane_plane_b_normals`: 1 BE — B: Proportionale Koeffizienten oder Normalen erkannt
- `plane_plane_b_contradiction`: 3 BE — B: Widerspruch 2 ≠ 3 bzw. 0 = 1 im LGS belegt; ohne Widerspruch samt begründeter echter Parallelität insgesamt höchstens 3/6 für B
- `plane_plane_b_meaning`: 2 BE — B: Echte Parallelität und leere Schnittmenge unterschieden
- `plane_plane_c_redundancy`: 2 BE — C: Ganze Gleichung E₅ = 2E₃ und Redundanz gezeigt
- `plane_plane_c_plane`: 2 BE — C: Vollständige Zweiparameterdarstellung der gemeinsamen Ebene angegeben; ohne diese samt begründeter Ebenenidentität insgesamt höchstens 3/6 für C
- `plane_plane_c_meaning`: 2 BE — C: Identität und zweidimensionale Lösungsmenge gegenüber Schnittgerade erklärt

Maximum 23 BE; Bestehen ab 21 BE. Kappungen werden in der normalen Rubrikbewertung angewendet. Es gibt keinen zweiten gespeicherten Passstatus.
