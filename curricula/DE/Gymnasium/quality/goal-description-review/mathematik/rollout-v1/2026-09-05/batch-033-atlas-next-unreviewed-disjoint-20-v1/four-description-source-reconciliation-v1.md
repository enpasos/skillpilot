# B033: Quellensynthese zu vier lokalen Beschreibungspräzisierungen

Stand: 2026-09-06. Dies ist eine AI-Synthesis/Quellenabstimmung nach Lektüre beider vorhandener Runden, keine neue Blindrunde, Übernahme, menschliche Einzelabnahme oder Abschlussresolution. Ausschließlich dieses Dokument wurde angelegt. Die vier aktuellen DE/EN-Beschreibungen stimmen weiterhin exakt mit beiden alten Records überein; eine neue vollständige Seiten- oder Geltungsmatrixprüfung wird hier nicht behauptet.

Alle Titel und IDs bleiben unverändert. Die folgenden Ersatztexte sind konkrete Vorschläge; Root bündelt etwaige Übernahmen mit den getrennten B033-Graphänderungen, bevor neue aktuelle Abschlussreviews vorbereitet werden.

## Vorschläge und unmittelbar betroffene Kontexte

### c65ecabf-d00b-4e2d-99ae-b64692325ffb

Titel DE unverändert: Funktionswerte berechnen
Titel EN unverändert: Calculate function values

Bisher DE: Die lernende Person kann zu gegebenen Termen $f(x)$ Funktionswerte für konkrete x-Werte korrekt berechnen.
Bisher EN: The learner can correctly calculate function values for concrete x-values given terms $f(x)$.

Vorschlag DE: Die lernende Person kann zu gegebenen Funktionstermen $f(x)$ Funktionswerte für konkrete x-Werte korrekt berechnen und als die zu diesen Eingaben gehörigen Ausgabewerte deuten.
Vorschlag EN: The learner can correctly calculate function values for concrete x-values from given function terms $f(x)$ and interpret them as the outputs corresponding to those inputs.

Aktueller Bild-Alttext: Didaktische Visualisierung zum Lernziel "Funktionswerte berechnen". Die lernende Person kann zu gegebenen Termen $f(x)$ Funktionswerte für konkrete x-Werte korrekt berechnen.

Records: math-b033-round-a-openai-gpt5-20260905.015 (keep); mathematik-b033-round-b-record-015 (revise). Synthesis aus A KEEP / B REVISE: Die Deutung macht die bereits benötigte Eingabe-Ausgabe-Bedeutung sichtbar. Keine zusätzliche Sachmodellierung, Tabellenpflicht oder vorgeschriebene Rechenmethode.

Quelle: HE-PDF, E.1, gedruckte/PDF-S. 31: „Definitionsmenge, Wertemenge, Wertetabelle, grafische Darstellung, Funktionsgleichung und Funktionsterm“. HE-ALT enthält Ziel 2618a712-e625-426d-aa87-ad11ebe707e1 (Wertetabellen und Funktionswerte aus Funktionstermen bestimmen), das HE-MAP teilweise auf diese ID abbildet. Ergänzend BY-PDF, M7 1.1, S. 1: „berechnen Werte von Termen“; BY-MAP ordnet 7ee3da1c-1f20-5038-9828-ab74e0e1e49f teilweise zu. Die neue Deutung ist fachliche Operationalisierung dieser Beziehungen, kein behauptetes wörtliches Lehrplanzitat.

Konkrete Risiken: Voraussetzung 09f47964… bleibt bis zum gesonderten Funktionsbegriff-Split relevant. Direkte Nachfolger: Folgen 67c4d6f8…, lineare Parameter 2d75fd3f…, quadratische Funktionen 29ce4053…, Achsen-/Graphenschnittpunkte 0b23413e…, mittlere Änderungsrate ae20183e…, digitale Funktionsanalyse 1eb7b2ce…. Keine Textänderung dieser Nachfolger aus dem Vorschlag allein ableiten. Das tatsächlich betrachtete vorhandene Bild zeigt bereits 4 → 11, f(4)=11, Tabelle und Punkt (4|11); es passt zur Präzisierung.

### d8c9eb57-1614-4c1d-829a-618134def352

Titel DE unverändert: Symmetrie von Funktionsgraphen nachweisen
Titel EN unverändert: Verify symmetry of function graphs

Bisher DE: Die lernende Person kann Achsensymmetrie zur y-Achse und Punktsymmetrie zum Ursprung rechnerisch nachweisen (z. B. mit $f(-x)=f(x)$ bzw. $f(-x)=-f(x)$) und Graphen entsprechend beurteilen.
Bisher EN: The learner can verify symmetry with respect to the y-axis and point symmetry about the origin algebraically (e.g., using $f(-x)=f(x)$ or $f(-x)=-f(x)$) and assess graphs accordingly.

