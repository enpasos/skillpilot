import copy,hashlib,json,pathlib,shutil,uuid
OUT=pathlib.Path(__file__).resolve().parent;ROOT=OUT.parents[6];Q=OUT.parent
V3=Q/'wirtschaft-1826-source-scope-and-native34views-AUTHOR-INERT-v3'
CAP=OUT/'native-capsule';OLD=V3/'native-capsule'
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj):
 assert p.is_relative_to(OUT)
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.is_symlink():p.unlink()
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def exactcopy(src,dst):
 assert dst.is_relative_to(OUT)
 dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.is_symlink():dst.unlink()
 shutil.copyfile(src,dst)
ids=load(OUT/'actual-deterministic-new-IDs-and-authoring-contracts.AUTHOR-INERT.json')['ids']
new=load(OUT/'four-whole-ordinary-goals-three-mandatory-one-optional.AUTHOR-INERT.json')['goals']
local=load(OUT/'whole-local-BB-LK-practice-DEEN-material-answer-rubric.AUTHOR-INERT.json')
MONO='1826fe19-4d06-5183-9b41-9121ae1cc219';INFO='a2fa1186-df35-5954-a9a9-e311a55e218f';PUB='df17fd21-e9b7-598f-970e-8f541d059694';EXT='bad728f2-e375-5f98-8f65-511a9e2e6751';CLASS='273809d9-bc31-5c1b-8a58-149dd61d2ba0';E3FD='e3fd58d1-f16a-523c-ad64-7c0b3be5e366';E2='f14dcf9f-66c5-5907-9e06-08f59a9a0e13';LAND='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
inputs={}
def bind(p):inputs[str(p.relative_to(ROOT))]={'sha256':sha(p),'bytes':p.stat().st_size}
for rel in [CAN,REG,'AGENTS.md','app/scripts/config/curriculum-maturity-floor-policy.json','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts']:
 bind(ROOT/rel)
prior=V3/'actual-SEALED-unreviewed-bounded-source-scope-native35views-v3.receipt.json';bind(prior)
assert sha(prior)=='5decd7bb8f175ce127984988e4ae1336ba37de5c83f4d99b9fd12ebcd0aa5ba3'
for row in load(prior)['artifacts']:
 p=ROOT/row['path'];assert sha(p)==row['sha256'].removeprefix('sha256:');bind(p)
# Every parent capsule input remains a source input, hash-only/no science review.
for p in sorted(OLD.rglob('*')):
 rel=p.relative_to(OLD);dst=CAP/rel
 if p.is_symlink() and p.is_dir():
  dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(p.resolve());continue
 if p.is_dir():dst.mkdir(parents=True,exist_ok=True);continue
 if p.is_file():
  bind(p);dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(p)
for rel in ['app/scripts/applicabilityCompiler.ts','app/scripts/memoryCardReviewConfigDiscovery.ts']:
 bind(ROOT/rel);exactcopy(ROOT/rel,CAP/rel)
