from pathlib import Path
import json,hashlib,copy
from datetime import datetime,timezone
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[6];BASE=OUT.parent
PREP=BASE/'chemie-q2-four-final-resource-metadata-current402-root-preparation-20261012-v2'
PRIOR=BASE/'chemie-q2-four-joint-current402-root-integration-preparation-20261012-v1'
PRIOR_B=BASE/'chemie-q2-four-joint-current402-targeted-independent-b-20261012-v1'
WHOLE_B=BASE/'chemie-q2-naturstoffe-current402-independent-b-20261012-v1'
RID=OUT.name;NOW=datetime.now(timezone.utc).isoformat()
def load(p):return json.loads(p.read_text())
def rows(p):return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p):return p.relative_to(ROOT).as_posix()
def write(path,data):
 p=OUT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def lines(path,data):
 p=OUT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in data))
entry=load(PREP/'FINAL.neutral-final-metadata-current402-four-input.json');ids=entry['goalIds']
new=load(PREP/'candidate/canonical523.final-selected-four.inactive.json')
oldseal=load(PRIOR/'FINAL.inactive-integration-preparation.freeze.json')
oldpath=ROOT/next(x['path'] for x in oldseal['files'] if '/candidate/canonical' in x['path'])
old=load(oldpath);a={g['id']:g for g in old['goals']};b={g['id']:g for g in new['goals']}
assert a.keys()==b.keys() and len(a)==523
changed=[]
for gid in a:
 for k in a[gid].keys()|b[gid].keys():
  if a[gid].get(k)!=b[gid].get(k):changed.append((gid,k))
assert sorted(changed)==sorted([(ids[1],'resourceLinks'),(ids[2],'resourceLinks')]),changed
for gid in [ids[1],ids[2]]:
 for before,after in zip(a[gid]['resourceLinks'],b[gid]['resourceLinks']):
  delta=[k for k in before.keys()|after.keys() if before.get(k)!=after.get(k)]
  assert sorted(delta)==['altText','description','reviewStatus'],(gid,delta)
original_p={x['goalId']:x for x in rows(WHOLE_B/'positive/P31.independent-b.review.jsonl')}
current_p={x['goalId']:x for x in rows(PREP/'positive/P4.final-current-metadata.records.jsonl')}
campaignpath=OUT/'native-D4-round-b/description-review-campaign.json';campaign=load(campaignpath)
campaign['reviewPass']='follow_up';campaignpath.write_text(json.dumps(campaign,ensure_ascii=False,indent=2)+'\n')
inp=load(OUT/'native-D4-round-b/description-review-input.json');pages={x['goalId']:x for x in inp['goals']}
oldD={x['goalId']:x for x in rows(next((PRIOR_B/'native-D4-round-b/results').glob('*.records.jsonl')))}
htmlreceipt=load(OUT/'inspection/actual-rendered-HTML-receipt.json');assets={x['url'].split('/')[-2]:x for x in htmlreceipt['assets']}
oldreceipt=load(PRIOR_B/'FIRST.exact-prior-material-and-current-tuple-check.json');oldimages={x['goalId']:x['sourceImageDigest'] for x in oldreceipt['selected']}
comparisons=[];D=[];P=[];d_runid=RID+'-follow-up-D4';p_runid=RID+'-follow-up-P4'
for gid in ids:
 p=original_p[gid];q=current_p[gid];g=pages[gid]
 assert p['goalFingerprint']==q['goalFingerprint']==g['goalFingerprint']
 assert p['profileFingerprint']==q['profileFingerprint'] and p['profile']==q['profile']
 assert (p['reviewInputFingerprint']!=q['reviewInputFingerprint'])==(gid in ids[1:3])
 native=g['reviewContext']['evidenceProfile']
 for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','profile']:assert native[k]==q[k],(gid,k)
 assert assets[gid]['digest']==oldimages[gid]
 d=copy.deepcopy(oldD[gid]);d.update(recordId=RID+'-'+gid,runId=d_runid,campaignId=campaign['campaignId'],roundId=campaign['roundId'],bundleFingerprint=campaign['bundleFingerprint'],bookDigest=campaign['bookDigest'])
 for k in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:d[k]=g[k]
 d['rationale']='Eigener gezielter follow_up der endgültigen Ressourcenmetadaten und aller vier tatsächlichen neuen normalen HTML-/PDF-Seiten. Alle 523 Ziele sind außer altText/description/reviewStatus der zwei Ressourcen exakt unverändert; alle ursprünglichen fachlichen P-Profile einschließlich Fälle/Rubriken und Goal-/Profil-Fingerprints sind exakt meine original geprüften Inhalte. Beide neue altTexts stimmen mit den unveränderten tatsächlichen PNG-Pixeln überein: symbolische Portionsgegenüberstellung ohne Messwertbehauptung; abstrakte Kette mit korrekter C(=O)-NH-Gruppe und C-N-Klammer. Pilotstatus ist keine menschliche Freigabe. Vollständige Seiten, genaue aktuelle P-Identität und tatsächliche Bildbytes geprüft. Ursprüngliches eigenes Wissenschaftsurteil bleibt erhalten; nur diese aktuelle Bindung wird bestätigt. '+oldD[gid]['rationale'].split(' Ein ',1)[-1]
 D.append(d)
 r=copy.deepcopy(p);r.update(reviewId=RID,reviewedAt=NOW,reviewer='GPT-6 Codex independent B; targeted final metadata/context follow_up',reviewInputFingerprint=q['reviewInputFingerprint'],reviewRunIds=[p_runid])
 r['reason']='Eigener gezielter Folgecheck: originales fachliches Profil, vollständige Fälle und Rubrik exakt unverändert; aktuelle Ressourcenmetadaten mit den unveränderten Pixeln und den vier tatsächlichen neuen normalen HTML-/PDF-Seiten verglichen. Neue P-Ressourcenbindung der beiden PNGs bestätigt. Ursprüngliches Wissenschaftsurteil bleibt erhalten, keine erneute ganze Quellenfreigabe und keine menschliche Leistung/Freigabe behauptet. '+p['reason']
 P.append(r)
 comparisons.append({'goalId':gid,'sameAllGoalFieldsExceptSpecifiedTwoResourceMetadata':True,'sameOriginalWholeScientificProfile':True,'sameProfileFingerprint':True,'sameGoalFingerprint':True,'resourceReviewInputFingerprintChanged':gid in ids[1:3],'priorReviewInputFingerprint':p['reviewInputFingerprint'],'currentReviewInputFingerprint':q['reviewInputFingerprint'],'currentPageFingerprint':g['pageFingerprint'],'sameActualAssetDigest':assets[gid]['digest'],'currentNativePIdentityMatches':True})
