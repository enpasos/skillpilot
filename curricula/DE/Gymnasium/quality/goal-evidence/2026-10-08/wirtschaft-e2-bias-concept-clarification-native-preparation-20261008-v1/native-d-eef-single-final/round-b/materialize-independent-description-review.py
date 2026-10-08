#!/usr/bin/env python3
"""Apache-2.0 serialization; own curricular evidence text CC-BY-4.0.
Actual independent EEF D-B reading precedes later targeted P/A/M delta review.
"""
import hashlib,json
from pathlib import Path
from datetime import datetime,timezone

P=Path(__file__).resolve().parent
B=P.parent/'bundle'
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def new(p,x):
 if p.exists():raise RuntimeError('Preserve existing '+str(p))
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
x=json.loads((P/'description-review-input.json').read_text())
c=json.loads((P/'description-review-campaign.json').read_text())
m=json.loads((P/'review-bundle-manifest.json').read_text())
book=json.loads((B/'book-model.json').read_text())
batch=c['batches'][0];g=x['goals'][0]
batchfile=P/'batches'/(batch['batchId']+'.input.jsonl')
assert digest(batchfile)==batch['batchInputFingerprint']
assert json.loads(batchfile.read_text())['goal']==g
assert book['pages'][0]==g['reviewContext']['page']
assert g['reviewContext']['evidenceProfile'] is None
run='wirtschaft-eef-single-independent-description-round-b-codex-20261008-v1'
ev={
 'essentialUnderstandingDe':'Bias-Konzepte erklären mögliche systematische Einflüsse auf Entscheidungen: Status-quo-Bias betrifft das Festhalten an einer bestehenden Wahl, Framing die Darstellung eines sachlich gleichen Entscheidungsproblems und Anchoring einen wirksamen Ausgangs- oder Vergleichswert. Eine solche Erklärung ist von passenden Präferenzen, sachlichen Produktunterschieden und tatsächlichen Wechselkosten zu unterscheiden; eine einzelne Kaufwahl beweist den Bias nicht.',
 'essentialUnderstandingEn':'Bias concepts explain possible systematic influences on decisions: status-quo bias concerns sticking with an existing choice, framing concerns the presentation of an objectively equivalent decision problem, and anchoring concerns an influential starting or comparison value. Such an account must be distinguished from relevant preferences, actual product differences and real switching costs; one purchase does not establish a bias.',
 'observablePerformanceDe':'In einem ausdrücklich fiktiven Konsumfall wird dieselbe Produkteigenschaft einmal als Anteil zuverlässig funktionierender Geräte und einmal als komplementärer Ausfallanteil dargestellt. Die lernende Person wendet Framing auf diese äquivalenten Angaben an, erklärt den möglichen Einfluss auf die Einschätzung und zeigt, welche sachlichen Informationen unverändert bleiben. Sie benennt, welche zusätzliche Vergleichsbeobachtung für eine behauptete tatsächliche Wirkung nötig wäre.',
 'observablePerformanceEn':'In an explicitly fictional consumption case, the same product characteristic is presented once as the proportion of reliably functioning devices and once as the complementary failure proportion. The learner applies framing to these equivalent statements, explains a possible influence on judgement and shows which factual information stays unchanged. They identify an additional comparative observation needed to claim an actual effect.',
 'transferExpectationDe':'Eine neue unabhängige Aufgabe ersetzt die Darstellungsvariation durch eine bestehende Abowahl mit einer im Fall gleichwertigen Alternative und ausdrücklich geklärten Wechselkosten. Die lernende Person wendet das passende Status-quo-Konzept auf die geänderte Entscheidungsstruktur an und grenzt eine mögliche Bestandspräferenz von begründetem Festhalten wegen Nutzen oder Aufwand ab; alternativ präsentierte Vergleichspreise wären anhand ihrer Ankerfunktion zu begründen, nicht als derselbe Mechanismus umzubenennen.',
 'transferExpectationEn':'A fresh independent task replaces the presentation variation with an existing subscription choice, an alternative stipulated as equivalent in the case, and explicitly clarified switching costs. The learner applies the appropriate status-quo concept to the changed decision structure and distinguishes a possible preference for the existing choice from justified retention due to benefits or effort; alternatively presented comparison prices would need to be explained through their anchoring role rather than renamed as the same mechanism.'
}
rationale='KEEP: Die aktuelle DE/EN-Beschreibung benennt ausdrücklich die Anwendung von Konzepten auf Konsumentscheidungen. Status-quo-Bias, Framing und Anchoring sind Beispiele eines verhaltensökonomischen Anwendungsfelds; der Satz legt weder unabhängige Volltheorienprüfungen noch eine einheitliche Ursache jeder Kaufentscheidung fest. Der Verbraucherverhaltensvorgänger trennt Präferenzen und Restriktionen vom möglichen Bias; der externe E-Assessment-Link ist Kontext, keine Vollabdeckungsbehauptung. Die tatsächliche Bildseite orientiert an unterschiedlicher Hervorhebung gleicher Rucksäcke, ohne einen sicheren Kaufeffekt zu zeigen. Das eingefrorene Profil ist null und wird ausdrücklich mit create behandelt.'
r={
 '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
 'recordId':run+'.001','runId':run,'campaignId':c['campaignId'],'roundId':c['roundId'],
 'bundleFingerprint':x['bundleFingerprint'],'bookDigest':x['bookDigest'],
 **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
 'decision':'keep','understandingEvidence':ev,'rationale':rationale,
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create',
 'recordStatus':'candidate','reviewAuthority':'ai_candidate'
}
out=P/'results';out.mkdir(exist_ok=True)
record=out/(batch['batchId']+'.records.jsonl')
if record.exists():raise RuntimeError('Preserve old record')
record.write_text(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
completed=datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
par=P/'observed-generation-parameters.actual.json'
new(par,{'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed','agentIdentity':'/root/economics_layer_a','temperature':'not exposed','seed':'not exposed','method':'Actual full own-round input/criteria/contracts reading and actual native PDF goal-page inspection; independent concept-specific bilingual chains authored before consulting the current targeted positive/A/M successor package.','blindToCurrentRoundA':True,'authorPreferredVerdictRead':False,'priorRelatedWorkDisclosure':'The agent previously performed independent E2-20 P parity review and D-B on the earlier goal wording and authored the phase-assessment drafts subsequently independently reviewed by root. Those historical outputs were not reread for this new D pass. No other current D output, clarification diff or new P successor record was consulted before this record.','humanReviewClaimed':False,'learnerPerformanceClaimed':False})
roles=['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria','finding_schema','run_manifest_schema']
art=[{'role':a['role'],'digest':a['digest']} for a in m['artifacts'] if a['role'] in roles]
art.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
runfile=out/(batch['batchId']+'.run.json')
new(runfile,{'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':x['bundleFingerprint'],'bookDigest':x['bookDigest'],'provider':'OpenAI','model':'Codex session; exact model identifier not disclosed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':digest(par),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':art,'startedAt':'2026-10-08T07:11:00Z','completedAt':completed,'status':'completed','outputDigest':digest(record),'toolchainVersion':'skillpilot-native-d-v2-input-v3-record-v1-codex-actual-tools'})
new(P/'independent-description-page-inspection.actual.json',{
 'schemaVersion':1,'reviewId':run,'agentIdentity':'/root/economics_layer_a','provider':'OpenAI','model':'Codex session; exact model identifier not disclosed','reviewAuthority':'ai_candidate','completedAt':completed,
 'bundleFingerprint':x['bundleFingerprint'],'bookDigest':x['bookDigest'],'recordsDigest':digest(record),'runDigest':digest(runfile),'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
 'actualWholeDeEnGoalRead':True,'actualWholeCanonicalContextRead':True,'actualNativePdfGoalPageViewed':True,'pdfPhysicalPage':3,'bookPdfDigest':digest(B/'book.pdf'),'inspectionDerivative':'inspection/frozen-native-pdf-page-3.png','inspectionDerivativeDigest':digest(P/'inspection/frozen-native-pdf-page-3.png'),
 'actualPageFinding':'Die vollständige tatsächliche PDF-Seite zeigt zwei gleiche Rucksäcke, einen als empfohlen hervorgehoben, und Gedanken an Budget und Nutzung. Sie illustriert unterschiedliche Darstellung, nicht einen Beweis psychologischer Verursachung. Die Abbildung muss nicht alle im Ziel beispielhaft genannten Konzepte darstellen. Beschreibung, externe Verbraucherverhaltensvoraussetzung und E-Assessment-Nachfolger sind ungekürzt vorhanden.',
 'actualSourcesRead':[
  {'url':'https://rzeckhauser.scholars.harvard.edu/sites/g/files/omnuum4441/files/rzeckhauser/files/status_quo_bias_in_decision_making.pdf','authors':'William Samuelson and Richard Zeckhauser','year':1988,'reading':'Actual primary-paper introductory definition/design, PDF physical pages 2–3, printed pages 7–8, through web text; holding options/preferences constant and varying existing-choice framing. Not a complete whole-paper review.'},
  {'url':'https://web.stanford.edu/~jlmcc/Presentations/tversky_kahneman_1981.pdf','authors':'Amos Tversky and Daniel Kahneman','year':1981,'reading':'Actual view_image reading of scanned primary paper physical page 2, printed page 453, defining the decision frame and equivalent formulations. Source scan retained only in local /tmp, not committed.'},
  {'url':'https://pdodds.w3.uvm.edu/files/papers/others/1974/tversky1974a.pdf','authors':'Amos Tversky and Daniel Kahneman','year':1974,'reading':'Actual view_image reading of scanned primary-paper physical pages 6–7, printed pages 1128–1129, adjustment/anchoring. Source scan retained only in local /tmp, not committed.'}
 ],
 'independence':json.loads(par.read_text()),'descriptionDecision':'keep','unresolvedDescriptionFindings':[],'evidenceProfileActuallyPresent':False,'profileRecommendation':'create',
 'positiveProfileHandling':'Current frozen input has evidenceProfile=null. This independent D chain recommends create and does not insert or claim the separately authored P-v2. Its targeted semantic/binding impact is reviewed only after this D record was finalized.',
 'limitations':'No separate V, complete jurisdiction source mapping, learner-scope or new A/M approval. No human or learner performance claim. Fresh hypothetical task expectations are not observed learner work. Separate current P and two-round synthesis/integration remain necessary.',
 'strictCompletionAddedByThisRound':0
})
print(json.dumps({'recordDigest':digest(record),'runDigest':digest(runfile),'completedAt':completed},indent=2))
