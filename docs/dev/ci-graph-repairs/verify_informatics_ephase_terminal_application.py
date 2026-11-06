#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only live E9 proof plus explicitly historical unchanged E25 replays.

Never rewrites the frozen draft or its hashes. The old f95 source is obtained
from the exact accepted Git object, then mounted read-only at its original path.
The live00bc catalog is independently compared with the complete original graph.
"""
from pathlib import Path
import copy, hashlib, importlib.util, json, os, subprocess, sys, tempfile
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
BASE = '5c9ff83586c407fd9189207c38238400c74bce51'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
BEFORE = 'f95c0a1186de2469e87c626d3c6b53895b1111bb3e5164cab8b1aabb78354372'
AFTER = '00bcdbaf0723441eea0e33dfef36c674ed865b61d7009705cd6c83241a897422'
PROPOSAL = 'docs/dev/ci-graph-repairs/informatics-ephase-terminal-normalization-proposal-2026-11-06.json'
PROPOSAL_SHA = 'a0ee0ba440680c60f72630be411305b57109499358a354b0c89d1c6fe8d33741'
OP_SHA = '67fb28fb1022452ba64ba3f149071249f56194025172f4752e7ebc562fd77277'
E25_INPUT = 'docs/dev/ci-graph-repairs/informatics-e25-terminal-candidate-2026-11-06.review-input.json'
E25_INPUT_SHA = '03e3b200d435d0644835c8b160fc7fd79c0cf6f206bb93501f19d7ccf86cb6e4'
E25_PAYLOAD = 'docs/dev/ci-graph-repairs/informatics-e25-terminal-candidate-2026-11-06.exam-data.json'
E25_PAYLOAD_SHA = '23e4e9c34f051771de12aa32a8e459a983aabe27944ba4476237f103bf59c61e'
E25_VERIFIER = 'docs/dev/ci-graph-repairs/informatics-e25-terminal-reference-2026-11-06/verify_candidate.py'
SEQUENTIAL_VERIFIER = 'docs/dev/ci-graph-repairs/verify_informatics_ephase_terminal_normalization.py'

def sha(raw): return hashlib.sha256(raw).hexdigest()
def stable(obj): return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
def require(ok, message):
    if not ok: raise ValueError(message)
def read(path): return (ROOT/path).read_bytes()
def git(path): return subprocess.check_output(['git','-C',str(ROOT),'show',BASE+':'+path])
def main():
    manifest_raw = read(PROPOSAL); require(sha(manifest_raw) == PROPOSAL_SHA, 'Proposal changed')
    m = json.loads(manifest_raw); require(m['baseCommit'] == BASE, 'Different proposal base')
    require(sha(stable(m['operations'])) == OP_SHA, 'Different nine operations')
    require(sha(read(E25_INPUT)) == E25_INPUT_SHA and sha(read(E25_PAYLOAD)) == E25_PAYLOAD_SHA, 'Frozen E25 artifact changed')
    frozen = json.loads(read(E25_INPUT)); frozen_artifact_map = {x['path']:x['sha256'] for x in frozen['artifacts']}
    for path,digest in frozen_artifact_map.items(): require(sha(read(path)) == digest, 'Frozen E25 input changed: '+path)
    for binding in m['kernels']+[m['contentReview']]: require(sha(read(binding['path'])) == binding['sha256'], 'Bound kernel/content review changed')
    require(len(m['operations']) == 9 and len(m['catalogSources']) == 21, 'Unexpected scope')
    actual_paths = sorted(str(p.relative_to(ROOT)) for p in (ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json'))
    require(actual_paths == sorted(x['path'] for x in m['catalogSources']), 'Canonical universe differs')
    originals=[]; currents=[]; pin_rows=[]
    for binding in m['catalogSources']:
        old=git(binding['path']); current=read(binding['path'])
        require(sha(old) == binding['sha256'], 'Historical input mismatch')
        expected=AFTER if binding['path'] == SOURCE else binding['sha256']
        require(sha(current) == expected, 'Live input differs: '+binding['path'])
        originals.append(json.loads(old));currents.append(json.loads(current))
        pin_rows.append({'path':binding['path'],'landscapeId':binding['landscapeId'],'beforeSha256':sha(old),'liveSha256':sha(current)})
    original_source = git(SOURCE); require(sha(original_source) == BEFORE, 'Not the accepted historical f95')
    # Replay the exact authored fields, without editing any actual file.
    candidate = json.loads(original_source); before_doc=copy.deepcopy(candidate)
    for op in m['operations']:
        parts=op['path'].split('/');require(parts[:2]==['','goals'] and parts[-1]=='requires' and len(parts)==4,'Different field')
        goal=candidate['goals'][int(parts[2])]; require(goal['id'] == op['guardGoalId'],'Wrong goal')
        require(sha(stable(goal)) == op['guardGoalCanonicalSha256'] and goal['requires'] == op['guardRequiresBefore'],'Sequential whole-goal guard differs')
        require(op['value'] == [r for r in goal['requires'] if r != op['removedGoalId']] and len(op['value'])+1 == len(goal['requires']),'Not one bounded removal')
        goal['requires']=op['value']
    candidate_bytes=(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n').encode()
    require(sha(candidate_bytes)==AFTER and candidate_bytes==read(SOURCE),'Live bytes are not the exact nine-operation candidate')
    owner=m['source']['landscapeId']; terminal=m['terminalBefore']['id']; key=owner+':'+terminal
    original_goal=next(g for g in before_doc['goals'] if g['id']==terminal); current_goal=next(g for g in candidate['goals'] if g['id']==terminal)
    require(current_goal['requires']==m['expectedAfterRequires'] and 'ace0c141-9e7c-546e-914f-64c24d42d85d' in current_goal['requires'],'Final array/held direct prerequisite differs')
    require({k:v for k,v in original_goal.items() if k!='requires'}=={k:v for k,v in current_goal.items() if k!='requires'},'Non-requires payload changed')
    # Same bound kernel; the separate Goal and atomic relations are never conflated.
    kernel=m['kernels'][0]; spec=importlib.util.spec_from_file_location('e9_bound_global_kernel',ROOT/kernel['path']); graph=importlib.util.module_from_spec(spec);spec.loader.exec_module(graph)
    before=graph.Catalog(originals);live=graph.Catalog(currents);require(before.keys==live.keys and before.atom_keys==live.atom_keys,'Identity universe changed')
    b_edges,_=before.effective();l_edges,_=live.effective()
    bg,bgc=graph.closure(before.keys,b_edges);lg,lgc=graph.closure(live.keys,l_edges)
    ba,bac=graph.closure(before.atom_keys,before.atomic(b_edges));la,lac=graph.closure(live.atom_keys,live.atomic(l_edges))
    require(bg==lg and ba==la and (bgc,bac)==(lgc,lac)==(0,0),'Actual global closure/cycles changed')
    require(graph.digest_relation(live.keys,lg,'R_effective+')==m['proof']['globalGoalClosureBeforeAfterSha256'],'Goal relation digest differs')
    require(graph.digest_relation(live.atom_keys,la,'R_atomic+')==m['proof']['globalAtomicClosureBeforeAfterSha256'],'Atomic relation digest differs')
    for case in m['cases']:
        if case['decision']=='hold':continue
        live.validate_path(l_edges,case['survivingPath']);live.validate_origins(case['survivingPath'],case['finalSurvivingOriginEvidence'])
    # Old verifier is expected to reject the different live snapshot.
    stale=subprocess.run([sys.executable,'-B',str(ROOT/E25_VERIFIER)],cwd=ROOT,capture_output=True,text=True)
    require(stale.returncode==1 and 'Active source changed since bounded draft review input' in stale.stderr,'Frozen verifier failed for an unexpected reason, or its pin was weakened')
    replays=[]
    with tempfile.TemporaryDirectory(prefix='historical-e25-f95-',dir=ROOT/'tmp') as temp:
        historic=Path(temp)/'explicit-historical-f95.json'
        with historic.open('xb') as out:
            out.write(original_source);out.flush();os.fsync(out.fileno())
        os.chmod(historic,0o644)
        require(historic.stat().st_nlink==1 and sha(historic.read_bytes())==BEFORE,'Historical overlay bytes/inode differ')
        for label,script in [('unchanged-frozen-E25-verifier',E25_VERIFIER),('unchanged-nine-sequential-proposal-verifier',SEQUENTIAL_VERIFIER)]:
            command=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--ro-bind',str(historic),str(ROOT/SOURCE),'--chdir',str(ROOT),'--',sys.executable,'-B',str(ROOT/script)]
            result=subprocess.run(command,cwd=ROOT,capture_output=True,text=True)
            require(result.returncode==0,'Historical replay failed '+label+': '+result.stderr[-2000:])
            replays.append({'label':label,'script':script,'scriptSha256':sha(read(script)),'exitCode':result.returncode,'overlaySourceSha256':BEFORE,'overlayGitCommit':BASE,'readOnlyOverlay':True,'networkNamespaceUnshared':True,'stdout':json.loads(result.stdout)})
    for row in pin_rows:require(sha(read(row['path']))==row['liveSha256'],'Live input changed during replay')
    return {'status':'PASS-live-E9-plus-explicit-historical-E25-replay','dataWritten':False,'proposalSha256':PROPOSAL_SHA,'operationsCanonicalSha256':OP_SHA,'liveCatalogPins':pin_rows,'actualLiveDelta':{'before':BEFORE,'after':AFTER,'changedField':'/goals/277/requires','removedOrigins':9,'goalNodes':len(live.keys),'atomicNodes':len(live.atom_keys),'globalGoalChangedSources':0,'globalAtomicChangedSources':0,'cycleComponents':[lgc,lac],'heldAceDirectlyRetained':True,'allFinalWitnessesValid':True,'nonRequiresFieldsTaskSolutionScoringCoverageAndMetadataIdentical':True},'frozenE25':{'payloadSha256':E25_PAYLOAD_SHA,'reviewInputSha256':E25_INPUT_SHA,'frozenArtifactCount':len(frozen_artifact_map),'allOriginalArtifactBytesUnchanged':True,'unchangedVerifierLiveExitCode':stale.returncode,'liveFailureReason':'Active source changed since bounded draft review input; expected historical pin mismatch','historicalReplays':replays},'boundary':'Historical artifact replay and actual dependency-delta proof only. The E25 draft remains unapplied/draft, actual generic live examData is untouched, GK24/25 remains open. No P/QA/release/mastery/state or new current-source acceptance is granted.'}
if __name__=='__main__':
    try:print(json.dumps(main(),ensure_ascii=False,indent=2))
    except (ValueError,OSError,KeyError,subprocess.CalledProcessError) as error:
        print(str(error),file=sys.stderr);raise SystemExit(1)
