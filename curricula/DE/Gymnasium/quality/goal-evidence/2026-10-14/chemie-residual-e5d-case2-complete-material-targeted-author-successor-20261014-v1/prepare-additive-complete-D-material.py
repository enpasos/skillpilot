# Apache-2.0 technical builder. Own case material is CC-BY-4.0.
import copy,datetime,hashlib,json,os,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
B=O.parent/'chemie-source-six-original-residual-duty-author-20261014-v1'
J=O.parent/'chemie-residual-six-original-duties-whole-P2-AM-kind-independent-root-20261014-v1'
rd=lambda p:json.loads(p.read_text());now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
wr('STARTED.actual.json',{'schemaVersion':1,'startedAt':now(),'role':'Same residual-duty AUTHOR corrects concrete missing supplied D card; no independent vote','priorOwnAuthorshipDisclosed':True,'HReadOnly':True,'activeGitEngineWrites':False})
first=J/'FIRST-SCIENCE-SEAL.original-six-P2-whole-AM-kind-root.actual.json';verdict=R/rd(first)['scientificRecord']['path'];assert sha(verdict)==rd(first)['scientificRecord']['sha256']
original=B/'cases/two-pending-whole-goals-four-complete-DEEN-cases.author.json';before=rd(original);after=copy.deepcopy(before);gid='e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd'
g=next(g for g in after['goals']if g['goalId']==gid);c=next(c for c in g['cases']if c['id']=='case-2');old=copy.deepcopy(c)
old_de='Neue Karten: D ist eine wässrige Citronensäurelösung mit gegebener Entkalkungsanwendung und Umgangsregeln für die konkrete Schulprobe.'
old_en='New cards: D is aqueous citric acid with a supplied descaling use and handling rules for this school sample.'
assert c['materialDe'].startswith(old_de)and c['materialEn'].startswith(old_en)
new_de='''Neue Karten, ausschließlich theoretisches Aufgabenmaterial, kein auszuführender Versuch. Vollständige Stoff-/Umgangskarte D: D ist eine wässrige Citronensäurelösung; Citronensäure ist der Säurebestandteil und Wasser das Lösemittel. Gegebene Verwendung: Lösen geeigneter Kalkablagerungen auf dafür geeignetem säurebeständigem Material nach einer dazugehörigen Anweisung; keine allgemeine Produkt- oder Oberflächenfreigabe. Für die konkrete gedachte Schulprobe sind folgende Hinweise und Regeln vollständig bereitgestellt. D1: Die abgefüllte Probe ist eine Chemikalienprobe für Unterrichtszwecke, kein Lebensmittel; nicht probieren oder verschlucken und keine Hautprobe machen. D2: Augen- und Hautkontakt vermeiden; falls die Probe später tatsächlich im betreuten Unterricht eingesetzt wird, nur die von der Lehrkraft freigegebene Probe nach der vorliegenden Arbeitsanweisung verwenden und die dort vorgegebene Schutzbrille tragen. D3: Keine unbekannten Reiniger oder anderen Stoffe beimischen; die Entkalkungsanwendung allein begründet keine Mischung oder andere Verwendung. Diese vorgegebenen Umgangshinweise sind keine Behauptung, jede Citronensäurelösung habe dieselbe Konzentration, Gefahreneinstufung oder Handhabung. In dieser Aufgabe werden die Regeln nur anhand der Karte zugeordnet und begründet; niemand muss die Probe herstellen, anfassen, untersuchen oder den Entkalkungsvorgang ausführen.'''
new_en='''New cards, theoretical task material only, with no experiment to perform. Complete substance/handling card D: D is aqueous citric acid; citric acid is the acid component and water the solvent. Supplied use: dissolving suitable limescale deposits on suitable acid-resistant material under the corresponding instruction; no general product or surface authorization. The following information and rules are fully supplied for this imagined school sample. D1: The portioned sample is a classroom chemical sample, not food; do not taste or swallow it and do not test it on skin. D2: Avoid eye and skin contact; if the sample is later actually used in supervised lessons, use only the teacher-approved sample under the supplied instruction and wear the protective goggles specified there. D3: Do not mix in unknown cleaners or other substances; a descaling use alone justifies neither mixing nor a different use. These supplied handling instructions do not claim that every citric-acid solution has the same concentration, hazard classification or handling. This task only asks for matching and explaining the card rules; nobody must prepare, touch, investigate or carry out descaling with the sample.'''
c['materialDe']=c['materialDe'].replace(old_de,new_de,1)+' F-Informationsgrenze: Die einzelnen Bestandteile und konkreten Gefahrenhinweise von F werden hier nicht angegeben. Zu F wird ausschließlich beurteilt, ob aus demselben groben pH bereits dieselbe Verwendung und Handhabung folgt. Keine bestimmte Gefahr, Schutzmaßnahme, Anwendung oder tatsächlich durchzuführende Untersuchung für F wird verlangt oder kann aus dem Material erfunden werden.'
c['materialEn']=c['materialEn'].replace(old_en,new_en,1)+' F information limit: Individual ingredients and specific hazard statements for F are not supplied here. The only judgment about F is whether the same broad pH already establishes identical use and handling. No particular hazard, protective measure, use or actual investigation for F is required or can be invented from this material.'
out=wr('candidate/four-whole-DEEN-cases.only-e5d-case2-material-D-completed.author.json',after)
assert {k:v for k,v in c.items()if k not in('materialDe','materialEn')}=={k:v for k,v in old.items()if k not in('materialDe','materialEn')}
for oldg,newg in zip(before['goals'],after['goals']):
 assert oldg['wholeGoal']==newg['wholeGoal']
 for a,b in zip(oldg['cases'],newg['cases']):
  if oldg['goalId']!=gid or a['id']!='case-2':assert a==b
