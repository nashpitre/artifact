// Run: npm install --no-save playwright && npx playwright install chromium
// Then: node tests/browser.mjs (or set PLAYWRIGHT_MODULE to its import URL).
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(import.meta.dirname, '..');
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    const path = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
    res.setHeader('Content-Type', ({'.js':'text/javascript','.html':'text/html','.css':'text/css'})[extname(path)] || 'text/plain');
    res.end(await readFile(path));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/examples/`);
  await page.evaluate(async () => {
    const {createArtifact} = await import('/src/artifact.js');
    window.subject = createArtifact(document.querySelector('#signal'));
  });
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>subject.pulse('jolt')),true,'visible content jolts');
  assert.ok(await page.locator('[data-ar-content-malfunction]').count()>0);
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-ar-content-malfunction]').count(),0,'pulse clears');
  assert.equal(await page.evaluate(()=>subject.pulse('tear')),true,'SVG tear applies');
  assert.ok(await page.locator('svg[id^="artifact-"]').count()>0);
  await page.evaluate(()=>subject.pause());
  assert.equal(await page.locator('[data-ar-content-malfunction]').count(),0,'pause clears active effect');
  assert.equal(await page.evaluate(()=>subject.pulse()),false,'paused pulse rejected');
  await page.evaluate(()=>subject.resume());
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>subject.pulse()),false,'reduced motion respected');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{document.querySelector('#signal p').setAttribute('data-artifact-ignore',''); subject.pulse('jolt');});
  assert.equal(await page.locator('[data-artifact-ignore][data-ar-content-malfunction]').count(),0,'opt out respected');
  await page.evaluate(()=>{const d=document.createElement('dialog');document.body.append(d);d.showModal();});
  assert.equal(await page.evaluate(()=>subject.pulse()),false,'modal blocks pulse');
  await page.evaluate(()=>{document.querySelector('dialog').remove();subject.destroy();subject.destroy();});
  assert.equal(await page.locator('svg[id^="artifact-"]').count(),0,'destroy removes owned SVG');
  assert.equal(await page.evaluate(()=>subject.pulse()),false,'destroyed instance cannot pulse');
  assert.deepEqual(errors,[],'no browser runtime errors');
  await page.screenshot({path:'/tmp/artifact-demo.png',fullPage:true});
  console.log('PASS: jolt, tear, cleanup, pause/resume, reduced motion, opt out, modal, idempotent destroy, no runtime errors.');
} finally { await browser.close(); await new Promise(r=>server.close(r)); }
