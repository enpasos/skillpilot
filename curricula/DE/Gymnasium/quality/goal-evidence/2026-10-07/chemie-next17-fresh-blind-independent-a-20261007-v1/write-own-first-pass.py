#!/usr/bin/env python3
"""Write this reviewer's actual first-pass findings; no schema or helper change."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
P3 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007'

def read(p): return json.loads(p.read_text())
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def jd(v): return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def write(p,v):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')

# The six substantive fields below are independently formulated for this review.
OWN = [
('Gasnachweise verknüpfen eine spezifische Reaktion mit der beobachteten Wirkung; der Nachweis eines Bestandteils bestimmt weder Reinheit noch Mengenanteil.',
 'Gas tests connect a specific reaction with its observable effect; detecting one component determines neither purity nor amount fraction.',
 'Die lernende Person identifiziert vorgegebene Gasproben aus Glimmspan-, Kalkwasser- und kleinen beaufsichtigten H2-Testbefunden, erklärt Verbrennungsunterstützung, Carbonatfällung und Wasserbildung und benennt den Aussagebereich der Kontrollen.',
 'The learner identifies supplied gas samples from glowing-splint, limewater and small supervised hydrogen-test observations, explains combustion support, carbonate precipitation and water formation, and states what the controls establish.',
 'An einem unabhängig vorgelegten Gemisch mit CO2-Abtrennung erklärt die lernende Person zwei positive Nachweise und widerlegt einen Reinheitsnachweis oder einen sicheren O2-Ausschluss aus einem negativen Glimmspantest.',
 'For an independently supplied mixture with CO2 removal, the learner explains two positive tests and rejects claims of purity or certain oxygen absence based on a negative splint test.',
 'Die Beschreibung benennt die gemeinsame Nachweiskompetenz und eine fachliche Deutung; drei Beispielgase erweitern diese Kompetenz nicht zu drei getrennten Lernzielen. Die aktuelle P580b-v3-Antwort bleibt bei den tatsächlich angegebenen Kontrollen.'),
('Ein Reinstoffgehalt benötigt eine selektive Messmethode und eine festgelegte Bezugsmasse; Wiederholbarkeit allein schließt systematische Fehler nicht aus.',
 'Pure-substance content requires a selective measurement method and a defined reference mass; repeatability alone does not exclude systematic error.',
 'Die lernende Person begründet eine Salz-Sand-Trennung durch Löslichkeit, berechnet den Anteil aus Trockenmasse und Einwaage und erklärt die Bedeutung von Leerprobe, Massekonstanz und möglichen Stoffverlusten.',
 'The learner justifies salt-sand separation through solubility, calculates content from dry mass and initial mass, and explains the roles of blanks, constant mass and possible substance loss.',
 'Für eine neue Trocknungsanalyse unterscheidet die lernende Person Wassergehalt und gesamten Masseverlust, wenn zusätzlich ein anderer flüchtiger Stoff zugelassen ist, und wählt den richtigen Nenner.',
 'For a new drying analysis, the learner distinguishes water content from total mass loss when another volatile substance is allowed and selects the correct denominator.',
 'Experiment, Rechnung und Zuverlässigkeit sind zusammenhängende Schritte der einen Gehaltsbestimmung; die kurze DE/EN-Beschreibung ist zur wörtlichen C8.2.5-Komponente passend.'),
('Eine pH-Änderung wirkt abhängig vom betrachteten chemischen und biologischen System; Nutzen und Schaden folgen aus Daten und Kriterien, nicht aus dem Wort sauer oder basisch.',
 'The effects of a pH change depend on the chemical and biological system; benefit and harm follow from data and criteria, not the labels acidic and basic.',
 'Die lernende Person vergleicht anhand gegebener Daten die technische Carbonatentfernung und eine Enzymaktivitätsänderung und begrenzt die Folgerungen auf Werkstoff, Enzym und Randbedingungen.',
 'Using supplied data, the learner compares technical carbonate removal and an enzyme-activity change and bounds the conclusions to the material, enzyme and stated conditions.',
 'Bei einem neuen Modellgewässer oder Werkstoff wendet die lernende Person die vorgegebenen pH-Kriterien an und erklärt, warum gleicher pH keine gleiche Neutralisationsmenge oder Stoffidentität beweist.',
 'For a new model aquatic system or material, the learner applies the supplied pH criteria and explains why equal pH proves neither equal neutralization demand nor substance identity.',
 'Die Beschreibung fordert fachliches Erörtern und Abschätzen ohne medizinische Empfehlung oder pauschalen Sicherheitswert. Beide wörtlichen BY-SekI-Komponenten tragen diese Kompetenz; die fehlende Visualisierung bleibt ein V-HOLD.'),
('Saure und basische wässrige Lösungen unterscheiden sich durch das Verhältnis von H3O+ und OH−; beide Ionenarten können vorhanden sein, während die gesamte Lösung elektrisch neutral bleibt.',
 'Acidic and basic aqueous solutions differ by the relative amounts of H3O+ and OH−; both ion types may be present while the whole solution remains electrically neutral.',
 'Die lernende Person deutet vorgelegte Teilchenverhältnisse als sauer, basisch oder neutral und erklärt, warum der bloße OH−-Nachweis und die Gesamtladung keine Basizität bestimmen.',
 'The learner interprets supplied particle ratios as acidic, basic or neutral and explains why detecting OH− alone and total charge do not determine basicity.',
 'An einem neuen verdünnten Konzentrationsfall mit beiden Ionenarten widerlegt die lernende Person eine Fehlklassifikation aufgrund ihrer bloßen Anwesenheit und beachtet die vorgegebene Temperatur.',
 'For a new dilute concentration case containing both ion types, the learner refutes classification based only on their presence and respects the supplied temperature.',
 'Das ausdrückliche Überwiegen beseitigt die naturwissenschaftliche Mehrdeutigkeit der bloßen Präsenz. DE und EN behaupten denselben relativen Vergleich, ohne eine neue quantitative Gleichgewichtskompetenz einzuführen.'),
('Stoffkreisläufe verbinden Stofftransport und physikalische Zustandsänderung mit chemischen Umwandlungen; Atome werden bilanziert, während nutzbare Energie nicht einfach mit dem Stoff zurückkehrt.',
 'Matter cycles connect transport and physical changes with chemical conversion; atoms are accounted for while usable energy does not simply return with the material.',
 'Die lernende Person verfolgt ein Element durch einen vorgegebenen Naturkreislauf, trennt physikalische und chemische Schritte und begründet die Stoffänderung an ausgewählten Reaktionsbilanzen.',
 'The learner traces an element through a supplied natural cycle, separates physical and chemical stages, and explains species changes through selected reaction balances.',
 'In einem unabhängig vorgelegten technischen Kalkkreislauf ordnet die lernende Person Transport, Hydratation und Carbonatisierung ein und begrenzt Behauptungen über Energiebedarf und vollständige CO2-Rückbindung.',
 'In an independently supplied technical lime cycle, the learner classifies transport, hydration and carbonation and bounds claims about energy demand and complete CO2 recapture.',
 'Die Kompetenz ist SekII; der neutrale native Kapitelpfad enthält keine falsche SekI-Zuordnung mehr. Die Natur-/Technikvarianten gehören zur gemeinsamen Beschreibung von Stoffkreisläufen, entsprechend C12-GA.1.3.'),
('Fachsprache und Formelsprache beschreiben Stoffe und Teilchen auf unterschiedlichen Ebenen; Index, Koeffizient und Ladung drücken unterschiedliche Sachverhalte aus.',
 'Technical and formula language describe substances and particles at different levels; subscripts, coefficients and charge express different facts.',
 'Die lernende Person übersetzt einen alltagssprachlichen Lösungstext in eine präzise Beschreibung von Kristall, hydratisierten Ionen und Verhältnisformel und erklärt die beobachtbare Leitfähigkeit getrennt vom Teilchenmodell.',
 'The learner translates an everyday dissolution text into precise descriptions of crystal, hydrated ions and ratio formula and separates observed conductivity from its particle-model explanation.',
 'Bei einem neuen Reaktionstext korrigiert die lernende Person Molekülzahlen, Formelindizes und eine Ionenbezeichnung, ohne beim Bilanzieren die Stoffformeln zu verändern.',
 'For a new reaction text, the learner corrects molecule counts, subscripts and an ion designation without changing species formulas during balancing.',
 'Die aufgezählten Sprachhandlungen konkretisieren die eine ebenengerechte chemische Kommunikation. Die neutral bezeichnete gemischte Prozessgruppe passt auch zu diesem unverändert als SekI getaggten Ziel; nur die geprüften Quellenkomponenten werden beansprucht.'),
('Chemische Ordnungsprinzipien verbinden Aufbau und Eigenschaften über begründete Strukturmerkmale; dieselbe Beobachtung oder Summenformel kann zu verschiedenen Stoffen gehören.',
 'Chemical classification links structure and properties through justified structural features; the same observation or molecular formula may belong to different substances.',
 'Die lernende Person ordnet Metalle, Ionenkristalle und molekulare Stoffe anhand vorgelegter Struktur- und Leitfähigkeitsdaten ein und sagt mit dem Ladungsträgermodell das Verhalten einer Salzschmelze voraus.',
 'The learner classifies metals, ionic crystals and molecular substances using supplied structure and conductivity data and predicts a salt melt’s behavior using a charge-carrier model.',
 'An neuen isomeren Molekülen erklärt die lernende Person eine qualitative Eigenschaftsdifferenz aus Bindungsanordnung und Wasserstoffbrückenfähigkeit und begrenzt die Vorhersage auf vergleichbare Bedingungen.',
 'For new isomeric molecules, the learner explains a qualitative property difference through connectivity and hydrogen-bonding ability and limits the prediction to comparable conditions.',
 'Stoffordnung, Ebenentrennung und Vorhersage bilden die zusammenhängende Struktur-Eigenschafts-Kompetenz der wörtlichen C12-GA.1.1-Quelle. Die Zielstufe SekII bleibt im ganzen Ziel erhalten und der Kapitelpfad ist neutral.'),
('Daltons Atomhypothese erklärt Stoffbilanzen durch erhaltene und neu angeordnete Atome; empirisches Gesetz, prüfbare Hypothese und vereinfachendes Modell haben unterschiedliche Funktionen.',
 'Dalton’s atomic hypothesis explains substance balances through conserved and rearranged atoms; empirical law, testable hypothesis and simplifying model have different functions.',
 'Die lernende Person trennt die gemessene Produktmasse, das Massenerhaltungsgesetz und die Atomannahme, deutet eine Reaktionsbilanz und erklärt, warum ein passender Versuch das Modell unterstützt, aber nicht endgültig beweist.',
 'The learner separates measured product mass, the mass-conservation law and the atomic assumption, interprets a reaction balance, and explains why a compatible experiment supports rather than definitively proves the model.',
 'Aus neuen Isotopen- und Elektronenbefunden benennt die lernende Person Grenzen historischer Dalton-Annahmen und erklärt den weiterhin begrenzten Nutzen des Modells für gewöhnliche chemische Reaktionen.',
 'From new isotope and electron observations, the learner identifies limits of historical Dalton assumptions and explains the model’s continuing bounded usefulness for ordinary chemical reactions.',
 'Die tatsächlich betrachtete HE-G9-Originalseite physisch17/gedruckt16 nennt Atomhypothese sowie die Abgrenzung Gesetz, Hypothese und Modellvorstellung. Modellgrenzen sind Deutungskontext; eine spätere Kern-Hülle-Kompetenz wird nicht als Teil dieses Zieles übernommen.'),
('Redoxteilgleichungen erhalten Atome und Ladung; Elektronenabgabe und -aufnahme werden durch passende Faktoren ausgeglichen, bevor die Gesamtgleichung entsteht.',
 'Redox half-equations conserve atoms and charge; electron loss and gain are matched by suitable factors before forming the overall equation.',
 'Die lernende Person bestimmt Oxidationszahländerungen, leitet Teilgleichungen ab, addiert sie mit ausgeglichener Elektronenbilanz und prüft einen fehlerhaften Entwurf auf Gesamtladung.',
 'The learner determines oxidation-number changes, derives half-equations, combines them with balanced electron transfer, and checks a faulty draft for total charge.',
 'Bei einem neuen wässrigen Reaktionsfall mit ausdrücklich saurem Milieu bilanziert die lernende Person H und O mit den zugelassenen Teilchen und erklärt, warum die Produktannahme nicht auf jedes Milieu übertragbar ist.',
 'For a new aqueous reaction with an explicitly acidic medium, the learner balances H and O with the allowed species and explains why the product assumption does not apply to every medium.',
 'Die EN-Fassung nennt nun ebenso wie DE die wässrige Einschränkung. Die Beschreibung bleibt bei einfachen Redoxgleichungen, entsprechend der konkreten BY-C10.5.2-Komponente und den vorhandenen Voraussetzungen.'),
('Redoxreaktionen verändern Oxidationszahlen durch Elektronenübertragung; Brønsted-Säure-Base-Reaktionen übertragen Protonen. Gasbildung und positive Gesamtladung sind allein keine Redoxkriterien.',
 'Redox changes oxidation numbers through electron transfer; Brønsted acid-base reactions transfer protons. Gas evolution and positive total charge alone are not redox criteria.',
 'Die lernende Person vergleicht Metall und Carbonat in saurer Lösung, verfolgt Elektronen beziehungsweise Protonen und begründet trotz Gasbildung die unterschiedlichen Reaktionstypen.',
 'The learner compares a metal and carbonate in acidic solution, follows electrons or protons, and justifies their different reaction types despite gas evolution.',
 'Für neue Beispiele ohne Gasbildung bestimmt die lernende Person die jeweils übertragene Einheit und widerlegt die Gleichsetzung von Protonenaufnahme, Ladungszunahme und Oxidation.',
 'For new examples without gas evolution, the learner identifies the transferred entity and refutes equating proton gain, charge increase and oxidation.',
 'Die Beschreibung macht das Unterscheidungskriterium bereits ausdrücklich. Die konkrete BY-C10-NTG.3.4-Komponente trägt den Vergleich; die Einordnung bleibt vor der umfassenderen SekII-Mechanismenkompetenz.'),
('Mechanistische Einordnung bezieht sich auf Bindungsänderung und übertragene Einheit; Protonen-, Elektronen- und Elektronenpaar-Donatorrollen unterscheiden sich, und Umkehrbarkeit erfordert passende Bedingungen.',
 'Mechanistic classification concerns bond changes and the transferred entity; proton, electron and electron-pair donor roles differ, and reversibility requires suitable conditions.',
 'Die lernende Person ordnet vorgelegte Protolyse-, Redox- und Substitutionsmodelle ein und begründet einen angegebenen SN2-Schritt aus Bindungsänderungen statt nur aus der Summengleichung.',
 'The learner classifies supplied proton-transfer, redox and substitution models and justifies a specified SN2 step through bond changes rather than the overall equation alone.',
 'Bei einer neuen elektrophilen Addition und reversiblen Protolyse erläutert die lernende Person den ganzen Vorgang und begrenzt Behauptungen über leichte Rückumsetzung auf die gegebenen Bedingungen.',
 'For a new electrophilic addition and reversible proton transfer, the learner explains the whole process and limits claims of ready reversal to supplied conditions.',
 'Das Ziel fasst gelernte Mechanismen als eine Einordnungskompetenz zusammen; seine vier direkten Voraussetzungen tragen die SekII-Anforderung. C12-GA.1.2 stimmt wörtlich im Kern überein, der native Prozesskapitelpfad enthält keine SekI-Behauptung.'),
('Qualitative Ionenanalyse verknüpft selektive Nachweise und kontrollierte Beobachtungen mit begrenzten Zusammensetzungsaussagen; gelöste Ionen beweisen weder ursprüngliche Salzpaarung noch Mengenanteile.',
 'Qualitative ion analysis connects selective tests and controlled observations with bounded composition claims; dissolved ions prove neither original salt pairing nor amount fractions.',
 'Die lernende Person identifiziert einen erlaubten Salzkandidaten aus getrennten Chlorid-/Sulfatbefunden, bilanziert die Fällung und begründet Leerprobe, positive Kontrolle und die Aussagegrenze eines gemeinsamen Kations.',
 'The learner identifies an allowed salt candidate from separate chloride and sulfate results, balances precipitation, and explains blanks, positive controls and the limited information from a shared cation.',
 'Bei einem neuen Produktgemisch prüft die lernende Person Etikettaussagen anhand gültiger Ionennachweise und ergänzender pH-Daten, ohne Salzarten, ursprüngliche Paarungen oder Konzentrationen zu erfinden.',
 'For a new product mixture, the learner evaluates label claims using valid ion tests and additional pH data without inventing original salts, pairings or concentrations.',
 'Nachweis, qualitative Zusammensetzung und Produktprüfung sind Anwendungen derselben analytischen Kompetenz. Die Quelle C8.4.7 trägt das grundlegende Salzthema; die breiteren Anwendungen sind zusätzlich wörtlich in C12-GA.3.1 belegt. Dies ist keine pauschale Quellen- oder Stufenfreigabe; V bleibt offen.'),
('Brønsted-Eignung folgt aus einem unter den betrachteten Bedingungen abgebbaren Proton oder protonenbindenden freien Elektronenpaar; H-Anzahl und positive Ladung reichen als Kriterien nicht aus.',
 'Brønsted suitability follows from a proton that can be donated under the considered conditions or a proton-binding lone pair; hydrogen count and positive charge are insufficient criteria.',
 'Die lernende Person markiert geeignete Strukturelemente in HCl-, NH3- und H2O-Formeln und begründet Protonendonator und -akzeptor mit passenden Produkten und Ladungen.',
 'The learner marks suitable structural features in HCl, NH3 and H2O formulas and justifies proton donor and acceptor roles using appropriate products and charges.',
 'Bei neuen Wasser-, Methan- und Na+-Darstellungen erklärt die lernende Person Ampholyt-Eignung und widerlegt strukturell unbegründete Brønsted-Zuordnungen im vorgegebenen wässrigen Kontext.',
 'For new water, methane and Na+ representations, the learner explains amphoteric suitability and refutes structurally unsupported Brønsted classifications in the specified aqueous context.',
 'Die vorgeschlagene direkte BY7b5310e2-Route trägt genau den ersten Struktur-Eignungssatz als partial. Die zweite Reversibilitätskomponente gehört nicht zu597ac03c. Text, Voraussetzungen und stabile Identität bleiben erhalten; keine breite ursprüngliche Quellenzeile wird geschlossen.'),
('Bei reversiblen Protonenübertragungen verändert Zugabe oder Entzug beteiligter Teilchen die beobachtbare Verteilung; eine qualitative Rückweg-Erklärung benötigt weder einen erfundenen End-pH noch eine allgemeine OH−-Produktregel.',
 'For reversible proton transfers, adding or removing participating species changes their observable distribution; a qualitative reverse-route explanation needs neither an invented final pH nor a universal OH− product rule.',
 'Die lernende Person erklärt einen dokumentierten pH-Anstieg nach CO2-Entzug über die gekoppelten Rückreaktionen und die Protonenaufnahme durch Hydrogencarbonat.',
 'The learner explains a documented pH rise after CO2 removal through the coupled reverse reactions and proton acceptance by hydrogencarbonate.',
 'Für einen neuen NH3/NH4+-Fall formuliert die lernende Person die getrennt durch Säure und Base beeinflussten Protonenübertragungen und deutet die veränderten Anteile ohne Gleichsetzung von Umkehrbarkeit und gleichen Mengen.',
 'For a new NH3/NH4+ case, the learner writes the separate acid- and base-influenced proton transfers and interprets changed proportions without equating reversibility with equal amounts.',
 'Die kurze Beschreibung nennt jetzt ausdrücklich den begrenzten Protonen-Rückweg. Die direkte vorgeschlagene BY7c68f201/C10-NTG.2.8-Route ist in der wirklichen Originaltextzeile252 nachweisbar; diese konkrete Kompetenz passt ohne quantitative Gleichgewichtsausweitung. V bleibt HOLD.'),
('Neutralisation wandelt Säure- und Basenteilchen durch Protonenübertragung um; richtige Mengenbilanz beseitigt einen Überschuss, aber nicht alle gelösten oder schädlichen Stoffe.',
 'Neutralization converts acid and base particles through proton transfer; correct amount balance removes an excess but not all dissolved or harmful substances.',
 'Die lernende Person bilanziert H3O+ mit OH− und ein vorgegebenes Hydroxid-Antazidum und erklärt verbleibende Metall- und Begleitionen auf Teilchenebene.',
 'The learner balances H3O+ with OH− and a supplied hydroxide antacid and explains remaining metal and spectator ions at particle level.',
 'Bei einem neuen Carbonat-Antazidum und neutralisierten Abfall erklärt die lernende Person Protonenbindung, CO2-Bildung und die Aussagegrenze des pH für eine umweltgerechte Behandlung.',
 'For a new carbonate antacid and neutralized waste, the learner explains proton consumption, CO2 formation and the limits of pH as evidence of environmentally appropriate treatment.',
 'Die Beschreibung verbindet Teilchenverständnis und typische Anwendungen, wie es die konkrete BY-C10.4.9-Komponente vorgibt. Sie ist keine Dosierungs- oder Entsorgungsfreigabe; diese Grenzen sind in den P-Fällen ausdrücklich.'),
('Funktionelle Gruppen werden einschließlich ihrer Bindungsumgebung erkannt; eine Carboxygruppe enthält keine unabhängige Alkoholgruppe und ein Molekül kann mehrere charakteristische Gruppen tragen.',
 'Functional groups are recognized together with their connectivity; a carboxyl group does not contain a separate alcohol group, and one molecule may carry multiple characteristic groups.',
 'Die lernende Person ordnet typische Alkohol-, Aldehyd-, Keton- und Carbonsäurestrukturen zu und begründet die Zuordnung aus Hydroxy-, Carbonyl- und Carboxymerkmalen statt aus dem Verwendungszweck.',
 'The learner assigns typical alcohol, aldehyde, ketone and carboxylic-acid structures and justifies the classes through hydroxy, carbonyl and carboxyl features rather than use.',
 'An einer neuen Hydroxycarbonsäure und einem Ether prüft die lernende Person die Grenzen einer vollständigen und überschneidungsfreien Vierklassen-Einteilung.',
 'For a new hydroxycarboxylic acid and an ether, the learner tests the limits of a complete and mutually exclusive four-class classification.',
 'Die vier Stoffklassen sind gleichartige Anwendungen einer Gruppenzuordnung; die Beschreibung ist präzise und nicht auf alle organischen Verbindungen ausgedehnt. Die konkrete BY-C9-NTG.5.2-Komponente belegt die SekI-Kompetenz auch bei einem Einführungsphasen-Kapitelpfad.'),
('Grundlegende IUPAC-Namen bilden die Konstitution durch passende Stammkette, Hauptgruppe und Positionsangaben ab; Nummerierung verändert nicht die vorhandene Struktur.',
 'Basic IUPAC names encode connectivity through the appropriate parent chain, principal functional group and locants; numbering does not change the given structure.',
 'Die lernende Person benennt einfache Alkohol-, Aldehyd-, Keton- und Carbonsäureformeln und begründet die Einbeziehung des funktionellen C sowie eine kleinste zulässige Positionszahl.',
 'The learner names simple alcohol, aldehyde, ketone and carboxylic-acid formulas and justifies inclusion of the functional carbon and the lowest permissible locant.',
 'Für neue verzweigte Halbstrukturformeln begründet die lernende Person Kettenwahl und Nummerierungsrichtung und konstruiert als Gegenprobe ein anderes Positionsisomer ohne erfundene Stereodeskriptoren.',
 'For new branched condensed formulas, the learner justifies parent choice and numbering direction and constructs a different positional isomer as a check without invented stereodescriptors.',
 'Die Beschreibung begrenzt auf typische Moleküle und grundlegende Regeln. DE und EN sind gleichwertig; die BY-C9-NTG.5.3-Komponente trägt dieselbe Benennungsroutine, und die Fallantworten verwenden in beiden Sprachen korrekte Namen.'),
]

PSCIENCE = ['Die aktuelle v3-Antwort bezieht die Luftkontrolle nur auf das dokumentierte fehlende Wiederaufflammen und die CO2-freie Kontrolle nur auf klares Kalkwasser; kein feuchter Span wird als kontrollierte Variable erfunden. CaCO3-Fällung und H2-Wasserbildung sind atomar ausgeglichen. Fall 2 verändert Reinprobe zu Gemisch samt Trennung und Nachweisgrenze; negative O2-Prüfung und positiver H2-Befund beweisen keine vollständige Reinheit. Kleine Lehrerprobe und reine Auswertung begrenzen die Durchführung.', '24,0 % Salz aus 2,40/10,00 und 7,0 % Wasser aus 1,40/20,00 sind richtig. Nachwaschen, Massekonstanz, Leerprobe und Replikate sind in Material und Antwort vorhanden. Fall 2 wechselt von selektiver Rückgewinnung zu Masseverlust; der zugelassene organische Störanteil verhindert einen unbelegten Wassergehalt.', 'Carbonatreaktion mit 2 H3O+ erhält Atome und Ladung. Gegebene Enzymdaten tragen nur die einzelne Aktivitätsbewertung. Zweiter Fall wechselt zu Gewässer/Werkstoff und gegebenen Kriterien, ohne Norm zu erfinden. pH alleine liefert weder Pufferkapazität, Identität noch Neutralisationsbedarf; fehlendes V bleibt erhalten.', 'Beide Fälle unterscheiden Präsenz und Überwiegen; Begleitionen und Autoprotolyse erhalten das Modell der insgesamt neutralen Lösung. Die neuen Konzentrationen 10−5/10−9 ergeben Verhältnis 10^4 und Produkt 10−14 im expliziten 25-°C-Modell. Aktivitäts- und Temperaturgrenzen verhindern eine universelle pH-7-Regel; die aktuelle knappe D-Beschreibung fordert keinen neuen MWG-Nachweis.', 'Kohlenstoffbilanz von Photosynthese/Atmung und drei Kalkreaktionen erhält alle Atome. Der physikalische CO2-Austausch ist ausdrücklich nur molekular; Hydratation ist chemisch. Naturkreislauf zu Kalkkreislauf ist eine neue fachliche Variation. Energie und reale CO2-Rückbindung werden nicht aus einer idealen Stoffbilanz behauptet.', 'NaCl(s) → Na+(aq) + Cl−(aq) beschreibt getrennte hydratisierte Ionen und erhält die Ladung; NaCl wird nicht als Molekül oder Natriummetall ausgegeben. Neue Wasserbildung trennt Koeffizient, Index, Stoffmenge und Cl−-Ladung. Beide Fälle behandeln eigenständig verschiedene Stoff/Teilchen/Symbol-Zusammenhänge.', 'Metallische/mobile Elektronen und feste gegenüber beweglichen Salzionen erklären die gegebenen Leitfähigkeiten; reine Zuckerlösung ist als Modell begrenzt. Ethanol/Dimethylether sind korrekte Konstitutionsisomere; nur Ethanol hat einen H-Brücken-Donator für Eigenassoziation. Der neue Vergleich verändert Stoffklassen und Wechselwirkungen und beansprucht keinen genauen Siedewert.', 'Der geschlossene Dalton-Bilanzfall trennt Messbefund, empirisches Gesetz und Erklärung; die Atomzahl stimmt in 2 H2 + O2 → 2 H2O. Isotope/subatomare Struktur widerlegen begrenzte historische Annahmen, ohne chemische Bilanzierung zu verwerfen. Der Transfer ist ein Modellgrenzenfall mit neuen Befunden, kein weiterer Zahlenwechsel.', 'Zn/Cu-Teilgleichungen liefern je 2 e− und Gesamtladung +2. Der neue saure Permanganatfall verwendet 5 Fe2+, 8 H+, 4 H2O und hat auf beiden Seiten Ladung +17; das Material legt Mn2+ und das wässrig-saure Milieu fest. Neue Elektronenfaktoren samt H/O-Bilanz gehen über bloßes Wiederholen des Bildes hinaus; kein Experiment wird angefordert.', 'Metall/Säure verändert Mg 0 → +II und H +I → 0; Carbonat/Säure behält Oxidationszahlen und verbindet Protonierung mit CO2-Folgeumsetzung. Der neue Zn/Cu-gegen-NH3/H3O+-Vergleich zeigt Ladung und Oxidationszahl als verschiedene Kriterien, ohne Gasbildung als Voraussetzung zu verwenden.', 'Protolyse, Redox und angegebener SN2-Rückseitenangriff werden nach übertragenem Proton, Elektron beziehungsweise Elektronenpaar unterschieden. Die neue HBr-Addition erhält Atome und ist trotz Protonierung keine bloße Protolyse; reversible Essigsäure-Umsatzdaten erlauben nur bedingte Rückweg-Aussagen. Mechanismus wird aus dem vorgegebenen Schrittmodell begründet und nicht aus der Summenformel behauptet.', 'Getrennte Ag+/Ba2+-Fällungsbefunde, Leer- und Positivkontrollen tragen NaCl nur unter ausdrücklich binärer Reinstoffannahme; AgCl und BaSO4-Gleichungen erhalten Ladung. Fall 2 wechselt zu offenem Produktgemisch und zusätzlichen pH-Daten; Na/Cl-Paarung, Ursprung, Gehalte und andere Kationen bleiben offen. Saure/basische Probe wird nicht als reine neutrale Kochsalzlösung zugelassen.', 'HCl/NH3/Wasser-Strukturen begründen Protonenrollen, freie Elektronenpaare und ausgeglichene Gleichungen. Der neue Wasser/CH4/Na+-Fall begrenzt Eignung auf typische wässrige Brønsted-Reaktionen, belegt Ampholytmerkmale und vermeidet die Gleichsetzung von H-Anzahl, positiver Ladung oder Lewis-Acidität mit Brønsted-Acidität. Dies ist genau die erste Quellenkomponente.', 'Die gekoppelten CO2/H2CO3/HCO3−-Modelle erklären den beobachteten pH-Anstieg durch Entzug und Rückprotonierung; weder exakter End-pH noch irreversible Zerstörung wird behauptet. Der frische NH3/NH4+-Fall schreibt beide getrennten Protonenwege ausgeglichen. Basezugabe bildet mehr NH3; eine pauschale Produktzunahme nach OH− ist gerade nicht die Antwort. V bleibt HOLD.', 'H3O+ + OH− → 2 H2O sowie Mg(OH)2 + 2 H3O+ → Mg2+ + 4 H2O sind ausgeglichen; begleitende Ionen bleiben. Der neue Carbonatfall benötigt 2 Säureäquivalente und gibt CO2; neutrales metall-/organikhaltiges Abwasser wird nicht allein aus pH 7 zur Entsorgung freigegeben. Medizinische Dosierung und konkretes Entsorgungsrecht werden nicht beansprucht.', 'Die vier Einzelstrukturen haben richtig zugeordnete Hydroxy-, Aldehyd-, Keto- und Carboxygruppen. Die getrennte alkoholische OH-Gruppe in der Hydroxycarbonsäure wird zusätzlich gezählt, die Carboxy-OH gerade nicht. Ether ist das fachlich geänderte Gegenbeispiel; die vier Klassen werden weder als vollständig noch disjunkt ausgegeben.', 'Ethanol, Propanal, Butan-2-on/one und Propansäure/propanoic acid sind korrekt. Der neue verzweigte Fall liefert 3-Methylbutan-2-ol, 3-Methylbutan-2-on/one, 2-Methylpropansäure/propanoic acid und Butan-2-ol; Hauptgruppen-Locant und COOH-C1 stimmen. Neuer Kettenwahl-/Nummerierungsfall und Positionsisomer-Gegenprobe erzeugen Transfer ohne erfundene R/S-Konfiguration.']

campaign=read(OUT/'native-d-a/description-review-campaign.json')
inp=read(OUT/'native-d-a/description-review-input.json')
bound=read(OUT/'native-d-a/review-bundle-manifest.json')
original=read(BASE/'native-d-seventeen/round-a/description-review-input.json')
assert inp==original, 'own native campaign must retain exact v2 author review input'
assert len(OWN)==len(inp['goals'])==len(PSCIENCE)==17
runid='chemie-next17-fresh-blind-independent-a-20261007-v1-run-001'
batch=campaign['batches'][0]
records=[]
for n,(goal,body) in enumerate(zip(inp['goals'],OWN),1):
    fields=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
    rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'{runid}-{n:02d}', 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
    for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:rec[k]=goal[k]
    rec.update(decision='keep',understandingEvidence=dict(zip(fields,body[:6])),rationale=body[6],evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation='create',recordStatus='candidate',reviewAuthority='ai_candidate')
    records.append(rec)
resultdir=OUT/'native-d-a/results';resultdir.mkdir()
recordfile=resultdir/f'{batch["batchId"]}.records.jsonl'
with recordfile.open('x') as f:
    for rec in records:f.write(jd(rec)+'\n')
params={'provider':'OpenAI','model':'GPT-6 Codex (inherited runtime)','reviewer':'/root/chem17_fresh_blind_a','reviewPass':'first_pass','blindToOtherRuns':True,'temperature':'not exposed by runtime','task':'actual independent review of native v2 D17 and current P580b v3 plus unchanged P16'}
write(OUT/'generation-parameters.actual.json',params)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 Codex (inherited runtime)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(OUT/'generation-parameters.actual.json'),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bound['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':read(OUT/'review-start-and-input-integrity.actual.json')['startedAt'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':digest(recordfile),'toolchainVersion':'skillpilot-native-review-v3'}
write(resultdir/f'{batch["batchId"]}.run.json',run)

whole=read(BASE/'candidate/whole17-reviewer-material.author.json')['goals']
current=read(P3/'candidate/whole580b-bilingual-profile-and-two-cases.author-v3.json')
cases=read(P3/'candidate/complete34-bilingual-material-cases.author-v3.json')['cases']
assert len(cases)==34
pverdicts=[]
for i,g in enumerate(whole):
    gid=g['goalId'];pr=current['wholeCorrectedProfile'] if i==0 else g['wholeCandidateProfile']['profile']
    cs=[c for c in cases if c['goalId']==gid]
    assert len(cs)==2
    if i:assert cs==g['completeMaterialCases'],gid
    else:assert cs==current['completeCorrectedMaterialCases']
    assert pr['coverageExpectations']['minimumIndependentDemonstrations']==2
    assert pr['coverageExpectations']['freshVariationRequired'] and pr['coverageExpectations']['independentTransferRequired']
    bindings=[]
    for c,b in zip(cs,pr['applicationCaseBriefs']):
        assert c['caseId']==b['id']
        for lang,suffix in [('de','De'),('en','En')]:
            assert c['material'][lang]+' '+c['taskDemand'][lang]==b['taskDemand'+suffix],(gid,'material',lang)
            assert c['expectedPerformance'][lang]==b['expectedPerformance'+suffix],(gid,'response',lang)
            assert c['specificBoundaryOrCounterexample'][lang]==b['understandingFocus'+suffix],(gid,'boundary',lang)
            bindings.append({'caseId':c['caseId'],'language':lang,'bodySha256':'sha256:'+hashlib.sha256(jd({'material':c['material'][lang],'taskDemand':c['taskDemand'][lang],'expectedPerformance':c['expectedPerformance'][lang],'boundary':c['specificBoundaryOrCounterexample'][lang]}).encode()).hexdigest()})
    for e,c in zip(pr['expectations'],cs):
        for lang,suffix in [('de','De'),('en','En')]:assert e['observablePerformance'+suffix]==c['expectedPerformance'][lang]
    pverdicts.append({'goalId':gid,'verdict':'pass_candidate_science','scientificAndDidacticRationale':PSCIENCE[i],'bilingualEquivalence':'DE/EN materials, tasks, model answers and boundaries personally read; chemistry and limitations equivalent','profileAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','caseLanguageBindings':bindings,'independentTransferCaseId':cs[1]['caseId'],'imageIndependentCases':True,'observedLearnerEvidence':False,'humanApproval':False,'vHoldRetained':g['vHold']})
write(OUT/'p17-current34-cases68-language-items.independent-a.first-pass.json',{'documentType':'Actual independent A scientific first pass, current P580b v3 and exact unchanged P16 v2','blindToOtherReviewerOutputs':True,'reviewer':'/root/chem17_fresh_blind_a','goalCount':17,'caseCount':34,'languageItemCount':68,'materialCasesSource':{'path':str((P3/'candidate/complete34-bilingual-material-cases.author-v3.json').relative_to(ROOT)),'sha256':digest(P3/'candidate/complete34-bilingual-material-cases.author-v3.json')},'p580bCurrentWholeSource':{'path':str((P3/'candidate/whole580b-bilingual-profile-and-two-cases.author-v3.json').relative_to(ROOT)),'sha256':digest(P3/'candidate/whole580b-bilingual-profile-and-two-cases.author-v3.json')},'scientificFindings':pverdicts,'humanApproval':False,'humanTrial':False,'activeWrites':False,'strictNetGain':0})

pageobs=[]
for page,g in enumerate(inp['goals'],3):
    png=OUT/'raster-pages'/f'page-{page:02d}.png'
    pageobs.append({'physicalPage':page,'goalPage':page-2,'goalId':g['goalId'],'rasterSha256':digest(png),'actuallyViewed':True,'observation':'Full German title, full public goal ID, current description, chapter context and relation blocks visible on one untruncated page','visualizationPresent':g['reviewContext']['page']['visualization'] is not None,'vApprovalGranted':False})
write(OUT/'actual17-pdf-pages-viewed.independent-a.json',{'sourcePdf':str((BASE/'native-d-seventeen/bundle/book.pdf').relative_to(ROOT)),'sourcePdfSha256':digest(BASE/'native-d-seventeen/bundle/book.pdf'),'rendering':'pdftoppm -f3 -l19 -scale-to1300 -png; actual tools.view_image for each original page raster','pageObservations':pageobs,'englishPdfViewed':False,'englishEvidence':'Full bilingual native review input and all complete material cases personally read','hePhysicalOriginal17Viewed':True,'humanApproval':False})

source=read(BASE/'candidate/bounded-primary-witnesses17.author.json')
sources=[]
for row in source['rows']:
    for witness in row['boundedLiteralBYWitnesses']:
        s=witness['wholeSourceGoal'];p=ROOT/witness['primaryText']['path'];t=p.read_text();norm=lambda x:' '.join(x.split())
        assert norm(s['description']) in norm(t),(row['goalId'],s['id'])
        sources.append({'canonicalGoalId':row['goalId'],'sourceGoalId':s['id'],'sourceSpan':s['sourceSpan'],'primaryTextPath':str(p.relative_to(ROOT)),'primaryTextSha256':digest(p),'normalizedLiteralContained':True,'bound':'Only this explicit component; no entire raw broad mapping or learner source superset closure'})
routes=read(BASE/'candidate/two-bounded-direct-source-routes.author.json')['routes']
for r in routes:
    p=ROOT/r['primaryText']['path'];lines=p.read_text().splitlines();n=next(i for i,line in enumerate(lines) if r['literalWitness'] in line)
    sources.append({'canonicalGoalId':r['goalId'],'sourceGoalId':r['wholeSourceGoal']['id'],'sourceSpan':r['wholeSourceGoal']['sourceSpan'],'primaryTextPath':str(p.relative_to(ROOT)),'primaryTextSha256':digest(p),'actualLineNumber':n+1,'literalWitness':lines[n],'nativeMappingCandidate':r['proposedMappingRowToAppend'],'verdict':'pass_bounded_candidate_route','bound':r['scope'],'wholeBroadOriginalSourceClosure':False,'activeMappingWritten':False})
write(OUT/'source-inspection/bounded-current-source-routes.independent-a.json',{'documentType':'Independent bounded original-source and route inspection','sources':sources,'heOriginalPhysicalPage':17,'hePrintedPage':16,'heOriginalRasterPath':str((BASE/'sources/HE-G9-physical-017.png').relative_to(ROOT)),'heOriginalRasterSha256':digest(BASE/'sources/HE-G9-physical-017.png'),'heOriginalActuallyViewed':True,'heScope':'Dalton atomic hypothesis and explicit law/hypothesis/model distinction; redox-symbol context only; no whole Hessen curriculum closure','wholeSourceApproval':False,'nationwideJurisdictionVerification':False,'activeWrites':False,'humanApproval':False})

cfg=read(BASE/'configs/positive-evidence17.author-candidates.config.json')
# This copies AUTHOR bodies unchanged; native materialization remains ai_candidate.
cfg['reviewId']='chemie-next17-p580b-control-material-author-v3-20261007'
cfg['reviewPath']=str((OUT/'native-p17-author-bodies.review.jsonl').relative_to(ROOT))
cfg['scope']['label']='Independent technical binding of exact current AUTHOR P580b v3 plus unchanged P16 v2; ai_candidate E1/G1, no human approval'
write(OUT/'native-p17-current-author-bodies.config.json',cfg)
write(OUT/'retained-holds.independent-a.json',read(BASE/'candidate/preserved-holds.author.json'))
print('Written actual first-pass D17 keep and current P17 candidate science passes; not yet native-validated or sealed.')
