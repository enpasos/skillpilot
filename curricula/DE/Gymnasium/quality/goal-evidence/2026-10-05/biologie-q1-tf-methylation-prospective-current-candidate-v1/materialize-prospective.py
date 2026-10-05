# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,re,shutil,subprocess,unicodedata
ROOT=Path(__file__).resolve().parents[7];OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
META=json.loads((OWN/'prospective-paths.json').read_text());ISO=Path(META['isolationRoot']);TF,METH=META['goalIds'];NOW=datetime.now(timezone.utc).isoformat()
PRIOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1'
def read(p):return json.loads(Path(p).read_text())
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def detach(p):
 p=Path(p)
 if p.is_symlink():q=p.resolve();p.unlink();shutil.copy2(q,p)
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFC',s or '').strip())
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def fp(g,rule):
 d=g.get('dimensionTags',{});p={'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey',''),'title':norm(g['title']),'titleEn':norm(g.get('titleEn')),'description':norm(g['description']),'descriptionEn':norm(g.get('descriptionEn')),'phase':norm(d.get('phase')),'area':norm(d.get('area')),'topicCode':norm(d.get('topicCode')),'nodeKind':norm(g.get('nodeKind'))}
 return 'sha256:'+hashlib.sha256(stable(p).encode()).hexdigest()
baseline=read(ISO/REL/'baseline-central.report.json');bio=next(s for s in baseline['subjects'] if s['subject']=='biologie')
assert bio['strictComplete']==38 and bio['denominator']==363
assert len(read(ISO/REL/'baseline-full.book-model.json')['pages'])==363
shutil.copy2(ISO/REL/'baseline-central.report.json',OWN/'baseline-central.report.json')
shutil.copy2(ISO/REL/'baseline-full.book-model.json',OWN/'baseline-full.book-model.json')
candidate=read(OWN/'prospective-canonical.snapshot.json');by={g['id']:g for g in candidate['goals']}
write(ISO/META['canonicalPath'],candidate)
write(ISO/META['atlasPath'],read(OWN/'prospective-source-atlas.inputs.json'))
source_root=ISO/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas'
for p in source_root.rglob('*'):
 if p.is_file():detach(p)
# ALL unrelated full A/M rows keep their exact bytes. Replace only TF and append methylation.
future_configs={}
for lane,field,rule in [('atomicity','semanticAtomicityConfigPath','semantic-atomicity-v1'),('memory','memoryReviewConfigPath','memory-card-review-v1')]:
 cfg=read(ROOT/META['bioConfig'][field]);oldpath=cfg['reviewPath'];oldbytes=(ROOT/oldpath).read_bytes();lines=oldbytes.splitlines(keepends=True)
 def record(g):
  common={'schemaVersion':1,'reviewId':cfg['reviewId'],'ruleVersion':rule,'landscapeId':candidate['landscapeId'],'goalId':g['id'],'fingerprint':fp(g,rule),'reviewedAt':NOW,'reviewer':'Codex prospective TF/methylation candidate author'}
  if lane=='atomicity':common.update(status='atomic',semanticAtomic=True,reason=('One supplied eukaryotic transcription-factor mechanism: regulatory binding influences transcription; DNA marking is a distinct preserved atom.' if g['id']==TF else 'One supplied eukaryotic DNA-marking/transcription mechanism with contextual matched data; interpreting those data demonstrates this same mechanism, without inheritance or histone modification.'))
  else:common.update(status='no_memory_needed',memoryUseful=False,reason='Supplied gene models, defined factor/mark effects and matched mRNA findings assess causal explanation and fresh transfer. No independent uncued fact catalogue or fixed recall performance is required; no card/deck is authored.')
  return common
 output=[];retained=0
 for line in lines:
  row=json.loads(line)
  if row['goalId']==TF:output.append((json.dumps(record(by[TF]),ensure_ascii=False,separators=(',',':'))+'\n').encode())
  else:output.append(line);retained+=1
 output.append((json.dumps(record(by[METH]),ensure_ascii=False,separators=(',',':'))+'\n').encode())
 newpath=REL+f'/full-{lane}.candidate.review.jsonl';(OWN/f'full-{lane}.candidate.review.jsonl').write_bytes(b''.join(output));(ISO/newpath).write_bytes(b''.join(output))
 cfg['reviewPath']=newpath
 # Review files and real cards are preserved; the two no-memory decisions create no nodes.
 configpath=REL+f'/full-{lane}.candidate.config.json';write(OWN/f'full-{lane}.candidate.config.json',cfg);write(ISO/configpath,cfg);future_configs[field]=configpath
 write(OWN/f'{lane}-unrelated-row-preservation.receipt.json',{'oldPath':oldpath,'oldSHA256':sha(ROOT/oldpath),'oldRecords':len(lines),'newRecords':len(output),'replacedGoalIds':[TF],'appendedGoalIds':[METH],'allOtherRowsByteExact':True,'retainedByteExactRecords':retained,'authorCandidateNotIndependentApproval':True})

