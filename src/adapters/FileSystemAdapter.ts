import * as fs from 'fs/promises';
import { FileSystemError } from '../utils/errors.js';

export class FileSystemAdapter {
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError(`File not found: ${filePath}`);
      }
      if (error.code === 'EACCES') {
        throw new FileSystemError(`Permission denied: ${filePath}`);
      }
      throw new FileSystemError(`Failed to read file: ${error.message}`);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStats(filePath: string): Promise<{ size: number; lastModified: string }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      throw new FileSystemError(`Failed to get file stats: ${error.message}`);
    }
  }
}
