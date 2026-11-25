#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Input-driven full-assignment and immutable-predecessor regression controls."""
import argparse,copy,hashlib,importlib.util,json,pathlib,sys,unittest
sys.dont_write_bytecode=True
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--repository',type=pathlib.Path,required=True);p.add_argument('--generator-report',type=pathlib.Path,required=True);p.add_argument('--output',type=pathlib.Path,required=True);args=p.parse_args();assert not args.output.exists()
HERE=pathlib.Path(__file__).resolve().parent;spec=importlib.util.spec_from_file_location('source_companion_successor',HERE/'refresh-source-companions.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
ROOT=args.repository.resolve();raw=args.generator_report.read_bytes();reports={r['file']:r for r in json.loads(raw)}
witness_path=ROOT/module.PREFIX/'source-placement-witnesses.actual.json';witness_raw=witness_path.read_bytes();witness=json.loads(witness_raw)
cases=[]
for row in witness['views']:
 if row['file'] not in reports:continue
 for goal,expected in row['sourceAssignments'].items():cases.append((row['file'],goal,expected,reports[row['file']]['sourceAssignments'][goal]))
flat=next(c for c in cases if 'sourcePassages' not in c[2]);plain=next(c for c in cases if c[2].get('sourcePassages') and 'canonicalGoalId' not in c[2]['sourcePassages'][0]);identity=next(c for c in cases if c[2].get('sourcePassages') and 'canonicalGoalId' in c[2]['sourcePassages'][0])
def reject(test,case,mutate):
 file,goal,expected,current=case;changed=copy.deepcopy(current);mutate(changed)
 with test.assertRaises(AssertionError):module.validate_assignment(file,goal,expected,changed)
class SourceCompanionControls(unittest.TestCase):
 def test_all48_actual_full_report_assignments_keep_complete_values(self):
  before=copy.deepcopy(cases);counts={}
  for file,goal,expected,current in cases:
   form=module.validate_assignment(file,goal,expected,current);counts[form]=counts.get(form,0)+1
  self.assertEqual(counts,{'nestedWithoutRedundantGoalIdentity':36,'flatBY':4,'nestedWithGoalIdentity':8});self.assertEqual(cases,before)
 def test_missing_nested_passages_are_rejected(self):reject(self,plain,lambda v:v.pop('sourcePassages'))
 def test_missing_nested_source_path_is_rejected(self):reject(self,plain,lambda v:v['sourcePassages'][0].pop('sourcePath'))
 def test_wrong_nested_source_hash_is_rejected(self):reject(self,plain,lambda v:v['sourcePassages'][0].__setitem__('sourceSha256','0'*64))
 def test_wrong_nested_goal_identity_is_rejected(self):reject(self,plain,lambda v:v['sourcePassages'][0].__setitem__('canonicalGoalId','00000000-0000-0000-0000-000000000000'))
 def test_missing_retained_nested_goal_identity_is_rejected(self):reject(self,identity,lambda v:v['sourcePassages'][0].pop('canonicalGoalId'))
 def test_wrong_identity_in_retained_identity_form_is_rejected(self):reject(self,identity,lambda v:v['sourcePassages'][0].__setitem__('canonicalGoalId','00000000-0000-0000-0000-000000000000'))
 def test_missing_flat_source_hash_is_rejected(self):reject(self,flat,lambda v:v.pop('sourceSha256'))
 def test_wrong_flat_source_url_is_rejected(self):reject(self,flat,lambda v:v.__setitem__('sourceURL','https://invalid.example/'))
 def test_wrong_flat_source_year_is_rejected(self):reject(self,flat,lambda v:v.__setitem__('sourceTopicCodes',['Ph8.3']))
 def test_flat_cannot_acquire_an_unreviewed_nested_form(self):reject(self,flat,lambda v:v.__setitem__('sourcePassages',[]))
 def test_flat_representation_is_not_a_generic_missing_evidence_fallback(self):
  file,goal,expected,current=flat
  with self.assertRaises(AssertionError):module.validate_assignment('de-bw-lk.view.json',goal,expected,current)
 def test_changed_predecessor_pin_is_rejected_before_any_write(self):
  relative=next(iter(module.PREDECESSORS));prior=module.PREDECESSORS[relative];output=args.output.with_name(args.output.stem+'-must-not-be-created');argv=sys.argv[:];self.assertFalse(output.exists())
  try:
   module.PREDECESSORS[relative]='0'*64;sys.argv=[str(HERE/'refresh-source-companions.py'),'--repository',str(ROOT),'--generator-report',str(args.generator_report),'--output-dir',str(output)]
   with self.assertRaises(AssertionError):module.main()
   self.assertFalse(output.exists())
  finally:module.PREDECESSORS[relative]=prior;sys.argv=argv
class RecordedResult(unittest.TextTestResult):
 def addSuccess(self,test):super().addSuccess(test);executed.append({'case':test.id().split('.')[-1],'status':'PASS'})
executed=[];suite=unittest.defaultTestLoader.loadTestsFromTestCase(SourceCompanionControls);result=unittest.TextTestRunner(verbosity=2,resultclass=RecordedResult).run(suite)
assert witness_path.read_bytes()==witness_raw and args.generator_report.read_bytes()==raw
for relative,digest in module.PREDECESSORS.items():assert hashlib.sha256((ROOT/relative).read_bytes()).hexdigest()==digest
receipt={'schemaVersion':1,'status':'PASS' if result.wasSuccessful() else 'FAIL','testsRun':result.testsRun,'cases':executed,'generatorReport':{'views':len(reports),'sha256':hashlib.sha256(raw).hexdigest(),'retainedOutsideRepository':True},'sourceWitnessPredecessor':{'path':str(witness_path.relative_to(ROOT)),'sha256':hashlib.sha256(witness_raw).hexdigest()},'reproducerSha256':hashlib.sha256((HERE/'refresh-source-companions.py').read_bytes()).hexdigest(),'testScriptSha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'allHistoricalInputsUnchanged':True,'boundary':'Actual technical regression controls for complete source-assignment equality, not new source/content review votes.'}
with args.output.open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
raise SystemExit(0 if result.wasSuccessful() else 1)
