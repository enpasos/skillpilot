# SPDX-License-Identifier: Apache-2.0
"""New inactive author successor. No old inputs, independent verdicts or active files change."""
import copy, datetime, hashlib, json, shutil
from pathlib import Path
import fitz
R=Path.cwd(); P=Path(__file__).resolve().parent
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
OLD=E/'biologie-medical-ethics-ten-current397-author-successor-20261011-v2'
BASE=E/'biologie-nature-eight-current397-targeted-material-source-author-successor-root-20261011-v2'
def load(p): return json.loads(p.read_text())
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p): return {'path':str(p.relative_to(R)), 'bytes':p.stat().st_size,'sha256':sha(p)}
def put(name,x):
 p=P/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def cp(src,name):
 p=P/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,p);assert sha(src)==sha(p)
 return ref(p)
assert sha(OLD/'FINAL.author-package.freeze.json')=='sha256:e03e5dc9305fc4700d46d0f8152f1bc99d058af8d17767c1423dd3d71d22d373'
assert sha(BASE/'FINAL.author-package.freeze.json')=='sha256:2399d7cc1195e44a9c0595455c7bd2c0603d777dd2dbfb00902c5302a0bed6ec'
ids=load(OLD/'FIRST.actual-neutral-medical10-continuation-author-inputs.json')['goalIds']
base=load(BASE/'candidate/whole484-current397.author.inactive.json')
old=load(OLD/'candidate/whole484-current397-medical10.author.inactive.json'); oldby={g['id']:g for g in old['goals']}
land=copy.deepcopy(base)
for g in land['goals']:
 if g['id'] in ids:
  for k in ['title','titleEn','description','descriptionEn','resourceLinks']:g[k]=copy.deepcopy(oldby[g['id']][k])
assert all(g==b for g,b in zip(land['goals'],base['goals']) if g['id'] not in ids)
assert all(g==oldby[g['id']] for g in land['goals'] if g['id'] in ids)
put('candidate/whole484-current397-medical10.author.inactive.json',land)
kind=load(BASE/'candidate/kinds484-current397.author-classification-only.json')
oldkind={r['goalId']:r for r in load(OLD/'candidate/kinds484-current397.author-classification-only.json')['decisions']}
kind['decisions']=[copy.deepcopy(oldkind[r['goalId']]) if r['goalId'] in ids else r for r in kind['decisions']]
kind['sourceLandscapePath']=str((P/'candidate/whole484-current397-medical10.author.inactive.json').relative_to(R))
put('candidate/kinds484-current397.author-classification-only.json',kind)
qa=load(BASE/'candidate/QA397.author-input-only.json'); oldqa={r['goalId']:r for r in load(OLD/'candidate/QA397-medical10.author-image-bindings-no-approval.json')['records']}
for row in qa['records']:
 if row['goalId'] in ids:row.update(copy.deepcopy(oldqa[row['goalId']]))
 row['landscapePath']=str((P/'candidate/whole484-current397-medical10.author.inactive.json').relative_to(R))
put('candidate/QA397-medical10.author-image-bindings-no-approval.json',qa)
for f in (OLD/'portable').rglob('*'):
 if f.is_file():cp(f,'portable/'+str(f.relative_to(OLD/'portable')))
cp(OLD/'images/ten-original-images.exact-author-input-inventory.json','images/ten-original-images.exact-author-input-inventory.json')
for gid in ids:
 for f in (OLD/'images'/gid).iterdir():
  if f.is_file():cp(f,'images/'+gid+'/'+f.name)
cp(OLD/'portable/normal-assets.exact-author-adoption-files.json','portable/normal-assets.previous-author-exact.json')

