#!/usr/bin/env python3
"""Inactive source-author continuation: exact reuse plus two synthetic source witnesses."""
import pathlib, json, hashlib
from datetime import datetime, timezone

OWN=pathlib.Path(__file__).resolve().parent
ROOT=OWN.parents[6]
Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
OLD=Q/'chemie-b014-b477-nine-source-role-continuation-author-v2'
V3=Q/'chemie-b014-b477-colorless-reference-targeted-author-root-v3'
B=Q/'chemie-b014-b477-nine-source-role-whole-four-case-independent-b-20261008-v3'
stamp=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def bind(p):return {'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(name,obj):
 p=OWN/name;assert not p.exists(),name
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

assert not (OWN/'four-ion-intentions-whole-source-author-v4.first.freeze.json').exists()
canonpath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert sha(canonpath)=='f86209b8f750c0b576b63f34d19fb91458f2a35d6e183a8429a023e1dec53a84'
canon=read(canonpath);by={g['id']:g for g in canon['goals']}
ids=['a44af1fa-5988-5b7d-b206-691c6bbf7dd4','41396457-d97b-55f3-9804-2af1bb188e79','580b3616-f121-5d82-ac6b-fc24f145fbdc','9deeac6f-d380-52c5-8fc9-e532ab1f4d3f','1c1420c2-a8e2-520f-8015-6df637a973bd','d2ccd1d5-56f7-583f-9724-e97441367f91','fd309753-4d48-5570-a4ec-09dfeb20ff9c']
centralpath=Q/'biologie-he9-seventeen-reviewed-active-integration-root-v1/active-after-he17-central.actual.json'
central=read(centralpath);chem=next(s for s in central['subjects'] if s['subject']=='chemie')
assert chem['strictComplete']==173 and chem['denominator']==378 and central['blockingIssueCount']==0
assert all(x in chem['strictCompleteGoalIds'] for x in ids if x!='9deeac6f-d380-52c5-8fc9-e532ab1f4d3f')
assert '9deeac6f-d380-52c5-8fc9-e532ab1f4d3f' not in chem['strictCompleteGoalIds']
assert not {'DE-BB','DE-BE'} & set(by[ids[3]]['applicability']['jurisdiction'])
regpath=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
reg=read(regpath);subject=next(s for s in reg['subjects'] if s['subject']=='chemie')
inputs=[bind(canonpath),bind(centralpath),bind(centralpath.with_name('active-after-he17-central.exit.actual.json')),bind(regpath),bind(ROOT/'AGENTS.md')]
retained=[]
for cfgname in subject['positiveEvidenceConfigPaths']:
 cfgpath=ROOT/cfgname;cfg=read(cfgpath)
 selected=set(ids[:3]) & set(cfg['scope']['goalIds'])
 if not selected:continue
 ledgerpath=ROOT/cfg['reviewPath'];rows=[json.loads(x) for x in ledgerpath.read_text().splitlines() if x.strip()]
 inputs.extend([bind(cfgpath),bind(ledgerpath),bind(ROOT/cfg['semanticKindLedgerPath']),bind(ROOT/cfg['reviewCriteriaPath'])])
 for row in rows:
  if row['goalId'] in selected:
   retained.append({'goalId':row['goalId'],'configBinding':bind(cfgpath),'reviewBinding':bind(ledgerpath),'wholeRecordDigest':digest(row),'wholeRecord':row,'wholeCurrentGoal':by[row['goalId']],
    'existingStrictCurrent':True,'scientificReReview':False,'newWholeGoalApproval':False,'newProfileOrStatus':False})
assert len(retained)==3
wholepath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-four-final-images-native-d17-plus-c441-p18-technical-author-20261007-v1/native-root/candidate/complete34-bilingual-material-cases.v3.exact.json'
inputs.append(bind(wholepath))
whole=[c for c in read(wholepath)['cases'] if c['goalId'] in [ids[0],ids[2]]]
assert len(whole)==4
for c in whole:
 r=next(x['wholeRecord'] for x in retained if x['goalId']==c['goalId'])
 brief=next(x for x in r['profile']['applicationCaseBriefs'] if x['id']==c['caseId'])
 for lang,suffix in [('de','De'),('en','En')]:
  assert brief['taskDemand'+suffix]==c['material'][lang]+' '+c['taskDemand'][lang]
  assert brief['expectedPerformance'+suffix]==c['expectedPerformance'][lang]
write('whole-current-seven-goal-read-contexts.exact.json',{'role':'Whole current DE/EN bodies read for exact source-component reuse; no active body changes','canonicalBinding':bind(canonpath),'goals':[by[x]for x in ids]})
write('retained-three-current-strict-P-records.exact.json',{'role':'Exact retained current whole profiles; no fresh review of valid historical cases','records':retained})
write('retained-four-whole-a44-and-580-DEEN-cases.exact.json',{'role':'Unchanged complete original materials/tasks/models and limits; partial witness use only','originalWholeCaseFile':bind(wholepath),'cases':whole})
roles=read(OLD/'nine-current-whole-original-source-duties-and-partners.json')['entries']
bbbe=[x for x in roles if x['jurisdiction'] in ['DE-BB','DE-BE']]
assert len(bbbe)==2
write('two-whole-BBBE-original-source-goals-decisions-and-edges.exact.json',{'role':'Exact original duties and mapping tuple retained for new limited author continuation','rows':bbbe})
inputs.extend([bind(OLD/'nine-current-whole-original-source-duties-and-partners.json'),bind(OLD/'six-limited-operative-source-role-deltas.inactive.json'),bind(V3/'four-current-whole-source-cases.with-targeted-colorless-reference.author-v3.json'),bind(V3/'whole-nine-source-role-current-four-case-author-v3.first.freeze.json'),bind(B/'independent-b-original-nine-role-four-case.first-verdict.freeze.json')])
assert sha(B/'independent-b-original-nine-role-four-case.first-verdict.freeze.json')=='7b830bd5b0024d2048728c10c01440c3cffd2d0097a5c171912289b4f6736cb5'
for r in bbbe:inputs.extend([bind(ROOT/r['mappingPath']),bind(ROOT/r['sourceExtractionPath'])])
for jur in ['BB','BE']:
 inputs.append(bind(ROOT/f'curricula/DE/Gymnasium/input/{jur}/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf'))
for name in ['de-bb-gk.view.json','de-bb-lk.view.json','de-be-gk.view.json','de-be-lk.view.json']:
 inputs.append(bind(ROOT/'curricula/DE/Gymnasium/composition-views/chemie'/name))
source_support=[]
for number,expected in [('523338','f779a867855a7276085efc1b92b36b910306049fde6eb74c82b083a5f0f6d62c'),('523339','08b9bd0a1c466628442b9b63a67f0a15fb05af525545759c53ba4ed8d08635b8')]:
 p=pathlib.Path('/tmp/skillpilot-chem-four-ion-rsc-'+number+'.pdf');assert sha(p)==expected
 source_support.append({'url':'https://edu.rsc.org/download?ac='+number,'actualHTTPStatus':200,'exactDownloadedPdfBinding':bind(p),'actualWholePdfRead':True,'methodSupportOnlyNotGermanCurriculumRequirement':True,'thirdPartyPdfOrExtractedTextCommitted':False})
 inputs.append(bind(p))
write('actual-primary-curricular-and-method-source-boundaries.author.json',{
 'role':'Whole official source read; method support distinguished from regional curricular obligation',
 'wholeRegionalPrimaryPagesRead':{'BB':[26,44,45,46],'BE':[26,44,45,46]},'BBBEWholePdfsByteIdentical':True,
 'printed26QBoundary':'Q-section3.2 lists binding investigations/experiments; school variants preserve their intentions. E-section3.1 page17 recommendation status is not transferred.',
 'printed44to46Whole3_2_6Boundary':'The original content row and Q-stage/course context are retained; six ion-detection intentions are specified on45. The whole topic’s MWG/titration/buffer/aquacomplex/other duties are not approved by this packet.',
 'sourceIntentionExactSpecies':['Cl−','Br−','CO3²−','NH4+'],'previousWaterIonWitnessesRetainedUnchanged':['H3O+','OH−'],
 'externalMethodSupport':source_support,'actualPageFetchDiagnostics':{'article464':'Actual web-tool fetch405; no claimed whole article read','article4018529':'Actual web-tool JS/bot page; no claimed whole article read','download523338and523339':'Both actual HTTP200 PDFs wholly read; original bytes kept in declared /tmp inputs'},
 'ownCaseBoundaries':['Synthetic models, given observations, no learner execution','Carbonate gas assay needs candidate and interference limits; bicarbonate can give the same CO2','Basic gas/blue indicator alone is not an unrestricted ammonium assay; pre-existing ammonia/other basic gases and alkaline mist require controls','No source task quota, new source-ID, new canonical body or broad organic detection duty'],
 'independentReviewStatus':'pending two new eligible reviewers; this author is not their independent B'})

common={'sourceGoalIds':[r['sourceGoalId'] for r in bbbe],'canonicalWitnessCandidateGoalId':ids[0],'status':'inactive_source_witness_author_candidate','reviewAuthority':'ai_candidate','humanReviewStatus':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','actualLearnerOrExperimentEvidence':False,'referenceResponseNature':'Own synthetic model answer, not observed learner work','license':'CC-BY-4.0'}
carbonate={**common,'caseLocalKey':'bbbe-carbonate-acid-gas-controlled-intention-author-v4','intentionSpecies':'CO3²−',
 'material':{
 'de':['Eigener schriftlicher Modellfall bei25°C, keine Durchführung verlangt. Die farblose Salzprobe C ist laut vorgegebener Auswahl entweder reines Na2CO3 oder reines NaCl; Hydrogencarbonate, Sulfite und andere gasbildende Bestandteile sind in dieser Auswahl ausgeschlossen. Getrennte Proben und fachgerecht kontrollierte Beobachtungen sind ausschließlich fiktiv vorgegeben.',
       'Beim dokumentierten Ansäuern von C mit geeigneter verdünnter Säure entsteht ein Gas, das frisches Kalkwasser weiß trübt. Gleich behandelte NaCl- und Reagenz-Leerproben liefern keine entsprechende Gas-/Trübungsreaktion; eine Carbonat-Positivkontrolle und eine CO2-Referenz liefern die erwartete Trübung. Vorgegebenes Modell: Carbonat nimmt insgesamt zwei Protonen auf und bildet CO2 und Wasser; CO2+Ca(OH)2 → CaCO3↓+H2O.'],
 'en':['An original written model case at25°C, with no request to perform an experiment. The colorless salt sample C is stipulated to be either pure Na2CO3 or pure NaCl; hydrogencarbonates, sulfites and other gas-forming constituents are excluded from this candidate set. Separate portions and professionally controlled observations are supplied solely as fictional model data.',
       'The documented acid treatment of C produces a gas that clouds fresh limewater white. NaCl and reagent blanks treated in the same way give no corresponding gas/cloud response; a carbonate positive control and a CO2 reference give the expected cloud. The supplied model states that carbonate accepts two protons overall, yielding CO2 and water; CO2+Ca(OH)2 → CaCO3↓+H2O.']},
 'learnerTask':{'de':'Wähle die passenden getrennten Nachweis- und Kontrollschritte aus den vorgegebenen Befunden, bestimme C innerhalb der erlaubten Auswahl und formuliere die Ionengleichung mit H3O+. Erkläre Protonenübertragung, Gasnachweis und Aussagegrenzen. Eine neue Probe darf nun auch NaHCO3 enthalten: Was lässt derselbe Gas-/Trübungsbefund allein offen?',
                'en':'Select the relevant separate detection and control steps from the supplied observations, identify C within the allowed candidate set and write the net ionic equation with H3O+. Explain proton transfer, gas evidence and inference limits. A fresh sample may now also contain NaHCO3: what remains unresolved by the same gas/cloud response alone?'},
 'modelAnswer':{'de':'In der ausdrücklich binären Reinstoffauswahl ist C Na2CO3. CO3²−+2H3O+ → CO2+3H2O erhält Atome und Ladung. Carbonat ist hier Protonenakzeptor; das freigesetzte CO2 bildet mit Kalkwasser CaCO3, dessen Ausfällung die Trübung erklärt. Erst Gasreaktion, gesonderter Gasnachweis und gültige Leer-/Positivkontrollen stützen diese begrenzte Zuordnung; Bläschen allein bestimmen weder Gasart noch Stoffmenge. Na+ ist ein Zuschauerion und durch diese Befunde nicht selbst nachgewiesen. Im erweiterten frischen Kandidatenset ist auch HCO3−+H3O+ → CO2+2H2O möglich: derselbe CO2-Befund unterscheidet Carbonat nicht von Hydrogencarbonat. Ohne geeignete weitere Differenzierung bleibt diese Ionenentscheidung offen; keine Reinheit, Menge oder vollständige Salzgemischzusammensetzung wird behauptet.',
                'en':'Within the explicit binary pure-substance set C is Na2CO3. CO3²−+2H3O+ → CO2+3H2O conserves atoms and charge. Carbonate accepts protons here; the evolved CO2 forms CaCO3 with limewater, causing the cloud by precipitation. The gas-producing reaction, separate gas evidence and valid blank/positive controls together support this bounded assignment; bubbles alone determine neither gas identity nor amount. Na+ is a spectator and is not itself detected by these observations. In the enlarged fresh candidate set HCO3−+H3O+ → CO2+2H2O is also possible: the same CO2 response does not distinguish carbonate from hydrogencarbonate. That ion decision remains open until appropriately differentiated; no purity, amount or complete salt-mixture composition is claimed.'},
 'transfer':{'de':{'task':'In einer dritten fiktiven Auswertung wird Kalkwasser zunächst trüb, nach sehr viel weiterem CO2 aber wieder klar. Eine Person wertet das Endbild als sicher negativen Carbonatnachweis. Beurteile dies anhand der gegebenen Folgegleichung CaCO3+CO2+H2O → Ca²++2HCO3−.',
                    'expected':'Die dokumentierte anfängliche Trübung bleibt ein positiver CO2-Befund. Die vorgegebene Folgegleichung erklärt die Auflösung bei CO2-Überschuss; das klare Endbild allein widerlegt den früheren Gasbefund nicht. Die Grenze Carbonat gegen Hydrogencarbonat und die fehlende Mengenbestimmung bleiben bestehen.'},
             'en':{'task':'In a third fictional interpretation limewater first clouds, then becomes clear after much more CO2. A person treats the final image as a conclusive negative carbonate test. Assess this using the supplied subsequent equation CaCO3+CO2+H2O → Ca²++2HCO3−.',
                   'expected':'The recorded initial cloud remains positive CO2 evidence. The supplied subsequent equation explains dissolution in excess CO2; a clear final appearance does not erase the earlier gas observation. The carbonate/hydrogencarbonate limit and lack of amount information remain.'}},
 'positiveUnderstandingEdge':{'de':'Originale Carbonat-Nachweisabsicht wird durch Protonenreaktion und gesonderten Gasnachweis begründet, ohne gleiche Gasreaktionen unbeschränkt einem einzigen Ausgangsion zuzuschreiben.','en':'The original carbonate-detection intention is explained by proton reaction and separate gas evidence, without attributing the same gas response exclusively to one starting ion in unrestricted samples.'},
 'materialAndSourceLimits':['Original BB/BE Q intention is on whole page45; actual current a44 body already addresses selected-ion evidence. This new specific source case still needs two independent reviews.','Current580 CO2 cases are retained only as gas-evidence support; this does not add O2/H2 requirements or create a new source role for the complete gas family.','Written model/design interpretation does not certify practical execution; actual school implementation keeps the source practical intention and appropriate teacher supervision.']}
ammonium={**common,'caseLocalKey':'bbbe-ammonium-hydroxide-basic-gas-controlled-intention-author-v4','intentionSpecies':'NH4+',
 'material':{
 'de':['Eigener schriftlicher Modellfall, kein Lernendenversuch. Die farblose Probe N ist nach vorgegebener Auswahl entweder eine wässrige NH4Cl- oder eine NaCl-Lösung. Bereits vorhandenes NH3, flüchtige organische Basen und andere basische Gase sind für diese binäre Auswahl ausgeschlossen. Beobachtungen einer fachgerecht beaufsichtigten Schuluntersuchung sind fiktiv bereitgestellt.',
       'Nach dokumentierter Behandlung einer getrennten Probe mit geeignetem Hydroxidreagenz und kontrollierter Erwärmung erreicht ein Gas ein getrenntes feuchtes rotes Indikatorpapier, das blau wird. Kontakt des Papiers mit der alkalischen Flüssigkeit und Übertragung alkalischer Tröpfchen sind im bereitgestellten Gasversuch kontrolliert ausgeschlossen. Reagenz-/NaCl-Leerproben bleiben ohne diesen Gasbefund; eine NH4+-Positivkontrolle reagiert entsprechend. Die feuchte NH3-Referenz zeigt denselben basischen Indikatorbefund. Vorgegeben: NH3+H2O ⇌ NH4++OH−.'],
 'en':['An original written model, not a learner experiment. The colorless sample N is stipulated to be either aqueous NH4Cl or NaCl. Pre-existing NH3, volatile organic bases and other basic gases are excluded from this binary set. Observations of a professionally supervised school investigation are supplied fictionally.',
       'After documented treatment of a separate portion with an appropriate hydroxide reagent and controlled warming, a gas reaches separate damp red indicator paper and turns it blue. Contact with the alkaline liquid and transfer of alkaline droplets are controlled and excluded in the supplied gas observation. Reagent/NaCl blanks lack this gas response; an NH4+ positive control responds accordingly. The damp NH3 reference gives the same basic indicator response. The supplied model is NH3+H2O ⇌ NH4++OH−.']},
 'learnerTask':{'de':'Wähle die passende Nachweisfolge und die notwendigen Kontrollen im gegebenen Modell, bestimme N innerhalb der Auswahl und formuliere die Reaktion von NH4+ mit OH−. Erkläre die Wirkung am feuchten Papier und unterscheide Ammoniumion, Ammoniakmolekül und basische Flüssigkeit. Warum würde blaues Papier direkt in NaOH-Lösung den NH4+-Nachweis nicht ersetzen?',
                'en':'Choose the relevant detection sequence and necessary controls in the supplied model, identify N within its candidate set and write NH4+ reacting with OH−. Explain the damp-paper response and distinguish an ammonium ion, an ammonia molecule and an alkaline liquid. Why would blue paper placed directly in NaOH solution not replace NH4+ evidence?'},
 'modelAnswer':{'de':'Innerhalb der gegebenen Auswahl stützt der kontrollierte Gasbefund NH4Cl und damit NH4+-Ionen in N. NH4++OH− → NH3+H2O ist atom- und ladungsbilanziert; NH4+ gibt ein Proton ab, OH− nimmt es auf. Das freigesetzte NH3 ist ein neutrales Molekül, kein gasförmiges NH4+-Ion. Im Wasserfilm des feuchten Papiers kann NH3 nach der gegebenen Gleichgewichtsreaktion OH− bilden und den basischen Farbbefund erklären. Das Hydroxidreagenz ist selbst basisch; bloßer direkter Flüssigkeitskontakt oder alkalische Tröpfchen würden Papier auch ohne NH4+ blau färben. Getrennter Gasbefund und passende Leer-/Positivkontrollen verhindern diesen Kurzschluss. Die Nachweise erfassen hier weder die Chlorid-Gegenionen noch die NH4+-Stoffmenge; die Chloridzuordnung folgt nur aus der expliziten Kandidatenauswahl.',
                'en':'Within the supplied set the controlled gas response supports NH4Cl, hence NH4+ ions in N. NH4++OH− → NH3+H2O balances atoms and charge: NH4+ donates a proton and OH− accepts it. Evolved NH3 is a neutral molecule, not a gaseous NH4+ ion. In the damp paper’s water film NH3 can produce OH− through the supplied equilibrium, explaining the basic color. The hydroxide reagent is already alkaline; direct liquid contact or alkaline droplets could turn paper blue without NH4+. Separate gas evidence and suitable blank/positive controls prevent that inference. These observations establish neither chloride counterions nor the amount of NH4+; the chloride assignment follows only from the explicit candidate set.'},
 'transfer':{'de':{'task':'In einer frischen, jetzt uneingeschränkten Probe ist bereits vor der Hydroxidbehandlung ein basischer Gasbefund vorhanden. Nach Behandlung wird das Papier ebenfalls blau. Beweist diese Wiederholung allein anfangs vorhandene NH4+-Ionen? Begründe, ohne eine tatsächliche Durchführung zu behaupten.',
                    'expected':'Nein. Bereits vorhandenes NH3 oder ein anderes störendes basisches Gas kann den Befund tragen; auch im frischen Fall müssen Flüssigkeits-/Tröpfchenübertragung und Reagenzhintergrund geprüft bleiben. Vorher-/Leerbefund und geeignete zusätzliche Differenzierung sind nötig, bevor aus der Gasfarbe spezifisch NH4+ gefolgert wird. Die ursprüngliche binäre Modellzuordnung bleibt gültig, ihr Ausschluss störender Bestandteile darf jedoch nicht auf diese uneingeschränkte Probe übertragen werden.'},
             'en':{'task':'A fresh, now unrestricted sample already gives a basic gas response before hydroxide treatment. The paper is blue after treatment as well. Does repetition alone establish initially present NH4+ ions? Explain without claiming an actual experiment.',
                   'expected':'No. Pre-existing NH3 or another interfering basic gas may account for the response; liquid/droplet transfer and reagent background still need control. Before/blank observations and appropriate further discrimination are needed before gas color specifically implies NH4+. The original binary model assignment remains valid, but its excluded interferences cannot be assumed for this unrestricted sample.'}},
 'positiveUnderstandingEdge':{'de':'Originale Ammonium-Nachweisabsicht wird durch Protonenabgabe und ein kontrolliertes separates Gaszeichen erklärt; zugesetztes OH−, gasförmiges NH3 und ursprünglich zu prüfendes NH4+ werden getrennt.','en':'The original ammonium-detection intention is explained through proton donation and controlled separate gas evidence; added OH−, gaseous NH3 and the initially tested NH4+ are distinguished.'},
 'materialAndSourceLimits':['Actual BB/BE Q page45 provides the named ammonium intention; the current a44 selected-ion body is the proposed source-witness host. No new goal body or extra general duty is authored.','Held9dee protein/ammonium goal has no current BB/BE applicability; its name and other-region cases do not grant an operative BB/BE route here.','No performed laboratory procedure, learner success, quantitative assay or unrestricted gas specificity is claimed. This remains a written source witness; real supervised practical evidence is needed to claim individual practical performance.']}
write('two-new-whole-carbonate-ammonium-DEEN-source-cases.author-v4.json',{'schemaVersion':1,'role':'Two bounded complete source witnesses authored to complement exact retained chloride/bromide evidence; not whole-goal P approval','wholeCaseCount':2,'languageBodies':4,'currentWholeGoalBodiesChanged':0,'wholeCases':[carbonate,ammonium],'independentApprovals':0,'humanApproval':False,'activeWrites':0})

reuse_by={r['goalId']:r for r in retained}
maprows=[]
for species,goal,caseids,lim in [
 ('Cl−',ids[0],['chem-next20-a44af1fa-case-1','chem-next20-a44af1fa-case-2'],'Exact accepted chloride-control/composition cases reused; neither salt purity nor original ion pairing is inferred outside their explicit models.'),
 ('Br−',ids[1],['bromoethane-product-test','fresh-chloride-control'],'Current full P record contains the bromoethane bromide result plus a fresh chloride/background control. This witnesses the bromide test chemistry and control boundary in its actual substitution context; no new general salt execution or universal identity claim is inferred.'),
 ('CO3²−',ids[0],[carbonate['caseLocalKey']],'New bounded carbonate ion-reaction source witness; current580 gas component retained as support, not as proof of original carbonate species by itself.'),
 ('NH4+',ids[0],[ammonium['caseLocalKey']],'New controlled gas/proton source witness hosted under current selected-ion goal; held9dee excluded from operative reuse.')]:
 maprows.append({'originalIntentSpecies':species,'actualOriginalPrimaryLocator':'BB/BE3.2.6 full45 with mandatory Q boundary26','wholeSourceGoalIds':[r['sourceGoalId']for r in bbbe],
  'currentCanonicalWitnessGoalId':goal,'wholeCurrentGoalDigest':digest(by[goal]),'actualCurrentBBBEApplicability':True,'exactWitnessCaseIds':caseids,'boundedRoleRationale':lim,
  'retainedCurrentPBinding':{'reviewBinding':reuse_by[goal]['reviewBinding'],'wholeRecordDigest':reuse_by[goal]['wholeRecordDigest'],'profileFingerprint':reuse_by[goal]['wholeRecord']['profileFingerprint']},
  'newSourceSpecificCasePending':species in ['CO3²−','NH4+'],'independentSourceRoleUnionReviewPending':True,'learnerPracticalExecutionEstablished':False})
write('four-original-ion-intentions-to-exact-whole-goal-case-witness-map.author-v4.json',{'role':'Complete four-intention author map: source-role approval and new cases still pending two eligible targeted reviews','rows':maprows,'originalBBBEWholeSourceClosureApproved':False,'newWholeGoalOrPApproval':False,'historicallyValidReviewsRestarted':False,'BScience7b830SealUnchanged':True})
union=[ids[4],ids[5],ids[6],ids[0],ids[1]]
plans=[]
for r in bbbe:
 before=r['wholeOriginalDecision']['canonicalGoalIds'];assert before==['b4777001-f4ed-5fe9-9d98-02319abdea09','3de28598-672f-5753-8a45-8f559c2f9dc2']
 plans.append({'sourceGoalId':r['sourceGoalId'],'mappingPath':r['mappingPath'],'wholeOriginalSourceGoalDigest':digest(r['wholeOriginalSourceGoal']),
   'wholeOriginalDecisionBefore':r['wholeOriginalDecision'],'wholeOriginalEdgesBefore':r['wholeOriginalMappingEdges'],
   'candidatePointer':'/decisions/'+str(r['decisionIndex'])+'/canonicalGoalIds','candidateBefore':before,'candidateAfter':union,
   'candidateNewEdges':[{'legacyGoalId':r['sourceGoalId'],'canonicalGoalId':goal,'matchType':'partial','reviewDecisionId':r['sourceGoalId']}for goal in union],
   'candidateRationale':'One exact source-duty union: current proton roles plus controlled acid/basic water-ion witnesses and the four named original ion intentions. No broad organic family, protein/Biuret duty, MWG/pK duty or full modelling duty is inferred for this row.',
   'oldSourceTextIdentityCourseStageFieldsEqualRequired':True,'newReviewedAtOrReviewerNotAssigned':True,'allOtherSourceRowsAndEdgesEqualRequired':True,'activeApply':False})
write('two-source-row-operative-union-plan.pending-two-real-reviews.author-v4.json',{
 'role':'Concrete inactive union plan only; no source-row approval or active patch','rows':plans,'otherSevenOriginalSourceRowsChanged':0,
 'previousSixBoundedRoleDropsRetainedExact':bind(OLD/'six-limited-operative-source-role-deltas.inactive.json'),
 'previousFourWholeCurrentSourceCasesRetainedExact':bind(V3/'four-current-whole-source-cases.with-targeted-colorless-reference.author-v3.json'),
 'priorIndependentBFirstSealRetainedExact':bind(B/'independent-b-original-nine-role-four-case.first-verdict.freeze.json'),
 'requiredNextGates':['Two genuinely eligible independent targeted A/B reviews of the two new whole DE/EN cases, actual original26/44–46 source scope and full four-intention map; author cannot be its independent B.',
   'Resolve source-specific use of valid1c/d2/fd/a44/413 without reopening valid accepted old science or pretending model data are real experiments.',
   'Verify actual current applicability/BBBE scopes, mapping consumers and current exact native D/P/page/context bindings after any approved source-role application; no unchanged-context assumption.',
   'Keep old six independent role decisions/four science cases sealed; keep B477 semantic compound and whole481 pending. No goal completion/Strict gain from this author packet.',
   'Rebase against current active sources/Chem173/378 and live registry immediately before any root integration; retain Math807/807, Phys478/478, current Bio floor and all nine maturity floors.'],
 'twoNewIndependentReviewersRequired':True,'authorNotEligibleAsIndependentReviewerOfNewCases':True,'machineStrictNetGain':0,'activeWrites':0,'humanApproval':False})
inputs=list({b['path']:b for b in inputs}.values())
write('declared-current-input-bindings.author-v4.json',{'createdAtUTC':stamp,'role':'Exact inputs to targeted source author continuation; original B first seal retained','inputBindings':inputs,'sourceWitnessAuthorRole':True,'currentWholeGoalBodiesChanged':0,'existingWholePProfilesChanged':0,'newIndependentReviewsClaimed':0})
print(json.dumps({'authorPacketWritten':True,'wholeNewCases':2,'DEENBodies':4,'retainedStrictWitnessGoals':3,'fourIntentionsMapped':4,'wholeGoalsRewritten':0,'activeWrites':0,'independentApprovals':0}))
