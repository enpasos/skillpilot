# B007 primary definition verification — read-only

Verified at 2026-10-10T23:41:47.858920+00:00. Candidate file SHA256: `32458dac7005037d50e0f07f96437ad1a7bf89df2a2dfdeaf9b9868f2020bcb5`.

- Official IUPAC Green Book 3rd edition, [PDF](https://iupac.org/wp-content/uploads/2019/05/IUPAC-GB3-2012-2ndPrinting-PDFsearchable.pdf): printed p. 47 / PDF page 61 defines `w_i = m_i / sum_j m_j`, SI unit `1`. Printed p. 48 / PDF page 62 defines `phi_i = V_i / sum_j V_j`, SI unit `1`; note (9) uses pre-mixing constituent volumes. Printed p. 97 / PDF page 111 identifies mass and volume fractions as dimension-one quantities and percent as `10^-2`.
- The denominator excludes no constituent and does not become measured final mixture volume. The latter is a definitional inference from the volume-fraction formula and note (9); no numerical contraction values were reviewed.
- Official [NIST SI Guide, chapter 8](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8), section 8.6.6, specifies all pure-substance reference volumes at common temperature and pressure. The formula expressed via molar volumes is algebraically equivalent to the card formula. Section 8.6.10 confirms the mass-of-mixture reference.

Both scientific core definitions and percentage conversions are correct. In the generally worded volume card, add the shared pressure condition in a later unpublished successor: DE `bei gleicher Temperatur und gleichem Druck vor dem Mischen bestimmten`; EN `before mixing at the same temperature and pressure`. No existing candidate or approved card was changed.

Verified access: IUPAC PDF HTTP 200, 1543264 bytes, SHA256 `dc9cf52d6cf333d58ba48546baba0e8f99d6650895daa886caf1543eea8352ed`, at 2026-10-10T23:41:46.773054+00:00; NIST HTML HTTP 200, 116833 bytes, SHA256 `6856fcce2f378d682f5de7294e53c14c2c5e2e3ae469252f16ca701980599af9`, at 2026-10-10T23:41:47.188218+00:00. Standard Mozilla/5.0 HTTP user agent used. Exact attempt failures are in the JSON. Gold Book view/plain routes gave 403; the old HTML routes gave TLS/502 failures. Search-index results for Gold Book 2025 agree, but direct current Gold Book access was not successful.

Source provenance is separate from the own CC-BY-4.0 card allocation. Official-source licensing and legal clearance were not determined. No human approval, human trial, or activation claim is made. No full official PDF or full extracted PDF text was saved.
