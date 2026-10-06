# SPDX-License-Identifier: Apache-2.0
"""Bind a bounded author proposal and targeted checks; never approve it."""
import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
V4 = OUT.with_name('biologie-q1-four-current383-source-scope-author-remediation-v4')
A = OUT.with_name('biologie-q1-four-source-operator-v4-independent-a-v1')
B = OUT.with_name('biologie-q1-four-source-operator-v4-independent-b-v1')
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())
def write(name, data):
    (OUT/name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
def ref(p, use):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(raw), 'bytes': len(raw), 'actualUse': use}

candidate_path = OUT/'eleven-components-twentyfour-cases.author-candidate.json'
candidate = read(candidate_path)
by_key = {c['candidateKey']: c for c in candidate['components']}
# Precise DE wording for the new environmental case; no original case changed.
new_air = by_key['mutagen_causes_and_protection']['tasks'][-1]
new_air['solutionDe'] = new_air['solutionDe'].replace('garantierter Nullschutz', 'garantierte Expositionsfreiheit')
write(candidate_path.name, candidate)

status = 'addressed_author_proposal_pending_independent_targeted_followup'
write('review-findings-remediation.author-matrix.json', {
    'createdAtUTC': NOW, 'role': 'author after own v4 independent B freeze; no independent review of v5',
    'sourceReviewCounts': {'A': {'componentsKEEP':8,'componentsREVISE':3,'casesKEEP':18,'casesREVISE':4},
                           'B': {'componentsKEEP':10,'componentsREVISE':1,'casesKEEP':22,'casesREVISE':0,
                                 'mutagenSourceOperatorStillREVISE':True}},
    'disagreementResolutionMethod': 'Adopt explicit scope/model conventions for the concrete A objections; do not select a verdict by vote or turn B model acceptance into a v5 approval.',
    'rows': [
        {'finding':'mechanism-pro-euk-a abbreviated gene versus complete functional enzyme',
         'v4A':'REVISE: complete short gene and three-residue functional enzyme not explicitly separated',
         'v4B':'KEEP: supplied fictional enzyme-function assumption, bounded model',
         'v5Changes':'DE/EN material, task, solution and passing conditions explicitly show ATG GAA … TTT TGA as shorthand for a longer intron-free gene; carry omission through mRNA/product; separately supplied whole-enzyme function.',
         'preserved':'AUG/Met, GAA/Glu, UUU/Phe, UGA/stop; GAA/3′CUU5′=5′UUC3′; typical compartments/timing and all case B content', 'status':status},
        {'finding':'protein-function-a short codon display versus complete purified-protein assay',
         'v4A':'REVISE: no explicit longer-gene/fragment convention for complete three-residue model products',
         'v4B':'KEEP: supplied fictional functional assay, no actual enzyme identification claim',
         'v5Changes':'DE/EN six case fields and positive conditions explicitly show the same omitted long complete-codon region in all three genes; assays refer to complete longer proteins, not isolated three-residue peptides.',
         'preserved':'Reference/V/W substitutions and code; 100±4,12±2,98±4; equal amounts and conditions; limits on synonymous/function inference; case B exact', 'status':status},
        {'finding':'MV10 everyday reflection and ST10/E-phase genetic environmental risk evaluation',
         'v4A':'REVISE operator coverage; controlled cause/efficacy data correct',
         'v4B':'REVISE operator coverage; both controlled model P cases KEEP',
         'v5Changes':'Retain R/M controlled cases byte-equivalent as JSON objects; extend only null-ID mutagen description DE/EN to explicit criteria-based decision; add two complete DE/EN everyday/environmental decision cases with actual agency factual premises, supplied options, priorities, tradeoffs, reasoned solutions and inference limits.',
         'newCases':['everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d'],
         'status':status, 'wholeOriginalClearance':False, 'STStageIntegrationStillHeld':True},
    ],
    'pendingConditions': [
        'Independent A/B followup by other agents on the two revised and two new complete DE/EN cases and changed null-ID description',
        'Native final ID, source, placement, prerequisite and D/P/A/M/V binding before any active integration',
        'ST per-goal Einführungsphase scope must be natively proved; no whole-source stage-default change',
        'Held3417, SH2023/SH2026 cohort distinction, other source-stage/cohort debts, BY EA oncogenesis and separate PCR comparison remain open',
    ],
    'selfApproval':False,'nativeApproval':False,'humanApproval':False,'humanTrial':False,'newM7Credit':0,
})

