"""Targeted independent SOURCE successor check after the immutable V3 FIRST."""
from pathlib import Path
import json,hashlib,datetime,copy,subprocess
from bs4 import BeautifulSoup
ROOT=Path('/home/enpasos/projects/skillpilot'); OWN=Path(__file__).parent; B=OWN.parent;BASE=B.parent
V5=BASE/'biologie-neuro-ten-BY-eight-primary-legacy-reference-clarification-author-root-20261010-v5'
def read(p):return json.loads(p.read_text())
def ref(p):return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def check(r):assert ref(ROOT/r['path'])==r
entryp=V5/'source-author-primary-and-historical-reference.entry.json';freezep=V5/'FINAL.BY-eight-primary-legacy-reference-author.freeze.json'
assert ref(entryp)['sha256']=='sha256:a552f2162a078c141415284ddf0056ce6a69a81b8899b7f75711e02d2d6e13f7'
assert ref(freezep)['sha256']=='sha256:56fb8b64cd5a49b123313059797e9378518adc7e1eaa37503797b97168c88125'
entry=read(entryp);freeze=read(freezep)
for r in freeze['files']+freeze['requiredExternalFiles']:check(r)
original=read(ROOT/entry['originalExtraction']['path']);current=read(ROOT/entry['wholeCurrentExtractionCandidate']['path']);mapping=read(ROOT/entry['wholeCurrentMappingCandidate']['path'])
check(entry['originalExtraction']);check(entry['wholeCurrentExtractionCandidate']);check(entry['wholeCurrentMappingCandidate'])
source0={g['id']:g for g in original['sourceGoals']};source1={g['id']:g for g in current['sourceGoals']};assert len(source0)==len(source1)==222 and source0.keys()==source1.keys()
ids=entry['selectedEightNewPrimarySourceIds'];assert len(ids)==8
for sid in source0:
 c={k:v for k,v in source1[sid].items() if k not in ['sourceDocumentKey','actualPrimaryLocator']}
 o={k:v for k,v in source0[sid].items() if k not in ['sourceDocumentKey','actualPrimaryLocator']};assert c==o
 if sid not in ids:assert source1[sid]['sourceDocumentKey']=='LEHRPLANPLUS_BIOLOGIE_GYMNASIUM' and 'actualPrimaryLocator' not in source1[sid]
assert current['sourceDocument']==original['sourceDocument']
legacy=next(d for d in current['sourceDocuments'] if d['key']=='LEHRPLANPLUS_BIOLOGIE_GYMNASIUM');assert legacy==original['sourceDocument']
provenance=current['localArtifactProvenance'];assert provenance['legacyLocalArtifactIsOfficialPrimary'] is False
assert provenance['currentWholeSourceClearanceClaimed'] is False and provenance['other214PrimaryReviewRestarted'] is False
check(provenance['legacyLocalArtifact']['actualBytes']);json.loads((ROOT/provenance['legacyLocalArtifact']['actualBytes']['path']).read_text())
assert provenance['legacyLocalArtifact']['originalMetadata']==legacy
prior=read(B/'source-review.json')['findings'][0]['wholeCurrentWitness'];check(prior['mapping']);original_map=read(ROOT/prior['mapping']['path'])
assert len(original_map['mappings'])==len(mapping['mappings'])==228
diff=[(a,b) for a,b in zip(original_map['mappings'],mapping['mappings']) if a!=b];assert len(diff)==1
old,new=diff[0];assert old['legacyGoalId']=='ad855269-70c3-526c-951b-cc2d54106f36'
assert old['matchType']=='exact' and new['matchType']=='partial';assert {k:v for k,v in old.items() if k!='matchType'}=={k:v for k,v in new.items() if k!='matchType'}
assert len(original_map['decisions'])==len(mapping['decisions'])==222
decision_diff=[(a,b) for a,b in zip(original_map['decisions'],mapping['decisions']) if a!=b];assert len(decision_diff)==1 and decision_diff[0][0]['sourceGoalId']==old['legacyGoalId']

