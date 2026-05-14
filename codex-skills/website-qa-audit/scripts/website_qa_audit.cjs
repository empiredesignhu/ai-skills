#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const site = arg("site");
if (!site) {
  console.error("Usage: website_qa_audit.cjs --site https://example.com [--out qa-output] [--max-pages 20]");
  process.exit(2);
}

const base = new URL(site).origin;
const startUrl = site.endsWith("/") ? site : `${site}/`;
const outDir = path.resolve(process.cwd(), arg("out", "qa-output"));
const maxPages = Number(arg("max-pages", "20"));

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

function slug(input) {
  return String(input).replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function settle(page) {
  try {
    await page.waitForLoadState("load", { timeout: 7000 });
  } catch {}
  await page.waitForTimeout(350);
}

async function discoverPages(browser) {
  const context = await browser.newContext({ viewport: viewports[0] });
  const page = await context.newPage();
  await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await settle(page);
  const links = await page.evaluate((base) => {
    const urls = new Set([location.href.split("#")[0]]);
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.href.split("#")[0];
      if (href.startsWith(base) && !href.includes("/wp-admin/") && !href.match(/\.(pdf|docx?|xlsx?|zip|jpg|png|webp|svg)$/i)) {
        urls.add(href);
      }
    });
    return Array.from(urls);
  }, base);
  await context.close();
  return links.slice(0, maxPages);
}

async function analyzePage(page, url, viewportName) {
  const consoleMessages = [];
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) consoleMessages.push({ type: msg.type(), text: msg.text().slice(0, 500) });
  });
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((error) => ({ error }));
  await settle(page);
  const status = typeof response.status === "function" ? response.status() : null;
  const data = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    document.querySelectorAll("body *").forEach((el) => {
      const style = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || style.display === "none" || style.visibility === "hidden") return;
      if (r.right > vw + 2 || r.left < -2) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          className: String(el.className || "").slice(0, 120),
          text: (el.innerText || el.getAttribute("alt") || "").replace(/\s+/g, " ").trim().slice(0, 140),
          rect: { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) },
        });
      }
    });
    const bodyText = document.body?.innerText || "";
    return {
      title: document.title,
      url: location.href,
      h1: Array.from(document.querySelectorAll("h1")).map((h) => h.innerText.trim()),
      horizontalOverflow: document.documentElement.scrollWidth > vw + 2,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: vw,
      overflowOffenders: offenders.slice(0, 20),
      brokenImages: Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
      emptyAltImages: Array.from(document.images).filter((img) => !img.alt && (img.width > 30 || img.height > 30)).map((img) => img.currentSrc || img.src).slice(0, 20),
      placeholderText: ["Lorem", "Mutasd be", "Add Your Heading", "Click edit"].filter((needle) => bodyText.includes(needle)),
      forms: Array.from(document.forms).map((form) => ({
        id: form.id,
        className: form.className,
        fields: Array.from(form.querySelectorAll("input, textarea, select, button")).map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: el.type || "",
          name: el.name || "",
          placeholder: el.getAttribute("placeholder") || "",
          required: el.hasAttribute("required"),
          ariaRequired: el.getAttribute("aria-required"),
          label: el.id ? (document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText || "") : "",
        })),
      })),
      links: Array.from(document.querySelectorAll("a[href]")).map((a) => ({
        text: (a.innerText || a.getAttribute("aria-label") || a.querySelector("img")?.alt || "").replace(/\s+/g, " ").trim().slice(0, 120),
        href: a.href,
        rawHref: a.getAttribute("href") || "",
      })),
    };
  });
  const screenshot = `${viewportName}-${slug(url)}.png`;
  await page.screenshot({ path: path.join(outDir, screenshot), fullPage: false }).catch(() => {});
  return { viewport: viewportName, url, status, screenshot, consoleMessages, data };
}

