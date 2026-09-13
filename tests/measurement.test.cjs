const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const {webcrypto} = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/measurement.js'), 'utf8');
function storage(map = new Map(), blocked = false) {
  return {getItem: k => {if (blocked) throw Error('blocked'); return map.get(k) || null;}, setItem: (k,v) => {if (blocked) throw Error('blocked'); map.set(k,v);}};
}
function boot(options = {}) {
  const scripts = [], listeners = {};
  function element(tag) {
    return {tag, children: [], style: {}, dataset: {}, setAttribute() {}, addEventListener() {}, focus() {},
      appendChild(child) {this.children.push(child); if (child.tag === 'script') scripts.push(child);},
      querySelector() {return {focus() {}};}};
  }
  const context = {
    URL, Set, Date, JSON, Object, Number, crypto: webcrypto,
    location: {href: options.url || 'https://go.txroofguardians.com/'},
    navigator: options.navigator || {},
    sessionStorage: storage(options.session, options.blocked), localStorage: storage(options.local, options.blocked),
    document: {head: element('head'), body: element('body'), readyState: 'complete', createElement: element},
    addEventListener: (name, callback) => {listeners[name] = callback;}
  };
  context.window = context;
  vm.createContext(context);
  const code = options.enabled ? source.replace("const OPENAI_ADS_PIXEL_ID = '';", "const OPENAI_ADS_PIXEL_ID = 'test-pixel';") : source;
  vm.runInContext(code, context);
  return {context, scripts, listeners, rerun: () => vm.runInContext(code, context), events: () => (context.oaiq?.q || []).map(args => Array.from(args)).filter(args => args[0] === 'measure')};
}
test('campaign attribution survives homepage to assessment and preserves first/last campaign', () => {
  const session = new Map();
  boot({session, url:'https://go.txroofguardians.com/?utm_source=chatgpt&utm_campaign=storm_response_sep_2026'});
  const next = boot({session, url:'https://go.txroofguardians.com/roof-assessment.html'});
  assert.equal(next.context.TRGMeasurement.attribution().last.tags.utm_source, 'chatgpt');
  const returning = boot({session, url:'https://go.txroofguardians.com/contact?utm_source=other&utm_campaign=second'});
  assert.equal(returning.context.TRGMeasurement.attribution().first.tags.utm_source, 'chatgpt');
  assert.equal(returning.context.TRGMeasurement.attribution().last.tags.utm_source, 'other');
});
test('rejects free text and identifying query values; stored URLs omit query and fragment', () => {
  const page = boot({url:'https://go.txroofguardians.com/?utm_source=chatgpt&utm_campaign=alice%40example.com&utm_content=8302286123&email=private%40example.com#secret'});
  const data = JSON.stringify(page.context.TRGMeasurement.attribution());
  assert.ok(data.includes('chatgpt')); assert.ok(!/alice|private|8302286123|secret/.test(data));
  assert.equal(page.context.TRGMeasurement.safeURL('javascript:alert(1)'), '');
});
test('expired attribution is not reused', () => {
  const touch = {tags:{utm_source:'old'},landing_page:'https://go.txroofguardians.com/'};
  const session = new Map([['trg-campaign-v1', JSON.stringify({first:touch,last:touch,updated_at:Date.now()-31*60*1000})]]);
  assert.equal(JSON.stringify(boot({session}).context.TRGMeasurement.attribution()), '{}');
});
test('blank Pixel ID sends no requests and shows no inactive consent UI', () => {
  const page = boot(); page.context.TRGMeasurement.setConsent('granted');
  page.context.TRGMeasurement.leadSubmitted(webcrypto.randomUUID());
  assert.equal(page.scripts.length,0); assert.equal(page.context.document.body.children.length,0);
});
test('measurement waits for separate consent; init once and no duplicate page or lead events', () => {
  const page = boot({enabled:true}); const id = webcrypto.randomUUID();
  page.context.TRGMeasurement.leadSubmitted(id);
  assert.equal(page.scripts.length,0);
  page.context.TRGMeasurement.setConsent('granted');
  page.rerun(); page.context.TRGMeasurement.setConsent('granted');
  page.context.TRGMeasurement.leadSubmitted(id); page.context.TRGMeasurement.leadSubmitted(id);
  assert.equal(page.scripts.length,1);
  assert.equal(page.events().map(e=>e[1]).join(','),'page_viewed,lead_created');
  assert.equal(page.context.oaiq.q.slice(0,3).map(a=>a[0]).join(','), 'consent,init,consent');
  page.events().forEach(e => {assert.equal(e[3].opt_out,true); assert.equal(Object.keys(e[2]).join(','),'type');});
});
test('declining and cross-tab withdrawal stop future events without replay', () => {
  const page = boot({enabled:true}); page.context.TRGMeasurement.setConsent('granted');
  page.context.TRGMeasurement.setConsent('denied'); page.context.TRGMeasurement.leadSubmitted(webcrypto.randomUUID());
  page.context.TRGMeasurement.setConsent('granted');
  assert.equal(page.events().length,1);
  page.listeners.storage({key:'trg-ads-consent-v1',newValue:'denied'});
  page.context.TRGMeasurement.leadSubmitted(webcrypto.randomUUID()); assert.equal(page.events().length,1);
});
test('GPC and Do Not Track override saved consent', () => {
  for(const navigator of [{globalPrivacyControl:true},{doNotTrack:'1'}]) {
    const local = new Map([['trg-ads-consent-v1','granted']]);
    const page = boot({enabled:true,navigator,local}); page.context.TRGMeasurement.setConsent('granted');
    assert.equal(page.scripts.length,0);
  }
});
test('blocked storage or broken SDK cannot throw into the enquiry flow', () => {
  const page = boot({enabled:true,blocked:true,url:'https://go.txroofguardians.com/?utm_source=chatgpt'});
  assert.equal(page.context.TRGMeasurement.attribution().last.tags.utm_source,'chatgpt');
  page.context.oaiq = () => {throw Error('SDK blocked');};
  assert.doesNotThrow(() => {page.context.TRGMeasurement.setConsent('granted');page.context.TRGMeasurement.leadSubmitted(webcrypto.randomUUID());});
});
