"""Minimal independent V3 follow-up; reuse completed V2 whole science."""
import difflib
import hashlib
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARENT = HERE.parent
ROOT = next(p for p in HERE.parents if (p/'AGENTS.md').exists())
AUTHOR = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-two-actual-global-gaps-trade-agreements-and-money-creation-author-v1'
V2 = AUTHOR/'two-real-essential-performance-scoring-author-successor-v2'
V3 = AUTHOR/'two-new-materials-whitespace-only-readability-author-successor-v3'
before_path = V2/'whole-two-real-global-gap-materials.DRAFT-only-essential-performance-scoring-successor-v2.json'
after_path = V3/'whole-two-new-materials.DRAFT-eight-DEEN-texts-whitespace-only-readable-successor-v3.json'
science_path = PARENT/'actual-two-whole-materials-eight-counterworks-59-calculations-bounded-scientific-KEEP.independent-b.json'
receipt_path = HERE/'actual-eight-whole-texts-whitespace-meaning-preserving-readable-successor-KEEP.independent-b.json'
assert not receipt_path.exists(), 'Immutable independent follow-up exists'

def read(p):
    return json.loads(p.read_text())

def bound(p):
    raw=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}

def write(name,data):
    p=HERE/name
    assert not p.exists(), 'Immutable output exists'
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

def diff(a,b,pointer=''):
    if type(a)!=type(b): return [pointer]
    if isinstance(a,dict):
        out=[]
        for k in sorted(a.keys()|b.keys()): out.extend(diff(a.get(k),b.get(k),pointer+'/'+k))
        return out
    if isinstance(a,list):
        if len(a)!=len(b): return [pointer]
        out=[]
        for i,(x,y) in enumerate(zip(a,b)):out.extend(diff(x,y,pointer+'/'+str(i)))
        return out
    return [] if a==b else [pointer]

science=read(science_path)
assert science['decision']=='KEEP'
assert bound(science_path)['sha256']=='c86e2730ba987d3b1b8deccd9272d9d9b962e8fbe5cc15148499b3820259a61b'
assert bound(before_path)['sha256']=='ecbcbf80c370367dfa31c62e42c6e3e0c82067c3079da40717ade12dc8f971e9'
assert bound(after_path)['sha256']=='4da87b8b3118fb57d987792811c6229564840dc479b947c6ff2009cd288ff76f'
before,after=read(before_path),read(after_path)
fields=['solutionContent','solutionContentEn','taskContent','taskContentEn']
expected=['/'+str(i)+'/examData/'+f for i in range(2) for f in fields]
assert diff(before,after)==expected
judgements={
    '294f5721-33b8-553d-b62a-32f9a0d28f5c':{
        'taskContent':'Separates stated price/duty/documentation amounts from the surrounding German words and the 14/24/15 cap numbers. Actual eligibility, missing-origin A2, protected standards, group judgement and model limitations remain exactly the prior intended text.',
        'taskContentEn':'Separates date words, Article 2, EU quantities, tariff/documentation amounts and cap numbers. Treaty identities/dates, preference conditions, independent EPA dossier and separate essential CETA-or-EPA performance remain unaltered.',
        'solutionContent':'Splits pro Stück, pro Gerät, pro unverändert, gegenüber Drittland, bleibt Lieferant and relative kleine Fixkosten; separates amounts, dates and section marks without splitting decimals/dates. Economic group/resource/transfer reasoning is unchanged.',
        'solutionContentEn':'Splits per unit and numeric/date neighbours, B2 comparison and point annotations. CETA sharing, EPA choice/diversion and bounded criteria judgement retain their full intended meaning.'
    },
    '0d111408-c754-50fa-8cd3-25ec75f6205f':{
        'taskContent':'Actual whole successor text read in DE. Banken wickeln die zwischenbankliche Zahlung mit Reserven ab, neue Kreditvergabe, Kunde/Bank references, Kreditkapital nicht als dieselbe Geldgröße and all tasks now use proper word boundaries. No loan, repayment, payment or whole-submission core restriction changes.',
        'taskContentEn':'Actual whole successor text read in EN. Bank/customer labels, same 30 repayment, transferred 20, settlement transfers reserves and new lending distinctions now use ordinary word boundaries. All material assumptions, independent cases and partial-credit protections keep the original meaning.',
        'solutionContent':'Actual whole successor text read in DE. Deposits, reserve and loan balance expressions are legible; Tilgung gepaart mit Beständen and zwischen Banken are separated correctly. Numeric literal order and signs/operators are exact, so there is no hidden altered amount, paired booking or threshold.',
        'solutionContentEn':'Actual whole successor text read in EN. K has deposit 45 + good 75 and debt 120, Repayment lowers C loans, Combined C/E deposits and money-form/model-limit statements now separate their words. No new statement, omitted restriction or changed bank accounting is introduced.'
    }
}
rows=[]
for a,b in zip(before,after):
    assert a['id']==b['id']
    for f in fields:
        x,y=a['examData'][f],b['examData'][f]
        assert re.sub(r'\s+','',x)==re.sub(r'\s+','',y)
        urls_before=re.findall(r'https?://[^\s)\]]+',x)
        urls_after=re.findall(r'https?://[^\s)\]]+',y)
        assert urls_before==urls_after
        nums_before=re.findall(r'[0-9]+(?:[.,][0-9]+)*',x)
        nums_after=re.findall(r'[0-9]+(?:[.,][0-9]+)*',y)
        assert nums_before==nums_after
        edits=[]
        for tag,i,j,k,l in difflib.SequenceMatcher(a=x,b=y,autojunk=False).get_opcodes():
            if tag=='equal':continue
            assert not x[i:j] or x[i:j].isspace()
            assert not y[k:l] or y[k:l].isspace()
            edits.append({'operation':tag,'beforeOffset':i,'afterOffset':k,'beforeWhitespace':x[i:j],'afterWhitespace':y[k:l], 'beforeContext':x[max(0,i-30):min(len(x),j+30)],'afterContext':y[max(0,k-30):min(len(y),l+30)]})
        rows.append({'goalId':a['id'],'field':'examData.'+f,'actualWhitespaceEdits':len(edits),'wholeNonWhitespaceSequenceExact':True,'numericLiteralSequenceExactIncludingDecimalsAndDates':True,'actualURLsAndOrderExact':True,'sourceOrRuleOrModelOrThresholdChange':False,'independentMeaningJudgement':judgements[a['id']][f],'individualWhitespaceEdits':edits})
    assert a['requires']==b['requires']==b['examData']['coveredGoalIds']
    assert a['examData']['scoring']==b['examData']['scoring']
    assert b['examData']['reviewStatus']=='draft'

