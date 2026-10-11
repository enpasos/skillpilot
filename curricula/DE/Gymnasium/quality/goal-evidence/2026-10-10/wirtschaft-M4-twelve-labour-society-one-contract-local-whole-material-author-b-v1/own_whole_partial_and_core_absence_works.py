"""Own actual complete synthetic works and individual manual rubric decisions."""
import copy,hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent
B=json.loads((O/'whole-twelve-labour-society-DEEN-readable-two-case-one-contract.DRAFT-author-v1.json').read_text())
D=json.loads((O/'actual-twelve-individual-separated-core-two-case-and-course-author-decisions.json').read_text())['rows']
F={};N={}
def fair(key,answers,marks,reasons):
 assert len(answers)==len(marks)==len(reasons)==6
 F[key]=dict(answers=answers,marks=marks,reasons=reasons)
def negative(key,essentialMissing,replacements,marks,reasons):
 assert len(marks)==len(reasons)==6
 N[key]=dict(essentialMissing=essentialMissing,replacements=replacements,marks=marks,reasons=reasons)

fair('776457c2',[
'Die konkrete Arbeitszeitlage fällt bei ausdrücklich fehlender vorrangiger Regel unter§87. Beide verhandeln, notfalls entscheidet die Einigungsstelle. Bloße Bekanntgabe genügt nicht.',
'Mitentscheidung über die Lage ist konkreter als Schutzprüfung/Vorschläge/Information aus§80. Beschäftigte brauchen Abholungssicherheit, die Firma spätere Besetzung; geregelte Verhandlung kann Konflikte bearbeiten, aber nicht verschwinden lassen.',
'Ich befürworte gemeinsam vereinbarte passende Spätschichten mit verlässlicher Vorankündigung. Betreuung und Besetzung sind Kriterien. Gegenposition: Organisation wird aufwendiger. Rechte dürfen dabei nicht entfallen; einen genauen Schichtplan liefere ich nicht.',
'Die Schutzvereinbarung ist zu prüfen. Person, Unterweisung und Datum vor erstem Maschinenstart müssen zuordenbar sein; die undatierte Gesamtliste reicht nicht. Ein Vorschlag zur Besprechungszeit ist kein allgemeines Veto.',
'§80 gibt Aufgaben/Information, nicht automatisch für jede Anregung§87. Beschäftigte können Risiken sichtbar machen; die Firma muss verlässliche Umsetzung organisieren. Weitere Dokumentenarten benenne ich nicht.',
'Unterweisung sofort gezielt klären, Schutzregel erfüllen; Besprechungen regelgebunden verhandeln. Ressourcenknappheit hebt Schutz nicht auf. Drei Berichte begründen Prüfung, keinen Befund über alle.'
],[4,3,3,4,3,3],[
'Tatbestand/Vorbehalt und Einigungsweg vollständig.', 'Rechtsunterschied und beidseitiger konkreter Nutzen; Funktion knapp.', 'Bedingtes Urteil und Gegenposition; organisatorische Ausarbeitung begrenzt.', 'Schutz/Info und konkrete Beleggrenze vollständig.', 'Rechtsunterschied und beidseitige Umsetzung; Einzelheiten knapp.', 'Priorisierung/Schutz und Reichweite, bedingtes Urteil eher kurz.'])
negative('776457c2','Arbeitnehmerperspektive vollständig fehlend',{
1:'§80 ist von der konkreten§87-Mitentscheidung zu trennen. Die Firma benötigt späte Besetzung und vorhersehbare Verhandlung. Zu Interessen oder Folgen für Beschäftigte mache ich ausdrücklich keine Aussage.',
2:'Ich bevorzuge gemeinsam verhandelte passende Spätschichten mit Vorankündigung, weil die Firma ihre Besetzung planen kann. Zusätzlicher Organisationsaufwand ist ein Einwand. Beschäftigtenfolgen oder Betreuung bewerte ich nirgends.',
4:'§80 ist Aufgabe/Information, kein allgemeines Veto. Die Firma gewinnt verlässliche Umsetzung, muss aber Informationen organisieren. Die Beschäftigtenperspektive lasse ich aus.',
5:'Schutzregel erfüllen und die drei Berichte prüfen; die Firma muss Ressourcen planen. Berichte beweisen nicht die Lage aller. Die Folgen aus Sicht der Beschäftigten beurteile ich nicht.'
},[4,2,2,4,2,3],['ARechtsfall unverändert richtig.','Rechtsunterschied/Firmenwirkung; Arbeitnehmerperspektive fehlt.','Firmenkriterium/Gegenposition; ganze zweite Sicht fehlt.','BRechts-/Belegfrage unverändert richtig.','Rechtsunterschied/Firma ohne zweite Sicht.','Recht/Prüfung/Reichweite vorhanden, kein Arbeitnehmerurteil.'])

