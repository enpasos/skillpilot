from pathlib import Path
import json
O=Path(__file__).parent
rows=json.loads((O/'whole-thirteen-author-case-performance-map-and-original-P29-contexts.json').read_text())
# These are own synthetic AUTHOR works, with manually assigned criterion marks.
# They are not student data, independent checks, or self-issued KEEP judgments.
negative={
'6600f5f0':([
'Externe Kosten fehlen im Preis. Die Obergrenze beschränkt Mengen und die Abgabe verteuert Einleitungen; die Betriebe könnten unterschiedlich reagieren. Für die Aussage, welche Regel besser sei, interessieren mich Kosten und Vollzug nicht.',
'Drei Kontrollen kosten18 und die Vermeidung10+30+60=100. Der Fonds ersetzt Schäden, nicht die Emissionsentscheidung. Ohne Regel bleibt der Schaden. Diese Zahlen reichen mir; ein Schadens-/Nutzenvergleich spielt keine Rolle.',
'Ich wähle die Obergrenze, weil sie mir gefällt. Gegengründe und Informationen sind unnötig.',
'600 liegt unter800;120−80=40 Suchende bekommen im Modell nichts. Nur80 zahlen die niedrigere Miete; Berechtigungen werden unvollständig kontrolliert.',
'Zuschüsse kosten Budget und können bei starrem Angebot Nachfragepreise erhöhen. Die Grenze könnte Qualität verringern; keine Regel würde arme Mieter nicht schützen. Ich werde diese Folgen nicht für ein Urteil gegeneinander abwägen.',
'Ich nehme einen Zuschuss, weil er schön klingt. Kurzfristige und langfristige Bedingungen ignoriere ich.'],[4,4,0,4,4,0],
'Raw16 but the whole work explicitly refuses any reasoned costs/limits-versus-alternative decision; mechanism knowledge alone does not perform the whole judging contract. Cap14 applies.'),
'd36664f5':([
'Gesamtemissionen1000→1200, also+20%, Intensität−20%.900 ist noch nicht erreicht.',
'Eine geprüfte jährliche bindende Gesamtobergrenze mit Pfad zu900 bis Jahr5, Messung und Strafen schützt die Gesamtmenge besser als reine Technikförderung bei Mengenwachstum.',
'Soziale Belastung und langfristige Wirtschaftsfolgen sind für nachhaltiges Wachstum bedeutungslos und werden nirgends berücksichtigt.',
'Kosten A120, B120, B mit Tarif130. Ressourcen60 gegen45, Zugang100 gegen80 beziehungsweise120. Anfangsinvestitionen sind40 gegen70.',
'Ich verlange ausschließlich45 Ressourcenpunkte in10Jahren mit überprüften Produktions-/Betriebsdaten. Zugang und Finanzierung müssen politisch nicht geprüft werden.',
'Ich wähle immer das niedrigste Ressourcenmaß. Gegenprioritäten und soziale oder langfristige Wirtschaftswirkungen lehne ich ab.'],[4,4,0,4,2,1],
'Raw15; calculations list access/cost numbers but the entire submission rejects their social/long-term economic meaning. Missing this whole core activates cap14.'),
'0242e34e':([
'Am6.6.2024 sanken die Raten25bp, Einlage4,00→3,75 ab12.6. Der berichtete Inflationsrückgang ist vergangener Befund;2,5/2,2/1,9 sind Projektionen.',
'Sinkende Inflation und schwache Wachstumsprognosen ermöglichen geringere Restriktion. Kredit-/Nachfragewirkung ist verzögert; Löhne erzeugen weiter Druck. Ein Preisstabilitätsmandat ist für meine Erklärung aber irrelevant.',
'Die Senkung bedeutet keine sichere weitere Zinssenkungsserie; neue Lohn-/Kreditdaten können ändern. Ich beurteile nicht, wie dies mit dem Preisziel zusammenhängt.',
'Am5.6.2025 Einlage2,25→2,00 ab11.6, −25bp.0,9/1,1/1,3 und2,0/1,6/2,0 sind damalige Projektionen; Unsicherheit/Lohntrend sind Hinweise.',
'Energie/Euroannahmen und reale Handelsunsicherheit unterscheiden2025 von2024; Kreditwirkung hängt vom Verhalten ab. Eine Mandatsprüfung lehne ich auch hier ab.',
'Wachstum ist nicht garantiert, ein aktueller Wert erzwingt keinen festen Zinsweg. Ich erwähne keine mittelfristige Preisstabilität und verknüpfe keinen Beschluss mit einem Mandat.'],[4,3,2,4,3,2],
'Raw18, but neither dated decision is explained in its actual medium-term mandate. Good dates/arithmetic and transmission cannot replace the entirely absent mandate linkage. Cap14 applies.'),
'79d244e0':([
'Staatsanleihenverluste schwächen Banken. Rettung erhöht Staatsschuld, weitere Zweifel treffen die Banken erneut; weniger Kredite drücken Jobs. Gemeinsame Geldpolitik ersetzt keine nationalen Bilanzmittel.',
'Aufsicht kontrolliert Risiken vorab, Abwicklung verteilt existierende Verluste. Wie ein Fonds finanziert wird, wer haftet oder welcher Anreiz entsteht, wird nicht untersucht.',
'Ich nehme beides, weil das Wort Bankenunion gut klingt. Umsetzung und Verteilung werden ignoriert.',
'R hat Abschwung, S Preisdruck; eine gemeinsame Senkung hilft R, belastet S. R hat keinen eigenen Euroleitzins oder abwertbaren nationalen Wechselkurs. Nationale Reaktionen bleiben nötig.',
'Nationale Rücklagen stammen aus früheren Mitteln; ein gemeinsamer Fonds kann asymmetrische Schwäche glätten. Wie Mittel bezahlt, Auslösekriterien gestaltet oder Vorsorgeanreize beeinflusst werden, lasse ich aus.',
'Ich behaupte keine Lösung ohne Verluste, gebe aber weder eine begründete Reformwahl noch Haftungs-/Finanzierungs-/Anreizgrenze.'],[4,1,0,4,2,0],
'Raw11 already fails. The core reform-mechanism-plus-limits contract is absent; the cap cannot turn failure into a pass.'),
'bc3f895f':([
'Im Oktober1973 begann der reale Ölauslöser. D rechnet300→250, Multiplikator5, ΔY−50.',
'S ergibt270 und108. Diese Werte sowie250 sind die tatsächlich gemessene ganze historische Wirkung von1973; Fiktion und Historie unterscheiden sich für mich nicht.',
'Energiedaten, Aufträge und Auslastung könnten künftige Entscheidungen begleiten; ich nehme die gerade errechneten Werte als historischen Beweis.',
'I=40−5r ergibt30→20, ΔI−10; Faktor3 gibt−30. Altprojekte behalten zunächst ihren Zins.',
'Energieknappheit begrenzt Kapazität, Verunsicherung senkt Konsum, neue Kreditkosten senken I. Feste Preise und unveränderte Kreditzinsen sind dabei verletzbar.',
'Ich würde eine Energiegrenze und neue/alte Kreditanteile ergänzen und mit Auftrags-/Energiedaten prüfen. Das ändert meine Gleichsetzung der A-Modellwerte mit gemessener Historie nicht.'],[3,2,2,4,4,4],
'Raw19 includes a good second-case model analysis, but wholly mislabels every historical-versus-fictional A value. The explicit whole-source/fictitious-data core violation caps14, not local rounding or another model choice.'),
'8ebbbe19':([
'100→106 sind6%. Aufträge+8 bei fast voller Kapazität und stabiler Energie sprechen für Nachfrageüberhang; Kreditgleichlauf allein isoliert keine Ursache.',
'Über die Wirkung einer Zinsdämpfung, allgemeinen Zuschüssen oder gezielter Hilfe möchte ich nichts erklären. Sämtliche Optionen sind einfach gut.',
'Ich empfehle alle Optionen ohne Bedingungen; Verteilung oder Timing ist nicht relevant.',
'Energie−20%, Preis+40% und Produktion−4% sprechen für Angebot/Kosten. Neue nominale Verträge und Erwartungen können Zweitrundenreaktionen erzeugen; sie sind nicht automatisch bewiesen.',
'Was Ersatzlieferung, Verbilligung, Zinsänderung oder Hilfe bewirkt, bleibt in meiner Arbeit vollständig unerklärt.',
'Ich behaupte keine eindeutige Ursache aus einer Rate, treffe aber auch keine begründete Maßnahmenentscheidung.'],[4,0,0,4,0,1],
'Raw9 already fails; correct diagnosis alone cannot fulfil policy mechanisms and limits.'),
'f70be9a9':([
'H verliert real≈4,55%; fester Betrag≈9,09%. Korb- und Vertragseffekte können abweichen.',
'Unternehmensmarge hängt von Kostengewichten/Weitergabe ab. Staatszahlungen und jede Analyse des Staates lasse ich völlig aus.',
'Haushalte und Unternehmen sind verschieden betroffen; weitere Marge-/Verbrauchsdaten sind nötig. Zum Staat sage ich nirgends etwas.',
'A zahlt5, B5,8 statt5, neuer Betrieb11,6 statt10, neue Einlage2,5 statt2. Das staatliche Anleihebeispiel lasse ich weg.',
'B hat weniger verfügbares Einkommen, A zunächst nicht; Betrieb könnte Investition reduzieren. Bankpolitik und Bonität begrenzen Weitergabe. Kein Staatseffekt wird genannt.',
'Weitergabe ist nicht gleich1, Altverträge und Neuverträge sind zeitlich anders. Für Haushalt/Betrieb brauche ich Vertragsanteile und Ertragserwartung.'],[4,1,2,3,3,4],
'Raw17, but the entire third actor government is missing across price and interest cases. Cap14 is specific to the complete three-actor contract, not a demand for a certain sentence in each subtask.'),
'6f1f4654':([
'Vier Namen: Preise, Beschäftigung, Außenbalance, Wachstum. Arbeitslosigkeit sinkt, reales Wachstum ist3%; hohe Preise und Defizit sind problematisch; Stetigkeit braucht mehrere Jahre. §1 gibt keine festen Grenzwerte.',
'Ich berechne nichts weiter. Wie eine Maßnahme Ziele gemeinsam beeinflusst oder einen Konflikt schafft, erläutere ich nirgends.',
'Ich bevorzuge Wachstum ohne Begründung oder Gegenargument. Umwelt ist eine zusätzliche Perspektive, kein fünftes wörtliches Ziel.',
'Niedrige Inflation erreicht nicht alle Ziele: hohe Arbeitslosigkeit, Stagnation,8% Überschuss ist nicht automatisch Gleichgewicht. Grenzen fehlen im Gesetz.',
'Welche Wirkungen Weiterbildung, Finanzierung oder Zeitverzug auf die Ziele haben, lasse ich vollständig aus.',
'Ich nehme wieder Wachstum aus persönlichem Geschmack. Daten über Beschäftigung und Außenursachen wären grundsätzlich verfügbar.'],[4,0,1,4,0,1],
'Raw10 fails; statutory labels/data classification without any target relationship or reasoned balancing is not whole performance.'),
'550a050a':([
'Leistungsplus6 erfolgt ohne neuen Beschluss automatisch; Transfer und Bau sind neue Entscheidungen.10·0,8=8 Erstkonsum,2 sparen, kein garantierter Gesamteffekt.',
'Transfer startet jetzt, Bau in zwei Jahren und kann dann Produktivität helfen. Budget und Kreditkosten sind unbekannt. Wie dies konjunkturell wirkt, erläutere ich nicht.',
'Ich wähle Transfer nur wegen des Wortes schnell, ohne Nachfrage-/Auslastungsbegründung.',
'Hohe Auslastung und6% Preise stehen im Dossier. Ich stelle bewusst keine Verbindung zwischen Nachfrage, Kapazität und Stabilisierung her.',
'Unbefristete Steuersenkung ist dauerhaft, Auslaufen befristet; gezielte Hilfe ist gegenfinanziert, Nettoeffekt kann wegen Konsumquoten unbekannt sein. Eine Wirkung auf diese Konjunkturlage begründe ich nicht.',
'Ich kann nach Empfängern und Budget fragen, entscheide aber auch jetzt ohne einen konjunkturbezogenen Maßnahmenmechanismus.'],[4,3,0,1,3,2],
'Raw13 already fails: timing and arithmetic are incomplete substitutes for the absent cycle-dependent policy mechanism.'),
'a773d8a6':([
'Aufträge3,85%, Produktion−1,02%, Arbeitslosigkeit+0,2pp;108 ist8% über Basis, nicht Monatsrate.',
'Aufträge können vorlaufen, Beschäftigung nachlaufen. Ich werde die Reihen aber nirgends zu einer Diagnose verbinden.',
'Eine Phase wähle ich nicht, auch keine Gegenhypothese oder zeit-/branchenbezogene Prüfung.',
'108/112−1≈−3,57%, Auslastung−7pp, Planquote−15pp beziehungsweise−30%. Nominal und real unterscheiden sich.',
'Pläne sind nicht tatsächliche Investitionen; Deflator und Struktur können unpassend sein. Ich untersuche nicht, was die drei Hinweise zusammen bedeuten.',
'Auch die Variation und Gesamtdiagnose lasse ich unbegründet; ich liste lediglich diese Einzelzahlen.'],[4,2,0,4,2,0],
'Raw12 fails. Complete isolated arithmetic with no multivariate conditional interpretation is not the contract.'),
'0e5b12a1':([
'A Fehler+0,5pp, B+1pp;1 liegt in0,5–2,5 ohne angegebene Wahrscheinlichkeit. B war energiebedingt.',
'A näher nur in diesem Jahr; unterschiedliche Vintages, Energieannahme und Modelldaten erlauben keinen allgemeinen Rang. Bedingte Prognosen können nützlich sein.',
'Ich vergleiche zukünftig gleiche Horizonte, Vintages und mehrere Jahre, werde B aber mit keiner neuen Information revidieren.',
'Monat+0,4 ist nicht Jahr+1,8;−0,2 ist ein Stornoszenario. Alte Energieannahme ist fraglich.',
'Energieausfall bricht Aufträge→Produktion. Aktuelle Daten helfen eher kurzfristig, nicht bei allem; Messrevision und Vorhersagefehler sind verschieden.',
'Ich beurteile Fehler später anhand gleicher Zielgrößen und Erst-/Revisionswerte. Kein Update der Inputs, Annahmen, Szenarien oder Prognose nach dem Schock wird durchgeführt.'],[4,4,1,4,4,1],
'Raw18; comparison and error literacy are strong, but no forecast revision is actually performed anywhere despite new information. Cap14 applies to wholly absent updating.'),
'25278ecf':([
'Das Dossier stammt aus2023. Lieferkosten und robuste Nachfrage können zusammenwirken, Geldgleichlauf beweist keine alleinige Ursache; Zeit-/Sektormengen helfen trennen.',
'110/113,3 und125/128,75 ergeben10/3 sowie25/3 Prozent. Disinflation heißt langsamerer Anstieg, keine Rückkehr zum Basisniveau.',
'Feste Nominalbeträge verlieren Kaufkraft, persönliche Gewichte sind nicht automatisch amtlicher VPI oder exakte laufende Kosten; Qualität/Mengen fehlen. Historie und Fiktion sind getrennt.',
'−1,82% und−1,85% bei breit anhaltendem Preisfall sind Deflation, keine bloß niedrigere positive Inflation; Gewichte müssen vergleichbar sein.',
'Einkommen100 hat90,91→94,34 Kaufkraft. Bei der Schuld50 rechne ich zwar45,45→47,17, behaupte aber, diese Zunahme sei eine sichere Entlastung des Schuldners, weil bei Deflation alle Schulden leichter werden.',
'Nachfragerückgang und Produktivitätsgewinn sind konkurrierende Erklärungen; eine Spirale braucht weitere Erwartungs-/Mengeninformationen. Meine Interpretation jeder festen realen Schuld als Entlastung bleibt bestehen.'],[4,4,4,4,1,4],
'Raw21 despite a complete false debt-burden core. Cap14 covers wholly wrong real-debt interpretation; it must not trigger for a small arithmetic error with correct burden reasoning.'),
'b2419b68':([
'1/(1−0,75)=4,10·4=40, Konsum erzeugt weitere Einkommen. Ich halte diese Zahl für sicher reale sofortige Produktion.',
'Importe40%, volle Baukapazität und zwei Jahre Anlagenbau haben meiner Meinung nach keinen Einfluss; keine Annahme ist relevant.',
'Modell eignet sich überall sicher ohne Erweiterung oder Datenprüfung.',
'20·10=200 jährliche Menge. Kapazität, Produktion und Verkauf sind immer genau dasselbe;200 werden daher nächsten Monat sicher verkauft.',
'Ausbildung zwölf Monate, Abschlüsse, Anlagen, Matching und Nachfrage ignoriere ich als bedeutungslos.',
'16·10=160 ist eine weitere sichere Verkaufszahl. Daten oder bedingte Entscheidungen fehlen völlig.'],[3,0,0,1,0,1],
'Raw5 fails. Arithmetic without usable assumptions or limits cannot be called model evaluation.')}

