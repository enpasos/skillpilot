/** Tooltips and accessible names cannot render formulas: they read a text without its `$` delimiters. */
export const plainMathText = (text: string) => text.replace(/\$/g, '')