judgments={
'ad855269':'KEEP partial: The official second B8.2 competence combines optical apparatus, retinal cells and brain with deriving causes/corrections of refractive errors. The canonical chiasm/LGN route omits that correction component and adds detail. The new partial mapping and specific reason accurately describe asymmetric overlap, with no whole-duty or course approval.',
'92e3879a':'KEEP partial: The third B8.2 competence derives prevention of hearing damage from hearing knowledge. The authored route/transduction materials supply hearing knowledge but do not independently establish preventive-action competence. A bounded applied context is supported; full coverage is not.',
'8b2bc52e':'KEEP existing exact semantic relation: The fifth B8.2 competence explains hormone-mediated glucose regulation and factors linking habits/disposition with diabetes. Both elements appear in the actual canonical DE/EN description and the regulation/risk cases. Fictitious risk comparison and new compensation variation remain model evidence, not medical advice or full course clearance.',
'65529a29':'KEEP partial only: The sixth B8.2 competence explains physical stress through nervous/endocrine interaction and uses knowledge for personal coping. The distributed-process goal provides only broad neural processing context; its object/memory cases do not evidence complete endocrine stress or practical coping. No whole-source approval from this weak partial partner.',
'ed0a0007':'KEEP existing exact semantic relation: First B8.4 competence observes/compares behavior using dummy experiments and describes interaction of internal state with triggering stimuli. Canonical description and both actual controlled dummy cases cover those linked operators, with prospective learner actions and bounded model data.',
'dd94b698':'KEEP existing exact semantic relation: Second B8.4 competence judges predominant inherited/acquired contributions from behavioral data. Canonical description retains that judgment; origin and training cases require qualified comparisons, not a deterministic genetic/environment dichotomy.',
'f2c5e33a':'KEEP semantic experimental-design relation with explicit optionality limit: Third B8.4 competence plans conditioning experiments to investigate environmental influence; the human/other-organism comparison is marked ggf. on the actual page. Canonical/P material makes fair comparison an authored application. This source supports the design competence and available comparative extension; it does not make that optional comparison compulsory for every Bavarian learner or prove universal course scope.',
'7a28147c':'KEEP partial: Actual B9 5.4 second competence compares insect and vertebrate sense organs/performance. The legacy flat B9.5.8 alias is correctly distinguished from official section numbering. Current selected human eye/ear explanations provide partial structure/function context but no completed insect-versus-vertebrate comparison.'}
soups={};primary_bindings=[]
own_fetch=read(B/'primary/retrieval-receipts.json')
for f in entry['actualPrimaryFetches']:
 check(f['actualRawPrimary']);p=ROOT/f['actualRawPrimary']['path'];soup=BeautifulSoup(p.read_bytes(),'html.parser');assert soup.find('html') and soup.find('body');soups[f['year']]=soup
 independent=next(r for r in own_fetch if f"/{f['year']}/biologie" in r['url']);check({k:independent[k] for k in ['path','sha256','bytes']})
 assert p.read_bytes()==(ROOT/independent['path']).read_bytes()
 primary_bindings.append({'authorActualRaw':f,'independentEarlierRetrieval':independent,'actualBytesIdentical':True,'classification':'Official provider HTML. Unchanged derived JSON is a separate historical structured artifact.'})
rows=[]
for sid in ids:
 g=source1[sid];loc=g['actualPrimaryLocator'];year=loc['year'];soup=soups[year]
 if year==8:
  secid='216248' if g['topicCode']=='B8.2' else '216235';ordinal=g['bulletIndex']
 else:secid='217831';ordinal=2
 header=soup.find(id=secid);assert header
 section=header.find_parent('section');competences=next(d for d in section.select('div.thema_absch') if d.find(['h3','h4']) and d.find(['h3','h4']).get_text(' ',strip=True)=='Kompetenzerwartungen')
 li=copy.copy(competences.find('ul').find_all('li',recursive=False)[ordinal-1])
 for dialog in li.find_all('dialog'):dialog.decompose()
 actual=' '.join(li.get_text(' ',strip=True).split());assert actual==g['sourceText'],(sid,actual)
 docs=[d for d in current['sourceDocuments'] if d['key']==g['sourceDocumentKey']];assert len(docs)==1 and docs[0]['official'] is True and docs[0]['url']==loc['officialUrl']
 assert ref(ROOT/docs[0]['path'])==entry['actualPrimaryFetches'][0 if year==8 else 1]['actualRawPrimary']
 canonical_id=next(r['canonicalGoalId'] for r in mapping['mappings'] if r['legacyGoalId']==sid)
 canonical=next(r for r in read(B/'whole-ten-independent-DPAMV-review.json')['rows'] if r['goalId']==canonical_id)
 rows.append({'sourceGoalId':sid,'wholeCurrentSourceGoal':g,'wholeMappingRows':[r for r in mapping['mappings'] if r['legacyGoalId']==sid],'wholeCurrentDecision':[r for r in mapping['decisions'] if r['sourceGoalId']==sid],
 'actualPrimaryRead':{'year':year,'sectionHtmlId':secid,'actualHeading':header.get_text(' ',strip=True),'competenceOrdinalWithinActualSection':ordinal,'fullActualOperatorTextMatchesCurrentSourceText':True,'locator':loc},
 'currentCanonicalGoal':canonical['wholeCurrentGoal'],'currentCanonicalPBinding':canonical['P']['currentProfileFingerprint'],
 'independentJudgment':judgments[sid[:8]],'reviewAuthority':'ai_candidate','humanApproval':False,'wholeCourseClearance':False})
