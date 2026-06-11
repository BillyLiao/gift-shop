# 歡迎光臨 — 線上禮品店 Portfolio

🔗 **線上版：https://billyliao.github.io/gift-shop/**

用真素材重現《做好ㄉ樣子》：底圖（空店面）＋ 去背 PNG/GIF 疊加。
GIF 擺設原生會動；商品 hover 放大抖動，點擊開 Win95 相簿視窗看實拍照。

## 使用

直接開 `index.html`（零依賴，免 build 免 server）。

- **商品**（16 個）：hover → 放大＋逐格抖動＋粉紅光暈＋tooltip（名稱/價格）；click → 相簿視窗（主圖＋縮圖切換）＋「加入購物籃」
- **擺設**：不互動；GIF（瀑布畫、白貴賓狗、印表機、夕陽瓶、竹流水、小熊檯燈、粉紅果凍）自己會動
- **春聯**是底圖畫好的 → 透明熱區，hover 顯示虛線框

## 購物籃與結帳

- 右下角 **🧺 購物籃**：明細、數量增減、移除、合計（localStorage 持久化，重開頁面不掉）
- **時價商品**（瀑布、面紙盒狗、春聯）可加入但不計入合計，明細標「另計」
- **取貨方式**：宅配／7-11 店到店／全家 店到店（運費均 NT$60，買家負擔）、面交（免運）
  - 超商取貨：必填門市欄＋「查門市地圖」開官方門市查詢（7-11 emap／全家店舖地圖）
- **付款方式**：
  - **貨到付款**：訂單直接成立，產生訂單編號＋全文一鍵複製
  - **信用卡**：跳轉**綠界測試環境**（官方公開測試商店 3002607，前端算 CheckMacValue 已與
    Python 參考實作對拍一致）。測試卡 `4311-9522-2222-2222`，不會真的扣款

## 訂單後台（admin.html）與買家查單（track.html）

- **admin.html** 店主後台：訂單列表（狀態篩選/搜尋）、狀態流轉（待處理→已出貨→已完成）、
  物流單號＋對應物流商查件連結（7-11/全家/黑貓自動判斷）、退貨審核、CSV 匯出
- **track.html** 買家查單：訂單編號＋Email 查詢、狀態時間軸、物流追蹤、申請退貨
  （支援 `?no=CH-xxx&email=xxx` 直接帶入）
- **資料層雙模式**（`js/backend.js`）：
  - **demo（現在）**：localStorage——同一瀏覽器內可體驗完整流程，但買家的訂單不會出現在店主電腦上
  - **雲端（正式）**：Supabase 免費方案。設定步驟：
    1. [supabase.com](https://supabase.com) 建免費專案
    2. SQL Editor 貼上 `supabase/schema.sql` 整段執行（建表＋RLS＋買家查單/退貨 RPC）
    3. Authentication → Users → 新增店主帳號（email＋密碼）
    4. Settings → API 拿 Project URL 和 anon public key，填進 `js/config.js` 的 `SCENE.backend`
    5. 完成——下單寫入雲端，admin.html 登入管理，track.html 全球可查

### 正式上線時要做的

1. **金流**：密鑰不可放前端。後端開一支簽章 API，`js/pay.js` 的 `ecpayCheckout()` 改成把
   `buildParams()` 結果丟後端拿 CheckMacValue 再 submit；`ReturnURL` 換成後端 callback
2. **物流**：綠界物流電子地圖（門市回拋）需要 `ServerReplyURL`，同樣等後端；目前的門市手填欄是過渡方案
3. 訂單目前只產生文字供複製——接後端後可改成寫入資料庫/寄信

## 改內容

一切在 `js/config.js`（一行一物件）：

- 調位置/大小：改 `x y w h`，座標系 1920×1080
- 換商品照：替換 `assets/products/<商品>/N.jpg`，或改 `photos` 陣列
- 加新商品：丟去背 PNG 進 `assets/png/`，加一行 `role: "product"`

## 已知事項

- **台北市垃圾**素材內建標籤是 550，但《做好ㄉ樣子》同位置讀起來像 680——目前 tooltip 用 550，要改就改 config 的 `price`
- **金框玫瑰**（櫃台上）原始素材缺檔，目前是從成品圖裁的靜態版（`assets/png/rose-frame.png`）。如果找到動圖版，換檔＋改 config 的 `src` 即可
- **毛巾／慢重金屬／大眼妹** 三個商品不在《做好ㄉ樣子》場景中，未放入（商品照已留在原資料夾）
- 手機沒有 hover，抖動效果僅桌面；點擊行為手機正常

## URL 參數（QA 用）

| 參數 | 作用 |
|---|---|
| `?hover=id1,id2` | 模擬 hover |
| `?demo=1` | 模擬 hover＋自動開第一個商品的相簿 |
| `?static=1` | 關掉 hover 效果（GIF 仍會動） |

## 結構

```
index.html
css/base.css          版面、hover 抖動、tooltip、Win95 相簿
js/config.js          24 個物件：位置/角色/商品資料（單一事實來源）
js/main.js            config → DOM、互動、相簿
assets/base.jpg       底圖（8000×4500 原圖縮至 1920×1080）
assets/target.jpg     《做好ㄉ樣子》參考圖（QA 比對用，可刪）
assets/png/           場景素材（去背 PNG＋動圖 GIF）
assets/products/      商品實拍照（壓縮至 ≤1100px）
tools/place.py        素材對位（alpha 遮罩模板匹配）
tools/verify.py       v1 的截圖比對工具
v1/                   第一版（截圖 sprite 版）封存
```
