#!/usr/bin/env python3
"""Inert author of exactly supported accesses for two already reviewed bodies."""
import copy
import datetime
import hashlib
import json
import pathlib

PACKAGE=pathlib.Path(__file__).resolve().parent
ROOT=PACKAGE.parents[6]
INPUTS=PACKAGE/'inputs'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def bound(path):return {'path':str(path.relative_to(ROOT)),'sha256':sha(path),'bytes':path.stat().st_size}
def write(name,data):
    p=PACKAGE/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return p
current_path=INPUTS/'whole-current-CAN494-actual8965-before-two-view-access.json'
current=json.loads(current_path.read_text());goals={g['id']:g for g in current['goals']}
assert sha(current_path)=='8965eb674957a866c78a3213872ccf97b9a145b8985534f0e3306740311ba65d'
intake_path=PACKAGE/'actual-current34-views64-scopes-and-two-whole-material-native-intake.json'
intake=json.loads(intake_path.read_text())
independent_source=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-two-whole-terminals-material-independent-a-v1/actual-whole-bilingual-bookkeeping-P6-13-transactions-rubric-and-F80-bounded-material-scientific-KEEP.independent-a.json'
science_copy=INPUTS/'whole-prior-two-material-independent-A-scientific-KEEP.input.json'
science_copy.write_bytes(independent_source.read_bytes())
assert sha(science_copy)=='fdf0e7a4ff1020f75a3c8da106f6984371050eaf17702924b573f732f04fcafa'
material_ids={'f80d7cbb-e03c-5613-a4b6-8a1bad485385','73c49b24-e928-54f4-b4d3-93347d532e5b'}
write('inputs/whole-two-current-released-materials.body-and-role-input.json',{'canonical':bound(current_path),'wholeMaterials':[goals[gid]for gid in sorted(material_ids)],'reviewReuse':'Existing independent whole scientific KEEP is reused because task/solution/scoring bodies and exact assessed performances remain unchanged. Current released machine status is not human release.'})
def flatten(nodes):
    for node in nodes:
        yield node
        if node['kind']=='structure':yield from flatten(node.get('children',[]))
def find_container(view):
    structures=[n for n in flatten(view['rootNodes'])if n['kind']=='structure']
    canonical=[n for n in structures if '5317d078-413b-58bb-9262-d57387d51655' in n['id']]
    if canonical:return canonical[0]
    supported=[n for n in structures if n['id'].endswith('explicit-supported-practice-v2')]
    assert len(supported)==1,'An existing actual material folder is required; no guessed phase/category node.'
    return supported[0]
rows=[]
all_views=[]
for before_path in sorted((INPUTS/'active35-before-views').glob('*.view.json')):
    original=json.loads(before_path.read_text());candidate=copy.deepcopy(original)
    applicable=[p for p in intake['projections']if p['viewFile']==before_path.name and p['scope'].get('jurisdiction')]
    candidates=[m for p in applicable for m in p['materials']if m['wholeMaterialEligible']and not m['currentMaterialVisibleAsTarget']]
    if candidates:
        assert len(applicable)==1
        container=find_container(candidate)
        added=[]
        for m in candidates:
            gid=m['materialGoalId'];assert gid in material_ids
            assert not any(n.get('goalId')==gid for n in flatten(candidate['rootNodes']))
            ref={'kind':'goalEntry','goalId':gid,'displayLabel':goals[gid]['title'],'projectionRole':'target'}
            container['children'].append(ref);added.append({'goalId':gid,'wholeAddedReference':ref,'containerId':container['id'],'wholeCurrentNativeScopeFinding':m})
        # Removing only the two added goalEntry objects must recover the whole original view.
        restored=copy.deepcopy(candidate)
        rc=next(n for n in flatten(restored['rootNodes'])if n.get('id')==container['id'])
        rc['children']=[n for n in rc['children']if n.get('goalId')not in {a['goalId']for a in added}]
        assert restored==original
        after_path=write('candidate35-views/'+before_path.name,candidate)
        rows.append({'activePath':'curricula/DE/Gymnasium/composition-views/wirtschaft/'+before_path.name,'beforeWholeView':bound(before_path),'candidateWholeView':bound(after_path),'scope':original['scope'],'addedMaterialReferences':added,'onlyTheseExistingMaterialGoalEntriesAdded':True,'allPriorOrdinaryTargetAndPrerequisiteOnlyRoleObjectsExact':True,'allPrior77MaterialReferencesExact':True,'noScopeMetadataOrSelectorOrCanonicalChange':True})
    else:
        after_path=PACKAGE/'candidate35-views'/before_path.name;after_path.parent.mkdir(exist_ok=True);after_path.write_bytes(before_path.read_bytes())
    all_views.append({'before':bound(before_path),'candidate':bound(after_path),'wholeUnchanged':before_path.read_bytes()==after_path.read_bytes()})
assert len(rows)==18 and sum(len(x['addedMaterialReferences'])for x in rows)==23
assert sum(x['wholeUnchanged']for x in all_views)==17
assert all(not x['scope'].get('jurisdiction')is None for x in rows)
write('eighteen-actual-country-course-views-twenty-three-whole-material-access-entries.author-index.json',{'role':'BOUNDED_VIEW_AUTHOR_ONLY_CURRENT_EXACT_SCOPE','status':'CANDIDATE_PENDING_INDEPENDENT_SCOPE_REVIEW','authoredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeCurrentCAN494':bound(current_path),'independentExistingWholeMaterialReview':bound(science_copy),'actualBoundNativeFullScopeIntake':bound(intake_path),'currentCANAndAllMaterialBodiesEdited':False,'current35ViewBeforeAndAfterBindings':all_views,'eighteenViewDeltas':rows,'actualAddedReferenceCount':23,'twoMaterialGoalIds':sorted(material_ids),'f80Scope':'GK in BB/BW/BY/HB/HE/MV/NW/RP/SH/SL/SN/ST/TH; existing LK access retained. No new access in BE/HH/NI.','bookScope':'GK+LK in BB/BW/BY/HE/TH only.','nationalViewFilesNeedZeroEdits':True,'nationalExplanation':'Both materials already occur under the existing canonical 5317 subtree. Exact matching country authority controls their national jurisdiction-resolved target scopes. Only actual country access is authored; no ordinary target or prerequisiteOnly support is imported.','newMaterialScientificReviews':0,'newOrdinaryScientificClosures':0,'strictFiveGateGain':0,'remainingWholeCourseRouteFailuresAndAPV15DebtOpen':True,'humanReviewApprovalOrTrialClaim':False,'activeProductionEdits':0})
print(json.dumps({'changedCountryViews':len(rows),'addedRealWholeMaterialEntries':sum(len(x['addedMaterialReferences'])for x in rows),'unchangedWholeViews':17,'indexSha256':sha(PACKAGE/'eighteen-actual-country-course-views-twenty-three-whole-material-access-entries.author-index.json')}))