primary = read(OUT/'actual-primary-curricular-and-factual-inputs.author.json')
curricular = {s['sourceKey']:s for s in primary['sources']}
source_rows = [
    {'sourceKey':'MV','actualOriginalClause':'das Gefahrenpotenzial von Mutagenen im alltäglichen Leben reflektieren',
     'location':'2022 retained official framework, Klasse10, classical genetics; printed26/physical30, example linking content/process B',
     'sourceClauseRole':'Original process example; not a newly invented universal taxonomy requirement',
     'actualOriginalPath':curricular['MV']['actualOriginalPath'],'originalSHA256':curricular['MV']['sha256'],
     'proposedCases':['everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d'],
     'requiredPositiveEvidence':'Connect the named daily exposure to bounded genetic hazard; compare material-backed options; expose weighting, tradeoff and justified choice; reflect on limits instead of only selecting a shielding label.',
     'status':status,'contribution':'bounded daily-mutagen reflection component','wholeOriginalClearance':False},
    {'sourceKey':'ST','actualOriginalClause':'Umwelteinflüsse unter dem Aspekt der genetischen Risiken bewerten',
     'location':'Fachlehrplan01.08.2022, printed/physical43, Bewertungskompetenz; chapter3.5 printed/physical42 Schuljahrgang10 (Einführungsphase)',
     'actualOriginalPath':curricular['ST']['actualOriginalPath'],'originalSHA256':curricular['ST']['sha256'],
     'proposedCases':['everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d'],
     'requiredPositiveEvidence':'Use the supplied genetic-hazard premise and option data; state normative priorities, evaluate all options, justify action despite a cost, and delimit missing measurements and individual-risk inference.',
     'status':status,'contribution':'bounded genetic-environment risk evaluation component','wholeOriginalClearance':False,
     'actualStageClause':'Schuljahrgang 10 (Einführungsphase)','nativePerGoalStageCorrectionProven':False,'integrationHeld':True},
    {'sourceKey':'HE','actualOriginalClause':'Ablauf der Proteinbiosynthese bei Pro- und Eukaryoten: Transkription, Struktur und Funktion von mRNA, Translation, Ribosom, tRNA, genetischer Code einschließlich des Umgangs mit der Code-Sonne',
     'location':'KC2024 Q1.1, printed/physical38, grundlegendes Niveau (Grundkurs und Leistungskurs)',
     'actualOriginalPath':curricular['HE']['actualOriginalPath'],'originalSHA256':curricular['HE']['sha256'],
     'proposedCases':['mechanism-pro-euk-a'],
     'requiredPositiveEvidence':'Connected molecular roles, antiparallel pairing and typical compartment/timing comparison, retaining the explicit omitted-gene convention; code-wheel cases remain exact.',
     'contribution':'same bounded mechanism component with clarified model','status':status,'wholeOriginalClearance':False},
    {'sourceKey':'BY12-GA/EA','actualOriginalClause':'erläutern deren Auswirkung auf die Funktion des codierten Proteins',
     'location':'Actual official LehrplanPLUS Gymnasium12 Biologie GA and EA, Lernbereich2.4, shared mutagen/Genmutation competence clause',
     'actualOriginalPaths':[str((B/'primary-BY12-GA.actual.html').relative_to(ROOT)), str((B/'primary-BY12-EA.actual.html').relative_to(ROOT))],
     'proposedCases':['protein-function-a'],'requiredPositiveEvidence':'Display correct local product change and connect it to controlled measurements on the complete longer protein, preserving supplied spread and inference limits.',
     'contribution':'same bounded protein-function component with clarified full-protein assay','status':status,'wholeOriginalClearance':False,
     'EAOncogenesisAndSeparatePCRComparison':'open; not covered by these case changes'},
]
write('source-operator-contributions.author-matrix.json',{
    'createdAtUTC':NOW,'role':'author proposal source-to-material matrix, not source coverage certification',
    'rows':source_rows,
    'factualPremiseSourceLocations':[
        {'sourceKey':'BfS-UV-protection','location':'Official BfS StrahlenschutzFokus2022/3 UV section, protection advice on clothing, shade and low-UV activity times','scope':'qualitative exposure-reduction approaches only'},
        {'sourceKey':'BfS-UV-DNA','location':'Official BfS commissioned report Nudging im Strahlenschutz, printed10/physical13 introduction','scope':'general solar UV/DNA harm and possible genetic consequences; no transferred disease percentages'},
        {'sourceKey':'UBA-benzoapyrene','location':'Official UBA Benzo(a)pyren im Feinstaub page, properties and formation sections','scope':'incomplete wood combustion, particle-bound PAH/benzo(a)pyrene and harmful metabolites; no imported legal threshold'},
        {'sourceKey':'IARC-air-DNA','location':'IARC Scientific Publication161 chapter12, physical1/printed149, Biomarkers of air pollution: DNA and protein adducts','scope':'PAH metabolites/DNA adducts, repair and possible mutations; no actual case exposures or person-risk calculation'},
    ],
    'sourceCopyAndMappingStatus':{'existing17InertSourceMappingPayloads':'unchanged and bound by actual v4 refs; no copied mapping directories',
                                 'componentMaterialStatus':'addressed author proposal, pending independent followup',
                                 'partialVersusWholeOriginal':'partial bounded contribution; no exact/whole-original upgrade',
                                 'wholeOriginalClearance':False,'sourceStageDefaultsChanged':False,'STStageHeld':True,
                                 'SHOutgoing2023VersusNew2026':'unchanged/open','nativeSourceCompilerRunByV5':False},
    'numbersAndDecisionContexts':'All new numbers, exposure units, priorities and feasible alternatives are explicitly fictional supplied material; only qualitative factual premises come from the separately bound actual official sources.',
})

