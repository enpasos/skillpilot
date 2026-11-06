export const initialCourses = () => [
  { id: 'robotik', title: 'Robotik', capacity: 6, reserved: 3 },
  { id: 'medien', title: 'Medienlabor', capacity: 4, reserved: 4 },
  { id: 'laser', title: 'Licht und Laser', capacity: 5, reserved: 1 },
];
export function priceCents(places) {
  if (!Number.isInteger(places) || places < 1 || places > 6) throw new RangeError('1 bis 6 ganze Plätze');
  return 300 * places - (places >= 4 ? 200 : 0);
}
export function available(course) { return course.capacity - course.reserved; }
export function reserve(course, places) {
  if (!Number.isInteger(places) || places < 1 || places > 6 || places > available(course)) return false;
  course.reserved = course.reserved + places;
  return true;
}
export function availableCourses(courses) {
  const result = [];
  for (const course of courses) {
    if (available(course) > 0) result.push({ id: course.id, free: available(course) });
  }
  return result;
}
export function book(courses, input) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim();
  const places = Number(input.places);
  const course = courses.find(candidate => candidate.id === input.course);
  if (!name || !email.includes('@') || input.confirmTestData !== true || !course
      || !Number.isInteger(places) || places < 1 || places > 6) {
    return { ok: false, message: 'Eingaben prüfen; es wurde nichts reserviert.' };
  }
  const price = priceCents(places);
  if (!reserve(course, places)) return { ok: false, message: 'Nicht genügend Plätze; es wurde nichts reserviert.' };
  return { ok: true, priceCents: price, free: available(course),
    message: `${name}: ${places} Platz/Plätze in ${course.title}; ${(price / 100).toFixed(2).replace('.', ',')} EUR; noch ${available(course)} frei.` };
}
export function installForm(document, courses = initialCourses()) {
  const form = document.getElementById('booking');
  const output = document.getElementById('status');
  const renderAvailability = () => {
    for (const course of courses) document.querySelector(`[data-free-for="${course.id}"]`).textContent = String(available(course));
  };
  renderAvailability();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const field = name => form.elements.namedItem(name);
    const result = book(courses, { name: field('name').value, email: field('email').value,
      course: field('course').value, places: field('places').value,
      confirmTestData: field('testdata').checked });
    output.textContent = result.message;
    renderAvailability();
  });
  return courses;
}
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
export function segmentTrace(payload, start, maximum, order) {
  const bytes = Buffer.from(payload, 'ascii');
  const segments = [];
  for (let offset = 0; offset < bytes.length; offset += maximum) {
    segments.push({ sequence: start + offset, payload: bytes.subarray(offset, offset + maximum).toString('ascii') });
  }
  const received = new Set(); let expected = start;
  const arrivals = order.map(index => {
    const segment = segments[index];
    for (let offset = 0; offset < segment.payload.length; offset++) received.add(segment.sequence + offset);
    while (received.has(expected)) expected++;
    return { segment: index + 1, sequence: segment.sequence, length: segment.payload.length, cumulativeAck: expected };
  });
  return { segments, arrivals, endSequence: expected };
}
