import { MdbookProject } from '../domain/MdbookProject.js';
import { FileSystemAdapter } from '../adapters/FileSystemAdapter.js';
import { validatePath } from '../utils/pathUtils.js';
import { ReadContentResponse } from '../types.js';

export class MdbookContentService {
  constructor(private fs: FileSystemAdapter) {}

  async readContent(project: MdbookProject, relativePath: string): Promise<ReadContentResponse> {
    // パストラバーサルチェック
    const fullPath = validatePath(relativePath, project.rootPath);

    // ファイルの存在確認
    const exists = await this.fs.fileExists(fullPath);
    if (!exists) {
      throw new Error(`File not found: ${relativePath}`);
    }

    // ファイルの読み込み
    const content = await this.fs.readFile(fullPath);
    const metadata = await this.fs.getFileStats(fullPath);

    return {
      path: relativePath,
      content,
      metadata,
    };
  }
}
