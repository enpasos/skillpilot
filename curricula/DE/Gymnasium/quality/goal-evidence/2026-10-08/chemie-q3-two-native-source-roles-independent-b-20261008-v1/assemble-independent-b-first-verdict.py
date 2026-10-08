"""Independent reviewer B output, never an author result or active integration."""
import pathlib, json, hashlib, datetime, copy, re, unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = OUT.parent / 'chemie-q3-two-native-source-roles-resume-technical-20261008-v1'
ROUND = AUTHOR / 'native/two/round-b'
assert not (OUT / 'native-b.first-verdict.seal.json').exists(), 'First verdict is immutable'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
REVIEWER = '/root/curricula_live_diagnosis/zip64_loader_source'
IDS = ['d9cce642-4f89-57f8-832a-abeb62586195', '3eada74b-25b8-55dc-811a-acb473196f53']
def read(p): return json.loads(p.read_text())
def put(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def receipt(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def js(v): return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def sha(v): return 'sha256:' + hashlib.sha256(v.encode()).hexdigest()

before = read(AUTHOR / 'before/canonical.exact.json')
candidate = read(AUTHOR / 'candidate/canonical.current480.two-resource-links.inactive.json')
bg = {g['id']: g for g in before['goals']}; cg = {g['id']: g for g in candidate['goals']}
oldbook = read(AUTHOR / 'native/full378-before.actual-loader.book-model.json')
book = read(AUTHOR / 'native/full378-candidate.actual-api.book-model.json')
oldpages = {p['goalId']: p for p in oldbook['pages']}; pages = {p['goalId']: p for p in book['pages']}
checks = []
def check(name, truth, details=None):
    checks.append({'check': name, 'pass': bool(truth), 'details': details})
check('480 whole canonical goals and IDs preserved', len(bg) == len(cg) == 480 and set(bg) == set(cg))
check('478 other whole canonical bodies identical', all(bg[i] == cg[i] for i in bg if i not in IDS))
check('Two selected non-resource fields identical', all({k:v for k,v in bg[i].items() if k != 'resourceLinks'} == {k:v for k,v in cg[i].items() if k != 'resourceLinks'} for i in IDS))
check('Complete 378 page IDs and order preserved', len(book['pages']) == len(oldbook['pages']) == 378 and list(oldpages) == list(pages))
check('376 other complete page objects identical', all(oldpages[i] == pages[i] for i in pages if i not in IDS))
oldnav=copy.deepcopy(oldbook['navigation']);newnav=copy.deepcopy(book['navigation'])
oldlabel=oldnav['canonicalProjectionSource'].pop('title');newlabel=newnav['canonicalProjectionSource'].pop('title')
oldprojection=oldnav['canonicalProjectionSource'].pop('projectionFingerprint');newprojection=newnav['canonicalProjectionSource'].pop('projectionFingerprint')
check('All chapter and operative navigation bodies preserved', book['chapters'] == oldbook['chapters'] and oldnav == newnav, {'projectionSourceLabel':{'before':oldlabel,'candidate':newlabel},'derivedProjectionBinding':{'before':oldprojection,'candidate':newprojection},'otherNavigationFieldsIdentical':True})
oldqa=read(AUTHOR/'before/qa.exact.json')['records'];newqa=read(AUTHOR/'candidate/visualization-qa.current378.only-six-unapproved.inactive.json')['records'];qb={q['goalId']:q for q in oldqa};qn={q['goalId']:q for q in newqa}
check('Actual 379 QA rows retained; other378 whole rows including JPEG8 history unchanged', len(qb)==len(qn)==379 and set(qb)==set(qn) and all(qb[i]==qn[i] for i in qb if i!=IDS[0]), {'actualWholeLedgerRows':379,'curricularAtomicDenominator':378,'onlyGoal6QARowChanged':True})
check('Human QA fields in all actual379 ledger rows unchanged', all({k:v for k,v in qb[i].items() if k.startswith('human')}=={k:v for k,v in qn[i].items() if k.startswith('human')} for i in qb))
profiles = [json.loads(l) for l in (AUTHOR / 'positive/P2-current-whole-profiles-real-resource-native-author.jsonl').read_text().splitlines()]
priorprofiles = [json.loads(l) for l in (AUTHOR / 'positive/P2-existing-whole-author-records.exact.jsonl').read_text().splitlines()]
check('Whole P2 profile bodies retained', {p['goalId']:p['profile'] for p in profiles} == {p['goalId']:p['profile'] for p in priorprofiles})
cases = read(AUTHOR / 'science/selected4-whole-DEEN-cases.exact.json')['cases']
check('Four whole bilingual authored cases with independent fresh transfer and 10-point scoring', len(cases) == 4 and all(sum(c['points'] for c in x['scoring']['criteria']) == x['scoring']['maximumPoints'] == 10 and x['freshTransfer']['independentAdministration'] and x['freshTransfer']['releaseModelOnlyAfterSubmission'] for x in cases))
source = read(AUTHOR / 'source/selected49-current-roles-corrected-locators.author-context.json')['rows']
partners = read(AUTHOR / 'source/selected49-whole259-partner-bodies.exact.json')
check('49 whole duties with 259 exact partner rows and 57 whole bodies', len(source) == len(partners) == 49 and sum(len(r['wholeCurrentCanonicalPartners']) for r in partners) == 259 and len({p['wholeCurrentCanonicalPartner']['id'] for r in partners for p in r['wholeCurrentCanonicalPartners']}) == 57)
counts = [{'goalId': i, 'duties': sum(any(p['canonicalGoalId'] == i for p in r['allOriginalPartnerRows']) for r in source), 'partnersAcrossDuties': sum(len(r['allOriginalPartnerRows']) for r in source if any(p['canonicalGoalId'] == i for p in r['allOriginalPartnerRows']))} for i in IDS]
check('Selected goal whole-duty/partner counts', counts == [{'goalId':IDS[0],'duties':26,'partnersAcrossDuties':145},{'goalId':IDS[1],'duties':23,'partnersAcrossDuties':114}], counts)
holds = read(AUTHOR / 'source/whole16-holds-retained-from-sealed-A-and-B.json')
check('All 16 source-union holds retained', holds['holdCount'] == len(holds['rows']) == 16 and [r['sourceOrdinalInWhole106'] for r in holds['rows']] == [1,7,15,24,27,39,41,53,57,59,63,66,67,68,70,71])
put('whole16-source-union-holds.retained-exact.json', holds)

cfg = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-four-plus-d2cc-reviewed-integration-preparation-technical-20261007-v1/memory/current378.real-views.future-active.config.json')
memory = [json.loads(l) for l in (ROOT / cfg['reviewPath']).read_text().splitlines()]
mb = {r['goalId']:r for r in memory}
memorybindings=[]
for i in IDS:
    g = cg[i]; normalize=lambda v: re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v or ''))).strip()
    payload = {'ruleVersion':cfg['ruleVersion'],'goalId':i,'shortKey':g.get('shortKey',''),'title':normalize(g.get('title')),'titleEn':normalize(g.get('titleEn')),'description':normalize(g.get('description')),'descriptionEn':normalize(g.get('descriptionEn')),'phase':normalize(g.get('dimensionTags',{}).get('phase')),'area':normalize(g.get('dimensionTags',{}).get('area')),'topicCode':normalize(g.get('dimensionTags',{}).get('topicCode')),'nodeKind':normalize(g.get('nodeKind'))}
    current = sha(js(payload)); r=mb[i]
    check('Current unchanged M fingerprint '+i, current == r['fingerprint'] and r['status'] == 'no_memory_needed' and r['memoryUseful'] is False)
    memorybindings.append({'wholeCurrentMemoryRecord':r,'computedFingerprint':current,'textRelationsUnchanged':True,'memoryReopened':False})
