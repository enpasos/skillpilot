#!/usr/bin/env python3
"""Materialize reviewer B's actual substantive readings; not a native P generator."""
import json, hashlib, pathlib
from datetime import datetime, timezone

OWN=pathlib.Path(__file__).resolve().parent
ROOT=OWN.parents[6]
Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
A=Q/'chemie-b014-b477-nine-source-role-continuation-author-v2'
V3=Q/'chemie-b014-b477-colorless-reference-targeted-author-root-v3'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def jd(x): return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def binding(p): return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(name,value):
 p=OWN/name
 assert not p.exists(), name
 p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

stamp=datetime.now(timezone.utc).isoformat()
rolepath=A/'nine-current-whole-original-source-duties-and-partners.json'
casepath=V3/'four-current-whole-source-cases.with-targeted-colorless-reference.author-v3.json'
roles=read(rolepath)['entries']; cases=read(casepath)['cases']
guard=read(OWN/'exact-inputs-and-bounded-role-preservation.independent-b.actual.json')
base={'reviewer':'independent-b','reviewedAtUTC':stamp,'reviewMethod':'Whole primary sections and whole DE/EN materials, tasks, model answers and transfers actually read; exact hashes bind those readings, not replace them.',
      'peerOriginalOrV3ReviewsReadBeforeOwnFirstSeal':False,'authorOfTheseNineRolesOrFourCases':False,
      'historicallyAcceptedGoalCasesReviewedAgain':False,'activeWrites':0,'humanApproval':False,'humanTrial':False}
case_notes=[
 {'scienceFindings':[
   'The stipulated trace monoprotic HIn/In− model, 25°C and colorless calibrated samples support qualitative acidic A and basic B; the violet blank is compatible with intermediate indicator forms and does not mean ion-free water.',
   'In−+H3O+ ⇌ HIn+H2O and HIn+OH− ⇌ In−+H2O conserve atom counts and charge. Proton acceptor/donor attribution is correct in both equations.',
   'Both water ion species remain present. Predominance, exact pH, solute identity and dilution concentration are correctly separated. The intrinsically red fresh sample requires interference control before interpreting color.'],
  'sourceWitnessBoundary':'KEEP for qualitative acid/base detection via an explained proton reaction. It does not supply the other four BB/BE mandatory ion-detection intentions or prove practical learner execution.'},
 {'scienceFindings':[
   'The current v3 material explicitly gives colorless X/Y and colorless calibration references. The yellow/green/blue scale belongs to this supplied bromothymol-blue model; an HIn label does not transfer the first indicator’s red color.',
   'The two proton reaction equations are balanced and the acid/basic form preference follows the given model. Z’s intrinsic yellow color invalidates the simple yellow=acid inference; the separately stipulated appropriate pH measurement supports OH− predominance.',
   'The simplified dye proton pair is explicitly bounded and does not claim its complete molecular structure. Neither hue nor the meter alone identifies an organic functional group or dissolved compound. DE and EN preserve those limits and the fresh transfer requires its own calibration/blank.'],
  'sourceWitnessBoundary':'KEEP for the current colorless-reference v3 acid/base witness. No exact pH, ion absence, executed experiment or entire original six-ion scope is approved.'},
 {'scienceFindings':[
   'The two named acid-water protolyses instantiate HA+H2O ⇌ A−+H3O+. Activities and absorbed water activity are stated; Ka values 1.26e−3 and 1.58e−5 and K=Ka(chloroacetic)/Ka(acetic)=79.43 are consistent with supplied rounded pKa values.',
   'Conjugate-base stabilization by the stipulated electron-withdrawing Cl and shared carboxylate charge delocalization explain stronger chloroacetic acid and weaker chloroacetate base in this series. pKb11.1 versus9.2 correctly follows KaKb=Kw at25°C.',
   'The supplied composition yields Q=800>K. Its reverse thermodynamic direction is correctly distinguished from K>1 equilibrium preference and from kinetics/full conversion. Equal activities in the fresh transfer yield Q=1<K without changing strength constants; counterion omission is explicitly bounded.'],
  'sourceWitnessBoundary':'KEEP for the actual HB Q mass-action and BOTH acid/base particle-strength operator. This source witness does not close all current 481 goal bindings or narrow Q material to an E-phase direction atom.'},
 {'scienceFindings':[
   'Both acid and conjugate-base water reactions and the Ka/Kb expressions are correct. KaKb=Kw gives pKb10.0 for3-chloropropionate,9.2 for acetate and11.1 for chloroacetate.',
   'The stipulated extra sigma-bond distance weakens the added inductive stabilization while all these carboxylates share delocalization across two oxygens; acid ranking and inverse base ranking are justified for this supplied series, not claimed universal across solvents/substituents.',
   'Independent recomputation gives K=6.3096, Q=1<K; transfer Q=63.1>K reverses direction without changing Ka/Kb, structural comparison or establishing speed. The DE/EN models actually cover both strengths and the complete fresh material, rather than only sorting pK.'],
  'sourceWitnessBoundary':'KEEP for the second whole HB Q source witness; independent learner observations and whole-goal 481 approval remain absent.'}
]
case_records=[]
for c,notes in zip(cases,case_notes):
 case_records.append({**base,'caseLocalKey':c['caseLocalKey'],'verdict':'KEEP','scope':'Current four-case original-source witness only; not native whole-goal positive-evidence approval',
  'operativeCaseFileBinding':binding(casepath),'wholeCaseObjectDigest':jd(c),'wholeDEENMaterialTaskModelTransferRead':True,
  'sourceGoalIds':c['sourceGoalIds'],**notes,'actualLearnerOrExperimentEvidence':False,'newWholeGoalPApproval':False})
