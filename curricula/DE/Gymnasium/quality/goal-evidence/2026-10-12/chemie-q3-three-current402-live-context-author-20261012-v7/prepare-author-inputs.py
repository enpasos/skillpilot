import copy
import datetime
import hashlib
import json
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parents[7]
BASE = pathlib.Path(__file__).resolve().parent
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-q3-v6-current402-neutral-context-integration-preparation-20261011-v1'
IDS = ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09']
def read(p): return json.loads(p.read_text())
def rel(p): return str(p.relative_to(ROOT))
def ref(p):
    b=p.read_bytes()
    return dict(path=rel(p), bytes=len(b), sha256='sha256:'+hashlib.sha256(b).hexdigest())
def write(p,v):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')

# Exact historical references are inputs, never output destinations.
entry=read(OLD/'FINAL.neutral-current402-input-manifest.json')
join=read(ROOT/entry['entryPath'])
assert [g['wholeCandidateGoal']['id'] for g in join['goals']]==IDS
live=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
live_land=read(live)
old_land=read(OLD/'baseline/canonical523.current-active.exact.json')
old_goals={g['id']:g for g in old_land['goals']}
live_drift=[dict(goalId=g['id'],before=old_goals[g['id']],after=g) for g in live_land['goals'] if g!=old_goals[g['id']]]
assert {x['goalId'] for x in live_drift}=={'a44af1fa-5988-5b7d-b206-691c6bbf7dd4','4b6d1824-20e4-597e-b639-fae401f740f0','805a2f58-29ce-55d0-8a85-42ee486239b3','1351706f-4ea6-56e9-951b-87b24cbcdee8','413040cd-ba74-5227-948c-a778b0bd0f56'}
assert all({k for k in x['after'] if x['before'].get(k)!=x['after'][k]}=={'applicability'} for x in live_drift)
central=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
subject=next(s for s in read(central)['subjects'] if s['subject']=='chemie')
mcfg=read(ROOT/subject['memoryReviewConfigPath'])
prior_refs=[]
parent_external_drift=[]
for f,key in [('FIRST.actual-current402-technical-inputs.json','inputs'),('FIRST.supplement.actual-normal-helper-view-assets.json','inputs'),('FIRST.supplement.actual-normal-helper-view-assets.json','assets')]:
    for r in read(OLD/f)[key]:
        p=ROOT/r['path']
        if ref(p)['sha256']!=r['sha256']:parent_external_drift.append(dict(path=r['path'],frozen=r,current=ref(p)))
        prior_refs.append(ref(p))
copies=['baseline/canonical523.current-active.exact.json','baseline/semantic402.current-active.exact.json','baseline/visualization-QA.current-active.exact.json','baseline/source-atlas.inputs.current-active.exact.json','baseline/source-atlas.book.current-active.exact.json','baseline/duration-model-policy.current-active.exact.json','baseline/chemie.current-central-subject.actual.json','candidate/canonical523.only-Q3-two-DEEN-three-PNG.inactive.json','candidate/semantic402.only-two-current-fingerprints.inactive.json','candidate/visualization-QA.only-three-unapproved-PNG.inactive.json','positive/P3.frozen398-author-science.exact.jsonl','positive/retained-current-non-Q3-lines.exact.jsonl','cases/cases6.current402.whole-context.technical.json','cases/q3-01-c.current402.SYNTHETIC-template.technical.json','cases/routine-transfer-boundary.exact.json','inputs/current-active-positive-input-paths.actual.json','checks/B007-six-goals-five-requires-protected.actual.json','checks/current-three-vs-frozen398-context-differences.actual.json']
for f in copies:
    d=BASE/f;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(OLD/f,d)
