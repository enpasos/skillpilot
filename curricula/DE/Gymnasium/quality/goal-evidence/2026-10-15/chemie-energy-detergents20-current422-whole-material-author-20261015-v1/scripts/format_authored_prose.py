# SPDX-License-Identifier: Apache-2.0
"""Readable spacing in our own unreviewed case prose; chemical formulas remain intact."""
import json,re
from pathlib import Path
O=Path(__file__).resolve().parents[1];assert not (O/'FILES.finite-author.seal.json').exists()
p=O/'materials/forty-two-whole-DE-EN-cases.author.json';d=json.loads(p.read_text())
def clean(s):
 s=re.sub(r'(?<=[a-zäöüß]{3})(?=[A-ZÄÖÜ][a-zäöü])',' ',s)
 s=re.sub(r'([,;:])(?=[A-Za-zÄÖÜäöüß])',r'\1 ',s)
 for a,b in [('Restvollständig','Rest vollständig'),('Temperaturstand','Temperaturstand'),('bleibengleich','bleiben gleich'),('nichtvernichtet','nicht vernichtet'),('bleibenwichtig','bleiben wichtig'),('Diesbelegt','Dies belegt'),('beigleichem','bei gleichem'),('entferntalle','entfernt alle'),('Salzefürimmer','Salze für immer'),('nichtbelegt','nicht belegt'),('theoretischreaktionsbezogen','theoretisch reaktionsbezogen'),('langsamabbaubare','langsam abbaubare'),('abbaubar=umweltverträglich','abbaubar = umweltverträglich'),('nachgereinigt','nachgereinigt'),('lithiieren','lithiierten')]:s=s.replace(a,b)
 return s
for c in d['cases']:
 for k in ['materialsDe','taskDe','workedReasoningDe','freshIndependentTransferDe']:c[k]=clean(c[k])
 for r in c['criterionToObservableRubric']:r['observableDe']=clean(r['observableDe'])
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'readableWholeBilingualCases':len(d['cases']),'newScientificVotes':0}))
