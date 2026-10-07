# SPDX-License-Identifier: Apache-2.0
# Independent exact delta verification after immutable pre-A semantic first pass.
import pathlib,json,hashlib,datetime
R=pathlib.Path(__file__).resolve().parents[7];O=pathlib.Path(__file__).resolve().parent
A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-five-component-duration-policy-targeted-a-v1'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def load(p):return json.loads(p.read_text())
def verify(b):
 p=R/b['path'] if not b['path'].startswith('/') else pathlib.Path(b['path']);assert bind(p)==b,b['path'];return b
def write(name,v):
 p=O/name;assert not p.exists(),name;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
prepath=O/'independent-b.pre-a-first-pass.freeze.json';pre=load(prepath)
assert bind(prepath)['sha256']=='4510d9c6b6c61e23ecd9f8cd88353c24116241acd1afb2dcad0b7f89b7a281fb'
for b in pre['ownOutputs']+pre['actualInputBindings']:verify(b)
first=load(O/'independent-first-pass-before-a.actual.json')
afreeze=A/'five-component-duration-policy.author-stage.final.freeze.json';assert bind(afreeze)['sha256']=='fbf15ff011c2fb552520362e2947dc3efd0bb5ee9d47a4aae5446d88e80b836e'
af=load(afreeze)
# Verify author package bytes; author execution/approval conclusions are not adopted.
afiles=[verify(b) for b in af['files']]
candidatePath=A/'gymnasium-duration-model-policy.five-components.candidate.json';candidate=load(candidatePath)
baselinePath=R/'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json';baseline=load(baselinePath)
delta=load(A/'five-component-duration-policy.delta.candidate.json')
assert len(baseline['decisions'])==148 and len(candidate['decisions'])==153
assert candidate['decisions'][:148]==baseline['decisions']
assert {k:v for k,v in candidate.items() if k!='decisions'}=={k:v for k,v in baseline.items() if k!='decisions'}
assert candidate['decisions'][148:]==delta['appendDecisions']
assert len({d['sourceExtractionPath'] for d in candidate['decisions']})==153
added={d['sourceExtractionPath']:d for d in candidate['decisions'][148:]}
rows=[]
for f in first['fiveIndependentFindings']:
 path=f['activeComponentExtractionPath'];actual=added[path];parent=f['existingParentPolicy'];semanticFields=['subject','jurisdiction','stage','status','decision','durationModels','learnerFacingProjection']
 assert all(actual.get(k)==parent.get(k) for k in semanticFields)
 assert set(actual)==set(parent) and parent['sourceExtractionPath'] in actual['rationale']
 assert actual['stage']=='SekI'
 assert actual['durationModels']==(['G8','G9'] if f['jurisdiction'] in ['DE-BB','DE-BE'] else ['G8'])
 rows.append({'jurisdiction':f['jurisdiction'],'actualComponentExtractionPath':path,'existingParentExtractionPath':parent['sourceExtractionPath'],'verdict':'KEEP','exactParentDurationSemanticFields':semanticFields,'newRow':actual,'sourceDocumentAndParentSummaryScopePreviouslyIndependentlyRead':True,'actualComponentCount':f['actualComponentCount'],'reason':'The authored addition agrees with our immutable independent pre-A finding: same original official PDF and SekI summary scope, same existing source/projection duration semantics. Only the exact component extraction path and explanatory rationale are added; no new source duration or fixed-grade placement is invented.','limits':'Whole source/bullet coverage holds, target/prerequisiteOnly roles, country-view targets, canonical text/image/D/P, course scope and all historic source approvals remain separate. No new G9 mapping for MV/SN/TH.'})
def durationUnions(doc):
 d={}
 for row in doc['decisions']:
  if row.get('status')!='reviewed':continue
  key=(row.get('subject'),row.get('jurisdiction'),row.get('stage'))
  d.setdefault(key,set()).update(row.get('durationModels',[]))
 return d
