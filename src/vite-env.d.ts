/// <reference types="vite/client" />

declare module 'sql.js/dist/sql-wasm.js' {
  import type { SqlJsStatic } from 'sql.js'
  const initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>
  export default initSqlJs
}
