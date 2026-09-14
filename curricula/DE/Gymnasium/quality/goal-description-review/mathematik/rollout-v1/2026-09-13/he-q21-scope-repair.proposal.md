# Vorschlag: HE-GK Q2.1 quellengenau auswählen und lokal prüfen

Stand: 14. September 2026, Europe/Berlin; Sicherung am 13. September 2026 um 22:49:24 UTC. Informierte Folgeuntersuchung, **keine weitere Blindrunde**. Dieser Vorschlag ist weder eine fachliche Freigabe noch eine implementierte Reparatur. Nach zwischenzeitlicher Pause zur CI-Priorität hat der Hauptagent grüne CI und den begrenzten Fortsetzungsauftrag gemeldet. Das ist keine eigene CI-Verifikation dieses Vorschlagsautors.

Nur dieses Dokument wurde für diese Folgeaufgabe geschrieben. Keine kanonischen Ziele, Views, Aufgaben, Quellenextraktionen, Mappings, Review-Ledger oder Runtimezustände wurden geändert. Bereits vorhandene Änderungen anderer Agenten wurden nicht überschrieben. Die folgenden neuen UUIDs sind ausschließlich Vorschlags-IDs, noch keine registrierten kanonischen Ziele.

## Ergebnis und Integrationsgrenze

Für HE-Q2.1 lassen sich zehn gemeinsame GK+LK-Inhaltsatome präzise auf die amtlichen Spiegelstriche 1–3 beziehen. Sieben weitere Atome desselben heutigen Teilbaums sind ausdrücklich LK-Stoff aus Spiegelstrichen 4–6. Acht zusätzliche Atome haben keine direkte Zuordnung in der aktuellen amtlichen HE-Q2.1-Extraction; ihr Vorhandensein unter demselben Cluster beweist keine GK-Pflicht.

Empfohlen ist eine explizite HE-GK-Auswahl der zehn gemeinsamen Atome, ergänzt um drei kleine lokale Assessment-Endpunkte mit echter Aufgabenabdeckung. Die vorhandene Q2-Analysis-Aufgabe kann nicht unverändert als GK-Endpunkt dienen. Eine reine View-Verengung ist trotzdem **noch nicht integrierbar**: Zwei weiterhin sichtbare GK-Nachfolger außerhalb Q2.1 verlangen jeweils zwei der nicht direkt quellengedeckten Parameteratome, die ihrerseits ein LK-Logarithmusziel voraussetzen. Diese vier Kanten benötigen eine gesonderte fachliche Auflösung. Weder bloßes Entfernen von Zielen noch ein unsichtbarer `prerequisiteOnly`-LK-Pflichtpfad lösen das Problem.

HE-LK und andere Länder bleiben ausdrücklich außerhalb des Änderungsumfangs. Insbesondere ist kein globaler Filter nach `(LK)`, `core`, Kurs-Tags oder Phase vorgeschlagen.

## 1. Quellen und untersuchter aktueller Bestand

Alle folgenden Pfade sind relativ zur Repository-Wurzel.

