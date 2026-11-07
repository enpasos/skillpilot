export function neuerPlan() {
  return {
    kapazitaet: 6,
    belegt: 2,
    buche(eingabe) {
      let summe = 0;
      for (const teil of eingabe.split(",")) {
        const n = Number(teil);
        if (teil.trim() === "" || !Number.isInteger(n) || n < 1 || n > 6) {
          return "Ungültige Eingabe.";
        }
        summe = summe + teil;
      }
      if (summe >= this.kapazitaet - this.belegt) {
        return "Nicht genug Plätze.";
      }
      this.belegt = summe;
      return "Gebucht: " + summe + "; frei: " + (this.kapazitaet - this.belegt);
    }
  };
}
