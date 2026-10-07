from pathlib import Path
import json, hashlib, datetime

base = Path(__file__).resolve().parent
author = base.parent / 'biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2'
raw_path = author / 'reviewer-entry/whole-three-current-native-goals-context-P-source.author.raw.json'
raw = json.loads(raw_path.read_text())
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
ids = [r['goalId'] for r in raw['records']]
analyses = [
    {
        'decision': 'KEEP',
        'descriptionDecision': 'keep',
        'descriptionRationale': 'The complete German and English descriptions assess one causal explanation from a supplied neuronal-disorder model. Alzheimer is explicitly an example; this does not require interchangeable disease labels, diagnosis or a complete account of disease causation. The actual page and canonical context agree, including HE/BY applicability and boundary inheritance. The HE physical43 LK source supports a principle-level neuronal-disorder example. BY EA11 provides only a partial structural/signalling component toward its mandatory MS/Parkinson symptoms competence; it does not mandate Alzheimer.',
        'positiveEvidenceDecision': 'KEEP',
        'positiveEvidenceRationale': 'Both complete bilingual cases are correct and fit the bounded goal: loss of network connections can impair processing in the supplied Alzheimer model; a fresh temporary transmitter change tests transfer to a functional rather than degenerative mechanism. Similar everyday difficulties do not uniquely identify a mechanism or disease. Required expectation, variation axes, expected answers and inference limits are consistent. These are E1/G1 AI candidate profiles, not observed learner performances.',
        'atomicity': 'atomic',
        'memory': 'no_memory_needed',
        'atomicityAndMemoryRationale': 'One model-based disturbance-to-function explanation is assessed; model examples are variations of that competence. Disease fact recall is not a mandatory separate learning burden in this supplied-model goal. No memory deck or cards are required.',
        'visualDecision': 'KEEP',
        'visualRationale': 'Actual1672x941 PNG, native PDF physical3 and actual360/680 images inspected. Intact left chain has arrows and transmitter dots at all successive links. Disturbed right chain stops at a visibly interrupted green-to-blue link; the later blue-to-purple contact remains drawn with no outgoing signal or release dots. Thus no continued downstream propagation is falsely shown. Model label, readable intact/disturbed words, color plus shape cues, bounded alt text and friendly diagram fit the goal. No patient diagnosis is depicted.',
        'sourceScopeDecision': 'KEEP bounded partial routes; HOLD complete named clinical duties',
        'essentialUnderstandingDe': 'Eine im gegebenen Modell gestörte neuronale Struktur oder Signalübertragung kann die Systemfunktion verändern; das Modell erklärt einen begrenzten Zusammenhang.',
        'essentialUnderstandingEn': 'A neuronal structure or signalling process disturbed in the supplied model can change system function; the model explains a bounded relationship.',
        'observablePerformanceDe': 'Die lernende Person begründet aus dem Modell die Funktionsänderung und unterscheidet Strukturverlust von veränderter Transmitterwirkung.',
        'observablePerformanceEn': 'The learner justifies the functional change from the model and distinguishes structural loss from altered transmitter action.',
        'transferExpectationDe': 'Ein frisches Modell mit ähnlichen Funktionsproblemen wird ohne Gleichsetzung von Ursachen oder Erkrankungen erläutert.',
        'transferExpectationEn': 'A fresh model with similar impairments is explained without equating causes or disorders.',
    },
    {
        'decision': 'KEEP',
        'descriptionDecision': 'keep',
        'descriptionRationale': 'Both whole descriptions correctly describe a supplied extracellular surface-recording model and bounded interpretation. Peripheral nerve ENG and cardiac ECG have different tissue sources and uses; they are connected by one measurement principle and inference competence. The BY EA source explicitly names ENG and EKG under neurophysiological procedures, while GA omits that duty. BY-only LK applicability and partial e026 route are appropriate; HE requires a brain-imaging procedure, which this goal neither claims nor supplies.',
        'positiveEvidenceDecision': 'KEEP',
        'positiveEvidenceRationale': 'All expectation and case bodies inspected in German and English. ENG sensory recording explicitly supplies tissue, electrode positions, timing criterion and controls; delta distance0.060m divided by1.2ms gives50m/s, divided by2.4ms gives25m/s. The finding is slower modelled peripheral conduction, not MS. ECG common-reference subtraction gives+0.7mV and lead swapping gives-0.7mV with unchanged excitation;1.0s intervals give60/min and0.8s give75/min. QRS is ventricular electrical activation in the model. The case tests fresh tissue transfer, polarity and function-versus-diagnosis distinctions. Neither single-cell potential, exact cell count, brain image nor health/disease conclusion follows from the provided recording alone.',
        'atomicity': 'atomic',
        'memory': 'no_memory_needed',
        'atomicityAndMemoryRationale': 'The single competence is explaining and interpreting an aggregate surface-electrical recording from supplied models. ENG and ECG are contrasting applications that expose tissue and interpretation dependence; the small timing calculations support that competence rather than forming unrelated content routines. All task formulae, electrode values, tissue identity and QRS meaning are supplied, so no independent memorized formula or vocabulary deck is necessary. The orientation prerequisite alone is sufficient for this explicitly introductory supplied model, without requiring an intracellular-potential experiment.',
        'visualDecision': 'KEEP',
        'visualRationale': 'Actual1672x941 PNG, native PDF physical4 and actual360/680 images inspected. Separate nerve and heart panels preserve tissue identity. Two external electrodes connect to each instrument; nerve inset shows multiple fibres and the two curves are qualitatively distinct. Plus/minus are consistently placed at measurement inputs rather than cellular charges. ECG schematic is recognizable without a diagnostic threshold or quantitative axis. Large ENG/EKG, Nerv/Herz and bottom aggregate-signal wording remain readable at360px. The stylized exposed anatomy is a model view, not an electrode inside a neuron. Alt text explicitly explains input polarity and diagnostic limitation.',
        'sourceScopeDecision': 'KEEP BY EA/LK partial e026 operationalisation; HOLD full clinical procedure training and independent diagnosis; no GA/HE source claim',
        'essentialUnderstandingDe': 'ENG und EKG erfassen räumlich und zeitlich verteilte elektrische Beiträge als Spannungsdifferenz an Oberflächenelektroden; ihre Aussage hängt von Gewebe, Messmodell und Kontext ab.',
        'essentialUnderstandingEn': 'Nerve conduction studies and ECG record electrical contributions distributed in space and time as a potential difference at surface electrodes; interpretation depends on tissue, recording model and context.',
        'observablePerformanceDe': 'Die lernende Person erklärt das Messprinzip und begründet anhand gegebener Werte einen begrenzten Leitungslaufzeit- oder Rhythmusvergleich.',
        'observablePerformanceEn': 'The learner explains the recording principle and uses supplied values to justify a bounded propagation-time or rhythm comparison.',
        'transferExpectationDe': 'Beim Wechsel vom Nerv zum Herzen werden Signalquelle, Zeitmaß und Polung passend interpretiert und konkrete Diagnosegrenzen erklärt.',
        'transferExpectationEn': 'When transferring from nerve to heart, the learner interprets source, timing and polarity appropriately and explains specific diagnostic limits.',
    },
    {
        'decision': 'KEEP',
        'descriptionDecision': 'keep',
        'descriptionRationale': 'Current German/English goal states the significance and strand-material invariant of one semiconservative copying model. Added BW applicability is supported by the actual printed22/physical24 standard3.3.2(3): DNA properties include duplication ability explained on a simple model. Semiconservative replication is a valid bounded model operationalisation of that component; this goal alone does not cover the whole DNA structure/information-storage bullet. Existing structure prerequisite and SekI scope remain appropriate.',
        'positiveEvidenceDecision': 'KEEP',
        'positiveEvidenceRationale': 'Complete bilingual first case has correct complementary antiparallel sequence5-prime AGTCCA3-prime against3-prime TCAGGT5-prime. Each initial labelled strand receives a new complement in a different daughter molecule. The second fresh copying round leaves exactly2/4 duplexes with one original labelled strand and2/4 with no original label, while sequence information remains copied. The definitions of original label and later template avoid the usual old-strand ambiguity. Supplied pairing/direction legends and rejection of conservative copying meaningfully test representation and information/material reasoning; no extra enzyme-level curriculum is imposed.',
        'atomicity': 'atomic',
        'memory': 'no_memory_needed',
        'atomicityAndMemoryRationale': 'Significance and strand tracing are facets of explaining one replication model. Given pairing rules and directional legends mean that molecular material/information reasoning rather than memorized vocabulary or enzyme lists is needed; no separate cards are required.',
        'visualDecision': 'KEEP',
        'visualRationale': 'Actual1672x941 PNG and native PDF physical5 inspected; missing author360/680 e70 screenshots were truthfully noted and regenerated in this reviewer own dossier with actual Chromium decode and screenshots from exact PNG bytes. In both widths the model clearly shows one original blue/blue duplex producing two blue/orange duplexes. Corresponding base-shape order and opposite original-strand locations are preserved. The legend distinguishes old blue from new orange, and labels plus diagram remain legible at360px. No fragmentation, two-old/zero-old first daughter pair or spurious synthesis detail is shown.',
        'sourceScopeDecision': 'KEEP BW partial duplication-ability component; no claim of full DNA structure/information bullet coverage',
        'essentialUnderstandingDe': 'Komplementäre Vorlagenkopie bewahrt DNA-Sequenzinformation, während nach einer Kopierrunde jedes Tochtermodell einen ursprünglichen und einen neuen Strang enthält.',
        'essentialUnderstandingEn': 'Complementary template copying preserves DNA sequence information, while each daughter model contains one original and one new strand after a copying round.',
        'observablePerformanceDe': 'Die lernende Person baut richtige Tochtermodelle, verfolgt markierte Ausgangsstränge und erklärt Informationsbewahrung.',
        'observablePerformanceEn': 'The learner constructs correct daughter models, traces labelled initial strands and explains preservation of information.',
        'transferExpectationDe': 'Eine zweite Kopierrunde wird so dargestellt, dass die ursprünglichen zwei Stränge auf zwei der vier Doppelstränge verteilt bleiben, ohne Informationsverlust anzunehmen.',
        'transferExpectationEn': 'A second copying round is represented so that the two initial strands remain distributed between two of four double strands, without assuming loss of information.',
    },
]
rows = []
for record, analysis in zip(raw['records'], analyses):
    d = record['currentNativeDInput']
    rows.append({'goalId':record['goalId'], 'goalFingerprint':d['goalFingerprint'], 'pageFingerprint':d['pageFingerprint'], 'actualPDFPhysicalPage':record['actualPDFPhysicalPage'], 'assetSha256':d['reviewContext']['page']['visualization']['originalDigest'], **analysis})
