from pathlib import Path
import json,hashlib,shutil,os,datetime
B=Path('/mnt/e/skillpilot-chemie-L7-20261017');O=B/'current650-post20-P439-SEM-paired-context-final-technical-b-v1';S=B/'current650-twenty-foundations-targeted-P-SEM-bindings-technical-b-v1/capsule';C=O/'capsule'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'physicalPath':str(p.resolve()),'sha256':sha(p),'bytes':p.stat().st_size}
oldSelector=S.parent/'SELECTOR.OPEN-draft-targeted-successor-P363-pending-context-pair.json';assert sha(oldSelector)=='c00285f3da7b23e5c5110cb3ec3d3666e14f1beb0ded18fcd6b8a78124067ed0'
shutil.copytree(S,C,symlinks=True,copy_function=shutil.copyfile,ignore=lambda p,n:['node_modules'] if Path(p)==S/'app' else [])
os.symlink(S/'app/node_modules',C/'app/node_modules',target_is_directory=True)
mp=C/'candidate-inputs/TWENTY-SUCCESSOR.inputs.json';m=json.load(open(mp));oldmeta=json.loads(mp.read_text());m['physicalRoot']=str(C);m['outerRoot']=str(O);m['outputsRelative']='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-post20-final-363-one-record-technical-v1';m['sourceOpenDraftRoot']=str(S);m['sourceOpenDraftSelector']=pin(oldSelector);m['sourceOpenDraftCanonical']=pin(S/m['canonicalRelative']);assert m['sourceOpenDraftCanonical']['sha256']=='48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd';mp.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(C/'candidate-inputs/OPEN-DRAFT.TWENTY-SUCCESSOR.inputs.archived.json').write_text(json.dumps(oldmeta,ensure_ascii=False,indent=2)+'\n')
P=[
('cleanV2',B/'two-BW-and-coordinate-priors-current-P9-context-author-root-v2/REVIEW-INPUT.clean-same-two-components-with-current-P9-contexts.json','5f25f437528cf88525d2385f183edabbc1eb7608a8312fc5936e06171a622561'),
('A',B/'two-BW-and-coordinate-priors-current-P9-context-independent-a-v2/FOLLOWUP.independent-a.current-P9-context.json','be32cb82b44af227608e61d4ec12255127df3aafd0b967573c212402d09c76e5'),
('Aseal',B/'two-BW-and-coordinate-priors-current-P9-context-independent-a-v2/FOLLOWUP.seal.json','99ad95b60232ebe9332c954dbb8e5db6ba0ec59c5fd40d62cdbd5e8035d95be8'),
('B',B/'two-BW-and-coordinate-priors-current-P9-context-independent-b-v2/FOLLOWUP.review.json','e562434202f051e6d8adaf994394744ed4cda0b5ff764d81ee6992d5cc367e44'),
('Bseal',B/'two-BW-and-coordinate-priors-current-P9-context-independent-b-v2/FOLLOWUP.sha256.json','6d5962f4b29df1dd97fbea17d9a1c2dfc601e971d09a6347cd0635f7b8c92274')]
proofs=[]
for key,p,expected in P:
 assert sha(p)==expected,(key,sha(p));d=C/'candidate-inputs/accepted-current-context-v2'/key/p.name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,d);proofs.append({'key':key,**pin(p),'copyRelative':str(d.relative_to(C)),'copySHA256':sha(d)})
assert json.load(open(P[1][1]))['decision']=='KEEP' and json.load(open(P[3][1]))['decision']=='KEEP'
# The two supplied followups explicitly pin this same clean v2; no new vote.
write={'pairedScientificContextKEEP':True,'currentP9ProfilesPreserved':True,'acceptanceSource':'Root explicit current turn accepts both exact independently informed current-context KEEP followups','inputs':proofs,'scope':'Only own bounded BW/363 direct-prior finding under exact current P9 context; no32 new votes or whole9b/95dc reapproval','newScientificVotesBySerializer':0,'formalReviewRunIds':[]}
(C/'candidate-inputs/CONTEXT-FOLLOWUPS.accepted-pins.json').write_text(json.dumps(write,ensure_ascii=False,indent=2)+'\n')
(O/'cache').mkdir(exist_ok=True)
(O/'GUARD.final-successor-physical-copy-and-proof-inputs.before.json').write_text(json.dumps({'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalRoot':str(C),'sourceDraftSelector':pin(oldSelector),'sourceDraftCanonical':pin(S/m['canonicalRelative']),'newCanonical':pin(C/m['canonicalRelative']),'proofInputs':proofs,'onlySharedDependencySymlink':str((C/'app/node_modules').resolve()),'copyMethod':'Independent copyfile; no hardlinks; immutable OPEN draft preserved'},indent=2)+'\n')
print(json.dumps({'physicalRoot':str(C),'canonical':sha(C/m['canonicalRelative']),'acceptedConcreteProofCount':len(proofs),'oldDraftSelector':sha(oldSelector)}))
