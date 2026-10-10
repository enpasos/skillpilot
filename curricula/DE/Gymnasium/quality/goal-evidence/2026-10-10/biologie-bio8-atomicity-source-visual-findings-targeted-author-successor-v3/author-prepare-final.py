# SPDX-License-Identifier: Apache-2.0
import copy, datetime, hashlib, json, pathlib, shutil, subprocess

R=pathlib.Path('/home/enpasos/projects/skillpilot')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
P=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
N=B/'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1'
A=B/'biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1'
OLD=B.parent/'2026-10-09/biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
C=R/'tmp/m7-bio8-findings-v3-author-isolated-capsule'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
BEH='7d2da9ab-aed0-562b-a99a-840825fca009'
RSTR='73a3419c-09a9-5415-a3c6-d56a3cdf5a29';EXPR='374e6de5-0747-57cb-99e3-e50ccb371124';CULT='80235254-ca58-5ba0-9319-b842350d6eb2';H='430b2b73-641a-5122-bb6d-162b0d1eaf2d';Y='4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf';S='523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0';D='d11b3b18-deec-5d1a-bff6-512cddf595a2'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 data=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'bytes':len(data)}
def put(p,o):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;f.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
def cp(src,dst):
 f=R/P/dst;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;shutil.copyfile(R/src,f);return ref(P/dst)

