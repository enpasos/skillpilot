# SPDX-License-Identifier: Apache-2.0
import json,pathlib,shutil,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
V=B/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2'
A=B/'biologie-neuro-verhalten-hormone-ten-current-v3-independent-a-20261010-v2'
BB=B/'biologie-neuro-verhalten-hormone-ten-current-v3-independent-b-20261010-v1'
P=B/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1'
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
assert not (R/P).exists();(R/P/'checks').mkdir(parents=True);(R/P/'terminal').mkdir();(R/P/'inputs').mkdir()
shutil.copytree(R/V/'native/ten-current-native',R/P/'native-ten-dual-resolution')
for label,src in [('a',A/'current-results'),('b',BB/'results')]:
 dst=R/P/'native-ten-dual-resolution'/f'round-{label}'/'results';dst.mkdir(exist_ok=True)
 for f in (R/src).iterdir():
  if f.is_file():shutil.copyfile(f,dst/f.name)
guards=[ref(pathlib.Path(x)) for x in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']]
(R/P/'inputs/current343-write-guards.exact.json').write_text(json.dumps({'schemaVersion':1,'files':guards},indent=2)+'\n')
print(json.dumps({'namespace':str(P),'D10CurrentAandBExactResultsCopied':True,'targetedCurrentSourceAReviewStillPending':True,'activeWrites':[]}))
