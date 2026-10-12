from pathlib import Path
import json,hashlib,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot'); E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10'
rd=lambda p:json.loads(p.read_text()); rp=lambda p:str(p.relative_to(R)); sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for key in ['5169','bef4']:
 B=E/f'chemie-q4-{key}-current220-final-image-native-root-20261012-v8'
 native=N/f'native-D1-{key}'; assert not native.exists();shutil.copytree(B/'native-D1',native)
 cfg=rd(B/'configs/native-D1.batch.config.json');cfg['outputDirectory']=rp(native)
 cpath=N/'configs'/f'native-D1-{key}.adoption.config.json';wr(cpath,cfg)
 m=rd(native/'batch-manifest.json');m['configPath']=rp(cpath);m['configDigest']=sha(cpath);(native/'batch-manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
 ids=cfg['goalIds'];assert len(ids)==1
 for tag in ['a','b']:
  records=list((native/f'round-{tag}'/'results').glob('*.records.jsonl'));assert len(records)==1
  rows=[json.loads(x) for x in records[0].read_text().splitlines()];assert [x['goalId'] for x in rows]==ids and rows[0]['decision']=='keep'
 wr(native/'synthesis-authoring.json',{'schemaVersion':1,'manifestId':f'chemie-q4-{key}-genuine-paired-successor-single-adoption-20261013-v10','synthesizedBy':'Codex technical integrator retaining exact genuine independent A/B successor results','decisions':[{'goalId':ids[0],'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Beide unabhängigen gezielten Erstprüfungen A und B akzeptieren das tatsächlich korrigierte Bild, die ganze aktuelle Zielbeschreibung, die vollständigen zweisprachigen Fälle und die echte native Einzelzielseite. Die versiegelten Originalprüfungen bleiben unverändert. Die spätere maschinelle Bildfreigabe erhält die menschlichen und historischen Felder; die normale aktuelle Modellberechnung und der separate technische Vergleich prüfen die exakte Seiten- und Kontextbindung. Keine neue fachliche Stimme und keine menschliche Freigabe durch diese Übernahme.','rationaleEn':'Both genuine targeted independent first passes A and B accept the actual corrected image, whole current goal, complete bilingual cases, and actual native single-goal page. Sealed original reviews remain unchanged. Subsequent machine image approval preserves human and historical fields; normal current model construction and a separate technical comparison check exact page and context bindings. This adoption creates no new scientific vote or human approval.'}]})
 commands=[['scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',rp(cpath),'--write'],['scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',rp(cpath),'--authoring',rp(native/'synthesis-authoring.json'),'--write'],['scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',rp(cpath),'--synthesis-manifest',rp(native/'synthesis-decisions.json'),'--write'],['scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',rp(cpath),'--write']]
 for ordinal,argv in enumerate(commands,1):
  cmd=['node','--import','tsx',*argv];p=subprocess.run(cmd,cwd=R/'tmp/chemie-q4-current220-prep/execution/app',text=True,capture_output=True)
  out=N/'checks'/f'{key}.normal-single-adoption-{ordinal}.actual-output.txt';assert not out.exists();out.write_text(p.stdout+p.stderr)
  wr(N/'checks'/f'{key}.normal-single-adoption-{ordinal}.receipt.json',{'argv':cmd,'exitCode':p.returncode,'normalProductionCodeUnmodified':True,'sourceResultsExact':True,'activeWrites':False})
  print(json.dumps({'single':key,'step':ordinal,'exit':p.returncode,'output':(p.stdout+p.stderr)[-800:]}),flush=True)
  if p.returncode:raise SystemExit(p.returncode)
