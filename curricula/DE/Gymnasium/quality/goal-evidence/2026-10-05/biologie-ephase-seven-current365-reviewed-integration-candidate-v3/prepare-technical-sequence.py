#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare explicit technical steps; no independent science or active adoption."""
from pathlib import Path
import hashlib,json
from datetime import datetime,timezone
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent
TECH=OWN.parent/'biologie-ephase-seven-current365-native-candidate-v2';ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
f=TECH/'technical-current365-candidate.final.freeze.json';assert sha(f)=='7f92fa4e8f5aa8a83987f95301cb42006d8d0eff9b7ce7a4aacac24dfe874318'
for row in read(f)['files']:assert sha(ROOT/row['path'])==row['sha256'].removeprefix('sha256:')
assert sha(ROOT/CAN)==sha(ISO/CAN)=='45f3d79713ba3c5e0817df9e8da04989aacab3daf65e275838af9f35c91abfba'
registry=read(ROOT/REG);bio=next(s for s in registry['subjects']if s['subject']=='biologie');ids=read(TECH/'batch.config.json')['goalIds'];baseline=read(TECH/'current42-protection.stdout.txt')['subjects'][0]
assert baseline['strictComplete']==42 and baseline['denominator']==365 and baseline['issues']==[] and len(ids)==7
assert not set(ids)&set(baseline['strictCompleteGoalIds'])
cfg=read(TECH.parent/'biologie-ephase-seven-current-native-candidate-v1/positive.validation-only.config.json');assert cfg['scope']['goalIds']==ids
steps=[
 {'step':'Require exact final independent A365 and Root B365 freezes, P7 reviewed candidate payload and Root P7 science decision freeze','authorizedNow':False},
 {'step':'Read all14 independent D rationales, compare whole current DE/EN and page/context/source fields; synthesize only resolved actual agreements','authorizedNow':False},
 {'step':'Native summarize, synthesis manifest, resolutions, finalize and finalize current check in scratch; export own current D7 index','authorizedNow':False},
 {'step':'Materialize exactly Root independently reviewed P7 payload against current365 Canonical with native materializer and honest E1/G1 needs_human_review','authorizedNow':False},
 {'step':'Preserve the current full A365/M365, cards, V49 and all human fields; run only native current A/M/P/visual checks','authorizedNow':False},
 {'step':'Append own current D7 index and own P7 config to then-current Bio registry; no Canonical/QA/A/M payload changes, no full364 snapshot reset','authorizedNow':False},
 {'step':'Guard seven HE row patches and three exact-to-partial decisions, native changed Atlas outputs only; preserve other358 source facets','authorizedNow':True},
 {'step':'Actual isolated central future report must have49/365 with all six PASS, no issues and exact42+7 current strict IDs','authorizedNow':False},
 {'step':'Freeze guarded explicit source/Atlas plan and exact input guards; Root application default remains read-only','authorizedNow':False},
]
lock={'preparedAtUTC':datetime.now(timezone.utc).isoformat(),'status':'technical_sequence_only_science_freezes_pending','isolationRoot':str(ISO),'canonicalSHA256':sha(ROOT/CAN),'registrySHA256AtPreparation':sha(ROOT/REG),'actualBaselineStrict':42,'actualDenominator':365,'protectedCurrentStrict42GoalIds':baseline['strictCompleteGoalIds'],'expectedOnlySevenNewScientificGoalIds':ids,'predictedStrict49RequiresActualNativePass':True,'currentBiologieConfig':bio,'protectedMathematikAndPhysikEntries':[s for s in registry['subjects']if s['subject']in ['mathematik','physik']],'technicalCurrent365FreezePath':str(f.relative_to(ROOT)),'technicalCurrent365FreezeSHA256':sha(f),'sequence':steps,'noNewScienceClaim':True,'noActiveWrites':True,'newFullRepositoryCopy':False,'humanApproval':False,'humanTrial':False}
p=OWN/'technical-sequence-and-current42-lock.json';assert not p.exists();p.write_text(json.dumps(lock,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'currentStrictProtected':42,'currentDenominator':365,'steps':len(steps),'scienceFreezesRequired':True,'activeWrites':0}))
