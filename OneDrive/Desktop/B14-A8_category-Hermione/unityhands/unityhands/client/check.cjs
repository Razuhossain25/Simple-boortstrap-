const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const bundle = require('next/dist/compiled/babel/bundle');
function load(file, imports = {}) {
  const { code } = bundle.core().transformSync(fs.readFileSync(path.join(__dirname, file), 'utf8'), { configFile: false, babelrc: false, plugins: [bundle.pluginTransformModulesCommonjs()] });
  const context = { URL, exports: {}, require: (name) => { if (!(name in imports)) throw new Error(`Unexpected import: ${name}`); return imports[name]; } };
  vm.runInNewContext(code, context); return context.exports;
}
test('all client sources parse', () => {
  const parser = bundle.parser(); let count = 0;
  function scan(dir) { for (const f of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, f.name); if (f.isDirectory()) scan(p); else if (/\.(js|jsx)$/.test(p)) { parser.parse(fs.readFileSync(p, 'utf8'), { sourceType: 'unambiguous', plugins: ['jsx'] }); count++; } } }
  for (const dir of ['app', 'components', 'lib']) scan(path.join(__dirname, dir)); assert.ok(count >= 28);
});
test('forms reject invalid dates, image URLs and missing fields', () => {
  const constants = load('lib/constants.js'); const { validateEvent, isDate, isUrl } = load('lib/validate.js', { './constants': constants });
  const good = { title: 'Park cleanup', description: 'Help neighbours clean the park and sort waste.', eventType: 'Cleanup', location: 'Mirpur, Dhaka', thumbnail: 'https://example.com/photo.jpg', eventDate: '2099-12-01' };
  assert.equal(Object.keys(validateEvent(good)).length, 0);
  for (const eventDate of ['2020-01-01', '2099-02-30', '2099-13-01', '2099-2-01', 'tomorrow', '']) assert.ok(validateEvent({ ...good, eventDate }).eventDate);
  for (const value of ['javascript:alert(1)', 'data:image/png;base64,a', 'ftp://example.com/image', 'broken']) { assert.equal(isUrl(value), false); assert.ok(validateEvent({ ...good, thumbnail: value }).thumbnail); }
  assert.equal(isDate('2028-02-29'), true); assert.equal(isDate('2027-02-29'), false);
  for (const key of Object.keys(good)) assert.ok(Object.keys(validateEvent({ ...good, [key]: '' })).length);
});
test('login redirects remain local', () => {
  const { safeNext } = load('lib/safe-next.js');
  for (const value of ['https://example.com', '//example.com', '/\\example.com', '/\n/example.com', null, 123]) assert.equal(safeNext(value), '/');
  assert.equal(safeNext('/events/123'), '/events/123');
});
test('server registration requires six characters, uppercase and lowercase', async () => {
  const source = fs.readFileSync(path.join(__dirname, 'lib/auth.js'), 'utf8');
  const match = source.match(/before: createAuthMiddleware\((async \(ctx\) => \{[\s\S]*?)\n    \}\),/); assert.ok(match);
  const before = vm.runInNewContext('(' + match[1] + '\n})', { APIError: class extends Error {} });
  await before({ path: '/sign-up/email', body: { password: 'Abcdef' } });
  for (const password of ['abcdef1', 'ABCDEF1', 'Abc', '123456', null]) await assert.rejects(before({ path: '/sign-up/email', body: { password } }));
});
