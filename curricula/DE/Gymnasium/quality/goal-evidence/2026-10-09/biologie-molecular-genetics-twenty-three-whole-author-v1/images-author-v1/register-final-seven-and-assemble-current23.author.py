from pathlib import Path
import runpy,json,hashlib,datetime,copy,re
from PIL import Image
B=Path(__file__).resolve().parent.relative_to(Path.cwd().resolve());S=B.parent
register=runpy.run_path(str(B/'register-next-actual-viewed-candidates-v2.author.py'))['register']
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
# Copier default was the v1 original. Record each true generator reference before
# this new first seal; all actual raster attempts and edit prompts remain.
actualRefs=[(17,3,2),(17,4,3),(17,5,4),(21,3,2)]
refDeltas=[]
for n,v,r in actualRefs:
 d=next(B.glob(str(n).zfill(2)+'-*'))
 p=d/('actual-generated-file.local-provenance.v'+str(v)+'.json');x=read(p);before=x['referencedActualImage'];x['referencedActualImage']=str(d/('candidate-v'+str(r)+'.png'));assert Path(x['referencedActualImage']).is_file();write(p,x)
 refDeltas.append({'path':str(p),'beforeCopierDefault':before,'actualGeneratorReference':bind(x['referencedActualImage']),'reason':'Actual integrated generator edit arguments used previous version, not v1; pre-seal provenance correction only.'})
