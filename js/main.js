/* main.js v2 — 真素材版
   底圖 + 去背 PNG/GIF <img> 疊加。GIF 自己會動（瀏覽器原生），不做自製動畫。
   商品（role: product）：hover 抖動（CSS）＋ tooltip，click 開 Win95 相簿視窗。
   擺設（role: prop）：純顯示，不互動。 */
(function () {
  "use strict";

  var scene = window.SCENE || { w: 1920, h: 1080, base: "", items: [] };
  var params = new URLSearchParams(location.search);
  var isStatic = params.get("static") === "1";
  var isDemo = params.get("demo") === "1";

  if (isStatic) document.body.classList.add("static");

  var stage = document.getElementById("stage");
  var stageWrap = document.getElementById("stage-wrap");
  stage.style.backgroundImage = "url(" + scene.base + ")";

  /* ---- scale stage to viewport width ---- */

  function layout() {
    var vw = document.documentElement.clientWidth;
    var scale = vw / scene.w;
    stage.style.transform = "scale(" + scale + ")";
    stageWrap.style.height = scene.h * scale + "px";
  }
  window.addEventListener("resize", layout);
  layout();

  /* ---- build items ---- */

  scene.items.forEach(function (o) {
    var el;
    if (o.hotspot) {
      /* 底圖已畫好的物件 → 透明點擊熱區 */
      el = document.createElement("div");
    } else {
      el = document.createElement("img");
      el.src = o.src;
      el.alt = o.name || o.id;
      el.draggable = false;
    }
    el.className = "item " +
      (o.role === "product" ? "product" :
       o.role === "info" || o.role === "artist" ? "info" : "prop") +
      (o.hotspot ? " hotspot" : "") +
      (o.role === "artist" ? " artist-door" : "") +
      (o.role === "prop" && o.tip ? " tipped" : "");
    el.id = o.id;
    el.style.left = o.x + "px";
    el.style.top = o.y + "px";
    el.style.width = o.w + "px";
    if (o.h) el.style.height = o.h + "px";
    if (o.z !== undefined) el.style.zIndex = o.z;
    if (o.flip) el.style.transform = "scaleX(-1)";

    var interactive = o.role === "product" || o.role === "info" ||
      o.role === "artist" || (o.role === "prop" && o.tip);
    if (interactive) {
      el.addEventListener("mouseenter", function () { showTooltip(o); });
      el.addEventListener("mousemove", moveTooltip);
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("click", function (e) {
        if (o.role === "product") { openDialog(o); return; }
        if (o.role === "artist") { hideTooltip(); toggleArtist(); return; }
        /* 擺設／家具：點擊也跳幽默說明（手機沒有 hover） */
        showTooltip(o);
        positionTooltipAt(e.clientX, e.clientY);
        clearTimeout(el._tipTimer);
        el._tipTimer = setTimeout(hideTooltip, 2000);
      });
    }

    stage.appendChild(el);
  });

  /* ---- retro tooltip ---- */

  var tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  tooltip.innerHTML =
    '<span class="tt-name"></span><span class="tt-price"></span><span class="tt-tip"></span>';
  document.body.appendChild(tooltip);
  var ttName = tooltip.querySelector(".tt-name");
  var ttPrice = tooltip.querySelector(".tt-price");
  var ttTip = tooltip.querySelector(".tt-tip");

  function showTooltip(o) {
    if (isStatic) return;
    ttName.textContent = o.name || o.id;
    ttPrice.textContent = o.price ? "NT$" + o.price : "";
    ttTip.textContent = o.tip || "";
    tooltip.classList.add("show");
  }

  function positionTooltipAt(cx, cy) {
    var x = cx + 16;
    var y = cy + 16;
    var r = tooltip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = cx - r.width - 12;
    if (y + r.height > window.innerHeight - 8) y = cy - r.height - 12;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  function moveTooltip(e) {
    if (tooltip.classList.contains("demo-fixed")) return;
    positionTooltipAt(e.clientX, e.clientY);
  }

  function hideTooltip() {
    if (tooltip.classList.contains("demo-fixed")) return;
    tooltip.classList.remove("show");
  }

  /* ---- Win95 相簿視窗 ---- */

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
      '<p class="dlg-price"></p>' +
      '<div class="dlg-photo-main"><img alt=""></div>' +
      '<div class="dlg-thumbs"></div>' +
      '<div class="dlg-buy-row">' +
        '<button type="button" class="w95-btn primary" id="dlg-add-cart">加入購物籃 🧺</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dlg);

  var dlgTitle = dlg.querySelector(".dlg-title");
  var dlgPrice = dlg.querySelector(".dlg-price");
  var dlgMain = dlg.querySelector(".dlg-photo-main img");
  var dlgMainBox = dlg.querySelector(".dlg-photo-main");
  var dlgThumbs = dlg.querySelector(".dlg-thumbs");

  var addBtn = dlg.querySelector("#dlg-add-cart");
  var currentProduct = null;
  addBtn.addEventListener("click", function () {
    if (!currentProduct || !window.Cart) return;
    window.Cart.add(currentProduct);
    addBtn.textContent = "已加入 ✓";
    setTimeout(function () { addBtn.textContent = "加入購物籃 🧺"; }, 1200);
  });

  function openDialog(o) {
    currentProduct = o;
    addBtn.textContent = "加入購物籃 🧺";
    dlgTitle.textContent = o.name || o.id;
    dlgPrice.textContent = o.price ? "NT$" + o.price : "時價（請洽店主）";
    dlgThumbs.innerHTML = "";

    var photos = o.photos || [];
    if (photos.length === 0) {
      dlgMainBox.style.display = "none";
      if (!dlg.querySelector(".dlg-empty")) {
        var p = document.createElement("p");
        p.className = "dlg-empty";
        p.textContent = "（商品照準備中）";
        dlg.querySelector(".dlg-body").appendChild(p);
      }
    } else {
      dlgMainBox.style.display = "";
      var empty = dlg.querySelector(".dlg-empty");
      if (empty) empty.remove();
      dlgMain.src = photos[0];
      photos.forEach(function (src, i) {
        var t = document.createElement("img");
        t.src = src;
        t.draggable = false;
        if (i === 0) t.classList.add("sel");
        t.addEventListener("click", function () {
          dlgMain.src = src;
          dlgThumbs.querySelectorAll("img").forEach(function (x) {
            x.classList.remove("sel");
          });
          t.classList.add("sel");
        });
        dlgThumbs.appendChild(t);
      });
    }

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

  /* ---- 店主登場（點大門）---- */

  var artistCfg = scene.artist || null;
  var artistWrap = null;
  var artistLineIdx = -1;
  var artistBubble = null;

  function buildArtist() {
    artistWrap = document.createElement("div");
    artistWrap.id = "artist-wrap";
    artistWrap.style.left = artistCfg.x + "px";
    artistWrap.style.top = artistCfg.y + "px";
    artistWrap.style.height = artistCfg.h + "px";

    var img = document.createElement("img");
    img.id = "artist-char";
    img.src = artistCfg.img;
    img.alt = artistCfg.name;
    img.draggable = false;
    artistWrap.appendChild(img);

    artistBubble = document.createElement("div");
    artistBubble.id = "artist-bubble";
    artistBubble.innerHTML =
      '<b class="ab-name"></b><span class="ab-text"></span>' +
      '<i class="ab-more">點我繼續說 ▸</i>';
    artistBubble.querySelector(".ab-name").textContent = artistCfg.name;
    artistWrap.appendChild(artistBubble);

    artistWrap.addEventListener("click", function (e) {
      e.stopPropagation();
      nextArtistLine();
    });
    stage.appendChild(artistWrap);
  }

  function nextArtistLine() {
    artistLineIdx = (artistLineIdx + 1) % artistCfg.lines.length;
    artistBubble.querySelector(".ab-text").textContent =
      artistCfg.lines[artistLineIdx];
  }

  function toggleArtist() {
    if (!artistCfg) return;
    if (!artistWrap) buildArtist();
    if (artistWrap.classList.contains("show")) {
      artistWrap.classList.remove("show");
      return;
    }
    nextArtistLine();
    artistWrap.classList.add("show");
  }

  document.addEventListener("click", function (e) {
    /* 點場景其他地方收回店主 */
    if (artistWrap && artistWrap.classList.contains("show") &&
        !artistWrap.contains(e.target) &&
        !(e.target.classList && e.target.classList.contains("artist-door"))) {
      artistWrap.classList.remove("show");
    }
  });

  /* ---- QA：?hover=id1,id2 模擬 hover；?demo=1 展示 ---- */

  if (params.get("artist") === "1") toggleArtist();

  var hoverIds = params.get("hover");
  if (hoverIds) {
    hoverIds.split(",").forEach(function (id) {
      var el = document.getElementById(id.trim());
      if (el) el.classList.add("demo-hover");
    });
  }

  if (isDemo) {
    var firstProduct = scene.items.filter(function (o) {
      return o.role === "product";
    })[0];
    if (firstProduct) {
      var el = document.getElementById(firstProduct.id);
      if (el) el.classList.add("demo-hover");
      ttName.textContent = firstProduct.name || firstProduct.id;
      ttPrice.textContent = firstProduct.price ? "NT$" + firstProduct.price : "";
      tooltip.classList.add("show", "demo-fixed");
      tooltip.style.left = "40px";
      tooltip.style.top = "40px";
      openDialog(firstProduct);
    }
  }
})();