partial={
'6600f5f0':[
'Anwohnerkosten sind extern. Grenze sichert Menge bei Vollzug, Abgabe macht Verschmutzen teuer, ohne bekannte Reaktion keine feste Menge. Ich erläutere die benötigte Information nicht weiter.',
'Kontrolle18, Vermeidung100 mit ungleichen Lasten. Fonds zahlt Schäden, ändert nicht den Einleitungsanreiz; ohne Regel Schäden. Die Schadenshöhe für Nettovergleich bespreche ich nicht.',
'Bei zwingender Schadensgrenze bevorzuge ich kontrollierte Mengenbegrenzung; höhere ungleiche Kosten sprechen gegen Starrheit. Verlässliche Messung ist Bedingung, weitere neue Daten nenne ich nicht.',
'Die Grenze unter800 lässt40 Suchende ohne Wohnung, erfolgreiche80 zahlen600; Zugang hängt von Vergabe ab. Zur unvollständigen Kontrolle ergänze ich nichts.',
'Zuschuss hilft Bedürftigen, kostet Budget und kann bei starrem Angebot Preise erhöhen. Grenze kann Angebot schädigen, Nicht-Eingreifen arme Mieter ausschließen. Prüfaufwand führe ich nicht aus.',
'Gezielte Hilfe plus spätere zusätzliche Wohnungen ist plausibel, bei sicherer Bedürftigkeitsprüfung. Eine temporäre Grenze ist bei guter Vergabe Gegenposition. Eine genaue zusätzliche Datenerhebung lasse ich offen.'],
'd36664f5':[
'1000→1200, insgesamt+20%, Intensität−20%; Effizienz allein reicht nicht. Die900-Zielprüfung schreibe ich nicht ausdrücklich.',
'Jährlicher kontrollierter Gesamtemissionspfad bis900 in Jahr5 mit Sanktionen schafft Vermeidungsanreiz; Technikhilfe allein sichert Menge nicht. Die konkrete unabhängige Kontrollorganisation bleibt offen.',
'Regel schützt langfristige Ressourcen, kostet Anpassung und belastet ärmere Verbraucher; Erlösrückverteilung kann schützen. Eine genau benannte neue Datenquelle fehlt.',
'A120, B120, B+Tarif130. B spart Ressourcen, Tarif schafft Zugang120. Anfangsfinanzierung70 statt40 ist schwieriger; ich quantifiziere Ressourcen-/Zugangsdifferenz nicht.',
'Ich wähle B+Tarif bei gesicherter Finanzierung über10Jahre:45 Ressourcenpunkte und120 erreichbare Stellen mit überprüften Fahrplänen. Zur Ressourcenkontrolltechnik mache ich keine Angabe.',
'Ökologie und Zugang können zusammen verbessert werden, aber zusätzliche Mittel/Anfangskapital fehlen anderswo. A ist bei Finanznot vertretbar. Ungewisse Lebensdauer begrenzt Vergleich, weitere Umweltfolgen nenne ich nicht.'],
'0242e34e':[
'2024:4→3,75,25bp, ab12.6.; vergangener Inflationsrückgang ist Befund, Jahresraten sind Projektionen. Den Unterschied Prozent zu Prozentpunkt vertiefe ich nicht.',
'Niedrigerer Druck und reale Schwäche erlauben weniger Restriktion, Kredittransmission verzögert;2% mittelfristig bleiben Ziel. Lohn-/Binnenpreisrisiko erwähne ich hier nicht.',
'Keine Zielaufgabe: mittelfristige Rückkehr und weiterhin restriktiver Stand sind vereinbar. Neue Lohndaten könnten ändern; keinen festen weiteren Pfad unterstellen. Andere Unsicherheit nenne ich nicht.',
'2025:2,25→2,00, ab11.6.,25bp; Zukunftswerte sind damalige Prognosen und keine heutigen Befunde. Die reale0,9/1,1/1,3-Reihe lasse ich unzitiert.',
'Niedrigere Energie-/Euroannahmen und Handelsunsicherheit passen zur Anpassung im2%-Mandat; Nachfragewirkung ist unsicher.2024 hatte größeren Preisüberhang. Einen genaueren Wachstumsmechanismus lasse ich offen.',
'Aktueller Zielwert erzwingt keinen Automatismus; Kreditsenkung garantiert kein Wachstum. Neue Energie-/Kreditdaten können die Sicht ändern. Eine eigene weitere Gegengewichtung bleibt unentwickelt.'],
'79d244e0':[
'Staatsverlust trifft Banken, Rettung schwächt Staat und weitere Verluste Banken; Kredite und Jobs leiden. Geldpolitik ersetzt diese Bilanzverluste nicht. Den Steuereinnahmenkanal führe ich nicht aus.',
'S überwacht vorher, A behandelt Verluste; Eigentümerhaftung kann Rettungsanreize begrenzen, finanzierter Fonds braucht Mittel. Gegenrisiko möglicher Panik lasse ich weg.',
'Kombination mit glaubwürdiger Verlustzuordnung und Schutz kritischer Zahlung passt, bleibt nicht verlustfrei. Fondsgröße und Anleihebestände prüfen. Verteilung auf einzelne Gläubiger führe ich nicht aus.',
'Ein Zins kann R unterstützen und S Preise erhöhen; R hat keinen nationalen Eurozins/Wechselkurs. Andere Anpassung ist nötig, aber ich benenne keinen weiteren Kanal.',
'Nationale Rücklagen schnell, aber müssen existieren; Fonds teilt extreme Schocks, Beiträge/Prüfung nötig. Vorsorgeanreize kann man durch Bedingungen stärken, Details der Auszahlung fehlen.',
'Ich bevorzuge kontrollierte Risikoteilung mit nationaler Vorsorge; Eigenverantwortung ist ernsthafter Gegengrund. Zuständigkeit und Schwellen prüfen, demokratische Legitimation erläutere ich nicht weiter.'],
'bc3f895f':[
'Oktober1973 ist realer Ölangebotsauslöser. Fiktives D:300→250, Multiplikator5; weniger I senkt Einkommen und Konsum. Den−50-Unterschied rechne ich nicht extra aus.',
'S setzt270/108 bei Energieknappheit; D feste Preise und Nachfrageverlust. Keiner dieser Zahlen ist1973-Messwert. Den Preisanstieg8% benenne ich nicht.',
'Bei freier Kapazität/Auftragsverlust D, bei Energiebottleneck S, Mischfall getrennt. Energielieferungen und Aufträge prüfen. Eine zweite zeitliche Beobachtung führe ich nicht aus.',
'I30→20,Δ−10; Nachfrage−30 nur mit Faktor3 und dessen Annahmen. Festkredite ändern nicht sofort. Anteil neuer Kredite bleibt unerwähnt.',
'Energie begrenzt Angebot, Unsicherheit Konsum, neue Zinsen Investition. D ignoriert Kostenpreise, Kreditregel Altverträge. Die sichere Preisrichtung behaupte ich nicht, erläutere sie aber kaum.',
'Energiegrenze und Kreditanteile ergänzen, dann Liefer-/Auftragsreihen prüfen. Gemischter Gegenwind bleibt bedingt. Eine genaue Form dieser Erweiterung schreibe ich nicht auf.'],
'8ebbbe19':[
'6% Preise bei starken Aufträgen/voller Kapazität sprechen für Nachfrage, stabile Energie dagegen für keinen ersten Energieschock. Andere Ursachen bleiben möglich; Geldkausalität führe ich nicht aus.',
'Zinsdämpfung bremst Nachfrage verzögert und kostet Jobs; allgemeiner Zuschuss verschärft Engpass. Gezielte Hilfe schützt Schwache mit Gegenfinanzierung; Verwaltungsgrenze fehlt.',
'Dämpfung mit Absicherung unter anhaltendem breitem Druck vertretbar. Lohndaten und Auslastung prüfen; Investitionsverlust ist Gegengrund. Einen weiteren Transmissionstest lasse ich aus.',
'Energieknappheit+40% Kosten und fallender Output stützen Angebotserklärung, Erwartungen können Zweitrunden treiben. Gleiche Rate beweist nicht gleiche Ursache. Die Lohnvertragszeit führe ich nicht aus.',
'Ersatz erzeugt Teilenergie und kostet, Verbilligung belastet Budget/Sparanreize; Zins schafft keine Energie. Hilfe verteilt nur Last. Finanzierung der Hilfe erläutere ich nicht.',
'Gezielte befristete Hilfe plus geprüfter Ersatz, Erwartungsdruck beobachten. Härterer Zins bei Entankerung ist Gegenposition; Lieferzeit/Daten nötig. Die genaue soziale Zielauswahl bleibt offen.'],
'f70be9a9':[
'H real−4,55%, fester Betrag−9,09%,+5 nominal reicht nicht bei+10 Preisen. Unterschiedliche persönliche Korbgewichte können ändern; eine genaue neue Korbprüfung fehlt.',
'Firmenergebnis hängt von Weitergabe ab; fester Staatsbetrag50 real45,45, gekoppelter nominal55 real50. Budget und Empfänger unterscheiden sich. Genauer Kostenmix wird nicht analysiert.',
'Haushalt/Firma/Staat sind nicht gleich betroffen; feste Schuldzinsen ändern jetzt nicht. Neu-/Refinanzierung zählt später. Eine weitere Informationsgrenze nenne ich nicht.',
'A5 unverändert, B5,8, neuer Betrieb11,6, Staat30; Einlage2,5. Andere Banken sind unbekannt. Eine der Differenzrechnungen schreibe ich nicht hin.',
'Haushalt B weniger Geld, Firmennachfrage eventuell schwächer, Staat später bei Refinanzierung; Wettbewerb/Bonität bestimmen Durchgriff. Sparverhalten erwähne ich nicht.',
'Weitergabe0,8/0,5 statt1, Verträge und Zeit entscheidend, Erträge und Kreditanteile fehlen. Kein sicherer Gesamteffekt; weitere Staatsbudgetentscheidung lasse ich offen.'],
'6f1f4654':[
'Preise5% problematisch, Jobs verbessern, reale3% Wachstum, Außenminus wächst. Stetigkeit braucht Reihe; §1 ohne feste Grenzwerte. Mehr Beschäftigungsmaße erwähne ich nicht.',
'Bau kann Jobs/Wachstum gemeinsam stützen, aber bei Knappheit Preise drücken und Importe Außenlage belasten. Langfristige Produktivität bedingt; weitere Details fehlen.',
'Gestaffelter Bau statt sofortiger Ausweitung schützt Kapazität; verlorene Jobs sind Gegengrund. Umwelt ist separate Perspektive, Daten zur Bauauslastung fehlen. Andere Außenursachen bespreche ich nicht.',
'Niedrige Inflation reicht nicht: Jobs schlecht, Output stagniert, Überschuss kein automatisch guter Außenstand. Kein gesetzlicher Schwellenautomatismus; Saldenursachen lasse ich unerläutert.',
'Weiterbildung verbessert Kapazität später und kann Jobs/Wachstum verbinden; Steuern bremsen kurz Nachfrage. Umsetzung entscheidend; Außeneffekt ist nicht ausformuliert.',
'Gezielte Investition unter gesicherter Wirksamkeit ist plausibel, Finanzierung Gegenargument; Beschäftigungsreihen prüfen. Weitere Zeit-/Brancheninformationen bleiben offen.'],
'550a050a':[
'Bestehende Regel automatisch+6, neue Transfer/Bau-Beschlüsse diskretionär; Erstkonsum8 und Sparen2. Weitere Gesamtnachfrage nicht garantiert; Importgrenze lasse ich offen.',
'Transfer jetzt, Bau erst in zwei Jahren, kann dann Produktivität stützen; Kredite kosten und freie Kapazität zählt. Genaues Targeting bespreche ich nicht.',
'Bei freier Kapazität schnelle Hilfe für laufende Nachfrage, Bau trotzdem längerfristig wichtig. Abschwungdauer und Finanzierung prüfen; zusätzliche Empfängerdaten lasse ich offen.',
'Bei voller Auslastung kann mehr Nachfrage eher Preise als reale Mengen erhöhen; A-Annahme gilt nicht. Stärke des Effekts ist unbekannt; Investitionsrückwirkung fehlt.',
'Dauerhafte Steuersenkung braucht Finanzierung, Auslaufen mindert zusätzlichen Impuls, Zielhilfe verteilt gegenfinanziert um. Unterschiedliche Konsumquoten bedeuten nicht sicher null; Jobfolge des Auslaufens lasse ich weg.',
'Auslaufen mit gezielter Absicherung ist bedingt plausibel, Steuersenkung kann anders verteilte Hilfe schaffen. Empfänger-/Budgetdaten nötig; weiteres Gegenargument bleibt unvollständig.'],
'a773d8a6':[
'Aufträge≈3,85%, Produktion≈−1,02%, Arbeitslosigkeit+0,2pp. Index und Monatsrate sind verschieden; eine relative Quotenrechnung ergänze ich nicht.',
'Aufträge vorlaufend, Jobs nachlaufend, Produktion noch schwach; früher Turn möglich statt sicherer Boom. Stornos als alternative Ursache bespreche ich nicht.',
'Frühe Erholung bei noch laufendem Abschwung möglich, bloß Sonderauftrag Gegenhypothese; weitere Produktionsmonate/Auslastung prüfen. Branchenprüfung bleibt offen.',
'Realumsatz≈−3,57%, Auslastung−7pp, Plananteil−15pp. Pläne relativ−30 rechne ich nicht aus; nominale+8 sind nicht reale+8.',
'Alle drei Hinweise schwach statt sicherer Boom, Pläne sind Erwartungen, nicht ausgeführt; passender Deflator nötig. Güterstrukturgrenze lasse ich weg.',
'Bedingte Schwächephase, sinkende Preise/steigende Auslastung könnten günstiger sein, nicht automatisch Boom. Zusätzliche reale Produktion prüfen; genaue Größe der Variation fehlt.'],
'0e5b12a1':[
'FehlerA0,5pp/B1pp, A-Band enthält Ist, ohne Wahrscheinlichkeit; B energiebedingt. Absolutfehler werde ich nicht extra benennen.',
'A näher in diesem Jahr, nicht generell; unterschiedliche Vintage/Annahmen beachten. Bedingte Vorhersage nützlich, Modelldetails sind nicht bekannt; weitere Vergleichsjahre fehlen.',
'B mit neuer Energie-/Nachfragemenge und zwei datierten Energieszenarien revidieren; gleiche Horizonte/Vintages vergleichen. Eine genaue Unsicherheitsdarstellung fehlt.',
'Monat/Jahr sind verschiedene Zielgrößen,−0,2 Stornoszenario kein Band, alte Energieannahme fraglich. Januar-/Februar-Vintagebezug lasse ich hier weg.',
'Energieausfall bricht Auftragsproduktion, Jahresmodell aktualisieren, kurze Reihe nicht für alles besser. Messrevision ist nicht Prognosefehler; einen genaueren Horizontgrund liefere ich nicht.',
'Lieferersatz/Ausfalldauer als neue Annahme prüfen, Energie und Aufträge aktualisieren, später gleiche Messstände/Horizonte vergleichen. Ein Fehler macht Modell nicht nutzlos; mehrjährige Gütemaße bleiben offen.'],
'25278ecf':[
'Historisches2023-Dossier: Kostenengpass und tragfähige Nachfrage verstärken, Geldgleichlauf ist kein alleiniger Beweis. Mengen-/Zeitfolge prüfen; eine weitere Sektorenreihe fehlt.',
'Allgemein110/113,3 und10/3%, H125/128,75 und25/3%. Disinflation ist weiterer Niveauanstieg. Die Gewichtung begründe ich nur knapp.',
'Fester Betrag verliert Kaufkraft, H hat anderes Basisgewicht, kein automatisch amtlicher/exakter aktueller Index. Qualitätsänderung und Ersatzkauf fehlen; historische und Modellwerte bleiben getrennt. Weitere Kausalfrage lasse ich offen.',
'−1,82/−1,85%, anhaltend breit Deflation, keine bloß geringere Inflation. Gewichte vergleichbar; Qualität erwähne ich hier nicht.',
'Einkommen90,91→94,34, Schuld45,45→47,17 real höher, Schuldnerlast steigt trotz gleichbleibendem50%-Verhältnis. Spätere Einkommen können sinken; einen Schulddifferenzwert rechne ich nicht extra.',
'Nachfrageminus und bessere Technik sind konkurrierend; Warten kann verstärken, muss belegt werden. Nicht alle profitieren, keine automatische Spirale. Eine genau benannte isolierende Beobachtung bleibt offen.'],
'b2419b68':[
'Multiplikator4,ΔY40; Einkommen erzeugt Folgekonsum bei c0,75 unter festen Preisen/freier Kapazität. Die gesamte geometrische Summe schreibe ich nicht aus.',
'Importe, voller Bau und zweijährige Verzögerung verletzen Voraussetzungen,40 nicht garantiert. Ein genauer alternativer Effekt ist ohne Modell nicht berechenbar; Preisfolge wird nicht vertieft.',
'Modell zeigt bedingtes Verstärkungsprinzip, Import-/Kapazitätsgrenze ergänzen; Auslastung/Lieferketten prüfen. Genaues politisches Urteil bleibt knapp.',
'200 jährliche Zusatzkapazität nur nach Ausbildung/Anlagen, nicht garantierter Verkauf; Produktion muss Nachfrage finden. Individuellen Auslastungsplan lasse ich offen.',
'Zwölf Monate, Abschlüsse, Matching und Nachfrage begrenzen. Anlagen sind ebenfalls nötig; Datensicherheit fehlt. Den Ausfallmechanismus erläuter ich kurz.',
'Stufenfinanzierung mit geprüftem Absatz und Abschlüssen; bei16 geeigneten Beschäftigten Obergrenze160, kein Absatzversprechen. Daten machen Modell nützlich, weitere Kostenprüfung fehlt.']}

