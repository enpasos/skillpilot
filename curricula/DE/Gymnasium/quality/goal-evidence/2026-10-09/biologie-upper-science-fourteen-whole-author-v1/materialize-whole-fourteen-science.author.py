# SPDX-License-Identifier: Apache-2.0
"""Create own inactive didactic media/profile inputs; ordinary tool fingerprints P."""
import csv,hashlib,json,re,runpy
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
REVIEW='biologie-upper-science-fourteen-whole-author-v1'
STAMP=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
def write(name,obj):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
assert not (OWN/'whole-fourteen-science-author.first.freeze.json').exists(),'Existing first seal is immutable.'
ns=runpy.run_path(OWN/'author-cases-01-to-05.py')
for name in ['author-cases-06-to-10.py','author-cases-11-to-14.py']:
 exec(compile((OWN/name).read_text(),str(OWN/name),'exec'),ns)
specs=ns['SPECS'];assert len(specs)==14
# Only improve typography in our unsealed own bilingual fields, never whole goals.
def readable(x):
 if isinstance(x,dict):return {k:readable(v) for k,v in x.items()}
 if isinstance(x,list):return [readable(v) for v in x]
 if isinstance(x,tuple):return tuple(readable(v) for v in x)
 if not isinstance(x,str):return x
 x=re.sub(r'(?<=[A-Za-zÄÖÜäöüß])(?=\d)',' ',x)
 x=re.sub(r'(?<=\d)(?=[A-Za-zÄÖÜäöüß])',' ',x)
 x=re.sub(r'(?<=[,:;])(?=[A-Za-zÄÖÜäöüß\d])',' ',x)
 return x
