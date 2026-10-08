from pathlib import Path
import json,hashlib,datetime,subprocess
from PIL import Image,ImageChops
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent;AUTHOR=BASE/'biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2';OLD=BASE/'biologie-he-evolution-eighteen-final-raster-native-independent-b-20261008-v1';ORIGINAL=BASE/'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1';GID='7008979d-7890-5f7b-ad07-27b8bb597cbe'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def verify(x):
 p=ROOT/x['path'];assert p.is_file() and sha(p)==x['sha256'].removeprefix('sha256:') and p.stat().st_size==x['bytes'],str(p)
def write(n,x):
 with (OWN/n).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
first=AUTHOR/'one-cat-current392-targeted-native-author.first-followup-input.freeze.json';assert sha(first)=='102ebfbaa0f4aaaa08ee7d50270b7364c2077d6fa656d194ad4eebea7e510242';seal=read(first)
for x in seal['ownFiles']+[seal[k] for k in ['requiredPortableInputs','neutralEntry','originalEighteenFirstAuthorSeal','actualRootOneImageCorrectionManifest']]:verify(x)
required=read(ROOT/seal['requiredPortableInputs']['path'])
for x in required['requiredFiles']:verify(x)
for x in required['actualContainedRelativeAliases']:
 p=ROOT/x['path'];assert p.is_symlink() and p.exists() and p.resolve().is_relative_to(AUTHOR.resolve());assert p.readlink()==Path(x['containedRelativeTarget']);verify(x['target'])
assert not required['ignoredRequiredFiles'] and not required['brokenRequiredSymlinks']
for n,h in [('eighteen-current-D-P-V.independent-b.first.freeze.json','6d25d626664e9fd13665c70106f9d3f1cacb93c53dbd08159dac1cbafa31aa50'),('eighteen-current-D-P-V-independent-b.completed-with-one-HOLD.final.freeze.json','2f2d6f6c4fe399beb21eb0465c5b8e271b1fef805aab1bf195552b144a90ef93')]:
 p=OLD/n;assert sha(p)==h
 for x in read(p)['files']:verify(x)
pnew=AUTHOR/'positive/P18.only-one-current-PNG-rebound.seventeen-lines-exact.jsonl';pold=ORIGINAL/'positive/P18.current-whole.actual-raster-author.review.jsonl'
nl=pnew.read_text().splitlines();ol=pold.read_text().splitlines();assert len(nl)==len(ol)==18
new=[json.loads(x) for x in nl];old=[json.loads(x) for x in ol]
for n,o,a,b in zip(new,old,nl,ol):
 assert n['goalId']==o['goalId'] and n['profile']==o['profile']
 if n['goalId']!=GID:assert a==b
 else:assert n['goalFingerprint']==o['goalFingerprint'] and n['profileFingerprint']==o['profileFingerprint'] and n['reviewInputFingerprint']!=o['reviewInputFingerprint']
 assert n['status']=='needs_human_review' and n['reviewAuthority']=='ai_candidate' and n['evidenceLevel']=='E1' and n['maximumClaimScope']=='G1'
entry=read(ROOT/seal['neutralEntry']['path']);mapping=read(AUTHOR/'checks/one-cat-native-physical-renders-and-seventeen-body-preservation.actual.json');pixelproof=[]
for x in mapping['comparisons']:
 oldi=Image.open(ROOT/x['oldRenderPath']).convert('RGB');newi=Image.open(ROOT/x['newRenderPath']).convert('RGB');assert oldi.size==newi.size
 d=ImageChops.difference(oldi,newi);bbox=d.getbbox();body=ImageChops.difference(oldi.crop((0,0,oldi.width,1315)),newi.crop((0,0,newi.width,1315))).getbbox()
 if x['goalId']!=GID:assert body is None and bbox and bbox[1]>=1315
 else:assert body is not None
 pixelproof.append({'goalId':x['goalId'],'actualDifferenceBoundingBox':bbox,'bodyAboveFooterExact':body is None,'old':bind(ROOT/x['oldRenderPath']),'new':bind(ROOT/x['newRenderPath'])})
q=AUTHOR/'native/eighteen-same-context/operative-target-only-follow-up-b';iq=read(q/'description-review-input.json');priorq=ORIGINAL/'native-eighteen-author/eighteen/round-b';ip=read(priorq/'description-review-input.json');assert len(iq['goals'])==len(ip['goals'])==18
for n,o in zip(iq['goals'],ip['goals']):
 assert n['goalId']==o['goalId']
 if n['goalId']!=GID:assert n==o
 else:
  assert n['canonicalContext']==o['canonicalContext'];assert all(n[k]==o[k] for k in ['goalFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'])
  np=n['reviewContext']['page'];op=o['reviewContext']['page'];assert [k for k in np if np[k]!=op[k]]==['visualization','pageFingerprint']
  assert {k:v for k,v in np['visualization'].items() if k!='originalDigest'}=={k:v for k,v in op['visualization'].items() if k!='originalDigest'}