judgments = {'reviewer':'/root/bio_two_current_fresh_blind_b','reviewPass':'first_pass','blindToOtherReviews':True,'authorDossier':str(author.relative_to(Path.cwd())),'authorFreezeSha256':hashlib.sha256((author/'author.final.freeze.json').read_bytes()).hexdigest(),'startedAt':'2026-10-07T08:43:25.391842+00:00','sealedAt':stamp,'humanApproval':False,'humanTrial':False,'status':'AI candidate scientific judgment only','goals':rows,'scopeHolds':['BY GA/EA full depression symptoms, multifactorial explanation, therapy and psychosocial/stigma duty are not satisfied by the partial SSRI/synapse route.','BY EA full named MS/Parkinson symptoms duty is not satisfied by one bounded neuronal-disorder model.','BY EA e026 full clinical method training and individual diagnosis are outside the supplied ENG/EKG model.','HE brain-imaging duty is not covered by this BY-only ENG/EKG atom.']}
(base/'own.first-pass.judgments.json').write_text(json.dumps(judgments,ensure_ascii=False,indent=2)+'\n')
(base/'reviewed-current-input.exact.json').write_bytes(raw_path.read_bytes())
external={'checkedAt':stamp,'sources':[{'url':'https://medlineplus.gov/ency/article/003927.htm','supports':'Surface nerve recordings measure nerve-signal timing and speed; temperature matters. This is corroboration of the supplied peripheral model, not new curriculum coverage.'},{'url':'https://medlineplus.gov/lab-tests/electrocardiogram/','supports':'ECG records cardiac electrical activity and supplies rhythm/rate/timing information. A recording alone does not establish an individual diagnosis.'}],'fullSourceTextsCopied':False}
(base/'external-primary-corroboration.json').write_text(json.dumps(external,indent=2)+'\n')
with (base/'chronology.jsonl').open('a') as out:
    out.write(json.dumps({'at':stamp,'phase':'substantive-first-pass-sealed','finding':'KEEP all three D/P/A/M/V on exact v2 current inputs; source coverage holds remain explicit. Before any peer science. Earlier missing e70 width files addressed by own actual Chromium screenshots. A wrong campaign filename cat failed and was corrected without content mutation.'})+'\n')
