from pathlib import Path
import copy, hashlib, json

R=Path('/home/enpasos/projects/skillpilot')
O=Path(__file__).resolve().parent
OLD=O.parent/'whole-twelve-labour-society-only-three-separated-source-and-interest-boundaries.DRAFT-author-v2.json'
FOREIGN=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-labour-whole-science-independent-merge-audit-v1/actual-whole-inequality20point-income-correct-entire-education-distribution-absent.independent-REVISE.json'
assert hashlib.sha256(OLD.read_bytes()).hexdigest()=='fc10afe594480325f95b630f35928ab97a147499e9710275c567da212da15a4f'
assert hashlib.sha256(FOREIGN.read_bytes()).hexdigest()=='257b78000cef0c63e9f9e67fe5a4b2fd9b2d67d607904c8e11e5f680195fff7a'
original=json.loads(OLD.read_text()); final=copy.deepcopy(original)
before=next(m for m in original if m['id'].startswith('ca1aabac'))
after=next(m for m in final if m['id']==before['id'])
de_old='die tatsächliche Beschreibung der gegebenen Ressourcen- oder Chancenverteilung; eine materialbezogene Ursachenanalyse mit begrenzter Kausalbehauptung'
de_new='die tatsächliche Beschreibung der gegebenen Einkommensverteilung; die tatsächliche Beschreibung der gegebenen Bildungsverteilung einschließlich Bildungszugang; eine materialbezogene Ursachenanalyse mit begrenzter Kausalbehauptung'
en_old='actual description of the supplied resource or opportunity distribution; material-based causal discussion with bounded claims'
en_new='actual description of the supplied income distribution; actual description of the supplied education distribution including educational access; material-based causal discussion with bounded claims'
delta=[]
for field,old,new in [('taskContent',de_old,de_new),('taskContentEn',en_old,en_new)]:
    assert before['examData'][field].count(old)==1
    after['examData'][field]=before['examData'][field].replace(old,new,1)
    delta.append({'materialId':before['id'],'field':'examData.'+field,'exactBeforeWholeField':before['examData'][field],'exactAfterWholeField':after['examData'][field],'exactRemovedClause':old,'exactAddedClause':new})
for a,b in zip(original,final):
    if a['id']!=before['id']: assert a==b
    else:
        v=copy.deepcopy(b)
        for f in ['taskContent','taskContentEn']:v['examData'][f]=a['examData'][f]
        assert v==a
def save(name,value):
    p=O/name; assert not p.exists(); p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');return p
def bind(p):
    z=p.read_bytes(); return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(z).hexdigest(),'bytes':len(z)}
