// Deterministic Layer-A image sources. No runtime, learner or review-fixture code.
// Mathematical checks below are NOT a visual review or human approval.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';

const base = path.dirname(new URL(import.meta.url).pathname);
const ink='#243445', blue='#277393', green='#26764e', orange='#9d521e';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const txt=(x,y,s,size=28,color=ink,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(s)}</text>`;
const line=(x1,y1,x2,y2,color=ink,width=3,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const dim=(x1,y1,x2,y2)=>line(x1,y1,x2,y2,ink,2,'marker-start="url(#dim)" marker-end="url(#dim)"');
const box=(x,y,w,h,fill='#ffffff')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="#bdd3dd" stroke-width="2"/>`;
const dot=(x,y,r=4,c=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const sinc2=u=>Math.abs(u)<1e-12?1:(Math.sin(Math.PI*u)/(Math.PI*u))**2;
const width=1920,height=1080;
const xSlit=250,xScreen=880,yAxis=430;
const definitions=`<defs><marker id="dim" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8" fill="none" stroke="${ink}" stroke-width="1.3"/></marker><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke="${ink}" stroke-width="1.3"/></marker></defs>`;
function page(title,subtitle,body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${esc(title)}</title><style>text{font-family:'DejaVu Sans',sans-serif}line,path{stroke-linecap:round;stroke-linejoin:round}</style>${definitions}<rect width="1920" height="1080" fill="#f4f8fa"/><path d="M0 0H1920V118Q1360 180 960 134T0 158Z" fill="#deedf3"/>${txt(52,79,title,53)}${txt(54,132,subtitle,25,blue)}${body}</svg>`;
}
function angleTo(y,r=108) {
  const theta=Math.atan2(yAxis-y,xScreen-xSlit);
  const endX=xSlit+r*Math.cos(theta), endY=yAxis-r*Math.sin(theta);
  return `<path d="M${xSlit+r},${yAxis} A${r},${r} 0 0 0 ${endX},${endY}" fill="none" stroke="${blue}" stroke-width="3"/>`;
}
function geometry(y,slits,single=false) {
  const slitHalf=single?44:5,top=235,bottom=620;
  let b='';let previous=top;
  for(const centre of slits) {
    b+=`<rect x="${xSlit-8}" y="${previous}" width="16" height="${centre-slitHalf-previous}" rx="2" fill="#617282"/>`;
    previous=centre+slitHalf;
  }
  b+=`<rect x="${xSlit-8}" y="${previous}" width="16" height="${bottom-previous}" rx="2" fill="#617282"/>`;
  for(const yy of [290,360,430,500,570]) b+=line(65,yy,155,yy,green,2,'marker-end="url(#arrow)"');
  b+=txt(62,263,'Licht',25,green)+txt(65,650,'λ: Wellenlänge',23,green);
  b+=line(xSlit,yAxis,xScreen,yAxis,ink,2,'stroke-dasharray="8 8"');
  b+=line(xSlit,yAxis,xScreen,y,blue,3,'stroke-dasharray="8 8"');
  b+=angleTo(y)+txt(xSlit+(single?200:150),yAxis-7,'θ₁',25,blue);
  b+=dim(xSlit,683,xScreen,683)+line(xSlit,663,xSlit,696)+line(xScreen,663,xScreen,696);
  b+=txt(498,718,'L: Schirmabstand',24);
  b+=line(xScreen,top,xScreen,bottom,ink,3)+txt(xScreen-37,221,'Schirm',25);
  b+=txt(365,620,'Gestrichelt: geometrische Bezugslinien',22,blue);
  return b;
}
function grating() {
  const y=yAxis-(xScreen-xSlit)*Math.tan(Math.asin(.25));
  const slits=Array.from({length:12},(_,i)=>yAxis+(i-5.5)*28);
  let b=box(36,173,1028,685,'#edf5f8')+box(1090,173,794,210)+box(1090,400,794,185)+box(1090,602,794,256,'#fff7e9');
  b+=txt(64,204,'Querschnitt · Spalte vergrößert, nicht maßstäblich',23,blue);
  b+=geometry(y,slits);
  for(const [m,yy] of [[1,y],[0,yAxis],[-1,2*yAxis-y]]) {
    b+=`<rect x="${xScreen+2}" y="${yy-4}" width="48" height="8" rx="3" fill="#54a875"/>`;
    b+=txt(966,yy+9,`m = ${m===1?'+1':m}`,25);
  }
  b+=dot(xScreen,y)+dot(xScreen,yAxis)+txt(851,y-15,'P',24)+txt(850,yAxis+29,'O',24);
  b+=dim(941,yAxis,941,y)+txt(964,(yAxis+y)/2+8,'y₁',27);
  b+=dim(207,slits[5],207,slits[6])+line(201,slits[5],xSlit,slits[5],blue,1)+line(201,slits[6],xSlit,slits[6],blue,1);
  b+=txt(183,442,'g',28,blue);
  b+=txt(65,763,'g: Abstand benachbarter Spaltmitten',25);
  b+=txt(65,800,'Nur Hauptmaximumrichtungen gezeigt;',24,blue)+txt(65,831,'keine maßstäbliche Intensitätsdarstellung.',24,blue);
  b+=txt(1120,217,'Gemeinsame Phase → Hauptmaximum',30,blue);
  b+=txt(1120,268,'g sin θₘ = m λ',39);
  b+=txt(1120,315,'m = 0, ±1, ±2, …',29);
  b+=txt(1120,354,'Gangunterschied benachbarter Spalte: Δs ≈ g sin θ',24);
  b+=txt(1120,444,'Schirmposition: yₘ = L tan θₘ',33);
  b+=txt(1120,490,'Geometrisch möglich: |m λ / g| ≤ 1',27);
  b+=txt(1120,532,'Bei Gleichheit: θ = ±90°;',25)+txt(1120,566,'kein Schnitt mit einem endlichen Schirm.',25);
  b+=txt(1120,644,'Beispiel',29,orange)+txt(1120,683,'500 Linien/mm → g = 2,0 µm',29);
  b+=txt(1120,723,'λ = 500 nm, L = 1,0 m, m = +1',28);
  b+=txt(1120,764,'sin θ₁ = 0,25 → θ₁ ≈ 14,5°',29);
  b+=txt(1120,813,'y₁ = L tan θ₁ ≈ 0,258 m',32,green);
  b+=box(36,884,1848,158,'#e7f2eb');
  b+=txt(66,927,'Warum entstehen dort Hauptmaxima?',30,green);
  b+=txt(66,969,'Der Gangunterschied benachbarter Spalte ist ein ganzzahliges Vielfaches von λ: Die Beiträge verstärken sich.',26);
  b+=txt(66,1011,'Die Bedingung beschreibt Hauptmaxima, nicht alle Nebenmaxima oder Minima eines realen Gitters.',26);
  return page('Optisches Gitter: Hauptmaxima','Senkrechter, kohärenter, monochromatischer Einfall · Fernfeld',b);
}
function singleSlit() {
  const y=yAxis-100;
  let b=box(36,173,1028,565,'#edf5f8')+box(1090,173,794,177)+box(1090,367,794,187)+box(1090,571,794,190)+box(1090,778,794,264,'#fff7e9');
  b+=txt(64,204,'Querschnitt · Winkel/Spaltbreite vergrößert',23,blue);
  b+=geometry(y,[yAxis],true);
  // Display the true sinc-squared transverse intensity, with a fixed black-to-green luminance map.
  b+=`<rect x="${xScreen}" y="235" width="31" height="385" fill="#19242b"/>`;
  for(let yy=235;yy<620;yy+=1) {
    const angle=Math.atan2(yAxis-(yy+.5),xScreen-xSlit);
    const firstMinimumAngle=Math.atan2(yAxis-y,xScreen-xSlit);
    const i=sinc2(Math.sin(angle)/Math.sin(firstMinimumAngle)), rgb=[25,36,43].map((a,k)=>Math.round(a+i*([125,227,169][k]-a)));
    b+=`<rect x="${xScreen+2}" y="${yy}" width="27" height="1" fill="rgb(${rgb.join(',')})"/>`;
  }
  b+=line(xScreen,y,929,y,blue,1,'stroke-dasharray="3 3"')+line(xScreen,2*yAxis-y,929,2*yAxis-y,blue,1,'stroke-dasharray="3 3"');
  b+=txt(936,321,'m = +1',25)+txt(936,558,'m = −1',25)+txt(913,444,'O',23);
  b+=dot(xScreen,y,4,blue)+dot(xScreen,yAxis,4,blue)+dim(942,yAxis,942,y)+txt(962,388,'y₁',26);
  b+=dim(826,y,826,2*yAxis-y)+`<rect x="785" y="415" width="32" height="32" rx="5" fill="#edf5f8"/>`+txt(790,440,'W',28,blue);
  b+=dim(209,yAxis-44,209,yAxis+44)+txt(179,438,'b',30,blue);
  b+=line(199,yAxis-44,xSlit-8,yAxis-44,blue,1)+line(199,yAxis+44,xSlit-8,yAxis+44,blue,1);
  b+=txt(64,704,'b: Spaltbreite',24);
  b+=txt(1120,218,'Minima (dunkel)',30,blue)+txt(1120,264,'b sin θₘ = m λ',38)+txt(1120,313,'m = ±1, ±2, … ; m ≠ 0',28);
  b+=txt(1120,410,'Schirmposition: yₘ = L tan θₘ',32)+txt(1120,453,'Nur kleine Winkel: yₘ ≈ m λ L / b',28);
  b+=txt(1120,500,'Zentralmaximum: W = 2 |y₁|',31)+txt(1120,537,'Begrenzt durch die Minima m = −1 und +1.',25);
  b+=txt(1120,612,'Erstes Minimum: paarweise Auslöschung',28,blue)+txt(1120,653,'Je zwei entsprechende Stellen der Spalthälften',24)+txt(1120,687,'liefern Beiträge mit Gangunterschied λ/2.',24);
  b+=txt(1120,729,'Bei θ = 0 ist das Zentrum hell, nicht dunkel.',25);
  b+=txt(1120,820,'Beispiel',29,orange)+txt(1120,856,'λ = 500 nm, b = 0,20 mm, L = 2,0 m',27);
  b+=txt(1120,899,'Erste Minima: y ≈ ±5,0 mm',28)+txt(1120,940,'Zentralmaximum: W ≈ 10,0 mm',28,green);
  b+=txt(1120,981,'Erste Nebenmaxima: y ≈ ±7,15 mm',28)+txt(1120,1021,'Aus der Kurve, nicht aus halben Ordnungen.',24);
  const cx=568,scale=169,baseY=973,peakHeight=163;
  b+=txt(64,766,'I / I₀: Intensität relativ zum Zentrum (lineare Skala)',23,blue);
  b+=line(146,baseY,1018,baseY,ink,2,'marker-end="url(#arrow)"');
  b+=line(cx,baseY,cx,797,ink,2,'marker-end="url(#arrow)"')+line(cx-7,baseY-peakHeight,cx+7,baseY-peakHeight,ink,1)+txt(cx-18,baseY-peakHeight+7,'1',21,ink,'text-anchor="end"')+txt(cx+18,806,'I / I₀',23);
  let points=[]; for(let k=0;k<=960;k++){const u=-2.5+k/192;points.push(`${(cx+u*scale).toFixed(3)},${(baseY-sinc2(u)*peakHeight).toFixed(3)}`);}
  b+=`<polyline points="${points.join(' ')}" stroke="${blue}" stroke-width="3" fill="none"/>`;
  for(const u of [-2,-1,0,1,2])b+=line(cx+u*scale,baseY,cx+u*scale,baseY+7,ink,1)+txt(cx+u*scale,baseY+31,u>0?'+'+u:String(u).replace('-','−'),22,ink,'text-anchor="middle"');
  const umax=1.4302966531242027,sideX=cx+umax*scale,sideY=baseY-sinc2(umax)*peakHeight;
  b+=dot(sideX,sideY,3,orange)+line(sideX,sideY-4,sideX+38,899,orange,1.5);
  b+=txt(715,839,'Erstes Nebenmaximum:',21,orange)+txt(745,869,'u ≈ 1,4303',24,orange)+txt(745,897,'I / I₀ ≈ 0,0472',22,orange);
  b+=txt(641,1042,'u = b sin θ / λ (dimensionslos)',22);
  return page('Einzelspalt: Minima und Maxima','Senkrechter monochromatischer Einfall · gleichmäßig beleuchteter Spalt · Fernfeld',b);
}

const numeric={gratingThetaDegrees:Math.asin(.25)*180/Math.PI,gratingY:Math.tan(Math.asin(.25)),singleMinimumY:2*Math.tan(Math.asin(500e-9/.0002)),singleSideU:1.4302966531242027};
numeric.singleSideIntensity=sinc2(numeric.singleSideU);
numeric.singleSideY=2*Math.tan(Math.asin(numeric.singleSideU*500e-9/.0002));
assert(Math.abs(numeric.gratingY-.258198889747)<1e-10);
assert(Math.abs(numeric.singleSideIntensity-.0471904492258)<1e-12);
assert(Math.abs(Math.tan(Math.PI*numeric.singleSideU)-Math.PI*numeric.singleSideU)<1e-10);
assert.equal(sinc2(0),1);for(const m of [-2,-1,1,2])assert(sinc2(m)<1e-25);
assert.equal(sinc2(.72),sinc2(-.72));
const out=path.join(base,'fallback-v1');fs.mkdirSync(out,{recursive:true});
const bodies={'grating':grating(),'single-slit':singleSlit()};
if(process.argv.includes('--check')) {
  for(const [name,svg] of Object.entries(bodies))assert.equal(fs.readFileSync(path.join(out,name+'.svg'),'utf8'),svg);
  console.log(JSON.stringify({status:'PASS',numeric,scope:'Deterministic source and mathematical assertions only; no visual approval.'}));
} else {
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1.5});
  const files=[];
  for(const [name,svg] of Object.entries(bodies)) {
    const svgPath=path.join(out,name+'.svg'), pngPath=path.join(out,name+'.png');
    fs.writeFileSync(svgPath,svg);
    await page.setContent(`<html><head><style>html,body{margin:0;padding:0}</style></head><body>${svg}</body></html>`);
    await page.evaluate(()=>document.fonts.ready);
    const issues=await page.locator('svg text').evaluateAll(nodes=>nodes.flatMap(n=>{const b=n.getBBox();return b.x<0||b.y<0||b.x+b.width>1920||b.y+b.height>1080?[{text:n.textContent,box:{x:b.x,y:b.y,w:b.width,h:b.height}}]:[]}));
    assert.deepEqual(issues,[],'Text outside artboard');
    await page.screenshot({path:pngPath});
    files.push(...[svgPath,pngPath].map(p=>({path:path.relative(process.cwd(),p),sha256:'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex')})));
  }
  await browser.close();
  console.log(JSON.stringify({status:'RENDERED_NOT_VISUALLY_APPROVED',numeric,files},null,2));
}
