# Unabhängige Prüfung B – neun räumliche P-v2-Kandidaten

Nachprüfung 2026-09-21T22:51:40.928Z: **korrigierte Fassung 9 PASS**, 0 offene P-Befunde. `spatial-nine.corrected.candidates.json` hat SHA-256 `sha256:b43291a6fe4aa9e9ffd4340ef52506157797817dfc0ff4717c3806d4a21ecd47`. Ausschließlich die beiden DE/EN-Felder der Variationsachse `view-direction` unterscheiden sich, exakt gemäß B-Vorschlag. Der neue eb6bfdd9-Profilfingerprint ist `sha256:a45deb3d7039e712d01c618f5b4badda19860a8d373af992f070f1fd54f83f2d`. Die native In-Memory-Materialisierung und Schema-Prüfung aller neun korrigierten Kandidaten sind grün; acht unveränderte Fachreviews wurden übernommen. Keine finale Assetbindung oder menschliche Freigabe wird behauptet. Der ursprüngliche Befund folgt unverändert als Auditspur.

Stand: 2026-09-21T22:34:43Z (UTC). AI-Kandidatenreview; kein menschlicher Status. Modell: Codex; exact serving model identifier not exposed.

Ergebnis: **8 PASS, 1 gezielte Änderung; alle 18 Fallrechnungen korrekt.** Die DE/EN-Fälle sind bedeutungsgleich. 42 unabhängig formulierte Rechen-/Gegenproben und die native In-Memory-Materialisierung mit JSON-Schema-Prüfung sind fehlerfrei. Der inhaltliche Befund wird von diesen Strukturchecks nicht erkannt.

Geprüfte Kandidatenbytes: `sha256:5890e7d2052615f8d22c4b9a578a4b5c0851b9935ca756703d09fe2a49be4aa7`. Die vollständigen Ziel-/Profilfingerprints, Rechenproben und Original-A/B-Referenzen stehen in [independent-b-review.json](./independent-b-review.json).

## Einziger Änderungsbedarf: eb6bfdd9

`/goals/2/profile/variationAxes/0` verlangt derzeit für Drauf-, Seiten- **und Schrägansichten** die jeweils ausgeblendete Koordinate. Das ist für allgemeine Schrägansichten falsch. Beim orthogonalen Blick entlang (1,1,1), mit Bildschirmbasis (1,−1,0)/√2 und (1,1,−2)/√6, haben alle drei Koordinatenachsen von null verschiedene Bildschirmbilder. Verloren geht die Komponente in Blickrichtung, nicht eine einzelne x-, y- oder z-Koordinate.

Minimaler Ersatz, ohne Aufgaben- oder Lösungsänderung:

- DE: Zwischen bezeichneten orthogonalen Drauf- und Seitenansichten sowie geeigneten Schrägansichten wechseln; bei achsenparallelen Ansichten die ausgeblendete Koordinate benennen und bei Schrägansichten die sichtbaren Lageinformationen erläutern.
- EN: Switch between identified orthographic top and side views and suitable oblique views; for axis-aligned views name the suppressed coordinate, and for oblique views explain the visible positional information.

Nach der Korrektur genügt eine gezielte Diff-/Fingerprint-Nachprüfung; die acht unveränderten Profile müssen nicht neu geprüft werden.

## Zielgenaue Rechen- und Scopeprüfung

### be0e8715-3c3a-5ffb-937a-0b6bce4f01d8 — PASS

Die beiden AB1-Fälle prüfen Orts-, Verschiebungs- und nichtnullige Richtungsvektoren, Komponenten und Fachsprache. Ein reiner Ursprungswechsel ohne Achsendrehung ist ein angemessener Bezugstransfer, keine zusätzliche Geraden- oder Transformationskompetenz.

