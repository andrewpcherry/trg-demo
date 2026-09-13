/* TRG campaign attribution and optional OpenAI Ads measurement. No private keys. */
(function () {
  'use strict';
  if (window.TRGMeasurement) return;
  // Activation requires the real account Pixel ID and advanced matching disabled.
  const OPENAI_ADS_PIXEL_ID = '';
  const ATTR_KEY = 'trg-campaign-v1';
  const CONSENT_KEY = 'trg-ads-consent-v1';
  const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_id'];
  const TTL = 30 * 60 * 1000;
  let attribution = {};
  let consent = 'denied';
  let initialized = false;
  let pageSent = false;
  const sent = new Set();
  const privacySignal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const safeURL = value => {
    try {
      const url = new URL(value);
      return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : '';
    } catch (_) { return ''; }
  };
  function validTags(value) {
    const tags = {};
    KEYS.forEach(key => {
      const item = value && value[key];
      // Campaign labels only. Reject free text, URLs, email addresses and long digit strings.
      if (typeof item === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(item) && !/\d{8,}/.test(item)) tags[key] = item;
    });
    return tags;
  }
  function validTouch(value) {
    if (!value || typeof value !== 'object') return null;
    const tags = validTags(value.tags);
    if (!Object.keys(tags).length) return null;
    return {tags, landing_page: safeURL(value.landing_page)};
  }
  try {
    const now = Date.now();
    try {
      const stored = JSON.parse(sessionStorage.getItem(ATTR_KEY));
      if (stored && Number.isFinite(stored.updated_at) && now >= stored.updated_at && now - stored.updated_at < TTL) {
        const first = validTouch(stored.first), last = validTouch(stored.last);
        if (first && last) attribution = {first, last};
      }
    } catch (_) {}
    const params = new URL(location.href).searchParams;
    const tags = validTags(Object.fromEntries(KEYS.map(key => [key, params.get(key)])));
    if (Object.keys(tags).length) {
      const touch = {tags, landing_page: safeURL(location.href)};
      attribution.first = attribution.first || touch;
      attribution.last = touch;
    }
    if (attribution.first) {
      attribution.updated_at = now;
      try { sessionStorage.setItem(ATTR_KEY, JSON.stringify(attribution)); } catch (_) {}
    }
  } catch (_) {}

  function allowed() { return !!OPENAI_ADS_PIXEL_ID && consent === 'granted' && !privacySignal(); }
  function initialize() {
    if (initialized || !allowed()) return;
    try {
      if (!window.oaiq) {
        const q = function () { q.q.push(arguments); };
        q.q = [];
        window.oaiq = q;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
        document.head.appendChild(script);
      }
      window.oaiq('consent', false);
      window.oaiq('init', {pixelId: OPENAI_ADS_PIXEL_ID});
      window.oaiq('consent', true);
      initialized = true;
    } catch (_) {}
  }
  function measure(name, type, id) {
    try {
      if (!allowed() || sent.has(id)) return;
      initialize();
      if (!initialized) return;
      window.oaiq('measure', name, {type}, {event_id: id, opt_out: true});
      sent.add(id);
    } catch (_) {}
  }
  function pageView() {
    if (pageSent || !allowed()) return;
    try {
      const id = crypto.randomUUID();
      measure('page_viewed', 'contents', id);
      pageSent = sent.has(id);
    } catch (_) {}
  }
  function setConsent(value) {
    consent = value === 'granted' && !privacySignal() ? 'granted' : 'denied';
    try { localStorage.setItem(CONSENT_KEY, consent); } catch (_) {}
    try { if (initialized) window.oaiq('consent', consent === 'granted'); } catch (_) {}
    pageView();
  }
  window.TRGMeasurement = {
    attribution: () => JSON.parse(JSON.stringify(attribution)),
    safeURL,
    // GHL intake acknowledgement: submitted enquiry only, never a booking.
    leadSubmitted: id => { if (typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) measure('lead_created', 'customer_action', id); },
    setConsent
  };
  function mountChoices() {
    if (!OPENAI_ADS_PIXEL_ID) return;
    let stored;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    consent = stored === 'granted' && !privacySignal() ? 'granted' : 'denied';
    const panel = document.createElement('section');
    panel.setAttribute('aria-label', 'Advertising measurement choices');
    panel.style.cssText = 'position:fixed;left:16px;bottom:60px;max-width:390px;max-height:65vh;overflow:auto;padding:20px;background:#fff;color:#172c3c;border:1px solid #aeb9c1;border-radius:8px;box-shadow:0 4px 24px #0003;z-index:99999;font:15px/1.5 Arial,sans-serif';
    const description = document.createElement('p');
    description.textContent = 'May we use OpenAI advertising measurement to understand which ads bring visitors and enquiries? This is optional and separate from text messaging consent. You can change your choice here at any time.';
    panel.appendChild(description);
    const privacy = document.createElement('a');
    privacy.href = '/privacy'; privacy.textContent = 'Privacy policy';
    panel.appendChild(privacy);
    const status = document.createElement('p');
    status.setAttribute('role', 'status'); panel.appendChild(status);
    const settings = document.createElement('button');
    settings.type = 'button'; settings.textContent = 'Privacy choices';
    settings.style.cssText = 'position:fixed;left:12px;bottom:12px;padding:10px;background:#fff;color:#172c3c;border:1px solid #aeb9c1;border-radius:6px;z-index:99998;font:14px Arial,sans-serif';
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin-top:12px';
    ['Allow', 'Decline'].forEach(label => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label;
      button.style.cssText = 'padding:10px 16px;background:#0d4d7b;color:white;border:0;border-radius:4px;font:inherit';
      button.addEventListener('click', () => { setConsent(label === 'Allow' ? 'granted' : 'denied'); panel.hidden = true; settings.focus(); });
      if (label === 'Allow') button.disabled = privacySignal();
      buttons.appendChild(button);
    });
    panel.appendChild(buttons);
    panel.hidden = stored === 'granted' || stored === 'denied' || privacySignal();
    settings.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      status.textContent = privacySignal() ? 'Your browser privacy signal disables advertising measurement.' : 'Advertising measurement is ' + (consent === 'granted' ? 'allowed.' : 'declined.');
      if (!panel.hidden) buttons.querySelector('button:not(:disabled)').focus();
    });
    document.body.appendChild(panel); document.body.appendChild(settings);
    window.addEventListener('storage', event => {
      if (event.key !== CONSENT_KEY && event.key !== null) return;
      consent = event.newValue === 'granted' && !privacySignal() ? 'granted' : 'denied';
      try { if (initialized) window.oaiq('consent', consent === 'granted'); } catch (_) {}
      pageView();
    });
    pageView();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountChoices, {once: true});
  else mountChoices();
})();
