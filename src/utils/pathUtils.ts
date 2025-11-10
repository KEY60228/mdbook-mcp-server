import * as path from 'path';

export class PathValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathValidationError';
  }
}

export function validatePath(requestedPath: string, rootPath: string): string {
  // パスを正規化
  const normalized = path.normalize(requestedPath);

  // ".." を含む場合はエラー
  if (normalized.includes('..')) {
    throw new PathValidationError('Path traversal detected');
  }

  // 絶対パスの場合はエラー
  if (path.isAbsolute(normalized)) {
    throw new PathValidationError('Absolute paths are not allowed');
  }

  // rootPath配下のsrcディレクトリ内のパスを構築
  const fullPath = path.join(rootPath, 'src', normalized);
  const realPath = path.resolve(fullPath);
  const resolvedRoot = path.resolve(rootPath);

  // rootPath配下にあることを確認
  if (!realPath.startsWith(resolvedRoot)) {
    throw new PathValidationError('Access outside root path');
  }

  return realPath;
}
