# SPDX-License-Identifier: Apache-2.0
"""Assemble scientific bodies and a no-render stock capsule; no review grant."""
import hashlib,json,shutil
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
AUTHOR=E/'chemie-equilibrium-four-source-scope-candidate-author-20261015-v1'
SOURCE=E/'chemie-equilibrium-four-source-scope-author-20261015-v1'
BASE=E/'chemie-native9-current422-bounded-inactive-integration-technical-20261015-v1'
NATIVE9=E/'chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'inputs').exists()
for d in ['inputs','checks','config','profiles','diagnostic','scripts']:(OWN/d).mkdir(exist_ok=True)
asel=AUTHOR/'NEUTRAL.finite-four-source-scope-candidate-author.selector.json';assert ref(asel)['sha256']=='sha256:4c8b8027b0e05914ea6d32d36271661c2af588a30cefb333bfac8fa5dcdbfbad'
a=load(asel)
base=load(BASE/'OUTPUTS.finite-native9-current422-inactive-integration.final-selector.json')
basecanon=load(verify(base['canonical']));newcanon=load(verify(a['canonical']));semantic=load(verify(a['semanticSourceIdentityOnly']))
old={g['id']:g for g in basecanon['goals']};new={g['id']:g for g in newcanon['goals']};ids=a['sourceCourseDeclarationGoalIds'];changed=a['changedWholeGoalIds'];assert len(ids)==4 and len(changed)==2
assert list(old)==list(new) and len(old)==560
diff=[]
for gid in old:
 keys=[k for k in old[gid].keys()|new[gid].keys() if old[gid].get(k)!=new[gid].get(k)]
 if keys:diff.append({'goalId':gid,'changedFields':keys})
assert {r['goalId'] for r in diff}==set(changed) and all(set(r['changedFields'])=={'description','descriptionEn'} for r in diff)
assert sum(d['semanticKind']=='curricularAtomic' for d in semantic['decisions'])==422
parents={gid:[g for g in newcanon['goals'] if gid in g.get('contains',[])] for gid in ids}
contextids=set(ids)
for gid in ids:contextids.update(new[gid].get('requires',[]));contextids.update(g['id'] for g in parents[gid])
neighbors=[g['id'] for g in newcanon['goals'] if g['id'] not in ids and (set(g.get('requires',[]))&set(ids) or set(g.get('contains',[]))&set(ids))]
put(OWN/'inputs/four-current-whole-goals-requires-and-parents.neutral.json',{'role':'Actual current whole goal bodies, direct prerequisites and parents; no science vote','canonical':a['canonical'],'targetGoalIds':ids,'descriptionChangeGoalIds':changed,'directDependentOrParentGoalIds':neighbors,'goals':[new[g] for g in new if g in contextids|set(neighbors)],'targetRelations':[{'goalId':g,'wholeGoal':new[g],'wholeDirectPrerequisites':[new[r] for r in new[g].get('requires',[])],'wholeDirectParents':parents[g]} for g in ids]})
material=load(verify(a['wholeEightCasesAndFourProfilesExact']))
assert len(material['cases'])==8 and len(material['profiles'])==4 and {r['goalId'] for r in material['profiles']}==set(ids)
put(OWN/'inputs/eight-whole-DEEN-cases-four-scientific-profile-bodies.neutral.json',{'role':'Whole scientific cases/profile bodies only; wrapper histories/author FIRSTs are not included','targetGoalIds':ids,'cases':material['cases'],'profiles':material['profiles'],'originalCaseObjectBindings':material['caseObjectBindings']})
components=[];componentprovenance=[]
for rr in a['sourceComponentExtractions']:
 p=verify(rr);j=load(p);out=[]
 for r in j['sourceGoals']:
  q={k:v for k,v in r.items() if k!='normativeAntecedentReading'}
  # Replace navigation to author FIRST/interpretation packages with neutral raw source files below.
  q['actualOriginalComponentBody']={k:v for k,v in q['actualOriginalComponentBody'].items() if k not in ['parentWholeBodies','additionalBY13WholeBodies']}
  out.append(q)
 components.extend(out);componentprovenance.append({'jurisdiction':j['jurisdiction'],'sourceDocuments':j['sourceDocuments'],'unreviewed':True,'active':False})
