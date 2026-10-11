import copy, hashlib, json, pathlib

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
A = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1'
O = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-five-nav-status-practice-purpose-independent-merge-audit-v1'
O.mkdir(exist_ok=True)

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def relative(p):
    p = pathlib.Path(p)
    return str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p)

def digest(p):
    p = pathlib.Path(p)
    return dict(path=relative(p), sha256=hashlib.sha256(p.read_bytes()).hexdigest(), bytes=p.stat().st_size)

def bound(d):
    p = ROOT / d['path']
    assert digest(p)['sha256'] == d['sha256'], d['path']
    return p

def write(name, x):
    p = O / name
    literal = json.dumps(x, ensure_ascii=False, indent=2) + '\n'
    if p.exists():
        assert p.read_text() == literal, p
    else:
        p.write_text(literal)
    return digest(p)

def delta(a, b, prefix=''):
    if a == b:
        return []
    if isinstance(a, dict) and isinstance(b, dict):
        return sum((delta(a.get(k), b.get(k), prefix + '/' + k) for k in sorted(set(a) | set(b))), [])
    return [dict(field=prefix, before=a, after=b)]

I = read(A / 'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json')
before_path, after_path = bound(I['wholeBeforeCAN']), bound(I['wholeAfterCAN'])
before, after = read(before_path), read(after_path)
bm, am = ({g['id']:g for g in c['goals']} for c in (before, after))
nav_path = bound(I['fiveWholeNavDeltas'])
nav = read(nav_path)
materials_path = bound(I['wholeForeign33StatusOnlyBodies'])
materials = read(materials_path)
assert len(bm) == 645 and len(am) == 678
assert set(am) - set(bm) == set(I['newMaterialIds']) and len(materials) == 33
assert {g['id'] for g in materials} == set(I['newMaterialIds'])
nav_ids = {r['goalId'] for r in nav}
assert len(nav_ids) == 5
assert [g for g in before['goals'] if g['id'] not in nav_ids] == [g for g in after['goals'] if g['id'] in bm and g['id'] not in nav_ids]
assert {k:v for k,v in before.items() if k != 'goals'} == {k:v for k,v in after.items() if k != 'goals'}
assert all(am[g['id']] == g for g in materials)

seals = [(I['internationalScienceReceipt'], 'actualReviewedWhole12Body', 12), (I['operationsScienceReceipt'], 'actualReviewedWhole14FinalBody', 14), (I['policyScienceReceipt'], 'wholeFinalReviewedSevenDRAFT', 7)]
status_rows = []
source_input_guards = []
for sd, bodykey, count in seals:
    sp = bound(sd)
    seal = read(sp)
    bp = bound(seal[bodykey])
    original = read(bp)
    if isinstance(original, dict):
        original = original['materials']
    assert len(original) == count
    source_input_guards.extend([digest(sp), digest(bp)])
    for g in original:
        final = am[g['id']]
        ds = delta(g, final)
        assert {d['field'] for d in ds} <= {'/examData/reviewStatus', '/examData/reviewNote'}
        assert g['examData']['reviewStatus'] == 'draft'
        assert final['examData']['reviewStatus'] == 'released'
        assert 'menschliche' in final['examData']['reviewNote'].lower()
        assert sd['sha256'][:16] in final['examData']['reviewNote'] or sd['sha256'] in final['examData']['reviewNote']
        assert final['contains'] == [] and final['requires'] == final['examData']['coveredGoalIds'] and len(final['requires']) == 1
        assert final['extendedData']['applicabilityFromRequires'] is True
        status_rows.append(dict(materialId=g['id'], phase=final['phase'], title=final['title'], wholeQualifiedOriginal=g, wholeStatusAfter=final, actualDeltas=ds, scienceSeal=sd,
            decision='KEEP: literal machine release and provenance binding only', reason='The exact independently qualified task, solution, rubric, facts, whole competence coverage, prerequisite and course boundary remain unchanged. Released is the native machine material status; the note expressly separates human approval and testing. Neither this status nor assessment-requires applicability proves source coverage or a new country compulsory goal.'))
