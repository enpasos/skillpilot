import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

root=Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-image-fresh-independent-v-v1')
first_path=root/'FIRST.independent-scientific-observations.json'
first_bytes=first_path.read_bytes()
seal=json.loads((root/'FIRST.seal.json').read_text())
assert hashlib.sha256(first_bytes).hexdigest()==seal['sha256']
first=json.loads(first_bytes)
records=[]
for item in first['records']:
    digest='sha256:'+item['candidateSha256']
    notes=' '.join([item['science'],item['oldDefectAndResolution'],item['goalAndProfileAlignment'],item['responsive'],item['personPerspective'],'Limitations: '+'; '.join(item['remainingLimitations']),f"FIRST: {first_path}; sha256:{seal['sha256']}. Exact independent candidate review only; no human approval or full M7 completion."])
    records.append({
      'goalId':item['goalId'],'assetSha256':digest,
      'aiApproved':'yes' if item['decision']=='KEEP' else 'no',
      'aiApprovedAssetSha256':digest,
      'aiReviewedAt':first['sealedAtUTC'],
      'aiReviewer':first['reviewer'],
      'aiNotes':notes
    })
delta={
  'schemaVersion':1,'subject':'chemie',
  'role':'Selected candidate AI review delta in stock AI field names; not an applied or current-active QA ledger',
  'first':seal,'serializedAtUTC':datetime.now(timezone.utc).isoformat(),
  'humanApproval':False,'sourceMutations':False,
  'preserveHumanFieldsOnIntegration':True,
  'records':records
}
(root/'V.review-records.stock-ai-delta.json').write_text(json.dumps(delta,ensure_ascii=False,indent=2)+'\n')
(root/'generation-parameters.truthful.json').write_text(json.dumps({
 'role':'Actual reviewer provenance; no invented sampling settings',
 'reviewer':first['reviewer'],
 'reviewerIsImageAuthor':False,
 'imageGenerationExecutedByThisReviewer':False,
 'candidateProviderAsDeclaredByAuthorSelector':'OpenAI / ChatGPT-Codex built-in image_gen; model version not exposed',
 'reviewerModelVersion':'Not exposed in a verifiable tool result',
 'samplingTemperature':'Not exposed; not asserted',
 'reasoningEffort':'Not exposed; not asserted',
 'toolsActuallyUsed':['view_image detail=original for eight native images and sixteen rendered screenshots','Real Playwright/Chromium 147.0.7727.15 with image.decode and element screenshots','Read current sanitized scientific C/P fields, exact source hashes and repository policy','Stock AI predicate imported after sealed FIRST'],
 'reviewPhaseOrder':['current scientific inputs and native images','real 360/680 previews','own FIRST science sealed','read stock schema and serialize AI-only delta','stock predicate and pin checks'],
 'peerResultsRead':False,'humanApproval':False
},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':len(records),'KEEP':sum(r['aiApproved']=='yes' for r in records),'firstSha256':seal['sha256']},indent=2))
