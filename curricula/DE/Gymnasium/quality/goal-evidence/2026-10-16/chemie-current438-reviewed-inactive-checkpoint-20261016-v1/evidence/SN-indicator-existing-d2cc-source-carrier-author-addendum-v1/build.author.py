import json,pathlib,hashlib,copy,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot'); B=R/'tmp/chemie-m7-resumed-20261016'; O=pathlib.Path(__file__).parent
L=B/'chemie-combined639-two-GK-priors-final-review-capsule-v1'; V2=B/'eight-empty-compiled-source-author-candidate-v2'
SID='sn-chem-seki-sn-ch-klassenstufe-8-lb5-035-01-d0f98a3c'; GID='d2ccd1d5-56f7-583f-9724-e97441367f91'
def pin(p):
 p=pathlib.Path(p);return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
canon=L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';cj=json.loads(canon.read_text());gi={g['id']:g for g in cj['goals']};g=gi[GID]
pp=L/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1/positive/d2cc.current-input-adoption.review.jsonl';pr=[json.loads(x) for x in pp.read_text().splitlines()];pr=next(x for x in pr if x['goalId']==GID)
sp=L/'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_CHEMIE_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json'
if not sp.exists():sp=next((L/'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction').glob('*.json'))
sj=json.loads(sp.read_text());sg=next(x for x in sj['sourceGoals'] if x['id']==SID)
v2cas=json.loads((V2/'CAS.guarded-thirty-one-whole-files.source8.AUTHOR.v2.inactive.json').read_text());ops=[];pairs=[]
rationale='AUTHOR-only separate SN indicator addendum after frozen source8 v2. The real indented LEFT-column experimental investigation of acidic solutions with indicators on physical PDF page 24 / printed page 12 remains curricular; the right-column SE does not turn it into an optional remark. Existing D2cc contributes indicator-specific observation, solution classification and coarse pH-range interpretation in suitable school experiments. Its unchanged full positive-evidence profile contains two fresh safely supplied observation/scale cases; these do not certify that the learner performed an experiment. This is a PARTIAL source binding for that experimental component, not complete execution evidence or whole-row/source-union clearance. E5 continues to cover only the introductory significance/use/handling component. All five older partial partner bindings are preserved exactly, without a new judgment of their full operators. No ordinary semantics, P body, image, memory, target set, stored selection or human approval changes.'
for op in v2cas['fileOperations']:
 if '/mapping/DE-SN/lower-secondary/' not in op['logicalPath']:continue
 p=R/op['after']['path'];before=json.loads(p.read_text());after=copy.deepcopy(before)
 old=[x for x in before['mappings'] if x['legacyGoalId']==SID];assert not any(x['canonicalGoalId']==GID for x in old)
 new={'legacyGoalId':SID,'canonicalGoalId':GID,'matchType':'partial','reviewDecisionId':SID}
 last=max(i for i,x in enumerate(after['mappings']) if x['legacyGoalId']==SID);after['mappings'].insert(last+1,new)
 bd=next((x for x in before.get('decisions',[]) if x['sourceGoalId']==SID),None)
 if bd:
  ad=next(x for x in after['decisions'] if x['sourceGoalId']==SID);ad['canonicalGoalIds'].append(GID);ad['rationale']=rationale
  assert ad['decision']=='pending_independent_review' and ad['reviewer']=='' and ad['reviewedAt']=='' and ad['wholeSourceUnionApproved']==False
 q=O/'after'/op['logicalPath'];dump(q,after)
 a0=copy.deepcopy(after);a0['mappings'].remove(new)
 if bd:a0['decisions'][next(i for i,x in enumerate(a0['decisions']) if x['sourceGoalId']==SID)]=copy.deepcopy(bd)
 assert a0==before
 ops.append({'logicalPath':op['logicalPath'],'before':pin(p),'after':pin(q),'selectedSourceGoalId':SID,'addedExistingCanonicalGoalId':GID,'change':'one additional partial mapping; selected decision targets/rationale only where present'})
 pairs.append({'logicalPath':op['logicalPath'],'beforeWholeSelectedMappings':old,'afterWholeSelectedMappings':old+[new],'beforeWholeSelectedDecision':bd,'afterWholeSelectedDecision':next((x for x in after.get('decisions',[]) if x['sourceGoalId']==SID),None)})
