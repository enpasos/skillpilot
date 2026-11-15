#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Build an inactive, pinned elementary-assessment payload; every write stays in tmp."""
from pathlib import Path
import copy, difflib, hashlib, html, json, shutil, subprocess, uuid
from xml.etree import ElementTree

OUT=Path(__file__).resolve().parent
REPO=OUT.parents[1]
SRC=REPO/'tmp/math-diagram-route-20261115/elementary-followup'
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
ASMT='curricula/DE/Gymnasium/assessments/mathematik/seki/j6/elementary-representations-20261115-v1'
NS=uuid.UUID('68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')
KEYS=['construct-tables','read-tables','read-diagrams']
IDS={k:str(uuid.uuid5(NS,'canonical-math-seki-elementary-assessment-20261115-v1:'+k)) for k in KEYS}
PARENT='7a2a5706-aff4-4fd0-b092-1779d6ecbc1f'

def write(p,s):
 p=OUT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s.rstrip()+'\n')
def dump(p,o):write(p,json.dumps(o,ensure_ascii=False,indent=2))
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()

draft=json.loads((SRC/'assessment-candidates.json').read_text())
repairs=json.loads((SRC/'independent-draft-review/suggested-repairs.json').read_text())
raw=(REPO/CANON).read_text(); catalog=json.loads(raw);by={g['id']:g for g in catalog['goals']}
def gid(prefix):
 matches=[i for i in by if i.startswith(prefix)];assert len(matches)==1;return matches[0]
changed={gid('f39c49c7'):[gid('f6b13b8e')],gid('c9df47fa'):[gid('4eeab7d5'),gid('f6b13b8e')],gid('5e7d5ff2'):[gid('f6b13b8e')],gid('0c2ddfcd'):[gid('5e7d5ff2'),gid('4eeab7d5')]}
# Snapshot exact current objects and full catalog inventory once, fail on drift later.
base=OUT/'inputs/catalog'
if not base.exists():
 base.mkdir(parents=True)
 for p in sorted((REPO/'curricula/DE/Gymnasium/canonical').glob('*.de.json')):shutil.copyfile(p,base/p.name)
if not (OUT/'inputs/current-canonical.json').exists():write('inputs/current-canonical.json',raw)
else:
 pinned=json.loads((OUT/'inputs/current-canonical.json').read_text());assert pinned==catalog,'Live catalog drifted; inspect before rebuilding candidate.'

# Localized, precise diagrams are task stimuli, not a replacement goal illustration.
ASSETS=[]; BLUE='#126f9b'; INK='#13263c'; GRID='#b9c6d2'
def t(x,y,s,size=26,anchor='middle',weight='normal'):
 return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}">{html.escape(str(s))}</text>'
def ln(x,y,a,b,col=GRID,w=1.5):return f'<line x1="{x}" y1="{y}" x2="{a}" y2="{b}" stroke="{col}" stroke-width="{w}"/>'
def svg(name,lang,title,desc,elements,alt):
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="450" viewBox="0 0 480 450" role="img" lang="{lang}"><title>{html.escape(title)}</title><desc>{html.escape(desc)}</desc><rect width="480" height="450" fill="white"/><g font-family="DejaVu Sans, sans-serif" fill="{INK}">'+''.join(elements)+'</g></svg>\n'
 ElementTree.fromstring(s)
 rel=f'app/public/assets/assessment-materials/mathematik/{IDS["read-diagrams"]}/{name}.{lang}.svg'
 write('proposed/'+rel,s)
 path=OUT/'proposed'/rel
 subprocess.run(['rsvg-convert','-w','960','-h','900','-o',str(path.with_suffix('.png')),str(path)],check=True)
 url='/'+rel.removeprefix('app/public/').removesuffix('.svg')+'.png'
 ASSETS.append({'assessmentId':IDS['read-diagrams'],'case':name,'language':lang,'svgPath':rel,'pngPath':rel.removesuffix('.svg')+'.png','svgSha256':sha(path),'pngSha256':sha(path.with_suffix('.png')),'url':url,'alt':alt,'nativeSvgDimensions':[480,450],'minimumSourceFontPx':26,'renderer':'rsvg-convert (PNG); browser rendering inspected separately'})
 return f'![{alt}]({url})'
