import { BookStructure } from '../domain/BookStructure.js';
import { MdbookProject } from '../domain/MdbookProject.js';
import { FileSystemAdapter } from '../adapters/FileSystemAdapter.js';
import { TomlParser } from '../adapters/TomlParser.js';
import { MarkdownParser } from '../adapters/MarkdownParser.js';

export class MdbookStructureService {
  constructor(
    private fs: FileSystemAdapter,
    private tomlParser: TomlParser,
    private markdownParser: MarkdownParser
  ) {}

  async getStructure(project: MdbookProject): Promise<BookStructure> {
    // book.tomlを読み込み
    const tomlContent = await this.fs.readFile(project.getBookTomlPath());
    const bookData = this.tomlParser.parse(tomlContent);

    // SUMMARY.mdを読み込み
    const summaryContent = await this.fs.readFile(project.getSummaryPath());
    const chapters = this.markdownParser.parseSummary(summaryContent);

    return {
      title: bookData.title,
      authors: bookData.authors,
      language: bookData.language,
      src: bookData.src,
      chapters,
    };
  }
}
