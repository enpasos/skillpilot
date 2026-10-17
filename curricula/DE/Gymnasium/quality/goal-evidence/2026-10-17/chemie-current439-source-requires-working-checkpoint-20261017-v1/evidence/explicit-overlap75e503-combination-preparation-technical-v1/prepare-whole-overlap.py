import json,hashlib,copy,datetime
from pathlib import Path
E=Path('/mnt/e/skillpilot-chemie-L7-20261017');O=Path(__file__).parent
A=E/'arrhenius-and-HE-practice-retained-target-scope-author-v1';B=E/'nano-aromatics-and-methods-retained-target-scope-author-v1';C=E/'paired-package03-04-05-and-HB7f-actual-current650-technical-v1'
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.load(open(p))
def digest(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(n,x):
 p=O/n
 if p.exists():raise RuntimeError('Existing output; create additive successor instead: '+str(p))
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)
def check_pin(p,expected):
 actual=pin(p);assert actual['sha256']==expected,actual;return actual
cas1path=A/'CAS.whole-twelve-ordinary-goals-and-four-HE-views.unapplied.json';cas2path=B/'CAS.ten-whole-goals-two-derived-teachers-and-eight-own-scopes.inactive.json'
p1=check_pin(cas1path,'9b19fdacdb549b2598d48424560dad763d4ab1b2f5989b30229bc7a5409abd4a');p2=check_pin(cas2path,'8a0ad4cf2c0e092ee2e9aaefe022ebe80890b52be864635b01c8308f89024403')
input1=A/'REVIEW-INPUT.clean-arrhenius-and-five-HE-endpoints-whole-content.json';input2=B/'REVIEW-INPUT.clean-ten-whole-Nano-aromatic-methods-goals-Ps-primary-and25contexts.json'
clean1=check_pin(input1,'fa6cc595317af199898dd315ffc8f554aae9d02861e70ea00121534028147d88');clean2=check_pin(input2,'f9aeaf767fbbb6fe20e88ea23e01c78acd6c7a98ae39920c002890ed2baf0744')
original=E/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json'
original_pin=check_pin(original,'48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd')
current=C/'candidate.canonical650.paired03-04-plus-NI05-and-HB7f.private.json'
current_pin=check_pin(current,'4eca52fe0e2fa45f2c4aa0780a38c3f78b1f0da6d6cff7eb379815c170104837')
assembly_path=C/'ASSEMBLY.exact-guards-and-inputs.json';assembly=read(assembly_path);assert assembly['newCanonical']==current_pin
binding_path=C/'BINDING.actual439-P-and-fifteen-SEM-source-FPs.json';binding=read(binding_path)
current_p_pin=binding['P439'];assert pin(current_p_pin['path'])==current_p_pin
original_p_pin=read(input1)['actualCurrentWholeP439'];assert pin(original_p_pin['path'])==original_p_pin
def profiles(p):return {r['goalId']:r['profile'] for r in map(json.loads,Path(p).read_text().splitlines())}
pm=profiles(current_p_pin['path']);oldpm=profiles(original_p_pin['path']);cleanpm1={x['goalId']:x['wholeProfile'] for x in read(input1)['wholeTwelveUnchangedCurrentPositiveProfiles']};cleanpm2={x['goalId']:x['wholeProfile'] for x in read(input2)['wholeTenUnchangedCurrentProfiles']}
root_review=check_pin(E/'arrhenius-and-HE-practice-informed-root-review-v1/REVIEW.informed-root.package01-02.json','2bd1a9d52f8614720fc04879b15be4e0b41f05252d7cc976aec48f2231c7db70')
root_seal=check_pin(E/'arrhenius-and-HE-practice-informed-root-review-v1/SEAL.informed-root.package01-02.json','3ab471f0f9708d0f14140a5ab2d260e1ddb0187c679329f56419ff3584e6d7b2')
root_check=check_pin(E/'arrhenius-and-HE-practice-informed-root-review-v1/CHECK.actual-current-stock-roles-P-contexts-and-SRS.json','598adf2bfd9180c353c334f238d5a12c36c5015a9059f92692b1a9e314a349af')
c1=read(cas1path);c2=read(cas2path);m1={x['goalId']:x for x in c1['ordinaryWholeGoalChanges']};m2={x['goalId']:x for x in c2['wholeObjects']};origm={g['id']:g for g in read(original)['goals']};curm={g['id']:g for g in read(current)['goals']}
def differences(x,y,p=''):
 if x==y:return []
 if isinstance(x,dict) and isinstance(y,dict):return [d for k in sorted(set(x)|set(y)) for d in differences(x.get(k),y.get(k),(p+'.' if p else '')+k)]
 return [p]
