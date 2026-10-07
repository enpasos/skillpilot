# Apache-2.0. Final byte closure; no active or historical modifications.
import pathlib,json,hashlib,datetime,os,subprocess
R=pathlib.Path.cwd();O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-orbital-nano-targeted-independent-b-v3';A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-orbital-nano-targeted-author-v3';B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06';V=B/'chemie-next-coherent-current-gap-native-author-v2';D=B/'chemie-next25-current-native-description-independent-b-v2';P=B/'chemie-next25-current-positive-profile-independent-b-v2';M=pathlib.Path('/tmp/skillpilot-chemie-next25-native-v2-qftjmruh');F=O/'independent-b.targeted-orbital-nano-v3.final.freeze.json'
sha=lambda p:'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pathlabel(p):return str(p.relative_to(R)) if p.is_relative_to(R) else str(p)
def bind(p):return {'path':pathlabel(p),'sha256':sha(p),'bytes':p.stat().st_size}
load=lambda p:json.loads(p.read_text())
assert not F.exists();entry=load(O/'independent-b.current-v3-input-freeze.actual.json');af=A/'targeted-orbital-nano-author-v3.final.freeze.json';assert sha(af)==entry['authorFreeze']['sha256'];outside=set([af])
for row in entry['checks']:
 p=pathlib.Path(row['path']);p=p if p.is_absolute() else R/p;assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes'];outside.add(p)
# Own prior science and protection receipts; exact currently frozen bytes, no peer verdict reads.
for p in [D/'independent-b.current-native-description-v2.final.freeze.json',P/'independent-b.current-positive-profile-v2.final.freeze.json',D/'native-twenty/description-independent-b.records.jsonl',D/'native-twenty/description-independent-b.run.json',P/'native-review-root/inputs/independent-p.records.jsonl',P/'native-review-root/inputs/independent-p.run.json',D/'independent-b.current-entry.protected-whole-goal-hashes.actual.json',D/'independent-b.current-entry.source-whole-holds-preserved.actual.json',D/'independent-b.5e2-two-current-source-locators.actual.json',V/'fifty-complete-materials.de-en.author-candidates.json',V/'actual-current25-primary-scope-and-boundaries.author.json',V/'canonical.final-png-current.author-candidate.json',V/'semantic-kinds.current-authority.prospective-bindings.candidate.json',V/'qa-artifacts/full-prospective378.book-model.json',R/'AGENTS.md',R/'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',R/'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json']:
 assert p.is_file();outside.add(p)
protect=load(D/'independent-b.current-entry.protected-whole-goal-hashes.actual.json')
for s in protect['subjects']:
 p=R/s['landscapePath'];assert sha(p)==s['wholeFileSha256'];outside.add(p)
holds=load(D/'independent-b.current-entry.source-whole-holds-preserved.actual.json');p=R/holds['currentCompressedSourceReceipt']['path'];assert sha(p)==holds['currentCompressedSourceReceipt']['sha256'];outside.add(p)
for name in ['BY-C12-GA.official-page.text.txt','BY-C12-EA.official-page.text.txt','BW-SekI.physical-page-016.png']:outside.add(B/'chemie-next-coherent-current-gap-native-author-v1/actual-primary-inputs'/name)
helpers=['goalBookModel.ts','materializeGoalDescriptionRolloutBatch.ts','validateGoalDescriptionReviewCampaign.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']
helperchecks=[]
for name in helpers:
 p=R/'app/scripts'/name;q=M/'app/scripts'/name;assert sha(p)==sha(q);outside.update([p,q]);helperchecks.append({'production':bind(p),'actuallyUsedFrozenMirror':bind(q),'wholeBytesExact':True})
for p in (O/'native-review-root/app/scripts').glob('*.ts'):
 assert sha(p)==sha(R/'app/scripts'/p.name)
asset=M/'app/public/assets/goal-visualizations/chemie/0acc8cd2-be6d-567e-a023-1d9e90475510/0acc8cd2-be6d-567e-a023-1d9e90475510.jpg';outside.add(asset)
# Bound exact primary page text from the actual original PDF, separately from visual sight.
text=subprocess.check_output(['pdftotext','-f','16','-l','16','-layout',str(R/'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'),'-']);(O/'official-BW-V2.physical16.printed14.actual.txt').write_bytes(text);assert b'Nanopartikel' in text and b'14 ' in text
for filename in ['independent-b.native-D1-validation.actual.json','independent-b.native-P1-validation.actual.json']:
 x=load(O/filename);assert (x.get('allPass') is True) if 'allPass' in x else (x['status']=='PASS1' and x['errors']==[])
(O/'independent-b.final-inputs-and-unchanged-production-helpers.actual.json').write_text(json.dumps({'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorFilesReverified':96,'authorOutsideBindingsReverified':6,'unchangedActuallyUsedProductionHelpers':helperchecks,'nodeModulesSymlink':{'path':pathlabel(O/'native-review-root/app/node_modules'),'target':str(R/'app/node_modules'),'usage':'read-only module resolution; not payload descent'},'allFourActiveCanonsStillWholeByteExact':True,'NanoOriginalPageTextReadSeparatelyFromActualRasterSight':True,'D1FinalPASS':True,'P1FinalPASS':True,'peerVerdictContentsRead':False,'activeWrites':False,'strictNetGain':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
files=[]
for base,dirs,names in os.walk(O,followlinks=False):
 dirs[:]=[d for d in dirs if not (pathlib.Path(base)/d).is_symlink()]
 for name in names:
  p=pathlib.Path(base)/name
  if p!=F and not p.is_symlink():files.append(bind(p))
files.sort(key=lambda r:r['path']);inputs=[bind(p) for p in sorted(outside,key=str)]
freeze={'schemaVersion':1,'documentType':'Independent B targeted final orbital D/P and Nano metadata review immutable byte closure','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewerAgent':'/root/biology_hh21_sources_independent_b','decisions':{'currentD_KEEP':1,'currentP_KEEP':1,'fullDEENCases':2,'retainedOwnV2P_KEEPBindings':24,'NanoSource_KEEP':'metadata-only printed-page14','historicalV2D_REVISEUnchanged':True},'files':files,'inputs':inputs,'payloadFiles':len(files),'outsideBindings':len(inputs),'excludedSymlinks':[{'path':pathlabel(O/'native-review-root/app/node_modules'),'target':str(R/'app/node_modules'),'readOnlyUsage':True}],'candidateOnly':True,'activeWrites':False,'strictNetGain':0,'humanApproval':False,'humanTrial':False,'wholeSourceApproval':False,'peerVerdictContentsRead':False}
F.write_text(json.dumps(freeze,ensure_ascii=False,indent=2)+'\n')
# Verify every recorded file AND input after final freeze creation; no further own writes.
for item in files+inputs:
 p=pathlib.Path(item['path']);p=p if p.is_absolute() else R/p;assert sha(p)==item['sha256'] and p.stat().st_size==item['bytes']
print(json.dumps({'freeze':pathlabel(F),'sha256':sha(F),'payloadFiles':len(files),'ownFilesIncludingFreeze':len(files)+1,'outsideBindings':len(inputs),'allVerifiedExact':True,'D':'KEEP/PASS1','P':'KEEP/PASS1','Source':'KEEP metadata-only printed14'},ensure_ascii=False))
