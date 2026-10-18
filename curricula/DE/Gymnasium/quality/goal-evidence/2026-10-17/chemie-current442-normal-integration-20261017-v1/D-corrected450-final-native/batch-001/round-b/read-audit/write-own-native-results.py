from pathlib import Path
import hashlib
import json
from datetime import datetime, timezone

ROOT = Path('/home/enpasos/projects/skillpilot')
ROUND = Path(__file__).resolve().parent.parent
AUDIT = ROUND / 'read-audit'
BUNDLE = ROUND.parent / 'bundle'
NEUTRAL = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current450-final-ten-neutral-materials-20261018-v1'
REVIEWER = 'chemie450-final-native-d-independent-b'
RUN_ID = 'chemie-final-current-context-d-001-v1-stock-blind-b-run-001'
STARTED = '2026-10-18T00:26:18.234119Z'


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def pin(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write_json(path, value):
    path.write_bytes(encoded(value))
    json.loads(path.read_bytes())


scientific_decisions = [
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Die Bedeutung eines Kohlenhydrats hängt von seiner Stoffstruktur, seiner Funktion im Lebensmittel und der tatsächlich aufgenommenen Menge ab. Eine geringere Zuckerkonzentration allein begründet weder eine geringere Aufnahme noch ein pauschales Gesundheitsurteil.',
            'essentialUnderstandingEn': 'The significance of a carbohydrate depends on its molecular structure, its function in a food and the amount actually consumed. Lower sugar concentration alone establishes neither lower intake nor a blanket health judgment.',
            'observablePerformanceDe': 'Die Person berechnet aus Konzentration und Portion die aufgenommene Zuckermasse und begründet ein Urteil mit offengelegten Kriterien. Sie erklärt dabei, weshalb Saccharose zur Süßung und Stärke zur Konsistenz beitragen können, statt alle Kohlenhydrate gleichzusetzen.',
            'observablePerformanceEn': 'The learner calculates consumed sugar mass from concentration and serving size and justifies a judgment using explicit criteria. They explain why sucrose can provide sweetness and starch can provide consistency rather than equating all carbohydrates.',
            'transferExpectationDe': 'In einem anschließend vorgelegten Lebensmittelvergleich mit veränderter Kohlenhydratart und Funktion prüft die Person erneut, welche Mengen- und Zusammensetzungsangaben ihr Urteil tragen und welche Ernährungsfolgen aus den Angaben offenbleiben.',
            'transferExpectationEn': 'In a subsequently presented food comparison with a changed carbohydrate type and function, the learner reconsiders which quantity and composition data support the judgment and which nutritional consequences remain unresolved.'
        },
        'rationale': 'Die kurze, semantisch gleichwertige DE/EN-Beschreibung benennt eine zusammenhängende Bewertungskompetenz. Der gelesene Mengenvergleich ergibt 20 g gegenüber 25 g und verhindert die Verwechslung von Konzentration und Aufnahme; der zweite vollständige Fall verlangt einen stofflich veränderten Funktionsvergleich. Industrielle Prozessbewertung wird durch dieses Ziel nicht mitbeansprucht. Das aktuelle Profil enthält dazu Verständnis, eigene begründete Leistung und Transfer; Bildportionen sind ausdrücklich symbolisch. Ich leite daraus weder einen Gesundheitsnachweis noch vollständige externe Quellen- oder Projektionsabdeckung ab.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Triacylglyceride besitzen drei über Estergruppen gebundene Fettsäurereste. Kettenlänge, Sättigung und cis/trans-Konfiguration beeinflussen Packung und damit physikalische Eigenschaften; die langen unpolaren Reste prägen die geringe Wasserlöslichkeit.',
            'essentialUnderstandingEn': 'Triacylglycerols have three fatty acid residues attached through ester groups. Chain length, saturation and cis/trans configuration influence packing and physical properties; the long nonpolar residues account for poor water solubility.',
            'observablePerformanceDe': 'Die Person kennzeichnet an einer selbst konstruierten Fettstruktur die drei Estergruppen und erklärt vergleichend Schmelzbereich und Löslichkeit aus Molekülbau und Wechselwirkungen. Sie hält Kettenlänge und Zusammensetzung als Vergleichsbedingungen fest und unterscheidet ein Triacylglycerid von einer Polymerkette.',
            'observablePerformanceEn': 'The learner marks the three ester groups in a fat structure they construct and comparatively explains melting range and solubility through molecular structure and interactions. They state chain length and composition as comparison conditions and distinguish a triacylglycerol from a polymer chain.',
            'transferExpectationDe': 'Bei gleicher Zahl von Doppelbindungen, aber geänderter cis/trans-Konfiguration oder verändertem Lösungsmittel begründet die Person eine neue Eigenschaftserwartung. Sie prüft, welche ursprünglichen Packungs- und Löslichkeitsargumente weiter gelten, ohne eine universelle Rangfolge natürlicher Fettgemische zu behaupten.',
            'transferExpectationEn': 'For equal double-bond counts but changed cis/trans configuration or a changed solvent, the learner justifies a new property expectation. They examine which packing and solubility arguments still apply without claiming a universal ranking of natural fat mixtures.'
        },
        'rationale': 'Identifikation und Erklärung dienen hier derselben Struktur-Eigenschaftsbeziehung. Die vollständigen Fälle decken drei Estergruppen, gesättigte/cis-ungesättigte Reste, cis/trans-Packung und Wasser/unpolares Medium mit benannten Vergleichsgrenzen ab. Die DE/EN-Beschreibungen verlangen diese Beziehung klar und gleichwertig; Hydrierungsbilanz und Kennzahlen stehen in eigenen Zielen. Die tatsächlich gelesene HB-Originalseite 28 bestätigt Struktur sowie Löslichkeit/Konsistenz als passende Inhaltsaspekte, begründet aber für sich keine bundesweite Vollabdeckung. Die schematische Dreirest-Abbildung ersetzt keine selbstständige Erklärung.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Bei der katalytischen Fetthärtung addiert jede umgesetzte C=C-Bindung ein H2-Molekül; die Esterbindungen bleiben im gegebenen Modell erhalten. Vollständige und teilweise Hydrierung liefern unterschiedliche Restungesättigtheit, während Packung und Konsistenz auch von Konfiguration und Gemischzusammensetzung abhängen.',
            'essentialUnderstandingEn': 'During catalytic fat hardening each reacted C=C bond adds one H2 molecule; the ester bonds remain intact in the supplied model. Complete and partial hydrogenation leave different unsaturation, while packing and consistency also depend on configuration and mixture composition.',
            'observablePerformanceDe': 'Die Person zeichnet die vollständige Hydrierungsbilanz eines Triacylglycerids mit drei C=C, markiert die sechs zusätzlich gebundenen H-Atome und begründet den Verbrauch von drei mol H2 je mol Fett. Sie verknüpft den Strukturwechsel mit begrenzten Packungsaussagen und unterscheidet Addition von Esterhydrolyse und einem ionischen HX-Mechanismus.',
            'observablePerformanceEn': 'The learner draws the complete hydrogenation balance of a triacylglycerol containing three C=C bonds, marks the six added H atoms and justifies consumption of three mol H2 per mol fat. They link the structural change to bounded packing statements and distinguish addition from ester hydrolysis and an ionic HX mechanism.',
            'transferExpectationDe': 'Bei der anschließend eingeführten Probe mit sechs C=C und nur drei umgesetzten Bindungen bestimmt die Person verbleibende Ungesättigtheit und H2-Verbrauch. Sie begründet, warum daraus weder vollständige Sättigung noch eine eindeutige Konsistenz, exakte Iodzahl oder pauschale Gesundheitsaussage folgt.',
            'transferExpectationEn': 'For the subsequently introduced sample with six C=C bonds of which only three react, the learner determines remaining unsaturation and H2 consumption. They explain why this establishes neither complete saturation nor a unique consistency, exact iodine value or blanket health conclusion.'
        },
        'rationale': 'Die DE/EN-Beschreibung ist ausführlich, bleibt aber bei einer kohärenten Reaktion-zu-Eigenschaft-Kompetenz: katalytische H2-Addition mit expliziten Folgerungsgrenzen. Stoffbilanz, unveränderte Ester und vollständiger/teilweiser Umsatz sind im vollständig gelesenen Papiermaterial korrekt; ein gefährlicher H2-Versuch wird nicht verlangt. Das tatsächliche Bild markiert an beiden C-Atomen je ein zusätzliches H. HB-Originalseite 28 nennt Hydrierung als Additionsreaktion. Das aktuelle Profil enthält den frischen Teilumsatzfall samt begrenzten Aussagen und verlangt keine behauptete Gesundheitsbewertung oder reale Durchführung.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Donor- und Akzeptorgruppen verändern die elektronischen Übergänge eines Farbstoffmodells nur in ihrem konkreten Kopplungszustand. Ein verfügbares Amin-Elektronenpaar, seine Protonierung und eine durchgehende oder unterbrochene π-Verbindung unterscheiden sich; Gruppenbezeichnungen allein garantieren keine sichtbare Bande oder universelle Rotverschiebung.',
            'essentialUnderstandingEn': 'Donor and acceptor groups alter electronic transitions of a dye model according to their actual coupling state. An available amine lone pair, its protonation and continuous or interrupted pi conjugation differ; group names alone guarantee neither a visible band nor a universal red shift.',
            'observablePerformanceDe': 'Die Person lokalisiert im gegebenen D–π–A-Modell Aminodonor und Nitroakzeptor, erklärt deren Kopplung und deutet die vorgegebenen Spektraländerungen bei Protonierung über ΔE=hc/λ. Im ausdrücklich historischen HB-Begriffsgebrauch ordnet sie Auxochrom und Antiauxochrom bedingt zu und trennt diese Rollen vom bandenbezogenen Chromophor.',
            'observablePerformanceEn': 'The learner locates the amine donor and nitro acceptor in the supplied D–pi–A model, explains their coupling and interprets the given protonation-induced spectral shifts using ΔE=hc/λ. Under the explicitly historical HB terminology they assign auxochrome and antiauxochrome conditionally and distinguish these roles from the band-specific chromophore.',
            'transferExpectationDe': 'Nach Ersatz der Vinylbrücke durch eine gesättigte Brücke prüft die Person, welche Fernkopplung entfällt und welche lokalen Chromophore verbleiben können. Sie begrenzt Aussagen über die neue UV-Bande und die Wahrnehmungsfarbe, anstatt den ursprünglichen Donor-Akzeptor-Effekt ungeprüft zu übertragen.',
            'transferExpectationEn': 'After the vinyl bridge is replaced by a saturated bridge, the learner examines which long-range coupling is lost and which local chromophores may remain. They bound conclusions about the new ultraviolet band and perceived colour instead of automatically transferring the original donor–acceptor effect.'
        },
        'rationale': 'Die Beschreibung benennt den funktionellen Einfluss auf Farbstoffe fachlich offen und DE/EN-gleichwertig. Die vollständig gelesenen Fälle setzen ein konkretes gekoppeltes Modell, Protonierung und sp3-Unterbrechung ein und vermeiden eine allgemeine Gruppenregel; das aktuelle Profil enthält diese ganze Verständnis- und Transferkette. HB-Originalseite 35 nennt Chromophor/Auxochrom/Antiauxochrom im gemeinsamen Themenwortschatz, Seite 37 erhält dessen Themenwahl. Der historische Status von Auxochrom ist zusätzlich anhand der IUPAC-Primärreferenz https://goldbook.iupac.org/terms/view/A00536 geprüft. Eigene Erwerbserweiterungen und Quellenanteile werden dadurch nicht zu universellen amtlichen Pflichten oder vollständig geprüften Projektionen.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Verseifungszahl und Iodzahl normieren unterschiedliche stöchiometrische Verbräuche auf eine Fettmasse: KOH-Verbrauch wird im reinen Triestermodell mit drei Estergruppen, Iodäquivalent-Verbrauch mit den C=C-Bindungen verknüpft. Gleiche Kennzahlen identifizieren keine eindeutige Molekülstruktur; oxidative Haltbarkeit erfordert weitere Bedingungen.',
            'essentialUnderstandingEn': 'Saponification and iodine values normalise different stoichiometric consumptions to fat mass: KOH consumption is linked to three ester groups in the pure-triester model, whereas iodine-equivalent consumption is linked to C=C bonds. Equal indices do not identify a unique molecular structure; oxidative stability requires additional conditions.',
            'observablePerformanceDe': 'Die Person leitet beide Kennzahlen aus Stoffmengenverhältnissen mit mg KOH/g beziehungsweise g I2-Äquivalent/100 g her und erklärt die unterschiedlichen Werte für gesättigte, ungesättigte und kürzere Fettsäurereste. Sie begründet aus den Befunden nur bedingte Aussagen zu Zusammensetzung und Oxidationsanfälligkeit und benennt die reinen Triesterannahmen.',
            'observablePerformanceEn': 'The learner derives both indices from molar ratios in mg KOH/g and g I2 equivalent/100 g and explains their different values for saturated, unsaturated and shorter residues. They draw only conditional conclusions about composition and oxidation susceptibility and identify the pure-triester assumptions.',
            'transferExpectationDe': 'Beim frischen Massengemisch nutzt die Person eine massengewichtete Kennzahl statt einer erfundenen Einzelstruktur. Geänderte Lagerung, freie Fettsäuren oder eine unbekannte cis/trans-Verteilung werden als unterschiedliche Grenzen geprüft; weder ein Verfallsdatum noch ein sicherer Schmelzpunkt wird aus der Iodzahl allein abgeleitet.',
            'transferExpectationEn': 'For the fresh mass mixture the learner uses mass-weighted indices instead of inventing one molecular structure. They examine changed storage, free fatty acids and unknown cis/trans distribution as distinct limitations; they infer neither an expiry date nor a definite melting point from iodine value alone.'
        },
        'rationale': 'Die Beschreibung verbindet die zwei kontrastierenden Messgrößen zu einer begrenzten Strukturdiagnose; sie ist keine bloße Sammlung unabhängiger Rechenrezepte. Beide Einheiten, die Modellannahmen und die nicht eindeutige Rückrichtung werden ausdrücklich genannt. Die vollständig gelesenen Rechen- und Haltbarkeitsmaterialien liefern korrekte Werte und strukturelle Gegenfälle: hohe VZ bei kurzen gesättigten Resten, unveränderte Kennzahlen bei veränderter Lagerung sowie freie Säuren/cis-trans-Grenzen. HB-Originalseite 28 nennt sowohl Strukturbezug als auch Zusammensetzung und Haltbarkeit. Das aktuelle Profil und die gestuften frischen Karten decken genau diese Kette ab; eine analytische Versuchsdurchführung wird nicht vorgetäuscht.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Chemische Anwendungen erfüllen Funktionen durch Stoffeigenschaften, Trennung, Reaktion oder Energieumwandlung. Ihr Nutzen für Menschen und Gesellschaft ist an Bedingungen gebunden und mit Stoff-, Ressourcen- und Umweltfolgen abzuwägen; eine erfolgreiche Einzelfunktion beweist keine allgemeine Sicherheit oder Nachhaltigkeit.',
            'essentialUnderstandingEn': 'Chemical applications fulfil functions through material properties, separation, reaction or energy conversion. Their benefits to people and society depend on conditions and must be considered alongside material, resource and environmental consequences; one successful function proves neither general safety nor sustainability.',
            'observablePerformanceDe': 'Die Person erklärt anhand der bereitgestellten Karten die chemische Funktion etwa von Flockung, Beschichtung, Verpackungsbarriere oder Batterie und verknüpft konkrete Vorteile mit begründeten Grenzen. In den zusätzlichen HB-SekI-Routen trennt sie CO- und CO2-Wirkpfade beziehungsweise Reinigungsfunktion, Stoffeintrag und Abwasserweg, ohne fehlende Prüfungen zu erfinden.',
            'observablePerformanceEn': 'Using the supplied cards, the learner explains the chemical function of examples such as flocculation, coatings, packaging barriers or batteries and connects specific benefits with justified limitations. In the additional HB lower-secondary routes they distinguish CO and CO2 pathways, or cleaning function, material input and wastewater pathways, without inventing missing tests.',
            'transferExpectationDe': 'Bei einer anschließend geänderten Anwendung prüft die Person die benötigten Funktionsbedingungen erneut: etwa industriellen Kompost statt beliebiger Umwelt, gezielte Durchlässigkeit statt Barriere oder angepasste Dosis bei stärkerer Verschmutzung. Sie begründet das geänderte Urteil chemisch und nennt die jeweils offenen Wirkungs- und Vergleichsdaten.',
            'transferExpectationEn': 'For a subsequently changed application the learner reassesses the necessary functional conditions: industrial composting rather than any environment, deliberate permeability rather than a barrier, or adjusted dose for heavier soiling. They justify the revised judgment chemically and identify the remaining impact and comparison data.'
        },
        'rationale': 'Die DE/EN-Beschreibung verlangt eine fachlich begründete Diskussion konkreter Anwendungen und ist damit von bloßer Motivation oder einer unverbundenen Berufsliste unterscheidbar. Die ganzen Karten liefern passende Ausgangsinformationen und verlangen eigenständige Verknüpfung von Funktion, Nutzen und Grenzen; frische Fälle verändern echte Funktionsbedingungen. CO/CO2 und Reinigerdosis werden in den zusätzlich gelesenen vollständigen HB-Fällen sachlich und ohne Exposition behandelt. Das aktuelle Profil enthält diese Kette und grenzt die zusätzlichen Quellenrouten ein. Die gelesenen eigenen Erwerbserweiterungen behaupten ausdrücklich keinen amtlichen Vollauftrag sämtlicher Beispiele; aus ihrem Vorhandensein leite ich keine vollständige Quellen- oder Projektionserfüllung ab.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Ein Photon kann das delokalisierte Elektronensystem über einen erlaubten Energieabstand anregen; ΔE=hc/λ verbindet diesen Übergang mit der Absorptionsbande. Sichtbare Absorption und austretendes Restlicht sind von Emission und einer exakten Farbbestimmung aus nur einer Bande zu unterscheiden.',
            'essentialUnderstandingEn': 'A photon can excite a delocalised electron system across an allowed energy gap; ΔE=hc/λ links that transition to its absorption band. Visible absorption and outgoing residual light must be distinguished from emission and from an exact colour prediction based on only one band.',
            'observablePerformanceDe': 'Die Person zeichnet eigene Energienstufenschemata mit aufwärts gerichteten Absorptionspfeilen, rechnet zwischen gegebenen Energielücken und Wellenlängen um und begründet sichtbare gegenüber UV-Absorption. Sie lokalisiert den bandenrelevanten Chromophor und erklärt, weshalb absorbiertes Licht nicht einfach die Durchsichtfarbe ist.',
            'observablePerformanceEn': 'The learner draws their own energy-level schemes with upward absorption arrows, converts between supplied energy gaps and wavelengths and explains visible versus ultraviolet absorption. They locate the band-relevant chromophore and explain why absorbed light is not simply the transmitted colour.',
            'transferExpectationDe': 'An einer neuen Kette mit sp3-Unterbrechung oder isolierten C=C beurteilt die Person die begrenzte Delokalisierung und eine angegebene oder nicht angegebene neue Übergangsenergie. Sie überträgt die inverse Energie-Wellenlängen-Beziehung und benennt, warum mehrere Doppelbindungen allein weder dieselbe sichtbare Bande noch eine genaue Farbe beweisen.',
            'transferExpectationEn': 'For a fresh chain with an sp3 interruption or isolated C=C bonds, the learner examines limited delocalisation and any supplied or missing new transition energy. They transfer the inverse energy–wavelength relation and explain why multiple double bonds alone prove neither the same visible band nor an exact colour.'
        },
        'rationale': 'Die Beschreibung präzisiert eine gemeinsame mikroskopische Erklärung und ihre Energiedarstellung; DE/EN stimmen überein. Die vollständig gelesenen Profile und beiden zusätzlichen Energie-/Polyenmaterialien verlangen eigene Schemata, korrekte Rechnungen und echten Konjugationsbruch-Transfer. Die angegebenen Beziehungen 2,48 eV/500 nm sowie 450 nm/etwa 2,76 eV sind stimmig. Zusätzliche Herkunfts-, Mehrklassen- oder Auxochromprüfungen werden in diesem Ziel nicht als Abschlussbedingung eingeführt. Das tatsächliche Bild zeigt Anregung nach oben und Energieabgabe getrennt; es ist Anschauung, keine unabhängige Lernendenleistung. HB-Seite 35 stützt Strahlung/Materie und einschlägige Begriffe, ohne alle eigenen Falldetails amtlich vorzuschreiben.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Formeldarstellungen bewahren je nach Art unterschiedliche Informationen über Atomzahlen, Verknüpfung, Elektronenpaare und räumliche Konfiguration. Eine Summenformel allein bestimmt bei möglichen Isomeren keine eindeutige Struktur; eine Umwandlung benötigt ausreichende Strukturangaben und eine begründete Darstellungswahl.',
            'essentialUnderstandingEn': 'Formula representations retain different information about atom counts, connectivity, electron pairs and spatial configuration. Where isomers are possible a molecular formula alone does not determine one structure; conversion requires sufficient structural information and a justified representation choice.',
            'observablePerformanceDe': 'Die Person überführt gegebene Ethanol-/Ether- oder Ethenstrukturen in passende Formeln und begründet, welche Darstellung die jeweilige Frage beantwortet. Ausschließlich im benannten HB-SekII-Thema-2.1-Anteil erstellt sie zusätzlich eigene Baukasten- und digitale Glucosemodelle samt konsistenter Fischer-/Keilstrich-Umwandlung und dokumentierten Ansichten.',
            'observablePerformanceEn': 'The learner converts supplied ethanol/ether or ethene structures into appropriate formulas and explains which representation answers the question. Only within the specified HB upper-secondary topic-2.1 scope do they additionally construct their own physical-kit and digital glucose models, with consistent Fischer/wedge-dash conversion and recorded views.',
            'transferExpectationDe': 'Bei einer neuen Molekülklasse überprüft die Person erneut, welche Strukturinformation für eine eindeutige Umwandlung fehlt oder vorliegt. Im eng begrenzten HB-Zusatzfall überträgt sie die räumlichen Konventionen auf D-Mannose, identifiziert C2 als geändertes Zentrum und belegt die erhaltenen übrigen Konfigurationen mit beiden eigenen Werkzeugprodukten.',
            'transferExpectationEn': 'For a fresh molecular class the learner rechecks which structural information is present or missing for unambiguous conversion. In the narrowly scoped additional HB case they transfer the spatial conventions to D-mannose, identify C2 as the changed centre and demonstrate preservation of the other configurations using both own tool products.'
        },
        'rationale': 'Die ausdrückliche Bedingung ausreichender Strukturinformationen verhindert den falschen eindeutigen Rückschluss aus einer Summenformel. Konvertieren und situationsgerechte Auswahl bilden eine gemeinsame Repräsentationskompetenz; die DE/EN-Texte sind gleichwertig und für die Grundkompetenz methodenneutral. Das vollständige aktuelle Profil und das ganze Werkzeugmaterial begrenzen die zusätzliche physische UND digitale Eigenleistung ausdrücklich auf HB/SekII/GK-LK/Thema 2.1; fehlende Werkzeuge ergeben dort keinen erfüllten Quellnachweis. Originalseite 26 nennt beide Modellhilfen und Fischer/Keilstrich, Seite 37 erhält die Themenwahl. Die tatsächliche Ethanolabbildung zeigt passende Bindigkeiten und zwei freie O-Paare. Daraus wird weder SekI-Stereochemiepflicht noch eine ausgeführte Werkzeugleistung abgeleitet.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Rohstoffherkunft, Polymerstruktur, Nutzung und Entsorgung sind getrennte Einflussgrößen einer Kunststoffbewertung. Ein fairer Vergleich benötigt gleichen Nutzen und benannte Systemgrenzen; biobasiert garantiert weder Abbaubarkeit, CO2-Neutralität, Recyclingausbeute noch geringeren Partikelabrieb.',
            'essentialUnderstandingEn': 'Feedstock origin, polymer structure, use and disposal are distinct factors in evaluating plastics. A fair comparison requires equal service and explicit system boundaries; biobased origin guarantees neither biodegradability, carbon neutrality, recycling yield nor lower particle abrasion.',
            'observablePerformanceDe': 'Die Person rechnet Material- und Emissionsdaten auf dieselbe Nutzung um und begründet unter offengelegten Klima-, Flächen-, Wasser- und Entsorgungskriterien eine bedingte Rohstoffwahl. Sie trennt CO2e von Energie, Sammelquote von Recyclingausbeute und im Partikelfall Herkunft, Mikroplastikgrößenabgrenzung sowie primäre/sekundäre Entstehung.',
            'observablePerformanceEn': 'The learner normalises material and emission data to the same service and justifies a conditional feedstock choice using explicit climate, land, water and disposal criteria. They distinguish CO2 equivalent from energy, collection from recycling yield and, in the particle case, provenance, the microplastic size boundary and primary/secondary formation.',
            'transferExpectationDe': 'Bei geändertem Strommix oder verkürzter Nutzungsdauer berechnet und bewertet die Person den Vergleich neu. Ändern sich zusätzlich Polymerchemie und Sammelweg, überträgt sie den zuvor gleichen Abrieb nicht ungeprüft, sondern benennt die nun benötigten vergleichbaren Verbleibs- und Wirkungsdaten.',
            'transferExpectationEn': 'For a changed electricity mix or shorter service life the learner recalculates and reevaluates the comparison. If polymer chemistry and collection also change, they do not automatically transfer the previously equal abrasion but identify the comparable fate and impact evidence now needed.'
        },
        'rationale': 'Die knappe DE/EN-Beschreibung bezeichnet eine zusammenhängende, anspruchsvolle Rohstoffbewertung. Die vollständig gelesenen beiden Basisfälle erläutern eindeutig 20 kg PE insgesamt je 1000 Beutel, korrekte Werte je Nutzung und einen bedingten Mehrwegvergleich; die zusätzliche ganze Mikroplastikkarte prüft den relevanten Entsorgungsaspekt ohne erfundenen Schaden. Der Stoff-/Funktionsbezug bleibt über alle Kriterien erhalten, und das aktuelle Profil enthält eigenständige Begründung sowie strukturell veränderten Transfer. Ein allgemeines Bio-PE-Gütesiegel oder eine vollständige Lebenszyklusbilanz wird weder aus Text noch Bild abgeleitet. Diese Beschreibung fordert keine zusätzliche unabhängige Hydrolyse- oder praktische Messkompetenz.'
    },
    {
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'understandingEvidence': {
            'essentialUnderstandingDe': 'Industrielle Rübenzuckergewinnung verbindet Lösung/Extraktion, chemische Saftreinigung, Feststoffabtrennung, Konzentration und Kristallisation. Eine begründete Prozessbewertung trennt ökologische, ökonomische und soziale Kriterien, vergleicht denselben Produktertrag und behandelt Unsicherheit und fehlende Informationen ausdrücklich.',
            'essentialUnderstandingEn': 'Industrial beet-sugar production combines dissolution/extraction, chemical juice purification, solid separation, concentration and crystallisation. A reasoned process evaluation distinguishes environmental, economic and social criteria, compares equal product output and explicitly treats uncertainty and missing information.',
            'observablePerformanceDe': 'Die Person erklärt die Funktion der bereitgestellten Prozessschritte und unterscheidet Fällung mit anschließender Filtration von der Entfernung beliebiger gelöster Stoffe. Sie bewertet die beiden Standorte unter je einem begründeten Kriterium aller drei Perspektiven, legt die Gewichtung offen und berücksichtigt Emissionsunsicherheit sowie unvollständige Sozialdaten.',
            'observablePerformanceEn': 'The learner explains the functions of the supplied process steps and distinguishes precipitation followed by filtration from removing arbitrary dissolved substances. They evaluate both sites using justified criteria from all three perspectives, make weighting explicit and consider emission uncertainty and incomplete labour information.',
            'transferExpectationDe': 'Erst nach der eigenen Ausgangsbewertung beurteilt die Person den zusätzlich eingeführten Wasserkreislauf bei veränderten Kosten. Sie erläutert mit denselben offengelegten Kriterien, ob das Urteil stabil bleibt, und unterscheidet verbesserte Wasserbilanz von unveränderten Emissionen und weiterhin fehlenden Daten.',
            'transferExpectationEn': 'Only after making the initial evaluation does the learner assess the newly introduced water loop with changed costs. Using the same explicit criteria, they explain whether the judgment remains stable and distinguish improved water use from unchanged emissions and still missing data.'
        },
        'rationale': 'Prozesserklärung und Bewertung sind hier fachlich integriert: Die Stoff- und Trennprinzipien liefern die Grundlage für die Kriterienabwägung, statt bloß neben einer allgemeinen Standortmeinung zu stehen. Die vollständige DE/EN-Prozesskarte trennt Extraktion, CaCO3-Fällung/Filtration, Eindampfen und Kristallisation sachgerecht und nennt gleiche Funktionseinheit sowie Datenlücken. Die getrennt vorgelegte C-Karte verändert Wasserverbrauch und Kosten und ermöglicht echten Urteilstransfer; das aktuelle Profil enthält alle drei Perspektiven. Originalseite 26 verlangt die ökologische, ökonomische und soziale Bewertung industrieller Zuckergewinnung. Die Beschreibung bleibt von Zuckerernährung getrennt und behauptet weder eine reale Betriebsprüfung noch universelle Themenpflicht oder vollständige externe Projektion.'
    }
]


