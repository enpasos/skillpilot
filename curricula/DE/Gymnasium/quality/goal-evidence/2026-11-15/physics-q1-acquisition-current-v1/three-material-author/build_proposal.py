import json,csv,hashlib,datetime,copy
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
B=Path(__file__).parent
source=B/'CIE_xyz_1931_2deg.csv'
assert hashlib.sha256(source.read_bytes()).hexdigest()=='fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1'
data=[[float(v) for v in row] for row in csv.reader(source.open())]
plt.rcParams.update({'font.size':11,'svg.fonttype':'none','svg.hashsalt':'physics-CIE1931-20261115'})
fig,ax=plt.subplots(figsize=(8.4,5.3))
fig.subplots_adjust(left=.11,right=.98,bottom=.24,top=.88)
for j,label,color in [(1,'x̄','#bd6a32'),(2,'ȳ','#397b53'),(3,'z̄','#526da8')]:
 ax.plot([r[0] for r in data],[r[j] for r in data],label=label,color=color,lw=1.8)
ax.set(xlim=(380,780),ylim=(0,1.9),xlabel='Wavelength λ / nm',ylabel='Colour-matching weight / relative units',title='CIE 1931 — 2° standard observer')
ax.grid(alpha=.18);ax.legend(title='XYZ colour matching');ax.spines[['top','right']].set_visible(False)
fig.text(.5,.045,'CIE 2019 · DOI 10.25039/CIE.DS.xvudnb9b · CC BY-SA 4.0\nPlot from published 1 nm data; these are not individual cone sensitivity curves.',ha='center',fontsize=9)
fig.savefig(B/'cie1931-color-matching.svg',bbox_inches='tight',metadata={'Date':None,'Creator':'SkillPilot source-data plot'})
fig.savefig(B/'cie1931-color-matching.png',bbox_inches='tight',dpi=150)
plt.close(fig)
graphsha=hashlib.sha256((B/'cie1931-color-matching.svg').read_bytes()).hexdigest()
records=[json.loads(l) for l in Path('tmp/physics-release837-20261115/current10-informed-P-v2.review.jsonl').read_text().splitlines()]
old=copy.deepcopy(records)
neutral={
'84ddb244':['One thin-lens competence core is used across stages; task implementation must remain appropriate to the learner stage. Simulator outputs are required, not inferred learner activity. No human classroom validation is claimed.'],
'39ef1e8a':['The supplied CIE curves describe standardized XYZ colour matching, not direct individual S/M/L cone sensitivities. The separate SML triples are explicitly synthetic. An empirical graph cannot be replaced by synthetic triples.'],
'f06c581a':['An amplitude spectrum alone omits phases and generally allows multiple compatible time traces. Any unique construction or pairing needs supplied phases or an explicit convention; otherwise accept the supported set of possibilities.'],
'8ac61062':['No current legal, occupational or individual medical threshold is supplied. Only the explicitly bounded physical and conditional loudness-model comparisons are justified. No loud self-experiment.'],
'e19fccd7':[],
'd1306bda':['Synthetic physical dose/range comparisons establish neither clinical superiority nor an individual treatment recommendation.'],
'db47ac91':[],
'2825b528':['A connected judgement about the supplied method must relate fields, timings and useful/interference signals; unrelated calculations do not demonstrate it. No approval of unprovided stage/course/jurisdiction projections or medical device settings is implied.'],
'c2e0fc31':[], '41872413':[]}
for r in records:
 r['reviewId']='physics-current837-informed-neutral-p10-20261115-v2'
 r['dissent']=neutral[r['goalId'][:8]]
 r['reviewRunIds']=[]
 r['reason']='Current supplied competence and full positive-evidence profile context. Scientific conditions and limitations are explicit in this record; no previous description-review decisions or reviewer diagnoses are supplied. This candidate does not certify learner performance, classroom effectiveness, source mapping or human approval.'
 if r['goalId'].startswith(('39ef1e8a','f06c581a','8ac61062')):
  r['reviewer']='codex-physics-release-finish-author-of-bounded-profile-successor-pending-independent-informed-review'
 else:r['reviewer']='codex-physics-release-finish-current-informed-profile-context-review'

