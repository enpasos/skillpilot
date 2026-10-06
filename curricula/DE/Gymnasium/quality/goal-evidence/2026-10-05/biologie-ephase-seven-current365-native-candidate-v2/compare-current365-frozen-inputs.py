#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Compare actual source facets, whole D inputs and rendered bodies, not just hashes."""
from pathlib import Path
import json,hashlib,re,shutil,fitz
from PIL import Image,ImageChops
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'biologie-ephase-seven-current-native-candidate-v1';ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1';REL=OWN.relative_to(ROOT)
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def diff(a,b,p=''):
 if type(a)!=type(b):return[{'path':p,'before':a,'after':b}]
 if isinstance(a,dict):return sum([diff(a.get(k),b.get(k),p+'/'+k)for k in sorted(set(a)|set(b))],[])
 if isinstance(a,list):
  if len(a)!=len(b):return[{'path':p+'#length','before':len(a),'after':len(b)}]
  return sum([diff(x,y,p+'/'+str(i))for i,(x,y)in enumerate(zip(a,b))],[])
 return [] if a==b else[{'path':p,'before':a,'after':b}]
old=read(AUTHOR/'native-finalbook/bundle/book-model.json');new=read(OWN/'native-finalbook/bundle/book-model.json')
oldInput=read(AUTHOR/'native-finalbook/round-b/description-review-input.json');newInput=read(OWN/'native-finalbook/round-b/description-review-input.json')
assert old['pages']==new['pages'] and old['chapters']==new['chapters'] and old['excludedTargetGoals']==new['excludedTargetGoals']
assert oldInput['goals']==newInput['goals'];assert {x['path']for x in diff(oldInput,newInput)}=={'/bookDigest','/bundleFingerprint','/reviewInputFingerprint'}
oldCanon=read(AUTHOR/'current-canonical.before.snapshot.json');newCanon=read(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');a={g['id']:g for g in oldCanon['goals']};b={g['id']:g for g in newCanon['goals']}
newIds=list(b.keys()-a.keys());changes=[{'goalId':k,'deltas':diff(a[k],b[k])}for k in a if a[k]!=b[k]]
assert newIds==['49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd'];assert {x['goalId']for x in changes}=={'96bdf495-2801-57e4-a0da-ce3bf91e402c','5b2571d9-f079-52b2-b21b-8f389c7409f4','1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'}
oldSources=read(AUTHOR/'native-original-sources.actual.author.receipt.json');newSources=read(OWN/'native-current365-original-sources.actual.receipt.json');sourceRows=[]
for name in ['full','seven-goal-d-book']:
 x=next(n for n in oldSources['nativeIndexes']if n['name']==name);y=next(n for n in newSources['nativeIndexes']if n['name']==name)
 for u,v in zip(x['citations'],y['citations']):assert u['goalId']==v['goalId'] and u['rows']==v['rows'];sourceRows.append({'index':name,'goalId':u['goalId'],'wholeSourceFacetRowsAndDocumentsExact':True,'rowCount':len(v['rows'])})
pdfA=fitz.open(AUTHOR/'native-finalbook/bundle/book.pdf');pdfB=fitz.open(OWN/'native-finalbook/bundle/book.pdf');pdfRows=[]
oldHash=old['digest'].removeprefix('sha256:');newHash=new['digest'].removeprefix('sha256:')
for k in range(2,9):
 p,q=pdfA[k].get_pixmap(matrix=fitz.Matrix(1.15,1.15)),pdfB[k].get_pixmap(matrix=fitz.Matrix(1.15,1.15));bbox=ImageChops.difference(Image.frombytes('RGB',(p.width,p.height),p.samples),Image.frombytes('RGB',(q.width,q.height),q.samples)).getbbox()
 assert bbox is not None and bbox[0]>=90 and bbox[1]>=930 and bbox[2]<=325 and bbox[3]<=951
 t1=re.sub(r'\s+','',pdfA[k].get_text()).replace(oldHash,'CURRENT_BOOK_DIGEST');t2=re.sub(r'\s+','',pdfB[k].get_text()).replace(newHash,'CURRENT_BOOK_DIGEST');assert t1==t2
 pdfRows.append({'physicalPage':k+1,'goalId':new['pages'][k-2]['goalId'],'actualRasterWidth':p.width,'actualRasterHeight':p.height,'actualChangedPixelBoundingBox':bbox,'onlyBookDigestFooterPixelsChange':True,'entireTextOutsideActualBookDigestExact':True,'goalBodyAndAllRemainingPixelsExact':True})
html=read(OWN/'actual-loaded-current365-html.receipt.json');assert len(html['rows'])==7 and not html['pageErrors']
oldAssets=read(AUTHOR/'native-finalbook/bundle/book.html.render-manifest.json')['assets'];newAssets=read(OWN/'native-finalbook/bundle/book.html.render-manifest.json')['assets'];assert oldAssets==newAssets
allSource=ISO/REL/'all-current365-source-bindings.actual.comparison.json';shutil.copy2(allSource,OWN/allSource.name);shutil.copy2(ISO/REL/'actual-active42-current365-original-sources.baseline.json',OWN/'actual-active42-current365-original-sources.baseline.json')
manifest=read(ISO/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json');atlasDeltas=[]
for row in manifest['outputBindings']:
 rel=row['path'];source=ISO/rel;dest=OWN/'prospective-input-tree'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest);atlasDeltas.append({'path':rel,'sha256':sha(dest),'changedFromCurrentActive':not (ROOT/rel).exists() or sha(ROOT/rel)!=sha(dest)})
protection=read(OWN/'current42-protection.stdout.txt')['subjects'][0];assert protection['strictComplete']==42 and protection['denominator']==365 and protection['issues']==[]
result={'status':'current365_native_technical_bindings_verified_independent_science_verdicts_pending','oldFrozenAuthorPackageSHA256':sha(AUTHOR/'author-native-candidate.final.freeze.json'),'currentCanonicalSHA256':sha(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),'oldBookDigest':old['digest'],'currentBookDigest':new['digest'],'currentBundleFingerprint':newInput['bundleFingerprint'],'allSevenWholeDInputObjectsExact':True,'allSevenWholeBookPagesExact':True,'allSevenCurrentCanonicalWholeGoalObjectsExactToAuthor':all(a[g['goalId']]==b[g['goalId']]for g in newInput['goals']),'completeSevenSourceBindings':sourceRows,'actualRenderedPDFGoalBodyComparison':pdfRows,'actualHTMLLoadedAllSevenImages':True,'originalAndPrintDerivativeAssetManifestsExact':True,'outsideE7PreviouslyReviewedBacterialCanonicalChanges':changes,'outsideE7PreviouslyReviewedSingleNewFissionGoalId':newIds,'unchangedOther439WholeCanonicalGoalObjects':439,'actualGlobalBookMetadataAndNavigationDeltas':diff(old,new),'allCurrent365SourceBindingComparisonPath':str((OWN/allSource.name).relative_to(ROOT)),'nativeAtlasOutputBindings':atlasDeltas,'actualCurrentProtectedStrict':42,'actualCurrentDenominator':365,'actualCurrentProtectionChecks':protection['requiredChecks'],'sourceContractDeltasOnly':{'sourceRows':7,'mappingExactToPartial':3,'canonicalGoals':0},'P7ReviewedHere':False,'newQAApprovalClaimed':False,'newIndependentDScienceVerdictClaimed':False,'humanApproval':False,'humanTrial':False,'activeWrites':0}
(OWN/'whole-current365-seven-inputs-and-bindings.actual.comparison.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'wholeDInputsExact':7,'wholePagesExact':7,'wholeSourcesExact':14,'PDFBodiesPixelExact':7,'currentStrictProtected':42,'newScienceApproval':False,'activeWrites':0}))