primary_paths='\n'.join(f['actualRawPrimary']['path'] for f in entry['actualPrimaryFetches'])+'\n'
ignored=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,text=True,input=primary_paths,capture_output=True)
verbose=subprocess.run(['git','check-ignore','-v','--stdin'],cwd=ROOT,text=True,input=primary_paths,capture_output=True)
assert ignored.returncode==1 and ignored.stdout==''
assert verbose.returncode==0 and '!curricula/**/quality/**/bundle/book.html' in verbose.stdout
assert all((ROOT/f['actualRawPrimary']['path']).is_file() and not (ROOT/f['actualRawPrimary']['path']).is_symlink() for f in entry['actualPrimaryFetches'])
result={'schemaVersion':1,'reviewId':B.name+'.source-v5','reviewerAgent':'/root/biology_neuro_ten_blind_b','provider':'OpenAI','model':'Codex GPT-6 agent; exact runtime revision not exposed',
 'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentV3FIRST':ref(B/'FIRST.current-v3.independent-b.seal.json'),'currentV3FinalFreeze':ref(B/'FINAL.current-v3-independent-b.freeze.json'),
 'currentV3FIRSTAndVerdictsPreserved':True,'currentPeerVerdictsUsed':False,'selectedSourceAuthorV5Entry':ref(entryp),'selectedSourceAuthorV5Freeze':ref(freezep),
 'selectedWholeExtraction':entry['wholeCurrentExtractionCandidate'],'selectedWholeMapping':entry['wholeCurrentMappingCandidate'],'actualPrimaryBindings':primary_bindings,'eightIndependentOperatorJudgments':rows,
 'exactPreservationChecks':{'all222RawSourceTextsOccurrencesAndOriginalSemanticFieldsExact':True,'other214OnlyExplicitHistoricalDocumentKeyAdded':True,'originalNormativeOfficialUrlDescriptorExact':True,'228MappingRows':228,'onlyOneExactToPartial':True,'other227MappingRowsExact':True,'222DecisionRows':222,'onlyOneDecisionChanged':True,'other221DecisionsExact':True},
 'substantiveDisposition':'KEEP targeted real-primary/legacy-derived distinction and Sehbahn partial correction as AI candidate; no blanket primary clearance or new substantive review of remaining214.',
 'technicalAdoptionDisposition':'PENDING this reviewer binding the normal SourceAtlas/current-native technical successor. Both V5 real bundle/book.html external files are regular and not ignored; their allowed bundle exception requires no rename.',
 'actualTargetedCheckTerminalExitCode':0,'primaryPortabilityCheck':{'argv':['git','check-ignore','--stdin'],'terminalExitCode':ignored.returncode,'stdout':ignored.stdout,'interpretation':'Exit1/no matches confirms both real primary HTML files are not ignored. Verbose matching negation explicitly allows quality/**/bundle/book.html.','verboseDiagnostic':{'argv':['git','check-ignore','-v','--stdin'],'terminalExitCode':verbose.returncode,'stdout':verbose.stdout},'bothFilesRegular':True},
 'retractedUnsealedPortabilityHypothesis':{'firstCheckerTerminalExitCode':1,'reason':'Initial follow-up checker asserted that verbose check-ignore output must name an ignore. It instead matched the explicit allowing negation for bundle/book.html. Root correctly identified this; own nonverbose execution independently verifies Exit1/no matches. Premature message claiming these V5 primary files were ignored is withdrawn; original V3 FIRST remains unchanged and correct for its own non-bundle filenames.','sourceCandidateMutation':False,'historicalDiagnosisPreserved':True},
 'normalSourceAtlasOrNativeSuccessorExecutedByThisReview':False,'currentD10OrNativeAutomaticallyAdopted':False,'needs_human_review':True,'reviewAuthority':'ai_candidate','humanApproval':False,'humanTrial':False,'approved':0,'activeGain':0}
OWN.mkdir(parents=True,exist_ok=True);out=OWN/'SOURCE-v5.eight-real-operators-and-partial.independent-b.json';out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
seal={'schemaVersion':1,'sealKind':'targeted-independent-source-v5-after-v3-FIRST','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':[ref(Path(__file__)),ref(out)],'selectedInputEntry':ref(entryp),'selectedInputFreeze':ref(freezep),'terminalExitCode':0,'status':'ai_candidate; targeted content KEEP, normal technical/native adoption pending','humanApproval':False,'humanTrial':False,'approved':0,'activeGain':0}
out=OWN/'FIRST.SOURCE-v5-targeted-independent-b.seal.json';out.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'terminalExitCode':0,'realOperatorsChecked':8,'onePartialCorrected':True,'other227MappingsExact':True,'all222RawSourceFieldsExact':True,'SOURCE_content':'KEEP targeted candidate','technicalAdoption':'PENDING','seal':ref(out)}))