# Meaningful targeted preservation/shape checks only. No full builds or global M7 loops.
old_components = read(V4/'four-main-components-eight-positive-cases.author-candidate.json')['components'] + read(V4/'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json')['components']
id_of = lambda t: t.get('caseKey',t.get('caseId'))
old_cases = {id_of(t):t for c in old_components for t in c['tasks']}
new_cases = {id_of(t):t for c in candidate['components'] for t in c['tasks']}
changed = [key for key,t in old_cases.items() if new_cases[key] != t]
added = sorted(set(new_cases)-set(old_cases))
assert set(changed)=={'mechanism-pro-euk-a','protein-function-a'}
assert len(new_cases)==24 and len(candidate['components'])==11
assert added==['environment-air-pah-risk-decision-d','everyday-uv-risk-decision-c']
assert sum(c['canonicalGoalId'] is None for c in candidate['components'])==7
assert all(c['newAssignedGoalId'] is None for c in candidate['components'])
for key,t in new_cases.items():
    if 'materialDe' in t:
        fields=['materialDe','promptDe','solutionDe','materialEn','promptEn','solutionEn']
    else:
        fields=['material','task','solution','materialEn','taskEn','solutionEn']
    assert all(isinstance(t[f],str) and t[f].strip() for f in fields),(key,fields)
    assert t.get('positiveEssentialConditions',t.get('positiveEssentialPassingConditions'))
