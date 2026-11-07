import json,pathlib,uuid,copy,os
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');C=W/'candidate';A=json.loads((W/'shared-author-input.json').read_text());ids=json.loads((W/'source-new-id-map.json').read_text());hestate='c1a02ddd-736d-4975-920b-18b03aff147f'
def load(n):return json.loads((C/n).read_text())
def save(n,d):
 p=C/n;t=p.with_name(p.name+'.private-new');t.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');os.replace(t,p)
ledger=[]
for state,prefix in [('HE','hessen'),('SH','sh')]:
 p=f'curricula/DE/Gymnasium/mapping/DE-{state}/upper-secondary/{prefix}_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json';d=load(p)
 oldsummary=copy.deepcopy(d['summary']);affected=set()
 if state=='HE':
  by={x['goalId']:x for x in A['goalByGoal']['records']}
  for edge in d['mappings']:
   record=by.get(edge['canonicalGoalId']);old=copy.deepcopy(edge)
   if record:
    sourceids=[s for s in record['sourceIds']if s.startswith('HE-')]
    full=record['HE_GK_2027_2028']['decision'] in ['direct_mandatory_named_cohort','direct_basic_topic_not_selected','explicit_increased_level']
    if not full:edge['matchType']='partial'
    edge['authorPrimaryJudgment']={'reviewStatus':'draft','sourceIds':sourceids,'wholeGoalPrimarySupport':full,'cohortSelectionSeparateFromBasicTopicLevel':True,'rationale':record['HE_GK_2027_2028']['reason']};affected.add(edge['legacyGoalId']);ledger.append({'state':state,'canonicalGoalId':edge['canonicalGoalId'],'sourceGoalId':edge['legacyGoalId'],'before':old,'after':copy.deepcopy(edge)})
  for goal,source in ids.items():
   d['decisions'].append({'sourceGoalId':source,'decision':'mapped','canonicalGoalIds':[goal],'matchType':'exact','rationale':'Explicit newly extracted bounded primary performance; see primary passage pin. This is an author draft, no independent A/M acceptance.','reviewedAt':'2026-11-07','reviewer':'Codex author draft','reviewStatus':'draft'})
  affected.update(ids.values())
  d['summary'].update(sourceGoals=159,reviewedSourceGoals=155,seedMappedSourceGoals=155,mappedSourceGoals=159,exactMappings=sum(x['matchType']=='exact'for x in d['mappings']),partialMappings=sum(x['matchType']=='partial'for x in d['mappings']))
 else:
  for edge in d['mappings']:
   if '-db'in edge['legacyGoalId']:
    affected.add(edge['legacyGoalId']);edge['authorPrimaryJudgment']={'reviewStatus':'draft','levelClaim':'Read the corrected extraction visual row/aspect binding; old full match cannot establish basic entitlement by itself.'};ledger.append({'state':state,'sourceGoalId':edge['legacyGoalId'],'canonicalGoalId':edge['canonicalGoalId'],'matchType':edge['matchType'],'reviewStatus':'draft'})
 for decision in d['decisions']:
  if decision.get('sourceGoalId') in affected:
   decision['historicalSeedDecision']=copy.deepcopy({k:v for k,v in decision.items()if k not in ['historicalSeedDecision']});decision['reviewStatus']='draft';decision['rationale']='Author repair draft: source/level assertions require independent review; original seed rationale retained in historicalSeedDecision.'
 d['status']='incomplete';d['repairDraft'].update(historicalSummary=oldsummary,affectedSourceGoalIds=sorted(affected),noApprovalInferred=True);save(p,d)
# Align HE side mapping entries to actual review and new source paths without altering preserved historical snapshot.
p='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_informatics_upper_secondary_to_canonical_informatics.json';d=load(p);r=load('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json');judged={(x['legacyGoalId'],x['canonicalGoalId']):x for x in r['mappings']}
for e in d['mappings']:
 if (e['legacyGoalId'],e['canonicalGoalId'])in judged:
  j=judged[(e['legacyGoalId'],e['canonicalGoalId'])];e['matchType']=j['matchType']
d['repairDraft']['reviewStatus']='draft';save(p,d)
# Registry now points to primary PDF and preserves the genuine old authored snapshot as archive.
p='curricula/DE/Gymnasium/provenance/source-landscape-registry.json';d=load(p);e=next(x for x in d['entries']if x['landscapeId']==hestate);e['previousSourcePath']=e['sourcePath'];e['sourcePath']='curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-informatik.pdf';e['sourceUrl']='https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kernkurriculum_gymnasiale_oberstufe-informatik.pdf';e['sourceSha256']='af0234cb868eafdc459d2e85e96e7ebf1459accaa74e9d34bc4beaf937042f85';e['sourceVersion']='Ausgabe2024,Stand01.08.2025';e['repairReviewStatus']='author-draft';save(p,d)
# Derived mixed row records are kept, with explicit basic fragment denominator added rather than silently deleting SQL basic evidence.
p='curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_INFORMATIK_SEKII_FACHANFORDERUNGEN_2021.source-extraction.json';d=load(p);model=next(x for x in d['sourceGoals']if '-db3-2-'in x['id']);n=copy.deepcopy(model);n.update(id='de-sh-informatik-sekii-fa2021-db3-basic-select-join-repair-20261107',title='DB3: grundlegende SQL-Abfragen ohne Unterabfrage',description='SQL SELECT FROM WHERE und Joins formulieren und anwenden.',sourceText='SQL SELECT FROM WHERE und Joins formulieren und anwenden.',courseLevel='GK/LK',sourceSpan='gedruckt46,DB3,ungegraute SQL-Elemente',aspectIndex=3,rawSourceText='mithilfe von SQL-Befehlen; select from where; joins',canonicalTargetIds=['fd1f5c79-20e6-5829-98c1-0909e047cad4'],reviewStatus='author-draft');n['tags']=[*n['tags'],'primary-fragment:basic'];n.pop('primaryLevelEvidence',None);d['sourceGoals'].append(n);d['repairDraft']['mixedRowSplit']={'retainedCombinedRecord':model['id'],'newBasicFragment':n['id'],'notFullCanonicalGoalEntitlement':'Sorting is not asserted by this fragment; mapping remains partial.'};save(p,d)
p='curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_informatics_upper_secondary_source_extraction_to_canonical_informatics.review.json';d=load(p);d['mappings'].append({'legacyGoalId':n['id'],'canonicalGoalId':'fd1f5c79-20e6-5829-98c1-0909e047cad4','matchType':'partial','reviewDecisionId':n['id']});d['decisions'].append({'sourceGoalId':n['id'],'decision':'mapped','canonicalGoalIds':['fd1f5c79-20e6-5829-98c1-0909e047cad4'],'matchType':'partial','rationale':'Basic SELECT/WHERE/Join primary fragment; full canonical goal also contains sorting.','reviewStatus':'draft','reviewer':'Codex author draft'});d['summary']['sourceGoals']=124;d['summary']['mappedSourceGoals']=124;d['summary']['partialMappings']+=1;save(p,d)
(W/'source-pair-author-judgments.json').write_text(json.dumps({'status':'author-draft pending independent source review','noActiveSourceChanges':True,'ledger':ledger,'retainedNF3GlobalGK':'NRW GK pp27–29 + ST Kurs2; HE source remains elevated. No global tag removal.','SHVisualRule':'Printed37; PDF48/49 inspected. DB6/8/10/11/12/13/15 elevated; DB3 only subqueries elevated; DB4 SQL implementation elevated, interface-only manipulation basic.'},ensure_ascii=False,indent=2)+'\n')
print('source/mapping/registry author draft coherent')
