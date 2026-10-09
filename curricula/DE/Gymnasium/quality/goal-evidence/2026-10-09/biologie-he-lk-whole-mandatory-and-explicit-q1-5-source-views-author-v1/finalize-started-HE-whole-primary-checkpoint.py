#!/usr/bin/env python3
"""Seal only this inactive started checkpoint after ordinary scoped checks."""
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import jsonschema

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
ENTRY = OUT / 'neutral-started-HE-whole-primary-and-scope-checkpoint.entry.json'
FIRST = OUT / 'HE-whole-primary-checkpoint.author-FIRST.verdict.json'
SEAL = OUT / 'HE-whole-primary-and-scope.started-author-final.freeze.json'

def read(path):
    return json.loads(path.read_text())

def binding(path):
    raw = path.read_bytes()
    return {'path':path.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}

def write(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def main():
    assert not FIRST.exists() and not SEAL.exists(), 'Do not overwrite FIRST or a frozen checkpoint.'
    entry = read(ENTRY)
    matrix = read(OUT/'candidate/HE19-whole-primary-topic-and-course-condition.matrix.json')
    roles = read(OUT/'candidate/HE144-whole-current-goals-and-partners.started-primary-role.matrix.json')
    impacts = read(OUT/'candidate/native17-and-protected15.whole-source-partner-impact.started.matrix.json')
    fragments = read(OUT/'checks/ordinary-existing-bounded-fragment-compiles.actual.json')
    assert len(matrix['topics']) == 19 and sum(r['mandatoryByWholeOfficialOverview'] for r in matrix['topics']) == 11
    assert len(roles['wholeRows']) == 144 and sum(len(r['wholeCurrentEdgesExact']) for r in roles['wholeRows']) == 157
    assert len(impacts['rows']) == 32 and roles['wholeClauseClosureCompletedCount'] == 0
    assert not entry['completeMandatoryViewApproved'] and not entry['completeMandatoryViewExistsInThisPackage']
    assert [len(r['targetGoalIds']) for r in fragments['viewChecks']] == [1,1]
    assert all(r['errorCount']==0 for r in fragments['viewChecks'])
    write(FIRST, {
        'role':'author_science_FIRST_for_started_bounded_source_checkpoint_not_independent_approval',
        'createdAt':datetime.now(timezone.utc).isoformat(),
        'actualWholePrimaryInput':binding(OUT/'primary/HE-whole-pages33-48.actual-page-map.json'),
        'actualTopicMatrix':binding(OUT/'candidate/HE19-whole-primary-topic-and-course-condition.matrix.json'),
        'actualSourcePartnerMatrix':binding(OUT/'candidate/HE144-whole-current-goals-and-partners.started-primary-role.matrix.json'),
        'actualNativeContextMatrix':binding(OUT/'candidate/native17-and-protected15.whole-source-partner-impact.started.matrix.json'),
        'verdict':'STARTED_CHECKPOINT_WITH_OPEN_WHOLE_CLAUSE_AND_SELECTION_DUTIES',
        'authorActualFindings':['Whole topic overview states11 mandatory and8 additional topics.', 'Eight authored extra competences have no matching whole stated HE clause in their current assigned topic.', 'Five current learner scope dimensions do not express explicit Q1.5 selection.', 'Whole17 native and15 protected context source-duty alternatives require further targeted classification.'],
        'completeSourceApproval':False,'independentApproval':False,'humanApproval':False,'actualLearnerPerformance':False,
        'strictScientificClosures':0,'restoredBindings':0,'netStrictGain':0,
    })
    schema_checks = []
    schema_pairs = [
        (OUT/'input/canonical.current479.exact.json',ROOT/'docs/landscape-runtime.schema.json'),
        (OUT/'input/kinds.current394.exact.json',ROOT/'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),
    ]
    schema_pairs += [(OUT/'candidate/bounded-existing-fragments'/name, ROOT/'contracts/curriculum-package/v1/composition-view.schema.json') for name in ['HE-Q1-5-LK-explicitly-selected.view.json','HE-LK-Q2-1-limited-core-source-role-preview.view.json']]
    for data_path,schema_path in schema_pairs:
        schema = read(schema_path)
        cls = jsonschema.validators.validator_for(schema)
        cls.check_schema(schema)
        errors = list(cls(schema).iter_errors(read(data_path)))
        assert not errors, [(list(error.path),error.message) for error in errors]
        schema_checks.append({'input':binding(data_path),'normalSchema':binding(schema_path),'errorCount':0})
    parsed = []
    for path in sorted(OUT.rglob('*')):
        if path.suffix == '.json':
            read(path); parsed.append(path.relative_to(ROOT).as_posix())
        elif path.suffix == '.jsonl':
            for line in path.read_text().splitlines():
                if line.strip(): json.loads(line)
            parsed.append(path.relative_to(ROOT).as_posix())
    inputs_exact = {}
    for key,original in entry['originalInputs'].items():
        inputs_exact[key] = binding(ROOT/original['path']) == original
    assert all(inputs_exact.values()), inputs_exact
    sealed_histories = []
    for key in ['source7FinalSeal','native17FinalSeal','correctedSourceMethodFinalSeal']:
        old_seal = entry['originalInputs'][key]
        old = read(ROOT/old_seal['path'])
        for row in old['files']:
            assert binding(ROOT/row['path']) == row, row['path']
        sealed_histories.append({'originalFinalSeal':old_seal,'allSealedFileCount':len(old['files']),'allExact':True})
    spec = importlib.util.spec_from_file_location('normal_validate_schemas',ROOT/'scripts/validate_schemas.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    symlink_errors = module.curriculum_symlink_errors(ROOT)
    assert not symlink_errors, symlink_errors
    files = [path for path in OUT.rglob('*') if path.is_file()]
    assert not any(path.is_symlink() for path in OUT.rglob('*'))
    names = '\n'.join(path.relative_to(ROOT).as_posix() for path in files)+'\n'
    ignored = subprocess.run(['git','check-ignore','--stdin'],input=names,text=True,capture_output=True)
    assert ignored.returncode in (0,1) and not ignored.stdout.strip(), ignored.stdout
    diff_checks = []
    for path in sorted(files):
        result = subprocess.run(['git','diff','--no-index','--check','/dev/null',str(path)],capture_output=True,text=True)
        assert result.returncode in (0,1) and not result.stdout and not result.stderr, (str(path),result.stdout,result.stderr)
        diff_checks.append(path.relative_to(ROOT).as_posix())
    check_path = OUT/'checks/normal-json-schema-portability-and-diff.actual.json'
    write(check_path, {
        'role':'ordinary_scoped_checks_of_started_inactive_checkpoint_not_full_curriculum_QS',
        'actualNormalSchemaChecks':schema_checks,'wholeJsonJsonlParsedFileCount':len(parsed),'wholeParsedFiles':parsed,
        'originalInputsStillExact':inputs_exact,'originalSealedHistoriesAllExact':sealed_histories,
        'ordinaryExistingFragments':binding(OUT/'checks/ordinary-existing-bounded-fragment-compiles.actual.json'),
        'normalCurriculumSymlinkChecker':'scripts/validate_schemas.py:curriculum_symlink_errors',
        'normalCurriculumSymlinkErrors':symlink_errors,'operativeFilesIgnored':[],'ownedSymlinks':[],
        'normalGitDiffCheckFiles':diff_checks,'normalGitDiffCheckErrors':[],
        'completeMandatorySourceOrLearnerViewClaim':False,'independentSourceApproval':False,
    })
    entry['authorScienceFIRST'] = binding(FIRST)
    entry['normalScopedChecks'] = binding(check_path)
    entry['finalSealPath'] = SEAL.relative_to(ROOT).as_posix()
    write(ENTRY,entry)
    write(SEAL, {
        'schemaVersion':'1.0','role':'final_frozen_started_author_checkpoint_not_whole_HE_closure',
        'createdAt':datetime.now(timezone.utc).isoformat(),'neutralEntry':binding(ENTRY),'authorFIRST':binding(FIRST),
        'files':[binding(path) for path in sorted(OUT.rglob('*')) if path.is_file() and path!=SEAL],
        'completeMandatoryView':False,'wholeSourceApproval':False,'independentApproval':False,
        'strictGain':0,'newScientificClosures':0,'restoredBindings':0,'activeWrites':[],
        'humanApproval':False,'humanTrial':False,
    })
    final = read(SEAL)
    for row in final['files']:
        assert binding(ROOT/row['path']) == row
    assert binding(ENTRY)==final['neutralEntry']
    print(json.dumps({'entry':binding(ENTRY),'finalSeal':binding(SEAL),'sealedFiles':len(final['files']),'normalSchemaCount':len(schema_checks),'normalFragmentErrors':[r['errorCount'] for r in fragments['viewChecks']],'wholeMandatoryViewApproved':False,'strictGain':0},ensure_ascii=False))

if __name__ == '__main__':
    main()
