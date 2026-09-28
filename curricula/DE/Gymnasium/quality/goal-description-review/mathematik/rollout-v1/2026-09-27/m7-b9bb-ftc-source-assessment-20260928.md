# b9bb: Quellen- und Zielgrenze für die aktuelle D-Prüfung

Das kanonische Ziel `b9bbd2a8-1379-5ffb-817f-41467d48abef` meint die **Anwendung des Hauptsatzes** mit einer passenden, gegebenen oder zuvor bestimmten Stammfunktion: Zusammenhang zwischen Ableitung und Integral, Randwertdifferenz `F(b)−F(a)` und Deutung als orientierte Flächenbilanz. Das eigenständige Bilden einer Polynom-Stammfunktion ist der Vorgänger `31be24f0-3ab1-54d2-856d-fa9b7f36552f`; Flächennäherung ist `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`. Bestandsrekonstruktion und Integral-Linearität sind andere Lernleistungen.

## Tragfähige Quellen für genau diesen Kern

- [BW BP2016, Gymnasium Kursstufe, 3.5.1(6)](https://www.bildungsplaene-bw.de/%2CLde/BP2016BW_ALLG_GYM_M_IK_11-12-BF_01): Hauptsatz zur Berechnung bestimmter Integrale nutzen. Die BW-Kante zu `b9bb` bleibt `exact` für diesen berechenbaren Hauptsatz-Kern.
- [BW BP2016, 3.5.4(11)](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M_IK_11-12-BF_04): Hauptsatz anwenden. Die Kante zu `b9bb` bleibt erhalten. 3.5.4(8) fordert getrennt die Deutung als orientierten Flächeninhalt und Bestandsänderung.
- [BY LehrplanPLUS, Mathematik 13 auf erhöhtem Anforderungsniveau, M13.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik): Hauptsatz anschaulich begründen, bestimmte Integrale mit Stammfunktionen berechnen und Integrale als Flächenbilanz deuten. Die vorliegende BY-Quellkante ist ausdrücklich `partial`; sie belegt nicht ohne Weiteres die technische BY-GK-Projektion.
- [HE KCGO 2024 Q1.1, gedruckte S. 36](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) nennt den anschaulich begründeten Hauptsatz als Beziehung zwischen Differenzieren und Integrieren und das Integral als orientierten Flächeninhalt. Der amtliche Ausschnitt nennt `F(b)−F(a)` nicht wörtlich. Die alte HE-Legacy-Brücke ist kein Ersatz für den amtlichen Beleg.
- [NW KLP 2023, GK S. 25 und LK S. 28](https://www.schulentwicklung.nrw.de/lehrplaene/lehrplan/331/gost_klp_m_2023_06_07.pdf) enthält die Anwendung des Hauptsatzes und getrennte Nutzung von Stammfunktionen. Das aktuelle NW-Source-Mapping ordnet mehrere prüfbare Aspekte verteilt `31be`, `b9bb` und einem Bestandsziel zu; eine Sammelzeile ist kein exakter Einzelbeleg für alle Aspekte.

## Gezielt korrigierte Kanten und verbleibende Grenze

Im BW-Source-Extraction-Review wurden die irreführenden `exact`-Kanten von 3.5.4(9) Funktionsrekonstruktion, (10) Bestandsbestimmung, (12) wechselseitige Graph-Beziehung und (13) Integral-Linearität zu `b9bb` entfernt. Für (12) wurde zusätzlich die sachfremde `exact`-Kante zu `2afba4a2` entfernt. Die Begriffsbeziehung bei `0404f20e` ist nur `partial`: **Die BW-Leistung, aus dem Graphen von `f` auf den Graphen einer Stammfunktion und umgekehrt zu schließen, ist dadurch nicht vollständig abgedeckt.** Die aktuelle Mapping-Review-Struktur verlangt technisch für jede Source-ID eine nichtleere `mapped`-Zuordnung; dieses `mapped` darf bei (12) nicht als Vollabdeckungsnachweis gelesen werden. Eine fachliche BW-Ziel-/Geltungsprüfung für die Graph-Leistung bleibt offen.

BW 3.5.4(13) ist nach Entfernen der sachfremden Kanten `partial` dem spezifischen Ziel `649b673c-1a74-5dc5-af01-b4c9e090b90d` für Intervalladditivität und Integral-Linearität zugeordnet. Die Kanten von BW 3.5.4(9)/(10) zum breiten Integral-/Bestandsziel `2afba4a2` wurden im hier begrenzten b9bb-Audit nicht neu freigegeben; ihre Granularität ist separat zu prüfen.

Die HE-Legacy-Zeile `482e852b…` vereint die jetzige Hauptsatz-Anwendung mit eigenständigem Stammfunktionsbestimmen. Deshalb sind ihre Zuordnungen zu `b9bb` und `31be` jetzt jeweils `partial` statt einer falschen `exact`-Identität. Diese Legacy-Brücke ist Provenienz, keine neue amtliche Source-Extraction-Entscheidung.

Diese Quellenprüfung ist **keine** D-Resolution. Dafür sind zwei voneinander unabhängige, auf die abschließend aktuelle Buchseite gebundene A/B-Reviews mit Synthese erforderlich. Die offene BW-Graph-Abdeckung darf auch bei einem späteren D-`keep` für `b9bb` nicht als erledigt gelten.
