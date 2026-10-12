import json, hashlib, unicodedata, re, copy
from pathlib import Path
from datetime import datetime, timezone

AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-live-context-author-20261012-v2')
OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-independent-a-20261012-v2')
def read(p): return json.loads(Path(p).read_text())
def sha(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def stable(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def write(p,x):
    p=OUT/p; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');read(p)
def lines(p,rows):
    p=OUT/p;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in rows))
    assert len([json.loads(l) for l in p.read_text().splitlines()])==len(rows)
join=read(AUTHOR/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
tuples=join['selected13WholeTuples'];byid={t['goalId']:t for t in tuples}
campaign=read(OUT/'round-a/description-review-campaign.json')
di=read(OUT/'round-a/description-review-input.json')
bundle=read(OUT/'bundle/manifest.json')
now=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
batch=campaign['batches'][0];runid='chemistry-q3-thirteen-v2-review-a-original'

# These are original independent scientific judgments, written after the actual reads.
# No author rationale or peer verdict is used to fill the six evidence fields.
SCIENCE=[
('MWG verbindet die Reaktionsstöchiometrie mit dem Quotienten der Gleichgewichtskonzentrationen; K gehört zur gewählten Gleichung und Temperatur.',
 'Mass action connects reaction stoichiometry with the equilibrium concentration quotient; K belongs to the chosen equation and temperature.',
 'Das MWG mit Potenzen aufstellen, K=4 und Q=2 unterscheiden und eine zulässige Bilanzlösung mit Einsetzprobe erläutern.',
 'Construct the expression with powers, distinguish K=4 from Q=2, and explain an admissible balance solution checked by substitution.',
 'Bei Umkehr der Reaktionsgleichung den Kehrwert von K begründen; geänderte Anfangsmengen allein ändern K nicht.',
 'Explain the reciprocal of K for a reversed equation; changed initial amounts alone do not change K.',
 'Anwenden, Berechnen und Interpretieren sind eine zusammenhängende Gleichgewichtsmethode. Bilinguale Texte stimmen überein. K ist kein Geschwindigkeitsmaß; Zahlenänderung q3-02-b allein gilt nicht als konzeptueller Transfer.'),
('Le Chatelier beschreibt die Neueinstellung eines Gleichgewichts nach einer stofflichen, thermischen oder Volumenänderung; Umsatzanteil und absolute Konzentration sind verschieden.',
 'Le Chatelier describes re-equilibration after species, temperature, or volume changes; conversion fraction and absolute concentration differ.',
 'Gasstöchiometrie und Exothermie auf Synthese und Gaslösung anwenden und die Druckwirkung bei gleichen Gasmolzahlen begrenzen.',
 'Apply gas stoichiometry and exothermicity to synthesis and gas dissolution and bound pressure effects for equal gas mole counts.',
 'Beim Wechsel zu H2+I2⇌2HI erklären, warum isotherme Kompression die Zusammensetzung im idealen Modell nicht verschiebt.',
 'For H2+I2⇌2HI explain why isothermal compression does not shift composition in the ideal model.',
 'Eine Vorhersagekompetenz mit drei sachlich zusammengehörigen Störungsarten. q3-03-b trennt ausdrücklich Konzentration und Umsatzverschiebung. Keine automatische Gleichsetzung schnellerer Einstellung mit höherer Ausbeute.'),
('Quantitative Prozessoptimierung verbindet die Stoffbilanz, Q/K und zulässige Konzentrationen mit einer begrenzten technischen Entscheidung.',
 'Quantitative process optimization connects balance, Q/K and admissible concentrations with a bounded technical decision.',
 'Die beiden Chargen zu x=2/3 und x≈0,7847 lösen; bei Kompression x≈0,2192 und höhere B-Konzentration trotz sinkenden Anteils erklären.',
 'Solve the charges for x=2/3 and x≈0.7847; under compression explain x≈0.2192 and higher B concentration despite lower fraction.',
 'Den Druckeffekt eines Systems mit ungleichen Koeffizientensummen von einem System mit Δν=0 unterscheiden und Kostenbedingungen berücksichtigen.',
 'Distinguish pressure effects for unequal stoichiometric sums from Δν=0 and account for cost conditions.',
 'Rechnung und technisch begrenzte Folgerung dienen einem primären Optimierungsziel. Die berechneten Wurzeln und Stoffmengenanteile sind korrekt. Die vorhandene kleine Bildschrift bleibt ein gesonderter V-Befund.'),
('Technische Nutzung chemischer Gleichgewichte besitzt wirtschaftliche und ökologische Folgen, die anhand geprüfter Angaben bedingt abzuwägen sind.',
 'Technical uses of equilibria have economic and ecological consequences requiring conditional reasoning from checked information.',
 'Synthese/Recycling bzw. exotherme Gaslösung mit Energieaufwand, Investition, Wartung und Folgen materialgestützt erklären.',
 'Explain synthesis/recycling or exothermic gas dissolution with energy demand, investment, maintenance and impacts using supplied material.',
 'Eine geänderte Energieherkunft in die Bewertung einbeziehen, ohne aus weniger Energie automatisch weniger Umweltbelastung abzuleiten.',
 'Account for changed energy sources without inferring lower environmental burden automatically from lower energy demand.',
 'Die aktuelle gesellschaftliche Erläuterung ist eine integrierte Bewertungskompetenz. Die separate Quellenkritik bleibt im ganzen BY-Original und Partner36666 erhalten; sie wird hier weder abgeschafft noch als eigene Zielpflicht benotet.'),
('Eine quantitative Haber-Bosch-Analyse benötigt Koeffizienten als Potenzen, Stoffbilanzen, physikalisch zulässige Konzentrationen und die Trennung von Ausbeute und Kinetik.',
 'Quantitative Haber-Bosch analysis requires coefficients as powers, material balances, physically admissible concentrations and separation of yield from kinetics.',
 'Kc=3,7037 und die halbierte Gleichung rechnen; Bilanzbedingungen und beide mathematischen Wurzeln prüfen und die Prozesskonflikte erklären.',
 'Calculate Kc=3.7037 and the halved equation; check balance conditions and both roots and explain process tradeoffs.',
 'Die Methode auf N2O4⇌2NO2 mit anderer Koeffizientensumme und umgekehrter Anfangsbelegung übertragen.',
 'Transfer the method to N2O4⇌2NO2 with different stoichiometric sums and reverse initial composition.',
 'Ich bewerte dies als eine quantitative Analyse eines Gleichgewichtsprozesses: Potenzen, Wurzelwahl und Prozessinterpretation sind ihre abhängigen Teilschritte. q3-07-c schließt den tatsächlichen quadratischen Bilanzanteil; das ist keine zusätzliche Aufgabenquote. Die Partikeldarstellung hat jedoch einen eigenen V-Fehler.'),
('Bei der Elektrolyse verbindet übertragene Ladung die Elektronenstoffmenge mit Stoffumsatz über z; Stromausbeute und molare Masse wirken verschieden.',
 'In electrolysis charge connects electron amount with conversion through z; current efficiency and molar mass have different roles.',
 'Q=1930 C, n(Cu)≈0,0100016 mol und m≈0,63560 g bestimmen sowie Zeit und Strom invers mit Einheiten rechnen.',
 'Determine Q=1930 C, n(Cu)≈0.0100016 mol and m≈0.63560 g and calculate time and current inversely with units.',
 'Bei Nebenreaktionen erklären, weshalb Q gleich bleibt, während die betrachtete Abscheidung nur 80 Prozent der idealen Menge erreicht.',
 'For side reactions explain why Q stays unchanged while the considered deposit reaches only 80 percent of the ideal amount.',
 'Alle berechneten Größen gehören zu einem Ladungs-Stoffumsatz-Modell. Die qualitative HE-Norm legitimiert keine zusätzliche quantitative HE-Pflicht. q3-09-c ist ein gesonderter Teilbeitrag mit einem begrenzten englischen Formulierungsbefund; der Voltmeterschaltplan ist V-offen.'),
('Elektrische Arbeit ist die zeitlich integrierte Leistung am belasteten Außenkreis; sie ist unter realen Bedingungen nicht pauschal die negative Reaktionsenthalpie.',
 'Electrical work is time-integrated power in the loaded external circuit; under real conditions it is not simply negative reaction enthalpy.',
 'Bei gleichzeitigen konstanten Messwerten P=UI, Q=It und W=UIt bestimmen; Intervalle zu 40 J summieren und 45 J aus ungewichteten Mittelwerten verwerfen.',
 'For simultaneous constant measurements calculate P=UI, Q=It and W=UIt; sum intervals to 40 J and reject 45 J from unweighted means.',
 'Beim offenen Außenkreis trotz messbarer Spannung W=0 begründen und thermodynamische Bezugsportion sowie Verluste beachten.',
 'For an open external circuit explain W=0 despite measurable voltage and respect the thermodynamic reference portion and losses.',
 'Das aktuelle Ziel umfasst eine Messauswertung und ihre Energieinterpretation. Mechanismus und Halbzellen sind bereitgestellter Kontext mit eigenem Partnerf093. Der tatsächlich betrachtete additive PNG-Nachfolger zeigt Last, A in Reihe, V parallel und 33 J korrekt.'),
('Wasserstoff ist ein Energieträger: Erzeugung und Speicherpfad benötigen zugeführte Energie; Kettenwirkungsgrad und nachhaltige Eignung sind unterschiedliche Urteile.',
 'Hydrogen is an energy carrier: production and storage need supplied energy; chain efficiency and sustainable suitability are different judgments.',
 'Physische Druckspeicherung und chemische Bindung unterscheiden, 31,5/28 Prozent bzw. 382,5/414 kWh rechnen und Systemgrenzen begründen.',
 'Distinguish pressure storage from chemical binding, calculate 31.5/28 percent or 382.5/414 kWh and justify system boundaries.',
 'Bei fossilem statt erneuerbarem Strom gleiche Wirkungsgrade von geänderten Emissionsfolgen trennen.',
 'With fossil rather than renewable electricity distinguish unchanged efficiencies from changed emissions.',
 'Erzeugung, Speicherung und Effizienz sind der zusammenhängende Beurteilungsweg eines Energieträgers. Breitere photochemische Wasserstoffnormen werden durch Elektrolysefälle nicht vollständig erfüllt.'),
('Korrosion ist eine gekoppelte lokale Redoxreaktion mit Elektronenleitung im Metall und Ionenleitung im Elektrolyten; Sauerstoff und Protonen sind verschiedene Akzeptoren.',
 'Corrosion is a coupled local redox reaction with electrons in metal and ions in electrolyte; oxygen and protons are different acceptors.',
 'Fe-Oxidation und beide reduzierenden Halbgleichungen bilanzieren, lokale Orte aus Tropfendaten zuordnen und Folgerostbildung unterscheiden.',
 'Balance iron oxidation and both reduction half-equations, assign sites from droplet data and distinguish later rust formation.',
 'Bei entferntem Sauerstoff oder unterbrochenem Metallkontakt das konkrete Lokalelement prüfen, ohne universellen Korrosionsstopp zu behaupten.',
 'With removed oxygen or interrupted metal contact assess the specific local cell without claiming universal cessation of corrosion.',
 'Sauerstoff- und Säurekorrosion sind zwei Bedingungen desselben Donator-Akzeptor-Erklärungsmodells. Beide Sprachen und Ladungs-/Atombilanzen sind korrekt; weitergehende experimentelle Nachweise bleiben eigene Quellenanteile.'),
('Korrosionsschutz kann Transportwege passiv sperren oder das Metall kathodisch schützen; Lebensdauer, Defekte und Verbrauch bestimmen die Bewertung.',
 'Corrosion protection can block transport passively or protect metal cathodically; service life, defects and consumption determine evaluation.',
 'Beschichtung, Cu-Defekt, Zn-Opferwirkung und Elektronen-/Ionenweg erklären und Kosten sowie fehlende Umweltdaten bedingt abwägen.',
 'Explain coating, copper defects, zinc sacrifice and electron/ion paths and weigh costs and missing environmental data conditionally.',
 'Elektrisch isoliertes oder verbrauchtes Zn von noch vorhandener passiver Barrierewirkung unterscheiden.',
 'Distinguish electrically isolated or depleted zinc from remaining passive barrier action.',
 'Mechanismusbegründung und ökologische/ökonomische Bewertung sind ein begründetes Schutzmaßnahmenurteil. Keine absolute Umwelt- oder Wartungsgarantie; Potenzialreihen werden unter expliziten Modellbedingungen benutzt.'),
('Mittlere und momentane Geschwindigkeiten sind Intervall- bzw. lokale Steigungen; Vorzeichen, stöchiometrische Normierung und Volumenbasis bestimmen ihre Bedeutung.',
 'Average and instantaneous rates are interval and local slopes; signs, stoichiometric normalization and volume basis determine meaning.',
 'Aus c(t) Sekante und Tangente mit Faktor2 unterscheiden und Gasvolumenraten in mol/s sowie mol/(L s) unter gegebenem T,p umrechnen.',
 'Distinguish secant and tangent with stoichiometric factor2 and convert gas-volume rates to mol/s and mol/(L s) at supplied T,p.',
 'Für dieselbe Konzentrationskurve bei doppeltem Lösungsvolumen unveränderte Konzentrationsrate und doppelte Stoffmengenrate begründen.',
 'For the same concentration curve at doubled solution volume explain unchanged concentration rate and doubled amount rate.',
 'Darstellungswechsel gehören zur einen Steigungsauswertung. Zahlen und Einheiten stimmen. q3-18-b bleibt eine zusätzliche Zahlenvariation, kein alleiniger konzeptueller Transfer.'),
('Stoffart, Konzentration, Oberfläche und Temperatur beeinflussen erfolgreiche Zusammenstöße auf unterschiedliche Weise; nicht jeder Stoß ist reaktiv.',
 'Species, concentration, surface and temperature affect successful collisions differently; not every collision reacts.',
 'Vier kontrollierte Vergleiche mit Begegnungshäufigkeit, Oberfläche, Energieverteilung und Orientierung/Barriere erklären und falsche Universalregeln korrigieren.',
 'Explain four controlled comparisons through encounter frequency, surface, energy distribution and orientation/barrier and correct false universal rules.',
 'Bei Enzymdenaturierung oder einer dritten Substanz prüfen, welche Modellannahme verändert wurde und welche Schlussfolgerung nicht mehr gilt.',
 'For enzyme denaturation or a third species identify changed assumptions and conclusions that no longer follow.',
 'Vier Einflussfaktoren gehören zu einer qualitativ begründeten kinetischen Modellkompetenz. Druck- und quantitative Quellenanteile wie HB24 werden nicht durch die aktuelle qualitative Vierfaktorenpflicht abgedeckt.'),
('Die Arrhenius-Steigung verknüpft kinetische Geschwindigkeitskonstanten mit einer Aktivierungsenergie unter einem konstanten Mechanismus und Vorfaktor.',
 'The Arrhenius slope connects kinetic rate constants with activation energy under constant mechanism and prefactor.',
 'Aus zwei Temperaturen 55,32 kJ/mol bzw. aus m=-6000 K 49,884 kJ/mol bestimmen und logarithmische Achsen, Einheiten sowie Fitgrenzen erläutern.',
 'Determine 55.32 kJ/mol from two temperatures or 49.884 kJ/mol from m=-6000 K and explain logarithmic axes, units and fit limits.',
 'Beim Vertauschen der Diagrammachsen die Kehrwertsteigung statt -Ea/R benutzen und abweichende Daten ohne erfundene Ursache beurteilen.',
 'For reversed plot axes use the reciprocal slope rather than -Ea/R and assess deviations without inventing a cause.',
 'Das Ziel benennt eine einzelne Ea-Ermittlung. Die optionale RP-Vertiefung wird nicht zur verbindlichen Kursnorm; HB24 trägt keine Arrheniuspflicht. Die Bildbeschriftung Geschwindigkeit(k) benötigt eine V-Korrektur.')
]
assert len(SCIENCE)==13
records=[]
for t,g,s in zip(tuples,di['goals'],SCIENCE):
    assert t['goalId']==g['goalId']
    records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
      'recordId':runid+':'+g['goalId'],'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
      'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],
      **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
      'decision':'keep','understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],s[:6])),
      'rationale':s[6]+' Eigenständiger Review A nach neutralen Originaleingaben, vollständigen DE/EN-Materialien und tatsächlichen Bild-/Seitenansichten. E1/G1, keine menschliche Freigabe und keine Aussage über reale Lernendenleistung.',
      'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
rp=Path('round-a/results')/(batch['batchId']+'.records.jsonl');lines(rp,records)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
     'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
     'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI Codex','model':'GPT-6 inherited Codex session',
     'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':bundle['criteriaFingerprint'],
     'generationParametersFingerprint':sha(stable({'reviewer':'independent-A','blindPeerReads':0,'wholeTuples':13}).encode()),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,
     'goalIds':[t['goalId'] for t in tuples], 'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
     'startedAt':datetime.fromtimestamp((OUT/'round-a/description-review-campaign.json').stat().st_mtime,timezone.utc).isoformat().replace('+00:00','Z'),'completedAt':now,'status':'completed','outputDigest':sha((OUT/rp).read_bytes()),'toolchainVersion':'goal-description-review-v3-normal'}
