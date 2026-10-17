import collections, datetime, hashlib, json, pathlib

OUT=pathlib.Path(__file__).parent
BASE=OUT.parent/'current439-requires-closure-source-surrogate-neutral-preparation-technical-v1'
SELECTOR=BASE/'SELECTOR.clean-current437-requires-closure-independent-science-inputs.sealed.json'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pin(p):
    p=pathlib.Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def write(name,x):
    with (OUT/name).open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')

before=json.loads((OUT/'INPUT-GUARDS.before.json').read_text())
after=[]
for p in before['pins']:
    actual=sha(p['path']);after.append({'path':p['path'],'expected':p['expected'],'actual':actual,'match':actual==p['expected']})
assert all(p['match'] for p in after)
write('INPUT-GUARDS.after.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'selectorSHA256':sha(SELECTOR),'pins':after,'errors':[],'all47InputPinsUnchanged':True})
selector=json.loads(SELECTOR.read_text())
neutralGuards=json.loads(pathlib.Path(selector['sourceGuards']['path']).read_text())
guards=[]
for p in neutralGuards['guards']:
    actual=sha(p['path']);guards.append({'path':p['path'],'expectedSealedNeutralBaselineSHA256':p['sha256'],
        'actualAfterReviewSHA256':actual,'match':actual==p['sha256']})
assert len(guards)==198 and all(g['match'] for g in guards)
write('SOURCE-GUARDS.verified-readonly.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'comparisonMeaning':'After-review verification against the sealed neutral technical source-guard baseline; not a claim of a separately captured B before-state for these 198 paths.',
      'neutralGuardFile':pin(selector['sourceGuards']['path']),'sourceGuardCount':len(guards),
      'guards':guards,'allUnchanged':True,'changedPaths':[],
      'sourceCanonicalMappingRegistryGateWrites':0,'MainWrites':0,'KWrites':0,'fullBuilds':0,'fullStatusRuns':0})

physical=json.loads((OUT/'FIRST-PHYSICAL-EDGE-DECISIONS.frozen.json').read_text())['groups']
pairs=json.loads((OUT/'FIRST-JURISDICTION-PAIR-DECISIONS.frozen.json').read_text())['pairs']
groups=json.loads((OUT/'FIRST-GROUP-AND-JURISDICTION-DECISIONS.frozen.json').read_text())['groups']
roster=json.loads((OUT/'FIRST-REVIEW-ROSTER.frozen.json').read_text())['groups']
readIds=set(json.loads((OUT/'READ-GOAL-IDS.json').read_text()))
goalIds={p[k] for p in physical for k in ('prerequisiteGoalId','directDependentGoalId')}
assert len(pairs)==315 and len({r['pairKey'] for r in pairs})==315
assert len(physical)==len(groups)==len(roster)==83
assert sum(len(g['jurisdictionJudgments']) for g in groups)==323
assert [p['reviewGroupId'] for p in physical]==[g['reviewGroupId'] for g in groups]==[g['reviewGroupId'] for g in roster]
assert all({k:g[k] for k in p}==p for p,g in zip(physical,groups))
assert len(goalIds)==111 and goalIds<=readIds
assert collections.Counter(p['decision'] for p in pairs)=={'approve':54,'hold':120,'reject':141}
assert sum(bool(p['knownOpenSourceFlags']) for p in pairs)==65
assert all(p['decision']=='hold' for p in pairs if p['knownOpenSourceFlags'])
assert all(e['physicalNecessityDecision']=='approve' for p in pairs if p['decision']=='approve' for e in p['everyIntermediateEdgeJudgment'])
assert all(p['sourceOriginalReading']['originals'] and all(o.get('url') for o in p['sourceOriginalReading']['originals']) for p in pairs if p['decision']=='approve')
assert all(p['selectedEndpointAnchor']['anchorId'] and p['selectedEndpointAnchor']['sourceCellSHA256'] for p in pairs)
assert all(not p['actualLearnerPerformanceCertified'] and not p['M7Passed'] and not p['directOfficialPrerequisiteClaim'] for p in pairs)
write('REVIEW-COMPLETENESS-CHECK.frozen.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'status':'pass','checks':{'exact83FirstGroupIdsPreserved':True,'all111PhysicalCompetenciesAndProfilesRead':True,
      'all315DistinctJurisdictionPairsJudged':True,'all323GroupDocketsJudged':True,
      'all65FlaggedPairsHeld':True,'everyApprovedSelectedIntermediateEdgeApproved':True,
      'everyApprovalHasExactOriginalPinOfficialURLAndNarrowPageOrClauseFinding':True,
      'noM7DirectOfficialPrerequisiteOrLearnerPerformanceClaim':True,
      'clean47PinsUnchanged':True,'neutral198SourceGuardsUnchanged':True},
      'firstVerdictsUnchanged':True,'locatorErrataExplicitAndVerdictsUnchanged':True,
      'limitations':'This is finite scientific B review of selected candidates and explicitly checked same-endpoint alternatives. It is not a full-build test, source registry activation, exhaustive alternative-route search, or native blind-D manifest.'})

