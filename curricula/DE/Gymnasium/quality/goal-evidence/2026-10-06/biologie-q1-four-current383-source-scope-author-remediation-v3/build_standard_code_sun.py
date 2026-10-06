# SPDX-License-Identifier: Apache-2.0
# The resulting teaching material is CC-BY-4.0.
import html, json, math, pathlib
p=pathlib.Path(__file__).resolve().parent
bases='UCAG'
aa='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG'
names=dict(zip('FL SYCWPHQRIMTNKVADEG'.replace(' ',''),['Phe','Leu','Ser','Tyr','Cys','Trp','Pro','His','Gln','Arg','Ile','Met','Thr','Asn','Lys','Val','Ala','Asp','Glu','Gly']))
names['*']='Stopp'
codons=[a+b+c for a in bases for b in bases for c in bases]
table=dict(zip(codons,aa));assert len(table)==64
assert [table[c] for c in ['AUG','GAA','UUU','UGA','GAG','UUC','UAG']]==list('MEF*EF*')
cx,cy=750,790
def xy(r,a):return cx+r*math.cos(a),cy+r*math.sin(a)
def sector(r1,r2,a1,a2):
 x1,y1=xy(r2,a1);x2,y2=xy(r2,a2);x3,y3=xy(r1,a2);x4,y4=xy(r1,a1)
 return f'M {x1:.3f} {y1:.3f} A {r2} {r2} 0 0 1 {x2:.3f} {y2:.3f} L {x3:.3f} {y3:.3f} A {r1} {r1} 0 0 0 {x4:.3f} {y4:.3f} Z'
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1700" viewBox="0 0 1500 1700"><title>Code-Sonne für den Standardcode: mRNA-Codons</title><desc>64 Codons in drei Basenringen. Von innen nach außen: erste, zweite und dritte mRNA-Base, in fünf Strich nach drei Strich Richtung gelesen; außen Aminosäure oder Stopp.</desc><rect width="1500" height="1700" fill="white"/>']
svg+=['<text x="750" y="55" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="bold">Code-Sonne · Standardcode</text>','<text x="750" y="100" text-anchor="middle" font-family="sans-serif" font-size="24">mRNA-Codon 5′→3′ · von innen nach außen lesen</text>']
colors=['#e5f2fa','#eef6dc','#fff0d7','#f5e7f4']
for count,r1,r2,ring in [(4,65,205,0),(16,205,355,1),(64,355,485,2)]:
 for i in range(count):
  a1=-math.pi/2+2*math.pi*i/count;a2=-math.pi/2+2*math.pi*(i+1)/count;a=(a1+a2)/2
  base=bases[i%4];col=colors[(i if ring==0 else i//(4**ring))%4]
  svg.append(f'<path d="{sector(r1,r2,a1,a2)}" fill="{col}" stroke="#71808b" stroke-width="1.3"/>')
  x,y=xy((r1+r2)/2,a)
  svg.append(f'<text x="{x:.2f}" y="{y+8:.2f}" text-anchor="middle" font-family="sans-serif" font-size="{40 if ring<2 else 22}" fill="#142331">{base}</text>')
for i,c in enumerate(codons):
 a=-math.pi/2+2*math.pi*(i+.5)/64;x,y=xy(555,a);deg=math.degrees(a)
 rotation=deg
 if math.cos(a)<0:rotation+=180
 svg.append(f'<text x="{x:.2f}" y="{y:.2f}" text-anchor="middle" dominant-baseline="middle" transform="rotate({rotation:.2f} {x:.2f} {y:.2f})" font-family="sans-serif" font-size="22">{html.escape(c+" · "+names[table[c]])}</text>')
svg+=['<circle cx="750" cy="690" r="65" fill="white" stroke="#71808b"/>','<text x="750" y="683" text-anchor="middle" font-family="sans-serif" font-size="19">1 → 2 → 3</text>','<text x="750" y="709" text-anchor="middle" font-family="sans-serif" font-size="17">Basen</text>','<text x="750" y="1330" text-anchor="middle" font-family="sans-serif" font-size="24">Stopp beendet die Translation und ist keine Aminosäure.</text>','<text x="750" y="1370" text-anchor="middle" font-family="sans-serif" font-size="20">AUG codiert Methionin; ein Start und ein Leseraster werden in den Aufgaben vorgegeben.</text>','<text x="750" y="1410" text-anchor="middle" font-family="sans-serif" font-size="19">Eigene Darstellung · Zuordnung geprüft gegen NCBI Standardcode (T→U) · CC-BY-4.0</text>','<text x="750" y="1450" text-anchor="middle" font-family="sans-serif" font-size="19">Autorenmaterial: Darstellung und didaktische Verwendung noch unabhängig zu prüfen.</text>','</svg>']
result='\n'.join(svg)+'\n'
for old,new in [('cy="690"','cy="790"'),('y="683"','y="783"'),('y="709"','y="809"'),('y="1330"','y="1480"'),('y="1370"','y="1520"'),('y="1410"','y="1560"'),('y="1450"','y="1600"')]:result=result.replace(old,new)
(p/'standard-code-sun.author-material.svg').write_text(result)
(p/'standard-code-sun.codon-data.actual.json').write_text(json.dumps({'source':'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1','table':'1 Standard Code','checkedOn':'2026-10-06','transcriptionAlphabetChange':'NCBI T to RNA U','codonAssignments':{c:names[table[c]] for c in codons},'dataCheckCodons':['AUG','GAA','UUU','UGA','GAG','UUC','UAG'],'newRasterImage':False,'replacesExistingImage':False,'newCanonicalGoalIds':[],'independentVisualApproval':False},indent=2)+'\n')
print('64 codons; all7 task codons checked')
