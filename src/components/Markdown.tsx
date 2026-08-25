import * as React from "react";

/**
 * Minimal, dependency-free, XSS-safe Markdown renderer.
 *
 * It supports exactly the subset used by our seed content — h2/h3 headings,
 * bold (`**`), unordered lists, and blockquotes — and renders everything as
 * React text nodes (never `dangerouslySetInnerHTML`), so provider-authored
 * content can never inject markup. Anything unrecognised falls through as a
 * plain paragraph.
 */

/** Split a line into React nodes, turning `**bold**` into <strong>. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return (
      <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
    );
  });
}

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let orderedListBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const items = [...listBuffer];
    const listKey = key++;
    blocks.push(
      <ul
        key={`ul-${listKey}`}
        className="my-3 ml-5 list-disc space-y-1.5 text-muted-foreground marker:text-muted-foreground/60"
      >
        {items.map((item, i) => (
          <li key={i}>{renderInline(item, `li-${listKey}-${i}`)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  const flushOrderedList = () => {
    if (orderedListBuffer.length === 0) return;
    const items = [...orderedListBuffer];
    const listKey = key++;
    blocks.push(
      <ol
        key={`ol-${listKey}`}
        className="my-3 ml-5 list-decimal space-y-1.5 text-muted-foreground marker:text-muted-foreground/60"
      >
        {items.map((item, i) => (
          <li key={i}>{renderInline(item, `oli-${listKey}-${i}`)}</li>
        ))}
      </ol>,
    );
    orderedListBuffer = [];
  };

  const flushLists = () => {
    flushList();
    flushOrderedList();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^###\s+/.test(line)) {
      flushLists();
      blocks.push(
        <h3 key={key} className="mt-5 text-base font-semibold text-foreground">
          {renderInline(line.replace(/^###\s+/, ""), `h3-${key++}`)}
        </h3>,
      );
    } else if (/^##\s+/.test(line)) {
      flushLists();
      blocks.push(
        <h2
          key={key}
          className="mt-6 text-lg font-bold tracking-tight text-foreground"
        >
          {renderInline(line.replace(/^##\s+/, ""), `h2-${key++}`)}
        </h2>,
      );
    } else if (/^>\s?/.test(line)) {
      flushLists();
      blocks.push(
        <blockquote
          key={key}
          className="my-3 border-l-2 border-primary/40 pl-4 text-sm italic text-muted-foreground"
        >
          {renderInline(line.replace(/^>\s?/, ""), `bq-${key++}`)}
        </blockquote>,
      );
    } else if (/^[-*]\s+/.test(line)) {
      flushOrderedList();
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
    } else if (/^\d+\.\s+/.test(line)) {
      flushList();
      orderedListBuffer.push(line.replace(/^\d+\.\s+/, ""));
    } else if (line.trim() === "") {
      flushLists();
    } else {
      flushLists();
      blocks.push(
        <p key={key} className="my-3 leading-relaxed text-foreground/90">
          {renderInline(line, `p-${key++}`)}
        </p>,
      );
    }
  }
  flushLists();

  return <div className={className}>{blocks}</div>;
}
