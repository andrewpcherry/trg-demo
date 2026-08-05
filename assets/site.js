/* =========================================================
   TEXAS ROOF GUARDIANS · AI CONCEPT DEMO · shared engine
   Injects nav, footer, chat widget, review marquee.
   Runs scripted AI conversation scenes (labeled previews).
   ========================================================= */
(function () {
  var PAGE = window.PAGE || {};
  var PHONE = "830-228-6123";
  var TEL = "tel:8302286123";

  /* ---------- icons ---------- */
  function ic(d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' + (extra || '') + '>' + d + '</svg>';
  }
  var I = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'
  };

  /* ---------- nav ---------- */
  var links = [
    ["residential.html", "Residential"],
    ["commercial.html", "Commercial"],
    ["insurance-claims.html", "Claims"],
    ["storm-protection-plan.html", "Storm Plan"],
    ["solar.html", "Solar"],
    ["projects.html", "Projects"]
  ];
  var moreLinks = [
    ["guardian-care.html", "Guardian Commercial Care"],
    ["property-managers.html", "Property Managers"],
    ["hoa.html", "HOA Division"],
    ["financing.html", "Financing"],
    ["service-areas.html", "Service Areas"],
    ["about.html", "About"],
    ["faq.html", "FAQ"],
    ["contact.html", "Contact"]
  ];
  function navHtml() {
    var l = links.map(function (x) {
      var on = PAGE.key === x[0] ? ' class="on"' : '';
      return '<a href="' + x[0] + '"' + on + '>' + x[1] + '</a>';
    }).join('');
    return '<div class="topbar"><div class="wrap"><div class="tb-l">' +
      '<span>' + ic(I.shield) + ' Licensed &amp; Insured · TX</span>' +
      '<span>' + ic(I.star) + ' 5.0 on Google · 57 reviews</span>' +
      '<span>' + ic(I.bolt) + ' 24/7 Storm Response</span>' +
      '</div><a href="' + TEL + '">' + PHONE + '</a></div></div>' +
      '<nav class="nav"><div class="wrap"><div class="nav-pill">' +
      '<a class="nav-logo" href="index.html"><img src="assets/logo.png" alt="Texas Roof Guardians"></a>' +
      '<div class="navlinks">' + l + '</div>' +
      '<div class="nav-cta"><a class="nav-phone" href="' + TEL + '">' + ic(I.phone) + '<span>' + PHONE + '</span></a>' +
      '<a class="btn btn-red" href="contact.html">Free Inspection</a>' +
      '<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>' +
      '</div></div></div></nav>' +
      '<div class="mnav" id="mnav"><button class="mnav-x" id="mnavx" aria-label="Close">&times;</button>' +
      links.concat(moreLinks).map(function (x) { return '<a href="' + x[0] + '">' + x[1] + '</a>'; }).join('') +
      '<a class="btn btn-red" href="contact.html">Schedule Free Inspection</a></div>';
  }

  /* ---------- footer ---------- */
  function footHtml() {
    return '<footer><div class="wrap">' +
      '<div class="demo-tag"><b>Concept preview.</b> This page is a design and AI concept demo prepared by RequityAI for Texas Roof Guardians. Every conversation shown is a scripted illustration of how the AI team member handles real inquiries. Reviews shown are real Google reviews from the Texas Roof Guardians Business Profile (5.0, 57 reviews).</div>' +
      '<div class="f-grid">' +
      '<div><img src="assets/logo.png" alt="Texas Roof Guardians"><p>San Antonio’s roofing, storm damage and insurance claim specialists. Also serving Austin and all of Central Texas.</p></div>' +
      '<div><h4>Services</h4><ul><li><a href="residential.html">Residential Roofing</a></li><li><a href="commercial.html">Commercial Roofing</a></li><li><a href="insurance-claims.html">Insurance Claims</a></li><li><a href="storm-protection-plan.html">Storm Protection Plan</a></li><li><a href="financing.html">Roof Financing</a></li><li><a href="solar.html">Solar &amp; Energy</a></li></ul></div>' +
      '<div><h4>Company</h4><ul><li><a href="about.html">About</a></li><li><a href="projects.html">Projects</a></li><li><a href="service-areas.html">Service Areas</a></li><li><a href="hoa.html">HOA Division</a></li><li><a href="property-managers.html">Property Managers</a></li><li><a href="faq.html">FAQ</a></li></ul></div>' +
      '<div><h4>Contact</h4><ul><li><a href="' + TEL + '">' + PHONE + '</a></li><li>info@txroofguardians.com</li><li>San Antonio, TX</li><li>Serving Austin &amp; Central Texas</li><li>Mon to Sat 7am to 7pm · Emergency 24/7</li></ul></div>' +
      '</div><div class="f-bot"><span>&copy; 2026 Texas Roof Guardians. Licensed &amp; Insured in Texas.</span><span>Premium Roofing · Storm Restoration · Insurance Claim Specialists</span></div>' +
      '</div></footer>';
  }

  /* ---------- review marquee ---------- */
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z"/></svg>';
  var GICON = '<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  function renderMarquee() {
    var track = document.getElementById('revTrack');
    if (!track || !window.TRG_REVIEWS) return;
    var cards = window.TRG_REVIEWS.map(function (r) {
      return '<div class="rev-card"><div class="stars">' + STAR + STAR + STAR + STAR + STAR + '</div>' +
        '<p>&ldquo;' + r.t + '&rdquo;</p><div class="who"><b>' + r.n + '</b>' +
        '<span class="gtag">' + GICON + 'Google review</span></div></div>';
    }).join('');
    track.innerHTML = cards + cards;
  }

  /* ---------- chat widget ---------- */
  function chatHtml() {
    return '<button class="cw-btn" id="cwBtn" aria-label="Chat with us">' + ic(I.chat) + '<span class="cw-ping"></span></button>' +
      '<div class="cw" id="cw"><div class="cw-head"><div class="cw-ava"><img src="assets/logo.png" alt=""></div>' +
      '<div><b>Texas Roof Guardians</b><small><span class="dot"></span> AI team member · replies in seconds</small></div>' +
      '<button class="cw-x" id="cwX" aria-label="Close">&times;</button></div>' +
      '<div class="cw-body" id="cwBody"></div>' +
      '<div class="cw-note">Scripted preview of the Guardian AI concierge · available 24/7 in every language</div>' +
      '<div class="cw-foot"><div class="fake-in">Type a message&hellip;</div>' + ic(I.send) + '</div></div>';
  }

  var chatPlayed = false;
  function playChat() {
    if (chatPlayed) return;
    chatPlayed = true;
    var body = document.getElementById('cwBody');
    var script = PAGE.chat || [];
    var i = 0;
    var typing = document.createElement('div');
    typing.className = 'cw-typing';
    typing.innerHTML = '<i></i><i></i><i></i>';

    function scrollDown() { body.scrollTop = body.scrollHeight + 400; }
    function step() {
      if (i >= script.length) {
        var rp = document.createElement('button');
        rp.className = 'cw-replay';
        rp.textContent = 'Replay conversation';
        rp.onclick = function () { body.innerHTML = ''; chatPlayed = false; playChat(); };
        body.appendChild(rp);
        requestAnimationFrame(function () { rp.classList.add('in'); scrollDown(); });
        return;
      }
      var s = script[i++];
      if (s.ai !== undefined) {
        body.appendChild(typing);
        typing.classList.add('on');
        scrollDown();
        setTimeout(function () {
          typing.classList.remove('on');
          if (typing.parentNode) typing.parentNode.removeChild(typing);
          var m = document.createElement('div');
          m.className = 'cm ai';
          m.innerHTML = s.ai + (s.card ? '<div class="cm-card">' + ic(s.card.icon ? I[s.card.icon] : I.cal) + '<div><b>' + s.card.title + '</b><small>' + s.card.sub + '</small></div></div>' : '');
          body.appendChild(m);
          requestAnimationFrame(function () { m.classList.add('in'); scrollDown(); });
          setTimeout(step, s.d || 1400);
        }, s.t || 1100);
      } else if (s.user !== undefined) {
        setTimeout(function () {
          var m = document.createElement('div');
          m.className = 'cm user';
          m.textContent = s.user;
          body.appendChild(m);
          requestAnimationFrame(function () { m.classList.add('in'); scrollDown(); });
          setTimeout(step, s.d || 1200);
        }, s.t || 900);
      } else if (s.chips) {
        var c = document.createElement('div');
        c.className = 'chips';
        c.innerHTML = s.chips.map(function (x, j) { return '<span class="chip" data-j="' + j + '">' + x + '</span>'; }).join('');
        body.appendChild(c);
        requestAnimationFrame(function () { c.classList.add('in'); scrollDown(); });
        setTimeout(function () {
          var sel = c.querySelector('[data-j="' + (s.pick || 0) + '"]');
          if (sel) sel.classList.add('sel');
          setTimeout(step, 700);
        }, s.t || 1400);
      }
    }
    step();
  }

  function bindChat() {
    var cw = document.getElementById('cw');
    var btn = document.getElementById('cwBtn');
    var x = document.getElementById('cwX');
    function open() { cw.classList.add('open'); playChat(); }
    function close() { cw.classList.remove('open'); }
    btn.addEventListener('click', function () { cw.classList.contains('open') ? close() : open(); });
    x.addEventListener('click', close);
    if (window.innerWidth >= 980 && !sessionStorage.getItem('cwAuto-' + (PAGE.key || 'x'))) {
      setTimeout(function () {
        sessionStorage.setItem('cwAuto-' + (PAGE.key || 'x'), '1');
        open();
      }, PAGE.chatDelay || 6000);
    }
  }

  /* ---------- ambient toasts ---------- */
  function runToasts() {
    var host = document.getElementById('toasts');
    if (!host || !PAGE.toasts) return;
    var idx = 0, shown = [];
    function push() {
      var t = PAGE.toasts[idx % PAGE.toasts.length];
      idx++;
      var el = document.createElement('div');
      el.className = 'toast ' + (t.tone || '');
      el.innerHTML = '<div class="t-ic">' + ic(I[t.icon] || I.bolt) + '</div><div><b>' + t.title + '</b><small>' + t.sub + '</small></div>';
      host.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('show'); });
      shown.push(el);
      if (shown.length > 3) {
        var old = shown.shift();
        old.classList.remove('show');
        setTimeout(function () { old.remove(); }, 600);
      }
    }
    setTimeout(push, 1800);
    setInterval(push, 4200);
  }

  /* ---------- SMS scene animator ---------- */
  function runSms() {
    document.querySelectorAll('[data-sms]').forEach(function (holder) {
      var scriptEl = document.getElementById(holder.getAttribute('data-sms'));
      if (!scriptEl) return;
      var steps = JSON.parse(scriptEl.textContent);
      var played = false;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !played) { played = true; play(); io.disconnect(); }
        });
      }, { threshold: 0.35 });
      io.observe(holder);
      function play() {
        var i = 0;
        var typing = document.createElement('div');
        typing.className = 'sms-typing';
        typing.innerHTML = '<i></i><i></i><i></i>';
        function step() {
          if (i >= steps.length) return;
          var s = steps[i++];
          if (s.meta) {
            var m = document.createElement('div');
            m.className = 'sms-meta';
            m.textContent = s.meta;
            holder.appendChild(m);
            requestAnimationFrame(function () { m.classList.add('in'); holder.scrollTop = holder.scrollHeight; });
            setTimeout(step, s.d || 900);
            return;
          }
          var isUs = !!s.us;
          if (isUs) {
            holder.appendChild(typing);
            typing.classList.add('on');
            holder.scrollTop = holder.scrollHeight;
          }
          setTimeout(function () {
            if (isUs && typing.parentNode) { typing.classList.remove('on'); typing.parentNode.removeChild(typing); }
            var m = document.createElement('div');
            m.className = 'sms ' + (isUs ? 'us' : 'them') + (s.grn ? ' grn' : '');
            m.textContent = s.us || s.them;
            holder.appendChild(m);
            requestAnimationFrame(function () { m.classList.add('in'); holder.scrollTop = holder.scrollHeight; });
            setTimeout(step, s.d || 1500);
          }, isUs ? 1100 : 500);
        }
        step();
      }
    });
  }

  /* ---------- ops console ---------- */
  function runOps() {
    var stepsEl = document.querySelectorAll('.ops-step');
    if (!stepsEl.length) return;
    var wrap = document.querySelector('.ops-steps');
    var played = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !played) { played = true; go(); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(wrap);
    function go() {
      var i = 0;
      function next() {
        if (i > 0) {
          stepsEl[i - 1].classList.remove('live');
          stepsEl[i - 1].classList.add('done');
        }
        if (i >= stepsEl.length) return;
        stepsEl[i].classList.add('live');
        i++;
        setTimeout(next, 2600);
      }
      next();
    }
  }

  /* ---------- reveal + counters ---------- */
  function runReveal() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
    var bar = document.getElementById('missionBar');
    if (bar) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { bar.style.width = '7.9%'; io2.disconnect(); }
        });
      }, { threshold: 0.4 });
      io2.observe(bar);
    }
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertAdjacentHTML('afterbegin', navHtml());
    document.body.insertAdjacentHTML('beforeend', footHtml() + chatHtml());
    var b = document.getElementById('burger'), m = document.getElementById('mnav'), mx = document.getElementById('mnavx');
    if (b) b.addEventListener('click', function () { m.classList.add('open'); });
    if (mx) mx.addEventListener('click', function () { m.classList.remove('open'); });
    renderMarquee();
    bindChat();
    runToasts();
    runSms();
    runOps();
    runReveal();
  });
})();
