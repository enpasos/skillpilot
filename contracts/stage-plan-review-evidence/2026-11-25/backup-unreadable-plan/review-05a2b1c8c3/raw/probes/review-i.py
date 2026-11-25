from pathlib import Path
import concurrent.futures,hashlib,subprocess,datetime,json
r=Path.cwd(); output=r/'tmp/e1-handover/reviews/backup-unreadable-plan'; raw=output/'raw'
q=(r/'tmp/e1-handover/claude-antworten.md').read_text().split('**Questions, each with a verdict and evidence:**',1)[1].split('Bound: one round',1)[0]
prompt='Independent blind technical reviewer, no authorship, single round. Read only existing project source at 05a2b1c8c3, implementation diff 1001aa2c7f..ba1c911e98, plus relevant reader, save, backup, UI and tests in this existing checkout. No repository changes, external network, running builds or reading other answers or tmp or handover. Depth over speculative claims. Analyze independently in German with file/line evidence for each question; distinguish your static findings from verification still requiring real runtime. The coordinator runs native positive and negative controls separately. Service means LearnerService and LearnerLearningPlanService. Avoid retired terminology. Eight questions from owner of review:\n'+q
(raw/'review-input.txt').write_text(prompt)
def do(t):
 tag,model=t; out=output/('reviewer-'+tag+'.original.md'); cmd=['codex','exec','--ignore-user-config','--ignore-rules','--skip-git-repo-check','--ephemeral','-C',str(r),'--sandbox','read-only','--model',model,'-c','model_reasoning_effort="ultra"','--color','never','--output-last-message',str(out),'--json','--','-']
 now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
 start=now()
 with (raw/(tag+'.events.jsonl')).open('w') as f,(raw/(tag+'.stderr.log')).open('w') as e:
  rc=subprocess.run(cmd,input=prompt,text=True,stdout=f,stderr=e).returncode
 record={'reviewer':tag,'model':model,'reasoningEffort':'ultra','start':start,'end':now(),'exitCode':rc,'responseSha256':hashlib.sha256(out.read_bytes()).hexdigest() if out.is_file() else None,'promptSha256':hashlib.sha256(prompt.encode()).hexdigest()}
 (raw/(tag+'.receipt.json')).write_text(json.dumps(record,indent=2)+'\n')
 print(tag,rc,flush=True)
with concurrent.futures.ThreadPoolExecutor(2) as pool:list(pool.map(do,[('a','gpt-6.1-sol'),('b','gpt-6.2-astra')]))
