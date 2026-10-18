#!/usr/bin/env python3
"""Technical binding of Root-confirmed scope tuples; never normal AP or review."""
from pathlib import Path
import copy, datetime, hashlib, json, shutil
ROOT=Path('/home/enpasos/projects/skillpilot')
N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
PRE=N/'chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1'
OUT=N/'chemie-current447-confirmed-own-scope-binding-successor-technical-20261018-v1'
BASE=ROOT/OUT;BASE.mkdir(exist_ok=True)
CP=PRE/'C659.447ordinary-68memory.two-author-candidates.INACTIVE.json'
SEM=PRE/'SEM659.current654-classes-plus-five-author-assumptions.INACTIVE-TRANSPORT.json'
REG=Path('curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json')
P=PRE/'P447.complete-selected-whole-profiles.INACTIVE.jsonl'
V=PRE/'VIEWS41.complete-five-new-target-proposals.INACTIVE.json'
VP=PRE/'PLAN.exact-48-view-entry-additions-and-old-target-retention.json'
SRC=PRE/'SOURCE232.complete-current-unions-plus15-author-proposals.INACTIVE.json'
D5=N/'chemie-current442-five-description-two-duty-split-author-20261017-v1/AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json'
P5=N/'chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.five-current-P-scope-operator-remedies.pending.json'
COMP=Path('app/scripts/applicabilityCompiler.ts')
SR=Path('curricula/DE/Gymnasium/provenance/source-landscape-registry.json')
bio='223e33a4-5545-5332-ac4e-7d7a6cbc587c';med='4965395d-e0c5-5e23-a408-a11712aab409';drug='3eb2a06c-d283-57aa-9eb4-088940c4801a'
oil='0959eef2-3c7d-5b33-a109-ddf332a5dbd9'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def pin(p):
 p=Path(p);b=(ROOT/p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads((ROOT/p).read_text())
def sha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def ref(p,ptr,x):return{**pin(p),'jsonPointer':ptr,'wholeObjectSHA256':sha(x)}
def write(name,x):
 (BASE/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(OUT/name)
boundary={'normalWrites':0,'APExecuted':False,'buildExecuted':False,'newScientificReviews':0,'nativeApproval':False,'M7Claim':False,'HumanApproval':False,'HumanTrial':False}
assert pin(CP)['sha256']=='770668995884eb5c5dafe264a3d9d63b95fd40fd826f1790a8e3e606eb917691'
assert pin(SEM)['sha256']=='f3aa9c11d40f14b846cb98fd942c6eab406a1be2d060a2a3101a3e0d53424faa'
assert pin(P)['sha256']=='74a578049dffd175aaab8e45a6aeb94c6dc594e7449283fafcd7be6337bada57'
assert pin(REG)['sha256']=='3cbbd691565c21526e82da7a7c9fa1382c0f6cb075109a80c7aca9d2095ab5c1'
preseal=read(PRE/'SEAL.json')
for x in preseal['outputs']:assert pin(x['path'])==x
before=read(CP);c=copy.deepcopy(before);by={g['id']:g for g in c['goals']};oldby={g['id']:g for g in before['goals']}
registry=read(REG);reg=copy.deepcopy(registry)
chem=next(x for x in reg['landscapes'] if x['landscapeId']==c['landscapeId']);oldchem=next(x for x in registry['landscapes'] if x['landscapeId']==c['landscapeId'])
assert len(oldchem['goalApplicabilityOverrides'])==42
assert sum(len(v['jurisdiction']) for v in oldchem['goalApplicabilityOverrides'].values())==112
profiles=[json.loads(x) for x in (ROOT/P).read_text().splitlines()];profileBy={x['goalId']:(i,x) for i,x in enumerate(profiles)}
d=read(D5);scopepath=Path(d['scopeRetentionPlan']['path']);matrix=read(scopepath)
assert len(matrix['rows'])==36
viewplan=read(VP);assert len(viewplan['rows'])==48
viewrows=read(V)['rows'];views={r['viewId']:r for r in viewrows}
source=read(SRC);sources={r['ordinal']:r for r in source['rows']}
sr=read(SR)
assert next(x for x in sr['entries'] if x.get('landscapeId')=='98a4a027-3df3-5797-8664-c731d31942d5')['jurisdiction']=='DE-HB'

def profref(gid):
 i,r=profileBy[gid]
 return {**pin(P),'format':'jsonl','lineOneBased':i+1,'jsonPointer':'/profile','wholeObjectSHA256':sha(r['profile']),'nativeRecord':False}
ownCoords={bio:[],med:[],drug:[]}
for i,r in enumerate(matrix['rows']):
 assert r['proposedCoreRole']=='target' and r['proposedSeparateDutyRole']=='target'
 jur=r['scope'].get('jurisdiction')
 if r['separateDutyGoalId']==bio and jur and jur!='DE-HB':ownCoords[bio].append((i,r))
 if r['separateDutyGoalId']==med and jur=='DE-SH':ownCoords[med].append((i,r))
 if r['coreGoalId']==drug and jur=='DE-HB':ownCoords[drug].append((i,r))
assert [len(ownCoords[g]) for g in [bio,med,drug]]==[24,2,2]
additions=[];extensions=[]
for gid,coords in ownCoords.items():
 assert gid not in chem['goalApplicabilityOverrides']
 jurisdictions=sorted({r['scope']['jurisdiction'] for _,r in coords})
 assert ('DE-HB' not in jurisdictions) if gid in [bio,med] else jurisdictions==['DE-HB']
 if gid==bio:assert len(jurisdictions)==11 and 'DE-BY' not in jurisdictions
 if gid==med:assert jurisdictions==['DE-SH']
 chem['goalApplicabilityOverrides'][gid]={'jurisdiction':jurisdictions}
 additions.append({'goalId':gid,'registryPointer':f'/landscapes/{reg["landscapes"].index(chem)}/goalApplicabilityOverrides/{gid}',
   'value':{'jurisdiction':jurisdictions},'goalJurisdictionPairs':len(jurisdictions),'viewCoordinateCount':len(coords),
   'basis':'Root-confirmed paired retention plan, implemented technically; no new scientific vote'})
 g=by[gid];ext=g.setdefault('extendedData',{});assert 'skillPilotAcquisitionExtensions' not in ext
 declarations=[]
 for jur in jurisdictions:
  rows=[(i,r) for i,r in coords if r['scope']['jurisdiction']==jur]
  e={'extensionId':f'retained-duty-target-20261018-{jur}-{gid}', 'jurisdiction':jur,
    'viewIds':sorted({r['viewId'] for _,r in rows}),
    'courseProfiles':sorted({r['scope']['courseProfile'] for _,r in rows}),
    'stageIntents':sorted({r['scope']['stage'] for _,r in rows}),
    'role':'own-authored-acquisition-extension-for-existing-selected-target',
    'officialWholeSourceCredit':False,'officialRequirementClaim':False,'actualLearnerTopicSelectionClaim':False,
    'declarationPackagePath':str(OUT),'wholeUnchangedAcquisitionScopeDe':g['description'],
    'wholeUnchangedAcquisitionScopeEn':g['descriptionEn'],'wholeSelectedPositiveProfile':profref(gid),
    'profileBindingIsTransportOnly':True,'nativePApprovalClaim':False,
    'scopeDecisionBasis':'The supervising Root explicitly confirmed that both external independent reviewers accepted the finite retention plan. This technical successor binds the same already authored duty to the same existing course/stage/view coordinates and adds no scientific judgment.',
    'exactConfirmedTupleInputs':[ref(scopepath,f'/rows/{i}',r) for i,r in rows],
    'compilerInputBoundary':'The unchanged applicability compiler reads only the supported jurisdiction override registry (or extendedData.applicabilityOverrides). These declaration viewIds/courseProfiles/stageIntents document exact approved coordinates; they add no compiler dimensions or runtime selector. Existing explicit composition target roles enforce the narrower coordinates.',
    'assessmentBoundary':'The whole selected description/profile and complete operative materials remain exact. No practical execution, independent actual data, fresh transfer, supervision, safety/local release, model boundary, indicator or quantitative duty is weakened. Provided fictional data is not actual learner execution.',
    'officialSourceBoundary':'This is own SkillPilot acquisition retention and supplies no official whole-source credit or universal official duty. New HB source-bound duties stay partial under their exact source200/232 or P3 source-course boundaries.',
    'topicChoiceBoundary':'All already authored topics remain included under the owner16Oct policy; actual learner theme choice and a persisted selection flow are not claimed.',
    'noHumanOrMasteryClaim':True}
  declarations.append(e);extensions.append({'goalId':gid,'jurisdiction':jur,'declaration':e})
 ext['skillPilotAcquisitionExtensions']=declarations
assert len(extensions)==13
# Registry syntax is untouched: only three goal entries are appended to Chemistry.
for gid,row in oldchem['goalApplicabilityOverrides'].items():assert chem['goalApplicabilityOverrides'][gid]==row
for entry in registry['landscapes']:
 if entry['landscapeId']!=c['landscapeId']:assert next(x for x in reg['landscapes'] if x['landscapeId']==entry['landscapeId'])==entry
assert len(chem['goalApplicabilityOverrides'])==45
assert sum(len(v['jurisdiction']) for v in chem['goalApplicabilityOverrides'].values())==125
RPIN=write('canonical-goal-applicability-override-registry.chemie45-confirmed-scope.INACTIVE.json',reg)
CPIN=write('C659.447ordinary-68memory.confirmed-own-scope-successor.INACTIVE.json',c)

def goalref(gid):
 i=next(i for i,g in enumerate(c['goals']) if g['id']==gid)
 return {**CPIN,'jsonPointer':f'/goals/{i}','wholeObjectSHA256':sha(by[gid])}
tupleRows=[]
for i,r in enumerate(matrix['rows']):
 jur=r['scope'].get('jurisdiction')
 for kind,gid in [('retained-core',r['coreGoalId']),('separate-duty',r['separateDutyGoalId'])]:
  own=gid in ownCoords and any(rr['viewId']==r['viewId'] for _,rr in ownCoords[gid])
  ordinals=[]
  if jur=='DE-HB':ordinals=[s['ordinal'] for s in source['rows'] if gid in s['wholeCandidateCarrierIds']]
  if own:basis='exact-own-acquisition-extension-plus-supported-registry-override'
  elif not jur:basis='existing-generic-canonical-target-no-state-filter-or-state-override-inferred'
  elif jur=='DE-HB' and ordinals:basis='candidate-HB-partial-source-union-under-exact-course-scope'
  else:basis='pre-existing-state-source/provenance/own-scope-retained-without-new-declaration'
  tupleRows.append({'kind':kind,'goalId':gid,'viewId':r['viewId'],'scope':r['scope'],'role':'target',
    'basis':basis,'newOwnDeclaration':own,'candidateDirectHBSourceOrdinals':ordinals,
    'wholeGoal':goalref(gid),'wholeProfile':profref(gid),'sourceAuthorTuple':ref(scopepath,f'/rows/{i}',r),
    'candidateView':{**pin(V),'jsonPointer':f'/rows/{next(i for i,x in enumerate(viewrows) if x["viewId"]==r["viewId"])}/wholeCandidateView'},
    'noWholeOfficialCredit':True,'noActualLearnerTopicSelection':True})
newPids=[r['goalId'] for r in read(P5)['newWholeGoalAndProfileCandidates']]
for i,r in enumerate(viewplan['rows']):
 if r['newGoalId'] not in newPids:continue
 gid=r['newGoalId'];assert r['scope']['jurisdiction']=='DE-HB'
 ordinals=[s['ordinal'] for s in source['rows'] if gid in s['wholeCandidateCarrierIds']]
 assert ordinals
 tupleRows.append({'kind':'P3-HB-source-duty','goalId':gid,'viewId':r['viewId'],'scope':r['scope'],'role':'target',
   'basis':'candidate-HB-partial-source-union-under-exact-course-scope','newOwnDeclaration':False,
   'candidateDirectHBSourceOrdinals':ordinals,'wholeGoal':goalref(gid),'wholeProfile':profref(gid),
   'sourceAuthorTuple':ref(VP,f'/rows/{i}',r),'noWholeOfficialCredit':True,'noActualLearnerTopicSelection':True})
assert len(tupleRows)==84
assert len({(r['goalId'],r['viewId']) for r in tupleRows})==84
assert not any(r['goalId']==bio and r['scope'].get('jurisdiction')=='DE-BY' for r in tupleRows)
assert not any(r['goalId']==med and r['scope'].get('jurisdiction')=='DE-HB' and r['scope']['courseProfile']=='GK' for r in tupleRows)
sourceBindings=[]
for gid in [bio,med]+newPids:
 ordinals=[s['ordinal'] for s in source['rows'] if gid in s['wholeCandidateCarrierIds']]
 sourceBindings.append({'goalId':gid,'HBSourceOrdinals':ordinals,'wholePartialSourceUnionBindings':[ref(SRC,f'/rows/{o-1}',sources[o]) for o in ordinals],
  'ownOverrideExcludesHB':gid in [bio,med],'allRelationsPartial':True,'sourceApprovalCreatedByTransport':False})
TUP=write('TUPLES84.confirmed36-partitions-both-roles-plus12-HB-source-duties.json',{'artifactRole':'Exact finite scope binding; no new review',**boundary,
 'counts':{'retainedCoreTuples':36,'separateDutyTuples':36,'P3HBSourceTuples':12,'allTuples':84,'newOwnJurisdictionPairs':13,'newOwnViewCoordinates':28},
 'rows':tupleRows,'partialHBSourceBindings':sourceBindings,'newDeclarations':extensions,
 'registryIsAdditiveJurisdictionOnly':True,'courseAndStageRemainExplicitViewSemantics':True})
changed=[];unchanged=[]
for gid,g in oldby.items():
 if g==by[gid]:unchanged.append({'goalId':gid,'wholeObjectSHA256':sha(g)})
 else:
  old=copy.deepcopy(g);after=copy.deepcopy(by[gid]);declarations=after['extendedData'].pop('skillPilotAcquisitionExtensions')
  assert after==old
  changed.append({'goalId':gid,'onlyAddedField':'/extendedData/skillPilotAcquisitionExtensions','beforeSHA256':sha(g),'afterSHA256':sha(by[gid]),'declarationCount':len(declarations)})
assert len(changed)==3 and len(unchanged)==656
write('DELTA.exact-three-goals-three-registry-entries-and-retention.json',{'role':'Machine metadata-only delta, not scientific acceptance',**boundary,
 'canonicalBefore':pin(CP),'canonicalAfter':CPIN,'changedGoals':changed,'all656OtherWholeGoalsExact':unchanged,
 'allExistingGoalFieldsExactExceptThreeNewExtensionArrays':True,'oldTransientMetadataPreservedExact':True,
 'descriptionsTitlesProfilesRequiresContainsTagsApplicabilityImagesAndSourceMappingsUnchanged':True,
 'registryBefore':pin(REG),'registryAfter':RPIN,'newRegistryEntries':additions,
 'old42ChemistryGoalEntriesExact':True,'old112ChemistryJurisdictionPairsExact':True,'otherLandscapeObjectsIncludingEconomicsExact':True,
 'counts':{'chemistryGoalOverridesBefore':42,'chemistryGoalOverridesAfter':45,'chemistryPairsBefore':112,'chemistryPairsAfter':125,'newDeclarationObjects':13,'changedGoalBodies':3,'unchangedWholeGoalBodies':656}})
write('INPUTS.scope-successor-and-unchanged-operative-transports.json',{'role':'Exact inactive predecessor and compiler inputs',**boundary,
 'inputs':[pin(x) for x in [CP,SEM,REG,P,V,VP,SRC,D5,P5,scopepath,COMP,SR,PRE/'SEAL.json']],
 'canonical':CPIN,'overrideRegistry':RPIN,'tuples':TUP,
 'unchangedFull447Profiles':pin(P),'unchangedWhole41ViewCandidates':pin(V),'unchangedWhole232SourceCandidates':pin(SRC),
 'reviewBasis':'Root explicitly reports two external independent reviewers confirmed the finite retentions. Assembler does not read those judgments, infer a new scope or add a new scientific vote.',
 'scope42Mechanism':'Same skillPilotAcquisitionExtensions documentation plus supported goalApplicabilityOverrides registry, jurisdiction only. No new compiler dimension or runtime code.'})
shutil.copyfile(Path(__file__),BASE/'bind.confirmed-scope-successor.py')
print(json.dumps({'out':str(OUT),'C':CPIN,'registry':RPIN,'tuples':TUP,'changedGoals':3,'wholeGoalsExact':656,'chemRegistry':{'before':42,'after':45,'pairsBefore':112,'pairsAfter':125}},indent=2))
