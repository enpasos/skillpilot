# Apache-2.0. Technical transport only; no scientific records are rewritten.
import copy,datetime,hashlib,json,os,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14';O=pathlib.Path(__file__).parent
I=E/'chemie-current407-joint-P5-native-D6-existing281-integration-technical-20261014-v1'
PA=E/'chemie-current407-058d-d124-whole-P-operator-targeted-independent-a-20261014-v1'
PB=E/'chemie-current407-058d-d124-whole-P-operator-alignment-targeted-independent-b-20261014-v1'
AU=E/'chemie-current407-058d-d124-whole-P-operator-alignment-targeted-remediation-author-20261014-v1'
P9=E/'chemie-current407-naturstoffe-P9-remediation-current-seven-shared-technical-20261014-v2'
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
G='058dca74-1b57-5eb3-9c94-1c7b6cc795ad';D='d1244f5d-9a12-5b74-97fe-ae974f40af26'
rd=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def verify(b):
 p=R/b['path'];assert sha(p)==b['sha256'],p
 if 'bytes'in b:assert p.stat().st_size==b['bytes'],p
 return p
def verify_seal(p):
 s=rd(p);rows=s.get('files',s.get('allFinitePublicFiles',[]));assert rows
 for b in rows:verify(b)
 return {'seal':bind(p),'allBoundFilesVerified':len(rows)}
as_=PA/'SEAL.finite-current058d-d124-P2-genuine-independent-a.actual.json';bs_=PB/'SEAL.finite-current058d-d124-targeted-P2-independent-b.actual.json'
assert sha(as_)=='sha256:cce10fd45e9a4db3e2439231d5f0513b05982f6405c5d83ad277bdb2b930c88e'
assert sha(bs_)=='sha256:f2acc8087d691d3c4c6ac2b3cb0aa8ca6e01e9d0608dc5ae0e6893c488d6b9fc'
paired=[verify_seal(as_),verify_seal(bs_)]
handoff=rd(I/'HANDOFF.exact-reusable-current286-config-and-private-H-state.actual.json')
cp=verify(handoff['actualMeasuredConfig']);central=rd(cp);s=central['subjects'][0]
assert len(central['subjects'])==1 and s['subject']=='chemie'
for k in ['actualCurrentCanonical','actualWholeCurrentQA','actualWholeCurrentSEM']:
 verify(handoff[k])
aliases={'canonical':s['landscapePath'],'semantic':s['semanticKindLedgerPath'],'QA':s['visualizationQaPath']}
for alias,key in [('canonical','actualCurrentCanonical'),('semantic','actualWholeCurrentSEM'),('QA','actualWholeCurrentQA')]:assert sha(H/aliases[alias])==handoff[key]['sha256']
assert sha(H/aliases['canonical'])=='sha256:0b032d398f65b6865ebb37b0a22af60009a700f52940885d5b18cf4189cf38c8'
canonical=rd(H/aliases['canonical']);gi={g['id']:g for g in canonical['goals']};assert len(gi)==533
qa=rd(H/aliases['QA']);assert len(qa['records'])==419
for row in qa['records']:
 for key in ['humanApproved','contentApprovedChatGpt','umlautsCorrectChatGpt','humanIssueIdentified']:assert row[key]in('yes','no')and isinstance(row[key],str)
 assert row.get('aiApproved')is None or(row['aiApproved']in('yes','no')and isinstance(row['aiApproved'],str))
assets=[]
for row in qa['records']:
 if row['goalId']in{G,D,'360fccb9-896d-5e67-bf5d-5732621604c9','793189f8-78bd-5204-848b-fd2bbc12e458','9abd8069-17ad-5d30-9102-f8eff6055045'}:
  for key in ['publicAssetPath','canonicalAssetPath']:assert sha(H/row[key])==row['assetSha256']==row['aiApprovedAssetSha256'];assets.append({'goalId':row['goalId'],'role':key,**bind(H/row[key])})
assert len(assets)==10
protected=[]
for path in [H/aliases[x]for x in aliases]:protected.append(bind(path))
for p in (H/E.relative_to(R)/'chemie-source6-five-current412-kind-and-whole-candidate-on286-root-20261014-v1').rglob('*.json'):protected.append(bind(p))
for b in handoff['normalPNGRawPathsAndReviewedBytes']:
 p=pathlib.Path(b['path']);assert sha(p)==b['sha256'];protected.append(bind(p))
oldbase=E/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1'
for b in rd(oldbase/'FINAL.native7-existing274-to-actual280-technical-integration.manifest.json')['allThreeNIReviewedPartialCarrierHashesRetained']:
 p=H/b['logicalHostPath'];assert sha(p)==b['candidate']['sha256'];protected.append(bind(p))