rows=[
(17,5,
'Ein monohybrides Vererbungsmodell vergleicht erwartete Anteile von 75 % gelben und 25 % grünen Samen mit einer konstruierten Stichprobe von 28 gelben und 12 grünen Samen: 70 % und 30 %. Die Abweichung ist ein Anlass zur statistischen Prüfung, kein Beweis gegen das Modell.',
'Eine lernende Person betrachtet zwei Samenschalen mit acht beziehungsweise vierzig Samen. Eine große Tabelle stellt Erwartung 75 %/25 % und Stichprobe 70 %/30 % gegenüber. Die große Schale zeigt 28 gelbe und 12 grüne Samen; eine Gedankenblase mit Würfeln markiert Zufall.',
'Querformat-Comic mit lernender Person links, Gedankenblase Zufall mit zwei Würfeln und zwei Samenschalen unten. Die kleine Schale enthält genau sechs gelbe und zwei grüne Samen, beschriftet Kleine Stichprobe (8 Samen). Die große Schale enthält vier Reihen mit je sieben gelben und drei grünen Samen, insgesamt 40. Oben rechts eine große reine Zahlentabelle ohne Balken oder Achsen: Spalten Erwartung und Stichprobe; Zeile gelb mit 75 % und 70 %, Zeile grün mit 25 % und 30 %. Darunter bei Stichprobe 28 : 12. Zahlen sehr groß und klar. Blaue Pfeile verbinden die Schalen mit dem Vergleich, das Notizbuch zeigt unaufdringliche generische Handschrift. Keine exakten falschen Balkenhöhen oder feste Aussage, eine große Stichprobe müsse genau den Erwartungswert treffen.'),
(18,1,
'Die Punnett-Modelle vergleichen Aa×Aa und AaBb×AaBb. Das Phänotypverhältnis 9:3:3:1 gilt im dargestellten dihybriden Modell bei unabhängiger Verteilung, vollständiger Dominanz und ohne zusätzliche Genwechselwirkung. Es ist kein Genotypverhältnis und keine universelle Regel für alle Kreuzungen.',
'Links kombinieren sich die Gameten A und a in vier Feldern zu AA, Aa, Aa und aa. Rechts trägt jedes Elternteil die vier möglichen Gametentypen AB, Ab, aB und ab zu einem 4×4-Schema bei. Vier Merkmalsgruppen sind mit 9:3:3:1 dargestellt.',
'Klare Comicgrafik mit zwei großen Kreuzungstabellen. Links Aa×Aa und eine 2×2-Punnett-Tabelle mit A/a an beiden Achsen, korrekten Einträgen AA, Aa, Aa, aa. Rechts AaBb×AaBb, eine 4×4-Tabelle mit je AB, Ab, aB, ab an beiden Achsen und korrekten Kombinationen. Darunter vier Erbsen-Merkmalsgruppen gelb-rund, gelb-runzlig, grün-rund, grün-runzlig und 9:3:3:1. Große Überschrift Unabhängig. Alle Buchstaben korrekt, kein Genotypverhältnis 9:3:3:1 und keine Behauptung, das Schema gelte auch bei Kopplung oder Epistasie.'),
(19,1,
'Umweltbedingungen können im schematischen Modell die epigenetische Regulation eines betrachteten Gens beeinflussen, ohne dessen Basensequenz zu ändern. Ein gestrichelter Weg mit Fragezeichen kennzeichnet die gesondert zu prüfende mögliche Weitergabe; eine allgemeine Vererbung erworbener Markierungen ist nicht behauptet.',
'Umweltsymbole führen zu farbigen regulatorischen Markierungen an derselben DNA und zu veränderten mRNA- und Proteinmengen. Zwischen einer Maus und einem Nachkommen zeigt ein gestrichelter Pfeil mit Fragezeichen eine offene Weitergabefrage.',
'Freundliche Comicgrafik mit Umweltmotiven, einem gleichbleibenden DNA-Abschnitt und farbigen epigenetischen Markierungen. Bei einem betrachteten Gen verändert sich die gezeichnete Menge an Transkripten und Proteinen. Eine Maus und ein Nachkomme stehen seitlich; ihre Verbindung ist ausdrücklich gestrichelt und trägt ein großes Fragezeichen. Große Hauptlabels Umwelt, Genaktivität und Vererbung?. Keine Basensequenzänderung zeichnen, kein behaupteter tatsächlich durchgeführter Tierversuch, keine allgemeine transgenerationale Weitergabe aller Markierungen.'),
(20,2,
'Eine illustrative Modellgeschichte unterscheidet eine Mischungs-Vorhersage, neue Kreuzungsbefunde und eine Erklärung durch erhaltene, bei der Keimzellbildung getrennte Allele. Die schematischen Blumen sind keine originalen historischen Messdaten.',
'Drei Karten zeigen Vorhersage, Neue Befunde und Erklärung. Die erste erwartet eine gemischte Blütenfarbe. Die zweite zeigt einheitliche F1 und das Wiederauftreten einer weißen Blüte in F2. Die dritte stellt Trennung und neue Kombination der erhaltenen Allele dar.',
'Drei große Comic-Karten Vorhersage, Neue Befunde, Erklärung. Links violette und weiße Blüten und eine als Erwartung dargestellte gemischte Farbe. In der Mitte violett×weiß, vier violette F1-Blüten und drei violette plus eine weiße F2-Blüte. Rechts große Zeile Allele bleiben erhalten; ein blaues und ein gelbes homologes Chromosomensymbol werden auf zwei Keimzellen verteilt und bei Befruchtung wieder kombiniert. Das ist ein illustratives Modell, keine archivalische Messreihe. Eine lernende Person mit ihr zugewandtem Notizbuch und drei Büchern Beobachtung, Modell, Erklärung begleitet den Weg. Keine Formulierung, Merkmale seien selbst die vererbten Allele.'),
(21,3,
'Blaue Informationspfeile verbinden Gen A mit E1 und Gen B mit E2. Die Enzyme katalysieren getrennt die Stoffschritte S→I→P; das blaue Produkt ist im Modell mit einer Blütenfarbe verbunden. Struktur und Stofftransport zeigen weitere Proteinfunktionen. Stoffknoten sind abstrakt.',
'Ein durchgehender blauer Pfeil führt von Gen B direkt zu E2, ohne am Zwischenstoff I zu enden. E1 wandelt farbloses S in I um, E2 I in blaues P. Rechts sind stabile Fasern und ein Membrantransportprotein als weitere Funktionsbeispiele dargestellt.',
'Großes Comic-Schema Gene, Proteine, Merkmal. Links Gen A und Gen B, oben mittig abstrakte grüne E1- und violette E2-Proteine. Ein blauer gerader Informationspfeil Gen A→E1 und ein durchgehender gebogener blauer Informationspfeil Gen B→E2, der keinen Stoffknoten berührt. Unterhalb schwarze Stoffpfeile S→I→P, S und I farblos, P blau, mit eigenen grünen beziehungsweise violetten Katalysepfeilen von E1 und E2 auf die passenden Schritte. P führt zu einer blauen Blüte. Rechts zwei getrennte große Motive Struktur mit Fasern und Transport mit Membrankanal. DNA-Helices sind Symbole, Stoffovale keine Molekülstrukturen, Enzyme werden nicht aus einem Zwischenstoff abgeleitet.'),
(22,2,
'Das Modell vergleicht DNA-Replikation in der Zelle mit der technischen PCR. An den antiparallelen Vorlagen zeigen die neuen Stränge entgegengesetzte Verlängerungsrichtungen; beide bedeuten DNA-Synthese 5′→3′. Zwei PCR-Primer begrenzen einen Abschnitt, der durch Temperaturzyklen vervielfältigt wird.',
'Links öffnet eine Helicase die DNA. Der obere neue Strang wird zur Gabel hin verlängert, der untere davon weg. Rechts sitzen zwei gegengerichtete Primer an verschiedenen Vorlagen; Erhitzen, Abkühlen und Verlängern führen zu mehreren Kopien eines DNA-Abschnitts.',
'Zwei große freundliche Comicfelder Replikation und PCR. Links DNA-Gabel mit Helicase, oben RNA-Primer rechts und Polymerase am linken neuen 3′-Ende mit rotem Pfeil nach links zur Gabel; unten Primer links und Polymerase rechts mit rotem Pfeil nach rechts von der Gabel weg. Die Formen sind Richtungssymbole für Synthese 5′→3′ an antiparallelen Vorlagen. Rechts zwei PCR-Primer: gelb unten links nach rechts und rot oben rechts nach links. Thermocycler mit Folge Erhitzen, Abkühlen, Verlängern; darunter vier abstrakte Zielkopien. Keine zusätzliche Reparaturpflicht, keine ausgeführte Laboranleitung und keine gegensinnig falsche Primeranordnung.'),
(23,2,
'Unvollständige Karyogramm-Modelle mit drei Chromosomentypen unterscheiden Referenz, eine zusätzliche Kopie eines Typs und drei vollständige Sätze. Genotypänderung, Phänotypänderung und Krankheit werden getrennt betrachtet. Ein Fragezeichen und Weitere Befunde verhindern eine feste Zuordnung von Bestand zu Krankheit.',
'Die Referenz zeigt je zwei Kopien dreier Typen, Trisomie nur beim dritten Typ drei, Polyploidie bei allen drei. Unter den Modellen stehen getrennte Karten Genotypänderung, Phänotypänderung und Krankheit, verbunden durch keine festen Wirkungspfeile. Ein großes Fragezeichen markiert den weiteren Prüfbedarf.',
'Freundliches Querformat mit lernender Person links und drei großen Karten unter Karyogramm-Modelle (nicht vollständig). Normal: drei unterschiedliche abstrakte Chromosomentypen mit jeweils zwei Kopien. Trisomie: Typ1 und Typ2 je zwei, Typ3 drei. Polyploidie: alle drei Typen je drei Kopien. Rechts weitere Befunde mit DNA-, Protokoll-, Pflanzen- und Menschensymbol. Unten drei voneinander getrennte Karten Genotypänderung, Phänotypänderung, Krankheit; dazwischen ein großes Fragezeichen. Keine farbigen Pfeile von einem bestimmten oberen Modell zu einer bestimmten unteren Folge. Notizbuch nur generische Linien, keine rückwärts lesbare Kleinschrift. Kein vollständiges menschliches Karyogramm oder diagnostischer Nachweis behauptet.')]
last=[]
for n,v,de,alt,recon in rows:
 e=register(n,de,alt,recon,'Tatsächlich Original,360 und680 betrachtet. Zählbare Modelle und Hauptmotive im Original kontrolliert; große Vergleichslabels erkennbar. Autorprüfung, unabhängige aktuelle V-Prüfung bleibt pending.',v)
 if n in (17,21):
  d=Path(e['path']).parent;r=4 if n==17 else 2;e['predecessorActualRasterBinding']=bind(d/f'candidate-v{r}.png');e['actualGenerationReferenceImageBinding']=e['predecessorActualRasterBinding']
 e['selectedVersion']=v
 last.append(e)
