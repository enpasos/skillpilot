from pathlib import Path
from datetime import datetime,timezone
import hashlib,importlib.util,json,subprocess

root=Path.cwd();own=Path(__file__).resolve().parent
def bind(path):
    b=path.read_bytes();return {'path':path.relative_to(root).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,value):
    with (own/name).open('x') as out:json.dump(value,out,ensure_ascii=False,indent=2);out.write('\n')
first=own/'whole24-whole48-source-science-independent-b.first.freeze.json'
first_data=json.loads(first.read_text())
assert bind(first)['sha256']=='9ab66e1e3d35e7965ac8ccca5351f1e6fbb841ae68dbe1ddb842199ae93d50df'
for record in first_data['files']:assert bind(root/record['path'])==record
for label in ['P10-source-only-native-API','P10-source-only-ordinary-standard-CLI']:
    x=json.loads((own/f'{label}.terminal.actual.json').read_text());assert x['actualExitCode']==0
files=sorted(p for p in own.rglob('*') if p.is_file())
assert not any(p.is_symlink() for p in own.rglob('*'))
spec=importlib.util.spec_from_file_location('standard_validate_schemas',root/'scripts/validate_schemas.py')
validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator)
schema=json.loads((root/'docs/landscape-runtime.schema.json').read_text())
json_files=[p for p in files if p.suffix=='.json'];jsonl_files=[p for p in files if p.suffix=='.jsonl']
for p in json_files:assert validator.validate_file(p.relative_to(root).as_posix(),schema)
jsonl_count=0
for p in jsonl_files:
    for line in p.read_text().splitlines():
        if line.strip():json.loads(line);jsonl_count+=1
argv=['git','check-ignore','--stdin']
result=subprocess.run(argv,cwd=root,input=('\n'.join(p.relative_to(root).as_posix() for p in files)+'\n').encode(),capture_output=True)
assert result.returncode==1 and result.stdout==b''
for channel,data in [('stdout',result.stdout),('stderr',result.stderr)]:
    with (own/f'own-original-portability-check-ignore.{channel}.actual.txt').open('xb') as out:out.write(data)
write('own-original-portability-schema-and-frozen-inputs.actual.independent-b.receipt.json',{
    'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'ownFirstSeal':bind(first),'allFirstSealedFilesVerifiedExact':len(first_data['files']),
    'actualNormalValidator':'scripts/validate_schemas.py validate_file, unmodified quality-directory discovery contract',
    'ownJSONFilesActuallyPassed':len(json_files),'ownJSONLParsedRows':jsonl_count,'ownBrokenSymlinks':0,
    'actualGitCheckIgnoreArgv':argv,'actualGitCheckIgnoreExitCode':result.returncode,'ignoredOwnFiles':0,
    'stdout':bind(own/'own-original-portability-check-ignore.stdout.actual.txt'),'stderr':bind(own/'own-original-portability-check-ignore.stderr.actual.txt'),
    'P10ClosedSchemaNativeApiActualExit0':True,'P10OrdinaryStandardSourceOnlyCLIActualExit0':True,
    'doesNotClaimFullRepositoryValidateOrBuild':True,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
write('neutral-original-whole24-whole48-independent-b.completed.entry.json',{
    'schemaVersion':1,'role':'Completed genuinely independent B full24/48 source/science first plus actual clear P10 source-only technical checks; D/V pending',
    'firstSeal':bind(first),'wholeVerdicts':bind(own/'whole24-whole48-science-source-P-A-M.independent-b.first.verdicts.json'),
    'source45Partner293Verdicts':bind(own/'whole45-duty-all293-original-partners.independent-b.first.verdicts.json'),
    'findings':bind(own/'whole24-concrete-first-findings.independent-b.json'),'nativeP10':bind(own/'P10.actual-closed-schema-native-semantics-source-only.independent-b.receipt.json'),
    'nativeP10Terminal':bind(own/'P10-source-only-ordinary-standard-CLI.terminal.actual.json'),
    'clearCandidateOrdinals':first_data['ownClearCandidateOrdinals'],'heldCandidateOrdinals':first_data['ownHeldCandidateOrdinals'],
    'all24WholeDEENRead':True,'all48WholeDEENScoringAndSeparateTransfersRead':True,'all45SourceRows293OriginalPartnersRead':True,
    'performedExperiments':0,'actualLearnerEvidence':False,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
allfiles={x['path']:x for x in first_data['files']}
for p in sorted(own.rglob('*')):
    if p.is_file():allfiles[bind(p)['path']]=bind(p)
final=own/'whole24-whole48-source-science-independent-b.completed.final.freeze.json'
write(final.name,{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'Completed original first independent24Science/48cases/45source293roles and actual source-only clearP10 checks',
    'files':sorted(allfiles.values(),key=lambda x:x['path']),'firstSealPreservedExact':bind(first),'currentPeerRead':False,'nativeD_VApproved':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'finalSeal':bind(final),'neutralEntry':bind(own/'neutral-original-whole24-whole48-independent-b.completed.entry.json'),'sealedFiles':len(allfiles),'nativeP10ActualErrors':0,'sourceOnly':True},indent=2))
