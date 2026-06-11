/* cart.js — 購物籃與結帳模組（展示模式，未串接金流）
   - localStorage 持久化（giftshop-cart-v1）
   - Win95 風格購物籃視窗：明細 / 數量增減 / 移除 / 合計
   - 結帳：表單驗證 → 訂單編號 → 訂單內容可複製
   - 無價商品顯示「時價」，不計入合計
   QA 參數：?qa=cart|checkout|done（種入示範商品並開到對應畫面） */
window.Cart = (function () {
  "use strict";

  var KEY = "giftshop-cart-v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function persist(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  var items = load();

  function find(id) {
    return items.filter(function (i) { return i.id === id; })[0];
  }

  function add(p) {
    var it = find(p.id);
    if (it) it.qty += 1;
    else items.push({ id: p.id, name: p.name, price: p.price ? +p.price : null, qty: 1 });
    persist(items); renderBadge(); renderList();
  }

  function setQty(id, qty) {
    var it = find(id);
    if (!it) return;
    it.qty = Math.max(1, Math.min(99, qty));
    persist(items); renderBadge(); renderList();
  }

  function remove(id) {
    items = items.filter(function (i) { return i.id !== id; });
    persist(items); renderBadge(); renderList();
  }

  function count() {
    return items.reduce(function (s, i) { return s + i.qty; }, 0);
  }
  function total() {
    return items.reduce(function (s, i) { return s + (i.price ? i.price * i.qty : 0); }, 0);
  }
  function marketPriceCount() {
    return items.reduce(function (s, i) { return s + (i.price ? 0 : i.qty); }, 0);
  }

  /* ================= UI ================= */

  /* ---- 購物籃按鈕（右下角，Win95 工作列風） ---- */
  var fab = document.createElement("button");
  fab.id = "cart-fab";
  fab.type = "button";
  fab.innerHTML = '🧺 購物籃 <span id="cart-badge">0</span>';
  document.body.appendChild(fab);
  var badge = fab.querySelector("#cart-badge");

  function renderBadge() {
    badge.textContent = count();
    badge.classList.toggle("empty", count() === 0);
  }

  /* ---- 視窗骨架（三個畫面：list / checkout / done） ---- */
  var overlay = document.createElement("div");
  overlay.id = "cart-overlay";
  document.body.appendChild(overlay);

  var win = document.createElement("div");
  win.id = "cart-window";
  win.innerHTML =
    '<div class="dlg-titlebar">' +
      '<span id="cart-title">購物籃</span>' +
      '<button class="dlg-close" id="cart-close" type="button" aria-label="關閉">✕</button>' +
    '</div>' +
    '<div class="cart-body">' +
      '<div id="cart-view-list">' +
        '<div id="cart-rows"></div>' +
        '<p id="cart-empty">籃子是空的——去店裡逛逛吧</p>' +
        '<div id="cart-total-row">' +
          '<span id="cart-market-note"></span>' +
          '<strong id="cart-total"></strong>' +
        '</div>' +
        '<div class="cart-actions">' +
          '<button type="button" class="w95-btn" id="cart-continue">繼續逛逛</button>' +
          '<button type="button" class="w95-btn primary" id="cart-checkout">去結帳 →</button>' +
        '</div>' +
      '</div>' +
      '<form id="cart-view-checkout" novalidate>' +
        '<label>姓名 *<input name="name" type="text" autocomplete="name"></label>' +
        '<label>Email *<input name="email" type="email" autocomplete="email"></label>' +
        '<label>電話<input name="phone" type="tel" autocomplete="tel"></label>' +
        '<label>取貨方式<select name="ship">' +
          '<option value="宅配">宅配（運費 NT$60）</option>' +
          '<option value="7-11 店到店">7-11 店到店（運費 NT$60）</option>' +
          '<option value="全家 店到店">全家 店到店（運費 NT$60）</option>' +
          '<option value="面交">面交（免運）</option>' +
        '</select></label>' +
        '<div id="store-row" style="display:none">' +
          '<label><span id="store-label">門市名稱／店號 *</span>' +
            '<input name="store" type="text" placeholder="例：台北車站門市 (123456)"></label>' +
          '<button type="button" class="w95-btn sm" id="store-map">🗺 選擇門市</button>' +
        '</div>' +
        '<label id="addr-label">地址 *<input name="addr" type="text" autocomplete="street-address"></label>' +
        '<label>付款方式<select name="pay">' +
          '<option value="貨到付款">貨到付款</option>' +
          '<option value="信用卡">信用卡（綠界測試環境）</option>' +
        '</select></label>' +
        '<label>備註<textarea name="note" rows="2"></textarea></label>' +
        '<div id="fee-summary">' +
          '<span>小計 <b id="fee-sub"></b></span>' +
          '<span>運費（買家負擔）<b id="fee-ship"></b></span>' +
          '<span>總計 <b id="fee-total"></b></span>' +
        '</div>' +
        '<p class="cart-hint" id="pay-hint">信用卡走綠界<strong>測試環境</strong>：會開新分頁，' +
          '可用測試卡 4311-9522-2222-2222 體驗，不會真的扣款。</p>' +
        '<p id="checkout-error"></p>' +
        '<div class="cart-actions">' +
          '<button type="button" class="w95-btn" id="checkout-back">← 回購物籃</button>' +
          '<button type="submit" class="w95-btn primary" id="checkout-submit">送出訂單</button>' +
        '</div>' +
      '</form>' +
      '<div id="cart-view-done">' +
        '<p class="done-mark">✅ 訂單成立</p>' +
        '<p>訂單編號 <strong id="order-no"></strong></p>' +
        '<textarea id="order-text" rows="9" readonly></textarea>' +
        '<p class="cart-hint">金流尚未開通——請按下方按鈕複製訂單內容，傳給店主完成付款與出貨。</p>' +
        '<p id="notify-status"></p>' +
        '<div class="cart-actions">' +
          '<button type="button" class="w95-btn" id="order-copy">複製訂單內容</button>' +
          '<button type="button" class="w95-btn" id="order-mail">✉️ 寄訂單給店主</button>' +
          '<button type="button" class="w95-btn primary" id="done-close">回到店裡</button>' +
        '</div>' +
        '<p class="cart-hint" style="text-align:right;margin-top:8px">' +
          '之後可到 <a href="track.html" target="_blank">訂單查詢頁</a> 追蹤出貨／申請退貨' +
        '</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(win);

  var views = {
    list: win.querySelector("#cart-view-list"),
    checkout: win.querySelector("#cart-view-checkout"),
    done: win.querySelector("#cart-view-done"),
  };
  var titleEl = win.querySelector("#cart-title");

  function show(view) {
    Object.keys(views).forEach(function (k) {
      views[k].style.display = k === view ? "" : "none";
    });
    titleEl.textContent =
      view === "list" ? "購物籃" : view === "checkout" ? "結帳" : "訂單成立";
    if (view === "list") renderList();
    if (view === "checkout") renderFees();
  }

  function open(view) {
    overlay.classList.add("open");
    win.classList.add("open");
    show(view || "list");
  }
  function close() {
    overlay.classList.remove("open");
    win.classList.remove("open");
  }

  /* ---- 明細畫面 ---- */
  var rowsEl = win.querySelector("#cart-rows");
  var emptyEl = win.querySelector("#cart-empty");
  var totalEl = win.querySelector("#cart-total");
  var marketEl = win.querySelector("#cart-market-note");
  var checkoutBtn = win.querySelector("#cart-checkout");

  function renderList() {
    rowsEl.innerHTML = "";
    items.forEach(function (i) {
      var row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML =
        '<span class="cr-name"></span>' +
        '<span class="cr-price"></span>' +
        '<span class="cr-qty">' +
          '<button type="button" class="w95-btn sm cr-minus">−</button>' +
          '<b class="cr-n"></b>' +
          '<button type="button" class="w95-btn sm cr-plus">＋</button>' +
        '</span>' +
        '<span class="cr-sub"></span>' +
        '<button type="button" class="w95-btn sm cr-del" aria-label="移除">✕</button>';
      row.querySelector(".cr-name").textContent = i.name;
      row.querySelector(".cr-price").textContent = i.price ? "NT$" + i.price : "時價";
      row.querySelector(".cr-n").textContent = i.qty;
      row.querySelector(".cr-sub").textContent = i.price ? "NT$" + i.price * i.qty : "—";
      row.querySelector(".cr-minus").addEventListener("click", function () { setQty(i.id, i.qty - 1); });
      row.querySelector(".cr-plus").addEventListener("click", function () { setQty(i.id, i.qty + 1); });
      row.querySelector(".cr-del").addEventListener("click", function () { remove(i.id); });
      rowsEl.appendChild(row);
    });
    emptyEl.style.display = items.length ? "none" : "";
    totalEl.textContent = "合計 NT$" + total();
    var mc = marketPriceCount();
    marketEl.textContent = mc ? "（含時價商品 " + mc + " 件，另計）" : "";
    checkoutBtn.disabled = items.length === 0;
  }

  /* ---- 結帳畫面 ---- */
  var SHIP_FEE = { "宅配": 60, "7-11 店到店": 60, "全家 店到店": 60, "面交": 0 };

  /* 站內門市選擇器：政府開放資料（全國超商分公司）內建成 assets/data/stores.js，
     縣市→區→關鍵字過濾，選了直接填入。不依賴外部地圖回拋（靜態主機收不了 POST），
     file:// 本機直開也能用。正式接物流商後可換成官方電子地圖（需後端）。 */
  var STORE_MAP = { "7-11 店到店": "7-11", "全家 店到店": "全家" };

  var picker = document.createElement("div");
  picker.id = "store-picker";
  picker.innerHTML =
    '<div class="sp-bar">' +
      '<select id="sp-county"></select>' +
      '<select id="sp-district"></select>' +
      '<input id="sp-kw" type="text" placeholder="路名關鍵字">' +
      '<button type="button" class="w95-btn sm" id="sp-close">✕</button>' +
    '</div>' +
    '<ul id="sp-list"></ul>' +
    '<p class="cart-hint" id="sp-note"></p>';
  win.querySelector("#store-row").appendChild(picker);

  var spCounty = picker.querySelector("#sp-county");
  var spDist = picker.querySelector("#sp-district");
  var spKw = picker.querySelector("#sp-kw");
  var spList = picker.querySelector("#sp-list");

  function loadStores(cb) {
    if (window.CVS_STORES) return cb();
    var s = document.createElement("script");
    s.src = "assets/data/stores.js";
    s.onload = cb;
    s.onerror = function () {
      errEl.textContent = "門市資料載入失敗，請手動填寫門市。";
    };
    document.head.appendChild(s);
  }

  function currentChain() { return STORE_MAP[form.elements.ship.value]; }

  function districtsOf(addrs) {
    var seen = {};
    addrs.forEach(function (a) {
      var m = a.match(/^(.{1,3}?[鄉鎮市區])/);
      if (m) seen[m[1]] = 1;
    });
    return Object.keys(seen).sort();
  }

  function renderPickerList() {
    var data = window.CVS_STORES[currentChain()] || {};
    var addrs = data[spCounty.value] || [];
    var dist = spDist.value, kw = spKw.value.trim();
    var hits = addrs.filter(function (a) {
      return (!dist || a.indexOf(dist) === 0) && (!kw || a.indexOf(kw) >= 0);
    });
    spList.innerHTML = "";
    hits.slice(0, 120).forEach(function (a) {
      var li = document.createElement("li");
      li.textContent = a;
      li.addEventListener("click", function () {
        form.elements.store.value =
          currentChain() + "（" + spCounty.value + a + "）";
        errEl.textContent = "";
        picker.classList.remove("open");
      });
      spList.appendChild(li);
    });
    picker.querySelector("#sp-note").textContent =
      hits.length + " 家門市" + (hits.length > 120 ? "（只列前 120，加關鍵字縮小範圍）" : "");
  }

  function renderPickerSelects() {
    var data = window.CVS_STORES[currentChain()] || {};
    spCounty.innerHTML = "";
    Object.keys(data).sort(function (a, b) {
      return data[b].length - data[a].length;
    }).forEach(function (c) {
      var op = document.createElement("option");
      op.value = op.textContent = c;
      spCounty.appendChild(op);
    });
    renderPickerDistricts();
  }

  function renderPickerDistricts() {
    var data = window.CVS_STORES[currentChain()] || {};
    spDist.innerHTML = '<option value="">全部區域</option>';
    districtsOf(data[spCounty.value] || []).forEach(function (d) {
      var op = document.createElement("option");
      op.value = op.textContent = d;
      spDist.appendChild(op);
    });
    renderPickerList();
  }

  spCounty.addEventListener("change", renderPickerDistricts);
  spDist.addEventListener("change", renderPickerList);
  spKw.addEventListener("input", renderPickerList);
  picker.querySelector("#sp-close").addEventListener("click", function () {
    picker.classList.remove("open");
  });

  function openStorePicker() {
    if (!currentChain()) return;
    loadStores(function () {
      renderPickerSelects();
      picker.classList.add("open");
    });
  }

  var form = views.checkout;
  var errEl = win.querySelector("#checkout-error");
  var storeRow = win.querySelector("#store-row");
  var addrLabel = win.querySelector("#addr-label");
  var payHint = win.querySelector("#pay-hint");

  function shipFee() { return SHIP_FEE[form.elements.ship.value] || 0; }

  function renderFees() {
    win.querySelector("#fee-sub").textContent = "NT$" + total();
    win.querySelector("#fee-ship").textContent = shipFee() ? "NT$" + shipFee() : "免運";
    win.querySelector("#fee-total").textContent = "NT$" + (total() + shipFee());
    var cfg = STORE_MAP[form.elements.ship.value];
    var isCVS = !!cfg;
    storeRow.style.display = isCVS ? "" : "none";
    addrLabel.style.display = isCVS ? "none" : "";
    if (!isCVS) picker.classList.remove("open");
    addrLabel.firstChild.textContent =
      form.elements.ship.value === "面交" ? "約定地點 *" : "地址 *";
    payHint.style.display =
      form.elements.pay.value === "信用卡" ? "" : "none";
  }
  form.elements.ship.addEventListener("change", renderFees);
  form.elements.pay.addEventListener("change", renderFees);

  win.querySelector("#store-map").addEventListener("click", openStorePicker);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var isCVS = !!STORE_MAP[f.ship.value];
    var missing = [];
    if (!f.name.value.trim()) missing.push("姓名");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) missing.push("Email");
    if (isCVS && !f.store.value.trim()) missing.push("門市名稱／店號");
    if (!isCVS && !f.addr.value.trim())
      missing.push(f.ship.value === "面交" ? "約定地點" : "地址");
    if (missing.length) {
      errEl.textContent = "請填寫：" + missing.join("、");
      return;
    }
    errEl.textContent = "";
    finishOrder({
      name: f.name.value.trim(), email: f.email.value.trim(),
      phone: f.phone.value.trim(), ship: f.ship.value,
      store: isCVS ? f.store.value.trim() : "",
      addr: isCVS ? "" : f.addr.value.trim(),
      pay: f.pay.value, fee: shipFee(),
      note: f.note.value.trim(),
    });
  });

  win.querySelector("#checkout-back").addEventListener("click", function () { show("list"); });

  /* ---- 完成畫面 ---- */
  var orderNoEl = win.querySelector("#order-no");
  var orderTextEl = win.querySelector("#order-text");

  function orderNo() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return "CH-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function finishOrder(info) {
    var no = orderNo();
    var grand = total() + (info.fee || 0);
    var lines = ["訂單編號：" + no, ""];
    items.forEach(function (i) {
      lines.push(i.name + " × " + i.qty + "　" + (i.price ? "NT$" + i.price * i.qty : "時價"));
    });
    lines.push("", "小計：NT$" + total(),
      "運費（買家負擔）：" + (info.fee ? "NT$" + info.fee : "免運"),
      "總計：NT$" + grand +
      (marketPriceCount() ? "（時價商品另計）" : ""));
    lines.push("", "付款方式：" + info.pay);
    lines.push("訂購人：" + info.name, "Email：" + info.email);
    if (info.phone) lines.push("電話：" + info.phone);
    lines.push("取貨：" + info.ship + "／" + (info.store || info.addr));
    if (info.note) lines.push("備註：" + info.note);

    orderNoEl.textContent = no;
    orderTextEl.value = lines.join("\n");
    notifyShop(no, lines.join("\n"), info);

    /* 寫入訂單資料層（local demo 或 Supabase 雲端，見 js/backend.js） */
    if (window.Backend) {
      window.Backend.createOrder({
        no: no, created: new Date().toISOString(),
        items: items.map(function (i) {
          return { id: i.id, name: i.name, price: i.price, qty: i.qty };
        }),
        subtotal: total(), fee: info.fee || 0, total: grand,
        pay: info.pay, ship: info.ship, store: info.store || "",
        addr: info.addr || "", name: info.name, email: info.email,
        phone: info.phone || "", note: info.note || "",
        status: "待處理", tracking: "", return_reason: "",
      });
    }

    /* 信用卡 → 綠界測試環境（新分頁）；貨到付款 → 直接成立 */
    var doneHint = win.querySelector("#cart-view-done .cart-hint");
    if (info.pay === "信用卡" && window.Pay) {
      window.Pay.ecpayCheckout({
        tradeNo: no.replace(/-/g, ""),
        total: grand,
        itemName: items.map(function (i) { return i.name + " x" + i.qty; })
          .concat(["運費 x1"]).join("#"),
      });
      doneHint.innerHTML = "綠界<strong>測試</strong>付款頁已在新分頁開啟" +
        "（測試卡 4311-9522-2222-2222／效期任意未來日／安全碼任意）。" +
        "完成後請複製訂單內容傳給店主核對。";
    } else {
      doneHint.textContent = "貨到付款訂單已成立——請複製訂單內容傳給店主，安排出貨。";
    }

    items = []; persist(items); renderBadge();
    show("done");
  }

  /* ---- 訂單通知店主 ----
     1) Web3Forms 自動寄信（config 填了 web3formsKey 才會啟用）
     2) mailto 按鈕：買家手動寄（永遠可用的備援） */
  var shopCfg = (window.SCENE && window.SCENE.shop) || {};
  var notifyEl = win.querySelector("#notify-status");
  var lastOrderText = "";

  function notifyShop(no, text, info) {
    lastOrderText = text;
    notifyEl.textContent = "";
    if (!shopCfg.web3formsKey) return; /* 未設定自動寄信 → 靠複製/mailto */
    notifyEl.textContent = "訂單通知寄送中…";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: shopCfg.web3formsKey,
        subject: "【新訂單】" + no,
        from_name: info.name,
        replyto: info.email,
        message: text,
      }),
    }).then(function (r) { return r.json(); }).then(function (r) {
      notifyEl.textContent = r.success
        ? "✅ 訂單已自動寄給店主"
        : "⚠️ 自動通知失敗——請用下方按鈕把訂單寄給店主";
    }).catch(function () {
      notifyEl.textContent = "⚠️ 自動通知失敗——請用下方按鈕把訂單寄給店主";
    });
  }

  win.querySelector("#order-mail").addEventListener("click", function () {
    var no = orderNoEl.textContent;
    location.href = "mailto:" + (shopCfg.email || "") +
      "?subject=" + encodeURIComponent("【新訂單】" + no) +
      "&body=" + encodeURIComponent(lastOrderText);
  });

  win.querySelector("#order-copy").addEventListener("click", function () {
    var btn = this;
    orderTextEl.select();
    var done = function () {
      btn.textContent = "已複製 ✓";
      setTimeout(function () { btn.textContent = "複製訂單內容"; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(orderTextEl.value).then(done, done);
    else { document.execCommand("copy"); done(); }
  });
  win.querySelector("#done-close").addEventListener("click", close);

  /* ---- 開關 ---- */
  fab.addEventListener("click", function () { open("list"); });
  win.querySelector("#cart-close").addEventListener("click", close);
  win.querySelector("#cart-continue").addEventListener("click", close);
  checkoutBtn.addEventListener("click", function () { show("checkout"); });
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  renderBadge();

  /* ---- QA：?qa=cart|checkout|done ---- */
  var qa = new URLSearchParams(location.search).get("qa");
  if (qa) {
    var prods = (window.SCENE && window.SCENE.items || [])
      .filter(function (o) { return o.role === "product"; });
    items = [];
    if (prods[0]) items.push({ id: prods[0].id, name: prods[0].name, price: prods[0].price ? +prods[0].price : null, qty: 2 });
    var noPrice = prods.filter(function (o) { return !o.price; })[0];
    var priced2 = prods.filter(function (o) { return o.price && o.id !== prods[0].id; })[0];
    if (priced2) items.push({ id: priced2.id, name: priced2.name, price: +priced2.price, qty: 1 });
    if (noPrice) items.push({ id: noPrice.id, name: noPrice.name, price: null, qty: 1 });
    persist(items); renderBadge();
    if (qa === "cart") open("list");
    if (qa === "checkout") open("checkout");
    if (qa === "store") {
      open("checkout");
      form.elements.ship.value = "7-11 店到店";
      form.elements.ship.dispatchEvent(new Event("change"));
      openStorePicker();
    }
    if (qa === "done") {
      finishOrder({ name: "測試人", email: "qa@test.tw", phone: "0912345678",
                    ship: "宅配", addr: "台北市某區某路 1 號", store: "",
                    pay: "貨到付款", fee: 60, note: "QA 測試" });
      open("done");
    }
  }

  return { add: add, open: open, count: count };
})();
