"""Serialize original independent B decisions; never writes active curriculum inputs."""
from pathlib import Path
import copy
import hashlib
import json
import unicodedata
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[8]
OWN = Path(__file__).resolve().parent.parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-live-context-author-20261012-v2'
REL = OWN.relative_to(ROOT).as_posix()
RID = 'chemie-q3-thirteen-current402-independent-b-20261012-v2'
GROUP = 'chemie-q3-thirteen-blind-b-20261012'
NOW = datetime.now(timezone.utc).isoformat()

def read(p): return json.loads(Path(p).read_text())
def digest(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def stable(o): return json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def write(p, o):
    p = OWN / p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(o, ensure_ascii=False, indent=2) + '\n')
def lines(p, rows):
    p = OWN / p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in rows))

neutral = read(AUTHOR / 'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
tuples = neutral['selected13WholeTuples']
by_id = {t['goalId']: t for t in tuples}
bundle = read(OWN / 'bundle/manifest.json')
campaign = read(OWN / 'description/description-review-campaign.json')
input_d = read(OWN / 'description/description-review-input.json')
batch = campaign['batches'][0]
run_d = RID + '-D-original'
run_p = RID + '-P-original'

# These judgments were made from complete bilingual task bodies and the current
# goals, before reading A, root verdicts, or historic reviewer judgments.
SCIENCE = {
 '20f92ba0': ('MWG expression, equilibrium K and reaction quotient are distinguished. K=4, x=0.75 at K=9, reverse K=0.04 and fresh x=0.40 have been checked; reversing the equation is a genuine conceptual transfer.', 'MWG, Bilanz und Reaktionsquotient unterscheiden', 'Distinguish mass action, material balance and reaction quotient', 'K aus Gleichgewichtsdaten berechnen und auf die definierte Reaktionsgleichung beziehen.', 'Calculate K from equilibrium data and relate it to the defined reaction equation.', 'Reaktionsgleichung umkehren und die inverse Konstante mit unveränderten physikalischen Konzentrationen begründen.', 'Reverse the equation and justify the inverse constant with unchanged physical concentrations.'),
 '5a24dae0': ('A single equilibrium-response competence covers concentration, temperature and gas stoichiometry. Cases distinguish equilibrium yield from kinetics and, under compression, composition from absolute concentration. Both languages preserve these limits.', 'Äußere Faktoren verändern Gleichgewichtslagen unter angegebenen Modellbedingungen.', 'External factors change equilibrium positions under stated model conditions.', 'Verschiebungen und Alltagsgaslösung begründen; einen Katalysator nicht als Änderung von K behandeln.', 'Explain shifts and everyday gas dissolution; do not treat a catalyst as a change of K.', 'Bei gleichem Gesamtkoeffizienten der Gasphase die ausbleibende isotherme Verschiebung begründen.', 'Explain absence of an isothermal shift when total gas stoichiometric coefficients are equal.'),
 '545a2e56': ('Quantitative equilibrium comparison and bounded optimization form one applied MWG routine. The physical addition root 0.7847 and compression root 0.2192 are correct. Concentration rises while B mole fraction falls; the cases explicitly avoid confusing these.', 'Quantitative Gleichgewichtszusammensetzung trägt eine begrenzte Prozessentscheidung.', 'Quantitative equilibrium composition supports a bounded process decision.', 'Bilanz, MWG, zulässige Wurzel und Ausbeute/Kostenkonflikt zusammen erklären.', 'Explain balance, mass action, admissible root and yield/cost tradeoff together.', 'Temperaturänderung mit geändertem K von Stoffzugabe bei gleichem K unterscheiden.', 'Distinguish temperature changing K from feed addition at fixed K.'),
 '882630ba': ('The changed goal is one material-based societal explanation. Technical, economic and ecological aspects are criteria of that explanation, rather than separate source-audit routines. q3-05 bodies give bounded judgments and genuinely change energy-origin/system conditions; source criticism belongs to current partner 36666.', 'Gesellschaftliche Bedeutung aus fachlich geprüften Informationen begründet erläutern.', 'Explain societal significance from scientifically checked information with reasons.', 'Technischen Gleichgewichtsnutzen, Kosten und Umweltfolgen mit Unsicherheiten abwägen.', 'Weigh technical equilibrium benefit, costs and environmental effects with uncertainties.', 'Eine Änderung der Energieherkunft neu abwägen, ohne automatisch die Empfehlung zu ändern.', 'Reweigh a changed energy source without automatically changing the recommendation.'),
 'c0463225': ('The current competence is a mass-action calculation routine in a process context. Haber-Bosch coefficients and process limits are correct; quadratic calculations are expressly model equations, not a claim that every full Haber-Bosch balance is quadratic. q3-07-c supplies full unequal-sum balance, both roots, domain rejection, both concentrations and substitution. Source HE Q3.1 increased-level placement is retained.', 'Stöchiometrie und physikalischer Konzentrationsbereich bestimmen die MWG-Lösung.', 'Stoichiometry and the physical concentration domain determine a mass-action solution.', 'Exponenten und Stoffbilanz anwenden; unphysikalische Wurzeln mit negativer Konzentration verwerfen.', 'Apply exponents and material balance; reject unphysical roots giving negative concentration.', 'Eine umgekehrte Startcharge bilanzieren und trotz Gegenrichtung denselben definierten MWG-Ausdruck verwenden.', 'Balance a reverse initial charge and retain the defined mass-action expression despite reverse conversion.'),
 'b8c8f70f': ('Quantitative Faraday routines have correct charge, electron count, z, deposited amount, conversion, inverse time/current and current-efficiency boundaries. q3-09-a efficiency and q3-09-b changed z supply conceptual transfer. q3-09-c is scientifically correct qualitative contribution only and cannot authorize compulsory HE calculations. The image has a separate factual HOLD.', 'Ladung zählt Elektronen; Stoffumsatz hängt von Ladungszahl und Stromausbeute ab.', 'Charge counts electrons; substance conversion depends on charge number and current efficiency.', 'Q=It, n=Q/(zF), Masse und inverse Strom-/Zeitrechnung mit Einheiten und Bezugsmenge anwenden.', 'Apply Q=It, n=Q/(zF), mass and inverse current/time calculations with units and reference amount.', 'Nebenreaktionen oder geänderte Ladungszahl erklären, statt gleiche Ladung mit gleicher Masse gleichzusetzen.', 'Explain side reactions or changed charge number rather than equating equal charge with equal mass.'),
 '96fd8608': ('Determine-and-interpret delivered work is one measurement-data routine. Simultaneous loaded U/I values, interval constancy and ideal instruments are specified. P=0.120 W, Q=30 C, W=36 J and interval sum 40 J are correct; 45 J from unweighted means is rejected. Open circuit gives zero external work. The new native PNG is independently inspected and correct.', 'Abgegebene elektrische Arbeit hängt von gleichzeitig gemessenen U-, I- und Zeitwerten ab.', 'Delivered electrical work depends on simultaneously measured U, I and time.', 'Konstante Intervalle summieren und tatsächliche Arbeit von -ΔH sowie reversiblem -ΔG unterscheiden.', 'Sum constant intervals and distinguish actual work from -ΔH and reversible -ΔG.', 'Leerlaufspannung bei I=0 von abgegebener Energie unterscheiden.', 'Distinguish open-circuit voltage at I=0 from delivered energy.'),
 '93b914d4': ('The scope is a coherent hydrogen-storage judgment. Electrolysis and physical/chemical storage, energy basis and efficiencies are correctly separated. 31.5/28%, 382.5/414/900 kWh and changed 360 kWh are correct. Changed fossil input is genuine transfer. Photochemical water splitting is a separate broader partner duty.', 'Wasserstoff ist ein Energieträger mit Umwandlungsverlusten und begrenzter Nachhaltigkeitsaussage.', 'Hydrogen is an energy carrier with conversion losses and a bounded sustainability claim.', 'Speicherprinzipien unterscheiden, Kettenwirkungsgrade multiplizieren und Eignung getrennt von Effizienz beurteilen.', 'Distinguish storage principles, multiply chain efficiencies and judge suitability separately from efficiency.', 'Bei verändertem Energieinput die Nachhaltigkeitsbewertung unabhängig vom gleichen Wirkungsgrad neu begründen.', 'Rejustify sustainability under a changed energy input independently of equal efficiency.'),
 '0908b3a2': ('Both environments instantiate one donor-acceptor corrosion explanation. Iron oxidation, neutral oxygen reduction, acidic proton reduction, local cell and transport routes are balanced correctly. Fresh missing-oxygen and disconnected-metal scenarios expose conceptual limits; neither case invents laboratory performance.', 'Verschiedene Akzeptoren ermöglichen unterschiedliche Korrosion bei gleicher Metalloxidation.', 'Different acceptors permit different corrosion with the same metal oxidation.', 'Halbgleichungen, lokale Orte und Elektronen-/Ionenwege für beide Umgebungen erklären.', 'Explain half-equations, local sites and electron/ion paths for both environments.', 'Aus fehlendem Sauerstoff keinen universellen Stopp der sauren Korrosion ableiten.', 'Do not infer universal cessation of acid corrosion from missing oxygen.'),
 '94a62b39': ('Protection mechanisms support one evidence-based choice. Barriers, Zn sacrificial consumption, harmful Fe/Cu coupling at defects and ecological/economic limits are correct. Consumed or insulated Zn produces valid disconfirming transfer; supplied potentials are used within stated surface-model limits.', 'Schutzwirkung hängt von Barriere oder wirksamer galvanischer Kopplung ab.', 'Protection depends on a barrier or effective galvanic coupling.', 'Anode/Kathode und Elektronenweg begründen, Verbrauch/Wartung und fehlende Umweltzahlen abwägen.', 'Explain anode/cathode and electron path; weigh consumption/maintenance and missing environmental data.', 'Elektrisch isoliertes Zn von einer wirksamen Opferanode unterscheiden.', 'Distinguish electrically insulated Zn from an effective sacrificial anode.'),
 '56bc6377': ('The description is coherent and bilingual. Calculations in q3-18-a/b are correct, but both cases supply numerical tangent slopes outright and provide no actual scaled diagram. Arithmetic from a stated derivative does not demonstrate determining an instantaneous slope from a diagram. HOLD the whole P claim until a graph-based task and scoring are supplied; retain correct calculation bodies.', 'Sekante und Tangente beschreiben mittlere und momentane Änderung.', 'Secant and tangent describe average and instantaneous change.', 'Aus einem skalierten Diagramm eine Sekante und Tangente wählen, Steigungen bestimmen und stöchiometrisch normieren.', 'Choose a secant and tangent on a scaled diagram, determine slopes and normalize stoichiometrically.', 'Bei gleichem c(t) aber verändertem Volumen Konzentrationsrate von Stoffmengenrate trennen.', 'Distinguish concentration rate and amount rate at equal c(t) but changed volume.'),
 '3ce81f96': ('All four current factors are present with controlled comparisons. Surface versus amount, effective collisions, orientation/activation barriers and non-universal concentration/temperature effects are correctly explained. Enzyme denaturation and unchanged reactant concentrations supply conceptual transfer. This does not discharge HB pressure and quantitative duties or an experiment operator.', 'Einflussfaktoren verändern die Anzahl wirksamer Stöße unter begrenzten Bedingungen.', 'Influencing factors change the number of effective collisions under bounded conditions.', 'Konzentration, Zerteilung, Temperatur und Stoffart auf Teilchenebene mit Kontrollen begründen.', 'Explain concentration, division, temperature and species at particle level with controls.', 'Die Temperaturregel bei Denaturierung oder eine Konzentrationserklärung ohne Konzentrationsänderung begründet verwerfen.', 'Reject a temperature rule under denaturation or concentration explanation without concentration change with reasons.'),
 'e62c6c58': ('A single activation-energy calculation goal, equivalent in both languages. Two-point 55.323 kJ/mol and slope 49.884 kJ/mol calculations, Kelvin/sign/units and limits are correct. Axis reversal is conceptual transfer; merely changing -6000 to -4500 is numerical only. RP S.52 is optional and unresolved for authored selection; unsupported HB Arrhenius evidence is correctly removed.', 'Arrhenius-Daten liefern eine modellabhängige Aktivierungsenergie, kein Gleichgewichts-K.', 'Arrhenius data give a model-dependent activation energy, not equilibrium K.', 'Kelvin, Logarithmus, Achsen und Vorzeichen mit Modellbereich prüfen und Ea berechnen.', 'Check Kelvin, logarithm, axes, sign and model range; calculate Ea.', 'Bei vertauschten Diagrammachsen die inverse Steigung begründen und nicht dieselbe Ea-Ableseregel anwenden.', 'Explain reciprocal slope with swapped axes and do not apply the same Ea reading rule.'),
}

records_d = []
for g in input_d['goals']:
    rationale, ed, ee, od, oe, td, te = SCIENCE[g['goalId'][:8]]
    records_d.append({
        '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
        'recordId': RID + '-D-' + g['goalId'], 'runId': run_d,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'],
        **{k:g[k] for k in ('goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn')},
        'decision':'keep',
        'understandingEvidence':{'essentialUnderstandingDe':ed,'essentialUnderstandingEn':ee,'observablePerformanceDe':od,'observablePerformanceEn':oe,'transferExpectationDe':td,'transferExpectationEn':te},
        'rationale':rationale + ' This KEEP is the bounded current description decision; source-union and separate P/V findings remain separate.',
        'evidenceProfileContract':'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation':'revise' if g['goalId'].startswith('56bc6377') else 'none',
        'recordStatus':'candidate', 'reviewAuthority':'ai_candidate',
    })
lines('description/results/'+batch['batchId']+'.records.jsonl',records_d)

def run_manifest(run_id, out_path, criterion_digest, role, extra=None):
    # P's normal validator interprets book_model as a semantic model digest,
    # while the review bundle uses an exact-byte artifact digest. Preserve the
    # exact bundle and bind P through its exact review input, HTML/PDF and other
    # artifacts; do not relabel the exact model bytes as a semantic digest.
    arts=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if role!='assessment_adversarial_reviewer' or a['role']!='book_model']
    for a in arts:
        if a['role']=='review_criteria':a['digest']=criterion_digest
    return {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,
        'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],
        'provider':'OpenAI Codex session','model':'GPT-6 session identity; exact serving model revision unavailable',
        'role':role,'promptFamilyId':'chemie-q3-thirteen-original-independent-b',
        'promptFingerprint':bundle['promptFingerprint'],'criteriaFingerprint':criterion_digest,
        'generationParametersFingerprint':digest(stable({'mode':'actual independent manual scientific review in Codex session','samplingParameters':'unavailable','blind':True}).encode()),
        'independenceGroupId':GROUP,'blindToOtherRuns':True,'goalIds':[x['goalId'] for x in input_d['goals']],
        'inputArtifacts':arts,'startedAt':datetime.fromtimestamp((OWN/'description/description-review-campaign.json').stat().st_mtime,timezone.utc).isoformat(),
        'completedAt':NOW,'status':'completed','outputDigest':digest((OWN/out_path).read_bytes()),'toolchainVersion':'normal-repository-tools-20261012',**(extra or {})}

