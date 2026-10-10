# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime
R=Path.cwd();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve()
term=json.loads((O/'checks/normal-inventory-measured-LayerA-patch.terminal.actual.json').read_text());assert term['actualExitCode']==0
patch=term['stdout'];(O/'candidate/ai-transparency-inventory.measured-layer-a.patch.txt').write_text(patch)
# Normal checker emits a literal patch; extract its complete measured replacement document.
updated=json.loads('\n'.join(s[1:]for s in patch.splitlines()if s.startswith('+')));old=json.loads((C/'docs/legal/ai-transparency-inventory.json').read_text())
allowed={'canonicalLandscapeFiles','canonicalGoalCount','count','fileExtensions','providerCounts','c2paStructure'}
a=old['artifactClasses']['goalVisualizations'];b=updated['artifactClasses']['goalVisualizations'];assert{ k:v for k,v in a.items()if k not in allowed}=={k:v for k,v in b.items()if k not in allowed}
notes=[]
for gid in ['9e3fae29-84d5-5600-bfb3-82d49ea3f1b5','4aa3a130-b517-5ac5-87b2-147fe432cadd']:
 p=O/'candidate/provider-prompt-unknown-retrospective-KEEP'/gid/'prompt.de.md'
 notes.append({'goalId':gid,'originalGenerationPromptAvailable':False,'originalGeneratorReceiptAvailable':False,'retainedExactPngSha256':'sha256:470ca386b735383103c7b9c458015f4ea3354587bd8e41dde4cbb30fa97f3dc0','retrospectiveKeepDocumentation':{'path':str(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()},'currentIndependentReviewRecords':[{'role':r,'path':str(O.parent/('chemie-b008-current517-native-context-independent-'+r+'-20261010-v1')),'goalId':gid}for r in ['a','b']],'scientificApprovalAddedByThisDocumentation':False,'newGeneration':False})
updated['artifactClasses']['goalVisualizations']['retrospectiveProvenanceAddenda']=notes
p=O/'candidate/ai-transparency-inventory.measured-current398.future-active.json';p.write_text(json.dumps(updated,ensure_ascii=False,indent=2)+'\n');dest=C/'docs/legal/ai-transparency-inventory.json';assert dest.parent.resolve().is_relative_to(C);dest.unlink();dest.write_bytes(p.read_bytes())
r=subprocess.run(['node','scripts/check_ai_transparency_inventory.mjs'],cwd=C,capture_output=True,text=True);f=O/'checks/normal-inventory-final.terminal.actual.json';assert not f.exists();f.write_text(json.dumps({'argv':['node','scripts/check_ai_transparency_inventory.mjs'],'actualExitCode':r.returncode,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stdout':r.stdout,'stderr':r.stderr,'normalRulesChanged':False,'activeWrites':[]},ensure_ascii=False,indent=2)+'\n');print(r.returncode,r.stdout,r.stderr,flush=True);assert r.returncode==0
