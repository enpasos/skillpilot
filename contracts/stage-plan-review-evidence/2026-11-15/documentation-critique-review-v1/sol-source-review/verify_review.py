#!/usr/bin/env python3
"""Read-only verification; produces TMP receipt, never runs a documentation build."""
from pathlib import Path
import json,sys,hashlib,itertools
out=Path(__file__).resolve().parent;root=out.parents[2]
sys.path.insert(0,str(root/'scripts'))
from doc_compendium.ast_and_parser import parse_blocks,extract_skeleton
receipt=json.loads((out/'edit-receipt.actual.json').read_text())
results=[];pairs=[]
for p in receipt['filesReviewed']:
 if not p.endswith('.de.md'):continue
 en=p[:-6]+'.en.md';de_ast=parse_blocks((root/p).read_text().splitlines(),p);en_ast=parse_blocks((root/en).read_text().splitlines(),en)
 ds,dr=extract_skeleton(de_ast);es,er=extract_skeleton(en_ast)
 assert ds==es,(p,'AST mismatch')
 assert dr==er,(p,'repo citation mismatch')
 pairs.append({'de':p,'en':en,'astElements':len(ds),'matchingRepoCitations':len(dr)})
results.append({'check':'all changed bilingual chapter ASTs and repository citation sets','pairs':len(pairs),'pass':True})
json.loads((root/'docs/concept/skill-graph/source/glossary-and-symbols.json').read_text())
results.append({'check':'glossary/symbol JSON parses','pass':True})

# Independent mathematical counterexamples supporting the editorial corrections.
nodes=['a','b','c','d'];edges=[('a','b'),('d','c')];units={'U':{'a','c'},'V':{'b','d'}}
def respects(order):
 ix={x:i for i,x in enumerate(order)};return all(ix[p]<ix[g] for g,p in edges)
def contiguous(order,u):
 ix=[i for i,x in enumerate(order) if x in u];return max(ix)-min(ix)+1==len(ix)
orders=[x for x in itertools.permutations(nodes) if respects(x)]
block_orders=[x for x in orders if all(contiguous(x,u) for u in units.values())]
assert orders and not block_orders
# Every path is length one and has endpoints in different units, so both sets are path-convex.
assert all(not ({g,p}<=u) for u in units.values() for g,p in edges)
results.append({'check':'E2: path-convex atom DAG can have no contiguous unit order','atomicOrders':len(orders),'unitBlockOrders':len(block_orders),'pass':True})
L={'content','exam'};M={'content'}
assert not L<=M
partial={'content'};assert partial<=M and not L<=M
results.append({'check':'F13: open in-scope exam leaves portion open; completing strict subset is not whole-unit completion','pass':True})
R={('exam','content')};Q={'exam'}
assert all(p not in Q for g,p in R) and any(g in Q for g,p in R)
results.append({'check':'R arrow direction: assessment is not required by another goal, but can require content','pass':True})

pins=[]
for pin in receipt['pins']:
 actual=hashlib.sha256((root/pin['path']).read_bytes()).hexdigest()
 assert actual==pin['afterSha256'],('source changed since receipt',pin['path'])
 pins.append(pin)
result={'reviewer':'GPT-6.1 Sol Ultra / independent source review','scope':'43 originally changed authored sources; independent bilingual/model checks, no build/generated output or runtime/CI claims','checks':results,'pairs':pairs,'pins':pins}
(out/'verification.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'bilingualPairs':len(pairs),'modelChecks':3,'editedSourceFiles':len(pins),'pass':True}))
