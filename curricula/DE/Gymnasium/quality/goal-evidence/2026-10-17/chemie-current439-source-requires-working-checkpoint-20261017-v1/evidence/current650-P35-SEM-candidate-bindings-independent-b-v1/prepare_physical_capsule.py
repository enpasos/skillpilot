from pathlib import Path
import shutil,hashlib,json,os,datetime
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/chemie-m7-resumed-20261016';O=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-P35-SEM-candidate-bindings-independent-b-v1');S=O.parent/'accepted-components-current-bindings-independent-b-v1/capsule';C=O/'capsule'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'physicalPath':str(p.resolve()),'sha256':sha(p),'bytes':p.stat().st_size}
assert not C.exists()
shutil.copytree(S,C,symlinks=True,copy_function=shutil.copyfile,ignore=lambda p,n:['node_modules'] if Path(p)==S/'app' else [])
os.symlink(S/'app/node_modules',C/'app/node_modules',target_is_directory=True)
(C/'candidate-inputs/current-P35').mkdir()
P={
 'C650':('/mnt/e/skillpilot-chemie-L7-20261017/paired-c95-BB-BE-own-scope-actual-whole650-assembly-technical-v1/candidate.canonical650.paired-concentration-foundations-and-c95-BB-BE.private.json','e95b2c1a8fd6d4f500598157ea0ae1c3f35b3c8932e492461d377de2824bdcb8'),
 'views39':('/mnt/e/skillpilot-chemie-L7-20261017/paired-c95-BB-BE-own-scope-actual-whole650-assembly-technical-v1/candidate.whole39views.unchanged-paired48-foundations.private.json','e922a8d5667c6453fb04f0431c2fba02fbf088caaf8656fad04166abbfb91a60'),
 'assemblyReceipt':('/mnt/e/skillpilot-chemie-L7-20261017/paired-c95-BB-BE-own-scope-actual-whole650-assembly-technical-v1/RECEIPT.guarded-one-c95-BB-BE-scope-assembly.json','3f900fb8d33688a931b5479716532febe368cce3d402e071dc0137a74486bb14'),
 'assemblySelector':('/mnt/e/skillpilot-chemie-L7-20261017/paired-c95-BB-BE-own-scope-actual-whole650-assembly-technical-v1/SELECTOR.guarded-one-c95-BB-BE-scope-assembly.json','f731e11ec13791d9a6c3eaa6b5413c564e5b6cfc857581a8397caadef181867e'),
 'P24review':(T/'current24-targeted-P-context-scientific-informed-b-v1/REVIEW.informed-24-whole-P-contexts-and-T05-material-selection.B.json','c4664c31fe44cd4ba5a56dee856e25d7e8ad5ba364edf586326585f92b9cf968'),
 'P24clean':(T/'current-650-nine-NI-targeted-P-context-inputs-technical-b-v1/INPUT.clean-content-only-24-current-P-contexts-whole-goals-profiles-reviewinputs-images.json','d4af6ff31ed3401bcefbb42aa7ff9c0ded1f36ca03a38988609ee62fc6682753'),
 'P5c8clean':(T/'5c8-Biuret-negative-control-color-author-successor-v1/REVIEW-INPUT.clean-whole-5c8-P-and-two-test-specific-blank-corrections.json','8267eb80a05ac32cd098f5a809b0ebaf83777fd4b008555447d9b7ef6cb21dd1'),
 'P5c8B':(T/'current24-targeted-P-context-scientific-informed-b-v1/FOLLOWUP.5c8-test-specific-control-correction.informed-B.json','e4f0b60d4c4e875ede7f1cfd9a87bdf5f7e6765483a551c0cc277590fbdcd59c'),
 'P5c8rootSecond':(T/'5c8-test-specific-controls-root-second-informed-review-v1/REVIEW.root-second-informed.whole-5c8-two-field-correction.json','53bc302a00476fbb5a28ecfa29c4c53fbde6ec6fb798f570bbe19aff8ac595ac'),
 'P5c8CAS':(T/'5c8-Biuret-negative-control-color-author-successor-v1/CAS.P5c8.whole-profile-and-whole-transfer-case.AUTHOR.inactive.json','1640d6084d98863eb47bd86554629dcf7aa6c06e45def79d7878e893f3c00f9d'),
 'original439Audit':(T/'actual439-per-original-config-criteria-retention-audit-root-v1/CHECK.actual112-original-config-criteria-and-reviewID-per439-records.json','f569e70993958609c9bd16a4691edfb5997c1db2d3707862b2baa3a250891757'),
 'P0263':(T/'concentration-two-interface-science-author-v1/P1.02634fdd.integrated-concentration-two-fresh-cases.v3-bounded-intro.AUTHOR.pending.json','a6fbe0a857150d32c542957db69b8f174aecd4c3f9f197272942e39c2cb73192'),
 'Pe22':(T/'concentration-two-interface-science-author-v1/P1.e22a34d4.integrated-concentration-two-fresh-cases.v3-bounded-intro.AUTHOR.pending.json','71441d60191caa8bffe1cca2275dfa3bc0f741788da77e92b7e29b0e0b44d7f9'),
 'P2scienceA':(T/'concentration-two-interface-independent-a-v1/FIRST.json','c22068f142ecf0b8b9e4024c05b62547202672d2d7dc74169e15c7c02af856c2'),
 'P2scienceB':(T/'concentration-two-interface-independent-b-v1/FIRST.review.json','a73512006b212e6572b88aaf750ab6517e87f74bc9ac4eb64fecd3772f5139f2'),
 'P2scienceBfollow':(T/'concentration-two-interface-independent-b-v1/FOLLOWUP.old-EDTA-whole-content.review.json','91107da54596fab52c12fa69f643c818b538758cf2e75cdc91f8c6538e049617'),
 'T05selectionV2':(T/'T05-changed-temperature-qualitative-material-author-successor-root-v2/REVIEW-INPUT.clean-unchanged-two-owners-plus-changed-temperature-material.json','0fb419523cf43784717c598c6289ba42670e65947b1ce439552d214a54d1e885')
}
manifest={}
for key,(src,expected) in P.items():
 src=Path(src);assert sha(src)==expected,(key,sha(src),expected)
 dest=C/'candidate-inputs/current-P35'/key/src.name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
 manifest[key]={**pin(src),'copiedRelative':str(dest.relative_to(C)),'copiedSHA256':sha(dest)}
rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';shutil.copyfile(P['C650'][0],C/rel)
views=json.loads(Path(P['views39'][0]).read_text());assert len(views)==39
oldbyid={json.loads(p.read_text())['viewId']:p for p in (C/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json')}
assert {v['viewId'] for v in views}==set(oldbyid)
for v in views:oldbyid[v['viewId']].write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
originalMeta=json.loads((S/'candidate-inputs/BINDER.inputs.json').read_text());(C/'candidate-inputs/current-P35/original-L7-BINDER.inputs.archived.json').write_text(json.dumps(originalMeta,indent=2)+'\n')
archive=O/'archives';archive.mkdir()
for key in ['P439','baselineM439','currentAdditiveM439','card79','SEM641']:
 src=Path(originalMeta[key]);dest=archive/(key+'.exact-original-source'+src.suffix);shutil.copyfile(src,dest)
 manifest[key]={**pin(src),'copiedRelative':str(dest),'copiedSHA256':sha(dest)}
oldOut=S/originalMeta['outputsRelative']
for name in ['P9.current-accepted-profiles.ai-candidate.jsonl','P9.current-bound.candidate.config.json','SEM650.current-source-kinds.candidate.json','M439.current439-with-accepted11-successors.candidate.jsonl','cards80.current-with-five-successors.candidate.jsonl','PROVENANCE.current-successors-and-archived-science.json']:
 src=oldOut/name;dest=archive/name;shutil.copyfile(src,dest);manifest['L7:'+name]={**pin(src),'copiedRelative':str(dest),'copiedSHA256':sha(dest)}
meta={'physicalRoot':str(C),'outerRoot':str(O),'sourceL7RootReadOnly':str(S),'canonicalRelative':rel,'outputsRelative':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-P35-and-SEM-inactive-technical-candidate-v1','inputs':manifest,'scopeBoundary':'Technical bindings to exact paired current C650 only. 18 placements and five deeper scope cases remain open; no scientific re-vote, final route pass, native/central/APV/build/full M gate, human or M7 claim.'}
(C/'candidate-inputs/CURRENT-BINDER.inputs.json').write_text(json.dumps(meta,indent=2)+'\n')
# Every writable destination is a private file, without a source inode alias.
assert (S/rel).resolve()!=(C/rel).resolve();assert (C/rel).stat().st_nlink==1
(O/'GUARD.physical-capsule-and-input-pins.before.json').write_text(json.dumps({'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalRoot':str(C),'sourceCanonicalReadOnly':pin(S/rel),'newCanonical':pin(C/rel),'inputPins':manifest,'copyMethod':'shutil.copytree(copy_function=shutil.copyfile), no hardlinks; only shared node_modules symlink','nodeModulesRealPath':str((C/'app/node_modules').resolve()),'newCanonicalNlink':(C/rel).stat().st_nlink},indent=2)+'\n')
print(json.dumps({'physicalRoot':str(C),'canonicalSHA256':sha(C/rel),'inputCount':len(manifest),'viewCount':len(views),'sourceL7CanonicalSHA256':sha(S/rel)}))
