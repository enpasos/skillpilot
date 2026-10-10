# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,shutil,datetime,copy,os
R=pathlib.Path('/home/enpasos/projects/skillpilot'); B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
A=B/'biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1'
N=B/'biologie-biotechnologie-evolution-eight-neutral-inputs-technical-20261010-v1'
I=B/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1'
S=B/'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3'
P=B/'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1'
T=R/'tmp/m7-bio8-biotech-native-technical'; C=T/'isolated-normal-capsule'
CAN=pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');KIN=pathlib.Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json');QA=pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
def read(p):return json.loads((R/p).read_text())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):assert ref(pathlib.Path(x['path']))=={k:x[k] for k in ['path','sha256','bytes']},x['path']
def put(p,x):f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
def cp(src,dst):f=R/P/dst;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;shutil.copyfile(R/src,f);return ref(P/dst)
assert not (R/P).exists();assert not C.exists()
assert ref(A/'author-eight.final.entry.json')['sha256']=='sha256:9b41d3820189f8af682b9fa10a9ab95e6690c8ce42084f7df63234bd2c49686f'
af=read(A/'author-eight.final.freeze.json');assert len(af['files'])==144
for x in af['files']:verify(x)
a=read(A/'author-eight.final.entry.json');ids=a['goalIds'];assert len(ids)==8
# Independent temporary repository. Hard-linked unchanged dependencies are read-only;
# all candidate mutable files and images below are distinct regular copies.
C.mkdir(parents=True)
for root in ['curricula','contracts','docs','scripts']:
 shutil.copytree(R/root,C/root,copy_function=os.link,symlinks=True)
(C/'app').mkdir()
for root in ['scripts','src','public']:
 shutil.copytree(R/'app'/root,C/'app'/root,copy_function=os.link,symlinks=True)
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
for f in (R/'app').glob('*.json'):shutil.copyfile(f,C/'app'/f.name)
for f in ['AGENTS.md','package.json']:
 if (R/f).exists():shutil.copyfile(R/f,C/f)
for p in [CAN,KIN,QA,pathlib.Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')]:
 f=C/p;f.unlink();shutil.copyfile(R/p,f)
(T/'capsule.actual.path.txt').write_text(str(C)+'\n')
before=read(I/'candidate/current479-only-ten-resourceLinks.exact.json');author=read(pathlib.Path(a['wholeInactiveCandidate']['path']));after=copy.deepcopy(before)
bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in author['goals']};fg={g['id']:g for g in after['goals']};assert len(bg)==479
neutral=[];deltas=[]
for i in ids:
 fg[i].clear();fg[i].update(copy.deepcopy(ag[i]));assert fg[i]['requires']==bg[i]['requires'];assert fg[i]['contains']==bg[i]['contains']
 fields={k:{'before':bg[i].get(k),'after':fg[i].get(k)} for k in sorted(set(bg[i])|set(fg[i])) if bg[i].get(k)!=fg[i].get(k)}
 deltas.append({'goalId':i,'changedFields':fields,'newSemanticReviewRequired':any(k!='resourceLinks' for k in fields),'independentApproval':False})
 rr=next(x for x in a['goalInputs'] if x['goalId']==i)
 for x in [rr['selectedPNG'],rr['actualAuthorInspection360'],rr['actualAuthorInspection680']]:verify(x)
 links=fg[i]['resourceLinks'];link=next(x for x in links if x['type']=='goal-visualization' and x['role']=='primary');assert link['skillpilotId']==i
 dest=C/('app/public'+link['url']);dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():dest.unlink()
 shutil.copyfile(R/rr['selectedPNG']['path'],dest)
 neutral.append({'goalId':i,'actualCurrentPNG':rr['selectedPNG'],'actualProportionalViews':[rr['actualAuthorInspection360'],rr['actualAuthorInspection680']],'inactiveResourceLink':link,'futurePublicURL':link['url'],'wholeProfile':rr['wholeProfile'],'wholeTwoCases':rr['wholeTwoCases'],'authorImageDecisionHistoricalOnly':rr['imageDecision'],'independentApproval':False})
