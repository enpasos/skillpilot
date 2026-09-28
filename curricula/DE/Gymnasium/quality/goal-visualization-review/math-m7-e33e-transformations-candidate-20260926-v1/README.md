# Transformationsscharen: korrigierter Bildkandidat

Ziel `e33e75e3-eae5-5a09-862f-d1a11176373f`. Dieses Paket dokumentiert den ursprünglichen Bildkandidaten; nach unabhängiger Sichtprüfung wurde exakt sein PNG-Hash als Pilot eingebunden. Das ist nur hashgebundene maschinelle Bild-QS, keine menschliche Freigabe. Das historische JPG mit fehlerhaft ausgerichteten Scheiteln und Achsenstrichen bleibt unverändert im Qualitäts-HOLD (`mathematik-m7-quality-holds-2026-09-23.md`).

Der neue Entwurf trennt reine horizontale Verschiebung von reiner vertikaler Skalierung. Oben steht bewusst **nur eine** Parabel auf einer transparenten Schablone; Pfeil und Zielpunkt zeigen eine Verschiebung nach rechts bei `a>0`, ohne eine zweite, möglicherweise anders breite Kurve zu behaupten. Unten liegen die Scheitel von Grundfunktion, schmalerer (`a>1`) und breiterer (`0<a<1`) Parabel sichtbar am selben Achsenschnittpunkt. Die Beschriftungen `gₐ(x)=(x−a)²` und `hₐ(x)=a·x²` sind mathematisch passend. Das Bild gibt keine konkreten Parameterfälle der späteren Prüfung vorweg.

## Lokale Sichtprüfung

- Original-PNG (1254 × 1254, RGB) visuell geprüft: kein schwarzer Fleck, keine Transparenz, keine numerischen Achsenstriche mit widersprüchlicher Skalierung.
- Auf 360 × 360 Pixel mechanisch verkleinert und visuell geprüft: beide Überschriften, Formeln, Pfeil sowie `a>0`, `a>1` und `0<a<1` sind lesbar.
- Oben endet die Pfeilspitze knapp vor dem Zielpunkt; die Leserichtung ist dennoch klar. Die obere x-Achse ist bewusst schematisch ohne eingezeichneten Ursprung. Vor einer Freigabe ist zu beurteilen, ob diese Abstraktion für das Lernziel genügt.
- Fünf frühere Generierungsversuche wurden **nicht** übernommen: In ihnen war die verschobene Parabel trotz Anweisung sichtbar schmaler als die Ausgangsparabel oder das Rendering hatte störende Artefakte. Diese Feststellung ist kein Freigabenachweis für den neuen Entwurf.

## Pilotbindung nach unabhängiger Sichtprüfung

Die unabhängige Prüfung des exakten SHA-256
`3a203619107a9ea6eeb5ba9425ea6330fc6b6d5bf5667f0cd517089dc4c903c4`
in Originalgröße und bei 360 px ist als aktuelle Entscheidung in
[`mathematik-zzzz-transformations-png-2026-09-26.md`](../mathematik-zzzz-transformations-png-2026-09-26.md)
dokumentiert. Kanonisches Bild, Web-Asset und Backend-Static-Kopie verwenden
diese identischen PNG-Bytes; die QA-Zeile bindet genau diesen Hash als
`aiApproved=yes` bei `humanApproved=no`. D-Seiten und P-Profile wurden durch
die Bildbindung nicht neu geprüft oder freigegeben. Der zentrale
Fünf-Gate-Status wurde hier nicht regeneriert; M7 wird nicht behauptet.
