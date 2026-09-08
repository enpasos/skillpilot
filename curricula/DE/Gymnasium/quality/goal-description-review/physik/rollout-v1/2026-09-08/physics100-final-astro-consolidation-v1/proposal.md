# Begrenztes Astro-Konsolidierungspaket: informierter Autorenentwurf

Stand: 2026-09-08T06:28:02Z. Rolle: informierter AI-Autor, E1/G1; keine neue Blindrunde und keine Humanfreigabe. Dieses Dokument ist ein Entwurf, keine operative Curriculumänderung. Historische D048–D050-Runden bleiben unverändert.

## 1. Zwei bestehende Ziele als stabile Cluster erhalten

`f67550ac-df22-5a3e-8172-f04642efca64` wird ein Cluster mit drei neuen Atomen. Das bisherige qualitative HRD-Ziel `206fe51d`, das allgemeine Entfernung-/Leuchtkraftziel `db6b8de4` und die Sonnenleuchtkraft `9851bd02` bleiben eigenständig. `9b47a758` ist bereits ein Cluster, kein wiederverwendbares Leuchtkraft-Atom; seine bisherige zusätzliche Cluster-Voraussetzung wird nicht auf Kinder kopiert.

### H1 – Sternradien aus HRD-Daten abschätzen / Estimate stellar radii from HR-diagram data

DE: Die lernende Person kann aus Leuchtkraft und Oberflächentemperatur eines Sterns im Hertzsprung-Russell-Diagramm seinen Radius mit einem thermischen Strahlungsmodell abschätzen und erklären, wie beide Größen die Schätzung bestimmen.

EN: The learner can estimate a star's radius from its luminosity and surface temperature in a Hertzsprung–Russell diagram using a thermal-radiation model and explain how both quantities determine the estimate.

Voraussetzungen: `206fe51d` (HRD-Koordinaten und Bereiche), `89124b92` (thermische Strahlungsbeziehungen). Keine neue Temperaturbestimmungs-Kompetenz; Temperatur ist hier eine Eingangsgröße der Radiusinferenz.

### H2 – Sternentfernungen mit dem HRD abschätzen / Estimate stellar distances using the HR diagram

DE: Die lernende Person kann aus einer begründeten Zuordnung eines Sterns im Hertzsprung-Russell-Diagramm und seiner beobachteten Helligkeit die Entfernung abschätzen und erklären, wie eine falsche Zuordnung oder nicht berücksichtigte Absorption das Ergebnis beeinflusst.

EN: The learner can estimate a star's distance from a justified placement in the Hertzsprung–Russell diagram and its observed brightness, and explain how an incorrect placement or unaccounted-for absorption affects the result.

Voraussetzungen: `206fe51d` und `db6b8de4`. Die eigentliche zusätzliche Kompetenz ist die begründete Leuchtkraftkalibrierung aus der HRD-Zuordnung, nicht erneut das allgemeine Abstandsgesetz. Gleiche Temperatur allein bestimmt weder Leuchtkraftklasse noch Entfernung.

### H3 – Hauptreihenzeiten mit der Masse-Leuchtkraft-Beziehung abschätzen / Estimate main-sequence lifetimes using the mass–luminosity relation

DE: Die lernende Person kann die Hauptreihenzeit eines Sterns mithilfe einer für seinen Massenbereich geeigneten Masse-Leuchtkraft-Beziehung und eines vereinfachten Brennstoffmodells abschätzen und die Grenzen dieser Abschätzung begründen.

EN: The learner can estimate a star's main-sequence lifetime using a mass–luminosity relation appropriate to its mass range and a simplified fuel model, and justify the limitations of the estimate.

Voraussetzung: `6f896466` (massenabhängige Entwicklung). Das Modell verbindet verfügbares Energiebudget und Leistung zu einer Lebensdauer; die Masse-Leuchtkraft-Beziehung ist darin ein Mittel, kein zweites unabhängiges Ziel. Kein pp-Ketten-Rechenzwang bei massereichen Sternen.