Vorschlag DE: Die lernende Person kann Achsensymmetrie zur y-Achse und Punktsymmetrie zum Ursprung rechnerisch nachweisen (z. B. mit $f(-x)=f(x)$ bzw. $f(-x)=-f(x)$), dabei prüfen, ob mit jedem x auch −x zur Definitionsmenge gehört, und Graphen entsprechend beurteilen.
Vorschlag EN: The learner can verify symmetry with respect to the y-axis and point symmetry about the origin algebraically (e.g., using $f(-x)=f(x)$ or $f(-x)=-f(x)$), checking that the domain contains −x whenever it contains x, and assess graphs accordingly.

Aktueller Bild-Alttext: Didaktische Visualisierung zum Lernziel "Symmetrie von Funktionsgraphen nachweisen". Die lernende Person kann Achsensymmetrie zur y-Achse und Punktsymmetrie zum Ursprung rechnerisch nachweisen (z. B. mit $f(-x)=f(x)$ bzw. $f(-x)=-f(x)$) und Graphen entsprechend beurteilen.

Records: math-b033-round-a-openai-gpt5-20260905.017 (revise); mathematik-b033-round-b-record-017 (keep). Synthesis aus A REVISE / B KEEP: Die Definitionsmenge wird tatsächlich mitgeprüft; der Aufgabenraum wird nicht auf vorab als symmetrisch deklarierte Definitionsmengen verengt. Die jeweilige Gleichung muss für alle zulässigen x gelten. Beispiel für die Lücke: x² auf [−1,2] erfüllt die Termgleichheit auf der gemeinsamen Teilmenge, aber der Punkt mit x=2 hat keinen Spiegelpartner bei x=−2.

Quelle: HE-PDF, E.1, S. 31: „Symmetrie von Funktionsgraphen“; HE-X enthält he-math-sekii-e-1-b01-a06-28889d6d, HE-REVIEW bildet den Aspekt exakt ab. BW-X/BW-REVIEW ordnen bw-math-seki-bp2016-3-3-4-10-40750b8d teilweise zu; Original §3.3.4(10), gedruckte S. 36 / PDF-S. 38: „Symmetrie (zum Ursprung oder zur y-Achse)“. Die Bedingung an die Definitionsmenge ist notwendige Mathematik, keine zusätzlich gefundene explizite Originalklausel.

Konkrete Risiken: Direkter Assessment-Nachfolger e7013f6e-6051-5c88-8b4b-e054dc8db4cc setzt die Fontäne auf [0,9], nennt aber x=4 als Symmetrieachse. Das gilt für die vollständige zugehörige Parabel; der eingeschränkte Modellgraph ist nicht symmetrisch zu x=4 (9 würde auf −1 gespiegelt). Die Achsenaufgabe kann durch klare Trennung beider Graphen erhalten bleiben. Wenn d8c9… weiter als coveredGoal beansprucht wird, muss außerdem y-/Ursprungssymmetrie tatsächlich geprüft werden. Diese Assessment-Entscheidung liegt separat bei Root. Das tatsächlich betrachtete Bild mit x² und x³ ist für deren natürliche Definitionsmenge R korrekt; es zeigt keinen eingeschränkten Gegenbeispielbereich und muss dafür nicht ersetzt werden.

### 235ae698-369f-4dbe-b46f-87e8b65bb03d

Titel DE unverändert: Geraden und Strecken im Raum parametrisch beschreiben
Titel EN unverändert: Describe lines and segments in space parametrically

Bisher DE: Die lernende Person kann Geraden und begrenzte Strecken im Raum in einfachen Fällen mit Stütz- und Richtungsvektor parametrisch angeben und aus Punktangaben aufstellen.
Bisher EN: The learner can state lines and finite segments in space in simple cases using a support vector and a direction vector and construct them from point descriptions.

Vorschlag DE: Die lernende Person kann Geraden im Raum in einfachen Fällen mit Stütz- und Richtungsvektor parametrisch angeben, begrenzte Strecken zusätzlich durch einen passenden beschränkten Parameterbereich beschreiben und beide Darstellungen aus Punktangaben aufstellen.
Vorschlag EN: The learner can represent lines in space parametrically in simple cases using a support vector and a direction vector, describe finite segments by additionally specifying an appropriate bounded parameter interval, and construct both representations from point descriptions.

Aktueller Bild-Alttext: Didaktische Visualisierung zum Lernziel "Geraden und Strecken im Raum parametrisch beschreiben". Die lernende Person kann Geraden und begrenzte Strecken im Raum in einfachen Fällen mit Stütz- und Richtungsvektor parametrisch angeben und aus Punktangaben aufstellen.

