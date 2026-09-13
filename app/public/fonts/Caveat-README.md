# Caveat: self-hosted homepage headline font

Imported on 13 September 2026 for the local SkillPilot homepage proposal.
Only the main hero headline uses this handwriting font; application UI and
learning content retain their existing typography.

## Source and license

- Family: **Caveat**, designer Impallari Type / The Caveat Project Authors.
- Style: normal; variable `wght` axis **400–700**, including Bold at **700**.
- License: **SIL Open Font License 1.1**. The complete copyright notice and
  license are preserved in [Caveat-OFL.txt](Caveat-OFL.txt). This license applies
  to these font files independently of the SkillPilot application license.
- [Official Google Fonts family page](https://fonts.google.com/specimen/Caveat).
- [Official family metadata](https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/METADATA.pb)
  and [upstream license](https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/OFL.txt).
- [Official Google Fonts CSS endpoint](https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap),
  queried with a modern Chrome user agent to obtain WOFF2 variable-font subsets.

The two files below are byte-for-byte downloads from Google's font CDN, with
local descriptive filenames only. No conversion, glyph changes or subsetting
was performed locally. Both subsets are supplied by Google Fonts as version
`v23`. These are build-time provenance links, not runtime dependencies: serve
the checked-in files from `/fonts/`, use `font-display: swap`, and do not load
Google Fonts CSS or contact Google when rendering the homepage.

| Local file | Source | Bytes | SHA-256 |
|---|---|---:|---|
| `caveat-latin-wght.woff2` | [Google Fonts Latin WOFF2](https://fonts.gstatic.com/s/caveat/v23/Wnz6HAc5bAfYB2Q7ZjYY.woff2) | 74932 | `891951df5e8b5b0f0bc760d31375405e795c666b5add70437de12d4a6482b33f` |
| `caveat-latin-ext-wght.woff2` | [Google Fonts Latin Extended WOFF2](https://fonts.gstatic.com/s/caveat/v23/Wnz6HAc5bAfYB2Q7aDYYmg8.woff2) | 29472 | `f626b95c1efa95cf6b7c9b043d3bbe8862b6abbe5f55a082102f33f7de2fd4f9` |

## Subset ranges

Both subsets declare `font-family: 'Caveat'`, `font-style: normal` and
`font-weight: 400 700`. Use separate `@font-face` entries with the matching
Unicode ranges published by Google Fonts, so the extended subset is loaded
only when needed. German umlauts and `ß` are already in the Latin subset.

Latin:

```text
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD
```

Latin Extended:

```text
U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF
```

The existing `Inter-SemiBold.ttf` is unrelated and is not covered by this
Caveat-specific provenance or copyright notice.
