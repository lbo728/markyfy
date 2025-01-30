/**
 * Represents configuration options for the Markdown parser.
 * These options control various parsing behaviors, such as enabling GitHub Flavored Markdown (GFM),
 * handling line breaks, generating header IDs, and sanitizing HTML.
 *
 * @interface
 */
export interface ParserOptions {
  /**
   * Enables GitHub Flavored Markdown (GFM) features.
   *
   * @type {boolean}
   * @default true
   */
  gfm?: boolean;

  /**
   * Enables line breaks as `<br>` tags.
   *
   * @type {boolean}
   * @default false
   */
  breaks?: boolean;

  /**
   * Enables automatic generation of IDs for headers.
   *
   * @type {boolean}
   * @default true
   */
  headerIds?: boolean;

  /**
   * Enables sanitization of HTML to prevent XSS attacks.
   *
   * @type {boolean}
   * @default true
   */
  sanitize?: boolean;
}
