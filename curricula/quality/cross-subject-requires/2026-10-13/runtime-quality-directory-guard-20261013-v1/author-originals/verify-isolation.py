# Apache-2.0. Read-only pre-integration hash and actual-result checks.
from pathlib import Path
import hashlib,json,xml.etree.ElementTree as ET
BASE=Path('tmp/cross-subject-requires/runtime-quality-directory-guard-20261013')
def read(p):return json.loads(Path(p).read_text())
def binding(p):
    data=Path(p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'byteLength':len(data)}
def check(row):assert binding(row['path'])==row,row['path']
originals=read(BASE/'original-inputs.sha256.json')['files']
for row in originals:
    check(row)
    assert binding(BASE/'original'/row['path'])['sha256']==row['sha256']
main='backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java'
test='backend/src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java'
candidate=read(BASE/'candidate-inputs.sha256.json')
for row in candidate['files']:check(row)
production=read(BASE/'isolated-source-baseline.sha256.json')['files']
for row in production:
    check(row)
    relative=Path(row['path']).relative_to('backend/src')
    expected=binding(BASE/'candidate'/main)['sha256'] if row['path']==main else row['sha256']
    assert binding(BASE/'isolated-src'/relative)['sha256']==expected
    assert binding(BASE/'original-control-src'/relative)['sha256']==row['sha256']
assert binding(BASE/'candidate'/test)['sha256']==binding(BASE/'isolated-src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java')['sha256']
assert binding(BASE/'isolated-src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java')['sha256']==binding(BASE/'original-control-src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java')['sha256']
def suites(variant):
    rows=[]
    for path in sorted((BASE/f'build-{variant}/test-results/test').glob('TEST-*.xml')):
        root=ET.parse(path).getroot()
        rows.append({'xml':binding(path),'name':root.attrib['name'],'tests':int(root.attrib['tests']),
            'failures':int(root.attrib['failures']),'errors':int(root.attrib['errors']),'skipped':int(root.attrib['skipped']),
            'cases':[{'name':c.attrib['name'],'outcome':'failed' if c.find('failure') is not None else 'skipped' if c.find('skipped') is not None else 'passed'} for c in root.findall('testcase')]})
    return rows
positive=suites('candidate');negative=suites('original-control')
assert len(positive)==2 and sum(s['tests'] for s in positive)==8
assert all(s['failures']==s['errors']==s['skipped']==0 for s in positive)
assert len(negative)==1 and negative[0]['tests']==4 and negative[0]['failures']==3 and negative[0]['errors']==negative[0]['skipped']==0
class_suffix='classes/java/main/com/skillpilot/backend/landscape/LandscapeService.class'
candidate_class=binding(BASE/'build-candidate'/class_suffix)
original_class=binding(BASE/'build-original-control'/class_suffix)
assert candidate_class['sha256']!=original_class['sha256']
test_suffix='classes/java/test/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.class'
assert binding(BASE/'build-candidate'/test_suffix)['sha256']==binding(BASE/'build-original-control'/test_suffix)['sha256']
for variant in ['candidate','original-control']:
    log=(BASE/f'{variant}-tests.log').read_text()
    assert f'ISOLATED_QUALITY_GUARD variant={variant} java=25.0.2' in log
    assert str(BASE.resolve()/f'build-{variant}/classes/java/main') in log
    assert 'generateClaudePluginPublication SKIPPED' in log
    assert 'processResources SKIPPED' in log
assert 'BUILD SUCCESSFUL' in (BASE/'candidate-tests.log').read_text()
assert '4 tests completed, 3 failed' in (BASE/'original-control-tests.log').read_text()
print(json.dumps({'schemaVersion':1,'status':'PASS isolated author candidate checks; independent code review and active integration pending',
    'activeOriginalInputsUnchanged':len(originals),'allCurrentProductionJavaInputsUnchanged':len(production),
    'candidateSuites':positive,'originalCodeRegressionControl':negative,
    'candidateClass':candidate_class,'originalClass':original_class,'identicalRegressionTestClassesAcrossBothRuns':True,
    'scope':'Only two inert candidate source files and exact patch; original active files/index/build outputs are not modified. Actual targeted test execution only, no production/host/identity migration or full-suite claim.'},ensure_ascii=False,indent=2))