width=read(ROOT/entry['actualTwoBrowserWidths']);assert width['sourceSha256']=='cae551e813945967b2dc9d889ab04517da989fcfa131d5b1911e431d27033758'
for x in width['captures']:assert sha(ROOT/x['path'])==x['sha256'] and x['width']==x['measured']['renderedWidth']
views=[ROOT/entry['correctedActualPNG']['path']]+[ROOT[x['path']] for x in width['captures']]+[AUTHOR/'native/one-targeted-followup/actual-physical-pages/actual-physical-page-3.png',AUTHOR/'native/eighteen-same-context/actual-physical-pages/actual-physical-page-06.png']
reason='KEEP nach echter gezielter Nachprüfung: Die Katzenvorderpfote besitzt nun vier deutlich getrennte Hauptfingerstrahlen mit Krallen und einen seitlichen, kürzeren ersten Finger mit zweigliedriger Reihe. Vier lang belastete Zehen plus seitlicher erster Finger geben den homologen fünfstrahligen Grundbauplan wieder; Handwurzel, Mittelhand und die zwei Unterarmknochen setzen kontinuierlich an. Mensch und Wal zeigen weiterhin ihren schematischen homologen Grundbauplan. Im tatsächlichen Original und bei360/680 sind die vier Hauptstrahlen und der seitliche erste Finger erkennbar; die Homologie-Farbcodierung und das Fossilmotiv tragen ohne lesepflichtige Schrift. Freundlicher Comicstil, Originalformat1672x941 und ganze Darstellung bleiben erhalten. Keine invasive Neugestaltung. Ganze native phys3-Helferseite sowie phys6 im ursprünglichen18-Kontext enthalten die identische aktuelle volle UUID/DE-Beschreibung und das korrigierte Bild ohne Beschnitt. Keine falsche Handlungsperspektive. Der frühere echte V-HOLD mit nur drei Fingern bleibt historisch wahr, ist am neuen Rasterstand durch diesen eigenen Befund fachlich aufgelöst, nicht durch einen Peer-KEEP oder eine bloße Digeständerung.'
write('one-cat-current-actual-PNG-two-widths-two-whole-native-pages.independent-b.first.verdict.json',{'schemaVersion':1,'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalId':GID,'targetedDDecision':'KEEP retained valid whole text; actual new page contexts checked','targetedPDecision':'KEEP retained whole two bilingual cases/profile; new PNG binding checked, native schema/API next','targetedVDecision':'KEEP','originalOwnVHoldResolvedAtNewRasterOnly':True,'actualReasonDe':reason,'wholeOriginalPNGAndActual360680AndNative3And6ActuallyViewed':True,'actualViews':[bind(x) for x in views],'actualHelperOnePageFingerprint':'sha256:fed93410a16261239304ab60b463267b7dde433d6f2e5d62060848b0640662ba','actualOriginal18PageFingerprint':'sha256:3a09a8eb8cd3ff0f7709c0122a5682abbccdaff3695cbb706249a4359b50fbf6','distinctContextsNeverSilentlyAdopted':True,'currentPeerV2ReviewRead':False,'generationOrHashMatchIsApproval':False,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','fullAppOrRealDeviceAcceptanceClaim':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
write('one-cat-exact-preservation-and-current-resource-bindings.independent-b.actual.json',{'authorFirstSeal':bind(first),'authorFilesVerified':len(seal['ownFiles']),'requiredPortableFilesVerified':len(required['requiredFiles']),'containedAliasCountVerified':len(required['actualContainedRelativeAliases']),'ownOriginal18FirstAndFinalSealsUnchanged':True,'other17WholePRecordLinesByteExact':True,'whole18ProfileBodiesExact':True,'other17NativeWholeInputsExact':True,'targetOnlyNativeFieldsChanged':['visualization.originalDigest','pageFingerprint'],'independentActualBodyPixelComparisons':pixelproof,'currentSourceMeaningRetained':'Own genuine whole18 and sourcev3 science;15 bounded operationalizations +3 explicitly nonmandatory models; full144 NeuroGK2 HOLD retained. No new universal source approval.','nativeD1PendingNewActualFirstPassCampaign':True,'ordinaryPCLIPendingInstallation':True,'noFakeOther17Runs':True,'reviewAuthority':'ai_candidate','status':'needs_human_review','activeWrites':0,'strictGain':0,'humanApproval':False})
files=[bind(x) for x in sorted(OWN.rglob('*')) if x.is_file()]
write('one-cat-actual-current-P-V-and-page-observations.independent-b.first.freeze.json',{'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'Genuine independent B first targeted corrected-raster observation before current peer review; native D1/P next','files':files,'authorFirstSeal':bind(first),'originalOwn18FirstSeal':bind(OLD/'eighteen-current-D-P-V.independent-b.first.freeze.json'),'originalOwn18FinalWithTrueHOLD':bind(OLD/'eighteen-current-D-P-V-independent-b.completed-with-one-HOLD.final.freeze.json'),'targetedVKEEP':1,'other17GenuineOwnOriginalKEEPExact':True,'nativeD1PendingNewActualCampaign':True,'currentPeerReviewRead':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
f=OWN/'one-cat-actual-current-P-V-and-page-observations.independent-b.first.freeze.json';print(json.dumps({'seal':str(f),'sha256':sha(f),'V1KEEP':1,'verifiedPortable':len(required['requiredFiles'])}))
