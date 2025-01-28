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

export interface Token {
  type: TokenType;
  raw: string;
  text?: string;
  depth?: number;
  items?: Token[];
  lang?: string;
  url?: string;
  children?: Token[];
  ordered?: boolean;
}