write(Path('round-a/results')/(batch['batchId']+'.run.json'),run)

def norm(v):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v or ''))).strip()
def amfp(g,rule):
    d=g.get('dimensionTags',{})
    return sha(stable({'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey',''),'title':norm(g['title']),'titleEn':norm(g.get('titleEn')),'description':norm(g['description']),'descriptionEn':norm(g.get('descriptionEn')),'phase':norm(d.get('phase')),'area':norm(d.get('area')),'topicCode':norm(d.get('topicCode')),'nodeKind':norm(g.get('nodeKind'))}).encode())
three=[tuples[i] for i in [3,4,6]]
atomicReasons=[
 'Ein primäres gesellschaftliches Erläuterungs-/Beurteilungsziel: technische, wirtschaftliche und ökologische Aspekte liefern die Kriterien desselben begründeten Urteils. Quellenkritik ist getrennt im Partner36666, kein zweites operatives Ziel.',
 'Ein primärer quantitativer Analyseweg für einen Gleichgewichtsprozess: stöchiometrische Potenzen, Bilanz, physikalische Wurzelwahl und Interpretation arbeiten an derselben Konzentrations-/Prozessfrage. Die vollständige Prozessanalyse dient deren Bedeutung, kein unabhängiges mechanistisches oder historisches Lernziel.',
 'Ein primäres Ermitteln abgegebener elektrischer Arbeit aus belasteten Messdaten samt notwendiger Energieinterpretation. Halbzellenmechanismus ist Voraussetzung/Kontext; ΔH/ΔG-Grenze verhindert falsche Deutung, kein unabhängiges Thermodynamikprogramm.']
