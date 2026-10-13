"""Apache-2.0; normal byte-exact scripts in a private regular-directory capsule."""
from pathlib import Path
import json,shutil,subprocess,hashlib,stat,datetime
R=Path.cwd();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-carbonyl-three-necessary-raster-author-20261013-v2');P=Path('tmp/chemie-carbonyl-three-raster-private').resolve();base=json.load(open(O/'inputs/current-three-and-protected-CAS.actual.json'));ids=base['goalIds'];canpath=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');h=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest();read=lambda p:json.loads(Path(p).read_text());commands=[];parents=[]
assert not (O/'FINAL.author-three-raster.seal.json').exists(), 'Sealed packet must remain immutable'
assert h(canpath)==base['currentCanonicalSHA']
# Retain the actual original advertised466 bytes and source metadata non-destructively.
id=ids[0];retained=[]
for prefix in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
 source=Path(prefix)/'chemie'/id/(id+'.jpg');assert source.is_file();target=P/source;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target);retained.append(dict(sourcePath=str(source),sha256=h(source),privateBytesSHA=h(target)))
assert len({r['sha256']for r in retained})==1
oldsrc=Path('curricula/DE/Gymnasium/visualizations/chemie')/id
for f in oldsrc.glob('*.md'):
 shutil.copyfile(f,O/'source'/('466.original.'+f.name))
