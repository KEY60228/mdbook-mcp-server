# mdbook-mcp-server

A generic MCP (Model Context Protocol) server for mdbook projects. This server allows Claude Code and other MCP clients to access and read mdbook documentation programmatically.

## Features

- **📖 Read mdbook structure**: Get the table of contents from `SUMMARY.md` and metadata from `book.toml`
- **📄 Read content**: Access individual markdown files within the mdbook project
- **🔒 Secure**: Path traversal protection ensures files can only be accessed within the mdbook root
- **🚀 Generic**: Works with any mdbook project, not just specific ones
- **⚡ Simple**: Minimal configuration required - just set an environment variable
- **📦 Easy to install**: Available via npm, no complex setup needed

## Installation

You can use `npx` to run the server without installing it globally:

```bash
npx mdbook-mcp-server
```

## Usage

### With Claude Code

Add the following configuration to your Claude Code config file (`~/.config/claude/config.json`):

```json
{
  "mcpServers": {
    "my-mdbook": {
      "command": "npx",
      "args": ["mdbook-mcp-server"],
      "env": {
        "MDBOOK_ROOT_PATH": "/absolute/path/to/your/mdbook/project",
        "MDBOOK_SERVER_NAME": "my_mdbook"
      }
    }
  }
}
```

**Environment Variables:**
- `MDBOOK_ROOT_PATH` (required): Absolute path to your mdbook project root (where `book.toml` is located)
- `MDBOOK_SERVER_NAME` (optional): A friendly name for the server (defaults to "mdbook-mcp-server")

### Multiple mdbook Projects

You can run multiple instances of the server for different mdbook projects:

```json
{
  "mcpServers": {
    "mdbook-project-a": {
      "command": "npx",
      "args": ["mdbook-mcp-server"],
      "env": {
        "MDBOOK_ROOT_PATH": "/path/to/project-a",
        "MDBOOK_SERVER_NAME": "project_a"
      }
    },
    "mdbook-project-b": {
      "command": "npx",
      "args": ["mdbook-mcp-server"],
      "env": {
        "MDBOOK_ROOT_PATH": "/path/to/project-b",
        "MDBOOK_SERVER_NAME": "project_b"
      }
    }
  }
}
```

## MCP Tools

This server provides three tools:

### 1. `list_structure`

Get the complete structure of the mdbook project, including metadata and table of contents.

**Parameters:** None

**Returns:**
```json
{
  "title": "My Book",
  "authors": ["Author Name"],
  "language": "en",
  "src": "src",
  "chapters": [
    {
      "title": "Introduction",
      "path": "intro.md",
      "level": 0
    },
    {
      "title": "Chapter 1",
      "path": "chapter1.md",
      "level": 0,
      "children": [
        {
          "title": "Section 1.1",
          "path": "chapter1/section1.md",
          "level": 1
        }
      ]
    }
  ]
}
```

### 2. `read_content`

Read the content of a specific markdown file.

**Parameters:**
- `path` (string, required): Relative path to the markdown file from the `src/` directory

**Example:**
```json
{
  "path": "intro.md"
}
```

**Returns:**
```json
{
  "path": "intro.md",
  "content": "# Introduction\n\nWelcome to...",
  "metadata": {
    "size": 1234,
    "lastModified": "2025-11-10T12:34:56.789Z"
  }
}
```

### 3. `search_content`

Search for content within the mdbook project using fuzzy search. Supports both English and Japanese keywords.

**Parameters:**
- `query` (string, required): Search query
- `maxResults` (number, optional): Maximum number of results to return (default: 10, max: 100)

**Example:**
```json
{
  "query": "authentication",
  "maxResults": 5
}
```

**Returns:**
```json
{
  "query": "authentication",
  "totalMatches": 3,
  "results": [
    {
      "path": "auth/intro.md",
      "title": "Authentication",
      "score": 0.001,
      "matchCount": 2,
      "matches": [
        {
          "snippet": "...user authentication is important...",
          "position": 123
        },
        {
          "snippet": "...authentication methods include...",
          "position": 456
        }
      ]
    }
  ]
}
```

**Features:**
- **Fuzzy search**: Handles typos and spelling variations
- **Japanese support**: Works with hiragana, katakana, and kanji
- **Smart scoring**: Results are ranked by relevance (lower score = better match)
- **Context snippets**: Shows surrounding text for each match

## Requirements

- Node.js >= 22.0.0
- A valid mdbook project with `book.toml` and `src/SUMMARY.md`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Links

- [npm package](https://www.npmjs.com/package/mdbook-mcp-server)
- [mdbook Documentation](https://rust-lang.github.io/mdBook/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
