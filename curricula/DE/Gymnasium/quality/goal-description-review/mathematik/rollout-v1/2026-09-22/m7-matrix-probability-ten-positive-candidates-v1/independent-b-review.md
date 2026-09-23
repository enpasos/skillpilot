# Unabhängige Prüfung B – zehn Matrix-/Wahrscheinlichkeitsprofile

**10 PASS, 0 Änderungen.** Alle 20 Fälle in DE und EN geprüft, 58 unabhängige Rechen-/Gegenproben bestanden. Native In-Memory-Materialisierung und JSON-Schema-Prüfung: 10/10 ohne Fehler.

Stand: 2026-09-21T22:57:46Z. AI-Kandidatenreview, keine menschliche Freigabe. Modell: Codex; exact serving model identifier not exposed.

Kandidatenhash: `sha256:120e1b198b2ad994419db19aae4f678501cd78ffc0d780d73bb1a8290461584c`. Vollständige Bindungen, Rechenchecks und historische Originalreferenzen: [independent-b-review.json](./independent-b-review.json).

Die fachliche Entscheidung stand vor dem historischen Abgleich fest. Autoren-Selbstchecks wurden nicht verwendet. Die im Kandidaten enthaltenen Autorenbegründungen waren sichtbar; deshalb kein vollständiger Blindheitsclaim gegenüber dem Autorenkontext.

## 0de1e45c-aea9-5e53-932a-027dcf509efa — PASS

Die AB2-Anwendung von Matrixpotenzen auf mehrere Zeithorizonte und Anfangsverteilungen bleibt vom AB3-Grenzmatrixziel getrennt. Wiederholung derselben Übergangsregel und die Spaltenkonvention sind explizit.

- `finite-horizons-of-two-state-process`: M²=[[11/16,10/16],[5/16,6/16]], M⁴=[[171/256,170/256],[85/256,86/256]]. Die erste Spalte liefert v₂/v₄, die zweite w₄; Mv₀=(3/4,1/4). Gegenprobe/Lösungsgrenze: Jede Spaltensumme ist 1 und alle Einträge sind nichtnegativ. v₄−w₄=(1/256,−1/256). Gegenprobe über aₙ₊₁=1/2+aₙ/4: aₙ=2/3+(a₀−2/3)4⁻ⁿ. Diese Reviewer-Ableitung bestätigt die Zahlen, wird aber im Profil nicht unzulässig als aus vier Tabellenzeilen bewiesen verlangt.
- `persistent-alternation-at-large-step-counts`: S²=I, also S²⁰v₀=(7/10,3/10) und S²¹v₀=(3/10,7/10). Der gleichverteilte Start ist dagegen Fixvektor. Gegenprobe/Lösungsgrenze: Die beiden ungleichen Teilfolgen schließen Konvergenz für (7/10,3/10) aus; große Schrittzahlen allein reichen nicht. Alle Zustände bleiben zulässige Verteilungen. Stationärer Sonderstart wird nicht mit Matrixkonvergenz verwechselt.

DE/EN: DE/EN stimmen bei Räumen, Startvektoren, Schrittzahlen, Spaltenkonvention und der ausdrücklichen Grenze endlicher Beobachtung überein.

Abdeckung/Transfer: Zwei Pflichterwartungen sind gedeckt; Anfangswechsel und Änderung zur periodischen Übergangsstruktur sind echte Variation, nicht nur neue Zahlen.

Historischer Abgleich: A KEEP/B BLOCK war ein HE-GK/LK-Scope-Dissens, kein P-Inhaltsdissens. Beide Verständniskerne tragen diese Fälle. Die Scopekorrektur ist separat integriert und getestet; dieser P-Review erzeugt keine neue normative Länderfreigabe.

## 922d89fc-1cbd-56e9-ac5d-5cb59085de6c — PASS

AB3-Deutung echter Matrixgrenzen, Wirkung auf Starts und Grenzen einer Fixvektoraussage. Die ausdrücklich gegebene Potenzformel macht einen nicht geforderten allgemeinen Spektralbeweis überflüssig.

