# SPDX-License-Identifier: Apache-2.0
"""Serialize the independent review judgments; hashes are bindings, not judgments."""
import json, pathlib, hashlib, datetime, copy
import fitz, jsonschema

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
RUN = 'biologie-bio8-v3-current353-genuine-independent-b-fresh-20261010-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p): return json.loads(pathlib.Path(p).read_text())
def ref(p):
    p = pathlib.Path(p)
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(name, value):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def write_lines(name, rows):
    p = OWN / name; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows))

entry = read(AUTHOR / 'author-substantive-four.portable-final.entry.json')
neutral = read(ROOT / entry['activeBaseline']['neutralEntry']['path'])
campaign = read(AUTHOR / 'native/nineteen-final-current-native/round-b/description-review-campaign.json')
raw_path = next((AUTHOR / 'native/nineteen-final-current-native/round-b/batches').glob('*.input.jsonl'))
inputs = [json.loads(s) for s in raw_path.read_text().splitlines()]

# Each row is independently worded: essential understanding, observable performance,
# transfer, each in German and English. Order is the actually inspected 19-page book.
understanding = [
['Basenfolge speichert Information; komplementäre Paarung verbindet zwei gegenläufige Nukleotidstränge.', 'Base sequence stores information; complementary pairing connects two antiparallel nucleotide strands.', 'Ein Nukleotidmodell aufbauen, passende Basen ergänzen und Informationsfolge von Zucker-Phosphat-Gerüst unterscheiden.', 'Build a nucleotide model, complete complementary bases and distinguish information sequence from the sugar-phosphate backbone.', 'Eine veränderte Basenfolge auf den Gegenstrang übertragen und erklären, welche Information verändert wurde.', 'Transfer a changed base sequence to its complementary strand and explain which information changed.'],
['Transkription erzeugt eine RNA-Abschrift; Translation setzt deren Codonfolge in eine Polypeptidfolge um.', 'Transcription generates an RNA transcript; translation converts its codon sequence into a polypeptide sequence.', 'DNA, mRNA, Ribosom und Polypeptid im gegebenen Modell verbinden und beide Umsetzungen begründen.', 'Connect DNA, mRNA, ribosome and polypeptide in the supplied model and explain both conversions.', 'Aus einer veränderten Vorlage oder blockierter Translation die begrenzten Folgen für RNA und Protein ableiten.', 'Infer bounded effects on RNA and protein from a changed template or blocked translation.'],
['Ein Restriktionsenzym spaltet vorhandene DNA an einer passenden Erkennungssequenz; Spaltung ist keine Vervielfältigung.', 'A restriction enzyme cleaves existing DNA at a compatible recognition sequence; cleavage is not amplification.', 'Aus vorgegebenen linearen Schnittpositionen Fragmentlängen ableiten, die Ausgangslänge erhalten und die Sequenzabhängigkeit erklären.', 'Infer fragment lengths from supplied linear cut positions, conserve the initial length and explain sequence dependence.', 'Bei verlorener Erkennungsstelle das neue Fragmentmuster begründet vorhersagen.', 'Predict and justify the changed fragment pattern after a recognition site is lost.'],
['PCR vervielfältigt einen durch kompatible Primer begrenzten DNA-Abschnitt in wiederholten Trennungs-, Bindungs- und Verlängerungsschritten.', 'PCR amplifies a DNA region bounded by compatible primers through repeated separation, annealing and extension steps.', 'Den Modellzyklus und eine Anwendung erklären; Zielnachweis und Kontrollen getrennt beurteilen.', 'Explain the model cycle and an application; evaluate target detection and controls separately.', 'Bei nach außen gerichteten Primern oder positiver Negativkontrolle die Aussagegrenzen des Zielnachweises erklären.', 'Explain target-detection limits with outward-facing primers or a positive negative control.'],
['Lineare DNA-Fragmente werden im Gel größenabhängig getrennt; kleinere Fragmente wandern unter den gegebenen Bedingungen weiter.', 'Linear DNA fragments separate by size in a gel; smaller fragments travel farther under the supplied conditions.', 'Probenbanden mit einem Größenmarker vergleichen und ihre Größen begründet einordnen.', 'Compare sample bands with a size marker and justify their size assignments.', 'Ein verändertes Fragmentgemisch auswerten und ähnliche Bandpositionen nicht als Identitätsbeweis behandeln.', 'Evaluate a changed fragment mixture without treating similar band positions as proof of identity.'],
['Replikation und PCR nutzen komplementäre Vorlagen und Polymerasen; technische Trennung und Primerwahl ersetzen oder verändern natürliche Abläufe.', 'Replication and PCR use complementary templates and polymerases; technical separation and primer choice replace or alter natural processes.', 'Gemeinsamkeiten und Unterschiede am gegebenen Modell auf technische Probleme wie Strangtrennung und wiederholtes Erhitzen beziehen.', 'Relate similarities and differences in the supplied model to technical problems such as strand separation and repeated heating.', 'Eine geänderte technische Bedingung erklären, ohne PCR mit vollständiger zellulärer Genomreplikation gleichzusetzen.', 'Explain a changed technical condition without equating PCR with complete cellular genome replication.'],
['Vektoren können Fremd-DNA in Wirtszellen übertragen; stabile Klonierung hängt von Weitergabe oder Replikation ab und belegt keine Proteinexpression.', 'Vectors can transfer foreign DNA into host cells; stable cloning depends on maintenance or replication and does not establish protein expression.', 'Einbringen, Aufnahme und klonale Weitergabe im Plasmid- oder Virusmodell unterscheiden.', 'Distinguish insertion, uptake and clonal maintenance in a plasmid or viral-vector model.', 'Bei fehlendem Replikationsursprung oder episomalem Verlust die Weitergabe an Tochterzellen begründet begrenzen.', 'Explain limits to daughter-cell maintenance when a replication origin is absent or episomal DNA is lost.'],
['Vorhandene DNA ist von funktionierender Expression zu unterscheiden; passende Signale und Wirtsfunktionen ermöglichen RNA und Protein.', 'DNA presence differs from functional expression; compatible signals and host functions permit RNA and protein production.', 'Im gegebenen Vektor-Wirt-Modell Promotorerkennung, Translation und gegebenenfalls Produktverarbeitung prüfen.', 'Check promoter recognition, translation and, where relevant, product processing in the supplied vector-host model.', 'Eine passende DNA-Sequenz bei unpassendem Promotor oder blockierter Translation als unzureichenden Proteinbeleg erkennen.', 'Recognize that a compatible coding sequence with an incompatible promoter or blocked translation is insufficient evidence of protein production.'],
['Chancen und Risiken gentechnischer Anwendungen erfordern begründete Abwägung anhand eines konkreten Anwendungskontexts.', 'Opportunities and risks of genetic-engineering applications require reasoned weighing in a concrete application context.', 'Nutzen, Risiken und Unsicherheiten einer gegebenen Anwendung benennen und eine begründete Position diskutieren.', 'Identify benefits, risks and uncertainties of a supplied application and discuss a reasoned position.', 'Eine veränderte Betroffenengruppe oder neue Risikoinformation in die Abwägung einbeziehen.', 'Incorporate a changed stakeholder group or new risk information into the weighing process.'],
['Histonmodifikationen können Chromatinzugänglichkeit und Genaktivität beeinflussen; die Wirkung hängt vom jeweiligen Befundkontext ab.', 'Histone modifications can affect chromatin accessibility and gene activity; their effects depend on the supplied context.', 'Gegebene Acetylierungs- und Methylierungsbefunde mit Zugänglichkeit und Aktivität verknüpfen, ohne alle Methylierungen gleichzusetzen.', 'Relate supplied acetylation and methylation findings to accessibility and activity without equating all methylations.', 'Einen abweichenden Markierungskontext analysieren und die Erklärung entsprechend einschränken.', 'Analyze a different modification context and constrain the explanation accordingly.'],
['Eine passende kleine RNA kann die Proteinbildung über ihre Ziel-mRNA vermindern; dies ist kein Umschreiben der DNA.', 'A matching small RNA can reduce protein production through its target mRNA; this does not rewrite DNA.', 'Sequenzpassung, Ziel-mRNA und verminderte Proteinbildung im gegebenen Beispiel kausal verbinden.', 'Causally connect sequence matching, target mRNA and reduced protein production in the supplied example.', 'Eine unpassende kleine RNA oder anderes Transkript beurteilen und Zielselektivität erklären.', 'Evaluate a mismatching small RNA or another transcript and explain target selectivity.'],
['Ein rekombinantes Proteinmedikament entsteht durch eine passende Produktionskette von genetischer Vorlage über Expression bis zur Aufbereitung.', 'A recombinant protein medicine depends on a compatible production chain from genetic template through expression to processing and purification.', 'Am gegebenen Beispiel Genkonstruktion, Wirt, Expression, gegebenenfalls Verarbeitung und Qualitätsprüfung begründet verbinden.', 'Connect gene construct, host, expression, any required processing and quality checks in the supplied example.', 'Bei einem neuen Wirt getrennt prüfen, ob Expression und erforderliche Verarbeitung überhaupt belegt sind.', 'For a new host, separately check whether expression and required processing are established.'],
['Veränderte räumliche oder zeitliche Genregulation kann Entwicklungsmuster verändern; evolutionäre Bedeutung setzt vererbbare Variation voraus.', 'Changed spatial or temporal gene regulation can alter developmental patterns; evolutionary significance depends on heritable variation.', 'Gegebene Hox- oder Regulationsbefunde mit Entwicklungsmerkmalen verbinden und erblich bedingte Variation von Plastizität unterscheiden.', 'Connect supplied Hox or regulatory findings to developmental traits and distinguish heritable variation from plasticity.', 'Eine nicht vererbbare Veränderung oder unabhängig ähnliche Form einordnen, ohne Zweckentwicklung oder enge Verwandtschaft zu unterstellen.', 'Classify a non-heritable change or independently similar form without assuming purposeful evolution or close kinship.'],
['Bauplan, Fortpflanzung und Stoffwechsel erklären gemeinsam, weshalb ein Mikroorganismus für einen bestimmten biotechnologischen Zweck nutzbar ist.', 'Cell organization, reproduction and metabolism jointly explain why a microorganism is usable for a particular biotechnology purpose.', 'Beim gegebenen Hefen- oder Bakterienfall Zellmerkmale, Kulturvermehrung und Produktbildung auf die Nutzung beziehen.', 'Relate cell features, culture growth and product formation to use in the supplied yeast or bacterial case.', 'Bei anderem Stoffwechselprodukt oder fehlendem verwertbarem Substrat die Eignung für den gewünschten Zweck neu beurteilen.', 'Reassess suitability when a different metabolic product is formed or a usable substrate is missing.'],
['Die Geschichte des Lebens ist sehr lang; der moderne Mensch tritt darin erst spät auf.', 'The history of life is very long; modern humans appear relatively late within it.', 'Wichtige Lebensabschnitte in einer schematischen Zeitspur ordnen und die junge Position des modernen Menschen erklären.', 'Order major life-history intervals on a schematic timeline and explain the recent position of modern humans.', 'Eine anders skalierte Zeitdarstellung auswerten, ohne die schematische Folge als direkte Abstammungslinie zu lesen.', 'Read a differently scaled timeline without treating the schematic succession as a direct ancestry.'],
['Anatomische und molekulare Gemeinsamkeiten ermöglichen die Einordnung des modernen Menschen in ein Verwandtschaftssystem mit gemeinsamen Vorfahren.', 'Anatomical and molecular similarities permit classification of modern humans in a relationship system with shared ancestors.', 'Gegebene vergleichbare Merkmale zur begründeten systematischen Einordnung verwenden.', 'Use supplied comparable features to justify systematic classification.', 'Neue oder widersprüchliche Merkmalsdaten prüfen, ohne heutige Menschenaffen als direkte menschliche Vorfahren darzustellen.', 'Examine new or conflicting feature data without presenting living apes as direct human ancestors.'],
['Fossilmerkmale und Datierungen stützen begrenzte Evolutionshypothesen; zeitliche Reihenfolge beweist keine direkte Ahnenreihe.', 'Fossil traits and dating support bounded evolutionary hypotheses; chronological order does not prove a direct ancestry.', 'Fossilkarten chronologisch ordnen, eine begründete biologische Hypothese ableiten und Alternativen sowie Aussagegrenzen erläutern.', 'Order fossil cards chronologically, derive a reasoned biological hypothesis and explain alternatives and evidential limits.', 'Einen überlappenden neuen Fund oder Suchbias aufnehmen und eine zu lineare Hypothese entsprechend revidieren.', 'Incorporate an overlapping new find or search bias and revise an overly linear hypothesis accordingly.'],
['Sozial vermitteltes Wissen und erlernte Verfahren können heutiges Leben und Umwelt verändern; kulturelle Weitergabe ist keine genetische Vererbung.', 'Socially transmitted knowledge and learned practices can change current life and environment; cultural transmission is not genetic inheritance.', 'In einem gegebenen Beispiel soziale Weitergabe, Folgen für Menschen und Folgen für ihre Umwelt begründet verbinden.', 'Connect social transmission, effects on people and effects on their environment with reasons in a supplied example.', 'Ein geändertes Verfahren oder fehlende Schulung analysieren, ohne kulturelle Unterschiede als angeborene biologische Unterschiede zu deuten.', 'Analyze a changed practice or missing training without interpreting cultural differences as innate biological differences.'],
['Unmittelbarer Auslöser und mögliche evolutionäre Funktion erklären Verhalten auf verschiedenen Ebenen; eine plausible Funktion belegt noch keine konkrete Anpassung.', 'An immediate trigger and a possible evolutionary function explain behavior at different levels; a plausible function does not establish a specific adaptation.', 'Eine gegebene menschliche Reaktion mit Auslöser, Abstammungswissen und prüfbarer Funktionshypothese verknüpfen.', 'Connect a supplied human response to its trigger, ancestry knowledge and a testable functional hypothesis.', 'Bei harmloser Wiederholung oder gegenwärtig nutzloser Reaktion die Hypothese begrenzen und zusätzliche Vergleichsbelege verlangen.', 'Constrain the hypothesis after harmless repetition or a currently useless response and identify additional comparative evidence.']
]
assert len(understanding) == len(inputs) == 19
D = []
for row, fields in zip(inputs, understanding):
    g = row['goal']
    recommendation = 'revise' if g['goalId'].startswith('430b2') else ('create' if g['goalId'].startswith('9540') else 'none')
    rationale = 'Current whole native HTML and PDF page inspected, including prerequisites and successors. One coherent assessable competence; its explanatory facets support one performance. German and English descriptions express the same bounded understanding.'
    if g['goalId'].startswith('430b2'): rationale += ' The description is suitable; the separate English P material contains an unrelated cultural-evolution residue and must be corrected.'
    if g['goalId'].startswith('9540'): rationale += ' No current positive profile is supplied on this page; a content-specific profile would make the required reasoned weighing operational. This does not withdraw prior approval of another artifact.'
    D.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':RUN+'.D.'+g['goalId'],'runId':RUN+'.FIRST.D19','campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':row['bundleFingerprint'],'bookDigest':row['bookDigest'],'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'currentTitleDe':g['currentTitleDe'],'currentTitleEn':g['currentTitleEn'],'currentDescriptionDe':g['currentDescriptionDe'],'currentDescriptionEn':g['currentDescriptionEn'],'decision':'keep','understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],fields)),'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':recommendation,'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
