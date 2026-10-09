#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal the actually seen six candidate PNGs, not independent approvals."""
import hashlib,json,subprocess,sys
from datetime import datetime,timezone
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
def bind(p):
 p=Path(p);b=p.read_bytes()
 return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert json.loads(p.read_text())==x
plans=json.loads((OUT/'six-missing-rasters.actual-neutral-input-and-provider-prompts.json').read_text())
canonical_path=ROOT/plans['currentCanonical']['path']
assert bind(canonical_path)==plans['currentCanonical']
current={g['id']:g for g in json.loads(canonical_path.read_text())['goals']}
observations={
1:'Large oak leaf/acorn and six-legged ladybird are visible, with two magnifiers and an illustrated branched book. At360 and680 the main matching features remain visible. The simplified book does not establish a globally definitive species identity.',
2:'Actual v1 tree falsely paired bird/frog. Actual selected v2 first branches frog, then bird, then cat/bat from the mammal branch. Four living tips, no living taxon is another living taxon ancestor. Both360/680 show the correct three branch levels. Left flight-function grouping intentionally differs.',
12:'A long explicitly schematic arrow ends in a tiny terminal mark magnified as modern people. Microbes/fish earlier and dinosaur in the past background. No exact proportional age/ancestry chain is asserted. People do not share a depicted live dinosaur setting. Main late-human contrast is visible at360/680.',
15:'Three sedimentary bands plus a distinct ash band; lower ammonite and higher shell. Researcher holds a matching ash-like sample, separate clock points at that sample. Drawing supports context/radiometric bracketing without C14/age-number claims. No mandatory notebook text is actor-reversed. Main fossil/ash/lab motifs visible at360/680.',
16:'Blue and orange model variants occur in both beetle populations. One migrant crosses the bridge; a parent pair and both-colour offspring explicitly add reproduction. No automatic recolouring, no deterministic Mendelian ratios or different-species claim. At360/680 main bridge, migrant and pair are visible; offspring remain a small supporting group.',
18:'Actual v1 used all-smaller juveniles and did not demonstrate selection-frequency change. Selected v2 compares adult populations on the same ground line; first short/medium/long necks, later predominantly long with variation retained. Question marks preserve the historical hypothesis and inheritance inquiry. Extra unreadable bottom question removed. Main alternative mechanisms and changed distribution remain visible at360/680; this is a schematic conditional comparison, not measured fitness or universal neck mechanism.'
}
reconstruction={
1:'Gestalte eine freundliche abstrakte Comicillustration quer etwa16:9: großer gelappter grüner Eichenblattzweig mit Eichel links; großer roter Marienkäfer mit schwarzen Punkten, zwei Fühlern und sechs Beinen rechts. Zwei große Lupen vergrößern Blatt- und Flügeldeckenmerkmale. Oben liegt eine offene bebilderte Bestimmungshilfe mit zwei einfachen Verzweigungen und alternativen Blatt-/Käferbildern, ohne Wörter. Heller Naturhintergrund, weiche dunkelblaue Konturen. Die Illustrationsschlüssel sind schematisch und behaupten keinen global sicheren Artnamen. Hauptmotive bei360px erkennbar; keine kleinteilige Texttabelle.',
2:'Freundliche Comicillustration quer etwa16:9, zwei große mintblaue Vergleichsfelder. Links Überschrift „Flügel“: Vogel und Fledermaus gemeinsam im gelben ovalen Merkmalsfeld, Katze und Frosch außerhalb. Rechts Überschrift „Verwandtschaft“: wurzelgerichteter dunkelblauer Stammbaum, der zuerst den Frosch abzweigt, dann den Vogel und zuletzt einen gemeinsamen Säugetierast in Katze und Fledermaus. Vier Tiere an vier zeitgleichen Enden, kein aktuelles Tier ist Vorfahr eines anderen. Kurze große Tierlabels „Frosch“, „Vogel“, „Katze“, „Fledermaus“. Korrekten sichtbaren Verlauf auch hinter Zweiganschlüssen erhalten; keine mathematisch falsche Gruppe. Hauptgruppen und Baum bei360px erkennbar.',
12:'Freundliche klare Comicillustration quer etwa16:9 über Erdoberfläche und Himmel. Große gelbe Überschrift „Schematische Zeitspur“. Eine einzige lange horizontale Pfeilspur führt von frühen Mikroben links über einen Fisch zu einem sehr kleinen rot markierten Endabschnitt rechts. In der historischen Hintergrundmitte liegen ein Dinosaurier und ein fliegendes Reptil. Eine große Lupe rechts vergrößert ausschließlich den jüngsten Endabschnitt mit zwei modernen Menschen. Keine Alterszahlen oder exakten Längenverhältnisse; Symbole markieren frühes Auftreten und keine direkte Vorfahrenleiter. Menschen und Dinosaurier nicht als gleichzeitig lebende Nachbarn. Große Motive auch bei360px erkennbar.',
15:'Freundliche abstrakte Comicillustration quer etwa16:9. Links großer ungekippteter geologischer Anschnitt mit drei sedimentären Schichten und dazwischen einer eigenständigen dünnen orangefarbenen Vulkanascheschicht. Unten ein spiralförmiges Ammonitenfossil, oben eine Muschel. Eine große Lupe zeigt das untere Fossil im selben Schichtkontext. Rechts in einer abgerundeten Laborfläche betrachtet eine Forscherin eine zur Asche passende Gesteinsprobe; eine große Uhr über ihr mit Pfeil zeigt auf die Probe, ein Mikroskop ist ein unterstützendes Laborsymbol. Große Überschrift „Alter und Kontext“. Keine Zahlen, kein C14-Messwert, keine automatische Gleichsetzung von Fossilalter und Kristallisationszeit der Asche. Keine lesepflichtige Kleinschrift; Hauptkontext bei360px erkennbar.',
16:'Freundliche Comicillustration quer etwa16:9 mit zwei durch einen kleinen Graben getrennten Wiesen und einer Brücke. Beide Wiesen enthalten anatomisch gleiche blaue und orangefarbene Modellkäfer derselben Art; links überwiegend blau, rechts überwiegend orange. Ein blauer Käfer überquert die Brücke unter einem Pfeil von links nach rechts. Rechts sitzt ein blau-orangefarbenes Elternpaar mit einem Herz; ein kleiner Pfeil führt zu einer gemischten Nachkommengruppe. Große Überschrift „Migration + Fortpflanzung“. Farben sind schematische erbliche Varianten, keine Arten. Keine automatische Farbänderung am Brückenende und keine behaupteten Mendelzahlen. Brücke, Paar und Weitergabe bei360px erkennbar.',
18:'Freundliche abstrakte Comicillustration quer etwa16:9: links eine große historische Hypothesentafel mit einer Giraffe, die sich zu hohen Blättern streckt; große Überschrift „Erworben vererbt?“ und unten „Historische Behauptung“. Mitte eine große Lupe mit einem schlichten Chromosomenpaar und „Erblich?“. Rechts eine große Populationentafel, unter „Variation“ drei erwachsene Giraffen mit ähnlicher Körper-/Beingröße und deutlich verschieden langen Hälsen; ein großer Pfeil führt zu fünf Erwachsenen unter „Selektion“, vier langhalsig und einer mittellang, auf derselben Bodenhöhe. Darstellung zeigt eine mögliche Häufigkeitsänderung erblicher Varianten, keine kleinere Jugendgeneration, keine individuelle Halsstreckung als Vererbung und kein gemessenes Naturgesetz. Keine zusätzliche Frage unten, keine Zahlen. Große Silhouetten und Hauptlabels bei360px verständlich.'
}
captions={
1:('Merkmale von Pflanzen und Tieren beobachten und mit einer schematischen Bestimmungshilfe vergleichen.','Eichenblattzweig mit Eichel und sechsbeiniger Marienkäfer; zwei Lupen zeigen Merkmale. Eine offene bebilderte Bestimmungshilfe im Hintergrund deutet verzweigte Merkmalsvergleiche an, ohne einen sicheren Artnamen zu behaupten.'),
2:('Ähnlichkeit einzelner Merkmale und gemeinsame Abstammung können zu unterschiedlichen Gruppen führen.','Links sind Vogel und Fledermaus nach Flügeln gruppiert. Rechts verzweigt ein schematischer Stammbaum zuerst zu Frosch, dann Vogel und schließlich zu den Säugetieren Katze und Fledermaus.'),
12:('Homo sapiens tritt erst sehr spät in der langen Geschichte des Lebens auf; die Zeitspur ist schematisch.','Eine als schematisch bezeichnete Zeitspur führt von frühen Mikroben über Fische zu einem kleinen jüngsten Endabschnitt. Die rechte Lupe zeigt darin moderne Menschen; Dinosaurier stehen im historischen Hintergrund. Es werden keine maßstäblichen Alterszahlen behauptet.'),
15:('Schichtkontext und datierbare Vulkanasche helfen, Fossilalter und Grenzen der Aussage zu beurteilen.','Geologischer Anschnitt mit drei Sedimentschichten, einer dazwischenliegenden Vulkanascheschicht und zwei Fossilien. Eine Lupe zeigt das tiefer liegende Ammonitenfossil; rechts untersucht eine Forscherin eine Ascheprobe unter einem Uhrsymbol, ohne Alterszahlen zu behaupten.'),
16:('Migration kann durch Fortpflanzung vererbbare Varianten zwischen Populationen verbreiten.','Zwei Populationen derselben schematischen Käferart enthalten blaue und orangefarbene Varianten. Ein blauer Käfer wandert über eine Brücke nach rechts; dort veranschaulichen ein Elternpaar und Nachkommen die Weitergabe erblicher Varianten.'),
18:('Historische Erklärungen mit erblicher Variation, Selektion und tatsächlichen Belegen vergleichen.','Links fragt eine historische Giraffenillustration nach Vererbung erworbener Merkmale. Eine zentrale Lupe mit Chromosomenpaar fragt nach Erblichkeit. Rechts werden verschieden langhalsige erwachsene Giraffen mit einer späteren überwiegend langhalsigen Population verglichen; Variation bleibt erhalten. Das Bild ist ein schematischer Vergleich, kein Experimentnachweis.')
}
images=[];author_qc=[]
for plan in plans['plans']:
 n=plan['ordinal'];id=plan['goalId'];d=OUT/id;version=2 if n in [2,18] else 1
 assert current[id]==plan['wholeGoal']
 assert not current[id].get('resourceLinks'),id
 png=d/f'candidate-v{version}.png';w,h=Image.open(png).size
 recon=d/f'image-reconstruction-prompt.selected-v{version}.actual-seen.de.md'
 assert not recon.exists();recon.write_text('# Rekonstruktion aus dem tatsächlich gesehenen PNG\n\n'+reconstruction[n]+'\n')
 prov=d/f'generation-v{version}.actual-tool-provenance.json'
 prompts=[bind(d/'actual-generator-prompt.de.txt')]
 if version==2:
  prompts.append(bind(d/('actual-v2-targeted-tree-correction.prompt.de.txt' if n==2 else 'actual-v2-targeted-population-correction.prompt.de.txt')))
 desc,alt=captions[n]
 screenshots=[{'width':width,**bind(d/f'actual-v{version}-browser-{width}.png')} for width in [360,680]]
 link={'type':'goal-visualization','resourceType':'image','role':'primary','skillpilotId':id,'title':'Visualisierung: '+current[id]['title'],'url':f'/assets/goal-visualizations/biologie/{id}/{id}.png','provider':plans['plans'][0]['provider'],'description':desc,'altText':alt,'lang':'de','license':'CC-BY-4.0','reviewStatus':'pilot'}
 row={'ordinal':n,'goalId':id,'wholeGoal':current[id],'asset':bind(png),'format':'png','dimensions':{'width':w,'height':h},'provider':plan['provider'],'model':None,'actualToolProvenance':bind(prov),'actualProviderPrompts':prompts,'reconstructionPrompt':{**bind(recon),'derivedFromActualSeenImage':True,'generationExecuted':False},'descriptionDe':desc,'altTextDe':alt,'resourceLinkCandidate':link,'actualNativeAndPhoneDesktopRasterViews':{'original':bind(png),'screenshots':screenshots,'rasterEdits':0},'independentVisualStatus':'PENDING','humanApproval':False,'activeImport':False}
 images.append(row)
 author_qc.append({'ordinal':n,'goalId':id,'selectedAsset':bind(png),'author':'/root','actualOriginalAndBrowserWidthsSeen':[360,680],'actualObservation':observations[n],'decision':'CANDIDATE_KEEP_for_independent_review','independentApproval':False})
