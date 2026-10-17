import json,hashlib,pathlib,datetime,copy
B=pathlib.Path('tmp/chemie-m7-resumed-20261016');R=B/'HE-admission-current-independent-a-v2';C=B/'HE-admission-A-B-informed-author-successor-v2';V1=B/'HE-admission-author-candidate-v1'
def read(p):return json.loads(pathlib.Path(p).read_text())
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,x):
 p=R/n;assert not p.exists(),p;p.write_text((json.dumps(x,ensure_ascii=False,indent=2)+'\n') if not isinstance(x,str) else x);return pin(p)
def fp(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
first=R/'FIRST.exact-nine-whole-five-view-v2-targeted-followup.independent-a.science.frozen.json';assert pin(first)['sha256']=='sha256:fa0d078eae16c83c901fb30ff0d6e82ea93475ef7b6b8dbd527492d5cb9e3cad'
g=read(C/'CAS.nine-selected-WHOLE-goals.A-B-informed-AUTHOR-v2.inactive.json');old=read(V1/'CAS.seven-selected-WHOLE-goals.AUTHOR.inactive.json');oldby={o['goalId']:o['after'] for o in old['operations']};base=read(g['baseCanonical']['path']);baseby={x['id']:x for x in base['goals']}
for o in g['operations']:assert o['before']==baseby[o['goalId']]
retained=[];exam=[];contexts=[]
for o in g['operations']:
 i=o['goalId']
 if i.startswith(('17ab','9fef','b8d3','d92')):assert o['after']==oldby[i];retained.append(i)
 if i.startswith(('145','327')):
  assert o['before']['examData']==o['after']['examData']==oldby[i]['examData'];exam.append({'goalId':i,'wholeExamDataExact':True,'directPriorCount':len(o['after']['requires'])})
 if i.startswith(('0cf2','cf270')):
  a=copy.deepcopy(o['after']);a['requires']=o['before']['requires'];assert a==o['before'];contexts.append({'goalId':i,'onlyRequiresChanged':True,'before':o['before']['requires'],'after':o['after']['requires']})
bv=read(C/'CAS.ONE-BY-LK-WHOLE-view-existing-cf270-actual-TARGET.AUTHOR-v2.inactive.json');added=[]
def prune(n):
 n=copy.deepcopy(n)
 if n.get('kind')=='goalEntry' and n.get('goalId')=='cf270aaf-235a-55a7-94a2-c4d9d7570a6b':added.append(n);return None
 if 'children'in n:n['children']=[y for x in n['children'] if (y:=prune(x)) is not None]
 if n.get('id')=='de-by-lk-natural-macromolecules-detection-existing-biuret':
  assert n['label']=='Aminocarbonsäuren und Peptide: Nachweise';assert n['children']==[{'kind':'goalEntry','goalId':'5c8f0bbb-103a-579f-87fc-c997afe4fd18'}];return n['children'][0]
 return n
bv_removed=copy.deepcopy(bv['after']);bv_removed['rootNodes']=[prune(n) for n in bv['after']['rootNodes']];assert len(added)==1;assert bv_removed==bv['before']
bs=read(C/'CAS.ONE-BY-source-WHOLE-cell-preserve-5c8-add-cf270-partial.AUTHOR-v2.inactive.json');assert bs['after']['mappings'][:-1]==bs['before']['mappings'];assert bs['after']['mappings'][-1]['canonicalGoalId']=='cf270aaf-235a-55a7-94a2-c4d9d7570a6b';assert bs['after']['mappings'][-1]['matchType']=='partial';assert bs['after']['decision']['authorProposal']['historicalWholeDecision']==bs['before']['decision']
a=read(C/'CAS.seven-common-aromatic-WHOLE-cells.V1-science-retained-L5-inputs.AUTHOR-v2.inactive.json');oa=read(V1/'CAS.seven-aliases-ONE-common-aromatic-WHOLE-source-cell.AUTHOR.inactive.json');assert len(a['operations'])==7
for n,p in zip(a['operations'],oa['operations']):assert n['after']==p['after']
facts=read(R/'FACTS.actual-five-view-role-filter-and-428-two-card-selection.independent-a.json');assert len(facts['views'])==5;assert all(x['actual428AcquisitionDirectPriorsTarget'] for x in facts['views']);assert [c['id'] for c in facts['actual428Cards']]==['chem_nat_q2_003','chem_nat_q2_004']
check=write('CHECK.actual-selected-wholes-and-five-view-bounded-exactness.independent-a.json',{'role':'Own bounded mechanical facts after frozen science; no new science votes or global closure claim','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'FIRST':pin(first),'allNineBeforeWholesMatchPinnedBase':True,'fourWholeAfterContextsByteSemanticExactV1':retained,'twoWholeExamDataExactAndCounts':exam,'twoActualNewOrdinaryContextsOnlyRequiresChanged':contexts,'BYLKOnlyOneActualAddedTargetEntry':added,'BYLKOnlyContextWrapperAroundExisting5c8AndNewcf270':True,'BYOld5c8WholeMappingRowAndDecisionHistoryExact':True,'BYNewcf270MappingPartial':True,'sevenAromaticSelectedAfterCellsExactOriginalV1Science':True,'fiveActual428DirectAcquisitionContextsValid':True,'actual428SelectedCardsExact':['chem_nat_q2_003','chem_nat_q2_004'],'confirmedMissing801BYLKPreservedAsREVISE':True,'global39ScopeScan':False,'RorCapsuleWrites':False,'HumanApproval':False,'M7Claim':False})
handoff=write('HANDOFF.exact-HE-v2-bounded-independent-a.md','''# HE admission V2 — unabhängiger A-Nachtrag

**REVISE des begrenzten Gesamtpakets.** Die eigene FIRST wurde vor diesem Handoff versiegelt. Der globale Wechsel `0cf2 → 801` ist fachlich passend; im tatsächlich betroffenen BY-LK ist 0cf2 Target, 801 jedoch weder Target noch Support. Dieser neue Anschlussfehler braucht einen separaten passenden Autor-Nachfolger. Die alten drei BY-Vorwissenslücken werden nicht als behoben ausgegeben. Eine später vom Root gemeldete zusätzliche 4bdb-Lücke gehört zu dessen separater Diagnose; die eigene FIRST bleibt unverändert.

**KEEP der gezielten fachlichen Korrekturen:** HE-GK entfernt die zu breite Zweite-Hauptsatz- und Ninhydrinpflicht; HE-LK entfernt Formgebungsverfahrensroutine und selbstständige quantitative Parabenanalytik. Die tatsächlichen gemeinsamen Operatoren bleiben erhalten. Beide vollständigen neuen P-Kontexte 0cf2 und cf270 tragen die engeren fachlichen Vorbedingungen. Die beiden 44/27-Prüfungsinhalte und die früheren Inhaltsurteile bleiben exakt.

428 bleibt Memory mit genau den bestehenden Karten003/004. 197+cf270 bieten in allen fünf tatsächlichen Kontexten die passende Akquisition; historische Kartentags sind keine neue Ninhydrinpflicht. Die eine BY-LK-cf270-Platzierung und die neue PARTIAL-Quellbindung sind passend; die alte breite 5c8-Bindung wird dadurch nicht neu voll freigegeben. Sieben Aromaten-Afterzellen sowie17ab/9fef/b8d3/d92 bleiben echte frühere Science.

GK8721 bleibt ausdrücklich HOLD, getrennt vom neuen459. Daher keine positive Gesamtzulassung aus153/229, kein NativeD für Prüfungen, keine M7- oder Humanfreigabe. Kein vollständiger Compiler oder globaler Gate-Lauf; keine R-/Kapseländerung und keine Peer-B-V2-Meinung gelesen.
''')
selector=write('OUTPUTS.exact-HE-v2-bounded-independent-a.sealed.selector.json',{'role':'NONAUTHOR independent A bounded V2 followup; no whole-route release','candidateSelector':pin(C/'OUTPUTS.nine-wholes-five-views-A-B-informed-author-v2.selector.json'),'FIRST':pin(first),'boundedActualFacts':pin(R/'FACTS.actual-five-view-role-filter-and-428-two-card-selection.independent-a.json'),'boundedExactnessCheck':check,'handoff':handoff,'outcome':'REVISE: new actual BY-LK0cf2→801 missing scoped prior; positive targeted science retained; GK8721 still OPEN','wholeMachineContentReleaseReadiness':False,'currentPeerBOpinionsRead':False,'newNativeDCount':0,'newOrdinaryCompletionCount':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False,'RorCapsuleWrites':False})
print(json.dumps(selector))
