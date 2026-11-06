#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Measure explicit immutable prerequisite variants in one current Git catalog.
No application command or source/QA write is provided.
"""
from pathlib import Path
import copy,hashlib,json,subprocess,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'scripts'))
import canonical_goal_identity_migration as cj
sys.path.insert(0,str(Path(__file__).resolve().parent))
from verify_informatics_ordinary_prerequisites_hypothesis import relations,definition_delta,cyclic_keys,require


def sha(raw):return hashlib.sha256(raw).hexdigest()

def inspect(context):
    base=context['catalogCommit'];documents=[]
    require(subprocess.check_output(['git','-C',str(ROOT),'rev-parse',base+'^{commit}'],text=True).strip()==base,'Wrong catalog commit')
    for binding in [context['peerCore26'],context['motivated26'],context['turingFollowup'],context['mathLedger']]:
        require(sha((ROOT/binding['path']).read_bytes())==binding['sha256'],'Bound review/data artifact changed: '+binding['path'])
    for binding in context['catalogSources']:
        raw=subprocess.check_output(['git','-C',str(ROOT),'show',base+':'+binding['path']])
        require(sha(raw)==binding['sha256'] and (ROOT/binding['path']).read_bytes()==raw,'Current catalog mismatch: '+binding['path'])
        document=json.loads(raw);require(document['landscapeId']==binding['landscapeId'],'Wrong catalog owner');documents.append(document)
    require(len(documents)==21 and len({d['landscapeId'] for d in documents})==21,'Complete fixed catalog required')
    source=next(d for d in documents if d['landscapeId']==context['source']['landscapeId']);owner=source['landscapeId']
    before,be,bg,ba,bc=relations(documents);index={k:i for i,k in enumerate(before.keys)};atom_index={k:i for i,k in enumerate(before.atom_keys)}
    peer=json.loads((ROOT/context['peerCore26']['path']).read_text());terminals={c['terminal']['goalId'] for c in peer['cases']};require(len(terminals)==6,'Six unchanged terminal payloads required')
    expected_counts={'baseline':0,'frozen-core26':26,'motivated-core26':26,'turing-only1':1,'motivated-core26-plus-turing27':27}
    require(set(context['variants'])==set(expected_counts),'Unexpected variant set')
    result={'status':'current-Math-read-only-variant-demand-analysis-NOT-QA-or-application-approval','catalogCommit':base,'mathSourceSha256':next(b['sha256'] for b in context['catalogSources'] if b['landscapeId']=='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'),'mathLedgerSha256':context['mathLedger']['sha256'],'infoSource':context['source'],'goalKeys':len(before.keys),'atomicKeys':len(before.atom_keys),'dataApplied':False,'qaApprovalClaimed':False,'variants':{}}
    for name,variant in context['variants'].items():
        ops=variant['operations'];require(len(ops)==expected_counts[name] and sha(cj.stable(ops))==variant['operationsCanonicalSha256'],'Operation/count pin differs')
        candidate=copy.deepcopy(source);seen=set()
        for op in ops:
            parts=op['path'].split('/');require(op['op']=='replace' and op['file']==context['source']['path'] and len(parts)==4 and parts[:2]==['','goals'] and parts[3]=='requires','Only exact primary requires pointers')
            g=candidate['goals'][int(parts[2])];id=op['guardGoalId'];require(g['id']==id and id not in seen and id not in terminals and not id.startswith('875cb53c-'),'Wrong/repeated/terminal/held author');seen.add(id)
            require(not g.get('contains') and not g.get('examData') and not g.get('extendedData',{}).get('examData'),'Only ordinary atomic authors')
            require(sha(cj.stable(g))==op['guardGoalCanonicalSha256'] and g['requires']==op['guardRequiresBefore'],'Goal field/payload guard mismatch')
            require(len(op['value'])==len(set(op['value'])),'Duplicate prerequisite');g['requires']=copy.deepcopy(op['value'])
        require(sha((json.dumps(candidate,ensure_ascii=False,indent=2)+'\n').encode())==variant['hypotheticalSourceSha256'],'Hypothetical bytes differ')
        for old,new in zip(source['goals'],candidate['goals']):require({k:v for k,v in old.items() if k!='requires'}=={k:v for k,v in new.items() if k!='requires'},'Non-requires mutation')
        after,ae,ag,aa,ac=relations([candidate if d['landscapeId']==owner else d for d in documents])
        gd=definition_delta(before.keys,bg,ag,before);ad=definition_delta(before.atom_keys,ba,aa,before)
        gcb,gca=cyclic_keys(before.keys,bg),cyclic_keys(after.keys,ag);acb,aca=cyclic_keys(before.atom_keys,ba),cyclic_keys(after.atom_keys,aa)
        require(not(set(gca)-set(gcb)) and not(set(aca)-set(acb)),'New cycle participants')
        terminal_rows=[]
        for id in sorted(terminals):
            key=owner+':'+id;require(before.nodes[key][1]==after.nodes[key][1],'Terminal payload changed')
            terminal_rows.append({'goalId':id,'payloadUnchanged':True,'goalDemandUnchanged':bg[index[key]]==ag[index[key]],'atomicDemandUnchanged':ba[atom_index[key]]==aa[atom_index[key]]})
        motivation=[];orientation=owner+':d848ceb9-cd73-5a13-9407-f3364764c223';bit=1<<index[orientation]
        for op in ops:
            if 'motivationJustification' in op:
                key=owner+':'+op['guardGoalId'];motivation.append({'goalId':op['guardGoalId'],'orientationDemandBefore':bool(bg[index[key]]&bit),'orientationDemandAfter':bool(ag[index[key]]&bit),'newSubjectCompetenceRequiredByMotivationEdge':False})
        result['variants'][name]={'operationCount':len(ops),'operationsCanonicalSha256':variant['operationsCanonicalSha256'],'hypotheticalSourceSha256':variant['hypotheticalSourceSha256'],'globalGoalDeltas':gd,'globalAtomicDeltas':ad,'changedForeignGoalSources':sum(not r['sourceKey'].startswith(owner+':') for r in gd),'changedForeignAtomicSources':sum(not r['sourceKey'].startswith(owner+':') for r in ad),'cycleComponentCountsBefore':bc,'cycleComponentCountsAfter':ac,'goalCyclicKeysBefore':gcb,'goalCyclicKeysAfter':gca,'atomicCyclicKeysBefore':acb,'atomicCyclicKeysAfter':aca,'terminalDemands':terminal_rows,'preservedExistingMotivationDemands':motivation}
    return result

if __name__=='__main__':
    try:
        path=ROOT/'docs/dev/ci-graph-repairs/informatics-core26-current-math-analysis-context-2026-11-06.json'
        print(json.dumps(inspect(json.loads(path.read_text())),ensure_ascii=False,indent=2))
    except (ValueError,KeyError,IndexError,OSError,subprocess.CalledProcessError) as error:
        print(str(error),file=sys.stderr);raise SystemExit(1)
