# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,re
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;V12=OWN.parent/'chemie-b008-current169-routing-placement-author-v12';assert not(OWN/'author.final.freeze.json').exists()
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
v12freeze=read(V12/'author.final.freeze.json');assert bind(V12/'author.final.freeze.json')['sha256']=='b90bb589b55d6d4ed998d3463e2675d9296d75583b1ee1a31a68881093b74015'
for b in v12freeze['payloads']:assert bind(ROOT/b['path'])==b
receipt=read(V12/'inputs/source-projection.current.receipt.json.bin');scopes=[s for s in receipt['scopes']if s['jurisdiction']=='DE-HE'];kinds=read(V12/'native/chemie.semantic-kinds.current503.author-input.json');families=set(read(V12/'current169-protected-guard-and-field-intents.author.json')['originalNineFamilies']);ids=read(V12/'current169-protected-guard-and-field-intents.author.json')['routineGoalIds'];held=read(V12/'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json');groups=receipt['witnessGroups'];inputs=receipt['inputBindings'];originalHE=[r for r in held['originalWholeDuties']if'/HE/'in r['sourceExtractionPath']or'/DE-HE/'in r['mappingPath']];assert not originalHE
snapshots=[]
for s in scopes:
 p=ROOT/s['path'];snap=OWN/'inputs'/(s['viewId']+'.current.json');snap.parent.mkdir(parents=True,exist_ok=True);snap.write_bytes(p.read_bytes());witnesses=[]
 for n in s['witnessGroupRefs']:
  g=groups[n]
  witnesses.append({'sourceExtractionPath':inputs[g['extractionInput']]['path'],'mappingPath':inputs[g['mappingInput']]['path'],'sourceGoalId':g['sourceGoalId'],'mappedTargetGoalId':g['mappedTargetGoalId'],'coverage':g['coverage'],'profileBasis':g['profileBasis'],'actualGoalIds':g['goalIds']})
 assert not any(w['mappedTargetGoalId']in families for w in witnesses)
 snapshots.append({'scope':{k:s.get(k)for k in['jurisdiction','stage','durationModel','courseProfile']},'viewId':s['viewId'],'currentGoalCount':len(s['goalIds']),'currentViewBinding':bind(p),'exactSnapshotBinding':bind(snap),'allActualCurrentWitnesses':witnesses,'B008ParentWitnessCount':0,'B008CurrentOriginalDuties':0,'newCurrentFacetDutyClaim':False})
policy=ROOT/'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json';decision=next(d for d in read(policy)['decisions']if d['subject']=='Chemie'and d['jurisdiction']=='DE-HE');assert decision['durationModels']==['G9'];sourcePaths=sorted({w['sourceExtractionPath']for s in snapshots for w in s['allActualCurrentWitnesses']}|{w['mappingPath']for s in snapshots for w in s['allActualCurrentWitnesses']})
sourceBindings=[]
for path in sourcePaths:
 p=ROOT/path;out=OWN/'inputs'/(p.name+'.snapshot.bin');out.write_bytes(p.read_bytes());sourceBindings.append({'currentSource':bind(p),'frozenInput':bind(out)})
