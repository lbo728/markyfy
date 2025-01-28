interface SyntaxRule {
  pattern: RegExp;
  token: string;
}

interface LanguageDefinition {
  name: string;
  rules: SyntaxRule[];
}
export class SyntaxHighlighter {
  private languages: Map<string, LanguageDefinition> = new Map();

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

  registerLanguage(name: string, definition: LanguageDefinition) {
    this.languages.set(name, definition);
  }

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