IMAGES={}
for lang in ['de','en']:
 dec=(lambda v:str(v).replace('.',',')) if lang=='de' else str
 title='Temperatur im Zeitverlauf' if lang=='de' else 'Temperature over time'
 elems=[t(240,34,title,27,weight='bold'),t(28,80,'Temperatur in °C' if lang=='de' else 'Temperature in °C',26,'start')]
 X=lambda v:102+338*v;Y=lambda v:230-130*v
 for v in [-1,-.5,0,.5,1]:
  s=('−' if v<0 else '')+dec(abs(v) if v%1 else int(abs(v)))
  elems +=[ln(102,Y(v),440,Y(v)),t(86,Y(v)+9,s,26,'end')]
 for v in [0,.5,1]:elems +=[ln(X(v),100,X(v),360),t(X(v),398,dec(v if v%1 else int(v)))]
 elems +=[ln(102,100,102,360,INK,2.5),ln(102,360,440,360,INK,2.5),t(271,439,'Zeit in h' if lang=='de' else 'Time in h')]
 pts=[(0,-.5),(.5,.5),(1,-1)]
 elems +=['<polyline fill="none" stroke="'+BLUE+'" stroke-width="4" points="'+' '.join(f'{X(x)},{Y(y)}' for x,y in pts)+'"/>']
 for x,y in pts:elems +=[f'<circle cx="{X(x)}" cy="{Y(y)}" r="6" fill="{BLUE}"/>']
 desc='Zeit in Stunden und Temperatur in Grad Celsius; gleichmäßig skalierte Achsen und verbundene Messpunkte.' if lang=='de' else 'Time in hours and temperature in degrees Celsius; uniformly scaled axes and joined measured points.'
 alt='Messdiagramm mit beschrifteten Zeit- und Temperaturachsen und drei markierten Punkten.' if lang=='de' else 'Measurement chart with labelled time and temperature axes and three marked points.'
 IMAGES['temperature',lang]=svg('temperature',lang,title,desc,elems,alt)
 title='Anmeldungen für Schul-AGs' if lang=='de' else 'School club registrations'
 elems=[t(240,34,title,27,weight='bold')]
 for v in range(0,13,2):
  x=150+23*v;elems +=[ln(x,95,x,345),t(x,385,v)]
 labs=['Theater','Musik','Robotik'] if lang=='de' else ['Drama','Music','Robotics']
 for y,label,n in zip([145,225,305],labs,[6,10,8]):elems +=[t(138,y+9,label,26,'end'),f'<rect x="150" y="{y-24}" width="{23*n}" height="48" fill="{BLUE}"/>']
 elems +=[ln(150,345,440,345,INK,2.5),t(288,435,'Anzahl der Personen' if lang=='de' else 'Number of people',26)]
 desc='Waagerechte Balken; links AG-Kategorien, waagerecht Anzahl der Personen mit Zweierschritten.' if lang=='de' else 'Horizontal bars; club categories on the left and horizontal number of people in steps of two.'
 alt='Horizontales Balkendiagramm mit AG-Namen und einer beschrifteten Anzahlachse.' if lang=='de' else 'Horizontal bar chart with club names and a labelled count axis.'
 IMAGES['clubs',lang]=svg('clubs',lang,title,desc,elems,alt)

