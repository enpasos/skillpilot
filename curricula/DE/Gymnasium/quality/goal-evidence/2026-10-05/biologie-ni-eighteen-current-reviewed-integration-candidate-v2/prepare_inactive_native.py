#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare a guarded technical tree, without adopting author science or applying."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy,shutil

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OWN=BASE/'biologie-ni-eighteen-current-reviewed-integration-candidate-v2'
AUTH=BASE/'biologie-ni-ten-current-native-author-candidate-v2'
D=BASE/'biologie-ni-eighteen-reviewed-integration-candidate-v1'
AM=BASE/'biologie-ni-thirteen-current-independent-am-v1'
OLD5=BASE/'biologie-ni-five-current-adoption-candidate-v3'
P=BASE/'biologie-ni-one-positive-case-functional-witness-author-v2'
IMP=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ni-five-kept-native-import-bindings-v1')
V=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ni-eighteen-current-independent-v-v1')
CODE=ROOT/'tmp/biologie-ni-eighteen-current-reviewed-integration-candidate-v2-native-root'
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
KIND=Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
ATLAS=Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
BOOK=Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(rel):return json.loads((ROOT/rel).read_text())
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def jsonl(p):return [json.loads(x) for x in Path(p).read_text().splitlines()]
def writejsonl(p,v):Path(p).write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in v))
def nativecopy(src,rel):
 p=CODE/rel;p.parent.mkdir(parents=True,exist_ok=True)
 if p.is_symlink():p.unlink()
 shutil.copy2(src,p)
def native_link(src,rel):
 p=CODE/rel;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():p.symlink_to(src.resolve(),target_is_directory=src.is_dir())
def freeze_guard(rel,expected=None):
 p=ROOT/rel;actual=sha(p)
 if expected:assert actual==expected,(rel,actual)
 d=read(rel);count=0
 for q in d['files']:
  src=Path(q['path']);src=src if src.is_absolute() else ROOT/src
  if not src.exists():src=p.parent/q['path']
  assert sha(src)==q['sha256'].removeprefix('sha256:'),src
  count+=1
 return {'manifestPath':str(rel),'manifestSHA256':actual,'actualFrozenFilesVerified':count}
def spans(t):
 pos=t.index('[',t.index('"subjects"'))+1;dec=json.JSONDecoder();result={}
 while True:
  while t[pos].isspace() or t[pos]==',':pos+=1
  if t[pos]==']':return result
  obj,size=dec.raw_decode(t[pos:]);result[obj['subject']]=(pos,pos+size,obj,t[pos:pos+size]);pos+=size

