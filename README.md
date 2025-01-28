# Markyfy

![Bundle Size](https://img.shields.io/bundlephobia/minzip/markyfy?cache-bust&color=black)![Version](https://img.shields.io/npm/v/markyfy?cache-bust&color=black)![Downloads](https://img.shields.io/npm/dm/markyfy?cache-bust&color=black)

**Markyfy** is a simple JavaScript library designed to parse and convert Markdown into HTML. It supports common Markdown elements like headers, blockquotes, code blocks, lists, bold, italic, links, and inline code.

## Features

- **GFM Support**: GitHub Flavored Markdown.
- **Inline Parsing**: Handles bold, italic, code, and links.
- **Customizable**: You can configure parser options.
- **Syntax Highlighting**: Automatically highlights code blocks.

## Installation

```bash
npm install markyfy
```

## Usage

```jsx
import { Markyfy } from "markyfy";

const markdown = `
# Header 1
This is a paragraph with **bold** and *italic* text.
> This is a blockquote.
\`\`\`javascript
console.log("Hello, World!");
\`\`\`
- List item 1
- List item 2
`;

const markyfy = new Markyfy();
const html = markyfy.parse(markdown);

console.log(html);
```

## Configuration Options

You can customize the parser options when initializing the `Markyfy` instance:

```jsx
const markyfy = new Markyfy({
  gfm: true, // Enable GitHub Flavored Markdown
  breaks: true, // Enable line breaks
  headerIds: false, // Disable automatic header IDs
  sanitize: false, // Disable sanitization
});
```

## License

MIT License
