"""把维护者提供的「捕鱼场景」素材整理成游戏用的 assets/fishing/。

用法：python tools/prepare_fishing_assets.py <素材文件夹>
需要 Python、Pillow、NumPy、SciPy；页面运行不依赖本脚本。

原图全部不是透明底，按底色分别处理：
- 白底道具（渔网、网弹、发射器、按钮、加成图标）：离白色越近越透明（color-to-alpha），网眼等镂空处自然透出水下。
- 黑底光效（三种光泡）：按亮度换算透明度，适合发光叠加。
- 黑底装备框：从边缘连通的黑色当作背景，框内的深蓝底保留。
- 鱼影照片：只取剪影轮廓，统一重绘成半透明深蓝影子。
- 场景：只缩放和压缩，不改画面。
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

SRC = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/fishing"
OUT.mkdir(parents=True, exist_ok=True)


def load(name):
    return Image.open(SRC / name).convert("RGB")


def arr(im):
    return np.asarray(im).astype(np.float32)


def to_img(rgb, alpha):
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.clip(alpha * 255, 0, 255)]).astype(np.uint8), "RGBA")


def trim(im, pad=4):
    box = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        return im
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))


def fit(im, size):
    im = im.copy()
    im.thumbnail((size, size), Image.LANCZOS)
    return im


def keep_main(im, ratio=.01):
    """只保留主体：去掉离主体很远、面积很小的杂点（例如原图边缘的残留）。"""
    a = np.asarray(im).copy()
    solid = a[..., 3] > 25
    lab, n = ndi.label(ndi.binary_dilation(solid, iterations=6))
    if n > 1:
        sizes = np.bincount(lab.ravel())[1:]
        keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * ratio])
        a[..., 3] = np.where(keep, a[..., 3], 0)
    return Image.fromarray(a, "RGBA")


def save(im, name, size):
    im = fit(trim(keep_main(im)), size)
    im.save(OUT / f"{name}.png", optimize=True)
    print(name, im.size)


def white_to_alpha(im, soft=60, solid_mask=None):
    """浅色底去背：先取四边像素的中位数当底色（有的图是浅灰底），离底色越近越透明，
    再把半透明像素里的底色“减掉”还原颜色。"""
    a = arr(im)
    edge = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    dist = np.abs(a - bg).max(axis=2)
    alpha = np.clip((dist - 10) / soft, 0, 1)                         # 底色有轻微噪点，先扣掉
    if solid_mask is not None:
        alpha = np.maximum(alpha, solid_mask.astype(np.float32))
    al = np.maximum(alpha, 1e-3)[..., None]
    rgb = (a - bg * (1 - al)) / al
    return to_img(rgb, alpha)


def border_white_mask(im, tol=12):
    """与边缘连通的近白区域（背景），用来保护物体内部的白色不被抠穿。"""
    a = arr(im)
    white = (a.min(axis=2) > 255 - tol) & (np.ptp(a, axis=2) < tol)
    lab, _ = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    return np.isin(lab, list(border))


def solid_object(im, tol=12):
    """物体主体（非背景）且不是网眼的部分：用于发射器这类实心道具。"""
    bg = border_white_mask(im, tol)
    return ndi.binary_fill_holes(~bg)


def glow_on_black(im, gain=1.15):
    """黑底发光素材：亮度即透明度。"""
    a = arr(im)
    alpha = np.clip((a.max(axis=2) - 14) / (255 - 14) * gain, 0, 1)  # 黑底有少量噪点，先扣掉
    al = np.maximum(alpha, 1e-3)[..., None]
    return to_img(a / al, alpha)


def split_sheet(im, min_area=2000):
    """白底拼图里的多个圆形图标：按连通块切开，按行、列排序。"""
    obj = ~border_white_mask(im, 14)
    obj = ndi.binary_closing(obj, iterations=3)
    lab, n = ndi.label(obj)
    boxes = []
    for i, sl in enumerate(ndi.find_objects(lab), start=1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h * w > min_area * 10:
            boxes.append((sl[0].start, sl[1].start, sl))
    rows = sorted(boxes)
    # 同一行（顶部相差不到 60 像素）内按 x 排序
    rows.sort(key=lambda b: (round(b[0] / 60), b[1]))
    return [im.crop((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)) for _, _, sl in rows]


# ---------- 场景：统一缩放到 2048 宽内并压成 JPG ----------
for src, name in [("清晨.png", "dawn"), ("白天.png", "day"), ("黄昏.png", "dusk"), ("夜晚.png", "night"), ("浑水.png", "murk")]:
    im = load(src)
    im.thumbnail((2048, 1152), Image.LANCZOS)
    im.save(OUT / f"scene-{name}.jpg", quality=84, optimize=True)
    print("scene", name, im.size)

# ---------- 渔网、网弹：白底去背，网眼镂空 ----------
for src, name in [("渔网完好.png", "net-open"), ("渔网收拢.png", "net-full"), ("渔网破碎.png", "net-torn"), ("渔网网弹.png", "net-shell")]:
    save(white_to_alpha(load(src), soft=55), name, 640 if name != "net-shell" else 256)

# ---------- 发射器：实心，内部白瓷不能抠穿 ----------
base = load("底座.png")
h, w = base.height, base.width
yy, xx = np.mgrid[0:h, 0:w]
b = arr(base)
gold = (b[..., 0] - b[..., 2] > 60) & (b[..., 0] > 140)              # 底座外圈是金边，背景是灰白大理石
cy, cx = h / 2, w / 2
dist = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
r = np.percentile(dist[gold], 99.7)
disc = dist <= r + 2                                                    # 底座是圆形，沿金边外沿切下
disc_alpha = ndi.gaussian_filter(disc.astype(np.float32), 1.2)
save(to_img(arr(base), disc_alpha), "launcher-base", 512)

barrel = load("炮管.png")
solid = solid_object(barrel, 10)
barrel_img = white_to_alpha(barrel, soft=40, solid_mask=ndi.binary_erosion(solid, iterations=2))
barrel_img = trim(barrel_img).rotate(-90, expand=True)              # 原图炮口朝左，转成朝上
save(barrel_img, "launcher-barrel", 512)

# ---------- 光泡：黑底发光 ----------
for src, name in [("水中光泡 冰蓝色光环.png", "bubble-3"), ("水中光泡 紫色光环.png", "bubble-4"), ("水中光泡 金色光环.png", "bubble-5")]:
    save(glow_on_black(load(src)), name, 512)

# ---------- 装备栏框：边缘连通的黑色是背景 ----------
slot = load("装备栏框.png")
a = arr(slot)
dark = a.max(axis=2) < 14
lab, _ = ndi.label(dark)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
alpha = ndi.gaussian_filter((~bg).astype(np.float32), .8)
save(to_img(a, alpha), "gear-slot", 320)

# ---------- 按钮与加成图标：从拼图里切开 ----------
for im, names in [(load("捕鱼 logo 图.png"), ["btn-pause", "btn-resume", "btn-settle", "btn-gear"]),
                  (load("武器加成图标X 7.png"), ["perk-net", "perk-hold", "perk-rice", "perk-swift", "perk-thrift", "perk-lure", "perk-sleep"])]:
    tiles = split_sheet(im)
    assert len(tiles) == len(names), (len(tiles), names)
    for tile, name in zip(tiles, names):
        solid = solid_object(tile, 14)
        save(white_to_alpha(tile, soft=50, solid_mask=ndi.binary_erosion(solid, iterations=3)), name, 256 if name.startswith("btn") else 160)

# ---------- 鱼影：取剪影轮廓，重绘为半透明深蓝影子（头朝右） ----------
# 「水下鱼影大鱼2」鱼身与背景亮度太接近，提取不出完整轮廓，暂不使用
for src, name in [("水下鱼影大鱼.png", "shadow-whale"), ("水下鱼影小鱼.png", "shadow-fish"), ("水下鱼影 小鱼2.png", "shadow-fish2")]:
    im = load(src)
    im.thumbnail((1400, 800), Image.LANCZOS)
    lum = arr(im).mean(axis=2)
    local = ndi.uniform_filter(lum, 151)                                   # 周围的水色亮度
    sil = (local - lum) > 18                                               # 比周围暗的就是剪影
    lab, _ = ndi.label(ndi.binary_opening(sil, iterations=2))
    sil = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)              # 只要最大的那条鱼
    sil = ndi.binary_fill_holes(ndi.binary_closing(sil, iterations=4))
    soft = ndi.gaussian_filter(sil.astype(np.float32), 6)
    rgb = np.zeros(lum.shape + (3,), np.float32) + np.array([12, 32, 66], np.float32)
    shadow = trim(to_img(rgb, soft * .78), 10)
    save(shadow, name, 512)
print("done")