r=next(r for r in records if r['goalId'].startswith('39ef1e8a'));case=r['profile']['applicationCaseBriefs'][0]
material='Materialgraph /assets/assessment-materials/physik/39ef1e8a-9203-5192-8c76-8e0c3322646f/cie1931-color-matching.svg (SHA256 '+graphsha+'). Source: CIE 2019, DOI10.25039/CIE.DS.xvudnb9b; source CSV SHA256 fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1; CC BY-SA4.0. '
case['taskDemandDe']=material+'Die tatsächlich mitgelieferte Grafik stellt die standardisierten CIE1931-Farbabgleichfunktionen x̄,ȳ,z̄ des2°-Normalbeobachters für photopische Farbabgleichbedingungen dar: λ in nm und dimensionslose relative Gewichtung. Sie wurde aus den veröffentlichten1-nm-Werten gezeichnet, nicht aus Messungen an dieser lernenden Person. Diese XYZ-Gewichtungen sind keine direkt gemessenen individuellen Zapfenempfindlichkeiten. Lies bei450nm und600nm je die drei Gewichtungen näherungsweise ab, vergleiche die Antwortmuster und benenne die begrenzte Aussage des standardisierten Farbabgleichs. Erkläre, warum aus drei Abgleichwerten nicht ein eindeutiges Spektrum oder die individuelle Wahrnehmung rekonstruiert wird. Getrennter synthetischer Modellteil bei festem Adaptationszustand: SML-Antworten R=(0,1,4),G=(0,3,2),Y=(0,4,6), Antworten im gegebenen schwachen linearen Modell additiv, Spektren R+G undY verschieden. Konstruiere R+G und erkläre die mögliche Farbübereinstimmung in diesem Empfängermodell, ohne XYZ undSML gleichzusetzen.'
case['taskDemandEn']=material+'The actually supplied graph plots the standardized CIE1931 XYZ colour-matching functions of the2° standard observer under photopic matching conditions: wavelength in nm and dimensionless relative weight. It is plotted from the published1nm values, not measurements of this learner. XYZ matching weights are not directly measured individual cone sensitivities. Read the three approximate weights at450nm and600nm, compare their patterns and state the limits of standardized matching. Explain why three matching values do not reconstruct a unique spectrum or individual perception. Separate synthetic model at fixed adaptation: SML responses R=(0,1,4),G=(0,3,2),Y=(0,4,6), additive in the supplied weak linear model, with different R+G andY spectra. Construct R+G and explain a possible match in this receiver model without equating XYZ andSML.'
case['expectedPerformanceDe']='Nennt Quelle,2°-Beobachter, photopischen Modellbereich und Achsen. Aus tatsächlich geliefertem Graphen näherungsweise450nm:(x̄,ȳ,z̄)=(0,34;0,04;1,77),600nm:(1,06;0,63;0,00); begründet unterschiedliche standardisierte Abgleichmuster statt individuelle Zapfenwerte zu behaupten. Rohwerte sind450:(0,3362;0,038;1,77211),600:(1,0622;0,631;0,0008), sinnvolle grafische Näherungen sind gültig. Trennt standardisierten empirisch fundierten Farbabgleich von der synthetischen SML-Konstruktion R+G=(0,4,6)=Y. Gleiche Modellantworten trotz unterschiedlicher Spektren bedeuten keine neu entstandene mittlere Wellenlänge und keinen Beweis individueller Farbgleichheit.'
case['expectedPerformanceEn']='Identifies source,2° observer, photopic model domain and axes. Approximately reads450nm XYZ=(0.34,0.04,1.77),600nm=(1.06,0.63,0.00) from the actual graph and justifies different standardized matching patterns without calling them individual cone sensitivities. Published values are450:(0.3362,0.038,1.77211),600:(1.0622,0.631,0.0008); sensible graphical estimates are valid. Separates empirically founded standardized matching from synthetic SML addition R+G=(0,4,6)=Y. Equal model responses to different spectra create neither a new mean wavelength nor proof of an individual perceptual match.'

