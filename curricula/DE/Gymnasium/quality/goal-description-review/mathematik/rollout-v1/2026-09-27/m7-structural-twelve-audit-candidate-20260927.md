# Mathematik M7: fachlicher Strukturkandidat für die zwölf D-offenen, bildbereiten Ziele

Stand: 27. September 2026. Nichtkanonisches Audit; keine Graph-, Mapping-,
Bild-, Lernenden- oder QA-Änderung und **keine D-Freigabe**. Grundlage sind die
[aktuelle 56er-Triage](m7-current-d-open-triage-20260927.md), die aktuellen
[6er-](m7-six-text-dissent-current-20260927-v1/synthesis-assessment.md),
[19er-](m7-vready-remainder19-recheck-20260927-v1/synthesis-assessment.md)
und [Zweier-Reviews](m7-notation-derivative-two-current-20260927-v1/synthesis-assessment.md),
der aktuelle kanonische Graph, die vier tatsächlich gebundenen J7/J9-Prüfungen
und die zwölf vorhandenen Bilder. „Bildbereit“ bedeutet hier, dass das alte
Ziel ein aktuelles Bild hat; dessen V-Entscheidung gehört nicht automatisch zu
einem engeren Text oder neuen Kind.

## Engste fachlich vertretbare Partition

| Route | IDs | Ergebnis |
| --- | --- | --- |
| Struktur-Split | `1bc118c3`, `1ea06c0c`, `59d5a330`, `8064088b`, `a8ff2666`, `1a18dbb3` | Zwei unabhängig prüfbare Leistungen je Ziel als Kandidat. Bei J10 würde ein engeres KEEP den expliziten globalen Extremwertanspruch ohne Ersatz entfernen. Für keinen Split ist schon eine D-Freigabe begründet. |
| Enger KEEP-/Reword-Kandidat | `80956a2c`, `31be24f0`, `809ef78a`, `c2c49659` | Die alte ID kann nur nach ausdrücklich enger Zielidentität bleiben; der jeweils entfallende Teil ist schon anderweitig modelliert oder wird als Ausführungsschritt einer gemeinsamen Leistung geprüft. Frische D-Resolution nötig. |
| Identitäts-/Duplikat-HOLD | `972cc7e8`, `f37b0a72` | Weder zwei neue Kinder noch ein Text-KEEP sind gegenwärtig sicher. Zuerst die Beziehung zu vorhandenen Zielen und die Länder-/Phasenprojektion entscheiden. |

Das ist nach der zusätzlichen [J10-Gegenprüfung](j10-derivative-split-candidate-20260927-v1/README.md) **6 + 4 + 2**, keine automatische Freigabe für vier KEEP-Kandidaten. Der
frühere Semantic-Atomicity-Voll-Ledger trägt für alle zwölf noch `atomic`;
diese alten Entscheidungen lösen die neueren D-Dissense nicht auf.

### Sechs Split-Kandidaten, davon J10 zusätzlich bedingt

