# Private D15-Synthese: elf Resolutionen, vier Ziele offen

Beide echten blinden Erstpässe wurden vollständig gelesen: 15 aktuelle Inputs,
Prompt, Mathematikkriterien, neutrale Quellen-/Eltern-/Nachbarkontexte und alle
30 Records einschließlich ihrer sechs bilingualen Evidenzfelder. Die vorhandene
HMKB-PDF wurde an Q2.2, Q2.4, Q2.5 und Q3.1–Q3.3 gelesen. Die drei unten
gesondert behandelten Bilder wurden hier zusätzlich selbst angesehen. Die
übrigen Bildbeobachtungen bleiben als Beobachtungen der beiden Reviewer
gekennzeichnet; es wurde keine neue V-Runde durchgeführt.

Die unveränderten nativen Helfer haben Dual-Summary, Synthesemanifest und **elf
Einzelresolutionen** geschrieben und jeweils erneut geprüft: sechs Befehle,
sechs Exitcodes 0. **D15 bleibt fachlich HOLD.** Zwei Strukturfragen und zwei
Wording-/Modellfragen bleiben explizit `deferredGoals`. Keine Resolution für
einen SPLIT-Fall, kein finaler Index, keine Registry-Supersession und keine
Behauptung über aktive D807-Abdeckung wurden erzeugt.

## Gegenüberstellung aller fünfzehn Ziele

Die IDs sind hier für Lesbarkeit gekürzt; [review-comparison.json](review-comparison.json)
enthält alle vollständigen IDs, Originaltexte, Record-IDs und zweisprachigen
Begründungen. Das [native Authoring](packet/synthesis-authoring.json) bindet alle
drei zurückgewiesenen Ersatztexte exakt als `revisionDissent`. Die Originalurteile
stehen unverändert in den kopierten `packet/round-a/results` und
`packet/round-b/results`.

| Ziel | A | B | Disposition und Grund |
|---|---|---|---|
| `121ef4c5…` Lösung erklären | KEEP | KEEP | Beibehalten; Erklärung, Gründe und zentrale Schritte stehen bereits im Text. B-Evidenz nutzt eine andere vertraute Strategie. |
| `be0e8715…` Vektorrollen | KEEP | KEEP | Beibehalten; drei Rollen desselben Vektorkonzepts sind keine drei automatisch getrennten Ziele. B-Evidenz unterscheidet Ort und Verschiebung. |
| `f14e1643…` Hypothesen | KEEP | KEEP | Beibehalten; Parameter und drei Richtungen sind ausdrücklich enthalten. B-Evidenz verändert Ereignis/Sachfrage; keine neue H0-Konvention. |
| `69243680…` Linearität | KEEP | KEEP | Beibehalten; beide Bedingungen sind genannt. A-Evidenz verlangt tragende Begründung statt bloßem Ursprungstest. |
| `3e974075…` Datenaussagen | SPLIT | SPLIT | **Offen: Struktur und Quellenabgrenzung.** Teilgruppenrechnung, Erhebungskritik und Kausalitätsurteil sind unabhängig fehlbar. Gesamten Anspruch erhalten. |
| `5927ca6a…` Zufallsgröße und Verteilung | SPLIT | REVISE | **Offen: Abgrenzung zu d711… und Zahlenzielbereich.** B verteidigt eine plausible Darstellungskette; das löst As dokumentierte Strukturfrage nicht. |
| `d711bc18…` Zufallsgrößenbegriff | KEEP | KEEP | Beibehalten; der enge Begriffstext enthält den Zahlenzielbereich bereits. B-Evidenz; die offene Überschneidung wird nicht auf dieses klare Ziel übertragen. |
| `c72a8032…` Verkettete Funktionen | REVISE | KEEP | Beibehalten, As exakten Ersatz begründet zurückweisen. „Argumentativ begründen“ erlaubt kein bloßes Aufzählen; innere/äußere Funktion sind in B-Evidenz konkretisiert. |
| `91e2f564…` Parameterwirkung | KEEP | KEEP | Beibehalten; Interpretation und Wirkung gehören zusammen. A-Evidenz verändert die Position des Parameters statt nur seinen Zahlenwert. |
| `4fb40e58…` Skalarmultiplikation | KEEP | KEEP | Beibehalten; „alle Einträge“ benennt die entscheidende Struktur. B-Evidenz prüft rechteckige Form und negative/Null-Faktoren. |
| `6ebdc8cc…` Matrixaddition/-subtraktion | REVISE | KEEP | Beibehalten, As exakten Ersatz begründet zurückweisen. Gleiche Größe bedeutet im Zeilen-/Spaltenkontext gleiche Dimension; B prüft den wichtigen Gegenfall. As kürzerer Text ist eine optionale gute Redaktion. |
| `304111dd…` Matrixmultiplikation | REVISE | KEEP | Beibehalten, As exakten Ersatz begründet zurückweisen. Dimensionsprüfung und Reihenfolge sind bereits genannt; der positive Erklärungsnachweis steht in B-Evidenz. |
| `6f09c97e…` Matrix-Vektor-Produkt | KEEP | REVISE | **Offen: Modellbedingung.** A setzt ein Zustandssystem implizit voraus; B benennt es. Der allgemeine Produktbegriff und die geometrischen Nachfolger liefern diese Sachdeutung nicht automatisch. |
| `5e893892…` Übergangsgraphen | KEEP | KEEP | Beibehalten; Erstellen und Deuten sind eine Darstellungskompetenz. A-Evidenz bleibt bei Ein-Schritt-Übergängen, ohne zusätzliche Matrix-/Grenzwertkompetenz. |
| `bbef7cf2…` Sinus/Kosinus | REVISE | REVISE | **Offen: Winkel/Einheitskreis und gesonderte Materialorientierung.** Beliebige zeitparametrisierte Kreisbewegung liefert nicht unmittelbar sin(t), cos(t). |