- Normativ: `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, Q2.1, gedruckte und physische PDF-Seiten **40–41**. S. 40 enthält die gemeinsamen Spiegelstriche 1–3; auf S. 41 beginnt vor Spiegelstrich 4 ausdrücklich „erhöhtes Niveau (Leistungskurs)“. Die tatsächlichen PDF-Seiten wurden visuell geprüft.
- Amtliche Extraction: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`, Q2.1 ab ungefähr Zeile 3422.
- Direkte Zuordnung: `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json`, Q2.1-Mapping ab ungefähr Zeile 821, b6-Entscheidung ungefähr Zeile 4284.
- Legacy-Mapping: `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json`, betreffende Legacy-Verbindungen ungefähr Zeile 1642. Legacy-Zuordnung ist kein Ersatz für eine präzise amtliche Quellenbindung.
- Aktueller Graph: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`. Vollständig untersuchter gemischter Inhalts-Teilbaum: `5ebfc509-0b4c-5c60-befb-2477eb24d4b5` (32 Knoten einschließlich Clustern, 25 verschiedene Inhaltsatome). Die relevanten gemeinsamen/LK-Beschreibungen, Voraussetzungen und erreichbaren terminalen Aufgaben einschließlich Lösungen wurden gelesen. Keine fremden Beschreibungsreview-Ergebnisse wurden dafür benötigt.
- Memory: `curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.config.json` und `canonical-math-full.review.jsonl`; Sichtbarkeit zusätzlich read-only über die tatsächlichen vier HE-GK-Views geprüft.

Die Extraction nennt bei b4–b6 noch S. 40, obwohl diese Spiegelstriche tatsächlich auf **S. 41** stehen. Die dortige Kursangabe `LK` ist korrekt. Dieser Quellenlocator-Befund ist separat zu behandeln; hier wurde nichts an der Extraction geändert.

### 1.1 Exakte gemeinsame Zielauswahl

Die Kürzel G01–G10 dienen nur der Lesbarkeit dieses Vorschlags; maßgeblich sind die vollständigen UUIDs.

| Kürzel | Kanonische ID | Kompetenz | Amtlicher Source-Aspekt, jeweils S. 40 / GK+LK |
|---|---|---|---|
| G01 | `61686d85-0301-550e-bab9-bd9411c3e7ce` | Einfache gebrochen rationale Funktionen untersuchen | `he-math-sekii-q2-1-b01-a01-62ca5610` |
| G02 | `5dabf0b3-89b1-59a6-ae57-014f92becd3b` | Wurzelfunktionen beschreiben und darstellen | `he-math-sekii-q2-1-b01-a01-62ca5610` |
| G03 | `6517427b-cf4e-5ebf-9a76-e1035617687c` | Einfache gebrochen rationale und Wurzelfunktionen ableiten | `he-math-sekii-q2-1-b01-a02-caa4b3e0` |
| G04 | `dd6c5e08-0cc6-53c0-b317-ebaba277c776` | Verschiebungen beschreiben | `he-math-sekii-q2-1-b02-a01-f4b24139` |
| G05 | `772b11c9-1348-5ab9-bc3f-458c46b312b6` | Streckungen/Stauchungen beschreiben | `he-math-sekii-q2-1-b02-a01-f4b24139` |
| G06 | `a12bef54-7595-5f48-a7a8-9cfe1d8e9729` | Allgemeinen Transformationsterm interpretieren | `he-math-sekii-q2-1-b02-a03-f931f5c1` |
| G07 | `4c6369b0-4b58-5ac0-915c-82c348ae1c14` | Spiegelungen beschreiben | `he-math-sekii-q2-1-b02-a02-e37eac63` |
| G08 | `62a1c6f2-1775-5a19-98e0-ed3dd722039f` | Symmetrie verschobener Funktions-/Ableitungsgraphen begründen | `he-math-sekii-q2-1-b02-a04-b2617de0` |
| G09 | `c15fe32d-1c83-4127-b1a4-9125af3d8f5d` | Umkehrbarkeit und einfache Umkehrfunktionen untersuchen | `he-math-sekii-q2-1-b03-a01-482bab0a` sowie `he-math-sekii-q2-1-b03-a03-95042e73` |
| G10 | `dbc13bb0-963b-49a8-a441-2183f4b64c8e` | Zusammenhang von Funktionsgraph und Umkehrgraph erläutern | `he-math-sekii-q2-1-b03-a02-a59d72ba` |

Die elf direkten Mapping-Zeilen stehen auf `exact`; wegen der beiden verschiedenen b3-Aspekte für G09 ergeben sie zehn verschiedene Atome. Das ist keine identische doppelte Source-/Target-Zuordnung.

### 1.2 Präzise abzugrenzende LK-Teilbäume

| Amtliche Quelle, ausschließlich S. 41 / LK | Kanonische Teilbäume und Atome |
|---|---|
| b4: `he-math-sekii-q2-1-b04-a01-851fc75a` | Inversen-Cluster `1e26404a-93ef-45f3-a28c-15679fbae96b`: `06ce2b1b-e888-5322-9ed9-dfc6d322956a` (ln als Umkehrfunktion), `04fe49bf-8c3e-5986-ae83-3c69c0c3e4c8` (ln-Eigenschaften), `8b3ce429-e6bb-5d33-b6aa-6ded41afc74c` (ln-Transformationen). Die drei direkten Mappings sind `partial`. |
| b5: `he-math-sekii-q2-1-b05-a01-729e4e8d` | `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` (ln als Stammfunktion von 1/x), `exact`. Gemeinsam mit dem vorigen Cluster unter `392440db-6a43-59c0-a48d-958128fa16a8`. |
| b6: `he-math-sekii-q2-1-b06-a01-c8d3eb6d` | Cluster `858f7863-50cd-5b4c-9654-a0766f2b2d53` mit `ebc41c8b-5754-5161-9b07-f4525b9fd9b4` (Summen), `0c5e2ed1-4efb-5bdb-a8e5-fe830eb92c85` (Produkte), `91311908-9209-58e4-8429-99dad9df546d` (Verkettungen). Parent und drei Kinder jeweils `exact`. |

Die b6-Formulierung umfasst zusätzlich die graphische Betrachtung der Ableitungen. Das steht derzeit in der Clusterbeschreibung, nicht in den drei Atomdescriptions. Das ist ein offener LK-Abdeckungsbefund, kein Auftrag, in dieser GK-Reparatur HE-LK zu verändern. Eine lokale bilinguale Präzisierung des Summenziels klärt die graphische Handlung, behebt aber weder diesen übergeordneten Abdeckungsbefund noch die falsche HE-GK-Projektion.

### 1.3 Acht zusätzliche Atome: keine pauschale Löschliste

| ID | Aktueller Inhalt / Bindung | Offene Entscheidung |
|---|---|---|
| `972cc7e8-be9c-444c-ba45-98e817b3cf14` | Parameter in Analysisaufgaben nutzen/bestimmen/begründen; nur HE-Legacy-Zuordnung | Fachlich engeren GK-Parameterbedarf außerhalb Q2.1 quellengebunden klären; verlangt heute G01 und LK-Stammfunktion `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4`. |
| `71683f37-24de-4e0f-badd-858b56fa4d64` | Parameter aus Kontextbedingungen bestimmen; keine direkte HE-Zuordnung | Nicht wegen fehlender Q2.1-Zuordnung als fachlich unnötig erklären. Mögliche Zuordnung E.3/Q4.1 prüfen. |
| `91e2f564-3bc8-4924-af85-2a3fa84c1471` | Funktionen/Funktionenscharen im Kontext untersuchen; LK-Tag, keine direkte HE-Zuordnung | Verlangt `71683f37-24de-4e0f-badd-858b56fa4d64`, LK-Stammfunktion `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` und Motivation. |
| `bf17cada-3ccd-5d9a-b9e3-42065cfdbb01` | Modellierung mit erweiterter Funktionsklasse; nur HE-Legacy-Zuordnung | Verlangt beide Parameteratome `972cc7e8-…` und `91e2f564-…`; keine automatische GK-Freigabe. |
| `cf48c918-f6c1-5429-8da6-14df43f2f550` | Produktregel anwenden | Eigener Source-Verweis NRW 2023, 2.4.2, S. 27; keine direkte HE-Zuordnung dieses Atoms. HE behandelt Produkt-/Kettenregeln bereits in E.4 mit anderen Zielen. |
| `ae5010cc-ea8d-5b14-aa4a-b0f2b5846a75` | Kettenregel anwenden | Entsprechender NRW-Verweis; kein Beleg, dass die mathematische Regel insgesamt HE-LK-only wäre. |
| `d8f1fd06-785e-5d15-a8e5-7d8b36f91287` | Zusammengesetzte Funktionen für quantifizierbare Zusammenhänge nutzen | Entsprechender NRW-Verweis; verlangt direkt das HE-b6-LK-Atom `91311908-9209-58e4-8429-99dad9df546d`. |
| `c72a8032-71f6-56ed-a896-06ae435ff2ec` | Verkettete Exponential-/Logarithmusfunktionen analysieren | Nur HE-Legacy-Zuordnung; verlangt LK-Stammfunktion, erweitertes Modellieren und Motivation. |

Diese acht Atome werden im vorgeschlagenen **Q2.1-Pflichtkorridor** nicht als direkt amtlich gedeckt ausgegeben. Ihre bisherige sichtbare Platzierung darf aber erst ersetzt werden, wenn die in Abschnitt 5 genannten Anschlussbedarfe fachlich aufgelöst sind. Das ist der Unterschied zwischen einer quellenbegründeten neuen Auswahl und einer fertigen Scope-Reparatur.

## 2. Genau vorgeschlagene HE-GK-Komposition

Nur diese vier Dateien wären später betroffen:

- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-gk.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g8.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g9.view.json`

