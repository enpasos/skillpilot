from pathlib import Path
import json, hashlib, datetime, math

F=Path(__file__).resolve().parent
R=F.parents[2]
H=F.parent
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,obj): (F/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
ratio='fa0b6b69-ce54-4711-90e6-26f27249cd71'
exp='27b63e2e-6a34-483e-8e5a-fe0f49670d1d'
dgl='58fda9b4-4336-5594-99ce-722c4a453372'
log='3c1d6ce7-099e-4267-9ff2-3d1526209a89'
first='28cdee95-3c8e-5760-a68a-405b7f9c6cbf'
canonical=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert sha(canonical)=='30c95213b0a6b7debc6b9a470c924c31cc7b733612bc11cf3e559d394dcdc891'
native=H/'statistics-pyramid-existing-route-native-20261104-v1/candidate.json.gz'
assert sha(native)=='e0b466350b58395c0440a8b1af837044ee143c6bbb36d5f8c5a3a6a2f65708ab'
goals={g['id']:g for g in json.loads(canonical.read_text())['goals']}
groups={g['examId']:g for g in json.loads((F/'independent-scope-context-comparison.actual.json').read_text())}
contracts=json.loads((F/'current-contract-and-prior-content-check.actual.json').read_text())
assert all(c['currentExamEqualsReleasedExecutionContract'] for c in contracts)
for i in [ratio,exp,dgl]: assert goals[i]==json.loads((F/(i+'.whole-goal.json')).read_text())

# The extracted full documents remain local evidence. Only these selected pages
# were substantively read for this review; extraction is not a whole-PDF review.
pages={'BB-0':[58],'BE-1':[58],'HB-2':[7,8,18,22],'HB-3':[1,2],
       'HH-4':[20,78],'MV-6':[26],'NI-7':[25,48],'NW-8':[28,29],
       'SH-9':[29,36,38],'SL-11':[17,18],'SL-12':[17,19,20],
       'SN-15':[29,32],'ST-16':[42,43],'BW-17':[14,16,34,37],
       'RP-18':[8,14,105,106],'HE-19':[35,38]}
inventory=json.loads((F/'primary-document-inventory.json').read_text())
excerpts=[]
for doc in inventory:
    doc.pop('actualLocalOriginalRead',None)
    doc['actualLocalOriginalExtracted']=True
    key=Path(doc['textFile']).stem
    doc['substantivelyReviewedPhysicalPages']=pages.get(key,[])
    text=(F/doc['textFile']).read_text().split('\f')
    for p in pages.get(key,[]):
        excerpts.append({'evidenceId':key+':'+str(p),'sourcePath':doc['path'],
                         'sourcePdfSha256':doc['pdfSha256'],'sourceUrl':doc['url'],
                         'physicalPage':p,'fullExtractedPageText':text[p-1],
                         'qualification':'Actual local primary PDF text; physical page number. Printed page may differ. No new official-currentness claim beyond the pinned repository revision.'})
write('primary-document-inventory.json',inventory)
write('reviewed-primary-passages.json',excerpts)

source_groups=[
 {'id':'ratio-explicit-algebra','goalId':ratio,'jurisdictions':['DE-BB','DE-BE','DE-HH','DE-MV','DE-NI','DE-NW','DE-SL','DE-SN','DE-ST'],
  'sourceEvidence':['BB-0:58','BE-1:58','HH-4:20','HH-4:78','MV-6:26','NI-7:25','NI-7:48','NW-8:28','NW-8:29','SL-11:17','SL-12:17','SL-12:19','SL-12:20','SN-15:29','SN-15:32','ST-16:42','ST-16:43'],
  'judgment':'APPROVE_WHOLE_FORM_SCOPE_FIT',
  'rationale':'The current target already includes justified rational term transformations (2c4830), systematic linear equations with substitution checks (325771), and ratio equations with domain and original checks (671ef). The cited primary passages explicitly support simple linear/bracketed and ratio/fraction equations, or simple variable-denominator examples, together with reasoning, method choice or verification. The whole comparison is a bounded integration of these existing skills; it does not add advanced rational-function theory.',
  'officialClaimBoundary':'SkillPilot-authored whole assessment using supported skills. No claim that the exact two equations, 20/15 rubric, every comparison detail or all description variants are individually prescribed by the official source.'},
 {'id':'ratio-bremen-additional-integration','goalId':ratio,'jurisdictions':['DE-HB'],
  'sourceEvidence':['HB-2:7','HB-2:18','HB-3:1','HB-3:2'],
  'judgment':'APPROVE_BOUNDED_SKILLPILOT_ADDITIONAL_FORM',
  'rationale':'Bremen supports term expansion/factorisation, algebraic linear equations, checking results and explaining/evaluating solution paths. The concrete variable-denominator ratio comparison is not literally prescribed here. Because ratio solving including domain conditions is already target 671ef, this short comparison is a motivated additional SkillPilot integration, not a new topic family.',
  'officialClaimBoundary':'Mark the own comparative exercise as an additional SkillPilot competence/form; do not claim that this exact denominator comparison is an official Bremen compulsory requirement.'},
 {'id':'ratio-schleswig-holstein-additional-integration','goalId':ratio,'jurisdictions':['DE-SH'],
  'sourceEvidence':['SH-9:29','SH-9:36','SH-9:38'],
  'judgment':'APPROVE_BOUNDED_SKILLPILOT_ADDITIONAL_FORM',
  'rationale':'The primary source supports distributive/term structures, proportionality and quotient equality, strategy choice and equivalent equation transformations. The exact ratio-equation comparison is a bounded own integration of the already targeted 671ef, 325771 and 2c4830 competencies. The current fa0 applicability explicitly lacks DE-SH: this omission must be changed transparently if implementing the eight reviewed SH pairs; it is not already an active permission.',
  'officialClaimBoundary':'Explicit own additional exercise, no fabricated official full-coverage source mapping. A jurisdiction applicability addition alone must not activate unreviewed SekII-only or other scopes.'},
 {'id':'ratio-canonical-seki','goalId':ratio,'jurisdictions':['ALL'],
  'sourceEvidence':['BB-0:58','NI-7:48','ST-16:42'],
  'judgment':'APPROVE_WHOLE_FORM_SCOPE_FIT',
  'rationale':'The canonical ALL/SekI target already has all three underlying competencies. The same bounded comparison is a suitable canonical integration. ALL is a SkillPilot composition and is not an official nationwide syllabus.'},
 {'id':'exp-baden-wuerttemberg','goalId':exp,'jurisdictions':['DE-BW'],
  'sourceEvidence':['BW-17:16','BW-17:37'],
  'judgment':'APPROVE_WHOLE_FORM_SCOPE_FIT_WITH_SEPARATE_R_CORRECTION',
  'rationale':'Exponential graphs, growth, half/doubling time and interpretation are explicit in 3.3.4. General modelling requires assumptions, interpretation, validity checks and critical prognosis. Constructing two simple models, graphs, a joined changed-factor continuation and a concrete limitation is appropriate at the existing J10 target, with no differential equation or logarithmic inversion required.',
  'officialClaimBoundary':'Own assessment combining content and process competencies, not literal official prescription of the four subtasks.'},
 {'id':'exp-rheinland-pfalz','goalId':exp,'jurisdictions':['DE-RP'],
  'sourceEvidence':['RP-18:8','RP-18:14','RP-18:106'],
  'judgment':'APPROVE_WHOLE_FORM_SCOPE_FIT_WITH_SEPARATE_R_CORRECTION',
  'rationale':'The source explicitly pairs contextual growth and decay, exponential terms and graphs with interpreting/checking model results. The small assumption change remains within this known function family. Treating finite positive decay separately from a real detection threshold is an appropriate contextual check.',
  'officialClaimBoundary':'Own bounded modelling assessment, not a claim that every variation or parameter case is mandatory.'},
 {'id':'exp-bremen-additional-modelling','goalId':exp,'jurisdictions':['DE-HB'],
  'sourceEvidence':['HB-2:8','HB-2:22','HB-3:1','HB-3:2'],
  'judgment':'APPROVE_BOUNDED_SKILLPILOT_ADDITIONAL_FORM_WITH_SEPARATE_R_CORRECTION',
  'rationale':'The 2022 annex replaces the binding year-9 content/standards with linear and quadratic functions, while its points 1 and 3 retain the former activity overview and process competencies, which still mention exponential models and model variation. Therefore neither an explicit universal compulsory exponential-content claim nor a complete ban follows. The existing SkillPilot target 42e19186 already contains growth AND decay with terms, tables, graphs and context; the whole form is a motivated bounded extension of that target with model evaluation, not an arbitrary new family.',
  'officialClaimBoundary':'Record as SkillPilot additional modelling and preserve the annex qualification. Do not call exponentials or logarithms universally compulsory in Bremen from the old 2006 content pages.'},
 {'id':'dgl2-all-candidate-gk','goalId':dgl,'jurisdictions':sorted({r['scope'].split('/')[0] for r in groups[dgl]['candidateRows']}),
  'sourceEvidence':['HE-19:38'],
  'judgment':'REJECT_WHOLE_FORM_REUSE_IN_ALL_44_CANDIDATE_SCOPES',
  'rationale':'All 44 candidates are GK with first-order solving 28c as the unserved target, and no targeted DGL2 goal. The complete exam is about second order, restoring acceleration, two derivatives of trigonometric candidates, periods and oscillator behaviour. This is meaningful LK content, but adding it solely to demand a DGL1 predecessor introduces unnecessary new content. Existing R-context presence proves neither scope fit nor didactic need. The Hessian source explicitly distinguishes the first-order GK/LK section from second-order LK; no universal claim about prohibitions in the other states is needed for this rejection.',
  'officialClaimBoundary':'Existing 88 target placements and the content correctness of the LK form are not revoked or newly certified. Only the proposed 44 new GK placements are rejected.'}
]
rows=[]
for i in [ratio,exp,dgl]:
    for row in groups[i]['candidateRows']:
        jurisdiction=row['scope'].split('/')[0]
        sg=next(x for x in source_groups if x['goalId']==i and jurisdiction in x['jurisdictions'])
        rows.append({'goalId':i,'scope':row['scope'],'decisionGroup':sg['id'],'decision':sg['judgment'],
                     'contentAndScopeReuseApproved':i!=dgl,'activationApproved':False,
                     'integrationCondition':'Exact finite implementation and independent implementation/source-role review required; no Stage or Native approval in this report.',
                     'baselineFacts':row})
for sg in source_groups: sg['exactScopeCount']=sum(r['decisionGroup']==sg['id'] for r in rows)
assert len(rows)==121 and sum(r['contentAndScopeReuseApproved'] for r in rows)==77
write('finite-scope-decisions.json',{'decisionGroups':source_groups,'exactPairs':rows,'counts':{'ratioApproved':57,'expScopeApprovedWithSeparateRCorrection':20,'dgl2Rejected':44,'activated':0}})

counter=json.loads((F/'log-edge-removal-static-counterfactual.actual.json').read_text())
write('bounded-followup-contracts.json',{
 'status':'AUTHORING_AND_INTEGRATION_HANDOFF_NOT_IMPLEMENTED',
 'ratio':{'goalId':ratio,'scopePairsArtifact':'finite-scope-decisions.json','approvedPairCount':57,'preserveWholeTaskSolutionRubricRequiresAndCoverage':True,
          'allowedSemanticMetadataChange':'Add DE-SH to fa0 applicability only as needed for the eight reviewed SH pairs, plus truthful own-exercise provenance. Preserve every existing jurisdiction. Applicability is not blanket placement approval.',
          'requiredPlacementBoundary':'Explicit reviewed SekI/CrossStage/ALL-SekI pairs only; preserve all other actual target/POnly outcomes; direct masks obey production specificity. New POnly masks, changed masks or wrappers must be declared. No content clone.'},
 'exponential':{'goalId':exp,'scopePairsArtifact':'finite-scope-decisions.json','approvedPairCount':20,
          'separateGlobalRCorrection':{'from':exp,'removeOnlyDirectRequires':[log],'before':goals[exp]['requires'],'after':[i for i in goals[exp]['requires'] if i!=log],
             'rationale':'Logarithm definition is not universal preparation for modelling given equal-step growth/decay, plotting, varying a factor and contextual limits. Neither current task nor goal mandates solving an unknown exponent. No other R path in this form reaches 3c1. Do not add an artificial logarithm subtask, coverage claim or new prerequisite merely to preserve reachability.',
             'reviewScope':'Recommend this one globally honest canonical correction, with exact whole-goal before/after binding and fresh independent implementation review. Do not silently treat it as a placement-only change.',
             'staticPrediction':counter['summary'],
             'knownConsequence':'Four BY-G9 scopes lose the final 3c1 demand connection. Preserve these as newly exposed genuine gaps pending their own valid content/route decision; never hide them with fake R, false assessed coverage or role exclusion.',
             'runtimeEvidenceStillRequired':'Root must run the actual fresh Native matrix and check finite global demand deltas; this static reconstruction is not that run.'},
          'preserve':'Same stable ID, whole DE/EN task/solution/rubric, 20/15 scoring, own-ID coveredGoalIds, binary mastery semantics; all other requires unchanged. Scope provenance must distinguish the HB additional-competence case.'},
 'dgl1ContentOrder':{'rejectedReuseGoalId':dgl,'targetExistingGoalId':first,'newGoalIdentityNeeded':False,'wholeCurrentGoal':goals[first],
          'purpose':'Author a whole same-ID first-order-solving assessment instead of importing second-order oscillations into the 44 GK scopes.',
          'concreteTaskDesign':'Use one genuinely separable elementary first-order equation, derive a parameterised solution family, obtain a particular solution from an initial condition and verify it by substitution/differentiation. A narrow candidate is y′=y², y(0)=1: nonzero solutions 1/(C−t), the equilibrium solution y=0 must not be lost by division, and the initial solution is 1/(1−t) on the interval containing 0, t<1. A short y′=2t case can represent direct integration as another elementary method if needed. These are authoring examples, not a released task or new mandatory list of all methods.',
          'preparationCheck':'Independently check the actual complete 28c context, algebra/differentiation work and method burden before freezing. The present R includes primitive powers x^n for integer n≠−1, so separation via y^−2 avoids importing logarithmic integration. If an example needs genuinely new preparation, revise the example or submit a separately justified minimal R change, never create coverage-driven R.',
          'wholeGoalAndFairness':'Cover meaningful first-order solving, general/special solutions and initial conditions under one ordinary total score. No second-order/trigonometric/oscillator demand, no exhaustive catalogue of every solution method, no prerequisite pass thresholds. Do not claim content approval before actual complete task, solutions, rubric and independent review.',
          'existingAlternativeBoundary':'The existing 97fb Richtungsfeld/temperature exam assesses qualitative interpretation and field construction, not deriving general/special solutions; unchanged it is not a replacement for 28c. Do not add 28c to its R/Coverage just to close a gap.'}
})

checks={'status':'PASS_BOUNDED_INDEPENDENT_REVIEW_CHECKS_WITH_EXPLICIT_REJECTION_AND_FOLLOWUP',
 'exactCurrentCanonical':sha(canonical),'exactActualN3':sha(native),
 'releasedContractsEqualCurrentExamData':3,'candidatePairsCompared':121,
 'wholeNormalizedRCounts':{i:groups[i]['fullContextGoalCount'] for i in groups},
 'all161BaselineFixedPointsReconstructed':True,
 'newHiddenPreparationDemandFor77Placements':0,
 'math':{'ratio':{'A':11,'AOriginalBothSides':31,'B':5,'BOriginalBothSides':1.5,'BExcludedValue':1},
         'exp':{'N6':100*2**3,'M9':80*(.5)**3,'N8':100*2**4,'changedN8':round(400*1.1**4,8),'joinedAt4':400},
         'dgl2':'Recomputed u′=−4 sin(2t), u″=−8 cos(2t)=−4u; v″=−16v; w″=4w and w′(0)=−4; values 2,0,−2,0,2; periods π and 2π/3. Whole qualitative form is mathematically sound, but candidate scope reuse is rejected.'},
 'notPerformed':['Root mutations','Git operations','Native execution','new Stage receipt','CI/M7 certification','new A/M ledger classification','review of all visualisation images','official-currentness audit of every state revision']}
assert checks['math']['exp']['changedN8']==585.64
write('independent-checks.actual.json',checks)

inputs={canonical,native,H/'next-existing-route-prioritization-20261104-v1/candidate-groups.json',R/'AGENTS.md',R/'docs/concept/skill-graph/assessment-gated-completion.md'}
for c in contracts:
    inputs.add(R/c['contract']['path']);inputs.add(R/c['priorIndependentContentReview']['path'])
    for t in c['sixTextBindings']:inputs.add(R/t['path'])
for x in json.loads((F/'source-decisions-and-whole-extractions.json').read_text()):
    inputs.add(R/x['reviewPath']);inputs.add(R/x['sourceExtractionPath'])
for d in inventory:
    inputs.add(R/d['path']);inputs.add(R/d['extractionPath'])
write('input-manifest.json',{'schemaVersion':1,'role':'actual read-only input bindings; primary extraction versus selected substantive page reading is distinguished in primary-document-inventory.json','files':[{'path':str(p.relative_to(R)),'sha256':sha(p)} for p in sorted(inputs)]})

report={'schemaVersion':1,'reviewId':'astra-three-existing-route-fundamental-20261104-v1',
 'status':'FINITE_DIDACTIC_SCOPE_DECISIONS_COMPLETE_NOT_ACTIVATION',
 'reviewer':{'agent':'/root/astra_statistics_pyramid_review','requestedReviewMode':'independent Astra Ultra','independentOfContentAndIntegrationAuthors':True,'humanApproval':False},
 'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'baseline':{'canonical':{'path':str(canonical.relative_to(R)),'sha256':sha(canonical)},'actualNative':{'path':str(native.relative_to(R)),'sha256':sha(native),'scopes':161}},
 'outcome':{'ratioWholeFormScopeApprovals':57,'exponentialWholeFormScopeApprovals':20,'dgl2CandidateRejections':44,'activationApprovals':0,'globalRCorrectionRecommended':'Remove exactly 27b→3c1; four BY-G9 demand gaps must remain explicit.'},
 'wholeFormJudgments':[
  {'goalId':ratio,'judgment':'Whole comparison is a meaningful consolidation of already targeted skills. Both equation structures, admissible transformations, original checks and a reasoned comparison are actual scored actions. Structural comparison is not a pretext to collect R coverage. Equivalent proportional reasoning is valid; no full rational-function theory or every solution variant is required. The ordinary cap is tied only to wholly absent essential performance, not individual prerequisite passes.',
   'preparation':'671ef is a real foundation for the ratio task; distributive/term reasoning 959cc is genuine preparation for the bracket task and comparison. The direct orientation node is the inherited landscape entry orientation, not scored technical content. Full40 R objects and inherited normalization checked. In 55/57 scopes 959cc is not T, but its actual content is already target 2c4830 in all57; this is not a reason to widen T or fake assessed coverage.'},
  {'goalId':exp,'judgment':'The complete task genuinely requires models from observations for growth and decay, graphs/numerical interpretation, one joined change of assumption and contextual evaluation. The four strands form one modelling competence and a fair 20/15 result; no extra logarithm-solving method, formal proof, software or exhaustive variant collection is required.',
   'preparation':'Full60 R objects inspected. 42e19186 and 3010 provide the relevant exponential representation and factor/difference concepts. In BW/HB 3010 and 3c1 are outside T; no new hidden M0 preparation is introduced, but that is not a didactic endorsement of the unnecessary direct 3c1 edge. Recommend its explicit global removal and expose the resulting four BY-G9 gaps. No other R/coverage change approved.'},
  {'goalId':dgl,'judgment':'The supplied-candidate oscillator task is a coherent qualitative DGL2 form; it does not require deriving a general second-order solution family. Nonetheless all44 proposed new scopes target first-order solving, not second order. The whole form adds order-2/oscillation content unnecessarily. Reject these44 and author the existing first-order endpoint itself.',
   'preparation':'Full55 R context read. Having 28c and its preparation in context does not make period/acceleration/trigonometric second-derivative work an appropriate GK completion obligation. The actual scored oscillator actions are not evidence of first-order solution-method mastery.'}
 ],
 'bindingSemantics':['One ordinary binary mastery result per assessment; mastery stops outgoing preparation demand without granting prerequisite mastery.','coveredGoalIds describe actual assessed actions and remain own-ID for these whole curricular assessments; no added prerequisite attestation.','requires denotes genuine preparation, not a coverage repair tool.','A description with examples or alternatives does not require every variant.','Additional SkillPilot competencies are allowed when bounded and motivated; official optional/compulsory distinctions must stay truthful.','Graph closure numbers are consequences, not didactic justification.'],
 'evidenceFiles':['finite-scope-decisions.json','bounded-followup-contracts.json','reviewed-primary-passages.json','current-contract-and-prior-content-check.actual.json','independent-scope-context-comparison.actual.json','marginal-preparation.actual.json','target-skill-comparison.actual.json','existing-alternative-inventory.actual.json','whole-local-alternative-goals.json','log-edge-removal-static-counterfactual.actual.json','independent-checks.actual.json','input-manifest.json'],
 'implementationBoundary':'This is a finite whole-form/source/scope decision and one separately motivated R correction recommendation. Sol/Root must author concrete exact deltas, independently review them and obtain actual Native evidence before activation/final Stage. Current source roles, requires, tasks, scoring and all historical receipts were left unchanged.'}
write('review-handoff.json',report)
print('sealed semantic decisions:',report['outcome'])
