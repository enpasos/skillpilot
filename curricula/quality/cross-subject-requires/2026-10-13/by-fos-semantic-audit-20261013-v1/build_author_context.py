# SPDX-License-Identifier: Apache-2.0
"""Capture literal scope/ownership facts. No semantic classifier or graph edits."""
import datetime
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
ROOT.mkdir(parents=True, exist_ok=True)
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp = lambda o: 'sha256:' + hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
write = lambda p,o: Path(p).open('x').write(json.dumps(o, ensure_ascii=True, indent=2)+'\n')
config_path = 'curricula/quality/cross-subject-requires/math-physics.config.json'
inventory_path = 'curricula/quality/cross-subject-requires/math-physics.inventory.json'
manifest_path = 'curricula/curriculum_manifest.json'
overview_path = 'curricula/DE/BY/DE_BY_Fachoberschule_Overview.json'
config = read(config_path)
inventory = read(inventory_path)
assert sha(inventory_path) == 'sha256:8bfc07514f0eb519c5e5cb0e8afa9af1774ddca4d6b2ddf02587a37b69c77d58'
family_config = next(f for f in config['families'] if f['familyId']=='by-fachoberschule')
family = next(f for f in inventory['families'] if f['familyId']=='by-fachoberschule')
assert family['counts']['stableGoalIds']==539 and family['counts']['technicalLeaves']==428
selected_paths = family_config['paths']
docs = {path:read(path)for path in selected_paths}
selected_ids = {g['id']for d in docs.values()for g in d['goals']}
assert len(selected_ids)==539 and sum(len(d['goals'])for d in docs.values())==539
by_inv_id = {g['goalId']:g for g in family['goals']}
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

# This discovery matches the inventory's active-directory boundary. Historical
# input/archive/quality copies are explicitly not public owner occurrences.
active_docs = {}
excluded = set(config['excludedDirectories'])
def visit(directory):
    for p in sorted(Path(directory).iterdir()):
        if p.is_dir():
            if p.name not in excluded: visit(p)
        elif p.suffix=='.json':
            d=read(p)
            if not isinstance(d,dict): continue
            lid=d.get('landscapeId',d.get('id'))
            if isinstance(lid,str)and isinstance(d.get('goals'),list): active_docs[str(p)]=d
visit('curricula')
assert len(active_docs)==inventory['activeLandscapeFiles']
target_lids={d['landscapeId']for d in docs.values()}
reuse=[]
for lid in sorted(target_lids):
    occurrences=[]
    for path,d in active_docs.items():
        if d.get('landscapeId',d.get('id'))==lid:
            contained={c for g in d['goals']for c in g.get('contains',[])}
            roots=[g['id']for g in d['goals']if g['id']not in contained]
            occurrences.append({'path':path,'fileSha256':sha(path),'documentMetadata':{k:v for k,v in d.items()if k!='goals'},'rootGoalIds':roots,'goalCount':len(d['goals'])})
    reuse.append({'landscapeId':lid,'actualActiveOccurrences':occurrences,'runtimeCollisionProved':False,'boundary':'Identifier reuse is recorded separately from stable-goal definition conflicts. The root manifest does not carry a file-path field; no runtime/client behavior is inferred.'})

profile_tokens={'ABU','G','S','W','GH','IW','T'}
def scope_for_heading(goal):
    title=goal['title']
    years=[int(x)for x in re.findall(r'(?:M|Ph)(10|11|12|13)\b',title)]
    profiles=[]
    for group in re.findall(r'\(([^)]*)\)',title):
        parts=[x.strip()for x in group.split(',')]
        if parts and set(parts)<=profile_tokens: profiles=parts
        if group.startswith('erweiterndes Wahlplichtfach '):
            profiles=[x.strip()for x in group[len('erweiterndes Wahlplichtfach '):].split(',')]
            assert set(profiles)<=profile_tokens
    route='Vorklasse'if 'Vorklasse:'in title else'Vorkurs'if 'Vorkurs:'in title else'Additum'if ' Additum 'in title else'Aspekte der Physik'if title.startswith('Aspekte der Physik ')else'base subject'
    explicit_selection='verpflichtend'if '(verpflichtend)'in title else'optional'if '(optional)'in title else'erweiterndes Wahlplichtfach'if 'erweiterndes Wahlplichtfach'in title else None
    return {'headingGoalId':goal['id'],'literalHeading':title,'literalHeadingSha256':fp(title),'yearTokens':sorted(set(years)),'profileAbbreviationsLiteral':profiles,'routeLabelLiteral':route,'selectionMarkerLiteral':explicit_selection,'explicitStage':None,'stageStatus':'not-authored','jurisdictionMetadata':{'country':'DE','region':'BY','schoolType':'Fachoberschule'},'evidenceKind':'literal-current-heading-and-document-metadata-not-official-source-binding','missing':['original normative source/page binding','authoritative placement/applicability','stage']+(['profile/branch not explicitly named']if not profiles else[])}

