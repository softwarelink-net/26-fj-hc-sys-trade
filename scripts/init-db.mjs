import Database from 'better-sqlite3'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const schemaPath = path.join(root, 'schema.sql')
const outDir = path.join(root, 'public', 'data')
const outPath = path.join(outDir, 'hc_sys_database.sqlite')

fs.mkdirSync(outDir, { recursive: true })
if (fs.existsSync(outPath)) fs.unlinkSync(outPath)

let schema = fs.readFileSync(schemaPath, 'utf8')

const hashes = {
  PLACEHOLDER_ADMIN: crypto.createHash('md5').update('admin123').digest('hex'),
  PLACEHOLDER_MANAGER: crypto.createHash('md5').update('manager123').digest('hex'),
  PLACEHOLDER_OPERATOR: crypto.createHash('md5').update('operator123').digest('hex'),
  PLACEHOLDER_BIDDER: crypto.createHash('md5').update('bidder123').digest('hex'),
}

for (const [k, v] of Object.entries(hashes)) {
  schema = schema.replaceAll(k, v)
}

const db = new Database(outPath)
db.exec(schema)
db.close()

const wasmSrc = path.join(root, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
const wasmDst = path.join(root, 'public', 'sql-wasm.wasm')
if (fs.existsSync(wasmSrc)) {
  fs.copyFileSync(wasmSrc, wasmDst)
  console.log(`[db:init] wasm copied => ${wasmDst}`)
}

console.log(`[db:init] SQLite ready => ${outPath}`)
