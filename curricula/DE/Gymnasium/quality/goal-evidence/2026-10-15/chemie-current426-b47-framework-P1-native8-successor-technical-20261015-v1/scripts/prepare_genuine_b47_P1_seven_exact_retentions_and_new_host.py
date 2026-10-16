# SPDX-License-Identifier: Apache-2.0
"""Ein echter P1-Folger, sieben Originalbindungen, eigener neuer Stockhost."""
from pathlib import Path
import copy,hashlib,json,jsonschema,os,shutil
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent;H=R/'tmp/chemie-m7-resumed-20261015/current426-b47-framework-P1-native8-successor-own-host-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(a):
 p=R/a['path'];assert ref(p)==a,p;return p
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
bp=E/'chemie-current426-two-essential-profile-bindings-native8-successor-technical-20261015-v1/OUTPUTS.finite-current426-two-essential-P2-Native8-successor.technical-selector.json';assert ref(bp)['sha256']=='sha256:99b69d894c7823e1b145b61650619a0a12e6658f51ce04b74a77eedd13219e4e';base=load(bp)
for a in load(R/base['finalSealPath'])['files']:verify(a)
sp=E/'chemie-b47-two-framework-strings-informed-independent-P1-20261015-v1/OUTPUTS.finite-b47-two-framework-strings-informed-independent-P1.selector.json';assert ref(sp)['sha256']=='sha256:50a2a0d9a8e04a94c7e5d829ff75661fdf97a23c0562fb9dd9284b9634bc2241';science=load(sp);seal=R/science['sealPath'];assert ref(seal)['sha256']=='sha256:1c33c73bc9d63f17bdaf0023da92f39005e823e9a72dc8fb56060561e1da1ffb'
for a in load(seal)['files']:verify(a)
assert science['result']['acceptedExactB47SuccessorE1G1AsDesign']==1 and science['result']['HOLD']==0;first=load(verify(science['FIRSTP1']));assert first['decision']=='ACCEPT_EXACT_TWO_STRING_FRAMEWORK_SUCCESSOR' and first['evidenceLevel']=='E1' and first['maximumClaimScope']=='G1';author=load(verify(science['authorSelector']));assert science['authorSelector']['sha256']=='sha256:7546dc500a40c5568db82544ebfbeb0bc7d070332b3cd1ae84ed8cdf0366d9f9';raw=load(verify(author['wholeRawProfiles']));assert verify(science['wholeSuccessorRawProfiles']).read_bytes()==verify(author['wholeRawProfiles']).read_bytes();old=load(verify(base['neutralFinalNative8']));prior=load(verify(old['roundAInput']));original={g['goalId']:g['reviewContext']['evidenceProfile'] for g in prior['goals']};byraw={r['goalId']:r['profile'] for r in raw['records']};gid='b47d542d-c2d7-5554-95dc-10b47ab622ab';g1='1d2e7b80-653d-57b8-a284-8ede5a353b73';assert byraw[g1]==original[g1]['profile']
def diff(a,b,p=''):
 if type(a)!=type(b):return[p]
 if isinstance(a,dict):return[q for k in sorted(set(a)|set(b)) for q in ([p+'/'+k] if k not in a or k not in b else diff(a[k],b[k],p+'/'+k))]
 if isinstance(a,list):
  if len(a)!=len(b):return[p]
  return[q for i,(x,y) in enumerate(zip(a,b)) for q in diff(x,y,p+'/'+str(i))]
 return [] if a==b else[p]
