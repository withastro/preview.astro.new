// @ts-check

import { base } from 'virtual:preview.astro.new/base';
import { parseHTML, HTMLAnchorElement, HTMLImageElement } from 'linkedom';

/** @param {string} url */
const isRelative = (url) => Boolean(url?.[0] === '/' && url?.[1] !== '/');
/** @param {string} url */
const isAstroAssetUrl = (url) => Boolean(url?.includes('/_astro/'));
/** @param {string} url */
const shouldPrefix = (url) => isRelative(url) && !isAstroAssetUrl(url);

/** @type {import("astro").MiddlewareHandler} */
export async function onRequest(request, next) {
	const response = await next();
	const html = await response.text();
	const { document } = parseHTML(html);

	// Add base to links.
	document.querySelectorAll('[href]').forEach((element) => {
		if (!(element instanceof HTMLAnchorElement)) return;
		if (shouldPrefix(element.href)) {
			element.href = base + element.href.slice(1);
		}
	});

	// Add base to image sources.
	document.querySelectorAll('[src]').forEach((element) => {
		if (!(element instanceof HTMLImageElement)) return;
		if (shouldPrefix(element.src) && !isAstroAssetUrl(element.src)) {
			element.src = base + element.src.slice(1);
		}
	});

	return new Response(document.toString(), response);
}
