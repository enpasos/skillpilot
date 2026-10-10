from pathlib import Path
import requests,json,hashlib,re,concurrent.futures
from bs4 import BeautifulSoup
p=Path('/tmp/economics-international12-independent-primary-20261010-v1');p.mkdir(exist_ok=False)
urls=[
'https://www.canada.ca/en/department-finance/news/2024/08/surtax-on-chinese-made-electric-vehicles.html',
'https://gazette.gc.ca/rp-pr/p2/2024/2024-10-09/html/sor-dors187-eng.html',
'https://laws-lois.justice.gc.ca/eng/regulations/SOR-2024-187/FullText.html',
'https://www.canada.ca/en/global-affairs/news/2025/03/statement-by-ministers-ng-macaulay-and-lebouthillier-on-chinas-anti-discrimination-investigation.html',
'https://www.canada.ca/en/global-affairs/news/2026/03/canada-secures-renewed-market-access-with-china-to-boost-exports-and-strengthen-economic-collaboration.html',
'https://search.open.canada.ca/qpnotes/record/aafc-aac%2CAAFC-2026-QP-00016',
'https://www.mofcom.gov.cn/xwfbzt/2026/swbzklxxwfbh2026n4y9r/index.html',
'https://audiovisual.ec.europa.eu/en/stories/M-010052',
'https://www.wto.org/english/thewto_e/whatis_e/what_we_do_e.htm',
'https://www.imf.org/en/about',
'https://www.worldbank.org/en/about/what-we-do',
'https://sdgs.un.org/2030agenda',
'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:22016A1019(01)',
'https://hdr.undp.org/data-center/human-development-index',
'https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SI.POV.GINI',
'https://www.imf.org/external/pubs/ft/fandd/2008/03/basics.htm']
def fetch(x):
 n,u=x
 try:
  r=requests.get(u,timeout=35);h=p/f'{n:02d}.html';h.write_bytes(r.content);s=BeautifulSoup(r.content,'html.parser')
  for a in s(['script','style','nav','footer']):a.decompose()
  t=p/f'{n:02d}.txt';t.write_text(s.get_text(' ',strip=True))
  return {'n':n,'url':u,'actualStatus':r.status_code,'actualFinalURL':r.url,'htmlPath':str(h),'htmlSHA256':hashlib.sha256(r.content).hexdigest(),'textPath':str(t),'textSHA256':hashlib.sha256(t.read_bytes()).hexdigest(),'bytes':len(r.content),'chars':len(t.read_text()),'independentSelectedReadPending':True}
 except Exception as e:return {'n':n,'url':u,'error':str(e),'independentSelectedReadPending':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as e:rows=list(e.map(fetch,enumerate(urls)))
(p/'actual-independent-fetch-manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(rows,ensure_ascii=False,indent=2))
