from pathlib import Path
import json,hashlib,shutil,os,datetime
B=Path('/mnt/e/skillpilot-chemie-L7-20261017');R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/chemie-m7-resumed-20261016';O=B/'current650-twenty-foundations-targeted-P-SEM-bindings-technical-b-v1';S=B/'current650-P35-SEM-candidate-bindings-independent-b-v1/capsule';C=O/'capsule'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'physicalPath':str(p.resolve()),'sha256':sha(p),'bytes':p.stat().st_size}
sourceSelector=S.parent/'SELECTOR.inactive-current650-P439-SEM-technical-candidate.json';assert sha(sourceSelector)=='e512a540d03d3269614b30fe091267cbfbf4d3c8f6c03dff2158b23405fd12af'
shutil.copytree(S,C,symlinks=True,copy_function=shutil.copyfile,ignore=lambda p,n:['node_modules'] if Path(p)==S/'app' else [])
os.symlink(S/'app/node_modules',C/'app/node_modules',target_is_directory=True)
P={
'newCanonical':(B/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json','48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd'),
'newViews':(B/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.whole39views.paired48-plus20-foundations.private.json','f3989d39a8096f160de40c35b81281054cbe06012626a227439a7f5895bfd9ac'),
'rootReceipt20':(B/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/RECEIPT.actual-paired-two-BW-teachers-and-coordinate-priors.json','ab9e53fb688c001bd7756b6f369231946f9230fc5ebc60583b716c4485b2de82'),
'input2BW':(B/'two-BW-data-teachers-and-coordinate-model-priors-author-root-v1/REVIEW-INPUT.clean-two-BW-data-targets-and-coordinate-prior-replacement.json','80aa31d251c4bb540cd27b27f1172543dedbf7df934f5c76eb94422421205bc5'),
'science2BWA':(B/'two-BW-and-coordinate-priors-independent-a-v1/FIRST.independent-a.json','80a18b2e39d54344799cab32525ebc92726e6e5553a9b0def5b133a3e9fb3d79'),
'science2BWB':(B/'two-BW-and-coordinate-priors-independent-b-v1/FIRST.review.json','bb2e2e548e5ae5bcef3571d18a7b67bde87c6b48f3c75300c7d0961106f55a3a'),
'input18':(T/'eight-Mol-eight-Memory-and-two-EDTA-foundations-author-v1/REVIEW-INPUT.clean-eighteen-existing-targets-whole-content-and-primary-boundaries.json','d389a6b76c8f63f939fa4dda167f48997fc273d9f2f335b60b7ea7b74f661b3f'),
'science18A':(B/'eighteen-foundations-independent-a-v1/FIRST.independent-a.json','eec5e22f849c8abd2fc763134794359b260978abb7b4b5ab8fcbed6e84bf88c8'),
'science18B':(B/'eighteen-foundations-independent-b-v1/FIRST.review.json','3962df021f90d29838dcaa97d996233d29da36f34459227456aeaa697f7e31e9'),
'oldSelector':(sourceSelector,'e512a540d03d3269614b30fe091267cbfbf4d3c8f6c03dff2158b23405fd12af')}
oldMeta=json.load(open(S/'candidate-inputs/CURRENT-BINDER.inputs.json'));oldOut=S/oldMeta['outputsRelative'];oldCas=json.load(open(S.parent/'CAS.current650-P439-SEM-and-unchanged-Memory-technical-candidate.json'))
for key in ['SEM650','mergedP439','namespaceIndex','actualStockPChecks','unchangedMemoryCardSelectorChecks','result']:
 x=oldCas[key];P['old:'+key]=(Path(x['path']),x['sha256'])
canonicalRel=oldMeta['canonicalRelative'];P['old:canonical']=(S/canonicalRel,'e95b2c1a8fd6d4f500598157ea0ae1c3f35b3c8932e492461d377de2824bdcb8')
manifest={}
for key,(src,expected) in P.items():
 assert sha(src)==expected,(key,sha(src));d=C/'candidate-inputs/twenty-targeted-successor'/key.replace(':','_')/src.name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,d);manifest[key]={**pin(src),'copyRelative':str(d.relative_to(C)),'copySHA256':sha(d)}
# Preserve before views inside the new physical root for actual stock before/after reads.
oldViews=[]
for p in (S/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json'):
 v=json.load(open(p));d=C/'candidate-inputs/twenty-targeted-successor/before-views'/p.name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,d);oldViews.append({'viewId':v['viewId'],'copyRelative':str(d.relative_to(C)),'sourcePin':pin(p)})
views=json.load(open(P['newViews'][0]));assert len(oldViews)==len(views)==39;paths={x['viewId']:C/'curricula/DE/Gymnasium/composition-views/chemie'/Path(x['copyRelative']).name for x in oldViews}
for v in views:paths[v['viewId']].write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
shutil.copyfile(P['newCanonical'][0],C/canonicalRel)
# Store complete original namespace configuration bodies in new metadata, with their
# sources inside this private copy; original bytes/records stay in copied old output.
ns=json.load(open(P['old:namespaceIndex'][0]));namespaceConfigs=[]
for x in ns['fragments']:
 config=json.load(open(S/x['configRelative']));namespaceConfigs.append({**x,'wholeBeforeConfig':config})
meta={'physicalRoot':str(C),'outerRoot':str(O),'sourcePreviousRoot':str(S),'oldOutputsRelative':oldMeta['outputsRelative'],'outputsRelative':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-twenty-foundations-targeted-successor-v1','canonicalRelative':canonicalRel,'inputs':manifest,'before39ViewCopies':oldViews,'wholeOriginal112CurrentNamespaceConfigs':namespaceConfigs,'boundary':'Technical only. P bodies/images/cards/mappings unchanged; no new Science, full M/native/APV/build/central/Human/M7 claim. BW266 remains prerequisiteOnly.'}
(C/'candidate-inputs/TWENTY-SUCCESSOR.inputs.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
(O/'GUARD.physical-copy-and-exact-inputs.before.json').write_text(json.dumps({'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputs':manifest,'physicalRoot':str(C),'sourcePreviousCanonical':pin(S/canonicalRel),'newCanonical':pin(C/canonicalRel),'copyMethod':'independent copyfile, no source inode aliases; only node_modules symlink','newCanonicalNlink':(C/canonicalRel).stat().st_nlink},indent=2)+'\n')
print(json.dumps({'physicalRoot':str(C),'canonical':sha(C/canonicalRel),'viewCount':39,'originalNamespaces':len(namespaceConfigs),'sourcePreviousCanonical':sha(S/canonicalRel)}))
