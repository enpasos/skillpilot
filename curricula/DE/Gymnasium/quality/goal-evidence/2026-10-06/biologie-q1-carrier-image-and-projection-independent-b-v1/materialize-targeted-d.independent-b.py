import datetime,hashlib,json,pathlib,subprocess
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own=base+'biologie-q1-carrier-image-and-projection-independent-b-v1/'
prepared=base+'biologie-q1-carrier-projection-and-image-targeted-author-v2/'
inputs={}
def bind(path):
 b=(repo/path).read_bytes();inputs[path]=dict(path=path,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b));return b
def read(path):return json.loads(bind(path))
campaign=read(prepared+'round-b/description-review-campaign.json')
batch=read(prepared+'round-b/batches/independent-b.batch-001.input.jsonl')
bundle=read(prepared+'bundle/manifest.json')
goal=batch['goal'];id=goal['goalId']
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
runid='biologie-q1-carrier-image-and-projection-independent-b-v1.batch-001'
parameters=dict(role='independent targeted final-page reviewer B',systemModel='GPT-6',peerAResultsRead=False,priorOwnValidScienceMaterialSourceAndMemoryReviewsRetained=True,actualNewPDFPhysicalPage=3,actualOriginalPNGAnd360680PersonallyViewed=True,hashChangesAreNotScientificVerdicts=True)
(repo/own/'generation-parameters.actual.json').write_text(json.dumps(parameters,indent=2)+'\n')
record={
 '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
 'recordId':'biologie-q1-carrier-image-and-projection-independent-b-v1.carrier','runId':runid,
 'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':batch['bundleFingerprint'],'bookDigest':batch['bookDigest'],
 **{k:goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
 'decision':'keep',
 'understandingEvidence':{
  'essentialUnderstandingDe':'DNA ist im einfachen Modell das Material der Erbinformation. Ein Gen ist ein Abschnitt derselben DNA; das Chromosom organisiert und trägt DNA. Die Begriffe bezeichnen miteinander verbundene Material-, Abschnitts- und Trägerebenen, keine drei getrennten zusätzlichen Informationsträger.',
  'essentialUnderstandingEn':'In the simple model, DNA is the material of genetic information. A gene is a section of the same DNA; a chromosome organises and carries DNA. The terms name connected material, section and carrier levels, rather than three separate additional carriers of information.',
  'observablePerformanceDe':'Die lernende Person verknüpft im vorgegebenen Modell Chromosom, DNA und markierten Genabschnitt selbst und begründet die Teil-Ganzes-Beziehungen. Sie erklärt, weshalb ein Chromosom mehrere Genabschnitte tragen kann und seine Anzahl allein keine Gesamtzahl der Gene bestimmt.',
  'observablePerformanceEn':'The learner independently relates chromosome, DNA and the marked gene section in the supplied model and justifies their part-to-whole relationships. They explain why a chromosome can carry several gene sections and why chromosome number alone does not determine total gene number.',
  'transferExpectationDe':'In einer neuen Darstellung, die vom DNA-Ausschnitt statt vom ganzen Chromosom ausgeht oder denselben Abschnitt auf zwei vorgegebenen Chromosomen zeigt, stellt die lernende Person dieselbe Material-/Abschnitts-/Trägerbeziehung her. Eine vorgegebene Änderung innerhalb des Abschnitts wird von einem zusätzlichen Chromosom unterschieden, ohne eine neue Allel-, Erbgangs- oder Genproduktkompetenz zu verlangen.',
  'transferExpectationEn':'In a new representation starting from a DNA detail rather than the whole chromosome, or showing the same section on two supplied chromosomes, the learner establishes the same material/section/carrier relationship. A supplied change within the section is distinguished from an additional chromosome without requiring a new competence about alleles, inheritance patterns or gene products.'},
 'rationale':'KEEP. Tatsächlich betrachtete native PDF-Seite physisch 3 und vollständiges HTML zeigen denselben unveränderten deutschen Zieltext; der gesamte englische Zieltext beansprucht dieselbe einfache Strukturrelation. Die neue kontinuierliche DNA-Geometrie und äußere Genmarkierung unterstützen diese Relation ohne Text-/Bildwiderspruch oder abgeschnittene Darstellung. Der gebundene Alt-Text begrenzt Größen und Abschnittslänge. Beide vollständigen bilingualen Originalmaterialien classical-carriers-a/b wurden im gezielten P-Folgepass erneut gelesen; vorgegebene Varianten werden nur auf dieselbe Strukturrelation übertragen. Persönlich erhaltene BE/BB-Originalquelle ist komponentenbegrenzt; die reale Seite zeigt nur BE/BB Sek I G8/G9 als direkte Geltung. Die sechs separat nativ geprüften vollständigen Landes-Views bewahren die bisherigen Ziele und setzen den Carrier in MV/SN/TH/ST Sek II ausdrücklich prerequisiteOnly. Raw applicability wird nicht zu zusätzlicher direkter Quellenabdeckung erklärt. Bild/Labelwiederholung allein zeigt kein selbstständiges Verständnis. Neues Bild und neue Seitenfingerprints sind konkret geprüft, kein Hash-only-KEEP. Kein direktes requires nötig. Menschliche Freigabe und Lerner-Evidenz werden nicht behauptet.',
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'
}
results=repo/own/'results';results.mkdir(exist_ok=True)
out=(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n').encode();(results/'independent-b.batch-001.records.jsonl').write_bytes(out)
artifacts=[]
for item in bundle['artifacts']:
 path=prepared+'bundle/'+item['path'];b=bind(path)
 if 'sha256:'+hashlib.sha256(b).hexdigest()!=item['digest'] or len(b)!=item['bytes']:raise AssertionError('Native artifact changed: '+path)
 artifacts.append(dict(role=item['role'],digest=item['digest']))
artifacts.append(dict(role='description_review_batch_input_jsonl',digest='sha256:'+hashlib.sha256(bind(prepared+'round-b/batches/independent-b.batch-001.input.jsonl')).hexdigest()))
run={
 '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':'independent-b.batch-001',
 'batchInputFingerprint':campaign['batches'][0]['batchInputFingerprint'],'bundleFingerprint':batch['bundleFingerprint'],'bookDigest':batch['bookDigest'],
 'provider':'OpenAI','model':'GPT-6','role':'subject_reviewer','promptFamilyId':'goal-description-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':'sha256:'+hashlib.sha256((repo/own/'generation-parameters.actual.json').read_bytes()).hexdigest(),
 'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[id],
 'inputArtifacts':artifacts,'startedAt':read(own+'carrier-corrected-geometry-v.independent-b.actual.json')['createdAtUTC'],'completedAt':now,'status':'completed',
 'outputDigest':'sha256:'+hashlib.sha256(out).hexdigest(),'toolchainVersion':'skillpilot-goal-description-review-v2'
}
(results/'independent-b.batch-001.run.json').write_text(json.dumps(run,indent=2)+'\n')
cmd=['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',prepared+'bundle/manifest.json','--input',prepared+'round-b/description-review-input.json','--campaign',prepared+'round-b/description-review-campaign.json','--batches-dir',prepared+'round-b/batches','--results-dir',own+'results']
r=subprocess.run(cmd,cwd=repo,capture_output=True)
(repo/own/'native-d-validator.actual.stdout.txt').write_bytes(r.stdout);(repo/own/'native-d-validator.actual.stderr.txt').write_bytes(r.stderr)
(repo/own/'native-d-validator.actual.json').write_text(json.dumps(dict(schemaVersion=1,completedAtUTC=now,commandArgv=cmd,actualExitCode=r.returncode,nativeCheckerUnmodified=True,gateWeakening=False,activeWrites=False),indent=2)+'\n')
(repo/own/'native-d-actual-input-bindings.json').write_text(json.dumps(dict(allActualInputs=list(inputs.values())),indent=2)+'\n')
print(r.stdout.decode());print('Native targeted D-B exit',r.returncode)
if r.returncode:raise SystemExit(r.returncode)
