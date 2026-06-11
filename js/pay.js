/* pay.js — 金流模組（綠界 ECPay 測試環境）
   ⚠️ 展示模式：用綠界官方公開的測試商店密鑰在前端計算 CheckMacValue，
   只能打測試環境（payment-stage），可用測試卡 4311-9522-2222-2222 體驗完整流程。
   正式上線：密鑰絕不可放前端——把 buildParams() 的結果丟給你的後端簽章，
   後端回傳含 CheckMacValue 的欄位再 submit（換掉 ECPAY.hash 那段即可）。 */
window.Pay = (function () {
  "use strict";

  /* 綠界官方測試商店（文件公開，非機密） */
  var ECPAY = {
    merchantId: "3002607",
    hashKey: "pwFHCqoQZGmho4w6",
    hashIV: "EkRm7iFT261dpevs",
    endpoint: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
  };

  /* ---- SHA-256（純 JS，免依賴 secure context） ---- */
  function sha256(ascii) {
    function rightRotate(v, c) { return (v >>> c) | (v << (32 - c)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), result = "";
    var words = [], asciiBitLength = ascii.length * 8;
    var hash = sha256.h = sha256.h || [], k = sha256.k = sha256.k || [];
    var primeCounter = k.length, isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while (ascii.length % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return; /* 非 ASCII 不應出現（已先 URL-encode） */
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
          + (w[i] = (i < 16) ? w[i] : (w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : "") + b.toString(16);
      }
    }
    return result;
  }

  /* ---- 綠界 .NET 風格 URL encode ---- */
  function netUrlEncode(s) {
    return encodeURIComponent(s)
      .replace(/%20/g, "+")
      .replace(/'/g, "%27")
      .replace(/~/g, "%7e");
  }

  function checkMacValue(params) {
    var keys = Object.keys(params).sort(function (a, b) {
      a = a.toLowerCase(); b = b.toLowerCase();
      return a < b ? -1 : a > b ? 1 : 0;
    });
    var raw = "HashKey=" + ECPAY.hashKey + "&" +
      keys.map(function (k) { return k + "=" + params[k]; }).join("&") +
      "&HashIV=" + ECPAY.hashIV;
    return sha256(netUrlEncode(raw).toLowerCase()).toUpperCase();
  }

  function tradeDate() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) +
      " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  function buildParams(order) {
    return {
      MerchantID: ECPAY.merchantId,
      MerchantTradeNo: order.tradeNo,            /* ≤20 英數 */
      MerchantTradeDate: tradeDate(),
      PaymentType: "aio",
      TotalAmount: String(order.total),          /* 整數 */
      TradeDesc: "gift shop demo order",
      ItemName: order.itemName.slice(0, 390),
      ReturnURL: "https://example.com/ecpay-return", /* 正式環境換成後端 callback */
      ChoosePayment: "Credit",
      EncryptType: "1",
    };
  }

  /* 開新分頁送出綠界測試付款 */
  function ecpayCheckout(order) {
    var params = buildParams(order);
    params.CheckMacValue = checkMacValue(params);
    var form = document.createElement("form");
    form.method = "POST";
    form.action = ECPAY.endpoint;
    form.target = "_blank";
    Object.keys(params).forEach(function (k) {
      var inp = document.createElement("input");
      inp.type = "hidden"; inp.name = k; inp.value = params[k];
      form.appendChild(inp);
    });
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  return { ecpayCheckout: ecpayCheckout, checkMacValue: checkMacValue, _sha256: sha256 };
})();
