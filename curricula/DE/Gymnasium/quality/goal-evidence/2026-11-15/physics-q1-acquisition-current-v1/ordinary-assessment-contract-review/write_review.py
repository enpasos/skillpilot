#!/usr/bin/env python3
"""Read-only input inventory for the bounded K12 assessment contract review."""
import hashlib,json,pathlib,datetime
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=pathlib.Path(__file__).resolve().parent
candidate='tmp/physics-release837-20261115/review-canonical-final.snapshot.json'
profiles='tmp/physics-release837-20261115/current10-informed-P-v2.review.jsonl'
config='tmp/physics-release837-20261115/current10-informed-P-v2.config.json'
goals=json.loads((ROOT/candidate).read_text())['goals']; byid={g['id']:g for g in goals}
rows=[json.loads(l) for l in (ROOT/profiles).read_text().splitlines() if l.strip()]
newtask={'39ef1e8a-9203-5192-8c76-8e0c3322646f','f06c581a-7157-584e-a692-99bcd613cff9','8ac61062-f63e-5935-96ae-84014906c368'}
inputs=[candidate,profiles,config,'AGENTS.md','docs/concept/skill-graph/source/chapters/02-context.de.md','docs/concept/skill-graph/source/chapters/03-learning-units.de.md','docs/concept/skill-graph/source/chapters/05-assessment.de.md','docs/concept/skill-graph/architecture-source/chapters/08-learning-goal-book.de.md','docs/qa-ci/graph-definition-rule-milestone-matrix.md','app/scripts/generateCurriculumQualityStatus.ts','app/scripts/lib/directAtomicRouteCoverage.ts','app/scripts/lib/hardLearningRouteValidation.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','backend/src/main/java/com/skillpilot/backend/api/FrontierGoal.java','backend/src/main/java/com/skillpilot/backend/content/ContentMaterialResolver.java','backend/src/main/java/com/skillpilot/backend/ai/CoachStateProjection.java','backend/src/main/java/com/skillpilot/backend/ai/CoachToolFacade.java','backend/src/main/java/com/skillpilot/backend/service/LearnerService.java','ai/claude/plugin/skillpilot-coach-v1/skills/skillpilot-coach-v1/SKILL.md']
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'GPT-6.1 Sol Ultra / independent subagent land_stage_excerpts','claim':'Bounded contract/runtime analysis; no learner-success, human-approval, route-pass or M7 acceptance claim','pins':[{'path':p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()} for p in inputs], 'goals':[]}
for r in rows:
 g=byid[r['goalId']]
 result['goals'].append({'goalId':g['id'],'title':g['title'],'description':g['description'],'plannedNewStaticTask':g['id'] in newtask,'staticCoverageGoalIds':[x['id'] for x in goals if g['id'] in (x.get('examData') or {}).get('coveredGoalIds',[])],'P':{k:r[k] for k in ['status','reviewAuthority','evidenceLevel','maximumClaimScope']},'profile':r['profile']})
assert len(result['goals'])==10
assert not any(x['staticCoverageGoalIds'] for x in result['goals'])
(OUT/'input-inventory.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('10 current goals, 0 static coveredGoalIds references; seven without planned authored task; pins retained')