write('description/results/'+batch['batchId']+'.run.json',run_manifest(run_d,'description/results/'+batch['batchId']+'.records.jsonl',bundle['criteriaFingerprint'],'subject_reviewer',{
 'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
 'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':digest((OWN/'description/batches'/f"{batch['batchId']}.input.jsonl").read_bytes())}]}))

records_p=[]
decisions_p=[]
for t in tuples:
    r=copy.deepcopy(t['positiveRecord']);r.update(reviewId=RID,reviewer='codex-independent-b-original',reviewedAt=NOW,reviewRunIds=[run_p],reason=SCIENCE[t['goalId'][:8]][0])
    r['dissent']=['B-P-56bc-diagram-operation-not-tested'] if t['goalId'].startswith('56bc6377') else []
    # AI review never becomes a human authority or learner-performance record.
    r.update(status='needs_human_review',reviewAuthority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1')
    records_p.append(r)
    decisions_p.append({'goalId':t['goalId'],'decision':'hold' if t['goalId'].startswith('56bc6377') else 'pass_bounded_current_goal_science',
        'wholeCurrentGoalReviewed':True,'wholeProfileReviewed':True,'caseIds':[c['caseId'] for c in t['wholeMaterialCases']],
        'wholeBilingualMaterialTaskModelScoringTransferReviewed':True,'rationale':SCIENCE[t['goalId'][:8]][0],
        'numericOnlyTransferIsNotConceptualTransfer':True,'minimumIndependentDemonstrationsInterpretation':'Independent pieces of substantive evidence, including transfer within one task; never an extra-task quota.',
        'sourceUnionApproved':False,'actualLearnerPerformance':False,'humanApproval':False})
lines('positive/P13.independent-b.review.jsonl',records_p)
write('positive/P13.full-scientific-decisions.original-b.json',{'schemaVersion':1,'reviewId':RID,'independentBlindOriginal':True,'rows':decisions_p,'pass':12,'hold':1})
pconfig=read(AUTHOR/'positive/P13.author.inactive.config.json');pconfig.update(reviewId=RID,reviewPath=REL+'/positive/P13.independent-b.review.jsonl',reviewRunManifestPaths=[REL+'/positive/P13.independent-b.run.json'])
write('positive/P13.independent-b.inactive.config.json',pconfig)
write('positive/P13.independent-b.run.json',run_manifest(run_p,'positive/P13.independent-b.review.jsonl',records_p[0]['reviewCriteriaFingerprint'],'assessment_adversarial_reviewer'))

def fp(g,rule):
    norm=lambda v:' '.join(unicodedata.normalize('NFKC',str(v or '')).split())
    p={'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey',''),**{k:norm(g.get(k)) for k in ['title','titleEn','description','descriptionEn']},**{k:norm(g.get('dimensionTags',{}).get(k)) for k in ['phase','area','topicCode']},'nodeKind':norm(g.get('nodeKind'))}
    return digest(stable(p).encode())
