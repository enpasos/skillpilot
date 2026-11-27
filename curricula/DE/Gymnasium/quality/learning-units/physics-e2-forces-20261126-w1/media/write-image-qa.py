"""Record the author's actual seven-image inspection in the native QA contract."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

base=Path(__file__).resolve().parent.relative_to(Path.cwd())
rel=lambda p: p.as_posix()
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
qa_path=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json')
qa=json.loads(qa_path.read_text())
links=json.loads((base/'resource-links.actual.json').read_text())['links']
now=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
reviewer='OpenAI Codex W1 media author, actual full-resolution and 360px inspection'
notes={
 'B':'The common tail is on the cart. In the final 1600x900 mapping, 6 N measures 540 px and 4 N 360 px, against a 180 px reference for 2 N. Both tips are free. Signed addition gives +2 N. The zero-force note permits rest and constant velocity. Both forces refer to the same cart; no net arrow is drawn elsewhere.',
 'G':'The 40 N weight and its two component arrows all start on the block, and the block visibly contacts the slope. Lengths are 288 px for weight, 144 px parallel and about 249.415 px perpendicular, against 72 px per 10 N. The components add geometrically to the weight. Dashed parallels are construction lines without arrowheads. The arrow tips end away from drawn surface boundaries. Components replace the weight; contact normal is explicitly a different force.',
 'T':'The 60 N weight and its components share the block tail. Lengths 288, 144 and about 249.415 px use 48 px per 10 N, giving 60, 30 and 51.96 N. The slope angle is 30 degrees within drawing-line tolerance. Positive downhill and outward-normal directions are stated, so +30 and -52 N match the physical arrows. Sin/cos assignments and both limiting cases are correct. Dashed lines are construction, with no extra forces.',
 'F':'Two separate contact situations remain distinct. The static arrow starts on the left block, has 270 px for 30 N and points against the stated rightward tangential demand; the right block is already sliding right and has a 225 px leftward arrow for 25 N. The shared 10 N reference is 90 px. With N=100 N, coefficients 0.40 and 0.25 give 40 N maximum static and 25 N kinetic friction. Actual static friction is 30 N; equality at 40 N still permits sticking. No forces on different blocks are summed.',
 'motion':'The -4 N friction arrow starts on the block and has 360 px against 180 px for 2 N. It opposes the stated positive initial velocity. At 2 kg, the given friction gives -2 m/s^2 and v=6-2t until stopping at t=3 s. The valid time interval and constant-friction assumption are explicit; no continuation into unforced reversal is implied. No detached velocity or acceleration arrows are drawn.',
 'curve':'The radial 2000 N static-friction arrow starts at the car and ends freely 63 px before M. Its 180 px length is two 90 px references of 1000 N. The car lies at the rightmost point of the circle. The given 1000 kg, 10 m/s and 50 m imply 2000 N. Available maximum 5000 N is supplied directly, without coefficient. The actual force is the required 2000 N, below that maximum; no extra centripetal force is added.',
 'given':'The given +6 N resultant starts on the cart and points right; its hand-drawn full length is three 2 N reference lengths within the visible stroke width. Original aspect ratio is preserved by containing the generated bitmap in 1600x900 with side margins. At 2 kg, acceleration is +3 m/s^2. The zero-resultant note gives a=0. There is no detached acceleration arrow or request to derive the resultant from several forces.'
}
inspection={'schemaVersion':1,'reviewedAt':now,'reviewer':reviewer,'method':'Actually opened each active 1600x900 JPEG and each 360px preview after the final 16:9 render. Author material judgement; not an independent review or human approval.','rows':[]}
decisions=[]
for entry in links:
 key=entry['key'];gid=entry['goalId'];row=next(x for x in qa['records'] if x['goalId']==gid)
 asset=Path(row['canonicalAssetPath']); digest=sha(asset)
 preview=base/'render'/f'{key}-360.png'
 inspection['rows'].append({'goalId':gid,'assetSha256':digest,'canonicalPath':str(asset),'fullSize':[1600,900],'previewPath':str(preview),'previewSha256':sha(preview),'displayReviewWidths':[1600,360],'decision':'accepted_ai_pilot','observation':notes[key]})
 review={'criterionVersion':'directed-quantity-arrows-v1','assetSha256':digest,'representationKinds':['spatialQuantityArrow'],'status':'accepted','checks':{'referencePoint':'pass','direction':'pass','quantityAndOwnScale':'pass','tipNotPlace':'pass','additionSameQuantityReference':'pass' if key in ['B','G','T'] else 'notApplicable'},'reviewedAt':now,'reviewer':reviewer,'notes':notes[key]}
 decisions.append({'goalId':gid,'review':review})
 for prefix in ['ai','chatGpt']:
  row[prefix+'ReviewedAt']=now;row[prefix+'Reviewer']=reviewer;row[prefix+'Notes']=notes[key]
 row['umlautsCorrectChatGpt']='yes';row['contentApprovedChatGpt']='yes';row['aiApproved']='yes';row['aiApprovedAssetSha256']=digest
 row['humanApproved']='no';row['humanReviewedAt']=None;row['humanReviewer']=''
inspection_path=base/'image-inspection.actual.json'
inspection_path.write_text(json.dumps(inspection,ensure_ascii=False,indent=2)+'\n')
decision_path=base/'image-decisions.actual.json'
evidence={'schemaVersion':1,'documentType':'directed-quantity-arrow-image-decisions','sourceBindings':[{'path':str(inspection_path),'sha256':sha(inspection_path)}]+[{'path':str(base/'render'/f"{x['goalId']}.jpg"),'sha256':sha(base/'render'/f"{x['goalId']}.jpg")} for x in links],'rows':decisions}
decision_path.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
for item in decisions:
 row=next(x for x in qa['records'] if x['goalId']==item['goalId']);row['directedQuantityArrowReview']={**item['review'],'evidence':{'path':str(decision_path),'sha256':sha(decision_path),'entryId':item['goalId']}}
qa_path.write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n')
ledger=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/physik-w1-forces-2026-11-26.md')
text='# Physik · W1: Kräfte am Körper\n\nDate: 2026-11-26\n\nKI-Autorenprüfung der aktiven Bilder bei Originalauflösung (1600 × 900) und 360 px. Keine menschliche oder unabhängige Freigabe. Die Maßstäbe und Vektorgeometrie der sechs komponierten Diagramme sind präzise gezeichnet; die freundlich gezeichneten Körper stammen aus tatsächlichen image_gen-Aufrufen. Das siebte Bild ist vollständig mit image_gen erzeugt. Die verworfenen Vollbildversuche bleiben als Evidenz erhalten.\n\n| Ziel | Titel | Entscheidung | Prüfung |\n|---|---|---|---|\n'
for item in decisions:
 row=next(x for x in qa['records'] if x['goalId']==item['goalId']);text+=f"| `{row['goalId']}` | {row['title']} | `accepted_ai_pilot` | Ansatz am Körper, eigener Kraftmaßstab, freie Spitze; aktueller Hash in [Sichtprüfung](../learning-units/physics-e2-forces-20261126-w1/media/image-inspection.actual.json). |\n"
ledger.write_text(text)
print(json.dumps({'imagesReviewed':len(decisions),'nativeQaUpdated':str(qa_path),'directedCriterionEvidence':str(decision_path)}))
