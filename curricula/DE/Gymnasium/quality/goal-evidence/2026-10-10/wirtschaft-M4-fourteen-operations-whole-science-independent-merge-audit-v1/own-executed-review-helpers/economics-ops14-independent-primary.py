from urllib.request import Request,urlopen
from urllib.error import HTTPError
from html.parser import HTMLParser
from pathlib import Path
import json,hashlib,re,concurrent.futures
P=Path('/tmp/economics-ops14-independent-primary-20261010');P.mkdir(exist_ok=True)
urls=[('HGB242','https://www.gesetze-im-internet.de/hgb/__242.html'),('register','https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/Unternehmensregister/Tabellen/stat-unternehmen-beschaeftigten-groessenklassen-wz08.html'),('craft','https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Handwerk/Tabellen/unternehmen-beschaeftigte-umsatz-wirtschaftsabschnitte.html'),('Taler','https://www.bundesbank.de/de/presse/reden/-taler-taler-du-musst-wandern-geschichte-des-bargeldes-vom-taler-in-die-heutige-zeit--824616'),('reform','https://www.bundesbank.de/de/aufgaben/themen/waehrungsreform-1948-614040'),('ECBmoney','https://www.ecb.europa.eu/ecb-and-you/explainers/tell-me-more/html/what_is_money.en.html')]
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip and d.strip():self.parts.append(d.strip())
def f(item):
 name,url=item
 try:
  r=urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25);data=r.read();status=r.status;final=r.url
 except HTTPError as e:data=e.read();status=e.code;final=e.url
 except Exception as e:return {'name':name,'url':url,'error':str(e),'selectedReading':False}
 (P/(name+'.html')).write_bytes(data);h=Text();h.feed(data.decode('utf-8',errors='replace'));s='\n'.join(h.parts);(P/(name+'.text')).write_text(s)
 return {'name':name,'url':url,'finalUrl':final,'status':status,'sha256':hashlib.sha256(data).hexdigest(),'privateFullCache':str(P/(name+'.html')),'selectedText':str(P/(name+'.text')),'bytes':len(data)}
rows=list(concurrent.futures.ThreadPoolExecutor(6).map(f,urls));(P/'fetch.result.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');print(json.dumps(rows,ensure_ascii=False,indent=2))
for n in ['register','craft']:
 p=P/(n+'.text')
 if p.exists():
  s=p.read_text();terms=['198','538','7 801','6 017','2024','Stand','Beschäftigte','210','388']
  print('SELECTED',n)
  for term in terms:
   for m in list(re.finditer(re.escape(term),s))[:3]:print(s[max(0,m.start()-80):m.end()+200])
