from pathlib import Path
import json,re,hashlib
O=Path(__file__).resolve().parent
p=O/'CANDIDATE.seven-WHOLE-exams.AUTHOR.inactive.json';gs=json.loads(p.read_text())
def clean(s):
 s=s.replace('genaueilineareKette','genau eine lineare Kette').replace('alleAminosäuren','alle Aminosäuren')
 s=re.sub(r'([a-zäöüß])([A-ZÄÖÜ][a-zäöüß])',r'\1 \2',s)
 s=re.sub(r'(?<=\d)(?=[A-ZÄÖÜ][a-zäöüß])',' ',s)
 s=re.sub(r'(?<=\d)(?=(?:kWh|mol|g|mL|L|Euro|Prozent)\b)',' ',s)
 s=re.sub(r'(?<=\d)(?=BE\b)',' ',s)
 s=re.sub(r'(?<=[;:])(?=[A-Za-zÄÖÜäöüß0-9])',' ',s)
 s=re.sub(r'(?<=[.!?])(?=[A-ZÄÖÜ])',' ',s)
 for a,b in [('HCl/Cl⁻','HCl / Cl⁻'),('H3O⁺/H2O','H3O⁺ / H2O'),('das1: 1Verhältnis','das 1:1-Verhältnis'),('einmol','ein Mol'),('genau eine lineare Kette','genau eine lineare Kette'),('Alanin gegeben: CH3','Alanin gegeben: CH3'),('bei25°C','bei 25°C'),('Material1','Material 1'),('Material2','Material 2'),('Material3','Material 3'),('Material4','Material 4'),('Material5','Material 5'),('Aufgaben2und3','Aufgaben 2 und 3'),('über1begünstigt','über 1 begünstigt'),('Genau diese Kettenbildung','Genau diese Kettenbildung'),('Katalyse nennen.','Katalyse nennen.')]:s=s.replace(a,b)
 return s
for g in gs:
 for k in ['title','titleEn','description','descriptionEn']:
  if k in g:g[k]=clean(g[k])
 for k in ['taskContent','solutionContent']:
  g['examData'][k]=clean(g['examData'][k])
 for step in g['examData']['scoring']['steps']:step['description']=clean(step['description'])
 g['examData']['taskContent']=re.sub(r'(?m)^([1-4])\.(?=\S)',r'\1. ',g['examData']['taskContent'])
 g['examData']['solutionContent']=re.sub(r'(?m)^([1-4])\.(?=\S)',r'\1. ',g['examData']['solutionContent'])
 p=O/('WHOLEGOAL.'+g['id']+'.AUTHOR.inactive.json');p.write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n')
p=O/'CANDIDATE.seven-WHOLE-exams.AUTHOR.inactive.json';p.write_text(json.dumps(gs,ensure_ascii=False,indent=2)+'\n')
p=O/'CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json';cas=json.loads(p.read_text())
for op,g in zip(cas['operations'],gs):
 op['after']=g;op['afterWholeObjectFingerprint']='sha256:'+hashlib.sha256(json.dumps(g,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest();f=O/('WHOLEGOAL.'+g['id']+'.AUTHOR.inactive.json');op['afterFile']['sha256']='sha256:'+hashlib.sha256(f.read_bytes()).hexdigest();op['afterFile']['bytes']=f.stat().st_size
p.write_text(json.dumps(cas,ensure_ascii=False,indent=2)+'\n')
print('Finite candidate prose normalized; frozen FIRST and before bodies unchanged.')
