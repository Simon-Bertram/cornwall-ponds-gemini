/**
 * Integration tests for the deployed web and server Workers.
 * Run after deploy; set INFRA_WEB_URL and optionally INFRA_SERVER_URL to the
 * URLs printed by "bun run deploy" (Web -> ... and Server -> ...).
 * Skipped when URLs are not set (e.g. in CI without deploy step).
 *
 * Use case: Verify that the frontend URL serves the Astro app (not a stub 404)
 * and that the API URL responds as expected.
 */
import { describe, expect, it } from 'vitest'

const WEB_URL = process.env.INFRA_WEB_URL
const SERVER_URL = process.env.INFRA_SERVER_URL

describe.skipIf(!WEB_URL)(
	'deployed web Worker (Astro frontend)',
	() => {
		it('returns 200 and Astro homepage content', async () => {
			const res = await fetch(WEB_URL!, { redirect: 'follow' })
			expect(res.status).toBe(200)
			const body = await res.text()
			expect(body).toContain('Cornwall Ponds')
			expect(body).not.toBe('Not Found')
		})
	}
)

describe.skipIf(!SERVER_URL)(
	'deployed server Worker (Hono API)',
	() => {
		it('returns 200 and ok', async () => {
			const res = await fetch(SERVER_URL!, { redirect: 'follow' })
			expect(res.status).toBe(200)
			const body = await res.text()
			expect(body.trim().toLowerCase()).toBe('ok')
		})
	}
)
