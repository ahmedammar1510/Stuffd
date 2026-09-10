/* ============================================================
   STUFF'D — Consent & Tracking
   ------------------------------------------------------------
   Nothing is loaded until the visitor actively agrees.
   GA4 and the Meta Pixel are injected only after "Accept".
   Declining stores the choice and loads nothing at all.

   TO ACTIVATE:
     1. put your GA4 id below   (looks like  G-XXXXXXXXXX)
     2. put your Meta Pixel id  (15-16 digits)
     Leave a value empty and that service simply stays off.
   ============================================================ */

var STUFFD_GA4   = "";   //  e.g. "G-ABCD1234EF"
var STUFFD_PIXEL = "";   //  e.g. "123456789012345"

(function () {
  var KEY = "stuffd_consent_v1";

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  /* ---------- trackers (only ever called after consent) ---------- */

  function loadGA() {
    if (!STUFFD_GA4) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + STUFFD_GA4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", STUFFD_GA4, { anonymize_ip: true });
  }

  function loadPixel() {
    if (!STUFFD_PIXEL) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", STUFFD_PIXEL);
    window.fbq("track", "PageView");
  }

  function enable() { loadGA(); loadPixel(); }

  /* ---------- banner ---------- */

  function banner() {
    var wrap = document.createElement("div");
    wrap.className = "ck";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-label", "Cookie-Einstellungen");
    wrap.innerHTML =
      '<div class="ck-box">' +
        '<div class="ck-txt">' +
          '<b>Cookies &amp; Statistik</b>' +
          '<p>Wir nutzen optionale Cookies, um zu verstehen, wie unsere Seite genutzt wird, ' +
          'und um die Reichweite unserer Anzeigen zu messen. Ohne deine Zustimmung wird ' +
          'nichts davon geladen. Mehr dazu in der ' +
          '<a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
        '</div>' +
        '<div class="ck-btns">' +
          '<button type="button" class="ck-b ck-no">Ablehnen</button>' +
          '<button type="button" class="ck-b ck-yes">Akzeptieren</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    requestAnimationFrame(function () { wrap.classList.add("is-up"); });

    wrap.querySelector(".ck-yes").addEventListener("click", function () {
      write("granted"); enable(); close();
    });
    wrap.querySelector(".ck-no").addEventListener("click", function () {
      write("denied"); close();
    });
    function close() {
      wrap.classList.remove("is-up");
      setTimeout(function () { wrap.remove(); }, 320);
    }
  }

  function style() {
    var css = document.createElement("style");
    css.textContent =
      ".ck{position:fixed;left:0;right:0;bottom:0;z-index:120;padding:14px;" +
      "transform:translateY(120%);transition:transform .4s cubic-bezier(.22,1,.36,1)}" +
      ".ck.is-up{transform:none}" +
      ".ck-box{max-width:760px;margin:0 auto;background:#1B1613;color:#FBF8F1;" +
      "border:1px solid rgba(232,201,138,.28);border-radius:16px;padding:18px 20px;" +
      "box-shadow:0 18px 44px rgba(0,0,0,.45);display:flex;gap:18px;" +
      "align-items:center;flex-wrap:wrap;font-family:'Raleway',sans-serif}" +
      ".ck-txt{flex:1 1 320px;min-width:0}" +
      ".ck-txt b{display:block;font-family:'Baloo 2',sans-serif;font-weight:700;" +
      "font-size:15px;margin-bottom:4px}" +
      ".ck-txt p{font-size:12.5px;line-height:1.55;color:rgba(251,248,241,.7);margin:0}" +
      ".ck-txt a{color:#F7E0AE}" +
      ".ck-btns{display:flex;gap:9px;flex:0 0 auto}" +
      ".ck-b{font-family:'Raleway',sans-serif;font-weight:700;font-size:13px;" +
      "padding:11px 20px;border-radius:100px;cursor:pointer;border:1px solid transparent;" +
      "transition:all .25s cubic-bezier(.22,1,.36,1)}" +
      ".ck-no{background:transparent;color:rgba(251,248,241,.8);" +
      "border-color:rgba(251,248,241,.3)}" +
      ".ck-no:hover{border-color:rgba(251,248,241,.6);color:#FBF8F1}" +
      ".ck-yes{background:#D0281C;color:#fff}" +
      ".ck-yes:hover{transform:translateY(-1px)}" +
      ".ck-b:focus-visible{outline:3px solid #F7E0AE;outline-offset:3px}" +
      "@media(max-width:520px){.ck-btns{width:100%}.ck-b{flex:1}}" +
      "@media(prefers-reduced-motion:reduce){.ck{transition:none}}";
    document.head.appendChild(css);
  }

  function boot() {
    var c = read();
    if (c === "granted") { enable(); return; }   // already agreed
    if (c === "denied") { return; }              // already declined
    style(); banner();                           // ask
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* let visitors change their mind: any link with href="#cookies" reopens it */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href="#cookies"]');
    if (!a) return;
    e.preventDefault();
    try { localStorage.removeItem(KEY); } catch (err) {}
    if (!document.querySelector(".ck")) { style(); banner(); }
  });
})();
