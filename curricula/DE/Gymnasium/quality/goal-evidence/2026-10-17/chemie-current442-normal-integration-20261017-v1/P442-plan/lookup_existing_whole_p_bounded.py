"""Finite read-only provenance join; only writes its additive report, never P records."""
import json, hashlib, re, collections
from pathlib import Path
B=Path('curricula/DE/Gymnasium/quality/goal-evidence')
D=B/'2026-10-16'
OUT=B/'2026-10-17/chemie-current442-normal-integration-20261017-v1/P442-plan'
RP=OUT/'E0.retained56.actual-current-whole-profile-roster.json'
def sha(b): return hashlib.sha256(b).hexdigest()
def digest(o): return sha(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def ref(p):
 p=Path(p); b=p.read_bytes(); return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def read(p): return json.loads(Path(p).read_text())
def esc(k): return str(k).replace('~','~0').replace('/','~1')
def walk(x,p=''):
 yield p,x
 if isinstance(x,dict):
  for k,v in x.items(): yield from walk(v,p+'/'+esc(k))
 elif isinstance(x,list):
  for i,v in enumerate(x): yield from walk(v,p+'/'+str(i))
def roots(p):
 p=Path(p)
 if p.suffix=='.jsonl': return [('/line/'+str(i),json.loads(l)) for i,l in enumerate(p.read_text().splitlines(),1) if l.strip()]
 return [('',read(p))]
def matching_profiles(p,profile):
 p=Path(p); target=digest(profile); hits=[]
 for lp,x in roots(p):
  for ptr,v in walk(x):
   if isinstance(v,dict) and v.keys()==profile.keys() and digest(v)==target:
    hits.append({**ref(p),'jsonPointer':lp+ptr,'wholeObjectSHA256':target})
 return hits

def scientific_refs(p,gid,namespace):
 p=Path(p);r={**ref(p),'decisionNamespace':namespace}
 if p.suffix=='.md':
  lines=p.read_text().splitlines(); r['matchingLines']=[{'lineOneBased':i,'text':l} for i,l in enumerate(lines,1) if gid in l]
  r['scope']='Existing informed whole-six P/case KEEP in prose; original source and memory sections are separate.'
  return [r]
 xs=roots(p); x=xs[0][1]; hits=[]
 for ptr,v in ((lp+ptr,v) for lp,xroot in xs for ptr,v in walk(xroot)):
  if isinstance(v,dict) and (v.get('goalId')==gid or gid in v):
   vals={k:val for k,val in v.items() if (any(q in k.lower() for q in ['decision','recommendation','supported','positiveevidenceprofile','wholeexistingpcompatibility','profileauthority','evidencelevel','maximumclaimscope','rawprofilescientificsha']) and (not isinstance(val,(dict,list)) or k in ['positiveEvidenceProfile','wholeExistingPCompatibility']))}
   if gid in v: vals={'goalKeyDecision':v[gid]}
   if vals: hits.append({**r,'jsonPointer':ptr or '/', 'existingDecisionFields':vals})
 if not hits:
  vals={k:v for k,v in x.items() if k in ['decision','decisionScope','wholeProfileDecision','wholeProfileJudgment','claims','decisions','allSevenExactRawProfileDesignsScientificallyAcceptedForAICandidateAdaptation','P373ScientificallySupportedPositiveProfile','retainedPriorScopes','findings','statusDefinitions']}
  hits=[{**r,'jsonPointer':'/','existingDecisionFields':vals}]
 return hits

assert ref(RP)['sha256']=='9aaa547cace99b97a204302fcdca9593e5f5517060a046e1f7fef31e2099be4e'
roster=read(RP)['records']; assert len(roster)==56
C={}
for r in roster:
 p=Path(r['wholeProfile']['path']);assert sha(p.read_bytes())==r['wholeProfile']['sha256']
 row=json.loads(p.read_text().splitlines()[r['wholeProfile']['lineOneBased']-1]);assert row['goalId']==r['goalId'];assert digest(row['profile'])==r['wholeProfile']['wholeObjectSHA256']
 C[r['goalId']]=row
mappings={}
def assign(ids,sources,science,namespace,kind='EXPLICIT_EXISTING_WHOLE_P_DESIGN_SUPPORT',configs=(),note=''):
 for gid in ids:
  mappings[gid]={'sourcePaths':[str(p) for p in sources],'sciencePaths':[str(p) for p in science], 'decisionNamespace':namespace,'provenanceDisposition':kind,'configPaths':[str(p) for p in configs],'scopeNote':note}
def family(s): return [r['goalId'] for r in roster if s in r['currentRecordMetadata']['reviewId']]
def dp(s): return D/s
# Own E0 candidates: exact new silicone successor is not silently rebound to an older ACCEPT.
e560=B/'2026-10-13/chemie-e560-two-child-source-A-M-P-independent-a-20261013-v1/positive/two-independent-reviewed-E0-G0-designs.json'
e560b=B/'2026-10-13/chemie-e560-two-child-source-A-M-P-independent-b-20261013-v1/SCIENCE.source-graph-A-M-P-independent-b.actual.json'
e560author=B/'2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1/positive/two-complete-positive-v2-child-profiles.DEEN.author.json'
assign(family('e560-two-child'),[e560author,e560],[e560,e560b],'A /goals/*/reason; B /positiveDesignDecisions',note='Scientific design judgments only; source whole-cell closure remains separate.')
mappings['a96e9b3d-a02d-54f8-a3d3-318e0ea5180c']['provenanceDisposition']='CURRENT_SUCCESSOR_EXACT_WHOLE_P_ACCEPT_NOT_ESTABLISHED'
mappings['a96e9b3d-a02d-54f8-a3d3-318e0ea5180c']['scopeNote']='Original A accepted profile SHA2b51e516d0adcd7e333b4e72957ded257b6b92b163a992fa391b3c83365a10ae, which differs from current d93941…. Original B says revise_design. Current author metadata explicitly says unreviewed targeted successor. This lookup does not reassess or reject the correction.'
assign(family('p3-genuine'),[dp('chemie-sixteen-remaining-PA-whole-current-author-20261016-v1/profiles/FOUR.whole-current-prospective-P-designs.author.json')],[dp('chemie-nine-current-P4-A5-fresh-independent-science-20261016-v1/FIRSTScience.independent.json')],'PDecisions.scientificDesignDecision=SUPPORT',configs=[dp('chemie-nine-current-P3-A5-genuine-FIRST-normal-bindings-technical-20261016-v1/config/P3.genuine-FIRST.normal.config.json')])
assign(family('rutherford-original'),[dp('chemie-rutherford-two-cases-charge-transfer-ID-author-successor-20261016-v1/ONE.whole-rutherford-profile.current-charge-transfer.author.json')],[dp('chemie-rutherford-charge-transfer-original-independent-informed-followup-20261016-v1/FOLLOWUP.informed-science.json')],'decision=SUPPORT; informed successor only')
B11=dp('chemie-seven-native11-whole-successor-original-independent-B-informed-followup-20261016-v1/SCIENCE.complete-informed-followup-B.json')
P7=dp('chemie-seven-native11-findings-whole-author-successor-20261016-v1/P7.after.complete-profile-author-drafts.json')
assign(family('native11-six-supported'),[P7],[B11],'goals.positiveEvidenceProfile.status=SUPPORTED',configs=[dp('chemie-native11-six-supported-positive-successors-normal-binding-technical-20261016-v1/P6.current-supported.normal.config.json')])
assign(family('d8-targeted'),[dp('chemie-d8-model-observation-boundary-targeted-author-successor-20261016-v1/P7.after.complete-profile-author-drafts.json')],[dp('chemie-d8-targeted-author-successor-original-independent-B-followup-20261016-v1/SCIENCE.complete-original-B-targeted-d8-informed-followup.json')],'decision=SUPPORTED; complete supplied material/profile at E0/G0',note='profileRecommendation=revise is separately defined in this science as a native recommendation, not the final overall material support field.')
assign(family('native15-p4'),[dp('chemie-native15-five-whole-P-findings-targeted-author-successor-20261016-v1/P5.complete-whole-profile-author-successors.json')],[dp('chemie-native15-five-P-successors-fresh-independent-science-20261016-v1/FIRST.science.five-whole-P-successors.record.json')],'decisions.wholeProfileDecision=KEEP')
assign(family('mwg-equilibrium-premise'),[dp('chemie-mwg-equilibrium-premise-targeted-whole-author-successor-20261016-v1/WHOLE.MWG-profile-before-after.targeted-author.json')],[dp('chemie-native15-five-P-successors-fresh-independent-science-20261016-v1/informed-mwg-equilibrium-premise/SCIENCE.INFORMED.whole-MWG-equilibrium-premise-followup.json')],'wholeProfileDecision=KEEP; same-reviewer informed successor',note='Original FIRST REVISE is preserved against the old input, not applied unchanged to this accepted successor.')
# Original laboratory whole-P science plus separate current image compatibility.
LABDIR=B/'2026-10-15/chemie-lab15-current419-original-positive-atomicity-a-20261015-v1'
LABCFG=LABDIR/'P/normal-positive-fifteen.config.json';LABREVIEW=Path(read(LABCFG)['reviewPath']);LABFIRST=LABDIR/'ORIGINAL.substantive-P15-A15.decisions.json'
assign(family('fec-current'),[LABREVIEW],[LABFIRST,dp('chemie-fec-mobile-three-stations-original-independent-V-P-informed-followup-20261016-v1/INFORMED.science.targeted-V-P.record.json')],'original decisions.positiveDesignDecision=KEEP_DESIGN; later targetedPCompatibility only',configs=[LABCFG],note='The image follow-up explicitly adds zero new full-P reviews. Whole-P design reuse comes from original LAB15, if exact profile equality below holds.')
assign(family('f0-current'),[P7],[B11,dp('chemie-f0-mobile-spectrum-original-independent-V-informed-followup-20261016-v1/INFORMED.V.science.audit.json')],'B11 positiveEvidenceProfile.status=SUPPORTED; later image compatibility only',note='Current image follow-up is not a new whole-P vote.')
# Twenty retained unchanged whole bodies: use actual original owner routes, not image-compatibility title.
p20in=dp('chemie-twenty-supported-current-P-image-resource-normal-bindings-technical-20261016-v1/INPUTS.finite-technical-resource-binding-authority-and-CAS.json')
p20=read(p20in)
BCP=B/'2026-10-15'
for origin in p20['originalRecordRoutesAndStatusBoundaries']:
 gid=origin['goalId']
 if gid not in C or 'twenty-supported' not in C[gid]['reviewId']:continue
 cp=Path(origin['originalConfig']['path']);rp=Path(origin['originalRecords']['path']);old=json.loads(rp.read_text().splitlines()[origin['originalLine']-1])
 if gid.startswith('c224'):
  sci=[B/'2026-10-14/chemie-acid-base-seven-current419-fresh-independent-b-20261014-v1/FIRST.seven-goal-independent-scientific-outcome.json'];ns='goalDecisions.positiveProfileDecision; seven exact raw profiles accepted'
 elif old['reviewId']=='chemie-source3-fresh-independent-a-pa-20261015-v1':
  sci=[rp,BCP/'chemie-source3-six-contexts-current422-native-fresh-independent-a-20261015-v1/FIRST.original-scientific-notes.json'];ns='original independent P record.reason full-design/material acceptance; current source/D holds distinct'
 elif old['reviewId']=='chemie-lab15-original-positive-a-20261015-v1':sci=[LABFIRST];ns='decisions.positiveDesignDecision=KEEP_DESIGN'
 else:
  match=re.search(r'Original: (curricula/[^\s]+\.json)',old['reason']);assert match,gid
  sci=[Path(match.group(1))];ns='decisions.positiveDesignDecision or decisions.decision (original/informed whole design)'
 assign([gid],[rp],sci,ns,configs=[cp],note='Exact current whole profile compared to the original owner record. Later P20 current-image binding is technical continuity, not a new full-P scientific vote.')
 mappings[gid]['originalOwnerRoute']={**origin,'provenanceTransport':ref(p20in)}
# Current59314 package has per-profile actual author source plus explicit original science key routes.
P14DIR=dp('chemie-fourteen-current-positive-eight-intrinsic-supported-normal-bindings-technical-20261016-v1')
p14inputs=P14DIR/'inputs/P14.whole-supported-author-rows-current-whole-goals-and-direct-prerequisites.json'
p14science=read(P14DIR/'SCIENCE.INFORMED.existing-P14-A8-authority-and-four-old-image-current-context-before-normal-bindings.json')
for row in read(p14inputs)['rows']:
 gid=row['goalId']
 if gid not in C or 'current593-fourteen' not in C[gid]['reviewId']:continue
 source=Path(row['wholeSourceOwner']['path']);keys=row['scientificAuthorityKeys']
 if 'splitInformed' in keys:
  science=[dp('chemie-split3-targeted-author-successor-original-independent-informed-followup-20261016-v1/SCIENCE.original-reviewer-informed-followup.md')];ns='whole-six P/case KEEP; per-ID table lines191-196'
 elif 'P373Informed' in keys:
  science=[dp('chemie-P373-run-quota-original-independent-informed-followup-20261016-v1/FIRST.P373-targeted-run-quota-informed-followup.science.frozen.json')];ns='decision=KEEP_TARGETED_CORRECTION_SUPPORTED_P373_DESIGN; wholeProfileJudgment'
 elif 'source2First' in keys:
  science=[dp('chemie-source2-v3-practical-HB-theory-fresh-independent-a-20261016-v1/FIRST.current-source2-v3-three-goals-A-M-P-and-P373-quota-hold.science.frozen.json')];ns='scienceRows.P and supportedPositiveDesignGoalIds, not sourceFindings'
 else:
  science=[Path(p14science['upstreamScienceAuthorities'][k]['path']) for k in ['methodsOriginal','methodsInformed']]+[dp('chemie-methods4-targeted-normalized-fields-v2-original-independent-informed-followup-20261016-v1/SCIENCE.additive-v2-original-independent-informed-normalized-fields.json')];ns='original/informed P design support and exact normalized-fields retention; not source-only approval'
 assign([gid],[source,p14inputs],science,ns,configs=[P14DIR/'P14.all-fourteen-current-stock.normal.config.json'])
 mappings[gid]['authorityKeys']=keys
# Explicit whole-existing-P KEEP against the exact description successor, no claimed fresh full P vote.
N17DIR=dp('chemie-native17-five-description-successors-fresh-independent-B-compatibility-20261016-v1')
assign(family('five-description-compatibility'),[N17DIR/'INPUTS.whole-five-descriptions-current-A-P-M-and-eleven-complete-case-contexts.json'],[N17DIR/'FIRST.five-current-descriptions-independent-compatibility.science.frozen.json'],'decisions.wholeExistingPCompatibility.decision=KEEP unchanged whole profile design for this description successor',kind='EXPLICIT_EXACT_WHOLE_EXISTING_P_RETENTION_AND_MATERIAL_COMPATIBILITY',note='Actual whole profile/cases read and explicitly kept; bounded successor compatibility, not a newly claimed blind full-P review. Original inherited approval scope is not enlarged.')
P9DIR=dp('chemie-native9-current437-fresh-independent-a-20261016-v1')
assign(family('native9-current437'),[dp('chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1/author-positive-eight/P8.whole-positive-author-candidates.jsonl'),Path(read(P9DIR/'P9.current-independent.config.json')['reviewPath'])],[P9DIR/'FIRST.independent-current-nine-science-and-separate699.frozen.json'],'rows.profileDecision=KEEP; P whole-case reasoning',configs=[P9DIR/'P9.current-independent.config.json'])
S4DIR=dp('chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1')
assign(family('shared-three-and-faraday'),[dp('chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1/P4.whole-author-cases.current-L3.valid-lowercase-review-id.only.jsonl')],[S4DIR/'FIRST.actual-native-four-current-L3-science.before-serialization.frozen.json'],'claims.P4 unchanged whole scientific designs + rows.P actual complete cases',configs=[S4DIR/'P4.current-independent.config.json'])
S2DIR=dp('chemie-two-generic-GK-priors-and-recall-fresh-independent-a-20261016-v1')
assign(family('native2-current437'),[dp('chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1/P2.whole-current-cases.l4-input-only.jsonl')],[S2DIR/'FIRST.actual-native-two-current-l4-science.before-serialization.frozen.json'],'decisions.P2=KEEP unchanged whole scientific bodies + rows.P',configs=[S2DIR/'P2.current-independent.config.json'])
assert set(mappings)==set(C),(set(C)-set(mappings))
result=[]
for record in roster:
 gid=record['goalId'];m=mappings[gid];profile=C[gid]['profile'];matches=[]
 for sp in m['sourcePaths']: matches.extend(matching_profiles(sp,profile))
 refs=[]
 for sp in m['sciencePaths']: refs.extend(scientific_refs(sp,gid,m['decisionNamespace']))
 row={'goalId':gid,'actualCurrentWholeProfile':record['wholeProfile'],'currentReviewId':C[gid]['reviewId'],'currentEvidenceLevel':C[gid]['evidenceLevel'],'currentMaximumClaimScope':C[gid]['maximumClaimScope'],'provenanceDisposition':m['provenanceDisposition'],'exactWholeProfileEqualityEstablished':bool(matches),'exactEqualWholeProfileBodyRefs':matches,'checkedSourceBodyRefs':[ref(p) for p in m['sourcePaths']],'existingScientificDecisionRefs':refs,'originalOwnerConfigRefs':[ref(p) for p in m['configPaths']],'decisionNamespace':m['decisionNamespace'],'scopeNote':m['scopeNote'],'levelUpdatePerformed':False,'newScientificReviewPerformed':False,'normalBindingReadyInCurrent442EstablishedByThisLookup':False}
 if 'originalOwnerRoute' in m:row['originalOwnerRoute']=m['originalOwnerRoute']
 if 'authorityKeys' in m:row['authorityKeys']=m['authorityKeys']
 if not matches and gid!='a96e9b3d-a02d-54f8-a3d3-318e0ea5180c':row['provenanceDisposition']='EXACT_PROFILE_EQUALITY_NOT_ESTABLISHED_BOUNDED_LOOKUP'
 result.append(row)
report={'artifactType':'Finite read-only technical existing whole-P/material provenance lookup; no science verdict, native acceptance, or level promotion','roster':ref(RP),'totalProfiles':56,'scopeRules':{'sourceWholeUnionAcceptanceIsNotWholePAcceptance':True,'fileNamesAndE0MetadataAreNotAcceptanceOrBlockerOracles':True,'stockPReadyDoesNotRequireE1G1':True,'allCurrent56E0G0Preserved':True,'noCurrentPeerNWReviewRead':True,'noNormalFilesOrBuildsOrFullSourceReview':True,'existingDesignSupportDoesNotProveActualLearnerOrExperiment':True,'pendingLookupEvidenceIsNotNewScientificRejection':True},'profileHashRule':'sha256(UTF-8 canonical JSON: sort_keys=True, ensure_ascii=False, separators comma/colon), complete /profile only','summary':dict(collections.Counter(r['provenanceDisposition'] for r in result)),'exactEqualityCount':sum(r['exactWholeProfileEqualityEstablished'] for r in result),'actualContentHoldAlreadyRecordedNotNewlyAssessed':[{'goalId':'a96e9b3d-a02d-54f8-a3d3-318e0ea5180c','currentProfileSHA256':C['a96e9b3d-a02d-54f8-a3d3-318e0ea5180c']['profile'] and digest(C['a96e9b3d-a02d-54f8-a3d3-318e0ea5180c']['profile']),'previousAAcceptedWholeProfileSHA256':'2b51e516d0adcd7e333b4e72957ded257b6b92b163a992fa391b3c83365a10ae','priorBDecision':'revise_design','currentAuthorMetadata':'unreviewed targeted successor; independent A/B acceptance required','currentCorrectionScienceReassessed':False,'status':'Exact successor acceptance not established by this finite lookup; E0 itself is not the issue'}],'records':result}
p=OUT/'E0.existing-whole-P-provenance.lookup-bounded.json';p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'report':ref(p),'summary':report['summary'],'exactEqualityCount':report['exactEqualityCount'],'missingEquality':[(r['goalId'],r['currentReviewId']) for r in result if not r['exactWholeProfileEqualityEstablished']]},ensure_ascii=False,indent=2))
