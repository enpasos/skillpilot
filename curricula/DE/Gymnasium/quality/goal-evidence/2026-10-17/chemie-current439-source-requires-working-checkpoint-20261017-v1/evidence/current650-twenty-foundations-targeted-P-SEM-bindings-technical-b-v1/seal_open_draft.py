from pathlib import Path
import json,hashlib,shutil,datetime,os
B=Path('/mnt/e/skillpilot-chemie-L7-20261017');R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/chemie-m7-resumed-20261016';O=B/'current650-twenty-foundations-targeted-P-SEM-bindings-technical-b-v1';C=O/'capsule';mp=C/'candidate-inputs/TWENTY-SUCCESSOR.inputs.json';m=json.load(open(mp));out=C/m['outputsRelative'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'physicalPath':str(p.resolve()),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,j):Path(p).write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
r=json.load(open(out/'RESULT.current650-twenty-foundations-targeted-binding-status.json'));assert r['P']['pairedContextReady'] is False and r['P']['recordChangesMaterialized']==0 and r['P']['effectiveCurrentFPCount']==438;assert len(r['SEM']['sourceFPChanges'])==5;assert r['technicalErrors']==[]
# Preserve new clean context v2 separately, without calling it a reviewed input.
v2sel=B/'two-BW-and-coordinate-priors-current-P9-context-author-root-v2/SELECTOR.clean-current-context-input-for-own-informed-followups.json';assert sha(v2sel)=='02a849483998e4bf52c2730373eed8b031b650662a86def5b92159dabf64afd2';vs=json.load(open(v2sel));v2=Path(vs['reviewInput']['path']);assert sha(v2)=='5f25f437528cf88525d2385f183edabbc1eb7608a8312fc5936e06171a622561'
newSourcePins=[]
for k,p in [('contextV2Selector',v2sel),('contextV2Input',v2)]:
 d=C/'candidate-inputs/twenty-targeted-successor/received-context-v2-pending-review'/p.name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,d);newSourcePins.append({'key':k,'source':pin(p),'privateCopy':pin(d),'scientificStatus':'PENDING_ADDITIVE_INFORMED_REVIEW_NOT_A_VOTE'})
# These are root's completed external diagnostics, not newly executed gates here.
AP=B/'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1'
for name,expected in [('STOCK.actual650-paired-twenty-foundations-and-coordinate-applicability.json','27f953b07b8d301613d23f3f6dee0a0b62246bbd6297b7d942923e1f57126b20'),('CHECK.actual-four-c95-targets-restored-and-twenty-new-placements-eligible.json','2d2f41b394ccda49d114c6c6b91642be25bd2ab1df283bec15a436ac6960918d')]:
 p=AP/name;assert sha(p)==expected;d=C/'candidate-inputs/twenty-targeted-successor/external-root-actual-APV'/name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,d);newSourcePins.append({'key':'externalRootDiagnostic','source':pin(p),'privateCopy':pin(d),'performedBy':'root','notRunByThisAgent':True})
# The first tsx invocation reused the previous task's rebuildable cache directory.
# Move only new-task cache entries (their serialized maps name this new unique
# root) into this task's cache; no old source or sealed file is touched.
newCache=O/'cache';newCache.mkdir(exist_ok=True);oldCache=B/'current650-P35-SEM-candidate-bindings-independent-b-v1/cache';moved=[]
if oldCache.exists():
 for p in oldCache.rglob('*'):
  if p.is_file() and str(O).encode() in p.read_bytes():
   d=newCache/p.relative_to(oldCache);d.parent.mkdir(parents=True,exist_ok=True);shutil.move(p,d);moved.append({'from':str(p),'to':str(d),'sha256':sha(d),'reason':'Own new-task compiled cache map names unique new task root; relocated after initial shared-cache invocation'})
guards=[]
for k,v in m['inputs'].items():
 assert sha(v['path'])==v['sha256'];d=C/v['copyRelative'];assert sha(d)==v['sha256'];guards.append({'key':k,'source':pin(v['path']),'privateCopy':pin(d)})
assert sha(C/m['canonicalRelative'])=='48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd'
assert (C/m['canonicalRelative']).stat().st_nlink==1
# Whole P439 bytes remain precisely the old source, including95dc and9b P9.
assert (out/'P439.current-snapshot.explicit-pending-or-one-successor.candidate.jsonl').read_bytes()==(C/m['inputs']['old:mergedP439']['copyRelative']).read_bytes()
oldOwnGuard=json.load(open(T/'current24-targeted-P-context-scientific-informed-b-v1/GUARD.inputs-and-protected-canonical-snapshots.unchanged.json'));protected=[]
for p in oldOwnGuard['protectedCanonicalPins']:
 assert sha(p['path'])==p['sha256'];protected.append(pin(p['path']))