memoryReasons=[
 'Das materialgestützte bedingte Urteil verlangt keine zusätzlichen kompakten Merkfakten. Technische, ökonomische und ökologische Bedingungen werden erklärt und angewendet; eigenes SRS wäre eine zweite versteckte Bewertungsschablone.',
 'Stöchiometrie, MWG und quadratische Bilanzlösung werden hergeleitet, gerechnet und interpretiert. Die Zielerweiterung führt keinen zusätzlich zwingend abzurufenden Faktenbestand ein; vorhandene Grundlagen bleiben bei ihren eigenen Zielen.',
 'U/I/t-Messauswertung und Einheitenbegründung bilden eine anwendungsgebundene Methode. Die bereitgestellten thermodynamischen Bezugsdaten brauchen keinen neuen SRS-Pflichtbestand.']
for lane,rule in [('atomicity','semantic-atomicity-v1'),('memory','memory-card-review-v1')]:
    cfg=read(AUTHOR/lane/'three.author.inactive.config.json');cfg['reviewId']='chemistry-q3-thirteen-v2-review-a-'+lane
    cfg['reviewPath']=str(OUT/lane/'three.independent-a.review.jsonl');cfg['scope']['label']='Independent A original three current semantic decisions'
    if lane=='memory':cfg['cardReviewPath']=str(OUT/lane/'three.independent-a.cards.review.jsonl')
    write(Path(lane)/'three.independent-a.config.json',cfg)
    rows=[]
    for i,t in enumerate(three):
        row={'schemaVersion':1,'reviewId':cfg['reviewId'],'ruleVersion':rule,'landscapeId':cfg['landscapeId'],'goalId':t['goalId'],'fingerprint':amfp(t['wholeGoal'],rule),'status':'atomic' if lane=='atomicity' else 'no_memory_needed','reviewedAt':'2026-10-12','reviewer':'Codex-independent-A','reason':atomicReasons[i] if lane=='atomicity' else memoryReasons[i]}
        if lane=='atomicity':row['semanticAtomic']=True
        else:row.update({'memoryUseful':False,'memoryGoalIds':[],'deckIds':[]})
        rows.append(row)
    lines(Path(lane)/'three.independent-a.review.jsonl',rows)
    if lane=='memory':lines(Path(lane)/'three.independent-a.cards.review.jsonl',[])

