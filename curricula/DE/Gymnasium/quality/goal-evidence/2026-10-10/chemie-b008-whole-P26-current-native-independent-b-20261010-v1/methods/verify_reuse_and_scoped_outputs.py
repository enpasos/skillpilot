"""Technical binding/schema checks after the immutable actual blind FIRST."""
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import jsonschema

ROOT = Path(__file__).resolve().parents[1]
REPO = Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'

def ref(p):
    raw=p.read_bytes()
    return {'path':str(p.relative_to(REPO)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}

def write(p, obj):
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

def walk_refs(x, result):
    if isinstance(x,dict):
        if 'path' in x and 'sha256' in x:
            path=Path(x['path'])
            if not path.is_absolute(): path=REPO/path
            raw=path.read_bytes()
            expected=x['sha256'].removeprefix('sha256:')
            if hashlib.sha256(raw).hexdigest()!=expected or ('bytes' in x and len(raw)!=x['bytes']): result.append({'path':x['path'],'error':'hash or byte mismatch'})
        for y in x.values():walk_refs(y,result)
    elif isinstance(x,list):
        for y in x:walk_refs(y,result)

seal=json.loads((ROOT/'FIRST.actual-sealed-before-current-peer-or-author-outcomes.json').read_text())
seal_errors=[]
walk_refs(seal,seal_errors)
assert not seal_errors, seal_errors
assembly=json.loads((AUTHOR/'materials/whole26-current-operative-materials-and-profiles.exact-assembly.json').read_text())
materials={x['goalId']:x for x in assembly['entries']}
inputs=[]
for n in ['normal-b20','normal-b6']:
    inputs.extend(json.loads((ROOT/n/'description-review-input.json').read_text())['goals'])
normal_p={r['goalId']:r for filename in ['nineteen-normal-P-records.exact.jsonl','seven-normal-P-records.exact.jsonl'] for r in [json.loads(line) for line in (AUTHOR/'inputs'/filename).read_text().splitlines()]}
raster_pair=json.loads((AUTHOR/'inputs/whole26-genuine-current-raster-pair.exact.json').read_text())
rasters={x['goalId']:x for x in raster_pair['rows']}
current_rasters={x['goalId']:x for x in json.loads((AUTHOR/'assets/whole26-exact-current-raster-origin-and-binding-map.json').read_text())['rows']}
am_a=json.loads((AUTHOR/'inputs/whole25-genuine-AM-a.exact.json').read_text())
am_b=json.loads((AUTHOR/'inputs/whole25-genuine-AM-b.exact.json').read_text())
am_ar={x['goalId']:x for x in am_a['records']}
am_br={x['goalId']:x for x in am_b['all25GoalResults']}
one=REPO/am_b['literalExisting1fReuseInput']['path']
one_am=json.loads(one.read_text())
material_pairs=[AUTHOR/'inputs/whole19-genuine-material-pair.exact.json', AUTHOR/'inputs/whole7-genuine-material-pair.exact.json']
old_binding_errors=[]
for p in [*material_pairs, AUTHOR/'inputs/whole26-genuine-current-raster-pair.exact.json', AUTHOR/'inputs/whole25-genuine-AM-a.exact.json',AUTHOR/'inputs/whole25-genuine-AM-b.exact.json',one]:
    walk_refs(json.loads(p.read_text()),old_binding_errors)
historical_mutable_rule_drift=[x for x in old_binding_errors if x['path']=='AGENTS.md']
immutable_binding_errors=[x for x in old_binding_errors if x['path']!='AGENTS.md']
rows=[]
for g in inputs:
    goal=g['goalId'];m=materials[goal]
    original=m.get('wholeOriginalGoalBeforeResources',m.get('wholeUnchangedOriginalGoalBeforeResources'))
    text_same=(g['currentTitleDe']==original['title'] and g['currentTitleEn']==original['titleEn'] and g['currentDescriptionDe']==original['description'] and g['currentDescriptionEn']==original['descriptionEn'])
    profile_same=(m['wholePairedNormalV2Profile']==normal_p[goal]['profile']==g['reviewContext']['evidenceProfile']['profile'])
    old_raster=rasters[goal]['actualSelectedRaster']
    actual_raster=current_rasters[goal]['wholeExactSelectedRaster']['ownExactCopy']
    raster_same=(old_raster['sha256'].removeprefix('sha256:')==actual_raster['sha256'].removeprefix('sha256:') and old_raster['bytes']==actual_raster['bytes'])
    assert text_same and profile_same and raster_same,(goal,text_same,profile_same,raster_same)
    if goal in am_ar:
        am={'A':{'atomicity':am_ar[goal]['atomicity'],'memory':am_ar[goal]['memory']},'B':{'atomicity':am_br[goal]['atomicity'],'memory':am_br[goal]['memory']},'genuine25PairReused':True}
    else:
        assert goal==one_am['goalId']
        am={'originalAtomicityRecord':one_am['originalAtomicityRecord'],'originalMemoryRecord':one_am['originalMemoryRecord'],'genuineExistingSingleGoalReused':True}
    rows.append({'goalId':goal,'wholeCurrentBilingualTextEqualsPreviouslyReviewedScientificGoal':text_same,'wholeCurrentNormalPProfileEqualsOriginalNormalRecordAndOperativeAssembly':profile_same,
      'previousNormalRecordStatus':normal_p[goal]['status'],'previousEvidenceLevel':normal_p[goal]['evidenceLevel'],'previousMaximumClaimScope':normal_p[goal]['maximumClaimScope'],
      'wholeRasterBytesAndRoleRetained':raster_same,'actualPreviousRasterA':rasters[goal]['independentA'],'actualPreviousRasterB':rasters[goal]['independentB'],
      'unchangedAtomicityMemoryScientificJudgments':am,
      'reuseReason':'Unchanged goal-specific assessable performance remains coherent across its contexts; these process skills require actual explanation/action/interpretation rather than an additional fixed recall item. The supplied original A/M reasons and their scientific scope were read after FIRST. Current prerequisite/context and actual raster appearance were independently reviewed in this normal D round; reuse creates no source/course or runtime approval.',
      'noNewScientificApprovalFromHashes':True})
write(ROOT/'genuine-prior-science-AM-raster-reuse.after-FIRST.actual.json',{'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualFirstSeal':ref(ROOT/'FIRST.actual-sealed-before-current-peer-or-author-outcomes.json'),'sealErrors':seal_errors,
 'readOrder':'Prior genuine material pair conclusions and AM/raster outcome files first opened after this independent current FIRST was sealed. Current peer A outcome files still not opened.',
 'sources':[ref(x) for x in [*material_pairs, AUTHOR/'inputs/whole25-genuine-AM-a.exact.json',AUTHOR/'inputs/whole25-genuine-AM-b.exact.json',one,AUTHOR/'inputs/whole26-genuine-current-raster-pair.exact.json']],
 'originalReferencedBindingErrors':old_binding_errors,'immutableReferencedBindingErrors':immutable_binding_errors,
 'historicalMutableRuleSourceDrift':historical_mutable_rule_drift,
 'ruleSourceDriftDisclosure':'The historical AM-A record references the then-live AGENTS.md (ed7f0ca3...,129902 bytes), whose current version has a different whole-file hash. This mutable rule reference is not claimed byte-exact now, and its old record is not overwritten. Current AGENTS 7.1–7.4 and visualization rules were actually read before FIRST; coherent performance and no additional mandatory recall remain justified under those current rules. All original immutable evidence references remain checked separately.',
 'wholeP26ExactReuse':26,'wholeAm25PairExactScientificTextReuse':25,'wholeAm1ExistingScientificTextReuse':1,'wholeRaster26ExactRoleReuse':26,
 'literalRasterStatusPreservedForDiscussionGoal':'A PASS/KEEP; B ACCEPT, not rewritten as an original KEEP judgment.',
 'noHumanOrLearnerAcceptance':True,'noAdditionalSourceCourseOrProtectedContext12Approval':True,'activeNew':0,'activeRestored':0,'activeNet':0,'rows':rows})
assert not immutable_binding_errors,immutable_binding_errors

spec=importlib.util.spec_from_file_location('ordinary_schema',REPO/'scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
symlink_errors=module.curriculum_symlink_errors(REPO)
record_schema=json.loads((ROOT/'normal-b20/contracts/goal-description-review-record.schema.json').read_text())
run_schema=json.loads((REPO/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json').read_text())
record_validator=jsonschema.Draft202012Validator(record_schema,format_checker=jsonschema.FormatChecker())
run_validator=jsonschema.Draft202012Validator(run_schema,format_checker=jsonschema.FormatChecker())
parse_rows=[];schema_errors=[];record_count=run_count=0
for p in sorted(ROOT.rglob('*')):
    if not p.is_file():continue
    if p.suffix=='.json':
        obj=json.loads(p.read_text());parse_rows.append({'path':str(p.relative_to(REPO)),'kind':'json','bytes':p.stat().st_size})
        if p.name.endswith('.run.json'):
            run_count+=1
            schema_errors.extend({'path':str(p.relative_to(REPO)),'error':str(e)} for e in run_validator.iter_errors(obj))
    elif p.suffix=='.jsonl':
        raw=p.read_bytes();assert raw.endswith(b'\n') and b'\n' in raw, p
        lines=raw.decode().splitlines();parsed=[json.loads(line) for line in lines]
        parse_rows.append({'path':str(p.relative_to(REPO)),'kind':'complete-jsonl','records':len(parsed),'bytes':len(raw),'actualNewlineTerminated':True,'allLinesParsed':True})
        if p.name.endswith('.records.jsonl'):
            record_count+=len(parsed)
            for i,obj in enumerate(parsed):schema_errors.extend({'path':str(p.relative_to(REPO)),'line':i+1,'error':str(e)} for e in record_validator.iter_errors(obj))
assert record_count==26 and run_count==2
write(ROOT/'checks/scoped-schema-complete-jsonl-and-ordinary-curriculum-symlinks.actual.json',{'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Own package: all complete JSON/JSONL files, all26 description records and both2 AI-run manifests against unchanged ordinary schemas; ordinary curriculum_symlink_errors across committable curricula.', 'jsonAndJsonlParseFiles':parse_rows,'all26NormalRecordsSchemaChecked':record_count,'allNormalAiRunManifestsSchemaChecked':run_count,'schemaErrors':schema_errors,'ordinaryCurriculumSymlinkErrors':symlink_errors,'actualFirstSealStillMatches':not seal_errors,'passed':not(schema_errors or symlink_errors)})
assert not schema_errors and not symlink_errors,(schema_errors,symlink_errors)
print(json.dumps({'firstSealValid':True,'priorImmutableBindingErrors':len(immutable_binding_errors),'historicalMutableRuleSourceDrift':historical_mutable_rule_drift,'P26Exact':26,'AM25plus1Reused':26,'raster26ExactRoleReuse':26,'recordsSchemaValid':record_count,'runSchemaValid':run_count,'symlinkErrors':len(symlink_errors),'parsedFiles':len(parse_rows)},ensure_ascii=False))