assert [g['id'] for g in before['goals'] if g!=fg[g['id']]]==[g['id'] for g in before['goals'] if g['id'] in ids]
cp(CAN,'inputs/active343-whole479.before.exact.json');put('inputs/intended353-whole479.before.exact.json',before);cp(KIN,'inputs/current394-kinds.before.exact.json');cp(QA,'inputs/active343-QA394.before.exact.json')
put('candidate/whole479-only-eight-author-deltas.inactive.json',after)
put('inputs/eight-current-raster-bindings.neutral.json',{'schemaVersion':1,'role':'Technical current raster inputs only; no independent approval','goalIds':ids,'records':neutral})
put('checks/whole479-eight-author-deltas-and471-retention.actual.json',{'schemaVersion':1,'authorFreezeOwnFilesVerified':144,'intended353WholeBase':ref(I/'candidate/current479-only-ten-resourceLinks.exact.json'),'active343Base':ref(CAN),'whole479':479,'other471WholeGoalsExact':True,'allRequiresContainsArraysExact':True,'deltas':deltas,'activeWrites':[],'independentApproval':False})
k=read(KIN);k['sourceLandscapePath']=str(P/'candidate/whole479-only-eight-author-deltas.inactive.json');put('candidate/kinds394.inactive.pending-technical.json',k)
q=read(QA)
for row in q['records']:
 if row['goalId'] not in ids:continue
 rr=next(x for x in neutral if x['goalId']==row['goalId']);row.update({'landscapePath':str(P/'candidate/whole479-only-eight-author-deltas.inactive.json'),'visualizationState':'available','missingReason':'','imageUrl':rr['futurePublicURL'],'publicAssetPath':'app/public'+rr['futurePublicURL'],'canonicalAssetPath':rr['actualCurrentPNG']['path'],'assetSha256':rr['actualCurrentPNG']['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'Technical candidate; independent D/P/A/M/V pending.','aiApproved':'no','aiReviewedAt':None,'aiReviewer':'','aiNotes':'Technical binding only, no new approval.','aiApprovedAssetSha256':None})
put('candidate/QA394-eight-pending.inactive.json',q)
cp(pathlib.Path(a['currentPositiveRecords']['path']),'positive/eight-before-current-native.author.exact.jsonl')
records=[json.loads(x) for x in (R/pathlib.Path(a['currentPositiveRecords']['path'])).read_text().splitlines() if x.strip()]
put('positive/eight-whole-science.author-candidates.exact.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':records[0]['reviewId'],'reviewedAt':records[0]['reviewedAt'],'reviewer':records[0]['reviewer'],'goals':[{k:r[k] for k in ['goalId','reason','evidenceLevel','maximumClaimScope','dissent','profile']} for r in records]})
criteria=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-review-criteria-v2.md')
assert (R/criteria).exists();cp(criteria,'inputs/positive-criteria.exact.md')
pc=read(B/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2/positive/ten-current-raster.P.pending.config.json');pc.update({'reviewId':records[0]['reviewId'],'landscapePath':str(P/'candidate/whole479-only-eight-author-deltas.inactive.json'),'semanticKindLedgerPath':str(P/'candidate/kinds394.inactive.pending-technical.json'),'reviewCriteriaPath':str(P/'inputs/positive-criteria.exact.md'),'reviewPath':str(P/'positive/eight-current-raster.P.pending.review.jsonl')});pc['scope']={'label':'Bio8 intended353 base, author whole material and current raster; independent reviews pending','goalIds':ids};put('positive/eight-current-raster.P.pending.config.json',pc)
cfg=read(I/'native/current394-final.normal-model.config.json');cfg.update({'landscapePath':str(P/'candidate/whole479-only-eight-author-deltas.inactive.json'),'semanticKindLedgerPath':str(P/'candidate/kinds394.inactive.pending-technical.json'),'goalVisualizationQaPath':str(P/'candidate/QA394-eight-pending.inactive.json'),'outputPath':str(P/'native/whole394-after.normal-model.actual.json'),'evidenceReviewPaths':cfg['evidenceReviewPaths']+[str(P/'positive/eight-current-raster.P.pending.review.jsonl')]});put('native/whole394-after.normal.config.json',cfg)
bc=copy.deepcopy(cfg);bc.update({'landscapePath':str(P/'inputs/intended353-whole479.before.exact.json'),'semanticKindLedgerPath':str(KIN),'goalVisualizationQaPath':str(QA),'outputPath':str(P/'native/whole394-before.normal-model.actual.json'),'evidenceReviewPaths':cfg['evidenceReviewPaths'][:-1]});put('native/whole394-before.normal.config.json',bc)
source=read(S/'sources/current-eight-BY-primary.normal-atlas.config.json');put('sources/intended353-before-atlas.normal.config.json',{**source,'landscapePath':str(P/'inputs/intended353-whole479.before.exact.json'),'semanticKindLedgerPath':str(KIN)})
# BY candidate is already additive over the ROOT eight-real-primary successor.
cp(A/'source-candidates/BY-whole222-five-additive-current-primary.source-extraction.candidate.json','sources/BY-whole222-ROOT8-plus-author5.exact.json')
bym=read(A/'source-candidates/BY-whole228-d11-additive-partial.review.candidate.json');bym['sourceExtractionPath']=str(P/'sources/BY-whole222-ROOT8-plus-author5.exact.json');put('sources/BY-whole228-ROOT-Seh-partial-plus-d11.inactive.json',bym)
# Merge only seven actual author HE source-goal/mapping/decision changes into current ROOT HE6;
# preserve ROOT's six reviewed neuro source corrections, shared aliases and all other rows.
hem_path=next(p for p in source['mappingPaths'] if 'HE-whole157-144-six-partial' in p);hem=read(pathlib.Path(hem_path));hebase=read(pathlib.Path(hem['sourceExtractionPath']));hex=copy.deepcopy(hebase);ham=read(A/'source-candidates/HE-whole144-seven-primary-partial-scope.review.candidate.json');haex=read(A/'source-candidates/HE-whole144-seven-current-primary-bounded-operationalization.source-extraction.candidate.json');proof=read(A/'source-candidates/whole-source-successor-exact-retention-and-scope-HOLD.author.json');changed={x['after']['id'] for x in proof['HESevenSourceChanges']};assert len(changed)==7
for j,g in enumerate(hex['sourceGoals']):
 if g['id'] in changed:hex['sourceGoals'][j]=copy.deepcopy(next(x for x in haex['sourceGoals'] if x['id']==g['id']))
merged=copy.deepcopy(hem)
for name,key in [('mappings','legacyGoalId'),('decisions','sourceGoalId')]:
 for j,row in enumerate(merged[name]):
  if row[key] in changed:
   matches=[x for x in ham[name] if x[key]==row[key] and (name!='mappings' or x['canonicalGoalId']==row['canonicalGoalId'])];assert len(matches)==1,(name,row);merged[name][j]=copy.deepcopy(matches[0])
cp(pathlib.Path(hem['sourceExtractionPath']),'sources/HE-whole144-ROOT-six.before.exact.json');cp(pathlib.Path(hem_path),'sources/HE-whole157-ROOT-six.before.exact.json');put('sources/HE-whole144-ROOT-six-plus-author-seven.inactive.json',hex);merged['sourceExtractionPath']=str(P/'sources/HE-whole144-ROOT-six-plus-author-seven.inactive.json');put('sources/HE-whole157-ROOT-six-plus-author-seven.inactive.json',merged)
for key in set(haex)-{'sourceGoals'}:
 if key not in hex:hex[key]=copy.deepcopy(haex[key])
# Other normal source metadata remains the ROOT base; author new object locators are on sourceGoals.
ac=copy.deepcopy(source);ac.update({'landscapePath':str(P/'candidate/whole479-only-eight-author-deltas.inactive.json'),'semanticKindLedgerPath':str(P/'candidate/kinds394.inactive.pending-technical.json')})
replacements={hem_path:str(P/'sources/HE-whole157-ROOT-six-plus-author-seven.inactive.json')}
for m in source['mappingPaths']:
 if 'BY-whole228-Sehbahn-partial' in m:replacements[m]=str(P/'sources/BY-whole228-ROOT-Seh-partial-plus-d11.inactive.json')
assert len(replacements)==2;ac['mappingPaths']=[replacements.get(x,x) for x in source['mappingPaths']]
byex=read(P/'sources/BY-whole222-ROOT8-plus-author5.exact.json')
for d in byex['sourceDocuments']:
 if 'CURRENT_B' not in d.get('key',''):continue
 if not any(x['path']==d['path'] for x in ac['sourceDocumentSnapshots']):ac['sourceDocumentSnapshots'].append({'path':d['path'],'url':d['url'],'sha256':ref(pathlib.Path(d['path']))['sha256']})
put('sources/current-ROOT-neuro-plus-Bio8-atlas.normal.config.json',ac)
ws=read(N/'eight-whole-current-direct-source-witnesses.neutral.json');cp(N/'eight-whole-current-direct-source-witnesses.neutral.json','sources/original32-direct-witnesses.history.exact.json');nw=copy.deepcopy(ws)
for row in nw['rows']:
 for w in row['wholeDirectSourceWitnesses']:
  jurisdiction=w['jurisdiction']
  if jurisdiction=='DE-HE' and '/upper-secondary/' in w['extraction']['path'] or jurisdiction=='DE-HE' and 'whole144' in w['extraction']['path']:
   mp=merged;ex=hex;mpath=P/'sources/HE-whole157-ROOT-six-plus-author-seven.inactive.json';epath=P/'sources/HE-whole144-ROOT-six-plus-author-seven.inactive.json'
  elif jurisdiction=='DE-BY':mp=bym;ex=byex;mpath=P/'sources/BY-whole228-ROOT-Seh-partial-plus-d11.inactive.json';epath=P/'sources/BY-whole222-ROOT8-plus-author5.exact.json'
  else:continue
  sid=w['wholeCurrentSourceGoal']['id'];sg=next(x for x in ex['sourceGoals'] if x['id']==sid);w.update({'wholeCurrentSourceGoal':sg,'wholeCurrentMappingRecord':next(x for x in mp['mappings'] if x['legacyGoalId']==sid and x['canonicalGoalId']==row['goalId']),'wholeCurrentSourceDecisions':[x for x in mp['decisions'] if x['sourceGoalId']==sid],'mapping':ref(mpath),'extraction':ref(epath),'sourceDocument':next((x for x in ex.get('sourceDocuments',[]) if x['key']==sg.get('sourceDocumentKey')),ex.get('sourceDocument')),'newSourceApproval':False})
nw['role']='Current 32 direct whole source witnesses after bounded author proposals merged into ROOT source successor; all claims pending independent review';put('sources/current32-direct-whole-witnesses.neutral.json',nw)
put('checks/source-additive-retention.actual.json',{'schemaVersion':1,'HESevenAuthorSourceGoalIds':sorted(changed),'HEOther137ObjectsIncludingROOTSixExact':all(g==next(x for x in hex['sourceGoals'] if x['id']==g['id']) for g in hebase['sourceGoals'] if g['id'] not in changed),'BYROOTEightAndSehPartialPreserved':proof['BYOther217Exact'],'sourceCourseClearance':'HOLD_pending_actual_independent_source_and_scope_checks','authorScopeHoldsExact':proof['currentSourceClearance'],'mappingPathsReplaced':replacements,'newIndependentSourceApproval':False,'activeWrites':[]})
shutil.copytree(R/P,C/P)
shutil.copyfile(pathlib.Path(__file__),R/P/'technical-prepare-current353.py')
print(json.dumps({'namespace':str(P),'capsule':str(C),'goals':len(ids),'authorInputsVerified':144,'other471Exact':True,'HEsourceAdditive':True,'strictGain':0,'activeWrites':[]}))