works=[]
for r in rows:
    prefix=r['assessedCurrentGoalId'][:8]
    positive=r['caseA']['solutions']+r['caseB']['solutions']
    # The exact six full author solution paragraphs are an AUTHOR model work.
    # No claim that writing the solution is an independent review.
    works.append({'materialId':r['materialId'],'type':'own-complete-author-model-work',
                  'wholeSubmissionParagraphs':positive,'manualCriterionMarks':[4]*6,'rawPoints':24,
                  'wholeCoreAbsence':False,'finalPoints':24,'passes':True,
                  'manualScientificReason':'Complete own expected work: the six substantive mechanism, calculation, judgment and limit contributions are present; independent science remains pending.'})
    answer, marks, reason=negative[prefix]
    assert len(answer)==len(marks)==6
    raw=sum(marks);final=min(raw,14)
    works.append({'materialId':r['materialId'],'type':'own-complete-core-counterwork',
                  'wholeSubmissionParagraphs':answer,'manualCriterionMarks':marks,'rawPoints':raw,
                  'wholeCoreAbsenceOrCompleteFalseCore':True,'capApplied':raw>14,
                  'finalPoints':final,'passes':False,'manualScientificReason':reason})
    answer=partial[prefix]
    assert len(answer)==6
    works.append({'materialId':r['materialId'],'type':'own-complete-imperfect-reasoned-partial-work',
                  'wholeSubmissionParagraphs':answer,'manualCriterionMarks':[3]*6,'rawPoints':18,
                  'wholeCoreAbsence':False,'finalPoints':18,'passes':True,
                  'manualScientificReason':'Each paragraph actually contains the relevant mechanism or conditional judgment; its explicit stated omission limits that rubric row. The missing detail is local, not complete absence of the whole essential competence; no blanket perfection/case quota cap.'})
for w in works:
    assert sum(w['manualCriterionMarks'])==w['rawPoints']
    assert all(0<=n<=4 for n in w['manualCriterionMarks'])
    assert w['passes']==(w['finalPoints']>=15)
assert len(works)==39
result={'role':'OWN_AUTHOR_39_WHOLE_SYNTHETIC_WORKS_234_MANUAL_CRITERION_DECISIONS_NOT_INDEPENDENT_KEEP',
        'wholeWorkCount':len(works),'manualCriterionDecisions':sum(len(w['manualCriterionMarks']) for w in works),
        'completeCoreCounterworksFail':13,'imperfectCompleteWorksPass':13,'ownModelWorks':13,
        'wholeCoreRawPassingBypassesPrevented':sum(w['type']=='own-complete-core-counterwork' and w['rawPoints']>=15 for w in works),
        'actualObservedLearners':False,'independentScienceApproval':False,'works':works}
(O/'actual-39-own-whole-synthetic-works-and234-manual-rubric-decisions.author-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='works'},indent=2))
