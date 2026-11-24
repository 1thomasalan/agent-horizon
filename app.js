/* Agent Horizon v1. Renders everything from data/agents.json. Plain JS, no build step. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var fdate = function (d) { var p = String(d).split('-'); return p.length < 3 ? d : (+p[2]) + ' ' + MON[+p[1] - 1] + ' ' + p[0]; };
  var fnum = function (v) { return (Math.round(v * 100) / 100).toString(); };
  var LABEL = { independent: 'Independent', maintainer: 'Maintainer board', self: 'Self-submitted', vendor: 'Vendor-reported' };
  var chip = function (k, title) { return '<span class="chip ' + esc(k) + '" title="' + esc(title || '') + '">' + esc(LABEL[k] || k) + '</span>'; };
  var link = function (url, inner, cls) { return '<a class="' + (cls || '') + '" href="' + esc(url) + '" target="_blank" rel="noopener" title="Source: ' + esc(url) + '">' + inner + '</a>'; };
  var host = function (u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'source'; } };

  function ring(pct, cls) {
    var r = 24, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
    return '<svg class="ring" viewBox="0 0 58 58" aria-hidden="true"><circle class="bg" cx="29" cy="29" r="' + r + '"/>' +
      '<circle class="fg ' + (cls || '') + '" cx="29" cy="29" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + c.toFixed(1) + '" data-off="' + off.toFixed(1) + '" transform="rotate(-90 29 29)"/></svg>';
  }

  function hero(d) {
    var h = d.hero, best = h.stats[0];
    var p = best.value / 100, R = 300, cx = 380, cy = 250;
    var ang = Math.PI * (1 - p), ex = cx + R * Math.cos(ang), ey = cy - R * Math.sin(ang);
    var svg = '<svg viewBox="0 -62 760 332" aria-hidden="true">' +
      '<path class="arcbg" d="M80 250 A300 300 0 0 1 680 250"/>' +
      '<path class="arcfg" id="arcfg" d="M80 250 A300 300 0 0 1 ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '"/>' +
      '<line class="base" x1="0" y1="250" x2="760" y2="250"/>' +
      '<circle class="pulse" cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="6"><animate attributeName="r" values="5;18;5" dur="4.5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="4.5s" repeatCount="indefinite"/></circle>' +
      '<circle class="dot" cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="4.5"/>' +
      '<circle class="dot" r="2.2" opacity=".85"><animateMotion dur="9s" repeatCount="indefinite" path="M0 250 L760 250"/><animate attributeName="opacity" values="0;.9;.9;0" dur="9s" repeatCount="indefinite"/></circle>' +
      '</svg>';
    var kp = h.stats.map(function (s, i) {
      var pct = s.unit === '%' ? s.value / 100 : s.value / (s.max || 16);
      var cls = s.invert ? 'warn' : (s.unit === 'h' ? 'dawn' : '');
      return '<div class="card kpi">' + ring(pct, cls) + '<div style="min-width:0"><div class="l">' + esc(s.label) + '</div>' +
        link(s.source, fnum(s.value) + '<small>' + esc(s.unit) + '</small>', 'v') +
        '<div class="s">' + esc(s.note) + ' · ' + esc(fdate(s.date)) + '</div></div></div>';
    }).join('');
    $('#now').innerHTML = '<h1>' + esc(h.headline) + '</h1>' +
      '<div class="horizon">' + svg + '<div class="bigwrap">' + link(best.source, fnum(best.value) + '<small>%</small>', 'big') +
      '<div class="bigsub">Best everyday-task pass rate · ShellBench</div></div></div>' +
      '<div class="kpis">' + kp + '</div>';
  }

  function boards(d) {
    var cards = d.scoreboard.map(function (b) {
      var max = b.unit === 'h' ? 16 : 100;
      var w = Math.min(100, b.score / max * 100);
      var hum = b.human != null ? '<span class="hum" style="left:' + (b.human / max * 100) + '%" title="Human baseline ' + b.human + '%"></span>' : '';
      return '<article class="card bd reveal">' +
        '<div class="hd"><div class="nm">' + esc(b.name) + '</div>' + chip(b.kind, b.kind_note) + '</div>' +
        '<div class="ts">' + esc(b.tests) + '</div>' +
        '<div class="row"><div class="ld">' + esc(b.leader) + '<small>' + esc(b.leader_detail) + '</small></div>' +
        link(b.source, fnum(b.score) + '<small>' + esc(b.unit) + '</small>', 'num') + '</div>' +
        '<div class="track"><span class="fill" data-w="' + w.toFixed(1) + '"></span>' + hum + '</div>' +
        '<div class="scale"><span>0</span><span>' + (b.human != null ? '<span style="color:var(--dawn)">| human ' + b.human + '%</span>' : '') + '</span><span>' + max + (b.unit === 'h' ? ' h' : '%') + '</span></div>' +
        '<div class="ru">Next: ' + esc(b.runner_up) + '</div>' +
        '<div class="kn">' + esc(b.kind_note) + '</div>' +
        '<div class="ft"><span>Snapshot ' + esc(fdate(b.snapshot)) + '</span><span>' + link(b.source, host(b.source) + ' ↗', 'src') +
        (b.board ? ' · ' + link(b.board, 'board ↗', 'src') : '') + '</span></div></article>';
    }).join('');
    $('#boards').innerHTML = '<div class="sh"><div><div class="lede">Scoreboard</div><h2>Who leads each agent benchmark</h2></div>' +
      '<div class="legend">' + chip('independent') + chip('maintainer') + chip('self') + chip('vendor') + '<span><span style="color:var(--dawn)">|</span> human baseline</span></div></div>' +
      '<div class="boards">' + cards + '</div>';
  }

  function hark(d) {
    var h = d.hark;
    var items = h.items.map(function (it, i) {
      var vis;
      if (it.compare != null) {
        vis = '<div class="pair"><span>' + esc(it.compare_label) + '</span><div class="bar"><span style="width:' + it.compare + '%"></span></div><span>' + fnum(it.compare) + '%</span>' +
          '<span>Now</span><div class="bar now"><span style="width:' + it.value + '%"></span></div><span>' + link(it.sources[0].url, fnum(it.value) + '%', '') + '</span></div>';
      } else {
        var pct = it.unit === '/10' ? it.value / 10 : it.value / 100;
        vis = ring(pct, it.kind === 'vendor' ? 'dawn' : '');
      }
      var big = link(it.sources[0].url, fnum(it.value) + '<small>' + esc(it.unit) + '</small>', 'num');
      return '<div class="card hk reveal"><div class="hd" style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div class="l">' + esc(it.label) + '</div>' + chip(it.kind, it.kind_note) + '</div>' +
        '<div class="vrow">' + (it.compare != null ? big : vis + big) + '</div>' + (it.compare != null ? vis : '') +
        '<div class="d">' + esc(it.detail) + '</div>' +
        '<div class="srcs">' + it.sources.map(function (s) { return link(s.url, esc(s.name) + ' ↗', 'src'); }).join('') + '</div></div>';
    }).join('');
    var notes = h.notes.map(function (n) { return '<div class="note"><i></i><span>' + esc(n.text) + ' ' + link(n.url, host(n.url) + ' ↗', 'src') + '</span></div>'; }).join('');
    $('#hark').innerHTML = '<div class="sh"><div><div class="lede">Where Hark stands</div><h2>Hark Handoff</h2></div><p>' + esc(h.headline) + '</p></div>' +
      '<div class="harkgrid">' + items + '</div><div class="card notes reveal">' + notes + '</div>';
  }

  function metrChart(m) {
    var nar = window.innerWidth < 600, W = nar ? 380 : 640, H = nar ? 300 : 300, L = 42, Rr = 10, T = 16, B = 30;
    var t0 = Date.parse('2023-01-01'), t1 = Date.parse('2026-07-01');
    var y0 = Math.log10(0.05), y1 = Math.log10(24);
    var X = function (d) { return L + (Date.parse(d) - t0) / (t1 - t0) * (W - L - Rr); };
    var Y = function (h) { return T + (1 - (Math.log10(h) - y0) / (y1 - y0)) * (H - T - B); };
    var g = '';
    [[0.0833, '5 min'], [0.25, '15 min'], [1, '1 h'], [4, '4 h'], [16, '16 h']].forEach(function (t) {
      g += '<line class="gl" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(t[0]).toFixed(1) + '" y2="' + Y(t[0]).toFixed(1) + '"/><text x="' + (L - 6) + '" y="' + (Y(t[0]) + 3).toFixed(1) + '" text-anchor="end">' + t[1] + '</text>';
    });
    ['2023', '2024', '2025', '2026'].forEach(function (y) { g += '<text x="' + X(y + '-01-01').toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle">' + y + '</text>'; });
    g += '<line class="lim" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(16).toFixed(1) + '" y2="' + Y(16).toFixed(1) + '"/>';
    var pts = m.points.filter(function (p) { return !p.flag; });
    var path = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.date).toFixed(1) + ' ' + Y(p.hours).toFixed(1); }).join(' ');
    var len = 2000;
    g += '<path class="ln" d="' + path + '" stroke-dasharray="' + len + '" stroke-dashoffset="' + len + '" id="metrline"/>';
    var show = { 'GPT-4': [8, -8, 'start'], 'o3': [10, 14, 'start'], 'GPT-5': [10, 14, 'start'], 'Claude Opus 4.6': [-10, 4, 'end'], 'Claude Mythos Preview (early)': [-10, -8, 'end'], 'Claude 3.5 Sonnet (new)': [10, 12, 'start'] };
    m.points.forEach(function (p) {
      var x = X(p.date), y = Y(p.hours), hrs = p.hours < 1 ? Math.round(p.hours * 60) + ' min' : fnum(p.hours) + ' h';
      g += '<a href="' + esc(m.source) + '" target="_blank" rel="noopener"><title>' + esc(p.model + ': ' + hrs + ' (' + p.date + ')' + (p.flag ? ' - ' + p.flag : '')) + '</title><circle class="pt' + (p.flag ? ' flag' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5"/></a>';
      var o = show[p.model];
      if (o) {
        g += '<text class="lbl" x="' + (x + o[0]).toFixed(1) + '" y="' + (y + o[1]).toFixed(1) + '" text-anchor="' + o[2] + '">' + esc(p.model.replace(' (early)', '*').replace(' (new)', '')) + ' · ' + hrs + '</text>';
      }
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="METR time horizon by model release date, log scale">' + g + '</svg>';
  }

  function timeline(items) {
    var names = { hermes: 'Hermes Agent', hark: 'Hark Handoff', bench: 'Benchmark' };
    return '<ol class="tlv">' + items.map(function (e) {
      return '<li class="' + esc(e.group) + '"><a href="' + esc(e.source) + '" target="_blank" rel="noopener"><span class="td">' + esc(fdate(e.date)) + '</span>' +
        '<span class="tt">' + esc(e.title) + '</span><span class="tn">' + esc(e.note) + '</span></a></li>';
    }).join('') + '</ol>';
  }

  function progress(d) {
    var p = d.progress, m = p.metr;
    var climbs = p.climbs.map(function (c) {
      var a = c.from.value, b = c.to.value;
      return '<div class="cl"><div class="t"><b>' + esc(c.name) + '</b>' + (c.kind ? chip(c.kind) : '') +
        '<span>' + link(c.source, fnum(a) + '% → ' + fnum(b) + '%', '') + '</span></div>' +
        '<div class="db"><div class="rail"></div><div class="span" style="left:' + a + '%;width:' + (b - a) + '%"></div>' +
        (c.human != null ? '<div class="h" style="left:' + c.human + '%" title="Human ' + c.human + '%"></div>' : '') +
        '<div class="a" style="left:' + a + '%"></div><div class="b" style="left:' + b + '%"></div></div>' +
        '<div class="s"><span>' + esc(c.from.label) + '</span><span style="text-align:right">' + esc(c.to.label) + '</span></div></div>';
    }).join('');
    var hc = p.hermes_cadence;
    $('#progress').innerHTML = '<div class="sh"><div><div class="lede">Progress</div><h2>How fast the frontier is moving</h2></div>' +
      '<p>Task length agents can finish doubles about every ' + link(m.source, Math.round(m.doubling_days) + ' days', '') + ' (METR, since 2023).</p></div>' +
      '<div class="prog"><div class="card chart reveal"><div class="sh" style="margin-bottom:6px"><div class="kn">' + esc(m.title) + ' · log scale · dashed = 16 h reliability limit</div>' + link(m.page, 'metr.org ↗', 'src') + '</div>' + metrChart(m) + '</div>' +
      '<div class="card climb reveal"><div class="kn">First published score → latest, on the same benchmark. <span style="color:var(--dawn)">|</span> human baseline.</div>' + climbs + '</div></div>' +
      '<div class="card tl reveal"><div class="sh" style="margin-bottom:0"><div class="kn">2026 milestones · Hermes Agent shipped ' + link(hc.source, hc.stable_releases + ' stable releases', '') + ' from ' + esc(hc.from) + ' to ' + esc(hc.to) + '</div></div>' +
      timeline(p.timeline) +
      '<div class="tlk"><span><i style="background:var(--ind)"></i>Hermes Agent</span><span><i style="background:var(--sig)"></i>Hark Handoff</span><span><i style="background:var(--dawn)"></i>Benchmarks</span><span>Tap an item for its source</span></div></div>';
  }

  function harness(d) {
    var h = d.harness, lo = 40, hi = 46;
    var rows = h.rows.map(function (r) {
      var w = (r.score - lo) / (hi - lo) * 100;
      return '<div class="hr"><div>' + esc(r.name) + '<small>' + (r.open ? 'open source' : 'proprietary') + (r.minutes ? ' · ' + r.minutes + ' min/run' : '') + '</small></div>' +
        '<div class="bar' + (r.open ? '' : ' prop') + '"><span style="width:' + w.toFixed(1) + '%"></span></div>' + link(h.source, fnum(r.score) + '%', '') + '</div>';
    }).join('');
    $('#harness').innerHTML = '<div class="sh"><div><div class="lede">Harness compare</div><h2>' + esc(h.title) + '</h2></div></div>' +
      '<div class="card reveal">' + rows + '<div class="axis"><span></span><span><span>40%</span><span>43%</span><span>46%</span></span><span></span></div>' +
      '<div class="kn" style="margin-top:10px">' + esc(h.note) + ' Axis starts at 40% to show the gap. ' + link(h.source, 'ShellBench, ' + fdate(h.date) + ' ↗', 'src') + '</div></div>';
  }

  function news(d) {
    var rows = d.news.map(function (n) {
      var p = n.date.split('-');
      return '<a class="nw" href="' + esc(n.url) + '" target="_blank" rel="noopener"><div class="dt"><b>' + (+p[2]) + '</b><span>' + MON[+p[1] - 1] + '</span></div>' +
        '<div><div class="tt">' + esc(n.title) + '</div><div class="sn">' + esc(n.source_name) + ' ↗</div></div></a>';
    }).join('');
    $('#news').innerHTML = '<div class="sh"><div><div class="lede">Last two weeks</div><h2>Agent news</h2></div></div><div class="card reveal">' + rows + '</div>';
  }

  function foot(d) {
    var s = d.sources.map(function (x) { return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.name) + '</a> <span>· read ' + esc(x.read) + '</span></li>'; }).join('');
    $('#foot').innerHTML = '<div class="card"><h3>Method</h3><div>' + esc(d.meta.method) + '</div>' +
      '<div style="margin-top:6px">Last updated <b>' + esc(fdate(d.meta.updated)) + '</b> (JST). Data lives in <code>data/agents.json</code>.</div>' +
      '<h3 style="margin-top:16px">Sources</h3><ol>' + s + '</ol></div>';
    $('#updated').textContent = 'Updated ' + fdate(d.meta.updated);
  }

  function animate() {
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('.fill').forEach(function (f) { f.style.width = f.dataset.w + '%'; });
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' }) : null;
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (io) io.observe(el); else { el.classList.add('in'); el.querySelectorAll('.fill').forEach(function (f) { f.style.width = f.dataset.w + '%'; }); }
    });
    requestAnimationFrame(function () {
      document.querySelectorAll('.ring .fg').forEach(function (c) { c.style.strokeDashoffset = c.dataset.off; });
      var ml = document.getElementById('metrline');
      if (ml) { ml.style.transition = 'stroke-dashoffset 2.4s ease'; ml.style.strokeDashoffset = '0'; }
    });
  }

  function dock() {
    var links = document.querySelectorAll('.dock a');
    var secs = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
    var on = function () {
      var y = window.scrollY + window.innerHeight * 0.35, idx = 0;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= y) idx = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
    };
    window.addEventListener('scroll', on, { passive: true }); on();
  }

  function theme() {
    var b = $('#theme');
    b.addEventListener('click', function () {
      var cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      var nx = cur === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = nx;
      try { localStorage.setItem('ah-theme', nx); } catch (e) {}
    });
  }

  function render(d) {
    hero(d); boards(d); hark(d); progress(d); harness(d); news(d); foot(d);
    animate(); dock();
  }

  theme();
  fetch('data/agents.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(render).catch(function (e) {
    $('#now').innerHTML = '<h1>Could not load data/agents.json</h1><p style="color:var(--mut)">' + esc(e.message) + '</p>';
  });
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');
})();