tfp=copy.deepcopy(next(g for g in read(PRIOR/'positive-evidence.candidates.json')['goals'] if g['goalId']==TF))
comp=read(OWN/'methylation-v3-inner-preservation.candidate.json')
methp={'goalId':METH,'reason':'Inactive author preservation candidate with exact v3 DE/EN and INNER profile; current source/view/image/assessment and fresh independent D/P/V approval remain pending.','evidenceLevel':'E1','maximumClaimScope':'G1','dissent':['Fresh current independent D/P/V and source-component acceptance are pending.'],'profile':comp['profile']}
pos={'schemaVersion':2,'authoringContract':'positive-goal-evidence-candidates-v2','reviewId':'biologie-q1-tf-methylation-prospective-current-candidate-v1','reviewedAt':NOW,'reviewer':'Codex prospective candidate author','goals':[tfp,methp]}
# Native authoring contract uses version 2 with per-goal INNER v2 profiles.
pos['schemaVersion']=read(PRIOR/'positive-evidence.candidates.json')['schemaVersion'];pos['authoringContract']=read(PRIOR/'positive-evidence.candidates.json')['authoringContract']
write(OWN/'positive-evidence.candidates.json',pos);write(ISO/REL/'positive-evidence.candidates.json',pos)
pcfg=read(PRIOR/'positive.validation-only.config.json');pcfg.update(reviewId=pos['reviewId'],landscapePath=META['canonicalPath'],reviewPath=REL+'/positive.validation-only.review.jsonl',semanticKindLedgerPath=META['semanticPath']);pcfg['scope']={'label':'Two prospective ordinary goals, author validation only, no D/P approval','goalIds':[TF,METH]}
write(OWN/'positive.validation-only.config.json',pcfg);write(ISO/REL/'positive.validation-only.config.json',pcfg)
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');b=next(s for s in registry['subjects'] if s['subject']=='biologie');b.update(future_configs)
write(OWN/'prospective-central.registry.candidate.json',registry);write(ISO/REL/'prospective-central.registry.candidate.json',registry)
book=read(ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.json');book['outputPath']=REL+'/prospective-full.book-model.json'
write(OWN/'book.config.json',book);write(ISO/REL/'book.config.json',book)
batch=read(ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-prospective-book-current-v1/batch.config.json')
batch.update(batchId='biologie-q1-tf-methylation-prospective-current-20261005-v1',bookId='de-gym-biologie-q1-tf-methylation-prospective-current-20261005-v1',title='Biologie Q1 – Transkriptionsfaktoren und DNA-Methylierung, zwei erhaltene Komponenten',baseGoalBookConfigPath=REL+'/book.config.json',goalIds=[TF,METH],outputDirectory=REL+'/native-finalbook')
write(OWN/'batch.config.json',batch);write(ISO/REL/'batch.config.json',batch)
vbase=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review'
visuals=[{'id':TF,'dir':'biologie-q1-transcription-factor-candidate-20261005-v1','hash':'sha256:b8846d373a278881915668f9d23a5fd8e28cec8d2660d53d05ea4aebac3ccda6','description':'Comicartiges Modell eines aktivierenden Transkriptionsfaktors an regulatorischer DNA; die Polymerase am getrennten Startbereich wird im gezeigten Modell gefördert.','alt':'Modell eines aktivierenden Transkriptionsfaktors bei einem eukaryotischen Gen. Der Faktor bindet an einen regulatorischen DNA-Bereich und fördert im gezeigten Modell die Polymerase am getrennten Startbereich. Ein Pfeil führt zu mehreren einzelnen mRNA-Strängen mit der Beschriftung „mehr mRNA“. Die Abbildung zeigt ausdrücklich ein aktivierendes Beispiel.'},
 {'id':METH,'dir':'biologie-q1-dna-methylation-candidate-20261005-v1','hash':'sha256:3b70658a72039fa9502ec988331005b1cfd8bc4228af56b696d68e6e11da3623','description':'Comicartiger Vergleich gleicher DNA-Basenfolge mit verschieden vielen Methylierungsmarken am Promotor und unterschiedlicher mRNA-Menge im gezeigten Promotormodell.','alt':'Zwei schematische DNA-Abschnitte mit gleicher Basenfolge zeigen jeweils Promotor und Gen. Im oberen Promotormodell sind zwei orange Methylierungsmarken und drei mRNA-Stränge dargestellt, im unteren fünf Markierungen und ein mRNA-Strang. Der Hinweis „In diesem Promotormodell“ begrenzt den dargestellten Zusammenhang zwischen Promotormethylierung und Transkription auf dieses Beispiel; er behauptet keine allgemeine Abschaltung jedes methylierter Gens.'}]
for v in visuals:
 image=vbase/v['dir']/'candidate-v1.png';request=read(vbase/v['dir']/'generation-request-v1.json');assert sha(image)==v['hash']
 prompt=OWN/(v['id']+'.original-imagegen.prompt.txt');prompt.write_text(request['prompt'])
 # The native helper writes exactly prompt.de.md, not a goalid.prompt.de.md leaf.
 for rel in [f'curricula/DE/Gymnasium/visualizations/biologie/{v["id"]}/{v["id"]}.png',f'curricula/DE/Gymnasium/visualizations/biologie/{v["id"]}/prompt.de.md',f'curricula/DE/Gymnasium/visualizations/biologie/{v["id"]}/image-reconstruction-prompt.de.md',f'app/public/assets/goal-visualizations/biologie/{v["id"]}/{v["id"]}.png',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{v["id"]}/{v["id"]}.png']:
  detach(ISO/rel)
 v['prepareArgs']=['node','scripts/prepare_goal_visualization.mjs','--goal',v['id'],'--landscape',META['canonicalPath'],'--subject','biologie','--provider','OpenAI / ChatGPT-Codex built-in image_gen','--review-status','pilot']
 v['importArgs']=['node','scripts/import_goal_visualization.mjs','--goal',v['id'],'--image',str(image),'--landscape',META['canonicalPath'],'--subject','biologie','--lang','de','--provider','OpenAI / ChatGPT-Codex built-in image_gen','--review-status','pilot','--license','CC-BY-4.0','--description',v['description'],'--alt-text',v['alt'],'--prompt',str(prompt)]
write(OWN/'native-import-plan.json',{'cwd':str(ISO),'visuals':visuals,'currentVBindingAcceptance':'pending fresh independent exact new goal/title/alt binding','pixelsReusedFromActualApprovedIndependentCandidates':True,'noImageGeneration':True,'activeWrites':0})
print(json.dumps({'status':'prospective_inputs_materialized','futureGoals':442,'futureDenominator':364,'baselineStrict':38,'AandMCandidateOnly':True,'nativeImportReady':True,'activeWrites':0}))
