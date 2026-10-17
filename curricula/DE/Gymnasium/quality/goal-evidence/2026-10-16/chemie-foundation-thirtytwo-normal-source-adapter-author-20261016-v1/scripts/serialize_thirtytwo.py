# SPDX-License-Identifier: Apache-2.0
"""Bounded Foundation source serializer; no review, active write, host or gate."""
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict, Counter
from urllib.parse import urlparse
import copy, hashlib, json

R=Path.cwd()
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O=E/'chemie-foundation-thirtytwo-normal-source-adapter-author-20261016-v1'
T=R/'tmp/chemie-m7-resumed-20261016/foundation-thirtytwo-normal-source-adapter'
P=R/'tmp/chemie-m7-resumed-20261016/foundation-normal-source-identity-author-plan/PROPOSAL.twentysix-current-source-identity-operations.before-actual-adapter.json'
I=R/'tmp/chemie-m7-resumed-20261016/foundation-normal-source-identity-independent-review'
S=E/'chemie-foundation-fourteen-informed-findings-whole-author-successor-20261016-v2/sources/FOUNDATION.whole-source-bodies-on-final574.with-fourteen-findings-repairs.author.json'
B=E/'chemie-foundation-source-operator-whole-remediation-author-successor-20261016-v1/sources/TWENTYSIX.whole-source-operator-successors.author.json'
NOW=datetime.now(timezone.utc).isoformat()
def read(p): return json.loads(Path(p).read_text())
def sha(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes()
 return {'path':p.relative_to(R).as_posix(),'sha256':sha(b),'bytes':len(b)}
def objpin(v):return sha(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def checkpin(x):
 p=R/x['path'];actual=pin(p)
 assert all(actual[k]==v for k,v in x.items() if k in actual),(x,actual)
 return p
def put(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert not O.exists(),'Never overwrite an existing finite author root'
assert pin(P)['sha256']=='sha256:858578ed7f89dfd30184acb50ab2c0422401f7a26ab5bc64ad458891c3d31593'
assert pin(I/'MANIFEST.json')['sha256']=='sha256:90435e63640f75831f569921dd90adc6ab1ca1f8ca26dc6f488a76dfac7fef80'
assert pin(S)['sha256']=='sha256:683e3037c320e70d2c03aa6cca59745e40d48062a53adb39a4526ef42cb8787b'
assert pin(B)['sha256']=='sha256:74d53ab034b2864ab1f897153982b0b18d3c7ffca3bcb0f28a77ff95db507ec4'
proposal=read(P);source=read(S);before=read(B);manifest=read(I/'MANIFEST.json')
for f in manifest['files']:checkpin(f)
assert {x['id'] for x in read(I/'FINDINGS.current-normal-translation.json')['findings']}=={'ID-F01','ID-F02','ID-F03','ID-F04'}
identity={x['currentSourceGoalId']:x for x in read(I/'REVIEW32.cell-identity-and-source-checks.json')['checks']}
checkpin(proposal['wholeCurrentFoundationSource']);checkpin(source['commonCanonicalBasis'])
canonical=read(R/source['commonCanonicalBasis']['path']);targets={g['id'] for g in canonical['goals']}
current_by={x['sourceGoalId']:x for x in source['sourceRows']};before_by={x['sourceGoalId']:x for x in before['sourceRows']}
assert len(proposal['rows'])==26 and len(identity)==32
groups=defaultdict(list);originals={};documents={}
# All whole-object and byte-pin preconditions are checked before creating outputs.
for row in proposal['rows']:
 old=row['oldCurrentSourceGoalId'];er=checkpin(row['beforeExtraction']);mr=checkpin(row['beforeMapping'])
 pair=(row['beforeExtraction']['path'],row['beforeMapping']['path'])
 if pair not in originals:originals[pair]=(read(er),read(mr))
 e,m=originals[pair];b=before_by[old]['before'];c=current_by[old]['wholeFinalSourceAndAllocationBody']
 assert row['beforeExtraction']==b['sourceExtraction'] and row['beforeMapping']==b['mappingFile']
 assert row['wholeBeforeSourceGoal']==b['sourceGoal'] and row['wholeBeforeDecision']==b['sourceDecision'] and row['wholeBeforeLegacyRows']==b['allMappings']
 assert [g for g in e['sourceGoals'] if g['id']==old]==[b['sourceGoal']]
 assert [d for d in m['decisions'] if d['sourceGoalId']==old]==[b['sourceDecision']]
 assert [a for a in m['mappings'] if a['legacyGoalId']==old]==b['allMappings']
 assert [p for p in e['passages'] if p['id']==b['wholePassage']['id']]==[b['wholePassage']]
 assert m['sourceLandscapeId']==e['sourceLandscapeId'] and m['targetLandscapeId']==canonical['landscapeId']
 assert row['sharedWholePassageProposal']==c['wholePassageCandidate']
 assert len(c['sourceCells'])==len(row['normalGoalProposals'])
 docs=e.get('sourceDocuments') or [e['sourceDocument']]
 for n,cell in zip(row['normalGoalProposals'],c['sourceCells']):
  g=n['wholeNormalSourceGoalProposal'];cg=copy.deepcopy(cell['wholeSourceGoalCandidate']);cg['id']=n['currentSourceGoalId']
  assert g==cg and g['id'] in identity and identity[g['id']]['wholeBodyEqualExceptApprovedIdentity']
  assert objpin(g)==identity[g['id']]['wholeNormalProposalSha256']
  assert n['explicitPartialCanonicalContributions']==[a['goalId'] for a in cell['allocations']]
  assert n['explicitPartialCanonicalContributions']==identity[g['id']]['explicitPartialContributions']
  assert set(n['explicitPartialCanonicalContributions'])<=targets
  doc=cell['sourceRef']['document'];matches=[d for d in docs if d['key']==doc['key']]
  assert matches==[doc],('HOLD ambiguous or missing exact document registry',old,doc,matches)
  u=urlparse(doc['url']);assert doc['official'] is True and u.scheme=='https' and not u.username and not u.password
  documents[doc['path']]=pin(R/doc['path'])
 groups[pair].append(row)
assert len(groups)==9
assert len({x for pair in groups for x in pair})==18
# Portable retained didactic proposal and informed review outputs only; no PDF/fulltext/log copy.
O.mkdir(parents=True);retained=[]
for origin in [P,I/'MANIFEST.json']+[R/x['path'] for x in manifest['files']]:
 category='identity-author-proposal' if origin==P else 'identity-informed-review'
 out=O/'retained-inputs'/category/origin.name;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(origin.read_bytes())
 assert pin(out)['sha256']==pin(origin)['sha256']
 retained.append({'originalOriginOnly':pin(origin),'portableSelectedInput':pin(out),'byteExact':True,'role':'Finite source-identity translation support only, no new science or whole-source approval'})
PP=O/'retained-inputs/identity-author-proposal'/P.name
IR=O/'retained-inputs/identity-informed-review/REVIEW32.cell-identity-and-source-checks.json'
IF=O/'retained-inputs/identity-informed-review/FINDINGS.current-normal-translation.json'
put(O/'RETAINED.finite-didactic-inputs.portable-origin-trace.json',{'role':'Origin paths are history only; operative selected paths are repository portable retainedInput pins','retained':retained,'privatePrimaryFulltextsCopied':0,'privateLogsCopied':0,'humanApproval':False,'humanTrial':False})
results=[];operations=[];passage_operations=[];preserved=[];checks=[];aliases=[]
annotation_ids={
 'hb-chemistry-sekii:3.2-E-REDOX','hb-chemistry-sekii:3.2-E-SAEURE-BASE',
 'mv-chemistry-sekii:q-saeure-base-loeslichkeit',
 'sn-chemistry-seki:sn-ch-klassenstufe-8-lb5','sn-chemistry-seki:sn-ch-klassenstufe-9-lb1',
 'sn-chemistry-sekii:sn-ch-jahrgangsstufe-11-grundkurs-lb4','sn-chemistry-sekii:sn-ch-jahrgangsstufe-11-leistungskurs-lb5'}
for ordinal,(pair,rows) in enumerate(groups.items(),1):
 old_e,old_m=originals[pair];e=copy.deepcopy(old_e);m=copy.deepcopy(old_m);changed={r['oldCurrentSourceGoalId'] for r in rows}
 replacement_goals={};replacement_decisions={};replacement_edges={};new_ids=[];retired_ids=[];passages={}
 for r in rows:
  old=r['oldCurrentSourceGoalId'];ps=r['normalGoalProposals'];replacement_goals[old]=[];replacement_decisions[old]=[];replacement_edges[old]=[]
  if len(ps)>1:retired_ids.append(old)
  for n in ps:
   g=copy.deepcopy(n['wholeNormalSourceGoalProposal']);ids=n['explicitPartialCanonicalContributions']
   if len(ps)==1:assert g['id']==old
   else:assert g['id'] not in {x['id'] for x in old_e['sourceGoals']};new_ids.append(g['id'])
   replacement_goals[old].append(g)
   d={'sourceGoalId':g['id'],'topicCode':g['topicCode'],'sourceSpan':copy.deepcopy(g['sourceSpan']),'decision':'mapped','canonicalGoalIds':copy.deepcopy(ids),'matchType':'partial','rationale':'Informierter technischer Autor-Kandidat: vollständiger korrigierter Foundation-Quellenzellkörper und die ausdrücklich zugewiesenen partiellen Beiträge werden mechanisch übersetzt. Die separat erhaltene Identitätsnachprüfung unterstützt die ID-Wahl; dies ist keine neue fachliche, vollständige Source-/Kurs- oder kanonische Gesamtziel-Freigabe. Unveränderte Nachbarzellen behalten ihren bisherigen Nachweis.','reviewedAt':NOW,'reviewer':'/root/chemie_conductometry_independent_visual_20261016; bounded technical source adapter author','reviewStatus':'informed-author-candidate','reviewAuthority':'ai_candidate','boundedSourceEvidence':{'currentWholeFoundationSource':pin(S),'portableIdentityAuthorProposal':pin(PP),'portableInformedIdentityCheck':pin(IR),'portableIdentityFindings':pin(IF),'historicalBeforeSourceGoalId':old,'historicalSourceIdIsCurrentAlias':False,'wholeSourceUnionApproved':False,'wholeCourseApproved':False,'newIndependentScienceVote':False,'HumanApproval':False,'HumanTrial':False}}
   replacement_decisions[old].append(d)
   replacement_edges[old]+=[{'legacyGoalId':g['id'],'canonicalGoalId':target,'matchType':'partial','reviewDecisionId':g['id']} for target in ids]
  p=r['sharedWholePassageProposal'];pid=p['id']
  if pid in passages:assert passages[pid]==p,('HOLD inconsistent whole passage candidates',pid)
  else:passages[pid]=copy.deepcopy(p)
  operations.append({'originalExtraction':pin(R/pair[0]),'originalMapping':pin(R/pair[1]),'historicalBeforeSourceGoalId':old,'identityOperation':r['identityOperationProposed'],'wholeBeforeSourceGoal':r['wholeBeforeSourceGoal'],'wholeAfterSourceGoals':replacement_goals[old],'wholeBeforeDecision':r['wholeBeforeDecision'],'wholeAfterDecisions':replacement_decisions[old],'wholeBeforeLegacyEdges':r['wholeBeforeLegacyRows'],'wholeAfterLegacyEdges':replacement_edges[old],'sourceCellsHaveExactFrozenBodiesExceptApprovedID':True,'wholeSourceUnionApproved':False})
 e['sourceGoals']=[n for g in old_e['sourceGoals'] for n in replacement_goals.get(g['id'],[g])]
 m['decisions']=[n for d in old_m['decisions'] for n in replacement_decisions.get(d['sourceGoalId'],[d])]
 seen=set();edges=[]
 for edge in old_m['mappings']:
  old=edge['legacyGoalId']
  if old not in changed:edges.append(edge)
  elif old not in seen:edges+=replacement_edges[old];seen.add(old)
 assert seen==changed
 m['mappings']=edges
 # Rebuild each touched whole passage membership from the complete surviving sourceGoal inventory.
 for pid,p in passages.items():
  before_p=next(x for x in old_e['passages'] if x['id']==pid)
  if pid=='he-chem-sekii:E.2':p['sourcePath']=e['sourceDocument']['path'];assert p['sourcePath'].endswith('/kcgo_chemie_21.04.2026.pdf')
  if pid in annotation_ids:
   p['text']='Redaktionelle Zusammenfassung, kein wörtlicher Quellenauszug.\n\n'+p['text']
   p.setdefault('metadata',{})['rawTextOrigin']={'kind':'authored-legacy-summary','isVerbatimOfficialSourceQuote':False,'textAndRawTextAuthority':'Redaktionelle Zusammenfassung, kein wörtlicher Quellenauszug; keine normativen Operatoren aus der Zusammenfassung ableiten. Amtliche Zellfragmente bleiben in den ausgewählten vollständigen SourceGoals getrennt erhalten.','originalWholeExtraction':pin(R/pair[0]),'originalPassageId':pid,'originalWholePassageObjectSha256':objpin(before_p),'originalRawTextOrTextObjectSha256':objpin(before_p.get('rawText',before_p.get('text'))),'portableFinding':pin(IF),'findingId':'ID-F04'}
  p['sourceGoalIds']=list(dict.fromkeys(g['id'] for g in e['sourceGoals'] if g['passageId']==pid))
  assert p['sourceGoalIds']
  if pid=='hb-chemistry-sekii:3.3-1-2-PROTOLYSE':
   assert {k:v for k,v in p.items() if k!='sourceGoalIds'}=={k:v for k,v in next(r['sharedWholePassageProposal'] for r in rows if r['sharedWholePassageProposal']['id']==pid).items() if k!='sourceGoalIds'}
   expected={'hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-035-e7b08724','hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-038-f36b6ab8','hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-039-ce8ebe81','hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-040-306e5739'}
   assert expected<=set(p['sourceGoalIds']) and len(p['sourceGoalIds'])==11
  passage_operations.append({'extractionBefore':pin(R/pair[0]),'passageId':pid,'wholeBefore':before_p,'wholeFinalFrozenAuthorPassageProposal':next(r['sharedWholePassageProposal'] for r in rows if r['sharedWholePassageProposal']['id']==pid),'wholeAfter':p,'membershipReconstructedFromAllSurvivingSourceGoals':True,'identityFindingDisposition':[x for x,scope in [('ID-F01',pid.startswith('hb-chemistry-sekii:3.2-E-')),('ID-F02',pid=='hb-chemistry-sekii:3.3-1-2-PROTOLYSE'),('ID-F03',pid=='he-chem-sekii:E.2'),('ID-F04',pid in annotation_ids)] if scope]})
 e['passages']=[passages.get(p['id'],p) for p in old_e['passages']]
 # Mechanical summary counts use existing authoring meaning (decision-level exact/partial), if present.
 if 'summary' in m:
  assert len(e['sourceGoals'])==len(old_e['sourceGoals'])
  ds={d['sourceGoalId']:d for d in m['decisions']};es=defaultdict(list)
  for a in m['mappings']:es[a['legacyGoalId']].append(a)
  exact=sum(bool(es[id]) and all(a['matchType']=='exact' for a in es[id]) for id in ds)
  m['summary']=dict(m['summary'],sourceGoals=len(e['sourceGoals']),mappedSourceGoals=sum(d['decision']=='mapped' for d in ds.values()),needsCanonicalGoal=sum(d['decision']!='mapped' for d in ds.values()),exactMappings=exact,partialMappings=len(ds)-exact)
 # Strict preservation of all unselected source, decision, edge, passage and document/header objects.
 for key in old_e:
  if key not in ['sourceGoals','passages']:assert e[key]==old_e[key]
 for key in old_m:
  if key not in ['mappings','decisions','summary']:assert m[key]==old_m[key]
 assert [g for g in e['sourceGoals'] if g['id'] not in new_ids and g['id'] not in changed]==[g for g in old_e['sourceGoals'] if g['id'] not in changed]
 assert [d for d in m['decisions'] if d['sourceGoalId'] not in new_ids and d['sourceGoalId'] not in changed]==[d for d in old_m['decisions'] if d['sourceGoalId'] not in changed]
 assert [a for a in m['mappings'] if a['legacyGoalId'] not in new_ids and a['legacyGoalId'] not in changed]==[a for a in old_m['mappings'] if a['legacyGoalId'] not in changed]
 assert [p for p in e['passages'] if p['id'] not in passages]==[p for p in old_e['passages'] if p['id'] not in passages]
 gids={g['id'] for g in e['sourceGoals']};pids={p['id'] for p in e['passages']};dids=Counter(d['sourceGoalId'] for d in m['decisions'])
 assert len(gids)==len(e['sourceGoals']) and len(pids)==len(e['passages'])
 assert set(dids)==gids and all(x==1 for x in dids.values()) and not gids.intersection(retired_ids)
 es=defaultdict(set)
 for a in m['mappings']:
  assert a['legacyGoalId'] in gids and a['canonicalGoalId'] in targets and a['reviewDecisionId']==a['legacyGoalId'];es[a['legacyGoalId']].add(a['canonicalGoalId'])
 assert len(m['mappings'])==len({(a['legacyGoalId'],a['canonicalGoalId']) for a in m['mappings']})
 for d in m['decisions']:assert set(d.get('canonicalGoalIds',[]))==es[d['sourceGoalId']] and d['reviewer'] and d['reviewedAt'] and d['rationale']
 assert all(g['passageId'] in pids for g in e['sourceGoals'])
 for p in e['passages']:
  actual=[g['id'] for g in e['sourceGoals'] if g['passageId']==p['id']]
  assert len(p['sourceGoalIds'])==len(set(p['sourceGoalIds'])) and set(p['sourceGoalIds'])==set(actual),('HOLD baseline or successor membership',pair[0],p['id'])
 label=f'{e["jurisdiction"]}-{e["stage"]}'
 ep=O/'sources'/f'{label}.whole-normal-source-extraction.author.json';mp=O/'mappings'/f'{label}.whole-normal-mapping.author.review.json';put(ep,e);put(mp,m)
 selected=[n['currentSourceGoalId'] for r in rows for n in r['normalGoalProposals']]
 results.append({'jurisdiction':e['jurisdiction'],'stage':e['stage'],'normalExtractionAlias':m['sourceExtractionPath'],'baselineExtraction':pin(R/pair[0]),'normalMappingAlias':pair[1],'completeExtraction':pin(ep),'completeMapping':pin(mp),'sourceGoals':len(e['sourceGoals']),'decisions':len(m['decisions']),'legacyEdges':len(m['mappings']),'selectedCurrentSourceGoalIds':selected,'retiredBroadSourceGoalIds':retired_ids,'newOfficialSourceGoalIds':new_ids,'unchangedSourceDocumentRegistry':True,'wholeSourceUnionAccepted':False})
 aliases += [{'normalHostAlias':m['sourceExtractionPath'],'physicalRepositorySource':pin(ep)},{'normalHostAlias':pair[1],'physicalRepositorySource':pin(mp)}]
 preserved.append({'baselineExtraction':pin(R/pair[0]),'baselineMapping':pin(R/pair[1]),'untouchedSourceGoals':[{'id':g['id'],'objectSha256':objpin(g)} for g in old_e['sourceGoals'] if g['id'] not in changed],'untouchedDecisions':[{'sourceGoalId':d['sourceGoalId'],'objectSha256':objpin(d)} for d in old_m['decisions'] if d['sourceGoalId'] not in changed],'untouchedLegacyEdgesArraySha256':objpin([a for a in old_m['mappings'] if a['legacyGoalId'] not in changed]),'untouchedPassages':[{'id':p['id'],'objectSha256':objpin(p)} for p in old_e['passages'] if p['id'] not in passages],'sourceHeaderObjectSha256':objpin({k:v for k,v in old_e.items() if k not in ['sourceGoals','passages']}),'mappingHeaderObjectSha256':objpin({k:v for k,v in old_m.items() if k not in ['mappings','decisions','summary']}),'allUnselectedWholeObjectsExactlyEqual':True})
 checks.append({'jurisdiction':e['jurisdiction'],'stage':e['stage'],'strictInputPinsAndBeforeBodies':'PASS','allUnselectedWholeObjects':'PASS','completeCurrentMembershipForEveryPassage':'PASS','oneDecisionPerSourceGoal':'PASS','legacyEdgeSetsEqualDecisionTargets':'PASS','allTargetAndPassageReferences':'PASS','selectedPartialEdges':'PASS','sourceDocumentRegistryUnchanged':'PASS'})
assert sum(len(x['selectedCurrentSourceGoalIds']) for x in results)==32
assert sum(len(x['newOfficialSourceGoalIds']) for x in results)==11 and sum(len(x['retiredBroadSourceGoalIds']) for x in results)==5
assert len(passage_operations)==15
put(O/'OPERATIONS.twentysix-before-thirtytwo-after-source-and-mapping.author.json',{'role':'Mechanical bounded informed author operations, not new science','rows':operations,'wholeSourceUnionApproved':False})
put(O/'OPERATIONS.fifteen-whole-passages-and-four-finding-repairs.author.json',{'role':'Whole passage operations with exact before/frozen/after context','rows':passage_operations,'findingsAddressedTechnically':['ID-F01','ID-F02','ID-F03','ID-F04'],'independentActualSerializedBytesReviewPending':True})
put(O/'PRESERVED.all-unselected-whole-objects-and-original-eighteen-pins.json',{'hashMethod':'SHA256 of UTF8 JSON sort_keys=True ensure_ascii=False separators comma colon; exact whole object equality before hashing','rows':preserved,'originalDocumentsReadNotCopied':list(documents.values())})
put(O/'CHECKS.actual-nine-pairs-structural-identity-membership.json',{'checks':checks,'allPassed':True,'selectedCurrentCells':32,'stableExistingIDs':21,'oldBroadCurrentIDsRemoved':5,'newWholeOfficialCells':11,'wholePassages':15,'newScientificReviewVotes':0,'AtlasBuildCalls':0,'Native':0,'Central':0,'HumanApproval':False,'HumanTrial':False})
put(O/'NEUTRAL.nine-complete-source-mapping-pairs.thirtytwo-current-cells.selector.json',{'schemaVersion':1,'role':'Complete normal-shaped source adapter AUTHOR candidate only; independent actual serialized-byte acceptance required','currentWholeFoundationSource':pin(S),'historicalWholeBeforeInput':pin(B),'portableIdentityProposal':pin(PP),'portableInformedIdentityCheck':pin(IR),'portableIdentityFindings':pin(IF),'retainedInputOriginTrace':pin(O/'RETAINED.finite-didactic-inputs.portable-origin-trace.json'),'canonicalTargetContext':source['commonCanonicalBasis'],'rows':results,'futureIsolatedHostAliases':aliases,'normalMappingPointerMeaning':'Read complete candidate extraction through the explicit aliases above; no active normal tree write or actual host exists.','originalPipelineStatusMeaning':'Historical complete/review status headings remain exact prior bytes as whole JSON values; no new source-course, union or human acceptance is implied.','remainingUncertainties':['Original informed identity/source reviewer must inspect these actual complete serialized bytes, especially four repaired passage findings.','This is only the Foundation32 adapter, not a whole source-course approval or a new D/P/A/M/V record.','RP overlaps with EDTA/Acid must later compose exact operations against the same original normal pins; no last-writer-wins integration.','Joint actual Source projection and page-context comparison remain required before any Native queue.'],'strictCountChanged':False,'HumanApproval':False,'HumanTrial':False,'normalPAMVWritten':0,'Native':0,'Central':0,'activeWrites':0,'GitWrites':0})
print(json.dumps({'root':str(O.relative_to(R)),'rows':[{k:x[k] for k in ['jurisdiction','stage','sourceGoals','decisions','legacyEdges']} for x in results],'files':len([p for p in O.rglob('*') if p.is_file()]),'bytes':sum(p.stat().st_size for p in O.rglob('*') if p.is_file())},ensure_ascii=False,indent=2))
