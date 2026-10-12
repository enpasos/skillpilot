import pathlib,json,hashlib,shutil,datetime
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot'); E=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
V9=E/'chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9'
V8=E/'chemie-q3-three-current402-real-method-source-author-20261012-v8'
A=E/'chemie-q3-current217-three-fresh-independent-a-20261012-v9'
B=E/'chemie-q3-current217-three-fresh-independent-b-20261012-v9'
OUT=E/'chemie-q3-three-current402-active-adoption-root-20261012-v10'
LIVE='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
read=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
def put(p,d):
 q=ROOT/p;assert not q.exists(),q;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
def cp(src,dst):
 q=ROOT/dst;assert not q.exists();q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/src,q);assert (ROOT/src).read_bytes()==q.read_bytes()
assert not (ROOT/OUT).exists()
inputs=[(V9/'FINAL.technical-preparation.freeze.json','sha256:c3bcfa6bd12dad76a75d5bbe12ff6c4f74b7b477dd0edb9b2407c212939e784e'),(A/'FINAL.original-a.immutable-seal.json','sha256:ee99c45b277e75b89de585769329c42316b522de3123d31fe3fe3898efcefac4'),(B/'FINAL.independent-b.output.freeze.json','sha256:f0d7d5a26590c475a0883d188d3e4b7c8c38129c4e3fb0de89472c46c6161b74')]
seals=[]
for p,h in inputs:
 assert sha(p)==h,str(p)
 rows=read(p)['ownedFiles']
 for x in rows:
  assert sha(pathlib.Path(x['path']))==x['sha256'],x['path'];assert (ROOT/x['path']).stat().st_size==x['bytes']
 seals.append({'path':str(p),'sha256':h,'verifiedOwnedFiles':len(rows)})
