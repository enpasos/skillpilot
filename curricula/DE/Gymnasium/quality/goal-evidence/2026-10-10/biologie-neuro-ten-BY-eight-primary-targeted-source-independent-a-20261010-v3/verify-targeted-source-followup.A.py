"""Verify exact scope and serialize literal independent source decisions after reading."""
from pathlib import Path
import datetime, hashlib, json, re, subprocess
from bs4 import BeautifulSoup

BASE=Path(__file__).resolve().parent.relative_to(Path.cwd())
TECH=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3')
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-current-v3-independent-a-20261010-v2')
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):
    p=Path(p);assert p.is_file() and not p.is_symlink(),p
    assert subprocess.run(['git','check-ignore','-q',str(p)]).returncode==1,p
    return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def put(n,x):
    p=BASE/n;assert not p.exists(),p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
e=read(TECH/'neutral-current343-source-only-eight-BY-primary.entry.json')
assert sha(TECH/'neutral-current343-source-only-eight-BY-primary.entry.json')=='sha256:623d3c3815f339d2473300b591db971fb6ef6c2edffdb76b15af7fcb561ed8c8'
assert sha(TECH/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json')=='sha256:356479fc6ff5409ef96e3c8e8e3cea2dde2e8ea7f565e30aadba789eff9b69c9'
f=read(TECH/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json')
files=[]
for key in ['ownFiles','requiredCurrentPortableExternalFiles']:
    for x in f[key]:
        actual=bind(x['path']);assert actual['sha256']==x['sha256'] and actual['bytes']==x['bytes'],x['path'];files.append(actual)
old=read(e['priorNativeV3Entry']['path']);sourceauthor=read(e['sourceAuthorV5Entry']['path'])
current=read(e['coreInputs']['currentBYSourceExtraction']['path']);original=read(sourceauthor['originalExtraction']['path'])
ids=set(sourceauthor['selectedEightNewPrimarySourceIds']);assert len(ids)==8
originalrows={s['id']:s for s in original['sourceGoals']};currentrows={s['id']:s for s in current['sourceGoals']}
assert set(originalrows)==set(currentrows) and len(currentrows)==222
for sid,row in currentrows.items():
    normalized=dict(row)
    for key in ['sourceDocumentKey','actualPrimaryLocator']:
        if key not in originalrows[sid]:normalized.pop(key,None)
        else:normalized[key]=originalrows[sid][key]
    assert normalized==originalrows[sid],sid
assert current['sourceDocument']==original['sourceDocument']
assert current['localArtifactProvenance']['legacyLocalArtifactIsOfficialPrimary'] is False
assert current['localArtifactProvenance']['currentWholeSourceClearanceClaimed'] is False
assert current['localArtifactProvenance']['other214PrimaryReviewRestarted'] is False
beforeinventory=read(old['coreInputs']['source41CurrentWholeObjects']['path']);afterinventory=read(e['coreInputs']['source41CurrentWholeObjects']['path'])
before={(r['goalId'],w['wholeCurrentSourceGoal']['id']):w for r in beforeinventory['rows'] for w in r['wholeDirectSourceWitnesses']}
after={(r['goalId'],w['wholeCurrentSourceGoal']['id']):w for r in afterinventory['rows'] for w in r['wholeDirectSourceWitnesses']}
assert set(before)==set(after) and len(after)==41
oldmap=read(next(w['mapping']['path'] for k,w in before.items() if k[1]=='ad855269-70c3-526c-951b-cc2d54106f36'))
newmap=read(e['coreInputs']['currentBYMapping']['path']);assert len(oldmap['mappings'])==len(newmap['mappings'])==228
mappingchanges=[(a,b) for a,b in zip(oldmap['mappings'],newmap['mappings']) if a!=b]
assert len(mappingchanges)==1 and mappingchanges[0][0]['legacyGoalId']=='ad855269-70c3-526c-951b-cc2d54106f36'
assert mappingchanges[0][0]['matchType']=='exact' and mappingchanges[0][1]['matchType']=='partial'
assert len(oldmap['decisions'])==len(newmap['decisions'])==222
decisionchanges=[(a,b) for a,b in zip(oldmap['decisions'],newmap['decisions']) if a!=b]
assert len(decisionchanges)==1 and decisionchanges[0][1]['sourceGoalId']=='ad855269-70c3-526c-951b-cc2d54106f36'
soups={x['year']:BeautifulSoup(Path(x['actualRawPrimary']['path']).read_text(),'html.parser') for x in e['actualPrimaryFetches']}
normalize=lambda s:re.sub(r'\s+',' ',s).strip()
places={'ad855269-70c3-526c-951b-cc2d54106f36':(8,'B8 Lernbereich 2:',2),'92e3879a-12e7-56d6-b8c0-94e61db932c4':(8,'B8 Lernbereich 2:',3),'8b2bc52e-c75a-52f8-8d6e-c889098b1b63':(8,'B8 Lernbereich 2:',5),'65529a29-8e40-5c29-ab13-43c5e9d91fe0':(8,'B8 Lernbereich 2:',6),'ed0a0007-5c26-5a6c-954b-9840ee344563':(8,'B8 Lernbereich 4:',1),'dd94b698-5c06-5a28-966f-b0294fa78805':(8,'B8 Lernbereich 4:',2),'f2c5e33a-178f-54e1-9f8c-5d1a4910870a':(8,'B8 Lernbereich 4:',3),'7a28147c-b531-563c-845d-b397997c6639':(9,'B9 5.4',2)}
reasons={
'ad855269-70c3-526c-951b-cc2d54106f36':'Actual operator includes optical apparatus and visual-error causes/correction; detailed neural pathway covers only an overlap and adds authored crossing/CGL/radiation detail. exact-to-partial scientifically necessary and correct.',
'92e3879a-12e7-56d6-b8c0-94e61db932c4':'Actual operator requires hearing-protection measures derived from hearing knowledge; route explanation is a bounded prerequisite contribution, not proof of the whole protective performance.',
'8b2bc52e-c75a-52f8-8d6e-c889098b1b63':'Hormonal glucose regulation and reasoned links to habits, predisposition and diabetes match the canonical competence granularity; actual P case distinctions and cautious risk interpretation retained.',
'65529a29-8e40-5c29-ab13-43c5e9d91fe0':'Actual whole operator includes nervous/hormonal stress symptoms and individual coping; general brain-processing interpretation does not satisfy this whole composite duty. Existing partial remains bounded.',
'ed0a0007-5c26-5a6c-954b-9840ee344563':'Observation/comparison and dummy experiments connecting inner factors with triggering stimuli match the canonical performance. Hypothetical controlled case material is not actual experimental execution.',
'dd94b698-5c06-5a28-966f-b0294fa78805':'Data-grounded assessment of predominant genetic/acquired contributions matches canonical granularity; graded causal limits and interacting contributions remain required.',
'f2c5e33a-178f-54e1-9f8c-5d1a4910870a':'Experiment planning, environmental influence and bounded human/other-organism learning comparison match canonical performance; the actual primary contents and P material both include classical and operant conditioning.',
'7a28147c-b531-563c-845d-b397997c6639':'Actual section is 5.4 expectation2, not official 5.8. Insect/vertebrate sense-organ/performance comparison is broader than two human organ models; existing partial is not new whole comparison clearance.'}
rows=[]
for sid in sorted(ids):
    year,header,ordinal=places[sid];sp=soups[year]
    assert sp.title and f' - {year} - Biologie' in sp.title.text
    h=next(h for h in sp.find_all(['h1','h2','h3','h4']) if header in h.text)
    li=h.find_parent('section').find('ul').find_all('li',recursive=False)[ordinal-1]
    # Preserve inline curricular decision marks (including "ggf."); exclude
    # only the separate expandable taxonomy dialogs, not normative text.
    operator_li=BeautifulSoup(str(li),'html.parser')
    for dialog in operator_li.find_all('dialog'):dialog.decompose()
    operator=normalize(operator_li.get_text(' ',strip=True))
    assert operator==normalize(currentrows[sid]['rawSourceText']),sid
    link=next((k,w) for k,w in after.items() if k[1]==sid)
    assert link[1]['wholeCurrentSourceGoal']==currentrows[sid]
    rows.append({'sourceGoalId':sid,'canonicalGoalId':link[0][0],'legacyAlias':currentrows[sid]['rawSourceSpan'],'actualYear':year,'actualSectionHeading':normalize(h.text),'actualCompetenceOrdinal':ordinal,'actualOperatorNormalizedSHA256':'sha256:'+hashlib.sha256(operator.encode()).hexdigest(),'actualPrimary':link[1]['currentActualPrimaryBytes'],'wholeCurrentSourceObjectMatchesActuallyReadPrimaryOperator':True,'currentMapping':link[1]['wholeCurrentMappingRecord'],'independentDecision':'accept_targeted_actual_primary_binding_and_bounded_mapping','independentReason':reasons[sid],'wholeCourseApproval':False,'humanApproval':False})
for k in ['whole479After','whole394After','wholeScience10Cases20','wholeDEENGoals','P10Current','native10Model','native10HTML','native10PortableHTML','native10PDF','currentSourceHE144','currentSourceHE157_144']:
    assert e['coreInputs'][k]==old['coreInputs'][k],k
assert e['currentRastersAndNativeCaptures']==old['actualCurrentRastersAndNativeCaptures']
assert e['ordinaryIndependentCampaigns']==old['ordinaryIndependentCampaigns']
assert sha(OWN/'current-native-ten-independent.A.json')=='sha256:65e3daa89ce515b72474be7895ffa9b1f218ab87a5b5f2b86dfe5a6823e98da6'
assert sha(OWN/'FINAL.current-native-ten-independent-A.freeze.json')=='sha256:2e464cef0bac71c692fa42e9b0e285e91ff9643636094eb272e3ef4114aecb89'
allpaths={x['path'] for x in files}|{str(OWN/'current-native-ten-independent.A.json'),str(OWN/'FINAL.current-native-ten-independent-A.freeze.json'),str(TECH/'neutral-current343-source-only-eight-BY-primary.entry.json'),str(TECH/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json')}
inputs=put('actual-current-input-bindings.A.json',{'schemaVersion':1,'files':[bind(p) for p in sorted(allpaths)],'scope':'Regular committable technical binding verification; scientific targeted source decisions separately based on actual reading, not hashes.'})
checks=put('targeted-source-exactness.actual.A.json',{'schemaVersion':1,'actualNeutralFilesVerified':len(files),'wholeSource222StableIdsBodiesRawAndOccurrencesPreserved':True,'other214NoNewWholePrimaryApproval':True,'legacyNormativeDescriptorExactButDerivedBytesExplicit':True,'currentEightActualOfficialHTMLOperatorsMatchSourceObjects':True,'actualMapping228OnlyOneExactToPartial':True,'actualDecisions222OnlyOneChanged':True,'current41DirectWitnessLinksExact':True,'canonicalWhole394AndP10ProfilesCasesNativeAndDInputsExactOwnSealedCurrentA':True,'original360680And20NativeCaptureBindingsExact':True,'humanApproval':False})
terminal=BASE/'normal-current-D10-campaign-A.transfer.terminal.actual.json'
actual_terminal=read(terminal)
assert actual_terminal['exitCode']==0 and 'results valid: 10' in actual_terminal['stdout']
report={'schemaVersion':1,'reviewId':BASE.name,'reviewerAgent':'/root/chemistry_rollout_report_review','role':'independent A targeted SOURCE followup; no author role','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','approved':0,'neutralCurrentSourceEntry':bind(TECH/'neutral-current343-source-only-eight-BY-primary.entry.json'),'neutralCurrentSourceFreeze':bind(TECH/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json'),'priorGenuineCurrentA':bind(OWN/'current-native-ten-independent.A.json'),'priorGenuineCurrentAFreeze':bind(OWN/'FINAL.current-native-ten-independent-A.freeze.json'),'sourceRows':rows,'targetedMachineSourceDecision':'ready for bounded source-only integration; actual eight primary bindings and one partial correction resolved; no new blocker found','wholeSourceAndCourseApproval':False,'historical214ReviewRestarted':False,'HEAndOtherExistingSourceCourseBoundariesRetained':True,'oldDerivedJSONOfficialPrimaryClaimSuperseded':True,'currentSourceAtlasDirectInheritedIsNotMappingExactPartial':True,'unchangedRealDPVReviewsRetained':True,'freshImageReviewsPerformed':0,'normalDescriptionCampaignAExactInputTransferValidation':{'status':'PASS','reviewedGoalCount':10,'terminal':bind(terminal),'unchangedGenuinePriorIndependentReviewsRetained':True,'newScientificDescriptionReviewClaimed':False},'sourceExactness':bind(checks),'methodology':bind(BASE/'targeted-source-followup.A.md'),'inputBindings':bind(inputs),'peerCurrentSourceVerdictsRead':False,'authorVerdictsAdopted':False,'sourceThirdPartyRightsReleaseClaimed':False,'humanApproval':False,'humanTrial':False,'activeStrictGain':0,'protectedCurrentBiologyStrictCount':343,'operativeWrites':0,'historicalWrites':0}
p=put('targeted-source-followup-independent.A.json',report)
print(json.dumps({'report':str(p),'reportSHA':sha(p),'actualTechnicalBindings':len(files),'actualTargetedPrimaryOperators':len(rows)}))
