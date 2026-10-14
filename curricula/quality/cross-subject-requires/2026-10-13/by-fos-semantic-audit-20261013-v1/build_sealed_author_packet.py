# SPDX-License-Identifier: Apache-2.0
"""Assemble individually authored judgments; does not classify by keywords."""
import datetime, hashlib, json
from collections import Counter, defaultdict
from pathlib import Path
R=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp=lambda x:'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,x):
    with (R/name).open('x')as f:f.write(json.dumps(x,ensure_ascii=True,indent=2)+'\n')
context=read(R/'full-read-ownership-scope.context.exact.json')
origins=read(R/'current-effective-requires.full-origin-paths.json')
sections=read(R/'literal-program-segments.author-context.json')
math=read(R/'math-author-classifications.json');physics=read(R/'physics-author-classifications.json')
assert len(math['entries'])==333 and len(physics['entries'])==206
assert sha(R/'physics-author-classifications.json')=='sha256:8a3837fc3e970396830612412e988f36efe83ed71f4a41c7c253628a1f0d2e93'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()

# Bounded author correction after comparing the actual two root contains lists.
# Earlier raw author input stays present byte-for-byte, with this explicit delta.
amendment={'goalId':'b3bc3211-893c-50d4-ac60-7bff9dce5d3c','index':332,
 'oldAuthorRole':'cluster','newAuthorRole':'program',
 'author':'/root/physics_pending5_revision','status':'inert_author_candidate_pending_independent_review',
 'reason':'Der leere Fachroot enthält den Motivationsanker und die vier Jahrgangsstufen 10–13. Seine unmittelbaren Kinder sind Programmjahre, keine fachlich operationalisierten Teilkompetenzen; der Root ist deshalb in dieser Inventur eine strukturelle Programm-/Landschaftshülle, keine globale Mathematikleistung. Die alte Rohklassifikation bleibt unverändert als Eingang erhalten.',
 'sourceInputPath':str(R/'math-author-classifications.json'),'sourceInputSha256':sha(R/'math-author-classifications.json'),
 'fullGoalSha256':context['records'][332]['fullGoalSha256'],'activeRoleRegistryChanged':False}
write('root-role.author-amendment.json',amendment)

groups={};group_sections=defaultdict(list)
for section in sections['sections']:
 s=section['scope'];subject='Math'if section['path'].endswith('Mathematik.json')else'Physics'
 key=(subject,tuple(s['yearTokens']),tuple(s['profileAbbreviationsLiteral']),s['routeLabelLiteral'],s['selectionMarkerLiteral'])
 group_sections[key].append(section)
segments=[];gid_segment={}
for number,(key,ss)in enumerate(group_sections.items(),1):
 subject,years,profiles,route,selection=key;sk=f'author-scope-segment-{number:02d}'
 member_ids=[r['goalId']for r in context['records']if any(s['headingGoalId']in {x['goalId']for x in ss}for s in r['allLocalLiteralTopicScopeCandidates'])]
 for gid in member_ids:gid_segment[gid]=sk
 segments.append({'authorSegmentKey':sk,'subject':subject,'yearTokens':list(years),'profileAbbreviationsLiteral':list(profiles),'routeLabelLiteral':route,'selectionMarkerLiteral':selection,'literalHeadingIds':[s['goalId']for s in ss],'literalHeadingTexts':[s['scope']['literalHeading']for s in ss],'memberGoalIds':member_ids,'sourceBoundOfficialApplicability':False,'unknowns':['exact official source and page binding','authoritative placements','stage']+(['profile/branch not authored']if not profiles else[])+(['Physik Ph10 does not explicitly distinguish Vorklasse or Vorkurs']if subject=='Physics'and years==(10,)else[]),'status':'literal_context_only_pending_independent_review'})
