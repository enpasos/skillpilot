import hashlib
import json
import os
import subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
AUTHOR=OWN.parent/'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,d):
    with p.open('x') as f:f.write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

first=OWN/'four-genuine-current-D-P-V.independent-b.first.freeze.json'
assert sha(first)=='f49b18a482efcd9d70720b341ae07b9f31b8f746018b3a86181af8f0591d9937'
author_seals=[AUTHOR/'current-four-raster-native-author-input.first.freeze.json',
    AUTHOR/'exact-original-raster-source-provenance.append-only.freeze.json']
expected=['eabe2f79c398c86a0c6ef3ff134e16009f9d2e82f251593295162cd2dfb710da',
    '586c8f02b8f00ce7288da5d6972e9aabb042e90ba95396918cd5b5893d3ff9bc']
paths=set()
for seal,expected_sha in [(first,'f49b18a482efcd9d70720b341ae07b9f31b8f746018b3a86181af8f0591d9937'),*zip(author_seals,expected)]:
    assert sha(seal)==expected_sha
    paths.add(seal)
    for f in read(seal)['frozenFiles']:
        p=ROOT/f['path'];assert bind(p)==f;paths.add(p)
paths.update(p for p in OWN.rglob('*') if p.is_file())
links=[]
for p in sorted(paths):
    assert p.exists() and p.is_file()
    assert p.resolve().is_relative_to(ROOT.resolve())
    if p.is_symlink():
        target=os.readlink(p)
        assert not Path(target).is_absolute()
        assert p.is_relative_to(AUTHOR)
        assert p.resolve().is_relative_to(AUTHOR/'selected-images')
        links.append({'path':str(p.relative_to(ROOT)),'relativeTarget':target,'actualResolvedRaster':bind(p.resolve())})
assert len(links)==4
assert not any(p.is_symlink() for p in OWN.rglob('*'))
for p in OWN.rglob('*.json'):read(p)
for p in OWN.rglob('*.jsonl'):
    for line in p.read_text().splitlines():
        if line.strip():json.loads(line)
argv=['git','check-ignore','--stdin']
path_list='\n'.join(str(p.relative_to(ROOT)) for p in sorted(paths))+'\n'
result=subprocess.run(argv,input=path_list,capture_output=True,text=True,cwd=ROOT)
write(OWN/'actual-four-portability-git-ignore-check.terminal.json',{
    'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),
    'actualArgv':argv,'cwd':str(ROOT),'stdinPaths':path_list.splitlines(),
    'actualExitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr,
    'expectedExitCodeForNoIgnoredPaths':1,'filesActuallyChecked':len(paths)})
