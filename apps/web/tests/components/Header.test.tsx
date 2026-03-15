import { getContainerRenderer as preactContainerRenderer } from '@astrojs/preact'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { loadRenderers } from 'astro:container'
import { JSDOM } from 'jsdom'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import Header from '../../src/components/Header.astro'
import { navLinks } from '../../src/config/nav'

function parseHtml(html: string): Document {
	return new JSDOM(html).window.document
}

describe('Header', () => {
	let container: Awaited<ReturnType<typeof AstroContainer.create>>

	beforeAll(async () => {
		const renderers = await loadRenderers([preactContainerRenderer()])
		container = await AstroContainer.create({ renderers })
	})

	afterEach(() => {
		// no-op; JSDOM creates a new document per parse
	})

	function renderHeader(pathname = '/') {
		const url = `https://example.com${pathname}`
		return container.renderToString(Header, {
			request: new Request(url),
		})
	}

	it('renders logo and brand text', async () => {
		const html = await renderHeader()
		const doc = parseHtml(html)

		const header = doc.querySelector('header')
		expect(header).toBeTruthy()

		const logoLink = doc.querySelector('header a[href="/"]')
		expect(logoLink).toBeTruthy()
		expect(logoLink?.textContent).toContain('Cornwall Ponds')
		expect(logoLink?.textContent).toContain('Design & Build')
	})

	it('renders primary navigation links on desktop', async () => {
		const html = await renderHeader()
		const doc = parseHtml(html)

		const nav = doc.querySelector('nav[aria-label="Primary"]')
		expect(nav).toBeTruthy()

		const desktopNavWrapper = doc.querySelector(
			'.navbar-center.hidden.lg\\:flex'
		)
		expect(desktopNavWrapper).toBeTruthy()

		for (const link of navLinks) {
			const anchor = doc.querySelector(
				`nav[aria-label="Primary"] a[href="${link.href}"]`
			)
			expect(anchor).toBeTruthy()
			expect(anchor?.textContent?.trim()).toBe(link.label)
		}
	})

	it('shows mobile CTA buttons only on small screens', async () => {
		const html = await renderHeader()
		const doc = parseHtml(html)

		const mobileCtaWrapper = doc.querySelector('.lg\\:hidden')
		expect(mobileCtaWrapper).toBeTruthy()

		const loginLink = doc.querySelector('a[href="/login"]')
		const quoteLink = doc.querySelector('a[href="/contact"]')
		expect(loginLink).toBeTruthy()
		expect(quoteLink).toBeTruthy()

		const desktopNav = doc.querySelector(
			'.navbar-center.hidden.lg\\:flex'
		)
		expect(desktopNav?.className).toContain('hidden')
		expect(desktopNav?.className).toContain('lg:flex')
	})

	it('includes accessible landmarks and labels', async () => {
		const html = await renderHeader()
		const doc = parseHtml(html)

		const header = doc.querySelector('header')
		expect(header).toBeTruthy()

		const nav = doc.querySelector('nav[aria-label="Primary"]')
		expect(nav).toBeTruthy()
		expect(nav?.getAttribute('aria-label')).toBe('Primary')

		const phoneLink = doc.querySelector('a[href^="tel:"]')
		expect(phoneLink).toBeTruthy()
	})
})
