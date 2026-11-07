#!/usr/bin/env python3
"""Actual private file/source mutations through ordinary V/CQR303/maturity/floor paths."""
from pathlib import Path
import json,shutil
import runner
OUT,ROOT,W=runner.OUT,runner.ROOT,runner.W
candidate=json.loads((ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate/candidate-index.json').read_bytes())
first=candidate['rows'][0];corrected=next(row for row in candidate['rows']if row['corrected'])
pins=json.loads((OUT/'fixed74-pins.json').read_bytes());source_path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';qa_path='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'
base=[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts','--economics-probe','--reject-external-authority-mutation']
directory=W/'authority-mutations';directory.mkdir();cases=[]
def file_case(name,path,raw):
 temp=directory/name;temp.write_bytes(raw)
 runner.run(name,base,extras=[(temp,ROOT/path)],pattern='Actual private input/authority mutation rejected')
 cases.append({'name':name,'path':path,'actualVtoCqr303M6AndDirectFloorRejection':True})
for name,path in [
 ('index-actual-byte-change',pins['indexPath']),
 ('capsule-actual-byte-change',pins['capsulePath']+'/capsule.json'),
 ('q2-original-review-actual-byte-change',first['originalReview']['path']),
 ('q2-original-native-metadata-byte-change',next(ref['path']for ref in first['originalDependencies']if ref['path'].endswith('/metadata.json'))),
 ('q2-whole-author-input-byte-change',next(ref['path']for ref in first['originalDependencies']if ref['path'].endswith('/whole-goals.candidate.json'))),
 ('q2-original-inspection-derivative-byte-change',next(ref['path']for ref in first['originalDependencies']if ref['path'].endswith('.width-360.png'))),
 ('q2-actual-public-PNG-change',first['current']['publicAssetPath']),
 ('q2-actual-canonical-PNG-change',first['current']['canonicalAssetPath'])]:
 actual=W/'contracts'/Path(path).name if path==pins['indexPath']else ROOT/path
 file_case(name,path,actual.read_bytes()+b'\n')
receipt_ref=next(ref for ref in candidate['candidateReceipts']if ref['goalId']==first['goalId'])
file_case('q2-receipt-actual-byte-change',receipt_ref['path'],(ROOT/receipt_ref['path']).read_bytes()+b'\n')
correction_ref=next(ref for ref in candidate['candidateReceipts']if ref['goalId']==corrected['goalId'])
for field in ['titleEn','demandLevel']:
 receipt=json.loads((ROOT/correction_ref['path']).read_bytes());receipt['context'][field]=corrected['current'][field]
 file_case('de-only-receipt-cannot-invent-'+field,correction_ref['path'],(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode())
for field in ['description','descriptionEn','demandLevel','primaryRole']:
 source=json.loads((ROOT/source_path).read_bytes());goal=next(goal for goal in source['goals']if goal['id']==first['goalId'])
 qa=json.loads((ROOT/qa_path).read_bytes());row=next(row for row in qa['records']if row['goalId']==first['goalId'])
 if field=='demandLevel':goal['dimensionTags']['demandLevel']='AB1'
 elif field=='primaryRole':next(link for link in goal['resourceLinks']if link.get('role')=='primary')['role']='secondary'
 else:goal[field]+=' New unrelated competence.'
 if field=='description':row['description']=goal['description'] # actual retained asset-only AI approval after relabel
 temp=directory/('source-'+field+'.json');temp.write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
 extras=[(temp,ROOT/source_path)]
 if field=='description':
  qtemp=directory/'relabeled-qa.json';qtemp.write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n');extras.append((qtemp,ROOT/qa_path))
 name='live-q2-'+field+'-change'
 runner.run(name,base,extras=extras,pattern='Actual private input/authority mutation rejected')
 cases.append({'name':name,'actualVtoCqr303M6AndDirectFloorRejection':True,'qaAiApprovalRetained':field=='description'})
# Cache tests get their own writable RAM aliases: concurrent deep report sees exact unmutated inputs.
cache_contracts=directory/'cache-contracts';shutil.copytree(W/'contracts',cache_contracts)
cache_index=cache_contracts/Path(pins['indexPath']).name
runner.run('cached-authority-index-bytes-rechecked',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts','--cache-index-path='+str(cache_index)],
 extras=[(cache_contracts,ROOT/'contracts/goal-visualization-context/v1')],pattern='Current original-context V')
cases.append({'name':'cached-authority-index-bytes-rechecked','mutatedThenRestoredSameProcess':True})
cache_receipt=directory/'cache-receipt.json';shutil.copyfile(ROOT/receipt_ref['path'],cache_receipt)
runner.run('cached-authority-receipt-bytes-rechecked',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts','--economics-probe','--cache-receipt-path='+str(cache_receipt)],
 extras=[(cache_receipt,ROOT/receipt_ref['path'])],pattern='Current original-context V')
cases.append({'name':'cached-authority-receipt-bytes-rechecked','mutatedThenRestoredSameProcess':True})
(OUT/'authority-mutation-summary.json').write_text(json.dumps({'cases':cases,'activeFilesMutated':False,'allMutationsInPrivateRamAliases':True},indent=2)+'\n')
