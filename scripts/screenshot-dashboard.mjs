#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(fileURLToPath(import.meta.url), '..', '..')
const outPath = join(root, 'docs', 'assets', 'dashboard-preview.png')
mkdirSync(dirname(outPath), { recursive: true })

const port = 5181
const base = `http://127.0.0.1:${port}`

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
})

function waitReady() {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('preview timeout')), 60000)
    const onData = (buf) => {
      const s = buf.toString()
      if (s.includes('Local:') || s.includes(String(port))) {
        clearTimeout(t)
        preview.stdout.off('data', onData)
        resolve()
      }
    }
    preview.stdout.on('data', onData)
    preview.stderr.on('data', onData)
  })
}

try {
  await waitReady()
  await new Promise((r) => setTimeout(r, 800))

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${base}/login`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.fill('input[type="text"], input[autocomplete="username"]', 'admin')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: outPath, fullPage: false })
  await browser.close()
  console.log(`[screenshot] saved => ${outPath}`)
} finally {
  preview.kill('SIGTERM')
}
