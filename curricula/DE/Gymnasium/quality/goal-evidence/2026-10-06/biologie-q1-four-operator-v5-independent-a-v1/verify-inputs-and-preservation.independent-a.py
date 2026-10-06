#!/usr/bin/env python3
"""Apache-2.0. Read-only input verification; writes only this review directory."""
from pathlib import Path
import hashlib, json, datetime, urllib.request, concurrent.futures, subprocess, re

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
V5 = OUT.parent / 'biologie-q1-four-source-operator-author-remediation-v5'
V4 = OUT.parent / 'biologie-q1-four-current383-source-scope-author-remediation-v4'
EXPECTED = '094baede3989a387d5e77f98611356f4c49bf4f0f5ff68165531fb59268f2e82'
def digest(b): return hashlib.sha256(b).hexdigest()
def read(p): return json.loads(p.read_text())
def canon(v): return json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
def save(n, v): (OUT/n).write_text(json.dumps(v, ensure_ascii=False, indent=2)+'\n')
def key(t): return t.get('caseId', t.get('caseKey'))
def verify(freeze, relative):
    rows=[]
    for r in read(freeze)['files']:
        p=relative/r['path'] if relative else ROOT/r['path']
        b=p.read_bytes()
        row={'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p), 'expectedSHA256':r['sha256'], 'actualSHA256':digest(b), 'bytes':len(b), 'pass':digest(b)==r['sha256'] and len(b)==r.get('bytes',len(b))}
        row['contentReadForVerdict']=False if 'independent-a-v1' in str(p) or 'independent-b-v1' in str(p) else None
        rows.append(row)
    assert all(r['pass'] for r in rows), freeze
    return rows

assert digest((V5/'author-source-operator-v5.final.freeze.json').read_bytes())==EXPECTED
audit={'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'authorV5FinalFreezeSHA256':EXPECTED,
       'v5OwnFiles':verify(V5/'author-source-operator-v5.final.freeze.json',V5),
       'v5DeclaredInputsHashOnlyAudit':verify(V5/'actual-used-inputs.author-v5.freeze.json',None),
       'v4OwnFiles':verify(V4/'author-source-scope-remediation-v4.final.freeze.json',V4),
       'oldReviewerVerdictsRead':False, 'peerReviewRead':False,
       'hashVerificationDoesNotConstituteContentApproval':True}
save('input-freezes.actual-verification.independent-a.json',audit)
new=read(V5/'eleven-components-twentyfour-cases.author-candidate.json')['components']
old=read(V4/'four-main-components-eight-positive-cases.author-candidate.json')['components']+read(V4/'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json')['components']
oldBy={c['candidateKey']:c for c in old}
cases=[]; components=[]
for c in new:
    b=oldBy[c['candidateKey']]; oldTasks={key(t):t for t in b['tasks']}
    components.append({'candidateKey':c['candidateKey'],'canonicalGoalId':c['canonicalGoalId'],'newAssignedGoalId':c['newAssignedGoalId'],
      'semanticFieldsChanged':[k for k in ['title','titleEn','description','descriptionEn','sourceScopes','canonicalGoalId','newAssignedGoalId'] if c.get(k)!=b.get(k)]})
    for t in c['tasks']:
        oldt=oldTasks.get(key(t))
        cases.append({'candidateKey':c['candidateKey'],'caseId':key(t),'beforeSHA256CanonicalJSON':digest(canon(oldt)) if oldt else None,
          'afterSHA256CanonicalJSON':digest(canon(t)), 'classification':'new' if oldt is None else 'unchanged_exact' if oldt==t else 'revised',
          'fieldsChanged':sorted(k for k in set(t)|set(oldt or {}) if t.get(k)!=(oldt or {}).get(k)) if oldt else list(t)})
counts={k:sum(x['classification']==k for x in cases) for k in ['unchanged_exact','revised','new']}
assert counts=={'unchanged_exact':20,'revised':2,'new':2}
assert {x['caseId'] for x in cases if x['classification']=='revised'}=={'mechanism-pro-euk-a','protein-function-a'}
assert {x['caseId'] for x in cases if x['classification']=='new'}=={'everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d'}
assert all(x['semanticFieldsChanged']==([] if x['candidateKey']!='mutagen_causes_and_protection' else ['description','descriptionEn']) for x in components)
canonEnvelope=read(V4/'canonical-preserved.inert-envelope.json')
canonB=canonEnvelope['preservedCanonicalUTF8'].encode()
activePath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
activeB=activePath.read_bytes()
goals=json.loads(canonB)['goals']; byid={g['id']:g for g in goals}
activeGoals=json.loads(activeB)['goals']; activeById={g['id']:g for g in activeGoals}
activeDifferences=[{'goalId':i,'fieldsChanged':sorted(k for k in set(g)|set(activeById.get(i,{})) if g.get(k)!=activeById.get(i,{}).get(k))} for i,g in byid.items() if g!=activeById.get(i)]
profiles=read(V4/'positive-four.native-candidate-records.json')['records']
preserved=[{'goalId':r['goalId'],'fullFrozenInputCandidateGoalObjectSHA256':digest(canon(byid[r['goalId']])),
            'frozenInputCandidateDescriptionDE':byid[r['goalId']]['description'],'frozenInputCandidateDescriptionEN':byid[r['goalId']]['descriptionEn'],
            'oldProfileSHA256CanonicalJSON':digest(canon(r)),
            'oldApplicationCaseBodiesSHA256CanonicalJSON':[digest(canon(t)) for t in r['profile']['applicationCaseBriefs']]} for r in profiles]
assert len(goals)==464 and len(preserved)==4 and sum(len(x['oldApplicationCaseBodiesSHA256CanonicalJSON']) for x in preserved)==8
nulls=[c['candidateKey'] for c in new if c['canonicalGoalId'] is None]
assert len(nulls)==7 and all(c['newAssignedGoalId'] is None for c in new)
lanes=[{'path':r['path'],'sha256':r['actualSHA256'],'bytes':r['bytes']} for r in audit['v5DeclaredInputsHashOnlyAudit'] if '/source-overlays-inert/' in r['path']]
assert len(lanes)==17
save('v4-v5-preservation.actual-independent-a.json',{'caseCounts':counts,'effectiveComponentCount':len(new),'effectiveBilingualCaseCount':len(cases),
     'componentDeltas':components,'cases':cases,'activeCanonicalSHA256':digest(activeB),'frozenInputCandidateCanonicalSHA256':digest(canonB),
     'activeCanonicalExactVsFrozenV4':canonB==activeB,'activeVsInputCandidateDifferences':activeDifferences,
     'preservationBoundary':'v5 preserves frozen v4 inert input candidate and old profiles; that candidate is not claimed to equal active runtime',
     'canonicalWholeGoalCount':len(goals),'fourOperativeWholeGoalsAndEightOldPCaseBodiesPreserved':preserved,
     'sevenNullIDPrototypes':nulls,'newIDsAssigned':0,'sourceAndMappingInertEnvelopesRetained':lanes,'currentM7NetIncrease':0,
     'oldReviewsRestarted':False,'nativeD_P_A_M_V_Approvals':False,'humanApproval':False,'humanTrial':False})

# Direct official primary source captures: no old reviewer evidence reused.
urls={
 'BY12-GA':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend',
 'BY12-EA':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht',
 'NCBI-standard-code':'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi',
 'BfS-UV-protection':'https://multimedia.gsb.bund.de/BFS/BFS/Animation/uv/',
 'BfS-UV-DNA':'https://doris.bfs.de/jspui/bitstream/urn%3Anbn%3Ade%3A0221-2020062522246/4/BfS_2020_3619S72403.pdf',
 'UBA-benzoapyrene':'https://www.umweltbundesamt.de/themen/luft/luftschadstoffe-im-ueberblick/benzoapyren-im-feinstaub',
 'IARC-air-DNA':'https://www.iarc.who.int/wp-content/uploads/2018/07/161-Chapter12.pdf'}
def fetch(item):
    k,url=item; req=urllib.request.Request(url,headers={'User-Agent':'SkillPilot independent curriculum review'})
    with urllib.request.urlopen(req,timeout=45) as resp:
        b=resp.read(); actual=resp.geturl(); status=resp.status
    ext='pdf' if b.startswith(b'%PDF') else 'html'; name='primary-'+k+'.actual.'+ext
    (OUT/name).write_bytes(b)
    return {'sourceKey':k,'url':url,'finalURL':actual,'httpStatus':status,'path':str((OUT/name).relative_to(ROOT)),
            'sha256':digest(b),'bytes':len(b),'retrievedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat()}
with concurrent.futures.ThreadPoolExecutor(max_workers=7) as pool: sources=list(pool.map(fetch,urls.items()))
pdfs={'MV':('curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf',30,30),
      'ST':('curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf',42,43),
      'HE':('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf',38,38),
      'BfS-UV-DNA':(str((OUT/'primary-BfS-UV-DNA.actual.pdf').relative_to(ROOT)),13,13),
      'IARC-air-DNA':(str((OUT/'primary-IARC-air-DNA.actual.pdf').relative_to(ROOT)),1,1)}
for k,(name,lo,hi) in pdfs.items():
    p=ROOT/name; text=subprocess.check_output(['pdftotext','-f',str(lo),'-l',str(hi),'-layout',str(p),'-'])
    out=OUT/f'primary-{k}.physical-{lo}-{hi}.txt';out.write_bytes(text)
    sources.append({'sourceKey':k,'originalPath':name,'originalSHA256':digest(p.read_bytes()),'physicalPages':[lo,hi],
                    'independentExtractionPath':str(out.relative_to(ROOT)),'extractionSHA256':digest(text)})
save('primary-inputs.actual-independent-a.json',{'sources':sources,'authorPrimaryExtractionContentUsed':False,'qualitativeSourceFactsOnly':True,
 'fictionalModelNumbersAreNotRealMeasurements':True,'sourceWholeRecordsAndCaseContributionsAreSeparate':True})
print(json.dumps({'verifiedOwnV5':len(audit['v5OwnFiles']),'verifiedInputsV5':len(audit['v5DeclaredInputsHashOnlyAudit']),
 'verifiedOwnV4':len(audit['v4OwnFiles']),'cases':counts,'components':len(new),'nullID':len(nulls),'canonicalWholeGoals':len(goals),
 'independentPrimaryCaptures':len(urls)},ensure_ascii=False))
