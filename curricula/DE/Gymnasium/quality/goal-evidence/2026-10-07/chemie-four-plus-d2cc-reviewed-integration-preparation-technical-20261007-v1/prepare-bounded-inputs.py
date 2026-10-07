#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import copy,datetime,hashlib,json,pathlib,shutil
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OWN=pathlib.Path(__file__).resolve().parent;DAY=OWN.parent
AUTHOR=DAY/'chemie-two-corrected-raster-current-native-author-20261007-v1';OLD=DAY/'chemie-b007-b014-four-current479-native-refresh-author-20261007-v2';B=DAY/'chemie-b007-b014-four-current-independent-b-20261007-v2'
IDS=['9e656697-fc05-5aa9-9aca-871af2e89eb7','f0939f88-a6af-5334-ac4d-5d54732af25a','28bb9d15-f865-5843-a035-6066580fea64','1c1420c2-a8e2-520f-8015-6df637a973bd'];NEWPNG=[IDS[1],IDS[3]];SUPPORT='417e65ec-68be-5f2e-9452-c3ba9b1d362f'
def read(p):return json.loads(p.read_text())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def rel(p):return str(p.relative_to(ROOT))
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('xb') as f:f.write(v if isinstance(v,bytes) else v.encode() if isinstance(v,str) else (json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
def bind(p):return {'path':rel(p),'sha256':digest(p.read_bytes()),'bytes':p.stat().st_size}
def verify(directory,filename,expected=None):
 p=directory/filename
 if expected:assert digest(p.read_bytes())=='sha256:'+expected
 x=read(p);files=x.get('payloads',x.get('files',x.get('ownFiles')))
 for row in files:
  target=ROOT/row['path'] if row['path'].startswith(('curricula/','app/','backend/')) else directory/row['path'];assert digest(target.read_bytes()).removeprefix('sha256:')==row.get('digest',row.get('sha256')).removeprefix('sha256:');assert target.stat().st_size==row['bytes']
 return {'seal':bind(p),'verifiedPayloads':len(files)}
seals={
 'originalA':verify(DAY/'chemie-four-current-independent-a-20261007-v1','first-pass.freeze.json'),
 'originalATechnical':verify(DAY/'chemie-four-current-independent-a-20261007-v1/technical-followup','technical.final.freeze.json'),
 'originalB':verify(B,'reviewer-b.final.freeze.json'),
 'correctedA':verify(DAY/'chemie-two-corrected-current-native-independent-a-20261007-v1','reviewer.final.seal.json','6e0a2954cfd48776ffbf65845206994b860c13e04e4035c1b68894863af696ec'),
 'correctedB':verify(DAY/'chemie-two-corrected-current-independent-b-followup-20261007-v1','reviewer-b.final.freeze.json'),
 'contextA':verify(DAY/'chemie-d2cc-memory-reverse-context-current-independent-a-20261007-v1','reviewer.final.seal.json','8070f4c94f945e82f06c96dc2e801041a86129b8476bec65393010a4441798ea'),
 'contextB':verify(DAY/'chemie-d2cc-memory-reverse-context-independent-b-20261007-v1','reviewer.final.sealed.json','8e46c221a00ac96ef43b621232ca3440dc1e2b3229ed92f2d29ee63d893ad427'),
 'imageAuthor':verify(AUTHOR,'author.final.freeze.json','d8f932d9526b1eccd25a37104f81088452ed7fa1f757ac5f6e6c57ff8e853ad0')
}
write(OWN/'checks/source-seals.actual.json',seals)
paths={'canonical':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','kinds':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','qa':'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','registry':'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'}
before={k:read(ROOT/p) for k,p in paths.items()}
for k,p in paths.items():write(OWN/'before'/p,(ROOT/p).read_bytes())
candidate=read(AUTHOR/'candidate/canonical.current480-two-corrected-images-and-reviewed-support.json');oldby={g['id']:g for g in before['canonical']['goals']};by={g['id']:g for g in candidate['goals']}
assert len(oldby)==479 and len(by)==480 and set(by)-set(oldby)=={SUPPORT} and set(oldby)-set(by)==set()
changes=[]
for id,oldg in oldby.items():
 if oldg!=by[id]:changes.append({'goalId':id,'changedFields':[k for k in set(oldg)|set(by[id]) if oldg.get(k)!=by[id].get(k)]})
parents=[x for x in changes if x['goalId'] not in IDS];assert len(parents)==1 and parents[0]['changedFields']==['contains']
parent=parents[0]['goalId'];assert by[parent]['contains']==oldby[parent]['contains']+[SUPPORT]
assert set(x['goalId'] for x in changes)==set(IDS)|{parent}
assert {k:v for k,v in candidate.items() if k!='goals'}=={k:v for k,v in before['canonical'].items() if k!='goals'}
assert by[SUPPORT]==read(DAY/'chemie-d2cc-memory-reverse-context-current-neutral-author-20261007-v1/native/one/current-neutral-full-input.json')['newMemorySupportGoal']
write(OWN/'candidate/canonical.json',candidate)
kinds=read(AUTHOR/'candidate/semantic-kinds.current-inert.json');oldkind={r['goalId']:r for r in before['kinds']['decisions']}
assert len(kinds['decisions'])==480
for row in kinds['decisions']:
 if row['goalId']==SUPPORT:assert row['semanticKind']=='memory' and row['decisionStatus']=='authoritative'
 else:
  old=oldkind[row['goalId']];assert {k:v for k,v in row.items() if k!='sourceFingerprint'}=={k:v for k,v in old.items() if k!='sourceFingerprint'}
kinds['sourceLandscapePath']=rel(OWN/'candidate/canonical.json');write(OWN/'candidate/semantic-kinds.json',kinds)
futurekinds=copy.deepcopy(kinds);futurekinds['sourceLandscapePath']=paths['canonical'];write(OWN/'candidate/semantic-kinds.future-active.json',futurekinds)
write(OWN/'candidate/review-view.json',(AUTHOR/'candidate/review-view.original-input.json').read_bytes())
qa=copy.deepcopy(before['qa']);asset_plan=[]
for row in qa['records']:
 if row['goalId'] not in IDS:continue
 g=by[row['goalId']];row['title']=g['title'];row['description']=g['description']
 if g['id'] not in NEWPNG:continue
 link=next(x for x in g['resourceLinks'] if x['type']=='goal-visualization');asset=AUTHOR/'selected-images'/(g['id']+'.png');d=digest(asset.read_bytes())
 row.update(imageUrl=link['url'],publicAssetPath='app/public'+link['url'],canonicalAssetPath='curricula/DE/Gymnasium/visualizations/chemie/'+g['id']+'/'+g['id']+'.png',assetSha256=d,aiApproved='yes',aiApprovedAssetSha256=d,aiReviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),aiReviewer='Sealed independent current Chemie A and B; technical binding only',aiNotes='Two genuine independent current image/page KEEP verdicts; exact assets, original/360/680/PDF inspection and bounded P-image compatibility. Root is image author and is not an independent final reviewer. Small supporting labels require enlargement at360; no human or live host acceptance.',contentApprovedChatGpt='yes',umlautsCorrectChatGpt='yes',chatGptReviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),chatGptReviewer='Sealed independent current Chemie A and B; technical binding only',chatGptNotes='Current independent A/B KEEP bound to actual selected corrected PNG; retained source/body judgments and human fields remain separate.')
 old=next(x for x in before['qa']['records'] if x['goalId']==g['id'])
 for k in old:
  if k.startswith('human'):assert row[k]==old[k]
 destinations=[row['canonicalAssetPath'],row['publicAssetPath'],'backend/src/main/resources/static'+link['url']]
 asset_plan.append({'goalId':g['id'],'source':bind(asset),'destinations':destinations,'assetSha256':d,'oldJPEGPreserved':old['publicAssetPath'],'independentReviewSeals':[seals['correctedA'],seals['correctedB']],'authorExcludedFromFinalReview':True,'license':'CC-BY-4.0','provider':'OpenAI / ChatGPT-Codex built-in image_gen','exactImageModel':'not exposed'})
