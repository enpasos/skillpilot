import json,pathlib,shutil,hashlib,subprocess,os,time
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OLD=pathlib.Path('/dev/shm/powi-native-focus-verification-20261107');OUT=pathlib.Path('/dev/shm/powi-native-validated-20261107');FROZEN=OUT/'frozen-root'
J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();H=lambda b:hashlib.sha256(b).hexdigest()
ps=subprocess.check_output(['ps','-eo','pid,ppid,stat,args'],text=True)
live=[]
for line in ps.splitlines()[1:]:
 parts=line.split(None,3)
 if len(parts)<4:continue
 args=parts[3]
 if ('/bin/java ' in args and ('PowiNative' in args or 'GradleDaemon' in args)) or ('python' in args and 'run-native.py' in args and 'bash -c' not in args):live.append(line)
(OUT/'initial-process-check.json').write_bytes(J({'observedAtEpoch':time.time(),'liveRelevantProcesses':live,'oldBranchCandidateResultExists':(OLD/'branch-candidate.json').exists(),'oldExecutionFileIsNotProcessEvidence':True}))
assert not live,live
frozen_entries=[]
for directory,dirs,files in os.walk(ROOT/'curricula'):
 rel=pathlib.Path(directory).relative_to(ROOT)
 if rel==pathlib.Path('curricula/DE/Gymnasium'):dirs[:]=[d for d in dirs if d!='quality']
 for name in files:
  if not (name.endswith('.json') or name.endswith('.json.snapshot')):continue
  p=pathlib.Path(directory)/name;target=FROZEN/p.relative_to(ROOT);target.parent.mkdir(parents=True,exist_ok=True);b=p.read_bytes();target.write_bytes(b)
  frozen_entries.append({'path':str(p.relative_to(ROOT)),'sha256':H(b),'bytes':len(b),'origin':'current-metadata-snapshot'})
# Preserve the exact prior 21 catalog + 6 extra snapshots; never substitute current Math e4de.
for mf in ['frozen-catalog-inputs.json','frozen-extra-inputs.json']:
 for e in json.loads((OLD/mf).read_text()):
  p=OLD/'frozen-inputs'/e['path'];b=p.read_bytes();assert H(b)==e['sha256'];target=FROZEN/e['path'];target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b)
  frozen_entries=[x for x in frozen_entries if x['path']!=e['path']];frozen_entries.append({'path':e['path'],'sha256':H(b),'bytes':len(b),'origin':'prior-exact-frozen-input'})
(OUT/'frozen-inputs-manifest.json').write_bytes(J(sorted(frozen_entries,key=lambda x:x['path'])))
shutil.copyfile(OLD/'candidate.json',OUT/'candidate.json')
shutil.copyfile(OLD/'dependencies-classpath.txt',OUT/'dependencies-classpath.txt')
print(json.dumps({'frozenFiles':len(frozen_entries),'frozenBytes':sum(x['bytes'] for x in frozen_entries),'prior21MathRemainsDa4724':True}))
OWNER='51b60137-46e8-5498-973e-ea38bb32f327';OVERVIEW='a0e13c56-c25f-4742-9272-3a1a603ee52e'
reqs=[{'key':'canonical-direct-owner-empty-PC','selectedCurriculum':OWNER,'personalCurriculum':{},'detailed':True}]
for juris in ['DE-BY','DE-HE']:
 reqs.append({'key':juris+'-CrossStage-G9-GK','selectedCurriculum':OVERVIEW,'personalCurriculum':{OVERVIEW:{'selected':True,'filterId':juris,'stage':'CrossStage','durationModel':'G9'},OWNER:{'selected':True,'filterId':'GK'}},'detailed':True})
(OUT/'requests.json').write_bytes(J(reqs))
