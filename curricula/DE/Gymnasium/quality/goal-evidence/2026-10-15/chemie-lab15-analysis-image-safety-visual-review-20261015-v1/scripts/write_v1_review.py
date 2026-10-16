#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Serialize the actual informed machine V-FIRST findings; never creates an approval."""
import hashlib,json,os
from datetime import datetime,timezone
from pathlib import Path
from PIL import Image
ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
assert not (OUT/'FILES.finite-own-artifacts.seal.json').exists()
AUTHOR='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab15-analysis-image-safety-author-root-20261015-v1'
GOAL='cfa5c1e4-6714-5be7-9a57-a24b201b6231';stamp=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads((ROOT/p).read_text())
def write(p,d):(OUT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
original=read(AUTHOR+'/candidate/one-whole-goal.original.exact.json');candidate=read(AUTHOR+'/candidate/one-whole-goal.with-safety-image.author.json')
assert {k:v for k,v in original.items() if k!='resourceLinks'}=={k:v for k,v in candidate.items() if k!='resourceLinks'}
boundary=read(AUTHOR+'/INPUT.actual-original-and-correction-boundary.json');png=read(AUTHOR+'/checks/STOCK.import-and-whole-goal-CAS.actual.json')['generatedImage']
assert bind(boundary['original']['path'])==boundary['original']
assert {k:v for k,v in png.items() if k in ('path','sha256','bytes')}==bind(png['path'])
qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
old=next(r for r in read(qaPath)['records'] if r['goalId']==GOAL)
assert old['assetSha256']==boundary['original']['sha256']
write('history/old-JPG-QA-and-original-author-finding.exact.json',{
 'role':'Preserved historical exact record, not transferred to new PNG',
 'oldQaLedger':bind(qaPath),'wholeOldQaRecord':old,'oldJpg':boundary['original'],
 'oldHumanState':{k:v for k,v in old.items() if k.startswith('human')},
 'originalAuthorGogglesFinding':boundary,
 'actualClassification':'The supplied goggles finding is an informed root-author finding, not a human review. The active historical QA row contains no human approval or human NOK. No human finding is invented or deleted.',
 'oldReviewBytesRetained':True,'activeChanges':False})

# A one-whole-goal technical context is enough for V matching; it is not a stand-alone curriculum.
fragment={'landscapeId':old['landscapeId'],'title':'Chemie — one-goal exact V review input fragment',
 'goals':[candidate]}
write('review/one-whole-goal.V-input-fragment.json',fragment)
link=candidate['resourceLinks'][0]
record={**old,'title':candidate['title'],'description':candidate['description'],
 'landscapePath':REL+'/review/one-whole-goal.V-input-fragment.json',
 'imageUrl':link['url'],'publicAssetPath':'app/public'+link['url'],
 'canonicalAssetPath':'curricula/DE/Gymnasium/visualizations/chemie/'+GOAL+'/'+GOAL+'.png',
 'assetSha256':png['sha256'],'visualizationState':'available','missingReason':'',
 'umlautsCorrectChatGpt':'yes','contentApprovedChatGpt':'no',
 'chatGptReviewedAt':stamp,'chatGptReviewer':'Codex / informed machine V sighting',
 'chatGptNotes':'V-FIRST actual native/360/680 sighting: goggles corrected, but mobile fine labels and unqualified NaCl endpoint remain blocking. See bound V1 actual-visual-findings.',
 'humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','humanReviewedAt':None,'humanReviewer':'',
 'aiApproved':'no','aiApprovedAssetSha256':png['sha256'],'aiReviewedAt':stamp,
 'aiReviewer':'Codex / informed machine V sighting',
 'aiNotes':'REJECTED_REGENERATE V1 on actual PNG bytes. All three goggles are present. At360px reading-dependent chemical/result labels are too small; the unqualified arrow workflow claims sodium chloride identification without a chloride-specific observation. No D/P verdict, human approval or strict closure. Evidence: '+REL+'/review/V1.actual-visual-findings.json'}
write('review/QA.one-image.V1.machine-rejected.json',{
 'schemaVersion':1,'subject':'chemie','source':{'canonicalRoot':REL+'/review','publicAssetRoot':REL+'/sparse/app/public/assets/goal-visualizations',
  'role':'One-goal inactive QA component, actual negative V1 decision; not a whole-subject coverage report'},'records':[record]})

assets=[]
for label,path in [('original-native',boundary['original']['path']),('candidate-native',png['path']),
 ('candidate-360',AUTHOR+'/checks/ACTUAL.display-360.png'),('candidate-680',AUTHOR+'/checks/ACTUAL.display-680.png')]:
 with Image.open(ROOT/path) as im:dimensions=list(im.size);fmt=im.format
 assets.append({'view':label,'input':bind(path),'nativeFilePixels':dimensions,'format':fmt,
  'actualTool':'view_image','requestedDetail':'original','actuallyViewed':True,
  'displayDisclosure':'Original source opened; tool reported resizing2752x1536 to2048x1143 for delivery. All three unprotected faces and original layout were visible.' if label=='original-native' else 'Delivered at the complete exact native file/display-preview dimensions.'})
findings=[
 {'id':'V1-01','criterion':'Eye protection and visible laboratory safety','result':'pass-correction',
  'observed':'Original JPG shows three unprotected laboratory faces. PNG shows transparent goggles on all three depictions; both front faces have wrap-around coverage and side/strap detail, and the profile observer has a visible lens and strap. The flame-test person now has eye protection. Coats, short hair and hands remain visually plausible. No fictitious claim of a complete safe execution protocol is made.'},
 {'id':'V1-02','criterion':'Individual chemical labels and apparatus icons','result':'pass-with-orientation-limit',
  'observed':'Na+ next to a yellow flame is a plausible sodium-ion cue; Fe3+ charge notation is legible natively. Funnel/filter, mortar, balance and burette are recognizable method icons. The schematic apparatus is not a complete executable setup;15.2g and25mL are illustrative labels without a measured scale reading, concentration, uncertainty or completed analysis.'},
 {'id':'V1-03','criterion':'Actor and notebook perspective','result':'pass',
  'observed':'The recording actor stands to the notebook left and looks toward it; hand/pencil contact and turned pages are plausible cartoon perspective. Observer-facing headings are a normal infographic simplification. No mirrored person, reversed notebook operation or new goggle/hand artifact is visible.'},
 {'id':'V1-04','criterion':'Depiction, age fit and style preservation','result':'pass',
  'observed':'The friendly outlined comic style, blue/green panels, three preparation-analysis-documentation stages, sample handling and method symbols remain recognizable. The original is the actual existing style reference. No technical ID, provider watermark, copied worksheet or photographic style replacement is visible.'},
 {'id':'V1-05','criterion':'Actual360px card/mobile legibility','result':'blocking',
  'observed':'The three main stages and goggles are recognizable at360x201, but essential smaller chemical/result captions, superscripts, the quantitative detail and journal headings cannot be read reliably at that actual size. The densely packed text remains required to decode the specific illustrated chemical claims. Main workflow recognition alone does not meet the stated text-readability hard gate.',
  'evidenceView':'candidate-360','requiredRemediation':'Remove reading-dependent fine detail or substantially simplify the infographic so its required words and symbols are genuinely readable at360px; retain the three-step motif and correct goggles.'},
 {'id':'V1-06','criterion':'Actual680px desktop/card recognizability','result':'pass-main-labels-with-small-detail-limit',
  'observed':'At680x380 the workflow, goggles, flame, most main method labels and endpoint jars are readable and recognizable. Journal microtext is still small. This better desktop view does not remove the observed360px limitation.'},
 {'id':'V1-07','criterion':'Analytical conclusion represented by arrows and labels','result':'blocking',
  'observed':'The shared analysis panels show a sodium-ion flame-test cue, a positive-looking Fe3+ colour-test example, a mass label and a titration volume. Arrows lead to the unqualified endpoint identified pure substance: sodium chloride. No chloride-specific observation or expressly separate/conditional example routes are shown. A sodium cue alone does not establish chloride or pure NaCl; the Fe3+ example also is not marked as a different sample. This is a misleading specific conclusion in the image itself, even though individual method icons can be valid examples.',
  'inferenceBoundary':'The scientific ion-test distinction is established; judging that this particular unqualified arrow layout can teach an unsupported conclusion is this machine visual review judgment. This is not an invented learner result.',
  'requiredRemediation':'Use a limited, non-specific result such as documented findings/identification hypothesis, or explicitly distinguish complete supported example routes. Do not claim a specific identified compound from the shown evidence.'}]
write('review/V1.actual-visual-findings.json',{
 'schemaVersion':1,'license':'CC-BY-4.0','goalId':GOAL,'reviewedAtUTC':stamp,
 'role':'Actual informed machine visual V-FIRST review; not image authoring, independent D/P review, human approval or Human Trial',
 'provenanceDisclosure':{'author':'Root author used builtin OpenAI image generation to edit the existing JPG, adding goggles. Exact backend model version was not exposed.',
  'reviewer':'This reviewing agent did not generate or edit this image. It did author earlier laboratory assessment material and read the root author post-generation opinion, so the review is informed, not blinded.',
  'authorPostGenerationOpinion':bind(AUTHOR+'/checks/ACTUAL.author-native-mobile-desktop-inspection.json'),
  'actualPrompt':bind(AUTHOR+'/prompt.de.md'),'stockImportCAS':bind(AUTHOR+'/checks/STOCK.import-and-whole-goal-CAS.actual.json')},
 'wholeGoalOriginal':bind(AUTHOR+'/candidate/one-whole-goal.original.exact.json'),
 'wholeGoalCandidate':bind(AUTHOR+'/candidate/one-whole-goal.with-safety-image.author.json'),
 'allNonResourceFieldsExact':True,'actualImagesViewed':assets,'findings':findings,
 'externalScientificCrossCheck':[{'title':'Royal Society of Chemistry: testing salts for anions and cations','url':'https://edu.rsc.org/experiments/testing-salts-for-anions-and-cations/464.article',
  'readScope':'Search-index text actually returned; direct page open returned405. It distinguishes cation, anion and flame tests in identification of an unknown compound. No complete article read is claimed.'},
 {'title':'Royal Society of Chemistry: flame tests, wooden splint method','url':'https://edu.rsc.org/experiments/flame-tests-the-wooden-splint-method/759.article',
  'readScope':'Search-index text actually returned; direct page open returned405. Sodium compounds give a yellow flame; chloride tests are separate. No complete article read is claimed.'}],
 'overallDecision':'rejected_regenerate','blockingFindingIds':['V1-05','V1-07'],
 'gogglesCorrectionSuccessful':True,'aiApproved':'no','reviewedAssetSha256':png['sha256'],
 'newVDecisions':1,'newVApprovals':0,'newD':0,'newP':0,'newA':0,'newM':0,'newHumanApprovals':0,'newHumanTrials':0,
 'newStrictClosures':0,'activeIntegration':False,'M7':False,
 'finiteAttemptPolicy':'This is immutable V-FIRST for exactly7094a14f... PNG bytes. Any successor image requires a separate review/root. Never revise this finding retrospectively to match a successor.'})

# Two normal production asset paths as sparse repository-relative aliases; no full host.
aliasRows=[]
for p in [record['canonicalAssetPath'],record['publicAssetPath']]:
 alias=OUT/'sparse'/p;alias.parent.mkdir(parents=True,exist_ok=True)
 if alias.is_symlink():assert alias.resolve()==(ROOT/png['path']).resolve()
 else:assert not alias.exists();alias.symlink_to(os.path.relpath(ROOT/png['path'],alias.parent))
 aliasRows.append({'path':alias.relative_to(ROOT).as_posix(),'target':os.readlink(alias),'resolvedInput':bind(png['path'])})
selector={'schemaVersion':1,'role':'Finite exact one-image V-FIRST negative-decision selector',
 'goalId':GOAL,'authorNeutral':bind(AUTHOR+'/NEUTRAL.finite-image-safety-successor-author.json'),
 'authorSeal':bind(AUTHOR+'/FILES.finite-own-artifacts.seal.json'),
 'wholeBefore':bind(AUTHOR+'/candidate/one-whole-goal.original.exact.json'),
 'wholeAfter':bind(AUTHOR+'/candidate/one-whole-goal.with-safety-image.author.json'),
 'originalImage':boundary['original'],'reviewedImage':bind(png['path']),
 'displayPreviews':[a for a in assets if a['view'] in ('candidate-360','candidate-680')],
 'actualPrompt':bind(AUTHOR+'/prompt.de.md'),'provenanceAndStockImport':bind(AUTHOR+'/checks/STOCK.import-and-whole-goal-CAS.actual.json'),
 'ownActualReview':bind(REL+'/review/V1.actual-visual-findings.json'),
 'oneImageQaComponent':bind(REL+'/review/QA.one-image.V1.machine-rejected.json'),
 'oldRecordAndFindingsRetained':bind(REL+'/history/old-JPG-QA-and-original-author-finding.exact.json'),
 'sparseAssetAliases':aliasRows,'reviewDecision':'rejected_regenerate','newVApprovals':0,'newDpVotes':0,'newStrictClosures':0,'activeIntegration':False}
write('INPUTS.one-image-V1.physical-exact-selector.json',selector)
write('NEUTRAL.finite-one-image-V1-review.json',{
 'schemaVersion':1,'role':'Actual informed machine V-FIRST, negative decision, inactive',
 'selector':bind(REL+'/INPUTS.one-image-V1.physical-exact-selector.json'),'review':selector['ownActualReview'],'qaComponent':selector['oneImageQaComponent'],
 'goalId':GOAL,'reviewedPng':selector['reviewedImage'],'decision':'rejected_regenerate',
 'resolved':'All three laboratory faces now have visible splash goggles, including the flame-test pupil.',
 'remainingBlockingFindings':['V1-05: actual360px reading-dependent chemical/result labels remain too small.',
  'V1-07: unqualified NaCl identification endpoint is not supported by shown ion-test/data sequence; separate examples are not distinguished.'],
 'wholeGoalTextAndPrerequisitesUnchanged':True,'oldBytesAndHumanStateRetainedSeparately':True,
 'newVDecisions':1,'newVApprovals':0,'newD':0,'newP':0,'newA':0,'newM':0,
 'newHumanApproval':False,'newHumanTrial':False,'newStrictClosures':0,'restoredBindings':0,'activeIntegration':False,'M7':False,
 'next':'Any new attempt is a separate author successor and new actual V review; this V-FIRST is not amended to match it.',
 'checks':'checks/CHECK.production-QA-model-and-exact-bytes.actual.json',
 'finiteSeal':'FILES.finite-own-artifacts.seal.json'})
(OUT/'RESUME.md').write_text('''# V-FIRST: Analytikbild mit Schutzbrillen

**Entscheidung: rejected_regenerate; keine V-Freigabe.** Der betrachtete PNG-Hash ist `sha256:7094a14fa20cc5466f1b552a36d15c59a769defd5a0a9de37ee689b4025d6c39`.

Original, neuer PNG sowie echte360-/680-Pixel-Ansichten wurden mit view_image betrachtet. Die drei Schutzbrillen sind erfolgreich ergänzt. Stil, drei Arbeitsschritte, Apparatesymbole und Notebook-Perspektive sind plausibel erhalten. Bei360px sind wesentliche kleine chemische und Ergebnisbeschriftungen jedoch nicht zuverlässig lesbar. Außerdem führt die unqualifizierte Pfeilkette von verschiedenen Nachweisbeispielen zur definitiven Identifikation als Natriumchlorid, ohne passenden Chloridnachweis oder getrennte Beispielrouten. Die Unterscheidung von Kationen-/Anionentests ist bei der [RSC](https://edu.rsc.org/experiments/testing-salts-for-anions-and-cations/464.article) beschrieben; die Bewertung der konkreten Pfeilkette ist der hier dokumentierte maschinelle Bildbefund.

Die eigene V1-Entscheidung ist an die neuen Bytes gebunden und lautet aiApproved=no. Das unveränderte Produktionsmodell muss sie als rejected und Maschinen-V=false einordnen. Alter JPG, alter QA-Eintrag und vorhandener Human-Status bleiben separat erhalten. Der aktuelle alte Eintrag enthält weder menschliche Freigabe noch menschlichen NOK; der Brillenbefund stammt vom Root-Autor. Keine menschliche Freigabe wird behauptet oder übertragen.

Diese Sichtung ist informiert: Der Reviewer hat das Bild nicht erzeugt, aber frühere Labor-Aufgaben verfasst und die Root-Autormeinung gelesen. Sie ist keine unabhängige D/P-Prüfung.0 neue V-Freigaben,0 D/P/A/M-Votes,0 Strict-Closures,0 Restores, M7=false. Zwei schmale Asset-Aliasse dienen ausschließlich gezielten Produktionsprüfungen; keine aktiven Dateien/Hosts/Builds sind geändert. Eigener Inhalt CC-BY-4.0; technische Skripte Apache-2.0. Nach dem endlichen Siegel keine weiteren Schreibzugriffe und keine Anpassung dieses V-FIRST an Nachfolger.
''')
print(json.dumps({'goalId':GOAL,'reviewedPngSha256':png['sha256'],'actualViews':4,'decision':'rejected_regenerate','blockingFindings':['V1-05','V1-07'],'newVApprovals':0,'newStrictClosures':0}))
