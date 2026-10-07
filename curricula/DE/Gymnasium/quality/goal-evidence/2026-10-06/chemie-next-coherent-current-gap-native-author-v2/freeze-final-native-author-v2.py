#!/usr/bin/env python3
from pathlib import Path
import datetime,hashlib,json,os
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).resolve().parent;V1=OUT.with_name('chemie-next-coherent-current-gap-native-author-v1');F=OUT/'current-twenty-five-final-native-author-v2.final.freeze.json'
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def read(p):return json.loads(p.read_text())
assert not F.exists(),'This final immutable freeze must not be overwritten'
expected='sha256:4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6';canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';assert sha(canonical)==expected
v1f=V1/'current-twenty-five-native-author-v1.final.freeze.json';assert sha(v1f)=='sha256:fefb94c429e677895dcf3afe1f45392644336ebc830b972859b265eec984369c';vf=read(v1f);assert len(vf['files'])==145
v1files=[]
for r in vf['files']:
 p=ROOT/r['path'] if r['path'].startswith('curricula/') else V1/r['path'];assert sha(p).removeprefix('sha256:')==r['sha256'].removeprefix('sha256:') and p.stat().st_size==r['bytes'];v1files.append(p)
routing=read(OUT/'exact-current25-final-native-d-p-review-input-routing.author.json');raw=read(OUT/'actual-final-current25-whole-native-review-inputs.author.raw.json');delta=read(OUT/'actual-current479-full378-and-native25-whole-source-page-context-raster-deltas.author.json');iso=read(OUT/'actual-final-input-native-isolation.author-receipt.json');kind=read(OUT/'actual-native-candidate-kind-bindings.author.json');pp=read(OUT/'actual25-final-native-positive-profile-material-and-fingerprint-checks.author.json')
assert len(raw['wholeCurrent25CandidateNativeRows'])==25 and len(set(raw['selected25GoalIds']))==25
assert delta['exact127ProtectedWholeGoalPageContextSourceRaster'] and len(delta['actualChangedWholePageIds'])==8
assert kind['wholeExactCurrentDecisions']==478 and kind['all479KindClassificationsAndCountsExact']
assert pp['profileScienceBodiesExactV1']==23 and pp['wholeUnchangedMaterialBodies']==48 and pp['counts']=={'approved':0,'needsHumanReview':25,'rejected':0}
assert len(pp['actualGoalFingerprintDeltaIds'])==1 and len(pp['actualInputFingerprintDeltaIds'])==8
assert len(iso['byteIdenticalCopiedProductionHelpers'])==467
for r in iso['byteIdenticalCopiedProductionHelpers']:
 original=ROOT/r['path'];copy=Path(iso['isolatedRootUsed'])/r['path'];assert sha(original)==sha(copy)==r['sha256']
# Verify only actual final record bindings, not historical active-path digests in
# preserved old unsealed preparation, which intentionally retain their own time.
def verify_bound(x):
 if isinstance(x,dict):
  if all(k in x for k in ['path','sha256','bytes']) and isinstance(x['path'],str):
   p=ROOT/x['path'];assert p.is_file(),p;assert sha(p)==x['sha256'],p;assert p.stat().st_size==x['bytes'],p
  for v in x.values():verify_bound(v)
 elif isinstance(x,list):
  for v in x:verify_bound(v)
verify_bound(routing);verify_bound(raw)
for part,n in [('twenty',20),('five',5)]:
 assert f'goals={n}' in (OUT/f'native-prepare-{part}.actual.stdout.txt').read_text();assert f'goals={n}' in (OUT/f'native-check-{part}.actual.stdout.txt').read_text()
assert 'Blocking issues: 0' in (OUT/'native-positive25-check.actual.stdout.txt').read_text()
external=set(v1files+[v1f,canonical])
for x in vf['inputs']:
 p=ROOT/x['path'] if x['path'].startswith(('app/','backend/','curricula/','contracts/','docs/')) or x['path'] in ['AGENTS.md','LICENSING.md'] else V1/x['path']
 if p.is_file() and OUT not in p.parents:external.add(p)
# Actual final selected PNGs and A/B decision records are external immutable inputs.
sevens=read(OUT/'final-seven-reviewed-png-input-routing.author.json');external.add(ROOT/sevens['operativeFreeze']['path'])
for row in sevens['rows']:
 external.add(ROOT/row['selectedPNG']['path'])
 for b in row['actualIndependentDecisionRecordBindings']:external.add(ROOT/b['path'])
for row in raw['wholeCurrent25CandidateNativeRows']:
 for b in row['sourceBindings']['actualPrimaryOriginals']+row['sourceBindings']['actualPrimaryRasters']:external.add(ROOT/b['path'])
 b=row['sourceBindings']['actualSecondaryConfirmation']
 if b:external.add(ROOT/b['path'])
 external.add(ROOT/row['sourceBindings']['actualPrimaryFetchAndPageExtractionReceipt']['path'])
