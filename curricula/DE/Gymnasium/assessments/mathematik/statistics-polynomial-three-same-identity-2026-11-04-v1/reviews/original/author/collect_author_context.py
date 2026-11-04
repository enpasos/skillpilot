"""Current registered rows and source records; no new review decisions."""
from pathlib import Path
from hashlib import sha256
import json
import re

H=Path(__file__).resolve().parent;R=H.parents[2]
assert not (H/'content-review-handoff.json').exists()
pack=json.loads((H/'author-package.json').read_text());ids={x['goalId'] for x in pack['forms']}
load=lambda p:json.loads(p.read_text())
bind=lambda p:{'path':str(p.relative_to(R)),'sha256':sha256(p.read_bytes()).hexdigest()}
canon=load(R/pack['canonical']['path']);by={g['id']:g for g in canon['goals']}
frozen=load(H/'frozen-input.json')
for g in frozen['wholeGoals']:assert by[g['id']]==g,'Task contract drift'
am=[]
for lane in ['semantic-atomicity','memory-card-review']:
 p=R/f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json';config=load(p);rp=R/config['reviewPath']
 for n,line in enumerate(rp.read_text().splitlines(),1):
  row=json.loads(line)
  if row.get('goalId') in ids:am.append({'lane':lane,'registeredConfig':bind(p),'registeredReview':bind(rp),'line':n,'wholeCurrentRow':row,'independentProposedFormReview':'PENDING'})
assert len(am)==8
(H/'current-eight-registered-am-rows.json').write_text(json.dumps({'status':'REGISTERED_ORIGINAL_ROWS_NOT_NEW_DECISIONS','rows':am},ensure_ascii=False,indent=2)+'\n')

# Actual current whole examinations, not R-based guesses about coverage.
matches=[]
for g in canon['goals']:
 ex=g.get('examData')
 if not ex:continue
 text=' '.join(str(ex.get(k,'')) for k in ['taskContent','taskContentEn'])
 relevant=set(ex.get('coveredGoalIds',[]))&ids
 related_requires=set(g.get('requires',[]))&ids
 lexical=bool(re.search(r'zweistufig|two.stage|Transformationsschar|transformation famil|Symmetrie.*[Tt]erm|symmetr.*expression',text))
 short_list=g['id'] in {'f5d06f11-1938-5172-a1c5-73fff4a1b65f','46bb8422-a822-46e1-8bcc-8b6475994b3a'}
 if relevant or related_requires or lexical or short_list:
  matches.append({'wholeExistingGoal':g,'explicitRequestedCoveredIds':sorted(relevant),'requestedIdsInAuthoredRequires':sorted(related_requires),'lexicalMatch':lexical})
assert len([x for x in matches if x['explicitRequestedCoveredIds']])==1
reuse={'status':'ACTUAL_EXISTING_WHOLE_EXAMS_INSPECTED_BOUNDED_PRIOR_ART_REUSABLE_NO_AUTOMATIC_WHOLE_CONTRACT_ADOPTION','canonical':bind(R/pack['canonical']['path']),'matches':matches,'conclusion':{'2f626446-4b32-5674-a687-9cd754bdfede':'Only two BE combine polynomial symmetry and a minimal-degree statement; the supplied cubic term is already given, no graph is read, no whole graph-to-term competence is assessed. Cannot reuse as a full form for either requested polynomial goal.','3da7863d-9784-5ea2-bb53-856021b32b18':'Actual R references the transformation-family goal, but authored coverage is catenary/bell models only. A score of 8/16 can be reached solely from the catenary half; the whole transformation competence is not protected by the task/rubric. Relevant parameter subparts are prior art, not sufficient whole-form evidence. No extra coverage is inferred from R.','f5d06f11-1938-5172-a1c5-73fff4a1b65f':'Genuine whole 10-point exam with real supplied parabola graphic and 8-point threshold. Suitable bounded prior evidence for graph-to-term inference in the quadratic special case. The class/degree is supplied, and the task never tests what general polynomial graph data do or do not determine. New graph form supplies cubic crossing/touching, a justified degree bound and explicit nonuniqueness. Independent review may still decide whether this existing quadratic task suffices for a bounded reuse path; this author package does not fabricate a new whole-contract adoption or conceal the existing task.','46bb8422-a822-46e1-8bcc-8b6475994b3a':'Genuine whole fixed transformation-term task for an unspecified base function, including point mapping and extra derivative symmetry. Useful point-mapping precedent; no family parameter is varied, and the 9/18 threshold does not require investigation of known quadratic/exponential/sinusoidal families. Not an already approved whole e33e75e3 form.','otherMatches':'Lexical matches, if any, do not assess the complete adaptive decision or the complete pure-transformation family contract.'},'searchLocations':['current canonical examData: explicit coveredGoalIds and actual authored requires plus lexical task search and inspected graph/transformation shortlist','current assessment task Markdown: recorded separately in reuse-markdown-search.txt'],'historicalSnapshots':'Historical/proposal evidence alone is not an active whole-form approval.'}
(H/'reuse-search.json').write_text(json.dumps(reuse,ensure_ascii=False,indent=2)+'\n')

