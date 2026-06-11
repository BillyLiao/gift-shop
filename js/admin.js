/* admin.js — 店主後台：訂單列表 / 狀態流轉 / 物流單號 / 退貨審核 / CSV */
(function () {
  "use strict";

  var B = window.Backend;
  var orders = [];
  var selected = null;

  var loginView = document.getElementById("login-view");
  var adminView = document.getElementById("admin-view");
  var banner = document.getElementById("mode-banner");

  banner.textContent = B.mode === "local"
    ? "⚠️ Demo 模式：訂單存在這台瀏覽器的 localStorage（買家在自己瀏覽器下的單不會出現在這裡）。接上 Supabase 後自動切換成雲端。"
    : "雲端模式（Supabase）";

  /* ---- 登入 ---- */
  function enter() {
    loginView.style.display = "none";
    adminView.style.display = "";
    reload();
  }
  if (B.mode === "local") {
    document.getElementById("who").textContent = "demo";
    enter();
  } else if (sessionStorage.getItem("giftshop-admin-token")) {
    enter();
  }
  document.getElementById("lg-btn").addEventListener("click", function () {
    var email = document.getElementById("lg-email").value.trim();
    B.login(email, document.getElementById("lg-pass").value).then(function (r) {
      if (r.ok) { document.getElementById("who").textContent = email; enter(); }
      else document.getElementById("login-err").textContent = r.msg || "登入失敗";
    });
  });

  /* ---- 列表 ---- */
  var fStatus = document.getElementById("f-status");
  var fKw = document.getElementById("f-kw");
  B.STATUSES.forEach(function (s) {
    var op = document.createElement("option");
    op.value = op.textContent = s;
    fStatus.appendChild(op);
  });

  function reload() {
    B.listOrders().then(function (rows) {
      orders = rows || [];
      render();
    });
  }

  function fmtDate(d) {
    return (d || "").toString().slice(0, 16).replace("T", " ");
  }

  function render() {
    var kw = fKw.value.trim().toLowerCase();
    var st = fStatus.value;
    var hits = orders.filter(function (o) {
      if (st && o.status !== st) return false;
      if (kw && (o.no + o.name + o.email).toLowerCase().indexOf(kw) < 0) return false;
      return true;
    });
    var tb = document.getElementById("rows");
    tb.innerHTML = "";
    hits.forEach(function (o) {
      var tr = document.createElement("tr");
      if (selected && selected.no === o.no) tr.className = "sel";
      tr.innerHTML =
        "<td>" + o.no + "</td><td>" + fmtDate(o.created) + "</td><td></td>" +
        "<td>NT$" + o.total + "</td><td></td><td></td>" +
        '<td><span class="st st-' + o.status + '">' + o.status + "</span></td>";
      tr.children[2].textContent = o.name;
      tr.children[4].textContent = o.ship + (o.store ? "／" + o.store : "");
      tr.children[5].textContent = o.pay;
      tr.addEventListener("click", function () { select(o); });
      tb.appendChild(tr);
    });
    var pending = orders.filter(function (o) { return o.status === "待處理"; }).length;
    var returns = orders.filter(function (o) { return o.status === "退貨申請"; }).length;
    document.getElementById("stats").textContent =
      "共 " + orders.length + " 筆｜待處理 " + pending + "｜退貨申請 " + returns;
  }
  fStatus.addEventListener("change", render);
  fKw.addEventListener("input", render);
  document.getElementById("btn-reload").addEventListener("click", reload);

  /* ---- 詳情 ---- */
  var dStatus = document.getElementById("d-status");
  B.STATUSES.forEach(function (s) {
    var op = document.createElement("option");
    op.value = op.textContent = s;
    dStatus.appendChild(op);
  });

  function select(o) {
    selected = o;
    document.getElementById("detail").classList.add("show");
    document.getElementById("d-no").textContent = o.no + "（" + o.status + "）";
    var items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
    document.getElementById("d-items").innerHTML = items.map(function (i) {
      return i.name + " × " + i.qty + "　" + (i.price ? "NT$" + i.price * i.qty : "時價");
    }).join("<br>") + "<br><b>小計 NT$" + o.subtotal + "＋運費 NT$" + o.fee +
      "＝總計 NT$" + o.total + "</b>";
    var g = document.getElementById("d-grid");
    g.innerHTML = "";
    [["買家", o.name], ["Email", o.email], ["電話", o.phone || "—"],
     ["付款", o.pay], ["取貨", o.ship], ["門市/地址", o.store || o.addr || "—"],
     ["備註", o.note || "—"], ["成立時間", fmtDate(o.created)]].forEach(function (kv) {
      var div = document.createElement("div");
      var b = document.createElement("b"); b.textContent = kv[0] + "：";
      div.appendChild(b); div.appendChild(document.createTextNode(kv[1]));
      g.appendChild(div);
    });
    dStatus.value = o.status;
    document.getElementById("d-tracking").value = o.tracking || "";
    var turl = B.trackingUrl(o.ship);
    var a = document.getElementById("d-trackurl");
    a.textContent = turl ? "↗ 物流商查件頁" : "";
    a.href = turl || "#";
    var ret = document.getElementById("d-return");
    if (o.status === "退貨申請" || o.return_reason) {
      ret.style.display = "block";
      ret.textContent = "🔁 退貨原因：" + (o.return_reason || "（未填）") +
        "　→ 同意退貨請把狀態改為「退貨完成」，拒絕改回「已完成」。";
    } else ret.style.display = "none";
    document.getElementById("save-msg").textContent = "";
    render();
  }

  document.getElementById("d-save").addEventListener("click", function () {
    if (!selected) return;
    var patch = {
      status: dStatus.value,
      tracking: document.getElementById("d-tracking").value.trim(),
    };
    B.updateOrder(selected.no, patch).then(function (r) {
      document.getElementById("save-msg").textContent = r.ok ? "✅ 已儲存" : "⚠️ 儲存失敗";
      selected.status = patch.status;
      selected.tracking = patch.tracking;
      reload();
    });
  });

  /* ---- CSV ---- */
  document.getElementById("btn-csv").addEventListener("click", function () {
    var head = ["訂單編號", "日期", "買家", "Email", "電話", "品項", "總計",
                "付款", "取貨", "門市/地址", "狀態", "物流單號", "退貨原因"];
    var lines = [head.join(",")];
    orders.forEach(function (o) {
      var items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
      var itemStr = items.map(function (i) { return i.name + "x" + i.qty; }).join("；");
      lines.push([o.no, fmtDate(o.created), o.name, o.email, o.phone || "",
        itemStr, o.total, o.pay, o.ship, o.store || o.addr || "",
        o.status, o.tracking || "", o.return_reason || ""].map(function (v) {
          return '"' + String(v).replace(/"/g, '""') + '"';
        }).join(","));
    });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "orders.csv";
    a.click();
  });
})();
