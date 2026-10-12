# SPDX-License-Identifier: Apache-2.0
"""Literal binding inventory. No source-coverage decisions or scientific votes."""
import functools,hashlib,json,pathlib
R=pathlib.Path.cwd();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';B=D/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6';S=D/'chemie-q2-naturstoffe-source4-MM-targeted-remediation-author-20261012-v3';P9=D/'chemie-q2-naturstoffe-P9-targeted-remediation-author-20261012-v3'
def read(p):return json.loads(p.read_text())
def ref(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
g={x['id']:x for x in read(B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json')['goals']}
selected=set(read(B/'neutral/actual-targeted-native-goal-ids.json'))
for name in ['P37.current-whole-retained-and-targeted.pending.review.jsonl','P2.current-M1-and-3fb7-retained.exact.jsonl','P1.current-fcc-collateral.exact.jsonl']:
 selected.update(json.loads(s)['goalId'] for s in (B/'positive'/name).read_text().splitlines() if s.strip())
@functools.lru_cache(None)
def desc(i):return {i}|set().union(*(desc(c) for c in g.get(i,{}).get('contains',[])))
cfg=read(B/'atlas/normal-source-inputs.capsule.config.json');rows=[];inputs=[];missing=[]
receipt=read(B/'atlas/full-expanded-normal-receipt.actual.json');witnesses={}
for scope in receipt['scopes']:
 for w in scope['witnesses']:
  if w['goalId'] in selected:witnesses.setdefault((w['mappingPath'],w['sourceGoalId'],w['mappedTargetGoalId']),[]).append({'scopeKey':scope['key'],'wholeNormalWitness':w})
for mp in cfg['mappingPaths']:
 p=R/mp;m=read(p);sp=R/m['sourceExtractionPath'];src=read(sp);sg={x['id']:x for x in src.get('goals',src.get('sourceGoals',[]))};dec=m.get('decisions',[]);inputs.append({'mapping':ref(p),'sourceExtraction':ref(sp),'sourceDocument':src.get('sourceDocument'),'wholeMappingRows':len(m.get('mappings',[]))})
 for ix,entry in enumerate(m.get('mappings',[])):
  target=entry.get('canonicalGoalId');affected=sorted(desc(target)&selected)
  if not affected:continue
  sid=entry.get('legacyGoalId',entry.get('sourceGoalId'));literal=sg.get(sid)
  if literal is None:missing.append({'mappingPath':mp,'mappingOrdinal':ix,'sourceGoalId':sid})
  rows.append({'rawBindingKey':f'{mp}#mappings[{ix}]','mappingPath':mp,'mappingOrdinal':ix,'wholeOriginalMappingRow':entry,'wholeOriginalDecisionRows':[{'ordinal':di,'decision':x} for di,x in enumerate(dec) if x.get('sourceGoalId')==sid or x.get('id')==entry.get('reviewDecisionId')],'wholeLiteralSourceGoal':literal,'sourceExtractionPath':str(sp.relative_to(R)),'sourceDocument':src.get('sourceDocument'),'sourceStage':src.get('stage'),'sourceJurisdiction':src.get('jurisdiction'),'directCanonicalOwner':target,'affectedTargetDescendants':affected,'directOwnerIsSelected':target in selected,'rawContainsRelationIsScopeEvidence':False,'actualNormalCompiledScopeWitnesses':witnesses.get((mp,sid,target),[]),'broadInheritedBindingIsDirectCoverage':False,'mappingClaimScientificallyApprovedByThisPreparer':False})
assert not missing,missing
write(B/'sources/all-current-raw-source-bindings.no-display-dedup.json',{'selectedWholePAndNativeGoals':sorted(selected),'mappingInputs':inputs,'rawBindings':rows,'rawBindingCount':len(rows),'displayDeduplicated':False,'missingLiteralGoals':missing,'newSourceReview':False,'historicalRationalesPreservedAsHistoricalClaimsOnly':True,'wholeSourceUnionApproved':False})
operators=[]
for p in [S/'sources/raw5.actual-literal-route-operator-audit.json',S/'sources/source5.literal-inventory.actual-read.json',S/'sources/HE-AA-TLC-direct-owner-addition.actual-proof.json',S/'sources/MM-own-enrichment.adopted-inactive-scope.json',S/'sources/primary-method-references.actual-read.json']:
 operators.append({'originalSealedArtifact':ref(p),'wholeOriginalOperatorAudit':read(p),'currentStatus':'authored candidate; exact new independent acceptance pending'})
for p in (P9/'sources').glob('*.json'):
 operators.append({'originalSealedArtifact':ref(p),'wholeOriginalP9SourceAudit':read(p),'currentStatus':'authored candidate; exact new independent acceptance pending'})
write(B/'sources/actual-source-case-operator-table-and-preserved-whole-audits.json',{'sourceAuditContributions':operators,'currentRawBindingInventory':ref(B/'sources/all-current-raw-source-bindings.no-display-dedup.json'),'scope':'All raw current mapped contributions affecting the retained whole P and selected native goals, including broad inherited clauses; no display dedup or union approval.','changedSourceOwners':{'978a6f25-0601-5457-9211-aab206c95603':'actual AA-TLC owner HE; paper/indicator/GC routes remain bounded to literals','e81a4aed-9695-533e-8eb7-7a0c714346ea':'actual teacher-authorized bromine execution BW3.3.3(2), preserve old whole P','3fb7dea4-f832-5e23-b518-68b13a655b92':'interpretive bromine mechanism BW3.4.4(12), canonical/P body unchanged','b4ca3af2-77f1-59e8-955d-c4959e284242':'HE temperature contribution exact owner; original native tuple unchanged, only source ownership context requires fresh independent audit','c245d5fd-ce46-5b45-ab2e-e610547b5f7c':'Own Michaelis-Menten enrichment. HE temperature source is context, not an official MM mandate.'},'newScientificVotes':0,'wholeSourceUnionApproved':False})
print(json.dumps({'selectedWholePAndNativeGoals':len(selected),'rawBindings':len(rows),'mappingInputs':len(inputs),'literalMissing':len(missing),'newScientificVotes':0}))
