from pathlib import Path
import json,gzip,hashlib,shutil
r=Path('/home/enpasos/projects/skillpilot');w=Path(__file__).resolve().parent
sha=lambda raw:hashlib.sha256(raw).hexdigest()
source=json.loads((w/'source-e4de.json').read_bytes());goals={g['id']:g for g in source['goals']}
old=json.loads((r/'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json').read_bytes())
ledger=json.loads(gzip.decompress((r/'qa-artifacts/ci-contract-audit/2026-11-07/math-matrix-current-description-input-2026-11-07/preparation/mathematik.qa.json.gz').read_bytes()))
initial={row['goalId']:row for row in ledger['records']};changes=[]
index=json.loads((r/'qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification/candidate-index.json').read_bytes())
for entry in index['candidateReceipts']:
 receipt=json.loads((r/entry['path']).read_bytes());assert sha((r/entry['path']).read_bytes())==entry['sha256']
 row=initial[entry['goalId']];before=json.loads(json.dumps(row));g=goals[row['goalId']]
 row.update(title=g['title'],description=g['description'],aiApproved='yes',aiApprovedAssetSha256=receipt['context']['assetSha256'],aiReviewedAt=receipt['reviewedAt'],aiReviewer=receipt['reviewer'],aiNotes=receipt['originalReason'])
 assert all(row[k]==before[k]for k in before if k.startswith('human')),row['goalId']
 changes.append({'goalId':row['goalId'],'before':before,'candidate':row,'originalReceipt':entry})
mat=initial['ce198bc9-b014-52ba-814f-25cc3e020668'];assert mat['humanApproved']=='no'and mat['humanIssueIdentified']=='no'
(w/'math-qa.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
(w/'three-fresh-qa-rows.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2)+'\n')
kindraw=gzip.decompress((r/'qa-artifacts/ci-contract-audit/2026-11-07/math-matrix-current-description-input-2026-11-07/preparation/kind-ledger.json.gz').read_bytes());(w/'kind-ledger.json').write_bytes(kindraw)
body=json.loads((w/'capsule57/capsule.json').read_bytes());capsha=sha((w/'capsule57/capsule.json').read_bytes());assert capsha=='4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852'
p=w/'candidate/app/scripts/lib/qualifiedVisualizationContextAuthority.ts';s=p.read_text().replace("indexPath: 'contracts/goal-visualization-context/v1/qualified-context-index.json'","indexPath: 'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json'").replace('3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e','46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0').replace("visualization-qualified-context-index/capsule'","visualization-qualified-context-index-math3-2026-11-07/capsule'").replace('e78eb4c6338340eead74d3de696da955b50cdca3f4f377160c3d9d87e3454c6b',capsha).replace('6fe35a6b0fa807e5a97475b34f3715dc16a89c00','25a6f2164a81a7e6ae50db3557d20521fecf5124').replace('!== 54','!== 57');p.write_text(s)
shutil.copyfile(p,w/'scripts-view/lib/qualifiedVisualizationContextAuthority.ts')
p=w/'candidate/app/scripts/testVisualizationContextMath3Maturity.ts';s=(r/'app/scripts/testVisualizationContextMaturity.ts').read_text().replace('922d89fc-1cbd-56e9-ac5d-5cb59085de6c','ce198bc9-b014-52ba-814f-25cc3e020668').replace('actualQualified, 54','actualQualified, 57');p.write_text(s);shutil.copyfile(p,w/'scripts-view/testVisualizationContextMath3Maturity.ts')
(w/'candidate/app/scripts/testVisualizationContextMaturity.ts').unlink()
# Only the explicit new capsule child is added under an isolated namespace view.
(w/'capsule-parent').mkdir();shutil.copytree(w/'capsule57',w/'capsule-parent/capsule')
print(json.dumps({'newIndexBytes':(w/'contracts-view/qualified-context-index-math3-2026-11-07.json').stat().st_size,'newCapsuleSha256':capsha,'candidateQaSha256':sha((w/'math-qa.json').read_bytes()),'kindSeedSha256':sha(kindraw),'freshRows':len(changes)}))
