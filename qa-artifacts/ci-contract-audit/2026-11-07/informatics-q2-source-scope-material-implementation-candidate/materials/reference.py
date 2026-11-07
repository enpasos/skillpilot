#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Complete local author reference: artificial SQLite/HTML/HTTP fixtures only."""
import copy,html,json,re,sqlite3
from pathlib import Path
from contextlib import closing
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import parse_qs,urlsplit,urlencode
SCHEMA='''PRAGMA foreign_keys=ON;
CREATE TABLE Person(pid INTEGER PRIMARY KEY,pseudonym TEXT NOT NULL,ort TEXT NOT NULL);
CREATE TABLE Team(tid INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE Raum(rid INTEGER PRIMARY KEY,name TEXT NOT NULL);
CREATE TABLE Kurs(kid INTEGER PRIMARY KEY,titel TEXT NOT NULL,preis INTEGER NOT NULL CHECK(preis>=0),maxPlaetze INTEGER NOT NULL CHECK(maxPlaetze>0),tid INTEGER NOT NULL REFERENCES Team(tid),rid INTEGER REFERENCES Raum(rid));
CREATE TABLE Buchung(pid INTEGER NOT NULL REFERENCES Person(pid),kid INTEGER NOT NULL REFERENCES Kurs(kid),status TEXT NOT NULL CHECK(status IN ('aktiv','storniert')),PRIMARY KEY(pid,kid));
CREATE TABLE Kontakt(pid INTEGER PRIMARY KEY REFERENCES Person(pid),email TEXT NOT NULL);
INSERT INTO Person VALUES(1,'ada','Kassel'),(2,'ben','Kassel'),(3,'cora','Fulda'),(4,'dino','Marburg'),(5,'eva','Fulda');
INSERT INTO Team VALUES(1,'Werkstatt'),(2,'Offene Medien'),(3,'Archiv');
INSERT INTO Raum VALUES(1,'Nord'),(2,'Sued');
INSERT INTO Kurs VALUES(10,'Fotobasis',20,3,1,1),(20,'Audiolabor',30,2,2,2),(30,'Videoschnitt',40,2,1,NULL),(40,'Datenschutz-Werkstatt',10,4,2,1),(50,'Archiv <offen>',15,2,3,NULL);
INSERT INTO Buchung VALUES(1,10,'aktiv'),(2,10,'aktiv'),(3,10,'storniert'),(2,20,'aktiv'),(3,20,'aktiv'),(1,30,'aktiv'),(4,30,'aktiv'),(5,40,'aktiv'),(2,40,'storniert');
INSERT INTO Kontakt VALUES(1,'ada@example.invalid'),(3,'cora@example.invalid');
CREATE TABLE R(a INTEGER PRIMARY KEY,x TEXT NOT NULL);
CREATE TABLE S(b INTEGER PRIMARY KEY,y TEXT NOT NULL);
CREATE TABLE V(a INTEGER REFERENCES R(a),b INTEGER REFERENCES S(b),PRIMARY KEY(a,b));
INSERT INTO R VALUES(1,'rot'),(2,'blau');INSERT INTO S VALUES(10,'rot'),(20,'gruen');INSERT INTO V VALUES(1,10),(1,20),(2,20);
'''
SQL={
'SELECT':"SELECT p.pseudonym,k.titel,k.preis FROM Person p JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis>=20 ORDER BY k.preis DESC,p.pseudonym,k.kid,p.pid",
'GROUP':"SELECT k.kid,COUNT(*),SUM(k.preis) FROM Kurs k JOIN Buchung b ON b.kid=k.kid WHERE b.status='aktiv' GROUP BY k.kid ORDER BY k.kid",
'SUBQUERY':"SELECT kid FROM Kurs WHERE preis>(SELECT AVG(preis) FROM Kurs) ORDER BY kid",
'ALG_PROBLEM':"SELECT DISTINCT r.x FROM R r JOIN V v ON v.a=r.a WHERE v.b=20 ORDER BY r.x",
'ALG_A':"SELECT * FROM R WHERE x='rot' ORDER BY a",
'ALG_B':"SELECT v.a,v.b,s.y FROM V v JOIN S s ON v.b=s.b ORDER BY v.a,v.b",
'ALG_C':"SELECT r.a,r.x,v.b,s.y FROM R r JOIN V v ON r.a=v.a JOIN S s ON s.b=v.b WHERE r.x='rot' ORDER BY r.a,v.b",
'ALG_D':"SELECT DISTINCT s.y FROM R r JOIN (V v JOIN S s ON s.b=v.b) ON r.a=v.a WHERE r.x='rot' ORDER BY s.y",
'ALG_OPT':"SELECT DISTINCT p.pid,k.titel FROM Person p JOIN Buchung b ON p.pid=b.pid JOIN Kurs k ON k.kid=b.kid WHERE k.preis<=20 ORDER BY p.pid,k.kid",
}
class BadInput(ValueError):pass
def connect(path):
    con=sqlite3.connect(path);con.execute('PRAGMA foreign_keys=ON');return con
def initialize(path):
    with closing(connect(path)) as con:con.executescript(SCHEMA)
def one(params,name,low,high,maxlen):
    v=params.get(name,[])
    if len(v)!=1 or not isinstance(v[0],str) or not 1<=len(v[0])<=maxlen or not re.fullmatch('[0-9]+',v[0]):raise BadInput(name)
    n=int(v[0])
    if not low<=n<=high:raise BadInput(name)
    return n
def args(query,key,low,high,maxlen):
    p=parse_qs(query,keep_blank_values=True,max_num_fields=10)
    if set(p)!={key}:raise BadInput('names')
    return one(p,key,low,high,maxlen)
