# Unabhängige Sichtprüfung B – v3

Ziel: `4c494716-567b-59c2-855c-6ea45635c666` — Geometrische Abbildungen mit Matrizen beschreiben

**KEEP.** Fachlich eindeutige oblique Parallelprojektion auf die x-Achse. P′ ist der Gitterstelle 5 zugeordnet; die verbleibende geringe Markermitten-Abweichung ist im Verhältnis zum großen Punktzeichen Zeichentoleranz, kein fortbestehender falscher Koordinatenwert.

Asset: `candidate-v3.png`, 1536 × 1024; SHA-256: `sha256:5cd7bfdf824778a737715abfc82f3841c556d4e3cb69c557de96c24d1152baee`.
Geprüft: 2026-09-21T22:47:54Z, tatsächliche Originalansicht mit `view_image`. Reviewer: Codex / math_repaired12_blind_b; exakter Serving-Modellname nicht offengelegt. AI-Kandidat, keine menschliche Freigabe.

## Rechnung und fachliche Grenzen

- S=[[1,1],[0,0]] sendet (x,y) auf (x+y,0). S(2,3)=(5,0) und S(−1,2)=(1,0); beide ausgeschriebenen Rechnungen sind richtig.
- Die Verschiebung vom Urbild zum Bild beträgt (y,−y)=y·(1,−1). Für P sind das (3,−3), für Q (2,−2); beide Projektionen verlaufen in derselben Richtung.
- S²=S, S(x,0)=(x,0) und S(1,−1)=0. Das ist tatsächlich eine Parallelprojektion auf die x-Achse, nicht bloß eine beliebige Matrix mit korrekten Einzelwerten.
- Die bildlich verwendeten Höhen sind positiv; der Schattenvergleich und die Verschiebung nach rechts gelten für diese dargestellten Punkte. Die Formel enthält auch die allgemeine vorzeichenbehaftete Wirkung.

## Tatsächlich sichtbare Geometrie

- P ist sichtbar bei x=2,y=3 und Q bei x=−1,y=2 eingezeichnet; Q′ sitzt am x=1-Punkt auf y=0.
- P′ liegt auf der x-Achse am Bereich der fünften positiven Gitterstelle. Seine Mitte ist leicht rechts der 5er-Linie, aber der sichtbare große Marker berührt/überdeckt die Linie; zur nächsten Gitterstelle 6 verbleibt deutlich mehr Abstand als ein Markerdurchmesser.
- Die verbleibende Abweichung der P′-Markermitte liegt visuell etwa in der Größenordnung eines Markerradius, nicht einer halben Gittereinheit. Diese Aussage ist eine Sichtbeurteilung, keine behauptete pixelgenaue Vermessung.
- Beide gestrichelten Projektionspfeile führen nach rechts unten zu den zugehörigen Achsenbildpunkten und sind innerhalb der illustrierten Strich-/Markertoleranz parallel. Es gibt keinen separaten konkurrierenden Endpunkt zwischen 5 und 6.
- Die x-/y-Achsen haben unterschiedliche Bildskalierungen; deswegen muss die Richtung (1,−1) auf dem Raster nicht als exakt 45°-Bildwinkel erscheinen. Maßgeblich sind die Gitterkomponenten.
- Die Zuordnung P′(5|0) wird durch den gezeichneten Bereich und die Rechnung gemeinsam getragen. Es ist nicht bloß ein korrektes Zahlenlabel auf einem eindeutig anders gelegenen Punkt.

## Lesbarkeit und Entscheidung

Alle Matrixeinträge, Koordinaten, negativen Zeichen und Erklärungen sind bei Originalauflösung klar lesbar. Die freundliche Schatten-/Sonnendarstellung unterstützt das AB2-Ziel. Kein Stilfeinschliff nötig.

KEEP trotz kleiner Raster-Zeichentoleranz, nicht wegen einer Ausnahme von fachlicher Richtigkeit. Kein Anspruch pixelgenauer CAD-Geometrie. Keine QA-/Canonical-Freigabe durchgeführt.

Keine erforderliche Änderung. Keine Canonical-/QA-/Registryänderung. Provider und Werkzeug laut Autorenquittung: OpenAI / ChatGPT-Codex image generation / image_gen__imagegen; exaktes Bildmodell nicht offengelegt. Korrekturprompt gelesen; die Quellenmetadaten wurden erst nach eigener Sichtbeurteilung ausgewertet. Roots vorläufige Einschätzung war im Auftrag genannt, wurde aber nicht als Ersatz der Sichtprüfung benutzt.