land=read(P/'candidate/whole482-substantive-three-successors.inactive.json')
bg=read(OLD/'candidate/one-bounded-behaviour-companion.goal.json');oldbg=copy.deepcopy(bg)
bg['resourceLinks']=[{'type':'goal-visualization','resourceType':'image','role':'primary','skillpilotId':BEH,'title':'Visualisierung: '+bg['title'],'url':f'/assets/goal-visualizations/biologie/{BEH}/{BEH}.png','provider':'OpenAI / Codex built-in image_gen','description':'Abstammungswissen verbindet einen unmittelbaren Auslöser mit einer begrenzten Hypothese zur früheren Funktion; plausible Funktion benötigt Belege.','altText':'Drei Comicfelder zeigen einen plötzlichen Laut als Auslöser, eine rasche menschliche Rückweichreaktion und eine mögliche Schutzfunktion bei körperlicher Gefahr. Gemeinsame Abstammung und ein Fragezeichen kennzeichnen eine prüfbare Evolutionshypothese, keine bewiesene historische Ursache.','lang':'de','license':'CC-BY-4.0','reviewStatus':'pilot'}]
land['goals'].append(bg)
next(g for g in land['goals'] if g['id']=='dc39fe71-10c0-591d-9491-44b53e38f5e1')['contains'].append(BEH)
put('candidate/whole483-substantive-four-successors.inactive.json',land)
put('candidate/individual/'+BEH+'.whole-goal.json',bg)
bio9=read(B/'biologie-remaining-thirty-three-neutral-inputs-technical-20261010-v1/environment-sustainability-social-discourse-nine/whole-current-DE-EN-goals.neutral.json')
put('checks/behavior-companion-existing-ID-and-no-duplicate.author.json',{'existingStableCandidate':ref(OLD/'candidate/one-bounded-behaviour-companion.goal.json'),'existingGoalTextAndRequiresExact':all(bg[k]==oldbg[k] for k in ['id','title','titleEn','description','descriptionEn','requires']),'Bio9WholeGoalsRead':ref(B/'biologie-remaining-thirty-three-neutral-inputs-technical-20261010-v1/environment-sustainability-social-discourse-nine/whole-current-DE-EN-goals.neutral.json'),'Bio9GoalIds':bio9['goalIds'],'distinctionDe':'Abstammungswissen begründet eine kausale Funktionshypothese zu ausgewähltem menschlichem Verhalten. Die Bio9-Ziele beurteilen Nachhaltigkeit, Schutz, Ethik oder gesellschaftlichen Diskurs; keines führt diese Abstammung→Verhaltens-Erklärung aus. Das Sek-II/LK-Primatenziel89b ist kein RP-Sek-I-Ersatz.','actualPrimaryRPPrintedPage':46,'actualPrimaryRPPhysicalPage':48,'sourceTextRead':'wenden Wissen über die Abstammung des Menschen an, um ausgewählte Verhaltensweisen des Menschen, z. B. Stressreaktion, zu erklären','newWholeGoals':483,'newAtomicCount':396,'A-M-P-SOURCE':'PENDING_INDEPENDENT','strictGain':0})
oldmat=read(OLD/'material/RP-ancestry-behaviour-two-full-bilingual-material-cases.author-candidate.json')
cs=[]
for idx,old in enumerate(oldmat['cases']):
 c={'caseId':'ancestry-behavior-danger' if idx==0 else 'ancestry-behavior-current-mismatch','materialDe':'Materialkarte: Menschen stammen von früheren Populationen ab und teilen grundlegende Reaktionsmechanismen mit anderen Säugetieren. Rasche Energiebereitstellung und Bewegung können bei unmittelbarer körperlicher Gefahr Flucht erleichtern. Das ist eine vorgegebene Funktionserklärung, keine nachgewiesene historische Selektionsgeschichte.','materialEn':'Information card: humans descend from earlier populations and share basic response mechanisms with other mammals. Rapid energy supply and movement can aid escape from immediate physical danger. This is a supplied functional account instead of a demonstrated historical selection history.','taskDe':old['taskDe'].replace('Die Informationskarte aus dem ersten Fall bleibt gültig.','Die hier vorgegebene Materialkarte gilt.'),'taskEn':old['taskEn'].replace('The first case information card remains valid.','The supplied information card applies here.'),'workedResponseDe':old['expectedDe'],'workedResponseEn':old['expectedEn'],'materialStatus':'constructed_synthetic_didactic_material','actualExperimentPerformed':False,'actualLearnerPerformance':False}
 if idx==0:c.update(freshTransferTaskDe='Eine Person erkennt den gleichen Knall sicher als harmlose Aufnahme; laut Zusatzkarte fällt die Reaktion nun geringer aus. Welche Grenze für eine starre erblich festgelegte Reaktion folgt daraus?',freshTransferTaskEn='A person recognizes the same bang as a harmless recording; an added card shows a weaker response. What limit follows for a rigidly inherited response?',workedFreshTransferDe='Ein über Abstammung erhaltener Mechanismus kann durch die Bewertung des Auslösers verändert aktiviert werden. Er muss nicht auf jedes gleiche Geräusch gleich stark reagieren. Die Änderung durch Information belegt keine neue genetische Anpassung.',workedFreshTransferEn='A mechanism retained through ancestry can be activated differently depending on appraisal of the trigger. It need not respond equally strongly to every identical sound. Information-based change does not establish a new genetic adaptation.')
 else:c.update(freshTransferTaskDe='Vergleichsdaten zeigen einen ähnlichen Grundmechanismus bei mehreren Säugetieren, aber verschiedene Reaktionsstärken. Welche Abstammungsaussage ist gestützt, welche historische Ursache bleibt offen?',freshTransferTaskEn='Comparative data show a similar basic mechanism in several mammals but different response strengths. What ancestry statement is supported, and which historical cause remains open?',workedFreshTransferDe='Der ähnliche Grundmechanismus ist mit gemeinsamer Abstammung vereinbar. Unterschiede der Stärke widersprechen dem nicht. Die Daten allein bestimmen weder die genaue historische Selektion noch den Nutzen in jeder heutigen Situation.',workedFreshTransferEn='The shared basic mechanism is compatible with common ancestry, and differences in strength do not contradict that. These data alone establish neither precise historical selection nor usefulness in every current situation.')
 c['rubric']=[{'expectationId':'ancestry-functional-hypothesis','criterionDe':'Verknüpft Abstammung und gegebenen gemeinsamen Mechanismus mit einer begrenzten Funktionserklärung des ausgewählten Verhaltens, ohne aus plausibler Funktion eine bewiesene historische Anpassung oder heutigen Nutzen abzuleiten.','criterionEn':'Connects ancestry and a supplied shared mechanism to a bounded functional explanation of the selected behavior without inferring proven historical adaptation or current usefulness from plausible function.','rubricScope':'count_only_aspects_actually_demonstrated_in_this_case','actualEvidenceLocations':['workedResponseDe','workedResponseEn','workedFreshTransferDe','workedFreshTransferEn'],'rubricNoteDe':'Eine hinreichende eigenständige mehrschrittige Leistung kann genügen; keine zusätzliche Fallquote.','rubricNoteEn':'Sufficient independent multi-step performance can suffice without another-case quota.'}];cs.append(c)
