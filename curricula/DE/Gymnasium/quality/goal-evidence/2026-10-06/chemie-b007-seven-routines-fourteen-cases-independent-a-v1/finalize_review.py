#!/usr/bin/env python3
"""Materialize independent A decisions; no author, landscape or ledger writes.
SPDX-License-Identifier: Apache-2.0
"""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
AUTHOR_REL = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-three-safety-solutions-source-boundary-author-v1'
AUTHOR = REPO / AUTHOR_REL
CASE_PATH = AUTHOR_REL + '/authored-case-materials-v1/cases.de-en.author-candidate.json'
ROUTINE_PATH = AUTHOR_REL + '/seven-routines.de-en.author-candidate.json'
checks = json.loads((OWN/'input-byte-and-arithmetic-checks.actual.json').read_text())
assert checks['authorInputsUnchanged'] and checks['compoundAuthorFreeze']['exact']
assert checks['arithmeticAllExact']
now = datetime.now(timezone.utc).isoformat()

def binding(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(REPO)), 'sha256': sha256(raw).hexdigest(), 'bytes': len(raw)}

def write(name, obj):
    (OWN/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

he = 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf'
eu = 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52018XC0409(01)'
findings = [
 {'findingId':'A-F01','severity':'material_revision_required','topic':'Exact German H-code lookup text',
  'inputPath':CASE_PATH,'caseLocalKey':'label-same-exclamation-different-warning',
  'fieldPaths':['material.de[1]','expectedResponseOrSolution.de'],
  'literalProblem':'The H319 lookup entry says verursacht starke Augenreizung; H315 says reizt die Haut. Meanings and assigned codes are correct, but the table presents them as the H-code statement text without marking a paraphrase.',
  'requiredCorrection':'Use the official German H319 wording Verursacht schwere Augenreizung and H315 wording Verursacht Hautreizungen in the lookup table, or explicitly distinguish paraphrase from official statement. Keep the correct EN statements and symbol ambiguity countercase.',
  'primaryReferences':[
   {'url':'https://eur-lex.europa.eu/eli/reg_impl/2025/1186/oj?locale=de','access':'official-domain search result inspected','supports':'German H319 statement'},
   {'url':'https://eur-lex.europa.eu/eli/reg_impl/2025/523/oj/deu','access':'official-domain search result inspected','supports':'German H315 statement'},
   {'url':eu,'access':'full page fetched and relevant table inspected','supports':'H315/H319 meanings; H225/H226/H228 distinctions'}],
  'doesNotMean':'No incorrect hazard code, actual product classification or authorization for real use was found.'},
 {'findingId':'A-F02','severity':'material_revision_required','topic':'Separate salt weighing lacks supplied equipment and tare instruction',
  'inputPath':CASE_PATH,'caseLocalKey':'preparation-salt-water-performed-log',
  'fieldPaths':['material.de[0]','material.en[0]','material.de[1]','material.en[1]','boundSimulatorSpecification.actionVocabulary'],
  'literalProblem':'The supplied kit lists one beaker, a stirring rod and a balance. The beaker already contains the weighed water when 2.0 g salt must be weighed separately. A weighing dish/second vessel and its tare operation are not specified.',
  'requiredCorrection':'Supply a clean weighing dish or second suitable vessel and a transfer tool, and explicitly tare that salt-weighing container before weighing. Align the simulated action feedback and successful log with that separate operation.',
  'evidenceBasis':'Literal provided kit and imposed action order; this is an operational completeness finding, not an external equipment standard.',
  'doesNotMean':'The salt/water quantities, dissolution assumption, stop-on-spill rule and requirement for a performed supervised/simulator log are sound.'},
 {'findingId':'A-F03','severity':'material_revision_required','topic':'W-1 mixed-composition catch-all conflicts with accepted known-mixture transfer',
  'inputPath':CASE_PATH,'caseLocalKey':'disposal-identified-local-streams',
  'fieldPaths':['material.de[0]','material.en[0]','transferOrCountercase.de','transferOrCountercase.en'],
  'literalProblem':'W-1 sends unknown or mixed compositions to the teacher without a route. Its transfer nevertheless requires W-B for known NaCl/water newly containing a copper compound. Literal mixed composition covers this known mixture, and the rule gives no precedence. The original admitted ethanol/water and salt/water solutions are themselves mixtures.',
  'requiredCorrection':'Narrow the hold rule to unknown or unambiguously unassignable/incompatible combinations, and explicitly state that the documented aqueous copper category takes precedence for the stated salt-plus-copper case. Otherwise accept the held decision for this transfer instead of requiring W-B.',
  'evidenceBasis':'Internal consistency of the supplied synthetic local W-1 instruction; no national disposal rule is being substituted.',
  'doesNotMean':'No drain permission or actual waste treatment is proposed; W-2 correctly holds the unidentified residue.'},
 {'findingId':'A-F04','severity':'assessment_revision_required','topic':'Required spatial interpretation is not elicited by the learner prompt',
  'inputPath':CASE_PATH,'caseLocalKey':'volume-fraction-contraction-no-denominator-swap',
  'fieldPaths':['learnerTask.de','learnerTask.en','assessmentCriteria[3].required','assessmentCriteria[3].text'],
  'literalProblem':'Criterion 4 requires rejecting a separate constituent region in the homogeneous mixture. The learnerTask only asks for the fraction, denominator distinction and other ratio; it never asks whether ethanol occupies a separate 40.0 mL region.',
  'requiredCorrection':'Add a direct DE/EN prompt for this interpretation, or make the unprompted criterion optional. Preserve the correct 40% input-volume fraction and the distinct 41.7% final-volume ratio.',
  'primaryReferences':[{'url':'https://goldbook.iupac.org/terms/view/V06643/html','access':'current primary-domain search result inspected; direct term fetch failed','supports':'Input constituent volumes, before mixing, determine the volume-fraction denominator'}]},
 {'findingId':'A-F05','severity':'source_receipt_correction','topic':'Parenthesized-example statement page is off by one',
  'inputPath':AUTHOR_REL+'/authored-case-materials-v1/source-boundary-and-material-limitations.author.md',
  'fieldPaths':['Source boundaries paragraph containing p. 6 states that parenthesized examples are suggestions'],
  'literalProblem':'The actual PDF puts the explicit parenthesized-examples statement on printed page 7, physical zero-based page 7, continuing the discussion that starts on printed page 6.',
  'requiredCorrection':'Cite printed p.7, or pp.6-7 for the continuing guidance. Retain the correct mandatory solutions/safety p.11 and facultative solubility/temperature p.12 distinction.',
  'primaryReferences':[{'url':he,'localPath':'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf','physicalPageIndices':[6,7,11,12],'access':'official PDF fetched; local actual PDF pages read as layout text'}]},
 {'findingId':'A-F06','severity':'clarification_recommended','topic':'Avoid implying a one-pictogram/one-hazard-class correspondence',
  'inputPath':ROUTINE_PATH,'routineLocalKey':'label',
  'fieldPaths':['prototypes[label].positiveUnderstandingAuthorCandidate.essentialUnderstandingDe','prototypes[label].positiveUnderstandingAuthorCandidate.essentialUnderstandingEn','cases[label].essentialUnderstanding'],
  'literalProblem':'The singular wording ein Piktogramm kennzeichnet eine Gefahrenklasse / a pictogram denotes a hazard class is unnecessarily narrow. The actual exclamation-mark cases correctly cover skin irritation, eye irritation and respiratory irritation under a shared symbol.',
  'requiredCorrection':'Say that pictograms signal types/classes of hazards and that one symbol can cover different concrete hazards, whose associated statements must be read.',
  'evidenceBasis':'The case material itself demonstrates several hazard classes associated with a shared symbol; do not infer unique class or substance identity.'},
]

routine_reasons = {
 'label':('revise_material_keep_atomic','One label interpretation routine; bounded lookup is part of that interpretation. Correct shared-symbol cases; apply A-F01 and recommended A-F06. Proposed empty prerequisites are plausible for supplied paper-label data, not lab use. Existing card may be retained only after changed semantic fingerprint review.'),
 'handling':('keep_bounded_candidate','One context-specific precaution justification routine. Label interpretation prerequisite is coherent; disposal and full independent risk assessment are excluded. Changed aerosol/dust exposure is handled without generic PPE permission.'),
 'disposal':('revise_material_keep_atomic','One route-selection routine plus withholding when decisive data are absent. No universal route table is memorized. Resolve W-1 catch-all A-F03; W-2 remains coherent. Label mastery is not logically required when complete local composition/rules are supplied.'),
 'preparation':('revise_material_keep_atomic','One performed instruction-following preparation routine across selected phases/solvents. General lab safety prerequisite is coherent. Apply A-F02. A hypothetical expected log is insufficient. Facilitator action logs test model actions and do not certify physical laboratory competence.'),
 'solubility':('keep_bounded_candidate_source_role_pending','One capacity/saturation routine with solute, solvent, temperature and attained equilibrium supplied. Same-routine explanations and capacity arithmetic are coherent. HE mandatory p.11 alone does not establish saturation/temperature core; actual p.12 is facultative. NI 5/6 property-description row supports only a partial contribution.'),
 'mass_fraction':('keep_bounded_candidate','One calculate-and-interpret routine; total constituent mass is the denominator. Water-only loss is explicitly supplied, and unknown remaining composition stays undecided. No preparation or saturation evidence is inferred.'),
 'volume_fraction':('revise_one_assessment_keep_atomic','One calculate-and-interpret routine using before-mixing constituent-volume sums. Same-temperature data and contraction distinction are correct. Apply prompt/criterion alignment A-F04; do not substitute final mixture volume.'),
}
case_reasons = {
 'label-same-exclamation-different-warning':('revise','A-F01; paired symbol meanings and missing-information response otherwise coherent.'),
 'label-flame-and-bounded-lookup':('keep_bounded_candidate','H225/H228/H226 meanings and lookup are correct; flame does not identify alcohol or state. Apply any shared essential-understanding wording clarification A-F06.'),
 'handling-eye-splash-task':('keep_bounded_candidate','Complete fictional activity/local instruction; splash route explains goggles, dust mask is unsuitable for eyes, spraying requires fresh authorization.'),
 'handling-dust-versus-closed-vessel':('keep_bounded_candidate','Closed intact transport and open dust-producing weighing have different exposures; missing required extraction stops open weighing, loose closure invalidates transport.'),
 'disposal-identified-local-streams':('revise','A-F03; category decisions are valid only after the catch-all/precedence ambiguity is resolved.'),
 'disposal-missing-identity-hold':('keep_bounded_candidate','W-2 distinguishes documented sugar/water from unidentified clear residue; U is no decision, not a waste stream. Reliable copper identification enables S-2.'),
 'preparation-salt-water-performed-log':('revise','A-F02; correct performed-log requirement, finite salt/water quantities and supervised stop-on-deviation rule.'),
 'preparation-bound-phase-solvent-transfer':('keep_as_model_material_only','Full action/feedback sequences exist for liquid/water, solid/ethanolic solvent and gas/water. Gas partial pressure/temperature/capacity are model context, not measured kinetics or equilibrium proof. No real gas/petrol procedure or actual lab mastery follows.'),
 'solubility-clear-saturated-countercase':('keep_bounded_candidate','9.6 g limit, 2.4 g spare and saturated clear B are correct; doubled-water countercase gives 19.2 g total limit and 9.6 g spare.'),
 'solubility-residue-water-and-temperature':('keep_bounded_candidate','24 g dissolved / 8 g residue; after water addition 36 g limit, 32 g dissolved and 4 g spare. Attained equilibrium matters; 40-degree data are needed.'),
 'mass-fraction-total-mass-and-dilution':('keep_bounded_candidate','12/120 gives 10%; 12/108 is a different ratio; dilution gives 8%, proportional scaling 10%.'),
 'mass-fraction-documented-solvent-loss':('keep_bounded_candidate','12.5% becomes rounded 14.3% after specified water-only loss; end total mass alone cannot prove remaining solute mass. Added-water countercase gives 10%.'),
 'volume-fraction-input-sum-and-scaling':('keep_bounded_candidate','25% in initial and proportional batch; changed input ratio 40%. Additivity is local, not presumed for other ratios.'),
 'volume-fraction-contraction-no-denominator-swap':('revise_assessment','A-F04; 40% and fresh 30% use input sums; 41.7% uses a different final-volume denominator. Spatial interpretation is scientifically sound but must be elicited.'),
}
routines = json.loads((AUTHOR/'seven-routines.de-en.author-candidate.json').read_text())['prototypes']
cases = json.loads((AUTHOR/'authored-case-materials-v1/cases.de-en.author-candidate.json').read_text())['cases']
cards = json.loads((AUTHOR/'authored-case-materials-v1/primary-cards.de-en.author-candidate.json').read_text())['cards']
review = {
 'schemaVersion':1,'licenseExpression':'Apache-2.0','createdAtUTC':now,
 'reviewer':'Codex independent A; not the author of the reviewed B007 material',
 'independence':{'authorSelfReview':False,'priorPeerConclusionsRead':False,'newPeerOutputsRead':False},
 'decision':'revise_bounded_author_materials_then_recheck_changed_fields',
 'reviewScope':'All seven DE/EN descriptions/prerequisite proposals/semantic boundaries, all fourteen complete actual DE/EN materials/tasks/solutions/criteria/transfer contexts, both narrow cards, exact byte checks, selected actual primary-source boundaries. Not all 403 source obligations.',
 'compoundAuthorFreeze':checks['compoundAuthorFreeze'],
 'inputBindings':[binding(AUTHOR/'seven-routines.de-en.author-candidate.json'),binding(AUTHOR/'authored-case-materials-v1/cases.de-en.author-candidate.json'),binding(AUTHOR/'authored-case-materials-v1/primary-cards.de-en.author-candidate.json')],
 'findings':findings,
 'routineDecisions':[{'localKey':r['localKey'],'candidateGoalId':r['id'],'titleDe':r['title'],'descriptionDeRead':True,'descriptionEnRead':True,'requiresAuthorProposal':r['requiresAuthorProposal'],'semanticAtomic':True,'atomicityDecision':'atomic','decision':routine_reasons[r['localKey']][0],'reason':routine_reasons[r['localKey']][1],'sourceClearance':'selected source contribution only; exact applicability/stage/projection binding pending','nativeDPAorMApproval':False} for r in routines],
 'caseDecisions':[{'caseLocalKey':c['caseLocalKey'],'routineLocalKey':c['routineLocalKey'],'completeMaterialTaskSolutionCriteriaTransferReadDeEn':True,'decision':case_reasons[c['caseLocalKey']][0],'reason':case_reasons[c['caseLocalKey']][1],'recordStatusRetained':c['recordStatus'],'validationStatusRetained':c['validationStatus'],'evidenceLevelRetained':c['evidenceLevel'],'generalizationLevelRetained':c['generalizationLevel'],'actualLearnerPerformance':False,'nativeProfileApproval':False} for c in cases],
 'cardDecisions':[{'cardLocalKey':c['cardLocalKey'],'decision':'keep_scientific_candidate','necessaryAsNarrowRecallCandidate':True,'frontAndBackReadDeEn':True,'reason':'One compact definition and its denominator; application and preparation remain ordinary understanding cases. The mass denominator includes every constituent; the volume denominator uses the sum of same-temperature constituent volumes before mixing.','cardId':None,'originGoalId':None,'deckId':None,'memoryGoalIds':[],'nativeMApproval':False,'activationApproved':False,'actualCompositionVisibilityVerified':False,'pending':['actual current ordinary-goal ID','current memory_required goal fingerprint decision','concrete card ID and kept/necessary origin trace','concrete canonical deck and memoryGoalIds','same-view actual learner-facing visibility proof']} for c in cards],
 'existingLabelMemory':{'readCardId':'chem_basics_001','originGoalId':'9e656697-fc05-5aa9-9aca-871af2e89eb7','memoryGoalId':'1e372b97-6f1c-596c-8a8b-fc03193d784a','deckId':'de_gymnasium_chemistry_basics_seki','existingContentUnchangedByThisReview':True,'changedOrdinaryDescriptionRequiresFreshFingerprintReview':True,'nativeMReapproved':False},
 'sourceBoundaryDecisions':[
  {'source':'HE official G9 PDF printed p.11 / physical index 11','decision':'keep_separate_source_contributions','reason':'Separate labelling, disposal and precautions support three routines. The solutions row includes solid/liquid/gas starting phases, different solvents and BOTH mass and volume fractions; selected examples do not discharge the whole original row.'},
  {'source':'HE official G9 PDF printed p.12 / physical index 12','decision':'facultative_not_mandatory_core','reason':'Saturation categories and temperature-dependent solubility are in facultative content. The fixed-temperature model cases are scientifically sound; prospective exact source role must preserve this status.'},
  {'source':'NI source record ni-chemistry-seki-kc2015-st-5-6-1-kompetenz-003-cdaa7726 plus actual PDF physical index 50','decision':'partial_only','reason':'Describing typical properties such as flammability and solubility for grades 5/6 is broader and different from calculating capacity/saturation. No exact full NI claim.'},
  {'source':'BW raw rows 3.2.1.1(3), 3.2.1.2(3), actual PDF physical indices 14 and 17','decision':'partial_companion_boundaries_open','reason':'Hazard potential for people/environment and particle-model explanation of phase changes/dissolving/diffusion/Brownian motion are retained companion obligations. These selected label/calculation cases do not clear those full rows.'},
  {'source':'IUPAC M03722 and V06643 current official-domain indexed definitions, version 5.0.0 (2025)','decision':'scientific_definitions_match','reason':'Total mass includes all constituents; volume fraction denominator is the sum of constituent volumes before mixing. Direct term/format opens failed; successful direct-fetch access is not claimed.'}],
 'counts':{'routines':7,'cases':14,'requiredCriteriaActuallyPresent':46,'newNarrowCards':2,'retainedMappingRows':413,'retainedDistinctSourceObligations':403,'all403SubstantivelyReviewed':False},
 'currentStrictInheritedBaseline':{'chemie':'112/378','biologie':'67/383'},
 'strictCompletionsAdded':0,'restoredBindingsAdded':0,'activeWrites':False,
 'nativeGateApproval':False,'humanApproval':False,'humanTrial':False,
 'remainingWork':['Correct the specific author fields in a new frozen author packet and recheck them independently','Review all actual source/stage/target bindings before full national clearance','Assign actual new IDs and validate requires/routes/placements','Bind current native D/P/A/M only after their own gates; no scientific card KEEP equals native M','Review actual visualizations separately; no image work performed here','Obtain actual learner evidence and human review where required; synthetic E1/G1 remain unchanged'],
}
write('independent-a.review.json',review)

sources = {
 'schemaVersion':1,'licenseExpression':'Apache-2.0','createdAtUTC':now,
 'localPrimaryBindings':[x for x in checks['additionalReadOnlyInspectionBindings'] if x['path'].endswith('.pdf')],
 'primaryInspections':[
  {'url':he,'access':'Successful official PDF fetch and actual local PDF text inspection','printedPages':[7,11,12],'physicalZeroBasedPages':[7,11,12],'decision':'Separate safety contributions; whole mandatory solutions row includes both fractions; saturation/temperature facultative; parenthesis guidance p.7'},
  {'url':'https://cuvo.nibis.de/index.php?p=download&upload=18','access':'Actual retained official PDF local text inspection; no fresh network access claimed','physicalZeroBasedPages':[50],'decision':'Property-description row only; no saturation/quantity or exact-full claim'},
  {'url':'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/BP2016BW_ALLG_GYM_CH.pdf','access':'Actual retained official PDF local text inspection; no fresh network access claimed','physicalZeroBasedPages':[14,17],'decision':'Environmental hazard potential and particle-model companions remain open'},
  {'url':'https://goldbook.iupac.org/terms/view/M03722','access':'Direct fetch failed; successful current primary-domain search result inspected, version 5.0.0 (2025)','decision':'Mass denominator agrees'},
  {'url':'https://goldbook.iupac.org/terms/view/V06643/html','access':'Direct fetch failed; successful current primary-domain search result inspected, version 5.0.0 (2025)','decision':'Before-mixing volume sum denominator agrees'},
  {'url':eu,'access':'Successful direct official page fetch and actual relevant tables inspected','decision':'EN H225/H226/H228 and H315/H319 meanings agree with supplied codes'},
  {'url':'https://eur-lex.europa.eu/eli/reg_impl/2025/1186/oj?locale=de','access':'Current official-domain search result inspected','decision':'Exact DE H319 wording differs from author table'},
  {'url':'https://eur-lex.europa.eu/eli/reg_impl/2025/523/oj/deu','access':'Current official-domain search result inspected','decision':'Exact DE H315 wording differs from author paraphrase'},
  {'url':'https://echa.europa.eu/regulations/clp/clp-pictograms','access':'Direct fetch returned 403; no successful page-read claim','decision':'Not used as fetched proof'}],
 'fullNationalSourceReview':False,'humanApproval':False,'humanTrial':False,'nativeGateApproval':False,
}
write('primary-source-inspection.actual.json',sources)
(OWN/'README.md').write_text('''# B007 independent review A — author corrections required

Independent A reviewed all **seven** bilingual routine descriptions and prerequisite proposals, all **fourteen** complete bilingual case objects (material, task, expected response, criteria and transfer), and both narrow bilingual cards. All seven proposed routines are semantically atomic in this bounded form. The authored materials require targeted corrections before a KEEP of the complete packet.

The [literal decisions and field-level findings](independent-a.review.json) require: exact German H319/H315 lookup wording; a supplied, separately tared salt-weighing container and transfer tool; an unambiguous W-1 rule for known copper-contaminated mixtures; and an explicit learner prompt for the required homogeneous-mixture spatial interpretation. The source guidance citation should be printed p.7, or pp.6–7. A plural hazard-type description is recommended for the shared-pictogram kernel. No reviewer changed the author inputs.

The [byte and arithmetic receipt](input-byte-and-arithmetic-checks.actual.json) verifies compound author freeze `bff61973489242df3f772bd9b65a44037c6335751638057851ed53ab05d1cea0`, all ten own artifacts and 62 external bindings, and the unchanged helper freeze with two root inputs and five helper outputs. Twenty-three independent literal arithmetic checks pass. There are **46 required criteria**, 413 retained mapping rows and 403 distinct retained source obligations; the latter are not 403 reviewed or cleared obligations.

The [primary-source receipt](primary-source-inspection.actual.json) distinguishes actual official Hessen PDF inspection from indexed IUPAC definitions and failed direct term/ECHA fetches. [Hessen printed p.11](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf) separates labelling, disposal and protection; its complete solutions row includes solid/liquid/gas, different solvents and both fractions. Printed p.12 places saturation/temperature material in facultative content. Actual retained NI and BW PDF rows were checked only to preserve their broader/partial companion boundaries. National exact source/stage/projection bindings remain open.

Mass fractions consistently use total constituent mass. Volume fractions consistently use the constituent-volume sum before mixing, including the contraction case; this agrees with the [IUPAC indexed definition](https://goldbook.iupac.org/terms/view/V06643/html). The simulations require performed action/feedback logs but are authored model specifications, not implemented apps, observed learner results or physical laboratory competence. All case statuses remain `ai_candidate / needs_human_review`, E1/G1.

Both new cards receive **scientific candidate KEEP** for compact definitions. Their card/ordinary-goal/deck/memory IDs and real composition visibility are absent; no native M or activation approval follows. Existing label card `chem_basics_001` is unchanged, and changed ordinary-goal semantics still require a fresh fingerprint review.

The inherited baseline remains Chemistry **112/378**, Biology **67/383**, gain **0**. This review adds no active D/P/A/M/V binding, image, build, runtime or plugin change and claims no human approval/trial. Only this independent-A directory was written. Own technical review receipts and scripts are Apache-2.0; linked sources retain their separate rights.
''')

# Freeze only after checking that every original author input still has exact bytes.
manifest=json.loads((AUTHOR/'seven-routines-and-fourteen-cases.author.final.freeze.json').read_text())
for entry in manifest['files']+manifest['externalInputBindings']:
    assert binding(REPO/entry['path']) == entry, entry['path']
files = [p for p in sorted(OWN.iterdir()) if p.is_file() and p.name!='independent-a.final.freeze.json']
write('independent-a.final.freeze.json',{
 'schemaVersion':1,'licenseExpression':'Apache-2.0','createdAtUTC':datetime.now(timezone.utc).isoformat(),
 'kind':'Independent A bounded review; literal findings unresolved in frozen author input',
 'authorFreezeBinding':binding(AUTHOR/'seven-routines-and-fourteen-cases.author.final.freeze.json'),
 'files':[binding(p) for p in files],'decision':'revise_bounded_author_materials',
 'allAuthorInputBytesExactAtFinalization':True,'authorSelfReview':False,
 'priorPeerConclusionsRead':False,'strictCompletionsAdded':0,'activeWrites':False,
 'nativeGateApproval':False,'humanApproval':False,'humanTrial':False})
print(json.dumps({'review':str(OWN/'independent-a.review.json'),'freeze':binding(OWN/'independent-a.final.freeze.json'),'findings':len(findings),'routines':len(routines),'cases':len(cases),'cards':len(cards)},ensure_ascii=False))
