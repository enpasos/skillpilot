#!/usr/bin/env python3
"""Finite AUTHOR candidates; no normal writes or scientific approval serialization."""
import copy
import datetime
import hashlib
import json
from pathlib import Path
import shutil
import uuid

ROOT = Path('/home/enpasos/projects/skillpilot')
N = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
O = N / 'chemie-current442-normal-integration-20261017-v1'
OUT = N / 'chemie-current442-five-description-two-duty-split-author-20261017-v1'
OUTABS = ROOT / OUT
OUTABS.mkdir(parents=True, exist_ok=True)
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
CP = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
PP = O / 'P442-plan/P442.actual-selected-whole-profile-writer-input.jsonl'
MP = O / 'M442.memory68.review.jsonl'
AP = N / 'chemie-current439-HB-materials-resources-goal-specific-successor-author-20261017-v2/AUTHOR.whole-profile-successors.goal-specific-v2.pending.json'
RP = Path('tmp/chemie442_five_author_actual_target_roster.json')
SP = Path('curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json')
SM = Path('curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json')

def objsha(x):
    return hashlib.sha256(json.dumps(x, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()

def pin(p):
    p = Path(p)
    b = (ROOT / p).read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def read(p):
    return json.loads((ROOT / p).read_text())

def write(name, x):
    p = OUTABS / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
    return pin(OUT / name)

def ref(p, ptr, x):
    return {**pin(p), 'jsonPointer': ptr, 'wholeObjectSHA256': objsha(x)}

def status():
    return {'role': 'AUTHOR_CANDIDATE_ONLY', 'independentScienceApproval': False,
            'normalActivation': False, 'nativeDApproval': False, 'humanApproval': False,
            'humanTrial': False, 'actualLearnerPerformanceClaim': False, 'M7Claim': False,
            'evidenceLevel': 'E0', 'maximumClaimScope': 'G0'}

c = read(CP)
assert pin(CP)['sha256'] == '1334c2f7e637c23737c32fffcda9adc9273b83e0d61f536c2e6b404699eee262'
goals = {x['id']: x for x in c['goals']}
prs = [json.loads(x) for x in (ROOT / PP).read_text().splitlines()]
prows = {x['goalId']: (i, x) for i, x in enumerate(prs)}
mrows = {x['goalId']: (i, x) for i, x in enumerate(json.loads(s) for s in (ROOT / MP).read_text().splitlines())}
oldauthor = read(AP)
roster = read(RP)
assert roster['canonical'] == pin(CP)
source = read(SP)
mapping = read(SM)
ids = [next(x for x in goals if x.startswith(pre)) for pre in ['72236f2c', '8721d943', '0959eef2', '3eb2a06c', 'f4d5a02d']]
atom, recyc, oil, drug, polar = ids
oldgs = {gid: copy.deepcopy(goals[gid]) for gid in ids}
oldps = {gid: copy.deepcopy(prows[gid][1]['profile']) for gid in ids}
aftergs = copy.deepcopy(oldgs)
afterps = copy.deepcopy(oldps)
bio_uri = 'https://skillpilot.com/canonical/chemistry/biofuel-feedstock-production-route-and-generation-20261018-v1'
med_uri = 'https://skillpilot.com/canonical/chemistry/medicine-development-historical-current-social-impact-20261018-v1'
bio, med = str(uuid.uuid5(uuid.NAMESPACE_URL, bio_uri)), str(uuid.uuid5(uuid.NAMESPACE_URL, med_uri))
assert bio not in goals and med not in goals and bio != med

# Existing semantic core sentences are preserved verbatim, not paraphrased.
for gid, idx in [(oil, 9), (drug, 8)]:
    original = oldauthor['records'][idx]['currentGoalExact']
    for f in ['description', 'descriptionEn']:
        assert oldgs[gid][f].startswith(original[f] + ' ')
        aftergs[gid][f] = original[f]

aftergs[atom]['title'] = 'Kern-Hülle-Modell und Atombausteine beschreiben'
aftergs[atom]['titleEn'] = 'Describe the nuclear-shell model and atomic constituents'
for r in aftergs[atom].get('resourceLinks', []):
    for field in ['title', 'description', 'altText']:
        if field in r:
            r[field] = r[field].replace(oldgs[atom]['title'], aftergs[atom]['title'])
aftergs[recyc]['description'] = 'Die lernende Person kann werkstoffliches und rohstoffliches Recycling von Kunststoffen, einschließlich der Hydrolyse geeigneter Polymere, sowie Wertstoffkreisläufe fachlich erklären, ökologisch und wirtschaftlich bewerten und verwendete Quellen quellenkritisch einordnen. Sie kann energetische Verwertung abgrenzen und deren Stoff-/Energiebilanz unter angegebenen Bedingungen beurteilen.'
aftergs[recyc]['descriptionEn'] = 'The learner can explain mechanical and feedstock recycling of plastics, including hydrolysis of suitable polymers, and material cycles, evaluate them environmentally and economically, and critically assess the sources used. The learner can distinguish energy recovery and assess its material/energy balance under stated conditions.'
aftergs[polar]['description'] = 'Die lernende Person kann optische Aktivität chiraler Naturstoffe und das Grundprinzip eines Polarimeters erläutern, die Beziehung zwischen Drehwinkel, spezifischem Drehwinkel, Weglänge und Massenkonzentration unter angegebenen Referenzbedingungen zur Charakterisierung sowie zur Bestimmung der unbekannten Konzentration eines bekannten, einzigen optisch aktiven Stoffes auswerten und die aus einer vorgegebenen Winkelunsicherheit folgende Unsicherheit sowie Modell- und Identifikationsgrenzen begründet berücksichtigen.'
aftergs[polar]['descriptionEn'] = 'The learner can explain optical activity of chiral natural substances and the basic principle of a polarimeter, use the relationship between rotation, specific rotation, path length and mass concentration under stated reference conditions to characterize a sample and determine the unknown concentration of a known sole optically active solute, and account with reasons for uncertainty arising from a stated angular uncertainty and for model and identification limits.'

partitions = [
    (oil, bio, 'hb200-plant-oil-production-generations', 'hb200-plant-oil-production-generations-transfer', 'hb200-plant-oil-routes-0959'),
    (drug, med, 'hb232-historical-current-drug-impact', 'hb232-historical-current-drug-impact-transfer', 'hb232-drug-society-3eb2'),
]
for core, new, ei, vi, ci in partitions:
    a, b = copy.deepcopy(oldps[core]), copy.deepcopy(oldps[core])
    for k, selected in [('expectations', ei), ('variationAxes', vi), ('applicationCaseBriefs', ci)]:
        a[k] = [x for x in oldps[core][k] if x['id'] != selected]
        b[k] = [x for x in oldps[core][k] if x['id'] == selected]
        assert len(b[k]) == 1
    a['coverageExpectations']['requiredExpectationIds'] = [x for x in oldps[core]['coverageExpectations']['requiredExpectationIds'] if x != ei]
    b['coverageExpectations']['requiredExpectationIds'] = [ei]
    afterps[core], afterps[new] = a, b

# Whole candidate profiles contain the original complete expectations/cases/variations.
# The new target's case ID retains its historical material locator; it is not a learner event.
profiles = [{'goalId': gid, 'profile': afterps[gid], **status()} for gid in ids + [bio, med]]
profilepin = write('PROFILES.seven-whole-author-candidates.json', {'artifactRole': 'Unreviewed whole P bodies; no native records', **status(), 'records': profiles})
profindex = {x['goalId']: i for i, x in enumerate(profiles)}

def profile_ref(gid):
    return {**profilepin, 'jsonPointer': f'/records/{profindex[gid]}/profile', 'wholeObjectSHA256': objsha(afterps[gid])}

def target_rows(gid):
    return [copy.deepcopy(x) for x in roster['rows'] if x['goalId'] == gid and x['actualRole'] == 'target']

assert len(target_rows(oil)) == 32 and len(target_rows(drug)) == 4
assert {x['scope'].get('jurisdiction') for x in target_rows(oil)} == {'DE-BB','DE-BE','DE-HB','DE-HE','DE-HH','DE-MV','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST','DE-TH',None}
assert all(x['scope']['courseProfile'] == 'LK' for x in target_rows(drug) if x['scope'].get('jurisdiction') == 'DE-HB')

bio_de = 'Die lernende Person kann anhand bereitgestellter Stoff- und Prozessdaten Pflanzenöl, Biodiesel und Bioethanol nach Rohstoff, Stoffklasse sowie Gewinnungs- beziehungsweise Herstellungsweg unterscheiden, dabei physikalische Trennung und chemische Umwandlung erklären, eine vorgegebene Stoffbilanz prüfen und die Wege nach einer angegebenen Rohstoff-/Prozesskonvention der ersten oder zweiten Treibstoffgeneration zuordnen, ohne daraus eine automatische Klimaneutralität abzuleiten.'
bio_en = 'Using supplied substance and process data, the learner can distinguish vegetable oil, biodiesel and bioethanol by feedstock, substance class and extraction or production route, explain physical separation and chemical conversion, check a supplied material balance, and assign routes to first or second fuel generations using a stated feedstock/process convention without inferring automatic climate neutrality.'
med_de = 'Die lernende Person kann anhand bereitgestellter Beispiele die Auswirkungen der Entwicklung von Medikamenten in historischen und aktuellen gesellschaftlichen Zusammenhängen anhand belegter Wirkung, Versorgung und Zugang, Kosten, Sicherheit sowie Resistenz- und Evidenzgrenzen begründet bewerten und ihr Urteil bei geänderten Wirksamkeitsannahmen revidieren.'
med_en = 'Using supplied examples, the learner can give a reasoned evaluation of the effects of medicine development in historical and current social contexts using evidenced effectiveness, supply and access, costs, safety, resistance and evidence limits, and revise the judgment when assumptions about effectiveness change.'

def new_goal(gid, core, title, title_en, de, en, topic, area, origin):
    jurisdictions = sorted({x['scope']['jurisdiction'] for x in target_rows(core) if x['scope'].get('jurisdiction')})
    return {'id': gid, 'shortKey': topic.lower().replace('.', '_'), 'title': title, 'titleEn': title_en,
            'description': de, 'descriptionEn': en, 'weight': 1, 'tags': ['GK', 'LK', 'canonical', 'SekII'],
            'contains': [], 'requires': [], 'dimensionTags': {'framework':'canonical-gymnasium-chemistry',
                'demandLevel':'AB2', 'processCompetencies':['PK4_KOMMUNIZIEREN', 'PK5_BEWERTEN'],
                'guidingIdeas':[], 'phase':'GLOBAL', 'area':area, 'topicCode':topic},
            'applicability': {'jurisdiction': jurisdictions}, 'type': 'atomic', 'examples':[], 'resourceLinks':[],
            'extendedData': {'applicabilityMappingInheritance':'boundary', 'provenance':{
                'splitFromCanonicalGoalId':core, 'authorCandidatePackage':str(OUT), 'uuidV5Namespace':'URL', 'uuidV5Name':origin},
                'authorProposal': {**status(), 'profile':profile_ref(gid),
                    'scopePlan':str(OUT / 'SCOPE.two-duty-partitions-and-core-retentions.pending.json'),
                    'noActualLearnerTopicChoice':True, 'noUniversalOfficialDuty':True,
                    'sourceWholeCoveragePendingIndependentReview':True,
                    'providedMaterialIsNotActualExecution':True,
                    'requiresRationale':'The whole operative supplied case states the relevant substances, process/reference data and conventions. No broad former core prerequisite is automatically imported. This narrow empty-requires proposal needs independent review.',
                    'primaryImagePending':True}}}

aftergs[bio] = new_goal(bio, oil, 'Biotreibstoffe nach Rohstoff und Herstellungsweg unterscheiden', 'Distinguish biofuels by feedstock and production route', bio_de, bio_en, 'CANONICAL.CHEMISTRY.BIOFUEL.ROUTES_AND_GENERATIONS', 'Energie und Nachhaltigkeit', bio_uri)
aftergs[med] = new_goal(med, drug, 'Gesellschaftliche Folgen der Wirkstoffentwicklung historisch und aktuell bewerten', 'Evaluate historical and current social effects of medicine development', med_de, med_en, 'CANONICAL.CHEMISTRY.MEDICINE.SOCIAL_IMPACT', 'Pharmazie', med_uri)

# Replace no old scope grant silently: retain the original declaration as predecessor,
# and identify the author-only partition explicitly. Neither new profile is called accepted.
for extension in aftergs[oil]['extendedData']['skillPilotAcquisitionExtensions']:
    extension['predecessorWholeAcquisitionScopeDe'] = extension.pop('wholeUnchangedAcquisitionScopeDe')
    extension['predecessorWholeAcquisitionScopeEn'] = extension.pop('wholeUnchangedAcquisitionScopeEn')
    extension['predecessorWholePositiveProfile'] = extension.pop('wholeCurrentPositiveProfile')
    extension['authorCandidateAcquisitionScopeDe'] = aftergs[oil]['description']
    extension['authorCandidateAcquisitionScopeEn'] = aftergs[oil]['descriptionEn']
    extension['authorCandidateProfile'] = profile_ref(oil)
    extension['authorCandidateScopePartition'] = {'coreGoalId':oil, 'separateDutyGoalId':bio,
        'separateDutyProfile':profile_ref(bio), 'allPredecessorScopeDutiesRetainedAcrossPair':True,
        'requiresFreshIndependentScopeAndProfileReview':True}
    extension['assessmentBoundary'] = 'Pending author partition: the predecessor whole duty is conserved across the core and separate route goal. All original case text, rubrics, fresh transfer and independence duties remain exact. Neither successor profile nor this new scope metadata has independent approval yet.'
    extension['authorPackagePath'] = str(OUT)

scope_rows = []
for core, new, *_ in partitions:
    for r in target_rows(core):
        jur = r['scope'].get('jurisdiction')
        if jur == 'DE-HB':
            rationale = 'HB source200 proposed route-carrier replacement; GK/LK topic3.3. The retained structural core receives explicit own-acquisition retention, not source200 whole credit.' if core == oil else 'HB source232 proposed societal-carrier replacement; actual courseLevel LK and physical PDF37. The process-chain core remains an explicit own-acquisition target in its same two LK views, without source232 whole credit.'
            duty_basis = 'official-source-partial-carrier-proposal'
        elif jur:
            rationale = 'Explicit own-acquisition retention of a duty already unconditionally present in this selected whole current goal/P, under owner16Oct policy. The old view locates the coordinate; it does not prove official source coverage or grant approval to this partition.'
            duty_basis = 'own-authored-acquisition-retention-proposal'
        else:
            rationale = 'Retain the already selected generic DE whole authored content as two explicit targets. No state official duty or new stage is inferred.'
            duty_basis = 'generic-canonical-target-retention-proposal'
        scope_rows.append({'predecessorGoalId':core, 'coreGoalId':core, 'separateDutyGoalId':new,
            'currentViewPin':r['view'], 'viewId':r['viewId'], 'scope':r['scope'],
            'currentReferences':r['currentAuthoredReferences'], 'currentRole':'target',
            'proposedCoreRole':'target', 'proposedSeparateDutyRole':'target',
            'dutyScopeBasis':duty_basis, 'coreScopeBasis':'retain-existing-target-explicitly-if-source-mapping-is-replaced',
            'rationale':rationale, 'phaseInferenceUsed':False, 'actualTopicChoiceClaim':False,
            'officialUniversalRequirementClaim':False,
            'implementationProposal':'Keep every existing core reference. Add a direct goalEntry for the separate duty at the listed existing content branch (or an exactly equivalent explicit placement), with projectionRole target. Do not rely on requires to import it or on raw all-state tags. Resolve any duplicate from future canonical parent insertion before integration.',
            'independentScopeApprovalPending':True})
scopepin = write('SCOPE.two-duty-partitions-and-core-retentions.pending.json', {
    **status(), 'ownerPolicy':'All already authored topics remain in their applicable initial target before topic selection, owner16Oct2026; no official universal duty or actual learner choice.',
    'currentWholeRoster':pin(RP), 'existingOilTargetCoordinates':32, 'existingDrugTargetCoordinates':4,
    'newBioTargetCoordinates':32, 'newSocietalTargetCoordinates':4, 'newStateJurisdictionCounts':{'bio':12,'societal':2},
    'noBYBioImport':True, 'noHB_GKSocietalTarget':True, 'rows':scope_rows,
    'polarimetryCurrentTargetCoordinatesUnchanged':target_rows(polar),
    'polarimetryBoundary':'HB147 apparatus is shared GK/LK inside theme2.1; HB149 inverse concentration is LK. HE optical activity/polarimetry at physical PDF42 is increased LK. Existing additional GK target roles preserve their whole authored P as own acquisition; no source149 GK credit is inferred.',
    'unchangedOrdinaryGoalIdsNotRemoved':ids,
    'canonicalPlacementProposals':[{'parentGoalId':'e64a79df-7f21-5651-9b5d-e7d17580569e','insertAfterGoalId':oil,'newChildGoalId':bio},
       {'parentGoalId':'6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338','insertAfterGoalId':drug,'newChildGoalId':med}],
    'placementBoundary':'Parent insertions are candidate navigation only. Exact target roles above must survive filtering, inheritance boundaries and any eventual view patch. No existing phase, course or prerequisite implies a new target.',
    'currentC654Counts':{'allGoals':654,'ordinaryGoals':442,'memoryGoals':68},
    'projectedWithOnlyThisCandidate':{'allGoals':656,'ordinaryGoals':444,'memoryGoals':68},
    'phaseAdapter4bdbNotApplied':True})

# The actual operative materials remain entire and byte-unchanged, even when a case moves.
matbase = N / 'chemie-current439-HB-materials-resources-material-author-20261017-v1/materials'
mats = {
 'hb200': matbase/'hb200-plant-oil-routes.DE-EN.json',
 'hb208': matbase/'hb208-recovery-routes.DE-EN.json',
 'hb232': matbase/'hb232-drug-society.DE-EN.json',
 'polarimetry': N/'chemie-current439-HB-polarimetry-two-duties-P1-author-20261017-v1/MATERIAL.complete-DE-EN.polarimeter-and-two-concentration-cases.AUTHOR.json',
 'SH032': Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-coherent-selected-theme-process-chain-author-successor-20261016-v1/materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.AUTHOR.inactive.json'),
 'oldRecycling':Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3/whole40.expanded-cases.author-successor.json'),
}
assert pin(mats['polarimetry'])['sha256'] == '25f9403ac6e9170092ae70df514ad05d586457f94e84c168a03516ef91457b1c'
material_bindings = [
 {'goalId':atom, 'binding':'Both complete inline current P cases; no external material invented', 'wholeProfile':profile_ref(atom)},
 {'goalId':recyc,'wholeProfile':profile_ref(recyc),'materialFiles':[pin(mats['hb208']),pin(mats['oldRecycling'])], 'operativeLocators':['hb208 complete object', '/cases/20', '/cases/21'], 'readBoundary':'Full hb208 and both old case objects incl all DE/EN subfields. The other38 old cases were not substantively re-read.'},
 {'goalId':oil,'wholeProfile':profile_ref(oil),'operativeLocators':['/applicationCaseBriefs/0','/applicationCaseBriefs/1'],'binding':'Complete current inline oil cases, all retained exact; no source-file substitution.'},
 {'goalId':bio,'wholeProfile':profile_ref(bio),'completeMaterial':pin(mats['hb200']),'caseId':'hb200-plant-oil-routes-0959','binding':'Whole hb200 DE/EN object remains operative; historical case ID is a locator, not the new goal ID or actual learner performance.'},
 {'goalId':drug,'wholeProfile':profile_ref(drug),'completeMaterial':pin(mats['SH032']),'binding':'Whole common envelope plus both whole nonisomorphic cases, complete fresh transfers, solutions/rubrics/boundaries remain operative.'},
 {'goalId':med,'wholeProfile':profile_ref(med),'completeMaterial':pin(mats['hb232']),'caseId':'hb232-drug-society-3eb2','binding':'Whole hb232 DE/EN object remains operative; case label retained. Historical Nobel context plus current model comparison and changed-resistance transfer, not an actual clinical finding.'},
 {'goalId':polar,'wholeProfile':profile_ref(polar),'completeMaterial':pin(mats['polarimetry']),'binding':'Entire common instrument/equation/units/conditions and both full glucose/fructose cases. All five original P cases remain exact. No actual measurement is claimed.'},
]
materialpin = write('MATERIAL.seven-complete-operative-bindings.json', {'role':'Exact unchanged material bindings, not independent material approval',**status(),'rows':material_bindings})

# Exact conservation checks are technical checks, never scientific acceptance.
checks = []
for core, new, ei, vi, ci in partitions:
    for k in ['expectations','variationAxes','applicationCaseBriefs']:
        assert sorted(objsha(x) for x in oldps[core][k]) == sorted(objsha(x) for x in afterps[core][k]+afterps[new][k])
    oldcov = copy.deepcopy(oldps[core]['coverageExpectations'])
    assert sorted(oldcov['requiredExpectationIds']) == sorted(afterps[core]['coverageExpectations']['requiredExpectationIds']+afterps[new]['coverageExpectations']['requiredExpectationIds'])
    for p in [afterps[core],afterps[new]]:
        assert {k:v for k,v in p['coverageExpectations'].items() if k!='requiredExpectationIds'} == {k:v for k,v in oldcov.items() if k!='requiredExpectationIds'}
    checks.append({'coreGoalId':core,'separateDutyGoalId':new,'allExpectationObjectsExactPartition':True,'allVariationObjectsExactPartition':True,'allCompleteCaseObjectsExactPartition':True,'allRequiredExpectationIdsConserved':True,'allOtherCoverageValuesExact':True,'originalCoreFirstSentenceDE_ENExact':True,'noThresholdLowering':True,'noExtraTaskQuota':True,'taskQuotaBoundary':'Original numeric minimumIndependentDemonstrations=2 and fresh/independent transfer requirements remain exact. A complete original main case plus its fresh independent transfer can supply these aspects; the offered case labels do not create a fixed number of tasks. Evidence, not task count, remains decisive.'})
for gid in ids:
    assert aftergs[gid]['id'] == oldgs[gid]['id']
    assert aftergs[gid]['requires'] == oldgs[gid]['requires']
    assert aftergs[gid]['contains'] == oldgs[gid]['contains']
    assert aftergs[gid]['tags'] == oldgs[gid]['tags']
    assert aftergs[gid]['dimensionTags'] == oldgs[gid]['dimensionTags']
    assert aftergs[gid]['applicability'] == oldgs[gid]['applicability']
for gid in [atom,recyc,polar]: assert afterps[gid] == oldps[gid]
assert aftergs[atom]['description'] == oldgs[atom]['description'] and aftergs[atom]['descriptionEn'] == oldgs[atom]['descriptionEn']
write('CHECKS.finite-duty-conservation.actual.json', {'role':'Machine structural/duty preservation checks; not scientific review', 'checkedAtUTC':NOW, **status(), 'checks':checks,'wholeProfilesUnchanged':[atom,recyc,polar], 'existingIdsRequiresContainsTagsDimensionsAndApplicabilityExact':True,'newRequiresAreExplicitAuthorProposals':True,'noNormalFilesWrittenByThisScript':True})

source_rows = []
for ordinal, core, new in [(200,oil,bio),(232,drug,med)]:
    old = mapping['decisions'][ordinal-1]
    source_rows.append({'ordinal':ordinal,'sourceGoal':ref(SP,f'/sourceGoals/{ordinal-1}',source['sourceGoals'][ordinal-1]),
       'currentMappingDecision':ref(SM,f'/decisions/{ordinal-1}',old),
       'replaceOnlyCarrier':{'fromCanonicalGoalId':core,'toCandidateGoalId':new},
       'preserveEveryOtherCurrentCarrier':True,'relationRemains':'partial','singleGoalMasteryCompletesWholeOfficialSource':False,
       'wholeUnionReapprovalPending':True,'sourceCourseLevel':source['sourceGoals'][ordinal-1]['courseLevel'],
       'officialScopeBoundary':'Source232 actual courseLevel LK controls; the ID and within-table GK_LK span do not grant GK scope.' if ordinal==232 else 'Topic3.3 shared GK/LK mandatory per physical PDF37; full BTL/Fischer–Tropsch explanation remains LK in its separate existing goal, not a new GK route requirement.',
       'coreTargetRetention':str(OUT/'SCOPE.two-duty-partitions-and-core-retentions.pending.json')})
sourcepin = write('SOURCE.two-carrier-partitions.pending.json', {'role':'Author source-binding impact proposal; not source science approval or normal mapping patch',**status(),'rows':source_rows,'polarimetrySourceBindingsUnchanged':{'apparatus147':ref(SP,'/sourceGoals/146',source['sourceGoals'][146]),'inverseConcentration149':ref(SP,'/sourceGoals/148',source['sourceGoals'][148]),'noGKSource149Credit':True},'noOtherSourceUnionReviewOrChange':True})

def goalref(gid):
    index=next(i for i,x in enumerate(c['goals']) if x['id']==gid)
    return ref(CP,f'/goals/{index}',goals[gid])

def profilebefore(gid):
    i,r=prows[gid]
    return {**pin(PP),'format':'jsonl','lineOneBased':i+1,'jsonPointer':'/profile','wholeObjectSHA256':objsha(r['profile']),'originalProfileSource':r['profileSource']}

rationales = {
 atom:{'change':'Title and title-dependent resource labels only; D and whole P unchanged.', 'authorRationale':'Protons and neutrons are school-level atomic constituents, not elementary particles in modern physics. The complete P already states this explicitly. Rutherford evidence, Z/A/ionic-charge transfer and model limits remain one existing nucleus/shell competence.', 'countercase':'Calling a proton elementary would contradict the unchanged P solution even if the learner correctly counts Z/A/charge. Correcting the label adds no new competence.', 'pending':'Fresh D/title/resource context and V-context review remain open; exact JPG bytes are retained only as a candidate.'},
 recyc:{'change':'Hydrolysis is explicitly a pathway within feedstock recycling of suitable polymers, not a third same-level recovery route.', 'authorRationale':'PET ester cleavage produces small chemical feedstocks; PE without hydrolysable groups is not hydrolysed by this route. Mechanical recycling retains polymer chains, feedstock conversion does not directly yield ready plastic, and energy recovery remains distinguished. The whole current P/material already tests exactly these boundaries.', 'countercase':'A learner who calls hydrolysis an independent peer category or hydrolyses PE would fail unchanged case distinctions. The new description removes the misleading list without changing energy/source/economic/ecological obligations.', 'pending':'Independent D/A/P/M/V-context review of the exact successor remains open.'},
 oil:{'change':'Retain the exact structural oil-use first sentence and its two whole P cases. Move complete HB200 route/generation duty to the separate candidate.', 'authorRationale':'TG structure, mixture, properties, feedstock provenance and contextual use judgment form the oil competence. Pressing/work-up and distinguishing production/generation routes are separately assessable under a different supplied case.', 'countercase':'A learner can correctly identify TG/free-fatty-acid mixture and judge engine compatibility/provenance yet confuse fermentation, transesterification and pressing. Conversely, a process flow classification does not establish structural oil-use reasoning.', 'pending':'Core and separate-duty whole D/A/P/M/source/scope reviews remain pending; all old compact structure-memory references are retained.'},
 drug:{'change':'Retain exact coherent research→laboratory→plant→marketing first sentence and both whole salicylate P cases. Move complete HB232 historical/current societal judgment to the separate candidate.', 'authorRationale':'The process-chain competence connects scientific findings, scale/work-up, product-quality evidence, accepted supply and marketing feedback. Comparative societal access/effect/resistance judgment has an independent material, criteria and changed-resistance transfer.', 'countercase':'A learner may correctly update plant/marketing decisions after a purity/storage failure yet make an unsupported clinical-access judgment when equal-effect assumptions fail. A Nobel/current allocation comparison does not establish scale-dependent process reasoning.', 'pending':'No HB GK medication-society duty; exact4 old target coordinates retained across both candidates. Independent reviews and native D remain open.'},
 polar:{'change':'Explicitly include existing instrument principle and inverse known-solute concentration with stated-angle uncertainty in one precise D.', 'authorRationale':'Specific rotation and concentration are forward/inverse uses of α=[α]lc under the same blank/reference/purity/path conditions. The same measured model relation supports characterization, inversion and the uncertainty propagated from α. This is a connected measurement-evaluation competence rather than unrelated duties.', 'countercase':'Halving the path and angle together preserves c; an unmatched wavelength reference or multi-active-solute mixture prevents the same inversion. These are limits of the same measurement model. Explaining chirality alone is insufficient for this complete goal and unchanged P.', 'pending':'Author proposes one goal, subject to independent atomicity and D/P alignment review. No supplied fictional data becomes actual learner measurement. All five P cases remain exact; HB inverse concentration remains LK source scope.'},
}
records = []
for ordinal,gid in enumerate(ids,1):
    changed=[k for k in sorted(set(oldgs[gid])|set(aftergs[gid])) if oldgs[gid].get(k)!=aftergs[gid].get(k)]
    mi,m=mrows[gid]
    records.append({'caseOrdinal':ordinal,'goalId':gid,'beforeGoal':oldgs[gid], 'beforeGoalInput':goalref(gid),
      'afterGoal':aftergs[gid],'afterWholeGoalSHA256':objsha(aftergs[gid]),'changedTopLevelFields':changed,
      'beforeWholeProfile':oldps[gid],'beforeProfileInput':profilebefore(gid),
      'afterWholeProfile':afterps[gid],'afterProfile':profile_ref(gid),'wholeProfileUnchanged':oldps[gid]==afterps[gid],
      'authorReasoning':rationales[gid], 'existingMemoryRecord':{**pin(MP),'format':'jsonl','lineOneBased':mi+1,'wholeObjectSHA256':objsha(m)},
      'existingMemoryRecordRetainedExact':True,'memoryBoundary':'No automatic M approval is claimed for changed context. Keep all existing compact-recall bindings; new supplied route/societal judgment needs no additional card set as an AUTHOR hypothesis, pending independent whole-M review.',
      'wholeMaterialBindings':str(OUT/'MATERIAL.seven-complete-operative-bindings.json'), **status()})

newrecords=[]
for gid,core in [(bio,oil),(med,drug)]:
    newrecords.append({'goalId':gid,'afterGoal':aftergs[gid],'afterWholeGoalSHA256':objsha(aftergs[gid]),
       'profile':afterps[gid],'profileRef':profile_ref(gid),'splitFromGoalId':core,
       'authorAtomicityHypothesis':'One assessable supplied-route classification/explanation, including separation/transformation/generation limits.' if gid==bio else 'One reasoned historical/current societal evaluation with explicit criteria and revised efficacy assumptions.',
       'authorMemoryHypothesis':'No additional separate cards: feedstocks, routes and generation convention are supplied; explanatory distinctions and material balance must be applied rather than reciting unprovided facts.' if gid==bio else 'No separate cards: historical facts and current model values are supplied; evaluate access/effect/safety/resistance with evidence limits rather than memorizing names, year or fictional numbers.',
       'primaryImageBinding':None,'imageBoundary':'No PNG generated and no current image silently approved for this new goal. See image reuse options; new independent image/context review remains open.',
       'scopePlan':scopepin,'sourceBindingProposal':sourcepin, **status()})

authorpin=write('AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json', {
 'artifactType':'Finite AUTHOR remediation candidate, five existing goals plus two narrow duty candidates', 'authoredAtUTC':NOW,
 **status(),'ownContentLicense':'CC-BY-4.0','technicalScriptLicense':'Apache-2.0',
 'authorshipDisclosure':'This agent previously performed informed source/M/P reviews, authored HB view candidates and technical writer/provenance work, and reviewed the separate benzene-phase proposal. Here the same agent is AUTHOR of these new remediation candidates, not their independent reviewer. It read only the explicitly authorized sealed D batch001/004 matching records for this task; no claim of blind review is made.',
 'inputCanonical':pin(CP),'inputWholeProfiles':pin(PP),'records':records,'newCandidateGoals':newrecords,
 'profileCollection':profilepin,'scopeRetentionPlan':scopepin,'operativeMaterials':materialpin,
 'separatePhaseAdapterNotExecuted':True,'separateAgentP4NotDuplicated':True,
 'openGates':['Independent whole D/A/P/M and precise scope/source review of changed/new candidates','Primary media/context binding for new goals and fresh context V where required','Stock validation and final current-context D pages with two genuine independent reviews','Normal integration by root, any applicable native QA and strict M7; no human approval or trial supplied'],
 'noSilentObligationDeletion':True,'noMinimumThresholdLowering':True,'noSyntheticDataAsExecution':True})

# Native images remain existing bytes; options are evidence of applicability limits, not V approval.
images=[]
for gid in ids:
    for resource in oldgs[gid].get('resourceLinks',[]):
        if resource.get('type')=='goal-visualization':
            asset=Path('app/public'+resource['url'])
            images.append({'goalId':gid,'existingAsset':pin(asset),'candidateAssetBytesUnchanged':True,
              'freshContextApprovalClaimed':False,'actuallyNativeViewedInThisAuthorTask':gid in [atom,oil,drug],
              'context':'Old oil TG/properties/origin/environment composition fits the retained oil core; it does not explain the whole new route skill.' if gid==oil else 'Old research/lab/plant/marketing picture fits the retained process-chain core; it is at most a partial contextual cue for societal medicine judgment.' if gid==drug else 'No new visual approval from this author packet.'})
write('IMAGE.existing-byte-retention-and-limited-reuse-options.pending.json',{'role':'AUTHOR reuse options only; no new image or V review',**status(),'rows':images,
  'newGoalOptions':[{'goalId':bio,'primaryOption':None,'reason':'Current oil image does not represent all pressing/transesterification/fermentation/generation distinctions. No suitable whole-route primary reuse is established.'},
     {'goalId':med,'primaryOption':None,'possibleSecondaryContextAssetOfGoal':drug,'reason':'Process-chain image can introduce drug development but cannot evidence historical/current societal access, efficacy and resistance evaluation. No full primary fit established.'}]})

evidence_dir=OUTABS/'read-evidence'
evidence_dir.mkdir(exist_ok=True)
shutil.copyfile(ROOT/RP,evidence_dir/'actual-existing-target-and-support-roster.json')
shutil.copyfile(ROOT/'tmp/chemie442_five_author_actual_target_roster.mts',evidence_dir/'actual-existing-target-and-support-roster.mts')
readrows=[
 {'input':pin(CP),'actuallyRead':'Five complete current goal bodies; full9f892 body for reuse comparison; semantic fields of other narrow biofuel alternatives, not their full profiles.', 'locators':[goalref(x) for x in ids]},
 {'input':pin(PP),'actuallyRead':'All five complete selected profiles incl every expectation/coverage/variation and every DE/EN field in all operative cases. No full442-review claim.', 'locators':[profilebefore(x) for x in ids]},
 {'input':pin(mats['hb200']),'actuallyRead':'Entire DE/EN material: data, models, tasks, expected answers, fresh transfer, rubrics, learner placeholders and scientific/safety limits.'},
 {'input':pin(mats['hb208']),'actuallyRead':'Entire DE/EN recovery material, including energy/material balance and counterfactual limits.'},
 {'input':pin(mats['hb232']),'actuallyRead':'Entire DE/EN historical/current medicine material, equal-efficacy assumption, resistance transfer and clinical-evidence limits.'},
 {'input':pin(mats['polarimetry']),'actuallyRead':'Entire common envelope, instrument, equation and units/reference assumptions, both complete glucose/fructose case objects incl tasks/expected/transfer/rubric/limits. All data fictional, not learner observations.'},
 {'input':pin(mats['SH032']),'actuallyRead':'Entire common envelope and both complete DE/EN salicylate cases incl all fresh transfer, model answers, four rubrics, sources and boundaries. No real manufacture or clinical evidence.'},
 {'input':pin(mats['oldRecycling']),'actuallyRead':'Container metadata and exactly whole /cases/20 and /cases/21 incl all DE/EN givens/tasks/solutions/rubrics/boundaries; not the other38 historical cases.'},
 {'input':pin(Path('curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf')),'actuallyRead':'Actual original PDF text at complete physical3–8,21–22,26,31–32,34–37; physical36/37 additionally rendered and viewed as images. Matching framework context from9–16 only, not full9–16 reading. No official PDF full text copied into this package.',
   'operativePages':{'polarimetry':[26,37],'biofuel':[32,37],'recycling':[34,37],'medication':[36,37]},'scopeFinding':'Shared course column is local to the table. Page37 makes theme4.3 LK-only, while topic2.1 is from the GK1/LK2 selectable set; all authored-topic target policy creates no actual learner choice or universal official requirement.'},
 {'input':pin(Path('curricula/DE/Gymnasium/input/SH/Fachanforderungen_Chemie_Sekundarstufe_2022_barrierearm.pdf')),'actuallyRead':'Complete actual physical69–71 text, including shared/increased columns and theme scope, for retaining the connected SH032 process chain and distinguishing own interim topic inclusion from official optional theme status.'},
 {'input':pin(Path('curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf')),'actuallyRead':'Complete actual physical42 text for optical activity/polarimetry increased-LK boundary. Earlier separate phase work read38/41–43; this package does not claim fresh full re-reading of all those pages.'},
 {'input':pin(SP),'actuallyRead':'Whole exact sourceGoals146,148,199,231 (zero-based), scopeRules and sourceGoalProvenance for232; no new science review of all232.'},
 {'input':pin(SM),'actuallyRead':'Whole decisions199/231 (zero-based) to locate actual current carrier unions; no new acceptance inferred from prior source reviews.'},
]
drecords=[]
for batch in ['001','004']:
    for side in ['a','b']:
        dp=O/f'D-final-native/batch-{batch}/round-{side}/results/chemie-final-current-context-d-{batch}-v1-first-pass-{side}.batch-001.records.jsonl'
        matched=[]
        for i,line in enumerate((ROOT/dp).read_text().splitlines()):
            r=json.loads(line)
            if r.get('goalId') in [oil,recyc,drug]:
                matched.append({'lineOneBased':i+1,'goalId':r['goalId'],'wholeObjectSHA256':objsha(r)})
        drecords.append({'input':pin(dp),'matchingRecordsActuallyRead':matched,'boundary':'Only these explicitly authorized sealed matching findings were substantively read; parsing the other JSONL rows is not a claim of review.'})
write('READ.actual-input-pins-locators-and-author-boundaries.json', {'role':'Actual author read record, informed not blind',**status(),'inputs':readrows,'authorizedSealedDInputs':drecords,
   'alternativeReuseDecision':{'biofuel':'Existing biodiesel4d9defde, bioethanol a76ab487 and BTL abfa609d are narrower route skills; none is silently expanded to receive the whole extracted route/generation comparison.',
      'medicine':'Whole9f892 C/P read: broad chemical-process sustainability/history/current evaluation also requires all sustainability dimensions and own actions in other contexts. It is not stretched into the narrow medicine-society replacement.'},
   'noExternalPrimarySourceVerificationInvented':True,'currentMRecordsOnlyForExactRetentionNotNewApproval':[{'goalId':g,**pin(MP),'lineOneBased':mrows[g][0]+1,'wholeObjectSHA256':objsha(mrows[g][1])} for g in ids]})

readme = '''# Five Chemistry author remediations (inactive)

This is an AUTHOR candidate package, not an independent review, native D approval,
M7, Human Approval, Human Trial or normal activation. The author previously worked
on informed source/M/P review, HB views and technical integration; these new
candidates require separate independent judgment.

1. 72236: replace the inaccurate elementary-particle title by atomic constituents;
   keep both descriptions, whole P and existing JPG bytes. Resource labels follow
   the title. Fresh visual/context approval remains open.
2. 8721: state mechanical/feedstock recycling, with suitable-polymer hydrolysis
   inside feedstock recycling. Energy recovery and all evaluation duties remain.
3. 0959: retain the exact structural oil-use core and its two complete P cases;
   move the entire supplied HB200 route/generation case to a narrow new goal.
4. 3eb2: retain the exact coherent process-chain core and both complete salicylate
   cases; move the complete historical/current medicine-society judgment to a
   narrow new goal. HB232 is actually LK (PDF37), despite its GK_LK clause span.
5. f4d5: clarify the complete existing polarimetry measurement model in D,
   including inverse known-solute concentration and stated-angle uncertainty.
   All five complete P cases remain byte-equivalent as objects; no actual
   measurement, extra task quota or new universal GK source duty is claimed.

The two partitions conserve every original expectation, variation, complete case,
required ID and every other coverage value, including fresh/independent transfer.
Original fictional data, numerical diagnostic criteria, safety/model limits and
full DE/EN operative materials remain unchanged. All existing core requires and
memory references are retained. New empty-requires/no-additional-card proposals
are author hypotheses for independent review.

The scope plan conserves the actual existing32 oil and4 medicine target
coordinates for both parts. It proposes no BY biofuel import and no HB GK
medicine-society target. Non-HB retained routes and SH societal assessment are
explicit own acquisition proposals, not official source credit. The two old
BB/BE Scope42 declarations are kept as predecessors and partitioned explicitly;
their prior acceptance is not transferred to the new profile bodies.

See AUTHOR..., the seven full profiles, exact material bindings, finite
conservation checks, source-carrier impact proposal, scope plan and actual-read
record. Existing native records are not rewritten. No new image was generated;
neither new goal has an approved primary image. The separate benzene phase
adapter remains unexecuted. AgentA's separate four-P packet is not duplicated.

Own goal/material content: CC-BY-4.0. Technical assembly script: Apache-2.0.
Official PDFs remain external input files; their full text is not copied here.
'''
(OUTABS/'README.md').write_text(readme)
shutil.copyfile(Path(__file__),OUTABS/'assemble.author-candidates.py')
outputpins=[pin(p.relative_to(ROOT)) for p in sorted(OUTABS.rglob('*')) if p.is_file() and p.name!='SEAL.json']
sealpin=write('SEAL.json',{'sealedAtUTC':NOW,'role':'AUTHOR package seal; immutable candidates, not independent acceptance',**status(),'authorFile':authorpin,'outputs':outputpins,'inputsAtSeal':[pin(CP),pin(PP),pin(MP)],'noNormalMutation':True})
print(json.dumps({'package':str(OUT),'author':authorpin,'seal':sealpin,'newBioCandidateId':bio,'newMedicineSocietalCandidateId':med,'existingCases':5,'newCandidates':2,'scopeCoordinates':{'bio':32,'societal':4},'files':len(outputpins)+1},ensure_ascii=False,indent=2))
