import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { MdbookProject } from './domain/MdbookProject.js';
import { FileSystemAdapter } from './adapters/FileSystemAdapter.js';
import { TomlParser } from './adapters/TomlParser.js';
import { MarkdownParser } from './adapters/MarkdownParser.js';
import { MdbookStructureService } from './services/MdbookStructureService.js';
import { MdbookContentService } from './services/MdbookContentService.js';
import { MdbookServerConfig } from './types.js';

export class MdbookMcpServer {
  private mcpServer: McpServer;
  private project: MdbookProject;
  private structureService: MdbookStructureService;
  private contentService: MdbookContentService;

  constructor(config: MdbookServerConfig) {
    const serverName = config.serverName || 'mdbook-mcp-server';

    this.mcpServer = new McpServer(
      {
        name: serverName,
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // サービスの初期化
    const fs = new FileSystemAdapter();
    const tomlParser = new TomlParser();
    const markdownParser = new MarkdownParser();

    this.structureService = new MdbookStructureService(fs, tomlParser, markdownParser);
    this.contentService = new MdbookContentService(fs);

    // プロジェクトの初期化
    const srcPath = `${config.rootPath}/src`;
    this.project = new MdbookProject(config.rootPath, srcPath);

    // ツールの登録
    this.setupTools();
  }

  private setupTools() {
    // list_structure ツールの登録
    this.mcpServer.registerTool(
      'list_structure',
      {
        description: 'Get the structure of the mdbook project',
      },
      async () => {
        try {
          const structure = await this.structureService.getStructure(this.project);
          return {
            content: [{ type: 'text', text: JSON.stringify(structure, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
          };
        }
      }
    );

    // read_content ツールの登録
    this.mcpServer.registerTool(
      'read_content',
      {
        description: 'Read the content of a specific page',
        inputSchema: {
          path: z.string().describe('Relative path to the markdown file (from src/)'),
        },
      },
      async (args: any) => {
        try {
          const { path } = args as { path: string };
          const content = await this.contentService.readContent(this.project, path);
          return {
            content: [{ type: 'text', text: JSON.stringify(content, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
          };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.error('Mdbook MCP server running on stdio');
  }
}