write_lines('description/nineteen-current-normal-FIRST.review.jsonl',D)
context_profile_notes = {
 '0daa79f6':'Component-model construction and fresh complement/error analysis separate base order from backbone or helix shape; no replication performance is imported.',
 '475eebb4':'Template versus coding strand, intron-free eukaryotic versus bacterial model and a specified translation disturbance give complete connected-information-flow evidence.',
 '8eb86a82':'New ladders require positive approximate size/interval conclusions; equal migration is not equal sequence, disease or identity. Actual laboratory operation is not claimed.',
 'a515e493':'The supplied current profile has finite old/new strand and PCR-cycle reasoning, technical enzyme/primer solutions and changed control/annealing conditions. Existing whole-case references remain unchanged; this D context check does not restart or reapprove the old P science.',
 '8f6933b1':'Acetylation and a distinct histone methylation site are interpreted from supplied accessibility/transcription findings, explicitly without a universal on/off rule.',
 'ceb54223':'Matching siRNA/Ago2 example and a changed target with newly matching siRNA require positive measured-effect reasoning and distinguish the unmatched control, DNA change and therapy claims.',
 '632b6042':'Timeline/window change and a separate day-clock/final-goal interpretation address both geological youth and representation limits without a purposeful human ladder.',
 '5c7f0085':'Anatomical and model molecular evidence jointly support nested groups; convergent bipedality, a conflicting single marker and an individual walking limitation require independent classification reasoning.'
}
write('description/current-supplied-profile-context.actual-FIRST.receipt.json',{'runId':RUN,'input':ref(raw_path),'records':[{'goalId':r['goal']['goalId'],'suppliedCurrentProfilePresent':r['goal']['reviewContext']['evidenceProfile'] is not None,'currentProfileScienceBodyActuallyRead':r['goal']['reviewContext']['evidenceProfile'] is not None,'contextRationale':context_profile_notes.get(r['goal']['goalId'][:8],'Full current profile and two complete cases assessed in the P10 receipt.' if r['goal']['reviewContext']['evidenceProfile'] is not None else 'No current profile supplied; create recommendation remains separate from D keep.'),'earlierReviewerVerdictsRead':False,'earlierPScienceReapprovedByContextCheck':False} for r in inputs],'suppliedProfiles':18,'missingProfileGoalId':'9540a95d-5ca5-527c-918f-d702e99be07a','humanApproved':0})