prev=Path(m['sourcePreviousRoot']);assert sha(prev/m['canonicalRelative'])=='e95b2c1a8fd6d4f500598157ea0ae1c3f35b3c8932e492461d377de2824bdcb8'
assert sha(prev.parent/'SELECTOR.inactive-current650-P439-SEM-technical-candidate.json')=='e512a540d03d3269614b30fe091267cbfbf4d3c8f6c03dff2158b23405fd12af'
oldNs=prev/'candidate-inputs/TWENTY-SUCCESSOR.inputs.json';assert not oldNs.exists()
write(O/'GUARD.open-draft-exact-inputs-and-protected-snapshots.json',{'atUTC':now,'physicalRoot':str(C),'sourceAndPrivateGuards':guards,'additionalReceivedPins':newSourcePins,'protectedMainL6L7CanonicalPins':protected,'previousP35CanonicalAndSelectorUnchanged':True,'P439AllWholeLinesExactOldSource':True,'currentPFPCount':438,'oneOpenReviewInputFingerprint':r['P']['changedGoalId'],'PRecordRebindings':0,'privateCanonicalNlink':1,'initialOwnTaskCacheEntriesRelocated':moved,'futureTMPDIR':str(newCache),'noSourceOrLedgerChangesOutsideNewRoot':True})
write(O/'RECEIVED.current-context-v2-and-external-root-APV.not-science.json',{'atUTC':now,'pins':newSourcePins,'v2ScientificReviewStatus':'PENDING_TWO_CONCRETE_INFORMED_FOLLOWUPS','v2ContextReceiptDoesNotClose363':True,'externalRootAPVReported':{'errors':0,'warnings':58,'twentyNewPairsEligible':True,'frontendExclusions':149,'fourC95Restored':True,'newFrontendExclusions':0,'newC95OverrideWarningNotWaived':True},'externalDiagnosticNotRunHere':True,'noM7OrFullSourcePass':True})
md=['# Open technical successor draft — twenty foundations','',f'UTC: {now}','',f'Physical root: `{C}`.','',
'## Exact observed results','',
'- C650 SHA256 `48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd`;39-view input SHA256 `f3989d39a8096f160de40c35b81281054cbe06012626a227439a7f5895bfd9ac`.',
'- Exactly5 whole-goal changes and5 actual stock SEM-source fingerprint changes. Semantic classes are unchanged; SEM schema passes.',
'- Exactly1 actual P fingerprint delta:363 reviewInputFingerprint. All439 whole P bodies are unchanged.438 old records match the new snapshot;363 is explicitly OPEN. **No P record has been finally rebound.**',
'- A syntactically current363 successor is prepared and passes the one-record complete stock config check; this is a technical draft, not scientific acceptance.',
'- Original112 criteria namespaces and all old whole record dates/identities/valid run IDs are retained. The proposed changed363 record has reviewRunIds[]. Current P9 profiles95dc/9b remain exact.',
'- M439/80 cards/67 selectors are unchanged; no FP/shape/deck flags.20 actual new target roles=12 ordinary+8 Memory; no deleted target role.',
'- Actual stock raw Memory/course pair count809→817, measured on current before/after files. The8 new/relevant pairs were checked:0 subset-visibility errors and0 missing declared prerequisite-role/course paths. This is not a full817-path or old809 acceptance claim.',
'- BW266 remains intentional prerequisiteOnly support in BW GK/LK. It is not a missing new target. Global origins and deck traces are kept; origins are not automatically prerequisites.','',
'## Genuine open363 context hold','',
'The original foreign input contains30 matching whole current context profiles and historical copies for95dc/9b.363 itself is exactly the accepted existing body. Root supplied a separate clean v2 replacing exactly those two context copies. It is archived separately and awaits the two requested informed independent follow-ups. Merely receiving that file or passing fingerprint/schema checks does not resolve363.','',
'The old FIRSTs and source inputs remain unchanged. The new v2 input SHA is `5f25f437528cf88525d2385f183edabbc1eb7608a8312fc5936e06171a622561`; selector SHA is `02a849483998e4bf52c2730373eed8b031b650662a86def5b92159dabf64afd2`.','',
'## Root external diagnostics','',
'Root supplied actual APV0 errors/58 warnings,20 new target pairs eligible,149 existing frontend exclusions with exactly4 c95 restored and no new exclusions. These exact external artifacts are archived/pinned; this agent ran no APV. The c95 override warning is not waived and no final source/M7 pass follows.','',
'## Limits and next action','',
'Complete the two concrete current-context informed follow-ups, then perform the small363 binding with their actual pins. No other P body is to be overwritten. Full/native/central/APV/build/M7 and human acceptance remain outside this draft.',
'The first tool invocation temporarily used the previous task\'s rebuildable tsx cache; only newly created cache entries naming this unique task root were moved to this task\'s cache. Old source/capsule/ledger/selector files remain unchanged.','',
'No new scientific or Memory vote, learner observation, human authority, formal run ID, normal/L6/L7 mutation or final learning-path approval.']
(O/'REPORT.OPEN-draft-one-P363-context-hold-and-actual-new-Memory-pairs.md').write_text('\n'.join(md)+'\n')
write(O/'COMMANDS.actual-open-draft-targeted-checks.json',{'role':'Observed technical commands, no formal review run','commands':[{'cmd':'python '+str(O/'prepare_successor_capsule.py'),'exitCode':0},{'cmd':'python '+str(O/'add_exact_receipt_provenance.py'),'exitCode':0},{'cmd':'TMPDIR='+str(oldCache)+' '+str(R/'app/node_modules/.bin/tsx')+' '+str(O/'bind_targeted_successor.ts'),'exitCode':0,'status':'OPEN_DRAFT_NO_FINAL_363_BINDING'},{'cmd':'python '+str(O/'seal_open_draft.py'),'exitCode':0}],'futureTMPDIR':str(newCache),'noFullRuns':True,'noNewScientificVotes':True})
cas={'role':'Inactive open technical draft CAS, not final363 scientific binding','atUTC':now,'physicalRoot':str(C),'canonical':pin(C/m['canonicalRelative']),'result':pin(out/'RESULT.current650-twenty-foundations-targeted-binding-status.json'),'guard':pin(O/'GUARD.open-draft-exact-inputs-and-protected-snapshots.json'),'openP363Draft':pin(out/'P363.actual-stock-successor.DRAFT-or-bound.explicit-status.json'),'P439AllOldWholeLines':pin(out/'P439.current-snapshot.explicit-pending-or-one-successor.candidate.jsonl'),'SEM650TechnicalSourceCandidate':pin(out/'SEM650.exact-kinds-five-current-stock-source-bindings.candidate.json'),'newMemoryPairCheck':pin(out/'CHECK.actual-20-role-deltas-and-new-relevant-Memory-pairs.json'),'receivedV2AndExternalDiagnostics':pin(O/'RECEIVED.current-context-v2-and-external-root-APV.not-science.json'),'allOutputFiles':[pin(p) for p in sorted(out.iterdir()) if p.is_file()],'P363ScientificContextStatus':'OPEN_PENDING_TWO_ADDITIVE_INFORMED_FOLLOWUPS','PFinalRebindings':0,'M7':False,'human':False}
write(O/'CAS.OPEN-draft-current650-five-SEM-one-P363-pending.json',cas)
selector={'role':'Sealed inactive technical draft with genuine open363 context HOLD','atUTC':now,'physicalRoot':str(C),'CAS':pin(O/'CAS.OPEN-draft-current650-five-SEM-one-P363-pending.json'),'guard':cas['guard'],'report':pin(O/'REPORT.OPEN-draft-one-P363-context-hold-and-actual-new-Memory-pairs.md'),'commands':pin(O/'COMMANDS.actual-open-draft-targeted-checks.json'),'result':cas['result'],'currentPMatchingRecords':438,'PFinalRebindings':0,'open363':True,'SEMSourceFPDeltas':5,'PRecordFPDeltas':1,'newMemoryPairs':8,'checkedRelevantPairs':8,'newSubsetMemoryVisibilityErrors':0,'newRelevantPairDeclaredPathHolds':0,'unchangedM439Cards80Selectors67':True,'technicalErrors':0,'v2CurrentContextReviewStatus':'PENDING_TWO_CONCRETE_INFORMED_FOLLOWUPS','rootCompiledDiagnosticsSeparate':True,'newScienceVotes':0,'formalReviewRunIds':[],'human':False,'M7':False}
write(O/'SELECTOR.OPEN-draft-targeted-successor-P363-pending-context-pair.json',selector)
write(O/'SEAL.immutable-OPEN-draft-targeted-successor.json',{'role':'Immutable open draft, prior snapshot and original FIRSTs preserved','atUTC':now,'selector':pin(O/'SELECTOR.OPEN-draft-targeted-successor-P363-pending-context-pair.json'),'CAS':selector['CAS'],'guard':selector['guard'],'report':selector['report'],'scripts':[pin(O/n) for n in ['prepare_successor_capsule.py','add_exact_receipt_provenance.py','bind_targeted_successor.ts','seal_open_draft.py']],'open363':True,'newScienceVotes':0,'human':False,'M7':False})
link=T/O.name
if not link.exists():os.symlink(O,link,target_is_directory=True)
for n in ['GUARD.open-draft-exact-inputs-and-protected-snapshots.json','RECEIVED.current-context-v2-and-external-root-APV.not-science.json','REPORT.OPEN-draft-one-P363-context-hold-and-actual-new-Memory-pairs.md','COMMANDS.actual-open-draft-targeted-checks.json','CAS.OPEN-draft-current650-five-SEM-one-P363-pending.json','SELECTOR.OPEN-draft-targeted-successor-P363-pending-context-pair.json','SEAL.immutable-OPEN-draft-targeted-successor.json']:(O/n).chmod(0o444)
print(json.dumps({'physicalRoot':str(C),'selector':pin(O/'SELECTOR.OPEN-draft-targeted-successor-P363-pending-context-pair.json'),'seal':pin(O/'SEAL.immutable-OPEN-draft-targeted-successor.json'),'CAS':selector['CAS'],'report':selector['report'],'currentP':438,'PFinalRebindings':0,'open363':True,'relocatedOwnNewCacheEntries':len(moved)},indent=2))
