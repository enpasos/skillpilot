import pathlib,json,hashlib,datetime
from bs4 import BeautifulSoup
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08';A=B/'chemie-b008-by-sixteen-source-facet-author-root-20261008-v22';O=B/'chemie-b008-by-sixteen-source-facet-independent-b-20261008-v22';O.mkdir(exist_ok=True)
def rd(p):return json.loads(p.read_text())
def rec(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
fr=rd(A/'author.first.freeze.json');en=rd(A/'neutral-sixteen-BY-source-components.author.entry.json');pack=rd(A/'sixteen-original-BY-routes-and-bounded-current-components.author.json');receipts=fr['payloads']+[rec(A/'author.first.freeze.json'),en['previousFirstSeal'],en['previousWholeCurrent504Candidate']];receipts +=[row[k] for row in pack['rows'] for k in ['currentExtractionBinding','currentMappingBinding']];http=rd(R/'tmp/chemie-b008-by-sixteen-primary-root-20261008-v1/actual-http-primary-receipts.json');receipts += [{'path':x['actualLocalHtml'],'sha256':x['sha256'],'bytes':x['bytes']} for x in http]+[rec(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')];receipts={x['path']:x for x in receipts};fails=[]
for x in receipts.values():
 p=R/x['path'];a=rec(p)
 if a['sha256']!=x['sha256'].removeprefix('sha256:') or a['bytes']!=x['bytes']:fails.append(x['path'])
assert not fails
freeze=O/'by16-b.first-input.freeze.json';assert not freeze.exists();freeze.write_text(json.dumps({'createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'BLIND_B_ACTUAL_INPUTS_BEFORE_FIRST_VERDICT','inputs':list(receipts.values()),'inputHashFailures':fails,'peerCurrentBYSourceAReadBeforeFirstVerdict':False,'activeWrites':0,'strictGain':0},ensure_ascii=False,indent=2)+'\n')
primary=[]
for x in http:
 html=(R/x['actualLocalHtml']).read_bytes();s=BeautifulSoup(html,'html.parser');h=next(h for h in s.find_all('h2') if 'Lernbereich 1:' in h.get_text());sec=h.parent.parent;t=sec.get_text(' ',strip=True);notices=[p.get_text(' ',strip=True) for p in s.find_all('p') if 'mindestens drei' in p.get_text().lower()];primary.append({'sourceKey':x['key'],'officialURL':x['effectiveUrl'],'originalHTMLSHA256':x['sha256'],'heading':s.find('h1').get_text(' ',strip=True),'wholeLB1Text':t,'wholeLB1TextSHA256':hashlib.sha256(t.encode()).hexdigest(),'wholePracticalChoiceNotices':notices,'wholeSectionReadByB':True})
(O/'three-whole-current-official-LB1-and-choice-notices.actual-independent-b.input.json').write_text(json.dumps({'primary':primary,'noThirdPartyRawHTMLRepublished':True},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'inputs':len(receipts),'hashFailures':fails,'LB1Sections':len(primary)}))
