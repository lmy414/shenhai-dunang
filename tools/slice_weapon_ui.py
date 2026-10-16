"""按原坐标拆分武器 UI；图层拼合须与原图逐像素一致，不补绘场景。"""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Image.open(ROOT / "assets/bg_weapon.jpg").convert("RGBA")
OUT = ROOT / "assets/ui/weapon"
OUT.mkdir(parents=True, exist_ok=True)

# 坐标以原图 2048×1152 为准，页面按 2000×1125 等比换算。
BOXES = {
    "title": (288, 152, 908, 452),
    "rules": (312, 460, 884, 625),
    "activity-character": (20, 135, 288, 334),
    "activity-rice": (24, 334, 280, 515),
    "activity-whale": (24, 515, 280, 694),
    "activity-weapon": (24, 694, 284, 874),
    "resource-rice": (1376, 4, 1680, 96),
    "resource-whale": (1680, 4, 1940, 96),
    "close": (1940, 4, 2048, 104),
    "badge": (1568, 352, 2048, 638),
    "shortcut-shop": (44, 940, 190, 1124),
    "shortcut-details": (192, 940, 334, 1124),
    "shortcut-history": (336, 940, 484, 1124),
    "pull-one": (1204, 932, 1612, 1078),
    "pull-ten": (1608, 932, 2016, 1078),
}

plate = SOURCE.copy()
for name, box in BOXES.items():
    SOURCE.crop(box).save(OUT / f"{name}.png")
    plate.paste((0, 0, 0, 0), box)
plate.save(OUT / "background.png")

# 仅移除金色 350 字形，其余像素保持不变，供 DOM 叠加当前保底。
box = (416, 560, 485, 605)
fill = SOURCE.crop(box)
mask = Image.new("L", fill.size)
for y in range(fill.height):
    for x in range(fill.width):
        r, g, b, _ = fill.getpixel((x, y))
        if r > 140 and r > g * 1.04 and g > b * 1.1:
            mask.putpixel((x, y), 255)
mask = mask.filter(ImageFilter.MaxFilter(3))
for y in range(fill.height):
    for x in range(fill.width):
        if mask.getpixel((x, y)):
            top, bottom = SOURCE.getpixel((box[0] + x, box[1])), SOURCE.getpixel((box[0] + x, box[3] - 1))
            fill.putpixel((x, y), tuple(round(top[i] + (bottom[i] - top[i]) * y / (fill.height - 1)) for i in range(4)))
fill.save(OUT / "pity-fill.png")

manifest = {"source": "assets/bg_weapon.jpg", "size": SOURCE.size, "layers": BOXES, "pity": box}
(OUT / "layers.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

rebuilt = plate.copy()
for name, box in BOXES.items():
    rebuilt.alpha_composite(Image.open(OUT / f"{name}.png"), box[:2])
assert ImageChops.difference(SOURCE, rebuilt).convert("RGB").getbbox() is None
print(f"Created {len(BOXES)} UI layers; reconstruction matches all {SOURCE.width * SOURCE.height:,} source pixels.")