for idx in s['resolutionIndexPaths']:protected.append(bind(H/idx))
for p in (I/'native-seven').rglob('*'):
 if p.is_file():protected.append(bind(p))
wr('inputs/BEFORE.exact-I286-current-alias-QA419-root539-assets-NI3-and-D-protection.json',{'schemaVersion':1,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseHandoff':bind(I/'HANDOFF.exact-reusable-current286-config-and-private-H-state.actual.json'),'baseConfig':bind(cp),'protectedBindings':protected,'selectedAssetThreeWayBindings':assets,'raw419Types':{'aiApprovedYes':sum(x.get('aiApproved')=='yes'for x in qa['records']),'aiApprovedLegacyNull':sum(x.get('aiApproved')is None for x in qa['records']),'BooleanApprovals':0},'HNormal533AliasUnchanged':True,'separateRoot539NotOverwritten':True})
# Reuse the genuine old A058 judgment, including its exact fingerprint/reviewer/date.
history=rd(P9/'originals/INDEX.seven-original-scientific-data-and-exact-neutral-selectors.HISTORY.json')
aorig=verify(next(x['source']for x in history['selectedOriginalRawLineFiles']if x['label']=='A.a'))
b_orig=verify(next(x['source']for x in history['selectedOriginalRawLineFiles']if x['label']=='A.b'))
line=next(x for x in aorig.read_bytes().splitlines(keepends=True)if json.loads(x)['goalId']==G)
peer=next(json.loads(x)for x in b_orig.read_text().splitlines()if x.strip()and json.loads(x)['goalId']==G)
ar=json.loads(line);assert ar['status']=='atomic'and ar['semanticAtomic']is True
oldcanon=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2/candidate/canonical532.complete-inactive.json'
assert gi[G]==next(x for x in rd(oldcanon)['goals']if x['id']==G)
ap=O/'candidate/A1.058d.original-actual-independent-a.byte-exact.jsonl';ap.write_bytes(line)
ac=wr('config/A1.058d.exact-existing-science.normal-alias.config.json',{'schemaVersion':1,'reviewId':ar['reviewId'],'ruleVersion':ar['ruleVersion'],'landscapeId':ar['landscapeId'],'landscapePath':s['landscapePath'],'reviewPath':str(ap.relative_to(R)),'scope':{'label':'Exact existing actual A058 decision; whole original/current goal equal; no new A vote','leafGoalIds':[G]}})
mc=rd(H/s['memoryReviewConfigPath']);mrows=[x for x in (H/mc['reviewPath']).read_bytes().splitlines(keepends=True)if json.loads(x)['goalId']in{G,D}];assert len(mrows)==2
mr=O/'candidate/M2.original-operative-M407-byte-exact.jsonl';mr.write_bytes(b''.join(mrows));empty=O/'candidate/M2.no-new-cards.empty.jsonl';empty.write_bytes(b'')
ms=copy.deepcopy(mc);ms.update({'reviewPath':str(mr.relative_to(R)),'cardReviewPath':str(empty.relative_to(R)),'scope':{'label':'Exact existing two no-memory decisions; scoped validation only, centralM407 remains untouched','leafGoalIds':[G,D]},'visibilityScopes':[],'visibilityScopeCoverageRequired':False,'reportPath':str((O/'checks/M2.scoped.stock.md').relative_to(R))})
mcp=wr('config/M2.exact-existing-science.scoped-only.config.json',ms)
pcfg=[]
for label,path in [('a',PA/'config/P2.current-whole-genuine-independent-a.stock.config.json'),('b',PB/'config/P2.actual-current-independent-b.stock-check.config.json')]:
 original=rd(path);p=copy.deepcopy(original);p.update({'landscapePath':s['landscapePath'],'semanticKindLedgerPath':s['semanticKindLedgerPath']})
 out=wr(f'config/P2.{label}.actual-independent-whole-profile.normal-alias.config.json',p);pcfg.append(out)
 assert {k:v for k,v in original.items()if k not in('landscapePath','semanticKindLedgerPath')}=={k:v for k,v in p.items()if k not in('landscapePath','semanticKindLedgerPath')}
new=copy.deepcopy(central);new['reportId']='chemie-current407-reviewed-p2-existing286-inactive-20261014-v1';ns=new['subjects'][0]
ns['semanticAtomicityConfigPaths'].append(str(ac.relative_to(R)));ns['positiveEvidenceConfigPaths'].append(str(pcfg[1].relative_to(R)))
assert ns['memoryReviewConfigPath']==s['memoryReviewConfigPath']and ns['resolutionIndexPaths']==s['resolutionIndexPaths']and ns['resolutionSupersessions']==s['resolutionSupersessions']and ns['resolutionWithdrawals']==s['resolutionWithdrawals']
nc=wr('config/chemie-current407-reviewed-P2-existing286.inactive.config.json',new)
# Only content-addressed hardlinks to new inactive paths in H. No alias/asset write.
installed=[]
def install(p):
 dest=H/p.relative_to(R)
 if dest.exists():assert sha(dest)==sha(p),dest
 else:dest.parent.mkdir(parents=True,exist_ok=True);os.link(p,dest);installed.append({'source':bind(p),'host':bind(dest)})
for p in [ap,ac,mr,empty,mcp,nc]+pcfg:install(p)
for p in pcfg:
 c=rd(p)
 for path in [c['reviewPath'],c['reviewCriteriaPath']]+c.get('reviewRunManifestPaths',[]):install(R/path)
for root in (PA,PB):
 for p in root.rglob('*'):
  if p.is_file()and p.suffix in('.json','.jsonl','.md')and 'preserved-initial-'not in str(p):install(p)
for path in ['NEUTRAL.current058d-d124-six-whole-cases-and-current-source-course-inputs.author-candidates.json','candidate/P2.six-whole-corrected-bilingual-cases-data-tasks-answers-rubrics.author.json','inputs/original-six-whole-cases-before.json','inputs/original-two-whole-author-profiles-before.json','inputs/whole-current-two-goals.unchanged.json']:install(AU/path)
oldprofiles=rd(AU/'inputs/original-two-whole-author-profiles-before.json');newprofiles=[json.loads(x)for x in (PB/'results/P2.actual-current-independent-b.records.jsonl').read_text().splitlines()if x.strip()]
profiledeltas=[]
for x in newprofiles:
 old=next(y for y in oldprofiles if y['goalId']==x['goalId'])
 profiledeltas.append({'goalId':x['goalId'],'wholeOldProfile':old,'wholeNewProfile':x,'profileBodyChanged':old['profile']!=x['profile'],'oldNativeReviewsSawOldProfileOnly':True,'noNewDVoteClaimed':True})
boundary=wr('BOUNDARY.actual-P2-profile-change-versus-unchanged-prior-native-D-inputs.json',{'schemaVersion':1,'kind':'Truthful technical boundary; not a new D judgment','actualPairedP2Seals':paired,'P2AuthorNeutral':bind(AU/'NEUTRAL.current058d-d124-six-whole-cases-and-current-source-course-inputs.author-candidates.json'),'oldNativeFullP7Input':bind(P9/'shared/P7.current-whole-goals-original-author-profiles-and-nineteen-whole-cases.FIRST_PASS.json'),'wholeProfileDeltas':profiledeltas,'prior058dResolutionExact':bind(I/f'native-seven/resolutions/{G}.resolution.json'),'priorIndexExact':bind(I/'native-seven/resolution-index.json'),'d124RemainsDeferred':D in rd(I/'native-seven/resolution-index.json')['deferredGoalIds'],'noClaimsPriorDReviewersReadNewP2':True,'newP2ScienceIsNotNewDScience':True,'sourceCoursePracticalHoldsRetained':['BW/TH/SN actual execution obligations remain open','BY-GA evaluate-only does not grant planning; SH015 chromatography is not electrophoresis','d124 D block/current source-course authority unresolved; no d124 strict grant','M311 BB/BE acquisition scope work remains separate'],'possibleStockIntersectionNotWholeSourceOrUpdatedNativeAcceptance':True})
wr('CAS.only-new-existing-A058-selection-plus-actual-P2-B-config-on-I286.actual.json',{'schemaVersion':1,'role':'Technical selection only; no new science','base':bind(cp),'candidate':bind(nc),'wholeBeforeSubject':s,'wholeAfterSubject':ns,'allowedCentralDelta':['reportId','subjects[0].semanticAtomicityConfigPaths append exact existing A058 config','subjects[0].positiveEvidenceConfigPaths append actual P2B config'],'existingA058OriginalSource':bind(aorig),'selectedA058OriginalBytes':bind(ap),'actualIndependentBOriginalA058ForProvenanceOnly':peer,'wholeOriginalCurrent058GoalExact':True,'originalWholeGoalCarrier':bind(oldcanon),'P2AConfigCheckOnly':bind(pcfg[0]),'P2BOperativeConfig':bind(pcfg[1]),'M407Unchanged':True,'scopedM2OriginalBytes':bind(mr),'installedNewImmutableFiles':installed,'canonical_QA_SEM_DIndexesSupersessionsWithdrawalsAndOtherP_AConfigsUntouched':True,'root539Untouched':True,'PvsPriorNativeBoundary':bind(boundary)})
print(json.dumps({'newRoot':str(O.relative_to(R)),'central':bind(nc),'scopedA':bind(ac),'scopedM':bind(mcp),'P2':list(map(bind,pcfg)),'installedFiles':len(installed),'newScienceVotes':0},ensure_ascii=False))