- `three-roles-in-one-frame`: OB−OA=(2−(−1),0−2,4−0)=(3,−2,4). OA und OB beginnen in O, AB in A. Der Richtungsvektor beschreibt die Gerade durch A und B, nicht deren Länge. Gegenprobe/Grenze: A+(3,−2,4)=B. OB ist nicht parallel zu AB (z würde Faktor 1 erzwingen, x widerspricht); OA ebenfalls nicht. Nichtnulligkeit ist gegeben.
- `shifted-origin-fixed-displacement`: P−O'=(3,2,3), Q−O'=(1,5,3), Q−P=(−2,3,0)=(Q−O')−(P−O'). Gegenprobe/Grenze: Der Ursprung wird geändert, nicht P oder Q bewegt; fixe Achsen und Einheiten sind ausdrücklich vorgegeben. Der freie Verbindungsvektor bleibt unverändert.

DE/EN: DE/EN geben dieselben Punkte, Rollen, Vorzeichen und Randbedingungen vor. 'Arrow tail/head' entspricht Pfeilanfang/-ende; der englische Text verlangt keine zusätzliche Leistung.

Abdeckung/Transfer: Beide Erwartungen werden durch Rollenvergleich und Ursprungswechsel beobachtbar. Die zweite Demonstration verändert die Darstellung strukturell, nicht nur Zahlen.

Historischer Abgleich: Historische A/B-Verständnisfelder stimmen mit dem eigenen fachlichen Urteil überein. Alte Bildfehler (Geradenlänge, Projektion) werden hier nicht freigegeben. Die damaligen Analysis-Voraussetzungen fehlen tatsächlich im aktuellen requires.

### aae119f2-925f-5fc1-b795-b52c9e980863 — PASS

AB1-Koordinatenbezüge, Achsenwahl, Einheit und konsistente Eckpunkttripel; keine Schrägbild-Messung oder eigenständige Längenkompetenz erforderlich.

- `corner-frame-for-block`: Bei x entlang 5 cm, y entlang 2 cm und z entlang 6 cm ergeben sich 2³=8 verschiedene Tripel {0,5}×{0,2}×{0,6}. Gegenprobe/Grenze: Jede Kante verändert genau eine Komponente um 5, 2 oder 6; vollständig erklärte andere Achsenzuordnungen und Orientierungen sind ausdrücklich gleichwertig.
- `symmetry-origin-aquarium`: Halbe Bodenabmessungen sind 40 und 20. Die Ecken sind {−40,40}×{−20,20}×{0,50}. Subtraktion von (−40,−20,0) liefert {0,80}×{0,40}×{0,50}; (−40,20,50) wird (0,40,50). Gegenprobe/Grenze: Alle acht Ecken wurden komponentenweise übertragen; Differenzen und Körperabmessungen bleiben erhalten. Negative Ortskomponenten sind keine negativen Längen.

DE/EN: DE/EN stimmen bei Zentrierung, Achsen, Einheit, Ecken und Übersetzung überein. 'Former corner' bezeichnet dieselbe Ecke des alten Bezugssystems, keinen bewegten Punkt.

Abdeckung/Transfer: Eckbezug und Symmetriebezug mit negativen Komponenten bilden zwei passende Demonstrationen der Bezugsauswahl und ihres Wechsels.

Historischer Abgleich: Historische A/B verlangen ebenfalls Bezugsauswahl und veränderte Tripel am gleichen Körper. Deren vertauschte Kantenbeschriftungen im alten Bild bleiben eine getrennte Bildprüfung.

### eb6bfdd9-3cbe-51b5-9798-a741bdc2782e — CHANGES_REQUESTED

Beide AB2-Fälle verlangen tatsächliche Softwarekonstruktion, Ansichtswechsel und Koordinatenprüfung, nicht bloß Papierberechnung. Die geforderte Inzidenzprüfung benötigt keine Geradenschnitt-Routine. Die Falllösungen sind richtig; nur die allgemeine Variationsachse ist zu weit formuliert.

