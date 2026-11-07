#!/usr/bin/env python3
"""Create the complete inert74 implementation and RAM-only execution view."""
import datetime,hashlib,json,os,shutil,subprocess,tempfile
from pathlib import Path
OUT=Path(__file__).resolve().parent; ROOT=OUT.parents[3]
OLD=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate'
PEER=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-independent-peer'
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def put(path,raw):
 p=OUT/'private-code'/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw.encode()if isinstance(raw,str)else raw);return p
seal=(PEER/'review-seal.json').read_bytes();assert sha(seal)=='37bbc0d8ae2468dc4826300646b8d94e28d452d38e0c0ddb621daef3c2d4e6d4'
for ref in json.loads(seal)['artifacts']: assert sha((PEER/ref['path']).read_bytes())==ref['sha256']
peer=json.loads((PEER/'review.json').read_bytes())
for ref in peer['exactReviewedPrivateCodeAndInputPins']:assert sha((ROOT/ref['path']).read_bytes())==ref['sha256']
starting=json.loads((OUT/'starting-pins.json').read_bytes())
for ref in starting['activePins']:assert sha((ROOT/ref['path']).read_bytes())==ref['sha256']
W=Path(tempfile.mkdtemp(prefix='skillpilot-fixed74-',dir='/dev/shm'))
(OUT/'ram-location.json').write_text(json.dumps({'path':str(W),'createdUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()})+'\n')
for name in ['scratch','results']: (W/name).mkdir()
index_copy=W/'workspace.index.readonly';index_copy.write_bytes((ROOT/'.git/index').read_bytes());index_copy.chmod(0o444)
assert index_copy.is_file() and sha(index_copy.read_bytes())==sha((ROOT/'.git/index').read_bytes())
subprocess.run(['git','init','--quiet',str(W/'origin')],check=True)
for _ in range(2):subprocess.run(['git','-C',str(W/'origin'),'-c','user.name=Private fixture','-c','user.email=fixture@example.invalid','commit','--quiet','--allow-empty','-m','Unrelated host fixture'],check=True)
subprocess.run(['git','clone','--quiet','--depth=1',(W/'origin').as_uri(),str(W/'host')],check=True)
assert subprocess.check_output(['git','-C',str(W/'host'),'rev-parse','--is-shallow-repository']).strip()==b'true'
assert subprocess.run(['git','-C',str(W/'host'),'cat-file','-e','25a6f2164a81a7e6ae50db3557d20521fecf5124'],capture_output=True).returncode!=0
shutil.copytree(ROOT/'app/scripts',W/'scripts')
shutil.copytree(ROOT/'contracts/goal-visualization-context/v1',W/'contracts')
shutil.copytree(ROOT/'scripts',W/'root-scripts',ignore=shutil.ignore_patterns('__pycache__'))
reader=(OLD/'economicsQ2MonetarySocialContext.private.ts').read_text()
reader=reader.replace("from './goalVisualizationReviewedContext.private'","from '../goalVisualizationReviewedContext'")
reader=reader.replace("new URL('./private-family-pins.json', import.meta.url)","new URL('../../../contracts/goal-visualization-context/v1/economics-q2-monetary-social-original-pins-2026-11-07.json', import.meta.url)")
put('app/scripts/lib/goalVisualizationEconomicsQ2MonetarySocialContexts.ts',reader)
put('contracts/goal-visualization-context/v1/economics-q2-monetary-social-original-pins-2026-11-07.json',(OLD/'private-family-pins.json').read_bytes())
core=(ROOT/'app/scripts/goalVisualizationReviewedContext.ts').read_text()
core=core.replace("import { readEconomicsQ3Context }", "import { readEconomicsQ2MonetarySocialContext } from './lib/goalVisualizationEconomicsQ2MonetarySocialContexts'\nimport { readEconomicsQ3Context }",1)
core=core.replace("| 'economics-q3-trade-finance-v1'\n","| 'economics-q3-trade-finance-v1' | 'economics-q2-monetary-social-embedded-v1'\n",1)
core=core.replace('const reviewOwners = {',"const reviewOwners = {\n  'economics-q2-monetary-social-embedded-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',\n    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },",1)
target="      } else if (receipt.reviewProfile === 'economics-q3-embedded-v1' || receipt.reviewProfile === 'economics-q3-trade-finance-v1') {"
core=core.replace(target,"      } else if (receipt.reviewProfile === 'economics-q2-monetary-social-embedded-v1') {\n        ;({ native, decision, reviewedAt, reviewer, reason, assetPath } = readEconomicsQ2MonetarySocialContext(receipt, review, assetRaw, artifact, parseVisualizationReviewJson))\n"+target,1)
put('app/scripts/goalVisualizationReviewedContext.ts',core)
schema=json.loads((ROOT/'contracts/goal-visualization-context/v1/qualification.schema.json').read_bytes())
schema['properties']['reviewProfile']['enum'].append('economics-q2-monetary-social-embedded-v1')
put('contracts/goal-visualization-context/v1/qualification.schema.json',json.dumps(schema,indent=2)+'\n')
collector=(OUT/'collector.template.ts').read_text()
put('app/scripts/collectVisualizationContextEconomics17Originals.ts',collector)
for path in (OUT/'private-code').rglob('*'):
 if not path.is_file():continue
 rel=path.relative_to(OUT/'private-code');dest=W/'scripts'/rel.relative_to('app/scripts')if str(rel).startswith('app/scripts/')else W/'contracts'/rel.relative_to('contracts/goal-visualization-context/v1')
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,dest)
metadata={'ramRoot':str(W),'workspaceIndexSnapshotSha256':sha(index_copy.read_bytes()),'workspaceIndexSnapshotBytes':index_copy.stat().st_size,
 'workspaceIndexSnapshotMode':oct(index_copy.stat().st_mode&0o777),'hostDepth':1,'hostHasOriginalAcceptedCommit':False,
 'reviewSealSha256':sha(seal),'newWorkingBudgetBytes':201326592,'old54And57WorkingBudgetsUnchanged':134217728,
 'originalObjectBudgetBytesUnchanged':268435456,'embeddedRawBudgetBytesUnchanged':16777216}
(OUT/'preparation.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata))
