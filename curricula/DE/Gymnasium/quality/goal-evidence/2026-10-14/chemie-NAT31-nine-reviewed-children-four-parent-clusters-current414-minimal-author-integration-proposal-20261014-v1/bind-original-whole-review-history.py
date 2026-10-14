#!/usr/bin/env python3
import copy, hashlib, json, pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot'); O=pathlib.Path(__file__).resolve().parent; Q=O.relative_to(R); E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
def read(p):return json.loads((R/p).read_text())
def put(p,d):(O/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=(R/p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def lines(p):return [json.loads(x) for x in (R/p).read_text().splitlines() if x.strip()]
inp=read(Q/'INPUTS.exact-whole-material-selection.external-bindings.json'); ids=inp['selectedChildIds']; extras=[]
profiles={x['goalId']:x for x in lines(Q/'P/nine-existing-whole-profile-records.exact.jsonl')}
amap={x['goalId']:x for x in read(Q/'history/a3.scoped-original-whole-judgments.NO-NEW-VOTE.json')}
bmap={x['goalId']:x for x in read(Q/'history/b3.scoped-original-whole-judgments.NO-NEW-VOTE.json')}
a2=E/'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2';b2=E/'chemie-q2-naturstoffe-current407-independent-b-20261012-v2'
a3=E/'chemie-q2-current407-remediation24-fresh-independent-a-20261012-v3';b3=E/'chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3'
ap=a2/'positive/P36.fresh.review.jsonl';bp=b2/'positive/P29.independent-b.review.jsonl';extras.extend([ap,bp]);a2p={x['goalId']:x for x in lines(ap)};b2p={x['goalId']:x for x in lines(bp)}
proof=[]
for i in ids:
 afp=amap[i]['P']['profileFingerprint'] if i in amap else a2p[i]['profileFingerprint'];bfp=bmap[i]['PBindings']['profileFingerprint'] if i in bmap else b2p[i]['profileFingerprint']
 assert afp==bfp==profiles[i]['profileFingerprint']
 proof.append({'goalId':i,'exactCurrentProfileFingerprint':profiles[i]['profileFingerprint'],'actualGenuineAProfileFingerprint':afp,'actualGenuineBProfileFingerprint':bfp,'exactPairMatch':True,'originalScienceVersion':'v3' if i in amap else 'v2-retained','newScienceVote':False})
put('CHECK.nine-P-profiles-match-actual-original-paired-science-fingerprints.json',{'records':proof,'pass':True})

# Bind every full native origin file. No sliced runs/records or renamed current page fingerprints.
full=[]
for root,patterns in [
 (a2,['native/batch-*/round-a/results/*.records.jsonl','native/batch-*/round-a/results/*.run.json']),
 (b2,['D29-batch-*-round-b/results/*.records.jsonl','D29-batch-*-round-b/results/*.run.json']),
 (a3,['batch-*/results/*.records.jsonl','batch-*/results/*.run.json']),
 (b3,['native-batch-*/results/*.records.jsonl','native-batch-*/results/*.run.json'])]:
 for pat in patterns:
  for p in sorted((R/root).glob(pat)):
   rel=p.relative_to(R);extras.append(rel);full.append(bind(rel))
assert len(full)==16
put('history/whole-original-native-A-B-v2-v3-run-record-bindings.NO-CURRENT-D-CLAIM.json',{
 'fullOriginalFiles':full,'originalsUnmodified':True,'originalRecordStreamsSliced':False,'currentDResolutionProduced':False,
 'boundary':'These are the complete actual independent origin runs and records. A future normal summarize/synthesis/resolution transport must preserve all reviewed goals, real BLOCK/revise outcomes and terminal owner chains; no D1 legacy or aggregate-v1 shortcut. Current551 page/context equivalence is not inferred from unchanged goal text alone.'})

# Preserve seven original typed V rows exactly in the allowed native projection; two v2 records remain genuine input-sealed history.
vp=a3/'V23.current-exact-assets.reviewed-candidates.json';extras.append(vp);vr=read(vp)['records']; selected=[x for x in vr if x['goalId'] in ids]
assert len(selected)==7
fields=['goalId','title','description','aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes']
qa=[{k:r[k] for k in fields} for r in selected]
assets={x['goalId']:x for x in read(Q/'V/nine-existing-actual-PNG-bindings-and-original-paired-science.NO-NEW-V.json')}
for r in qa:
 assert r['aiApproved']=='yes' and r['aiApprovedAssetSha256']==assets[r['goalId']]['actualAsset']['sha256']
 assert isinstance(r['aiReviewedAt'],str) and isinstance(r['aiReviewer'],str)
put('V/seven-existing-typed-native-QA-fields.exact-original-A.not-applied.json',{'records':qa,'original':bind(vp),'datesReviewersHashesVerbatim':True,'newVisualVotes':0,'publicPresenceClaim':False})
v2p=b2/'ORIGINAL.V29.actual-pixels-and-native.review.json';v2=read(v2p);contact=pathlib.Path(v2['inspectionInputManifest']);extras.extend([v2p,contact])
two=[x for x in v2['goals'] if x['goalId'] in ids and x['goalId'] not in amap];assert len(two)==2
put('V/two-unchanged-v2-input-sealed-genuine-V-rows.NO-INVENTED-RAW-METADATA.json',{
 'originalWholeV29Review':bind(v2p),'originalContactInputManifest':bind(contact),'reviewedAtUTCVerbatim':v2['reviewedAtUTC'],'originalTwoScientificRows':two,
 'sameFinalPNGBytes':[{ 'goalId':x['goalId'],'actualFinalPNG':assets[x['goalId']]['actualAsset']} for x in two],
 'genuineA2AlreadyBound':str(a2/'FINAL.targeted29.genuine-scientific-judgments.json'),
 'boundary':'The exact original V2 pair is genuine and unchanged. This author dossier does not invent an absent original typed QA row, reviewer/date or public approval. A later explicit mechanical native-field projection must cite this history and its actual image digest; no new visual review of good images is requested here.'})
deck_orig=E/'chemie-q2-naturstoffe-current402-author-20261012-v2/memory/de_gymnasium_chemistry_flashcards_natural_q2.de.json';extras.append(deck_orig)
assert read(deck_orig)==read(Q/'M/deck-natural-q2.complete-five-cards.only-two-reviewed-origin-tags.candidate.json')
put('CHECK.two-card-origin-candidate-equals-original-pair-reviewed-whole-deck.json',{'originalPairReviewedDeck':bind(deck_orig),'candidateWholeDeck':bind(Q/'M/deck-natural-q2.complete-five-cards.only-two-reviewed-origin-tags.candidate.json'),'wholeDeckEqual':True,'newCardsOrTexts':0})
for p in extras:
 b=bind(p)
 if b['path'] not in {x['path'] for x in inp['bindings']}:inp['bindings'].append(b)
put('INPUTS.exact-whole-material-selection.external-bindings.json',inp)
neutral=read(Q/'NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json');neutral['genuineScienceHistorySeparatelyBound']=bind(Q/'INPUTS.exact-whole-material-selection.external-bindings.json')
neutral['fullOriginalNativeHistory']=bind(Q/'history/whole-original-native-A-B-v2-v3-run-record-bindings.NO-CURRENT-D-CLAIM.json')
put('NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json',neutral)
print(json.dumps({'exactPSciencePairMatches':9,'originalWholeNativeFilesBound':len(full),'originalTypedVRows':len(qa),'unchangedV2ScientificRows':len(two),'oldReviewedDeckWholeEqual':True,'externalBindings':len(inp['bindings'])}))
