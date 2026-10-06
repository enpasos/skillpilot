#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy,shutil,subprocess
from jsonschema import Draft202012Validator,FormatChecker

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OLD=BASE/'biologie-ni-thirteen-positive-profile-remediation-author-v1'
AUTH=BASE/'biologie-ni-ten-current-native-author-candidate-v2'
OWN=BASE/'biologie-ni-one-positive-case-functional-witness-author-v2'
CODE=ROOT/'tmp/biologie-ni-one-positive-case-functional-witness-author-v2-native-root'
EDA='eda5b810-d9d3-5319-9c4f-5b48715b26f2'
CASE='training-versus-selection'

NEW={
 'taskDemandDe':'Ein ausdrücklich fiktives Modell vergleicht Muskelzuwachs eines trainierenden Tieres während seines Lebens, der laut Kontrollen nicht als solcher vererbt wird, mit einer Käferpopulation, die von Beginn an erbliche dunkle und helle Farbvarianten enthält. Auf einem dunklen Untergrund entdecken die modellierten Vögel bei sonst gleichen Bedingungen dunkle Käfer seltener als helle. Dunkle Käfer hinterlassen im Modell im Mittel mehr Nachkommen, die später selbst fortpflanzen; der Anteil der vererbten dunklen Farbvariante steigt über Generationen. Unterscheide die individuelle Anpassung von der erblichen Angepasstheit und begründe die zweite Einordnung ausdrücklich mit Tarnung in dieser Umwelt und den gegebenen Fortpflanzungsbefunden. Warum genügen Vererbbarkeit und Generationenfolge allein dafür nicht?',
 'taskDemandEn':'An explicitly fictional model compares muscle increase in a training animal during its lifetime, which controls establish is not itself inherited, with a beetle population containing inherited dark and light colour variants from the outset. On a dark substrate, the modelled birds detect dark beetles less often than light beetles under otherwise equal conditions. In the model, dark beetles leave more offspring on average that later themselves reproduce; the proportion of the inherited dark-colour variant rises across generations. Distinguish individual adjustment from heritable adaptation and explicitly justify the second classification using camouflage in this environment and the supplied reproductive evidence. Why are inheritance and a sequence of generations alone insufficient?',
 'expectedPerformanceDe':'Ordnet den kontrolliert nicht-erblichen Muskelzuwachs als Veränderung des Individuums innerhalb eines Lebens ein. Begründet die erbliche Angepasstheit im Käfermodell durch die Kette dunkler Untergrund, passende Tarnung und seltenere Entdeckung durch Vögel, mehr später selbst fortpflanzende Nachkommen sowie erbliche Häufigkeitszunahme in der Population über Generationen. Vererbbarkeit und Zeitskala allein belegen nur erbliche Variation, nicht diesen funktionalen Umwelt- und Selektionszusammenhang. Die erbliche Farbvariation ist im Modell bereits vorhanden; keine zielgerichtete Bedarfsvererbung, keine Garantie eines Vorteils in jeder Umwelt und keine molekulare Epigenetikerklärung.',
 'expectedPerformanceEn':'Identify the controlled non-heritable muscle increase as a change in the individual during one lifetime. Justify heritable adaptation in the beetle model through the chain of dark substrate, suitable camouflage and less frequent detection by birds, more offspring that later themselves reproduce, and an inherited frequency increase in the population across generations. Inheritance and timescale alone establish only heritable variation, not this functional environmental and selection relationship. The inherited colour variation is already present in the model; require no purposeful inheritance driven by need, no guarantee of advantage in every environment and no molecular epigenetic explanation.',
 'understandingFocusDe':'Der nicht als solcher vererbte trainingsbedingte Muskelzuwachs betrifft das Individuum innerhalb seines Lebens. Im gegebenen fiktiven Käfermodell verbindet der Funktionsbezug dunkler Untergrund und Tarnung eine seltenere Entdeckung mit größerem Fortpflanzungserfolg und einer erblichen Häufigkeitsänderung über Generationen; das begründet hier Angepasstheit der Population. Zeitskala und Vererbbarkeit allein reichen nicht, ein Bedarf erzeugt keine zielgerichteten Varianten, und aus diesem Modell folgt kein Vorteil dunkler Färbung in jeder Umwelt oder eine molekulare Epigenetikaussage.',
 'understandingFocusEn':'Training-induced muscle increase that is not itself inherited concerns the individual during its lifetime. In the supplied fictional beetle model, the functional relationship between dark substrate and camouflage connects less frequent detection with greater reproductive success and an inherited frequency change across generations; this supports population adaptation here. Timescale and inheritance alone are insufficient, a need does not generate purposeful variants, and this model implies neither an advantage of dark colour in every environment nor a molecular epigenetic claim.',
}

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def verifyfreeze(rel):
 p=ROOT/rel;d=json.loads(p.read_text());
 for x in d['files']:assert sha(ROOT/x['path'])==x['sha256'],x['path']
 return {'path':str(rel),'sha256':sha(p),'fileCount':len(d['files']),'allFilesExact':True}

