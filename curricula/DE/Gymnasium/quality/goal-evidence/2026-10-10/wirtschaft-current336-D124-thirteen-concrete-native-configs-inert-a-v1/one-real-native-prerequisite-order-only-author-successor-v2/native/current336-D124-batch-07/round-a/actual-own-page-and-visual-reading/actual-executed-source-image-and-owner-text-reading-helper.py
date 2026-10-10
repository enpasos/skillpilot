from pathlib import Path
import json,hashlib,subprocess,os,sys,time
from PIL import Image,ImageDraw
R=Path('/home/enpasos/projects/skillpilot'); B=R/sys.argv[1]; A=B/'round-a'; W=A/'actual-own-page-and-visual-reading';W.mkdir(exist_ok=True)
def d(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bound(p):return {'path':str(p.relative_to(R)),'sha256':d(p),'bytes':p.stat().st_size}
L=[json.loads(x) for x in next((A/'batches').glob('*.input.jsonl')).read_text().splitlines()]; rows=[]
for group in range(0,len(L),6):
 subset=L[group:group+6]; sheet=Image.new('RGB',(1360,435*((len(subset)+1)//2)), 'white'); dr=ImageDraw.Draw(sheet)
 for k,l in enumerate(subset):
  g=l['goal']; p=g['reviewContext']['page']; v=p['visualization']; src=R/'app/public'/v['url'].lstrip('/'); assert d(src)==v['originalDigest']; im=Image.open(src).convert('RGB'); size=im.size;im.thumbnail((676,390)); x=(k%2)*680;y=(k//2)*435;sheet.paste(im,(x+(680-im.width)//2,y+27));dr.text((x+8,y+5),f'{group+k+1}: {g["goalId"][:8]} {g["currentTitleEn"][:70]}',fill='black'); rows.append({'goalId':g['goalId'],'actualSource':bound(src),'nativePageFingerprint':g['pageFingerprint'],'nativeBookDigest':l['bookDigest'],'actualImageSize':size,'inspectionOnlyNoNewVisualApproval':True})
 out=W/f'actual-own-image-contexts-{group+1:02d}-{group+len(subset):02d}.png';assert not out.exists();sheet.save(out)
out=W/'actual-all-image-and-owner-page-reading-bindings.json';assert not out.exists();out.write_text(json.dumps({'rows':rows,'sourceComparison':'Every original image digest exactly matches the current native bound page; contact sheets are inspection aids only.','claim':'To be actually inspected by reviewer, no generation or new visual approval.'},ensure_ascii=False,indent=2)+'\n')
pop='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin/pdftotext';env=os.environ.copy();env['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu'+(':'+env['LD_LIBRARY_PATH'] if env.get('LD_LIBRARY_PATH') else '');txt=W/'whole-actual-native-owner-pages.txt';args=[pop,'-layout',str(B/'bundle/book.pdf'),str(txt)];t=time.monotonic();res=subprocess.run(args,env=env,capture_output=True,text=True);(W/'actual-own-pdftext-reading-command.json').write_text(json.dumps({'argv':args,'actualExitCode':res.returncode,'seconds':round(time.monotonic()-t,3),'stdout':res.stdout,'stderr':res.stderr,'actualPDF':bound(B/'bundle/book.pdf'),'actualExtractedText':bound(txt)},ensure_ascii=False,indent=2)+'\n');assert res.returncode==0
print(json.dumps({'actualReadingDirectory':str(W.relative_to(R)),'actualImages':len(rows),'pdfTextPath':str(txt)}))