assert len(components)==8 and all(c['isOfficialBullet'] is False and c['officialNumberingClaim'] is False for c in components)
put(OWN/'inputs/eight-authored-components-and-explicit-assumptions.unreviewed.neutral.json',{'role':'Plain author propositions and model assumptions, separate from official raw passages; no endorsement','sourceDocumentDeclarations':componentprovenance,'authorComponents':components,'official':False,'reviewedM3Decisions':[],'active':False,'courseOrSourceApproval':False,'navigationFieldsNotIncluded':['normativeAntecedentReading','actualOriginalComponentBody.parentWholeBodies','actualOriginalComponentBody.additionalBY13WholeBodies']})
decl=load(verify(a['courseDeclaration']));decl.pop('technicalLKTargetEvidence',None)
put(OWN/'inputs/four-existing-LK-target-author-declaration.unreviewed.neutral.json',decl)
raw=load(SOURCE/'context/whole-original-and-additional-source-cells-union-edges.author-reading.json')
routes=[]
for r in raw['routes']:
 routes.append({k:r[k] for k in ['jurisdiction','wholeOriginalNeutralSourceGoals','originalNeutralUnionEdges','additionalWholeSourceGoalsOmittedFromNeutral','additionalActualWholeUnionEdges','wholeParentPassagesFromExtraction','directExistingEdgesToFourTargets']})
supp=load(SOURCE/'context/supplement-BY13-whole-acid-base-source-cells-union-partners.exact.json')
put(OWN/'inputs/whole-official-BY-HE-RP-source-cells-passages-and-existing-union-edges.neutral.json',{'role':'Unshortened raw source cells/passages and existing union edges; no new mapping decision','routes':routes,'BY13AdditionalWholeCells':supp['sourceGoals'],'BY13AdditionalWholePassages':supp['wholePassages'],'BY13ExistingUnionEdges':supp['existingUnionEdges'],'rawTextOrTextRule':'Use nonempty rawText, otherwise text; empty rawText does not mean no passage.','newReviewedM3Decisions':[],'active':False})
partners=load(SOURCE/'context/whole-current-partners-prereqs-and-parents8152.exact.json')
partnerids=partners['goalIds'];currentpartners=[new[g] for g in partnerids]
put(OWN/'inputs/whole-current-source-union-partners-requires-and-parents.neutral.json',{'role':'Actual current whole canonical partner bodies, not conclusions about coverage','canonical':a['canonical'],'goalIds':partnerids,'goals':currentpartners})
reading=load(SOURCE/'reading/PRIMARY.actual-read-and-fetch-scope.json')
plainreads=[{'originalPdf':r['originalPdf'],'wholePdfPageCount':r['wholePdfPageCount'],'wholePhysicalPagesSelected':r['wholePhysicalPagesSelected'],'completeSelectedText':r['completeSelectedText'],'extraction':r['extraction']} for r in reading['localOfficialPDFs']]
for rr in plainreads:verify(rr['originalPdf']);verify(rr['completeSelectedText'])
put(OWN/'inputs/existing-whole-primary-page-texts.reference-only.neutral.json',{'role':'Whole primary page texts by exact reference; no author interpretation or source coverage judgment','documents':plainreads,'officialBYURLs':[{k:r[k] for k in ['url','retrievedAtUTC','currentFiniteBodySource']} for r in reading['officialBYCurrentPages']]})
central=load(verify(base['actualCentralConfig']))['subjects'][0];allrecords=[];provenance=[]
for cp in central['positiveEvidenceConfigPaths']:
 cfg=load(REPO/cp);p=REPO/cfg['reviewPath'];lines=p.read_bytes().splitlines(keepends=True)
 allrecords.extend(lines);provenance.append({'config':ref(REPO/cp),'records':ref(p)})
records=[json.loads(x) for x in allrecords if x.strip()];assert len(records)==len({r['goalId'] for r in records})
assert set(ids)<=set(r['goalId'] for r in records)
p=OWN/'profiles/base367-four-selected-P-records.whole-lines.exact.jsonl';assert not p.exists();p.write_bytes(b''.join(l for l in allrecords if json.loads(l)['goalId'] in ids))
mapdata=load(verify(base['finalExactRebuildMap']));host=REPO/'tmp/chemie-m7-resumed-20261015/source4-no-render-stock-context-capsule-v1';assert not host.exists()
host.mkdir(parents=True)
for p in REPO.iterdir():
 if p.name not in ['app','tmp','.git']:(host/p.name).symlink_to(p,target_is_directory=p.is_dir())
