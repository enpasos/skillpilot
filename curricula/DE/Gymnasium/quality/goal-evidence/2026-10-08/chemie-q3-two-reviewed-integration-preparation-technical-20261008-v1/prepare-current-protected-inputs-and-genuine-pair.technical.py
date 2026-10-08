# SPDX-License-Identifier: Apache-2.0
"""Technical original sealed pair adoption only; no independent author judgments."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib,json,shutil,os
R=Path.cwd();D=Path(__file__).resolve().parent;BASE=D.parent;REQ={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p;return bind(p)
 t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p);return bind(p)
def copy(p,name):
 p=Path(p);bind(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert q.read_bytes()==p.read_bytes(),q
 else:shutil.copyfile(p,q)
 return bind(q)
ids=['9f0d6d4c-f918-5a44-a9a2-7732c4e338f3','c95f6059-d7c2-5bcd-b61e-95e3577efdb2'];seals={}
for side,name,digest in [('a','completed-current-two-corrosion-D-P-V.independent-a.final.freeze.json','82cfcaa97935ef86acb324067022da92f508a2ec9e3388b13d21179e8c3923de'),('b','two-current-whole-D-P-V-independent-b.completed.final.freeze.json','0972e69142b9bbdc44aba2a0723c5a1c9b5ba0b3256d9ee8fdec6cdda6a88b35')]:
 p=BASE/f'chemie-q3-two-corrosion-final-raster-native-independent-{side}-20261008-v2'/name;assert sha(p)==digest;f=read(p);verified=[]
 for v in f.get('ownFiles',f.get('files',[])):
  q=R/v['path'];assert sha(q)==v['sha256'].removeprefix('sha256:')and q.stat().st_size==v['bytes'],q;verified.append(bind(q))
 assert f['activeWrites']==0 and not f['humanApproval'];seals[side]={'seal':bind(p),'verifiedOriginalFiles':verified,'sealedAt':f['sealedAt'],'genuineIndependentOwnFirstBeforePeer':True,'technicalIntegratorScientificReviewClaim':False}
author=BASE/'chemie-q3-whole-twenty-raster-native-remediation-technical-20261008-v2';f=read(author/'final-two-current480-378-raster-native-author.first-input.freeze.json');assert sha(author/'final-two-current480-378-raster-native-author.first-input.freeze.json')=='ae9ad505f693b1f8c6bf1e947a4c001f775e34070e14d6323b1364cae3724233'
for v in f['ownFiles']:
 p=R/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:')and p.stat().st_size==v['bytes'],p;bind(p)
before={}
for name,path in [('canonical','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),('kinds','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),('qa','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),('registry','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),('floors','app/scripts/config/curriculum-maturity-floor-policy.json'),('atlasInputs','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'),('bookConfig','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')]:before[name]={'active':bind(R/path),'snapshot':copy(R/path,f'before/{name}.exact.json')}
assert before['canonical']['active']['sha256']=='f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84';reg=read(R/before['registry']['snapshot']['path']);sub=next(s for s in reg['subjects']if s['subject']=='chemie');missingA={i:[]for i in ids};wholeA=[]
for path in sub['semanticAtomicityConfigPaths']:
 cfg=read(R/path);rp=cfg.get('reviewPath',cfg.get('reviewLedgerPath'));p=R/rp;bind(p);rows=[json.loads(l)for l in p.read_text().splitlines()];wholeA.append({'config':bind(R/path),'review':bind(p),'existingRows':len(rows)})
 for row in rows:
  if row['goalId']in ids:missingA[row['goalId']].append({'config':path,'row':row})
assert not any(missingA.values())
mCfgPath=R/sub['memoryReviewConfigPath'];mCfg=read(mCfgPath);mReview=copy(R/mCfg['reviewPath'],'memory/current378.exact-retained.jsonl');mCards=copy(R/mCfg['cardReviewPath'],'memory/current-cards.exact-retained.jsonl');assert len((R/mReview['path']).read_text().splitlines())==378;views=[]
for n,v in enumerate(mCfg['visibilityScopes']):views.append({'original':bind(R/v['viewPath']),'copy':copy(R/v['viewPath'],f'memory/current-view-{n:02}.exact.json')})
candidatePath=author/'candidate/canonical.current480.only-one-reviewed-correction-link.inactive.json';candidate=read(candidatePath);old=read(R/before['canonical']['snapshot']['path']);oldBy={g['id']:g for g in old['goals']};newBy={g['id']:g for g in candidate['goals']};assert len(oldBy)==len(newBy)==480 and oldBy.keys()==newBy.keys();changed=[i for i in oldBy if oldBy[i]!=newBy[i]];assert changed==[ids[1]]
for i in ids:
 a=dict(oldBy[i]);b=dict(newBy[i]);a.pop('resourceLinks',None);b.pop('resourceLinks',None);assert a==b
candidateCanon=copy(candidatePath,'candidate/canonical.current480.reviewed-corrosion-two.future-active.json');candidateKinds=copy(R/before['kinds']['snapshot']['path'],'candidate/semantic-kinds.current480.exact.json');assert sum(r['semanticKind']=='curricularAtomic'for r in read(R/candidateKinds['path'])['decisions'])==378
for i in ids:
 link=next(l for l in newBy[i]['resourceLinks']if l['type']=='goal-visualization'and l.get('role')=='primary');assert link['resourceType']=='image'and link['skillpilotId']==i and link['reviewStatus']=='pilot'and link['lang']=='de'and link['provider']and link['license']
copy(author/'selected-images'/f'{ids[0]}.jpg',f'selected-images/{ids[0]}.jpg');png=copy(author/'selected-images'/f'{ids[1]}.png',f'selected-images/{ids[1]}.png');assert png['sha256']=='c2b9f04acd7d2f3fe8bfa2cde3d152e16803c364ba6d420e0d9b386ca090f35b'
source=read(author/'source/whole-current-all20-1602-929-5459.lossless-exact.json');assert source['matchedEdges']==1602 and source['uniqueSourceDuties']==929 and sum(len(s['allPartnerRows'])for s in source['sourceGoals'])==5459;copy(author/'source/whole-current-all20-1602-929-5459.lossless-exact.json','source/whole1602-929-5459.exact-retained.json');copy(author/'source/final-two-whole-five-three-duty-and-all-partner-inputs.exact.json','source/two-whole-five-three-all-partners.exact-retained.json')
centralD=BASE/'biologie-he-evolution-eighteen-reviewed-integration-preparation-root-20261008-v1';central=read(centralD/'affected-central.stdout.actual.txt');term=read(centralD/'affected-central.terminal.actual.json');assert term['actualExitCode']==0 and central['blockingIssueCount']==0;subjects={s['subject']:s for s in central['subjects']};assert[(subjects[k]['strictComplete'],subjects[k]['denominator'])for k in ['mathematik','physik','chemie','biologie']]==[(807,807),(478,478),(173,378),(222,392)];assert not set(ids)&set(subjects['chemie']['strictCompleteGoalIds']);centralBinding=bind(centralD/'affected-central.stdout.actual.txt')
copy(mCfgPath,'memory/current-original-active.config.exact.json');mCandidate={**mCfg,'landscapePath':candidateCanon['path'],'reviewPath':mReview['path'],'cardReviewPath':mCards['path'],'reportPath':rel(D/'checks/current378-retained-M.actual.md'),'visibilityScopes':[{**v,'viewPath':views[n]['copy']['path']}for n,v in enumerate(mCfg['visibilityScopes'])]};put('memory/current378-retained.inactive.config.json',mCandidate)
put('pending/original-seal-verification.actual.json',{'seals':seals,'authorFirstInputSeal':bind(author/'final-two-current480-378-raster-native-author.first-input.freeze.json'),'allGenuineOriginalOwnTreesActuallyVerified':True,'scientificReviewsByIntegrator':0,'activeWrites':0,'strictGainClaimed':0})
put('current-two-protected-baseline-and-original-pair.technical.guard.json',{'goalIds':ids,'before':before,'originalGenuinePair':seals,'authorNeutralEntry':bind(author/'neutral-final-two-corrosion-current480-378-raster-native-author.entry.json'),'candidateCanonical':candidateCanon,'candidateKinds':candidateKinds,'actualCurrentCentral':centralBinding,'actualCurrentCentralTerminal':bind(centralD/'affected-central.terminal.actual.json'),'allOther479WholeCanonicalGoalsExact':True,'bothWholeDEENBodiesAndAllNonResourceFieldsExact':True,'only16ExistingReviewedResourceLinkChanges':True,'existingAConfigsAndRows':wholeA,'actualNeitherSelectedGoalHasExistingARecord':missingA,'genuineA2RowsRequired':'Technical adoption of explicit own final A/B atomic whole judgments, not new integrator scientific approval','currentMemoryConfig':bind(mCfgPath),'all378MemoryRowsAndCardsExact':True,'allActualSevenMemoryScopes':views,'allSources1602_929_5459AndFiveThreeRetained':True,'old18HoldsAndSeparateCase12Unchanged':True,'protectedStrictIDs':{s:subjects[s]['strictCompleteGoalIds']for s in subjects},'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('checks/prepared-baseline-pair-required-inputs.actual.json',{'files':list(REQ.values()),'activeWrites':0});print(json.dumps({'actualOriginalA_BSealsVerified':True,'currentChem173_378Bio222_392':True,'A2ActuallyMissingFromExisting17Configs':True,'current378MAndSevenScopesRetained':True,'candidateOnlyGoal16ResourceDelta':True,'activeWrites':0}))