- `two-points-overlap-in-top-view`: Orthogonale Projektion entlang z sendet P und Q jeweils auf (−2,3). Ihre z-Werte unterscheiden sich um 5. Beispielsweise zeigt die xz-Ansicht die Punkte (−2,4) und (−2,−1). Gegenprobe/Grenze: Eine ungeeignete zweite Ansicht könnte weiter überdecken; erwartet wird ausdrücklich eine aufklärende geeignete Ansicht plus Koordinatenanzeige. Modellkoordinaten bleiben beim reinen Kameradreh fest.
- `apparent-crossing-of-segments`: AB liegt vollständig bei y=0,z=2 und CD bei x=0,z=−1. Ihre xy-Projektionen schneiden sich in (0,0); die zugehörigen Raumpunkte (0,0,2) und (0,0,−1) sind verschieden. Gegenprobe/Grenze: Wegen der konstant verschiedenen z-Werte können die Strecken nirgends räumlich schneiden. In xz wird CD zu (0,−1) und AB bleibt auf Höhe 2 sichtbar. Eine Sicht- und Koordinatenprüfung genügt.

DE/EN: Alle Fallbedingungen und Sollresultate sind in DE/EN gleich. Der Fehler in der Variationsachse ist ebenfalls bilingual: 'jeweils ausgeblendete Koordinate'/'which coordinate each view suppresses' schließt derzeit Schrägansichten ein.

Abdeckung/Transfer: Die Punktüberdeckung und der scheinbare Streckenschnitt sind echte unabhängige Darstellungsvariationen. Tatsächliche Softwarebedienung ist als spätere Lernerevidenz zu verlangen; dieser Profilreview behauptet keinen absolvierten Softwarelauf.

Historischer Abgleich: Historische A/B fordern richtige Ansichten und Trennung von Kamerabewegung und Objektbewegung; keine ihrer Verständnisaussagen begründet das pauschale Weglassen einer Koordinate in Schrägansichten. Der historische falsche x-Projektionswert im Bild wird nicht neu beurteilt.

### f37b0a72-9e23-51c7-aad5-438c17a56899 — PASS

Komponentenrechnung und geometrische Verkettung gehören zu derselben AB2-Operationskompetenz. Negativer Bruchfaktor, Gegenvektor und Nullfaktor bleiben im Ziel.

- `scaled-leg-in-spatial-route`: 2b=(6,2,−2); a+2b=(1+6,−2+2,3−2)=(7,0,1). Gegenprobe/Grenze: Vom beliebigen Start S führt S+a+2b zum gleichen Endpunkt wie S+(7,0,1). 2b ist positiv kollinear zu b, Länge verdoppelt; y hebt sich auf.
- `negative-half-and-return`: (−1/2)u=(2,−1,−3); Addition von (−1,3,1) liefert (1,2,−2). Rückvektor (−1,−2,2) ergibt insgesamt 0. Gegenprobe/Grenze: Quadratlängen sind 14 und 56, also halbe Länge; der Faktor ist negativ. 0u ist Nullverschiebung ohne Richtung und wird nicht als gerichteter Pfeil mit eigener Trägergeraden ausgegeben.

DE/EN: Daten, Reihenfolge, Faktoren, Rückweg und Nullfall entsprechen sich vollständig. 'Orientation' und 'direction reversal' sind auf nichtnullige Vektoren bezogen.

Abdeckung/Transfer: Die zweite Demonstration geht von positiver Streckung zu negativer Halbstreckung, Aufhebung und Nullfall über; beide Erwartungen werden konkret abgedeckt.

Historischer Abgleich: Der historische positive Kern wird beibehalten. Die pauschale alte Trägergeraden-Aussage ist für Nullskalierung im Kandidaten sinnvoll begrenzt. Die früheren falsch gerichteten Bildpfeile werden nicht beurteilt.

### 72dfc164-455d-4b63-85f0-96e803c9a1d5 — PASS