- `given-power-formula-and-identical-limit-columns`: Die angegebene Formel ist Mⁿ=G+2⁻ⁿE mit G=[[2/5,2/5],[3/5,3/5]], E=[[3/5,−2/5],[−3/5,2/5]]. G²=G, E²=E, GE=EG=0 und G+E=I; n=1 gibt exakt M. Gegenprobe/Lösungsgrenze: Damit stimmt die Potenzformel auch unabhängig vom Aufgabengegebenen. 2⁻ⁿ→0 liefert G. Für jeden normierten Start (a,b) gilt G(a,b)=(2/5,3/5)(a+b)=(2/5,3/5). M(2/5,3/5)=(2/5,3/5); diese Stationarität ersetzt den Grenznachweis nicht.
- `same-fixed-vector-different-long-term-claims`: S²ⁿ=I und S²ⁿ⁺¹=S sind verschiedene Teilfolgen. Für (3/4,1/4) wechseln die Zustände zwischen diesem Vektor und (1/4,3/4). Iⁿ=I hat dagegen die Grenzmatrix I. Gegenprobe/Lösungsgrenze: Ein einziges nicht konvergierendes Mⁿv widerlegt die Konvergenz von Mⁿ in endlicher Dimension; zusätzlich sind die alternierenden Matrizen direkt angegeben. G=I erhält den gesamten Start. Beide Matrizen fixieren (1/2,1/2), ohne dieselbe Langzeitaussage zu erlauben.

DE/EN: Die Formel, reinen/gemischten Starts, Stationaritätsprüfung und die Unterscheidung Matrixgrenze versus Zustand sind in DE/EN äquivalent.

Abdeckung/Transfer: Der erste Fall prüft eine herleitbar startunabhängige Grenze, der zweite Periodizität und startabhängige Grenze. Beide Pflicht-Erwartungen werden dadurch positiv nachweisbar.

Historischer Abgleich: A/B beanstandeten Bildtransposition und B zusätzlich HE-GK-Scope. Ihre positiven Verständnisfelder stimmen überein und werden erfüllt. Keine automatische Bild- oder Seitenfreigabe aus diesem Profil.

## 4c494716-567b-59c2-855c-6ea45635c666 — PASS

AB2-Übersetzung zwischen linearer Koordinatenregel, Matrix und geometrischer Wirkung. Im räumlichen Fall ist die Matrix gegeben; keine zusätzliche allgemeine Projektionskonstruktion wird verlangt.

- `shadow-on-vertical-axis`: S(e₁)=(0,2), S(e₂)=(0,1), daher A=[[0,0],[2,1]]. S(−2,5)=(0,1), S(3,−1)=(0,5). S(x,y)−(x,y)=(−x,2x)=−x(1,−2). Gegenprobe/Lösungsgrenze: A²=A, A(0,y)=(0,y) und A(1,−2)=0. Die Bildmenge ist genau die y-Achse. Außerhalb dieser Achse sind die Verbindungsvektoren parallel zur angegebenen Richtung; auf ihr bleibt der Punkt fest.
- `read-spatial-shadow-from-matrix`: A(x,y,z)=(x−z,y+2z,0); U'=(6,−3,0), V'=(0,2,0). Die Differenz ist −z(1,−2,1). Gegenprobe/Lösungsgrenze: A²=A und A(1,−2,1)=0. Die Richtung hat eine von null verschiedene z-Komponente und ist nicht normal zur xy-Ebene. Jeder Ebenenpunkt bleibt fest; deshalb ist dies eine schiefe Projektion und keine lediglich auf z=0 abbildende beliebige Transformation.

DE/EN: DE/EN erhalten Basisreihenfolge, Matrixdimensionen, Vorzeichen und die nichtorthogonale Projektionsrichtung.

Abdeckung/Transfer: Regel→Matrix in R² und Matrix→Regel in R³ liefern voneinander unabhängige Darstellungswechsel. Beide Erwartungen werden abgeprüft.