def main():
 out=ROOT/OWN;out.mkdir(parents=True,exist_ok=False)
 freezes=[verifyfreeze(OLD/'author-positive-profile-remediation.final.freeze.json'),verifyfreeze(AUTH/'author-checkpoint.freeze.manifest.json')]
 oldbytes=(ROOT/OLD/'positive.eighteen.remediated-author.candidates.json').read_bytes();before=json.loads(oldbytes);after=copy.deepcopy(before)
 after.update({'reviewId':'biologie-ni-one-positive-case-functional-witness-author-20261006-v2','reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'Codex EDA first-case author amendment; independent Root targeted case follow-up pending'})
 row=next(x for x in after['goals'] if x['goalId']==EDA);case=next(x for x in row['profile']['applicationCaseBriefs'] if x['id']==CASE);prior=copy.deepcopy(case);case.update(NEW)
 row['reason']='AUTHOR_ONLY_EDA_FIRST_CASE_FUNCTIONAL_WITNESS: Separate six-field amendment to the first case supplies a fictional existing beetle variant, dark-substrate camouflage, reduced bird detection, inheritance, differential reproductive success and frequency rise. Expected performance expressly requires the functional/selection connection. Root targeted independent follow-up is pending; no goal, description, source or image edits and no actual learner observation.'
 row['dissent']=['Root independent P13 follow-up found a new specific first-case functional-witness HOLD; this six-field authored amendment is pending Root targeted independent resolution.','Human approval and trial remain unestablished; all cases are fictional authored E1/G1 AI candidates, not actual learner or laboratory observations.']
 deltas=[{'goalId':EDA,'caseId':CASE,'field':f'profile.applicationCaseBriefs[0].{k}','before':prior[k],'after':case[k]} for k in NEW];assert len(deltas)==6
 for a,b in zip(before['goals'],after['goals']):
  if a['goalId']!=EDA:assert a==b
  else:
   p=copy.deepcopy(b['profile']);p['applicationCaseBriefs'][0]=a['profile']['applicationCaseBriefs'][0];assert p==a['profile']
 cfg=json.loads((ROOT/OLD/'positive.eighteen.remediated-author.config.json').read_text());cfg['reviewId']=after['reviewId'];cfg['reviewPath']=str(OWN/'positive.eighteen.first-case-amended-author.review.jsonl');cfg['scope']['label']='Author-only six-field EDA first-case functional-witness amendment,17 entire inner profiles preserved; independent targeted first-case follow-up pending'
 (out/'positive.eighteen.before.exact.candidates.snapshot.json').write_bytes(oldbytes)
 write(out/'positive.eighteen.first-case-amended-author.candidates.json',after);write(out/'positive.eighteen.first-case-amended-author.config.json',cfg)
 write(out/'exact-six-first-case-field-deltas.json',{'schemaVersion':1,'goalId':EDA,'caseId':CASE,'changedFields':6,'otherEntireProfilesExact':17,'otherCaseBriefsExact':35,'deltas':deltas,'independentFindingResolutionClaim':False})
 write(out/'complete-eda-profile-and-both-cases.author-input.json',{'schemaVersion':1,'goalId':EDA,'profile':row['profile'],'independentTargetedFollowUpPending':True,'humanApproval':False,'humanTrial':False})
 for rel in ['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/src/landscapeTypes.ts']:
  p=CODE/rel;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/rel,p)
 for rel,t in {'app/node_modules':ROOT/'app/node_modules','app/public':ROOT/'tmp/biologie-ni-ten-current-native-author-candidate-v2-native-root/app/public','contracts':ROOT/'contracts',str(AUTH):ROOT/AUTH,str(OWN):out,cfg['reviewCriteriaPath']:ROOT/cfg['reviewCriteriaPath']}.items():
  p=CODE/rel;p.parent.mkdir(parents=True,exist_ok=True);p.symlink_to(t,target_is_directory=t.is_dir())
 cfgpath=str(OWN/'positive.eighteen.first-case-amended-author.config.json');cpath=str(OWN/'positive.eighteen.first-case-amended-author.candidates.json');tsx=str(CODE/'app/node_modules/.bin/tsx');m=str(CODE/'app/scripts/materializePositiveGoalEvidenceCandidates.ts');checker=str(CODE/'app/scripts/positiveGoalEvidenceReview.ts')
 receipts=[]
 for i,cmd in enumerate([[tsx,m,'--config',cfgpath,'--candidates',cpath,'--write'],[tsx,m,'--config',cfgpath,'--candidates',cpath],[tsx,checker,'--config='+cfgpath,'--mode=check']],1):
  start=datetime.now(timezone.utc).isoformat();p=subprocess.run(cmd,cwd=CODE,capture_output=True);s=out/f'native-positive-{i}.stdout.txt';e=out/f'native-positive-{i}.stderr.txt';s.write_bytes(p.stdout);e.write_bytes(p.stderr);receipts.append({'argv':cmd,'cwd':str(CODE),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'exitCode':p.returncode,'stdoutPath':str(s.relative_to(ROOT)),'stdoutSHA256':sha(s),'stderrPath':str(e.relative_to(ROOT)),'stderrSHA256':sha(e),'scriptSHA256':sha(cmd[1])});write(out/'actual-native-three-checks.receipt.json',{'checks':receipts,'independentTargetedFollowUpPending':True,'activeWrites':0});print(json.dumps({'step':i,'exitCode':p.returncode,'stdout':p.stdout.decode()[:1200]}),flush=True);assert p.returncode==0
 oldr={x['goalId']:x for x in map(json.loads,(ROOT/OLD/'positive.eighteen.remediated-author.review.jsonl').read_text().splitlines())};newr=list(map(json.loads,(out/'positive.eighteen.first-case-amended-author.review.jsonl').read_text().splitlines()));proof=[]
 for x in newr:
  a=oldr[x['goalId']]
  for k in ['goalFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint']:assert a[k]==x[k]
  assert x['status']=='needs_human_review' and x['reviewAuthority']=='ai_candidate' and x['evidenceLevel']=='E1' and x['maximumClaimScope']=='G1'
  if x['goalId']!=EDA:assert a['profile']==x['profile'] and a['profileFingerprint']==x['profileFingerprint']
  else:assert a['profileFingerprint']!=x['profileFingerprint']
  proof.append({'goalId':x['goalId'],'profileFingerprintBefore':a['profileFingerprint'],'profileFingerprintAfter':x['profileFingerprint'],'entireInnerProfileExact':a['profile']==x['profile'],'allGoalInputCriteriaBindingsExact':True})
 schemas=[]
 for rel,values in [('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',[cfg]),('contracts/goal-evidence/v2/goal-evidence-profile.schema.json',newr)]:
  v=Draft202012Validator(json.loads((ROOT/rel).read_text()),format_checker=FormatChecker());[v.validate(x) for x in values];schemas.append({'schema':rel,'schemaSHA256':sha(ROOT/rel),'passedObjects':len(values)})
 write(out/'actual-current-bindings-and-seventeen-profile-protection.json',{'schemaVersion':1,'records':18,'changedInnerProfiles':1,'unchangedWholeInnerProfiles':17,'unchangedWholeCaseBriefs':35,'allGoalInputCriteriaBindingsExact':True,'approved':0,'needsHumanReview':18,'allAuthority':'ai_candidate','allEvidenceLevel':'E1','allMaximumClaimScope':'G1','rows':proof,'schemas':schemas,'independentFollowUpPending':True})
 final=[verifyfreeze(OLD/'author-positive-profile-remediation.final.freeze.json'),verifyfreeze(AUTH/'author-checkpoint.freeze.manifest.json')];assert freezes==final;write(out/'input-frozen-v1-and-author-556-preserved.actual.json',{'schemaVersion':1,'before':freezes,'after':final,'all597HistoricalFilesExact':True,'noDescriptionOrSourceOrImageWrite':True})
 shutil.copy2(CODE/'prepare_and_check_amendment.py',out/'prepare_and_check_amendment.py')
 print('Author amendment prepared; README and final freeze next.')

if __name__=='__main__':main()
