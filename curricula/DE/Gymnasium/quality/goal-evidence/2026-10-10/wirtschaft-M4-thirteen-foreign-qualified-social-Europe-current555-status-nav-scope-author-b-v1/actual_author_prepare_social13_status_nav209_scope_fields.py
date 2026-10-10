import json,pathlib,copy,collections,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');m=json.load(open('/tmp/economics-social13-author-B-path.json'));O=pathlib.Path(m['O']);C=pathlib.Path(m['CAP'])
science=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-social-Europe-whole-science-independent-merge-audit-v1/one-real-legal-form-whole-essential-boundary-independent-followup-v3/actual-final-thirteen-social-Europe-whole-DEEN-science-independent-KEEP.handoff.receipt.json'
assert hashlib.sha256(science.read_bytes()).hexdigest()=='94da7f5d4e68ccd70e046081b47d00bc61cfc9324440b4000c2fd63d42a3abb2'
author=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-local-social-state-distribution-Europe-one-contract-author-a-v1/one-real-EU-legal-form-essential-boundary-author-successor-v2/whole-thirteen-social-Europe.DEEN-only-one-total-legal-form-absence-boundary.DRAFT-v2.json'
assert hashlib.sha256(author.read_bytes()).hexdigest()=='5487688a05686fc6d71c91acf1804d81adc8b69eeb4309c957d28807a6f5d0b1'
draft=json.load(open(author));released=copy.deepcopy(draft)
for g in released:assert g['examData']['reviewStatus']=='draft';g['examData']['reviewStatus']='released'
def save(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
save('whole-thirteen-foreign-scientific-KEEP-only-machine-reviewStatus-released.INERT.json',released)
intake=json.load(open(O/'intake-after-current568-SOCIAL-DRAFT-no-new-refs-no-science-or-status-approval.actual-native.json'))
before=json.load(open(O/'whole-current555-before-social13.exact.json'));after=json.load(open(O/'whole-current568-thirteen-social-DRAFT-three-Nav-before-foreign-science.INERT-preparation.json'))
gmap={g['id']:g for g in after['goals']};bm={g['id']:g for g in before['goals']}
for g in released:assert gmap[g['id']]==next(x for x in draft if x['id']==g['id']);gmap[g['id']]['examData']['reviewStatus']='released'
navs=json.load(open(O/'actual-three-existing-phase-local-Nav-fields-whole-before-after.DRAFT-preparation.author.json'))
for row in navs:
 g=gmap[row['goalId']]
 if row['goalId']=='1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc':
  compiled=next(x for x in intake['wholeCompiler']['goals'] if x['goalId']==row['goalId']);g['applicability']['jurisdiction']=compiled['compiledApplicability']['jurisdiction'];row['actualQualifiedCompiledChildunion']=compiled;row['changedJurisdictionFromActualChildUnion']=True
 if row['goalId']=='0fb8833c-4017-5052-819a-ecb5f6ebb36f':
  g['description']='Phasenlokale Übungen mit materialgestützten Aufgaben zu Globalisierung, Wechselkursen, Handelskonflikten, Außenwirtschaftspolitik, globaler Migration und den europäischen Grundfreiheiten. Die einzelnen Aufgaben behalten ihre eigenen vollständig bezeichneten Voraussetzungen und Kursgrenzen.'
  g['descriptionEn']='Phase-local practice with document-based tasks on globalisation, exchange rates, trade conflicts, external economic policy, global migration and the European four freedoms. Each task retains its own explicitly stated complete prerequisites and course limits.'
 row['wholeBefore']=bm[row['goalId']];row['wholeAfter']=copy.deepcopy(g);row['onlyContainsAndBilingualDescriptionsChanged']=not row.get('changedJurisdictionFromActualChildUnion',False)
save('actual-three-existing-phase-local-Nav-fields-and-one-actual-Q1-childunion-metadata.whole-before-after.author.json',navs)
save('whole-current568-thirteen-foreign-KEEP-three-Nav-one-derived-Q1-jurisdiction.INERT-final-author.json',after)
refs=collections.defaultdict(list);dec=[]
for mat in intake['actualMaterials']:
 g=mat['wholeMaterial'];assert not mat['wholeClosure']['unresolvedReferences']
 for s in mat['actual64Scopes']:
  eligible=s['countryCompatible'] and s['courseCompatible'] and not s['missingPrerequisites'];add=eligible and not s['materialCurrentlyVisible'];pure=eligible and not s['wholeCoveredTargetsPresent']
  dec.append(dict(materialId=g['id'],coveredGoalIds=g['examData']['coveredGoalIds'],wholeClosure=mat['wholeClosure'],**s,wholeEligible=eligible,authorDecision='AUTHOR_APPEND_WHOLE_PRACTICE_TARGET' if add else 'HELD_NO_REFERENCE',newAssessmentAboveExistingPOnly=pure,reason=('Parent expressly authorises this whole practice target over already visible prerequisiteOnly content; full mandatory closure, native country and course are compatible. Existing ordinary roles and source evidence remain unchanged.' if pure else 'Foreign whole scientific KEEP, exact current contract/P, compiled country, course and full visible mandatory closure agree.') if eligible else ('Whole c7b0 prerequisite not visible in this GK scope; held without widening ordinary goals, foundations or tags.' if s['countryCompatible'] and s['courseCompatible'] and s['missingPrerequisites'] else 'Compiled country or retained course tags exclude this whole material.'),independentScopeKEEP=False))
  if add and g['id'] not in refs[s['view']]:refs[s['view']].append(g['id'])
assert len(dec)==832 and sum(x['wholeEligible'] for x in dec)==376 and sum(x['newAssessmentAboveExistingPOnly'] for x in dec)==18
held=[x for x in dec if x['countryCompatible'] and x['courseCompatible'] and x['missingPrerequisites']];assert len(held)==28
save('actual-thirteen-whole-materials832-scope-decisions376-compatible18-existing-POnly28-held.author.json',dict(role='AUTHOR_SCOPE_POLICY_NOT_FOREIGN_APPROVAL',foreignWholeSciencePath=str(science.relative_to(R)),foreignWholeScienceSHA256=hashlib.sha256(science.read_bytes()).hexdigest(),parentExplicitlyPermitsEighteenPOnlyAssessmentBindings=True,decisions=dec,noOrdinaryOrSourceRoleExpansion=True))
(O/'whole-after35-views').mkdir(exist_ok=True);ix=[]
for p in sorted((O/'whole-before35-views').glob('*.json')):
 b=json.load(open(p));v=copy.deepcopy(b);ap='curricula/DE/Gymnasium/composition-views/wirtschaft/'+p.name;ids=refs[ap]
 if ids:
  assert v['scope']['stage']=='CrossStage' and len(v['rootNodes'])==1
  v['viewId']='de-gym-economics-social13-current555-'+p.stem.replace('de-','',1).replace('-gym-economics-','-')
  for id in ids:g=gmap[id];v['rootNodes'][0]['children'].append(dict(kind='goalEntry',goalId=id,displayLabel=g['title'],projectionRole='target'))
 out=O/'whole-after35-views'/p.name
 if ids:out.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
 else:out.write_bytes(p.read_bytes())
 ix.append(dict(activePath=ap,beforePath=str(p),afterPath=str(out),addedPracticeTargetIds=ids,actualNewReferenceCount=len(ids),onlyViewIdAndRootChildrenAppendChanged=bool(ids),existingRootChildrenExactOrderedPrefix=True,unchangedIfNoRefs=not ids))
country=sum(x['actualNewReferenceCount'] for x in ix if '-de-gym-' not in pathlib.Path(x['activePath']).name);national=sum(x['actualNewReferenceCount'] for x in ix if '-de-gym-' in pathlib.Path(x['activePath']).name)
assert country+national==209
save('actual-country-national209-practice-only-target-reference-appends.author-index.json',dict(role='AUTHOR_ACCESS_ONLY_NO_SELF_APPROVAL',views=ix,actualCountryReferences=country,actualNationalReferences=national,actualReferences=209,actualCompatibleWholeProjectionBindings=376,newAssessmentBindingsOverExistingPOnly=18,heldWholeClosureBindings28=True,newOrdinaryTargetOrPOnlyRoles=0,sourceScopeExpansion=0))
m['wholeScienceReceipt']=str(science.relative_to(R));m['wholeScienceSHA256']=hashlib.sha256(science.read_bytes()).hexdigest();m['wholeDRAFTBody']=str(author.relative_to(R));m['wholeDRAFTSHA256']=hashlib.sha256(author.read_bytes()).hexdigest();pathlib.Path('/tmp/economics-social13-author-B-path.json').write_text(json.dumps(m,indent=2)+'\n')
print('REFERENCES',country,national,'CHANGEDVIEWS',sum(bool(x['actualNewReferenceCount']) for x in ix),'bindings376/POnly18/held28')