whole=save('whole-twelve-labour-only-one-separated-income-and-education-absence.DRAFT-author-v3.json',final)
save('actual-two-whole-DEEN-fields-and-eleven-whole-materials-exact.author-delta.json',{'role':'bounded AUTHOR remedy; independent followup pending','wholeBefore':bind(OLD),'wholeAfter':bind(whole),'actualChangedFields':delta,'elevenOtherWholeMaterialsExact':True,'allSolutionsScoringsRequiresCoveredOuterfieldsExact':True,'originalForeignFinding':bind(FOREIGN),'noTaskMinimumOrPerfectDistributionQuota':True})
counter=json.loads(FOREIGN.read_text())['actualOwnCompleteCounterwork']
save('actual-foreign-original-twenty-point-whole-counterwork-exact-replay.AUTHOR.json',{'role':'AUTHOR replay of FOREIGN original work, not new independent work','foreignSource':bind(FOREIGN),'wholeForeignOriginalCounterwork':counter,'foreignOriginalRawPoints':20,'actualSuccessorCap':14,'actualSuccessorResult':'FAIL','missingSeparateWholeComponent':'actual supplied education distribution, not second-application omission','foreignWholeSixAnswersUnchanged':True})
works=[{
 'kind':'OWN fair incomplete whole submission',
 'answers':[
  'L und M haben im Monatsmittel2000. L hat Spannweite2000, M400; beiL liegt die Hälfte unter dem fiktiven1500-Marker. Den Anteil beiM lasse ich hier unberechnet. Gemessen wird Einkommen, nicht Vermögen oder jede Chance.',
  'Der Mittelwert genügt daher nicht für gleiche Lage. Arbeitsstunden können Monatsbeträge verändern; Qualifikation oder institutioneller Zugang könnten anderes Entgelt oder Stellenzugang erklären. Die Zahlen beweisen keine dieser Ursachen und keine persönliche Schuld.',
  'Vergleichbare Tätigkeiten mit gleichen Qualifikationen, aber getrennt erhobenen Stunden würden die Stundenhypothese besser prüfen. Eine vollständige Untersuchung des Einstellungszugangs entwerfe ich nicht; Ursache bleibt offen.',
  'Im anderen FallR erreichen80von100 den Abschluss, beiS50von100:80%gegen50%, also30Prozentpunkte Bildungsunterschied. Die Beratungsquoten berechne ich nicht vollständig. Einkommen dieser Jugendlichen ist hier unbekannt.',
  'Zugängliche Beratung kann über Information zu Bildungswegen helfen. Verkehr und frühere Leistungen könnten zugleich die Teilnahme verändern. Gruppenmitgliedschaft beweist keine angeborene Fähigkeit; ich kläre nicht alle möglichen Verzerrungen.',
  'Ich würde Ausgangsleistungen und individuelle Beratungsnutzung vor späteren Abschlüssen vergleichbar erfassen. Damit lässt sich eine konkrete Zugangsannahme prüfen; eine belastbare neue Kontrollgruppe entwerfe ich noch nicht.'
 ],
 'manualCriterionMarks':[[1,2],[2,1],[1,1],[1,2],[2,1],[1,1]],
 'rationales':['Mittelwerte/Spannweiten und ein relevanter Anteil sinnvoll, zweite Anteilsangabe fehlt; Einkommensdimension klar.','Mittelwertbehauptung am wirklichen Verteilungsbeleg geprüft; Ursachen bedingt, institutioneller Vergleich nicht ausgeführt.','Konkrete Stunden-/Qualifikationsprüfung erkennbar, andere Hypothese unvollständig; Kausalgrenze benannt.','Tatsächliche Abschlussverteilung mit30Punkten sinnvoll, Beratungsrechnung fehlt; Bildungs- versus Einkommensdimension klar.','Konkreter institutioneller Weg und andere Ursache, Reichweite teilweise.','Passende Individualdaten und zeitliche Kausalfrage, Prüfanordnung unvollständig.'],
 'rawPoints':16,'allThreeSeparateWholeComponentsMeaningfullyPresent':True,'successorCapTriggered':False,'result':'PASS'
},{
 'kind':'OWN fair missing one complete subtask, no new task quota',
 'answers':[
  'Beide Gruppen haben8000/4=2000. L hat2000Spannweite und50%unter1500, M400Spannweite und0%. Einkommen ist nur eine Ressourcendimension.',
  'Gleicher Mittelwert ist nicht gleiche Verteilung: L hat wesentlich mehr niedrige Einkommen und größere Streuung. Stunden, Qualifikation und Zugang zu stabilen Stellen können erklären, aber keine Ursache ist belegt.',
  'Diesen Teilauftrag lasse ich aus; die konkrete Ursachenprüfung führe ich stattdessen im unabhängigen Bildungsfall aus.',
  'R/S:Abschluss80%/50%,30Punkte Abstand; Beratung70%/30%,40Punkte. Diese Bildungs- und Beratungsdimension ist nicht gleich einer Einkommensverteilung, und aus Gruppenquoten folgt kein persönliches Ergebnis.',
  'Beratung könnte erreichbare Bildungswege zeigen; Verkehr, Schichtarbeit im Haushalt und frühere Leistungen können gleichzeitig Zugang beeinflussen. Gruppenquoten belegen weder individuelle Kopplung noch angeborene Fähigkeit.',
  'Erhebe vergleichbare Ausgangsleistungen, erreichbare Beratung und individuelle Teilnahme vor späteren Abschlüssen. Eine nachvollziehbar eingeführte Zugangsänderung mit zeitlichem und sonst ähnlich erhobenem Vergleich wäre hilfreicher als reine Gruppenassociation; Auswahl und andere gleichzeitige Änderungen bleiben Grenzen.'
 ],
 'manualCriterionMarks':[[2,2],[2,2],[0,0],[2,2],[2,2],[2,2]],
 'rationales':['Verteilung und Einkommensdimension vollständig sinnvoll.','Fallgestützte Gegenprüfung und bedingte Konkurrenzursachen.','Tatsächlich ausgelassener Teilauftrag:0, kein Mindestpunktzwang.','Tatsächliche Bildungs-/Beratungsverteilungen und Dimensions-/Individualgrenze.','Konkreter Zugangsmechanismus, Alternativursachen und keine angeborene Zuschreibung.','Passende individuelle/zeitliche Vergleichsdaten, begrenzter Kausalschluss.'],
 'rawPoints':20,'allThreeSeparateWholeComponentsMeaningfullyPresent':True,'successorCapTriggered':False,'result':'PASS'
}]
for w in works:assert sum(sum(v)for v in w['manualCriterionMarks'])==w['rawPoints']
save('actual-two-new-own-fair-whole-works-twelve-manual-step-decisions.AUTHOR.json',{'role':'AUTHOR synthetic work only, not learner evidence or foreign approval','works':works,'actualNewOwnWholeWorks':2,'actualNewManualStepDecisions':12,'actualNewCriterionMarks':24,'noIdealSolutionOrTaskQuota':True})
end=json.loads((O.parent/'whole-current597-twelve-DEEN-contracts-original-P24-seven-retained-materials.author-intake.json').read_text())
active=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
G={g['id']:g for g in json.loads(active.read_text())['goals']}
assert all(G[r['goalId']]==r['wholeCurrentDEENGoal'] for r in end['rows'])
for b in end['actualWhole43CurrentPBindings']:
    assert hashlib.sha256((R/b['configPath']).read_bytes()).hexdigest()==b['configSHA256']
    assert hashlib.sha256((R/b['reviewPath']).read_bytes()).hexdigest()==b['reviewSHA256']
