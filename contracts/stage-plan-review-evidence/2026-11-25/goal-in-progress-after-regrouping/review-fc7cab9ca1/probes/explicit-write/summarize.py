import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

probe = Path(__file__).resolve().parent
out = probe.parent.parent / 'raw/explicit-write'
xml_path = out / 'TEST-com.skillpilot.backend.connectors.claude.v1.mcp.ExplicitFocusWriteProbe.xml'
suite = ET.parse(xml_path).getroot()
prefix = 'EXPLICIT_WRITE_TASK_E '
rows = [json.loads(line.split(prefix, 1)[1]) for line in ''.join(suite.itertext()).splitlines() if prefix in line]
summary = {
    'role': 'native corroboration runner; not independent content or implementation review',
    'commit': 'fc7cab9ca11e795a982081af293eff3e357f5551',
    'exitCode': int((out / 'exit-code.txt').read_text()),
    'tests': int(suite.attrib['tests']),
    'failures': int(suite.attrib['failures']),
    'errors': int(suite.attrib['errors']),
    'skipped': int(suite.attrib['skipped']),
    'rows': rows,
    'limits': [
        'Native Spring/H2 service calls, not an HTTP or rendered UI test.',
        'Both pilot values mean unit-assessment-pilot-enabled; Autopilot remains off.',
        'Synthetic persisted TEACHING pointer simulates an ordinary goal in progress before regrouping; it does not establish historical start provenance.',
        'Synthetic deck pointer establishes exclusion from ordinary-goal retention and unchanged mastery only; no SRS practice or card state is asserted.',
        'No probe of normally begun local exam outside a later selection was run.'
    ],
    'artifacts': {str(p.relative_to(probe.parent.parent)): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in [xml_path, out / 'environment.txt', out / 'exit-code.txt',
                  out / 'fc7cab9ca11e795a982081af293eff3e357f5551.log',
                  probe / 'probe.method.java', probe / 'probe.gradle', probe / 'run.sh']},
}
assert summary['exitCode'] == 0
assert (summary['tests'], summary['failures'], summary['errors'], summary['skipped']) == (2, 0, 0, 0)
assert len(rows) == 2
assert {r['pilot'] for r in rows} == {False, True}
for r in rows:
    assert r['priorGet']['active'] == r['traffic']
    assert r['priorGet']['storedActive'] == r['traffic']
    assert r['priorGet']['scope'] == [r['focus']]
    assert r['priorGetRevisionDelta'] == 0
    assert r['identicalExplicitSetPlannedGoals'] == {'input': [r['focus']], 'returned': [r['focus']]}
    assert r['storedImmediatelyAfterWrite'] is None
    assert r['afterWriteGet']['active'] is None
    assert r['afterWriteGet']['storedActive'] is None
    assert r['afterWriteGet']['scope'] == [r['focus']]
    assert r['masteryUnchangedAfterWrite'] is True
    assert r['deckRead']['active'] is None
    assert r['deckRead']['storedActive'] is None
    assert r['deckRead']['scope'] == [r['focus']]
    assert r['masteryUnchangedAfterDeckRead'] is True
(out / 'actual.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({k: summary[k] for k in ['commit','exitCode','tests','failures','errors','skipped']}, indent=2))
