# WANG YUDI — Hero 设计约束

本文件记录用户已确定的设计规则。后续迭代必须遵守；修改视觉方向需依据用户的新反馈，不能自行扩展概念。

## 范围与参考

- 当前只制作首页 Hero 第六版，Desktop 100vh。目标尺寸：1440×900、1728×1117、1920×1080。移动端只做基本适配。
- 主要参考：`reference/home-reference.mp4`，原始来源为用户提供的 22.46 秒 MP4。取帧见 `reference/frames/`。
- 布局参考：`reference/info-layout-reference.jpg`，由用户提供的 HEIC 转换，三个红圈分别位于左上、右上和下方偏中。
- 已观察：近白底；密集半透明青色细线；独立蓝绿小圆珠；饱和蓝色伞、细伞骨、弯柄；闭伞呈窄锥状，开伞有扇形伞面及弧形下缘。珠子在伞附近向两侧散开。
- 视频中的多伞和旋转不纳入原型。第四版要求顶部固定、底端自由的轻量绳线模拟，以真实伞面接触、重力、长度约束和惯性产生拨帘。禁止再通过大范围位移场、预设曲线或上下镜像开口控制形状。
- 视频仅用于线帘、珠子、伞及互动的视觉与运动参考。Personal Information、Navigation、Droplet Cursor 与信息结构属于用户原创设计，不能从视频推导文字排版或文字遮挡规则。

## 视觉语言

- bright / clean / airy / spatial / digital / slightly surreal。
- 明亮近白背景，通过细线、珠子大小、透明度、运动及前后层次建立空间。
- 禁止黑底、阴雨深灰底、乌云、闪电、写实雨水、写实雨伞、水面、水坑、城市场景、强阴影、emoji、真实雨声或任何自动播放音频。
- 不引入新视觉主题；不添加卡片、面板或装饰性连接线。

## 两个独立视觉系统

### Line Curtain
- 大量极细青色／蓝绿色悬挂线；既有密度、线色、线宽、透明度不变，不附着圆点或珠子。
- 每条线由 17 个模拟节点构成；只有顶部 anchor 固定在原始 x、y=0。底部绝不固定。
- 主要线长 80–110vh，18% 为 60–80vh 的短线；不全部贯穿屏幕。
- 使用 Verlet / PBD，保留前后帧位置，通过向下重力、阻尼与相邻距离约束模拟自由悬挂。不得以 x 插值回 baseX。
- 伞上方由顶部锚点形成张力曲线；下方继续自由垂落、拖曳。移动后有克制惯性，离开后逐渐恢复，不能立刻重绘成最终曲线。
- OPEN 伞使用实际 canopy 几何的多边形近似进行碰撞；只推开真正接触的节点和线段。聚拢来自碰撞约束，不规定每侧线束数量。
- 伞面速度可少量传给接触节点；碰撞的位置修正与真实速度分离，限制意外动能。
- 所有视觉上属于 Curtain 的线都必须可与 OPEN canopy 接触；禁止永久碰撞豁免、静态装饰线或用随机摆动伪装互动。未接触时保持安静。
- 重力、阻尼和刚度保留约 ±8% 个体差异；禁止风场、随机波浪、长期大幅摇摆。
- CLOSED、UI 悬停、伞不可见时取消碰撞，绳线继续自然恢复。
- 不使用 interaction radius、vertical falloff、max displacement、edge accumulation 等旧参数作为变形模型；不引入重型物理引擎。

### Bead Rain
- 独立粒子系统，不沿线条定位。
- 蓝、青、蓝绿圆珠，略透明、微高光，大小与速度有差异，持续向下循环。
- 不使用细长写实雨滴；不做液体模拟。
- 第三版在第二版基础上数量 ×1.25，基础竖直下落速度严格 ×2。横漂、沿伞面滑行和边缘释放冲量保持不变；速度不能因穿透问题而降低，必须使用前后位置进行连续穿越检测。
- 文字附近不清空粒子、不降低透明度形成干净空区。文字真实处于珠子后方，以全局透明度、字号、字色控制可读性。

## 鼠标与伞

- 首页中隐藏桌面系统箭头，用一颗略易识别、不过大的圆珠光标替代。
- 光标与鼠标坐标一致，伞同步跟随；不旋转、不摇摆、不漂浮、不使用惯性或视差偏移。
- 只有一把原创 SVG 蓝色伞；初始 CLOSED；普通区域点击循环 CLOSED ↔ OPEN。
- 开合动画 0.4–0.7 秒（当前 550ms），不夸张。伞顶尖端位于光标下方固定的小距离；这属于伞自身几何，不是动态偏移。
- OPEN 时珠子不能穿越伞面；从伞顶向两侧滑动、在边缘释放继续下降。CLOSED 时正常下落。
- 进入任何可点击 UI，伞快速淡出而圆珠光标保留；离开后恢复。隐藏伞暂停碰撞。
- 点击 UI 不允许触发伞开合；开合状态在 UI 悬停前后保留。

## 分散信息布局（第六版，2026-09-24）

全部文案集中在 src/config/hero.ts 的 heroInfo 对象，不散落到组件。

| 信息块 | 内容 | 桌面位置 |
|---|---|---|
| Identity | 王雨迪 / PORTFOLIO 2026 | left 12.5vw，top 41vh |
| Education | 浙江传媒学院 · 播音与主持艺术；南安普顿大学 / University of Southampton · 数字媒体硕士 | right 10.5vw，top 59vh |
| Practice | XR · 空间媒体 · 交互叙事；Interactive & Immersive Experience Design | left 51vw，top 24vh |

