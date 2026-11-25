from pathlib import Path
import subprocess,sys
d=Path(__file__).parent
repo=Path('/home/enpasos/projects/skillpilot')
git=['git','-C',str(repo),'show','4e085e990ba4a05053904ee5cb34f5dd82418358:backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java']
orig=subprocess.check_output(git).decode()
if 'import com.skillpilot.backend.api.LearnerLearningPlanApi;' not in orig:orig=orig.replace('package com.skillpilot.backend.service;','package com.skillpilot.backend.service;\nimport com.skillpilot.backend.api.LearnerLearningPlanApi;')
assert orig.rstrip().endswith('}')
(d/'probe/MathRegroupTest.java').write_text(orig.rstrip()[:-1].replace('LearnerServiceTest','MathRegroupTest')+(d/'math.java').read_text()+'}\n')
