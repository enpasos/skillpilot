# Vorschlag: J9-Vektoroperationen in zwei überprüfbare Ziele trennen

Stand: 27.09.2026. **Entscheidungsvorlage, keine Kanonänderung und keine
D-/M7-Freigabe.** Die zwei unabhängigen Runden des
`m7-final-fourteen-triage-20260927-v1`-Pakets bewerten
`1bc118c3-1f05-5f2a-b125-418017180d75` jeweils mit `split_review`.
Beide begründen dies fachlich: Addition/Subtraktion als Verknüpfung von
Verschiebungen und Skalarmultiplikation als Streckung, Stauchung oder
Richtungsumkehr können getrennt beherrscht werden. Die geometrische Deutung
gehört jeweils zur Operation; sie ist kein drittes Ziel. Das vorhandene
`semanticAtomic: true`-Ledger vom 05.05.2026 entscheidet diesen neueren,
konkreten Einwand nicht weg.

## Vorgeschlagene atomare Zielidentitäten

| | Beibehaltene ID: Addition und Subtraktion | Neue ID: Skalarmultiplikation |
| --- | --- | --- |
| `id` | `1bc118c3-1f05-5f2a-b125-418017180d75` | **Kandidat** `ae9e5f1d-afa1-5935-a23b-95c0f1c63e08` |
| `shortKey` | vorhandener `canonical_math_sek1_j9_vectors_component_operations` zunächst beibehalten; ein Umbenennen wäre ein eigener Referenz-Audit | `canonical_math_sek1_j9_vectors_scalar_multiplication` |
| Titel DE | Vektoren komponentenweise addieren und subtrahieren | Vektoren mit Skalaren multiplizieren und geometrisch deuten |
| Title EN | Add and subtract vectors component-wise | Multiply vectors by scalars and interpret geometrically |
| Beschreibung DE | Die lernende Person kann Vektoren in Tupeldarstellung komponentenweise addieren und subtrahieren und das Ergebnis als verknüpfte beziehungsweise rückgängig gemachte Verschiebung geometrisch deuten. | Die lernende Person kann Vektoren in Tupeldarstellung komponentenweise mit Skalaren multiplizieren und geometrisch erklären, wie der Faktor den Betrag verändert, bei negativem Vorzeichen die Richtung umkehrt und bei null den Nullvektor erzeugt. |
| Description EN | The learner can add and subtract vectors in tuple notation component-wise and interpret the result geometrically as combined or reversed displacements. | The learner can multiply vectors in tuple notation component-wise by scalars and explain geometrically how the factor changes magnitude, reverses direction when negative, and yields the zero vector when zero. |

Die vorgeschlagene neue ID wurde nach dem im Mathematik-Split-Werkzeug
verwendeten stabilen `DE-GYM-CANONICAL-MATH:<shortKey>`-SHA1-/UUIDv5-Schema
berechnet; sie ist im heutigen Kanon noch unbelegt. Sie ist bis zur
fachlichen Entscheidung **nicht reserviert**. Ein Alternativmodell mit zwei
vollständig neuen IDs würde die historische Gesamtziel-ID erhalten, aber
mehr Graph- und Lernzustandsmigration auslösen. Die bestehende ID für den
Additions-/Subtraktionsanteil beizubehalten ist daher der kleinste Vorschlag,
nicht bereits eine Freigabe zur Übertragung gespeicherter Mastery-Werte.

## Quelle und Geltung