# P judgments are specific to the complete cases actually read; no real learner or
# experiment is inferred from worked model responses.
P_NOTES = {
'73a3419c': 'Both linear-fragment cases conserve total length: 1000 -> 400+600; 1200 with cuts at 300/900 -> 300+600+300. Lost recognition sites require new fragment reasoning, not extra copied DNA. Two complete DE/EN cases, worked responses and fresh-transfer rubrics support the new atom.',
'374e6de5': 'Promoter recognition and translation are independently necessary in case 1; restoring recognition with translation blocked still yields no protein. Case 2 separates full-length translation from unestablished folding/processing, and a premature stop cannot establish full product. DNA presence never substitutes for expression evidence.',
'80235254': 'Agricultural knowledge and wastewater practices are socially transmitted; each case explains present human and environmental effects and revisits a changed practice or missing training. Neither case turns cultural transmission into genetic inheritance or treats an untrained community as biologically unable.',
'430b2b73': 'Chronology, mosaic traits, overlapping F4, search/preservation bias and uncertain tool makers are handled appropriately in both fossil cases. However case human-reconstruction-fossil-mosaic materialEn and profile taskDemandEn retain an extra Modern card about current socially transmitted practices with no German counterpart. Remove this cultural-evolution residue in both current whole artifacts; preserve valid fossil reasoning and the corrected fossil raster.',
'7d2da9ab': 'Both cases distinguish immediate trigger/physiology from a possible inherited functional explanation. A harmless recording can alter appraisal without sudden genetic change; a response with no current benefit does not prove its historical adaptive origin. Rubrics correctly ask for comparative evidence and retain hypotheses as hypotheses.',
'4a8a6cec': 'Yeast budding and fermentation jointly explain culture supply and CO2/ethanol use; a lactate-only culture cannot simply replace gas-producing yeast in dough. The bacterial case connects cell organization, binary fission and acidification, while lack of usable sugar limits product formation. This is one functional utilization competence, not three unrelated goals.',
'a3f483ce': 'Inward primers and antiparallel extension bound a target; outward primers do not generate the stated bounded amplification. Positive and no-template controls limit interpretation of a PCR result. Ideal cycle doubling is explicitly bounded and no synthetic outcome is claimed as an actual PCR experiment or proof of a live organism.',
'528a3cd3': 'Plasmid uptake, independent replication and daughter-cell maintenance are separated from chromosome integration and protein expression. The viral case distinguishes transient episomal DNA from stable integration and does not imply autonomous viral propagation. The two carriers are alternative models for one DNA-transfer/cloning competence.',
'27b22c33': 'Medicine V2 body is retained exactly. Given insulin-precursor construct and host signals support the example chain through production, processing, purification and quality checks. In case 2 the fresh X host is distinct: known processing does not establish expression; earlier B/E facts remain intact. New surrounding native contexts are suitable; no new medicine science approval or prior judgment is fabricated.',
'9b40dae5': 'Spatial and temporal Hox/regulatory changes explain developmental patterns while heritable variation is kept distinct from sterile or environmentally induced phenotypes. Similar shape in a separately derived line is not enough to establish close kinship. Both fresh variations require a changed causal explanation rather than repetition of a label.'
}
bindings = read(AUTHOR/'final/ten-whole-current-P-profile-material-bindings.json')['records']
author_P = [json.loads(s) for s in (AUTHOR/'positive/ten-final-fossil-image-author.pending.review.jsonl').read_text().splitlines()]
P = []; P_receipts = []
v2 = read(ROOT / entry['medicineV2']['entry']['path'])
medicine_id = '27b22c33-908c-5fa8-9d9f-a08aff8da143'
for b in bindings:
    gid=b['goalId']; profile_file=ROOT/b['wholeProfile']['path']; material_file=ROOT/b['wholeTwoCases']['path']
    profile=read(profile_file); profile=profile.get('profile',profile); cases=read(material_file)
    assert len(cases)==2
    brief_checks=[]
    for brief, case in zip(profile['applicationCaseBriefs'],cases):
        checks={'caseId':brief['id']==case['caseId']}
        for lang in ['De','En']:
            task='\n\n'.join([case['material'+lang],case['task'+lang],'Frische Variation: '+case['freshTransferTask'+lang] if lang=='De' else 'Fresh variation: '+case['freshTransferTask'+lang]])
            expected='\n\n'.join([case['workedResponse'+lang],'Transfer: '+case['workedFreshTransfer'+lang]])
            # Prefix punctuation varies among author products; preserve the exact
            # complete strings while checking every substantive component is present.
            checks['material'+lang+'Included']=case['material'+lang] in brief['taskDemand'+lang]
            checks['task'+lang+'Included']=case['task'+lang] in brief['taskDemand'+lang]
            checks['freshTransfer'+lang+'Included']=case['freshTransferTask'+lang] in brief['taskDemand'+lang]
            checks['workedResponse'+lang+'Included']=case['workedResponse'+lang] in brief['expectedPerformance'+lang]
            checks['workedTransfer'+lang+'Included']=case['workedFreshTransfer'+lang] in brief['expectedPerformance'+lang]
        brief_checks.append(checks)
    exact_retention=None
    if gid==medicine_id:
        prior_profile=read(ROOT/v2['wholeCurrentProfile']['path']); prior_profile=prior_profile.get('profile',prior_profile)
        prior_cases=read(ROOT/v2['wholeTwoCases']['path'])
        exact_retention={'profileBodyExact':profile==prior_profile,'wholeCasesExact':cases==prior_cases,'priorProfile':ref(ROOT/v2['wholeCurrentProfile']['path']),'priorCases':ref(ROOT/v2['wholeTwoCases']['path'])}
        assert exact_retention['profileBodyExact'] and exact_retention['wholeCasesExact']
    normal=copy.deepcopy(next(r for r in author_P if r['goalId']==gid))
    normal.update(reviewId=RUN+'-first-p10',status='needs_human_review',reviewAuthority='ai_candidate',reviewedAt=NOW,reviewer='OpenAI / Codex, genuine independent B; runtime revision not exposed',reason=P_NOTES[gid[:8]],evidenceLevel='E1',maximumClaimScope='G1',reviewRunIds=[])
    normal['dissent']=['English material includes an unrelated current-cultural-evolution card; correction required before this exact profile can be closed.'] if gid.startswith('430b2') else []
    P.append(normal)
    P_receipts.append({'goalId':gid,'profile':ref(profile_file),'wholeTwoCases':ref(material_file),'caseIds':[c['caseId'] for c in cases],'actualCompleteBilingualCasesRead':True,'profileBriefBindings':brief_checks,'judgment':'revise_material_and_profile' if gid.startswith('430b2') else ('retain_exact_medicine_v2_and_review_new_context' if gid==medicine_id else 'suitable_ai_candidate'),'scientificRationale':P_NOTES[gid[:8]],'medicineRetention':exact_retention,'actualLearnerPerformance':False,'actualExperimentPerformed':False,'humanApproval':False})
