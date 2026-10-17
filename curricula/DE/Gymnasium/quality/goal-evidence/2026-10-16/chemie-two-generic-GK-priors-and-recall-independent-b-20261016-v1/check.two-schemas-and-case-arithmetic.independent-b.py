# SPDX-License-Identifier: Apache-2.0
import json, math, pathlib
import jsonschema

E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
O=pathlib.Path(__file__).resolve().parent
A=E/'chemie-two-generic-GK-prior-boundaries-and-existing-recall-selection-author-20261016-v1'
cas=json.loads((A/'CAS.two-whole-ordinary-goals-and-two-generic-GK-views.author-inactive.json').read_text())
s=json.loads(pathlib.Path('docs/landscape-runtime.schema.json').read_text())
v=jsonschema.Draft202012Validator({'$ref':'#/$defs/goal','$defs':s['$defs']})
for op in cas['ordinaryGoalOperations']:
    assert not list(v.iter_errors(op['afterWhole']))
ps=json.loads(pathlib.Path('contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text())
pv=jsonschema.Draft202012Validator(ps)
for line in (O/'P2.actual-whole-two-incremental-independent-b.candidate.jsonl').read_text().splitlines():
    assert not list(pv.iter_errors(json.loads(line)))
x={
    'role':'Own executed arithmetic and raw schema checks after independent FIRST; no author content changes',
    'goalSchemas':2,'P2Schemas':2,'errors':0,
    'polarimetry':{
        'specificCaseA':6/(2*.05),
        'referenceSpecific':5.3/(1*.1),
        'referenceUncertainty':.1/(1*.1),
        'glucoseReferenceInsideInterval':52 <= 52.7 <= 54,
        'fructoseReferenceOutsideInterval':not (52 <= -92.4 <= 54),
    },
    'electrolysis':{
        'caseACathodeWater':-.83-.2,
        'caseAAnodes':[1.23+.6,1.36+.1],
        'caseARequiredVoltage':(1.36+.1)-(-.83-.2)+.2,
        'freshCaseAOxygen':1.23+.05,
        'freshCaseARequiredVoltage':(1.23+.05)-(-.83-.2)+.2,
        'caseBRequiredVoltage':(1.07+.1)-.34+.12,
        'freshCaseBAnodes':[1.23+.15,1.07+.5],
    },
    'ownVerifierAttempt':{'firstInlineAttempt':'Python syntax error before execution: missing space before and keyword','candidateDefect':False,'correctedReadableScriptActualRun':True},
    'notationPrecisionAddendum':'ADDENDUM.own-equation-notation-precision.not-author-finding.json',
    'nativeD2Pending':True,'HumanApproval':False,'HumanTrial':False,'M7Claim':False,
}
assert math.isclose(x['electrolysis']['caseARequiredVoltage'],2.69)
assert math.isclose(x['electrolysis']['freshCaseARequiredVoltage'],2.51)
assert math.isclose(x['electrolysis']['caseBRequiredVoltage'],.95)
(O/'CHECK.actual-two-schemas-and-independent-case-arithmetic.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'goalSchemas':2,'P2Schemas':2,'caseArithmetic':'PASS','nativeD2':'pending'}))
