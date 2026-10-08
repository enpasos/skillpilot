# SPDX-License-Identifier: Apache-2.0
"""Seal portable inactive ten-goal genuine pair with immutable current192 guards."""
import copy
import datetime
import hashlib
import json
import os
import subprocess
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REQUIRED = {}
def rel(p): return str(p.relative_to(ROOT))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bound(p):
    out = {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}; REQUIRED[out['path']] = out; return out
def read(p): bound(p); return json.loads(p.read_text())
def verify(b):
    p = ROOT / b['path']; assert sha(p) == b['sha256'].removeprefix('sha256:'), p
    if 'bytes' in b: assert p.stat().st_size == b['bytes'], p
    return bound(p)
def put(name, value):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    data = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    p.write_text(data) if not p.exists() else (_ for _ in ()).throw(AssertionError(str(p)))
    return p

guard = read(OWN / 'checks/genuine-ten-pair-current192-ready.technical.json')
ids = guard['selectedGoalIds']; selected = set(ids); assert len(ids) == 10
for b in list(guard['beforeBindings'].values()) + guard['otherProtectedFiles']: verify(b)
assert read(OWN / 'checks/current-D10.terminal.actual.json')['exitCode'] == 0
for c in read(OWN / 'checks/final-adoption-D10-P10-observed-terminal.actual.json')['commands']: assert c['actualExitCode'] == 0
assert read(OWN / 'checks/native-ten-pair-D-synthesis-resolution.actual.technical.json')['existingCampaignResultDualSynthesisResolutionChecks'] == 'PASS'
assert read(OWN / 'checks/current192-final-full391-P10.actual.technical.json')['closedP10SchemaAndCurrentPNGSemantics'] == 'PASS'
audit = read(OWN / 'technical-guard-audit/actual-technical-guards.audit.json')
for name in ['initial-declared-inputs.technical.json','pending-P10-full391-declared-inputs.technical.json','genuine-ten-pair-declared-inputs.technical.json','native-ten-pair-D-declared-inputs.technical.json','final-P10-full391-declared-inputs.technical.json']:
    for b in read(OWN / 'checks' / name)['files']: verify(b)
for entry in guard['seals'].values():
    p = ROOT / entry['seal']['path']; verify(entry['seal']); seal = read(p)
    rows = seal.get('frozenFiles', seal.get('ownFiles')); assert len(rows) == entry['actualExactFiles']
    for b in rows: verify(b)
for b in guard['independentFirstSeals'].values(): verify(b)

registry = read(OWN / 'before/registry.json'); bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie'); oldbio = copy.deepcopy(bio)
d_path = rel(OWN / 'native-d-ten/resolution-index.json'); p_path = rel(OWN / 'positive/current10.future-active.config.json')
assert d_path not in bio['resolutionIndexPaths'] and p_path not in bio['positiveEvidenceConfigPaths']
bio['resolutionIndexPaths'].append(d_path); bio['positiveEvidenceConfigPaths'].append(p_path)
assert all(bio[k] == v for k,v in oldbio.items() if k not in ['resolutionIndexPaths','positiveEvidenceConfigPaths'])
put('candidate/registry-biologie.future-entry.json', bio); put('candidate/registry.future-active.reviewable.json', registry)
put('candidate/ledger-preserve-only.technical.json', {'currentLedger': guard['beforeBindings']['ledger'], 'activeBatchConfigPaths': guard['allSevenChemistryClaimsExact'], 'action': 'preserve_exact_no_write'})
central = read(OWN / 'before/current192-central.actual.json'); subjects = {s['subject']:s for s in central['subjects']}
assert subjects['biologie']['strictComplete'] == 192 and subjects['biologie']['denominator'] == 391 and not selected.intersection(subjects['biologie']['strictCompleteGoalIds'])
assert subjects['mathematik']['strictComplete'] == subjects['mathematik']['denominator'] == 807
assert subjects['physik']['strictComplete'] == subjects['physik']['denominator'] == 478
assert subjects['chemie']['strictComplete'] == 173 and subjects['chemie']['denominator'] == 378
replacements = [{'target': guard['beforeBindings'][key]['path'], 'source': bound(OWN / source), 'expectedBefore': guard['beforeBindings'][key]} for key,source in [('canonical','candidate/canonical.ten-current192-future-active.json'),('qa','candidate/visualization-qa.future-active.json')]]
ops = []
for item in guard['copies']:
    verify(item['source']); assert not (ROOT / item['target']).exists()
    ops.append({'action':'copy_exact','source':item['source']['path'],'sourceSha256':'sha256:'+item['source']['sha256'],'target':item['target'],'expectedBefore':'missing'})