AB2-Koeffizientenwahl, vollständige Probe und geometrische Deutung. Redundanz und eine direkt widersprüchliche Komponente untersuchen die Darstellbarkeit; kein zusätzliches Rangverfahren oder allgemeiner Unabhängigkeitsbeweis wird verlangt.

- `negative-weight-with-three-component-check`: a·u+b·v=(a,a+b,b). Aus x=2,z=−1 folgen a=2,b=−1; y=1 stimmt. Damit w=2u−v. Gegenprobe/Grenze: Der vollständige Vektor ist (2,1,−1); beide Koeffizienten sind eindeutig. Ein negativer v-Schritt erklärt die Richtung geometrisch.
- `redundant-generators-two-representations`: q=2p, daher a·p+b·q=(a+2b)p. t=3p verlangt a+2b=3; (3,0) und (1,1) sind zwei Lösungen. Gegenprobe/Grenze: Alle Paare (3−2b,b) mit reellem b sind zulässig. Jede Kombination hat z=0, daher s mit z=1 unmöglich. Der Nachweis behauptet nicht, dass z=0 allein für beliebige andere Ziele hinreichend wäre.

DE/EN: Negative Gewichtung, freie Alternativpaare, reelle Komponenten und Nichterreichbarkeit sind sprachgleich. Die Lösungen sind nicht auf das Beispielpaar beschränkt.

Abdeckung/Transfer: Übergang von eindeutiger Darstellung zu redundanten Erzeugern und einem unerreichbaren Ziel liefert echte strukturelle Variation.

Historischer Abgleich: A/B fordern Koeffizienten, Komponentenprobe, negative Gewichte beziehungsweise redundante Erzeuger. Diese positiven Anforderungen sind erfüllt; der alte Projektionsfehler ist außerhalb dieses P-Reviews.

### 6fc9246a-9448-4cdb-b627-cf20ea1c65d3 — PASS

Die vollständige Familie, nicht bloß Paare, wird algebraisch und geometrisch untersucht. Drei beziehungsweise vier Familienmitglieder in R³ sind ausdrücklich unterschieden. Der vierte Nullvektor ist eine direkte Kriterienanwendung, keine zusätzliche Dimensionssatzprüfung.

- `pairwise-noncollinear-dependent-triple`: 2a+b=(2,5,1)=c, also Koeffizienten (2,1,−1) nichttrivial. a×b=(2,−1,1)≠0; c erfüllt 2x−y+z=0. Gegenprobe/Grenze: Alle drei Paar-Kreuzprodukte sind von null verschieden, trotzdem liegt c in span(a,b). Die Nullmuster begründen die Paar-Nichtkollinearität hier nur zusammen mit der gegebenen Nichtnulligkeit; diese ist bei allen Vektoren erfüllt.
- `independent-triple-plus-zero`: Die Komponenten der Nullkombination sind (α,β,α+β+2γ); zuerst α=β=0, dann γ=0. Gegenprobe: Determinante der Spalten p,q,r ist 2≠0. Gegenprobe/Grenze: Jedes (x,y,z) ist x·p+y·q+((z−x−y)/2)·r. Mit dem zusätzlichen Nullvektor ist (0,0,0,1) ein nichttriviales Koeffiziententupel; span bleibt R³.

DE/EN: DE/EN unterscheiden nichttriviale Koeffizienten von einem nichtnulligen Ergebnis, und Familiengröße von Raumdimension. Beide Formulierungen des Paarvergleichs sind für die konkreten Vektoren richtig.

Abdeckung/Transfer: Abhängigkeit trotz paarweiser Nichtkollinearität, Unabhängigkeit und Nullvektorergänzung belegen beide Pflicht-Erwartungen mit geändertem Strukturtyp.

Historischer Abgleich: Historischer A/B-Dissens lautet Bild KEEP versus Bild BLOCK; beide fachlichen Verständniskerne sind vereinbar. Der Kandidat enthält keine Abbildung, die diesen alten Dissens stillschweigend auflösen würde. Die Bildfrage bleibt separat.

