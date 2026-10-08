# SPDX-License-Identifier: Apache-2.0
"""First own review of corrected current1; original18 history stays immutable."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,subprocess

ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
TECH=OWN.parent/'biologie-he-evolution-one-cat-raster-native-followup-technical-20261008-v2'
FIRST=OWN.parent/'biologie-he-evolution-one-current-subset-first-pass-neutral-root-20261008-v3'
ORIGINAL=OWN.parent/'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1'
OLD=OWN.parent/'biologie-he-evolution-eighteen-final-raster-native-independent-a-20261008-v1'
GID='7008979d-7890-5f7b-ad07-27b8bb597cbe'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def lines(p):return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,v):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def verify(b):
    p=ROOT/b['path'];assert sha(p)==b['sha256'].removeprefix('sha256:') and p.stat().st_size==b['bytes'],p

started=datetime.now(timezone.utc).isoformat()
firstseal=FIRST/'neutral-current-one-first-pass.first.freeze.json';assert sha(firstseal)=='03a18c9958d077955fe25baabeeb65716ac0c655fbc79f740427404475e64b5b'
firstfiles=read(firstseal)['files'];assert len(firstfiles)==18
for b in firstfiles:verify({**b,"path":str(FIRST/b["relativePath"])})
techseal=TECH/'one-cat-current392-targeted-native-author.first-followup-input.freeze.json'
assert sha(techseal)=='102ebfbaa0f4aaaa08ee7d50270b7364c2077d6fa656d194ad4eebea7e510242'
techfiles=read(techseal)['ownFiles'];assert len(techfiles)==186
for b in techfiles:verify(b)
entry=read(FIRST/'neutral-current-one-first-pass.entry.json');assert entry['targetGoalId']==GID
assert entry['oneSubsetContextIsAuthoritativeForNewD1'] and entry['noHelperToEighteenFingerprintAdoption']
whole=next(g for g in read(ORIGINAL/'current-eighteen-whole-DEEN-goals.actual.json')['goals'] if g['id']==GID)
oldjudgment=next(r for r in read(OLD/'actual-eighteen-current-D-P-V.independent-a.first.verdict.json')['records'] if r['goalId']==GID)
assert whole==oldjudgment['wholeGoalBody']
oldlines=(ORIGINAL/'positive/P18.current-whole.actual-raster-author.review.jsonl').read_text().splitlines()
newlines=(TECH/'positive/P18.only-one-current-PNG-rebound.seventeen-lines-exact.jsonl').read_text().splitlines()
oldby={json.loads(s)['goalId']:s for s in oldlines};newby={json.loads(s)['goalId']:s for s in newlines}
assert len(oldby)==len(newby)==18 and all(s==newby[g] for g,s in oldby.items() if g!=GID)
profile=json.loads(newby[GID]);oldprofile=json.loads(oldby[GID]);assert profile['profile']==oldprofile['profile'] and profile['profileFingerprint']==oldprofile['profileFingerprint']
assert profile['status']=='needs_human_review' and profile['reviewAuthority']=='ai_candidate' and profile['evidenceLevel']=='E1' and profile['maximumClaimScope']=='G1'
cases=read(ORIGINAL/'whole-science/eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json')
wholecases=[c for c in cases['wholeCases'] if c['goalId']==GID];assert wholecases==oldjudgment['wholeDEENCases']
cap=read(TECH/f'width-captures/{GID}/chromium-captures.actual.json')
assert cap['sourceSha256']=='cae551e813945967b2dc9d889ab04517da989fcfa131d5b1911e431d27033758'
for c in cap['captures']:
    assert sha(ROOT/c['path'])==c['sha256'];assert c['measured']['renderedWidth']==c['width'] and c['measured']['objectFit']=='contain'
observed=read(OWN/'pre-native-fullPNG-targeted-v2.actual-observation.independent-a.json')
png=ROOT/observed['actualFullPNGViewed']['path'];assert sha(png)==cap['sourceSha256']
one=read(TECH/'native/one-targeted-followup/book-model.json')['pages'];assert len(one)==1
page=one[0];assert page['goalId']==GID and page['title']==whole['title'] and page['description']==whole['description']
assert page['visualization']['originalDigest']=='sha256:'+sha(png)
full18=read(TECH/'native/eighteen-same-context/book-model.json')['pages'];operative=next(p for p in full18 if p['goalId']==GID)
assert page['pageFingerprint']=='sha256:fed93410a16261239304ab60b463267b7dde433d6f2e5d62060848b0640662ba'
assert operative['pageFingerprint']=='sha256:3a09a8eb8cd3ff0f7709c0122a5682abbccdaff3695cbb706249a4359b50fbf6'
assert {r['goalId'] for r in page['reverseRequires']+page['externalReverseRequires']}=={r['goalId'] for r in operative['reverseRequires']+operative['externalReverseRequires']}
assert page['requires']==operative['requires'] and page['externalPrerequisites']==operative['externalPrerequisites']
for k in ['title','description','breadcrumbs','chapterIds','applicability','visualization','goalFingerprint']:assert page[k]==operative[k]
pdf=subprocess.run(['pdftotext','-layout',str(ROOT/entry['actualCurrentOnePDF']),'-'],capture_output=True,text=True);assert pdf.returncode==0
assert GID in pdf.stdout and whole['description'] in pdf.stdout.replace('\n',' ')
with (OWN/'actual-current-one-native-whole-text.independent-a.txt').open('x') as f:f.write(pdf.stdout)
reason=observed['actualReasonDe']+' Beide tatsächlichen Browsergrößen360/680, die ganze neue1er-Buchseite3 und die originale18er-Kontextseite6 sind jetzt zusätzlich persönlich angesehen. Fünfstrahliges distales Muster und durchgängige Farblagen sind in diesen Ansichten schlüssig. Der wichtige Vergleich ist ohne Kleinschrift erkennbar. Fossilfolge und Homologie bleiben verschiedene Belegtypen; das Bild liefert weder direkte Vorfahrengewissheit noch einen Kompetenzbeweis. Endosymbiose bleibt im ganzen DE/EN-Ziel und den unveränderten beiden Fällen erhalten. Native1 zeigt dieselben Voraussetzungen und Nachfolger, zwei Nachfolger lediglich als externe kanonische Links statt interner Seitenlinks. Der1er-Kontext ist eigenständig gültig und wird niemals als18er-Fingerprint ausgegeben.'
write(OWN/'actual-current-one-D-P-V.independent-a.first.verdict.json',{
 'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),'role':'Genuine first independent A D1/P1/V1 review of actual corrected current one native subset, informed original history retained',
 'goalId':GID,'wholeCurrentGoal':whole,'wholeDEENCases':wholecases,'wholeCurrentPRecord':profile,
 'descriptionDecision':'KEEP','positiveDecision':'PASS scoped E1/G1 synthetic whole profile, needs_human_review','visualizationDecision':'KEEP',
 'reasonDe':reason,'retainedOriginalWholeScienceReason':oldjudgment['wholeScienceReason'],'retainedBoundedSourceDecision':oldjudgment['genuineRetainedBoundedSourceDecision'],
 'actualFullPNG':bind(png),'actualWidths':[bind(ROOT/c['path']) for c in cap['captures']],
 'actualWholeNativeOnePhysical3':bind(TECH/'native/one-targeted-followup/actual-physical-pages/actual-physical-page-3.png'),
 'actualAdditionalWholeNativeEighteenPhysical6':bind(TECH/'native/eighteen-same-context/actual-physical-pages/actual-physical-page-06.png'),
 'actualNewOnePageFingerprint':page['pageFingerprint'],'additional18PageFingerprintNotSubstituted':operative['pageFingerprint'],
 'newOneSubsetGoalReviewContextFingerprint':'sha256:b30963b3cf5d230b89a777ae4ab884fa1a1c97273ba772b855d92f73aef61dcb',
 'wholeProfileAndCasesUnchanged':True,'other17PRecordLinesExact':True,'other17NewScienceReviewsOrRuns':0,
 'originalAFirstAndFinalJudgmentsUnchanged':True,'originalPeerB18ReadAfterOwnOriginalFirstAndFinal':True,'currentPeerTargetedBFilesRead':0,
 'originalReportedFindingId':'EVOLUTION-HOMOLOGY-CAT-DIGITS','findingDisposition':'RESOLVED on actual corrected current image in own scoped review; final paired closure remains Root task',
 'blockingFindings':[],'nativeD1CLIAndP1API':'pending after own first judgment seal','ordinaryRasterPCLI':'pending installation',
 'humanApproval':False,'humanTrial':False,'realLearnerEvidence':False,'performedExperiments':0,'activeWrites':0,'strictGainClaimed':0})
rounda=ROOT/entry['roundA'];campaign=read(rounda/'description-review-campaign.json');inp=read(rounda/'description-review-input.json');bundle=read(rounda/'review-bundle-manifest.json')
assert campaign['goalCount']==campaign['batchSize']==1 and campaign['reviewPass']=='first_pass' and campaign['blindToOtherReviews']
assert len(inp['goals'])==1;g=inp['goals'][0];assert g['goalId']==GID and g['pageFingerprint']==page['pageFingerprint']
batch=campaign['batches'][0];runid=OWN.name+'.corrected-current-one-first-pass'
ex=profile['profile']['expectations'];evidence={}
for suffix in ['De','En']:
    evidence['essentialUnderstanding'+suffix]=' '.join(r['essentialUnderstanding'+suffix] for r in ex)
    evidence['observablePerformance'+suffix]=ex[0]['observablePerformance'+suffix]
    evidence['transferExpectation'+suffix]=ex[-1]['observablePerformance'+suffix]
record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
 'recordId':runid+'.'+GID,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
 'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
 **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
 'decision':'keep','understandingEvidence':evidence,'rationale':oldjudgment['wholeScienceReason']+' '+reason+' Quelle bleibt genuine boundedPrimaryCompetencyComponent, keine volle144Freigabe oder universelle Operatorpflicht. Keine menschliche Freigabe oder reale Lernerleistung.',
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
out=OWN/'current-one-first-round-a/results';out.mkdir(parents=True,exist_ok=True);rp=out/(batch['batchId']+'.records.jsonl')
with rp.open('x') as f:f.write(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
 'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
 'provider':'OpenAI','model':'Codex actual independent A; serving revision not exposed','role':'subject_reviewer',
 'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Own actual first corrected-one native review; original18 history preserved; sampling not exposed').hexdigest(),
 'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[GID],
 'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
 'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(rp),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(out/(batch['batchId']+'.run.json'),run)
write(OWN/'current-corrected-one-D-P-V.independent-a.first.freeze.json',{
 'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'role':'Own genuine blind first corrected-current-one D/P/V judgment; original history preserved',
 'nativeFirstPassInputSeal':bind(firstseal),'technicalActualRasterSourceInputSeal':bind(techseal),
 'ownFiles':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],'DKEEP':1,'PScopedSciencePASS':1,'VActualKEEP':1,'blockingFindings':[],
 'currentPeerTargetedBFilesRead':0,'original18PriorPeerReadTransparent':True,'ordinaryRasterPCLI':'pending integration',
 'nativeD1CLIAndP1API':'pending actual execution after this seal','humanApproval':False,'activeWrites':0,'strictGainClaimed':0})
print(json.dumps({'firstSeal':bind(OWN/'current-corrected-one-D-P-V.independent-a.first.freeze.json'),'D1KEEP':1,'P1ScopedPASS':1,'V1KEEP':1,'blocking':0}))
