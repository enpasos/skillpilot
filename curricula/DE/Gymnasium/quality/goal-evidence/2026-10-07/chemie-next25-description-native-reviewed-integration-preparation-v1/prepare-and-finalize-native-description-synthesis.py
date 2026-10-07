# SPDX-License-Identifier: Apache-2.0
"""Physical native integration preparation of completed reviews; no scientific run."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, shutil, subprocess, tempfile, sys

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
B6 = OWN.parent.parent/'2026-10-06'
B7 = OWN.parent
sha = lambda p: 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
read = lambda p: json.loads(Path(p).read_text())
stable = lambda v: json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def rel(p): return str(Path(p).relative_to(ROOT))
def binding(p): return {'path':rel(p),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def write(p,v):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
V2=B6/'chemie-next-coherent-current-gap-native-author-v2'
A2=B6/'chemie-next25-final-native-d-independent-a-v2'
BB2=B6/'chemie-next25-current-native-description-independent-b-v2'
V3=B7/'chemie-next25-orbital-nano-targeted-author-v3'
ORBITAL='0acc8cd2-be6d-567e-a023-1d9e90475510'
CASES=[
 {'group':'native-current-nineteen','config':V2/'native-d-twenty.batch.config.json','prepared':V2/'native-d-twenty','a':A2/'native-d-twenty/results','b':BB2/'native-twenty','defer':[ORBITAL]},
 {'group':'native-current-five','config':V2/'native-d-five.batch.config.json','prepared':V2/'native-d-five','a':A2/'native-d-five/results','b':BB2/'native-five','defer':[]},
]
FREEZES=[
 (V2/'current-twenty-five-final-native-author-v2.final.freeze.json','bd77128c7bbb71eb96f90ae9ab32feca8c26d46bd520c87adaf8cfd361f917dc'),
 (A2/'independent-a-current-twenty-five-native-d-v2.final.freeze.json','07a4583b79dd1833f80b8a838b91c6a5727d3dcfd9a0326a153707315b925e8d'),
 (BB2/'independent-b.current-native-description-v2.final.freeze.json','0dd1f22bb4602b3a6b9d9682529b1cb12655b411884cc4829178f339e83b6c63'),
 (V3/'targeted-orbital-nano-author-v3.final.freeze.json','9b3757ba2b8e93e713684f27c791de5c4a0af503ee998ca70b5234c40d5169af'),
]
if sys.argv[1:] == ['one']:
    stage='one'
    routing=read(OWN/'final-orbital-independent-review-routing.json')
    CASES=[{'group':'native-current-orbital-one','config':V3/'native-d-one-orbital-final-current.batch.config.json','prepared':V3/'native-d-one-orbital-final-current','a':ROOT/routing['a']['resultsDirectory'],'b':ROOT/routing['b']['resultsDirectory'],'defer':[]}]
    FREEZES += [(ROOT/routing[k]['freezePath'],routing[k]['freezeSHA256']) for k in ['a','b']]
else:
    assert not sys.argv[1:]
    stage='twenty-four'
frozen=[]
for f,expected in FREEZES:
    assert sha(f)=='sha256:'+expected,f
    entries=read(f).get('files',read(f).get('outputs',[]))
    assert entries,f
    for x in entries:
        p=ROOT/x['path'];assert sha(p)=='sha256:'+x['sha256'].removeprefix('sha256:'),p
    frozen.append({'freeze':binding(f),'verifiedImmutableOutputs':entries})
write(OWN/(stage+'.immutable-source-freezes.before-synthesis.json'),frozen)
ISO=Path(tempfile.mkdtemp(prefix='skillpilot-chemie-next25-d-synthesis-'+stage+'-'))
write(OWN/(stage+'.physical-isolation.receipt.json'),{'role':'technical_synthesizer','root':str(ISO),'configBytesAndPathsExact':True,'productionHelpersUnmodified':True,'outputSymlinks':False,'newReviewRounds':0,'activeWrites':0})
for d in ['app/scripts','app/src','contracts']:shutil.copytree(ROOT/d,ISO/d)
(ISO/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
for p in ['app/package.json','app/tsconfig.json']:
    if (ROOT/p).exists():shutil.copy2(ROOT/p,ISO/p)
copies={};resultFilenameAliases=[]
def mirror(p):
    p=Path(p);dest=ISO/rel(p)
    if dest.exists():assert sha(dest)==sha(p),p
    else:dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
    copies[rel(p)]=binding(p)
    return dest
for c in CASES:
    cfg=read(c['config']);mirror(c['config']);mirror(ROOT/cfg['baseGoalBookConfigPath'])
    for k in ['promptPath','criteriaPath']:mirror(ROOT/cfg[k])
    manifest=read(c['prepared']/'batch-manifest.json');mirror(ROOT/manifest['source']['landscapePath'])
    out=ISO/cfg['outputDirectory'];assert not out.exists();shutil.copytree(c['prepared'],out)
    # Only this physical scratch output copy is writable; immutable originals stay exact.
    out.chmod(0o755)
    for p in out.rglob('*'):p.chmod(0o755 if p.is_dir() else 0o644)
    c['scratchOutput']=out;c['ids']=cfg['goalIds'];c['keepIds']=[g for g in c['ids'] if g not in c['defer']];c['pairs']={}
    for letter in ['a','b']:
        dest=out/('round-'+letter)/'results';dest.mkdir(exist_ok=True);assert not list(dest.iterdir()),dest
        sourceFiles=sorted([*c[letter].glob('*.records.jsonl'),*c[letter].glob('*.run.json')]);assert len(sourceFiles)==2,(letter,sourceFiles)
        batchId=read(out/('round-'+letter)/'description-review-campaign.json')['batches'][0]['batchId']
        for p in sourceFiles:
            nativeName=batchId+('.records.jsonl' if p.name.endswith('.records.jsonl') else '.run.json')
            shutil.copy2(p,dest/nativeName);copies[rel(p)]=binding(p);assert sha(dest/nativeName)==sha(p)
            resultFilenameAliases.append({'original':binding(p),'scratchDestination':str(dest/nativeName),'expectedCampaignFilename':nativeName,'bytesExact':True,'recordAndRunIdsUnmodified':True})
        records=[json.loads(l) for p in dest.glob('*.records.jsonl') for l in p.read_text().splitlines()]
        assert [r['goalId'] for r in records]==c['ids'],(c['group'],letter)
        c['pairs'][letter]={r['goalId']:r for r in records}
    for gid in c['ids']:
        a,b=c['pairs']['a'][gid],c['pairs']['b'][gid]
        for k in ['goalId','goalFingerprint','pageFingerprint','bookDigest','bundleFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert a[k]==b[k],(gid,k)
        if gid in c['keepIds']:assert a['decision']==b['decision']=='keep',(gid,a['decision'],b['decision'])
        else:assert gid==ORBITAL and a['decision']==b['decision']=='revise'
    author={'schemaVersion':1,'manifestId':'chemie-next25-'+c['group']+'-technical-synthesis-20261007-v1','synthesizedBy':'Codex technical synthesizer; completed existing independent A/B bytes read; no additional scientific review round','decisions':[]}
    reasons=read(OWN/'substantive-bilingual-synthesis.author.json')['reasons']
    for gid in c['keepIds']:
        de,en=reasons[gid[:8]]
        author['decisions'].append({'goalId':gid,'resolutionDecision':'current_after_revision' if stage=='one' else 'keep_current','evidenceRound':'second','rationaleDe':de,'rationaleEn':en})
    if c['defer']:
        author['deferredGoals']=[{'goalId':ORBITAL,'rationaleDe':'Die originalen A/B-Records bleiben REVISE wegen der falschen Definition als Lösungen einer Wellenfunktion. Diese historische Seite wird nicht zum aktuellen Abschluss umetikettiert. Nur die korrigierte v3-Einzelseite mit eigener tatsächlicher A/B-Gruppe kann den Befund auflösen.','rationaleEn':'The original A/B records remain REVISE because of the incorrect definition as solutions of a wave function. This historical page is not relabelled as current completion. Only the corrected v3 single page with its actual distinct A/B group can resolve the finding.'}]
    write(out/'synthesis-authoring.json',author);c['authoring']=author
outputDirs=[c['scratchOutput'] for c in CASES]
helperCopies=[]
for d in ['app/scripts','app/src','contracts']:
    for p in (ISO/d).rglob('*'):
        if p.is_file():
            original=ROOT/p.relative_to(ISO);assert sha(p)==sha(original),p
            helperCopies.append({'path':str(p.relative_to(ISO)),'sha256':sha(p),'bytes':p.stat().st_size})
for p in ISO.rglob('*'):
    if p.is_file() and not p.is_symlink() and not any(p.is_relative_to(d) for d in outputDirs):p.chmod(0o444)
write(OWN/(stage+'.exact-physical-inputs-and-helper-copies.receipt.json'),{'copies':list(copies.values()),'helperCopies':helperCopies,'resultFilenameAliases':resultFilenameAliases,'originalReviewRunsRelabelled':False,'newReviewRuns':0,'role':'technical_synthesizer','outputSymlinks':False})
write(OWN/(stage+'.actual-existing-pairs-and-substantive-synthesis.receipt.json'),{'role':'technical_synthesizer','newIndependentReviewRounds':0,'groups':[{'group':c['group'],'originalConfig':binding(c['config']),'authoring':c['authoring'],'actualIndependentPairs':c['pairs']} for c in CASES],'sourceHOLDsRetained':True,'sourceWholeSupersetApproved':False,'otherGatesReviewed':False,'activeWrites':0,'humanApproval':False,'humanTrial':False})
commands=[]
def run(name,args):
    started=datetime.now(timezone.utc).isoformat();p=subprocess.run(args,cwd=ISO,capture_output=True);completed=datetime.now(timezone.utc).isoformat()
    out=OWN/'terminal'/(name+'.stdout.txt');err=OWN/'terminal'/(name+'.stderr.txt');out.parent.mkdir(exist_ok=True);assert not out.exists() and not err.exists()
    out.write_bytes(p.stdout);err.write_bytes(p.stderr)
    commands.append({'name':name,'args':args,'cwd':str(ISO),'startedAt':started,'completedAt':completed,'actualExitCode':p.returncode,'stdout':binding(out),'stderr':binding(err)})
    (OWN/(stage+'.native-synthesis-finalization.actual.receipt.json')).write_text(json.dumps({'role':'technical_synthesizer','commands':commands,'productionValidatorsModified':False,'activeWrites':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'name':name,'actualExitCode':p.returncode,'stdout':p.stdout.decode()[:1200],'stderr':p.stderr.decode()[:2300]}),flush=True)
    assert p.returncode==0,(name,p.stderr.decode())
for c in CASES:
    cfg=rel(c['config']);out=str(c['scratchOutput'].relative_to(ISO));prefix=c['group'];tsx='app/node_modules/.bin/tsx'
    run(prefix+'-prepared-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',cfg])
    run(prefix+'-dual-summarize',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write'])
    run(prefix+'-synthesis-manifest',[tsx,'app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',out+'/synthesis-authoring.json','--write'])
    run(prefix+'-resolutions-materialize',[tsx,'app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',out+'/synthesis-decisions.json','--write'])
    run(prefix+'-finalize',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])
    run(prefix+'-finalize-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg])
    shutil.copytree(c['scratchOutput'],OWN/c['group']);idx=read(OWN/c['group']/'resolution-index.json')
    assert len(idx['resolutions'])==len(c['keepIds']) and all(r['strictDescriptionComplete'] for r in idx['resolutions'])
    assert idx.get('deferredGoalIds',[])==c['defer']
for item in frozen:
    assert sha(ROOT/item['freeze']['path'])==item['freeze']['sha256']
    for x in item['verifiedImmutableOutputs']:assert sha(ROOT/x['path'])=='sha256:'+x['sha256'].removeprefix('sha256:')
write(OWN/(stage+'.native-current-indices.actual.receipt.json'),{'role':'technical_synthesizer','strictDescriptionCandidates':sum(len(c['keepIds']) for c in CASES),'newIndependentReviewRounds':0,'originalReviewRunsRelabelled':False,'groups':[{'index':binding(OWN/c['group']/'resolution-index.json'),'strictGoalIds':c['keepIds'],'deferredHistoricalGoalIds':c['defer']} for c in CASES],'originalAuthorAndReviewArtifactsExactAfterSynthesis':True,'actualNativeTerminalChecksPassed':len(commands),'activeStrictNetGain':0,'sourceWholeSupersetApproved':False,'sourceHOLDsRetained':True,'humanApproval':False,'humanTrial':False,'activeWrites':0})
print(json.dumps({'ownDirectory':rel(OWN),'nativeGroups':len(CASES),'strictCandidates':sum(len(c['keepIds']) for c in CASES),'physicalScratch':str(ISO),'activeWrites':0}),flush=True)