| Alt-ID | Genau beobachtbare Kind-Leistungen (Entwurf, noch keine IDs) | Bildfolge |
| --- | --- | --- |
| `1bc118c3` (J9) | (1) Vektoren komponentenweise **addieren und subtrahieren**, die Differenz als Addition des Gegenvektors deuten. (2) Vektoren mit **positiven, negativen und gebrochenen Skalaren multiplizieren**, Betrag/Richtung geometrisch deuten. | Das alte Dreifachbild mischt beide Kompetenzen. Zwei kindbezogene Bilder oder einzeln geprüfte Zuschnitte: Verschiebungssumme/-differenz; Skalierung einschließlich Richtungsumkehr. Die J9-Aufgabe `853905c5…` prüft `2·AB−AP` und verlangt beide Kinder in `requires` und `coveredGoalIds`. |
| `1ea06c0c` (J10) | (1) **Kugeloberfläche** als Außenhaut geometrisch deuten, Formel plausibilisieren und anwenden. (2) **Kugelvolumen** als Innenraum getrennt plausibilisieren und anwenden. DE „plausibilisieren“ und EN „justify“ müssen gleich stark formuliert werden. | Zwei neue Kindbilder; die vorhandenen präzisen Kandidatenspezifikationen K3/K4 stehen in der [Geometrie-Wirkungsanalyse](m7-vready-remainder19-recheck-20260927-v1/geometry-split-impact-and-image-candidates.md). Das alte Bild verbindet Fläche und Volumen. |
| `59d5a330` (J7) | (1) **Volumen gerader Prismen** aus Grundfläche und Körperhöhe mit cm³ bestimmen. (2) **Gesamtoberfläche gerader Prismen** aus zwei Grund- und allen Mantelflächen mit cm² bestimmen. | Zwei neue Kindbilder nach K1/K2 der [Geometrie-Wirkungsanalyse](m7-vready-remainder19-recheck-20260927-v1/geometry-split-impact-and-image-candidates.md). Die freigegebene J7-Aufgabe `0dded9c1…` enthält beide Rechnungen und muss beide Kinder abdecken. |
| `8064088b` (J7) | (1) **Kreisumfang und Bogenlänge** aus Radius bzw. Winkel/Anteil bestimmen; einen *gesamten* Kreisteil-Rand nur nennen, wenn die jeweilige Quelle ihn trägt. (2) **Kreis- und Kreisausschnittsfläche** aus Radius bzw. Winkel/Anteil bestimmen und m² von m unterscheiden. | Zwei kindbezogene Bilder. Das aktuelle Bild zeigt ganzen Kreisumfang/-fläche und Halbkreisbogen/-rand, aber **keine Sektorfläche**; es kann Kind 2 nicht vollständig tragen. Die J7-Aufgabe `4ef1ec52…` prüft ganzen Umfang, ganze Fläche und Viertelkreisfläche; ihre `requires` und `coveredGoalIds` müssen beide Kinder nennen. Der HE-G8-Quelltext nennt Bogenlänge und Sektorfläche ausdrücklich. |
| `a8ff2666` (J9) | (1) **Vektorbetrag und Abstand zweier Raumpunkte** als Länge des Verbindungsvektors bestimmen und deuten. (2) **Mittelpunkt einer Raumstrecke** komponentenweise bestimmen und als Halbierung prüfen. | Das alte Bild enthält beide Rechnungen. Zwei kindbezogene Bilder oder geprüfte Ableitungen mit eigenem Asset und eigener QA. Die Abstandsleistung ist nicht mit der unabhängigen Mittelpunktleistung gleichzusetzen. |
| `1a18dbb3` (J10) | (1) **Funktions- und Ableitungsgraphen qualitativ in beide Richtungen verknüpfen**. (2) **Mit der ersten Ableitung Monotonie und lokale Extrema begründen sowie globale Werte im angegebenen Bereich einschließlich relevanter Randwerte vergleichen**. | Die [vertiefte Prüfung](j10-derivative-split-candidate-20260927-v1/README.md) fand kein anderes J10-Atom, das den heutigen globalen Anspruch übernimmt. Die bisherige Parabelgrafik zeigt keinen Randwertvergleich und ist bei Kartenbreite schwer lesbar. Zwei neue bedingte Kindprompts S11/S12 sind vorbereitet; kein alter Bildhash geht auf Kinder über. |

Für diese sechs möglichen Splits sind **zwölf** neue atomare Kindziele und grundsätzlich
zwölf eigene Bildbindungen zu planen. Die zwölf bedingten Bildprompts unter
`tmp/math-m7-image-prompts-2026-09-27/PLANNED_SPLIT_PROMPTS.md`
stehen getrennt von den aktuell V-offenen Zielen; insbesondere J10 braucht
zuerst den fachlichen Split-Entscheid. Ein Zuschnitt oder eine Neubearbeitung
des alten Bildes ist erst
nach eigener fachlicher Sichtprüfung, Provenienz- und Hashbindung ein
Child-Bild. Die alten Ressourcen dürfen nicht stillschweigend kopiert werden.

### Vier engere KEEP-/Reword-Kandidaten

