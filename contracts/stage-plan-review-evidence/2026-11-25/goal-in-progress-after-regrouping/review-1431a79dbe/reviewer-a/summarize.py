from pathlib import Path
import xml.etree.ElementTree as E
import json,statistics,hashlib
p=Path(__file__).parent
rows=[];runs=[];origins=[]
for file in sorted((p/'../raw/reviewer-a').glob('*-TEST-*.xml')):
    root=E.parse(file).getroot()
    if int(root.attrib.get('failures',0))+int(root.attrib.get('errors',0)):continue
    bench=[]
    for line in (root.findtext('system-out') or '').splitlines():
        if line.startswith('REVIEW_A_ORIGIN '):
            origins.append(json.loads(line[len('REVIEW_A_ORIGIN '):]))
        if not line.startswith('REVIEW_A_BENCH '):continue
        x=json.loads(line[len('REVIEW_A_BENCH '):]);a=x['ms'];q=statistics.quantiles(a,n=4,method='inclusive')
        x['statistics']={'n':len(a),'median_ms':statistics.median(a),'mean_ms':statistics.mean(a),'stdev_ms':statistics.stdev(a),'q1_ms':q[0],'q3_ms':q[2],'min_ms':min(a),'max_ms':max(a),'p95_ms':sorted(a)[int(.95*(len(a)-1))]}
        rows.append(x);bench.append(x)
    runs.append({'file':str(file.relative_to(p.parent)),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'junit':root.attrib,'benchmarkCells':len(bench)})
for x in origins:
    assert x['coachState']=='FRONTIER' and x['state']=='FRONTIER'
    assert x['coachActive'] is None and x['stateActive'] is None and x['storedActive'] is None
    assert not x['directRunning']
for x in rows:
    expected=x['scenario']=='ordinary' or (x['variant']=='candidate' and x['scenario'].startswith('moved-'))
    assert bool(x['activeGoal'])==expected,(x['variant'],x['scenario'],x['reader'])
    assert x['stateMachine']['state']==('TEACHING' if expected else 'FRONTIER')
    assert x['storedFocus']==['composition:de-he-gym-sekii-physics-gk:structure:physics-e1-motion']
(p/'expiry.actual.json').write_text(json.dumps(origins,indent=2)+'\n')
(p/'measure.actual.json').write_text(json.dumps({'runs':runs,'samples':rows},indent=2)+'\n')
keys=sorted({(r['repeat'],r['pilot'],r['scenario'],r['reader']) for r in rows})
lines=['| Lauf | Pilot | Fall | Lesen | Basis Median [IQR] ms | Kandidat Median [IQR] ms | Delta ms | Delta % |','|---|---|---|---|---|---|---|---|']
for key in keys:
    found={r['variant']:r for r in rows if (r['repeat'],r['pilot'],r['scenario'],r['reader'])==key}
    if not all(k in found for k in ['baseline','candidate']):continue
    b,c=(found[k]['statistics'] for k in ['baseline','candidate']);d=c['median_ms']-b['median_ms']
    lines.append('| '+' | '.join([*map(str,key),f"{b['median_ms']:.2f} [{b['q1_ms']:.2f}–{b['q3_ms']:.2f}]",f"{c['median_ms']:.2f} [{c['q1_ms']:.2f}–{c['q3_ms']:.2f}]",f'{d:+.2f}',f"{100*d/b['median_ms']:+.1f}%"])+' |')
(p/'timing-table.md').write_text('\n'.join(lines)+'\n')
print('\n'.join(lines))
