/* TRG native external-form intake. Public tracker only; no private API credentials. */
(function () {
  'use strict';
  const TRACKING_ID = 'tk_8f9dd5ab75ff4670812bf6dbb83cfb59';
  const ENDPOINT = 'https://backend.leadconnectorhq.com/external-tracking/events';
  let active = null;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (url, options) {
    let event;
    try { event = JSON.parse(options && options.body); } catch (_) {}
    const match = active && String(url) === ENDPOINT && event &&
      event.trackingId === TRACKING_ID && event.type === 'external_form_submission' && event.formId === active.form.id;
    const attempt = match ? active : null;
    try {
      const response = await originalFetch(url, options);
      if (attempt) {
        let body;
        try { body = await response.clone().json(); } catch (_) {}
        if (response.ok && body && body.status === 'ok') {
          clearTimeout(attempt.timer);
          attempt.setState('confirmed', 'Request received. This is not an appointment confirmation. For urgent help, call 830-228-6123.');
        }
      }
      return response;
    } catch (error) { throw error; }
  };
  function field(form, name, label, value) {
    let input = form.elements.namedItem(name);
    if (!input) {
      const holder = document.createElement('label');
      holder.className = 'full';
      holder.textContent = label;
      input = document.createElement('textarea');
      input.name = name; input.readOnly = true;
      input.style.cssText = 'display:block;width:100%;min-height:70px;box-sizing:border-box';
      holder.appendChild(input); form.appendChild(holder);
    }
    input.value = value;
    return input;
  }
  function enhance(form) {
    if (form.dataset.deliveryState) return;
    const assessment = form.matches('.lead-form');
    if (assessment) {
      form.id = 'trg-roof-assessment-enquiry';
      if (!form.elements.address) {
        const label = document.createElement('label');
        label.className = 'lf-field full'; label.textContent = 'Street Address';
        const address = document.createElement('input');
        address.name = 'address'; address.autocomplete = 'street-address';
        label.appendChild(address); form.insertBefore(label, form.firstChild);
      }
    }
    form.removeAttribute('onsubmit');
    form.dataset.deliveryState = 'idle';
    const button = form.querySelector('button');
    button.type = 'button';
    const status = document.createElement('p');
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    form.appendChild(status);
    let receiptKey = null;
    const setState = (state, text) => {
      form.dataset.deliveryState = state; status.textContent = text;
      if (receiptKey && ['confirmed', 'uncertain'].includes(state)) {
        try { sessionStorage.setItem(receiptKey, state); } catch (_) {}
      }
    };
    let allow = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!allow) { e.stopImmediatePropagation(); send(); }
    }, true);
    button.addEventListener('click', send);
    form.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.matches('input:not([type=checkbox])')) { e.preventDefault(); send(); }
    });
    async function send() {
      if (!['idle', 'not-sent'].includes(form.dataset.deliveryState)) return;
      const phone = form.elements.phone;
      phone.setCustomValidity(/^\+?[\d\s().-]+$/.test(phone.value) && phone.value.replace(/\D/g, '').length >= 10 && phone.value.replace(/\D/g, '').length <= 15 ? '' : 'Enter a valid phone number.');
      const zip = form.elements.zip;
      if (zip) zip.setCustomValidity(/^\d{5}(-\d{4})?$/.test(zip.value.trim()) ? '' : 'Enter a valid ZIP code.');
      if (!form.reportValidity()) return;
      setState('sending', 'Sending request…');
      const service = form.elements.sms_service_consent.checked;
      const marketing = form.elements.sms_marketing_consent.checked;
      const qualification = assessment ? JSON.parse(JSON.stringify(state)) : null;
      const request = assessment ? BRANCH_META[qualification.branch].title : form.elements.request_type.value;
      const entry = assessment ? 'Website roof assessment' : 'Website callback';
      let pageURL = location.href;
      let referrer = document.referrer;
      if (assessment) {
        try { pageURL = parent.location.href; } catch (_) {}
        try { referrer = parent.document.referrer; } catch (_) {}
      }
      field(form, 'message', 'Message', [
        'Texas Roof Guardians website enquiry',
        'Request: ' + request,
        qualification ? 'Branch: ' + qualification.branch + '\n' + qualification.answers.map(answer => answer.q + ': ' + answer.a).join('\n') : '',
        'Service SMS consent: ' + service,
        'Marketing SMS consent: ' + marketing,
        'Page: ' + pageURL,
        'Referrer: ' + referrer,
        'Disclosure version: trg-sms-2026-09-07'
      ].join('\n'));
      field(form, 'roofing_enquiry_type', 'Roofing Enquiry Type', request);
      field(form, 'website_entry_point', 'Website Entry Point', entry);
      field(form, 'service_sms_consent', 'Service SMS Consent', service ? 'Yes' : 'No');
      field(form, 'marketing_sms_consent', 'Marketing SMS Consent', marketing ? 'Yes' : 'No');
      field(form, 'consent_captured_at', 'Consent Captured At', new Date().toISOString());
      const canonical = JSON.stringify({form: form.id, name: form.elements.name.value.trim(), phone: form.elements.phone.value.replace(/\D/g, ''), email: form.elements.email ? form.elements.email.value.trim().toLowerCase() : '', address: form.elements.address.value.trim(), zip: form.elements.zip ? form.elements.zip.value.trim() : '', request, qualification, service, marketing});
      const controls = Array.from(form.elements).map(control => ({control, disabled: control.disabled, readOnly: control.readOnly}));
      const navBacks = Array.from((form.closest('.q-fade') || document).querySelectorAll('.q-back'));
      const navBackDisabled = navBacks.map(b => b.disabled);
      controls.forEach(({control}) => {
        if (control.matches('select,button,input[type=checkbox]')) control.disabled = true;
        else control.readOnly = true;
      });
      navBacks.forEach(b => { b.disabled = true; });
      active = {form, setState};
      const attempt = active;
      const ready = () => window._lcTracking && window._lcTracking.tracker && window._lcTracking.tracker.state.initialized;
      try {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
        receiptKey = 'trg-intake:' + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
        if (sessionStorage.getItem(receiptKey)) {
          active = null;
          setState('duplicate', 'This enquiry was already submitted or is awaiting confirmation in this browser session. Please call 830-228-6123 to check its status.');
          return;
        }
        if (!ready()) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://link.msgsndr.com/js/external-tracking.js';
            script.dataset.trackingId = TRACKING_ID;
            const end = (error) => { clearInterval(poll); clearTimeout(timer); script.onerror = null; error ? reject(error) : resolve(); };
            const poll = setInterval(() => { if (ready()) end(); }, 50);
            const timer = setTimeout(() => end(new Error('SDK timeout')), 6000);
            script.onerror = () => end(new Error('SDK unavailable'));
            document.body.appendChild(script);
          });
        }
      } catch (_) {
        active = null;
        controls.forEach(({control, disabled, readOnly}) => { control.disabled = disabled; control.readOnly = readOnly; });
        navBacks.forEach((b, i) => { b.disabled = navBackDisabled[i]; });
        setState('not-sent', 'Request not sent: the connection could not load. Please retry or call 830-228-6123.');
        return;
      }
      try { sessionStorage.setItem(receiptKey, 'pending'); } catch (_) {
        active = null;
        controls.forEach(({control, disabled, readOnly}) => { control.disabled = disabled; control.readOnly = readOnly; });
        navBacks.forEach((b, i) => { b.disabled = navBackDisabled[i]; });
        setState('not-sent', 'Request not sent: browser storage is unavailable. Please call 830-228-6123.');
        return;
      }
      attempt.timer = setTimeout(() => setState('uncertain', 'We could not confirm receipt. Your request may have arrived; please call 830-228-6123 before submitting again.'), 10000);
      allow = true;
      form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
      allow = false;
    }
  }
  window.TRGIntake = {enhance};
  document.querySelectorAll('#callbackForm').forEach(enhance);
})();