write('four-whole-DEEN-source-case-first-verdicts.independent-b.json',{'records':case_records,'KEEP':4,'HOLD':0,'nativeWholeGoalPApprovals':0})

source_records=[]
for r in roles:
 sid=r['sourceGoalId']
 common={**base,'sourceGoalId':sid,'jurisdiction':r['jurisdiction'],'wholeOriginalSourceGoalBinding':{'sourceFile':binding(rolepath),'wholeObjectDigest':jd(r['wholeOriginalSourceGoal'])},
 'wholeOriginalSourceGoalAndMappingTupleRead':True,'regionalStageAndCoursePreserved':True,'originalWholeTextPreserved':True,
 'newCurrentCanonicalGoalApproval':False,'newCurrentCanonicalGoalBody':False}
 if sid.startswith(('bb-','be-')):
  record={**common,'verdict':'HOLD_FULL_SOURCE_CLOSURE_WITH_KEEP_PARTIAL_CASES',
    'actualPrimaryPages':[26,44,45,46], 'caseIds':[c['caseLocalKey'] for c in cases[:2]],
    'boundedScienceApproved':'The two full supplied cases correctly explain qualitative acid/base indication and H3O+/OH− predominance via their own proton reactions.',
    'holdCode':'BB_BE_Q_MANDATORY_DETECTION_INTENTIONS_NOT_FULLY_TRACED',
    'concreteHold':'Whole Q-section page26 explicitly makes the listed experiments/investigations binding and permits variants only while preserving their intentions. Whole acid/base page45 lists chloride, bromide, carbonate, hydroxide, hydronium and ammonium detection. The current packet supplies the hydroxide/hydronium indicator intentions, but no concrete unchanged strict witness or fresh full case for the chloride/bromide/carbonate/ammonium detection intentions. Page17 recommendation language applies to the E-phase section3.1 and cannot be transferred to Q-section3.2.',
    'incorrectExtraDutyRejected':'Neither these source pages nor the one-word content row requires the entire alkene/alcohol/aldehyde/ketone/carboxylic-acid/ester family of canonical3de. Do not retain an erroneous broad organic requirement as a substitute for the missing original ion intentions.',
    'smallestNextDecision':'Trace the four remaining original ion-detection intentions to exact already valid current witness goals/cases or supply appropriate whole bounded cases and actual reviews. Preserve existing accepted evidence and source regional/course tuple; then judge the exact source-role union. Do not mark this full original duty closed from these two indicator cases alone.',
    'sourceRoleUnionCandidateGoalIds':['d2ccd1d5-56f7-583f-9724-e97441367f91','fd309753-4d48-5570-a4ec-09dfeb20ff9c','1c1420c2-a8e2-520f-8015-6df637a973bd'],
    'sourceRoleUnionCurrentlyComplete':False,'activeRoleDeltaApproved':False}
 elif sid=='hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-037-a5df318f':
  record={**common,'verdict':'KEEP_BOUNDED_ORIGINAL_Q_OPERATOR_WITNESSES',
    'actualPrimaryPages':[23],'caseIds':[c['caseLocalKey'] for c in cases[2:]],
    'scienceFindings':'Current2026 and retained2022 whole page23 are exactly equal in the relevant layout text. The normative rows require reversible protolysis, MWG application and particle justification of BOTH acid and base strength. Both full cases genuinely supply these performances, balanced water reactions, activity-based relationships and structural reasoning, with K/Q/kinetics separated. The source extraction pK wording is derived and is not substituted for the printed MWG/particle operator.',
    'sourceRoleReuseCandidateGoalIds':['48115ff7-7aca-5d0b-a9e7-7fc6c78434ef','ca216bc6-5205-5b46-abbd-fd5628e4ca5b'],
    'reuseBoundary':'481 is the relevant quantitative comparison/MWG reuse candidate and still needs all its current whole-goal D/P/A/M/V and other bindings; ca216 retains its accepted structural acidity scope and does not alone discharge every MWG/base-strength duty. Existing Q GK/LK common duties and separate LK pH/puffer/titration obligations are not dropped.',
    'whole481ReadyForApproval':False,'wholeSourceSection3_3ReadyForApproval':False}
 else:
  if sid.startswith('bw-chem-sekii-3-3-2'):
   pages=[26,27];specific='Basisfach3.3.2(10) requires describing Brønsted donor/acceptor acid-base reactions. It does not itself bundle the independent five-ion application in adjacent(11). The actual locator is physical27/printed25; retain old S24 as historical extraction and correct the locator explicitly if adopted.'
  elif sid.startswith('bw-'):
   pages=[34,35,36];specific='Leistungsfach3.4.3(1) requires the Brønsted donor/acceptor description. Adjacent equilibrium-with-water(2), ammonium/carbonate detection(3), MWG-derived Ka(4), pK classification and later practical titration/indicator/puffer obligations remain separate and unchanged.'
  elif sid.startswith('hb-'):
   pages=[20];specific='The E-page20 original normative clauses explain acid/base behavior, represent/explain donor/acceptor transfer and formulate reaction equations. The extracted conjugate-pair phrase is derived wording; the current1c whole body includes all actual Brønsted equation/species aspects. The other retained08b cluster role is preserved without transferring a new independent approval to its entire subtree or replacing separate pH/indicator/hazard duties.'
  else:
   pages=[25,26];specific='HE G9 mandatory10.3(3.3) names donor/acceptor, conjugate acid-base pairs and water as ampholyte. The unchanged1c whole body covers all three aspects. That exact SekI row imposes neither a separate quantitative direction target nor universal model-reflection duty. Facultative ammonia/soil/precipitation material remains facultative.'
  delta=next(x for x in read(A/'six-limited-operative-source-role-deltas.inactive.json')['entries'] if x['sourceGoalId']==sid)
  record={**common,'verdict':'KEEP_BOUNDED_B477_ROLE_REMOVAL','actualPrimaryPages':pages,'scienceFindings':specific,
    'concreteRoleJudgment':'Remove only the B477 partner edge for this exact original operator. Retain strict1c and every other original partner edge. Current accepted1c evidence is reused by current whole-goal/record equality; its old cases receive no fresh independent review in this dossier.',
    'exactCandidateDeltaFileBinding':binding(A/'six-limited-operative-source-role-deltas.inactive.json'),'wholeCandidateDeltaObjectDigest':jd(delta),
    'sourceOperatorSatisfiedByRetainedWholeGoalId':'1c1420c2-a8e2-520f-8015-6df637a973bd','wholeSourceSectionApproved':False,'oldStrictGoalApprovedAgain':False}
 source_records.append(record)
