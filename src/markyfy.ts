import { ParserOptions } from "./parser";
import { SyntaxHighlighter } from "./syntaxHighlighter";
import { Token } from "./token";

/**
 * Markyfy is a Markdown parser and syntax highlighter that converts Markdown text into HTML.
 * It supports various Markdown features such as headers, blockquotes, code blocks, lists, and inline elements.
 *
 * @class
 */
export class Markyfy {
  /**
   * Creates an instance of Markyfy.
   *
   * @param {ParserOptions} [options={}] - Configuration options for the parser.
   * @param {boolean} [options.gfm=true] - Enables GitHub Flavored Markdown (GFM) features.
   * @param {boolean} [options.breaks=false] - Enables line breaks as `<br>` tags.
   * @param {boolean} [options.headerIds=true] - Enables automatic generation of IDs for headers.
   * @param {boolean} [options.sanitize=true] - Sanitizes URLs to prevent XSS attacks.
   */
  constructor(options: ParserOptions = {}) {
    this.options = {
      gfm: true,
      breaks: false,
      headerIds: true,
      sanitize: true,
      ...options,
    };
    this.syntaxHighlighter = new SyntaxHighlighter();
  }

  /**
   * Parses the given Markdown text and converts it into HTML.
   *
   * @param {string} markdown - The Markdown text to parse.
   * @returns {string} The resulting HTML.
   */
  public parse(markdown: string): string {
    try {
      const tokens = this.tokenize(markdown);
      return this.tokensToHtml(tokens);
    } catch (error) {
      console.error("Parsing error:", error);
      return this.escapeHtml(markdown);
    }
  }

  private options: Required<ParserOptions>;
  private syntaxHighlighter: SyntaxHighlighter;

  /**
   * Tokenizes the Markdown text into an array of tokens.
   *
   * @private
   * @param {string} markdown - The Markdown text to tokenize.
   * @returns {Token[]} An array of tokens representing the Markdown structure.
   */

  private tokenize(markdown: string): Token[] {
    const tokens: Token[] = [];
    const lines = markdown.trim().split("\n");

    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i];

        if (line.startsWith("#")) {
          tokens.push(this.parseHeader(line));
          continue;
        }

        if (line.startsWith(">")) {
          const blockquote = this.parseBlockquote(lines, i);
          tokens.push(blockquote.token);
          i = blockquote.newIndex;
          continue;
        }

        if (line.startsWith("```")) {
          const codeBlock = this.parseCodeBlock(lines, i);
          tokens.push(codeBlock.token);
          i = codeBlock.newIndex;
          continue;
        }

        if (
          line.trim().match(/^[-*+]\s+.+/) ||
          line.trim().match(/^\d+\.\s+.+/)
        ) {
          const list = this.parseList(lines, i);
          tokens.push(list.token);
          i = list.newIndex;
          continue;
        }