# Confirm the current5cf V3 whole candidate differs from the actual current5cf
# V2 probe by exactly these eight new-material text fields, with all older
# material bodies, navigation, course tags and prerequisite semantics intact.
can2_path=V2/'actual-current5cf-native-technical-probe-v3/whole-current5cf-CAN496.only-two-DRAFT-plus-pure-nav.inert-technical-rebase.json'
can3_path=V3/'whole-CAN496.current5cf-plus-two-readable-DRAFT-only.inert-v3.json'
can2,can3=read(can2_path),read(can3_path)
assert len(can2['goals'])==len(can3['goals'])==496
all_diffs=diff(can2,can3)
indices={g['id']:i for i,g in enumerate(can2['goals'])}
expected_can=['/goals/'+str(indices[g['id']])+'/examData/'+f for g in after for f in fields]
assert all_diffs==expected_can
candidate_map={g['id']:g for g in can3['goals']}
assert all(candidate_map[g['id']]==g for g in after)
whole_contexts=read(PARENT/'inputs/whole-four-current-contracts-and-eight-valid-P-cases.exact-intake.json')
active_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
active_map={g['id']:g for g in read(active_path)['goals']}
assert all(g==active_map[g['id']] for g in whole_contexts['wholeGoals'])
handoff_path=V3/'actual-final-two-new-whole-materials-readability-only-v3-author-handoff.json'
author_handoff=read(handoff_path)
for key in ['wholeCurrentMaterials','wholeCurrentCAN496','wholeEightWhitespaceOnlyChanges','existingNativeTechnicalRouteProofReused']:
    binding=author_handoff[key]
    assert bound(ROOT/binding['path'])==binding
for binding in author_handoff['immutablePredecessorAndContextGuards']:
    assert bound(ROOT/binding['path'])==binding
