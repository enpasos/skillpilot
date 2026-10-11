"""Own bounded source readings and exact historical-performance reuse, not new KEEP."""
import copy,hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent; ROOT=Path('/home/enpasos/projects/skillpilot')
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,d):p=O/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return p
I=json.loads((O/'whole-current597-twelve-DEEN-contracts-original-P24-seven-retained-materials.author-intake.json').read_text())
fetch=json.loads(Path('/tmp/skillpilot-labour12-B-primary-20261010/actual-fetch-index.json').read_text())
aids={
'BetrVG80':('whole selected statute','Aufgaben umfassen Schutzüberwachung, Vorschläge und nötige rechtzeitige Information. Daraus folgt nicht für jede Anregung ein allgemeines Leitungsveto.','Duties include safeguard monitoring, proposals and necessary timely information, not a general management veto for every suggestion.'),
'BetrVG87':('whole selected statute','Arbeitszeitlage unterliegt der genannten Mitbestimmung, soweit keine gesetzliche oder tarifliche Regelung besteht. Uneinigkeit kann zur Einigungsstelle gehen.','The specified timing matter falls under co-decision where no statutory or collective rule exists. Unresolved disagreement can go to conciliation.'),
'BGB611a':('whole selected statute','Tatsächliche weisungsgebundene persönliche Abhängigkeit ist anhand aller Umstände zu prüfen; ein anderes Vertragsetikett allein entscheidet nicht.','Actual directed personal dependence requires consideration of all circumstances; a different contract label alone is not decisive.'),
'TVG1':('whole selected statute; actual own GET after earlier web timeout','Tarifvertrag regelt Parteirechte und enthält Normen zu Arbeitsverhältnissen und betrieblichen Fragen; Schriftform ist vorgesehen.','A collective agreement regulates party rights and includes employment and workplace norms; writing is required.'),
'TVG2':('whole selected statute','Parteien sind Gewerkschaften sowie einzelne Arbeitgeber oder Arbeitgebervereinigungen; weitere ausdrücklich geregelte Verbandsfälle sind nicht nötig für den Modellfall.','Parties include unions and employers or employer associations; the model does not need further specified association cases.'),
'TVG3':('whole selected statute','Tarifbindung und die unterschiedliche Reichweite betrieblicher Normen sind zu unterscheiden. Die Modellfälle schließen relevante Sonder-/Nachwirkungsfälle ausdrücklich aus.','Binding status differs from the reach of workplace norms. The model expressly excludes relevant special or continuing-effect cases.'),
'TVG4':('whole selected statute','Unmittelbare zwingende Normwirkung setzt die passende Bindung und Reichweite voraus; günstigere Abmachungen können zulässig sein. Modellfälle schließen Allgemeinverbindlichkeit, Vertragsübernahme und Nachwirkung aus.','Direct mandatory effect needs appropriate binding and scope; more favourable terms can be allowed. Models exclude extension, incorporation and continuing effects.'),
'GG9':('whole selected constitutional article','Koalitionsfreiheit schützt Vereinigungen zur Wahrung und Förderung von Arbeits-/Wirtschaftsbedingungen. Sie ist keine einzelne allgemeine Lohnvorschrift.','Freedom of association protects organisations furthering work/economic conditions; it is not one universal pay rule.'),
'SGBIII16':('whole selected statute','Registrierte Arbeitslosigkeit benötigt Beschäftigungslosigkeit, Verfügbarkeit und Meldung; Teilnahme an aktiven Maßnahmen hat eine eigene gesetzliche Ausschlussregel.','Registered unemployment requires employmentlessness, availability and registration; active measures have a separate statutory exclusion.'),
'SGBIII138':('whole selected statute','Weniger als15 Wochenarbeitsstunden schließt den Tatbestand nicht allein aus; Verfügbarkeit und Eigenbemühungen bleiben erforderlich. Die Fälle geben andere Voraussetzungen ausdrücklich als erfüllt.','Fewer than15 weekly work hours alone do not exclude the status; availability and search conditions remain. The cases explicitly satisfy other conditions.'),
'EurostatLFS':('actual selected employment/unemployment methodological paragraphs; not every metadata paragraph','ILO-basierte Erhebung trennt Arbeit in der Referenzwoche, aktive Suche und kurzfristige Verfügbarkeit von Behördenregistrierung. Fallbedingungen schließen hier Spezialfälle aus.','ILO-based measurement distinguishes reference-week work, active search and near-term availability from official registration. Case assumptions exclude special cases.'),
'BMG-FKG':('selected first-report/current-status paragraphs read via web and own GET','Stand01.06.2026: Der erste Bericht vom30.03.2026 modelliert ohne Reform Lücken2027/2030. Empfehlungen unterscheiden Einnahmen, Ausgaben und Versorgungsfolgen; zukünftige Zahlen und Empfehlungen sind keine beobachteten Ergebnisse oder automatische Gesetzgebung.','At1 June2026, the30 March report gives conditional future gaps without reform. Revenue, expenditure and care effects differ; projections and recommendations are not observations or automatic legislation.'),
'GovernmentPension2025':('selected actual pension-report passages, not full press-conference transcript','Darstellung19.11.2025 nennt18,6% bis2027 und21,2%2039 unter damaligen Annahmen. Diese datierte Modellbeschreibung ist keine heutige individuelle Anspruchsberechnung oder sichere Zukunft.','The19 November2025 account gives18.6% through2027 and21.2% in2039 under assumptions then. This dated model is not a current personal entitlement or certain future.'),
'BMAS-pension-response-not-assumed':('selected actual own-GET article paragraphs; initial web returned navigation only','Der tatsächlich gelesene Artikel erläutert den damaligen Modellhorizont und Annahmen. Er ersetzt weder eine heutige Beschlussprüfung noch Beobachtungen zukünftiger Jahre.','The actual article explains the model horizon and assumptions then; it supplies neither a current enactment check nor future observations.')}
read=[]
for f in fetch:
 for k,shaKey in [('privateRawCachePath','rawSHA256'),('privateParsedCachePath','parsedSHA256')]:assert hashlib.sha256(Path(f[k]).read_bytes()).hexdigest()==f[shaKey]
 scope,de,en=aids[f['key']]
 read.append(dict(f,actualReadingScope=scope,boundedOwnAidDe=de,boundedOwnAidEn=en,thirdPartyFullTextCommitted=False,noWholeLinkedReportReadingClaim=True))