Es gibt acht KEEP/KEEP-Paare, vier KEEP/REVISE-Paare, ein REVISE/REVISE-Paar,
ein SPLIT/REVISE-Paar und ein SPLIT/SPLIT-Paar. Drei der vier gemischten
KEEP/REVISE-Paare erhalten eine begründete `keep_current`-Disposition; eines
bleibt offen. Kein BLOCK-Record liegt vor.

## Weshalb die offenen Fälle mehr als Wortpflege verlangen

Bei **3e974075…** können korrekt berechnete bedingte Anteile mit übersehenen
Suggestivfragen oder einem unzulässigen Kausalschluss zusammentreffen. Beide
Reviewer nennen konkrete unabhängige Leistungen. Der gemeinsame Zweck
kritischer Datenlektüre kann eine integrative Kompetenz tragen, belegt deren
atomare Bewertung aber nicht von selbst. Der gelieferte Q3.1-Abschnitt
stützt bedingte Wahrscheinlichkeiten, belegt jedoch nicht automatisch alle
beanspruchten weiteren Facetten. Das ist kein Auftrag, ungesicherte Facetten
zu löschen: Vor einer Änderung muss der gesamte vorhandene Anspruch fachlich
zugeordnet und seine Bewertung erklärt werden.

Bei **5927ca6a…** ist Bs Zusammenhang „Zufallsgröße → Werte → Verteilung“
didaktisch plausibel. Dass Teilleistungen gesondert beobachtbar sind, erzwingt
allein noch keinen Split. As konkreter Einwand bleibt dennoch relevant: Das
Einführen/Beschreiben der Zahlenzuordnung ist schon in **d711bc18…** modelliert;
beide Ziele haben aktuell den Funktionsbegriff als direkte Voraussetzung.
Zu klären ist, ob das breitere Ziel diesen Begriff nur in einer neuen
Darstellungsleistung verwendet oder nochmals unabhängig bewertet. Der fehlende
Zahlenzielbereich im gegenwärtigen Wortlaut ist zusätzlich eine lokale Lücke.
Q3.2 nennt Begriff und Verteilung, entscheidet aber nicht die interne Granularität.
Keine Relation, Einheit oder Kompetenz wurde hier umgebaut.

Bei **6f09c97e…** ist „in einem gegebenen Zustandsmodell“ eine begrenzte
Modellbedingung. Die Ergänzung verlangt weder Modellwahl noch stochastische
Normierung. Sie verhindert die Lesart, die Rechnung selbst erzeuge bereits
eine Sachbedeutung. As KEEP beruht auf einer plausiblen Kontextlesart; sie
wird nicht als mathematischer Fehler des Reviewers behandelt. Die gemeinsame
Q2.4-/Q2.5-Verwendung und die generischen Zustandsbeschriftungen des Bildes
reichen aber nicht, diese Lesart im Zieltext eindeutig zu machen. Bs exakter
bilingualer Ersatz bleibt ein **nicht übernommener Kandidat**.