assert len(ops) == 50
plan = {
    'role': 'Inactive genuinely reviewed current HE7 ten-goal integration plan, exact current192 rebase',
    'subject': 'biologie', 'selectedGoalIds': ids,
    'beforeCanonicalSha256': guard['beforeBindings']['canonical']['sha256'],
    'futureCanonicalSource': replacements[0]['source']['path'], 'futureCanonicalSha256': 'sha256:'+replacements[0]['source']['sha256'],
    'reviewedActiveReplacementFiles': replacements, 'replaceQaFrom': rel(OWN / 'candidate/visualization-qa.future-active.json'),
    'mergeOnlyBiologyRegistryEntryFrom': rel(OWN / 'candidate/registry-biologie.future-entry.json'), 'registryBefore': guard['beforeBindings']['registry'],
    'registryMergeInstruction': 'Append exactly the genuine native D10 resolution-index and P10 config to Biology only; preserve every existing index/supersession/other subject. No deferred targets in this genuine ten-goal pair.',
    'genuineD10ResolutionIndex': bound(ROOT / d_path), 'genuineP10FutureActiveConfig': bound(ROOT / p_path), 'genuineP10Records': bound(OWN / 'positive/current10.records.jsonl'),
    'ledgerPreserveOnly': rel(OWN / 'candidate/ledger-preserve-only.technical.json'), 'assetOperations': ops,
    'beforeBindings': guard['beforeBindings'], 'protectedOtherFiles': guard['otherProtectedFiles'], 'currentActualAMPathsProtected': guard['currentActualAMPathsProtected'],
    'protectedStrictGoalIds': {key:s['strictCompleteGoalIds'] for key,s in subjects.items()}, 'protectedCurrentGoalIds': {key:s['currentGoalIds'] for key,s in subjects.items()},
    'strictBaselineReport': bound(OWN / 'before/current192-central.actual.json'),
    'currentStrictBiologyActual': 192, 'currentDenominatorBiologyActual': 391, 'expectedPotentialAfterStrictBiology': 202,
    'potentialNewScientificClosures': 10, 'newScientificClosuresClaimedBeforeCentralCheck': 0, 'restoredBindingGainClaimedBeforeCentralCheck': 0,
    'exactOtherWholeGoalBodies': 464, 'exactOtherCurrentPages': 381, 'allOriginalSourceAndMappingBodiesUnchanged': True,
    'changedGoalFields': ['resourceLinks'], 'classifierAndAMWritesPlanned': 0, 'all474ClassifierBodiesAndCurrentAMConfigsReviewsCardsViewsExact': True,
    'actualIndependentSeals': guard['seals'], 'actualIndependentFirstSeals': guard['independentFirstSeals'],
    'actualNativeChecksExit0': ['currentD10','closedP10','actualPairedV10','pureWhole391'],
    'retainedAM': 'All current active full A/M configs and their currently pointed reviewPath files, historical reviews, cards and eight views preserved byte-exact; no A/M re-review or replacement for unchanged ten descriptions.',
    'excluded12Split': '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8', 'trueReviewerRunsAndAllHistoricalFirstVerdictsPreserved': True,
    'mustRunAfterApply': [
      {'argv':['node','app/node_modules/tsx/dist/cli.mjs',rel(OWN / 'check-current-reviewed-D10.technical.mts'),'--active'],'purpose':'Actual integrated current D10 native resolution binding'},
      {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+p_path],'purpose':'Ordinary public P10 CLI with actually installed PNG and unchanged active source-kind ledger'},
      {'argv':['npm','--prefix','app','run','check:goal-visualization-assets'],'purpose':'Actual canonical/frontend/backend assets and public links'},
      {'argv':['npm','--prefix','app','run','quality:deep-understanding-rollout:check'],'purpose':'Actual current strict five-gate report, protected IDs/floors and gain; no claim before terminal'}],
    'standardAtlasAfterStableIntegration': 'Regenerate ordinary source-atlas receipt at stable new canonical, preserving original source outputs and honest metadata-only lineage; bundle final full builds at stable integration.',
    'portableOperativeBundleContract': 'Copied native-d-ten/bundle/book.pdf/.html and contained manifest artifacts are operative. Old raw ignored rendered/sourcePath observations are historical provenance only; bundle artifactAccessPath governs live byte checks. HTML uses standard /assets URLs served under the documented author-publicRoot/contained image symlinks, not standalone file:// relocation. No ignore exception, force-add, validator or schema change.',
    'scienceSourceBoundary': 'Whole HE mandatory left-column duties and optional right-column recommendations distinguished by both reviewers. No new universal all-country original-operator closure, practical experiment performance or learner attainment asserted.',
    'separateHumanApprovalAndTrial': True, 'activeWrites': 0
}
plan_path = put('ready-root-reviewed-guarded-integration-plan.technical.json', plan)
for p in OWN.rglob('*'):
    if p.is_file():
        if p.suffix == '.json': json.loads(p.read_text())
        if p.suffix == '.jsonl':
            for line in p.read_text().splitlines(): json.loads(line)
        bound(p)
