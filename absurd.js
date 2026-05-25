/* ===================================================================
   absurd.js - the maximum-1999 chaos engine.
   Cascading (but always dismissible) fake popups, a cursor sparkle
   trail, flying toasters, a bouncing logo, a desktop helper, a banner
   ad, and a scrolling browser title. No real window.open(); every
   "popup" is a draggable in-page div so nothing gets blocked or hijacks
   your browser. A master panic button stops it all.
   =================================================================== */
(function () {
  "use strict";

  var spawned = 0;       // total popups ever opened (hard cap = termination)
  var max = 6;
  var stopped = false;
  var zTop = 10000;
  var timers = [];
  var drag = null;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---- popup window plumbing ------------------------------------- */
  function place(p) {
    var pw = p.offsetWidth || 300;
    var ph = p.offsetHeight || 150;
    var x = rnd(8, Math.max(16, window.innerWidth - pw - 8));
    var y = rnd(8, Math.max(16, window.innerHeight - ph - 50));
    p.style.left = x + "px";
    p.style.top = y + "px";
  }
  function front(p) { zTop += 1; p.style.zIndex = zTop; }
  function closePop(p) {
    if (p && p.parentNode) { p.parentNode.removeChild(p); }
    if (!stopped && spawned < max && Math.random() < 0.55) {
      var t = setTimeout(openRandom, rnd(400, 1500));
      timers.push(t);
    }
  }
  function makePop(def) {
    var p = document.createElement("div");
    p.className = "pop";
    p.innerHTML =
      '<div class="pop-title"><span>' + def.title +
      '</span><button type="button" class="pop-x">X</button></div>' +
      '<div class="pop-body">' + def.body + "</div>";
    document.body.appendChild(p);
    place(p);
    front(p);
    p.querySelector(".pop-x").addEventListener("click", function () { closePop(p); });
    var bar = p.querySelector(".pop-title");
    bar.addEventListener("mousedown", function (e) { startDrag(p, e); });
    bar.addEventListener("touchstart", function (e) { startDrag(p, e.touches[0]); });
    p.addEventListener("mousedown", function () { front(p); });
    if (def.init) {
      def.init(p, { close: function () { closePop(p); }, body: p.querySelector(".pop-body") });
    }
    return p;
  }
  function openRandom() {
    if (stopped || spawned >= max) { return; }
    spawned += 1;
    makePop(POPUPS[Math.floor(Math.random() * POPUPS.length)]);
  }

  /* ---- dragging -------------------------------------------------- */
  function startDrag(p, pt) {
    front(p);
    var r = p.getBoundingClientRect();
    drag = { p: p, dx: pt.clientX - r.left, dy: pt.clientY - r.top };
  }
  function moveDrag(pt) {
    if (!drag) { return; }
    drag.p.style.left = (pt.clientX - drag.dx) + "px";
    drag.p.style.top = (pt.clientY - drag.dy) + "px";
  }
  document.addEventListener("mousemove", function (e) { moveDrag(e); });
  document.addEventListener("touchmove", function (e) {
    if (drag) { moveDrag(e.touches[0]); e.preventDefault(); }
  }, { passive: false });
  document.addEventListener("mouseup", function () { drag = null; });
  document.addEventListener("touchend", function () { drag = null; });

  /* ---- the popups themselves ------------------------------------- */
  function fillBar(p, api, done) {
    var bar = p.querySelector(".bar > i");
    var w = 0;
    var t = setInterval(function () {
      w += rnd(7, 17);
      bar.style.width = Math.min(100, w) + "%";
      if (w >= 100) { clearInterval(t); done(); }
    }, 170);
    timers.push(t);
  }
  function okClose(p, api) {
    var b = p.querySelector("[data-act=ok]");
    if (b) { b.onclick = api.close; }
  }

  var POPUPS = [
    {
      title: "!! CONGRATULATIONS !!",
      body: '<div style="text-align:center"><img src="assets/trophy.gif" width="36" height="44" alt="trophy"><br>' +
            '<b>You are the 1,000,000th visitor!</b><br>Claim your FREE iMac G3 now!<br>' +
            '<button type="button" data-act="claim">CLAIM PRIZE</button></div>',
      init: function (p, api) {
        p.querySelector("[data-act=claim]").onclick = function () {
          api.body.innerHTML = '<div style="text-align:center">Sorry, this prize expired in 2001.<br>' +
            "But thanks for visiting Neil's homepage :)<br><button type=\"button\" data-act=\"ok\">Aww, OK</button></div>";
          okClose(p, api);
        };
      }
    },
    {
      title: "Windows Security Alert",
      body: '<div><img src="assets/warning.gif" width="30" height="27" alt="!" style="float:left;margin:0 8px 4px 0">' +
            '<b>Your computer may be infected with 9 viruses!</b><br>Run a free scan immediately.' +
            '<div class="bar"><i></i></div><button type="button" data-act="scan">SCAN NOW</button> ' +
            '<button type="button" data-act="ignore">Ignore</button></div>',
      init: function (p, api) {
        p.querySelector("[data-act=ignore]").onclick = api.close;
        p.querySelector("[data-act=scan]").onclick = function () {
          fillBar(p, api, function () {
            api.body.innerHTML = "<div>Scan complete. Found: <b>0 viruses</b>.<br>" +
              "This is a webpage from 1999. You are fine. :)<br><button type=\"button\" data-act=\"ok\">Phew</button></div>";
            okClose(p, api);
          });
        };
      }
    },
    {
      title: "Low Memory",
      body: "<div>Your computer is dangerously low on RAM.<br>Would you like to <b>download more RAM</b>?<br>" +
            '<button type="button" data-act="yes">Yes</button> <button type="button" data-act="no">No</button></div>',
      init: function (p, api) {
        p.querySelector("[data-act=no]").onclick = api.close;
        p.querySelector("[data-act=yes]").onclick = function () {
          api.body.innerHTML = '<div>Downloading RAM...<div class="bar"><i></i></div></div>';
          fillBar(p, api, function () {
            api.body.innerHTML = "<div>16GB of RAM downloaded successfully!<br>" +
              "(You cannot download RAM. This was a joke.)<br><button type=\"button\" data-act=\"ok\">I knew that</button></div>";
            okClose(p, api);
          });
        };
      }
    },
    {
      title: "hot_singles.exe",
      body: '<div style="text-align:center">Hot singles in <b>Chapel Hill</b> want to meet you!<br>' +
            '<span class="blink" style="color:#cc0000;font-weight:bold">CLICK HERE NOW</span><br>' +
            '<button type="button" data-act="ok">Maybe later</button></div>',
      init: okClose
    },
    {
      title: "PUNCH THE MONKEY",
      body: '<div style="text-align:center;position:relative;height:64px">Punch the monkey and win $20!<br>' +
            '<button type="button" data-act="monkey" style="position:absolute;left:96px;top:30px">PUNCH</button></div>',
      init: function (p, api) {
        var b = p.querySelector("[data-act=monkey]");
        var dodges = 0;
        b.addEventListener("mouseover", function () {
          if (dodges < 5) { dodges += 1; b.style.left = rnd(4, 200) + "px"; b.style.top = rnd(2, 38) + "px"; }
        });
        b.addEventListener("click", function () {
          api.body.innerHTML = '<div style="text-align:center">You actually caught the monkey.<br>' +
            "The monkey concedes. There is no $20.<br><button type=\"button\" data-act=\"ok\">Worth it</button></div>";
          okClose(p, api);
        });
      }
    },
    {
      title: "Subscribe!",
      body: "<div>Join Neil's WebRing newsletter!<br>" +
            '<input type="text" placeholder="your@email.com" style="width:90%"><br>' +
            '<button type="button" data-act="sub">SUBSCRIBE</button></div>',
      init: function (p, api) {
        p.querySelector("[data-act=sub]").onclick = function () {
          api.body.innerHTML = "<div>Thanks for subscribing!<br>" +
            "(Nothing was sent anywhere. It is 1999 forever in here.)<br><button type=\"button\" data-act=\"ok\">Cool</button></div>";
          okClose(p, api);
        };
      }
    }
  ];

  /* ---- cursor sparkle trail -------------------------------------- */
  function cursorTrail() {
    var last = 0;
    var live = 0;
    document.addEventListener("mousemove", function (e) {
      var now = Date.now();
      if (now - last < 35 || live > 40) { return; }
      last = now;
      var s = document.createElement("div");
      s.className = "trail";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      live += 1;
      s.addEventListener("animationend", function () {
        if (s.parentNode) { s.parentNode.removeChild(s); }
        live -= 1;
      });
    });
  }

  /* ---- flying toasters ------------------------------------------- */
  function toasters(n) {
    for (var i = 0; i < n; i++) {
      var t = document.createElement("img");
      t.src = "assets/toaster.gif";
      t.className = "toaster";
      t.alt = "";
      t.style.top = rnd(8, 72) + "%";
      t.style.animation = "flyacross " + rnd(9, 16).toFixed(1) + "s linear " +
        (-rnd(0, 13)).toFixed(1) + "s infinite";
      document.body.appendChild(t);
    }
  }

  /* ---- bouncing screensaver logo --------------------------------- */
  function bouncer() {
    var b = document.createElement("div");
    b.className = "bouncer";
    b.textContent = "WWW";
    document.body.appendChild(b);
    var x = rnd(0, window.innerWidth - 70);
    var y = rnd(0, window.innerHeight - 50);
    var vx = 2.2;
    var vy = 1.8;
    var hue = 180;
    function tint(h) { return "hsl(" + h + ",100%,60%)"; }
    function step() {
      x += vx; y += vy;
      var w = b.offsetWidth;
      var h = b.offsetHeight;
      var hit = false;
      if (x <= 0) { x = 0; vx = -vx; hit = true; }
      if (x >= window.innerWidth - w) { x = window.innerWidth - w; vx = -vx; hit = true; }
      if (y <= 0) { y = 0; vy = -vy; hit = true; }
      if (y >= window.innerHeight - h) { y = window.innerHeight - h; vy = -vy; hit = true; }
      if (hit) { hue = (hue + 47) % 360; b.style.color = tint(hue); b.style.borderColor = tint(hue); }
      b.style.left = x + "px";
      b.style.top = y + "px";
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- desktop helper -------------------------------------------- */
  function assistant() {
    var tips = [
      "It looks like you are reading a resume. Want me to make it BLINK?",
      "Psst. Sign the guestbook. I am watching.",
      "Fun fact: this site is 100% hand-coded in Notepad. (It is not.)",
      "You have 0 new messages. Check again? [No]",
      "Tip: turn ON the MIDI for the full 1999 experience.",
      "I have been online since 1999. Do not close the tab. Or do. I am not your boss."
    ];
    var a = document.createElement("div");
    a.className = "assistant";
    a.innerHTML = '<div class="bubble"><button type="button" class="x">x</button>' +
      '<span class="tip"></span></div>' +
      '<div class="guy"><div class="eye l"></div><div class="eye r"></div><div class="mouth"></div></div>';
    document.body.appendChild(a);
    var tip = a.querySelector(".tip");
    var i = 0;
    function show() { tip.textContent = tips[i % tips.length]; i += 1; }
    show();
    var iv = setInterval(show, 6000);
    timers.push(iv);
    a.querySelector(".x").onclick = function () {
      clearInterval(iv);
      if (a.parentNode) { a.parentNode.removeChild(a); }
    };
  }

  /* ---- flashing banner ad ---------------------------------------- */
  function banner() {
    var main = document.querySelector(".main");
    if (!main) { return; }
    var b = document.createElement("div");
    b.className = "bannerad";
    b.innerHTML = "&#9733; YOU ARE THE 1,000,000th VISITOR &#9733; CLICK HERE FOR A FREE iMAC &#9733;";
    main.insertBefore(b, main.firstChild);
    b.onclick = function () {
      if (stopped || spawned >= max) { return; }
      spawned += 1;
      makePop(POPUPS[0]);
    };
  }

  /* ---- master panic button --------------------------------------- */
  function killButton() {
    var k = document.createElement("button");
    k.type = "button";
    k.className = "killpops";
    k.textContent = "[X] CLOSE ALL POP-UPS";
    document.body.appendChild(k);
    k.onclick = function () {
      stopped = true;
      timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
      var ps = document.querySelectorAll(".pop");
      for (var i = 0; i < ps.length; i++) {
        if (ps[i].parentNode) { ps[i].parentNode.removeChild(ps[i]); }
      }
      k.textContent = "[X] ...fine, peace restored";
      setTimeout(function () { if (k.parentNode) { k.parentNode.removeChild(k); } }, 2500);
    };
  }

  /* ---- scrolling browser title ----------------------------------- */
  function titleScroller() {
    var base = "   *** WELCOME TO NEIL'S HOMEPAGE *** SIGN THE GUESTBOOK *** BEST VIEWED IN NETSCAPE 4.0 ***   ";
    var pos = 0;
    var iv = setInterval(function () {
      document.title = base.substring(pos) + base.substring(0, pos);
      pos = (pos + 1) % base.length;
    }, 250);
    timers.push(iv);
  }

  /* ---- popup scheduler ------------------------------------------- */
  function startPopups() {
    function loop() {
      if (stopped || spawned >= max) { return; }
      openRandom();
      var t = setTimeout(loop, rnd(2600, 5200));
      timers.push(t);
    }
    var t0 = setTimeout(loop, 1600);
    timers.push(t0);
  }

  window.initAbsurdity = function (opts) {
    opts = opts || {};
    var small = window.innerWidth < 560;
    max = (opts.maxPopups != null) ? opts.maxPopups : 6;
    if (small) { max = Math.min(max, 3); }
    cursorTrail();
    titleScroller();
    if (!small && opts.assistant !== false) { assistant(); }
    if (opts.banner) { banner(); }
    toasters(small ? 1 : (opts.toasters != null ? opts.toasters : 2));
    bouncer();
    killButton();
    startPopups();
  };
})();
