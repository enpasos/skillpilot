from pathlib import Path
from collections import Counter
from fractions import Fraction
import hashlib,itertools,json
O=Path(__file__).resolve().parent
R=next(p for p in O.parents if (p/'AGENTS.md').is_file())
entry=json.loads((O.parent/'neutral-entry.exact-input.json').read_text())
refs=entry['neutralFirstInputs']; byrole={x['role']:x for x in refs}; bysha={x['sha256'].removeprefix('sha256:'):x for x in refs}
def read(role):return json.loads((R/byrole[role]['path']).read_text())
whole=read('whole_current_479_goal_bodies'); goals={g['id']:g for g in whole['goals']}
owned=read('twelve_whole_unchanged_owned_goal_bodies'); material=read('twelve_whole_profiles_and_24_full_cases_with_fresh_transfers'); source=read('all_16_whole_source_duties_113_edges_41_current_partner_bodies')
semantic=read('whole_current_394_authoritative_semantic_kind_ledger')
assert len(semantic['decisions'])==479 and sum(x['semanticKind']=='curricularAtomic' for x in semantic['decisions'])==394
kindmap={x['goalId']:x['semanticKind'] for x in semantic['decisions']}
assert all(kindmap[g['id']]=='curricularAtomic' for g in owned)
records=[json.loads(x) for x in (R/byrole['ordinary_p_v2_12_candidate_records']['path']).read_text().splitlines()]
profiles={x['goalId']:x for x in records}; mids={x['goalId']:x for x in material['goals']}
assert len(whole['goals'])==479 and len(owned)==12 and set(profiles)==set(mids)==set(entry['goalIds'])
for g in owned:assert goals[g['id']]==g
for g in material['goals']:
 assert len(g['cases'])==2 and g['profile']==profiles[g['goalId']]['profile']
 assert profiles[g['goalId']]['status']=='needs_human_review' and profiles[g['goalId']]['reviewAuthority']=='ai_candidate' and profiles[g['goalId']]['evidenceLevel']=='E1' and profiles[g['goalId']]['maximumClaimScope']=='G1'
 assert all(c[k] for c in g['cases'] for k in ['materialDe','materialEn','taskDe','taskEn','workedSolutionDe','workedSolutionEn','rubric','freshTransferDe','freshTransferEn','freshTransferSolutionDe','freshTransferSolutionEn','limitsDe','limitsEn'])
 expectationids={e['id'] for e in g['profile']['expectations']}
 for c in g['cases']:
  assert {e for r in c['rubric'] for e in r['expectationIds']}==expectationids
partners={g['id']:g for r in source for g in r['wholeCurrentCanonicalPartners']}
assert len(source)==16 and len(partners)==41 and sum(len(r['allOriginalPartnerRows']) for r in source)==113
for g in partners.values():assert g==goals[g['id']]
sourceproof=[]
for r in source:
 m=bysha[r['mappingInput']['sha256'].removeprefix('sha256:')]; x=bysha[r['sourceExtractionInput']['sha256'].removeprefix('sha256:')]
 mapping=json.loads((R/m['path']).read_text()); extraction=json.loads((R/x['path']).read_text())
 sid=r['wholeOriginalDuty']['id']; original=next(g for g in extraction['sourceGoals'] if g['id']==sid);assert original==r['wholeOriginalDuty']
 originalrows=[g for g in mapping['mappings'] if g['legacyGoalId']==sid]
 # Neutral rows retain all keys, including any sourceComponentBinding.
 assert originalrows==r['allOriginalPartnerRows']
 assert set(g['canonicalGoalId'] for g in originalrows)==set(g['id'] for g in r['wholeCurrentCanonicalPartners'])
 sourceproof.append({'sourceGoalId':sid,'wholeDutyExact':True,'allOriginalPartnerRowsExact':True,'partnerCount':len(originalrows),'matchTypes':dict(Counter(g['matchType'] for g in originalrows))})
nums={}
p=Fraction(0); values=[]
for t in range(5):p=p/2+(Fraction(4) if t<3 else Fraction(0))/(1+p);values.append(float(p))
nums['negative_feedback_values']=values
p=Fraction(0); values=[]
for t in range(5):p=p/2+(4 if t<3 else 0);values.append(float(p))
nums['removed_feedback_values']=values
state=(0,0,0); chain=[state]
for t in range(5):state=(int(t<2),state[0],state[1]);chain.append(state)
nums['short_signal_chain']=chain
state=(0,0,0); loop=[state]
for t in range(6):state=(int(not state[2]),state[0],state[1]);loop.append(state)
nums['continuous_input_negative_loop']=loop
nums['negative_loop_edge_sign_product']=1*1*-1
G=['AB','Ab','aB','ab']; nums['polygenic_16_cross_counts']=dict(sorted(Counter(sum(c.isupper() for c in a+b) for a,b in itertools.product(G,repeat=2)).items()))
nums['new_cross_pigment_counts']=dict(sorted(Counter(sum(c.isupper() for c in a+b) for a,b in itertools.product(['Ab','ab'],['aB','ab'])).items()))
nums['polygenic_risks']={str(k):[10+5*k+20*e for e in [0,1]] for k in [4,3,2,0]}
nums['gene_environment_B_interaction']={'AABB_E1':50,'aabb_E1_old':30,'aabb_E1_new':10}
nums['SNP_calls']={}
for name,g,a in [('P',20,20),('Q',30,0),('R_first',8,2),('R_repeat',24,26),('S_reverse_C30T0_after_complement',30,0),('P_A',15,15),('P_N',25,0)]:
 n=g+a;minor=min(g,a)/n;call='uncertain'
 if n>=20:
  if .3<=g/n<=.7 and .3<=a/n<=.7:call='GA'
  elif minor<=.02:call='GG' if g>a else 'AA'
 nums['SNP_calls'][name]={'n':n,'Gfraction':g/n,'Afraction':a/n,'call':call}