first_view=OUT/'six-selected-actual-PNGs.pixel-FIRST-neutral-input.json'
write(first_view,{'schemaVersion':1,'role':'Neutral actual-pixel input: inspect before metadata/author-QC; original whole goal context provided','currentCanonical':bind(canonical_path),'images':[{'ordinal':r['ordinal'],'goalId':r['goalId'],'wholeGoal':r['wholeGoal'],'asset':r['asset'],'dimensions':r['dimensions'],'actualNativeAndPhoneDesktopRasterViews':r['actualNativeAndPhoneDesktopRasterViews']} for r in images],'independentVApproval':False,'strictGain':0})
metadata=OUT/'six-selected-PNGs.actual-metadata-and-reconstruction.candidates.json'
write(metadata,{'schemaVersion':1,'role':'Post pixel-FIRST metadata inputs, not author decisions or approvals','images':images,'sourceAndNativeApproval':False,'independentVisualApproval':False})
qc=OUT/'six-actual-original-phone-desktop.author-QC.json'
write(qc,{'schemaVersion':1,'role':'Actual author checks, not independent V','rows':author_qc,'originalRejectedAttemptsPreserved':[bind(OUT/plans['plans'][i]['goalId']/'candidate-v1.png') for i in [1,5]],'strictGain':0})
errors=curriculum_symlink_errors(ROOT)
assert not errors,errors
for p in OUT.rglob('*.json'):json.loads(p.read_text())
for p in OUT.rglob('*.jsonl'):
 for line in p.read_text().splitlines():
  if line.strip():json.loads(line)
