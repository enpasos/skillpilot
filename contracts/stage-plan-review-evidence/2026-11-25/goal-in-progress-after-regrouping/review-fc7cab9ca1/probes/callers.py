"""In the reviewed checkout, inventory direct uses and record selected downstream readers/writes."""
import hashlib
import json
import re
import subprocess

def git(*args):
    return subprocess.check_output(['git',*args])
commit='fc7cab9ca11e795a982081af293eff3e357f5551'
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
runtime = uses('resolveRuntimeProjectedFocusIds(')
cursor = uses('regroupedGoalInProgress(')
assert sorted(x['line'] for x in runtime) == [8069,8251,8869,9558]
assert sorted(x['line'] for x in cursor) == [5929,10193]
def chosen_method(lines):
    start = next(i for i,l in enumerate(lines) if l.startswith('    private List<String> resolveEffectiveProjectedFocusIds('))
    end = next(i for i in range(start+1,len(lines)) if lines[i] == '    }')
    return '\n'.join(lines[start:end+1])
base=git('show',f'53fd44c88b:{path}').decode().splitlines()
assert chosen_method(source)==chosen_method(base)
assert not git('diff','53fd44c88b',commit,'--','app/src/utils/learnerFocus.ts','app/src/views/LearnerView.tsx')
points={}
for token in ['getPlannedGoals(', 'isGlobalAssessmentGoalWithoutExplicitFocus(', 'restoreImportedPlannedGoals(',
              'setActiveGoalId(request.goalId())','explicitlyFocusedGoalIds.addAll(offerBranch)','setActiveGoalId(null)']:
    points[token]=uses(token)
print(json.dumps({'commit':commit,'path':path,'fileSha256':hashlib.sha256(data).hexdigest(),
                  'chosenResolverMatchesBase':True,'uiSourceMatchesBase':True,'runtimeCallers':runtime,'regroupedGoalCallers':cursor,'directCallers':callers,'selectedDownstreamUses':points},indent=2))
