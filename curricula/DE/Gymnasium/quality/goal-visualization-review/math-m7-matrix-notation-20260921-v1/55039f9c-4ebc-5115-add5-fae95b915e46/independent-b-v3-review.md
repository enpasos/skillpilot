# Unabhängige Sichtprüfung B – v3

Ziel: `55039f9c-4ebc-5115-add5-fae95b915e46` — Parallelprojektionen auf Koordinatenebenen mit Matrizen darstellen

**KEEP.** Drei achsenparallele Spezialfälle der Parallelprojektion sind korrekt und klar als solche begrenzt; die Seitenansicht erklärt den xy-Fall ohne falsche 3D-Punktlage.

Asset: `candidate-v3.png`, 1536 × 1024; SHA-256: `sha256:771419dd4e07ee96bed6bc6ad425f33a4d8a99ece7d6298395403ce3142a6648`.
Geprüft: 2026-09-21T22:47:54Z, tatsächliche Originalansicht mit `view_image`. Reviewer: Codex / math_repaired12_blind_b; exakter Serving-Modellname nicht offengelegt. AI-Kandidat, keine menschliche Freigabe.

## Rechnung und fachliche Grenzen

- Pxy=diag(1,1,0) sendet (2,−1,3) auf (2,−1,0); nur z wird null.
- Pxz=diag(1,0,1) sendet (2,−1,3) auf (2,0,3); nur y wird null.
- Pyz=diag(0,1,1) sendet (2,−1,3) auf (0,−1,3); nur x wird null.
- Alle drei Matrizen sind idempotent, lassen ihre Zielebene punktweise fest und haben die jeweils ausgelöschte Koordinatenachse als Kern.
- Untertitel und Merksatz begrenzen die Behauptung 'eine Koordinate null, zwei gleich' ausdrücklich auf die achsenparallelen Beispiele. Für allgemeine schiefe Projektionsrichtungen wäre eine solche Verallgemeinerung falsch, wird hier aber nicht behauptet.

## Tatsächlich sichtbare Geometrie

- Das linke Panel ist ausdrücklich eine Seitenansicht mit x horizontal und z vertikal. Der Punkt P liegt über dem x-Wert 2 auf der markierten Höhe 3.
- Der horizontale Hilfsstrich trifft denselben z=3-Wert wie P; der blaue Pfeil ist senkrecht, also parallel zur gezeichneten z-Achse.
- P′ liegt direkt unter P bei unverändertem x=2 und z=0. Der Zusatz 'y=−1 bleibt gleich' erklärt die in dieser Seitenansicht nicht dargestellte Tiefe.
- Das Auftreffen auf der horizontalen Bildachse wird durch die Seitenansicht nicht als Behauptung y=0 im Raum verwendet: Die lesbare Punktkoordinate P′(2|−1|0) bleibt mit dem Zusatz konsistent.
- Die drei rechten Kästen sind eindeutig den Ebenen xy, xz und yz zugeordnet; keine vertauschte Matrixzeile oder falsche gelöschte Komponente.

## Lesbarkeit und Entscheidung

Die wenigen Skalenwerte, Punkttripel, Matrixeinträge und Überschriften sind auch ohne Detailraster eindeutig lesbar. Die einfache Seitenansicht passt zum AB2-Ziel und vermeidet eine perspektivisch unklare Tiefenlage.

Das Bild zeigt achsenparallele, damit orthogonale Spezialfälle. Es wird keine allgemeine Richtungsmatrix jeder Parallelprojektion behauptet. Keine QA-/Canonical-Änderung durch diesen Review.

Keine erforderliche Änderung. Keine Canonical-/QA-/Registryänderung. Provider und Werkzeug laut Autorenquittung: OpenAI / ChatGPT-Codex image generation / image_gen__imagegen; exaktes Bildmodell nicht offengelegt. Korrekturprompt gelesen; die Quellenmetadaten wurden erst nach eigener Sichtbeurteilung ausgewertet. Roots vorläufige Einschätzung war im Auftrag genannt, wurde aber nicht als Ersatz der Sichtprüfung benutzt.