paths=[raw_path,author/'author.final.freeze.json',author/'native-three/book.pdf',author/'native-three/book-model.json',author/'reviewer-entry/native-first-pass-contracts.author.json']
for goal in ids:
    paths.append(author/'selected-existing-images'/f'{goal}.png')
paths += list((author/'primary').glob('*'))
paths += list((base/'pdf-pages').glob('*.png'))
paths += list((base/'actual-browser').glob('*'))
paths += [base/'own.first-pass.judgments.json',base/'reviewed-current-input.exact.json',base/'external-primary-corroboration.json',base/'author-freeze.actual-verification.json',base/'chronology.jsonl']
bindings=[{'path':str(p.relative_to(Path.cwd())),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in paths if p.is_file()]
freeze={'sealedAt':stamp,'purpose':'Own substantive first-pass judgments and actually inspected exact input/page/image bindings sealed before peer science','blindToOtherReviews':True,'goalIds':ids,'payloads':bindings,'humanApproval':False,'humanTrial':False}
(base/'own.first-pass.freeze.json').write_text(json.dumps(freeze,indent=2)+'\n')
(base/'own.first-pass.freeze.sha256').write_text(hashlib.sha256((base/'own.first-pass.freeze.json').read_bytes()).hexdigest()+'  own.first-pass.freeze.json\n')
print(json.dumps({'sealedAt':stamp,'judgments':['KEEP','KEEP','KEEP'],'bindings':len(bindings),'freezeSha256':hashlib.sha256((base/'own.first-pass.freeze.json').read_bytes()).hexdigest()}))