`5b8eaf71-96fe-50eb-b9ea-a8fa392df086` wird ein Cluster mit zwei qualitativen Nachweis-Atomen. Sein fachlich brauchbares Zweiverfahren-Bild bleibt unverändert beim Cluster. `ce037050` bleibt unverändert die quantitative Dopplerauswertung von Sternspektren; es ersetzt nicht die Erklärung planetenbedingter periodischer Sternbewegung und wird für den qualitativen BW-Basisfach-Zugang nicht als quantitative Pflichtvoraussetzung hinzugefügt.

### E1 – Exoplanetenkandidaten mit der Transitmethode erklären / Explain exoplanet candidates using the transit method

DE: Die lernende Person kann wiederkehrende Helligkeitsabnahmen eines Sterns mit dem Transit eines möglichen Planeten erklären und begründen, wie die Beobachtungsgeometrie die Nachweismöglichkeit begrenzt.

EN: The learner can explain recurring decreases in a star's brightness as transits of a possible planet and justify how the viewing geometry limits detection.

### E2 – Exoplanetenkandidaten mit Stern-Radialbewegungen erklären / Explain exoplanet candidates using stellar radial motion

DE: Die lernende Person kann periodische Dopplerverschiebungen im Spektrum eines Sterns mit seiner Bewegung um den gemeinsamen Schwerpunkt eines möglichen Stern-Planet-Systems erklären und die Aussagekraft dieses indirekten Nachweises begrenzen.

EN: The learner can explain periodic Doppler shifts in a star's spectrum through its motion around the shared centre of mass of a possible star–planet system and identify the limits of this indirect evidence.

Voraussetzung beider Kinder: `af5dfdbc` (Sonnensystem-Aufbau). Die grundlegende kausale Deutung der periodischen Dopplersignatur ist Inhalt E2; quantitative Radialgeschwindigkeiten, Mindestmassen oder Bahnanpassungen sind nicht eingeschmuggelt. Für `e2014db8` werden beide Kinder anstelle des alten Sammelziels als atomare Voraussetzungen geführt.

## 2. Quellen- und Scope-Entscheidung zur Abstimmung

Die aktuell breite Sichtbarkeit ist kein Beleg: f675 erscheint in 15 Ländern, 5b8 in 16 Ländern, jeweils GK/LK. Alle direkten und geerbten Mappings zu diesen Eltern, zum Astro-Cluster, Q4 und zum Wurzelknoten wurden read-only untersucht. Die generischen Landes-Wurzelmappings und die Q4-Mappings zu Quanten-/Atomphysik stützen keine der neuen Astro-Kompetenzen.

| Kind | Belegte/vertretbare Unterrichtssicht | Original und bindbare Teilkompetenz |
| --- | --- | --- |
| H1, H2 | BY, Sek II, Jahrgang 13, G9, GK, Lehrplanalternative Astrophysik | BY Ph13-GA-ASTRO.4.3 (`38126b26`); amtlicher Inhaltskatalog nennt Sternradius und spektroskopische Entfernungsbestimmung. Direkte Teilmappings, nicht jeder gesamte Bullet an jedes Kind. |
| H3 | BY wie oben; zusätzlich RP, Sek II, Qualifikationsphase, GK/LK, Wahlpflicht Astrophysik vorgeschlagen | BY4.3 nennt quantitative Masse-Leuchtkraft-Beziehung und Hauptreihenzeit explizit. RP nennt im Grundfach S. 44 und Leistungsfach S. 73 Masse-Leuchtkraft-Beziehung und Sternentwicklung: H3 ist eine begrenzte didaktische Operationalisierung, keine wörtlich vorgeschriebene Lebensdauerformel. RP-Mapping `rp-phys-sek2-mass-luminosity-stellar-evolution` gezielt partial an H3; bisheriges HRD-/Entwicklungsangebot nicht pauschal löschen. |
| E1, E2 | BY wie oben; BW Sek II, Klassen 11/12, GK/Basisfach mit Schwerpunkt Astrophysik | BY4.6 (`8c600779`) Nachweismethoden als Teil einer breiteren Quellen-/Habitabilitätskompetenz; BW3.5.7(8) (`bw-phys-sekii-3-5-7-b08-a01-95056f0a`), Original S. 38. Beide Verfahren sind ausdrücklich Beispiele, keine Behauptung, der Bullet verlange alle fünf genannten Methoden. |