Die dortige breite `canonicalSubtree`-Referenz auf `5ebfc509-0b4c-5c60-befb-2477eb24d4b5` würde nach Auflösung der Anschlusskonflikte durch diese explizite Referenzstruktur ersetzt. Sie enthält keine inline verfassten kanonischen Ziele:

```json
{
  "kind": "structure",
  "id": "q21-common-functions",
  "label": "Q2.1 Weitere Funktionsklassen und ihre Eigenschaften",
  "children": [
    { "kind": "goalEntry", "goalId": "61686d85-0301-550e-bab9-bd9411c3e7ce" },
    { "kind": "goalEntry", "goalId": "5dabf0b3-89b1-59a6-ae57-014f92becd3b" },
    { "kind": "goalEntry", "goalId": "6517427b-cf4e-5ebf-9a76-e1035617687c" },
    { "kind": "canonicalSubtree", "goalId": "bf922603-bfb7-5107-9aa9-e270b519d239" },
    { "kind": "goalEntry", "goalId": "c15fe32d-1c83-4127-b1a4-9125af3d8f5d" },
    { "kind": "goalEntry", "goalId": "dbc13bb0-963b-49a8-a441-2183f4b64c8e" }
  ]
}
```

Der bestehende Transformationscluster `bf922603-bfb7-5107-9aa9-e270b519d239` enthält genau G04–G08. Seine direkte amtliche Zuordnung wird nicht behauptet; die Quellenbindung liegt bei seinen fünf Kindern.

Die gemeinsame Aufgabenwurzel `14b19ee4-364e-50bd-b6a3-499471356ef3` darf in den vier GK-Views nicht weiter ungesehen alle neun Aufgaben einführen. Für den begrenzten Q2.1-Vorschlag würden deren fünf fachfremde Aufgabenreferenzen mit ihren bisherigen IDs und Inhalten unverändert übernommen:

`1878f680-095c-511d-aaed-e98393f7fde9`, `2f8a3a90-717d-5ac1-b54e-facca26e9008`, `57aff94e-91b8-5cc6-9f85-3f317ecf36ca`, `e4656e83-3f33-5bda-b0bc-d4b63ec4653e`, `81823f27-0c92-5444-ac4e-32b83169f318`.

Das ist ausdrücklich keine neue fachliche GK-Freigabe dieser Geometrie-/Matrixaufgaben. Insbesondere bleibt ein möglicherweise dort vorhandener anderer Kurs-Scope-Befund außerhalb dieser Q2.1-Untersuchung offen; er wird nicht nebenbei durch Entfernen von Referenzen korrigiert.

Die vier Q2.1-/Analysis-Aufgaben `bd2c5e29-31c6-58bf-9858-d08e9c8a32ad`, `66d75e35-bcbc-5ec9-95f9-8e0558e75f14`, `3db949bd-3091-5a25-a1a0-c8ff0369db94`, `e457af0b-e87f-5d61-9177-41daa6361dd3` würden im HE-GK-Q2.1-Korridor durch die drei folgenden neuen Endpunkte ersetzt. Die bestehenden kanonischen Aufgaben und deren HE-LK-/anderen Länderreferenzen bleiben erhalten. Die Produkt-/Kettenregel-Aufgabe ist wegen ihres aktuellen NRW-gebundenen Zielpaares kein automatisch HE-Q2.1-passender Ersatz; bestehende HE-E.4-Routen bleiben unberührt.

Neue Aufgaben dürfen nicht einfach in das bestehende gemeinsame `contains` von `14b19ee4-364e-50bd-b6a3-499471356ef3` aufgenommen werden: Dadurch könnten sie in HE-LK oder andere Länder gelangen. Sie benötigen eine eigene kanonische, quellengrenzende Ergänzung und ausschließlich die vier ausdrücklich ausgewählten HE-GK-Referenzen. Der endgültige kanonische Einhängepunkt und seine Projektion in allen anderen Views sind vor Umsetzung noch zu prüfen. Es ist keine Änderung bestehender gemeinsamer Voraussetzungen vorgesehen.

