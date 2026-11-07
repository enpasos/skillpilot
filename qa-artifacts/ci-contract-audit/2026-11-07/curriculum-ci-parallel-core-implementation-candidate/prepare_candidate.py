from pathlib import Path
import json,hashlib,re,copy,difflib,yaml
R=Path('/home/enpasos/projects/skillpilot');W=Path('/dev/shm/curriculum-ci-parallel-core-candidate-20261107');P=R/'qa-artifacts/ci-contract-audit/2026-11-07/curriculum-ci-parallel-core-proposal';C=W/'candidate-root';sha=lambda b:hashlib.sha256(b).hexdigest()
assert sha((P/'inventory.json').read_bytes())=='3da7f2e4bdb78cbf3dac2e41ca3fd64f38f0afb0dceb898d16d4034a607077ea';assert sha((P/'seal.json').read_bytes())=='b6c21e13d7400c536e625c1468646a6ee0cc499ea11d5cadb2bd6eea3c4a1e1c'
for row in json.loads((P/'inventory.json').read_text())['payloads']:
 b=(P/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'],row['path']
pins=json.loads((P/'input-pins.json').read_text())['files']
for row in pins:assert sha((R/row['path']).read_bytes())==row['sha256'],row['path']
(W/'input-pins.before.json').write_text(json.dumps(pins,indent=2)+'\n')
# Private sparse source mirror. Every unchanged leaf remains a read-only source symlink.
C.mkdir(exist_ok=True)
for p in R.iterdir():
 if p.name not in ['.github','scripts','app']:
  q=C/p.name
  if not q.exists():q.symlink_to(p,target_is_directory=p.is_dir())
for name in ['scripts','app','.github']:
 q=C/name;q.mkdir(exist_ok=True)
 for p in (R/name).iterdir():
  if (name=='scripts' and p.name=='plugin_ci_workflows.test.mjs') or (name=='.github' and p.name=='workflows'):continue
  dst=q/p.name
  if not dst.exists():dst.symlink_to(p,target_is_directory=p.is_dir())
(C/'.github/workflows').mkdir(exist_ok=True)
for p in (R/'.github/workflows').iterdir():
 if p.name=='ci.yml':continue
 dst=C/'.github/workflows'/p.name
 if not dst.exists():dst.symlink_to(p,target_is_directory=p.is_dir())
(C/'.github/workflows/ci.yml').write_bytes((P/'ci.proposed.yml').read_bytes())
originalTests=(R/'scripts/plugin_ci_workflows.test.mjs').read_bytes(); additions=(P/'workflow-test-additions.mjs').read_bytes();candidateTests=originalTests+b'\n'+additions
(C/'scripts/plugin_ci_workflows.test.mjs').write_bytes(candidateTests)
# Both structural and exact textual verification are required.
old=(R/'.github/workflows/ci.yml').read_text();new=(C/'.github/workflows/ci.yml').read_text();a=yaml.safe_load(old);b=yaml.safe_load(new)
assert {k:v for k,v in a.items() if k!='jobs'}=={k:v for k,v in b.items() if k!='jobs'}
assert set(b['jobs'])==set(a['jobs'])|{'curriculum-ci'}
otherJobs=[j for j in a['jobs'] if j!='graph-validation']
for j in otherJobs:assert a['jobs'][j]==b['jobs'][j],j
core=b['jobs']['graph-validation'];final=b['jobs']['curriculum-ci'];oldJob=a['jobs']['graph-validation']
assert {k:v for k,v in oldJob.items() if k not in ['name','needs','steps']}=={k:v for k,v in core.items() if k not in ['name','steps']}
assert {k:v for k,v in oldJob.items() if k not in ['name','needs','steps']}=={k:v for k,v in final.items() if k not in ['name','needs','if','steps']}
assert core['name']=='Curriculum source contracts' and 'needs' not in core and 'if' not in core
assert final['name']=='Curriculum CI' and final['needs']==['graph-validation','goal-book-publication'] and final['if']=='${{ always() }}'
assert final['steps'][0]['name']=='Require successful curriculum core and verified book build'
assert len(oldJob['steps'])==85 and len(core['steps'])==69 and len(final['steps'])==27

def rawJobs(text):
 matches=list(re.finditer(r'^  ([\w-]+):\n',text,re.M));return text[:matches[0].start()],{m.group(1):text[m.start():matches[i+1].start() if i+1<len(matches) else len(text)] for i,m in enumerate(matches)}
def rawSteps(job):
 tail=job.split('    steps:\n',1)[1];matches=list(re.finditer(r'^      - ',tail,re.M));return [tail[m.start():matches[i+1].start() if i+1<len(matches) else len(tail)].rstrip('\n') for i,m in enumerate(matches)]
ap,aj=rawJobs(old);bp,bj=rawJobs(new);assert ap==bp
for j in otherJobs:assert aj[j]==bj[j],j
oldraw=rawSteps(aj['graph-validation']);coreraw=rawSteps(bj['graph-validation']);finalraw=rawSteps(bj['curriculum-ci']);allocation=json.loads((P/'step-allocation.json').read_text());assert len(oldraw)==85
rawlookup={'graph-validation':coreraw,'curriculum-ci':finalraw};structlookup={'graph-validation':core['steps'],'curriculum-ci':final['steps']};rows=[]
for i,row in enumerate(allocation['steps']):
 assert row['oldOrdinal']==i+1
 assert sha(oldraw[i].encode())==row['unchangedStepSha256'],(i+1,sha(oldraw[i].encode()),row['unchangedStepSha256'])
 actual=[]
 for job in ['graph-validation','curriculum-ci']:
  occurrences=[n for n,block in enumerate(rawlookup[job]) if block==oldraw[i]]
  for n in occurrences:assert structlookup[job][n]==oldJob['steps'][i]
  if occurrences:actual.append(job)
  assert len(occurrences)<=1
 assert actual==row['destinations'],(i+1,actual,row['destinations'])
 rows.append({'oldOrdinal':i+1,'destinations':actual,'exactBlockSha256':sha(oldraw[i].encode()),'structuredStepEquality':True})
oldset=set(oldraw);assert [x for x in coreraw+finalraw if x not in oldset]==[finalraw[0]]
# Preserve original command order within each assigned job. Duplicates are only the 10 explicit bootstrap steps.
for job in ['graph-validation','curriculum-ci']:
 expected=[oldraw[i] for i,row in enumerate(allocation['steps']) if job in row['destinations']]
 if job=='curriculum-ci':
  expected.remove(oldraw[13]);expected.insert(expected.index(oldraw[65]),oldraw[13])
 assert [x for x in rawlookup[job] if x in oldset]==expected
assert [r['oldOrdinal'] for r in rows if len(r['destinations'])==2]==[1,2,3,4,5,6,7,8,69,72]
report={'method':'independent PyYAML structure plus exact normalized-terminal-newline step blocks; no workflow commands executed','proposalInventoryVerified':True,'proposalSealVerified':True,'allOriginalInputPinsCurrent':True,'oldStepCount':85,'coreStepCount':69,'finalStepCount':27,'all85OriginalBlocksExact':True,'outerWorkflowByteIdentical':True,'unchangedOtherJobsByteIdentical':otherJobs,'bootstrapDuplicates':[1,2,3,4,5,6,7,8,69,72],'documentedOnlyRelativeStepMove':{'oldOrdinal':14,'immediatelyBeforeOldOrdinal':66},'newSemanticStepOnly':final['steps'][0]['name'],'allocation':rows}
(W/'structured-workflow-validation.json').write_text(json.dumps(report,indent=2)+'\n')
for relative in ['.github/workflows/ci.yml','scripts/plugin_ci_workflows.test.mjs']:
 before=(R/relative).read_text();after=(C/relative).read_text();target=W/('workflow.patch' if relative.endswith('ci.yml') else 'workflow-tests.patch');target.write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+relative,tofile='b/'+relative)))
assert candidateTests.startswith(originalTests) and candidateTests[len(originalTests):]==b'\n'+additions
print(json.dumps({'candidateRoot':str(C),'old':85,'core':69,'final':27,'byteExactOriginalBlocks':85,'normalTestAdditions':3,'newWorkflowSha256':sha(new.encode()),'newTestsSha256':sha(candidateTests)},indent=2))
