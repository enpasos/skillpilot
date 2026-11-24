from pathlib import Path
import xml.etree.ElementTree as E
import json,hashlib,subprocess,sys
repo=Path('/home/enpasos/projects/skillpilot-e1-nachweise');rawdir=Path(sys.argv[1]);out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True);rows=[]
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
for raw in sorted(rawdir.glob('TEST-*.xml')):
 # Streaming extraction avoids retaining logs from the complete Spring contexts.
 suite=None;cases=[]
 for event,elem in E.iterparse(raw,events=('start','end')):
  if event=='start' and suite is None and elem.tag=='testsuite':suite=dict(elem.attrib)
  if event=='end' and elem.tag=='testcase':
   status='failed' if elem.find('failure') is not None else 'error' if elem.find('error') is not None else 'skipped' if elem.find('skipped') is not None else 'passed';cases.append({'name':elem.get('name'),'className':elem.get('classname'),'timeSeconds':elem.get('time'),'status':status});elem.clear()
  elif event=='end' and elem.tag in ['system-out','system-err','properties']:elem.clear()
 assert suite is not None and int(suite['tests'])==len(cases)
 excerpt=E.Element('testsuite',suite)
 for case in cases:
  node=E.SubElement(excerpt,'testcase',{'name':case['name'],'classname':case['className'],'time':case['timeSeconds']})
  if case['status']=='skipped':E.SubElement(node,'skipped')
  elif case['status'] in ['failed','error']:E.SubElement(node,'failure' if case['status']=='failed' else 'error',{'message':'See raw log and named sparse diagnostic; full native XML remains in tmp.'})
 name='EXCERPT-'+raw.name;dest=out/name;E.indent(excerpt,space='  ');dest.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<!-- EXCERPT: native testsuite/testcase status attributes only; system-out/system-err/properties omitted. Native rawSHA '+sha(raw)+'; raw bytes retained at '+str(raw)+' . -->\n'+E.tostring(excerpt,encoding='unicode')+'\n')
 rows.append({'className':suite['name'],'rawXmlPath':str(raw),'rawXmlBytes':raw.stat().st_size,'rawXmlSha256':sha(raw),'excerptPath':str(dest.relative_to(repo)),'excerptSha256':sha(dest),'excerptContract':'Native testsuite/testcase status/timing only, explicitly extracted; full raw bytes are not stored in Git.','suiteAttributes':suite,'cases':cases})
 # Remove only the newly copied uncommitted raw bytes from this exact evidence directory.
 duplicate=out/raw.name
 if duplicate.exists():
  rel=str(duplicate.relative_to(repo));tracked=subprocess.run(['git','cat-file','-e','HEAD:'+rel],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0
  if tracked:raise Exception('Refuse to alter committed evidence '+rel)
  assert sha(duplicate)==sha(raw);duplicate.unlink()
report={'schemaVersion':1,'contract':'native-junit-raw-sha-and-explicit-status-excerpts-v1','rawDirectory':str(rawdir),'classCount':len(rows),'caseCount':sum(len(r['cases']) for r in rows),'rawXmlStoredInGit':False,'classes':rows}
(out/'junit-raw-and-excerpts.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Extracted',len(rows),'classes/',report['caseCount'],'cases; native raw XML retained solely in tmp')