# Preserve real mappings/source rows without manufacturing a new sourceRef.
records=[]
specs=[
 ('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'),
 ('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json'),
 ('curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json'),
 ('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json','curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot')]
for mp,sp in specs:
 m=load(R/mp);s=load(R/sp);sg={g['id']:g for g in s.get('sourceGoals',s.get('goals',[]))};mapped=[x for x in m['mappings'] if x.get('canonicalGoalId') in ids]
 if not mapped:continue
 srcids={x['legacyGoalId'] for x in mapped}
 decisions=[x for x in m.get('decisions',[]) if x.get('sourceGoalId',x.get('legacyGoalId',x.get('id'))) in srcids]
 passages=[x for x in s.get('passages',[]) if x.get('id') in {sg[i].get('passageId') for i in srcids if i in sg}]
 records.append({'mapping':bind(R/mp),'source':bind(R/sp),'sourceDocument':s.get('sourceDocument'),'mappedRows':mapped,'wholeMappedSourceGoals':[sg[i] for i in sorted(srcids) if i in sg],'wholeRelatedPassages':passages,'wholeMappingDecisions':decisions})
assert any(any(x['canonicalGoalId']=='613871f6-ccb2-51fe-aba2-0dd17b86a89e' for x in r['mappedRows']) for r in records)
(H/'existing-source-and-scope-context.json').write_text(json.dumps({'status':'UNCHANGED_EXISTING_CONTRACT_AND_SOURCE_CONTEXT_NOT_NEW_SOURCE_APPROVAL','records':records,'scopeRule':'All original applicability/tags/phase/sourceRef fields remain byte-for-byte equal as JSON values; no composition or source/mapping input edited. Existing lacks-of-sourceRef are preserved, not papered over.','taskDesignFit':{'decision':'Existing broad LK AB3 decision-rule goal grounded in its actual statistical preparation. Original problem combines stopping, competing error constraints and expected effort; no universal statistics scope asserted.','symmetry':'Existing J10 AB2 expression-based identity and structural checks; no unsupported graph reading requirement.','graph-inference':'Existing J10 AB2 graph-to-degree-or-term competence. The upper degree bound is explicit; finite-window and feature-only ambiguity are explicitly distinguished.','transformations':'Existing Q4.1 GK/LK AB2 restriction to pure shifts and stretch/compression, implemented using quadratic, exponential and sinusoidal families without a parameter changing the function type.'}},ensure_ascii=False,indent=2)+'\n')

precedent=R/'tmp/approach-review-20261101/rsa-factorisation-two-whole-forms-20261104-v1/format-precedent-bindings.json'
(H/'format-precedent-bindings.json').write_text(json.dumps({'protocolRecord':bind(precedent),'acceptedFormatPrecedents':load(precedent)['acceptedFormatPrecedents'],'meaning':'Earlier actual reviews establish the package pattern only. Their approvals do not cover any of these four new forms.'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'registeredAMRows':len(am),'wholeExistingExamMatches':len(matches),'sourceRecords':len(records),'currentFourContractsStillExact':True}))