input_path = ROUND / 'description-review-input.json'
input_data = json.loads(input_path.read_bytes())
campaign = json.loads((ROUND / 'description-review-campaign.json').read_bytes())
bundle = json.loads((ROUND / 'review-bundle-manifest.json').read_bytes())
batch = campaign['batches'][0]
batch_path = ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')
batch_rows = [json.loads(line) for line in batch_path.read_text().splitlines()]
assert [row['goal'] for row in batch_rows] == input_data['goals']
assert len(scientific_decisions) == len(input_data['goals']) == 10
assert pin(input_path)['sha256'] == '344479f5102e155eedca3f0be627f7f271f0a947fe278bea12979cb3e11366c4'
assert pin(BUNDLE / 'book.pdf')['sha256'] == '9a59193603414dbe7f56b5c4828854957a92c583006339f03777d0b14a0a6932'
assert pin(NEUTRAL / 'INDEX.actual-whole-materials-and-primary-pages.review-only.json')['sha256'] == 'dc3f58e845f76ac80664e85f2bac5fd11d1310779879ccc0ed1b4a66606c0508'

records = []
copied_fields = ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']
for ordinal, (goal, judgment) in enumerate(zip(input_data['goals'], scientific_decisions), 1):
    row = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'{RUN_ID}.record-{ordinal:03d}',
        'runId': RUN_ID,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': input_data['bundleFingerprint'],
        'bookDigest': input_data['bookDigest'],
        **{key: goal[key] for key in copied_fields},
        **judgment,
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(row)

