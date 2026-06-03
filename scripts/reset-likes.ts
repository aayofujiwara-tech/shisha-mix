/**
 * Reset all preset recipe like counts to 0 in Firebase RTDB.
 *
 * BEFORE RUNNING: Deploy open rules ONLY in a staging/dev project, never production:
 *   { "rules": { ".read": true, ".write": true } }
 * AFTER RUNNING: IMMEDIATELY restore rules: firebase deploy --only database
 *
 * Usage: npm run reset-likes
 */
import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { presets } from '../src/data/presets'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dir, '../.env.local') })

const DATABASE_URL = process.env.VITE_FIREBASE_DATABASE_URL
if (!DATABASE_URL) {
  console.error('ERROR: VITE_FIREBASE_DATABASE_URL not found in .env.local')
  process.exit(1)
}

const IDS = presets.map((p) => p.id)

async function resetLikes() {
  console.log(`Resetting likes for ${IDS.length} presets → ${DATABASE_URL}/recipes/\n`)
  let ok = 0, ng = 0

  for (const id of IDS) {
    const url = `${DATABASE_URL}/recipes/${id}/likes.json`
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '0',
      })
      if (res.ok) { console.log(`  ✓ ${id}`); ok++ }
      else { const e = await res.json(); console.error(`  ✗ ${id}:`, e); ng++ }
    } catch (e) {
      console.error(`  ✗ ${id}:`, e); ng++
    }
  }

  console.log(`\nResult: ${ok} succeeded, ${ng} failed`)
  if (ng > 0) process.exit(1)
}

resetLikes()