## 3. Warum kein bestehendes Assessment unverändert passt

Die read-only Suche über alle aktuellen `examData`-Ziele ergab nur zwei Aufgaben, deren direktes `requires` oder `coveredGoalIds` eines der zehn gemeinsamen Atome referenziert:

| Aufgabe | Tatsächlicher Inhalt | Eignung |
|---|---|---|
| `bd2c5e29-31c6-58bf-9858-d08e9c8a32ad` — Funktionsverknüpfungen und Transformationen untersuchen, Q2 | `f(x)=2e^(0,5x)-3`, `g(x)=ln(x+3)`; Transformation von f, Nullstelle, D/W von g, `g∘f=ln(2)+0,5x`. | Enthält zwingend Logarithmus und Verkettung; 17 deklarierte Voraussetzung-/Abdeckungsziele sind breiter als die vier Teilaufgaben. Beispielsweise werden weder eine graphische Funktionssumme noch ein graphisches Produkt verlangt. Nicht als unveränderte HE-GK-Aufgabe geeignet. |
| `e45a39e5-cc9b-577e-a28d-691319410b9a` — Aussagen präzise begründen und prüfen, Q4 | Gerade Funktion f, `2f-3`, Verschiebung `f(x-1)`, Gegenbeispiel und Symmetrieachse x=1. | Fachlich brauchbare Symmetrieidee, aber Q4-Prozessendpunkt mit weiteren Voraussetzungen und ohne Abdeckung aller gemeinsamen Q2.1-Ziele. Unverändert kein lokaler Q2.1-Abschluss. |

Weitere relevante vorhandene Endpunkte: `66d75e35-bcbc-5ec9-95f9-8e0558e75f14` prüft ln-Eigenschaften/Transformationen; `3db949bd-3091-5a25-a1a0-c8ff0369db94` Produkt-/Kettenregel; `e457af0b-e87f-5d61-9177-41daa6361dd3` die Komposition eines Radius-Zeit- mit einem Kreisflächenmodell. Die letzte Aufgabe ist mathematisch einfach, hängt aktuell aber ausschließlich am Atom `d8f1fd06-785e-5d15-a8e5-7d8b36f91287` und damit an dessen LK-Graphverkettungs-Voraussetzung. Leichte Zahlen beseitigen diese Scope-Kopplung nicht.

## 4. Drei konkrete kleine GK-Q2.1-Aufgaben mit Lösung

Keine Aufgabe ist eine amtliche Prüfungsaufgabe. Es sind neue, noch fachlich zu reviewende Autorenentwürfe auf Grundlage der oben belegten Kompetenzen. Drei kurze Endpunkte vermeiden ein weiteres überdeklariertes Sammelassessment. Zusammen enthalten ihre Abdeckungslisten genau die zehn gemeinsamen Atome. `requires` und `examData.coveredGoalIds` sollen jeweils die unten vollständig angegebenen Listen erhalten; weitere indirekte Voraussetzungen werden nicht als tatsächlich geprüfte Ziele ausgegeben.

### A. Kehrwertpotenzen und Quadratwurzel vergleichen

Vorschlags-ID: `bbb340ed-1009-4966-ae96-bfea4437505a`; Phase Q2; lokales Assessment, nicht neuer Inhaltsatom.

Aufgabe:

1. Vergleiche `r₁(x)=1/x`, `r₂(x)=1/x²` und `w(x)=√x`: Gib Definitions- und Wertemenge an. Skizziere die drei Graphen mit charakteristischen Punkten und begründe die vorhandenen Symmetrien. Beschreibe bei den Kehrwertfunktionen das Verhalten beiderseits von x=0 und für große positive/negative x; erläutere, warum x=0 für w keine Polstelle ist.
2. Übertrage die Beobachtungen auf `rₙ(x)=1/xⁿ` für positive ganze n: Welche Aussagen hängen davon ab, ob n gerade oder ungerade ist?
3. Bestimme die Ableitungen von rₙ und w auf den jeweils zulässigen Bereichen und begründe sie durch Potenzschreibweise und Potenzregel. Erkläre, weshalb die Formel für w′ bei x=0 keinen endlichen Ableitungswert liefert.

Lösung:

- `D(rₙ)=ℝ\{0}`. Für ungerade n ist `W=ℝ\{0}`, der Graph punktsymmetrisch zum Ursprung; bei x→0⁺ gehen die Werte gegen +∞ und bei x→0⁻ gegen −∞. Für gerade n ist `W=(0,∞)`, der Graph y-achsensymmetrisch; beide einseitigen Werte bei 0 gehen gegen +∞. Bei |x|→∞ nähern sich die Werte 0; x=0 und y=0 sind entsprechende Asymptoten. Punkte (1,1) sowie (−1,−1) bzw. (−1,1) sichern die Skizzen.
- `D(w)=W(w)=[0,∞)`. Geeignete Punkte sind (0,0), (1,1), (4,2); w wächst, ist auf diesem Bereich weder y-achsensymmetrisch noch ursprungssymmetrisch. Bei x→0⁺ gilt w(x)→0, keine Polstelle.
- `rₙ=x^(−n)`, also `rₙ′=−n·x^(−n−1)` für x≠0. `w=x^(1/2)`, also `w′=1/(2√x)` für x>0. Am Rand 0 wächst der rechtsseitige Differenzenquotient `√h/h=1/√h` unbegrenzt; es gibt dort keinen endlichen Ableitungswert. Eine separate allgemeine Grenzwertbeweis-Kompetenz wird damit nicht als Assessment-Abdeckung verbucht.