fair('e20f9304',[
'Heute170 Einnahmen,190 Ausgaben, Lücke20; künftig185 gegen210, Lücke25. Amtliche15/40Milliarden sind andere datierte bedingte Modellwerte, keine gemessenen2030Ergebnisse und keine beschlossenen Sätze.',
'16% ergeben196 Einnahmen und14 Lücke; Steuer10 oder wirksame unnötige Kostenvermeidung10 lassen15. Die behauptete Unnötigkeit benötigt Versorgung-/Wirksamkeitsbelege; eine genaue Prüfmethode fehlt hier.',
'Ich bevorzuge bedingt Steuer plus belegte unnötige Kostenvermeidung; Restfinanzierung bleibt offen. Bedarfsgerechter Zugang und Einkommensbelastung sind Kriterien. Einwand sind unsichere Einsparung und steuerliche Verteilung; eine pauschale nötige Leistungskürzung ist keine automatisch faire Lösung.',
'Umlage heute600 Beiträge und600 Leistungen, künftig540 und720 mit180 Lücke. Amtliche2025Raten sind datierte Annahmen, keine Garantie. Meine Modellpersonen sind nicht die amtliche Bevölkerung.',
'Benötigter Modellsatz720/2700=26⅔%. Steuer180 und breitere tragfähige Erwerbsbasis sind verschiedene Wege; neue Beschäftigung ist nicht gesichert. Der Rechensatz ist keine Rechtsentscheidung.',
'Höhere Beiträge belasten heutige Erwerbstätige; geringe Renten können niedriges Alterseinkommen treffen. Generationen-/Einkommensgerechtigkeit und Finanzierbarkeit abwägen, Gesundheitsgrenzen längerer Arbeit beachten. Ich wähle nur bedingte Finanzierung mit Schutz; genauere Gewichtung bleibt offen.'
],[4,3,3,4,3,3],['Finanzierung/Rechnung/Quellenstatus vollständig.','Optionen korrekt, Belegprüfung nur kurz.','Konkrete Gerechtigkeitskriterien/Belastung, Mischung bleibt unvollständig.','Umlage/Zahlen/Datum vollständig.','Zwei Mechanismen und Satz, Bedingungen knapp.','Beide Gerechtigkeitsdimensionen und Schutz, begrenzte Priorisierung.'])
negative('e20f9304','Gerechtigkeitsbeurteilung vollständig fehlend',{
2:'Ich vergleiche lediglich Finanzierung: Steuer10 und wirksame unnötige Kostenvermeidung10 würden die Lücke zusammen mindern; verbleibende Beträge müssen gedeckt werden. Unsichere Einsparung ist ein Einwand. Zugang, Einkommenslast und Gerechtigkeit bewerte ich überhaupt nicht.',
5:'Finanzierung braucht höhere Beiträge, Steuer oder tragfähigere Erwerbsbasis. Beschäftigung ist nicht garantiert und keine einzelne Reform wird zwangsläufig wirksam. Generationen, Einkommensgruppen und Gerechtigkeit beurteile ich nirgends.'
},[4,3,1,4,3,1],['AFinanzierung/Datum korrekt.','AOptionsrechnungen vorhanden.','Nur Finanzierungsbedingung, keine Gerechtigkeitskriterien.','BUmlage/Datum korrekt.','BZweiMechanismen/Rechensatz vorhanden.','Nur Finanzierung, kein Gerechtigkeitsurteil.'])

fair('3ac589b5',[
'Technik-/Sorgeerwartungen öffnen sich. Formale Bewerbung gab es schon, Empfehlungen waren aber enger. Anteile ändern sich30/13Punkte; keine Einzelfähigkeit wurde gemessen.',
'Transparente Gespräche, Plätze und Zeiten können die Empfehlungs-/Zeitbarriere mindern. Vergleiche Bewerbungen, Kriterien und Interessen; mehrere Änderungen lassen keine einzelne sichere Ursache erkennen.',
'Ich bewerte vorläufig bessere Wahlmöglichkeiten positiv. Langfristige Ergebnisse fehlen und Gruppen haben keine einheitlichen Interessen. Eine vollständig ausgearbeitete zusätzliche Untersuchung fehlt.',
'Bewerbungen20/60→50/70%, Teilnahme10/30→25/35%; unter Bewerbenden jeweils50% Auswahl. Betreuung ist keine angeborene Fähigkeit und die Geschlechteranteile sind unbekannt.',
'Abendzeiten und informelle Nominierung können Zugang begrenzen; alternative Zeiten und transparente Bewerbung können hier helfen. Kapazität und Vortrends prüfen, bevor man Ursache oder gerechte Auswahl behauptet.',
'Offene Bewerbung und Zeiten geben bedingt mehr Wahl; konstante50%Auswahl beweisen nicht faire Kriterien. Weitere Ergebnis-/Qualifikationsdaten wären nötig. Andere Prioritäten bleiben möglich.'
],[3,4,2,3,4,3],['Dokument/Fähigkeitsgrenze und Zahlen, Entwicklung nur kurz.','Mechanismus und spezifische Alternativ-/Prüfbelege vollständig.','Wertkriterium/Grenze, Untersuchung nicht ausgeführt.','Verteilungen/Gruppe klar; Aufnahmequote nicht numerisch einzeln ausgeführt.','ZweiInstrumente/Beleggrenzen vollständig.','Bedingte Wahl und spezifischer Datenbedarf, Gewichtung knapp.'])
negative('3ac589b5','konkreter Zugangsänderungsmechanismus vollständig fehlend',{
1:'Es gibt nun mehr Plätze und andere Termine. Bewerbungs-/Kriterien-/Interesseninformationen könnten den Befund prüfen. Wie die Maßnahmen eine konkrete Hürde verändern, erkläre ich ausdrücklich nicht.',
2:'Veränderte Anteile sind nicht sämtliche langfristigen Ergebnisse. Interessen sind nicht angeboren aus Gruppenzahlen ableitbar. Über eine Maßnahme oder deren Wirkungsweg urteile ich nicht.',
4:'Bewerbungs- und Auswahlquoten isolieren keine Ursache; Kapazität und Vortrends fehlen. Ich erläutere nirgends, warum Uhrzeiten oder Bewerbungswege tatsächlichen Zugang verändern könnten.',
5:'Konstante Auswahl50% beweist nicht faire Kriterien. Ergebnis-/Qualifikationsdaten fehlen. Den Maßnahmeeffekt oder eine bedingte Zugangsentscheidung bespreche ich nicht.'
},[3,1,2,3,1,2],['AVerteilung richtig.','Prüfbedarf, aber kein Mechanismus.','Grenze/Interessen, keine Maßnahmenanalyse.','BVerteilungen richtig.','Beleggrenzen, kein Instrumentweg.','Kriterienbeleggrenze, keine konkrete Maßnahme.'])

