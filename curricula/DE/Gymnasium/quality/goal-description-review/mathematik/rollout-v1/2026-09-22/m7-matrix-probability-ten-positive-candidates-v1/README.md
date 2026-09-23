# B046: zehn Matrix-/Stochastik-P-v2-Kandidaten

22. September 2026, Europe/Berlin; technische Zeitstempel in UTC.

## Ergebnis und Autoritätsgrenze

Zehn Profile mit je zwei neuen, unabhängig verwendbaren DE/EN-Fällen liegen im nativen Authoring-Format vor. Status: `needs_human_review` / `ai_candidate`, E1/G1. Es handelt sich um informierte Ausarbeitung bestehender Evidenzentwürfe, nicht um einen neuen Blindreview, eine Human-Freigabe oder nachgewiesene Lernendenleistung.

Keine Canonical-, QA-, Registry- oder Ledgeränderung. Keine finale Assetbindung, kein `reviewInputFingerprint`, keine materialisierten P-Records und keine registrierte P-Config. Bild-/Scope-Integration bleibt ausdrücklich beim Root.

## Wiederverwendung statt Neustart

Die Aufgabenbasis sind die vollständigen originalen A/B-Understanding-Evidenzen der zehn Ziele aus B046 vom 7. September sowie die gezielten Wiederverwendungshinweise in `2026-09-20/held-current-triage-v1.json`. Die zehn aktuellen DE/EN-Titel und -Beschreibungen sind mit den Originalrecords wortgleich. Das wurde in 80 Einzelvergleichen geprüft.

Die Triage verweist für diese zehn Ziele auf Entwürfe der Understanding-Evidence, nicht auf vollständige registrierte P-Profile. Der auffindbare B046-P-Kandidat `batch-046-current-keep7-v1` gehört den anderen sieben Zielen und wurde nicht als fachliche Freigabe oder als austauschbare Aufgabenquelle verwendet. Daher wurden die bereits vorgeschlagenen Transfers konkret ausformuliert, nicht die Kompetenzen neu entworfen.

Historische Bild-/Scope-Befunde sind in der Quellenbindung als historische Arbeitsaufträge gekennzeichnet. Dieses Paket behauptet weder, dass sie unverändert offen sind, noch, dass sie inzwischen erledigt wären. Insbesondere werden HE-LK-Zuordnung, korrigierte Raster, V-Gates und D-Abschluss nicht durch die neuen P-Texte entschieden.

## Dateien

- `matrix-probability-ten.candidates.json`: zehn native Authoring-Kandidaten, zwanzig vollständige DE/EN-Fallbeschreibungen.
- `authoring-context.json`: aktueller Text, Voraussetzungen, Elternkontext, native Goal-/Profilfingerprints und alle zwanzig originalen A/B-Evidenzfeldergruppen mit Quell- und Recordzeilenhash.
- `check-authoring.mjs`: wiederholbarer, rein lesender Profilkörper-, Quellen-, Text- und Rechencheck.
- `validation.json`: tatsächlicher erfolgreicher Prüflauf.
- Dieses Dokument: individuelle Herleitung, mathematische Argumente und Integrationsgrenze.

Der native Authoring-Container enthält nach bestehendem CandidateSpec keine Statusfelder. Der explizite Kandidatenstatus steht im Begleitmanifest; der vorhandene Materializer setzt später `needs_human_review` / `ai_candidate`. Es wurden keine nicht nativen Zusatzfelder in die Kandidaten eingeschleust.

## Zielgenaue Ausarbeitung und Resultate

