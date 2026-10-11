#!/usr/bin/env python3
"""Read selected complete final pages; emit mechanical bindings, never visual/scientific approval."""
import argparse,datetime,hashlib,html,json,re,subprocess,unicodedata
from pathlib import Path

def norm(s): return ' '.join(unicodedata.normalize('NFKC',s).split())
def bind(p):
 p=Path(p);return {'path':p.as_posix(),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
def load(p):return json.loads(Path(p).read_text())

def main():
 a=argparse.ArgumentParser(description=__doc__)
 a.add_argument('--model',required=True);a.add_argument('--html',required=True);a.add_argument('--pdf',required=True);a.add_argument('--pdf-manifest',required=True);a.add_argument('--output',required=True)
 args=a.parse_args();plan=load(Path(__file__).resolve().parent.parent/'native31-rebinding-preparation.actual.json');model=load(args.model);manifest=load(args.pdf_manifest);html_body=Path(args.html).read_text();pages={p['goalId']:p for p in model['pages']};rendered={p['goalId']:p for p in manifest['pages']}
 if len(pages)!=382:raise ValueError('Expected the final source382 atlas; source coverage remains382/402')
 if model['digest']!=manifest['modelDigest'] or bind(args.pdf)['sha256']!=manifest['artifactSha256']:raise ValueError('Final PDF/model/manifest exact binding mismatch')
 rows=[]
 for r in plan['rows']:
  gid=r['goalId'];p=pages[gid];expected=r['wholeCurrentSourcePage'];mr=rendered[gid]
  # P-review metadata can acquire new adopted IDs. Every complete semantic/reference body must stay exact.
  fields=['goalId','title','description','requires','reverseRequires','externalPrerequisites','externalReverseRequires','chapterIds','applicability','goalFingerprint']
  for f in fields:
   if p.get(f)!=expected.get(f):raise ValueError(gid+': changed final semantic/reference field '+f)
  for f in ['goalFingerprint','pageFingerprint','pageNumber']:
   if mr[f]!=p[f]:raise ValueError(gid+': render manifest differs for '+f)
  blocks=re.findall(r'<article\b[^>]*data-goal-id="'+re.escape(gid)+r'"[^>]*>.*?</article>',html_body,re.S)
  if len(blocks)!=1:raise ValueError(gid+': expected one complete HTML goal article')
  block=blocks[0];text=norm(html.unescape(re.sub(r'<[^>]+>',' ',block)))
  if any(norm(x) not in text for x in [gid,p['title'],p['description']]):raise ValueError(gid+': whole HTML goal text missing')
  for ref in p['requires']+p['reverseRequires']:
   if ref['anchor'] not in block:raise ValueError(gid+': native reference destination missing '+ref['goalId'])
  physical=p['pageNumber']+manifest['frontMatterPageCount']
  pdf_text=subprocess.run(['pdftotext','-f',str(physical),'-l',str(physical),'-layout',args.pdf,'-'],check=True,capture_output=True,text=True).stdout
  if any(norm(x) not in norm(pdf_text) for x in [gid,p['title'],p['description']]):raise ValueError(gid+': whole selected PDF goal text missing')
  visual=p.get('visualization');expected_visual=expected.get('visualization')
  if (visual or {}).get('originalDigest')!=(expected_visual or {}).get('originalDigest'):raise ValueError(gid+': reviewed visual asset drift')
  if visual and not any(x['publicPath']==visual['url'] and x['sourceSha256']==visual['originalDigest'] for x in manifest['assets']):raise ValueError(gid+': final print derivative source binding missing')
  rows.append({'goalId':gid,'finalPageNumber':p['pageNumber'],'physicalPDFPage':physical,'finalGoalFingerprint':p['goalFingerprint'],'finalPageFingerprint':p['pageFingerprint'],'completeHTMLArticleCount':1,'completeHTMLTextPresent':True,'completePDFTextPresent':True,'referenceAndAssetBindingsExact':True,'wholePixelInspectionStillRequired':True})
 result={'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Selected31 complete final HTML/PDF texts and model/reference/image-source bindings; mechanical only','inputs':[bind(x) for x in [args.model,args.html,args.pdf,args.pdf_manifest]],'rows':rows,'sourcePageCount':382,'atomicUniverse':402,'sourceOmissions':20,'wholeSourceHOLDs':13,'mechanicalBindingOnly':True,'scientificCompletionOrVisualApprovalGranted':False,'humanApproved':0,'strictGain':0}
 out=Path(args.output)
 if out.resolve().is_relative_to(Path(__file__).resolve().parent.parent):raise ValueError('Write final bindings to a new package; preserve this frozen preparation')
 out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('Selected final native31 text/reference/asset bindings passed; complete-page pixel review remains explicit.')
if __name__=='__main__':main()
