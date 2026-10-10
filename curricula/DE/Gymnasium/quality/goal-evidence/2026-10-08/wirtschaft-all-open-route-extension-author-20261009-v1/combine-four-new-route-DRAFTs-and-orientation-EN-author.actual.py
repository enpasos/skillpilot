import copy
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
INP = BASE / 'two-orientation-requires-bounded-sequence-successor-v4'
OUT = BASE / 'four-new-Generic-global-terminal-author-v5'
ENOUT = BASE / 'orientation-EN-only-author-successor-v6'
ENOUT.mkdir(exist_ok=True)
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, x):
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

before = read(INP/'whole-current300-plus-Generic11-and-nine-root-machine-released-terminals.inert.candidate.json')
after = copy.deepcopy(before)
new = read(OUT/'whole-four-new-terminal-DRAFT-assessments.author.candidate.json')
assert not set(g['id'] for g in new) & set(g['id'] for g in after['goals'])
after['goals'].extend(new)
by_id = {g['id']:g for g in after['goals']}
nav = by_id['5317d078-413b-58bb-9262-d57387d51655']
nav['contains'].extend(g['id'] for g in new)
nav['description'] = 'Bündelt neun eigenständige materialgestützte Übungsabschlüsse zu Anlagekriterien und Geldwert, Konjunkturpolitik, betrieblichen Investitionen und Kennzahlen, außenwirtschaftlichen Salden, Handelsabhängigkeiten und NGO-Beteiligung sowie Eigentumsordnung, Wechselkurseffekten, Finanzmarktakteuren und Medienanalyse. Die Navigation erhebt keinen zusätzlichen fachlichen Kompetenzanspruch.'
nav['descriptionEn'] = 'Groups nine independent material-based practice assessments in investment criteria and money value, business-cycle policy, business investment and ratios, external-account balances, trade dependence and NGO participation, property institutions, exchange-rate effects, financial-market participants and media analysis. This navigation asserts no additional subject competence.'
assert nav['requires'] == []
whole_name = 'whole-current300-plus-Generic11-and-thirteen-bounded-terminals.inert.candidate.json'
write(OUT/whole_name,after)

native_predecessor = read(INP/'actual-native-all-nine-before-after-global-local-graph-and-type.report.json')['results'][1]
role_rows = []
for course in ['GK','LK']:
    v = read(INP/('national-'+course+'.bounded-route-author.candidate.view.json'))
    local = next(x for x in native_predecessor['local'] if x['courseProfile']==course)
    actual_existing_included = set(local['actualTargetAtomicIds']) | set(local['actualPrerequisiteOnlyAtomicIds'])
    all_required = set()
    def visit(i):
        if i in all_required:
            return
        all_required.add(i)
        for dep in by_id[i].get('requires',[]):
            visit(dep)
    for g in new:
        for i in g['requires']:
            visit(i)
    missing = sorted(all_required - actual_existing_included)
    # Use the same existing declared top-level children list as the V3 supports.
    root = v['rootNodes'][0]
    for i in missing:
        root['children'].append({'kind':'goalEntry','goalId':i,'projectionRole':'prerequisiteOnly'})
    write(OUT/('national-'+course+'.bounded-route-author.candidate.view.json'),v)
    role_rows.append({'courseProfile':course,'beforeViewSha256':sha(INP/('national-'+course+'.bounded-route-author.candidate.view.json')),
                     'afterViewSha256':sha(OUT/('national-'+course+'.bounded-route-author.candidate.view.json')),
                     'allActualTransitivePrerequisitesOfTheFourNewAssessments':sorted(all_required),
                     'onlyMissingPrerequisitesAddedExplicitlyAsSupport':missing,
                     'noExistingProjectionRolesOrCanonicalTagsChanged':True,
                     'nationalCurricularAtomicTargetsAdded':[],'nationalCurricularAtomicTargetsRemoved':[],
                     'independentScopeApproval':False})
write(OUT/'actual-new-four-route-transitive-support-and-bounded-view-author.receipt.json',{
    'schemaVersion':1,'kind':'actual-author-derived-minimal-explicit-support-overlay','status':'inert_author_candidate',
    'qualityApproval':False,'newStrictClosures':0,'rows':role_rows,
    'meaning':'New supplementary practice assessments are targets in the existing national practice subtree. Exactly missing existing prerequisites are explicit prerequisiteOnly support. No pre-existing curricularAtomic target is added/removed; actual native set comparison remains required. This does not claim that optional WWG source content becomes compulsory nationally.',
    'inheritedLabelDeltaAgainstRoot300':'Both national views retain the existing author-predecessor f892 displayLabel change to BY: abgegrenzte Wirtschafts- und Rechtsübungen; this label is not falsely called whole-byte unchanged against Root300.'})

en_after = copy.deepcopy(after)
orientation = next(g for g in en_after['goals'] if g['id']=='6bf2d1cc-e745-50dd-a617-71c06a6c6945')
old_orientation = copy.deepcopy(orientation)
orientation['descriptionEn'] = 'The big-picture introduction shows opportunities that Wirtschaftswissenschaften opens up in everyday life, social participation, studies and careers, and positive perspectives on the following material. The learner chooses only what sparks their curiosity or whether they want to continue learning; subject-specific knowledge is neither assumed nor tested here.'
assert {k:v for k,v in old_orientation.items() if k!='descriptionEn'} == {k:v for k,v in orientation.items() if k!='descriptionEn'}
write(ENOUT/'whole-orientation-goal-before-and-EN-only-after.author.candidate.json',{'before':old_orientation,'after':orientation})
write(ENOUT/whole_name,en_after)
for course in ['GK','LK']:
    (ENOUT/('national-'+course+'.bounded-route-author.candidate.view.json')).write_bytes((OUT/('national-'+course+'.bounded-route-author.candidate.view.json')).read_bytes())
write(ENOUT/'actual-observed-orientation-EN-only-finding-and-whole-author-guard.receipt.json',{
    'schemaVersion':1,'kind':'observed-EN-orientation-inconsistency-bounded-author-successor',
    'findingBy':'independent root whole6bf reading','author':'economics_independent_continuation_a',
    'status':'inert_author_candidate','humanReviewStatus':'pending','qualityApproval':False,'newStrictClosures':0,'liveWrites':[],
    'oldCompetenceClaim':'English required explaining relevance and systematic competence growth despite authoritative orientation semantic kind and the strictly ungraded German description.',
    'minimalCorrection':'Only descriptionEn describes positive possibilities and interest/continuation choice without subject-specific prior knowledge or testing. German and every other whole-goal field remain exactly equal; no knowledge prerequisite, grading or assessed orientation is created.',
    'beforeWholeGoal':old_orientation,'afterWholeGoal':orientation,
    'canonicalBeforeSha256':sha(OUT/whole_name),'canonicalAfterSha256':sha(ENOUT/whole_name),
    'actualOwnerpageAndContextDeltaPending':True,
    'independentClosureRequired':'Root actual bilingual orientation review; actual final ownerpage/context comparison and proper binding of changed goal to the authoritative semantic ledger. Author writes/fingerprint refresh alone are not review.'})
print(json.dumps({'v5Whole':sha(OUT/whole_name),'v6Whole':sha(ENOUT/whole_name),'supportRows':role_rows},ensure_ascii=False))
