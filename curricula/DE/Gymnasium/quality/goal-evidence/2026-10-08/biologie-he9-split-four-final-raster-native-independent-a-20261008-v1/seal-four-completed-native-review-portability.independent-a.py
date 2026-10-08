# SPDX-License-Identifier: Apache-2.0
"""Seal true completed A4 with actual commit-portability and contained links."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import subprocess

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
AUTHOR=OWN.parent/'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
PRIOR=OWN.parent/'biologie-he9-contraception-parenthood-scope-preserving-split-independent-a-20261008-v1'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
    with p.open('x') as stream: stream.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
first=OWN/'first-four-genuine-current-D-P-V.independent-a.exact.freeze.json'
assert sha(first)=='f6b5f1be328bdb7124330a000a1f7752475fb99edb4a641bb52abb432333a8fc'
for b in read(first)['ownFiles']: assert bind(ROOT/b['path'])==b
for name in ['D4','P4']: assert read(OWN/f'{name}.native.terminal.actual.json')['actualTerminalExitCode']==0
positive=read(OWN/'P4.actual-native-current-raster-and-retained-AM.independent-a.json')
assert positive['configuredGoals']==positive['needsHumanReview']==4
assert positive['schemaErrors']==positive['semanticErrors']==positive['approved']==0
author_seal=AUTHOR/'current-four-raster-native-author-input.first.freeze.json'
prior_seal=PRIOR/'completed-science-source-class-A2-M2-native-bindings.independent-a.exact.freeze.json'
declared=read(author_seal)['frozenFiles']+read(prior_seal)['frozenFiles']
paths={b['path']:b for b in declared}
for p in [author_seal,prior_seal,first]: paths[str(p.relative_to(ROOT))]=bind(p)
for im in read(AUTHOR/'selected-four-images.exact.json')['images']:
    for k in ['path','promptPath','toolProvenancePath']:
        if k in im: paths[im[k]]=bind(ROOT/im[k])
for p in OWN.rglob('*'):
    if p.is_file(): paths[str(p.relative_to(ROOT))]=bind(p)
links=[]
for rel,b in paths.items():
    p=ROOT/rel
    assert p.is_file(),rel
    assert sha(p)==b['sha256'] and p.stat().st_size==b['bytes'],rel
    if p.is_symlink():
        target=p.resolve(strict=True); link=os.readlink(p)
        assert not Path(link).is_absolute()
        assert target.is_relative_to(AUTHOR)
        assert str(target.relative_to(ROOT)) in paths
        if 'relativeLinkText' in b: assert link==b['relativeLinkText']
        if 'resolvedPortableTarget' in b: assert str(target.relative_to(ROOT))==b['resolvedPortableTarget']
        links.append({'path':rel,'actualRelativeLink':link,'actualContainedTarget':str(target.relative_to(ROOT)),'exists':True})
argv=['git','check-ignore','--no-index','--verbose',*sorted(paths)]
result=subprocess.run(argv,capture_output=True,text=True)
assert result.returncode in [0,1] and not result.stderr.strip(),result.stderr
matches=[s for s in result.stdout.splitlines() if s.strip()]
excluded=[s for s in matches if not s.split('\t',1)[0].split(':',2)[2].startswith('!')]
assert not excluded,'\n'.join(excluded)
for p in OWN.rglob('*'):
    if p.is_file() and p.suffix=='.json': read(p)
    elif p.is_file() and p.suffix=='.jsonl':
        for s in p.read_text().splitlines():
            if s.strip(): json.loads(s)
write(OWN/'actual-final-operative-inputs-portability-links.independent-a.guard.json',{
    'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),
    'requiredFiles':list(paths.values()),'actualRequiredCount':len(paths),
    'actualGitCheckIgnore':{'argv':argv,'actualExitCode':result.returncode,'actualStdout':result.stdout,'actualStderr':result.stderr,
        'existingIncludeNegations':matches,'actualExcludedRules':excluded},
    'ignoredRequired':0,'actualContainedRelativePNGAliases':links,'brokenSymlinks':0,
    'operativeNativePDF':str((AUTHOR/'native-raster-candidate-v2/four/bundle/book.pdf').relative_to(ROOT)),
    'operativeNativeHTML':str((AUTHOR/'native-raster-candidate-v2/four/bundle/book.html').relative_to(ROOT)),
    'contract':'Current campaign artifact paths resolve to the ordinary bundle. Raw local renders/PDF cache remain historical observations, not required live check/build dependencies. No .gitignore exception, force-add or third-party fullPDF/HTML copy.',
    'peerCurrentFinalBFilesRead':0,'activeWrites':0})
write(OWN/'completed-current-four-D-P-V-source-class-AM.independent-a.final.freeze.json',{
    'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),
    'role':'Genuine completed independent A current HE12 split four whole raster/native review',
    'authorInput':bind(author_seal),'ownFirstWholeJudgment':bind(first),'retainedGenuineSourceClassAM':bind(prior_seal),
    'ownFiles':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'nativeD4':{'actualTerminalExitCode':0,'campaignGoalCount':4,'batchSize':4,'genuineOwnRecords':4,'KEEP':4,'ownResultsDirectory':str((OWN/'round-a/results').relative_to(ROOT))},
    'nativeP4':{'closedSchemaErrors':0,'currentGoalKindPNGAndProfileSemanticErrors':0,'scopedWholeSciencePASS':4,'needsHumanReview':4,'approved':0,'evidenceLevel':'E1','maximumClaimScope':'G1'},
    'actualV4':{'fullPNGs':4,'width360':4,'width680':4,'wholeNativePDFPages':4,'newPNG':2,'KEEPexistingPNG':2,'KEEP':4,'HOLD':0},
    'genuineSourceKindAMAdoption':'Previously genuinely reviewed two atomic children and stable curricularArea parent adopted without scientific-body changes; native-current392A/M retain390other rows exact. No new cards required; old card/visibility validity is retained, not reinvented.',
    'wholeScopesAndPositionGuards':{'473OriginalOtherGoalBodiesExact':True,'31ViewsOnlyStableParentEntryKindChanges':True,'originalProjectionRolesRetained':True,'81StrictPositionOnlyNativeReferenceInputsVerified':226,'sameSubsetsBeforeAfterExact':True,'twoHistoricalContextDifferencesNotNewFindings':True},
    'sourceScopeBoundary':'Source-bound wholeHE9.3 selected assessment/reflection clauses and optional/adjacent distinctions retained. Raw16-country metadata is not fresh nationwide operator approval; no source breadth or learner-practical evidence claimed beyond whole actual public synthetic cases.',
    'blockingFindings':[],'portability':{'actualRequiredCount':len(paths),'ignoredRequired':0,'brokenSymlinks':0},
    'ordinaryPublicPCLI':'Still pending guarded active integration, because two actual PNGs are deliberately not installed.',
    'peerCurrentFinalBFilesRead':0,'firstSealBeforeAnyCurrentPeerReading':True,'realLearnerEvidence':False,
    'actualExperiments':0,'imageGenerationIsApproval':False,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0,
    'nextRequiredWork':'Genuine final B pair, ordinary D4 paired synthesis/resolution and current392 guarded integration; preserve202old strict IDs, protected subjects and old stable-ID history. Then affected real public P and central checks, not a closure claim from this A review.'})
final=OWN/'completed-current-four-D-P-V-source-class-AM.independent-a.final.freeze.json'
print(json.dumps({'finalSeal':bind(final),'actualNativeD4':0,'actualNativeP4':0,'VKEEP':4,'actualRequiredCount':len(paths),'ignoredRequired':0,'brokenSymlinks':0,'peerCurrentFinalBFilesRead':0,'activeWrites':0,'strictGainClaimed':0}))