fair('7aef0e2f',[
'Netzwerk sieht den kontrollierenden Plattformknoten und Gebührenzugang; Risiko sieht den technisch erzeugten Ausfall mit grenzüberschreitender ungleicher Betroffenheit. Beide betreffen denselben Lieferfall.',
'Beziehungen/Zugang und Schadensverteilung/Verantwortung sind andere Schwerpunkte. Verschiedener Fokus macht nicht automatisch ein Modell falsch; keines bestimmt individuelle Angst.',
'Ich würde Abhängigkeiten der Kleinbetriebe und ihre Verluste erheben. Die Fragen passen zu den Linsen, genaue Daten-/Vertragsgestaltung arbeite ich nicht aus.',
'Rationalisierung sieht standardisierte Fristen/Meldungen; Netzwerk sieht Geräte, Hilfsgruppen und Informationszugang. Gleiches Gerät beweist nicht gleiche individuelle Erfahrung.',
'Gleiche Regel ist keine gleiche tatsächliche Teilhabe. Regelstruktur und Beziehungen ergänzen sich; allein aus beidem folgt kein individueller Erfolg.',
'Bedürfnisse, Unterstützung und Hilfe könnten Erfahrungen unterscheiden. Eine vergleichbare Befragung wäre sinnvoll; genaue Durchführung fehlt.'
],[4,3,2,4,3,2],['Zwei konkrete Anwendungen vollständig.','Fokus/Ergänzung klar, jeModellreichweite knapp.','Zwei passende Fragen, Methodendetails fehlen.','ZweiModelle am selben Fall vollständig.','Regel/Zugang und Ergänzung, individuelles Ergebnis knapp.','Grenze und mögliche Befragung, konkretere Erhebung fehlt.'])
negative('7aef0e2f','zweite Perspektive in beiden Anwendungen vollständig fehlend',{
0:'Nur Netzwerk: kontrollierender Plattformknoten und teurer Zugang können Kleinbetriebe ausschließen. Keine Risikoperspektive wird angewandt.',
1:'Netzwerk hilft Beziehungen/Zugang zu sehen, erklärt nicht jede persönliche Erfahrung. Einen zweiten Fokus vergleiche ich nicht.',
2:'Ich frage nach Alternativzugang und Gebührenabhängigkeit. Vertrags-/Zugangsdaten helfen; andere Fragen stelle ich nicht.',
3:'Nur Netzwerk: Geräte, private Gruppen und Hilfe verteilen Zugang ungleich. Rationalisierung bearbeite ich nicht.',
4:'Gleiche Frist ist kein gleicher Geräte-/Hilfszugang. Das begründe ich ausschließlich mit Netzwerkbeziehungen.',
5:'Bedürfnisse und Hilfe können Erfahrungen unterscheiden; befrage vergleichbar. Einen weiteren Modellfokus bespreche ich nicht.'
},[2,1,2,2,1,2],['EinNetzwerkfokus statt zwei.','Ein Fokus/Beleggrenze statt Vergleich.','Passende Netzwerkfrage/Daten.','EinNetzwerkfokus statt zwei.','Zugang richtig, Ergänzung fehlt.','Erfahrungsgrenze/Befragung, keine zweite Perspektive.'])

