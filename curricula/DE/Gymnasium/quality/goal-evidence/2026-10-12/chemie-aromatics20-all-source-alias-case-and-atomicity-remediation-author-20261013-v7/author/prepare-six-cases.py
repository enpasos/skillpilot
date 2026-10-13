"""Apache-2.0 helper; original bilingual teaching content CC-BY-4.0."""
from pathlib import Path
import copy,datetime,hashlib,json
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N='chemie-aromatics20-all-source-alias-case-and-atomicity-remediation-author-20261013-v7';O=E/N;C=R/'tmp'/N/'private-parent'
B=E/'chemie-aromatics-dyes20-current231-scientific-author-20261013-v1';V4=E/'chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def oh(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rel(p):return str(Path(p).relative_to(R))
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
original=read(B/'author/whole40.expanded-cases.author.json');cases=copy.deepcopy(original);profiles=read(B/'author/whole20.profile-payloads.author.json');oldprofiles=copy.deepcopy(profiles);changes=[]
def exactspan(c):
 for rub in c['rubric']:
  for lang in ['De','En']:
   text=c['task'+lang];cl=rub['taskClause'+lang];assert cl in text
   rub['taskSpan'+lang]=dict(start=text.index(cl),end=text.index(cl)+len(cl))
for c in cases['cases']:
 if c['caseId']=='c8f51eac-case-1':
  c['dataDe']+=' Für alle übrigen sichtbaren Wellenlängen im Modellbereich380–780 nm außerhalb430–480 nm ist der Reflexionsanteil vernachlässigbar.'
  c['dataEn']+=' Reflectance is negligible at every other visible wavelength in the model range380–780 nm outside430–480 nm.'
 if c['caseId']=='64b03eff-case-1':
  c['taskDe']=c['taskDe'].replace('gemessene Verschiebungsrichtung','angegebene Verschiebungsrichtung')
  for r in c['rubric']:r['taskClauseDe']=r['taskClauseDe'].replace('gemessene Verschiebungsrichtung','angegebene Verschiebungsrichtung')
 if c['goalId'].startswith('61da9d34'):
  r=c['rubric'][0];r['creditBasis']='written-explicit-source-research-evidence'
  r['partialCreditDe']='0 Recherchepunkte ohne nachprüfbaren tatsächlichen Quellenabruf. 1 Punkt für einen tatsächlich erschlossenen, lokalisierbaren und dokumentierten, aber fachlich noch unvollständigen Recherchebefund; 2 Punkte für den vollständigen ausdrücklich verlangten Recherchebeleg mit URL, Abschnitt, tatsächlichem Abrufdatum und den geforderten eigenen fachlichen Unterscheidungen. Eine richtige gelieferte Nutzen-/Sicherheitsaussage oder ein abgeschriebener Mustervermerk allein belegt e1 nicht. Verständnisleistungen in r2 bleiben getrennt.'
  r['partialCreditEn']='0 research points without checkable actual source access. 1 point for an actually retrieved, locatable and documented but scientifically incomplete research finding; 2 points for the complete explicitly requested evidence with URL, section, actual access date and the requested original scientific distinctions. A correct supplied benefit/safety statement or a copied model access note alone does not demonstrate e1. Understanding in r2 remains separate.'
  c['researchEvidenceRequired']=True;c['researchExecutionBoundary']='The task opportunity and author reference checks do not certify actual learner access; supplied or fictional facts cannot earn research-operator credit.'
 if c['goalId'].startswith('e5941581'):
  k=1 if c['caseId'].endswith('-1')else 2;ar='Ph' if k==1 else 'p-NO₂–C₆H₄'
  c['dataDe']=c['dataDe'].replace('Ph–N≡N⁺','[Ph–N≡N]⁺')
  c['modelAnswerDe']=c['modelAnswerDe'].replace('Ph–N≡N⁺','[Ph–N≡N]⁺');c['modelAnswerEn']=c['modelAnswerEn'].replace('Ph–N≡N⁺','[Ph–N≡N]⁺')
  c['dataDe']+=f' Vorgeschaltete Diazotierung im Papiermodell: Ar={ar}; Ar–NH₂ + HNO₂ in wässriger Säure bei0–5 °C. NO⁺ bezeichnet das nitrosierende Elektrophil. Die Zwischenstufen Ar–NH–N=O und Ar–N=N–OH sind als Strukturhilfen gegeben; einzelne Protonenübertragungen dürfen zu Sammelschritten zusammengefasst werden. Ar steht für den unveränderten Arylrest. Keine dirigierenden Effekte oder praktischen Ausführungsschritte werden zusätzlich geprüft.'
  c['dataEn']+=f' Preceding diazotization in the paper model: Ar={ar}; Ar–NH₂ + HNO₂ in aqueous acid at0–5 °C. NO⁺ denotes the nitrosating electrophile. Ar–NH–N=O and Ar–N=N–OH are supplied structural guides; individual proton transfers may be grouped. Ar is the unchanged aryl group. No extra directing-effect or practical-execution requirement is assessed.'
  cld='Ergänze vor der Kupplung die Diazotierung auf Teilchenebene: beschreibe den Elektronenpaarfluss beim Angriff des Aminostickstoffs auf NO⁺, ordne die gegebenen N-N-Zwischenstufen bis zum Diazoniumion und erkläre die Rolle der Säure und der Wasserabspaltung. Formuliere die Gesamtgleichung mit Ar–NH₂, HNO₂ und H⁺ und prüfe Atom- und Gesamtladungsbilanz. Vollständige Einzelpfeile für jede Protonenübertragung sind nicht gefordert.'
  cle='Complete diazotization before coupling at particle level: describe electron-pair flow when amino nitrogen attacks NO⁺, order the supplied N-N intermediates up to the diazonium ion, and explain acid and water-loss roles. Write the overall equation using Ar–NH₂, HNO₂ and H⁺ and check atom and net-charge balance. Separate arrows for every proton transfer are not required.'
  ansd='Ein verfügbares N-Elektronenpaar des neutralen Aminanteils greift das N des nitrosierenden NO⁺ an und bildet die N-N-Bindung. Nach Protonenübertragung/Deprotonierung liegt Ar–NH–N=O vor; Protonenumlagerung ergibt Ar–N=N–OH. Säure ermöglicht die Bildung des Nitrosierungsreagenzes und protoniert die OH-Gruppe zu einer Wasserabgangsgruppe. Wasserabspaltung und Bildung der N≡N-Bindung ergeben [Ar–N≡N]⁺. Gesamt: ArNH₂ + HNO₂ + H⁺ → [ArN₂]⁺ + 2 H₂O. Außer dem unveränderten Ar stehen links wie rechts2 N,2 O und4 H; Gesamtladung jeweils+1. Diese verkürzte Teilchenfolge genügt hier; sie ist kein vollständiges Protonenübertragungsnetz und keine Versuchsaufzeichnung.'
  anse='An available N lone pair of the neutral amine fraction attacks nitrogen of nitrosating NO⁺ and forms the N-N bond. Proton transfer/deprotonation gives Ar–NH–N=O; proton rearrangement gives Ar–N=N–OH. Acid enables formation of the nitrosating reagent and protonates OH into a water leaving group. Water loss and formation of N≡N give [Ar–N≡N]⁺. Overall: ArNH₂ + HNO₂ + H⁺ → [ArN₂]⁺ + 2 H₂O. Apart from unchanged Ar, both sides contain2 N,2 O and4 H; net charge is+1 on both sides. This abbreviated particle sequence is sufficient here; it is neither a complete proton-transfer network nor an experiment record.'
  # Existing r1/r2 remain the coupling and triarylmethane criteria; r3 is the missing first azo stage.
  for lang,cl,ans in [('De',cld,ansd),('En',cle,anse)]:
   c['task'+lang]='1. '+cl+'\n'+c['task'+lang].replace('1. ','2. ',1).replace('\n2. ','\n3. ',1)
   c['modelAnswer'+lang]='1. '+ans+'\n'+c['modelAnswer'+lang].replace('1. ','2. ',1).replace('\n2. ','\n3. ',1)
  r=copy.deepcopy(c['rubric'][0]);r.update(criterionId=c['caseId']+'-r3',expectationIds=['e1'],taskClauseDe=cld,taskClauseEn=cle,criterionDe=ansd,criterionEn=anse,maximumPoints=2,creditBasis='written-explicit-task')
  r['partialCreditDe']='1 Punkt für den ausdrücklich geforderten fachlich richtigen N-N-Teilchenweg samt Säure-/Wasserrolle; 1 Punkt für die ausdrücklich geforderte vollständige Atom- und Ladungsbilanz. Keine zusätzlichen Protonenpfeile, Dirigierungsbegründungen, Temperaturbegründungen oder praktische Durchführungspunkte.'
  r['partialCreditEn']='1 point for the explicitly requested correct N-N particle route with acid/water roles; 1 point for the explicitly requested complete atom/charge balance. No additional proton arrows, directing or temperature explanation, or practical-execution points.'
  c['rubric'].append(r);c['maximumPoints']+=2
 exactspan(c)
 before=next(x for x in original['cases']if x['caseId']==c['caseId'])
 if c!=before:changes.append(c)
