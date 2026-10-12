from pathlib import Path
import json,hashlib,shutil
R=Path('/home/enpasos/projects/skillpilot')
N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-current402-all182-open-claims-root-20261012-v2')
L=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
P=R/'tmp/chemie-m7-efficiency-plan/unclaimed123.readonly-packages.actual.json'
SHA='7abf3f6f97f0e7c68b53e85048aab270cb26984a4b1b8926b76cd7df3677cfa4'
assert hashlib.sha256(P.read_bytes()).hexdigest()==SHA
assert not (R/N).exists()
x=json.loads(P.read_text());before=json.loads((R/L).read_text());assert len(before['activeBatchConfigPaths'])==9
assert hashlib.sha256((R/L).read_bytes()).hexdigest()=='5e6a5b170b3ddd91b59df7b17293b246401b4b63a164ed0cc19869e41f0b1b93'
def wr(p,d):
 q=R/p;assert not q.exists(),p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
def cp(s,d):
 q=R/d;assert not q.exists();q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(s,q)
cp(P,N/'plan/unclaimed123.original-readonly-proposal.exact.json')
cp(P.with_suffix('.md'),N/'plan/unclaimed123.original-readonly-proposal.exact.md')
cp(R/L,N/'before-active/in-flight-work-ledger.original.exact.json')
report=json.loads((R/x['reportPath']).read_text());chem=next(s for s in report['subjects'] if s['subject']=='chemie');current=set(chem['currentGoalIds']) if 'currentGoalIds' in chem else set(x['strictCompleteGoalIds'])|set(x['allOpenGoalIds']);strict=set(chem['strictCompleteGoalIds']);openids=current-strict
assert len(current)==402 and len(strict)==220 and len(openids)==182
claimed=set()
for p in before['activeBatchConfigPaths']:
 c=json.loads((R/p).read_text());assert c['subject']=='chemie'
 ids=set(c['goalIds']);assert len(ids)==len(c['goalIds']) and not ids&claimed and ids<=openids;claimed|=ids
assert len(claimed)==59
template=json.loads((R/before['activeBatchConfigPaths'][-1]).read_text());added=[];reserved=set(claimed)
for pkg in x['packages']:
 ids=pkg['goalIds'];assert 1<=len(ids)<=20 and len(set(ids))==len(ids) and not set(ids)&reserved and set(ids)<=openids;reserved.update(ids)
 p=N/'claims'/f"{pkg['packageId']}.current402.claim.config.json"
 c={**template,'batchId':f"chemie-current402-complete-gap-queue-{pkg['packageId']}-20261012-v2",'bookId':f"chemie-current402-claim-{pkg['packageId']}-20261012-v2",'title':'Chemie – reservierter Arbeitsumfang: '+pkg['title'],'goalIds':ids,'outputDirectory':str(N/'claim-materializations'/pkg['packageId'])}
 wr(p,c);added.append(str(p))
assert reserved==openids
after={**before,'activeBatchConfigPaths':before['activeBatchConfigPaths']+added};assert after['activeBatchConfigPaths'][:9]==before['activeBatchConfigPaths']
wr(N/'plan/proposed16-claim-ledger.json',after)
(R/L).write_text(json.dumps(after,indent=2,ensure_ascii=False)+'\n')
wr(N/'checks/registration-and-exhaustive-partition.actual.json',{'schemaVersion':1,'role':'Registered pending work only; no scientific reviews or active curriculum changes','currentDenominator':402,'currentStrict':220,'currentOpen':182,'existingClaimsPreserved':9,'existingClaimedOpenIds':59,'newClaims':7,'newClaimedOpenIds':123,'claimedOpenTotal':182,'overlapCount':0,'outsideCurrentCount':0,'alreadyStrictClaimCount':0,'protectedSubjectClaimCount':0,'everyCurrentOpenIdClaimedExactlyOnce':True,'existingNinePathsOrderedExact':True,'previousLedgerSHA':'sha256:'+hashlib.sha256((R/N/'before-active/in-flight-work-ledger.original.exact.json').read_bytes()).hexdigest(),'currentLedgerSHA':'sha256:'+hashlib.sha256((R/L).read_bytes()).hexdigest(),'newClaimPaths':added,'scientificNetGain':0,'canonicalOrRegistryWrites':False,'humanApproval':False,'humanTrial':False})
print(json.dumps({'registered':7,'activeClaims':16,'openIdsExactlyClaimed':182,'newScientificClosures':0}))
