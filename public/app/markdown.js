import { escapeHtml } from "./formatters.js";

function findInlineCodeMarker(text, startIndex = 0) {
  for (let index = Math.max(0, startIndex); index < text.length; index += 1) {
    if (text[index] !== "`") continue;
    if (text[index - 1] === "`" || text[index + 1] === "`") continue;
    return index;
  }
  return -1;
}

function renderLinks(text = "") {
  // Match [text](url) pattern
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(linkPattern, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderStrongText(text = "") {
  let html = "";
  let cursor = 0;

  while (cursor < text.length) {
    const open = text.indexOf("**", cursor);
    if (open === -1) {
      html += escapeHtml(text.slice(cursor));
      break;
    }

    const close = text.indexOf("**", open + 2);
    if (close === -1) {
      html += escapeHtml(text.slice(cursor));
      break;
    }

    html += escapeHtml(text.slice(cursor, open));
    html += `<strong>${escapeHtml(text.slice(open + 2, close))}</strong>`;
    cursor = close + 2;
  }

  return html;
}

function renderInlineMarkdown(text = "") {
  let html = "";
  let cursor = 0;

  while (cursor < text.length) {
    const open = findInlineCodeMarker(text, cursor);
    if (open === -1) {
      html += renderLinks(renderStrongText(text.slice(cursor)));
      break;
    }

    const close = findInlineCodeMarker(text, open + 1);
    if (close === -1) {
      html += renderLinks(renderStrongText(text.slice(cursor)));
      break;
    }

    html += renderLinks(renderStrongText(text.slice(cursor, open)));
    html += `<code>${escapeHtml(text.slice(open + 1, close))}</code>`;
    cursor = close + 1;
  }

  return html;
}

function renderHeading(line = "") {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;
  const level = match[1].length;
  const content = renderInlineMarkdown(match[2]);
  return `<h${level}>${content}</h${level}>`;
}

function renderListItem(line = "") {
  const match = line.match(/^[\s]*[-*+]\s+(.+)$/);
  if (!match) return null;
  return `<li>${renderInlineMarkdown(match[1])}</li>`;
}

function renderOrderedListItem(line = "") {
  const match = line.match(/^[\s]*\d+\.\s+(.+)$/);
  if (!match) return null;
  return `<li>${renderInlineMarkdown(match[1])}</li>`;
}

function renderBlockquote(line = "") {
  const match = line.match(/^>\s?(.+)$/);
  if (!match) return null;
  return `<blockquote>${renderInlineMarkdown(match[1])}</blockquote>`;
}

function renderTableRow(line = "", isHeader = false) {
  const cells = line.split("|").map(c => c.trim()).filter(c => c);
  if (cells.length === 0) return null;
  const tag = isHeader ? "th" : "td";
  const content = cells.map(c => `<${tag}>${renderInlineMarkdown(c)}</${tag}>`).join("");
  return `<tr>${content}</tr>`;
}

function isTableSeparator(line = "") {
  return /^\s*\|?\s*:?-+:?(?:\s*\|\s*:?-+:?)*/.test(line);
}

function processBlock(block = "") {
  const lines = block.split("\n").filter(l => l.trim());
  if (lines.length === 0) return "";

  // Check for heading
  const heading = renderHeading(lines[0]);
  if (heading) return heading;

  // Check for blockquote
  if (lines[0].startsWith(">")) {
    return lines.map(l => renderBlockquote(l) || `<p>${renderInlineMarkdown(l)}</p>`).join("");
  }

  // Check for unordered list
  if (lines.every(l => /^[\s]*[-*+]\s+/.test(l))) {
    const items = lines.map(renderListItem).filter(Boolean).join("");
    return `<ul>${items}</ul>`;
  }

  // Check for ordered list
  if (lines.every(l => /^[\s]*\d+\.\s+/.test(l))) {
    const items = lines.map(renderOrderedListItem).filter(Boolean).join("");
    return `<ol>${items}</ol>`;
  }

  // Check for table
  if (lines.length >= 2 && lines[0].includes("|") && isTableSeparator(lines[1])) {
    const headerRow = renderTableRow(lines[0], true);
    const bodyRows = lines.slice(2).map(l => renderTableRow(l, false)).filter(Boolean).join("");
    return `<table>${headerRow}${bodyRows}</table>`;
  }

  // Default: paragraph
  return `<p>${renderInlineMarkdown(block)}</p>`;
}

function renderTextBlocks(text = "") {
  // Split by double newlines, but preserve single newlines within blocks
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim() ? processBlock(block) : "")
    .filter(Boolean);

  if (blocks.length) return blocks.join("");
  return text.trim() ? `<p>${renderInlineMarkdown(text)}</p>` : "";
}

function renderCodeBlock(code = "") {
  return `
    <pre class="message-code-block"><code>${escapeHtml(code)}</code></pre>
  `;
}

export function renderMarkdownLite(text = "") {
  const normalized = String(text || "").replace(/\r\n?/g, "\n");
  const fencePattern = /```([^`\n]*)\n([\s\S]*?)```/g;
  const parts = [];
  let cursor = 0;
  let match;

  while ((match = fencePattern.exec(normalized))) {
    if (match.index > cursor) {
      parts.push({ type: "text", value: normalized.slice(cursor, match.index) });
    }

    parts.push({ type: "code", value: match[2].replace(/\n$/, "") });
    cursor = match.index + match[0].length;
  }

  if (cursor < normalized.length) {
    parts.push({ type: "text", value: normalized.slice(cursor) });
  }

  const html = parts.map((part) => (
    part.type === "code"
      ? renderCodeBlock(part.value)
      : renderTextBlocks(part.value)
  )).join("");

  return html || '<p><span class="label">(no text)</span></p>';
}