Die einzige direkte Zuordnung dieser ID in den derzeit geprüften
Mathematik-Mapping-Dateien ist
`bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`,
Quellziel `bw-math-seki-bp2016-3-3-1-12-9ab98be3`,
**BP2016 3.3.1, Kompetenz 12, S. 31**. Der Wortlaut wurde gegen das lokale
offizielle PDF `input/BW/BP2016BW_ALLG_GYM_M.pdf` und die
[offizielle Online-Fassung](https://www.bildungsplaene-bw.de/%2CLde/BP2016BW_ALLG_GYM_M_IK_9-10_01)
kontrolliert. Die Quelle
nennt Tupeladdition, Skalarmultiplikation, geometrische Deutung **und**
einfache Linearkombinationen; die heutige Zuordnung zu `1bc…` ist deshalb
bereits `partial`. Nach einem Split wären beide Teilziele höchstens
`partial`-Teildeckungen dieser einen Quellkompetenz. Insbesondere wäre die
Linearkombinationsfacette weiterhin offen und dürfte nicht durch ein
`exact`-Label oder eine Q2-Kompetenz ohne Sek-I-Platzierung verdeckt werden.
Der vorhandene kanonische Knoten `72dfc164…` „Linearkombinationen von
Vektoren bilden und deuten“ liegt in Q2, nicht unter dem J9-Cluster.
Subtraktion steht im zitierten Quellsatz nicht ausdrücklich; ihre Aufnahme
als Addition eines Gegenvektors ist eine didaktische Ableitung, für die
vor Aktivierung des Teilziels ein belastbarer Sek-I-Quellbezug geprüft werden
muss. Die neuere BW-Fassung führt die gleiche Grundoperation unter einer
anderen Kompetenznummer; die Mapping-Referenz gilt für die im Repo
archivierte Fassung, nicht automatisch für deren Nummerierung.
Für die übrigen sichtbaren Länder ist aus dieser einen BW-Zuordnung keine
direkte Quellendeckung abzuleiten; deren vorhandene kanonische/Kompositions-
Geltung muss pro Scope geprüft werden. Die bayerische technische GK/LK-
Zwischenregel betrifft diesen J9-Split nicht als Qualitätsausnahme.

## Graph und bestehende Verbraucher

Das heutige Atom ist Blatt unter dem Cluster
`78bcc25b…` „Koordinatengeometrie und Vektoren grundlegend nutzen“. Seine
drei direkten Voraussetzungen `94b48b93…` (Orts-/Verschiebungsvektoren),
`19f170e4…` (räumliche Tupel) und `65365dce…` (Sek-I-Orientierung) können
für **beide** Teilziele gelten. Die Teilziele sollten Geschwister sein;
Skalarmultiplikation ist keine pauschale Voraussetzung für Addition und
Subtraktion. Das Elterncluster müsste den neuen Atomknoten genau einmal
enthalten und sein Gewicht neu berechnen.

Die sechs direkten `requires`-Verbraucher brauchen eine **fachliche**
Neuzuordnung, keine globale Ersetzung:

| Verbraucher | Vorläufige Routing-Entscheidung |
| --- | --- |
| `d1352ce0…` Kollinearität | Skalarmultiplikation ist direkt nötig (`v = λu`); alte Additions-ID nur behalten, falls eine konkrete Aufgabe auch Differenzen fordert. |
| `235ae698…` Geraden/Strecken parametrisch | Beide: Stützvektor plus skalierten Richtungsvektor. |
| `b025df0c…` Geradenlage/Schnittpunkt | Beide Operationen im Lösungsweg; die schon vorhandene direkte Abhängigkeit von `235ae698…` macht zusätzliche Kanten möglicherweise redundant. Route gezielt prüfen. |
| `ba343971…` geradlinige Bewegung | Beide für `x(t)=x₀+tv`. |
| `a8ff2666…` Betrag/Abstand/Mittelpunkt | Differenzvektor und Halbierung können beide Teilziele berühren; dieses Ziel ist selbst D-offen und darf nicht anhand seines heutigen gebündelten Texts abschließend geroutet werden. |
| `853905c5…` J9-Prüfungsaufgabe 6 | Aufgabe 4 verwendet `2·AB−AP`, also beide Rechenarten. `requires` entsprechend prüfen; `examData.coveredGoalIds` nicht einfach um den neuen Skalar-Knoten erweitern: Die Aufgabe prüft keinen negativen/Null-Faktor oder die geometrische Skalierungsdeutung unabhängig. |

Die alte ID steht außerdem ausdrücklich in **23 Mathematik-Composition-Views**,
darunter Sek-I- sowie GK/LK-Ansichten. Der neue Knoten darf nicht blind in
alle Views kopiert werden: Jede Platzierung benötigt passende Quelle,
Jahrgang/Stufe und eine eindeutige sichtbare Elternstelle. Vorhandene
Level-4-Mastery auf der alten, breiteren ID darf weder automatisch auf den
neuen Skalar-Knoten kopiert noch ohne Prüfung als unabhängig geprüfte
Addition/Subtraktion ausgegeben werden. Die Migration muss historische
Lernergebnisse nachvollziehbar erhalten und für die neuen Beherrschungs-
aussagen einen expliziten Evidenz-/Neubewertungsentscheid treffen.

## Bild- und M7-Folgeprüfungen

Das aktuelle JPG mit SHA-256
`32848944e678c1cf020506015e0892923b50b31c43c85ae2858845d5c39793e6`
ist in kanonischem und öffentlichem Asset bytegleich. Es zeigt getrennte
Spalten für Addition, Subtraktion und Skalarmultiplikation einschließlich
`2v` und `−v`. Die aktuelle QA ist KI-seitig positiv, **nicht menschlich
freigegeben**. Das Gesamtbild darf nicht automatisch als strenge primäre
Visualisierung zweier verschiedener Atome gelten. Nach Festlegung der
Zielidentitäten pro Teilziel Bildausschnitt oder Neugestaltung, Alttext,
Asset-Hash und unabhängige V-Prüfung entscheiden.

### Zwei präzise Bildaufträge für die Kandidaten

Gemeinsame Vorgabe: didaktische Infografik im **Querformat 16:9**, mit
heller, ruhiger Rasterfläche und großen, farblich unterscheidbaren Pfeilen;
deutsche Kurzlabels, keine Logos, kein dekorativer Kontext. Die beiden
Bilder müssen bei verkleinerter Cockpit-Darstellung lesbar sein. Einheiten
und Pfeilrichtungen müssen mit den Tupeln exakt übereinstimmen. Ein
Bildgenerator kann Zahlen und Formeln verfälschen: vor Übernahme jede
Beschriftung und jede Pfeilgeometrie manuell prüfen; bei Fehlern mathematische
Labels nachträglich kontrolliert setzen. Das bestehende Dreispaltenbild ist
allenfalls eine visuelle Referenz, kein freigegebener Ersatz für beide Bilder.

**A — beibehaltene ID `1bc118c3…`: Addition/Subtraktion.**

```text
Erzeuge eine klare deutschsprachige mathematische Illustration im Querformat
16:9 für genau dieses Lernziel: „Vektoren komponentenweise addieren und
subtrahieren“. Zwei nebeneinanderliegende Koordinatengitter mit gleichen
Einheitsschritten und Achsen. Linkes Feld „Addieren“: a=(2,1), b=(1,2).
Zeichne a vom Ursprung nach (2,1), b von der Spitze von a nach (3,3) und
den Ergebnisvektor a+b=(3,3) vom Ursprung nach (3,3). Rechtes Feld
„Subtrahieren“: Zeichne a=(2,1) und b=(1,2) beide vom Ursprung und den
Differenzvektor a−b=(1,−1) exakt von der Spitze von b bei (1,2) zur
Spitze von a bei (2,1). Jede Farbe bezeichnet in beiden Feldern denselben
Vektor. Kurze, große Labels; keine Skalarmultiplikation, keine weiteren
Rechenarten und keine zusätzlichen Beispiele. Mathematisch korrekte
Pfeilanfänge, Pfeilspitzen, Zahlen und Zeichen sind wichtiger als Dekor.
```

Kandidat für den Alttext: „Zwei Koordinatengitter zeigen dieselben Vektoren
`a=(2,1)` und `b=(1,2)`: Bei der Addition wird `b` an die Spitze von `a`
gehängt und `a+b=(3,3)` erreicht. Bei der Subtraktion zeigt `a−b=(1,−1)`
von der Spitze von `b` zur Spitze von `a`."

**B — neue Kandidaten-ID `ae9e5f1d…`: Skalarmultiplikation.**

```text
Erzeuge eine klare deutschsprachige mathematische Illustration im Querformat
16:9 für genau dieses Lernziel: „Vektoren mit Skalaren multiplizieren und
geometrisch deuten“. Ein einziges Koordinatengitter mit gleichen
Einheitsschritten und Achsen. Vom gemeinsamen Ursprung zeigen drei deutlich
unterschiedliche Pfeile: v=(2,1) nach (2,1), 2v=(4,2) nach (4,2) auf
demselben Strahl, −v=(−2,−1) nach (−2,−1) auf dem Gegenstrahl. Markiere
0v=(0,0) nur als Punkt am Ursprung, ausdrücklich nicht als sichtbaren
Pfeil. Ein kleines separates Zahlenfeld erklärt komponentenweise
2·(2,1)=(4,2) und −1·(2,1)=(−2,−1). Kurze, große Labels; keine Addition,
Subtraktion oder Linearkombination, keine weiteren Beispiele. Prüfe
besonders die Länge und Richtung des negativen Vielfachen.
```

Kandidat für den Alttext: „Vom Ursprung zeigt `v=(2,1)` nach rechts oben,
`2v=(4,2)` doppelt so weit in dieselbe Richtung und `−v=(−2,−1)` gleich
weit in die Gegenrichtung; `0v` liegt als Punkt im Ursprung."

Beide Prompts sind **Arbeitsaufträge**, keine erzeugten oder geprüften
Assets. Vor Veröffentlichung benötigt jeder Bildkandidat seine eigene
Mathematik- und Bild-QS mit aktuellem Zieltext und Hash-Bindung.

Eine Umsetzung erhöht den heutigen `curricularAtomic`-Nenner um **eins**,
sofern beide Ziele im aktiven Scope bleiben. Die vorhandene gemeinsame
P-v2-Kandidatur („Summe, Differenz und Vielfaches“) wird nicht auf zwei
Ziele aufgeteilt, ohne je eigenes Verständnisprofil und neue Bindung; die
älteren D-Runden entscheiden nur den Split, nicht die neuen Texte. A- und
M-Fingerprints sowie die J9-Assessment-Abdeckung neu bewerten. Erst nach
Kanon-/Mapping-/View-/Graph-Anpassungen, frischem begrenzten Buch, zwei
unabhängigen D-Runden je aktuellem Ziel, individuellen D-Resolutionen und
aktuellen P/A/M/V-Nachweisen einen zentralen Fünf-Gate-Bericht erzeugen.
Keine aus alten Hashes übertragene Freigabe und keine 100-%-Behauptung.

## Umsetzungsliste nach fachlicher Freigabe des Zuschnitts

1. Den Quellumfang pro Land prüfen. Für BW die bestehende `partial`-Zeile
   zu `1bc…` erhalten und eine zweite `partial`-Zeile aus demselben
   Quellziel `bw-math-seki-bp2016-3-3-1-12-9ab98be3` zum neuen Skalarziel
   anlegen. Für die Subtraktionsfacette einen passenden Sek-I-Beleg oder
   einen ausdrücklich dokumentierten didaktischen Ableitungsschritt finden;
   die einfache Linearkombination als eigene offene Quellfacette behandeln.
2. Im Kanon die DE-/EN-Texte der Tabelle einsetzen, die neue ID nur nach
   Eindeutigkeitsprüfung anlegen und `semanticAtomic` für beide neuen
   Bedeutungen erneut prüfen. Im J9-Elterncluster die neue ID genau einmal
   ergänzen und das Gewicht aus den eindeutigen atomaren Nachkommen
   ableiten. Die drei heutigen Eingangsvoraussetzungen pro Teilziel prüfen.
3. Die sechs direkten `requires`-Verbraucher anhand ihrer tatsächlichen
   Aufgabe routen. Die J9-Prüfungsaufgabe zusätzlich in `requires` und
   `examData.coveredGoalIds` prüfen; vorhandene Q2-Vektorziele bleiben
   gesonderte spätere Kompetenzen. In den 23 betroffenen Composition-Views
   jeden Zielpfad und jede Bundesland-/Stufen-Geltung einmalig kontrollieren.
4. Historische Lernstände der breiteren ID erhalten; für beide neuen
   Mastery-Behauptungen die nötige Evidenz oder eine Neubewertung festlegen.
   Die alte `semanticAtomic`- und Memory-Entscheidung anhand der geänderten
   Fingerprints neu schreiben, nicht kopieren. Für beide Ziele getrennte
   positive Verständnisnachweise formulieren: bei Addition/Subtraktion
   Komponentenregel **und** Verschiebungsbild; bei Skalierung Faktor,
   Richtungsumkehr und Nullfall.
5. Für jedes Ziel eine passende primäre Visualisierung samt korrektem
   Alttext, Asset-Kopie und Hash-Bindung herstellen und getrennt V-prüfen.
   Danach ein frisches begrenztes Lernzielbuch bauen, zwei unabhängige
   D-Runden und eine begründete Entscheidung pro Ziel durchführen. A-, M-,
   P- und V-Ledger auf die aktuellen Texte binden, die gezielten
   Graph-/Mapping-/View-/Assessment-Checks und abschließend den zentralen
   M7-Bericht ausführen.
