# SPDX-License-Identifier: Apache-2.0
# Author remediation of four actual independent findings, preserving first31 bytes.
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent
REL=lambda p:str(Path(p).relative_to(ROOT))
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):return {'path':REL(p),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def write(name,v):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write((json.dumps(v,ensure_ascii=False,indent=2)+'\n') if not isinstance(v,str) else v)
 return bind(p)
sealpath=AUTHOR/'author.current-whole-text-P20-source-AM.first.freeze.json';assert sha(sealpath)=='18b1a21ac3216c47c4208306cbbf7782d4504c42241875a2fa00009230acde1e'
seal=read(sealpath)
for f in seal['frozenFiles']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
oldmat=read(AUTHOR/'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json');mat=copy.deepcopy(oldmat)
# 05EN selection concerns existing bacterial variants; the person does not become resistant.
c=mat['goals'][4]['cases'][0];old='the person and not necessarily every bacterium newly become resistant.';assert old in c['modelAnswer']['en'];c['modelAnswer']['en']=c['modelAnswer']['en'].replace(old,'the person does not become resistant, nor must every bacterium acquire new resistance.')
# 07 Both genuinely independent whole cases explicitly connect a vitamin/mineral function to given food.
m=mat['goals'][6]
c=m['cases'][0];c['material']['de']='Eigene vereinfachte Tagesangebote für eine gesunde fiktive Person im gewöhnlichen Schulalltag: Plan A besteht nur aus süßen Getränken und Weißbrot. Plan B enthält Vollkorn, Gemüse/Obst einschließlich roter Paprika, Hülsenfrüchte oder andere passende Proteinquellen, eine kleine Fettquelle, eine Calciumquelle wie Milch oder ein ausdrücklich calciumangereichertes pflanzliches Getränk und Wasser. Rote Paprika liefert Vitamin C, das für die Bildung von Kollagen als Bestandteil des Bindegewebes nötig ist; Calcium ist Bestandteil der mineralischen Struktur von Knochen und Zähnen. Mengen und individuelle Diagnosedaten fehlen.'
c['material']['en']='Original simplified daily menus for a fictional healthy person in ordinary school life: Plan A has only sweet drinks and white bread. Plan B includes whole grains, vegetables/fruit including red pepper, pulses or other suitable protein sources, some fat, a calcium source such as milk or an explicitly calcium-fortified plant drink, and water. Red pepper provides vitamin C needed to make collagen in connective tissue; calcium is part of the mineral structure of bones and teeth. Quantities and individual diagnostic data are absent.'
c['modelAnswer']['de']='Kohlenhydrate und Fette tragen Energie bei; Proteine liefern Bausteine, und essenzielle Fettsäuren erfüllen weitere notwendige Aufgaben. Vitamin C aus der angegebenen Paprika unterstützt die Kollagenbildung im Bindegewebe; Calcium aus der angegebenen Calciumquelle trägt zur mineralischen Struktur von Knochen und Zähnen bei. Diese unterschiedlichen Funktionen begründen die Aufnahme beider Quellen in B zusätzlich zu Energie- und Proteinquellen. B deckt unterschiedliche Gruppen eher ab als A und enthält ballaststoffreiche Komponenten und Wasser. Vielfalt und ausreichende Versorgung werden an Lebensumstände und Vorlieben angepasst, nicht allein an eine Kalorienzahl. Aus den Angaben lässt sich keine individuelle medizinische Diät oder exakt passende Portionsmenge berechnen.'
c['modelAnswer']['en']='Carbohydrates and fats supply energy; proteins provide building material, while essential fatty acids perform further necessary roles. Vitamin C from the stated red pepper supports collagen formation in connective tissue; calcium from the stated calcium source contributes to the mineral structure of bones and teeth. These different functions justify including both sources in B alongside energy and protein sources. B covers distinct groups better than A and includes fibre-rich components and water. Variety and adequate nourishment should fit circumstances and preferences rather than one calorie value. The information cannot determine an individual therapeutic diet or exact portions.'
c=m['cases'][1]
c['material']['de']+=' Beide Mahlzeiten enthalten als vorgegebene Beispiele Paprika als Vitamin-C-Quelle und ein ausdrücklich calciumangereichertes pflanzliches Getränk als Calciumquelle. Das Material nennt Kollagenbildung im Bindegewebe als Vitamin-C-Funktion und die mineralische Struktur von Knochen und Zähnen als Calciumfunktion.'
c['material']['en']+=' As given examples, both menus include red pepper as a vitamin C source and an explicitly calcium-fortified plant drink as a calcium source. The material identifies collagen formation in connective tissue as a vitamin C function and mineral structure of bones and teeth as a calcium function.'
c['modelAnswer']['de']=c['modelAnswer']['de'].replace('Gleiche Lebensmittel können','Vitamin C aus der Paprika wird für die Kollagenbildung benötigt; Calcium aus dem angereicherten Getränk ist Teil der mineralischen Knochen- und Zahnstruktur. Beide Funktionen bleiben bei R und S erforderlich und werden nicht durch zusätzliche Energieträger ersetzt. Gleiche Lebensmittel können')
c['modelAnswer']['en']=c['modelAnswer']['en'].replace('Circumstances can justify','Vitamin C from the red pepper is needed for collagen formation; calcium from the fortified drink is part of the mineral structure of bones and teeth. Both functions remain necessary for R and S and are not replaced by extra energy sources. Circumstances can justify')
# 16 BY10 3.4 comparison does not require substeps/reduction equivalents.
c=mat['goals'][15]['cases'][1];old='B entspricht menschlicher Glykolyse/Lactatbildung und regeneriert für fortlaufende Glykolyse nötige Elektronenakzeptoren.';assert old in c['modelAnswer']['de'];c['modelAnswer']['de']=c['modelAnswer']['de'].replace(old,'B entspricht dem anaeroben Glucoseabbau mit Lactatbildung in menschlichen Zellen und liefert im vorgegebenen Modell netto 2 ATP je Glucose.')
old='B is human glycolysis/lactate formation, regenerating electron acceptors needed for glycolysis.';assert old in c['modelAnswer']['en'];c['modelAnswer']['en']=c['modelAnswer']['en'].replace(old,'B is anaerobic glucose breakdown with lactate formation in human cells, yielding a net 2 ATP per glucose in the supplied model.')
# 19 German sweetener/sugar distinction, exact given menu.
c=mat['goals'][18]['cases'][1];assert 'statt einer einzigen Süßstoffquelle' in c['modelAnswer']['de'];c['modelAnswer']['de']=c['modelAnswer']['de'].replace('statt einer einzigen Süßstoffquelle','statt eines fast nur aus Süßigkeiten bestehenden Angebots')
changedCaseIds=[]
for old,new in zip(oldmat['goals'],mat['goals']):
 assert old['wholeGoal']==new['wholeGoal']
 for oc,nc in zip(old['cases'],new['cases']):
  if oc!=nc:changedCaseIds.append(nc['id'])
assert changedCaseIds==['human20-05-case-1','human20-07-case-1','human20-07-case-2','human20-16-case-2','human20-19-case-2']
write('twenty-whole-goals-forty-complete-DEEN-cases.author-v2.json',mat)
md=['# Human20 gezielte Autorenkorrektur v2','', 'Fünf ganze Fälle auf vier Zielen geändert; keine Änderungen an Zieltexten. Erste historische Freeze-Dateien unverändert. Keine unabhängige Freigabe.', '']
for g in mat['goals']:
 md+=['## '+g['wholeGoal']['title'],'',g['wholeGoal']['description'],'',g['wholeGoal']['descriptionEn'],'']
 for c in g['cases']:
  md+=['### '+c['id'],'','**Material DE:** '+c['material']['de'],'','**Task DE:** '+c['task']['de'],'','**Model answer DE:** '+c['modelAnswer']['de'],'','**Material EN:** '+c['material']['en'],'','**Task EN:** '+c['task']['en'],'','**Model answer EN:** '+c['modelAnswer']['en'],'']
write('twenty-whole-goals-forty-complete-DEEN-cases.author-v2.md','\n'.join(md)+'\n')
oldp=read(AUTHOR/'P20.current-text-preimage.author.candidates.json');p=copy.deepcopy(oldp);review='biologie-human20-current391-positive-author-targeted-science-v2';p['reviewId']=review;p['reviewedAt']=datetime.now(timezone.utc).isoformat();p['reviewer']='Codex original human20 material author; focused correction of genuine independent findings, no independent approval'
for n in [5,7,16,19]:
 item=p['goals'][n-1];g=mat['goals'][n-1];assert item['goalId']==g['goalId'];profile=item['profile']
 if n==7:
  profile['expectations'][0]['essentialUnderstandingDe']='Nährstofffunktionen und Zusammensetzung begründen bedarfsgerechte Versorgung: Vitamin C für Kollagenbildung und Calcium für die mineralische Knochen-/Zahnstruktur werden mit passenden angebotenen Nahrungsmitteln verbunden.'
  profile['expectations'][0]['essentialUnderstandingEn']='Nutrient functions and composition justify adequate provision: vitamin C for collagen formation and calcium for mineral bone/tooth structure are linked to suitable offered foods.'
 for c,brief in zip(g['cases'],profile['applicationCaseBriefs']):
  assert c['id']==brief['id'];brief['taskDemandDe']=c['material']['de']+' '+c['task']['de'];brief['taskDemandEn']=c['material']['en']+' '+c['task']['en'];brief['expectedPerformanceDe']=c['modelAnswer']['de'];brief['expectedPerformanceEn']=c['modelAnswer']['en']
  if n==7:
   brief['understandingFocusDe']=' '.join(e['essentialUnderstandingDe'] for e in profile['expectations']);brief['understandingFocusEn']=' '.join(e['essentialUnderstandingEn'] for e in profile['expectations'])
 item['reason']='Gezielter neuer ganzer Autorenfall-/Profilkörper zur Behebung tatsächlicher unabhängiger Befunde; erste Freeze und alle Zieltexte bleiben unverändert. Unabhängige Nachprüfung dieser Änderung steht aus.'
 item['dissent'][0]='E1/G1-Autorkandidat; gezielte fachliche Korrektur, unabhängige Nachprüfung steht aus. Keine reale Lernendenleistung, E2, menschliche Prüfung, Freigabe oder Erprobung.'
for n,(old,new) in enumerate(zip(oldp['goals'],p['goals']),1):
 if n not in [5,7,16,19]:assert old==new
write('P20.current-text-preimage.author-targeted-v2.candidates.json',p)
config=read(AUTHOR/'P20.current-text-preimage.author.config.json');config['reviewId']=review;config['reviewPath']=REL(OWN/'P20.current-text-preimage.author-targeted-v2.review.jsonl');config['scope']['label']='20 exact whole human20 profiles, four focused independently found science corrections, E1/G1 author candidates pending independent recheck';write('P20.current-text-preimage.author-targeted-v2.config.json',config)
write('bounded-vitamin-mineral-function-author-source-check.actual.json',{'role':'author factual check of concrete nutritional examples; does not enlarge curriculum or imply clinical guidance','actualAccessDate':'2026-10-07','actualAccessMechanism':'web.open current official NIH Office of Dietary Supplements pages','sources':[{'url':'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/','sectionsSeen':['Introduction','Sources of Vitamin C — Food'],'paraphrasedBoundedFinding':'Vitamin C is required for collagen biosynthesis in connective tissue. Red pepper is a dietary vitamin C source.','operativeUse':'whole cases human20-07-case-1 and case-2; no intake quantities, supplement advice or diagnoses'},{'url':'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/','sectionsSeen':['Introduction','Sources of Calcium — Food'],'paraphrasedBoundedFinding':'Calcium contributes to mineral structure of bones and teeth. Milk and explicitly calcium-fortified plant drinks are suitable example sources.','operativeUse':'whole cases human20-07-case-1 and case-2; no intake quantities, supplement advice or diagnoses'}],'officialFullTextCopied':False,'scientificSourceReviewRole':'author only','humanApproval':False})
a=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-independent-a-20261007-v1/first-twenty-whole-goals-forty-cases-source-P-science.actual.json';bf=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-independent-b-20261007-v1/ordinal05-case01-EN-resistance-negation.first-finding.independent-b.json'
write('four-actual-findings-targeted-author-remediation.receipt.json',{'role':'author correction, pending independent verification','originalFirst31Seal':bind(sealpath),'actualIndependentFirstFindings':[bind(a),bind(bf)],'findingMappings':[{'authorLocalCorrectionId':'HUMAN20-B-P05-EN-RESISTANCE-NEGATION','independentFindingReference':'ordinal05-case01-EN-resistance-negation.first-finding.independent-b.json; original independent artifact has no findingId field','ordinal':5,'changes':['case1 EN model answer and native P expectedPerformanceEn resistance negation']},{'findingId':'HUMAN20-A-P07-MICRONUTRIENT-FUNCTION','ordinal':7,'changes':['both whole DEEN case materials/model answers now concrete vitamin/mineral functions linked to supplied foods','core understanding and both case focus bindings match actual function']},{'findingId':'HUMAN20-A-P16-SOURCE-LEVEL-BOUNDARY','ordinal':16,'changes':['case2 DEEN mandatory answer replaces electron-acceptor regeneration with correct given matter/ATP comparison','BY10 3.4 exclusion of substeps/reduction equivalents retained']},{'findingId':'HUMAN20-A-P19-DE-NUTRITION-TERM','ordinal':19,'changes':['case2 DE sweetener misnomer corrected to actual sweets menu']}],'changedWholeCaseIds':changedCaseIds,'unchangedWholeCaseBodies':35,'unchangedWholeGoalBodies':20,'unchangedOtherProfileBodies':16,'exactRetainedAM20':True,'sourceAndPerformanceDissentBoundsRetained':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
for f in seal['frozenFiles']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
print(json.dumps({'changedWholeCases':5,'profilesWithActualChanges':4,'unchangedWholeCases':35,'unchangedWholeGoals':20,'nativePreparationPending':True,'activeWrites':0}))
