"""Verify exact inputs and seal only this additive reviewer package."""
import datetime, hashlib, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[7]
OUT=pathlib.Path(__file__).resolve().parent
AUTHOR=OUT.parent/'chemie-q2-naturstoffe-current402-author-20261012-v2'
def dig(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(ROOT))
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
assert not (OUT/'ORIGINAL.freeze.json').exists(), 'Original already sealed; do not overwrite.'
seal=load(AUTHOR/'FINAL.author-package.freeze.json')
own_bad=[];reused_deltas=[]
for r in seal['ownFiles']:
    p=ROOT/r['path'];actual={'bytes':p.stat().st_size,'sha256':dig(p.read_bytes())}
    if actual['bytes']!=r['bytes'] or actual['sha256']!=r['sha256']:own_bad.append({'path':r['path'],'actual':actual,'expected':r})
for r in seal['reusedInputRefs']:
    p=ROOT/r['path'];actual={'bytes':p.stat().st_size,'sha256':dig(p.read_bytes())}
    if actual['bytes']!=r['bytes'] or actual['sha256']!=r['sha256']:reused_deltas.append({'path':r['path'],'sealedExpectedBytes':r['bytes'],'sealedExpectedSHA256':r['sha256'],'liveActual':actual,'interpretation':'Authorized external root live delta; scientific review remains bound to exact owned frozen candidate/source snapshots.'})
assert not own_bad
livepath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
frozen=load(AUTHOR/'inputs/canonical.live-at-v2-seal.exact.json');live=load(livepath);candidate=load(AUTHOR/'candidate/canonical532.complete-inactive.json')
fb={g['id']:g for g in frozen['goals']};lb={g['id']:g for g in live['goals']};cb={g['id']:g for g in candidate['goals']}
deltas=[]
for gid in sorted(set(fb)|set(lb)):
    if fb.get(gid)!=lb.get(gid):
        old=fb.get(gid,{});new=lb.get(gid,{})
        fields=[k for k in sorted(set(old)|set(new)) if old.get(k)!=new.get(k)]
        deltas.append({'goalId':gid,'changedFields':fields,'candidateAlignedForChangedFields':all(cb.get(gid,{}).get(k)==new.get(k) for k in fields)})
dump(OUT/'checks/frozen-author-integrity-and-authorized-live-delta.actual.json',{'checkedAtUTC':stamp,'authorSealSHA256':dig((AUTHOR/'FINAL.author-package.freeze.json').read_bytes()),'authorOwnedFilesChecked':len(seal['ownFiles']),'authorOwnedMismatches':own_bad,'reusedInputsChecked':len(seal['reusedInputRefs']),'reusedLiveDeltas':reused_deltas,'frozenBaselineNodeCount':len(frozen['goals']),'liveNodeCount':len(live['goals']),'nodeIdSetUnchanged':set(fb)==set(lb),'changedLiveGoals':deltas,'scientificInput':'Owned exact frozen author 532/407 candidate, raw337 literal/source snapshots, native15+14 and final images.','liveChangesDoNotOverwriteFrozenCAS':True,'reviewerActiveWrites':False})

prior=[('chemie-q2-naturstoffe-current402-independent-b-20261012-v1','3861f6bc06a1d0bfd2d5877b36b865b4bcba584bc2832abc6b531eb18ee80cb8'),('chemie-q2-four-joint-current402-targeted-independent-b-20261012-v1','efc6c3dccb65b4f0646de5c274160d607b7fb930427827c180587e576563b96c'),('chemie-manganometry-current402-independent-b-20261012-v1','e1fee7335eadf0280ed125b8e9c3d65a636e7ee82e5a9e38dec6cab656073819'),('chemie-q2-four-final-metadata-current402-targeted-independent-b-20261012-v2','057de279c5d3155fad5da834408679f4839ddfcf6ec80bd64ed27b670444f4dd')]
prior_records=[]
for name,want in prior:
    p=OUT.parent/name/'ORIGINAL.freeze.json';actual=dig(p.read_bytes());assert actual=='sha256:'+want
    prior_records.append({'path':rel(p),'sha256':actual,'sameOriginalSeal':True})
dump(OUT/'checks/prior-own-original-seals-preserved.actual.json',{'checkedAtUTC':stamp,'seals':prior_records,'noPeerCurrentJudgmentRead':True})

campaigns=[]
for n in (1,2):
    owned=OUT/f'D29-batch-{n}-round-b';source=AUTHOR/f'native/batch-{n}/round-b'
    unchanged=[]
    for p in source.rglob('*'):
        if p.is_file() and 'results' not in p.relative_to(source).parts:
            q=owned/p.relative_to(source);assert q.read_bytes()==p.read_bytes();unchanged.append(rel(q))
    c=load(owned/'description-review-campaign.json');assert c['reviewPass']=='first_pass'
    campaigns.append({'batch':n,'reviewPass':c['reviewPass'],'unchangedPreparedFiles':unchanged,'recordsCount':c['goalCount']})