profiles=B/'P/two-whole-goal-author-E0-G0.profiles.jsonl'
ownrefs=[]
for p,n in [(profiles,'inputs/two-original-P2-profile-records.unchanged-reference.jsonl'),(B/'candidate/canonical536.prospective409-six-residual-duties.author-only.json','inputs/canonical536.prospective409.original-unchanged.json'),(B/'inputs/semantic533.current407.immutable-hardlink.json','inputs/semantic533.original-unchanged.json')]:
 q=O/n;q.parent.mkdir(parents=True,exist_ok=True);os.link(p,q);ownrefs.append(bind(q))
wr('CAS.exact-e5d-case2-two-material-fields-completed-no-other-case-or-profile-body-change.json',{
 'schemaVersion':1,'role':'Unreviewed targeted author successor; not independent acceptance','beforeWholeCarrier':bind(original),'afterWholeCarrier':bind(out),
 'goalId':gid,'caseId':'case-2','allowedChangedFields':['materialDe','materialEn'],'wholeBeforeCase':old,'wholeAfterCase':c,
 'allOtherThreeCasesExact':True,'c307BothWholeCasesAndGoalExact':True,'e5dCase1Exact':True,'taskModelAnswerRubricTransferAndScoreLimitsExact':True,
 'wholeGoalDescriptionsRequiresApplicabilityAndResourcesExact':True,'originalP2ProfileBodiesUnchanged':True,
 'whyFIsNotAnotherMissingRequiredCard':'Its only required inference is the insufficiency of equal coarsepH. No unspecified F hazard classification, protection or use must be derived.',
 'modelAndRubricApplicationWitness':{'D1':'Chemical classroom sample rather than food explains no tasting/swallowing/skin test.','D2':'The supplied contact-avoidance rule and conditional supervised-use instruction provide the exact rule to match; no unprovided hazard class is inferred.','D3':'Supplied no-mixture rule is matched to the bounded descaling use; use does not establish general harmlessness or a new authorized mixture.','F':'Same coarsepH is insufficient for identical composition/use/handling; further data would be needed for particular F claims.'},
 'historicalIndependentFirstScience':bind(first),'actualMissingMaterialFinding':{'PDecision':'HOLD_missing_actual_second_case_material','rootScientificRecord':bind(verdict)},
 'newIndependentVotes':0,'newPClosure':False,'newPracticalExecution':False,'HReadOnly':True,'activeEngineGitWrites':False})
criteria=O/'P/criteria.material-only-e5d-successor.E0-G0.md';criteria.parent.mkdir(exist_ok=True)
criteria.write_text(f'''# Targeted e5d case2 complete-material AUTHOR successor

CC-BY-4.0. Read the exact unchanged whole goal and both full e5d cases in:
{out.relative_to(R)}
SHA: {sha(out)}

Only case2 materialDe/materialEn have changed. D now actually supplies its substance,
bounded descaling use and three handling rules. Match and justify the supplied rules;
do not infer unprovided hazard classifications or perform an experiment. F only tests
the insufficiency of equal coarse pH for equal use/handling; no particular unknown F
hazard, rule or application is to be invented. Source/course/partner and actual d2
experimental obligations remain separate. Preserve all complete original goal aspects,
both cases/model answers/rubrics and profile body. Require meaningful information-limit
transfer, without an extra task quota. This is an unexecuted E0/G0 author candidate;
targeted independent material review is still required. Original positive c307 science,
A/M/kind/source judgments are not replaced or automatically granted to this material.
''')
wr('INPUTS.exact-targeted-material-author-successor-and-unchanged-history.json',{'schemaVersion':1,'originalNeutral':bind(B/'NEUTRAL.exact-six-original-duty-source-goal-view-author-inputs.json'),'originalSeal':bind(B/'SEAL.finite-six-original-residual-duty-author.actual.json'),'historicalIndependentRootScienceFirstSeal':bind(first),'historicalIndependentScientificRecord':bind(verdict),'newWholeCarrier':bind(out),'ownOriginalReferences':ownrefs,'newCriteria':bind(criteria),'authorOnly':True,'noNewIndependentAcceptance':True,'HReadOnly':True})
print(json.dumps({'wholeCases':4,'changedCases':1,'changedFields':2,'allOtherThreeCasesExact':True,'profileBodiesChanged':0,'newMaterialIndependentReviewPending':True,'material':bind(out)},ensure_ascii=False))
