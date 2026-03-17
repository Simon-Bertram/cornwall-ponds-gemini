/**
 * Unit tests for the Astro/Alchemy web build output.
 * Verifies that the built Worker entrypoint exists and has the expected shape
 * (so Alchemy can bundle and deploy it). Run after `bun run build` (or deploy).
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const INFRA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const WEB_DIST_SERVER = join(INFRA_DIR, '../../apps/web/dist/server')

describe('web build output (Astro/Alchemy)', () => {
	it('dist/server/entry.mjs exists and exports default handler', () => {
		const entryPath = join(WEB_DIST_SERVER, 'entry.mjs')
		if (!existsSync(entryPath)) {
			expect.fail(
				`Missing ${entryPath}. Run "bun run build" (or deploy) from repo root to generate web dist.`
			)
		}
		const content = readFileSync(entryPath, 'utf-8')
		expect(content).toContain('export')
		expect(content).toContain('default')
		expect(content).toMatch(/worker-entry[\w.-]*\.mjs/)
	})

	it('dist/server/wrangler.json specifies entry.mjs as main', () => {
		const wranglerPath = join(WEB_DIST_SERVER, 'wrangler.json')
		if (!existsSync(wranglerPath)) {
			expect.fail(
				`Missing ${wranglerPath}. Run "bun run build" (or deploy) from repo root.`
			)
		}
		const json = JSON.parse(readFileSync(wranglerPath, 'utf-8'))
		expect(json.main).toBe('entry.mjs')
	})
})
