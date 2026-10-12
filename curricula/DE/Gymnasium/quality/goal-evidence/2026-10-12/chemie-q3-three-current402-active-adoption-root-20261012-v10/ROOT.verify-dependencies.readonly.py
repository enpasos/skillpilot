"""Read-only verifier for root's concrete T3 adoption plan; writes no active file."""
from pathlib import Path
import json,hashlib
ROOT=Path.cwd()
OUT=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-active-adoption-root-20261012-v10')
read=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
plan=read(OUT/'ROOT.future-active-adoption.plan.json');receipt=read(OUT/'checks/FIRST.technical-adoption-inputs-and-exact-merge.receipt.json')
for dep in receipt['sealedDependencies']:assert sha(Path(dep['path']))==dep['sha256'],dep['path']
mcpath=Path(receipt['activeMemoryConfigDependency']);assert sha(mcpath)==receipt['activeMemoryConfigSHA'],str(mcpath)
mc=read(mcpath);assert sha(Path(mc['reviewPath']))==receipt['activeMemorySourceSHA'];assert sha(Path(mc['cardReviewPath']))==receipt['activeCardsSourceSHA']
registry=read(Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'));chem=next(x for x in registry['subjects'] if x['subject']=='chemie');assert chem['memoryReviewConfigPath']==str(mcpath)
live=read(Path(plan['currentCanonicalDependency']['path']));candidate=read(Path(plan['candidateCanonical']['path']));old={g['id']:g for g in live['goals']};new={g['id']:g for g in candidate['goals']};ids=set(plan['selectedGoalIds']);assert set(old)==set(new);assert all(old[g]==new[g] for g in old if g not in ids)
for dep in plan['boundedSourceOutputs']:assert sha(Path(dep['preparedPath']))==dep['sha256']
assert sha(Path(plan['DindexPath']))==plan['DindexSHA']
print(json.dumps({'actualCurrentMemoryDependenciesMatch':True,'actualOther520GoalBodiesExact':True,'originalSealsMatch':True,'normalSourceOutputsMatch':len(plan['boundedSourceOutputs']),'activeWrites':False,'rootPlan':str(OUT/'ROOT.future-active-adoption.plan.json')}))