rows=[];rubrics=[]
for c in draft['candidates']:
 c=copy.deepcopy(c);key=c['draftKey'];r=next(x for x in repairs['candidateRepairs'] if x['draftKey']==key)
 for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  if field in r:c[field]=r[field]
 c.update(repairs['sharedGradingNoteReplacement'])
 criteria=[{'id':x['id'],'points':2,'description':x['descriptionDe'],'descriptionEn':x['descriptionEn']} for x in r['criteria']]
 if key=='read-tables':
  # Independent new variant; do not reuse the just-constructed A table.
  c['taskContent']=c['taskContent'].replace('| Temperatur in °C | −1,5 | 0,5 | −0,5 |','| Temperatur in °C | −2,5 | 1,5 | −0,5 |')
  c['taskContentEn']=c['taskContentEn'].replace('| Temperature in °C | −1.5 | 0.5 | −0.5 |','| Temperature in °C | −2.5 | 1.5 | −0.5 |')
  c['solutionContent']=c['solutionContent'].replace('Messwert 0,5 °C','Messwert 1,5 °C').replace('zu −1,5 °C','zu −2,5 °C').replace('2 °C (= 2 K)','4 °C (= 4 K)')
  c['solutionContentEn']=c['solutionContentEn'].replace('measurement is 0.5 °C','measurement is 1.5 °C').replace('from −1.5 °C','from −2.5 °C').replace('2 °C (= 2 K)','4 °C (= 4 K)')
  criteria[0]['description']=criteria[0]['description'].replace('2 °C','4 °C').replace('2 K','4 K')
  criteria[0]['descriptionEn']=criteria[0]['descriptionEn'].replace('2 °C','4 °C').replace('2 K','4 K')
 if key=='read-diagrams':
  c['taskContent']='A: Lies das folgende Messdiagramm. Benenne die Bedeutung beider Achsen und ihrer Einheiten. Lies die markierten Messwerte bei 0 und 0,5 h ab und erläutere, wie die gleichmäßige Skala und das Vorzeichen die Werte festlegen.\n\n'+IMAGES['temperature','de']+'\n\nB: Lies das folgende horizontale Balkendiagramm. Welche Achse trägt die AG-Namen, welche die Anzahl der Personen? Lies Theater und Musik ab und erläutere an einer Stelle die Zweierschritte. Beschreibe den Unterschied zwischen Kategorien und Mess-/Anzahlwerten.\n\n'+IMAGES['clubs','de']
  c['taskContentEn']='A: Read the following measurement chart. Identify both axes and their units. Read the marked measurements at 0 and 0.5 h, explaining how uniform scaling and signs determine the values.\n\n'+IMAGES['temperature','en']+'\n\nB: Read the following horizontal bar chart. Which axis gives club names and which gives the number of people? Read drama and music and explain a two-person scale step. Distinguish categories from measured/count values.\n\n'+IMAGES['clubs','en']
 c['proposedAssessmentId']=IDS[key];c['scoring']['steps']=criteria
 phase='J6' # Internal compatibility placement, not an official national source-year claim.
 target=by[c['targetGoalId']]
 g={'id':IDS[key],'title':c['title'],'titleEn':c['titleEn'],
 'description':'Die lernende Person kann in zwei unabhängigen Fällen die Prüfung „'+c['title']+'“ eigenständig bearbeiten und ihre Zuordnungen begründen.',
 'descriptionEn':'The learner can independently complete the assessment “'+c['titleEn']+'” in two different cases and justify the associations.',
 'weight':1,'tags':['GK','LK','Practice','Assessment','canonical','phase:SekI','ExamTask'],
 'requires':c['requires'],'contains':[],'type':'atomic','nodeKind':'exam','phase':phase,
 'applicability':copy.deepcopy(target['applicability']),
 'shortKey':'canonical_math_seki_elementary_assessment_'+key.replace('-','_'),
 'dimensionTags':{'framework':'canonical-gymnasium-math','demandLevel':'AB1','processCompetencies':['K4.1'],'guidingIdeas':['L1','L4'],'phase':phase,'area':'Daten und Darstellungen','topicCode':'CANONICAL.MATH.SEK1.ELEMENTARY.ASSESSMENT.'+key.upper().replace('-','.')},
 'sourceRef':ASMT+'/'+key+'.de.md',
 'extendedData':{'applicabilityMappingInheritance':'boundary','applicabilityFromRequires':True},
 'examData':{'reviewStatus':'needs_review','reviewNote':'New original SkillPilot task, 2026-11-15. Inactive revised candidate; exact current independent assessment/coverage, source, route, native and release checks remain required. No historical task or learner result is overwritten or expanded.',
 'coveredGoalIds':c['coveredGoalIds'],'coveredStrands':['L1','L4'],'demandLevels':['AB1'],
 'sourceArtifactPath':ASMT+'/'+key+'.de.md',
 'taskContent':c['taskContent'],'taskContentEn':c['taskContentEn'],
 'solutionContent':c['solutionContent']+'\n\nBewertungshinweis:\n'+c['gradingNote'],
 'solutionContentEn':c['solutionContentEn']+'\n\nGrading note:\n'+c['gradingNoteEn'],
 # Native scalar schema has no localized step field: include both complete languages.
 'scoring':{'maxPoints':8,'passingPoints':8,'steps':[{'id':x['id'],'points':2,'description':x['description']+'\n\nEnglish: '+x['descriptionEn']} for x in criteria]}}}
 rows.append(g)
 for lang in ['de','en']:
  en=lang=='en';rub='\n\n'.join('- **'+x['id']+'** (0/1/2): '+x['descriptionEn' if en else 'description'] for x in criteria)
  content='# '+c['titleEn' if en else 'title']+'\n\nDRAFT / needs_review · CC-BY-4.0 · SkillPilot\n\n## '+('Task' if en else 'Aufgabe')+'\n\n'+c['taskContentEn' if en else 'taskContent']+'\n\n## '+('Evaluation material: release only after submission' if en else 'Bewertungsmaterial: erst nach Abgabe freigeben')+'\n\n'+c['solutionContentEn' if en else 'solutionContent']+'\n\n## '+('Analytic rubric' if en else 'Bewertungsraster')+'\n\n'+c['gradingNoteEn' if en else 'gradingNote']+'\n\n'+rub+'\n\nMaximum: 8; passing: 8.\n'
  write('proposed/'+ASMT+'/'+key+'.'+lang+'.md',content)
 rubrics.append({'assessmentId':IDS[key],'coveredGoalIds':c['coveredGoalIds'],'bilingualCriteria':criteria,'independentCaseCount':2,'maxPoints':8,'passingPoints':8,'criterionValues':[0,1,2],'maximumWhenAnyCoreInadequate':7,'maximumWhenWholeCaseOmitted':4,'proofScope':'Arithmetic non-compensation only; equivalence, slip tolerance, adequate performance and coverage require actual independent semantic review.'})