fair('ae91ad7d',[
'Mittelwerte beide2000, Spannweiten2000/400; niedrige Werte50%/0 unter der rein fiktiven1500Marke. Einkommen ist nicht die ganze soziale Lage.',
'Gleiche Mittelwerte verdecken Streuung. Arbeitsstunden oder Zugang zu stabilen Stellen könnten Unterschiede erklären; persönliche Schuld folgt nicht. Die Qualifikationsalternative führe ich nicht aus.',
'Vergleiche Stunden und Zugangswege bei ähnlichen Ausgangsbedingungen. Vermögen und Bildung fehlen; eine konkrete Erhebungsstrategie bleibt knapp.',
'Abschlüsse80/50%, Beratung70/30%, Differenzen30/40Punkte. Individuelle Beratung/Abschlusszuordnung und Einkommen sind nicht gegeben.',
'Beratung kann Information/Zugang verbessern; Verkehr oder Selbstselektion können ebenfalls wirken. Die Tabelle beweist weder Beratungseffekt noch angeborene Gruppenursache.',
'Vergleichbare Ausgangsdaten und individuelle Beratungs-/Ergebniszuordnung erheben. Vorleistungen können verzerren; ich plane keinen vollständigen Versuchsaufbau.'
],[4,3,3,4,3,3],['Verteilungszahlen und Dimension vollständig.','Gleichheitsprüfung/bedingte Ursachen, Vergleich knapp.','SpezifischeDaten und Reichweite, Strategie knapp.','Verteilungen/Dimension/Individualgrenze vollständig.','Mechanismus/Alternative, Prüfung knapp.','Passende Ausgangsdaten/Verzerrung, Umsetzung offen.'])
negative('ae91ad7d','bedingte Ursachen-/Mechanismenanalyse vollständig fehlend',{
1:'Gleicher Mittelwert bedeutet nicht gleiche Verteilung: Die Spannweiten und niedrigen Anteile unterscheiden sich. Ich bespreche überhaupt keine mögliche Ursache.',
2:'Weitere Verteilungs-, Vermögens- und Bildungsdaten könnten die Reichweite erweitern. Ich verknüpfe sie ausdrücklich nicht mit einem möglichen Ursachenmechanismus.',
4:'Gruppenangaben sind kein angeborener Individualbeweis. Beratung und Verkehr benenne ich nicht als Wirkungswege oder Ursachen.',
5:'Individuelle Zuordnung und Ausgangsdaten fehlen. Aus Gruppenwerten folgt keine vollständige Diagnose; eine mögliche Ursache untersuche ich nirgends.'
},[4,2,2,4,1,2],['AVerteilung vollständig.','Behauptung widerlegt, Ursachen fehlen.','Reichweite/Daten ohne unterschiedenes Ursachenargument.','BVerteilung vollständig.','Individualgrenze, Mechanismus fehlt.','Zuordnung/Grenze, keine Ursachenprüfung.'])

fair('eee7217a',[
'A ist ILO-erwerbstätig wegen bezahlter8Stunden und nach den genannten übrigen Bedingungen registriert arbeitslos. B ist ILO-erwerbslos, nicht registriert; C ohne Suche keine Erwerbsperson. Beide Quoten10% haben unterschiedliche Nenner.',
'Dauerhafte internationale Verlagerung und anderer Technikbedarf sprechen für passende Qualifizierung/Vermittlung statt bloßer Stundenüberbrückung.120Vakanzen sind noch keine120Nettojobs; Zugänge und tatsächliche Besetzung fehlen.',
'Betreuung/Verkehr und Kosten gegen neue tragfähige Arbeit abwägen. Vortrends und ähnliche Nichtteilnehmende prüfen, weil Mitnahme ohnehin zustande gekommene Jobs meint; Verdrängung erkläre ich nicht näher.',
'ILO80/1000=8%. Register100→80 heißt20weniger/20% wegen aktiver Maßnahmen, keine20neuen Jobs; die20 erfüllen weiter ILO-Suche/Verfügbarkeit ohne Arbeit.',
'Vorübergehende ausländische Nachfrageschwäche bei passender Qualifikation spricht bedingt für Überbrückung. Bleibt sie dauerhaft, ändern sich die Bedingungen; Neuqualifizierung ist ohneMismatch nicht automatisch passend.',
'Behandelt+20 gegenüber+16, Unterschied4Indexpunkte. Vortrends und weitere Schocks fehlen für sichere Kausalität. Ein vollständiges Kosten-/Verteilungsurteil arbeite ich hier nicht aus.'
],[4,3,3,4,3,2],['Statusdefinitionen/Quoten vollständig.','Struktur/passendeMaßnahme, Nettobeleggrenze knapp.','Kosten/Zugang und Mitnahmeprüfung, Verdrängung knapp.','Quote/Registergesetz/ILO klar.', 'Nachfrage/Passung, Gegenmaßnahme knapp.', '4Punkte/Vergleichsgrenze richtig, Kosten/Verteilung fehlt.'])
negative('eee7217a','ILO-/Registerdefinitionen tatsächlich nirgends angewandt',{
0:'Ich behandle die Personenstatus und beide Quoten überhaupt nicht. Dauerhafte Verlagerung und unterschiedliche Qualifikation sind Strukturbedingungen, keine Zahlenthemenantwort.',
3:'Die persönlichen Definitionen,8%-Quote und Registeränderung interpretiere ich nirgends; über registriert/erwerbslos mache ich keine Aussage.'
},[0,3,3,0,3,2],['AStatus/Quoten vollständig fehlend.','AGegebenesStrukturargument erhalten.','AKosten/Kontrollargument erhalten.','BStatus/Quoten vollständig fehlend.','BPassung erhalten.','B4Punkte/Kausalgrenze erhalten.'])

