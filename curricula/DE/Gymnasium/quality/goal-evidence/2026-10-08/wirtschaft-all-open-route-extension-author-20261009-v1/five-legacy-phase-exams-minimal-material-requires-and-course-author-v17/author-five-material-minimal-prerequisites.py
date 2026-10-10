from pathlib import Path
import json, copy, hashlib, datetime, tempfile, shutil

ROOT = Path('/home/enpasos/projects/skillpilot')
PARENT = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
OUT = Path(__file__).resolve().parent
V16 = PARENT / 'current407-P311-P8-exact-QA-resource-bindings-and-owner-union-author-v16'
CAN_PATH = PARENT / 'four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13/whole-V13-CAN407-four-exact-Root-machine-released-materials.inert.candidate.json'
IDS = ['57984b50-0dbe-4fb1-a020-0f25953a8b74', '9a88ee21-93d4-4042-b65c-21e287715433', 'b851482c-5d7e-4228-aea8-3d277f897297', 'fe55b4b3-9eca-46ce-a3a6-f7a0a84daf12', '44fb56bb-7b5a-4b34-9ca4-c4052f94da89']

# Individually authored material/contract reasons; these are candidates for independent review.
KEEP = {
 '8b28e36b': 'E Aufgabe1 verlangt die Interpretation der drei Umwelt-/Lebensqualitätsindikatoren einschließlich Informationsgrenze; genau diese Fertigkeit ist vor der selbstständigen Bearbeitung erforderlich.',
 'a60e0541': 'E Aufgabe2 verlangt eine eigene finanzierbare Konsumentscheidung mit Knappheit, Zuverlässigkeit, Nachhaltigkeit und Werbewirkung; die integrierte Konsumentscheidung ist der tatsächlich benötigte Vertrag.',
 '4d578b42': 'E Aufgabe2 verlangt ausdrücklich die Unterscheidung Reparatur/Wiederverwendung/Recycling und reparierbare Produktgestaltung; Kreislaufwirtschaft ist als eigener Prüfungsschritt notwendig.',
 'e3cd6940': 'E Aufgabe3 und Rubrik verlangen zwei konkrete interessengebundene Umweltkonflikte und eine bedingte Empfehlung; diese Umweltanalyse wird selbstständig gebraucht.',
 'a2eda0df': 'E Aufgabe4 verlangt Nacherfüllung, Verkäuferbezug, Reklamation und Abgrenzung von Garantie/automatischer Erstattung; der Verbraucherrechtsvertrag ist sachlich notwendig.',
 '8c4d53d1': 'Q1 Aufgabe1 prüft Kommission, Parlament, Rat und die Unterscheidung der Räte im stipulierten Verfahren; der EU-Institutionenvertrag ist notwendig.',
 '1c0d950c': 'Q1 Aufgabe2 verlangt materialbezogene Lobbyinteressen und zwei begründete Transparenzregeln; EU-Interessenvertretung trägt diese selbstständige Leistung.',
 '120242ff': 'Q1 Aufgabe3 verlangt drei begründete Denkschulzuordnungen und Wettbewerbsordnung versus Nachfragestabilisierung; dieser aktuelle LK-Vertrag ist ein echter Zugang und darf nicht als GK-Basis behauptet werden.',
 '72bde56f': 'Q1 Aufgabe4 verlangt absolute/relative Abgabenbelastung und eine Bewertung nach Leistungsfähigkeit, Gleichbehandlung und Anreizen; Steuergerechtigkeit ist tatsächlich erforderlich.',
 'b0bdd6e9': 'Q2 Aufgabe2 verlangt k=4 und beide Einkommenswirkungen80/60 unter erklärtem Crowding-out; der LK-Modellierungsvertrag wird tatsächlich geprüft.',
 'b2419b68': 'Q2 Aufgabe2 verlangt Modellnutzen, zwei konkrete Annahmengrenzen und die Abgrenzung zur Prognose; dieser Modelleinsatzvertrag ist tatsächlich notwendig.',
 'a72ddc94': 'Q2 Aufgabe3 verlangt vier unterscheidbare Transmissionskanäle; der aktuelle LK-Vergleichsvertrag ist ein echter Zugang.',
 '0fda1400': 'Q2 Aufgabe4 verlangt einen konsistenten geld-/fiskal-/ordnungspolitischen Mix mit Zielkonflikten und Änderungskriterium; der aktuelle LK-Instrumentenmixvertrag ist tatsächlich erforderlich.',
 'fcf756f1': 'Q3 Aufgabe1 verlangt zwei Resilienzmaßnahmen samt Mechanismen und Kosten/Grenzen; der LK-Lieferkettenvertrag wird selbstständig angewandt.',
 '7d632b0b': 'Q3 Aufgabe2 verlangt die Anwendung aller drei Trilemma-Ziele und zwei unterschiedliche Zielverzichte; der LK-Trilemmavertrag ist tatsächlich erforderlich.',
 'ffcc9dc8': 'Q3 Aufgabe3 verlangt Vereinbarung versus anfängliche Leistung und eine normbezogene Mangelprüfung; der Kaufrechts-Mangelvertrag ist notwendig.',
 '8adaa076': 'Q3 Aufgabe4 verlangt eine Standort-/Beschaffungsentscheidung mit Kosten, Risiko und Versorgungssicherheit; dieser LK-Abwägungsvertrag ist tatsächlich erforderlich.',
 '9b6ef4f1': 'Q4 Aufgabe1 verlangt Rohstoffabhängigkeit, keine unvermeidliche Fluchbehauptung sowie Diversifizierung mit Grenze; der LK-Vertrag wird tatsächlich angewandt.',
 'e5560c43': 'Q4 Aufgabe2 verlangt getrennte Kredit-/Beratungs-/Marktzugangsmechanismen und soziale Wirkungsgrenzen; der LK-Mikrofinanzvertrag ist notwendig.',
 'b8c7458a': 'Q4 Aufgabe3 verlangt Durchschnitt versus Individuum, Selbstselektion, Kausalitätsgrenze und bessere Evaluation; der LK-Wirksamkeitsvertrag ist tatsächlich erforderlich.',
 '645e6ff8': 'Q4 Aufgabe4 verlangt zwei ethische Kriterien, konkreten Konfliktausgleich und eine wirksame begrenzte Governance-Regel; der LK-Konfliktlösungsvertrag ist notwendig.',
}
REMOVE = {
 '5ccb466f': 'E beschreibt Konsum und Reparaturförderung, verlangt aber keine eigenständige Analyse dynamischer Unternehmens-Marktreaktionen; Händlerinteressen sind bereits im konkreten Umweltkonflikt enthalten.',
 'b7633a54': 'E Aufgabe3 benötigt die konkret geprüfte e3cd-Umweltkonfliktanalyse; ein zusätzlicher paralleler Vertrag für allgemeine umweltpolitische Debatten ist keine minimale weitere Zugangshürde.',
 'c4c5bae8': 'E enthält weder Familien- noch Bildungsstrukturwandel und verlangt dazu keine Folgerungen.',
 'af772e72': 'E vergleicht keine sozialstaatlichen Reaktionen auf gesellschaftlichen Wandel; der Reparaturzuschuss ist ein ausdrücklich begrenzter Umweltvorschlag.',
 '3bf3a322': 'E verlangt keine Beziehungen von kulturellem Wandel, Migration und Integration.',
 '5262a0ba': 'E Aufgabe1 interpretiert drei bereitgestellte Indikatoren; BIP und HDI werden weder bereitgestellt noch verglichen. Der konkrete8b28-Indikatorvertrag genügt.',
 'af709beb': 'E prüft kein Konzentrationsproblem und keine Wettbewerbspolitikinstrumente.',
 '84955a75': 'E Aufgabe2 bewertet Werbung innerhalb der bereits erforderlichen a60e-Konsumentscheidung; die Beherrschung eines zusätzlichen allgemeinen Bias-Erklärungsbündels ist für diese konkrete Aufgabe keine minimale separate Voraussetzung.',
 'f79decb1': 'E verlangt keine Analyse von Jugend-, Zuwanderungs- oder Geschlechterrollenperspektiven; wirtschaftliche Akteursinteressen sind im Umweltkonflikt enthalten.',
 '4c7c7297': 'E enthält weder Eigen-/Fremdkapitalvergleich noch ein Haftungsszenario für Kapitalgeber.',
 '0eaf70cd': 'E verlangt keine familien- oder bildungspolitischen Maßnahmen.',
 '3ac589b5': 'E enthält keine Geschlechterrollen-/Gleichstellungspolitikanalyse.',
 'bf851227': 'E verlangt keine Analyse sozialen Netzwerks oder Sozialkapitals.',
 '21dc877b': 'E verlangt keine kartellrechtliche Maßnahme und keine Fusionskontrolle.',
 'eef95305': 'E Aufgabe2 verwendet Anker-/Zeitdruckwirkung als Bestandteil der a60e-Konsumentscheidung; ein zusätzlicher vollständiger Bias-Anwendungsvertrag ist keine weitere minimale Zugangshürde. Die beobachtete Teilüberschneidung wird nicht als fehlende Werbung behauptet.',
 'c4f27b51': 'E prüft keine Rechte/Pflichten von Kapitalgebern oder deren Haftungsrisiken.',
 '1826fe19': 'E benötigt keine eigenständige Erklärung von Informationsasymmetrien, öffentlichen Gütern und Monopolen; Unsicherheit über Restlebensdauer ist bereits als Information in der konkreten Konsumentscheidung behandelt.',
 'ee36cbaf': 'E prüft konkrete Kreislaufwirtschaft und Interessenkonflikte; ein zusätzlicher Vergleich aller Nachhaltigkeitskonzepte ist keine minimale notwendige Vorleistung.',
 '2ccb9f7e': 'E verlangt keine betriebliche Ablauf-/Arbeitsteilungs-/IT-Analyse; Produktreparierbarkeit wird im eigens erforderlichen Kreislaufwirtschaftsvertrag behandelt.',
 '860ead33': 'E enthält keine zu analysierende Unternehmenspräsentation und keine Adressatenwirkungsanalyse.',
 '596c02e3': 'E ist eine bereitgestellte Klausur, kein selbst geplantes, durchgeführtes und ausgewertetes Wirtschaft-Recht-Projekt; Projektmastery ist dafür keine notwendige Vorleistung.',
 '0d8cb18d': 'E verlangt weder Projektmanagement im Team noch bedarfsgerechten digitalen Medieneinsatz.',
 '685624a0': 'E enthält keine Bilanz/GuV und fordert keine Tabellenkalkulationsgrafik.',
 '96ab60e8': 'E prüft keine eigene Interessen-/Stärkenreflexion im Vergleich mit Unternehmensberufen.',
 '8328f308': 'E enthält keine Unternehmenslandschaftsdaten und verlangt keine beruflich orientierte Tabellenkalkulationsanalyse.',
 '65d9f38e': 'E Aufgabe3 bewertet einen Umweltkonflikt; eine weitergehende allgemeine Analyse staatlicher Unternehmensrahmenbedingungen ist als zusätzlicher Zugangsvertrag nicht notwendig.',
 'd9a3db94': 'E enthält keinen Jugendstraftatsfall und keine erzieherische Rechtsfolgenbeurteilung.',
 'd3c11bfa': 'E kauft ausdrücklich im Geschäft; die Kompetenz zu virtuellen Marktplätzen und Online-Shopping wird nicht verlangt.',
 'f90e4741': 'E prüft keine Innovations-Wirkungskette vom Unternehmen zu Wirtschaft und Gesellschaft; Reparierbarkeit ist im konkreten Kreislaufwirtschaftsschritt ausreichend.',
 '8ad94aeb': 'E benötigt einen Budgetvergleich und Umwelt-/Verbraucherrecht; kein Preis-Mengen-Marktmodell oder Modellannahmenvergleich ist verlangt.',
 '52e6731e': 'E enthält keine Digitalisierung eines Marktes oder Folgenanalyse für Anbieter und Nachfrager.',
 '13b6317a': 'E Werbereflexion ist bereits Teil der geforderten a60e-Entscheidung; ein zusätzlicher allgemeiner Rationalitäts-/Biasvertrag ist für diese begrenzte Aufgabe nicht nötig.',
 '1d989a89': 'E beurteilt Werbeeinfluss, verlangt aber keine ethische Analyse von Nudging oder unternehmerischen/politischen Verhaltensmaßnahmen.',
 '9ea1219f': 'E erwähnt ein Gerät für Bewerbungen als Bedarf, fordert aber weder Bewerbungsverfahrensanalyse noch vollständige Bewerbungsunterlagen.',
 '44080e8d': 'E enthält keine Praktikums-/Berufserkundungsdokumentation oder Erwerbsbiografie.',
 '60ec0ead': 'E verlangt keine Untersuchung prekärer Beschäftigung oder gesellschaftlicher Arbeitsbedeutung.',
 '85f0b64f': 'E enthält keinen Arbeitsrechts-/Arbeitsorganisationsfall.',
 '7179f558': 'E verlangt eine begründete Empfehlung zur Förderung; die weitergehende Partizipationskompetenz mit konkreten politischen Handlungsmöglichkeiten wird nicht als eigene Leistung benötigt.',
 '50e07b86': 'E verlangt weder Elastizität, Marktgleichgewicht noch Gesamtwohlfahrtsrechnung.',
 '9267ad99': 'E enthält keine globale Konsumkultur oder Homogenisierungs-/Lokalisierungs-/Kreolisierungsanalyse.',
 'd2467bbb': 'E benötigt keine Ansoff-/Porter-/Rechtsform-/Make-or-Buy-Strategieanalyse.',
 '71a3e027': 'E fordert keine Kaizen-/Lean-/Just-in-Sequence-Produktionsanalyse.',
 '776457c2': 'E enthält keine betriebliche Mitbestimmung oder gesetzliche Mitbestimmungsprüfung.',
 '410e7ab4': 'E enthält keine Unternehmenskultur-/Mitarbeiterzufriedenheitsanalyse.',
 'a5009946': 'E verlangt keinen Vergleich von Entlohnungsformen und ihren Verteilungs-/Anreizwirkungen.',
 '6e138ab0': 'E Aufgabe3 enthält eine bedingte Umwelt-Empfehlung im e3cd-Vertrag; eine zusätzlich gestaltete adressatengerechte Darstellungsform als eigener allgemeiner Performancevertrag ist nicht verlangt.',
 '1e3af127': 'E enthält keine historischen Austauschprozesse oder ökonomische Analyse von Machtzentren.',
 '8f0fde77': 'Q1 prüft das ausdrücklich festgelegte EU-Gesetzgebungsverfahren, keine nationalen verfassungsgerichtlichen Verfahren; der EU-Vertrag8c4d trägt die geforderte Leistung.',
 '9483b637': 'Q1 enthält keine populistische Herausforderung oder Demokratieresilienzstrategie.',
 '4552c393': 'Q1 ordnet Idealtypen an einem ausdrücklich erfundenen Vorschlag zu; das ist keine historische/aktuelle wirtschaftspolitische Fallanalyse. Der1202-Denkschulvertrag ist ausreichend.',
 'fd913fec': 'Q1 verlangt kein eigenes tatsächliches staatsbürgerliches Mitwirken oder erprobtes wirtschaftspolitisches Handlungsvorhaben; die schriftliche Materialanalyse genügt.',
 '7d4d7a90': 'Q1 stellt weder Spiel, Auszahlungen noch spieltheoretische Strategiewahl bereit; Interessenvergleich ist keine Spieltheorieaufgabe.',
 '1c92b15e': 'Q2 verlangt einen allgemeinen Instrumentenmix, aber keine konkrete Kartellprüfung/Fusionskontrollverfahren; dieser LK-Spezialvertrag ist nicht nötig.',
 '9832485e': 'Q2 verlangt keine Renten-/Gesundheitsreformpfade.',
 '25278ecf': 'Q2 ist ausdrücklich eine erfundene Lage, keine historische/aktuelle Inflationsfallstudie; Dateninterpretation und Grenzen werden im konkreten Modell-/Mixvertrag verlangt.',
 'e9c42eab': 'Q2 wägt Beschäftigung als Ziel des Instrumentenmixes ab; ein gesonderter Vergleich verschiedener Arbeitsmarktstrategien wird nicht verlangt.',
 '424bae9f': 'Q2 enthält keine Lorenzkurve, Gini-Daten oder Verteilungsmodellrechnung.',
 '45430f89': 'Q2 gibt weder NAIRU noch eine entsprechende Schätzung vor und verlangt keine daraus begründete Politikentscheidung.',
 'ff58f126': 'Q2 verlangt den Erwartungskanal, aber keine Unterscheidung adaptiver und rationaler Erwartungen; die vier Kanäle sind vollständig im a72d-Vertrag enthalten.',
 '4c185dbe': 'Q2 enthält keinen digitalen Plattformmarkt oder dessen kartellrechtliche Besonderheiten.',
 'a0b7eb01': 'Q2 erlaubt begründete fiskalische Alternativen, verlangt aber keine eigenständige industriepolitische Eingriffs-/Standortklassifikation; der erforderliche0fda-Mixvertrag genügt.',
 '73943ad7': 'Q2 braucht ordnungspolitische Instrumente als Teil des0fda-Mixes, aber keine gesonderte volle Regulierungsfolgenabschätzung.',
 '66ca6838': 'Q2 verwendet eine Leitzinsanhebung, keine QE/QT-Bilanzpolitik oder Bilanzwirkungsanalyse.',
 '29076abc': 'Q2 vergleicht Transmissionskanäle; konkrete Forward-Guidance-Strategien müssen nicht entworfen oder beurteilt werden.',
 '8fbd0f7b': 'Q2 verlangt keine Strategien von Migration, Ausbildung und Automatisierung zur Fachkräftesicherung.',
 'b84f3f68': 'Q2 enthält kein zu beurteilendes Umschulungs-/Weiterbildungsprogramm.',
 'c7341b02': 'Q2 verlangt keinen Vergleich von Umlage-, Steuer- und Kapitaldeckungsverfahren.',
 '7c9efc27': 'Q2 enthält keine verteilungsbezogenen Sozialtransferalternativen und keine quantifizierte Verteilungsbewertung.',
 'da73483a': 'Q2 kann zielgenaue Entlastung als zulässige Alternative nennen; eine eigene Strategienbewertung zu Armut und Teilhabe ist keine universelle Voraussetzung für den vorgegebenen Mix.',
 '15d18bd1': 'Q2 nennt private Investitionsverdrängung, verlangt aber keine konkrete Unternehmensfinanzierungsentscheidung anhand mehrerer finanzwirtschaftlicher Ziele.',
 '94264f00': 'Q2 enthält keine Tarifverhandlung/Forderung oder Lohn-/Gewinnquotenbewertung.',
 '73ffee8c': 'Q2 enthält keinen Vergleich alternativer sozialer Sicherungskonzepte.',
 '489b6d7b': 'Q2 enthält keinen Unternehmensbeschaffungsfall oder ökologische/soziale/ethische Lieferkettenstandards.',
 '59c95c87': 'Q2 verlangt keine Produkt-Marktsituation oder Marktpotenzialermittlung.',
 'f5d76508': 'Q2 thematisiert Energiepreisdruck, fordert aber keine Analyse staatlicher Umweltschutzmaßnahmen zwischen Wachstum und Umwelt.',
 '78e87088': 'Q2 enthält keine juristische Subsumtion mit interpretationsbedürftigen Tatbestandsmerkmalen.',
 '84f7321d': 'Q3 Aufgabe2 lässt sich vollständig durch zwei Trilemma-Zielverzichte erfüllen; Interventions-/Zinsschrittinstrumentierung ist kein zusätzlicher notwendiger Leistungsauftrag. Der Lösungshinweis zu endlichen Reserven erzwingt diesen weitergehenden Vertrag nicht.',
 '3e26fb9e': 'Q3 enthält weder Daten-/Dienstleistungs-/Plattformströme noch digitale Globalisierung.',
 '45bd0edd': 'Q3 enthält keinen spekulativen Angriff und verlangt keine Analyse einer Interventionsstrategie.',
 '1bddc795': 'Q3 verlangt keine Integrationsstufen über Binnenmarkt und Währungsunion hinaus.',
 'b4a82d8d': 'Q3 enthält keine Fiskalunion oder EU-Transfermechanismen.',
 '648224f4': 'Q3 enthält keine europäischen Rechtsstaats-/Schulden-/Integrationskonflikte.',
 '0509ae79': 'Q3 enthält kein bilaterales oder multilaterales Handelsabkommen zur Analyse.',
 '0b6db337': 'Q3 enthält weder Zoll noch nichttarifäres Handelshemmnis.',
 '7d0c69c6': 'Q3 enthält keine Sanktion gegen einen Handelspartner.',
 'd22433a8': 'Q3 verlangt keine Basel-Regelwerke oder Bankenregulierung.',
 '5ae551bf': 'Q3 verlangt keinen antizyklischen Kapitalpuffer oder andere makroprudenzielle Instrumente.',
 '606c4050': 'Q3 enthält keinen FinTech-/Krypto-Aufsichtsfall.',
 '941ea650': 'Q3 Aufgabe3 grenzt Mangel von nicht automatisch bestehendem Schadensersatz ab; sie verlangt keinen begründeten Schadensersatzanspruch wegen Nebenpflichtverletzung. Gerade dieser besondere Fall liegt nicht vor.',
 '9a5b2913': 'Q3 Maschine ist anfänglich mangelhaft; verspätete oder unmögliche Leistung ist kein Aufgabenfall.',
 '479fb87a': 'Q3 legt einen Maschinenkauf ausdrücklich fest und verlangt keinen Vergleich anderer Vertragstypen. Der ffcc-Mangelvertrag mit seinen echten Grundlagen genügt.',
 '5d8c708f': 'Q3 enthält keine Ordnungswidrigkeit oder strafbare Handlung.',
 '7a926b77': 'Q3 enthält keinen Strafrechtsfall mit Rechtfertigungs- oder Entschuldigungsgründen.',
 'f0fc29e3': 'Q3 enthält keine Straftat, Strafzwecktheorie oder Strafzumessung.',
 'c87e528a': 'Q3Trilemma betrifft ein erfundenes Land; eine aktuelle Geld-/Geldpolitikfrage ist nicht verlangt.',
 '94fe52f5': 'Q3 prüft vorgegebene getrennte Fälle; ein zusätzlicher Lösungsansatz für eine aktuelle komplexe gesamtwirtschaftliche Problemstellung wird nicht verlangt.',
 'a6a609cb': 'Q3 setzt den Kaufrechtsrahmen ausdrücklich voraus; die allgemeine Abwägung Schutzfunktion versus Vertragsfreiheit ist kein zusätzlicher Leistungsauftrag.',
 'ac76810e': 'Q4 Material1 analysiert Rohstoffkonzentration/Preisabhängigkeit im9b6e-Vertrag; konkrete Partner-Handelsbeziehungen des weitergehenden ac76-Vertrags werden nicht dargestellt. Die Teilüberschneidung Exportabhängigkeit begründet keinen weiteren minimalen Zugang.',
 'e7542590': 'Q4 nennt einen erfundenen Fonds, prüft aber keine Rollen-/Grenzenanalyse von WTO,IWF,Weltbank oder UN; Governance ist im konkret erforderlichen645e-Vertrag enthalten.',
 '13705b9f': 'Q4 enthält kein SDG-/Paris-/Klimavereinbarungsmaterial und keine ökonomische Bewertung solcher Vereinbarungen.',
 'c9847c36': 'Q4 enthält keine geoökonomische Machtstrategie oder Investitionsscreeningentscheidung.',
 '36ebee6c': 'Q4 verlangt ethische Konfliktlösung, aber weder Corporate-Responsibility-Konzepte noch konkrete Lieferkettengesetze.',
 '9df66a0b': 'Q4 enthält keine ESG-Anlagekriterien oder Impact-Investing-Entscheidung.',
 '7a55332e': 'Q4 enthält kein datengetriebenes Geschäftsmodell und keine KI-Anwendung.',
}

