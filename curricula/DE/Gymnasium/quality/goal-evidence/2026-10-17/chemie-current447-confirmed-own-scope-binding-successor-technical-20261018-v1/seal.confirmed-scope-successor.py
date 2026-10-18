#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,datetime,shutil
R=Path('/home/enpasos/projects/skillpilot');N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
O=N/'chemie-current447-confirmed-own-scope-binding-successor-technical-20261018-v1';B=R/O
def pin(p):
 p=Path(p);b=(R/p).read_bytes();return{'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads((R/p).read_text())
def write(name,x):
 (B/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(O/name)
inputs=read(O/'INPUTS.scope-successor-and-unchanged-operative-transports.json')
for row in inputs['inputs']:assert pin(row['path'])==row,row['path']
check=read(O/'CHECK.exact-stock-registry-loader-and-sourceFP-bindings.actual.json')
delta=read(O/'DELTA.exact-three-goals-three-registry-entries-and-retention.json')
tuples=read(O/'TUPLES84.confirmed36-partitions-both-roles-plus12-HB-source-duties.json')
assert check['counts']['newGoalJurisdictionPairs']==13 and check['counts']['stockParserFindings']==0
assert check['counts']['sourceFPRebindings']==3 and check['counts']['newAuthorCandidateStatusesRetained']==5
assert tuples['counts']['allTuples']==84
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
receipt=write('RECEIPT.materialized-confirmed-own-scope-C447-registry-SEM.technical.json',{
 'artifactRole':'Materialized inactive technical successor for the confirmed finite acquisition retentions','atUTC':now,
 'canonical':inputs['canonical'],'overrideRegistry':inputs['overrideRegistry'],'semanticTransport':check['semanticTransport'],
 'exactTuplesAndSourceBindings':pin(O/'TUPLES84.confirmed36-partitions-both-roles-plus12-HB-source-duties.json'),
 'fieldAndRegistryDeltas':pin(O/'DELTA.exact-three-goals-three-registry-entries-and-retention.json'),
 'actualStockHelperCheck':pin(O/'CHECK.exact-stock-registry-loader-and-sourceFP-bindings.actual.json'),
 'unchangedFull447Profiles':inputs['unchangedFull447Profiles'],'unchangedWhole41ViewCandidates':inputs['unchangedWhole41ViewCandidates'],
 'unchangedWhole232SourceCandidates':inputs['unchangedWhole232SourceCandidates'],
 'compilerContract':{'file':check['stockCompiler'],'exactStockDeclarations':check['exactStockDeclarations'],
   'supportedDimension':'jurisdiction','acquisitionMetadataIsCompilerInput':False,'registryOverridesAreRealCompilerInput':True,
   'oldInlineApplicabilityOverridesAlsoReadAndPreserved':True,'registryValuesAreAdditive':True,
   'courseStageAndRoleAreExplicitCompositionSemantics':True,'actualCompilerOrAPExecuted':False},
 'counts':{'canonicalGoals':659,'ordinaryGoals':447,'memoryGoals':68,'changedGoalBodies':3,'unchangedWholeGoalBodies':656,
   'newAcquisitionDeclarations':13,'newRegistryGoalEntries':3,'oldChemistryGoalEntriesExact':42,'oldChemistryJurisdictionPairsExact':112,
   'chemistryGoalEntriesAfter':45,'chemistryJurisdictionPairsAfter':125,'retainedCoreTuples':36,'separateDutyTuples':36,'HB_P3SourceTuples':12,
   'allTuples':84,'newOwnViewCoordinates':28,'SEMSourceFPsChanged':3,'classificationsUnchanged':659,'authorCandidateStatusesRetained':5},
 'ownScopeAdditions':[{'goalId':x['goalId'],'jurisdictions':x['value']['jurisdiction'],'exactViewCoordinates':x['viewCoordinateCount']} for x in delta['newRegistryEntries']],
 'scopeBoundaries':['3eb2 receives DE-HB own retention only in its two existing LK views; no HB GK target.',
   '223 receives own retention in exactly11 non-HB states from its32-coordinate matrix; HB source200 stays partial and no BY target is added.',
   '496 receives own retention in exactlySH GK/LK; HB source232 stays partial and LK-only by its real source course scope.',
   'Three P-new duties remain HB source-bound in their exact12 view coordinates; no own registry fallback or non-HB import is added.',
   'Four generic DE biofuel targets remain explicit generic canonical targets; no artificial DE state override is introduced.',
   'All old42 Chemistry registry objects, their112 values and every Economics/other landscape object are exact.'],
 'sourceProfileAndViewBindingBoundary':'The preceding complete source/P/view transports remain byte-exact. New whole-goal metadata bindings are at the84 tuple rows; source carrier IDs, scope/course, whole profile/material bodies and view references do not change. This metadata successor adds no source science or official whole credit.',
 'reviewBasis':inputs['reviewBasis'],
 'assemblerDisclosure':'Assembler previously authored D5/two-duty and HB view candidates and carried out source/M/P technical work. Root assigns this successor as implementation of externally confirmed tuples, not independent self-approval. No peer review document is opened or new scientific verdict written here.',
 'boundaries':{'normalWrites':0,'normalRegistryModified':False,'APExecuted':False,'buildExecuted':False,'newScience':0,'nativeApproval':False,'HumanApproval':False,'HumanTrial':False,'M7':False},
 'inputsStillExactAtSeal':True,'inputs':inputs['inputs'],
 'remainingRootSteps':['Install only the accepted current C/source/view/override inputs in the explicit normal-integration step',
   'Serialize actual accepted native SEM/A/M/P/V and final D using their own contracts and evidence',
   'Run ordinary final AP separately; this bounded helper check is not its result']})
(B/'README.md').write_text('''# Materialized confirmed own-scope successor (inactive)

This is the concrete technical successor to the sealed complete C447 transport.
It implements Root-confirmed paired retention tuples; it adds no new review.
No old file, normal registry, canonical source, profile, view or mapping is edited.

The full C659/447ordinary/68memory changes only three acquisition-extension
arrays:11 non-HB declarations for223, one SH declaration for496, and one HB
declaration for the retained3eb2 core. Each states its exact whole competence,
complete P binding, course/stage/view coordinates and source/assessment limits.
All656 other whole goals and every other field of the three goals remain exact.

The complete override registry adds three goal objects with13 jurisdiction
values. All42 existing Chemistry objects/112 values and the full Economics
object stay exact. Course and stage are not new override dimensions: they remain
in the explicit existing View references. The exact matrix binds36 retained
core tuples,36 separate-duty tuples and12 HB-only P-duty tuples (84 total).

The unchanged compiler does not read skillPilotAcquisitionExtensions itself.
It reads the supported jurisdiction registry and existing inline overrides
additively. Exact extracted stock loader/parser helpers were executed read-only
against before/after registries: all old unions are preserved and13 new values
are recognized, with no parser finding. This is NOT an AP run or full compiler.

SEM659 has actual current Stock source fingerprints for the successor: exactly
three change with the metadata. All classifications remain exact, including the
same five author_candidate assumptions. No reviewed/native status is invented.

HB200/232 remain partial source unions;232 gives no GK duty. There is no BY
biofuel target, no new HB-GK medicine target, no extra parent/composition edit,
no mastery or actual learner-topic-choice claim, and no relaxation of practical,
independent-data, transfer, indicator, quantitative or safety/local-release duties.

Read RECEIPT...technical.json for exact pins. Root handles actual normal
installation, native evidence serialization and the separate final AP/build.
Own curriculum content: CC-BY-4.0. Technical scripts: Apache-2.0.
''')
shutil.copyfile(Path(__file__),B/'seal.confirmed-scope-successor.py')
outputs=[pin(p.relative_to(R)) for p in sorted(B.rglob('*')) if p.is_file() and p.name!='SEAL.json']
seal=write('SEAL.json',{'artifactRole':'Inactive technical successor seal, not scientific approval','sealedAtUTC':now,
  'receipt':receipt,'outputs':outputs,'normalWrites':0,'AP':False,'build':False,'newScience':0,'HumanApproval':False,'M7':False})
for p in outputs:assert pin(p['path'])==p
print(json.dumps({'receipt':receipt,'seal':seal,'C':inputs['canonical'],'registry':inputs['overrideRegistry'],'SEM':check['semanticTransport'],'counts':check['counts'],'files':len(outputs)+1},indent=2))
