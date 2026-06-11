// 台味禮品店拼貼 — 物件設定檔
// 座標皆為原圖 (1408x724) 絕對座標，由 Designer 逐一裁切驗證
window.OBJECTS = [
  // ===== 背景大件 (z 2-4) =====
  { id: "marble-counter", name: "大理石櫃台", x: 763, y: 555, w: 282, h: 162, anim: "shimmer", dur: "14s", delay: "0s", z: 2, tag: "結帳請排隊・刷卡加 3%" },
  { id: "gourd-shelf", name: "葫蘆多寶格", x: 915, y: 55, w: 185, h: 470, anim: "breathe", dur: "7s", delay: "0s", z: 2, tag: "鎮店木架・架不賣，卡片才賣" },
  { id: "waterfall-painting", name: "瀑布花園燈畫", x: 430, y: 149, w: 210, h: 156, anim: "flicker", dur: "4s", delay: "0.5s", z: 2, tag: "插電會發光的那種 NT$1,280" },
  { id: "wood-door", name: "木雕大門", x: 654, y: 206, w: 166, h: 278, anim: "wobble", dur: "6s", delay: "0s", z: 2, tag: "入口・鈴蘭門簾加購 NT$200", entrance: true },
  { id: "horse-painting", name: "八駿馬掛畫", x: 1146, y: 103, w: 192, h: 128, anim: "swing", dur: "5s", delay: "0.3s", z: 2, tag: "馬到成功 NT$8,888" },
  { id: "pink-sofa", name: "鮭粉沙發", x: 260, y: 373, w: 302, h: 186, anim: "breathe", dur: "2.5s", delay: "0.2s", z: 3, tag: "肉感沙發・越坐越軟 NT$3,500" },
  { id: "teddy-chair", name: "泰迪熊椅", x: 13, y: 372, w: 178, h: 200, anim: "rock", dur: "3.5s", delay: "0s", z: 3, tag: "熊熊給你靠 NT$2,200" },
  { id: "fish-tank", name: "紅龍魚缸", x: 1154, y: 372, w: 232, h: 118, anim: "swim", dur: "9s", delay: "0s", z: 3, tag: "鎮店之寶・非賣品", inner: { x: 1195, y: 379, w: 128, h: 54 } },
  { id: "root-table", name: "樹根桌與盆花", x: 118, y: 462, w: 230, h: 256, anim: "sway", dur: "4.5s", delay: "0.6s", z: 5, tag: "天然樹瘤・每張長得不一樣 NT$4,800" },

  // ===== 掛衣桿 T-shirt（sway 錯開） (z 4-7) =====
  { id: "tshirt-blue", name: "藍色素T", x: 114, y: 229, w: 86, h: 140, anim: "sway", dur: "3.2s", delay: "0s", z: 4, tag: "基本款・百搭藍 NT$390" },
  { id: "tshirt-black", name: "黑色貓T", x: 158, y: 233, w: 86, h: 144, anim: "sway", dur: "3.2s", delay: "0.4s", z: 5, tag: "黑色才顯瘦 NT$420" },
  { id: "tshirt-pinkbag", name: "粉紅紙袋T", x: 203, y: 231, w: 112, h: 144, anim: "sway", dur: "3.2s", delay: "0.8s", z: 6, tag: "袋子是印的・拿不下來 NT$450" },
  { id: "tshirt-trashbag", name: "垃圾袋T", x: 273, y: 235, w: 124, h: 134, anim: "sway", dur: "3.2s", delay: "1.2s", z: 7, tag: "專用垃圾袋圖案・時尚循環 NT$680" },

  // ===== 牆面小物 (z 4) =====
  { id: "cat-clock", name: "貓臉壁鐘", x: 787, y: 63, w: 78, h: 124, anim: "wobble", dur: "2s", delay: "0s", z: 4, tag: "時間貓貓走・含鐘擺 NT$680" },
  { id: "pink-ornament", name: "粉紅菱形吊飾", x: 712, y: 150, w: 56, h: 68, anim: "spin", dur: "6s", delay: "0.2s", z: 4, tag: "老闆娘手作・獨一無二" },

  // ===== 綠檯與右側 (z 5-6) =====
  { id: "amethyst-geode", name: "大紫水晶洞", x: 1253, y: 203, w: 90, h: 160, anim: "glow", dur: "3.5s", delay: "0s", z: 5, tag: "招財鎮宅・已開光", glow: "#b366ff" },
  { id: "water-fountain", name: "流水盆景", x: 1157, y: 234, w: 110, h: 126, anim: "shimmer", dur: "5s", delay: "0.4s", z: 5, tag: "財源滾滾・記得加水 NT$2,600" },
  { id: "salt-lamp", name: "鹽燈", x: 1108, y: 439, w: 66, h: 96, anim: "glow", dur: "3s", delay: "0.6s", z: 5, tag: "驅邪避凶・會回潮 NT$590", glow: "#ff8c42" },
  { id: "pink-lamp-bear", name: "粉紅檯燈與小熊", x: 1176, y: 489, w: 76, h: 112, anim: "glow", dur: "4s", delay: "0.2s", z: 6, tag: "熊熊夜燈・兩隻都送 NT$750", glow: "#ffb3d9" },
  { id: "crystal-table-lamp", name: "水晶柱桌燈", x: 1126, y: 536, w: 112, h: 132, anim: "shimmer", dur: "6s", delay: "0.8s", z: 5, tag: "七彩水晶腳・雲朵桌面 NT$3,200" },

  // ===== 地面動物與小物 (z 5-6) =====
  { id: "gray-cat", name: "灰貓擺飾", x: 171, y: 460, w: 78, h: 94, anim: "wobble", dur: "2.8s", delay: "0.5s", z: 6, tag: "看店的・別摸" },
  { id: "white-poodle", name: "白貴賓狗", x: 580, y: 477, w: 122, h: 144, anim: "bounce", dur: "1.6s", delay: "0s", z: 5, tag: "已剪毛・很乖 NT$1,500" },
  { id: "apricot-poodle", name: "杏色貴賓狗", x: 690, y: 462, w: 100, h: 156, anim: "bounce", dur: "1.6s", delay: "0.8s", z: 5, tag: "會站不會坐 NT$1,600" },
  { id: "amethyst-small", name: "小紫水晶", x: 588, y: 420, w: 82, h: 78, anim: "twinkle", dur: "3s", delay: "0.3s", z: 5, tag: "小資招財款 NT$880", glow: "#cc66ff" },
  { id: "dark-crystal", name: "深色晶石", x: 808, y: 413, w: 70, h: 76, anim: "twinkle", dur: "3.5s", delay: "1.1s", z: 5, tag: "深藏不露・內行人才懂 NT$1,200", glow: "#e0d0ff" },

  // ===== 櫃台上 (z 6) =====
  { id: "gold-rose-frame", name: "金玫瑰相框", x: 793, y: 519, w: 82, h: 82, anim: "flicker", dur: "3s", delay: "0.7s", z: 6, tag: "永不凋謝・拍立得不行 NT$399" },
  { id: "fax-register", name: "收銀傳真機", x: 872, y: 525, w: 93, h: 86, anim: "shake", dur: "0.4s", delay: "0s", z: 6, tag: "老闆專用・勿動" },
  { id: "buddha", name: "彌勒佛", x: 949, y: 531, w: 76, h: 87, anim: "glow", dur: "4s", delay: "0s", z: 6, tag: "笑口常開 NT$888", glow: "#ffd700" },

  // ===== 多寶格架上小物 (z 7) =====
  { id: "shelf-figurines", name: "牽手娃娃", x: 971, y: 49, w: 70, h: 72, anim: "float", dur: "3.8s", delay: "0s", z: 7, tag: "永浴愛河・分開不賣 NT$199" },
  { id: "shelf-card-pink", name: "粉紅明信片", x: 1004, y: 104, w: 62, h: 101, anim: "float", dur: "4.2s", delay: "0.5s", z: 7, tag: "寄不出去的那種" },
  { id: "shelf-card-appliance", name: "家電圖小卡", x: 938, y: 148, w: 50, h: 62, anim: "float", dur: "4.6s", delay: "0.7s", z: 7, tag: "全套家電買不起・先收卡片" },
  { id: "shelf-card-beach", name: "海邊風景卡", x: 944, y: 219, w: 74, h: 48, anim: "float", dur: "3.6s", delay: "1s", z: 7, tag: "去不了就用看的" },
  { id: "shelf-card-house", name: "愛心小屋卡", x: 1026, y: 284, w: 62, h: 80, anim: "float", dur: "4s", delay: "1.5s", z: 7, tag: "理想的家・先買卡片" },
  { id: "shelf-sunset-lamp", name: "夕陽鹽燈", x: 921, y: 291, w: 92, h: 58, anim: "glow", dur: "3.2s", delay: "0.9s", z: 7, tag: "躺著的夕陽・限量一顆", glow: "#ff8844" },
  { id: "shelf-heart-glass", name: "玻璃愛心吊飾", x: 955, y: 328, w: 58, h: 74, anim: "twinkle", dur: "3.3s", delay: "1.8s", z: 7, tag: "心是玻璃做的・摔了不賠" },
  { id: "shelf-card-palette", name: "調色盤圖卡", x: 859, y: 330, w: 80, h: 59, anim: "float", dur: "3.9s", delay: "1.2s", z: 7, tag: "兔兔上調色盤・不是火鍋" },
  { id: "shelf-card-cup", name: "咖啡杯魚魚卡", x: 927, y: 407, w: 70, h: 86, anim: "float", dur: "4.4s", delay: "2s", z: 7, tag: "杯裡沒有魚・卡上才有" },
  { id: "shelf-card-dessert", name: "甜點杯圖卡", x: 1002, y: 404, w: 56, h: 79, anim: "float", dur: "4.1s", delay: "2.3s", z: 7, tag: "甜點店風景・看了會餓" },

  // ===== 入口地毯 (z 4) =====
  { id: "welcome-mat", name: "歡迎光臨地毯", x: 544, y: 680, w: 140, h: 44, anim: "blink", dur: "1.8s", delay: "0s", z: 4, tag: "踩好踩滿・入內請進", entrance: true },

  // ===== 價格標籤（最高層 z 10） =====
  { id: "tag-680", name: "特價標 680", x: 346, y: 340, w: 40, h: 30, anim: "spin", dur: "5s", delay: "0s", z: 10, tag: "NT$680・撕掉不退", attach: "tshirt-trashbag" },
  { id: "tag-130", name: "價格標 130", x: 966, y: 191, w: 40, h: 33, anim: "spin", dur: "5.5s", delay: "0.4s", z: 10, tag: "NT$130・不二價", attach: "shelf-card-appliance" },
  { id: "tag-50a", name: "價格標 50", x: 1052, y: 177, w: 40, h: 32, anim: "spin", dur: "4.8s", delay: "0.8s", z: 10, tag: "NT$50・銅板價", attach: "shelf-card-pink" },
  { id: "tag-40", name: "價格標 40", x: 994, y: 253, w: 42, h: 32, anim: "spin", dur: "5.2s", delay: "1.2s", z: 10, tag: "NT$40・比夾娃娃便宜", attach: "shelf-card-beach" },
  { id: "tag-50b", name: "價格標 50", x: 1064, y: 334, w: 38, h: 30, anim: "spin", dur: "4.6s", delay: "1.6s", z: 10, tag: "NT$50・加十元送袋子", attach: "shelf-card-house" },
  { id: "tag-60a", name: "價格標 60", x: 909, y: 374, w: 42, h: 32, anim: "spin", dur: "5.8s", delay: "2s", z: 10, tag: "NT$60・老闆說不能再低", attach: "shelf-card-palette" },
  { id: "tag-60b", name: "價格標 60", x: 982, y: 374, w: 42, h: 32, anim: "spin", dur: "5s", delay: "2.4s", z: 10, tag: "NT$60・同款不同命", attach: "shelf-heart-glass" },
  { id: "tag-300a", name: "價格標 300", x: 964, y: 461, w: 43, h: 31, anim: "spin", dur: "5.4s", delay: "2.8s", z: 10, tag: "NT$300・有質感的價位", attach: "shelf-card-cup" },
  { id: "tag-300b", name: "價格標 300", x: 1032, y: 462, w: 45, h: 31, anim: "spin", dur: "4.9s", delay: "3.2s", z: 10, tag: "NT$300・買一送祝福", attach: "shelf-card-dessert" },
];