for path in read(ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')['mappingPaths']: bound(ROOT / path)
for path in ['app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','app/scripts/validateGoalDescriptionReviewDualRound.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts','app/scripts/goalDescriptionRolloutResolutionSynthesis.ts','app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/goalBookModel.ts','app/scripts/goalBookOriginalSources.ts','app/scripts/positiveGoalEvidenceProfileModel.ts']: bound(ROOT / path)
ignore = subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQUIRED)+'\n',capture_output=True,text=True)
assert ignore.returncode in [0,1] and not ignore.stdout.strip(), ignore.stdout
links = []
for path in list(REQUIRED):
    p = ROOT / path; assert p.exists(), p
    if p.is_symlink():
        target = os.readlink(p); assert not os.path.isabs(target), p
        resolved = p.resolve(strict=True); assert resolved.is_relative_to(ROOT) and rel(resolved) in REQUIRED, p
        links.append({'path':path,'relativeTarget':target,'target':bound(resolved),'broken':False})
portable = put('checks/final-required-input-portability-and-symlinks.actual.technical.json', {'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'requiredFiles':list(REQUIRED.values()),'actualGitCheckIgnoreExit':ignore.returncode,'ignoredRequiredFiles':[],'actualContainedRelativeSymlinks':links,'brokenRequiredSymlinks':0,'allOwnJSONAndJSONLParse':True,'operativeBundlePDFAndHTMLNotIgnored':True,'activeWrites':0,'strictGainClaimed':0})
put('TECHNICAL-READINESS.md', '# HE7 ten-goal genuine reviewed technical handoff\n\nActual Biology baseline: **192/391**, Chemistry173/378, Mathematics807/807 and Physics478/478. The genuine sealed independent whole D10/P10/V10 pair is preserved with its actual reviewer JSONL and run bytes. Native campaign/results/dual/synthesis/resolution, current D10, closed P10/current PNG semantics and pure391 checks passed. Ten complete profile bodies and twenty whole DE/EN cases remain unchanged, E1/G1 and needs_human_review; no real learner or practical performance is asserted.\n\nOnly ten primary visualization resourceLinks and ten QA machine fields are prepared over the actual current192 canonical. Other464 whole goals and381 whole pages, all474 semantic kinds, active A/M configs and their currently pointed review files, historical A/M rows, cards and eight views remain exact. The plan supplies50 exact asset copies and only Canonical+QA replacements plus Biology-only D10/P10 registry appends. Root must run active D10/P10/assets/central checks before counting a potential202/391. Separate human approval/trial remains open.\n\nAll operative dependencies are commit-capable and actual contained image symlinks resolve. Native PDF/HTML dependencies use the standard bundle contract; HTML is served under the documented author-publicRoot with ordinary /assets paths. Standalone file:// bundle relocation is not asserted. No schema, validator, ignore exception, forced add or active write is introduced.\n\nA real initial technical digest comparison failed because one API formats sha256 with its prefix. It remains recorded; normalization corrected representation only, leaving all actual PNG/science/reviewer artifacts unchanged. The independent technical child audit found no issue in19 direct guard checks.\n')
ownfiles = sorted(p for p in OWN.rglob('*') if p.is_file())
seal = put('technical-preparation.final.freeze.json', {'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'Inactive exact current192-rebased genuine reviewed ten-goal technical preparation','ownFiles':[bound(p) for p in ownfiles],'requiredPortableInputGuard':bound(portable),'readyPlan':bound(plan_path),'actualIndependentSeals':guard['seals'],'nativeCurrentD10':'PASS_actual0','nativeClosedP10':'PASS_actual0','actualPairedV10':'PASS','other464WholeGoalsAnd381WholePagesExact':True,'all474KindsAndCurrentAMByteExact':True,'strictGainClaimed':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'readyPlan':rel(plan_path),'finalSeal':rel(seal),'sha256':sha(seal),'nativeDPV10':'PASS','baselineActual':'192/391','potentialAfterRootActiveChecks':'202/391','portableRequiredFiles':len(REQUIRED),'ignoredRequired':0,'brokenSymlinks':0,'assetCopies':50,'activeWrites':0,'strictGainClaimed':0}))
