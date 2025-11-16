import { MdbookProject } from '../domain/MdbookProject.js';
import { FileSystemAdapter } from '../adapters/FileSystemAdapter.js';
import { validatePath } from '../utils/pathUtils.js';
import { ReadContentResponse } from '../types.js';

export class MdbookContentService {
  constructor(private fs: FileSystemAdapter) {}

  async readContent(project: MdbookProject, relativePath: string): Promise<ReadContentResponse> {
    // Path traversal check
    const fullPath = validatePath(relativePath, project.rootPath);

    // Check file existence
    const exists = await this.fs.fileExists(fullPath);
    if (!exists) {
      throw new Error(`File not found: ${relativePath}`);
    }

    // Read file
    const content = await this.fs.readFile(fullPath);
    const metadata = await this.fs.getFileStats(fullPath);

    return {
      path: relativePath,
      content,
      metadata,
    };
  }
}
