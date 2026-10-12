# SPDX-License-Identifier: Apache-2.0
import pathlib,json,subprocess
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2';V=pathlib.Path(str(B).replace('-v2','-v1'));cap=B/'capsule';lp=cap/'candidate/canonical532.for-normal-import.json';land=json.loads(lp.read_text());g={x['id'][:8]:x for x in land['goals']};alts={
'0b5342b9':'Zwei Verdauungsmodelle vergleichen Lactose mit und ohne Lactase: Ein Enzym zerlegt das verbundene Zucker-Bausteinpaar; ohne Lactase bleibt es verbunden. Daneben ist der Darm als schematisches Organ dargestellt.',
'127e2fc9':'Zwei unterschiedlich große symbolische Getränkeportionen stehen neben jeweils drei Zuckerwürfeln. Eine lernende Person vergleicht die Portionen; die Beschriftung lautet „Portion zählt“. Das Bild enthält keine gemessenen Zuckergehalte.',
'197bc2c5':'Eine abstrakte bunte Peptidkette zeigt in der Mitte die Bindungsgruppe C(=O)-NH. Eine Klammer kennzeichnet die C-N-Bindung als Peptidbindung.',
'360fccb9':'Schematische Lebensmittel werden vier Stoffgruppen zugeordnet: verknüpfte Zuckerbausteine, drei lange Fettsäurereste, eine Peptidkette und positive sowie negative Mineralstoffionen.',
'62149f36':'Ein vereinfachtes alpha-Aminosäuregerüst trägt Aminogruppe, Carboxylgruppe, Wasserstoff und Rest am zentralen Kohlenstoff. Darunter zeigt die Zwitterionform NH3+ und COO− am selben Gerüst.',
'8761cfd2':'Blaue Modellbausteine zeigen einen einzelnen Zuckerbaustein, ein verbundenes Paar und eine längere Kette als Mono-, Di- und Polysaccharid. Lebensmittelbilder begleiten die drei Modelle.',
'bebea164':'Vereinfachte Fettmoleküle mit drei geraden oder geknickten Fettsäureresten zeigen unterschiedliche Packung. Pflanzenöl, Sonnenblume und ein festes Fett stehen als symbolische Stoffbeispiele darunter.',
'f4d5a02d':'Ein schematisches Polarimeter zeigt Lichtquelle, Polarisator, Probenrohr und Analysator. Unterschiedliche Pfeilrichtungen veranschaulichen die Drehung der Polarisationsebene.',
'3681e688':'Drei Modelle zeigen Pepsin beim Zerlegen einer Proteinkette unter sauren Bedingungen, die Anpassung des pH im Darm und die physikalische Verteilung großer Fetttröpfchen in kleinere. Amphiphile Köpfe liegen außen, ihre unpolaren Teile im Fett.',
'68292f39':'Ein ausdrücklich vereinfachtes Bausteinmodell vergleicht Glucose mit freiem anomerem Zentrum C1 und Saccharose mit verknüpften Zentren C1 und C2. Darunter stehen ein positiver roter und ein negativer blauer Kupfer-Nachweis.',
'793189f8':'Eine schematische DNA-Leiter zeigt komplementäre Basenpaare A–T und G–C zwischen Zucker-Phosphat-Strängen. Ein Nucleotidbaustein und ein symbolisches Informationsbuch ergänzen das Modell.',
'8da5c5cf':'Eine Saftprobe, die gemessene Masse eines ausgewählten Inhaltsstoffs und das Volumen der ursprünglichen Probe führen zur Formel rho=m/V. Die Einheit g/L kennzeichnet die Massenkonzentration.',
'9abd8069':'Drei Modelle veranschaulichen hydrophile, lipophile und amphiphile Stoffe. Ein Dünndarmmodell zeigt eine Micelle im Darmlumen mit wasserzugewandten Köpfen und nach innen gerichteten unpolaren Teilen.',
'9deeac6f':'Ein vereinfachtes Kupfer(II)-Koordinationsmodell und eine violette Proteinprobe stehen neben dem Ammonium-Nachweis über Ammoniakbildung und feuchtes Indikatorpapier. Die beiden Nachweisprinzipien sind getrennt dargestellt.',
'b47d542d':'Alanin und Serin sind bei pH7 als Zwitterionmodelle mit gemeinsamen NH3+- und COO−-Gruppen dargestellt. Ihre Seitenketten CH3 und CH2OH unterscheiden sich; Wassertropfen umgeben beide Moleküle.',
'b4ca3af2':'Zwei beispielhafte Aktivitätskurven zeigen ein saures pH-Optimum für Pepsin und ein annähernd neutrales für Amylase. Die Beschriftung erklärt, dass das Optimum vom Enzym abhängt.',
'ffec1761':'Die vereinfachten Strukturformeln von Glycin und Alanin markieren den Carboxyl-Kohlenstoff als C1 und den benachbarten alpha-Kohlenstoff als C2. Die Aminogruppe sitzt jeweils an C2.',
'e9d34f34':'Drei vereinfachte dominante Glycinformen bei pH2, pH6 und pH12 tragen die Gesamtladungen +1,0 und −1. Das Zwitterion in der Mitte zeigt gleichzeitig NH3+ und COO−.',
'd8eeed29':'Zwei Fischerprojektionen von L- und D-Alanin haben COOH oben und CH3 unten. Aminogruppe und Wasserstoff stehen spiegelbildlich links beziehungsweise rechts; ein Spiegel trennt die Projektionen.',
'684ffe86':'Blaue Modellbausteine zeigen einen einzelnen Zuckerbaustein, ein verbundenes Paar und eine längere Kette als Mono-, Di- und Polysaccharid. Lebensmittelbilder begleiten die drei Modelle.',
'dfaef897':'Fischer- und Haworthprojektion von D-Glucose stehen nebeneinander. Die OH-Anordnung an C2 bis C5 bleibt erhalten; die alpha-Haworthform trägt die anomere OH-Gruppe an C1 nach unten.',
'1d2e7b80':'Ein ausdrücklich vereinfachtes Bausteinmodell vergleicht Glucose mit freiem anomerem Zentrum C1 und Saccharose mit verknüpften Zentren C1 und C2. Darunter stehen ein positiver roter und ein negativer blauer Kupfer-Nachweis.',
'cf270aaf':'Eine Peptidkette und ein vereinfachtes Cu2+-Koordinationsmodell mit vier Stickstoffdonoren zeigen den Biuret-Nachweis. Eine Proteinprobe ist violett, die Wasserkontrolle blau; gestrichelte Linien kennzeichnen Koordination.',
'ee359c2e':'Die Gleichung NH4+ + OH− → NH3 + H2O steht über einer Ammoniumprobe. Freigesetztes Ammoniak erreicht feuchtes Indikatorpapier über dem Gefäß; eine Wasserkontrolle zeigt keinen blauen Farbumschlag.',
'2f3cdec5':'Vereinfachte Fettmoleküle mit drei geraden oder geknickten Fettsäureresten zeigen unterschiedliche Packung. Pflanzenöl, Sonnenblume und ein festes Fett stehen als symbolische Stoffbeispiele darunter.',
'7371c82e':'Vereinfachte Fettmoleküle mit drei geraden oder geknickten Fettsäureresten zeigen unterschiedliche Packung. Pflanzenöl, Sonnenblume und ein festes Fett stehen als symbolische Stoffbeispiele darunter.'}
receipt=[]
for pre,alt in alts.items():
 x=g[pre];id=x['id'];d=B/'images'/id;src=d/(id+'.png')
 if not src.exists():d=V/'images'/id;src=d/(id+'.png')
 candidates=[d/'selected.actual.prompt.txt',d/'attempt-2.prompt.txt',d/'generation.prompt.txt',d/'built-in-imagegen.prompt.original.txt']
 prompt=next((p for p in candidates if p.exists()),None)
 if prompt is None:prompt=next((p for p in d.iterdir() if p.is_file() and ('prompt'in p.name) and p.suffix in ['.txt','.md']),None)
 if prompt is None:
  prompt=B/'images'/id/'reuse-unchanged-pixels.receipt.txt';prompt.parent.mkdir(exist_ok=True);prompt.write_text('Exact existing image bytes reused from '+str(src.relative_to(R))+'. No new image generation.\n')
 common=['--goal',id,'--landscape',str(lp),'--subject','chemie','--lang','de','--provider','OpenAI / ChatGPT-Codex built-in image_gen (model version not exposed)','--review-status','pilot']
 for verb in ['prepare','import']:
  args=['node',str(cap/'scripts'/f'{verb}_goal_visualization.mjs'),*common]
  if verb=='import':args+=['--image',str(src),'--prompt',str(prompt),'--license','CC-BY-4.0','--description','Visualisierung zum Lernziel: '+x['title']+'.','--alt-text',alt]
  r=subprocess.run(args,text=True,capture_output=True);log=B/'checks'/f'{id}.FINAL-metadata.normal-{verb}.actual.log';log.write_text(r.stdout+r.stderr)
  if r.returncode:raise RuntimeError(r.stderr)
  receipt.append({'goalId':id,'operation':verb,'exitCode':r.returncode,'logPath':str(log.relative_to(R))})
(B/'neutral/final26.resource-field-inputs.json').write_text(json.dumps({'schemaVersion':1,'resourceLinks':[{'goalId':g[p]['id'],'description':'Visualisierung zum Lernziel: '+g[p]['title']+'.','altText':a,'reviewStatus':'pilot','provider':'OpenAI / ChatGPT-Codex built-in image_gen (model version not exposed)','license':'CC-BY-4.0'} for p,a in alts.items()]},ensure_ascii=False,indent=2)+'\n');(B/'checks/FINAL26-metadata.normal-prepare-import.actual.json').write_text(json.dumps({'operations':receipt,'isolatedRoot':str(cap.relative_to(R)),'activeWrites':False,'scientificApprovals':0},indent=2)+'\n');print(json.dumps({'normalImports':len(alts),'finalMetadataBound':True,'activeWrites':False}))
