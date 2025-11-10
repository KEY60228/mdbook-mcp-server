export class MdbookProject {
  constructor(
    public readonly rootPath: string,
    public readonly srcPath: string
  ) {}

  getBookTomlPath(): string {
    return `${this.rootPath}/book.toml`;
  }

  getSummaryPath(): string {
    return `${this.srcPath}/SUMMARY.md`;
  }
}
