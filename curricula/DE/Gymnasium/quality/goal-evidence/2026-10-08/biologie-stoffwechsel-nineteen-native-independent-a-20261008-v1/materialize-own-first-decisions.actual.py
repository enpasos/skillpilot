import json,pathlib,hashlib,datetime
q=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'); n=q/'biologie-stoffwechsel-nineteen-native-technical-20261008-v1'; d=q/'biologie-stoffwechsel-nineteen-native-independent-a-20261008-v1'; p=q/'biologie-stoffwechsel-resume-author-20261008-v1'
load=lambda x:json.loads(pathlib.Path(x).read_text()); now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat();sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def rec(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def check(r):
 b=pathlib.Path(r['path']).read_bytes();assert sha(b)==r['sha256'] and len(b)==r['bytes'],r['path']
def write(path,j):
 assert not path.exists(),path;path.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return path
f=load(d/'first-native-input.freeze.json');[check(r) for r in f['requiredFiles']]
i=load(n/'native-nineteen/round-a/description-review-input.json');c=load(n/'native-nineteen/round-a/description-review-campaign.json');b=load(n/'native-nineteen/bundle/review-bundle-manifest.json');batch=c['batches'][0];runid='biologie-native19-independent-a-actual-20261008-v1';started=f['createdAtUtc']
# My own content-specific six-field first decisions, after actual whole-input and PDF-page reading.
# The author profiles are retained below, but the following D expectations are my own wording.
chains={
'de1c19a2-2f8a-57bf-bd58-ecc460f47987':[
'Zeitliche Anreicherung im Organismus und Konzentrationszunahme entlang einer Nahrungskette sind verschiedene Vorgänge; Belastung beweist noch keinen funktionellen Schaden.',
'Accumulation within an organism over time differs from increasing concentration along a food chain; exposure alone does not establish functional damage.',
'Ordne vergleichbare Zeit- und Trophiedaten dem jeweiligen Vorgang zu und begründe, welche Schadstoffwirkung daraus tatsächlich folgt.',
'Assign comparable time and trophic data to the relevant process and justify which pollutant effects actually follow.',
'Prüfe eine neue Reihe mit rascher Stoffabgabe oder verschiedenen Gewebe-/Altersbezügen und begrenze eine behauptete Biomagnifikation.',
'Evaluate a new series with rapid elimination or different tissue and age references and limit an asserted biomagnification.'],
'691b0711-4427-5b39-b2ef-20f607d15c13':[
'Ein Zufallsmodell erzeugt eine Verteilung möglicher Populationsverläufe; erwartete Besetzung und einzelner Lauf sind nicht gleich.',
'A stochastic model generates a distribution of possible population trajectories; expected occupancy differs from an individual run.',
'Berechne erwartete Kolonisation und Erlöschen unter den angegebenen unabhängigen Übergängen und interpretiere mehrere unabhängig erzeugte Läufe.',
'Calculate expected colonization and extinction under the stated independent transitions and interpret multiple independently generated runs.',
'Beurteile einen neuen Korridorfall mit Krankheitstransport oder wiederverwendetem Zufalls-Seed, ohne Streuung mit widerlegter Erwartung zu verwechseln.',
'Assess a new corridor case with pathogen transport or a reused random seed without confusing variation with a disproved expectation.'],
'6020a221-ad96-50dc-9b99-b0bf6815366f':[
'Zwei Lichtanregungen erhöhen Elektronenenergie; linearer Transport liefert NADPH und Wasserspaltung, während ein geschlossener PSI-Zyklus zusätzlichen Protonengradienten ohne Netto-NADPH oder O₂ bildet.',
'Two light excitations raise electron energy; linear transport supplies NADPH and involves water splitting, whereas a closed PSI cycle adds proton motive force without net NADPH or O₂ production.',
'Konstruiere ein energetisches Schema und begründe Lichtenergie, Zwischenenergietransfer und ATP-Kopplung im linearen und zyklischen Weg.',
'Construct an energy scheme and justify light input, intermediate energy transfer and ATP coupling in the linear and cyclic pathways.',
'Prüfe ein neues Kreislaufschema mit dauerndem Elektronenabfluss oder einem Anregungssprung ohne Licht und benenne den fehlenden Energiebzw Elektronennachschub.',
'Evaluate a new cycle diagram with continuous electron outflow or an excitation jump without light and identify the missing energy or electron supply.'],
'de5ba3a5-7c5f-5ee3-89d3-c97a0d4eeaf0':[
'Die C4-Vorfixierung und CO₂-Freisetzung an Rubisco koppeln Mesophyll und Bündelscheide; der Konzentrationsvorteil benötigt zusätzlich Energie.',
'C4 pre-fixation and CO₂ release near Rubisco couple mesophyll and bundle sheath; the concentration advantage costs additional energy.',
'Erläutere Transport, räumliche Arbeitsteilung und PEP-Regeneration und begründe unterschiedliche C3/C4-Rangfolgen bei Wärme bzw Lichtmangel.',
'Explain transport, spatial division of labor and PEP regeneration and justify different C3/C4 rankings under heat versus low light.',
'Unterscheide den räumlichen C4-Weg vom bereitgestellten zeitlich getrennten CAM-Fall oder prüfe einen geänderten CO₂-Angebotsfall.',
'Distinguish the spatial C4 pathway from the supplied temporally separated CAM case or assess changed CO₂ availability.'],
'ce6550f0-4ec3-5dd9-ab02-0296da98a371':[
'Ein Kohlenstofftracer verfolgt Stoffweitergabe; frühe und spätere Labelverteilung mit gestoppter Reaktion begrenzen die Rekonstruktion des Calvin-Zyklus.',
'A carbon tracer follows material transfer; early and later label distributions after quenching bound reconstruction of the Calvin cycle.',
'Beschreibe Puls, Probenzeiten, Trennung und Isotopnachweis und unterscheide beobachtete Verteilung von daraus erschlossener Wegfolge.',
'Describe the pulse, sampling times, separation and isotope detection and distinguish observed distribution from the inferred pathway sequence.',
'Erkläre einen neuen Pulse-Chase- oder Poolgrößenfall und begründe, warum schwaches Label allein einen Zwischenstoff nicht aus dem Weg ausschließt.',
'Explain a new pulse-chase or pool-size case and justify why weak labeling alone does not exclude an intermediate from the pathway.'],
'462de7c8-b5fb-52f0-82db-63eb019fad29':[
'Begünstigter Elektronentransfer zu O₂ speichert freie Energie im elektrochemischen Protonengradienten; Protonenrückfluss koppelt an ATP-Synthese.',
'Favorable electron transfer to O₂ stores free energy in an electrochemical proton gradient; proton return couples to ATP synthesis.',
'Modelliere gerichteten Elektronen- und Protonentransfer und erkläre, warum Sauerstoffverbrauch und ATP-Ausbeute unterschiedliche Größen sind.',
'Model directed electron and proton transfer and explain why oxygen consumption and ATP yield are different quantities.',
'Vergleiche einen neuen Protonenleckfall mit vollständiger Blockade des terminalen Elektronentransports und leite unterschiedliche ATP/O₂-Muster ab.',
'Compare a new proton-leak case with complete blockade of terminal electron transfer and derive different ATP and O₂ patterns.'],
'280bab15-94e8-59fb-9359-c1c0f8384b2a':[
'Ein kontrollierter Gärvergleich trennt unabhängige Bedingung, CO₂-Rate und alternative Atmung; O₂-Kontrolle und Ethanolnachweis ergänzen das Signal.',
'A controlled fermentation comparison separates the independent condition, CO₂ rate and alternative respiration; O₂ controls and ethanol detection supplement the signal.',
'Erzeuge Hypothese und Vergleichsplan mit Nullkontrollen und Replikaten und werte den gegebenen synthetischen Datensatz unter seinen Grenzen aus.',
'Produce a hypothesis and comparison plan with negative controls and replicates and analyze the supplied synthetic dataset within its limits.',
'Beurteile einen neuen Fall mit zugleich geänderter Temperatur/Zuckermenge oder ungleicher Zellzahl und korrigiere die kausale Zuordnung.',
'Assess a new case changing both temperature and sugar or using unequal cell counts and correct the causal attribution.'],
'97d409c8-b3bc-5c7c-8619-2c5592d2a796':[
'Rubisco-Oxygenierung konkurriert mit Carboxylierung; die photorespiratorische Rückgewinnung entfernt problematische Produkte, kostet Energie und verliert teilweise Kohlenstoff.',
'Rubisco oxygenation competes with carboxylation; photorespiratory salvage removes problematic products, costs energy and loses some carbon.',
'Erkläre CO₂/O₂-Angebot, Oxygenierungsprodukt und Rückgewinnungsfunktion und unterscheide Photorespiration von mitochondrialer Zellatmung.',
'Explain CO₂/O₂ availability, the oxygenation product and salvage function and distinguish photorespiration from mitochondrial respiration.',
'Prüfe ein neues Salvage-Blockademodell bei weiterlaufender Oxygenierung und begründe, warum der Verlust dadurch nicht automatisch verschwindet.',
'Evaluate a new salvage-blockade model with continuing oxygenation and justify why carbon loss does not automatically disappear.'],
'9f074006-74e8-5f09-884d-038bd9b4f0ec':[
'CO₂-Angebot, ATP/NADPH-Versorgung und regulierter Enzymzustand beeinflussen Calvin-Fluss getrennt; Nettogasaustausch ist kein isoliertes Maß der Fixierung.',
'CO₂ availability, ATP/NADPH supply and regulated enzyme state affect Calvin flux separately; net gas exchange does not isolate fixation.',
'Analysiere einen gegebenen Licht-/Redox- oder Temperaturfall durch getrennte Energie-, Enzym- und Substratbedingungen.',
'Analyze a supplied light/redox or temperature case using separate energy, enzyme and substrate conditions.',
'Prüfe neue ATP/NADPH-Zugabe bei inaktivem Enzym oder erhöhte Atmung bei gleicher Bruttofixierung, ohne den Calvin-Fluss falsch zu folgern.',
'Evaluate added ATP/NADPH with an inactive enzyme or increased respiration at unchanged gross fixation without inferring Calvin flux incorrectly.'],
'3cb5f199-3c9a-5f01-a4ba-373bdef0112e':[
'Gemeinsame Zwischenprodukte verbinden Stoffwechselzweige; gerichtete Stoffflüsse und regulatorische Rückkopplung sind verschiedene Kanten.',
'Common intermediates connect metabolic branches; directed material flows and regulatory feedback are different edges.',
'Konstruiere ein Netz mit Acetyl-CoA-Verzweigung oder vorgegebenen Modellstoffen und begründe den regulierten Enzymschritt.',
'Construct a network with an acetyl-CoA branch or supplied model substances and justify the regulated enzyme step.',
'Leite für einen neu blockierten Zweig oder entfernten Hemmstoff die bedingte Umverteilung ab, ohne ohne Kapazitätsdaten einen exakten Ersatzfluss zu behaupten.',
'Derive conditional redistribution for a newly blocked branch or removed inhibitor without claiming exact replacement flux in the absence of capacity data.'],
'b56a5408-ed84-57f2-a9dd-d1a67496fdd1':[
'Fortpflanzungsisolation, diagnostische Körpermerkmale und Abstammungslinien sind verschiedene Artkriterien mit unterschiedlichen Daten- und Anwendungsgrenzen.',
'Reproductive isolation, diagnostic body traits and evolutionary lineages are distinct species criteria with different data and application limits.',
'Ordne die gleichen vorgegebenen Gruppen nach allen drei Konzepten begründet ein und erläutere Konflikte und fehlende Daten.',
'Classify the same supplied groups under all three concepts with reasons and explain conflicts and missing data.',
'Beurteile einen neuen asexuellen, fossilen oder hybriden Fall und passe das zulässige Kriterium an, statt morphologische Gleichheit mit Genfluss gleichzusetzen.',
'Assess a new asexual, fossil or hybrid case and adapt the applicable criterion rather than equating morphological similarity with gene flow.'],
'eccf935c-48e3-53dd-b472-5e794241279b':[
'Relative Fitness wird auf den reproduktiven Beitrag einer Referenz normiert; s=1−w quantifiziert den relativen Nachteil im angegebenen Umweltkontext.',
'Relative fitness is normalized to a reference reproductive contribution; s=1−w quantifies disadvantage in the stated environmental context.',
'Interpretiere Merkmalsklassen und berechne relative Beiträge und Selektionskoeffizienten; kombiniere Überleben und Nachwuchs, wenn das Modell dies definiert.',
'Interpret trait classes and calculate relative contributions and selection coefficients; combine survival and offspring when the model defines this.',
'Analysiere eine neue Umwelt oder bloße Eizahlen und begründe, warum die bisher günstigste Klasse bzw eine Überlebenskurve nicht automatisch Gesamtfitness festlegt.',
'Analyze a new environment or egg counts alone and justify why the previously favored class or a survival curve does not automatically establish overall fitness.'],
'71b21aef-796b-5506-a593-8d96b3d4b636':[
'Hormonähnliche Umweltstoffe können Rezeptorsignale aktivieren oder blockieren; Wirkung hängt von Aufnahme, Zeitpunkt und biologischem Kontext ab.',
'Hormone-like environmental substances can activate or block receptor signals; effects depend on uptake, timing and biological context.',
'Beschreibe die kontrollierte Rezeptorantwort oder Entwicklungsphasenwirkung und trenne sie von unbewiesener Gewässerexposition und Populationseffekt.',
'Describe the controlled receptor response or developmental-stage effect and separate it from unproven environmental exposure and population effects.',
'Erkläre einen neuen antagonistischen oder spät beobachteten Fall und begründe, warum Bindung ohne Aktivierung bzw ein unauffälliges Kurzzeitsignal keine Wirkungslosigkeit beweist.',
'Explain a new antagonistic or delayed-effect case and justify why binding without activation or an unchanged short-term signal does not prove absence of effects.'],
'7749de90-68f4-53a6-b474-b6414f16f09e':[
'Habitat- und Bedrohungsursachen bestimmen tragfähige Wiederansiedlung; Besatzzahl allein ist kein Nachweis selbsttragender Population oder restaurierter Funktion.',
'Habitat conditions and causes of threat determine viable reintroduction; release counts alone do not establish a self-sustaining population or restored function.',
'Plane gestufte Habitatverbesserung und Wiederansiedlung mit Herkunft, Risiken, Nutzungskonflikten und prüfbaren Monitoringkriterien.',
'Plan staged habitat improvement and reintroduction with origin, risks, land-use conflicts and testable monitoring criteria.',
'Beurteile einen neuen Fortpflanzungsengpass oder eingeschleppten Erreger und passe den Plan an die geänderte Ursache an.',
'Assess a new reproductive bottleneck or introduced pathogen and adapt the plan to the changed cause.'],
'4ef85d98-5e20-540b-9adf-89592febc438':[
'Lokale Geburt-/Todbilanz unterscheidet Quelle und Senke; Migration kann eine Senke erhalten und freie geeignete Flächen kolonisieren.',
'Local birth/death balance distinguishes sources from sinks; migration can maintain a sink and colonize suitable empty patches.',
'Modelliere lokale Bilanz und gerichteten Austausch und leite die Folgen einer Verbindung oder Trennung anhand der angegebenen Raten ab.',
'Model local balance and directed exchange and derive the consequences of connection or separation from the stated rates.',
'Prüfe ein neues Netz ohne produktive Quelle oder eine vorübergehend größere Senke und trenne Bestandszahl von lokalem Reproduktionsüberschuss.',
'Evaluate a new network without a productive source or a temporarily larger sink and distinguish abundance from local reproductive surplus.'],
'f36a52b8-acd7-5a3d-83e2-0af74acc9c96':[
'Abrupter Zustandswechsel und unterschiedliche Hin-/Rückschwellen zeigen im Modell Hysterese; die aktuelle Last allein bestimmt den Zustand dann nicht.',
'Abrupt state change and different forward/reverse thresholds indicate hysteresis in the model; current loading alone then does not determine state.',
'Interpretiere das Zwei-Zustands-Modell und begründe eine Managementbedingung aus der Rückkehrschwelle bzw gekoppelter Rückkopplung.',
'Interpret the two-state model and justify a management condition from the recovery threshold or coupled feedback.',
'Prüfe zwei neue reale Messpunkte oder Wiederbepflanzung nach Bodenverlust und benenne fehlenden Mechanismusnachweis bzw weitere notwendige Maßnahmen.',
'Evaluate two new real measurements or replanting after soil loss and identify missing mechanism evidence or further necessary measures.'],
'e3c7cd8b-8c6c-5c4b-8c7f-e0d1a6284f94':[
'Ein Datenmodell liefert bedingte Vorhersagen; Residuen prüfen Abweichungen, und guter Fit ersetzt weder unabhängige Validierung noch kausale Erklärung.',
'A data model yields conditional predictions; residuals test deviations, and a good fit replaces neither independent validation nor causal explanation.',
'Wende das angegebene Modell an, berechne Beobachtung minus Vorhersage und prüfe Einheiten, Datenvorbereitung und Gültigkeitsbereich.',
'Apply the supplied model, calculate observed minus predicted values and check units, data preparation and validity range.',
'Beurteile neue Extrapolation außerhalb des Bereichs oder einen durch Flächengröße konfundierten Datensatz und begrenze die biologische Interpretation.',
'Assess extrapolation beyond the domain or a dataset confounded by sampling area and limit the biological interpretation.'],
'64a31f9a-27b2-5321-b2a8-47188d001c6b':[
'Szenarien sind bedingte Zukunftsbilder; ökologische Wirkung, Kosten, Risiko und Gewichtung bilden getrennte Entscheidungskriterien.',
'Scenarios are conditional futures; ecological effects, costs, risk and weighting are separate decision criteria.',
'Vergleiche Managementoptionen unter transparenten Szenarioprämissen, berechne passende Kennwerte und begründe einen bedingten Entscheid.',
'Compare management options under transparent scenario premises, calculate suitable indicators and justify a conditional decision.',
'Prüfe geänderte Szenariogewichte oder eine Art, die einen Korridor nicht nutzen kann, und passe Empfehlung und Monitoring an.',
'Evaluate changed scenario weights or a species unable to use a corridor and adapt the recommendation and monitoring.'],
'b7b84b6a-1c99-5474-99c5-9a72a1cd505b':[
'Resistenz gegen unmittelbaren Funktionsverlust und Rückkehr nach einer Störung sind unterschiedliche Resilienzkomponenten; Maß und Zeitraum entscheiden den Vergleich.',
'Resistance to immediate functional loss and recovery after disturbance are different resilience components; the indicator and time horizon determine the comparison.',
'Vergleiche beide Funktionsverläufe nach gleicher Störung und leite bedingte Ziele für Ressourcen, Bedrohungsabbau und überprüfbare Erholung ab.',
'Compare both functional trajectories after the same disturbance and derive conditional goals for resources, threat reduction and testable recovery.',
'Beurteile wiederhergestellte Artenzahl ohne ursprüngliche Funktion oder mehrere gleich reagierende Arten und unterscheide funktionelle Erholung von bloßer Vielfalt.',
'Assess restored species counts without the original function or multiple identically responding species and distinguish functional recovery from diversity alone.']}
scopes=load(n/'actual-paired-nineteen-source-role-convergence.technical.json');sm={x['goalId']:x for x in scopes['pairedBoundedSourceRoles']};authorP=[json.loads(x) for x in (n/'positive/P19.current-raster.author.review.jsonl').read_text().splitlines()];pm={x['goalId']:x for x in authorP};ps=load(p/'P19.exact-retained-v5.author.candidates.json');sourceProfiles={x['goalId']:x['profile'] for x in ps['goals']};rasters={x['goalId']:x for x in load(n/'neutral-current-nineteen-native.technical.entry.json')['rasterBindings']};pageReceipt=load(d/'actual-pdf-pages.rendering.receipt.json');[check(rec(x['path'])) for x in pageReceipt['pages']]
(d/'results').mkdir(exist_ok=True);records=[];positive=[];bindings=[]
for index,g in enumerate(i['goals']):
 gid=g['goalId'];ch=chains[gid];pg=g['reviewContext']['page'];assert pm[gid]['profile']==sourceProfiles[gid];r=rasters[gid];check(r);assert pg['visualization']['originalDigest']==r['sha256'];assert pg['visualization']['url']==r['url']
 wholeScopes=sm[gid]['retainedBoundaryB']
 specific={
 'ce6550f0-4ec3-5dd9-ab02-0296da98a371':' Beschreiben des experimentellen Aufklärungswegs bleibt der Operator; keine Durchführung oder Behauptung eines universell besten Verfahrens. Der englische Satz wird in genau dieser Experimentaufklärungsbedeutung gelesen.',
 'e3c7cd8b-8c6c-5c4b-8c7f-e0d1a6284f94':' Die tatsächliche generische Bildkurve ist nicht die konkrete lineare Fallfunktion; numerische Vorhersagen und Residuen stammen allein aus dem Fallmaterial.',
 'b7b84b6a-1c99-5474-99c5-9a72a1cd505b':' Die Grafik vergleicht sichtbaren Rücklauf und vollständige Rückkehr im dargestellten Zeitraum; eine numerische normierte Erholungsrate wird nicht aus unskalierten Achsen abgelesen.',
 '280bab15-94e8-59fb-9359-c1c0f8384b2a':' Ganze praktische Durchführung und eigene Beobachtung bleiben Quellen-HOLD; die neue Seite zeigt nur Vergleichsplanung, kein ausgeführtes Labor.'
 }.get(gid,'')
 rationale=f'Eigene tatsächliche Prüfung der physischen PDF-Seite{index+3} mit Bild, vollständigem Zielkontext und beiden ganzen DE/EN-Fällen: kurzer Zieltext bleibt kompetenzgleich und trägt die konkrete Verständnis-/Leistungs-/Transferkette. Kein lokaler Widerspruch durch den neuen Raster-/Seitenkontext; die vollständige P-v5-Struktur wird unverändert an die aktuellen Ressourcen gebunden. Quellenbeitrag bleibt begrenzt: {wholeScopes}'+specific
 records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'{runid}.{index+1:02d}','runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],**{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},'decision':'keep','understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],ch)),'rationale':rationale,'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
 pr=json.loads(json.dumps(pm[gid]));pr.update({'reviewId':'biologie-stoffwechsel-nineteen-native-independent-a-20261008-v1','reviewedAt':now(),'reviewer':'Codex /root/curricula_live_diagnosis; independent actual native D/P reviewer A','reason':rationale,'reviewRunIds':[],'dissent':['Own machine E1/G1 candidate review of exact native page/PNG/context; needs_human_review, no human approval or trial.','Whole unchanged v5 profile and both full v4 bilingual cases were actually read; two authored witnesses are no runtime task quota.',wholeScopes,'Original regional/operator/source duties and five excluded holds remain; no whole-source union approval.']});positive.append(pr)
 bindings.append({'goalId':gid,'physicalPage':index+3,'actualPdfPagePreview':pageReceipt['pages'][index+2],'actualPdfPageObserved':True,'wholeProfileRead':True,'wholeCaseIdsRead':[x['id'] for x in pr['profile']['applicationCaseBriefs']],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'positiveReviewInputFingerprint':pr['reviewInputFingerprint'],'profileFingerprint':pr['profileFingerprint'],'actualRaster':r,'currentAltText':pg['visualization']['altText'],'ownPositiveProfileDecision':'RETAIN_COMPLETE_CURRENT_PROFILE_WITH_ACTUAL_CURRENT_RASTER_BINDING','sourceBoundaryRetained':wholeScopes,'nativeBlockingFindings':[]})
