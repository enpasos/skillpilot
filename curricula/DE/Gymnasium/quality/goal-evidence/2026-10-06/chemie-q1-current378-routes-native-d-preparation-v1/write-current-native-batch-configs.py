from pathlib import Path
import json,sys,shutil
ROOT=Path('/home/enpasos/projects/skillpilot')
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1');OWN=ROOT/REL
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
stage=sys.argv[1]
scope=json.loads((OWN/f'{stage}.native-d-union.actual.json').read_text())
ids=scope['orderedGoalIds'];configs=[]
for index,start in enumerate(range(0,len(ids),20),1):
    selected=ids[start:start+20];assert 1<=len(selected)<=20
    batch=f'chemie-q1-current378-routes-20261006-v1-{index:03d}'
    config={
        '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
        'schemaVersion':1,'batchId':batch,'subject':'chemie','subjectLabel':'Chemie',
        'bookId':f'de-gym-chemie-current378-routes-review-{index:03d}',
        'title':f'Chemie – aktuelle Beschreibungsprüfung {index} von 3',
        'baseGoalBookConfigPath':str(REL/'full-current378-routes-v2.config.json'),
        'goalIds':selected,'outputDirectory':str(REL/'native-current-d-batches'/f'batch-{index:03d}'),
        'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
        'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
        'criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
        'printDerivativeProfile':'bounded-atlas',
    }
    path=REL/'batch-configs'/f'batch-{index:03d}.config.json'
    for root in [ROOT,ISO]:
        dst=root/path;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
    configs.append({'configPath':str(path),'batchId':batch,'goalCount':len(selected),'goalIds':selected,'outputDirectory':config['outputDirectory']})
assert len(set(id for c in configs for id in c['goalIds']))==len(ids)
(OWN/'native-current-d-batch-plan.actual.json').write_text(json.dumps({'schemaVersion':1,'scopeStage':stage,'goalCount':len(ids),'batches':configs,'twoIndependentRoundsPerBatch':True,'nativePrepareExecuted':False,'scienceReviewDecisions':[],'activeWrites':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'scopeStage':stage,'nativeBatchSizes':[c['goalCount'] for c in configs]}))
