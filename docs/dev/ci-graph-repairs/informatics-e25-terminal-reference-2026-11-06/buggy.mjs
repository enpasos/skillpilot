export function reserveV0(course, places) {
  const free = course.capacity - course.reserved;
  if (places >= free) {
    course.reserved = places;
    return true;
  }
  return false;
}
export function priceV0(places) { return 300 * places; }