write(OWN/'candidate/visualization-qa.future-active.json',qa)
inertqa=copy.deepcopy(qa)
for row in inertqa['records']:
 if row['goalId'] in NEWPNG:row['publicAssetPath']=rel(AUTHOR/'selected-images'/(row['goalId']+'.png'))
write(OWN/'candidate/visualization-qa.inert-model.json',inertqa);write(OWN/'checks/future-product-image-install-plan.actual.json',asset_plan)
subject=copy.deepcopy(next(s for s in before['registry']['subjects'] if s['subject']=='chemie'))
mcfg=read(B/'memory/current378-three-independent-b.candidate.config.json');write(OWN/'memory/current378.records.jsonl',(ROOT/mcfg['reviewPath']).read_bytes());write(OWN/'memory/current55-exact-plus18.cards.jsonl',(ROOT/mcfg['cardReviewPath']).read_bytes())
future_m={**mcfg,'landscapePath':paths['canonical'],'reviewPath':rel(OWN/'memory/current378.records.jsonl'),'cardReviewPath':rel(OWN/'memory/current55-exact-plus18.cards.jsonl'),'reportPath':rel(OWN/'checks/memory-current378.future.report.md')};write(OWN/'memory/current378.future-active.config.json',future_m)
inert_m={**future_m,'landscapePath':rel(OWN/'candidate/canonical.json'),'reportPath':rel(OWN/'checks/memory-current378.inert.report.md')};write(OWN/'memory/current378.inert.config.json',inert_m);subject['memoryReviewConfigPath']=rel(OWN/'memory/current378.future-active.config.json')
assert len((OWN/'memory/current378.records.jsonl').read_text().splitlines())==378 and len((OWN/'memory/current55-exact-plus18.cards.jsonl').read_text().splitlines())==73 and len(mcfg['visibilityScopes'])==7 and mcfg['visibilityScopeCoverageRequired']
atomic_ids=[IDS[0],IDS[3]];replace_a=[]
for i,p in enumerate(subject['semanticAtomicityConfigPaths']):
 cfg=read(ROOT/p);raw=(ROOT/cfg['reviewPath']).read_text().splitlines(keepends=True);affected=[line for line in raw if json.loads(line)['goalId'] in atomic_ids]
 if not affected:continue
 assert all(any(json.loads(l)['goalId']==id for l in raw) for id in atomic_ids if any(json.loads(l)['goalId']==id for l in affected))
 remaining=[l for l in raw if json.loads(l)['goalId'] not in atomic_ids];out=OWN/'atomicity'/(str(i)+'.exact-residual.records.jsonl');write(out,''.join(remaining));newcfg={**cfg,'reviewPath':rel(out),'scope':{'label':cfg['scope']['label']+'; exact residual excluding separately current reviewed9e/1c','leafGoalIds':[json.loads(l)['goalId'] for l in remaining]}}
 futurepath=OWN/'atomicity'/(str(i)+'.residual.future-active.config.json');write(futurepath,newcfg);write(OWN/'atomicity'/(str(i)+'.residual.inert.config.json'),{**newcfg,'landscapePath':rel(OWN/'candidate/canonical.json')});replace_a.append({'oldConfigPath':p,'replacementConfigPath':rel(futurepath),'retainedRecordLinesExact':True,'removedGoalIds':[json.loads(l)['goalId'] for l in affected]})
