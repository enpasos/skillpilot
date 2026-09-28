# Raumabstände und räumliche Spiegelungen: Strukturreparatur

Stand 28. September 2026. Implementierter AI-Arbeitsstand, **keine menschliche
Freigabe und keine D/P/A/M/V- oder M7-Fertigmeldung**. Die zentralen
D/P-/Bild-QA-Dateien und die zentrale Registry wurden von diesem Teilauftrag
nicht bearbeitet. Die aktuellen SemanticKind-Bindungen klassifizieren die
Struktur, sie bescheinigen keine fachliche menschliche Freigabe.

## Abstandskompetenzen erhalten

`0a846521` war ein zweites, unbestimmtes Punkt-/Geradenabstandsatom neben bereits
vorhandenen konkreten Kompetenzen. Die ID bleibt als ausgeschlossener
Kompatibilitätscluster auflösbar. Ihre drei vorhandenen Kompetenznachfolger
`68d4faef` (Punkt–Punkt), `3256476b` (Punkt–Gerade) und `509ae03b`
(Gerade–Gerade) bleiben wirkliche Lernziele. Es werden **keine gespeicherten
Mastery-Werte übertragen, zusammengefasst oder gelöscht**. Vorhandene Werte
unter allen alten und spezifischen IDs bleiben unverändert; eine alte
Bündel-Mastery ersetzt keine Einzelprüfung.

Alle 55 BB/BE-Source-Kanten wurden einzeln nach dem konkreten extrahierten
Aspekt eingeordnet. `distance-source-edge-dispositions.json` enthält jede
Quelle und die genaue Vorher-/Nachher-Entscheidung. Dazu gehören auch die
falsch an Raumabstände angehängten Vektor-, Winkel-, Mengen- und
Hauptsatzaspekte. Ersatzkanten bleiben konservativ `partial`. In jedem Land
wurde zusätzlich die Punkt–Gerade-Kante am gemeinsamen GK/LK-Abstandsaspekt
entfernt. Die amtlichen Objektpaare sind in den Views ausdrücklich umgesetzt:
Punkt–Punkt, Punkt–Ebene und parallele Gerade/Ebene- bzw. Ebene/Ebene-Abstände
im gemeinsamen Bereich, Punkt–Gerade und Gerade–Gerade zusätzlich im LK.

`c2c49659` wird als fachlicher Cluster fortgeführt. Seine vier bereits
vorhandenen Kinder sind `3256476b`, `79c4cd21`, `509ae03b` und `8eb14d81`.
Der letzte Baustein verwendet für parallele Objektpaare denselben
Reduktionsgedanken auf einen Punkt–Ebene-Abstand. Die breite HE-LK-Quelle bleibt
am Gesamtcluster; Kinder sind direkte partielle Zuordnungen. Die HE-LK-Views
expandieren den Cluster mit allen vier Kompetenzen genau einmal. Eine
unbelegte zusätzliche BY-Clusterroute entfällt; bestehende spezifische
bayerische Ziele bleiben bestehen.

Die sechs unmittelbaren Verbraucher wurden fachlich einzeln entschieden:

| Verbraucher | Jetzt benötigte Grundlagen |
| --- | --- |
| `1e77bb2f` Prisma | Grundflächeninhalt und senkrechte Punkt–Ebene-Höhe |
| `288633c1` Pyramide | entsprechendes Prisma als Verhältnisgrundlage |
| `944dd479` Spatprodukt | tatsächlich Skalarprodukt und Vektorprodukt |
| `c71ae268` Zylinder | Streckenlängen und bekannte Zylindervolumen-Grundidee |
| `e8237315` Kegel | entsprechender Zylinder und senkrechte Höhe |
| `2f2c9f1a` Kugel | Mittelpunkt–Oberflächenpunkt-Abstand als Radius |

Vorher-Felder und Begründungen stehen in `distance-structure-changes.json`.
Keine pauschale Umleitung auf dieselbe Ersatzvoraussetzung wurde verwendet.

## Explizite Spiegelträger und ehrliche Geltung

Das HE-KC nennt die Urbildtypen Punkt, Gerade und Ebene; eine amtliche
neunfeldrige Matrix aller Spiegelträger wird daraus nicht behauptet. Die drei
HE-LK-Ziele `fcd1d180`, `a97c7cce`, `985d5529` verwenden nun eine ausdrücklich
gekennzeichnete didaktische Operationalisierung: Ein Zentrum, eine Achse als
**Halbdrehung** oder eine Ebene ist in der Aufgabe vorgegeben. Die einheitliche
Konstruktion ist `R_S(X)=2 proj_S(X)-X`; Mittelpunkt- und Lotbedingungen dienen
der Begründung. Bildgeraden werden durch zwei verschiedene Bildpunkte,
Bildebenen durch drei nicht kollineare Bildpunkte mit Zusatzkontrolle bestimmt.
Die Quellenkanten sind deshalb `partial`, keine wörtliche Gleichheitsbehauptung.
Der bekannte GK-Fall Punkt an Ebene allein reicht nicht für diese Transferziele.

BW belegt enger die Raumgerade an einem Punkt. Dafür gibt es das neue Atom
`976def9e-c81c-5875-9d87-a1024318ce48` ausschließlich im BW-LK. Die allgemeine
HE-Trägerfamilie wird weder BW noch BY als zusätzlicher Pflichtumfang
zugeschrieben. Auch hier gibt es keine automatische Mastery-Migration von
`a97c7cce`. Die Vektorarithmetik-Voraussetzung wird mit dem parallelen
Vektorsplit des anderen Agents auf die tatsächlichen Einzelkompetenzen gebunden.