put('memory2-current378-real-binding.read-only.json', {'recordCount':len(memory),'selected':memorybindings,'sevenVisibilityViewCount':len(cfg['visibilityScopes']),'fullMemoryReviewRerun':False,'memoryWrites':0})

essential = [
    ('Ein Katalysator eröffnet einen günstigeren Reaktionsweg und beschleunigt die Gleichgewichtseinstellung in beiden Richtungen. Bei unveränderten Bedingungen bleiben Gleichgewichtskonstante und Endzusammensetzung gleich; die Phasen der beteiligten Stoffe unterscheiden homogene und heterogene Katalyse.', 'A catalyst provides a lower-barrier pathway and accelerates equilibration in both directions. At unchanged conditions, the equilibrium constant and final composition remain unchanged; the phases of the participating substances distinguish homogeneous and heterogeneous catalysis.'),
    ('Die Entladung konkurrierender Teilchen hängt von lokalen Gleichgewichtspotenzialen und den zusätzlichen kinetischen Überspannungen ab. Eine thermodynamische Reihenfolge allein legt die reale Elektrodenreaktion nicht fest; Zersetzungsspannung und Elektrodenbedingungen müssen zusammen betrachtet werden.', 'Discharge of competing species depends on local equilibrium potentials and additional kinetic overpotentials. Thermodynamic order alone does not fix the actual electrode reaction; decomposition voltage and electrode conditions must be considered together.')]