numericOnly={'q3-02-b','q3-07-b','q3-09-b','q3-13-b','q3-18-b','q3-20-a'}
cases=[]
for t in tuples:
    for c in t['wholeMaterialCases']:
        issues=[]
        if c['caseId']=='q3-09-c-qualitative-contribution':issues=['EN modelResponse says half the Cu amount instead of half as many moles of Cu as of Ag. DE and intended relation are correct; fix this exact bounded English comparison before treating the bilingual supplementary case as clear.']
        cases.append({'caseId':c['caseId'],'goalId':t['goalId'],'inputCaseSha256':sha(stable(c).encode()),'languagesActuallyRead':['de','en'],'fieldsActuallyRead':['material','task','modelResponse','scoring','freshTransfer','evidence'],'numericalAndChemicalResult':'correct' if not issues else 'bounded_English_clarity_revision','scoringPointsSum':sum(r['points'] for r in c['scoring']['criteria']),'transferClassification':'numerical_variation_partial_only' if c['caseId'] in numericOnly else 'meaningful_changed_condition_or_representation','supplementaryQualitativeContributionOnly':c['caseId']=='q3-09-c-qualitative-contribution','issues':issues,'actualExperimentClaim':False,'actualLearnerPerformanceClaim':False})
write(Path('positive')/'whole28.independent-a.case-review.json',{'rows':cases,'count':28,'twoLanguagesRead':True,'modelSolutionsAreSynthetic':True,'noTaskQuotaInvented':True,'wholeHEFaradayQuantitativeScopeApproval':False})
ps=[]
for t,s in zip(tuples,SCIENCE):
    r=copy.deepcopy(t['positiveRecord']);r['reviewId']='chemistry-q3-thirteen-v2-independent-a-positive';r['reviewer']='Codex independent A';r['reviewedAt']=now
    r['reason']=s[6]+' Eigenständige Prüfung des vollständigen P-v2-Profils und aller zugeordneten zweisprachigen Fälle; numerische Zusatzvariationen allein werden nicht als konzeptueller Transfer gezählt. Status bleibt needs_human_review/ai_candidate E1/G1. Der Bildzustand wird separat bewertet.'
    ps.append(r)
