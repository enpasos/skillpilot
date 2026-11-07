#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import importlib.util,json,tempfile,threading,sqlite3,hashlib,itertools,traceback
from pathlib import Path
from contextlib import closing
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode
from http.server import ThreadingHTTPServer
from html.parser import HTMLParser
R=Path(__file__).parent;CHECKS=[]
def check(label,action,expected):
 value=action();ok=value==expected;CHECKS.append({'id':label,'pass':ok,'actual':value,'expected':expected})
 if not ok:raise AssertionError((label,value,expected))
def rejected(con,sql,params=()):
 try:con.execute(sql,params)
 except sqlite3.IntegrityError:return True
 return False
class Page(HTMLParser):
 def __init__(self,text):super().__init__();self.forms=[];self.fields=[];self.links=[];self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append(tag)
  if tag=='form':self.forms.append(a)
  if tag=='input':self.fields.append(a)
  if tag=='a':self.links.append(a.get('href'))
for domain in ('courses','library','festival'):
 spec=importlib.util.spec_from_file_location('reference_'+domain,R/('reference-'+domain+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 titles={'courses':['Fotobasis','Audiolabor','Videoschnitt','Datenschutz-Werkstatt','Archiv <offen>'],'library':['Datenatlas','Klangbuch','Filmarchiv','Privatsphaere','Magazin <offen>'],'festival':['Morgenquartett','Nachtklang','Lichtensemble','Freie Bühne','Finale <offen>']}[domain]
 kt={'courses':'Kurs','library':'Medium','festival':'Auftritt'}[domain];bt={'courses':'Buchung','library':'Ausleihe','festival':'Reservierung'}[domain];ktid={'courses':'kid','library':'mid','festival':'auftritt_id'}[domain]
 pt={'courses':'Person','library':'Leser','festival':'Gast'}[domain]
 with tempfile.TemporaryDirectory(dir=R) as tmp:
  db=str(Path(tmp)/'data.db');m.initialize(db)
  with closing(m.connect(db)) as con:
   vals={k:con.execute(q).fetchall() for k,q in m.SQL.items()}
   check(domain+'-SELECT',lambda:vals['SELECT'],[('ada',titles[2],40),('ben',titles[1],30),('ada',titles[0],20),('ben',titles[0],20)])
   check(domain+'-GROUP',lambda:vals['GROUP'],[(10,2,40),(20,2,60),(30,2,80),(40,1,10)])
   check(domain+'-SUBQUERY',lambda:vals['SUBQUERY'],[(20,),(30,)])
   check(domain+'-ALG_PROBLEM',lambda:vals['ALG_PROBLEM'],[('blau',),('rot',)])
   check(domain+'-ALG_A-full',lambda:vals['ALG_A'],[(1,'rot')])
   check(domain+'-ALG_B-full',lambda:vals['ALG_B'],[(1,10,'rot'),(1,20,'gruen'),(2,20,'gruen')])
   check(domain+'-ALG_C-full',lambda:vals['ALG_C'],[(1,'rot',10,'rot'),(1,'rot',20,'gruen')])
   check(domain+'-ALG_D-full',lambda:vals['ALG_D'],[('gruen',),('rot',)])
   check(domain+'-ALG_OPT',lambda:vals['ALG_OPT'],[(1,titles[0]),(2,titles[0]),(2,titles[3]),(3,titles[0]),(5,titles[3])])
   bad=con.execute(f'SELECT * FROM {pt} p JOIN {bt} b ON p.pid=b.{ktid}').fetchall()
   check(domain+'-wrong-join-counterexample',lambda:bad,[])
   check(domain+'-at-most-one-valid-missing-pair',lambda:con.execute(f'SELECT COUNT(*) FROM {bt} WHERE pid=5 AND {ktid}=50').fetchone()[0],0)
   check(domain+'-duplicate-business-pair-rejected',lambda:rejected(con,f'INSERT INTO {bt} VALUES(1,10,\'aktiv\')'),True)
   check(domain+'-unknown-owner-rejected',lambda:rejected(con,f'INSERT INTO {bt} VALUES(999,10,\'aktiv\')'),True)
   con.execute(f'CREATE TABLE Hinweis({ktid} INTEGER PRIMARY KEY REFERENCES {kt}({ktid}),text TEXT NOT NULL)')
   con.execute('INSERT INTO Hinweis VALUES(10,\'Kamera mitbringen\')')
   check(domain+'-DDL-DML-insert',lambda:con.execute('SELECT * FROM Hinweis').fetchall(),[(10,'Kamera mitbringen')])
   con.execute(f'UPDATE Hinweis SET text=? WHERE {ktid}=?',('Geladene Kamera mitbringen',10))
   check(domain+'-DDL-DML-update',lambda:con.execute('SELECT * FROM Hinweis').fetchall(),[(10,'Geladene Kamera mitbringen')])
   check(domain+'-DDL-duplicate-rejected',lambda:rejected(con,'INSERT INTO Hinweis VALUES(10,\'duplicate\')'),True)
   check(domain+'-DDL-unknown-rejected',lambda:rejected(con,'INSERT INTO Hinweis VALUES(999,\'unknown\')'),True)
   con.execute(f'DELETE FROM Hinweis WHERE {ktid}=?',(10,));check(domain+'-DDL-DML-delete',lambda:con.execute('SELECT * FROM Hinweis').fetchall(),[])
   pricecol={'courses':'preis','library':'gebuehr','festival':'preis'}[domain]
   con.execute(f'ALTER TABLE {kt} ADD COLUMN sichtbar INTEGER NOT NULL DEFAULT 1')
   check(domain+'-DDL-default',lambda:con.execute(f'SELECT sichtbar FROM {kt} ORDER BY {ktid}').fetchall(),[(1,)]*5)
   con.commit()
  check(domain+'-program-SELECT-filter-only',lambda:m.select_rows(db,30),[(10,titles[0],20),(20,titles[1],30),(40,titles[3],10),(50,titles[4],15)])
  check(domain+'-program-SELECT-empty',lambda:m.select_rows(db,0),[])
  affected,after=m.rename(db,'Grundlagenkurs',10)
  check(domain+'-UPDATE-no-result-rowcount',lambda:affected,1)
  check(domain+'-UPDATE-persistent-and-other-rows',lambda:after,[(10,'Grundlagenkurs'),(20,titles[1]),(30,titles[2]),(40,titles[3]),(50,titles[4])])
  check(domain+'-UPDATE-missing-row',lambda:m.rename(db,'Nichts',999)[0],0)
  m.rename(db,titles[0],10)
  filt=m.filter_html(db,30);fpage=Page(filt)
  check(domain+'-filter-only-no-pagination',lambda:fpage.links,[])
  check(domain+'-filter-form',lambda:(fpage.forms[0]['method'],fpage.forms[0]['action'],fpage.fields[0]['name']),('get','/kurse','maxPreis'))
  check(domain+'-escaped-result-no-executable-tag',lambda:('<offen>' in fpage.tags,'&lt;offen&gt;' in filt), (False,True))
  check(domain+'-pagination-first',lambda:m.page_rows(db,1),([(10,titles[0],20),(20,titles[1],30)],5))
  check(domain+'-pagination-last',lambda:m.page_rows(db,3),([(50,titles[4],15)],5))
  check(domain+'-pagination-empty',lambda:m.page_rows(db,4),([],5))
  check(domain+'-pagination-first-links',lambda:Page(m.page_html(db,1)).links,['/seiten?page=2'])
  check(domain+'-pagination-last-links',lambda:Page(m.page_html(db,3)).links,['/seiten?page=2'])
  check(domain+'-pagination-empty-links',lambda:Page(m.page_html(db,4)).links,['/seiten?page=3'])
  # HTTP execution actually requests the complete reference's independent endpoints.
  with ThreadingHTTPServer(('127.0.0.1',0),m.handler(db)) as server:
   worker=threading.Thread(target=server.serve_forever,daemon=True);worker.start();base=f'http://127.0.0.1:{server.server_port}'
   def request(path,body=None):
    req=Request(base+path,data=body.replace('kid=',ktid+'=').encode() if body is not None else None,headers={'Content-Type':'application/x-www-form-urlencoded'})
    try:
     with urlopen(req,timeout=5) as response:return response.status,response.read().decode()
    except HTTPError as e:return e.code,e.read().decode()
   check(domain+'-HTTP-filter-form-request',lambda:request('/kurse?maxPreis=30')[0],200)
   check(domain+'-HTTP-empty-filter',lambda:request('/kurse?maxPreis=0')[0],200)
   check(domain+'-HTTP-pagination',lambda:request('/seiten?page=3')[0],200)
   check(domain+'-HTTP-empty-page',lambda:request('/seiten?page=4')[0],200)
   for label,path in [('5000digit-price','/kurse?maxPreis='+'9'*5000),('5000digit-page','/seiten?page='+'9'*5000),('duplicate','/seiten?page=1&page=2'),('negative','/seiten?page=-1'),('zero','/seiten?page=0'),('sql-text','/kurse?maxPreis=0%20OR%201=1'),('unicode','/kurse?maxPreis=%EF%BC%91'),('missing','/kurse'),('unknown','/kurse?maxPreis=30&pid=1')]:check(domain+'-HTTP-invalid-'+label,lambda path=path:request(path)[0],400)
   check(domain+'-HTTP-CSRF-negative',lambda:request('/buchen','kid=40&csrfToken=wrong')[0],403)
   check(domain+'-HTTP-session-override-negative',lambda:request('/buchen','kid=40&csrfToken=fixture-token&pid=5')[0],400)
   check(domain+'-HTTP-unknown-course',lambda:request('/buchen','kid=999&csrfToken=fixture-token')[0],404)
   check(domain+'-HTTP-book-success',lambda:request('/buchen','kid=40&csrfToken=fixture-token')[0],201)
   check(domain+'-HTTP-book-duplicate',lambda:request('/buchen','kid=40&csrfToken=fixture-token')[0],409)
   check(domain+'-HTTP-POST-title',lambda:request('/titel',urlencode({'kid':'10','titel':'<script>x</script>'}))[0],200)
   scripted=request('/kurse?maxPreis=30')[1]
   check(domain+'-HTTP-harmless-title-rendered-as-text',lambda:('&lt;script&gt;x&lt;/script&gt;' in scripted,'script' in Page(scripted).tags),(True,False))
   check(domain+'-HTTP-overlong-title',lambda:request('/titel',urlencode({'kid':'10','titel':'x'*81}))[0],400)
   check(domain+'-HTTP-empty-title',lambda:request('/titel','kid=10&titel=')[0],400)
   check(domain+'-HTTP-SQL-injection-title-is-data',lambda:request('/titel',urlencode({'kid':'10','titel':"x' OR 1=1"}))[0],200)
   with closing(m.connect(db)) as con:check(domain+'-HTTP-SQL-injection-did-not-drop-or-rewrite-all',lambda:con.execute(f'SELECT {ktid},titel FROM {kt} ORDER BY {ktid}').fetchall(),[(10,"x' OR 1=1"),(20,titles[1]),(30,titles[2]),(40,titles[3]),(50,titles[4])])
   server.shutdown();worker.join(timeout=5)
  for ev,expected in [(['absenden','bereit','zahlungOK'],'Erledigt'),(['absenden','zahlungOK','bereit'],'Erledigt'),(['absenden','bereit'],'Bearbeitung'),(['absenden','zahlungOK'],'Bearbeitung'),(['absenden','zahlungOK','abbrechen'],'Storniert'),(['absenden','bereit','abbrechen'],'Storniert'),(['absenden','abbrechen','bereit','zahlungOK'],'Storniert')]:check(domain+'-hierarchical-parallel-state-'+','.join(ev),lambda ev=ev:m.state_trace(ev)[-1][0],expected)
  original={'personalizedRecommendations':True,'preciseLocation':True,'profilePublic':True,'analyticsRetentionDays':365,'language':'de','bookingNotifications':True};saved=original.copy();changed=m.settings(original)
  check(domain+'-settings-copy-preserved',lambda:original,saved)
  check(domain+'-settings-unrelated-preserved',lambda:(changed['language'],changed['bookingNotifications']),('de',True))
  check(domain+'-settings-actual-change',lambda:(changed['personalizedRecommendations'],changed['preciseLocation'],changed['profilePublic'],changed['analyticsRetentionDays']),(False,False,False,7))
# Explicit new ER fixtures, each independent from supplied query schema.
with closing(sqlite3.connect(':memory:')) as con:
 con.execute('PRAGMA foreign_keys=ON');con.executescript('CREATE TABLE Kurs(KursID INTEGER PRIMARY KEY);CREATE TABLE Termin(KursID INTEGER NOT NULL REFERENCES Kurs,TerminNr INTEGER NOT NULL,Datum TEXT NOT NULL,PRIMARY KEY(KursID,TerminNr));INSERT INTO Kurs VALUES(10),(20);INSERT INTO Termin VALUES(10,1,\'2027-02-01\'),(20,1,\'2027-02-02\');')
 check('weak-same-partial-number-different-owner-valid',lambda:con.execute('SELECT * FROM Termin ORDER BY KursID').fetchall(),[(10,1,'2027-02-01'),(20,1,'2027-02-02')])
 check('weak-duplicate-composite-rejected',lambda:rejected(con,'INSERT INTO Termin VALUES(10,1,\'2027-02-03\')'),True)
 check('weak-missing-owner-rejected',lambda:rejected(con,'INSERT INTO Termin VALUES(99,1,\'2027-02-03\')'),True)
 con.executescript('CREATE TABLE Person(PersonID INTEGER PRIMARY KEY,Name TEXT NOT NULL);CREATE TABLE Telefon(PersonID INTEGER NOT NULL REFERENCES Person,Nummer TEXT NOT NULL,PRIMARY KEY(PersonID,Nummer));CREATE TABLE Lehrkraft(PersonID INTEGER PRIMARY KEY REFERENCES Person,Lehrgebiet TEXT NOT NULL);INSERT INTO Person VALUES(1,\'A\'),(2,\'B\'),(3,\'C\');INSERT INTO Telefon VALUES(2,\'0123\'),(2,\'0456\'),(3,\'0123\');INSERT INTO Lehrkraft VALUES(2,\'DB\');')
 check('multivalue-zero-and-many-shared-number-valid',lambda:con.execute('SELECT * FROM Telefon ORDER BY PersonID,Nummer').fetchall(),[(2,'0123'),(2,'0456'),(3,'0123')])
 check('multivalue-duplicate-pair-rejected',lambda:rejected(con,'INSERT INTO Telefon VALUES(2,\'0123\')'),True)
 check('isa-preserved-identity',lambda:con.execute('SELECT p.PersonID,l.PersonID,l.Lehrgebiet FROM Person p JOIN Lehrkraft l USING(PersonID)').fetchall(),[(2,2,'DB')])
 check('isa-person-without-subtype-valid',lambda:con.execute('SELECT PersonID FROM Person WHERE PersonID NOT IN(SELECT PersonID FROM Lehrkraft) ORDER BY PersonID').fetchall(),[(1,),(3,)])
 check('isa-subtype-without-person-rejected',lambda:rejected(con,'INSERT INTO Lehrkraft VALUES(99,\'Web\')'),True)
# Full product/selection/projection/join evaluated independently as Python sets.
rr={(1,'rot'),(2,'blau')};ss={(10,'rot'),(20,'gruen')}
check('algebra-full-product',lambda:sorted(r+s for r in rr for s in ss),[(1,'rot',10,'rot'),(1,'rot',20,'gruen'),(2,'blau',10,'rot'),(2,'blau',20,'gruen')])
check('algebra-full-selection',lambda:sorted(r for r in rr if r[0]==1),[(1,'rot')])
check('algebra-projection',lambda:sorted({(r[1],) for r in rr}),[('blau',),('rot',)])
check('algebra-full-theta-join',lambda:sorted(r+s for r in rr for s in ss if r[1]==s[1]),[(1,'rot',10,'rot')])
u={1,2};w={2,3};check('algebra-advanced-operators',lambda:(sorted(u|w),sorted(u&w),sorted(u-w)),([1,2,3],[2],[1]))
# Normalization reconstruction and BCNF reasoning.
e={(1,'ada','Kassel',10,'Fotobasis',20,1,'Werkstatt','aktiv'),(1,'ada','Kassel',30,'Videoschnitt',40,1,'Werkstatt','aktiv'),(2,'ben','Kassel',10,'Fotobasis',20,1,'Werkstatt','aktiv'),(2,'ben','Kassel',20,'Audiolabor',30,2,'Offene Medien','aktiv')}
p={r[:3] for r in e};k={(r[3],r[4],r[5],r[6]) for r in e};t={(r[6],r[7]) for r in e};b={(r[0],r[3],r[8]) for r in e}
rebuilt={pr+(kr[0],kr[1],kr[2],kr[3],tr[1],br[2]) for pr in p for kr in k for tr in t for br in b if pr[0]==br[0] and kr[0]==br[1] and kr[3]==tr[0]}
check('normalization-lossless-full-fixture',lambda:rebuilt==e,True)
z={('Ada','DB','Dia'),('Ben','DB','Dia'),('Ada','Web','Wes')};d={(r[2],r[1]) for r in z};sd={(r[0],r[2]) for r in z}
check('BCNF-lossless-example',lambda:{(a,f,dd) for a,dd in sd for ddd,f in d if dd==ddd}==z,True)
def closure(attrs):
 attrs=set(attrs)
 while True:
  old=set(attrs)
  if {'student','fach'}<=attrs:attrs.add('dozent')
  if 'dozent' in attrs:attrs.add('fach')
  if attrs==old:return attrs
check('BCNF-candidate-keys-from-FDs',lambda:[list(v) for n in range(1,4) for v in itertools.combinations(('student','fach','dozent'),n) if len(closure(v))==3 and not any(len(closure(w))==3 for m in range(1,n) for w in itertools.combinations(v,m))],[['student','fach'],['student','dozent']])
check('BCNF-dozent-not-superkey',lambda:len(closure({'dozent'})),2)
# Ranking covers all five and explicit zero/ties.
click={10:3,20:2,30:1};ids=[10,20,30,40,50]
check('ranking-complete-universe-zero-tie',lambda:sorted(ids,key=lambda k:(-click.get(k,0),k)),[10,20,30,40,50])
check('ranking-sponsor',lambda:sorted(ids,key=lambda k:(-(k==50),-click.get(k,0),k)),[50,10,20,30,40])
check('economic-direct-surplus',lambda:10-6,4)
partitions={'P1':[10,20,10],'P2':[30,20,10]};groups={}
for part in partitions.values():
 for kid in part:groups.setdefault(kid,[]).append(1)
check('mapreduce-groups-complete',lambda:groups,{10:[1,1,1],20:[1,1],30:[1]})
check('mapreduce-reduced',lambda:{k:sum(v) for k,v in groups.items()},{10:3,20:2,30:1})
# Role commands were not run on SQLite. Explicit local rights-matrix checks only.
rights={'auskunft':{'KursAuskunft':{'SELECT'}},'anmeldedienst':{'Buchung':{'SELECT','INSERT'}}}
check('role-model-allowed-view',lambda:'SELECT' in rights['auskunft']['KursAuskunft'],True)
check('role-model-no-person-contact-drop',lambda:('Person' in rights['auskunft'],'Kontakt' in rights['auskunft'],'DROP' in rights['anmeldedienst']['Buchung']),(False,False,False))
# Per-essential-criterion counterexamples test declared contract, not native scoring implementation.
native=json.loads((R/'native-examData.json').read_text());assemblies=json.loads((R/'exam-assemblies.json').read_text());inp=json.loads(Path('/dev/shm/informatics-q2-implementation-20261107/shared-author-input.json').read_text())
for eid,data in native.items():
 expected=next((a['examData']['coveredGoalIds'] for a in inp['contracts']['newExams'] if a['id']==eid),inp['old41ExactOrderedCoverage'] if eid==inp['old41ExactExamPayload']['id'] else inp['oldClusterExams'].get(eid,{}).get('preGrowthAtomicExpansion'))
 check(eid+'-exact-ordered-coverage',lambda data=data:data['coveredGoalIds'],expected)
 steps=data['scoring']['steps'];maximum=len(steps)
 check(eid+'-threshold-essential-count',lambda data=data,maximum=maximum:(data['scoring']['maxPoints'],data['scoring']['passingPoints']),(maximum,maximum))
 check(eid+'-binary-steps',lambda steps=steps:all(s['points']==1 for s in steps),True)
 check(eid+'-all-competence-positive-contract',lambda maximum=maximum:sum([1]*maximum)>=maximum,True)
 check(eid+'-any-essential-missing-negative-contract',lambda maximum=maximum:all(sum([1]*i+[0]+[1]*(maximum-i-1))<maximum for i in range(maximum)),True)
 check(eid+'-draft-only',lambda data=data:data['reviewStatus'],'draft')
 check(eid+'-unique-criterion-identities',lambda steps=steps:len({s['id'] for s in steps}),len(steps))
 check(eid+'-exact-goal-bindings',lambda eid=eid:[v['goalId'] for v in assemblies[eid]['goalBindings']],expected)
reference_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in R.glob('reference*.py')}
report={'status':'passed local author-reference execution;not independent material acceptance','counts':{'checks':len(CHECKS),'passed':sum(c['pass'] for c in CHECKS)},'checks':CHECKS,'referenceSha256':reference_hashes,'limits':['No human learner or host acceptance.','Role/DCL assignments checked against given teaching matrix only;no actual role DBMS execution.','HTTP uses a deliberately supplied local fictional session contract,not production authentication.','Contract negative cases verify declared arithmetic threshold;native scorer/gates remain source-agent responsibility.','No measured workload/performance or legal review beyond the dated official card.']}
(R/'execution-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2,default=lambda v:sorted(v))+'\n')
print(json.dumps({'status':'pass','checks':len(CHECKS),'domains':3,'actualHTTP':True,'newERPositiveNegative':True,'nativeThresholdIsNotIndependentReview':True}))