### 54cfe5ce-693e-5d4a-ac1b-009570fbbc11 — PASS

Ein gemeinsamer Skalar und alle Komponenten prüfen die aktuelle AB2-Kompetenz. Der Nullvektor wird unter ausdrücklich gesetzter Konvention behandelt; keine Richtung wird aus dem Begriff kollinear abgeleitet.

- `negative-multiple-with-zero-component`: (−2/3)(0,3,−6)=(0,−2,4)=w. Für t scheitert jede skalare Beziehung an x: 1=λ·0 ist unmöglich. Gegenprobe/Grenze: Die negativen beziehungsweise positiven y-/z-Werte genügen ohne x-Prüfung nicht. Der Längenfaktor 2/3 folgt aus |λ|; w und v sind entgegengesetzt orientiert.
- `parameter-completion-and-zero-vector`: 6=2λ gibt λ=3; −3=−λ bestätigt dies, k=0·λ erzwingt genau k=0. Dann w₀=3u. Gegenprobe/Grenze: Der Nullvektor ist 0·u und hat Länge 0, aber keine Richtung. Unter der vorgegebenen Definition ist das Paar abhängig/kollinear. Für k≠0 ist die y-Gleichung unmöglich.

DE/EN: Die Nullvektor-Konvention wird in beiden Sprachen in Aufgaben und Lösungen explizit gesetzt. 'Same/opposite orientation' ist zu Recht nur den nichtnulligen Vektoren zugewiesen.

Abdeckung/Transfer: Negatives Vielfaches mit Gegenbeispiel und danach Parameterbestimmung mit Nullfall liefern voneinander unabhängige Anwendungen des einen Faktorkriteriums.

Historischer Abgleich: A definiert kollinear als linear abhängig, B betont den sicheren Komponentenvergleich. Der Kandidat macht die Konvention ausdrücklich und vermeidet Division durch Null. Der alte Bildfehler bleibt separat.

### 68d4faef-1a56-5898-9c31-80b7d5d2e430 — PASS

Verbindungsvektor, Betrag und geometrische Deutung entsprechen AB2. Achsenparalleler Vergleichsweg, Ursprungswechsel und Reihenfolgewechsel sind sinnvolle Verständniskontrollen, keine Punkt-Ebene- oder Projektionsdistanz.

- `straight-distance-versus-coordinate-route`: B−A=(4,−4,2); Quadratsumme 16+16+4=36, also Abstand 6 m. Der dreiteilige achsenparallele Weg misst 4+4+2=10 m. Gegenprobe/Grenze: Nicht die Komponentensumme 2 und nicht die Weglänge 10 sind der euklidische Punktabstand. Das Vorzeichen −4 verschwindet im Längenquadrat; 6<10 ist plausibel.
- `same-points-new-origin-and-order`: Q−P=(2,3,6), Quadratsumme 49, Abstand 7 cm. P−O'=(−4,−3,5), Q−O'=(−2,0,11); umgekehrt P'−Q'=(−2,−3,−6). Gegenprobe/Grenze: Subtraktion desselben Ursprungs hebt sich exakt auf; der Gegenvektor hat ebenfalls Quadratsumme 49. Einheiten sind pro Fall eindeutig und werden nicht vermischt.

DE/EN: Alle Zahlen, Einheiten, Orientierungen und Aufgabenverben stimmen in DE/EN. Die englische 'route' ist derselbe nacheinander achsenparallele Vergleichsweg.

Abdeckung/Transfer: Die zweite Anwendung kombiniert neuen Bezug und umgekehrte Endpunktreihenfolge; sie ist mehr als ein zweites Wurzelrechnen.

Historischer Abgleich: Die alten Verständnisfelder fordern dieselben Invarianzen. Die neuen Fälle 6 und 7 übernehmen nicht den alten Bildfall 13. Weder alter Bildfehler noch aktuelle Bildfreigabe werden durch P bestätigt.

### 69eda7f9-1898-5220-932d-e7bec839b7af — PASS

