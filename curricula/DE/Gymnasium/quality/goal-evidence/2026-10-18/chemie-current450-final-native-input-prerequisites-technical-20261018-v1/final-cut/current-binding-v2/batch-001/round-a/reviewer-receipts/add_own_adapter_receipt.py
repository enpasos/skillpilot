import datetime, hashlib, json, pathlib, sys

ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-native-input-prerequisites-technical-20261018-v1/final-cut/current-binding-v2'

def pin(p):
    data=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}

for number in map(int,sys.argv[1:]):
    p=BASE/f'batch-{number:03d}/round-a'
    campaign=json.loads((p/'description-review-campaign.json').read_text())
    batch_id=campaign['batches'][0]['batchId']
    receipt=p/'reviewer-receipts/ADAPTER.actual-final-first-pass.receipt.json'
    assert not receipt.exists(), 'Additive adapter receipt already exists'
    record={'reviewerId':'/root/chemie_final_native_round_a_20261018','reviewMode':'stock_blind_final_input_first_pass','finalInputActuallyRead':True,'peerResultsReadBeforeOwnSeal':False,'nativeRun':pin(p/'results'/f'{batch_id}.run.json'),'nativeRecords':pin(p/'results'/f'{batch_id}.records.jsonl'),'originalFirstPassReceipt':pin(p/'reviewer-receipts/independent-first-pass.receipt.json'),'originalFirstPassSeal':pin(p/'reviewer-receipts/independent-first-pass.seal.json'),'adapterWrittenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newReviewVote':False,'note':'Additive transport receipt only. Original independent judgments, runs, reading history, receipt and seal remain byte-identical. No peer results read.'}
    receipt.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(pin(receipt)))