performance = [
    ('Die lernende Person erklärt an Zeitdaten oder einem vorgegebenen Energieprofil, weshalb das Gleichgewicht früher und mit derselben Zusammensetzung erreicht wird, und ordnet eigene passende Beispiele anhand der Phasen homogener oder heterogener Katalyse zu.', 'The learner explains from time data or a supplied energy profile why equilibrium is reached sooner with the same composition and classifies suitable examples as homogeneous or heterogeneous using the phases.'),
    ('Die lernende Person leitet ladungs- und stoffbilanzierte Halbgleichungen der konkurrierenden Entladungen ab, begründet mit vorgegebenen lokalen Potenzialen und Überspannungen die Auswahl an beiden Elektroden und erklärt die dafür notwendige Modellspannung.', 'The learner derives atom- and charge-balanced half-equations for competing discharges, uses supplied local potentials and overpotentials to justify selection at both electrodes, and explains the required model voltage.')]
transfer = [
    ('Bei einem schon im Gleichgewicht befindlichen Gemisch oder bei gleichzeitig geänderter Temperatur trennt die lernende Person die reine Katalysatorwirkung von Änderungen der Gleichgewichtslage und begründet die Aussage für ein frisches Beispiel.', 'For a mixture already at equilibrium or one whose temperature also changes, the learner separates the catalyst effect itself from changes in equilibrium position and justifies the conclusion for a fresh example.'),
    ('Bei geändertem Elektrodenmaterial oder einer geänderten lokalen Teilchenversorgung prüft die lernende Person die Entladung neu und erklärt, wann die anfängliche oder allein thermodynamisch erwartete Reihenfolge wechseln kann.', 'With changed electrode material or local species supply, the learner reassesses discharge and explains when the initial or thermodynamically expected order can change.')]