portableNames=['FIRST-REVIEW-ROSTER.frozen.json','FIRST-PHYSICAL-EDGE-DECISIONS.frozen.json',
 'FIRST-SOURCE-READING-DECISIONS.frozen.json','SOURCE-READING-LOCATOR-ERRATA.frozen.json',
 'FIRST-JURISDICTION-PAIR-DECISIONS.frozen.json','FIRST-GROUP-AND-JURISDICTION-DECISIONS.frozen.json',
 'FIRST-SCIENTIFIC-B-SUMMARY.frozen.json','ADDITIONAL-ORIGINAL-PRIMARY-LOCATORS.frozen.json',
 'INPUT-GUARDS.before.json','INPUT-GUARDS.after.json','SOURCE-GUARDS.verified-readonly.json',
 'REVIEW-COMPLETENESS-CHECK.frozen.json','REVIEW.independent-b-FIRST.md',
 'author_physical.py','author_source_judgments.py','compose_first_review.py','seal_review.py']
summary=json.loads((OUT/'FIRST-SCIENTIFIC-B-SUMMARY.frozen.json').read_text())
final={'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'role':'fresh-independent-Chemistry-scientific-B-FIRST-source-surrogate-necessity-review',
 'cleanInputSelector':pin(SELECTOR),'readFirst':pin(OUT/'REVIEW.independent-b-FIRST.md'),
 'firstGroupAndJurisdictionJudgments':pin(OUT/'FIRST-GROUP-AND-JURISDICTION-DECISIONS.frozen.json'),
 'firstDistinctPairJudgments':pin(OUT/'FIRST-JURISDICTION-PAIR-DECISIONS.frozen.json'),
 'portableOwnReviewArtifacts':[pin(OUT/name) for name in portableNames],
 'exactOriginalSourcePartners':selector['exactLocalPrimaryPartners'],
 'additionalOriginalPinsURLsAndNarrowClauses':json.loads((OUT/'ADDITIONAL-ORIGINAL-PRIMARY-LOCATORS.frozen.json').read_text()),
 'portablePayloadExclusions':['primary-text/','primary-cache/','__pycache__/','PRIMARY-TEXT-INDEX.json'],
 'exclusionReason':'Whole primary text/HTML/image copies remain local unsealed working caches. Portable proof uses original hashes, official URLs and narrow page/clause findings.',
 'scientificSummary':summary,
 'positiveScientificAcquisitionSupportPairKeys':[p['pairKey'] for p in pairs if p['decision']=='approve'],
 'sourceRegistryAcceptedRowsWritten':0,'sourceABAcceptanceClaimed':False,'M7Passed':False,
 'sourceCanonicalProfileMappingRegistryGateWrites':0,'MainWrites':0,'KWrites':0,
 'newCompilerRuns':0,'fullBuilds':0,'fullStatusRuns':0,'otherReviewerOrCorrectorOutputsRead':False,
 'allFirstJudgmentsPreserved':True,'finalSelectorDoesNotSelfHash':True}
write('SELECTOR.independent-b-FIRST.sealed.json',final)
print(json.dumps({'selector':str(OUT/'SELECTOR.independent-b-FIRST.sealed.json'),
 'sha256':sha(OUT/'SELECTOR.independent-b-FIRST.sealed.json'),'guard47':True,'guard198':True,
 'groups':83,'groupDockets':323,'pairs':315,'approve':54,'hold':120,'reject':141},indent=2))