write_lines('positive/ten-current-normal-FIRST.review.jsonl',P)
write('positive/ten-whole-profiles-and-twenty-whole-cases.actual-FIRST.receipt.json',{'runId':RUN,'records':P_receipts,'wholeProfilesRead':10,'completeCasesRead':20,'humanApproved':0,'evidenceLevel':'E1','maximumClaimScope':'G1','priorReviewVerdictsRead':False})

candidate=read(AUTHOR/'candidate/whole483-final-fossil-image-substantive-successor.inactive.json')
goals={g['id']:g for g in candidate['goals']}
AM=[]
for b in bindings:
    gid=b['goalId']; g=goals[gid]
    if gid.startswith('4a8a'): a='One integrated causal explanation of biotechnology usability. Basic organization, reproduction and metabolism are supporting facets explicitly coupled by the Bavarian primary operator; keyword splitting would lose that relationship.'
    elif gid.startswith('528a'): a='One DNA-transfer and clonal-maintenance model. Plasmid and viral carriers are alternatives, and stable cloning is explained along the same workflow; protein expression is assessed separately in 374e.'
    elif gid.startswith('430b2'): a='One bounded biological reconstruction from fossils. The independent current-cultural-analysis performance now has its own atom 8023. The fossil P English residue is a material defect, not evidence that the current description remains combined.'
    elif gid.startswith('8023'): a='One analysis of socially transmitted current practices and their human/environmental consequences. Contrasting cultural transmission with genetic inheritance bounds this analysis rather than adding a separate course.'
    elif gid.startswith('73a'): a='One sequence-dependent cleavage and fragment-inference competence; amplification and gel interpretation are separate atoms.'
    elif gid.startswith('374e'): a='One conditional explanation of recombinant expression; presence of DNA is contrasted with functioning signals and host processes.'
    elif gid.startswith('7d2'): a='One bounded evolutionary explanation of selected behavior; proximal trigger and candidate historical function are complementary explanation levels.'
    elif gid.startswith('a3f'): a='One PCR principle/application competence with controls and changed conditions; gel analysis remains separate.'
    elif gid.startswith('27b'): a='One explanatory production-chain example; multiple stages serve the single medicine-production performance. Exact V2 body is retained.'
    else: a='One developmental-regulation explanation of evolutionary variation; Hox genes and regulatory timing/location supply a common causal model.'
    AM.append({'goalId':gid,'goalBinding':{'titleDe':g['title'],'titleEn':g['titleEn'],'descriptionDe':g['description'],'descriptionEn':g['descriptionEn']},'A':{'decision':'atomic_one_integrated_competence','rationale':a},'M':{'decision':'no_memory_needed','rationale':'Assessed performance is explanation, model analysis and transfer. Required terms/data are supplied or taught through prerequisites; no new fixed recall corpus is needed to establish this goal. This judgment adds no deck or Verified Recall requirement.'},'status':'needs_human_review','reviewAuthority':'ai_candidate','humanApproved':0})