def project(after,sourceAfter):
 out=copy.deepcopy(after);e=out['extendedData'];se=sourceAfter['extendedData'];ids={x['extensionId'] for x in se.get('skillPilotAcquisitionExtensions',[])}
 e['skillPilotAcquisitionExtensions']=[x for x in e.get('skillPilotAcquisitionExtensions',[]) if x['extensionId'] in ids]
 if 'skillPilotAcquisitionExtensions' not in se:e.pop('skillPilotAcquisitionExtensions',None)
 if 'applicabilityOverrides' in se:e['applicabilityOverrides']=copy.deepcopy(se['applicabilityOverrides'])
 else:e.pop('applicabilityOverrides',None)
 return out
rows=[];checks=[];afterpins=[]
for gid in ['75e2eff1-f871-5461-9e3f-26d0b333ce2f','503dedcb-0efc-5e6b-bbc9-20761a0951f5']:
 r1=m1[gid];r2=m2[gid];before=r1['before'];assert before==r2['before']==origm[gid]==curm[gid]
 for r in [r1,r2]:
  assert digest(r['before'])==r['beforeDigest'].removeprefix('sha256:')
  assert digest(r['after'])==r['afterDigest'].removeprefix('sha256:')
 proposed=copy.deepcopy(before);e=proposed.setdefault('extendedData',{});basee=before.get('extendedData',{})
 # Preserve exact annotation objects and the original order of each contributing list.
 merged=[];by_id={}
 for source in [basee,r1['after']['extendedData'],r2['after']['extendedData']]:
  for annotation in source.get('skillPilotAcquisitionExtensions',[]):
   ident=annotation['extensionId']
   if ident in by_id:assert by_id[ident]==annotation,'Conflicting duplicate annotation '+ident
   else:merged.append(copy.deepcopy(annotation));by_id[ident]=annotation
 e['skillPilotAcquisitionExtensions']=merged
 original_override=copy.deepcopy(basee.get('applicabilityOverrides',{}));allkeys=set(original_override)|set(r1['after']['extendedData'].get('applicabilityOverrides',{}))|set(r2['after']['extendedData'].get('applicabilityOverrides',{}))
 combined_override={}
 for dimension in sorted(allkeys):
  values=[src.get('applicabilityOverrides',{}).get(dimension) for src in [basee,r1['after']['extendedData'],r2['after']['extendedData']]]
  if dimension=='jurisdiction':combined_override[dimension]=sorted({x for v in values if v is not None for x in v})
  else:
   nonmissing=[v for v in values if v is not None];assert all(v==nonmissing[0] for v in nonmissing),'Unexpected non-jurisdiction override collision';combined_override[dimension]=copy.deepcopy(nonmissing[0])
 if combined_override:e['applicabilityOverrides']=combined_override
 elif 'applicabilityOverrides' in e:e.pop('applicabilityOverrides')
 expected=['DE-HE'] if gid.startswith('75e2') else ['DE-HE','DE-NW']
 assert e['applicabilityOverrides']['jurisdiction']==expected
 assert len(merged)==2 and {a['jurisdiction'] for a in merged}=={'DE-HE','DE-NW'}
 assert all(a['officialWholeSourceCredit'] is False for a in merged)
 assert project(proposed,r1['after'])==r1['after'];assert project(proposed,r2['after'])==r2['after']
 fields=differences(before,proposed);assert fields==['extendedData.applicabilityOverrides','extendedData.skillPilotAcquisitionExtensions'],fields
 assert proposed['requires']==before['requires'] and proposed['applicability']==before['applicability']
 assert pm[gid]==oldpm[gid]==cleanpm1[gid]==cleanpm2[gid]
 afterpin=write('AFTER.whole-'+gid[:8]+'.HE-and-NW-metadata-only.unapplied.json',proposed);afterpins.append(afterpin)
 row={'goalId':gid,'title':before['title'],'operation':'Replace whole object ONLY after separate root integration authorization and all pending review/confirmation conditions','digestRule':'sha256 of UTF-8 sorted-key compact JSON, ensure_ascii=false; whole-object guard, not a stock P/SEM/M fingerprint',
 'originalBaseWholeGoal':before,'originalBaseWholeGoalDigest':digest(before),'package01and02':{'wholeCAS':p1,'sourceBeforeDigest':r1['beforeDigest'],'sourceAfterDigest':r1['afterDigest'],'wholeBefore':r1['before'],'wholeAfter':r1['after']},'package06and07':{'wholeCAS':p2,'sourceBeforeDigest':r2['beforeDigest'],'sourceAfterDigest':r2['afterDigest'],'wholeBefore':r2['before'],'wholeAfter':r2['after']},'currentBaselineWholeGoal':curm[gid],'currentBaselineWholeGoalDigest':digest(curm[gid]),'combinedAfterWholeGoal':proposed,'combinedAfterWholeGoalDigest':digest(proposed),'combinedAfterFile':afterpin,'onlyChangedFields':fields,'preservation':{'originalNonScopeFieldsExact':True,'wholeRequiresExact':True,'wholeCurrentPExact':True,'allOriginalSourceAnnotationObjectsPreserved':True,'allOriginalSourceProvenanceAndInheritanceBoundariesExact':True,'rawApplicabilityUnchanged':True},'jurisdictionInputs':expected,'derivedNWTeacherBoundary':{'independentNWOverride':False,'actualDependentGoalId':'503dedcb-0efc-5e6b-bbc9-20761a0951f5','actualDependentRequiresTeacher':gid in curm['503dedcb-0efc-5e6b-bbc9-20761a0951f5']['requires'],'actualAfterCompilerMeasured':False} if gid.startswith('75e2') else None,'pending':['Root06/07 independent review','Other non-author A06/07 review','Then metadata-only author confirmation if requested','Explicit integration authorization and guarded combined assembly','Later actual compiled scope and fingerprint binding checks']}
 rows.append(row);checks.append({'goalId':gid,'originalBothBeforesAndActualCurrentBaselineExact':True,'bothSourceBeforeAndAfterDigestsRecomputedExact':True,'proposedWholeDigest':digest(proposed),'bothSourceAfterProjectionsExact':True,'source01and02AnnotationIds':[x['extensionId'] for x in r1['after']['extendedData'].get('skillPilotAcquisitionExtensions',[])],'source06and07AnnotationIds':[x['extensionId'] for x in r2['after']['extendedData'].get('skillPilotAcquisitionExtensions',[])],'proposedAnnotationIds':[x['extensionId'] for x in merged],'proposedJurisdictionOverrides':expected,'noIndependent75eNWOverride':True,'wholePExactAcrossBothCleanInputsAndOriginalAndCurrent':True,'requiresExact':True,'rawApplicabilityExact':True})