assert result.returncode==1 and result.stdout=='' and result.stderr==''
write(OWN/'actual-four-portability-and-own-first-seal-preservation.independent-b.json',{
    'schemaVersion':1,'artifactKind':'actual-independent-B-portability-exact-inputs-own-first-seal-preservation',
    'recordedAt':datetime.now(timezone.utc).isoformat(),'checkedFiles':len(paths),
    'actualAuthor203AndProvenance14AllFileHashesAndBytesRechecked':True,
    'ownFirstVerdictSealUnchanged':bind(first),'everyOwnJSONAndJSONLActuallyParsed':True,
    'ownSymlinks':0,'portableInternalRelativeSelectedRasterAliases':links,
    'brokenAbsoluteExternalLinks':0,'ignoredPaths':0,
    'noGitignoreSchemaOrHistoricalFilenameExceptions':True,
    'portabilityPassIsScientificOrVisualApproval':False,'peerAFinalOutputsRead':False,
    'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
for label in ['actual-four-native-D-P-api','actual-four-standard-D-campaign-cli']:
    terminal=read(OWN/(label+'.terminal.json'))
    assert terminal['actualExitCode']==0 and terminal['stderr']==''
assert read(OWN/'P4.actual-inactive-schema-semantics-original-PNG.independent-b.receipt.json')['semanticErrors']==0
assert read(OWN/'D4.actual-native-campaign-independent-b.receipt.json')['errors']==[]
entry=read(AUTHOR/'neutral-current-four-raster-native-author-review.entry.json')
live=ROOT/entry['actualBaseline']['canonical']['path']
live_sha=sha(live)
assert live_sha=='d524850cf83cdb70b3b1105c1bac5b93b08e42272893320392f160f52a4e35d5'
run_files=sorted((OWN/'round-b/results').glob('*.run.json'))
record_files=sorted((OWN/'round-b/results').glob('*.records.jsonl'))
assert len(run_files)==len(record_files)==1
final_name='completed-four-D-P-V-native-checks-portability.independent-b.final.freeze.json'
write(OWN/'completed-four-D-P-V-independent-b.exact-handoff.entry.json',{
    'schemaVersion':1,'artifactKind':'completed-genuine-independent-B-current-four-native-D-P-V-handoff',
    'recordedAt':datetime.now(timezone.utc).isoformat(),'scope':{'D4':'KEEP','P4':'SCOPED_E1_G1_PASS','V4':'KEEP'},
    'sourceInputSeals':[bind(p) for p in author_seals],'ownFirstBlindVerdictSeal':bind(first),
    'wholeCurrentDEENGoalsRead':4,'completeDEENCasesRead':8,'actualOriginalPNGsViewed':4,
    'actual360680CapturesViewed':8,'actualWholeNativePDFPagesViewed':[3,4,5,6],
    'wholeOfficialPrimaryPhysicalPagesRead':[25,26],
    'genuineUnchangedPriorWholeScienceRetained':True,'noNewScientificAMDecision':True,
    'DRecords':bind(record_files[0]),'DCompletedRun':bind(run_files[0]),
    'DNativeAPIReceipt':bind(OWN/'D4.actual-native-campaign-independent-b.receipt.json'),
    'DActualStandardCLI':bind(OWN/'actual-four-standard-D-campaign-cli.terminal.json'),
    'PCurrentRecords':bind(ROOT/entry['operativeArtifacts']['nativeP4ActualRasterBindings']),
    'PActualNativeAPIReceipt':bind(OWN/'P4.actual-inactive-schema-semantics-original-PNG.independent-b.receipt.json'),
    'VActualOwnVerdicts':bind(OWN/'four-actual-PNG-widths-native-pages-V.independent-b.first.verdicts.json'),
    'wholeSourceAMContextVerdict':bind(OWN/'four-whole-D-P-source-AM-current-context.independent-b.first.verdict.json'),
    'protectedBaselineCanonical':bind(live),'baselineStrictReportedByParent':202,'baselineAtomic':391,
    'other473WholeGoalsAnd390AMRowsUnchanged':True,'protectedSameSubsetPositionBindings':81,
    'preservedTwoHistoricalContextDifferences':['0daa79f6-8f61-5506-98f9-65db83062ba8','e70d8a85-2dea-5165-919b-200fee9f4db4'],
    'conditionalInactiveCandidateAtomicAfterSplit':392,
    'publicPCLIAndActiveIntegrationGatePending':True,'next':'Separate eligible paired review integration and actual active standard checks by root; no candidate counted here.',
    'finalSealPath':str((OWN/final_name).relative_to(ROOT)),
    'peerAFinalOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
files=sorted(p for p in OWN.rglob('*') if p.is_file())
write(OWN/final_name,{
    'schemaVersion':1,'artifactKind':'completed-four-independent-B-native-D-P-V-portability-exact-final-freeze',
    'recordedAt':datetime.now(timezone.utc).isoformat(),'ownFirstBlindVerdictSeal':bind(first),
    'D4':'KEEP','P4':'SCOPED_E1_G1_PASS','V4':'KEEP',
    'actualNativeAPIExitCode':0,'actualStandardDCLIExitCode':0,
    'needsHumanReview':4,'approved':0,'evidenceLevel':'E1','maximumClaimScope':'G1',
    'nativeSchemaPassIsScientificOrVisualApproval':False,'actualOwnScienceAndVisualJudgmentsSeparatelySealed':True,
    'publicPCLIAndActiveIntegrationGatePending':True,'portableFiles':len(files),
    'frozenFiles':[bind(p) for p in files],
    'peerAFinalOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
final=OWN/final_name
for f in read(final)['frozenFiles']:assert bind(ROOT/f['path'])==f
print(json.dumps({'finalSeal':bind(final),'handoff':bind(OWN/'completed-four-D-P-V-independent-b.exact-handoff.entry.json'),
    'ownFiles':len(files),'portabilityCheckedFiles':len(paths),'DNativeAPI':0,'DStandardCLI':0,'PNativeAPI':0,'D4':'KEEP','P4':'SCOPED_E1_G1_PASS','V4':'KEEP'}))
