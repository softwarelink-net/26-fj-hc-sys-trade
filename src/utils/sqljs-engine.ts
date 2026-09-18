import type { Database, SqlJsStatic } from 'sql.js'
import { md5 } from './md5'
import type {
  DashboardStats,
  HcAsset,
  HcBidRecord,
  HcBidder,
  HcConfig,
  HcMessage,
  HcNotice,
  HcUser,
} from '@/types/hc'

let SQL: SqlJsStatic | null = null
let db: Database | null = null
let readyPromise: Promise<void> | null = null

type InitSqlJs = (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>

async function loadInitSqlJs(): Promise<InitSqlJs> {
  const mod = await import('sql.js/dist/sql-wasm.js')
  const factory = (mod as { default?: InitSqlJs }).default ?? (mod as unknown as InitSqlJs)
  return factory
}

function rowsFromExec<T>(sql: string, params: unknown[] = []): T[] {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  const stmt = db.prepare(sql)
  stmt.bind(params as never[])
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

function run(sql: string, params: unknown[] = []) {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  db.run(sql, params as never[])
}

export async function initSqlEngine(): Promise<void> {
  if (db) return
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    const initSqlJs = await loadInitSqlJs()
    SQL = await initSqlJs({
      locateFile: (file) => `/${file}`,
    })
    const response = await fetch('/data/hc_sys_database.sqlite')
    if (!response.ok) {
      throw new Error(`无法加载 SQLite 数据库: ${response.status}`)
    }
    const buffer = await response.arrayBuffer()
    db = new SQL.Database(new Uint8Array(buffer))
  })()

  return readyPromise
}

export function isEngineReady() {
  return !!db
}

export async function login(account: string, password: string): Promise<HcUser | null> {
  await initSqlEngine()
  const hash = md5(password)
  const users = rowsFromExec<HcUser & { password_hash: string }>(
    `SELECT id, username, password_hash, role, company_name, full_name, created_at
     FROM hc_sys_users
     WHERE username = ?
     LIMIT 1`,
    [account],
  )
  const user = users[0]
  if (!user || user.password_hash !== hash) return null
  const { password_hash: _, ...safe } = user
  return safe
}

export function getConfig(key: string): string | null {
  return rowsFromExec<HcConfig>(`SELECT key, value, description FROM hc_sys_configs WHERE key = ?`, [key])[0]
    ?.value ?? null
}

export function listConfigs(): HcConfig[] {
  return rowsFromExec<HcConfig>(`SELECT key, value, description FROM hc_sys_configs ORDER BY key`)
}

export function getPrimaryAsset(): HcAsset | null {
  return (
    rowsFromExec<HcAsset>(
      `SELECT * FROM hc_sys_assets ORDER BY id ASC LIMIT 1`,
    )[0] ?? null
  )
}

export function listNotices(): HcNotice[] {
  return rowsFromExec<HcNotice>(
    `SELECT * FROM hc_sys_notices ORDER BY is_pinned DESC, published_at DESC`,
  )
}

export function listMessages(userId: number): HcMessage[] {
  return rowsFromExec<HcMessage>(
    `SELECT * FROM hc_sys_messages WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  )
}

export function markMessageRead(id: number) {
  run(`UPDATE hc_sys_messages SET is_read = 1 WHERE id = ?`, [id])
}

export function listBidders(assetId: number): HcBidder[] {
  return rowsFromExec<HcBidder>(
    `SELECT b.*, u.username
     FROM hc_sys_bidders b
     LEFT JOIN hc_sys_users u ON u.id = b.user_id
     WHERE b.asset_id = ?
     ORDER BY b.registered_at DESC`,
    [assetId],
  )
}

export function getBidderByUser(assetId: number, userId: number): HcBidder | null {
  return (
    rowsFromExec<HcBidder>(
      `SELECT * FROM hc_sys_bidders WHERE asset_id = ? AND user_id = ? LIMIT 1`,
      [assetId, userId],
    )[0] ?? null
  )
}

export function listBidRecords(assetId: number, bidderId?: number): HcBidRecord[] {
  if (bidderId != null) {
    return rowsFromExec<HcBidRecord>(
      `SELECT r.*, b.company_name
       FROM hc_sys_bid_records r
       LEFT JOIN hc_sys_bidders b ON b.id = r.bidder_id
       WHERE r.asset_id = ? AND r.bidder_id = ?
       ORDER BY r.bid_time DESC`,
      [assetId, bidderId],
    )
  }
  return rowsFromExec<HcBidRecord>(
    `SELECT r.*, b.company_name
     FROM hc_sys_bid_records r
     LEFT JOIN hc_sys_bidders b ON b.id = r.bidder_id
     WHERE r.asset_id = ?
     ORDER BY r.bid_time DESC`,
    [assetId],
  )
}

export function getHighestBid(assetId: number): number {
  const row = rowsFromExec<{ m: number | null }>(
    `SELECT MAX(bid_amount) AS m FROM hc_sys_bid_records WHERE asset_id = ? AND status = 'VALID'`,
    [assetId],
  )[0]
  return row?.m ?? 0
}

export function placeBid(assetId: number, bidderId: number, amount: number): { ok: boolean; message: string } {
  const asset = getPrimaryAsset()
  if (!asset || asset.id !== assetId) return { ok: false, message: '标的不存在' }
  if (asset.status !== 'BIDDING' && asset.status !== 'LISTING') {
    return { ok: false, message: '当前不在竞价阶段' }
  }

  const minInc = Number(getConfig('min_bid_increment') || 100)
  const listing = asset.listing_price
  const highest = getHighestBid(assetId)
  const floor = Math.max(listing, highest + (highest > 0 ? minInc : 0))

  if (amount < floor) {
    return { ok: false, message: `出价须不低于 ¥${floor.toLocaleString('zh-CN')}` }
  }

  run(
    `INSERT INTO hc_sys_bid_records (asset_id, bidder_id, bid_amount, status) VALUES (?, ?, ?, 'VALID')`,
    [assetId, bidderId, amount],
  )
  if (asset.status === 'LISTING') {
    run(`UPDATE hc_sys_assets SET status = 'BIDDING', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [assetId])
  }
  return { ok: true, message: `出价成功：¥${amount.toLocaleString('zh-CN')}` }
}

