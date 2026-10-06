#!/usr/bin/env python3
"""Apache-2.0. Materialize independent targeted review A and bind its inputs."""
from pathlib import Path
import json, hashlib, datetime, re
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
V5=OUT.parent/'biologie-q1-four-source-operator-author-remediation-v5'
V4=OUT.parent/'biologie-q1-four-current383-source-scope-author-remediation-v4'
def read(p):return json.loads(p.read_text())
def h(b):return hashlib.sha256(b).hexdigest()
def canon(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def save(n,v):(OUT/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
class Text(HTMLParser):
    def __init__(self):super().__init__();self.parts=[]
    def handle_data(self,s):self.parts.append(s)
def plain(n):
    p=Text();p.feed((OUT/n).read_text());return re.sub(r'\s+',' ',' '.join(p.parts))
ncbi=plain('primary-NCBI-standard-code.actual.html')
table=re.search(r'AAs\s*=\s*([A-Z*]{64}).*?Base1\s*=\s*([TCAG]{64}).*?Base2\s*=\s*([TCAG]{64}).*?Base3\s*=\s*([TCAG]{64})',ncbi)
assert table
aas,b1,b2,b3=table.groups(); code={a+b+c:aa for a,b,c,aa in zip(b1,b2,b3,aas)}
codons={'ATG':'M','GAA':'E','GAG':'E','GAC':'D','TTT':'F','TTC':'F','TGA':'*','TAA':'*','TAG':'*','AAA':'K','AAG':'K','TGC':'C','TGT':'C','GGT':'G'}
assert all(code[c]==aa for c,aa in codons.items())
quantitative={
 'independentNCBIStandardCodeMappings':{c:code[c] for c in codons},
 'anticodon':{'codon5to3':'GAA','pairedAnticodon3to5':'CUU','sameAnticodon5to3':'UUC','antiparallelComplementCorrect':True},
 'proteinFunctionA':{'referenceRange':[96,104],'VRange':[10,14],'WRange':[94,102],'VStronglyReducedInSuppliedAssay':True,
                    'WOverlapsReference':True,'statisticalSignificanceClaimMade':False,'equalPurifiedCompleteProteinAmountsGiven':True},
 'UVDecision':{'exposureCentralValues':{'A':100,'B':25,'C':10},'allOptionsFeasibleAndParticipationPreserved':True,
               'givenPriorityChoice':'C','conditionalFixedScheduleChoice':'B','unitsAreDiseaseProbabilities':False},
 'PAHDecision':{'fiveDayCentralExposureSums':{'A':12*5,'B':2*5,'C':11*5},'dailyRanges':{'A':[11,13],'B':[1.5,2.5],'C':[10,12]},
                'AAndCRangesOverlap':True,'BLowerThanBoth':True,'statisticalErrorAggregationPerformed':False,
                'busSafetyAndAccessGiven':True,'weatherTransferRequiresNewMeasurements':True},
 'repairExamples':{'aCorrectNewStrand5to3':'ATGC','bCorrectNewStrand5to3':'CATG','wrongPositionBoth':3},
 'modelConventionCases':['mechanism-pro-euk-a','protein-function-a'],'threeResidueFunctionalEnzymeClaimMade':False}
save('codon-control-and-decision-material-checks.independent-a.json',quantitative)

candidate=read(V5/'eleven-components-twentyfour-cases.author-candidate.json')
preservation=read(OUT/'v4-v5-preservation.actual-independent-a.json')
hashByCase={r['caseId']:r for r in preservation['cases']}
caseNotes={
 'mechanism-pro-euk-a':('accept_targeted_revised_material','Explicit longer intron-free complete gene; the ellipsis represents unknown complete codons in frame. RNA/product retain the omission. Full enzyme function is independently supplied, not derived from Met/Glu/Phe. Correct antiparallel GAA/CUU pairing and typical P/E compartment/timing contrast. DE/EN agree.'),
 'protein-function-a':('accept_targeted_revised_material','Reference/V/W share an explicitly long omitted region. GAA/GAC/GAG gives Glu/Asp/Glu; UUC gives Phe and UAA stop. Equal purified complete proteins are assayed under equal conditions. 100±4 versus 12±2 supports impaired tested activity; 98±4 overlaps reference. No universal synonymous neutrality, unknown-sequence reconstruction or three-residue enzyme inference.'),
 'everyday-uv-risk-decision-c':('accept_targeted_new_decision_material','Actual everyday school sport context; UV/DNA genetic hazard, three feasible alternatives, 100/25/10 exposure units, participation and ordered criteria supplied. Learner must compare all choices, justify C despite organisation, reflect on conflict and conditional B, reject warmth as sufficient evidence, and delimit individual/disease-percentage inference. This supplies reflection/evaluation rather than a repair-only explanation.'),
 'environment-air-pah-risk-decision-d':('accept_targeted_new_decision_material','Named wood-smoke PAH/benzo(a)pyrene context with DNA-adduct hazard, safe access, equal waiting time and time cost. Five-day central sums 60/10/55 are correct; A/C spread overlaps and screen is not a filter. Choice B requires criteria/priority justification. Missing weather data, follow-up exposure measurement and lack-of-visible-smoke/symptom inference are mandatory. Exposure sums never become personal disease probabilities.')}
unchangedNotes={
 'classical-carriers-a':'Nesting and chromosome/gene count inference are bounded by the supplied model.',
 'classical-carriers-b':'Same-location alleles remain distinct from chromosome counts and phenotype inference.',
 'gene-chain-a':'Both enzyme steps and A/B/C pathway outcomes remain exact; no universal one-gene trait rule.',
 'gene-chain-b':'Transport/catalysis and 20/2/1 residual outcomes remain exact, with independent protein-role limits.',
 'code-wheel-a':'Forward wheel route and coding strand T→U remain exact; reverse nonuniqueness belongs to preserved canonical semantics.',
 'code-wheel-b':'Both valid coding-DNA/RNA alternatives remain exact and cannot identify measured original DNA.',
 'mechanism-pro-euk-b':'New RNA export and charged-tRNA intervention controls are explicit; existing proteins are not counted or destroyed.',
 'levels-a':'Local sequence, multi-gene segment copy and whole-chromosome counts remain distinct; test function is confined to case 1.',
 'levels-b':'Deletion, inversion and chromosome loss remain scale-specific; unspecified functions/traits stay open.',
 'point-genome-a':'Single C→T position and 4→5 chromosome comparison remain exact, under the bounded point-mutation convention.',
 'point-genome-b':'Single A→T versus chromosome absence remains exact; additional sequence examination is correctly required.',
 'mutagen-protection-a':'Controlled 0.3/2.7/0.6 percent comparison and nonzero background remain exact; causal/protection evidence only, without the new multi-option value judgement.',
 'mutagen-protection-b':'Controlled contact/closed-system comparison remains exact; covering alone does not prove protection. This remains partial evidence for the enlarged prototype.',
 'lineage-a':'Supplied K/G separation and participating-gamete condition remain exact.',
 'lineage-b':'Early/late lineage timing and unused gamete remain distinct; transmission is not guaranteed.',
 'mutation-modification-a':'Supplied unchanged genome and light controls remain exact; appearance does not prove genome identity.',
 'mutation-modification-b':'Confirmed variant and reversible temperature contribution remain distinct; single-variant causation is not inferred.',
 'protein-function-b':'Changed short segment belongs to longer binding protein; full-codon deletion is in frame, binding spread and other functions remain bounded.',
 'repair-a':'Position-3 complement and 30−24=6 unresolved mismatches remain exact; unresolved is not automatically fixed.',
 'repair-b':'Position-3 error and CATG correction remain exact; detection alone cannot preserve sequence.'}
atomicReasons={
 'classical_genetic_information_carriers_dna_gene_chromosome':'One content relation: genetic-information material, section and carrier nesting. Gene/allele wording applies the same relation; chemistry/replication are excluded.',
 'by9_gene_product_trait_genwirk_chain':'One causal gene-product-trait pathway competence; transport versus enzyme is a supplied role distinction in that pathway.',
 'he_code_sun_forward_and_existing_reverse':'One code mapping competence used forward and as a nonunique inverse. HE contribution is forward use only.',
 'he_pro_euk_mrna_ribosome_trna_mechanism':'One connected protein-formation mechanism in two typical model compartments, with renewal as supplied purpose.',
 'mutation_levels_gen_chromosome_genome':'One scale-classification competence, justified from model changes and their immediate information consequences; no independent disease diagnosis target.',
 'point_and_genome_mutation':'One distinction between single-position and chromosome-number changes; measurements support that distinction.',
 'mutagen_causes_and_protection':'One connected competence: justify a protective decision from a supplied genetic hazard and context. Causal explanation is the descriptive basis and criteria evaluation is the action justification within the same bounded risk problem. Verb count alone does not create separate content goals; see AGENTS 7.1. Do not certify the full expanded target from old R/M mechanism cases alone.',
 'somatic_and_germline':'One lineage-dependent consequence competence; timing and participating gametes are variables of the same model.',
 'mutation_vs_modification':'One evidence-based distinction between changed genotype and environmental trait variation, including co-occurrence.',
 'protein_function_from_mutation_data':'One evidence chain from a mutation to the specifically measured complete-protein function; uncontrolled trait forecasts are excluded.',
 'replication_error_control_and_repair':'One information-preservation mechanism; checking and correction are linked stages, and mismatch/fixation are bounded consequences.'}
memoryReasons={
 'classical_genetic_information_carriers_dna_gene_chromosome':'The supplied model tests nesting/relation rather than unaided vocabulary recall. No additional deck is justified solely by named terms.',
 'mutation_levels_gen_chromosome_genome':'Scale interpretation from supplied data is the target; compact names do not by themselves require a second taxonomy deck.',
 'point_and_genome_mutation':'The working convention and comparison material are supplied; deliberate classification does not justify duplicating definition cards.',
 'mutagen_causes_and_protection':'Criteria-based hazard/action reasoning and limits are the target; no independent hard recall item is necessary.',
 'somatic_and_germline':'Trace the supplied lineage and reproduction conditions rather than memorise an unqualified inheritance slogan.',
 'mutation_vs_modification':'Interpret genotype/environment controls; slogan recall cannot replace that evidence.',
 'replication_error_control_and_repair':'Explain checking, correction and persistence in the provided model. Pairing rules are supplied, and existing prerequisite recall/card decisions must retain their own bindings.'}
components=[]
for c in candidate['components']:
    rows=[]
    for t in c['tasks']:
        cid=t.get('caseId',t.get('caseKey')); proof=hashByCase[cid]
        verdict,note=caseNotes.get(cid,('unchanged_exact_body_retained_no_old_review_restarted',unchangedNotes.get(cid)))
        assert note
        rows.append({'caseId':cid,'classification':proof['classification'],'sha256CanonicalJSON':proof['afterSHA256CanonicalJSON'],
                     'decision':verdict,'DEENRead':True,'reason':note,'nativePApproval':False,
                     'wholeExpandedMutagenTargetCovered':False if cid.startswith('mutagen-protection') else None})
    null=c['canonicalGoalId'] is None
    components.append({'candidateKey':c['candidateKey'],'canonicalGoalId':c['canonicalGoalId'],'newAssignedGoalId':None,
       'descriptionDEENActualReviewed':True,'descriptionChangedVsV4':c['candidateKey']=='mutagen_causes_and_protection',
       'semanticAtomicity':{'candidateDecision':'atomic','semanticAtomic':True,'reason':atomicReasons[c['candidateKey']],
           'nativeLedgerApproval':False,'scope':'prototype semantics / v5 targeted consistency; unchanged old decisions not superseded'},
       'memoryReview':{'candidateRecommendation':'no_memory_needed' if null else 'existing_memory_lane_not_reopened',
           'reason':memoryReasons.get(c['candidateKey'],'Existing whole-goal card dispositions are preserved; no native M decision is added by this material review.'),
           'nativeLedgerApproval':False,'newDeckOrCardRequiredByThisDelta':False},
       'cases':rows,'integrationPending':True,'nativeD_P_A_M_V_Approval':False,'wholeSourceClearance':False})
save('eleven-components-twentyfour-cases.independent-a.json',{'role':'fresh independent targeted review A; no authorship or peer review consultation',
 'inputFinalFreezeSHA256':'094baede3989a387d5e77f98611356f4c49bf4f0f5ff68165531fb59268f2e82',
 'decision':'accept_v5_targeted_material_changes_with_existing_integration_holds','newWordingMaterialDefects':[],
 'components':components,'wholeOriginalClearance':False,'nativeD_P_A_M_V_Approval':False,'activeWrites':0,
 'currentM7NetIncrease':0,'humanApproval':False,'humanTrial':False})

sourceRecordRows=[]
sourcePaths={
 'HE':(V4/'source-overlays-inert/source-03.candidate-envelope.json','098832af-d236-4b95-8dd6-c8d45ba2293b',True),
 'BY12-GA-EA':(V4/'source-overlays-inert/source-02.candidate-envelope.json','ef3a58c6-09b3-5e91-80a0-fb3857268603',True),
 'MV':(ROOT/'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_BIOLOGIE_SEKI_RAHMENPLAN_2022.source-extraction.json','mv-biology-seki-rahmenplan-2022-j10-genetik-11-chromosomen-dna-proteinbiosynthese-zellteilung-mendel-genetik-und-mutationen-erklaren',False),
 'ST':(ROOT/'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_BIOLOGIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json','st-biology-seki-fachlehrplan-2022-sj10-genetik-10-genetik-vererbung-proteinbiosynthese-mutation-humangenetik-und-gentechnik-erklaeren',False)}
for name,(p,i,envelope) in sourcePaths.items():
    d=read(p); payload=d['candidatePayload'] if envelope else d; g=next(x for x in payload['sourceGoals'] if x['id']==i)
    sourceRecordRows.append({'sourceKey':name,'containerPath':str(p.relative_to(ROOT)),'containerSHA256':h(p.read_bytes()),
      'sourceGoalId':i,'completeRetainedRecordSHA256CanonicalJSON':h(canon(g)),'fullRecordKeys':list(g),
      'recordScope':'entire current retained record, not a replacement narrow contribution',
      'retainedRecordEqualsCompleteOfficialOriginalText':None if envelope else False,
      'rawOfficialTextPresent':bool(g.get('rawSourceText')),'wholeSourceMappingApproved':False,
      'completeRecordIsNotCompleteCurriculumCoverage':True})
sourceReview={'primaryClauses':[
 {'sourceKey':'MV','actualLocation':'printed26/physical30, classical genetics, B process-linking example',
  'actualOperator':'das Gefahrenpotenzial von Mutagenen im alltäglichen Leben reflektieren',
  'sourceRole':'explicit process-performance example; not transformed into a newly universal taxonomy requirement',
  'targetedContributionAccepted':['everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d'],'wholeSourceClearance':False},
 {'sourceKey':'ST','actualLocation':'printed/physical42-43, chapter3.5',
  'actualOperator':'Umwelteinflüsse unter dem Aspekt der genetischen Risiken bewerten',
  'actualStage':'Schuljahrgang 10 (Einführungsphase)','stageIntegrationHeld':True,
  'targetedContributionAccepted':['everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d'],'wholeSourceClearance':False},
 {'sourceKey':'HE','actualLocation':'physical38, Q1.1 basic level',
  'contribution':'mechanistic P/E sequence and molecular roles; forward code-wheel use retained exact; reverse translation is existing canonical content, not an invented literal HE demand',
  'modelConventionAccepted':'mechanism-pro-euk-a','wholeSourceClearance':False},
 {'sourceKey':'BY12-GA-EA','actualLocation':'current official B12 2.4, both levels',
  'contribution':'mutagen causes, controlled protein-function interpretation and protective sensitisation are shared; two whole records/occurrences retained',
  'modelConventionAccepted':'protein-function-a','EAOncologyAndSeparatePCRStillOpen':True,'wholeSourceClearance':False}],
 'qualitativeFactualPremises':[{'sourceKey':'BfS-UV-DNA','location':'physical13/printed10','scope':'UV damage/genetic consequences and shade/clothing/avoidance of midday sun; fictional case numbers are not sourced probabilities'},
  {'sourceKey':'BfS-UV-protection','scope':'official shade/skin-covering protection approaches; low-UV time support is also in the separately bound BfS report'},
  {'sourceKey':'UBA-benzoapyrene','scope':'incomplete wood combustion, particle-bound benzo(a)pyrene, harmful metabolites; no imported legal limit'},
  {'sourceKey':'IARC-air-DNA','location':'physical1/printed149','scope':'PAH-related DNA adducts, DNA repair and potential mutation; no individual dose-risk equation'}],
 'completeRetainedSourceRecords':sourceRecordRows,
 'snapshotBoundary':'Entire retained record objects are separately identified by hash and keys. The v5 operator clauses and cases are bounded contributions only. MV/ST existing compact paraphrase records are not falsely labelled full original text; the original official PDF pages establish the exact operators. No narrow witness grants full mapping.',
 'sourceMappingEnvelopesUnchanged':17,'wholeOriginalClearance':False}
save('primary-source-operators-and-snapshot-boundaries.independent-a.json',sourceReview)

holds=[
 {'holdId':'native-IDs-bindings-routes','status':'pending_integration_gate','detail':'All seven canonical IDs remain null. Actual contains/requires/applicability, source/component binding, route/projection and native D/P/A/M/V work are future gates. Missing future bindings are not defects in the reviewed wording.'},
 {'holdId':'ST-stage','status':'retained','detail':'Original chapter states Schuljahrgang10 (Einführungsphase). Existing source extraction remains SekundarstufeI, and no native per-goal stage correction/projection is proven. Material quality does not clear this hold.'},
 {'holdId':'3417-NI-whole-goal','status':'retained','goalId':'3417bb28-e707-57fc-8484-311d4966e26a','detail':'Mutation/recombination whole goal and its assortment/segment-exchange prerequisites remain intact. Regional mutation-only duties cannot import the whole NI goal or be removed before independently reviewed bounded replacement binding.'},
 {'holdId':'SH-cohort','status':'retained','detail':'Frozen2023 remains outgoing/legacy evidence. No substantive new2026 entry-cohort review or closure is established.'},
 {'holdId':'BY-EA-oncology','status':'retained','sourceGoalId':'ae888e32-ca41-555b-9fe6-c00c77c234c8','partnerGoalId':'7f76ff0b-218b-568d-91df-20bbe2b156e2','detail':'Current EA primary adds oncogene/anti-oncogene cancer and tumour cell-cycle/apoptosis competence; mutation protection/function cases do not supply a separate complete oncology binding, nor prove all metastasis semantics of the existing whole partner.'},
 {'holdId':'BY-EA-PCR-comparison','status':'retained','partnerGoalId':'76ad2d40-496b-5fa8-97e8-7711f9859738','detail':'Actual EA 2.3 includes replication, repair and comparison with PCR. Simple repair cases do not close that separate full upper-stage comparison or its prerequisites.'},
 {'holdId':'BY9-structural-diversity','status':'retained','sourceGoalId':'caa62aba-fb03-5b28-8df1-d09624168990','partnerGoalId':'28850d2e-062d-5341-ac66-bd787a8fc84f','detail':'Gene-product pathway is a bounded contribution; protein structural diversity remains separately bound, without new whole-goal approval.'},
 {'holdId':'whole-source-and-human-acceptance','status':'retained','detail':'No whole-source closure, Human Approval or Human Trial. Old review freezes and active evidence remain untouched.'}]
statusPath=ROOT/'docs/qa-ci/status/curriculum-quality-status.json';status=read(statusPath)
strict={c['subject']:next(r['metrics'] for r in c['rules'] if r['id']=='CQR-303') for c in status['curricula'] if c['subject'] in ['Biologie','Chemie']}
assert strict['Biologie']['strictComplete']==67 and strict['Biologie']['expectedGoals']==383
assert strict['Chemie']['strictComplete']==112 and strict['Chemie']['expectedGoals']==378
assert h((ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_bytes())==preservation['activeCanonicalSHA256']
save('remaining-holds-and-current-status.independent-a.json',{'holds':holds,'currentStatusPath':str(statusPath.relative_to(ROOT)),
 'currentStatusSHA256':h(statusPath.read_bytes()),'currentRecordedStatusGeneratedAt':status['generatedAt'],'currentStrictSnapshot':strict,
 'wholeBiologyGoals':464,'currentBiologyDenominator':383,'currentBiologyStrictComplete':67,'currentChemistryDenominator':378,'currentChemistryStrictComplete':112,
 'strictGainFromThisReview':0,'fullBuildOrNativeCentralReportRerun':False,'activeWrites':0,'nativeEvidenceAdded':False})

actualInputs=[ROOT/'AGENTS.md',V5/'author-source-operator-v5.final.freeze.json',V5/'actual-used-inputs.author-v5.freeze.json',
 V5/'eleven-components-twentyfour-cases.author-candidate.json',V5/'precise-v4-v5-delta-and-preservation.actual.json',
 V5/'actual-primary-curricular-and-factual-inputs.author.json',V5/'source-operator-contributions.author-matrix.json',
 V4/'author-source-scope-remediation-v4.final.freeze.json',V4/'four-main-components-eight-positive-cases.author-candidate.json',
 V4/'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json',
 V4/'canonical-preserved.inert-envelope.json',V4/'positive-four.native-candidate-records.json',
 V4/'separate-real-open-source-boundaries.author.json',V4/'prerequisite-and-source-integration-plan.author.json',
 V4/'ten-open-obligations.concrete-remediation.author-matrix.json',
 V4/'mutation-source-components-author/six-open-obligations.source-to-component.author-matrix.json',
 ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',statusPath]
actualInputs += [p for p,_,_ in sourcePaths.values()]
actualInputs += [ROOT/p for p in ['curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf',
 'curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf',
 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf']]
unique=list(dict.fromkeys(actualInputs))
save('actual-content-inputs.independent-a.freeze.json',{'files':[{'path':str(p.relative_to(ROOT)),'sha256':h(p.read_bytes()),'bytes':p.stat().st_size} for p in unique],
 'hashOnlyBoundInputSets':'input-freezes.actual-verification.independent-a.json separately records 49 v5 declared inputs and 63 v4 bound own files; old review bytes were hashed only',
 'oldAOrBVerdictFilesRead':False,'newPeerReviewRead':False,'sourceSnapshotsAreIndependentOwnCaptures':'primary-inputs.actual-independent-a.json',
 'authorReviewRationaleNotUsedAsIndependentEvidence':True})

files=[{'path':str(p.relative_to(OUT)),'sha256':h(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted(OUT.rglob('*')) if p.is_file() and p.name!='independent-a.final.freeze.json']
save('independent-a.final.freeze.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'role':'fresh independent targeted Biology v5 review A','inputAuthorFinalFreezeSHA256':'094baede3989a387d5e77f98611356f4c49bf4f0f5ff68165531fb59268f2e82',
 'files':files,'ownFileCount':len(files),'actualContentInputCount':len(unique),'effectiveComponentCount':11,'bilingualCaseCount':24,
 'unchangedExactCases':20,'revisedConventionCases':2,'newDecisionCases':2,'targetedMaterialDecision':'accept_with_retained_integration_holds',
 'newWordingMaterialDefects':0,'newCanonicalIDsAssigned':0,'activeWrites':0,'strictGain':0,'wholeSourceClearance':False,
 'nativeD_P_A_M_V_Approval':False,'humanApproval':False,'humanTrial':False,'oldReviewVerdictsRead':False,'peerReviewRead':False})
print(json.dumps({'ownFilesBound':len(files),'actualContentInputs':len(unique),'finalFreezeSHA256':h((OUT/'independent-a.final.freeze.json').read_bytes())}))
