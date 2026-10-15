# SPDX-License-Identifier: Apache-2.0
"""Mechanically pair genuine original A/B4, retaining unresolved source-layer findings."""
import datetime,hashlib,json,os,shutil
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
NATIVE=E/'chemie-equilibrium-four-source-scope-native-preparation-inactive-technical-20261015-v1'
A=E/'chemie-equilibrium-four-source-scope-fresh-independent-a-20261015-v1'
B=E/'chemie-equilibrium-four-source-scope-fresh-independent-b-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'phase2').exists()
for r in load(OWN/'FILES.finite-phase1-preparation-only.seal.json')['files']:verify(r)
bs=B/'INPUTS-OUTPUTS.own-round-b-final.selector.json';bseal=B/'FILES.own-round-b-final.finite.seal.json'
assert ref(bs)['sha256']=='sha256:13796703bc733d0d61a775b4c7f17280a28972db5e73e583f01a880d1cfe9153'
assert ref(bseal)['sha256']=='sha256:99a2917dfe7c86b23edeed1d8799b4297139df8e46f562d5dd182308a3372cd3'
asel=A/'FINAL.selector.json';aseal=A/'FINAL.seal.json';a=load(asel);b=load(bs)
assert ref(aseal)['sha256']=='sha256:a8e4503c0f061991360dad533054be2782129abcc9bc2455c63c7531613d26c4'
for seal in [aseal,bseal]:
 for r in load(seal)['files']:verify(r)
arecords=verify(a['normalRecords']);arun=verify(a['normalRun'])
brecords=verify(next(r for r in b['ownOutputs'] if r['path'].endswith('.records.jsonl')));brun=verify(next(r for r in b['ownOutputs'] if r['path'].endswith('.run.json')))
assert ref(brecords)['sha256']=='sha256:e3721dffe1a5fbcc4fe07876c9df608942ece221c903cb30fa23e32c2e69e6db'
assert ref(brun)['sha256']=='sha256:320512a04e92bb3e6bd70e7579b2e945c0700fbe2f7670650c6a0de5f19d6304'
assert a['finalCombinedNeutralScientificSelector']==b['scientificInputSelector']
cfg=load(NATIVE/'config/native4.final-once.normal-prepare.config.json');cfg['outputDirectory']=(OWN/'phase2/native-four').relative_to(REPO).as_posix()
cfgpath=OWN/'phase2/config/native4.original-A-B.pair-only.config.json';put(cfgpath,cfg)
original=load(NATIVE/'native-four/batch-manifest.json');relocated=dict(original);relocated['configPath']=ref(cfgpath)['path'];relocated['configDigest']=ref(cfgpath)['sha256'];assert [k for k in original if original[k]!=relocated[k]]==['configPath','configDigest']
put(OWN/'phase2/native-four/batch-manifest.json',relocated)
bundle=OWN/'phase2/native-four/bundle';bundle.symlink_to(os.path.relpath(NATIVE/'native-four/bundle',bundle.parent),target_is_directory=True)
copies=[];records={};runs={}
for side,rp,runp in [('a',arecords,arun),('b',brecords,brun)]:
 src=NATIVE/f'native-four/round-{side}';dst=OWN/f'phase2/native-four/round-{side}';shutil.copytree(src,dst)
 for p in sorted(src.rglob('*')):
  if p.is_file():
   q=dst/p.relative_to(src);assert p.read_bytes()==q.read_bytes();copies.append({'original':ref(p),'copy':ref(q)})
 rd=dst/'results';rd.mkdir(exist_ok=True);assert not list(rd.iterdir())
 for p in [rp,runp]:
  q=rd/p.name;shutil.copyfile(p,q);assert p.read_bytes()==q.read_bytes();copies.append({'original':ref(p),'copy':ref(q)})
 records[side]=[json.loads(l) for l in rp.read_text().splitlines()];runs[side]=load(runp)
