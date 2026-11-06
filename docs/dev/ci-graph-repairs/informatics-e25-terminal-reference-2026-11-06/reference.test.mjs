import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { initialCourses, priceCents, availableCourses, reserve, book, installForm,
  caesar, vigenere, recoverVigenereKey, segmentTrace } from './reference.mjs';
const checks = [];
function test(name, run) { run(); checks.push(name); }
test('Tarifgrenzen 1,3,4,6', () => assert.deepEqual([1,3,4,6].map(priceCents), [300,900,1000,1600]));
test('Tarif lehnt0,7,gebrochen,NaN ab', () => { for (const n of [0,7,1.5,NaN]) assert.throws(() => priceCents(n)); });
test('Schleife/Verzweigung listet freieKur­se', () => assert.deepEqual(availableCourses(initialCourses()), [{id:'robotik',free:3},{id:'laser',free:4}]));
test('Zustandsfolge2-erfolgreich/2-abgelehnt/1-erfolgreich', () => {
  const course = initialCourses()[0]; assert.equal(reserve(course,2),true); assert.equal(course.reserved,5);
  assert.equal(reserve(course,2),false); assert.equal(course.reserved,5);
  assert.equal(reserve(course,1),true); assert.equal(course.reserved,6);
});
test('Alle ungültigen Reservierungen verändern Objekt nicht', () => {
  for (const n of [0,-1,1.5,7,NaN,4]) { const course = initialCourses()[0]; const before = JSON.stringify(course);
    assert.equal(reserve(course,n),false); assert.equal(JSON.stringify(course),before); }
});
test('Leere/fehlerhafte Formdaten und unbekannter Kurs bleiben ohne Mutation', () => {
  const valid={name:'Jana Jung',email:'jana@example.test',course:'robotik',places:'2',confirmTestData:true};
  for (const change of [{name:''},{email:'x'},{course:'missing'},{places:'2x'},{places:'0'},{confirmTestData:false}]) {
    const state=initialCourses(),before=JSON.stringify(state); assert.equal(book(state,{...valid,...change}).ok,false);
    assert.equal(JSON.stringify(state),before);
  }
});
test('Echte submit-Bindung mit DOM-Testdouble, ohne Netzwerk', () => {
  let listener, prevented=0; const output={textContent:''};
  const fields={name:{value:'Jana Jung'},email:{value:'jana@example.test'},course:{value:'robotik'},places:{value:'2'},testdata:{checked:true}};
  const form={elements:{namedItem:name=>fields[name]},addEventListener:(type,fn)=>{assert.equal(type,'submit');listener=fn;}};
  const labels=Object.fromEntries(['robotik','medien','laser'].map(id=>[id,{textContent:''}]));
  const state=installForm({getElementById:id=>id==='booking'?form:output,querySelector:selector=>labels[selector.match(/"([^"]+)"/)[1]]});
  assert.equal(labels.robotik.textContent,'3');
  listener({preventDefault:()=>prevented++}); assert.equal(prevented,1); assert.equal(state[0].reserved,5);assert.equal(labels.robotik.textContent,'1');
  assert.equal(output.textContent,'Jana Jung: 2 Platz/Plätze in Robotik; 6,00 EUR; noch 1 frei.');
  listener({preventDefault:()=>prevented++}); assert.equal(state[0].reserved,5);
  assert.equal(output.textContent,'Nicht genügend Plätze; es wurde nichts reserviert.');
});
test('Caesar anwenden und alle26 Schlüssel prüfen', () => {
  const ciphertext=caesar('TREFFENUMZEHN',9); const candidates=Array.from({length:26},(_,key)=>({key,plain:caesar(ciphertext,-key)}));
  assert.deepEqual(candidates.find(row=>row.plain==='TREFFENUMZEHN'),{key:9,plain:'TREFFENUMZEHN'});
  assert.equal(caesar(caesar('TREFFENAMTOR',5),-5),'TREFFENAMTOR');
});
test('Polyalphabetisch anwenden und Prefixangriff mitPeriode3', () => {
  const ciphertext=vigenere('ANMELDUNGROBOTIK','AGX');const recovered=recoverVigenereKey('ANMELDUNG',ciphertext,3);
  assert.equal(recovered,'AGX');assert.equal(vigenere(ciphertext,recovered,-1),'ANMELDUNGROBOTIK');
  assert.equal(vigenere(vigenere('SCHULTAG','UNI'),'UNI',-1),'SCHULTAG');
});
test('TCP-Modell Bytefolgen und kumulativeACKs', () => {
  const trace=segmentTrace('TERMINE2026OK!',1001,5,[2,0,1]);
  assert.deepEqual(trace.segments,[{sequence:1001,payload:'TERMI'},{sequence:1006,payload:'NE202'},{sequence:1011,payload:'6OK!'}]);
  assert.deepEqual(trace.arrivals.map(row=>row.cumulativeAck),[1001,1006,1015]);
});
const smtpToken=Buffer.from('\0aguser\0demo-pass','utf8').toString('base64');
const result={status:'PASS-owned-reference-models-no-browser-or-host-acceptance',checks,
  materialValues:{caesarToEncrypt:'TREFFENAMTOR',caesarGivenKey:5,caesarExpectedCipher:caesar('TREFFENAMTOR',5),
    caesarToBreak:caesar('TREFFENUMZEHN',9),vigenereToEncrypt:'SCHULTAG',vigenereGivenKey:'UNI',vigenereExpectedCipher:vigenere('SCHULTAG','UNI'),
    vigenereToBreak:vigenere('ANMELDUNGROBOTIK','AGX'),knownPrefix:'ANMELDUNG',period:3,smtpToken},
  tcp:segmentTrace('TERMINE2026OK!',1001,5,[2,0,1]),
  sampleBooking:book(initialCourses(),{name:'Jana Jung',email:'jana@example.test',course:'robotik',places:'2',confirmTestData:true})};
writeFileSync(new URL('./node-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
