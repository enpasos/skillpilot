#!/usr/bin/env python3
"""One closed non-input lifecycle fact; never manufactures a PID value."""
from identity_qa_read_trace import number,require,traced_pid


def prove_aborted_identity_probe(events,event,groups,observed_namespace_ids):
    """Only the actual getpid entry/resume overlapping same-group exit0.

    Callers supply their existing clone-lineage and *already observed* numeric
    group identities. Both the concrete earlier getpid and exit witness must
    also be in these same recorded events. Reads/other syscalls are not covered.
    """
    require(event in events,'Aborted identity event is not in the recorded events')
    start,end,pid,operation,args,result=event
    require(operation=='getpid' and args==[''] and result=='?' and start<end,
            'Only an actual unfinished getpid with no returned value is covered')
    require(pid in groups,'Aborted getpid lacks actual clone/group lineage')
    group=groups[pid]
    require(group in observed_namespace_ids and observed_namespace_ids[group]>0,
            'Aborted getpid group has no already observed identity')
    identity=[]
    for candidate in events:
        a,b,other,op,fields,value=candidate
        if op!='getpid' or fields!=[''] or b>start or groups.get(other)!=group or value=='?':
            continue
        try:
            returned,host=number(value),traced_pid(value)
        except ValueError:
            continue
        if returned==observed_namespace_ids[group] and host==group:
            identity.append(candidate)
    require(identity,'Earlier numeric group identity is not proved by the same recorded events')
    witnesses=[candidate for candidate in events
               if candidate[3]=='exit_group' and candidate[4]==['0'] and candidate[5]=='?'
               and groups.get(candidate[2])==group
               and max(candidate[0],start)<min(candidate[1],end)]
    require(witnesses,'No simultaneous successful exit_group(0) of this same thread group')
    witness=min(witnesses,key=lambda item:item[0])
    prior=max(identity,key=lambda item:item[1])
    return {'category':'aborted-non-input-identity-observation','operation':'getpid','hostPid':pid,'threadGroupHostPid':group,
            'entry':start,'resume':end,'returnedPidValue':None,'identityEvidence':False,'namespaceValueDerived':False,
            'priorNumericGroupIdentityEntry':prior[0],
            'exitWitness':{'hostPid':witness[2],'entry':witness[0],'resume':witness[1],'exitStatus':0},
            'inputReadSkipped':False,'exitEvidenceSkipped':False}
