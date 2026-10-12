# SPDX-License-Identifier: Apache-2.0
"""Seal exact author inputs for a future genuine current independent D2 pair."""
import datetime
import hashlib
import json
import shutil
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
O = E/'chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4'
B = E/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6'
IM = E/'chemie-q2-793-gc-three-bonds-sugar-attachment-author-root-20261012-v4'
EA = E/'chemie-q2-e81-and-978-current407-operative-material-scope-author-successor-20261012-v4'
HE = E/'chemie-q2-MM-HE-context-normative-edge-removal-author-20261012-v4'
IDS = ['e81a4aed-9695-533e-8eb7-7a0c714346ea','793189f8-78bd-5204-848b-fd2bbc12e458']

def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def ref(p):return {'path':str(p),'sha256':sha(p),'bytes':(R/p).stat().st_size}
def put(p,d):
    f=R/p
    if f.exists():
        assert json.loads(f.read_text())==d,('Existing additive artifact changed',p)
        return
    f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def rows(p):return [json.loads(s) for s in (R/p).read_text().splitlines() if s.strip()]

canonical = read(O/'candidate/canonical532.whole-goals-exact.current407.inactive.json')
assert canonical == read(B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json')
goals = {g['id']:g for g in canonical['goals']}
profiles = {p['goalId']:p for f in ['positive/P1.e81-operative-author.exact.jsonl','positive/P1.793-current-image.normal-materialized.pending.jsonl'] for p in rows(O/f)}
old_profiles = {p['goalId']:p for p in rows(B/'positive/P37.current-whole-retained-and-targeted.pending.review.jsonl')}
dna=IDS[1]
assert profiles[dna]['profile'] == old_profiles[dna]['profile']
assert profiles[dna]['profileFingerprint'] == old_profiles[dna]['profileFingerprint']
assert profiles[dna]['reviewInputFingerprint'] != old_profiles[dna]['reviewInputFingerprint']
assert (R/O/'positive/P1.e81-operative-author.exact.jsonl').read_bytes() == (R/EA/'positive/P1.e81-only.actual-bound.informed-author.review.jsonl').read_bytes()
whole=read(O/'cases/two-goals-seven-whole-operative-cases.DEEN.json')
assert len(whole['DNAWholeCasesExact']) == 3 and len(whole['e81WholeOperativeCasesExact']) == 4
assert whole['e81WholeOperativeCasesExact'] == read(EA/'cases/whole4.e81-only.current-operative.DEEN.material-protocol-solutions-rubrics.json')['cases']
old_raw=read(B/'sources/all-current-raw-source-bindings.no-display-dedup.json')
bounded_raw=[r for r in old_raw['rawBindings'] if r['directCanonicalOwner'] in IDS or set(r.get('affectedTargetDescendants',[])).intersection(IDS)]
put(O/'sources/two-target-original-literal-routes.unchanged-scope-before-dedup.json',{
    'role':'Original whole literal routes for the unchanged two target source owners; new HE MM source-only correction supplied separately',
    'originalRaw1242Source':ref(B/'sources/all-current-raw-source-bindings.no-display-dedup.json'),
    'rawBindings':bounded_raw,'rawBindingCount':len(bounded_raw),'displayDeduplicated':False,
    'sourceOnlyHEReplacement':ref(HE/'FINAL.HE-provenance-only.neutral-author-successor.json'),
    'newSourceUnionOrReadinessApproval':False,
})
model=read(O/'native/full407.two-remedies.normal-model.json')
pages={p['goalId']:p for p in model['pages']}
asset_map={a['goalId']:a for a in read(O/'assets/all412-actual-image-source-bindings.json')['assets']}
put(O/'neutral/two-whole-current-scientific-goals-profiles-cases-and-context.json',{
    'role':'Current informed author input, no peer verdicts or independent votes',
    'goals':[{'wholeCanonicalGoal':goals[i],'wholeCurrentPage':pages[i],'wholePositiveRecord':profiles[i],
        'wholeDirectPrerequisiteGoals':[goals[x] for x in goals[i].get('requires',[]) if x in goals],
        'wholeReverseDependentGoals':[g for g in canonical['goals'] if i in g.get('requires',[])],
        'wholeParents':[g for g in canonical['goals'] if i in g.get('contains',[])],
        'actualImage':asset_map[i]} for i in IDS],
    'wholeSevenOperativeCases':ref(O/'cases/two-goals-seven-whole-operative-cases.DEEN.json'),
    'oldContradictoryMaterialIsOperative':False,
    'actualLearnerExecutionClaimed':False,'humanApprovalClaimed':False,
})
put(O/'checks/FINAL.two-real-scientific-corrections-exact-conservation.actual.json',{
    'role':'Bounded technical conservation verification, not scientific approval',
    'wholeCanonical532AllExact':True,'wholeSemantic407DecisionsExact':read(O/'candidate/semantic407.same-decisions-current-path.json')['decisions']==read(B/'candidate/semantic407.current-normal-input.json')['decisions'],
    'DNAWholePProfileAndFingerprintExact':True,'DNAActualNewImageChangesInputFingerprint':True,
    'e81WholePLineExactInformedAuthorSuccessor':True,'threeDNAWholeCasesExact':True,'fourE81WholeOperativeCasesExact':True,
    'rootChangedNativePagesExactly2':read(O/'checks/normal407-model-exact-two-page-delta.actual.json'),
    'remaining405PageFingerprintsUnchanged':True,'sourceScopeAndMMRemedyRemainSeparate':True,
    'activeStrictComplete':217,'activeDenominator':402,'candidateDenominator':407,
    'newIndependentVotes':0,'strictGain':0,
})
campaigns=[]
for rnd in ['a','b']:
    d=O/f'native-D2/round-{rnd}'
    c=read(d/'description-review-campaign.json')
    assert c['reviewPass']=='first_pass' and c['goalCount']==2
    assert not any((R/d/'results').glob('*.jsonl'))
    campaigns.append({'round':rnd,'campaign':ref(d/'description-review-campaign.json'),'input':ref(d/'description-review-input.json'),'bundle':ref(d/'review-bundle-manifest.json'),'resultsDirectory':str(d/'results')})
for script in ['prepare_v4.py','build_v4.ts','build_source_v4.ts','finalize_v4.py']:
    dst=R/O/'reproduction'/script;src=R/'tmp/chemie-n2-current-D2-root'/script
    if dst.exists():
        if dst.read_bytes()!=src.read_bytes():
            dst=R/O/'reproduction'/('corrected-'+script)
            assert not dst.exists(),dst
            shutil.copyfile(src,dst)
        continue
    dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
entry=O/'FINAL.current-two-real-remedies.neutral-review-input.json'
put(entry,{
    'artifactRole':'Inactive exact current two-goal scientific remedy input; informed author, not independent reviewer',
    'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'currentGoalIds':IDS,'genuineCurrentIndependentPairPending':True,
    'wholeCanonical':ref(O/'candidate/canonical532.whole-goals-exact.current407.inactive.json'),
    'semanticKinds':ref(O/'candidate/semantic407.same-decisions-current-path.json'),
    'visualizationQA':ref(O/'candidate/visualization-QA.actual-793-successor.pending.json'),
    'wholeCurrentTargetScience':ref(O/'neutral/two-whole-current-scientific-goals-profiles-cases-and-context.json'),
    'wholeSevenOperativeCases':ref(O/'cases/two-goals-seven-whole-operative-cases.DEEN.json'),
    'positiveConfigs':[ref(O/f'configs/{p}') for p in ['P1.e81-operative.inactive.config.json','P1.793-current-image.inactive.config.json']],
    'positiveInputs':[ref(O/f'positive/{p}') for p in ['P1.e81-operative-author.exact.jsonl','P1.793-current-image.normal-materialized.pending.jsonl']],
    'full407CurrentModel':ref(O/'native/full407.two-remedies.normal-model.json'),
    'boundedNativeD2Model':ref(O/'native-D2'/read(O/'native-D2/batch-manifest.json')['artifacts']['bookModelPath']),
    'currentSourceUnion387Model':ref(O/'atlas/current-source-union.normal-model.json'),
    'currentOriginalSources':ref(O/'atlas/current-source-union.normal-original-sources.json'),
    'literalTwoTargetRoutesBeforeDedup':ref(O/'sources/two-target-original-literal-routes.unchanged-scope-before-dedup.json'),
    'actualImage412Bindings':ref(O/'assets/all412-actual-image-source-bindings.json'),
    'actualCorrectedDNAImageSeal':ref(IM/'FINAL.author-image-successor.freeze.json'),
    'e81WholeAuthorSeal':ref(EA/'FINAL.author-successor.freeze.json'),
    'sourceOnlyHEAuthorSeal':ref(HE/'FINAL.author-provenance-successor.freeze.json'),
    'original266TechnicalSeal':ref(B/'FINAL.technical-preparation.freeze.json'),
    'originalM407ConfigNoGoalOrMemoryDecisionChanged':ref(B/'memory/M407.current-normal.inactive.config.json'),
    'normalExactTwoTupleAndConservation':ref(O/'checks/FINAL.two-real-scientific-corrections-exact-conservation.actual.json'),
    'campaigns':campaigns,
    'sourceOnlyGoalIds':['c245d5fd-ce46-5b45-ab2e-e610547b5f7c','b4ca3af2-77f1-59e8-955d-c4959e284242','3ce81f96-4fbb-5022-88b7-337a000315ed'],
    'remainingHolds':[
        'Exactly e81 and DNA793 current native scientific review pair still pending; no old verdict or new hash is substituted for real review.',
        'OneHE MM contextual normative target removed, but four inheritedNI functional-group/everyday-significance witnesses remain. MM is OWN enrichment, not an official norm. Further source-boundary author remedy is pending.',
        'Source-specific prerequisite readiness remains separately unapproved wherever no valid supported current path is evidenced; broad source unions remain unapproved.',
        'Full407 canonical review and source387 union are distinct current universes; 496 unresolved source-scope decisions and20 source-atlas omissions remain.',
        'Authored proposed laboratory designs and synthetic observations do not prove actual learner execution or human trial.',
    ],
    'newScientificVotes':0,'strictGain':0,'activeStrictComplete':217,'activeDenominator':402,
    'HumanApproval':False,'HumanTrial':False,'grantsM7Closure':False,'activeOrGitWrites':False,
})
files=sorted(p for p in (R/O).rglob('*') if p.is_file())
assert not any(p.is_symlink() for p in (R/O).rglob('*'))
seal=O/'FINAL.technical-preparation.freeze.json'
put(seal,{'artifactRole':'Exact additive technical-current input seal; no independent votes',
    'neutralEntry':ref(entry),'ownFiles':[ref(p.relative_to(R)) for p in files],
    'newScientificVotes':0,'strictGain':0,'activeOrGitWrites':False})
print(json.dumps({'entry':str(entry),'entrySHA':sha(entry),'seal':str(seal),'sealSHA':sha(seal),'ownedFiles':len(files),'ownedBytes':sum(p.stat().st_size for p in files),'strictGain':0}))