guards=save('actual-current597-whole-twelve-P24-P336685-and-original-freeze-endguards.AUTHOR.json',{'actualCAN':bind(active),'allTwelveWholeGoalsExact':True,'all43OriginalPConfigBindingsExact':end['actualWhole43CurrentPBindings'],'actualOriginalCases':685,'wholeOriginalForeignHistoryExact':bind(FOREIGN),'wholeOriginalTwelveBodyHistoryExact':bind(OLD),'activeWrites':0})
files=[p for p in sorted(O.iterdir()) if p.is_file()]
manifest=save('actual-one-real-inequality-successor-portable-freeze.manifest.json',{'role':'AUTHOR freeze only','files':[bind(p)for p in files]})
handoff=save('actual-final-one-real-income-and-education-separate-whole-boundary.author-handoff-v3.json',{'role':'AUTHOR bounded successor pending FOREIGN Science followup','wholeFinal12':bind(whole),'wholePredecessor12':bind(OLD),'originalForeignWhole20Counterwork':bind(FOREIGN),'wholeManifest':bind(manifest),'actualEndguards':bind(guards),'actualChangedDEENFields':2,'actualOtherElevenWholeMaterialsExact':True,'actualAllSolutionsRubricsRequiresCoveredAndStatusExact':True,'foreign20Now14FAIL':True,'ownFair16And20PASS':True,'noNewTaskQuotaOrPerfectionRequirement':True,'activeWrites':0,'strictGain':0,'newImages':0,'humanApproval':False})
print(json.dumps(bind(handoff)))
