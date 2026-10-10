import pathlib,json,re
O=pathlib.Path(__file__).resolve().parents[1];C=O/'candidates'
subs={'K100':'K: 100','E80':'E: 80','K640':'K: 640','X6':'X: 6','Y10':'Y: 10','I8':'I: 8','J8':'J: 8','Q/F/Gi':'Q/F/G (i)','Q/F/Gperiodi':'Q/F/G period (i)','Fverteilt':'F verteilt','Eremaining':'E: remaining','Kshares':'K shares','withzero':'with zero','Ffixed':'F: fixed','Gvaries':'G varies','Ahas':'A has','htime':'h time','Qreacts':'Q reacts','toteam':'to team','Gto':'G to','Fis':'F is','schließtR':'schließt R','odervergleichbar':'oder vergleichbar','Transfersüberschreitet':'Transfers überschreitet','BeiR':'Bei R','Transferkurzfristig':'Transfer kurzfristig','Rgap':'R gap','S40':'S: 40','Rfully':'R fully','Sonly':'S only','nonmonetaryobjects':'nonmonetary objects','schoolunion':'school union','R30':'R: 30','S35':'S: 35','Sunder':'S under','percentagepoints':'percentage points','incompletebasis':'incomplete basis','total+':'total +','Original 40':'Original 40','jeStunde':'je Stunde','independenttransfer':'independent transfer','jobgrade':'job grade','timepay':'time pay'}
def fmt(t):
 for a,b in subs.items():t=t.replace(a,b)
 t=re.sub(r'(?<=[,;:])(?=[A-Za-zÄÖÜäöüß])',' ',t)
 t=re.sub(r'(?<=[,;:])(?=[0-9])',' ',t)
 t=t.replace('https: //','https://').replace('http: //','http://')
 t=t.replace('A§','A: §').replace('B§','B: §').replace('§80 Überwachung','§80: Überwachung')
 t=t.replace('Nr 2','Nr. 2').replace('no 2','no. 2').replace('gleichhoch','gleich hoch')
 t=re.sub(r'(\d), (\d)',r'\1,\2',t)
 t=re.sub(r'(\d): (\d)',r'\1:\2',t)
 t=re.sub(r' {2,}',' ',t)
 return t
ps=[]
for stem in ['f08','036ea']:
 p=C/f'{stem}.whole-practice.candidate.INERT.json';g=json.loads(p.read_text())
 for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:g['examData'][k]=fmt(g['examData'][k])
 for s in g['examData']['scoring']['steps']:
  for k in ['description','descriptionEn']:s[k]=fmt(s[k])
 p.write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n');ps.append(g)
(C/'two-whole-practices.INERT.json').write_text(json.dumps(ps,ensure_ascii=False,indent=2)+'\n')
p=C/'landscape.author-only.INERT.json';d=json.loads(p.read_text());m={g['id']:g for g in ps};d['goals']=[m.get(g['id'],g) for g in d['goals']];p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('Two whole unsealed practices: readability-only follow-up saved.')