| Alt-ID | Eine verteidigbare engere Leistung | Bestehende Grenze; Bild- und Prüfungsfolge |
| --- | --- | --- |
| `80956a2c` (J9) | Den Satz des Pythagoras zum **Konstruieren einer vorgegebenen exakten Streckenlänge** (z. B. `√13` als Hypotenuse) nutzen und die Konstruktion am rechten Winkel erläutern. | `4d78bbcc…` prüft bereits Streckenrechnung und geometrische Begründung. Das alte Bild zeigt links die Konstruktion, rechts eine bloße Diagonalenrechnung; neues zielreines Bild oder fachlich geprüfter Zuschnitt nötig. Die freigegebene Aufgabe `fbd97592…` enthält **keine Konstruktion**, obwohl sie das alte Ziel als `coveredGoalIds` nennt: bei engem KEEP dort `4d78bbcc…` statt `80956a2c…` prüfen und für das Konstruktionsziel eine echte Assessment-Aufgabe vorsehen. |
| `31be24f0` (Q1) | **Stammfunktionen ganzrationaler Funktionen ohne Hilfsmittel bilden** und durch Ableiten prüfen. | Das direkte Vorgängerziel `b9bbd2a8…` umfasst schon die Nutzung einer Stammfunktion für `F(b)−F(a)`; `ece68088…` die Bestandsrekonstruktion. Daher keinen zweiten fast gleichen „vorgegebene Stammfunktion nutzen“-Kindknoten erzeugen. Das alte Bild enthält rechts genau diesen entfernten Teil; neues zielreines Bild oder geprüfter Zuschnitt wahrscheinlich. Nachfolger-`requires` nach tatsächlichem Bedarf neu zuordnen. |
| `809ef78a` (Q1) | **Den Mittelwert einer zeitabhängigen Größe über ein Intervall als `1/(b−a)·∫ₐᵇ q(t)dt` modellieren und mit Einheit deuten**, mit Bestand und Änderungsrate als zwei Transferfälle. | `2afba4a2…` und `ece68088…` decken Bestandsänderung bzw. Rekonstruktion bereits ab. Zwei verschieden benannte Mittelwerte können eine gemeinsame Mittelwertbildung tragen, wenn beide Fälle unabhängig geprüft werden. Das vorhandene Bild enthält beide Mittelwerte, daneben aber Rekonstruktion; nach enger Textfassung V neu gegenlesen. Wenn die Auswahl der Eingangsgröße nicht als eine Leistung trägt: getrennte Kinder für „mittleren Bestand“ und „mittlere Änderungsrate“. |
| `c2c49659` (Q2 LK) | Bei **neuen Objektpaaren die Lage klassifizieren, passende Fußpunkt-/Orthogonalitätsbedingungen auswählen und den kürzesten Abstand begründen**. | Die direkten Vorgänger `79c4cd21…`, `3256476b…`, `509ae03b…` lehren bereits Punkt–Ebene, Punkt–Gerade und Gerade–Gerade. Sie nicht als neue Fall-Kinder duplizieren. Das Bild zeigt drei Konfigurationen, aber nicht alle im heutigen Text genannten; für ein enges Auswahlziel kann es nach neuer Bild-/Textprüfung genügen. HE Q2.3 LK-Mapping und Aufgaben müssen die **Auswahl-/Transferleistung**, nicht nur einen bekannten Einzelfall, belegen. |

### Zwei Identitäts-HOLDs vor einem Schemaentscheid

| Alt-ID | Warum weder KEEP noch Split jetzt sicher ist | Sinnvolle nächste Route |
| --- | --- | --- |
| `972cc7e8` (Q2) | Vorwärtswirkung eines Parameters steht nahe `91e2f564…`; Parameter aus Bedingungen bestimmen steht nahe `71683f37…`. Der aktuelle D-Doppelreview verlangt Split, aber zwei neu erzeugte Kinder würden vermutlich bestehende Ziele wiederholen. Die aktuelle Grafik illustriert einen **eindeutigen** Bedingungsfall. | Prüfen, ob als neue, engere Leistung das **Erkennen unabhängiger gegenüber abhängigen Parameterbedingungen und der Eindeutigkeit der Lösung** quellen- und assessmentgestützt ist. Der vorhandene P-v2-Kandidat enthält einen nicht eindeutigen Transferfall; das Bild dafür nicht. Falls kein eigener Rest bleibt: alte ID als Navigations-/Migrationsknoten behandeln und Source-/`requires`-Kanten auf die vorhandenen Ziele adjudizieren. |
| `f37b0a72` (Q2) | Addition und Skalierung sind trennbar; zugleich lehrt J9-`1bc118c3…` bereits räumliche Tupel/Operationen und sein P-Kandidat prüft `2u−v` im Raum. `72dfc164…` behandelt Linearkombinationen. Neue Q2-Kinder für dieselben Rechnungen wären Duplikate. HE Q2.2 hat aber eine direkte `exact`-Quellenkante auf die alte Q2-ID. | Vor einer Entfernung die Q2-Source-Kante und Q2-Komposition gegen J9-Voraussetzungsprojektion prüfen. Nur falls eine eigenständige **räumliche Transferleistung** übrig bleibt, diese eng formulieren und unabhängig prüfen; das bisherige Bild zeigt Addition und nur positive Verdopplung und deckt dann negative/nichtganze Skalare nicht. Sonst vorhandene Kinder/Ziele wiederverwenden und die fünf direkten Nachfolger gezielt neu binden. |