put('materials/'+BEH+'.whole-two-cases.json',cs)
ep={'id':'ancestry-functional-hypothesis','essentialUnderstandingDe':'Gemeinsame Abstammung kann eine evolutionsbiologische Funktionshypothese zu aktuellem Verhalten begründen; unmittelbarer Auslöser und mögliche historische Funktion erklären denselben Fall auf verschiedenen Ebenen.','essentialUnderstandingEn':'Common ancestry can ground an evolutionary functional hypothesis about present behavior; immediate trigger and possible historical function explain the same case at different levels.','observablePerformanceDe':cs[0]['rubric'][0]['criterionDe'],'observablePerformanceEn':cs[0]['rubric'][0]['criterionEn']}
profile={'archetype':'modeling','expectations':[ep],'coverageExpectations':{'requiredExpectationIds':[ep['id']],'alternativeExpectationGroups':[],'minimumIndependentDemonstrations':1,'freshVariationRequired':True,'independentTransferRequired':True},'variationAxes':[{'id':'changed-trigger-and-evidence','textDe':'Körperliche Gefahr gegenüber heutiger Prüfungssituation; zusätzlich bewerteter Auslöser oder neue Vergleichsdaten.','textEn':'Physical danger versus a current examination; additionally appraised trigger or new comparative data.'}],'applicationCaseBriefs':[{'id':c['caseId'],'taskDemandDe':c['materialDe']+'\n\n'+c['taskDe']+'\n\nFrische Variation: '+c['freshTransferTaskDe'],'taskDemandEn':c['materialEn']+'\n\n'+c['taskEn']+'\n\nFresh variation: '+c['freshTransferTaskEn'],'expectedPerformanceDe':c['workedResponseDe']+'\n\nTransfer: '+c['workedFreshTransferDe'],'expectedPerformanceEn':c['workedResponseEn']+'\n\nTransfer: '+c['workedFreshTransferEn'],'understandingFocusDe':ep['essentialUnderstandingDe'],'understandingFocusEn':ep['essentialUnderstandingEn']} for c in cs]}
put('profiles/'+BEH+'.whole-profile.json',profile)
put('candidate/individual/'+BEH+'.A-M.author-rationale.json',{'goalId':BEH,'role':'author_not_independent_reviewer','atomicityRationaleDe':'Ein materialgestütztes kausales Erklärungsprodukt verbindet Abstammung, aktuelle Auslösung und eine prüfbare Funktionshypothese. Kein unabhängiger Neurobiologie-/Hormonroutineblock und keine zweite ethische Bewertung.','memoryRationaleDe':'Das begrenzte funktionale Erklären mit frischer Variation trägt die Kompetenz; ein reines Fakten-Kartendeck genügt nicht.','A':'PENDING_TWO_GENUINE_INDEPENDENT','M':'PENDING_TWO_GENUINE_INDEPENDENT','approval':False})

# Earlier authored profiles contained an invalid archetype label. Retain that stage,
# and add valid successors, without altering any scientific performance text.
final_profiles={}
for i in [RSTR,EXPR,CULT,H]:
 pr=read(P/('profiles/'+i+'.whole-profile.json'));pr['archetype']='procedure' if i==RSTR else 'modeling' if i==H else 'concept'
 pp='profiles/'+i+'.normal-schema-successor.whole-profile.json';put(pp,pr);final_profiles[i]=str(P/pp)
for i in [BEH,Y,'a3f483ce-126e-595c-999c-aa4d95106221','528a3cd3-4a4d-550d-939a-8dc8656446e4','27b22c33-908c-5fa8-9d9f-a08aff8da143','9b40dae5-6d89-5714-ac96-373e72a7045e']:final_profiles[i]=str(P/('profiles/'+i+'.whole-profile.json'))
put('inputs/ten-final-profile-paths.json',final_profiles)

at=read(P/'sources/current-targeted-atlas.normal.config.json')
rp=next(p for p in at['mappingPaths'] if '11-whole-mapping' in p);mp=read(pathlib.Path(rp));sid='rp-bio-seki-rp-bio-seki-2014-tf12-biologische-anthropologie-002-b40bf47b'
for m in mp['mappings']:
 if m['legacyGoalId']==sid and m['canonicalGoalId']==H:m.update(canonicalGoalId=BEH,matchType='partial');m.pop('authorSourceRole',None)
