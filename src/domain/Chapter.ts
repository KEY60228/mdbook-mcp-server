export interface Chapter {
  title: string;
  path: string | null;  // nullの場合はセパレーター
  level: number;        // 0始まりの階層レベル
  children?: Chapter[]; // ネストされた章
}