Historischer Abgleich: A/B verlangten Matrixspalten, Kontrollbilder und Richtungs-/Bildebenenwechsel. Die Fälle sind damit konsistent. Die historischen fehlerhaften Punktlagen wurden in einem gesonderten v3-Bildreview behandelt, nicht durch diesen P-Review.

## 4d331ba0-56d6-5730-a51b-e3d1126b31ba — PASS

Die Matrizen sind gegeben. AB1 verlangt hier richtige Zeilenprodukte, Dimension und eindeutige Punktzuordnung; kein Herleiten einer Matrix oder allgemeiner Rangbeweis.

- `two-images-under-given-shear`: A(−1,3)=(−1−6,3)=(−7,3), A(2,0)=(2,0). Die allgemeine Wirkung ist (x−2y,y). Gegenprobe/Lösungsgrenze: y bleibt in beiden Fällen erhalten. Der Nullwert y=0 erklärt den Fixpunkt Q. Beide Zeilen werden in beiden Sprachen ausgeschrieben, keine vertauschte Zuordnung P/Q.
- `rectangular-map-with-equal-images`: B ist 2×3; B(2,−3,1)=(3,−4), B(1,−2,2)=(3,−4). Die erfassten Kombinationen sind x+z und y−z. Gegenprobe/Lösungsgrenze: V−U=(−1,1,1) liegt im Kern: B(V−U)=0. Dies bestätigt die Gleichheit der Bilder, ohne eine allgemeine Kernbestimmung vom Lernenden zu fordern. Die Ausgabe besitzt genau zwei Komponenten.

DE/EN: Daten, Dimension 3→2, Zeilenrechnungen und Aussage verschiedener Urbilder mit gleichem Bild entsprechen sich.

Abdeckung/Transfer: Wechsel von invertierbarer Scherung zur rechteckigen informationsreduzierenden Abbildung ist struktureller Transfer; die Fälle decken beide Erwartungen.

Historischer Abgleich: A nennt andere Dimension oder Projektion, B eine singuläre Projektion als geeigneten Transfer. Die gewählte rechteckige nichtinjektive Abbildung erfüllt den gemeinsamen Kern des Informationsverlusts, ohne B als exklusive Methodenpflicht auszulegen.

## b72d87d4-763e-54aa-940d-31f195b51700 — PASS

Matrixbestimmung, Bildpunkte und geometrische Untersuchungen derselben orthogonalen Spiegelung bilden das AB2-Ziel. Zweimal dieselbe Spiegelung ist eine direkte Vorzeichenkontrolle, keine neue allgemeine Kompositionskompetenz.

- `reflection-in-yz-plane`: Basisbilder −e₁,e₂,e₃ ergeben diag(−1,1,1). (−3,2,5) wird (3,2,5), Mitte (0,2,5), Verbindung (6,0,0). Gegenprobe/Lösungsgrenze: Beide Abstände zu x=0 sind |±3|=3; die Verbindung ist normal zur yz-Ebene. Der Mittelpunkt muss nicht auf einer Koordinatenachse liegen.
- `xz-reflection-fixed-point-and-return`: T=diag(1,−1,1); Q'=(4,2,−1), R'=R=(−1,0,3). T²=I und die Mitte von Q,Q' ist (4,0,−1). Gegenprobe/Lösungsgrenze: Nur die Normalenkoordinate y wechselt das Vorzeichen. R liegt in y=0 und ist deshalb fix. Beide erneuten Anwendungen liefern die Ausgangspunkte, auch im Fixpunktfall.

DE/EN: Spiegelebene, Normalenkoordinate, Mittelpunkte, Abstände und Rückkehr sind DE/EN gleich.

Abdeckung/Transfer: Wechsel yz→xz, normaler Punkt→Fixpunkt und wiederholte Anwendung decken beide Pflichterwartungen mit geändertem Falltyp.

