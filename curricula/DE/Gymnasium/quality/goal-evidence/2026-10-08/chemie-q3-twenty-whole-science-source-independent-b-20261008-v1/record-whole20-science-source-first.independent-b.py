#!/usr/bin/env python3
"""Record independently reached bounded whole-goal science judgments, not author approvals."""
import hashlib
import json
import math
import pathlib
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'chemie-q3-twenty-whole-science-source-author-20261008-v1'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name, value):
    p = OUT / name
    if p.exists(): raise RuntimeError(f'Append-only output already exists: {p}')
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
    return p
def rel(p): return str(p.relative_to(ROOT))

now = datetime.now(timezone.utc).isoformat()
goals = json.loads((AUTHOR/'whole20.current-native-goals.requires.parents.snapshot.json').read_text())
cases = json.loads((AUTHOR/'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json').read_text())['cases']
profiles = [json.loads(x) for x in (AUTHOR/'native/p20.author-candidate.review.jsonl').read_text().splitlines()]
source_pool = json.loads((AUTHOR/'source/whole-all-current-source-goals-and-1n-partners.lossless.json').read_text())
canon = json.loads((AUTHOR/'frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())
idx = {g['id']:g for g in canon['goals']}
checks = []
for seal_name, expected in [('whole20-author-input-and-output.first.freeze.json','725fc238cd2dff358dc39537f403f8bd69224bda8abd3e2961ab0afaeac30c14'),('whole20-author-input-and-output.final.freeze.json','e756e6bedbd17d14ef9337780c19e5b9e9a26f14026180550358a105bba1ef72')]:
    p = AUTHOR/seal_name
    if not p.exists():
        found = [x for x in AUTHOR.glob('*.json') if sha(x)==expected]
        if len(found)!=1: raise RuntimeError(f'Actual author seal not found: {expected}')
        p=found[0]
    assert sha(p)==expected
    data=json.loads(p.read_text())
    for f in data['files']:
        actual=AUTHOR/f['relativePath']
        assert actual.is_file() and sha(actual)==f['sha256'].removeprefix('sha256:') and actual.stat().st_size==f['bytes'], str(actual)
    checks.append({'path':rel(p),'sha256':sha(p),'actualFileBindingsVerified':len(data['files'])})
assert len(goals)==20 and len(cases)==40 and len(profiles)==20
assert source_pool['matchedEdges']==1602 and source_pool['uniqueSourceDuties']==929
for item in goals:
    assert item['goal']==idx[item['goal']['id']]
for i, p in enumerate(profiles):
    assert p['goalId']==goals[i]['goal']['id']
    assert p['status']=='needs_human_review' and p['reviewAuthority']=='ai_candidate' and p['evidenceLevel']=='E1' and p['maximumClaimScope']=='G1'
    assert len(p['profile']['applicationCaseBriefs'])==2

# Actual whole primary-page extraction is separate from reviewed normalized mappings.
source_reads=[]
sources=[('HE','curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf','628c84dbaadebccf93c6854c58e00a337fd855985aaadc8b998de3dcb1243c3e',[45,46,47,48],'https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf'),('HB','curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','3d803861caabe84e3db0a1b2fcd3fc09672f373fbfead6949927d463483a59c7',[22,24,31,32],'https://www.lis.bremen.de/sixcms/media.php/13/GyO_Chemie_2022.pdf')]
(OUT/'whole-primary-pages').mkdir(exist_ok=True)
for state, local, expected, pages, url in sources:
    pdf=ROOT/local
    assert sha(pdf)==expected
    for page in pages:
        argv=['pdftotext','-f',str(page),'-l',str(page),'-layout',str(pdf),'-']
        run=subprocess.run(argv,capture_output=True)
        assert run.returncode==0
        dst=OUT/'whole-primary-pages'/f'{state}-physical-page-{page:03d}.whole-original.txt'
        if dst.exists(): raise RuntimeError(str(dst))
        dst.write_bytes(run.stdout)
        source_reads.append({'jurisdiction':state,'url':url,'localObservation':local,'observedOriginalPdfSha256':expected,'physicalPage':page,'completePageExtract':rel(dst),'extractSha256':sha(dst),'argv':argv,'exitCode':run.returncode,'stderr':run.stderr.decode(),'freshLivePdfRead':state=='HE','reading':'Actual complete physical page read by reviewer B; normalized extraction was compared separately, not asserted to be literal original.'})
write('whole-primary-source-read-boundaries.independent-b.actual.json',{'reviewedAt':now,'pdfReads':source_reads,'bavariaActualOfficialSectionsRead':[{'url':f'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/{year}/chemie/{level}','boundedWholeSections': sections} for year,level,sections in [(12,'grundlegend',['C12.6','C12.7','C12.8']),(12,'erhoeht',['C12.6','C12.7','C12.8']),(13,'grundlegend',['C13.5']),(13,'erhoeht',['C13.5'])]],'liveBremenDownload':'The current alternative URL did not load; no live HB download success is claimed. Exact retained official PDF bytes were actually read and hashed.','notReviewedAsNewOriginalPrimary':'Other nationwide original pages and external source partners are retained, not newly approved by this bounded review.','allCurrentSourceDutyPool':{'path':rel(AUTHOR/'source/whole-all-current-source-goals-and-1n-partners.lossless.json'),'sha256':sha(AUTHOR/'source/whole-all-current-source-goals-and-1n-partners.lossless.json'),'sourceDuties':929,'matchedEdges':1602,'mutation':False}})

# Independent computations verify concrete model values rather than duplicating author labels.
quant={
 'q3-02-a':{'K_ester':(.4*.4)/(.2*.2),'Q_after_acid_doubling':(.4*.4)/(.4*.2),'inverseFreshK':1/25},
 'q3-02-b':{'x_K9_start1':.75,'x_K4_start06':.4},
 'q3-04-a':{'x_K4_start1':2/3,'x_addedA':(10-math.sqrt(28))/6,'fresh_x_K9':.75},
 'q3-04-b':{'reverse_extent':(5-math.sqrt(17))/4,'final_cB':2-2*((5-math.sqrt(17))/4)},
 'q3-07-a':{'Kc_L2_mol2':.4**2/(.2*.6**3),'halved_equation_Kc':math.sqrt(.4**2/(.2*.6**3)),'unknown_NH3_at_given_K':math.sqrt((.4**2/(.2*.6**3))*.1*.3**3)},
 'q3-07-b':{'Kc':1/(.5*1.5**3),'Q_after_half_removal':.5**2/(.5*1.5**3),'fresh_Q_x025':.5**2/(.75*2.25**3)},
 'q3-08-a':{'decomposition_with_IR_V':1.46-(-1.03)+.2,'new_O2_threshold_V':1.23+.05},
 'q3-08-b':{'U_with_IR_V':1.17-.34+.12,'new_Br_threshold_V':1.07+.5},
 'q3-09-a':{'Q_C':2*965,'n_Cu_mol':1930/(2*96485),'m_Cu_g':1930/(2*96485)*63.55,'t_for002Cu_s':.02*2*96485/2,'mass_at080yield_g':.8*1930/(2*96485)*63.55},
 'q3-09-b':{'Q_C':.1*3*96485,'t_s':.1*3*96485/5,'n_Ag_mol':.3,'m_Ag_g':.3*107.87,'I_A_for1h':.1*3*96485/3600,'fresh_I_A':.03*2*96485/1200},
 'q3-10-a':{'Daniell_Estd_V':.34-(-.76),'CuAg_Estd_V':.80-.34},
 'q3-10-b':{'MgFe_Estd_V':-.44-(-2.37),'tripled_Estd_V':1.93,'tripled_n_electrons':6},
 'q3-11-a':{'P_W':1.2*.1,'Q_C':.1*300,'W_J':1.2*.1*300},
 'q3-11-b':{'Q_C':.2*100+.1*200,'W_J':1.1*.2*100+.9*.1*200,'open_circuit_W_J':0},
 'q3-12-a':{'required_Wh':.2*20,'voltageCompatibility':'NOT established by Wh. HOLD until supplied voltage or conditional answer.'},
 'q3-12-b':{'required_Wh':1*2,'fresh_required_Wh':2.4},
 'q3-13-a':{'physical_final_kWh':100*.7*.9*.5,'chemical_final_kWh':100*.7*.8*.5},
 'q3-13-b':{'hydride_return_kWh':1000*.75*.85*.6,'physical_return_kWh':1000*.75*.92*.6,'fresh_physical_return_kWh':1000*.75*.8*.6},
 'q3-18-a':{'mean_disappearance_A_mol_L_s':.01,'mean_reaction_rate_mol_L_s':.005,'instant_A_disappearance_mol_L_s':.006,'instant_reaction_rate_mol_L_s':.003},
 'q3-18-b':{'gas_interval_mol_s_04mL_s':.0004/24,'instant_mol_s_025mL_s':.00025/24,'instant_mol_L_s_05L':(.00025/24)/.5,'fresh_mol_L_s':(.00048/24)/1},
 'q3-20-a':{'Ea_J_mol':math.log(4)*8.314/(1/300-1/320),'fresh_Ea_J_mol':math.log(2)*8.314/(1/300-1/320)},
 'q3-20-b':{'Ea_J_mol':6000*8.314,'k300_in_supplied_unit':math.exp(18-6000/300),'fresh_Ea_J_mol':4500*8.314}
}
write('concrete-quantitative-model-recalculation.independent-b.actual.json',{'method':'Independent recomputation from whole-case supplied values; figures do not supply missing source support, executed experiments or learner evidence.','cases':quant})

# These are reviewer B's reached judgments after full bilingual wording/case/profile/source reading.
judgments=[
 ('PASS','PASS','PASS','Closed-system macro constancy, simultaneous species and equal nonzero microscopic rates are one equilibrium characterization. Two different starting-state models and open-system transfer distinguish equilibrium from merely steady colour. Original HE/BY support this whole current goal; HB practical planning/execution and all partial partners remain separate.'),
 ('PASS','HOLD','PASS','The ester K=4/Q=2 and solved K=9 material, reverse K and balance transfer are scientifically coherent. HE Q3.1 LK original requires unequal stoichiometric sums and quadratic concentration solutions; its current sole exact simplified-MWG partner does not cover that full duty. Preserve basic ester role and mark the extended original binding unresolved.'),
 ('PASS','PASS','PASS','Pressure follows gaseous stoichiometry; temperature follows stated reaction enthalpy, concentration follows Q. N2O4 compression correctly separates mole-fraction shift from concentration rise. Everyday dissolution and technical ammonia are both covered. Phosphate-buffer partner remains retained without claiming its whole separate duty approved.'),
 ('PASS','PASS','PASS','Simple balances, physical roots and final concentration/fraction support one numerical process-choice argument. Added reagent or compression is linked to stated yield/cost limits; catalyst changes equilibration time rather than K. Original BY GA/EA and bounded HB calculation/sustainability support the current whole objective.'),
 ('PASS','PASS','SPLIT_REVIEW','The fictional print/online documents, author-interest analysis and chemical corrections are sound; no invented current industrial data or real source reliability is asserted. Current whole goal combines societal/economic/ecological chemical explanation with general analogue/digital authorship/reliability evaluation. Rubric duties 1/2 and 3/4 can be independently fulfilled; retain both original BY coupled duties and genuine cases while a scope-preserving atomicity decision remains open.'),
 ('PASS','PASS','PASS','Common alternative pathway reduces both-direction barriers with unchanged endpoints and K. Homogeneous acid/ester and heterogeneous catalytic surfaces are correctly phase-classified. Time-to-equilibrium and changed-temperature confound distinguish kinetics from yield. Broader catalyst-ecology, model-limits and enzyme partners are retained, not newly globally approved.'),
 ('PASS','HOLD','PASS','N2+3H2 balances, squared NH3/cubic H2 expression, conventional Kc unit, inverse/halved constants and process tradeoff are correct. The current mapped simplified-MWG/technical-Haber union has no evidenced closure for the original HE LK unequal-stoichiometry/quadratic concentration duty. Hold that source-role closure without denying valid ammonia scientific content.'),
 ('PASS','PASS','PASS','Electrode thresholds use supplied local model values and correctly signed overpotentials; chlorine wins only under stated oxygen overpotential. Balanced selected half-reactions and IR voltage are correct. Copper/bromide transfer changes discharge order and distinguishes thermodynamics, kinetics and supply. No universal pH-independent threshold or actual electrolysis is claimed; broader Faraday/electrolysis partners remain intact.'),
 ('PASS','HOLD','PASS','Faraday Q=It=zFn, Cu/Al/Ag stoichiometry, inverse time/current and 80% current yield all compute correctly with units. HE actual Q3.3 LK says Faraday without calculations, while BY EA/HB LK support quantitative work. Current exact HE-to-quantitative binding must not transform the original lower quantitative scope into mandatory HE calculations.'),
 ('PASS','PASS','PASS','Standard reduction potentials yield balanced voluntary redox and electrode/transport directions; coefficient scaling changes n but never E°. Standard versus loaded/nonstandard voltage is bounded. Original HE/BY/HB support these operations; Nernst, potential-measurement execution and broader galvanic partners remain separately retained.'),
 ('PASS','PASS','SPLIT_REVIEW','Spatial redox separation, external electronic/ionic closure and interval-wise UIt are scientifically correct. Delivered work 36/40 J is separated from given -ΔG and -ΔH; no automatic enthalpy equality or actual measured experiment is claimed. Whole current objective also combines independently assessable microscopic apparatus/energy explanation with numerical measured-work integration; preserve both full original BY duties pending scope-preserving atomicity resolution.'),
 ('HOLD','PASS','PASS','Whole primary-cell principles, supplied reactions and social-use comparison are otherwise sound. q3-12-a states a 1.5 V device but supplies only Wh/cost for alkaline and zinc-air and then recommends the latter as meeting demand; energy capacity cannot establish operating-voltage compatibility. Supply explicit compatible fictional voltage or condition the complete answer/scoring/P on voltage verification. q3-12-b explicitly supplies fictional 1.5 V cells and remains sound.'),
 ('PASS','HOLD','PASS','Renewable electrolysis is an energy conversion; physical/hydride storage and multiplied return-energy chains are correctly bounded. Actual BY original broader hydrogen comparison retains photocatalytic splitting, artificial photosynthesis, catalyst/material duties via separate 7dc partner; HB p32 Power-to-X is an optional extension rather than literal mandatory hydrogen-storage operator. Current whole goal does not close that broader source union or normalized authority concern.'),
 ('PASS','PASS','PASS','Anodic Fe oxidation and neutral oxygen versus acidic proton reduction balance atoms/charge; first hydroxide product is distinguished from later rust. Differential aeration locates anode/cathode and keeps electronic metal path separate from ionic aqueous path. Loss of oxygen or contact does not imply universal immunity. Both source-defined corrosion mechanisms form one local electrochemical explanation.'),
 ('PASS','PASS','PASS','Contact corrosion requires metallic and ionic conduction. In the supplied neutral Fe/Cu setting O2 is the cathodic acceptor, not necessarily Cu2+; electron direction and area/current-density condition are correct. Replacing Cu by unpassivated Zn gives sacrificial polarity, not an unconditional rate prediction. Original BY/HB contact role is preserved.'),
 ('HOLD','PASS','PASS','Main passivation/material-use cases distinguish E° thermodynamic tendency from kinetic films and chloride/crevice failure. q3-16-a German fresh answer and German scoring negate unchanged standard potentials while English negates changed potentials. A protective-film/repassivation process does not change defined E°; correct the German fresh answer/scoring and operative P binding without changing the valid main cases or whole goal.'),
 ('PASS','PASS','PASS','Barrier/film, galvanic coupling and sacrificial protection are compared through one use decision. Zn supplies electrons to Fe and is consumed; Cu-coating defects can accelerate anodic Fe. Environmental/cost judgments remain material-bound and conditional; isolation/consumption transfer correctly limits active protection. Whole original passive/active and ecology/economy duty is covered without experimental/human claim.'),
 ('PASS','HOLD','PASS','Mean secant and instantaneous tangent, disappearance signs, stoichiometric normalization and gas mL-to-L-to-mol conversion are coherent. Actual HE Q3.5 factor row is currently exactly mapped solely to this rate-reading goal although its operator is explanation of substance/concentration/surface influences. Preserve rate/source roles and require a genuine corrected factor-partner decision; the optional HE topic is not universal.'),
 ('PASS','HOLD','PASS','All four current qualitative factors, effective-collision energy/orientation and controlled model comparisons are covered; fresh enzyme denaturation blocks a universal monotonic temperature rule. Original HB factors also include pressure and quantitative effects; partner 561 only supplies qualitative temperature. BY hypothesis-led planning and EA execution remain real obligations not demonstrated by these written cases. The partial original source union remains unclosed.'),
 ('PASS','HOLD','PASS','Two-point Kelvin/logarithm and ln(k) versus 1/T slope correctly yield Ea with units and distinguish kinetic k from equilibrium K. Actual whole HB p24 LK specifies order/mechanisms but not Arrhenius or autocatalysis; HE p48 likewise does not supply Arrhenius. A normalized bundled row cannot create official primary-source authority. Preserve all mechanism/autocatalysis/catalysis partners and hold normative source support.')
]
assert len(judgments)==20
verdicts=[]
for n,(p_status,s_status,a_status,reason) in enumerate(judgments,1):
    g=goals[n-1]['goal']
    verdicts.append({'ordinal':n,'goalId':g['id'],'wholeGoalSnapshot':g,'scientificWholeCasesAndProfile':p_status,'boundedOriginalSourceRoleClosure':s_status,'semanticAtomicity':a_status,'nativeDescriptionReview':'pending actual rendered goal page and native round-B input','nativeVisualReview':'valid existing V retained; no fresh actual 360/680/PDF inspection completed at this science-first seal','machineFiveGateClosure':False,'reasonDe':reason,'actualWholeCaseIds':[f'q3-{n:02d}-a',f'q3-{n:02d}-b'],'evidenceLevel':'E1','maximumClaimScope':'G1','profileStatus':'needs_human_review','profileAuthority':'ai_candidate','humanApproval':False,'humanTrial':False})
write('whole20-whole40-science-source-atomicity.independent-b.first.verdict.json',{'schemaVersion':1,'reviewer':'Codex independent Chemistry Q3 reviewer B; distinct from author and current reviewer A','reviewedAt':now,'peerCurrentReviewReadBeforeFirstSeal':False,'scope':20,'completeBilingualCasesRead':40,'originalBoundedSourceReview':True,'all929OriginalPrimariesClaimedReviewed':False,'authorTechnicalChecksDoNotProveScience':True,'verdicts':verdicts,'clearForNextActualNativeReviewGoalIds':[v['goalId'] for v in verdicts if v['scientificWholeCasesAndProfile']=='PASS' and v['boundedOriginalSourceRoleClosure']=='PASS' and v['semanticAtomicity']=='PASS'],'totals':{'clearForNativeReview':9,'boundedSourceHolds':7,'semanticCompoundHolds':2,'specificNewMaterialOrAnswerHolds':2,'newStrictGain':0},'currentProtectedChemistryBaseline':{'strictCount':173,'currentCount':378,'canonicalSha256':'f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84'},'noActiveMutation':True,'humanReleaseGates':'separate and unfulfilled by machine review'})
write('exact-input-and-whole-current-preservation.independent-b.actual.json',{'authorSeals':checks,'wholeCurrentGoalsExact':20,'wholeSourcePoolRetained':{'matchedEdges':1602,'uniqueDuties':929},'closedProfileTruthChecked':20,'nativeRenderImagesStillPending':True,'hashChecksMeaning':'Technical identity only; substantive decisions are recorded separately.','noActiveWrites':True})
files=[p for p in OUT.rglob('*') if p.is_file()]
write('whole20-whole40-science-source.independent-b.first.freeze.json',{'schemaVersion':1,'reviewedAt':now,'stage':'Own genuine bounded whole20 Science/Source/Atomicity first verdict before any current peer review output','authorSeals':checks,'files':[{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(files)],'ownFirstVerdictSealed':True,'notNativeDOrVApproval':True,'noHumanApproval':True,'noStrictGain':True})
print(json.dumps({'firstSeal':rel(OUT/'whole20-whole40-science-source.independent-b.first.freeze.json'),'sha256':sha(OUT/'whole20-whole40-science-source.independent-b.first.freeze.json'),'files':len(files),'clearNative':9,'sourceHold':7,'compoundHold':2,'specificPHold':2},ensure_ascii=False))