# Live baseline contains the later five B007 applicability fixes. Never replay
# the parent's old all-goal file over them.
shutil.copyfile(live,BASE/'baseline/canonical523.live.exact.json')
shutil.copyfile(ROOT/subject['semanticKindLedgerPath'],BASE/'baseline/semantic402.live.exact.json')
shutil.copyfile(ROOT/subject['visualizationQaPath'],BASE/'baseline/visualization-QA.live.exact.json')
candidate=copy.deepcopy(live_land)
candidate_goals={g['id']:g for g in candidate['goals']}
for g in join['goals']:
    cid=g['wholeCandidateGoal']['id']; current=candidate_goals[cid]
    frozen=g['wholeCandidateGoal']
    assert {k:current[k] for k in current if k not in ['description','descriptionEn','resourceLinks']}=={k:frozen[k] for k in frozen if k not in ['description','descriptionEn','resourceLinks']}
    for k in ['description','descriptionEn','resourceLinks']:current[k]=copy.deepcopy(frozen[k])
write(BASE/'candidate/canonical523.live-five-applicability-fixes-Q3-only.inactive.json',candidate)
write(BASE/'checks/LIVE-vs-parent-five-B007-applicability-fixes.actual.json',dict(changedGoals=live_drift,parentInputDrift=parent_external_drift,livePreserved=True))
shutil.copyfile(ROOT/entry['entryPath'],BASE/'inputs/parent-whole-three-current402-source382-P3-seven-cases.exact.json')
write(BASE/'baseline/memory402.current-config.exact.json',mcfg)
shutil.copyfile(ROOT/mcfg['reviewPath'],BASE/'baseline/memory402.current-necessity.exact.jsonl')
shutil.copyfile(ROOT/mcfg['cardReviewPath'],BASE/'baseline/memory75.current-cards.exact.jsonl')
for g in join['goals']:
    r=next(x for x in entry['originalPNGs'] if x['goalId']==g['wholeCandidateGoal']['id'])
    source=ROOT/r['path'];assert ref(source)['sha256']==r['sha256']
    own=BASE/'assets'/g['wholeCandidateGoal']['id']/source.name;own.parent.mkdir(exist_ok=True);shutil.copyfile(source,own)
    shutil.copyfile(source.parent/'prompt.de.md',own.parent/'original-generation-prompt.exact.de.md')
    image_url=g['wholeCandidateGoal']['resourceLinks'][0]['url']
    pub=BASE/'native-public'/image_url.lstrip('/');pub.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,pub)
    from PIL import Image
    im=Image.open(source)
    for width in [360,680]:
        im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS).save(own.parent/f'view-{width}.png')
prompts=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/prompts'
for f in ['goal-description-understanding-evidence-review-v2.md','chemistry-goal-description-understanding-evidence-review-criteria-v1.md','goal-evidence-review-v1.md','goal-evidence-review-criteria-v1.md']:
    shutil.copyfile(prompts/f,BASE/'review'/f)
extra=[live,central,ROOT/subject['memoryReviewConfigPath'],ROOT/mcfg['reviewPath'],ROOT/mcfg['cardReviewPath'],OLD/'FINAL.immutable-neutral-current402-technical-preparation.freeze.json',OLD/'FINAL.neutral-current402-input-manifest.json',ROOT/entry['entryPath']]
extra.extend((ROOT/'app/scripts'/f) for f in ['goalBookModel.ts','goalBookRenderer.ts','goalBookSourceAtlasInputs.ts','goalBookOriginalSources.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts','materializeGoalDescriptionRolloutBatch.ts','exportGoalBookReviewBundle.ts','createGoalDescriptionReviewCampaign.ts','memoryCardReview.ts'])
inputs={r['path']:r for r in prior_refs}
for p in extra:
    inputs[rel(p)]=ref(p)
for p in sorted(BASE.rglob('*')):
    if p.is_file():inputs[rel(p)]=ref(p)
write(BASE/'FIRST.author-exact-inputs-CAS.json',dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='AUTHOR input seal; not an independent review',wholeCanonicalGoals=523,currentCurricularAtomic=402,currentSourceUnion=382,goalIds=IDS,inputs=list(inputs.values()),activeWrites=False,HumanApproval=False,HumanTrial=False))
print(json.dumps(dict(inputFiles=len(inputs),candidateGoals=523,currentAtoms=402,sourceUnion=382,protectedB007Requires='copied exact',activeWrites=False)))