atomic = [
    'PASS_SEMANTIC_ATOMIC: Die Erklärung der kinetischen Wirkung und die Phasenklassifikation kennzeichnen denselben Katalysebegriff im chemischen Gleichgewicht. Beispiele operationalisieren diese Erklärung. Le Chatelier/MWG begrenzen die vorausgesetzte Gleichgewichtslage; eigene Energieprofilproduktion 542d88e9…, technische/ökologische Bewertung 00c647e8… und vollständige Estermechanistik 667bc303… bleiben eigene Partnerleistungen. Der Kurztitel beurteilen erweitert die ausdrücklich erläutern/Beispiele nennen verlangende Beschreibung nicht zur industriellen Bewertung.',
    'PASS_SEMANTIC_ATOMIC: Reihenfolge, Halbgleichungen und Überspannungsbegründung sind Schritte einer elektrochemischen Auswahlentscheidung bei demselben lokalen Elektrolysezustand. Grundaufbau/erzwungener Prozess liegen bei 0c9fe376… und Spannungsreihe bei 8be14f15…; Faraday-Mengenrechnung b8c8f70f…, Nernst-Anwendung b7521ac7…, Versuchsdurchführung und industrielle Bewertung bleiben getrennt. Kein eigenständiges zweites Kompetenzbündel wird durch bloße Konjunktion verdeckt.']
rationales = [
    'KEEP: Ganze aktuelle DE/EN-Beschreibungen sind fachlich äquivalent und erhalten die präzise Gleichgewichtseinstellung. Die zwei vollständigen E1/G1-Autorenfälle erklären beide Richtungen, unverändertes K/Endgemisch und Phasenzuordnung; 80→40 bzw. 100→60 kJ/mol sind als Modellbarrieren korrekt. Die Quelle HE physisch46 belegt Katalyse und Phasendifferenz auf grundlegendem Niveau. Die 26 Quellenpflichten tragen nur den ausdrücklich gebundenen Teilbeitrag; mechanistische, diagrammerzeugende und Bewertungsoperatoren bleiben offen. '+atomic[0],
    'KEEP: Die ganzen aktuellen DE/EN-Beschreibungen bilden eine begründete lokale Auswahlkompetenz. Die vier Schritte Beschreibung/Ableitung/Spannungsmodell/Abweichung werden durch beide vollständigen E1/G1-Autorenfälle und getrennte frische Materialänderungen sichtbar. Die Ausgangsreihenfolge ist bedingt, keine universelle Standardpotenzialrangfolge. HE physisch47, BY13 erhöht LB5 und NI physisch27 begrenzen die normative Rolle auf das erhöhte Niveau, auch wenn technische Canon-Tags GK/LK lauten. 23 ganze Originalpflichten samt Partnern sind erhalten; Faraday, Diagrammnutzung und Experimente bleiben offen. '+atomic[1]]
campaign=read(ROUND/'description-review-campaign.json'); inp=read(ROUND/'description-review-input.json');bundle=read(ROUND/'review-bundle-manifest.json');batch=campaign['batches'][0]
runid='chemie-two-native-independent-b-first-pass-20261008-v1'
records=[]
for n,g in enumerate(inp['goals']):
    records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+'.goal-'+str(n+1),'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':{'essentialUnderstandingDe':essential[n][0],'essentialUnderstandingEn':essential[n][1],'observablePerformanceDe':performance[n][0],'observablePerformanceEn':performance[n][1],'transferExpectationDe':transfer[n][0],'transferExpectationEn':transfer[n][1]},'rationale':rationales[n],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
results=ROUND/'results';results.mkdir(exist_ok=True)
recordpath=results/(batch['batchId']+'.records.jsonl');recordpath.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
params={'provider':'OpenAI Codex','model':'Codex; exact model version not exposed','reviewer':REVIEWER,'samplingParameters':'not exposed','independentBlindFirstPass':True}
put('review-generation-metadata.actual.json',params)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':params['provider'],'model':params['model'],'role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':receipt(OUT/'review-generation-metadata.actual.json')['sha256'],'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':read(OUT/'native-b.first-input.freeze.json').get('createdAt',NOW),'completedAt':NOW,'status':'completed','outputDigest':receipt(recordpath)['sha256'],'toolchainVersion':'codex-independent-review-v1'}
(results/(batch['batchId']+'.run.json')).write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
put('ordinary-round-b.actual-reviewer-records.json',records)