inputs={'package01and02Clean':clean1,'package06and07Clean':clean2,'package01and02WholeCAS':p1,'package06and07WholeCAS':p2,'originalC20':original_pin,'actualCurrentC650':current_pin,'actualCurrent39Views':assembly['wholeViewCollection'],'actualCurrentWholeP439':current_p_pin,'originalWholeP439':original_p_pin,'actualCurrentAssemblyReceipt':pin(assembly_path),'actualCurrentTechnicalBindingReceipt':pin(binding_path),'root01and02Review':root_review,'root01and02Seal':root_seal,'root01and02OwnStockCheck':root_check}
cas=write('CAS.two-whole-overlap-75e503-explicit-combination.unapplied.json',{'schemaVersion':1,'role':'UNAPPLIED technical whole-object combination TEMPLATE; no scientific approval or application','preparedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputPins':inputs,'absoluteWholeFileGuard':current_pin,'onAnyFileOrWholeObjectOrSourceAfterMismatch':'STOP; do not apply either original whole-after sequentially; explicit rebase and fresh whole guards required','wholeGoalChanges':rows,'otherWholeCanonicalGoalsToMutate':0,'wholePChanges':0,'requiresChanges':0,'wholeViewChanges':0,'scopeSourceVotesAdded':0,'authorConfirmationOfCombinedMetadata':'pending after the two package06/07 non-author reviews','package06and07PairedApproval':'pending; not inferred from root01/02 KEEP','noAutoApply':True,'applyAuthorizedByThisPreparation':False,'normalMainL6L7OrOldCapsuleWritesAuthorized':False,'M7':False,'HumanApproval':False,'newCompilerInvocation':False})
clean=write('REVIEW-INPUT.two-whole-overlap-metadata-combination.for-author-confirmation.pending.json',{'role':'Metadata-only combination content for later confirmation; inactive; no new science verdict','inputPins':{k:v for k,v in inputs.items() if not k.startswith('root01and02')},'wholeGoalContent':[{ 'goalId':r['goalId'],'originalWholeGoal':r['originalBaseWholeGoal'],'wholePackage01and02After':r['package01and02']['wholeAfter'],'wholePackage06and07After':r['package06and07']['wholeAfter'],'wholeCurrentBaselineGoal':r['currentBaselineWholeGoal'],'wholeProposedCombinedAfter':r['combinedAfterWholeGoal'],'wholeUnchangedCurrentPositiveProfile':pm[r['goalId']]} for r in rows],'rule':'Keep both exact source annotation objects.503d has HE+NW override;75e has HE override and retains declared NW derivation from503d. No application or current after-compiler claim.','authorConfirmationPending':True})
check=write('CHECK.original-both-after-current-baseline-and-lossless-combination.json',{'role':'Actual technical guards, no new P/source/M science vote','inputPins':inputs,'checks':checks,'inputFilePinsAfterPreparation':{k:pin(v['path']) for k,v in inputs.items()},'allInputFilesStillExact':all(pin(v['path'])==v for v in inputs.values()),'applicationPerformed':False,'whole650CandidateWritten':False,'compilerRun':False,'authorConfirmationPending':True,'package06and07IndependentReviewsPending':True})
md=['#75e/503d: explizite Whole-Object-Kombinationsvorlage','',
 '**Vorbereitet, nicht angewendet. Kein neues Fach-/Quellenvotum.**','',
 '| Ziel | Kombinierte Annotationen | Explizite Jurisdiktions-Overrides |','|---|---|---|',
 '|75e2eff1|ganze HE-Annotation aus01/02 + ganze NW-Annotation aus06/07|nur DE-HE; NW bleibt der erklärte Ableitungsweg aus503d.requires|',
 '|503dedcb|ganze HE-Annotation aus01/02 + ganze NW-Annotation aus06/07|DE-HE und DE-NW|','',
 'Beide ursprünglichen before-Objekte stimmen miteinander, mit der C20-Basis und mit der tatsächlichen aktuellen C650-Basis überein. Alle ursprünglichen before-/after-Digests wurden nach der ausdrücklich angegebenen Whole-Object-Regel neu berechnet und stimmen. Die alten CAS-Digests mit beziehungsweise ohne sha256:-Präfix bleiben original erhalten.','',
 'Die vorgeschlagenen zwei ganzen after-Objekte ändern ausschließlich extendedData.applicabilityOverrides und extendedData.skillPilotAcquisitionExtensions. Beide Annotationen bleiben je Objekt wort- und feldgleich erhalten; Projektion des Kombinationsobjekts auf jeweils einen Quellstand reproduziert dessen ganzes after exakt. Fachtexte, requires, Raw-applicability, Provenienz, boundary-Felder und die ganzen aktuellen P-Profile stimmen mit den Originalen überein. Es wird keine neue Kurs-/Stufen-/Source- oder Masterybehauptung ergänzt.','',
 '## Guards','',f'- Tatsächliche aktuelle C650: `{current_pin["sha256"]}`',f'- Original C20: `{original_pin["sha256"]}`',f'-01/02 Whole-CAS: `{p1["sha256"]}`',f'-06/07 Whole-CAS: `{p2["sha256"]}`','']
