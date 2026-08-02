import { germanCatalog } from "./de.mjs";
import { englishCatalog } from "./en.mjs";

export { coachContract } from "./v1.mjs";

export const localizedCatalogs = Object.freeze({
  de: germanCatalog,
  en: englishCatalog
});

export function catalogFor(locale) {
  const catalog = localizedCatalogs[locale];
  if (!catalog) {
    throw new Error(`Unsupported demo locale: ${locale}`);
  }
  return catalog;
}