assert len(ops)==2
roleout=subprocess.check_output([str(R/'app/node_modules/.bin/tsx'),str(O/'check.roles.mts')],cwd=R,text=True)
roles=[json.loads(x) for x in roleout.splitlines()];assert len(roles)==2 and all(x['target'] and not x['prerequisiteOnly'] for x in roles)
dump(O/'INPUT.existing-d2cc-whole-prerequisite-positive-profile-and-SN-source.json',{'role':'AUTHOR evidence, not independent review','canonical':pin(canon),'wholeGoal':g,'wholeDirectPrerequisite':gi[g['requires'][0]],'wholePositiveEvidenceProfile':pr,'positiveProfileInput':pin(pp),'wholeSNSourceCell':sg,'SNSourceInput':pin(sp),'primaryPDF':pin(R/'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf'),'physicalPage':24,'printedPage':12,'actualOwnPageImage':pin(O/'SN.physical24.own.png')})
dump(O/'CAS.two-whole-SN-mapping-files.additive-AUTHOR.inactive.json',{'role':'AUTHOR-only inactive SN addendum; no review vote','dependsOnSealedSource8V2':pin(V2/'OUTPUTS.additive-HH-source-and-two-chapters-source8-v2.AUTHOR.selector.json'),'baselineCanonical':pin(canon),'baselineState':'source8 v2 proposed after-state; original L4 and all normal files unchanged','fileOperations':ops,'forbiddenWrites':['repository normal files','L4','sealed source8 v1/v2 history'],'wholeRowApproved':False,'humanApproval':False,'M7Claim':False})
dump(O/'CELLS.one-source-two-exact-selected-mapping-arrays.before-after.AUTHOR.json',{'sourceGoalId':SID,'existingGoalId':GID,'wholeSourceCell':sg,'pairs':pairs})
dump(O/'CHECK.bounded-two-files-unrelated-exactness-and-existing-target-roles.AUTHOR.json',{'fileCount':2,'newMappingEdges':2,'newCanonicalGoals':0,'changedOrdinaryBodies':0,'changedPositiveProfiles':0,'changedViews':0,'unrelatedJSONComponentsExact':True,'allPreviousSixPartialMappingsExact':True,'existingD2ccTargetRoles':roles,'ownStockRoleHelper':pin(R/'app/src/utils/authoring/compositionViewAuthoring.ts'),'ownStockRoleExitCode':0,'globalCompilerRuns':0,'newScienceReviewVotes':0,'RorL4Writes':0})
(O/'README.AUTHOR-source-component-boundary.md').write_text('# Separater SN-Autoren-Nachtrag\n\nAbhängigkeit: versiegelter Source8-v2-Nachzustand. Nur zwei Mapping-Dateien; beide SN-Views enthalten D2cc bereits als echtes Target. Die fünf alten Partner und E5 bleiben exakt partial. D2cc trägt die indikatorbezogene Beobachtung/Auswertung bei. Seine beiden unveränderten P-Fälle sind bereitgestellte Beobachtungen und beweisen keine eigene Versuchsdurchführung. Deshalb keine Vollfreigabe der experimentellen Komponente, der zusammengesetzten Quellzelle oder der fünf alten Partner. Kein neuer Ordinary-Inhalt, kein D/P-Neustart, kein eigener unabhängiger Vote. Nur in einen separat autorisierten privaten TMP-Klon nach v2 integrieren; R/L4 und alte Selector/FIRST-Dateien bleiben unverändert.\n')
sel={'role':'Sealed separate AUTHOR proposal; independent root/B review pending','scope':'one actual SN left-column indicator component; existing D2cc carrier','guardedCAS':pin(O/'CAS.two-whole-SN-mapping-files.additive-AUTHOR.inactive.json'),'wholeCellPairs':pin(O/'CELLS.one-source-two-exact-selected-mapping-arrays.before-after.AUTHOR.json'),'actualInputs':pin(O/'INPUT.existing-d2cc-whole-prerequisite-positive-profile-and-SN-source.json'),'boundedCheck':pin(O/'CHECK.bounded-two-files-unrelated-exactness-and-existing-target-roles.AUTHOR.json'),'instructions':pin(O/'README.AUTHOR-source-component-boundary.md'),'counts':{'wholeAfterFiles':2,'sourceComponents':1,'additionalPartialEdges':2,'viewChanges':0,'ordinaryChanges':0,'reviewVotes':0},'wholeExperimentalExecutionClearance':False,'wholeSourceRowClearance':False,'RorL4Writes':False,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
dump(O/'OUTPUTS.SN-existing-indicator-carrier-addendum.AUTHOR.selector.json',sel)
print(json.dumps(pin(O/'OUTPUTS.SN-existing-indicator-carrier-addendum.AUTHOR.selector.json')))
