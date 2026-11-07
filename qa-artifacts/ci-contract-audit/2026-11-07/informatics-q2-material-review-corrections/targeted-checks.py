#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite FMR counterexamples,actual PostgreSQL DCL,and rendered-Python execution."""
from pathlib import Path
import json,hashlib,importlib.util,tempfile,subprocess,re,io,contextlib,sqlite3,socket,shutil
from contextlib import closing
R=Path(__file__).parent;ROOT=Path('/home/enpasos/projects/skillpilot');BASE=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-material-implementation-candidate/materials';REVIEW=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-full-material-independent-review'
BANK=json.load(open(R/'casebank.json'));NATIVE=json.load(open(R/'native-examData.json'));OLD=json.load(open(BASE/'casebank.json'));OLDN=json.load(open(BASE/'native-examData.json'));CHECKS=[]
def assert_result(id,actual,expected):
 CHECKS.append({'id':id,'actual':actual,'expected':expected,'pass':actual==expected})
 if actual!=expected:raise AssertionError((id,actual,expected))
def module(domain):
 s=importlib.util.spec_from_file_location('ref_'+domain,R/('reference-'+domain+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
# Execute actual GRANT/REVOKE and queries with unprivileged roles on a throwaway PostgreSQL cluster.
PG=Path('/home/enpasos/.local/pgsql-18/bin');PGROOT=R/'pg-ram';PGROOT.mkdir(exist_ok=True)
data=PGROOT/'data';sock=PGROOT/'socket';sock.mkdir(exist_ok=True)
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
commands=[];sql_log=[]
def command(argv,check=True):
 p=subprocess.run([str(x) for x in argv],text=True,capture_output=True);commands.append({'program':Path(argv[0]).name,'returncode':p.returncode})
 if check and p.returncode:raise RuntimeError((argv,p.stdout,p.stderr))
 return p
def psql(sql,role=None,schema=None,allowerror=False):
 prefix=('SET search_path TO '+schema+';' if schema else '')+('SET ROLE '+role+';' if role else '')
 p=command([PG/'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=sqlstate','-h',sock,'-p',str(port),'-d','postgres','-c',prefix+sql],check=not allowerror)
 sql_log.append({'schema':schema,'role':role,'sql':sql,'returncode':p.returncode,'stdout':p.stdout.strip(),'stderr':p.stderr.strip()})
 return p
started=False
try:
 command([PG/'initdb','-D',data,'-A','trust','--no-locale'])
 command([PG/'pg_ctl','-D',data,'-l',PGROOT/'server.log','-o',f"-h '' -k {sock} -p {port} -F",'-w','start']);started=True
 psql('CREATE ROLE auskunft NOLOGIN;CREATE ROLE anmeldedienst NOLOGIN;')
 for domain,prefix,person,contact,view,offer,idcol in [
 ('courses','C','Person','Kontakt','KursAuskunft','Kurs','kid'),
 ('library','B','Leser','Leserkontakt','MedienAuskunft','Medium','mid'),
 ('festival','F','Gast','Gastkontakt','ProgrammAuskunft','Auftritt','auftritt_id')]:
  m=module(domain);schema=domain
  schemaSQL=m.SCHEMA.replace('PRAGMA foreign_keys=ON;','')
  psql('CREATE SCHEMA '+schema+';GRANT USAGE ON SCHEMA '+schema+' TO auskunft;')
  psql(schemaSQL+f'CREATE VIEW {view} AS SELECT {idcol},titel,{"gebuehr" if domain=="library" else "preis"} FROM {offer};GRANT SELECT ON {person} TO auskunft;',schema=schema)
  assert_result(prefix+'-T21-PG-before-base-query',psql(f'SELECT count(*) FROM {person}',role='auskunft',schema=schema).stdout.strip(),'5')
  before=psql(f'SELECT count(*) FROM {view}',role='auskunft',schema=schema,allowerror=True)
  assert_result(prefix+'-T21-PG-before-view-denied',before.returncode!=0 and '42501' in before.stderr,True)
  grant=re.search(r'GRANT SELECT ON (\w+) TO auskunft',BANK[prefix+'-T21']['task']).group(0)
  psql(grant,schema=schema)
  assert_result(prefix+'-T21-PG-after-GRANT-view-query',psql(f'SELECT count(*) FROM {view}',role='auskunft',schema=schema).stdout.strip(),'5')
  assert_result(prefix+'-T21-PG-after-GRANT-base-still-allowed',psql(f'SELECT count(*) FROM {person}',role='auskunft',schema=schema).stdout.strip(),'5')
  revoke=re.search(r'REVOKE SELECT ON \w+ FROM auskunft;',BANK[prefix+'-T21']['solution']).group(0)
  psql(revoke,schema=schema)
  base=psql(f'SELECT count(*) FROM {person}',role='auskunft',schema=schema,allowerror=True)
  assert_result(prefix+'-T21-PG-after-REVOKE-base-denied',base.returncode!=0 and '42501' in base.stderr,True)
  assert_result(prefix+'-T21-PG-after-REVOKE-view-still-allowed',psql(f'SELECT count(*) FROM {view}',role='auskunft',schema=schema).stdout.strip(),'5')
  for label,q in [('contact',f'SELECT * FROM {contact}'),('write',f'UPDATE {offer} SET titel=\'falsch\'')]:
   result=psql(q,role='auskunft',schema=schema,allowerror=True);assert_result(prefix+'-T21-PG-'+label+'-denied',result.returncode!=0 and '42501' in result.stderr,True)
  # PostgreSQL also executes the independently started subquery/DML/DDL cases.
  price='gebuehr' if domain=='library' else 'preis'
  assert_result(prefix+'-T21-PG-subquery',psql(f'SELECT {idcol} FROM {offer} WHERE {price}>(SELECT AVG({price}) FROM {offer}) ORDER BY {idcol};',schema=schema).stdout.strip(),'20\n30')
  psql(f'UPDATE {offer} SET {price}={price}+5 WHERE {idcol}=20;',schema=schema)
  assert_result(prefix+'-T21-PG-targeted-update',psql(f'SELECT {price} FROM {offer} WHERE {idcol}=20;',schema=schema).stdout.strip(),'35')
  psql(f'ALTER TABLE {offer} ADD COLUMN sichtbar INTEGER NOT NULL DEFAULT 1;',schema=schema)
  assert_result(prefix+'-T21-PG-DDL-existing-default',psql(f'SELECT sum(sichtbar) FROM {offer};',schema=schema).stdout.strip(),'5')
finally:
 if started:command([PG/'pg_ctl','-D',data,'-m','fast','-w','stop'])
 (R/'postgres-dcl-execution.json').write_text(json.dumps({'status':'actual PostgreSQL18 local throwaway-cluster statements/permission queries executed','version':command([PG/'postgres','--version']).stdout.strip(),'transport':'private Unix socket only,no listening TCP host','statements':sql_log,'commandResults':commands,'clusterStopped':started,'noCredentialsOrProductionSettingsChanged':True},ensure_ascii=False,indent=2)+'\n')
 shutil.rmtree(PGROOT)
# Finite rubric examples evaluate concrete SQL output AND submitted rows;no production grader/engine.
for domain,prefix in [('courses','C'),('library','B'),('festival','F')]:
 m=module(domain)
 with tempfile.TemporaryDirectory(dir=R) as tmp:
  db=str(Path(tmp)/'f.db');m.initialize(db)
  with closing(m.connect(db)) as con:
   sql=BANK[prefix+'-T04']['solution'].split(';')[0]+';';expected=con.execute(sql).fetchall()
   typos=expected.copy();typos[0]=expected[0][:-1]+(39,)
   # A fixed proof rule for these explicit review cases,not a general grading runtime.
   def sample_score(query,submitted):
    actual=con.execute(query).fetchall()
    # The base instance alone does not distinguish a missing status predicate;
    # a separate counterfixture raises the price of the existing cancelled40-row.
    offer={'courses':'Kurs','library':'Medium','festival':'Auftritt'}[domain]
    key={'courses':'kid','library':'mid','festival':'auftritt_id'}[domain]
    price='gebuehr' if domain=='library' else 'preis'
    con.execute(f'UPDATE {offer} SET {price}=20 WHERE {key}=40')
    auxiliary_expected=con.execute(sql).fetchall();auxiliary_actual=con.execute(query).fetchall()
    con.execute(f'UPDATE {offer} SET {price}=10 WHERE {key}=40')
    sql_evidence=actual==expected and auxiliary_actual==auxiliary_expected
    shape_same=len(submitted)==len(expected) and all(tuple(row[:-1])==tuple(want[:-1]) for row,want in zip(submitted,expected))
    numerical_mismatches=sum(row[-1]!=want[-1] for row,want in zip(submitted,expected)) if shape_same else 999
    output_understood=submitted==expected or (sql_evidence and shape_same and numerical_mismatches==1)
    return [int(sql_evidence),int(output_understood and sql_evidence)]
   assert_result(prefix+'-T04-correct-SQL-plus-isolated-39-typo',sample_score(sql,typos),[1,1])
   assert_result(prefix+'-T04-perfect-answer',sample_score(sql,expected),[1,1])
   wrongjoin=sql.replace('b.pid=p.pid','b.pid=b.'+('kid' if domain=='courses' else 'mid' if domain=='library' else 'auftritt_id'))
   assert_result(prefix+'-T04-wrong-join-remains-open',sample_score(wrongjoin,typos),[0,0])
   wrongsort=sql.replace('DESC','ASC');assert_result(prefix+'-T04-wrong-ORDER-BY-remains-open',sample_score(wrongsort,list(reversed(expected))),[0,0])
   missingfilter=sql.replace("AND b.status='aktiv' ",'');assert_result(prefix+'-T04-missing-status-filter-remains-open',sample_score(missingfilter,expected),[0,0])
   assert_result(prefix+'-T04-missing-output-row-remains-open',sample_score(sql,expected[:-1]),[1,0])
   assert_result(prefix+'-T04-wrong-output-order-remains-open',sample_score(sql,list(reversed(expected))),[1,0])
   for eid,data in NATIVE.items():
    if any(s['id']==prefix+'-T04-C2' for s in data['scoring']['steps']):
     maximum=data['scoring']['maxPoints'];others=maximum-2
     assert_result(eid+'-T04-review-typo-full-contract-pass',sum(sample_score(sql,typos))+others>=data['scoring']['passingPoints'],True)
     assert_result(eid+'-T04-real-SQL-error-no-compensation',sum(sample_score(wrongjoin,typos))+others>=data['scoring']['passingPoints'],False)
# Execute exact code text returned from Chromium's actual GoalCard DOM,not reconstructed source.
render=json.load(open(R/'render-checks.json'))
for record in [x for x in render['observations'] if 'caseId' in x]:
 case=record['caseId'];code=record['code'][0]['text'];compile(code,case+'-from-Chromium','exec')
 m=module('courses')
 with tempfile.TemporaryDirectory(dir=R) as tmp:
  db=str(Path(tmp)/'f.db');m.initialize(db);namespace={'db_path':db,'max_preis':30,'sqlite3':sqlite3,'closing':closing};stdout=io.StringIO()
  with contextlib.redirect_stdout(stdout):exec(code,namespace)
  if case=='C-T07':assert_result(case+'-rendered-code-executes-full-iteration',stdout.getvalue().splitlines(),['10 Fotobasis 20','20 Audiolabor 30','40 Datenschutz-Werkstatt 10','50 Archiv <offen> 15'])
  else:
   assert_result(case+'-rendered-code-UPDATE-rowcount',namespace['affected'],1)
   with sqlite3.connect(db) as c:after=c.execute('SELECT kid,titel FROM Kurs ORDER BY kid').fetchall()
   assert_result(case+'-rendered-code-persistent-change-and-others',after,[(10,'Grundlagenkurs'),(20,'Audiolabor'),(30,'Videoschnitt'),(40,'Datenschutz-Werkstatt'),(50,'Archiv <offen>')])
# Exact preservation and finite change inventory.
assert_result('all-five-assembly-identities',list(NATIVE),list(OLDN))
for eid,data in NATIVE.items():
 assert_result(eid+'-exact-ordered-coverage',data['coveredGoalIds'],OLDN[eid]['coveredGoalIds'])
 assert_result(eid+'-thresholds-unchanged',[data['scoring']['maxPoints'],data['scoring']['passingPoints']],[OLDN[eid]['scoring']['maxPoints'],OLDN[eid]['scoring']['passingPoints']])
 assert_result(eid+'-criterion-identities-points-unchanged',[(s['id'],s['points']) for s in data['scoring']['steps']],[(s['id'],s['points']) for s in OLDN[eid]['scoring']['steps']])
 assert_result(eid+'-draft-preserved',data['reviewStatus'],'draft')
for case,v in BANK.items():assert_result(case+'-full-goal-meaning-unchanged',v['fullGoalDescription'],OLD[case]['fullGoalDescription'])
# Festival rubric's substantive model:valid four relations,repeat identity,min/max/nullableEndzeit preserved.
with sqlite3.connect(':memory:') as c:
 c.execute('PRAGMA foreign_keys=ON');c.executescript('CREATE TABLE Kuenstler(KuenstlerNr INTEGER PRIMARY KEY,Name TEXT NOT NULL);CREATE TABLE Buehne(BuehnenNr INTEGER PRIMARY KEY,Name TEXT NOT NULL);CREATE TABLE Produktion(ProduktionsNr INTEGER PRIMARY KEY,Titel TEXT NOT NULL,BuehnenNr INTEGER NOT NULL REFERENCES Buehne);CREATE TABLE Auftrittsauftrag(AuftragsNr INTEGER PRIMARY KEY,KuenstlerNr INTEGER NOT NULL REFERENCES Kuenstler,ProduktionsNr INTEGER NOT NULL REFERENCES Produktion,Startzeit TEXT NOT NULL,Endzeit TEXT);INSERT INTO Kuenstler VALUES(1,\'Ada\');INSERT INTO Buehne VALUES(2,\'Nord\');INSERT INTO Produktion VALUES(3,\'P\',2);INSERT INTO Auftrittsauftrag VALUES(4,1,3,\'10:00\',\'11:00\'),(5,1,3,\'12:00\',NULL);')
 assert_result('festival-model-repeat-and-optional-actual-Endzeit',c.execute('SELECT AuftragsNr,Endzeit FROM Auftrittsauftrag ORDER BY AuftragsNr').fetchall(),[(4,'11:00'),(5,None)])
 # Atmostone open per production is explicitly a temporal invariant,not silently a bare FK.
 valid=c.execute('SELECT ProduktionsNr FROM Auftrittsauftrag WHERE Endzeit IS NULL GROUP BY ProduktionsNr HAVING count(*)>1').fetchall()
 assert_result('festival-model-open-invariant-valid',valid,[])
 c.execute("INSERT INTO Auftrittsauftrag VALUES(6,1,3,'13:00',NULL)")
 assert_result('festival-model-open-invariant-negative',c.execute('SELECT ProduktionsNr FROM Auftrittsauftrag WHERE Endzeit IS NULL GROUP BY ProduktionsNr HAVING count(*)>1').fetchall(),[(3,)])
# Frozen original material and independent review hashes must still match exact seals.
for directory,manifest in [(BASE,json.load(open(BASE/'material-manifest.json'))),(REVIEW,json.load(open(REVIEW/'review-seal.json')))]:
 for item in manifest['files']:assert_result(str(directory.relative_to(ROOT))+'/'+item['path']+'-unchanged',sha(directory/item['path']),item['sha256'])
source=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
assert_result('active-informatics-source-unmodified',sha(source),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e')
report={'status':'targeted author counterexample execution passed;independent review still required','nativeMaterialSha256':sha(R/'native-examData.json'),'counts':{'checks':len(CHECKS),'passed':sum(c['pass'] for c in CHECKS)},'checks':CHECKS,'rubricProbeLimit':'Finite hand-constructed review submissions with explicit expected judgments,backed by executed SQL;not a production grading framework or native scorer proof.','dclEvidence':'Actual PostgreSQL18 native GRANT/REVOKE and permission-denied SQLSTATE42501;isolated cluster stopped and removed.','renderEvidence':'Exact Python text read from actual GoalCard Chromium DOM compiled/executed with supplied fixture variables.','noMaterialApprovalOrLearnerResult':True}
(R/'targeted-execution.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'pass','checks':len(CHECKS),'actualPostgresDCL':True,'actualRenderedPythonExecution':True,'originalMaterialAndReviewPreserved':True}))