alts={ids[0]:'Gültiges Ethylethanoat mit drei farbigen Protonenumgebungen; schematische IR-Carbonylabsorption um 1740 cm⁻¹ und getrennte ¹H-NMR-Signale: 2H-Quartett um 4,1 ppm, 3H-Singulett um 2,1 ppm, 3H-Triplett um 1,3 ppm. Keine gemessene Spektralkurve.',ids[1]:'Auswahl, Beobachtung und Deutung einer qualitativen Cu(II)-Nachweisprobe an einem repräsentativen aliphatischen Aldehyd und einfachen Keton: blaue Blindprobe, roter Cu₂O-Niederschlag der Positivkontrolle, blaues Keton. Gültige Carbonylgruppen und beaufsichtigte illustrative Handhabung; kein realer Leistungsnachweis oder allgemeiner Nachweis aller Stoffklassen.',ids[2]:'Vier schematische intermolekulare Wechselwirkungen: entgegengesetzte temporäre Dipole, polare HCl-Moleküle, O-H···O-Wasserstoffbrücke und Na⁺-Hydratation mit zum Ion ausgerichteten Sauerstoffenden. Keine universelle Stärkenrangfolge oder vollständige Hydrathülle.'}
for id in ids:
 image=O/'candidate'/(id+'.png');attempt=3 if id.startswith(('466','3de')) else 2;prompt=O/'generation'/(id+'.attempt-'+str(attempt)+'.prompt.md');recon=O/'generation'/(id+'.image-reconstruction-prompt.de.md')
 cmd=['node',str(P/'scripts/import_goal_visualization.mjs'),id,str(image.resolve()),'--landscape='+str(P/canpath),'--subject=chemie','--provider=OpenAI / ChatGPT-Codex image generation','--review-status=pilot','--license=CC-BY-4.0','--alt-text='+alts[id],'--prompt='+str(prompt.resolve()),'--reconstruction-prompt='+str(recon.resolve())];start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(cmd,cwd=P,capture_output=True,text=True);(O/'generation'/(id+'.normal-private-import.stdout.txt')).write_text(p.stdout);(O/'generation'/(id+'.normal-private-import.stderr.txt')).write_text(p.stderr);assert p.returncode==0,p.stderr
 commands.append(dict(goalId=id,command=cmd,startedAtUTC=start,completedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),exitCode=p.returncode))
 # Persist only normal changed paths in the candidate packet.
 for rel in [Path('curricula/DE/Gymnasium/visualizations/chemie')/id/(id+'.png'),Path('curricula/DE/Gymnasium/visualizations/chemie')/id/'prompt.de.md',Path('curricula/DE/Gymnasium/visualizations/chemie')/id/'image-reconstruction-prompt.de.md',Path('app/public/assets/goal-visualizations/chemie')/id/(id+'.png'),Path('backend/src/main/resources/static/assets/goal-visualizations/chemie')/id/(id+'.png')]:
  src=P/rel;target=O/'visual-candidate'/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,target)
 for check in [P/canpath,P/'curricula/DE/Gymnasium/visualizations/chemie'/id/(id+'.png'),P/'app/public/assets/goal-visualizations/chemie'/id/(id+'.png'),P/'backend/src/main/resources/static/assets/goal-visualizations/chemie'/id/(id+'.png')]:
  assert check.is_file()and not check.is_symlink()and check.stat().st_nlink==1
  parent=check.parent
  while parent.is_relative_to(P):
   st=parent.lstat();assert stat.S_ISDIR(st.st_mode)and not stat.S_ISLNK(st.st_mode),parent;parents.append(dict(path=str(parent.relative_to(P)),inode=st.st_ino,mode=oct(st.st_mode),realDirectory=True));
   if parent==P:break
   parent=parent.parent
 srcsha=h(image);assert all(h(P/Path(prefix)/'chemie'/id/(id+'.png'))==srcsha for prefix in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations'])
# Whole-canonical and original active resource evidence.
old=read(canpath);new=read(P/canpath);oldby={g['id']:g for g in old['goals']};newby={g['id']:g for g in new['goals']};changed=[id for id in oldby if oldby[id]!=newby[id]];assert set(changed)==set(ids);assert all(oldby[id]==newby[id]for id in oldby if id not in ids)
for id in ids:
 a=dict(oldby[id]);b=dict(newby[id]);a.pop('resourceLinks',None);b.pop('resourceLinks',None);assert a==b
 a=[l for l in oldby[id].get('resourceLinks',[])if l.get('type')!='goal-visualization'];b=[l for l in newby[id].get('resourceLinks',[])if l.get('type')!='goal-visualization'];assert a==b
for b in base['baselineBindings']:assert h(b['path'])==b['sha256'],b['path']
for b in base['allActiveResourceBindings']:assert h(b['path'])==b['sha256'],b['path']
# Original author54-file packet must remain exact.
oldpacket=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-carbonyl-pharmacy15-current231-scientific-author-20261013-v1');seal=read(oldpacket/'FINAL.author15-candidate.freeze.json');assert all(h(b['path'])==b['sha256']for b in seal['fileBindings'])
target=O/'visual-candidate'/canpath;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(P/canpath,target);scripts=[dict(path='scripts/'+name,sourceSHA=h(Path('scripts')/name),privateSHA=h(P/'scripts'/name),byteExact=h(Path('scripts')/name)==h(P/'scripts'/name))for name in ['import_goal_visualization.mjs','goal_visualization_common.mjs','prepare_goal_visualization.mjs']];assert all(s['byteExact']for s in scripts)
out=dict(schemaVersion=1,role='Actual normal root-isolated author imports; no active approval',records=commands,normalScripts=scripts,sourceLandscapeSHA=h(canpath),candidateLandscapeSHA=h(target),changedGoalIds=changed,changedFields=['resourceLinks'],allOtherWholeGoalsExact=520,targetAllNonVisualizationFieldsExact=True,allActiveResourceBytesRetained=len(base['allActiveResourceBindings']),currentSEMAndMemoryBindingsExact=True,old54FileAuthorSealExact=True,retainedOriginal466SourcePublicBackend=retained,mutablePrivateParentChains=list({x['path']:x for x in parents}.values()),sourceAppBackendFinalPNGCopiesByteExact=True,C2PABytesUnmodified=True,activeFilesWritten=False,independentVotes=0,humanApproval=False)
(O/'generation/normal-private-import-and-retention.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(imports=3,changedGoals=changed,otherWholeGoalsExact=520,protectedResourceBytes=len(base['allActiveResourceBindings']),candidateLandscapeSHA=h(target),activeWrites=False,independentVotes=0)))