out=B/'all-twenty-three-current-neutral-first-v1';out.mkdir(exist_ok=False)
write(out/'actual-edit-reference-chain.preseal-technical-correction.json',{'schemaVersion':1,'actualReferenceDeltas':refDeltas,'allRasterAttemptsAndPromptsPreserved':True,'scientificApproval':False})
oldfirst=B/'portable-first-seven-successor-v2/neutral-first-seven-portable-actual-images.author-entry.json'
oldtwo=B/'first-seven-targeted-visual-remediation-v2/neutral-two-actual-raster-remedies-and-five-byte-KEEP.author-review.entry.json'
middle=B/'eight-to-sixteen-neutral-first-v1/neutral-nine-actual-images-eight-to-sixteen.author-review.entry.json'
first=read(oldfirst)['images'];twos=read(oldtwo)['images']
entries=[copy.deepcopy(e) for e in first if e['ordinal'] not in (5,7)]+[copy.deepcopy(e) for e in twos]+copy.deepcopy(read(middle)['images'])+last
entries.sort(key=lambda e:e['ordinal']);assert len(entries)==23 and [e['ordinal'] for e in entries]==list(range(1,24))
metadataDelta=[]
newText={5:{'descriptionDe':'Schematische Proteinbiosynthese im Bakterium und in einer Zelle mit Kern: nummerierte große Legende für DNA, mRNA, tRNA, Ribosom, Kernpore und Protein. Vier getrennte Motive zeigen Enzym-, Struktur-, Transport- und Abwehrfunktionen.','altTextDe':'Zwei Zellen zeigen DNA→mRNA→Ribosom→Protein. Im Bakterium liegt DNA ringförmig vor; rechts liegt lineare DNA im Kern und mRNA tritt durch die Kernpore zur cytoplasmatischen Translation. Große Nummern und Legende verbinden sechs Mechanismusobjekte. Unten Enzyme, Struktur, Transport und Abwehr.'},7:{'descriptionDe':'Schematischer HIV-Zyklus mit RNA→DNA, Integration, neuer RNA, Proteinproduktion, Genom-RNA-Verpackung, Knospung und Reifung. Reife Partikel tragen charakteristisch konische Kapside; unreife Partikel eine runde innere Proteinschicht. Reifung kann die Knospung begleiten oder ihr folgen.','altTextDe':'Sechs nummerierte Felder zeigen HIV-RNA zu DNA, Integration in WirtsDNA, Transkription mit genomischer RNA- und Translationsroute, virale Proteine, Aufbau und Knospung sowie unreifen zu reifen Partikel. Nur reife HIV-Kapside sind konisch; beide enthalten zwei RNA-Stränge.'}}
for e in entries:
 if e['ordinal'] in newText:
  for k,v in newText[e['ordinal']].items():
   assert re.sub(r'\s','',v)==re.sub(r'\s','',e[k]);metadataDelta.append({'ordinal':e['ordinal'],'field':k,'before':e[k],'after':v,'whitespaceOnly':True});e[k]=v
  e['resourceLinkCandidate']['description']=e['descriptionDe'];e['resourceLinkCandidate']['altText']=e['altTextDe']
  e['metadataPredecessor']=bind(oldtwo)
 # Bind every current whole goal to the true v5 material successor; this changes
 # only goal6's exact candidate DE/EN fidelity, never its PNG.
 science=read(S/'remediation-v5/twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json')['entries'][e['ordinal']-1]
 if e['wholeCurrentGoal']!=science['wholeCurrentGoal']:
  assert e['ordinal']==6
  e['wholeGoalContextSuccessor']={'old':e['wholeCurrentGoal'],'current':science['wholeCurrentGoal'],'role':'Exact previously authored one-goal DE/EN source fidelity candidate; PNG bytes unchanged; current semantic/context reviews separate.'}
  e['wholeCurrentGoal']=science['wholeCurrentGoal']
 e['resourceLinkCandidate']['title']='Visualisierung: '+e['wholeCurrentGoal']['title']
 assert Path(e['path']).is_file() and bind(e['path'])['sha256'].removeprefix('sha256:')==e['sha256'].removeprefix('sha256:')
 assert Image.open(e['path']).format=='PNG' and not Path(e['path']).is_absolute()
 e['activeIntegration']=False;e['humanApproval']=False