write('nine-whole-original-source-role-first-verdicts.independent-b.json',{'records':source_records,'boundedRoleRemovalKEEP':6,'wholeQOperatorWitnessKEEP':1,'originalSourceFullClosureHOLD':2,'newWholeGoalApprovals':0})

write('whole-B477-atomicity-and-distinct-completion-boundaries.independent-b.json',{
 **base,'goalId':'b4777001-f4ed-5fe9-9d98-02319abdea09','atomicityVerdict':'HOLD_NON_ATOMIC_CURRENT_WHOLE_BODY',
 'actualWholeGoalRead':True,'currentWholeBodyDigest':jd(next(g for g in read(OWN/'current-nine-whole-goals-read-scope.independent-b.actual.json')['goals'] if g['id']=='b4777001-f4ed-5fe9-9d98-02319abdea09')),
 'concreteReason':'Reaction-direction reasoning, experimental ion-evidence interpretation and reflection on model explanatory limits are independently assessable performances with different evidence and source/stage conditions. Their current bundled description does not become one atomic competence by correcting six partner roles.',
 'directionBoundary':'Relative strengths/K indicate equilibrium preference under specified medium/temperature; current Q/K decides thermodynamic change for a composition. Neither gives kinetics. The new Q cases preserve this distinction.',
 'detectionBoundary':'Indicator color in a valid controlled model supports acidic/basic predominance, not ion absence or solute identity. The currentfd309 whole wording already says predominance; it is retained and not corrected/re-reviewed again.',
 'modelReflectionPrimarySource':{'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg','wholeSectionRead':'C10 Lernbereich1 competences and contents','finding':'Generic modelling properties, explanatory power, limitations and extension are normative. Acid/base application can be authored under that process scope; a literal universal acid/base-specific model comparison requirement is not established.'},
 'held277NotStrictFromNameOrSingleApplication':True,'scopePreservingReuseOrSplitDecisionStillRequired':True,
 'whole481CompletionHoldRetained':True,'fullB477D_P_A_M_VCompletionTransferredFromBoundedReview':False,
 'machineStrictNetGain':0,'strictBaselineRetained':'Chem173/378, Bio174/391, Math807/807, Phys478/478; no central check invoked or changed by this bounded review'})