def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(ROOT)), 'sha256':sha(p), 'bytes':p.stat().st_size}
def save(name, value):
 p=OUT/name
 if p.exists(): raise RuntimeError('Do not overwrite existing evidence: '+str(p))
 p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n'); read(p)

can = read(CAN_PATH); by={g['id']:g for g in can['goals']}
rows=[];changes=[];candidate=copy.deepcopy(can)
for gid in IDS:
 goal=by[gid]; covered=set(goal['examData']['coveredGoalIds'])
 kept=[];removed=[]
 for index,rid in enumerate(goal['requires']):
  prefix=rid[:8]; keeping=rid in covered
  if keeping:
   reason=KEEP[prefix];kept.append(rid)
  else:
   reason=REMOVE[prefix];removed.append(rid)
  rows.append({'examGoalId':gid,'oldOrderedRequiresIndex':index,'requiredGoalId':rid,'authorDecision':'KEEP' if keeping else 'REMOVE','fachlicheReason':reason,'entireCurrentRequiredGoal':by[rid],'currentlyDeclaredCourseTags':by[rid].get('tags',[]),'currentSourceProvenance':by[rid].get('extendedData',{}).get('provenance'),'partOfActualCovered21':keeping,'independentApproval':False})
 if set(kept)!=covered: raise RuntimeError('A covered goal is missing from actual ready contract')
 target=next(g for g in candidate['goals'] if g['id']==gid);target['requires']=kept
 if target['examData']!=goal['examData']: raise RuntimeError('Whole approved material changed')
 changes.append({'goalId':gid,'beforeRequires':goal['requires'],'afterMinimalRequires':kept,'removedExactly':removed,'wholeExamDataAndCoveredIdsExact':True,'sourceCourseApproval':False})