after=copy.deepcopy(catalog);ab={g['id']:g for g in after['goals']}
edits=[]
for i,req in changed.items():
 before=copy.deepcopy(ab[i]);ab[i]['requires']=req
 edits.append({'goalId':i,'before':before,'after':copy.deepcopy(ab[i]),'changedFields':['requires']})
for g in rows:assert g['id'] not in ab;after['goals'].append(g)
p=ab[PARENT];oldparent=copy.deepcopy(p);p['contains']+=list(IDS.values());p['weight']+=3
patch=''.join(difflib.unified_diff(raw.splitlines(True),(json.dumps(after,ensure_ascii=False,indent=2)+'\n').splitlines(True),fromfile='a/'+CANON,tofile='b/'+CANON))
write('canonical.patch',patch)
dump('proposed/'+CANON,after)
dump('assessment-definitions.json',rows);dump('rubric-coverage-and-omission-bounds.json',rubrics);dump('asset-manifest.actual.json',ASSETS)
dump('candidate-payload.json',{'status':'inactive-needs-independent-final-review','canonicalPath':CANON,'canonicalBaselineRawSha256':sha(REPO/CANON),'ordinaryGoalEdits':edits,'newAssessments':rows,'parentEdits':[{'before':oldparent,'after':p}],'sourceDirectory':ASMT,'oldJ6Task6Policy':'Unchanged task, scoring, coverage, ID and stored learner results. Its W changes must still be assessed. No new coverage attributed to it.','physicsReroutesIncluded':False,'idAllocation':{'namespace':str(NS),'namePrefix':'canonical-math-seki-elementary-assessment-20261115-v1:','method':'UUIDv5','ids':IDS}})
dump('inputs/input-pins.actual.json',{str(p.relative_to(REPO)):sha(p) for p in [REPO/'AGENTS.md',REPO/'docs/dev/stage-plan-units-handover-2026-11-15.md',SRC/'design.md',SRC/'assessment-candidates.json',SRC/'independent-draft-review/review.md',SRC/'independent-draft-review/suggested-repairs.json',REPO/CANON]})
print(json.dumps({'output':str(OUT),'ordinaryRequiresEdits':len(edits),'newAssessments':IDS,'localizedAssets':len(ASSETS),'oldTask6Unchanged':next(g for g in catalog['goals'] if g['id'].startswith('47c515c9'))==next(g for g in after['goals'] if g['id'].startswith('47c515c9'))},ensure_ascii=False,indent=2))