fair('85f0b64f',[
'Individueller Vertrag verbindet Arbeitnehmerin und Arbeitgeber zu abhängiger Arbeit/Vergütung. Tarifvertrag ist kollektive Norm zwischen Gewerkschaft und Arbeitgeber/Verband. Durchführung zählt; Tarifautonomie ist nicht freie einseitige Setzung.',
'Bei gegebener Bindung/Scope unterschreitet23die zwingende25ohne Öffnung.27ist günstiger bei gleichen Bedingungen. Sondergruppen oder Nachwirkung nehme ich nicht an; deren Einzelregeln führe ich nicht aus.',
'Planbare Wechsel und gültige Vergütung helfen Beschäftigten, Besetzung und Kosten betreffen die Firma. Ein vereinbartes transparentes Einsatzfenster ist bedingt sinnvoll; Zustimmung kann die zwingende25nicht beseitigen. Eine zweite Organisationsalternative fehlt.',
'Feste Weisungen, Ort, Zeiten und fremde Organisation stützen persönliche Abhängigkeit trotz „frei“. Das ist Gesamtbetrachtung im konkreten Fall, nicht jede Projektarbeit gleich.',
'Veröffentlichter26Tarif verdrängt ungebunden24nicht automatisch; in der geänderten gebundenen Scope-Variante gilt26. Die kollektiven Parteien verhandeln. Die Veröffentlichung allein ist keine Normgarantie.',
'Firma möchte Flexibilität, Beschäftigte Verlässlichkeit/Einkommen. Vereinbarte planbare Fenster mit korrekter Entgeltwirkung sind möglich. Nichtbindung ist keine allgemeine Schutzlosigkeit; über reale unbekannte Ansprüche urteile ich nicht.'
],[4,3,3,4,3,3],['Beziehungen/Parteien/Durchführung/Autonomie vollständig.','Entgelt/Bindung/Scope, Ausnahmen knapp.','BeideInteressen/Rechtsgrenze, Organisationsausarbeitung knapp.','Konkrete Gesamtbetrachtung vollständig.','BeideScenarios/Parteien, Autonomie knapp.','BeidseitigeLösung/Fallgrenze, Gewichtung knapp.'])
negative('85f0b64f','kollektive tatsächliche Normgeltung durchgehend falsch',{
1:'Eine persönliche Zustimmung zu23macht jeden25Tarif unverbindlich, obwohl beide hier gebunden sind;27wäre auch möglich. Bindung und Geltungsbereich spielen für Lohn nie eine Rolle.',
4:'Jeder veröffentlichte26Branchentarif gilt sofort für alle, auch ohne Bindung, Allgemeinverbindlichkeit oder Bezug. Die geänderte Bindung hat überhaupt keine Bedeutung.',
2:'Ich würde zu verlässlichen Schichten und günstigen Kosten raten und stets23vereinbaren, weil persönliche Zustimmung alle Tarife verdrängt.',
5:'Planbare Einsatzfenster helfen beiden Seiten. Ich halte trotzdem unverändert daran fest, dass jeder veröffentlichte Tarif für alle gilt und Zustimmung ihn zugleich beliebig beseitigt.'
},[4,0,1,4,0,1],['Beziehungs-/Parteiwissen erhalten.','ZwingendeNorm durchgehend falsch.','EinOrganisationsinteresse, unzulässigeGrundlage.','KonkreteStatusargumentation erhalten.','Bindungs-/Veröffentlichungsregel falsch.','Planbarkeit erwähnt, Rechtsgrundlage falsch.'])

fair('60ec0ead',[
'Mira bleiben vor anderen Ausgaben−200oder+400, trotz Arbeit unsicher. Jaro deckt Modellfixkosten, vermisst Erwerbsanerkennung. Das ist keine sichere Sparfähigkeit oder gesamte Lebensqualität.',
'Unsichere Nachfrage und verlorene Produktion können wirtschaftlich wirken; öffentliche Finanzierung und Teilhabe gesellschaftlich. Sorge/Quartierhilfe sind wertvoll ohne Lohn; gleiche Qualifikation ist kein Schuldbeweis. Genauen Fiskalbetrag habe ich nicht.',
'Planbarkeit und Selbstbestimmung sprechen bedingt für stabilere Zeiten und passenden Übergang. Flexibilität/Kosten sind Gegenargumente, heben unfreiwillige Unsicherheit aber nicht auf. Eine Gesundheitsdiagnose fehlt zu Recht.',
'Ina ist länger unfreiwillig ausgeschlossen, Rem wählt geschützte Weiterbildung. Dauer/Freiwilligkeit ändern Einkommen, Kontakte und Identität; beide leisten Sorge und Engagement.',
'Umsatzindex−12%, Steuer−8%; Erwerbsverlust kann Nachfrage/Finanzierung betreffen, andere Ursachen fehlen. Bildung kann Chancen verbessern, garantiert keine Stelle. Die konkrete gesellschaftliche Verteilung erkläre ich nur knapp.',
'Verkehr, Schutz und tragfähige Finanzierung bedingt verbinden. Kosten können kurzfristig steigen, später Teilhabe helfen; Passung muss geprüft werden. Persönliche Prioritäten bleiben unterschiedlich.'
],[4,3,3,4,3,3],['ALage/Salden/Grenzen vollständig.','Wirtschaft/Gesellschaft vorhanden, Differenzierung knapp.','Kriterien/Gegenargument/Grenze vorhanden, Umsetzung knapp.','BDauer/Freiwilligkeit/Bedeutung vollständig.','Daten/mechanism/gesellschaftlicherBezug, Verteilung knapp.','BedingtesUrteil/Passungsgrenze, Konkretheit begrenzt.'])
negative('60ec0ead','gesellschaftliche Bedeutung vollständig fehlend',{
1:'Nachfrage und Produktion können mit Erwerbsarbeit zusammenhängen. Zu Gesellschaft, öffentlicher Finanzierung, Teilhabe oder Sorge-/Quartierarbeit sage ich nichts.',
2:'Ich gewichte ausschließlich Miras/Jaros Einkommen, Planbarkeit und persönliche Wahl. Flexibilität und Kosten stehen gegenüber; jede gesellschaftliche Betrachtung lasse ich aus.',
3:'Ina hat längere unfreiwillige Einkommens-/Identitätsunsicherheit als Rem im freiwilligen finanziell gesicherten Lernübergang. Über Engagement oder gemeinschaftliche Bedeutung mache ich keine Aussage.',
4:'Umsatzindex−12%, Steuer−8% sind genannte Daten, aus denen ich nur Nachfrageumsatz als Wirtschaftsindikator bespreche. Gesellschaftliche Finanzierung oder Teilhabe erläutere ich nicht.',
5:'Individuelle Verkehrsbedingungen, Einkommen und berufliche Passung gewichte ich bedingt. Zur Gesellschaft äußere ich mich nirgends.'
},[4,2,2,3,2,2],['AIndividuelleBedeutung vollständig.','Wirtschaft ohne Gesellschaft.','Individuelle Kriterien/Gegenargument, gesell.Dimension fehlt.','BDauer/Freiwilligkeit, Engagement fehlt.','Wirtschaftsdaten, gesellschaftlicherMechanismus fehlt.','IndividuelleZugangsentscheidung, gesellschaftlicheGrenze fehlt.'])