for gid in ['523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0','d11b3b18-deec-5d1a-bff6-512cddf595a2']:
    AM.append({'goalId':gid,'A':{'decision':'curricular_area_not_atomic','rationale':'Contains independently assessed child competencies. Retained overview image helps navigation but cannot stand in for an atomic performance or V evidence for a child.'},'M':{'decision':'not_applicable_to_cluster','rationale':'Navigation bundle is not a new recall target.'},'status':'needs_human_review','reviewAuthority':'ai_candidate','humanApproved':0})
write('atomicity-memory/ten-atoms-two-clusters.actual-FIRST.review.json',{'runId':RUN,'records':AM,'classificationLedgerNotApproval':True,'humanApproved':0})

V_NOTES={
'4a8a6cec':'Outer cell-wall and inner membrane pointers now separate correctly. Budding yeast, culture expansion and sugar-to-CO2/ethanol support the intended explanation. Expansion arrow denotes culture growth, not a literal one-cell four-way division.',
'73a3419c':'Recognition marker, enzyme and fragments show sequence-dependent cleavage of existing DNA. The unmatched lower sequence does not cut; no exact nucleotide recognition sequence is falsely supplied.',
'374e6de5':'Compatible promoter/host on the green side leads through mRNA and ribosome to protein; orange side retains DNA but stops. Small promoter annotations are dense at 360, yet the central matching-condition versus no-product contrast remains legible without requiring every small label.',
'80235254':'Teaching, gardening and food/habitat consequences express socially transmitted current practice. No genetic-inheritance mechanism or ranked human group appears.',
'7d2da9ab':'Trigger, response and possible function are separated, with an explicit question mark and evidence warning. The lower fork depicts shared ancestry; the living-looking small mammal is not presented as a direct human ancestor.',
'430b2b73':'Fossil material, chronology, dotted hypothesis branches and alternatives correctly support bounded reconstruction. The chronology arrow is not a direct ancestor chain, and new evidence can revise the hypothesis. Cultural distraction is removed.',
'27b22c33':'Retain the existing production-chain illustration. Bioreactor, downstream purification and protein product support an explanatory example, not a laboratory protocol or guaranteed host-independent expression.',
'9b40dae5':'Retain the existing Hox/regulatory location-time illustration. Developmental patterns and possible variation are shown without purposeful evolution or guaranteed adaptive success.',
'528a3cd3':'Retain the existing insertion, uptake and plasmid-maintenance image; bacterial chromosomal DNA remains distinct, and no automatic expression is depicted.',
'a3f483ce':'Retain the existing PCR image; separated templates, oppositely directed primers/extensions and repeated copying form a coherent simplified cycle.',
'523f7ef4':'Retain the methods overview only on the cluster. Restriction, PCR and gel are visibly separate; polarity and smaller-fragment migration are coherent. This is not the atomic V substitute for all three children.',
'd11b3b18':'Retain the vector/expression overview only on the cluster. Its assumed compatible expression conditions must be taught in the separate atom 374e; the image cannot grant expression mastery solely from DNA uptake.'
}
V=[]
for r in entry['actualCurrent12Rasters']:
    gid=r['goalId']; refs=[r['PNG']]+r['actualProportionalViews']
    for f in refs: assert ref(ROOT/f['path'])==f
    V.append({'goalId':gid,'original':refs[0],'proportional360':refs[1],'proportional680':refs[2],'actualRasterFilesVisuallyInspected':True,'decision':'keep_existing_good_raster' if gid[:8] in ['27b22c33','9b40dae5','528a3cd3','a3f483ce','523f7ef4','d11b3b18'] else 'suitable_new_ai_candidate','role':'cluster_overview_only' if gid[:8] in ['523f7ef4','d11b3b18'] else 'atomic_primary','rationale':V_NOTES[gid[:8]],'imageRegenerationRequired':False,'reviewAuthority':'ai_candidate','status':'needs_human_review','humanApproved':0})