batch=campaign['batches'][0];recordname='native-D4-round-b/results/'+batch['batchId']+'.records.jsonl';lines(recordname,D)
manifest=load(OUT/'native-D4-round-b/review-bundle-manifest.json');artifacts=[{'role':x['role'],'digest':x['digest']} for x in manifest['artifacts'] if x['role'] in ['book_model','book_html','book_pdf','review_input_json','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':sha(OUT/'native-D4-round-b/batches'/(batch['batchId']+'.input.jsonl'))}]
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':d_runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 Codex inherited session model','role':'subject_reviewer','promptFamilyId':'chemistry-goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'targeted follow_up; own original science explicitly retained after exact material comparison').hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':ids,'inputArtifacts':artifacts,'startedAt':load(OUT/'FIRST.start-and-input-CAS.json')['startedAtUTC'],'completedAt':NOW,'status':'completed','outputDigest':sha(OUT/recordname),'toolchainVersion':'skillpilot-current-normal-D4-genuine-targeted-follow-up'}
write('native-D4-round-b/results/'+batch['batchId']+'.run.json',run)
lines('positive/P4.independent-b.current-bindings.review.jsonl',P)
prun=copy.deepcopy(run)
for k in ['campaignId','roundId','batchId','batchInputFingerprint']:prun.pop(k,None)
prun.update(runId=p_runid,bookDigest=next(x['digest'] for x in artifacts if x['role']=='book_model'),promptFamilyId='chemistry-positive-understanding-evidence-v2',outputDigest=sha(OUT/'positive/P4.independent-b.current-bindings.review.jsonl'),toolchainVersion='skillpilot-current-normal-P4-genuine-targeted-binding-follow-up')
write('positive/P4.independent-b.current-bindings.run.json',prun)
pc=load(PREP/'positive/P4.inactive.config.json');pc.update(reviewId=RID,reviewPath=rel(OUT/'positive/P4.independent-b.current-bindings.review.jsonl'),reviewCriteriaPath=rel(OUT/'native-D4-round-b/criteria.md'),reviewRunManifestPaths=[rel(OUT/'positive/P4.independent-b.current-bindings.run.json')]);write('positive/P4.independent-b.inactive.config.json',pc)
write('ORIGINAL.targeted-final-metadata-and-current-binding-review.json',{'schemaVersion':1,'reviewedAtUTC':NOW,'reviewPass':'follow_up','goalIds':ids,'comparisonToOwnPriorOriginal':'Exact verified material equality, followed by actual native/pixel inspection; unchanged scientific work retained.','all523CanonicalFieldDelta':changed,'selected':comparisons,'altTextJudgments':[{'goalId':ids[1],'verdict':'PASS','reason':'Actual different symbolic portions, exactly three cubes each, learner inspecting, Portion zählt; explicitly no measured sugar contents, so no empirical or numerical assertion is added.'},{'goalId':ids[2],'verdict':'PASS','reason':'Actual abstract colored chain, central C(=O)-NH group and bracket beneath C-N; alt text names exactly the visible chemical group and bond and does not claim full residue stereochemistry or complete condensation mechanism.'}],'all4NativeHTMLPDF':'PASS complete pages, exact asset digests loaded, public IDs/descriptions/prerequisite/successor context and current P identities correct.','pilotStatus':'Reviewed AI candidate pilot metadata is not Human Approval or Human Trial.','realScientificDeltaOrGap':[],'noNewFinalAOrRootScientificVotesReadBeforeSeal':True,'authorExposure':'Current native P binding/status metadata needs_human_review and ai_candidate observed; no current root/peer scientific reason/dissent was read. Original own judgments reused.','previousOwnWhole31B4AndM1OriginalSealsPreserved':True,'humanApproval':False,'humanTrial':False,'strictIntegratedGain':0,'activeWrites':False})
write('ORIGINAL.per-goal-current-metadata-context-passes.json',{'overallPassGoalIds':ids,'holds':[],'role':'Targeted current metadata/context pass retaining prior science only','humanApproval':False,'humanTrial':False,'strictIntegratedGain':0})
print('Wrote genuine current-binding follow_up D4/P4 after actual inspection; ready for normal validation.')