pairs=[]
for m in segments:
 if m['subject']!='Math':continue
 for p in segments:
  if p['subject']!='Physics' or not set(m['yearTokens'])&set(p['yearTokens']):continue
  overlap=sorted(set(m['profileAbbreviationsLiteral'])&set(p['profileAbbreviationsLiteral']))
  status='explicit_literal_profile_overlap_only'if overlap else'profile_compatibility_unknown'if not m['profileAbbreviationsLiteral']or not p['profileAbbreviationsLiteral']else'explicit_literal_profiles_disjoint'
  pairs.append({'mathAuthorSegmentKey':m['authorSegmentKey'],'physicsAuthorSegmentKey':p['authorSegmentKey'],'sharedExplicitYearTokens':sorted(set(m['yearTokens'])&set(p['yearTokens'])),'sharedLiteralProfileTokens':overlap,'comparisonStatus':status,'normativeCompatibilityApproved':False,'requiresConclusion':None,'boundary':'Same-year tokens locate current text contexts only. Dependencies can cross years; this table neither approves nor excludes any edge based on curriculum chronology. Explicit routes and elective/compulsory markers remain separate.'})
write('compatibility-segments.author-candidate.json',{'schemaVersion':1,'status':'inert_literal_compatibility_context_unreviewed','segmentCount':len(segments),'literalTopicHeadingCount':101,'segments':segments,'sameYearLiteralContextComparisons':pairs,'unplacedGoalIds':[r['goalId']for r in context['records']if r['goalId']not in gid_segment],'unknownProfileSegmentKeys':[s['authorSegmentKey']for s in segments if not s['profileAbbreviationsLiteral']],'boundary':'No curriculum-time requires, active program unit/view/placement, branch expansion, legal curriculum entitlement or all-profile adoption. Literal facts come from the frozen current tree; missing normative source bindings remain missing.','license':'CC-BY-4.0','attribution':'SkillPilot contributors'})

