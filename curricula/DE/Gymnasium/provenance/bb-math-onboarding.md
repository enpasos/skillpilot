# BB Math Onboarding Note

This note records the first Brandenburg source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved source landscapes on `2026-03-21`:

- lower-secondary Gymnasium mathematics (`classes 7-10` on the shared BE/BB Sek-I source):
  - `sourceLandscapeId`: `54cf7ae7-21e7-4cc2-a7b8-1f7dd9df5dc1`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BB/lower-secondary/bb_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `c36ba9b3-4d11-4b19-a278-cd6c3c3fcc71`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_math_upper_secondary_to_canonical_math.json`

Activation state:

- the first Brandenburg mathematics source bundle is now archived locally at:
  - `curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Mathematik_2015_10_13_Ma_14.08.2023_Berlin_23_11.pdf`
  - `curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Mathematik.pdf`
- the lower-secondary source uses the shared Berlin/Brandenburg Sek-I mathematics framework and is now normalized into a Brandenburg-specific source snapshot
- both Brandenburg `sourceLandscapeId` values are now active in `source-landscape-registry.json`
- both Brandenburg lanes now contribute source goal memberships to `source-goal-membership-registry.json`
- both Brandenburg lanes now contribute atomic closures to `source-goal-closure-registry.json`
- the first active Brandenburg lower-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BB/lower-secondary/source-json/DE_BRA_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the first active Brandenburg upper-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BB/upper-secondary/source-json/DE_BRA_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the imported lower-secondary pilot subset currently covers:
  - the Gymnasium year anchors `J7-J10`
  - the first reviewed functions corridor on Niveaustufen `E-F`
- the imported upper-secondary pilot subset currently covers:
  - the Einfuehrungsphase bridge to `Niveaustufe H`
  - the Qualifikationsphase anchors `Q1-Q4`
  - the first reviewed E-phase analysis entry corridor on Ableitungsbegriff und ersten Ableitungsanwendungen
  - the first reviewed Brandenburg Q1 model-functions corridor on natuerlicher Exponentialfunktion, Logarithmus und periodischen Funktionen
  - the first reviewed Brandenburg Q2 integral-calculus corridor on Ober- und Untersummen, rekonstruierten Bestaenden, Hauptsatz, Stammfunktionen und ersten Flaechen- und Kontextdeutungen
  - the first reviewed Brandenburg Q2 stochastics corridor on Baumdiagrammen, Vierfeldertafeln, bedingten Wahrscheinlichkeiten, stochastischer Unabhaengigkeit, Urnenmodellen und Simulationen
  - the first reviewed Brandenburg Q2 data-and-distribution corridor on Stichprobenkennwerten, Zufallsgroessen, diskreten Verteilungen, Histogrammen und ersten binomialverteilten Situationen
  - the first reviewed Brandenburg Q2 survey-and-critique corridor on statistischen Erhebungen, Datenaufbereitung und kritischer Auswertung mit Lage- und Streuungsmassen
- the lower-secondary mapping lane now carries the first structural anchor mappings:
  - `J7`, `J8`, `J9`, `J10`
- the lower-secondary mapping lane now also carries the first reviewed corridor mappings:
  - Zuordnungen beschreiben
  - Darstellungwechsel bei Zuordnungen
  - Berechnungen zu proportionalen und indirekt proportionalen Zuordnungen
  - lineare Funktionen beschreiben
  - Darstellungwechsel bei linearen Funktionen
  - Berechnungen zu linearen Funktionen
- the upper-secondary mapping lane now carries the first structural anchor mappings:
  - `E`, `Q1`, `Q2`, `Q3`, `Q4`
- the upper-secondary mapping lane now also carries the first reviewed corridor mappings:
  - E.2 Einfuehrung des Ableitungsbegriffs
  - E.3 Anwendungen des Ableitungsbegriffs
  - mittlere und momentane Aenderungsraten
  - Ableitung als Steigung und lokale Aenderungsrate
  - Ableitungsgraph, Ableitungsregeln, Tangenten und Normalen
  - Monotonie, Kruemmung, Bedingungen und einfache Extremalprobleme
- the upper-secondary mapping lane now also carries the first reviewed Q1 model-functions mappings:
  - natuerliche Exponentialfunktionen fuer Wachstum und Zerfall
  - Parameter und Eigenschaften der natuerlichen Exponentialfunktion
  - Exponentialgleichungen mit dem Logarithmus
  - exponentielle Modellrekonstruktion
  - periodische Funktionen, Parameterdeutung und trigonometrische Ableitungen
- the upper-secondary mapping lane now also carries the first reviewed Q2 integral-calculus mappings:
  - Ober- und Untersummen fuer naeherungsweise Flaecheninhalte
  - bestimmtes Integral als Grenzwert und rekonstruierten Bestand
  - Bestaende aus Aenderungsraten und Anfangsbestand
  - geometrische Begruendung des Hauptsatzes
  - Stammfunktionen und elementare Integrationsregeln
  - Flaechen und Integralterme in Anwendungskontexten
- the upper-secondary mapping lane now also carries the first reviewed Q2 stochastics mappings:
  - mehrstufige Zufallsexperimente mit Baumdiagrammen
  - Vierfeldertafeln fuer gemeinsame und bedingte Wahrscheinlichkeiten
  - bedingte Wahrscheinlichkeiten im Kontext
  - stochastische Unabhaengigkeit an einfachen Beispielen
  - Urnenmodelle mit und ohne Zuruecklegen
  - Simulationen stochastischer Situationen
- the upper-secondary mapping lane now also carries the first reviewed Q2 data-and-distribution mappings:
  - Lageparameter einer Stichprobe bestimmen und deuten
  - Streuungsmasse einer Stichprobe bestimmen und deuten
  - Zufallsgroessen und Wahrscheinlichkeitsverteilungen in Tabellen und Diagrammen nutzen
  - Histogramme diskreter Zufallsgroessen lesen und deuten
  - Erwartungswert und Standardabweichung binomialverteilter Zufallsgroessen bestimmen
  - Punkt- und Intervallwahrscheinlichkeiten binomialverteilter Situationen nutzen
- the upper-secondary mapping lane now also carries the first reviewed Q2 survey-and-critique mappings:
  - statistische Erhebungen exemplarisch planen und dokumentieren
  - Erhebungsdaten tabellarisch und grafisch aufbereiten
  - Erhebungsdaten mit Kenngroessen auswerten und kritisch beurteilen
- repository-backed lower-secondary and upper-secondary mapping fixtures now carry `76` mappings in total

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable
- keep the first Brandenburg reviewed lower-secondary corridor stable while the new upper-secondary E-phase entry lane is widened
- the shared lower-secondary anchor spine `J7-J10` is now mapped
- the first reviewed lower-secondary functions corridor is now mapped
- the Brandenburg upper-secondary phase bridge `E/Q1/Q2/Q3/Q4` is now mapped
- the first reviewed Brandenburg upper-secondary E-phase analysis corridor is now mapped
- the first reviewed Brandenburg upper-secondary Q1 model-functions corridor is now mapped
- the first reviewed Brandenburg upper-secondary Q2 integral-calculus corridor is now mapped
- the first reviewed Brandenburg upper-secondary Q2 stochastics corridor is now mapped
- the first reviewed Brandenburg upper-secondary Q2 data-and-distribution corridor is now mapped
- the first reviewed Brandenburg upper-secondary Q2 survey-and-critique corridor is now mapped
- next, widen the Brandenburg lower-secondary lane beyond the initial functions corridor while the shared BE/BB overlap still stays tight
- after that, decide whether another Brandenburg upper-secondary follow-on corridor or a broader multi-state lower-secondary wave gives the cleaner payoff
