/* backend.js — 訂單資料層（雙模式）
   - local：localStorage（demo 用，資料只在同一瀏覽器）
   - supabase：SCENE.backend 填了 url + anonKey 即自動切換（雲端，正式營運）
   介面：createOrder / listOrders / updateOrder / lookupOrder / requestReturn / login */
window.Backend = (function () {
  "use strict";

  var cfg = (window.SCENE && window.SCENE.backend) || {};
  var mode = cfg.url && cfg.anonKey ? "supabase" : "local";

  /* 訂單狀態機 */
  var STATUSES = ["待處理", "已出貨", "已完成", "退貨申請", "退貨完成", "已取消"];

  /* 物流追蹤連結（依取貨方式） */
  function trackingUrl(ship) {
    if (ship.indexOf("7-11") >= 0) return "https://eservice.7-11.com.tw/e-tracking/search.aspx";
    if (ship.indexOf("全家") >= 0) return "https://fmec.famiport.com.tw/FP_Entrance/QueryBox";
    if (ship.indexOf("宅配") >= 0) return "https://www.t-cat.com.tw/inquire/trace.aspx";
    return "";
  }

  /* ================= local driver ================= */
  var LKEY = "giftshop-orders-v1";
  function lload() {
    try { return JSON.parse(localStorage.getItem(LKEY)) || []; }
    catch (e) { return []; }
  }
  function lsave(rows) { localStorage.setItem(LKEY, JSON.stringify(rows)); }

  var local = {
    login: function () { return Promise.resolve({ ok: true, demo: true }); },
    createOrder: function (o) {
      var rows = lload();
      rows.unshift(o);
      lsave(rows);
      return Promise.resolve({ ok: true });
    },
    listOrders: function () { return Promise.resolve(lload()); },
    updateOrder: function (no, patch) {
      var rows = lload();
      rows.forEach(function (r) {
        if (r.no === no) Object.keys(patch).forEach(function (k) { r[k] = patch[k]; });
      });
      lsave(rows);
      return Promise.resolve({ ok: true });
    },
    lookupOrder: function (no, email) {
      var hit = lload().filter(function (r) {
        return r.no === no.trim() && r.email.toLowerCase() === email.trim().toLowerCase();
      })[0];
      return Promise.resolve(hit || null);
    },
    requestReturn: function (no, email, reason) {
      return local.lookupOrder(no, email).then(function (r) {
        if (!r) return { ok: false, msg: "查無訂單" };
        if (["已完成", "已出貨"].indexOf(r.status) < 0)
          return { ok: false, msg: "目前狀態（" + r.status + "）無法申請退貨" };
        return local.updateOrder(no, { status: "退貨申請", return_reason: reason })
          .then(function () { return { ok: true }; });
      });
    },
  };

  /* ================= supabase driver（REST，無 SDK 依賴） ================= */
  function sbHeaders(auth) {
    var h = { "Content-Type": "application/json", apikey: cfg.anonKey };
    h.Authorization = "Bearer " + (auth || cfg.anonKey);
    return h;
  }
  function token() { return sessionStorage.getItem("giftshop-admin-token") || ""; }

  var supabase = {
    login: function (email, password) {
      return fetch(cfg.url + "/auth/v1/token?grant_type=password", {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ email: email, password: password }),
      }).then(function (r) { return r.json(); }).then(function (r) {
        if (r.access_token) {
          sessionStorage.setItem("giftshop-admin-token", r.access_token);
          return { ok: true };
        }
        return { ok: false, msg: r.error_description || r.msg || "登入失敗" };
      });
    },
    createOrder: function (o) {
      return fetch(cfg.url + "/rest/v1/orders", {
        method: "POST",
        headers: Object.assign(sbHeaders(), { Prefer: "return=minimal" }),
        body: JSON.stringify(o),
      }).then(function (r) { return { ok: r.ok }; });
    },
    listOrders: function () {
      return fetch(cfg.url + "/rest/v1/orders?order=created.desc", {
        headers: sbHeaders(token()),
      }).then(function (r) { return r.ok ? r.json() : []; });
    },
    updateOrder: function (no, patch) {
      return fetch(cfg.url + "/rest/v1/orders?no=eq." + encodeURIComponent(no), {
        method: "PATCH", headers: sbHeaders(token()),
        body: JSON.stringify(patch),
      }).then(function (r) { return { ok: r.ok }; });
    },
    lookupOrder: function (no, email) {
      return fetch(cfg.url + "/rest/v1/rpc/lookup_order", {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ p_no: no.trim(), p_email: email.trim() }),
      }).then(function (r) { return r.json(); })
        .then(function (rows) { return (rows && rows[0]) || null; });
    },
    requestReturn: function (no, email, reason) {
      return fetch(cfg.url + "/rest/v1/rpc/request_return", {
        method: "POST", headers: sbHeaders(),
        body: JSON.stringify({ p_no: no.trim(), p_email: email.trim(), p_reason: reason }),
      }).then(function (r) { return r.json(); })
        .then(function (r) { return r === true ? { ok: true } : { ok: false, msg: typeof r === "string" ? r : "申請失敗" }; });
    },
  };

  var api = mode === "supabase" ? supabase : local;
  api.mode = mode;
  api.STATUSES = STATUSES;
  api.trackingUrl = trackingUrl;
  return api;
})();
