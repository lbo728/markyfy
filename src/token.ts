/**
 * Represents the type of a token in the Markdown parsing process.
 * Tokens are used to represent different elements of Markdown syntax, such as paragraphs, headers, code blocks, etc.
 *
 * @typedef {string} TokenType
 * @property {"paragraph"} paragraph - Represents a paragraph of text.
 * @property {"header"} header - Represents a header (e.g., `#`, `##`, etc.).
 * @property {"code_block"} code_block - Represents a code block (e.g., ```code```).
 * @property {"code"} code - Represents inline code (e.g., `code`).
 * @property {"bold"} bold - Represents bold text (e.g., `**bold**`).
 * @property {"italic"} italic - Represents italic text (e.g., `*italic*`).
 * @property {"link"} link - Represents a hyperlink (e.g., `[text](url)`).
 * @property {"list"} list - Represents a list (ordered or unordered).
 * @property {"list_item"} list_item - Represents an item in a list.
 * @property {"blockquote"} blockquote - Represents a blockquote (e.g., `> text`).
 * @property {"text"} text - Represents plain text.
 */
export type TokenType =
  | "paragraph"
  | "header"
  | "code_block"
  | "code"
  | "bold"
  | "italic"
  | "link"
  | "list"
  | "list_item"
  | "blockquote"
  | "text";

/**
 * Represents a token in the Markdown parsing process.
 * A token is a structured representation of a Markdown element, containing its type, raw content, and additional metadata.
 *
 * @interface
 */
export interface Token {
  /** The type of the token (e.g., "paragraph", "header", etc.). */
  type: TokenType;

  /** The raw content of the token as it appears in the Markdown source. */
  raw: string;

  /** The text content of the token, if applicable. */
  text?: string;

  /** The depth of the header token (e.g., 1 for `#`, 2 for `##`, etc.). */
  depth?: number;

  /** The items contained within a list token, if applicable. */
  items?: Token[];

  /** The language of the code block token, if applicable. */
  lang?: string;

  /** The URL of the link token, if applicable. */
  url?: string;

  /** The child tokens contained within this token, if applicable. */
  children?: Token[];

  /** Indicates whether a list token is ordered (true) or unordered (false). */
  ordered?: boolean;
}
