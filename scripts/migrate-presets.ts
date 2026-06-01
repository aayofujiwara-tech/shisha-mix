/**
 * Preset migration script — migrates 100 presets to Firebase RTDB
 *
 * BEFORE RUNNING:
 * 1. In Firebase Console → Realtime Database → Rules, temporarily set:
 *    { "rules": { ".read": true, ".write": true } }
 * 2. Fill in .env.local with real Firebase credentials
 * 3. Run: npm run migrate
 * 4. Restore rules from database.rules.json via Firebase Console or CLI
 */
import { presets } from '../src/data/presets'
import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dir, '../.env.local') })

const DATABASE_URL = process.env.VITE_FIREBASE_DATABASE_URL

if (!DATABASE_URL) {
  console.error('ERROR: VITE_FIREBASE_DATABASE_URL not found in .env.local')
  process.exit(1)
}

async function migrate() {
  console.log(`Migrating ${presets.length} presets → ${DATABASE_URL}/recipes/\n`)
  let ok = 0, ng = 0

  for (const preset of presets) {
    const url = `${DATABASE_URL}/recipes/${preset.id}.json`
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preset, isPreset: true }),
      })
      if (res.ok) { console.log(`  ✓ ${preset.id}: ${preset.name}`); ok++ }
      else { const e = await res.json(); console.error(`  ✗ ${preset.id}:`, e); ng++ }
    } catch (e) { console.error(`  ✗ ${preset.id}:`, e); ng++ }
  }

  console.log(`\nResult: ${ok} succeeded, ${ng} failed`)
  if (ng > 0) process.exit(1)
}

migrate()