dec=next(x for x in mp['decisions'] if x['sourceGoalId']==sid);dec['canonicalGoalIds']=[BEH];dec['rationale']='Der neue Sek-I-Companion mit bereits stabilem KandidatenID7d2 führt den literal geforderten Abstammung→Verhaltens-Operator am amtlich genannten Stressbeispiel aus. Zwei vollständige Fälle, Lösungen, Rubriken und frische Variationen sind authored, keine Lernendenleistung. Fossilwissen430 ist keine direkte Verhaltensleistung; Sek-II/LK-Primate89b ist kein Ersatz. Aktuelle SOURCE/P/A/M/native-Prüfungen ausstehend; keine Vollfreigabe.'
dec['authorQualification'].update(sourceRole='assessable-behavior-product',wholeDutyComplete=False,sourceCoverageClaim=False,missingAssessablePartnerCandidate=BEH,authorProductNowPresent=True);np=P/'sources/RP-whole-assessable-behavior-fourth-successor.json';put(np.relative_to(P),mp);at['mappingPaths']=[str(np) if p==rp else p for p in at['mappingPaths']]
at.update(landscapePath=str(P/'candidate/whole483-substantive-four-successors.inactive.json'),semanticKindLedgerPath=str(P/'candidate/kinds396.author-classification-only.json'),expectedCurricularAtomicGoalCount=396)

# Rebind declared primary downloads to regular portable copies. Cached spellings
# on old source metadata are only alias metadata, never required ignored files.
prim=read(N/'sources/all-current-actual-primary-portable-copies.json')['records'];lookup={x['originalCachedSpellingDiagnosticOnly']:x for x in prim}
primary_bindings=[]
for row in prim:
 src=pathlib.Path(row['actualPortableExactByteCopy']['path']);dst=P/'primary'/row['actualPortableExactByteCopy']['sha256'][7:19]/'bundle'/src.name
 if not (R/dst).exists():cp(src,dst.relative_to(P))
 primary_bindings.append({**row,'actualPortableExactByteCopy':ref(dst)})
plook={x['originalCachedSpellingDiagnosticOnly']:x for x in primary_bindings}
for snap in at['sourceDocumentSnapshots']:
 source=plook.get(snap['path'])
 if source:snap['path']=source['actualPortableExactByteCopy']['path']
put('sources/final-four-actual-primary-atlas.normal.config.json',at)
put('sources/all-actual-portable-primary-bindings.json',{'records':primary_bindings,'sourceApproval':False,'cachedSnapshotSpellingsDiagnosticOnly':True})

# All affected image bytes remain original, apart from the evidenced yeast edit
# and the four genuinely new atomic-goal images.
bindings=[]
selected={Y:P/'images'/Y/'selected.candidate.png',RSTR:P/'images'/RSTR/'selected.candidate.png',EXPR:P/'images'/EXPR/'selected.candidate.png',CULT:P/'images'/CULT/'selected.candidate.png',BEH:P/'images'/BEH/'selected.candidate.png'}
ne=read(N/'neutral-current353-Bio8-native11.entry.json')
for row in ne['actualCurrent8RasterInputs']:
 if row['goalId']!=Y:selected[row['goalId']]=pathlib.Path(row['actualCurrentPNG']['path'])
for i,png in selected.items():bindings.append({'goalId':i,'PNG':ref(png),'decision':'NEW_AUTHOR_CANDIDATE_PENDING' if i in [Y,RSTR,EXPR,CULT,BEH] else 'KEEP_EXACT_ORIGINAL','aiApproved':False,'humanApproval':False})
put('images/current-KEEP-and-new-candidate-bindings.author.json',{'records':bindings,'unchangedOriginalImages':7,'evidencedReplacementGoalIds':[Y],'newAtomicImages':[RSTR,EXPR,CULT,BEH],'independentV':'PENDING'})

# Prepare a private, lean execution capsule by copying bytes, never hardlinking.
C.mkdir(exist_ok=False)
for directory in ['app/scripts','app/src','contracts']:
 shutil.copytree(R/directory,C/directory)
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
def capsule_copy(p):
 src=R/p;dst=C/p
 if dst.exists():return
 assert src.is_file(),p
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
for f in (R/'docs').glob('*.schema.json'):capsule_copy(f.relative_to(R))
capsule_copy(pathlib.Path('app/package.json'))
capsule_copy(pathlib.Path('app/tsconfig.json'))
shutil.copytree(R/P,C/P)
cfg=read(N/'native/whole394-after.normal.config.json')
for p in cfg['evidenceReviewPaths']+[cfg['compositionViewPath'],at['durationModelPolicyPath']]:capsule_copy(pathlib.Path(p))
for path in at['mappingPaths']:
 capsule_copy(pathlib.Path(path));ex=read(pathlib.Path(path));capsule_copy(pathlib.Path(ex['sourceExtractionPath']))