Vorgeschlagene Bewertung: Teil 1 8 BE, Teil 2 4 BE, Teil 3 6 BE; insgesamt 18 BE, vorläufige Bestehensschwelle 9 BE. Rubrik und Schwelle benötigen das normale Assessment-Review; ein bloßer Gesamtpunktestand ersetzt keine differenzierte Zielrückmeldung.

```json
["61686d85-0301-550e-bab9-bd9411c3e7ce", "5dabf0b3-89b1-59a6-ae57-014f92becd3b", "6517427b-cf4e-5ebf-9a76-e1035617687c"]
```

### B. Einen unbekannten Graphen gezielt umformen

Vorschlags-ID: `46bb8422-a822-46e1-8bcc-8b6475994b3a`; Phase Q2; lokales Assessment.

Aufgabe:

Eine auf ℝ differenzierbare Funktion f ist nicht durch einen Term gegeben. Ihr Graph enthält P(0|1) und Q(2|3). Betrachte `h(x)=−2f(−(x−1)/2)+3`.

1. Leite her, wohin ein beliebiger Graphenpunkt (u|v) von f auf dem Graphen von h übergeht. Bestimme insbesondere die Bildpunkte von P und Q. Erläutere eine korrekte Reihenfolge der Verschiebungen, Streckungen und Spiegelungen in beiden Koordinatenrichtungen; erkläre auch den Zusammenhang der beiden Achsenspiegelungen mit einer Punktspiegelung vor den Verschiebungen.
2. Eine Person liest den inneren Faktor −1/2 als horizontale Stauchung auf die Hälfte. Widerlege oder bestätige das anhand deiner Punktabbildung. Wie sähe die horizontale Wirkung stattdessen bei `k(x)=−2f(−2(x−1))+3` aus?
3. Zusätzlich sei f gerade. Begründe nun die Symmetrieachse von h. Erkläre anhand der Tangentensteigungen an symmetrischen Stellen, welche Symmetrie der Graph von h′ besitzt. Eine Kettenregelrechnung ist nicht verlangt.

Lösung:

1. Aus `u=−(x−1)/2` folgt `x=1−2u`, und der neue Funktionswert ist `3−2v`. Somit `(u,v)↦(1−2u,3−2v)`, P↦(1,1), Q↦(−3,−3). Zuerst Spiegelung an der y-Achse und horizontale Streckung mit Faktor 2, dann Verschiebung um 1 nach rechts; vertikal Spiegelung an der x-Achse und Streckung mit Faktor 2, dann Verschiebung um 3 nach oben. Die beiden Achsenspiegelungen zusammen bilden `(u,v)↦(−u,−v)`, also eine Punktspiegelung am Ursprung. Die Streckungen sind damit verträglich; die abschließenden Verschiebungen müssen getrennt beachtet werden.
2. Horizontal wird der Abstand zum späteren Zentrum x=1 verdoppelt, nicht halbiert. Bei k ergibt `u=−2(x−1)` dagegen `x=1−u/2`: horizontale Stauchung auf die Hälfte, ebenfalls mit Spiegelung und anschließender Verschiebung.
3. `h(1+t)=−2f(−t/2)+3=−2f(t/2)+3=h(1−t)`. Daher ist x=1 eine Symmetrieachse. Die gespiegelten Tangenten haben entgegengesetzte Steigungen, also `h′(1+t)=−h′(1−t)`; der Ableitungsgraph ist punktsymmetrisch zu (1,0). Insbesondere h′(1)=0. Das Argument benötigt die ausdrücklich gegebene Differenzierbarkeit; aus bloßen zwei Graphenpunkten wäre keine solche Symmetrie ableitbar.

Vorgeschlagene Bewertung: Teil 1 8 BE, Teil 2 3 BE, Teil 3 5 BE; insgesamt 16 BE, vorläufig 8 BE zum Bestehen. Das ist ein integriertes Transformationsproblem mit fünf konkret adressierten Facetten, nicht fünf pauschal als vollständig gemeistert verbuchte Routinen.

```json
["dd6c5e08-0cc6-53c0-b317-ebaba277c776", "772b11c9-1348-5ab9-bc3f-458c46b312b6", "a12bef54-7595-5f48-a7a8-9cfe1d8e9729", "4c6369b0-4b58-5ac0-915c-82c348ae1c14", "62a1c6f2-1775-5a19-98e0-ed3dd722039f"]
```

### C. Eine Umkehrfunktion durch eine passende Einschränkung ermöglichen

Vorschlags-ID: `1429363f-628f-4f42-80e5-8a9a935147cc`; Phase Q2; lokales Assessment.

Aufgabe:

1. Jemand behauptet, `p(x)=x²` mit Definitionsmenge ℝ habe die Umkehrfunktion `√x`. Prüfe die Behauptung mit einem konkreten Gegenbeispiel und erkläre das Problem.
2. Beschränke p auf `[0,∞)`. Bestimme die Umkehrfunktion mit Definitions- und Wertemenge. Begründe, warum nun wirklich eine Umkehrfunktion vorliegt.
3. Skizziere den eingeschränkten Graphen und seinen Umkehrgraphen. Markiere die zueinander gehörenden Punkte für x=0, 1 und 2 auf dem ursprünglichen Graphen und begründe die geometrische Beziehung. Erkläre außerdem, welche Umkehrfunktion bei der Einschränkung auf `(−∞,0]` entstünde.