nums['SNP_unstratified']={'with_A':30/200,'without_A':10/200,'ratio':(30/200)/(10/200),'difference_percentage_points':100*(30/200-10/200)}
nums['SNP_U_stratified']={'A_high_U':30/150,'nonA_high_U':10/50,'A_low_U':0/50,'nonA_low_U':0/150}
nums['NGS_variant_fraction']=8/20
nums['RNA_CPM']={'Gcontrol':100/1,'Gtreated':200/2,'Hcontrol':50/1,'Htreated':300/2,'G24h':90,'H24h':60}
ref='ACGTACGTACGT';q='ACGTTCGTACGT';nums['alignment_first']={'mismatch_positions_1_based':[i+1 for i,(a,b) in enumerate(zip(ref,q)) if a!=b],'identity':sum(a==b for a,b in zip(ref,q))/len(ref)}
ref='ACGT-ACGTACGT';q='ACGTTACGTACGT';n=len(ref);same=sum(a==b for a,b in zip(ref,q));gap=sum('-' in (a,b) for a,b in zip(ref,q));mis=n-same-gap
nums['alignment_gap']={'columns':n,'identities':same,'gaps':gap,'mismatches':mis,'identity':same/n,'score':2*same-mis-2*gap}
nums['hit_comparisons']={'A_coverage':20/100,'A_identity':20/20,'B_coverage':95/100,'B_identity':84/95,'R_coverage':30/120,'U_coverage_original':85/120,'U_identity_original':80/85,'conditional_U_85_over_110_arithmetic':85/110,'tenfold_database_E':1e-12*10}
# Actual positional bound, independent of the author-provided conditional formula.
original_diverse=set(range(31,121)); retained_after_terminal10_trim=set(range(1,111)); remaining_diverse=original_diverse&retained_after_terminal10_trim
nums['bioinformatics_c2_trimming_feasibility']={'query_length':120,'repeat_positions_1_based':[1,30],'diverse_positions_1_based':[31,120],'trimmed_positions_1_based':[111,120],'retained_diverse_count':len(remaining_diverse),'claimed_retained_U_positions':85,'minimum_U_positions_that_must_be_lost':85-len(remaining_diverse),'all_85_can_remain':85<=len(remaining_diverse),'possible_retained_U_aligned_positions_min':85-10,'possible_retained_U_aligned_positions_max':80,'possible_trimmed_U_coverage_bounds':[75/110,80/110],'cannot_recompute_trimmed_identity_without_actual_alignment':True}
nums['recessive_population_risk']={'confirmed_carrier_unknown_partner':float(Fraction(50,1000)*Fraction(1,4)),'partner_confirmed_Aa_next_birth':.25,'unaffected_sibling_carrier_probability':float(Fraction(2,3)),'sibling_and_unknown_partner':float(Fraction(2,3)*Fraction(90,900)*Fraction(1,4)),'after_confirmed_AA_parent':0}
nums['counseling_comparisons']={'monogenic_transmission':.5,'multifactorial_observed_ratio':.04/.02,'observed_difference_percentage_points':100*(.04-.02)}
assert nums['negative_feedback_values']==[4.0,2.8, float(Fraction(233,95)),float(Fraction(233,190)),float(Fraction(233,380))]
assert nums['polygenic_16_cross_counts']=={0:1,1:4,2:6,3:4,4:1}
assert nums['alignment_gap']['score']==22 and not nums['bioinformatics_c2_trimming_feasibility']['all_85_can_remain']
result={'schemaVersion':1,'role':'Independent exact source/frame checks and self-recomputed finite data; no native/human approval','wholeCanonicalGoals':479,'wholeOwnedGoals':12,'currentCurricularAtomicDenominator':394,'ownedCurricularAtomicKinds':12,'profilesExactToActuallyReadMaterial':12,'wholeBilingualCases':24,'wholeBilingualFreshTransfers':24,'wholeOriginalDuties':16,'wholeOriginalPartnerEdges':113,'wholeCurrentPartnerBodies':41,'sourcePreservationChecks':sourceproof,'independentFiniteRecomputations':nums,'scientificFindingsNotOverriddenByStructureChecks':['Bioinformatics case c2 has an impossible retained-85-position branch after trimming 10 terminal bases from a 90-base diverse region.']}
(O/'recomputed-finite-data-and-whole-source-bindings.independent-b.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS exact 479/12, 12 profiles, 24 bilingual cases/transfers, 16 whole duties, 113 exact original edges, 41 exact whole partners; independent finite data saved')
print('Scientific exception retained: diverse region after terminal trimming contains 80 positions, so all 85 aligned U positions cannot remain')
