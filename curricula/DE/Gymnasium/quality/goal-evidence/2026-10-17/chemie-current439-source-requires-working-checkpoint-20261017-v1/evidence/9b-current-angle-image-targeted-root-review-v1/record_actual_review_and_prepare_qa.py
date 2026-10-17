import copy, datetime, hashlib, json, os
from pathlib import Path

O = Path(__file__).resolve().parent
F = Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule')
gid = '9b56d01e-c2d7-51d8-b78e-237592c1ed20'
C = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
Q = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
def pin(p):
    b=p.read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,d):
    p=O/name
    if p.exists(): raise RuntimeError('output exists: '+str(p))
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    json.loads(p.read_text())
    return pin(p)
before_pins=[pin(F/C),pin(F/Q)]
goal=next(g for g in json.loads((F/C).read_text())['goals'] if g['id']==gid)
old=json.loads((F/Q).read_text())
before=next(r for r in old['records'] if r['goalId']==gid)
measurement=json.loads((O/'MEASUREMENT.actual-browser-render-sizes.json').read_text())
assert measurement['digest']==before['assetSha256']
assert [m['width'] for m in measurement['measurements']]==[360,680]
assert all((O/m['screenshot']).is_file() for m in measurement['measurements'])
now=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
notes=('KEEP nach tatsächlicher erneuter Sichtprüfung des unveränderten JPGs am aktuellen engeren Winkel-Lernziel, '
       'in Originalauflösung 2752×1536 sowie echten Browserdarstellungen 360×201 und 680×380: '
       'Lineares BeH2 mit 180°, trigonal-planares BH3 mit 120° und gewinkeltes Wasser mit etwa 104,5° '
       'sind klar erkennbar; beim Wasser sind zwei freie Elektronenpaare markiert. '
       'Die Geometrien und Winkel unterstützen das Zuordnen zu bereits gezeigten Strukturen und den qualitativen '
       'Einfluss freier Paare. Die 104,5° sind ein gerundeter Referenzwert, keine aus dem EPA-Modell exakt '
       'berechenbare Zahl; die Grenze zwischen Modell und Messwert bleibt Bestandteil von Zieltext, Erklärung '
       'und eigenständigen P-Nachweisen. Das Bild allein prüft diesen Aspekt nicht. '
       'Hauptmotive, Winkel und Formeln sind auch bei 360 Pixeln erkennbar; keine Personenperspektive. '
       'Bestehender abstrakter Comicstil, Nano-Banana-Pro-Herkunft und JPG-Format bleiben erhalten. '
       'Keine neue Bildgenerierung, keine menschliche Freigabe oder Erprobung behauptet.')
after=copy.deepcopy(before)
after.update(title=goal['title'],description=goal['description'],aiApproved='yes',
             aiApprovedAssetSha256=before['assetSha256'],aiReviewedAt=now,
             aiReviewer='Codex (actual current-goal image revalidation)',aiNotes=notes)
changed=[k for k in before if before[k]!=after[k]]
allowed={'title','description','aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes'}
assert set(changed)<=allowed
assert all(after[k]==before[k] for k in before if k.startswith('human') or k.startswith('chatGpt'))
candidate=copy.deepcopy(old)
candidate['records']=[after if r['goalId']==gid else r for r in candidate['records']]
assert sum(x!=y for x,y in zip(old['records'],candidate['records']))==1
qa=write('chemie.qa.single-current-angle-image-revalidation.candidate.json',candidate)
review=write('REVIEW.actual-current-angle-goal-and-unchanged-image.json',{
 'schemaVersion':1,'goalId':gid,'reviewedAtUTC':now,'reviewAuthority':'ai_targeted_revalidation',
 'status':'ai_candidate','decision':'KEEP_EXISTING_ASSET_FOR_CURRENT_GOAL',
 'reviewer':'Codex root','actualImageViewedAtNativeResolution':True,
 'actualRenderedScreenshotsViewed':[pin(O/'actual-render-360.png'),pin(O/'actual-render-680.png')],
 'actualRendererMeasurement':pin(O/'MEASUREMENT.actual-browser-render-sizes.json'),
 'canonicalGoal':goal,'previousQaRecord':before,'candidateQaRecord':after,'changedQaFields':changed,
 'findingDe':notes,
 'scientificReferences':[
  {'url':'https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity',
   'checked':'VSEPR approximate angles, electron-domain versus molecular geometry, linear/trigonal planar arrangements, lone-pair repulsion.'},
  {'url':'https://cccbdb.nist.gov/listgeomexpx.asp?casno=7732185',
   'checked':'Experimental HOH angle rounded to 104.5 degrees; no claim of exact VSEPR numerical derivation.'}],
 'candidateWholeQa':qa,'sourcePins':before_pins,'sourceImageEdited':False,
 'newImageGeneration':False,'newDescriptionReview':False,'newPositiveEvidenceReview':False,
 'humanApprovalClaim':False,'humanTrialClaim':False,'M7Claim':False})
write('CAS.UNAPPLIED.one-QA-row-after-actual-image-review.json',{
 'targetRelativePath':str(Q),'sourceWholeQa':before_pins[1],
 'beforeWholeQaRecord':before,'afterWholeQaRecord':after,'allowedFields':sorted(allowed),
 'candidateWholeQa':qa,'actualReview':review,'appliedToMainOrOldCapsule':False})

# Read-only aliases keep the single affected stock freshness check isolated.
R=O/'check-capsule'
def thin(source,dest,relative_parts):
    dest.mkdir()
    target=relative_parts[0]
    for child in source.iterdir():
        out=dest/child.name
        if child.name==target:
            if len(relative_parts)==1: out.write_bytes(Path(qa['path']).read_bytes())
            else: thin(child,out,relative_parts[1:])
        else: out.symlink_to(child,target_is_directory=child.is_dir())
thin(F,R,Q.parts)
assert before_pins==[pin(F/C),pin(F/Q)]
write('CHECK.exact-one-QA-row-and-protected-fields.before-stock-freshness.json',{
 'currentCanonicalUnchanged':True,'oldWholeQaUnchanged':True,'assetBytesUnchanged':True,
 'exactlyOneQaRowChanged':True,'humanAndHistoricalChatGptFieldsUnchanged':True,
 'candidateCapsule':str(R),'sourcePinsAfter':before_pins,'actualNewVReviewCount':1,
 'scopeAndDAndPAndAAndMUnmodified':True,'freshnessCheckPending':True})
print(json.dumps({'candidateQa':qa,'review':review,'changedFields':changed,'checkCapsule':str(R)}))