def select_rows(path,max_preis):
    with closing(connect(path)) as con:return con.execute('SELECT kid,titel,preis FROM Kurs WHERE preis<=? ORDER BY kid',(max_preis,)).fetchall()
def page_rows(path,page):
    with closing(connect(path)) as con:
        rows=con.execute('SELECT kid,titel,preis FROM Kurs ORDER BY kid LIMIT ? OFFSET ?',(2,(page-1)*2)).fetchall()
        total=con.execute('SELECT COUNT(*) FROM Kurs').fetchone()[0]
    return rows,total
def table(rows):
    esc=lambda v:html.escape(str(v),quote=True)
    out='<table><thead><tr><th>ID</th><th>Titel</th><th>Preis EUR</th></tr></thead><tbody>'
    out+=''.join('<tr>'+''.join('<td>'+esc(v)+'</td>' for v in row)+'</tr>' for row in rows)
    return out+'</tbody></table>'+('' if rows else '<p>Keine Treffer</p>')
def filter_html(path,max_preis):
    return '<form action="/kurse" method="get"><label for="p">Höchstpreis EUR</label><input id="p" name="maxPreis" type="number" min="0" max="1000" required value="'+str(max_preis)+'"><button>Suchen</button></form>'+table(select_rows(path,max_preis))
def page_html(path,page):
    rows,total=page_rows(path,page);out=table(rows)
    if page>1:out+='<a href="/seiten?'+urlencode({'page':page-1})+'">Zurück</a>'
    if page*2<total:out+='<a href="/seiten?'+urlencode({'page':page+1})+'">Weiter</a>'
    return out
def rename(path,title,kid):
    con=connect(path)
    try:
        cursor=con.execute('UPDATE Kurs SET titel=? WHERE kid=?',(title,kid));affected=cursor.rowcount;con.commit()
    except sqlite3.Error:
        con.rollback();raise
    finally:con.close()
    with closing(connect(path)) as check:after=check.execute('SELECT kid,titel FROM Kurs ORDER BY kid').fetchall()
    return affected,after
def book(path,params):
    if set(params)!={'kid','csrfToken'}:return 400
    try:kid=one(params,'kid',1,1000000,7)
    except BadInput:return 400
    if params['csrfToken']!=['fixture-token']:return 403
    con=connect(path)
    try:
        con.execute('BEGIN IMMEDIATE')
        if not con.execute('SELECT 1 FROM Kurs WHERE kid=?',(kid,)).fetchone():return 404
        if con.execute('SELECT 1 FROM Buchung WHERE pid=? AND kid=?',(1,kid)).fetchone():return 409
        course=con.execute('SELECT maxPlaetze FROM Kurs WHERE kid=?',(kid,)).fetchone()
        count=con.execute("SELECT COUNT(*) FROM Buchung WHERE kid=? AND status='aktiv'",(kid,)).fetchone()[0]
        if count>=course[0]:return 409
        con.execute("INSERT INTO Buchung VALUES(?,?,'aktiv')",(1,kid));con.commit();return 201
    except sqlite3.Error:con.rollback();raise
    finally:con.close()
def settings(current):
    result=copy.deepcopy(current);result.update(personalizedRecommendations=False,preciseLocation=False,profilePublic=False,analyticsRetentionDays=7);return result
def state_trace(events):
    outer='Entwurf';pay=ready=None;history=[]
    for event in events:
        if outer=='Entwurf' and event=='absenden':outer='Bearbeitung';pay='Offen';ready='Wartet'
        elif outer=='Bearbeitung':
            if event=='abbrechen':outer='Storniert';pay=ready=None
            elif event=='zahlungOK':pay='Bezahlt'
            elif event=='bereit':ready='Bereit'
            if pay=='Bezahlt' and ready=='Bereit':outer='Erledigt';pay=ready=None
        history.append((outer,pay,ready))
    return history
def handler(path):
    class Handler(BaseHTTPRequestHandler):
        def send(self,status,body):
            raw=body.encode();self.send_response(status);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
        def do_GET(self):
            u=urlsplit(self.path)
            try:
                if u.path=='/kurse':body=filter_html(path,args(u.query,'maxPreis',0,1000,4))
                elif u.path=='/seiten':body=page_html(path,args(u.query,'page',1,100,3))
                else:self.send(404,'Pfad');return
                self.send(200,body)
            except (BadInput,ValueError):self.send(400,'Parameter')
            except sqlite3.Error:self.send(500,'Datenbankfehler')
        def do_POST(self):
            try:
                rawlen=self.headers.get('Content-Length','')
                if not rawlen.isascii() or not rawlen.isdigit() or len(rawlen)>5:raise BadInput('length')
                n=int(rawlen)
                if not 1<=n<=8192:raise BadInput('length')
                p=parse_qs(self.rfile.read(n).decode('utf-8'),keep_blank_values=True,max_num_fields=10)
                if self.path=='/buchen':self.send(book(path,p),'Buchungsstatus');return
                if self.path!='/titel':self.send(404,'Pfad');return
                if set(p)!={'kid','titel'}:raise BadInput('names')
                kid=one(p,'kid',1,1000000,7);title=p['titel']
                if len(title)!=1 or not 1<=len(title[0])<=80:raise BadInput('title')
                affected,after=rename(path,title[0],kid);self.send(200 if affected==1 else 404,'Geändert' if affected==1 else 'Kurs fehlt')
            except (BadInput,ValueError,UnicodeDecodeError):self.send(400,'Parameter')
            except sqlite3.Error:self.send(500,'Datenbankfehler')
        def log_message(self,*args):pass
    return Handler
if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('db');a=p.parse_args();initialize(a.db)
    with ThreadingHTTPServer(('127.0.0.1',0),handler(a.db)) as server:
        print(json.dumps({'fixtureOnly':True,'port':server.server_port}),flush=True);server.serve_forever()
