# SPDX-License-Identifier: Apache-2.0
"""Bounded actual-source, body and CAS checks; write this review directory only."""
import copy, datetime, hashlib, json, pathlib, subprocess
import jsonschema

ROOT=pathlib.Path(__file__).resolve().parents[7]
OUT=pathlib.Path(__file__).resolve().parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-carboxylic-atomicity-source-author-20261018-v1'
STRUCT='a3788e40-b540-5bed-be37-b33053528422'
OBS='dc146a38-994d-58ec-b6a0-5210118b93ae'
PRACT='3de28598-672f-5753-8a45-8f559c2f9dc2'
PAPER='00139854-e5a7-5c12-ab50-2268c80bf776'
PINS={}

def pin(p,pointer=None):
    p=pathlib.Path(p)
    if not p.is_absolute():p=ROOT/p
    raw=p.read_bytes();o={'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)};PINS[o['path']]=copy.deepcopy(o)
    if pointer is not None:o['jsonPointer']=pointer
    return o
def read(p):
    p=pathlib.Path(p)
    if not p.is_absolute():p=ROOT/p
    pin(p);return json.loads(p.read_text())
def write(name,o):(OUT/name).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
def at(o,ptr):
    for k in ptr.strip('/').split('/'):
        if k:o=o[int(k)] if isinstance(o,list) else o[k]
    return o
def put(o,ptr,value):
    parts=ptr.strip('/').split('/');parent=o
    for k in parts[:-1]:parent=parent[int(k)] if isinstance(parent,list) else parent[k]
    key=int(parts[-1]) if isinstance(parent,list) else parts[-1];parent[key]=copy.deepcopy(value)
def semantic_sha(value):return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def changes(a,b,p=''):
    if type(a)!=type(b):return [p]
    if isinstance(a,dict):
        result=[]
        for k in sorted(set(a)|set(b)):
            result.extend([p+'/'+k] if k not in a or k not in b else changes(a[k],b[k],p+'/'+k))
        return result
    if isinstance(a,list):
        if len(a)!=len(b):return [p]
        result=[]
        for i,(x,y) in enumerate(zip(a,b)):result+=changes(x,y,p+'/'+str(i))
        return result
    return [] if a==b else [p]

ls_path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
ls=read(ls_path);goals={g['id']:g for g in ls['goals']}
whole=read(AUTHOR/'candidates/whole-goals.before-after.pending.json')
profiles=read(AUTHOR/'candidates/whole-profiles.before-after.pending.json')
source=read(AUTHOR/'inputs/current-direct68-source-components-and-whole-mapping-objects.json')
view_ops=read(AUTHOR/'operations/composition-explicit-role.exact-CAS.pending.json')
map_ops=read(AUTHOR/'operations/direct-mapping-and-decision.exact-CAS.pending.json')
canonical_ops=read(AUTHOR/'operations/canonical.exact-CAS.pending.json')
material=read(AUTHOR/'materials/carboxyl-supplied-observations.DE-EN.pending.json')
read(AUTHOR/'candidates/material-bindings.pending.json')
read(AUTHOR/'AUTHOR.decision-and-boundaries.json')
read(AUTHOR/'README.md') if False else pin(AUTHOR/'README.md')
pin(AUTHOR/'SEAL.author-source-atomicity-candidate.pending-independent-review.json')
assert len(whole['records'])==10 and len(source['records'])==68
candidate=copy.deepcopy(ls);cm={g['id']:g for g in candidate['goals']};goal_rows=[]
for row in whole['records']:
    gid=row['goalId']
    if row['before'] is None:
        assert gid not in goals;candidate['goals'].append(copy.deepcopy(row['after']))
    else:
        assert goals[gid]==row['before'];ix=next(i for i,g in enumerate(candidate['goals']) if g['id']==gid);candidate['goals'][ix]=copy.deepcopy(row['after'])
    goal_rows.append({'goalId':gid,'wholeBeforeMatchesCurrent':row['before'] is None or row['before']==goals[gid],'changedFields':changes(row['before'],row['after'])})
cm={g['id']:g for g in candidate['goals']}
assert cm[PRACT]['description']==goals[PRACT]['description'] and cm[PRACT]['descriptionEn']==goals[PRACT]['descriptionEn']
assert changes(goals[PRACT],cm[PRACT])==['/requires']
paper_fields=['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring']
assert all(goals[PAPER]['examData'][k]==cm[PAPER]['examData'][k] for k in paper_fields)
schema=read('docs/landscape-runtime.schema.json');jsonschema.Draft202012Validator(schema).validate(candidate)
ps=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
for p in profiles['after']:jsonschema.Draft202012Validator({'$schema':ps['$schema'],'$defs':ps['$defs'],'$ref':'#/$defs/profile'}).validate(p['profile'])
p_input=read(AUTHOR/'inputs/current-whole-positive-profile.json')
assert profiles['before']['profile']==p_input['record']['profile']
owner_raw=(ROOT/p_input['reviewFile']['path']).read_bytes();pin(p_input['reviewFile']['path'])
assert hashlib.sha256(owner_raw).hexdigest()==p_input['reviewFile']['sha256']
assert json.loads(owner_raw.decode().splitlines()[p_input['line']-1])==p_input['record']

# CAS guards all refer to the exact pinned original input. Preflight the batch
# before applying the approved-shape proposal to an in-memory copy.
canonical_from_ops=copy.deepcopy(ls)
for op in canonical_ops['operations']:
    assert pin(op['targetPath'])['sha256']==op['targetFileSHA256']
    if op['operation']=='replace_exact_value':assert at(ls,op['jsonPointer'])==op['before']
    else:
        assert op['operation']=='append_if_exact_length_and_id_absent'
        assert len(at(ls,op['jsonPointer']))==op['beforeLength'] and all(g['id']!=op['absentGoalId'] for g in ls['goals'])
for op in canonical_ops['operations']:
    if op['operation']=='replace_exact_value':put(canonical_from_ops,op['jsonPointer'],op['after'])
    else:at(canonical_from_ops,op['jsonPointer']).append(copy.deepcopy(op['afterAppend']))
assert canonical_from_ops==candidate

cfg=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
actual=[]
for path in cfg['mappingPaths']:
    data=read(path)
    actual += [(path,'/mappings/'+str(i),e['legacyGoalId']) for i,e in enumerate(data.get('mappings',[])) if e.get('canonicalGoalId')==STRUCT]
assert set(actual)=={(r['mappingFile'],r['mappingPointer'],r['mappingBefore']['legacyGoalId']) for r in source['records']}
source_rows=[]
for i,row in enumerate(source['records']):
    m=read(row['mappingFile']);s=read(row['sourceFile'])
    assert pin(row['mappingFile'])['sha256']==row['mappingFilePin']['sha256']
    assert pin(row['sourceFile'])['sha256']==row['sourceFilePin']['sha256']
    assert at(m,row['mappingPointer'])==row['mappingBefore']
    assert at(m,row['decisionPointer'])==row['decisionBefore']
    assert at(s,row['sourcePointer'])==row['sourceGoal']
    siblings=[x for x in m['mappings'] if x['legacyGoalId']==row['mappingBefore']['legacyGoalId']]
    assert siblings==row['allCurrentDirectSiblingMappings']
    source_rows.append({'rowIndex':i,'sourceGoalId':row['sourceGoal']['id'],'sourceText':row['sourceGoal']['sourceText'],'courseLevel':row['sourceGoal'].get('courseLevel'),'sourcePin':pin(row['sourceFile'],row['sourcePointer']),'mappingPin':pin(row['mappingFile'],row['mappingPointer']),'wholeCurrentSourceAndMappingAndDecisionEqual':True,'existingKind':row['mappingBefore']['matchType'],'newObservationContributionProposed':row['addObservationContribution'],'explicitPracticalDutyKept':row['practicalDutyNotReplaced'],'currentSiblingCarrierIds':[x['canonicalGoalId'] for x in siblings]})
assert sum(r['newObservationContributionProposed'] for r in source_rows)==9
assert sum(r['explicitPracticalDutyKept'] for r in source_rows)==4
for row in map_ops['changedExistingMappingEntries']:
    assert at(read(row['path']),row['jsonPointer'])==row['before']
for row in map_ops['wholeDecisionBeforeAfter']:
    assert at(read(row['path']),row['jsonPointer'])==row['before']
    assert all(g in row['after']['canonicalGoalIds'] for g in row['before']['canonicalGoalIds'])
map_before={op['path']:read(op['path']) for op in map_ops['operations']};map_after=copy.deepcopy(map_before)
for op in map_ops['operations']:
    assert pin(op['path'])['sha256']==op['fileSHA256']
    if op['operation']=='replace_exact_value':assert at(map_before[op['path']],op['jsonPointer'])==op['before']
    else:
        assert op['operation']=='append_if_array_semantic_sha256_matches'
        array=at(map_before[op['path']],op['jsonPointer']);assert len(array)==op['beforeLength'] and semantic_sha(array)==op['beforeArraySemanticSHA256']
for op in map_ops['operations']:
    if op['operation']=='replace_exact_value':put(map_after[op['path']],op['jsonPointer'],op['after'])
    else:at(map_after[op['path']],op['jsonPointer']).extend(copy.deepcopy(op['afterAppend']))
for row in source['records']:
    old=row['mappingBefore'];now=at(map_after.get(row['mappingFile'],read(row['mappingFile'])),row['mappingPointer'])
    assert now==old or (old['matchType']=='exact' and now==dict(old,matchType='partial') and row['sourcePointer']=='/sourceGoals/61')
assert sum(len(d['mappings'])-len(map_before[path]['mappings']) for path,d in map_after.items())==9

strows=[r for r in source['records'] if r['addObservationContribution'] and 'Kommunikationskompetenz' in r['sourceGoal']['sourceText']]
assert len(strows)==3
all_carriers=set(g['canonicalGoalId'] for row in strows for g in row['allCurrentDirectSiblingMappings'])
registry=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
chem=next(x for x in registry['subjects'] if x['label']=='Chemie')
selected=[]
for config_path in chem['positiveEvidenceConfigPaths']:
    config=json.loads((ROOT/config_path).read_text())
    selected_ids=all_carriers & set(config.get('scope',{}).get('goalIds',[]))
    if not selected_ids:continue
    pin(config_path);rp=config['reviewPath'];pin(rp)
    for i,line in enumerate((ROOT/rp).read_text().splitlines()):
        rec=json.loads(line)
        if rec.get('goalId') in selected_ids:
            selected.append({'goalId':rec['goalId'],'configPin':pin(config_path),'recordPin':pin(rp),'lineOneBased':i+1,'wholeGoal':goals[rec['goalId']],'wholeSelectedPRecord':rec,'candidateWholeGoal':cm[rec['goalId']]})
missing_p=all_carriers-set(x['goalId'] for x in selected)
assert all(goals[gid].get('contains') and goals[gid].get('type')=='cluster' for gid in missing_p)
for gid in sorted(missing_p):
    selected.append({'goalId':gid,'wholeGoal':goals[gid],'candidateWholeGoal':cm[gid],'wholeSelectedPRecord':None,'PApplicability':'cluster carrier; no ordinary atomic P profile is expected or invented'})
practical=next(x for x in selected if x['goalId']==PRACT)
assert practical['wholeSelectedPRecord']['profile']['coverageExpectations']['requiredExpectationIds']==['e1','e2','e3']
assert 'bilanz' in practical['wholeSelectedPRecord']['profile']['expectations'][1]['observablePerformanceDe']
assert 'reale kontrollierte Handlung' in practical['wholeSelectedPRecord']['profile']['expectations'][2]['essentialUnderstandingDe']
write('READ.three-ST-whole-current-unions-and-whole-selected-carrier-P.json',{'role':'Actual current complete unions and selected goal/P bodies; no new whole-union approval','STSourceRows':strows,'allOtherWholeCurrentCarriersAndSelectedProfiles':selected,'symbolicReactionDutyAlreadyAssessedBy':{'goalId':PRACT,'requiredExpectationId':'e2','acidEquation':'CH₃COOH + NaHCO₃ → CH₃COONa + CO₂ + H₂O','aldehydeEquation':'CH₃CH₂CHO + 2 Cu²⁺ + 5 OH⁻ → CH₃CH₂COO⁻ + Cu₂O + 3 H₂O','sourceStatus':'existing direct ST union carrier; candidate changes its prerequisite only'}})

primary=[]
for path,pages in [
    ('curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf',[39]),
    ('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf',[58]),
    ('curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf',[44,54,60]),
    ('curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2024.pdf',[55]),
]:
    for page in pages:
        text=subprocess.check_output(['pdftotext','-f',str(page),'-l',str(page),'-layout',str(ROOT/path),'-'],text=True)
        assert 'Carboxy' in text or 'Carboxy' in text.replace('\n','') or 'Carboxy' in text.replace('-\n','')
        primary.append({'pdfPin':pin(path),'physicalPDFPageOneBased':page,'extractedPageTextSHA256':hashlib.sha256(text.encode()).hexdigest(),'wholePageRawTextNotCommitted':True,'actualPrimaryRead':True})
write('READ.actual-primary-pages-and-68-current-rows.json',{'role':'Actual independent source read; all68 source objects checked; selected changed-duty primary pages reread','rows':source_rows,'primaryPages':primary,'newSourceFidelityApprovalForUnchangedBroadSourceUnions':False})

view_rows=[]
for row in view_ops['wholeViewBeforeAfter']:
    assert read(row['path'])==row['before']
    assert pin(row['path'])['sha256']==row['fileSHA256']
    op=next(x for x in view_ops['operations'] if x['path']==row['path'])
    assert at(row['before'],op['jsonPointer'])==op['before']
    assert at(row['after'],op['jsonPointer'])==op['after']
    old=next(x for x in op['before'] if x.get('goalId')==STRUCT)
    new=next(x for x in op['after'] if x.get('goalId')==OBS)
    assert old.get('projectionRole','target')==new.get('projectionRole','target')
    assert [x for x in op['after'] if x.get('goalId')!=OBS]==op['before']
    view_rows.append({'viewId':row['before']['viewId'],'scope':row['before']['scope'],'oldStructuralRole':old.get('projectionRole','target'),'newObservationRole':new.get('projectionRole','target'),'allOtherExactArrayEntriesPreserved':True})
assert len(view_rows)==33
write('CHECK.whole-body-source68-CAS33-and-unchanged-paper.actual.json',{'role':'Own executed bounded input/body checks, not full quality check','head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'goalRows':goal_rows,'candidateRuntimeSchemaValid':True,'bothAfterProfileBodiesSchemaValid':True,'selectedDirectMappingsEnumerated':len(actual),'sourceRowsCurrentWholeEqual':68,'newPartialContributionProposals':9,'retainedExplicitPracticalContexts':4,'wholeCurrentSTUnionCarrierCount':len(selected),'symbolicDutyExistsAtUnchanged3deeP':True,'wholePaperFieldsExact':paper_fields,'viewRows':view_rows,'oldParentArraysExactExceptNewSibling':True,'normalFilesWritten':False,'otherNewPeerQARead':False,'fullCheckRun':False})
write('INPUT.exact-independently-read-pins.json',{'pins':list(PINS.values())})
print(json.dumps({'sourceRows':68,'newPartialProposals':9,'STCommunicationRevisions':3,'viewCASRows':33,'wholeCurrentSTUnionCarriers':len(selected),'paperBodiesExact':True,'normalFilesWritten':False}))
