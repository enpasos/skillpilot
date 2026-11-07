#!/usr/bin/env python3
"""Executable own assessment reference; fictional data, no production adapter."""
# SPDX-License-Identifier: Apache-2.0
import argparse
import copy
from contextlib import closing
import html
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
import json
from pathlib import Path
import re
import sqlite3
from urllib.parse import parse_qs,urlencode,urlsplit

PAGE_SIZE=2
FIXTURE_SESSION={'pid':1,'csrfToken':'fictional-session-csrf'}
SQL={
 'A04':"SELECT p.pseudonym,k.titel,k.preis FROM Person p JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis>=20 ORDER BY k.preis DESC,p.pseudonym ASC",
 'A05':"SELECT k.kid,COUNT(b.pid),SUM(CASE WHEN b.pid IS NOT NULL THEN k.preis ELSE 0 END) FROM Kurs k LEFT JOIN Buchung b ON b.kid=k.kid AND b.status='aktiv' GROUP BY k.kid ORDER BY k.kid",
 'A05_HAVING':"SELECT k.kid FROM Kurs k LEFT JOIN Buchung b ON b.kid=k.kid AND b.status='aktiv' GROUP BY k.kid HAVING COUNT(b.pid)>=2 ORDER BY k.kid",
 'A06':"SELECT kid FROM Kurs WHERE preis>(SELECT AVG(preis) FROM Kurs) ORDER BY kid",
 'A11_PRODUCT':"SELECT p.pid,k.kid FROM Person p CROSS JOIN Kurs k WHERE p.ort='Kassel' AND k.preis<=20 ORDER BY p.pid,k.kid",
 'A11_JOIN':"SELECT p.pseudonym,k.titel FROM Person p JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid WHERE p.ort='Kassel' AND b.status='aktiv' ORDER BY p.pseudonym,k.kid",
 'A12':"SELECT DISTINCT p.pseudonym FROM Person p JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis<=20 ORDER BY p.pseudonym",
 'A19_A':"SELECT pid FROM Person WHERE ort='Kassel' ORDER BY pid",
 'A19_B':"SELECT pid,kid FROM Buchung WHERE status='aktiv' ORDER BY pid,kid",
 'A19_C':"SELECT k.kid,t.name FROM Kurs k JOIN Team t ON t.tid=k.tid WHERE k.preis<=30 ORDER BY k.kid",
 'A19_D':"SELECT DISTINCT p.pseudonym,k.titel,t.name FROM Person p JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid JOIN Team t ON t.tid=k.tid WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis<=30 ORDER BY p.pseudonym,k.kid",

}
EVENTS=[('e1','P1',10),('e2','P1',20),('e3','P1',10),('e4','P2',30),('e5','P2',20),('e6','P2',10)]
INITIAL_SETTINGS={'personalizedRecommendations':True,'preciseLocation':True,'profilePublic':True,'analyticsRetentionDays':365}


class BadInput(ValueError):pass


def connection(path):
    con=sqlite3.connect(path)
    con.execute('PRAGMA foreign_keys=ON')
    return con


def initialize(path):
    with closing(connection(path)) as con:con.executescript(Path(__file__).with_name('data.sql').read_text())


def one_integer(params,name,low,high):
    values=params.get(name,[])
    if len(values)!=1 or not re.fullmatch(r'[0-9]+',values[0]):raise BadInput(name)
    value=int(values[0])
    if not low<=value<=high:raise BadInput(name)
    return value


def search_arguments(query):
    params=parse_qs(query,keep_blank_values=True)
    if set(params)!={'maxPreis','page'}:raise BadInput('parameter names')
    return one_integer(params,'maxPreis',0,1000),one_integer(params,'page',1,100)


def search(path,max_preis,page):
    with closing(connection(path)) as con:
        rows=con.execute('SELECT kid,titel,preis FROM Kurs WHERE preis<=? ORDER BY kid LIMIT ? OFFSET ?',
                         (max_preis,PAGE_SIZE,(page-1)*PAGE_SIZE)).fetchall()
        total=con.execute('SELECT COUNT(*) FROM Kurs WHERE preis<=?',(max_preis,)).fetchone()[0]
    return rows,total


