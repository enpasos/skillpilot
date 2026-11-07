import json,pathlib,uuid,copy,hashlib,os
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');F=W/'frozen';C=W/'candidate';A=json.loads((W/'shared-author-input.json').read_text());contract=A['contracts'];OWNER='7d51b38c-a149-5407-bddc-d2ce7878b020';log=[]
def load(n):return json.loads((C/n).read_text())
def save(n,d):
 p=C/n;p.parent.mkdir(exist_ok=True,parents=True);raw=(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode();t=p.with_name(p.name+'.private-new');t.write_bytes(raw);os.replace(t,p);log.append({'path':n,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';d=load(path);g={x['id']:x for x in d['goals']};old=copy.deepcopy(d);oldg=copy.deepcopy(g)
# Snapshot every exact old goal and all pre-growth cluster expansions already bound by authorinput.
for exam in A['oldClusterExams']:
 g[exam]['examData']['coveredGoalIds']=A['oldClusterExams'][exam]['preGrowthAtomicExpansion']
# Historical bundle remains full23, but its preparation must not grow with source cluster.
practice=g['010651ba-ddd0-510b-8ed1-e3610031f6e1'];practice['requires']=A['oldClusterExams']['269a561b-f12e-57b2-9b05-e20f58c9dcf6']['preGrowthAtomicExpansion']
# Actual content reparenting and honest preparation placement, with original texts/IDs retained.
g['900065ef-d3ae-5145-b92c-50821795107a']['contains'].remove('875cb53c-b48d-5b2b-8cb0-e20f27534f16')
g['31026f4a-629b-571f-b45d-a87f47a09d9e']['contains'].append('875cb53c-b48d-5b2b-8cb0-e20f27534f16')
g['875cb53c-b48d-5b2b-8cb0-e20f27534f16']['requires']=['7ad8caf0-3a31-56f1-bee1-574c01b0c156']
for i in ['875cb53c-b48d-5b2b-8cb0-e20f27534f16',practice['id'],*practice['contains']]:
 g[i]['phase']='Q3';g[i]['dimensionTags']['phase']='Q3';g[i].setdefault('extendedData',{})['placementRevision']={'status':'author-draft','reason':'Preserved Q2 historical bundle contains hierarchy/parallelism automata performance; actual preparation follows Q3 automata foundation. Original Q2 titles/descriptions remain in historical meaning record.','sourceContract':'informatics-q2-full-context-scope-repair-analysis/implementation-plan.json#step4'}
# Four genuinely new performances, no aliases or stored result copies.
sourceidmap={}
for x in contract['newOrdinaryGoals']:
 i=x['id'];assert i not in g
 sourceid=str(uuid.uuid5(uuid.UUID('c1a02ddd-736d-4975-920b-18b03aff147f'),'primary-repair-2026-11-07:'+x['key']));sourceidmap[i]=sourceid
 n={k:copy.deepcopy(x[k])for k in ['id','type','title','description','tags','contains','requires','phase']};n.update(weight=1,titleEn={'er-weak-entities':'Model weak entity types','er-multivalued-attributes':'Map multivalued attributes to relations','er-isa':'Model is-a relationships','sql-execute-no-result':'Execute SQL without a result set'}[x['key']],descriptionEn={'er-weak-entities':'The learner can model a weak entity type with an identifying relationship and partial key and represent its identification in a relational schema.','er-multivalued-attributes':'The learner can identify multivalued attributes and translate them with their associated keys into a relational schema.','er-isa':'The learner can model an is-a relationship and represent its key relationship in a consistent relational schema.','sql-execute-no-result':'The learner can execute a supplied parameterized SQL statement without a result set from a program and verify the data change.'}[x['key']],dimensionTags={'framework':'canonical-gymnasium-informatics','phase':'Q2','demandLevel':'AB2'},extendedData={'provenance':{'sourceLandscapeId':'c1a02ddd-736d-4975-920b-18b03aff147f','sourceGoalId':sourceid,'primarySourceId':x['sourceId'],'sourceLimit':x['sourceLimit']},'authorReviewStatus':'draft'})
 d['goals'].append(n);g[i]=n
 erparent='900065ef-d3ae-5145-b92c-50821795107a' if x['sourceId']=='HE-Q2.1-basic' else '8928f08e-6d5a-5dca-95c8-05519951ff04';g[erparent]['contains'].append(i)
r=contract['proposedExistingPreparationRepair'];assert g[r['goalId']]['requires']==r['before'];g[r['goalId']]['requires']=r['after']
# Only the state-independent own offer can be registered in current cohort-free learner model.
for exam in contract['newExams']:
 if exam['scope'].get('jurisdiction'):continue
 n={k:copy.deepcopy(exam[k])for k in ['id','title','tags','contains','requires','phase','examData']};n.update(type='atomic',weight=1,description='Die lernende Person kann die zwanzig ausdrücklich ausgewählten Kompetenzen des eigenen studienorientierten SkillPilot-Datenbankangebots in konkreten Fällen anwenden. Kein amtlicher bundesweiter Pflichtlehrplan.',dimensionTags={'framework':'canonical-gymnasium-informatics','phase':'Q2','demandLevel':'AB3'},extendedData={'authorReviewStatus':'draft','offeringPurpose':'Own finite study-oriented offering without state filter','routeTerminal':True})
 d['goals'].append(n);g[n['id']]=n
cluster={k:copy.deepcopy(contract['dedicatedNewPracticeCluster'][k])for k in ['id','type','title','requires']};cluster.update(description='Getrennte Anwendungsprüfung des ausdrücklich gewählten SkillPilot-Grundangebots.',contains=['6ebc2a67-ea20-5c4e-8a63-635f40438d6a'],weight=1,tags=['GK','Practice'],dimensionTags={'framework':'canonical-gymnasium-informatics','phase':'Q2'},extendedData={'authorReviewStatus':'draft'})
d['goals'].append(cluster);g[cluster['id']]=cluster;g['29ec47db-7dfe-553d-b850-40e06f164545']['contains'].append(cluster['id'])
# Register explicit finite own-basic targets; other phases stay present without new approval.
vpath='curricula/DE/Gymnasium/composition-views/informatik/de-de-gym-informatics-gk.view.json';v=load(vpath);own=contract['newExams'][1]
def walk(nodes):
 for k,node in enumerate(nodes):
  if node.get('goalId')=='b7acdaa9-4d14-5ec4-9048-8c969f8252cc':nodes[k]={'kind':'structure','id':'informatics-q2-own-basic','label':'Datenbanken und Datennutzung – eigenes Studienangebot','children':[{'kind':'goalEntry','goalId':i}for i in own['examData']['coveredGoalIds']]}
  elif node.get('goalId')==practice['id']:nodes[k]={'kind':'goalEntry','goalId':own['id'],'displayLabel':own['title']}
  elif 'children'in node:walk(node['children'])
walk(v['rootNodes']);save(vpath,v)
# Exact provenance registry membership for new goals. Pure author proposal does not fabricate a reviewed source pass.
p='curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json';reg=load(p);entry=next((x for x in reg['landscapes'] if x['landscapeId']==OWNER),None)
if entry is None:entry={'landscapeId':OWNER,'goalProvenance':{}};reg['landscapes'].append(entry)
for i,si in sourceidmap.items():entry['goalProvenance'][i]={'sourceLandscapeId':'c1a02ddd-736d-4975-920b-18b03aff147f','sourceGoalId':si}
save(p,reg)
# Correct derived extraction; retain raw snapshot wording as historical derived text.
p='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_INFORMATIK_SEKII_KC2024.source-extraction.json';he=load(p);he['previousSourceDocument']=copy.deepcopy(he['sourceDocument']);primary={'title':'Kerncurriculum gymnasiale Oberstufe Informatik, Ausgabe2024, Stand01.08.2025','path':'curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-informatik.pdf','url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kernkurriculum_gymnasiale_oberstufe-informatik.pdf','sha256':'af0234cb868eafdc459d2e85e96e7ebf1459accaa74e9d34bc4beaf937042f85','official':True};he['sourceDocument']=primary;he['sourceDocuments']=[primary,he['previousSourceDocument']]
sg=next(x for x in he['sourceGoals'] if x['id']=='90060560-c8ce-4f2d-88c6-20a92ae36993');sg['courseLevel']='LK';sg['tags']=[t.replace('courseLevel:GK_LK','courseLevel:LK')for t in sg['tags']];sg['extractionProvenance']={'rawTextRole':'derived sourceSnapshotGoal; not a primary quotation','primaryLocator':'p37 Q2.2 erhöhtes Niveau: DML,DDL,DCL','reviewStatus':'author-draft'}
for x in contract['newOrdinaryGoals']:
 si=sourceidmap[x['id']];topic='Q2.1' if x['sourceId']=='HE-Q2.1-basic' else 'Q2.3';passage='he-primary-2024-stand2025-'+topic
 if not any(y['id']==passage for y in he['passages']):he['passages'].append({'id':passage,'topicCode':topic,'sourceRef':primary['title']+',p37–38 '+topic+' grundlegend','sourceDocumentPath':primary['path']})
 he['sourceGoals'].append({'id':si,'passageId':passage,'topicCode':topic,'bulletIndex':len(he['sourceGoals'])+1,'aspectIndex':1,'title':x['title'],'description':x['description'],'sourceText':x['description'],'sourceSpan':'p37–38 '+topic+' grundlegend','sourceRef':primary['title'],'courseLevel':'GK_LK','granularity':'derivedPrimaryPerformance','stage':'SekII','tags':['jurisdiction:DE-HE','stage:SekII','courseLevel:GK_LK','topic:'+topic],'rawSourceText':{'er-weak-entities':'Entitätstyp (auch schwacher Entitätstyp)','er-multivalued-attributes':'Attribut (auch mehrwertiges Attribut)','er-isa':'is-a-Beziehungstyp','sql-execute-no-result':'Ausführen von SQL-Anweisungen mit und ohne Rückgabemenge'}[x['key']],'canonicalTargetIds':[x['id']],'reviewStatus':'author-draft'})
he['repairDraft']={'status':'author-draft','newPerformanceIds':list(sourceidmap.values()),'cohortBinding':['LA2027','LA2028'],'notTimelessOffering':True};save(p,he)
# All affected existing mappings become explicit author-draft judgments, no accepted-seed relabeling.
for p in ['curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json','curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_informatics_upper_secondary_to_canonical_informatics.json']:
 m=load(p)
 for i,si in sourceidmap.items():m['mappings'].append({'legacyGoalId':si,'canonicalGoalId':i,'matchType':'exact','reviewDecisionId':'author-primary-'+si})
 m['repairDraft']={'status':'author-draft','notIndependentReview':True,'primarySource':primary,'historicalSeedReviewsPreservedInFrozenInput':True};save(p,m)
# Source layout evidence: grey/bold rows DB6/8/10/11/12/13/15 elevated; DB3 whole combined query includes elevated subquery. DB4 assessed SQL implementation elevated, operation without SQL basic.
p='curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_INFORMATIK_SEKII_FACHANFORDERUNGEN_2021.source-extraction.json';sh=load(p);changes=[]
for x in sh['sourceGoals']:
 code=next((t.split(':',1)[1]for t in x.get('tags',[])if t.startswith('officialCode:')),None)
 if code in ['DB6','DB8','DB10','DB11','DB12','DB13','DB15','DB4'] or code=='DB3'and x['aspectIndex']==2:
  changes.append({'id':x['id'],'before':x['courseLevel'],'after':'LK','code':code});x['courseLevel']='LK';x['primaryLevelEvidence']={'pdfSha256':'69b844e76e2e673e8ac41fee8e0cdbabb343fce12f4fc5f05d8395b911789d89','printedPages':[37,46,47,48],'rule':'bold+gray elevated; mixed DB3.2 entire compound requires subquery elevated; DB4 SQL wording elevated','reviewStatus':'author-draft'}
sh['repairDraft']={'status':'author-draft','changes':changes,'basicRowsRetained':['DB7','DB9','DB16','DB17'],'sourceTextNeverRewritten':True};save(p,sh)
p='curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json';m=load(p);m['repairDraft']={'status':'author-draft','levelCorrections':changes,'requiresIndependentFullMatchReview':True};save(p,m)
# Strong QA candidate: add the two actually unfiltered cases; keep all country cases and enable existing route checks.
p='app/scripts/generateCurriculumQualityStatus.ts';s=(C/p).read_text();before='? (viewJurisdiction ? [viewJurisdiction] : [...applicabilityCompilation.summary.supportedValues])';assert before in s;s=s.replace(before,'? (viewJurisdiction ? [viewJurisdiction] : [...applicabilityCompilation.summary.supportedValues, ...(landscape.landscapeId === CANONICAL_GYM_INFORMATICS_LANDSCAPE_ID ? [null] : [])])',1)
needle="profileId: 'canonical-informatics-crossstage',";s=s.replace(needle,needle+"\n    compositionViewRoutePathMode: 'visible-atomic',",1)
needle='terminalAutonomyClusterIds: CANONICAL_GYM_INFORMATICS_PRACTICE_CLUSTER_IDS,';assert needle in s;s=s.replace(needle,"terminalAutonomyClusterIds: [...CANONICAL_GYM_INFORMATICS_PRACTICE_CLUSTER_IDS, '66630624-08b1-5d02-8544-877d0ffb12c9'],",1)
t=C/p;tnew=t.with_name(t.name+'.private-new');tnew.write_text(s);os.replace(tnew,t);log.append({'path':p,'sha256':hashlib.sha256(s.encode()).hexdigest(),'bytes':len(s.encode()),'purpose':'existing native QA scope enumeration and endpoint configuration only; no graph/scope algorithm'})
save(path,d)
# HE remains explicitly unregistered, cohort-bound standalone material/definition candidate.
(W/'held-HE-contract.json').write_text(json.dumps({'status':'private-held-unregistered; learner model has no cohort selector','exam':contract['newExams'][0],'newGoals':[g[x['id']]for x in contract['newOrdinaryGoals'][:3]],'requestedScope':{'schoolForm':'Gymnasium','jurisdiction':'DE-HE','stage':'CrossStage','courseProfile':'GK','examYear':'2027/2028'},'schemaAndRuntimeBoundary':'scope.additionalProperties=false and CompositionViewService.LEARNER_SCOPE_DIMENSIONS'},ensure_ascii=False,indent=2)+'\n')
(W/'candidate-changed-files.json').write_text(json.dumps(log,indent=2)+'\n');(W/'source-new-id-map.json').write_text(json.dumps(sourceidmap,indent=2)+'\n')
print('materialized',len(log),'files',len(d['goals']),'goals; source baseline',len(old['goals']))