Der gemeinsame Q2-Prüfungscluster hätte neue regionale Aufgaben automatisch
in vielen anderen Views sichtbar gemacht. `new-assessment-scope-overrides.json`
dokumentiert daher gezielte `prerequisiteOnly`-Overrides für ausschließlich die
neuen IDs außerhalb ihrer HE-/BW-LK-Zielgeltung. Die operative Auswahl wird im
View festgelegt, nicht aus Phasenbezeichnungen oder Canonical-Tags erraten.

## Tatsächliche Prüfungen und Bildbefund

Die alte Aufgabe `2f8a3a90` enthält keine Spiegelungsaufgabe und kein allgemeines
Lotfußpunkt-Bündel. Ihre vier falschen Coverage-/Voraussetzungskanten wurden
entfernt. Zwei neue Aufgaben mit expliziten Daten, Lösungen, Punkten und
fachlichen Teilfallgrenzen tragen die wirkliche Abdeckung:

- `a7896fa5-993e-52b9-8aa4-10420b35bfd9`: HE, drei vorgegebene Punkt-Träger,
  zwei Geraden-Träger, Bildebene und Mengeninvarianz gegenüber Fixpunkten.
- `440edf01-1824-597a-9afa-2f23f5becfba`: BW, Gerade am Zentrum,
  Parallelität/Identität und unabhängige Kontrolle eines weiteren Bildpunkts.

Die JSON-Kopien im Paket enthalten genau diese Aufgaben. `reviewStatus:
released` bezeichnet ihre aktive technische Aufgabenverfügbarkeit; es wird
hierdurch keine menschliche Freigabe behauptet. Der Server erzwingt die
Gesamtpunktgrenze; die Lösungen legen die fachlichen Teilfallgrenzen offen.

Alle drei bisherigen JPGs wurden tatsächlich geöffnet. Punkt- und Geradenbild
sind rechnerisch passende Ebenenspiegelungs-Spezialfälle. Das Ebenenbild hat
einen echten Zeichnungsfehler: Drei nach ihren Koordinaten nicht kollineare
Punkte sind in einer flächig sichtbaren Ebene kollinear gezeichnet. Die genaue
historische Datei-/Hashbindung steht in `trio-actual-image-inspection.json`.
Root hat dieses Bild inzwischen durch eine PNG mit klar nichtkollinearen
Punktdreiecken ersetzt und das eigene Bild für das BW-Atom ergänzt. Beide
aktuellen PNGs wurden nochmals tatsächlich geöffnet: Die Ebenenabbildung
`x′ = 4 − x` sowie Zentrum, korrespondierende Punktpaare und parallele
Bildgerade im BW-Bild sind schlüssig. Diese Sichtprüfung ersetzt keine neue
zentrale Bild-QA- oder D/P-Bindung.

## Quellen und Nachprüfung

Tatsächlich geöffnet wurden die amtlichen Quellen:

- [BB-RLP 2022, Druckseiten 29–30](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2022/Teil_C_RLP_GOST_2022_Mathematik.pdf).
- [Berlin GO, insbesondere Messen auf Druckseite 25](https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/rahmenlehrplan-mathematik_go-teil-c.pdf).
- [HE-KC 2024, Druckseiten 42–43](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf).
- [BW-Gymnasium, Leistungsfach 3.4.3(7)](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M.V2_IK_11-12-LF_03).

`changed-goals-and-revalidation.json` listet die zehn unmittelbar neu zu
prüfenden curricularen Atome, die weiteren geänderten Knoten, die drei
Assessment-Verbraucher und alle Ziele mit geänderter Quellen-/Seitenkontext-
bindung. D/P/A/M/V bleiben bis zu ihren jeweiligen frischen Prüfungen offen.

Die dauerhafte Regression `testMathDistanceReflectionStructure.ts` prüft alle
88 aktuellen Views, die GK/LK-Objektpaargrenze, ausschließliche HE/BW-Geltung,
verbliebene echte Abstandsziele, falsche Alt-Coverage und unabhängige
Spiegelungsrechnungen. Sie läuft als Teil von `test:goal-book-model` und separat
mit `npm --prefix app run test:math-distance-reflection-structure`.

Abschluss dieses Teilauftrags: Die dauerhafte Regression ist nach Integration
der parallelen Strukturänderungen erneut grün über alle 88 Views, einschließlich
der unabhängigen Spiegelungsrechnungen. `git diff --check` ist grün. Die
Schema-Prüfung war nach den eigenen Datenänderungen über 21.366 JSON-Dateien
grün. Der vollständige Backend-Mapping-Fixture-Lauf hatte 85 von 87 grünen
Tests; die zwei übrigen Fehler betrafen parallele BW-/NRW-Sek-I-Projektionen,
nicht die hier bearbeiteten BB/BE/HE/BW-Oberstufenfälle. Der abschließende
globale Graph-/Duration-/Atlas-/CI-Lauf gehört zur anschließenden Integration.
Die Counts in `changed-goals-and-revalidation.json` sind ein damaliger
Struktursnapshot, kein aktueller zentraler M7-Bericht.
