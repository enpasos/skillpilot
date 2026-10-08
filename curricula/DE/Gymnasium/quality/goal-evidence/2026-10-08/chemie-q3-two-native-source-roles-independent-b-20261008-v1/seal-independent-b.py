"""Seal first judgments once, with normalized digest notation only."""
import pathlib, json, hashlib, datetime
out=pathlib.Path(__file__).resolve().parent
root=out.parents[6]
author=out.parent/'chemie-q3-two-native-source-roles-resume-technical-20261008-v1'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
sealpath=out/'native-b.first-verdict.seal.json'
assert not sealpath.exists(), 'Immutable first judgment already sealed'
def rec(p):
    raw=p.read_bytes()
    return {'path':str(p.relative_to(root)),'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
fails=[];count=0
for name,key in [('native-b.first-input.freeze.json','inputs'),('native-b.supplemental-input.freeze.json','ownSupplementalInputFiles'),('memory-and-transitive-inputs.first.freeze.json','inputs')]:
    data=json.loads((out/name).read_text())
    for expected in data[key]:
        actual=rec(root/expected['path']);count+=1
        if actual['sha256'].removeprefix('sha256:')!=expected['sha256'].removeprefix('sha256:') or actual['bytes']!=expected['bytes']:
            fails.append({'sourceSeal':name,'expected':expected,'actual':actual})
(out/'all-first-input-seals.final-hash-verification.json').write_text(json.dumps({'checkedReceipts':count,'failures':fails,'checkedAtUtc':now,'digestNotationNormalization':'Optional sha256: prefix removed before comparing the same digest bytes','newNativeARead':False},ensure_ascii=False,indent=2)+'\n')
assert not fails, fails
for name in ['native-full378-and-required-boundaries.mechanical-checks.json','native-b.actual-api-and-campaign-validation.json','actual-native-pdf-pages-and-raster-derivative-checks.json']:
    assert json.loads((out/name).read_text())['allPassed'],name
entry={'schemaVersion':1,'createdAtUtc':now,'kind':'neutral-independent-native-B-first-verdict-handoff','reviewer':'/root/curricula_live_diagnosis/zip64_loader_source','goalIds':['d9cce642-4f89-57f8-832a-abeb62586195','3eada74b-25b8-55dc-811a-acb473196f53'],'firstReadPaths':[str((out/n).relative_to(root)) for n in ['whole-science-P2-and-semantic-atomicity.independent-b.first-verdict.json','V2-actual-raster-and-native-PDF.independent-b.first-verdict.json','ordinary-round-b.actual-reviewer-records.json','P2-actual-independent-b-candidate.records.jsonl','memory2-current378-real-binding.read-only.json','native-b.actual-api-and-campaign-validation.json']],'ordinaryCampaignDirectory':str((author/'native/two/round-b').relative_to(root)),'summary':{'D':'2 KEEP','P':'2 PASS bounded E1/G1; whole bodies retained','A':'2 PASS_SEMANTIC_ATOMIC with own reasons','V':'PNG6v2 KEEP + originalJPEG8 KEEP','M':'2 current no_memory_needed exact bindings retained','sourceWholeHoldsRetained':16,'other376WholeBookPagesExact':True,'other478WholeCanonGoalsExact':True,'actualQALedgerRows':379,'normalNewPNGCLI':'pending separately authorized installation'},'newNativeAResultsReadBeforeFirstSeal':False,'activeWrites':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False,'sealPath':str(sealpath.relative_to(root))}
(out/'neutral-two-native-independent-b-handoff.entry.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n')
outputs=[rec(p) for p in sorted(out.rglob('*')) if p.is_file() and p!=sealpath]
outputs.extend(rec(p) for p in sorted((author/'native/two/round-b/results').iterdir()) if p.is_file())
seal={'schemaVersion':1,'sealedAtUtc':now,'reviewer':'/root/curricula_live_diagnosis/zip64_loader_source','kind':'immutable-independent-B-native-D-P-A-V-M-first-verdict-seal','outputs':outputs,'ownFirstInputSeals':[rec(out/n) for n in ['native-b.first-input.freeze.json','native-b.supplemental-input.freeze.json','memory-current-config.first-input.freeze.json','memory-and-transitive-inputs.first.freeze.json']],'blindToNewNativeAUntilSeal':True,'sourceUnionHoldsRetained':16,'activeWrites':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False}
sealpath.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print('SEALED',len(outputs),'outputs',rec(sealpath)['sha256'],'input receipts rechecked',count)
print('HANDOFF',str((out/'neutral-two-native-independent-b-handoff.entry.json').relative_to(root)))