results = ROUND / 'results'
results.mkdir(exist_ok=True)
records_path = results / (batch['batchId'] + '.records.jsonl')
records_path.write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in records))
assert [json.loads(line) for line in records_path.read_text().splitlines()] == records

parameters = {
    'reviewerId': REVIEWER,
    'reviewMode': 'stock_blind_final_input_first_pass',
    'modelIdentityExposedBySession': 'Codex, based on GPT-6',
    'exactModelRevision': None,
    'samplingParametersExposed': False,
    'temperature': None,
    'seed': None,
    'judgmentAuthor': 'this independent reviewer B',
    'peerResultsReadBeforeOwnSeal': False,
    'historicalAuthorityMetadataEncountered': True,
    'historicalJudgmentOutputsFollowed': False,
}
parameters_path = AUDIT / 'generation-parameters.actual-exposure.json'
write_json(parameters_path, parameters)
artifact_roles = ['book_pdf', 'book_model', 'review_prompt', 'review_criteria', 'run_manifest_schema']
artifacts = [{key: artifact[key] for key in ['role', 'digest']} for artifact in bundle['artifacts'] if artifact['role'] in artifact_roles]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': RUN_ID,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': input_data['bundleFingerprint'],
    'bookDigest': input_data['bookDigest'],
    'provider': 'OpenAI',
    'model': 'Codex, based on GPT-6; exact revision not exposed',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + pin(parameters_path)['sha256'],
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': artifacts,
    'startedAt': STARTED,
    'completedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    'status': 'completed',
    'outputDigest': 'sha256:' + pin(records_path)['sha256'],
    'toolchainVersion': 'skillpilot-7f605a0a94d9a65ac093550586e7a124996ba8ec',
}
run_path = results / (batch['batchId'] + '.run.json')
write_json(run_path, run)

canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert pin(canonical_path)['sha256'] == 'a60d2eff467548ef02f93b3a759e1e3bea10306b7876937fa7f038582b0208e4'
canonical = json.loads(canonical_path.read_bytes())
goal_by_id = {g['id']: (index, g) for index, g in enumerate(canonical['goals'])}
selected = [{'jsonPointer': f'/goals/{goal_by_id[gid][0]}', 'goal': goal_by_id[gid][1]} for gid in batch['goalIds']]
selected_path = AUDIT / 'actual-ten-whole-canonical-goals.read-snapshot.json'
write_json(selected_path, {'source': pin(canonical_path), 'goalsInCampaignOrder': selected})
materials_path = NEUTRAL / 'MATERIALS.thirteen-exact-whole-operative-objects.review-only.json'
materials = json.loads(materials_path.read_bytes())
source_path = NEUTRAL / 'SOURCE.selected-three-topics-and-whole-scope-rules.review-only.json'
source = json.loads(source_path.read_bytes())
material_indices = [[0] if False else [] for _ in range(10)]
material_indices = [[], [], [3], [5], [1, 2], [6, 9, 10], [4, 12], [7], [8, 11], [0]]
input_paths = [input_path, batch_path, ROUND / 'description-review-campaign.json', ROUND / 'review-bundle-manifest.json', ROUND / 'prompt.md', ROUND / 'criteria.md', ROUND / 'contracts/goal-description-review-record.schema.json', BUNDLE / 'book-model.json', BUNDLE / 'book.pdf', BUNDLE / 'contracts/goal-evidence-ai-run-manifest.schema.json', NEUTRAL / 'INDEX.actual-whole-materials-and-primary-pages.review-only.json', materials_path, source_path, canonical_path]
read_audit = {
    'reviewerId': REVIEWER,
    'reviewMode': 'stock_blind_final_input_first_pass',
    'finalInputActuallyRead': True,
    'peerResultsReadBeforeOwnSeal': False,
    'priorReviewJudgmentFilesRead': [],
    'rootSynthesesOrPairProofsRead': [],
    'actualModelIdentity': parameters['modelIdentityExposedBySession'],
    'exactModelRevision': None,
    'inputPins': [pin(path) for path in input_paths],
    'nativeRun': pin(run_path),
    'nativeRecords': pin(records_path),
    'wholeCanonicalGoalSnapshot': pin(selected_path),
    'nativeGoalContextRead': [
        {
            'ordinal': ordinal,
            'goalId': goal['goalId'],
            'inputJsonPointer': f'/goals/{ordinal - 1}',
            'actualCanonicalJsonPointer': selected[ordinal - 1]['jsonPointer'],
            'wholeGoalActuallyRead': True,
            'completeDeEnTextAndCurrentPositiveProfileActuallyRead': True,
            'allSuppliedPrerequisiteSuccessorCourseAndSourceContextActuallyRead': True,
            'neutralWholeMaterialEntryIndices': material_indices[ordinal - 1],
            'nativePdfPhysicalPage': ordinal + 2,
            'nativePdfPageActuallyViewed': True,
            'nativePdfPageRaster': pin(AUDIT / 'native-pages' / f'page-{ordinal + 2:02d}.png'),
            'visualizationDigestCopiedFromNativeInput': goal['reviewContext']['page']['visualization']['originalDigest'],
            'decision': records[ordinal - 1]['decision'],
        }
        for ordinal, goal in enumerate(input_data['goals'], 1)
    ],
    'wholeOperativeMaterialsActuallyRead': [
        {'transportEntryIndex': i, 'transportJsonPointer': f'/entries/{i}/wholeMaterial', 'sourceFileAsProvided': e['sourceFile'], 'sourceJsonPointerAsProvided': e['jsonPointer'], 'wholeObjectDigestAsProvided': e['wholeObjectDigest'], 'wholeDeEnTaskGivenSolutionRubricTransferAndScopeRead': True}
        for i, e in enumerate(materials['entries'])
    ],
    'sourceProjectionActuallyRead': {
        'sourceGoalCount': len(source['sourceGoals']),
        'mandatoryTermSetCount': len(source['mandatoryTermSets']),
        'wholeScopeRulesRead': True,
        'paraphrasesRecognizedAsNotVerbatim': True,
        'sourceMappingOrAllJurisdictionsClaim': False,
        'originalSourcePdf': pin(ROOT / 'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'),
        'actualOriginalPagesViewed': [
            {'physicalPageOneBased': page, 'actualPageImage': pin(NEUTRAL / f'HB2022-original-physical-page-{page}.png')}
            for page in [26, 28, 35, 37]
        ],
        'primaryPageObservations': [
            '26: shared and LK carbohydrate blocks distinguished; kit and digital 3D Fischer/wedge use stated; industrial sugar effects evaluated through all three perspectives.',
            '28: fat structure, solubility/consistency, indices, hydrogenation-as-addition and index-based composition/durability appear in separate explicit clauses; optional example experiments not made universal duties.',
            '35: dye content/process requirements and mandatory vocabulary read; chromophore/auxochrome/antiauxochrome are in the topic vocabulary box.',
            '37: specified mandatory common topics, additional LK4.3 and choice of one GK/two LK topics among2.1/2.2/2.3/4.2 retained; no individual learner choice inferred.'
        ],
        'sourceFrameRuleBoundary': 'The supplied whole p15/p21 frame rules were read; their original pages were not separately viewed. The actual original pages viewed are exactly26/28/35/37.',
    },
    'nativePdfRasterization': {
        'tool': 'pdftoppm',
        'arguments': ['-png', '-scale-to', '1800'],
        'allTwelvePhysicalPagesActuallyViewed': True,
        'frontMatterPages': [pin(AUDIT / 'native-pages' / f'page-{page:02d}.png') for page in [1, 2]],
        'observations': 'One complete page per assigned goal, readable native descriptions and relation context; actual embedded learning images inspected. Schematics and symbolic quantities were treated as teaching support, never independent performance or experimental results.'
    },
    'additionalIndependentPrimaryChecks': [
        {'url': 'https://goldbook.iupac.org/terms/view/A00536', 'access': 'Primary IUPAC search result text actually read; direct open subsequently returned internal error', 'boundedFinding': 'IUPAC marks auxochrome obsolete, consistent with the supplied historical convention; no whole competence inferred from the label.'},
        {'url': 'https://iupac.qmul.ac.uk/drawing/stereo.html', 'access': 'Primary IUPAC stereochemical-drawing search result and section text actually read', 'boundedFinding': 'Fischer horizontal-forward/vertical-away convention and the special effect of rotating a Fischer drawing support the distinction between projection and actual model rotation.'},
        {'url': 'https://iupac.qmul.ac.uk/2carb/03.html', 'access': 'Attempted supplied specialist link; web tool returned internal error', 'boundedFinding': 'This link is not claimed as actually read. Complete local model givens, original HB page26 and the separate primary drawing reference were available.'}
    ],
    'incidentalMetadataDisclosure': {
        'encountered': True,
        'locations': ['Current profile wrapper reviewer/reason/status/evidence fields in native input', 'Author material wrappers containing candidate status, historical source paths and whole historical material provenance', 'Current canonical extendedData provenance/acquisition/addendum fields', 'Technical final-generator input index listing earlier evidence paths'],
        'treatment': 'Historical acceptance assertions, E/G labels and review identifiers were not used as scientific evidence or an expected verdict. No referenced reviewer judgment, root synthesis, pair result/proof, old P ledger or historical metadata provenance target was followed. Entire operative teaching objects supplied by the neutral index were read, including their incidental wrappers.',
        'blindnessBoundary': 'Blind to peer native results and underlying prior judgments; supplied operative input itself contains incidental historical authority metadata, so absolute absence of all prior-authority words is not claimed.'
    },
    'limitsAndSeparateMetadataObservations': {
        'humanApproval': False,
        'humanTrial': False,
        'M7Claim': False,
        'allSourceMappingOrCompiledProjectionVerified': False,
        'sourceAndScope': 'The review preserves exact own acquisition/topic/course guards; it does not certify all state source mappings or runtime selection behavior.',
        'resourceLicenseMetadata': 'Six selected resourceLinks still use AI-generated, SkillPilot-curated as their license string (17772924,64b03eff,78621f85,87d8cc68,c21a611c,d786a03c). This is provenance wording rather than a license expression. It is recorded separately and grants no license clearance; no source files were changed.'
    },
    'reviewStatus': 'own_scientific_candidates_complete_pending_stock_validation_and_seal',
}
write_json(AUDIT / 'READ-AUDIT.own-final-native-b.json', read_audit)
print(json.dumps({'nativeRun': pin(run_path), 'nativeRecords': pin(records_path), 'readAudit': pin(AUDIT / 'READ-AUDIT.own-final-native-b.json'), 'goalCount': len(records)}, indent=2))
