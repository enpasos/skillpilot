import copy,datetime,hashlib,json,pathlib
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
own=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-three-existing-companions-regional-candidate-v1'
iso=pathlib.Path('/tmp/skillpilot-chem-b014-companions-regional-v1')
prior=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
read=lambda p:json.loads(p.read_text())
def put(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
base=read(prior/'eight-full-runtime.validation-snapshot.json');candidate=copy.deepcopy(base);m={g['id']:g for g in candidate['goals']};bm={g['id']:g for g in base['goals']}
voltage='8be14f15-2258-58e6-ae4e-38953f5d0570';ph='c224281a-f8a3-58cd-8ca3-2c2e134d61ff';she='b781745a-256e-52b2-8d86-c1072845ccdd'
m[voltage]['requires']=['f0939f88-a6af-5334-ac4d-5d54732af25a']
m[ph]['description']='Die lernende Person kann den pH-Wert verdünnter wässriger Lösungen starker Säuren und Basen aus ihrer Stoffmengenkonzentration unter begründeten Modellannahmen bestimmen und gemessene pH-Werte auf Plausibilität prüfen.'
m[ph]['descriptionEn']='The learner can determine the pH of dilute aqueous solutions of strong acids and bases from their amount concentration using justified model assumptions and check measured pH values for plausibility.'
m[ph]['requires']=['28bb9d15-f865-5843-a035-6066580fea64','1c1420c2-a8e2-520f-8015-6df637a973bd','1dc15fa2-fca4-56b0-b5c1-4d215613dde0']
# Stable canonical navigation and global phase/course metadata deliberately preserved.
put(own/'two-companions-full-runtime.candidate.json',candidate);put(iso/canon,candidate)
rows=[]
for id in [voltage,ph,she]:
 rows.append({'goalId':id,'status':'HOLD_regional_course_relation_unexpressed' if id==she else 'ai_author_candidate','before':bm[id],'after':m[id],'changedFields':[k for k in set(bm[id])|set(m[id]) if bm[id].get(k)!=m[id].get(k)],'existingImageBytesAndLinksPreserved':True,'nativeGlobalCourseAndPhasePreserved':True,'sourceClauseBoundary':{'voltage':'standard-potential series, reaction prediction, voltage under standard conditions; Nernst remains separate','strongPH':'strong-acid/base pH and measured-result plausibility; weak-acid/base pK/MWG excluded','SHE':'setup, function, reference role remains whole existing method; regional GK conflict is HOLD'}[{voltage:'voltage',ph:'strongPH',she:'SHE'}[id]]})
put(own/'complete-three-goal-text-prerequisite-deltas.json',{'status':'inactive_informed_ai_author_candidate_two_progress_one_hold','rows':rows,'baseEightSnapshot':str(prior.relative_to(repo)/'eight-full-runtime.validation-snapshot.json'),'newOrdinaryAtomicGoals':0,'strictClosureAdded':0,'DReviewsClaimed':0,'PReviewsClaimed':0,'humanApproved':False})
# A scoped composition view may use explicit structures and existing IDs. Only HE GK/LK branches are expanded.
E='323a222e-5db8-53c5-b2dc-6f9c1d0d277c';redox='cd7f484a-ac2e-55bb-b904-61d743e87821';proto='f97b9c87-16d0-58fd-bcb2-c51574aa36d0';moved={voltage,ph};force={E,redox,proto}
def has_moved(id):return id in moved or any(has_moved(c) for c in m[id].get('contains',[]))
def tree(id):
 if id in moved:return None
 if id not in force and not has_moved(id):return {'kind':'canonicalSubtree','goalId':id}
 children=[{'kind':'goalEntry','goalId':id,'displayLabel':'Überblick: '+m[id]['title']}]
 children += [n for c in m[id].get('contains',[]) if (n:=tree(c)) is not None]
 if id==redox:children.append({'kind':'goalEntry','goalId':voltage})
 if id==proto:children.append({'kind':'goalEntry','goalId':ph})
 return {'kind':'structure','id':'he-scoped-'+id,'label':m[id]['title'],'children':children}
def transform(n):
 if n['kind']=='structure':n['children']=[transform(c) for c in n['children']];return n
 if n['kind']=='canonicalSubtree' and (n['goalId'] in force or has_moved(n['goalId'])):return tree(n['goalId'])
 return n
placements=[]
for name in ['de-he-gk','de-he-lk']:
 path='curricula/DE/Gymnasium/composition-views/chemie/'+name+'.view.json';before=read(repo/path);after=copy.deepcopy(before);after['rootNodes']=[transform(n) for n in after['rootNodes']]
 put(own/'prospective-input-tree'/path,after);put(iso/path,after)
 placements.append({'path':path,'before':before,'after':after,'jurisdiction':'DE-HE','courseProfile':before['scope']['courseProfile'],'movedExistingGoalIds':[voltage,ph],'canonicalPhaseFieldsUnchanged':True,'nativeViewStructuresReplaceOnlyAffectedBranches':True,'allExistingCanonicalGoalReferencesRetainedExactlyOnce':True,'scopeLimit':'HE scoped presentation; canonical cluster IDs stay as opaque overview entries. Their descendant tree lives under scoped structure IDs. Existing phase-focus references to those canonical overview IDs need separate consumer assessment before adoption.'})
put(own/'complete-he-scoped-placement-deltas.json',{'status':'ai_author_candidate_pending_native_validation','rows':placements,'globalCanonicalContainsChanged':False,'otherJurisdictionsViewsChanged':False})
# Correct scoped source rows without adding unpublished SHE to native published atlas.
mp='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-energy-four-current-20261005-v1.review.json';before=read(repo/mp);after=copy.deepcopy(before)
e='he-chem-sekii-e-2-b03-a01-b6eb2233';q='he-chem-sekii-q3-3-b03-a01-27ea846d';rE='he-chem-sekii-e-1-b06-a01-5428c244'
# pH clause goes to strong-pH plus the already existing indicator goal; solution preparation is a different clause.
new_targets=[ph,'d2ccd1d5-56f7-583f-9724-e97441367f91']
after['mappings']=[r for r in after['mappings'] if r['legacyGoalId']!=e and not (r['legacyGoalId']==rE and r['canonicalGoalId']=='f0939f88-a6af-5334-ac4d-5d54732af25a')]
after['mappings'] += [{'legacyGoalId':e,'canonicalGoalId':id,'matchType':'partial','reviewDecisionId':e} for id in new_targets]
for r in after['mappings']:
 if r['legacyGoalId']==q and r['canonicalGoalId']==voltage:r['matchType']='partial'
for d in after['decisions']:
 if d['sourceGoalId']==e:
  d['canonicalGoalIds']=new_targets;d['rationale']='Informed AI author candidate: strong-pH calculation and definition in c224, indicator detection/classification in d2ccd. Each mapping is partial; the retained complete source clause is their union. No solution-preparation or weak-pK requirement is inferred.';d['reviewedAt']='2026-10-05';d['reviewer']='OpenAI GPT-6 family AI source-author candidate'
 if d['sourceGoalId']==rE:d['canonicalGoalIds']=[voltage];d['rationale']='Cell-voltage and series coverage is partial 8be; f093 covers qualitative cell structure separately through E.1 B07. Complete SHE clause remains explicitly HOLD in the existing b781 candidate; source words are retained.';d['reviewedAt']='2026-10-05';d['reviewer']='OpenAI GPT-6 family AI source-author candidate'
 if d['sourceGoalId']==q:d['rationale']='Voltage/standard-potential part is partial 8be coverage. SHE is an explicit unresolved companion in b781; source text remains complete and source-clause closure is HOLD.';d['reviewedAt']='2026-10-05';d['reviewer']='OpenAI GPT-6 family AI source-author candidate'
after['reviewId']='hessen-chemistry-two-existing-companions-regional-ai-author-candidate-20261005-v1';after['status']='candidate';after['summary']['exactMappings']=sum(r['matchType']=='exact' for r in after['mappings']);after['summary']['partialMappings']=sum(r['matchType']=='partial' for r in after['mappings']);after['summary']['sourceGoals']=len(after['decisions']);after['summary']['mappedSourceGoals']=len({r['legacyGoalId'] for r in after['mappings']})
put(own/'prospective-input-tree'/mp,after);put(iso/mp,after)
put(own/'bounded-source-mapping-deltas.json',{'status':'candidate_two_progress_she_hold','path':mp,'changedSourceGoalIds':[rE,e,q],'rows':[{'sourceGoalId':id,'beforeMappings':[r for r in before['mappings'] if r['legacyGoalId']==id],'afterMappings':[r for r in after['mappings'] if r['legacyGoalId']==id],'sourceTextUnchanged':True} for id in [rE,e,q]],'SHEPendingUnappliedMappings':[{'legacyGoalId':id,'canonicalGoalId':she,'matchType':'partial','reason':'whole SHE source role preserved; actual HE GK filter cannot include current LK-only goal via target-role overrides'} for id in ['he-chem-sekii-e-1-b06-a01-5428c244',q]],'SHEGKTagAdded':False,'SHEWholeSourceClauseClosure':'HOLD','sourceGoalsDenominatorUnchanged':True})
# The actual builder uses reviewed mapping records; status does not imply approval. This isolated tree is candidate only.
print(json.dumps({'twoGoalCandidates':[voltage,ph],'SHE':'HOLD','HEViewsAuthored':2,'newOrdinaryGoals':0,'strictAdded':0}))