am_ids=['882630ba-815c-5c6b-868c-2e6cd7eef459','c0463225-cba1-5e62-a1fb-e9046d7034b5','96fd8608-8d98-53f0-9b86-1311c3220fd3']
memory_reasons={
 '882630ba':'The supplied material is evaluated through a connected societal explanation. No compact fixed fact list or unaided literal recall is necessary for this current goal; ecological and economic judgments are derived from context.',
 'c0463225':'The goal assesses applying, balancing and interpreting mass action in a process model, including choosing a physical root. Formula/model references may be supplied; understanding cannot be replaced by recall cards. No additional recall obligation is authored here.',
 '96fd8608':'The current goal derives work from supplied simultaneous measurements and explains the energy boundary. The relationship can be reconstructed through power times time; no standalone literal-recall performance is required by this goal.'}
for lane,rule in [('atomicity','semantic-atomicity-v1'),('memory','memory-card-review-v1')]:
    conf=read(AUTHOR/('atomicity/three.author.inactive.config.json' if lane=='atomicity' else 'memory/three.author.inactive.config.json'))
    laneid=RID+'-'+lane
    conf.update(reviewId=laneid,reviewPath=REL+'/'+lane+'/three.independent-b.review.jsonl')
    conf['scope']['label']='Original independent B: current changed three goals'
    if lane=='memory':conf['cardReviewPath']=REL+'/memory/three.independent-b.cards.review.jsonl'
    rows=[]
    for gid in am_ids:
        g=by_id[gid]['wholeGoal']
        r={'schemaVersion':1,'reviewId':laneid,'ruleVersion':rule,'landscapeId':conf['landscapeId'],'goalId':gid,'fingerprint':fp(g,rule),'reviewedAt':NOW,'reviewer':'codex-independent-b-original'}
        if lane=='atomicity':r.update(status='atomic',semanticAtomic=True,reason=SCIENCE[gid[:8]][0])
        else:r.update(status='no_memory_needed',memoryUseful=False,memoryGoalIds=[],deckIds=[],reason=memory_reasons[gid[:8]])
        rows.append(r)
    lines(lane+'/three.independent-b.review.jsonl',rows)
    write(lane+'/three.independent-b.inactive.config.json',conf)
