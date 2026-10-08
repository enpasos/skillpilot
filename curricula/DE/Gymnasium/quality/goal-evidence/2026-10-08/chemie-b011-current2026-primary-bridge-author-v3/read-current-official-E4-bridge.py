#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Actual bounded whole-current-E4 read; previous dossiers stay immutable."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,subprocess,urllib.request
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[6]
def sha(b):return hashlib.sha256(b).hexdigest()
def bind(p):b=(ROOT/p).read_bytes();return dict(path=p,sha256=sha(b),bytes=len(b))
def load(p):return json.loads((ROOT/p).read_text())
previous='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b011-ten-current-source-and-whole-case-remediation-author-v2'
freeze=load(previous+'/author.final.freeze.json')
for b in freeze['files']:assert sha((ROOT/b['path']).read_bytes())==b['sha256'],b['path']
atlas=load('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
row_id='he-chem-sekii-e-4-b02-a01-880cd230'
matching=[]
for p in atlas['mappingPaths']:
    m=load(p)
    for i,d in enumerate(m['decisions']):
        if d['sourceGoalId']==row_id:
            ex=load(m['sourceExtractionPath']);g=next(g for g in ex['sourceGoals'] if g['id']==row_id)
            matching.append(dict(mappingBinding=bind(p),decisionIndex=i,wholeOriginalDecision=d,
                sourceExtractionBinding=bind(m['sourceExtractionPath']),wholeSourceGoal=g,
                sourceDocument=ex.get('sourceDocument')))
assert len(matching)==1
old_pdf='curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf'
current_pdf='curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'
url='https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf'
request=urllib.request.Request(url,headers={'User-Agent':'SkillPilot bounded curriculum source verification'})
with urllib.request.urlopen(request,timeout=45) as response:
    http=response.status;content_type=response.headers.get('Content-Type');fresh=response.read()
assert http==200 and fresh.startswith(b'%PDF')
assert sha(fresh)==bind(current_pdf)['sha256']
def page(path,n):return subprocess.check_output(['pdftotext','-layout','-f',str(n),'-l',str(n),str(ROOT/path),'-'],text=True)
old=page(old_pdf,36);current=page(current_pdf,36);imprint=page(current_pdf,2)
assert '21.04.2026' in imprint
operator=matching[0]['wholeSourceGoal']['sourceText']
assert operator in current and operator in old
assert current==old,'A changed whole page requires scientific reading of actual deltas'
record=dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),
    role='targeted author reading of whole current official E4 page; not independent source approval',
    priorSealedPacketBinding=bind(previous+'/author.final.freeze.json'),prior27FilesExact=True,
    wholeCurrentAtlasDuty=matching[0],
    retainedHistoricalPrimaryBinding=bind(old_pdf),actualCurrentPrimaryBinding=bind(current_pdf),
    freshOfficialURL=url,httpStatus=http,contentType=content_type,freshHTTPBytes=len(fresh),freshHTTPSha256=sha(fresh),
    currentEdition='Ausgabe2024, Stand21.04.2026; actual current imprint physical2 read',
    currentWholePageReading={'physicalPage':36,'printedPage':36,'wholeE3E4E5PageAuthorRead':True,
        'actualWholePageTextSha256':sha(current.encode()),'sameWholeRetainedPageBytes':True,
        'contentInterpretation':'The whole E4 petroleum section still names resource/extraction/risk/geopolitics, hydrocarbon recovery through cracking and fractional distillation, selected occurrence/use examples and energetic combustion comparison. Only the bounded two-procedure row is matched here. Thermal cracking is one justified witness of the general cracking clause; no claim that all other named E4 competencies are covered by it.',
        'wholeCurrentSourceGoalTextPresent':True,'sourceStageCourse':'E phase GK/LK, as the current original row states'},
    copyrightBoundary='No new full current PDF or third-party page is committed in this addendum. Existing local primary input plus official URL remain separately attributed.',
    conclusion='The original exact whole operative E4 processing clause survives in the current official2026 primary source. This is an actual bounded whole-page/whole-row scope check, not a replacement of source science by a PDF hash. Independent child/source QA and the four genuine v2 holds remain open.',
    priorFourSourceHoldsUnchanged=True,regionalScopeHoldsUnchanged=True,
    scientificApprovals=0,activeBindingRestorations=0,strictNetIncrease=0,activeWrites=False,humanApproval=False,humanTrial=False)
(HERE/'actual-current-official-whole-E4-primary-bridge.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(httpStatus=http,freshOfficialMatchesCurrentPrimary=True,wholeTargetPageExact=True,
    prior27FilesExact=True,scientificApprovals=0,strictNetGain=0)))
