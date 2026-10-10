# SPDX-License-Identifier: Apache-2.0
import copy,hashlib,json,os,shutil
from datetime import datetime,timezone
from pathlib import Path
R=Path.cwd();P=Path(__file__).resolve().parent.relative_to(R)
A=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-sexuality-addiction-twelve-whole-material-raster-source-author-candidate-v1')
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');KIN=Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json');QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
C=Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip())
def read(p):return json.loads((R/p).read_text())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(rel,d):p=P/rel;f=R/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return ref(p)
def cp(src,rel):p=P/rel;f=R/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists();shutil.copyfile(R/src,f);return ref(p)
def sync(src):
 dest=C/src;dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.is_file() and dest.read_bytes()==(R/src).read_bytes():return
 tmp=dest.with_name(dest.name+'.bio12-atomic-copy');shutil.copyfile(R/src,tmp);os.replace(tmp,dest)
af=read(A/'FINAL.health-sexuality-addiction-twelve.author-candidate.freeze.json')
for b in af['ownBindings']+af['externalBindings']:assert ref(Path(b['path']))==b,b['path']
for path,digest in [(CAN,'e803f423ef74b1c7618d72da2170e1e2686a3529a50785caa382053813fc3bfe'),(QA,'27504e7592b6102d7d8cee698acafa32c4d584f15727733a810cc39bcc190126'),(KIN,'e614517680f6e5eb5ed03f334fbbd9d153f6d1dddd9f0aa23f0c6387b3aec177')]:assert ref(path)['sha256']=='sha256:'+digest
ids=read(A/'neutral-health-sexuality-addiction-twelve.author-candidate.entry.json')['goalIds'];assert len(ids)==12
old343=read(Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-current343-source-raster-native-technical-preparation-20261010-v1/inputs/current343-exact-protected-IDs.json'))['current343']
neuro=read(Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1/current343-ten-reviewed-inactive.completed.entry.json'))['goalIds'];protected=sorted(set(old343+neuro));assert len(protected)==353 and not set(ids)&set(protected)
for src,dst in [(CAN,'inputs/current479-protected353.before.exact.json'),(KIN,'inputs/current394-kinds.before.exact.json'),(QA,'inputs/current394-QA.before.exact.json'),(REG,'inputs/current-registry.before.exact.json'),(A/'science/twelve-whole-profiles-and-twenty-four-cases.author.json','science/twelve-whole-science.exact.json'),(A/'science/twelve-positive-candidate-set.author.json','positive/twelve-science.candidate-set.exact.json'),(A/'inputs/positive-criteria.exact.md','inputs/positive-criteria.exact.md'),(A/'inputs/whole-current-direct-source-witnesses.neutral.json','sources/original187-whole-witnesses.history.exact.json')]:cp(src,dst)
put('inputs/current353-protected.ids.json',{'schemaVersion':1,'current353':protected,'neuroTenIncluded':neuro,'protectionIsRetainedNotNewApproval':True})
img=read(A/'assets/twelve-actual-original-and-mobile-desktop-author-observations.json');rows=[]
for x in img['rows']:
 views=[]
 for r in x['originalAndProportionalViews']:
  assert ref(Path(r['path']))['sha256']==r['sha256'];dst=f"assets/{x['goalId']}.{r['role']}.png";b=cp(Path(r['path']),dst);views.append({'role':r['role'],**b,'width':r['width'],'height':r['height']})
 rows.append({'goalId':x['goalId'],'actualRasterViews':views,'captionDe':x['candidateCaptionDe'],'captionEn':x['candidateCaptionEn'],'futurePublicURL':f"/assets/goal-visualizations/biologie/{x['goalId']}/{x['goalId']}.png",'provider':'OpenAI builtin imagegen','originalProvenance':ref(A/f"prompts/{x['goalId']}.generation-receipt.v{x['selectedVersion']}.json"),'independentApproval':False})
put('inputs/twelve-current-raster-bindings.neutral.json',{'schemaVersion':1,'role':'Actual byte-selected rasters for technical binding; AUTHOR generation/views are not approval','goalIds':ids,'records':rows,'humanApproval':False})
# Selected field-only SOURCE changes are merged onto actual current31 pairs, never onto an old whole neutral extraction.
src=read(A/'sources/187-witnesses-98-source-goals.actual-primary-and-additive-deltas.author.json');deltas={d['sourceGoalId']:d for d in src['additiveSourceGoalFieldDeltas']};atlas=read(Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'));assert len(atlas['mappingPaths'])==31
cp(Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'),'sources/current31-atlas.before.exact.json')
registry=read(A/'sources/actual-primary-registry.author-working.json')['documents'];newmaps=[];changes=[];external=[];actualdescriptors=src['proposedActualPrimarySourceDocumentDescriptors']
for index,mpath in enumerate(atlas['mappingPaths']):
 m=read(Path(mpath));expath=Path(m['sourceExtractionPath']);ex=read(expath);external.extend([ref(Path(mpath)),ref(expath)]);selected=[g['id'] for g in ex['sourceGoals'] if g['id'] in deltas]
 if not selected:newmaps.append(mpath);continue
 after=copy.deepcopy(ex);mapping=copy.deepcopy(m);state=ex['jurisdiction'].removeprefix('DE-');rowsBy={g['id']:g for g in after['sourceGoals']}
 for sid in selected:
  delta=deltas[sid];current=rowsBy[sid]
  for field in ['id','description','title','sourceText','topicCode','passageId','tags','courseLevel']:
   assert current.get(field)==delta['wholeBeforeFromNeutral'].get(field),(sid,field)
  for key in delta['changedFields']:current[key]=copy.deepcopy(delta['wholeAfterAuthorCandidate'].get(key))
 # Add actual selected primary keys; historical derived descriptors retain their identity and explicit provenance.
 docs=after.get('sourceDocuments') or [copy.deepcopy(after['sourceDocument'])]
 for desc in actualdescriptors:
  if not any(rowsBy[sid].get('sourceDocumentKey')==desc['key'] for sid in selected):continue
  existing=next((d for d in docs if d['key']==desc['key']),None)
  if existing:
   assert existing['path']==desc['path'] and existing['url']==desc['url'],desc['key']
  else:docs.append({k:desc[k] for k in ['key','title','path','url','official']})
 # Reuse already committable exact primary bytes for PDF document descriptors; no new ignored alias dependency.
 for doc in docs:
  matches=[r for r in registry if r['sourceDocumentKey']==doc['key']]
  if not matches or doc['key'].startswith('LEHRPLANPLUS') or doc['key']=='G9_BIOLOGIE_SEKI':continue
  if len(matches)>1:matches=[r for r in matches if '/primary/'+state+'-' in r['actualPrimaryPath']]
  assert len(matches)==1,(state,doc['key'])
  actual=matches[0];doc['path']=actual['actualPrimaryPath']
  if after.get('sourceDocument',{}).get('key')==doc['key']:after['sourceDocument']['path']=actual['actualPrimaryPath']
 after['sourceDocuments']=docs
 # Exactly the three HE selected match types change; old unrelated decisions/rows remain exact.
 changedDecisionIds=[];changedPairs=[]
 for d in src['targetedMappingMatchTypeDeltas']:
  if d['sourceGoalId'] not in selected:continue
  pair=next(r for r in mapping['mappings'] if r['legacyGoalId']==d['sourceGoalId'] and r['canonicalGoalId']==d['canonicalGoalId']);assert pair['matchType']==d['beforeMatchType'];pair['matchType']=d['proposedMatchType'];changedPairs.append([d['sourceGoalId'],d['canonicalGoalId']])
  decision=next(r for r in mapping['decisions'] if r['sourceGoalId']==d['sourceGoalId']);decision['matchType']='partial';decision['rationale']=d['reason']+' AUTHOR precision candidate; independent source review pending; historical alias ID preserved.';changedDecisionIds.append(d['sourceGoalId'])
 for d in src['targetedPairRemovalCandidates']:
  if d['sourceGoalId'] not in selected:continue
  previous=len(mapping['mappings']);mapping['mappings']=[r for r in mapping['mappings'] if not(r['legacyGoalId']==d['sourceGoalId'] and r['canonicalGoalId']==d['canonicalGoalId'])];assert len(mapping['mappings'])==previous-1
  dec=next(r for r in mapping['decisions'] if r['sourceGoalId']==d['sourceGoalId']);dec['canonicalGoalIds']=[i for i in dec['canonicalGoalIds'] if i.split(':')[-1]!=d['canonicalGoalId']];assert len(dec['canonicalGoalIds'])==2;dec['rationale']=d['reason']+' AUTHOR removal candidate; remaining two plant targets unchanged.';changedDecisionIds.append(d['sourceGoalId']);changedPairs.append([d['sourceGoalId'],d['canonicalGoalId']])
  metadata=rowsBy[d['sourceGoalId']].get('metadata',{});metadata['canonicalTargets']=[i for i in metadata.get('canonicalTargets',[]) if i!=d['canonicalGoalId']]
 exrel=f'sources/extractions/{index:02d}-{state}.whole-current-additive.inactive.json';maprel=f'sources/mappings/{index:02d}-{state}.whole-current-additive.inactive.review.json';mapping['sourceExtractionPath']=str(P/exrel)
 put(exrel,after);put(maprel,mapping);newmaps.append(str(P/maprel))
 assert all(g==next(x for x in after['sourceGoals'] if x['id']==g['id']) for g in ex['sourceGoals'] if g['id'] not in selected)
 assert all(d==next(x for x in mapping['decisions'] if x['sourceGoalId']==d['sourceGoalId']) for d in m['decisions'] if d['sourceGoalId'] not in changedDecisionIds)
 changes.append({'index':index,'jurisdiction':ex['jurisdiction'],'beforeMapping':ref(Path(mpath)),'afterMapping':ref(P/maprel),'beforeExtraction':ref(expath),'afterExtraction':ref(P/exrel),'selectedSourceGoalIds':selected,'changedDecisionIds':changedDecisionIds,'changedPairs':changedPairs,'everyUnselectedSourceGoalExact':True,'everyUnselectedMappingDecisionExact':True,'noNewSourceApproval':True})
put('sources/actual-current31-additive-merge-and-preservation.json',{'schemaVersion':1,'changes':changes,'allCurrent31OriginalInputs':external,'rootNeuroV5AndHE6Preserved':True,'wholeOlderExtractionUsedAsReplacement':False,'selectedSourceGoals':sum(len(c['selectedSourceGoalIds']) for c in changes),'independentApproval':False})
for label,land,kinds,maps in [('before','inputs/current479-protected353.before.exact.json','inputs/current394-kinds.before.exact.json',atlas['mappingPaths']),('after','candidate/current479-only-twelve-resourceLinks.inactive.json','candidate/current394-kinds.path-only.json',newmaps)]:
 cfg=copy.deepcopy(atlas);cfg.update(landscapePath=str(P/land),semanticKindLedgerPath=str(P/kinds),mappingPaths=maps,outputDirectory=str(P/f'sources/{label}-normal-source-views'),manifestPath=str(P/f'sources/{label}-normal-atlas.sources.json'),navigationViewPath=str(P/f'sources/{label}-normal-navigation.view.json'))
 # Existing snapshots remain truthful original cache aliases for unchanged inputs only. Portable selected descriptors resolve actual bytes directly.
 used=set()
 for path in maps:
  mm=read(Path(path));xx=read(Path(mm['sourceExtractionPath']));dd=xx.get('sourceDocuments') or [xx['sourceDocument']];used.update(d['path'] for d in dd)
 cfg['sourceDocumentSnapshots']=[s for s in cfg.get('sourceDocumentSnapshots',[]) if s['path'] in used]
 put(f'sources/{label}394-atlas.normal.config.json',cfg)
# Root full model will be built normally after source receipts exist. P binding and normal links are prepared separately with the existing helper.
put('inputs/technical-baseline-and-disjointness.json',{'schemaVersion':1,'wholeCurrentBaseline':[ref(CAN),ref(QA),ref(KIN),ref(REG)],'goalIds':ids,'currentProtected353Ids':protected,'whole479Only12ResourceLinksCandidate':True,'whole31SourcePairsCurrent':True,'authorFreeze':ref(A/'FINAL.health-sexuality-addiction-twelve.author-candidate.freeze.json'),'technicalOwnerIsAuthorNotIndependentReviewer':True,'activeWrites':[],'strictGain':0})
for f in (R/P).rglob('*'):
 if f.is_file():sync(f.relative_to(R))
for x in external:sync(Path(x['path']))
for f in [CAN,KIN,QA,REG,Path(atlas['durationModelPolicyPath'])]:sync(f)
for r in rows:
 original=next(x for x in r['actualRasterViews'] if x['role']=='original');dest=C/('app/public'+r['futurePublicURL']);dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();shutil.copyfile(R/original['path'],dest)
for d in registry:sync(Path(d['actualPrimaryPath']))
for d in actualdescriptors:sync(Path(d['path']))
print(json.dumps({'namespace':str(P),'current353Protected':len(protected),'selected12':len(ids),'current31Pairs':len(newmaps),'selectedSourceGoalFields':sum(len(c['selectedSourceGoalIds']) for c in changes),'sourceDecisionChanges':sum(len(c['changedDecisionIds']) for c in changes),'activeWrites':0,'strictGain':0}))
