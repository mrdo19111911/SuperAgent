---
name: crawlee-html-integrity
description: HTML integrity scanning with Crawlee - broken links, missing images, console errors, meta tags, performance checks. Use when validating HTML structure, checking for 404s, dead links, missing assets, or site-wide crawling.
---

# Crawlee HTML Integrity Scanning

Automated HTML integrity checks using Crawlee for web scraping and validation.

## When to Use
- Scan entire site for broken links
- Detect missing images (404, broken src)
- Check for console errors across pages
- Validate meta tags and SEO elements
- Performance checks (page load time)

## Prerequisites
- Node.js 18+
- Crawlee installed: `npm install crawlee`

## Quick Start
```bash
npx crawlee create my-crawler
cd my-crawler
npm install
```

## Workflows

### 1. Basic Link Crawler
```typescript
import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, enqueueLinks }) {
        console.log(`Crawling: ${request.url}`);

        // Check for broken links
        const links = await page.$$eval('a', links =>
            links.map(link => ({ href: link.href, text: link.textContent }))
        );

        // Check for missing images
        const images = await page.$$eval('img', imgs =>
            imgs.map(img => ({ src: img.src, alt: img.alt }))
        );

        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error(`Console Error on ${request.url}: ${msg.text()}`);
            }
        });

        // Enqueue all same-domain links
        await enqueueLinks();
    },
    maxRequestsPerCrawl: 50,
});

await crawler.run(['https://your-app.com']);
```

### 2. Image Validation
```typescript
const imageErrors = [];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request }) {
        await page.route('**/*', (route) => {
            const req = route.request();
            if (req.resourceType() === 'image') {
                route.continue().catch(() => {
                    imageErrors.push({ url: request.url, image: req.url() });
                });
            } else {
                route.continue();
            }
        });

        await page.goto(request.url);
    },
});

await crawler.run(['https://your-app.com']);
console.log('Broken images:', imageErrors);
```

### 3. Console Error Collection
```typescript
const consoleErrors = [];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request }) {
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
                consoleErrors.push({
                    url: request.url,
                    type: msg.type(),
                    message: msg.text(),
                });
            }
        });

        page.on('pageerror', error => {
            consoleErrors.push({
                url: request.url,
                type: 'exception',
                message: error.message,
            });
        });

        await page.goto(request.url);
    },
});

await crawler.run(['https://your-app.com']);
console.log('Console errors:', consoleErrors);
```

## Best Practices
- Set `maxRequestsPerCrawl` to avoid infinite loops
- Use `maxConcurrency` to control parallel requests
- Filter URLs to stay within your domain
- Collect results in structured format for reporting
- Use request filtering to avoid external links

## Troubleshooting
| Issue | Solution |
|-------|----------|
| Crawler never stops | Set `maxRequestsPerCrawl` limit |
| Too slow | Increase `maxConcurrency` |
| Memory issues | Process results in batches |
| External links crawled | Filter URLs by domain |

## References
- [Crawlee Documentation](https://crawlee.dev/)
- [PlaywrightCrawler API](https://crawlee.dev/api/playwright-crawler)
