#!/usr/bin/env python3
"""Independent material probes; never invokes author's test suite or edits inputs."""
import sys,json,hashlib,sqlite3,tempfile,importlib.util,threading,itertools,re,html
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode
from http.server import ThreadingHTTPServer
from html.parser import HTMLParser
sys.dont_write_bytecode=True
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).resolve().parent
MAT=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-material-implementation-candidate/materials'
CASE=json.loads((MAT/'casebank.json').read_text());EXAM=json.loads((MAT/'native-examData.json').read_text());ASM=json.loads((MAT/'exam-assemblies.json').read_text())
results=[]
def add(name,actual,expected):
    actual=json.loads(json.dumps(actual));expected=json.loads(json.dumps(expected))
    results.append(dict(name=name,actual=actual,expected=expected,matched=actual==expected))
def load(name):
    s=importlib.util.spec_from_file_location('review_'+name,MAT/('reference-'+name+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
class Table(HTMLParser):
    def __init__(self):super().__init__();self.rows=[];self.cur=None;self.cell=None;self.tags=[];self.links=[]
    def handle_starttag(self,t,a):
        self.tags.append(t)
        if t=='tr':self.cur=[]
        if t=='td':self.cell=''
        if t=='a':self.links.append(dict(a).get('href'))
    def handle_data(self,d):
        if self.cell is not None:self.cell+=d
    def handle_endtag(self,t):
        if t=='td':self.cur.append(self.cell);self.cell=None
        if t=='tr' and self.cur:self.rows.append(self.cur);self.cur=None

def http(server,path,body=None):
    req=Request('http://127.0.0.1:'+str(server.server_port)+path,data=body.encode() if body is not None else None,headers={'Content-Type':'application/x-www-form-urlencoded'})
    try:
        with urlopen(req,timeout=5) as r:return r.status,r.read().decode()
    except HTTPError as e:return e.code,e.read().decode()

configs=[('courses','C','Person','pseudonym','Kurs','kid','preis','Buchung',['Fotobasis','Audiolabor','Videoschnitt','Datenschutz-Werkstatt','Archiv <offen>']),('library','B','Leser','alias','Medium','mid','gebuehr','Ausleihe',['Datenatlas','Klangbuch','Filmarchiv','Privatsphaere','Magazin <offen>']),('festival','F','Gast','alias','Auftritt','auftritt_id','preis','Reservierung',['Morgenquartett','Nachtklang','Lichtensemble','Freie Bühne','Finale <offen>'])]
for name,prefix,persons,alias,offer,key,price,booking,titles in configs:
    mod=load(name)
    with tempfile.TemporaryDirectory(prefix='independent-material-',dir='/dev/shm') as td:
        db=str(Path(td)/'test.sqlite');mod.initialize(db);con=sqlite3.connect(db);con.execute('PRAGMA foreign_keys=ON')
        # Directly execute the actual authored solution SQL; expectations manually recomputed.
        for task,expect in [('T04',[('ada',titles[2],40),('ben',titles[1],30),('ada',titles[0],20),('ben',titles[0],20)]),('T05',[(10,2,40),(20,2,60),(30,2,80),(40,1,10)])]:
            sql=CASE[prefix+'-'+task]['solution'].split(';')[0];add(name+'/'+task,con.execute(sql).fetchall(),expect)
        add(name+'/subquery',con.execute(f'SELECT {key} FROM {offer} WHERE {price}>(SELECT AVG({price}) FROM {offer}) ORDER BY {key}').fetchall(),[(20,),(30,)])
        add(name+'/wrong-join',con.execute(f'SELECT COUNT(*) FROM {persons} p JOIN {booking} b ON p.pid=b.{key}').fetchone()[0],0)
        add(name+'/wrong-status-filter-distinguished',con.execute(f'SELECT {key},COUNT(*) FROM {booking} GROUP BY {key} ORDER BY {key}').fetchall(),[(10,3),(20,2),(30,2),(40,2)])
        # Perturb repeated projected value: DISTINCT has a real semantic effect.
        con.execute("INSERT INTO R VALUES(3,'rot')");con.execute('INSERT INTO V VALUES(3,20)')
        sql=CASE[prefix+'-T11']['solution'];sql=sql[sql.index('SELECT'):sql.index(';')]
        add(name+'/RA-projection-duplicate',con.execute(sql).fetchall(),[('blau',),('rot',)])
        add(name+'/RA-no-DISTINCT-negative',con.execute(sql.replace('DISTINCT ', '')).fetchall(),[('blau',),('rot',),('rot',)])
        con.rollback()
        for sql,expected in [('SELECT * FROM R CROSS JOIN S ORDER BY a,b',[(1,'rot',10,'rot'),(1,'rot',20,'gruen'),(2,'blau',10,'rot'),(2,'blau',20,'gruen')]),('SELECT * FROM R JOIN S ON x=y',[(1,'rot',10,'rot')]),('SELECT V.a,V.b,S.y FROM V JOIN S ON V.b=S.b ORDER BY V.a,V.b',[(1,10,'rot'),(1,20,'gruen'),(2,20,'gruen')])]:add(name+'/RA-'+str(len(results)),con.execute(sql).fetchall(),expected)
        sol=CASE[prefix+'-T15']['solution'];sql=sol[sol.index('SELECT'):sol.index(';')];add(name+'/nested-RA',sorted(con.execute(sql).fetchall()),[('gruen',),('rot',)])
        original=con.execute(f'SELECT DISTINCT p.pid,k.titel FROM {persons} p JOIN {booking} b ON p.pid=b.pid JOIN {offer} k ON k.{key}=b.{key} WHERE k.{price}<=20 ORDER BY p.pid,k.titel').fetchall()
        pushed=con.execute(f'SELECT DISTINCT p.pid,k.titel FROM (SELECT pid FROM {persons}) p JOIN (SELECT pid,{key} FROM {booking}) b ON p.pid=b.pid JOIN (SELECT {key},titel FROM {offer} WHERE {price}<=20) k ON k.{key}=b.{key} ORDER BY p.pid,k.titel').fetchall();add(name+'/pushdown-equivalence',pushed,original)
        # DDL/DML exactly as written (DCL excluded deliberately).
        statements=CASE[prefix+'-T25']['solution'].split(';')[:4]
        for i,stmt in enumerate(statements):
            con.execute(stmt)
            if i: add(name+'/DDL-DML-step'+str(i),con.execute('SELECT * FROM Hinweis').fetchall(),[[(10,'Kamera mitbringen')],[(10,'Geladene Kamera mitbringen')],[]][i-1])
        for bad,label in [(999,'orphan'),(10,'duplicate')]:
            if label=='duplicate':con.execute(f'INSERT INTO Hinweis VALUES(10,?)',('first',))
            try:con.execute('INSERT INTO Hinweis VALUES(?,?)',(bad,'bad'));observed='allowed'
            except sqlite3.IntegrityError:observed='rejected'
            add(name+'/DDL-'+label,observed,'rejected')
        con.rollback();con.close()
        server=ThreadingHTTPServer(('127.0.0.1',0),mod.handler(db));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        try:
            for path,status in [('/kurse?maxPreis=30',200),('/kurse?maxPreis=0',200),('/kurse?maxPreis=-1',400),('/kurse?maxPreis=%EF%BC%93%EF%BC%90',400),('/kurse?maxPreis=0%20OR%201=1',400),('/kurse?maxPreis=30&maxPreis=40',400),('/seiten?page=1',200),('/seiten?page=3',200),('/seiten?page=4',200),('/seiten?page=0',400),('/seiten?page=1&page=2',400),('/seiten?page='+'9'*5000,400)]:
                code,body=http(server,path);add(name+'/HTTP-'+path[:80],code,status)
                if path=='/kurse?maxPreis=30':
                    doc=Table();doc.feed(body);add(name+'/HTML-full-filter',doc.rows,[[str(i),t,str(p)] for i,t,p in [(10,titles[0],20),(20,titles[1],30),(40,titles[3],10),(50,titles[4],15)]]);add(name+'/HTML-literal-angle-title','offen' in doc.tags,False)
                if path=='/seiten?page=3':
                    doc=Table();doc.feed(body);add(name+'/HTML-lastpage',doc.rows,[['50',titles[4],'15']]);add(name+'/HTML-lastpage-links',doc.links,['/seiten?page=2'])
            injection="<script>alert(1)</script> x' OR 1=1"
            code,_=http(server,'/titel',urlencode({key:10,'titel':injection}));add(name+'/HTTP-stored-text-update',code,200)
            with sqlite3.connect(db) as check:
                after=check.execute(f'SELECT {key},titel FROM {offer} ORDER BY {key}').fetchall()
            add(name+'/new-connection-persistence-and-other-rows',after,[(10,injection)]+[(i,titles[n]) for n,i in enumerate([10,20,30,40,50]) if n])
            _,body=http(server,'/kurse?maxPreis=30');doc=Table();doc.feed(body);add(name+'/HTML-stored-script-is-text',doc.rows[0][1],injection);add(name+'/HTML-no-script-tag','script' in doc.tags,False)
            for label,values,status in [('wrong-token',{key:50,'csrfToken':'no'},403),('foreign-pid',{key:50,'csrfToken':'fixture-token','pid':2},400),('unknown',{key:999,'csrfToken':'fixture-token'},404),('duplicate',{key:10,'csrfToken':'fixture-token'},409),('capacity',{key:20,'csrfToken':'fixture-token'},409),('success',{key:50,'csrfToken':'fixture-token'},201),('repeated',{key:50,'csrfToken':'fixture-token'},409)]:add(name+'/HTTP-book-'+label,http(server,'/buchen',urlencode(values))[0],status)
        finally:server.shutdown();server.server_close();thread.join()
        # Model rights, explicitly not a server test. GRANT adds; it does not replace.
        rights={(persons,'SELECT')};rights.add(({'C':'KursAuskunft','B':'MedienAuskunft','F':'ProgrammAuskunft'}[prefix],'SELECT'))
        add(name+'/T21-retained-base-right-after-GRANT',(persons,'SELECT') in rights,True)
        rights.remove((persons,'SELECT'));add(name+'/T25-T33-explicit-REVOKE',(persons,'SELECT') in rights,False)
# New ER goals, independently instantiated from their authored relation definitions.
con=sqlite3.connect(':memory:');con.executescript('PRAGMA foreign_keys=ON; CREATE TABLE Owner(id INTEGER PRIMARY KEY); INSERT INTO Owner VALUES(10),(20); CREATE TABLE Weak(owner INTEGER NOT NULL REFERENCES Owner(id),part INTEGER NOT NULL,PRIMARY KEY(owner,part)); CREATE TABLE Phone(owner INTEGER NOT NULL REFERENCES Owner(id),number TEXT NOT NULL,PRIMARY KEY(owner,number)); CREATE TABLE Subtype(id INTEGER PRIMARY KEY REFERENCES Owner(id),field TEXT NOT NULL);')
for label,stmt,params,expected in [('weak-local-number-1','INSERT INTO Weak VALUES(?,?)',(10,1),'allowed'),('weak-local-number-2','INSERT INTO Weak VALUES(?,?)',(20,1),'allowed'),('weak-duplicate','INSERT INTO Weak VALUES(?,?)',(10,1),'rejected'),('weak-orphan','INSERT INTO Weak VALUES(?,?)',(99,1),'rejected'),('phone-first','INSERT INTO Phone VALUES(?,?)',(10,'0123'),'allowed'),('phone-second','INSERT INTO Phone VALUES(?,?)',(10,'0456'),'allowed'),('phone-shared','INSERT INTO Phone VALUES(?,?)',(20,'0123'),'allowed'),('phone-duplicate','INSERT INTO Phone VALUES(?,?)',(10,'0123'),'rejected'),('subtype','INSERT INTO Subtype VALUES(?,?)',(10,'db'),'allowed'),('subtype-orphan','INSERT INTO Subtype VALUES(?,?)',(99,'db'),'rejected')]:
    try:con.execute(stmt,params);observed='allowed'
    except sqlite3.IntegrityError:observed='rejected'
    add(label,observed,expected)
add('supertype-without-subtype',con.execute('SELECT id FROM Owner EXCEPT SELECT id FROM Subtype').fetchall(),[(20,)])
# BCNF: exact keys computed from FDs, plus concrete non-preservation witness.
fds=[({'student','fach'},{'dozent'}),({'dozent'},{'fach'})];attrs={'student','fach','dozent'}
def closure(x):
    out=set(x)
    while True:
        before=set(out)
        for left,right in fds:
            if left<=out:out|=right
        if out==before:return out
keys=[]
for n in range(1,4):
    for x in itertools.combinations(sorted(attrs),n):
        if closure(x)==attrs and not any(set(k)<=set(x) for k in keys):keys.append(x)
add('BCNF-keys',sorted([sorted(x) for x in keys]),sorted([['fach','student'],['dozent','student']]))
D={('Dia','DB'),('Dora','DB')};SD={('Ada','Dia'),('Ada','Dora')};joined={(s,f,d) for s,d in SD for d2,f in D if d==d2};add('BCNF-local-valid-global-SF-to-D-violated',len({d for s,f,d in joined if s=='Ada' and f=='DB'}),2)
# Independent finite-state semantics contrasted against the submitted reference.
mod=load('courses')
def expected_trace(events):
    phase='Entwurf';completed=set();rows=[]
    for e in events:
        if phase=='Entwurf' and e=='absenden':phase='Bearbeitung'
        elif phase=='Bearbeitung':
            if e=='abbrechen':phase='Storniert'
            elif e in ('zahlungOK','bereit'):completed.add(e)
            if phase=='Bearbeitung' and len(completed)==2:phase='Erledigt'
        rows.append((phase,'Bezahlt' if 'zahlungOK' in completed else 'Offen','Bereit' if 'bereit' in completed else 'Wartet') if phase=='Bearbeitung' else (phase,None,None))
    return rows
mismatches=[];n=0
for length in range(6):
    for sequence in itertools.product(['absenden','zahlungOK','bereit','abbrechen'],repeat=length):
        n+=1
        if mod.state_trace(sequence)!=expected_trace(sequence):mismatches.append(sequence)
add('hierarchical-parallel-state-traces',dict(sequences=n,mismatches=mismatches),dict(sequences=1365,mismatches=[]))
# Verify sealed assembly internals independently, without accepting author's closure claims.
for eid,e in EXAM.items():
    tasks=[CASE[k] for k in ASM[eid]['taskIds']];steps=e['scoring']['steps']
    add(eid+'/goal-binding',e['coveredGoalIds'],[x['goalId'] for x in tasks])
    add(eid+'/criterion-binding',[s['id'] for s in steps],[s['id'] for t in tasks for s in t['essentialCriteria']])
    add(eid+'/all-essential-threshold',(sum(s['points'] for s in steps),e['scoring']['passingPoints']),(e['scoring']['maxPoints'],e['scoring']['maxPoints']))
    add(eid+'/draft',e['reviewStatus'],'draft')
    add(eid+'/full-native-task-binding',all(t['task'] in e['taskContent'] for t in tasks),True)
    add(eid+'/full-native-solution-binding',all(t['solution'] in e['solutionContent'] for t in tasks),True)
    add(eid+'/full-native-material-binding',all(v in e['taskContent'] for t in tasks for v in t['materialBlocks'].values()),True)
manifest=json.loads((MAT/'material-manifest.json').read_text())
add('sealed-input-manifest-integrity',all(hashlib.sha256((MAT/r['path']).read_bytes()).hexdigest()==r['sha256'] for r in manifest['files']),True)
output=dict(status='independent concrete checks, not a subject acceptance or published QA ledger',count=len(results),matched=sum(r['matched'] for r in results),checks=results,limits=['DCL is explicit set-model simulation, not a role DBMS execution.','Loopback fixtures, not production security or host acceptance.','No author test runner or author execution-evidence imported.'])
(OUT/'independent-execution.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'count':len(results),'matched':output['matched'],'mismatches':[r for r in results if not r['matched']]}))
