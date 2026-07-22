import { germanContract } from "./de.mjs";
import { englishContract } from "./en.mjs";

export const contracts = Object.freeze({
  de: germanContract,
  en: englishContract
});

export function contractFor(locale) {
  const contract = contracts[locale];
  if (!contract) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  return contract;
}
