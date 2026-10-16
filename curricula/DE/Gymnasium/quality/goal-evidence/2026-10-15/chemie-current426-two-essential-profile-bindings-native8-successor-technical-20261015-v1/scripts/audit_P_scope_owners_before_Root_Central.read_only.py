# SPDX-License-Identifier: Apache-2.0
"""Read-only scope.goalIds-Kollisionsprüfung; keine Science-/Stock-/Central-Ausführung."""
from pathlib import Path
import argparse,collections,json
p=argparse.ArgumentParser();p.add_argument('--central-config',required=True);p.add_argument('--subject',default='chemie');a=p.parse_args();R=Path.cwd();config=json.loads((R/a.central_config).read_text());subject=next(x for x in config['subjects'] if x['subject']==a.subject);semantic=json.loads((R/subject['semanticKindLedgerPath']).read_text());universe={x['goalId'] for x in semantic['decisions'] if x['semanticKind']=='curricularAtomic'};owners=collections.defaultdict(list);errors=[]
for path in subject['positiveEvidenceConfigPaths']:
 c=json.loads((R/path).read_text());ids=c.get('scope',{}).get('goalIds',[])
 if not isinstance(ids,list):errors.append({'config':path,'issue':'scope.goalIds is not an array'});continue
 for gid in ids:owners[gid].append(path)
 records=[json.loads(l) for l in (R/c['reviewPath']).read_text().splitlines() if l.strip()];recordids=[r['goalId'] for r in records]
 if len(set(recordids))!=len(recordids):errors.append({'config':path,'issue':'duplicate record goalId'})
 if set(recordids)!=set(ids):errors.append({'config':path,'issue':'record goalIds differ from configured scope.goalIds','scopeOnly':sorted(set(ids)-set(recordids)),'recordsOnly':sorted(set(recordids)-set(ids))})
collisions=[{'goalId':g,'owners':v} for g,v in sorted(owners.items()) if len(v)>1];outside=sorted(set(owners)-universe);out={'schemaVersion':1,'role':'Mechanische Scope-Eigentümerprüfung; keine Bewertung der P-Wissenschaft oder Aktualität','centralConfig':a.central_config,'subject':a.subject,'curricularAtomicUniverse':len(universe),'declaredUniqueOwners':len(owners),'collisions':collisions,'outOfScopeOwners':outside,'recordScopeShapeErrors':errors,'unclaimedGoalIds':sorted(universe-set(owners)),'collisionCheckPassed':not(collisions or outside or errors),'unclaimedGoalsAreReportedWithoutInventingApproval':True,'stockChecks':0,'centralRuns':0,'writes':0};print(json.dumps(out,ensure_ascii=False,indent=2));raise SystemExit(0 if out['collisionCheckPassed'] else 1)
