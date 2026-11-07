import os,pathlib,json,shutil,hashlib
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');F=W/'frozen';C=W/'candidate';C.mkdir(exist_ok=True)
for root,ds,fs in os.walk(F):
 for n in ds[:]:
  p=pathlib.Path(root)/n; dest=C/p.relative_to(F)
  if p.is_symlink():dest.symlink_to(os.readlink(p),target_is_directory=True);ds.remove(n)
  else:dest.mkdir(exist_ok=True,parents=True)
 for n in fs:
  p=pathlib.Path(root)/n;dest=C/p.relative_to(F)
  if not dest.exists():os.link(p,dest)
# Keep the actual files bound by source availability in RAM too (not new curriculum input).
R=pathlib.Path('/home/enpasos/projects/skillpilot'); added=[]
for n in ['curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-informatik.pdf','curricula/DE/Gymnasium/input/SH/Fachanforderungen_Informatik_Sekundarstufe_2021_barrierearm.pdf','curricula/DE/Gymnasium/input/NW/upper-secondary/klp_gost_informatik.pdf','curricula/DE/Gymnasium/input/ST/FLP_Informatik_Gym_01082022_swd.pdf','backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java']:
 b=(R/n).read_bytes();p=F/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b);dest=C/n;dest.parent.mkdir(parents=True,exist_ok=True);os.link(p,dest);added.append({'path':n,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
(W/'additional-frozen-pins.json').write_text(json.dumps(added,indent=2)+'\n')
print('candidate hardlinkclone ready; mutations MUST atomic replace')
