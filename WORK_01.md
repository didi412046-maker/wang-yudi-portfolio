# Work 01 — 沉浸与交互

本轮仅包含 Category Intro、两个项目媒体段落和最简详情路由占位。
分支：`feature/work-01`。首页母版 tag：`v0.6-homepage-approved`，未移动。

## 参考用途

- `reference/work-scroll-reference.mov`：大型媒体平面、随中心距离连续明暗与缩放、媒体内文字。
- `reference/rain-motion-reference.mp4`：停止浏览时环境进入慢动作，保留持续运动。
- `reference/category-intro-reference.mov`：克制的标题渐入与轻微上移。

三个录屏已逐帧查看，只参考运动与布局机制，未使用参考网站的品牌或项目素材。

## 文件与配置

- `src/config/work.ts`：Category 文案、两个项目数据、媒体尺寸、渐入、滚动和雨速参数。
- `src/components/Portfolio.tsx`：共享场景、固定 Navigation、Droplet Cursor、Home 与 Work。
- `src/components/work/Work.tsx`：Intro、两个 Project Sections、视频播放互斥、滚动状态。
- `src/lib/work-motion.ts`：中心距离、连续视觉映射、雨速目标与焦点选择。
- `src/app/work.css`：Work 排版、媒体覆盖文字、响应式与 reduced-motion 样式。
- `public/media/project-01/02.mp4` 与对应 `.jpg`：本地生成的蓝青色临时媒体，6 秒、24fps、960×540。不是用户的真实项目素材。
- `src/app/work/[slug]/page.tsx`：只有“项目详情即将开放”和返回入口，没有详情内容。

替换真实作品时修改 `projects` 中的 title、category、year、shortDescription、videoSrc、posterSrc、slug。

## 运动规则

Category Heading 现在与项目流处在同一组，不再独占 viewport：标题宽度与媒体相同，顶部留白为 `clamp(64px, 8vh, 96px)`，标题与 Project 01 的间距为 `clamp(30px, 3.5vh, 48px)`。标题使用真实 scroll progress：标题 top 从 88vh 到 56vh 时，opacity、`translateY(36px → 0)` 和 `blur(8px → 0)` 连续变化；编号提前 .05，英文延后 .06，不使用一次性 CSS 播放。

项目按自然内容流排列，媒体宽度为 84vw、最大宽 1500px，`aspect-ratio: 1.85 / 1`，最大高度 76svh，圆角 32px。两个媒体之间的间距为 `clamp(42px, 5vh, 68px)`，不再使用 `min-height: 100svh`。
`progress = max(0, 1 - abs(mediaCenter - viewportCenter) / (viewportHeight * .85))`。
进度连续映射 scale .95 → 1、brightness .42 → 1、opacity .72 → 1。
媒体底层不透明，环境 Beads 不会穿透视频。文字区域只有局部渐变。

wheel / touchmove / scroll 立即暂停全部视频。最后一次滚动 300ms 后，距离视口中心最近且距离小于 .42 屏高的项目播放。
任意时刻最多播放一个视频；播放失败可使用小型播放入口。重新滚动不重置播放时间。

BeadRain 只实例化一次，并固定在视口，Home / Work 滚动不会触发 resize 或粒子重建。
Home 时间倍率始终为 1。Work 滚动时目标 1；停止 160ms 后，550ms 平滑降至 .12；重新滚动后 200ms 恢复 1。
只使用“距上次滚动经过多久”，完全不读取 scroll delta / wheel velocity 来计算粒子速度。
雨速通过积分时间倍率改变，粒子位置、深度、原始速度配置与数量配置持续保留。

Home 原有 Curtain rope、碰撞函数、文字配置未修改。BeadRain 提升至父组件，保持原来的同 z-index 绘制先后顺序。
Work 外层 z-index 6 位于全部环境 Beads 上方；Navigation 和 Cursor 沿用原 Functional UI 层并固定在视口。

Cursor 默认仍是首页的小水滴。指针进入 `.project-link` 时，同一元素切换 `data-mode="project"`，CSS 将它过渡为 76px 的半透明 cyan / blue Water Lens，并显示两行 `VIEW / PROJECT`。Lens Canvas 只在 hover 时运行，按 video 的 `object-fit: cover` 裁剪映射指针下方 source frame，以 1.055× 局部放大；CSS 提供轻微液态 rim、内高光、体积阴影和透明滤镜。不复制视频，也不拦截 pointer events；离开项目恢复默认水滴。导航和页面背景不会触发该状态。

Reduced motion：关闭滚动缩放/明暗和 Intro 动画，禁用自动播放，保留手动播放与链接。环境粒子沿用首页已有 reduced-motion 行为。

## 验证记录

- TypeScript、17 项测试和 Next production build 通过。
- 1440×900、1728×1117、1920×1080：媒体保持 1.85:1，窗口宽度受 84vw / 1500px 控制，无横向溢出；间距保持在配置范围内。
- 浏览器共享帧循环采样约 60fps，P95 JavaScript render 约 3.6–3.8ms；这不是完整 GPU 性能保证。
- 实际滚动：两个视频立即暂停，停驻只播放一个；手动暂停有效；Work idle 倍率 .12，返回 Home 为 1。
- 首页普通点击仍开合雨伞；Scroll Hint 不切换开合状态，正常进入 Work；原 rope / bead collision 测试全部通过。
- 390×844 基础移动布局检查通过。没有制作专用移动端交互。

未开发 Category 02 / 03、Footer 或正式详情页；没有 merge 或移动 stable tag。