write('visualization/twelve-original-360-680.actual-FIRST.review.json',{'runId':RUN,'actualRastersViewed':36,'records':V,'humanApproved':0,'regenerationRequested':False})

# Independently confirm the purported navigation-only classification by comparing
# every changed old page after removing only ordering/page-reference metadata.
delta=read(AUTHOR/'checks/final-whole396-all299-current-page-and-context-deltas.author.json')
def strip_nav(v):
    if isinstance(v,list): return [strip_nav(x) for x in v]
    if isinstance(v,dict): return {k:strip_nav(x) for k,x in v.items() if k not in ['pageNumber','navigationOrder','treeOrder','pageFingerprint']}
    return v
nav=[];substantive=[]
for d in delta['allActualWholeChangedPageBodies']:
    same=strip_nav(d['before'])==strip_nav(d['after'])
    result={'goalId':d['goalId'],'onlyOrderAndPageReferencesDiffer':same,'authorNavigationOnlyClassification':d['positionOrPageReferenceOnly']}
    (nav if d['positionOrPageReferenceOnly'] else substantive).append(result)
write('native/navigation284-and-substantive15.binding-classification.actual.json',{'runId':RUN,'input':ref(AUTHOR/'checks/final-whole396-all299-current-page-and-context-deltas.author.json'),'navigationOnly':nav,'substantiveOldPages':substantive,'newPages':delta['newPages'],'scientificReviewRestartForNavigationOnly':False,'newApprovalFromHashComparison':False})

pdf=AUTHOR/'native/nineteen-final-current-native/bundle/book.pdf'
pdf_capture=read(AUTHOR/'checks/native-nineteen-final-pdf-captures.actual.json')
doc=fitz.open(pdf)
pdf_rows=[]
for i,(r,g) in enumerate(zip(pdf_capture['wholePages'],[x['goal'] for x in inputs])):
    page=doc[i+2]; text=page.get_text()
    assert g['goalId'] in text and r['goalId']==g['goalId']
    assert ref(ROOT/r['capture']['path'])==r['capture']
    pdf_rows.append({'goalId':g['goalId'],'physicalPdfPage':i+3,'pageFingerprint':g['pageFingerprint'],'capture':r['capture'],'wholePdfPageVisuallyInspected':True,'goalIdExtractedFromActualPdf':True,'wholePortableHtmlPageVisuallyInspected':True,'descriptionAndFullRequiresSuccessorContextRead':True,'layoutJudgment':'suitable_whole_page','scientificDecision':'D_keep_separately_recorded'})
write('native/nineteen-whole-html-pdf.actual-FIRST.receipt.json',{'runId':RUN,'actualPdf':ref(pdf),'physicalPages':len(doc),'frontMatterPages':2,'wholeGoalPages':19,'rows':pdf_rows,'htmlBrowserReceipt':ref(OWN/'native/actual-portable19-browser.receipt.json'),'titleGeometryReceipt':ref(OWN/'native/title-layout.actual.json'),'wholePagesInspectedByReviewer':True,'humanApproval':False})

