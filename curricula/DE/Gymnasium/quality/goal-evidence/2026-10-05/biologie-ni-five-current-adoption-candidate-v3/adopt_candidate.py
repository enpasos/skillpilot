# Apache-2.0. Root-owned bounded adoption helper; default is read-only dry-run.
# This author never executes --apply. Does not run status generators or write P.
from pathlib import Path
import argparse, copy, hashlib, json

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[6]
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
rel=lambda p:str(p.relative_to(ROOT))
def encode(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()

def plan():
    delta=read(OUT/'before-after-deltas.candidate.json')
    bindings=read(OUT/'input-bindings.receipt.json')['bindings']
    expected={x['path']:x['digest'] for x in bindings}
    copies=[
      ('canonical.biologie.candidate.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),
      ('biologie.semantic-kinds.prospective.json','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'),
      ('ni.current-source.candidate.json',delta['futureSourcePath']),
      ('ni.current-mapping.candidate.json',delta['futureMappingPath']),
      ('navigation.candidate.view.json','app/scripts/config/goal-books/navigation/de-gym-biology-national-atlas.view.json'),
      ('ni-source.candidate.view.json','app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json')]
    writes=[]
    for src,dst in copies:
        p=ROOT/dst
        if dst in expected:assert sha(p)==expected[dst],f'Current predecessor changed: {dst}'
        else:assert not p.exists(),f'Prospective destination already exists: {dst}'
        writes.append((p,(OUT/src).read_bytes()))
    # Shared registry/atlas preserve all unrelated entries and fields, including
    # parallel Chemistry work. Validate only the exact NI entry/atlas predecessors.
    entrydelta=delta['sourceRegistryEntry']
    regpath=ROOT/'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
    registry=read(regpath)
    index=next(i for i,x in enumerate(registry['entries']) if x['landscapeId']==delta['sourceLandscapeId'])
    assert registry['entries'][index]==entrydelta['before'],'NI registry entry changed'
    registry['entries'][index]=entrydelta['after'];writes.append((regpath,encode(registry)))
    atlaspath=ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
    atlas=read(atlaspath);old=read(OUT/'before/de-gym-biology-national-atlas.inputs.json')
    niold=[p for p in old['mappingPaths'] if '/DE-NI/' in p]
    assert [p for p in atlas['mappingPaths'] if '/DE-NI/' in p]==niold
    assert atlas['expectedCurricularAtomicGoalCount']==363
    atlas['mappingPaths']=[delta['futureMappingPath'] if p in niold else p for p in atlas['mappingPaths']]
    atlas['expectedCurricularAtomicGoalCount']=368;writes.append((atlaspath,encode(atlas)))
    # Full A/M successors retain all 363 predecessor decision bytes and all cards.
    for lane in ['semantic-atomicity','memory-card-review']:
        target='curricula/DE/Gymnasium/quality/'+lane+'/biologie-ni-five-current-20261005-v1/'
        cfg=read(OUT/(lane+'.candidate.config.json'))
        cfg['landscapePath']='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
        cfg['reviewPath']=target+'canonical-biology-full.review.jsonl'
        writes.extend([(ROOT/(target+'canonical-biology-full.config.json'),encode(cfg)),(ROOT/cfg['reviewPath'],(OUT/(lane+'.candidate.review.jsonl')).read_bytes())])
        if lane=='memory-card-review':
            cfg['cardReviewPath']=target+'canonical-biology-full.cards.review.jsonl'
            cfg['reportPath']='docs/qa-ci/status/memory-card-review-canonical-biology-full.md'
            writes[-2]=(ROOT/(target+'canonical-biology-full.config.json'),encode(cfg))
            writes.append((ROOT/cfg['cardReviewPath'],(OUT/'memory.cards.unchanged.review.jsonl').read_bytes()))
    archives=[]
    for x in delta['archivePlan']:
        active,historical=ROOT/x['currentPath'],ROOT/x['historicalPath']
        assert sha(active)==x['currentDigest']
        assert '/mapping/' not in x['historicalPath'] and '/input/' not in x['historicalPath']
        if historical.exists():assert historical.read_bytes()==active.read_bytes()
        archives.append((active,historical,active.read_bytes()))
    assert len(archives)==3
    return writes,archives

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--apply',action='store_true');p.add_argument('--acknowledge-candidate-holds',action='store_true');args=p.parse_args()
    writes,archives=plan()
    print(json.dumps({'mode':'apply' if args.apply else 'read_only_dry_run','rootOwnsIntegration':True,'writePaths':[rel(x) for x,_ in writes],'archiveOutsideScanners':[{'from':rel(a),'to':rel(h),'digest':sha(a)} for a,h,_ in archives],'remainingHolds':['actual current supplied-model visual review and Book/PDF D2 binding','DNA Aufbau0daa prerequisite-only scope decision for preserved NI targets'],'centralGatesNotRunOrClaimed':True,'PContentsRead':False,'humanApproval':False},ensure_ascii=False,indent=2))
    if args.apply:
        if not args.acknowledge_candidate_holds:p.error('--apply requires explicit root acknowledgement of the documented candidate holds')
        # Complete preflight precedes mutations. Byte archives are written and
        # verified before removing any scanner-visible predecessor. This helper
        # is a bounded operation, not a crash-atomic transaction; root keeps the
        # archive and uses its integration journal for interruption recovery.
        for active,historical,data in archives:
            historical.parent.mkdir(parents=True,exist_ok=True)
            if not historical.exists():historical.write_bytes(data)
            assert historical.read_bytes()==data
        for dest,data in writes:
            dest.parent.mkdir(parents=True,exist_ok=True)
            temporary=dest.with_name(dest.name+'.ni5-adoption-tmp');temporary.write_bytes(data);temporary.replace(dest)
        for active,historical,data in archives:
            assert historical.read_bytes()==data and active.read_bytes()==data
            active.unlink()
        print('Bounded files adopted; root must verify scanner uniqueness, regenerate source projections, review current Book/images and perform central integration gates. No gate or human approval claimed here.')
