"""In the reviewed checkout, inventory direct uses and record selected downstream readers/writes."""
import hashlib
import json
import re
import subprocess

def git(*args):
    return subprocess.check_output(['git',*args])
commit='1431a79dbea806dfed00a268b0b2bec4e58f7faa'
path='backend/src/main/java/com/skillpilot/backend/service/LearnerService.java'
data=git('show',f'{commit}:{path}')
source=data.decode().splitlines()
pattern=re.compile(r'^    (public|protected|private)\s+.*?\b(\w+)\(')
def method(start):
    for j in range(start,-1,-1):
        m=pattern.match(source[j])
        if m:
            return {'method':m.group(2),'methodLine':j+1}
def uses(token):
    return [dict(method(i),line=i+1,text=line.strip()) for i,line in enumerate(source) if token in line and not pattern.match(line)]
callers = uses('resolveEffectiveProjectedFocusIds(')
assert len(callers)==14
points={}
for token in ['getPlannedGoals(', 'isGlobalAssessmentGoalWithoutExplicitFocus(', 'restoreImportedPlannedGoals(',
              'setActiveGoalId(request.goalId())','explicitlyFocusedGoalIds.addAll(offerBranch)','setActiveGoalId(null)']:
    points[token]=uses(token)
print(json.dumps({'commit':commit,'path':path,'fileSha256':hashlib.sha256(data).hexdigest(),
                  'directCallers':callers,'selectedDownstreamUses':points},indent=2))
