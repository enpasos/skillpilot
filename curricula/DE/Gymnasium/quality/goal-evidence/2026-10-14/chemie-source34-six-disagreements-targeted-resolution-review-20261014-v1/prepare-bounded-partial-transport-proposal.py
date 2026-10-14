# Apache-2.0. Exact unactivated CAS operations; does not create reviewed mapping carriers.
import hashlib, json, pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot')
O=pathlib.Path(__file__).parent
read=lambda p:json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
context=read(O/'INPUT.complete-original-source-cells-all-current-mapped-whole-partners.actual.json')
science=read(O/'SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json')
spec=[
 ('DE-NI','e96771d3-fd72-59e6-8f4c-573ef8cbde0a','ni-chemistry-sekii-kc2022-q-organik-3-kompetenz-007-9576128b',
  'Only health/safety assessment within the full NI30 aromatic+technical-use+criteria union. This edge alone supports neither the whole aromatic goal nor the whole original safety operator.'),
 ('DE-SH','f947cd04-952a-5a9d-9445-3ffc70e02c3c','de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-004-761cb33c',
  'Only manufacture/formation of the statically curated PU example. Whole original004 also requires properties; all old property/manufacture partners and LK008/009 remain.'),
 ('DE-NI','afa7dae7-9378-5687-aa8d-69a04afaa0d8','ni-chemistry-sekii-kc2022-q-makro-nano-kompetenz-029-14de666d',
  'Only selected-Nano-material benefit/risk application in compulsory eA content. Size/surface/model/interaction source024–028 remain through their whole partners. No GK Nano grant.'),
 ('DE-RP','afa7dae7-9378-5687-aa8d-69a04afaa0d8','rp-chem-sekii-rp-ch-sekii-2022-baustein-14-2-001-2d1692b6',
  'Only one curated Nano application inside compulsory LK14.2. The original at-least-two-applications duty and all14.1/14.3 operators remain. No actual GK-W choice is proven.'),
 ('DE-SN','afa7dae7-9378-5687-aa8d-69a04afaa0d8','sn-chem-sekii-sn-ch-jahrgangsstufe-12-leistungskurs-lb3-082-01-604d7267',
  'Only a described selected Nano material/application in mandatory LK content. No full application of all structure/property or surface operators, no082-02/03/04 recycling remap, no GK grant.'),
]
rows=[]
for state,gid,sid,boundary in spec:
 s=next(s for s in context['states'] if s['jurisdiction']==state)
 cell=next(c for c in s['wholeSourceCells'] if c['id']==sid)
 rec=next(r for r in science['records'] if r['tuple']['jurisdiction']==state and r['tuple']['goalId']==gid)
 assert rec['structuralTargetDecision'].startswith('RETAIN')
 carriers=[]
 for c in s['existingMappingCarriers']:
  p=R/c['wholeCarrierBinding']['path'];j=read(p)
  assert not any(m['legacyGoalId']==sid and m['canonicalGoalId']==gid for m in j['mappings'])
  old=[m for m in j['mappings'] if m['legacyGoalId']==sid]
  carriers.append({'exactWholeCarrierBefore':c['wholeCarrierBinding'],
    'operation':'append-only unactivated proposal; no after-carrier or authoritative source decision minted',
    'originalWholeSourceCellPartnerRowsPreserved':old,
    'proposedMappingRow':{'legacyGoalId':sid,'canonicalGoalId':gid,'matchType':'partial',
      'courseLevelDecision':'LK','courseLevelRationale':'This specific relationship concerns only the LK curated programme example established by the bound whole-source resolving review. '+boundary,
      'comment':'UNACTIVATED transport proposal; source relationship is PARTIAL. Whole source duty closure and actual classroom selection not granted. '+boundary},
    'existingWholeCarrierRowsAndDecisionsPreserved':True})
 rows.append({'jurisdiction':state,'courseProfile':'LK','wholeSourceCell':cell,'wholeCurrentGoal':rec['wholeCurrent407Goal'],
  'scienceResolutionId':rec['resolutionId'],'wholeScientificResolutionBinding':bind(O/'SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json'),
  'relationshipStrength':'PARTIAL','specificBoundedRelationship':boundary,
  'targetScopeDecisionSeparatedFromSourceRowCoverage':True,'carrierCASOperations':carriers,
  'operativeSourceGrant':False,'wholeOriginalSourceClosure':False})
out={'schemaVersion':1,'role':'Mechanical minimal inactive PARTIAL transport candidate following the first sealed targeted resolving review; no new scientific vote',
 'fiveRelationships':rows,'relationshipCount':len(rows),'carrierAppendOperations':sum(len(r['carrierCASOperations']) for r in rows),
 'allOriginalSourceCellsAndWholePartnerUnionsPreserved':True,'afterMappingCarriersMinted':False,
 'noAutomaticApplication':'Root may prepare reviewed source-decision CAS transport with explicit original history and normal independent reconciliation/integration. These proposals are not a published/operative mapping collection.',
 'stockLimit':'CQR-004 skips partial edges and CQR-003 counts source-ID/view intersections. A technical pass therefore cannot decide these whole scientific operator/conditional-course questions.',
 'fourWholeGoalBodiesOrFPsMutated':False,'newD_P_A_M_V_M7_HumanVotes':0,'strictGain':0,'activeWrites':False}
(O/'CAS.five-bounded-PARTIAL-source-relationships.unactivated-transport-proposal.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print({'relationships':len(rows),'appendOnlyCarrierOperations':out['carrierAppendOperations'],'operativeSourceGrant':False})
