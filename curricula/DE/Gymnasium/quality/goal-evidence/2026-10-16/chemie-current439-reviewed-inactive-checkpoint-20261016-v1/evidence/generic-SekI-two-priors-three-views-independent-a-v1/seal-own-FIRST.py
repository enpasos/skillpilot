import json, hashlib, datetime
from pathlib import Path

OUT = Path(__file__).parent
AUTHOR = OUT.parent / 'generic-SekI-fourteen-interface-author-candidate-v1'
CAP = OUT.parent / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
def pin(p):
    p=Path(p); b=p.read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,v):
    p=OUT/name
    assert not p.exists(), 'Additive sealed record, do not overwrite'
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
    json.loads(p.read_text());return pin(p)

selector=AUTHOR/'OUTPUTS.FINAL.generic-SekI-fourteen-interfaces-and-two-NI-acquisition.AUTHOR.selector.json'
assert pin(selector)['sha256']=='sha256:fe2e63e1cf7ad5e0274214bc665b0f9ccb1b388dcb4c8ef928f5b5103f1a6156'
cas=json.loads((AUTHOR/'CAS.FINAL.two-whole-goals-three-whole-views-two-SEM-bindings.AUTHOR.inactive.json').read_text())
neutral=json.loads((AUTHOR/'INPUT.exact-COMBINED-selected22-wholes-and-current-P-only.json').read_text())
ids=['1c1420c2-a8e2-520f-8015-6df637a973bd','1f30d81c-8a26-5675-8c0a-1cb82e96d3ba','28bb9d15-f865-5843-a035-6066580fea64','fd309753-4d48-5570-a4ec-09dfeb20ff9c','4961130b-1ee8-58f2-a319-dff0a864db6a','04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162']
paths=[
 Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-current479-native-refresh-author-20261007-v2/materials/eight-complete-DE-EN-native-P-case-materials.author.json'),
 Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next-twenty-current-methods-acid-base-organic-author-v1/thirty-four-complete-bilingual-material-cases.author-review17.json'),
 Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-current-positive-candidate-v1/positive-evidence.candidates.json')]
cases=[]
for p in paths:
    data=json.loads(p.read_text())
    selected=[x for x in data.get('cases',data.get('goals',[])) if x.get('goalId') in ids]
    # Exclude author conclusions; the whole profiles and every bilingual material/task/answer/boundary body remain.
    for x in selected:
        if 'reason' in x:x={k:v for k,v in x.items() if k!='reason'}
    cases.append({'file':pin(p),'selectedWholeMaterialObjects':selected})
inputs=write('INPUTS.science-only.whole-six-goals-profiles-and-selected-whole-material-objects.json',{
 'role':'Own finite science reading snapshot; no imported independent judgments',
 'sourceSelector':pin(selector), 'wholeCASGoalOperations':cas['goalOperations'],
 'wholeProfiles':[{'goalId':i,'goal':next(x for x in neutral['wholeGoals'] if x['id']==i),'profile':next(x for x in neutral['wholePRecords'] if x['goalId']==i)['profile']} for i in ids],
 'wholeExternalMaterialObjects':cases,
 'materialBoundary':'The fd309/1f30 external objects carry material, task, expected response and counterexample; 1c142/28bb combine material and task in complete DE/EN fields. 04fa author profile is the complete embedded case source. 496 current full profile includes both complete embedded material/task/solution briefs; no separate unverified material body is claimed.'})

record={
 'recordType':'FIRST independent targeted scientific judgment before stock simulation, schema checking or profile serialization',
 'reviewerIdentity':{'agent':'/root/chemie_generic_seki_two_priors_three_views_independent_a_20261016','role':'independent reviewer A, not author','model':'GPT-6 Codex (session supplied; no separate provider API call)','parameters':{'reasoningEffort':'session inherited; not separately exposed','temperature':'not exposed','seed':'not exposed'},'human':False},
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'candidateSelector':pin(selector),'scienceInputs':inputs,
 'independence':'No peer-review directories or peer judgment records were consulted. The neutral combined file contains old P metadata; only whole goals, profiles and current identity/fingerprint fields were selected. Historical opinion text is not scientific evidence or a new vote.',
 'scope':'Two requires-only substitutions and exact generic-DE SekI / NI CrossStage GK / NI CrossStage LK authored view additions. Existing unrelated scientific reviews are not restarted.',
 'decisions':[
 {'goalId':ids[0],'decision':'KEEP','oldPrior':ids[2],'newPrior':ids[3],
  'scientificReason':'Particle-level acid/base solution interpretation supplies the actual conceptual foundation needed here. Memorizing five acid and four hydroxide names/formulas is unnecessary for the supplied HF/NH3 and H2PO4− species tasks; the unchanged symbols/formulas prerequisite remains. Proton-transfer role, conjugate pairing and water amphoterism are aspects of one explanatory model, not independent unrelated routines.',
  'wholeCaseFacts':['HF+H2O⇌F−+H3O+ and NH3+H2O⇌NH4++OH− conserve atoms and charge and demonstrate water in opposite roles.','H2PO4−+H2O⇌HPO4²−+H3O+ and H2PO4−+H2O⇌H3PO4+OH− each conserve total charge −1; supplied species and explicit amphoterism allow transfer without prelearned phosphate nomenclature.','Both DE/EN bodies distinguish a species from a mixture and explicitly prohibit inferring equal extents or neutrality from formal equations.'],
  'sources':['BY C10-HG_SG_MUG_WWG_SWG.4.3–.5 and C10-NTG.2.3–.5: particle ions, Brønsted species/mixtures and proton-transfer equations; whole merged source rows 2c544fec/4c524f0f/bdf423a8 read.','BY primary C10 other: water as ampholyte, proton donor/acceptor, reversible arrow.','NI physical p21: Brønsted, protolysis/conjugate pairs, particle/substance argumentation and autoprotolysis are common, not bold eA-only.'],
  'profileDecision':'KEEP exact complete current UnderstandingProfile and all case bodies in new requires context; E1/G1 AI candidate only'},
 {'goalId':ids[1],'decision':'KEEP','oldPrior':ids[4],'newPrior':ids[5],
  'scientificReason':'For classifying supplied reactions by transferred entity, coupled electron donor/acceptor understanding plus the unchanged Brønsted prerequisite is sufficient. General derivation and balancing of inorganic AND organic oxidation numbers is a stronger routine than this classification requires. The removed goal remains an ordinary separately learnable target in generic SekI.',
  'wholeCaseFacts':['Mg+2H3O+→Mg²++H2+2H2O transfers two electrons. CaCO3+2H3O+→Ca²++CO2+3H2O combines carbonate protonation with decomposition and has no oxidation-state change; both equations conserve atoms/charge.','Case1 supplies Mg=0, O=−II and C=+IV in both carbonate/CO2; case2 supplies unchanged N=−III and H=+I. No general organic oxidation-number derivation or redox equation balancing is required.','Zn/Cu²+ donation/acceptance and NH3/H3O+ proton transfer refute the positive-charge-equals-oxidation error; the N oxidation number remains −III despite NH3→NH4+.','Both languages retain the distinction between a reaction in acidic medium and pure protolysis; visible bubbles alone never classify redox.'],
  'sources':['BY C10-NTG.3.4 whole source row 6f6d7ddb and C10-other.5.3 whole source row 25389d0b explicitly compare base metals/carbonates with acids.','BY primary C9-NTG.3 supports electron donor/acceptor as SekI acquisition.','BB primary p37 lists redox and distinguishes oxygen-based introduction from optional electron-transfer/oxidation-number differentiation; not claimed as a universal full electron-transfer mandate.'],
  'profileDecision':'KEEP exact complete current UnderstandingProfile and all case bodies in new requires context; E1/G1 AI candidate only'}],
 'viewDecisions':[
 {'viewId':'de-de-gym-seki-chemistry','decision':'KEEP','reason':'Generic subject union, not every state’s compulsory identical curriculum. Explicit ordinary target acquisition is appropriate for documentation/interpretation/validity/technical language, bonding/VSEPR/interactions and electron/proton/oxidation-number concepts. Their canonical HE E/Q1 labels do not negate actual BY SekI sources. BY C8.1 and C9.1/C10.1 ground the four process/language additions; BY C9.4/C10.2 supports VSEPR and BY C9.5/C10.3 interactions; BB pp33/36/37 separately support covalent/ionic/metallic models. No new source-coverage edges or national duty claim follow.'},
 {'viewId':'de-ni-gk','decision':'KEEP','reason':'fd309 is deliberately acquired as target in the existing CrossStage plan before Brønsted, derived from common Q-protolysis particle-level/autoprotolysis needs. It is not presented as a newly proven NI SekI obligation or an exact standalone source mapping.'},
 {'viewId':'de-ni-lk','decision':'KEEP','reason':'Same common Q acquisition as GK; no eA-only expansion, no new course or stage, and existing support-only entries must remain support-only.'}],
 'boundaryCasesActuallyConsidered':[
 'Removing Arrhenius must not remove any separate Arrhenius goal, names/formulas acquisition or global mastery. The target chemical model uses supplied species; that is why the prerequisite replacement is valid.',
 'A redox event in acid may involve H3O+ as electron acceptor; presence of acid is not a Brønsted classification. Carbonate case gas is a follow-up to protonation. Both are preserved.',
 'The redox profile uses simple supplied oxidation-number information as corroboration. This KEEP does not authorize arbitrary unsupplied organic numbers or balancing demands after removing that prerequisite.',
 'fd309 case2 specifies dilute 25°C conditions; 10^-5/10^-9=10^4 and product10^-14. Activities/high-ionic-strength and temperature remarks mark model limits, not a newly invented advanced learner computation prerequisite.',
 'Brønsted phosphate amphoterism does not imply equal rates, equal equilibrium extents or neutral pH. The material explicitly blocks that error.',
 'All profiles retain existing minimumIndependentDemonstrations metadata unchanged. No two-task, two-experiment or extra-task quota is invented: a sufficiently rich connected transfer can supply the evidence.',
 'P profiles and teacher-written model responses are candidate design evidence; no actual learner success, HumanApproval, HumanTrial or M7 result follows.'
 ],
 'overallScientificDecision':'KEEP bounded candidate, pending exact private-baseline guards and independent three-view compile/schema checks',
 'newPContextsAuthorizedByThisJudgment':ids[:2],
 'forbiddenClaims':{'HumanApproval':False,'HumanTrial':False,'M7':False,'nativeD':False,'APVExecuted':False,'deployment':False}}
first=write('FIRST.two-priors-three-views.independent-a.science.frozen.json',record)
write('FIRST.seal.json',{'scienceFIRST':first,'status':'sealed before own technical simulation and P materialization'})
print(json.dumps(first,ensure_ascii=False))