BY-GK-only ist keine Namensheuristik: Die aktuelle GSO §48 Abs.1 Satz9 Nr.4 beschränkt die Astrophysik-Lehrplanalternative auf das grundlegende Prüfungsniveau. Der amtliche eA-Fachlehrplan wurde gegengelesen und enthält diese Astro-Lernbereiche nicht. Ein allgemeiner eA-Einleitungstext über Alternativen erzeugt keine Übernahme der gA-Astro-Ziele. Ein separates Zusatzangebot ist möglich, aber nicht automatisch der LK-Unterrichtsscope. Die groben bisherigen Extraktionswerte `GK_LK` sind für genau diese Originalstellen zu korrigieren/übersteuern; keine pauschale BY-GA-Neuzuordnung außerhalb dieses Pakets.

BW-Scope ebenfalls aus der Original-Überschrift, nicht aus dem groben Extraktionswert `GK_LK`: Basisfach mit Schwerpunkt Astrophysik. Kein Beleg für die Aufnahme dieser konkreten Methoden in den LK durch diesen Bullet.

Geerbte Quellen im Einzelnen: HH Original S.33 nennt Schwarze Löcher, ihre Fallzeiten sowie Planetenklima/Strahlungsbilanzen; weder Exoplaneten-Nachweisverfahren noch HRD-Radius/Entfernungsinferenz oder quantitative Hauptreihenzeit werden dadurch belegt. HE Original Q4.6 S.47 nennt qualitativ Sterntypen/Lebenszyklen (LK), aber nicht diese quantitative HRD-Kompetenz und keine Exoplanetenmethoden. RP Sonnenzustandsgrößen und Standardsonnenmodell sind kein HRD-Inferenzbeleg; aktuelle Forschungsergebnisse sind kein konkreter Methodenbeleg. Nur der RP-Masse-Leuchtkraft-Bullet liefert den oben bezeichneten engeren, nicht wortgleichen Teilbezug.

Umsetzung: Beide stabilen Eltern erhalten eine Mapping-Vererbungsgrenze; Kinder keine all-16-Clone-Anwendbarkeit. Länder-`goalEntry`/`canonicalSubtree`-Referenzen werden zielgenau angepasst; nationale Gesamtnavigation zeigt alle fünf Kinder jeweils genau einmal. Abhängige E201/EX-Aufgaben bekommen in unbelegten Ländersichten keine Hintertür zur target-Projektion der Kinder; fachlich benötigte Kinder dürfen dort nur explizit `prerequisiteOnly` sein, sofern die abhängige Kompetenz selbst eigenständig quellenbelegt bleibt. Kein pauschales Entfernen anderer Inhalte/Angebote.