records=[]
sections=[]
frozen={config_path,inventory_path,manifest_path,overview_path,'AGENTS.md','LICENSING.md','scripts/scrape_lehrplanplus.py','scripts/repair_lehrplan_ids.py','scripts/generate_bavarian_overviews.py','app/scripts/lib/crossLandscapeGraph.ts','app/scripts/lib/crossSubjectRequiresInventory.ts'}
global_shared=[]
for path,d in docs.items():
    frozen.add(path)
    goals={g['id']:g for g in d['goals']}
    parents=defaultdict(list)
    for g in d['goals']:
        for c in g.get('contains',[]):
            assert c in goals, (path,g['id'],c)
            parents[c].append(g['id'])
    def ancestry(gid,trail=()):
        assert gid not in trail
        out=[]
        for parent in parents[gid]:
            out.append(parent)
            out.extend(ancestry(parent,trail+(gid,)))
        return list(dict.fromkeys(out))
    for idx,g in enumerate(d['goals']):
        inv=by_inv_id[g['id']]
        selected=next(o for o in inv['occurrences']if o['selected']and o['path']==path)
        assert fp(g)==selected['definitionSha256'],g['id']
        ancestor_ids=ancestry(g['id'])
        topic_headings=[goals[a]for a in ([g['id']]+ancestor_ids)if 'Lernbereich'in goals[a]['title']]
        scope=[scope_for_heading(h)for h in topic_headings]
        if g.get('contains')and 'Lernbereich'in g['title']:
            sections.append({'path':path,'index':idx,'goalId':g['id'],'scope':scope_for_heading(g),'directChildGoalIds':g['contains'],'status':'literal-scope-author-context-not-active-program-unit'})
        occurrences=[]
        for o in inv['occurrences']:
            frozen.add(o['path'])
            actual=next(x for x in active_docs[o['path']]['goals']if x['id']==g['id'])
            assert fp(actual)==o['definitionSha256']
            occurrences.append({'inventoryOccurrence':o,'actualFullGoal':actual,'actualGoalSha256':fp(actual),'pathFileSha256':sha(o['path'])})
        effective=inventory['effectivePrerequisiteSets'][selected['effectiveRequiresRef']]
        origins=[inventory['prerequisiteOriginTable'][i]for i in inventory['prerequisiteOriginSets'][selected['prerequisiteOriginsRef']]]
        assert selected['key']not in effective
        inherited_same_id=[{'ancestorGoalId':a,'reference':r}for a in ancestor_ids for r in goals[a].get('requires',[])if r.split(':')[-1]==g['id']]
        if len(occurrences)>1:
            global_shared.append({'goalId':g['id'],'definitionStatus':inv['definitionStatus'],'authoritativeOwner':inv['authoritativeOwner'],'occurrenceCount':len(occurrences),'effectivePrerequisites':effective,'effectiveOrigins':origins,'selfExclusionWitnesses':inherited_same_id})
        records.append({'path':path,'index':idx,'goalId':g['id'],'fullGoal':g,'fullGoalSha256':fp(g),'fullDescriptionSha256':fp({'description':g.get('description'),'descriptionEn':g.get('descriptionEn')}),'selectedOccurrence':selected,'inventoryAuthoritativeOwner':inv['authoritativeOwner'],'definitionStatus':inv['definitionStatus'],'allActualActiveOccurrences':occurrences,'currentDirectRequires':g.get('requires',[]),'currentDirectContains':g.get('contains',[]),'currentEffectivePrerequisites':effective,'currentEffectiveOrigins':origins,'effectivePrerequisiteSetSha256':fp(effective),'prerequisiteOriginsSha256':fp(origins),'directParentGoalIds':parents[g['id']],'allContainsAncestorGoalIds':ancestor_ids,'allLocalLiteralTopicScopeCandidates':scope,'selfExcludedInheritedReferences':inherited_same_id,'sourceState':{'authoredSourceRef':selected['sourceRef'],'provenanceRef':selected['scope']['provenanceRef'],'sourceBindingRecordCount':selected['scope']['sourceBindingRecordCount'],'applicability':selected['scope']['applicability'],'placements':selected['scope']['placements'],'boundary':'Scraped-looking text and code BASE_URL are not a hash-bound exact original curriculum source; no official authenticity or all-branch applicability is claimed.'}})

