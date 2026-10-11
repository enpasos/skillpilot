"""Additive AUTHOR successor; no curriculum or predecessor writes."""
import copy, hashlib, json
from pathlib import Path
O=Path(__file__).resolve().parent
B=O.parent
ROOT=Path('/home/enpasos/projects/skillpilot')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,x):
    p=O/n; assert not p.exists(), p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n'); return p
before=B/'whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json'
assert sha(before)=='21c6b5fc6be9831ffa5cb3fa73f486ae35bb14693a567aaba384f5b6c726b842'
old=json.loads(before.read_text()); new=copy.deepcopy(old)
additions={
'd795f9f5': (
' Unabhängig davon gilt eine eigene Grenze für das alternative Instrument: Fehlt in der gesamten Arbeit vollständig eine tatsächliche fallbezogene Anwendung eines passenden alternativen makroprudenziellen Instruments oder ist diese Anwendung durchgehend sachlich falsch, ist das Gesamtergebnis auf höchstens 14 Punkte begrenzt. Eine richtige Pufferleistung allein ersetzt dieses Instrument nicht. Eine erkennbare, auch unvollkommene Anwendung des alternativen Instruments an beliebiger passender Stelle zählt; einzelne Rechenfehler, fehlende Details oder eine begründete Gegenposition lösen diese Grenze nicht aus. Es gibt keine zusätzliche Mindestpunktzahl je Auftrag.',
' Independently, the alternative instrument has its own boundary: if an actual case-based application of an appropriate alternative macroprudential instrument is wholly absent throughout the submission, or that application is consistently substantively false, the overall score is capped at 14. Correct buffer work alone does not supply this instrument. Recognisable, even imperfect application of the alternative instrument anywhere appropriate counts; isolated arithmetic errors, missing details or a reasoned counterposition do not trigger this boundary. There is no additional task-specific minimum.'),
'9cb7ba90': (
' Unabhängig davon gilt eine eigene Grenze für die Eigentumsdimension: Fehlt in der gesamten Arbeit vollständig ein regelgebundener Vergleich des Eigentums oder ist dieser Vergleich durchgehend sachlich falsch, ist das Gesamtergebnis auf höchstens 14 Punkte begrenzt. Richtige Ziel- und Koordinationsvergleiche allein ersetzen die Eigentumsdimension nicht. Eine erkennbare, auch unvollkommene Eigentumsperspektive an beliebiger passender Stelle zählt; fehlende Einzelheiten, ein einzelner Fehler oder ein begründetes anderes Urteil lösen diese Grenze nicht aus. Es gibt keine zusätzliche Mindestpunktzahl je Auftrag.',
' Independently, property has its own boundary: if a rule-grounded property comparison is wholly absent throughout the submission, or that comparison is consistently substantively false, the overall score is capped at 14. Correct comparisons of objectives and coordination alone do not supply the property dimension. A recognisable, even imperfect property perspective anywhere appropriate counts; missing details, an isolated error or a reasoned alternative judgment do not trigger this boundary. There is no additional task-specific minimum.')}
changes=[]
for a,b in zip(old,new):
    prefix=a['id'][:8]
    if prefix in additions:
        for field,addition in zip(('taskContent','taskContentEn'),additions[prefix]):
            paragraphs=a['examData'][field].split('\n\n',1)
            assert len(paragraphs)==2
            b['examData'][field]=paragraphs[0]+addition+'\n\n'+paragraphs[1]
            assert b['examData'][field].split('\n\n',1)[1]==paragraphs[1]
            changes.append({'goalId':a['id'],'field':'examData.'+field,'wholeBefore':a['examData'][field],'wholeAfter':b['examData'][field]})
    stripped=copy.deepcopy(b)
    for field in ('taskContent','taskContentEn'):
        stripped['examData'][field]=a['examData'][field]
    assert stripped==a
