#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).resolve().parent
AUTHOR=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-three-coherent-local-participation-digital-work-and-budget-credit-material-author-v1')
bindings=[]
def bind(p):
 b=(ROOT/p).read_bytes();r={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'symlink':(ROOT/p).is_symlink()}
 if r not in bindings:bindings.append(r)
 return r
def save(n,o):
 p=OUT/n;assert not p.exists();p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
hpath=AUTHOR/'actual-final-three-local-whole-materials-DRAFT-current-goal-P-scope-and-negative-author-handoff.json';assert bind(hpath)['sha256']=='377a5c483c35a8f28cce377eba03342c426ba6be5435d5f62cdbc015bf682211'
h=json.loads((ROOT/hpath).read_text())
for key in ['wholeMaterials','wholeGoalAndPInputs','manifest']:
 assert bind(Path(h[key]['path']))['sha256']==h[key]['sha256']
whole=json.loads((ROOT/h['wholeMaterials']['path']).read_text());context=json.loads((ROOT/h['wholeGoalAndPInputs']['path']).read_text())
assert len(whole)==3 and all(g['examData']['reviewStatus']=='draft' for g in whole)
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');bind(CAN);bind(REG);bind(Path('AGENTS.md'))
current=json.loads((ROOT/CAN).read_text());goals={g['id']:g for g in current['goals']}
assert all(goals[g['id']]==g for g in context['wholeGoals'])
registry=json.loads((ROOT/REG).read_text());subject=next(s for s in registry['subjects'] if s['subject']=='wirtschaftswissenschaften')
need={r['goalId'] for r in context['wholePositiveOriginalRecords']};actual=[]
for cp in subject['positiveEvidenceConfigPaths']:
 cfg=json.loads((ROOT/cp).read_text())
 if not need.intersection(cfg.get('scope',{}).get('goalIds',[])):continue
 bind(Path(cp));bind(Path(cfg['reviewPath']))
 for l in (ROOT/cfg['reviewPath']).read_text().splitlines():
  p=json.loads(l)
  if p.get('goalId') in need:actual.append({'configPath':cp,'reviewPath':cfg['reviewPath'],'wholeCurrentRow':p})
assert len(actual)==7
author_profiles={r['goalId']:r['record'] for r in context['wholePositiveOriginalRecords']}
assert all(r['wholeCurrentRow']==author_profiles[r['wholeCurrentRow']['goalId']] for r in actual)
assert sum(len(r['wholeCurrentRow']['profile']['applicationCaseBriefs']) for r in actual)==16
save('actual-three-frozen-whole-DEEN-bodies-eight-current-contracts-and-seven-P16.intake.json',{'reviewer':'/root/economics_m2_views_independent_b','capturedAt':datetime.now(timezone.utc).isoformat(),'authorHandoff':bind(hpath),'wholeBodies':whole,'wholeOriginalAuthorContext':context,'wholeActualCurrentPositiveRows':actual,'currentCanonical':bind(CAN),'currentGoalCount':len(goals),'allEightWholeGoalsAndSevenCurrentRowsExactToAuthor':True,'wholePrimaryAssessedGoals':4,'supportContracts':4,'profilesReauthored':False,'newImages':0,'activeWrites':0,'scopeBoundary':'Review three whole DRAFT bodies only. Author CAN499/SEM kind/nav/62reference projections remain separate. No Money5b5d model/context is in these eight IDs; consumer5b5ed is distinct.'})
save('actual-three-whole-science-input-bindings.before-verdict.json',{'inputs':bindings,'activeWrites':0,'authorNumbersAndCounterworksNotReusedAsReviewerEvidence':True})
print(json.dumps({'newMaterials':3,'wholeGoals':8,'profiles':7,'cases':16,'CAN':bind(CAN),'boundInputs':len(bindings)}))
