#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime, timezone
import hashlib, importlib.util, json, os, subprocess

R=Path('/home/enpasos/projects/skillpilot'); D=Path(__file__).resolve().parent
INACTIVE=[R/'app/scripts/config/goal-books/inactive/biologie-stoffwechsel-two-basic-complete-20261008-v2',R/'app/scripts/config/goal-books/inactive/biologie-stoffwechsel-two-basic-primary-refined-20261008-v2']
def bind(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def put(name,value):
 p=D/name;raw=json.dumps(value,ensure_ascii=False,indent=2)+'\n'
 if p.exists():assert p.read_text()==raw,'Preserve prior exact output '+str(p)
 else:p.write_text(raw)
 return bind(p)
ep=D/'neutral-final-primary-refined-basis2.author.entry.json';e=json.loads(ep.read_text())
assert e['allNewIndependentReviewsPending'] and e['currentActiveWrites']==0 and e['newStrictClosures']==0
for x in json.loads((D/'two-basic-images.author.first-binding.freeze.json').read_text())['files']:
 a=bind(R/x['path']);assert a['sha256']==x['sha256'] and a['bytes']==x['bytes']
for x in json.loads((D/'checks/actual-eight-originals-index-Blobbytes-and-bundle-exact.json').read_text())['files']:
 p=R/x['actualOriginal']['path'];blob=subprocess.run(['git','show',':'+x['actualOriginal']['path']],cwd=R,capture_output=True,check=True).stdout
 assert blob==p.read_bytes() and blob==(p.parent/'bundle'/p.name).read_bytes()
reportPath=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt'
raw=reportPath.read_text();report=json.loads(raw[raw.index('{'):]);bio=next(x for x in report['subjects'] if x['subject']=='biologie');assert bio['strictComplete']==244 and len(bio['strictCompleteGoalIds'])==244
actualPath=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'; actual=json.loads(actualPath.read_text());shadow=json.loads((R/e['currentCanonicalPath']).read_text())
newIds=set(e['selectedGoalIds']);a={g['id']:g for g in actual['goals']};s={g['id']:g for g in shadow['goals']};assert len(a)==476 and len(s)==478 and set(s)-set(a)==newIds
changes=[{'goalId':i,'differentFields':[k for k in set(a[i])|set(s[i]) if a[i].get(k)!=s[i].get(k)]} for i in a if a[i]!=s[i]]
assert len(changes)==1 and changes[0]['goalId']=='860c80f9-e463-598b-8ef8-79f65c12f235' and set(changes[0]['differentFields'])=={'contains','weight'}
qaPath=R/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json';actualQA=json.loads(qaPath.read_text());shadowQA=json.loads((R/e['currentQaPath']).read_text());qaA={r['goalId']:r for r in actualQA['records']};qaS={r['goalId']:r for r in shadowQA['records']}
qaChanged=[i for i in qaA if qaA[i]!=qaS[i]]
assert len(qaChanged)==3; originalThree=json.loads((D/'native/original-three-native-frame.after-basic2.actual-model.json').read_text()); assert set(qaChanged)=={x['goalId'] for x in originalThree['pages']}
put('checks/latest-root244-live-base-compatibility.actual.json',{'schemaVersion':1,'role':'Actual current base guard, no new review','report':bind(reportPath),'currentCanonical':bind(actualPath),'currentQA':bind(qaPath),'actualCounts':{'canonical':476,'curricularAtomic':392,'strictComplete':244},'candidateExpectedOriginalBaseline':e['originalAuthorInputBaseline'],'actualAll476CanonicalCompared':True,'existingCanonicalDeltaOnlyParentContainsWeight':changes,'current244StrictGoalIds':bio['strictCompleteGoalIds'],'rootThreeNativePagesUnchangedByTwoCompanions':True,'QAThreeNewlyApprovedRootRowsMustBeRetained':qaChanged,'integrationRule':'Start from actual current392 QA including Root-approved three rows; append only two pending author records. Do not replace live QA with old unapproved shadow392 rows. Current476 Canon differs from shadow478 only the actual two appended atoms and parent contains/weight. Independent new2/source/placement/word-context reviews remain pending.','newStrictClosures':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
aliases=[]
for p in D.rglob('*'):
 if p.is_symlink():
  target=os.readlink(p);assert not os.path.isabs(target);resolved=p.resolve(strict=True);assert resolved.is_relative_to(D) and resolved.is_file();aliases.append({'path':str(p.relative_to(R)),'relativeTarget':target,'actualResolvedFile':bind(resolved)})
assert len(aliases)==3
files=sorted(p for p in D.rglob('*') if p.is_file());inactive=sorted(p for root in INACTIVE for p in root.rglob('*') if p.is_file())
res=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p.relative_to(R)) for p in files+inactive)+'\n',text=True,cwd=R,capture_output=True);assert res.returncode in [0,1] and not res.stdout,res.stdout
spec=importlib.util.spec_from_file_location('ordinarySchemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);schema=json.loads((R/'docs/landscape-runtime.schema.json').read_text());jf=[p for p in files+inactive if p.suffix=='.json'];assert all(mod.validate_file(str(p),schema) for p in jf)
put('two-basic-complete.author.first-binding.freeze.json',{'schemaVersion':1,'role':'Immutable complete actual author candidate inputs before independent A/B reviews; not approval','sealedAt':datetime.now(timezone.utc).isoformat(),'neutralEntry':bind(ep),'latestCurrentRoot244BaseReceipt':bind(D/'checks/latest-root244-live-base-compatibility.actual.json'),'allOwnPortableArtifacts':[bind(p) for p in files],'allInactiveOrdinaryAtlasArtifacts':[bind(p) for p in inactive],'actualRelativeImageAliases':aliases,'actualIndexedOriginals':8,'actualIndexedOriginalAndBundleBytesExact':True,'normalJSONChecked':len(jf),'ordinaryNativeModelsBundlesAndBlindCampaignsPassed':True,'closedActualP2AuthorProfiles':2,'actualFourDEENScientificCases':4,'finalWhole394SourceModelAndNineDutiesTenEdgesActual':True,'actualAll392PagesAndOld241StrictContextsCompared':True,'oldNative3WholeFrameExact':True,'existingWordExternalReverseRequiresTargetedReviewPending':True,'independentNewDPAMVAndSourcePlacementReviews':'pending','currentRootStrictBaseline':244,'strictGain':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'entry':bind(ep),'seal':bind(D/'two-basic-complete.author.first-binding.freeze.json'),'files':len(files),'inactiveFiles':len(inactive),'normalJSON':len(jf),'indexedOriginalsExact':8,'strictGain':0}))