# Material correction retains the complete original examples. The changed tissue/rule is supplied,
# and the model response actually applies it. Fictional premises are not medical or legal advice.
cases=load(OLD/'cases/whole20-complete-bilingual-author-case-inputs.json')['wholeCases']
before_cases=copy.deepcopy(cases)
for row in cases:
 c=row['case'];gid=row['goalId']
 if gid.startswith('96547'):
  if c['id']=='ex-vivo-somatic-gene-addition':
   c['freshVariationDe']='Zusätzlich zur fehlenden Enzymbildung im Blutmodell wird ein anderes Zielgewebe betrachtet: Netzhautzellen sollen EnzymE selbst bilden. Das fiktive Material legt fest, dass EnzymE dort intrazellulär benötigt wird und nicht aus dem Blut in die Zielzellen gelangt. Für das bisherige Vehikel liegen nur Daten zum Eintritt in blutbildende Stammzellen vor; der Eintritt in Netzhautzellen wurde nicht untersucht. Übertrage die Eignungsbewertung auf dieses Gewebe und nenne die benötigten Daten.'
   c['freshVariationEn']='In addition to absent enzyme production in the blood model, consider a different target tissue: retinal cells must produce enzymeE themselves. The fictional material states that E is needed intracellularly there and does not reach those target cells from blood. The original vehicle has only been tested for entry into blood-forming stem cells; entry into retinal cells has not been examined. Transfer your suitability judgment to this tissue and identify the needed evidence.'
   c['transferResponseDe']='DNA-Nachweis ohne Enzymbildung trägt schon im Blutmodell keinen Funktionserfolg. Für die Netzhaut reicht die Rückgabe behandelter Blutstammzellen nach der gegebenen intrazellulären Voraussetzung ebenfalls nicht. Die Geninformation müsste geeignete Netzhautzellen erreichen und dort ausreichend EnzymE ermöglichen. Daten zum Eintritt, zur zellgeeigneten Expression, zur Funktion und zu unerwünschten Wirkungen in dieser Zielpopulation fehlen. Das bisherige Verfahren ist für dieses Gewebe somit nicht als geeignet belegt; eine neue Delivery- und Funktionsprüfung ist notwendig. Somatisches Zielgewebe bleibt von Keimbahn und Vererbungsbehauptung getrennt.'
   c['transferResponseEn']='DNA detection without enzyme production does not establish functional success even in the blood model. Returning treated blood stem cells is also insufficient for the retina under the stated intracellular requirement. Genetic information must reach suitable retinal cells and enable sufficient enzymeE there. Evidence for entry, cell-appropriate expression, function and unwanted effects in this population is missing. Thus the original procedure has not been established as suitable for this tissue; new delivery and functional tests are needed. Somatic target tissue remains distinct from germline changes and inheritance claims.'
  else:
   c['freshVariationDe']='Kurzfristig bildet die behandelte Blutstammzellpopulation normales ProteinP, langfristige Funktion bleibt ungeklärt. Jetzt liegt die neue Zielstörung in Hautzellen: Im fiktiven Material wird P lokal in Hautzellen benötigt und von den zurückgegebenen Blutzellen nicht dorthin geliefert. In einer Hautzellkultur nimmt dasselbe Werkzeug die gewünschte DNA-Änderung in 20 von 100 Zellen vor; nur 5 von 100 bilden messbar funktionsfähiges P. Unerwünschte Änderungen und dauerhafte Gewebefunktion wurden nicht untersucht. Wie verändert das die Eignungs- und Risikobewertung für die Haut?'
   c['freshVariationEn']='The treated blood stem-cell population now produces normal proteinP briefly, with long-term function unresolved. The new target defect is in skin cells: in this fictional material P is required locally in skin cells and is not delivered there by returned blood cells. In a skin-cell culture, the same tool makes the intended DNA change in 20 of 100 cells; only 5 of 100 produce measurable functional P. Unwanted changes and sustained tissue function have not been examined. How does this change suitability and risk evaluation for skin?'
   c['transferResponseDe']='Der kurzfristige Befund stärkt nur den geprüften Blut-Endpunkt. Er beweist weder langfristige Funktion noch Wirkung im anderen Gewebe. Für die Haut zeigen die Zahlen 20% gewünschte DNA-Änderung, aber nur 5% nachgewiesene funktionelle Proteinbildung in dieser Kultur. Die Rückgabe der Blutpopulation löst die lokale Hautanforderung nach dem Material nicht. Ein Zellkultur-Funktionshinweis ist kein Beleg für ausreichende dauerhafte Hautgewebefunktion oder klinischen Erfolg. Für eine Eignungsbewertung fehlen geeignete Zellversorgung/Transport, ausreichende lokale Funktion, Dauerhaftigkeit und Sicherheitskontrollen; ein Schwellenwert für ausreichende Funktion ist nicht gegeben. Das neue Urteil bleibt deshalb bedingt und gewebespezifisch.'
   c['transferResponseEn']='The short-term finding strengthens only the tested blood endpoint. It proves neither lasting function nor an effect in another tissue. For skin, the data show 20% intended DNA changes but only 5% measured functional protein production in this culture. Returning blood cells does not meet the local skin requirement stated in the material. A culture-level functional indication does not establish sufficient sustained skin-tissue function or clinical success. Suitability still needs evidence for appropriate cell delivery, sufficient local function, persistence and safety; no adequacy threshold is supplied. The new judgment therefore remains conditional and tissue-specific.'
  c['rubricDe']+=' Die andere Zielgewebe-Prämisse tatsächlich anwenden; Transport/Zellfunktion und vorhandene versus fehlende Daten ausdrücklich verbinden. DNA-Änderung, Proteinbildung und ausreichende Gewebefunktion nicht gleichsetzen.'
  c['rubricEn']+=' Actually apply the different target-tissue premise; connect delivery/cell function with present and missing data. Do not equate DNA change, protein production and adequate tissue function.'
 if gid.startswith('10a8'):
  c['materialDe']=c['materialDe'].replace('Rechtliche Voraussetzungen werden als offen zu klären behandelt.','').replace('Rechtliche Zulässigkeit wird im Modell nicht entschieden.','')
  c['materialEn']=c['materialEn'].replace('Legal requirements remain to be clarified.','').replace('Legal permission is not decided by this model.','')
  c['materialDe']+=' Fiktive UnterrichtsregelR, keine Darstellung geltenden Rechts: Eine Untersuchung vor Embryotransfer ist im Modell nur nach verständlicher Beratung, freiwilliger ausdrücklicher Einwilligung und vorheriger positiver Prüfung durch GremiumG zulässig. Hier liegen Beratung und freiwillige Einwilligung vor; die Prüfung durch G ist noch offen. Ein günstiger Testbefund ersetzt diese Prüfung nicht.'
  c['materialEn']+=' Fictional classroom ruleR, not a statement of current law: Under the model, testing before embryo transfer is permitted only after understandable counseling, freely given explicit consent and prior positive assessment by bodyG. Here counseling and free consent are present, but G’s assessment is unresolved. A favorable test result does not replace that assessment.'
  c['taskDe']+=' Wende die gegebene RegelR auf den Fall an und trenne technische Möglichkeit, regelgebundene Zulässigkeit und ethisches Urteil. Welcher Schritt bleibt vor Untersuchung offen?'
  c['taskEn']+=' Apply supplied ruleR to the case and distinguish technical possibility, rule-based permission and ethical judgment. Which step remains unresolved before testing?'
  c['sampleResponseDe']+=' Nach RegelR reicht der Nachweis von Beratung und Einwilligung nicht: Die positive Prüfung durch G fehlt noch. Die Untersuchung kann biologisch möglich sein, erfüllt aber im beschriebenen Stand nicht alle modellierten Zulässigkeitsbedingungen. Auch eine spätere positive Prüfung legt keine ethische Zustimmung fest; das begründete Abwägen der Werte bleibt eine eigene Frage.'
  c['sampleResponseEn']+=' Under ruleR, counseling and consent are insufficient: positive assessment by G is still missing. Testing may be technically possible but the described state does not satisfy all modeled permission conditions. Even a later positive assessment would not determine ethical agreement; reasoned weighing of values remains a separate question.'
  c['freshVariationDe']+=' Zusätzlich hat G jetzt positiv geprüft; die betroffene Person zieht ihre Einwilligung vor der Untersuchung zurück. Sind damit nach R alle Bedingungen erfüllt?'
  c['freshVariationEn']+=' In addition, G has now issued a positive assessment, but the person withdraws consent before testing. Does that satisfy all conditions under R?'
  c['transferResponseDe']+=' Nach der geänderten Rechtsprämisse ist die Prüfung erfüllt, die freiwillige Einwilligung jedoch nicht mehr vorhanden. Nach R ist die Untersuchung damit weiterhin nicht zulässig. Beratung, Gremiumvotum und technischer Befund ersetzen keine aktuelle Einwilligung. Das begrenzt das regelgebundene Vorgehen; es ersetzt keine unabhängige ethische Begründung.'
  c['transferResponseEn']+=' Under the changed rule premise the assessment condition is met, but free consent is no longer present. Thus testing still is not permitted under R. Counseling, assessment and technical findings cannot replace current consent. This limits the rule-bound course of action without substituting for an independent ethical rationale.'
  c['rubricDe']+=' Gegebene fiktionale Rechtsregel mit allen drei Bedingungen und der widerrufenen Einwilligung anwenden; keine Behauptung über gegenwärtiges deutsches Recht verlangen.'
  c['rubricEn']+=' Apply all three conditions of the supplied fictional rule and withdrawn consent; do not require claims about current German law.'
