#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare reviewed Q1 deltas and registry ownership without active writes."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, shutil
ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
PREP = OWN.parent / 'chemie-q1-fourteen-current-native-candidate-v4'
ISO = ROOT / 'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v4'
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(name,v): (OWN/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def spans(t):
    p=t.index('[',t.index('"subjects"'))+1; d=json.JSONDecoder(); out={}
    while True:
        while t[p].isspace() or t[p]==',': p+=1
        if t[p]==']': return out
        v,n=d.raw_decode(t[p:]);out[v['subject']]=(p,p+n,v,t[p:p+n]);p+=n
assert not (OWN/'integration-plan.json').exists()
frozen=read(PREP/'prepared-current-inputs.final.freeze.json')
for r in frozen['files']: assert sha(ROOT/r['path'])==r['sha256'].removeprefix('sha256:')
current=(ROOT/REG).read_text(); parts=spans(current); chem=copy.deepcopy(parts['chemie'][2])
(OWN/'central-registry.before.snapshot.json').write_text(current)
newids=read(PREP/'positive-evidence.config.json')['scope']['goalIds']; assert len(newids)==14
configs=[]; replacements={}; records=[]
for label in ['acids-derivatives','soaps','preservatives']:
    old=f'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-q1-{label}.config.json'
    assert old in chem['semanticAtomicityConfigPaths']
    name=f'a-{label}.config.json'; cfg=read(PREP/name); source=ROOT/cfg['reviewPath']
    shutil.copy2(source,OWN/f'a-{label}.review.jsonl'); cfg['reviewPath']=str(REL/f'a-{label}.review.jsonl');cfg['reportPath']=str(REL/f'a-{label}.report.md');write(name,cfg)
    replacements[old]=str(REL/name); configs.append(str(REL/name))
    beforecfg=read(ROOT/old); before={r['goalId']:r for r in map(json.loads,(ROOT/beforecfg['reviewPath']).read_text().splitlines())}; after={r['goalId']:r for r in map(json.loads,source.read_text().splitlines())}
    assert before.keys()==after.keys()
    changed=[g for g in before if before[g]!=after[g]]
    assert all(g in newids for g in changed)
    records.append({'oldConfigPath':old,'oldReviewPath':beforecfg['reviewPath'],'oldReviewSHA256':sha(ROOT/beforecfg['reviewPath']),'newConfigPath':str(REL/name),'newReviewPath':cfg['reviewPath'],'exactUnchangedGoalIds':[g for g in before if g not in changed],'actualChangedGoalIds':changed,'noNewScopeOrDuplicateOwner':True})
for name,rev in [('positive-evidence.config.json','positive-evidence.review.jsonl'),('m-current-full.config.json','m-current-full.review.jsonl')]:
    cfg=read(PREP/name);shutil.copy2(ROOT/cfg['reviewPath'],OWN/rev);cfg['reviewPath']=str(REL/rev)
    if 'cardReviewPath' in cfg:
        shutil.copy2(ROOT/cfg['cardReviewPath'],OWN/'m-current-full.cards.review.jsonl');cfg['cardReviewPath']=str(REL/'m-current-full.cards.review.jsonl');cfg['reportPath']=str(REL/'m-current-full.report.md')
    write(name,cfg)
shutil.copy2(PREP/'positive-evidence.candidates.json',OWN/'positive-evidence.candidates.json')
chem['semanticAtomicityConfigPaths']=[replacements.get(p,p) for p in chem['semanticAtomicityConfigPaths']]
chem['positiveEvidenceConfigPaths'].append(str(REL/'positive-evidence.config.json'))
chem['memoryReviewConfigPath']=str(REL/'m-current-full.config.json')
bd='bd36dc58-c93e-5247-9e82-da2f9e4e2bed'; newindex=str(REL/'native-finalbook/resolution-index.json')
owners=[p for p in chem['resolutionIndexPaths'] if any(r['goalId']==bd for r in read(ROOT/p)['resolutions'])]
assert len(owners)==1 and not any(r['goalId']==bd for r in chem.get('resolutionSupersessions',[]))
assert not set(newids)&{r['goalId'] for p in chem['resolutionIndexPaths'] for r in read(ROOT/p)['resolutions']}
sup={'goalId':bd,'supersededIndexPath':owners[0],'replacementIndexPath':newindex};chem.setdefault('resolutionSupersessions',[]).append(sup);chem['resolutionIndexPaths'].append(newindex)
replacement=json.dumps(chem,ensure_ascii=False,indent=2).replace('\n','\n    '); a,b=parts['chemie'][:2]; proposed=current[:a]+replacement+current[b:]
(OWN/'central-registry.proposed.json').write_text(proposed)
assert all(parts[s][3]==spans(proposed)[s][3] for s in parts if s!='chemie')
write('central-chemie-future.config.json',{**read(ROOT/REG),'subjects':[chem]})
delta=read(PREP/'prepared-prospective-input-tree.receipt.json')['files']; assert len(delta)==24
for r in delta:
    r['sha256']=r['sha256'].removeprefix('sha256:');r['activeSHA256Before']=r.pop('baselineSHA256');r['activeSHA256Before']=r['activeSHA256Before'].removeprefix('sha256:') if r['activeSHA256Before'] else None
    assert sha(ROOT/r['prospectiveCopyPath'])==r['sha256']
    assert (sha(ROOT/r['futureActivePath']) if (ROOT/r['futureActivePath']).exists() else None)==r['activeSHA256Before']
before=read(ROOT/CAN); after=read(ISO/CAN); old={g['id']:g for g in before['goals']}; nxt={g['id']:g for g in after['goals']}
assert old.keys()==nxt.keys();fielddeltas=[]
for gid in old:
    fields=sorted(k for k in old[gid].keys()|nxt[gid].keys() if old[gid].get(k)!=nxt[gid].get(k))
    if not fields: continue
    assert gid in newids
    fielddeltas.append({'goalId':gid,'fields':[{'field':k,'beforeExists':k in old[gid],'before':old[gid].get(k),'afterExists':k in nxt[gid],'after':nxt[gid].get(k)} for k in fields]})
assert old['bf001d50-ad32-5de8-885d-bd09174a0f5e']==nxt['bf001d50-ad32-5de8-885d-bd09174a0f5e']
histories=[];removals=[]
for gid in ['db66635f-f1d1-5f70-bcc0-fed1ae424e52']:
    for base in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
        p=f'{base}/chemie/{gid}/{gid}.jpg';assert (ROOT/p).is_file(); dest=OWN/'historical-originals'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/p,dest)
        row={'originalPath':p,'preservedCopyPath':str(dest.relative_to(ROOT)),'sha256':sha(dest),'bytes':dest.stat().st_size};histories.append(row);removals.append(row)
    p=f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/prompt.de.md'
    if (ROOT/p).exists():
        dest=OWN/'historical-originals'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/p,dest);histories.append({'originalPath':p,'preservedCopyPath':str(dest.relative_to(ROOT)),'sha256':sha(dest),'bytes':dest.stat().st_size})
