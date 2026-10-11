from pathlib import Path
import json,hashlib,re,datetime
O=Path(__file__).resolve().parents[1]; ROOT=O.parents[6];H=O/'history';C=O/'candidates';N=O/'source-notes'
def put(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
DD='dd38e0c5-d77b-5893-815c-548ea2a84429';PO='543bf91f-f6c6-5b1b-ba9e-43de321d8c7f';V='776457c2-8bb3-53b9-838b-a028319175fb';PAY='a5009946-62bb-5e6a-8c92-732d02e8fd70';POL='da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0';S='f1f73ebe-286a-52e8-a2e1-4383ece6e9ec'
# Q1.3 is mandatory, its named workplace examples are alternatives.
p=N/'whole-country-and-course-role-proposals.INERT.json';d=json.loads(p.read_text())
for r in d['countries']:
 if r['jurisdiction']=='DE-HE':r['f08Condition']='Actual Q2.4 taught under applicable choice/decree; actual workplace co-determination example selected within Q1.3 (the topic is mandatory, the example is not); E1.4 pay context. Independent whole dd38/776/a500 source operationalisation and placement must be qualified. No GK proposal: retained dd38 is LK.'
put(p,d)
p=N/'bounded-actual-primary-components.INERT.json';d=json.loads(p.read_text())
for r in d['components']:
 if r['componentLabel']=='HE:KC2024Q1.3':
  r['choiceCondition']='Q1.3 topic mandatory; workplace co-determination/working-law examples are alternatives and must actually be selected for this proposed voice context'
  r['ownFaithfulScopeSummaryEn']='An actually selected workplace co-determination/working-law example can support bounded workplace-rights applications. Q1.3 does not make this particular example universally compulsory. The selected §80/§87 rule card is primary law, not a curriculum quotation.'
put(p,d)
p=N/'all84-selected-row-restoration-and-remap-proposals.INERT.json';d=json.loads(p.read_text())
for r in d['rows']:
 if r['mappingSourceSet']=='07':
  r['actualPrimaryCourseRole']='E1.4 and Q1.3 topics mandatory; specific Q1.3 co-determination/working-law examples are alternatives. Q2.4 optional/by applicable decree. Q4 one selected TF1–3/by applicable decree. Basic Q4 content GK+LK, additional content LK only.'
  r['actualFinding']+=' The specific workplace co-determination example in Q1.3 must actually be selected; its named example status is not a universal whole-voice target.'
put(p,d)
# Readability changes only in the two unsealed whole authored practices.
replacements={
 'jeStunde':'je Stunde','jePerson':'je Person','sicher1000':'sicher 1000','Freiwillig10':'Freiwillig 10','von20':'von 20','mit20':'mit 20','alternativ0':'alternativ 0','J50':'J 50','I40':'I 40','All100':'All 100','Alle100':'Alle 100','je40':'je 40','all100':'all 100',
 'vorher800':'vorher 800','Kverteilt':'K verteilt','EVerbleibende':'E: Verbleibende','F1000sicher':'F: 1000 sicher','Gvariabel':'G variabel','Gaufgegebenen':'G auf gegebenen','Qreagiert':'Q reagiert','aufTeamqualität':'auf Teamqualität','beideVZÄ':'beide VZÄ','keine individuelleAbleitung':'keine individuelle Ableitung','produktiverenLandwirtschaft':'produktiveren Landwirtschaft','produktiveLandwirtschaft':'produktive Landwirtschaft',
 'R-Lücke':'R-Lücke','Srechnerisch':'S rechnerisch','Rnichtganz':'R nicht ganz','NichtmonetäreMessobjekte':'Nichtmonetäre Messobjekte','nichtautomatisch':'nicht automatisch','zuEinkommensquote':'zur Einkommensquote','Teilhabediagnose/finanzierte':'Teilhabediagnose / finanzierte','undprüfbare':'und prüfbare','könnteSin':'könnte S in','Takeup':'Inanspruchnahme','Take-up':'Inanspruchnahme','Kurs50':'Kurs 50','Jobs':'Jobs','dauerhafterZugang':'dauerhafter Zugang','Ausgaben/Plätze':'Ausgaben / Plätze','neueQuote':'neue Quote','nichtbehaupten':'nicht behaupten',
 'sinkendemAnteil':'sinkendem Anteil','informelleArbeit':'informelle Arbeit','jedesHaushalts':'jedes Haushalts','andereObjekte':'andere Objekte','zugänglicherBetrieb':'zugänglicher Betrieb','tatsächlichgezahlt':'tatsächlich gezahlt','realeLücken':'reale Lücken','sichereWasser':'sichere Wasser','regelmäßigeSchulnutzung':'regelmäßige Schulnutzung','nurBauten':'nur Bauten','realeGrenze':'reale Grenze','nominal100':'nominal 100','falscheBasis':'falsche Basis','GetrennteQuerschnitte':'Getrennte Querschnitte','individuellenAufstiege':'individuellen Aufstiege','jedesEinkommen':'jedes Einkommen','jederDimension':'jeder Dimension','tragfähigePrioritäten':'tragfähige Prioritäten','Teilpunktefür':'Teilpunkte für','gezeigteElemente':'gezeigte Elemente','KeineZusatzfall':'Keine Zusatzfall','falscherErsatz':'falscher Ersatz','wieAufgabenbeschreibung':'wie Aufgabenbeschreibung','keinEinzelirrtum':'kein Einzelirrtum','sachlichfalsch':'sachlich falsch','Stunden/VZÄ/Köpfe':'Stunden / VZÄ / Köpfe',
 'Anreiz/Risiko':'Anreiz / Risiko','alteQuote':'alte Quote','finanzierteStrategie':'finanzierte Strategie','neueMessobjekte':'neue Messobjekte','neuePreis':'neue Preis','alteDimensionen':'alte Dimensionen','relativeÄnderung':'relative Änderung','Abdeckung,Puffer/andereFenster,LageohneJobgarantie':'Abdeckung, Puffer / andere Fenster, Lage ohne Jobgarantie',
 'individual/team':'individual / team','bothFTE':'both FTE','remaining800':'remaining 800','otherwindows':'other windows','timingwithoutjobguarantee':'timing without job guarantee','financialvsvoice':'financial vs voice','fixedFvsvariableG':'fixed F vs variable G','Originalinformation':'Original information','Originalincentive':'Original incentive','addedjobevaluation':'added job evaluation','individualcalculation':'individual calculation','bothperspectives':'both perspectives','conditionaljobs':'conditional jobs','withoutjob':'without job',
 'differentbases':'different bases','bothshare':'both share','conditionalpaths':'conditional paths','originalincidence':'original incidence','andfundedstrategy':'and funded strategy','addedobjects':'added objects','cross-sectionlimit':'cross-section limit','bothperspectives':'both perspectives','Originalincentive':'Original incentive','teamquality':'team quality','businessresults':'business results','wholework':'whole work','rate':'rate','allstated':'all stated','everyhousehold':'every household',
 'nominal108':'nominal 108','atT0prices':'at T0 prices','Astatistic':'A statistic','actualpayments':'actual payments','realgaps':'real gaps','regular-schooluse':'regular school use','actualaccess':'actual access','Unlinkedcross-sections':'Unlinked cross-sections','individualmobility':'individual mobility','everyincome':'every income','everydimension':'every dimension','newjobs':'new jobs','futurefunding':'future funding','isolatederrors':'isolated errors','partialshownperformance':'partial shown performance','consistentlywrong':'consistently wrong','addedprice':'added price','comparison/relativechange':'comparison / relative change','fixedinputs':'fixed inputs',
 'Original24':'Original 24','Original40':'Original 40','plusactualnew':'plus actual new','plusactual':'plus actual','andfunded':'and funded','or1000':'or 1000','onlyonce':'only once','fundedpriority':'funded priority','actualnew':'actual new','real100means':'real 100 means','nominal100is':'nominal 100 is','inconsistentbasis':'inconsistent basis','No guaranteed':'No guaranteed','two years':'two years','aftertwo':'after two','fullreach':'full reach','courseuse':'course use','take-up/identities':'take-up / identities','to national average':'to national average','relativechange':'relative change',
 'Arbeitsanforderungen statt Leistung':'Arbeitsanforderungen statt individueller Leistung','gleicher gegebenen Qualität':'gleicher gegebener Qualität','etwaigen':'etwaigen'
}
def fmt(t):
 for a,b in replacements.items():t=t.replace(a,b)
 t=re.sub(r'(?<=[a-zäöüß])(?=\d)', ' ',t)
 t=re.sub(r'(?<=\d)(?=[A-Za-zÄÖÜäöüß])',' ',t)
 t=re.sub(r'(?<=%)(?=[A-Za-zÄÖÜäöüß])',' ',t)
 t=re.sub(r'(?<![:/])(?<=[A-Za-zäöüÄÖÜ])(?=[A-ZÄÖÜ][a-zäöü])',' ',t)
 # Hand-written German learner text has normal punctuation; preserve maths literals.
 t=t.replace('Prozentpunkte;','Prozentpunkte; ').replace('Punkte,','Punkte, ').replace('1P','1 P').replace('2P','2 P')
 return t
practice=[]
for stem in ['f08','036ea']:
 p=C/f'{stem}.whole-practice.candidate.INERT.json';g=json.loads(p.read_text())
 for key in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:g['examData'][key]=fmt(g['examData'][key])
 for st in g['examData']['scoring']['steps']:
  st['description']=fmt(st['description']);st['descriptionEn']=fmt(st['descriptionEn'])
 put(p,g);practice.append(g)
put(C/'two-whole-practices.INERT.json',practice)
l=json.loads((C/'landscape.author-only.INERT.json').read_text());ps={g['id']:g for g in practice};l['goals']=[ps.get(g['id'],g) for g in l['goals']];put(C/'landscape.author-only.INERT.json',l)
lookup={g['id']:g for g in l['goals']};put(C/'six-whole-content-successor-goals.INERT.json',[lookup[g] for g in [DD,V,PAY,PO,POL,S]])
# This is selected current classification input, not another D-run result.
sem=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-one-current-682-pure-Q1-terminal-native-technical-independent-a-INERT-v22/semantic679.only-Q1-parent-FP-and-independent-practice-terminal.activation-ready-INERT.json'
ledger=json.loads(sem.read_text());selected={r['goalId']:r for r in ledger['decisions'] if r['goalId'] in [DD,V,PAY,PO,POL,S]};assert len(selected)==6
put(H/'selected-current-semantic-inputs.actual.json',{'path':str(sem.relative_to(ROOT)),'digest':digest(sem),'selectedCurrentKinds':selected,'candidateEffectiveKinds':{g:'curricularAtomic' for g in [DD,V,PAY,PO,POL,S]},'changedCandidateClassificationAuthority':'INERT author proposal; independent A open'})
# Own new author records carry the already sealed whole profiles, no changed performances.
records=[json.loads((H/'sealed-dd38-retained-positive.exact.json').read_text())]+[json.loads(x) for x in (H/'sealed-543b-da734-positive.exact.jsonl').read_text().splitlines()]
for rec in records:
 rec['reviewId']='dd543-source-followers-own-author-v1-'+rec['goalId'];rec['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z');rec['reviewer']='OpenAI GPT-6 / Codex; own INERT author carry and native rebinding, no independent review';rec['reason']='Whole substantive profile carried exactly from own immutable dd38/543b author handoff; native binding to this own whole candidate and actual curricularAtomic input proposal. No new independent content, source, human or learner approval.'
 rec['status']='needs_human_review';rec['reviewAuthority']='ai_candidate';rec['evidenceLevel']='E1';rec['maximumClaimScope']='G1';rec['reviewRunIds']=[]
put(C/'positive-profiles.unbound-author-drafts.json',records)
# Six actual already inspected images: retain immutable paths and byte hashes.
images=[]
observations={DD:'Actual old image shows working-time models and participation breadth; retained hours goal has no new visual binding pending V.',V:'Actual workers/management rules/voice/decision graphic read; unchanged whole reused goal binding preserved.',PAY:'Actual time/performance/participation incentive/distribution graphic read; it does not alone evidence full job-value/performance contract.',PO:'Actual original graphic includes material security/access/strategy breadth; measurement-only retained goal has no new visual binding pending V.',POL:'Actual material-security/access/participation graphic read as unchanged whole reuse context.',S:'Actual sectors/alternative-growth-paths graphic read as unchanged whole context.'}
for gid in [DD,V,PAY,PO,POL,S]:
 g=json.loads((H/f'{gid}.whole-current-goal.exact.json').read_text())
 for link in g.get('resourceLinks',[]):
  if link.get('type')=='goal-visualization' and link.get('url','').startswith('/assets/'):
   f=ROOT/'app/public'/link['url'].lstrip('/');images.append({'goalId':gid,'url':link['url'],'repositoryPath':str(f.relative_to(ROOT)),'digest':digest(f),'bytes':f.stat().st_size,'actualVisualInspectionPerformed':True,'observation':observations[gid]})
put(N/'six-bound-original-images.actual-inspection.json',{'actualInspectingRuntime':'OpenAI GPT-6 / Codex','images':images,'newImageGenerated':False,'freshCandidateVApprovalClaimed':False,'practiceImages':[]})
assert len(images)==6
(O/'author-criteria.txt').write_text('Own INERT author carry/rebinding and whole follower material preparation. Preserve full historical DE/EN goals/P/cases/source unions; no duplicate canonical IDs. Check retained hours, existing regulated workplace voice, job requirements versus individual/team performance and financial participation; measurement objects, overlap, real-price comparison, poverty depth and actually usable policy/access outcomes. Actual sufficient varied performances may occur within one multi-step transfer; no task-title or additional case quota. Native schemas/fingerprints and actual original image bytes only establish technical binding. All independent source/course/A/M/cards/Practice/D/P/V/human/learner gates remain open. AI author candidates are E1/G1, needs_human_review.\n')
print('Own source choice correction, readability pass, selected input kinds, six whole goals, three profile carries, six actual-image receipt saved.')