lines(Path('positive')/'P13.independent-a.review.jsonl',ps)
pc=read(AUTHOR/'positive/P13.author.inactive.config.json');pc['reviewId']='chemistry-q3-thirteen-v2-independent-a-positive';pc['reviewPath']=str(OUT/'positive/P13.independent-a.review.jsonl');write(Path('positive')/'P13.independent-a.config.json',pc)

visualNotes=[
 'KEEP als vereinfachte MWG-Orientierung: allgemeine Potenzen und das explizite HI-Beispiel K=16 sind korrekt. Produktüberschuss wird auf das angegebene vereinfachte Verhältnis bezogen, keine Aussage zu vollständigem Umsatz.',
 'KEEP: vier klar getrennte Eingriffsarten mit plausiblen Modellgleichungen. Die Hauptlabels sind bei 360 erkennbar; erläuternde Kartentexte werden nicht zum Ersatz des vollständigen Coachtexts.',
 'REVISION: Bei tatsächlichen 360 Pixeln ist die wesentliche Druck-/Qp-Rechnung in den vier Textkarten nur Kleinschrift; es bleibt keine ausreichend erkennbare fachliche Hauptdarstellung. Original/680 sind fachlich richtig. Eine reduzierte visuelle Darstellung mit lesbaren Kernrelationen ist nötig.',
 'KEEP als Kontextorientierung: obere drei Felder erläutern Technik/Wirtschaft/Ökologie; untere Quellenkritik ist sachlich richtig und dem getrennten Partner36666 zugehöriger Kontext. Sie ist kein Nachweis und keine zusätzliche Pflicht dieses aktuellen Ziels.',
 'REVISION: Im Reaktionsbild stehen zwei gezeichnete N2-Paare unter 1x und drei NH3-Symbole unter 2x; nur H2 passt mit drei Symbolen zu 3x. Der ausdrücklich stöchiometrische Vergleich widerspricht der Partikelzahl. Richtige Gleichung und Potenzen heilen die falsche Zeichnung nicht.',
 'REVISION: Der zwischen Elektroden parallel gezeichnete V-Messer wird mit I=2 A und einem Elektronenfluss durch seinen Zweig versehen. Damit wird ein Voltmeter als Strommesspfad dargestellt; keine Serienschaltung eines A-Messers. Die Faraday-Zahlen 7200 C,0,0746 mol,8,05 g sind korrekt, die Messzeichnung ist irreführend.',
 'NEW PNG APPROVED AI: tatsächlich 1672x941 Original sowie360/680 undnativeHTML/PDF betrachtet. Zelle mit +/−, realer Verbraucher, A in Reihe und V parallel zum Verbraucher. Unter gleichzeitigen konstanten Lastdaten gilt1,1·0,5·60=33 J. Chemische→elektrische Energie ist keine Behauptung W=-ΔH; P grenzt ΔH,ΔG und Verluste ausdrücklich ab. Alte JPEG-Freigabe wird nicht übertragen.',
 'KEEP: erneuerbarer Input, richtige Elektrolysegleichung und Polarität, getrennte physische/chemische Speicher und qualitative Effizienz-/Nachhaltigkeitsabwägung. Breitere photochemische Erzeugung ist dadurch nicht abgedeckt.',
 'KEEP: zwei erkennbare Akzeptorbedingungen mit korrekten reduzierenden Halbgleichungen und Elektronenübergang. Rost ist eine schematische Folgedarstellung; P erklärt die weiteren Schritte und beansprucht keine direkte Ein-Schritt-Bildung von reinem Fe2O3.',
 'KEEP: Barriere und Defekt gegenüber Opferanode/Fremdstromschutz unterscheidbar, Elektronenrichtung Zn→Stahl richtig. Kleine Bewertungslabels sind Ergänzung; kein allgemeiner Umweltgesamtsieger.',
 'KEEP: fallende Konzentrationskurve, negative Δc, positive Zeitdifferenz, Sekante/Tangente und positive Verbrauchsgeschwindigkeit konsistent und bei360 erkennbar. V ist keine Messaufgabe.',
 'KEEP: vier Hauptfaktoren mit erkennbaren Teilchen-, Oberflächen- und Bewegungsmotiven; typische kontrollierte Geschwindigkeitsänderungen. Die konkreten P-Fälle begrenzen Universalbehauptungen.',
 'REVISION: Das tatsächlich sichtbare Label Geschwindigkeit(k) setzt k mit Reaktionsgeschwindigkeit gleich. Im Arrhenius-Modell ist k die Geschwindigkeitskonstante; korrekt sind Hauptsteigung m=-Ea/R und Ea=-mR. Ersetze nur den falschen Begriff, erhalte die tragfähige Darstellung.'
]
visual=[]
for i,t in enumerate(tuples):
    image=t['imageKeepBinding'];gid=t['goalId']
    visual.append({'goalId':gid,'imageUrl':image['currentUrl'],'assetSha256':image['currentDigest'],'actualAssetPath':image['currentActualAssetPath'],'decision':'revision_required' if i in [2,4,5,12] else 'approved_ai','rationale':visualNotes[i],'actualPixelsViewed':{'currentOriginal':True,'width360':True,'width680':True,'wholeNativeHtmlPage':True,'wholeNativePdfPage':True},'humanApproval':False,'retainedOldJpegApprovalTransferred':False})