| Ziel | Beibehaltene A/B-Substanz | Neue Fälle / geprüfte Ergebnisse |
| --- | --- | --- |
| `0de1e45c` – endliche Matrixpotenzen | n gleichartige Schritte; Startverteilung und Zeithorizonte vergleichen; Stabilisierung von Grenzbeweis trennen | M=[[3/4,1/2],[1/4,1/2]] liefert aus (1,0) nach 1/2/4 Schritten (3/4,1/4), (11/16,5/16), (171/256,85/256); anderer Start nach 4 Schritten (170/256,86/256). Separater Tauschprozess bleibt für (7/10,3/10) periodisch. |
| `922d89fc` – Grenzmatrizen | Grenzmatrixspalten; Fixvektor, Konvergenz und Startunabhängigkeit unterscheiden | Gegebene Potenzformel liefert G=[[2/5,2/5],[3/5,3/5]] und gleiche Grenzzustände. Separater Vergleich von Tauschmatrix und Identität: gleicher Fixvektor, aber keine Grenzmatrix beim Tausch bzw. startabhängiger Grenzzustand bei I. |
| `4c494716` – geometrische Matrixbeschreibung | Schattenregel/Basisbilder, Kontrollpunkte, Zielebene und Richtungswirkung | S(x,y)=(0,2x+y) hat Matrix [[0,0],[2,1]]; P'= (0,1), Q'=(0,5). Separates räumliches Matrixbeispiel beschreibt (x-z,y+2z,0) mit Bildern (6,-3,0) und (0,2,0). |
| `4d331ba0` – Bildpunkte | Gegebenes Matrixprodukt, Dimensionen, eindeutige Bildzuordnung; nicht injektive Variante | Gegebene Scherung [[1,-2],[0,1]] bildet (-1,3) auf (-7,3), (2,0) auf sich ab. Gegebene 2×3-Matrix [[1,0,1],[0,1,-1]] bildet verschiedene Raumpunkte beide auf (3,-4) ab. Keine Matrixherleitung verlangt. |
| `b72d87d4` – Spiegelung | Genau eine Normalenkoordinate negieren; Fixebene, Mittelpunkt, gleiche Abstände, zweimalige Spiegelung | yz-Spiegelung: (-3,2,5)→(3,2,5), Mitte (0,2,5). Separate xz-Spiegelung: (4,-2,-1)→(4,2,-1), Ebenenpunkt (-1,0,3) bleibt fest; zweimalige Anwendung ergibt Identität. |
| `55039f9c` – Parallelprojektion | Richtung muss Zielebene treffen; orthogonal nur Spezialfall; Basisbilder, Ebenenlage und Verbindungsrichtung | Orthogonale yz-Projektion: (-4,2,5)→(0,2,5). Schiefe xy-Projektion entlang (2,-1,2): Regel (x-z,y+z/2,0), Matrix [[1,0,-1],[0,1,1/2],[0,0,0]], (3,-2,4)→(-1,0,0). |
| `35558905` – zentrische Streckung | kI, Vorzeichen versus Betrag, Ursprungsgeraden, andere Dimension | k=-3 in R²: (-1,4)→(3,-12), (2,-2)→(-6,6), Abstandsfaktor 3. Separat k=1/4 in R³: (8,-4,12)→(2,-1,3), Ursprung fest, Abstandsfaktor 1/4. |
| `7bd8f022` – Koordinatenachsendrehung | Orientierte Basisbilder, feste Achsenkomponente, Längenerhaltung, Achsen-/Winkelwechsel | Aktives R_x(90°) bildet (2,-3,4) auf (2,-4,-3) ab. Aktives R_y(-60°) bildet (2,-1,0) auf (1,-1,√3) ab. Betragsquadrate 29 bzw. 5 bleiben erhalten. |
| `52e57eb5` – Vier-/Mehrfeldertafel | Sachtext, Innen-/Randwerte, absolute/relative Darstellung und bedingte Bezugsgruppe | Besuchendentafel [[27,45],[63,45]], N=180: gemeinsame/beteiligte Anteile 3/20, 3/10, 3/8. Separater relativer 3×2-Verkehrsfall liefert [[25,50],[50,25],[75,25]], N=250, mit 3/10, 3/4, 1/2. |
| `c3b9c561` – bedingte Wahrscheinlichkeit | Bedingung identifizieren, positiver Nenner, Tafel-/Baumbezug, Umkehrung | Sendungstafel [[48,12],[52,48]], N=160: 4/5, 12/25, 13/25; alle vier Baumprodukte stimmen. Separater relativer Beutelbaum ergibt gemeinsame Anteile 3/25, 9/50, 7/100, 63/100, rückwärts bedingt 12/19 und 2/9; grüne Steine sind unmöglich, daher keine elementare Bedingung auf Grün. |

