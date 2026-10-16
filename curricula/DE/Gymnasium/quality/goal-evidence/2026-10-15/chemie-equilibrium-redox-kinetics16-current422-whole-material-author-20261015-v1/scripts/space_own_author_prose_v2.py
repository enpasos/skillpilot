# SPDX-License-Identifier: Apache-2.0
"""Spacing-only author draft successor; dictionary hints followed by actual prose read."""
import json,re,math,collections
from pathlib import Path
R=Path(__file__).resolve().parents[1]
F=collections.Counter()
def learn(text):
 for w in re.findall(r'[A-Za-zÄÖÜäöüß]+',text):
  if len(w)>1:F[w.lower()]+=1
for p in [Path('AGENTS.md'),R/'sources/eighty-seven-whole-passages.exact.json',R/'sources/targeted-official-HE-BW-whole-pages.read.json']:
 x=json.loads(p.read_text()) if p.suffix=='.json' else p.read_text()
 def walk(v):
  if isinstance(v,str):learn(v)
  elif isinstance(v,list):
   for a in v:walk(a)
  elif isinstance(v,dict):
   for a in v.values():walk(a)
 walk(x)
canonical=json.loads(Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/candidate/canonical560.current422.three-wording-four-alt.author.json').read_text())
for g in canonical['goals']:
 for k in ['description','descriptionEn','title','titleEn']:learn(g.get(k,''))
for line in Path('/usr/share/hunspell/en_US.dic').read_text().splitlines()[1:]:
 w=line.split('/')[0]
 if re.fullmatch('[A-Za-z]{2,}',w):F[w.lower()]+=1
learn('bei gleicher gleichem gleichen trotz unter über während danach vorher ferner anhand dessen jeweils je wie mit ohne nicht keine kein keinem keiner eines einer einem sind ist seien wird werden wäre wären kann können könnte daher dadurch hierbei hierbei nur auch zugleich sofern dann als sowie bzw und oder im am zum zur vom von durch für noch nach vor bis des das der die den dem ihr ihre ihren dessen where when same other therefore here its their these those while from into under than with without both neither itself unchanged unchanged given current according before after fixed each either any no not nor the to and for at in on of is are was were be been being does do then remains gives gives approximately together actual conditions products reactants catalysts preequilibrium quasistationarität quasistationaritätsgleichung steadystate deactivation recooling sulfur-free catalyst poisoning rate law lifetime relationship dimensionless hypothetical independent condition evidence supplied model assumptions pressure phase concentration activity barriere anfangs anfangspunkt rückkühlung fehlender frisches verändert verminderte aktivität scheinbare herleiten erklären begründen berechnen beurteilen kontrollieren vorliegen phase randbedingungen dimensionslos unverändert möglich niedriger höher niedrige niedrigere höhere geringerer beibehalten endzustände modelle daten konstante standardpotenzial standardtemperatur physisch unabhängig setzt unterstützt beide bisher hierdurch gesamtzugabe hergeleitet passend passt zulässig gegenprobe geschlossen reservoirnäherung ligandenbilanz umrechnungsfaktor gemeinsamer vollständige aktiver selektive abweichende produktabhängigen grundanteil einfach einfache einfachen anfangsratenansatz gesamtsammoniak transportlimitierung rückreaktion hinreaktion rückbarrieren vorwärtsbarriere hinumsatz teilmodellvorteil klima teilrechnungen gasförmigen feststoffaktivitäten gasphasenstöchiometrie nichtidealitäten rückkühlung rührunabhängig rückkühlversuch temperaturpunkte punktestandorte')
# Inflected words remain whole; dictionary partition is only a spacing hint.
roots=list(F)
for w in roots:
 for suffix in ['s','es','ed','ing','ly','ness','en','em','er','e','n']:
  F[w+suffix]+=1
 if w.endswith('e'):
  for suffix in ['ing','ed','ation']:F[w[:-1]+suffix]+=1
 if w.endswith('y'):F[w[:-1]+'ies']+=1
learn('equilibration logarithms bicarbonate protonation electroneutrality passivation stoichiometric favour favours favoured oxidising oxidises oxidised reduces adsorptive selectivity permeability reversibility adsorption catalytically prefactors thermodynamically lifetime subaccount subaccounts logarithmic limiting nonlinear approximately stated unproven unchanged hypothetical hypotheses oxide hydroxide deriving classifies comparison lowering seeding indefinitely platinised quasistationarität gasförmigen verdünnt gleichgehalten grundannahmen ligandenbilanz reservoirnäherung anfangsratenansatz rückzerfall teilchenebene endgleichgewicht anfangsdaten supersaturated unsaturated recooling preequilibria')
# Avoid spelling/chemical mutation: only insert whitespace in exact original letter spans.
def segment(word):
 if len(word)<7 or word.lower() in F or word.isupper():return word
 lower=word.lower();n=len(word);best=[None]*(n+1);best[0]=(0,[])
 for i in range(n):
  if best[i] is None:continue
  for z in range(i+2,min(n,i+36)+1):
   part=lower[i:z]
   if part not in F:continue
   if len(part)==2 and part not in {'an','as','at','be','by','do','go','he','if','in','is','it','me','my','no','of','on','or','so','to','up','us','we','am','im','da','du','er','es','ob','um','wo','zu','ab','eh','ph','cu','zn','fe','pt','gb'}:continue
   penalty=5.0-0.18*min(len(part),22)-0.28*math.log1p(F[part])
   # Large Latin fragments should not be invented by a dictionary cut.
   if word[i:z].isupper():penalty+=1
   cand=(best[i][0]+penalty,best[i][1]+[word[i:z]])
   if best[z] is None or cand[0]<best[z][0]:best[z]=cand
 if best[n] and len(best[n][1])>1:return ' '.join(best[n][1])
 return word
changes=[]
def clean(s):
 # Explicit sentence punctuation spacing; decimals and chemical symbols are retained.
 s=re.sub(r'([,;:])(?=[A-Za-zÄÖÜäöüß])',r'\1 ',s)
 s=re.sub(r'(?<=[a-zäöüß]{3})(?=[A-ZÄÖÜ][a-zäöü])',' ',s)
 s=re.sub(r'[A-Za-zÄÖÜäöüß]{7,}',lambda m:segment(m.group()),s)
 s=re.sub(r'(?<=[a-zäöüß])\.(?=[A-ZÄÖÜ][a-z])','. ',s)
 return s
raw=json.loads((R/'materials/thirty-two-whole-DE-EN-cases.author.json').read_text())
for c in raw['cases']:
 for k in ['materialsDe','materialsEn','taskDe','taskEn','workedReasoningDe','workedReasoningEn','freshIndependentTransferDe','freshIndependentTransferEn']:
  before=c[k];after=clean(before)
  if after!=before:changes.append({'id':c['id'],'field':k,'before':before,'after':after});c[k]=after
 for n,r in enumerate(c['criterionToObservableRubric']):
  for k in ['observableDe','observableEn']:
   before=r[k];after=clean(before)
   if after!=before:changes.append({'id':c['id'],'field':f'rubric.{n}.{k}','before':before,'after':after});r[k]=after
(R/'materials/thirty-two-whole-DE-EN-cases.readable.author.json').write_text(json.dumps(raw,ensure_ascii=False,indent=2)+'\n')
spec=json.loads((R/'science/sixteen-profile-understanding-specifications.author.json').read_text())
for s in spec['specifications']:
 s['archetype']=s['archetype'].replace('investigation','experiment')
 s['essentialPairs']=[[clean(t) for t in pair] for pair in s['essentialPairs']]
(R/'science/sixteen-profile-understanding-specifications.readable.author.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
# Spacing-only invariant covers every changed prose field.
assert all(re.sub(r'\s','',c['before'])==re.sub(r'\s','',c['after']) for c in changes)
(R/'checks/CAS.author-spacing-only.before-after.json').write_text(json.dumps({'role':'Author draft spacing, no scientific promotion','allNonWhitespaceCharactersExact':True,'changes':changes},ensure_ascii=False,indent=2)+'\n')
print('spacing changed fields',len(changes))
