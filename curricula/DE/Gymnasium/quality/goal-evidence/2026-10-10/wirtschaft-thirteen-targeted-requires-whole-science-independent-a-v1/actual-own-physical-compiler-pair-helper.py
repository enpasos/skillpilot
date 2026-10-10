from pathlib import Path
import json,shutil,tempfile,subprocess,time,hashlib,os
R=Path('/home/enpasos/projects/skillpilot');O=Path('/tmp/economics-thirteen-requires-independent-a-output-path.txt').read_text().strip();O=Path(O);CAP=Path(tempfile.mkdtemp(prefix='economics-thirteen-requires-independent-a-'))/'capsule';CAP.mkdir()
def safe(p):
 d=CAP/p.relative_to(R);d.parent.mkdir(parents=True,exist_ok=True);assert d.resolve().is_relative_to(CAP.resolve()) and not d.is_symlink();assert not d.exists() or not d.samefile(p);shutil.copyfile(p,d)
copied=[]
for top,dirs,files in os.walk(R/'curricula'):
 dirs[:]=[d for d in dirs if d!='quality']
 for fn in files:
  if fn.endswith('.json') or fn.endswith('.json.snapshot'):
   p=Path(top)/fn;safe(p);copied.append(p)
for p in [R/'app/scripts/applicabilityCompiler.ts',R/'app/scripts/memoryCardReviewConfigDiscovery.ts',R/'app/package.json',R/'app/src/utils/jurisdictionMetadata.ts']:safe(p);copied.append(p)
reg=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';safe(reg);copied.append(reg);j=json.loads(reg.read_text())
configs=list((R/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'))+[R/s['memoryReviewConfigPath'] for s in j['subjects']]
for p in configs:
 safe(p);copied.append(p);c=json.loads(p.read_text());rp=R/c['reviewPath'];safe(rp);copied.append(rp)
(CAP/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
helper=CAP/'app/scripts/independentThirteenCurrentRequiresCompilerPair.mts';helper.write_text("import{buildApplicabilityCompilation}from'./applicabilityCompiler.ts';const j=buildApplicabilityCompilation();console.log(JSON.stringify(j.reports.find(r=>r.landscapeId==='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'),null,2));\n")
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();args=[node,str(CAP/'app/node_modules/tsx/dist/cli.mjs'),str(helper)]
def run(frame):
 a=O/f'actual-{frame}-private-native-compiler.stdout.json';b=O/f'actual-{frame}-private-native-compiler.stderr.txt';t=time.monotonic()
 with a.open('x')as out,b.open('x')as err:r=subprocess.run(args,cwd=CAP/'app',stdout=out,stderr=err)
 (O/f'actual-{frame}-private-native-compiler.command-exit.json').write_text(json.dumps({'argv':args,'cwd':str(CAP/'app'),'actualExit':r.returncode,'seconds':round(time.monotonic()-t,3),'privateCapsule':str(CAP),'unchangedCompilerWholeSHA256':hashlib.sha256((CAP/'app/scripts/applicabilityCompiler.ts').read_bytes()).hexdigest()},indent=2)+'\n');assert r.returncode==0;return json.loads(a.read_text())
before=run('before-thirteen');active=json.loads((O/'actual-current-native-source-compiler.stdout.json').read_text());selected={r['goalId'] for r in active['goals']};assert [g for g in before['goals'] if g['goalId'] in selected]==active['goals'];assert before['summary']==active['summary'] and before['findings']==active['findings']
can=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';candidate=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-regular06-09-thirteen-observed-knowledge-gate-remedies-INERT-root-v21/whole678-only-thirteen-observed-requires-remedies.INERT-candidate.json';d=CAP/can.relative_to(R);assert d.resolve().is_relative_to(CAP.resolve()) and not d.is_symlink() and not d.samefile(can);d.write_bytes(candidate.read_bytes());after=run('after-thirteen');deltas=[]
b={g['goalId']:g for g in before['goals']}
for g in after['goals']:
 old=b[g['goalId']]
 if old!=g:deltas.append({'goalId':g['goalId'],'wholeCurrentBefore':old,'wholeInertAfter':g,'compiledJurisdictionBefore':old['compiledApplicability'].get('jurisdiction',[]),'compiledJurisdictionAfter':g['compiledApplicability'].get('jurisdiction',[]),'hasSourceJurisdictionDelta':old['compiledApplicability']!=g['compiledApplicability']})
guards=[{'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(set(copied))]
(O/'actual-two-private-compiler-frames-and-whole-derived-deltas.READONLY.json').write_text(json.dumps({'privateCapsule':str(CAP),'beforeSummary':before['summary'],'afterSummary':after['summary'],'actualWholeCurrentBaselineEquivalentToProduction':True,'wholeDeltaRows':deltas,'afterFindings':after['findings'],'physicalWholeInputEndBindings':guards,'noSourceRoleMetadataRepairAuthorisedByThisTechnicalObservation':True,'sourceScienceReapproved':False,'newHumanOrM7Approval':False},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'before':before['summary'],'after':after['summary'],'compiledJurisdictionChanged':sum(x['hasSourceJurisdictionDelta']for x in deltas),'allEvidenceDeltaRows':len(deltas),'physicalCAP':str(CAP)}))