# Full primary operators were read before these bounded judgments. Exact mapping
# pairs and atlas counts are transport facts; no whole source clause/course award.
sources=read(AUTHOR/'sources/final31-pairs-and34-whole-direct-operators.regular-primary.author.json')
SOURCE_NOTES=[
('PDF physical38, RLP3.8','Fossil/skull comparison and human evolution component. The synthetic fossil cases explain bounded reconstruction; they do not certify the actual listed investigation or the entire evolution field.'),
('PDF physical38, RLP3.8','Same official joint RLP bytes as BB, with BE jurisdiction preserved; no duplicated full-course award.'),
('HTML B9 Lernbereich2','Exact integrated operator: usability through basic organization, reproduction and metabolism. One functional competence is justified; population growth, dormancy, conservation and all listed uses remain separate source duties.'),
('HTML B9 Lernbereich3.3','Foreign-DNA introduction is an appropriate partial technology component; medical/social/ethical evaluation is an additional duty and retained evaluation partners matter.'),
('HTML B10 Lernbereich4','The original fossil-reconstruction AND present-cultural-consequences operator now spans separate 430b and 8023 atoms. Neither alone receives whole-AND credit.'),
('HTML B12 GA Lernbereich2.4','Technique-principle/application component is partial. Social evaluation and listed applications are not fulfilled by the methods overview alone.'),
('HTML B12 EA Lernbereich2.4','A concrete technique is required as well as application/evaluation. New atomic technique products help that component; neither PCR alone nor the overview closes the complete operator.'),
('HTML B10 Lernbereich4','Current culture analysis is properly separate from fossils. Its human/environmental consequences cover this component; full human-history/systematics partners remain necessary.'),
('PDF physical38–39, Q1.2','PCR AND gel and LK engineering subclauses remain distinct. Cluster methods navigation is not an atomic performance or complete Q1.2 coverage.'),
('PDF physical39, Q1.2 LK','Plasmid/virus foreign-DNA introduction and cloning form one coupled model; protein biosynthesis, expression and broader Gentechnik duties are not inferred from uptake.'),
('PDF physical39, Q1.2 LK','Second direct HE witness has the same bounded transfer/cloning component; preserve its own source ID and partner routes.'),
('PDF physical38–39, Q1.4 optional','The medicine example is a partial LK component of optional Q1.4, not universal LK compulsory content. Existing CRISPR and evaluation duties remain independent.'),
('PDF physical39, Q1.2 GK/LK','PCR principle/application is a component of PCR AND gel; PCR cases cannot stand in for gel interpretation.'),
('PDF physical40, Q1.5 optional','Homeobox/genactivity developmental component supports this route partially. The primary page does not by itself mandate the entire Evo-Devo evolutionary interpretation as universal LK content.'),
('PDF physical39, Q1.2','Explicit PCR AND gel operator needs both a3f and 8eb components; keeping partial mapping is appropriate.'),
('PDF physical38–39, Q1.4 optional','374e supplies conditional expression knowledge used in the medicine example. This does not make optional Q1.4 universal or replace the example and ethical-risk components.'),
('PDF physical25','Food production by bacteria/yeast supports utilization explanation. Other microorganism, viral, observation and application duties remain outside this atom.'),
('PDF physical27','Human-history component is bounded; no full evolution/biology course closure follows from the fossil atom.'),
('PDF physical17–18','Yeast/bacterial structure, nutrition, reproduction and food use support explanation. Actual microscopy and the wider microorganism/virus content are not performed by synthetic worked cases.'),
('PDF physical32','Human-origin/fossil/Out-of-Africa and cultural context are broader than one fossil atom; retain source partners and no all-content award.'),
('PDF physical32, IF5','Fossil-based reconstruction hypotheses directly support the 430b component; full IF5 duties remain separate.'),
('PDF physical46–47, TF11','Technology explanation is appropriate as a component in an open-context field. Research/presentation and chance/risk argumentation are not replaced by microbe mechanism explanation.'),
('PDF physical48–49, TF12','Anatomical/genetic kinship data is broader than fossil chronology. Fossil reconstruction is partial and systematic-placement partner 5c7 remains relevant.'),
('PDF physical48–49, TF12','Selected human behavior, for example stress response, can be explained using ancestry. 7d2 appropriately separates trigger and hypothetical function, and demands evidence rather than an adaptation story as fact.'),
('PDF physical48–49, TF12','Human cultural development in the biosphere includes current effects, but one current-practice case does not close all historic/cross-disciplinary obligations.'),
('PDF physical30–33','Primate relationships, hominization factors and a simple human relationship tree are broader than isolated fossil hypotheses; partial mapping and companion goals are essential.'),
('PDF physical30–31, printed18–19','Structure/reproduction/food-industrial use supports utilization, but required experiments including air plates/yoghurt cultures remain actual operational duties, not satisfied by reading a model.'),
('PDF physical44, printed32','Human ancestry, time/find locations and culture/biology interaction need distinct components. Fossil reconstruction is partial.'),
('PDF physical44, printed32','Current cultural consequences support one culture/biology component. Historic human origins and other social development duties are not inferred as complete.'),
('PDF physical30–31','Utilization explanation is valid, but planning/conducting/protocoling fermentation under varied conditions and other long-term/digital operations remain unperformed source duties.'),
('PDF physical44–45','Human fossil/evolution explanation is partial; observation, physical models, selection experiment and computer simulation are not demonstrated by a synthetic written fossil case.'),
('PDF physical21, printed15','Bacterial basic structure/food use supports a component. Actual microscope preparation/use/drawing and other cell duties remain independent.'),
('PDF physical30–31, printed24–25','Fossil/human relationship hypotheses are partial. The text distinguishes cladogram from genealogy; the new image offers hypotheses rather than a proven species ancestor chain.'),
('PDF physical30–31, printed24–25','Cultural/social development and current human/environmental contexts support the new current-analysis atom as a component, not complete evolution or all social duties.')
]
assert len(SOURCE_NOTES)==len(sources['records'])==34
SRC=[]
for r,(span,note) in zip(sources['records'],SOURCE_NOTES):
    primary=r['actualPrimaryBytes']; assert ref(ROOT/primary['path'])==primary
    SRC.append({'canonicalGoalId':r['canonicalGoalId'],'sourceGoalId':r['wholeLiteralSourceGoal']['id'],'actualPrimary':primary,'actualWholeOperatorLocationRead':span,'mappingMatchType':r['wholeMappingRecord']['matchType'],'mapping':r['wholeMapping'],'extraction':r['wholeExtraction'],'judgment':'bounded_component_appropriate_no_whole_clause_or_course_credit','rationale':note,'wholeSourceClauseApproved':False,'wholeCourseApproved':False,'humanApproved':0})
atlas=read(AUTHOR/'sources/final-explicit-operators-normal-output/source-projection.receipt.json')
rp_scope=next(s for s in atlas['scopes'] if s.get('jurisdiction')=='DE-RP')
rp_id='rp-bio-seki-rp-bio-seki-2014-tf11-biowissenschaften-und-gesellschaft-003-8927c877'
rp_mapping=read(AUTHOR/'sources/RP-final-explicit-theory-prerequisite-role.successor.json')
rp_f53=next(m for m in rp_mapping['mappings'] if m['legacyGoalId']==rp_id and m['canonicalGoalId'].startswith('f53d'))
rp_witnesses=[w for w in atlas['witnessGroups'] if w['sourceGoalId']==rp_id]
write('source/thirty-four-primary-operators-thirty-one-pairs-and-scope.actual-FIRST.review.json',{'runId':RUN,'records':SRC,'wholePairsExactBindings':sources['wholePairs'],'actualSourceAtlas':ref(AUTHOR/'sources/final-explicit-operators-normal-output/source-projection.receipt.json'),'scopeCountsTechnicalOnly':atlas['counts'],'scopeChangesInput':ref(AUTHOR/'checks/final24-exact-operator-role-current-scope-and-witness-deltas.author.json'),'RPArgumentationSeparation':{'actualPrimaryLocation':'PDF physical46–47; TF11','argumentPerformancePartners':['0f9318ec-90eb-5381-b670-8fb2f2789c3d','5ee0f660-66f1-5aa6-a01d-e3b010db01ff','9540a95d-5ca5-527c-918f-d702e99be07a'],'f53AuthorMapping':rp_f53,'f53StillInCompiledTargetGoalIds':'f53d0a0b-d9b8-5012-92b5-3a021ab6c30b' in rp_scope['goalIds'],'actualCompiledWitnesses':rp_witnesses,'interpretation':'Author annotation qualifies f53 as theory/prerequisite only for SOURCE PERFORMANCE. The normal atlas still transports it as a direct target witness and does not encode a runtime prerequisiteOnly role. Do not cite that witness as argument performance or claim a runtime role conversion from this annotation. This receipt preserves the distinction without awarding whole-source approval.'},'wholeCourseOrFullClauseApprovals':0,'allOtherUnchangedScienceRestarted':False,'humanApproved':0})