assert 5*12==60 and 5*2==10 and 5*11==55
assert 10<25<100 and 2+0.5<12-1
assert new_cases['mutagen-protection-a']==old_cases['mutagen-protection-a']
assert new_cases['mutagen-protection-b']==old_cases['mutagen-protection-b']
delta=read(OUT/'precise-v4-v5-delta-and-preservation.actual.json')
assert sha((ROOT/delta['unchangedCanonicalReference']).read_bytes())==delta['unchangedCanonicalSHA256']
assert sha((ROOT/delta['priorProfileReference']).read_bytes())==delta['priorProfileSHA256']
for f in delta['reviewedInputFreezes']:
    fp=ROOT/f['path'];assert sha(fp.read_bytes())==f['sha256']
    for item in read(fp)['files']:
        actual=(fp.parent/item['path']).read_bytes();assert sha(actual)==item['sha256'] and len(actual)==item['bytes']
v4_bound={x['path']:x for x in read(V4/'author-source-scope-remediation-v4.final.freeze.json')['files']}
overlay_paths=sorted((V4/'source-overlays-inert').glob('*.json'))
assert len(overlay_paths)==17
for p in overlay_paths:
    assert sha(p.read_bytes())==v4_bound[str(p.relative_to(V4))]['sha256']
write('meaningful-targeted-author-checks.actual.json',{
    'createdAtUTC':NOW,'role':'author implementation checks, not independent scientific approval',
    'result':'PASS for the enumerated bounded checks',
    'componentCount':11,'completeBilingualCases':24,'originalCasesExactlyPreserved':20,'revisedOriginalCases':sorted(changed),'newCases':added,
    'checks':{'sixCompleteDEENFieldsAndPositiveConditionsForAll24':True,'onlyTwoOriginalCaseObjectsRevised':True,
              'controlledMutagenCasesExact':True,'sevenNullIDsStillNull':True,'allExistingPartnerIDsUnchanged':True,
              'canonical464WholeGoalsAndFourOperativeDescriptionsReferencedExact':True,'fourPriorPProfilesEightPriorBodiesReferencedExact':True,
              'all17ExistingInertSourceMappingPayloadsStillMatchFrozenV4':True,'v4AuthorAndBothReviewOwnFreezesVerified':True,
              'newFiveDayCentralSums60_10_55Correct':True,'newOptionRanksConsistentWithSuppliedCriteria':True,
              'sourceStageAndMappingDefaultsChanged':False},
    'manualAuthorBoundaryCheck':'Displayed codons remain correct; omissions explicitly retain reading frame and are not codons. Complete enzyme-function/assay data are separately supplied. No omitted protein sequence or disease-risk percentage is inferred.',
    'compilerRuns':0,'globalQualityRuns':0,'activeWrites':0,'currentM7NetIncrease':0,'independentApproval':False,'humanApproval':False,'humanTrial':False,
})