write(Path('visualization')/'thirteen.independent-a.pixel-review.json',{'rows':visual,'currentImages':13,'old96fdJpegSeparatelyViewed':True,'htmlGoalPages':13,'pdfGoalPages':13,'deviceCaptures':26,'humanApproval':False})

sourceRows=read(AUTHOR/'sources/selected13-whole-direct-source-duty-contexts.author.actual.json')['rows']
normRows=[]
for i,r in enumerate(sourceRows):
    g=r.get('wholeSourceGoal') or {};m=r['wholeMappingDecision'];literal=g.get('rawSourceText',g.get('sourceText',m.get('sourceSpan','')))
    normRows.append({'ordinal':i+1,'key':r['key'],'exactNeutralRowSha256':sha(stable(r).encode()),'literalNormClause':literal,'literalNormClauseSha256':sha(literal.encode()),'courseLevel':g.get('courseLevel'),'sourceRef':g.get('sourceRef'),'wholePartnerGoalIds':r['partnerWholeCanonicalGoalIds'],'decision':'retain_literal_scope_and_operators_no_whole_union_approval','sourceOperatorsErased':False,'sourceScopePromoted':False,'actualOperatorExecutionApproval':False})
lines(Path('sources')/'656.literal-norm-rows.independent-a.jsonl',normRows)
sd=read(AUTHOR/'sources/concrete-source-mapping-deltas.author.json')
mappingReason=[
 'BY raw C12-GA.7.5/EA.7.7 couples societal explanation with selecting/checking sources. 882630 and whole36666 separately preserve those duties; two full q3-05 contexts remain usable with the partner. Partial union only.',
 'BY raw C12-GA/EA.8.2 couples spatially separated redox/electron-ion transport with work measurement. f093 supplies the mechanism and96fd the measured work. New BY GA/EA membership is context-compatible; no actual laboratory-performance claim.',
 'HE46 explicitly LK-only unequal coefficient sums and quadratic concentration calculation. c046 plus whole q3-07-c satisfies that quantitative method; simplified20f is not falsely promoted to extended GK.',
 'HE47 explicitly Faraday without calculations. The qualitative case contributes the proportionality/inverse-z concept only. A quantitatively titled full b8 target must not become a mandatory HE scope; keep HOLD.',
 'HE48 further factors are substance,concentration,division;3ce matches qualitative explanation.56bc time-rate work is separately bound, and Q3.5 selection is not guessed.',
 'NW54 genuinely requires chromatographic separation and retention-factor interpretation. Removing unrelated545a is correct; retained broader partners do not become full coverage merely by remaining mapped.',
 'NW SekI water norm genuinely concerns dipole and hydrogen bonding. Removing hydrogen-storage93b is correct; preserve the other partners and their exact own evidence, with whole operator union still open.',
 'HB24 contains reaction-order determination and SN1/SN2 explanation. Removing invented Arrhenius/autocatalysis claims is correct.138 kinetic modeling and a4 SN comparison are bounded partners, not fabricated source-approved full union.',
 'RP50-52 puts Arrhenius under optional deepening/crosslinking after general/advanced units. e62 method is a valid content contribution; unspecified optional scope must await an explicit authored selection decision.'
]
write(Path('sources')/'nine-mapping-five-row.decisions.independent-a.json',{'mappingReviews':[{'sourceGoalId':r['sourceGoalId'],'afterSha256':sha(stable(r['after']).encode()),'decision':'bounded_scientifically_supported_correction','rationale':reason,'fullSourceUnionApproved':False} for r,reason in zip(sd['mappingDeltas'],mappingReason)],'sourceRowReviews':[{'sourceGoalId':r['sourceGoalId'],'afterSha256':sha(stable(r['after']).encode()),'decision':'primary_locator_or_norm_correction_supported','sourceRowReadWhole':True,'inventedRawOperator':False,'note':'HB is explicitly an authored operationalization of two real LK bullets;RP explicitly optional/unspecified;BW printed25 andNW54 are primary verified locators.'} for r in sd['sourceRowDeltas']],'all656LiteralRowsPreservedSeparately':True,'wholeSourceUnionApproved':False,'humanLaboratoryExecutionRequiredForMachineM7':False,'syntheticCasesProveActualExecution':False})