assert len(status_rows) == 33

rationales = {
 'E': 'The eleven independent endpoints concern capital-provider rights and liability, balance/profit interpretations, market forms, stakeholder responsibility, business models, actual official-table work, money history and representations. The appended purpose identifies those actual materials; it neither adds an umbrella assessment nor a universal prerequisite. Existing E text and children remain exact.',
 'Q1': 'The four policy materials compare historical/current diagnoses, actual competitive institutions and temporary demand interventions, digital-service alternatives and conditional future scenarios. The English summary institutional and demand policy accurately names concrete R/S mechanisms in the whole 6694 DE/EN body. It is a short non-exhaustive navigation purpose, not a definition equating all Prozesspolitik with demand policy; the same body separately retains year-3 access/productivity and all L/O/K reasoning. No complete competence is replaced by the navigation sentence.',
 'Q2': 'The three operations endpoints retain independent investment-timing/risk, procurement and financing contracts. The two policy endpoints retain dated opposing wage positions and actual retraining/counterfactual evidence. Their purpose is accurate and does not turn all Q2 competences into mandatory common prerequisites.',
 'Q3': 'The old 25 children remain first. Six international cases separately assess supply chains, dated trade evidence, instruments, regimes, distribution and sanctions; one policy case explicitly relates energy, financing, employment, environment and a bounded hypothetical payment transition. The joint description preserves the stated complete contract and course boundary of each endpoint, with no fictional classroom number represented as an official outcome.',
 'Q4': 'Six international endpoints separately assess institutional mandates, SDGs/Paris financing, inclusive development, trade-development pathways, HDI/Gini and programme evaluation. The description is navigation over those independent materials, not a new institutional-performance goal. Bremen is the single native child-union jurisdiction addition; Bavaria and Thuringia remain excluded. The old three explicitly LK-only advanced materials keep that boundary.'
}
nav_rows = []
for r in nav:
    g, old, new = r['goalId'], r['wholeBefore'], r['wholeAfter']
    assert old == bm[g] and new == am[g]
    assert old['requires'] == new['requires'] == []
    assert new['contains'] == old['contains'] + r['orderedNewMaterialIds']
    assert len(set(new['contains'])) == len(new['contains'])
    assert all(am[m]['phase'] == r['phase'] for m in r['orderedNewMaterialIds'])
    for f in ('description', 'descriptionEn'):
        assert new[f].startswith(old[f])
    ds = delta(old, new)
    allowed = {'/contains', '/description', '/descriptionEn'}
    if r['phase'] == 'Q4':
        allowed.add('/applicability/jurisdiction')
        assert set(new['applicability']['jurisdiction']) - set(old['applicability']['jurisdiction']) == {'DE-HB'}
        assert set(old['applicability']['jurisdiction']) <= set(new['applicability']['jurisdiction'])
        assert len(old['applicability']['jurisdiction']) == 13 and len(new['applicability']['jurisdiction']) == 14
        assert 'DE-BY' not in new['applicability']['jurisdiction'] and 'DE-TH' not in new['applicability']['jurisdiction']
    assert {d['field'] for d in ds} == allowed
    nav_rows.append(dict(goalId=g, phase=r['phase'], wholeBefore=old, wholeAfter=new, actualDeltas=ds, appendedWholeChildren=[am[m] for m in r['orderedNewMaterialIds']], decision='KEEP: whole navigation purpose and bounded child-union metadata', reason=rationales[r['phase']], noNewWholeMaterialScience=True, noNewOrdinarySourceClaim=True))
assert sum(len(r['orderedNewMaterialIds']) for r in nav) == 33