for r in rows:md += [f'-{r["goalId"][:8]} current-before: `{r["currentBaselineWholeGoalDigest"]}`; combined-after: `{r["combinedAfterWholeGoalDigest"]}`']
md += ['', '## Offen vor jeder Integration','',
 'Root06/07 und fremder A06/07 sind für diese Vorlage als ausstehend geführt. Der vorhandene Root01/02-KEEP wird nur als gepinnte Herkunft geführt und ersetzt keine der06/07-Prüfungen. Danach kann eine ausdrückliche metadata-only Autorenbestätigung erfolgen. Diese Vorbereitung bestätigt sie noch nicht.','',
 'Der Integrator muss die volle aktuelle C650-Datei, beide aktuellen WholeGoal-before-Objekte, beide ursprünglichen Quell-after-Objekte und die freigegebene kombinierte Vorlage unter exakten Guards prüfen. Nicht erst einen fremden Whole-after schreiben und ihn danach durch den anderen überschreiben. Ändert sich die Baseline, schlägt der volle Datei-Guard geschlossen fehl und verlangt eine ausdrückliche neue Basisbindung.','',
 'Die vier HE-Viewänderungen aus01/02 und alle übrigen Goals aus den Paketen sind nicht Teil dieser Zwei-Objekt-Vorlage. Es wurde kein650er-Nachfolger erzeugt, kein APV-/Compiler-/Build-/Native-/Central-/M-Lauf gestartet und keine Main-/Normal-/L6-/L7-/alte Capsule geschrieben. Tatsächliche spätere NW-Eligibility von75e und alle Fingerprintbindungen bleiben offen.','']
report=O/'README.unapplied-two-goal-combination-and-pending-confirmations.md';assert not report.exists();report.write_text('\n'.join(md))
seal=write('SEAL.unapplied-technical-combination.sha256.json',{'role':'Immutable unapplied technical preparation; no source/science votes','inputPins':inputs,'files':[cas,clean,check,*afterpins,pin(report),pin(__file__)],'applicationPerformed':False,'reviewRunIds':[],'M7':False,'HumanApproval':False,'futureAuthorAndRootApprovalPending':True})
selector=write('SELECTOR.unapplied-explicit-overlap-combination.json',{'role':'Inactive whole-object CAS combination preparation; no integration approval','wholeCAS':cas,'cleanContentForLaterAuthorConfirmation':clean,'guardCheck':check,'wholeAfterFiles':afterpins,'readme':pin(report),'seal':seal,'inputCurrentC650':current_pin,'applicationPerformed':False,'package06and07ReviewsAndAuthorConfirmationPending':True})
print(json.dumps({'wholeCAS':cas,'guardCheck':check,'wholeAfterFiles':afterpins,'seal':seal,'selector':selector},ensure_ascii=False,indent=2))
