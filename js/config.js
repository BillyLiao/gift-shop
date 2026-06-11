/* config.js v2 — 場景設定（單一事實來源）
   座標系 1920×1080。role: product=商品（hover 抖動＋點擊相簿）、prop=擺設（不互動）。
   hotspot: true 不放圖（底圖已畫好），只放透明點擊區。 */
window.SCENE = {
  w: 1920, h: 1080, base: "assets/base.jpg",
  items: [
    { id: "dog-clock", src: "assets/png/\u72d7\u9418.png", x: 1067, y: 86, w: 90, h: 152, z: 20, role: "prop", name: "狗鐘", tip: "時間狗狗走・整點不報時" },
    { id: "zine", src: "assets/png/8.png", x: 1366, y: 128, w: 105, h: 137, z: 21, role: "product", name: "里民小誌", price: "50", photos: ["assets/products/里民小誌/1.jpg"] },
    { id: "keychain", src: "assets/png/7.png", x: 1256, y: 135, w: 99, h: 152, z: 22, role: "product", name: "KEYCHAIN", price: "130", photos: ["assets/products/KEYCHAIN/1.jpg", "assets/products/KEYCHAIN/2.jpg", "assets/products/KEYCHAIN/3.jpg", "assets/products/KEYCHAIN/4.jpg", "assets/products/KEYCHAIN/5.jpg"] },
    { id: "orchid-card", src: "assets/png/6.png", x: 1280, y: 284, w: 123, h: 88, z: 23, role: "product", name: "圓滿成功", price: "40", photos: ["assets/products/圓滿成功/1.jpg"] },
    { id: "waterfall", src: "assets/png/tumblr_acc6492f84d268a0f670e47e42939725_e9e06090_1280.gif", x: 583, y: 191, w: 268, h: 205, z: 24, role: "product", name: "瀑布", photos: ["assets/products/瀑布/1.jpg", "assets/products/瀑布/2.jpg", "assets/products/瀑布/3.jpg"] },
    { id: "gif-sunset-bottle", src: "assets/png/tumblr_pkoe03LlmO1wiatbxo1_250.gif", x: 1242, y: 377, w: 127, h: 56, z: 25, role: "prop", name: "夕陽瓶", tip: "躺著的夕陽・限量一顆" },
    { id: "gif-bamboo-fountain", src: "assets/png/tumblr_pru6vt0TMN1wiatbxo1_500.gif", x: 1590, y: 328, w: 126, h: 127, z: 26, role: "prop", name: "竹筒流水", tip: "財源滾滾・記得加水" },
    { id: "t-snake", src: "assets/png/13.png", x: 131, y: 270, w: 206, h: 222, z: 10, role: "product", name: "蛇", price: "680", photos: ["assets/products/蛇/1.jpg", "assets/products/蛇/2.jpg", "assets/products/蛇/3.jpg", "assets/products/蛇/4.jpg", "assets/products/蛇/5.jpg"] },
    { id: "tattoo-book", src: "assets/png/\u624b\u518a\u5c01\u9762.jpg", x: 1396, y: 364, w: 70, h: 101, z: 28, role: "product", name: "刺青復原手冊", price: "50", photos: ["assets/products/刺青復原手冊/1.jpg", "assets/products/刺青復原手冊/2.jpg", "assets/products/刺青復原手冊/3.jpg", "assets/products/刺青復原手冊/4.jpg", "assets/products/刺青復原手冊/5.jpg"] },
    { id: "t-wash", src: "assets/png/10.png", x: 299, y: 259, w: 197, h: 280, z: 13, role: "product", name: "洗手衣", price: "550", photos: ["assets/products/洗手衣/1.jpg", "assets/products/洗手衣/2.jpg", "assets/products/洗手衣/3.jpg"] },
    { id: "t-egg", src: "assets/png/12.png", x: 184, y: 259, w: 212, h: 247, z: 11, role: "product", name: "蛋", price: "680", photos: ["assets/products/蛋/1.jpg", "assets/products/蛋/2.jpg", "assets/products/蛋/3.jpg", "assets/products/蛋/4.jpg"] },
    { id: "t-taipei", src: "assets/png/9.png", x: 362, y: 258, w: 185, h: 242, z: 14, role: "product", name: "台北市垃圾", price: "550", photos: ["assets/products/台北市垃圾/1.jpg", "assets/products/台北市垃圾/2.jpg", "assets/products/台北市垃圾/3.jpg", "assets/products/台北市垃圾/4.jpg", "assets/products/台北市垃圾/5.jpg"] },
    { id: "t-newtaipei", src: "assets/png/11.png", x: 250, y: 259, w: 200, h: 259, z: 12, role: "product", name: "新北市垃圾衣", price: "550", photos: ["assets/products/新北市垃圾衣/1.jpg", "assets/products/新北市垃圾衣/2.jpg", "assets/products/新北市垃圾衣/3.jpg", "assets/products/新北市垃圾衣/4.jpg", "assets/products/新北市垃圾衣/5.jpg"] },
    { id: "newyear-card", src: "assets/png/5.png", x: 1156, y: 443, w: 127, h: 92, z: 33, role: "product", name: "賀年卡", price: "60", photos: ["assets/products/賀年卡/1.jpg", "assets/products/賀年卡/2.jpg"] },
    { id: "love-keychain", src: "assets/png/4.png", x: 1282, y: 409, w: 101, h: 135, z: 24, role: "product", name: "愛的鑰匙圈", price: "60", photos: ["assets/products/愛的鑰匙圈/1.jpg", "assets/products/愛的鑰匙圈/2.jpg", "assets/products/愛的鑰匙圈/3.jpg", "assets/products/愛的鑰匙圈/4.jpg", "assets/products/愛的鑰匙圈/5.jpg"] },
    { id: "artbook", src: "assets/png/1.png", x: 1345, y: 525, w: 115, h: 140, z: 35, role: "product", name: "畫冊", price: "300", photos: ["assets/products/畫冊/1.jpg", "assets/products/畫冊/2.jpg", "assets/products/畫冊/3.jpg", "assets/products/畫冊/4.jpg", "assets/products/畫冊/5.jpg"] },
    { id: "snail-egg", src: "assets/png/2.png", x: 1257, y: 524, w: 108, h: 142, z: 36, role: "product", name: "蝸牛和蛋殼", price: "300", photos: ["assets/products/蝸牛和蛋殼/1.jpg", "assets/products/蝸牛和蛋殼/2.jpg", "assets/products/蝸牛和蛋殼/3.jpg", "assets/products/蝸牛和蛋殼/4.jpg", "assets/products/蝸牛和蛋殼/5.jpg"] },
    { id: "gif-jelly", src: "assets/png/tumblr_oitfrpF72E1v70ddyo1_250.gif", x: 282, y: 696, w: 80, h: 56, z: 37, role: "prop", name: "粉紅果凍", tip: "老闆的點心・看的不賣" },
    { id: "gif-printer", src: "assets/png/tumblr_prmzwao8gu1sgy4peo1_250.gif", x: 1168, y: 717, w: 120, h: 128, z: 39, role: "prop", name: "印表機", tip: "老闆專用・勿動" },
    { id: "rose-frame", src: "assets/png/tumblr_ooov3aeUYw1w2xjvyo1_250.gif", x: 1042, y: 738, w: 112, h: 95, z: 39, role: "prop", name: "老闆的電腦", tip: "桌布是玫瑰・不能換" },
    { id: "gif-poodle", src: "assets/png/tumblr_ppkf23vtZf1wiatbxo1_250.gif", x: 803, y: 669, w: 110, h: 128, z: 40, role: "prop", name: "白貴賓狗", tip: "已剪毛・很乖", flip: true },
    { id: "tissue-dog", src: "assets/png/\u9762\u7d19\u76d2.png", x: 1556, y: 746, w: 110, h: 79, z: 41, role: "product", name: "面紙盒狗", photos: ["assets/products/面紙盒狗/1.jpg", "assets/products/面紙盒狗/2.jpg", "assets/products/面紙盒狗/3.jpg", "assets/products/面紙盒狗/4.jpg", "assets/products/面紙盒狗/5.jpg"] },
    { id: "gif-bearlamp", src: "assets/png/tumblr_ptw37ktY2b1wiatbxo1_250.gif", x: 1632, y: 690, w: 69, h: 124, z: 40, role: "prop", name: "小熊檯燈", tip: "熊熊夜燈・兩隻都送" },
    { id: "chunlian", hotspot: true, x: 940, y: 196, w: 100, h: 108, z: 60, role: "product", name: "春聯", photos: ["assets/products/春聯/1.jpg", "assets/products/春聯/2.jpg", "assets/products/春聯/3.jpg"] },
    { id: "hs-shelf", hotspot: true, x: 1213, y: 40, w: 320, h: 590, z: 4, role: "info", name: "葫蘆多寶格", tip: "鎮店木架・架不賣，卡片才賣" },
    { id: "hs-sofa", hotspot: true, x: 400, y: 505, w: 400, h: 200, z: 4, role: "info", name: "鮭粉沙發", tip: "肉感沙發・越坐越軟" },
    { id: "hs-teddy", hotspot: true, x: 75, y: 493, w: 205, h: 245, z: 4, role: "info", name: "泰迪熊椅", tip: "熊熊給你靠" },
    { id: "hs-treetable", hotspot: true, x: 253, y: 660, w: 245, h: 290, z: 4, role: "info", name: "樹根桌", tip: "天然樹瘤・每張長得不一樣" },
    { id: "hs-catpot", hotspot: true, x: 238, y: 625, w: 68, h: 95, z: 4, role: "info", name: "貓咪壺", tip: "看店的・別摸" },
    { id: "hs-door", hotspot: true, x: 885, y: 310, w: 220, h: 370, z: 4, role: "artist", name: "店主 陳念瑩", tip: "叩叩・有人在" },
    { id: "hs-horse", hotspot: true, x: 1547, y: 120, w: 266, h: 175, z: 4, role: "info", name: "八駿圖", tip: "馬到成功" },
    { id: "hs-fishtank", hotspot: true, x: 1573, y: 427, w: 267, h: 200, z: 4, role: "info", name: "紅龍魚缸", tip: "鎮店之寶・非賣品" },
    { id: "hs-fountain", hotspot: true, x: 1605, y: 310, w: 115, h: 115, z: 4, role: "info", name: "流水盆景", tip: "財源滾滾・記得加水" },
    { id: "hs-amethyst", hotspot: true, x: 1725, y: 305, w: 120, h: 140, z: 4, role: "info", name: "紫晶洞", tip: "招財鎮宅・已開光" },
    { id: "hs-saltlamp", hotspot: true, x: 1507, y: 600, w: 106, h: 145, z: 4, role: "info", name: "鹽燈", tip: "驅邪避凶・會回潮" },
    { id: "hs-buddha", hotspot: true, x: 1280, y: 773, w: 120, h: 145, z: 4, role: "info", name: "彌勒佛", tip: "笑口常開・摸肚求財" },
    { id: "hs-poodlechair", hotspot: true, x: 947, y: 720, w: 170, h: 160, z: 4, role: "info", name: "貴賓狗椅", tip: "會站不會坐" },
    { id: "hs-glasstable", hotspot: true, x: 1573, y: 830, w: 190, h: 170, z: 4, role: "info", name: "水晶柱茶几", tip: "七彩水晶腳・越晚越亮" },
    { id: "hs-counter", hotspot: true, x: 1040, y: 760, w: 380, h: 250, z: 4, role: "info", name: "大理石櫃台", tip: "結帳請排隊・刷卡不加成" },
    { id: "hs-welcome", hotspot: true, x: 725, y: 947, w: 222, h: 105, z: 4, role: "info", name: "歡迎光臨地毯", tip: "踩好踩滿・入內請進" },
  ]
};

window.SCENE.artist = {
  name: "陳念瑩",
  img: "assets/png/artist.png",
  /* 站在門口的位置（stage 座標）與高度 */
  x: 995, y: 360, h: 320,
  lines: [
    "歡迎光臨～隨便看隨便逛，弄壞要買。",
    "T-shirt 都是我自己印的，垃圾袋是圖案，不是真的垃圾。",
    "架上的卡片每張都有故事，買回去故事就是你的了。",
    "紅龍是鎮店的，牠不賣。牠負責賣我。",
    "買不買沒關係，門口地毯踩一下再走，算來過。"
  ]
};

/* 店家設定：訂單通知 */
window.SCENE.shop = {
  email: "chennienying@gmail.com",
  /* Web3Forms access key（https://web3forms.com 用上面的 email 免費領取）。
     填入後訂單成立會自動寄信到店主信箱；留空則只有買家手動寄信/複製。 */
  web3formsKey: ""
};