assert [r['goalId'] for r in records['a']]==cfg['goalIds']==[r['goalId'] for r in records['b']]
assert all(r['decision']=='keep' for rows in records.values() for r in rows)
assert all(r['blindToOtherRuns'] for r in runs.values()) and len({r['independenceGroupId'] for r in runs.values()})==2
decisions=[]
for x,y in zip(records['a'],records['b']):
 for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','bookDigest','bundleFingerprint']:assert x[key]==y[key]
 de=f"Mechanische Paarung der unveränderten ursprünglichen unabhängigen Records A={x['recordId']} und B={y['recordId']}: beide KEEP, aktuelle ganze DE/EN-Beschreibung erhalten. Die ganzen Originalbegründungen und Verständnis-/Leistungs-/Transferketten bleiben in den exakt gebundenen Records unverändert. Ihre Quellen-/Kurs-/Modellgrenzen gelten fort. Der externe RP-Kp→580b-Mappingbefund bleibt ausdrücklich ungelöst; keine amtliche M3-/SourceAtlas-/Kursregistrierung, keine P/A/M/V- oder Humanfreigabe durch diese technische Paarung."
 en=f"Mechanical pairing of unchanged original independent records A={x['recordId']} and B={y['recordId']}: both KEEP; retain the current complete DE/EN description. Full original rationales and understanding/performance/transfer chains remain unchanged in the exact-bound records, including source/course/model limits. The external RP-Kp→580b mapping finding remains explicitly unresolved. This technical pairing adds no official M3/SourceAtlas/course registration, P/A/M/V or human approval."
 decisions.append({'goalId':x['goalId'],'resolutionDecision':'keep_current','evidenceRound':'second','rationaleDe':de,'rationaleEn':en})
authoring={'schemaVersion':1,'manifestId':'chemie-source4-original-independent-A-B-current422-20261015-v1','synthesizedBy':'Codex informed technical binder of unchanged genuine original A/B records; no new scientific vote','decisions':decisions}
# The stock optional deferredGoals field is omitted when the list is empty.
put(OWN/'phase2/native-four/synthesis-authoring.json',authoring)
put(OWN/'phase2/TRANSPORT.original-independent-A-B-D4.exact.json',{'role':'Exact transport only; both original independent FIRSTs approved by root before pairing','sourceSelectors':[ref(asel),ref(bs)],'sourceSeals':[ref(aseal),ref(bseal)],'sourceNativeManifest':ref(NATIVE/'native-four/batch-manifest.json'),'relocatedNativeManifest':ref(OWN/'phase2/native-four/batch-manifest.json'),'onlyManifestChanges':['configPath','configDigest'],'bundleRelativeReadonlySymlink':os.readlink(bundle),'copies':copies,'allOriginalRecordsAndRunsExact':True,'newNativeRenders':0,'newScientificVotes':0,'newSourceOrCourseRegistration':False,'RP580bIssueRemainsOpen':True})
science=load(NATIVE/'INPUTS.blind-native4-final-whole-scientific-sources-and-pages.selector.json');raw=load(NATIVE/'inputs/whole-official-BY-HE-RP-source-cells-passages-and-existing-union-edges.neutral.json');rp=next(r for r in raw['routes'] if r['jurisdiction']=='DE-RP')
cells=rp['wholeOriginalNeutralSourceGoals']+rp['additionalWholeSourceGoalsOmittedFromNeutral'];edges=rp['originalNeutralUnionEdges']+rp['additionalActualWholeUnionEdges'];sid='rp-chem-sekii-rp-ch-sekii-2022-baustein-7-5-010-d11b3fc1';wrong='580b3616-f121-5d82-ac6b-fc24f145fbdc'
cell=next(r for r in cells if r['id']==sid);edge=next(r for r in edges if r['legacyGoalId']==sid and r['canonicalGoalId']==wrong)
canonical=load(verify(science['canonical']));by={g['id']:g for g in canonical['goals']};assert 'Kp' in cell['sourceText'] and 'Sauerstoff' in by[wrong]['title'] and edge['matchType']=='exact'
put(OWN/'phase2/OPEN.external-RP-Kp-to-580b-source-layer-A.finding.json',{'schemaVersion':1,'role':'Explicit root-confirmed unresolved external scientific source/layer-A finding; original raw bodies unchanged','status':'open_unresolved','jurisdiction':'DE-RP','wholeOriginalSourceCell':cell,'exactUnchangedExistingMappingEdge':edge,'wholeCurrentMappedCanonicalGoal':by[wrong],'currentKpGoalIsSeparateWholeGoal':by[cfg['goalIds'][0]],'sourceRawUnionReference':ref(NATIVE/'inputs/whole-official-BY-HE-RP-source-cells-passages-and-existing-union-edges.neutral.json'),'wholePrimaryRpTextReference':next(d['completeSelectedText'] for d in load(NATIVE/'inputs/existing-whole-primary-page-texts.reference-only.neutral.json')['documents'] if '/RP/' in d['originalPdf']['path']),'sourceMappingChanged':False,'findingResolvedByD4KEEP':False,'sourceAtlasRoleRegisteredByD4KEEP':False,'eightAuthoredComponentsRemainUnreviewed':True,'wholeOfficialSourceCoverageGranted':False,'newScienceVotesByTechnicalRole':0})
print(json.dumps({'originalDRecords':8,'genuineIndependentRuns':2,'keepPairs':4,'emptyOptionalDeferralsOmitted':True,'RP580bSourceFindingStillOpen':True,'nativeBuilds':0,'centralRuns':0}))