- 三块左对齐，姓名为最高权重，方向为第二权重，教育为第三权重；不用标题 EDUCATION，不用卡片。
- 教育只有两行；硕士行使用 inline span，英文保持同字号，仅 opacity 0.85，不单独换行。斜线表示学校中英文对应，中点分隔学校和专业。
- 姓名 clamp(38px,3vw,54px) / 500；方向 clamp(20px,1.7vw,28px) / 500；教育 clamp(15px,1.2vw,20px) / 400。
- Portfolio 为 clamp(13px,1vw,17px)，400，0.16em 字距；方向英文 clamp(12px,1vw,16px)，400，0.09em 字距。
- 主信息字体 Arial / PingFang SC / Microsoft YaHei / sans-serif，不使用装饰性中文字体。
- 删除旧个人信息占位，包括 SELECTED WORKS；仅保留三个个人信息 section。
- SCROLL TO EXPLORE ↓ 独立为底部可点击提示：left 50%，translateX(-50%)，bottom 30px，clamp(12px,.9vw,14px)，400，0.18em 字距，opacity 0.7。使用原生 button，没有按钮背景、边框或下划线，不计作第四块个人信息。hover 仅 opacity 0.7 → 1，保留键盘焦点轮廓。
- 本轮不改变 text-depth / spatial-depth、z-index、整体文字 opacity=0.9、遮挡、粒子重叠逻辑。不加 blur、mask、glow 或其他新效果。
- 仅内容、排版、字体层级和位置变动。以后深度实验应在用户确认并自行保存 checkpoint 后另行进行。
- Mobile 基本适配：Identity left 8vw / top 41vh；Education left 12vw / right 8vw / top 62vh；Practice left 18vw / top 23vh。长教育行仍可水平浏览，导航断点不变。

## 导航与图层

- 右上角 WORK / ABOUT / CONTACT；无导航背景、黑条、边框、大按钮或 Desktop hamburger。
- 视觉层一律 `pointer-events: none`；导航可正常点击。
- 实际图层：背景 → 个人信息（1）→ 线帘（2）→ 珠子两层（3/4）→ 伞（5）→ 圆珠光标（9）→ 导航（10）。短暂占位提示为 11。
- 三个信息块与底部提示保持信息层后景；导航位置、字体和交互不变。
- 圆珠光标不接收事件；伞面上的珠子中心位于伞表面外一个半径，因此伞在珠子之上时仍可看见沿伞面滑动的珠子。

## 技术与性能

- Next.js App Router + React + TypeScript + 普通 CSS。
- 线帘独立 Canvas 2D，Float64Array 保存节点及前后位置，Uint8Array 标记接触。共享 rAF 驱动小时间步模拟，碰撞仅对接近伞面的线段做精确检测。
- 珠子两个 Canvas 2D 共享一个粒子系统，均位于文字前方。
- 单一 requestAnimationFrame 时钟驱动线帘、珠子与伞形状，无每帧 React state 更新。
- 珠子高光预渲染为小型 sprites；设备像素比上限 2；数量按面积缩放且设上限；后台暂停；卸载时清理监听器与动画。
- reduced-motion 时暂停自动珠子运动、即时开合；触屏保留点按开合，禁用自定义鼠标。
- 不使用 Three.js、WebGL、复杂物理引擎、大型动画库。
- 背景、线色／密度、珠子数量／大小／速度／颜色、伞比例／开合时长、光标尺寸、文字位置均集中于 `src/config/hero.ts`。

## 本次禁止扩展

不开发 Projects 列表、详情页、About 内容、Contact 内容、Footer、dark mode 或新场景。第六版允许 Hero 后添加同背景色的空白 100svh section#work，只用于验证滚动并作为未来 Projects 位置；不得填入作品或装饰。仅本地运行，等待用户查看与反馈后继续。

## 第四版参数基线（2026-09-24）

- 1440px 宽保持 240 根线；线宽 0.45–0.8px，透明度 0.18–0.40。
- segmentsPerStrand=16，即每线 17 个节点；gravity=2400px/s²，damping=0.96（每 1/60 秒速度保留比例）。
- constraintIterations=6／子步，segmentStiffness=0.98，individualVariation=0.08；刚度上限 1。
- minLength=0.8 / maxLength=1.1；shortLineRatio=0.18，短线为 0.6–0.8 倍视口高度。
- umbrellaCollisionPadding=2px，umbrellaDragTransfer=0.16，collisionPushStrength=1，contactFriction=0.12。
- canopySegments=12，collisionSampleSpacing=8px；maxStep=0.01s，maxMotionSubsteps=12；maxDragSpeed=1600px/s，maxPointSpeed=280px/s。
- 第五版删除 foregroundStrandRatio / inCanopyPlane；全体 strands 使用原有碰撞。其余绳线参数保持第四版。
- 珠子参数完整保留第三版：基准 525，速度 184–380px/s；伞视觉、珠子碰撞、导航、文字、光标和图层不变。
- 不再保留旧位移场、预设开口曲线、纵向衰减、固定目标位移或 edgeAccumulationStrength。
- 所有 Curtain 参数在 src/config/hero.ts；物理求解在 src/lib/curtain.ts。

## 第六版滚动交互约束

- SCROLL TO EXPLORE ↓ 使用 button，aria-controls=work；点击通过 scrollIntoView({behavior:"smooth",block:"start"}) 进入下一屏。
- 显式 stopPropagation，并沿用 Hero 的 clickable 检测，保证不触发伞开合。
- Hover / focus 与 Navigation 共用现有逻辑：伞淡出、圆珠光标保留，离开恢复；无系统箭头切换。
- 不锁滚动、不拦截 wheel、不使用 snap；鼠标滚轮／触控板自然进入下一屏。
- 三角构图为上方偏中 XR、左侧 Identity、右侧更低 Education；字体、字号、字重和 text-depth 全部保持第五版。