assert len(changes)==4
body=save('whole-twelve-finance-only-two-separate-essential-total-absence-boundaries.DRAFT-author-v3.json',new)
save('actual-four-DEEN-whole-task-field-deltas-and-ten-whole-unchanged-bodies.AUTHOR.json',{
 'role':'AUTHOR only; scientific followup pending', 'predecessor':str(before.relative_to(ROOT)),
 'predecessorSha256':sha(before),'successorSha256':sha(body),'changedWholeTaskFields':changes,
 'unchangedWholeMaterialIds':[x['id'] for x in old if x['id'][:8] not in additions],
 'allCasesOutsideGradingParagraphExact':True,'allSolutionsRubricScoringRequiresCoverageOuterFieldsExact':True,
 'noTaskQuotaOrPerfectionRequirement':True,'DRAFT':True,'strictNetGain':0})
R=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-finance-whole-science-independent-root-v1'
names=['actual-whole-macro19point-completely-absent-alternative-instrument-counterwork-and-individual-REVISE.root.json','actual-whole-framework22point-completely-absent-ownership-counterwork-and-individual-REVISE.root.json']
replays=[]
for name in names:
    p=R/name; d=json.loads(p.read_text()); raw=d['actualRawScore']
    assert sum(sum(r['criterionMarks']) for r in d['actualIndividualRubricDecisions'])==raw
    replays.append({'foreignIndependentOriginalInput':str(p.relative_to(ROOT)),'sha256':sha(p),
      'unchangedWholeForeignWork':d['completeSixAnswerWork'],'unchangedForeignIndividualRubricDecisions':d['actualIndividualRubricDecisions'],
      'actualOriginalRawScore':raw,'successorTotalAbsenceConditionMet':True,'actualSuccessorScore':min(raw,14),
      'actualSuccessorResult':'FAIL','thisIsForeignOriginalWorkReplayNotOwnNewWork':True})
save('actual-two-foreign-original-whole-works19-22-to14-14-author-replays.json',replays)
pdfdir=Path('/tmp/skillpilot-finance12-B-primary-20261010/ccyb-actual-guideline-selected-followup')
fetch=json.loads((pdfdir/'actual-selected-fetch-and-read-input.json').read_text())
assert sha(pdfdir/'actual-CCyB-2010-guideline.pdf')==fetch['pdfSha256']
assert sha(pdfdir/'actual-selected-pages6-10.parsed.txt')==fetch['parsedSha256']
save('actual-fresh-BIS-PDF-selected-reading-and-original-HTML-scope-source-aid.AUTHOR.json',{
 'role':'own AUTHOR selected source reading, not foreign science approval','actualOwnFetch':fetch,
 'actualOwnReadZeroBasedPdfPages':[6,7,8,9,10],'privateCacheOnly':str(pdfdir),'whole32PageReadClaim':False,
 'readingAidDe':'Der Puffer schützt gegen gemeinsame Risiken übermäßigen Kreditwachstums. Freigabe kann Verluste abfedern und regulatorischen Kürzungsdruck mindern; sie zahlt kein Geld ein. Kredit/BIP ist ein Ausgangshinweis, keine mechanische Entscheidung. Weitere Instrumente greifen etwa an Beleihung oder Einkommen an. Nationale Anwendung und andere Voraussetzungen bleiben gesondert.',
 'readingAidEn':'The buffer addresses common risks from excessive credit growth. Release can support loss absorption and ease regulatory pressure; it is not a cash injection. Credit/GDP guides judgment rather than determining it mechanically. Other tools address collateral or income. National application and other conditions remain separate.',
 'originalHTMLScopeClarification':'The retained original HTML is a 2010 Basel press release. Its final guideline paragraph already contains the aggregate-credit/system-risk objective. That is an actual HTML reading, not a claim to have read the linked PDF. The present selected PDF reading adds explicit guidance and other-instrument support.',
 'oldBcbs187AndFsibriefsRedirectsNotCountedAsPdfRead':True,
 'bodyOfficialLinkAndAllTeachingModelNumbersRemainExact':True,
 'sourceThresholdOrCurricularMappingsChanged':False})
print(json.dumps({'body':str(body.relative_to(ROOT)),'sha256':sha(body),'changedFields':len(changes),'foreignReplays':[r['actualSuccessorScore'] for r in replays]}))