profiles=load(OLD/'profiles/ten-complete-positive-candidates.author.json')
for row in profiles['goals']:
 if not row['goalId'].startswith(('96547','10a8')):continue
 pair=[x['case'] for x in cases if x['goalId']==row['goalId']]; row['profile']['applicationCaseBriefs']=[]
 for c in pair:
  b={'id':c['id']}
  for lang in ['De','En']:
   b['taskDemand'+lang]=c['material'+lang]+'\n\n'+c['task'+lang]+'\n\n'+('Frische Variation: ' if lang=='De' else 'Fresh variation: ')+c['freshVariation'+lang]
   b['expectedPerformance'+lang]=c['sampleResponse'+lang]+'\n\nTransfer: '+c['transferResponse'+lang]+'\n\n'+('Bewertungsmaßstab: ' if lang=='De' else 'Scoring criteria: ')+c['rubric'+lang]
   b['understandingFocus'+lang]=' '.join(x['essentialUnderstanding'+lang] for x in row['profile']['expectations'])
  row['profile']['applicationCaseBriefs'].append(b)
profiles['reviewId']='biologie-medical-ethics-ten-current397-targeted-author-20261011-v3';profiles['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
put('profiles/ten-complete-positive-candidates.author.json',profiles)
put('cases/whole20-complete-bilingual-author-case-inputs.json',{'role':'author teaching material, not observed learning or actual clinical/legal execution','actualBilingualCases':20,'languageFiles':40,'actualExecution':False,'wholeCases':cases})
for f in (OLD/'cases').rglob('*.md'):cp(f,'cases/'+str(f.relative_to(OLD/'cases')))
for row in profiles['goals']:
 if not row['goalId'].startswith(('96547','10a8')):continue
 for b in row['profile']['applicationCaseBriefs']:
  for lang,ext in [('De','de'),('En','en')]:
   f=P/'cases'/row['goalId']/(b['id']+'.'+ext+'.md')
   f.write_text('# '+b['id']+'\n\n'+('Vollständig fiktiver didaktischer Autorenfall; keine tatsächliche klinische Durchführung, keine Rechtsberatung, keine Lernendenbeobachtung und keine zusätzliche Aufgabenquote.' if lang=='De' else 'Entirely fictional authored teaching case; no actual clinical execution, legal advice, learner observation or additional learner task quota.')+'\n\n'+b['taskDemand'+lang]+'\n\n## '+('Musterantwort und Bewertung' if lang=='De' else 'Model response and scoring')+'\n\n'+b['expectedPerformance'+lang]+'\n')
assert all(a==b for a,b in zip(cases,before_cases) if not a['goalId'].startswith(('96547','10a8')))

# Full HE successor changes only the eight concretely reviewed medical rows. Real normative
# words come from the actual current official PDF, not a previously authored JSON sentence.
atlas=load(BASE/'sources/normal397.author.inputs.json')
mp=R/atlas['mappingPaths'][6]; m=load(mp);ep=R/m['sourceExtractionPath'];e=load(ep)
med_sids={x['legacyGoalId']:x['canonicalGoalId'] for x in m['mappings'] if x['canonicalGoalId'] in ids}
assert len(med_sids)==8
pdf=R/e['sourceDocument']['path'];doc=fitz.open(pdf)
for i in [12,38,39]:
 f=P/'primary'/(f'HE-physical-page-{i+1:03d}.actual.txt');f.parent.mkdir(parents=True,exist_ok=True);f.write_text(doc[i].get_text())
text={i+1:doc[i].get_text() for i in [12,38,39]}
def words(s): return ' '.join(s.replace('\u00ad\n','').replace('\u00ad','').split())
spec={
 '50108500-7958-5954-b493-e89273649f8f':(39,'Q1.2','LK','gentechnisch veränderte Organismen (zum Beispiel Insulin produzierende Bakterien)','Q1.2, erhöhtes Niveau, GVO-Bullet','Amtlicher LK-GVO-Inhalt bleibt; Insulinbakterien sind ein Beispiel. Der Bewertungsoperator ist eine authored operationalization, kein wörtlicher amtlicher Gesamtoperator.'),
 'e36bebef-d7e3-57d0-bf01-236799d41cb7':(39,'Q1.3','GK_LK','Gentest und Beratung','Q1.3, grundlegendes Niveau, Gentest und Beratung','Methodenerklärung wird aus Gentest operationalisiert. Pränatale und molekulare Differenzierung ist eine begrenzte fachliche Ausgestaltung, nicht die wörtliche vollständige HE-PND-Pflicht.'),
 '96547bdb-554d-5266-a28c-fc16e708216d':(39,'Q1.3','LK','gentherapeutische Verfahren (an einem Beispiel)','Q1.3, erhöhtes Niveau, gentherapeutische Verfahren','Konkretes Verfahren bleibt LK-Beispiel, das GK-Prinzip Gentherapie bleibt amtlich auf derselben Seite. Chancen/Risiken und Zielgewebetransfer sind operationalisiert, nicht erfundene wörtliche Gesamtkompetenz.'),
 '9dc56d7d-3321-55b6-8988-cfc74abdc341':(39,'Q1.3','GK_LK','Gentest und Beratung','Q1.3, grundlegendes Niveau, Gentest und Beratung','Beratung und Entscheidungsfindung werden aus dem amtlichen Gentest/Beratung-Inhalt begrenzt operationalisiert; keine erfundene Unterkompetenz Q1.3.8.'),
 '5a44f356-ab0a-5d15-b976-889e22c8d32e':(39,'Q1.3','GK_LK','Gentest und Beratung','Q1.3, grundlegendes Niveau, Gentest und Beratung; pränatale authored Anwendung','PND/ethische Bewertung ist hier eine authored Anwendung von Gentest/Beratung. HE nennt PND nicht wörtlich vollständig als verpflichtende Methoden-/Ethikkompetenz; andere unveränderte Quellenpartner werden separat gebunden.'),
 '10a8dac7-65c8-5f85-a944-3e2a7d2c6028':(39,'Q1.4','GK_LK','Methode der Präimplantationsdiagnostik an einem Beispiel und ethische Herausforderungen','Q1.4, grundlegendes Niveau, PID und ethische Herausforderungen','Amtliche PID-Methode und ethische Herausforderungen bleiben GK/LK innerhalb Q1.4. Das Themenfeld ist fakultativ, sein innerer Niveauoperator wird nicht abgesenkt; RegelR ist explizit fiktionale Unterrichtsausgestaltung.'),
 '7f76ff0b-218b-568d-91df-20bbe2b156e2':(40,'Q1.5','GK_LK','Krebs: unkontrollierte Zellteilung, Tumor, Metastase','Q1.5, grundlegendes Niveau, Krebs-Bullet','Amtlicher GK-Krebs/Tumor/Metastase-Inhalt bleibt. Die kausale Erklärung ist authored; unkontrollierte Teilung allein beweist keine metastatische Ansiedlung. Fakultative Themenfeldwahl und innerer GK-Niveauinhalt bleiben getrennt.'),
 '96001dbf-ef37-584a-98f0-d5351d9cdeaf':(13,'Q1.4','GK_LK','Biologische Erkenntnisse leisten einen entscheidenden Beitrag zur Entwicklung von Gesetzen und Regeln in menschlichen Gesellschaften, wie das beispielsweise bei gentechnischen Fragestellungen der Fall ist, und nehmen so Einfluss auf die zukünftige Gestaltung menschlicher Gesellschaften.','2.1 Beitrag des Faches zur Bildung, S.13; authored Anwendung im genetischen Q1-Kontext','Gesetze/Regeln und gesellschaftliche Teilhabe sind im allgemeinen Bildungsbeitrag belegt. Dies ist keine wörtliche amtliche Q1.4.2-Unterkompetenz und keine vollständige Q1.4-Regelungspflicht; die konkrete Handlungskette ist eine begrenzte authored Operationalisierung.'),
}
before_m=copy.deepcopy(m);before_e=copy.deepcopy(e);changes=[]
current_goals={g['id']:g for g in land['goals']}
for row in e['sourceGoals']:
 if row['id'] not in med_sids:continue
 gid=med_sids[row['id']];page,topic,course,raw,span,boundary=spec[gid]
 assert words(raw) in words(text[page]),(gid,raw)
 before=copy.deepcopy(row)
 row['title']=current_goals[gid]['title'];row['description']=current_goals[gid]['description']
 row.update({'granularity':'authoredOperationalization','sourceText':raw,'rawSourceText':raw,'parentBulletText':raw,'rawParentBulletText':raw,'sourceSpan':span,'rawSourceSpan':span,'sourceRef':f'HMKB Kerncurriculum Biologie gymnasiale Oberstufe, tatsächliche amtliche physische/gedruckte S.{page}; {span}','courseLevel':course})
 row['authorSourcePrecision']={'originalPrimary':ref(pdf),'physicalPage':page,'printedPage':page,'literalSourceSpan':span,'authorDescriptionNotOfficialQuote':True,'boundaries':boundary,'historicalAuthoredSourceSpan':before['sourceSpan'],'historicalAuthoredSourceText':before['sourceText'],'independentApproval':False}
 changes.append({'goalId':gid,'sourceGoalId':row['id'],'before':before,'after':copy.deepcopy(row),'scopeBoundary':boundary})
for row in m['mappings']:
 if row['legacyGoalId'] in med_sids:row['matchType']='partial'
for row in m['decisions']:
 if row['sourceGoalId'] not in med_sids:continue
 gid=med_sids[row['sourceGoalId']];row.update({'matchType':'partial','sourceSpan':spec[gid][4],'rationale':spec[gid][5]+' Tatsächlicher amtlicher rawSourceText ist im vollständigen Extraktionsnachfolger gebunden. Geprüfte Quellenpartner bleiben separat; keine Source-Union-Vollfreigabe.','reviewedAt':'2026-10-11','reviewer':'Codex Medical10 continuation AUTHOR, independent review pending'})
for field in ['mappings','decisions']:
 k='legacyGoalId' if field=='mappings' else 'sourceGoalId'
 assert all(a==b for a,b in zip(m[field],before_m[field]) if a[k] not in med_sids)
assert all(a==b for a,b in zip(e['sourceGoals'],before_e['sourceGoals']) if a['id'] not in med_sids)
extract=P/'sources/extractions/06-HE.whole-eight-medical-raw-primary-successor.author.json'
m['sourceExtractionPath']=str(extract.relative_to(R));m['reviewId']=m['reviewId']+'-medical8-primary-precision-author-v3'
e['authorMedical8SourcePrecisionSuccessor']={'status':'inactive_author_candidate','priorWholeExtraction':ref(ep),'actualPrimary':ref(pdf),'changedSourceGoalIds':list(med_sids),'noOtherSourceGoalsChanged':True,'independentReview':'pending','sourceUnionApproval':False}
m['summary']['exactMappings']=sum(x.get('matchType')=='exact' for x in m['mappings'])
m['summary']['partialMappings']=sum(x.get('matchType')=='partial' for x in m['mappings'])
m['summary']['medical8ActualSourceCounts']={'sourceGoals':len(e['sourceGoals']),'authoritativeDecisionRows':len(m['decisions']),'actualMappingEdges':len(m['mappings']),'authoredMedicalPartialRows':8,'independentNewSourceApprovals':0}
m['authorMedical8SourcePrecisionSuccessor']={'status':'inactive_author_candidate','priorWholeMapping':ref(mp),'changedSourceGoalIds':list(med_sids),'allOtherMappingsAndDecisionsExact':True,'independentReview':'pending','sourceUnionApproval':False}
put(str(extract.relative_to(P)),e);put('sources/mappings/06-HE.whole-eight-medical-raw-primary-successor.author.review.json',m)
atlas['mappingPaths'][6]=str((P/'sources/mappings/06-HE.whole-eight-medical-raw-primary-successor.author.review.json').relative_to(R))
atlas.update({'landscapePath':str((P/'candidate/whole484-current397-medical10.author.inactive.json').relative_to(R)),'semanticKindLedgerPath':str((P/'candidate/kinds484-current397.author-classification-only.json').relative_to(R)),'outputDirectory':'app/scripts/config/goal-books/inactive/medical10-current397-v3/source-views','manifestPath':'app/scripts/config/goal-books/inactive/medical10-current397-v3/atlas.sources.json','navigationViewPath':'app/scripts/config/goal-books/inactive/medical10-current397-v3/navigation.view.json'})
put('sources/normal397-medical10.author.inputs.json',atlas)
put('sources/HE-eight-medical-actual-raw-primary-deltas.author.json',{'role':'AUTHOR substantive primary-text correction, not fingerprint-only review','oldWholeMapping':ref(mp),'oldWholeExtraction':ref(ep),'originalPrimary':ref(pdf),'changes':changes,'allOtherSourceGoalsMappingsDecisionsExact':True,'protectedPedigree440Unchanged':True,'independentA':'pending','independentB':'pending','sourceUnionApproval':False})
cfg=load(BASE/'native/whole397.author.normal.config.json')
cfg.update({'landscapePath':atlas['landscapePath'],'semanticKindLedgerPath':atlas['semanticKindLedgerPath'],'goalVisualizationQaPath':str((P/'candidate/QA397-medical10.author-image-bindings-no-approval.json').relative_to(R)),'compositionViewManifestPath':atlas['manifestPath'],'outputPath':str((P/'native/whole397-medical10.normal-model.actual.json').relative_to(R))})
cfg['evidenceReviewPaths'].append(str((P/'positive/P10-medical.author-pending.review.jsonl').relative_to(R)))
put('native/whole397-medical10.normal.config.json',cfg)
pc=load(OLD/'positive/P10-medical.author-pending.config.json');pc.update({'reviewId':profiles['reviewId'],'landscapePath':atlas['landscapePath'],'semanticKindLedgerPath':atlas['semanticKindLedgerPath'],'reviewPath':str((P/'positive/P10-medical.author-pending.review.jsonl').relative_to(R)),'requireApproved':False});put('positive/P10-medical.author-pending.config.json',pc)
put('FIRST.actual-neutral-medical10-continuation-author-inputs.json',{'role':'Medical v3 AUTHOR bounded material/source continuation, no independent vote','goalIds':ids,'wholeGoals':484,'curricularAtomic':397,'oldMedicalNeutral':ref(OLD/'FINAL.neutral-medical10-current397-author.join.json'),'oldMedicalFreeze':ref(OLD/'FINAL.author-package.freeze.json'),'currentRoot8NeutralBasis':ref(BASE/'FINAL.neutral-root8-current397-author.join.json'),'currentRoot8Freeze':ref(BASE/'FINAL.author-package.freeze.json'),'newCanonical':ref(P/'candidate/whole484-current397-medical10.author.inactive.json'),'all474NonMedicalCanonicalGoalsExactToCurrentRoot8Basis':True,'all10MedicalCanonicalGoalsExactToPriorMedicalv2':True,'modifiedProfileBodies':2,'modifiedCaseBodies':4,'unchangedProfiles':8,'unchangedCases':16,'newImages':0,'tenOriginalImagesExact':True,'sourceRowsChanged':8,'allOtherSourcePartnersUnchanged':True,'activeWrites':False,'strictGainClaimed':0,'sourceUnionApproval':False,'humanApproval':False,'authorIsNotIndependentMedicalReviewer':True})
print(json.dumps({'newAuthorNamespace':str(P.relative_to(R)),'modifiedProfiles':2,'modifiedCases':4,'HE8':len(changes),'other474Exact':True,'newImages':0,'strictGain':0}))