whole=[]; ownprofiles=[]
for n,i in enumerate(IDS):
    p=next(p for p in profiles if p['goalId']==i)
    item={'goalId':i,'wholeCurrentGoal':cg[i],'wholeCurrentProfile':p['profile'],'wholeScienceAndNativePVerdict':'PASS_BOUNDED_AUTHORED_E1_G1','semanticAtomicityDecision':atomic[n],'scienceAndPedagogyReason':rationales[n],'caseIds':[c['caseId'] for c in cases if c['goalId']==i],'nativeGoalPhysicalPdfPage':n+3,'nativePdfDescriptionActuallyViewed':True,'profileBodyPreserved':True,'profileIsCoachAssessmentContractNotPrintedLearnerSolution':True,'profileCoverageNote':'Alle vier Erwartungen und beide ganzen Material-/Aufgaben-/Antwort-/Scoring-/Transferkörper wurden gelesen. Modellantworten sind keine Lernendenleistung; der getrennte Transfer wird vor Offenlegung der Musterantwort administriert. Zwei unabhängige Demonstrationen sind ein Nachweisvertrag, keine Aufforderung zu zusätzlichen Aufgaben nach bereits ausreichend gezeigter Evidenz.','sourceDutyCount':counts[n]['duties'],'allPartnerRows':counts[n]['partnersAcrossDuties'],'currentMemoryBinding':memorybindings[n],'newWholeSourceApproval':False,'sourceUnionHoldsRetained':16,'humanApproval':False,'humanTrial':False,'activeIntegration':False,'newStrictClosures':0}
    whole.append(item)
    q=copy.deepcopy(p);q.update({'reviewId':'chemie-two-native-independent-b-20261008-v1','reviewedAt':NOW,'reviewer':REVIEWER,'reason':rationales[n],'reviewRunIds':[runid],'dissent':['Native independent B candidate after actual PDF pages and assets; no human acceptance.','All 16 source union holds remain; bounded authored cases are E1/G1.','New PNG CLI binding still awaits separately authorized installation; no active integration.']});ownprofiles.append(q)
