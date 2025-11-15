# Alice's Adventures in Wonderland - Example mdbook

This is an example mdbook project demonstrating the structure and usage of [mdbook-mcp-server](https://github.com/KEY60228/mdbook-mcp-server).

## About

This book contains selected chapters from Lewis Carroll's classic **Alice's Adventures in Wonderland** (1865), which is now in the public domain. The content is organized into two parts:

- **Part 1: Down the Rabbit Hole** - Alice's initial descent and first encounters
- **Part 2: Adventures in Wonderland** - Continued adventures with Wonderland's peculiar inhabitants

## Building the Book

To build and view this mdbook:

```bash
# Build the book
mdbook build

# Or serve it locally with live reload
mdbook serve
```

The built book will be available in the `book/` directory, or at `http://localhost:3000` when using `mdbook serve`.

## Using with mdbook-mcp-server

This example can be accessed via MCP in any compatible client. Configure the server by setting the `MDBOOK_ROOT_PATH` environment variable to the absolute path of this directory.

### Claude Code

Add the following to `~/.config/claude/config.json`:

```json
{
  "mcpServers": {
    "alice-wonderland": {
      "command": "npx",
      "args": ["mdbook-mcp-server"],
      "env": {
        "MDBOOK_ROOT_PATH": "/absolute/path/to/this/directory",
        "MDBOOK_SERVER_NAME": "alice_wonderland"
      }
    }
  }
}
```

### Cursor

Add the following to your Cursor MCP settings (`.cursor/mcp.json` or global settings):

```json
{
  "mcpServers": {
    "alice-wonderland": {
      "command": "npx",
      "args": ["mdbook-mcp-server"],
      "env": {
        "MDBOOK_ROOT_PATH": "/absolute/path/to/this/directory",
        "MDBOOK_SERVER_NAME": "alice_wonderland"
      }
    }
  }
}
```

### Other MCP Clients

See `.example.mcp.json` for a configuration template. The key requirements are:
- Set `MDBOOK_ROOT_PATH` to the absolute path of this example directory
- Optionally set `MDBOOK_SERVER_NAME` for a custom server name

## Example Prompts

Once configured, try asking questions like:

- "What chapters are in this Alice book?"
- "Show me Chapter 1"
- "What happens when Alice meets the Caterpillar?"
- "Summarize Part 2"
- "Find mentions of the White Rabbit"

## Project Structure

```
.
├── book.toml           # Book configuration
├── src/
│   ├── SUMMARY.md      # Table of contents
│   ├── introduction.md # Introduction
│   ├── part1/          # Part 1 chapters
│   │   ├── chapter1.md
│   │   ├── chapter2.md
│   │   └── chapter3.md
│   └── part2/          # Part 2 chapters
│       ├── chapter4.md
│       ├── chapter5.md
│       └── chapter6.md
└── .example.mcp.json   # MCP configuration example
```

## License

The text of *Alice's Adventures in Wonderland* is in the public domain.