entries=[]
for i,row in enumerate(context['records']):
 is_math=row['path'].endswith('Mathematik.json');a=(math if is_math else physics)['entries'][row['index']]
 assert a['goalId']==row['goalId']
 if is_math:assert a['fullGoalSha256']==row['fullGoalSha256'] and a['descriptionSha256']==row['fullDescriptionSha256']
 else:assert 'sha256:'+a['goalCanonicalJsonSha256']==row['fullGoalSha256'] and a['description']==row['fullGoal'].get('description','')
 role=a['semanticRole'];reason=a.get('classificationReason',a.get('reason'))
 author=math['authorAgent']if is_math else physics['authorAgentIdentity']
 units=[a['potentialIndependentAssessmentAspects']]if is_math and role in {'assessable_narrow_atomic_candidate','broad_outcome_requires_split'}else a.get('assessmentUnits',[])
 gaps=[reason]if is_math and role=='broad_outcome_requires_split'else a.get('granularityGaps',[])
 if row['goalId']==amendment['goalId']:role=amendment['newAuthorRole'];reason=amendment['reason']
 blockers=[{'kind':'independent_content_review','detail':'This individually authored actual-content judgment has not been independently approved.'}]
 if row['sourceState']['sourceBindingRecordCount']==0:
  blockers.append({'kind':'exact_source_binding_missing','detail':'No per-goal original curriculum document/page binding exists in the frozen selected occurrence; locally read scraper code is not exact source evidence.'})
 if row['inventoryAuthoritativeOwner']is None:
  blockers.append({'kind':'authoritative_owner_unresolved','detail':f"{len(row['allActualActiveOccurrences'])} consistent active stable-ID occurrences; no authoritative owner is chosen."})
 if role=='broad_outcome_requires_split':blockers.append({'kind':'granularity_gap','detail':reason})
 if role=='admin_content_fragment':blockers.append({'kind':'source_payload_loss','detail':'The complete original sentence names three integral forms without any surviving formulas: “der Form , und sowie”. They cannot be reconstructed by assuming conventional forms.'})
 if a['actualSubject']=='unresolved':blockers.append({'kind':'actual_subject_unresolved','detail':'The actual free-project text does not name a mathematical or physical project object. File placement alone does not establish subject ownership.'})
 scope=row['allLocalLiteralTopicScopeCandidates']
 if scope and not any(s['profileAbbreviationsLiteral']for s in scope):blockers.append({'kind':'profile_branch_not_authored','detail':'The literal local heading names no profile/branch; all-profile applicability is not inferred.'})
 if role=='orientation':blockers.append({'kind':'orientation_wording_vs_policy_review','detail':'The full text is a relevance/motivation entry but says “kann erläutern / can explain”; activation would require checking compatibility with the ungraded motivational orientation contract. No knowledge assessment or completion is approved here.'})
 entries.append({'goalId':row['goalId'],'sourcePath':row['path'],'sourceIndex':row['index'],'sourceFileSha256':next(x['sha256']for x in context['frozenInputs']if x['path']==row['path']),
  'fullGoalSha256':row['fullGoalSha256'],'fullDescriptionSha256':row['fullDescriptionSha256'],'originalTitle':row['fullGoal']['title'],'originalDescription':row['fullGoal'].get('description'),'originalDescriptionEn':row['fullGoal'].get('descriptionEn'),
  'technicalLeafObserved':not bool(row['currentDirectContains']),'actualSubject':a['actualSubject'],'semanticRoleAuthorCandidate':role,'individualContentReason':reason,'potentialAssessmentUnitsAuthorNotes':units,'granularityGapsAuthorNotes':gaps,
  'authorAgent':author,'authorRole':'AUTHOR','authorInputPath':str(R/('math-author-classifications.json'if is_math else'physics-author-classifications.json')),'authorInputSha256':sha(R/('math-author-classifications.json'if is_math else'physics-author-classifications.json')),'authorInputEntrySha256':fp(a),'boundedAuthorAmendmentPath':str(R/'root-role.author-amendment.json')if row['goalId']==amendment['goalId']else None,
  'fullReadWitness':a.get('fullReadWitness',a.get('readWitness')),'parentAlsoReadFullDescription':True,
  'contextPath':str(R/'full-read-ownership-scope.context.exact.json'),'contextFileSha256':sha(R/'full-read-ownership-scope.context.exact.json'),'contextRecordSha256':fp(row),'selectedOccurrenceKey':row['selectedOccurrence']['key'],'selectedOccurrenceSha256':fp(row['selectedOccurrence']),
  'inventoryAuthoritativeOwner':row['inventoryAuthoritativeOwner'],'definitionStatus':row['definitionStatus'],'actualOwnerOccurrences':[{'path':x['inventoryOccurrence']['path'],'key':x['inventoryOccurrence']['key'],'fileSha256':x['pathFileSha256'],'goalDefinitionSha256':x['actualGoalSha256'],'selected':x['inventoryOccurrence']['selected']}for x in row['allActualActiveOccurrences']],
  'currentDirectRequiresObserved':row['currentDirectRequires'],'currentDirectContainsObserved':row['currentDirectContains'],'currentEffectivePrerequisitesObserved':row['currentEffectivePrerequisites'],'currentEffectivePrerequisiteSetSha256':row['effectivePrerequisiteSetSha256'],'currentEffectiveOriginsSha256':row['prerequisiteOriginsSha256'],
  'fullOriginPathWitnessPath':str(R/'current-effective-requires.full-origin-paths.json'),'fullOriginPathWitnessSha256':sha(R/'current-effective-requires.full-origin-paths.json'),'fullOriginPathRecordSha256':fp(origins['records'][i]),
  'literalScopeContext':scope,'authorCompatibilitySegmentKey':gid_segment.get(row['goalId']),'authoredSourceState':row['sourceState'],'stageApplicability':'not-authored','englishDescriptionFieldPresent':row['fullGoal'].get('descriptionEn')is not None,'blockers':blockers,
  'decisionStatus':'inert_author_candidate_pending_independent_review','nativeM7Status':'not-assessed-by-this-author-inventory','activeRegistryWritten':False,'requiresApprovalMade':False,'authoritativeOwnerChosen':False})
