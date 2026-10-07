"""Continue the two-correction candidate without rewriting its actual checked files."""
from pathlib import Path
import copy
import hashlib
import json
from datetime import datetime,timezone

D=Path(__file__).resolve().parent;R=D.parents[6];O=D/'materials-revision-v3';O.mkdir(exist_ok=True)
read=lambda p:json.loads(p.read_text())
def write(p,x):
    with p.open('x')as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

old=read(D/'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json')
material=copy.deepcopy(read(D/'materials-revision-v2/twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json'))
map1=material['goals'][9]['cases'][0]
map1['material']={
 'de':'Eigene schematische Modellkarte, keine reale Verbreitung. Norden oben, Westen links, Osten rechts; alle sechs Zellen gleich groß und mit gleichem Suchaufwand. Gebiets-Raster:\n  N ↑   West     Mitte    Ost\n  Nord    B        B       C\n  Süd     A        A       C\nNachweis-Raster derselben Zellen:\n  Nord    1        2       1\n  Süd     8        7       1\nLegende: Zahlen = Nachweise einer wechselwarmen Eidechsenart im gleichen Erfassungszeitraum, keine vollständigen Bestandszahlen. A = milde Winter, sonnige offene Hänge; B = lange kalte Winter; C = milde Winter, überwiegend geschlossener Wald.',
 'en':'Original schematic model map, not a real distribution. North is up, west left and east right; all six cells have equal area and search effort. Region grid:\n  N ↑   West    Centre    East\n  North   B        B       C\n  South   A        A       C\nRecord grid for the same cells:\n  North   1        2       1\n  South   8        7       1\nLegend: numbers = records of an ectothermic lizard during the same survey period, not complete population counts. A = mild winters, sunny open slopes; B = long cold winters; C = mild winters, mainly closed woodland.'}
map1['task']={
 'de':'Lies mit Orientierung und Legende ab, wo häufige und seltene Nachweise liegen. Deute das räumliche Muster unter Temperatur und Licht/Standort; erkläre, warum Wintertemperatur allein die östliche Spalte nicht erklärt. Begrenze die Aussage der Karte.',
 'en':'Use orientation and the legend to read where records are frequent or rare. Interpret the spatial pattern using temperature and light/site; explain why winter temperature alone does not explain the eastern column. Limit the map inference.'}
map1['modelAnswer']={
 'de':'Häufige Nachweise liegen im Süden in den westlichen/mittleren A-Zellen (8/7); die nördlichen B-Zellen und die ganze östliche C-Spalte haben nur 1–2. A bietet eher günstige Erwärmungs-/Überwinterungsbedingungen; Kälte könnte B begrenzen. C ist mild, aber schattiger und weniger offen, sodass Temperatur allein das Muster nicht erklärt. Nachweisfrequenz bei gleichem Aufwand stützt eine Verbreitungsdeutung, beweist aber weder die Gesamtzahl noch eine Ursache; weitere biotische Faktoren und Ausbreitung bleiben möglich.',
 'en':'Frequent records occur in the southern western/central A cells (8/7); northern B cells and the entire eastern C column have only 1–2. A may offer favourable warming/overwintering conditions; cold may limit B. C is mild but shaded and less open, so temperature alone does not explain the pattern. Matched-effort record frequency supports distribution interpretation, not total counts or causation; biotic factors and dispersal remain possible.'}
map2=material['goals'][9]['cases'][1]
map2['material']={
 'de':'Eigene schematische Modellkarte einer Pflanze P, keine echten Felddaten. Norden oben, Westen links; vier gleich große Zellen. Karte:\n  N ↑       West       Ost\n  Nord       Z:0        ?:?\n  Süd        X:1        Y:0\nLegende: 1 = P nachgewiesen; 0 = bei gleichem Aufwand kein Nachweis; ? = nicht untersucht. X: feuchter Boden, milde Temperatur; Y: trockener Boden, gleiche milde Temperatur; Z: feuchter Boden, niedrige Temperatur. Für die nordöstliche Zelle fehlen Umwelt- und Nachweisdaten.',
 'en':'Original schematic model map of plant P, not actual field data. North is up and west is left; four equal cells. Map:\n  N ↑       West       East\n  North      Z:0        ?:?\n  South      X:1        Y:0\nLegend: 1 = P recorded; 0 = no record with matched effort; ? = not surveyed. X: moist soil, mild temperature; Y: dry soil, the same mild temperature; Z: moist soil, low temperature. Environmental and occurrence data are missing for the northeastern cell.'}
