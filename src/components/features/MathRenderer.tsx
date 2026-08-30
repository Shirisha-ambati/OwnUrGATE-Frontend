import React from "react";
import katex from "katex";

interface MathRendererProps {
  text: string;
  className?: string;
  block?: boolean;
}

function renderMath(text: string): string {
  if (!text) return "";
  let result = text;
  // Replace display math $$...$$
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_match, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false, output: "html" });
    } catch {
      return `<span class="text-red-400">[Math Error]</span>`;
    }
  });
  // Replace inline math $...$
  result = result.replace(/\$([^$\n]+?)\$/g, (_match, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false, output: "html" });
    } catch {
      return `<span class="text-red-400">[Math Error]</span>`;
    }
  });
  return result;
}

export default function MathRenderer({ text, className = "", block = false }: MathRendererProps) {
  const html = renderMath(text);
  const Tag = block ? "div" : "span";
  return (
    <Tag
      className={`katex-render leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
