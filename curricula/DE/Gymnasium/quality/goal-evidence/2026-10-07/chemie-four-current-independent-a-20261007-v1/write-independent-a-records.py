"""Persist the root reviewer's substantive first-pass observations; no active edits."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'
V2 = BASE / 'chemie-b007-b014-four-current479-native-refresh-author-20261007-v2'
V4 = BASE / 'chemie-b007-b014-four-dual-campaign-technical-followup-20261007-v4'
ROUND = V4 / 'native/four/round-a'

def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
batch = campaign['batches'][0]
batch_path = ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')
assert digest(batch_path) == batch['batchInputFingerprint']
goals = [json.loads(line)['goal'] for line in batch_path.read_text().splitlines()]
assert [g['goalId'] for g in goals] == batch['goalIds']
run_id = 'chemie-four-current-root-independent-a-20261007-v1'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

# These are the reviewer's own content judgments, made before opening B verdicts.
judgments = [
    ('keep',
     'Piktogramme bezeichnen Gefahrenklassen; die konkrete Kennzeichnung wird erst zusammen mit Signalwort und stoffbezogenen Warnhinweisen belastbar gedeutet. Ein fehlender Warnhinweis wird in der bereitgestellten Stoffinformation nachgeschlagen.',
     'Pictograms denote hazard classes; a specific label is interpreted together with its signal word and substance-specific hazard statements. Missing statements are looked up in the supplied safety information.',
     'Die lernende Person ordnet die fiktiven Etiketten A/B begründet ihren Gefahren zu, ergänzt H319 aus der Tabelle und erklärt, weshalb ein Flammensymbol allein H225 und H226 nicht unterscheidet.',
     'The learner explains the hazards on fictional labels A/B, retrieves H319 from the table and explains why a flame symbol alone does not distinguish H225 from H226.',
     'Beim Wechsel zur unbekannten Kennzeichnung C/D werden H228 und H335 gezielt nachgesehen und gegenüber Haut- und Augenreizung abgegrenzt; Umgang und Entsorgung werden nicht aus einem Symbol allein abgeleitet.',
     'For unfamiliar labels C/D the learner looks up H228 and H335 and distinguishes them from skin and eye irritation; handling and disposal are not inferred from a pictogram alone.',
     'KEEP nach tatsächlicher Sichtung der deutschen/englischen Beschreibung, der vollständigen zwei Fallmaterialien und PDF-Seite 3 sowie HE-G9 physisch 12/gedruckt 11. Kennzeichnung und gezieltes Nachschlagen gehören zu einer Interpretationsroutine. Umgang und Entsorgung bleiben im eigenen Nachbarziel. Das vorhandene freundliche Bild ist fachlich brauchbar; vier Beispiele sind keine vollständige Stoffkennzeichnung. Die bestehende GHS-Karte chem_basics_001 ist für kompaktes Abrufwissen weiterhin nützlich und ersetzt die Interpretation nicht.'),
    ('block',
     'Unterschiedliche Elektrodenpotenziale bestimmen in einem galvanischen Element die spontane Oxidation an der Anode und Reduktion an der Kathode. Elektronen fließen außen; gerichtete Ionenwanderung erhält den Ladungsausgleich in beiden Lösungen.',
     'Different electrode potentials determine spontaneous oxidation at the anode and reduction at the cathode. Electrons travel through the external circuit; directed ion migration maintains charge balance in the two solutions.',
     'Die lernende Person begründet Zn als negative Anode und Cu als positive Kathode, bilanziert beide Teilreaktionen und ordnet NO3− der Zinkseite sowie K+ der Kupferseite zu. Ein unterbrochener Ionenweg erlaubt keinen dauerhaften Strom.',
     'The learner explains Zn as the negative anode and Cu as the positive cathode, balances both half-reactions and assigns NO3− to the zinc side and K+ to the copper side. A broken ionic path prevents sustained current.',
     'Für Cu/Ag wird die Elektronenabgabe von Cu mit der Aufnahme durch zwei Ag+-Ionen verknüpft; vertauschte räumliche Anordnung ändert die Elektrodenrollen nicht. Gleiche Cu-Halbzellen unter gleichen Bedingungen liefern keine Potenzialdifferenz.',
     'For Cu/Ag the electron loss of Cu is matched with uptake by two Ag+ ions; reversing physical placement does not change electrode roles. Identical Cu half-cells under identical conditions provide no potential difference.',
     'Der Text und beide tatsächlichen DE/EN-Fälle sind fachlich geeignet und passen zur begrenzten qualitativen HE-E1-Quelle auf physisch 35. BLOCK des gegenwärtig gebundenen Gesamteingangs: Das tatsächlich betrachtete Bild und PDF-Seite 4 zeigen im oberen Salzbrückenbereich einen linksgerichteten Pfeil unmittelbar bei K+, obwohl K+ zur rechten Kupferhalbzelle wandern muss. Der untere Gegenpfeil macht diese Mehrdeutigkeit nicht fachlich richtig. Dieses konkrete Bildproblem ist vor einer aktuellen Seiten-/Visualisierungsfreigabe zu korrigieren; keine numerische Spannungsberechnung wird behauptet.'),
    ('keep',
     'Arrhenius-Säuren erzeugen in Wasser hydratisierte Protonen, und gelöste Hydroxide liefern Hydroxid-Ionen. Stoffformeln, Namen der Ausgangsstoffe und Namen ihrer wässrigen Lösungen sind zu unterscheiden; schwache Säuren sind nicht vollständig dissoziiert.',
     'Arrhenius acids produce hydrated protons in water, and dissolved hydroxides supply hydroxide ions. Substance formulas, solute names and names of aqueous solutions are distinguished; weak acids are not fully dissociated.',
     'Die lernende Person ordnet HCl, HNO3, H2SO4, H3PO4 und H2CO3 sowie NaOH, KOH, Ca(OH)2 und Ba(OH)2 richtig zu, erläutert HCl/H3O+/Cl− in Wasser und unterscheidet festes NaOH von Natronlauge.',
     'The learner correctly associates HCl, HNO3, H2SO4, H3PO4 and H2CO3 and NaOH, KOH, Ca(OH)2 and Ba(OH)2, explains HCl/H3O+/Cl− in water and distinguishes solid NaOH from its aqueous solution.',
     'Bei Calciumhydroxid werden zwei Hydroxid-Ionen je gelöster Formeleinheit begründet; klares Kalkwasser wird von einer Suspension abgegrenzt. Das Stoffnamen-/Formelwissen wird ohne Behauptung unbegrenzter Löslichkeit auf weitere Tabellenzeilen übertragen.',
     'For calcium hydroxide the learner explains two hydroxide ions per dissolved formula unit and distinguishes clear limewater from a suspension. Name/formula knowledge is transferred to further entries without claiming unlimited solubility.',
     'KEEP nach tatsächlicher Prüfung von Beschreibung, beiden DE/EN-Fällen, Bild/PDF-Seite 5 und HE-KC/current-2026 physisch 35. Die neun Säure-/Hydroxid-Zuordnungen und Erklärung wässriger Teilchen bilden einen zusammenhängenden Stoffmodell-Anwendungsweg. Salze bleiben außerhalb dieses begrenzten Nachweises. Die tatsächlich gelesenen 18 Primärkarten und 18 englischen Gegenstücke sind fachlich richtig, notwendig und begrenzen sich auf Namen/Formeln/Lösungsnamen. Klares Kalkwasser, HCl-Ausgangsstoff und Stoffformel versus Lösungsteilchen sind korrekt. Das vorhandene freundliche Bild bleibt geeignet.'),
    ('block',
     'Brønsted-Säuren geben Protonen ab und Basen nehmen sie auf; konjugierte Partner unterscheiden sich um ein Proton. Die Rolle des Wassers hängt vom Reaktionspartner ab; ein Ampholyt kann beide Rollen in verschiedenen Reaktionen übernehmen.',
     'Brønsted acids donate protons and bases accept them; conjugate partners differ by one proton. Water\'s role depends on the reaction partner; an ampholyte can take either role in different reactions.',
     'Die lernende Person bilanziert HF/H2O und NH3/H2O, kennzeichnet Donator, Akzeptor und die jeweiligen konjugierten Paare und erklärt die unterschiedliche Wasserrolle über die tatsächlich übertragene H+-Einheit.',
     'The learner balances HF/H2O and NH3/H2O, identifies donor, acceptor and both conjugate pairs and explains water\'s different roles using the transferred proton.',
     'Für H2PO4− werden die Abgabe- und Aufnahmegleichungen mit Ladungs- und Atomerhaltung aufgestellt. Die lernende Person begründet die Ampholytfähigkeit, ohne gleiche Reaktionsausmaße oder einen neutralen pH-Wert zu behaupten.',
     'For H2PO4− the learner constructs donation and acceptance equations conserving charge and atoms. Ampholyte capability is explained without claiming equal reaction extents or neutral pH.',
     'Der vollständige Text und beide DE/EN-Fälle sind fachlich korrekt und durch die tatsächliche HE-E2-Seite 35 begrenzt. BLOCK des aktuellen gebundenen Seiteneingangs: Die tatsächlich betrachtete zentrale H3O+-Teilchendarstellung hat nur zwei angehängte H-Kugeln; auch die bildliche Säurelösung übernimmt dieses Problem. Das passt nicht zur ausdrücklich gezeigten Formel und ist vor Freigabe zu berichtigen. Die Textkompetenz ist einheitlich protonenbezogen; die wechselnde Wasserrolle und H2PO4−-Bilanz benötigen anwendbares Modellverständnis, kein zusätzliches auswendig zu lernendes Beispieldeck.'),
]

records = []
for g,j in zip(goals,judgments):
    decision,*evidence,rationale = j
    record = {'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':run_id+'.'+g['goalId'],'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
    for key in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
        record[key] = g[key]
    record.update(decision=decision,understandingEvidence=dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],evidence)),rationale=rationale,evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation='create',recordStatus='candidate',reviewAuthority='ai_candidate')
    records.append(record)
records_path = OUT / 'results' / (batch['batchId']+'.records.jsonl')
records_path.parent.mkdir(parents=True,exist_ok=True)
records_path.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))

params = {'reviewer':'root independent first pass','execution':'interactive Codex review with actual file, primary source, raster and native PDF inspection','model':'GPT-6 family; serving revision not exposed','samplingParameters':'not exposed','peerVerdictsRead':False,'candidateAuthor':'separate chem_four_current_candidate_refresh agent','authorInputAwareness':'author technical input preparation and unconfirmed visualization observations were known; reviewer evaluated actual pictures independently'}
write(OUT/'actual-review-execution.json',params)
artifacts = [('book_pdf',V2/'native/four/book.pdf'),('book_html',V2/'native/four/book.html'),('review_input_json',ROUND/'description-review-input.json'),('description_review_batch_input_jsonl',batch_path),('review_markdown',V2/'materials/four-whole-goals-eight-complete-DE-EN-cases.reviewer-ready.md'),('review_prompt',ROUND/'prompt.md'),('review_criteria',ROUND/'criteria.md'),('finding_schema',ROOT/'contracts/goal-description-review/v1/goal-description-review-record.schema.json'),('run_manifest_schema',ROOT/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')]
manifest = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 Codex family; exact serving revision unavailable','role':'subject_reviewer','promptFamilyId':'goal-description-review-v1','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':digest(OUT/'actual-review-execution.json'),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':role,'digest':digest(path)} for role,path in artifacts],'startedAt':'2026-10-07T10:46:21+00:00','completedAt':now,'status':'completed','outputDigest':digest(records_path),'toolchainVersion':'skillpilot-native-goal-description-review-v2'}
write(OUT/'results'/(batch['batchId']+'.run.json'),manifest)
observations = {'role':'Independent A scientific first-pass observations before B verdict inspection','reviewAuthority':'ai_candidate','humanApproval':False,'strictGain':0,'decisions':[{'goalId':g['goalId'],'D':j[0],'P':'both actually read bilingual cases scientifically suitable, current candidates only','V':'keep' if j[0]=='keep' else 'hold_actual_picture_defect','rationale':j[-1]} for g,j in zip(goals,judgments)],'sourceBounds':'Actual HE-G9 page12 and HE-KC2024/current2026 page35 read; four component duties only, no blanket approval of all jurisdictions or partner duties','memory':'9e current GHS card chem_basics_001 useful; Arrhenius 18 DE +18 EN cards personally read and correct; proton-transfer cases require understanding, no new mandatory recall deck','sourceAndImageInspections':'Full original four rasters, each at 360/680 pixels, actual native PDF physical pages3-6 and three actual primary PDF page rasters viewed','priorScientificFreezeVerified':139,'v3TechnicalPayloadsVerified':18,'v4TechnicalPayloadsVerified':18,'peerReviewOutputsReadBeforeSeal':False}
write(OUT/'first-scientific-observations.json',observations)
payloads = []
for p in sorted(OUT.rglob('*')):
    if p.is_file() and p.name!='first-pass.freeze.json':
        payloads.append({'path':str(p.relative_to(ROOT)),'sha256':digest(p).removeprefix('sha256:'),'bytes':p.stat().st_size})
write(OUT/'first-pass.freeze.json',{'schemaVersion':1,'createdAt':now,'role':'Independent A first-pass seal before B scientific output inspection','payloads':payloads,'peerVerdictsRead':False,'humanApproval':False,'strictGain':0})
print(json.dumps({'records':len(records),'decisions':[x['decision'] for x in records],'freeze':digest(OUT/'first-pass.freeze.json'),'activeWrites':0}))