write(OWN/'actual-he-current-witnesses-missing-process-facets-and-g8-boundary.json',{'role':'Actual bounded current HE source/facet input; author candidates are not new current bindings','createdAtUTC':datetime.now(timezone.utc).isoformat(),'preservedV12Seal':bind(V12/'author.final.freeze.json'),'HECurrentFacets':snapshots,'exactCurrentSourceInputBindings':sourceBindings,'original1646HEObligationCount':0,'currentHEB008ParentWitnessCount':0,'currentHEB008CPV009Count':0,'durationPolicy':bind(policy),'actualHESekIDurationDecision':decision,'HEG8CurrentFacet':'HOLD: current reviewed HE chemistry source/policy is G9 only; no local G8 chemistry primary or extracted G8 source facet is modeled. Do not infer G8 from mathematics or rename G9.','actualPrimaryG9':bind(OWN/'primary/HE-G9.actual.pdf.bin'),'actualPrimaryCurrentSekII':bind(OWN/'primary/HE-SekII-current2026.actual.pdf.bin'),'protectedCurrent169NoChanges':True,'unchanged26DEENGoalBodiesAnd52Cases':True,'strictGain':0,'activeWrites':0})
# Each selection is deliberately only a primary-duty component. HE process tables
# are absent from the current topic-only source extraction, so no current source
# goal ID, mapping review approval or learner target is invented.
sek2=read(ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json');assert not any(re.fullmatch(r'[EKB]\s?\d+',str(g.get('topicCode','')))for g in sek2['sourceGoals'])
contracts=[
 ('upper-theory-based-question-hypothesis',24,['E1','E2','E3'],'Fragen entwickeln und theoriegeleitete Hypothesen aufstellen; der Theoriebezug bleibt verbindlich.'),
 ('upper-hypothesis-investigation',24,['E4','E5'],'Gegebenenfalls Variablenkontrolle; experiment- ODER modellbasierte Planung. Qualitative UND quantitative Durchführung, Protokoll und Auswertung bleiben als ganze E5-Pflicht erhalten; reine Planung erledigt sie nicht.'),
 ('upper-quantitative-hypothesis-data-evaluation',24,['S17','E8'],'Mathematische Anwendung und theoriebezogene Strukturen/Trends/Schlussfolgerungen als echte Teilkomponenten; digitale E6- und fachübergreifende E11-Pflicht separat erhalten.'),
 ('upper-model-use-criticism',24,['E7','E9'],'Geeignete Modelle wählen/anwenden und Grenzen diskutieren; nicht bloß das sichtbare Teilchenbild erkennen.'),
 ('own-inquiry-process-reflection',24,['E10'],'Eigene Ergebnisse und eigenen Erkenntnisprozess reflektieren; nicht auf fremde Ergebnisdeutung beschränken.'),
 ('upper-scientific-validity',26,['E12'],'Konkrete Erkenntnisgrenzen und Gültigkeitskriterien erhalten; keine Behauptung echter Wiederholungsversuche aus einem Kriterientext.'),
 ('upper-source-information',26,['K1','K2'], 'Analoge und digitale Recherche, passende Quellen sowie komplexe Darstellungen; Quellen-/Zitatkennzeichnung K12 auf Seite27 ergänzend als gesonderte Bindung erhalten.'),
 ('upper-source-criticism',26,['K3','K4'],'Aussagenabgleich und Vertrauenswürdigkeit; Intention B4 auf Seite27 erhalten.'),
 ('chemical-representation-transformation',26,['K5','K6','K7','K8','K9'],'Sach-/Adressaten-/Situationsauswahl, Darstellungswechsel, Sprache und Interpretation werden nicht durch bloßes Layout erledigt.'),
 ('chemical-presentation',26,['K11'],'Geeignete analoge UND digitale Medien und tatsächliche Präsentation; nicht eine einzige vorgegebene Medienform als ganze Pflicht ausgeben.'),
 ('upper-source-information',27,['K12'],'Urheberschaft prüfen, Quellen belegen und Zitate kennzeichnen; keine neue Vollabdeckung durch ein einziges Quellenlabel.'),
 ('upper-source-criticism',27,['B2','B4'],'Fachliche Richtigkeit/Vertrauenswürdigkeit sowie Quelle/Darstellung im Zusammenhang mit Autorenintention.'),
 ('upper-scientific-discourse',27,['K13'],'Echter konstruktiver Austausch mit eigenem Standpunkt und begründetem Reflektieren/Korrigieren; kein monologischer Schreibauftrag als Interaktionsleistung.'),
 ('data-validity',27,['B3'],'Angemessenheit, Grenzen und Tragweite von Informationen/Daten; reine Rechenrichtigkeit reicht nicht.'),
 ('criteria-decision',27,['B5','B6','B7'],'Handlungsoptionen nach fachlichen Kriterien abwägen, begründet entscheiden. Berufsfeld-Kompentenzerfordernis B8 bleibt eine gesonderte, hier nicht abgeschlossene Pflicht.'),
 ('upper-chemical-effects-sustainability',28,['B12','B13'],'Historische/aktuelle Auswirkungen und eigenes Handeln aus ökologischer, ökonomischer und sozialer Sicht; Einfluss auf Wissen nicht automatisch aus Wirkung von Wissen ableiten.'),
]
rows=[]
for key,page,codes,scope in contracts:
 p=OWN/'primary'/('HE-SekII-current2026.physical-page-'+str(page).zfill(3)+'.txt');text=p.read_text();normal=re.sub(r'\s+',' ',text)
 for code in codes:assert re.search(r'\b'+code[0]+r'\s*'+code[1:]+r'\s+◼',normal),code
 rows.append({'candidateKey':key,'prospectiveRoutineGoalId':ids[key],'primaryStage':'SekII','courseScope':'HE current general standards; GK/LK course applicability requires an actual extracted operator witness before placement','physicalPrimaryPage':page,'actualPrimaryPageBinding':bind(p),'actualPrimaryText':text,'officialStandardCodes':codes,'componentOperatorContractDe':scope,'currentSourceGoalId':None,'sourceExtractionStatus':'not_present_as_current_extracted_process_goal','prospectiveComponentStatus':'author_candidate_requires_independent_source_extraction_and_placement_review','wholeOriginalDutyClosed':False,'currentFacetTargetAdded':False})
# G9 explicitly describes methods and didactic arrangements, rather than a
# current extracted universal operator table. Preserve that force and stage.
g9contracts=[('lower-chemical-question-hypothesis',6,'Eigenständige Fragen und Naturwissenschaftsweg einschließlich Hypothesenbildung; didaktischen Grundsatz nicht als exakt extrahiertes aktuelles atomisches Source-Ziel ausgeben.'),('lower-independently-planned-hypothesis-investigation',3,'Planen, Durchführen und Auswerten von Schülerexperimenten; eigene gefahrlose Arbeit und methodische Hilfen bleiben Kontext.'),('lower-chemical-data-interpretation',6,'Darstellung und Deutung von Ergebnissen und Grenzen von Aussagen als methodischer Weg; quantitative Spezialanforderungen nicht aus dem generischen Satz erfinden.'),('sek1-source-information',6,'Eigenständige Fragen einschließlich nötiger Informationsbeschaffung; nicht Oberstufen-Urheber-/Autorenintention automatisch hineinlesen.'),('sek1-model-use-criticism',5,'Modelle erklären Teilaspekte und werden erfahrungsbezogen eingeführt; Grenzen nicht verschweigen, das nächste Blatt als echten fortlaufenden Kontext lesen.'),('chemical-presentation',6,'Fachsprachlich/sachlich korrekte Ergebnispräsentation; SekII-Medien- und Theoriepflicht nicht pauschal auf G9 SekI übertragen.')]
for key,page,scope in g9contracts:
 p=OWN/'primary'/('HE-G9.physical-page-'+str(page).zfill(3)+'.txt');rows.append({'candidateKey':key,'prospectiveRoutineGoalId':ids[key],'primaryStage':'SekI','durationModel':'G9','physicalPrimaryPage':page,'actualPrimaryPageBinding':bind(p),'actualPrimaryText':p.read_text(),'officialStandardCodes':[],'componentOperatorContractDe':scope,'sourceForce':'didactic_methods_guidance_not_a_new_extracted_operator_atomic_goal','currentSourceGoalId':None,'prospectiveComponentStatus':'author_candidate_partial_primary_component_only','wholeOriginalDutyClosed':False,'currentFacetTargetAdded':False})
write(OWN/'actual-he-primary-operator-routine-components.author-input.json',{'role':'Genuine whole primary reading and bounded component candidates; no invented current source IDs, approvals or universal mandatory targets','primaryReadingRanges':{'HEG9Physical':[3,4,5,6],'HECurrentSekIIPhysical':[23,24,25,26,27,28]},'actualReadRoutineComponents':rows,'missingCurrentExtractedOperatorFacet':'HOLD before any learner-facing placement or map integration','originalNational1646ObligationsPreserved':True,'all26GoalTextsAnd52MaterialCasesPreserved':True,'newSourceFullApprovalClaims':0,'CPV009ReductionClaims':0,'strictGain':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'actualHEFacets':3,'currentHEParentWitnesses':0,'boundedActuallyReadPrimaryComponents':len(rows),'newCurrentFacetTargets':0,'G8CurrentFacet':'HOLD','strictGain':0}))
