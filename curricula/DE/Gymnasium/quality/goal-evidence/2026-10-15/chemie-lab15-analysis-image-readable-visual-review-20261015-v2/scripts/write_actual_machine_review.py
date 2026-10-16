#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Serialize the actual V2-attempt machine visual sighting, with no old approval transfer."""
import hashlib,json,os
from datetime import datetime,timezone
from pathlib import Path
from PIL import Image
ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
assert not (OUT/'FILES.finite-own-artifacts.seal.json').exists()
AUTHOR='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab15-analysis-image-readable-bounded-successor-author-root-20261015-v2'
FIRST='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab15-analysis-image-safety-visual-review-20261015-v1'
GOAL='cfa5c1e4-6714-5be7-9a57-a24b201b6231';stamp=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads((ROOT/p).read_text())
def write(p,d):(OUT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify_seal(path):
 d=read(path)
 for r in d['files']:
  p=ROOT/r['path']
  if r.get('kind')=='repository-relative-symlink':
   assert p.is_symlink() and os.readlink(p)==r['target'] and bind(r['path'])['sha256']==r['resolvedSha256']
  else:assert bind(r['path'])['sha256']==r['sha256'] and p.stat().st_size==r['bytes']
 return {'seal':bind(path),'payloadEntriesVerified':len(d['files']),'pass':True}
lineage=[verify_seal(FIRST+'/FILES.finite-own-artifacts.seal.json'),verify_seal(AUTHOR+'/FILES.finite-own-artifacts.seal.json')]
write('checks/CHECK.old-negative-and-new-author-seals.actual.json',{'role':'Read-only finite exact lineage check; no image decision inferred from a seal','rows':lineage,'pass':True})
original=read(AUTHOR+'/candidate/one-whole-goal.original.exact.json');candidate=read(AUTHOR+'/candidate/one-whole-goal.with-readable-analysis-image.author.json')
assert {k:v for k,v in original.items() if k!='resourceLinks'}=={k:v for k,v in candidate.items() if k!='resourceLinks'}
cas=read(AUTHOR+'/checks/STOCK.import-whole-goal-and-byte-copy-CAS.actual.json');png=cas['png']
assert {k:v for k,v in png.items() if k in ('path','sha256','bytes')}==bind(png['path'])
qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';old=next(r for r in read(qaPath)['records'] if r['goalId']==GOAL)
firstNeutral=read(FIRST+'/NEUTRAL.finite-one-image-V1-review.json')
assert firstNeutral['decision']=='rejected_regenerate'
write('history/original-JPG-and-rejected-first-PNG-preserved.json',{
 'role':'Exact old bytes, decisions and human state remain separate; none is transferred to the new PNG',
 'oldQaLedger':bind(qaPath),'wholeOldQaRecord':old,'oldJpg':bind(old['canonicalAssetPath']),
 'oldHumanState':{k:v for k,v in old.items() if k.startswith('human')},
 'oldRejectedFirstReview':bind(FIRST+'/review/V1.actual-visual-findings.json'),
 'oldRejectedFirstQa':bind(FIRST+'/review/QA.one-image.V1.machine-rejected.json'),
 'oldRejectedFirstSeal':bind(FIRST+'/FILES.finite-own-artifacts.seal.json'),
 'oldRootAuthorFindingAndHistory':bind(FIRST+'/history/old-JPG-QA-and-original-author-finding.exact.json'),
 'classification':'The historical active row has humanApproved=no and humanIssueIdentified=no. The original goggles issue was an informed root-author finding, not a human review. No human finding/approval is invented, removed or copied to new bytes.',
 'oldFilesUnchanged':True})
write('review/one-whole-goal.V-input-fragment.json',{'landscapeId':old['landscapeId'],'title':'Chemie — one whole goal, exact V input fragment','goals':[candidate]})
link=candidate['resourceLinks'][0]
record={**old,'title':candidate['title'],'description':candidate['description'],
 'landscapePath':REL+'/review/one-whole-goal.V-input-fragment.json',
 'imageUrl':link['url'],'publicAssetPath':'app/public'+link['url'],
 'canonicalAssetPath':'curricula/DE/Gymnasium/visualizations/chemie/'+GOAL+'/'+GOAL+'.png',
 'assetSha256':png['sha256'],'visualizationState':'available','missingReason':'',
 'umlautsCorrectChatGpt':'yes','contentApprovedChatGpt':'yes',
 'chatGptReviewedAt':stamp,'chatGptReviewer':'Codex / informed machine V sighting',
 'chatGptNotes':'Actual new native1672x941,360x203 and680x383 views: five readable labels, all four people with goggles, plausible preparation/qualitative/quantitative/recording overview and no specific identity assertion.',
 'humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','humanReviewedAt':None,'humanReviewer':'',
 'aiApproved':'yes','aiApprovedAssetSha256':png['sha256'],'aiReviewedAt':stamp,
 'aiReviewer':'Codex / informed machine V sighting',
 'aiNotes':'Accepted pilot after regeneration: actual fresh V sighting for this PNG only. Native/mobile/desktop labels, apparatus, goggles, notebook perspective, reference-comparison inference and comic style checked. This V evidence does not approve goal atomicity, D/P, source/course routes, a split, practical execution or human trial. Exact evidence: '+REL+'/review/V1.actual-visual-findings.new-readable-PNG.json'}
write('review/QA.one-image.new-readable-PNG.machine-V1.json',{
 'schemaVersion':1,'subject':'chemie','source':{'canonicalRoot':REL+'/review','publicAssetRoot':REL+'/sparse/app/public/assets/goal-visualizations',
  'role':'One inactive exact image QA component; real fresh machine V evidence, not full-subject approval'},'records':[record]})
assets=[]
for label,path in [('new-native',png['path']),('new-360',AUTHOR+'/checks/ACTUAL.display-360.png'),('new-680',AUTHOR+'/checks/ACTUAL.display-680.png')]:
 with Image.open(ROOT/path) as im:dimensions=list(im.size);fmt=im.format
 assets.append({'view':label,'input':bind(path),'pixels':dimensions,'format':fmt,'actualTool':'view_image','requestedDetail':'original','actuallyViewed':True,'displayDisclosure':'Complete exact native or supplied display-preview dimensions, no tool resizing notice.'})
assert [a['pixels'] for a in assets]==[[1672,941],[360,203],[680,383]]
findings=[
 {'id':'V2-01','criterion':'Actual labels and360px readability','result':'pass',
  'observed':'Exactly five words are present: Vorbereiten, Untersuchen, Auswerten, qualitativ, quantitativ. All are correctly spelled and reliably readable at the actual360x203 preview. The headers remain clear, the two middle labels distinguish method families, and there are no hidden small chemical labels, numeric readings, fine journal text or long title required to understand the picture.'},
 {'id':'V2-02','criterion':'Laboratory eye protection and visible safety','result':'pass',
  'observed':'All four person depictions wear transparent wrap-around splash goggles with visible sides/straps and lab coats: preparation, flame test, quantitative measurement and recording. The flame is on a stable bench, the hand is separated from it by a long implement, the burette is upright and clamped over a receiving flask. No visible unsafe hand-to-flame contact or unprotected eyes remain.',
  'limit':'A cartoon orientation scene is not a full practical protocol, PPE certification, risk assessment or observation of an actual learner.'},
 {'id':'V2-03','criterion':'Preparation and apparatus plausibility','result':'pass',
  'observed':'A tilted sample vessel pours through a filter-paper/funnel arrangement into a receiving flask; mortar/pestle provide a distinct preparation cue. The qualitative panel has flame/test-tube examples. The quantitative panel has a balance and an upright supported burette with stopcock above an Erlenmeyer flask. These are recognizable method illustrations, not measurement data or a claim that every depicted method fits every unknown sample.'},
 {'id':'V2-04','criterion':'Reference comparison and identity inference','result':'pass',
  'observed':'Unlabelled coloured test tubes and simple notebook/grid marks represent observations compared with reference patterns. There is no named substance, NaCl jar, Na+/Fe3+ label, concentration, mass or volume conclusion. The arrows express preparation→investigation→evaluation. They no longer claim identification of a particular compound from unspecific evidence.',
  'limit':'The image neither proves identification nor supplies an assessment solution; sufficient independent evidence, controls and uncertainty still belong to actual teaching/practical work.'},
 {'id':'V2-05','criterion':'Actor, hands and notebook perspective','result':'pass',
  'observed':'The recorder is behind the open notebook on the bench, with one hand holding a pencil against the page and the other stabilizing the book. The binding, turned pages and marks are plausible for the actor. With no observer-oriented microtext, there is no misleading reading direction. The titration actor operates the stopcock and holds the receiving flask in a plausible schematic position.'},
 {'id':'V2-06','criterion':'Mobile/desktop apparatus recognizability','result':'pass',
  'observed':'At360px the three stages, goggles, filtration, flame, test-tube rack, balance/burette and writing/comparison remain recognizable without decoding tiny text. At680x383 these same elements and all five labels are clearer. No numerical scale is presented as a readable result at either size.'},
 {'id':'V2-07','criterion':'Style, age fit and scope','result':'pass',
  'observed':'The existing friendly outlined pupil/comic family and soft blue/green three-panel layout are retained. Larger uncluttered motifs fit an accessible laboratory overview. No technical IDs, watermark, logos or copied worksheet are visible. The exact whole goal and practical operators remain unchanged; this is orientation supporting that goal, not evidence of semantic atomicity or completion.'},
 {'id':'V2-08','criterion':'Specific alt text and factual provenance','result':'pass',
  'observed':'The new whole-goal alt text describes the three stages, goggles, qualitative/quantitative work and reference comparison without asserting a substance identity. The resource declares PNG, German language, actual OpenAI image-generation provider and CC-BY-4.0 for own material. Exact backend model version is not exposed and is not invented.'}]
write('review/V1.actual-visual-findings.new-readable-PNG.json',{
 'schemaVersion':1,'license':'CC-BY-4.0','goalId':GOAL,'reviewedAtUTC':stamp,
 'attempt':'Separate readable successor V2, first machine V decision on these new bytes',
 'role':'Actual informed machine V sighting; no D/P review or human approval/trial',
 'reviewedImage':bind(png['path']),'wholeGoalOriginal':bind(AUTHOR+'/candidate/one-whole-goal.original.exact.json'),
 'wholeGoalCandidate':bind(AUTHOR+'/candidate/one-whole-goal.with-readable-analysis-image.author.json'),
 'allNonResourceFieldsExact':True,'actualImagesViewed':assets,'findings':findings,
 'priorBlockingFindings':{'old360SmallText':'resolved on this PNG: five readable labels and no fine compulsory text',
  'oldUnsupportedSpecificNaClIdentity':'resolved on this PNG: no named identity and explicit visual reference comparison',
  'oldMissingEyeProtection':'goggles retained on all four new person depictions'},
 'provenanceDisclosure':{'actualProvider':'OpenAI / builtin ChatGPT-Codex image generation, performed by root author',
  'exactBackendModelVersionExposed':False,'reviewerGeneratedOrEditedImage':False,
  'reviewerContext':'Reviewer authored earlier laboratory assessment material and rejected the first safety-only image. This sighting is informed, not blinded. The root author post-generation opinion was read after this reviewer had viewed the new pixels and formed the present visual judgment.',
  'actualPrompt':bind(AUTHOR+'/prompt.de.md'),'actualImportCAS':bind(AUTHOR+'/checks/STOCK.import-whole-goal-and-byte-copy-CAS.actual.json'),
  'authorPostGenerationOpinion':bind(AUTHOR+'/checks/ACTUAL.author-native-mobile-desktop-sighting.json'),
  'blindDPeerPolicy':'No Source5 D peer outputs or votes read, used or shared.'},
 'overallDecision':'accepted_pilot_after_regeneration','aiApproved':'yes','aiApprovedAssetSha256':png['sha256'],
 'blockingVisualFindings':[],'newMachineVDecisions':1,'newMachineVApprovals':1,
 'separateHolds':['No D/P/A/M verdict, source/course-route approval, semantic atomicity decision, split/retirement or current strict closure follows from this image.',
  'If a future independently reviewed split occurs, this overview may be considered for a surviving parent. This image approval authorizes no split or reassignment.',
  'Actual future practical performance, control/uncertainty/safety assessment and complete goal criteria remain required in the relevant assessment design. No human trial is claimed or required as a prior machine-M7 gate.'],
 'newD':0,'newP':0,'newA':0,'newM':0,'newHumanApprovals':0,'newHumanTrials':0,'newStrictClosures':0,'restoredBindings':0,'activeIntegration':False,'M7':False,
 'finiteAttemptPolicy':'This first V decision applies only to f5077a24... bytes. The prior rejected V-FIRST remains sealed, valid for its own earlier bytes and unamended.'})
aliases=[]
for p in [record['canonicalAssetPath'],record['publicAssetPath']]:
 alias=OUT/'sparse'/p;alias.parent.mkdir(parents=True,exist_ok=True)
 if alias.is_symlink():assert alias.resolve()==(ROOT/png['path']).resolve()
 else:assert not alias.exists();alias.symlink_to(os.path.relpath(ROOT/png['path'],alias.parent))
 aliases.append({'path':alias.relative_to(ROOT).as_posix(),'target':os.readlink(alias),'resolvedInput':bind(png['path'])})
selector={'schemaVersion':1,'role':'Finite exact new-readable-image machine V selector; inactive',
 'goalId':GOAL,'authorNeutral':bind(AUTHOR+'/NEUTRAL.finite-readable-analysis-image-author-successor.json'),'authorSeal':bind(AUTHOR+'/FILES.finite-own-artifacts.seal.json'),
 'wholeBefore':bind(AUTHOR+'/candidate/one-whole-goal.original.exact.json'),'wholeAfter':bind(AUTHOR+'/candidate/one-whole-goal.with-readable-analysis-image.author.json'),
 'originalImage':bind(old['canonicalAssetPath']),'firstRejectedPng':firstNeutral['reviewedPng'],'reviewedImage':bind(png['path']),
 'displayPreviews':[a for a in assets if a['view']!='new-native'],'actualPrompt':bind(AUTHOR+'/prompt.de.md'),
 'provenanceAndStockImport':bind(AUTHOR+'/checks/STOCK.import-whole-goal-and-byte-copy-CAS.actual.json'),
 'ownActualReview':bind(REL+'/review/V1.actual-visual-findings.new-readable-PNG.json'),
 'oneImageQaComponent':bind(REL+'/review/QA.one-image.new-readable-PNG.machine-V1.json'),
 'oldHistoryRetained':bind(REL+'/history/original-JPG-and-rejected-first-PNG-preserved.json'),
 'sparseAssetAliases':aliases,'reviewDecision':'accepted_pilot_after_regeneration','newMachineVApprovals':1,'newDpVotes':0,'newStrictClosures':0,'activeIntegration':False}
write('INPUTS.one-image-readable-V1.physical-exact-selector.json',selector)
write('NEUTRAL.finite-readable-image-machine-V1-review.json',{
 'schemaVersion':1,'role':'Actual informed machine V on separate new-readable PNG; inactive',
 'selector':bind(REL+'/INPUTS.one-image-readable-V1.physical-exact-selector.json'),'review':selector['ownActualReview'],'qaComponent':selector['oneImageQaComponent'],
 'goalId':GOAL,'reviewedPng':selector['reviewedImage'],'decision':'accepted_pilot_after_regeneration','aiApproved':'yes',
 'actualViews':[[1672,941],[360,203],[680,383]],'fiveLabelsReadable':True,'allFourPeopleWithGoggles':True,'noUnsupportedSpecificIdentityConclusion':True,
 'wholeGoalTextAndPrerequisitesExact':True,'oldJpgOldNegativeV1AndHumanStateRetained':True,
 'newMachineVDecisions':1,'newMachineVApprovals':1,'newD':0,'newP':0,'newA':0,'newM':0,'newHumanApproval':False,'newHumanTrial':False,
 'newStrictClosures':0,'restoredBindings':0,'activeIntegration':False,'M7':False,
 'holds':'All non-visual A/source/course/D/P and practical-assessment obligations remain separate. This overview permits no split, retirement or parent reassignment; a later independent decision could consider it.',
 'blindDPeerPolicy':'No D peer votes read, used or shared.',
 'checks':'checks/CHECK.production-QA-model-and-exact-bytes.actual.json','finiteSeal':'FILES.finite-own-artifacts.seal.json'})
(OUT/'RESUME.md').write_text('''# Neues lesbares Analytikbild: tatsächliche Maschinen-V-Sichtung

**accepted_pilot_after_regeneration / aiApproved=yes**, ausschließlich für PNG `sha256:f5077a2472d58cdac1114c9e8787c64ddc33b80508b0c207113b2375e74d1ff5`.

Die neuen Pixel wurden nativ1672×941 sowie tatsächlich360×203 und680×383 mit view_image gesehen. Genau fünf richtig geschriebene Labels sind bei360px lesbar. Alle vier dargestellten Personen tragen Schutzbrillen. Filtration, qualitative Untersuchung, Waage/Bürette und Auswertung sind als Orientierungsbilder plausibel. Notebook und Handstellungen sind plausibel; die Referenzmuster behaupten keine bestimmte Stoffidentität mehr. Stil und blau-grünes Drei-Schritt-Motiv bleiben erhalten. Die beiden früheren Bildblocker sind an diesen neuen Bytes behoben.

Dies ist eine informierte maschinelle V-Sichtung durch einen Reviewer, der das Bild nicht erzeugt hat, frühere Labormaterialien verfasst und den ersten Bildversuch abgelehnt hat. Keine D-Prüfervoten wurden gelesen oder geteilt. Der erste negative V-FIRST bleibt unverändert versiegelt; alte JPG-/QA-/Human-Stände werden nicht auf die neuen Bytes übertragen. Die tatsächliche neue AI-Entscheidung hat einen neuen Zeitstempel und exakt neuen Hash.

Unveränderte Produktionshelfer prüfen die echte neue Bindung über zwei schmale Asset-Aliasse. Kein Vollhost, aktiver Dateistand oder Runtime-Code wird geändert.1 neue Maschinen-V-Entscheidung und1 positive V-Evidenz für den inaktiven Kandidaten;0 neue D/P/A/M-Votes,0 Strict-Closures,0 Restores, M7=false. Kein Human Approval oder Human Trial. Der Bildbefund entscheidet weder Atomizität noch Quellen-/Kursrouten oder praktische Leistung. Ein etwaiges späteres Eltern-Overview nach einem unabhängig geprüften Split bleibt ausdrücklich konditional; kein Split ist hier genehmigt.

Eigenes Reviewmaterial CC-BY-4.0; technische Skripte Apache-2.0. Nach dem endlichen Siegel keine weiteren Schreibzugriffe.
''')
print(json.dumps({'reviewedPngSha256':png['sha256'],'actualViews':3,'decision':'accepted_pilot_after_regeneration','newMachineVApprovals':1,'newStrictClosures':0,'oldVFirstUnchanged':True}))