def render_search(rows,total,max_preis,page):
    escaped=lambda value:html.escape(str(value),quote=True)
    form='<form action="/kurse" method="get"><label for="preis">Hoechstpreis in EUR</label>'
    form+=f'<input id="preis" name="maxPreis" type="number" min="0" max="1000" required value="{max_preis}">'
    form+='<input name="page" type="hidden" value="1"><button>Suchen</button></form>'
    content='<table><thead><tr><th>ID</th><th>Titel</th><th>Preis EUR</th></tr></thead><tbody>'
    for kid,titel,preis in rows:
        content+=f'<tr><td>{kid}</td><td data-title>{escaped(titel)}</td><td>{preis}</td></tr>'
    content+='</tbody></table>'
    if not rows:content+='<p role="status">Keine Kurse auf dieser Seite.</p>'
    for label,target in [('Zurueck',page-1 if page>1 else None),('Weiter',page+1 if page*PAGE_SIZE<total else None)]:
        if target is not None:
            url='/kurse?'+urlencode({'maxPreis':max_preis,'page':target})
            content+=f'<a href="{escaped(url)}">{label}</a>'
    booking='<form action="/buchen" method="post"><input name="kid" type="hidden" value="40">'
    booking+=f'<input name="csrfToken" type="hidden" value="{escaped(FIXTURE_SESSION["csrfToken"])}"><button>Kurs 40 buchen</button></form>'
    return '<!doctype html><html lang="de"><meta charset="utf-8"><title>LeihZeit</title><body>'+form+content+booking+'</body></html>'


def book(path,body,session):
    params=parse_qs(body,keep_blank_values=True)
    if set(params)!={'kid','csrfToken'}:return 400,'Parameter'
    try:kid=one_integer(params,'kid',1,1000000)
    except BadInput:return 400,'Kursparameter'
    if params['csrfToken']!=[session['csrfToken']]:return 403,'CSRF'
    con=connection(path)
    try:
        con.execute('BEGIN IMMEDIATE')
        course=con.execute('SELECT maxPlaetze FROM Kurs WHERE kid=?',(kid,)).fetchone()
        if course is None:return 404,'Kurs'
        if con.execute('SELECT 1 FROM Buchung WHERE pid=? AND kid=?',(session['pid'],kid)).fetchone():return 409,'Buchung bereits vorhanden'
        count=con.execute("SELECT COUNT(*) FROM Buchung WHERE kid=? AND status='aktiv'",(kid,)).fetchone()[0]
        if count>=course[0]:return 409,'Kurs voll'
        con.execute("INSERT INTO Buchung(pid,kid,status) VALUES(?,?,'aktiv')",(session['pid'],kid))
        con.commit();return 201,'Gebucht'
    finally:con.close()


def apply_settings(current,new):
    if set(new)!=set(INITIAL_SETTINGS):raise BadInput('settings names')
    if any(type(new[k]) is not bool for k in ('personalizedRecommendations','preciseLocation','profilePublic')):raise BadInput('boolean setting')
    if type(new['analyticsRetentionDays']) is not int or new['analyticsRetentionDays'] not in (7,30,365):raise BadInput('retention')
    result=copy.deepcopy(current);result.update(new);return result


def map_reduce(events=EVENTS):
    maps={'P1':[],'P2':[]};groups={}
    for event,partition,kid in events:maps[partition].append((kid,1));groups.setdefault(kid,[]).append(1)
    return maps,groups,{kid:sum(values) for kid,values in groups.items()}


def handler(path):
    class Handler(BaseHTTPRequestHandler):
        def send_text(self,status,text,content_type='text/plain; charset=utf-8'):
            raw=text.encode();self.send_response(status);self.send_header('Content-Type',content_type)
            self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
        def do_GET(self):
            parsed=urlsplit(self.path)
            if parsed.path!='/kurse':self.send_text(404,'Pfad');return
            try:max_preis,page=search_arguments(parsed.query)
            except BadInput:self.send_text(400,'Parameter');return
            rows,total=search(path,max_preis,page)
            self.send_text(200,render_search(rows,total,max_preis,page),'text/html; charset=utf-8')
        def do_POST(self):
            if self.path!='/buchen':self.send_text(404,'Pfad');return
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=4096:self.send_text(400,'Body');return
            status,text=book(path,self.rfile.read(length).decode(),FIXTURE_SESSION)
            self.send_text(status,text)
        def log_message(self,*args):pass
    return Handler


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--serve',action='store_true');parser.add_argument('--db',type=Path,required=True)
    args=parser.parse_args();initialize(args.db)
    server=ThreadingHTTPServer(('127.0.0.1',0),handler(args.db))
    print(json.dumps({'url':f'http://127.0.0.1:{server.server_port}/kurse?maxPreis=30&page=1','fixtureOnly':True}),flush=True)
    try:server.serve_forever()
    finally:server.server_close()
