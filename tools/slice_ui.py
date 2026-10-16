"""从仓库原始界面裁切 UI；保留原图装饰，清空需要动态排字的区域。"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Image.open(ROOT / "assets/bg.jpg").convert("RGBA")
OUT = ROOT / "assets/ui"
OUT.mkdir(exist_ok=True)


def cut(name, box, polygon=None, rounded=0):
    result = SOURCE.crop(box)
    if polygon or rounded:
        mask = Image.new("L", result.size)
        draw = ImageDraw.Draw(mask)
        if polygon:
            draw.polygon(polygon, fill=255)
        else:
            draw.rounded_rectangle((0, 0, result.width - 1, result.height - 1), rounded, fill=255)
        result.putalpha(mask)
    result.save(OUT / name)
    return result


# 保留原始按钮文字，抽卡仍使用原来的视觉。
hexagon = [(2, 69), (46, 2), (351, 2), (396, 69), (351, 137), (46, 137)]
one = cut("pull-one.png", (1208, 935, 1606, 1075), hexagon)
cut("pull-ten.png", (1610, 935, 2008, 1075), hexagon)

# 从原按钮内部取无字纹理，铺到文字区域；边框、金边和形状保持原图。
paper = SOURCE.crop((1370, 946, 1470, 957))
blank = one.copy()
inner = Image.new("L", blank.size)
ImageDraw.Draw(inner).polygon([(22, 69), (58, 17), (340, 17), (376, 69), (340, 121), (58, 121)], fill=255)
blank.paste(paper.resize(blank.size), (0, 0), inner)
blank.save(OUT / "button-frame.png")

title = SOURCE.crop((290, 155, 907, 402))
title_mask = Image.new("L", title.size)
td = ImageDraw.Draw(title_mask)
td.polygon([(126, 82), (505, 80), (524, 94), (546, 96), (564, 113), (592, 136), (591, 161), (574, 179), (561, 197), (539, 212), (511, 225), (477, 235), (333, 240), (303, 246), (75, 240), (56, 224), (38, 214), (26, 198), (5, 182), (23, 175), (37, 160), (45, 140), (53, 123), (63, 108), (85, 95), (109, 89)], fill=255)
td.polygon([(140, 44), (372, 44), (384, 54), (393, 69), (381, 87), (135, 89), (123, 74), (129, 57)], fill=255)
# 只保留相连的标题框，舍去无法与背景分开的外围装饰，避免残留场景碎片。
title.putalpha(title_mask)
title.save(OUT / "title.png")
# 大厅和仓库只换顶部页签；书法标题直接使用原图。
title_tab = title.copy()
tab_mask = Image.new("L", title.size)
ImageDraw.Draw(tab_mask).polygon([(143, 50), (369, 50), (383, 64), (382, 76), (374, 87), (140, 87), (130, 73)], fill=255)
title_tab.paste(SOURCE.crop((434, 211, 441, 216)).resize(title.size), (0, 0), tab_mask)
title_tab.save(OUT / "title-tab-blank.png")
capsule = cut("capsule-frame.png", (320, 465, 876, 540), rounded=37)
capsule.paste(SOURCE.crop((360, 477, 370, 482)).resize((520, 47)), (28, 13))
capsule_mask = Image.new("L", capsule.size)
ImageDraw.Draw(capsule_mask).rounded_rectangle((0, 0, capsule.width - 1, capsule.height - 1), 37, fill=255)
capsule.putalpha(capsule_mask)
capsule.save(OUT / "capsule-frame.png")

cut("activity-character.png", (28, 142, 281, 331), rounded=22)
cut("activity-rice.png", (31, 338, 276, 507), rounded=20)
cut("activity-whale.png", (31, 518, 276, 688), rounded=20)
cut("activity-weapon.png", (31, 696, 276, 867), rounded=20)
tile = SOURCE.crop((31, 338, 276, 507))
tile.paste(SOURCE.crop((238, 352, 252, 371)).resize((225, 141)), (10, 9))
tile.paste(SOURCE.crop((41, 485, 47, 497)).resize((225, 24)), (10, 137))
mask = Image.new("L", tile.size)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, tile.width - 1, tile.height - 1), 20, fill=255)
tile.putalpha(mask)
tile.save(OUT / "activity-frame.png")

for name, box in [("resource-rice.png", (1410, 15, 1675, 90)), ("resource-whale.png", (1685, 15, 1940, 90))]:
    resource = SOURCE.crop(box)
    alpha = Image.new("L", resource.size)
    rd = ImageDraw.Draw(alpha)
    rd.rounded_rectangle((40, 8, resource.width - 19, 63), 22, fill=255)
    rd.ellipse((1, 0, 79, 73), fill=255)
    rd.ellipse((resource.width - 63, 3, resource.width - 1, 66), fill=255)
    resource.putalpha(alpha)
    resource.save(OUT / name)
SOURCE.crop((1510, 36, 1520, 61)).save(OUT / "resource-fill.png")
# 只清除金色 350 字形，周围纸面逐像素保留，避免矩形贴片边缘。
pity_fill = SOURCE.crop((421, 558, 487, 604))
digits = Image.new("L", pity_fill.size)
for y in range(46):
    for x in range(66):
        r, g, b, _ = pity_fill.getpixel((x, y))
        if r > 140 and r > g * 1.04 and g > b * 1.1:
            digits.putpixel((x, y), 255)
digits = digits.filter(ImageFilter.MaxFilter(5))
for y in range(46):
    for x in range(66):
        if digits.getpixel((x, y)):
            top, bottom = SOURCE.getpixel((421 + x, 558)), SOURCE.getpixel((421 + x, 603))
            pity_fill.putpixel((x, y), tuple(round(top[i] + (bottom[i] - top[i]) * y / 45) for i in range(4)))
pity_fill.save(OUT / "gacha-pity-fill.png")
cut("close.png", (1945, 12, 2029, 93), rounded=40)
badge = SOURCE.crop((1583, 371, 2035, 540))
alpha = Image.new("L", badge.size)
bd = ImageDraw.Draw(alpha)
bd.ellipse((0, 0, 128, 132), fill=255)
bd.polygon([(106, 26), (392, 25), (439, 61), (434, 85), (407, 108), (120, 107)], fill=255)
bd.polygon([(326, 67), (404, 64), (442, 94), (415, 132), (369, 131), (342, 114)], fill=255)
bd.polygon([(36, 114), (62, 135), (82, 155), (91, 125)], fill=255)
badge.putalpha(alpha)
star = Image.open(ROOT / "assets/icons/star.png").convert("RGBA").resize((45, 45))
for index in range(5):
    badge.alpha_composite(star, (124 + index * 53, 114))
badge.save(OUT / "ds-badge.png")

print(f"Created {len(list(OUT.glob('*.png')))} UI slices in {OUT}")
