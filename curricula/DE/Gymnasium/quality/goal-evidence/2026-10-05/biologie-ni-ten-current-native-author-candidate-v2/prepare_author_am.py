#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Native-shaped inactive author A/M decisions; independent current reviews remain pending."""
import hashlib,json,re,unicodedata
from datetime import datetime,timezone
from pathlib import Path
root=Path.cwd();own=Path(__file__).resolve().parent;rel=own.relative_to(root).as_posix()
read=lambda p:json.loads(Path(p).read_text())
def write(n,v):
 p=own/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def lines(n,v): (own/n).write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in v))
def normalized(v): return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v or ''))).strip()
def fingerprint(p): return 'sha256:'+hashlib.sha256(json.dumps(p,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()
meta=read(own/'prospective-paths.json');canon=read(own/'canonical.biologie.current.inactive.snapshot.json');goals={g['id']:g for g in canon['goals']}
templates=read(own/'thirteen-semantic-templates.exact-author-inputs.json')['goals'];ids=read(own/'stable-prospective-ids.author.json')['assignments'];now=datetime.now(timezone.utc).isoformat()
prior=read(root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-ten-source-hold-remediation-independent-a-v1/thirteen-ordinary-source-A-M.independent.json');peer={g['candidateKey']:g for g in prior['goals']}
def goal_fp(g,rule):
 d=g.get('dimensionTags',{})
 return fingerprint(dict(ruleVersion=rule,goalId=g['id'],shortKey=g.get('shortKey',''),title=normalized(g['title']),titleEn=normalized(g.get('titleEn')),description=normalized(g['description']),descriptionEn=normalized(g.get('descriptionEn')),phase=normalized(d.get('phase')),area=normalized(d.get('area')),topicCode=normalized(d.get('topicCode')),nodeKind=normalized(g.get('nodeKind'))))
records_a=[];records_m=[];prior_witness=[]
for t in templates:
 key=t['candidateKey'];g=goals[ids[key]];p=peer[key]
 for f in ['description','descriptionEn']:
  assert g[f]==t[f]
 assert g['description']==p['descriptionDE'] and g['descriptionEn']==p['descriptionEN']
 common=dict(schemaVersion=1,landscapeId=canon['landscapeId'],goalId=g['id'],reviewedAt=now,reviewer='Codex inactive author candidate; not independent current native QA')
 records_a.append(dict(common,reviewId='biologie-ni-thirteen-inactive-author-a-v2',ruleVersion='semantic-atomicity-v1',fingerprint=goal_fp(g,'semantic-atomicity-v1'),status='atomic',semanticAtomic=True,reason='Inactive author proposal. '+t['atomicityAuthorRationale']+' Prior independent source/semantic review read the identical DE/EN descriptions; stable ID, prerequisites, page and source bindings still require independent current native review.'))
 required=t.get('memorySuitabilityAuthorProposal',p['memoryVerdict'])=='memory_required'
 assert required==(p['memoryVerdict']=='memory_required')
 row=dict(common,reviewId='biologie-ni-thirteen-inactive-author-m-v2',ruleVersion='memory-card-review-v1',fingerprint=goal_fp(g,'memory-card-review-v1'),status='memory_required' if required else 'no_memory_needed',memoryUseful=required,reason='Inactive author proposal; independent current binding review pending. '+t.get('memoryRationale',p['memoryRationale']))
 if required:
  mid=meta['memoryOriginMappings'][g['id']];row.update(memoryGoalIds=[mid],deckIds=[tag.split(':',1)[1] for tag in goals[mid]['tags'] if tag.startswith('srs-deck:')])
 records_m.append(row)
 prior_witness.append(dict(candidateKey=key,goalId=g['id'],DEENDescriptionsExactlyReused=True,priorSourceScience=p,authorCurrentBindingReview='pending'))
lines('atomicity.thirteen.native-author.review.jsonl',records_a);lines('memory.thirteen.native-author.review.jsonl',records_m)
card_rows=[];card_pairs=[]
for stem,origin_key in [('native_tree_species','selected_native_tree_species_knowledge'),('vertebrate_groups','five_vertebrate_groups_traits')]:
 de=read(own/f'decks/memory-deck.de_gymnasium_biology_{stem}.de.corrected.inactive.candidate.json');en=read(own/f'decks/memory-deck.de_gymnasium_biology_{stem}.en.corrected.inactive.candidate.json')
 assert de['deckId']==en['deckId'];assert [c['id'] for c in de['cards']]==[c['id'] for c in en['cards']]
 for a,b in zip(de['cards'],en['cards']):
  origin=ids[origin_key];payload=dict(ruleVersion='memory-card-review-v1',deckId=de['deckId'],cardId=a['id'],front=normalized(a['front']),back=normalized(a['back']),category=normalized(a.get('category')),tags=[normalized(x) for x in a.get('tags',[])])
  card_rows.append(dict(schemaVersion=1,reviewId='biologie-ni-thirteen-inactive-author-m-v2',ruleVersion='memory-card-review-v1',landscapeId=canon['landscapeId'],deckId=de['deckId'],cardId=a['id'],fingerprint=fingerprint(payload),status='kept',necessary=True,originGoalIds=[origin],reviewedAt=now,reviewer='Codex inactive author candidate; independent current card binding review pending',reason='Finite required recognition repertoire of the exact ordinary origin; names and distinguishing traits are prerequisite recall, not a substitute for classification or causal explanation. Corrected frozen independent DE/EN card content reused exactly; stable origin, paired view and future native review remain candidate-only.'))
  card_pairs.append(dict(deckId=de['deckId'],cardId=a['id'],originGoalId=origin,memoryGoalId=meta['memoryOriginMappings'][origin],DE=a,EN=b,independentContentPrior='ten-cards-DEEN-content-and-origin.independent.json',newScienceReviewClaim=False))
assert len(card_rows)==10
lines('memory.ten-cards.native-author.cards.review.jsonl',card_rows)
ordinary56=[ids[t['candidateKey']] for t in templates if t['gradeBand']=='5/6']
view=dict(viewId='biologie-ni-five-six-current-memory-inactive-v2',landscapeId=canon['landscapeId'],scope=dict(schoolForm='Gymnasium',jurisdiction='DE-NI',stage='SekI'),rootNodes=[dict(kind='structure',id='ni-five-six-inactive',label='Jahrgänge 5/6 – inaktiver Autorenkandidat',children=[dict(kind='goalEntry',goalId=i,projectionRole='target') for i in ordinary56+meta['newMemoryGoalIds']])])
write('visibility.ni-five-six.inactive.view.json',view)
wide=dict(viewId='biologie-ni-supplement-current-memory-inactive-v2',landscapeId=canon['landscapeId'],scope=dict(schoolForm='Gymnasium',jurisdiction='DE-NI',stage='SekI'),rootNodes=[dict(kind='canonicalSubtree',goalId=meta['supplementId'],projectionRole='target')])
write('visibility.ni-full-supplement.inactive.view.json',wide)
base=dict(schemaVersion=1,landscapeId=canon['landscapeId'],landscapePath=meta['canonicalPath'],scope=dict(label='13 inactive current NI ordinary author candidates',leafGoalIds=meta['newOrdinaryGoalIds']))
write('atomicity.thirteen.native-author.config.json',dict(base,reviewId='biologie-ni-thirteen-inactive-author-a-v2',ruleVersion='semantic-atomicity-v1',reviewPath=rel+'/atomicity.thirteen.native-author.review.jsonl'))
mbase=dict(base);mbase['scope']=dict(label='13 ordinary + 2 memory inactive NI candidates',leafGoalIds=meta['newOrdinaryGoalIds']+meta['newMemoryGoalIds'])
write('memory.thirteen.native-author.config.json',dict(mbase,reviewId='biologie-ni-thirteen-inactive-author-m-v2',ruleVersion='memory-card-review-v1',reviewPath=rel+'/memory.thirteen.native-author.review.jsonl',cardReviewPath=rel+'/memory.ten-cards.native-author.cards.review.jsonl',reportPath=rel+'/memory.thirteen.native-author.report.md',visibilityScopeCoverageRequired=True,visibilityScopes=[dict(label='NI5/6 inactive candidate',viewPath=rel+'/visibility.ni-five-six.inactive.view.json'),dict(label='NI supplement inactive candidate',viewPath=rel+'/visibility.ni-full-supplement.inactive.view.json')]))
write('atomicity-memory-prior-reuse-and-new-binding.author.receipt.json',dict(candidateOnly=True,independentCurrentNativeReview='pending',humanApproval=False,activeWrites=0,authorRecordsDoNotAuthorizeM7=True,ordinaryPriorReuse=prior_witness,newCardOriginPairs=card_pairs,priorCardsReusedWithoutScienceChange=True,currentStrictNetIncrease=0))
print(json.dumps(dict(status='inactive_author_am_and_visibility_prepared',ordinary=13,memoryRequired=2,primaryCards=10,newScienceClosure=0)))
