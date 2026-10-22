# 署名、许可范围与素材说明

## 项目信息

- 项目：深海的嘟囔 · 角色活动求索
- 系列：蓝色大肥鱼
- 页面及原 README 中的制作者署名：B 站「镜花_Mirror」「彼岸花Channel」
- 来源仓库：https://github.com/lmy414/shenhai-dunang
- 在线地址：https://shenhai-dunang.pages.dev/

上述信息沿用仓库现有署名，不代表已经逐项核实每份素材的作者或权利归属。

## 许可范围

除另有标注或下述排除项外，本仓库中项目维护者有权许可的代码、文档和自有素材，采用 CC BY-NC 4.0（知识共享署名—非商业性使用 4.0 国际许可协议）。本次许可声明自包含该声明的仓库版本起提供，不代替对历史版本授权状态的核实。

- [官方中文概要](https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans)
- [官方法律文本](https://creativecommons.org/licenses/by-nc/4.0/legalcode)
- [仓库内的完整法律文本](LICENSE)

在许可覆盖范围内，可以为非商业性目的复制、分享和改编。对外分享时，应保留已有署名和权利说明，给出项目来源及许可链接，说明是否做过修改。非商业性使用的具体含义及完整条件，以法律文本为准。

第三方作品、字体、商标、标识以及其他不属于许可人可授权范围的权利，不由本仓库统一授予。合理使用等法定例外仍按适用法律处理。需要超出 CC BY-NC 4.0 范围的使用时，应联系相关权利人另行取得授权。

## 署名示例

下面是可以随作品或仓库一起提供的署名格式，可按实际改动填写最后一项：

```text
基于《深海的嘟囔 · 角色活动求索》修改。
原项目署名：镜花_Mirror、彼岸花Channel（B 站）。
来源：https://github.com/lmy414/shenhai-dunang
许可：CC BY-NC 4.0，适用范围见原仓库 NOTICE.md。
许可链接：https://creativecommons.org/licenses/by-nc/4.0/
修改说明：（填写本次修改内容；未修改时写“未修改”）。
```

不要用原作者或相关品牌的名义暗示对改编版本的认可。已有素材若附带单独署名要求，应同时遵守。

## 当前素材登记状态

当前仓库没有逐项的素材来源、作者及授权证明记录。下表仅说明文件用途和待核实事项，**不能据此认定这些图片均可按 CC BY-NC 4.0 再分发**。其中属于第三方或尚未确认授权范围的部分，不纳入本次统一许可声明；维护者有权许可的自有素材按上文处理。

| 文件范围 | 代码或文件中可确认的用途 | 来源与授权记录 |
| --- | --- | --- |
| `assets/bg.jpg`、`assets/bg_blur.jpg` | 抽卡页原始 UI 合成图、切片来源与模糊背景 | 待维护者补充作者、来源及授权范围 |
| `assets/bg_weapon.jpg` | 武器池主界面背景 | 由维护者提供的背景图（与 `bg.jpg` 同源）用程序修改：重写标题、规则文字和徽章文字，左侧高亮框移到武器卡片；原图作者、来源及授权范围待维护者补充 |
| `assets/weapons/*.png` | 12 件武器的展示图，文件名对应 `WEAPON_DATA` 中的 key | 维护者 2026-10-16 提供的四张武器图（每张三件，白底），经程序抠图为透明背景并缩放至最长边 900 像素；作者、来源及授权范围待维护者补充 |
| `assets/chars/*.png` | 10 名角色的立绘，文件名对应 `CHARS` 中的 id | 待维护者逐项补充作者、来源及授权范围 |
| `assets/fishing/*` | 饭点活动的 5 张水下场景、渔网 3 态、网弹、发射器底座与炮管、3 种光泡、3 种鱼影、4 个操作按钮、装备栏框、7 个武器加成图标 | 维护者 2026-10-22 提供的“捕鱼场景”素材；经 `tools/prepare_fishing_assets.py` 去背（白底按底色转透明、黑底光泡按亮度转透明）、从拼图中切开、炮管旋转为炮口朝上、鱼影照片提取剪影后重绘为半透明深蓝色、场景缩放压缩为 JPG。原素材中“水上”和“水中光泡”（无色）未使用，“水下鱼影大鱼2”因轮廓无法可靠提取未使用。作者、来源及授权范围待维护者补充 |
| `assets/chars/daze-*.png`、`assets/chars/mini-*.png` | 2026-10-22 新增的 16 名角色立绘（“痴呆”系列 4 星 8 张、“小小肥鱼娘”系列 3 星 8 张），文件名对应 `CHARS` 中的 id | 维护者提供的 16 张 2 头身设定稿（含三视图、表情和细节），经程序取正面全身像并抠成透明背景、缩放至高度不超过 900 像素；作者、来源及授权范围待维护者补充 |
| `assets/icons/*.png` | 米饭、鲸币、鲸尾等界面图标 | 待维护者补充作者、来源及授权范围 |
| `assets/app.png` | 角色仓库入口与导航使用的角色头像 | 待维护者补充作者、来源及授权范围 |

### 2026-10-16：角色原图分层与背景清理

本次按维护者要求复用原图 UI。按钮、标题、活动卡片和资源栏均来自 `assets/bg.jpg`，没有另行设计一套按钮样式。角色立绘和图标继续使用仓库已有文件。

| 文件 | 来源与处理 | 作者、许可与使用范围 |
| --- | --- | --- |
| `assets/ui/title.png`、`title-tab-blank.png` | 原图标题框；按轮廓裁切透明通道，移除外围场景碎片；页签版清除固定文字，供 DOM 叠字 | 原图作者与许可仍待确认；裁切不扩大原图授权范围 |
| `assets/ui/activity-character.png`、`activity-rice.png`、`activity-whale.png`、`activity-weapon.png` | 原图四个活动卡片，裁切透明边角 | 同原图 |
| `assets/ui/activity-frame.png`、`capsule-frame.png`、`button-frame.png` | 原图卡片、说明框与六边形按钮；用原图无字纹理清理内文，供动态排字 | 同原图 |
| `assets/ui/pull-one.png`、`pull-ten.png` | 原图单抽、十连按钮，保留原文字和费用图标 | 同原图 |
| `assets/ui/resource-rice.png`、`resource-whale.png`、`resource-fill.png`、`close.png` | 原图货币栏、填字纹理和关闭按钮，裁切透明边缘 | 同原图 |
| `assets/ui/gacha-pity-fill.png` | 仅清除原图金色 350 字形，用相邻无字纸面补齐，叠加当前保底数量；原说明框和其他文字保持原样 | 同原图 |
| `assets/ui/ds-badge.png` | 原图 DS 铭牌，清理背景，五星装饰使用原有 `assets/icons/star.png` | 铭牌与星形图标的原始权利记录仍待确认 |
| `assets/bg_clean.png` | 以内置 `image_gen` 编辑 `assets/bg.jpg`，清除原 UI 遮挡并补绘背景；未使用外部参考图。实际输出 1672 × 941 | AI 辅助编辑，原图作者与许可仍待确认；本记录不新增独立许可或扩大授权范围 |

UI 裁切由本次项目 Agent 执行，坐标和处理步骤保存在 `tools/slice_ui.py`。脚本需要 Python 和 Pillow，仅在维护素材时运行，页面运行不依赖 Python。

背景清理使用内置图片编辑工具，参考文件为 `assets/bg.jpg`。实际提示词如下，生成结果经画面检查后保存为 `assets/bg_clean.png`：

```text
Use case: precise-object-edit. Edit target: the supplied original game screenshot. Create ONLY a clean background plate by removing every UI overlay: all Chinese text and numbers, all buttons, all white/gold title frames, all currency displays at the top right, the four activity cards down the left, the large title at upper left, the DS name and magnifier on the right, the three circular shortcut icons bottom left, and the two summon buttons bottom right. Reconstruct only the environment hidden behind those UI overlays. Preserve the EXACT original environment, composition, perspective, camera, architecture, servers, reflections, lighting, color palette and art style everywhere else. This is an extraction/restoration task, not a redesign. Preserve white ruined cathedral arches, water floor, central glowing distance, foliage, and the tall dark server rack on the right in the same positions. Full-bleed 16:9 background matching the input screenshot. No new design elements, no new scene, no lettering, no UI, no characters, no logo or watermark.
```

补绘保留原场景主题和主要构图，局部建筑与水面细节可能与原图不同。原始 `assets/bg.jpg` 保留，切片脚本始终读取原图。

### 2026-10-16：武器 UI 分层与独立仓库

沿用协作者对 `assets/bg_weapon.jpg` 和 12 件武器图的来源登记。原始文件保持不变，本次未新增生图或补绘场景。

| 文件 | 来源与处理 | 作者、许可与使用范围 |
| --- | --- | --- |
| `assets/ui/weapon/background.png`、`title.png`、`rules.png`、`activity-*.png`、`resource-*.png`、`close.png`、`badge.png`、`shortcut-*.png`、`pull-*.png` | 从 `assets/bg_weapon.jpg` 按原坐标拆分背景层及 15 个矩形图层，保留图层内原始像素；拼合与解码后的原图逐像素一致 | 原图作者、来源及许可仍待确认；拆分不扩大授权范围 |
| `assets/ui/weapon/pity-fill.png` | 仅清除金色 350 字形，以相邻无字纸面补齐，供 DOM 叠加当前保底数量 | 同武器 UI 原图 |
| `assets/ui/weapon/layers.json` | 原图尺寸、图层坐标与保底数字区域清单 | 本项目生成的坐标记录 |
| `assets/ui/resource-fill.png` | 将无字取样区域移离米饭图标边缘，修复仓库资源栏填字纹理中的图标残影 | 同角色 UI 原图 |

拆分步骤见 `tools/slice_weapon_ui.py`，运行时会验证全部 2,359,296 个像素的拼合结果。底部仓库入口直接使用原有 `assets/app.png` 和 `assets/icons/spoon.png`，未另行绘制按钮。`assets/bg_clean.png` 现由两个仓库使用，原背景清理记录继续保留。

当前音效由 `app.js` 中的 Web Audio 代码合成，仓库未包含独立音频文件。CSS 使用系统字体族，仓库未附带字体文件。

协作者新增或替换素材时，请在本文件中补充：

- 仓库内的准确路径或文件范围。
- 作者或权利人，以及公开来源链接；无法公开的授权证据应由维护者保存。
- 许可名称、版本、授权范围和必须保留的署名。
- 项目做过的裁切、重绘、压缩等修改。

来源、署名或授权条件不清楚时，先向维护者核实，再对外发布该素材。仅有下载链接或“AI 生成”的说明，不能代替对可用范围的确认。