specs=readable(specs)
whole=json.loads((OWN/'whole-fourteen-current-goals-source-and-context.input.snapshot.json').read_text())
selected=[e['wholeCurrentGoal'] for e in whole['entries']];ids=[g['id'] for g in selected]
assert len(ids)==14 and len(set(ids))==14
materials=[];pcs=[];coverage=[]
for ordinal,(g,spec) in enumerate(zip(selected,specs),1):
 assert len(spec['cases'])==2 and len(spec['expectations'])==3
 for c in spec['cases']:
  assert len(c['rubric'])==3 and not c['actualLearnerPerformance'] and not c['actualExperimentPerformed']
  for fld in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:
   assert set(c[fld])=={'de','en'} and all(len(c[fld][lang])>60 for lang in ['de','en']),(ordinal,c['caseId'],fld)
 exps=[dict(id=f'essential-{i}',essentialUnderstandingDe=e[0]['de'],essentialUnderstandingEn=e[0]['en'],observablePerformanceDe=e[1]['de'],observablePerformanceEn=e[1]['en']) for i,e in enumerate(spec['expectations'],1)]
 briefs=[]
 for c in spec['cases']:
  briefs.append(dict(id=c['caseId'],taskDemandDe=c['material']['de']+'\n\nAuftrag: '+c['task']['de']+'\n\nFrische Variation: '+c['freshTransfer']['de'],taskDemandEn=c['material']['en']+'\n\nTask: '+c['task']['en']+'\n\nFresh variation: '+c['freshTransfer']['en'],expectedPerformanceDe=c['workedResponse']['de']+'\n\nTransferantwort: '+c['freshTransferWorkedResponse']['de'],expectedPerformanceEn=c['workedResponse']['en']+'\n\nTransfer response: '+c['freshTransferWorkedResponse']['en'],understandingFocusDe=' '.join(e['essentialUnderstandingDe'] for e in exps)+' Rubrik: '+'; '.join(r['de'] for r in c['rubric']),understandingFocusEn=' '.join(e['essentialUnderstandingEn'] for e in exps)+' Rubric: '+'; '.join(r['en'] for r in c['rubric'])))
 profile=dict(archetype=spec['archetype'],expectations=exps,coverageExpectations=dict(requiredExpectationIds=[e['id'] for e in exps],alternativeExpectationGroups=[],minimumIndependentDemonstrations=2,freshVariationRequired=True,independentTransferRequired=True),variationAxes=[dict(id='biological-context',textDe='Verschiedene biologische Sachkontexte: '+spec['cases'][0]['title']+' / '+spec['cases'][1]['title']+'.',textEn='Distinct biological contexts: '+spec['cases'][0]['title']+' / '+spec['cases'][1]['title']+'.'),dict(id='fresh-counterfinding-or-condition',textDe='Jeder Fall enthält eine neue konkret beantwortete Variation von Bedingungen, Belegen oder Verfahren; die Antwort muss ihre Folgerung begründet anpassen.',textEn='Each case contains a worked fresh variation of conditions, evidence or procedure; the response must justify an adapted conclusion.')],applicationCaseBriefs=briefs)
 pcs.append(dict(goalId=g['id'],reason='Whole current DE/EN goal and all operators preserved. Two substantive heterogeneous own bilingual model cases with worked responses, targeted rubrics and fresh transfer. AI candidate only; independent whole science/source/native D/P/V reviews pending.',evidenceLevel='E1',maximumClaimScope='G1',dissent=[],profile=profile))
 materials.append(dict(ordinal=ordinal,goalId=g['id'],wholeCurrentGoal=g,expectations=exps,authoredCases=spec['cases'],modelLimits=spec['limits'],reviewStatus='needs_human_review',reviewAuthority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1',actualLearnerResults=False,actualRealInvestigation=False,independentReviews=[],humanApproval=False))
 coverage.append(dict(goalId=g['id'],wholeGoalDescriptionDe=g['description'],wholeGoalDescriptionEn=g['descriptionEn'],requiredExpectationIds=[e['id'] for e in exps],caseCoverage=[dict(caseId=c['caseId'],expectationIds=[e['id'] for e in exps],evidenceLocations=['workedResponse','freshTransferWorkedResponse','rubric'],role='author-proposed coverage, independently unchecked') for c in spec['cases']],wholeDescriptionUnchanged=True))
write('fourteen-whole-twenty-eight-bilingual-cases.author-candidate.json',dict(schemaVersion=1,reviewId=REVIEW,authoredAt=STAMP,license='CC-BY-4.0',entries=materials,scopeGoalIds=ids,actualLearnerResults=False,independentApproval=False,humanApproval=False))
write('fourteen-whole-expectation-coverage.author-matrix.json',dict(schemaVersion=1,role='whole author-proposed coverage; independent review pending',entries=coverage))
write('fourteen-whole-profile-candidates.author-candidates.json',dict(schemaVersion=1,authoringContract='positive-understanding-evidence-candidates-v1',reviewId=REVIEW,reviewedAt=STAMP,reviewer='Codex actual author; independent science/source-context/native D/P/V reviews pending',goals=pcs))
criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'
(OWN/'input/profile-criteria.original.md').write_bytes((ROOT/criteria).read_bytes())
canon=json.loads((OWN/'input/current-canonical479.original.snapshot.json').read_text())
write('fourteen-whole-positive-understanding.author-candidate.config.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':REVIEW,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':canon['landscapeId'],'landscapePath':REL+'/input/current-canonical479.original.snapshot.json','semanticKindLedgerPath':REL+'/input/current-kinds394.original.snapshot.json','reviewCriteriaPath':REL+'/input/profile-criteria.original.md','reviewPath':REL+'/fourteen-whole-positive-understanding.author-candidate.review.jsonl','reviewRunManifestPaths':[],'reviewedResourceTypes':[],'requireApproved':False,'scope':{'label':'Current whole14 science/inquiry goals: author candidates without actual image/native approvals','goalIds':ids}})
md=['# Ganze 14 Wissenschaftsziele: 28 bilinguale Autorenfälle','','Status: AI-Kandidaten, E1/G1, needs_human_review. Keine unabhängige oder menschliche Freigabe. Alle Datensätze und Schrittprotokolle sind eigene fiktive didaktische Modelle; keine wirklichen Lernenden- oder Versuchsdaten.','']
for m in materials:
 md += [f"## {m['ordinal']}. {m['wholeCurrentGoal']['title']}",'',m['goalId'],'',m['wholeCurrentGoal']['description'],'',m['wholeCurrentGoal']['descriptionEn'],'']
 for c in m['authoredCases']:
  md += [f"### {c['caseId']}: {c['title']}",'']
  for lang in ['de','en']:
   md += ['#### '+lang.upper(),'']
   for fld in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:md += ['**'+fld+'**: '+c[fld][lang],'']
   md += ['**Rubrik**: '+'; '.join(r[lang] for r in c['rubric']),'']
 md += ['**Modellgrenzen**: '+' '.join(m['modelLimits']),'']
(OWN/'whole-fourteen-twenty-eight-cases.author-review.md').write_text('\n'.join(md)+'\n')

# Small own task inputs preserve actual procedural/digital operators; no image substitutes.
media=OWN/'media';media.mkdir(exist_ok=True)
model={'germination':{'label':'Keimung / germination','constants':{'temperature_C':22,'seeds_per_dish':20,'germination_root_mm_minimum':2,'independent_dishes_per_condition':2},'stages':[{'day':0,'dry':[0,0],'moderately_moist':[0,0],'submerged':[0,0]},{'day':2,'dry':[0,1],'moderately_moist':[8,9],'submerged':[2,3]},{'day':4,'dry':[1,1],'moderately_moist':[16,15],'submerged':[5,6]}]},'aquatic_light':{'label':'Licht und Sauerstoff / light and oxygen','constants':{'temperature_C':20,'minutes':10,'independent_setups_per_condition':3,'matching_volume_biomass_initial_oxygen':True},'stages':[{'minute':0,'record':'Record matching initial concentration before exposing endpoints.'},{'minute':10,'low_light_delta_oxygen_mg_per_L':[0.2,0.3,0.1],'medium_light_delta_oxygen_mg_per_L':[0.7,0.8,0.6],'high_light_delta_oxygen_mg_per_L':[0.8,0.9,0.7]},{'disturbance':'not part of the controlled light comparison','temperature_C':28,'high_light_delta_oxygen_mg_per_L':0.4}]}}
write('media/inquiry-finite-model.inputs.json',dict(schemaVersion=1,role='own finite constructed task model; no empirical outcome',scenarios=model,license='CC-BY-4.0',actualInvestigation=False))
html='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Endliche biologische Modelluntersuchung</title><style>body{font:18px system-ui;max-width:54rem;margin:2rem auto;padding:0 1rem;line-height:1.5}button,select{font:inherit;margin:.4rem;padding:.5rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eef5f8;padding:1rem}strong{color:#173b5a}</style><h1>Endliche biologische Modelluntersuchung</h1><p><strong>Eigenes fiktives Aufgabenmodell / own fictitious task model.</strong> Feste konstruierte Ausgaben, kein echter Versuch und kein Lernleistungsnachweis. Variablenkontrolle und Rohdatenprotokoll sind Teil des Auftrags.</p><label for="scenario">Szenario / scenario</label><select id="scenario"><option value="germination">Keimung / germination</option><option value="aquatic_light">Licht und Sauerstoff / light and oxygen</option></select><button id="reset">Ausgangszustand / reset</button><button id="next">Nächster Modellschritt / next model step</button><h2>Bedingungen und Rohkarten / conditions and raw cards</h2><pre id="output" aria-live="polite"></pre><h2>Eigenes Protokoll / own record</h2><textarea id="record" rows="8" style="width:100%;font:inherit" aria-label="Eigenes Modellprotokoll"></textarea><p>Notiere Hypothese, Variablen, Schrittfolge, sämtliche Rohwerte, Einheiten und Abweichungen. Speichern/Übermittlung sind nicht Teil dieses lokalen Aufgabenmediums. / Record hypothesis, variables, steps, all raw values, units and deviations. No storage or transmission is provided.</p><footer>SkillPilot own didactic material · CC-BY-4.0</footer><script>
const MODEL = '''+json.dumps(model,ensure_ascii=False)+''';
let current='germination',step=0;
function render(){const s=MODEL[current];document.getElementById('output').textContent=JSON.stringify({modelOnly:true,scenario:s.label,constants:s.constants,stages:s.stages.slice(0,step+1)},null,2);document.getElementById('next').disabled=step>=s.stages.length-1;}
document.getElementById('scenario').addEventListener('change',event=>{current=event.target.value;step=0;render();});
document.getElementById('reset').addEventListener('click',()=>{step=0;render();});
document.getElementById('next').addEventListener('click',()=>{step=Math.min(step+1,MODEL[current].stages.length-1);render();});
render();
</script></html>'''
(media/'inquiry-finite-model.html').write_text(html)
temperature=[['T1','plant-model-1',0,20,'flach','valid'],['T2','plant-model-1',1,21,'flach','valid'],['T3','plant-model-1',2,22,'leicht_eingerollt','valid'],['T4','plant-model-1',3,'','leicht_eingerollt','missing'],['T5','plant-model-1',4,24,'eingerollt','valid'],['T6','plant-model-1',5,23,'eingerollt','valid']]
seed=[['A'+str(i),'A','A'+str(i),4,s] for i,s in enumerate(['gekeimt','gekeimt','gekeimt','ungekeimt','ungekeimt','unbeurteilbar'],1)]+[['B'+str(i),'B','B'+str(i),4,s] for i,s in enumerate(['gekeimt','gekeimt','ungekeimt','ungekeimt','ungekeimt','unbeurteilbar'],1)]
files=[('temperature-observation.raw-cards.csv',['card_id','plant_id','minute','temperature_C','leaf_state','measurement_status'],temperature),('temperature-observation.recording-template.csv',['card_id','plant_id','minute','temperature_C','leaf_state','measurement_status'],[['']*6 for _ in range(6)]),('seed-observation.raw-cards.csv',['card_id','dish_id','seed_id','day','germination_state'],seed),('seed-observation.recording-template.csv',['card_id','dish_id','seed_id','day','germination_state'],[['']*5 for _ in range(12)])]
for name,header,rows in files:
 with (media/name).open('w',newline='') as f:
  w=csv.writer(f);w.writerow(header);w.writerows(rows)
write('procedural-digital-task-media.neutral-manifest.json',dict(schemaVersion=1,artifactRole='small own executable finite task model and data-recording inputs; no raster image substitutes',entries=[dict(**bind(p),mediaRole='finite interactive task model' if p.suffix=='.html' else 'raw data cards or recording template',license='CC-BY-4.0') for p in sorted(media.iterdir())],goalCaseBindings=[dict(goalId=ids[6],caseIds=['procedure-germination','procedure-aquatic-light'],paths=[REL+'/media/inquiry-finite-model.html',REL+'/media/inquiry-finite-model.inputs.json']),dict(goalId=ids[7],caseIds=['digital-temperature','digital-germination'],paths=[REL+'/media/'+name for name,_,_ in files])],categoryDefinitions={'leaf_state':{'flach':'flat','leicht_eingerollt':'slightly rolled','eingerollt':'rolled'},'germination_state':{'gekeimt':'root at least 2 mm / germinated','ungekeimt':'criterion not met / not germinated','unbeurteilbar':'obscured view / unassessable'}},actualLearnerPerformance=False,actualExperimentPerformed=False,noNetworkOrPersistentDataStorage=True))

# Full unchanged original official clauses remain reachable through genuine retrieval bindings.
primary=json.loads((OWN/'existing-four-whole-official-primary-bindings.author.json').read_text())
sourceRows=[]
for e in whole['entries']:
 sg=e['wholeSourceGoal'];sourceRows.append(dict(goalId=e['goalId'],wholeGoalDescriptionDe=e['wholeCurrentGoal']['description'],wholeGoalDescriptionEn=e['wholeCurrentGoal']['descriptionEn'],sourceGoalId=sg['id'],wholePrimarySourceClause=sg['parentBulletText'],operativeSourceSpan=sg['sourceSpan'],ordinarySourceCourseLevel=sg['courseLevel'],wholeSourceOccurrences=sg.get('sourceOccurrences',[]),wholeSourcePassage=e['wholeSourcePassage'],operatorRetention='whole current operator set unchanged; cases propose evidence rather than narrow scope',authorScopeNote='Bavarian SekII B12 competence clause retained with existing course/source occurrence metadata; whole GA/EA12/13 originals bound separately. No claim of new full-region or independent source approval.',primaryBindingsEntryPath=REL+'/existing-four-whole-official-primary-bindings.author.json',independentSourceReviewPending=True))
write('fourteen-whole-original-source-context.neutral-input.json',dict(schemaVersion=1,entries=sourceRows,existingPrimaryBindings=primary['entries'],independentApproval=False,humanApproval=False,activeSourceWrites=[]))
write('author-science-materialization.actual-receipt.json',dict(schemaVersion=1,createdAt=STAMP,wholeGoals=14,bilingualCases=28,languageCaseBodies=56,profileCandidates=14,currentCanonicalNodes=whole['currentCanonicalNodes'],currentCurricularAtoms=whole['currentCurricularAtoms'],unchangedWholeDescriptions=True,unchangedSourceSemantics=True,existingAtomicityMemoryReuseOnly=True,newScientificClosures=0,restoredBindings=0,netStrictGain=0,actualIndependentReviewCount=0,actualHumanReviewCount=0,activeWrites=[]))
print(json.dumps({'wholeGoals':14,'bilingualCases':28,'media':len(list(media.iterdir())),'config':REL+'/fourteen-whole-positive-understanding.author-candidate.config.json','candidateSpec':REL+'/fourteen-whole-profile-candidates.author-candidates.json'}))