lines('memory/three.independent-b.cards.review.jsonl',[])

vrows=[]
vholds={'5a24dae0':'At 360 pixels the explanatory relationships exist only in small sentence blocks; the four headings identify factors but do not show reaction direction. The actual current image requires reading small text to convey its main didactic message.',
 '545a2e56':'At 360 pixels four text cards carry the complete quantitative and optimization message; the quotient and temperature/pressure tradeoff text are too small to use. There is no independent main motif conveying the process decision at this width.',
 'b8c8f70f':'The actual raster depicts a voltmeter in a parallel electrode branch with I=2 A and an electron-flow arrow through that branch. An ideal voltmeter does not carry the electrolysis current and cannot establish Q=It; the current requires a series ammeter or independently stated controlled source current.'}
vnotes={'882630ba':'KEEP: technical production, costs and aquatic effects remain recognizable; source criticism is contextual orientation and imposes no new assessed quota. No person-held board/notebook is depicted; the open book is a symbolic source icon.',
 '96fd8608':'PASS new PNG: native 1672x941, 360 and 680 captures show polarized cell terminals, a real load, series ammeter and parallel voltmeter; electron/salt-ion directions are correct. 1.1 V × 0.5 A × 60 s = 33 J. Chemical-to-electrical wording describes conversion, not equality with total enthalpy.'}