for r in iso['byteIdenticalCopiedProductionHelpers']:external.add(ROOT/r['path'])
for rel in ['AGENTS.md','LICENSING.md','docs/concept/skill-graph/atomic-goal-visualizations.md','app/package.json']:
 external.add(ROOT/rel)
base=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review'
for d,f in [('chemie-next25-four-targeted-raster-corrections-author-20261006-v2','four-targeted-raster-corrections.author-v2.final.freeze.json'),('chemie-next25-four-corrections-independent-v-a-20261006-v2','targeted-v-a-v2.final.freeze.json'),('chemie-next25-four-corrections-independent-v-b-20261006-v2','independent-four-targeted-raster-corrections-v-b-v2.final.freeze.json')]:external.add(base/d/f)
external.add(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-positive-material-independent-a-initial-findings-v1/initial-independent-a-findings.final.freeze.json')
# Bind the applicable schemas/criteria and every exact final raster used by native
# render manifests. The earlier wholegoal JPGs retain their historical role.
for part in ['twenty','five']:
 for a in read(OUT/f'native-d-{part}/bundle/book.pdf.render-manifest.json')['assets']:
  gid=a['publicPath'].split('/')[-2]
  if a['publicPath'].endswith('.jpg'):external.add(ROOT/('app/public'+a['publicPath']))
files=[]
for p in sorted(OUT.rglob('*')):
 if p.is_symlink():raise AssertionError('No dossier symlink is allowed: '+str(p))
 if p.is_file():files.append(bind(p))
freeze={'schemaVersion':1,'documentType':'actual-final-current-twenty-five-native-author-v2-immutable-freeze','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR two targeted P completions and technical final native preparation; not additional independent D/P or V science review','status':'ai_candidate / candidate pending two actual independent final D/P reviews','modelRunProvenance':'Codex direct author and technical binding work; model version not available in tools; no external review API invoked','files':files,'inputs':[bind(p) for p in sorted(external)],'immutableV1OwnFilesVerified':145,'currentCanonicalBasis':bind(canonical),'canonicalCandidateForComparisonOnly':bind(OUT/'canonical.final-png-current.author-candidate.json'),'actualWhole479CandidateDeltas':8,'actualNativeFull378Models':2,'actualNativeDSubsetCounts':[20,5],'actualNativeDPDFPhysicalPages':[22,7],'actualNativeDCampaigns':4,'actualNativePrepareCheck':['PASS20','PASS5'],'actualNativePProfiles':25,'actualCompleteDEENMaterials':50,'actualScienceProfileChanges':['3bc48951-025c-5144-99b1-924db611a5f9','e675fa94-6e23-59c0-b376-4340bf44c00e'],'exactOtherWholeProfileEntries':23,'exactWholeMaterialEntries':48,'exactProtectedCurrent127WholeGoalsPagesContextsRasters':True,'wholeOther370NativePagesAndGoalInputsExact':True,'kindDecisionsWholeExact':478,'kindClassificationsCountsAll479Exact':True,'sevenFinalPNGHashes':{r['goalId']:r['selectedPNG']['sha256'] for r in sevens['rows']},'unchangedOriginalJPGs':18,'nativePositiveCLI':'PASS25, 0 blockers','Pstatus':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','newIndependentDandPResultsProvidedRead':False,'independentDandPReviewDisposition':'PENDING two final independent reviews; original findings and old inputs immutable','concreteNanoSourceLocatorHold':routing['concreteOpenCurrentSourceHold'],'exactRawRoutingFile':bind(OUT/'exact-current25-final-native-d-p-review-input-routing.author.json'),'neutralCompleteRawInput':bind(OUT/'actual-final-current25-whole-native-review-inputs.author.raw.json'),'newScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'wholeNationalSourceAtlasSupersetHoldPreserved':True,'humanApproval':False,'humanTrial':False,'activeWrites':False,'historyModified':False,'gitWrites':False,'globalCentralBuilds':False}
F.write_text(json.dumps(freeze,ensure_ascii=False,indent=2)+'\n')
for p in OUT.rglob('*'):
 if p.is_file() and not p.is_symlink():p.chmod(0o444)
for p in sorted([x for x in OUT.rglob('*') if x.is_dir()],key=lambda x:len(x.parts),reverse=True):p.chmod(0o555)
OUT.chmod(0o555)
print(json.dumps({'freeze':str(F.relative_to(ROOT)),'sha256':sha(F),'files':len(files),'externalInputs':len(external),'actualNativeD':[20,5],'actualP':25,'exactOtherProfiles':23,'exactMaterials':48,'concreteNanoLocatorHold':'retained','activeWrites':False,'strictNetGain':0}))