Die Fallpaare ändern Struktur, nicht nur Zahlen: anderer Start und periodischer Übergang; anderer Konvergenztyp; Regel→Matrix versus Matrix→Geometrie; quadratische versus rechteckige Matrix; andere Ebene und Fixpunkt; orthogonale versus schräge Richtung; Vorzeichen und Dimension; Drehachse und nichtrechter negativer Winkel; 2×2- versus 3×2-Daten; absolute Tafel versus relativer Baum mit umgekehrter Bedingung.

## Mathematische Herleitungen und Sicherheitsstellen

### Matrixpotenzen und Grenzprozesse

Für `0de1` gilt für den A-Anteil p nach einem Schritt p_neu=1/2+p/4. Damit entstehen aus p_0=1 exakt 3/4, 11/16, 43/64, 171/256 und aus p_0=0 exakt 1/2, 5/8, 21/32, 85/128=170/256. Alle Zustände bleiben Verteilungen. Diese endlichen Ergebnisse allein werden nicht als Konvergenzbeweis ausgegeben.

Für `922d` ist G=[[2/5,2/5],[3/5,3/5]], G²=G und M=G+(1/2)(I-G). Wegen G(I-G)=(I-G)G=0 und (I-G)²=I-G gilt M^n=G+2^(-n)(I-G). Dies ist genau die gegebene Potenzformel. Der Grenzübergang folgt deshalb aus 2^(-n)→0, nicht aus bloßer numerischer Annäherung. Die Tauschmatrix erfüllt S²=I; ihre geraden und ungeraden Potenzen sind verschieden. I^n=I konvergiert zwar, erhält aber sämtliche Startinformation.

In allen Markov-Fällen stehen Zustandsanteile als **Spalten**; Matrixspalten summieren sich zu 1. Kein bereits vertikaler Spaltenvektor wird zusätzlich transponiert.

### Matrixgeometrie und Dimensionen

Bei `4c494` gilt S(p)-p=-x(1,-2) beziehungsweise A(p)-p=-z(1,-2,1). Die Punkt-Bild-Verbindungen besitzen damit tatsächlich die behauptete gemeinsame Projektionsrichtung. Die Bilder liegen in x=0 beziehungsweise z=0.

Bei `55039` ergibt die schräge Richtung d=(2,-1,2) aus z+2t=0 den eindeutigen Wert t=-z/2. Weil d_z≠0, ist die Abbildung für alle Raumpunkte definiert. Aus p+t·d folgt (x-z,y+z/2,0). Beide Projektionsmatrizen sind idempotent und fixieren ihre jeweilige Zielebene. Der orthogonale Spezialfall berechtigt nicht dazu, die allgemeine Kompetenz auf bloßes Nullsetzen einer Koordinate zu verkürzen.

Die rechteckige 2×3-Matrix beim Bildpunktziel multipliziert ausdrücklich einen 3×1-Eingabevektor zu einem 2×1-Ausgabevektor. Die Lernaufgabe verlangt nur das gegebene Produkt und seine Punktzuordnung, keine Matrixherleitung, Inversion oder allgemeine Rangtheorie.

Bei den Spiegelungen bleibt der Mittelpunkt auf der richtigen Ebene; ein Punkt mit x=0 ist nicht automatisch auf der y-Achse. Gleiche Abstände und Normalenrichtung folgen aus dem einzigen Vorzeichenwechsel.