before=read(ROOT/neutral['coreInputs']['current353Whole479']['path'])
before_g={g['id']:g for g in before['goals']}
changes=[gid for gid,g in before_g.items() if goals.get(gid)!=g]
qa_before=read(ROOT/neutral['coreInputs']['current353QA394']['path'])
qa_after=read(AUTHOR/'candidate/QA396.final-fossil-image-pending.json')
qb={r['goalId']:r for r in qa_before['records']};qa={r['goalId']:r for r in qa_after['records']}
strict_ids=[gid for gid,r in qb.items() if r.get('deepUnderstandingStatus')=='approved']
# The repository's strict intersection is not inferred from one QA label.
qa_row_changes=[gid for gid,r in qb.items() if qa.get(gid)!=r]
baseline353_visual_ids=[gid for gid,r in qb.items() if r.get('aiApproved')=='yes']
assert len(baseline353_visual_ids)==353
assert all(qb[gid]==qa[gid] for gid in baseline353_visual_ids)
def acyclic(edge):
    colors={};stack=[]
    def visit(gid):
        if colors.get(gid)==1: raise ValueError((edge,stack+[gid]))
        if colors.get(gid)==2:return
        colors[gid]=1;stack.append(gid)
        for n in goals[gid].get(edge,[]):
            if n not in goals: raise ValueError(('missing',n))
            visit(n)
        stack.pop();colors[gid]=2
    for gid in goals:visit(gid)
    return {'acyclic':True,'visited':len(colors)}
write('checks/exact-input-goal-QA-navigation-and-DAG.actual-FIRST.json',{'runId':RUN,'entry':ref(AUTHOR/'author-substantive-four.portable-final.entry.json'),'freeze':ref(AUTHOR/'author-substantive-four.portable-final.freeze.json'),'candidate':ref(AUTHOR/'candidate/whole483-final-fossil-image-substantive-successor.inactive.json'),'baseline':ref(ROOT/neutral['coreInputs']['current353Whole479']['path']),'oldWholeGoals':len(before_g),'candidateWholeGoals':len(goals),'newWholeGoalIds':sorted(set(goals)-set(before_g)),'changedOldWholeGoalIds':changes,'unchangedOldWholeGoals':len(before_g)-len(changes),'changedOldQARowIds':qa_row_changes,'baseline353VisualQARowsExact':True,'baseline353VisualGoalIds':baseline353_visual_ids,'strictMachineIntersectionRecomputedFromVisualLabel':False,'requires':acyclic('requires'),'contains':acyclic('contains'),'navigationClassified284':len(nav),'navigationExactAfterOnlyPageOrderingRemoval':sum(r['onlyOrderAndPageReferencesDiffer'] for r in nav),'substantiveOld15':len(substantive),'newDescriptionsOrScienceApprovedByThisCheck':False,'strictActiveGain':0,'activeFilesEditedByReviewer':[]})

findings=[{'findingId':'FOSSIL-P-EN-CULTURE-RESIDUE','goalId':'430b2b73-641a-5122-bb6d-162b0d1eaf2d','severity':'targeted_correction_required_for_P','artifact':ref(AUTHOR/'materials/430b2b73-641a-5122-bb6d-162b0d1eaf2d.whole-two-cases.json'),'caseId':'human-reconstruction-fossil-mosaic','field':'materialEn','profileArtifact':ref(AUTHOR/'final/profiles/430b2b73-641a-5122-bb6d-162b0d1eaf2d.whole-current-profile.json'),'profileField':'applicationCaseBriefs[0].taskDemandEn','actualText':'Modern card: socially/written transmitted practices alter diet/settlement with resource use.','reasonDe':'Nach der Trennung von Fossilrekonstruktion und heutiger kultureller Evolution bleibt dieser zusätzliche Hinweis nur im englischen Fossilfall. Er erzeugt eine bilinguale Asymmetrie und mischt das neue eigene Kulturlernziel zurück in das Material.','requiredCorrectionDe':'Den Zusatz aus dem vollständigen englischen Fallmaterial und dem daraus gebundenen Profil entfernen; danach die betroffenen P-Fingerprints und exakten Nachweise neu binden. Die gute Fossilbeschreibung, Lösungen und das neue Raster können erhalten bleiben.','DDescriptionDecision':'keep','VRegenerationRequired':False}]
write('FIRST.findings.json',{'runId':RUN,'blindFirstPass':True,'findings':findings,'sourceRoleQualificationRecordedSeparately':True,'humanApproved':0})

errors=[]
for label,rows,schema_path in [('D19',D,ROOT/'contracts/goal-description-review/v1/goal-description-review-record.schema.json'),('P10',P,ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')]:
    validator=jsonschema.Draft202012Validator(read(schema_path),format_checker=jsonschema.FormatChecker())
    for i,r in enumerate(rows):
        errors += [{'lane':label,'record':i+1,'path':list(e.path),'message':e.message} for e in validator.iter_errors(r)]
assert not errors, errors
write('checks/normal-D19-P10-schema.actual.json',{'runId':RUN,'D19RecordsValidated':len(D),'P10RecordsValidated':len(P),'errors':errors,'schemaBindings':[ref(ROOT/'contracts/goal-description-review/v1/goal-description-review-record.schema.json'),ref(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')],'scientificApprovalBySchema':False})
write('description/normal-FIRST.run-manifest.json',{'schemaVersion':1,'runId':RUN+'.FIRST.D19','status':'completed','provider':'OpenAI','model':'Codex GPT-6 family; exact runtime revision not exposed','independenceGroupId':RUN,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchInput':ref(raw_path),'bundleFingerprint':inputs[0]['bundleFingerprint'],'bookDigest':inputs[0]['bookDigest'],'goals':[r['goalId'] for r in D],'reviewRecords':ref(OWN/'description/nineteen-current-normal-FIRST.review.jsonl'),'reviewAuthority':'ai_candidate','blindFirstSealedBeforeAnyOtherReviewRead':True,'normalSchemaValidation':ref(OWN/'checks/normal-D19-P10-schema.actual.json'),'humanApproved':0})
print(json.dumps({'D':len(D),'P':len(P),'cases':20,'rasters':36,'primaryOperators':34,'navigation284Exact':sum(r['onlyOrderAndPageReferencesDiffer'] for r in nav),'findings':len(findings),'schemaErrors':errors}))