map2['task']={
 'de':'Bestimme anhand Karte und Legende die Lage des Nachweises, die Vergleichszellen für Feuchte und Temperatur sowie die Bedeutung des Fragezeichens. Formuliere eine vereinbare Zwei-Faktoren-Erklärung und eine Alternative. Welche weitere räumliche Erhebung wäre hilfreich?',
 'en':'Use the map and legend to identify the recorded location, comparison cells for moisture and temperature and the meaning of the question mark. Propose a consistent two-factor explanation and an alternative. Which further spatial survey would help?'}
map2['modelAnswer']={
 'de':'P ist nur im Südwesten bei X nachgewiesen. X gegen Y im Südosten vergleicht Feuchte bei gleicher Temperatur; X gegen Z im Nordwesten vergleicht Temperatur bei Feuchte. Die unbekannte Nordostzelle ist nicht als fehlender Nachweis zu zählen. P könnte Feuchte und milde Temperatur benötigen; fehlende Ausbreitung oder Konkurrenz sind Alternativen. Mehr Zellen mit verschiedenen Kombinationen und Wiederholungen wären nötig. Drei untersuchte Zellen belegen keine exakten Toleranzgrenzen oder gezielte Anpassung.',
 'en':'P is recorded only at southwestern X. X versus southeastern Y compares moisture at the same temperature; X versus northwestern Z compares temperature under moist conditions. The unknown northeastern cell must not count as a failed record. P may require moisture and mild temperature; dispersal limitation or competition are alternatives. More cells with varied combinations and repeated surveys are needed. Three surveyed cells establish no exact tolerance limits or directed adaptation.'}

oldNitrogen=copy.deepcopy(material['goals'][14]['cases'][1])
carbon2=material['goals'][14]['cases'][1]
carbon2['material']={
 'de':'Eigener Modellsee: Algen fixieren im Wasser gelöstes CO₂ und werden von Kleintieren gefressen. Algen, Tiere und Destruenten geben durch Zellatmung CO₂ ab. Abgestorbene Reste sinken ins Sediment; ein Teil wird dort zeitweilig gespeichert. Bei Luft-/Wasser-Austausch können CO₂-Moleküle in beide Richtungen gelangen. Kein realer See und keine Messwerte sind behauptet.',
 'en':'Original model lake: algae fix dissolved CO₂ and small animals eat them. Algae, animals and decomposers release CO₂ through respiration. Dead remains sink into sediment where some is stored temporarily. Air–water exchange can move CO₂ molecules in either direction. No actual lake or measurements are claimed.'}
carbon2['task']={
 'de':'Analysiere die Kohlenstoffwege zwischen Wasser, Algen, Tieren, Destruenten, Sediment und Luft; markiere Speicher und Prozesse. Erkläre, warum mehr Algenwachstum allein keine dauerhafte Kohlenstoffspeicherung belegt und welche Fluss-/Speicherdaten eine Nettobilanz benötigt.',
 'en':'Analyze carbon pathways linking water, algae, animals, decomposers, sediment and air; mark stores and processes. Explain why more algal growth alone does not establish lasting carbon storage and which flux/store data a net balance requires.'}
carbon2['modelAnswer']={
 'de':'Gelöstes CO₂ → Fotosynthese/Algenbiomasse → Nahrung/Kleintiere; tote Reste aller Gruppen → Destruenten/Sediment. Zellatmung von Produzenten, Konsumenten und Destruenten führt organischen Kohlenstoff zu CO₂ zurück; Luft und Wasser tauschen CO₂ aus. Sediment ist ein möglicher zeitweiliger Speicher. Mehr Fixierung kann durch Atmung/Austrag kompensiert werden; Nettospeicherung benötigt Aufnahme, Freisetzung, Zu-/Abflüsse und Speicheränderung über denselben Zeitraum. Stoffkreislauf und Energiezufuhr/Wärmeabgabe bleiben getrennt.',
 'en':'Dissolved CO₂ → photosynthesis/algal biomass → feeding/small animals; dead remains from all groups → decomposers/sediment. Respiration by producers, consumers and decomposers returns organic carbon to CO₂; air and water exchange CO₂. Sediment is a possible temporary store. Respiration/export may offset greater fixation; net storage requires uptake, release, imports/exports and store changes over the same period. Matter cycling remains distinct from energy input/heat release.'}
