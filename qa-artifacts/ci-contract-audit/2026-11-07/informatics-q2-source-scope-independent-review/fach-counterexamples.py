"""Finite independent examples; no active source edits or learner writes."""
import json, pathlib, sqlite3

out=pathlib.Path(__file__).parent
db=sqlite3.connect(':memory:')
db.executescript('CREATE TABLE Item(id INTEGER PRIMARY KEY,price INTEGER NOT NULL,label TEXT NOT NULL);')
db.executemany('INSERT INTO Item VALUES (?,?,?)',[(1,8,'a'),(2,12,'b'),(3,15,'c'),(4,19,'d')])
query='SELECT id,label FROM Item WHERE price>=? AND price<? ORDER BY price'
before=db.execute('EXPLAIN QUERY PLAN '+query,(10,18)).fetchall()
db.execute('CREATE INDEX ix_price ON Item(price)')
after=db.execute('EXPLAIN QUERY PLAN '+query,(10,18)).fetchall()
rows=db.execute(query,(10,18)).fetchall()
assert rows==[(2,'b'),(3,'c')]
assert any('SCAN' in r[3] for r in before)
assert any('SEARCH' in r[3] and 'ix_price' in r[3] for r in after)
db.execute('CREATE VIEW PublicItem AS SELECT id,label FROM Item')
allowed={('reader','PublicItem'):'SELECT'}
rights={f'reader:{table}':('reader',table) in allowed for table in ['PublicItem','Item']}
assert rights=={'reader:PublicItem':True,'reader:Item':False}
# Complete finite flat automaton: credit 0/1/2, vend at credit 2 returns to 0.
transition={(0,'coin'):1,(1,'coin'):2,(2,'coin'):2,(0,'vend'):0,(1,'vend'):1,(2,'vend'):0}
def run(events):
    state=0; trace=[state]
    for event in events: state=transition[state,event];trace.append(state)
    return trace
assert run(['coin','coin','vend'])==[0,1,2,0]
assert run(['coin','vend'])==[0,1,1]
assert run(['coin','coin','coin','vend'])==[0,1,2,2,0]
data={
 'status':'independent finite counterexamples; no curriculum or material pass',
 'indexSelectionWithoutAggregation':{'sql':query,'beforePlan':before,'afterPlan':after,'result':rows,'selection':'B-tree supports ordered range search; equality-only hash has no direct ordered range operation.','suppliedCostModel':{'fullScan':8192,'btreeEquality':14,'hashEquality':2,'writes':100,'extraCostPerWrite':2,'extraWriteCost':200},'observation':'Index choice and cost tradeoff can be reasoned about without grouping or aggregate-function competence; this is exactly the old full goal and T31 topic.'},
 'viewRoleWithoutAggregation':{'sql':'CREATE VIEW PublicItem AS SELECT id,label FROM Item','visibleRows':db.execute('SELECT * FROM PublicItem').fetchall(),'explicitRolePolicy':rights,'limit':'Role policy is an explicit logical permission matrix, not a claim that SQLite supplies role GRANT/REVOKE.'},
 'basicAutomatonWithoutHierarchyParallelism':{'states':[0,1,2],'transitions':[{'from':s,'event':e,'to':t}for(s,e),t in transition.items()],'traces':[run(['coin','coin','vend']),run(['coin','vend']),run(['coin','coin','coin','vend'])],'observation':'Ordinary state modelling and simulation are possible without composite or orthogonal states. Basic FSM authority does not itself establish an unavoidable hierarchy/parallelism gap.'},
 'scopeCounterexample':'Preserved old exam coverage proves the old exam demands875; it does not prove state curriculum demands875.'}
(out/'fach-counterexamples.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('3 independent finite fach counterexamples completed')