Historischer Abgleich: Die positiven A/B-Kerne sind erfüllt. Ihr alter Bildbefund zu einem fälschlich auf der y-Achse eingezeichneten Fußpunkt wird nicht durch richtige P-Rechnungen wegdefiniert.

## 55039f9c-4ebc-5115-add5-fae95b915e46 — PASS

Das aktuelle Ziel umfasst allgemeine Parallelprojektionen. Ein orthogonaler und ein schiefer Fall sind daher erforderlich plausibel; es erfolgt keine unzulässige Beschränkung auf bloßes Nullsetzen einer Koordinate.

- `orthogonal-projection-onto-yz`: Basisbilder 0,e₂,e₃ ergeben diag(0,1,1). P'=(0,2,5), R'=R=(0,−3,1); PP'=(4,0,0). Gegenprobe/Lösungsgrenze: Bilder erfüllen x=0, der erste Verbindungsvektor ist parallel zur x-Achse, R ist bereits Ebenenpunkt. Erneute Projektion ist identisch, also idempotent.
- `oblique-projection-onto-xy`: Für X+t(2,−1,2) verlangt z+2t=0 genau t=−z/2. Es folgt (x−z,y+z/2,0) und B=[[1,0,−1],[0,1,1/2],[0,0,0]]. Q'=(−1,0,0); QQ'=(−4,2,−4)=−2d. Gegenprobe/Lösungsgrenze: B²=B, Bd=0, B(x,y,0)=(x,y,0). d_z=2≠0 sichert genau einen Schnitt mit z=0 für jeden Startpunkt. Die orthogonale Vergleichsprojektion wäre (3,−2,0); Ebenenkoordinaten müssen bei schiefer Projektion nicht erhalten bleiben.

DE/EN: DE/EN unterscheiden Zielebene und Richtung, behalten den Faktor 1/2 und die Eindeutigkeitsbedingung. Kein Vorzeichen- oder Bezugswechsel.

Abdeckung/Transfer: Der zweite Fall verändert die Projektionsrichtung wirklich und verlangt die angepasste Matrix. Basisbilder, Ebene, Parallelität und Fixpunkte decken alle Pflichterwartungen.

Historischer Abgleich: A/B fordern ausdrücklich einen schiefen Transfer. Anders als das erlaubte reine Bildbeispiel deckt dieses P-Profil auch diesen weiteren Zielteil; keine Einschränkung der kanonischen Kompetenz auf orthogonale Fälle.

## 35558905-753d-5fcb-b25e-7f85ffdbff56 — PASS

AB2-kI-Abbildungen mit k≠0 am Ursprung. Negatives Vorzeichen und Betrag werden getrennt; am Ursprung wird keine Strahlrichtung behauptet.

- `negative-dilation-in-plane`: A=−3I₂, P'=(3,−12), Q'=(−6,6). Normquadrate: P 17, P' 153=9·17; Q 8, Q' 72=9·8. Gegenprobe/Lösungsgrenze: Damit verdreifachen sich die nichtnegativen Abstände. Die negativen Faktoren −3 belegen jeweils den Gegenstrahl und Kollinearität mit O, nicht eine negative Länge.
- `positive-contraction-in-space`: B=(1/4)I₃, R'=(2,−1,3), O'=O. |R|²=64+16+144=224=16·14, |R'|²=14. Gegenprobe/Lösungsgrenze: Positiver Faktor 1/4 belegt denselben Ursprungsstrahl für R≠O. Die drei Basisbilder sind jeweils eᵢ/4; der Ursprung bleibt ohne Richtungszuschreibung fix.

DE/EN: Negative Vergrößerung, positive Verkleinerung, 2D/3D-Dimension und alle Wurzelwerte stimmen in beiden Sprachen.

Abdeckung/Transfer: Vorzeichen, Größenordnung des Faktors und Raumdimension wechseln gemeinsam, während das kI-Prinzip gleich bleibt. Beide Erwartungen sind prüfbar.

