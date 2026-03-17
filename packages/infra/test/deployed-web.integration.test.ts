/**
 * Integration tests for the deployed web and server Workers.
 * Run after deploy; uses the live URLs directly.
 *
 * Use case: Verify that the frontend URL serves the Astro app (not a stub 404)
 * and that the API URL responds as expected.
 */
import { describe, expect, it } from 'vitest'

// Hardcode the live URLs we want to test
const WEB_URL = 'https://cornwall-ponds-gemini-web-node.simonbertram.workers.dev'
const SERVER_URL = 'https://cornwall-ponds-gemini-server-node.simonbertram.workers.dev'

describe('deployed web Worker (Astro frontend)', () => {
	it('returns 200 and Astro homepage content', async () => {
		const res = await fetch(WEB_URL, { redirect: 'follow' })
		expect(res.status).toBe(200)
		const body = await res.text()
		expect(body).toContain('Cornwall Ponds')
		expect(body).not.toBe('Not Found')
	})
})

describe('deployed server Worker (Hono API)', () => {
	it('returns 200 and ok', async () => {
		const res = await fetch(SERVER_URL, { redirect: 'follow' })
		expect(res.status).toBe(200)
		const body = await res.text()
		expect(body.trim().toLowerCase()).toBe('ok')
	})
})