r=next(r for r in records if r['goalId'].startswith('f06c581a'));p=r['profile']
p['expectations'][0]['essentialUnderstandingDe']+=' Ein reines Amplitudenspektrum enthält keine Phaseninformation und legt deshalb im Allgemeinen keinen eindeutigen Zeitverlauf fest.'
p['expectations'][0]['essentialUnderstandingEn']+=' An amplitude-only spectrum omits phase information and therefore generally does not determine a unique time trace.'
p['expectations'][0]['observablePerformanceDe']+=' Eine eindeutige Konstruktion oder Paarzuordnung nutzt ausdrücklich gegebene Phasen beziehungsweise eine erklärte Konvention; ohne diese Angaben benennt die Person mehrere kompatible Verläufe und die verbleibende Grenze.'
p['expectations'][0]['observablePerformanceEn']+=' A unique construction or pairing uses explicitly supplied phases or a stated convention; without them the learner identifies compatible alternatives and the remaining limit.'
for c in p['applicationCaseBriefs']:
 if c['id']=='match-waveforms-and-spectra':
  c['taskDemandDe']+=' Für die Paarzuordnung sind alle Spektren als phasenbeschriftete Komponentenlisten gegeben; die zugehörigen sinusförmigen Komponenten beginnen bei t=0 mit Phase0 bezogen auf dieselbe Zeitachse. Für die qualitative Konstruktion ist keine Fourierintegration nötig. Gegebene Verständnishilfe: Eine Phasenänderung umπ bedeutet hier die Vorzeichenumkehr nur dieser zeitlichen Obertonkomponente bei denselben Zeitpunkten; ihr Amplitudenbetrag bleibt gleich. Ein zusätzlicher gleiches-Amplitudenspektrum-Fall kehrt so nur einen Oberton um: vergleiche die möglichen Zeitformen und erkläre die nicht eindeutige Rekonstruktion aus Amplituden allein.'
  c['taskDemandEn']+=' For pairing, every spectrum includes component phases: all sinusoidal components have phase0 at t=0 on the same time axis. Qualitative construction requires no Fourier integration. Supplied interpretation aid: a phase shift ofπ means sign reversal of only that time-domain overtone at the same instants; its amplitude magnitude stays fixed. An additional same-amplitude-spectrum case reverses only that overtone: compare compatible time shapes and explain why amplitudes alone do not determine a unique reconstruction.'
  c['expectedPerformanceDe']+=' Nutzt die gegebene gemeinsame Phase für die Paarung, erkennt unveränderte Amplituden bei geänderter relativer Phase und lässt ohne Phaseninformation mehrere Zeitformen zu. Aus einem Amplitudenspektrum allein wird keine exakte Wellenform behauptet.'
  c['expectedPerformanceEn']+=' Uses the supplied common phase for pairing, recognizes equal amplitudes with changed relative phase and admits multiple time shapes when phases are unknown. Does not claim an exact waveform from amplitudes alone.'
 else:
  c['taskDemandDe']+=' In diesem idealisierten Vergleich lässt der Filter die Phasen der verbleibenden Komponenten unverändert; ausschließlich die angegebenen höheren Harmonischen werden amplitudengedämpft. Ohne diese Zusatzannahme ist die genaue neue Zeitform offen.'
  c['taskDemandEn']+=' In this idealized comparison the filter leaves the phases of retained components unchanged and only attenuates the specified higher harmonics. Without that added assumption the exact output shape remains open.'
  c['expectedPerformanceDe']+=' Begrenzt „glatter“ auf die vorgegebene Entfernung höherfrequenter Anteile; dies legt ohne Phasenangaben keine eindeutige Punkt-für-Punkt-Zeitkurve oder universelle Lautheitsänderung fest.'
  c['expectedPerformanceEn']+=' Limits “smoother” to the specified removal of high-frequency components; without phases this gives neither a unique pointwise time curve nor a universal loudness change.'

