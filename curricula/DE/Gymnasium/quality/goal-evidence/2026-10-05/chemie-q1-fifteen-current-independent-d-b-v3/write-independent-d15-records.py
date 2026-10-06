# SPDX-License-Identifier: Apache-2.0
import json, hashlib, pathlib, datetime

root=pathlib.Path.cwd()
own=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fifteen-current-independent-d-b-v3'
prep=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-current-native-candidate-v3'
roundb=prep/'native-finalbook/round-b'
campaign=json.loads((roundb/'description-review-campaign.json').read_text())
manifest=json.loads((roundb/'review-bundle-manifest.json').read_text())
batchpath=next((roundb/'batches').glob('*.input.jsonl'))
batch=[json.loads(l) for l in batchpath.read_text().splitlines()]
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()

# Handwritten judgments after reading every exact DE/EN description, actual native
# PDF/HTML page, independent current P evidence and targeted original sources.
# Each tuple is essential DE/EN, observable DE/EN, transfer DE/EN and rationale.
judgments=[
('Eine Carboxygruppe verbindet Carbonyl- und Hydroxygruppe am selben Kohlenstoff; ihr saurer Charakter ist beobachtbar, aber allein kein exklusiver Stoffnachweis.',
 'A carboxyl group has carbonyl and hydroxyl functions on the same carbon; acidic behaviour is observable but is not an exclusive substance identification.',
 'Die lernende Person erkennt COOH in vollständigen und Skelettformeln, schreibt eine homologe Reihe und verknüpft passende Indikatorbeobachtungen mit saurem Verhalten.',
 'The learner identifies COOH in full and skeletal formulas, writes a homologous series and connects suitable indicator observations with acidic behaviour.',
 'Sie unterscheidet bei neuen isomeren Formeln eine Carbonsäure von einem Ester und begründet, warum eine saure Probe ohne Strukturinformation nicht eindeutig zugeordnet ist.',
 'The learner distinguishes a carboxylic acid from an ester in unfamiliar isomeric formulas and explains why an acidic sample alone is not identified uniquely.',
 'KEEP: HE Q1.3 B01A02/A03/A04 trägt Erkennen, Nachweis des sauren Charakters und Struktur-/Reihendarstellung. Das eigene geklärte Wortlautpaket ist eine zusammenhängende Stoffklassen-Erkennung; Nomenklatur- und Eigenschaftsbegleiter bleiben separat. DE/EN stimmen überein. Tatsächliche frische Seite1/PDF3 und HTML zeigen COOH, homologe Reihe und passenden Indikator, ohne Säureexklusivität zu behaupten. Beobachten ersetzt kein bei der Aufgabe tatsächlich verlangtes Experiment.'),
('Die Säurestärke hängt von der Stabilität der konjugierten Base ab; Carboxylat-Mesomerie und induktive Effekte sind unterschiedliche Ursachen.',
 'Acid strength depends on conjugate-base stability; carboxylate resonance and inductive effects are distinct causes.',
 'Die lernende Person vergleicht Alkohol und Carbonsäure, erklärt die beiden Carboxylat-Grenzstrukturen mit einer Gesamtladung und begründet den Einfluss elektronenziehender Substituenten.',
 'The learner compares an alcohol with a carboxylic acid, explains the two carboxylate contributors with one total charge and justifies electron-withdrawing substituent effects.',
 'Sie ordnet neue substituierte Carbonsäuren nach gegebenen Daten und erklärt einen veränderten Substituentenabstand ohne Mesomerie über gesättigte C-Ketten zu erfinden.',
 'The learner ranks unfamiliar substituted acids using supplied data and explains altered substituent distance without inventing resonance through saturated carbon chains.',
 'KEEP: Der eigene Text bewahrt direkte BY C10-NTG.2.7/C10-HG.4.7 Vergleichs-/Begründungsoperatoren und HE Q1.3 B02A01 Polarität, Induktion und Carboxylat-Mesomerie. Das neue tatsächlich sichtbare PNG hat richtige Ladung und Mesomeriepfeil; keine zwei verschieden reagierenden Ionen. Eine quantitative pKa-Herleitung wird nicht zusätzlich verlangt. Voraussetzungen verweisen richtig auf Carboxygruppen-Erkennen, externe Aminosäure-/Derivatziele werden nicht mit abgeschlossen.'),
('Esterbildung verbindet Alkohol und Carbonsäure unter Wasserabspaltung; Polarität und Wasserstoffbrückenfähigkeit begründen die Eigenschaften einfacher Ester.',
 'Ester formation combines an alcohol and a carboxylic acid with elimination of water; polarity and hydrogen-bonding ability explain simple ester properties.',
 'Die lernende Person leitet aus Versuchsbeobachtungen eine Esterbildung ab, formuliert die Kondensation und begründet geeignete Stoffeigenschaften sowie konkrete Anwendungen.',
 'The learner infers ester formation from experimental observations, formulates the condensation and explains suitable properties and concrete uses.',
 'Sie überträgt die Erklärung auf ein neues Alkohol/Säure-Paar und unterscheidet Wasserstoffbrücken-Annahme von einer bei einfachen Estern fehlenden eigenen O-H-Donorgruppe.',
 'The learner applies the explanation to a new alcohol/acid pair and distinguishes hydrogen-bond acceptance from the absent O-H donor group in simple esters.',
 'KEEP: BY C10-NTG.4.1/C10-HG.6.3 und 4.3/6.5 verlangen tatsächlich Versuchsableitung, Wechselwirkungen und Alltags-/Technikeinsatz. Das ist ein verbundenes Ester-Struktur/Eigenschaftsmodell, kein pauschaler Merkkatalog. HE Q1.3 B04A01 ist nur teilweise getragen: Nomenklatur/Strukturrepräsentation und vollständige Estersynthese-Mechanismusroute bleiben ausdrücklich separate SOURCE HOLDs. Die aktuelle eigene Seite ist vollständig und die bestehende korrekt ausgeglichene Kondensationszeichnung passt; diese KEEP-Entscheidung schließt jene Holds nicht.'),
('Saure Esterhydrolyse und Veresterung bilden ein Gleichgewicht; unter alkalischen Bedingungen stabilisiert die Salzbildung den praktisch nicht rücklaufenden Nettoweg.',
 'Acidic ester hydrolysis and esterification form an equilibrium; under alkaline conditions salt formation stabilizes the effectively non-reversing net pathway.',
 'Die lernende Person sagt aus einer Esterstruktur und den Reaktionsbedingungen Produkte voraus, bilanziert Atome/Ladungen und erklärt einen Alltagsfall mithilfe der unterschiedlichen Reversibilität.',
 'The learner predicts products from an ester structure and reaction conditions, balances atoms and charges and explains an everyday case through the different reversibility.',
 'Sie beurteilt einen neuen Ester in saurem oder alkalischem Milieu und korrigiert die Behauptung, jeder Hydrolysepfeil müsse ein Gleichgewichtspfeil sein.',
 'The learner assesses an unfamiliar ester in acidic or alkaline medium and corrects the claim that every hydrolysis arrow must be an equilibrium arrow.',
 'KEEP: HE Q1.3 B05A01 nennt beide Hydrolysearten; BY C10-NTG.4.2 verlangt reversible Esterreaktionen zur Alltagserklärung. Die Formulierung begrenzt Irreversibilität ausdrücklich auf alkalische Bedingungen und praktisch, ohne thermodynamische Universalbehauptung. Das tatsächlich vorhandene JPG zeigt korrekte saure Doppel- und alkalische Einfachpfeile sowie Carboxylat/Alkohol. Das separate LK-Mechanismusziel bleibt abgegrenzt; die neue Kontextbindung von bd36 übernimmt nur diesen geklärten Voraussetzungstitel.'),
('Die alkalische Acylsubstitution läuft über nukleophilen Angriff, eine tetraedrische Zwischenstufe, Abgang der Alkoholatgruppe und Protonenübertragung zum Carboxylat.',
 'Alkaline acyl substitution involves nucleophilic attack, a tetrahedral intermediate, alkoxide departure and proton transfer yielding carboxylate.',
 'Die lernende Person deutet Elektronenbewegungen und Zwischenstufen an einem geeigneten Ester, erhält Ladung/Bindungen und erklärt den Zusammenhang mit der Nettoreaktion.',
 'The learner interprets electron movement and intermediates for a suitable ester, preserves charges and bonds and explains their relation to the net reaction.',
 'Sie überträgt die Acylroute auf einen neuen Ester und findet den Fehler eines Angriffspfeils an der falschen Stelle, ohne andere Reaktionswege universal auszuschließen.',
 'The learner applies the acyl pathway to a new ester and detects an attack arrow at the wrong site without universally excluding other pathways.',
 'KEEP: Das eigene LK-Ziel ist unmittelbar HE Q1.3 B06A01 Mechanistik zugeordnet; die falsche historische Di-/Trisäurebindung wird im aktuellen Quelleingang nicht mehr als Mechanismusbeleg verwendet. Aktuelle Zielseite5/PDF-Physikseite7, HTML und Bild zeigen Carbonylangriff, tetraedrische Zwischenstufe mit negativer O-Ladung und richtiges Carboxylat-Endprodukt. Der Minusstrich ist im tatsächlichen HTML erkennbar; kein belegter Bildfehler. DE/EN sind gleichwertig, die Mechanistik bleibt eine eigene assessable Kompetenz nach dem allgemeinen Hydrolyseziel.'),
('Eine Transesterifizierung tauscht den Alkoholrest eines Esters; stöchiometrisch passende Gleichgewichtsdaten und Stoffmengen bestimmen erreichbare Umsetzung.',
 'Transesterification exchanges an ester alcohol residue; stoichiometrically appropriate equilibrium data and amounts determine attainable conversion.',
 'Die lernende Person plant ein geeignetes Umesterungssystem, bilanziert Restetausch/Produkte und beurteilt Verschiebung oder Zusammensetzung aus gegebenem Gleichgewichtsmodell.',
 'The learner plans a suitable transesterification system, balances residue exchange and products and assesses shift or composition using a supplied equilibrium model.',
 'Sie vergleicht neue Eduktverhältnisse und überträgt das Modell auf Fett/Methanol, ohne Wasserbildung, Seifenbildung oder hundertprozentige Umsetzung als notwendige Folge zu behaupten.',
 'The learner compares new reactant ratios and applies the model to fat and methanol without asserting necessary water, soap or complete conversion.',
 'KEEP: Kurze Formulierung ist durch extern tatsächlich vorhandenes aktuelles P-v2 präzise assessable: Planung plus Gleichgewichtsbeurteilung derselben Umesterung. HE Q2.1 LK Fette: Umesterung, ergänzt Q4-Biodiesel, ist die normative Quelle; die Q1-Buchnavigation behauptet keine zusätzliche HE-Q1-Pflicht. RP Original40 unterscheidet Fundamentum von mechanistischem Additum. Die aktuelle Seite zeigt richtig Ester+neuen Alkohol⇌neuen Ester+alten Alkohol. Mindestanzahl von P-Demonstrationen ist ein Evidenzschema, keine zusätzliche Aufgabenquote oder menschliche Erprobung.'),
('Alkalische Fetthydrolyse erzeugt Glycerin und Fettsäuresalze; Aussalzen trennt bereits gebildete Seife von der wässrigen Phase.',
 'Alkaline fat hydrolysis yields glycerol and fatty-acid salts; salting out separates already formed soap from the aqueous phase.',
 'Die lernende Person führt die freigegebene betreute Herstellung aus, dokumentiert relevante Beobachtungen und erklärt aus den Estergruppen Produkte und die Salztrennung.',
 'The learner carries out the authorized supervised preparation, records relevant observations and explains products and salt separation from ester groups.',
 'Sie überträgt die Bilanz auf ein anderes gegebenes Fett und beurteilt ein fehlerhaftes Protokoll, in dem NaCl erst angeblich das Fett hydrolysiert.',
 'The learner balances a different supplied fat and assesses a faulty procedure claiming that NaCl itself hydrolyses the fat.',
 'KEEP: HE Q1.4 B01A01 Herstellung und BB Original24 Seife herstellen sind reale praktische Operatoren; Text und P behalten tatsächliche Durchführung. Ein Foto, Bild oder bereitgestelltes Protokoll allein beweist diese Leistung nicht; P bleibt needs_human_review/E1/G1. Ein praktischer Herstellungsablauf ist atomar mit Produktdeutung und notwendiger Trennung. Frische native Seite7 zeigt das neue exakt V-geprüfte PNG mit drei Estergruppen, NaOH, Glycerin/3 Fettsäuresalzen und NaCl-Aussalzen, ohne Generatorfreigabe als Prüfung auszugeben.'),
('Amphiphile Seifenteilchen ordnen hydrophile Köpfe zum Wasser und hydrophobe Reste zum unpolaren Bereich; daraus folgen Grenzflächenwirkung und geeignete Aggregate.',
 'Amphiphilic soap particles orient hydrophilic heads toward water and hydrophobic residues toward nonpolar regions, explaining interfacial action and suitable aggregates.',
 'Die lernende Person erklärt Anordnung an Wasser/Luft- und Wasser/Öl-Grenzen, Micellen und Emulgatorwirkung und verbindet die Belegung mit verringerter Oberflächenspannung.',
 'The learner explains arrangements at water/air and water/oil interfaces, micelles and emulsifying action and relates interface coverage to reduced surface tension.',
 'Sie deutet eine neue Grenzflächenzeichnung und begründet bei einem hypothetischen Wasser-in-Öl-System die umgekehrte Orientierung, ohne daraus garantierte Stabilität abzuleiten.',
 'The learner interprets a new interface diagram and explains reversed orientation in a hypothetical water-in-oil system without deriving guaranteed stability.',
 'KEEP: Der neue Text ist das eine Struktur→Anordnungs→Wirkungsmodell aus HE Q1.4 B02A01/B03A01 und BB Original24. Der pH-Teil der ganzen HE-Gruppe bleibt beim separaten Brønsted-Begleiter1c, nicht als neu abgeschlossenes Micellenwissen. Bestehendes V-geprüftes JPG und präziser Alt benennen das Fetttröpfchen als Emulsion; die Profile unterscheiden eine gewöhnliche Micelle von einem größeren emulgierten Tropfen. Keine Größen-/Stabilitätsbehauptung aus der schematischen Zeichnung. Voraussetzung Seifenherstellung und nachfolgende Wasch-/Vergleichsziele sind korrekt gebunden.'),
('Seifen sind Fettsäure-Carboxylatsalze; andere Tensidkopfgruppen führen zu anderen, datenabhängig zu bewertenden Eigenschaften.',
 'Soaps are fatty-acid carboxylate salts; other surfactant head groups produce different properties that must be evaluated using evidence.',
 'Die lernende Person unterscheidet vorgelegte Strukturen und bewertet Vor-/Nachteile mit gegebenen Härte-, pH-, Anwendungs- und Umweltdaten.',
 'The learner distinguishes supplied structures and evaluates advantages and disadvantages using supplied hardness, pH, application and environmental data.',
 'Sie beurteilt ein neues Tensidprofil unter veränderten Bedingungen und begründet, warum modern oder synthetisch nicht automatisch besser oder schlechter bedeutet.',
 'The learner assesses an unfamiliar surfactant profile under changed conditions and explains why modern or synthetic does not automatically mean better or worse.',
 'KEEP: Der genaue Vergleichs-/Bewertungsoperator stammt direkt aus tatsächlichem BY C10-NTG.4.7 HTML. Die kanonische SekI-Kompetenz ist trotz Buchplatzierung nicht eine erfundene HE-Q1-Forderung. BB Original24 unterstützt Struktur, Nachteile und Tensidtypen, während Herstellung synthetischer Tenside beim anderen Ziel bleibt. Das sichtbare bestehende JPG illustriert Carboxylat versus Alkylsulfat korrekt; P nutzt zusätzlich ein Alkylsulfonat als anderes zulässiges Beispiel. Die bedingte Typabhängigkeit wird bewahrt und keine pauschale Umweltbewertung freigegeben.'),
('Waschwirkung hängt vom gegebenen System und kontrollierten Bedingungen ab; Ca/Mg können Seifen-Carboxylate als schwer lösliche Salze entfernen.',
 'Washing action depends on the system and controlled conditions; calcium and magnesium can remove soap carboxylates as poorly soluble salts.',
 'Die lernende Person erklärt den beobachteten Einfluss von Temperatur, Härte oder Tensidkonzentration über Dispergierung/Aggregate und bilanziert eine passende Kalkseifenbildung.',
 'The learner explains observed effects of temperature, hardness or surfactant concentration using dispersion and aggregation and balances suitable soap precipitation.',
 'Sie analysiert neue kontrollierte Waschdaten und trennt Schaummenge, Reinigungswirkung und Stoffverlust, ohne eine universelle Temperatur- oder Konzentrationsregel zu erfinden.',
 'The learner analyses unfamiliar controlled washing data and separates foam, cleaning action and substance loss without inventing universal temperature or concentration rules.',
 'KEEP: HE Q1.4 B03A01 verbindet diese Aspekte tatsächlich als Waschvorgang; BB Original24 bestätigt Micellen, Dispergieren und Härteempfindlichkeit. Geänderter Wortlaut bleibt ein Bedingungen→Waschwirkungsmodell statt drei unabhängigen Verfahren. DE Kalkseifen entspricht EN calcium and magnesium soaps. Das vorhandene tatsächlich aktuelle JPG zeigt richtige 2RCOO−+Ca2+→Ca(RCOO)2-Bilanz; P verlangt Datenkontrolle und keine absolute Schaum-/Temperaturfolgerung. Die Folgeziele Wasserhärte und Abbaubarkeit werden nur im Kontext verlinkt.'),
('Gesamthärte erfasst Ca/Mg; Carbonathärte kann beim Erhitzen vermindert werden, während passende Nichtcarbonatsalze gelöst bleiben und Ionenaustausch die Kationen ersetzt.',
 'Total hardness measures calcium and magnesium; heating can reduce carbonate hardness while suitable noncarbonate salts remain dissolved and ion exchange replaces the cations.',
 'Die lernende Person ordnet gegebene Ionen temporärer/permanenter Härte zu und erklärt ein geeignetes Erhitzungs- oder Ionenaustauschmodell mitsamt verbleibenden Ionen.',
 'The learner classifies supplied ions by temporary or permanent hardness and explains a suitable heating or ion-exchange model including remaining ions.',
 'Sie deutet ein neues gemischtes Hartwasser, erklärt die Resthärte nach Erhitzen und unterscheidet Enthärtung durch Na-Austausch von vollständiger Entsalzung.',
 'The learner interprets unfamiliar mixed hard water, explains remaining hardness after heating and distinguishes sodium ion exchange from complete desalination.',
 'KEEP: HE Q1.4 B04A01 trägt diese LK-Unterscheidung; keine neue quantitative Hochschulmethode. Das korrigierte PNG demonstriert ausdrücklich das calciumbezogene Carbonatbeispiel und nennt Mg nur als Gesamthärtekation bzw. Austauschfall; kein universelles MgCO3-Ausfällungsmodell. Alle angegebenen Ladungen und Pfeile passen zu P. Die tatsächliche aktuelle PDF/HTML-Titelzeile Wasserhärte ist vollständig: historischen Autor-Clipbefund bewahren, hier keinen reproduzierten Clip behaupten. Auswahl und Enthärtung sind Teile desselben Härtemodells.'),
('Der Verlust einer Tensidfunktion ist Primärabbau und beweist noch keinen Endabbau; Endabbau benötigt geeignete mineralisierungs-/assimilationsbezogene Endpunkte und Kontrollen.',
 'Loss of surfactant function is primary degradation and does not establish ultimate biodegradation; ultimate degradation requires suitable mineralisation and assimilation endpoints and controls.',
 'Die lernende Person erläutert, welche beobachteten Endpunkte eine Abbaubarkeitsaussage tragen, und unterscheidet Tensidverlust, Funktionseinbuße und CO2/O2/DOC-Indikatoren.',
 'The learner explains which measured endpoints support a biodegradability claim and distinguishes surfactant loss, lost function and carbon-dioxide, oxygen or DOC indicators.',
 'Sie deutet neue Verlaufsdaten mit Inokulumblindwert und Referenz und begründet, warum Ausgangsstoffverlust oder natürliche Produkte allein keine Umwelt-/Rechtsfreigabe sind.',
 'The learner interprets unfamiliar time-course data with inoculum blanks and a reference and explains why parent loss or natural products alone do not establish environmental or legal clearance.',
 'KEEP: HE Q4.3 B03A01 trägt das Prinzip, B05A01 enthält weitergehende LK-Abbauwege bei separatem c21-Begleiter. Der eigene knappe Text/P schließt keine vollständige Wegmechanistik und keine Rechtsprüfung mit. Das unveränderte Bild führt korrekt Primär-/Endabbau und CO2/H2O/Biomasse auf; Biomasse kennzeichnet Assimilation, nicht die Behauptung, jeder Kohlenstoff sei bereits CO2. Die Diagramm-Bildunterschrift ist vereinfachtes Endabbauschema; aktuelle P-Erwartungen erläutern gerade geeignete Endpunkte. Kein neuer konkreter wissenschaftlicher Bildfehler nach tatsächlicher Seite12/HTML-Sichtung; keine Ersetzung eines gültigen V-Bildes wegen Stil.'),
('Konservierung verändert Bedingungen für Verderb und Mikroorganismen; Hemmung, Abtötung und Vermeidung von Toxinen sind zu unterscheiden.',
 'Preservation changes spoilage and microbial conditions; inhibition, killing and prevention of toxins must be distinguished.',
 'Die lernende Person vergleicht historische und moderne Verfahren nach Wirkprinzip und benennt zu den vorgelegten Fällen passende mikrobiologische oder stoffliche Risiken.',
 'The learner compares historical and modern methods by mode of action and identifies appropriate microbial or chemical risks in supplied cases.',
 'Sie beurteilt neue veränderte Temperatur-, pH-, Wasseraktivitäts- oder Sauerstoffbedingungen und begründet die Grenzen einer Konservierungsbehauptung.',
 'The learner assesses unfamiliar changes in temperature, pH, water activity or oxygen conditions and explains the limits of preservation claims.',
 'KEEP: HE Q1.5 B01A01 fordert Lebensmittelkonservierung früher/heute. Vergleich plus Benennen passender Risiken ist eine verbundene fachliche Vergleichskompetenz. Aktuelle tatsächliche Seite13 und bestehendes JPG zeigen Verfahren/Verderb-/Toxinrisiken ohne falsche Allwirksamkeitsgarantie; P hält Hemmung von Sterilisation getrennt. Das Ziel ist keine private Lebensmittelbehandlungsempfehlung oder rechtliche Freigabe. Die HE-Ascorbin-Qualitativgruppe ist im aktuellen Mapping beim Folgeatom db66 und nicht mehr beim bloßen Konservierungsvergleich.'),
('Ascorbinsäure gibt Elektronen ab und reduziert ein geeignetes Nachweisreagenz; Entfärbung muss mit Kontrollen und möglichen anderen Reduktionsmitteln eingeordnet werden.',
 'Ascorbic acid donates electrons and reduces a suitable test reagent; decolourisation must be interpreted with controls and possible other reductants.',
 'Die lernende Person führt einen geeigneten freigegebenen betreuten qualitativen Versuch aus, dokumentiert Vergleich/Kontrolle und erklärt Reagenzreduktion sowie antioxidative Wirkung.',
 'The learner carries out an appropriate authorized supervised qualitative experiment, records comparison and controls and explains reagent reduction and antioxidant action.',
 'Sie beurteilt einen neuen kontrollierten Probenfall und erklärt, warum ein positives Reduktionssignal ohne Selektivitätsprüfung weder allein Ascorbinsäure identifiziert noch den Gehalt bestimmt.',
 'The learner assesses an unfamiliar controlled sample and explains why a positive reduction signal without selectivity evidence neither uniquely identifies ascorbate nor determines its amount.',
 'KEEP: HE Q1.5 B02A01 verlangt qualitativ Nachweis als Antioxidans; aktuelle Textkorrektur erhält Durchführung und erklärt korrekt Reduktion des Reagenzes statt Oxidation des Nachweisreagenzes. Frische Seite14 zeigt das unabhängig geprüfte PNG mit I2→2I−, Elektronendonator-Ascorbat, Entfärbung und Negativkontrolle. P erhält tatsächliche überwachte Praxis, DCPIP-pH-Farben, Iod-Stöchiometrie und Matrixgrenzen; needs_human_review ist wahrheitsgemäß. Eine quantitative Ascorbin-Bestimmung im LK und Sorbin-/Konservierungsurteile bleiben separate SOURCE HOLDs.'),
('Di- und Tricarbonsäuren besitzen zwei bzw. drei Carboxylgruppen; zusätzliche Hydroxygruppen ändern diese Zählung nicht.',
 'Di- and tricarboxylic acids have two or three carboxyl groups respectively; additional hydroxyl groups do not change this count.',
 'Die lernende Person lokalisiert die COOH-Gruppen in gegebenen Strukturen und stellt geeignete Di-/Tricarbonsäuren in verständlichen Strukturformeln dar.',
 'The learner locates COOH groups in supplied structures and represents suitable di- and tricarboxylic acids with clear structural formulas.',
 'Sie ordnet eine unbekannte polyfunktionelle Struktur nach der Zahl ihrer Carboxylgruppen ein und begründet, warum eine weitere OH-Gruppe keine weitere COOH-Gruppe ist.',
 'The learner classifies an unfamiliar multifunctional structure by its carboxyl groups and explains why an additional OH group is not another COOH group.',
 'KEEP als gezielte Wiederherstellung der Seiten-/Kontextbindung, kein neuer fachlicher Abschluss: exaktes aktuelles Zielobjekt, DE/EN und vorhandenes P/V bleiben unverändert. HE Q1.3 B07A01 nennt Di-/Trisäure-Struktur, das aktuelle Quellenmapping beseitigt die falsche Verbindung zum LK-Hydrolysemechanismus. Tatsächliche Seite15/PDF17 und HTML zeigen unveränderte richtige Oxal-/Citronensäure-Strukturen und nun den korrekten aktuellen667-Hydrolysetitel als Voraussetzung. Ein solcher Navigationslink macht das Strukturziel nicht zu einer Mechanismuskompetenz. Externes bestehendes P wurde nur nativ auf exakte aktuelle Bindung geprüft, nicht nochmals wissenschaftlich neu erfunden.'),
]
assert len(judgments)==len(batch)==15
fields=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
runid='chemie-q1-fifteen-current-independent-d-b-v3-run-001'
rows=[]
for i,(b,j) in enumerate(zip(batch,judgments)):
 g=b['goal'];r={
  '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
  'recordId':'chemie-q1-independent-b-v3-'+g['goalId'],'runId':runid,
  'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
  **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
  'decision':'keep','understandingEvidence':dict(zip(fields,j[:6])),
  'rationale':j[6]+' Das aktuelle native PDF und unveränderte HTML wurden tatsächlich gelesen; externe aktuelle P-v2-Profile wurden ausdrücklich als eigener Eingangsartefakt geliefert, während das Buchfeld evidenceProfile null bleibt. Genaue Quellen-/Bild-/Kontextbindung in den tatsächlichen Begleitreceipts; keine menschliche Freigabe oder Erprobung.',
  'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
 rows.append(r)
results=own/'results';results.mkdir(exist_ok=True)
records=results/(batch[0]['batchId']+'.records.jsonl');records.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in rows))
artifacts=[{'role':a['role'],'digest':a['digest']} for a in manifest['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest','review_input_json','review_input_jsonl','review_prompt','review_criteria']]
artifacts += [{'role':'description_review_batch_input_jsonl','digest':sha(batchpath)}]
supplemental=[]
for role,f in [('external_current_positive_profiles','external-current-positive-profiles.input.jsonl'),('actual_current_source_contexts','fifteen-native-whole-source-contexts.actual.snapshot.json'),('actual_native_pdf_views','native-pdf-raster-and-text.actual.receipt.json'),('actual_native_html_views','native-html.actual.receipt.json'),('actual_atlas_input_bindings','native-atlas-actual-input-bindings.verified.json')]:
 supplemental.append({'role':role,'path':str((own/f).relative_to(root)),'digest':sha(own/f)})
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch[0]['batchId'],'batchInputFingerprint':sha(batchpath),
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI Codex','model':'Codex inherited session model; exact runtime identifier not exposed',
 'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':sha(own/'actual-generation-parameters.json'),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
 'goalIds':[r['goalId'] for r in rows],'inputArtifacts':artifacts,'startedAt':json.loads((own/'actual-review-start.json').read_text())['startedAt'],
 'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':sha(records),'toolchainVersion':'goal-description-review-v2'}
