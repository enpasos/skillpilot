# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,re,datetime,os,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');V=B/'biologie-stoffwechsel-eight-current-raster-native-technical-preparation-20261010-v2';A=B/'biologie-stoffwechsel-two-findings-remediation-author-20261010-v1';P=B/'biologie-stoffwechsel-eight-two-findings-current-raster-native-technical-successor-20261010-v3'
def read(p):return json.loads((R/p).read_text())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):f=R/P/p;b=json.dumps(x,ensure_ascii=False,indent=2)+'\n';f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists() or f.read_text()==b,f;f.write_text(b)
for n,fp in [('v2',V/'FINAL.current-raster-P8-native8.technical.freeze.json'),('twoAuthorCorrections',A/'FINAL.two-findings.author-candidates.freeze.json')]:
 s=read(fp);f=s['ownFiles']+s.get('requiredCurrentPortableFiles',s.get('requiredPortableFiles',[]));
 for x in f:assert ref(pathlib.Path(x['path']))==x,x['path']
 print(n,'frozenOwnAndRequiredVerified',len(f))
old=read(V/'native/eight-current-native/bundle/book-model.json');new=read(P/'native/eight-current-native/bundle/book-model.json');od=old['digest'];nd=new['digest'];oldhtml=(R/V/'native/eight-current-native/bundle/book.html').read_text();newhtml=(R/P/'native/eight-current-native/bundle/book.html').read_text()
def articles(s):
 out={}
 for art in re.findall(r'<article\b.*?</article>',s,re.S):
  g=re.search(r'data-goal-id="([^"]+)"',art).group(1);out[g]=art
 return out
before=articles(oldhtml);after=articles(newhtml);assert len(before)==len(after)==8;rows=[]
for g,x in before.items():
 y=after[g];normalized=y.replace(nd,od).replace(nd.replace(':','%3A'),od.replace(':','%3A'))
 onlyglobal=x==normalized
 if g not in ['e467ee54-7773-595f-ac1c-a60a5b7be2cf','8e2244e1-8616-5f24-859f-8e10df1c887b']:assert onlyglobal,g
 rows.append({'goalId':g,'wholeNativeArticleBeforeSHA256':'sha256:'+hashlib.sha256(x.encode()).hexdigest(),'wholeNativeArticleAfterSHA256':'sha256:'+hashlib.sha256(y.encode()).hexdigest(),'wholeNativeArticleRawBytesChanged':x!=y,'exactAfterReplacingOnlyGlobalBookDigest':onlyglobal,'actualVisibleGlobalFooterDigestChanged':True,'feedbackHrefBookDigestChanged':True,'learningGoalPageNumberUnchanged':re.search(r'data-page-number="([^"]+)"',x).group(1)==re.search(r'data-page-number="([^"]+)"',y).group(1)})
put('checks/actual-whole-native-HTML-article-delta-and-global-digest.json',{'schemaVersion':1,'beforeBookDigest':od,'afterBookDigest':nd,'records':rows,'allSixOtherWholeArticlesExactExceptGlobalBookDigest':True,'globalCause':'Ordinary native renderer writes the complete book model digest into every goal-page visible footer and feedback href. The two actual author input changes alter the complete book model digest, so all8rawHTML/PDFpage captures have changed hashes. Page numbers, total8, bookID/title and six other complete page models/contexts are exact; only their shared global digest changes in emitted article HTML. This is a byte-level textual article comparison, not a claim of independent visual approval or pixel equality.','nativeCaptureRecord':ref(P/'checks/actual-raw-native-capture-before-after-digests.json'),'normalRendererSource':ref(pathlib.Path('app/scripts/goalBookRenderer.ts')),'rendererVisibleFooterSourceLine':1134,'rendererFeedbackHrefSourceLine':578,'independentApproval':False})
portable=P/'native/portable-current-rasters/bundle/book.html';ph=(R/portable).read_text();bindings=read(P/'inputs/eight-current-raster-bindings.neutral.json')['records'];bound=[]
for r in bindings:
 expected=os.path.relpath(R/r['actualCurrentPNG']['path'],(R/portable).parent);assert ph.count(expected)==1;assert r['futurePublicURL'] not in ph;actual=(R/portable).parent/expected;assert ref(actual.resolve().relative_to(R))==r['actualCurrentPNG'];bound.append({'goalId':r['goalId'],'portableRelativeHTMLSource':expected,'originalPNG':r['actualCurrentPNG']})
put('checks/portable-native-html-current-original-bindings.actual.json',{'schemaVersion':1,'portableHTML':ref(portable),'actualEightOriginalBindings':bound,'relativeBindingCount':8,'publicURLCount':0,'symlinks':0,'requiredIgnoredPaths':[],'independentApproval':False})
put('checks/prior-v2-and-two-author-freezes-reverified.actual.json',{'schemaVersion':1,'v2Freeze':ref(V/'FINAL.current-raster-P8-native8.technical.freeze.json'),'v2OwnVerified':132,'v2RequiredVerified':228,'twoAuthorFreeze':ref(A/'FINAL.two-findings.author-candidates.freeze.json'),'authorOwnVerified':17,'authorRequiredVerified':7,'priorFreezeChanges':[],'scientificApproval':False})
print(json.dumps({'allSixArticlesExactExceptGlobalDigest':True,'portableOriginals':8,'readyForFinalEntryAndFreeze':True}))
