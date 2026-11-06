export function caesar(text, key) {
  return [...text].map(character => String.fromCharCode(65 + ((character.charCodeAt(0) - 65 + key) % 26 + 26) % 26)).join('');
}
export function vigenere(text, key, direction = 1) {
  return [...text].map((character, index) => String.fromCharCode(65 + ((character.charCodeAt(0) - 65
    + direction * (key.charCodeAt(index % key.length) - 65)) % 26 + 26) % 26)).join('');
}
export function recoverVigenereKey(known, ciphertext, period) {
  const letters = Array(period).fill(null);
  for (let index = 0; index < known.length; index++) {
    const shift = (ciphertext.charCodeAt(index) - known.charCodeAt(index) + 26) % 26;
    if (letters[index % period] !== null && letters[index % period] !== shift) throw new Error('Prefix widerspricht Periode');
    letters[index % period] = shift;
  }
  if (letters.some(letter => letter === null)) throw new Error('Prefix deckt nicht alle Schlüsselpositionen');
  return letters.map(letter => String.fromCharCode(65 + letter)).join('');
}
const c1 = caesar('TREFFENAMTOR', 5);
console.log(c1, caesar(c1, -5));
for (let key = 0; key < 26; key++) console.log(key, caesar('CANOONWDVINQW', -key));
const c3 = vigenere('SCHULTAG', 'UNI');
console.log(c3, vigenere(c3, 'UNI', -1));
const key = recoverVigenereKey('ANMELDUNG', 'ATJERAUTDRUYOZFK', 3);
console.log(key, vigenere('ATJERAUTDRUYOZFK', key, -1));