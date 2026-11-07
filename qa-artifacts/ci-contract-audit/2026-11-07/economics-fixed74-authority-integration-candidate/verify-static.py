#!/usr/bin/env python3
import datetime,difflib,hashlib,json,os,subprocess
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3];C=OUT/'private-code'
sha=lambda raw:hashlib.sha256(raw).hexdigest()
starting=json.loads((OUT/'starting-pins.json').read_bytes())
for ref in starting['activePins']:assert sha((ROOT/ref['path']).read_bytes())==ref['sha256'],ref['path']
old=json.loads((ROOT/'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json').read_bytes())
new=json.loads((C/'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json').read_bytes())
family=json.loads((C/'contracts/goal-visualization-context/v1/economics-q2-monetary-social-original-pins-2026-11-07.json').read_bytes())
oldids={(row['landscapeId'],row['goalId'])for row in old['rows']};newids={(row['landscapeId'],row['goalId'])for row in new['rows']}
assert len(oldids)==57 and len(newids)==74 and oldids<newids
assert [row for row in new['rows']if(row['landscapeId'],row['goalId'])in oldids]==old['rows']
expected={}
for ref in old['originalReferences']+family['originalReferences']:
 key=(ref['gitCommit'],ref['path']);previous=expected.get(key)
 assert not previous or previous['sha256']==ref['sha256']
 expected[key]={k:ref[k]for k in ['path','gitCommit','sha256','currentCopyRequired']}
 expected[key]['currentCopyRequired']=ref['currentCopyRequired']or bool(previous and previous['currentCopyRequired'])
assert new['originalReferences']==[expected[key]for key in sorted(expected)]
assert len(expected)==359 and sum(row['currentCopyRequired']for row in expected.values())==354
for row in new['rows']:assert sha((ROOT/row['receipt']['path']).read_bytes())==row['receipt']['sha256']
oldschema=json.loads((ROOT/'contracts/goal-visualization-context/v1/qualification.schema.json').read_bytes())
oldschema['properties']['reviewProfile']['enum'].append('economics-q2-monetary-social-embedded-v1')
assert oldschema==json.loads((C/'contracts/goal-visualization-context/v1/qualification.schema.json').read_bytes())
original_reader=(ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate/economicsQ2MonetarySocialContext.private.ts').read_text()
assert sha(original_reader.encode())=='05e4462eaddd456cb59213cb53d58b8cc54124cdbd8c7394075e90e19fc59fa7'
relocated=original_reader.replace("from './goalVisualizationReviewedContext.private'","from '../goalVisualizationReviewedContext'").replace("new URL('./private-family-pins.json', import.meta.url)","new URL('../../../contracts/goal-visualization-context/v1/economics-q2-monetary-social-original-pins-2026-11-07.json', import.meta.url)")
assert relocated==(C/'app/scripts/lib/goalVisualizationEconomicsQ2MonetarySocialContexts.ts').read_text()
original_core=(ROOT/'app/scripts/goalVisualizationReviewedContext.ts').read_text()
expected_core=original_core.replace("import { readEconomicsQ3Context }", "import { readEconomicsQ2MonetarySocialContext } from './lib/goalVisualizationEconomicsQ2MonetarySocialContexts'\nimport { readEconomicsQ3Context }",1)
expected_core=expected_core.replace("| 'economics-q3-trade-finance-v1'\n","| 'economics-q3-trade-finance-v1' | 'economics-q2-monetary-social-embedded-v1'\n",1)
expected_core=expected_core.replace('const reviewOwners = {',"const reviewOwners = {\n  'economics-q2-monetary-social-embedded-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',\n    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },",1)
branch="      } else if (receipt.reviewProfile === 'economics-q3-embedded-v1' || receipt.reviewProfile === 'economics-q3-trade-finance-v1') {"
expected_core=expected_core.replace(branch,"      } else if (receipt.reviewProfile === 'economics-q2-monetary-social-embedded-v1') {\n        ;({ native, decision, reviewedAt, reviewer, reason, assetPath } = readEconomicsQ2MonetarySocialContext(receipt, review, assetRaw, artifact, parseVisualizationReviewJson))\n"+branch,1)
assert expected_core==(C/'app/scripts/goalVisualizationReviewedContext.ts').read_text()
changes=[]
for path in sorted(C.rglob('*')):
 if not path.is_file():continue
 relative=path.relative_to(C);target=ROOT/relative
 changes.append({'proposedPath':str(relative),'candidatePath':str(path.relative_to(ROOT)),'sha256':sha(path.read_bytes()),'bytes':path.stat().st_size,'activePathAlreadyExists':target.exists(),
  'previousSha256':sha(target.read_bytes())if target.exists()else None})
patch=[]
for row in changes:
 path=C/row['proposedPath'];previous=(ROOT/row['proposedPath']).read_text()if row['activePathAlreadyExists']else''
 patch.extend(difflib.unified_diff(previous.splitlines(True),path.read_text().splitlines(True),fromfile='a/'+row['proposedPath'],tofile='b/'+row['proposedPath']))
(OUT/'private-application.patch').write_text(''.join(patch))
parent=json.loads((ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/math3-fixed57-normal-cqr-producer/preflight.json').read_bytes())
protected=[]
for path,digest in parent['protectedInputHashes'].items():
 if path.startswith('docs/qa-ci/status/') or path == '.gitattributes':continue
 actual=sha((ROOT/path).read_bytes());assert actual==digest,path
 protected.append({'path':path,'sha256':digest})
protected.append({'path':'.gitattributes','sha256':sha((ROOT/'.gitattributes').read_bytes())})
assert (C/'.gitattributes').read_bytes().startswith((ROOT/'.gitattributes').read_bytes())
result={'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'preserved57RowsAndReceiptBytes':True,
 'new17Distinct':True,'actualCollectorClosureEqualsExactRequired359Union':True,'requiredCurrentCopies':354,
 'oldFiveProfileBranchesUnchanged':True,'newReaderOnlyReviewedMechanicalRelocation':True,'schemaOnlyAddsReviewedClosedEnum':True,
 'rawGitKernelUnchanged':True,'old54And57IndexAndCapsuleBytePinsRetained':True,'protectedActiveInputs':protected,
 'initialTargetedActivePinsUnchanged':len(starting['activePins']),'rootObservedHeadAtEnd':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
 'rootIndexStillSymlink':(ROOT/'.git/index').is_symlink(),'rootIndexSymlinkTarget':os.readlink(ROOT/'.git/index'),
 'rootIndexWritesByThisCandidate':False,'rootAuditCheckpointMayHaveChangedIndexIndependently':True,'privateCodeCandidates':changes}
(OUT/'static-integrity.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items()if k not in ['privateCodeCandidates','protectedActiveInputs']}))
