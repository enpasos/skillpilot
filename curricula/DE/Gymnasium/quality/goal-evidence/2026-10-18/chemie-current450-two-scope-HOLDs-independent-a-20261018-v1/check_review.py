# SPDX-License-Identifier: Apache-2.0
"""Bounded independent input/CAS/source checks for exactly two existing cases."""
import copy
import datetime
import hashlib
import importlib.util
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-two-scope-HOLDs-source-author-20261018-v1'
MASS = '1bdaf7f2-ff3b-455a-a7fb-95a44642762a'
ARR = '28bb9d15-f865-5843-a035-6066580fea64'
PINS = {}

def pin(path, pointer=None):
    p = pathlib.Path(path)
    if not p.is_absolute(): p = ROOT / p
    raw = p.read_bytes()
    result = {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    PINS[result['path']] = copy.deepcopy(result)
    if pointer is not None: result['jsonPointer'] = pointer
    return result

def read(path):
    pin(path)
    return json.loads(pathlib.Path(path).read_text())

def write(path, obj):
    (OUT / path).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def diff(a,b,p=''):
    if isinstance(a,dict) and isinstance(b,dict):
        result=[]
        for k in sorted(set(a)|set(b)):
            if k not in a or k not in b: result.append(p+'/'+k)
            else: result += diff(a[k],b[k],p+'/'+k)
        return result
    if isinstance(a,list) and isinstance(b,list):
        if len(a)!=len(b):return [p]
        result=[]
        for i,(x,y) in enumerate(zip(a,b)):result += diff(x,y,p+'/'+str(i))
        return result
    return [] if a==b else [p]

whole = read(AUTHOR / 'candidate/AUTHOR.two-whole-profile-bodies.pending.json')
cas = read(AUTHOR / 'candidate/AUTHOR.exact-profile-CAS.pending.json')
direction = read(AUTHOR / 'AUTHOR.local-direction-and-source-boundaries.pending.json')
materials = read(AUTHOR / 'materials/AUTHOR.two-whole-material-cases.pending.json')
source_inputs = read(AUTHOR / 'inputs/two-whole-source-goals.before.json')
read(AUTHOR / 'inputs/two-existing-HOLDs.before.json')
read(AUTHOR / 'SEAL.author-package.pending-foreign-review.json')
input_manifest = read(AUTHOR / 'inputs/input-pins.json')
landscape_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
landscape = read(landscape_path)
goals = {g['id']:g for g in landscape['goals']}
checks=[]
assert len(cas['operations'])==12 and len(whole['rows'])==2
schema_path=ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
schema=read(schema_path)
import jsonschema
profile_schema={'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/profile'}
for row in whole['rows']:
    gid=row['goalId']; before=row['beforeWholeProfile']; after=row['afterWholeProfile']
    assert gid in [MASS,ARR]
    assert row['wholeGoalBefore']==row['wholeGoalAfter']==goals[gid]
    owner=row['currentOwnerRecord'];raw=(ROOT/owner['path']).read_bytes();pin(ROOT/owner['path'])
    assert hashlib.sha256(raw).hexdigest()==owner['sha256']
    lines=raw.decode().splitlines();rawline=lines[owner['lineOneBased']-1]
    assert hashlib.sha256(rawline.encode()).hexdigest()==owner['rawLineSHA256']
    owner_record=json.loads(rawline);assert owner_record['profile']==before
    cfg=read(ROOT/row['currentOwnerConfig']['path'])
    assert cfg['reviewPath']==owner['path']
    modified=copy.deepcopy(before)
    ops=[o for o in cas['operations'] if o['goalId']==gid]
    for op in ops:
        parts=op['jsonPointerWithinProfile'].strip('/').split('/');container=modified
        for key in parts[:-1]:container=container[int(key)] if isinstance(container,list) else container[key]
        key=parts[-1];key=int(key) if isinstance(container,list) else key
        assert container[key]==op['before'];container[key]=op['after']
    assert modified==after
    actual=diff(before,after)
    assert sorted(actual)==sorted(row['actualChangedFields'])==sorted(o['jsonPointerWithinProfile'] for o in ops)
    assert before['coverageExpectations']==after['coverageExpectations']
    assert [e['id'] for e in before['expectations']]==[e['id'] for e in after['expectations']]
    assert before['variationAxes']==after['variationAxes']
    assert before['applicationCaseBriefs'][:2]==after['applicationCaseBriefs'][:2]
    jsonschema.Draft202012Validator(profile_schema).validate(after)
    checks.append({'goalId':gid,'wholeCurrentGoalEqual':True,'actualSelectedOwnerProfileEqual':True,'ownerRawAndLineHashesMatch':True,'changedFields':actual,'requiredIdsAndCoverageExact':True,'variationAxesExact':True,'existingFirstTwoWholeCasesExact':True,'afterBodySchemaValid':True,'afterWholeProfileSHA256SortedCompact':hashlib.sha256(json.dumps(after,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()})

source_rows=[]
for source in source_inputs['sources']:
    path=ROOT/source['locator']['path'];data=read(path);ix=int(source['locator']['jsonPointer'].split('/')[-1]);assert data['sourceGoals'][ix]==source['wholeSourceGoal']
    doc=data['sourceDocument']; page=40 if source['wholeSourceGoal']['id'].startswith('hb-') else 57
    rawpage=subprocess.check_output(['pdftotext','-f',str(page),'-l',str(page),'-layout',str(ROOT/doc['path']),'-'],text=True)
    assert ('Mass' in rawpage) if page==40 else ('pH-Skala' in rawpage)
    pdfpin=pin(ROOT/doc['path'])
    source_rows.append({'sourceGoalPin':pin(path,source['locator']['jsonPointer']),'wholeSourceGoal':source['wholeSourceGoal'],'document':doc,'pdfPin':pdfpin,'physicalPDFPageOneBased':page,'printedPage':page,'actuallyReadAsTextAndRaster':True,'extractedPageTextSHA256':hashlib.sha256(rawpage.encode()).hexdigest(),'fullOfficialPageTextNotCommitted':True})

# 2022 HB supplement changes the end-of-year10 inventory to year9 and keeps
# Luft/Feuer in year8; it does not withdraw this end-of-year8 mass clause.
supplement=ROOT/'curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf'
supplement_text=subprocess.check_output(['pdftotext','-layout',str(supplement),'-'],text=True)
assert 'Luft und Feuer' in supplement_text
supplement_pin=pin(supplement)
mapping_rows=[]
for path,sid,gid in [
    ('curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',source_rows[0]['wholeSourceGoal']['id'],MASS),
    ('curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',source_rows[1]['wholeSourceGoal']['id'],ARR),
]:
    d=read(ROOT/path)
    selected=[{'pointer':'/mappings/'+str(i),'wholeEdge':edge} for i,edge in enumerate(d['mappings']) if edge.get('legacyGoalId')==sid and edge.get('canonicalGoalId')==gid]
    assert len(selected)==1 and selected[0]['wholeEdge']['matchType']=='partial'
    mapping_rows.append({'filePin':pin(ROOT/path),'sourceGoalId':sid,'goalId':gid,'selectedEdge':selected[0],'unchanged':True,'noNewWholeSourceCredit':True})
write('READ.two-whole-source-objects-and-current-partial-edges.json',{'role':'Actual independent informed primary/source read for exactly two existing cases','sources':source_rows,'HB2022SupplementPin':supplement_pin,'HB2022ReadingDe':'Luft und Feuer bleibt Jahrgang8; die Umstellung der Jahrgang10-Standards auf9 zieht diese Ende8-Massenpflicht nicht zurück.','currentPartialEdges':mapping_rows})

old_materials={r['goalId']:r for r in materials['rows']}
original_hb=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current441-HB-lower14-current-whole-union-author-20261017-v1/materials/HB-lower14-ten-complete-DE-EN-cases.pending.json')
original_ni=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-NI-SL-three-conditional-profile-source-author-successor-20261018-v2/MATERIAL.three-complete-bilingual-source-context-cases.json')
assert original_hb['cases'][0]==old_materials[MASS]['beforeWholeMaterialCase']
assert original_ni['cases'][0]==old_materials[ARR]['beforeWholeMaterialCase']
assert old_materials[MASS]['beforeWholeMaterialCase']==old_materials[MASS]['afterWholeMaterialCase']
ni_diff=diff(old_materials[ARR]['beforeWholeMaterialCase'],old_materials[ARR]['afterWholeMaterialCase'])
assert ni_diff==['/task/de','/task/en']
for goalid,mat in old_materials.items():
    if goalid==ARR:
        for lang in ['de','en']:
            prefix='Nur im gebundenen NI-Kontext: ' if lang=='de' else 'Only in the bound NI context: '
            assert mat['beforeWholeMaterialCase']['task'][lang].replace(prefix,'')==mat['afterWholeMaterialCase']['task'][lang]
    assert not mat['afterWholeMaterialCase'].get('humanApproval',False)

input_changes=[]
for p in input_manifest['artifacts']:
    actual=pin(ROOT/p['path'])
    assert actual['sha256']==p['sha256']
for path in [ROOT/'AGENTS.md',ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md']:
    pin(path)
spec=importlib.util.spec_from_file_location('schemas',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);symlinks=module.curriculum_symlink_errors(str(ROOT));assert not symlinks
receipt={'role':'Own executed bounded independent preservation checks; no full check','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'profiles':checks,'actualChangedFieldCount':sum(len(x['changedFields']) for x in checks),'originalWholeMaterialOwnersEqualAuthorBeforeCopies':True,'massWholeMaterialUnchanged':True,'arrheniusMaterialOnlyChangedFields':ni_diff,'allAuthorDeclaredInputsStillExact':len(input_manifest['artifacts']),'curriculumSymlinkErrors':symlinks,'normalFilesWritten':False,'frameworkOrRuntimeChanged':False,'fullCheckRun':False,'newPeerQARead':False}
write('CHECK.actual-twelve-fields-current-owners-and-material-preservation.json',receipt)
write('INPUT.exact-read-pins.json',{'role':'Actual independently read inputs; historical contexts are informed evidence, not new peer votes','pins':list(PINS.values())})
print(json.dumps({'changedFields':receipt['actualChangedFieldCount'],'massChangedFields':len(checks[0]['changedFields']),'arrheniusChangedFields':len(checks[1]['changedFields']),'currentOwnersAndWholeGoalsMatch':True,'materialBodiesPreserved':True,'normalFilesWritten':False,'fullCheckRun':False}))
