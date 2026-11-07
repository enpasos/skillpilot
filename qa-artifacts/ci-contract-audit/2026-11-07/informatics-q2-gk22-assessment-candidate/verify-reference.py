#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Execute actual authored SQLite/HTTP/model cases; no semantic-review claim."""
from contextlib import closing
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
from urllib.parse import urlencode
import sys
import unittest

sys.dont_write_bytecode=True
base=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('gk22_reference',base/'reference.py')
ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
RESULTS=[]


class ReferenceTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='gk22-sql-',dir='/dev/shm');self.db=Path(self.tmp.name)/'fixture.sqlite';ref.initialize(self.db)

    def tearDown(self):self.tmp.cleanup()

    def fetch(self,key):
        with closing(ref.connection(self.db)) as con:result=con.execute(ref.SQL[key]).fetchall()
        RESULTS.append({'case':key,'actualRows':result});return result

    def test_sql_case_results_are_exact(self):
        expected={
            'A04':[('ada','Videoschnitt',40),('ben','Audiolabor',30),('ada','Fotobasis',20),('ben','Fotobasis',20)],
            'A05':[(10,2,40),(20,2,60),(30,2,80),(40,1,10),(50,0,0)],
            'A05_HAVING':[(10,),(20,),(30,)],'A06':[(20,),(30,)],
            'A11_PRODUCT':[(1,10),(1,40),(1,50),(2,10),(2,40),(2,50)],
            'A11_JOIN':[('ada','Fotobasis'),('ada','Videoschnitt'),('ben','Fotobasis'),('ben','Audiolabor')],
            'A12':[('ada',),('ben',)],'A19_A':[(1,),(2,)],
            'A19_B':[(1,10),(1,30),(2,10),(2,20),(3,20),(4,30),(5,40)],
            'A19_C':[(10,'Werkstatt'),(20,'Offene Medien'),(40,'Offene Medien'),(50,'Archiv')],
            'A19_D':[('ada','Fotobasis','Werkstatt'),('ben','Fotobasis','Werkstatt'),('ben','Audiolabor','Offene Medien')]}
        for key,rows in expected.items():
            with self.subTest(key=key):self.assertEqual(self.fetch(key),rows)

    def test_zero_match_counterexample_exposes_bad_aggregation(self):
        with closing(ref.connection(self.db)) as con:
            bad=con.execute("SELECT k.kid,COUNT(*),SUM(k.preis) FROM Kurs k LEFT JOIN Buchung b ON b.kid=k.kid AND b.status='aktiv' GROUP BY k.kid ORDER BY k.kid").fetchall()
        self.assertEqual(bad[-1],(50,1,15));self.assertNotEqual(bad[-1],(50,0,0))
        RESULTS.append({'case':'A05-bad-aggregation-control','wrongRows':bad,'expectedCorrectLastRow':(50,0,0)})

    def test_ddl_dml_and_integrity_constraints_execute(self):
        with closing(ref.connection(self.db)) as con:
            con.execute('CREATE TABLE Hinweis(kid INTEGER PRIMARY KEY REFERENCES Kurs(kid),text TEXT NOT NULL)')
            con.execute("INSERT INTO Hinweis VALUES(10,'Kamera mitbringen')")
            con.execute("UPDATE Hinweis SET text='Geladene Kamera mitbringen' WHERE kid=10")
            self.assertEqual(con.execute('SELECT * FROM Hinweis').fetchall(),[(10,'Geladene Kamera mitbringen')])
            con.execute('DELETE FROM Hinweis WHERE kid=10');self.assertEqual(con.execute('SELECT * FROM Hinweis').fetchall(),[])
            con.execute('CREATE VIEW KursAuskunft AS SELECT kid,titel,preis FROM Kurs')
            self.assertEqual([r[1] for r in con.execute('PRAGMA table_info(KursAuskunft)')],['kid','titel','preis'])
            for statement in ["INSERT INTO Buchung VALUES(1,10,'aktiv')","INSERT INTO Buchung VALUES(99,10,'aktiv')","INSERT INTO Buchung VALUES(5,50,'unknown')"]:
                with self.assertRaises(sqlite3.IntegrityError):con.execute(statement)
            con.execute('UPDATE Kurs SET preis=preis+5 WHERE kid=20')
            self.assertEqual(con.execute('SELECT preis FROM Kurs WHERE kid=20').fetchone(),(35,))
            con.execute('ALTER TABLE Kurs ADD COLUMN sichtbar INTEGER NOT NULL DEFAULT 1')
            self.assertEqual(con.execute('SELECT DISTINCT sichtbar FROM Kurs').fetchall(),[(1,)])
        RESULTS.append({'case':'A06-A14-A15-actual-ddl-dml-constraints','pass':True,'DCLExecuted':False})

    def test_actual_search_pages_and_html_escaping(self):
        for page,ids in [(1,[10,20]),(2,[40,50]),(3,[])]:
            rows,total=ref.search(self.db,30,page);self.assertEqual(total,4);self.assertEqual([r[0] for r in rows],ids)
            text=ref.render_search(rows,total,30,page)
            if page==2:self.assertIn('Archiv &lt;offen&gt;',text);self.assertNotIn('Archiv <offen>',text)
            if page==3:self.assertIn('Keine Kurse',text)
            RESULTS.append({'case':'A08-A17-page'+str(page),'ids':ids,'html':text})

    def test_get_post_validation_and_real_private_mutation(self):
        self.assertEqual(ref.search_arguments('maxPreis=30&page=1'),(30,1))
        for query in ['maxPreis=0%20OR%201%3D1&page=1','maxPreis=30&page=-1','maxPreis=30&page=1&page=2','maxPreis=1001&page=1']:
            with self.assertRaises(ref.BadInput):ref.search_arguments(query)
        def book(**params):return ref.book(self.db,urlencode(params),ref.FIXTURE_SESSION)
        self.assertEqual(book(kid=40,csrfToken='wrong')[0],403)
        self.assertEqual(book(kid=40,pid=2,csrfToken=ref.FIXTURE_SESSION['csrfToken'])[0],400)
        self.assertEqual(book(kid=20,csrfToken=ref.FIXTURE_SESSION['csrfToken'])[0],409)
        self.assertEqual(book(kid=999,csrfToken=ref.FIXTURE_SESSION['csrfToken'])[0],404)
        self.assertEqual(book(kid=40,csrfToken=ref.FIXTURE_SESSION['csrfToken'])[0],201)
        with closing(ref.connection(self.db)) as con:
            self.assertEqual(con.execute('SELECT status FROM Buchung WHERE pid=1 AND kid=40').fetchall(),[('aktiv',)])
            self.assertEqual(con.execute('SELECT status FROM Buchung WHERE pid=2 AND kid=40').fetchall(),[('storniert',)])
        RESULTS.append({'case':'A07-A16-private-booking','sessionPid':1,'clientPidRejected':True,'otherExistingBookingUnchanged':True})

    def test_actual_settings_map_reduce_and_economic_results(self):
        new={'personalizedRecommendations':False,'preciseLocation':False,'profilePublic':False,'analyticsRetentionDays':7}
        self.assertEqual(ref.apply_settings(ref.INITIAL_SETTINGS,new),new)
        self.assertTrue(ref.INITIAL_SETTINGS['profilePublic'])
        for bad in [{**new,'analyticsRetentionDays':True},{**new,'analyticsRetentionDays':0},{**new,'preciseLocation':'false'}]:
            with self.assertRaises(ref.BadInput):ref.apply_settings(ref.INITIAL_SETTINGS,bad)
        maps,groups,reduced=ref.map_reduce()
        self.assertEqual(maps,{'P1':[(10,1),(20,1),(10,1)],'P2':[(30,1),(20,1),(10,1)]})
        self.assertEqual(groups,{10:[1,1,1],20:[1,1],30:[1]});self.assertEqual(reduced,{10:3,20:2,30:1})
        self.assertEqual(ref.map_reduce(list(reversed(ref.EVENTS)))[2],reduced)
        self.assertEqual(2000/1000*5,10);self.assertEqual(10-6,4)
        self.assertEqual(sorted(reduced,key=lambda k:-reduced[k]),[10,20,30])
        self.assertEqual(sorted(reduced,key=lambda k:-(reduced[k]+(10 if k==20 else 0))),[20,10,30])
        RESULTS.append({'case':'A18-A21-A22-actual-model-results','settings':new,'maps':maps,'shuffle':groups,'reduce':reduced,'revenue':10,'knownDirectSurplus':4})


if __name__=='__main__':
    program=unittest.main(argv=[sys.argv[0]],exit=False)
    output={'purpose':'execution-of-authored-own-assessment-reference-not-content-approval','tests':program.result.testsRun,
        'failures':len(program.result.failures),'errors':len(program.result.errors),'skips':len(program.result.skipped),
        'sqliteVersion':sqlite3.sqlite_version,'observations':RESULTS,
        'DCLExecuted':False,'ERAndLegalJudgmentsMachineProven':False,'independentContentApproval':False}
    if len(sys.argv)>1:Path(sys.argv[1]).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
