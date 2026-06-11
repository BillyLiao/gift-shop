#!/usr/bin/env python3
"""verify.py — 比對 render 截圖與原圖。

用法:
    python3 tools/verify.py <render.png> <original.png> [--mode static|motion]

- 從 js/config.js 解析物件 (regex，一行一物件)
- render 非 1408x724 (retina 2x) 先 LANCZOS 縮回
- 計算全圖 RMS、每物件 bbox RMS、bbox 外圈 6px ring RMS
- static gate: 全圖 RMS < 3 且無單物件 bbox RMS > 6 → exit 0，否則 exit 1
- motion: 只印表格，exit 0
"""

import argparse
import io
import math
import re
import sys
from pathlib import Path

from PIL import Image, ImageChops

try:
    from PIL import ImageCms
except ImportError:
    ImageCms = None

STAGE_W, STAGE_H = 1408, 724
RING = 6

GLOBAL_RMS_GATE = 3.0
BBOX_RMS_GATE = 6.0

CONFIG_PATH = Path(__file__).resolve().parent.parent / "js" / "config.js"


def parse_config(path):
    """Regex-parse js/config.js: one object per line, unquoted keys."""
    objs = []
    if not path.exists():
        print(f"[warn] {path} 不存在，只算全圖 RMS", file=sys.stderr)
        return objs
    text = path.read_text(encoding="utf-8")
    line_re = re.compile(r"\{.*\bid\s*:.*\}")
    field_res = {
        "id": re.compile(r'\bid\s*:\s*"([^"]+)"'),
        "x": re.compile(r"\bx\s*:\s*(-?\d+)"),
        "y": re.compile(r"\by\s*:\s*(-?\d+)"),
        "w": re.compile(r"\bw\s*:\s*(\d+)"),
        "h": re.compile(r"\bh\s*:\s*(\d+)"),
        "anim": re.compile(r'\banim\s*:\s*"([^"]+)"'),
    }
    for line in text.splitlines():
        if not line_re.search(line):
            continue
        # 排除 inner 子物件的 x/y/w/h: 先把 inner: {...} 砍掉再抓欄位
        flat = re.sub(r"\binner\s*:\s*\{[^}]*\}", "", line)
        obj = {}
        ok = True
        for key, rex in field_res.items():
            m = rex.search(flat)
            if not m:
                ok = False
                break
            obj[key] = m.group(1) if key in ("id", "anim") else int(m.group(1))
        if ok:
            objs.append(obj)
    return objs


def rms_of_region(diff, box=None):
    region = diff.crop(box) if box else diff
    h = region.histogram()
    n = region.size[0] * region.size[1]
    if n == 0:
        return 0.0
    sq = 0
    for ch in range(3):
        for i, c in enumerate(h[ch * 256:(ch + 1) * 256]):
            sq += i * i * c
    return math.sqrt(sq / (n * 3))


def ring_rms(diff, x, y, w, h):
    """bbox 外圈 RING px 的 RMS（外擴 bbox 減去 bbox 本身，分四條帶計算）。"""
    x0 = max(0, x - RING)
    y0 = max(0, y - RING)
    x1 = min(STAGE_W, x + w + RING)
    y1 = min(STAGE_H, y + h + RING)
    bands = [
        (x0, y0, x1, max(y0, y)),                      # top
        (x0, min(y1, y + h), x1, y1),                  # bottom
        (x0, max(y0, y), max(x0, x), min(y1, y + h)),  # left
        (min(x1, x + w), max(y0, y), x1, min(y1, y + h)),  # right
    ]
    sq_total, n_total = 0, 0
    h_img = diff
    for bx0, by0, bx1, by1 in bands:
        if bx1 <= bx0 or by1 <= by0:
            continue
        region = h_img.crop((bx0, by0, bx1, by1))
        hist = region.histogram()
        n = region.size[0] * region.size[1]
        for ch in range(3):
            for i, c in enumerate(hist[ch * 256:(ch + 1) * 256]):
                sq_total += i * i * c
        n_total += n
    if n_total == 0:
        return 0.0
    return math.sqrt(sq_total / (n_total * 3))


def load_srgb(path):
    """讀圖並依嵌入 ICC profile 轉到 sRGB（Chrome 渲染時會做色彩管理，
    原圖有 Display P3 之類的 profile 時，不轉會吃掉 1~6 的 RMS 預算）。"""
    im = Image.open(path)
    icc = im.info.get("icc_profile")
    im = im.convert("RGB")
    if icc and ImageCms is not None:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            dst = ImageCms.createProfile("sRGB")
            im = ImageCms.profileToProfile(im, src, dst, outputMode="RGB")
        except Exception as e:
            print(f"[warn] ICC 轉換失敗 ({path}): {e}", file=sys.stderr)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("render")
    ap.add_argument("original")
    ap.add_argument("--mode", choices=["static", "motion"], default="static")
    args = ap.parse_args()

    render = load_srgb(args.render)
    original = load_srgb(args.original)

    if original.size != (STAGE_W, STAGE_H):
        print(f"[warn] original 尺寸 {original.size} != {(STAGE_W, STAGE_H)}",
              file=sys.stderr)

    if render.size != original.size:
        render = render.resize(original.size, Image.LANCZOS)

    diff = ImageChops.difference(render, original)

    global_rms = rms_of_region(diff)
    objs = parse_config(CONFIG_PATH)

    rows = []
    failures = []
    for o in objs:
        x, y, w, h = o["x"], o["y"], o["w"], o["h"]
        box = (max(0, x), max(0, y),
               min(STAGE_W, x + w), min(STAGE_H, y + h))
        b_rms = rms_of_region(diff, box)
        r_rms = ring_rms(diff, x, y, w, h)
        over = args.mode == "static" and b_rms > BBOX_RMS_GATE
        if over:
            failures.append((o["id"], b_rms))
        rows.append((o["id"], o["anim"], b_rms, r_rms, over))

    print(f"mode={args.mode}  render={args.render}")
    print(f"全圖 RMS: {global_rms:.3f}")
    print()
    print(f"{'id':<22} {'anim':<10} {'bbox RMS':>10} {'ring RMS':>10}  flag")
    print("-" * 62)
    for oid, anim, b, r, over in rows:
        flag = "OVER" if over else ""
        print(f"{oid:<22} {anim:<10} {b:>10.3f} {r:>10.3f}  {flag}")

    if args.mode == "motion":
        print("\nmotion 模式：不設 gate，由 PM 判讀。")
        sys.exit(0)

    failed = False
    if global_rms >= GLOBAL_RMS_GATE:
        print(f"\nFAIL: 全圖 RMS {global_rms:.3f} >= {GLOBAL_RMS_GATE}")
        failed = True
    if failures:
        print("\nFAIL: 超標物件:")
        for oid, b in failures:
            print(f"  {oid}: bbox RMS {b:.3f} > {BBOX_RMS_GATE}")
        failed = True

    if failed:
        sys.exit(1)
    print("\nPASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
