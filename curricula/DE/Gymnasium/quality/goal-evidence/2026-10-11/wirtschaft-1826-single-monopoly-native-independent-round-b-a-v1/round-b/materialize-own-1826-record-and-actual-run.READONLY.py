import datetime, hashlib, json, pathlib, subprocess
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).resolve().parent
SRC=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-deferrals-native-one-and-eleven-reviewer-split-AUTHOR-INERT-v1/native/one-monopoly'
ROUND=SRC/'round-b'
gid='1826fe19-4d06-5183-9b41-9121ae1cc219'
runId='wirtschaft-current346-monopoly-1826-independent-native-b-a-20261011-v1'
guards={}
def bind(p):
 p=pathlib.Path(p);b=p.read_bytes();d={'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)};guards[d['path']]=d;return d
def read(p):bind(p);return json.loads(pathlib.Path(p).read_text())
def write(p,v):
 assert not p.exists();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
headBefore=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
meta={'provider':'OpenAI','model':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed','generationMetadataKind':'actual-known-session-metadata-not-inferred-sampling','runId':runId,'nativeRecordAssemblyStartedAt':started,'contentReadPhase':'Whole assigned native input, both full DE/EN P cases, supplied eight partial source atom/parent/decision boundaries and actual current bound PNG were read before this final record assembly; no precise earlier read-start timestamp is reconstructed.','independence':'Current other round results not read; supplied original unresolved split history was explicitly disclosed and read. Reviewer did not author current1826Goal/P, whose author is Plan. Earlier own BY partial-source and NI selected-case source examinations are disclosed and confer no independent new source approval here.'}
write(OUT/'actual-generation-metadata.json',meta)
params='sha256:'+hashlib.sha256((OUT/'actual-generation-metadata.json').read_bytes()).hexdigest()
input=read(ROUND/'description-review-input.json');campaign=read(ROUND/'description-review-campaign.json');bundle=read(ROUND/'review-bundle-manifest.json')
batchPath=next((ROUND/'batches').glob('*.input.jsonl'));batchBytes=batchPath.read_bytes();bind(batchPath);batchLine=json.loads(batchBytes);g=batchLine['goal']
assert g==input['goals'][0] and campaign['goalCount']==input['goalCount']==1 and g['goalId']==gid
assert bind(batchPath)['sha256']==campaign['batches'][0]['batchInputFingerprint']
canonPath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';canon=read(canonPath);actualGoal=next(x for x in canon['goals'] if x['id']==gid)
assert all(actualGoal[actual]==g[supplied] for actual,supplied in [('title','currentTitleDe'),('titleEn','currentTitleEn'),('description','currentDescriptionDe'),('descriptionEn','currentDescriptionEn')])
asset=ROOT/'app/public'/actualGoal['resourceLinks'][0]['url'].lstrip('/');assetBind=bind(asset)
assert assetBind['sha256']==g['reviewContext']['page']['visualization']['originalDigest']
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');subject=next(x for x in registry['subjects'] if x['subject']=='wirtschaftswissenschaften')
activeProfile=None
for cfgPath in subject['positiveEvidenceConfigPaths']:
 cfg=read(ROOT/cfgPath)
 if gid not in cfg.get('scope',{}).get('goalIds',[]):continue
 rowsPath=ROOT/cfg['reviewPath'];bind(rowsPath)
 for line in rowsPath.read_text().splitlines():
  r=json.loads(line)
  if r['goalId']==gid:activeProfile=r
assert activeProfile==g['reviewContext']['evidenceProfile']
sharedInput=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-historical-D-deferrals-current-native-inputbundle-AUTHOR-INERT-v1/actual-twelve-whole-current-goals-P24-native-page-bindings-original-findings-and-author-boundaries.INPUT.json'
shared=read(sharedInput);assigned=next(x for x in shared['goals'] if x['goalId']==gid)
assert assigned['wholeCurrentGoal']==actualGoal
sourcePath=ROOT/assigned['originalCurrentSourceContextArtifact']['path'];source=read(sourcePath)['goalSourceContexts'][gid]
assert len(source)==8 and all(x['edge']['matchType']=='partial' for x in source)
for p in [ROUND/'prompt.md',ROUND/'criteria.md',ROUND/'contracts/goal-description-review-record.schema.json',SRC/'bundle/contracts/goal-evidence-ai-run-manifest.schema.json',ROOT/'AGENTS.md',ROOT/'app/scripts/validateGoalDescriptionReviewCampaign.ts',ROOT/'app/scripts/validateGoalEvidenceFindings.ts',ROOT/'app/scripts/goalBookModel.ts',ROOT/'app/node_modules/tsx/package.json']:bind(p)
write(OUT/'actual-assigned-input-start-guards.json',{'actualUTC':started,'HEAD':headBefore,'nativeInputHeadDeclared':shared['currentCanonicalBinding'],'assignedGoalId':gid,'currentOtherRoundResultsRead':False,'readBindings':list(guards.values())})
record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runId+'-1826','runId':runId,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':batchLine['bundleFingerprint'],'bookDigest':batchLine['bookDigest']}
for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:record[k]=g[k]
record.update({'decision':'keep','understandingEvidence':{
 'essentialUnderstandingDe':'Tatsächliche Marktmacht ohne wirksame Ausweich- und Eintrittsmöglichkeiten kann eine privat gewinnträchtige Preis-/Mengenbeschränkung ermöglichen. Ob deshalb vorteilhafte Geschäfte ausbleiben, hängt von den gegebenen Nachfrage- und Kostenbedingungen sowie tatsächlich bindenden Regeln ab; ein einzelner Anbieter allein beweist keine ineffiziente Versorgung.',
 'essentialUnderstandingEn':'Actual market power without effective alternatives or entry can enable a privately profitable price/output restriction. Whether beneficial trades are then forgone depends on supplied demand, cost conditions and genuinely binding rules; one supplier alone does not establish inefficient service.',
 'observablePerformanceDe':'Die Person erklärt den gegebenen Optionsvergleich: (40−20)×60=1200, (60−20)×40=1600 und (80−20)×10=600, daher gewinnorientierte Wahl60/40 gegenüber Wettbewerbsreferenz20/100. Sie verbindet die Mengenbeschränkung mit fehlendem Ausweichen und Eintritt, erläutert die im Material möglichen ausgelassenen Geschäfte und trennt diesen begrenzten Mechanismus von einer nicht belegten allgemeinen Optimal- oder Wohlfahrtsrechnung.',
 'observablePerformanceEn':'The learner explains the supplied options: (40−20)×60=1200, (60−20)×40=1600 and (80−20)×10=600, hence a profit-driven60/40choice against the20/100competitive reference. They connect restricted output with missing alternatives and entry, explain the possible forgone trades stipulated in the materials and distinguish that bounded mechanism from an unestablished general optimum or welfare calculation.',
 'transferExpectationDe':'In einem unabhängig gegebenen neuen Versorgungsfall verändert eine tatsächlich durchgesetzte Preis- und Bedienpflicht die zulässige Wahl, obwohl nur ein Anbieter bleibt: bei Kosten5 und Kapazität50 wird5/50 statt unreguliert10/30 verlangt. Eine weitere Variation gibt nur eine Preisobergrenze ohne Bedienpflicht oder eine geringere Kapazität vor; die Person prüft dann neu, ob ausreichende Versorgung wirklich folgt, statt die Firmenzahl oder das bloße Vorhandensein einer Regel als Beweis zu übernehmen.',
 'transferExpectationEn':'In a fresh independent service case, an actually enforced price-and-service obligation changes feasible choices despite a single supplier: cost5 and capacity50 permit required5/50instead of unregulated10/30. A further variation supplies only a price cap without a service obligation, or lower capacity; the learner reassesses whether adequate delivery follows rather than treating firm count or merely having a rule as proof.'
 },'rationale':'KEEP nach tatsächlicher ganzer aktueller DE/EN-, P2-, Seiten-, CAN-Kontext- und Bildlektüre. Der historische offengelegte Deferral betraf drei eigenständig erklärbare Mechanismen; der aktuelle Vertrag umfasst genau den Marktmacht-/Zugang-/Preis-Mengen-Mechanismus und dessen Bedingungen. Er verlangt weder Informationsasymmetrien noch öffentliche Güter, eine genaue Wohlfahrtsverlustrechnung, weitere Eingriffsbewertungen oder auswendig gelernte Gewinnformeln. Beide ganzen P-Fälle sind rechnerisch stimmig:1200/1600/600; Fähre150gegen0, mit tatsächlich bindender Lizenz5/50 und gedeckten Kosten. Die Lizenzvariation ist ein echtes Gegenbeispiel zur Gleichsetzung eines Anbieters mit ineffizienter Mengenbeschränkung, keine zusätzliche Politikkompetenz. Voraussetzung Konzentration und getrennte Praxisnachfolger erklären den Lernweg, ohne deren volle Aufgaben zum eigenen Ziel zu machen. Das tatsächlich betrachtete Bild trennt Wettbewerbsvorstellung, aktiven Anbieter und gesperrten Eintritt und lässt Preis/Menge/Regeln/Nachfrage/Kosten offen. Acht gelieferte Teilquellenbindungen bleiben Teilbindungen: HE-Snapshot ist kein amtliches Vollzitat, NI ein ausgewähltes Ergebnisprüfungsbeispiel, BY breiteres Eingriffsurteil und BB/TH haben eigene LK-/eA-Grenzen. Keine ganze Länderpflicht oder neue Quellen-/Bildfreigabe. E1/G1/ai_candidate/needs_human_review bleibt bestehen. Current bilingual wording expresses the same conditional AB2 causal explanation; the supplied P already covers meaningful rule variation. Historical deferral exposure and earlier own partial-source work are disclosed; current round-A results were not read.','evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
recordsPath=OUT/'results'/f'{campaign["batches"][0]["batchId"]}.records.jsonl';assert not recordsPath.exists();recordsPath.write_text(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n')
artifactInputs=[]
for a in bundle['artifacts']:
 p=SRC/'bundle'/a['path'];assert bind(p)['sha256']==a['digest'];assert p.stat().st_size==a['bytes'];artifactInputs.append({'role':a['role'],'digest':a['digest']})
artifactInputs.append({'role':'description_review_batch_input_jsonl','digest':campaign['batches'][0]['batchInputFingerprint']})
completed=datetime.datetime.now(datetime.timezone.utc).isoformat()
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runId,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':campaign['batches'][0]['batchId'],'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],'bundleFingerprint':batchLine['bundleFingerprint'],'bookDigest':batchLine['bookDigest'],'provider':'OpenAI','model':'GPT-6','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':params,'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[gid],'inputArtifacts':artifactInputs,'startedAt':started,'completedAt':completed,'status':'completed','outputDigest':'sha256:'+hashlib.sha256(recordsPath.read_bytes()).hexdigest(),'toolchainVersion':'node20.20.2-tsx4.21.0-native-description-review-v3'}
runPath=OUT/'results'/f'{campaign["batches"][0]["batchId"]}.run.json';write(runPath,run)
end=[]
for path,before in list(guards.items()):
 p=ROOT/path;b=p.read_bytes();after={'path':path,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)};assert after==before;end.append(after)
write(OUT/'actual-assigned-input-end-guards.json',{'actualUTC':completed,'HEADbefore':headBefore,'HEADend':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'allInputBytesUnchanged':True,'activeWrites':0,'inputBindings':end,'declaredHistoryBoundary':'Original unresolved three-mechanism split was supplied; current independent other-round outputs remain unread. Previous source authorship is disclosed, no own current goal/P authorship.'})
print(json.dumps({'records':str(recordsPath.relative_to(ROOT)),'run':str(runPath.relative_to(ROOT)),'decision':'keep','guards':len(end),'generationParametersFingerprint':params}))
