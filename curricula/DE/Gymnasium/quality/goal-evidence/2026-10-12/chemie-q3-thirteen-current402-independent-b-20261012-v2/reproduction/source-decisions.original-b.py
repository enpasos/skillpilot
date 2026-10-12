"""Bounded original B source judgments and exact preservation receipts."""
from pathlib import Path
import hashlib, json

ROOT=Path(__file__).resolve().parents[8]
OWN=Path(__file__).resolve().parent.parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-live-context-author-20261012-v2'
def read(p): return json.loads(Path(p).read_text())
def hashbytes(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def stable(o): return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def save(name,o):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')

source=read(AUTHOR/'sources/selected13-whole-direct-source-duty-contexts.author.actual.json')
deltas=read(AUTHOR/'sources/concrete-source-mapping-deltas.author.json')
observations=[
 'BY C12-GA.7.5 and C12-EA.7.7 retain two genuine clauses. Current 882630 covers the societal explanation and 36666 explicitly compares trustworthiness, authorship, intention and validity of analogue/digital sources. This is a sound bounded division; it does not establish all original source-union coverage.',
 'BY C12-GA.8.2 and C12-EA.8.2 retain spatial redox separation and work from U/I measurements. f093 explains cell structure/electrode reactions, while 96fd calculates loaded simultaneous measurement data and bounds chemical-energy interpretation. This division is chemically sound; no actual measured learner performance is claimed.',
 'HE Q3.1 increased-level original at S.46 explicitly includes unequal stoichiometric sums and quadratic concentration equations. c046 and q3-07-c now provide the complete quadratic material-balance routine. Keep this source contribution LK-only; the simplified 20f goal still has its own legitimate sources.',
 'HE Q3.3 increased-level original S.47 says Faraday laws without calculations. q3-09-c is a valid qualitative contribution; it cannot make the quantitative whole b8c8 goal a source-faithful compulsory HE target. HOLD actual HE selection/target semantics until qualitative and quantitative obligations are separated.',
 'HE Q3.5 literal Stoff, Konzentration, Zerteilungsgrad corresponds to the current explanatory 3ce goal, rather than solely rate extraction 56bc. This limited remapping is sound. It neither approves another source operator nor assumes which Q3 optional topic is selected.',
 'Removing Q3 equilibrium-process optimization from the NRW LK chromatography/Rf row is correct. Original printed S.54 contains real separation and retention-factor interpretation. The other retained partner assignments are not automatically full coverage; an actual chromatographic contribution remains to be demonstrated independently.',
 'Removing H2 storage from NRW SekI water/dipole/hydrogen-bond explanation is correct. Hydrogen bonding between water molecules is not hydrogen fuel storage. Retained partners keep exact historical scientific evidence; this targeted removal grants no blanket union coverage.',
 'HB original S.24 explicitly requires LK reaction order from concentration-time data and SN1/SN2 mechanisms. It supplies no compulsory Arrhenius, autocatalysis or catalogue of catalysis forms. Removing those invented contributions is correct; a4 provides mechanism comparison. Partner 138 still needs specific evidence for reaction-order determination; generic mechanism-data analysis alone is not exact coverage.',
 'RP original S.50-51 presents common Grund-/Leistungsfach content, then S.52 lists Arrhenius under optional Vertiefungs-/Verzahnungsmöglichkeiten. e62 is the correct calculation-method contribution; a SekI laboratory cluster is not. HOLD mandatory scope selection, because this optional entry does not itself choose an LK or GK target.',
]
rows=[]
for d,obs in zip(deltas['mappingDeltas'],observations):
 rows.append({'sourceGoalId':d['sourceGoalId'],'currentMappingInputPath':d['mappingInputPath'],
  'candidateAfterDigest':hashbytes(stable(d['after']).encode()),'currentCanonicalGoalIds':d['after']['canonicalGoalIds'],
  'decision':'pass_bounded_remediation' if d['sourceGoalId'] not in ['he-chem-sekii-q3-3-b10-a01-f814c697','rp-chem-sekii-rp-ch-sekii-2022-baustein-7-5-003-284ca335'] else 'hold_scope_selection',
  'independentScientificObservation':obs,'wholeSourceUnionApproved':False,'actualOperatorExecutionClaim':False})
save('sources/nine-mapping-five-source-components.original-b.json',{'schemaVersion':1,'rows':rows,'mappingCount':len(rows),'sourceComponentRows':[
 {'sourceGoalId':d['sourceGoalId'],'currentAfterDigest':hashbytes(stable(d['after']).encode()),'literalAndOperationalizationDistinguished':True,
  'decision':'pass_bounded_source_component','originalNormReplacedByLocalAuthorWording':False}
 for d in deltas['sourceRowDeltas']], 'sourceComponentsCount':5,'sourceUnionApproved':False})

save('sources/656-literal-source-read-bindings.original-b.json',{'schemaVersion':1,'sourceInputPath':str((AUTHOR/'sources/selected13-whole-direct-source-duty-contexts.author.actual.json').relative_to(ROOT)),
 'sourceFileDigest':hashbytes((AUTHOR/'sources/selected13-whole-direct-source-duty-contexts.author.actual.json').read_bytes()),
 'literalRowCount':len(source['rows']),'readScope':'Every supplied literal clause and differing raw parent clause; targeted whole primary contexts and current canonical partner semantics. This is not a full clearance of all state source unions.',
 'rows':[{'ordinal':i,'key':r['key'],'wholeRowDigest':hashbytes(stable(r).encode()),'literalClauseDigest':hashbytes(stable(r['wholeSourceGoal'].get('rawSourceText',r['wholeSourceGoal'].get('sourceText'))).encode()),
  'currentWholePartnerGoalIds':r['partnerWholeCanonicalGoalIds'],'reviewedLiteralContext':True,'wholeUnionApproved':False} for i,r in enumerate(source['rows'])],
 'sourceUnionApproved':False,'oldLiteralContextDoesNotOverrideCurrentOriginalComponent':True})

scope=read(AUTHOR/'checks/source-payload-deltas.current-live.actual.json')
view=read(AUTHOR/'checks/parent-history.source-view-deltas.normal.actual.json')
base=read(AUTHOR/'inputs/current523.live-base.exact.de.json')
new=read(AUTHOR/'inputs/current523.author-successor.de.json')
old_by={g['id']:g for g in base['goals']};new_by={g['id']:g for g in new['goals']}
protected=scope['currentStrictProtectedSourceContextGoalIds']
assert len(protected)==12
continuity=[]
for gid in protected:
 same=old_by[gid]==new_by[gid]
 assert same,(gid,'protected own goal changed')
 continuity.append({'goalId':gid,'wholeOwnGoalUnchanged':same,'wholeOwnGoalDigest':hashbytes(stable(new_by[gid]).encode()),
  'decision':'retain_valid_own_D_P_A_M_V; review_changed_source_context_only',
  'sourceContextDecision':'bounded_current_source_context_review; no new wholesale source-union approval'})
save('sources/current20-protected12-contexts.original-b.json',{'schemaVersion':1,'normalCompactedSourcePayloadChanges':scope['changedFromBaseSource382'],
 'currentSource381EqualsParentProposedSource381':scope['changedFromParentProposed381']==[],
 'protectedRows':continuity,'protectedCount':12,
 'threeMembershipChanges':[{'scope':x['scope'],'removedGoalIds':x['removedGoalIds'],'addedGoalIds':x['addedGoalIds']} for x in view['changedViews']],
 'sourceProjectionPublishedGoals':381,'unresolvedSourceScopeDecisions':497,'wholeCurrentCurricularAtomicDenominator':402,
 'ownScienceRestarted':False,'sourceAtlasIsRoutingNotScientificClearance':True,
 'scientificContextReview':{
  'NRW-protected-locator-context':'Printed S.54, not S.53, for the retained chromatography/Rf row is verified against the original PDF. The remapped target lists are preserved as partial source context, not silently promoted to exact whole-goal competency proof.',
  'BY-protected36666':'Actual source trustworthiness/authorship/scientific-correctness clause matches this current partner. Current own goal semantics are unchanged; its validated scientific review is preserved.',
  'BY-protectedf093':'Redox spatial separation belongs to the cell-structure explanation. New GK membership is appropriate as bounded partner context; current own scientific evidence is preserved.',
  'BW-protectedd9cce':'Printed original S.25 contains condition-choice and catalyst clause. Kinetic catalyst competence contributes only its clause, not the complete optimization operator.',
  'HB-protecteda4bac':'Original S.24 LK explicitly names SN1/SN2. The current mechanism-comparison goal matches this contribution; Arrhenius or autocatalysis is not inferred.'},
 'wholeSourceUnionApproved':False})

save('sources/operator-and-scope-holds.original-b.json',{'schemaVersion':1,'reviewAuthority':'ai_candidate','humanApproval':False,'humanTrial':False,'holds':[
 {'component':'TH original PDF-S.48 / printed S.43','observation':'Basic-column student experiment requires investigating temperature, concentration and catalyst; increased-column partner requires recording, graphing and evaluating reaction measurements. The supplied literal truncated temperature clause cannot replace the whole primary operator. Do not invent an additional TH hypothesis-planning phrase. Current thirteen explanatory/arithmetic cases are not an execution-criteria package.'},
 {'component':'BW 3.3.2(7), printed S.25 / PDF-S.27','observation':'Experimental equilibrium investigation is explicit. The concentration-specific d2d735 partner can cover its bounded concentration change. Temperature/pressure and complete experiment criteria are still unclosed; pure Le-Chatelier predictions do not discharge them.'},
 {'component':'BY C12-GA.6.2 and C12-GA.1.8-.9','observation':'The topic-specific row requires hypothesis-led planning, while general competencies retain safely conducting and documenting investigations (or the actually allowed model route). No synthetic model answer proves an actual conducted experiment; missing human trial alone is not a machine-M7 hold.'},
 {'component':'HB original S.24, basic and LK columns','observation':'Basic kinetics explicitly covers temperature, pressure, concentration and division qualitatively AND quantitatively; current3ce covers no pressure/quantitative determination. The actual LK-only duties are reaction order and SN1/SN2, not Arrhenius/autocatalysis.'},
 {'component':'HE original Q3.3 S.47','observation':'Faraday without calculation cannot confer a compulsory quantitative target. Keep the valid qualitative contribution and other-state quantitative cases separately bounded.'},
 {'component':'RP S.52','observation':'Optional Arrhenius needs reviewed authored selection semantics; absence from the 381-page source atlas is not clearance of the whole402 target.'},
 {'component':'Broader photochemical hydrogen row','observation':'Electrolysis/storage goal93 is not complete artificial-photosynthesis/photocatalytic splitting. Current broader7dc80 partner retains its own duties and requires separate source-union evidence.'},
 {'component':'Other retained 656-row source unions','observation':'Broad inherited mappings include duties such as kinetics-from-rates MWG derivation, chromatography, standard hydrogen electrode and water hydrogen bonding. The nine targeted changes do not prove every literal clause is closed. No new global source approval is granted.'}],
 'machineM7RequiresActualHumanLaboratorySession':False,'actualOperatorExecutionApproved':False,'wholeSourceUnionApproved':False})
print('B source decisions serialized: 9 mappings, 5 components, 656 literal bindings, 20 changed source contexts and 12 preserved protected own goals.')