acfg=read(B/'atomicity/two-current-independent-b.config.json');write(OWN/'atomicity/current-two.records.jsonl',(ROOT/acfg['reviewPath']).read_bytes());afuture={**acfg,'landscapePath':paths['canonical'],'reviewPath':rel(OWN/'atomicity/current-two.records.jsonl')};write(OWN/'atomicity/current-two.future-active.config.json',afuture);write(OWN/'atomicity/current-two.inert.config.json',{**afuture,'landscapePath':rel(OWN/'candidate/canonical.json')})
for r in replace_a:subject['semanticAtomicityConfigPaths']=[r['replacementConfigPath'] if x==r['oldConfigPath'] else x for x in subject['semanticAtomicityConfigPaths']]
subject['semanticAtomicityConfigPaths'].append(rel(OWN/'atomicity/current-two.future-active.config.json'))
protected=read(DAY/'biologie-current3-and-portability-commit-checkpoint-root-20261007-v1/stable-current-five-gate-report-repaired.actual.report.json');report=next(s for s in protected['subjects'] if s['subject']=='chemie');assert report['strictComplete']==169 and report['denominator']==378 and len(report['strictCompleteGoalIds'])==169 and protected['blockingIssueCount']==0
protected_ids=report['strictCompleteGoalIds'];assert set(IDS).isdisjoint(protected_ids)
for id in protected_ids:assert by[id]==oldby[id]
write(OWN/'checks/protected-current169.actual.json',{'baselineReport':bind(DAY/'biologie-current3-and-portability-commit-checkpoint-root-20261007-v1/stable-current-five-gate-report-repaired.actual.report.json'),'strictComplete':169,'denominator':378,'protectedStrictGoalIds':protected_ids,'protectedWholeCanonicalGoalsExact':True,'d2ccOnlyCurrentReverseContextNeedsTargetedD1':True,'newClosureCounted':0})
write(OWN/'checks/bounded-canonical-kinds-atomicity-plan.actual.json',{'beforeBindings':{k:bind(ROOT/p) for k,p in paths.items()},'canonicalChangedFields':changes,'newSupportGoal':SUPPORT,'supportParentAppend':parent,'wholeCanonicalOther474Exact':True,'existingSemanticKindsClassificationExact':True,'memorySupportKind':'memory','atomicityConfigReplacements':replace_a,'otherSubjectsMustRemainExactAtApply':True,'wholeRegistryOverwriteAllowed':False,'activeWrites':0})
write(OWN/'candidate/chemie.registry-subject.partial.json',subject)
write(OWN/'checks/declared-current-preparation-state.json',{'stage':'Bounded input, A2/M378 and future QA image install plan prepared; P4 and native D4+D1 synthesis follows','reviewAuthority':'ai_candidate','humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGain':0})
print('Prepared canonical479→480 bounded5 changes+support; kind480 exactclasses; A2 residuals; M378+73cards seven real scopes; QAnew2 future product paths; protected169 whole goals exact.')