for t in tuples:
    g=t['goalId'];q=g[:8];ib=t['imageKeepBinding']
    vrows.append({'goalId':g,'currentAssetPath':ib['currentActualAssetPath'],'assetSha256':ib['currentDigest'],'decision':'hold' if q in vholds else 'keep_approved_ai_candidate',
      'inspectedActualPixels':True,'views':['native HTML page','native PDF page','360px image capture','680px image capture']+(['native 1672x941 PNG'] if q=='96fd8608' else []),
      'desktopAspectRule':'Current assets are approximately 16:9; the special 4:3 597x448 exception does not occur in this thirteen-asset input.',
      'finding':vholds.get(q,vnotes.get(q,'KEEP: current main representation, chemical relationships and orientation remain recognizable; no concrete wrong value, sign, coefficient, transport direction or person-perspective defect found. Small secondary labels do not replace the separate teaching/task content.')),
      'humanApproval':False,'humanTrial':False})
write('visualization/V13.actual-pixels.original-b.json',{'schemaVersion':1,'reviewId':RID,'rows':vrows,'pass':10,'hold':3,'nativeHtmlPages':13,'nativePdfGoalPages':13,'nativePaginationClippingFindings':0,'allOriginalBytesRetained':True})

findings=[]
def finding(short,layer,fid,obs,mechanism,counter,change,tags):
    t=next(t for t in tuples if t['goalId'].startswith(short));page=t['wholeCurrentScope13NativePage']
    return {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-finding.schema.json','schemaVersion':1,'findingId':fid,'runId':run_p,
      'bundleFingerprint':bundle['bundleFingerprint'],'goalId':t['goalId'],'goalFingerprint':page['goalFingerprint'],'pageFingerprint':page['pageFingerprint'],
      'defectLayer':layer,'anchoredObservation':obs,'hypothesizedMechanism':mechanism,'violatedCriterion':'AGENTS.md 7.3 correctness and mobile legibility' if layer=='visualization' else 'Whole current goal evidence and representation fidelity',
      'minimalCounterexample':counter,'severity':'blocking','evidenceLevel':'E1','normativeTags':tags,'maximumClaimScope':'G1',
      'counterarguments':['Correct calculation bodies and current goal wording are retained. This finding is bounded to the specified asset or assessment operation.'],
      'proposedLocalChange':change,'possibleSideEffects':['Substantive asset/material correction needs current affected D/P page and context revalidation; preserve historical bytes.'],
      'broaderEvidenceNeeded':'No wider rule is inferred; independently inspect the corrected local successor and its current bindings.',
      'findingStatus':'candidate','reviewAuthority':'ai_candidate'}