assert len(entries)==539 and len({e['goalId']for e in entries})==539
counts={'stableGoalIds':539,'technicalLeaves':sum(e['technicalLeafObserved']for e in entries),'actualSubjects':dict(Counter(e['actualSubject']for e in entries)),'authorSemanticRoles':dict(Counter(e['semanticRoleAuthorCandidate']for e in entries)),'blockers':dict(Counter(b['kind']for e in entries for b in e['blockers']))}
ledger={'schemaVersion':1,'artifactId':'by-fos-semantic-audit-20261013-v1-author-role-ledger','status':'inert_author_only_unreviewed','createdAt':now,'authorAgent':'/root/physics_pending5_revision','authorContributors':[{'agent':math['authorAgent'],'role':'AUTHOR','independenceClaim':False},{'agent':physics['authorAgentIdentity'],'role':'AUTHOR','independenceClaim':False}],
 'familyId':'by-fachoberschule','configuredManifestRootIds':context['configuredFamily']['manifestRootIds'],'exactInventoryPath':context['inventoryPath'],'exactInventorySha256':context['inventorySha256'],'counts':counts,'entries':entries,
 'sourceBoundary':'Original goal texts retained exactly; source document/page, normative scope and rights/authenticity are unresolved where absent. Generic local scraper domain is not assigned as per-goal source. No blanket subject or semantic role inference from the file, technical leaf, chronology, factual knowledge or mathematical method.',
 'approvalBoundary':'All 539 entries require a different identity’s independent complete-content review. Candidate role, narrowness and support methods confer no active semantic classification, source acceptance, native M7, exact requires set or mastery.',
 'capabilityRecipes':{'authorApprovedRecipes':[],'reason':'No new Math capability recipe is adopted from unbound legacy source text. Mathematical methods mentioned by Physics author remain descriptive learner methods, not universally necessary Math mastery claims.'},
 'license':'CC-BY-4.0','attribution':'SkillPilot contributors','activeFilesChanged':[]}
write('semantic-role-ownership-scope.author-ledger.json',ledger)
issues=[{'kind':'source_payload_loss','goalId':e['goalId'],'sourcePath':e['sourcePath'],'sourceIndex':e['sourceIndex'],'fullGoalSha256':e['fullGoalSha256'],'exactDescription':e['originalDescription']}for e in entries if e['semanticRoleAuthorCandidate']=='admin_content_fragment']
write('source-owner-granularity-blockers.author.json',{'schemaVersion':1,'status':'inert_author_blocker_inventory_unreviewed','counts':counts,'formulaPayloadLoss':issues,'sharedGoalOwnership':context['sharedStableGoalOwnershipAndObservedGlobalInventoryInheritance'],'allInheritanceOriginsPath':str(R/'current-effective-requires.full-origin-paths.json'),'allInheritanceOriginsSha256':sha(R/'current-effective-requires.full-origin-paths.json'),'landscapeIdentifierReuse':context['landscapeIdReuse'],'manifestFileBindingObservation':context['configuredManifestRoot'],'perGoalBlockers':[{'goalId':e['goalId'],'fullGoalSha256':e['fullGoalSha256'],'blockers':e['blockers']}for e in entries],'sourceAndOwnerQuestionsRemainSeparate':True,'nativeM7AndRoleAdoptionClaimed':False,'license':'CC-BY-4.0','attribution':'SkillPilot contributors'})
print(json.dumps({'ledgerPath':str(R/'semantic-role-ownership-scope.author-ledger.json'),'ledgerSha256':sha(R/'semantic-role-ownership-scope.author-ledger.json'),'counts':counts,'compatibilitySegments':len(segments),'sameYearLiteralContextComparisons':len(pairs)},indent=2))