assert set(diff(original[gid]['profile'],byraw[gid]))=={'/expectations/1/essentialUnderstandingDe','/expectations/1/essentialUnderstandingEn'}
oldcfg=load(verify(base['genuineP2NormalConfig']));oldnormal=verify(base['genuineP2NormalRecords']);line=next(l for l in oldnormal.read_bytes().splitlines(keepends=True) if json.loads(l)['goalId']==g1);rp=O/'retentions/P1.original1d2.byte-exact-last-genuine-P2.jsonl';rp.parent.mkdir();rp.write_bytes(line);rc=copy.deepcopy(oldcfg);rc.update(reviewPath=rp.relative_to(R).as_posix(),scope={'label':'Bytegleiche ursprüngliche1d2-Zeile aus dem letzten echtenP2, originale reviewId','goalIds':[g1]});retcp=O/'config/P1.original1d2.retained-original-review-id.config.json';put(retcp,rc);assert json.loads(line)==original[g1]
parts=[first['applicabilityToWholeB47Profile']['conclusion'],first['ownScientificFindings'][0]['conclusion']];reason='\n\n'.join(parts);assert len(reason)<=2000;r=copy.deepcopy(original[gid]);r.update(reviewId='chemie-current426-b47-framework-genuine-informed-p-technical-20261015-v1',profile=byraw[gid],reviewedAt=first['createdAtUTC'],reviewer=first['reviewer'],reason=reason,reviewRunIds=[],evidenceLevel='E1',maximumClaimScope='G1',status='needs_human_review',reviewAuthority='ai_candidate');seed=O/'positive/P1.b47-genuine-original-science.seed-before-stock-FP.json';put(seed,[r]);normal=O/'positive/P1.b47-two-framework-strings.current.normal.jsonl';cfg=copy.deepcopy(oldcfg);cfg.update(reviewId=r['reviewId'],reviewPath=normal.relative_to(R).as_posix(),scope={'label':'Ein echter informierterb47-Profilfolger; genau zwei fachliche essentialUnderstanding-Sprachstrings, E1/G1-Design','goalIds':[gid]});cfg.pop('reviewRunManifestPaths',None);cp=O/'config/P1.b47-framework-genuine-informed.normal.config.json';put(cp,cfg)
validator=jsonschema.Draft202012Validator(load(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'),format_checker=jsonschema.FormatChecker());validator.validate(cfg);validator.validate(rc);jsonschema.Draft202012Validator(load(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),format_checker=jsonschema.FormatChecker()).validate(r)
retentions=copy.deepcopy(base['threeByteExactOriginalRetentionGroups']);retentions.append({'label':'P1-original1d2-last-genuine-P2','sourceWholeRecords':base['genuineP2NormalRecords'],'retainedRecords':ref(rp),'config':ref(retcp),'goalIds':[g1],'recordLinesByteExact':True,'originalReviewId':rc['reviewId'],'retainedOriginalRunManifests':[],'omittedUnreferencedManifestPaths':[],'originalManifestBytesAndWholeGoalIdsUnchanged':True});assert sum(len(x['goalIds']) for x in retentions)==7
put(O/'positive/TRANSPORT.genuine-b47-P1-two-framework-strings.no-new-science.json',{'schemaVersion':1,'role':'Informierter technischer Normaltransport des echtenP1; keine neue Wissenschaft','selector':ref(sp),'seal':ref(seal),'sourceFIRST':science['FIRSTP1'],'records':[{'goalId':gid,'originalReasonParagraphs':parts,'actualTimeField':'createdAtUTC','actualReviewer':first['reviewer'],'sourceAuthorWholeProfiles':author['wholeRawProfiles'],'wholeProfileUnchanged':True}],'reviewRunIds':[],'normalRunClaims':0,'newScienceVotes':0,'actualProfileLanguageFieldChanges':2,'allOtherGoalsProfilesNineteenCasesExact':True,'noDArtifactRead':True,'agentStatusSummaryIncident':'Vor Beginn lieferte die Agentenstatusliste ungefragt eine D-Zusammenfassung. Keine D-Datei wurde geöffnet; kein Urteil daraus wurde verwendet.'})
m=load(verify(base['exactRebuildRecipe']));assert not H.exists();H.mkdir(parents=True)
for q in R.iterdir():
 if q.name not in ['app','tmp','.git']:(H/q.name).symlink_to(q,target_is_directory=q.is_dir())
(H/'app').mkdir();(H/'app/scripts').mkdir();(H/'app/public').mkdir()
for q in (R/'app').iterdir():
 if q.name not in ['scripts','public']:(H/'app'/q.name).symlink_to(q,target_is_directory=q.is_dir())
def branch(q):
 if q.is_symlink():
  children=list(q.resolve().iterdir());q.unlink();q.mkdir()
  for c in children:(q/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not q.exists():q.mkdir()
def install(src,rel,physical=False,hardlink=False):
 q=H/rel;par=H
 for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
 if q.is_symlink() or q.is_file():q.unlink()
 if hardlink:os.link(src.resolve(),q)
 elif physical:shutil.copyfile(src,q)
 else:q.symlink_to(src)
for rel in ['curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-visualization-review']:
 q=H/rel;par=H
 for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
 if q.is_symlink():q.unlink()
 assert not q.exists();q.mkdir()
for a in m['stockPhysicalModules']:install(verify(a),a['path'],True)
for a in m['aliases']:install(verify(a['physicalRepositorySource']),a['normalHostAlias'],a.get('physicalWithinHost',False))
selected={a['normalPublicAlias']:a for a in m['selectedReadOnlyPublicImageHardlinks']}
for a in m['selectedCurrentAssetRows']:
 src=verify(a['physicalRepositorySource']);install(src,a['normalCanonicalDestination']);install(src,a['normalPublicDestination'],hardlink=a['normalPublicDestination'] in selected)
for a in selected.values():
 src=verify(a['originalRepositorySource']);dst=H/a['normalPublicAlias'];assert src.stat().st_ino==dst.stat().st_ino and src.stat().st_dev==dst.stat().st_dev
book=load(verify(base['actualBaseBookConfig']));book['evidenceReviewPaths']=[x['retainedRecords']['path'] for x in retentions]+[normal.relative_to(R).as_posix()];book['outputPath']=(O/'not-written-full-model.json').relative_to(R).as_posix();bookp=O/'config/native-eight-b47-framework.stock-base.config.json';put(bookp,book);native=load(verify(base['actualNativeConfig']));native.update(batchId='chemie-current426-b47-framework-profile-successor-technical-20261015-v1',baseGoalBookConfigPath=bookp.relative_to(R).as_posix(),outputDirectory=(O/'native-final-eight').relative_to(R).as_posix());np=O/'config/native-eight-b47-framework.normal-stock-prepare.config.json';put(np,native);jsonschema.Draft202012Validator(load(R/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json')).validate(native)
put(O/'checks/PREFLIGHT.actual-closed-P1-retention-config-record-and-Native8-schemas.json',{'schemaVersion':1,'closedActualP1RecordSchema':'PASS','closedActualP1AndRetentionConfigSchemas':'PASS','closedActualNativeConfigSchema':'PASS','sourceProfileDeltaStrings':2,'wholeStringsUntruncated':True,'sevenUnchangedOriginalRecordLines':True,'profilePartition':[4,1,1,1,1],'originalReviewIdOnRetained1d2':True,'newModelCalls':0,'newRenders':0})
plan=O/'INPUTS.final-eight-stable-current-profiles-and-neutral-material.json';put(plan,{'schemaVersion':1,'role':'Additiver technischer b47-P1-Native8-Folger nach Rootfreigabe','baseTechnicalSelector':ref(bp),'baseNeutralNative8':base['neutralFinalNative8'],'baseTechnicalSeal':ref(R/base['finalSealPath']),'executionHost':H.relative_to(R).as_posix(),'exactBaseMap':base['exactRebuildRecipe'],'canonical':base['canonical'],'semantic':base['semantic'],'visualizationQA':base['visualizationQA'],'goalIds':native['goalIds'],'P1Config':ref(cp),'P1OriginalScienceSeed':ref(seed),'P1NormalPath':normal.relative_to(R).as_posix(),'genuineP1Selector':ref(sp),'genuineP1Seal':ref(seal),'retentionGroups':retentions,'P5Normal':retentions[0]['retainedRecords'],'retainedE9':retentions[1]['retainedRecords'],'P077ExactOriginalRecord':retentions[2]['retainedRecords'],'retained1d2':ref(rp),'previousNeutralEightInputs':base['neutralFinalNative8'],'previousActualPageSelectors':[base['neutralFinalNative8']],'neighborWholeCurrentCases':old['wholeNeighborFiveCorrectedCasesAndRubrics'],'wholeNineteenCaseBindings':old['wholeNineteenCurrentCaseMaterialAndRubricBindings'],'authorWholeSuccessorProfiles':author['wholeRawProfiles'],'authorWholeOriginalProfiles':load(verify(author['previousNeutralAuthorSelector']))['wholeRawProfiles'],'baseGoalBookConfig':ref(bookp),'nativeConfig':ref(np),'allEightBookProfilesRequired':True,'expectedProfileCount':8,'expectedChangedPageFPGoalIds':[gid],'expectedChangedGoalFPs':0,'essentialLanguageFieldChanges':2,'actualScientificReviewRunClaims':0,'newDescriptionRecords':0,'centralRuns':0,'newFullModelFiles':0,'rasterByteCopies':0,'newAOrMOrVChecks':0})
print(json.dumps({'finalPlan':ref(plan),'genuineP1Seed':1,'actualClosedSchemas':'PASS','exactRetainedRecordCount':7,'profilePartition':[4,1,1,1,1],'newOwnHost':1,'rasterByteCopies':0,'newModelCalls':0,'renders':0},ensure_ascii=False))