for q,obs in vholds.items():
    findings.append(finding(q,'visualization','B-V-'+q,obs,'The orientation asset cannot safely convey its current main relation at the required display size.' if q!='b8c8f70f' else 'Current and voltage measurement paths are conflated.',
      'Read the supplied actual 360 capture.' if q!='b8c8f70f' else 'A voltmeter connected across electrolysis electrodes carries negligible current, yet this branch is labelled 2 A.',
      'Produce an additive reviewed raster successor preserving the chemical relationship with a legible main motif.' if q!='b8c8f70f' else 'Use a series ammeter or an explicit regulated source-current value; remove the electron-current arrow and current label from the voltmeter branch.',
      ['NORMATIVE','accessibility'] if q!='b8c8f70f' else ['NORMATIVE','factual_correctness']))
findings.append(finding('56bc6377','evidence_profile','B-P-56bc-diagram-operation-not-tested',
    'Both complete q3-18 task bodies provide numerical tangent slopes rather than a scaled diagram from which a learner determines them. The visualization is expressly orientation, not a task.',
    'Substitution into supplied derivatives can look like success without showing graphical slope determination.',
    'A learner unable to draw or read a tangent can still use the provided -0.0060 mol/(L s) or 0.25 mL/s and obtain every requested arithmetic result.',
    'Add a scaled concentration/time or gas-volume/time graph and a no-supplied-slope task. Score tangent/secant selection, read coordinates, units and interpretation; preserve the correct current calculations.',
    ['NORMATIVE','source_fidelity']))