entry=OUT/'neutral-completed-six-selected-actual-PNGs.independent-V-review.entry.json'
write(entry,{'schemaVersion':1,'createdAt':datetime.now(timezone.utc).isoformat(),'role':'Completed six missing-raster author candidates, two targeted errors corrected; separate independent V pending','author':'/root','selectedGoalIds':[r['goalId'] for r in images],'pixelFirstNeutralInput':bind(first_view),'postFirstMetadataInput':bind(metadata),'authorQcToReadOnlyAfterOwnFirst':bind(qc),'actualPreparationInputFirst':bind(OUT/'six-raster-author.actual-input.first.freeze.json'),'wholeCurrentCanonical':bind(canonical_path),'wholeSourceAndPAuthorEntry':bind(OUT.parent/'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'/'neutral-whole18-source35-partners30-P18-cases36.author-independent-review.entry.json'),'normalCurriculumSymlinkErrors':errors,'allOwnJsonFullyParsed':True,'generatedImages':6,'correctedFirstAttempts':2,'originalsAnd360And680ActuallySeenByAuthor':True,'nativeDimensions':'PNG1672x940/941 near16:9','actualProvider':plan['provider'],'actualModel':None,'rawProviderImagesAlsoPreservedOutsideRepositoryAsOriginHistory':True,'committableImagesAreExactCopies':True,'sourceNativeAndIndependentVApproval':False,'newScientificM7Closures':0,'restoredM7Bindings':0,'strictGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':[]})
seal=OUT/'six-selected-raster-author.final.freeze.json'
outputs=[p for p in OUT.rglob('*') if p.is_file() and p!=seal]
write(seal,{'schemaVersion':1,'role':'Immutable technical candidate closure, no independent approval','entry':bind(entry),'files':[bind(p) for p in sorted(outputs)],'activeWrites':[],'strictGain':0})
print(json.dumps({'entry':bind(entry),'seal':bind(seal),'selectedImages':6,'independentV':'PENDING','symlinkErrors':0}))