        if (line.trim()) {
          tokens.push({
            type: "paragraph",
            raw: line,
            children: this.parseInline(line),
          });
        }
      } catch (error) {
        console.error(`Error parsing line ${i + 1}:`, error);
        tokens.push({
          type: "paragraph",
          raw: lines[i],
          text: this.escapeHtml(lines[i]),
        });
      }
    }

    return tokens;
  }

  /**
   * Parses inline Markdown elements (e.g., bold, italic, code, links) within a line of text.
   *
   * @private
   * @param {string} text - The text containing inline Markdown elements.
   * @returns {Token[]} An array of tokens representing the inline elements.
   */
  private parseInline(text: string): Token[] {
    const tokens: Token[] = [];
    let current = "";
    let i = 0;

    while (i < text.length) {
      // Bold
      if (text.startsWith("**", i) || text.startsWith("__", i)) {
        const marker = text.substr(i, 2);
        const end = text.indexOf(marker, i + 2);
        if (end !== -1) {
          if (current)
            tokens.push({ type: "text", raw: current, text: current });
          tokens.push({
            type: "bold",
            raw: text.slice(i, end + 2),
            text: text.slice(i + 2, end),
          });
          i = end + 2;
          current = "";
          continue;
        }
      }

      // Italic
      if (text[i] === "*" || text[i] === "_") {
        const end = text.indexOf(text[i], i + 1);
        if (end !== -1) {
          if (current)
            tokens.push({ type: "text", raw: current, text: current });
          tokens.push({
            type: "italic",
            raw: text.slice(i, end + 1),
            text: text.slice(i + 1, end),
          });
          i = end + 1;
          current = "";
          continue;
        }
      }

      // Inline code
      if (text[i] === "`") {
        const end = text.indexOf("`", i + 1);
        if (end !== -1) {
          if (current)
            tokens.push({ type: "text", raw: current, text: current });
          tokens.push({
            type: "code",
            raw: text.slice(i, end + 1),
            text: text.slice(i + 1, end),
          });
          i = end + 1;
          current = "";
          continue;
        }
      }

      // Link
      if (text[i] === "[") {
        const titleEnd = text.indexOf("]", i);
        if (titleEnd !== -1 && text[titleEnd + 1] === "(") {
          const urlEnd = text.indexOf(")", titleEnd + 2);
          if (urlEnd !== -1) {
            if (current)
              tokens.push({ type: "text", raw: current, text: current });
            tokens.push({
              type: "link",
              raw: text.slice(i, urlEnd + 1),
              text: text.slice(i + 1, titleEnd),
              url: text.slice(titleEnd + 2, urlEnd),
            });
            i = urlEnd + 1;
            current = "";
            continue;
          }
        }
      }

      current += text[i];
      i++;
    }

    if (current) {
      tokens.push({ type: "text", raw: current, text: current });
    }

    return tokens;
  }

  /**
   * Parses a Markdown header line into a token.
   *
   * @private
   * @param {string} line - The header line to parse.
   * @returns {Token} A token representing the header.
   */
  private parseHeader(line: string): Token {
    const match = line.match(/^(#{1,6})(\s+(.+))?$/);
    if (!match) {
      return {
        type: "paragraph",
        raw: line,
        children: this.parseInline(line),
      };
    }

    if (!match[2]) {
      return {
        type: "paragraph",
        raw: line,
        children: this.parseInline(line),
      };
    }

    return {
      type: "header",
      raw: line,
      text: match[3],
      depth: match[1].length,
      children: this.parseInline(match[3]),
    };
  }

  /**
   * Parses a Markdown blockquote into a token.
   *
   * @private
   * @param {string[]} lines - The array of lines containing the blockquote.
   * @param {number} startIndex - The starting index of the blockquote in the lines array.
   * @returns {{ token: Token; newIndex: number }} An object containing the blockquote token and the new index.
   */
  private parseBlockquote(
    lines: string[],
    startIndex: number
  ): { token: Token; newIndex: number } {
    const content: string[] = [];
    let i = startIndex;

    while (
      i < lines.length &&
      (lines[i].startsWith(">") || lines[i].trim() === "")
    ) {
      if (lines[i].trim() !== "") {
        content.push(lines[i].slice(1).trim());
      }
      i++;
    }

    return {
      token: {
        type: "blockquote",
        raw: lines.slice(startIndex, i).join("\n"),
        children: this.tokenize(content.join("\n")),
      },
      newIndex: i - 1,
    };
  }

  /**
   * Parses a Markdown code block into a token.
   *
   * @private
   * @param {string[]} lines - The array of lines containing the code block.
   * @param {number} startIndex - The starting index of the code block in the lines array.
   * @returns {{ token: Token; newIndex: number }} An object containing the code block token and the new index.
   */
  private parseCodeBlock(
    lines: string[],
    startIndex: number
  ): { token: Token; newIndex: number } {
    const content: string[] = [];
    let i = startIndex + 1;
    const lang = lines[startIndex].slice(3).trim();

    while (i < lines.length && !lines[i].startsWith("```")) {
      content.push(lines[i]);
      i++;
    }

    if (i >= lines.length) {
      throw new Error("Unclosed code block");
    }

    return {
      token: {
        type: "code_block",
        raw: lines.slice(startIndex, i + 1).join("\n"),
        text: content.join("\n"),
        lang,
      },
      newIndex: i,
    };
  }

  /**
   * Parses a Markdown list into a token.
   *
   * @private
   * @param {string[]} lines - The array of lines containing the list.
   * @param {number} startIndex - The starting index of the list in the lines array.
   * @returns {{ token: Token; newIndex: number }} An object containing the list token and the new index.
   */
  private parseList(
    lines: string[],
    startIndex: number
  ): { token: Token; newIndex: number } {
    const items: Token[] = [];
    let i = startIndex;
    let currentIndent = 0;
    const listStack: Token[][] = [items];

    const firstLine = lines[startIndex].trim();
    const isOrderedList = /^\d+\.\s/.test(firstLine);

    while (i < lines.length) {
      const line = lines[i];
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1].length : 0;

      const isOrderedItem = /^\d+\.\s+(.+)$/.test(line.trim());
      const isUnorderedItem = /^[-*+]\s+(.+)$/.test(line.trim());

      const isValidListItem = isOrderedList ? isOrderedItem : isUnorderedItem;
      const listItemMatch = line
        .trim()
        .match(isOrderedList ? /^(\d+\.)\s+(.+)$/ : /^([-*+])\s+(.+)$/);

      if (!listItemMatch || !isValidListItem) {
        if (indent > currentIndent && line.trim()) {
          const currentList = listStack[listStack.length - 1];
          if (currentList.length > 0) {
            const lastItem = currentList[currentList.length - 1];
            if (lastItem.text) {
              lastItem.text += "\n" + line.trim();
              if (lastItem.children) {
                lastItem.children.push({
                  type: "text",
                  raw: line.trim(),
                  text: line.trim(),
                });
              }
            }
          }
          i++;
          continue;
        }
        break;
      }

      const [, marker, content] = listItemMatch;

      if (indent > currentIndent) {
        const newList: Token[] = [];
        const parentList = listStack[listStack.length - 1];
        if (parentList.length > 0) {
          const lastItem = parentList[parentList.length - 1];
          lastItem.items = newList;
        }
        listStack.push(newList);
        currentIndent = indent;
      } else if (indent < currentIndent) {
        while (indent < currentIndent && listStack.length > 1) {
          listStack.pop();
          currentIndent -= 2;
        }
      }

      const currentList = listStack[listStack.length - 1];
      currentList.push({
        type: "list_item",
        raw: line,
        text: content,
        ordered: isOrderedList,
        children: this.parseInline(content),
      });

      i++;
    }

    return {
      token: {
        type: "list",
        raw: lines.slice(startIndex, i).join("\n"),
        ordered: isOrderedList,
        items: items,
      },
      newIndex: i - 1,
    };
  }

  /**
   * Converts an array of tokens into an HTML string.
   *
   * @private
   * @param {Token[]} tokens - The array of tokens to convert.
   * @returns {string} The resulting HTML string.
   */
  private tokensToHtml(tokens: Token[]): string {
    const html = tokens
      .map((token) => {
        switch (token.type) {
          case "header":
            const id = this.options.headerIds
              ? ` id="${this.slugify(token.text || "")}"`
              : "";
            return `<h${token.depth}${id}>${this.renderChildren(
              token.children
            )}</h${token.depth}>`;

          case "code_block":
            const highlighted = this.syntaxHighlighter.highlight(
              token.text || "",
              token.lang || ""
            );
            return `
            <pre>
              <code class="language-${token.lang || ""}">${highlighted}</code>
            </pre>
            <style>
              pre {
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: #282c34;
                color: #abb2bf;
                padding: 1rem;
                border-radius: 5px;
                overflow-x: auto;

                code {
                  font-family: "Fira Code", monospace;
                  font-size: 14px;
                  background: initial;
                  color: white;
                  line-height: 1.5;
                }
              }
              .token.keyword { color: #c678dd; }
              .token.function { color: #61afef; }
              .token.string { color: #ce9178; }
              .token.comment { color: #7c858d; }
              .token.number { color: #b5cea8; }
              .token.boolean { color: #569cd6; }
              .token.type { color: #4ec9b0; }
              .token.class { color: #4ec9b0; }
              .token.punctuation { color: #abb2bf; } 
            </style>
          `;

          case "paragraph":
            return `<p>${this.renderChildren(token.children)}</p>`;

          case "blockquote":
            return `<blockquote>${this.tokensToHtml(
              token.children || []
            )}</blockquote>`;

          case "list": {
            const tag = token.ordered ? "ol" : "ul";
            const renderListItems = (items: Token[] = []): string => {
              return items
                .map((item) => {
                  const itemContent = this.renderChildren(item.children);
                  const nestedList = item.items
                    ? `\n${renderListItems(item.items)}\n`
                    : "";
                  return `<li>${itemContent}${nestedList}</li>`;
                })
                .join("\n");
            };
            return `
              <${tag}>\n${renderListItems(token.items)}\n</${tag}>
              <style>
                ul {
                  list-style-type: disc;
                  padding-left: 20px;
                  display: block;
                  margin-block-start: 1em;
                  margin-block-end: 1em;
                  margin-inline-start: 0px;
                  margin-inline-end: 0px;
                  padding-inline-start: 40px;
                  unicode-bidi: isolate;
                }
                
                ol {
                  list-style-type: decimal;
                  padding-left: 20px;
                  display: block;
                  margin-block-start: 1em;
                  margin-block-end: 1em;
                  margin-inline-start: 0px;
                  margin-inline-end: 0px;
                  padding-inline-start: 40px;
                  unicode-bidi: isolate;
                }

                ul ul {
                  list-style-type: circle;
                }
                
                ul ul ul {
                  list-style-type: square;
                }
                
                ol ol {
                  list-style-type: lower-alpha;
                }
                
                ol ol ol {
                  list-style-type: lower-roman;
                }
              </>
            `;
          }

          case "bold":
            return `<strong>${this.escapeHtml(token.text || "")}</strong>`;

          case "italic":
            return `<em>${this.escapeHtml(token.text || "")}</em>`;

          case "code":
            return `<code>${this.escapeHtml(token.text || "")}</code>`;

          case "link":
            const url = this.options.sanitize
              ? this.sanitizeUrl(token.url || "")
              : token.url;
            return `<a href="${url}">${this.escapeHtml(token.text || "")}</a>`;

          default:
            return this.escapeHtml(token.text || "");
        }
      })
      .join("\n");

    return html;
  }

  /**
   * Renders the children tokens of a parent token into an HTML string.
   *
   * @private
   * @param {Token[]} [children] - The array of child tokens to render.
   * @returns {string} The resulting HTML string.
   */
  private renderChildren(children?: Token[]): string {
    if (!children) return "";
    return children.map((child) => this.tokensToHtml([child])).join("");
  }

  /**
   * Sanitizes a URL to prevent XSS attacks.
   *
   * @private
   * @param {string} url - The URL to sanitize.
   * @returns {string} The sanitized URL.
   */
  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "javascript:" ? "" : url;
    } catch {
      return url;
    }
  }

  /**
   * Converts a text string into a URL-friendly slug.
   *
   * @private
   * @param {string} text - The text to slugify.
   * @returns {string} The slugified text.
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /**
   * Escapes HTML special characters in a text string.
   *
   * @private
   * @param {string} text - The text to escape.
   * @returns {string} The escaped text.
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