write('independence-and-no-authority-transfer.first-declaration.independent-b.json',{
 **base,'exactAuthorSeal':binding(V3/'whole-nine-source-role-current-four-case-author-v3.first.freeze.json'),
 'operativeCases':binding(casepath),'wholeRoleInput':binding(rolepath),
 'primarySourceFilesLocatedUnderHistoricalPeerFolder':'Only neutral-declared actual HB PDF and neutral-declared locator HTTP metadata were read there, no original/current peer verdict or rationale output was opened.',
 'retainedOldA_M_V_P':'Whole current goal and record equality checked automatically; accepted original1c/d2/fd/ca cases and decision texts were not independently re-reviewed or approved again.',
 'notClaimed':['Native whole-goal P4 approval','wholeB477 approval','whole481 approval','complete BB/BE source duty closure','new image/native D/V approval','human approval','learner experiment or Human Trial','active source mapping change'],
 'terminalGuardExitCode':0,'terminalGuardRole':'Exact inputs/current whole bodies/role deltas/case text changes/quantitative arithmetic only; scientific evidence is in own substantive records.'})
print(json.dumps({'actualOwnFirstVerdictsWritten':True,'sourceRows':9,'boundedRoleRemovalKEEP':6,'wholeQOperatorWitnessKEEP':1,'originalSourceClosureHOLD':2,'wholeCasesKEEP':4,'wholeB477AtomicityHOLD':True,'wholeGoalApprovals':0}))