Records: math-b033-round-a-openai-gpt5-20260905.009 (revise); mathematik-b033-round-b-record-009 (revise). Exakter Ersatz aus Runde A, inhaltlich mit Runde B übereinstimmend (REVISE / REVISE). Für eine Strecke müssen die Randwerte die Endpunkte erzeugen und enthalten sein. Kein allgemeiner Zwang zu [0,1]: Bei anders skaliertem Richtungsvektor oder anderem Stützpunkt ist ein anderes abgeschlossenes beschränktes Intervall passend.

Quelle: BW-PDF, §3.3.3(12), gedruckte S. 34 / PDF-S. 36: „Geraden und Strecken vektoriell mithilfe von Parametergleichungen beschreiben“. BW-X enthält bw-math-seki-bp2016-3-3-3-12-c1437ec7; BW-REVIEW ordnet exakt zu. Der Parameterbereich präzisiert die bereits geforderte Strecke, keine neue Kompetenz.

Konkrete Risiken: Direkte Nachfolger b025df0c… (Geradenlage/Schnittpunkt) und ba343971… (Bewegung); deren Parameter dürfen nicht ohne Kontext als Zeit oder als [0,1]-Parameter interpretiert werden. Die gesonderten Splits der bisherigen Voraussetzungen a8ff2666… und 1bc118c3… erfordern eigene gezielte Kantenentscheidungen. Das tatsächlich betrachtete Bild zeigt korrekt A=(1|2|0), B=(4|3|2), B−A=(3|1|2), t∈R bzw. 0≤t≤1 und beschriftete Endpunkte. Es deckt die Präzisierung bereits ab.

### ba343971-10e5-4b05-b005-405b9c1ce447

Titel DE unverändert: Geradlinige Bewegungen mit Vektoren modellieren
Titel EN unverändert: Model rectilinear motions with vectors

Bisher DE: Die lernende Person kann gleichförmige geradlinige Bewegungen in Ebene und Raum mit Orts- und Richtungsvektoren beschreiben und Ergebnisse im Anwendungskontext deuten.
Bisher EN: The learner can describe uniform rectilinear motions in the plane and in space using position and direction vectors and interpret results in context.

Vorschlag DE: Die lernende Person kann gleichförmige geradlinige Bewegungen in Ebene und Raum mit zeitabhängigen Ortsvektoren beschreiben, dabei Anfangsort und konstanten Geschwindigkeitsvektor im Modell kenntlich machen und Ergebnisse im Anwendungskontext deuten.
Vorschlag EN: The learner can describe uniform rectilinear motion in the plane and in space using time-dependent position vectors, make the initial position and constant velocity vector explicit in the model, and interpret results in context.

Aktueller Bild-Alttext: Didaktische Visualisierung zum Lernziel "Geradlinige Bewegungen mit Vektoren modellieren". Die lernende Person kann gleichförmige geradlinige Bewegungen in Ebene und Raum mit Orts- und Richtungsvektoren beschreiben und Ergebnisse im Anwendungskontext deuten.

Records: math-b033-round-a-openai-gpt5-20260905.011 (revise); mathematik-b033-round-b-record-011 (revise). Methodenoffene Synthesis aus A/B REVISE: Anfangsort, Geschwindigkeit und Zeitzuordnung werden eindeutig. Keine vorgeschriebene Formelgestalt, Parameterbenennung, Zeitnullpunktkonvention oder Beschränkung auf direkt vorgegebenes r₀+t·v; eine Richtungsdarstellung mit expliziter korrekter Zeitzuordnung ist ebenso möglich. Die Ergebnisdeutung bleibt weiter als nur Positionsberechnung.

Quelle: BW-PDF, §3.3.3(14), gedruckte S. 34 / PDF-S. 36: „geradlinige Bewegungen vektoriell beschreiben“. BW-X enthält bw-math-seki-bp2016-3-3-3-14-494126ba; BW-REVIEW ordnet exakt zu. Gleichförmigkeit steht bereits im aktuellen kanonischen Text; die Ergänzung macht dessen Modellbedeutung sichtbar.

