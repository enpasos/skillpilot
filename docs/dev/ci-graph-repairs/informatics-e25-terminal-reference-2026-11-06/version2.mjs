export const initialCourses = () => [
  { id: 'robotik', title: 'Robotik', capacity: 6, reserved: 3 },
  { id: 'medien', title: 'Medienlabor', capacity: 4, reserved: 4 },
  { id: 'laser', title: 'Licht und Laser', capacity: 5, reserved: 1 },
];
export function priceCents(places) {
  if (!Number.isInteger(places) || places < 1 || places > 6) throw new RangeError('1 bis 6 ganze Plätze');
  return 300 * places;
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
