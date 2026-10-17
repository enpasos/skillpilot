#!/usr/bin/env python3
"""Additive description-only correction. Never edits the sealed V1 package."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

V1=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-HB-whole-primary-source-inventory-author-successor-v1')
V2=Path(__file__).resolve().parent
SELECTOR=V1/'SELECTOR.HB-primary-inventory-author-successor-v1.sealed.json'
EXPECTED='78d3af86a8dcc87c25e92dd554bbf8075ca15894b3224015531c44aab1ff8d27'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(SELECTOR)==EXPECTED
v1files={str(p.relative_to(V1)):sha(p) for p in V1.rglob('*') if p.is_file()}
s=json.loads(SELECTOR.read_text())
src=Path(s['candidate']['path']);assert sha(src)==s['candidate']['sha256']
before=json.loads(src.read_text());after=copy.deepcopy(before)
assert len(before['sourceGoals'])==232
PREFIX='Die lernende Person kann '

# All232 description beginnings were read. Only the listed noun, proper-name,
# abbreviation and noun-fragment initials are recased. Correct adjective,
# adverb, article and preposition beginnings retain their lowercase letters.
NOUN_INDICES={
0,2,5,6,7,10,11,12,15,24,25,27,28,31,32,33,34,36,39,40,42,43,44,45,47,50,52,54,
60,64,65,66,68,71,72,75,77,78,79,81,84,88,90,96,97,98,99,100,101,104,105,108,109,
112,118,119,120,121,122,124,128,134,136,137,139,141,143,145,148,149,151,152,156,
159,160,162,164,166,167,168,169,170,172,174,175,180,181,182,185,186,187,188,189,
191,192,195,196,199,202,205,211,214,215,216,217,218,223,227,228,229,230,
}

# Two actual grammatical defects in generated complete sentences. These keep
# the same objects, mechanisms, conditions and operators; no new duty or scope.
GRAMMAR={
184:('Die lernende Person kann galvanische und Elektrolysezellen anhand ausgewählter Beispiele in Aufbau und Funktion erläutern und schematisch darstellen.',
     'Die lernende Person kann galvanische Zellen und Elektrolysezellen anhand ausgewählter Beispiele in Aufbau und Funktion erläutern und schematisch darstellen.',
     'Restore the omitted head noun Zellen in the parallel noun phrases; galvanische remains lowercase.'),
209:('Die lernende Person kann durch Nanostrukturierung und Nanopartikel verstärkte Kunststoffe verursachte Eigenschaftsänderungen beschreiben.',
     'Die lernende Person kann die durch Nanostrukturierung und Nanopartikelverstärkung verursachten Eigenschaftsänderungen von Kunststoffen beschreiben.',
     'Repair the malformed participial modifier; retain nanoparticle reinforcement, nanostructuring, polymer property change and beschreiben.'),
}
PROTECTED={225,226}
assert not NOUN_INDICES & PROTECTED and not set(GRAMMAR) & PROTECTED
diffs=[];inspection=[]
for i,(b,a) in enumerate(zip(before['sourceGoals'],after['sourceGoals'])):
    text=b['description'];assert text.startswith(PREFIX)
    rest=text[len(PREFIX):]
    if i in NOUN_INDICES:
        assert rest[0].islower(),(i,rest)
        a['description']=PREFIX+rest[0].upper()+rest[1:]
        reason='Initial noun/proper name/abbreviation/noun fragment must retain uppercase after kann; only that one character changed.'
    elif i in GRAMMAR:
        expected,replacement,reason=GRAMMAR[i]
        assert text==expected
        a['description']=replacement
    else:
        reason='Already correct beginning; no change.'
    inspection.append({'index':i,'id':b['id'],'beforeFirstWord':rest.split()[0], 'afterFirstWord':a['description'][len(PREFIX):].split()[0], 'changed':text!=a['description'],'classification':'protected_exact_source_object' if i in PROTECTED else 'noun_case_corrected' if i in NOUN_INDICES else 'grammar_corrected' if i in GRAMMAR else 'correct_beginning_preserved'})
    if text!=a['description']:
        diffs.append({'jsonPointer':f'/sourceGoals/{i}/description','sourceGoalId':b['id'],'before':text,'after':a['description'],'reason':reason})

# Compare every field value after removing descriptions only from primary
# sourceGoals; unrelated description-like fields must also remain exact.
strip=lambda x:{**x,'sourceGoals':[{k:v for k,v in g.items() if k!='description'} for g in x['sourceGoals']]}
assert strip(before)==strip(after)
assert all(before['sourceGoals'][i]==after['sourceGoals'][i] for i in PROTECTED)
assert len(diffs)==len(NOUN_INDICES)+len(GRAMMAR)
assert before['sourceGoals'][225]['id']=='hb-chemistry-sekii-gyo2022-primary-active-ingredient-definition-isolation-de664078'
assert before['sourceGoals'][226]['id']=='hb-chemistry-sekii-gyo2022-primary-active-ingredient-research-interplay-ab22c8c6'
assert all(len(d['before'])==len(d['after']) and sum(x!=y for x,y in zip(d['before'],d['after']))==1 for d in diffs if int(d['jsonPointer'].split('/')[2]) in NOUN_INDICES)

def write(name,data):
    p=V2/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return p
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
candidate=write('candidate/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.AUTHOR-PENDING.description-only-v2.json',after)
diff=write('checks/exact-description-string-diffs.v1-v2.json',{'role':'AUTHOR description spelling/grammar correction only; no source/gate acceptance','beforeCandidate':pin(src),'afterCandidate':pin(candidate),'sourceGoalCount':232,'changedDescriptionCount':len(diffs),'singleInitialCaseCorrectionCount':len(NOUN_INDICES),'grammarCorrectionCount':len(GRAMMAR),'exactStringDiffs':diffs})
firstwords=write('checks/all232-description-first-word-inspection.v2.json',{'role':'Bounded author grammar inspection; no source semantics review','entries':inspection})
assert {str(p.relative_to(V1)):sha(p) for p in V1.rglob('*') if p.is_file()}==v1files
validation=write('checks/non-description-and-V1-immutability-assertions.v2.json',{'role':'Technical value equality checks only; no source/gate acceptance','passed':True,'allNonDescriptionFieldValuesExact':strip(before)==strip(after),'all232SourceGoalIdsAndOrderExact': [g['id'] for g in before['sourceGoals']]==[g['id'] for g in after['sourceGoals']], 'sourceGoalCountExact':True,'derivedTermsetOptionalFrameworkAndQualifierValuesExact':True,'twoCorrectActiveIngredientWholeObjectsExact':True,'protectedObjectIndices':sorted(PROTECTED),'sealedV1AllFilesByteExactBeforeAfter':True,'v1FileSHA256BeforeAndAfter':v1files,'changedDescriptionCount':len(diffs),'onlyPrimarySourceGoalDescriptionValuesChanged':True,'noSourceSemanticsOrGateApproval':True})
selector=write('SELECTOR.HB-primary-inventory-author-successor-v2-description-only.sealed.json',{'role':'Inactive additive AUTHOR V2; description spelling/grammar only; source review pending','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'predecessorSelector':pin(SELECTOR),'candidate':pin(candidate),'descriptionStringDiffs':pin(diff),'all232FirstWordInspection':pin(firstwords),'exactValueAndImmutabilityChecks':pin(validation),'clauseMatrix':s['clauseMatrix'],'stableIDDisposition':s['stableIDDisposition'],'whole41Inspection':s['whole41Inspection'],'operatorInterpretation':s['operatorInterpretation'],'original97Exact':s['original97Exact'],'actualPrimary':s['actualPrimary'],'counts':s['counts'],'active':False,'independentReview':'pending','wholeSourceApproved':False,'mainKCanonicalMappingWrites':False,'builder':pin(Path(__file__))})
print(str(selector));print(sha(selector));print('candidate',sha(candidate));print('changed',len(diffs),'case',len(NOUN_INDICES),'grammar',len(GRAMMAR))
