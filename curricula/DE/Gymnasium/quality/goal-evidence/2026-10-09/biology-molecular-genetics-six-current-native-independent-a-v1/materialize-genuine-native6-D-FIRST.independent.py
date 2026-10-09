import pathlib, json, hashlib, datetime, runpy, copy
from bs4 import BeautifulSoup
import fitz
from PIL import Image
import numpy as np

B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
A=B/'biologie-molecular-genetics-six-current-native-successor-preparation-author-v1'
D=B/'biology-molecular-genetics-six-current-native-independent-a-v1'
OLD=B/'biology-molecular-genetics-twenty-three-native-independent-a-v1'
V=B/'biology-molecular-genetics-six-targeted-phone-population-independent-v-a-v1'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(pathlib.Path(p).read_text())
def bind(p):
 p=pathlib.Path(p);r=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(r).hexdigest(),'bytes':len(r)}
def write(n,o):
 p=D/n;assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return bind(p)
e=read(A/'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json')
c=read(A/'native-six/round-a/description-review-campaign.json');inputs=read(A/'native-six/round-a/description-review-input.json')
chains=runpy.run_path(str(OLD/'own-D23-understanding-chains.independent.py'))['chains']
ordById={r['goalId']:r['ordinal'] for r in read(V/'six-selected-actual-raster-input.before-own-pixels.independent-A.json')['rows']}
specific={
10:'Der kurze DE-/EN-Text verknüpft Proteinaufgaben, Genwirkkette und Unterbrechungsfolgen fachlich gleichwertig. Die tatsächlich gesehene native Seite zeigt die Enzymkette S→I→P mit fehlendem E2 und gut lesbarem I ersetzt kein E2. Der alternative Zuführungsfall verlangt begründete Blockadestellenanalyse; Zugeben von I darf bei fehlendem E2 keine Wiederherstellung behaupten. Die Kompetenz bleibt die Erklärung dieser funktionellen Gen-Protein-Merkmalsbeziehung.',
11:'DE und EN verbinden dieselbe Genregulation mit verschiedenen Zellmerkmalen trotz gleicher DNA, Umweltanpassung und Entwicklung/Spezialisierung. Die aktuelle native Seite zeigt ein einzelnes betrachtetes Gen mit offenem/dichtem Chromatin, TF und Signal; diese Modellbegrenzung verhindert eine pauschale Aussage über sämtliche Gene oder Gesamtprotein aller Zelltypen. Alle wesentlichen Labels sind sichtbar; vorgegebene Mechanismen sollen vom Lernenden kausal erklärt und auf neue regulatorische Bedingungen übertragen werden.',
12:'DE und EN verlangen denselben Vergleich von natürlicher Replikation und PCR einschließlich technischer Probleme/Lösungen sowie Bedeutung natürlicher Reparaturenzyme. Die tatsächlich gesehene native Seite zeigt drei klar lesbare Modellspalten; Reparatur bleibt ausdrücklich Teil dieses EA-Ziels. Die großen Beispieltemperaturen ersetzen kein Laborprotokoll und behaupten keine universellen Verfahrenswerte. Vergleich und veränderter Primer-/Reparaturfall gehören zum kausalen Prozessvergleich, ohne eine zusätzliche praktische Durchführungspflicht zu erfinden.',
14:'Die unveränderten DE-/EN-Texte verlangen Ablauf der Meiose bei unterschiedlichen Geschlechtern und Bedeutung für Fortpflanzung, nicht bloß Phasenbenennung. Auf der tatsächlichen nativen Seite stimmen Homologentrennung, Schwestertrennung und vier linke versus Eizelle/Polkörper rechts; der zuvor beanstandete zusätzliche Rot→Blau-Pfeil fehlt. Gleich große Zwischenkreise bleiben schematische Icons, keine Messung des Cytoplasmavolumens. Die gebundene Caption begrenzt weiblichen Endzustand und mögliche drei Polkörper sachlich. Keine Quellen-/Kursvollständigkeit wird aus diesen Icons abgeleitet.',
15:'Die DE-/EN-Beschreibung selbst ist klar und gleichwertig: Rekombination, vorhandene Allelkombinationen und bedingter Beitrag zu vergangener/zukünftiger Biodiversität. Die tatsächlich gesehene native PDF-Seite6 enthält jedoch den exakt gebundenen fehlerhaften Marker: innere blau-obere/rot-distale Chromatide unten orange statt mit dem roten Abschnitt übertragenem Grün; die mittlere Stufe hat1grün/3orange statt2/2. Dies widerspricht reziprokem Austausch und Allelerhaltung. Nach dem Biologie-Kriterium zum Widerspruch von Lernzielbild und Ziel ist der aktuelle native Rahmen blockiert. Kein Austausch des richtigen kurzen Zieltextes kann den Rasterdefekt beheben. Eigenes V6-FIRST BIO23-V6-A-001 und nachgelagerte falsche Rekonstruktion META-001 bleiben getrennt versiegelt.',
16:'DE und EN umfassen gleichwertig karyogrammbasierte Genommutationstypen, mehrere Organisationsebenen und die Trennung Genotyp/Phänotyp/Krankheit. Die tatsächlich gesehene native Seite unterscheidet eine zusätzliche Chromosomentypkopie von drei ganzen Sätzen mit korrekten2→3 beziehungsweise2n→3n-Zahlen. Die Drei-Typen-Abstraktion und gepunktete Krankheitsfrage begrenzen den Schluss; weder vollständiges menschliches Karyogramm noch Diagnose wird behauptet. Die Erklärung an einem neuen Organismus muss diese Evidenzgrenzen erhalten.'}
html=BeautifulSoup(pathlib.Path(e['actualNativeHTML']['path']).read_text(),'html.parser')
pdf=fitz.open(e['actualNativePDF']['path'])
renderManifest=read(A/'native-six/book.pdf.render-manifest.json')
byPage={p['goalId']:p for p in e['pageMap']}
records=[];judgments=[];bindings=[]
for g in inputs['goals']:
 gid=g['goalId'];n=ordById[gid];p=byPage[gid];article=html.find('article',attrs={'data-goal-id':gid});img=article.find('img');visual=g['reviewContext']['page']['visualization']
 assert img['alt']==visual['altText'] and img['src']==visual['url']
 raster=next(r for r in e['rasterBindings'] if r['goalId']==gid)
 original=pathlib.Path(raster['actualOriginalImage']['path']);alias=pathlib.Path(raster['portableAlias']['path'])
 assert original.read_bytes()==alias.read_bytes()
 # The existing renderer makes a lossy1600x900 WebP print derivative.
 # Actual selected source/alias bytes are exact; embedded PDF pixels are not byte-exact PNG originals.
 page=pdf[p['physicalPage']-1];sourceImage=Image.open(original).convert('RGB');match=False;diagnostic=None
 manifestAsset=next(x for x in renderManifest['assets'] if x['publicPath']==visual['url'])
 assert manifestAsset['sourceSha256']==bind(original)['sha256']
 for info in page.get_images(full=True):
  pix=fitz.Pixmap(pdf,info[0]);decoded=Image.frombytes('RGB',[pix.width,pix.height],pix.samples) if pix.n==3 else None
  if decoded and decoded.size==(manifestAsset['renderedWidth'],manifestAsset['renderedHeight']):
   ref=sourceImage.resize(decoded.size,Image.Resampling.LANCZOS);delta=np.abs(np.asarray(decoded,dtype=np.float32)-np.asarray(ref,dtype=np.float32))
   diagnostic={'actualEmbeddedDimensions':list(decoded.size),'comparison':'RGB absolute error against proportional LANCZOS source resize; diagnostic only, not exact bytes or replacement for actual page sight','meanAbsoluteChannelError255Scale':float(delta.mean()),'channelFractionWithErrorAbove30':float(np.mean(delta>30))}
   match=True
 assert match, f'{gid} print derivative dimensions missing'
 bindings.append({'ordinal':n,'goalId':gid,'physicalPDFPage':p['physicalPage'],'actualWholePageRenderSeen':bind(D/f"actual-native-extracts/physical-page-{p['physicalPage']}.actual-render.png"),'actualPDFImagePixelsExactSelected':False,'actualPDFPrintDerivativeManifest':manifestAsset,'actualEmbeddedPrintDerivativeDiagnostic':diagnostic,'actualSelectedSourceToManifestSHAExact':True,'actualSelectedRaster':bind(original),'actualPortableAlias':bind(alias),'actualHTMLImageAltExact':True,'actualHTMLImageURLExact':True,'titleDescriptionClipped':False,'imageClipped':False,'scopeAndPrerequisiteTextReadable':True})
 chain=chains[n]
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':'bio23-native6-a-actual-review-v1.'+gid,'runId':'bio23-native6-a-actual-review-v1','campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest']}
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:r[k]=g[k]
 r.update({'decision':'block' if n==15 else 'keep','understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],chain)),'rationale':specific[n]+' Der getrennte aktuelle P23-Kontext bleibt Gegenstand der P-Prüfung; im gebundenen D-Input ist evidenceProfile:null, deshalb lautet die lokale Profil-Empfehlung create ohne Behauptung eines tatsächlich fehlenden externen P-Profils. Rohe Länderlisten und unveränderte Geltungszeilen werden nicht als neue vollständige Source-/Course-Freigabe behandelt.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
 records.append(r)
 criterion=['exact-current-competence-source-limits','goal-specific-biological-mechanism','observation-model-explanation-distinction','investigation-support-boundaries-if-applicable','observable-feature-identification-if-applicable','learner-generated-meaningful-transfer','image-alt-source-do-not-contradict-goal','bilingual-equivalence-and-atomicity','effective-applicability-not-inferred','description-profile-layer-separation']
 judgments.append({'ordinal':n,'goalId':gid,'wholeCurrentDInputActuallyRead':g,'actualPDFPageSeen':bindings[-1],'actualWholeHTMLArticleTextActuallyRead':article.get_text('\n',strip=True),'normalRecord':r,'criteriaJudgments':[{'criterionId':k,'pass':False if n==15 and k=='image-alt-source-do-not-contradict-goal' else True,'notApplicableAsNewObligation':k in ['investigation-support-boundaries-if-applicable','observable-feature-identification-if-applicable'],'reason':specific[n] if k=='image-alt-source-do-not-contradict-goal' else 'Same complete bilingual competence and canonical/prerequisite/successor context checked; bounded mechanism/model/independent-transfer chain above supplies goal-specific evidence. No extra practical, species-identification, source-course or per-case quota is invented.'} for k in criterion]})
rp=D/'native-six-description.actual-FIRST.independent-A.records.jsonl';assert not rp.exists();rp.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
first=write('native-six-description.actual-FIRST.independent-A.verdict.json',{'schemaVersion':1,'role':'Genuine targeted current Native6 D first review with all6 actual PDF pages seen','firstJudgmentAt':now,'actualInputFirst':bind(D/'native-six-targeted.actual-input.FIRST.independent-A.freeze.json'),'actualNeutralNativeEntry':bind(A/'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json'),'normalRoundACampaign':bind(A/'native-six/round-a/description-review-campaign.json'),'perGoalJudgments':judgments,'normalFirstRecords':bind(rp),'actualPDFPagesSeen':[3,4,5,6,7,8],'wholeSixHTMLArticlesActuallyRead':True,'wholeSixCurrentDEENInputsActuallyRead':True,'ownHistoricalNative23ScienceReadingsReuse':True,'ownEarlierChainsReusedAfterActualCurrentCompetenceCheck':True,'ownCurrentV6FindingsSeparateLaneKnown':True,'technicalAttemptDisclosure':'Initial helper incorrectly assumed embedded PDF raster pixels had original PNG dimensions; stopped before any record/verdict/seal write. Actual existing chromium-canvas-v1 print policy caps1600px and uses WebP0.9. Manifest, actual embedded dimensions and resized comparison inspected; no original-PNG pixel-exact claim for PDF print derivative. All6 actual pages were individually seen before this FIRST.','freshPeerNativeDResultsRead':False,'freshPeerPResultsRead':False,'freshPeerCurrentV6ResultsRead':False,'authorInspectionLabelsRead':False,'keepGoalIds':[r['goalId'] for r in records if r['decision']=='keep'],'blockGoalIds':[r['goalId'] for r in records if r['decision']=='block'],'descriptionTextChangesProposed':False,'currentV23Approved':False,'wholeSourceCourseApproved':False,'humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0})
seal=write('native-six-description.actual-FIRST.independent-A.freeze.json',{'schemaVersion':1,'role':'Immutable independent actual current Native6 D FIRST before fresh peers','createdAt':now,'firstVerdict':first,'normalFirstRecords':bind(rp),'ownInputFirst':bind(D/'native-six-targeted.actual-input.FIRST.independent-A.freeze.json'),'actualPageAndSelectedRasterBindings':bindings,'freshPeerDRead':False,'humanApproval':False,'activeWrites':[]})
print(json.dumps({'first':first,'seal':seal},indent=2))
