import datetime,hashlib,json,pathlib
own=pathlib.Path(__file__).resolve().parent;root=own.parents[6]
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def artifact(p):
 b=p.read_bytes();return {'path':str(p.relative_to(root)),'sha256':sha(b),'bytes':len(b)}
r=json.loads((own/'actual-P45-new3-native-Book346-old343-full-parity.READONLY.receipt.json').read_text())
assert len(r['configPaths'])==45 and r['ordinary']==346 and r['nativeNew3']['errors']==[]and r['wholeBook']['pages']==346 and r['allExact']
assert len(r['old343GoalKindResourceAndPerRecordParity'])==343 and sum(x['wholeGoalExact']for x in r['old343GoalKindResourceAndPerRecordParity'])==333
assert all(x['nativeGoalFingerprintExact']and x['nativeReviewInputFingerprintExact']and x['nativeProfileFingerprintExact']and x['semanticKindExact']and x['recordLineUnchanged']for x in r['old343GoalKindResourceAndPerRecordParity'])
for guard in r['inputGuards']:
 p=root/guard['before']['path'];assert sha(p.read_bytes())==guard['before']['sha256']and p.stat().st_size==guard['before']['bytes']
meta=own/'actual-own-generation-metadata.bytes.json'
with meta.open('x')as f:json.dump(r['generationMetadata'],f,indent=2);f.write('\n')
outputs=[artifact(p)for p in sorted(own.rglob('*'))if p.is_file()and 'activation-ready'not in p.parts and not p.name.endswith('SEALED.receipt.json')]
output_digest=sha((json.dumps(outputs,sort_keys=True,separators=(',',':'))+'\n').encode())
receipt={'role':'SEALED_NATIVE_TARGETED_P3_BOOK346_TECHNICAL_BINDING_WITH_EXACT_343_PROFILE_REUSE','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nativeTechnicalReceiptPath':str((own/'actual-P45-new3-native-Book346-old343-full-parity.READONLY.receipt.json').relative_to(root)),'configPaths':r['configPaths'],'wholeBookConfigPath':r['wholeBook']['configPath'],'combinedReviewPath':r['combinedReviewPath'],'newThreeNativeSchemaSemanticChecksPassed':True,'whole346NativeBookBuildAndSchemaPassed':True,'old44WholeScopesAndReviewPointersExact':True,'old343RawProfileLinesAsExactBytePrefix':True,'old343NativeGoalKindInputProfileResourceParityActual':True,'old333WholeObjectsExactAndTenApplicabilityOnlyDeltasDisclosed':True,'applicabilityScopeScienceRemainsSeparate':True,'old44NativeSubprocessesNotRerun':True,'rootAll45ActiveNativeChecksStillPending':True,'corePath':r['corePath'],'semanticPath':r['semanticPath'],'authorSeal':r['authorSeal'],'independentScienceReceipt':r['scienceReceipt'],'toolchain':r['toolchain'],'generationMetadata':r['generationMetadata'],'generationParametersFingerprint':artifact(meta)['sha256'],'inputEndguards':r['inputGuards'],'outputArtifacts':outputs,'outputDigest':output_digest,'allExact':True,'E1G1aiCandidateNeedsHumanReview':True,'historicalQAReviewOnlyNoFreshV':True,'humanApproval':False,'newBlindDOrWhole343ScienceReview':False,'activeWrites':0,'nativeCentralM6M7OrFullCIPassClaimed':False}
target=own/'actual-P45-new3-and-native-whole-Book346-all-endguards.SEALED.receipt.json'
with target.open('x')as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'sealPath':str(target.relative_to(root)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'configs':45,'bookPages':346,'outputs':len(outputs),'endguards':len(r['inputGuards'])}))