for p in (OLD/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'):
 exactcopy(p,CAP/p.relative_to(OLD))
canonical=load(V3/'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
by={g['id']:g for g in canonical['goals']}
e3before=copy.deepcopy(by[E3FD]);by[E3FD]['requires'].extend([INFO,PUB]);by[E3FD]['examData']['coveredGoalIds'].extend([INFO,PUB])
assert by[E3FD]['examData']['taskContent']==e3before['examData']['taskContent']
assert by[E3FD]['examData']['solutionContentEn']==e3before['examData']['solutionContentEn']
write(OUT/'whole-E3FD-existing36BE-six-tasks-only-requires-covered-successor.AUTHOR-INERT.json',{'beforeWhole':e3before,'afterWhole':by[E3FD],'allowedChanges':['requires add INFO/PUB','examData.coveredGoalIds add INFO/PUB'],'allOtherWholeFieldsExact':{k:v for k,v in e3before.items() if k not in ['requires','examData']}=={k:v for k,v in by[E3FD].items() if k not in ['requires','examData']},'wholeDEENTasksSolutionsScoringExact':{k:v for k,v in e3before['examData'].items() if k!='coveredGoalIds'}=={k:v for k,v in by[E3FD]['examData'].items() if k!='coveredGoalIds'},'status':'author_bound_role_candidate_not_independent_science_approval'})

# Preserve actual old1826 target learning breadth after reading whole E3FD;
# extensions are authored curriculum choices, not seven-country source clones.
old_target_countries=['DE-BB','DE-BW','DE-BY','DE-HE','DE-NI','DE-NW','DE-TH']
info_source=['DE-BW','DE-HE','DE-NW'];pub_source=['DE-BW','DE-HE','DE-NI','DE-NW']
for gid,sourced in [(INFO,info_source),(PUB,pub_source)]:
 by[gid]['extendedData']['applicabilityOverrides']={'jurisdiction':sorted(set(old_target_countries)-set(sourced))}
 by[gid]['applicability']={'jurisdiction':old_target_countries}

# The three mandatory new atoms are under a genuine source/app boundary.
def cluster(id,title,en,contains,role):
 return {'id':id,'title':title,'titleEn':en,'description':'Gebündelte zusätzliche Leistungen im amtlichen LK-Marktmodell.','descriptionEn':'Additional performances in the official advanced-course market model.','weight':len(contains),'tags':['subject:Wirtschaft','canonical:gymnasium-de','jurisdiction:DE-BB','LK'],'type':'cluster','contains':contains,'requires':[], 'dimensionTags':{'framework':'canonical-gymnasium-economics','phase':'Katalog','courseLevels':['LK']},'applicability':{'jurisdiction':['DE-BB']},'extendedData':{'applicabilityMappingInheritance':'boundary','authorSourceRole':role},'resourceLinks':[]}
mandatory=cluster(ids['mandatory-market-branch'],'Weitere Anbieter- und Diagrammkompetenzen im Marktmodell','Further supplier and diagram skills in the market model',[g['id'] for g in new[:3]],'BB-LK-mandatory-market-price')
optional=cluster(ids['optional-market-steering-branch'],'Gewählte Marktsteuerung im Diagramm','Selected market steering in diagrams',[new[3]['id'],local['id']],'BB-LK-author-selected-original-elective-alternative')
canonical['goals'].extend(new+[mandatory,optional,local])
by[E2]['contains'].extend([mandatory['id'],optional['id']])
assert len(canonical['goals'])==688 and len({g['id'] for g in canonical['goals']})==688

# Whole NI practice contracts are actually read; propose APP ONLY because
# native assessment-requires routing adds NI with no scientific text change.
ni_follow=[]
for gid in ['67204661-44f9-54d4-b901-6271c9d5ff86','bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b']:
 before=copy.deepcopy(by[gid]);by[gid]['applicability']['jurisdiction']=sorted(set(by[gid]['applicability']['jurisdiction'])|{'DE-NI'})
 ni_follow.append({'goalId':gid,'beforeWhole':before,'afterWhole':by[gid],
  'onlyApplicabilityChanged':{k:v for k,v in before.items() if k!='applicability'}=={k:v for k,v in by[gid].items() if k!='applicability'},
  'why':'Native applicabilityFromRequires intersection includes NI after explicit ExistingEXT gA/eA bindings; whole existing material and remaining prerequisites already apply there. No whole normative NI obligation or new practice science acceptance is claimed.',
  'scopeDecision':'Deliberate local practice extension in NI GK/LK; preserves the existing whole practice contract. Canonical source field remains narrower and source strength is not increased.'})
write(OUT/'actual-two-whole-NI-practice-app-only-followup-proposals.AUTHOR-INERT.json',ni_follow)

# Reuse sourcev3 whole99 as history; add two genuinely missing original atoms
# and reuse existing whole g02 as the perfect+imperfect diagram source.
idx=load(V3/'author-file-index.INERT.json');bbpath=next(p for p in idx['files'] if '/source-extraction/DE_BB_' in p);bbmap=next(p for p in idx['files'] if '/mapping/DE-BB/' in p)
sourcebefore=load(CAP/bbpath);s=copy.deepcopy(sourcebefore);mapbefore=load(CAP/bbmap);m=copy.deepcopy(mapbefore)
SOURCELAND='936fa4b0-f550-5b6a-895a-d086a3401c6e';SPID='bb-wirtschaft-sekii:q-lk-market-price-missing-original-performances-p23'
sourceids={k:str(uuid.uuid5(uuid.UUID(SOURCELAND),'official:wirtschaft-2022:printed23:LK-market-price:'+k)) for k in ['criteria-forms-supplier-behaviour','profit-price-differentiation']}
stexts={'criteria-forms-supplier-behaviour':'Märkte anhand verschiedener Kriterien beschreiben, Marktformen charakterisieren und daraus das Verhalten der Anbieter ableiten.','profit-price-differentiation':'Gewinnsteigerungen durch Preisdifferenzierung diskutieren.'}
for k,bullet in [('criteria-forms-supplier-behaviour',1),('profit-price-differentiation',4)]:
 t=stexts[k];s['sourceGoals'].append({'id':sourceids[k],'passageId':SPID,'topicCode':'Q-LK-MARKT-PREIS','bulletIndex':bullet,'aspectIndex':1,'title':'LK Pflichtfeld Markt und Preis: '+t,'description':'Eigene vollständige Leistungsparaphrase des amtlichen LK-Pflichtfelds: '+t,'sourceText':t,'sourceSpan':'Original S.23, Markt und Preis, Leistungsanforderung '+str(bullet),'parentBulletText':t,'sourceRef':'RLP GOST Wirtschaftswissenschaft Berlin-Brandenburg 2022, LK 2. Kurshalbjahr Mikroökonomie, S.22–23; Pflichtfeld Markt und Preis, konkrete Leistung S.23.','courseLevel':'LK','granularity':'officialCompetency','tags':['jurisdiction:DE-BB','subject:Wirtschaft','stage:SekII','topic:Q-LK-MARKT-PREIS'],'rawSourceText':t,'rawSourceSpan':'Original S.23, Markt und Preis, Leistungsanforderung '+str(bullet),'rawParentBulletText':t})
s['passages'].append({'id':SPID,'topicCode':'Q-LK-MARKT-PREIS','title':'LK Pflichtfeld Markt und Preis: zwei bisher fehlende echte Leistungsparaphrasen S.23','text':'(1) '+stexts['criteria-forms-supplier-behaviour']+'\n(4) '+stexts['profit-price-differentiation'],'page':23,'sourcePath':s['sourceDocument']['path'],'rawText':'\n'.join(stexts.values()),'sourceGoalIds':list(sourceids.values())})
POLYSOURCE='bb-wirtschaft-sekii-q-lk-markt-preis-g02-f523769c';OPTSOURCE='bb-wirtschaft-sekii-q-lk-markt-preis-g04-4866b9b4'
routes=[(sourceids['criteria-forms-supplier-behaviour'],new[0]['id']),(sourceids['criteria-forms-supplier-behaviour'],CLASS),(POLYSOURCE,new[1]['id']),(sourceids['profit-price-differentiation'],new[2]['id']),(OPTSOURCE,new[3]['id'])]
for sid,target in routes:
 m['mappings'].append({'legacyGoalId':sid,'canonicalGoalId':target,'matchType':'partial','reviewDecisionId':sid})
for sid in list(sourceids.values()):
 atom=next(g for g in s['sourceGoals'] if g['id']==sid)
 m['decisions'].append({'sourceGoalId':sid,'topicCode':atom['topicCode'],'sourceSpan':atom['sourceSpan'],'decision':'mapped','canonicalGoalIds':[t for p,t in routes if p==sid],'matchType':'partial','rationale':'INERT related-partial source route only; whole original/operator/context and all candidate target contracts require independent qualification. No complete mapping/source gate is asserted.','reviewedAt':'2026-10-10','reviewer':'Codex author candidate, independent review pending'})
for d in m['decisions']:
 if d['sourceGoalId'] in [POLYSOURCE,OPTSOURCE]:
  d['canonicalGoalIds']=[r['canonicalGoalId'] for r in m['mappings'] if r['legacyGoalId']==d['sourceGoalId']];d['rationale']='INERT related-partial with a concrete new diagram performance; perfect/imperfect whole source and selected optional intervention remain independently unqualified.'
for step in s['pipelineStatus']['steps']:
 step['status']='incomplete'
 for check in step['checks']:
  if check['id'] not in ['source-document-present','source-goal-trace-complete']:
   check['passed']=False;check['details']='101 retained/proposed source IDs. The missing original S.23 performances now have concrete INERT source/goal/practice candidates; full original fidelity and whole coverage await independent qualification. Source counts and routing do not complete M2/M3/M7.'
s['qualityReview']['boundedAuthorOpenOriginalCoverage']={'status':'corrective_actual_source_goal_candidates_present_but_not_independently_qualified','originalMandatoryFacets':['criteria/forms/supplier behaviour','perfect+imperfect polypol diagram','profit from price differentiation'],'optionalFacet':'intervention analysis/diagram/evaluation in consciously selected elective','M2M3M7Completed':False}
m['boundedAuthorOpenOriginalCoverage']=s['qualityReview']['boundedAuthorOpenOriginalCoverage'];m['status']='incomplete'
m['summary']['sourceGoals']=101;m['summary']['reviewedSourceGoals']=len(m['decisions']);m['summary']['mappedSourceGoals']=len({r['legacyGoalId'] for r in m['mappings']});m['summary']['partialMappings']=sum(d['matchType']=='partial' for d in m['decisions'])
write(OUT/'whole-BB101-source-candidate.AUTHOR-INERT.json',s);write(OUT/'whole-BB101-mapping-candidate.AUTHOR-INERT.json',m)
write(CAP/bbpath,s);write(CAP/bbmap,m)
write(OUT/'actual-three-whole-primary-source-atoms-and-five-partial-routes.AUTHOR-INERT.json',{'sourceDocument':s['sourceDocument'],'wholeAtoms':[g for g in s['sourceGoals'] if g['id'] in list(sourceids.values())+[POLYSOURCE]],'optionalWholeSource':next(g for g in s['sourceGoals'] if g['id']==OPTSOURCE),'routes':[{'sourceGoalId':sid,'targetWholeGoal':next(g for g in new+[by[CLASS]] if g['id']==target),'strength':'partial','wholeOriginalApproval':False} for sid,target in routes],
 'wholeActualChapterContextsOwnParaphrase':{'printed22':'LK semester2 microeconomics studies individual agents and market coordination; demand includes individual and aggregate demand; mandatory market/prices is separate from the choice market steering OR concentration/competition.','printed23MandatoryPerformances':['describe by various criteria and derive supplier behaviour','represent perfect and imperfect many-supplier markets in price–quantity diagrams','compare/evaluate many-supplier and monopoly supply','discuss differentiated-pricing profit gains','explain price functions for functioning markets'],'printed23OptionalPerformance':'Selected steering: analyse interventions, represent them in price–quantity diagrams, evaluate them.'},'wholePreviousParentBefore':next(p for p in sourcebefore['passages'] if p['id']=='bb-wirtschaft-sekii:q-lk-markt-preis'),'wholeNewSourceParent':next(p for p in s['passages'] if p['id']==SPID),'sourceCountsDoNotProveNormativeCompleteness':True})

vrows=[]
for p in sorted((V3/'view-candidates').glob('*.view.json')):
 v=load(p);country=v['scope'].get('jurisdiction');course=v['scope'].get('courseProfile');changes=[]
 def walk(nodes):
  for n in list(nodes):
   if n.get('goalId')==MONO and n.get('kind')=='goalEntry':
    at=nodes.index(n)+1;role=n.get('projectionRole','target')
    existing={x.get('goalId') for x in nodes}
    for gid in [INFO,PUB]:
     if gid not in existing:
      nodes.insert(at,{'kind':'goalEntry','goalId':gid,'projectionRole':role,'displayLabel':by[gid]['title']});at+=1;changes.append({'goalId':gid,'role':role,'why':'Preserved full old1826 target breadth and real E3FD Task5 all-three prerequisite contract; missing normative facets are deliberate didactic extensions, never country-source proof.'})
   if 'children' in n:walk(n['children'])
 walk(v['rootNodes'])
 if country=='DE-BB' and course=='LK':
  # State view uses explicit references, so the new source-bounded branch is
  # visible exactly here. Keep its old CLASS only for prerequisite checks.
  v['rootNodes'].append({'kind':'structure','id':'bb-lk-real-market-and-price-facets','label':'LK Markt und Preis: ergänzende Pflichtleistungen','children':[{'kind':'canonicalSubtree','goalId':mandatory['id'],'projectionRole':'target'},{'kind':'goalEntry','goalId':CLASS,'projectionRole':'prerequisiteOnly','displayLabel':by[CLASS]['title']}]})
  v['rootNodes'].append({'kind':'structure','id':'bb-lk-selected-market-steering','label':'Bewusst gewählte Wahlalternative Marktsteuerung','children':[{'kind':'canonicalSubtree','goalId':optional['id'],'projectionRole':'target'}]})
  changes.append({'branch':mandatory['id'],'role':'target','why':'Three explicitly missing official compulsory LK S.23 performances; whole source/goal qualification pending.'})
  changes.append({'branch':optional['id'],'role':'target','why':'Deliberate selection of the original market-steering choice for this authored view; not a general mandatory LK source claim.'})
 if country=='DE-NI':
  # Preserve the actual whole-contract practice offer, not a narrower rewrite.
  for row in ni_follow:
   gid=row['goalId'];v['rootNodes'].append({'kind':'goalEntry','goalId':gid,'projectionRole':'target','displayLabel':by[gid]['title']});changes.append({'goalId':gid,'role':'target','why':'Explicit didactic local practice extension after purely native NI applicability gain; no whole NI source obligation claim.'})
 if country is None:
  # Broad national E2 expansion cannot silently turn BB-LK additions into
  # compulsory national/GK/SekI targets. Explicit direct roles win specificity.
  for g in new+[local]:v['rootNodes'].append({'kind':'goalEntry','goalId':g['id'],'projectionRole':'prerequisiteOnly','displayLabel':g['title']})
  for branch in [mandatory,optional]:v['rootNodes'].append({'kind':'canonicalSubtree','goalId':branch['id'],'projectionRole':'prerequisiteOnly'})
  changes.append({'ids':[g['id'] for g in new+[local]],'role':'prerequisiteOnly','why':'Keep only BB-LK authored targets for these source-specific additions; national broad ancestor is not a source obligation.'})
 dest=OUT/'view-candidates'/p.name;write(dest,v);write(CAP/'curricula/DE/Gymnasium/composition-views/wirtschaft'/p.name,v)
 vrows.append({'view':p.name,'scope':v['scope'],'actualAuthoredChanges':changes,'noAutomaticTargetFromRequires':True})
write(OUT/'actual35-whole-view-target-prerequisite-only-authored-decisions.AUTHOR-INERT.json',vrows)
write(OUT/'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',canonical);write(CAP/CAN,canonical)
write(OUT/'actual-bound-inputs.before.READONLY.json',inputs)
print(json.dumps({'wholeCanonicalGoals':len(canonical['goals']),'sourceGoals':len(s['sourceGoals']),'views':len(vrows),'newOrdinary':4,'newPractice':1,'newClusters':2,'boundInputs':len(inputs)}))
