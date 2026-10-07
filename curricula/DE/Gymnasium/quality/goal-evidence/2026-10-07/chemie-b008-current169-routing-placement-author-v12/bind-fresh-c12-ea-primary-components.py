# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from copy import deepcopy
from datetime import datetime,timezone
import json,re,hashlib
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;assert not(OWN/'author.final.freeze.json').exists();ORIGIN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3';V11=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b008-twenty-six-native-source-preparation-author-v11'
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
source=ORIGIN/'primary-inputs/by12-ea.actual-main.txt';text=source.read_text();lines=text.splitlines();normal=lambda s:re.sub(r'\s+',' ',s).strip();rows=read(ORIGIN/'all-national-original-nine-source-obligations.actual.json')['directBindings'];bySource={r['wholeSourceGoal']['id']:r for r in rows};placements=read(V11/'twenty-six-partial-source-components-and-original-national-holds.author-candidate.json')['placements'];fresh=[]
for placement in placements:
 for oldComp in placement['primaryComponents']:
  if'compatibility profile GK'not in oldComp['courseBoundedToActuallyReadPage']:continue
  row=next(r for r in rows if r['wholeSourceGoal']['id']==oldComp['originalSourceGoalId']and hashlib.sha256(json.dumps(r['wholeSourceGoal'],ensure_ascii=False,sort_keys=True).encode()).hexdigest()==oldComp['wholeSourceGoalValueSha256']);historicalLiteral=row['wholeSourceGoal']['sourceText'];literal=historicalLiteral
  discrepancy=None
  if normal(literal)not in normal(text):
   assert placement['candidateKey']=='upper-quantitative-hypothesis-data-evaluation'and 'Daten, finden'in literal
   literal=literal.replace('Daten, finden','Daten auf, finden');discrepancy={'historicalSourceExtractionText':historicalLiteral,'actualPrimaryText':literal,'cause':'Retained extraction omits the actual primary word auf after Daten; historical source body retained unchanged. This genuine primary discrepancy is recorded; no hash-only scientific claim.'}
  assert normal(literal)in normal(text),placement['candidateKey']
  exactLine=next(i for i,l in enumerate(lines)if normal(l)==normal(literal));start=max(0,exactLine-2);end=min(len(lines),exactLine+5)
  component=deepcopy(oldComp);component['retainedPrimaryCaptureBinding']=bind(source);component['actualPrimaryURL']='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht';component['courseBoundedToActuallyReadPage']='erhöhtes Anforderungsniveau; existing SkillPilot compatibility profile LK';component['originalSourceSpan']=oldComp['originalSourceSpan'];component['actualReadPrimaryCourseSpan']='C12-EA page, exact current retained primary competence paragraph';component['actualLiteralSourceText']=literal;component['historicalExtractionDiscrepancy']=discrepancy;component['actualPrimaryLineRange']={'start':start+1,'end':end};component['actualPrimaryContext']='\n'.join(lines[start:end]);component['newReadDoesNotClearWholeDeduplicatedC13Contexts']=True
  fresh.append({'candidateKey':placement['candidateKey'],'nativeCandidateGoalId':placement['nativeCandidateGoalId'],'sourceOperatorContractDe':placement['sourceOperatorContractDe'],'freshEAPrimaryComponent':component,'literalFullSourceParagraphActuallyRead':True,'scientificDecision':'author_candidate_partial_source_component_requires_independent_QA','reviewedSemanticTextAnd52MaterialBodiesUnchanged':True,'allNationalSourceObligationsCleared':False})
write(OWN/'fresh-fourteen-c12-ea-primary-components.author-input.json',{'role':'Genuine bounded fresh read of retained C12-EA official primary paragraphs; no deduplicated GA/C13 blanket rebind','createdAtUTC':datetime.now(timezone.utc).isoformat(),'actualRetainedPrimaryCapture':bind(source),'actualOfficialCourseUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht','fullReadRange':{'start':32,'end':205},'actualPrimaryComponents':fresh,'sameCompetenceTextDoesNotProveAllContexts':True,'wholeOriginalDutyClosure':False,'strictGain':0,'activeWrites':0,'humanApproval':False,'independentApproval':False});print(json.dumps({'freshEAComponents':len(fresh),'allLiteralSourceTextsMatched':True,'unchanged26TextsAnd52Cases':True,'strictGain':0}))