for row in profiles['profiles']:
 p=row['profile']
 for brief in p['applicationCaseBriefs']:
  c=next(x for x in cases['cases']if x['caseId']==brief['id'])
  for lang in ['De','En']:brief['taskDemand'+lang]=c['data'+lang]+'\n'+c['task'+lang];brief['expectedPerformance'+lang]=c['modelAnswer'+lang]
 if row['goalId'].startswith('e5941581'):
  p['expectations'][0]['essentialUnderstandingDe']='Azosynthese umfasst Diazotierung und Kupplung; N-N-Bindungsaufbau, Ladungen und Rearomatisierung werden auf Teilchenebene erklärt.'
  p['expectations'][0]['essentialUnderstandingEn']='Azo synthesis includes diazotization and coupling; N-N formation, charges and rearomatization are explained at particle level.'
  p['expectations'][0]['observablePerformanceDe']='Stellt den begrenzten Diazotierungsweg mit Bilanz sowie den Kupplungsmechanismus aus den ausdrücklich gegebenen Zwischenstufen dar.'
  p['expectations'][0]['observablePerformanceEn']='Represents the bounded diazotization route and balance, then coupling, using the explicitly supplied intermediates.'
  for brief in p['applicationCaseBriefs']:
   for lang in ['De','En']:brief['understandingFocus'+lang]+=' / '+('Diazotierung vor der Kupplung; begrenzter N-N-Teilchenweg und Gesamtbilanz.'if lang=='De'else 'Diazotization before coupling; bounded N-N particle route and overall balance.')
