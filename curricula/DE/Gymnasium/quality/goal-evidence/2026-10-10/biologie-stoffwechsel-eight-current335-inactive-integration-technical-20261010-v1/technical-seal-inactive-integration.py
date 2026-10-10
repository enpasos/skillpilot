# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime,subprocess,shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-stoffwechsel-eight-current335-inactive-integration-technical-20261010-v1')
E=P/'neutral-current335-Bio8-inactive-integration.completed.entry.json';F=P/'FINAL.current335-Bio8-inactive-integration.technical.freeze.json'
def ref(p):p=pathlib.Path(p);b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads((R/p).read_text())
def same(x):assert ref(x['path'])=={k:x[k] for k in ['path','sha256','bytes']},x['path']
assert not (R/F).exists()
shutil.copyfile(pathlib.Path(__file__),R/P/'technical-seal-inactive-integration.py')
e=read(E);e['normalActualTerminals']=[ref(f.relative_to(R)) for f in sorted((R/P/'terminal').glob('*.terminal.actual.json'))];e['finalTargetedNormalCheck']=ref(P/'checks/final-targeted-normal-schema-portability-and-active-guards.actual.json');e['finalTargetedNormalTerminal']=ref(P/'terminal/final-targeted-normal-schema-portability-and-active-guards.terminal.actual.json');e['preFreezeAssemblyUpdate']='Final executed terminal receipt was added after the runner wrote it. The terminal stdout reports the correct intermediate entry digest at execution time; this final freeze binds the completed entry bytes.'
assert read(P/'terminal/final-targeted-normal-schema-portability-and-active-guards.terminal.actual.json')['actualExitCode']==0
(R/E).write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n')
own=[ref(f.relative_to(R)) for f in sorted((R/P).rglob('*')) if f.is_file()];ext=read(P/'inputs/all-final-current-portable-external-bindings.exact.json')['bindings']
for x in own+ext:same(x);assert not (R/x['path']).is_symlink()
for x in read(P/'inputs/current-active-write-guards.exact.json')['files']:same(x)
for op in read(P/'ROOT.copy-list.only-eight-current-Bio-goals.inactive.json')['operations']:same(op['source'])
ignored=subprocess.run(['git','check-ignore','--stdin'],cwd=R,input='\n'.join(x['path'] for x in own+ext)+'\n',capture_output=True,text=True);assert ignored.returncode==1,ignored.stdout
freeze={'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Inactive technical integration of genuine completed independent A and fresh blind B; owner authored two prior corrections and supplies no independent judgment','entry':ref(E),'ownRegularFiles':own,'requiredCurrentPortableFiles':ext,'requiredIgnoredPaths':[],'plannedMutableTargetBeforeHashes':'ROOT transaction guards and diagnostic observations, not required immutable post-adoption input bindings; own exact before snapshots are frozen','historicalV2PortableClaimCorrection':e['historicalV2PortableClaimCorrection'],'historicalStandaloneSupportStatusMetadataCorrection':e['historicalStandaloneSupportStatusMetadataCorrection'],'actualReviewerIdentityAndDiversityBoundary':e['actualReviewerIdentityAndDiversityBoundary'],'operativePStatus':e['PStatus'],'normalClosedD8Resolution':'Validated from actual completed A and fresh blind B records; all8 KEEP with strictDescriptionComplete','actualCurrentV8Binding':'Exact current rasters with both completed actual original360680/wholeHTML/PDF independent judgments retained','rootCopyOperations':27,'rootCurrentAdoptionAndStrictReport':'PENDING; +8 not counted here','humanApproval':False,'humanTrial':False,'laboratoryExecution':False,'strictActiveGain':0,'activeWrites':[],'GitOrGitHubWrites':[]}
(R/F).write_text(json.dumps(freeze,ensure_ascii=False,indent=2)+'\n')
for x in freeze['ownRegularFiles']+freeze['requiredCurrentPortableFiles']:same(x)
assert read(F)['entry']==ref(E)
print(json.dumps({'entry':ref(E),'freeze':ref(F),'ownRegularFiles':len(own),'requiredCurrentPortableFiles':len(ext),'ROOTCopyList':ref(P/'ROOT.copy-list.only-eight-current-Bio-goals.inactive.json'),'ROOTOperations':27,'strictActiveGain':0,'activeWrites':[]},ensure_ascii=False))
