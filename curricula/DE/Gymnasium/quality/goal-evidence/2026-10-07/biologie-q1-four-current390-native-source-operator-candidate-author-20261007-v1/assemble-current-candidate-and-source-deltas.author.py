# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,datetime,copy,shutil
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OWN=pathlib.Path(__file__).resolve().parent
V5=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-source-operator-author-remediation-v5'
V4=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-current383-source-scope-author-remediation-v4'
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-three-current383-author-continuation-v2'
FUTURE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1'
SPARSE=ROOT/'tmp/biologie-q1-four-current390-native-author-20261007-v1-attempt02';SPARSE.mkdir(parents=True,exist_ok=True)
FOUR=['0daa79f6-8f61-5506-98f9-65db83062ba8','475eebb4-4eb0-524f-b1ec-4a672bf856d2','ffef97e3-12d6-5090-9816-46ab9e57fae2','e70d8a85-2dea-5165-919b-200fee9f4db4'];targets=set(FOUR)
used={}
def sha(b):return hashlib.sha256(b).hexdigest()
def bind(p):b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':sha(b),'bytes':len(b)}
def read(p):used[str(p)]=bind(p);return json.loads(p.read_text())
def write(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def exactcopy(p,q):used[str(p)]=bind(p);q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q);assert sha(p.read_bytes())==sha(q.read_bytes())
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
basepath=FUTURE/'isolated-repository/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';base=read(basepath);active=read(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');old=read(OLD/'prospective-canonical.snapshot.json');v5=read(V5/'eleven-components-twentyfour-cases.author-candidate.json');fourP=read(V4/'positive-four.native-candidate-records.json')['records'];images=read(V4/'visualization-final-candidate-inputs.v3.json')['records']
assert len(base['goals'])==len(active['goals'])==472
bg={g['id']:g for g in base['goals']};ag={g['id']:g for g in active['goals']};og={g['id']:g for g in old['goals']};candidate=copy.deepcopy(base);cg={g['id']:g for g in candidate['goals']}
for g in FOUR:
 assert bg[g]==ag[g],g
 for field in ('description','descriptionEn','resourceLinks'):cg[g][field]=copy.deepcopy(og[g][field])
 # The author only changes the four actual semantic/source boundaries. No existing competency is duplicated.
 cg[g].setdefault('extendedData',{})['applicabilityMappingInheritance']='boundary'
 # Keep the old jurisdiction claims as visible review debt until actual per-country source-route adjudication; never infer a blanket narrow scope from GLOBAL.
write(OWN/'current-four-and-future-baseline.whole-objects.author.json',{'role':'actual current four plus sealed future Bio21 baseline; author candidate, no independent approval','createdAt':now,'activeCanonical':bind(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),'sealedFutureCanonical':bind(basepath),'futureBio21IsReferenceNotOwnIntegration':True,'currentFour':[{ 'goalId':g,'wholeActiveGoal':ag[g],'wholeSealedFutureGoal':bg[g],'wholeCandidateGoal':cg[g]} for g in FOUR],'strictGain':0,'humanApproval':False})
write(OWN/'candidate-canonical472.inert-envelope.author.json',{'role':'inert prospective whole canonical payload; materialized only in owned tmp sparse root','candidateCanonicalUTF8':json.dumps(candidate,ensure_ascii=False,indent=2)+'\n','candidateGoalCount':472,'candidateCurricularAtomicCount':390,'newGoalIds':[],'onlyChangedWholeGoalIds':FOUR,'sourceScopeJudgmentPending':True,'independentApproval':False,'humanApproval':False})
write(SPARSE/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',candidate)
# Historical null IDs are resolved by actual current goals; exact text equality is checked.
keyIDs={g['shortKey'].removeprefix('canonical_biology_'):g['id'] for g in base['goals'] if g.get('shortKey')}
resolved=[]
for c in v5['components']:
 gid=c['canonicalGoalId'] or keyIDs[c['candidateKey']];assert gid in bg
 if c['canonicalGoalId'] is None:
  for a,b in [('title','title'),('titleEn','titleEn'),('description','description'),('descriptionEn','descriptionEn')]:assert c[a]==bg[gid][b],(gid,a)
 resolved.append({'candidateKey':c['candidateKey'],'actualExistingCanonicalGoalId':gid,'oldV5NullID':c['canonicalGoalId'] is None,'wholeCurrentGoal':bg[gid],'wholeCandidateGoal':cg[gid],'completeComponentAndCasesExactV5':copy.deepcopy(c),'nativeBindingPurpose':'reuse exact valid current identity; supplemental source/operator materials are candidate inputs, not new approval','imagePresentInCurrentGoal':bool(bg[gid].get('resourceLinks')),'wholeSourceClosure':False})
write(OWN/'eleven-resolved-current-components-twentyfour-exact-cases.author.json',{'role':'current whole goals mapped to exact accepted historical bounded cases, no new independent judgment','sourceV5':bind(V5/'eleven-components-twentyfour-cases.author-candidate.json'),'components':resolved,'completeCases':24,'priorNullIDClaimsSupersededByActualCurrentIDs':True,'newGoalIds':[],'independentApproval':False,'strictGain':0})
write(OWN/'four-exact-P-profile-bodies-and-eight-cases.author.json',{'role':'preserve four exact valid profile bodies; future current-goal/resource fingerprints are technical candidates only','records':fourP,'exactProfilesRetained':4,'exactExistingPCaseBodiesRetained':8,'independentApproval':False})
# Rebase only necessary four-target mapping deltas. New routes to protected partners are kept separately until their own actual context review.
sourceOverrides={};sourceRows=[]
neededSourceIDs={}
for f in sorted((V4/'source-overlays-inert').glob('lane-*.candidate-envelope.json')):
 env=read(f);p=env['candidatePayload'];path=p['sourceExtractionPath'].split('/proposed-inputs/',1)[-1]
 neededSourceIDs.setdefault(path,set()).update(m['legacyGoalId'] for m in p['mappings'] if m['canonicalGoalId'] in targets)
for f in sorted((V4/'source-overlays-inert').glob('source-*.candidate-envelope.json')):
 env=read(f);payload=env['candidatePayload'];origpath=env['v3SourcePath'].split('/proposed-inputs/',1)[1];current=read(ROOT/origpath);final=copy.deepcopy(current);before={g['id']:g for g in current['sourceGoals']};after={g['id']:g for g in payload['sourceGoals'] if g['id'] in neededSourceIDs.get(origpath,set())};updates=[]
 for g in final['sourceGoals']:
  if g['id'] in after and g!=after[g['id']]:
   replacement=copy.deepcopy(after[g['id']]);updates.append({'goalId':g['id'],'before':copy.deepcopy(g),'after':replacement});g.clear();g.update(replacement)
 for gid,g in after.items():
  if gid not in before:final['sourceGoals'].append(copy.deepcopy(g));updates.append({'goalId':gid,'before':None,'after':g})
 assert {g['id']:g for g in final['sourceGoals'] if g['id'] not in after}=={g['id']:g for g in current['sourceGoals'] if g['id'] not in after}
 out=OWN/'source-overlays-inert'/f.name
 write(out,{'role':'rebased source payload from exact historical witness; no new whole-source clearance','replacesPath':origpath,'currentBaseline':bind(ROOT/origpath),'historicalEnvelope':bind(f),'candidatePayload':final,'targetedSourceGoalChanges':updates,'wholeSourceClosure':False,'independentApproval':False})
 write(SPARSE/origpath,final);sourceOverrides[origpath]=final;sourceRows.append({'path':origpath,'changes':updates,'envelope':str(out.relative_to(ROOT))})
mapRows=[];deferred=[]
for f in sorted((V4/'source-overlays-inert').glob('lane-*.candidate-envelope.json')):
 env=read(f);path=env['replacesPath'];cur=read(ROOT/path);v=env['candidatePayload'];final=copy.deepcopy(cur)
 # Current source extraction remains at its own real canonical input path; source payloads above are per-ID rebases.
 vp=v['sourceExtractionPath'];realSource=vp.split('/proposed-inputs/',1)[1] if '/proposed-inputs/' in vp else vp
 final['sourceExtractionPath']=realSource
 oldFour=[m for m in cur['mappings'] if m['canonicalGoalId'] in targets];newFour=[m for m in v['mappings'] if m['canonicalGoalId'] in targets]
 final['mappings']=[m for m in cur['mappings'] if m['canonicalGoalId'] not in targets]+copy.deepcopy(newFour)
 oldpairs={(m['legacyGoalId'],m['canonicalGoalId']):m for m in cur['mappings']};newpairs={(m['legacyGoalId'],m['canonicalGoalId']):m for m in v['mappings']}
 for pair,m in newpairs.items():
  if pair[1] not in targets and oldpairs.get(pair)!=m:deferred.append({'mappingPath':path,'sourceGoalId':pair[0],'existingPartnerGoalId':pair[1],'historicalCandidateRelation':m,'reason':'Separate partner source/view context change; exact current whole goal/image/P/A/M retained, no automatic regional/whole-source approval.'})
 # Decision lists match actual rebased mapping pairs. Historical parser decision enums are not new author approval.
 decisions={d.get('sourceGoalId',d.get('legacyGoalId',d.get('id'))):d for d in final.get('decisions',[])}
 for d in v.get('decisions',[]):
  sourceID=d.get('sourceGoalId',d.get('legacyGoalId',d.get('id')))
  if sourceID not in decisions and any(m['legacyGoalId']==sourceID for m in newFour):
   final.setdefault('decisions',[]).append(copy.deepcopy(d))
 for d in final.get('decisions',[]):
  gid=d.get('sourceGoalId',d.get('legacyGoalId',d.get('id')))
  if 'canonicalGoalIds' in d and gid:
   unchangedTargets=[t for t in d['canonicalGoalIds'] if t not in targets]
   d['canonicalGoalIds']=list(dict.fromkeys(unchangedTargets+[m['canonicalGoalId'] for m in newFour if m['legacyGoalId']==gid]))
 oldDecisionTargets={d['sourceGoalId']:[t for t in d.get('canonicalGoalIds',[]) if t not in targets] for d in cur.get('decisions',[])}
 assert all([t for t in d.get('canonicalGoalIds',[]) if t not in targets]==oldDecisionTargets[d['sourceGoalId']] for d in final.get('decisions',[]) if d['sourceGoalId'] in oldDecisionTargets)
 changes=[]
 for pair in sorted(set((m['legacyGoalId'],m['canonicalGoalId']) for m in oldFour+newFour)):
  a=next((m for m in oldFour if (m['legacyGoalId'],m['canonicalGoalId'])==pair),None);z=next((m for m in newFour if (m['legacyGoalId'],m['canonicalGoalId'])==pair),None)
  if a!=z:changes.append({'sourceGoalId':pair[0],'canonicalGoalId':pair[1],'before':a,'after':z})
 out=OWN/'source-overlays-inert'/f.name;write(out,{'role':'candidate-only rebased exact four-target source correction; inherited accepted enums are parser history, no new independent source approval','replacesPath':path,'currentBaseline':bind(ROOT/path),'historicalEnvelope':bind(f),'candidatePayload':final,'targetedRelations':changes,'nonFourCurrentMappingRelationsExact':True,'wholeSourceClosure':False,'independentApproval':False})
 write(SPARSE/path,final);mapRows.append({'mappingPath':path,'sourceExtractionPath':realSource,'envelope':str(out.relative_to(ROOT)),'targetedRelationChanges':changes,'nonFourCurrentMappingRelationsExact':True})
write(OWN/'actual-four-source-corrections-and-deferred-partner-routes.author.json',{'role':'author exact rebased source/mapping changes; all whole original country obligations retained as HOLD','mappingLanes':mapRows,'sourcePayloads':sourceRows,'deferredExistingPartnerContextRoutes':deferred,'old3417MutationOnlyImportsNotAdded':True,'existingCurrentSevenSourceRoutesRetained':True,'newCanonicalIds':[],'strictGain':0,'independentApproval':False})
# Exact old images copied only to a task-owned public root. Generation/review history is not a new V decision.
for im in images:
 p=ROOT/im['candidatePath'];assert 'sha256:'+sha(p.read_bytes())==im['sha256'];exactcopy(p,SPARSE/'app/public/assets/goal-visualizations/biologie'/im['goalId']/(im['goalId']+'.png'))
write(OWN/'four-existing-images-and-child-image-holds.author.json',{'role':'reuse exact four selected historical rasters; no generation or author quality approval','fourSelectedImages':images,'missingExistingPartnerImages':[{'goalId':gid,'title':bg[gid]['title'],'wholeCurrentGoal':bg[gid],'reason':'No current primary visualization link; independent native whole-goal review and future necessary image work remain separate.'} for gid in ('e349d8c4-2ba3-5360-bd44-13457e5c0aa3','1ec4e3c2-f302-5246-b531-f2cebc3efb1d') if not bg[gid].get('resourceLinks')],'existingSevenCurrentImagesRetained':True,'newImagesGenerated':0,'humanApproval':False,'strictGain':0})
for n in ('standard-code-sun.author-material.svg','standard-code-sun.codon-data.actual.json'):exactcopy(V4/n,OWN/'retained-material'/n)
write(OWN/'author-assembly-inputs-and-boundary.actual.json',{'createdAt':now,'role':'actual author inputs and sparse physical materialization, no independent review','sparseRoot':str(SPARSE.relative_to(ROOT)),'fourGoalIds':FOUR,'sourceMapLaneCount':len(mapRows),'sourcePayloadCount':len(sourceRows),'exactV5Cases':24,'exactExistingPCaseBodies':8,'newGoalIDs':[],'activeWrites':0,'historicalWrites':0,'newImagesGenerated':0,'strictGain':0,'humanApproval':False,'inputs':list(used.values())})
print(json.dumps({'candidateWholeGoals':len(candidate['goals']),'onlyFourWholeGoalDeltas':FOUR,'mappingLanes':len(mapRows),'rebasedSourcePayloads':len(sourceRows),'deferredPartnerRoutes':len(deferred),'newIDs':0,'exactCases24Plus8':True,'sparseRoot':str(SPARSE.relative_to(ROOT))}))
