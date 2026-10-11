#!/usr/bin/env python3
"""Supplemental exact full-page binding check; no scientific or visual approval."""
import json,re,html,hashlib,unicodedata,subprocess,datetime
from pathlib import Path
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11')
OUT=BASE/'chemie-b007-v7-root-normal-final-integration-20261011-v1'
STAGE=BASE/'chemie-b007-v7-final-native31-root-integration-candidate-20261011-v1'
PREP=BASE/'chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1'
def load(p):return json.loads(Path(p).read_text())
def bind(p):p=Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
def norm(s):
 # Chromium's existing hyphens:auto inserts U+2010 at a physical text line break.
 # Normalize this generic typesetting operation only; retain all ordinary lexical hyphens.
 s=re.sub('\u2010[ \t]*\r?\n[ \t]*','',s)
 return ' '.join(unicodedata.normalize('NFKC',s).split())
modelpath=Path('app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json');model=load(modelpath);pages={p['goalId']:p for p in model['pages']}
hp=OUT/'native/current-source382-feedback-matched.html';pdf=Path('app/public/lernzielbuch/de-gym-chemie-bundesweit.pdf');mp=Path(str(pdf)+'.render-manifest.json');hm=load(str(hp)+'.render-manifest.json');pm=load(mp)
assert len(pages)==382 and model['digest']==pm['modelDigest']==hm['modelDigest']
assert bind(pdf)['sha256']==pm['artifactSha256'] and bind(hp)['sha256']==hm['artifactSha256']
for manifest in [hm,pm]:
 assert len(manifest['pages'])==382
 for m in manifest['pages']:
  p=pages[m['goalId']]
  assert all(m[f]==p[f] for f in ['goalFingerprint','pageFingerprint','pageNumber'])
plan=load(PREP/'native31-rebinding-preparation.actual.json');expect={r['goalId']:r['wholeCurrentSourcePage'] for r in plan['rows']}
extra=['018bec90-445f-4a88-b8bc-228f8335dee6','5338b54c-68bc-5892-907c-e025351ffde6','5abc5961-6368-52bb-88b9-6a846c3c37a8','4b6d1824-20e4-597e-b639-fae401f740f0','805a2f58-29ce-55d0-8a85-42ee486239b3','1351706f-4ea6-56e9-951b-87b24cbcdee8','413040cd-ba74-5227-948c-a778b0bd0f56','4aeced1e-15cd-58df-83f7-68e2531c2d32','49d42c38-419c-5048-b7e9-860645dd122d']
selected=sorted(set(expect)|set(extra),key=lambda g:pages[g]['pageNumber']);body=hp.read_text();rows=[]
for gid in selected:
 p=pages[gid]
 if gid in expect:
  e=expect[gid]
  for f in ['goalId','title','description','requires','reverseRequires','externalPrerequisites','externalReverseRequires','chapterIds','applicability','goalFingerprint']:assert p.get(f)==e.get(f),(gid,f)
  assert (p.get('visualization') or {}).get('originalDigest')==(e.get('visualization') or {}).get('originalDigest')
 blocks=re.findall(r'<article\b[^>]*data-goal-id="'+re.escape(gid)+r'"[^>]*>.*?</article>',body,re.S);assert len(blocks)==1
 text=norm(html.unescape(re.sub(r'<[^>]+>',' ',blocks[0])))
 assert all(norm(x) in text for x in [gid,p['title'],p['description']]),gid
 assert all(ref['anchor'] in blocks[0] for ref in p['requires']+p['reverseRequires']),gid
 n=p['pageNumber']+pm['frontMatterPageCount'];raw=subprocess.run(['pdftotext','-f',str(n),'-l',str(n),'-layout',str(pdf),'-'],check=True,capture_output=True,text=True).stdout
 assert all(norm(x) in norm(raw) for x in [gid,p['title'],p['description']]),gid
 v=p.get('visualization')
 if v:assert any(a['publicPath']==v['url'] and a['sourceSha256']==v['originalDigest'] for a in pm['assets']),gid
 (OUT/'native'/f'{gid}.whole-pdf-text.actual.txt').write_text(raw)
 rows.append({'goalId':gid,'title':p['title'],'pageNumber':p['pageNumber'],'physicalPDFPage':n,'goalFingerprint':p['goalFingerprint'],'pageFingerprint':p['pageFingerprint'],'priorSelected31SemanticReferenceBodiesExact':gid in expect,'wholeHTMLTextAndReferencesPresent':True,'wholePDFTextPresent':True,'typesettingU2010LineBreaks':len(re.findall('\u2010[ \t]*\r?\n',raw)),'completePixelInspectionStillRequired':True})
result={'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Whole382 normal manifest/model/artifact bindings; selected31 prior exact semantic/reference bodies plus3 additional real prerequisite contexts and6 new child pages; whole40 HTML/PDF texts','inputs':[bind(p) for p in [modelpath,hp,pdf,mp]],'rows':rows,'selectedPageCount':len(rows),'all382ManifestBindingsExact':True,'typographicNormalization':'Only generic Chromium U+2010 at a physical linebreak. Ordinary lexical hyphens retained; first supplemental literal-check diagnostic retained unchanged.','normalRendererUnchanged':True,'visualOrScientificApprovalFromThisCheck':False,'strictGain':0,'humanApproved':0}
(OUT/'complete40-feedback-matched-final-page-bindings.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('Exact382 manifest/model/artifact bindings and40 complete selected HTML/PDF texts PASS; actual pixel inspection pending.')
