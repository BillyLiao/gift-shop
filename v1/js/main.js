/* main.js — stage 建構、物件生成、tooltip、dialog、URL 參數
   動畫 keyframe 與 hover 加速、.burst 動畫由 animations.css 負責。 */
(function () {
  "use strict";

  var STAGE_W = 1408;
  var STAGE_H = 724;
  var SPRITE_URL = "assets/original.png";

  var params = new URLSearchParams(location.search);
  var isStatic = params.get("static") === "1";
  var isDemo = params.get("demo") === "1";
  var freezeAt = parseInt(params.get("freeze") || "", 10);

  if (isStatic) document.body.classList.add("static");

  /* ?freeze=NNN：把所有動畫凍結在第 NNN 毫秒（QA 用）。
     headless Chrome 的 virtual-time-budget 不會推進 compositor 動畫，
     改用負 animation-delay + paused 凍結在指定時間點。 */
  if (!isNaN(freezeAt)) {
    document.documentElement.style.setProperty("--freeze", freezeAt + "ms");
    var fz = document.createElement("style");
    fz.textContent =
      ".obj, .obj-inner { " +
      "animation-delay: calc(var(--delay, 0s) - var(--freeze)) !important; " +
      "animation-play-state: paused !important; }";
    document.head.appendChild(fz);
  }

  var stage = document.getElementById("stage");
  var stageWrap = document.getElementById("stage-wrap");
  var objects = Array.isArray(window.OBJECTS) ? window.OBJECTS : [];

  /* ---- scale stage to viewport width, centered ---- */

  function layout() {
    var vw = document.documentElement.clientWidth;
    var scale = vw / STAGE_W;
    var left = Math.max(0, (vw - STAGE_W * scale) / 2);
    stage.style.transform = "scale(" + scale + ")";
    stage.style.left = left + "px";
    stageWrap.style.height = STAGE_H * scale + "px";
  }
  window.addEventListener("resize", layout);
  layout();

  /* ---- sprite helpers ---- */

  function setSprite(el, x, y, w, h) {
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.background = "url(" + SPRITE_URL + ") no-repeat";
    el.style.backgroundPosition = -x + "px " + -y + "px";
    el.style.backgroundSize = STAGE_W + "px " + STAGE_H + "px";
  }

  /* ---- build objects ---- */

  /* attach 欄位：價格標籤等附屬物，渲染成商品的子元素（hover 商品時一起動），
     不生成獨立的 .obj。 */
  var attachments = objects.filter(function (o) { return o.attach; });
  var products = objects.filter(function (o) { return !o.attach; });

  products.forEach(function (o) {
    var el = document.createElement("div");
    el.className = "obj";
    el.id = o.id;
    el.style.left = o.x + "px";
    el.style.top = o.y + "px";
    setSprite(el, o.x, o.y, o.w, o.h);
    if (o.z !== undefined) el.style.zIndex = o.z;
    if (o.dur) el.style.setProperty("--dur", o.dur);
    if (o.delay) el.style.setProperty("--delay", o.delay);
    if (o.glow) el.style.setProperty("--glow", o.glow);

    if (o.inner) {
      /* swim 特例：外層缸體 shimmer + overflow hidden，內層魚 sprite 游動 */
      el.classList.add("anim-shimmer");
      el.style.overflow = "hidden";

      var fish = document.createElement("div");
      fish.className = "obj-inner anim-" + o.anim;
      fish.style.left = (o.inner.x - o.x) + "px";
      fish.style.top = (o.inner.y - o.y) + "px";
      setSprite(fish, o.inner.x, o.inner.y, o.inner.w, o.inner.h);
      fish.style.clipPath = "ellipse(50% 42% at 50% 50%)";
      if (o.dur) fish.style.setProperty("--dur", o.dur);
      if (o.delay) fish.style.setProperty("--delay", o.delay);
      el.appendChild(fish);
    } else {
      el.classList.add("anim-" + o.anim);
    }

    el.addEventListener("mouseenter", function () { showTooltip(o); });
    el.addEventListener("mousemove", moveTooltip);
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("click", function () {
      el.classList.remove("burst");
      void el.offsetWidth; /* restart animation if re-clicked */
      el.classList.add("burst");
      setTimeout(function () { el.classList.remove("burst"); }, 600);
      openDialog(o);
    });

    stage.appendChild(el);
  });

  /* ---- attach 附屬物（價格標籤）掛到商品上 ---- */

  attachments.forEach(function (t) {
    var parent = products.find(function (p) { return p.id === t.attach; });
    var parentEl = parent && document.getElementById(parent.id);
    if (!parentEl) return; /* attach 目標不存在就略過 */

    var el = document.createElement("div");
    el.className = "obj-tag anim-" + t.anim;
    el.id = t.id;
    el.style.position = "absolute";
    el.style.left = (t.x - parent.x) + "px";
    el.style.top = (t.y - parent.y) + "px";
    el.style.zIndex = 10; /* 蓋在商品 sprite 上 */
    setSprite(el, t.x, t.y, t.w, t.h);
    if (t.dur) el.style.setProperty("--dur", t.dur);
    if (t.delay) el.style.setProperty("--delay", t.delay);
    parentEl.appendChild(el);
  });

  /* ---- retro tooltip ---- */

  var tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  tooltip.innerHTML =
    '<span class="tt-name"></span><span class="tt-tag"></span>';
  document.body.appendChild(tooltip);
  var ttName = tooltip.querySelector(".tt-name");
  var ttTag = tooltip.querySelector(".tt-tag");

  function showTooltip(o) {
    if (isStatic) return;
    ttName.textContent = o.name;
    ttTag.textContent = o.tag || "";
    tooltip.classList.add("show");
  }

  function moveTooltip(e) {
    if (tooltip.classList.contains("demo-fixed")) return;
    var x = e.clientX + 16;
    var y = e.clientY + 16;
    var r = tooltip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - 12;
    if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - 12;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  function hideTooltip() {
    if (tooltip.classList.contains("demo-fixed")) return;
    tooltip.classList.remove("show");
  }

  /* ---- Win95 dialog ---- */

  var overlay = document.createElement("div");
  overlay.id = "dialog-overlay";
  document.body.appendChild(overlay);

  var dlg = document.createElement("div");
  dlg.id = "win-dialog";
  dlg.innerHTML =
    '<div class="dlg-titlebar">' +
      '<span class="dlg-title"></span>' +
      '<button class="dlg-close" type="button" aria-label="關閉">✕</button>' +
    '</div>' +
    '<div class="dlg-body">' +
      '<p class="dlg-tag"></p>' +
      '<p class="dlg-placeholder">作品內容掛載點</p>' +
    '</div>';
  document.body.appendChild(dlg);

  var dlgTitle = dlg.querySelector(".dlg-title");
  var dlgTag = dlg.querySelector(".dlg-tag");

  function openDialog(o) {
    dlgTitle.textContent = o.name;
    dlgTag.textContent = o.tag || "";
    overlay.classList.add("open");
    dlg.classList.add("open");
  }

  function closeDialog() {
    overlay.classList.remove("open");
    dlg.classList.remove("open");
  }

  dlg.querySelector(".dlg-close").addEventListener("click", closeDialog);
  overlay.addEventListener("click", closeDialog);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDialog();
  });

  /* ---- ?hover=id1,id2：指定物件模擬 hover（QA 截圖用） ---- */

  var hoverIds = params.get("hover");
  if (hoverIds) {
    hoverIds.split(",").forEach(function (id) {
      var el = document.getElementById(id.trim());
      if (el && el.classList.contains("obj")) el.classList.add("demo-hover");
    });
  }

  /* ---- demo 模式（QA 截圖用） ---- */

  if (isDemo && products.length > 0) {
    var demoTargets = products.slice(0, 2);
    demoTargets.forEach(function (o) {
      var el = document.getElementById(o.id);
      if (el) el.classList.add("demo-hover");
    });
    var first = products[0];
    ttName.textContent = first.name;
    ttTag.textContent = first.tag || "";
    tooltip.classList.add("show", "demo-fixed");
    openDialog(first);
  }
})();
