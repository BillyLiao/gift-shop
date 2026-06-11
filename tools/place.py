#!/usr/bin/env python3
"""place.py — 把去背素材對位到成品圖上。

對每個 in_scene 素材：在 manifest approx_bbox 附近做 alpha 遮罩 SSD 模板匹配，
粗到細（1/4 → 1/2 → 1/1 解析度）搜尋位置與縮放，輸出精確 (x, y, w, h)。

用法：python3 tools/place.py /tmp/asset-manifest.json /tmp/placement.json
"""
import json
import sys

import numpy as np
from PIL import Image

WEB = "/Users/niloud/Desktop/web"
TARGET = WEB + "/做好的樣子.jpg"


def load_asset_rgba(path):
    im = Image.open(path)
    if getattr(im, "n_frames", 1) > 1:
        im.seek(0)  # GIF 取第一幀
    return im.convert("RGBA")


def masked_ssd(scene, tpl, mask, x, y):
    h, w = tpl.shape[:2]
    H, W = scene.shape[:2]
    if x < 0 or y < 0 or x + w > W or y + h > H:
        return None
    win = scene[y:y + h, x:x + w]
    d = (win - tpl) ** 2
    s = float((d * mask[..., None]).sum())
    n = float(mask.sum()) * 3
    return s / n if n > 0 else None


def search(scene_im, asset_im, bbox, res, cx, cy, scale0, pos_r, scale_steps, scale_r):
    """在 (cx,cy) 為中心、半徑 pos_r 的窗格內，掃描縮放與位置，回傳最佳 (score, x, y, scale)。"""
    sw, sh = scene_im.size
    scene = np.asarray(
        scene_im.resize((int(sw * res), int(sh * res)), Image.LANCZOS), dtype=np.float32
    )
    best = None
    aw, ah = asset_im.size
    for si in range(scale_steps):
        scale = scale0 * (1 - scale_r + 2 * scale_r * si / max(1, scale_steps - 1))
        tw, th = max(4, int(aw * scale * res)), max(4, int(ah * scale * res))
        t = np.asarray(asset_im.resize((tw, th), Image.LANCZOS), dtype=np.float32)
        tpl, mask = t[..., :3], (t[..., 3] > 64).astype(np.float32)
        if mask.sum() < 16:
            continue
        r = max(1, int(pos_r * res))
        bx, by = int(cx * res), int(cy * res)
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                sc = masked_ssd(scene, tpl, mask, bx + dx, by + dy)
                if sc is not None and (best is None or sc < best[0]):
                    best = (sc, (bx + dx) / res, (by + dy) / res, scale)
    return best


def place(scene_im, path, bbox):
    asset = load_asset_rgba(path)
    aw, ah = asset.size
    x, y, w, h = bbox
    scale0 = min(w / aw, h / ah)
    # 粗：1/4 res、±40px、7 個縮放 ±15%
    b = search(scene_im, asset, bbox, 0.25, x, y, scale0, 40, 7, 0.15)
    if b is None:
        return None
    # 中：1/2 res、±8px、5 個縮放 ±5%
    b = search(scene_im, asset, bbox, 0.5, b[1], b[2], b[3], 8, 5, 0.05) or b
    # 細：1/1 res、±3px、3 個縮放 ±2%
    b = search(scene_im, asset, bbox, 1.0, b[1], b[2], b[3], 3, 3, 0.02) or b
    score, bx, by, scale = b
    return dict(
        x=round(bx), y=round(by),
        w=round(aw * scale), h=round(ah * scale),
        scale=round(scale, 4), score=round(score, 1),
    )


def main():
    manifest = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    scene = Image.open(TARGET).convert("RGB")
    results = {}
    for a in manifest["assets"]:
        if not a.get("in_scene") or not a.get("approx_bbox"):
            continue
        r = place(scene, f"{WEB}/{a['file']}", a["approx_bbox"])
        results[a["file"]] = r
        print(f"{a['file']:<60} -> {r}")
    json.dump(results, open(out_path, "w"), ensure_ascii=False, indent=1)
    print(f"\nwrote {out_path}")


if __name__ == "__main__":
    main()