Historischer Abgleich: A/B verlangen kI, Ursprungsgeraden und Abstandsfaktor mit Negativ-/Bruchtransfer; erfüllt. Die alte Bildtransposition wird in Klartext-Spaltenkonvention nicht wiederholt.

## 7bd8f022-5002-5610-994c-a9cec1890558 — PASS

LK/AB3: aktive Drehung im festen rechtshändigen System, Spaltenvektoren und Rechte-Hand-Konvention sind ausdrücklich vorgegeben. Der neue y-Winkel −60° ergänzt echte Achsen-/Winkelvariation.

- `positive-quarter-turn-about-x`: eₓ→eₓ, eᵧ→e_z, e_z→−eᵧ ergeben Rₓ=[[1,0,0],[0,0,−1],[0,1,0]]. P=(2,−3,4) wird (2,−4,−3). Gegenprobe/Lösungsgrenze: x bleibt 2, beide Normquadrate sind 29. Rₓ ist orthogonal mit Determinante 1; ein Punkt auf x bleibt fix. Die Matrix ist nicht die inverse −90°-Drehung.
- `negative-sixty-degrees-about-y`: Rᵧ(θ)=[[cosθ,0,sinθ],[0,1,0],[−sinθ,0,cosθ]]. Für −60° sind cos=1/2, sin=−√3/2; eₓ erhält positives z und e_z negatives x. Q'=(1,−1,√3). Gegenprobe/Lösungsgrenze: Die rechte-Hand-Orientierung folgt auch aus der infinitesimalen Wirkung eᵧ×eₓ=−e_z für positive Winkel; ein negativer Winkel dreht eₓ Richtung +z. y bleibt −1 und 1+1+3=5=|Q|². Beide Sinusvorzeichen sind richtig.

DE/EN: Aktiv/passiv, positive Achsenrichtung, Winkelvorzeichen, Basisreihenfolge und Betrag sind in DE/EN identisch spezifiziert.

Abdeckung/Transfer: Die Fälle verlangen eigene Matrixbildung und Bild-/Invariantentest. x/+90°→y/−60° ist substantieller Transfer, nicht das bloße Wiederholen des z-90°-Bilds.

Historischer Abgleich: A/B verlangen Achsen-/Drehsinnwechsel und begründete Sinusvorzeichen. Alte Bildfehler und HE-Scope sind separat dokumentiert; dieser P-Review ist keine zusätzliche normative Geltungsentscheidung.

## 52e57eb5-7cd1-5df0-a8c6-7b090f097d9f — PASS

Das AB1-Ziel enthält ausdrücklich Erstellen sowie gemeinsame und bedingte Anteile. Gleichwahrscheinliche Auswahl aus der beschriebenen endlichen Gruppe begründet die Wahrscheinlichkeitsdeutung der Häufigkeiten.

- `visitor-four-field-table`: F∩V=27; F∩¬V=72−27=45; ¬F∩V=90−27=63; Rest 180−27−45−63=45. Zeilen 72/108, Spalten 90/90. Gegenprobe/Lösungsgrenze: Division aller Zellen durch 180 ergibt 3/20,1/4,7/20,1/4, Summe 1. Dieselbe Zelle 27 ergibt 27/180=3/20, 27/90=3/10 und 27/72=3/8; die Nenner sind nicht austauschbar.
- `relative-multi-field-travel-table`: 250·[[.10,.20],[.20,.10],[.30,.10]]=[[25,50],[50,25],[75,25]]. Zeilen 75,75,100; Spalten 150,100. Gegenprobe/Lösungsgrenze: Alle sechs Gesamtanteile summieren sich zu 1. Gemeinsamer Bus-/Flaschenanteil 75/250=3/10, Flasche|Bus=75/100=3/4, Bus|Flasche=75/150=1/2. Die Tafel interpretiert die angegebenen Verkehrswege als disjunkte Erhebungskategorien, nicht als überlappende Mehrfachantworten.

DE/EN: Zeilen-/Spaltenausrichtung, Gesamtbezugsprozente und umgekehrte Bedingungen sind DE/EN äquivalent.

