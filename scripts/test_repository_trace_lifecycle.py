#!/usr/bin/env python3
"""Real frozen recorder bytes plus abstract near-case argument controls."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode=True
from identity_qa_read_trace import calls,number,traced_pid
from identity_qa_trace_lifecycle import prove_aborted_identity_probe

EVIDENCE=None
RAW_SHA='1226d4c2b13dbe0429f0a8522c0b4f40ce91638d2d38e8907166bf08c67008da'
FACTS=[]


class LifecycleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.path=Path(__file__).resolve().parents[1]/'qa-artifacts/ci-contract-audit/2026-11-07/node-vm-runtime-observation/lifecycle-positive-recorder.strace.gz'
        raw=gzip.decompress(cls.path.read_bytes())
        if hashlib.sha256(raw).hexdigest()!=RAW_SHA:raise RuntimeError('Original frozen recorder bytes differ')
        cls.events=calls(raw.decode())
        cls.event=next(e for e in cls.events if e[3]=='getpid' and e[5]=='?')
        cls.groups={cls.events[0][2]:cls.events[0][2]};cls.identities={}
        for event in cls.events:
            start,end,pid,op,args,result=event
            if start>=cls.event[0]:break
            if op in ('clone','clone3','fork','vfork') and not result.startswith('-1 '):
                child=traced_pid(result)
                cls.groups[child]=cls.groups[pid] if 'CLONE_THREAD' in ','.join(args) else child
            if op=='getpid' and result!='?':
                if traced_pid(result)!=cls.groups[pid]:raise RuntimeError('Recorded numeric getpid group differs')
                cls.identities[cls.groups[pid]]=number(result)
        cls.group=cls.groups[cls.event[2]]
        cls.exit=next(e for e in cls.events if e[3]=='exit_group' and e[4]==['0'] and cls.groups.get(e[2])==cls.group
                     and e[0]<=cls.event[0]<cls.event[1]<=e[1])

    def test_real_recorded_overlap_is_noninput_without_a_derived_pid(self):
        fact=prove_aborted_identity_probe(self.events,self.event,self.groups,self.identities)
        self.assertIsNone(fact['returnedPidValue'])
        self.assertFalse(fact['identityEvidence'])
        self.assertFalse(fact['namespaceValueDerived'])
        self.assertFalse(fact['inputReadSkipped'])
        self.assertFalse(fact['exitEvidenceSkipped'])
        self.assertEqual(fact['exitWitness']['exitStatus'],0)
        self.assertEqual(hashlib.sha256(gzip.decompress(self.path.read_bytes())).hexdigest(),RAW_SHA)
        FACTS.append(fact)

    def test_missing_group_or_prior_identity_stays_closed(self):
        groups=dict(self.groups);del groups[self.event[2]]
        with self.assertRaisesRegex(ValueError,'clone/group lineage'):
            prove_aborted_identity_probe(self.events,self.event,groups,self.identities)
        with self.assertRaisesRegex(ValueError,'already observed identity'):
            prove_aborted_identity_probe(self.events,self.event,self.groups,{})
        events=[e for e in self.events if not(e[3]=='getpid' and e[5]!='?' and self.groups.get(e[2])==self.group)]
        with self.assertRaisesRegex(ValueError,'Earlier numeric group identity'):
            prove_aborted_identity_probe(events,self.event,self.groups,self.identities)

    def test_wrong_group_missing_exit_or_failed_exit_stays_closed(self):
        groups=dict(self.groups);groups[self.exit[2]]=-1
        with self.assertRaisesRegex(ValueError,'simultaneous successful exit_group'):
            prove_aborted_identity_probe(self.events,self.event,groups,self.identities)
        events=[e for e in self.events if e!=self.exit]
        with self.assertRaisesRegex(ValueError,'simultaneous successful exit_group'):
            prove_aborted_identity_probe(events,self.event,self.groups,self.identities)
        replacement=(*self.exit[:4],['1'],self.exit[5])
        events=[replacement if e==self.exit else e for e in self.events]
        with self.assertRaisesRegex(ValueError,'simultaneous successful exit_group'):
            prove_aborted_identity_probe(events,self.event,self.groups,self.identities)

    def test_real_input_read_is_never_classified_as_aborted_identity(self):
        read=next(e for e in self.events if e[3]=='read')
        with self.assertRaisesRegex(ValueError,'Only an actual unfinished getpid'):
            prove_aborted_identity_probe(self.events,read,self.groups,self.identities)

    def test_no_overlap_other_result_and_unrecorded_event_stay_closed(self):
        later=(self.exit[0]+100,self.exit[1]+100,*self.exit[2:])
        events=[later if e==self.exit else e for e in self.events]
        with self.assertRaisesRegex(ValueError,'simultaneous successful exit_group'):
            prove_aborted_identity_probe(events,self.event,self.groups,self.identities)
        other=(*self.event[:5],'? unknown')
        events=[other if e==self.event else e for e in self.events]
        with self.assertRaisesRegex(ValueError,'Only an actual unfinished getpid'):
            prove_aborted_identity_probe(events,other,self.groups,self.identities)
        with self.assertRaisesRegex(ValueError,'not in the recorded events'):
            prove_aborted_identity_probe(self.events,other,self.groups,self.identities)


if __name__=='__main__':
    parser=argparse.ArgumentParser(add_help=False);parser.add_argument('--evidence-dir',type=Path)
    known,rest=parser.parse_known_args();EVIDENCE=known.evidence_dir
    if EVIDENCE:EVIDENCE.mkdir(parents=True,exist_ok=False)
    program=unittest.main(argv=[sys.argv[0],*rest],exit=False)
    if EVIDENCE:
        (EVIDENCE/'results.json').write_text(json.dumps({'purpose':'real-recorded-lifecycle-positive-and-abstract-argument-negatives',
            'testsRun':program.result.testsRun,'failures':len(program.result.failures),'errors':len(program.result.errors),'skips':len(program.result.skipped),
            'originalRecorderRawSha256':RAW_SHA,'positiveFacts':FACTS,'newActiveProducers':0,
            'rawRecorderBytesModified':False,'traceCapabilityMintedFromFixture':False},indent=2)+'\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