fair('44080e8d',[
'Simuliertes Protokoll: Tag1,8–15, Diagnose beobachtet und mitgeschrieben; Tag2,8–15, selbst angeleitete Liste mit zwei korrigierten Fehlern; Tag3,9–16, Kundengespräch gehört. Teamhilfe und Lieferunsicherheit sind Belege; „alles allein“ ist unbelegte Interpretation.',
'Systematisches Suchen und Teamhilfe passen zu Kim; Gespräche und wechselnde Zeiten brauchen weitere Erfahrung. Drei Tage reichen nicht für endgültige Eignung. Ich gewichte Planbarkeit höher; die langfristige Belastung bleibt offen.',
'Technische Ausbildung nach weiterer Diagnoseerkundung mit späterer Spezialisierung; Lagerorganisation nach weiterer Daten-/Organisationspraxis mit späterer Fortbildung. Beide verlangen echte Zugangs-/Finanzierungsrecherche. Konkrete Zulassungsbelege fehlen.',
'Besuchsprotokoll:10Uhr Terminplanung/Liste beobachtet, Übergaben gefragt, keine Pflegehandlung. Alex’ Verkauf/Wechsel/Fortbildung und Schichtangaben sind Interview-Selbstauskunft; Flyer ist ungesicherte Werbung. Zugang und reale Schichten fehlen.',
'Organisation/Helfen passt zu Sam, feste Empfangszeiten zur Planbarkeit; Pflegeschichten können dagegen stehen. Alex’ Wandel ist eine Möglichkeit, kein eigener Wegbeweis. Eine längere Aufgabenbeobachtung wäre nötig.',
'Administration mit späterer Fortbildung nach Anforderungsrecherche; alternativ Pflegeaufgaben weiter erkunden und dann nach Schichtpassung entscheiden oder in Verwaltung wechseln. Biografien dürfen sich ändern; Flyer garantiert keinen Platz.'
],[4,3,3,4,3,3],['Konkrete strukturierte Dokumentation/Beteiligung/Interpretation.','DreiKriterien/kurzeGrenze, Gewichtung knapp.','ZweiWege/Entscheidung/Recherche, Detailbedingungen offen.','Konkrete Besuchs-/Quellendokumentation vollständig.','Passung/Bedingung/fremdeBiografie, Urteil kurz.','ZweioffeneWege/Recherche, Ausarbeitung knapp.'])
negative('44080e8d','mehrere begründete Erwerbswege vollständig fehlend',{
2:'Technische Aufgaben und Lagerarbeit wurden erwähnt. Ich entwickle über die gesamte Arbeit keinerlei möglichen eigenen oder simulierten Erwerbsweg, Entscheidungspunkt oder Weiterbildungsweg.',
5:'Alex’ Biografie ist nur ein fremdes Beispiel. Ich entwickle ausdrücklich keine möglichen Biografien für Sam und keine Entscheidungspunkte; sämtliche anderen Dokumentations- und Bewertungsaussagen bleiben bestehen.'
},[4,3,0,4,3,0],['ADokumentation erhalten.','ABewertung erhalten.','AWege vollständig fehlend.','BDokumentation erhalten.','BBewertung erhalten.','BWege vollständig fehlend.'])