Abdeckung/Transfer: Absolute 2×2-Daten→relative/absolute 3×2-Daten verändert Datenform und Kategorienzahl. Beide Pflicht-Erwartungen sind mit benannten Bezugsgruppen nachweisbar.

Historischer Abgleich: Historischer A KEEP/B BLOCK war ein Dissens über grafische Pfeilzuordnung. Beide Verständnisfelder verlangen Zelle plus Bezugsgruppe; das Profil erfüllt dies explizit. Der alte Bilddissens wird nicht hier entschieden.

## c3b9c561-dd83-5903-9ec6-49c7f51bafd5 — PASS

AB2: Bedingung und Zielereignis, Tafeln/Bäume, absolute/relative Angaben. Umkehrung wird durch gemeinsame Anteile und Nennerwahl gelöst; kein spezielles Bayes-Schema ist vorgeschrieben. P(A)>0 ist ausdrücklich als Definitionsgrenze gesetzt.

- `dispatch-counts-and-express-first-tree`: Tafel [[48,12],[52,48]], Zeilen 60/100 und Spalten 100/60. P(P|E)=4/5, P(E|P)=12/25, P(P|¬E)=13/25. Erste Baumstufe 3/8,5/8; zweite 4/5,1/5 beziehungsweise 13/25,12/25. Gegenprobe/Lösungsgrenze: Die vier Pfadprodukte sind 48/160,12/160,52/160,48/160, insgesamt 1. Jede zweite Verzweigung summiert sich zu 1. Die umgekehrte Bedingung benutzt P-Gruppe 100 statt E-Gruppe 60.
- `relative-bag-tree-reversed-and-zero-condition`: Gemeinsame Anteile: I/rot=3/10·2/5=3/25, I/schwarz=9/50, II/rot=7/100, II/schwarz=63/100. Rot gesamt 19/100, schwarz 81/100. Gegenprobe/Lösungsgrenze: P(I|rot)=12/19, P(I|schwarz)=18/81=2/9. Alle Nenner sind positiv. Grün ist im angegebenen ausschließlich rot/schwarzen Modell unmöglich, also P(grün)=P(I∩grün)=0; der elementare Quotient 0/0 ist nicht definiert. Exakte Brüche verhindern den früheren Rundungskonflikt.

DE/EN: DE/EN verwenden dieselben Ereignisse, Konditionierungsrichtungen, Auswahlregeln und die begrenzte elementare Nullbedingungsaussage.

Abdeckung/Transfer: Der Wechsel von gezählten Sendungen zum relativen zweistufigen Beutelmodell verlangt Tafel-Baum-Übertragung und umgekehrte Bedingungen; der Nullfall prüft die Rechenvoraussetzung.

Historischer Abgleich: Historischer A BLOCK/B KEEP betraf unmarkierte 0.33/0.67-Rundungen im Bild. Das Profil verwendet ausschließlich exakte Brüche und korrekte Pfadprodukte. Beide ursprünglichen positiven Evidenzketten werden erhalten, ohne den alten Bilddissens pauschal aufzulösen.

## Grenzen und Übergabe

- P-Inhaltreview; keine neue D-/V- oder Human-Freigabe.
- Zuvor getrennt erstellte Bildreviews werden nicht als Ersatz dieses P-Reviews verwendet.
- Kein tatsächlicher Lernendenlauf, keine neue Lehrplan- oder Länder-Scopeentscheidung.
- Native Materialisierung ausschließlich in-memory ohne Resource-Digests; endgültige Seiten-/Assetbindungen sind Root-Integrationsaufgabe.
- Kandidaten, Canonical, QA, Views, zentrale Registrierungen und Ledgers unverändert.

Alle zehn unveränderten Profile können als fachlich geprüfte AI-Kandidaten auf endgültige aktuelle Ressourcen materialisiert werden. Erforderliche native Integrationschecks und Wahrung der maschinellen/nichtmenschlichen Claim-Grenze bleiben bestehen.

