# SPDX-License-Identifier: Apache-2.0
"""Byte-exact stock CLI, isolated Chemistry-only baseline/candidate inputs; no normal writes."""
from pathlib import Path
import hashlib,json,shutil,subprocess,time,sys,os

ROOT=Path(__file__).resolve().parents[8]
OUT=Path(__file__).resolve().parents[1]
REL=OUT.relative_to(ROOT)
FINAL=False
COMPLETE=True
SUFFIX='-final-SN-candidate' if FINAL else ('-required-math-infrastructure' if COMPLETE else '')
SCRATCH=ROOT/('tmp/chemie-T2-v6-interface-stock-candidate'+SUFFIX)
def load(p):return json.loads(p.read_text())
def pin(p):
    r=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(r).hexdigest(),'bytes':len(r)}
assert not SCRATCH.exists(),'Use a new scratch path; preserve prior execution'
cli=ROOT/'app/scripts/validateCompositionViews.ts'
cli_before=pin(cli)
for rel in ['app/scripts','curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/composition-views/chemie','curricula/DE/Gymnasium/quality/release-model','curricula/DE/Gymnasium/provenance']:
    (SCRATCH/rel).mkdir(parents=True)
shutil.copyfile(cli,SCRATCH/'app/scripts/validateCompositionViews.ts')
shutil.copyfile(ROOT/'app/package.json',SCRATCH/'app/package.json')
for rel,target in [('app/src',ROOT/'app/src'),('app/node_modules',ROOT/'app/node_modules'),('app/scripts/lib',ROOT/'app/scripts/lib')]:
    (SCRATCH/rel).symlink_to(target,target_is_directory=True)
policy='curricula/DE/Gymnasium/provenance/canonical-math-composition-fallback-policy.json'
shutil.copyfile(ROOT/policy,SCRATCH/policy)
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
source=ROOT/canonical
parent=load(OUT/'AUTHOR.canonical-contains-parent-whole-CAS.json')
assert pin(source)==parent['canonicalBeforeFilePin']
shutil.copyfile(source,SCRATCH/canonical)
changes=load(OUT/'AUTHOR.view-whole-CAS.json')['records']
infrastructure=[]
if COMPLETE:
    infrastructure_paths=[ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',ROOT/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json']
    infrastructure_paths+=list((ROOT/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.view.json'))
    for src in infrastructure_paths:
        target=SCRATCH/src.relative_to(ROOT);target.parent.mkdir(parents=True,exist_ok=True)
        os.link(src,target)
        infrastructure.append(pin(src))
for path in (ROOT/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.view.json'):
    shutil.copyfile(path,SCRATCH/path.relative_to(ROOT))
for row in changes:
    assert pin(ROOT/row['path'])==row['beforeFilePin']
records=[]
for stage in (['candidate'] if FINAL else ['before','candidate']):
    if stage=='candidate':
        graph=load(source)
        current=next(x for x in graph['goals'] if x['id']==parent['parentGoalId'])
        assert current==parent['beforeWholeGoal']
        graph['goals']=[parent['candidateWholeGoal'] if x['id']==parent['parentGoalId'] else x for x in graph['goals']]
        graph['goals']+=load(OUT/'AUTHOR.new-goals.full.draft.json')['newGoals']
        (SCRATCH/canonical).write_text(json.dumps(graph,ensure_ascii=False,indent=2)+'\n')
        for row in changes:(SCRATCH/row['path']).write_text(json.dumps(row['candidateWholeView'],ensure_ascii=False,indent=2)+'\n')
    argv=[str(ROOT/'app/node_modules/.bin/tsx'),str(SCRATCH/'app/scripts/validateCompositionViews.ts')]
    stdout=OUT/f'CHECK.stock-cli-{stage}{SUFFIX}.stdout.txt';stderr=OUT/f'CHECK.stock-cli-{stage}{SUFFIX}.stderr.txt'
    start=time.monotonic()
    with stdout.open('wb') as out,stderr.open('wb') as err:
        result=subprocess.run(argv,cwd=ROOT,stdout=out,stderr=err,check=False)
    records.append({'stage':stage,'commandArgv':argv,'exitCode':result.returncode,'wallSeconds':time.monotonic()-start,'stdout':pin(stdout),'stderr':pin(stderr),'scratchCanonical':pin(SCRATCH/canonical)})
assert pin(cli)==cli_before
assert all(pin(ROOT/x['path'])==x for x in infrastructure)
receipt={'role':'ORIGINAL_BYTE_EXACT_STOCK_CLI_CHMISTRY_ONLY_INPUT_SLICE_NOT_GLOBAL_QA','scriptSource':cli_before,
    'scratchScriptByteExact':(SCRATCH/'app/scripts/validateCompositionViews.ts').read_bytes()==cli.read_bytes(),
    'actualInputScope':'Current/candidate Chemistry and41Chemistryviews; exact unchanged required Math infrastructure included only when the complete flag is set. No new protected-subject science review or whole-repository gate claim.',
    'completeRequiredMathInfrastructure':COMPLETE,'finalSNContextCandidateOnly':FINAL,'requiredUnchangedInfrastructurePins':infrastructure,
    'normalReleaseModelLedgerBoundary':'Exact original CLI release-model discovery path is retained. No candidate authoritative kinds or native review rows are fabricated for this projection check.',
    'records':records,'allExitCodesZero':all(x['exitCode']==0 for x in records),'normalWrites':0,'newScientificVotes':0}
(OUT/('CHECK.original-stock-CLI-before-and-candidate'+SUFFIX+'.json')).write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'allExitCodesZero':receipt['allExitCodesZero'],'records':[{k:x[k] for k in ['stage','exitCode','wallSeconds']} for x in records]},indent=2))
