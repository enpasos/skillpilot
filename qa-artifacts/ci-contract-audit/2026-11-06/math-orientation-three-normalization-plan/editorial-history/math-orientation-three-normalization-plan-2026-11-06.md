# Drei Math-Orientierungskanten: begrenzter Anwendungsplan

Der [geschlossene Vorschlag](math-orientation-three-normalization-plan-2026-11-06.json)
ersetzt genau drei `requires`-Arrays auf der Quelle
`da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6`.
Der rekonstruierte Kandidat ist
`b2155f4167f104e5b8eef183f7bb9a7a792a873a9e5d009d5083e0bc84c68cfd`.
Er ist nicht angewandt. Keine Quelle, aktive QA-Datei, Policy oder View wurde verändert.

| Fall | Ziel | Erhaltener fachlicher Träger | Entfernt wird nur |
| --- | --- | --- | --- |
| MATH-MIN-0027 | Diagramme deuten | Diagramme lesen | die wiederholte Sek-I-Orientierung |
| MATH-MIN-0745 | Einfache inverse Matrizen bestimmen | Matrizen multiplizieren für die ausdrücklich verlangte Produktkontrolle | die wiederholte Oberstufenorientierung |
| MATH-MIN-0751 | Ganze Zahlen ordnen | Natürliche Zahlen ordnen und vergleichen | die wiederholte Sek-I-Orientierung |

Die vollen DE/EN-Ziele, Autorenursprünge und fachlichen Einzelbegründungen stehen
im JSON. Der [unabhängige Peer](math-orientation-three-independent-review-2026-11-06.json)
billigt genau diese drei Entzüge, ohne weitere Vorpfade oder QA-Gates freizugeben.
277 andere gewöhnliche Orientierungsfälle bleiben ungeprüft; drei weitere
konkret benannte Trägerüberbreiten bleiben gehalten. Die vier historischen
Recallfälle gehören zum getrennten Memorybeleg und werden hier nicht verändert.

Der stdlib-[Reproducer](prepare_math_orientation_three_normalization.py) prüft
alle21 Quellen, die drei exakten Goal-/Array-Guards und nach jeder einzelnen
sowie kumulativen Entfernung erneut die vollständigen Goal- und Atomclosures.
Er kann ausschließlich unter `tmp/` einen neuen Kandidaten ausgeben und hat
keinen Modus zur Anwendung:

```bash
python3 -B docs/dev/ci-graph-repairs/prepare_math_orientation_three_normalization.py
python3 -B docs/dev/ci-graph-repairs/prepare_math_orientation_three_normalization.py --candidate-out tmp/math-three-new-copy.json
```

Der tatsächliche Replay ist [gesichert](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/reconstruct-and-verify.json).
Alle6524 Goal- und5495 Atomclosures bleiben exakt gleich; beide globalen
Zykluszahlen bleiben0. Die vollständigen kleinen
[Scopevergleiche](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/scope-comparison.json)
und [Java-Vergleiche](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/consumer-comparison.json)
belegen640 Viewvergleiche und28816 Frontier-Prädikate. Target-/Supportmengen,
Trees, Regeln, Ausblicke und stabile Planreihenfolge bleiben gleich.47 direkte
`requires-closure`-Herkunftszeilen und die direkten Planadjazenzen ändern sich
ausdrücklich; gespeicherte Strukturbindungen werden nicht als invariant behauptet.
Die351389489 Rohbytes bleiben lokal erhalten, verlustfrei auf74073389 Bytes
komprimiert und durch das [Inventar](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/storage-inventory.json)
gebunden. Es wurde keine große zweite Ergebniskopie angelegt.

Vor jeder späteren Anwendung müssen die Quellen- und Goalguards erneut passen.
Eine ausdrückliche Root-Koordination, privater Inode, `fsync`, Modus0644 und
`os.replace` sowie eine getrennte Anwendungsquittung bleiben erforderlich.
Dieser Plan schreibt weder aktive QA noch Policy mit. Wenn ein echter neuer
D-Review Textänderungen verlangt, ist das ein neuer Kandidat mit neuen Guards;
`b215…` darf dann nicht unverändert als Nachweis ausgegeben werden.

Es gibt einen konkreten weiteren Verbraucher: Die aktuelle Split-Policy bindet
die gesamte kanonische Quelle `da47…`. Der unveränderte Generator lehnt `b215…`
deshalb [tatsächlich ab](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/split-layout-candidate-guard.json).
Alle18 derzeitigen Ausgaben haben weiterhin ihre
[gebundenen Rohhashes](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/current-eighteen-layout-output-pins.json).
Ein frischer Generatorpass mit einer neu gebundenen Policy wird hier nicht
behauptet. Eine spätere Einfeldbindung braucht einen gesonderten technischen
Nachweis und Root-Koordination; sie gehört nicht zu diesen drei Arrays.

Die drei Kind-, D- und P-Bindungen würden auf dem Kandidaten veralten. Der
[native blinde D-Input](math-three-description-input-preparation-2026-11-06.md)
ist vorbereitet; das ist noch kein Review. Der
[P-Ersatzplan](../../../qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-normalization-plan/positive-replacement-plan.json)
erhält28 alte Zeilen bytegleich und verlangt drei tatsächlich neu verfasste
aktuelle Kandidaten. Math bliebe danach weiterhin bei914G17 und2G01a und damit
unter dem geschützten Floor. Keine M6-/M7-Wiederherstellung wird behauptet.