write(out/'two-readable-caption-alt-whitespace-only-successors.actual.json',{'schemaVersion':1,'changes':metadataDelta,'selected5v4And7v3RasterBytesExact':True,'predecessorFirstSealUnchanged':True,'strictGain':0,'activeWrites':0})
entry={'schemaVersion':1,'role':'Neutral complete23 actual selected raster and exact current whole-goal/resource candidates; no independent outcomes','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'entries':entries,'images':entries,'wholeScienceCurrentCandidateEntry':bind(S/'remediation-v5/neutral-whole23-three-readability-only-successors-v5.author-review.entry.json'),'wholeScienceCurrentCandidateFirstSeal':bind(S/'remediation-v5/three-readability-only-successors-v5.author.first.freeze.json'),'wholeScienceMaterialCases':bind(S/'remediation-v5/twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json'),'source38Partners44OriginalInput':bind(S/'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'),'originalSevenEntry':bind(oldfirst),'targetedTwoRasterEntry':bind(oldtwo),'nineNewRasterEntry':bind(middle),'readableMetadataOnlySuccessors':bind(out/'two-readable-caption-alt-whitespace-only-successors.actual.json'),'actualReferenceChains':bind(out/'actual-edit-reference-chain.preseal-technical-correction.json'),'generationScope':{'newPrimaryCandidates':23,'allOriginalAttemptsKept':True,'existingRuntimeImagesReplaced':0,'allSelectedProvider':'built-in ChatGPT/Codex image_gen','actualModelIdentifier':None},'reviewState':{'status':'ai_candidate','independentVisualizationReviews':'pending; previous independent inputs/seals retained separately','nativeWholeDescriptions':'pending','currentPBoundResources':'pending','humanApproval':False,'humanTrial':False},'sourceAndCourseScopeApproval':False,'strictGain':0,'activeWrites':0}
p=out/'neutral-all23-current-selected-actual-images-and-resource-candidates.author-review.entry.json';write(p,entry)
inputs=[bind(oldfirst),bind(oldtwo),bind(middle),entry['wholeScienceCurrentCandidateEntry'],entry['wholeScienceCurrentCandidateFirstSeal'],entry['wholeScienceMaterialCases'],entry['source38Partners44OriginalInput'],bind(B/'23-goal-derived-original-prompts.author-input.json')]
paths={str(p),str(Path(__file__).resolve().relative_to(Path.cwd().resolve()))}
paths.update(str(q) for q in out.iterdir() if q.is_file())
for e in last:paths.update(str(q) for q in Path(e['path']).parent.iterdir() if q.is_file())
f=out/'all23-current-actual-images.author.first.freeze.json';write(f,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Immutable author first seal, generation/author inspection does not approve content','inputs':inputs,'outputs':[bind(q) for q in sorted(paths)],'strictGain':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'entry':bind(p),'firstSeal':bind(f),'images':23,'outputs':len(paths),'pixelChangedFirst7':2,'metadataOnlyChangedFirst7':2}))
