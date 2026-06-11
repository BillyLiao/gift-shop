/* track.js — 買家查單：狀態時間軸 / 物流追蹤 / 退貨申請 */
(function () {
  "use strict";

  var B = window.Backend;
  var current = null;

  function lookup() {
    var no = document.getElementById("q-no").value.trim();
    var email = document.getElementById("q-email").value.trim();
    var err = document.getElementById("q-err");
    if (!no || !email) { err.textContent = "請填訂單編號和 Email"; return; }
    err.textContent = "";
    B.lookupOrder(no, email).then(function (o) {
      if (!o) {
        err.textContent = "查無訂單——請確認編號與 Email（要用下單時填的那個）";
        document.getElementById("result").classList.remove("show");
        return;
      }
      current = { no: no, email: email, order: o };
      render(o);
    });
  }

  function render(o) {
    document.getElementById("result").classList.add("show");
    document.getElementById("r-no").textContent = o.no;

    /* 時間軸 */
    var tl = document.getElementById("timeline");
    tl.innerHTML = "";
    var flow = ["待處理", "已出貨", "已完成"];
    var returning = o.status === "退貨申請" || o.status === "退貨完成";
    var cancelled = o.status === "已取消";
    var steps = returning ? ["待處理", "已出貨", "退貨申請", "退貨完成"] : flow;
    var reached = steps.indexOf(o.status);
    if (o.status === "已完成") reached = steps.length - 1;
    steps.forEach(function (s, i) {
      var div = document.createElement("div");
      div.className = "tl-step" + (cancelled ? " cancel" :
        i <= reached ? " done" : "");
      div.textContent = s;
      tl.appendChild(div);
    });
    if (cancelled) tl.innerHTML = '<div class="tl-step cancel">已取消</div>';

    /* 明細 */
    var items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
    var rows = document.getElementById("r-rows");
    rows.innerHTML = "";
    var add = function (k, v, html) {
      var d = document.createElement("div");
      d.className = "r-row";
      var b = document.createElement("b"); b.textContent = k + "：";
      d.appendChild(b);
      if (html) d.insertAdjacentHTML("beforeend", html);
      else d.appendChild(document.createTextNode(v));
      rows.appendChild(d);
    };
    add("品項", items.map(function (i) { return i.name + " × " + i.qty; }).join("、"));
    add("總計", "NT$" + o.total + "（" + o.pay + "）");
    add("取貨", o.ship + "／" + (o.store || o.addr || "—"));
    if (o.tracking) {
      var turl = B.trackingUrl(o.ship);
      add("物流單號", "", o.tracking +
        (turl ? '　<a href="' + turl + '" target="_blank">↗ 到物流商查件</a>' : ""));
    } else if (o.status === "待處理") {
      add("物流", "尚未出貨，出貨後這裡會出現物流單號");
    }

    /* 退貨 */
    var canReturn = ["已出貨", "已完成"].indexOf(o.status) >= 0;
    document.getElementById("ret-box").classList.toggle("show", canReturn);
    if (o.status === "退貨申請")
      add("退貨", "申請已送出，店主審核中");
    if (o.status === "退貨完成")
      add("退貨", "已完成退貨退款");
  }

  document.getElementById("q-btn").addEventListener("click", lookup);

  /* 支援 ?no=CH-xxx&email=xxx 直接帶入查詢（訂單信可放此連結） */
  var qp = new URLSearchParams(location.search);
  if (qp.get("no") && qp.get("email")) {
    document.getElementById("q-no").value = qp.get("no");
    document.getElementById("q-email").value = qp.get("email");
    lookup();
  }

  document.getElementById("ret-btn").addEventListener("click", function () {
    var reason = document.getElementById("ret-reason").value.trim();
    var msg = document.getElementById("ret-msg");
    if (!reason) { msg.textContent = "請填退貨原因"; return; }
    B.requestReturn(current.no, current.email, reason).then(function (r) {
      if (r.ok) {
        msg.textContent = "✅ 退貨申請已送出，店主會透過 Email 聯絡你";
        B.lookupOrder(current.no, current.email).then(render);
      } else msg.textContent = "⚠️ " + (r.msg || "申請失敗");
    });
  });
})();
