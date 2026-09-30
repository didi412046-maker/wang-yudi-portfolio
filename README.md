# WANG YUDI — Portfolio Hero prototype

首页第六版（三角构图与平滑滚动）：明亮细线帘、独立蓝绿圆珠、一把跟随鼠标并能通过绳线接触拨帘、分流圆珠的蓝伞，以及三个分散信息块。只实现 `/`；导航目前显示简短占位提示。

## 启动

Node.js 22.6+，pnpm。依赖版本固定，保留 `pnpm-lock.yaml`。

```sh
pnpm install
pnpm dev
```

访问 http://127.0.0.1:3000 。鼠标移动控制伞，点击普通区域开合；悬停导航时伞淡出，圆珠光标保留。

此电脑当前使用 Codex 自带的 Node。如终端提示找不到 node，先执行：

```sh
export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH"
```

生产检查与运行：

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

`dev` 与 `start` 默认都使用 3000 端口，不要同时启动。生产版本可按标准 Next.js Node 部署流程部署；本轮未发布到公网。

## 文件与组件

```text
src/
  app/
    page.tsx                 首页入口
    layout.tsx               metadata、HTML 外壳
    globals.css              排版、响应式、图层、光标样式
    icon.svg                 圆珠 favicon
  components/hero/
    Hero.tsx                 组合组件、pointer/click 事件、占位导航反馈
    LineCurtain.tsx          局部弯曲、随伞拨开的线帘 Canvas
    BeadRain.tsx             圆珠粒子模拟及前后两个 Canvas
    Umbrella.tsx             一把 SVG 伞及开合形状插值
    DropletCursor.tsx        跟手圆珠光标
    HeroInfo.tsx             数据驱动的三个信息块
    Navigation.tsx           WORK / ABOUT / CONTACT
  config/hero.ts             视觉参数、文字内容、百分比位置
  hooks/useHeroScene.ts      唯一动画时钟、后台暂停、reduced-motion
  lib/scene.ts               共享伞面曲线、圆珠运动和碰撞
  lib/curtain.ts             Verlet / PBD 悬挂绳线、伞面碰撞与惯性
tests/collision.test.ts      六项碰撞及高速穿越测试
tests/curtain.test.ts        八项绳线测试，含全部 240 个渲染 seed 的接触回归
reference/
  home-reference.mp4        用户提供的原始参考视频副本
  info-layout-reference.jpg 用户 HEIC 转换的标注图
  frames/                   12 个关键帧及联系表，仅用于参考
DESIGN.md                   已确定的设计约束
VERIFICATION.md             本轮检查记录
package.json / pnpm-lock.yaml
tsconfig.json / next-env.d.ts / next.config.ts
AGENTS.md / CLAUDE.md        Next.js 自动生成的后续开发指引
```

参考文件位于 `reference/`，不会作为网站公共资源加载。无需依赖视频播放，整个视觉场景由浏览器实时绘制。

## 视觉系统

**Line Curtain**：旧位移场与目标曲线已完全移除。每条线 17 个模拟节点（16 段），只固定第 0 个节点；底端自由。Verlet 积分保留前后位置，重力向下、阻尼消耗动能；每子步 6 轮 PBD 相邻长度约束。形状直接来自节点坐标，没有 baseX 回位插值、纵向包络或预设开口形状。

碰撞体采用与 SVG 共用的 canopyY 曲线，采样 12 段上缘，以伞底沿弦闭合成凸多边形（简化 scallop 下缘）。仅实际穿入 2px 膨胀轮廓的点／线段采样受到接触修正。修正按节点权重分配，伞边聚拢来自接触和绳长约束；所有可见线都参与同一套接触求解，不再存在永久碰撞豁免。伞移动速度的一小部分进入接触节点的 Verlet 历史；碰撞的位置修正不直接变成冲量，节点速度上限 280px/s，避免快速移动时甩线过大。

采用不超过 10ms 的子步；快速移动时按实际伞宽增加扫掠子步，最多 12 步。Typed arrays、共享 rAF、逐线段 AABB 剔除；不引入物理库、不在每帧更新 React state。reduced-motion 下线帘保持静止。

**Bead Rain**：按视口面积决定圆珠数量，独立随机横坐标。缓存每种颜色的高光小图，再用 `drawImage` 绘制；大小、速度、透明度各有差异。两层均在信息文字前方、伞后方，共享一个模拟，无 DOM 粒子和每帧 React 重渲染。第三版数量为第二版 ×1.25，基础竖直下落速度严格 ×2；横漂仍为 ±7px/s，沿伞面滑行与边缘释放冲量保持第二版数值。后台暂停，DPR 上限为 2。

**碰撞**：SVG 伞面的二次曲线与 `canopyY` 完全一致。以粒子前后位置相对伞前后位置判断穿越，同时处理移动伞面内的珠子。命中后进入 `slide` 状态，沿伞面左右滑行，到边缘进入 `released`，带少量水平速度继续下落。收伞或 UI 隐藏时解除碰撞。这是视觉近似，不是液体模拟。

