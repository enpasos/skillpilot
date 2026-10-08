"""Apache-2.0. Exact current20 selection and genuine native BEFORE image preparation only."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil,re
ROOT=Path(__file__).resolve().parents[7];OWN=Path(__file__).resolve().parent
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
ids=read(OWN/'goal-ids.json');originals=read(OWN/'whole-goals.original.json');canonical_before=(ROOT/CAN).read_bytes();c=read(ROOT/CAN);by={g['id']:g for g in c['goals']};assert all(g==by[g['id']]for g in originals)
report=Path('tmp/economics-m7-root-q2-labour-twelve-integration-current.actual.json');s=next(s for s in read(ROOT/report)['subjects']if s['subject']=='wirtschaftswissenschaften');assert s['strictComplete']==125;assert set(ids)<=set(s['currentGoalIds'])-set(s['strictCompleteGoalIds'])
out=OWN/'native-image-preparation';out.mkdir(exist_ok=False);runs=[]
for gid in ids:
 cmd=['node','scripts/prepare_goal_visualization.mjs',gid,'--landscape',str(CAN),'--subject','wirtschaftswissenschaften','--lang','de','--provider','OpenAI Codex image_gen','--review-status','pilot'];start=datetime.now(timezone.utc).isoformat();r=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True);end=datetime.now(timezone.utc).isoformat();dest=out/gid;dest.mkdir()
 for suffix,t in [('stdout',r.stdout),('stderr',r.stderr)]:
  with(dest/('prepare.'+suffix+'.txt')).open('x')as f:f.write(t)
 assert r.returncode==0,r.stdout+r.stderr
 source_meta=ROOT/re.search(r'^Metadata: (.+)$',r.stdout,re.M)[1];source_prompt=ROOT/re.search(r'^Prompt: (.+)$',r.stdout,re.M)[1]
 for source in [source_meta,source_prompt]:shutil.copy2(source,dest/source.name);assert sha(source)==sha(dest/source.name)
 runs.append({'goalId':gid,'startedAt':start,'completedAt':end,'command':cmd,'exitCode':0,'metadataPath':str((dest/source_meta.name).relative_to(ROOT)),'metadataSha256':sha(dest/source_meta.name),'promptPath':str((dest/source_prompt.name).relative_to(ROOT)),'promptSha256':sha(dest/source_prompt.name)})
assert canonical_before==(ROOT/CAN).read_bytes()
v={'role':'author_native_before_image_preparation','createdAt':datetime.now(timezone.utc).isoformat(),'currentStrictBaseline':125,'authoritativeCurrentAtomicDenominator':303,'selectedCurrentUnclosedGoals':20,'provider':'OpenAI Codex image_gen','preparedCount':20,'commands':runs,'currentCanonicalUnchangedBeforeAfter':True,'wholeOriginalGoalsParsed':20,'wholeOriginalGoalsSha256':sha(OWN/'whole-goals.original.json'),'strictMaskReportPath':str(report),'strictMaskReportSha256':sha(ROOT/report),'independentReviewClaim':False,'imageGenerationIsApproval':False,'activeWrites':0,'newStrictClosures':0}
with(out/'native-twenty-before-generation.actual.json').open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
print('20 exact current unclosed law/contract goals;20 genuine native BEFORE preparations PASS;0 live writes/strict.')