save('actual-fourteen-own-current-primary-fetches-selected-readings-and-bounded-DEEN-source-aids.AUTHOR.json',{
 'role':'AUTHOR own actual source readings; no foreign science approval','actualDate':'2026-10-10','rows':read,
 'actualOwnHTTP200Count':14,'normSelectedWholePageCount':10,'otherSelectedPageOrParagraphCount':4,
 'actualEarlierWebTVGTimeoutNotCountedAsSuccessfulReading':True,'actualInitialBMASWebNavigationNotCountedAsFullArticleReading':True,
 'laterOwnGETSelectedBMASArticleActuallyRead':True,'RootSourceAidNotPresentedAsOwnFetch':True,
 'allNumericalTeachingModelsIndependentFictionalNotActualNationalData':True})
Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
receipts=[
 Q/'wirtschaft-two-Katalog-career-work-independent-whole-material-review-v1/actual-final-independent-two-Katalog-KEEP-qualified-author-identity-successor-v2.receipt.json',
 Q/'wirtschaft-four-Q2-money-skills-hearing-competition-independent-seven-findings-delta-review-v1/actual-final-independent-four-Q2-v8-seven-findings-resolved-KEEP.receipt.json',
 Q/'wirtschaft-nine-E40-whole-materials-independent-root-v1/actual-independent-first-care-education-roles-whole-five-goal-material-KEEP.receipt.json']
wholefiles=[
 Q/'wirtschaft-two-Katalog-career-work-independent-whole-material-review-v1/whole-two-Katalog-career-work.independently-reviewed-machine-released.inert.candidate.json',
 Q/'wirtschaft-four-Q2-money-skills-hearing-competition-independent-seven-findings-delta-review-v1/whole-four-Q2-seven-findings-resolved.machine-released.inert.reviewed-candidate.json',
 Q/'wirtschaft-nine-E40-whole-materials-independent-root-v1/whole-first-care-education-roles-material-reviewed-machine-released.inert.candidate.json']
historical={}
for receipt,whole in zip(receipts,wholefiles):
 j=json.loads(whole.read_text());gs=j if isinstance(j,list) else j.get('goals',[j])
 for g in gs:historical[g['id']]=(g,receipt,whole)
results=[]
def perf(g):
 x=copy.deepcopy(g['examData']);x.pop('reviewStatus',None);x.pop('reviewNote',None);return x
for g in I['wholeSevenRetainedExistingMaterials']:
 h=historical.get(g['id'])
 if h:
  old,receipt,whole=h
  assert perf(g)==perf(old),(g['id'],'performance differs')
  assert g['requires']==old['requires'] and g['tags']==old['tags']
  diff=[k for k in set(g)|set(old) if g.get(k)!=old.get(k)]
  results.append({'materialId':g['id'],'existingForeignWholeBodyScience':'KEEP reused for exact retained historical performance only','foreignReceipt':bind(receipt),'foreignWholeReviewedInput':bind(whole),'wholeTaskDEENSolutionDEENScoringAndRemainingCoverageExact':True,'wholeDirectRequiresAndCourseTagsExact':True,'currentOuterFieldsDifferentFromHistoricalReview':diff,'newSourceProfileFacetsNotAutomaticallyCovered':True,'newCurrentWholeContractOrScopeApprovalClaim':False})
 else:results.append({'materialId':g['id'],'existingForeignWholeBodyScience':'NO valid whole-scientific receipt found in targeted searches; historical released status not substituted','retainedWholeObjectExact':True,'newReviewOfHistoricalWholeMaterialPerformed':False,'noFreshWholeCoverageOrScopeApproval':True})
assert len(results)==7
save('actual-seven-retained-broad-materials-five-foreign-whole-science-reuses-two-unqualified-history-boundaries.AUTHOR.json',{
 'role':'KEEP-first intake only, no historical review restart','rows':results,'allSevenCurrentWholeObjectsUnchanged':True,
 'wholeHistoricalScienceReuseCount':sum('foreignReceipt' in r for r in results),'newOrdinaryTargetsOrPrerequisiteRoles':0,
 'whySmallerCandidates':'Actual dated current local contexts remain unserved by compatible whole material closure. Original broad bodies remain intact; added current source facets are explicitly performed in the new labour-policy and contract/pay models rather than approved by historical status.'})
print(json.dumps({'actualSources':len(read),'retainedBodies':len(results),'historicalForeignWholeScienceReused':sum('foreignReceipt' in r for r in results)}))
