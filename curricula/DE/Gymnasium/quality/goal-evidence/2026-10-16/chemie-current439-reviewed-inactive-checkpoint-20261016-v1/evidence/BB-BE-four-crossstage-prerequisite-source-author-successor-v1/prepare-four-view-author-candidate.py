# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,copy,datetime,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');T=R/'tmp/chemie-m7-resumed-20261016';L=T/'chemie-shared640-recycling-native-author-capsule-L6-v1';O=T/'BB-BE-four-crossstage-prerequisite-source-author-successor-v1'
def read(p):return json.loads(p.read_text())
def fp(v):return 'sha256:'+hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):return dict(path=str(p.relative_to(R)),sha256='sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def put(n,v):
 with (O/n).open('x') as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
cp=L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';can=read(cp);assert pin(cp)['sha256']=='sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80';by={g['id']:g for g in can['goals']}
first=read(O/'FIRST.grouped-58-prior-source-acquisition-overbroad-and-HOLD.AUTHOR.plan.frozen.json');inp=read(O/'INPUT.four-actual-COMBINED-views-and-whole-missing-priors-consumers.json');ev=read(O/'INPUT.current-four-source-whole-cells-and-four-COMBINED-view-roles.json')
resolve=lambda s:next(i for i in by if i.startswith(s))
holdBoth={resolve(x) for x in ['2be9','360fcc','47582','8761','9fa7','e74f']};holdGK=holdBoth|{resolve(x) for x in ['235330','3899','d492']};extra={resolve('fa203'),resolve('2dae')}
byrow={x['goalId']:x for x in first['rows58']}
# Specific primary operators; source families name stage/course limits rather than asserting whole union coverage.
source={}
def assign(prefixes,stage,pages,reason,course='GK_LK',official='compulsory content or competence standard'):
 for p in prefixes.split():source[resolve(p)]={'sourceStage':stage,'printedPages':pages,'sourceOperatorFit':reason,'sourceCourse':course,'officialScope':official}
assign('266a 416d 13d4 9e65 4b6d 7be6 e81a ebaa 1351','SekI',[19,20,21,25,34], 'Plan/execute appropriate school investigations, distinguish observation and explanation, document results, and select safe substance-specific handling/disposal. The existing narrow routine goals operationalize those actual methodological standards, not a new laboratory quota.')
assign('fcc7','SekI',[17,29], 'Describe and classify substances by characteristic observable properties; this is the explicit foundation of substance and mixture work.')
assign('5b1 431a 1df1','SekI',[22,23,25], 'Research/select relevant chemistry information, distinguish evidence from value criteria, weigh supported arguments and decision options. Ecological/economic/ethical dimensions are contextual criteria, not an invented requirement that every task must use every dimension.')
assign('9fc8 7d9 4aa3','SekI',[19,20,21,22,23], 'Record measurements/source/units and conditions, interpret trends against hypotheses, and qualify error, validity and warranted conclusions. Whole current P profiles are retained, not reapproved by this placement.')
assign('8d4 1bda e0d0 9b5d e7c3 bcf8 17fe 11bea','SekI',[18,20,30,31,38], 'Chemical transformations/new substances, oxygen transfer and simple redox examples, conservation and constant proportions, model/particle explanations, symbols and equations. The half-equation part of11bea is additionally justified by upper common p50, not attributed literally to every SekI beginner case.')
assign('9888 5338 7223 4488 9b56','SekI and authored E theme',[17,32,33,34,36,37], 'Particle state/solution explanations, core-shell atoms and electron-pair/ionic/metallic bonding. Rutherford is treated as evidence for the existing core-shell model; EPA and all three binding types additionally have explicit common authored E p19 and Q repeat p27. No Pauli/Hund orbital model is inferred.')
assign('5c47 1e5a','SekI and authored E theme',[20,33,38], 'Qualitative particle-model pressure/temperature/volume and equal particle-number interpretation of molar gas volume. Upper E p18 explicitly includes Avogadro constant and molar volume; this supports the narrow explanatory model, not a quantitative kinetic-gas theory.',official='SekI model standards plus optional authored E quantitative theme; owner interim all-authored-topic target')
assign('d2cc 28bb','SekI',[39], 'Indicator-based acidic/neutral/alkaline classification, aqueous hydronium/hydroxide account and explicit Arrhenius and/or Brønsted differentiation. The selected names/formulas in retained P are exemplars, not asserted literal official lists.')
assign('2213','SekII common',[50], 'Determine oxidation numbers and formulate redox half-equations and full equations for selected inorganic/organic reactions.')
assign('70b1','SekI and SekII common',[34], 'Simple electrolysis of water/ions and ion/electrode processes; upper common p53 gives theoretical electrolysis and a technical example. Supplied aqueous-product case is interpreted under its explicit conditions, not a universal GK aqueous-experiment duty.')
assign('5a30 5851 858d a378 70b34 973c','SekI and SekII common',[40,42,43,44], 'Structure-dependent melting/boiling/solubility and solvent choice, alkanol oxidation to carbonyl/carboxyl products, carboxylic acids, condensation/ester properties and controlled aldehyde evidence. Secondary-alcohol differentiation is explicit optional SekI differentiation; upper common p50 adds alkanol-to-acid series and Fehling/Tollens evidence. Actual practical demands stay practical; fictional data are not execution evidence.')
assign('17ac e5ae','SekII common',[38], 'Compare halogen/alkane reaction conditions and represent radical substitution with light/heat dependence. The actual printed left GK column and introductory paragraph establish common scope, retained in LK.')
assign('3fb7','SekII common',[30], 'Represent electrophilic addition in monomer production (vinyl chloride from ethyne/HCl). No SN inference is drawn from this common EA operator.')
assign('3899 d492','SekII LK',[30], 'Actual additional LK column specifies alcohol synthesis from haloalkanes and nucleophilic-substitution mechanism. Whole current P uses a supplied OH-substitution model/conditions and atom/charge balances; its new acquisition placement is LK only. General GK word Substitution is not treated as proof of this full specific operator.',course='LK')
assign('6966','authored E theme',[17,24], 'Amphiphilic surfactant structure, micelles, emulsification and lowering of surface tension are explicit in the optional washing theme; owner all-authored-topic policy includes the authored theme without claiming official universal theme selection.',official='official school-selected E theme; owner interim all-authored-topic target')
assign('cc803','SekII common',[34,50], 'Perform/evaluate calorimetric energy investigations and distinguish donor-acceptor reaction context. Redox is an admissible concrete chemical-reaction context; the broad prerequisite claim for UIt-work remains separately flagged, not endorsed by placement.')
assign('b759 c95 efa2','SekII common',[53,54], 'Working principle of primary/secondary/fuel cells, electrolysis versus galvanic conversion, corrosion and protection. Whole current c95 supplied passivation/kinetics evidence and efa qualitative reversibility are contextual model transfers, not an imported Pourbaix or quantitative overpotential routine.')
assign('2353','SekII LK',[48], 'Explicit LK mesomerie model supports the existing resonance-representation skill. Its whole ionic-resonance P remains retained; e74 Pauli/Hund prior is a separate unresolved whole-interface/source restriction, not silently acquired.',course='LK')
assign('fa203 2dae','SekI',[30,31,33], 'Actual first-reaction combustion and air-components/oxygen-content operators support the full existing narrow chain: air mixture/oxygen availability then interpret new combustion products. Full two P cases per goal were read; no universal real-lab execution is claimed for these supplied observation/model cases.')
assert set(source)==(set(byrow)-holdBoth)|extra
pv=L/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-F03-private-L6-technical-20261016-v1/P439.exact438-whole-lines-plus-own-F03.for-native-model.jsonl';profiles={p['goalId']:p for p in map(json.loads,pv.read_text().splitlines())}
rows=[];ops=[]
for old in inp['COMBINEDRows']:
 course=old['scope']['courseProfile'];missing=set(old['missingTransitiveFromOrdinary']['missingPriorIds']) if isinstance(old['missingTransitiveFromOrdinary'],dict) else None
 if missing is None:
  # Inventory's exact transitive entries explicitly identify their missing IDs.
  missing={x['id'] for x in old['missingTransitiveFromOrdinary']}
 allowed=(missing-(holdGK if course=='GK' else holdBoth))|extra
 rows.append({'view':old['view'],'scope':old['scope'],'currentMissingTransitiveIds':sorted(missing),'proposedAddedTargetIds':sorted(allowed),'deferredMissingIds':sorted(missing-allowed),'sourceRows':[{'goalId':i,'title':by[i]['title'],**source[i]} for i in sorted(allowed)]})
# freeze this refined author source decision before view serialization
science={'role':'AUTHOR finite source/course/whole-interface refinement FIRST before four-view mechanics; no independent vote','frozenUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'initialPlan':pin(O/'FIRST.grouped-58-prior-source-acquisition-overbroad-and-HOLD.AUTHOR.plan.frozen.json'),'actualCanonical':pin(cp),'existingCOMBINEDAcceptedRoles':'Actual current LK eleven-target AFTERs are retained whole; the two requires replacements are current canonical. No canonical edit is proposed.','sourceEvidence':pin(O/'INPUT.current-four-source-whole-cells-and-four-COMBINED-view-roles.json'),'retainedKnownGK5Basis':pin(T/'BB-BE-GK-two-foundations-source-acquisition-author-basis-v1/OUTPUTS.BB-BE-GK-existing-two-foundations-own-closure.source-basis.AUTHOR.selector.json') if (T/'BB-BE-GK-two-foundations-source-acquisition-author-basis-v1/OUTPUTS.BB-BE-GK-existing-two-foundations-own-closure.source-basis.AUTHOR.selector.json').exists() else {'root':str((T/'BB-BE-GK-two-foundations-source-acquisition-author-basis-v1').relative_to(R))},'refinementOfInitialPlan':{'SN3899andD492':'GK HOLD; explicit LK primary column only is sufficient here. Initial plan prose had not settled this column; final new GK targets do not include either.','combustionClusterOtherKind':'The same inventory reports871cluster→fa203; actual fa203→2dae also absent. Both narrow whole goals/Ps and actual source p30/31/33 read and supported. Include both in the same four-view repair.'},'scopePolicy':{'stage':'All four authored scopes are CrossStage. Earlier SekI competencies must be acquired here, not falsely declared prior mastered or hidden as support. No new SekII universal duty follows from phase metadata.','optionalEThemes':'Official E themes are school-selected, experiments recommended, italics extensions. Owner interim includes all authored applicable topics; it does not record a learner/theme selection or promote LK-only content to GK.','sourceEvidenceLimits':'92 selected whole mapping cells/258 inherited/direct traces are retained as existing evidence only. Missing own method cells in these four collections are explicitly retained; actual primary standards support placements. No mapping review status/whole-source-union approval is invented.'},'fourViews':rows,'addedTwoWholeGoalsAndWholeCurrentP':[{'wholeGoal':by[i],'wholeCurrentP':profiles[i],'sourceFit':source[i]} for i in sorted(extra)],'LKOnlySNWholesAndCurrentP':[{'wholeGoal':by[i],'wholeCurrentP':profiles[i],'sourceFit':source[i]} for i in [resolve('3899'),resolve('d492')]],'remainingHOLDs':first['genuineScopeHolds']+[{'ids':[resolve('3899'),resolve('d492')],'courses':['GK'],'reason':'Specific SN operator is explicit LK. Existing GK dependent target interfaces may be overbroad; no automatic whole SN acquisition obligation is authored.'}],'overbroadWholeInterfaces':first['provenOverbroadSequencingFindings'],'sourceMappingCASOperations':0,'sourceMappingCASReason':'This candidate changes acquisition placements, not actual existing source decisions. Primary operator/course bindings and exact existing cells are review inputs. No absent extracted method atom, new source row, self-review identity, or source union release is invented.','normalWrites':0,'newIndependentVotes':0,'fullAPV':0,'builds':0,'M7Claim':False}
put('FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json',science)
# Whole-view author mutations: append only missing target entries to fitting existing sections.
placements={}
def place(prefixes,suffix):
 for p in prefixes.split():placements[resolve(p)]=suffix
place('266a 416d 13d4 9e65 4b6d 7be6 e81a ebaa 1351 5b1 431a 1df1 9fc8 7d9 4aa3','chemische-erkenntnisgewinnung-und-kommunikation-sek-i')
place('fcc7 9888 5338','chemische-grundlagen-sek-i')
place('8d4 1bda e0d0 9b5d e7c3 bcf8 17fe 11bea fa203 2dae','chemische-reaktionen-und-energieumsatz-sek-i')
place('7223 4488 9b56 2353','atombau-bindungsmodelle-molekulgeometrie-und-polaritat')
place('5c47 1e5a','stoffmenge-molare-groessen-und-gase-sek-i')
place('d2cc 28bb 5a30 5851 858d a378 70b34 973c 17ac e5ae 3fb7 3899 d492 6966','stoffgruppen')
place('2213 70b1','ionen-und-elektrolyse-sek-i')
place('cc803 b759 c95 efa2','energie-und-nachhaltigkeit')
assert set(placements)==set(source)
for row in rows:
 rel='curricula/DE/Gymnasium/composition-views/chemie/'+row['view'];p=L/rel;before=read(p);after=copy.deepcopy(before)
 assert before['scope']==row['scope']
 if row['scope']['courseProfile']=='LK':
  prior=T/'BB-BE-eleven-crossstage-LK-acquisition-view-only-author-successor-v1'/('AFTER.'+row['view'].replace('.view.json','.whole-view.AUTHOR.inactive.json'))
  # Old filenames use de-bb-lk.whole-view..., not .view segment.
  assert before==read(prior)
 structures={}
 def walk(ns):
  for n in ns:
   if n['kind']=='structure':structures[n['id']]=n;walk(n.get('children',[]))
 walk(after['rootNodes']);prefix='chemistry-de-'+row['scope']['jurisdiction'][-2:].lower()+'-'+row['scope']['courseProfile'].lower()+'-'
 actualentries=[];allowed=set(row['proposedAddedTargetIds']);cluster=resolve('266a');labchildren=set(by[cluster].get('contains',[]))
 for i in sorted(allowed):
  if cluster in allowed and i in labchildren:continue
  parent=structures[prefix+placements[i]]
  entry={'kind':'canonicalSubtree' if i==cluster else 'goalEntry','goalId':i,'projectionRole':'target'}
  parent['children'].append(entry);actualentries.append({'parentStructureId':parent['id'],'reference':entry})
 put('BEFORE.'+row['view'].replace('.view.json','.whole-view.json'),before)
 put('AFTER.'+row['view'].replace('.view.json','.whole-view.AUTHOR.inactive.json'),after)
 ops.append({'operation':'replace-whole-composition-view-if-exact','targetPath':rel,'expectedCurrentFileSha256':pin(p)['sha256'],'expectedCurrentWholeObjectFingerprint':fp(before),'before':before,'after':after,'expectedAddedEffectiveTargetGoalIds':row['proposedAddedTargetIds'],'addedExplicitReferences':actualentries,'sourceBinding':{'scienceFirst':str((O/'FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json').relative_to(R)),'primaryScope':'Only course-appropriate existing acquisition goals; source official obligations/electives distinct from owner all-authored-topics scope. No prerequisiteOnly shortcuts.'}})
put('CAS.four-whole-BB-BE-CrossStage-views.source-supported-acquisition.AUTHOR.inactive.json',{'role':'Inactive AUTHOR proposal; not applied, not reviewed/released','canonicalBinding':pin(cp),'guardRule':'Each physical target file SHA and whole before object must match. Preserve every prior current reference and role. Do not overwrite from older canonical or two-LK before snapshots.','scienceFirst':pin(O/'FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json'),'operations':ops,'sourceMappingOperations':[],'canonicalGoalOperations':[],'normalWrites':0,'newIndependentVotes':0})
print(json.dumps({'scienceFirst':pin(O/'FIRST.refined-primary-course-and-combustion-author-science.before-mechanics.frozen.json'),'operations':len(ops),'newRoles':[{'view':r['view'],'added':len(r['proposedAddedTargetIds']),'deferred':len(r['deferredMissingIds'])} for r in rows]},ensure_ascii=False))
