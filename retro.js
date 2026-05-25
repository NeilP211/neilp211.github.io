/* ===================================================================
   retro.js - the bits that have to actually run in a 2026 browser.
   - a cheesy "MIDI" chiptune synthesized live with Web Audio
   - a localStorage hit counter
   - a localStorage guestbook
   - a scrolling fake status bar
   No external libraries.
   =================================================================== */

/* ---------- fake MIDI: a square-wave chiptune loop ---------------- */
(function () {
  var actx = null;
  var playing = false;
  var timer = null;
  var step = 0;

  // note frequencies (Hz)
  var N = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
    A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
    G5: 783.99, A5: 880.00, R: 0
  };
  // a chirpy original loop (lead) and a simple bass walk
  var lead = [
    N.C5, N.E5, N.G5, N.E5, N.C5, N.E5, N.G5, N.A5,
    N.G5, N.E5, N.C5, N.E5, N.D5, N.B4, N.C5, N.R
  ];
  var bass = [
    N.C4, N.R, N.G4, N.R, N.A4, N.R, N.E4, N.R,
    N.F4, N.R, N.C4, N.R, N.G4, N.R, N.G4, N.R
  ];
  var TEMPO = 165; // ms per step

  function blip(freq, type, vol, dur) {
    if (!freq) { return; }
    var osc = actx.createOscillator();
    var gain = actx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    var now = actx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function tick() {
    blip(lead[step % lead.length], "square", 0.12, TEMPO / 1000 * 0.9);
    blip(bass[step % bass.length], "triangle", 0.16, TEMPO / 1000 * 0.9);
    step += 1;
    timer = setTimeout(tick, TEMPO);
  }

  function toggle(btn) {
    if (!playing) {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        actx = new AC();
      }
      if (actx.state === "suspended") { actx.resume(); }
      playing = true;
      btn.textContent = "[] STOP MIDI";
      tick();
    } else {
      playing = false;
      clearTimeout(timer);
      btn.textContent = "|> PLAY MIDI";
    }
  }

  window.toggleMidi = function (btn) { toggle(btn); };
})();

/* ---------- hit counter (localStorage) ---------------------------- */
function renderCounter(id, baseline) {
  var el = document.getElementById(id);
  if (!el) { return; }
  var key = "neil_hits";
  var n = parseInt(localStorage.getItem(key) || "0", 10);
  n += 1;
  localStorage.setItem(key, String(n));
  var total = baseline + n;
  var s = String(total);
  while (s.length < 8) { s = "0" + s; }
  var html = "";
  for (var i = 0; i < s.length; i++) { html += "<b>" + s[i] + "</b>"; }
  el.innerHTML = html;
  var v = document.getElementById("visitorno");
  if (v) { v.textContent = String(total); }
}

/* ---------- scrolling status bar ---------------------------------- */
function startStatusBar(id, msg) {
  var el = document.getElementById(id);
  if (!el) { return; }
  var pad = "        ";
  var text = pad + msg + pad;
  var pos = 0;
  setInterval(function () {
    el.textContent = text.substring(pos) + text.substring(0, pos);
    pos = (pos + 1) % text.length;
  }, 130);
}

/* ---------- guestbook (localStorage) ------------------------------ */
var GB_KEY = "neil_guestbook";

function seedGuestbook() {
  return [
    { who: "xX_Dr4gonSl4yer_Xx", url: "geocities.com/dragoncave",
      when: "02/14/1999", msg: "AWESOME site dude!!! how did u make the flames??? sign my gb back k thx" },
    { who: "WebmasterSteve", url: "",
      when: "07/22/1999", msg: "Cool homepage. Bookmarked it on my Netscape. Keep up the good work champ." },
    { who: "~*~SparklePony~*~", url: "angelfire.com/ponyz",
      when: "11/03/2000", msg: "i dont understand any of these projects but the spinning globe is so cute :)" },
    { who: "L33T_H4X0R_2001", url: "",
      when: "01/09/2001", msg: "raft from scratch with no library?? respect. added u to my webring." }
  ];
}

function loadGuestbook() {
  var raw = localStorage.getItem(GB_KEY);
  if (!raw) {
    var seed = seedGuestbook();
    localStorage.setItem(GB_KEY, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw); } catch (e) { return seedGuestbook(); }
}

function renderGuestbook(listId, countId) {
  var list = document.getElementById(listId);
  if (!list) { return; }
  var entries = loadGuestbook();
  var c = document.getElementById(countId);
  if (c) { c.textContent = String(entries.length); }
  var html = "";
  for (var i = entries.length - 1; i >= 0; i--) {
    var e = entries[i];
    var name = e.url
      ? '<a href="http://' + escapeHtml(e.url) + '" target="_blank" rel="noopener">' + escapeHtml(e.who) + "</a>"
      : escapeHtml(e.who);
    html += '<div class="gbentry">';
    html += '<div class="who">' + name + ' <span class="when">posted ' + escapeHtml(e.when) + "</span></div>";
    html += "<div>" + escapeHtml(e.msg) + "</div>";
    html += "</div>";
  }
  list.innerHTML = html;
}

function submitGuestbook(ev, formId, listId, countId) {
  ev.preventDefault();
  var form = document.getElementById(formId);
  var who = form.gb_name.value.trim() || "Anonymous Coward";
  var url = form.gb_url.value.trim();
  var msg = form.gb_msg.value.trim();
  if (!msg) { alert("Please write something in the guestbook!!!"); return false; }
  var entries = loadGuestbook();
  var now = new Date();
  var stamp = String(now.getMonth() + 1).padStart(2, "0") + "/" +
              String(now.getDate()).padStart(2, "0") + "/" + now.getFullYear();
  entries.push({ who: who, url: url, when: stamp, msg: msg });
  localStorage.setItem(GB_KEY, JSON.stringify(entries));
  form.reset();
  renderGuestbook(listId, countId);
  alert("Thanks for signing my guestbook!!! :)");
  return false;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------- last-updated stamp ------------------------------------ */
function stampUpdated(id) {
  var el = document.getElementById(id);
  if (el) { el.textContent = "Last updated: 05/25/2026"; }
}
