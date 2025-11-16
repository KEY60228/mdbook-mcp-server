import * as path from 'path';

export class PathValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathValidationError';
  }
}

export function validatePath(requestedPath: string, rootPath: string): string {
  // Normalize path
  const normalized = path.normalize(requestedPath);

  // Error if contains ".."
  if (normalized.includes('..')) {
    throw new PathValidationError('Path traversal detected');
  }

  // Error if absolute path
  if (path.isAbsolute(normalized)) {
    throw new PathValidationError('Absolute paths are not allowed');
  }

  // Build path within src directory under rootPath
  const fullPath = path.join(rootPath, 'src', normalized);
  const realPath = path.resolve(fullPath);
  const resolvedRoot = path.resolve(rootPath);

  // Verify path is under rootPath
  if (!realPath.startsWith(resolvedRoot)) {
    throw new PathValidationError('Access outside root path');
  }

  return realPath;
}
