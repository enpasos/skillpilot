# SPDX-License-Identifier: Apache-2.0
"""Reproduce the final UTF-8 rendering without rebinding old author inputs."""
import hashlib,json,sys
from pathlib import Path
R=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
l=json.loads((R/'semantic-role-ownership-scope.author-ledger.json').read_text())
for e in l['entries']:
    if e['sourcePath'].endswith('Mathematik.json')and e['sourceIndex']in [187,188,189,190,191,326,327,328,329,330]:
        e['projectProcessContextClarification']={'literalProjectHeading':[s['literalHeading']for s in e['literalScopeContext']],'currentLandscapeTitle':'Mathematik (Fachoberschule)','assessmentNature':'Konkrete assessierbare Projektprozessleistung im authored Mathematik-Projektkontext; kein bloßer Verwaltungsbaustein und keine breite Kompetenzachse.','subjectBoundary':'Der eigentliche fachliche Projektgegenstand ist in dieser vollständigen Beschreibung nicht benannt. Die Prozessleistung wird nicht automatisch als eigenständige reine Mathematikkompetenz oder Physikkompetenz freigegeben.'}
l['utf8RenderingNote']='Final ledger uses real UTF-8 characters; raw Math/Physics author inputs remain byte-identical. This adds a bounded project-process contextual clarification, not an approval or source edit.'
payload=(json.dumps(l,ensure_ascii=False,indent=2)+'\n').encode()
target=R/'semantic-role-ownership-scope.author-ledger.final.json'
if '--write' in sys.argv:
    with target.open('xb')as f:f.write(payload)
else:assert target.read_bytes()==payload,'Final UTF-8 rendering differs from its preserved raw author ledger'
print(json.dumps({'finalLedgerSha256':'sha256:'+hashlib.sha256(payload).hexdigest(),'reproducible':True}))
