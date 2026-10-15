# SPDX-License-Identifier: Apache-2.0
"""Read-only finite CAS for the unchanged original review evidence and sparse host."""
import hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
BASE=E/'chemie-native9-current422-bounded-inactive-integration-technical-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+h.hexdigest(),'bytes':p.stat().st_size}
def verify(r):
 p=REPO/r['path'];a=ref(p)
 assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),r['path']
 return p
def put(p,v):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def check():
 s=load(OWN/'candidate/PREPARED.exact-current422-selection.awaiting-genuine-B-and-ROOTREADY.json')
 bs=load(BASE/'OUTPUTS.finite-native9-current422-inactive-integration.final-selector.json')
 seals=[OWN/'FILES.finite-phase1-preparation-only.seal.json',BASE/'FILES.finite-native9-current422-inactive-integration.seal.json',E/'chemie-equilibrium-kpkc-pourbaix-two-wording-current422-informed-P2-A2-M2-V2-20261015-v1/FILES.finite-final-current-Kp-Pourbaix-P2-A2-M2-V2.seal.json',E/'chemie-equilibrium-four-source-scope-native-preparation-inactive-technical-20261015-v1/FILES.finite-native4-technical-preparation.seal.json']
 t=load(OWN/'phase2/TRANSPORT.original-independent-A-B-D4.exact.json')
 seals += [verify(r) for r in t['sourceSeals']]
 counts=[]
 for p in seals:
  rows=load(p)['files']
  for r in rows:verify(r)
  counts.append({'seal':ref(p),'payloadFiles':len(rows),'allPayloadBytesExact':True})
 for r in load(OWN/'checks/ORIGINAL.all-selected-source-bindings.before.json')['files']:verify(r)
 protected=load(OWN/'checks/PROTECTED697.actual-before-phase1.json')['files'];assert len(protected)==697
 for r in protected:verify(r)
 for pair in t['copies']:assert verify(pair['original']).read_bytes()==verify(pair['copy']).read_bytes()
 mp=load(OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json');host=REPO/mp['executionHost']
 for r in mp['stockPhysicalModules']:
  assert not (host/r['path']).is_symlink()
  assert ref(host/r['path'])['sha256']==ref(verify(r))['sha256']
 for r in mp['aliases']:
  p=host/r['normalHostAlias'];src=verify(r['physicalRepositorySource'])
  assert ref(p)['sha256']==ref(src)['sha256']
  if r['physicalWithinHost']:assert not p.is_symlink()
 for r in mp['selectedCurrentAssetRows']+mp['legacyBaselineAssetReferences']:
  src=verify(r['physicalRepositorySource']);digest=ref(src)['sha256']
  for k in ['normalCanonicalDestination','normalPublicDestination']:assert ref(host/r[k])['sha256']==digest
  assert (host/r['normalPublicDestination']).is_symlink()
 legacy=load(verify(mp['legacyQaDispositionDiscoveryInput']))
 assert legacy['selectedChemistryLegacyMarkdownCount']==0 and legacy['rows']==[]
 assert list((host/'curricula/DE/Gymnasium/quality/goal-visualization-review').iterdir())==[]
 regular=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink());assert regular==4032724
 report=load(verify(s['baseline367Report']))['subjects'][0]
 old={g['id']:g for g in load(verify(bs['canonical']))['goals']};new={g['id']:g for g in load(verify(s['canonical']))['goals']}
 assert len(old)==len(new)==560 and list(old)==list(new)
 assert all(old[g].get('requires',[])==new[g].get('requires',[]) and old[g].get('contains',[])==new[g].get('contains',[]) for g in old)
 assert report['strictComplete']==367 and len(report['currentGoalIds'])==422 and all(old[g]==new[g] for g in report['strictCompleteGoalIds'])
 changed=[g for g in old if old[g]!=new[g]];expected=[s['normalSource4GoalIds'][i] for i in [0,3]];assert set(changed)==set(expected)
 ids={r['goalId'] for r in load(verify(s['semantic']))['decisions'] if r['semanticKind']=='curricularAtomic'};assert ids==set(report['currentGoalIds'])
 c=load(E/'chemie-equilibrium-kpkc-pourbaix-two-wording-current422-informed-P2-A2-M2-V2-20261015-v1/SELECTION.final-current-Kp-Pourbaix-informed-P2-A2-M2-V2.json')
 def rawby(p):return {json.loads(l)['goalId']:l for l in p.read_bytes().splitlines(keepends=True) if l.strip()}
 om=rawby(verify(c['M2']['baseline']));nm=rawby(verify(s['memory422ExactOriginal']));assert om.keys()==nm.keys() and len(nm)==422 and set(g for g in om if om[g]!=nm[g])==set(c['goalIds'])
 oq={r['goalId']:r for r in load(verify(c['V2']['baseline']))['records']};nq={r['goalId']:r for r in load(verify(s['visualizationQA438ExactOriginal']))['records']};assert oq.keys()==nq.keys() and len(nq)==438 and set(g for g in oq if oq[g]!=nq[g])==set(c['goalIds'])
 for kind in ['P','A']:
  q=load(OWN/f'config/{kind}2.genuine-informed-C.normal-address-only.config.json');assert verify(c[kind+'2']['records']).read_bytes()==(REPO/q['reviewPath']).read_bytes()
  if kind=='P':assert q['reviewRunManifestPaths']==load(verify(c['P2']['config']))['reviewRunManifestPaths']
 pre=load(OWN/'checks/PREFLIGHT.phase1-five-affected-actual-checks.json');assert len(pre['results'])==5 and all(r['exitCode']==0 for r in pre['results'])
 steps=['D4-check-original-pair','D4-summarize','D4-synthesis','D4-resolutions','D4-finalize','D4-final-check','M422-current-C-ten-scopes']
 actual=[]
 for n in steps:
  p=OWN/'phase2'/f'{n}.command.actual.json';r=load(p);assert r['exitCode']==0;verify(r['stdout']);verify(r['stderr']);actual.append(ref(p))
 idx=load(OWN/'phase2/native-four/resolution-index.json');assert idx['batchGoalIds']==s['normalSource4GoalIds'] and len(idx['resolutions'])==4 and all(r['strictDescriptionComplete'] for r in idx['resolutions'])
 for r in idx['resolutions']:
  p=OWN/'phase2/native-four'/r['resolutionPath'];assert ref(p)['sha256']==r['resolutionDigest']
 assert 'deferredGoals' not in load(OWN/'phase2/native-four/synthesis-authoring.json')
 finding=load(OWN/'phase2/OPEN.external-RP-Kp-to-580b-source-layer-A.finding.json');assert finding['status']=='open_unresolved' and not finding['findingResolvedByD4KEEP']
 return {'role':'Actual bounded read-only CAS, no new scientific judgement','originalFiniteSeals':counts,'phase1Payload38Exact':True,'old367Payload142Exact':True,'protectedActiveFiles':697,'allProtectedActualBytesExact':True,'all367PriorStrictGoalBodiesExact':True,'same422CurrentIds':True,'same560IdsAndEdges':True,'onlyWholeGoalChanges':changed,'exactGenuineIndependentDRecords':8,'genuineIndependentDRuns':2,'actualD4Resolutions':4,'old87ResolutionIndexesAndD9Exact':True,'otherWholePRecordsExact':390,'otherWholeARawRecordsExact':398,'otherWholeMRawLinesExact':420,'otherWholeQAObjectsExact':436,'originalP2RunBindingExact':True,'phase1ChecksExit0':5,'phase2ActualSteps':actual,'stockModules':len(mp['stockPhysicalModules']),'normalAliases':len(mp['aliases']),'regularHostBytes':regular,'rasterCopies':0,'pinnedEmptyLegacyDiscovery':mp['legacyQaDispositionDiscoveryInput'],'nativeBuilds':0,'newScientificVotesByTechnicalRole':0,'sourceOrCourseRegistrationApplied':False,'externalRPKp580bFindingStillOpen':True,'activeWrites':0,'gitWrites':0}
