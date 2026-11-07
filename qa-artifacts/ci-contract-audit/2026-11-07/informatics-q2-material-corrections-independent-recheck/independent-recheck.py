#!/usr/bin/env python3
"""Independent finite successor recheck; no author tests, active-source writes or approvals."""
import json,sys,hashlib,subprocess,tempfile,re,sqlite3,importlib.util,io,contextlib,difflib
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).resolve().parent;BASE=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07'
OLD=BASE/'informatics-q2-source-scope-material-implementation-candidate/materials';NEW=BASE/'informatics-q2-material-review-corrections';REVIEW=BASE/'informatics-q2-full-material-independent-review'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
old=read(OLD/'native-examData.json');new=read(NEW/'native-examData.json');oc=read(OLD/'casebank.json');nc=read(NEW/'casebank.json');assembly=read(NEW/'exam-assemblies.json');checks=[]
def check(name,actual,expected):
 a=json.loads(json.dumps(actual));e=json.loads(json.dumps(expected));checks.append({'name':name,'actual':a,'expected':e,'matched':a==e});
 if a!=e:raise AssertionError(name)
def dump(name,data):(OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def module(domain):
 sp=importlib.util.spec_from_file_location('independent_'+domain,NEW/('reference-'+domain+'.py'));m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
check('new-exact-pin',sha(NEW/'native-examData.json'),'cb82c27a5cf0a53d7d946475dfd4f2ceae8e1065348580f97b7f0f9202871c92')
check('new-seal-pin',sha(NEW/'successor-seal.json'),'5fbb13737cdc31e04a2eb165115c5017bcd84db176e2a1876369a3a30703dec9')
check('old-exact-pin',sha(OLD/'native-examData.json'),'424d79c1c84ff7f0973c312756730008428a23d5bdfd84ab866287352c537364')
check('full-review-preserved',sha(REVIEW/'review-seal.json'),'f9e5238b6ffad43c5113857d11749f41d646a8fe351b55381fb4fca0ee7df64a')
for folder,seal in [(NEW,'successor-seal.json'),(OLD,'material-manifest.json'),(REVIEW,'review-seal.json')]:
 for item in read(folder/seal)['files']:check(folder.name+'/'+item['path']+'/integrity',sha(folder/item['path']),item['sha256'])
check('assemblies-byte-exact',sha(NEW/'exam-assemblies.json'),sha(OLD/'exam-assemblies.json'))
check('case-identities/order',list(nc),list(oc))
changes=[]
def recursive(a,b,p):
 if a==b:return
 if isinstance(a,dict):
  check('same-keys:'+p,list(b),list(a))
  for k in a:recursive(a[k],b[k],p+'/'+k)
 elif isinstance(a,list):
  check('same-list-length:'+p,len(b),len(a))
  for i,(x,y) in enumerate(zip(a,b)):recursive(x,y,p+'/'+str(i))
 else:changes.append({'path':p,'before':a,'after':b})
recursive(oc,nc,'casebank')
for k,c in nc.items():
 for f in ['id','goalId','fullGoalDescription','title','materials','caseId']:check(k+'/'+f+'-preserved',c[f],oc[k][f])
 check(k+'/criteria-ids-and-points',[(x['id'],x['points'])for x in c['essentialCriteria']],[(x['id'],x['points'])for x in oc[k]['essentialCriteria']])
for domain in ['courses','library','festival']:check(domain+'/reference-byte-identical',sha(NEW/('reference-'+domain+'.py')),sha(OLD/('reference-'+domain+'.py')))
nativeDiff=[]
for eid,e in new.items():
 for f in ['reviewStatus','coveredGoalIds','coveredStrands','demandLevels']:check(eid+'/'+f,e[f],old[eid][f])
 for f in ['maxPoints','passingPoints']:check(eid+'/'+f,e['scoring'][f],old[eid]['scoring'][f])
 check(eid+'/criteria-identity-points',[(x['id'],x['points'])for x in e['scoring']['steps']],[(x['id'],x['points'])for x in old[eid]['scoring']['steps']])
 tasks=[nc[k]for k in assembly[eid]['taskIds']]
 check(eid+'/all-tasks-present',all(t['task']in e['taskContent']for t in tasks),True)
 check(eid+'/all-solutions-present',all(t['solution']in e['solutionContent']for t in tasks),True)
 check(eid+'/all-materials-present',all(v in e['taskContent']for t in tasks for v in t['materialBlocks'].values()),True)
 check(eid+'/scoring-matches-case-criteria',[s['description']for s in e['scoring']['steps']],[t['caseId']+': '+c['description']for t in tasks for c in t['essentialCriteria']])
 for field in ['taskContent','solutionContent']:
  nativeDiff.append({'examId':eid,'field':field,'diff':''.join(difflib.unified_diff(old[eid][field].splitlines(True),e[field].splitlines(True),fromfile='old/'+field,tofile='new/'+field,n=0))})
check('full-45-meanings',len({v['goalId']for v in nc.values()}),45)
for prefix in ['C','B','F']:check(prefix+'/875-material-exact',nc[prefix+'-T28'],oc[prefix+'-T28'])
check('source7586-preserved',sha(Path('/dev/shm/informatics-q2-implementation-20261107/candidate/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json')),'7586e38b7c96688bc8c5f02b2e2b1327284d271c73404693c9f872d29422d661')
check('active854111-preserved',sha(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e')
dump('complete-material-diff.json',{'caseLeafChanges':changes,'fullNativeTextDiff':nativeDiff,'scope':'All5nativeassemblies,all91cases,45meanings; no author delta trusted'})
# Own finite rubric witnesses: query execution is evidence; decisions below are reviewer judgments, not an automatic assessor.
rubric=[]
for domain,prefix,person,offer,key,price,booking in [('courses','C','Person','Kurs','kid','preis','Buchung'),('library','B','Leser','Medium','mid','gebuehr','Ausleihe'),('festival','F','Gast','Auftritt','auftritt_id','preis','Reservierung')]:
 m=module(domain)
 with tempfile.TemporaryDirectory(prefix='independent-rubric-',dir='/dev/shm')as td:
  db=Path(td)/'db.sqlite';m.initialize(db)
  with sqlite3.connect(db)as con:
   sql=nc[prefix+'-T04']['solution'].split(';')[0];correct=con.execute(sql).fetchall();check(prefix+'/T04-original-result-count',len(correct),4)
   typo=[list(x)for x in correct];typo[0][-1]=39
   rubric.append({'caseId':prefix+'-T04','submission':'correct original SQL plus independently correct explanation of complete rows/order; isolated manual price40->39','executedSQL':sql,'actualCorrectRows':correct,'submittedRows':typo,'reviewerScore':[1,1],'reason':'Explicit corrected global rule and C2 establish harmless transfer without loss of an already demonstrated essential competence.'})
   wrongSort=sql.replace(' DESC',' ASC');ws=con.execute(wrongSort).fetchall();check(prefix+'/wrong-sort-distinguished',ws!=correct,True)
   rubric.append({'caseId':prefix+'-T04','submission':'SQL price ascending, explicitly defended as correct for descending requirement','sql':wrongSort,'actualRows':ws,'reviewerScore':[1,0],'reason':'Essential sort semantics absent; not a transcription error.'})
   wrongJoin=sql.replace(f'b.pid=p.pid','b.pid=p.pid+1');wj=con.execute(wrongJoin).fetchall();check(prefix+'/wrong-join-distinguished',wj!=correct,True)
   rubric.append({'caseId':prefix+'-T04','submission':'wrongFKjoin','sql':wrongJoin,'actualRows':wj,'reviewerScore':[0,0],'reason':'Wrong assignment/selection of rows; unrelated points cannot compensate.'})
   # Original fixture happens to hide missing status for this particular question. Add a permitted cancelled Kassel/30EUR pair.
   con.execute(f"INSERT INTO {booking} VALUES(1,20,'storniert')")
   correct2=con.execute(sql).fetchall();missing=sql.replace(" AND b.status='aktiv'",'');wrong=con.execute(missing).fetchall();check(prefix+'/correct-query-invariant-under-cancelled-booking',correct2,correct);check(prefix+'/missing-status-filter-counterfixture',len(wrong),5)
   rubric.append({'caseId':prefix+'-T04','submission':'statusfiltermissing; learner says cancelled bookings belong','fixtureAddition':(1,20,'storniert'),'sql':missing,'actualRows':wrong,'reviewerScore':[0,0],'reason':'Actual filter error demonstrable on a valid counterfixture, not excused because original rows accidentally agree.'})
   rubric.append({'caseId':prefix+'-T04','submission':'correctSQL,but learner explicitly asserts the first eligible booking should be omitted and reports only3rows','submittedRows':correct[1:],'reviewerScore':[1,0],'reason':'Missing understanding of complete result, expressly outside harmless-typo rule.'})
dump('rubric-witnesses.json',{'method':'Independent execution and finite human-readable reviewer judgments; no claimed LLM grader or learner trial', 'cases':rubric})
# Execute Python taken from our actual GoalCard/Chromium DOM, not from author logs.
m=module('courses');rendered=read(OUT/'rendered-python.json')
with tempfile.TemporaryDirectory(prefix='independent-dom-code-',dir='/dev/shm')as td:
 db=Path(td)/'db.sqlite';m.initialize(db)
 ns={'db_path':str(db),'max_preis':30,'sqlite3':sqlite3,'closing':contextlib.closing};capture=io.StringIO()
 with contextlib.redirect_stdout(capture):exec(compile(rendered['C-T07'],'actual-goalcard-C-T07','exec'),ns)
 check('DOM-C07-rows',ns['rows'],[(10,'Fotobasis',20),(20,'Audiolabor',30),(40,'Datenschutz-Werkstatt',10),(50,'Archiv <offen>',15)])
 exec(compile(rendered['C-T20'],'actual-goalcard-C-T20','exec'),ns)
 with sqlite3.connect(db)as con:after=con.execute('SELECT kid,titel FROM Kurs ORDER BY kid').fetchall()
 check('DOM-C20-persistence',after,[(10,'Grundlagenkurs'),(20,'Audiolabor'),(30,'Videoschnitt'),(40,'Datenschutz-Werkstatt'),(50,'Archiv <offen>')]);check('DOM-C20-rowcount',ns['affected'],1)
 dump('executed-rendered-python.json',{'C-T07stdout':capture.getvalue(),'C-T07rows':ns['rows'],'C-T20afterNewConnection':after,'C-T20affected':ns['affected'],'C-T07codeSha256':hashlib.sha256(rendered['C-T07'].encode()).hexdigest(),'C-T20codeSha256':hashlib.sha256(rendered['C-T20'].encode()).hexdigest()})
# Real separate PostgreSQL cluster, private Unix socket, independent minimal rights fixtures.
PG=Path('/home/enpasos/.local/pgsql-18/bin');log=[]
def run(args):
 p=subprocess.run([str(x)for x in args],capture_output=True,text=True,timeout=30)
 if p.returncode:raise RuntimeError(p.stderr)
 return p
with tempfile.TemporaryDirectory(prefix='independent-dcl-',dir='/dev/shm')as td:
 td=Path(td);sock=td/'sock';sock.mkdir();data=td/'data';started=False
 def query(sql):
  p=subprocess.run([str(PG/'psql'),'-X','-qAt','-h',str(sock),'-p','55437','-d','postgres','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate','-c',sql],capture_output=True,text=True,timeout=10);log.append({'sql':sql,'returncode':p.returncode,'stdout':p.stdout.strip(),'stderr':p.stderr.strip()});return p
 def must(sql):
  p=query(sql)
  if p.returncode:raise RuntimeError(p.stderr)
  return p.stdout.strip()
 try:
  run([PG/'initdb','-D',data,'-A','trust','--no-locale']);run([PG/'pg_ctl','-D',data,'-l',td/'pg.log','-o',f"-h '' -k {sock} -p 55437 -F",'-w','start']);started=True;must('CREATE ROLE auskunft NOLOGIN;')
  for prefix,person,offer,key,price,contact,view in [('C','Person','Kurs','kid','preis','Kontakt','KursAuskunft'),('B','Leser','Medium','mid','gebuehr','Leserkontakt','MedienAuskunft'),('F','Gast','Auftritt','auftritt_id','preis','Gastkontakt','ProgrammAuskunft')]:
   schema='review_'+prefix.lower();pre=f'SET search_path TO {schema};';must(f'CREATE SCHEMA {schema}; GRANT USAGE ON SCHEMA {schema} TO auskunft;'+pre+f'CREATE TABLE {person}(pid integer primary key,name text);INSERT INTO {person} VALUES(1,\'base-data\');CREATE TABLE {offer}({key} integer primary key,titel text,{price} integer);INSERT INTO {offer} VALUES(10,\'public-data\',20);CREATE TABLE {contact}(email text);INSERT INTO {contact} VALUES(\'private@example.invalid\');CREATE VIEW {view} AS SELECT {key},titel,{price} FROM {offer};GRANT SELECT ON {person} TO auskunft;')
   def probe(label,statement,expected):
    p=query(pre+'SET ROLE auskunft;'+statement);actual='allowed'if p.returncode==0 else ('denied42501'if'42501'in p.stderr else p.stderr);check(prefix+'/DCL/'+label,actual,expected)
   probe('base-before',f'SELECT * FROM {person};','allowed');probe('view-before',f'SELECT * FROM {view};','denied42501')
   grant=re.search(r'GRANT SELECT ON \w+ TO auskunft',nc[prefix+'-T21']['task']).group();must(pre+grant+';')
   probe('base-after-grant',f'SELECT * FROM {person};','allowed');probe('view-after-grant',f'SELECT * FROM {view};','allowed');probe('contact-after-grant',f'SELECT * FROM {contact};','denied42501');probe('write-after-grant',f'UPDATE {offer} SET {price}=0;','denied42501')
   revoke=re.search(r'REVOKE SELECT ON \w+ FROM auskunft;',nc[prefix+'-T21']['solution']).group();must(pre+revoke)
   probe('base-after-revoke',f'SELECT * FROM {person};','denied42501');probe('view-after-revoke',f'SELECT * FROM {view};','allowed');probe('contact-after-revoke',f'SELECT * FROM {contact};','denied42501');probe('write-after-revoke',f'UPDATE {offer} SET {price}=0;','denied42501')
 finally:
  if started:run([PG/'pg_ctl','-D',data,'-m','fast','-w','stop'])
 dump('independent-dcl-execution.json',{'postgresVersion':run([PG/'postgres','--version']).stdout.strip(),'transport':'private Unix socket, no TCP listener','statements':log,'clusterStopped':started,'clusterRemovedOnContextExit':True,'scope':'Independent minimal fixtures verify exact three supplied GRANT/REVOKE statements and permitted/forbidden reads/writes; no production or security rollout.'})
dump('checks.json',{'checks':checks,'count':len(checks),'matched':sum(c['matched']for c in checks),'authorTestsUsedAsProof':False})
print(json.dumps({'checks':len(checks),'matched':sum(c['matched']for c in checks),'caseLeafChanges':len(changes),'DCLStatements':len(log)}))