assert sha(V9/'FINAL.current-three-and-source-collaterals.neutral-review-input.json')=='sha256:8404876047d1e7a3380763bbaa08ab31799c464be2064ee2d7dec062e85532d8'
batch=read(V9/'configs/native-D3.current217.batch.config.json');ids=batch['goalIds'];idset=set(ids)
shutil.copytree(ROOT/V9/'native-D3',ROOT/OUT/'native-D3')
batch['outputDirectory']=str(OUT/'native-D3');cfg=OUT/'configs/native-D3.batch.config.json';put(cfg,batch)
manifest=read(OUT/'native-D3/batch-manifest.json');manifest['configPath']=str(cfg);manifest['configDigest']=sha(cfg);(ROOT/OUT/'native-D3/batch-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
# Adopt the original independent native result/run bytes; never reserialize them.
sourceResults=[]
for tag,src in [('a',A/'results'),('b',B/'D/results')]:
 camp=read(OUT/'native-D3'/f'round-{tag}'/'description-review-campaign.json');assert camp['reviewPass']=='first_pass' and camp['blindToOtherReviews']
 for suffix in ['records.jsonl','run.json']:
  matches=list((ROOT/src).glob('*.'+suffix));assert len(matches)==1
  source=matches[0].relative_to(ROOT);dest=OUT/'native-D3'/f'round-{tag}'/'results'/matches[0].name;cp(source,dest);sourceResults.append({'round':tag,'source':str(source),'copy':str(dest),'sha256':sha(source)})
  if suffix=='records.jsonl':
   records=[json.loads(x) for x in matches[0].read_text().splitlines()];assert [x['goalId'] for x in records]==ids;assert all(x['decision']=='keep' for x in records)
# Use the original author P3 and its three distinct review IDs exactly as bound by native V9 pages.
pPath=V8/'positive/P3.current402.author.records.jsonl';cp(pPath,OUT/'positive/P3.original-author.exact.jsonl');pLines=(ROOT/pPath).read_bytes().splitlines(keepends=True);assert len(pLines)==3
criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';assert sha(pathlib.Path(criteria))=='sha256:14b9fe5db2b527baad6e5e488b2e2909f2eeaaeb8d9106a7c072ec6c2d4f12be'
for ordinal,line in enumerate(pLines,1):
 rec=json.loads(line);dest=OUT/'positive'/f'P{ordinal}.original-author.exact.jsonl';(ROOT/dest).write_bytes(line)
 c={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':rec['reviewId'],'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':rec['landscapeId'],'landscapePath':LIVE,'semanticKindLedgerPath':SEM,'reviewCriteriaPath':criteria,'reviewPath':str(dest),'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Genuine paired current T3 review, original native-bound author profile '+str(ordinal),'goalIds':[rec['goalId']]}}
 put(OUT/'active-configs'/f'P{ordinal}.config.json',c);c=dict(c,landscapePath=read(V9/'FINAL.current-three-and-source-collaterals.neutral-review-input.json')['canonical']['path']);put(OUT/'inactive-check-configs'/f'P{ordinal}.config.json',c)
cp(B/'A/atomicity.records.jsonl',OUT/'atomicity/A3.original-independent-b.exact.jsonl');ar=read if False else [json.loads(x) for x in (ROOT/B/'A/atomicity.records.jsonl').read_text().splitlines()];assert {x['goalId'] for x in ar}==idset
ac={'schemaVersion':1,'reviewId':ar[0]['reviewId'],'ruleVersion':'semantic-atomicity-v1','landscapeId':ar[0]['landscapeId'],'landscapePath':LIVE,'reviewPath':str(OUT/'atomicity/A3.original-independent-b.exact.jsonl'),'scope':{'label':'Three genuine independently reviewed current Q3 targets','leafGoalIds':ids}}
put(OUT/'active-configs/A3.config.json',ac);ac=dict(ac,landscapePath=read(V9/'FINAL.current-three-and-source-collaterals.neutral-review-input.json')['canonical']['path']);put(OUT/'inactive-check-configs/A3.config.json',ac)
# Merge only target M3 and actual card009, preserving every other current live raw line.
registry=read(pathlib.Path(REG));chem=next(s for s in registry['subjects'] if s['subject']=='chemie');mConfigPath=pathlib.Path(chem['memoryReviewConfigPath']);mc=read(mConfigPath)
oldMpath=pathlib.Path(mc['reviewPath']);oldCpath=pathlib.Path(mc['cardReviewPath']);oldM=(ROOT/oldMpath).read_bytes().splitlines(keepends=True);oldC=(ROOT/oldCpath).read_bytes().splitlines(keepends=True);assert len(oldM)==402 and len(oldC)==75
cp(oldMpath,OUT/'baseline/current402.actual-active-M.exact.jsonl');cp(oldCpath,OUT/'baseline/current75.actual-active-cards.exact.jsonl');cp(mConfigPath,OUT/'baseline/current-active-M402.config.exact.json')
newMlines=(ROOT/B/'M/target-three.records.jsonl').read_bytes().splitlines(keepends=True);newMs={json.loads(x)['goalId']:x for x in newMlines};assert set(newMs)==idset
mergedM=[newMs.get(json.loads(line)['goalId'],line) for line in oldM];assert len(mergedM)==402
for a,z in zip(oldM,mergedM):
 if json.loads(a)['goalId'] not in idset: assert a==z
cardLine=(ROOT/B/'M/card009.independent.records.jsonl').read_bytes();assert len(cardLine.splitlines())==1;card=json.loads(cardLine);cardkey=(card['deckId'],card['cardId']);hits=0;mergedC=[]
for line in oldC:
 r=json.loads(line)
 if (r['deckId'],r['cardId'])==cardkey:mergedC.append(cardLine);hits+=1
 else:mergedC.append(line)
assert hits==1
for a,z in zip(oldC,mergedC):
 r=json.loads(a)
 if (r['deckId'],r['cardId'])!=cardkey:assert a==z
for name,lines in [('current402.actual399-exact-plus-reviewed3.review.jsonl',mergedM),('current75.actual74-exact-plus-reviewed-card009.cards.review.jsonl',mergedC)]:
 q=ROOT/OUT/'memory'/name;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(b''.join(lines))
mc.update(landscapePath=LIVE,reviewPath=str(OUT/'memory/current402.actual399-exact-plus-reviewed3.review.jsonl'),cardReviewPath=str(OUT/'memory/current75.actual74-exact-plus-reviewed-card009.cards.review.jsonl'),reportPath=str(OUT/'checks/M402.future-active.normal.report.md'))
put(OUT/'active-configs/M402.config.json',mc);mc=dict(mc,landscapePath=read(V9/'FINAL.current-three-and-source-collaterals.neutral-review-input.json')['canonical']['path']);put(OUT/'inactive-check-configs/M402.config.json',mc)
cp(B/'V/exact-three.qa.json',OUT/'visualizations/V3.original-independent-b.exact.qa.json')
# Future-live target QA fields are a technical projection of exact reviewed B records; no approval is invented.
qa=read(B/'V/exact-three.qa.json');qa['source']={'role':'Future active path projection of original independently reviewed B records, no new scientific or human approval','originalPath':str(B/'V/exact-three.qa.json'),'originalSHA':sha(B/'V/exact-three.qa.json')}
for rec in qa['records']:
 rec['landscapePath']=LIVE;rec['canonicalAssetPath']=f"curricula/DE/Gymnasium/visualizations/chemie/{rec['goalId']}/{rec['goalId']}.png"
 assert rec['aiApproved']=='yes' and rec['aiApprovedAssetSha256']==rec['assetSha256'];assert rec['umlautsCorrectChatGpt']=='yes' and rec['contentApprovedChatGpt']=='yes';assert rec['humanApproved']=='no'
put(OUT/'visualizations/V3.future-active-paths.qa.json',qa)
put(OUT/'checks/FIRST.technical-adoption-inputs-and-exact-merge.receipt.json',{'role':'Technical adoption only, no new scientific votes','sealedDependencies':seals,'originalNativeResultCopies':sourceResults,'originalAuthorP3Path':str(pPath),'originalAuthorP3SHA':sha(pPath),'originalAuthorPIDsPreserved':[json.loads(x)['reviewId'] for x in pLines],'nativePagesMustContinueToBindOriginalAuthorP3':True,'freshBPrecordsNotSubstituted':True,'activeMemoryConfigDependency':str(mConfigPath),'activeMemoryConfigSHA':sha(mConfigPath),'activeMemorySourceSHA':sha(oldMpath),'activeCardsSourceSHA':sha(oldCpath),'memoryCount':402,'everyOther399MemoryRawLineExact':True,'cardsCount':75,'everyOther74CardRawLineExact':True,'legacyCurrentYesFieldsRetainedFromActualB':True,'legacyJPEGApprovalsTransferred':False,'newScientificVotes':0,'activeWrites':False,'registrySnapshotPrepared':False,'HumanApproval':False,'HumanTrial':False})
put(OUT/'native-D3/synthesis-authoring.json',{'schemaVersion':1,'manifestId':'chemie-q3-three-current402-actual-paired-first-pass-synthesis-20261012-v10','synthesizedBy':'Codex technical integrator, exact sealed independently authored first-pass A/B results','decisions':[{'goalId':gid,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Die versiegelten unabhängigen Erstprüfungen A und B entscheiden KEEP am exakt aktuellen Drei-Ziele-Kontext. Sie haben die ganzen aktuellen Lernziele, die neun ganzen Fälle, echte native Seiten und Bilder sowie begrenzte Quellbeiträge geprüft. Die tatsächlichen originalen Erstprüfungsbytes und nativen Fingerprints werden unverändert übernommen; die ausgewählte Nachweisformulierung stammt aus Runde A. Die Originalautorenprofile mit ihren verschiedenen Review-IDs bleiben für die Buchseitenbindung exakt erhalten. Die begrenzte SH-Mizellen-Quellenkorrektur an drei bestehenden strikten Zielen ist ausschließlich Quellenrouting, kein neuer D/P-Fachvote. Übrige Literalklauseln, experimentelle Ausführung und breit zusammengesetzte Quellenpflichten bleiben offen. Die technische Übernahme schafft keine neuen wissenschaftlichen Stimmen oder menschliche Freigabe; E1/G1 bleibt KI-Kandidat.','rationaleEn':'The sealed independent first passes A and B return KEEP on the exact current three-goal context after inspecting whole current goals, all nine cases, actual native pages and images, and bounded source contributions. Original first-pass bytes and native fingerprints are adopted unchanged; round A supplies the selected evidence wording. Original author profiles with their distinct review IDs remain exact for native page binding. The bounded SH micelle source correction on three existing strict targets is source routing only, without new D/P scientific votes. Other literal clauses, experimental execution and broader source-union duties remain open. Technical adoption creates no new scientific vote or human approval; E1/G1 remains AI-candidate evidence.'} for gid in ids]})
(ROOT/OUT/'.gitignore').write_text('!native-D3/bundle/book.html\n!native-D3/bundle/book.pdf\n')
print(json.dumps({'prepared':str(OUT),'copiedResults':len(sourceResults),'activeWrites':False,'PfutureConfigCount':3,'memoryOtherRawLinesExact':399,'cardsOtherRawLinesExact':74}))
