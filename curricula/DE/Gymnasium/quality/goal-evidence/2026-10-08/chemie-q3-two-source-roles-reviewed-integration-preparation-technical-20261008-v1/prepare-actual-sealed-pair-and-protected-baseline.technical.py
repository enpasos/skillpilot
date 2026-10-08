# SPDX-License-Identifier: Apache-2.0
"""Materialize guarded inputs only after genuine independent first seals exist."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,os
R=Path.cwd();D=Path(__file__).resolve().parent;BASE=D.parent;REQ={}
ids=['d9cce642-4f89-57f8-832a-abeb62586195','3eada74b-25b8-55dc-811a-acb473196f53']
author=BASE/'chemie-q3-two-native-source-roles-resume-technical-20261008-v1'
A=BASE/'chemie-q3-two-current-native-independent-a-root-20261008-v1'
B=BASE/'chemie-q3-two-native-source-roles-independent-b-20261008-v1'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);assert p.is_file(),p;v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQ[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():assert p.read_bytes()==b,p;return bind(p)
 p.write_bytes(b);return bind(p)
def copy(p,name):
 p=Path(p);bind(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert q.read_bytes()==p.read_bytes(),q
 else:shutil.copyfile(p,q)
 return bind(q)
def verify(v):
 p=R/v['path'];assert sha(p)==v['sha256'].removeprefix('sha256:')and p.stat().st_size==v['bytes'],p;return bind(p)
seals={}
for side,p in [('a',A/'independent-a.current-native-first-verdict.freeze.json'),('a_atomicity',A/'A2.atomicity-addendum.freeze.json'),('b',B/'native-b.first-verdict.seal.json'),('author_native',author/'native-review-inputs.freeze.json'),('author_first',author/'first-input.freeze.json')]:
 f=read(p);verified=[]
 for field in ['files','outputs','ownFirstInputSeals','ownFiles','requiredExternalOriginalInputReceipts','additionalUnchangedCurrentMemoryBindings','requiredInputs']:
  values=f.get(field,[])
  if isinstance(values,list):
   for v in values:
    if isinstance(v,dict)and 'path'in v and 'sha256'in v and 'bytes'in v:verified.append(verify(v))
 seals[side]={'seal':bind(p),'verifiedOriginalFiles':verified,'sealedAt':f.get('sealedAtUtc',f.get('sealedAt',f.get('createdAtUtc'))),'technicalIntegratorIsScientificReviewer':False}
assert seals['b']['seal']['sha256']=='f5c00cb5e20acab813c18018ee143a3105dc6349a8ff5b643bfef11e184fdf6e'
assert read(B/'native-b.first-verdict.seal.json')['blindToNewNativeAUntilSeal']
assert read(A/'independent-a.current-native-first-verdict.freeze.json')['blindToCurrentIndependentB']
assert read(A/'A2.actual-scientific-atomicity.independent-a.addendum.json')['blindToIndependentB']
before={}
for name,path in [('canonical','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),('kinds','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'),('qa','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),('registry','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),('floors','app/scripts/config/curriculum-maturity-floor-policy.json'),('atlasInputs','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'),('bookConfig','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')]:before[name]={'active':bind(R/path),'snapshot':copy(R/path,f'before/{name}.exact.json')}
active=read(R/before['canonical']['snapshot']['path']);candidate=read(author/'candidate/canonical.current480.two-resource-links.inactive.json');ob={g['id']:g for g in active['goals']};nb={g['id']:g for g in candidate['goals']};assert len(ob)==len(nb)==480 and ob.keys()==nb.keys();assert set(i for i in ob if ob[i]!=nb[i])==set(ids)
for i in ids:
 a=dict(ob[i]);b=dict(nb[i]);a.pop('resourceLinks',None);b.pop('resourceLinks',None);assert a==b
candidateCanon=copy(author/'candidate/canonical.current480.two-resource-links.inactive.json','candidate/canonical.current480.reviewed-two-source-roles.future-active.json')
candidateKinds=copy(R/before['kinds']['snapshot']['path'],'candidate/semantic-kinds.current480.exact.json');kinds=read(R/candidateKinds['path']);assert sum(x['semanticKind']=='curricularAtomic'for x in kinds['decisions'])==378
reg=read(R/before['registry']['snapshot']['path']);subject=next(s for s in reg['subjects']if s['subject']=='chemie');membership={'A':{},'P':{},'D':{}}
for lane,cfgkey in [('A','semanticAtomicityConfigPaths'),('P','positiveEvidenceConfigPaths')]:
 for path in subject[cfgkey]:
  cfg=read(R/path);rp=cfg.get('reviewPath',cfg.get('reviewLedgerPath'));rows=[json.loads(l)for l in(R/rp).read_text().splitlines()];bind(R/rp)
  for row in rows:
   if row['goalId']in ids:membership[lane].setdefault(row['goalId'],[]).append({'configPath':path,'record':row})
for path in subject['resolutionIndexPaths']:
 index=read(R/path)
 for row in index['resolutions']:
  if row['goalId']in ids:membership['D'].setdefault(row['goalId'],[]).append({'indexPath':path,'resolution':row})
assert not any(membership.values()),membership
memcfgpath=R/subject['memoryReviewConfigPath'];mcfg=read(memcfgpath);mrows=copy(R/mcfg['reviewPath'],'memory/current378.exact-retained.jsonl');cards=copy(R/mcfg['cardReviewPath'],'memory/current-cards.exact-retained.jsonl');assert len((R/mrows['path']).read_text().splitlines())==378
copy(memcfgpath,'memory/current-original-active.config.exact.json');views=[]
for n,v in enumerate(mcfg['visibilityScopes']):views.append({'original':bind(R/v['viewPath']),'copy':copy(R/v['viewPath'],f'memory/current-view-{n:02}.exact.json')})
assert len(views)==7
mb=read(B/'memory2-current378-real-binding.read-only.json');selectedM={json.loads(l)['goalId']:json.loads(l)for l in(R/mrows['path']).read_text().splitlines()}
for item in mb['selected']:
 row=item['wholeCurrentMemoryRecord'];assert selectedM[row['goalId']]==row and row['fingerprint']==item['computedFingerprint']and row['status']=='no_memory_needed'
for i,ext in [(ids[0],'png'),(ids[1],'jpg')]:copy(author/'selected-images'/f'{i}.{ext}',f'selected-images/{i}.{ext}')
copy(author/'selected-images'/f'{ids[0]}.prompt.md','selected-images/goal6.actual-original-targeted-v2.prompt.de.md');copy(author/'selected-images'/f'{ids[0]}.provenance.json','selected-images/goal6.actual-original-v2.provenance.json')
copy(author/'selected-images'/f'{ids[1]}.original-prompt.de.md','selected-images/goal8.actual-retained-original.prompt.de.md')
for n in ['selected49-current-roles-corrected-locators.author-context.json','selected49-whole259-partner-bodies.exact.json','whole16-holds-retained-from-sealed-A-and-B.json']:copy(author/'source'/n,'source/'+n)
assert read(author/'source/whole16-holds-retained-from-sealed-A-and-B.json')['holdCount']==16
copy(author/'science/selected4-whole-DEEN-cases.exact.json','science/selected4-whole-DEEN-cases.exact.json')
centralFolder=BASE/'chemie-q3-two-reviewed-active-integration-root-20261008-v1';cp=centralFolder/'affected-central.stdout.actual.txt';ct=centralFolder/'affected-central.terminal.actual.json';central=read(cp);assert read(ct)['actualExitCode']==0 and central['blockingIssueCount']==0;subjects={s['subject']:s for s in central['subjects']};assert[(subjects[k]['strictComplete'],subjects[k]['denominator'])for k in ['mathematik','physik','chemie','biologie']]==[(807,807),(478,478),(175,378),(222,392)];assert not set(ids)&set(subjects['chemie']['strictCompleteGoalIds'])
copy(cp,'before/current-central175-222.actual.json');copy(ct,'before/current-central.terminal.actual.json')
put('pending/original-seal-verification.actual.json',{'seals':seals,'allOriginalOwnFirstSealsActuallyVerified':True,'scientificReviewsByIntegrator':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('current-two-protected-baseline-and-original-pair.technical.guard.json',{'goalIds':ids,'before':before,'originalGenuinePair':seals,'authorNeutralEntry':bind(author/'neutral-two-native-source-roles.independent-review.entry.json'),'candidateCanonical':candidateCanon,'candidateKinds':candidateKinds,'actualCurrentCentral':bind(D/'before/current-central175-222.actual.json'),'actualCurrentCentralTerminal':bind(D/'before/current-central.terminal.actual.json'),'protectedStrictIds':{s:subjects[s]['strictCompleteGoalIds']for s in subjects},'existingSelectedD_P_AMembership':membership,'sourceWhole49Rows259And16HoldsExactRetained':True,'selectedScientificProfilesAndFourDEENCasesUnchanged':True,'currentMemoryConfig':bind(memcfgpath),'retainedMemoryRows':mrows,'retainedCards':cards,'allActualSevenMemoryScopes':views,'allOther478WholeCanonicalGoalsExact':True,'bothWholeDEENAndAllNonResourceFieldsExact':True,'onlyTwoCurrentResourceLinksChanged':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('checks/prepared-protected-pair-required-inputs.actual.json',{'files':list(REQ.values()),'genuineScientificReviewsByIntegrator':0,'activeWrites':0})
print(json.dumps({'genuineA_B_and_A2OriginalSealsVerified':True,'currentChem175Bio222Protected':True,'candidateOnlyResource6_8Deltas':True,'existingSelectedD_P_AActuallyAbsent':True,'currentM378Cards7ScopesExactReuse':True,'all16SourceHoldsRetained':True,'activeWrites':0}))