write('existing-ascorbate-jpg-exact-historical-preservation.actual.json',{'status':'exact_historical_bytes_preserved_before_import','rows':histories,'threeMissingActiveImageGoalIds':['ca216bc6-5205-5b46-abbd-fd5628e4ca5b','6765f741-42a6-55c5-a218-81b883b1f5ae','8a491e3b-5d0b-51d3-9b14-0977ec035dd6'],'ca216CorrectionWasInInactiveGenerationHistory':True,'activeWrites':0,'humanApproval':False})
baselinepath=str((OWN.parent/'chemie-biologie-b010-tf-methylation-integration-v1/central-current-combined.stdout.txt').relative_to(ROOT));baseline=next(x for x in read(ROOT/baselinepath)['subjects'] if x['subject']=='chemie');assert baseline['strictComplete']==90
write('integration-plan.json',{'schemaVersion':1,'status':'reviewable_inactive_plan_waiting_actual_native_future_report','preparedAtUTC':datetime.now(timezone.utc).isoformat(),'explicitFutureDeltaFiles':delta,'canonicalPath':CAN,'explicitCanonicalFieldDeltas':fielddeltas,'preservedOtherWholeGoalCount':len(old)-len(fielddeltas),'preservedOutsideQ1ClusterGoalId':'bf001d50-ad32-5de8-885d-bd09174a0f5e','centralRegistryPath':REG,'currentChemieRawEntrySHA256':hashlib.sha256(parts['chemie'][3].encode()).hexdigest(),'proposedChemie':chem,'protectedMathPhysRawEntries':{s:hashlib.sha256(parts[s][3].encode()).hexdigest() for s in ['mathematik','physik']},'unrelatedBiologieRegistryEntryPreservedAtApplication':True,'currentDescriptionIndexPath':newindex,'currentDescriptionIndexSHA256':sha(OWN/'native-finalbook/resolution-index.json'),'oneExistingBindingSupersession':sup,'currentAConfigPaths':configs,'currentP14ConfigPath':str(REL/'positive-evidence.config.json'),'currentM376ConfigPath':str(REL/'m-current-full.config.json'),'explicitArchivedOldImageRemovalPlan':removals,'historicalInputs':histories,'baselineCentralReportPath':baselinepath,'baselineCentralReportSHA256':sha(ROOT/baselinepath),'protectedCurrentStrict90GoalIds':baseline['strictCompleteGoalIds'],'expectedFourteenNewScientificGoalIds':newids,'bindingRestorationGoalIds':[bd],'sixSourceHoldGoalIds':['057a6826-f599-53b1-bdd1-5a83037a1494','39c85aa0-b01f-56ec-a148-b8009bf650f5','d742ecb0-0795-5446-a95d-9503d4618475','d76b80a2-5156-54f4-b3a1-546beddf0e14','d3cd250f-5221-589d-aa1c-44a4692d1acb','10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5'],'expectedFutureStrict':104,'expectedDenominator':376,'forceCountOrStatus':False,'wholeSnapshotResetPermitted':False,'humanApproval':False,'humanTrial':False,'activeWrites':0})
write('current-a-m-exact-preservation-and-registry-ownership.actual.json',{'threeReplacedCurrentAScopes':records,'preparedSubstantiveAMDecisionReceipt':str((PREP/'title-en-scientific-p-a-m-remediation.actual.receipt.json').relative_to(ROOT)),'fullMemory376ReviewSHA256':sha(OWN/'m-current-full.review.jsonl'),'cardReviewExactlyPreserved':sha(OWN/'m-current-full.cards.review.jsonl')==sha(PREP/'m-current-full.cards.review.jsonl'),'allOtherRawSubjectEntriesPreserved':True,'noHistoricalIndexDeleted':True,'onlyExistingBd36OwnerSuperseded':sup,'activeWrites':0,'humanApproval':False})
dest=ISO/REL;shutil.copytree(OWN,dest,dirs_exist_ok=True)
# Read-only original current inputs needed by native checks are physically copied.
pending=chem['semanticAtomicityConfigPaths']+chem['positiveEvidenceConfigPaths']+[chem['memoryReviewConfigPath']]+chem['resolutionIndexPaths']
seen=set();copied=[]
while pending:
    rel=pending.pop()
    if rel in seen:continue
    seen.add(rel);src=ROOT/rel;target=ISO/rel
    if not src.is_file():continue
    if not target.exists():target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target);copied.append(rel)
    if src.suffix not in {'.json','.jsonl'}:continue
    try:payload=read(src)
    except (ValueError,UnicodeDecodeError):continue
    def walk(v):
        if isinstance(v,dict):
            for x in v.values():walk(x)
        elif isinstance(v,list):
            for x in v:walk(x)
        elif isinstance(v,str) and v.startswith(('app/','curricula/','contracts/','docs/','backend/')) and Path(v).suffix in {'.json','.jsonl','.md'} and (ROOT/v).is_file():pending.append(v)
    walk(payload)
    if src.name.startswith('resolution-index'):
        for group in payload.get('groups',[]):
            if 'artifactDirectory' not in group:continue
            directory=src.parent/group['artifactDirectory']
            for path in directory.rglob('*'):
                if path.is_file() and 'node_modules' not in path.parts and path.suffix in {'.json','.jsonl','.md','.pdf','.html'}:
                    rp=str(path.relative_to(ROOT));dst=ISO/rp
                    if not dst.exists():dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dst);copied.append(rp)
write('minimal-current-readonly-dependency-copy.actual.json',{'paths':copied,'count':len(copied),'noFullRepositoryCopy':True,'noSourceOrPrivateCacheWrites':True,'activeWrites':0})
shutil.copy2(OWN/'minimal-current-readonly-dependency-copy.actual.json',dest/'minimal-current-readonly-dependency-copy.actual.json')
print(json.dumps({'plan':str(REL/'integration-plan.json'),'deltaFiles':24,'actualCanonicalChangedGoals':len(fielddeltas),'descriptionCandidates':15,'newScientificCandidates':14,'preservedBaselineStrict':90,'copiedReadOnlyDependencyFiles':len(copied),'activeWrites':0}))