## Daten-, Quellen- und QA-Folgen

* **Stabile IDs/Mastery:** Bei einem echten Split die alte ID wie im
  [Struktur-Split-Muster](../../../canonical-math-structural-splits-2026-08-16.receipt.json)
  als Cluster behalten, zwei neue stabile atomare IDs einhängen und
  Clustergewichte/Vorfahrengewichte neu berechnen. Kein altes Mastery `1`
  automatisch auf beide Kinder verteilen: der Backend-Dienst berechnet
  Cluster-Mastery aus Kindern. Auch ein enger KEEP oder ein Merge lässt
  vorhandene Lernendenwerte nur nach expliziter Äquivalenz-/Migrationsregel
  unverändert aussagekräftig erscheinen. Rückfall-/Kommunikationsregel vor
  Rollout testen.
* **Kanten/Assessment:** Eltern-`contains`, atomare `requires`, betroffene
  Scope-Kompositionen je tatsächlich geändertem Ziel, Source-Mappings,
  Herkunft und Surrogatbrücken einzeln prüfen. Besonders die vier oben
  genannten J7/J9-Prüfungen sind bereits freigegeben; ihre Aufgabeninhalte
  entscheiden die neue `coveredGoalIds`-Menge, nicht die frühere Sammel-ID.
  `fbd97592…` ist ein konkreter falscher Konstruktionsbeleg im engen KEEP.
* **Quellen/Geltung:** Heutige `exact`- oder `partial`-Kanten und die
  bundesweiten Applicability-Mengen werden nicht pauschal auf Kinder
  kopiert. Ein `partial`-Beleg bleibt partiell. Für Prisma/Kugel liegen
  Zeilen-/View-Inventare in der Geometrie-Wirkungsanalyse. `1bc118c3…` und
  `a8ff2666…` haben in den expliziten Source-Review-Mappings besonders
  schmale direkte Treffer; ihre breite aktuelle Geltung ist kein
  Kind-für-Kind-Quellennachweis.
* **Fünf Gates:** Split-Kinder brauchen jeweils frische Semantic-Atomicity-
  und Memory-Entscheide, P-v2-Profil, aktuelle bilinguale D-Seite mit zwei
  unabhängigen Runden/Synthese, eigene Quellen-/Scopeprüfung und V-QA auf
  ihrem Asset. Bei Reword/KEEP bleiben IDs, aber Ziel-/Seiten- und
  P-Eingabe-Fingerprints ändern sich; alte D-Runden nicht umetikettieren.
  Dass die alten Bilder im QA-Ledger für ihre bisherigen Ziele teils per
  aktueller Approved-AI-Entscheidung V-bereit sind, ist keine Zustimmung zum
  neuen Text oder Kind. Alte Review-PDFs und historische Artefakte bleiben
  unverändert.

Wenn alle sechs vorgeschlagenen Splits mit je zwei Kindern erfolgen und die beiden
Identitäts-HOLDs zunächst bleiben, steigt der aktuelle `curricularAtomic`-
Nenner von 797 auf **803**; Rückbau/Merge dieser beiden oder weitere nötige
Kinder ändern ihn erneut. Diese Rechnung beschreibt Scope, keine M7-Verbesserung.
