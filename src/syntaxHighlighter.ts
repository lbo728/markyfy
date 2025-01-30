/**
 * Represents a syntax highlighting rule, consisting of a regular expression pattern
 * and a token type to apply when the pattern matches.
 *
 * @interface
 */
interface SyntaxRule {
  /** The regular expression pattern to match. */
  pattern: RegExp;
  /** The token type to apply (e.g., "string", "comment", "keyword"). */
  token: string;
}

/**
 * Represents a language definition, containing the name of the language
 * and an array of syntax rules for highlighting.
 *
 * @interface
 */
interface LanguageDefinition {
  /** The name of the language (e.g., "javascript"). */
  name: string;
  /** An array of syntax rules for highlighting the language. */
  rules: SyntaxRule[];
}

/**
 * SyntaxHighlighter is a class that provides syntax highlighting for code snippets
 * based on predefined language definitions. It supports registering custom languages
 * and applying syntax highlighting to code using the registered rules.
 *
 * @class
 */
export class SyntaxHighlighter {
  /** A map of registered languages, keyed by language name. */
  private languages: Map<string, LanguageDefinition> = new Map();

  /**
   * Creates an instance of SyntaxHighlighter.
   * Pre-registers the "javascript" and "js" languages with default syntax rules.
   */
  constructor() {
    this.registerLanguage("javascript", {
      name: "javascript",
      rules: [
        {
          pattern: /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g,
          token: "string",
        },
        { pattern: /\/\/.*$|\/\*[\s\S]*?\*\//gm, token: "comment" },
        {
          pattern:
            /\b(function|class|extends|new|this|super|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|async|await|import|export|default|const|let|var)\b/g,
          token: "keyword",
        },
        { pattern: /\b\d+\.?\d*\b/g, token: "number" },

        {
          pattern: /[{}[\]();,.]/g,
          token: "punctuation",
        },
        {
          pattern: /\b[a-zA-Z_$][0-9a-zA-Z_$]*(?=\()/g,
          token: "function",
        },
        { pattern: /\b(true|false)\b/g, token: "boolean" },
      ],
    });

    this.registerLanguage("js", {
      name: "javascript",
      rules: [
        {
          pattern: /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g,
          token: "string",
        },
        { pattern: /\/\/.*$|\/\*[\s\S]*?\*\//gm, token: "comment" },
        {
          pattern:
            /\b(function|class|extends|new|this|super|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|async|await|import|export|default|const|let|var)\b/g,
          token: "keyword",
        },
        { pattern: /\b\d+\.?\d*\b/g, token: "number" },
        {
          pattern: /[{}[\]();,.]/g,
          token: "punctuation",
        },
        {
          pattern: /\b[a-zA-Z_$][0-9a-zA-Z_$]*(?=\()/g,
          token: "function",
        },
        { pattern: /\b(true|false)\b/g, token: "boolean" },
      ],
    });
  }

  /**
   * Registers a new language definition for syntax highlighting.
   *
   * @param {string} name - The name of the language (e.g., "javascript").
   * @param {LanguageDefinition} definition - The language definition containing syntax rules.
   */
  registerLanguage(name: string, definition: LanguageDefinition) {
    this.languages.set(name, definition);
  }

  /**
   * Applies syntax highlighting to the provided code based on the specified language.
   *
   * @param {string} code - The code to highlight.
   * @param {string} lang - The language to use for highlighting (e.g., "javascript").
   * @returns {string} The highlighted code as an HTML string.
   */
  highlight(code: string, lang: string): string {
    const language = this.languages.get(lang);
    if (!language) return code;

    let highlighted = this.escapeHtmlExceptStrings(code);

    for (const rule of language.rules) {
      highlighted = highlighted.replace(
        new RegExp(
          `(?!<span[^>]*>)(${rule.pattern.source})(?![^<]*<\/span>)`,
          rule.pattern.flags
        ),
        (match) => `<span class="token ${rule.token}">${match}</span>`
      );
    }

    return highlighted;
  }

  /**
   * Escapes HTML special characters in the provided text, except for those inside strings.
   *
   * @private
   * @param {string} text - The text to escape.
   * @returns {string} The escaped text.
   */
  private escapeHtmlExceptStrings(text: string): string {
    return text.replace(/[&<>"']/g, (match) => {
      if (match === "'" && this.isInsideString(text, match)) {
        return match;
      }
      return (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[match] || match
      );
    });
  }

  /**
   * Checks if a character is inside a string (single-quoted, double-quoted, or backtick-quoted).
   *
   * @private
   * @param {string} text - The text to check.
   * @param {string} char - The character to check (e.g., "'").
   * @returns {boolean} True if the character is inside a string, otherwise false.
   */
  private isInsideString(text: string, char: string): boolean {
    const regex = /('|"|`)(?:[^\\]|\\.)*?\1/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (
        match.index <= text.indexOf(char) &&
        regex.lastIndex > text.indexOf(char)
      ) {
        return true;
      }
    }
    return false;
  }
}