Bei **bbef7cf2…** kann eine Kreisbewegung allgemein die Koordinaten
`r cos(theta(t))`, `r sin(theta(t))` haben. Der bestehende Text nennt weder
die unabhängige Winkelgröße noch den Einheitsradius. Beide Reviewer begründen
dieselbe Präzisierung. Bs Fassung mit „Punkt auf dem Einheitskreis in
Abhängigkeit vom Drehwinkel“ ist die knappere direkte Erklärung und bleibt
ein **nicht übernommener Kandidat**; die beiden alten REVISE-Records können
eine spätere geänderte Fassung nicht freigeben.

## Material- und Evidenzgrenzen

- **bbef7cf2… (selbst angesehen):** Die äußeren Pfeile zeigen im Uhrzeigersinn,
  während positive Winkel und die bekannten Winkelgraphen dargestellt werden.
  Ein abnehmender Winkel wäre mathematisch möglich; ohne diese Erklärung ist
  die Darstellung als Entstehung der Graphen für zunehmenden positiven Winkel
  missverständlich. Die Grundgraphen selbst sind damit nicht als falsch
  nachgewiesen. Im bestehenden V-Verfahren die beabsichtigte Orientierung
  klären und nur das nötige Material korrigieren oder erklären.
- **91e2f564… (selbst angesehen):** Die gezeigten Faktoren 1/4, 1/2, 3/4 sind
  positiv. Die Aussagen zur unveränderten Maximumstelle gelten in diesem
  Brückenmodell; für beliebige Parameterpositionen oder k ≤ 0 darf daraus
  keine Universalregel werden. Dies ist eine Einsatzgrenze des Beispiels,
  kein D-Wording-Hold und keine neue V-Ablehnung.
- **6f09c97e… (selbst angesehen):** `(65,35)` ist richtig berechnet. „Zustand
  0/1“ und Komponentenwerte erklären noch nicht, welche Bestände oder Größen
  gemeint sind. Eigenständige Interpretation braucht benannte Komponenten in
  der Aufgabe. Die Summenerhaltung dieses Beispiels ist keine allgemeine
  Matrixproduktregel.
- **Übrige Bilder (beide Reviewrecords):** Vorführungen und zusätzliche
  Nachbarinhalte bleiben Lernmaterial. Insbesondere ersetzt die Einsetzprobe
  keine Wegbegründung; glatte Hypothesentest-Skizzen begründen keine neue
  Approximationsmethode; eine Verteilungstabelle erweitert nicht automatisch
  das enge Zufallsgrößenziel; ein einzelnes Linearitätsbeispiel ist kein
  allgemeiner Nachweis; die Matrix neben dem Übergangsgraphen erweitert den
  Zielumfang nicht. Diese Hinweise sind keine zusätzlichen pauschalen Holds.

In allen kalten Inputs fehlt ein mitgeliefertes V2-Profil. Deshalb lautet die
Reviewempfehlung jeweils `create`. Das ist **keine Rücknahme oder erneute
Beurteilung der separat bestehenden aktuellen P-Records** und kein Auftrag,
Profile doppelt anzulegen. Die elf Resolutionen wählen jeweils eine originale
Evidenzkette unverändert; sie verschmelzen keine Forderungskataloge. Fehlende
atomare sourceRefs, rohe Applicability und Platzierungsangaben werden nicht
zu bestätigter flächendeckender Quellenabdeckung oder wirksamer Projektion
umgedeutet. Daraus werden auch keine fünfzehn neuen SourceA-Aufträge erfunden.

## Minimaler Folgeweg im bestehenden Verfahren

1. Für **3e974075…** und **5927ca6a…** die zwei konkreten Strukturfragen fachlich
   entscheiden und begründen. Für den zweiten Fall **d711bc18…** zur Abgrenzung
   mitlesen, ohne dessen bereits klare Beschreibung automatisch zu ändern.
   Eine kohärente integrierte Leistung muss als solche tragfähig erklärt werden;
   ein Split ist weder automatisch geboten noch hier autorisiert. Falls eine
   Strukturänderung notwendig ist, zuerst deren volle Zielabdeckung, stabile
   Identitäten und Erhalt bestehender gültiger Mastery konkret festlegen.
   PR83/Einheitenarbeit bleibt eingefroren; kein Einheitenumbau als Abkürzung.
