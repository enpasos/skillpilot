# A5: fachlicher Einsatz und Bildkriterium

Der Nutzungsmarker steht in jeder einzelnen Entscheidung des vorhandenen
`quality/release-model/physik.semantic-kinds.json`. Das neue, geschlossene
Schema `contracts/curriculum-package/v2/curriculum-semantic-kind-ledger.schema.json`
steht neben V1; V1 und historische Nachweise bleiben unverändert. Die
fachliche Art eines Ziels bleibt von der Pfeilentscheidung getrennt.

`directedQuantityArrows.usage` ist `required`, `notRequired` oder `children`.
`representationKinds` unterscheidet Größenpfeil, Feldlinienkonvention,
Verschiebung, Strombezug, Phasenzeiger, Formelzeichen und andere Darstellungen.
Die Entscheidung enthält einen Pfad, SHA-256 und Eintragsbezug zu ihrem
individuellen fachlichen Nachweis. Ein Cluster wird bei seinen Kindern
beurteilt; weder seine Gruppierung noch sein Bild begründet eine Voraussetzung.

Die vollständige negative Grundlage ist die unverändert übernommene
L-Lektüre der 737 damaligen Atomtexte und 235 Aufgaben. Deren enge,
angenommene Eigentümerentscheidung trennt die 4 curricularen Zeichenleistungen
von den 20 konkret pfeilfordernden Prüfungen. Sie überträgt eine Zeichnung in
einer Aufgabe nicht auf jede allgemeine Fachkompetenz dieser Aufgabe. Die
Zieltexte der 737 alten Atomziele werden gegen den exakten damaligen Katalog
geprüft. Die beiden später hinzugekommenen N-Verträge sind gesondert gelesen:
Die grafische Begründung von ½ benutzt ein Zeit-Geschwindigkeits-Diagramm und
verlangt keinen Größenpfeil an einem Körper. Die neue Pfeilkompetenz und K4
erhalten eigene aktuelle Entscheidungen; eine noch nicht freigegebene Prüfung
wird dabei nicht vorab als angenommen bescheinigt.

Der eigene Fingerprint des Nutzungsurteils bindet den Ziel-/Materialvertrag
(einschließlich beider Sprachen und `examData`), getrennt von `requires` und
Bildlinks. Neue Aufgabentexte oder eine neue geforderte Zeichnung brauchen
deshalb ein neues Urteil. Ein Bild allein gilt niemals als Lehrnachweis.
Der bestehende native semantische Fingerprint bleibt zusätzlich in Kraft.

`loadSemanticRouteInventory` liest und bindet diese Urteile. Die bestehende
Routenprüfung verfolgt für jedes `required` den tatsächlich verfassten atomaren
`requires`-Pfad zum Pfeilziel. Der Selbstfall ist erlaubt, eine versteckte
Clusterkante genügt nicht. `validate:graph`, der reguläre Routen-Audit und der
Physik-Qualitätsleser verwenden die Prüfung. Die Python-Verbraucher wählen
V1/V2 über das genaue Schema-/Versionspaar.

Im vorhandenen `goal-visualization-qa/physik.qa.json` trägt jedes aktuelle
QA-Bild ein eigenes `directedQuantityArrowReview`, an den aktuellen Bildhash
gebunden. Die fünf Kriterien sind Bezugspunkt, Richtung, Größe mit eigenem
Maßstab, Spitze ohne Ortsbedeutung und zulässige Addition mit gleichem Bezug.
Die allgemeinen Bildfreigaben gelten weiterhin eigenständig.

Die aktuelle Projektion umfasst 526 Bilder: 7 sind für das neue Kriterium
angenommen, 418 davon nicht betroffen und 101 noch nicht entschieden.
Von den offenen Bildern sind genau 88 die verbleibenden L-Größenpfeilbilder;
hinzu kommen 6 ausgelagerte Vektorkonstruktionen und 7 mehrdeutige Fälle.
Das ist ausdrücklich A3-Rückstand und keine neue Kriterienfreigabe.
Die vier schon von L angenommenen Bilder und das N-Bild wurden am aktuellen
Original nochmals geöffnet; die beiden A2-Bilder haben eigene aktuelle
Mediennachweise. Die vier Orientierungsbilder liegen weiterhin außerhalb des
etablierten QA-Scope. Es wurde keine Human-Freigabe hinzugefügt.

Die automatischen Prüfungen lesen typisierte materielle Urteile, keine
Bildpixel. Ein unbeschrifteter Kraftpfeil muss beim tatsächlichen Bildreview
als fehlender Größen-/Maßstabsnachweis erkannt werden; eine damit
widersprüchliche positive Entscheidung wird technisch abgewiesen. Eine
Feldlinie braucht keinen Betragslängenmaßstab. Ein Gegenstandspfeil einer
Linsenkonstruktion folgt dem Ortsmaßstab. Eine ausdrücklich ausgelagerte
Spitze-an-Fuß-Konstruktion ist bei passendem Mengen-/Bezugsnachweis erlaubt.
Die drei Gegenkontrollen sind synthetische Verträge für den Leser, keine
behaupteten fachlichen Freigaben neu erzeugter Bilder.

Reproduktion nach der allgemeinen Bildregister-Generierung:

```bash
cd app
./node_modules/.bin/tsx scripts/materializePhysicsDirectedQuantityArrowQa.ts --check
./node_modules/.bin/tsx scripts/materializePhysicsDirectedQuantityArrowSemantics.ts --check
./node_modules/.bin/tsx --test scripts/testDirectedQuantityArrows.ts
python3 -B ../scripts/test_semantic_kind_ledger_contracts.py
```

`generateGoalVisualizationQaLedgers.ts` erhält die kriterienspezifischen
Felder verlustfrei bei identischen Bildbytes. Bei einem neuen Bildhash
übernimmt es keine alte Kriterienentscheidung. Die Materialisierer sind
deterministische Projektionen der versiegelten Einzelurteile und ersetzen
keine unabhängige Inhaltsprüfung.