base=read(AUTHOR/'inputs/current523.live-base.exact.de.json');after=read(AUTHOR/'inputs/current523.author-successor.de.json');bg={g['id']:g for g in base['goals']};ag={g['id']:g for g in after['goals']}
retainedM=[json.loads(l) for l in (AUTHOR/'memory/M399.unchanged-records.exact.jsonl').read_text().splitlines()]
assert len(retainedM)==399
write(Path('checks')/'M399-current-semantic-retention.independent-a.json',{'count':399,'rows':[{'goalId':r['goalId'],'reviewRecordExactSha256':sha(stable(r).encode()),'currentFingerprintMatches':amfp(ag[r['goalId']],r['ruleVersion'])==r['fingerprint'],'semanticBodyUnchangedFromLive':bg[r['goalId']]==ag[r['goalId']]} for r in retainedM],'newScientificReviewsOfUnchangedGoals':False})
protected=read(AUTHOR/'checks/parent-history.protected212-B007-all-current-own-bindings.normal.actual.json')
payload=read(AUTHOR/'checks/source-payload-deltas.current-live.actual.json')
views=read(AUTHOR/'checks/parent-history.source-view-deltas.normal.actual.json')
write(Path('checks')/'context-retention.independent-a.json',{'protected212GoalPInputDContextImageExact':all(r['wholeCanonicalGoalExact'] and r['normalPInputExact'] and r['canonicalDContextExact'] and r['existingImageExact'] for r in protected['rows']),'protectedStrictSourceContextIds':payload['currentStrictProtectedSourceContextGoalIds'],'protectedSourceContextCount':12,'compactedPayloadCount':20,'rows':[{'goalId':r['goalId'],'beforeSha256':sha(stable(r['before']).encode()),'afterSha256':sha(stable(r['after']).encode()),'wholePayloadsExamined':True,'decision':'retain_own_unchanged_evidence_and_bounded_current_source_context','fullSourceUnionApproval':False} for r in payload['deltas']],'viewMembershipReviews':[{'scope':r['scope'],'addedGoalIds':r['addedGoalIds'],'removedGoalIds':r['removedGoalIds'],'decision':'supported_bounded_change','rationale':'BY f093 supplies the separately retained galvanic mechanism;HB removal follows actual24 absence of Arrhenius/autocatalysis/extra forms.'} for r in views['changedViews']],'fiveLiveB007ApplicabilityFixesPreserved':all(bg[k].get('applicability')==ag[k].get('applicability') for k in bg),'newFullReviewsOfProtectedUnchangedGoals':False,'noAutomaticUnionApprovalFromRouting':True})

