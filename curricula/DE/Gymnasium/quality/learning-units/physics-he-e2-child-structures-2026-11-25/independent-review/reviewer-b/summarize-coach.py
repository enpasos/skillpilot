from pathlib import Path
from xml.etree import ElementTree as ET
import json
d=Path(__file__).resolve().parent
result={}
for p in sorted((d.parent/'raw/reviewer-b').glob('*-TEST-*.xml')):
    tree=ET.parse(p); header=tree.getroot()
    rows={k:[] for k in ('REVIEWB','REVIEWBPLAN','REVIEWBRECOVERY')}
    for line in tree.findtext('system-out','').splitlines():
        prefix,_,data=line.partition(' ')
        if prefix in rows:rows[prefix].append(json.loads(data))
    result[p.name]={'tests':int(header.get('tests')),'failures':int(header.get('failures')),'errors':int(header.get('errors')),'skipped':int(header.get('skipped')), 'testNames':[n.get('name') for n in tree.findall('testcase')], **{k:v for k,v in rows.items() if v}}
(d/'coach.actual.json').write_text(json.dumps(result,ensure_ascii=False, indent=2)+'\n')
for f,r in result.items():
    print(f,r['tests'],r['failures'],r['errors'],r['skipped'])
    for row in r.get('REVIEWBPLAN',[]): print('   ',row['course'],row['pilot'],row['storedCount'], row['currentCount'],[i[:8] for i in row['oldGoalsRemovedFromCurrentSelection']], [row[x] for x in ['stale','restoredStale','restorePreservesExactBlocks','next','canContinue','resumedActive','resumedFocus','resumedState']])