Passende Endpunkte und geometrische Verwendung unterscheiden dieses Ziel vom vorausgesetzten isolierten Zweipunktabstand. Quader und versetzte Pyramide sind alters- und AB2-angemessen; keine Körper-Spezialformel ist nötig.

- `interior-brace-of-rectangular-frame`: AG=(4,4,7), Norm²=81, also 9 m. AC=(4,4,0), Norm²=32, also 4√2 m. Gegenprobe/Grenze: Die Strebe verbindet A mit G und benötigt die Höhenkomponente 7. Die kürzere Bodenstrecke verbindet andere Endpunkte. 'Idealisiert ohne Anschlusszugaben' verhindert eine falsche Baupräzisionsbehauptung.
- `offset-pyramid-lateral-edge`: S−B=(−3,3,4), Norm²=34, daher √34 cm. C−A=(6,6,0), Norm²=72, daher 6√2 cm. Gegenprobe/Grenze: Basiszentrum ist (4,5,0), Spitze liegt 4 cm darüber; die vier Basis-Seitenlängen sind 6 cm. |S|=√57 wäre falsch, weil B nicht der Ursprung ist. AC ist Grundflächendiagonale, BS Seitenkante.

DE/EN: Bauteilrollen, Koordinaten, Maßeinheiten, idealisierte Strebenlänge und Wurzellösungen sind gleich. Keine Übersetzung verwandelt die Seitenkante in Höhe oder Raumdiagonale.

Abdeckung/Transfer: Anderer Körper, andere Streckenrolle und kein Ursprung als Endpunkt im zweiten Fall sind ein echter Transfer. Beide verpflichtenden Erwartungen werden erfüllt.

Historischer Abgleich: A/B verlangen korrekte Endpunktwahl und geometrische Nutzung. Die neuen Aufgaben sind numerisch und semantisch eindeutig, lösen aber den alten B/C-Bildzuordnungsfehler nicht als Nebenbehauptung.

## Unabhängigkeit und Grenzen

Alle 18 Aufgaben in beiden Sprachen, Sollresultate, Erwartungsfelder und Variationsachsen wurden gegen aktuelle kanonische Ziele und prerequisites eigenständig geprüft. Erst danach wurden historische Original-A/B-Records zum Vergleich gelesen. Die im Kandidaten selbst enthaltenen Autorenbegründungen waren sichtbar. Keine Behauptung eines blind-to-authoring-Reviews. Autoren-Selbsttests und Autoren-Urteilsdateien wurden nicht benutzt.

Historische Originale: Batch 044 vom 7. September, Runden A und B; tatsächliche Dateihashes sind im JSON festgehalten. Die alte KEEP/BLOCK-Differenz bei `6fc9246a` betrifft die Abbildung, nicht die positiven Verständnisanforderungen. Dieser P-Review entscheidet sie nicht neu.

- Prüfung der P-Kandidatentexte, keine neue D- oder V-Freigabe.
- Keine Bilder in diesem Auftrag neu gesichtet; historische Bildentscheidungen bleiben separat.
- Kein tatsächlicher Lernenden- oder Softwarelauf durchgeführt; eb6bfdd9 formuliert dafür spätere Evidenzanforderungen.
- Keine Canonical-, View-, QA-, Registry-, Ledger- oder Kandidatenänderung.
- Strukturprüfung in-memory ohne Resource-Digests ist keine endgültige P-Seiten-/Assetbindung.
- Kein menschliches Urteil und keine M7-Freigabe.

Native Prüfung: `buildPositiveGoalEvidenceCandidateRecords` und Ajv2020 mit `contracts/goal-evidence/v2/goal-evidence-profile.schema.json`, neun Records ausschließlich in-memory, `reviewedResourceTypes: []`. Alle neun Ziel- und Profilfingerprints stimmen mit dem Autorenkontext überein. Dies ersetzt weder finale Resource-Bindung noch die unabhängige Fachprüfung.