**文字深度**：信息层 z=1，线帘 z=2，珠子 z=3/4，伞 z=5，光标 z=9，导航 z=10。文字附近原有的透明度避让已经移除，线与珠子实际从文字前方绘制；本轮只修改内容和排版，信息层 z=1、整体透明度 0.9 及粒子覆盖方式不变。

**跟手**：原生 pointer 坐标直接更新伞和光标的 CSS transform；无位置缓动。只有伞面的开合进度使用 550ms 插值，透明度用 140ms 过渡。

## 常用修改入口

统一编辑 `src/config/hero.ts`：

| 想调整 | 配置 |
|---|---|
| 背景与文字颜色 | `visual.background / text.colour / text.mutedColour` |
| 线帘颜色、密度、粗细、长短 | `visual.curtain.lineCount / lineColor / lineWidth / lineOpacity` |
| 珠子数量、大小、速度、颜色与透明度 | `visual.beads` |
| 绳线柔软程度 | curtain.segmentStiffness / segmentsPerStrand / constraintIterations |
| 惯性与恢复 | curtain.gravity / damping（每 1/60 秒速度保留比例） |
| 伞拖曳力度 | curtain.umbrellaDragTransfer / maxDragSpeed / maxPointSpeed |
| 线长 | curtain.minLength / maxLength / shortMinLength / shortMaxLength / shortLineRatio |
| 接触轮廓与求解 | curtain.umbrellaCollisionPadding / collisionPushStrength / contactFriction |
| 物理属性的个体差异 | curtain.individualVariation |
| 文字深度与可读性 | `text.opacity / colour / fontWeight / fontSize`，保持 `layers.information=1` |
| 分流速度、边缘释放速度 | `beads.slideSpeed / edgeKick / edgeReleaseSpeed / gravity` |
| 伞颜色、比例、初始位置、开合时长 | `visual.umbrella` |
| 光标大小与颜色 | `visual.cursor` |
| 三个信息块、底部提示的文字和位置 | `heroInfo`；位置使用 vw / vh |
| 导航文字与占位提示 | `navigation / prototypeMessages` |

字号和层级同样从配置注入 CSS 变量；布局规则与断点位于 `src/app/globals.css`。修改前先看 `DESIGN.md`。

下一轮等待实际视觉反馈，不自行添加 Projects、About、Contact 或 Footer。

## 当前参数与性能诊断

- `beads.count=525` 是 1440×900 基准值（原 420），按面积缩放：1728×1117 为 782，1920×1080 为 840；`maxCount=900`。
- `beads.minSpeed=184 / maxSpeed=380`（原 92 / 190），单位 CSS px/s；`minSize / maxSize` 是直径。
- 绳线 gravity=2400 CSS px/s²，damping=0.96，segmentStiffness=0.98，constraintIterations=6。常规线长 80–110vh，18% 短线为 60–80vh。重力、阻尼损耗与刚度有约 ±8% 个体差异。原 displacement / falloff / accumulation 配置已删除。
- `umbrella.collisionRadius` 是珠子半径的碰撞边缘容差倍率；`collisionStrength` 控制滑行及边缘释放力度，不改变可见伞面轮廓。
- 开发模式每 120 帧把真实帧率、P95 帧间隔、P95 动画回调耗时写入 `.hero[data-performance]`；计时包含线帘与珠子绘制调用，不包含 GPU 合成。生产模式不采集。
- `.line-curtain` 上可读 `data-line-count / data-displacement / data-contact`；contact 记录伞坐标、接触线数、自由端最大横向偏移与当前子步数；data-points-per-strand 记录节点数。`.beads-rear` 可读粒子数量及累计碰撞次数。

## 当前内容与排版

所有文案在 src/config/hero.ts 的 heroInfo 对象中。HeroInfo 渲染三个 section，底部提示独立为 button，不计作第四个个人信息块，连接首页同一文档内的空白 section#work。

- Identity：王雨迪 / PORTFOLIO 2026；left 12.5vw、top 41vh。
- Education：right 10.5vw、top 59vh；两行文本。硕士行用三个 inline span 保持一行，英文 span 同字号、opacity=0.85。
- Practice：XR · 空间媒体 · 交互叙事 / Interactive & Immersive Experience Design；left 51vw、top 24vh。
- SCROLL TO EXPLORE ↓：left 50%，translateX(-50%)，bottom 30px；opacity=0.7。
- 信息字体为 Arial / PingFang SC / Microsoft YaHei / sans-serif；姓名与方向主行 500，其余 400。Portfolio 小字保留系统等宽字体。
- 所有 z-index 与 text-depth 逻辑保持上一版。下一轮深度实验须由用户另行启动。

此前直线不互动的原因是 inCanopyPlane / foregroundStrandRatio 对约 8% 线条永久跳过碰撞。已移除此条件和配置；绘制组件、物理方程及其余参数不变。

## 滚动入口

HeroInfo.tsx 的原生 button 调用 work.scrollIntoView({ behavior: "smooth", block: "start" })，并 stopPropagation。Hero 的原有 button / a 检测负责淡出伞、保留光标、避免开合误触。Enter / Space 由原生按钮支持。

page.tsx 中的 section#work 暂为空白一屏，沿用背景色，只作下一屏锚点，不含 Projects 内容。未添加 wheel 监听、滚动锁定或吸附。