def entries(obj):
    if isinstance(obj, dict):
        if obj.get('kind') in ('goalEntry', 'canonicalSubtree'):
            yield obj
        for v in obj.values():
            yield from entries(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from entries(v)

views = {}
view_checks = []
physical_inputs = [digest(before_path), digest(after_path), digest(materials_path), digest(nav_path), digest(A/'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json')]
for r in I['viewRows']:
    bpath, apath = bound(r['before']), bound(r['candidate'])
    bv, av = read(bpath), read(apath)
    active = ROOT/r['activePath']
    assert active.read_bytes() == bpath.read_bytes(), r['activePath']
    assert {k:v for k,v in bv.items() if k not in ('viewId','rootNodes')} == {k:v for k,v in av.items() if k not in ('viewId','rootNodes')}
    assert len(bv['rootNodes']) == len(av['rootNodes'])
    oldchildren=[]; newchildren=[]
    for br, ar in zip(bv['rootNodes'], av['rootNodes']):
        assert {k:v for k,v in br.items() if k!='children'} == {k:v for k,v in ar.items() if k!='children'}
        assert ar['children'][:len(br['children'])] == br['children']
        oldchildren += br['children']; newchildren += ar['children'][len(br['children']):]
    newrefs=list(entries(newchildren))
    assert len(newrefs) == r['newReferenceCount']
    assert [e['goalId'] for e in newrefs] == r['newMaterialIds']
    assert all(e['kind']=='goalEntry' and e.get('projectionRole','target')=='target' and e['goalId'] in I['newMaterialIds'] for e in newrefs)
    assert r['newOrdinarySupportMemoryPOnlyRefs']==0
    views[r['activePath']] = (bv,av)
    physical_inputs.extend([digest(bpath),digest(apath),digest(active)])
    view_checks.append(dict(activePath=r['activePath'], before=digest(bpath), after=digest(apath), wholeAppendedPracticeStructureAndRefs=newchildren, actualAppendedPracticeTargetRefs=newrefs, existingWholeRootChildrenExact=True, ordinarySupportMemoryRoleChanges=0))
assert len(views)==35 and sum(r['newReferenceCount'] for r in I['viewRows'])==359

exception_rows=[]
for r in I['actual16RootAuthorisedPracticeTargetsOverExistingPOnly']:
    bv,av=views[r['viewPath']]
    covered=r['coveredGoalIds']; direct=[e for e in entries(bv) if e.get('goalId') in covered]
    national='/de-de-' in r['viewPath']
    if not national:
        assert len(direct)==len(covered) and all(e.get('projectionRole')=='prerequisiteOnly' for e in direct)
    assert r['actualCountryEligible'] and r['actualCourseEligible'] and r['actualWholeClosureEligible']
    assert r['actualMissingPrerequisiteIds']==[] and r['allCoveredExistingPrerequisiteOnly'] and not r['allCoveredOrdinaryTargets']
    assert all(e in list(entries(av)) for e in direct)
    mat=am[r['materialId']]
    assert mat['requires']==covered==mat['examData']['coveredGoalIds']
    assert r['courseProfile'] in mat['tags']
    exception_rows.append(dict(actualNativeAuthorContext=r, existingRawDirectRoleEntries=direct, wholeExistingContract=[bm[q] for q in covered], unchangedWholePracticeMaterial=mat,
        decision='KEEP: independent practice access over existing support; no ordinary source target promotion',
        reason=('This national pool is evaluated per jurisdiction; its raw national target role is not a claim that the goal is compulsory in every Land. The unchanged author native context identifies this goal as support-only for the specified jurisdiction. No ordinary-role entry changes.' if national else 'The existing specific direct prerequisiteOnly entry retains ordinary progress/completion exclusion. Only the separate independently qualified assessment is appended as a practice target; its required competence and mandatory support must already be available.'),
        additionalOrdinaryTargets=0, additionalSupportRefs=0, noNewOriginalCurriculumClaim=True))
assert len(exception_rows)==16
assert sum('/de-de-' in r['actualNativeAuthorContext']['viewPath'] for r in exception_rows)==8

status_artifact=write('actual-thirtythree-whole-qualified-body-status-only-literal-bindings.independent.json',status_rows)
nav_artifact=write('actual-five-whole-nav-individual-purpose-decisions-and-exact-field-deltas.independent.json',nav_rows)
view_artifact=write('actual35-authored-view-purpose-and359-practice-only-append-boundaries.independent.json',view_checks)
exception_artifact=write('actual16-existing-support-contexts-eight-country-eight-national-semantic-decisions.independent.json',exception_rows)

# Preserve both real whole frames locally; copies are evidence only, never active replacements.
for name, p in [('whole-current645-independent-endguard.exact.json', before_path), ('whole-current678-reviewed-nav-status-only.INERT-author-input.exact.json', after_path), ('whole-five-current678-reviewed-Nav-input.exact.json',nav_path)]:
    out=O/name
    if out.exists():
        assert out.read_bytes() == p.read_bytes()
    else:
        out.write_bytes(p.read_bytes())

active_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert active_path.read_bytes()==before_path.read_bytes()
ops_end=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-fourteen-operations-whole-science-independent-merge-audit-v1/actual-original597-history-and-real-current645-v16-whole336-P685-endguards.independent.json')
current_review_guards=[]; profiles={}
for r in ops_end['actualCurrent43ConfigsAndWholePReviews']:
    cp,rp=bound(r['config']),bound(r['wholeReview'])
    current_review_guards.append(dict(config=digest(cp),wholeReview=digest(rp)))
    for line in rp.read_text().splitlines():
        rec=json.loads(line)
        if rec['goalId'] in profiles:
            assert profiles[rec['goalId']]==rec
        profiles[rec['goalId']]=rec
assert len(profiles)==336 and sum(len(r['profile']['applicationCaseBriefs']) for r in profiles.values())==685
assert all(bm[g]==am[g] for g in profiles)
sem_path=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current645-company-finance-consumer-labour48-20261010-v16/wirtschaftswissenschaften.semantic-kinds.json'
assert digest(sem_path)['sha256']==ops_end['actualCurrentV16SEM']['sha256']
registry_path=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
assert registry_path.read_bytes()==(A/'whole-current645-central-registry.readonly.json').read_bytes()
semantic=read(sem_path)
memory=[g for g in bm.values() if g['id'] in {r.get('goalId') for r in semantic.get('records',[]) if r.get('semanticKind')=='memorization'}]
endguard=write('actual-current645-v16-336-whole-goals-P68543configs-and35-activeviews-exact-endguard.independent.json',dict(
    actualCurrentCAN=digest(active_path), actualCurrentSEM=digest(sem_path), actualCurrentRegistry=digest(registry_path),
    actual645OldNonNavGoalsExact=640, actual336OrdinaryObjectsWholeExact=True, actual336Profiles685OriginalCasesWholeExact=True,
    actual43OriginalConfigAndReviewGuards=current_review_guards, actual35ActiveViewsExact=True,
    noGoalSourceRequiresMemoryImageOrReviewWrites=True, activeWrites=0, strictNet=0))
manifest=write('actual-current678-nav-status-purpose-independent-portable-input-manifest.json',dict(
    immutableInputs=physical_inputs+source_input_guards,
    artifacts=[status_artifact,nav_artifact,view_artifact,exception_artifact,endguard],
    authority='Independent literal status, whole navigation purpose and practice-role semantics only; Root owns full fresh compiler, source, 64-scope matrix, and genuine runtime negative evidence',
    newWholeScientificBodyReviews=0, activeWrites=0, strictNet=0))
print(json.dumps(dict(outputFolder=relative(O), artifacts=[status_artifact,nav_artifact,view_artifact,exception_artifact,endguard,manifest], nav=5, status=33, countryRefs=359, exceptionContexts=16),ensure_ascii=False))
