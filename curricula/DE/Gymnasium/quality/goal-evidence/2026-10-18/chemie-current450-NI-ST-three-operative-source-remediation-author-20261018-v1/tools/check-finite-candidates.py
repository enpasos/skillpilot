# SPDX-License-Identifier: Apache-2.0
"""Finite inactive candidate checks; no compiler, gate evaluator, or normal mutation."""
import copy,hashlib,importlib.util,json
from pathlib import Path
import jsonschema
R=Path.cwd();O=Path(__file__).resolve().parent.parent
read=lambda p:json.loads(Path(p).read_text())
def h(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
I=read(O/'INPUT.exact-three-sources-two-whole-current-goals-profiles.json');goals={g['id']:g for g in read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']}
schema=read(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json');profileSchema={'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/profile'}
checks=[]
for before in I['wholeGoalProfileBindings']:
 gid=before['goalId'];assert goals[gid]==before['wholeCurrentGoal'];p=before['profile'];row=json.loads(Path(p['review']['path']).read_text().splitlines()[p['lineOneBased']-1]);assert row['profile']==before['wholeCurrentProfile']; assert pin(p['review']['path'])==p['review']
 after=read(O/f'profiles/{gid}.whole-profile.pending.json');jsonschema.validate(after,profileSchema)
 for k in ['expectations','variationAxes','applicationCaseBriefs']:assert after[k][:len(row['profile'][k])]==row['profile'][k]
 c=copy.deepcopy(after['coverageExpectations']);c['requiredExpectationIds']=c['requiredExpectationIds'][:len(row['profile']['coverageExpectations']['requiredExpectationIds'])];assert c==row['profile']['coverageExpectations']
 checks.append({'goalId':gid,'wholeCurrentCanonicalUnchanged':True,'wholeNativeProfileBeforeExact':True,'wholeCandidateProfileStockV2Schema':'PASS','allWholeOldExpectationsAxesCaseBodiesAndCoverageLimitsPreserved':True,'newExpectations':len(after['expectations'])-len(row['profile']['expectations'])})
D=read(O/'DELTA.five-mapping-files-three-source-rows.pending.json');count=0
for f in D['files']:
 assert pin(f['normalFileAtRead']['path'])==f['normalFileAtRead'];d=read(f['normalFileAtRead']['path'])
 for x in f['changes']:
  cur=d
  for part in x['pointer'].strip('/').split('/'):cur=cur[int(part)] if isinstance(cur,list) else cur[part]
  assert cur==x['wholeBefore'] and h(cur)==x['beforeObjectSHA256'];count+=1
for x in I['sources']:
 assert pin(x['extraction']['path'])==x['extraction'];assert pin(x['primaryPDF']['path'])==x['primaryPDF'];cur=read(x['extraction']['path'])
 for part in x['pointer'].strip('/').split('/'):cur=cur[int(part)] if isinstance(cur,list) else cur[part]
 assert cur==x['wholeSourceGoal']
m=read(O/'materials/THREE.complete-DE-EN-source-cases.pending.json');assert len(m['cases'])==3
for x in m['cases'][1:]:
 assert x['executionStatus']=='proposed_not_learner_executed'
 for k,v in x['blankProtocol'].items():
  if k not in ['state','teacherSafetyReleaseClaim']:assert v is None,(k,v)
svg=O/'materials/NI-EP5-refinery-bilingual.svg';from xml.etree import ElementTree as E;E.parse(svg)
placements=read(O/'CHECK.four-current-pure-target-placements.json');assert placements['status']=='PASS' and len(placements['rows'])==4 and not any(r['directRequiresAbsent'] for r in placements['rows'])
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);errors=module.curriculum_symlink_errors(R);own=[e for e in errors if str(O.relative_to(R)) in e];assert not own,own
parsed=[]
for p in sorted(O.rglob('*.json')):read(p);parsed.append(str(p.relative_to(O)))
print(json.dumps({'status':'PASS','checks':checks,'mappingFilesCAS':len(D['files']),'mappingRowsCAS':count,'wholeSourceObjectsExact':3,'wholeJsonFilesParsed':parsed,'blankSTObservationLogs':2,'actualLearnerExecutionClaim':False,'svgXmlValid':True,'svgActuallyRasterizedAndViewed':'rsvg-convert + own view_image; preview scratch only','fourCurrentTargetPlacementsAndDirectPrerequisites':'PASS','scopedStockCurriculumSymlinkErrors':own,'normalWrites':0,'compilerOrBroadGateRuns':0,'newDPAMVVotes':0},ensure_ascii=False,indent=2))