(host/'app').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ['scripts','public']:(host/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(host/'app/scripts').mkdir();(host/'app/public').mkdir()
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def install(src,relative,physical=False):
 target=host/relative;parent=host
 for part in target.relative_to(host).parts[:-1]:parent/=part;branch(parent)
 if target.is_file() or target.is_symlink():target.unlink()
 if physical:shutil.copy2(src,target)
 else:target.symlink_to(src)
for row in mapdata['stockPhysicalModules']:install(verify(row),row['path'],True)
aliases=[]
for row in mapdata['aliases']:
 if row['normalHostAlias'] not in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']:continue
 rr=dict(row);rr['physicalRepositorySource']=dict(row['physicalRepositorySource'])
 if row['normalHostAlias'].endswith('DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'):rr['physicalRepositorySource']=a['canonical']
 if row['normalHostAlias'].endswith('chemie.semantic-kinds.json'):rr['physicalRepositorySource']=a['semanticSourceIdentityOnly']
 install(verify(rr['physicalRepositorySource']),rr['normalHostAlias']);aliases.append(rr)
for row in mapdata['selectedCurrentAssetRows']+mapdata.get('legacyBaselineAssetReferences',[]):
 src=verify(row['physicalRepositorySource']);install(src,row['normalPublicDestination'])
 if row.get('goalId') in ids:install(src,row['normalCanonicalDestination'])
review=host/'curricula/DE/Gymnasium/quality/goal-visualization-review';assert review.is_symlink();review.unlink();review.mkdir()
cfg=load(NATIVE9/'config/whole422.normal-stock-base.config.json')
cfg.update(bookId='source4-actual-no-render-context-diagnostic',title='Source4 actual stock context diagnostic; no render',evidenceReviewPaths=[p.relative_to(REPO).as_posix() for p in [OWN/'profiles/base367-selected-P-records.original-whole-lines.exact.jsonl']],outputPath=(OWN/'diagnostic/NEVER-WRITTEN.full-model.json').relative_to(REPO).as_posix())
for variant in ['base367','prospective-wording','prospective-raw-D4']:
 out=dict(cfg)
 out.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',evidenceReviewPaths=['diagnostic-inputs/current.selected-records.jsonl'])
 put(OWN/'config'/f'{variant}.diagnostic-whole422.no-render.config.json',out)
plan={'schemaVersion':1,'role':'No-render diagnostic context only, NOT final Native4 or valid review bundle; pending final image/QA','ownRoot':OWN.relative_to(REPO).as_posix(),'base367Selector':ref(BASE/'OUTPUTS.finite-native9-current422-inactive-integration.final-selector.json'),'base367Seal':ref(BASE/'FILES.finite-native9-current422-inactive-integration.seal.json'),'sourceAuthorSelectorTechnicalProvenanceOnly':ref(asel),'canonical':a['canonical'],'semantic':a['semanticSourceIdentityOnly'],'targetGoalIds':ids,'descriptionChangeGoalIds':changed,'wholeGoalDiff':diff,'canonicalDirectDependentOrParentGoalIds':neighbors,'host':host.relative_to(REPO).as_posix(),'stockPhysicalModules':mapdata['stockPhysicalModules'],'normalReadOnlyAliases':aliases,'assets':mapdata['selectedCurrentAssetRows'],'existingSelectedPProvenance':provenance,'profileBodies':ref(OWN/'inputs/eight-whole-DEEN-cases-four-scientific-profile-bodies.neutral.json'),'original367QAForDiagnosticOnly':base['finalExactRebuildMap'],'finalQAReady':False,'nativePrepareExecuted':0,'rendererExecuted':0,'reviewVotes':0,'centralRuns':0,'activeWrites':0,'rasterCopies':0}
put(OWN/'checks/INPUTS.no-render-stock-context.plan.technical.json',plan)
print(json.dumps({'targets':len(ids),'wholeDescriptionsChanged':len(changed),'directDependentsOrParents':neighbors,'currentSelectedProfiles':len(records),'host':plan['host'],'stockModules':len(mapdata['stockPhysicalModules']),'rasterCopies':0,'prepare':0,'render':0}))