if len(rows)!=125 or sum(r['authorDecision']=='KEEP' for r in rows)!=21: raise RuntimeError('Unexpected frozen five-exam count')
course_candidate=copy.deepcopy(candidate)
course_changes=[]
for gid in IDS[1:4]:
 goal=next(g for g in course_candidate['goals'] if g['id']==gid)
 before=goal['tags'];goal['tags']=[t for t in goal['tags'] if t!='GK']
 course_changes.append({'goalId':gid,'beforeTags':before,'afterCandidateTags':goal['tags'],'reason':'Mindestens ein tatsächlicher nicht optionaler Aufgaben-/Rubrikschritt benötigt einen aktuellen canonical LK-only-Vertrag. Das vollständige Material darf im bisherigen GK-Zieluniversum nicht als grundkursgerechter Abschluss zählen. LK-Material bleibt unverändert.','wholeExamDataExact':True,'ordinaryTargetCourseTagsUnchanged':True,'independentApproval':False})
save('whole-five-legacy-current-material-and-all125-prerequisite-contracts.frozen-input.json',{'canonical407Input':bind(CAN_PATH),'wholeFiveCurrentGoals':[by[gid] for gid in IDS],'wholeAllDirectPrerequisiteGoals':[by[gid] for gid in sorted({rid for eid in IDS for rid in by[eid]['requires']})]})
save('all125-direct-prerequisite-material-decisions.author-candidate.json',{'schemaVersion':1,'kind':'individually-authored-material-bound-ready-minimum-proposal','author':'/root/economics_independent_continuation_a','rows':rows,'KEEP':21,'REMOVE':104,'wholeCovered21Unchanged':True,'ownIndependentReview':False})
save('selective-five-legacy-material-minimal-requires.author-candidate.json',{'schemaVersion':1,'changes':changes,'exactField':'requires','noNewOrRestoredEdges':True,'wholeAll47ExamDataBodiesExact':True,'wholeOther402GoalsExact':True,'status':'inert_author_candidate_pending_independent_fachliche_edge_review','newStrictClosures':0,'liveWrites':[]})
save('whole-CAN407-five-legacy-minimal-requires-only.author-candidate.json',candidate)
save('three-legacy-whole-exams-LK-only-bounded-course.author-proposal.json',{'schemaVersion':1,'changes':course_changes,'currentGKOrdinary201AndLK280SetsNotChanged':'actual native comparison required','sameMaterialSourceAndAllCoveredGoals':True,'authorProposalNotCourseApproval':True,'noNewSourceOrCurricularClaim':True})
save('whole-CAN407-five-minimal-requires-plus-three-LK-only.author-candidate.json',course_candidate)
meta=read(V16/'actual-fresh407-frame-selective-independent-P8-and-other303-wholebytes.guard.receipt.json')
iso=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-five-legacy-minimal-ready-'))
shutil.copytree(meta['physicalIsolate'],iso,symlinks=True,dirs_exist_ok=True)
save('actual-own-five-legacy-frozen-input-isolate-and-minimal-author-scope.receipt.json',{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'frozenV16Handoff':bind(V16/'actual-stable-current407-P311-P8-resource-only-successor-and-15-owner-union.handoff.receipt.json'),'original407':bind(CAN_PATH),'requiresOnlyCandidate':bind(OUT/'whole-CAN407-five-legacy-minimal-requires-only.author-candidate.json'),'requiresAndCourseCandidate':bind(OUT/'whole-CAN407-five-minimal-requires-plus-three-LK-only.author-candidate.json'),'preservedP311Config':bind(V16/'book-config.reviewed407-current311-selective-root-P8-preserved-other303.inert.json'),'fiveWholeMaterialsUnchanged':True,'all47CurrentWholeExamDataUnchanged':True,'all311CurrentWholeOrdinaryGoalContractsUnchanged':True,'oldHistoricalRootMaterialApprovalRetainedWithoutReassertingReadinessNecessity':True,'noOwnMaterialDescriptionOrCourseApproval':True,'newDReviewFreezeCreated':False,'strictNetIncrease':0,'liveWrites':[]})
print(json.dumps({'physicalIsolate':str(iso),'edgeDecisions':len(rows),'keep':21,'remove':104,'requiresCounts':[{'goalId':c['goalId'],'before':len(c['beforeRequires']),'after':len(c['afterMinimalRequires'])} for c in changes],'courseProposalCount':3},indent=2))