Lösung:

1. p(2)=p(−2)=4; derselbe Funktionswert besitzt zwei Urbilder. `√(p(−2))=2≠−2`, daher ist √x keine Umkehrfunktion von p auf ganz ℝ.
2. Auf `[0,∞)` ist p streng monoton steigend und bildet diesen Bereich auf `[0,∞)` ab. Aus y=x² und x≥0 folgt x=√y. Die Umkehrfunktion lautet `p⁻¹(x)=√x` mit D=W=`[0,∞)`.
3. Die Punkte (0,0), (1,1), (2,4) werden zu (0,0), (1,1), (4,2). Der Koordinatentausch entspricht einer Spiegelung an y=x; Definitions- und Wertemenge werden vertauscht. Auf `(−∞,0]` ist p streng monoton fallend, und die Umkehrfunktion lautet `−√x` mit D=`[0,∞)` und W=`(−∞,0]`.

Vorgeschlagene Bewertung: Teil 1 3 BE, Teil 2 3 BE, Teil 3 4 BE; insgesamt 10 BE, vorläufig 5 BE zum Bestehen.

```json
["c15fe32d-1c83-4127-b1a4-9125af3d8f5d", "dbc13bb0-963b-49a8-a441-2183f4b64c8e"]
```

Diese drei Aufgaben bleiben sprachlich deutsch wie die hier gelesenen kanonischen lokalen Aufgaben. Eine spätere bilinguale Aufgabenfassung wäre zusätzlich fachlich abzugleichen; sie ist nicht stillschweigend als vorhanden ausgegeben. Neue Inhalte oder Memory-Karten sind für das Bearbeiten nicht vorausgesetzt.

## 5. Routen, Voraussetzungen und tatsächlich offene Sperren

### 5.1 Geplanter lokaler Routenabschluss

| Gemeinsame Route | Neuer lokaler Endpunkt |
|---|---|
| G01/G02 → G03 | A, `bbb340ed-1009-4966-ae96-bfea4437505a` |
| G04/G05/G07 → G06; G07 und vorhandene elementare Ableitung → G08 | B, `46bb8422-a822-46e1-8bcc-8b6475994b3a` |
| G09 → G10 | C, `1429363f-628f-4f42-80e5-8a9a935147cc` |

Alle zehn Inhaltsatome haben damit einen unmittelbar über `requires` gekoppelten, tatsächlich passenden Q2-Endpunkt. Keiner benötigt b4–b6, ln, Produktgraphen oder eine allgemeine Verkettungsregel. Die Graph-/Umkehrskizzen sind echte Aufgabenhandlungen; ein neues Illustrationsasset ist nicht erforderlich, um den Entwurf fachlich zu verstehen.

Die zehn derzeitigen direkten Voraussetzungen wurden vollständig geprüft. Außer internen G01–G10-Kanten sind erforderlich:

- `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` — Mathematik-Motivation;
- `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` — Ableitungen elementarer Funktionen;
- `b9bbd2a8-1379-5ffb-817f-41467d48abef` — Hauptsatz der Differential- und Integralrechnung.

Der bestehende Hauptsatz als Voraussetzung schon für die Untersuchung von Kehrwert-/Wurzelfunktionen ist didaktisch stärker als diese Aufgaben selbst verlangen. Er ist aber in den vier HE-GK-Projektionen vorhanden und führt nicht in die hier ausgeschlossenen LK-Q2.1-Ziele. Eine Änderung dieses gemeinsamen kanonischen `requires` würde andere Profile berühren und ist daher nicht Bestandteil des Vorschlags. Die untersuchten übergeordneten kanonischen Cluster, einschließlich `5ebfc509-…`, `98dcf9bd-d119-5eb1-835c-7d719f67b485` und Mathematik-Wurzel `c01b1ce9-a667-4a46-b251-ec33ae602b15`, tragen keine zusätzlichen `requires`.

### 5.2 Vier neue fehlende Kanten bei bloßer Verengung

In **jeder** der vier HE-GK-Views bleiben diese zwei Nachfolger Zielbestandteil:

| Weiterhin sichtbarer Nachfolger | Seine durch die probeweise Auswahl entfallenden direkten Voraussetzungen |
|---|---|
| `993a14e8-60f0-5764-9340-b2447a5fa84b` — Parameter in Funktionenscharen deuten, HE Q4.1 S. 51 b1 | `972cc7e8-be9c-444c-ba45-98e817b3cf14` und `91e2f564-3bc8-4924-af85-2a3fa84c1471` |
| `c0e34fa8-fde5-5a4e-9b84-c5d5db719b58` — Mathematische Probleme erkennen und formulieren | dieselben zwei IDs |

Die betroffenen Fortsetzungen umfassen insbesondere `e33e75e3-eae5-5a09-862f-d1a11176373f` (Transformationsscharen), `bfa2351c-735e-56eb-a778-2413aa68db42` (Parameterwirkung auf Schargraphen), den Q4-Endpunkt `1969d4dc-2ba6-5c26-ad7c-6e0114ab1fdf` (Funktionenscharen) und den Problemlöse-Endpunkt `f77b9b40-6afc-5d9e-821e-79903bbbcb94`. Die letzten beiden Aufgaben wurden einschließlich Lösungen gelesen; ihre Existenz ersetzt keinen lokalen Q2-Abschluss.

Die beiden Parameteratome verlangen wiederum `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4`. Sie einfach als `prerequisiteOnly` mitzunehmen würde den unerwünschten LK-Stoff weiterhin verpflichtend machen. Auch `bfa2351c-…` kann nicht unverändert als einfacher Ersatz für `993a14e8-…` eingesetzt werden: Es verlangt gerade `993a14e8-…`.

