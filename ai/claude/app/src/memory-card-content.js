import katex from "katex";

const KATEX_DIAGNOSTIC_COMMAND = /\\(?:errmessage|message|show)\b/u;

export function tokenizeMemoryCardContent(source) {
  const tokens = [];
  let textStart = 0;
  let cursor = 0;
  while (cursor < source.length) {
    if (source[cursor] !== "$" || isEscaped(source, cursor)) {
      cursor += 1;
      continue;
    }

    const display = source[cursor + 1] === "$";
    const delimiter = display ? "$$" : "$";
    const contentStart = cursor + delimiter.length;
    const closing = findClosingDelimiter(source, contentStart, delimiter);
    if (closing < 0) {
      cursor += delimiter.length;
      continue;
    }
    const expression = source.slice(contentStart, closing).trim();
    if (!expression) {
      cursor = closing + delimiter.length;
      continue;
    }
    if (cursor > textStart) {
      tokens.push({ type: "text", value: source.slice(textStart, cursor) });
    }
    tokens.push({ type: "math", value: expression, display });
    cursor = closing + delimiter.length;
    textStart = cursor;
  }
  if (textStart < source.length) {
    tokens.push({ type: "text", value: source.slice(textStart) });
  }
  if (tokens.length === 0 && source.length > 0) {
    tokens.push({ type: "text", value: source });
  }
  return tokens;
}

export function renderMemoryCardMath(expression, display) {
  // KaTeX implements TeX's diagnostic commands by writing their arguments to
  // the browser console. Card text is private component-only data, so reject
  // those commands before KaTeX can execute them. The caller falls back to
  // inert text for rejected expressions.
  if (KATEX_DIAGNOSTIC_COMMAND.test(expression)) {
    throw new Error("Unsupported TeX diagnostic command.");
  }
  return katex.renderToString(expression, {
    displayMode: display,
    output: "mathml",
    throwOnError: false,
    strict: "error",
    trust: false
  });
}

export function renderMemoryCardContent(container, source) {
  container.replaceChildren();
  for (const token of tokenizeMemoryCardContent(source)) {
    if (token.type === "math") {
      const math = document.createElement(token.display ? "div" : "span");
      math.className = token.display ? "math-display" : "math-inline";
      try {
        math.innerHTML = renderMemoryCardMath(token.value, token.display);
      } catch {
        math.textContent = token.display ? `$$${token.value}$$` : `$${token.value}$`;
      }
      container.append(math);
      continue;
    }
    appendSafeMarkdownText(container, token.value);
  }
}

function appendSafeMarkdownText(container, value) {
  const lines = value.split("\n");
  lines.forEach((line, index) => {
    appendSafeInlineMarkdown(container, line);
    if (index < lines.length - 1) container.append(document.createElement("br"));
  });
}

function appendSafeInlineMarkdown(container, value) {
  const pattern = /(\*\*|__)(.+?)\1|(`)(.+?)\3|(\*)([^*]+?)\5|(_)([^_]+?)\7/g;
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) container.append(document.createTextNode(value.slice(cursor, index)));
    const strongText = match[2];
    const codeText = match[4];
    const emphasisText = match[6] ?? match[8];
    const node = document.createElement(
      strongText !== undefined ? "strong" : codeText !== undefined ? "code" : "em"
    );
    node.textContent = strongText ?? codeText ?? emphasisText ?? "";
    container.append(node);
    cursor = index + match[0].length;
  }
  if (cursor < value.length) container.append(document.createTextNode(value.slice(cursor)));
}

function findClosingDelimiter(source, start, delimiter) {
  let cursor = start;
  while (cursor < source.length) {
    const found = source.indexOf(delimiter, cursor);
    if (found < 0) return -1;
    if (!isEscaped(source, found)) return found;
    cursor = found + delimiter.length;
  }
  return -1;
}

function isEscaped(source, index) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}