assert len(records)==len(positive)==19
rp=d/'results'/f"{batch['batchId']}.records.jsonl";assert not rp.exists();rp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records))
parameters={'sessionRole':'independent reviewer A','task':'/root/curricula_live_diagnosis','reviewMode':'actual whole inputs and actual PDF page reading, no provider API call','temperature':'not exposed','peerNativeDPRead':False}
write(d/'actual-review-parameters.json',parameters)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI Codex interactive agent','model':'GPT-6 agent; exact serving model variant not exposed','role':'didactic_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':rec(d/'actual-review-parameters.json')['sha256'],'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in b['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':started,'completedAt':now(),'status':'completed','outputDigest':rec(rp)['sha256'],'toolchainVersion':'goal-description-review-v1'}
write(d/'results'/f"{batch['batchId']}.run.json",run)
pp=d/'P19.current-native.independent-a.review.jsonl';assert not pp.exists();pp.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in positive))
write(d/'native-nineteen.independent-a.actual-reading-and-bindings.json',{'schemaVersion':1,'reviewerTask':'/root/curricula_live_diagnosis','firstInputFreeze':rec(d/'first-native-input.freeze.json'),'nativeEntry':rec(n/'neutral-current-nineteen-native.technical.entry.json'),'actualPdf':rec(n/'native-nineteen/bundle/book.pdf'),'actualPDFPagesSeen':21,'wholeCurrentGoalsRead':19,'wholeProfilesV5Read':19,'wholeDEENCasesV4Read':38,'ownWholeInputReadingFor17ContinuedFromSameReviewerEarlierVBlocks':True,'remaining15And20WholeProfileCaseReadingCompletedHere':True,'validSourceScienceAMReusedWithoutInventingNewOutcome':True,'originalSourceDutiesStillPartial':True,'wholeSourceUnionApproved':False,'excludedFiveHoldsRetained':True,'peerNativeDPReadBeforeFirstSeal':False,'resultsDirectory':str(d/'results'),'positiveReviewPath':str(pp),'rows':bindings,'summary':{'Dkeep':19,'Drevise':0,'Dblock':0,'completeProfilesRetained':19,'nativeBlockingFindings':0,'activeWrites':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False}})
print(json.dumps({'Drecords':rec(rp),'positiveRecords':rec(pp),'summary':{'keep':19,'Pcomplete':19,'blocking':0}},ensure_ascii=False))