(results/(batch[0]['batchId']+'.run.json')).write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
(own/'supplemental-actual-review-inputs.receipt.json').write_text(json.dumps({'nativeRunId':runid,'nativeRunManifestSHA256':sha(results/(batch[0]['batchId']+'.run.json')),'nativeSchemaRolesPreserved':True,'supplementalInputsActuallyRead':supplemental,'initialManifestRoleValidationFailurePreserved':True,'activeWrites':0},indent=2)+'\n')
(own/'independent-d15-decisions.actual.json').write_text(json.dumps({'authority':'blind_independent_ai_candidate_description_review','rows':[{'goalId':r['goalId'],'decision':r['decision'],'goalFingerprint':r['goalFingerprint'],'pageFingerprint':r['pageFingerprint'],'scope':'existing_valid_scientific_closure_targeted_binding_restore' if i==14 else 'new_current_scientific_description_candidate','rationale':r['rationale']} for i,r in enumerate(rows)],'candidateKeeps':15,'newScientificCandidates':14,'targetedExistingBindingCandidates':1,'strictNetDeltaBeforeIndependentAAndRootIntegration':0,'readDAResults':False,'humanApproval':False,'humanTrial':False,'activeWrites':0},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':len(rows),'keep':len(rows),'activeWrites':0,'strictNetDeltaBeforeIntegration':0}))