export function registerBidder(input: {
  asset_id: number
  user_id: number
  company_name: string
  credit_code: string
  contact_person: string
  contact_phone: string
  margin_payment_proof?: string
}): { ok: boolean; message: string } {
  const existing = getBidderByUser(input.asset_id, input.user_id)
  if (existing) return { ok: false, message: '您已提交过报名申请' }

  run(
    `INSERT INTO hc_sys_bidders
     (asset_id, user_id, company_name, credit_code, contact_person, contact_phone, margin_paid, margin_payment_proof, qualification_status)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'PENDING')`,
    [
      input.asset_id,
      input.user_id,
      input.company_name,
      input.credit_code,
      input.contact_person,
      input.contact_phone,
      input.margin_payment_proof || null,
    ],
  )
  return { ok: true, message: '报名已提交，请等待资格审核' }
}

export function updateBidderQualification(bidderId: number, status: 'APPROVED' | 'REJECTED', marginPaid = false) {
  run(
    `UPDATE hc_sys_bidders SET qualification_status = ?, margin_paid = ? WHERE id = ?`,
    [status, marginPaid ? 1 : 0, bidderId],
  )
}

export function getDashboardStats(): DashboardStats {
  const asset = getPrimaryAsset()
  const assetId = asset?.id ?? 0
  const highestBid = assetId ? getHighestBid(assetId) : 0
  const bidderCount =
    rowsFromExec<{ c: number }>(`SELECT COUNT(*) AS c FROM hc_sys_bidders WHERE asset_id = ?`, [assetId])[0]?.c ?? 0
  const bidCount =
    rowsFromExec<{ c: number }>(`SELECT COUNT(*) AS c FROM hc_sys_bid_records WHERE asset_id = ?`, [assetId])[0]?.c ??
    0
  const approvedCount =
    rowsFromExec<{ c: number }>(
      `SELECT COUNT(*) AS c FROM hc_sys_bidders WHERE asset_id = ? AND qualification_status = 'APPROVED'`,
      [assetId],
    )[0]?.c ?? 0
  const pendingCount =
    rowsFromExec<{ c: number }>(
      `SELECT COUNT(*) AS c FROM hc_sys_bidders WHERE asset_id = ? AND qualification_status = 'PENDING'`,
      [assetId],
    )[0]?.c ?? 0

  const bidHistory = rowsFromExec<{ time: string; amount: number }>(
    `SELECT bid_time AS time, bid_amount AS amount
     FROM hc_sys_bid_records
     WHERE asset_id = ? AND status = 'VALID'
     ORDER BY bid_time ASC`,
    [assetId],
  )

  return {
    listingPrice: asset?.listing_price ?? 0,
    highestBid: highestBid || (asset?.listing_price ?? 0),
    bidderCount,
    bidCount,
    approvedCount,
    pendingCount,
    marginAmount: Number(getConfig('margin_amount') || 0),
    minIncrement: Number(getConfig('min_bid_increment') || 100),
    biddingEndTime: getConfig('bidding_end_time') || '',
    assetStatus: asset?.status || 'LISTING',
    projectNumber: asset?.project_number || '',
    assetTitle: asset?.title || '',
    bidHistory,
    notices: listNotices().slice(0, 3),
    unreadMessages:
      rowsFromExec<{ c: number }>(`SELECT COUNT(*) AS c FROM hc_sys_messages WHERE is_read = 0`)[0]?.c ?? 0,
  }
}

export function listUsers(): HcUser[] {
  return rowsFromExec<HcUser>(
    `SELECT id, username, role, company_name, full_name, created_at FROM hc_sys_users ORDER BY id`,
  )
}
