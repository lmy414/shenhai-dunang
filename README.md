# 深海的嘟囔 · 角色活动求索

「蓝色大肥鱼」系列的 AI 拟人角色抽卡网页小游戏。玩家通过单次或十连“求索”收集角色，体验深海主题的抽卡演出、角色揭晓和结果展示。

项目使用原生 HTML、CSS 和 JavaScript，采用 Canvas 绘制特效、Web Audio 合成音效。页面可直接在浏览器运行，进度保存在本机浏览器中，适合协作者从页面、角色资料和素材开始参与维护。

- [在线游玩](https://shenhai-dunang.pages.dev/)
- [入口地址](https://deepseekchan.com/)
- [蓝色大肥鱼主站](https://蓝色大肥鱼.com/)
- [版本与更新日志](CHANGELOG.md)
- [用 AI 维护项目](docs/AI协作维护教程.md)
- [Agent 协作指引](AGENTS.md)

## 当前玩法

- 支持单抽、十连、跳过演出、再次求索、卡池详情和角色预览。
- 角色按 3 星、4 星和 5 星分组，当前 5 星 UP 角色为 DS娘。
- DS娘的单次出金概率从 0.1% 起递增，至多 350 抽获得；获得后重新计数。
- 连续 10 抽内至少获得 1 名 4 星或以上角色。
- 每抽消耗 1 枚鲸币，160 米饭可兑换 1 枚鲸币。
- 可查看最近 500 条求索记录，切换音效或重置存档。

食堂中的“充值”是模拟支付，不会真实扣费。饭点活动、摸鱼活动和武器活动入口目前只显示筹备提示。

| 星级 | 当前角色 |
| --- | --- |
| 5 星 | DS娘 |
| 4 星 | Claude娘、GPT娘、Gemini娘、Grok娘和千问娘 |
| 3 星 | Kimi娘、Mistral娘、智谱娘和豆包娘 |

存档使用 `localStorage`，存储键为 `ww-gacha-ds-v1`。更换浏览器、访问地址或清除站点数据后，原存档可能无法继续使用。项目目前没有账号系统、云存档或后端服务。

## 本地运行

```bash
git clone https://github.com/lmy414/shenhai-dunang.git
cd shenhai-dunang
```

快速查看可以直接打开 `index.html`。日常开发建议通过本地 HTTP 服务访问，保持固定的地址和端口，便于检查资源加载与存档。

已安装 Node.js 和 npm 时，在项目根目录运行：

```bash
npx --yes serve . --listen 3000
```

打开终端显示的地址，通常是 `http://localhost:3000`。当前项目没有 `package.json`，无需安装项目依赖，也没有 `npm run build` 命令。

## 目录与修改入口

```text
.
├── index.html                  页面结构、按钮热区和弹窗容器
├── style.css                   页面样式、舞台缩放和 CSS 动画
├── app.js                      角色数据、抽卡规则、存档、音效和演出
├── assets/
│   ├── bg.jpg                  主界面背景
│   ├── bg_blur.jpg             模糊背景
│   ├── app.png                 图片素材
│   ├── chars/                  角色立绘，文件名对应角色 id
│   └── icons/                  界面图标
├── .github/workflows/
│   └── deploy-pages.yml        正式 Release 自动部署
├── docs/AI协作维护教程.md       面向协作者的 AI 操作教程
├── CHANGELOG.md                用户可见变更与发布记录
├── AGENTS.md                   Agent 工作约定与检查要求
├── NOTICE.md                   署名、许可范围和素材登记说明
└── LICENSE                     CC BY-NC 4.0 官方协议全文
```

| 想修改的内容 | 从哪里开始 |
| --- | --- |
| 角色名称、台词、星级 | `app.js` 中的 `CHARS` |
| 抽卡概率、保底和兑换比例 | `app.js` 中的 `RATE5_*`、`RATE4`、`PITY5`、`PITY4` 和 `RICE_PER_WHALE` |
| 立绘和图标 | `assets/chars/` 和 `assets/icons/`，同时核对代码引用与素材许可 |
| 按钮位置、页面结构 | `index.html` 中的 `data-act` 和坐标属性 |
| 视觉样式和演出 | `style.css`、`app.js` 中的 `FX` 和 `SFX` |
| 版本发布 | `.github/workflows/deploy-pages.yml` 和 `CHANGELOG.md` |

舞台使用 2000 × 1125 的坐标系，按 16∶9 缩放。调整背景或按钮热区时，需要一起检查两者是否对应。

## 协作流程

1. 开工前同步 `main`，查看已有 Issue 和正在进行的修改。
2. 为一个明确的问题创建分支，一次提交围绕一个主题。
3. 修改前确认涉及的规则、界面和素材。新增素材时登记来源、作者及授权条件，见 [NOTICE.md](NOTICE.md)。
4. 本地预览并完成与改动相关的检查，将用户可见变更记入 [CHANGELOG.md](CHANGELOG.md) 的“未发布”部分。
5. 提交并推送分支，创建 PR，写明修改内容、验证方式和需要注意的问题。由维护者审阅后合并。

提交说明可使用 `feat:`、`fix:`、`docs:` 或 `ci:` 前缀，后接具体改动。请保留现有署名，避免把本地存档、凭据、缓存或生成目录提交到仓库。

### 提交前检查

当前没有自动化测试套件。修改 `app.js` 后，先执行：

```bash
node --check app.js
```

根据修改范围检查以下行为，并在 PR 中写清实际完成的项目：

- 页面、背景、角色立绘和图标正常加载，浏览器控制台没有新增错误。
- 单抽、十连、跳过、结果确认和再次求索可正常结束。
- 鲸币扣减、米饭兑换、模拟支付、保底计数和概率显示符合代码规则。
- 刷新后可读取存档；需要检查重置时，使用独立浏览器配置或测试存档。
- 修改布局或演出时，检查桌面宽屏和手机窄屏，确认按钮热区与显示位置对应。
- 只改文档时，检查相对链接、命令和发布说明是否与仓库一致。

## 版本发布

生产站点为 Cloudflare Pages 项目 `shenhai-dunang`。现有工作流仅在**发布正式 GitHub Release** 时部署，普通代码推送、仅推送标签和保存 Release 草稿都不会触发该工作流；预发布版本会跳过部署任务。

1. 合并准备发布的修改，确认本地检查通过。
2. 将“未发布”记录整理到新的版本号和日期下，再提交、推送到 `main`。
3. 在 [GitHub Releases](https://github.com/lmy414/shenhai-dunang/releases) 创建版本，使用指向待发布提交的标签，例如 `v1.3.0`，填写更新说明并发布为正式版本。
4. 在 [GitHub Actions](https://github.com/lmy414/shenhai-dunang/actions/workflows/deploy-pages.yml) 查看执行结果。工作流会检出标签代码、检查 JS 和素材、整理 `dist/`、部署并检查访问状态。
5. 上线后再打开生产地址，核对本次修改的实际页面效果。工作流成功只代表其中的自动检查通过。

部署使用仓库 Secrets 中的 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`，凭据由维护者管理。失败后先查看日志，临时故障可在对应运行记录中重试失败任务；代码问题应修复并发布新版本，避免移动已经发布的标签。

当前的 `Build dist/` 步骤只复制静态文件。以后需要编译或资源处理时，在此处接入构建命令，并继续将结果输出到 `dist/`，复用后续部署流程。

## 制作者与许可

- B 站：镜花_Mirror
- B 站：彼岸花Channel
- 仓库维护入口：[lmy414/shenhai-dunang](https://github.com/lmy414/shenhai-dunang)

项目中维护者有权许可的代码、文档和自有素材，采用 **CC BY-NC 4.0（知识共享署名—非商业性使用 4.0 国际许可协议）**。分享或改编时需合理署名、附上许可链接、说明修改，并遵守非商业性使用条件。

完整条款见 [LICENSE](LICENSE)，适用范围、署名示例和素材登记要求见 [NOTICE.md](NOTICE.md)。第三方素材及商标等权利以各自授权为准；当前尚未逐项确认的素材，不因收录于仓库而获得新的授权。