2. Die zwei eng begrenzten Wordingkandidaten zu **6f09c97e…** und **bbef7cf2…**
   im vorhandenen Authoring-Verfahren entscheiden. Bei **5927ca6a…** den
   Zahlenzielbereich erst zusammen mit der Abgrenzungsentscheidung reparieren.
   Nur konkrete notwendige Texte ändern, keinen allgemeinen Erklärungsballast
   in die übrigen elf Beschreibungen übernehmen.
3. Die offene Pfeil-/Winkel-Frage im vorhandenen V-Verfahren klären. Betroffene
   Quellen-/Seiten-/Bildfingerprints und ihre tatsächlichen D/P/A/M/V-Verbraucher
   nach einer Änderung gezielt neu bestimmen; keine alten Hashes umetikettieren,
   kein pauschales Neuerzeugen aller Profile. Erst den finalen neutralen
   Materialkontext festlegen, dann D neu reviewen.
4. Für die danach tatsächlich betroffenen offenen Ziele zwei **neue echte
   unabhängige blinde Erstpässe** auf dem endgültigen Kontext durchführen.
   Die jetzigen SPLIT-/REVISE-Records bleiben historische Befunde. Auch eine
   begründete Beibehaltung eines strukturell überprüften Ziels überschreibt
   diese Records nicht. Keine Richtungsvorgabe, kein KEEP-Ziel und keine
   alten Reviews als neue ausgeben. Nicht veränderte, weiterhin exakt aktuelle
   elf Resolutionen bleiben eigene private Evidenz.
5. Erst bei aufgelösten Holds die native Synthese/Finalisierung und den
   bestehenden per-Goal-Supersessionweg verwenden; alle 15 ursprünglich
   beanspruchten Ziele bleiben Teil des Gesamtauftrags. Root koordiniert
   anschließend die gemeinsame aktuelle Konfiguration und den tatsächlichen
   Gesamtproduzenten. Ein späterer Erfolg muss an diesem konkreten Stand
   gemessen werden, nicht aus 11/15 extrapoliert.

## Reproduzierbarkeit und Schutz

Verbindliche Policy ist
`curricula/DE/Gymnasium/quality/goal-description-review/README.md`, insbesondere
KEEP/KEEP, begründetes KEEP/REVISE, offene SPLIT/BLOCK und frische Reviews nach
Revision. Die nativen Schnittstellen sind unverändert.
[execute-native.py](execute-native.py) ist lediglich die private Aufrufhülle:
Sie mountet die Paketkopie am originalen logischen Paketpfad, die gesamten
Runden/Bundles read-only und denselben bereits vorhandenen privaten Source15-
Frame. Dadurch bleiben alle nativen Bindungen an Originalconfig und
Batchmanifest unverändert. Es gibt keine vorgespielte Standortmigration und
keine neue Arbeitsablauf- oder Produktschnittstelle. Für eine spätere
Registry-Verwendung ist dieses Paket noch nicht angeschlossen.

[native-execution.json](native-execution.json) enthält die exakten Befehle und
tatsächlich gemessenen Ausführungszeiten.
[postguard.json](postguard.json) prüft 3.093 geschützte Dateien einschließlich
des vollständigen Originalpakets auf unveränderte Bytes und neue Originaldateien.
Die Synthese wurde durch **`/root/math15_description_synthesis`** vorgenommen.
Der erste gemessene eigene Zeitpunkt wurde erst nach dem Lesen aufgenommen;
ein früherer Beginn wird nicht erfunden. Der tatsächliche Abschluss steht in
[review-receipt.json](review-receipt.json). Das native `synthesizedAt` ist
definitionsgemäß die letzte Review-Abschlusszeit plus eine Sekunde und
**kein realer Synthese-Bearbeitungszeitpunkt**.

Keine aktiven Source-/Code-/Ledgerwrites, keine Git-, DB- oder Deployaktion,
keine SourceA-Probes, keine zusätzlichen Reviewer/Subagents, keine Änderung
der beiden Runden oder ihrer Metadaten. Die private Quelle ist unverändert
`9f3945e209e0cef503428e0a20c3c2302261346e35f533bf1264e525f16cdf96`.
Diese AI-Synthese ist keine menschliche Freigabe und keine Aktivierung.
