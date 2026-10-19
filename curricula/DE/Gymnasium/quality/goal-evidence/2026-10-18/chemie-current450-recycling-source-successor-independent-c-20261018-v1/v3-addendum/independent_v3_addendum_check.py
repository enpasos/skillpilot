import json, hashlib, copy
from pathlib import Path
from datetime import datetime,timezone

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
FIRST=BASE/'chemie-current450-recycling-source-successor-independent-c-20261018-v1'
AUTHOR=BASE/'chemie-current450-recycling-MV-partial-author-20261018-v3'
V2=BASE/'chemie-current450-recycling-atomicity-source-author-20261018-v2'
OUT=FIRST/'v3-addendum'
OUT.mkdir(exist_ok=True)
used={};checks=[]
def pin(p):
    p=Path(p);b=p.read_bytes();x={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)};used[str(p)]=x;return x
def read(p):pin(p);return json.loads(Path(p).read_text())
def ck(label,good,detail=None):
    checks.append({'check':label,'pass':bool(good),'detail':detail})
def dump(name,obj):
    f=OUT/name;f.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');json.loads(f.read_text())
def at(o,path):
    for k in path.strip('/').split('/') if path else []:o=o[int(k)] if isinstance(o,list) else o[k]
    return o
def sem(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def changes(a,b,p=''):
    if type(a)!=type(b):return[p]
    if isinstance(a,dict):return [q for k in a.keys()|b.keys() for q in (changes(a[k],b[k],p+'/'+k) if k in a and k in b else [p+'/'+k])]
    if isinstance(a,list):
        if len(a)!=len(b):return[p]
        return[q for i,(x,y) in enumerate(zip(a,b)) for q in changes(x,y,p+'/'+str(i))]
    return[] if a==b else[p]
common={'role':'INDEPENDENT_INFORMED_REVIEWER_C_V3_ADDITIVE_CHECK','active':False,'reviewAuthority':'ai_candidate','humanApproval':False,'nativeDClaim':False,'nativeVClaim':False,'M7Claim':False,'assessmentReleaseClaim':False,'actualLearnerPerformanceRecorded':False}

firstseal=read(FIRST/'SEAL.independent-c.json')
firstpin=pin(FIRST/'SEAL.independent-c.json')
ck('Original FIRST seal is exact44d90d018a version',firstpin['sha256']=='44d90d018ab959e74941f384231f07a412b3d486d8b3f2c87160cc097b5892e3')
for x in firstseal['outputPins']:ck('FIRST original output unchanged '+x['path'],pin(x['path'])==x)
inputs=read(AUTHOR/'INPUTS.actual-pins.json')
for x in inputs['inputs']:ck('V3 actual input pin '+x['path'],pin(x['path'])==x)
authorseal=read(AUTHOR/'SEAL.author-MV-partial-restoration.pending-independent-review.json')
for x in authorseal['outputs']:ck('V3 author sealed output '+x['path'],pin(x['path'])==x)
candidate=read(AUTHOR/'AUTHOR.one-existing-partial-edge-restoration.CAS.pending.json')
ops=candidate['operations'];ck('Exactly seven overlay operations',len(ops)==7)
documents={o['targetPath']:read(o['targetPath']) for o in ops}
after=copy.deepcopy(documents)
ck('Only two V2 candidate documents are overlay targets',set(documents)=={str(V2/'operations/source-whole-array-and-clause.exact-CAS.pending.json'),str(V2/'AUTHOR.all-direct-members-of-eleven-unions.pending.json')})
for i,o in enumerate(ops):
    ck('Operation original file hash '+str(i),pin(o['targetPath'])['sha256']==o['targetFileSHA256'])
    obj=after[o['targetPath']];value=at(obj,o['jsonPointer'])
    if o['operation']=='append_exact_absent_record':
        ck('Operation append precondition '+str(i),len(value)==o['beforeArrayLength'] and sem(value)==o['beforeArraySHA256'] and o['record'] not in value and o['insertIndex']==len(value))
        value.insert(o['insertIndex'],copy.deepcopy(o['record']))
    elif o['operation']=='replace_exact_value':
        ck('Operation exact before '+str(i),value==o['before'])
        par,key=o['jsonPointer'].rsplit('/',1);parent=at(obj,par);parent[int(key) if isinstance(parent,list) else key]=copy.deepcopy(o['after'])
    else:raise RuntimeError(o['operation'])

sp=str(V2/'operations/source-whole-array-and-clause.exact-CAS.pending.json');mp=str(V2/'AUTHOR.all-direct-members-of-eleven-unions.pending.json')
s0,s=documents[sp],after[sp];m0,m=documents[mp],after[mp]
sid='mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-galvanische-elemente-009-cf5ca0c7';gid='b6327e98-8ab9-5d7f-b826-4023bc1a56a7'
source=read('curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_CHEMIE_SEKII_RAHMENPLAN_ERPROBUNGSFASSUNG_2022.source-extraction.json')
canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
ck('Whole source exactly matches current MV96 body',candidate['wholeSourceGoal']==source['sourceGoals'][96])
ck('Whole b632 exactly matches current canonical30 body',candidate['wholeCurrentClusterGoal']==canonical['goals'][30])
oldmapping=read('curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json')['mappings'][438]
restored=next(r for r in s['operations'][4]['after'] if r['legacyGoalId']==sid and r['canonicalGoalId']==gid)
ck('Restoration is exact old partial edge without reclassification',restored==oldmapping and restored['matchType']=='partial')
ck('Actual native MV after array grows570to571',len(s0['operations'][4]['after'])==570 and len(s['operations'][4]['after'])==571)
ck('Only appended edge changes native MV mapping after array',s['operations'][4]['after'][:-1]==s0['operations'][4]['after'] and s['operations'][4]['after'][-1]==oldmapping)
u=s['wholeChangedUnions'][3]
ck('Native after and whole-union direct alias exactly agree',[r for r in s['operations'][4]['after'] if r['legacyGoalId']==sid]==u['afterWholeDirectUnion'])
ck('Native after and whole-decision alias exactly agree',s['operations'][5]['after'][96]==u['afterWholeDecision'])
ck('Whole-union summary reason and actual after rationale agree',u['reasonDe']==u['afterWholeDecision']['rationale'])
ck('Canonical ID list retains f9e6,f54b and exact partial b632',u['afterWholeDecision']['canonicalGoalIds']==['f9e6d689-6e59-59a4-9f21-8c2d44413244','f54b2c33-11f1-571f-aa1c-cf969cc141c4',gid])
bp=u['afterWholeDecision']['boundedPartialContribution']
ck('Partial qualification refuses whole-goal and whole-source credit',bp['canonicalGoalId']==gid and bp['matchType']=='partial' and bp['wholeSourceCompletionClaim'] is False and bp['wholeGoalCoverageClaim'] is False)
ck('Member14 is same relation and keeps exact original row',m['memberDecisions'][14]['inventoryIndex']==32 and m['memberDecisions'][14]['canonicalGoalId']==gid and m['memberDecisions'][14]['before']==oldmapping and m['memberDecisions'][14]['decision']=='keep_existing_bounded_partial_contribution')
ck('Member14 reason is exactly bounded reason in decision alias',m['memberDecisions'][14]['reasonDe']==bp['contributionDe']==candidate['exactReasonDe'])
ck('Other96 complete member objects byte-semantically equal',len(m['memberDecisions'])==97 and m['memberDecisions'][:14]==m0['memberDecisions'][:14] and m['memberDecisions'][15:]==m0['memberDecisions'][15:])
ck('Proposed false direct removals count78 in actual members',sum(x['decision']=='remove_false_direct_contribution_only' for x in m['memberDecisions'])==m['removedDirectEdgeCount']==78)
orig_deleted={(x['sourceGoalId'],x['canonicalGoalId']) for x in m0['memberDecisions'] if x['decision']=='remove_false_direct_contribution_only'}
new_deleted={(x['sourceGoalId'],x['canonicalGoalId']) for x in m['memberDecisions'] if x['decision']=='remove_false_direct_contribution_only'}
ck('Exactly disputed old partial edge removed from deletion proposal',orig_deleted-new_deleted=={(sid,gid)} and not new_deleted-orig_deleted and len(new_deleted)==78)
ck('All other10 whole union bodies exact',s['wholeChangedUnions'][:3]==s0['wholeChangedUnions'][:3] and s['wholeChangedUnions'][4:]==s0['wholeChangedUnions'][4:])
ck('All whole source bodies and source corrections unchanged',s['sourceObjectSuccessors']==s0['sourceObjectSuccessors'] and all(a['sourceWholeObjects']==b['sourceWholeObjects'] for a,b in zip(s['wholeChangedUnions'],s0['wholeChangedUnions'])))
ck('All operation before bodies unchanged',all(a['before']==b['before'] for a,b in zip(s['operations'],s0['operations'])))
ck('All other source operations exact except MV after aliases',s['operations'][:4]==s0['operations'][:4] and s['operations'][6:]==s0['operations'][6:])
ck('Inherited V1 source operations preserved',s['inheritedV1DisjointOperations']==s0['inheritedV1DisjointOperations'])
allowed={sp:['/operations/4/after','/operations/5/after/96','/wholeChangedUnions/3/afterWholeDecision','/wholeChangedUnions/3/afterWholeDirectUnion','/wholeChangedUnions/3/reasonDe'],mp:['/memberDecisions/14','/removedDirectEdgeCount']}
deltas=[]
for path in documents:
    changed=changes(documents[path],after[path]);deltas.append({'path':path,'changedPointers':changed,'actualInMemoryAfterSemanticSHA256':sem(after[path])})
    ck('No overlay delta beyond seven allowed locations '+path,all(any(x==a or x.startswith(a+'/') for a in allowed[path]) for x in changed),changed)

firstinputs=read(FIRST/'INPUTS.exact-actually-checked-pins.independent-c.json')
protected=[x for x in firstinputs['pins'] if x['path'].startswith(str(V2)+'/')]
ck('All original V2 input artifacts incl8clauses,materials,profiles,views,SN-HOLDs untouched',all(pin(x['path'])==x for x in protected),{'count':len(protected)})
sn=read(V2/'AUTHOR.three-remaining-SN-source-HOLDs.pending.json')
ck('Three exact remaining SN HOLD identities still103108114',sorted(x['inventoryIndex'] for x in sn['holds'])==[103,108,114])
ck('FIRST scientific judgement bytes and REVISE retained',pin(FIRST/'REVIEW.component-decisions.independent-c.json')==next(x for x in firstseal['outputPins'] if x['path'].endswith('/REVIEW.component-decisions.independent-c.json')))
ck('Target V2 disk files remain original after in-memory execution',all(pin(o['targetPath'])['sha256']==o['targetFileSHA256'] for o in ops))

if not all(x['pass'] for x in checks):raise RuntimeError(json.dumps([x for x in checks if not x['pass']],ensure_ascii=False))
dump('CHECKS.actual-independent-in-memory-CAS.json',{**common,'operationsActuallyExecuted':7,'checks':checks,'passed':True,'deltaSummary':deltas,'normalFilesWritten':0,'FIRSTFilesModified':False})
dump('REVIEW.bounded-MV-partial-addendum.independent-c.json',{**common,'decision':'accept_exact_V3_one-edge_restoration_overlay','inputAuthorOverlay':str(AUTHOR/'AUTHOR.one-existing-partial-edge-restoration.CAS.pending.json'),'FIRSTV2DecisionUnchanged':'revise_one_partial_edge_with_three_SN_HOLDs','scientificReasonDe':'Der ganze unveränderte aktuelle b632-Körper enthält ausdrücklich Bewertungskriterien erkennen und Pro-/Kontra-Argumente abwägen. Diese begründete Gegenüberstellung ist ein realer methodischer Teil des unveränderten MV-Operators diskutieren über Umweltproblematik, Rohstoffgewinnung und Recycling elektrochemischer Spannungsquellen. Die ursprüngliche partial-Kante trägt genau diesen begrenzten Anteil. V3 bewahrt sie exakt und schließt selbständige Recherche, Zitation, Quellenvalidierung und Medienpräsentation als hieraus abgeleitete amtliche ganze Pflichten ausdrücklich aus. Dadurch ist der konkrete V2-REVISE-Punkt behoben, ohne das damalige unabhängige FIRST zu ändern oder Volldeckung des ganzen breiteren Clusters zu behaupten.','scope':{'restoredExactExistingPartialEdges':1,'allOther96MemberDecisionsUnchanged':True,'falseDirectDeletionProposals':78,'eightEarlierAcceptedClauseBodiesUnchanged':[5,6,16,32,61,87,92,136],'remainingSNHoldInventoryIndices':[103,108,114],'nativeMappingWholeUnionAndDecisionAliasesExact':True,'originalFIRSTSealSHA256':firstpin['sha256']},'noAdditionalScientificVoteForOtherComponents':True,'noBlanket6134SourceApproval':True,'noNewPrimaryPageReadRequired':'The same primary source and current whole cluster bodies are unchanged and bound to the completed FIRST review; only this already demonstrated partial relation is rechecked.','peerReviewBodiesRead':False})
dump('INPUTS.exact-addendum-pins.json',{**common,'pins':sorted(used.values(),key=lambda x:x['path']),'FIRSTSealPin':firstpin})
(OUT/'README.md').write_text('# V3-Addendum zur unabhängigen Prüfung C\n\n**ACCEPT für genau das additive MV32→b632-Overlay.** Alle sieben Operationen wurden unabhängig im Speicher ausgeführt und ihre exakten CAS-Vorbedingungen geprüft. Die alte partial-Kante bleibt unverändert; Native-Array, Whole-Union-/Entscheidungsaliase und Member14 stimmen überein. Die Begründung bleibt auf Bewertungskriterien und Pro-/Kontra-Diskutieren beschränkt.\n\nDie übrigen96Member,78begründeten Löschungen,acht bereits bestätigten Klauselkörper und drei SN-HOLDs103/108/114 bleiben unverändert. Der ursprüngliche V2-REVISE und alle FIRST-Dateien bleiben bytegenau erhalten. Keine Normalaktivierung, neue Gesamtquellenfreigabe, nativeD/V-, M7-, Assessment- oder Humanfreigabe.\n\n`CHECKS.actual-independent-in-memory-CAS.json` enthält die tatsächlich ausgeführten begrenzten Prüfungen; `REVIEW.bounded-MV-partial-addendum.independent-c.json` das eng begrenzte Fachurteil; `SEAL.independent-c-v3-addendum.json` die eigenen Outputpins.\n')
helper=OUT/'independent_v3_addendum_check.py';helper.write_bytes(Path(__file__).read_bytes())
outputs=[pin(x) for x in sorted(OUT.iterdir()) if x.is_file() and x.name!='SEAL.independent-c-v3-addendum.json']
dump('SEAL.independent-c-v3-addendum.json',{**common,'sealedUTC':datetime.now(timezone.utc).isoformat(),'decision':'accept_exact_V3_one-edge_restoration_overlay','FIRSTSealPin':firstpin,'operationsActuallyExecuted':7,'boundedChecksPassed':len(checks),'falseDirectDeletionProposals':78,'remainingSNHolds':[103,108,114],'outputPins':outputs,'normalFilesWritten':0,'FIRSTFilesModified':False,'globalChecksRun':False})
print(json.dumps({'decision':'accept','operationsExecuted':7,'boundedChecksPassed':len(checks),'FIRSTSealSHA256':firstpin['sha256'],'addendumSealSHA256':pin(OUT/'SEAL.independent-c-v3-addendum.json')['sha256'],'out':str(OUT)},ensure_ascii=False,indent=2))