Konkrete Quellen-/Zielkandidaten für die notwendige nächste fachliche Entscheidung:

- HE E.3, S. 32, `he-math-sekii-e-3-b01-a04-377d6916` → `6947245e-6bd7-52d7-9bc2-0c60cfa447c5`: Parameterwerte aus Eigenschaften ganzrationaler Funktionen bestimmen.
- HE E.3, S. 32, `he-math-sekii-e-3-b01-a05-b37e1496` → `250daae6-58fd-59e4-8a11-f994e789ee47`: einfache Parametertransformationen `g=a·f+b`.
- HE Q4.1, S. 51, `he-math-sekii-q4-1-b01-a02-825e2758` → `993a14e8-…` und `bfa2351c-…`: Parameterbedeutung, gemeinsames Niveau.
- HE Q4.1, S. 51, `he-math-sekii-q4-1-b03-a01-2b3bbc18` und `he-math-sekii-q4-1-b03-a02-29a7b77c` → `e33e75e3-…`: weitere bekannte Funktionsklassen, Parameter ausschließlich Streckung/Verschiebung.

Die ersten beiden vorhandenen Ziele sind fachlich engere Grundlagen, aber **keine automatisch austauschbaren Alias-IDs** für die breiteren Parameteratome. Eine kanonische Kantenänderung an `993a14e8-…` oder `c0e34fa8-…` würde HE-LK/andere Länder mitverändern. Falls diese unverändert bleiben müssen, wäre eine gesondert begründete GK-spezifische Ziel-/Routenergänzung samt sämtlichen abhängigen GK-Verweisen zu planen. Das ist eine Erweiterung des Auftrags, nicht eine in diesem Dokument schon gelöste Q2.1-Kompositionsänderung. Die Nutzerentscheidung und fachliche Quellenprüfung bleiben hierfür offen.

### 5.3 Read-only Projektionsdiagnostik

In-Memory-Probe, ohne Dateien zu schreiben: `normalizeCanonicalLandscape`, `normalizeCompositionView`, `collectCompositionProjectionRoleGoalIds` und `compileCompositionView` aus den aktuellen nativen Modulen wurden auf die zehn gemeinsamen Ziele und die fünf unverändert beibehaltenen anderen Q2-Aufgaben angewendet. Die drei neuen Aufgaben wurden dabei **noch nicht** als kanonische Knoten kompiliert.

| View | Target-Knoten vorher / Probe | Native Composition-Findings | Neue direkte fehlende Voraussetzungskanten |
|---|---:|---:|---:|
| `de-he-sekii-gk` | 698 / 672 | 0 | 4, exakt wie oben |
| `de-he-gk` | 1031 / 1005 | 0 | 4 |
| `de-he-gk-g8` | 980 / 954 | 0 | 4 |
| `de-he-gk-g9` | 1003 / 977 | 0 | 4 |

Das sind Zahlen der begrenzten Negativprobe, **keine vorgeschlagene Zielreduktionsmetrik und kein bestandenes Curriculums-Gate**. Der Compiler prüft hier die Struktur, nicht die fachliche Legitimität der Auswahl oder den vollständigen Lernweg. Die 26 weniger sichtbaren Knoten umfassen Cluster und Aufgaben, nicht 26 fachlich entbehrliche Kompetenzen.

Der transitive `requires`-Abschluss der zehn gemeinsamen Atome enthält in den drei jahrgangsübergreifenden Views keine weder als `target` noch als `prerequisiteOnly` projizierten IDs. Im reinen `de-he-sekii-gk` fehlen in der Probe dagegen 28 weiter zurückliegende Sek-I-IDs in beiden Projektionsrollen. Die Probe hat keine dieser 28 IDs neu entfernt; sie befinden sich nicht unter dem verengten Q2.1-/Q2-Aufgabenbereich. Damit ist für einen frischen Sek-II-Einstieg **kein vollständiger Voraussetzungen-Nachweis** erbracht. Laufzeit-Nachladen, vorhandene globale Mastery oder eine Eingangserhebung wurden hier nicht geprüft und dürfen nicht vorausgesetzt werden. Falls eine explizite `prerequisiteOnly`-Ergänzung vorgesehen wird, muss sie anhand dieser echten Grundlagenabhängigkeiten erfolgen und darf keine Mastery fingieren.

Die genaue diagnostische Fehlmenge für diesen Abschluss ist:

```json
[
  "2bb4bb91-7929-483a-b735-44275f6b5cdc",
  "65365dce-f33f-49d8-9516-42f75883aa86",
  "ca8b2e67-7d14-5baf-8404-26820fe3d548",
  "624764d6-becd-5f9b-ada3-0d4f9d143073",
  "fe07241a-b779-5f35-a82d-7aa51ae74f42",
  "a4c2b831-02f0-5d55-a300-7823a71352c4",
  "6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077",
  "cafd6520-c4af-4109-9863-cc49ba6fad4d",
  "e82d8d3a-9012-5482-afe6-ab0d727a49bb",
  "d825f7ce-e19b-594a-8181-eff199c21d93",
  "9ef6c4fa-b97a-5d7a-86c1-96690f02d916",
  "cf474eab-1379-4877-907e-58b0892ce734",
  "1a25ef44-f310-4c23-9ba8-44baec60d3b0",
  "8d1bb6ce-2433-4637-94ba-3bdc35fa5b10",
  "4b67bed9-06da-40b2-a306-24e9e7dfd390",
  "d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe",
  "3fde4db5-9e92-5f3a-98e1-d386a42b9e01",
  "191c67db-44a8-4f63-994a-d85e8e301194",
  "11e3cf89-9224-5894-8e4a-ae8ff5af0119",
  "2f565855-bcd6-4da5-bc80-4b72a2d93d50",
  "f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97",
  "6b0075bb-f71c-59f6-ab98-fb894568cc26",
  "b41cb496-dad5-596e-9c23-cdcbdab3ec2e",
  "0a6dab2e-1bbb-5587-adb0-456d3991c327",
  "5d1decb2-b01b-5c85-88fc-9fc255ff9776",
  "4eeab7d5-eeb3-579b-845e-1c52ffe9e89f",
  "ee48e811-4c9c-5080-9836-8403fc9f0810",
  "05012547-7263-5bfa-9e7c-df970745a011"
]
```