assert len(changes)==6
write(O/'author/six-complete-bilingual-case-corrections.author.json',dict(schemaVersion=1,license='CC-BY-4.0',cases=changes,changedOriginalCases=6,retainedOriginalCases=34,noActualExecution=True,newIndependentReviews=0))
profilechanges=[p for p in profiles['profiles']if p!=next(x for x in oldprofiles['profiles']if x['goalId']==p['goalId'])]
write(O/'author/three-complete-profile-corrections.author.json',dict(schemaVersion=1,profiles=profilechanges,changedOriginalProfiles=len(profilechanges),atomic4bOriginalRestored=True))
# Research is supplementary evidence on the existing method partner, not a new required part of I/M.
v4cases=read(V4/'author/whole40.expanded-cases.author.json')['cases'];supp=[]
for c in [x for x in v4cases if x['goalId'].startswith('4b9810b0')]:
 k=c['caseId'][-1];r=copy.deepcopy(c['rubric'][2]);s=dict(caseId='ac8b6c0f-organic-source-supplement-'+k,goalId='ac8b6c0f-98b2-5092-806d-d9498efbfa35',applicationRole='partial source-method evidence only; not a complete partner profile or completion',license='CC-BY-4.0',dataDe=c['dataDe'],dataEn=c['dataEn'],taskDe=r['taskClauseDe'],taskEn=r['taskClauseEn'],modelAnswerDe=r['criterionDe'],modelAnswerEn=r['criterionEn'],rubric=[r],maximumPoints=2,actualLearnerResearchPerformed=False,independentReview=False)
 r['criterionId']=s['caseId']+'-r1';r['expectationIds']=['source-retrieval-component'];r['taskSpanDe']=dict(start=0,end=len(s['taskDe']));r['taskSpanEn']=dict(start=0,end=len(s['taskEn']));s['scopeLimits']='Only guided digital passage retrieval/documentation/interpretation. Analogue research and full complex-source/citation breadth of existing partner are not demonstrated.';supp.append(s)
write(O/'author/two-existing-partner-research-supplements.author.json',dict(schemaVersion=1,cases=supp,newGoalIDs=[],fullPartnerApproval=False,doesNotGradeAtomic4b=True))
selector=[]
for c in cases['cases']:
 originalc=next(x for x in original['cases']if x['caseId']==c['caseId']);isnew=c!=originalc
 selector.append(dict(caseId=c['caseId'],goalId=c['goalId'],path=rel(O/'author/six-complete-bilingual-case-corrections.author.json')if isnew else rel(B/'author/whole40.expanded-cases.author.json'),objectSHA256=oh(c),sourceCaseObjectSHA256=oh(originalc),action='specific_independent_finding_correction'if isnew else 'exact_whole_original_case_retention',restoredFromRejectedV4ResearchCombination=c['goalId'].startswith('4b9810b0'),rubricSpanAudit=[dict(criterionId=r['criterionId'],taskSpanDe=r['taskSpanDe'],taskSpanEn=r['taskSpanEn'],creditBasis=r['creditBasis'])for r in c['rubric']]))
write(O/'author/whole40.lean-case-input-selector-and-exact-span-audit.json',dict(schemaVersion=1,cases=selector,fullBilingualCases=40,original34Retained=34,specificOriginal6Changed=6,relativeV4ResearchRollbackCases=2,relativeV4UnchangedCases=32,criteria=86,optionalRemarksUngraded=True,newIndependentVotes=0))
write(C/'candidate/whole40.cases.json',cases);write(C/'candidate/whole20.profiles.json',profiles)
material=read(B/'author/whole20.normal-materializer-input.author.json');material.update(reviewId=N,reviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),reviewer='Codex original author, batched bounded successor only')
for x in material['goals']:x['profile']=next(p['profile']for p in profiles['profiles']if p['goalId']==x['goalId'])
write(C/'candidate/whole20.materializer-input.json',material)
print(json.dumps({'sixCompleteCasesWritten':len(changes),'completeOriginalCasesRetained':34,'4bScienceCasesRestored':2,'profileCorrections':len(profilechanges),'researchPartnerSupplements':2,'criteria':86,'noActiveWrites':True}))