assert durationUnions(baseline)==durationUnions(candidate)
native=load(O/'native-neutral-baseline-and-five-row-candidate.independent-b.actual.json')
for b in native['exactNativeReadInputBindings']:verify(b)
assert native['actualRuns'][0]['exitCode']==1 and native['actualRuns'][1]['exitCode']==0
assert (O/'native-neutral-five-row-candidate.stderr.txt').read_text()==''
assert (O/'native-neutral-baseline.stderr.txt').read_bytes()==(O/'native-active-before.stderr.txt').read_bytes()
assert (O/'native-isolated-repo/app/scripts/reportGymnasiumDurationModelReadiness.ts').read_bytes()==(R/'app/scripts/reportGymnasiumDurationModelReadiness.ts').read_bytes()
assert (R/'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf').read_bytes()==(R/'curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf').read_bytes()
write('independent-b.five-duration-policy.final-review.json',{'schemaVersion':1,'createdAtUTC':now,'reviewer':'codex-bio-five-component-duration-independent-b','priorIndependentSemanticFirstPassFreeze':bind(prepath),'authoredCandidateFreeze':bind(afreeze),'authoredCandidatePolicy':bind(candidatePath),'candidateDelta':bind(A/'five-component-duration-policy.delta.candidate.json'),'perExtractionVerdicts':rows,'fiveBoundedVerdicts':{'KEEP':5,'HOLD':0},'all148OldPolicyObjectsAndOtherFieldsExact':True,'onlyFiveAppendDecisions':True,'allSubjectJurisdictionStageDurationUnionsExact':True,'addedModelsUnionsDoNotExpandRuntimeOfferings':'Actual generator accumulates reviewed decisions by set; these five rows add only models already supplied by their unchanged parent rows. This is source-based inference; generator not executed or modified.','additionalPrimaryEvidenceActuallyRead':'Original shared BE/BB PDF physical11 BERLIN and16 BRANDENBURG both assign Gymnasium7/8/9/10 to E/F/G/H. Chapter3.7 physical36 is a shared content topic; no fixed genotype/grade mapping was created.','BBAndBEActualOriginalPDFBytesExact':True,'nativeActualBaselineExitCode':1,'nativeActualCandidateExitCode':0,'nativeCheckerUnchanged':bind(R/'app/scripts/reportGymnasiumDurationModelReadiness.ts'),'native615ReadInputBytesExactBeforeAfter':len(native['exactNativeReadInputBindings']),'initialReplicaFalseSubjectInferenceRetained':True,'neutralTemporaryReplicaReason':'Unmodified inferSubject checks absolute path. Putting the replica in a folder whose name contains biologie created foreign-source false positives. The successful run uses a neutral temporary filesystem name; original checker and all source/view/status bytes are unchanged. No parser, status or gate exception is used.','activeNativeDurationStatus':'HOLD until root actually integrates reviewed five rows and regenerates/checks active report. This review approves the exact inert candidate only.','wholeOriginalSourceCoverageHoldsRemainOpen':True,'noNewGradesSchoolFormsStagesOrCourseProfiles':True,'targetAndPrerequisiteOnlyRolesUnchanged':True,'historicalCanonicalDPAOrMOrVReviewsNotRestarted':True,'newStrictCompletions':0,'restoredActiveBindings':0,'activeWrites':0,'checkerChanges':0,'qualityFloorsReduced':False,'humanApproval':False,'humanTrial':False})
inputs={b['path']:b for b in pre['actualInputBindings']+first['actualReadInputs']+native['exactNativeReadInputBindings']+afiles+[bind(prepath),bind(afreeze),bind(candidatePath),bind(A/'five-component-duration-policy.delta.candidate.json'),bind(R/'app/scripts/generateGymnasiumDurationOfferings.ts')]}
for b in inputs.values():verify(b)
write('actual-final-input-bindings.json',list(inputs.values()))
print(json.dumps({'fiveKEEP':5,'oldPolicyRowsExact':148,'nativeCandidateExit0':True,'activeWrites':0,'finalInputs':len(inputs)}))