for snap in at['sourceDocumentSnapshots']:capsule_copy(pathlib.Path(snap['path']))
qa=read(N/'candidate/QA394-eight-pending.inactive.json')
qa['records']=[x for x in qa['records'] if x['goalId'] not in [S,D]]
goalmap={g['id']:g for g in land['goals']}
for i in [RSTR,EXPR,CULT,BEH]:
 row=copy.deepcopy(next(x for x in qa['records'] if x['goalId']==Y));g=goalmap[i];url=g['resourceLinks'][0]['url'];row.update(goalId=i,title=g['title'],description=g['description'],imageUrl=url,publicAssetPath='app/public'+url,canonicalAssetPath=str(selected[i]),assetSha256=ref(selected[i])['sha256'],aiApproved='no',aiApprovedAssetSha256=None);qa['records'].append(row)
for row in qa['records']:
 i=row['goalId']
 if i in selected:
  row.update(title=goalmap[i]['title'],description=goalmap[i]['description'],assetSha256=ref(selected[i])['sha256'],canonicalAssetPath=str(selected[i]),aiApproved='no',aiApprovedAssetSha256=None,aiNotes='Author candidate; actual independent current asset review pending.')
 else:capsule_copy(pathlib.Path(row['publicAssetPath']))
 if i in selected:
  dst=C/row['publicAssetPath'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/selected[i],dst)
put('candidate/QA396.current-science-candidate-pending.json',qa)
# Cluster rasters are kept for historical and overview use, outside atomic V.
for i in [S,D]:
 dst=C/('app/public'+goalmap[i]['resourceLinks'][0]['url']);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/selected[i],dst)

pids=list(final_profiles)
pc=read(N/'positive/eight-current-raster.P.pending.config.json');pc.update(reviewId='biologie-bio8-substantive-four-author-20261010-v3',landscapePath=str(P/'candidate/whole483-substantive-four-successors.inactive.json'),semanticKindLedgerPath=str(P/'candidate/kinds396.author-classification-only.json'),reviewPath=str(P/'positive/ten-current-author.pending.review.jsonl'));pc['scope']={'label':'Substantive four-new atom successor and retained whole Bio8 P products; author only, independent reviews pending','goalIds':pids}
put('positive/ten-current-author.pending.config.json',pc)
capsule_copy(pathlib.Path(pc['reviewCriteriaPath']))
put('positive/ten-whole-author-candidates.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':pc['reviewId'],'reviewedAt':NOW,'reviewer':'OpenAI / Codex GPT-6 AUTHOR; exact runtime revision not exposed','goals':[{'goalId':i,'reason':'Full independently assessable author product and two complete bilingual material/task/response/rubric/fresh-transfer cases; E1/G1 pending candidate, no scientific independent approval, learner performance or laboratory execution. Exact retained medicineV2 and other whole P science distinguished from new author products.','evidenceLevel':'E1','maximumClaimScope':'G1','profile':read(pathlib.Path(final_profiles[i]))} for i in pids]})
cfg.update(landscapePath=pc['landscapePath'],semanticKindLedgerPath=pc['semanticKindLedgerPath'],goalVisualizationQaPath=str(P/'candidate/QA396.current-science-candidate-pending.json'),outputPath=str(P/'native/whole396-current.normal-model.actual.json'),evidenceReviewPaths=cfg['evidenceReviewPaths'][:-1]+[pc['reviewPath']])
put('native/whole396-current.normal.config.json',cfg)
for f in (R/P).rglob('*'):
 if f.is_file():
  dst=C/f.relative_to(R);dst.parent.mkdir(parents=True,exist_ok=True)
  if not dst.exists():shutil.copyfile(f,dst)
put('checks/lean-private-execution-capsule.prepared.json',{'diagnosticCwd':str(C),'copyMode':'regular copied files; no hardlinks; node_modules symlink is execution environment only','curriculumArtifactsHaveSymlinks':False,'wholeGoals':483,'atomicCount':396,'PProfiles':len(pids),'fullCases':20,'noIndependentApproval':True,'activeWrites':0})
print(json.dumps({'capsule':str(C),'whole483':483,'atomic396':396,'P10':len(pids),'privateCopiedCodeAndInputs':True,'strictGain':0}))