# Bind only actual used inputs; the old author freeze retains its full 179-input chain.
inputs=[]
for p,use in [
    (ROOT/'AGENTS.md','binding project rules, especially7.1/7.2/7.4'),
    (V4/'author-source-scope-remediation-v4.final.freeze.json','immutable v4 author63-file/179-input chain'),
    (A/'independent-a.final.freeze.json','actual frozen v4 review A'),(A/'review.md','actual v4 A objections'),
    (A/'eleven-components-twenty-two-cases.independent-a.json','actual component/case verdicts A'),
    (B/'independent-b-v4.final.freeze.json','actual frozen v4 review B, completed before role change'),
    (B/'README.md','actual v4 B judgments and boundaries read as author'),
    (B/'component-and-case-decisions.independent-b.json','actual B component/case judgments'),
    (B/'primary-inputs.actual.json','actual previously retrieved original-source refs'),
    (B/'primary-BY12-GA.actual.html','actual original GA shared protein-function clause'),
    (B/'primary-BY12-EA.actual.html','actual original EA shared clause and separate open extensions'),
    (B/'primary-NCBI-standard-code.actual.html','actual standard-code source retained without code changes'),
    (V4/'four-main-components-eight-positive-cases.author-candidate.json','original four component/eight case authored inputs'),
    (V4/'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json','original seven prototype/fourteen case authored inputs'),
    (V4/'canonical-preserved.inert-envelope.json','unchanged464 whole goals and four operative descriptions'),
    (V4/'positive-four.native-candidate-records.json','unchanged four prior P records/eight original bodies'),
    (V4/'prerequisite-and-source-integration-plan.author.json','unresolved native prerequisite/ID/placement boundaries'),
    (V4/'separate-real-open-source-boundaries.author.json','separate held original-source obligations'),
    (V4/'thirteen-retained-partial-lanes.inert-payload-index.json','existing partial source lane index; no whole-original clearance'),
]: inputs.append(ref(p,use))
objective=Path('/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md')
raw=objective.read_bytes();inputs.append({'path':str(objective),'sha256':sha(raw),'bytes':len(raw),'actualUse':'binding task objective'})
for p in overlay_paths: inputs.append(ref(p,'unchanged existing inert source/mapping payload; retained exact, not promoted'))
for s in primary['sources']:
    for field in ['actualOriginalPath','independentlyExtractedActualTextPath','actualRawPath','actualExtractedTextPath']:
        if s.get(field): inputs.append(ref(ROOT/s[field],f"actual source {s['sourceKey']} {field}"))
write('actual-used-inputs.author-v5.freeze.json',{'createdAtUTC':NOW,'role':'actual author inputs and fixed original references',
    'files':inputs,'inputCount':len(inputs),'copiedLandscapeOrMappingTrees':0,'oldV4CompleteInputChain':'retained through bound original v4 final freeze, not duplicated',
    'nativeMutableWorkDirectory':'tmp/biologie-q1-source-operator-author-remediation-20261006-v5'})

# README is authored separately and included as exact own bytes.
assert (OUT/'README.md').exists()
own=[]
for p in sorted(OUT.iterdir()):
    assert p.is_file(),'No nested payload trees allowed'
    if p.name!='author-source-operator-v5.final.freeze.json':
        raw=p.read_bytes();own.append({'path':p.name,'sha256':sha(raw),'bytes':len(raw)})
write('author-source-operator-v5.final.freeze.json',{'schemaVersion':1,'createdAtUTC':NOW,
    'role':'AUTHOR v5 candidate; own v4 B review completed before author role; no self-approval',
    'files':own,'ownFileCount':len(own),'actualInputCount':len(inputs),
    'candidate':'eleven-components-twentyfour-cases.author-candidate.json',
    'scope':'11 bounded components;24 complete DE/EN cases;20 originals exact;2 original model conventions revised;2 new decision cases',
    'newAssignedGoalIDs':0,'canonicalWholeGoalsChanged':0,'oldPBodyChanges':0,'activeWrites':0,
    'independentFollowupPending':True,'nativeD_P_A_M_V_Approval':False,'wholeOriginalClearance':False,
    'currentM7NetIncrease':0,'humanApproval':False,'humanTrial':False})
final=OUT/'author-source-operator-v5.final.freeze.json'
for f in read(final)['files']:
    raw=(OUT/f['path']).read_bytes();assert sha(raw)==f['sha256'] and len(raw)==f['bytes']
for f in inputs:
    p=Path(f['path']);p=p if p.is_absolute() else ROOT/p
    raw=p.read_bytes();assert sha(raw)==f['sha256'] and len(raw)==f['bytes']
print(json.dumps({'freezeSHA256':sha(final.read_bytes()),'ownFiles':len(own),'actualInputs':len(inputs),'candidateCases':24,'independentFollowupPending':True,'activeWrites':0}))