Konkrete Risiken: Direkter Nachfolger ea664a30-98be-508e-90ac-5304679814ee und assessments/mathematik/seki/j10/draft_v1.md, Task 5: r(t)=(1|2|0)+t·(2|1|1) hat bislang keine ausdrückliche Zeit- oder Längeneinheit. Die kanonische Lösung nennt den zweiten Vektor nur Richtungsvektor. Minimale spätere Möglichkeit bei unveränderten Zahlen: Ortskoordinaten in m, t in s erklären; Teil 1 Anfangsort und konstante Ortsänderung pro Sekunde deuten lassen; Lösung r(0)=(1|2|0) m, v=(2|1|1) m/s, r(2)=(5|4|2) m. Bei t≥0 müssen Teile 2/3 ausdrücklich die Trägergeraden behandeln; ein Geradenschnitt ist ohne zweites Zeitmodell kein gleichzeitiges Treffen. Draft, eingebettete Aufgabe und Lösung wären gemeinsam zu berichtigen; die bisherige Freigabe ist keine Abnahme des Ersatztexts. Das von der delegierten Read-only-Prüfung tatsächlich betrachtete Bild enthält bereits p₀=(2|1|0), v=(3|0|1) pro Sekunde, p(t)=p₀+t·v und p(2)=(8|1|2). Die Längeneinheit fehlt; die Beschriftung Richtungs-/Geschwindigkeitsvektor ist weniger präzise. Daraus folgt kein notwendiger Bildaustausch. Root entscheidet die Assessment-Korrektur separat.

## Karten, Bilder und spätere Bindings

Alle vier Ziele haben aktuell `no_memory_needed` in `curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl`; keine dieser vier IDs tritt als Kartenursprung in `canonical-math-full.cards.review.jsonl` auf. Die Vorschläge begründen Verständnisleistungen und erzwingen keinen neuen isolierten Abrufkern oder neue Decks. Bei Übernahme sind trotzdem die vier fachlichen Memory- und Atomicity-Entscheidungen gegen den endgültigen Text erneut zu beurteilen und ihre Fingerprints sowie die semantischen Source-Fingerprints zu aktualisieren.

Die bestehenden vier Bildreferenzen unter `curricula/DE/Gymnasium/visualizations/mathematik/<goalId>/<goalId>.jpg` sind inhaltlich mit den Vorschlägen vereinbar. Alle vier QA-Einträge stehen auf `aiApproved: yes`, `humanApproved: no`; keine neue Freigabe wurde geschrieben oder behauptet. Bei Textübernahme wären kanonischer Alttext und die Beschreibungssnapshots in `quality/goal-visualization-qa/mathematik.qa.json` gezielt abzugleichen. Gute Bildbytes erhalten. Abschlussreviews und Evidence-Bindings erst am gebündelten aktuellen Graphstand.

## Tatsächlich gelesene lokale Quellen

Die folgenden Kürzel bezeichnen Dateien unter `curricula/DE/Gymnasium/`:

- HE-PDF: `input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, E.1 S. 31; SHA-256 `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`.
- HE-ALT: `input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot`.
- HE-X: `input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`.
- HE-MAP: `mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json`.
- HE-REVIEW: `mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json`.
- BW-PDF: `input/BW/BP2016BW_ALLG_GYM_M.pdf`; SHA-256 `b085465143648b3f44c894f8eb0a5ee5d1928cbb1c4c60b3b249559709d26014`.
- BW-X: `input/BW/lower-secondary/source-extraction/DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json`.
- BW-REVIEW: `mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`.
- BY-PDF: `input/BY/raw/Gymnasium_Mathematik_Jgst_7.pdf`, M7 1.1 S. 1; SHA-256 `42940c8ec27a61b5537f89f781fb0c7993cd7e66835c03ac28216fc90b0dcb36`.
- BY-MAP: `mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json`, mit `input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json`.

Referenzabweichung ausdrücklich erhalten: BW-X und der bisherige Arbeitsplan nennen für §3.3.3(12)/(14) S. 33; im vorhandenen Original stehen die Klauseln auf gedruckter S. 34 (PDF-S. 36, in der zweiten enthaltenen Kopie PDF-S. 96). BW-X nennt für §3.3.4(10) S. 35; die Klausel steht auf gedruckter S. 36 (PDF-S. 38 beziehungsweise 98). Die Klauseltexte stimmen; diese Notiz korrigiert ihre Fundstellen, ohne Quelldateien oder Mappingstatus zu verändern. Die originalen PDF-Texte wurden lokal gelesen, keine entfernte Bytegleichheit oder bundesweite Vollprüfung behauptet.

Die vorhandenen B033-Recorddateien bleiben unverändert:

- Runde A: `round-a/results/mathematik-rollout-v1-batch-033-atlas-next-unreviewed-disjoint-20-v1-20260905-first-pass-a.batch-001.records.jsonl`; sha256:f925bb4908f3e7b709f47787afe4be64c4f4abddffd61d9d968feca70876a868.
- Runde B: `round-b/results/mathematik-rollout-v1-batch-033-atlas-next-unreviewed-disjoint-20-v1-20260905-first-pass-b.batch-001.records.jsonl`; sha256:fdb9673afac118fbd30f9cac616a7ffc6aaee288d88585c64e713bf8bd2c9bf5.