copy_path=HERE/'whole-two-new-materials.actual-independent-readable-V3-input.exact.json'
assert not copy_path.exists()
copy_path.write_bytes(after_path.read_bytes())
write('actual-eight-individual-whitespace-and-whole-meaning-checks.independent-b.json',{'reviewer':'/root/economics_m2_views_independent_b','method':'Complete eight-field lexical comparison plus actual context/whole Money DE/EN reading; exact non-whitespace alone is not treated as scientific approval. Prior whole V2 scientific decisions and eight counterworks are explicitly reused.','wholeActualDeltas':expected,'wholeCANActualDeltas':all_diffs,'allOuterFieldsAndNontextInputsExact':True,'individualFieldJudgements':rows})
receipt={
    'schemaVersion':1,'reviewer':'/root/economics_m2_views_independent_b','reviewCompletedAtDate':'2026-10-10',
    'decision':'KEEP','approvalScope':'Minimal independent meaning-preserving new-material readability successor; completed whole scientific V2 KEEP reused, not restarted.',
    'wholeCurrentMaterials':bound(after_path),'ownExactCurrentMaterialInput':bound(copy_path),
    'wholeCurrentCAN496Inert':bound(can3_path),'exactForeignAuthorHandoff':bound(handoff_path),
    'previousIndependentWholeScientificKEEP':bound(science_path),
    'previousV2IndependentHandoff':bound(PARENT/'actual-completed-V2-independent-science.handoff.receipt.json'),
    'previousEightWholeCounterworksReused':bound(PARENT/'independent-whole-counterworks.json'),
    'previous59IndependentCalculationsReused':bound(PARENT/'actual-independent-Decimal-model-calculations-and-whole-balance-results.json'),
    'actualEightFieldMeaningFindings':bound(HERE/'actual-eight-individual-whitespace-and-whole-meaning-checks.independent-b.json'),
    'readabilityFindingResolved':'All identified joined German/English words in the two new task/solution bodies have ordinary intended word boundaries. Numeric/date literals, links, actual agreements, bank/customer labels, conditional-rule meanings and narrow 14/24/15 grading logic retain their full V2 meaning.',
    'wholeScienceDecisionsReused':2,'newWholeScienceCampaigns':0,'newOrdinaryGoalClosures':0,'strictCentralNetGain':0,
    'allPriorScienceFilesUnchanged':True,'allEightWholeTextsOnlyWhitespaceChanges':True,
    'allNontextFieldsAnd97ExistingMaterialsUnchanged':True,'currentFourWholeScientificContextsStillExact':True,
    'newReadabilityBlockersWithinBoundedMaterials':0,
    'newMachineReleaseWrite':False,'wholeMaterialsStatus':'draft',
    'noNewNativeRoutePASSClaim':'V2 old-checker probes remain history; origin/main merged-checker checks belong to the parent stable integration. No stale scope report or new predicate verdict is manufactured by spacing.',
    'unresolvedBoundaries':['Money5b5d still requires LK-only676; no GK or universal full676 prerequisite science approval is issued.','Qualified country/course access still needs whole inherited prerequisite closure, actual compiled applicability and correct current target/support roles.','Both exact new bodies remain DRAFT until authorised machine integration uses this foreign scientific/meaning KEEP.','Owner/page/context/SEM bindings must be selectively updated at current integration; the parent must run current native QS and protected Math/Physics M7 floors.','No human review, release acceptance or practical trial is claimed.'],
    'activeMutation':False,'humanApproval':False,'wholeM3M4M5M6M7CourseApproval':False
}
write(receipt_path.name,receipt)
files=sorted(p for p in HERE.rglob('*') if p.is_file())
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=ROOT,input=''.join(str(p.relative_to(ROOT))+'\n' for p in files),capture_output=True,text=True)
assert ignore.returncode in (0,1) and not ignore.stdout.strip()
assert not any(p.is_symlink() for p in HERE.rglob('*'))
write('actual-readable-V3-independent-successor.whole-file-manifest.json',{'files':[bound(p) for p in files],'requiredIgnoredFiles':0,'symbolicLinks':0,'retainedPriorScientificReceipt':bound(science_path)})
write('actual-readable-V3-independent-successor.handoff.receipt.json',{'decision':'KEEP','exactReceipt':bound(receipt_path),'wholeManifest':bound(HERE/'actual-readable-V3-independent-successor.whole-file-manifest.json'),'wholeCurrentMaterials':bound(after_path),'retainedScienceKEEP':bound(science_path),'readabilityFindingResolved':True,'Money676LKOnlyBoundaryOpen':True,'activeWrites':0,'humanApproval':False})
print(json.dumps({'decision':'KEEP','meaningPreservingEightTexts':True,'actualWhitespaceEdits':sum(r['actualWhitespaceEdits'] for r in rows),'receipt':bound(receipt_path),'handoff':bound(HERE/'actual-readable-V3-independent-successor.handoff.receipt.json'),'manifest':bound(HERE/'actual-readable-V3-independent-successor.whole-file-manifest.json'),'newNativeOrWholeCourseApproval':False},ensure_ascii=False))
