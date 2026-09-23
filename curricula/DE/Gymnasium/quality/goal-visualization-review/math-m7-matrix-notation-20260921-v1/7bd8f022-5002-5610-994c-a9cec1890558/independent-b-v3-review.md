# Unabhängige Sichtprüfung B – v3

Ziel: `7bd8f022-5002-5610-994c-a9cec1890558` — Drehungen um Koordinatenachsen mit Matrizen darstellen (LK)

**KEEP.** Die vereinfachte Draufsicht und die vollständige Spaltenvektorrechnung stellen dieselbe positive Vierteldrehung um z korrekt dar.

Asset: `candidate-v3.png`, 1536 × 1024; SHA-256: `sha256:ce06e66689ba9322f0c6569609a4942320d98cf198866e0606427309a3a66639`.
Geprüft: 2026-09-21T22:47:54Z, tatsächliche Originalansicht mit `view_image`. Reviewer: Codex / math_repaired12_blind_b; exakter Serving-Modellname nicht offengelegt. AI-Kandidat, keine menschliche Freigabe.

## Rechnung und fachliche Grenzen

- Rz(90°)=[[0,−1,0],[1,0,0],[0,0,1]] ist die aktive positive Vierteldrehung im rechtshändigen Bezug.
- Die Matrixspalten sind e_y, −e_x, e_z. Alle drei unteren Basisbild-Angaben entsprechen exakt diesen Spalten.
- Für P=(2,1,3) ergeben die ausgeschriebenen Zeilenprodukte 0·2−1·1+0·3=−1, 1·2+0·1+0·3=2 und 0·2+0·1+1·3=3; P′=(−1,2,3).
- z bleibt unverändert; x²+y² und die räumliche Norm bleiben erhalten. P und P′ haben beide Norm²=14. Die Abbildung beschränkt sich nicht auf Punkte mit z=0.
- Die nicht transponierten, senkrecht notierten Vektoren sind konsistent mit Matrixmultiplikation von links; kein doppeltes Transpositionszeichen.

## Tatsächlich sichtbare Geometrie

- Links oben beginnen e_x und e_y am gleichen Ursprung, stehen sichtbar senkrecht aufeinander und besitzen vergleichbare Länge; e_x zeigt nach rechts und e_y nach oben.
- Der grüne Viertelkreispfeil läuft von der positiven x-Richtung gegen den Uhrzeigersinn zur positiven y-Richtung. Die Angabe 'Blick von +z zum Ursprung' macht die Blickkonvention eindeutig.
- Links gibt es bewusst keine P/P′-Punktlage oder Koordinatenskala, die den Zahlen rechts widersprechen könnte. Das Panel zeigt Basisrichtungen, nicht eine maßstäbliche Bahn des Beispielpunkts.
- Unten links ist e_x→e_y korrekt; im mittleren Panel führt der Pfeil von e_y nach −e_x; rechts bleibt e_z auf derselben Achse. Die kreisende Umrandung bei z illustriert die Drehachse, nicht eine Verlagerung des Basisvektors.

## Lesbarkeit und Entscheidung

Alle drei Matrixzeilen, der Rechenweg, Vorzeichen, Achsen- und Basisbezeichnungen sind gut lesbar. Die Beschränkung auf eine z-Achsen-Drehung ist ein zulässiges konkretes Beispiel zum umfassenderen LK-Ziel, keine behauptete Vollabdeckung.

Keine neue menschliche Zustimmung, keine Veröffentlichung und keine Aufgabe-/Lernerevidenz. Andere Achsen und allgemeine Winkel bleiben Unterrichts-/Assessmentgegenstand außerhalb dieses einzelnen Bildbeispiels.

Keine erforderliche Änderung. Keine Canonical-/QA-/Registryänderung. Provider und Werkzeug laut Autorenquittung: OpenAI / ChatGPT-Codex image generation / image_gen__imagegen; exaktes Bildmodell nicht offengelegt. Korrekturprompt gelesen; die Quellenmetadaten wurden erst nach eigener Sichtbeurteilung ausgewertet. Roots vorläufige Einschätzung war im Auftrag genannt, wurde aber nicht als Ersatz der Sichtprüfung benutzt.

