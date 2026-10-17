from pathlib import Path
import json,hashlib,copy,shutil
B=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-retained-target-scope-author-v1')
O=Path('/mnt/e/skillpilot-chemie-L7-20261017/eleven-colour-goals-retained-target-scope-author-successor-v2')
O.mkdir(exist_ok=False)

def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def digest(o):return hashlib.sha256(json.dumps(o,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def dump(name,value):
 p=O/name;assert not p.exists();p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');return pin(p)
def diff(a,b,p=''):
 if type(a)!=type(b):return [p]
 if isinstance(a,dict):return sum((diff(a.get(k),b.get(k),p+'/'+k) for k in sorted(a.keys()|b.keys())),[])
 if isinstance(a,list):return [] if a==b else ([p] if len(a)!=len(b) else sum((diff(x,b[i],p+'/'+str(i)) for i,x in enumerate(a)),[]))
 return [] if a==b else [p]
oldInput=B/'REVIEW-INPUT.clean-eleven-colours-whole-goals-Ps-primary-courses-and-CAS.json'
x=json.loads(oldInput.read_text());g='188bd684-e894-5753-8a50-798220b04d97'
before=copy.deepcopy(next(z['wholeProfile'] for z in x['wholeElevenUnchangedScientificProfiles'] if z['goalId']==g));after=copy.deepcopy(before)
old=before['applicationCaseBriefs'][1]['taskDemandDe']
new=old.replace('Marktanteil Farbstoffe sinkt von 70 auf 35 % des Umsatzes; Gesamtumsatz bleibt gleich.','Der Umsatzanteil der Farbstoffsparte am Gesamtumsatz von Firma B sinkt von 70 auf 35 %; der Gesamtumsatz bleibt gleich.').replace('deute den fallenden Umsatzanteil ohne ihn als Umsatzrückgang auszugeben.','deute den fallenden Umsatzanteil ohne ihn als Gesamtumsatzrückgang auszugeben.')
assert old!=new and 'Marktanteil' not in new
path='/applicationCaseBriefs/1/taskDemandDe';after['applicationCaseBriefs'][1]['taskDemandDe']=new
assert diff(before,after)==[path]
physicalBefore=None
for line in Path(x['currentWholeProfilesSource']['path']).read_text().splitlines():
 z=json.loads(line)
 if z['goalId']==g:physicalBefore=z['profile']
assert physicalBefore==before
cas={'schemaVersion':1,'role':'INACTIVE_GUARDED_WHOLE_P_PROFILE_PROPOSAL','goalId':g,'baseWholeP439':x['currentWholeProfilesSource'],'guardedField':'profile','beforeDigest':digest(before),'afterDigest':digest(after),'digestRule':'SHA256 of UTF-8 JSON with sorted keys, ensure_ascii=false, compact separators','before':before,'after':after,'exactChangedLeafFields':[{'jsonPointer':path,'before':old,'after':new}],'perObjectMismatchAction':'abort/rebase; never patch around a whole-profile mismatch','entireBaseMismatchAction':'abort/rebase against the actual accepted P439 context','noAutoApply':True,'normalL6L7WritesAuthorized':False}
casPin=dump('CAS.188-one-DE-task-field.whole-P.inactive.json',cas)
retained=[]
for name in ['CAS.188-one-prerequisite-only.whole-goal.inactive.json','CAS.eleven-whole-goals-explicit-own-scope.after-188-science.inactive.json','CAS.one-whole-BW-LK-view-two-labels-only.POST20.inactive.json','HANDOFF.clean-old-six-teacher-role-pairs-and-unchanged-support.json']:
 shutil.copyfile(B/name,O/name);assert (B/name).read_bytes()==(O/name).read_bytes();retained.append({'original':pin(B/name),'retainedExactCopy':pin(O/name)})
# Full content input: baseline profiles are explicitly named BEFORE; the sole proposed successor is present whole.
y=copy.deepcopy(x)
y['role']='CLEAN_FULL_CONTENT_ONLY_PACKAGE04_ADDITIVE_V2_FOR_FRESH_INDEPENDENT_FIRST_OR_OWN_INFORMED_FOLLOWUP'
y['authorIsIndependentReviewer']=False
y['previousCleanFullContentInput']=pin(oldInput)
y['wholeElevenCurrentBeforeScientificProfiles']=y.pop('wholeElevenUnchangedScientificProfiles')
y['wholeElevenProposedScientificProfiles']=copy.deepcopy(y['wholeElevenCurrentBeforeScientificProfiles'])
for z in y['wholeElevenProposedScientificProfiles']:
 if z['goalId']==g:z['wholeProfile']=copy.deepcopy(after)
y['separate188PClarificationWholeProfileChange']=cas
y['positiveProfileSuccessorBoundary']={'operativeProposedWholeProfiles':'wholeElevenProposedScientificProfiles','beforeBaselineWholeProfiles':'wholeElevenCurrentBeforeScientificProfiles','whole1887f5b1ScientificComparison':'Retains whole base goals and whole BEFORE profiles for the separate existing prerequisite comparison. For the proposed188 P use the exact whole AFTER profile.','changedGoalId':g,'soleChangedScientificPLeaf':path,'allOtherScientificContentFieldsUnchanged':True,'newLearnerPerformanceOrExecutionEvidence':False}
y['retainedOriginalCASPins']=retained
# Unbiased questions: no author verdict or foreign finding is included.
y['questions'][0]='Judge all eleven whole unchanged skills and complete proposed DE/EN P cases in each listed course/source context. Exactly188 has the separately guarded one-DE-task-field successor; all other profiles are the current unchanged baseline. Is explicit own acquisition scope justified without fake exact whole-source credit or learner choice?'
y['questions'].append('Independently compare the full188 BEFORE and AFTER P. Is the single German case2 task field precise about company revenue shares and total/segment revenue, and does it preserve all given data, expectations, both cases, transfer and the separate requires/scope proposals? No prior reviewer verdict is supplied.')
inputPin=dump('REVIEW-INPUT.clean-eleven-colours-plus-one188-DE-task-successor.v2.json',y)
selector={'role':'CLEAN_FULL_CONTENT_ONLY_FOR_TWO_OTHER_INDEPENDENT_REVIEWERS','authorIsIndependentReviewer':False,'reviewInput':inputPin,'oneFieldWholePCAS':casPin,'unchangedCASObjects':[a['retainedExactCopy'] for a in retained[:3]],'separateCleanOldRoleHandoff':retained[3]['retainedExactCopy'],'readingBoundary':'Read only this selector, its clean full content and original content sources before your own FIRST or clearly labelled own informed follow-up. Do not read AUTHOR.md/AUTHOR.json, README or any author/peer judgments beforehand. Fresh B and own informed A retain different review roles.','base':'Exact original Post20 private650/39 and physical P439. Original v1 package remains immutable; all proposals remain inactive.','M7':False,'HumanApproval':False,'actualLearnerPerformance':False,'currentLegalOrOfficialWholeCreditClaim':False}
selectorPin=dump('SELECTOR.clean-v2-content-for-other-reviewers.json',selector)
checks={'role':'AUTHOR_BOUNDED_MECHANICAL_CHANGE_MEASUREMENT_NOT_INDEPENDENT_ACCEPTANCE','goalId':g,'wholeProfileBeforeMatchesPhysicalP439':before==physicalBefore,'actualWholePChangedLeafPaths':diff(before,after),'expectedSingleLeafPath':path,'allNumbersPreserved':{'before':[n for n in ['70','35','zehn','drei'] if n in old],'after':[n for n in ['70','35','zehn','drei'] if n in new]},'constantTotalRevenueModel':{'totalBeforeSymbol':'T','totalAfterSymbol':'T','dyeBefore':'0.70*T','dyeAfter':'0.35*T','afterBeforeRatio':0.35/0.70,'relativeChange':0.35/0.70-1,'totalRevenueRelativeChange':0},'afterUnchangedENAndExpectationsAndTransfers':all(before[k]==after[k] for k in ['expectations','coverageExpectations','variationAxes']) and all(a==b for a,b in zip(before['applicationCaseBriefs'][:1],after['applicationCaseBriefs'][:1])) and all(before['applicationCaseBriefs'][1][k]==v for k,v in after['applicationCaseBriefs'][1].items() if k!='taskDemandDe'),'copiedOriginalCASObjectsByteIdentical':retained,'canonicalWholeScopeChangesUnmodified':y['wholeElevenBeforeAndAfterGoals']==x['wholeElevenBeforeAndAfterGoals'],'188RequiresWholeCASUnmodified':y['separate188ScientificWholeGoalChange']==x['separate188ScientificWholeGoalChange'],'BWWholeViewLabelsCASUnmodified':y['wholeBWPost20ViewLabelChange']==x['wholeBWPost20ViewLabelChange'],'physicalCandidateOrMainOrNormalWrites':False,'fullGatesNativeBuildRun':False,'authorSelfIndependentApproval':False}
measurementPin=dump('MEASUREMENT.one-field-and-retained-whole-CAS.json',checks)
author={'role':'AUTHOR_ADDITIVE_V2_SINGLE_FIELD_REMEDIATION_NOT_INDEPENDENT_REVIEW','priorPackage':str(B),'cleanInput':inputPin,'newWholePCAS':casPin,'retainedWholeCASs':[a['retainedExactCopy'] for a in retained[:3]],'authorReason':'The original German case2 calls an internal company revenue fraction a market share and can be read as forbidding any revenue decrease. The replacement names the dye-division share of company B total revenue and precisely excludes only a total-revenue decrease. With fixed total T,0.70T→0.35T halves dye-division revenue. The English task and both-language expected performances already distinguish total revenue and remain unchanged.','boundedChange':'Exactly one scientific P leaf. No new demands, numbers, sources, transfers, goals, roles, selectors, images, decks or runtime. All previous scope/requires/view CASs remain byte-identical and inactive.','requiresOtherReviews':True,'M7':False,'HumanApproval':False,'nativeOrBuildOrFullGateRun':False,'mainNormalL6L7CapsuleMutated':False}
dump('AUTHOR.v2-one-field-rationale.separate.json',author)
(O/'AUTHOR.v2-one-field-rationale.separate.md').write_text('''# Paket04: additiver v2-Autornachfolger\n\nDies ist eine Autorenkorrektur, keine eigene unabhängige Freigabe. Das alte Paket und alle FIRSTs bleiben unverändert.\n\nNur188 `/applicationCaseBriefs/1/taskDemandDe` ändert sich. Die Daten betreffen den Umsatzanteil der Farbstoffsparte am Gesamtumsatz von Firma B. Die Aufgabenanweisung schließt präzise einen Gesamtumsatzrückgang aus. Bei konstantem Gesamtumsatz T fällt der Spartenumsatz von0,70T auf0,35T, also um50%. Diese Folgerung ist zulässig.\n\nEN, Erwartungen beider Sprachen, Zahlen, beide Fälle, Transfers und alle übrigen P-Felder bleiben gleich. Die elf Scope-Ganzobjekte, die getrennte188-requires-Korrektur und die beiden BW-LK-Labels bleiben bytegenau erhalten. Der neue P-CAS enthält das ganze exakte Before/After und bricht bei abweichendem aktuellem Kontext ab.\n\nDer saubere Vollinput enthält vollständigen unveränderten Quellen-/Kurs-/Material-/Rollen-Kontext, ausdrücklich bezeichnete BEFORE-Profile und die ganzen vorgeschlagenen AFTER-Profile. Er enthält keine Autoren- oder Peerurteile. Der gesonderte Autorenbericht gehört nicht zum FIRST-Leseweg. Eine frische fremde B-Prüfung und eine klar bezeichnete eigene informierte A-Nachprüfung werden separat benötigt. Keine Normal-/Main-/L6-/L7-/Kapseländerung, kein Build/Native/Fullgate und keine M7-/Human-/Lernendenbehauptung.\n''')
(O/'prepare-v2.py').write_bytes(Path(__file__).read_bytes())
files=sorted(p for p in O.iterdir() if p.is_file());seal=O/'AUTHOR.v2.SEAL.sha256';seal.write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n' for p in files))
for p in [*files,seal]:p.chmod(0o444)
assert all(hashlib.sha256((O/line.split('  ',1)[1]).read_bytes()).hexdigest()==line.split('  ',1)[0] for line in seal.read_text().splitlines())
print(json.dumps({'outputDirectory':str(O),'selector':selectorPin,'cleanFullInput':inputPin,'newWholePCAS':casPin,'seal':pin(seal),'sealedFiles':len(files),'measurement':measurementPin,'onlyChangedPLeaf':diff(before,after)},ensure_ascii=False,indent=2))
