"""Serialize this reviewer's actual blind judgments; does not derive decisions from hashes."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'
J = {}

def add(goal, ed, ee, od, oe, td, te, rationale, image):
    J[goal] = dict(understandingEvidence=dict(essentialUnderstandingDe=ed, essentialUnderstandingEn=ee, observablePerformanceDe=od, observablePerformanceEn=oe, transferExpectationDe=td, transferExpectationEn=te), rationale=rationale, visualObservation=image)

add('75e2eff1-f871-5461-9e3f-26d0b333ce2f',
 'Eine chemisch untersuchbare Frage verbindet eine veränderbare Bedingung mit einem beobachtbaren Befund; eine Hypothese benötigt eine begründete Vorhersage und mögliche Widerlegung.',
 'A chemically investigable question connects a changeable condition with an observable finding; a hypothesis needs a justified prediction and a possible counterfinding.',
 'Formuliert eigene Fragen zur Zuckerauflösung und Apfelbräunung, begründet die jeweilige Hypothese und beschreibt Unterstützung, Gegenbefund und kontrollierte Bedingungen.',
 'Formulates own questions about sugar dissolution and apple browning, justifies each hypothesis and describes support, counterfinding and controlled conditions.',
 'Ersetzt Temperatur durch Körnung beziehungsweise Säurezugabe durch Sauerstoffzugang und berücksichtigt Rühren, Masse oder Feuchte als mögliche Alternativursachen.',
 'Replaces temperature by grain size or acid addition by oxygen access and considers stirring, mass or humidity as possible alternative causes.',
 'KEEP: Beide Sprachen verlangen Eigenformulierung, Begründung und prüfbare Gegenbefunde. Die beiden Fälle prüfen diese Leistung eigenständig; Lösungsgeschwindigkeit bleibt von maximaler Löslichkeit getrennt. Voraussetzungen und Verweis auf das theoriegestützte Folgeprodukt passen.',
 'Frage/Hypothese/Versuch/Tabelle mit Schutzbrille; 80 s und 35 s sind lesbar und nicht vertauscht.')
add('503dedcb-0efc-5e6b-bbc9-20761a0951f5',
 'Theoriegestützte Vorhersagen folgen aus einer Gleichgewichtsbeziehung unter benannten Näherungen; Konzentration, Dissoziationsanteil und Gleichgewichtskonstante haben verschiedene Bedeutungen.',
 'Theory-based predictions follow an equilibrium relation under stated approximations; concentration, dissociation fraction and equilibrium constant have distinct meanings.',
 'Leitet für die schwache Säure die näherungsweise pH-Zunahme 0,5 bei zehnfacher Verdünnung ab und erklärt bei A+B⇌C+D die Reaktion auf Stoffzugabe oder Produktentzug.',
 'Derives the approximate pH increase of 0.5 for tenfold dilution of the weak acid and explains the response of A+B⇌C+D to reactant addition or product removal.',
 'Vergleicht mit der vollständig dissoziierten Säure und prüft Näherungsgrenzen; unterscheidet die veränderte Zusammensetzung vom unveränderten K bei gleicher Temperatur und Katalysatoreinsatz.',
 'Compares with a fully dissociated acid and checks approximation limits; distinguishes changed composition from unchanged K at the same temperature and under catalysis.',
 'KEEP: Die Theorieanforderung ist gegenüber der Alltagsfrage erkennbar. Die Säure- und Gleichgewichtsfälle liefern nachvollziehbare Ableitungen; Autoprotolyse/Näherungen und Katalysatorgrenzen bleiben explizit. Eigene Frage und Hypothese bleiben Pflicht.',
 'HA⇌H⁺+A⁻, Verdünnung und pH-Kontext passen zur Beschreibung; keine sichtbare falsche Ladungsbilanz.')
add('e81a4aed-9695-533e-8eb7-7a0c714346ea',
 'Eine angeleitete Untersuchung gewinnt belastbare eigene Beobachtungen durch tatsächliche sichere Durchführung, geprüfte Messbedingungen und dokumentierte Kontrollvergleiche.',
 'A guided investigation obtains dependable own observations through actual safe execution, checked measurement conditions and documented control comparisons.',
 'Führt die angeleitete Leitfähigkeits- und Auflösungsuntersuchung tatsächlich durch, protokolliert eigene Rohwerte und dokumentiert Gerät, Referenztemperatur und Standardprüfung.',
 'Actually performs the guided conductivity and dissolution investigations, records own raw readings and documents the instrument, reference temperature and standard check.',
 'Prüft Sondenverschleppung oder veränderte Körnung als alternative Ursache; wählt für 1970–2010 µS/cm einen geeigneten Bereich und stoppt bei unbestätigter Prüfung.',
 'Checks probe carry-over or changed grain size as alternative causes; selects a suitable range for 1970–2010 µS/cm and stops when the check is unconfirmed.',
 'KEEP: Das angeleitete Handlungsprodukt bleibt von selbstständiger Planung getrennt. 0–5000 deckt den gesamten Standardbereich ab; Auflösung ersetzt keine Genauigkeits- oder Standardprüfung. Verschleppung wird nur als Fehlerhypothese untersucht, nicht absichtlich ausgeführt. Vorgegebene Zahlen beweisen keine Durchführung.',
 'Versuchsbild mit Schutzmaßnahmen und angeleiteter Durchführung; aktueller Sicherheits-Voraussetzungsverweis steht vollständig auf beiden Seiten.')
add('42391b16-bbae-5c77-84e1-d488e714167b',
 'Eine eigene einfache Versuchsplanung verbindet qualitative Merkmale und quantitative Messgrößen mit Kontrollen, Sicherheit und einer begründeten Auswertung.',
 'An own simple experimental plan connects qualitative features and quantitative measurements with controls, safety and justified interpretation.',
 'Plant und realisiert eine eigene NaCl-Konzentrationsreihe sowie die sichere Untersuchung des klar/Rest-Übergangs bei 10 g Wasser; protokolliert eigene Daten und Bedingungen.',
 'Plans and carries out an own NaCl concentration series and the safe investigation of the clear/residue transition in 10 g of water; records own data and conditions.',
 'Kontrolliert Temperatur und Gerät und verengt einen selbst beobachteten Sättigungsbereich durch kleinere Masseschritte; trennt langsame Auflösung von Sättigung.',
 'Controls temperature and instrument conditions and narrows an actually observed saturation bracket using smaller mass steps; separates slow dissolution from saturation.',
 'KEEP: Eigenplanung, qualitative und quantitative Anteile sowie tatsächliche sichere Durchführung sind in DE/EN erhalten. Die Referenzmassen 3,5/3,8 g werden nicht als eigene Messung ausgegeben. Das angeleitete Vorgängerziel begründet den Übergang.',
 'Eigene Versuchsplanung und Mess-/Beobachtungsdarstellung vollständig; interne Rückverweise zu angeleitetem Vorgänger und anspruchsvollerem Nachfolger lesbar.')
add('f79f15c0-e848-5e17-9eb5-26753d35c93b',
 'Quantitative Analysen benötigen eine zur Probe passende Methode, gültige Kalibrierung beziehungsweise Maßlösung und eine getrennte Bewertung von absoluter Konzentration, Verhältnis und Unsicherheit.',
 'Quantitative analyses need a method suitable for the sample, valid calibration or titrant and separate evaluation of absolute concentration, ratio and uncertainty.',
 'Plant und führt Titration und Brilliant-Blue-FCF-Analyse mit eigenen Messungen durch; begründet Endpunkt, pH-Prüfung, Wellenlänge und Verdünnung und dokumentiert die gültige Auswertung.',
 'Plans and performs titration and Brilliant Blue FCF analysis with own measurements; justifies endpoint, pH check, wavelength and dilution and documents valid evaluation.',
 'Erklärt bei veränderter Maßlösung die unterschiedlichen Folgen für Konzentration und Verhältnis und verdünnt eine Probe oberhalb der Kalibriergrenze vor einer neuen Messung.',
 'Explains the different effects of changed titrant on concentration and ratio and dilutes a sample above the calibration limit before a new measurement.',
 'KEEP: Die qualitative/quantitative Methodenleistung ist vollständig. 8/16 mL liefern nur unter passenden Bedingungen das Verhältnis 2; 0,0090 mol/L verändern die absoluten Werte. 630 nm passt zum benannten Farbstoff, 0,810 liegt außerhalb 0,490. Das Verdünnungsintervall 1,994–2,006 ist keine Gesamtunsicherheit.',
 'Titrationsaufbau und selbst bearbeitetes Protokoll liegen aus Sicht der handelnden Person richtig; keine Rückseiten-/Ausrichtungsstörung sichtbar.')
add('9fc800d1-92d1-5ef6-81c1-33960ae034dd',
 'Nachvollziehbare Dokumentation erhält Datenherkunft, Einheiten, Bedingungen und Versionen und unterscheidet Beobachtungen von Deutungen sowie gelieferten von eigenen Daten.',
 'Traceable documentation preserves data origin, units, conditions and versions and distinguishes observations from interpretations and supplied data from own data.',
 'Erstellt ein strukturiertes Protokoll der Temperatur-/Zeitdaten und eine prüfbare digitale Kalibrierdokumentation mit Rohdaten, Quellen, Formeln und offen gekennzeichneten Lücken.',
 'Creates a structured record of temperature/time data and auditable digital calibration documentation with raw data, sources, formulas and explicitly marked gaps.',
 'Dokumentiert einen neuen W3-Vorgang getrennt vom unvollständigen alten Datensatz und führt die Änderung des Verdünnungsfaktors 2 auf 4 als neue Auswertungsversion.',
 'Documents a new W3 event separately from the incomplete earlier dataset and handles the dilution-factor change from 2 to 4 as a new evaluation version.',
 'KEEP: Eigene vollständige Dokumentation ist prüfbar, ohne rückwirkend Messbedingungen zu erfinden. Das neue Ereignis bestätigt alte Werte nicht. Die source-spezifisch angeleiteten Beiträge bleiben Teilbeiträge; digitale Erfassung und echte Durchführung werden nicht durch vorgegebene Daten geschlossen.',
 'Strukturierte Daten-/Notizdarstellung mit klarer Trennung; native Seite zeigt Dokumentationsziel und nachfolgende Auswertungs-/Validitätsverweise ungekürzt.')
add('7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6',
 'Eine passende Darstellung macht Trends und Streuung sichtbar und erlaubt begrenzte Hypothesenaussagen unter kontrollierten Bedingungen.',
 'A suitable representation makes trends and spread visible and permits bounded statements about a hypothesis under controlled conditions.',
 'Stellt Temperatur/Zeit-Mittelwerte und Leitfähigkeitsdaten mit Einheiten dar, erläutert den Trend und verknüpft ihn mit der jeweiligen gegebenen Hypothese.',
 'Represents temperature/time means and conductivity data with units, explains the trend and connects it with the respective supplied hypothesis.',
 'Bewertet bei 50 °C die Werte 80/45 s gemeinsam mit Mittelwert und großer Streuung und prüft bei Leitfähigkeit Temperatur beziehungsweise mobile Ionen als Bedingungen.',
 'Evaluates the 80/45 s readings at 50 °C together with their mean and large spread and checks temperature or mobile ions as conditions of conductivity.',
 'KEEP: Das Produkt verlangt Auswertung und Hypothesenbezug, keine universelle Eigenformulierung einer neuen Hypothese. 62,5 s bei 50 °C und die Spannweite 35 s verhindern selektive Bestätigung. Die NaCl-Reihe bleibt bei gleicher Temperatur plausibel und kein allgemeiner Stoffidentitätsnachweis.',
 'Tabelle 20 °C: 60/58, Mittel 59; 30 °C:45/47, Mittel46; 40 °C:30/32, Mittel31 und Kurve sind konsistent lesbar.')
add('9e3fae29-84d5-5600-bfb3-82d49ea3f1b5',
 'Mathematische und digitale Verfahren liefern chemische Aussagen nur innerhalb eines passenden Modells; Anpassung, Residuen, Gültigkeitsbereich und Unsicherheit müssen beurteilt werden.',
 'Mathematical and digital methods yield chemical statements only within an appropriate model; fit, residuals, validity domain and uncertainty need evaluation.',
 'Erstellt eigene digitale Kalibrier- und Kinetikauswertungen mit Formeln, Diagrammen, Residuen und chemischer Interpretation; leitet k≈0,05 min⁻¹ und t½≈13,86 min aus der gegebenen Reihe ab.',
 'Creates own digital calibration and kinetic evaluations with formulas, plots, residuals and chemical interpretation; derives k≈0.05 min⁻¹ and t½≈13.86 min from the supplied series.',
 'Kennzeichnet A=0,650 als außerhalb der Kalibrierung und trennt beim neuen c(20)=0,050 den alten Modellvergleich vom neuen Fit und dessen Residuen.',
 'Flags A=0.650 as outside calibration and separates comparison with the earlier model from the new fit and its residuals when c(20)=0.050.',
 'KEEP: Tatsächliche digitale Produkte und fachliche Auswahl bleiben erforderlich. Die formale Extrapolation wird nicht zur gültigen Konzentration erklärt. Die geänderte Kinetik erlaubt einen begrenzten Modellwiderspruch, keinen aus Residuen erfundenen Mechanismus; Streuung ist keine vollständige Unsicherheit.',
 'Quantitative/digitale Auswertung in aktueller Ganzseite mit vorheriger Datenanalyse und theoriegestütztem Fragenziel; keine abgeschnittenen Formeln oder Verweise.')
add('4aa3a130-b517-5ac5-87b2-147fe432cadd',
 'Die Aussagekraft von Daten hängt von Fragestellung, Selektivität, Kontrollen, Matrix und Messbedingungen ab; Präzision allein begründet keine eindeutige Identifikation.',
 'The meaning of data depends on the question, selectivity, controls, matrix and measurement conditions; precision alone does not justify unique identification.',
 'Beurteilt den kreuzreaktiven Farbtest und den temperaturverschiedenen Leitfähigkeitsvergleich, begründet die zulässige Schlussreichweite und nennt passende Verbesserungen.',
 'Evaluates the cross-reactive colour test and conductivity comparison at different temperatures, justifies the permitted conclusion and proposes suitable improvements.',
 'Prüft nach Ausschluss eines Interferenten weiterhin andere Interferenzen und berücksichtigt bei zusätzlicher Saccharose Viskosität und matrixgleiche Kontrollen.',
 'Continues to check other interferences after excluding one interferent and considers viscosity and matrix-matched controls when sucrose is added.',
 'KEEP: X/Y-positive Tests erlauben keine exklusive X-Aussage; ein Blindwert behebt mangelnde Selektivität nicht. A35≈B35 widerlegt den ursprünglichen Konzentrationsschluss aus A20/B35. ±3 bezeichnet die gelieferte Streuung, nicht die Gesamtunsicherheit. Die Beschreibung deckt diese Begründungsleistung ab.',
 'Validitäts-/Kontrollmotiv passt zur Beschreibung; alle Vorgänger und Nachfolger sind auf HTML/PDF sichtbar, ohne eine neue eigenständige Durchführung zu suggerieren.')
add('a8800c36-d13c-5f63-962c-cf18c3795c63',
 'Ein Erkenntnisweg verbindet Frage, Methode, Beobachtung und Schluss; die Reichweite eines chemischen Schlusses wird durch Nachweis und Kontrollen begrenzt.',
 'An inquiry route connects question, method, observation and conclusion; the scope of a chemical conclusion is bounded by evidence and controls.',
 'Erläutert den externen Eisen/Kupfer- und Carbonat/Säure-Erkenntnisweg und erklärt Ladungs-/Stoffbilanz, Nachweisfunktion sowie die Grenzen der beobachteten Beschichtung beziehungsweise Gasprobe.',
 'Explains the external iron/copper and carbonate/acid inquiry routes, including charge/material balance, test function and limits of the observed coating or gas test.',
 'Revidiert die Zuschreibung bei positiver Glaskontrolle und fordert für weitergehende Identifikation einen tatsächlich geeigneten zusätzlichen Nachweis.',
 'Revises attribution when the glass control is positive and requires a genuinely suitable additional test for stronger identification.',
 'KEEP: Vorgegebene Erkenntniswege sind zulässig; eigene Untersuchungsreflexion wird nicht behauptet. Fe+Cu²⁺→Fe²⁺+Cu ist ausgeglichen. Die positive Glaskontrolle schwächt die Attribution und bedeutet keine CO₂-Produktion des Glases. Zusätzliche Analyse bleibt vorgeschlagen, nicht durchgeführt.',
 'Erkenntnisweg als vorhandene Untersuchung mit Beobachtung und Erklärung; aktuelle externe Nachfolger bleiben als außerhalb des B20-Buchs kenntlich.')
add('99d41b0f-e958-54cf-a077-9bed1704a303',
 'Reflexion einer eigenen Untersuchung verknüpft tatsächlich erlebtes Vorgehen, eigene Ergebnisse und konkrete Abweichungen mit einer begründeten Verbesserung.',
 'Reflection on an own investigation links actually experienced procedures, own results and specific deviations with justified improvements.',
 'Legt das eigene Durchführungsprotokoll zur angeleiteten Zucker- und selbst geplanten Ionenuntersuchung vor und erklärt, wie Methode und Abweichungen die eigene Deutung begrenzen.',
 'Provides the own execution record for the guided sugar and independently planned ion investigations and explains how method and deviations limit the own interpretation.',
 'Begründet aus dem eigenen Endpunkt-/Temperaturproblem beziehungsweise möglicher Sondenverschleppung einen passenden nächsten Kontrollvergleich.',
 'Uses the own endpoint/temperature problem or possible probe carry-over to justify an appropriate next control comparison.',
 'KEEP: Die aktuelle Beschreibung unterscheidet diese Leistung vom Erläutern externer Wege. Beide operative Fälle verlangen echte eigene Untersuchungen und fallbezogene Reflexion. Gelieferte Muster, allgemeine Fehlerlisten und erfundene eigene Werte schließen das Ziel nicht.',
 'Eigenes Arbeits-/Reflexionsmotiv; native Vorbedingungen Durchführung und Auswertung werden klar getrennt gezeigt.')
add('a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1',
 'Objektivität, Reproduzierbarkeit, Nachvollziehbarkeit, Widerspruchsfreiheit und Falsifizierbarkeit wirken zusammen; ein Gegenbefund benötigt passende geprüfte Bedingungen.',
 'Objectivity, reproducibility, traceability, consistency and falsifiability work together; a counterfinding requires appropriate checked conditions.',
 'Prüft die universelle Verdopplungsbehauptung anhand der gültig geprüften Verhältnisse und beurteilt Q≈K bei 25 °C anhand der vollständigen fünf Kriterien.',
 'Tests the universal doubling claim using validly checked ratios and evaluates Q≈K at 25 °C through all five criteria.',
 'Behandelt bei fehlender Kalibrierung den Gegenbefund konditional und trennt sofort gemessenes Q=7 sowie K bei 35 °C von gültigen 25-°C-Gleichgewichtsdaten.',
 'Treats a counterfinding conditionally when calibration is missing and separates immediately measured Q=7 and K at 35 °C from valid 25-°C equilibrium data.',
 'KEEP: Alle fünf Kriterien bleiben Pflicht statt austauschbarer Schlagwörter. Wiederholung desselben Gerätefehlers bestätigt keine gültige Widerlegung. Neue Temperatur und fehlende Gleichgewichtseinstellung ändern den Geltungsbereich, ohne einen behaupteten Temperaturmechanismus zu erfinden.',
 'Alle fünf Validitätsbegriffe und ihre Beziehungen lesbar; vorhandenes sachliches Raster bleibt brauchbar, kein begründeter Ersatz wegen Stil.')
add('5b1bb5d9-07b1-5ba9-b320-cc97be917c60',
 'Informationsrelevanz hängt von chemischer Frage, Zielgruppe und Situation ab; gleiche Bezugsgrößen erlauben begrenzte Vergleiche, keine vollständige Sicherheits- oder Umweltbilanz.',
 'Information relevance depends on the chemical question, audience and situation; equal reference quantities allow bounded comparisons, not a complete safety or environmental balance.',
 'Wählt geeignete Reinigungs- und Verpackungsquellen, strukturiert chemische Information, benennt Urheber und passt die Darstellung an; erfüllt eigene Recherche, wo der tatsächliche Quellenkontext sie verlangt.',
 'Selects suitable cleaning and packaging sources, structures chemical information, identifies authors and adapts the explanation; performs own research wherever the actual source context requires it.',
 'Erweitert die Auswahl für das Hausmeisterteam und benennt bei Mehrwegbehältern Nutzungszahl, Reinigung und Transport als zusätzlich nötige Informationen.',
 'Extends selection for the caretaker team and identifies use count, cleaning and transport as additional information needed for reusable containers.',
 'KEEP: Das kanonische ODER bleibt erhalten, BY C9 NTG verlangt dennoch tatsächlich vorgegebene UND selbst recherchierte Quellen. Gleiche 250 mL und Fünf-Minuten-Bedingungen begrenzen die Zahlenvergleiche. Werbung oder bloße Stückmasse tragen keine Gesamtbewertung. Source- und Partnerpflichten bleiben separat offen.',
 'Quellen-/Adressatenmotiv mit Berichts-, Buch- und Werbecharakter erkennbar; aktueller recherchestärkerer Nachfolger und fachbezogene Bewertung werden vollständig angezeigt.')
add('ac8b6c0f-98b2-5092-806d-d9498efbfa35',
 'Komplexe Recherche verbindet tatsächliches Lesen analoger und digitaler Quellen mit nachvollziehbarer Deutung; Stoffmodelle und Prozessbilanzen gelten unter benannten Randbedingungen.',
 'Complex research connects actual reading of analogue and digital sources with traceable interpretation; substance models and process balances apply under stated conditions.',
 'Recherchiert tatsächlich analog und digital, belegt Fundstellen und Zitate und deutet das Säurelöslichkeitsmodell sowie Frischzufuhr/Energie je akzeptiertem Prozessoutput.',
 'Actually researches analogue and digital sources, evidences locations and quotations and interprets the acid-solubility model and fresh input/energy per accepted process output.',
 'Prüft bei einer zusätzlichen Salzphase die Grenzen der einfachen Formel und berechnet nach geändertem akzeptiertem Output Frischzufuhr und Energie neu, getrennt von internem Umlauf.',
 'Checks the simple formula limits when an additional salt phase appears and recalculates fresh input and energy after accepted output changes, separately from internal circulation.',
 'KEEP: Analog UND digital sowie Eigenrecherche sind in beiden Sprachen verbindlich. S=1,1/2/11 ist ausdrücklich ein Modell, keine Arzneidosierung. A liefert 5 kg/kg und 2,5 Energieeinheiten/kg; B bei 20 kg liefert 2 und 3,15. Interner Umlauf ist keine frische Zufuhr; die Archive ersetzen die reale Recherche nicht.',
 'Komplexe Recherche mit unterschiedlichen Quellenformaten vollständig im Bild und Seitenkontext; keine Verwechslung mit dem einfachen Auswahlziel.')
add('36666b4a-97af-51fc-9983-56cdcc7a8229',
 'Quellenkritik prüft Behauptung, Methode, Datenbasis, Bezugsgröße und Interesse; nachvollziehbare begrenzte Daten und Finanzierungsinteressen müssen getrennt beurteilt werden.',
 'Source criticism checks claim, method, evidence base, reference quantity and interest; traceable bounded data and funding interests need separate evaluation.',
 'Vergleicht Werbung, Laborbericht und datenarmen Beitrag und erklärt, was A=0,4→0,1 sowie Q=1,1→11 unter den benannten Bedingungen tatsächlich stützen.',
 'Compares advertising, laboratory report and data-poor contribution and explains what A=0.4→0.1 and Q=1.1→11 actually support under the stated conditions.',
 'Revidiert ein Urteil bei unabhängig überprüfbaren neuen Daten und prüft offengelegte Herstellerfinanzierung, ohne daraus automatisch Wahrheit oder Falschheit abzuleiten.',
 'Revises a judgment when independently verifiable new data appear and examines disclosed manufacturer funding without automatically inferring truth or falsehood.',
 'KEEP: 75 % Absorbanzreduktion ist keine vollständige Schadstoffentfernung; Faktor 10 entspricht 900 % Zunahme, nicht einem beliebigen Wirksamkeitsversprechen. Urheber, Intention und Prüfung bleiben fallbezogen. Neue Verifikation wird konditional beurteilt, keine frische Beobachtung erfunden.',
 'Bericht/Buch/Werbung und kritische Lesesituation bleiben als Quellenarten erkennbar; dargestellte Informationen stehen richtig zur lesenden Person.')
add('431a0f03-f28a-5e56-a61f-000336d0b410',
 'Ein begründeter chemischer Vergleich gewinnt eigene Pro-/Kontraargumente, definiert Kriterien und Schwellen und gewichtet Daten mit gleichen Bezugsgrößen.',
 'A justified chemical comparison develops own pro/con arguments, defines criteria and thresholds and weighs data using equal reference quantities.',
 'Findet selbst Argumente zu F/G-Filterung und E/M-Verpackung, erklärt Mindestanforderungen, Zielkonflikte und fehlende gemeinsame Umweltindikatoren und begründet das Urteil.',
 'Independently develops arguments about F/G filtration and E/M packaging, explains minimum requirements, trade-offs and missing common environmental indicators and justifies a judgment.',
 'Ändert beim neuen Energieverbrauch beziehungsweise zwei statt zehn Wiederverwendungen nur die betroffenen Argumente und überprüft Gewichtung und Schluss.',
 'Changes only the affected arguments when energy consumption changes or reuse drops from ten to two cycles and reviews weighting and conclusion.',
 'KEEP: Das selbstständige Finden ist Bestandteil des Produkts und wird nicht durch fertige Listen ersetzt. F verfehlt die 90-%-Schwelle. Verschiedene Transport-/Waschindikatoren werden nicht addiert; Wiederverwendungen verändern die Massenzuordnung. Angeleitete Source-Beiträge bleiben Teilbeiträge.',
 'Pro-/Kontra-Waage und Argumentkontext sichtbar; current Folgeziel mit fünf Entscheidungskriterien als externer Buchverweis gekennzeichnet.')
add('31781d00-8f20-5041-bd7f-e261b27af162',
 'Ein Darstellungswechsel erhält chemische Bedeutung, Zustände, Ladungsbilanz, Einheiten und Bezugsgrößen und passt Erläuterungen begründet an die Zielgruppe an.',
 'A representation change preserves chemical meaning, states, charge balance, units and reference quantities and adapts explanations to the audience with reasons.',
 'Erstellt eigene sprachliche/Teilchen-Darstellungen der NaCl-Auflösung und eine eigene digitale Prozessgrafik mit getrennten Frischzufuhr- und Energiegrößen.',
 'Creates own verbal/particle representations of NaCl dissolution and an own digital process chart with separate fresh-input and energy quantities.',
 'Ergänzt für das Oberstufenlabor Zustände/Ladungsbilanz und für Verfahrenstechniker Systemgrenzen, ohne neue Reaktionen oder einen künstlichen gemeinsamen Umweltwert einzuführen.',
 'Adds states/charge balance for the upper-secondary laboratory and system boundaries for process engineers without introducing new reactions or an artificial combined environmental score.',
 'KEEP: NaCl besteht bereits im Gitter aus Ionen; Mobilität erklärt Leitfähigkeit ohne Wasserstoffbildung. 5/2,22 kg/kg und 2,5/3,5 Energieeinheiten/kg bleiben verschiedene Achsen. Eigenes Transformationsprodukt und begründete Darstellungsauswahl sind in DE/EN prüfbar.',
 'Vier Na⁺/vier Cl⁻ im Gitter und nach Auflösung bleiben zahlen- und ladungsgleich; kein sichtbarer Stoffbilanzfehler.')
add('38e30bb9-6145-5da0-80b8-36e3c45e15d0',
 'Eine fachgerechte Präsentation verbindet chemischen Inhalt und eigene Arbeit mit nachvollziehbarer Herkunft, Grenzen und adressatengerechten analogen und digitalen Medien.',
 'A scientifically appropriate presentation connects chemical content and own work with traceable origin, limits and audience-appropriate analogue and digital media.',
 'Präsentiert eigene Prozessauswertung beziehungsweise eigene Modellprüfung tatsächlich mit Handout/Poster und digitalen Folien/Dateien und beantwortet eine reale Rückfrage fachlich.',
 'Actually presents an own process evaluation or own model test using a handout/poster and digital slides/files and scientifically answers a real follow-up question.',
 'Passt Systemgrenzen und chemische Erläuterung an Fachpublikum oder jüngere Lernende an und erhält die Unterscheidung zwischen Bindungsbelegung und Wirkung.',
 'Adapts system boundaries and chemical explanation for expert or younger audiences and preserves the distinction between binding occupancy and effect.',
 'KEEP: Eigenes Arbeitsprodukt, analog UND digital und tatsächliche Präsentation bleiben Pflicht; Musterfolien schließen sie nicht. Die Belegung 0/0,5/0,75 bei 0/2/6 µmol/L und Kd=2 stützt keine Aktivierungs- oder klinische Aussage. Datenherkunft und Rückfrage verhindern reine Kopierleistung.',
 'Präsentierende Person, Publikum, Projektion und zum Publikum gerichtetes Handout passen perspektivisch; beide Mediumtypen und Ablauf sichtbar.')
add('7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6',
 'Chemische Funktionen erklären technische Anwendungen und gesellschaftliche Folgen über Stoffeigenschaften und Prozesse; Wirkung und Umweltbilanz hängen an realen Einsatzbedingungen.',
 'Chemical functions explain technical applications and societal consequences through substance properties and processes; effects and environmental balances depend on actual use conditions.',
 'Erklärt Flockung/Korrosion, Verpackungsbarrieren und Batteriefunktion und verbindet sie mit Nutzen, Ressourcen, Sicherheit und Grenzen für Mensch und Umwelt.',
 'Explains flocculation/corrosion, packaging barriers and battery function and connects them with benefits, resources, safety and limits for humans and the environment.',
 'Unterscheidet Zerfall von vollständiger Mineralisierung und begründet, warum geringe oder höhere Durchlässigkeit je nach Anwendung unterschiedliche Funktionen erfüllt.',
 'Distinguishes fragmentation from complete mineralisation and explains why low or higher permeability serves different functions in different applications.',
 'KEEP: Die gesellschaftliche Bedeutungsleistung bleibt chemisch begründet. Abbaubarkeit benötigt Bedingungen, Zeit und Produkte; Fragmentierung reicht nicht. Batterie- und Barrierefunktion werden mit Sicherheits-/Ressourcengrenzen verknüpft, ohne praktische Dosierungsanweisung oder universelle Umweltwertung.',
 'Chemische Anwendungs-/Funktionsübersicht steht vollständig vor Berufsfeldern; gemeinsames Übersichtsbild ist didaktisch brauchbar, ohne alle Einzelprodukte als Nachweis auszugeben.')
add('6c9adc36-b6d0-57fa-8e02-5e156aebfecc',
 'Chemische Berufsfelder unterscheiden sich durch Aufgaben, Arbeitsbedingungen, Anwendungen und Anforderungen; eine Berufsentscheidung verbindet diese mit begründeten eigenen Interessen.',
 'Chemical occupations differ in tasks, working conditions, applications and requirements; a career decision connects these with justified own interests.',
 'Vergleicht die ausdrücklich fiktiven Labor-, Produktions-, Umwelt- und Forschungsprofile und begründet eine hypothetische Wahl anhand der eigenen Interessen und möglicher Folgen.',
 'Compares the explicitly fictional laboratory, production, environmental and research profiles and justifies a hypothetical choice using own interests and possible consequences.',
 'Überprüft die Wahl bei geänderter Präferenz für Prozesssteuerung und benennt passende tatsächliche Informationswege für eine spätere reale Berufsentscheidung.',
 'Reviews the choice when preferences shift towards process control and identifies suitable actual information routes for a later real career decision.',
 'KEEP: Eigene Berufswahlbegründung bleibt verbindlich und curriculare Leistung. Fiktive Profile werden nicht als gegenwärtige gesetzliche Qualifikationen oder echte Beratung ausgegeben. Der Interessenwechsel liefert einen eigenständigen Transfer; keine Umdeutung zu ungeprüfter orientation.',
 'Berufsfeld-/Anwendungsbild ohne falsche formale Abschlussbehauptung; native Seite enthält den fachlichen Anwendungs-Vorgänger und vollständige ID.')
add('1df17884-96ae-57d7-9da9-dbebd082596f',
 'Eine chemisch relevante Entscheidung verbindet ethische, ökologische, ökonomische, soziale und sicherheitsbezogene Kriterien mit transparenten Optionen, Gewichtungen und einer überprüfbaren Strategie.',
 'A chemistry-related decision connects ethical, environmental, economic, social and safety criteria with transparent options, weights and a reviewable strategy.',
 'Leitet alle fünf Kriterien für Verpackung und schulische Information ab, wägt Optionen begründet ab und überprüft Entscheidung, Kriterien und Strategie anhand der chemischen Grenzen.',
 'Derives all five criteria for packaging and school information, weighs options with reasons and reviews the decision, criteria and strategy against chemical limits.',
 'Prüft bei Übernahme von Mehrkosten die neue Lastenverteilung und bei Herstellerfinanzierung Transparenz, Informationsqualität und Zugang, ohne chemische Daten oder Sicherheit zu erfinden.',
 'Examines changed distribution of burdens when extra cost is covered and examines transparency, information quality and access under manufacturer funding without inventing chemical data or safety.',
 'KEEP: Alle fünf Perspektiven und die Überprüfung von Kriterien/Strategie sind ausdrücklich erhalten. Die Subvention verschiebt Kosten und beseitigt sie nicht. Zwei statt zehn Zyklen ändern die Modellmasse; heterogene Indikatoren werden nicht addiert. Die fiktive Medizin-Information ist keine Dosierungsentscheidung.',
 'Aktuelle Kriterien-/Entscheidungsdarstellung lesbar; Voraussetzung aus dem anderen Buch ist ausdrücklich extern und Nachfolger zeigt Seite3.')
add('e5a5dcd8-053c-55fd-b5c7-bba93779da53',
 'Chemische Erkenntnis entsteht unter sozialen, kulturellen, technologischen, historischen, ökologischen und ökonomischen Bedingungen; diese Bedingungen beeinflussen Zugang und Forschung, ersetzen aber keinen empirischen Beleg.',
 'Chemical knowledge arises under social, cultural, technological, historical, ecological and economic conditions; these conditions influence access and research but do not replace empirical evidence.',
 'Verknüpft alle sechs Einflussbereiche an den gelieferten Ozon- und Ammoniakgeschichtsquellen mit konkreten Erkenntniswegen und trennt historische Angaben von einer eigenen kulturellen Lernzugangsübertragung.',
 'Connects all six influence areas in the supplied ozone and ammonia history sources with concrete inquiry routes and separates historical information from an own cultural learning-access transfer.',
 'Bewertet einen populären Beitrag ohne Methode oder interessengeleitete Auswahl hinsichtlich sozialer Wirkung und möglicher Selektionsverzerrung, während fachliche Gültigkeit prüfbare Daten verlangt.',
 'Evaluates a popular contribution without a method or interest-guided selection for social effects and possible selection bias while scientific validity requires testable data.',
 'KEEP: Die sechs Bereiche sind vollständig und prüfbar. Gelieferte historische Quellen und bereits gelesene Originalnotizen werden genutzt; ich behaupte kein heutiges erneutes Weblesen. Eigene Kulturübertragung ist kein historisches Quellenzitat. Zeitgeist oder Finanzierung ersetzen keine empirische Widerlegung; Source-Pflichten bleiben offen.',
 'Historisches/gesellschaftliches Wissenmotiv vollständig, keine sichtbare Bildbeschädigung; aktuelle Quellenkritik-/Erkenntnisverweise sind als externe Vorgänger markiert.')
add('9f892457-c4e5-56da-830c-bf6cac0c98d7',
 'Historische und aktuelle chemische Wirkungen benötigen eine nachvollziehbare Wirkungskette und getrennte ökologische, ökonomische und soziale Perspektiven; eigene Handlung bleibt an Daten und Zuständigkeit gebunden.',
 'Historical and current chemical impacts require a traceable causal chain and separate environmental, economic and social perspectives; own action remains bounded by data and responsibility.',
 'Erklärt die Ammoniak- und Ozon/Alternativen-Wirkungsketten, bewertet alle drei Nachhaltigkeitsperspektiven und formuliert begrenzte eigene Informations- oder Meldehandlungen.',
 'Explains the ammonia and ozone/alternative causal chains, evaluates all three sustainability perspectives and formulates bounded own information or reporting actions.',
 'Prüft verbesserten Wissenszugang ohne Änderung von Ressourcenwerten und beurteilt neue Leckagen über Menge, Wirkungsfaktor und Unsicherheit statt allein über ein Etikett.',
 'Examines improved knowledge access without changing resource figures and evaluates new leakage using amount, impact factor and uncertainty rather than a label alone.',
 'KEEP: N₂+3H₂⇌2NH₃ bleibt bilanziert; Ertragsgleichheit begrenzt den Modellvergleich. Öffentlicher Zugang verändert soziale Chancen, keine gelieferten Ressourcenwerte. Zusätzliche Leckage kann Vorteile erodieren, ohne eine automatische Rangfolge oder regulatorische Identität zu beweisen. Keine autonome Düngerdosis oder Arbeit an offenen Geräten.',
 'Kreislauf-/Nachhaltigkeitsbild und Beschreibung bleiben vollständig; aktuelle Entscheidungsvoraussetzung wird auf Seite1 zurückverwiesen.')
add('1f354a60-be44-512b-8f8b-f67c8c456035',
 'Eine konstruktive Fachdiskussion verbindet kohärente chemische Erklärung, begründete Argumente und echte Antwort auf Gegenpositionen mit reflektierter eigener Standpunktprüfung.',
 'A constructive scientific discussion combines coherent chemical explanation, justified arguments and genuine response to objections with reflective review of an own position.',
 'Führt einen tatsächlichen Austausch über Katalysator/Gleichgewicht beziehungsweise Leitfähigkeit, reagiert fachlich auf die Partneraussage und begründet den eigenen Standpunkt.',
 'Conducts an actual exchange about catalyst/equilibrium or conductivity, responds scientifically to the partner statement and justifies the own position.',
 'Erklärt auf den neuen Einwand beide Reaktionsrichtungen und revidiert die Temperaturbegrenzung bei neuen geprüften temperaturgleichen Daten mit weiterhin begrenzter Konzentrationsaussage.',
 'Explains both reaction directions in response to the new objection and revises the temperature limitation when new checked equal-temperature data appear while retaining a bounded concentration statement.',
 'KEEP: Tatsächlicher responsiver Dialog ist verbindlich, kein vorgefertigtes Protokoll als eigenes Gespräch. Katalyse ändert die Geschwindigkeit und nicht K bei gleicher Temperatur; frühe/gleichgewichtsnahe Werte bleiben getrennt. Neue gültige Daten können den Standpunkt ändern, ohne exakte Salzmasse oder Gesamtunsicherheit vorzutäuschen.',
 'Wissenschaftliche Gesprächssituation mit chemischem Gegenstand; native Seite zeigt Sprach-/Fachvoraussetzung und Assessment-Nachfolger extern, ohne diese dadurch zu prüfen.')
add('6c7ce93c-7675-51da-bc0c-7d0257f7ff7d',
 'Hypothesengeleitete Modellnutzung vergleicht eine gewählte Regel und Darstellung mit Beobachtungen und einem anderen Modell und begründet Grenzen für Materie, Reaktion, Bindung und Wechselwirkung.',
 'Hypothesis-guided model use compares a selected rule and representation with observations and another model and justifies limits for matter, reaction, bonding and interaction.',
 'Nutzt tatsächlich eigene analoge Karten oder im gewählten digitalen Originalfall eine eigene Ladungsregel mit allen sechs Prüfungen; erklärt Ionenmobilität, Atomerhaltung und die Grenzen eines einfachen Wechselwirkungsmodells.',
 'Actually uses own analogue cards or, in the selected original digital case, an own charge rule with all six checks; explains ion mobility, atom conservation and limits of a simple interaction model.',
 'Begründet bei leicht kühlender NaCl-Auflösung den Bedarf an Gitter-/Hydratationsenergie und orientiert Wasserladungsseiten korrekt, ohne aus neutralen Modellteilen Wechselwirkungsfreiheit abzuleiten.',
 'Explains the need for lattice/hydration energy when NaCl dissolution cools slightly and correctly orients water charge regions without inferring absence of interactions from neutral model parts.',
 'KEEP: Das analoge ODER digitale Modell ist echt erhalten; eine eigene Tabellenkalkulation wird nicht universell verlangt. Der digitale Fall behält Implementierung und sechs Prüfungen. Oδ− zeigt zu Na⁺, Hδ+ zu Cl⁻; neutrale Paarungen sind unentschieden. Hypothese und begründete Kritik sind Pflicht, tatsächliche Weiterentwicklung wird nicht vorgetäuscht. Spezielle Software-/Partnerpflichten bleiben offen.',
 'Wasser-/Bindungs-/Wechselwirkungsdarstellung mit 104,5° und Ladungsseiten sichtbar; native Seite verweist zum komplexen Modellziel, ohne Dalton als universelle Voraussetzung zu setzen.')
add('86d34f1f-692d-5522-a9a4-a71c65b24de7',
 'Komplexe theoriegestützte Modelle verbinden Atombau/Periodizität, Gleichgewicht, Bindung und räumliche Geometrie mit Rezeptor- und Enzymmodellen unter jeweils begründeten Grenzen.',
 'Complex theory-based models connect atomic structure/periodicity, equilibrium, bonding and spatial geometry with receptor and enzyme models under justified limits for each.',
 'Erstellt und nutzt eigene analoge UND digitale Produkte: deutet Na/Mg, löst das Gleichgewicht, erklärt CO₂/H₂O-Polarität, prüft registrierte Ligandkontakte und unterscheidet Belegung, Enzymumsatz und Wirkung.',
 'Creates and uses own analogue AND digital products: interprets Na/Mg, solves the equilibrium, explains CO₂/H₂O polarity, checks registered ligand contacts and distinguishes occupancy, enzyme turnover and effect.',
 'Löst für K=2 die physikalisch zulässige Wurzel 4−√13 und prüft die neue OX/HX-Pose anhand konkreter Abstände statt aus einer Zusatzgruppe stärkere Bindung oder klinische Wirkung abzuleiten.',
 'Solves the physically permitted root 4−√13 for K=2 and checks the new OX/HX pose using actual distances instead of inferring stronger binding or clinical effects from an extra group.',
 'KEEP: Alle gebundenen Teilbereiche bleiben erforderlich; keine Verkürzung auf Molekülgeometrie. Der andere algebraische Zweig führt zu negativer Stoffmenge. Ammoniumkontakt 6,19 Å und neuer OX-Abstand 3,735 Å werden nicht als reparierter Kontakt verkauft. Belegung liefert keine Aktivierung; Enzym bleibt beim Esterumsatz erhalten. Neue K-Werte sagen keine Geschwindigkeit voraus.',
 'Komplexes Struktur-/Modellmotiv und aktuelle vollständige Beschreibung sichtbar; analoges und digitales Modell werden mit gültigem Vorgängerverweis im Ganzen eingebettet.')

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
parameters = {
 'provider': 'OpenAI',
 'modelVisibleIdentity': 'GPT-6-based Codex',
 'exactDeploymentIdentifier': None,
 'exactModelSnapshot': None,
 'temperature': None,
 'topP': None,
 'seed': None,
 'reasoningEffort': None,
 'unknownValuesMeaning': 'Not exposed to this reviewer; no particular sampling settings or exact model snapshot asserted.',
 'reviewMethod': 'Independent B reviewer read bound current whole bilingual descriptions and all operative P52 materials/profiles, inspected every actual current normal Native HTML and PDF page (26+26) via view_image, then authored these positive understanding chains and actual first decisions before reading current A outcomes or author judgments.',
 'noLearnerOrHumanAcceptance': True,
}
write_json(ROOT/'generation-parameters.actual.json', parameters)
params_digest = digest((ROOT/'generation-parameters.actual.json').read_bytes())
hc = json.loads((AUTHOR/'checks/actual-whole26-native-html-captures.technical.json').read_text())['captures']
pc = json.loads((AUTHOR/'checks/actual-whole26-native-pdf-captures.technical.json').read_text())['captures']
html = {x['goalId']:x for x in hc}
pdf = {x['goalId']:x for x in pc}
assembly = json.loads((AUTHOR/'materials/whole26-current-operative-materials-and-profiles.exact-assembly.json').read_text())
materials = {x['goalId']:x for x in assembly['entries']}
all_observations = []
normal_outputs = []
for n in ['normal-b20','normal-b6']:
    target = ROOT/n
    c = json.loads((target/'description-review-campaign.json').read_text())
    inp = json.loads((target/'description-review-input.json').read_text())
    bundle = json.loads((target/'review-bundle-manifest.json').read_text())
    batch = c['batches'][0]
    run_id = 'chemie-b008-whole-P26-current-native-independent-b-20261010-v1-'+n+'-run'
    records = []
    for g in inp['goals']:
        j = J[g['goalId']]
        r = { '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion':1,
          'recordId':run_id+'.'+g['goalId'], 'runId':run_id,
          'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],
          **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
          'decision':'keep','understandingEvidence':j['understandingEvidence'],'rationale':j['rationale'],
          'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate' }
        records.append(r)
        all_observations.append({'goalId':g['goalId'],'normalBatch':n,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
          'actualHtmlWholePageCapture':html[g['goalId']]['capture'], 'actualPdfWholePageCapture':pdf[g['goalId']]['capture'],
          'wholeOriginalRaster':html[g['goalId']]['wholeBoundOriginalRaster'],
          'actualReadMethods':['Current DE and EN whole title/description','Current requires/reverse-requires/external references','Both full bilingual operative materials/tasks/required criteria/transfer plus paired V2 profile','Original whole image within actual Native HTML page via view_image','Actual corresponding whole Native PDF page via view_image'],
          'visualObservation':j['visualObservation'],
          'nativePageDecision':'keep','nativePageRationale':'Titel, vollständige ID, Breadcrumbs, tatsächliches Bild, vollständige Beschreibung und aktuelle interne/externe Verweise sind lesbar und unbeschnitten; HTML und PDF zeigen denselben ganzen Zielkontext.',
          'operativeCaseKeys':[x.get('caseKey') for x in materials[g['goalId']]['wholeOperativeCases']],
          'operativePDecision':'keep','operativePClaim':'Profile and cases support evaluating this whole canonical goal; supplied material/author solutions are not actual learner performance and do not discharge whole source or partner duties.',
          'blindToCurrentPeerAOutcomesAndAuthorJudgmentsAtFirstDecision':True})
    data = ''.join(json.dumps(r, ensure_ascii=False, separators=(',',':'))+'\n' for r in records).encode()
    record_path = target/'results'/f"{batch['batchId']}.records.jsonl"
    record_path.parent.mkdir(parents=True, exist_ok=True)
    record_path.write_bytes(data)
    allowed_roles = {'book_model','book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest','review_input_json','review_input_jsonl','review_prompt','review_criteria','run_manifest_schema'}
    artifacts = [{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in allowed_roles]
    artifacts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
    run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
      'runId':run_id,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
      'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI','model':'GPT-6-based Codex; exact deployment identifier and snapshot not exposed',
      'role':'sequencing_representation_reviewer','promptFamilyId':'goal-description-review-first-pass-b','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],
      'generationParametersFingerprint':params_digest,'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,
      'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':'2026-10-10T03:10:22.042654+00:00','completedAt':completed,
      'status':'completed','outputDigest':digest(data),'toolchainVersion':'skillpilot-goal-description-review-normal-v2'}
    run_path = target/'results'/f"{batch['batchId']}.run.json"
    write_json(run_path,run)
    normal_outputs += [record_path,run_path]
assert len(J)==26 and len(all_observations)==26
write_json(ROOT/'actual-first-whole26-native-P52-observations.json', {'reviewer':'independent-b','completedAt':completed,'goalCount':26,'wholeHtmlPagesActuallySeen':26,'wholePdfPagesActuallySeen':26,'operativeCaseCountActuallyRead':52,'decisions':{'keep':26,'revise':0,'split_review':0,'block':0},'reviewAuthority':'ai_candidate','recordStatus':'candidate','sourceHold':{'currentCompiler':'355/398','newMissingChildren':24,'priorMissing':19,'unresolvedDuties':496,'wholeSourceApproval':False},'protectedContext12Hold':'Separate normal Native12 and two current independent D rounds required; not restored by P26.','actualActiveStateUnchanged':{'chemieActiveAtomicCounts':{'allAtomic':487,'curricularAtomic':381},'protectedAtomicGoals':180,'mathematik':'807/807','physik':'478/478','candidate511_398Active':False,'new':0,'restored':0,'net':0},'observations':all_observations})
seal_files = [ROOT/'generation-parameters.actual.json', ROOT/'actual-first-whole26-native-P52-observations.json', Path(__file__), *normal_outputs]
write_json(ROOT/'FIRST.actual-sealed-before-current-peer-or-author-outcomes.json', {'schemaVersion':1,'reviewer':'independent-b','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'blindness':'Own actual first all26 KEEP decisions and normal B20/B6 outputs sealed before reading any current peerA outcome or author judgment. Normal inputs may carry historic evidence-status metadata; no current outcome files were read.', 'actualNativeViewed':{'html':26,'pdf':26},'actualOperativeCasesRead':52,'authority':'ai_candidate','wholeSourceAndProtectedContext12RemainHold':True,'files':[{'path':str(p.relative_to(REPO)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':len(p.read_bytes())} for p in seal_files]})
print(json.dumps({'sealedFirst':str(ROOT/'FIRST.actual-sealed-before-current-peer-or-author-outcomes.json'),'records':26,'htmlSeen':26,'pdfSeen':26,'casesRead':52},ensure_ascii=False))