fair('a5009946',[
'R5Punkte ergibt24/Stunde, S8ergibt30;6Stunden Zeit144. Stück U240×0,60=144,V300×0,60=180 mit144Bodenschutz. Tätigkeitsanforderung ist nicht individuelles Tempo.',
'Zeitmodell gibt gleiche planbare Basis; Stückmodell mehr bei V, kann Menge/Belastung beeinflussen. Qualität/Zulieferung begrenzen persönliche Kontrolle. Einen genauen Belastungsvergleich liefere ich nicht.',
'Firma gewinnt Mess-/Mengenanreiz, aber Qualitätskontrolle und Schutz bleiben nötig. Ich wähle bedingt Basis plus prüfbaren Outputbonus, Gegenposition ist Fehlanreiz und Kontrollaufwand. Mehr Menge ist nicht automatisch Gewinn.',
'Zusätze Periode1:18/20/20, Periode2:18/0/0; Grundvergütung bleibt. Leitungsaufgabenwert ist nicht guter persönlicher Output oder Teamqualität.',
'Feste18ist sicherer Zusatz, Qualität belohnt Teamleistung und kann einen sorgfältigen Einzelnen treffen; Gewinn trägt Nachfrageeinfluss. Gleiche20geben unterschiedliche Anreize und Risiken. Eine genaue Verteilung nach Einzelleistung fehlt.',
'Firma gewinnt variable Kostenflexibilität, muss Qualitätsmessung/Teamrisiko prüfen. Ich wähle klare Basis und überprüfbare Qualitätsregel bedingt; schwächere individuelle Anreize sind Gegenargument. Geschützte Basis bleibt erhalten.'
],[4,3,3,4,3,3],['Job-/Leistungsbasis und Zahlen vollständig.','Arbeitnehmersicherheit/Anreiz/Einfluss, Belastungsdetail knapp.','Unternehmeranreiz/bedingteWahl/Gegenargument, Schutzdetails knapp.','Zusatz/Basis/Anforderung getrennt vollständig.','Risiko/Team/Differentrules, Einzeldetail fehlt.','Kostenflexibilität/Messung/Wahl, Umsetzung knapp.'])
negative('a5009946','Arbeitsbewertung vollständig fehlend trotz richtiger Leistungs-/Vergütungsrechnung',{
0:'Für R-Zeit6×24=144; Stück U144,V180mitFloor144. Die Vorgaben5/8, Qualifikation, Verantwortung und Komplexität sowie den Unterschied von Arbeits- und Leistungsbewertung interpretiere ich überhaupt nicht.',
3:'Zusätze sind18/20/20und18/0/0; Grundvergütung bleibt. Zur Arbeitsbewertung, Tätigkeitsverantwortung oder Aussage eines Leitungstitels äußere ich mich nirgends.'
},[2,3,3,2,3,3],['Vergütungszahlen, separateArbeitsbewertung fehlt.','Arbeitnehmerurteil erhalten.','Unternehmerurteil erhalten.','Zusatzrechnung/Basis, Tätigkeitsdimension fehlt.','Risiko/Anreize erhalten.','Unternehmerurteil erhalten.'])

fair('410e7ab4',[
'Fehler ohne Beschämung besprechen und Mitsprache können Problemantrieb/Sicherheit fördern, dann Vorschläge. Motivation ist Handlungsbereitschaft, Zufriedenheit bewertet die Arbeit; ein Bericht misst nicht alle.',
'Zufriedenheit+16Punkte, Vorschläge verdoppelt, Reklamationen−1Punkt. Das sind Erfolgsindikatoren, ohne Kosten/Erlöse kein Gewinnbeweis und keine selben Einzelpersonen.',
'Geräte und Teilebeschaffung änderten sich auch. Ich würde vergleichbar weiter prüfen statt alleinige Kulturursache zu behaupten; eine ausgearbeitete Entscheidung/Gegenposition fehlt.',
'Umsatzranglisten können Verkauf motivieren und Hilfe verdrängen. Hohe Anstrengung kann bei niedriger Zufriedenheit entstehen; Kulturpraxis und beide Konstrukte sind verschieden.',
'Gewinn100→50trotz Umsatz1000→1100; Zufriedenheit−15Punktebei anderer Beteiligung. Erfolg ist mehr als Umsatz, aber die genaue Kostenursache ist unbekannt.',
'Qualität/Hilfe als zusätzliche Kriterien testen und faire Messung prüfen. Eine genaue Gegenposition und weitere Datenerhebung arbeite ich nicht aus.'
],[4,4,2,4,3,2],['KonkreteKette/MotivationZufriedenheit getrennt.','AlleVeränderungen/Erfolgsgrenzen vollständig.','Kausalprüfung vorhanden, Entscheidung/Gegenposition fehlen.','KonkreteKette/Konstruktunterschied vollständig.','Profitkontrast/Befragungsgrenze, Erfolgskriterien knapp.','Falländerung/Messprüfung, Gegenposition/Datenbedarf unvollständig.'])
negative('410e7ab4','Motivation/Zufriedenheit werden durchgehend fälschlich gleichgesetzt',{
0:'Die Kulturpraxis kann Vorschläge fördern. Motivation und Zufriedenheit sind aber stets dieselbe Größe, deshalb beweisen74%Zufriedene genau74%Motivation und jede berichtete Anstrengung zugleich Zufriedenheit.',
3:'Verkaufsranglisten können Anstrengung fördern und Hilfe mindern. Hohe Anstrengung ist zwingend identisch mit hoher Zufriedenheit, deshalb können sich beide nie unterscheiden;55%ist derselbe direkte Motivationswert.'
},[2,4,2,2,3,2],['PlausibleKette, eigenerKonstruktunterschied falsch.','Zahlen/Erfolgsgrenzen erhalten.','Kausalprüfung erhalten.','PlausibleKulturkette, Unterschied falsch.','Profitkontrast/Beleggrenze erhalten.','Änderung/Messprüfung erhalten.'])