Diese Liste ist ausdrücklich kein Vorschlag, Sek-I-Inhalte zu neuen Sek-II-Pflichtzielen zu machen.

## 6. Memory-Sichtbarkeit

Für G01–G10 stehen die aktuellen Ledger-Entscheidungen sämtlich auf `no_memory_needed`. Ihre Fingerprints wurden read-only mit derselben semantischen Normalisierung und Hashprojektion wie `app/scripts/memoryCardReview.ts` nachgerechnet; **10 von 10** stimmen mit dem aktuellen kanonischen Text überein. Das ist eine Aktualitätskontrolle vorhandener Entscheidungen, keine neue Memory-Review-Freigabe.

Die beiden zusätzlichen Produkt-/Kettenregelatome `cf48c918-f6c1-5429-8da6-14df43f2f550` und `ae5010cc-ea8d-5b14-aa4a-b0f2b5846a75` sind `memory_required`, mit Memory-Ziel `ca708087-71f8-5fae-91c5-b80721a4208f` und Deck `de_gymnasium_math_analysis_core`. Dieses Memory-Ziel bleibt in allen vier Probeprojektionen als Target sichtbar; es darf nicht zusammen mit dem Q2.1-LK-Teilbaum entfernt werden, weil es auch andere Analysisziele bedient.

Zusätzlicher read-only Test über **alle verbleibenden** `memory_required`-Targets der Probe:

| View | Verbleibende `memory_required`-Inhaltsziele | Ohne mindestens ein referenziertes sichtbares Memory-Ziel |
|---|---:|---:|
| `de-he-sekii-gk` | 29 | 0 |
| `de-he-gk` | 35 | 0 |
| `de-he-gk-g8` | 33 | 0 |
| `de-he-gk-g9` | 35 | 0 |

Die konfigurierte offizielle Memory-Prüfung enthält derzeit nur die Sichtbarkeits-Scopes DE-Sek-I und BW-Sek-I, **nicht HE-Sek-II**. Der obige Zusatztest ersetzt daher weder eine passende dauerhafte Scope-Konfiguration noch Karten-, Origin-, Deck- und Reifegradprüfungen nach einer tatsächlichen Umsetzung. Neue Aufgaben sind Assessment-Knoten, keine neuen zu memorierenden Inhaltsziele; hier werden keine neuen Karten vorgeschlagen.

## 7. Umsetzung erst nach offenen fachlichen Entscheidungen

Die folgenden Arbeitsschritte sind **nicht ausgeführt**:

1. Die vom Hauptagenten gemeldete grüne CI bleibt Voraussetzung für die weitere Hauptarbeit; dieser Autor hat keine eigene GitHub-/CI-Verifikation durchgeführt. Eine spätere tatsächliche Reparatur benötigt erneut ihre eigenen passenden Prüfungen.
2. Fachliche Entscheidung zu den acht nicht direkt Q2.1-gemappten Atomen und insbesondere den vier externen Voraussetzungskanten treffen. Keine GK-Nachfolger entfernen, um eine Routenprüfung grün zu machen.
3. Aufgaben A–C fachlich und hinsichtlich tatsächlicher Coverage, Lösungen, Bewertungsrubrik, Alters-/Kursniveau und Quellenbindung prüfen; neue kanonische IDs und Ergänzungswurzel kontrolliert registrieren. Keine Freigabe allein aus diesem Autorenentwurf ableiten.
4. Die vier HE-GK-Views explizit umbinden; bestehende HE-LK- und andere Länderprojektionen inklusive effektiver Voraussetzungen, Aufgaben und Memory-Sichtbarkeit vor/nachher unverändert nachweisen. Keine globale Kurs-Taxonomie umschreiben.
5. Für HE-GK geschlossene lokale Zielrouten und reale Voraussetzungserreichbarkeit prüfen, einschließlich der getrennten Sek-II-Einstiegslücke. Die im Dokument gezeigte strukturell gültige Negativprobe reicht nicht.
6. Bei tatsächlichen kanonischen/View-/Assessment-Änderungen alle betroffenen Quellen-, Mapping-, Aufgaben-, Atomicity-/Memory- und Beschreibungsbindungen gemäß ihrem wirklichen Änderungsumfang neu prüfen; Qualitätstatus regenerieren und geschützte Maturity-Floors kontrollieren. Keine historischen Review-Entscheidungen umschreiben oder als neue Freigabe ausgeben.

Offen bleiben außerdem der präzise Extraction-Seitenlocator b4–b6, die atomare LK-Ableitungsabdeckung von b6 und mögliche andere HE-Kurs-Scope-Befunde außerhalb Q2.1. Sie werden nicht durch dieses begrenzte Dokument als erledigt erklärt.