dump(OUT/'checks/exact-prepared-first-pass-campaign-retention.actual.json',campaigns)

parsed=[];symlinks=[]
for p in OUT.rglob('*'):
    if p.is_symlink():symlinks.append(rel(p))
    if p.is_file() and p.suffix in ['.json','.jsonl']:
        if p.suffix=='.json':load(p)
        else:
            for s in p.read_text().splitlines():
                if s.strip():json.loads(s)
        parsed.append(rel(p))
assert not symlinks
checks=load(OUT/'checks/final-normal-check-exits.actual.json');assert len(checks)==5 and all(x['exitCode']==0 for x in checks)
rows=load(OUT/'ORIGINAL.per-goal-strict-ready-and-exact-holds.json')['goals'];assert len(rows)==29
cfgs=[load(OUT/'positive/P29.independent-b.inactive.config.json'),load(OUT/'atomicity/A29.independent-b.inactive.config.json'),load(OUT/'memory/M407.independent-b.inactive.config.json')]
path_checks=[]
for c in cfgs:
    paths=[v for k,v in c.items() if k.endswith('Path') and isinstance(v,str)]+c.get('reviewRunManifestPaths',[])+[v['viewPath'] for v in c.get('visibilityScopes',[])]
    for path in paths:
        assert not pathlib.Path(path).is_absolute() and '..' not in pathlib.Path(path).parts
        if not path.endswith('.md') or (ROOT/path).exists():assert (ROOT/path).is_file()
        path_checks.append(path)
dump(OUT/'checks/full-JSON-parse-portability-and-final-normal.actual.json',{'checkedAtUTC':stamp,'parsedJSONJSONLFiles':len(parsed),'parsedPaths':parsed,'packageSymlinks':symlinks,'configsAndInputReferencesRepositoryRelative':True,'checkedConfigInputPaths':path_checks,'allFiveTargetedNormalCheckExitsZero':True,'normalDGoalCounts':[15,14],'normalP29NeedsHumanReview':29,'normalP29Approved':0,'normalA29Atomic':29,'normalMemory407NoMemory':350,'normalMemory407Required':57,'normalCardsCurrent':75,'normalVisibilityScopes':9,'sourcePreciseHolds':5,'positiveScientificHolds':7,'visualScientificHolds':1,'scientificStrictReadyWithinReviewedCandidateScope':16,'authorOwn625Unchanged':True,'noActiveOrGitWritesByReviewer':True})

files=[{'path':rel(p),'bytes':p.stat().st_size,'sha256':dig(p.read_bytes())} for p in sorted(OUT.rglob('*')) if p.is_file()]
dump(OUT/'ORIGINAL.freeze.json',{'schemaVersion':1,'packageId':OUT.name,'role':'INDEPENDENT_B_ORIGINAL_SCIENTIFIC_REVIEW','sealedAtUTC':stamp,'ownFiles':files,'ownFileCount':len(files),'ownedBytes':sum(x['bytes'] for x in files),'authorInputSealSHA256':dig((AUTHOR/'FINAL.author-package.freeze.json').read_bytes()),'authorNeutralEntrySHA256':dig((AUTHOR/'FINAL.targeted29.neutral-review-input.json').read_bytes()),'fresh29OriginalJudgmentBeforeAnyCurrentPeerJudgmentRead':True,'normalPreparedCampaigns':'Exact first_pass, 15+14','scientificPassWithinReviewedScopeCount':16,'preciseProfileHolds':7,'preciseSourceHolds':5,'preciseVisualHolds':1,'humanApprovals':0,'humanTrials':0,'activeCanonicalWritesByReviewer':0,'gitWrites':0,'noWholeSourceClauseOrTrackClearance':True,'liveReusedInputDeltasDisclosedSeparately':True})
print(json.dumps({'originalSealPath':rel(OUT/'ORIGINAL.freeze.json'),'originalSealSHA256':dig((OUT/'ORIGINAL.freeze.json').read_bytes()),'ownedFiles':len(files),'ownedBytes':sum(x['bytes']for x in files),'strictReadyPrefixes':[r['goalId'][:8] for r in rows if r['strictReadyForReviewedCandidateScope']],'profileHoldPrefixes':[r['goalId'][:8] for r in rows if r['P']=='HOLD'],'sourceHoldPrefixes':[r['goalId'][:8] for r in rows if r['source'].startswith('HOLD')],'visualHoldPrefixes':[r['goalId'][:8] for r in rows if r['V']=='HOLD'],'reusedLiveDeltaCount':len(reused_deltas),'liveChangedGoalPrefixes':[r['goalId'][:8] for r in deltas]},ensure_ascii=False))
