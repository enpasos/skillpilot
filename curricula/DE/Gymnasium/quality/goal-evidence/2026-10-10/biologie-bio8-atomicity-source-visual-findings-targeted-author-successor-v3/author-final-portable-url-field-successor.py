# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,shutil,collections,datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');P=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3';N=B/'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1';A=B/'biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1';V2=B/'biologie-biotechnologie-evolution-eight-medicine-transfer-targeted-author-successor-v2';C=R/'tmp/m7-bio8-findings-v3-author-isolated-capsule'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,o):
 f=R/P/p;assert not f.exists();f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return ref(f.relative_to(R))
prs=[json.loads(l)for l in(R/P/'positive/ten-final-fossil-image-author.pending.review.jsonl').read_text().splitlines()]
profiles=[{'goalId':r['goalId'],'wholeProfile':ref(P/'final/profiles'/f'{r["goalId"]}.whole-current-profile.json'),'wholeTwoCases':ref(P/'materials'/f'{r["goalId"]}.whole-two-cases.json'),'profileFingerprint':r['profileFingerprint'],'reviewInputFingerprint':r['reviewInputFingerprint'],'independentP':'PENDING_or_retained_medicine_V2_pair_not_reapproved'}for r in prs]
# Standalone portable HTML copy: only public image locators are redirected to
# exact regular byte copies. Normal renderer HTML stays untouched.
bundle=P/'native/nineteen-final-current-native/bundle';model=read(bundle/'book-model.json');html=(R/bundle/'book.html').read_text();assetrows=[]
for p in model['pages']:
 v=p['visualization']
 if v:
  url=v['url'];src=C/('app/public'+url);dst=bundle/'asset-copies'/f'{p["goalId"]}.png';(R/dst).parent.mkdir(exist_ok=True);assert not(R/dst).exists();shutil.copyfile(src,R/dst);html=html.replace(url,'asset-copies/'+dst.name);assetrows.append({'goalId':p['goalId'],'originalPublicURL':url,'actualPortableExactPNG':ref(dst)})
assert len(assetrows)==18
(R/bundle/'book.portable.actual.html').write_text(html)
put('native/final19-portable-HTML-and-regular-exact-assets.author.json',{'normalHTMLRetainedExact':ref(bundle/'book.html'),'portableHTML':ref(bundle/'book.portable.actual.html'),'exactImageCopies':assetrows,'onlyPublicImageLocatorsReplaced':True,'standalonePDF':ref(bundle/'book.pdf'),'humanOrIndependentApproval':False})
# Make final-source output alias requirements explicit, without requiring caches.
at=read(P/'sources/final-fossil-image-book-local-atlas.normal.config.json');files=[]
for f in sorted((R/P/'sources/final-normal-output').iterdir()):files.append(ref(f.relative_to(R)))
put('sources/final24-normal-output-portable-bindings.author.json',{'normalGeneratedFilesExact':files,'normalBookLocalOutputDirectoryDiagnosticOnly':at['outputDirectory'],'actualNormalSourceBuildCheckPassed':True,'allActualPrimaryCopies':ref(P/'sources/all-actual-portable-primary-bindings.json'),'cachedSnapshotAliasesAreMetadataOnly':True,'sourceCourseApproval':False})
put('images/actual-final-original-360-680-author-view-observations.json',{'actuallyViewedFinalOriginalPNGs':6,'actuallyViewedNew360BrowserCaptures':6,'actuallyViewedNew680BrowserCaptures':6,'actuallyViewedRetainedOriginal360':6,'actuallyViewedRetainedOriginal680':6,'retainedOriginalCount':6,'targetedExistingReplacements':['4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf','430b2b73-641a-5122-bb6d-162b0d1eaf2d'],'observationsDe':{'4a':'Außen gelb/navy getrennte Wand und innen separate navy Membran; tatsächliche Pfeilspitzen unterscheidbar. Die übrigen Vermehrungs-/Stoffwechselpanels bleiben erhalten.','430':'Kulturblock entfernt; datierbare Fossilmerkmale, begrenzte verzweigte Rekonstruktion und revidierbare Hypothesen zeigen dieselbe Fossilinferenzkompetenz.','restriction':'Sequenzspezifische Stelle gegenüber unpassender Stelle; Fragmententstehung als einzelnes kausales Produkt.','expression':'Vorhandene DNA kann ohne passenden Promotor nicht exprimiert werden; ein Kompatibilitätsprodukt mit mRNA/Protein-Weg.','culture':'Gelerntes weitergegebenes Wissen, Landwirtschaft und aktuelle Nahrung-/Habitatfolgen; kein biologisches Vererbungsbild.','behavior':'Auslöser, konkrete Reaktion und mögliche Schutzfunktion mit gemeinsamer Abstammung und deutlicher Hypothesengrenze.'},'actualWholeNativePDFPagesViewed':['8eb86a82-122d-5cae-8f80-bb2850b29c2f','430b2b73-641a-5122-bb6d-162b0d1eaf2d','7d2da9ab-aed0-562b-a99a-840825fca009'],'authorVisualApproval':False,'independentV':'PENDING'})
put('final/ten-whole-current-P-profile-material-bindings.json',{'records':profiles,'wholeProfileCount':10,'wholeMaterialCases':20,'PApproved':0,'authoringRoleOnly':True})
print(json.dumps({'whole483':483,'atomic396':396,'oldWholeObjectsExact':466,'protected353WholeQARowsExact':True,'fullD299With19SubstantiveInputs':True,'P10cases20':True,'portableNativeImages18':True,'independentApproval':False}))