for item in reuse:
    for o in item['actualActiveOccurrences']: frozen.add(o['path'])
manifest=read(manifest_path)
declared=[r for r in manifest['curricula']if r['id']in family_config['manifestRootIds']]
assert len(declared)==1
source_metadata={'sourceDocumentFieldsInSelectedFiles':{p:{k:d.get(k)for k in ['sourceDocument','sourceDocuments','sourceRef','sourceUrl','url','provenance']}for p,d in docs.items()},'actualScopeMetadata':{p:{k:v for k,v in d.items()if k!='goals'}for p,d in docs.items()},'allGoalSourceBindingRecordCount':sum(r['sourceState']['sourceBindingRecordCount']for r in records),'localSourceContextReads':[{'path':p,'sha256':sha(p),'actualRead':'Parser/UUID/source metadata behavior and overview construction, not a run provenance record.'}for p in ['scripts/scrape_lehrplanplus.py','scripts/repair_lehrplan_ids.py','scripts/generate_bavarian_overviews.py']],'localRawSourceFinding':'No FOS per-goal source-extraction, official document/page binding, or raw HTML/PDF source context was located in the checked FOS/DE-BY paths and tmp source-name discovery. Missing is recorded rather than replaced with general external facts.','sourceDiscoveryBoundary':'Repository-local audit only; linked base domain in scraper is not assigned to every goal as a fabricated source URL.'}

context={'schemaVersion':1,'status':'inert_by_fos_full_goal_owner_prerequisite_scope_context','authorAgent':'/root/physics_pending5_revision','createdAt':now,'goalCount':539,'technicalLeafCount':428,'configuredFamily':family_config,'inventoryFamilyCounts':family['counts'],'inventoryPath':inventory_path,'inventorySha256':sha(inventory_path),'fullDescriptionReadWitness':{'parentAgent':'/root/physics_pending5_revision','fullGermanDescriptionsRead':539,'allContainerDescriptionsEmptyConfirmed':True,'existingEnglishDescriptionsRead':2,'missingEnglishDescriptionFields':537,'method':'Personally read complete indexed descriptions in bounded tool output, rereading previously truncated ranges; full headings/contains metadata read. Child Physics author makes additional personal full-text judgments.'},'records':records,'landscapeIdReuse':reuse,'sharedStableGoalOwnershipAndObservedGlobalInventoryInheritance':global_shared,'configuredManifestRoot':{'manifestPath':manifest_path,'manifestSha256':sha(manifest_path),'declaration':declared[0],'actualMatchingOverviewPath':overview_path,'actualOverviewSha256':sha(overview_path),'filePathBindingFieldPresent':False,'runtimeCollisionProved':False},'sourceMetadataAndLocalContextsActuallyRead':source_metadata,'globalGraphDiagnosticsAffectingFamily': [x for x in inventory['activeGraphDiagnostics']if any(x.get('nodeKey','').endswith(':'+gid)for gid in selected_ids)],'frozenInputs':[{'path':p,'sha256':sha(p)}for p in sorted(frozen)],'authorityBoundary':'Read-only current facts and explicit unresolved source/scope/owner questions. No semantic registry, view, goal, requires edge, runtime finding, native M7 or human approval is created.','licensing':{'ownAnnotations':'CC-BY-4.0','technicalContext':'Apache-2.0','sourceGoalTexts':'Retain original rights/status; local capture is not an ownership or redistribution clearance.','attribution':'SkillPilot contributors'}}
write(ROOT/'full-read-ownership-scope.context.exact.json',context)
write(ROOT/'literal-program-segments.author-context.json',{'schemaVersion':1,'status':'inert_literal_scope_segments_pending_independent_review','author':'/root/physics_pending5_revision','segmentCount':len(sections),'sections':sections,'compatibilityBoundary':'Profile-token and year overlaps can identify candidate pair contexts only. No curriculum-time requires, normative course entitlement, branch expansion, stage inference or active applicability/view is authorized. Unknown Additum13 Mathematics branch and Ph10 preparatory-route distinctions stay unresolved.','license':'CC-BY-4.0','attribution':'SkillPilot contributors'})
print(json.dumps({'context':str(ROOT/'full-read-ownership-scope.context.exact.json'),'contextSha256':sha(ROOT/'full-read-ownership-scope.context.exact.json'),'records':len(records),'sections':len(sections),'frozenInputs':len(frozen),'landscapeReuse':[(r['landscapeId'],len(r['actualActiveOccurrences']))for r in reuse],'sharedStableIDs':[(r['goalId'],r['occurrenceCount'])for r in global_shared]},indent=2))