r=next(r for r in records if r['goalId'].startswith('8ac61062'));case=r['profile']['applicationCaseBriefs'][0]
case['taskDemandDe']='Gegebener Messbericht: derselbe reine1-kHz-Dauerton im Freifeld frontal,70 beziehungsweise90dB SPL, je±1dB; keine Durchführung mit lauten Tönen. Verwende ΔL=20log₁₀(p₂/p₁), bei gleichem Medium I∝p². Zusätzlich ist als begrenzte, empirisch motivierte konventionelle Lautheitsskala N/1sone=2^((L_N/1phon−40)/10) gegeben. Für den1-kHz-Bezugston entspricht L_N zahlenmäßig dem Schalldruckpegel. Quelle dieser historischen Modellrelation: Judith Lang, Umweltinformation Lärm: Technischer Teil, Umweltbundesamt Österreich, UBA94-097(1994),Abschnitt1.2,S.2, https://data.umweltbundesamt.at/fileadmin/site/publikationen/R097.pdf#page=8. Benutze die Beziehung nur oberhalb40phon für diesen Modellvergleich; sie ersetzt keine aktuelle umfassende Lautheitsnorm, individuelle Hörmessung oder Gesundheitsgrenze. Berechne Druck-, Intensitäts- und bedingtes Lautheitsverhältnis und beurteile „hundertmal so laut“. Begrenze Faktoren wegen der Messunsicherheit und der Modellannahmen.'
case['taskDemandEn']='Supplied report: the same pure1kHz continuous reference tone in a frontal free field at70 and90dB SPL, each±1dB; no loud listening experiment. Use ΔL=20log₁₀(p₂/p₁), with I∝p² in the same medium. Also supplied is the bounded empirically motivated conventional loudness scale N/1sone=2^((L_N/1phon−40)/10). For the1kHz reference tone, loudness level L_N is numerically equal to SPL. Source of this historical model relation: Judith Lang, Umweltinformation Lärm: Technischer Teil, Austrian Environment Agency, UBA94-097(1994),section1.2,p.2, https://data.umweltbundesamt.at/fileadmin/site/publikationen/R097.pdf#page=8. Apply it only above40phon in this model comparison; it replaces neither a current comprehensive loudness standard, an individual hearing test nor a health limit. Calculate pressure, intensity and conditional loudness ratios and assess “one hundred times as loud”. Bound the factors by measurement uncertainty and model assumptions.'
case['expectedPerformanceDe']='Nominal Druckfaktor10 und Intensitätsfaktor100; bedingtes Lautheitsmodell N70=8sone,N90=32sone, Verhältnis4. Die Werte8/32 sind aus der angegebenen Relation berechnete Modellwerte, keine neuen Versuchsdaten. Bei unabhängigen±1dB-Spannen liegt ΔL zwischen18und22dB: Druckfaktor ungefähr7,94…12,59, Intensitätsfaktor63,1…158,5, bedingtes Lautheitsverhältnis ungefähr3,48…4,59; gleichwertig begründete Unsicherheitsdarstellung zulässig.100 ist kein allgemeines Lautheitsverhältnis. Bei gleicher Dauer höhere physikalische Exposition und begründete vorsorgliche Verringerung, aber keine individuelle Schaden- oder Unbedenklichkeitsdiagnose.'
case['expectedPerformanceEn']='Nominal pressure ratio10 and intensity ratio100; the conditional loudness model gives N70=8sones,N90=32sones, ratio 4. The values 8 and 32 are calculated model values from the supplied relation, not new experimental observations. Independent±1dB intervals give ΔL18…22dB: pressure ratio about7.94…12.59,intensity63.1…158.5,conditional loudness ratio about3.48…4.59; accept an equivalent justified uncertainty treatment.100 is not a general loudness ratio. At equal duration exposure is physically greater and precautionary reduction is justified, but no individual harm or safety diagnosis follows.'

(B/'profile-candidates.review.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
delta=[]
def diff(a,b,p=''):
 if isinstance(a,dict) and isinstance(b,dict):
  for k in sorted(a.keys()|b.keys()):diff(a.get(k),b.get(k),p+'.'+k)
 elif isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
  for i,(x,y) in enumerate(zip(a,b)):diff(x,y,p+'['+str(i)+']')
 elif a!=b:delta.append({'field':p,'before':a,'after':b})
for a,b in zip(old,records):
 before=len(delta);diff(a,b); 
 for x in delta[before:]:x['goalId']=b['goalId']
(B/'exact-profile-and-neutral-metadata-delta.json').write_text(json.dumps({'status':'AUTHOR_PROPOSAL_PENDING_GENUINE_INDEPENDENT_ROOT_REVIEW','profileBodiesChangedGoalIds':[r['goalId'] for a,r in zip(old,records) if a['profile']!=r['profile']],'deltas':delta},ensure_ascii=False,indent=2)+'\n')
(B/'source-and-material-manifest.json').write_text(json.dumps({'authoredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'purpose':'Concrete materials and bounded current P successor; no prior D decisions supplied to new blind reviewers.','CIE':{'url':'https://files.cie.co.at/Publications-datasets/CIE_xyz_1931_2deg.csv','officialSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'rights':'CC BY-SA4.0; separate third-party dataset and derivative graph, not relicensed as own CC-BY4.0 content.','graphSha256':graphsha,'meaning':'Standardized XYZ observer colour matching, not individual cone sensitivities.','targetAssetPath':'app/public/assets/assessment-materials/physik/39ef1e8a-9203-5192-8c76-8e0c3322646f/cie1931-color-matching.svg'},'Loudness':{'sourceUrl':'https://data.umweltbundesamt.at/fileadmin/site/publikationen/R097.pdf#page=8','PDFsha256':hashlib.sha256((B/'R097.pdf').read_bytes()).hexdigest(),'actualPagesViewed':[1,5,6,8],'rightsBoundary':'Linked third-party report only; no public republication or relicensing of PDF/page images. Formula and derived numbers are stated in own text.','modelBoundary':'Historical conventional empirically motivated scale above40phon; reference1kHz case only, not current legal/medical or universal psychoacoustic authority.'},'nativeProfileFingerprintRecomputationPending':True,'independentRootReviewPending':True},ensure_ascii=False,indent=2)+'\n')
print('Draft10 records; exactly3 full P bodies changed; remaining factual limitations retained without prior D decisions.')
