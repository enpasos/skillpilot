# SPDX-License-Identifier: Apache-2.0
"""Two genuinely corrected whole citation cases; inactive author candidate."""
import copy
import hashlib
import json
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
BASE=OWN.parent
OLD=BASE/'biologie-upper-communication-evaluation-whole-author-resumed-v1'
NATIVE=BASE/'biologie-upper-communication-evaluation-sixteen-native-author-technical-resumed-v1'
GID='cb218858-a468-5d3f-83e0-b60f83368af7'
def bind(p):return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def put(p,v):
    p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
original=json.loads((OLD/'sixteen-whole-thirty-two-bilingual-cases.author-candidate.json').read_text())
entry=copy.deepcopy(next(e for e in original['entries'] if e['goalId']==GID))
seed,nutrient=entry['authoredCases']
for field in ['material','workedResponse']:
    assert 'byday 6' in seed[field]['en']
    seed[field]['en']=seed[field]['en'].replace('byday 6','by day 6')
nutrient['task']['de']+=' Ergänze ein kurzes wörtliches Zitat aus C 3, eine getrennte sinngemäße Wiedergabe und die eigene Verhältnisrechnung aus Tabelle 2; kennzeichne jeweils Quelle, Fundstelle und Modellstatus.'
nutrient['task']['en']+=' Add a short exact quotation from C 3, a separately marked paraphrase and your own ratio calculation from table 2; identify source, locator and model status for each.'
nutrient['workedResponse']['de']+=' Wörtliches Zitat: „Einzelmessungen beweisen keine Ursache.“ (Skill Pilot, Modellübersicht C 3, 2026, Abschnitt 1). Paraphrase derselben Passage: Aus den einzelnen Modellwerten allein lässt sich die Ursache des Unterschieds nicht belegen. Eigene Rechnung aus C 2, Tabelle 2: 8 mg/L ÷ 2 mg/L = 4; dieses Verhältnis ist meine Ableitung aus den Modelldaten, kein wörtliches Zitat und kein Ursachebeweis.'
nutrient['workedResponse']['en']+=' Exact quotation: “Single measurements do not prove causation.” (Skill Pilot, Model Overview C 3, 2026, section 1). Paraphrase of the same passage: The individual model values alone do not establish what caused the difference. Own calculation from C 2, table 2: 8 mg/L ÷ 2 mg/L = 4; this ratio is my inference from model data, neither a quotation nor proof of causation.'
nutrient['rubric'].append(dict(de='Wörtliches C-3-Zitat, Paraphrase und eigene 8/2-Rechnung getrennt und exakt belegt; keine Ursache aus dem Verhältnis behauptet.',en='Exact C-3 quotation, paraphrase and own 8/2 calculation separately and precisely referenced; no cause claimed from the ratio.'))
assert entry['wholeCurrentGoal']==next(e for e in original['entries'] if e['goalId']==GID)['wholeCurrentGoal']
assert entry['expectations']==next(e for e in original['entries'] if e['goalId']==GID)['expectations']
put(OWN/'corrected-one-whole-goal-two-bilingual-cases.author-candidate.json',entry)
html=(OLD/'media/citation-original-model-cards.html').read_text()
assert html.count('bisTag 6')==1 and html.count('byday 6')==1
new_html=html.replace('bisTag 6','bis Tag 6').replace('byday 6','by day 6')
media=OWN/'media/citation-original-model-cards.corrected-v2.html'
media.parent.mkdir(exist_ok=True);assert not media.exists();media.write_text(new_html)
assert 'Einzelmessungen beweisen keine Ursache.' in new_html
assert 'Single measurements do not prove causation.' in new_html
records=[json.loads(s) for s in (NATIVE/'positive/P16.current-raster.author-candidate.review.jsonl').read_text().splitlines()]
old=next(r for r in records if r['goalId']==GID)
profile=copy.deepcopy(old['profile'])
for c,brief in zip(entry['authoredCases'],profile['applicationCaseBriefs']):
    assert c['caseId']==brief['id']
    brief['taskDemandDe']=c['material']['de']+'\n\nAuftrag: '+c['task']['de']+'\n\nFrische Variation: '+c['freshTransfer']['de']
    brief['taskDemandEn']=c['material']['en']+'\n\nTask: '+c['task']['en']+'\n\nFresh variation: '+c['freshTransfer']['en']
    brief['expectedPerformanceDe']=c['workedResponse']['de']+'\n\nTransferantwort: '+c['freshTransferWorkedResponse']['de']
    brief['expectedPerformanceEn']=c['workedResponse']['en']+'\n\nTransfer response: '+c['freshTransferWorkedResponse']['en']
    brief['understandingFocusDe']=' '.join(e['essentialUnderstandingDe'] for e in entry['expectations'])+' Rubrik: '+'; '.join(r['de'] for r in c['rubric'])
    brief['understandingFocusEn']=' '.join(e['essentialUnderstandingEn'] for e in entry['expectations'])+' Rubric: '+'; '.join(r['en'] for r in c['rubric'])
assert all(profile[k]==old['profile'][k] for k in profile if k!='applicationCaseBriefs')
put(OWN/'corrected-one-positive-profile.body.author-candidate.json',profile)
put(OWN/'unchanged-frame-and-actual-material-delta.author.receipt.json',dict(goalId=GID,originalMaterial=bind(OLD/'sixteen-whole-thirty-two-bilingual-cases.author-candidate.json'),originalNativeEntry=bind(NATIVE/'neutral-sixteen-native-independent-review.entry.json'),correctedCases=bind(OWN/'corrected-one-whole-goal-two-bilingual-cases.author-candidate.json'),correctedOfflineOriginal=bind(media),originalOfflineSource=bind(OLD/'media/citation-original-model-cards.html'),actualHTMLChanges=['C1 bisTag6 to bis Tag6','C1 byday6 to by day6'],actualCaseChanges=['C1 literal English quotation whitespace alignment','C2 task/worked quotation/paraphrase/inference and rubric coverage in DE and EN'],other30WholeCasesExactToOriginal=True,other15WholeProfilesUnchanged=True,all16GoalTextsImagesNativePagesUnchanged=True,sourceDecisionsUnchanged=True,scientificAuthorMaterialCorrection=True,independentApproval=False,activeWrites=0,strictNetGain=0,humanApproval=False,humanTrial=False))
print('Prepared actual targeted bilingual citation correction. No independent approval or active writes.')
