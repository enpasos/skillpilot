from pathlib import Path
from html.parser import HTMLParser
import base64,hashlib,json
root=Path(__file__).resolve().parent
node=json.loads((root/'node-results.json').read_text());m=node['materialValues']
checks=[]
def check(name,condition):
 assert condition,name
 checks.append(name)
def caesar(text,shift):return ''.join(chr(65+(ord(c)-65+shift)%26) for c in text)
def vig(text,key,decrypt=False):return ''.join(chr(65+(ord(c)-65+(-1 if decrypt else 1)*(ord(key[i%len(key)])-65))%26) for i,c in enumerate(text))
check('Unabhaengiger Caesar-Anwendungswert',caesar('TREFFENAMTOR',5)==m['caesarExpectedCipher']=='YWJKKJSFRYTW')
check('Unabhaengiger Caesar-Angriff',caesar(m['caesarToBreak'],-9)=='TREFFENUMZEHN')
check('Unabhaengiger Vigenere-Anwendungswert',vig('SCHULTAG','UNI')==m['vigenereExpectedCipher']=='MPPOYBUT')
key=''.join(chr(65+(ord(m['vigenereToBreak'][i])-ord('ANMELDUNG'[i]))%26) for i in range(3))
check('Unabhaengige Schluesselrekonstruktion',key=='AGX' and vig(m['vigenereToBreak'],key,True)=='ANMELDUNGROBOTIK')
check('SMTP-Tokeninhalt',base64.b64decode(m['smtpToken'])==b'\0aguser\0demo-pass')
payload=b'TERMINE2026OK!';segments=[payload[i:i+5] for i in range(0,len(payload),5)]
check('Paketlaengen',list(map(len,segments))==[5,5,4]);check('Paketrekonstruktion',b''.join(segments)==payload)
received={};expected=1001;acks=[]
for i in [2,0,1]:
 start=1001+5*i
 for n,byte in enumerate(segments[i]):received[start+n]=byte
 while expected in received:expected+=1
 acks.append(expected)
check('Kumulative ACKs unabhaengig',acks==[1001,1006,1015])
class Document(HTMLParser):
 def __init__(self):super().__init__();self.ids={};self.inputs=[];self.labels=[];self.script=False;self.script_text=[];self.script_sources=[];self.tags=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append(tag)
  if 'id' in a:
   assert a['id'] not in self.ids,'duplicate id';self.ids[a['id']]=tag
  if tag=='input':self.inputs.append(a)
  if tag=='label' and 'for' in a:self.labels.append(a['for'])
  if tag=='script':self.script=True;self.script_sources.append(a.get('src'))
 def handle_endtag(self,tag):
  if tag=='script':self.script=False
 def handle_data(self,data):
  if self.script:self.script_text.append(data)
html=(root/'solution.html').read_text();d=Document();d.feed(html)
check('Semantische HTML-Bausteine',all(x in d.tags for x in ['header','nav','main','section','article','footer','form']))
check('Explizite Labelziele',all(x in d.ids for x in d.labels))
check('Formulartypen',{'text','email','number','checkbox'} <= {x.get('type','text') for x in d.inputs})
check('Kein externes Script',d.script_sources==[None])
core=(root/'reference.mjs').read_text().split('export function caesar')[0].replace('export ','')
check('HTML verwendet exakt geprueften Anwendungskern',''.join(d.script_text)=='\n'+core+'\ninstallForm(document);\n')
check('Responsive CSS statisch enthalten','@media (min-width: 768px)' in html and 'repeat(3, minmax(0, 1fr))' in html)
check('DOM-Ausgabe als Text',"output.textContent = result.message;" in core)
check('Kein fetch oder XHR im Anwendungskern','fetch(' not in core and 'XMLHttpRequest' not in core)
result={'status':'PASS-independent-Python-checks-no-browser-rendering-claim','checks':checks,'browserRenderingObserved':False,'httpOrSmtpExecuted':False,'rubricBoundary':{'criteria':25,'maxPoints':25,'passingPoints':25,'singleOmissionTotals':[24]*25,'allCompleteTotal':25,'exhaustiveArgument':'For25 scores each at most1, sum reaches25 iff every criterion reaches1. Every wholly missing competence has its criterion0 and total at most24; semantic correctness of each mapping still needs independent review.'}}
(root/'python-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))
