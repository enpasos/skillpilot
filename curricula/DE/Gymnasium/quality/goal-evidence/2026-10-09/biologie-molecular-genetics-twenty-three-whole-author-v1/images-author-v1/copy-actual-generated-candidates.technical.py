import sys,json,pathlib,shutil,hashlib
from PIL import Image
base=pathlib.Path(__file__).resolve().parent.relative_to(pathlib.Path.cwd().resolve())
entries=json.loads((base/'23-goal-derived-original-prompts.author-input.json').read_text())['entries']
for r in json.loads(sys.argv[1]):
 e=entries[r['ordinal']-1];v=r.get('version',1);d=base/(str(r['ordinal']).zfill(2)+'-'+e['goalId']);dst=d/('candidate-v'+str(v)+'.png');assert not dst.exists();shutil.copyfile(r['path'],dst);im=Image.open(dst)
 for w in (360,680):im.resize((w,round(im.height*w/im.width)),Image.Resampling.LANCZOS).save(d/('candidate-v'+str(v)+'.preview-'+str(w)+'.png'))
 meta={'ordinal':r['ordinal'],'version':v,'originalGeneratedFile':r['path'],'savedAsset':str(dst),'originalPromptPath':e['originalPromptPath'],'provider':'built-in ChatGPT/Codex image_gen','tool':'image_gen__imagegen','model':None,'dimensions':list(im.size),'sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'bytes':dst.stat().st_size,'independentReviewPending':True}
 if v>1:meta.update({'selectedEditPromptPath':str(d/('generation-v'+str(v)+'.targeted-edit.prompt.en.md')),'referencedActualImage':str(d/'candidate-v1.png'),'originalAttemptPreserved':True})
 (d/('actual-generated-file.local-provenance'+('.v'+str(v) if v>1 else '')+'.json')).write_text(json.dumps(meta,indent=2)+'\n')
 print({'ordinal':r['ordinal'],'version':v,'saved':str(dst),'dimensions':im.size})
