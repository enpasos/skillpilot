import copy
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH034-LK-and-SH032-BY-practicum-history-targeted-author-successor-20261016-v1'
SCIENCE=OUT/'FIRST.informed-SH034-SH032.science-before-checks.frozen.md'
PREFIX='de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-'
S32=PREFIX+'032-74ed63ca'; S34=PREFIX+'034-e9b42b58'; S35=PREFIX+'035-a76e9a63'
WRONG='cf2631d9-da24-50e8-9e50-db625e6efaad'

def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):return sha(ROOT/p['path'])==p['sha256'] and (ROOT/p['path']).stat().st_size==p['bytes']
def raw_array(p,key):
    text=Path(p).read_text();m=re.search(r'^  "'+re.escape(key)+r'":\s*\[',text,re.M);assert m
    i=m.end();decoder=json.JSONDecoder();result=[]
    while True:
        while text[i].isspace() or text[i]==',':i+=1
        if text[i]==']':return result
        obj,end=decoder.raw_decode(text,i);result.append((obj,text[i:end]));i=end

assert SCIENCE.exists()
frozen=sha(SCIENCE)
selector_path=AUTHOR/'OUTPUTS.finite-SH034-LK-SH032-history-three-whole-CAS.AUTHOR.selector.json'
selector=read(selector_path);cas=read(ROOT/selector['threeWholeFileCAS']['path'])
inputs=read(ROOT/selector['wholeInputs']['path'])
step1=read(ROOT/inputs['source8Selector']['path'])
canonical=read(ROOT/inputs['currentCanonical']['path']);by={g['id']:g for g in canonical['goals']}
checks={
 'scienceFrozenFirst':True,
 'selectorExactPinnedSHA':sha(selector_path)=='sha256:4af7354dd41bbd7d34eac4e04a75513bc36321cc9374fd966b00184a22a9dd12',
 'allAuthorSelectorFilePinsExact':all(pin(x) for x in selector['files']),
 'threeWholeCASExactAndStep1AfterEqualsStep2Before':len(cas['items'])==3 and all(all(pin(it[k]) for k in ['wholeOriginalNormalBeforeSource8','independentlySupportedSource8Step1After','step2Before','step2After']) and it['step2Before']['sha256']==it['independentlySupportedSource8Step1After']['sha256'] for it in cas['items']),
 'source8PriorScienceAndDecisionAndResidualEvidenceExact':all(pin(inputs[k]) for k in ['source8IndependentBScience','source8IndependentBFinal','newResidualFindings']),
 'all17Step1WholeAfterFilesStillExact':all(pin(x) for x in step1['files'] if '/candidate/' in x['path']),
 'all18MetadataSixWholeFilesExact':len(inputs['all18MetadataFilesUnchanged'])==6 and all(pin(it['after']) for it in inputs['all18MetadataFilesUnchanged']),
 'retainedTwoStep1ViewsExact':len(inputs['retainedStep1SHViews'])==2 and all(pin(it['after']) for it in inputs['retainedStep1SHViews']),
 'actualPrimaryPDFPinExact':pin(inputs['actualPrimaryPDF']),
 'allSixteenTargetAndTwentyonePrerequisiteWholeContextsExact':all(g==by[g['id']] for g in inputs['wholeCurrentTargetsAndPharmacyChildren']+inputs['wholeDirectPrerequisites']),
 'currentCanonicalPinExact':pin(inputs['currentCanonical']),
}
files=[]
for it in cas['items']:
    bp,ap=ROOT/it['step2Before']['path'],ROOT/it['step2After']['path']
    b,a=read(bp),read(ap)
    if '/source-extraction/' in it['normalPath']:
        b34=next(g for g in b['sourceGoals'] if g['id']==S34);a34=next(g for g in a['sourceGoals'] if g['id']==S34)
        expected=copy.deepcopy(b);g=next(g for g in expected['sourceGoals'] if g['id']==S34)
        g['courseLevel']='LK';g['tags']=['courseLevel:LK' if t=='courseLevel:GK_LK' else t for t in g['tags']]
        raw_before={g['id']:s for g,s in raw_array(bp,'sourceGoals') if g['id']!=S34}
        raw_after={g['id']:s for g,s in raw_array(ap,'sourceGoals') if g['id']!=S34}
        result={'normalPath':it['normalPath'],'onlySH034CourseAndTagChanged':a==expected,'sourceCellCountRetained':len(a['sourceGoals'])==len(b['sourceGoals'])==165,'source032WholeExact':next(g for g in a['sourceGoals'] if g['id']==S32)==next(g for g in b['sourceGoals'] if g['id']==S32),'source035WholeExact':next(g for g in a['sourceGoals'] if g['id']==S35)==next(g for g in b['sourceGoals'] if g['id']==S35),'allOther164SourceRawObjectBytesExact':raw_before==raw_after,'SH034WholeBefore':b34,'SH034WholeAfter':a34}
        checks['oneSH034CellTwoFieldsOnlyAllOtherSourceBytesExact']=all(result[k] for k in ['onlySH034CourseAndTagChanged','sourceCellCountRetained','source032WholeExact','source035WholeExact','allOther164SourceRawObjectBytesExact'])
    else:
        old=next(d for d in b['decisions'] if d['sourceGoalId']==S32);new=next(d for d in a['decisions'] if d['sourceGoalId']==S32)
        oldedges=[e for e in b['mappings'] if e['legacyGoalId']==S32]
        removed=[e for e in oldedges if e['canonicalGoalId']==WRONG]
        expectededges=[e for e in b['mappings'] if not(e['legacyGoalId']==S32 and e['canonicalGoalId']==WRONG)]
        hist=new['source032HistoricalAllocationBeforeBYPracticumCorrection'];hold=new['source032RemainingCoverageHold']
        expected=copy.deepcopy(b);expected['mappings']=expectededges
        expected['decisions']=[new if d['sourceGoalId']==S32 else d for d in expected['decisions']];expected['status']=a['status']
        rawdb={d['sourceGoalId']:s for d,s in raw_array(bp,'decisions') if d['sourceGoalId']!=S32};rawda={d['sourceGoalId']:s for d,s in raw_array(ap,'decisions') if d['sourceGoalId']!=S32}
        edgekey=lambda e:(e['legacyGoalId'],e['canonicalGoalId'],e.get('reviewDecisionId'))
        raweb={edgekey(e):s for e,s in raw_array(bp,'mappings') if not(e['legacyGoalId']==S32 and e['canonicalGoalId']==WRONG)};rawea={edgekey(e):s for e,s in raw_array(ap,'mappings')}
        result={'normalPath':it['normalPath'],'onlySource032DecisionOneEdgeAndStatusChanged':a==expected,'oneWrongCurrentEdgeRemoved':len(removed)==1 and a['mappings']==expectededges,'threeOtherPartialPartnersExactAndOrdered':new['canonicalGoalIds']==[gid for gid in old['canonicalGoalIds'] if gid!=WRONG] and [e for e in a['mappings'] if e['legacyGoalId']==S32]==[e for e in oldedges if e['canonicalGoalId']!=WRONG],'wholeHistoricalDecisionAndFourEdgesExact':hist['wholeDecision']==old and hist['wholeCurrentEdgesBefore']==oldedges and hist['wholeRemovedHistoryOnlyEdges']==removed,'wholeDecisionStillUnreviewed':new['decision']=='unreviewed','wholeCoverageHoldFacetsRetained':hold['notYetEstablishedByWholeCurrentPartnerBodies']==['research-and-development chain','laboratory-versus-large-scale manufacture','marketing'] and hold['noWholeSourceCourseApproval'] is True,'SH034DecisionAndSevenEdgesExact':next(d for d in a['decisions'] if d['sourceGoalId']==S34)==next(d for d in b['decisions'] if d['sourceGoalId']==S34) and [e for e in a['mappings'] if e['legacyGoalId']==S34]==[e for e in b['mappings'] if e['legacyGoalId']==S34],'SH035DecisionAndEdgesExact':next(d for d in a['decisions'] if d['sourceGoalId']==S35)==next(d for d in b['decisions'] if d['sourceGoalId']==S35) and [e for e in a['mappings'] if e['legacyGoalId']==S35]==[e for e in b['mappings'] if e['legacyGoalId']==S35],'unaffected164DecisionRawBytesExact':rawdb==rawda,'allRemainingMappingRawBytesExact':raweb==rawea,'statusCountersExact':a['status']['mappedSourceGoals']==sum(d['decision']=='mapped' for d in a['decisions'])==164 and a['status']['unreviewedSourceGoals']==sum(d['decision']=='unreviewed' for d in a['decisions'])==1 and a['status']['totalSourceGoals']==len(a['decisions'])==165,'wholeCurrentSH032Decision':new}
        checks['alias'+str(it['index'])+'ExactCorrectionHistoryRetentionAndOpenCoverage']=all(v for k,v in result.items() if isinstance(v,bool))
    files.append(result)
checks['frozenScienceStillExact']=sha(SCIENCE)==frozen
report={'role':'Independent targeted technical verification after frozen original-reviewer informed science','createdAt':datetime.now(timezone.utc).isoformat(),'scienceSHA256':frozen,'candidateSelectorSHA256':sha(selector_path),'checks':checks,'allPass':all(checks.values()),'wholeFileChecks':files,'ac700Observation':'unchanged, not adjudicated or approved','newD_P_A_M_VVotes':0,'newStrictClosures':0,'netStrictGain':0,'HumanApproval':False,'HumanTrial':False,'normalHOrRWrites':0,'current435CheckpointIntegrationClaimed':False}
p=OUT/'CHECK.independent-three-CAS-raw-history-retention.actual.json';p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');assert read(p)==report
print(json.dumps({'checks':len(checks),'allPass':report['allPass'],'failed':[k for k,v in checks.items() if not v]},indent=2))
assert report['allPass']