async function clickAudit(browser, url, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await settle(page);
  const controls = await page.evaluate(() => {
    const selectors = ["button", "[role='button']", "summary", ".elementor-tab-title", ".e-n-tab-title", ".dkt-filter-btn", ".esm-filter-btn", ".page-numbers", ".jet-filters-pagination__item"];
    let index = 0;
    return Array.from(document.querySelectorAll(selectors.join(","))).flatMap((el) => {
      if (el.matches("button[type='submit'], input[type='submit']")) return [];
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!r.width || !r.height || style.display === "none" || style.visibility === "hidden") return [];
      el.setAttribute("data-qa-control", String(index));
      return [{ index: index++, text: (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 120), tag: el.tagName.toLowerCase(), className: String(el.className || "").slice(0, 120) }];
    });
  });
  const results = [];
  for (const control of controls.slice(0, 40)) {
    const before = await page.locator("body").innerText().catch(() => "");
    try {
      await page.locator(`[data-qa-control="${control.index}"]`).click({ timeout: 4000 });
      await settle(page);
      const after = await page.locator("body").innerText().catch(() => "");
      results.push({ control, result: "clicked", changed: before !== after || page.url() !== url });
    } catch (error) {
      results.push({ control, result: "click-failed", error: error.message.split("\n")[0] });
    }
  }
  await context.close();
  return results;
}

async function linkStatuses(links) {
  const unique = Array.from(new Map(links.filter((l) => l.href.startsWith(base)).map((l) => [l.href.split("#")[0], l])).values());
  const out = [];
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const link = unique[cursor++];
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      try {
        let res = await fetch(link.href.split("#")[0], { method: "HEAD", redirect: "follow", signal: controller.signal });
        if ([403, 405].includes(res.status)) res = await fetch(link.href.split("#")[0], { method: "GET", redirect: "follow", signal: controller.signal });
        out.push({ text: link.text, url: link.href.split("#")[0], status: res.status, finalUrl: res.url });
      } catch (error) {
        out.push({ text: link.text, url: link.href.split("#")[0], error: error.message });
      } finally {
        clearTimeout(timer);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

async function perf(browser, url, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__qaVitals = { fcp: 0, lcp: 0, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (e.name === "first-contentful-paint") window.__qaVitals.fcp = e.startTime;
      }).observe({ type: "paint", buffered: true });
      new PerformanceObserver((list) => {
        const e = list.getEntries().at(-1);
        if (e) window.__qaVitals.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__qaVitals.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
  });
  const start = Date.now();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await settle(page);
  const data = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      elapsed: Date.now() - performance.timeOrigin,
      vitals: window.__qaVitals,
      domContentLoaded: nav?.domContentLoadedEventEnd || 0,
      loadEventEnd: nav?.loadEventEnd || 0,
      transferSize: (nav?.transferSize || 0) + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      resourceCount: resources.length,
      byType: resources.reduce((acc, r) => {
        const key = r.initiatorType || "other";
        acc[key] = (acc[key] || 0) + (r.transferSize || 0);
        return acc;
      }, {}),
    };
  });
  await context.close();
  return { url, viewport: viewport.name, wallTimeMs: Date.now() - start, ...data };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const pages = await discoverPages(browser);
  const report = { generatedAt: new Date().toISOString(), site: startUrl, pages, pageChecks: [], clickChecks: [], linkChecks: [], performance: [] };
  const allLinks = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const url of pages) {
      console.log(`check ${viewport.name} ${url}`);
      const check = await analyzePage(page, url, viewport.name);
      report.pageChecks.push(check);
      allLinks.push(...check.data.links);
    }
    await context.close();
  }

  report.linkChecks = await linkStatuses(allLinks);
  for (const url of pages.slice(0, 8)) {
    for (const viewport of [viewports[0], viewports[2]]) {
      console.log(`click ${viewport.name} ${url}`);
      report.clickChecks.push({ url, viewport: viewport.name, results: await clickAudit(browser, url, viewport) });
    }
  }
  for (const url of pages.slice(0, 4)) {
    for (const viewport of [viewports[0], viewports[2]]) {
      report.performance.push(await perf(browser, url, viewport));
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, "website-qa-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    pages: pages.length,
    pageChecks: report.pageChecks.length,
    links: report.linkChecks.length,
    clickGroups: report.clickChecks.length,
    performanceRuns: report.performance.length,
    report: path.join(outDir, "website-qa-report.json"),
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