fair('8768186a',[
'Industrie−20,Dienste+20Punkte; digitaleAufgaben+50sind branchenübergreifend, keine vierte Branche. Querschnitte zeigen nicht dieselben persönlichen Wechsel.',
'Paare mit Kindern−15,Einpersonen+15,Bildung+30Punkte. Neue Organisation/Lernmöglichkeiten können entstehen, ohne schlechte Familienqualität oder sicheren Lernerfolg zu beweisen; Alltagsschritte bleiben knapp.',
'DigitaleFortbildung mit Betreuung/Geräten kann Arbeit und Haushalt verbinden, aber Zeit/Gerät fehlen manchen. Technik ist mögliche Ursache, nicht durch Anteile bewiesen; ich plane keine vollständige Maßnahme.',
'Remote-fähig+25,Schichtwechsel+5; Überschneidung unbekannt.25/45=5/9haben Raum/Zugang,20fehlt er. Capability ist nicht tatsächliche Homeofficearbeit für alle.',
'Einpersonen+8auf38%,Paare−8auf32%,Bildung+20auf30%. All-Aussagen falsch; Teilnahme ist kein garantierter Abschluss. Nichtjede neue Möglichkeit ist schlecht.',
'Planbare gemeinsame Zeiten/Räume und erreichbare Lernangebote können helfen; persönliche Ziele bleiben verschieden, Zeit/Betreuung begrenzen. Nutzungs-/Abschluss-/Vergleichsdaten fehlen für Ursache; konkrete Umsetzung knapp.'
],[4,3,3,4,3,3],['Arbeits-/Digitalwerte/Querschnitt korrekt.','Familie/Bildung/Grenze, Alltag knapp.','DreiBereiche/Handlung/Ursachenhypothese, Umsetzung knapp.','Arbeitswerte/Überlappung/Zugang vollständig.','Familie/Bildung/AllAussagen, Organisation kurz.','Handlung/Materialgrenzen/Kausalbedarf, Gewichtung kurz.'])
negative('8768186a','Bildungswandel in gesamter Arbeit vollständig fehlend',{
1:'Paare mit Kindern−15,Einpersonen+15Punkte. Das kann Haushaltsorganisation verändern, beweist keine Familienqualität. Bildungsdaten oder Bildungsauswirkungen bespreche ich überhaupt nicht.',
2:'Planbare Arbeitszeiten und Betreuung/Geräte können Arbeits- und Haushaltsorganisation helfen; Zugang fehlt manchen. Bildungswege oder Bildungsteilnahme beziehe ich nirgends ein. Technik ist mögliche, nicht bewiesene Ursache.',
4:'Einpersonen+8auf38%,Paare−8auf32%; weder alle allein noch alle flexibel. Bildungsdaten, Lernen oder Abschlüsse interpretiere ich ausdrücklich nirgends.',
5:'Planbare Arbeits-/Betreuungszeiten und Räume helfen bedingt; persönliche Ziele und materielle Grenzen unterscheiden sich. Bildung schließe ich aus; Vergleichsdaten fehlen für Ursache.'
},[4,2,2,4,2,2],['AArbeit korrekt.','AFamilie/Grenze, Bildung fehlt.','Arbeit/Familie/Beleggrenze, Bildungslink fehlt.','BArbeit korrekt.','BFamilie/AllGrenze, Bildung fehlt.','Arbeit/Familie/Ursache, Bildung fehlt.'])

works=[]
for m,d in zip(B,D):
 k=d['goalId'][:8];f=F[k];n=N[k]
 for kind,answers,marks,reasons,cap in [
 ('own new fair partial complete six-answer work',f['answers'],f['marks'],f['reasons'],False),
 ('own complete core-absence/consistently-false counterwork',[n['replacements'].get(i,a) for i,a in enumerate(f['answers'])],n['marks'],n['reasons'],True),
 ('own omitted-whole-second-application submission variant',f['answers'][:3]+['Diese ganze zweite Anwendung bleibt ausdrücklich unbearbeitet.']*3,f['marks'][:3]+[0]*3,f['reasons'][:3]+['Keine zweite fachliche Anwendung eingereicht.']*3,True)]:
  raw=sum(marks);final=min(raw,14) if cap else raw
  assert all(0<=x<=4 for x in marks)
  verdict='PASS' if final>=15 else 'FAIL'
  assert verdict==('PASS' if not cap else 'FAIL')
  works.append({'materialId':m['id'],'assessedGoalId':d['goalId'],'kind':kind,'actualCompleteSixAnswerWork':answers,
   'actualIndividualManualRubricDecisions':[{'step':s['id'],'actualPoints':mark,'stepMaximum':4,'manualReason':reason} for s,mark,reason in zip(m['examData']['scoring']['steps'],marks,reasons)],
   'essentialMissingOrFalse':n['essentialMissing'] if 'counterwork' in kind else ('whole second application' if cap else None),
   'actualRawScore':raw,'narrowCoreCapApplied':cap,'actualFinalScore':final,'actualResult':verdict,
   'oneWrongDetailOrSubtaskAloneNotACapReason':True,'AUTHOROnlyNotIndependentLearnerOrScienceEvidence':True})
assert len(works)==36 and len({w['assessedGoalId'] for w in works})==12
p=O/'actual-own-twelve-fair-twelve-core-counterworks-twelve-whole-second-omissions216-manual-rubric-decisions.AUTHOR.json';assert not p.exists()
out={'role':'Own AUTHOR synthetic execution and manual grading, not independent review or observed learner evidence','wholeBodySha256':hashlib.sha256((O/'whole-twelve-labour-society-DEEN-readable-two-case-one-contract.DRAFT-author-v1.json').read_bytes()).hexdigest(),
 'actualWholeSubmissionCount':36,'actualManualStepDecisionCount':216,'actualFairPartialPASS':12,'actualCoreCounterworksFAIL':12,'actualOmittedSecondApplicationsFAIL':12,
 'actualCoreRawPASSConvertedTo14FAIL':sum('counterwork' in w['kind'] and w['actualRawScore']>=15 for w in works),
 'actualCoreAlreadyRawFAIL':sum('counterwork' in w['kind'] and w['actualRawScore']<15 for w in works),'works':works,'strictNetGain':0}
p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ('works','wholeBodySha256')}))