lines('findings.original-b.jsonl',findings)

write('review-protocol.original-b.json',{'schemaVersion':1,'reviewId':RID,'independenceGroupId':GROUP,'blindOriginal':True,
 'notReadBeforeOriginalSeal':['sibling A13 judgments','root scientific verdicts','historical peer judgment contents','author scientific verdict/finding files'],
 'readAsInputs':['current bilingual goal tuples and normal native model','whole P13 profiles','28 complete bilingual material/task/model/scoring/transfer cases','656 literal source clauses and preserved raw parent clauses','current source component mappings and primary TH/HB/HE/BW/RP original context','current canonical partner semantics','13 actual HTML/PDF pages and 360/680 image captures','native corrected96fd PNG'],
 'currentDenominator':402,'currentStrictBeforeIntegration':212,'descriptionReviews':13,'positiveWholeGoalSciencePass':12,'positiveWholeGoalScienceHold':1,'changedAtomicityPass':3,'changedMemoryDecisions':3,'visualPass':10,'visualHold':3,
 'actualLearnerPerformance':False,'humanApproval':False,'humanTrial':False,'activeIntegration':False,'strictGain':0,
 'sourceUnionClearance':False,'sourceProjection381IsRoutingOnly':True,'unresolvedSourceScopeDecisions':497,
 'missingHumanLabTrialIsNotMachineM7Prerequisite':True,'machineReviewDoesNotEraseExperimentExecutionOperators':True})
print('Original B serialized: D13 KEEP; P12 pass / P1 hold; A3 atomic; M3 no-memory; V10 KEEP / V3 hold.')