Die Streckungsfaktoren sind von null verschieden. Vorzeichen und Betrag werden getrennt: k<0 bedeutet Gegenstrahl, |k| den positiven Abstandsfaktor. Der Ursprung bleibt fest und wird nicht mit einer eigenen Richtung versehen.

### Drehkonvention

Es gelten ein rechtshändiges Koordinatensystem, aktive Drehungen, Spaltenvektoren und die Rechte-Hand-Regel um die positive Achse. Damit sind:

- R_x(90°)=[[1,0,0],[0,0,-1],[0,1,0]],
- R_y(-60°)=[[1/2,0,-√3/2],[0,1,0],[√3/2,0,1/2]].

Beim zweiten Fall ist insbesondere die z-Komponente des Bilds von e_x positiv. Die Spalten sind orthonormal; (1/2)²+(√3/2)²=1. Ein passiver Koordinatenwechsel würde andere Vorzeichen verlangen und wird hier nicht mit der aktiven Drehung vermischt.

### Tabellen und bedingte Nenner

Alle Tabellen verwenden disjunkte Kategorien und explizite Gesamtheiten. Relative Tafeleinträge beziehen sich zunächst auf die Gesamtheit, nicht auf ihre Zeile. Bedingte Anteile werden erst durch den angegebenen positiven Gruppenrand normiert.

Beim Sendungsbaum ergeben die vier Pfadprodukte exakt 48/160, 12/160, 52/160, 48/160. Beim Beutelbaum entstehen Rot/Schwarz-Randsummen 19/100 und 81/100; die Rückwärtsfragen verwenden genau diese Nenner. P(Grün)=0 folgt aus der ausdrücklich vollständigen Farbauswahl Rot/Schwarz. Die elementare bedingte Wahrscheinlichkeit auf Grün ist deshalb nicht definiert, nicht gleich null.

## Ausgeführte Prüfungen

Aus dem Repository-Root:

```bash
node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-22/m7-matrix-probability-ten-positive-candidates-v1/check-authoring.mjs
```

Gespeichertes Ergebnis: **10/10 native Profilkörper schemakonform; 20/20 originale A/B-Records hashgleich; 80/80 historische Titel-/Beschreibungsvergleiche unverändert; 20/20 Fallgruppen und 228 Rechenassertions bestanden.**

Ganzzahlige Brüche werden im Checker exakt mit ggT gekürzt. Matrix- und Wurzel-/Trigonometrievergleiche verwenden bei Bedarf numerische Toleranz 10^(-10). Die allgemeinen Konvergenz-, Periodizitäts-, Eindeutigkeits- und Drehsinnargumente sind oben und in den Erwartungskriterien explizit hergeleitet; sie werden nicht allein aus Float-Tests abgeleitet.

DE/EN wurden parallel inhaltlich auf gleiche Daten, mathematische Operationen, Voraussetzungen und Ergebnisse geprüft. Der mechanische Check ersetzt diese Inhaltsprüfung nicht und behauptet keinen realen Lernenden- oder Softwaretest.

Die nativen Goal-/Profilfingerprints stammen aus `positiveGoalEvidenceProfileModel.ts`. Der vollständige native P-Review-Input-Gate wurde bewusst nicht ausgeführt, weil Bilder und Scope noch rootseitig finalisiert werden.

## Nächste Integrationsgrenze

Nach unabhängiger Inhaltsprüfung und stabilen Bild-/Scope-Entscheidungen darf der Root eine versionierte P-Config mit genau diesen zehn IDs anlegen, die Kandidaten mit dem vorhandenen nativen Materializer an die tatsächlichen aktuellen Ressourcen binden und den vollständigen nativen P-Check ausführen. Vorher bleibt dieses Paket unmaterialisierte Vorarbeit. Anschließende zentrale Integrations- und Maturity-Gates werden dadurch nicht ersetzt; der AI-Kandidatenstatus bleibt bestehen.