write(O/'conditional-nitrogen-LK-EA-extension.exact-original-material.json',{
 'role':'optional-advanced-course-material-not-shared-required-expectation','goalId':material['goals'][14]['goalId'],
 'originalWholeCase':oldNitrogen,'originalProfileCaseId':oldNitrogen['id'],
 'sourceScopes':[{'jurisdiction':'DE-HE','officialCourse':'Leistungskurs','sourceSection':'Q3.1, erhöhtes Niveau, Stickstoffkreislauf','technicalProfile':'LK'},
                 {'jurisdiction':'DE-BY','officialCourse':'erhöhtes Anforderungsniveau','sourceSection':'B13-EA.4.1, Stickstoffatomkreislauf','technicalProfile':'LK'}],
 'notRequiredInCommonProfile':True,'notApplicableAsGKRequirement':True,'sourceOriginalByteMutation':False,
 'realLearnerEvidence':False,'humanApproval':False,'strictGainClaimed':0})
material['revisionRole']='Four evidenced scientific author corrections; actual independent recheck pending'
write(O/'twenty-whole-goals-forty-complete-DEEN-cases.author-v3.json',material)
md=['# Ökologie: vier belegte fachliche Korrekturen, vollständige 40 DE/EN-Fälle','',
    'KI-Autorkandidaten. Der erste eingefrorene Stand und der tatsächlich geprüfte Zweikorrekturstand bleiben unverändert. Reale Mess-/Bodenleistung bleibt erforderlich; eigene Karten und Tabellen sind explizite Modelle. Das gemeinsame Stoffkreislaufprofil hat zwei Kohlenstofffälle; Stickstoff bleibt eine getrennte optionale HE-LK/BY-EA-Vertiefung. Keine Lernendenleistung oder menschliche Freigabe wird behauptet.','']
for n,item in enumerate(material['goals'],1):
 g=item['wholeGoal'];md += [f'## {n}. {g["title"]} — {g["id"]}','',f'**Ganzes Lernziel DE:** {g["description"]}',f'**Whole goal EN:** {g["descriptionEn"]}','']
 for c in item['cases']:
  md += [f'### {c["id"]}','']
  for key,label in [('material','Material'),('task','Aufgabe / Task'),('modelAnswer','Erwartung / Model answer'),('performanceBoundary','Nachweisgrenze / Evidence boundary')]:
   md += [f'**{label} DE:** {c[key]["de"]}','',f'**{label} EN:** {c[key]["en"]}','']
with(O/'twenty-whole-goals-forty-complete-DEEN-cases.author-v3.md').open('x')as f:f.write('\n'.join(md)+'\n')
candidates=copy.deepcopy(read(D/'materials-revision-v2/P20.current-text-preimage.author-v2.candidates.json'))
candidates['reviewId']='biologie-ecology20-current391-positive-author-material-v3'
candidates['reviewedAt']=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
for index,caseIndices in [(9,[0,1]),(14,[1])]:
 for caseIndex in caseIndices:
  c=material['goals'][index]['cases'][caseIndex];b=candidates['goals'][index]['profile']['applicationCaseBriefs'][caseIndex]
  for lang,suffix in [('de','De'),('en','En')]:
   b['taskDemand'+suffix]=c['material'][lang]+' '+c['task'][lang]
   b['expectedPerformance'+suffix]=c['modelAnswer'][lang]
goal=candidates['goals'][14];profile=goal['profile']
profile['expectations'][0].update(
 essentialUnderstandingDe='Stoffkreisläufe verbinden Reservoirs und biologische/chemische Umwandlungen; im gemeinsamen Kohlenstoffkern sind Atomerhaltung, Stofftransfer und gerichteter Energiefluss zu unterscheiden.',
 essentialUnderstandingEn='Matter cycles connect reservoirs and biological/chemical transformations; the common carbon core distinguishes atom conservation, matter transfer and directional energy flow.')
profile['expectations'][1].update(
 essentialUnderstandingDe='Speicherung und Nettotransfer hängen von Aufnahme, Freisetzung, Transport und Speicheränderung ab; mehr Fotosynthese allein beweist keine dauerhafte Kohlenstoffsenke.',
 essentialUnderstandingEn='Storage and net transfer depend on uptake, release, transport and store changes; more photosynthesis alone establishes no permanent carbon sink.',
 observablePerformanceDe='Analysiert selbstständig einen zweiten Kohlenstoffkreislauf im Gewässer, ordnet alle Reservoirs/Wege ein und begrenzt eine Senkenaussage mit benötigten Bilanzdaten.',
 observablePerformanceEn='Independently analyzes another carbon cycle in water, assigns all reservoirs/pathways and limits a sink claim using the balance data needed.')