write(Path('review-a.scientific-votes.original.json'),{'role':'genuine_independent_A_original_scientific_votes_before_peer_access','authorFreezeSha256':'sha256:791ed30877369fbc8d20fa0c8d182cfa66974dcbf316e6a0c652b3b3de0c4ee1','goalIds':list(byid),'D':{'keep':13,'recordsPath':str(OUT/rp)},'P':{'wholeProfilesReviewed':13,'reviewPath':str(OUT/'positive/P13.independent-a.review.jsonl'),'wholeCasesReviewed':28,'languages':['de','en'],'supplementaryEnglishClarityFinding':1,'numericOnlyPartialTransfers':sorted(numericOnly)},'A':{'newCurrentDecisions':3,'atomic':3},'M':{'newCurrentDecisions':3,'noMemoryNeeded':3,'unchangedSemanticBindingsRetained':399},'V':{'actualCurrentAssetsViewed':13,'approvedAi':9,'revisionRequired':4,'revisionGoalIds':[t['goalId'] for i,t in enumerate(tuples) if i in [2,4,5,12]],'new96fdPngApprovedAi':True},'sources':{'mappingDecisions':9,'sourceRows':5,'retainedLiteralRows':656,'changedCompactedPayloads':20,'protectedStrictSourceContexts':12,'viewMembershipChanges':3,'wholeSourceUnionApproval':False,'remainingHolds':['HE qualitative Faraday must not impose whole quantitative target','BW experimental temperature/pressure operators','BY hypothesis planning/execution','HB pressure and quantitative factors','broader photochemical H2','RP optional Arrhenius selection','retained broader operator/source unions']},'independence':{'currentPeerPackageReads':0,'authorOpinionReviewFilesRead':0,'blindAtOriginalSeal':True},'claims':{'strictGain':0,'activeIntegration':False,'humanApproval':False,'humanTrial':False,'actualLearnerPerformance':False,'actualExperimentExecution':False}})
print('Original independent A scientific outputs written;13 D,13 P,28 cases,3 A,3 M,13 V,656 literal rows.')