put('whole-science-P2-and-semantic-atomicity.independent-b.first-verdict.json',{'schemaVersion':1,'reviewer':REVIEWER,'reviewedAtUtc':NOW,'blindToNewNativeA':True,'goals':whole,'wholeCaseCount':4,'unchangedWholeP2Bodies':True,'newStrictClosures':0})
(OUT/'P2-actual-independent-b-candidate.records.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in ownprofiles))

visual=[]
for n,i in enumerate(IDS):
    original=AUTHOR/'selected-images'/(i+('.png' if n==0 else '.jpg'))
    from PIL import Image
    im=Image.open(original)
    visual.append({'goalId':i,'decision':'accepted_pilot_after_regeneration' if n==0 else 'accepted_pilot','continuityDecision':'KEEP_PNG6_V2' if n==0 else 'KEEP_EXACT_ORIGINAL_JPEG8','actualAsset':receipt(original),'width':im.width,'height':im.height,'mode':im.mode,'originalAnd360And680ActuallyViewed':True,'actualPhysicalPdfPageViewed':n+3,'representation':'Qualitative Energieprofile, Zeitpfeile und deutlich abstrakte Phasenpiktogramme; keine atomistische Molekülstrukturbehauptung.' if n==0 else 'Elektrisches Schalt-/Teilchenmodell und qualitative Vergleichspfeile für materialabhängige Spannung; Spezieslabels sind explizit, keine Strukturformel behauptet.','concreteEvidence':'Ea und Ea-prime reichen jeweils vom Reaktantenniveau zum Pfadmaximum. Grün hat eine kleinere Barriere und eigenen alternativen Weg; die irreführende orange Überlagerung ist tatsächlich fort. Beide sichtbaren Gleichgewichtsgemische enthalten dieselben sieben blauen/fünf roten Teilchen. Zeitpfeile sind vom Reaktionsverlaufsdiagramm getrennt. Lösung und feste Oberfläche unterscheiden die zwei Phasenfälle.' if n==0 else 'Minuspol liegt tatsächlich an der als Reduktion bezeichneten Kathode, Pluspol an der oxidierenden Anode. 2H+ +2e-→H2 und 2Cl-→Cl2+2e- sind formal ladungs-/stoffbilanziert. Die Cl/O2-Bevorzugung nennt dieses Anodenmaterial und ist damit bedingt. Die hohe O2-Überspannung steht ausdrücklich neben den qualitativen Vergleichspfeilen; keine falsche Standardpotenzialungleichung wird behauptet.','legibility':'Bei 360 sind Hauptgegensatz, Farben, Pfade, Mischungen und Panelüberschriften erkennbar; kleine Beispiel-/Gleichgewichtszustandslabels sind knapp. 680 und die tatsächlich gerenderte PDF-Seite tragen die Detailbeschriftungen. Keine wichtige Größe ist abgeschnitten.' if n==0 else 'Bei 360 sind Polung, Elektroden, Gasprodukte und die kürzere/längere Spannung erkennbar; der lange Erklärsatz und die vertikalen Halbgleichungen brauchen größere Darstellung. Bei 680 und im tatsächlichen PDF sind diese Details lesbar. Der konkrete Alttext trägt den Zusammenhang ohne kleine Bildschrift.','modelLimits':'Piktogrammzahl ist eine schematische Gleichgewichtsillustration, keine aus einem realen Stoffsystem berechnete Ausbeute. Beide Richtungsvorgänge und K-Konstanz werden im unveränderten vollständigen P2-Vertrag erklärt.' if n==0 else 'Die H+-Halbgleichung ist die saure formale Schreibweise; sie ist keine vollständige Bilanz einer neutralen/alkalischen Chloralkali-Elektrolyse. Für den neutral-/alkalischen Autorenfall wird ausdrücklich 2H2O+2e-→H2+2OH- verwendet. Spannungspfeile sind qualitativ; IR-Verluste und konkrete Betriebsbedingungen müssen bei Rechnungen wie im P2-Fall zusätzlich berücksichtigt werden. Das Bild begründet keine universelle Cl2-Auswahl.','perspective':'Keine Handhabungsperspektive oder reale Versuchsausführung abgebildet; Energieachsen, Becher-/Oberflächenperspektive plausibel.' if n==0 else 'Voltmeter parallel zu den beiden Elektroden, Polverbindungen und Ionrichtungen plausibel; keine Personperspektive oder Versuchsanleitung.','linkMetadata':next(l for l in cg[i]['resourceLinks'] if l.get('type')=='goal-visualization'),'providerVersionInference':False,'historicalProviderAndHashBoundReviewPreserved':n==1,'grossScientificBlockerFound':False,'humanApproval':False,'humanTrial':False,'activeIntegration':False})
put('V2-actual-raster-and-native-PDF.independent-b.first-verdict.json',{'schemaVersion':1,'reviewer':REVIEWER,'reviewedAtUtc':NOW,'blindToNewNativeA':True,'goals':visual,'originalAssetsChanged':False,'newStrictClosures':0})
put('native-full378-and-required-boundaries.mechanical-checks.json',{'schemaVersion':1,'checks':checks,'allPassed':all(c['pass'] for c in checks),'pageContextClaim':'Complete before/current378 models compared every whole page object; only selected2 actual PDF pages visually reviewed. No visual approval of other376 pages is claimed.','sourceContextClaim':'49 whole original duties, all259 exact partner rows and57 unique whole partner semantic bodies read. 36 physical primary-text page bindings plus4 whole BY portable originals retained; all relevant original duty/table sections read. BY four Sachkompetenz occurrences and complete BY13EA LB5 distinguish course/stage/operator; no whole-source-union approval.','newNativeAResultsRead':False,'activeWrites':0,'newStrictClosures':0})
print('Created genuine independent B records, checks:',len(checks),'failures:',[c['check'] for c in checks if not c['pass']])