profile['variationAxes']=[{'id':'ecology20-15-context-and-mechanism',
 'textDe':'Gemeinsamer Kohlenstoffkern: Land-/Bodenspeicher und bilanzierter Abbau gegenüber Gewässer-/Sediment-/Luftaustausch und bedingter Senkenaussage. Stickstoff ist eine separate optionale HE-LK/BY-EA-Vertiefung.',
 'textEn':'Common carbon core: land/soil stores and balanced decomposition versus water/sediment/air exchange and a conditional sink claim. Nitrogen is a separate optional HE-advanced/BY-higher-level extension.'}]
for brief in profile['applicationCaseBriefs']:
 brief['understandingFocusDe']=profile['expectations'][0]['essentialUnderstandingDe']+' '+profile['expectations'][1]['essentialUnderstandingDe']
 brief['understandingFocusEn']=profile['expectations'][0]['essentialUnderstandingEn']+' '+profile['expectations'][1]['essentialUnderstandingEn']
goal['reason']+=' Gemeinsame Pflicht-Erwartungen und beide unabhängigen Fälle bleiben Kohlenstoff; der unveränderte Stickstofffall ist nur separat für belegtes HE-LK/BY-EA-Material erhalten.'
candidates['goals'][9]['reason']+=' Beide Fälle enthalten nun tatsächliche eigene räumliche Kartenraster mit Orientierung und Legenden, die selbstständig gelesen werden müssen.'
profile10=candidates['goals'][9]['profile']
profile10['expectations'][0]['observablePerformanceDe']='Liest Lage und Nachweismuster einer neuen schematischen Verbreitungskarte mit Orientierung/Legende selbstständig und deutet das räumliche Muster mit mindestens zwei passenden abiotischen Faktoren.'
profile10['expectations'][0]['observablePerformanceEn']='Independently reads locations and record patterns in a new schematic distribution map using orientation/legend and interprets the spatial pattern with at least two suitable abiotic factors.'
write(O/'P20.current-text-preimage.author-v3.candidates.json',candidates)
config=read(D/'materials-revision-v2/P20.current-text-preimage.author-v2.config.json');config['reviewId']=candidates['reviewId'];config['reviewPath']=str((O/'P20.current-text-preimage.author-v3.review.jsonl').relative_to(R));config['scope']['label']='20 unchanged ecology goals, four actual author corrections; final images pending'
write(O/'P20.current-text-preimage.author-v3.config.json',config)
changes=[]
for og,ng in zip(old['goals'],material['goals']):
 assert og['wholeGoal']==ng['wholeGoal']
 for oc,nc in zip(og['cases'],ng['cases']):
  if oc!=nc:changes.append({'goalId':og['goalId'],'caseId':oc['id'],'changedFields':[k for k in oc if oc[k]!=nc[k]]})
assert len(changes)==5
unchangedProfiles=0
for og,ng in zip(read(D/'P20.current-text-preimage.author.candidates.json')['goals'],candidates['goals']):
 unchangedProfiles+=og['profile']==ng['profile']
assert unchangedProfiles==16
write(O/'four-findings-five-case-pairs-and-exact-other35.receipt.json',{
 'role':'actual-scientific-author-corrections-not-independent-approval','scientificFindings':['arachnid-key-boundedness','living-soil-community-versus-dead-substrate','common-carbon-with-conditional-advanced-nitrogen','actual-spatial-map-reading'],
 'changedWholeCasePairs':changes,'exactOtherWholeCasePairs':35,'exactOtherWholeProfiles':16,'wholeGoalChanges':0,
 'sharedProfileRequiredNitrogenExpectation':False,'conditionalOriginalNitrogenMaterialRetained':True,
 'independentCurrentRecheckPending':True,'activeWrites':False,'strictGainClaimed':0})
print(json.dumps({'revisionDirectory':str(O),'scientificFindings':4,'changedCasePairs':5,'unchangedCasePairs':35,'unchangedWholeProfiles':16,'wholeGoalChanges':0},indent=2))
