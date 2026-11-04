from pathlib import Path
import json,hashlib
import subprocess
H=Path(__file__).resolve().parent;D=H/'solution-figures';D.mkdir(exist_ok=True)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="580" viewBox="0 0 1100 580"><rect width="1100" height="580" fill="white"/><style>text{font-family:DejaVu Sans,Arial,sans-serif;fill:#172033;font-size:19px}.tick{font-size:14px;fill:#536174}.title{font-size:24px;font-weight:bold}.label{font-size:17px}.grid{stroke:#e0e6ef;stroke-width:1}.axis{stroke:#172033;stroke-width:2}</style>']
for i,axes in enumerate([('x₁','x₂'),('x₂','x₃')]):
 ox=75+550*i;oy=465;scale=60
 def xy(x,y):return ox+scale*x,oy-scale*y
 parts.append(f'<text class="title" x="{ox+110}" y="46">{axes[0]}{axes[1]}</text>')
 for q in range(7):
  px,py=xy(q,0);parts.append(f'<line class="grid" x1="{px}" y1="{oy}" x2="{px}" y2="{oy-360}"/><text class="tick" x="{px-4}" y="{oy+25}">{q}</text>')
  px,py=xy(0,q);parts.append(f'<line class="grid" x1="{ox}" y1="{py}" x2="{ox+360}" y2="{py}"/>')
  if q:parts.append(f'<text class="tick" x="{ox-23}" y="{py+5}">{q}</text>')
 parts.append(f'<line class="axis" x1="{ox}" y1="{oy}" x2="{ox+390}" y2="{oy}"/><line class="axis" x1="{ox}" y1="{oy}" x2="{ox}" y2="{oy-390}"/><text x="{ox+393}" y="{oy+6}">{axes[0]}</text><text x="{ox-13}" y="{oy-405}">{axes[1]}</text>')
 if i==0:
  pts=[xy(1,1),xy(5,1),xy(1,4)];parts.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+'" fill="#cfe4ff" stroke="#2563a6" stroke-width="3"/>')
  labels=[('A₁₂',(1,1),(-23,30)),('B₁₂',(5,1),(8,25)),('C₁₂',(1,4),(10,-10))];parts.append(f'<text x="{ox+125}" y="{oy+78}">F = 6 m²</text>')
 else:
  a=xy(1,2);b=xy(4,5);parts.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="#9b3b4f" stroke-width="4"/>');labels=[('A₂₃ = B₂₃',(1,2),(-28,31)),('C₂₃',(4,5),(12,-8))];parts.append(f'<text x="{ox+125}" y="{oy+78}">F = 0 m²</text>')
 for label,point,offset in labels:
  px,py=xy(*point);parts.append(f'<circle cx="{px}" cy="{py}" r="5" fill="#172033"/><text class="label" x="{px+offset[0]}" y="{py+offset[1]}">{label}</text>')
parts.append('</svg>');svg=D/'coordinate-views-solution-v1.svg';svg.write_text('\n'.join(parts)+'\n');png=D/'coordinate-views-solution-v1.png';subprocess.run(['rsvg-convert','-o',str(png),str(svg)],check=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
(H/'solution-figure-boundary.json').write_text(json.dumps({'status':'PRIVATE_PROPOSED_STATIC_SOLUTION_ASSET_NO_PUBLIC_WRITE','sourceSvg':str(svg.relative_to(H)),'sourcePng':str(png.relative_to(H)),'svgSha256':sha(svg),'pngSha256':sha(png),'runtimeUrl':'/assets/assessment-materials/mathematik/5748633c-113f-5ea8-9041-24da55919de7/coordinate-views-solution-v1.png','futurePublicPath':'app/public/assets/assessment-materials/mathematik/5748633c-113f-5ea8-9041-24da55919de7/coordinate-views-solution-v1.png','allowedFields':['solutionContent','solutionContentEn'],'forbiddenFields':['taskContent','taskContentEn'],'geometry':{'xyVertices':[[1,1],[5,1],[1,4]],'yzVertices':[[1,2],[1,2],[4,5]],'axesRange':[0,6],'equalAxisScale':True,'imageAreas':[6,0]},'license':'CC-BY-4.0','attribution':'Original SkillPilot assessment diagram, authored from exact coordinates using repository-local code.','activation':False},ensure_ascii=False,indent=2)+'\n')