def main():
 out=ROOT/OWN;out.mkdir(parents=True,exist_ok=False)
 guards=[freeze_guard(AUTH/'author-checkpoint.freeze.manifest.json','174b280a3d02591d1e5125ed32624c525bef699fff188be1cb4d9f51c016646f'),freeze_guard(AM/'independent-current-atomicity-memory.final.freeze.json','6151f60772aa5eae69dd22269ea7a50e0d284ef3e2f1cf090dbaad6b1510ef3d'),freeze_guard(V/'independent-current-visualization.final.freeze.json','1aaa3519034bbc1785fbd4eaece1cd1621667f565a80e4931e54479819eb89f5'),freeze_guard(IMP/'native-five-kept-import-and-binding-comparison.final.freeze.json','79c70ba9800fcc64b6644e3b71af1f56c64bd466ddf97809ef28a86baf9c1104'),freeze_guard(P/'one-case-author-amendment.final.freeze.json','9bf68dd658e30730ce617be15a35040b2d0626d31c8b47589395746f9469ee83')]
 paths=read(AUTH/'prospective-paths.json');ids=paths['goalIds'];five=paths['predecessorNI5GoalIds'];assert len(ids)==18
 reportpath=BASE/'chemie-biologie-q1-bacteria-e7-integration-v1/integrated-central-after-e7-current.stdout.txt';report=read(reportpath);bio=next(s for s in report['subjects'] if s['subject']=='biologie');assert bio['strictComplete']==49 and bio['denominator']==365 and not bio['issues']
 before=read(CAN);assert sha(ROOT/CAN)=='45f3d79713ba3c5e0817df9e8da04989aacab3daf65e275838af9f35c91abfba'
 assert before==read(AUTH/'baseline.canonical.actual.snapshot.json')
 future=read(IMP/'canonical.after-native-import.inactive.snapshot.json');assert len(before['goals'])==443 and len(future['goals'])==464
 old={g['id']:g for g in before['goals']};new={g['id']:g for g in future['goals']};assert all(gid in new for gid in bio['strictCompleteGoalIds'])
 fields=[]
 for gid,g in old.items():
  changes=[{'field':k,'beforeExists':k in g,'before':g.get(k),'afterExists':k in new[gid],'after':new[gid].get(k)} for k in sorted(set(g)|set(new[gid])) if g.get(k)!=new[gid].get(k)]
  if changes:fields.append({'goalId':gid,'fields':changes})
 assert {x['goalId'] for x in fields}=={'e8d54127-d42e-51f5-bfa5-51d826069f95','440854be-7f06-5678-91cb-ba8dcab56959'}
 assert [x['field'] for x in next(x for x in fields if x['goalId'].startswith('4408'))['fields']]==['requires']
 protected=[{'goalId':gid,'entireGoalObjectExact':old[gid]==new[gid],'actualChangedFields':next((x['fields'] for x in fields if x['goalId']==gid),[])} for gid in bio['strictCompleteGoalIds']]
 assert sum(not x['entireGoalObjectExact'] for x in protected)==1
 write(out/'preflight-current49-and-frozen-evidence.actual.json',{'createdAtUTC':datetime.now(timezone.utc).isoformat(),'frozenInputSets':guards,'baselineCentralReportPath':str(reportpath),'baselineCentralReportSHA256':sha(ROOT/reportpath),'currentCanonicalSHA256':sha(ROOT/CAN),'currentRegistrySHA256':sha(ROOT/REG),'currentStrict':49,'currentAtomic':365,'prospectiveAtomic':383,'prospectiveWholeGoals':464,'wholeProtected49':protected,'actualExistingGoalFieldDeltas':fields,'newWholeGoalIds':[gid for gid in new if gid not in old],'activeWrites':0,'independentP13AndEDAFirstCaseFollowUpStillHardGate':True})
 # Executable files copied only into ignored tmp. Selected immutable inputs are
 # referenced individually. This tree has no repository-wide writable alias.
 copied=[]
 for p in (ROOT/'app/scripts').iterdir():
  if p.is_file():nativecopy(p,p.relative_to(ROOT));copied.append(str(p.relative_to(ROOT)))
 for p in (ROOT/'app/scripts/config').rglob('*'):
  if p.is_file():nativecopy(p,p.relative_to(ROOT));copied.append(str(p.relative_to(ROOT)))
 for rel in ['app/src','app/node_modules','contracts','docs']:
  native_link(ROOT/rel,Path(rel))
 native_link(out,OWN)
 deltas=[]
 def proposed(rel,value):
  dest=out/'prospective-input-tree'/rel;write(dest,value);nativecopy(dest,rel)
  deltas.append({'futureActivePath':str(rel),'prospectiveCopyPath':str(dest.relative_to(ROOT)),'sha256':sha(dest),'activeSHA256Before':sha(ROOT/rel) if (ROOT/rel).is_file() else None})
 proposed(CAN,future)
 kind=read(AUTH/'semantic-kinds.native-shape.inactive.snapshot.json');kind['sourceLandscapePath']=str(CAN);assert kind['counts']['curricularAtomic']==383
 proposed(KIND,kind) # Native kind fingerprint refresh is a separate bound step.
 qa=read(IMP/'native-eighteen-independent-ai-fields-preserving-human.qa.json');currentqa=read(QA);oldqa={r['goalId']:r for r in currentqa['records']};nextqa={r['goalId']:r for r in qa['records']}
 assert all(nextqa[gid]==value for gid,value in oldqa.items() if gid not in ids)
 assert all(nextqa[gid]['humanApproved']==oldqa[gid]['humanApproved'] for gid in oldqa)
 proposed(QA,qa)
 # Preserve all actual imported PNG/prompt inputs; prospective installation is
 # explicit, but source payloads are shared immutable witnesses, not copied again.
 importproof=read(V/'independent-current-exact-source-frontend-backend-and-provenance-verification.json');export=read(IMP/'exported-native-unique-five-assets-and-provider-prompts.manifest.json');exportby={r['goalId']:{} for r in export['files']}
 for r in export['files']:exportby[r['goalId']][Path(r['exportedPath']).name]=r
 assets=[]
 for row in importproof['rows']:
  gid=row['goalId']
  for prefix in ['curricula/DE/Gymnasium/visualizations/biologie','app/public/assets/goal-visualizations/biologie','backend/src/main/resources/static/assets/goal-visualizations/biologie']:
   rel=Path(prefix)/gid/(gid+'.png')
   if gid in five:source=ROOT/exportby[gid][gid+'.png']['exportedPath']
   else:source=Path(next(x['actualResolvedPath'] for x in row['copies'] if prefix in x['path']))
   assert sha(source)==row['currentSelectedAssetSHA256'];native_link(source,rel)
   assets.append({'futureActivePath':str(rel),'immutableReviewedSourcePath':str(source.relative_to(ROOT)),'sha256':sha(source),'activeSHA256Before':sha(ROOT/rel) if (ROOT/rel).is_file() else None})
  prompt=Path('curricula/DE/Gymnasium/visualizations/biologie')/gid/'prompt.de.md'
  src=ROOT/exportby[gid]['prompt.de.md']['exportedPath'] if gid in five else ROOT/row['actualRetainedProviderPrompt']['path']
  native_link(src,prompt);assets.append({'futureActivePath':str(prompt),'immutableReviewedSourcePath':str(src.relative_to(ROOT)),'sha256':sha(src),'activeSHA256Before':sha(ROOT/prompt) if (ROOT/prompt).is_file() else None})
 # Current existing assets are read inputs only; new images are the actual
 # reviewed immutable originals above, never generated or converted here.
 for g in future['goals']:
  for l in g.get('resourceLinks',[]):
   if l.get('type')=='goal-visualization':
    rel=Path('app/public')/l['url'].lstrip('/');src=ROOT/rel
    if src.is_file():native_link(src,rel)
  for k in ['vocabularySource','vocabularySourceEn']:
   val=g.get('extendedData',{}).get(k)
   if val:
    rel=Path(val);src=ROOT/rel if not val.startswith('/') else ROOT/'app/public'/val.lstrip('/')
    if src.is_file():native_link(src,rel if not val.startswith('/') else Path('app/public')/val.lstrip('/'))
 # Exact source clauses and partial mappings remain author-frozen. The current
 # configured atlas selects their versioned companion, not historical scans.
 source_rel=OWN/'NI.current-reviewed.source.snapshot.json';mapping_rel=OWN/'NI.current-reviewed.mapping.snapshot.json'
 shutil.copy2(ROOT/AUTH/'NI.source.current.inactive.snapshot.json',out/'NI.current-reviewed.source.snapshot.json')
 mapping=read(AUTH/'NI.mapping.current.inactive.snapshot.json');mapping['sourceExtractionPath']=str(source_rel);write(out/'NI.current-reviewed.mapping.snapshot.json',mapping)
 atlas=read(ATLAS);assert atlas['expectedCurricularAtomicGoalCount']==365
 oldni=[p for p in atlas['mappingPaths'] if '/DE-NI/' in p];assert len(oldni)==1
 atlas['mappingPaths']=[str(mapping_rel) if p==oldni[0] else p for p in atlas['mappingPaths']];atlas['expectedCurricularAtomicGoalCount']=383
 proposed(ATLAS,atlas)
 # Use original namespace for native D inputs, and fresh current standard paths
 # for actual atlas output. Do not rewrite frozen author/Root D inputs.
 regbytes=(ROOT/REG).read_text();parts=spans(regbytes);entry=copy.deepcopy(parts['biologie'][2])
 d18=str(D/'native-d18/resolution-index.json');d5=str(D/'native-d5/resolution-index.json');entry['resolutionIndexPaths'] += [d18,d5]
 for gid in paths['existingSourceContextGoalIds']:
  owners=[p for p in parts['biologie'][2]['resolutionIndexPaths'] if any(x['goalId']==gid for x in read(Path(p))['resolutions'])]
  excluded={x['supersededIndexPath'] for x in parts['biologie'][2].get('resolutionSupersessions',[]) if x['goalId']==gid}
  selected=[p for p in owners if p not in excluded];assert len(selected)==1,(gid,selected)
  entry.setdefault('resolutionSupersessions',[]).append({'goalId':gid,'supersededIndexPath':selected[0],'replacementIndexPath':d5})
 # The new registry/config plan is incomplete until independent Root science is
 # delivered; do not attach author-only P13 rows as if already resolved.
 entry['semanticAtomicityConfigPath']=str(OWN/'full-atomicity.config.json');entry['memoryReviewConfigPath']=str(OWN/'full-memory.config.json')
 write(out/'proposed-biologie-registry.entry.pending-science.json',entry)
 write(out/'integration-plan.pending-science.json',{'schemaVersion':1,'status':'inactive_technical_preparation_pending_root_P13_EDA_A5_M5_P4408_science','standaloneActiveApplicationPermitted':False,'applyCommandProvided':False,'hardMissingScientificReceipts':['Root independent P13 final freeze with new first-case EDA finding resolved','Root independent NI5 A5/M5 actual science','Root existing4408 P1 targeted context science'],'currentCanonicalPath':str(CAN),'currentRegistryPath':str(REG),'currentRegistrySHA256':sha(ROOT/REG),'protectedOtherRawRegistryEntries':{s:hashlib.sha256(v[3].encode()).hexdigest() for s,v in parts.items() if s!='biologie'},'protectedCurrent49GoalIds':bio['strictCompleteGoalIds'],'explicitFutureDeltaFiles':deltas,'explicitFutureAssetInstallFiles':assets,'explicitCanonicalFieldDeltas':fields,'explicitNewWholeGoals':[new[gid] for gid in new if gid not in old],'nativeRoot':str(CODE.relative_to(ROOT)),'nativeActualFutureReportRequired':True,'expectedCurrentAtomicDenominatorNotAnAdoptionClaim':383,'humanApproval':False,'humanTrial':False,'activeWrites':0})
 # Seed A/M rows honestly; the five prior author-informed rows remain pending
 # replacement by Root scientific receipts before any final candidate freeze.
 acfg=read(Path(parts['biologie'][2]['semanticAtomicityConfigPath']));mcfg=read(Path(parts['biologie'][2]['memoryReviewConfigPath']))
 aold=jsonl(ROOT/acfg['reviewPath']);mold=jsonl(ROOT/mcfg['reviewPath']);assert len(aold)==len(mold)==365
 anew=aold+ [r for r in jsonl(ROOT/OLD5/'semantic-atomicity.candidate.review.jsonl') if r['goalId'] in five]+jsonl(ROOT/AM/'atomicity.thirteen.current.review.jsonl')
 mnew=mold+ [r for r in jsonl(ROOT/OLD5/'memory-card-review.candidate.review.jsonl') if r['goalId'] in five]+jsonl(ROOT/AM/'memory.thirteen.current.review.jsonl')
 for cfg,rr,label in [(acfg,anew,'atomicity'),(mcfg,mnew,'memory')]:
  cfg['reviewPath']=str(OWN/f'full-{label}.review.jsonl');cfg['reportPath']=str(OWN/f'full-{label}.report.md')
  for row in rr:row['reviewId']=cfg['reviewId']
  assert len(rr)==383 and len({x['goalId'] for x in rr})==383
  writejsonl(out/f'full-{label}.review.jsonl',rr);write(out/f'full-{label}.config.json',cfg)
 cards=jsonl(ROOT/mcfg['cardReviewPath']);extra=jsonl(ROOT/AM/'memory.ten.current.cards.review.jsonl')
 for row in extra:row['reviewId']=mcfg['reviewId']
 writejsonl(out/'full-memory.cards.review.jsonl',cards+extra);mcfg['cardReviewPath']=str(OWN/'full-memory.cards.review.jsonl');mcfg['visibilityScopeCoverageRequired']=True;mcfg['visibilityScopes']+=read(AM/'memory.thirteen.current.config.json')['visibilityScopes'];write(out/'full-memory.config.json',mcfg)
 # Own positive files remain author-only and are not added to the pending
 # central registry. They permit exact targeted native binding work later.
 cand=read(P/'positive.eighteen.first-case-amended-author.candidates.json');pcfg=read(P/'positive.eighteen.first-case-amended-author.config.json');pcfg['landscapePath']=str(CAN);pcfg['semanticKindLedgerPath']=str(KIND);pcfg['reviewPath']=str(OWN/'positive.eighteen.current.review.jsonl');pcfg['scope']['label']='Technical current NI P18 binding candidate; Root independent science receipt required for author-revised13';write(out/'positive.eighteen.current.candidates.json',cand);write(out/'positive.eighteen.current.config.json',pcfg)
 # Traverse only dependencies selected by the actual Bio consumers.
 pending=[Path(p) for p in parts['biologie'][2]['resolutionIndexPaths']+parts['biologie'][2]['positiveEvidenceConfigPaths']+[str(D/'native-d18/resolution-index.json'),str(D/'native-d5/resolution-index.json'),str(ATLAS),str(BOOK),str(source_rel),str(mapping_rel),str(AUTH/'canonical.biologie.current.inactive.snapshot.json'),str(AUTH/'semantic-kinds.native-shape.inactive.snapshot.json')]]
 seen=set();linked=[]
 while pending:
  rel=pending.pop()
  if str(rel) in seen:continue
  seen.add(str(rel));src=ROOT/rel
  if not src.is_file():continue
  if not (CODE/rel).exists():native_link(src,rel);linked.append(str(rel))
  if src.suffix not in {'.json','.jsonl'}:continue
  try:data=json.loads(src.read_text()) if src.suffix=='.json' else jsonl(src)
  except ValueError:continue
  def walk(v):
   if isinstance(v,dict):
    for x in v.values():walk(x)
   elif isinstance(v,list):
    for x in v:walk(x)
   elif isinstance(v,str) and v.startswith(('curricula/','app/','docs/','backend/','contracts/')) and (ROOT/v).is_file():pending.append(Path(v))
  walk(data)
  if src.name=='resolution-index.json':
   for g in data.get('groups',[]):
    for p in (src.parent/g.get('artifactDirectory','.')).rglob('*'):
     if p.is_file():
      q=p.relative_to(ROOT)
      if p.suffix in {'.json','.jsonl','.md','.txt'} and not (CODE/q).exists():nativecopy(p,q)
      elif not (CODE/q).exists():native_link(p,q)
  if rel==BOOK:
   pass
 # Thin canonical registry/input dependencies used by ontology/schema compiler.
 for p in (ROOT/'curricula').glob('**/*.schema.json'):native_link(p,p.relative_to(ROOT))
 native_link(ROOT/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',Path('curricula/DE/Gymnasium/provenance/source-landscape-registry.json'))
 native_link(ROOT/'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json',Path('curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'))
 active_before=[]
 for rel in [CAN,KIND,QA,REG,ATLAS]:
  dst=out/'preserved-active-before-inputs'/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/rel,dst);active_before.append({'path':str(rel),'preservedCopy':str(dst.relative_to(ROOT)),'sha256':sha(dst)})
 write(out/'small-native-root-and-active-before.actual.receipt.json',{'createdAtUTC':datetime.now(timezone.utc).isoformat(),'nativeRoot':str(CODE.relative_to(ROOT)),'executableAndConfigCopiedFiles':len(copied),'selectedReadOnlyDependencies':linked,'prospectiveReviewedImageAndPromptInputs':len(assets),'preservedActiveBefore':active_before,'noFullRepoOrPublicCopy':True,'activeWrites':0,'noApplyCommand':True})
 shutil.copy2(CODE/'prepare_inactive_native.py',out/'prepare_inactive_native.py')
 print(json.dumps({'status':'technical_pending_independent_science','current':49,'prospectiveAtomic':383,'wholeGoals':464,'newWholeGoals':21,'fullAandMRows':383,'imagePromptInstallFiles':len(assets),'changedExistingWholeObjects':len(fields),'readOnlySelectedDeps':len(linked),'activeWrites':0,'root':str(CODE)}))

if __name__=='__main__':main()