Quellen: [BY Sterne](https://www.lehrplanplus.bayern.de/fachlehrplan/lernbereich/314022), [aktueller BY §48](https://www.gesetze-bayern.de/Content/Document/BayGSO-48), [BY eA-Fachlehrplan](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/physik/erhoeht). BW/HH/RP/HE wurden zusätzlich anhand der im Repository liegenden amtlichen Original-PDFs gelesen; Extraktionsseitenfehler RP Grundfach S.43 versus Original S.44 wird im Receipt ausdrücklich vermerkt, nicht ungeprüft weiterkopiert.

## 3. Tatsächliche Aufgaben, keine erfundene Coverage

Für H1–H3 sind drei kurze getrennte lokale Aufgaben sinnvoll. Jede deckt nur ihr Kind ab. Damit erzwingt H3 in RP nicht die BY-spezifischen H1/H2 als Lernziel oder als Prüfungsteil. Die folgenden Daten sind didaktisch erfunden, keine realen Sternmessungen.

H1: Ein HRD gibt für A L=16 L☉ und T=2 T☉, für B L=16 L☉ und T=T☉ an. Begründe über L=4πR²σT⁴ die Radien und prüfe die Behauptung gleicher Radius bei gleicher Leuchtkraft. Lösung: A 1 R☉, B 4 R☉; bei gleicher Leistung kompensiert größere strahlende Fläche die geringere Leistung pro Fläche. 6 BE: richtige Beziehung/Deutung 2, zwei Radien 2, begründete Widerlegung 2. EN: Use the supplied HR-diagram luminosities and temperatures to estimate both radii and assess whether equal luminosity implies equal radius; the same results and explanation apply.

H2: Bei gleicher Temperatur erlaubt ein kalibriertes HRD zwei Klassen: L=1 L☉ oder 100 L☉. Ein unabhängig klassifizierter Hauptreihenstern zeigt 1/100 des Flusses eines gleich leuchtkräftigen Referenzsterns in 10 pc. Begründe seine Entfernung und prüfe die Folgen einer Verwechslung mit der Riesenklasse sowie zusätzlicher nicht berücksichtigter Absorption. Lösung: 100 pc; bei Annahme 100 L☉ wären es 1000 pc; unberücksichtigte Absorption lässt die aus dem Fluss geschätzte Entfernung zu groß werden. Temperatur allein wählt die Klasse nicht. 8 BE: begründete Kalibrierung 2, Entfernung 2, Klassenverwechslung 2, Absorption 2. EN: Estimate the independently classified main-sequence star's distance, then evaluate misclassification as a giant and unaccounted-for absorption using the supplied calibration; distinguish classification information from temperature alone.

H3: Für ein ausdrücklich begrenztes Modell im Bereich 0,8–2 Sonnenmassen gelten L/L☉=(M/M☉)^4, nutzbare Fusionsenergie proportional M und t☉=10 Milliarden Jahre. Vergleiche einen Stern mit 2 M☉ mit der Sonne. Prüfe anschließend, ob dasselbe Modell ohne Zusatzbeleg einen Roten Riesen oder einen Stern mit 20 M☉ beschreiben darf. Lösung: 16-fache Leistung bei zweifachem Energiebudget, t=1,25 Milliarden Jahre; kein universelles Potenzgesetz und keine Anwendung auf Riesenphase/außerhalb des vorgegebenen Massenbereichs. 6 BE: Energiebudget/Leistung 2, Ergebnis 2, konkrete Grenzen 2. EN: Estimate the lifetime of a 2-solar-mass star using the explicitly limited model and assess its unsupported extension to a red giant or a 20-solar-mass star.

E1/E2: Die bestehende tatsächliche Aufgabe `f61c424e` enthält bereits Transitkurve UND periodische Sternradialbewegung (Teil1 und begründete Abgrenzung in Teil3). Deshalb ihre bisherige alte 5b8-Coverage durch beide Kinder ersetzen, während Atmosphärenziel `e28381b4` und Aufgabeninhalt unverändert bleiben. Keine zusätzliche fiktive Aufgabe und keine Vollabdeckung aus einem reinen Transitfall. Die vier Textkorrekturen erzeugen keine neue Assessment-Coverage.

## 4. Vier lokale bilinguale Textkorrekturen

Nur die Beschreibungen und ihre tatsächlichen aktuellen Evidenzbindungen ändern; keine zusätzlichen `requires`, keine neuen Unterziele.

`4c5c7cb1-f238-52c8-b82c-159c6c299c0e`

DE: Die lernende Person kann die Umwandlung von Wasserstoffkernen zu Helium in der Proton-Proton-Kette der Sonne erläutern und die dabei frei werdende Energie mit der Abnahme der Summe der Ruhemassen der beteiligten Teilchen erklären.

EN: The learner can explain the conversion of hydrogen nuclei into helium in the Sun's proton–proton chain and relate the energy released to the decrease in the sum of the rest masses of the particles involved.

`db6b8de4-21e0-58e8-a347-2ae39f538f92`

DE: Die lernende Person kann aus geeigneten Beobachtungsdaten die Entfernung oder Leuchtkraft eines Himmelskörpers abschätzen und begründen, welche zusätzlichen Größen und Modellannahmen dafür benötigt werden.

EN: The learner can estimate a celestial object's distance or luminosity from suitable observational data and justify which additional quantities and model assumptions are needed.

`5e9cd796-3887-5457-8a1f-26863ca7eb28`

DE: Die lernende Person kann aus Bahndaten eines die Sonne umlaufenden Körpers mit einem Newton-Kepler-Modell die Sonnenmasse abschätzen und die dafür verwendeten Modellannahmen benennen.

EN: The learner can estimate the Sun's mass from orbital data for a body orbiting the Sun using a Newton–Kepler model and state the model assumptions used.

`6f896466-e0ec-5f8d-82ad-2890433c82ba`

DE: Die lernende Person kann typische Entwicklungswege sonnenähnlicher und massereicher Sterne beschreiben und ihre Unterschiede mit der Anfangsmasse in Zusammenhang bringen.

EN: The learner can describe typical evolutionary paths of Sun-like and massive stars and relate their differences to initial mass.

## 5. AM, P, Visuals und Abnahmegrenzen

AM: Eltern aus dem Inhalts-Atomicity-Scope nehmen; fünf Kinder einzeln fachlich als atomar prüfen, nicht alte `atomic`-Urteile kopieren. Vier lokale Ziele bleiben atomare Modell-/Erklärkompetenzen. Memory: individuell `no_memory_needed`, sofern die konkrete Prüfung keine eigenständige notwendige Abrufanforderung zeigt; bestehende notwendige Kartenbindungen nie pauschal löschen. Jede Entscheidung bekommt aktuelle native Fingerprints und einen getrennten informierten Begründungskörper.

P: Fünf neue kindbezogene Bodies mit eigenständigem Verständnis, beobachtbarer Leistung, sinnvoller Variation und unabhängigem Transfer. Die alten gemischten Elternprofile werden nicht als Kinder-Profile geklont. Die vier bestehenden P050/P051-Bodies wurden inhaltlich erneut gelesen: pp-Nettoreaktion und Massendefekt, Abstand/Fluss-Mehrdeutigkeit, Sonnenumlauf mit großer Halbachse sowie typische massenabhängige Lebenswege passen zu den lokalen Texten. P050-Sonnenmasse bleibt ausdrücklich beim bereits korrigierten exzentrischen Sonnenkometen; kein Wiedereinführen eines allgemeinen massereichen Doppelstern-Transfers. Neu wird die Rolle im Autorenurteil dokumentiert und die Bindung technisch erneuert, ohne neue unabhängige D-Freigabe zu behaupten.

Visuals: 5b8-Zweiverfahren-Grafik bleibt beim neuen Cluster unverändert erhalten. Neue Bilder für fünf Kinder bedürfen der normalen Erzeugungs- und tatsächlichen Bildprüfung; sie werden nicht durch Metadatenkopie grün. Für die vier lokalen Änderungen zunächst kein Bildersatz: die bereits vollständig gesehenen Bilder tragen die korrigierten Aussagen; aktuelle Bild-/Goal-Bindungen und gegebenenfalls Alttexte gesondert prüfen. Root besitzt ausschließlich 826/Milchstraße.

Abnahme nach operativer Freigabe: exakte Goal-/Source-/View-/Task-Diffs; DAG und Stage/Course-Projektion einschließlich nationaler Einmaligkeit; reale Assessment-Coverage; AM/Memory/P-native Validatoren; Visual-QA nur für tatsächlich geprüfte Bytes; aktuelle Ontologie-/Book-Bindungen und berechnete Atomzahl; Quality/M6-Floor. Keine blinden D- oder Registry-Schreibrechte aus diesem Autorenpaket; neue D-Runden brauchen frische unabhängige Reviewer.
